import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db } from '@/db';
import { machineReminderConfig } from '@/db/schema/domains/m06';
import {
  getReminderConfig,
  recordAuditLog,
  requireSession,
  requireWriteSession,
} from '../_utils';

const patchReminderSchema = z
  .object({
    dateField: z.enum(['validUntil', 'installValidUntil']).optional(),
    remindDays: z
      .number()
      .int()
      .refine((v) => [15, 30, 45, 60].includes(v), {
        message: '提前提醒天数仅支持 15 / 30 / 45 / 60 天',
      })
      .optional(),
    notifySystem: z.boolean().optional(),
    notifySms: z.boolean().optional(),
    autoBlockExpired: z.boolean().optional(),
  })
  .refine(
    (d) =>
      d.dateField !== undefined ||
      d.remindDays !== undefined ||
      d.notifySystem !== undefined ||
      d.notifySms !== undefined ||
      d.autoBlockExpired !== undefined,
    { message: '至少提供一个配置字段' }
  );

export async function GET() {
  const { errorResponse } = await requireSession();
  if (errorResponse) return errorResponse;

  const reminderConfig = await getReminderConfig();
  return NextResponse.json({ reminderConfig });
}

export async function PATCH(req: NextRequest) {
  const { session, errorResponse } = await requireWriteSession();
  if (errorResponse || !session) return errorResponse;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const parsed = patchReminderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: '到期提醒配置参数无效', issues: parsed.error.issues },
      { status: 400 }
    );
  }

  const current = await getReminderConfig();
  const data = parsed.data;
  const nextValues = {
    id: 'default',
    dateField: data.dateField ?? current.dateField,
    remindDays: data.remindDays ?? current.remindDays,
    notifySystem: data.notifySystem ?? current.notifySystem,
    notifySms: data.notifySms ?? current.notifySms,
    autoBlockExpired: data.autoBlockExpired ?? current.autoBlockExpired,
    updatedBy: session.user.name,
    updatedAt: new Date(),
  };

  const [saved] = await db
    .insert(machineReminderConfig)
    .values(nextValues)
    .onConflictDoUpdate({
      target: machineReminderConfig.id,
      set: {
        dateField: nextValues.dateField,
        remindDays: nextValues.remindDays,
        notifySystem: nextValues.notifySystem,
        notifySms: nextValues.notifySms,
        autoBlockExpired: nextValues.autoBlockExpired,
        updatedBy: nextValues.updatedBy,
        updatedAt: nextValues.updatedAt,
      },
    })
    .returning();

  await recordAuditLog({
    req,
    userId: session.user.id,
    userName: session.user.name,
    action: 'UPDATE_REMINDER_CONFIG',
    target: 'machine_reminder_config (default)',
    detail: {
      dateField: saved.dateField,
      remindDays: saved.remindDays,
      notifySystem: saved.notifySystem,
      notifySms: saved.notifySms,
      autoBlockExpired: saved.autoBlockExpired,
    },
  });

  return NextResponse.json({
    reminderConfig: {
      id: saved.id,
      dateField: saved.dateField,
      remindDays: saved.remindDays,
      notifySystem: saved.notifySystem,
      notifySms: saved.notifySms,
      autoBlockExpired: saved.autoBlockExpired,
      updatedBy: saved.updatedBy,
    },
  });
}
