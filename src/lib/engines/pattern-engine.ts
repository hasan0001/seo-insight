/**
 * LOGIC / PATTERN ENGINE
 *
 * This engine REPLACES AI by using rule-based analysis to:
 * - Compare top-ranking pages
 * - Identify patterns in what makes them rank
 * - Output what you must add and what you are missing
 *
 * No AI APIs — purely deterministic pattern recognition.
 */

import type { SerpItem } from './serp-engine';
import type { CrawledPageData } from './crawler-engine';

export interface PatternInsight {
  metric: string;
  topRankingAvg: number | string;
  yourValue: number | string;
  status: 'good' | 'improve' | 'missing';
  recommendation: string;
}

export interface PatternAnalysis {
  keyword: string;
  insights: PatternInsight[];
  mustAdd: string[];
  youAreMissing: string[];
  contentGapAnalysis: string[];
  competitiveAdvantage: string[];
}

// ==========================================
// Analyze Word Count Patterns
// ==========================================

function analyzeWordCountPattern(serpResults: SerpItem[], yourPage?: CrawledPageData): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Estimate word count from snippet length (rough heuristic)
  // We can't know exact word count from SERP, so we use snippet as proxy
  const avgSnippetLength = serpResults.length > 0
    ? Math.round(serpResults.reduce((sum, r) => sum + r.snippet.split(/\s+/).length, 0) / serpResults.length)
    : 0;

  // From crawled pages, we know the actual word count
  if (yourPage) {
    // Typical top-ranking pages have 1500-2500 words
    const estimatedTopWordCount = 1800; // conservative estimate based on SEO studies

    if (yourPage.wordCount < estimatedTopWordCount * 0.5) {
      insights.push({
        metric: 'Content Length',
        topRankingAvg: `~${estimatedTopWordCount} words (estimated)`,
        yourValue: `${yourPage.wordCount} words`,
        status: 'improve',
        recommendation: `Your content is significantly shorter than typical top-ranking pages. Aim for at least ${estimatedTopWordCount} words by adding more depth, examples, and supporting details.`,
      });
    } else if (yourPage.wordCount < estimatedTopWordCount * 0.8) {
      insights.push({
        metric: 'Content Length',
        topRankingAvg: `~${estimatedTopWordCount} words (estimated)`,
        yourValue: `${yourPage.wordCount} words`,
        status: 'improve',
        recommendation: `Your content is somewhat shorter than top-ranking pages. Consider adding more comprehensive coverage of the topic.`,
      });
    } else {
      insights.push({
        metric: 'Content Length',
        topRankingAvg: `~${estimatedTopWordCount} words (estimated)`,
        yourValue: `${yourPage.wordCount} words`,
        status: 'good',
        recommendation: 'Your content length is competitive with top-ranking pages.',
      });
    }
  }

  return insights;
}

// ==========================================
// Analyze Title Patterns
// ==========================================

