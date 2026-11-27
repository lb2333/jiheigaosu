import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityMixingRecords } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const mixingPatchSchema = z.object({
  action: z.literal('handle'),
  handleNote: z.string().trim().min(1).max(1000).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (!['admin', 'engineer', 'supervisor'].includes(session.user.role ?? 'viewer')) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { id } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = mixingPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(qualityMixingRecords)
    .set({
      handled: true,
      handleNote:
        parsed.data.handleNote ??
        '已通知拌合站操作手校核称重传感器与骨料含水率补偿，后续盘次已恢复正常。',
      updatedAt: new Date(),
    })
    .where(eq(qualityMixingRecords.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: '拌合批次记录不存在' }, { status: 404 });
  }

  await writeM03Audit(req, session, 'MIXING_HANDLE_ALERT', id, {
    handleNote: updated.handleNote,
  });

  return NextResponse.json({ record: updated });
}
