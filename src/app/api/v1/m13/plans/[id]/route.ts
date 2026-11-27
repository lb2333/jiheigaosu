import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { publishPlans, publishTemplates } from '@/db/schema/domains/m13';
import {
  formatNowLabels,
  recordPublishAudit,
  requireWriteSession,
} from '../../_utils';

const updatePlanSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('config'),
    name: z.string().min(1).max(60),
    scene: z.enum(['施工导改', '天气预警', '智慧提速']),
    approvalStatus: z.enum(['已批准', '待批准']),
    interfaceStatus: z.enum(['接口就绪', '待接入', '待核验']),
    templateId: z.string().min(1).max(40),
    validRange: z.string().min(1).max(60),
  }),
  z.object({
    action: z.literal('approve_verify'),
  }),
]);

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const [plan] = await db
    .select()
    .from(publishPlans)
    .where(eq(publishPlans.id, id));
  if (!plan) {
    return NextResponse.json({ error: '联动预案不存在' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updatePlanSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '联动预案参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const now = formatNowLabels();

  if (d.action === 'approve_verify') {
    const nextLogs = [
      ...(Array.isArray(plan.triggerLogs) ? plan.triggerLogs : []),
      {
        time: `2026-11-26 ${now.hms}`,
        event: '人工完成预案审批与联动接口连通性核验，条件已满足',
        result: '匹配成功',
      },
    ];
    const [updated] = await db
      .update(publishPlans)
      .set({
        approvalStatus: '已批准',
        interfaceStatus: '接口就绪',
        conditionMet: true,
        flowStage: Math.max(plan.flowStage, 3),
        triggerLogs: nextLogs,
        updatedAt: new Date(),
      })
      .where(eq(publishPlans.id, id))
      .returning();

    await recordPublishAudit({
      session,
      action: 'publish_plan_approve_verify',
      target: id,
      detail: { conditionMet: true },
      req,
    });

    return NextResponse.json({ plan: updated });
  }

  const [tpl] = await db
    .select()
    .from(publishTemplates)
    .where(eq(publishTemplates.id, d.templateId));
  if (!tpl) {
    return NextResponse.json({ error: '关联内容模板不存在' }, { status: 404 });
  }

  const conditionMet =
    d.approvalStatus === '已批准' && d.interfaceStatus === '接口就绪';
  const nextFlowStage =
    conditionMet && plan.flowStage < 3 ? 3 : plan.flowStage;

  const [updated] = await db
    .update(publishPlans)
    .set({
      name: d.name.trim(),
      scene: d.scene,
      approvalStatus: d.approvalStatus,
      interfaceStatus: d.interfaceStatus,
      validRange: d.validRange.trim(),
      templateId: tpl.id,
      templateVersion: tpl.version,
      line1: tpl.line1,
      line2: tpl.line2,
      conditionMet,
      flowStage: nextFlowStage,
      updatedAt: new Date(),
    })
    .where(eq(publishPlans.id, id))
    .returning();

  await recordPublishAudit({
    session,
    action: 'publish_plan_config',
    target: id,
    detail: {
      name: updated.name,
      approvalStatus: updated.approvalStatus,
      interfaceStatus: updated.interfaceStatus,
      conditionMet: updated.conditionMet,
    },
    req,
  });

  return NextResponse.json({ plan: updated });
}
