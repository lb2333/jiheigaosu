import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityMixingRecords, qualitySectionMetrics } from '@/db/schema/domains/m03';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const station = sp.get('station')?.trim() || '';
  const prodType = sp.get('prodType')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const sections = await db
    .select()
    .from(qualitySectionMetrics)
    .orderBy(asc(qualitySectionMetrics.sortOrder));

  const effectiveSectionId =
    sectionId || (station ? sections.find((s) => s.stationFull === station)?.sectionId ?? '' : '');

  const conditions: SQL[] = [];
  if (effectiveSectionId) {
    conditions.push(eq(qualityMixingRecords.sectionId, effectiveSectionId));
  }
  if (prodType) {
    conditions.push(eq(qualityMixingRecords.prodType, prodType));
  }
  if (quickFilter === '正常批次') {
    conditions.push(eq(qualityMixingRecords.judge, '合格'));
  } else if (quickFilter === '预警批次') {
    conditions.push(eq(qualityMixingRecords.judge, '预警'));
  }

  const alertConditions: SQL[] = [eq(qualityMixingRecords.judge, '预警')];
  if (effectiveSectionId) {
    alertConditions.push(eq(qualityMixingRecords.sectionId, effectiveSectionId));
  }

  const [records, alerts] = await Promise.all([
    conditions.length
      ? db
          .select()
          .from(qualityMixingRecords)
          .where(and(...conditions))
          .orderBy(asc(qualityMixingRecords.sortOrder))
      : db.select().from(qualityMixingRecords).orderBy(asc(qualityMixingRecords.sortOrder)),
    db
      .select()
      .from(qualityMixingRecords)
      .where(and(...alertConditions))
      .orderBy(asc(qualityMixingRecords.sortOrder)),
  ]);

  return NextResponse.json({
    sections,
    records,
    alerts,
  });
}
