import type { DiaryPost } from '../types';

/**
 * Generates valid RSS 2.0 XML string for the blog posts.
 * Includes title, link, pubDate, description, and enclosure media if present.
 */
export function generateRssFeed(posts: DiaryPost[], baseUrl: string = 'https://markryan.dev'): string {
  const currentBuildDate = new Date().toUTCString();

  const itemsXml = posts
    .map((post) => {
      // Parse or approximate valid RFC 822 date for RSS
      let pubDate = currentBuildDate;
      try {
        const parsed = new Date(post.date);
        if (!isNaN(parsed.getTime())) {
          pubDate = parsed.toUTCString();
        }
      } catch {
        pubDate = currentBuildDate;
      }

      const postUrl = `${baseUrl}/#diary-${post.id}`;
      const description = post.content.length > 320 ? `${post.content.slice(0, 320)}...` : post.content;

      // Prevent CDATA breakout injection
      const safeDescription = description.replace(/]]>/g, ']]]]><![CDATA[>');

      const mediaEnclosure = post.imageUrl
        ? `\n      <enclosure url="${escapeXml(post.imageUrl)}" type="image/jpeg" length="0" />`
        : '';

      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(postUrl)}</link>
      <guid isPermaLink="false">${escapeXml(post.id)}</guid>
      <pubDate>${pubDate}</pubDate>
      <description><![CDATA[${safeDescription}]]></description>${mediaEnclosure}
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>MarkRyan — The Blog (The Diary)</title>
    <link>${escapeXml(baseUrl)}</link>
    <description>Minimalist diary, engineering ontologies, and literary meditations by MarkRyan.</description>
    <language>en-us</language>
    <lastBuildDate>${currentBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(baseUrl)}/rss.xml" rel="self" type="application/rss+xml" />
${itemsXml}
  </channel>
</rss>`;
}

function escapeXml(unsafe: string): string {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
