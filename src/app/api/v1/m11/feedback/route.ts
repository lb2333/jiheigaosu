import { NextRequest, NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import { speedFeedbackBatches, speedPilotSegments } from '@/db/schema/domains/m11';
import { requireSession } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = req.nextUrl;
  const sectionId = searchParams.get('sectionId') ?? '';
  const segId = searchParams.get('segId') ?? 'all';
  const batchId = searchParams.get('batchId') ?? '';

  const [segments, allBatches] = await Promise.all([
    db.select().from(speedPilotSegments).orderBy(asc(speedPilotSegments.sortOrder)),
    db
      .select()
      .from(speedFeedbackBatches)
      .orderBy(asc(speedFeedbackBatches.sortOrder), desc(speedFeedbackBatches.updatedAt)),
  ]);

  const matchingSegIds =
    sectionId && sectionId !== 'all' && sectionId !== 'line'
      ? new Set(segments.filter((s) => s.sectionId === sectionId).map((s) => s.id))
      : null;

  let batches = allBatches;
  if (matchingSegIds) {
    batches = batches.filter((b) => matchingSegIds.has(b.segId));
  }
  if (segId && segId !== 'all') {
    const segMatches = batches.filter((b) => b.segId === segId);
    if (segMatches.length > 0) batches = segMatches;
  }
  if (batchId) {
    const exact = batches.find((b) => b.batchId === batchId);
    if (exact) {
      batches = [exact, ...batches.filter((b) => b.batchId !== batchId)];
    }
  }

  return NextResponse.json({
    batches,
    allBatches,
    segments,
  });
}
