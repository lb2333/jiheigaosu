import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { measurePhysicalItems } from '@/db/schema/domains/m08';
import {
  loadContractsAndPeriods,
  resolvePeriodMeta,
} from '@/modules/m08_measure/server-helpers';

const querySchema = z.object({
  sectionId: z.string().optional(),
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
    item: sp.get('item') || undefined,
    period: sp.get('period') || undefined,
  });
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid query parameters', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { contracts, periods } = await loadContractsAndPeriods();
  const targetSecId = parsed.data.sectionId || 'sec2';
  const contract =
    contracts.find((c) => c.sectionId === targetSecId) ??
    contracts[1] ??
    contracts[0];
  const pm = resolvePeriodMeta(periods, parsed.data.period);
  const itemFilter = parsed.data.item || '';

  const baseItems = await db
    .select()
    .from(measurePhysicalItems)
    .where(eq(measurePhysicalItems.sectionId, contract.sectionId))
    .orderBy(asc(measurePhysicalItems.sortOrder));

  const totalCum =
    periods.find((p) => p.period === '2026年11月')?.cumTotalAmount || 63582.4;
  const progressRatio = Math.min(1, 0.45 + 0.55 * (pm.cumTotalAmount / totalCum));
  const isNov = pm.period === '2026年11月';
  const ym = pm.period.replace('年', '').replace('月', '');

  const items = baseItems
    .map((it) => {
      const decimals = it.unit.startsWith('万') ? 1 : 0;
      const mQty = isNov
        ? it.measuredQty
        : Number((it.measuredQty * progressRatio).toFixed(decimals));
      const pQty = isNov
        ? it.physicalQty
        : Math.max(
            mQty,
            Number((it.physicalQty * progressRatio).toFixed(decimals))
          );
      const measuredPct =
        it.contractQty > 0 ? Number(((mQty / it.contractQty) * 100).toFixed(1)) : 0;
      const physicalPct =
        it.contractQty > 0 ? Number(((pQty / it.contractQty) * 100).toFixed(1)) : 0;
      const diffQty = Number((pQty - mQty).toFixed(1));
      return {
        id: it.id,
        sectionId: it.sectionId,
        workItem: it.workItem,
        unit: it.unit,
        contractQty: it.contractQty,
        measuredQty: mQty,
        physicalQty: pQty,
        measuredPct,
        physicalPct,
        diffQty,
        periodAmount: Number((it.periodAmount * pm.scaleFactor).toFixed(2)),
        linkedRecordId: isNov
          ? it.linkedRecordId
          : it.linkedRecordId.replace('202611', ym),
      };
    })
    .filter((it) => !itemFilter || it.workItem === itemFilter);

  return NextResponse.json({
    period: pm.period,
    contract,
    item: itemFilter,
    items,
    contracts,
    periods,
  });
}
