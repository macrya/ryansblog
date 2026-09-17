import { del } from '@vercel/blob';
import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import {
  timingSafeEqual,
  isValidId,
  isSafeVercelBlobUrl,
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
 * Validates an admin secret or HMAC token against the environment password.
 */
function verifyAdminAuthorization(secretOrToken: string | undefined): boolean {
  if (!secretOrToken || typeof secretOrToken !== 'string') {
    return false;
  }

  const expectedPassword = process.env.ADMIN_PASSWORD;
  if (!expectedPassword || expectedPassword.trim().length === 0) {
    return false;
  }

  // 1. Direct passcode constant-time comparison
  if (timingSafeEqual(secretOrToken.trim(), expectedPassword.trim())) {
    return true;
  }

  // 2. Check if it's an HMAC admin token issued by /api/verify-admin
  try {
    const decoded = JSON.parse(Buffer.from(secretOrToken, 'base64').toString('utf-8'));
    if (decoded.tokenData && decoded.tokenSignature) {
      const parts = decoded.tokenData.split(':');
      if (parts.length >= 2) {
        const expiry = parseInt(parts[1], 10);
        if (Date.now() <= expiry) {
          const expectedSig = crypto
            .createHmac('sha256', expectedPassword)
            .update(decoded.tokenData)
            .digest('hex');
          if (timingSafeEqual(decoded.tokenSignature, expectedSig)) {
            return true;
          }
        }
      }
    }
  } catch {
    // Not a valid base64 token
  }

  return false;
}

/**
 * Vercel Serverless Function: POST /api/delete-post
 *
 * Hardened endpoint for administrative deletion of blog entries and Vercel Blob assets:
 * - Constant-time authentication verification (no hardcoded fallback).
 * - Strict rate-limiting.
 * - Whitelisted SSRF-safe Vercel Blob URL verification.
 * - Sanitized request parsing and structured audit logging.
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

  // Rate limit: 20 operations per 5 minutes per IP
  const rateLimit = checkRateLimit(`delete:${clientIp}`, { windowMs: 5 * 60 * 1000, max: 20 });
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetTime / 1000)));

  if (!rateLimit.allowed) {
    logSecurityEvent({
      level: 'warn',
      action: 'DELETE_POST_RATE_LIMITED',
      requestId,
      ip: clientIp,
    });
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many deletion requests. Please wait a few minutes.',
    });
  }

  try {
    const body = await parseJsonBody<{
      postId?: string;
      adminSecret?: string;
      imageUrl?: string;
    }>(req, 64 * 1024); // 64KB max payload

    const { postId, adminSecret, imageUrl } = body;

    // 1. Authorization check — strictly required, zero unauthenticated bypass
    const authHeader = req.headers['authorization'];
    const bearerToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
    const effectiveSecret = adminSecret || bearerToken;

    if (!verifyAdminAuthorization(effectiveSecret)) {
      logSecurityEvent({
        level: 'warn',
        action: 'DELETE_POST_UNAUTHORIZED_ATTEMPT',
        requestId,
        ip: clientIp,
        details: { targetPostId: postId },
      });
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Unauthorized: Valid administrator credentials or token required.',
      });
    }

    // 2. Strict ID format validation
    if (!postId || !isValidId(postId)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_POST_ID',
        message: 'Validation failed: postId must be a valid alphanumeric string up to 128 characters.',
      });
    }

    // 3. Blob purge with SSRF protection
    let blobDeleted = false;
    if (imageUrl) {
      if (!isSafeVercelBlobUrl(imageUrl)) {
        logSecurityEvent({
          level: 'warn',
          action: 'DELETE_POST_UNSAFE_BLOB_URL_BLOCKED',
          requestId,
          ip: clientIp,
          details: { imageUrl },
        });
      } else {
        try {
          await del(imageUrl);
          blobDeleted = true;
          logSecurityEvent({
            level: 'info',
            action: 'VERCEL_BLOB_PURGED',
            requestId,
            ip: clientIp,
            details: { imageUrl, postId },
          });
        } catch (blobError: any) {
          logSecurityEvent({
            level: 'warn',
            action: 'VERCEL_BLOB_PURGE_ERROR',
            requestId,
            ip: clientIp,
            details: { error: blobError?.message },
          });
        }
      }
    }

    logSecurityEvent({
      level: 'info',
      action: 'POST_DELETE_AUTHORIZED',
      requestId,
      ip: clientIp,
      details: { postId, blobDeleted },
    });

    return res.status(200).json({
      success: true,
      message: blobDeleted
        ? 'Post deletion authorized and Vercel Blob asset purged successfully.'
        : 'Post deletion authorized successfully.',
      deletedPostId: postId,
      blobDeleted,
    });
  } catch (err: any) {
    logSecurityEvent({
      level: 'error',
      action: 'DELETE_POST_SYSTEM_ERROR',
      requestId,
      ip: clientIp,
      details: { error: err?.message },
    });
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected internal error occurred while processing the deletion.',
    });
  }
}
