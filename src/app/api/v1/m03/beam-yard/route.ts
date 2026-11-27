import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, ne, type SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityBeamRecords, qualitySectionMetrics } from '@/db/schema/domains/m03';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const yard = sp.get('yard')?.trim() || '';
  const beamType = sp.get('beamType')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const conditions: SQL[] = [];
  if (sectionId) {
    conditions.push(eq(qualityBeamRecords.sectionId, sectionId));
  }
  if (yard) {
    conditions.push(eq(qualityBeamRecords.yard, yard));
  }
  if (beamType) {
    conditions.push(eq(qualityBeamRecords.beamType, beamType));
  }
  if (quickFilter === '生产中') {
    conditions.push(eq(qualityBeamRecords.statusState, 'producing'));
  } else if (quickFilter === '已检验') {
    conditions.push(eq(qualityBeamRecords.statusState, 'inspected'));
  }

  const alertConditions: SQL[] = [ne(qualityBeamRecords.alertTitle, '')];
  if (sectionId) {
    alertConditions.push(eq(qualityBeamRecords.sectionId, sectionId));
  }
  if (yard) {
    alertConditions.push(eq(qualityBeamRecords.yard, yard));
  }

  const [sections, records, alerts] = await Promise.all([
    db.select().from(qualitySectionMetrics).orderBy(asc(qualitySectionMetrics.sortOrder)),
    conditions.length
      ? db
          .select()
          .from(qualityBeamRecords)
          .where(and(...conditions))
          .orderBy(asc(qualityBeamRecords.sortOrder))
      : db.select().from(qualityBeamRecords).orderBy(asc(qualityBeamRecords.sortOrder)),
    db
      .select()
      .from(qualityBeamRecords)
      .where(and(...alertConditions))
      .orderBy(asc(qualityBeamRecords.sortOrder)),
  ]);

  return NextResponse.json({
    sections,
    records,
    alerts: alerts.slice(0, 3),
  });
}
