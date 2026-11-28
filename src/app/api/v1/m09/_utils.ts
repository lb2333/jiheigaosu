import type { NextRequest } from 'next/server';
import { like } from 'drizzle-orm';
import { db } from '@/db';
import { safetyHazards } from '@/db/schema/domains/m04';
import { uavHazardClues, uavReports, uavTasks } from '@/db/schema/domains/m09';
import {
  WRITE_ROLES,
  type AuthSession,
  formatNowLabels as formatSharedNowLabels,
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';
import { writeAuditLog } from '@/lib/api/audit';

export { WRITE_ROLES, requireSession };

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行无人机巡检变更操作'
  );
}

export async function recordUavAudit(params: {
  session: AuthSession;
  action: string;
  target: string;
  detail?: Record<string, unknown>;
  req?: NextRequest;
}) {
  await writeAuditLog({
    moduleId: 'uav',
    action: params.action,
    target: params.target,
    detail: params.detail,
    req: params.req,
    session: params.session,
  });
}

export function formatNowLabels(): {
  full: string;
  short: string;
  hm: string;
  date: string;
} {
  const now = formatSharedNowLabels();
  return {
    full: now.full,
    short: now.short,
    hm: now.hm,
    date: now.date,
  };
}

export async function generateNextTaskId(): Promise<string> {
  const prefix = 'UAV-20261126-';
  const rows = await db
    .select({ id: uavTasks.id })
    .from(uavTasks)
    .where(like(uavTasks.id, `${prefix}%`));
  let maxSeq = 10;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(2, '0')}`;
}

export async function generateNextClueId(): Promise<string> {
  const prefix = 'UAI-20261126-';
  const rows = await db
    .select({ id: uavHazardClues.id })
    .from(uavHazardClues)
    .where(like(uavHazardClues.id, `${prefix}%`));
  let maxSeq = 4;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export async function generateNextReportId(): Promise<string> {
  const prefix = 'RPT-20261126-';
  const rows = await db
    .select({ id: uavReports.id })
    .from(uavReports)
    .where(like(uavReports.id, `${prefix}%`));
  let maxSeq = 3;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(2, '0')}`;
}

export async function generateNextSafetyHazardId(): Promise<string> {
  const prefix = 'AQ-202611-';
  const rows = await db
    .select({ id: safetyHazards.id })
    .from(safetyHazards)
    .where(like(safetyHazards.id, `${prefix}%`));
  let maxSeq = 40;
  for (const r of rows) {
    const num = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(num) && num > maxSeq) maxSeq = num;
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}
