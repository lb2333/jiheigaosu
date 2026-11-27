import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';
import { measureContracts, measureRecords } from '@/db/schema/domains/m08';
import { ALLOWED_WRITE_ROLES } from '@/modules/m08_measure/server-helpers';

const patchSchema = z.object({
  action: z.enum(['audit', 'confirm', 'syncPay']),
  status: z.enum(['已确认', '审核中', '待审核']).optional(),
  payStatus: z.enum(['已支付', '办理中', '待支付', '未回传']).optional(),
  reviewer: z.string().min(1).max(60).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!ALLOWED_WRITE_ROLES.has(session.user.role ?? 'viewer')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: 'Missing record ID' }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(measureRecords)
    .where(eq(measureRecords.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: 'Record not found' }, { status: 404 });
  }

  const { action, status, payStatus, reviewer } = parsed.data;
  const nowLabel = '11-26 11:20';
  const syncLabel = '2026-11-26 11:20';

  let nextStatus = existing.status;
  let nextPayStatus = existing.payStatus;
  let nextPaidAmount = existing.paidAmount;
  let nextPayTime = existing.payTime;

  if (action === 'audit') {
    nextStatus = status ?? '审核中';
  } else if (action === 'confirm') {
    nextStatus = status ?? '已确认';
    if (existing.payStatus === '未回传') {
      nextPayStatus = payStatus ?? '待支付';
    }
  } else if (action === 'syncPay') {
    nextPayStatus = payStatus ?? (existing.status === '已确认' ? '已支付' : '办理中');
    if (nextPayStatus === '已支付') {
      nextPaidAmount = existing.amount;
      nextPayTime = nowLabel;
    } else if (nextPayStatus === '未回传') {
      nextPaidAmount = 0;
      nextPayTime = '—';
    }
  }

  const [updated] = await db
    .update(measureRecords)
    .set({
      status: nextStatus,
      payStatus: nextPayStatus,
      paidAmount: nextPaidAmount,
      payTime: nextPayTime,
      syncTime: syncLabel,
      reviewer: reviewer ?? existing.reviewer,
      updatedAt: new Date(),
    })
    .where(eq(measureRecords.id, id))
    .returning();

  // If payment status changed to 已支付 from non-已支付, reflect in section's paidReturnAmount
  if (existing.payStatus !== '已支付' && nextPayStatus === '已支付') {
    const [contract] = await db
      .select()
      .from(measureContracts)
      .where(eq(measureContracts.sectionId, existing.sectionId))
      .limit(1);
    if (contract) {
      await db
        .update(measureContracts)
        .set({
          paidReturnAmount: Number(
            (contract.paidReturnAmount + existing.amount).toFixed(2)
          ),
          payReturned: true,
          updatedAt: new Date(),
        })
        .where(eq(measureContracts.sectionId, existing.sectionId));
    }
  }

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: `MEASURE_${action.toUpperCase()}`,
    moduleId: 'measure',
    target: updated.id,
    detail: {
      prevStatus: existing.status,
      nextStatus: updated.status,
      prevPayStatus: existing.payStatus,
      nextPayStatus: updated.payStatus,
    },
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ record: updated });
}
