import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { qualityBeamRecords } from '@/db/schema/domains/m03';
import { writeM03Audit } from '@/modules/m03_quality/api-auth';

const beamPatchSchema = z.object({
  action: z.enum(['clearAlert', 'advanceStep']),
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

  const parsed = beamPatchSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '参数校验失败', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const rows = await db
    .select()
    .from(qualityBeamRecords)
    .where(eq(qualityBeamRecords.id, id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({ error: '梁片记录不存在' }, { status: 404 });
  }

  const existing = rows[0];
  let patchFields: Partial<typeof qualityBeamRecords.$inferInsert>;

  if (parsed.data.action === 'clearAlert') {
    patchFields = {
      curing: '已完成',
      tension: existing.tension === '待复检' ? '合格' : existing.tension,
      alertState: '已处理',
      temp: '45.2 ℃',
      updatedAt: new Date(),
    };
  } else {
    if (existing.curing !== '已完成') {
      patchFields = { curing: '已完成', updatedAt: new Date() };
    } else if (existing.tension !== '合格') {
      patchFields = { tension: '合格', elongation: '+1.6%', updatedAt: new Date() };
    } else if (existing.grout !== '合格') {
      patchFields = { grout: '合格', groutPressure: '0.62 MPa', updatedAt: new Date() };
    } else {
      patchFields = { inspect: '合格', statusState: 'inspected', updatedAt: new Date() };
    }
  }

  const [updated] = await db
    .update(qualityBeamRecords)
    .set(patchFields)
    .where(eq(qualityBeamRecords.id, id))
    .returning();

  await writeM03Audit(req, session, `BEAM_${parsed.data.action.toUpperCase()}`, id, patchFields);

  return NextResponse.json({ record: updated });
}
