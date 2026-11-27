import { NextRequest, NextResponse } from 'next/server';
import { and, asc, desc, eq } from 'drizzle-orm';
import { db } from '@/db';
import {
  safetyActivities,
  safetyAiAlerts,
  safetyHazards,
  safetyRiskPoints,
} from '@/db/schema/domains/m04';
import { computeHazardStats } from '@/modules/m04_safety/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const category = searchParams.get('category') || 'all';
  const period = searchParams.get('period') || '2026-11';
  const quickTab = searchParams.get('quickTab') || 'unclosed';
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const pageSize = 5;

  const hazardFilters = [eq(safetyHazards.period, period)];
  if (sectionId && sectionId !== 'all') hazardFilters.push(eq(safetyHazards.sectionId, sectionId));
  if (category && category !== 'all') hazardFilters.push(eq(safetyHazards.category, category));

  const riskFilters = [];
  if (sectionId && sectionId !== 'all') riskFilters.push(eq(safetyRiskPoints.sectionId, sectionId));
  if (category && category !== 'all') riskFilters.push(eq(safetyRiskPoints.category, category));

  const aiFilters = [eq(safetyAiAlerts.period, period), eq(safetyAiAlerts.status, '待核实')];
  if (sectionId && sectionId !== 'all') aiFilters.push(eq(safetyAiAlerts.sectionId, sectionId));

  const activityFilters = [];
  if (sectionId && sectionId !== 'all') activityFilters.push(eq(safetyActivities.sectionId, sectionId));

  const [scopedHazards, scopedRisks, pendingAiRows, activityRows] = await Promise.all([
    db
      .select()
      .from(safetyHazards)
      .where(and(...hazardFilters))
      .orderBy(asc(safetyHazards.sortOrder), desc(safetyHazards.createdAt), asc(safetyHazards.id)),
    db
      .select({ id: safetyRiskPoints.id })
      .from(safetyRiskPoints)
      .where(riskFilters.length ? and(...riskFilters) : undefined),
    db
      .select({ id: safetyAiAlerts.id })
      .from(safetyAiAlerts)
      .where(and(...aiFilters)),
    db
      .select()
      .from(safetyActivities)
      .where(activityFilters.length ? and(...activityFilters) : undefined)
      .orderBy(desc(safetyActivities.id))
      .limit(8),
  ]);

  const stats = computeHazardStats(scopedHazards);

  let trackList = scopedHazards.filter((h) => h.status !== '已销项');
  if (quickTab === 'overdue') {
    trackList = trackList.filter((h) => h.overdue);
  } else if (quickTab === 'review') {
    trackList = trackList.filter((h) => h.status === '待复查');
  }

  const totalPages = Math.max(1, Math.ceil(trackList.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const trackRows = trackList.slice((safePage - 1) * pageSize, safePage * pageSize);

  return NextResponse.json({
    period,
    riskCount: scopedRisks.length,
    aiPendingCount: pendingAiRows.length,
    stats,
    trackTotal: trackList.length,
    trackPage: safePage,
    trackTotalPages: totalPages,
    trackRows,
    activities: activityRows.slice(0, 4),
  });
}
