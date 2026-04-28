/**
 * API Route: Backlink Strategy
 * POST /api/backlinks
 *
 * Body: { keyword: string, serpResults: SerpItem[] }
 * Returns: BacklinkStrategy
 */

import { NextRequest, NextResponse } from 'next/server';
import { generateBacklinkStrategy } from '@/lib/engines/backlink-engine';
import type { SerpItem } from '@/lib/engines/serp-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { keyword, serpResults } = body as { keyword: string; serpResults: SerpItem[] };

    if (!keyword || typeof keyword !== 'string') {
      return NextResponse.json(
        { error: 'Please provide a keyword' },
        { status: 400 }
      );
    }

    if (!serpResults || !Array.isArray(serpResults) || serpResults.length === 0) {
      return NextResponse.json(
        { error: 'Please provide SERP results (run a SERP analysis first)' },
        { status: 400 }
      );
    }

    const strategy = generateBacklinkStrategy(keyword, serpResults);
    return NextResponse.json(strategy);
  } catch (error) {
    console.error('Backlink strategy error:', error);
    return NextResponse.json(
      { error: 'Failed to generate backlink strategy. Please try again.' },
      { status: 500 }
    );
  }
}
