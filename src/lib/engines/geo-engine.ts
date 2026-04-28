/**
 * GEO (Generative Engine Optimization) ENGINE
 *
 * Evaluates if content is usable by generative AI engines
 * (like ChatGPT, Perplexity, Google SGE, etc.).
 *
 * Checks:
 * - Clarity of explanation
 * - Entity mentions (people, places, brands)
 * - Structured information (tables, lists, data)
 * - Trust signals (citations, sources, dates)
 * - Factual density
 * - Unique value (not generic content)
 * - Semantic richness
 *
 * Score: 0-100
 *
 * No AI APIs used — purely rule-based heuristic analysis.
 */

import type { CrawledPageData } from './crawler-engine';

export interface GeoIssue {
  category: string;
  message: string;
  detail: string;
  scoreImpact: number;
}

export interface GeoResult {
  url: string;
  geoScore: number;
  issues: GeoIssue[];
  strengths: string[];
  recommendations: string[];
  generativeReadiness: {
    hasEntities: boolean;
    hasStructuredData: boolean;
    hasTrustSignals: boolean;
    hasClarity: boolean;
    hasFactualDensity: boolean;
    hasUniqueValue: boolean;
  };
}

// ==========================================
// Entity Detection (Simple Pattern-Based)
// ==========================================

function detectEntities(text: string): {
  people: string[];
  places: string[];
  brands: string[];
  technologies: string[];
} {
  const lower = text.toLowerCase();

  // Known brand/technology patterns
  const techPatterns = [
    'google', 'apple', 'microsoft', 'amazon', 'meta', 'openai',
    'react', 'angular', 'vue', 'next.js', 'node.js', 'python',
    'javascript', 'typescript', 'html', 'css', 'sql', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'firebase',
  ];

  const foundTechs = techPatterns.filter(t => lower.includes(t));

  // Detect capitalized words that might be entities (excluding sentence starts)
  const sentences = text.split(/[.!?]+/);
  const potentialEntities: string[] = [];
  for (const sentence of sentences.slice(1)) {
    const words = sentence.trim().split(/\s+/);
    for (const word of words) {
      if (word.length > 2 && /^[A-Z][a-z]+$/.test(word)) {
        potentialEntities.push(word);
      }
    }
  }

  // Detect multi-word entities (consecutive capitalized words)
  const multiWordEntityPattern = /[A-Z][a-z]+(?:\s+[A-Z][a-z]+)+/g;
  const multiWordEntities = text.match(multiWordEntityPattern) || [];

  // Detect places using common patterns
  const placeIndicators = ['city', 'country', 'state', 'region', 'located in', 'based in'];
  const hasPlaceReferences = placeIndicators.some(p => lower.includes(p));

  return {
    people: [...new Set(potentialEntities)].slice(0, 10),
    places: hasPlaceReferences ? ['Place references found'] : [],
    brands: [...new Set(multiWordEntities)].slice(0, 10),
    technologies: foundTechs,
  };
}

// ==========================================
// Check: Entity Mentions
// ==========================================

function checkEntities(page: CrawledPageData): { found: boolean; entities: ReturnType<typeof detectEntities>; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const entities = detectEntities(page.bodyText);

  const totalEntities = entities.people.length + entities.brands.length + entities.technologies.length;

  if (totalEntities === 0) {
    issues.push({
      category: 'entities',
      message: 'No named entities detected',
      detail: 'Generative engines rely on entity recognition to understand and cite content. Include specific names of people, brands, products, technologies, and places to improve visibility.',
      scoreImpact: 20,
    });
  } else if (totalEntities < 3) {
    issues.push({
      category: 'entities',
      message: 'Few entity mentions',
      detail: `Only ${totalEntities} entities detected. More specific entity mentions (people, brands, technologies) help generative engines understand and reference your content.`,
      scoreImpact: 8,
    });
  }

  return { found: totalEntities >= 3, entities, issues };
}

// ==========================================
// Check: Structured Information
// ==========================================

function checkStructuredData(page: CrawledPageData): { found: boolean; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const text = page.bodyText;

  // Check for structured data indicators
  const hasNumbers = /\d+[%$€£]/.test(text) || /\d{4}/.test(text);
  const hasLists = /^[•●○▪▸►]\s+/m.test(text) || /^\d+[.)]\s+/m.test(text);
  const hasTables = text.includes('|') && text.includes('---');
  const hasComparisons = /(?:vs\.?|versus|compared\s+to|instead\s+of)/i.test(text);
  const hasSteps = /(?:step\s+\d|first.*then.*finally|1\..*2\..*3\.)/is.test(text);

  const structureCount = [hasNumbers, hasLists, hasTables, hasComparisons, hasSteps].filter(Boolean).length;

  if (structureCount === 0) {
    issues.push({
      category: 'structured-data',
      message: 'No structured information detected',
      detail: 'Generative engines prefer content with structured data like statistics, comparisons, tables, and step-by-step instructions. Add specific numbers, comparisons, or lists to your content.',
      scoreImpact: 15,
    });
  } else if (structureCount < 2) {
    issues.push({
      category: 'structured-data',
      message: 'Limited structured information',
      detail: 'Add more structured elements like statistics, comparisons, tables, or step-by-step guides to improve generative engine visibility.',
      scoreImpact: 5,
    });
  }

  return { found: structureCount >= 2, issues };
}

