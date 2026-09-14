import { generateRssFeed } from '../../src/utils/rssGenerator';
import { INITIAL_DIARY_POSTS } from '../../src/data/initialContent';

/**
 * Next.js App Router Route Handler for serving the RSS feed.
 * Accessible at: /rss.xml
 */
export async function GET(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const baseUrl = `${url.protocol}//${url.host}`;

  const rssXml = generateRssFeed(INITIAL_DIARY_POSTS, baseUrl);

  return new Response(rssXml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 's-maxage=3600, stale-while-revalidate',
    },
  });
}
