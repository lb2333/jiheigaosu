import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { pinganTopics } from '@/db/schema/domains/m12';
import { DIRECTION_LIST, STAGE_LIST } from '@/modules/m12_pingan/types';
import { formatStampLabel, logM12Audit, requireWriteSession } from '../../_utils';

const patchTopicSchema = z.object({
  name: z.string().trim().min(1, '专题名称不能为空').max(120, '专题名称不能超过 120 字').optional(),
  shortName: z.string().trim().min(1).max(120).optional(),
  summary: z.string().trim().max(500).optional(),
  direction: z.enum(DIRECTION_LIST).optional(),
  stage: z.enum(STAGE_LIST).optional(),
  achievements: z.string().trim().max(300).optional(),
  note: z.string().trim().max(300).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse!;

  const { id } = await context.params;
  const topicId = decodeURIComponent(id);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式无效' }, { status: 400 });
  }

  const parsed = patchTopicSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '专题更新参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(pinganTopics)
    .where(eq(pinganTopics.id, topicId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '研究专题不存在' }, { status: 404 });
  }

  const data = parsed.data;
  const nextName = data.name ?? existing.name;
  const nextShortName =
    data.shortName ??
    (data.name && data.name !== existing.name ? data.name : existing.shortName);
  const nextSummary = data.summary !== undefined ? data.summary : existing.summary;
  const nextDirection = data.direction ?? existing.direction;
  const nextStage = data.stage ?? existing.stage;
  const nextAchievements =
    data.achievements !== undefined ? data.achievements || '—' : existing.achievements;
  const nextNote = data.note !== undefined ? data.note || '—' : existing.note;

  const [updated] = await db
    .update(pinganTopics)
    .set({
      name: nextName,
      shortName: nextShortName,
      summary: nextSummary,
      direction: nextDirection,
      stage: nextStage,
      achievements: nextAchievements,
      note: nextNote,
      updatedAt: new Date(),
    })
    .where(eq(pinganTopics.id, topicId))
    .returning();

  await logM12Audit({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_PINGAN_TOPIC',
    target: `${updated.id} ${updated.shortName}`,
    detail: {
      previousStage: existing.stage,
      stage: updated.stage,
      direction: updated.direction,
    },
  });

  return NextResponse.json({
    topic: {
      id: updated.id,
      name: updated.name,
      shortName: updated.shortName,
      summary: updated.summary,
      direction: updated.direction,
      stage: updated.stage,
      achievements: updated.achievements,
      note: updated.note,
      sectionId: updated.sectionId,
      deliverables: updated.deliverables,
      sortOrder: updated.sortOrder,
      updatedAt: formatStampLabel(updated.updatedAt),
    },
  });
}
