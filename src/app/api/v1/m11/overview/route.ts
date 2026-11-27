import { NextRequest, NextResponse } from 'next/server';
import { asc } from 'drizzle-orm';
import { db } from '@/db';
import { speedPilotSegments } from '@/db/schema/domains/m11';
import { CORRIDOR_GEO, type DirectionKey } from '@/modules/m11_speed/types';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? '';
  const segmentId = searchParams.get('segmentId') ?? 'all';
  const rawDir = searchParams.get('direction');
  const direction: DirectionKey = rawDir === 'mingshui' ? 'mingshui' : 'beian';

  const allSegments = await db
    .select()
    .from(speedPilotSegments)
    .orderBy(asc(speedPilotSegments.sortOrder));

  let segments = allSegments;
  if (sectionId && sectionId !== 'all' && sectionId !== 'line') {
    const bySec = segments.filter((s) => s.sectionId === sectionId);
    if (bySec.length > 0) {
      segments = bySec;
    }
  }
  if (segmentId && segmentId !== 'all') {
    const bySeg = segments.filter((s) => s.id === segmentId);
    if (bySeg.length > 0) {
      segments = bySeg;
    }
  }

  const segmentCount = segments.length;
  const totalLengthKm = Number(
    segments.reduce((acc, s) => acc + s.lengthKm, 0).toFixed(1)
  );
  const avgSpeed = segmentCount
    ? Number(
        (
          segments.reduce((acc, s) => acc + s.directions[direction].avgSpeed, 0) /
          segmentCount
        ).toFixed(1)
      )
    : 0;
  const totalFlow = segments.reduce(
    (acc, s) => acc + s.directions[direction].flow,
    0
  );
  const attentionCount = segments.filter(
    (s) => s.directions[direction].attention
  ).length;
  const maxQueueM = segments.reduce(
    (acc, s) => Math.max(acc, s.directions[direction].queueM),
    0
  );

  return NextResponse.json({
    segments,
    allSegments,
    corridorGeo: CORRIDOR_GEO,
    summary: {
      segmentCount,
      totalLengthKm,
      avgSpeed,
      totalFlow,
      attentionCount,
      maxQueueM,
    },
  });
}
