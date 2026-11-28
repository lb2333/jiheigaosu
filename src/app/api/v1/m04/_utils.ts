import { like } from 'drizzle-orm';
import { db } from '@/db';
import { safetyHazards } from '@/db/schema/domains/m04';
import {
  formatNowLabels,
  requireSession,
  requireWriteSession as requireSharedWriteSession,
} from '@/lib/api/auth-guard';

export { requireSession };

export async function requireWriteSession() {
  return requireSharedWriteSession(
    '权限不足：仅管理员、工程师或监理可执行安全台账变更操作'
  );
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
  const now = formatNowLabels();
  return { full: now.fullMinute, short: now.short };
}
