import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { PRIVATE_CACHE_HEADERS } from '@/lib/api/auth-guard';
import { db } from '@/db';
import { workSections } from '@/db/schema/core';
import {
  progressCategoryStats,
  progressDetailItems,
  progressTrendPoints,
} from '@/db/schema/domains/m02';

const VALID_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

const MONTH_FACTORS: Record<string, number> = {
  '2026-06': 0.677,
  '2026-07': 0.733,
  '2026-08': 0.801,
  '2026-09': 0.875,
  '2026-10': 0.928,
  '2026-11': 1.0,
};

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const rawSection = sp.get('sectionId') || 'all';
  const sectionId = rawSection === '' ? 'all' : rawSection;
  const category = sp.get('category') || 'all';
  const rawMonth = sp.get('month') || '2026-11';
  const month = VALID_MONTHS.includes(rawMonth) ? rawMonth : '2026-11';
  const page = Math.max(1, Number(sp.get('page') || '1') || 1);
  const rawPageSize = sp.get('pageSize') || '6';
  const showAll = rawPageSize === 'all';
  const pageSize = showAll ? 100 : Math.max(1, Math.min(50, Number(rawPageSize) || 6));

  const [sections, allPeriodCatRows, trendRows, allDetailRows] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db
      .select()
      .from(progressCategoryStats)
      .where(eq(progressCategoryStats.period, month))
      .orderBy(asc(progressCategoryStats.sortOrder)),
    db
      .select()
      .from(progressTrendPoints)
      .where(eq(progressTrendPoints.sectionId, sectionId))
      .orderBy(asc(progressTrendPoints.sortOrder)),
    db
      .select()
      .from(progressDetailItems)
      .where(eq(progressDetailItems.itemScope, 'overview'))
      .orderBy(asc(progressDetailItems.sortOrder)),
  ]);

  const kpiRows = allPeriodCatRows.filter((r) => r.sectionId === sectionId);

  // Build section progress matrix
  const matrixRows = sections.map((sec) => {
    const secCats = allPeriodCatRows.filter((r) => r.sectionId === sec.id);
    return {
      sectionId: sec.id,
      sectionName: sec.name,
      values: secCats.map((c) => ({
        categoryKey: c.categoryKey,
        categoryName: c.categoryName,
        pct: c.pct,
      })),
    };
  });

  const allLineCats = allPeriodCatRows.filter((r) => r.sectionId === 'all');
  const allLineValues = allLineCats.map((c) => ({
    categoryKey: c.categoryKey,
    categoryName: c.categoryName,
    pct: c.pct,
  }));

  // Summary trend stats for selected month
  const currentTrend = trendRows.find((t) => t.period === month) ?? trendRows[trendRows.length - 1];
  const trendSummary = {
    totalQty: currentTrend?.totalQty ?? (sectionId === 'all' ? 5872.0 : 1010.0),
    periodQty: currentTrend?.periodQty ?? 179.6,
    cumQty: currentTrend?.cumQty ?? 2729.8,
  };

  // Filter detail rows
  const factor = MONTH_FACTORS[month] ?? 1;
  const filteredDetails = allDetailRows
    .filter((r) => {
      if (sectionId !== 'all' && r.sectionId !== sectionId) return false;
      if (category !== 'all' && r.category !== category) return false;
      return true;
    })
    .map((r) => ({
      ...r,
      pct: +(r.pct * factor).toFixed(1),
      dueDate: `${month}-20`,
    }));

  const totalDetails = filteredDetails.length;
  const totalPages = Math.max(1, Math.ceil(totalDetails / pageSize));
  const safePage = Math.min(page, totalPages);
  const pagedDetails = showAll
    ? filteredDetails
    : filteredDetails.slice((safePage - 1) * pageSize, safePage * pageSize);

  return NextResponse.json(
    {
      month,
      sectionId,
      category,
      sections: sections.map((s) => ({ id: s.id, name: s.name, stakeRange: s.stakeRange })),
      kpis: kpiRows,
      matrix: {
        rows: matrixRows,
        allLine: allLineValues,
      },
      trend: {
        summary: trendSummary,
        points: trendRows,
      },
      details: {
        rows: pagedDetails,
        total: totalDetails,
        page: safePage,
        pageSize,
        totalPages,
      },
    },
    { headers: PRIVATE_CACHE_HEADERS }
  );
}
