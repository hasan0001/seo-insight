/**
 * API Route: Full SEO + AEO + GEO Audit
 * POST /api/audit
 *
 * Body: { pages: CrawledPageData[] }
 * Returns: { seo: SiteAuditResult, aeo: AeoResult[], geo: GeoResult[] }
 */

import { NextRequest, NextResponse } from 'next/server';
import { auditSite, auditPage } from '@/lib/engines/seo-audit-engine';
import { evaluateAEO } from '@/lib/engines/aeo-engine';
import { evaluateGEO } from '@/lib/engines/geo-engine';
import type { CrawledPageData } from '@/lib/engines/crawler-engine';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { pages } = body as { pages: CrawledPageData[] };

    if (!pages || !Array.isArray(pages) || pages.length === 0) {
      return NextResponse.json(
        { error: 'No pages provided for audit' },
        { status: 400 }
      );
    }

    // SEO Audit
    const seo = auditSite(pages);

    // AEO Evaluation
    const aeo = pages.map(page => evaluateAEO(page));

    // GEO Evaluation
    const geo = pages.map(page => evaluateGEO(page));

    return NextResponse.json({ seo, aeo, geo });
  } catch (error) {
    console.error('Audit error:', error);
    return NextResponse.json(
      { error: 'Failed to perform audit. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * Also support single-page audit
 * POST /api/audit with { page: CrawledPageData, allPages: CrawledPageData[] }
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { page, allPages } = body;

    if (!page) {
      return NextResponse.json(
        { error: 'No page provided for audit' },
        { status: 400 }
      );
    }

    const seo = auditPage(page, allPages || [page]);
    const aeo = evaluateAEO(page);
    const geo = evaluateGEO(page);

    return NextResponse.json({ seo, aeo, geo });
  } catch (error) {
    console.error('Single page audit error:', error);
    return NextResponse.json(
      { error: 'Failed to audit page. Please try again.' },
      { status: 500 }
    );
  }
}
