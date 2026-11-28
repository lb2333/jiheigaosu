import type { NextRequest } from 'next/server';
import {
  WRITE_ROLES,
  type AuthSession,
  formatNowLabels,
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';
import { writeAuditLog } from '@/lib/api/audit';

export { WRITE_ROLES, requireSession };

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

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行视频监控配置与复核操作'
  );
}

export async function logM10Audit(opts: {
  session: AuthSession;
  action: string;
  target: string;
  detail: Record<string, unknown>;
  req: NextRequest;
}) {
  await writeAuditLog({
    moduleId: 'video',
    action: opts.action,
    target: opts.target,
    detail: opts.detail,
    req: opts.req,
    session: opts.session,
  });
}

export function formatNowTimestamp(): string {
  return formatNowLabels().full;
}
