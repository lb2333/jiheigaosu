import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';

const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

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
        { error: '权限不足：仅管理员、工程师或监理可执行平安工地专题新增或编辑操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function logM12Audit(params: {
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
    moduleId: 'pingan',
    target: params.target,
    detail: params.detail,
    ipAddress: params.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });
}

export function formatStampLabel(dateInput?: Date | string | null): string {
  if (!dateInput) return '2026-11-25 10:45';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '2026-11-25 10:45';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
