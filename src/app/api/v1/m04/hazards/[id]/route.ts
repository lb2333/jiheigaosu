import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { safetyActivities, safetyHazards } from '@/db/schema/domains/m04';
import { secName } from '@/modules/m04_safety/types';
import { formatNowLabel, requireWriteSession } from '../../_utils';

const patchHazardSchema = z.object({
  action: z.enum(['dispatch', 'submitFeedback', 'approveReview', 'rejectReview', 'urge']),
  owner: z.string().trim().optional(),
  dueFull: z.string().trim().optional(),
  req: z.string().trim().optional(),
  afterNote: z.string().trim().optional(),
  reviewer: z.string().trim().optional(),
  reviewTime: z.string().trim().optional(),
  reviewNote: z.string().trim().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireWriteSession();
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const parsed = patchHazardSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '隐患处置参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(safetyHazards)
    .where(eq(safetyHazards.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '隐患台账记录不存在' }, { status: 404 });
  }

  const data = parsed.data;
  const { full, short } = formatNowLabel();
  const sName = secName(existing.sectionId);

  if (data.action === 'urge') {
    await db.insert(safetyActivities).values({
      title: `${sName} · ${existing.description}`,
      timeLabel: short,
      code: existing.id,
      status: '已催办',
      tagClass: 'm04-tag-red',
      sectionId: existing.sectionId,
      icon: 'clock',
    });
    return NextResponse.json({ hazard: existing, urged: true });
  }

  const updateFields: Record<string, unknown> = {};
  if (data.owner) updateFields.owner = data.owner;
  if (data.dueFull) {
    updateFields.dueFull = data.dueFull;
    updateFields.dueDate = data.dueFull.slice(0, 10);
  }
  if (data.req !== undefined) updateFields.req = data.req;

  let actStatus = existing.status;
  let actTag = 'm04-tag-blue';
  let actIcon = 'flag';

  if (data.action === 'dispatch') {
    updateFields.status = '整改中';
    updateFields.dispatchedAt = full;
    actStatus = '已派发';
    actTag = 'm04-tag-blue';
    actIcon = 'flag';
  } else if (data.action === 'submitFeedback') {
    updateFields.status = '待复查';
    updateFields.overdue = false;
    updateFields.feedbackAt = full;
    updateFields.afterNote =
      data.afterNote?.trim() || '已完成现场整改并上传反馈照片，申请监理复查。';
    updateFields.attachment = existing.attachment || `${existing.id}_整改反馈.jpg`;
    actStatus = '待复查';
    actTag = 'm04-tag-amber';
    actIcon = 'checkCircle';
  } else if (data.action === 'approveReview') {
    updateFields.status = '已销项';
    updateFields.overdue = false;
    updateFields.reviewer = data.reviewer?.trim() || existing.reviewer || '监理复查人员A（演示）';
    updateFields.reviewTime = data.reviewTime?.trim() || full;
    updateFields.reviewNote = data.reviewNote?.trim() || '现场复查合格，予以销项。';
    actStatus = '已销项';
    actTag = 'm04-tag-green';
    actIcon = 'checkCircle';
  } else if (data.action === 'rejectReview') {
    updateFields.status = '整改中';
    updateFields.reviewer = data.reviewer?.trim() || existing.reviewer || '监理复查人员A（演示）';
    updateFields.reviewTime = data.reviewTime?.trim() || full;
    updateFields.reviewNote =
      data.reviewNote?.trim() || '防护细节仍需加固，退回施工单位重新整改。';
    actStatus = '退回重改';
    actTag = 'm04-tag-red';
    actIcon = 'refresh';
  }

  const updated = await db.transaction(async (tx) => {
    const [row] = await tx
      .update(safetyHazards)
      .set(updateFields)
      .where(eq(safetyHazards.id, id))
      .returning();

    await tx.insert(safetyActivities).values({
      title: `${sName} · ${existing.description}`,
      timeLabel: short,
      code: existing.id,
      status: actStatus,
      tagClass: actTag,
      sectionId: existing.sectionId,
      icon: actIcon,
    });

    return row;
  });

  return NextResponse.json({ hazard: updated });
}
