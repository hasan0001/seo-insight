/**
 * API Route: Website Crawler
 * POST /api/crawl
 *
 * Body: { url: string, maxPages?: number, maxDepth?: number }
 * Returns: CrawlResult
 */

import { NextRequest, NextResponse } from 'next/server';
import { crawlWebsite } from '@/lib/engines/crawler-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url, maxPages, maxDepth } = body;

    if (!url || typeof url !== 'string' || url.trim().length === 0) {
      return NextResponse.json(
        { error: 'Please provide a valid URL' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url.trim());
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format. Please include http:// or https://' },
        { status: 400 }
      );
    }

    const result = await crawlWebsite(url.trim(), {
      maxPages: maxPages || 20,
      maxDepth: maxDepth || 2,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Crawl error:', error);
    return NextResponse.json(
      { error: 'Failed to crawl website. Please check the URL and try again.' },
      { status: 500 }
    );
  }
}
