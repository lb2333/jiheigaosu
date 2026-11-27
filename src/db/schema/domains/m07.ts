import {
  pgTable,
  text,
  integer,
  doublePrecision,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workSections } from '../core';

export interface MaterialBatchCounts {
  pass: number;
  pending: number;
  recheck: number;
  fail: number;
}

export interface ReportHistoryEntry {
  version: string;
  time: string;
  record: string;
  status: string;
  uploader: string;
  rows: number;
}

export interface BatchTestItem {
  name: string;
  pass: boolean | null;
  val: string;
  std: string;
}

export const materialYards = pgTable(
  'material_yards',
  {
    id: text('id').primaryKey(), // yd-1 ~ yd-6
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(),
    name: text('name').notNull(), // 材料场A, 料场示例A..E
    stake: text('stake').notNull(),
    gateStake: text('gate_stake').notNull(),
    camId: text('cam_id').notNull(),
    uavId: text('uav_id').notNull(),
    waypoint: text('waypoint').notNull(),
    labName: text('lab_name').notNull(),
    reportCode: text('report_code').notNull(),
    activeVer: text('active_ver').notNull(),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m07_yards_sec_idx').on(t.sectionId, t.sortOrder)]
);

export const materialInventoryItems = pgTable(
  'material_inventory_items',
  {
    id: text('id').primaryKey(), // e.g. '2026年11月_inv-sec2-ss'
    baseId: text('base_id').notNull(), // e.g. 'inv-sec2-ss'
    period: text('period').notNull(), // 2026年11月 | 2026年10月 | 2026年09月
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    yardId: text('yard_id')
      .notNull()
      .references(() => materialYards.id, { onDelete: 'cascade' }),
    yardName: text('yard_name').notNull(),
    material: text('material').notNull(), // 碎石 | 机制砂 | 水泥 | 矿粉 | 钢筋
    spec: text('spec').notNull(),
    planQty: integer('plan_qty').notNull(),
    arrivalQty: integer('arrival_qty').notNull(),
    physicalQty: integer('physical_qty').notNull(),
    quarantineQty: integer('quarantine_qty').notNull(),
    usableQty: integer('usable_qty').notNull(),
    gapQty: integer('gap_qty').notNull(),
    status: text('status').notNull(), // 已合格 | 部分待检 | 复检中 | 含隔离批次
    batchCounts: jsonb('batch_counts').$type<MaterialBatchCounts>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m07_inv_period_sec_idx').on(t.period, t.sectionId, t.sortOrder),
    index('m07_inv_yard_mat_idx').on(t.yardId, t.material),
  ]
);

export const materialReports = pgTable(
  'material_reports',
  {
    code: text('code').primaryKey(), // BL-20261126-A1 ~ A6
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    yardId: text('yard_id')
      .notNull()
      .references(() => materialYards.id, { onDelete: 'cascade' }),
    version: text('version').notNull(),
    reportDate: text('report_date').notNull(),
    cutoff: text('cutoff').notNull(),
    cutoffFull: text('cutoff_full').notNull(),
    uploadTime: text('upload_time').notNull(),
    uploadFull: text('upload_full').notNull(),
    fieldCheck: text('field_check').notNull().default('通过'),
    confirmStatus: text('confirm_status').notNull(), // 待确认 | 已确认
    fileName: text('file_name').notNull(),
    templateVer: text('template_ver').notNull().default('备料固定模板 V1.0'),
    currentBoardNotice: text('current_board_notice').notNull(),
    history: jsonb('history').$type<ReportHistoryEntry[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m07_rep_sec_date_idx').on(t.sectionId, t.reportDate),
    index('m07_rep_status_idx').on(t.confirmStatus),
  ]
);

export const materialArrivalBatches = pgTable(
  'material_arrival_batches',
  {
    batchId: text('batch_id').primaryKey(), // BM-JC-20261126-007 etc.
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    yardId: text('yard_id')
      .notNull()
      .references(() => materialYards.id, { onDelete: 'cascade' }),
    material: text('material').notNull(),
    spec: text('spec').notNull(),
    entryTime: text('entry_time').notNull(),
    videoTime: text('video_time').notNull(),
    videoTimeShort: text('video_time_short').notNull(),
    uavTime: text('uav_time').notNull(),
    uavTimeShort: text('uav_time_short').notNull(),
    uavFile: text('uav_file').notNull(),
    qty: integer('qty').notNull(),
    status: text('status').notNull(), // 合格 | 待检 | 复检中 | 不合格
    reportId: text('report_id').notNull(),
    inspectTime: text('inspect_time').notNull(),
    inspectTimeShort: text('inspect_time_short').notNull(),
    supplier: text('supplier').notNull(),
    plateNo: text('plate_no').notNull(),
    quarantineNote: text('quarantine_note').notNull().default(''),
    items: jsonb('items').$type<BatchTestItem[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m07_batch_sec_mat_idx').on(t.sectionId, t.material, t.sortOrder),
    index('m07_batch_yard_idx').on(t.yardId),
  ]
);
