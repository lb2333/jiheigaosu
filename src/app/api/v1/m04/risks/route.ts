import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { safetyHazards, safetyRiskPoints } from '@/db/schema/domains/m04';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const category = searchParams.get('category') || 'all';
  const level = searchParams.get('level') || 'all';
  const q = (searchParams.get('q') || '').trim().toLowerCase();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 5;

  const scopeFilter = sectionId && sectionId !== 'all' ? eq(safetyRiskPoints.sectionId, sectionId) : undefined;

  const [allInScope, allHazards] = await Promise.all([
    db
      .select()
      .from(safetyRiskPoints)
      .where(scopeFilter)
      .orderBy(asc(safetyRiskPoints.sortOrder)),
    db
      .select()
      .from(safetyHazards)
      .where(sectionId && sectionId !== 'all' ? eq(safetyHazards.sectionId, sectionId) : undefined)
      .orderBy(asc(safetyHazards.sortOrder), desc(safetyHazards.createdAt)),
  ]);

  const levelCounts = {
    重大: 0,
    较大: 0,
    一般: 0,
    低风险: 0,
  };
  for (const r of allInScope) {
    if (r.level in levelCounts) {
      levelCounts[r.level as keyof typeof levelCounts] += 1;
    }
  }

  const filtered = allInScope.filter((r) => {
    if (category !== 'all' && r.category !== category) return false;
    if (level !== 'all' && r.level !== level) return false;
    if (q) {
      const hay = `${r.id} ${r.name} ${r.location} ${r.category} ${r.unit}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const unclosedHazards = allHazards.filter((h) => h.status !== '已销项').slice(0, 6);

  return NextResponse.json({
    risks: filtered,
    allInScope,
    levelCounts,
    total: filtered.length,
    page: safePage,
    totalPages,
    pageItems,
    unclosedHazards,
    allHazards,
  });
}
