import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { videoPatrolGroups } from '@/db/schema/domains/m10';
import { logM10Audit, requireWriteSession } from '../../_utils';

const patchGroupSchema = z.object({
  name: z.string().trim().min(1).max(60).optional(),
  cameraIds: z.array(z.string().trim().min(1)).min(1).max(9).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = patchGroupSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '视频组合更新参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updateFields: Partial<typeof videoPatrolGroups.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.name !== undefined) updateFields.name = parsed.data.name;
  if (parsed.data.cameraIds !== undefined) updateFields.cameraIds = parsed.data.cameraIds;

  const [updated] = await db
    .update(videoPatrolGroups)
    .set(updateFields)
    .where(eq(videoPatrolGroups.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: '未找到指定视频组合' }, { status: 404 });
  }

  await logM10Audit({
    session,
    action: 'UPDATE_PATROL_GROUP',
    target: `${updated.name} (${updated.id})`,
    detail: parsed.data as Record<string, unknown>,
    req,
  });

  return NextResponse.json({ group: updated });
}

export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  const [target] = await db
    .select()
    .from(videoPatrolGroups)
    .where(eq(videoPatrolGroups.id, id));

  if (!target) {
    return NextResponse.json({ error: '未找到指定视频组合' }, { status: 404 });
  }

  if (target.builtIn) {
    return NextResponse.json({ error: '系统预设视频组合不可删除' }, { status: 400 });
  }

  await db.delete(videoPatrolGroups).where(eq(videoPatrolGroups.id, id));

  await logM10Audit({
    session,
    action: 'DELETE_PATROL_GROUP',
    target: `${target.name} (${target.id})`,
    detail: { deletedId: id },
    req,
  });

  return NextResponse.json({ deletedId: id });
}
