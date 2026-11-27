import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { speedPilotSegments, speedStrategies } from '@/db/schema/domains/m11';
import type { DirectionKey } from '@/modules/m11_speed/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? '';
  const segId = searchParams.get('segId') ?? 'all';
  const auditStatus = searchParams.get('auditStatus') ?? 'all';
  const rawDir = searchParams.get('direction');
  const direction: DirectionKey = rawDir === 'mingshui' ? 'mingshui' : 'beian';

  const [segments, allStrategies] = await Promise.all([
    db.select().from(speedPilotSegments).orderBy(asc(speedPilotSegments.sortOrder)),
    db.select().from(speedStrategies).orderBy(asc(speedStrategies.sortOrder)),
  ]);

  const segMap = new Map(segments.map((s) => [s.id, s]));
  const matchingSegIds =
    sectionId && sectionId !== 'all' && sectionId !== 'line'
      ? new Set(segments.filter((s) => s.sectionId === sectionId).map((s) => s.id))
      : null;

  const withDirectionalSpeeds = allStrategies.map((st) => {
    const seg = segMap.get(st.segId);
    const dirInfo = seg?.directions[direction];
    return {
      ...st,
      direction,
      measuredInner: dirInfo ? dirInfo.innerSpeed : st.measuredInner,
      measuredOuter: dirInfo ? dirInfo.outerSpeed : st.measuredOuter,
    };
  });

  const strategies = withDirectionalSpeeds.filter((st) => {
    if (matchingSegIds && !matchingSegIds.has(st.segId)) return false;
    if (segId !== 'all' && st.segId !== segId) return false;
    if (auditStatus !== 'all' && st.auditStatus !== auditStatus) return false;
    return true;
  });

  return NextResponse.json({
    strategies,
    allStrategies: withDirectionalSpeeds,
    segments,
    kpis: {
      segmentCount: strategies.length,
      laneSuggestionCount: strategies.length,
      pendingCount: strategies.filter((s) => s.auditStatus === '待审核').length,
      approvedCount: strategies.filter((s) => s.auditStatus === '已审核').length,
      publishedCount: strategies.length,
    },
  });
}
