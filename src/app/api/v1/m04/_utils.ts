import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { like } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/db';
import { safetyHazards } from '@/db/schema/domains/m04';

const WRITE_ROLES = new Set(['admin', 'engineer', 'supervisor']);

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
        { error: '权限不足：仅管理员、工程师或监理可执行安全台账变更操作' },
        { status: 403 }
      ),
    };
  }
  return { session, errorResponse: null };
}

export async function generateNextHazardId(period: string): Promise<string> {
  const ym = period.replace('-', '');
  const prefix = `AQ-${ym}-`;
  const existing = await db
    .select({ id: safetyHazards.id })
    .from(safetyHazards)
    .where(like(safetyHazards.id, `${prefix}%`));

  let maxSeq = 40;
  for (const row of existing) {
    const tail = row.id.slice(prefix.length);
    const num = Number.parseInt(tail, 10);
    if (Number.isFinite(num) && num > maxSeq) {
      maxSeq = num;
    }
  }
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

export function formatNowLabel(): { full: string; short: string } {
  const now = new Date();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  const hh = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return {
    full: `${now.getFullYear()}-${mm}-${dd} ${hh}:${mi}`,
    short: `${mm}-${dd} ${hh}:${mi}`,
  };
}
