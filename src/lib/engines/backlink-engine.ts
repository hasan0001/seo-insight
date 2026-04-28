/**
 * BACKLINK STRATEGY ENGINE
 *
 * Since we can't access external backlink databases,
 * this engine generates a backlink strategy based on:
 *
 * 1. Finding competitor sites from SERP results
 * 2. Identifying blog/directory/forum opportunities
 * 3. Suggesting outreach targets
 * 4. Generating content ideas for link building
 *
 * All based on heuristic analysis of SERP data.
 */

import type { SerpItem } from './serp-engine';

export interface BacklinkOpportunity {
  url: string;
  title: string;
  type: 'blog' | 'directory' | 'forum' | 'resource' | 'news' | 'competitor';
  outreachStrategy: string;
  contentIdea: string;
  priority: 'high' | 'medium' | 'low';
}

export interface BacklinkStrategy {
  keyword: string;
  opportunities: BacklinkOpportunity[];
  contentSuggestions: string[];
  outreachTemplates: {
    type: string;
    template: string;
  }[];
}

// ==========================================
// Classify SERP Results for Backlink Opportunities
// ==========================================

function classifyForBacklinks(result: SerpItem): BacklinkOpportunity['type'] {
  const urlLower = result.url.toLowerCase();
  const titleLower = result.title.toLowerCase();
  const snippetLower = result.snippet.toLowerCase();
  const combined = `${urlLower} ${titleLower} ${snippetLower}`;

  // Directory detection
  if (
    urlLower.includes('directory') ||
    urlLower.includes('/list') ||
    urlLower.includes('/resources') ||
    urlLower.includes('yelp.com') ||
    urlLower.includes('yellowpages') ||
    combined.includes('directory') ||
    combined.includes('listing')
  ) {
    return 'directory';
  }

  // Forum detection
  if (
    urlLower.includes('reddit.com') ||
    urlLower.includes('quora.com') ||
    urlLower.includes('forum') ||
    urlLower.includes('community') ||
    urlLower.includes('stackexchange') ||
    urlLower.includes('stackoverflow')
  ) {
    return 'forum';
  }

  // News detection
  if (
    urlLower.includes('news') ||
    urlLower.includes('cnn.com') ||
    urlLower.includes('bbc.com') ||
    urlLower.includes('forbes.com') ||
    urlLower.includes('techcrunch')
  ) {
    return 'news';
  }

  // Blog detection
  if (
    urlLower.includes('blog') ||
    urlLower.includes('/post') ||
    urlLower.includes('/article') ||
    urlLower.includes('medium.com') ||
    urlLower.includes('wordpress') ||
    combined.includes('guide') ||
    combined.includes('how to') ||
    combined.includes('tips')
  ) {
    return 'blog';
  }

  // Resource page detection
  if (
    urlLower.includes('/resources') ||
    urlLower.includes('/links') ||
    urlLower.includes('/tools') ||
    combined.includes('resource') ||
    combined.includes('recommended')
  ) {
    return 'resource';
  }

  return 'competitor';
}

// ==========================================
// Generate Outreach Strategy
// ==========================================

function generateOutreachStrategy(type: BacklinkOpportunity['type'], title: string): string {
  switch (type) {
    case 'blog':
      return 'Reach out to the blog author with a guest post pitch or suggest adding your resource as a supplement to their article. Offer to write a complementary piece that adds value to their existing content.';
    case 'directory':
      return 'Submit your website to this directory. Most directories have a "Submit" or "Add Listing" page. Ensure your listing includes a keyword-rich description and accurate business information.';
    case 'forum':
      return 'Participate in discussions by providing helpful answers that naturally reference your content. Build reputation first by answering questions before sharing links. Avoid spammy self-promotion.';
    case 'resource':
      return 'Contact the page maintainer and suggest adding your resource to their list. Explain how your content provides unique value that complements their existing resources.';
    case 'news':
      return 'Reach out to the journalist or editor with a news angle, data point, or expert quote that could enhance a future story. Build relationships before asking for links.';
    case 'competitor':
      return 'Analyze this competitor\'s content strategy and create something 10x better. Look for gaps in their content that you can fill, then promote your superior resource to the same audience.';
  }
}

// ==========================================
// Generate Content Ideas
// ==========================================

function generateContentIdea(type: BacklinkOpportunity['type'], keyword: string, title: string): string {
  switch (type) {
    case 'blog':
      return `Write a comprehensive guide: "The Ultimate Guide to ${keyword}" with original data, case studies, and expert quotes that naturally attracts backlinks.`;
    case 'directory':
      return `Create a resource page that directories would want to list: "Top ${keyword} Resources" or "${keyword} Tools & Templates".`;
    case 'forum':
      return `Create a detailed FAQ or tutorial about ${keyword} that answers common forum questions better than existing responses.`;
    case 'resource':
      return `Develop a free tool, calculator, or template related to ${keyword} that resource pages would want to link to.`;
    case 'news':
      return `Conduct original research or a survey about ${keyword} and publish the findings as a report that journalists would cite.`;
    case 'competitor':
      return `Create "skyscraper" content: analyze the top-ranking article for ${keyword} and build something more comprehensive, up-to-date, and visually appealing.`;
  }
}

