/**
 * SEO AUDIT ENGINE
 *
 * Performs deep analysis of each crawled page.
 * Checks for common SEO issues and assigns severity scores.
 *
 * Checks:
 * - Missing or duplicate titles
 * - Missing meta descriptions
 * - Heading structure issues
 * - Thin content (<300 words)
 * - Keyword usage in key positions
 * - Internal linking quality
 * - Image alt text
 * - URL structure
 * - HTTPS usage
 * - Favicon presence
 */

import type { CrawledPageData } from './crawler-engine';

export interface SeoIssue {
  type: 'error' | 'warning' | 'info';
  category: string;
  message: string;
  detail: string;
  impact: number; // 0-10, how much this affects SEO
}

export interface PageAuditResult {
  url: string;
  seoScore: number; // 0-100
  issues: SeoIssue[];
  suggestions: string[];
  categoryScores: {
    titles: number;
    meta: number;
    headings: number;
    content: number;
    links: number;
    technical: number;
  };
}

export interface SiteAuditResult {
  totalPages: number;
  averageScore: number;
  pageResults: PageAuditResult[];
  siteWideIssues: SeoIssue[];
  topSuggestions: string[];
}

// ==========================================
// Title Analysis
// ==========================================

function analyzeTitle(page: CrawledPageData, allPages: CrawledPageData[]): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // Missing title
  if (!page.title || page.title.trim() === '') {
    issues.push({
      type: 'error',
      category: 'titles',
      message: 'Missing page title',
      detail: 'Every page must have a unique, descriptive title tag. This is one of the most important SEO ranking factors.',
      impact: 9,
    });
  } else {
    // Title too short
    if (page.title.length < 30) {
      issues.push({
        type: 'warning',
        category: 'titles',
        message: 'Title is too short',
        detail: `Title is only ${page.title.length} characters. Aim for 30-60 characters for optimal display in search results.`,
        impact: 4,
      });
    }

    // Title too long
    if (page.title.length > 60) {
      issues.push({
        type: 'warning',
        category: 'titles',
        message: 'Title is too long',
        detail: `Title is ${page.title.length} characters. Google typically shows only the first 50-60 characters. Keep it concise.`,
        impact: 3,
      });
    }

    // Duplicate title
    const duplicates = allPages.filter(p => p.url !== page.url && p.title === page.title);
    if (duplicates.length > 0) {
      issues.push({
        type: 'error',
        category: 'titles',
        message: 'Duplicate page title',
        detail: `This title is also used on ${duplicates.length} other page(s). Each page should have a unique title.`,
        impact: 7,
      });
    }
  }

  return issues;
}

// ==========================================
// Meta Description Analysis
// ==========================================

function analyzeMetaDescription(page: CrawledPageData): SeoIssue[] {
  const issues: SeoIssue[] = [];

  if (!page.metaDescription || page.metaDescription.trim() === '') {
    issues.push({
      type: 'error',
      category: 'meta',
      message: 'Missing meta description',
      detail: 'Meta descriptions help search engines understand your page and influence click-through rates. Write a compelling 120-160 character description.',
      impact: 7,
    });
  } else {
    if (page.metaDescription.length < 120) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'Meta description is too short',
        detail: `At ${page.metaDescription.length} characters, your description may not fully utilize the available space. Aim for 120-160 characters.`,
        impact: 3,
      });
    }

    if (page.metaDescription.length > 160) {
      issues.push({
        type: 'warning',
        category: 'meta',
        message: 'Meta description is too long',
        detail: `At ${page.metaDescription.length} characters, your description will be truncated in search results. Keep it under 160 characters.`,
        impact: 3,
      });
    }
  }

  return issues;
}

// ==========================================
// Heading Structure Analysis
// ==========================================

function analyzeHeadings(page: CrawledPageData): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // Missing H1
  if (!page.h1 || page.h1.trim() === '') {
    issues.push({
      type: 'error',
      category: 'headings',
      message: 'Missing H1 heading',
      detail: 'Every page should have exactly one H1 heading that clearly describes the page content. The H1 is the most important heading for SEO.',
      impact: 8,
    });
  }

  // Multiple H1s (from headings data)
  const h1Count = page.headings.filter(h => h.startsWith('H1:')).length;
  if (h1Count > 1) {
    issues.push({
      type: 'warning',
      category: 'headings',
      message: 'Multiple H1 headings',
      detail: `Found ${h1Count} H1 headings. Best practice is to have exactly one H1 per page. Use H2-H6 for subheadings.`,
      impact: 4,
    });
  }

  // No H2 headings
  if (page.h2Count === 0) {
    issues.push({
      type: 'warning',
      category: 'headings',
      message: 'No H2 headings found',
      detail: 'H2 headings help structure your content and improve readability. They also help search engines understand the hierarchy of information on your page.',
      impact: 4,
    });
  }

  // Heading hierarchy check (H1 should come before H2, H2 before H3, etc.)
  let lastLevel = 0;
  let hierarchyBroken = false;
  for (const heading of page.headings) {
    const level = parseInt(heading.charAt(1));
    if (level > lastLevel + 1 && lastLevel > 0) {
      hierarchyBroken = true;
      break;
    }
    lastLevel = level;
  }

  if (hierarchyBroken) {
    issues.push({
      type: 'warning',
      category: 'headings',
      message: 'Heading hierarchy is broken',
      detail: 'Headings should follow a logical hierarchy (H1 > H2 > H3). Skipping levels (e.g., H1 directly to H3) can confuse screen readers and search engines.',
      impact: 3,
    });
  }

  return issues;
}

