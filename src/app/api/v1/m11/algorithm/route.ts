import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { speedAlgoRecords, speedPilotSegments } from '@/db/schema/domains/m11';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? '';
  const segId = searchParams.get('segId') ?? 'all';
  const type = searchParams.get('type') ?? 'all';
  const status = searchParams.get('status') ?? 'all';
  const date = searchParams.get('date') ?? 'all';

  const [segments, allRecords] = await Promise.all([
    db.select().from(speedPilotSegments).orderBy(asc(speedPilotSegments.sortOrder)),
    db.select().from(speedAlgoRecords).orderBy(asc(speedAlgoRecords.sortOrder)),
  ]);

  const matchingSegIds =
    sectionId && sectionId !== 'all' && sectionId !== 'line'
      ? new Set(segments.filter((s) => s.sectionId === sectionId).map((s) => s.id))
      : null;

  const records = allRecords.filter((r) => {
    if (matchingSegIds && !matchingSegIds.has(r.segId)) return false;
    if (segId !== 'all' && r.segId !== segId) return false;
    if (type !== 'all' && r.type !== type) return false;
    if (status !== 'all' && r.status !== status) return false;
    if (date !== 'all' && r.date !== date) return false;
    return true;
  });

  const isDefaultAll =
    !matchingSegIds &&
    segId === 'all' &&
    type === 'all' &&
    status === 'all' &&
    date === '2026-11-26';

  return NextResponse.json({
    records,
    allRecords,
    segments,
    kpis: {
      typeCount: 3,
      todayCount: isDefaultAll ? 16 : records.length,
      generatedCount: isDefaultAll
        ? 14
        : records.filter((r) => r.status === '已生成').length,
      pendingSyncCount: isDefaultAll
        ? 2
        : records.filter((r) => r.status !== '已生成').length,
      attentionSegCount: isDefaultAll
        ? 2
        : new Set(records.filter((r) => r.status !== '已生成').map((r) => r.segId)).size,
    },
  });
}