function analyzeTitlePatterns(serpResults: SerpItem[], yourPage?: CrawledPageData): PatternInsight[] {
  const insights: PatternInsight[] = [];

  // Analyze common words in top-ranking titles
  const titleWords = serpResults.slice(0, 10).flatMap(r =>
    r.title.toLowerCase().split(/\s+/).filter(w => w.length > 3)
  );

  const wordFreq: Record<string, number> = {};
  for (const w of titleWords) {
    wordFreq[w] = (wordFreq[w] || 0) + 1;
  }

  const commonWords = Object.entries(wordFreq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);

  if (yourPage && commonWords.length > 0) {
    const yourTitleLower = yourPage.title.toLowerCase();
    const missingWords = commonWords.filter(w => !yourTitleLower.includes(w));

    if (missingWords.length > 0) {
      insights.push({
        metric: 'Title Keywords',
        topRankingAvg: `Common: ${commonWords.join(', ')}`,
        yourValue: yourPage.title,
        status: 'improve',
        recommendation: `Top-ranking pages commonly include these words in their titles: ${missingWords.join(', ')}. Consider incorporating them naturally.`,
      });
    } else {
      insights.push({
        metric: 'Title Keywords',
        topRankingAvg: `Common: ${commonWords.join(', ')}`,
        yourValue: yourPage.title,
        status: 'good',
        recommendation: 'Your title includes the key terms that top-ranking pages use.',
      });
    }
  }

  // Title length pattern
  const avgTitleLength = serpResults.length > 0
    ? Math.round(serpResults.reduce((sum, r) => sum + r.title.length, 0) / serpResults.length)
    : 0;

  if (yourPage) {
    if (Math.abs(yourPage.title.length - avgTitleLength) > 20) {
      insights.push({
        metric: 'Title Length',
        topRankingAvg: `${avgTitleLength} characters`,
        yourValue: `${yourPage.title.length} characters`,
        status: 'improve',
        recommendation: `Top-ranking titles average ${avgTitleLength} characters. Adjust yours to be closer to this range.`,
      });
    }
  }

  return insights;
}

// ==========================================
// Analyze Content Type Patterns
// ==========================================

function analyzeContentTypePatterns(serpResults: SerpItem[]): PatternInsight[] {
  const insights: PatternInsight[] = [];

  const typeCounts: Record<string, number> = {};
  for (const r of serpResults) {
    typeCounts[r.resultType] = (typeCounts[r.resultType] || 0) + 1;
  }

  const dominantType = Object.entries(typeCounts).sort((a, b) => b[1] - a[1])[0];

  if (dominantType) {
    insights.push({
      metric: 'Dominant Content Type',
      topRankingAvg: `${dominantType[0]} (${dominantType[1]} of ${serpResults.length} results)`,
      yourValue: '-',
      status: 'missing',
      recommendation: `The dominant content type for this keyword is "${dominantType[0]}". Create content in this format to match search intent.`,
    });
  }

  return insights;
}

// ==========================================
// Analyze SERP Feature Patterns
// ==========================================

function analyzeSerpFeatures(serpResults: SerpItem[]): PatternInsight[] {
  const insights: PatternInsight[] = [];

  const hasFeatured = serpResults.some(r => r.isFeatured);
  const hasVideo = serpResults.some(r => r.resultType === 'video');
  const hasFAQ = serpResults.some(r =>
    r.title.toLowerCase().includes('faq') ||
    r.snippet.toLowerCase().includes('frequently asked')
  );

  if (hasFeatured) {
    insights.push({
      metric: 'Featured Snippet',
      topRankingAvg: 'Present in SERP',
      yourValue: '-',
      status: 'missing',
      recommendation: 'A featured snippet exists for this keyword. Structure your content with a clear, concise answer at the top to compete for this position.',
    });
  }

  if (hasVideo) {
    insights.push({
      metric: 'Video Content',
      topRankingAvg: 'Video results present',
      yourValue: '-',
      status: 'missing',
      recommendation: 'Videos are ranking for this keyword. Consider creating a video version of your content or embedding relevant videos.',
    });
  }

  if (hasFAQ) {
    insights.push({
      metric: 'FAQ Content',
      topRankingAvg: 'Competitors have FAQs',
      yourValue: '-',
      status: 'missing',
      recommendation: 'Competitors are using FAQ sections. Add an FAQ section to your page to improve your chances of appearing in "People Also Ask" results.',
    });
  }

  return insights;
}

// ==========================================
// Generate "Must Add" and "You Are Missing" Lists
// ==========================================

function generateActionItems(insights: PatternInsight[]): { mustAdd: string[]; youAreMissing: string[] } {
  const mustAdd: string[] = [];
  const youAreMissing: string[] = [];

  for (const insight of insights) {
    if (insight.status === 'improve' || insight.status === 'missing') {
      if (insight.status === 'missing') {
        youAreMissing.push(insight.recommendation);
      }
      mustAdd.push(insight.recommendation);
    }
  }

  // Add universal best practices
  mustAdd.push('Add structured data markup (Schema.org) to help search engines understand your content');
  mustAdd.push('Ensure your page loads in under 3 seconds');
  mustAdd.push('Include internal links to related content on your site');

  return { mustAdd, youAreMissing };
}

