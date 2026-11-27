import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityIssues, qualitySectionMetrics } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const createIssueSchema = z.object({
  sectionId: z.string().min(1),
  issueType: z.enum(['原材料质量', '施工工艺', '检测异常', '构件质量', '其他']),
  title: z.string().trim().min(2).max(120),
  description: z.string().trim().min(2).max(400),
  unit: z.string().trim().min(2).max(80).optional(),
  deadline: z.string().trim().min(4).max(32),
  measure: z.string().trim().min(2).max(1000),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId')?.trim() || '';
  const issueType = sp.get('issueType')?.trim() || '';
  const status = sp.get('status')?.trim() || '';
  const quickFilter = sp.get('quickFilter')?.trim() || '';

  const scopedConditions: SQL[] = [];
  if (sectionId) {
    scopedConditions.push(eq(qualityIssues.sectionId, sectionId));
  }
  if (issueType) {
    scopedConditions.push(eq(qualityIssues.issueType, issueType));
  }

  const [sections, scopedRecords, typeScopedIssues] = await Promise.all([
    db.select().from(qualitySectionMetrics).orderBy(asc(qualitySectionMetrics.sortOrder)),
    scopedConditions.length
      ? db
          .select()
          .from(qualityIssues)
          .where(and(...scopedConditions))
          .orderBy(asc(qualityIssues.sortOrder))
      : db.select().from(qualityIssues).orderBy(asc(qualityIssues.sortOrder)),
    issueType
      ? db
          .select({ sectionId: qualityIssues.sectionId })
          .from(qualityIssues)
          .where(eq(qualityIssues.issueType, issueType))
      : db.select({ sectionId: qualityIssues.sectionId }).from(qualityIssues),
  ]);

  const sectionIssueCounts: Record<string, number> = {};
  for (const row of typeScopedIssues) {
    sectionIssueCounts[row.sectionId] = (sectionIssueCounts[row.sectionId] ?? 0) + 1;
  }

  const effectiveStatus = quickFilter && quickFilter !== '全部' ? quickFilter : status;
  const records = effectiveStatus
    ? scopedRecords.filter((r) => r.status === effectiveStatus)
    : scopedRecords;

  return NextResponse.json({
    sections,
    records,
    scopedRecords,
    sectionIssueCounts,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'engineer', 'supervisor'].includes(session.user.role ?? 'viewer')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createIssueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const secRows = await db
    .select()
    .from(qualitySectionMetrics)
    .where(eq(qualitySectionMetrics.sectionId, data.sectionId))
    .limit(1);

  if (secRows.length === 0) {
    return NextResponse.json({ error: '所属工区不存在' }, { status: 400 });
  }

  const existingAll = await db.select({ id: qualityIssues.id, sortOrder: qualityIssues.sortOrder }).from(qualityIssues);
  const nextSeq = String(existingAll.length + 1).padStart(3, '0');
  const minOrder = existingAll.reduce((m, r) => Math.min(m, r.sortOrder), 1);
  const now = new Date();
  const foundAt = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
    now.getDate()
  ).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(
    now.getMinutes()
  ).padStart(2, '0')}`;

  const newId = `ZL-202611-${nextSeq}`;
  const [created] = await db
    .insert(qualityIssues)
    .values({
      id: newId,
      sectionId: data.sectionId,
      section: secRows[0].name,
      issueType: data.issueType,
      title: data.title,
      description: data.description,
      unit: data.unit || `${secRows[0].name}项目部`,
      foundAt,
      deadline: data.deadline,
      status: '整改中',
      daysUsed: null,
      measure: data.measure,
      sortOrder: minOrder - 1,
      updatedAt: now,
    })
    .returning();

  await writeM03Audit(req, session, 'QUALITY_ISSUE_CREATE', created.id, {
    sectionId: created.sectionId,
    issueType: created.issueType,
    title: created.title,
  });

  return NextResponse.json({ record: created }, { status: 201 });
}
