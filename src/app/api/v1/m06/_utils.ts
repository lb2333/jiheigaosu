import type { NextRequest } from 'next/server';
import { eq } from 'drizzle-orm';
import { db } from '@/db';
import { machineReminderConfig } from '@/db/schema/domains/m06';
import {
  DEFAULT_REMINDER_CONFIG,
  type ReminderConfigDTO,
  type ReminderDateField,
} from '@/modules/m06_machine/types';
import {
  WRITE_ROLES,
  formatNowLabels,
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';
import { writeAuditLog } from '@/lib/api/audit';

export { WRITE_ROLES, requireSession };

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行机械设备变更操作'
  );
}

export async function recordAuditLog(opts: {
  req: NextRequest;
  userId: string;
  userName: string;
  action: string;
  target: string;
  detail: Record<string, unknown>;
}) {
  await writeAuditLog({
    moduleId: 'machine',
    action: opts.action,
    target: opts.target,
    detail: opts.detail,
    req: opts.req,
    userId: opts.userId,
    userName: opts.userName,
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
  const now = formatNowLabels();
  return {
    dateCompact: now.dateCompact,
    shortTime: now.short,
  };
}