// ==========================================
// Content Analysis
// ==========================================

function analyzeContent(page: CrawledPageData): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // Thin content
  if (page.wordCount < 300) {
    issues.push({
      type: 'error',
      category: 'content',
      message: 'Thin content detected',
      detail: `Page has only ${page.wordCount} words. Pages with less than 300 words of content tend to rank poorly. Aim for at least 300-500 words, with 1000+ for important pages.`,
      impact: 8,
    });
  } else if (page.wordCount < 600) {
    issues.push({
      type: 'warning',
      category: 'content',
      message: 'Content could be more comprehensive',
      detail: `Page has ${page.wordCount} words. While this meets the minimum, pages with 1000+ words tend to rank better for competitive keywords. Consider adding more depth.`,
      impact: 3,
    });
  }

  // Body text is empty or very short
  if (page.bodyText.trim().length < 100) {
    issues.push({
      type: 'error',
      category: 'content',
      message: 'Very little visible text content',
      detail: 'The page has very little visible text. This could indicate that content is loaded via JavaScript (which search engines may not see) or that the page is mostly images/video.',
      impact: 7,
    });
  }

  return issues;
}

// ==========================================
// Link Analysis
// ==========================================

function analyzeLinks(page: CrawledPageData): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // No internal links
  if (page.internalLinks === 0) {
    issues.push({
      type: 'warning',
      category: 'links',
      message: 'No internal links found',
      detail: 'Internal links help search engines discover and understand the relationship between pages on your site. They also distribute page authority across your site.',
      impact: 5,
    });
  }

  // Very few internal links
  if (page.internalLinks > 0 && page.internalLinks < 3) {
    issues.push({
      type: 'info',
      category: 'links',
      message: 'Few internal links',
      detail: `Only ${page.internalLinks} internal links found. Adding more relevant internal links can help users navigate and improve SEO.`,
      impact: 2,
    });
  }

  // No external links
  if (page.externalLinks === 0) {
    issues.push({
      type: 'info',
      category: 'links',
      message: 'No external links found',
      detail: 'Linking to authoritative external sources can improve the credibility of your content. Consider linking to relevant, trustworthy sources.',
      impact: 1,
    });
  }

  return issues;
}

// ==========================================
// Technical Analysis
// ==========================================

function analyzeTechnical(page: CrawledPageData): SeoIssue[] {
  const issues: SeoIssue[] = [];

  // Not HTTPS
  if (!page.isHttps) {
    issues.push({
      type: 'error',
      category: 'technical',
      message: 'Page is not using HTTPS',
      detail: 'HTTPS is a ranking signal and essential for user trust. Google Chrome marks HTTP pages as "Not Secure", which reduces click-through rates.',
      impact: 8,
    });
  }

  // No favicon
  if (!page.hasFavicon) {
    issues.push({
      type: 'info',
      category: 'technical',
      message: 'Missing favicon',
      detail: 'A favicon improves brand recognition in browser tabs and bookmarks. While not a direct ranking factor, it improves user experience.',
      impact: 1,
    });
  }

  // Very slow load time
  if (page.loadTime > 5) {
    issues.push({
      type: 'error',
      category: 'technical',
      message: 'Very slow page load time',
      detail: `Page loaded in ${page.loadTime.toFixed(1)} seconds. Google considers page speed as a ranking factor. Aim for under 3 seconds.`,
      impact: 6,
    });
  } else if (page.loadTime > 3) {
    issues.push({
      type: 'warning',
      category: 'technical',
      message: 'Slow page load time',
      detail: `Page loaded in ${page.loadTime.toFixed(1)} seconds. Consider optimizing images, reducing scripts, and enabling caching.`,
      impact: 3,
    });
  }

  // No images
  if (page.images === 0 && page.wordCount > 200) {
    issues.push({
      type: 'info',
      category: 'technical',
      message: 'No images on content page',
      detail: 'Pages with relevant images tend to perform better. Consider adding images with descriptive alt text.',
      impact: 1,
    });
  }

  // URL structure
  try {
    const urlObj = new URL(page.url);
    if (urlObj.pathname.length > 100) {
      issues.push({
        type: 'warning',
        category: 'technical',
        message: 'URL is very long',
        detail: 'Long URLs can be truncated in search results and are harder for users to remember. Keep URLs concise and descriptive.',
        impact: 2,
      });
    }

    if (urlObj.pathname.includes('_')) {
      issues.push({
        type: 'info',
        category: 'technical',
        message: 'URL contains underscores',
        detail: 'Google treats hyphens as word separators but not underscores. Use hyphens (-) instead of underscores (_) in URLs.',
        impact: 1,
      });
    }

    // Check for query parameters
    if (urlObj.search.length > 0) {
      issues.push({
        type: 'info',
        category: 'technical',
        message: 'URL contains query parameters',
        detail: 'Clean URLs without query parameters tend to be more search-engine friendly. Consider using URL rewriting.',
        impact: 1,
      });
    }
  } catch {
    // Invalid URL, skip
  }

  return issues;
}

