import { generateRssFeed } from '../src/utils/rssGenerator';
import { INITIAL_DIARY_POSTS } from '../src/data/initialContent';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { checkRateLimit, getClientIp } from './_utils/security';

interface ExtendedRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

/**
 * Validates the host to prevent host header injection.
 */
function getSafeBaseUrl(req: ExtendedRequest): string {
  if (process.env.APP_URL) {
    return process.env.APP_URL.replace(/\/+$/, '');
  }

  const rawHost =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string) ||
    'markryan.dev';

  const cleanHost = rawHost.split(',')[0].trim();
  // Ensure host contains only valid hostname characters
  if (/^[a-zA-Z0-9.\-:]+$/.test(cleanHost)) {
    const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
    const cleanProto = proto === 'http' ? 'http' : 'https';
    return `${cleanProto}://${cleanHost}`;
  }

  return 'https://markryan.dev';
}

/**
 * Vercel Serverless Function: GET /api/rss (rewritten from /rss.xml)
 * Serves the RSS feed with XML headers and Edge CDN caching.
 */
export default function handler(
  req: ExtendedRequest,
  res: ServerResponse
) {
  const clientIp = getClientIp(req);

  // Rate limit: 60 requests per minute per IP
  const rateLimit = checkRateLimit(`rss:${clientIp}`, { windowMs: 60000, max: 60 });
  if (!rateLimit.allowed) {
    res.setHeader('Content-Type', 'text/plain');
    res.writeHead(429);
    res.end('Too Many Requests');
    return;
  }

  const baseUrl = getSafeBaseUrl(req);
  const xml = generateRssFeed(INITIAL_DIARY_POSTS, baseUrl);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.writeHead(200);
  res.end(xml);
}
