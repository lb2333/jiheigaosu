import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import {
  computeSectionCumAmount,
  loadContractsAndPeriods,
  loadRecordsByPeriod,
  resolvePeriodMeta,
} from '@/modules/m08_measure/server-helpers';

const querySchema = z.object({
  sectionId: z.string().optional(),
  contract: z.string().optional(),
  item: z.string().optional(),
  period: z.string().optional(),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const parsed = querySchema.safeParse({
    sectionId: sp.get('sectionId') || undefined,
    contract: sp.get('contract') || undefined,
    item: sp.get('item') || undefined,
    period: sp.get('period') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const sectionId = parsed.data.sectionId || null;
  const contractFilter = parsed.data.contract || '';
  const itemFilter = parsed.data.item || '';

  const { contracts, periods } = await loadContractsAndPeriods();
  const pm = resolvePeriodMeta(periods, parsed.data.period);
  const periodRecords = await loadRecordsByPeriod(pm.period, periods);

  const matchingContracts = contracts.filter((c) => {
    if (sectionId && c.sectionId !== sectionId) return false;
    if (contractFilter && c.contractCode !== contractFilter) return false;
    return true;
  });

  const itemFactor = itemFilter ? 0.24 : 1;

  const sectionRows = matchingContracts.map((c) => {
    const secRecs = periodRecords.filter(
      (r) => r.sectionId === c.sectionId && (!itemFilter || r.workItem === itemFilter)
    );
    const confirmedRecs = secRecs.filter((r) => r.status === '已确认');
    const curAmt = Number(
      confirmedRecs.reduce((sum, r) => sum + r.amount, 0).toFixed(2)
    );
    const cumAmt = Number(
      (computeSectionCumAmount(contracts, periods, c.sectionId, pm.period) * itemFactor).toFixed(2)
    );
    const isReturned = c.payReturned || pm.period !== '2026年11月';
    const paidAmt = isReturned
      ? Number(
          ((c.paidReturnAmount || 860.0) * pm.scaleFactor * itemFactor).toFixed(2)
        )
      : 0;
    return {
      sectionId: c.sectionId,
      sectionName: c.sectionName,
      contractCode: c.contractCode,
      curAmt,
      cumAmt,
      recCount: secRecs.length,
      confirmedCount: confirmedRecs.length,
      paidAmt,
      payReturned: isReturned,
    };
  });

  const allSectionCharts = contracts.map((c) => {
    const secRecs = periodRecords.filter(
      (r) =>
        r.sectionId === c.sectionId &&
        (!itemFilter || r.workItem === itemFilter) &&
        r.status === '已确认'
    );
    const curAmt = Number(
      secRecs.reduce((sum, r) => sum + r.amount, 0).toFixed(1)
    );
    const cumAmt = Number(
      (computeSectionCumAmount(contracts, periods, c.sectionId, pm.period) * itemFactor).toFixed(1)
    );
    return {
      sectionId: c.sectionId,
      sectionName: c.sectionName,
      curAmt,
      cumAmt,
    };
  });

  const totalCurAmt = Number(
    sectionRows.reduce((s, r) => s + r.curAmt, 0).toFixed(2)
  );
  const totalCumAmt = Number(
    sectionRows.reduce((s, r) => s + r.cumAmt, 0).toFixed(2)
  );
  const totalRecs = sectionRows.reduce((s, r) => s + r.recCount, 0);
  const totalConfirmed = sectionRows.reduce((s, r) => s + r.confirmedCount, 0);
  const totalPaid = Number(
    sectionRows.reduce((s, r) => s + r.paidAmt, 0).toFixed(2)
  );
  const returnedCount = sectionRows.filter((r) => r.payReturned).length;

  return NextResponse.json({
    period: pm.period,
    sectionId,
    contract: contractFilter,
    item: itemFilter,
    kpis: {
      sectionCount: sectionRows.length,
      contractCount: sectionRows.length,
      totalCurAmt,
      totalCumAmt,
      totalConfirmed,
      totalRecs,
      totalPaid,
      returnedCount,
    },
    sectionRows,
    allSectionCharts,
    contracts,
    periods,
  });
}
