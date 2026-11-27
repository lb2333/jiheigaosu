import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import { safetyAiAlerts, safetyHazards } from '@/db/schema/domains/m04';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const algorithm = searchParams.get('algorithm') || 'all';
  const status = searchParams.get('status') || 'all';
  const period = searchParams.get('period') || '2026-11';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 5;

  const scopeFilters = [eq(safetyAiAlerts.period, period)];
  if (sectionId && sectionId !== 'all') scopeFilters.push(eq(safetyAiAlerts.sectionId, sectionId));

  const hazardFilters = [];
  if (sectionId && sectionId !== 'all') hazardFilters.push(eq(safetyHazards.sectionId, sectionId));

  const [scopeAlerts, hazards] = await Promise.all([
    db
      .select()
      .from(safetyAiAlerts)
      .where(and(...scopeFilters))
      .orderBy(asc(safetyAiAlerts.sortOrder), desc(safetyAiAlerts.alertTime)),
    db
      .select()
      .from(safetyHazards)
      .where(hazardFilters.length ? and(...hazardFilters) : undefined)
      .orderBy(asc(safetyHazards.sortOrder)),
  ]);

  const stats = {
    total: scopeAlerts.length,
    pending: scopeAlerts.filter((a) => a.status === '待核实').length,
    confirmed: scopeAlerts.filter((a) => a.status === '已确认').length,
    falseAlarm: scopeAlerts.filter((a) => a.status === '已标误报').length,
    duplicate: scopeAlerts.filter((a) => a.status === '重复关联').length,
  };

  let listAlerts = scopeAlerts.filter((a) => {
    if (algorithm !== 'all' && a.algorithm !== algorithm) return false;
    if (status !== 'all' && a.status !== status) return false;
    return true;
  });

  let listTitle = '待核实预警';
  if (status === 'all') {
    const pendingOnly = listAlerts.filter((a) => a.status === '待核实');
    if (pendingOnly.length > 0) {
      listAlerts = pendingOnly;
      listTitle = '待核实预警';
    } else {
      listTitle = '全部AI预警';
    }
  } else {
    listTitle = `${status}预警`;
  }

  const totalPages = Math.max(1, Math.ceil(listAlerts.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const items = listAlerts.slice((safePage - 1) * pageSize, safePage * pageSize);

  const pendingCandidates = hazards.filter((h) => h.status !== '已销项').slice(0, 12);

  return NextResponse.json({
    period,
    stats,
    listTitle,
    total: listAlerts.length,
    page: safePage,
    totalPages,
    items,
    pendingCandidates,
  });
}
