import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { safetyActivities, safetyAiAlerts, safetyHazards } from '@/db/schema/domains/m04';
import { secName } from '@/modules/m04_safety/types';
import { formatNowLabel, generateNextHazardId, requireWriteSession } from '../../_utils';

const patchAiAlertSchema = z.object({
  action: z.enum(['confirm', 'falseAlarm', 'duplicate']),
  note: z.string().optional(),
  linkedHazardId: z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireWriteSession();
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const parsed = patchAiAlertSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'AI预警核实参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(safetyAiAlerts)
    .where(eq(safetyAiAlerts.id, id))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: 'AI预警记录不存在' }, { status: 404 });
  }

  const { action, note, linkedHazardId } = parsed.data;
  const { short } = formatNowLabel();

  if (action === 'confirm') {
    if (existing.status === '已确认' && existing.linkedHazardId) {
      return NextResponse.json({ alert: existing, hazardId: existing.linkedHazardId });
    }

    const newHazardId = await generateNextHazardId(existing.period);
    const cleanNote =
      note?.trim() || `视频AI抓拍（${existing.camera}）：${existing.event}，人工核实确认。`;
    const hazardDesc = existing.event.replace(/^疑似/, '') || existing.event;
    const category =
      existing.algorithm.includes('安全帽') || existing.algorithm.includes('反光衣')
        ? '高处作业'
        : existing.algorithm.includes('烟雾')
          ? '临时用电'
          : '临边防护';

    const [createdHazard] = await db
      .insert(safetyHazards)
      .values({
        id: newHazardId,
        period: existing.period,
        sectionId: existing.sectionId,
        location: `${secName(existing.sectionId)} · ${existing.location}`,
        source: '视频AI',
        category,
        description: hazardDesc,
        level: '一般隐患',
        dueDate: '2026-11-27',
        dueFull: '2026-11-27 17:00',
        status: '待派发',
        overdue: false,
        foundAt: existing.alertTime,
        dispatchedAt: '',
        feedbackAt: '',
        owner: '整改负责人A（演示）',
        req: cleanNote,
        beforeNote: cleanNote,
        afterNote: '',
        reviewer: '监理复查人员A（演示）',
        reviewTime: '',
        reviewNote: '',
        attachment: '',
        sortOrder: 0,
      })
      .returning();

    const [updatedAlert] = await db
      .update(safetyAiAlerts)
      .set({
        status: '已确认',
        note: cleanNote,
        linkedHazardId: newHazardId,
      })
      .where(eq(safetyAiAlerts.id, id))
      .returning();

    await db.insert(safetyActivities).values({
      title: `${secName(existing.sectionId)} · ${hazardDesc}`,
      timeLabel: short,
      code: newHazardId,
      status: '待派发',
      tagClass: 'm04-tag-amber',
      sectionId: existing.sectionId,
      icon: 'camera',
    });

    return NextResponse.json({ alert: updatedAlert, hazard: createdHazard });
  }

  if (action === 'falseAlarm') {
    const cleanNote = note?.trim() || '经人工核查现场画面，判定为误报。';
    const [updatedAlert] = await db
      .update(safetyAiAlerts)
      .set({
        status: '已标误报',
        note: cleanNote,
      })
      .where(eq(safetyAiAlerts.id, id))
      .returning();

    return NextResponse.json({ alert: updatedAlert });
  }

  // duplicate
  const targetId = linkedHazardId?.trim();
  if (!targetId) {
    return NextResponse.json({ error: '关联重复必须指定已有隐患编号' }, { status: 400 });
  }

  const cleanNote = note?.trim() || `已关联既有隐患 ${targetId}`;
  const [updatedAlert] = await db
    .update(safetyAiAlerts)
    .set({
      status: '重复关联',
      note: cleanNote,
      linkedHazardId: targetId,
    })
    .where(eq(safetyAiAlerts.id, id))
    .returning();

  return NextResponse.json({ alert: updatedAlert });
}
