import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityLabRecords } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const labPatchSchema = z.object({
  action: z.enum(['retest', 'signReport']),
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

  const parsed = labPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const existing = await db
    .select()
    .from(qualityLabRecords)
    .where(eq(qualityLabRecords.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: '检测记录不存在' }, { status: 404 });
  }

  const patchFields =
    parsed.data.action === 'retest'
      ? { retestState: '已复检', updatedAt: new Date() }
      : { reportState: '已出具', hash: '8A1C...F92E', updatedAt: new Date() };

  const [updated] = await db
    .update(qualityLabRecords)
    .set(patchFields)
    .where(eq(qualityLabRecords.id, id))
    .returning();

  await writeM03Audit(
    req,
    session,
    parsed.data.action === 'retest' ? 'LAB_RETEST' : 'LAB_SIGN_REPORT',
    id,
    { action: parsed.data.action }
  );

  return NextResponse.json({ record: updated });
}
