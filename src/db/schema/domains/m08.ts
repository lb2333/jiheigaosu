import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  serial,
  timestamp,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';

export const measureContracts = pgTable('measure_contracts', {
  sectionId: text('section_id').primaryKey(), // sec1 ~ sec6
  sectionName: text('section_name').notNull(), // 一工区 ~ 六工区
  contractCode: text('contract_code').notNull(), // A1合同段 ~ A6合同段
  stakeRange: text('stake_range').notNull(),
  supervisor: text('supervisor').notNull(),
  cumBaseAmount: doublePrecision('cum_base_amount').notNull(), // 万元
  paidReturnAmount: doublePrecision('paid_return_amount').notNull().default(0), // 万元
  payReturned: boolean('pay_returned').notNull().default(false),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const measurePeriods = pgTable('measure_periods', {
  period: text('period').primaryKey(), // 2026年06月 ~ 2026年11月
  shortLabel: text('short_label').notNull(), // 6月 ~ 11月
  totalAmount: doublePrecision('total_amount').notNull(),
  cumTotalAmount: doublePrecision('cum_total_amount').notNull(),
  scaleFactor: doublePrecision('scale_factor').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const measureRecords = pgTable(
  'measure_records',
  {
    id: text('id').primaryKey(), // e.g. JL-A2-202611-018
    sectionId: text('section_id')
      .notNull()
      .references(() => measureContracts.sectionId, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(),
    contractCode: text('contract_code').notNull(),
    workItem: text('work_item').notNull(),
    period: text('period').notNull(),
    amount: doublePrecision('amount').notNull(),
    status: text('status').notNull(), // 已确认 | 审核中 | 待审核
    payStatus: text('pay_status').notNull(), // 已支付 | 办理中 | 待支付 | 未回传
    paidAmount: doublePrecision('paid_amount').notNull().default(0),
    payTime: text('pay_time').notNull().default('—'),
    syncTime: text('sync_time').notNull(),
    stakeRange: text('stake_range').notNull(),
    qtyDesc: text('qty_desc').notNull(),
    reviewer: text('reviewer').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('measure_records_period_sec_idx').on(t.period, t.sectionId),
    index('measure_records_status_pay_idx').on(t.status, t.payStatus),
  ]
);

export const measurePhysicalItems = pgTable(
  'measure_physical_items',
  {
    id: serial('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => measureContracts.sectionId, { onDelete: 'cascade' }),
    workItem: text('work_item').notNull(),
    unit: text('unit').notNull(),
    contractQty: doublePrecision('contract_qty').notNull(),
    measuredQty: doublePrecision('measured_qty').notNull(),
    physicalQty: doublePrecision('physical_qty').notNull(),
    periodAmount: doublePrecision('period_amount').notNull(),
    linkedRecordId: text('linked_record_id').notNull(),
    period: text('period').notNull().default('2026年11月'),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex('measure_physical_sec_period_item_uidx').on(
      t.sectionId,
      t.period,
      t.workItem
    ),
    index('measure_physical_section_idx').on(t.sectionId),
  ]
);
