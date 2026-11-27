import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import {
  qualityInspections,
  qualityIssues,
  qualitySectionMetrics,
} from '@/db/schema/domains/m03';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const category = sp.get('category')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const inspectionConditions: SQL[] = [];
  if (sectionId) {
    inspectionConditions.push(eq(qualityInspections.sectionId, sectionId));
  }
  if (quickFilter && quickFilter !== '全部') {
    inspectionConditions.push(eq(qualityInspections.category, quickFilter));
  }

  const issueConditions: SQL[] = [];
  if (sectionId) {
    issueConditions.push(eq(qualityIssues.sectionId, sectionId));
  }

  const [sections, rawInspections, issues] = await Promise.all([
    db.select().from(qualitySectionMetrics).orderBy(asc(qualitySectionMetrics.sortOrder)),
    inspectionConditions.length
      ? db
          .select()
          .from(qualityInspections)
          .where(and(...inspectionConditions))
          .orderBy(asc(qualityInspections.sortOrder))
      : db.select().from(qualityInspections).orderBy(asc(qualityInspections.sortOrder)),
    issueConditions.length
      ? db
          .select()
          .from(qualityIssues)
          .where(and(...issueConditions))
          .orderBy(asc(qualityIssues.sortOrder))
      : db.select().from(qualityIssues).orderBy(asc(qualityIssues.sortOrder)),
  ]);

  const inspections = rawInspections.filter((r) => {
    if (!category) return true;
    if (category === '场站工程') return r.target.includes('拌合站') || r.target.includes('梁场');
    if (category === '桥梁工程') return r.target.includes('梁') || r.target.includes('桥');
    if (category === '路面工程') {
      return r.target.includes('沥青') || r.target.includes('水稳') || r.target.includes('路面');
    }
    if (category === '路基工程') return r.target.includes('路基');
    return true;
  });

  return NextResponse.json({
    sections,
    inspections,
    issues,
  });
}
