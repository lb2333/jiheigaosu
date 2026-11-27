import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { staffAttendanceAnomalies } from '@/db/schema/domains/m05';
import {
  formatNowTimeLabel,
  logM05Audit,
  requireWriteSession,
} from '../../_utils';

const patchAnomalySchema = z.object({
  resolved: z.boolean().optional(),
  handleNote: z.string().trim().max(400).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  const anomalyId = decodeURIComponent(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = patchAnomalySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '考勤异常核查参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(staffAttendanceAnomalies)
    .where(eq(staffAttendanceAnomalies.id, anomalyId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '考勤异常记录不存在' }, { status: 404 });
  }

  const nextResolved = parsed.data.resolved ?? true;
  const handleNote =
    parsed.data.handleNote?.trim() ||
    '已电话核实并比对现场带班巡检轨迹，确认处置结果无误。';
  const resolvedAt = formatNowTimeLabel();

  const [updated] = await db
    .update(staffAttendanceAnomalies)
    .set({
      resolved: nextResolved,
      handleNote,
      resolvedBy: session.user.name,
      resolvedAt,
      updatedAt: new Date(),
    })
    .where(eq(staffAttendanceAnomalies.id, anomalyId))
    .returning();

  await logM05Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'RESOLVE_ATTENDANCE_ANOMALY',
    target: `${updated.id} (${updated.staffId})`,
    detail: {
      resolved: nextResolved,
      handleNote,
      resolvedAt,
    },
  });

  return NextResponse.json({ anomaly: updated });
}