// ==========================================
// Check: Trust Signals
// ==========================================

function checkTrustSignals(page: CrawledPageData): { found: boolean; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const text = page.bodyText.toLowerCase();

  // Check for trust signals
  const hasCitations = /(?:according\s+to|cited|source|reference|study|research|report)/i.test(text);
  const hasDates = /\b(?:january|february|march|april|may|june|july|august|september|october|november|december)\b/i.test(text) || /\b\d{4}\b/.test(text);
  const hasAuthorInfo = /(?:by\s+[A-Z]|author|written\s+by|published)/i.test(text);
  const hasNumbers = /\d+/.test(text); // Any numbers add credibility
  const hasExternalRefs = page.externalLinks > 0;

  const trustCount = [hasCitations, hasDates, hasAuthorInfo, hasNumbers, hasExternalRefs].filter(Boolean).length;

  if (trustCount < 2) {
    issues.push({
      category: 'trust-signals',
      message: 'Insufficient trust signals',
      detail: 'Generative engines prioritize trustworthy content. Add citations, dates, author information, and references to authoritative sources to improve credibility.',
      scoreImpact: 15,
    });
  } else if (trustCount < 3) {
    issues.push({
      category: 'trust-signals',
      message: 'Trust signals could be stronger',
      detail: 'Adding more citations, specific dates, and author attribution will improve your content\'s credibility with generative engines.',
      scoreImpact: 5,
    });
  }

  return { found: trustCount >= 3, issues };
}

// ==========================================
// Check: Clarity of Explanation
// ==========================================

function checkClarity(page: CrawledPageData): { found: boolean; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const sentences = page.bodyText.split(/[.!?]+/).filter(s => s.trim().length > 0);

  if (sentences.length === 0) {
    issues.push({
      category: 'clarity',
      message: 'No detectable sentences',
      detail: 'Content appears to have no readable sentences. Generative engines need clear, well-formed sentences to understand and synthesize content.',
      scoreImpact: 20,
    });
    return { found: false, issues };
  }

  // Average sentence length (words)
  const avgSentenceLength = sentences.reduce((sum, s) => sum + s.split(/\s+/).length, 0) / sentences.length;

  // Too long sentences reduce clarity
  const longSentences = sentences.filter(s => s.split(/\s+/).length > 30).length;
  const longSentenceRatio = longSentences / sentences.length;

  if (avgSentenceLength > 25) {
    issues.push({
      category: 'clarity',
      message: 'Sentences are too long',
      detail: `Average sentence is ${Math.round(avgSentenceLength)} words. Generative engines prefer clear, concise sentences (15-20 words). Long sentences are harder to parse and extract information from.`,
      scoreImpact: 12,
    });
  }

  if (longSentenceRatio > 0.3) {
    issues.push({
      category: 'clarity',
      message: 'Too many long sentences',
      detail: `${Math.round(longSentenceRatio * 100)}% of sentences are over 30 words. Break these into shorter, clearer sentences.`,
      scoreImpact: 8,
    });
  }

  // Check for transition words (indicates logical flow)
  const transitionWords = ['however', 'therefore', 'because', 'although', 'meanwhile', 'furthermore', 'additionally', 'consequently', 'for example', 'in contrast'];
  const hasTransitions = transitionWords.some(w => page.bodyText.toLowerCase().includes(w));

  if (!hasTransitions) {
    issues.push({
      category: 'clarity',
      message: 'Lacks transition words',
      detail: 'Transition words help generative engines understand logical relationships between ideas. Use words like "however", "therefore", "because" to improve content coherence.',
      scoreImpact: 5,
    });
  }

  const isClear = avgSentenceLength <= 25 && longSentenceRatio <= 0.3;
  return { found: isClear, issues };
}

// ==========================================
// Check: Factual Density
// ==========================================

