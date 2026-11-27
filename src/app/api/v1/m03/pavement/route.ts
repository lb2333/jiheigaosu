import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, ne, type SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityPavementRecords, qualitySectionMetrics } from '@/db/schema/domains/m03';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const direction = sp.get('direction')?.trim() || '';
  const layer = sp.get('layer')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const conditions: SQL[] = [];
  if (sectionId) {
    conditions.push(eq(qualityPavementRecords.sectionId, sectionId));
  }
  if (direction) {
    conditions.push(eq(qualityPavementRecords.dir, direction));
  }
  if (layer) {
    conditions.push(eq(qualityPavementRecords.layer, layer));
  }
  if (quickFilter === '合格') {
    conditions.push(eq(qualityPavementRecords.judge, '合格'));
  } else if (quickFilter === '预警') {
    conditions.push(ne(qualityPavementRecords.judge, '合格'));
  }

  const alertConditions: SQL[] = [ne(qualityPavementRecords.judge, '合格')];
  if (sectionId) {
    alertConditions.push(eq(qualityPavementRecords.sectionId, sectionId));
  }

  const [sections, records, alerts] = await Promise.all([
    db.select().from(qualitySectionMetrics).orderBy(asc(qualitySectionMetrics.sortOrder)),
    conditions.length
      ? db
          .select()
          .from(qualityPavementRecords)
          .where(and(...conditions))
          .orderBy(asc(qualityPavementRecords.sortOrder))
      : db.select().from(qualityPavementRecords).orderBy(asc(qualityPavementRecords.sortOrder)),
    db
      .select()
      .from(qualityPavementRecords)
      .where(and(...alertConditions))
      .orderBy(asc(qualityPavementRecords.sortOrder)),
  ]);

  return NextResponse.json({
    sections,
    records,
    alerts: alerts.slice(0, 3),
  });
}
