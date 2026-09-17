import { list, del } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import {
  timingSafeEqual,
  checkRateLimit,
  getClientIp,
  parseJsonBody,
  logSecurityEvent,
} from './_utils/security';

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

/**
 * Vercel Serverless Function: POST /api/cleanup-orphaned-blobs
 *
 * Audit and optionally prune orphaned Vercel Blob assets that are no longer
 * referenced by any active blog post, diary entry, or user asset.
 *
 * Can be triggered via:
 * 1. Administrator request from CMS Admin Console.
 * 2. Periodic Vercel Cron job using `CRON_SECRET` authorization.
 */
export default async function handler(
  req: IncomingMessage,
  res: ExtendedResponse
) {
  const requestId = crypto.randomUUID();
  const clientIp = getClientIp(req);

  res.setHeader('X-Request-Id', requestId);
  res.setHeader('Content-Type', 'application/json');

  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({
      success: false,
      error: 'METHOD_NOT_ALLOWED',
      message: 'Method Not Allowed. Use POST.',
    });
  }

  // Rate limit: 10 cleanup operations per 10 minutes per IP
  const rateLimit = checkRateLimit(`blob_cleanup:${clientIp}`, { windowMs: 10 * 60 * 1000, max: 10 });
  if (!rateLimit.allowed) {
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many cleanup requests. Please wait a few minutes.',
    });
  }

  // Authorization check: either CRON_SECRET header or ADMIN_PASSWORD
  const authHeader = req.headers['authorization'];
  const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;

  const isCronAuthorized =
    Boolean(process.env.CRON_SECRET) &&
    Boolean(bearerToken) &&
    timingSafeEqual(bearerToken!, process.env.CRON_SECRET!);

  const isAdminPasswordAuthorized =
    Boolean(process.env.ADMIN_PASSWORD) &&
    Boolean(bearerToken) &&
    timingSafeEqual(bearerToken!, process.env.ADMIN_PASSWORD!);

  if (!isCronAuthorized && !isAdminPasswordAuthorized) {
    logSecurityEvent({
      level: 'warn',
      action: 'CLEANUP_ORPHAN_BLOBS_UNAUTHORIZED',
      requestId,
      ip: clientIp,
    });
    return res.status(401).json({
      success: false,
      error: 'UNAUTHORIZED',
      message: 'Unauthorized: CRON_SECRET or ADMIN_PASSWORD authorization required.',
    });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return res.status(500).json({
      success: false,
      error: 'BLOB_STORAGE_NOT_CONFIGURED',
      message: 'Vercel Blob storage is not configured (missing BLOB_READ_WRITE_TOKEN).',
    });
  }

  try {
    const body = await parseJsonBody<{
      activeImageUrls?: string[];
      dryRun?: boolean;
    }>(req, 128 * 1024);

    const activeUrls = new Set<string>(body.activeImageUrls || []);
    const dryRun = body.dryRun === true;

    // List all stored blobs in the Vercel Blob store
    const { blobs } = await list();

    const orphanedBlobs: Array<{ url: string; pathname: string; size: number }> = [];

    for (const blob of blobs) {
      // If the blob URL is not in the set of active image URLs, it is orphaned
      if (!activeUrls.has(blob.url)) {
        orphanedBlobs.push({
          url: blob.url,
          pathname: blob.pathname,
          size: blob.size,
        });
      }
    }

    let deletedCount = 0;
    if (!dryRun && orphanedBlobs.length > 0) {
      for (const orphan of orphanedBlobs) {
        try {
          await del(orphan.url);
          deletedCount++;
        } catch (delErr: any) {
          console.warn(`[Blob Cleanup] Could not delete ${orphan.url}:`, delErr?.message);
        }
      }
    }

    logSecurityEvent({
      level: 'info',
      action: 'CLEANUP_ORPHAN_BLOBS_SUCCESS',
      requestId,
      ip: clientIp,
      details: {
        totalBlobsScanned: blobs.length,
        orphanedCount: orphanedBlobs.length,
        deletedCount,
        dryRun,
      },
    });

    return res.status(200).json({
      success: true,
      totalBlobsScanned: blobs.length,
      orphanedCount: orphanedBlobs.length,
      deletedCount: dryRun ? 0 : deletedCount,
      dryRun,
      orphanedBlobs,
      message: dryRun
        ? `Dry run complete. Identified ${orphanedBlobs.length} orphaned blobs.`
        : `Successfully pruned ${deletedCount} orphaned blobs from Vercel storage.`,
    });
  } catch (err: any) {
    logSecurityEvent({
      level: 'error',
      action: 'CLEANUP_ORPHAN_BLOBS_ERROR',
      requestId,
      ip: clientIp,
      details: { error: err.message },
    });
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: err.message || 'Failed to scan and cleanup orphaned blobs.',
    });
  }
}
