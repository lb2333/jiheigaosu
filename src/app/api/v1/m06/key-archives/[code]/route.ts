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

const supplementInspectSchema = z.object({
  inspectNo: z.string().trim().min(2).max(40).optional(),
  inspectDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  validUntil: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  installValidUntil: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  missingDocs: z.boolean().optional(),
  useStatus: z.enum(['在用', '待用', '停用']).optional(),
});

export async function GET(
  _req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const { code } = await context.params;
  const decodedCode = decodeURIComponent(code);

  const [row] = await db
    .select({
      equip: machineEquipment,
      archive: machineKeyArchives,
    })
    .from(machineKeyArchives)
    .innerJoin(
      machineEquipment,
      eq(machineKeyArchives.equipmentCode, machineEquipment.code)
    )
    .where(eq(machineKeyArchives.equipmentCode, decodedCode))
    .limit(1);

  if (!row) {
    return NextResponse.json({ error: '重点机械档案不存在' }, { status: 404 });
  }

  const [patrolLogs, reminderConfig] = await Promise.all([
    db
      .select()
      .from(machinePatrolLogs)
      .where(eq(machinePatrolLogs.equipmentCode, decodedCode))
      .orderBy(asc(machinePatrolLogs.sortOrder)),
    getReminderConfig(),
  ]);

  const certMeta = getCertMeta(row.archive, reminderConfig);

  return NextResponse.json({
    archive: {
      ...row.equip,
      archiveId: row.archive.archiveId,
      keyOrder: row.archive.keyOrder,
      inspectNo: row.archive.inspectNo,
      inspectDate: row.archive.inspectDate,
      validUntil: row.archive.validUntil,
      installValidUntil: row.archive.installValidUntil,
      missingDocs: row.archive.missingDocs,
      certMeta,
      patrolLogs,
    },
    reminderConfig,
  });
}

async function handleSupplement(
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

  const parsed = supplementInspectSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '检验资料补录参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const [existing] = await db
    .select()
    .from(machineKeyArchives)
    .where(eq(machineKeyArchives.equipmentCode, decodedCode))
    .limit(1);

  if (!existing) {
    return NextResponse.json({ error: '重点机械档案不存在' }, { status: 404 });
  }

  const data = parsed.data;
  const nextInspectNo =
    data.inspectNo ??
    (existing.inspectNo === 'JY-待补录'
      ? `JY-2026-${String(880 + (existing.keyOrder || 1)).padStart(4, '0')}`
      : existing.inspectNo);
  const nextInspectDate = data.inspectDate ?? '2026-11-26';
  const nextValidUntil = data.validUntil ?? '2027-06-30';
  const nextInstallValidUntil = data.installValidUntil ?? '2027-08-30';
  const nextMissingDocs = data.missingDocs ?? false;

  const [updatedArchive] = await db
    .update(machineKeyArchives)
    .set({
      inspectNo: nextInspectNo,
      inspectDate: nextInspectDate,
      validUntil: nextValidUntil,
      installValidUntil: nextInstallValidUntil,
      missingDocs: nextMissingDocs,
      updatedAt: new Date(),
    })
    .where(eq(machineKeyArchives.equipmentCode, decodedCode))
    .returning();

  const nextUseStatus = data.useStatus ?? '待用';
  await db
    .update(machineEquipment)
    .set({
      useStatus: nextUseStatus,
      updatedAt: new Date(),
    })
    .where(eq(machineEquipment.code, decodedCode));

  const reminderConfig = await getReminderConfig();
  const certMeta = getCertMeta(updatedArchive, reminderConfig);

  await recordAuditLog({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'SUPPLEMENT_INSPECTION_REPORT',
    target: `${updatedArchive.archiveId} (${decodedCode})`,
    detail: {
      inspectNo: updatedArchive.inspectNo,
      inspectDate: updatedArchive.inspectDate,
      validUntil: updatedArchive.validUntil,
      installValidUntil: updatedArchive.installValidUntil,
      missingDocs: updatedArchive.missingDocs,
      useStatus: nextUseStatus,
    },
  });

  return NextResponse.json({
    archive: updatedArchive,
    certMeta,
    useStatus: nextUseStatus,
  });
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  return handleSupplement(req, context);
}

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ code: string }> }
) {
  return handleSupplement(req, context);
}
