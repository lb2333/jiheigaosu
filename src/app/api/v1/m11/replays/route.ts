import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { speedPilotSegments, speedReplayScenarios } from '@/db/schema/domains/m11';
import { CORRIDOR_GEO } from '@/modules/m11_speed/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const mode = searchParams.get('mode') ?? 'all';
  const segId = searchParams.get('segId') ?? 'all';
  const sectionId = searchParams.get('sectionId') ?? '';

  const [segments, allScenarios] = await Promise.all([
    db.select().from(speedPilotSegments).orderBy(asc(speedPilotSegments.sortOrder)),
    db.select().from(speedReplayScenarios).orderBy(asc(speedReplayScenarios.sortOrder)),
  ]);

  const matchingSegIds =
    sectionId && sectionId !== 'all' && sectionId !== 'line'
      ? new Set(segments.filter((s) => s.sectionId === sectionId).map((s) => s.id))
      : null;

  const scenarios = allScenarios.filter((sc) => {
    if (mode !== 'all' && sc.mode !== mode) return false;
    if (segId !== 'all' && sc.segId !== segId) return false;
    if (matchingSegIds && !matchingSegIds.has(sc.segId)) return false;
    return true;
  });

  return NextResponse.json({
    scenarios,
    segments,
    corridorGeo: CORRIDOR_GEO,
  });
}
