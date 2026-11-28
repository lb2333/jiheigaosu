import type { NextRequest } from 'next/server';
import { like } from 'drizzle-orm';
import { db } from '@/db';
import { publishOrders, publishTemplates } from '@/db/schema/domains/m13';
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
    '权限不足：仅管理员、工程师或监理可执行信息发布变更操作'
  );
}

export async function recordPublishAudit(params: {
  session: AuthSession;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  req?: NextRequest;
  executor?: AuditExecutor;
}) {
  await writeAuditLog({
    moduleId: 'publish',
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
  short: string;
  hm: string;
  hms: string;
  date: string;
} {
  const now = formatSharedNowLabels();
  return {
    full: now.full,
    short: now.short,
    hm: now.hm,
    hms: now.hms,
    date: now.date,
  };
}

export async function generateNextTemplateId(): Promise<string> {
  const prefix = 'MB-202611-';
  const rows = await db
    .select({ id: publishTemplates.id })
    .from(publishTemplates)
    .where(like(publishTemplates.id, `${prefix}%`));
  let maxSeq = 8;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export async function generateNextOrderId(): Promise<string> {
  const prefix = 'FB-20261126-';
  const rows = await db
    .select({ id: publishOrders.id })
    .from(publishOrders)
    .where(like(publishOrders.id, `${prefix}%`));
  let maxSeq = 11;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export function bumpVersion(ver: string): string {
  const m = String(ver).match(/^V(\d+)\.(\d+)$/);
  if (!m) return 'V1.1';
  return `V${m[1]}.${Number.parseInt(m[2], 10) + 1}`;
}
