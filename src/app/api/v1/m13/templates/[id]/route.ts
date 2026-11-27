import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { publishTemplates } from '@/db/schema/domains/m13';
import {
  bumpVersion,
  recordPublishAudit,
  requireWriteSession,
} from '../../_utils';

const updateTemplateSchema = z.object({
  name: z.string().min(1).max(60).optional(),
  category: z.enum(['常用文本', '板面模板', '预案内容']).optional(),
  spec: z.enum(['单黄LED 128×48', '全彩LED 192×64']).optional(),
  status: z.enum(['有效', '待启用']).optional(),
  line1: z.string().min(1).max(20).optional(),
  line2: z.string().min(1).max(20).optional(),
  startTime: z.string().min(1).max(32).optional(),
  endTime: z.string().min(1).max(32).optional(),
  bumpVer: z.boolean().optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { id } = await context.params;
  const [existing] = await db
    .select()
    .from(publishTemplates)
    .where(eq(publishTemplates.id, id));
  if (!existing) {
    return NextResponse.json({ error: '模板不存在' }, { status: 404 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateTemplateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '更新模板参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const nextVersion = d.bumpVer === false ? existing.version : bumpVersion(existing.version);

  const [updated] = await db
    .update(publishTemplates)
    .set({
      name: d.name?.trim() ?? existing.name,
      category: d.category ?? existing.category,
      spec: d.spec ?? existing.spec,
      status: d.status ?? existing.status,
      line1: d.line1?.trim() ?? existing.line1,
      line2: d.line2?.trim() ?? existing.line2,
      startTime: d.startTime?.trim() ?? existing.startTime,
      endTime: d.endTime?.trim() ?? existing.endTime,
      version: nextVersion,
      updatedAt: new Date(),
    })
    .where(eq(publishTemplates.id, id))
    .returning();

  await recordPublishAudit({
    session,
    action: 'update_publish_template',
    target: id,
    detail: { version: updated.version, category: updated.category, spec: updated.spec },
    req,
  });

  return NextResponse.json({ template: updated });
}
