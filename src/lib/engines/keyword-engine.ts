/**
 * KEYWORD DISCOVERY ENGINE
 *
 * This engine generates keyword ideas WITHOUT any paid APIs.
 * It uses:
 * 1. Google Suggest (autocomplete) - free, returns JSON
 * 2. Prefix + Suffix expansion
 * 3. Question-based generation (who, what, why, how, where, when)
 * 4. Keyword clustering using simple word overlap
 */

// ==========================================
// 1. Google Suggest (Autocomplete) Scraper
// ==========================================

export async function fetchGoogleSuggestions(query: string): Promise<string[]> {
  try {
    const url = `https://suggestqueries.google.com/complete/search?client=firefox&q=${encodeURIComponent(query)}`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      },
      signal: AbortSignal.timeout(8000),
    });
    const data = await response.json();
    if (Array.isArray(data) && Array.isArray(data[1])) {
      return data[1] as string[];
    }
    return [];
  } catch {
    return [];
  }
}

// ==========================================
// 2. Google "People Also Ask" Scraper
// ==========================================

export async function fetchPeopleAlsoAsk(query: string): Promise<string[]> {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();

    const { load } = await import('cheerio');
    const $ = load(html);

    const questions: string[] = [];
    $('[data-q]').each((_, el) => {
      const q = $(el).attr('data-q');
      if (q && q.trim()) questions.push(q.trim());
    });

    // Fallback: look for related questions in different selectors
    if (questions.length === 0) {
      $('.related-question-pair').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.endsWith('?')) questions.push(text);
      });
    }

    return [...new Set(questions)].slice(0, 10);
  } catch {
    return [];
  }
}

// ==========================================
// 3. Google Related Searches Scraper
// ==========================================

