import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';

export const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export async function requireSession() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function requireWriteSession() {
  const { session, errorResponse } = await requireSession();
  if (errorResponse || !session) return { session: null, errorResponse };
  const role = session.user.role ?? 'viewer';
  if (!WRITE_ROLES.has(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: '权限不足：仅管理员、工程师或监理可执行黑土地保护核验与台账变更操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function logM14Audit(params: {
  req: NextRequest;
  userId?: string | null;
  userName: string;
  action: string;
  target: string;
  detail: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    userId: params.userId ?? null,
    userName: params.userName,
    action: params.action,
    moduleId: 'blacksoil',
    target: params.target,
    detail: params.detail,
    ipAddress: params.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });
}

export function formatNowTimeLabel(): string {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return `${now.getFullYear()}-${mm}-${dd} ${hh}:${mi}`;
}
