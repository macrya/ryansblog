import crypto from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';

/**
 * Constant-time comparison for sensitive tokens and passcodes.
 * Protects against timing attacks by padding buffers to equal lengths before comparison.
 */
export function timingSafeEqual(a: string | undefined | null, b: string | undefined | null): boolean {
  if (typeof a !== 'string' || typeof b !== 'string') {
    return false;
  }

  // Use SHA-256 digests so both buffers are strictly the exact same byte length (32 bytes)
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();

  return crypto.timingSafeEqual(hashA, hashB);
}

/**
 * Issues an HMAC-signed admin verification token.
 */
export function signAdminToken(
  secret: string,
  ttlMs: number = 15 * 60 * 1000,
  clientIp: string = 'global'
): string {
  const expiry = Date.now() + ttlMs;
  const tokenData = `${clientIp}:${expiry}`;
  const tokenSignature = crypto.createHmac('sha256', secret).update(tokenData).digest('hex');
  return Buffer.from(JSON.stringify({ tokenData, tokenSignature })).toString('base64');
}

/**
 * Verifies an HMAC-signed admin verification token.
 */
export function verifyAdminToken(
  token: string | undefined | null,
  secret: string
): boolean {
  if (!token || typeof token !== 'string') return false;
  try {
    const raw = Buffer.from(token, 'base64').toString('utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || !parsed.tokenData || !parsed.tokenSignature) return false;

    const parts = parsed.tokenData.split(':');
    if (parts.length < 2) return false;
    const expiry = Number(parts[parts.length - 1]);
    if (isNaN(expiry) || Date.now() > expiry) return false;

    const expectedSig = crypto.createHmac('sha256', secret).update(parsed.tokenData).digest('hex');
    return timingSafeEqual(parsed.tokenSignature, expectedSig);
  } catch {
    return false;
  }
}

/**
 * Validates that an ID is a safe identifier without directory traversal or control characters.
 */
export function isValidId(id: unknown): id is string {
  if (typeof id !== 'string') return false;
  if (id.length < 1 || id.length > 128) return false;
  return /^[a-zA-Z0-9_\-]+$/.test(id);
}

/**
 * Validates that a URL is strictly an HTTPS URL pointing to Vercel Blob storage.
 * Prevents SSRF, scheme injection, and arbitrary host deletion.
 */
export function isSafeVercelBlobUrl(url: unknown): url is string {
  if (typeof url !== 'string' || !url) return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const hostname = parsed.hostname.toLowerCase();
    return (
      hostname === 'blob.vercel-storage.com' ||
      hostname.endsWith('.vercel-storage.com') ||
      hostname.endsWith('.public.blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

/**
 * In-memory sliding window rate limiter.
 */
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

// Clean up stale entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (entry.resetAt <= now) {
      rateLimitMap.delete(key);
    }
  }
}, 300000).unref();

export interface RateLimitOptions {
  windowMs: number;
  max: number;
}

export function checkRateLimit(
  identifier: string,
  options: RateLimitOptions = { windowMs: 60000, max: 30 }
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now();
  const entry = rateLimitMap.get(identifier);

  if (!entry || entry.resetAt <= now) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetAt: now + options.windowMs,
    });
    return { allowed: true, remaining: options.max - 1, resetTime: now + options.windowMs };
  }

  if (entry.count >= options.max) {
    return { allowed: false, remaining: 0, resetTime: entry.resetAt };
  }

  entry.count += 1;
  return { allowed: true, remaining: options.max - entry.count, resetTime: entry.resetAt };
}

/**
 * Neutralizes HTML injection and truncates to max length.
 */
export function sanitizeText(input: string, maxLength: number = 1000): string {
  if (typeof input !== 'string') return '';
  const escaped = input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
  return escaped.slice(0, maxLength);
}

/**
 * Extracts client IP safely from request headers.
 */
export function getClientIp(req: IncomingMessage): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  if (Array.isArray(forwarded) && forwarded.length > 0) {
    return forwarded[0].trim();
  }
  return req.socket.remoteAddress || 'unknown-ip';
}

/**
 * Safe JSON parser with strict payload size limit to prevent memory exhaustion.
 */
export async function parseJsonBody<T = any>(
  req: IncomingMessage,
  maxSizeBytes: number = 1024 * 1024 // 1MB default limit
): Promise<T> {
  const anyReq = req as any;
  if (anyReq.body && typeof anyReq.body === 'object') {
    return anyReq.body as T;
  }
  if (typeof anyReq.body === 'string') {
    if (Buffer.byteLength(anyReq.body) > maxSizeBytes) {
      throw new Error(`Payload Too Large: exceeded maximum size of ${maxSizeBytes} bytes`);
    }
    return JSON.parse(anyReq.body);
  }

  const chunks: Buffer[] = [];
  let totalBytes = 0;

  for await (const chunk of req) {
    const buffer = typeof chunk === 'string' ? Buffer.from(chunk) : chunk;
    totalBytes += buffer.length;
    if (totalBytes > maxSizeBytes) {
      throw new Error(`Payload Too Large: exceeded maximum size of ${maxSizeBytes} bytes`);
    }
    chunks.push(buffer);
  }

  const raw = Buffer.concat(chunks).toString('utf-8');
  if (!raw.trim()) {
    return {} as T;
  }

  return JSON.parse(raw) as T;
}

/**
 * Strict validator for Vercel Blob URLs to prevent SSRF or arbitrary deletion.
 */
export function isSafeBlobUrl(url: string | undefined | null): boolean {
  if (!url || typeof url !== 'string') return false;
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:') return false;
    const host = parsed.hostname.toLowerCase();
    return (
      host === 'blob.vercel-storage.com' ||
      host.endsWith('.vercel-storage.com') ||
      host.endsWith('.public.blob.vercel-storage.com')
    );
  } catch {
    return false;
  }
}

/**
 * Structured logger with request correlation ID.
 */
export function logSecurityEvent(event: {
  level: 'info' | 'warn' | 'error';
  action: string;
  requestId: string;
  ip: string;
  details?: Record<string, any>;
}) {
  const timestamp = new Date().toISOString();
  const logData = {
    timestamp,
    ...event,
  };

  if (event.level === 'error') {
    console.error(`[SECURITY]`, JSON.stringify(logData));
  } else if (event.level === 'warn') {
    console.warn(`[SECURITY]`, JSON.stringify(logData));
  } else {
    console.log(`[SECURITY]`, JSON.stringify(logData));
  }
}
