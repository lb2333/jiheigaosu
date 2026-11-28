import type { NextRequest } from 'next/server';
import {
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';
import { writeAuditLog } from '@/lib/api/audit';

export { requireSession };

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行平安工地专题新增或编辑操作'
  );
}

export async function logM12Audit(params: {
  req: NextRequest;
  userId?: string | null;
  userName: string;
  action: string;
  target: string;
  detail: Record<string, unknown>;
}) {
  await writeAuditLog({
    moduleId: 'pingan',
    action: params.action,
    target: params.target,
    detail: params.detail,
    req: params.req,
    userId: params.userId ?? null,
    userName: params.userName,
  });
}

export function formatStampLabel(dateInput?: Date | string | null): string {
  if (!dateInput) return '2026-11-25 10:45';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '2026-11-25 10:45';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
