/**
 * AEO (Answer Engine Optimization) ENGINE
 *
 * Evaluates if content can be used in answer engines (like Google
 * Featured Snippets, voice search, chat-based search).
 *
 * Checks:
 * - Presence of direct answers
 * - Paragraph length (shorter = better for answer engines)
 * - FAQ sections
 * - Structured headings
 * - List and table usage
 * - Definition-style content
 * - Concise opening sentences
 *
 * Score: 0-100
 *
 * No AI APIs used — purely rule-based analysis.
 */

import type { CrawledPageData } from './crawler-engine';

export interface AeoIssue {
  category: string;
  message: string;
  detail: string;
  scoreImpact: number;
}

export interface AeoResult {
  url: string;
  aeoScore: number;
  issues: AeoIssue[];
  strengths: string[];
  recommendations: string[];
  answerReadiness: {
    hasDirectAnswers: boolean;
    hasFAQ: boolean;
    hasStructuredLists: boolean;
    hasDefinitions: boolean;
    hasConciseParagraphs: boolean;
  };
}

// ==========================================
// Check: Direct Answers
// ==========================================

function checkDirectAnswers(page: CrawledPageData): { found: boolean; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];
  const text = page.bodyText.toLowerCase();

  // Look for patterns that indicate direct answers
  const answerPatterns = [
    /(?:is|are|was|were)\s+(?:defined|known|described)\s+as/,
    /(?:refers?\s+to|means?|is\s+essentially)/,
    /(?:in\s+other\s+words|simply\s+put|basically)/,
    /(?:the\s+answer\s+is|the\s+short\s+answer)/,
    /(?:here'?s?\s+how|steps?\s+to|to\s+do\s+this)/,
  ];

  const hasDirectAnswers = answerPatterns.some(p => p.test(text));

  if (!hasDirectAnswers) {
    issues.push({
      category: 'direct-answers',
      message: 'No direct answer patterns found',
      detail: 'Answer engines look for content that directly answers questions. Start sections with clear, concise definitions or answers before expanding with details.',
      scoreImpact: 20,
    });
  }

  return { found: hasDirectAnswers, issues };
}

// ==========================================
// Check: Paragraph Length
// ==========================================

function checkParagraphLength(page: CrawledPageData): { avgLength: number; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];

  // Split body text into approximate paragraphs
  const paragraphs = page.bodyText
    .split(/\n\n|\r\n\r\n/)
    .filter(p => p.trim().length > 0);

  if (paragraphs.length === 0) {
    issues.push({
      category: 'paragraph-length',
      message: 'No paragraphs found',
      detail: 'Content should be organized into clear paragraphs. Answer engines prefer shorter paragraphs (40-60 words) that directly answer questions.',
      scoreImpact: 15,
    });
    return { avgLength: 0, issues };
  }

  const avgLength = paragraphs.reduce((sum, p) => sum + p.split(/\s+/).length, 0) / paragraphs.length;

  if (avgLength > 100) {
    issues.push({
      category: 'paragraph-length',
      message: 'Paragraphs are too long for answer engines',
      detail: `Average paragraph is ${Math.round(avgLength)} words. Answer engines prefer shorter paragraphs (40-60 words). Break long paragraphs into shorter ones, each covering a single point.`,
      scoreImpact: 15,
    });
  } else if (avgLength > 60) {
    issues.push({
      category: 'paragraph-length',
      message: 'Paragraphs could be shorter',
      detail: `Average paragraph is ${Math.round(avgLength)} words. Aim for 40-60 words per paragraph for optimal answer engine extraction.`,
      scoreImpact: 5,
    });
  }

  return { avgLength, issues };
}

// ==========================================
// Check: FAQ Sections
// ==========================================

function checkFAQ(page: CrawledPageData): { found: boolean; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];
  const text = page.bodyText.toLowerCase();
  const headings = page.headings.map(h => h.toLowerCase());

  // Check for FAQ indicators
  const faqIndicators = [
    text.includes('frequently asked questions'),
    text.includes('faq'),
    headings.some(h => h.includes('faq') || h.includes('frequently asked')),
    (page.bodyText.match(/\?\s*/g) || []).length >= 3, // Multiple questions in content
  ];

  const hasFAQ = faqIndicators.filter(Boolean).length >= 1;

  if (!hasFAQ) {
    issues.push({
      category: 'faq',
      message: 'No FAQ section detected',
      detail: 'FAQ sections are highly valuable for answer engines. They provide direct Q&A pairs that can be extracted as featured snippets or voice search answers.',
      scoreImpact: 15,
    });
  }

  return { found: hasFAQ, issues };
}

// ==========================================
// Check: Structured Lists
// ==========================================

function checkStructuredLists(page: CrawledPageData): { found: boolean; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];
  const text = page.bodyText;

  // Check for list patterns (bullet points, numbered lists)
  const listPatterns = [
    /^[•●○▪▸►]\s+/m,
    /^\d+[.)]\s+/m,
    /^[a-z][.)]\s+/m,
    /(?:first|second|third|finally|lastly),/i,
  ];

  const hasLists = listPatterns.some(p => p.test(text));

  if (!hasLists) {
    issues.push({
      category: 'structured-lists',
      message: 'No structured lists detected',
      detail: 'Answer engines love list-based content. Use numbered or bulleted lists for steps, features, tips, or comparisons. Lists are frequently extracted as featured snippets.',
      scoreImpact: 10,
    });
  }

  return { found: hasLists, issues };
}

