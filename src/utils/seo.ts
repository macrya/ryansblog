/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * 
 * SEO, Canonical URL, OpenGraph, and Backlink / Citation Utilities
 */

export interface MetaUpdateOptions {
  title: string;
  description?: string;
  canonicalPath?: string;
  ogType?: string;
  ogImage?: string;
}

const BASE_URL = 'https://ais-pre-g3gywunwnq6uc56qmue35w-593119614601.europe-west1.run.app';

/**
 * Updates HTML head meta tags, canonical link, and OpenGraph/Twitter card properties
 * dynamically in response to section or article changes.
 */
export function updateDocumentSEO({
  title,
  description,
  canonicalPath = '',
  ogType = 'website',
  ogImage = `${BASE_URL}/markryan-avatar.svg`,
}: MetaUpdateOptions): void {
  if (typeof document === 'undefined') return;

  // 1. Update Title
  const fullTitle = title.includes('MarkRyan') ? title : `${title} — MarkRyan`;
  document.title = fullTitle;

  // 2. Canonical URL (Enforce HTTPS and clean path)
  const canonicalLink = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
  const targetUrl = canonicalPath
    ? `${BASE_URL}/${canonicalPath.replace(/^\/?/, '')}`
    : `${BASE_URL}/`;

  if (canonicalLink) {
    canonicalLink.setAttribute('href', targetUrl);
  }

  // 3. Meta Description
  if (description) {
    const metaDesc = document.querySelector<HTMLMetaElement>('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description.slice(0, 160));
    }
  }

  // 4. OpenGraph properties
  const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
  if (ogTitle) ogTitle.setAttribute('content', fullTitle);

  const ogDesc = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
  if (ogDesc && description) ogDesc.setAttribute('content', description.slice(0, 160));

  const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
  if (ogUrl) ogUrl.setAttribute('content', targetUrl);

  const ogTypeTag = document.querySelector<HTMLMetaElement>('meta[property="og:type"]');
  if (ogTypeTag) ogTypeTag.setAttribute('content', ogType);

  const ogImg = document.querySelector<HTMLMetaElement>('meta[property="og:image"]');
  if (ogImg) ogImg.setAttribute('content', ogImage);

  // 5. Twitter card properties
  const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
  if (twitterTitle) twitterTitle.setAttribute('content', fullTitle);

  const twitterDesc = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
  if (twitterDesc && description) twitterDesc.setAttribute('content', description.slice(0, 160));
}

/**
 * Normalizes an arbitrary text string into a clean, search-friendly URL slug.
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with -
    .replace(/[^\w-]+/g, '') // Remove non-word characters except -
    .replace(/--+/g, '-') // Replace multiple - with single -
    .replace(/^-+/, '') // Trim - from start
    .replace(/-+$/, ''); // Trim - from end
}

/**
 * Formats citations for backlink strategy (Item 19).
 */
export interface BacklinkCitations {
  url: string;
  markdown: string;
  html: string;
  bibtex: string;
  plainText: string;
}

export function generateBacklinkCitations(
  title: string,
  slugOrHash: string,
  author: string = 'MarkRyan',
  year: string = new Date().getFullYear().toString()
): BacklinkCitations {
  const cleanHash = slugOrHash.startsWith('#') ? slugOrHash : `#${slugOrHash}`;
  const permalink = `${BASE_URL}/${cleanHash}`;

  const markdown = `[${title} — ${author}](${permalink})`;
  const html = `<a href="${permalink}" title="${title} by ${author}">${title}</a>`;
  const bibtexKey = `markryan_${slugify(title).replace(/-/g, '_').slice(0, 20)}_${year}`;
  const bibtex = `@misc{${bibtexKey},
  author = {${author}},
  title = {${title}},
  year = {${year}},
  url = {${permalink}},
  note = {Online essay; accessed ${new Date().toISOString().split('T')[0]}}
}`;

  const plainText = `${author}. "${title}." ${year}. ${permalink}`;

  return {
    url: permalink,
    markdown,
    html,
    bibtex,
    plainText,
  };
}
