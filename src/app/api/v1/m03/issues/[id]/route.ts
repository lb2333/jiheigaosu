import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityIssues } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const issuePatchSchema = z.object({
  action: z.literal('close').optional(),
  measure: z.string().trim().min(1).max(1000).optional(),
  status: z.enum(['整改中', '已整改', '已超期']).optional(),
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

  const parsed = issuePatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const rows = await db
    .select()
    .from(qualityIssues)
    .where(eq(qualityIssues.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: '质量问题记录不存在' }, { status: 404 });
  }

  const existing = rows[0];
  const nextStatus = parsed.data.status ?? '已整改';
  const nextMeasure = parsed.data.measure ?? existing.measure;

  const [updated] = await db
    .update(qualityIssues)
    .set({
      status: nextStatus,
      measure: nextMeasure,
      daysUsed: nextStatus === '已整改' ? existing.daysUsed ?? 1.9 : existing.daysUsed,
      updatedAt: new Date(),
    })
    .where(eq(qualityIssues.id, id))
    .returning();

  await writeM03Audit(req, session, 'QUALITY_ISSUE_RECTIFY', id, {
    fromStatus: existing.status,
    toStatus: nextStatus,
    measure: nextMeasure,
  });

  return NextResponse.json({ record: updated });
}
