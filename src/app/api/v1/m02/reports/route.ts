import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs, workSections } from '@/db/schema/core';
import { progressDetailItems, progressReports } from '@/db/schema/domains/m02';

const MONTH_FACTORS: Record<string, number> = {
  '2026-06': 0.677,
  '2026-07': 0.733,
  '2026-08': 0.801,
  '2026-09': 0.875,
  '2026-10': 0.928,
  '2026-11': 1.0,
};

const createReportSchema = z.object({
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
  year: z.string().regex(/^\d{4}$/),
  month: z.string().regex(/^(0[1-9]|1[0-2])$/),
  reportName: z.string().min(2).max(120).optional(),
  summary: z.string().max(500).optional(),
  status: z.enum(['已发布', '已归档']).optional(),
});

function fmtNum(val: number, decimals: number) {
  return val.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sp = req.nextUrl.searchParams;
  const sectionId = sp.get('sectionId') || 'all';
  const year = sp.get('year') || '2026';
  const month = (sp.get('month') || '11').padStart(2, '0');
  const keyword = (sp.get('keyword') || '').trim().toLowerCase();
  const selectedSecParam = sp.get('selectedSecId') || '';

  const [sections, rawReports, allReportItems] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db
      .select()
      .from(progressReports)
      .where(and(eq(progressReports.year, year), eq(progressReports.month, month)))
      .orderBy(asc(progressReports.sectionId)),
    db
      .select()
      .from(progressDetailItems)
      .where(eq(progressDetailItems.itemScope, 'report'))
      .orderBy(asc(progressDetailItems.sortOrder)),
  ]);

  const filteredReports = rawReports.filter((r) => {
    if (sectionId !== 'all' && r.sectionId !== sectionId) return false;
    if (keyword) {
      if (
        !r.reportName.toLowerCase().includes(keyword) &&
        !r.sectionName.toLowerCase().includes(keyword) &&
        !r.sourceName.toLowerCase().includes(keyword)
      ) {
        return false;
      }
    }
    return true;
  });

  const activeSelectedSec =
    (selectedSecParam && filteredReports.some((r) => r.sectionId === selectedSecParam)
      ? selectedSecParam
      : filteredReports[0]?.sectionId) ||
    rawReports.find((r) => r.sectionId === 'sec2')?.sectionId ||
    'sec2';

  const selectedReport =
    filteredReports.find((r) => r.sectionId === activeSelectedSec) ??
    rawReports.find((r) => r.sectionId === activeSelectedSec) ??
    filteredReports[0] ??
    rawReports[0] ??
    null;

  const ymKey = `${year}-${month}`;
  const rpFactor =
    (year === '2025' ? 0.35 : 1.0) *
    (MONTH_FACTORS[ymKey] ?? (year === '2025' ? 0.85 : 1.0));

  const items = allReportItems
    .filter((it) => it.sectionId === (selectedReport?.sectionId ?? activeSelectedSec))
    .map((it) => {
      if (rpFactor >= 0.999) return it;
      const numCum = parseFloat(String(it.cumQty).replace(/,/g, '')) * rpFactor;
      const numCur = parseFloat(String(it.periodQty).replace(/,/g, '')) * (0.7 + 0.3 * rpFactor);
      const pct = +Math.min(100, it.pct * rpFactor).toFixed(1);
      return {
        ...it,
        periodQty: numCur >= 100 ? fmtNum(numCur, 0) : numCur.toFixed(1),
        cumQty: numCum >= 100 ? fmtNum(numCum, 0) : numCum.toFixed(1),
        pct,
      };
    });

  return NextResponse.json({
    year,
    month,
    periodLabel: `${year}年${month}月`,
    dueDate: `${year}-${month}-20`,
    sectionId,
    sections: sections.map((s) => ({ id: s.id, name: s.name })),
    reports: filteredReports,
    selectedReport,
    items,
  });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== 'admin' && role !== 'engineer' && role !== 'supervisor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { sectionId, year, month, reportName, summary, status } = parsed.data;
  const [sec] = await db.select().from(workSections).where(eq(workSections.id, sectionId)).limit(1);
  const sectionName = sec?.name ?? sectionId;
  const periodLabel = `${year}年${month}月`;
  const finalName = reportName?.trim() || `${periodLabel}进度报表`;
  const today = new Date().toISOString().slice(0, 10);
  const id = `rep_${year}_${month}_${sectionId}`;

  const [saved] = await db
    .insert(progressReports)
    .values({
      id,
      sectionId,
      sectionName,
      year,
      month,
      periodLabel,
      reportName: finalName,
      dueDate: `${year}-${month}-20`,
      updatedDate: today,
      sourceName: `${sectionName}${finalName}`,
      docCode: `JHGS-${sectionId.toUpperCase()}-${year}${month}`,
      status: status ?? '已发布',
      summary: summary ?? `${sectionName}${periodLabel}工程进度统计月报。`,
      createdBy: session.user.name,
    })
    .onConflictDoUpdate({
      target: progressReports.id,
      set: {
        reportName: finalName,
        updatedDate: today,
        status: status ?? '已发布',
        summary: summary ?? `${sectionName}${periodLabel}工程进度统计月报。`,
      },
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'PUBLISH_PROGRESS_REPORT',
    moduleId: 'progress',
    target: `${sectionName} · ${finalName}`,
    detail: { id: saved.id, year, month, status: saved.status },
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ report: saved }, { status: 201 });
}
