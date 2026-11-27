import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';

export const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export const SECTION_ID_BY_NAME: Record<string, string> = {
  一工区: 'sec1',
  二工区: 'sec2',
  三工区: 'sec3',
  四工区: 'sec4',
  五工区: 'sec5',
  六工区: 'sec6',
};

export const SECTION_NAME_BY_ID: Record<string, string> = {
  sec1: '一工区',
  sec2: '二工区',
  sec3: '三工区',
  sec4: '四工区',
  sec5: '五工区',
  sec6: '六工区',
};

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
        { error: '权限不足：仅管理员、工程师或监理可执行视频监控配置与复核操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function logM10Audit(opts: {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  action: string;
  target: string;
  detail: Record<string, unknown>;
  req: NextRequest;
}) {
  await db.insert(auditLogs).values({
    userId: opts.session.user.id,
    userName: opts.session.user.name,
    action: opts.action,
    moduleId: 'video',
    target: opts.target,
    detail: opts.detail,
    ipAddress: opts.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });
}

export function formatNowTimestamp(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
