import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityLabRecords, qualitySectionMetrics } from '@/db/schema/domains/m03';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const labName = sp.get('labName')?.trim() || '';
  const category = sp.get('category')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const sections = await db
    .select()
    .from(qualitySectionMetrics)
    .orderBy(asc(qualitySectionMetrics.sortOrder));

  const effectiveSectionId =
    sectionId || (labName ? sections.find((s) => s.labName === labName)?.sectionId ?? '' : '');

  const conditions: SQL[] = [];
  if (effectiveSectionId) {
    conditions.push(eq(qualityLabRecords.sectionId, effectiveSectionId));
  }
  if (category) {
    conditions.push(eq(qualityLabRecords.category, category));
  }
  if (quickFilter && quickFilter !== '全部') {
    conditions.push(eq(qualityLabRecords.result, quickFilter));
  }

  const alertConditions: SQL[] = [eq(qualityLabRecords.result, '不合格')];
  if (effectiveSectionId) {
    alertConditions.push(eq(qualityLabRecords.sectionId, effectiveSectionId));
  }

  const [records, alerts] = await Promise.all([
    conditions.length
      ? db
          .select()
          .from(qualityLabRecords)
          .where(and(...conditions))
          .orderBy(asc(qualityLabRecords.sortOrder))
      : db.select().from(qualityLabRecords).orderBy(asc(qualityLabRecords.sortOrder)),
    db
      .select()
      .from(qualityLabRecords)
      .where(and(...alertConditions))
      .orderBy(asc(qualityLabRecords.sortOrder)),
  ]);

  return NextResponse.json({
    sections,
    records,
    alerts: alerts.slice(0, 3),
  });
}
