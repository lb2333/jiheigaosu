import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { and, asc, desc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { aiMessages, aiThreads } from '@/db/schema';

const createThreadSchema = z.object({
  scenario: z.enum(['exhibition', 'analysis', 'field', 'drawer']).default('analysis'),
  title: z.string().min(1).max(120),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const scenario = req.nextUrl.searchParams.get('scenario');
  const threads = scenario
    ? await db
        .select()
        .from(aiThreads)
        .where(and(eq(aiThreads.userId, session.user.id), eq(aiThreads.scenario, scenario)))
        .orderBy(desc(aiThreads.pinned), desc(aiThreads.updatedAt))
    : await db
        .select()
        .from(aiThreads)
        .where(eq(aiThreads.userId, session.user.id))
        .orderBy(desc(aiThreads.pinned), desc(aiThreads.updatedAt));

  const threadIds = threads.map((t) => t.id);
  const messagesByThread: Record<string, typeof aiMessages.$inferSelect[]> = {};
  for (const tid of threadIds) {
    messagesByThread[tid] = await db
      .select()
      .from(aiMessages)
      .where(eq(aiMessages.threadId, tid))
      .orderBy(asc(aiMessages.createdAt));
  }

  return NextResponse.json({ threads, messagesByThread });
}

export async function POST(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const parsed = createThreadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数无效' }, { status: 400 });
  }

  const id = `thread-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
  const [thread] = await db
    .insert(aiThreads)
    .values({
      id,
      userId: session.user.id,
      scenario: parsed.data.scenario,
      title: parsed.data.title,
      pinned: false,
    })
    .returning();

  return NextResponse.json({ thread }, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: '缺少 id' }, { status: 400 });

  await db
    .delete(aiThreads)
    .where(and(eq(aiThreads.id, id), eq(aiThreads.userId, session.user.id)));

  return NextResponse.json({ deleted: true });
}
