/**
 * API Route: SERP Analysis
 * POST /api/serp
 *
 * Body: { keyword: string }
 * Returns: SerpAnalysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { scrapeSerp } from '@/lib/engines/serp-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword } = body;

    if (!keyword || typeof keyword !== 'string' || keyword.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a keyword' },
        { status: 400 }
      );
    }

    const analysis = await scrapeSerp(keyword.trim());
    return NextResponse.json(analysis);
  } catch (error) {
    console.error('SERP analysis error:', error);
    return NextResponse.json(
      { error: 'Failed to analyze SERP. Google may be blocking requests. Please try again later.' },
      { status: 500 }
    );
  }
}
