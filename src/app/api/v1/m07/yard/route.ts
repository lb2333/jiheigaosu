import { NextRequest, NextResponse } from 'next/server';
import { and, asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  materialInventoryItems,
  materialReports,
  materialYards,
} from '@/db/schema/domains/m07';
import { getPeriodObj } from '@/modules/m07_material/types';
import { requireM07Session } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireM07Session();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionIdParam = searchParams.get('sectionId') || '';
  const yardIdParam = searchParams.get('yardId') || '';
  const category = searchParams.get('category') || '';
  const period = searchParams.get('period') || '2026年11月';

  const yards = await db.select().from(materialYards).orderBy(asc(materialYards.sortOrder));
  const selectedYard =
    yards.find((y) => y.id === yardIdParam || y.name === yardIdParam) ??
    yards.find((y) => y.sectionId === sectionIdParam) ??
    yards.find((y) => y.sectionId === 'sec2') ??
    yards[0];

  if (!selectedYard) {
    return NextResponse.json({ error: '未找到料场基础数据' }, { status: 404 });
  }

  const [allYardItems, [report]] = await Promise.all([
    db
      .select()
      .from(materialInventoryItems)
      .where(
        and(
          eq(materialInventoryItems.period, period),
          eq(materialInventoryItems.yardId, selectedYard.id)
        )
      )
      .orderBy(asc(materialInventoryItems.sortOrder)),
    db
      .select()
      .from(materialReports)
      .where(eq(materialReports.yardId, selectedYard.id))
      .limit(1),
  ]);

  const enrichedAll = allYardItems.map((it) => ({
    ...it,
    sectionName: selectedYard.sectionName,
  }));

  const items = enrichedAll.filter(
    (it) => !category || category === 'all' || it.material === category
  );

  const kpis = {
    planQty: items.reduce((a, b) => a + b.planQty, 0),
    arrivalQty: items.reduce((a, b) => a + b.arrivalQty, 0),
    physicalQty: items.reduce((a, b) => a + b.physicalQty, 0),
    usableQty: items.reduce((a, b) => a + b.usableQty, 0),
    gapQty: items.reduce((a, b) => a + b.gapQty, 0),
    categoryCount: items.length,
  };

  const topGapItem = [...enrichedAll].sort((a, b) => b.gapQty - a.gapQty)[0] ?? null;
  const periodObj = getPeriodObj(period);

  return NextResponse.json({
    period,
    cutoff: periodObj.cutoff,
    yard: selectedYard,
    yards,
    report: report ?? null,
    activeVersion:
      report && report.confirmStatus === '已确认' ? report.version : selectedYard.activeVer,
    kpis,
    topGapItem,
    items,
  });
}
