import {
  pgTable,
  text,
  integer,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workSections } from '../core';

export const machineEquipment = pgTable(
  'machine_equipment',
  {
    code: text('code').primaryKey(), // e.g. 'QZ-03-006'
    name: text('name').notNull(),
    type: text('type').notNull(), // '土石方设备' | '路面设备' | '起重设备' | '运输及其他' | '架桥机'
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }), // 'sec1' ~ 'sec6'
    sectionName: text('section_name').notNull(),
    unit: text('unit').notNull(),
    entryStatus: text('entry_status').notNull(), // '在场' | '已退场'
    useStatus: text('use_status').notNull(), // '在用' | '待用' | '停用' | '—'
    isKey: boolean('is_key').notNull().default(false),
    model: text('model').notNull(),
    spec: text('spec').notNull(),
    manufacturer: text('manufacturer').notNull(),
    entryDate: text('entry_date').notNull(),
    exitDate: text('exit_date').notNull().default('—'),
    location: text('location').notNull(),
    operator: text('operator').notNull(),
    sortOrder: integer('sort_order').notNull().default(100),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m06_equip_sec_type_idx').on(t.sectionId, t.type),
    index('m06_equip_status_idx').on(t.entryStatus, t.useStatus),
    index('m06_equip_sort_idx').on(t.sortOrder),
  ]
);

export const machineKeyArchives = pgTable(
  'machine_key_archives',
  {
    archiveId: text('archive_id').primaryKey(), // e.g. 'DA-QZ-03006'
    equipmentCode: text('equipment_code')
      .notNull()
      .unique()
      .references(() => machineEquipment.code, { onDelete: 'cascade' }),
    keyOrder: integer('key_order').notNull().default(1),
    inspectNo: text('inspect_no').notNull(), // e.g. 'JY-2025-0316' | 'JY-待补录'
    inspectDate: text('inspect_date').notNull(), // '2025-12-19' | '—'
    validUntil: text('valid_until').notNull(), // '2026-12-18' | '—'
    installValidUntil: text('install_valid_until').notNull(), // '2027-03-10' | '—'
    missingDocs: boolean('missing_docs').notNull().default(false),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m06_archive_order_idx').on(t.keyOrder),
    index('m06_archive_code_idx').on(t.equipmentCode),
  ]
);

export const machinePatrolLogs = pgTable(
  'machine_patrol_logs',
  {
    id: text('id').primaryKey(), // e.g. 'XC-20261125-016'
    equipmentCode: text('equipment_code')
      .notNull()
      .references(() => machineEquipment.code, { onDelete: 'cascade' }),
    patrolTime: text('patrol_time').notNull(), // e.g. '11-25 15:20'
    content: text('content').notNull(),
    status: text('status').notNull(), // '记录正常' | '已处理' | '已归档'
    inspector: text('inspector').notNull(),
    detail: text('detail').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m06_patrol_code_created_idx').on(t.equipmentCode, t.createdAt)]
);

export const machineReminderConfig = pgTable('machine_reminder_config', {
  id: text('id').primaryKey(), // 'default'
  dateField: text('date_field').notNull().default('validUntil'), // 'validUntil' | 'installValidUntil'
  remindDays: integer('remind_days').notNull().default(30), // 15 | 30 | 45 | 60
  notifySystem: boolean('notify_system').notNull().default(true),
  notifySms: boolean('notify_sms').notNull().default(false),
  autoBlockExpired: boolean('auto_block_expired').notNull().default(true),
  updatedBy: text('updated_by').notNull().default('system'),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});
