import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavReports } from '@/db/schema/domains/m09';
import { formatNowLabels, recordUavAudit, requireWriteSession } from '../../_utils';

const patchReportSchema = z.object({
  action: z.enum(['archive', 'markRecheck']),
  summary: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = patchReportSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '巡检报告审批状态参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(uavReports)
    .where(eq(uavReports.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '巡检报告不存在' }, { status: 404 });
  }

  const d = parsed.data;
  const { short, date } = formatNowLabels();
  const nextStatus = d.action === 'archive' ? '已归档' : '待复查';
  const nextTimeline = existing.timeline.map((step, idx) =>
    idx === existing.timeline.length - 1
      ? {
          date: date.slice(5),
          text:
            d.action === 'archive'
              ? '报告已正式归档并同步安全台账'
              : '已发起同点位复查流程',
          done: d.action === 'archive',
        }
      : step
  );

  const [updated] = await db
    .update(uavReports)
    .set({
      status: nextStatus,
      archiveTime: d.action === 'archive' ? short : '待归档确认',
      handleStatus: d.action === 'archive' ? '已完成归档' : '待复查闭环',
      summary: d.summary?.trim() || existing.summary,
      timeline: nextTimeline,
      updatedAt: new Date(),
    })
    .where(eq(uavReports.id, id))
    .returning();

  await recordUavAudit({
    session,
    action: d.action === 'archive' ? 'archive_uav_report' : 'recheck_uav_report',
    target: id,
    detail: { status: nextStatus },
    req,
  });

  return NextResponse.json({ report: updated });
}
