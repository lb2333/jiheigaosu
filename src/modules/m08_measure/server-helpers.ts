import { asc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  measureContracts,
  measurePeriods,
  measureRecords,
} from '@/db/schema/domains/m08';

export type ContractRow = typeof measureContracts.$inferSelect;
export type PeriodRow = typeof measurePeriods.$inferSelect;
export type RecordRow = typeof measureRecords.$inferSelect;

export const ALLOWED_WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export async function loadContractsAndPeriods() {
  const [contracts, periods] = await Promise.all([
    db.select().from(measureContracts).orderBy(asc(measureContracts.sortOrder)),
    db.select().from(measurePeriods).orderBy(asc(measurePeriods.sortOrder)),
  ]);
  return { contracts, periods };
}

export function resolvePeriodMeta(periods: PeriodRow[], periodParam?: string | null): PeriodRow {
  const fallback: PeriodRow = {
    period: '2026年11月',
    shortLabel: '11月',
    totalAmount: 8426.8,
    cumTotalAmount: 63582.4,
    scaleFactor: 1,
    sortOrder: 6,
  };
  if (!periods.length) return fallback;
  if (periodParam) {
    const match = periods.find((p) => p.period === periodParam);
    if (match) return match;
  }
  return periods.find((p) => p.period === '2026年11月') ?? periods[periods.length - 1];
}

export async function loadRecordsByPeriod(
  period: string,
  periods: PeriodRow[]
): Promise<RecordRow[]> {
  const directRows = await db
    .select()
    .from(measureRecords)
    .where(eq(measureRecords.period, period))
    .orderBy(asc(measureRecords.sortOrder), asc(measureRecords.id));

  if (period === '2026年11月') {
    return directRows;
  }

  const pm = resolvePeriodMeta(periods, period);
  const novRows = await db
    .select()
    .from(measureRecords)
    .where(eq(measureRecords.period, '2026年11月'))
    .orderBy(asc(measureRecords.sortOrder), asc(measureRecords.id));

  const ym = pm.period.replace('年', '').replace('月', '');
  const mm = pm.shortLabel.replace('月', '').padStart(2, '0');
  const directById = new Map(directRows.map((r) => [r.id, r]));

  const derived = novRows.map((r) => {
    const newId = r.id.replace('202611', ym);
    const existing = directById.get(newId);
    if (existing) {
      directById.delete(newId);
      return existing;
    }
    const scaledAmt = Number((r.amount * pm.scaleFactor).toFixed(2));
    const paySt =
      r.sectionId === 'sec6' && pm.period === '2026年10月' ? '办理中' : '已支付';
    return {
      ...r,
      id: newId,
      period: pm.period,
      amount: scaledAmt,
      status: '已确认',
      payStatus: paySt,
      paidAmount: paySt === '已支付' ? scaledAmt : 0,
      payTime: paySt === '已支付' ? `${mm}-25 16:20` : '—',
      syncTime: `2026-${mm}-26 10:45`,
    };
  });

  // Append any extra custom rows inserted specifically for this historical period
  const extras = Array.from(directById.values());
  return [...extras, ...derived];
}

export function computeSectionCumAmount(
  contracts: ContractRow[],
  periods: PeriodRow[],
  sectionId: string | null,
  period: string
): number {
  const pm = resolvePeriodMeta(periods, period);
  const totalCum = periods.find((p) => p.period === '2026年11月')?.cumTotalAmount || 63582.4;
  const ratio = pm.cumTotalAmount / totalCum;
  if (!sectionId) {
    const baseTotal = contracts.reduce((sum, c) => sum + c.cumBaseAmount, 0) || totalCum;
    return Number((baseTotal * ratio).toFixed(2));
  }
  const sec = contracts.find((c) => c.sectionId === sectionId);
  return sec ? Number((sec.cumBaseAmount * ratio).toFixed(2)) : 0;
}
