import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { desc, eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema';

export async function GET(req: NextRequest) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const mod = req.nextUrl.searchParams.get('moduleId');
  const limit = Math.min(200, Math.max(10, Number(req.nextUrl.searchParams.get('limit')) || 50));

  const logs = mod
    ? await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.moduleId, mod))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit)
    : await db
        .select()
        .from(auditLogs)
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);

  return NextResponse.json({ logs });
}
