import type { NextRequest } from 'next/server';
import { like } from 'drizzle-orm';
import { db } from '@/db';
import { speedFeedbackBatches } from '@/db/schema/domains/m11';
import {
  WRITE_ROLES,
  type AuthSession,
  formatNowLabels as formatSharedNowLabels,
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';
import { type AuditExecutor, writeAuditLog } from '@/lib/api/audit';

export { WRITE_ROLES, requireSession };

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行智慧提速策略审核与指令下发操作'
  );
}

export async function recordSpeedAudit(params: {
  session: AuthSession;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  req?: NextRequest;
  executor?: AuditExecutor;
}) {
  await writeAuditLog({
    moduleId: 'speed',
    action: params.action,
    target: params.target,
    detail: params.detail,
    req: params.req,
    session: params.session,
    executor: params.executor,
  });
}

export function formatNowLabels(): {
  full: string;
  hms: string;
  hm: string;
  date: string;
} {
  const now = formatSharedNowLabels();
  return {
    full: now.full,
    hms: now.hms,
    hm: now.hm,
    date: now.date,
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
