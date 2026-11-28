import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

export type AuthSession = NonNullable<Awaited<ReturnType<typeof auth.api.getSession>>>;

export type SessionGuardResult =
  | { session: AuthSession; errorResponse: null }
  | { session: null; errorResponse: NextResponse };

export const PRIVATE_CACHE_HEADERS = {
  'Cache-Control': 'private, max-age=15, stale-while-revalidate=60',
} as const;

export async function requireSession(): Promise<SessionGuardResult> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }),
    };
  }
  return { session, errorResponse: null };
}

export async function requireWriteSession(
  forbiddenMessage = '权限不足：仅管理员、工程师或监理可执行变更操作'
): Promise<SessionGuardResult> {
  const { session, errorResponse } = await requireSession();
  if (errorResponse) return { session: null, errorResponse };
  const role = session.user.role ?? 'viewer';
  if (!WRITE_ROLES.has(role)) {
    return {
      session: null,
      errorResponse: NextResponse.json({ error: forbiddenMessage }, { status: 403 }),
    };
  }
  return { session, errorResponse: null };
}

export function formatNowLabels(): {
  full: string;
  fullMinute: string;
  short: string;
  hm: string;
  hms: string;
  date: string;
  dateCompact: string;
} {
  const now = new Date();
  const yyyy = String(now.getFullYear());
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return {
    full: `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`,
    fullMinute: `${yyyy}-${mm}-${dd} ${hh}:${mi}`,
    short: `${mm}-${dd} ${hh}:${mi}`,
    hm: `${hh}:${mi}`,
    hms: `${hh}:${mi}:${ss}`,
    date: `${yyyy}-${mm}-${dd}`,
    dateCompact: `${yyyy}${mm}${dd}`,
  };
}
