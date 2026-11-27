import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { staffMembers } from '@/db/schema/domains/m05';
import { logM05Audit, requireWriteSession } from '../../_utils';

const patchStaffSchema = z.object({
  status: z.enum(['在岗', '暂未在岗']).optional(),
  toggle: z.boolean().optional(),
  offReason: z.string().trim().max(200).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  const staffId = decodeURIComponent(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = patchStaffSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '人员状态更新参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(staffMembers)
    .where(eq(staffMembers.id, staffId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '人员档案不存在' }, { status: 404 });
  }

  const nextStatus =
    parsed.data.status ??
    (parsed.data.toggle ? (existing.status === '在岗' ? '暂未在岗' : '在岗') : existing.status);

  const nextOffReason =
    nextStatus === '暂未在岗'
      ? parsed.data.offReason?.trim() || existing.offReason || '临时调休/外出培训'
      : '';

  const [updated] = await db
    .update(staffMembers)
    .set({
      status: nextStatus,
      offReason: nextOffReason,
      updatedAt: new Date(),
    })
    .where(eq(staffMembers.id, staffId))
    .returning();

  await logM05Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_STAFF_DUTY',
    target: `${updated.name} (${updated.id})`,
    detail: {
      previousStatus: existing.status,
      status: nextStatus,
      offReason: nextOffReason,
    },
  });

  return NextResponse.json({ staff: updated });
}
