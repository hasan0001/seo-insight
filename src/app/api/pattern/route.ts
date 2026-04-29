/**
 * API Route: Pattern Analysis
 * POST /api/pattern
 *
 * Body: { keyword: string, serpResults: SerpItem[], yourPage?: CrawledPageData }
 * Returns: PatternAnalysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { analyzePatterns } from '@/lib/engines/pattern-engine';
import type { SerpItem } from '@/lib/engines/serp-engine';
import type { CrawledPageData } from '@/lib/engines/crawler-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, serpResults, yourPage } = body as {
      keyword: string;
      serpResults: SerpItem[];
      yourPage?: CrawledPageData;
    };

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a keyword' },
        { status: 400 }
      );
    }

    if (!serpResults || !Array.isArray(serpResults)) {
      return NextResponse.json(
        { error: 'Please provide SERP results' },
        { status: 400 }
      );
    }

    const analysis = analyzePatterns(keyword, serpResults, yourPage);
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Pattern analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze patterns. Please try again.' },
      { status: 500 }
    );
  }
}
