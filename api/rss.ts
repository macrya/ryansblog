import { generateRssFeed } from '../src/utils/rssGenerator';
import { INITIAL_DIARY_POSTS } from '../src/data/initialContent';
import type { IncomingMessage, ServerResponse } from 'node:http';

interface ExtendedRequest extends IncomingMessage {
  headers: Record<string, string | string[] | undefined>;
}

/**
 * Vercel Serverless Function: GET /api/rss (rewritten from /rss.xml)
 * Serves the RSS feed with XML headers and Edge CDN caching.
 */
export default function handler(
  req: ExtendedRequest,
  res: ServerResponse
) {
  const host =
    (req.headers['x-forwarded-host'] as string) ||
    (req.headers['host'] as string) ||
    'markryan.dev';
  const proto = (req.headers['x-forwarded-proto'] as string) || 'https';
  const baseUrl = `${proto}://${host}`;

  const xml = generateRssFeed(INITIAL_DIARY_POSTS, baseUrl);

  res.setHeader('Content-Type', 'application/xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, s-maxage=60, stale-while-revalidate=300');
  res.writeHead(200);
  res.end(xml);
}
