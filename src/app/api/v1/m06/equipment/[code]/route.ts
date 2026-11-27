import { NextRequest, NextResponse } from 'next/server';
import { asc, eq } from 'drizzle-orm';
import { z } from 'zod';
import { db } from '@/db';
import {
  machineEquipment,
  machineKeyArchives,
  machinePatrolLogs,
} from '@/db/schema/domains/m06';
import { getCertMeta } from '@/modules/m06_machine/types';
import {
  getReminderConfig,
  recordAuditLog,
  requireSession,
  requireWriteSession,
} from '../../_utils';

const patchEquipmentSchema = z
  .object({
    entryStatus: z.enum(['在场', '已退场']).optional(),
    useStatus: z.enum(['在用', '待用', '停用', '—']).optional(),
    location: z.string().trim().min(1).max(120).optional(),
    exitDate: z.string().trim().min(1).max(20).optional(),
    operator: z.string().trim().min(1).max(80).optional(),
  })
  .refine(
    (d) =>
      d.entryStatus !== undefined ||
      d.useStatus !== undefined ||
      d.location !== undefined ||
      d.exitDate !== undefined ||
      d.operator !== undefined,
    { message: '至少提供一个变更字段' }
  );

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { code } = await context.params;
  const decodedCode = decodeURIComponent(code);

  const [equip] = await db
    .select()
    .from(machineEquipment)
    .where(eq(machineEquipment.code, decodedCode))
    .limit(1);

  if (!equip) {
    return NextResponse.json({ error: '机械设备不存在' }, { status: 404 });
  }

  const [archive] = await db
    .select()
    .from(machineKeyArchives)
    .where(eq(machineKeyArchives.equipmentCode, decodedCode))
    .limit(1);

  const [patrolLogs, reminderConfig] = await Promise.all([
    db
      .select()
      .from(machinePatrolLogs)
      .where(eq(machinePatrolLogs.equipmentCode, decodedCode))
      .orderBy(asc(machinePatrolLogs.sortOrder)),
    getReminderConfig(),
  ]);

  return NextResponse.json({
    equipment: {
      ...equip,
      archiveId: archive?.archiveId,
      certMeta: archive ? getCertMeta(archive, reminderConfig) : null,
    },
    archive: archive ?? null,
    patrolLogs,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  const { code } = await context.params;
  const decodedCode = decodeURIComponent(code);

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchEquipmentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '设备状态变更参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(machineEquipment)
    .where(eq(machineEquipment.code, decodedCode))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '机械设备不存在' }, { status: 404 });
  }

  const data = parsed.data;
  const nextEntryStatus = data.entryStatus ?? existing.entryStatus;
  let nextUseStatus = data.useStatus ?? existing.useStatus;
  let nextExitDate = data.exitDate ?? existing.exitDate;

  if (nextEntryStatus === '已退场') {
    nextUseStatus = '—';
    if (!data.exitDate && (existing.exitDate === '—' || !existing.exitDate)) {
      nextExitDate = '2026-11-26';
    }
  } else {
    if (nextUseStatus === '—') {
      nextUseStatus = '待用';
    }
    if (!data.exitDate) {
      nextExitDate = '—';
    }
  }

  const [updated] = await db
    .update(machineEquipment)
    .set({
      entryStatus: nextEntryStatus,
      useStatus: nextUseStatus,
      location: data.location ?? existing.location,
      exitDate: nextExitDate,
      operator: data.operator ?? existing.operator,
      updatedAt: new Date(),
    })
    .where(eq(machineEquipment.code, decodedCode))
    .returning();

  await recordAuditLog({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_EQUIPMENT_STATUS',
    target: `${updated.name} (${updated.code})`,
    detail: {
      entryStatus: updated.entryStatus,
      useStatus: updated.useStatus,
      location: updated.location,
      exitDate: updated.exitDate,
    },
  });

  return NextResponse.json({ equipment: updated });
}
