import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import {
  checkRateLimit,
  getClientIp,
  parseJsonBody,
  logSecurityEvent,
} from './_utils/security';

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

const ALLOWED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.avif'];

function isSafePathname(pathname: string): boolean {
  if (!pathname || typeof pathname !== 'string') return false;
  if (pathname.length > 255) return false;
  // Prevent path traversal
  if (pathname.includes('..') || pathname.includes('\\') || pathname.includes('\0')) return false;
  // Ensure valid characters
  const clean = pathname.replace(/^\/+/, '');
  const lower = clean.toLowerCase();
  return ALLOWED_EXTENSIONS.some((ext) => lower.endsWith(ext));
}

/**
 * Vercel Serverless Function: POST /api/upload
 * Generates client upload tokens for direct-to-blob uploads from the browser.
 * Hardened with rate-limiting, pathname validation, and structured audit logs.
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

  // Rate limit: 25 upload token requests per 5 minutes per IP
  const rateLimit = checkRateLimit(`upload:${clientIp}`, { windowMs: 5 * 60 * 1000, max: 25 });
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetTime / 1000)));

  if (!rateLimit.allowed) {
    logSecurityEvent({
      level: 'warn',
      action: 'UPLOAD_RATE_LIMITED',
      requestId,
      ip: clientIp,
    });
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Upload rate limit exceeded. Please wait a few minutes before trying again.',
    });
  }

  try {
    const body = await parseJsonBody<HandleUploadBody>(req, 1024 * 1024);

    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async (pathname: string, clientPayload: string | null) => {
        if (!isSafePathname(pathname)) {
          throw new Error('Invalid upload filename or extension. Permitted: JPG, PNG, WEBP, GIF, AVIF.');
        }

        return {
          allowedContentTypes: [
            'image/jpeg',
            'image/png',
            'image/webp',
            'image/gif',
            'image/avif',
          ],
          maximumSizeInBytes: 15 * 1024 * 1024, // 15MB limit
          tokenPayload: JSON.stringify({
            owner: 'MarkRyan Creative CMS',
            path: pathname,
            clientPayload: clientPayload || null,
            authorizedAt: new Date().toISOString(),
            requestId,
          }),
        };
      },
      onUploadCompleted: async ({ blob }) => {
        logSecurityEvent({
          level: 'info',
          action: 'UPLOAD_COMPLETED',
          requestId,
          ip: clientIp,
          details: { url: blob.url, pathname: blob.pathname },
        });
      },
    });

    return res.status(200).json(jsonResponse);
  } catch (error: any) {
    logSecurityEvent({
      level: 'error',
      action: 'UPLOAD_TOKEN_ERROR',
      requestId,
      ip: clientIp,
      details: { error: error?.message },
    });
    return res.status(400).json({
      success: false,
      error: 'UPLOAD_PROCESSING_ERROR',
      message: error?.message || 'Failed to process blob upload token.',
    });
  }
}