export async function fetchRelatedSearches(query: string): Promise<string[]> {
  try {
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}&hl=en`;
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });
    const html = await response.text();

    const { load } = await import('cheerio');
    const $ = load(html);

    const related: string[] = [];
    // Google puts related searches in specific divs
    $('[data-attrid="OmGyqSbHT0iZUc"] a, .F3a6qSbHT0iZUc a, [role="listitem"] a').each((_, el) => {
      const text = $(el).text().trim();
      if (text && text.length > 3) related.push(text);
    });

    // Alternative selector
    if (related.length === 0) {
      $('#bres .LHJvCe a').each((_, el) => {
        const text = $(el).text().trim();
        if (text && text.length > 3) related.push(text);
      });
    }

    return [...new Set(related)].slice(0, 10);
  } catch {
    return [];
  }
}

// ==========================================
// 4. Prefix + Suffix Expansion
// ==========================================

const PREFIXES = [
  'best', 'top', 'how to', 'why', 'what is', 'free', 'cheap',
  'new', 'easy', 'simple', 'ultimate', 'complete', 'guide to',
];

const SUFFIXES = [
  'guide', 'tutorial', 'tips', 'tricks', 'review', 'vs',
  'alternatives', 'for beginners', 'examples', 'tools',
  'software', 'online', 'free', '2024', '2025',
];

export function expandWithPrefixSuffix(keyword: string): string[] {
  const results: string[] = [];

  for (const prefix of PREFIXES) {
    results.push(`${prefix} ${keyword}`);
  }

  for (const suffix of SUFFIXES) {
    results.push(`${keyword} ${suffix}`);
  }

  return results;
}

// ==========================================
// 5. Question-Based Generation
// ==========================================

const QUESTION_STARTERS = [
  'how', 'what', 'why', 'when', 'where', 'who', 'which', 'can', 'does', 'is',
];

export function generateQuestionKeywords(keyword: string): string[] {
  const results: string[] = [];

  for (const starter of QUESTION_STARTERS) {
    results.push(`${starter} ${keyword}`);
  }

  // Add common question patterns
  results.push(`how to use ${keyword}`);
  results.push(`how does ${keyword} work`);
  results.push(`what are the benefits of ${keyword}`);
  results.push(`why is ${keyword} important`);
  results.push(`is ${keyword} worth it`);
  results.push(`can ${keyword} help with`);
  results.push(`${keyword} vs`);
  results.push(`${keyword} or`);

  return results;
}

// ==========================================
// 6. Keyword Clustering (No AI/Embeddings)
// ==========================================

/**
 * Clusters keywords by word overlap.
 * Two keywords belong to the same cluster if they share
 * at least `minOverlap` words in common.
 */
export function clusterKeywords(keywords: string[], minOverlap: number = 1): Map<string, string[]> {
  const clusters = new Map<string, string[]>();
  const assigned = new Set<number>();

  for (let i = 0; i < keywords.length; i++) {
    if (assigned.has(i)) continue;

    const wordsI = new Set(keywords[i].toLowerCase().split(/\s+/));
    const cluster: string[] = [keywords[i]];
    assigned.add(i);

    for (let j = i + 1; j < keywords.length; j++) {
      if (assigned.has(j)) continue;

      const wordsJ = new Set(keywords[j].toLowerCase().split(/\s+/));
      const overlap = [...wordsI].filter(w => wordsJ.has(w)).length;

      if (overlap >= minOverlap) {
        cluster.push(keywords[j]);
        assigned.add(j);
      }
    }

    // Use first keyword as cluster name
    clusters.set(keywords[i], cluster);
  }

  return clusters;
}

// ==========================================
// 7. Difficulty Estimation (Heuristic)
// ==========================================

/**
 * Estimates keyword difficulty based on simple heuristics:
 * - Shorter keywords = harder (more competition)
 * - Common words = harder
 * - Question keywords = easier (long-tail)
 * - Brand-specific = easier
 */
export function estimateDifficulty(keyword: string): { score: number; label: string } {
  let score = 50;
  const words = keyword.toLowerCase().split(/\s+/);
  const wordCount = words.length;

  // Shorter keywords are harder
  if (wordCount <= 2) score += 30;
  else if (wordCount <= 3) score += 15;
  else if (wordCount >= 5) score -= 15;

  // Question keywords are easier (long-tail)
  if (/^(how|what|why|when|where|who|which)/.test(keyword.toLowerCase())) {
    score -= 20;
  }

  // Common high-competition words
  const competitiveWords = ['best', 'top', 'free', 'cheap', 'review'];
  const hasCompetitive = words.some(w => competitiveWords.includes(w));
  if (hasCompetitive) score += 10;

  // Clamp to 0-100
  score = Math.max(0, Math.min(100, score));

  let label = 'medium';
  if (score <= 30) label = 'easy';
  else if (score <= 60) label = 'medium';
  else if (score <= 80) label = 'hard';
  else label = 'very hard';

  return { score, label };
}

// ==========================================
// 8. Main Keyword Discovery Function
// ==========================================

export interface KeywordResult {
  keyword: string;
  source: string;
  difficulty: { score: number; label: string };
  cluster?: string;
}

export async function discoverKeywords(
  seedKeyword: string,
  options: {
    useGoogleSuggest?: boolean;
    usePeopleAlsoAsk?: boolean;
    useRelatedSearches?: boolean;
    useExpansion?: boolean;
    useQuestions?: boolean;
  } = {}
): Promise<KeywordResult[]> {
  const {
    useGoogleSuggest = true,
    usePeopleAlsoAsk = true,
    useRelatedSearches = true,
    useExpansion = true,
    useQuestions = true,
  } = options;

  const allKeywords: KeywordResult[] = [];

  // Add the seed keyword
  allKeywords.push({
    keyword: seedKeyword,
    source: 'seed',
    difficulty: estimateDifficulty(seedKeyword),
  });

  // 1. Google Suggest
  if (useGoogleSuggest) {
    const suggestions = await fetchGoogleSuggestions(seedKeyword);
    for (const kw of suggestions) {
      allKeywords.push({
        keyword: kw,
        source: 'google-suggest',
        difficulty: estimateDifficulty(kw),
      });
    }
  }

  // 2. People Also Ask
  if (usePeopleAlsoAsk) {
    const paa = await fetchPeopleAlsoAsk(seedKeyword);
    for (const kw of paa) {
      allKeywords.push({
        keyword: kw,
        source: 'people-also-ask',
        difficulty: estimateDifficulty(kw),
      });
    }
  }

  // 3. Related Searches
  if (useRelatedSearches) {
    const related = await fetchRelatedSearches(seedKeyword);
    for (const kw of related) {
      allKeywords.push({
        keyword: kw,
        source: 'related-searches',
        difficulty: estimateDifficulty(kw),
      });
    }
  }

  // 4. Prefix/Suffix Expansion
  if (useExpansion) {
    const expanded = expandWithPrefixSuffix(seedKeyword);
    for (const kw of expanded) {
      allKeywords.push({
        keyword: kw,
        source: 'expansion',
        difficulty: estimateDifficulty(kw),
      });
    }
  }

  // 5. Question-Based
  if (useQuestions) {
    const questions = generateQuestionKeywords(seedKeyword);
    for (const kw of questions) {
      allKeywords.push({
        keyword: kw,
        source: 'question',
        difficulty: estimateDifficulty(kw),
      });
    }
  }

  // Deduplicate
  const seen = new Set<string>();
  const unique: KeywordResult[] = [];
  for (const kw of allKeywords) {
    const lower = kw.keyword.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      unique.push(kw);
    }
  }

  // Cluster
  const keywordStrings = unique.map(k => k.keyword);
  const clusters = clusterKeywords(keywordStrings);

  for (const kw of unique) {
    for (const [clusterName, members] of clusters) {
      if (members.includes(kw.keyword)) {
        kw.cluster = clusterName;
        break;
      }
    }
  }

  return unique;
}