function checkFactualDensity(page: CrawledPageData): { found: boolean; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const text = page.bodyText;

  // Count factual indicators
  const numbers = (text.match(/\d+/g) || []).length;
  const percentages = (text.match(/\d+%/g) || []).length;
  const years = (text.match(/\b(19|20)\d{2}\b/g) || []).length;
  const monetaryValues = (text.match(/[$€£]\s*\d+/g) || []).length;

  const factualDensity = (numbers + percentages * 2 + years * 2 + monetaryValues * 2) / Math.max(page.wordCount, 1) * 100;

  if (factualDensity < 0.5) {
    issues.push({
      category: 'factual-density',
      message: 'Low factual density',
      detail: 'Generative engines prefer content with specific facts, statistics, and numbers. Add concrete data points, percentages, years, and measurements to support your claims.',
      scoreImpact: 10,
    });
  }

  return { found: factualDensity >= 0.5, issues };
}

// ==========================================
// Check: Unique Value
// ==========================================

function checkUniqueValue(page: CrawledPageData): { found: boolean; issues: GeoIssue[] } {
  const issues: GeoIssue[] = [];
  const text = page.bodyText.toLowerCase();

  // Check for generic content indicators
  const genericPhrases = [
    'in today\'s world', 'it goes without saying', 'at the end of the day',
    'in this article', 'as we all know', 'it is important to note',
  ];

  const genericCount = genericPhrases.filter(p => text.includes(p)).length;

  if (genericCount >= 3) {
    issues.push({
      category: 'unique-value',
      message: 'Content contains generic phrases',
      detail: 'Generative engines can detect and deprioritize generic content. Replace clichés with specific insights, original data, or unique perspectives.',
      scoreImpact: 10,
    });
  }

  // Check for unique insight indicators
  const uniqueIndicators = [
    'our research', 'our analysis', 'we found', 'according to our',
    'in our experience', 'case study', 'original research', 'data shows',
  ];

  const hasUniqueInsights = uniqueIndicators.some(p => text.includes(p));

  if (!hasUniqueInsights && genericCount > 0) {
    issues.push({
      category: 'unique-value',
      message: 'Content lacks original insights',
      detail: 'Adding original research, case studies, or unique data makes your content more valuable to generative engines. They prioritize content that offers information not available elsewhere.',
      scoreImpact: 8,
    });
  }

  return { found: hasUniqueInsights, issues };
}

// ==========================================
// Main GEO Evaluation
// ==========================================

export function evaluateGEO(page: CrawledPageData): GeoResult {
  const allIssues: GeoIssue[] = [];

  const entities = checkEntities(page);
  allIssues.push(...entities.issues);

  const structuredData = checkStructuredData(page);
  allIssues.push(...structuredData.issues);

  const trustSignals = checkTrustSignals(page);
  allIssues.push(...trustSignals.issues);

  const clarity = checkClarity(page);
  allIssues.push(...clarity.issues);

  const factualDensity = checkFactualDensity(page);
  allIssues.push(...factualDensity.issues);

  const uniqueValue = checkUniqueValue(page);
  allIssues.push(...uniqueValue.issues);

  // Calculate score
  const totalDeduction = allIssues.reduce((sum, issue) => sum + issue.scoreImpact, 0);
  const geoScore = Math.max(0, Math.min(100, 100 - totalDeduction));

  // Identify strengths
  const strengths: string[] = [];
  if (entities.found) strengths.push(`Contains ${entities.entities.technologies.length + entities.entities.brands.length}+ named entities that generative engines can reference`);
  if (structuredData.found) strengths.push('Has structured information (numbers, lists, or comparisons) that AI can parse');
  if (trustSignals.found) strengths.push('Includes trust signals like citations, dates, or references');
  if (clarity.found) strengths.push('Content clarity is good with well-formed, concise sentences');
  if (factualDensity.found) strengths.push('Contains specific facts and data points that AI can extract');
  if (uniqueValue.found) strengths.push('Contains original insights or research that adds unique value');

  // Generate recommendations
  const recommendations: string[] = [];
  if (!entities.found) recommendations.push('Add specific entity mentions: brand names, technology names, people, and places');
  if (!structuredData.found) recommendations.push('Include structured data: statistics, comparisons, tables, or step-by-step instructions');
  if (!trustSignals.found) recommendations.push('Add trust signals: citations, publication dates, author information, and external references');
  if (!clarity.found) recommendations.push('Improve clarity: use shorter sentences (15-20 words) and add transition words');
  if (!factualDensity.found) recommendations.push('Add specific facts: numbers, percentages, dates, and measurements');
  if (!uniqueValue.found) recommendations.push('Add unique insights: original research, case studies, or expert analysis');

  if (recommendations.length === 0) {
    recommendations.push('Your content is well-optimized for generative engines! Continue adding unique insights and fresh data.');
  }

  return {
    url: page.url,
    geoScore,
    issues: allIssues,
    strengths,
    recommendations,
    generativeReadiness: {
      hasEntities: entities.found,
      hasStructuredData: structuredData.found,
      hasTrustSignals: trustSignals.found,
      hasClarity: clarity.found,
      hasFactualDensity: factualDensity.found,
      hasUniqueValue: uniqueValue.found,
    },
  };
}
