import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';

const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export async function requireM03Session() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function requireM03WriteSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  const role = session.user.role ?? 'viewer';
  if (!WRITE_ROLES.has(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: '仅管理员、工程师或监理可执行质量数据修改操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function writeM03Audit(
  req: NextRequest,
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>,
  action: string,
  target: string,
  detail: Record<string, unknown>
) {
  try {
    await db.insert(auditLogs).values({
      userId: session.user.id,
      userName: session.user.name,
      action,
      moduleId: 'quality',
      target,
      detail,
      ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
    });
  } catch {
    // audit log failure should not break primary operation
  }
}
