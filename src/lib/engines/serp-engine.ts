/**
 * SERP (Search Engine Results Page) ENGINE
 *
 * Scrapes Google search results for a given keyword.
 * Extracts: titles, URLs, snippets, featured snippets.
 * Detects: blog vs ecommerce vs video result types.
 *
 * No paid APIs used - just direct fetching and HTML parsing.
 */

import * as cheerio from 'cheerio';

export interface SerpItem {
  position: number;
  title: string;
  url: string;
  snippet: string;
  resultType: 'blog' | 'ecommerce' | 'video' | 'forum' | 'news' | 'web';
  isFeatured: boolean;
}

export interface SerpAnalysis {
  keyword: string;
  results: SerpItem[];
  featuredSnippet: SerpItem | null;
  resultTypeBreakdown: Record<string, number>;
  avgWordCountInTitles: number;
  commonTitleWords: string[];
}

// ==========================================
// Result Type Detection
// ==========================================

function detectResultType(url: string, title: string, snippet: string): SerpItem['resultType'] {
  const urlLower = url.toLowerCase();
  const titleLower = title.toLowerCase();
  const snippetLower = snippet.toLowerCase();
  const combined = `${urlLower} ${titleLower} ${snippetLower}`;

  // Video detection
  if (urlLower.includes('youtube.com') || urlLower.includes('vimeo.com') || urlLower.includes('youtu.be')) {
    return 'video';
  }

  // Forum detection
  if (
    urlLower.includes('reddit.com') ||
    urlLower.includes('quora.com') ||
    urlLower.includes('stackoverflow.com') ||
    urlLower.includes('forum') ||
    urlLower.includes('community')
  ) {
    return 'forum';
  }

  // Ecommerce detection
  if (
    urlLower.includes('amazon.com') ||
    urlLower.includes('ebay.com') ||
    urlLower.includes('shopify.com') ||
    urlLower.includes('/product') ||
    urlLower.includes('/shop') ||
    urlLower.includes('/store') ||
    combined.includes('buy') ||
    combined.includes('price') ||
    combined.includes('discount') ||
    combined.includes('deal')
  ) {
    return 'ecommerce';
  }

  // News detection
  if (
    urlLower.includes('news') ||
    urlLower.includes('cnn.com') ||
    urlLower.includes('bbc.com') ||
    urlLower.includes('reuters.com') ||
    combined.includes('breaking') ||
    combined.includes('reported')
  ) {
    return 'news';
  }

  // Blog detection
  if (
    urlLower.includes('blog') ||
    urlLower.includes('/post') ||
    urlLower.includes('/article') ||
    urlLower.includes('medium.com') ||
    urlLower.includes('wordpress.com') ||
    combined.includes('how to') ||
    combined.includes('guide') ||
    combined.includes('tips')
  ) {
    return 'blog';
  }

  return 'web';
}

// ==========================================
// SERP Scraper
// ==========================================

export async function scrapeSerp(keyword: string): Promise<SerpAnalysis> {
  const url = `https://www.google.com/search?q=${encodeURIComponent(keyword)}&hl=en&num=20`;
  const response = await fetch(url, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9',
      Accept:
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
    },
    signal: AbortSignal.timeout(15000),
  });

  const html = await response.text();
  const $ = cheerio.load(html);

  const results: SerpItem[] = [];
  let position = 0;
  let featuredSnippet: SerpItem | null = null;

  // Extract featured snippet
  const featuredEl = $('[data-attrid="wa=/g/1"]').first();
  if (featuredEl.length) {
    const fTitle = featuredEl.find('h3, [data-header-feature] h3').first().text().trim();
    const fSnippet = featuredEl.find('[data-attrid="wa=/g/1"]').text().trim() || featuredEl.text().trim().slice(0, 300);
    const fLink = featuredEl.find('a').first().attr('href') || '';

    if (fTitle) {
      featuredSnippet = {
        position: 0,
        title: fTitle,
        url: fLink.startsWith('http') ? fLink : '',
        snippet: fSnippet,
        resultType: detectResultType(fLink, fTitle, fSnippet),
        isFeatured: true,
      };
    }
  }

  // Extract regular results
  // Google uses various selectors over time; we try multiple
  const resultSelectors = [
    '#rso .g',
    '#rso > div',
    '.Gx5Zad',
    'div[data-hveid]',
  ];

  let parsed = false;
  for (const selector of resultSelectors) {
    $(selector).each((_, el) => {
      const titleEl = $(el).find('h3').first();
      const linkEl = $(el).find('a').first();
      const snippetEl = $(el).find('[data-sncf], .VwiC3b, .st, .IsZvec').first();

      const title = titleEl.text().trim();
      const link = linkEl.attr('href') || '';
      const snippet = snippetEl.text().trim();

      if (title && link && link.startsWith('http')) {
        position++;
        parsed = true;

        const resultType = detectResultType(link, title, snippet);

        results.push({
          position,
          title,
          url: link,
          snippet,
          resultType,
          isFeatured: false,
        });
      }
    });

    if (parsed && results.length > 0) break;
  }

  // Analyze results
  const resultTypeBreakdown: Record<string, number> = {};
  for (const r of results) {
    resultTypeBreakdown[r.resultType] = (resultTypeBreakdown[r.resultType] || 0) + 1;
  }

  // Average word count in titles
  const titleWords = results.map(r => r.title.split(/\s+/).length);
  const avgWordCountInTitles =
    titleWords.length > 0 ? titleWords.reduce((a, b) => a + b, 0) / titleWords.length : 0;

  // Common words in titles (excluding stop words)
  const stopWords = new Set([
    'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
    'of', 'with', 'by', 'from', 'is', 'it', 'as', 'be', 'are', 'was',
    'were', 'been', 'this', 'that', 'these', 'those', 'how', 'what', 'why',
    'your', 'you', 'can', 'do', 'does',
  ]);

  const wordFreq: Record<string, number> = {};
  for (const r of results) {
    const words = r.title.toLowerCase().split(/\s+/);
    for (const w of words) {
      if (w.length > 2 && !stopWords.has(w)) {
        wordFreq[w] = (wordFreq[w] || 0) + 1;
      }
    }
  }

  const commonTitleWords = Object.entries(wordFreq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return {
    keyword,
    results,
    featuredSnippet,
    resultTypeBreakdown,
    avgWordCountInTitles,
    commonTitleWords,
  };
}
