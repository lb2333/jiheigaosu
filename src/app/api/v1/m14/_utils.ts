import type { NextRequest } from 'next/server';
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
    '权限不足：仅管理员、工程师或监理可执行黑土地保护核验与台账变更操作'
  );
}

export async function logM14Audit(params: {
  req: NextRequest;
  userId?: string | null;
  userName: string;
  action: string;
  target: string;
  detail: Record<string, unknown>;
}) {
  await writeAuditLog({
    moduleId: 'blacksoil',
    action: params.action,
    target: params.target,
    detail: params.detail,
    req: params.req,
    userId: params.userId ?? null,
    userName: params.userName,
  });
}

export function formatNowTimeLabel(): string {
  return formatNowLabels().fullMinute;
}