// ==========================================
// Content Gap Analysis
// ==========================================

function analyzeContentGaps(serpResults: SerpItem[], yourPage?: CrawledPageData): string[] {
  const gaps: string[] = [];

  // Extract topics from top-ranking snippets
  const allSnippetWords = serpResults.flatMap(r =>
    r.snippet.toLowerCase().split(/\s+/).filter(w => w.length > 4)
  );

  const topicFreq: Record<string, number> = {};
  for (const w of allSnippetWords) {
    topicFreq[w] = (topicFreq[w] || 0) + 1;
  }

  // Topics that appear in multiple competitors
  const competitorTopics = Object.entries(topicFreq)
    .filter(([, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  if (yourPage) {
    const yourTextLower = yourPage.bodyText.toLowerCase();
    const missingTopics = competitorTopics.filter(t => !yourTextLower.includes(t));

    for (const topic of missingTopics) {
      gaps.push(`Topic "${topic}" is covered by multiple competitors but missing from your content`);
    }
  }

  // Check for common section patterns in titles
  const titlePatterns = serpResults.slice(0, 10).map(r => r.title.toLowerCase());

  const hasComparison = titlePatterns.some(t => t.includes('vs') || t.includes('versus') || t.includes('comparison'));
  if (hasComparison) {
    gaps.push('Competitors include comparison content — consider adding a comparison section');
  }

  const hasHowTo = titlePatterns.some(t => t.includes('how to') || t.includes('guide') || t.includes('tutorial'));
  if (hasHowTo) {
    gaps.push('How-to and guide content is common — ensure your content includes step-by-step instructions');
  }

  const hasListicle = titlePatterns.some(t => t.includes('top') || t.includes('best') || t.includes('tips'));
  if (hasListicle) {
    gaps.push('List-style content ranks well — consider adding numbered lists or "top X" sections');
  }

  return gaps;
}

// ==========================================
// Competitive Advantage Analysis
// ==========================================

function analyzeCompetitiveAdvantage(yourPage: CrawledPageData | undefined): string[] {
  const advantages: string[] = [];

  if (!yourPage) return advantages;

  if (yourPage.wordCount > 1500) {
    advantages.push('Long-form content advantage: your page has comprehensive coverage');
  }

  if (yourPage.h2Count >= 4) {
    advantages.push('Well-structured content with multiple H2 headings');
  }

  if (yourPage.internalLinks >= 5) {
    advantages.push('Strong internal linking structure');
  }

  if (yourPage.isHttps) {
    advantages.push('HTTPS security — ranking signal advantage');
  }

  if (yourPage.images >= 3) {
    advantages.push('Rich media content with images');
  }

  return advantages;
}

// ==========================================
// Main Pattern Analysis Function
// ==========================================

export function analyzePatterns(
  keyword: string,
  serpResults: SerpItem[],
  yourPage?: CrawledPageData
): PatternAnalysis {
  const insights: PatternInsight[] = [
    ...analyzeWordCountPattern(serpResults, yourPage),
    ...analyzeTitlePatterns(serpResults, yourPage),
    ...analyzeContentTypePatterns(serpResults),
    ...analyzeSerpFeatures(serpResults),
  ];

  const { mustAdd, youAreMissing } = generateActionItems(insights);
  const contentGapAnalysis = analyzeContentGaps(serpResults, yourPage);
  const competitiveAdvantage = analyzeCompetitiveAdvantage(yourPage);

  return {
    keyword,
    insights,
    mustAdd,
    youAreMissing,
    contentGapAnalysis,
    competitiveAdvantage,
  };
}