// ==========================================
// Check: Definitions
// ==========================================

function checkDefinitions(page: CrawledPageData): { found: boolean; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];
  const text = page.bodyText.toLowerCase();

  // Look for definition patterns
  const definitionPatterns = [
    /(?:is\s+a?\s*(?:type|kind|form|method|process|technique|approach|strategy)\s+of)/,
    /(?:is\s+defined\s+as)/,
    /(?:refers?\s+to)/,
    /(?:—\s*(?:a|an|the)\s)/,  // em-dash definitions
    /(?:means?\s+)/,
  ];

  const hasDefinitions = definitionPatterns.some(p => p.test(text));

  if (!hasDefinitions) {
    issues.push({
      category: 'definitions',
      message: 'No definition-style content found',
      detail: 'Answer engines frequently extract definitions. Include "X is a..." or "X refers to..." patterns in your content to improve answer engine visibility.',
      scoreImpact: 10,
    });
  }

  return { found: hasDefinitions, issues };
}

// ==========================================
// Check: Concise Opening
// ==========================================

function checkConciseOpening(page: CrawledPageData): { found: boolean; issues: AeoIssue[] } {
  const issues: AeoIssue[] = [];

  // Check if the first sentence after H1 is concise (< 30 words) and informative
  const firstSentence = page.bodyText.split(/[.!?]/)[0] || '';
  const wordCount = firstSentence.split(/\s+/).length;

  const isConcise = wordCount > 0 && wordCount <= 40;

  if (!isConcise) {
    issues.push({
      category: 'concise-opening',
      message: 'Opening is not concise',
      detail: 'Answer engines often use the first sentence as a summary. Start with a clear, concise sentence (under 30 words) that directly states what the page is about.',
      scoreImpact: 10,
    });
  }

  return { found: isConcise, issues };
}

// ==========================================
// Main AEO Evaluation
// ==========================================

export function evaluateAEO(page: CrawledPageData): AeoResult {
  const allIssues: AeoIssue[] = [];

  const directAnswers = checkDirectAnswers(page);
  allIssues.push(...directAnswers.issues);

  const paragraphLength = checkParagraphLength(page);
  allIssues.push(...paragraphLength.issues);

  const faq = checkFAQ(page);
  allIssues.push(...faq.issues);

  const structuredLists = checkStructuredLists(page);
  allIssues.push(...structuredLists.issues);

  const definitions = checkDefinitions(page);
  allIssues.push(...definitions.issues);

  const conciseOpening = checkConciseOpening(page);
  allIssues.push(...conciseOpening.issues);

  // Calculate score
  const totalDeduction = allIssues.reduce((sum, issue) => sum + issue.scoreImpact, 0);
  const aeoScore = Math.max(0, Math.min(100, 100 - totalDeduction));

  // Identify strengths
  const strengths: string[] = [];
  if (directAnswers.found) strengths.push('Contains direct answer patterns that answer engines can extract');
  if (faq.found) strengths.push('Has FAQ-style content that is ideal for answer engines');
  if (structuredLists.found) strengths.push('Uses structured lists which are often featured in snippets');
  if (definitions.found) strengths.push('Includes definition-style content suitable for knowledge panels');
  if (conciseOpening.found) strengths.push('Has a concise opening sentence ideal for summaries');
  if (paragraphLength.avgLength > 0 && paragraphLength.avgLength <= 60) {
    strengths.push('Paragraphs are optimally sized for answer engine extraction');
  }

  // Generate recommendations
  const recommendations: string[] = [];
  if (!directAnswers.found) recommendations.push('Add direct answer statements at the beginning of sections (e.g., "X is a type of Y that does Z")');
  if (!faq.found) recommendations.push('Add an FAQ section with 3-5 common questions and concise answers');
  if (!structuredLists.found) recommendations.push('Use numbered or bulleted lists for steps, features, or comparisons');
  if (!definitions.found) recommendations.push('Include clear definitions using "X is..." or "X refers to..." patterns');
  if (!conciseOpening.found) recommendations.push('Start with a clear, concise sentence (under 30 words) summarizing the page topic');
  if (paragraphLength.avgLength > 60) recommendations.push('Break long paragraphs into shorter ones (40-60 words each)');

  if (recommendations.length === 0) {
    recommendations.push('Your content is well-optimized for answer engines! Continue monitoring and refining.');
  }

  return {
    url: page.url,
    aeoScore,
    issues: allIssues,
    strengths,
    recommendations,
    answerReadiness: {
      hasDirectAnswers: directAnswers.found,
      hasFAQ: faq.found,
      hasStructuredLists: structuredLists.found,
      hasDefinitions: definitions.found,
      hasConciseParagraphs: paragraphLength.avgLength > 0 && paragraphLength.avgLength <= 60,
    },
  };
}
