import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { materialInventoryItems, materialYards } from '@/db/schema/domains/m07';
import {
  MATERIAL_TYPES,
  getPeriodObj,
  type MaterialFocusAlert,
} from '@/modules/m07_material/types';
import { requireM07Session } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireM07Session();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const yardId = searchParams.get('yardId') || '';
  const category = searchParams.get('category') || '';
  const period = searchParams.get('period') || '2026年11月';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = Math.max(1, Math.min(50, Number.parseInt(searchParams.get('pageSize') || '5', 10) || 5));

  const [yards, periodRows] = await Promise.all([
    db.select().from(materialYards).orderBy(asc(materialYards.sortOrder)),
    db
      .select()
      .from(materialInventoryItems)
      .where(eq(materialInventoryItems.period, period))
      .orderBy(asc(materialInventoryItems.sortOrder)),
  ]);

  const yardBySec = Object.fromEntries(yards.map((y) => [y.sectionId, y]));
  const allPeriodItems = periodRows.map((row) => ({
    ...row,
    sectionName: yardBySec[row.sectionId]?.sectionName ?? row.sectionId,
  }));

  const secYardItems = allPeriodItems.filter((it) => {
    if (sectionId && sectionId !== 'all' && it.sectionId !== sectionId) return false;
    if (yardId && yardId !== 'all' && it.yardId !== yardId && it.yardName !== yardId) return false;
    return true;
  });

  const filtered = secYardItems.filter((it) => {
    if (category && category !== 'all' && it.material !== category) return false;
    return true;
  });

  const kpis = {
    planQty: filtered.reduce((acc, r) => acc + r.planQty, 0),
    arrivalQty: filtered.reduce((acc, r) => acc + r.arrivalQty, 0),
    physicalQty: filtered.reduce((acc, r) => acc + r.physicalQty, 0),
    usableQty: filtered.reduce((acc, r) => acc + r.usableQty, 0),
    gapQty: filtered.reduce((acc, r) => acc + r.gapQty, 0),
    pendingBatches: filtered.reduce((acc, r) => acc + (r.batchCounts?.pending ?? 0), 0),
    passBatches: filtered.reduce((acc, r) => acc + (r.batchCounts?.pass ?? 0), 0),
    recheckBatches: filtered.reduce((acc, r) => acc + (r.batchCounts?.recheck ?? 0), 0),
    failBatches: filtered.reduce((acc, r) => acc + (r.batchCounts?.fail ?? 0), 0),
  };

  const sectionBars = yards.map((y) => {
    const items = allPeriodItems.filter((it) => it.sectionId === y.sectionId);
    const planW = items.reduce((a, b) => a + b.planQty, 0) / 10000;
    const arrivalW = items.reduce((a, b) => a + b.arrivalQty, 0) / 10000;
    return {
      sectionId: y.sectionId,
      sectionName: y.sectionName,
      planW: Number(planW.toFixed(2)),
      arrivalW: Number(arrivalW.toFixed(2)),
    };
  });

  const donutGapTotal = secYardItems.reduce((a, b) => a + b.gapQty, 0);
  const gapBreakdown = MATERIAL_TYPES.map((m) => {
    const value = secYardItems
      .filter((it) => it.material === m.name)
      .reduce((a, b) => a + b.gapQty, 0);
    return {
      name: m.name,
      value,
      color: m.color,
      pct: donutGapTotal > 0 ? ((value / donutGapTotal) * 100).toFixed(1) : '0.0',
    };
  });

  const batchTotal =
    kpis.passBatches + kpis.pendingBatches + kpis.recheckBatches + kpis.failBatches;
  const batchSegments = [
    {
      name: '检验合格',
      value: kpis.passBatches,
      color: '#22c55e',
      pct: batchTotal ? ((kpis.passBatches / batchTotal) * 100).toFixed(1) : '0.0',
    },
    {
      name: '待检',
      value: kpis.pendingBatches,
      color: '#facc15',
      pct: batchTotal ? ((kpis.pendingBatches / batchTotal) * 100).toFixed(1) : '0.0',
    },
    {
      name: '复检中',
      value: kpis.recheckBatches,
      color: '#38bdf8',
      pct: batchTotal ? ((kpis.recheckBatches / batchTotal) * 100).toFixed(1) : '0.0',
    },
    {
      name: '不合格',
      value: kpis.failBatches,
      color: '#f87171',
      pct: batchTotal ? ((kpis.failBatches / batchTotal) * 100).toFixed(1) : '0.0',
    },
  ];

  const sec2Stone = allPeriodItems.find((r) => r.baseId === 'inv-sec2-ss');
  const sec4Stone = allPeriodItems.find((r) => r.baseId === 'inv-sec4-ss');
  const allFocusAlerts: MaterialFocusAlert[] = [
    {
      id: 'fa1',
      sectionId: 'sec2',
      material: '碎石',
      title: '二工区 · 碎石缺口',
      sub: `料场示例A 缺口 ${(sec2Stone?.gapQty ?? 3250).toLocaleString('en-US')} t`,
      btnText: '查缺口',
      kind: 'warn',
      action: 'yard',
    },
    {
      id: 'fa2',
      sectionId: 'sec4',
      material: '碎石',
      title: '四工区 · 碎石缺口',
      sub: `料场示例B 缺口 ${(sec4Stone?.gapQty ?? 2750).toLocaleString('en-US')} t`,
      btnText: '查缺口',
      kind: 'warn',
      action: 'yard',
    },
    {
      id: 'fa3',
      sectionId: 'sec2',
      material: '钢筋',
      title: '二工区 · 钢筋隔离',
      sub: '料场示例A 隔离 40 t',
      btnText: '查检验',
      kind: 'danger',
      action: 'inspect',
      batchId: 'BM-JC-20261125-006',
    },
  ];
  const focusAlerts = allFocusAlerts.filter(
    (a) => !sectionId || sectionId === 'all' || a.sectionId === sectionId
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = filtered.slice((safePage - 1) * pageSize, safePage * pageSize);

  const periodObj = getPeriodObj(period);

  return NextResponse.json({
    period,
    cutoff: periodObj.cutoff,
    syncTime: periodObj.sync,
    yards,
    kpis,
    sectionBars,
    gapBreakdown,
    donutGapTotal,
    batchSegments,
    batchTotal,
    focusAlerts,
    total: filtered.length,
    page: safePage,
    pageSize,
    totalPages,
    items,
  });
}
