import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { safetyActivities, safetyHazards } from '@/db/schema/domains/m04';
import { uavHazardClues } from '@/db/schema/domains/m09';
import { secLabel } from '@/modules/m09_uav/types';
import {
  formatNowLabels,
  generateNextSafetyHazardId,
  recordUavAudit,
  requireWriteSession,
} from '../../_utils';

const patchClueSchema = z.discriminatedUnion('action', [
  z.object({
    action: z.literal('confirm'),
    note: z.string().optional(),
  }),
  z.object({
    action: z.literal('falsePositive'),
    note: z.string().optional(),
  }),
  z.object({
    action: z.literal('linkDuplicate'),
    linkedHazard: z.string().min(1),
    note: z.string().optional(),
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
  const parsed = patchClueSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '隐患线索核查参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(uavHazardClues)
    .where(eq(uavHazardClues.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '无人机识别线索不存在' }, { status: 404 });
  }

  const d = parsed.data;
  const { short } = formatNowLabels();

  if (d.action === 'confirm') {
    const cleanNote =
      d.note?.trim() || existing.note || '经无人机航拍取证及人工核查，确认存在安全隐患。';
    const hazardId = existing.linkedHazard || (await generateNextSafetyHazardId());
    const hazardDesc = existing.title.replace(/^疑似/, '') || existing.title;

    if (!existing.linkedHazard) {
      await db
        .insert(safetyHazards)
        .values({
          id: hazardId,
          period: '2026-11',
          sectionId: existing.sectionId,
          location: existing.location,
          source: '无人机巡检',
          category: existing.category,
          description: hazardDesc,
          level: '一般隐患',
          dueDate: '2026-11-28',
          dueFull: '2026-11-28 17:00',
          status: '待派发',
          overdue: false,
          foundAt: existing.foundTime,
          dispatchedAt: '',
          feedbackAt: '',
          owner: '整改负责人A（演示）',
          req: cleanNote,
          beforeNote: cleanNote,
          afterNote: '',
          reviewer: session.user.name || '核查人员A（演示）',
          reviewTime: '',
          reviewNote: '',
          attachment: existing.imgName,
          sortOrder: 0,
        })
        .onConflictDoNothing();

      await db.insert(safetyActivities).values({
        title: `${secLabel(existing.sectionId)} · ${hazardDesc}`,
        timeLabel: short,
        code: hazardId,
        status: '待派发',
        tagClass: 'm04-tag-amber',
        sectionId: existing.sectionId,
        icon: 'drone',
      });
    }

    const [updated] = await db
      .update(uavHazardClues)
      .set({
        status: '已确认隐患',
        note: cleanNote,
        linkedHazard: hazardId,
        updatedAt: new Date(),
      })
      .where(eq(uavHazardClues.id, id))
      .returning();

    await recordUavAudit({
      session,
      action: 'confirm_uav_clue_to_safety',
      target: id,
      detail: { linkedHazard: hazardId },
      req,
    });

    return NextResponse.json({ clue: updated, linkedHazard: hazardId });
  }

  if (d.action === 'falsePositive') {
    const cleanNote =
      d.note?.trim() || existing.note || '经人工核查现场影像，判定为误识别。';
    const [updated] = await db
      .update(uavHazardClues)
      .set({
        status: '已标误报',
        note: cleanNote,
        updatedAt: new Date(),
      })
      .where(eq(uavHazardClues.id, id))
      .returning();

    await recordUavAudit({
      session,
      action: 'mark_uav_clue_false_positive',
      target: id,
      detail: { note: cleanNote },
      req,
    });

    return NextResponse.json({ clue: updated });
  }

  // linkDuplicate
  const cleanNote =
    d.note?.trim() || `已核查并关联至已有安全隐患台账 ${d.linkedHazard.trim()}`;
  const [updated] = await db
    .update(uavHazardClues)
    .set({
      status: '已关联重复',
      linkedHazard: d.linkedHazard.trim(),
      note: cleanNote,
      updatedAt: new Date(),
    })
    .where(eq(uavHazardClues.id, id))
    .returning();

  await recordUavAudit({
    session,
    action: 'link_uav_clue_duplicate',
    target: id,
    detail: { linkedHazard: d.linkedHazard.trim() },
    req,
  });

  return NextResponse.json({ clue: updated });
}
