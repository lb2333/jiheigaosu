import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { materialReports, materialYards } from '@/db/schema/domains/m07';
import { formatNowParts, requireM07Session, requireM07WriteSession, writeM07Audit } from '../_utils';

const uploadReportSchema = z.object({
  sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
  fileName: z.string().trim().min(3).max(120),
  reportDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireM07Session();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const sectionId = searchParams.get('sectionId') || '';
  const date = searchParams.get('date') || '';
  const confirmStatus = searchParams.get('confirmStatus') || '';
  const q = (searchParams.get('q') || '').trim().toLowerCase();

  const [yards, rows] = await Promise.all([
    db.select().from(materialYards).orderBy(asc(materialYards.sortOrder)),
    db.select().from(materialReports).orderBy(asc(materialReports.sortOrder)),
  ]);

  const yardBySec = Object.fromEntries(yards.map((y) => [y.sectionId, y]));
  const enriched = rows.map((r) => ({
    ...r,
    sectionName: yardBySec[r.sectionId]?.sectionName ?? r.sectionId,
    yardName: yardBySec[r.sectionId]?.name ?? '',
  }));

  const filtered = enriched.filter((r) => {
    if (sectionId && sectionId !== 'all' && r.sectionId !== sectionId) return false;
    if (date && date !== 'all' && r.reportDate !== date) return false;
    if (confirmStatus && confirmStatus !== 'all' && r.confirmStatus !== confirmStatus) return false;
    if (q) {
      const hay = `${r.code} ${r.sectionName} ${r.yardName} ${r.fileName}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  return NextResponse.json({
    yards,
    total: filtered.length,
    reports: filtered,
  });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireM07WriteSession();
  if (errorResponse || !session) return errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = uploadReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '报表上传参数不完整', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const { sectionId, fileName, reportDate } = parsed.data;
  const [existing] = await db
    .select()
    .from(materialReports)
    .where(eq(materialReports.sectionId, sectionId))
    .limit(1);

  const [yard] = await db
    .select()
    .from(materialYards)
    .where(eq(materialYards.sectionId, sectionId))
    .limit(1);

  if (!existing || !yard) {
    return NextResponse.json({ error: '未找到对应工区报表台账' }, { status: 404 });
  }

  const { full, short, date } = formatNowParts();
  const curNum = Number.parseFloat(existing.version.replace(/^V/i, '')) || 1.0;
  const nextVer = `V${(curNum + 0.1).toFixed(1)}`;
  const uploader = session.user.name || '备料管理员A';
  const nextHistory = [
    {
      version: nextVer,
      time: short,
      record: '字段检查通过（新上传）',
      status: '待确认',
      uploader,
      rows: 5,
    },
    ...existing.history,
  ];

  const [updated] = await db
    .update(materialReports)
    .set({
      version: nextVer,
      reportDate: reportDate ?? existing.reportDate ?? date,
      uploadTime: short,
      uploadFull: full,
      fieldCheck: '通过',
      confirmStatus: '待确认',
      fileName,
      history: nextHistory,
      updatedAt: new Date(),
    })
    .where(eq(materialReports.code, existing.code))
    .returning();

  await writeM07Audit(req, session, 'UPLOAD_MATERIAL_REPORT', `${existing.code} (${nextVer})`, {
    sectionId,
    fileName,
    version: nextVer,
  });

  return NextResponse.json({
    report: {
      ...updated,
      sectionName: yard.sectionName,
      yardName: yard.name,
    },
  });
}
