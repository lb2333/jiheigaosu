import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { materialReports, materialYards } from '@/db/schema/domains/m07';
import { formatNowParts, requireM07WriteSession, writeM07Audit } from '../../_utils';

const patchReportSchema = z.object({
  action: z.enum(['confirm']),
  note: z.string().trim().max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { session, errorResponse } = await requireM07WriteSession();
  if (errorResponse || !session) return errorResponse;

  const { code } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = patchReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '报表确认参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(materialReports)
    .where(eq(materialReports.code, code))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '报表记录不存在' }, { status: 404 });
  }

  const [yard] = await db
    .select()
    .from(materialYards)
    .where(eq(materialYards.id, existing.yardId))
    .limit(1);

  const { full } = formatNowParts();
  const actor = session.user.name || '备料管理员A';
  const nextNotice = `${yard?.sectionName ?? existing.sectionId}看板已切换使用 ${existing.version}，确认时间 ${full}。`;
  const nextHistory = existing.history.map((h) => {
    if (h.version === existing.version) {
      return {
        ...h,
        status: '当前使用',
        record: parsed.data.note ? `${actor}确认（${parsed.data.note}）` : `${actor}确认`,
      };
    }
    if (h.status === '当前使用') {
      return { ...h, status: '历史版本' };
    }
    return h;
  });

  const [updated] = await db
    .update(materialReports)
    .set({
      confirmStatus: '已确认',
      currentBoardNotice: nextNotice,
      history: nextHistory,
      updatedAt: new Date(),
    })
    .where(eq(materialReports.code, code))
    .returning();

  await db
    .update(materialYards)
    .set({
      activeVer: existing.version,
      updatedAt: new Date(),
    })
    .where(eq(materialYards.id, existing.yardId));

  await writeM07Audit(req, session, 'CONFIRM_MATERIAL_REPORT', `${code} (${existing.version})`, {
    sectionId: existing.sectionId,
    version: existing.version,
  });

  return NextResponse.json({
    report: {
      ...updated,
      sectionName: yard?.sectionName ?? existing.sectionId,
      yardName: yard?.name ?? '',
    },
  });
}