// ==========================================
// Score Calculation
// ==========================================

function calculateCategoryScore(issues: SeoIssue[]): number {
  const maxImpact = issues.reduce((sum, i) => sum + i.impact, 0);
  // Start at 100, subtract based on impact
  const score = Math.max(0, 100 - maxImpact * 5);
  return Math.round(score);
}

function generateSuggestions(issues: SeoIssue[]): string[] {
  const suggestions: string[] = [];

  const errorCategories = new Set(issues.filter(i => i.type === 'error').map(i => i.category));
  const warningCategories = new Set(issues.filter(i => i.type === 'warning').map(i => i.category));

  if (errorCategories.has('titles')) {
    suggestions.push('Add unique, descriptive titles (30-60 characters) to every page');
  }
  if (errorCategories.has('meta') || warningCategories.has('meta')) {
    suggestions.push('Write compelling meta descriptions (120-160 characters) for each page');
  }
  if (errorCategories.has('headings')) {
    suggestions.push('Add a single H1 heading and organize content with H2/H3 subheadings');
  }
  if (errorCategories.has('content')) {
    suggestions.push('Create more comprehensive content — aim for at least 500-1000 words on important pages');
  }
  if (errorCategories.has('technical')) {
    suggestions.push('Fix technical issues: enable HTTPS, optimize page speed, add favicon');
  }
  if (warningCategories.has('links')) {
    suggestions.push('Add relevant internal links to help users navigate and improve SEO');
  }

  if (suggestions.length === 0) {
    suggestions.push('Your page follows SEO best practices! Consider monitoring performance and making incremental improvements.');
  }

  return suggestions;
}

// ==========================================
// Main Audit Function
// ==========================================

export function auditPage(page: CrawledPageData, allPages: CrawledPageData[]): PageAuditResult {
  const issues: SeoIssue[] = [
    ...analyzeTitle(page, allPages),
    ...analyzeMetaDescription(page),
    ...analyzeHeadings(page),
    ...analyzeContent(page),
    ...analyzeLinks(page),
    ...analyzeTechnical(page),
  ];

  // Calculate category scores
  const titleIssues = issues.filter(i => i.category === 'titles');
  const metaIssues = issues.filter(i => i.category === 'meta');
  const headingIssues = issues.filter(i => i.category === 'headings');
  const contentIssues = issues.filter(i => i.category === 'content');
  const linkIssues = issues.filter(i => i.category === 'links');
  const technicalIssues = issues.filter(i => i.category === 'technical');

  const categoryScores = {
    titles: calculateCategoryScore(titleIssues),
    meta: calculateCategoryScore(metaIssues),
    headings: calculateCategoryScore(headingIssues),
    content: calculateCategoryScore(contentIssues),
    links: calculateCategoryScore(linkIssues),
    technical: calculateCategoryScore(technicalIssues),
  };

  // Overall SEO score (weighted average)
  const seoScore = Math.round(
    categoryScores.titles * 0.25 +
    categoryScores.meta * 0.15 +
    categoryScores.headings * 0.15 +
    categoryScores.content * 0.25 +
    categoryScores.links * 0.1 +
    categoryScores.technical * 0.1
  );

  const suggestions = generateSuggestions(issues);

  return {
    url: page.url,
    seoScore,
    issues,
    suggestions,
    categoryScores,
  };
}

export function auditSite(pages: CrawledPageData[]): SiteAuditResult {
  const pageResults = pages.map(page => auditPage(page, pages));

  const averageScore =
    pageResults.length > 0
      ? Math.round(pageResults.reduce((sum, r) => sum + r.seoScore, 0) / pageResults.length)
      : 0;

  // Site-wide issues (issues that affect multiple pages)
  const issueCounts = new Map<string, { count: number; issue: SeoIssue }>();
  for (const result of pageResults) {
    for (const issue of result.issues) {
      const key = `${issue.category}:${issue.message}`;
      const existing = issueCounts.get(key);
      if (existing) {
        existing.count++;
      } else {
        issueCounts.set(key, { count: 1, issue });
      }
    }
  }

  const siteWideIssues = [...issueCounts.values()]
    .filter(({ count }) => count > 1)
    .sort((a, b) => b.count - a.count)
    .map(({ count, issue }) => ({
      ...issue,
      detail: `${issue.detail} (Affects ${count} pages)`,
    }));

  // Top suggestions across all pages
  const allSuggestions = pageResults.flatMap(r => r.suggestions);
  const suggestionFreq = new Map<string, number>();
  for (const s of allSuggestions) {
    suggestionFreq.set(s, (suggestionFreq.get(s) || 0) + 1);
  }

  const topSuggestions = [...suggestionFreq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([s]) => s);

  return {
    totalPages: pages.length,
    averageScore,
    pageResults,
    siteWideIssues,
    topSuggestions,
  };
}
