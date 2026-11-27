import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { safetyActivities, safetyRiskPoints } from '@/db/schema/domains/m04';
import { secName } from '@/modules/m04_safety/types';
import { formatNowLabel, requireWriteSession } from '../../_utils';

const patchRiskSchema = z.object({
  status: z.enum(['管控中', '重点盯控', '正常受控']).optional(),
  measures: z.array(z.string().trim().min(1)).min(1).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { errorResponse } = await requireWriteSession();
  if (errorResponse) return errorResponse;

  const { id } = await context.params;
  const body = await req.json();
  const parsed = patchRiskSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '管控记录参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const updateFields: Record<string, unknown> = { updatedAt: new Date() };
  if (parsed.data.status !== undefined) updateFields.status = parsed.data.status;
  if (parsed.data.measures !== undefined) updateFields.measures = parsed.data.measures;

  const [updated] = await db
    .update(safetyRiskPoints)
    .set(updateFields)
    .where(eq(safetyRiskPoints.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: '风险点位不存在' }, { status: 404 });
  }

  const { short } = formatNowLabel();
  await db.insert(safetyActivities).values({
    title: `${secName(updated.sectionId)} · ${updated.name}管控更新`,
    timeLabel: short,
    code: updated.id,
    status: updated.status,
    tagClass: updated.status === '重点盯控' ? 'm04-tag-amber' : 'm04-tag-green',
    sectionId: updated.sectionId,
    icon: 'doc',
  });

  return NextResponse.json({ risk: updated });
}
