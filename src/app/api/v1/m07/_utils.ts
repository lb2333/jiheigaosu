import type { NextRequest } from 'next/server';
import {
  WRITE_ROLES,
  type AuthSession,
  formatNowLabels,
  requireSession,
  requireWriteSession,
} from '@/lib/api/auth-guard';
import { writeAuditLog } from '@/lib/api/audit';

export { WRITE_ROLES };

export async function requireM07Session() {
  return requireSession();
}

export async function requireM07WriteSession() {
  return requireWriteSession(
    '权限不足：仅管理员、工程师或监理可执行备料数据变更操作'
  );
}

export async function writeM07Audit(
  req: NextRequest,
  session: AuthSession,
  action: string,
  target: string,
  detail: Record<string, unknown>
) {
  await writeAuditLog({
    moduleId: 'material',
    action,
    target,
    detail,
    req,
    session,
    swallowError: true,
  });
}

export function formatNowParts(): { full: string; short: string; date: string } {
  const now = formatNowLabels();
  return {
    full: now.fullMinute,
    short: now.short,
    date: now.date,
  };
}
