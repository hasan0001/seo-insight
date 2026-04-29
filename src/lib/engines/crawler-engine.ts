/**
 * FULL WEBSITE CRAWLER ENGINE
 *
 * Starts from a given URL and follows ALL internal links.
 * Visits every discoverable page (blogs, landing pages, etc.)
 *
 * For each page extracts:
 * - Title
 * - Meta description
 * - Headings (H1, H2, H3)
 * - Word count
 * - Internal links count
 * - External links count
 * - Images count
 * - Has favicon
 * - Is HTTPS
 * - Full body text (for analysis)
 *
 * Uses BFS (Breadth-First Search) to crawl pages.
 */

import * as cheerio from 'cheerio';

export interface CrawledPageData {
  url: string;
  title: string;
  metaDescription: string;
  h1: string;
  h2Count: number;
  h3Count: number;
  wordCount: number;
  internalLinks: number;
  externalLinks: number;
  images: number;
  hasFavicon: boolean;
  isHttps: boolean;
  loadTime: number;
  headings: string[];
  bodyText: string;
}

export interface CrawlResult {
  sessionId: string;
  startUrl: string;
  totalPages: number;
  pages: CrawledPageData[];
  errors: string[];
}

/**
 * Resolves a relative URL against a base URL
 */
function resolveUrl(base: string, relative: string): string | null {
  try {
    return new URL(relative, base).href;
  } catch {
    return null;
  }
}

/**
 * Extracts the domain from a URL
 */
function getDomain(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return '';
  }
}

/**
 * Checks if a URL should be crawled (not a file download, not external, etc.)
 */
function shouldCrawl(url: string, baseDomain: string): boolean {
  const skipExtensions = [
    '.pdf', '.jpg', '.jpeg', '.png', '.gif', '.svg', '.ico',
    '.css', '.js', '.woff', '.woff2', '.ttf', '.eot',
    '.zip', '.tar', '.gz', '.mp3', '.mp4', '.avi',
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  ];

  const urlLower = url.toLowerCase();

  // Skip file downloads
  if (skipExtensions.some(ext => urlLower.endsWith(ext))) return false;

  // Skip anchors and javascript
  if (url.startsWith('#') || url.startsWith('javascript:') || url.startsWith('mailto:')) return false;

  // Must be same domain
  const urlDomain = getDomain(url);
  if (urlDomain !== baseDomain) return false;

  return true;
}

/**
 * Crawls a single page and extracts all data
 */
async function crawlPage(url: string): Promise<{ data: CrawledPageData | null; links: string[]; error?: string }> {
  const startTime = Date.now();

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; SEOInsightBot/1.0; +https://seo-insight.app/bot)',
        Accept: 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(15000),
      redirect: 'follow',
    });

    if (!response.ok) {
      return { data: null, links: [], error: `HTTP ${response.status} for ${url}` };
    }

    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('text/html')) {
      return { data: null, links: [], error: `Non-HTML content: ${contentType}` };
    }

    const html = await response.text();
    const loadTime = (Date.now() - startTime) / 1000;

    const $ = cheerio.load(html);

    // Remove scripts and styles for text extraction
    $('script, style, noscript').remove();

    // Extract title
    const title = $('title').first().text().trim() || $('h1').first().text().trim() || '';

    // Extract meta description
    const metaDescription =
      $('meta[name="description"]').attr('content')?.trim() || '';

    // Extract headings
    const h1 = $('h1').first().text().trim();
    const h2Count = $('h2').length;
    const h3Count = $('h3').length;

    const headings: string[] = [];
    $('h1, h2, h3').each((_, el) => {
      const text = $(el).text().trim();
      if (text) headings.push(`${el.tagName.toUpperCase()}: ${text}`);
    });

    // Extract body text
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim().slice(0, 10000);

    // Word count
    const wordCount = bodyText.split(/\s+/).filter(w => w.length > 0).length;

    // Extract links
    const baseDomain = getDomain(url);
    let internalLinks = 0;
    let externalLinks = 0;
    const foundLinks: string[] = [];

    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') || '';
      const resolved = resolveUrl(url, href);

      if (resolved) {
        const linkDomain = getDomain(resolved);
        if (linkDomain === baseDomain) {
          internalLinks++;
          foundLinks.push(resolved);
        } else {
          externalLinks++;
        }
      }
    });

    // Images count
    const images = $('img').length;

    // Favicon check
    const hasFavicon =
      $('link[rel="icon"]').length > 0 ||
      $('link[rel="shortcut icon"]').length > 0 ||
      $('link[rel="apple-touch-icon"]').length > 0;

    // HTTPS check
    const isHttps = url.startsWith('https://');

    return {
      data: {
        url,
        title,
        metaDescription,
        h1,
        h2Count,
        h3Count,
        wordCount,
        internalLinks,
        externalLinks,
        images,
        hasFavicon,
        isHttps,
        loadTime,
        headings,
        bodyText,
      },
      links: foundLinks,
    };
  } catch (err) {
    return {
      data: null,
      links: [],
      error: `Failed to crawl ${url}: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Main crawl function using BFS
 */
export async function crawlWebsite(
  startUrl: string,
  options: {
    maxPages?: number;
    maxDepth?: number;
    onProgress?: (crawled: number, total: number, currentUrl: string) => void;
  } = {}
): Promise<CrawlResult> {
  const { maxPages = 50, maxDepth = 3, onProgress } = options;

  const baseDomain = getDomain(startUrl);
  if (!baseDomain) {
    return {
      sessionId: `crawl-${Date.now()}`,
      startUrl,
      totalPages: 0,
      pages: [],
      errors: ['Invalid start URL'],
    };
  }

  const visited = new Set<string>();
  const pages: CrawledPageData[] = [];
  const errors: string[] = [];
  const queue: { url: string; depth: number }[] = [{ url: startUrl, depth: 0 }];

  // Normalize URL function
  function normalizeUrl(url: string): string {
    try {
      const parsed = new URL(url);
      // Remove trailing slash, hash, and common tracking params
      parsed.hash = '';
      parsed.searchParams.delete('utm_source');
      parsed.searchParams.delete('utm_medium');
      parsed.searchParams.delete('utm_campaign');
      let normalized = parsed.href;
      if (normalized.endsWith('/')) normalized = normalized.slice(0, -1);
      return normalized;
    } catch {
      return url;
    }
  }

  while (queue.length > 0 && pages.length < maxPages) {
    const item = queue.shift()!;
    const normalizedUrl = normalizeUrl(item.url);

    if (visited.has(normalizedUrl)) continue;
    if (item.depth > maxDepth) continue;
    if (!shouldCrawl(normalizedUrl, baseDomain)) continue;

    visited.add(normalizedUrl);

    if (onProgress) {
      onProgress(pages.length, Math.min(pages.length + queue.length, maxPages), normalizedUrl);
    }

    const result = await crawlPage(normalizedUrl);

    if (result.error) {
      errors.push(result.error);
      continue;
    }

    if (result.data) {
      pages.push(result.data);

      // Add discovered links to queue
      for (const link of result.links) {
        const normalizedLink = normalizeUrl(link);
        if (!visited.has(normalizedLink) && shouldCrawl(normalizedLink, baseDomain)) {
          queue.push({ url: normalizedLink, depth: item.depth + 1 });
        }
      }
    }

    // Small delay to be respectful
    await new Promise(resolve => setTimeout(resolve, 300));
  }

  return {
    sessionId: `crawl-${Date.now()}`,
    startUrl,
    totalPages: pages.length,
    pages,
    errors,
  };
}
