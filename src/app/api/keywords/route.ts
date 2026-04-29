/**
 * API Route: Keyword Discovery
 * POST /api/keywords
 *
 * Body: { keyword: string, options?: { useGoogleSuggest, usePeopleAlsoAsk, useRelatedSearches, useExpansion, useQuestions } }
 * Returns: KeywordResult[]
 */

import { NextRequest, NextResponse } from 'next/server';
import { discoverKeywords } from '@/lib/engines/keyword-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, options } = body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a keyword' },
        { status: 400 }
      );
    }

    const results = await discoverKeywords(keyword.trim(), options);
    return NextResponse.json({ results });
  } catch (error) {
    console.error('Keyword discovery error:', error);
    return NextResponse.json(
      { error: 'Failed to discover keywords. Please try again.' },
      { status: 500 }
    );
  }
}
