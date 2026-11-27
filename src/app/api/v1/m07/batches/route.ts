import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { materialArrivalBatches, materialYards } from '@/db/schema/domains/m07';
import { requireM07Session } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireM07Session();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionIdParam = searchParams.get('sectionId') || '';
  const yardIdParam = searchParams.get('yardId') || '';
  const category = searchParams.get('category') || '';
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const [yards, allBatches] = await Promise.all([
    db.select().from(materialYards).orderBy(asc(materialYards.sortOrder)),
    db.select().from(materialArrivalBatches).orderBy(asc(materialArrivalBatches.sortOrder)),
  ]);

  const yardById = Object.fromEntries(yards.map((y) => [y.id, y]));
  const yardBySec = Object.fromEntries(yards.map((y) => [y.sectionId, y]));

  const targetYard =
    yards.find((y) => y.id === yardIdParam || y.name === yardIdParam) ??
    (sectionIdParam && sectionIdParam !== 'all' ? yardBySec[sectionIdParam] : undefined);

  const enriched = allBatches.map((b) => {
    const yard = yardById[b.yardId] ?? yardBySec[b.sectionId];
    return {
      ...b,
      sectionName: yard?.sectionName ?? b.sectionId,
      yardName: yard?.name ?? '',
    };
  });

  const filtered = enriched.filter((b) => {
    if (targetYard) {
      if (b.yardId !== targetYard.id) return false;
    } else if (sectionIdParam && sectionIdParam !== 'all' && b.sectionId !== sectionIdParam) {
      return false;
    }
    if (category && category !== 'all' && b.material !== category) return false;
    if (q) {
      const hay = `${b.batchId} ${b.material} ${b.reportId} ${b.supplier} ${b.plateNo}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({
    yards,
    currentYard: targetYard ?? yardBySec['sec2'] ?? yards[0] ?? null,
    total: filtered.length,
    batches: filtered,
  });
}
