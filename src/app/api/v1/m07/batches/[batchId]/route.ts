import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { materialArrivalBatches, materialYards } from '@/db/schema/domains/m07';
import { formatNowParts, requireM07WriteSession, writeM07Audit } from '../../_utils';

const batchTestItemSchema = z.object({
  name: z.string().min(1),
  pass: z.boolean().nullable(),
  val: z.string().min(1),
  std: z.string().min(1),
});

const patchBatchSchema = z.object({
  status: z.enum(['合格', '待检', '复检中', '不合格']),
  quarantineNote: z.string().trim().max(300).optional(),
  items: z.array(batchTestItemSchema).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ batchId: string }> }
) {
  const { session, errorResponse } = await requireM07WriteSession();
  if (errorResponse || !session) return errorResponse;

  const { batchId } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: '请求体 JSON 格式错误' }, { status: 400 });
  }

  const parsed = patchBatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '批次检验更新参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(materialArrivalBatches)
    .where(eq(materialArrivalBatches.batchId, batchId))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '进场批次不存在' }, { status: 404 });
  }

  const { full, short } = formatNowParts();
  const nextStatus = parsed.data.status;
  const nextItems =
    parsed.data.items ??
    existing.items.map((it) => {
      if (nextStatus === '合格') {
        return { ...it, pass: true, val: it.val.includes('待') || it.val.includes('复检') ? '符合规范要求' : it.val };
      }
      if (nextStatus === '待检') {
        return { ...it, pass: null };
      }
      return it;
    });

  const [updated] = await db
    .update(materialArrivalBatches)
    .set({
      status: nextStatus,
      quarantineNote:
        parsed.data.quarantineNote !== undefined
          ? parsed.data.quarantineNote
          : nextStatus === '不合格'
            ? existing.quarantineNote || '已挂红色不合格隔离牌，待退场清运。'
            : '',
      items: nextItems,
      inspectTime: nextStatus === '合格' ? full : `${full}（${nextStatus}）`,
      inspectTimeShort: short,
      updatedAt: new Date(),
    })
    .where(eq(materialArrivalBatches.batchId, batchId))
    .returning();

  const [yard] = await db
    .select()
    .from(materialYards)
    .where(eq(materialYards.id, updated.yardId))
    .limit(1);

  await writeM07Audit(req, session, 'UPDATE_MATERIAL_BATCH', `${batchId} -> ${nextStatus}`, {
    batchId,
    sectionId: updated.sectionId,
    prevStatus: existing.status,
    nextStatus,
  });

  return NextResponse.json({
    batch: {
      ...updated,
      sectionName: yard?.sectionName ?? updated.sectionId,
      yardName: yard?.name ?? '',
    },
  });
}
