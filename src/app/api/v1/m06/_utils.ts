import { headers } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { auditLogs } from '@/db/schema/core';
import { machineReminderConfig } from '@/db/schema/domains/m06';
import {
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfigDTO,
  type ReminderDateField,
} from '@/modules/m06_machine/types';

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
        { error: '权限不足：仅管理员、工程师或监理可执行机械设备变更操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function recordAuditLog(opts: {
  req: NextRequest;
  userId: string;
  userName: string;
  action: string;
  target: string;
  detail: Record<string, unknown>;
}) {
  await db.insert(auditLogs).values({
    userId: opts.userId,
    userName: opts.userName,
    action: opts.action,
    moduleId: 'machine',
    target: opts.target,
    detail: opts.detail,
    ipAddress: opts.req.headers.get('x-forwarded-for') ?? '127.0.0.1',
  });
}

export async function getReminderConfig(): Promise<ReminderConfigDTO> {
  const [row] = await db
    .select()
    .from(machineReminderConfig)
    .where(eq(machineReminderConfig.id, 'default'))
    .limit(1);

  if (!row) return DEFAULT_REMINDER_CONFIG;
  return {
    id: row.id,
    dateField: (row.dateField === 'installValidUntil' ? 'installValidUntil' : 'validUntil') as ReminderDateField,
    remindDays: row.remindDays,
    notifySystem: row.notifySystem,
    notifySms: row.notifySms,
    autoBlockExpired: row.autoBlockExpired,
    updatedBy: row.updatedBy,
  };
}

export function formatPatrolNowLabel(): { dateCompact: string; shortTime: string } {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return {
    dateCompact: `${yyyy}${mm}${dd}`,
    shortTime: `${mm}-${dd} ${hh}:${mi}`,
  };
}
