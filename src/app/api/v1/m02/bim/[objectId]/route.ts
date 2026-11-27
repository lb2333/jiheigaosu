import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { progressBimObjects } from '@/db/schema/domains/m02';

const updateBimSchema = z.object({
  simProgress: z.number().min(0).max(100).optional(),
  simDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  selectedTaskId: z.string().min(1).max(40).optional(),
});

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ objectId: string }> }
) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const role = session.user.role;
  if (role !== 'admin' && role !== 'engineer' && role !== 'supervisor') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { objectId } = await context.params;
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = updateBimSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid payload', issues: parsed.error.issues }, { status: 400 });
  }

  const patch: Partial<typeof progressBimObjects.$inferInsert> = {
    updatedAt: new Date(),
  };
  if (parsed.data.simProgress !== undefined) patch.simProgress = parsed.data.simProgress;
  if (parsed.data.simDate !== undefined) patch.simDate = parsed.data.simDate;
  if (parsed.data.selectedTaskId !== undefined) patch.selectedTaskId = parsed.data.selectedTaskId;

  const [updated] = await db
    .update(progressBimObjects)
    .set(patch)
    .where(eq(progressBimObjects.id, objectId))
    .returning();

  if (!updated) {
    return NextResponse.json({ error: 'BIM object not found' }, { status: 404 });
  }

  return NextResponse.json({ object: updated });
}
