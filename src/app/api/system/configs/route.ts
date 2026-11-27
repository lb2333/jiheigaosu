import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs, systemConfigs } from '@/db/schema';

const upsertConfigSchema = z.object({
  key: z.string().min(1),
  category: z.enum(['base', 'integration', 'metrics', 'content']),
  label: z.string().min(1),
  value: z.record(z.string(), z.unknown()),
});

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const category = req.nextUrl.searchParams.get('category');
  const rows = category
    ? await db.select().from(systemConfigs).where(eq(systemConfigs.category, category))
    : await db.select().from(systemConfigs);

  return NextResponse.json({ configs: rows });
}

export async function PUT(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role !== 'admin') {
    return NextResponse.json({ error: '仅管理员可修改系统配置' }, { status: 403 });
  }

  const body = await req.json();
  const parsed = upsertConfigSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: '参数校验失败' }, { status: 400 });
  }

  const { key, category, label, value } = parsed.data;
  const [saved] = await db
    .insert(systemConfigs)
    .values({
      key,
      category,
      label,
      value,
      updatedBy: session.user.name,
      updatedAt: new Date(),
    })
    .onConflictDoUpdate({
      target: systemConfigs.key,
      set: {
        label,
        value,
        updatedBy: session.user.name,
        updatedAt: new Date(),
      },
    })
    .returning();

  await db.insert(auditLogs).values({
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_SYSTEM_CONFIG',
    moduleId: 'system',
    target: key,
    detail: { category, label },
    ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });

  return NextResponse.json({ config: saved });
}
