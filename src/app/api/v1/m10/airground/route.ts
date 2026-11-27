import { NextRequest, NextResponse } from 'next/server';
import { asc, desc } from 'drizzle-orm';
import { db } from '@/db';
import {
  videoAirGroundPairs,
  videoAirGroundReviews,
} from '@/db/schema/domains/m10';
import { requireSession, SECTION_ID_BY_NAME } from '../_utils';

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const rawSection = (searchParams.get('sectionId') || searchParams.get('section') || '').trim();
  const sectionId =
    rawSection && rawSection !== 'all'
      ? SECTION_ID_BY_NAME[rawSection] || rawSection
      : '';
  const siteName = (searchParams.get('siteName') || '').trim();
  const partName = (searchParams.get('partName') || '').trim();
  const evidenceDate = (searchParams.get('date') || '').trim();
  const pairId = (searchParams.get('pairId') || '').trim();

  const [pairs, reviews] = await Promise.all([
    db
      .select()
      .from(videoAirGroundPairs)
      .orderBy(asc(videoAirGroundPairs.sortOrder), asc(videoAirGroundPairs.id)),
    db
      .select()
      .from(videoAirGroundReviews)
      .orderBy(desc(videoAirGroundReviews.createdAt)),
  ]);

  const selectedPair =
    (pairId ? pairs.find((p) => p.id === pairId) : undefined) ||
    pairs.find(
      (p) =>
        (!sectionId || p.sectionId === sectionId) &&
        (!siteName || p.siteName === siteName) &&
        (!partName || p.partName === partName) &&
        (!evidenceDate || p.evidenceDate === evidenceDate)
    ) ||
    (sectionId ? pairs.find((p) => p.sectionId === sectionId) : undefined) ||
    (siteName ? pairs.find((p) => p.siteName === siteName) : undefined) ||
    pairs[0] ||
    null;

  return NextResponse.json({
    pairs,
    selectedPair,
    reviews,
  });
}
