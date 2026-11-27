import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityPavementRecords } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const pavementPatchSchema = z.object({
  action: z.literal('verify'),
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

  const parsed = pavementPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [updated] = await db
    .update(qualityPavementRecords)
    .set({ verified: true, updatedAt: new Date() })
    .where(eq(qualityPavementRecords.id, id))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: '路面检测记录不存在' }, { status: 404 });
  }

  await writeM03Audit(req, session, 'PAVEMENT_VERIFY', id, {
    stake: updated.stake,
    judge: updated.judge,
  });

  return NextResponse.json({ record: updated });
}
