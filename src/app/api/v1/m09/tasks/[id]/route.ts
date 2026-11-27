import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { uavTasks } from '@/db/schema/domains/m09';
import { recordUavAudit, requireWriteSession } from '../../_utils';

const patchTaskSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('savePlan'),
    name: z.string().min(1).max(100),
    sectionId: z.enum(['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6']),
    target: z.string().min(1).max(100),
    type: z.enum(['专项', '全面', '应急']),
    planTime: z.string().min(5).max(32),
    uav: z.string().min(1).max(50),
    owner: z.string().min(1).max(50),
    routeCode: z.string().min(1).max(50),
    hangar: z.string().min(1).max(50),
    checks: z.array(z.string()).min(1),
  }),
  z.object({
    action: z.literal('passPreflight'),
  }),
  z.object({
    action: z.literal('dispatch'),
  }),
]);

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const body = await req.json().catch(() => null);
  const parsed = patchTaskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '巡检任务更新参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(uavTasks)
    .where(eq(uavTasks.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '巡检任务不存在' }, { status: 404 });
  }

  const d = parsed.data;
  if (d.action === 'savePlan') {
    const [updated] = await db
      .update(uavTasks)
      .set({
        name: d.name.trim(),
        sectionId: d.sectionId,
        target: d.target.trim(),
        type: d.type,
        typeFull: `${d.type}巡检`,
        planTime: d.planTime.trim(),
        shortTime: d.planTime.trim().slice(5),
        uav: d.uav,
        owner: d.owner,
        routeCode: d.routeCode,
        hangar: d.hangar,
        checks: d.checks,
        updatedAt: new Date(),
      })
      .where(eq(uavTasks.id, id))
      .returning();

    await recordUavAudit({
      session,
      action: 'update_uav_task_plan',
      target: id,
      detail: { name: updated.name, uav: updated.uav },
      req,
    });

    return NextResponse.json({ task: updated });
  }

  if (d.action === 'passPreflight') {
    const [updated] = await db
      .update(uavTasks)
      .set({
        preflightPassed: true,
        updatedAt: new Date(),
      })
      .where(eq(uavTasks.id, id))
      .returning();

    await recordUavAudit({
      session,
      action: 'pass_uav_preflight',
      target: id,
      detail: { preflightPassed: true },
      req,
    });

    return NextResponse.json({ task: updated });
  }

  // dispatch
  if (!existing.preflightPassed) {
    return NextResponse.json(
      { error: '请先完成飞前检查全部核验项，再下发任务' },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(uavTasks)
    .set({
      status: '执行中',
      stage: 4,
      updatedAt: new Date(),
    })
    .where(eq(uavTasks.id, id))
    .returning();

  await recordUavAudit({
    session,
    action: 'dispatch_uav_task',
    target: id,
    detail: { hangar: existing.hangar, uav: existing.uav },
    req,
  });

  return NextResponse.json({ task: updated });
}
