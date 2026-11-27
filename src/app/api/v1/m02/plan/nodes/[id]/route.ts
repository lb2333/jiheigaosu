import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';
import { progressPlanNodes } from '@/db/schema/domains/m02';

const updateNodeSchema = z.object({
  status: z.enum(['已完成', '按计划推进', '正常', '滞后预警', '规划节点']).optional(),
  statusTone: z.enum(['ok', 'info', 'warn']).optional(),
  planDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== 'admin' && role !== 'engineer' && role !== 'supervisor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateNodeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { status, statusTone, planDate } = parsed.data;
  const derivedTone =
    statusTone ??
    (status === '已完成' || status === '正常'
      ? 'ok'
      : status === '滞后预警'
        ? 'warn'
        : status
          ? 'info'
          : undefined);

  const patchData: Partial<typeof progressPlanNodes.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (status !== undefined) patchData.status = status;
  if (derivedTone !== undefined) patchData.statusTone = derivedTone;
  if (planDate !== undefined) patchData.planDate = planDate;

  const [updated] = await db
    .update(progressPlanNodes)
    .set(patchData)
    .where(eq(progressPlanNodes.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'Node not found' }, { status: 404 });
  }

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_PLAN_NODE',
    moduleId: 'progress',
    target: `${updated.title} (${updated.id})`,
    detail: parsed.data,
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ node: updated });
}
