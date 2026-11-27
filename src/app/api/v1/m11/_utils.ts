import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { like } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';
import { speedFeedbackBatches } from '@/db/schema/domains/m11';

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
        { error: '权限不足：仅管理员、工程师或监理可执行智慧提速策略审核与指令下发操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function recordSpeedAudit(params: {
  session: NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  req?: NextRequest;
}) {
  const ip =
    params.req?.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    params.req?.headers.get('x-real-ip') ||
    '127.0.0.1';
  await db.insert(auditLogs).values({
    userId: params.session.user.id,
    userName: params.session.user.name || params.session.user.email || 'unknown',
    action: params.action,
    moduleId: 'speed',
    target: params.target,
    detail: params.detail ?? {},
    ipAddress: ip,
  });
}

export function formatNowLabels(): {
  full: string;
  hms: string;
  hm: string;
  date: string;
} {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return {
    full: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`,
    hms: `${hh}:${mi}:${ss}`,
    hm: `${hh}:${mi}`,
    date: `${yyyy}-${mm}-${dd}`,
  };
}

export async function generateNextBatchId(): Promise<string> {
  const prefix = 'FB-20261126-';
  const rows = await db
    .select({ batchId: speedFeedbackBatches.batchId })
    .from(speedFeedbackBatches)
    .where(like(speedFeedbackBatches.batchId, `${prefix}%`));
  let maxSeq = 17;
  for (const r of rows) {
    const num = Number.parseInt(r.batchId.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}