// ==========================================
// Determine Priority
// ==========================================

function determinePriority(type: BacklinkOpportunity['type'], position: number): BacklinkOpportunity['priority'] {
  // Higher priority for directory and resource (easier to get links)
  if (type === 'directory' || type === 'resource') return 'high';
  if (type === 'blog' && position <= 5) return 'high';
  if (type === 'blog') return 'medium';
  if (type === 'forum') return 'medium';
  if (type === 'news') return 'medium';
  return 'low';
}

// ==========================================
// Generate Outreach Templates
// ==========================================

function generateOutreachTemplates(keyword: string): BacklinkStrategy['outreachTemplates'] {
  return [
    {
      type: 'Guest Post Pitch',
      template: `Hi [Name],\n\nI've been following [Blog Name] and loved your article on [Topic]. I noticed you cover ${keyword} and wanted to suggest a guest post that would complement your existing content.\n\nI'd like to write: "[Proposed Title]" - a comprehensive guide covering [key points].\n\nWould this be of interest to your readers?\n\nBest regards,\n[Your Name]`,
    },
    {
      type: 'Resource Link Request',
      template: `Hi [Name],\n\nI noticed your resource page on ${keyword} at [URL]. It's a great collection!\n\nI recently published a detailed guide on [Topic] that I think would be a valuable addition: [Your URL]\n\nIt covers [unique value proposition]. Would you consider adding it to your resources?\n\nThank you!\n[Your Name]`,
    },
    {
      type: 'Broken Link Building',
      template: `Hi [Name],\n\nI was reading your article on ${keyword} at [URL] and noticed a broken link pointing to [broken URL].\n\nI've written a comprehensive replacement resource: [Your URL]\n\nIt covers everything the original link did plus [additional value]. Would you consider updating the link?\n\nThanks!\n[Your Name]`,
    },
    {
      type: 'Expert Quote / HARO',
      template: `Hi [Name],\n\nI'm an expert in ${keyword} with [X years] of experience. I noticed you're covering this topic and wanted to offer a unique perspective or data point for your next article.\n\nKey insight: [Your unique insight]\n\nHappy to provide more details or a quote. Would this be useful?\n\nBest,\n[Your Name]`,
    },
  ];
}

// ==========================================
// Generate Content Suggestions for Link Building
// ==========================================

function generateContentSuggestions(keyword: string, opportunities: BacklinkOpportunity[]): string[] {
  const suggestions: string[] = [];

  // Original research
  suggestions.push(`Conduct a survey or study about ${keyword} and publish the results — original data attracts natural backlinks`);

  // Free tools
  suggestions.push(`Build a free tool, calculator, or template related to ${keyword} — tools get linked to naturally`);

  // Comprehensive guide
  suggestions.push(`Create "The Definitive Guide to ${keyword}" (3000+ words) with original insights — long-form guides attract links`);

  // Infographic
  suggestions.push(`Design an infographic about ${keyword} statistics or trends — visual content gets shared and linked`);

  // Comparison
  suggestions.push(`Write a detailed comparison: "${keyword} vs [Alternative]" — comparison pages attract commercial-intent backlinks`);

  // Case study
  suggestions.push(`Publish a case study showing real results with ${keyword} — case studies are highly linkable`);

  // Resource list
  suggestions.push(`Create "Top ${keyword} Resources" or "Best ${keyword} Tools" — listicles attract links from people who are featured`);

  // Add opportunity-specific suggestions
  const blogOpps = opportunities.filter(o => o.type === 'blog');
  if (blogOpps.length > 0) {
    suggestions.push(`Reach out to ${blogOpps.length} blog owners for guest posting opportunities based on the SERP results`);
  }

  const directoryOpps = opportunities.filter(o => o.type === 'directory');
  if (directoryOpps.length > 0) {
    suggestions.push(`Submit your site to ${directoryOpps.length} directories found in the SERP results`);
  }

  return suggestions;
}

// ==========================================
// Main Backlink Strategy Generator
// ==========================================

export function generateBacklinkStrategy(keyword: string, serpResults: SerpItem[]): BacklinkStrategy {
  const opportunities: BacklinkOpportunity[] = serpResults.map(result => {
    const type = classifyForBacklinks(result);
    return {
      url: result.url,
      title: result.title,
      type,
      outreachStrategy: generateOutreachStrategy(type, result.title),
      contentIdea: generateContentIdea(type, keyword, result.title),
      priority: determinePriority(type, result.position),
    };
  });

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  opportunities.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  const contentSuggestions = generateContentSuggestions(keyword, opportunities);
  const outreachTemplates = generateOutreachTemplates(keyword);

  return {
    keyword,
    opportunities,
    contentSuggestions,
    outreachTemplates,
  };
}
