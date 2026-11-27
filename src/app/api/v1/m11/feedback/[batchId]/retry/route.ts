import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  speedFeedbackBatches,
  type SpeedFeedbackDevice,
} from '@/db/schema/domains/m11';
import {
  formatNowLabels,
  recordSpeedAudit,
  requireWriteSession,
} from '../../../_utils';

const retryDispatchSchema = z.object({
  deviceId: z.string().trim().min(1, '缺少目标设备编号'),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ batchId: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { batchId } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = retryDispatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '指令重发参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(speedFeedbackBatches)
    .where(eq(speedFeedbackBatches.batchId, batchId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '发布批次记录不存在' }, { status: 404 });
  }

  const { deviceId } = parsed.data;
  const targetIdx = existing.devices.findIndex((d) => d.id === deviceId);
  if (targetIdx === -1) {
    return NextResponse.json({ error: '目标设备不在该发布批次中' }, { status: 404 });
  }

  const { hms } = formatNowLabels();
  const prevDev = existing.devices[targetIdx];
  const updatedDevice: SpeedFeedbackDevice = {
    ...prevDev,
    status: '回执成功',
    receipt:
      prevDev.type === '情报板' ? '显示内容与指令一致' : `确认显示 ${prevDev.cmd}`,
    time: hms,
    exceptionTime: `已恢复 (${hms})`,
    logs: [
      ...prevDev.logs,
      `${hms}.040 [TX] 备用光纤通道重发 设备=${prevDev.id} 指令="${prevDev.cmd}"`,
      `${hms}.112 [RX] DISPLAY_VERIFIED 补发回执成功`,
    ],
  };

  const nextDevices = existing.devices.map((d, idx) =>
    idx === targetIdx ? updatedDevice : d
  );

  const [updatedBatch] = await db
    .update(speedFeedbackBatches)
    .set({
      devices: nextDevices,
      updatedAt: new Date(),
    })
    .where(eq(speedFeedbackBatches.batchId, batchId))
    .returning();

  await recordSpeedAudit({
    session,
    action: 'retry_speed_feedback_device',
    target: `${batchId}/${deviceId}`,
    detail: { batchId, deviceId, cmd: prevDev.cmd },
    req,
  });

  return NextResponse.json({
    batch: updatedBatch,
    device: updatedDevice,
  });
}
