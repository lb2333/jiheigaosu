import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs, poiObjects, workSections } from '@/db/schema';

const updateSectionSchema = z.object({
  id: z.string().min(1),
  stakeRange: z.string().min(1).optional(),
  keyWorksCount: z.number().int().min(0).optional(),
  yardsCount: z.number().int().min(0).optional(),
});

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [sections, pois] = await Promise.all([
    db.select().from(workSections).orderBy(asc(workSections.sortOrder)),
    db.select().from(poiObjects),
  ]);

  return NextResponse.json({ workSections: sections, poiObjects: pois });
}

export async function PATCH(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin' && session.user.role !== 'engineer') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = updateSectionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const { id, ...rest } = parsed.data;
  const [updated] = await db
    .update(workSections)
    .set({ ...rest, updatedAt: new Date() })
    .where(eq(workSections.id, id))
    .returning();

  if (!updated) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_SECTION_BASE',
    moduleId: 'system',
    target: updated.name,
    detail: rest,
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ section: updated });
}
