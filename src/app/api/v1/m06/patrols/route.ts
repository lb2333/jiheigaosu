import { NextRequest, NextResponse } from 'next/server';
import { asc, eq, like } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import { machineEquipment, machinePatrolLogs } from '@/db/schema/domains/m06';
import {
  formatPatrolNowLabel,
  recordAuditLog,
  requireSession,
  requireWriteSession,
} from '../_utils';

const createPatrolSchema = z.object({
  equipmentCode: z.string().trim().min(1),
  patrolTime: z.string().trim().min(3).max(30).optional(),
  content: z.string().trim().min(2).max(120),
  status: z.enum(['记录正常', '已处理', '已归档']).default('记录正常'),
  inspector: z.string().trim().min(1).max(40),
  detail: z.string().trim().min(2).max(400),
});

export async function GET(req: NextRequest) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { searchParams } = new URL(req.url);
  const equipmentCode = (searchParams.get('equipmentCode') ?? '').trim();

  const rows = equipmentCode
    ? await db
        .select()
        .from(machinePatrolLogs)
        .where(eq(machinePatrolLogs.equipmentCode, equipmentCode))
        .orderBy(asc(machinePatrolLogs.sortOrder))
    : await db
        .select()
        .from(machinePatrolLogs)
        .orderBy(asc(machinePatrolLogs.sortOrder));

  return NextResponse.json({ items: rows, total: rows.length });
}

export async function POST(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = createPatrolSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '巡查记录参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const data = parsed.data;
  const [equip] = await db
    .select()
    .from(machineEquipment)
    .where(eq(machineEquipment.code, data.equipmentCode))
    .limit(1);

  if (!equip) {
    return NextResponse.json({ error: '关联机械设备不存在' }, { status: 404 });
  }

  const { dateCompact, shortTime } = formatPatrolNowLabel();
  const prefix = `XC-${dateCompact}-`;
  const existingToday = await db
    .select({ id: machinePatrolLogs.id })
    .from(machinePatrolLogs)
    .where(like(machinePatrolLogs.id, `${prefix}%`));

  let maxSeq = 200;
  for (const r of existingToday) {
    const tail = Number.parseInt(r.id.slice(prefix.length), 10);
    if (Number.isFinite(tail) && tail >= maxSeq) maxSeq = tail + 1;
  }
  const newId = `${prefix}${String(maxSeq).padStart(3, '0')}`;

  const [created] = await db
    .insert(machinePatrolLogs)
    .values({
      id: newId,
      equipmentCode: equip.code,
      patrolTime: data.patrolTime ?? shortTime,
      content: data.content,
      status: data.status,
      inspector: data.inspector,
      detail: data.detail,
      sortOrder: 0,
    })
    .returning();

  await recordAuditLog({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'CREATE_PATROL_LOG',
    target: `${created.id} (${equip.code})`,
    detail: {
      equipmentCode: equip.code,
      content: created.content,
      status: created.status,
      inspector: created.inspector,
    },
  });

  return NextResponse.json({ patrol: created });
}
