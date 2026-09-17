import type { IncomingMessage, ServerResponse } from 'node:http';
import crypto from 'node:crypto';
import {
  timingSafeEqual,
  checkRateLimit,
  getClientIp,
  parseJsonBody,
  logSecurityEvent,
  signAdminToken,
} from './_utils/security';

interface ExtendedResponse extends ServerResponse {
  status: (code: number) => ExtendedResponse;
  json: (data: any) => void;
}

/**
 * Vercel Serverless Function: POST /api/verify-admin
 *
 * Secure server-side validation of the admin passcode:
 * 1. Strictly rate-limited (max 5 failed attempts per IP per 5 minutes to prevent brute-force).
 * 2. Constant-time timingSafeEqual comparison.
 * 3. Never leaks the master password to the client.
 * 4. Issues a short-lived HMAC verification token upon success.
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

  // Rate limit: 5 attempts per 5 minutes per IP
  const rateLimit = checkRateLimit(`auth:${clientIp}`, { windowMs: 5 * 60 * 1000, max: 5 });
  res.setHeader('X-RateLimit-Remaining', String(rateLimit.remaining));
  res.setHeader('X-RateLimit-Reset', String(Math.ceil(rateLimit.resetTime / 1000)));

  if (!rateLimit.allowed) {
    logSecurityEvent({
      level: 'warn',
      action: 'ADMIN_LOGIN_RATE_LIMITED',
      requestId,
      ip: clientIp,
    });
    return res.status(429).json({
      success: false,
      error: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many authentication attempts. Please try again in 5 minutes.',
    });
  }

  try {
    const body = await parseJsonBody<{ passcode?: string }>(req, 16 * 1024);
    const { passcode } = body;

    const expectedPassword = process.env.ADMIN_PASSWORD;

    if (!expectedPassword || expectedPassword.trim().length === 0) {
      logSecurityEvent({
        level: 'error',
        action: 'ADMIN_PASSWORD_NOT_CONFIGURED',
        requestId,
        ip: clientIp,
      });
      return res.status(500).json({
        success: false,
        error: 'SERVER_CONFIGURATION_ERROR',
        message: 'Server administrator passcode is not configured in environment.',
      });
    }

    if (!passcode || typeof passcode !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_FAILED',
        message: 'Passcode is required.',
      });
    }

    const isValid = timingSafeEqual(passcode.trim(), expectedPassword.trim());

    if (!isValid) {
      logSecurityEvent({
        level: 'warn',
        action: 'ADMIN_LOGIN_FAILED',
        requestId,
        ip: clientIp,
      });
      return res.status(401).json({
        success: false,
        error: 'INVALID_CREDENTIALS',
        message: 'Access denied: Invalid administrator passcode.',
      });
    }

    // Generate a short-lived HMAC verification token (valid for 15 minutes)
    const expiry = Date.now() + 15 * 60 * 1000;
    const adminToken = signAdminToken(expectedPassword, 15 * 60 * 1000, clientIp);

    logSecurityEvent({
      level: 'info',
      action: 'ADMIN_LOGIN_SUCCESS',
      requestId,
      ip: clientIp,
    });

    return res.status(200).json({
      success: true,
      message: 'Administrator authorized.',
      adminToken,
      expiresAt: new Date(expiry).toISOString(),
    });
  } catch (err: any) {
    logSecurityEvent({
      level: 'error',
      action: 'ADMIN_LOGIN_ERROR',
      requestId,
      ip: clientIp,
      details: { error: err.message },
    });
    return res.status(500).json({
      success: false,
      error: 'INTERNAL_SERVER_ERROR',
      message: 'An unexpected error occurred during authorization verification.',
    });
  }
}
