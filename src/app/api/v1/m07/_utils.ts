import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';

export const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export async function requireM07Session() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function requireM07WriteSession() {
  const { session, errorResponse } = await requireM07Session();
  if (errorResponse || !session) {
    return { session: null, errorResponse };
  }
  const role = session.user.role ?? 'viewer';
  if (!WRITE_ROLES.has(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: '权限不足：仅管理员、工程师或监理可执行备料数据变更操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function writeM07Audit(
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
      moduleId: 'material',
      target,
      detail,
      ipAddress: req.headers.get('x-forwarded-for') ?? '127.0.0.1',
    });
  } catch {
    // Do not break primary mutation if audit log fails
  }
}

export function formatNowParts(): { full: string; short: string; date: string } {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return {
    full: `${yyyy}-${mm}-${dd} ${hh}:${mi}`,
    short: `${mm}-${dd} ${hh}:${mi}`,
    date: `${yyyy}-${mm}-${dd}`,
  };
}
