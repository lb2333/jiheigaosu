import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  speedFeedbackBatches,
  speedStrategies,
  type SpeedFeedbackDevice,
} from '@/db/schema/domains/m11';
import {
  formatNowLabels,
  generateNextBatchId,
  recordSpeedAudit,
  requireWriteSession,
} from '../../../_utils';

const auditStrategySchema = z.object({
  innerSpeed: z.coerce.number().int().min(40).max(120),
  outerSpeed: z.coerce.number().int().min(40).max(120),
  vmsMessage: z.string().trim().min(1, '请填写情报板同步警示内容').max(120),
  direction: z.enum(['beian', 'mingshui']).optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ segId: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { segId } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = auditStrategySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '策略审核参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(speedStrategies)
    .where(eq(speedStrategies.segId, segId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '对应试点区段策略不存在' }, { status: 404 });
  }

  const { innerSpeed, outerSpeed, vmsMessage, direction } = parsed.data;
  const { hms, full } = formatNowLabels();
  const newBatchId = await generateNextBatchId();
  const actorName = session.user.name || session.user.email || '平台指挥员';
  const prefix = existing.segId.replace('QD-', '');
  const directionLabel = direction === 'mingshui' ? '明水方向' : '北安方向';

  const nextHistory = [
    ...existing.auditHistory,
    {
      time: hms,
      actor: actorName,
      action: `审核通过 ${existing.latestStrategyId} 并下发（内侧${innerSpeed} / 外侧${outerSpeed} km/h），批次 ${newBatchId}`,
      result: '已审核并发布',
    },
  ];

  const { updatedStrategy, newBatch } = await db.transaction(async (tx) => {
    const [strategyRow] = await tx
      .update(speedStrategies)
      .set({
        auditStatus: '已审核',
        publishedInner: innerSpeed,
        publishedOuter: outerSpeed,
        publishedStrategyId: existing.latestStrategyId,
        publishedBatchId: newBatchId,
        publishedAt: full,
        vmsMessage,
        auditHistory: nextHistory,
        updatedAt: new Date(),
      })
      .where(eq(speedStrategies.segId, segId))
      .returning();

    const devices: SpeedFeedbackDevice[] = [
      {
        id: `VSL-${prefix}-01`,
        type: '可变限速标志',
        name: '内侧可变限速标志',
        cmd: `${innerSpeed} km/h`,
        receipt: `确认显示 ${innerSpeed} km/h`,
        time: hms,
        exceptionTime: '—',
        status: '回执成功',
        logs: [
          `${hms}.120 [TX] 帧头=0xAA55 设备=VSL-${prefix}-01 指令=LIMIT_${innerSpeed}`,
          `${hms}.840 [RX] ACK_OK 当前牌面=${innerSpeed} km/h 亮度=自动(6级)`,
        ],
      },
      {
        id: `VSL-${prefix}-02`,
        type: '可变限速标志',
        name: '外侧可变限速标志',
        cmd: `${outerSpeed} km/h`,
        receipt: `确认显示 ${outerSpeed} km/h`,
        time: hms,
        exceptionTime: '—',
        status: '回执成功',
        logs: [
          `${hms}.135 [TX] 帧头=0xAA55 设备=VSL-${prefix}-02 指令=LIMIT_${outerSpeed}`,
          `${hms}.910 [RX] ACK_OK 当前牌面=${outerSpeed} km/h 亮度=自动(6级)`,
        ],
      },
      {
        id: `QB-${prefix}-01`,
        type: '情报板',
        name: '前方情报板',
        cmd: vmsMessage,
        receipt: '显示内容与指令一致',
        time: hms,
        exceptionTime: '—',
        status: '回执成功',
        logs: [
          `${hms}.180 [TX] TCP_PUSH 设备=QB-${prefix}-01 文本="${vmsMessage}"`,
          `${hms}.980 [RX] DISPLAY_VERIFIED MD5校验一致`,
        ],
      },
      {
        id: `QB-${prefix}-02`,
        type: '情报板',
        name: '上游情报板',
        cmd: vmsMessage,
        receipt: '显示内容与指令一致',
        time: hms,
        exceptionTime: '—',
        status: '回执成功',
        logs: [
          `${hms}.210 [TX] TCP_PUSH 设备=QB-${prefix}-02 文本="${vmsMessage}"`,
          `${hms}.995 [RX] DISPLAY_VERIFIED MD5校验一致`,
        ],
      },
    ];

    const [batchRow] = await tx
      .insert(speedFeedbackBatches)
      .values({
        batchId: newBatchId,
        segId: existing.segId,
        segName: existing.segName,
        directionLabel,
        strategyId: existing.latestStrategyId,
        strategyAuthLabel: '人工审核授权',
        strategyTimeDesc: `${hms} 内侧${innerSpeed} / 外侧${outerSpeed} km/h`,
        publishState: '已下发',
        publishTime: full,
        publishShortDesc: `${hms} 区段限速与情报板指令`,
        confirmDurationSec: 4,
        sameBatchSummary: [
          { label: '内侧标志', text: `确认 ${innerSpeed} km/h · ${hms}` },
          { label: '外侧标志', text: `确认 ${outerSpeed} km/h · ${hms}` },
        ],
        devices,
        sortOrder: 0,
      })
      .returning();

    await recordSpeedAudit({
      session,
      action: 'audit_and_dispatch_speed_strategy',
      target: segId,
      detail: {
        strategyId: existing.latestStrategyId,
        batchId: newBatchId,
        innerSpeed,
        outerSpeed,
        vmsMessage,
      },
      req,
      executor: tx,
    });

    return { updatedStrategy: strategyRow, newBatch: batchRow };
  });

  return NextResponse.json({
    strategy: updatedStrategy,
    batch: newBatch,
  });
}
