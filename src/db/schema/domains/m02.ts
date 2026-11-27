import {
  pgTable,
  text,
  integer,
  boolean,
  doublePrecision,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export interface BimTaskDef {
  id: string;
  name: string;
  start: string;
  end: string;
  icon: string;
  part: string;
}

export const progressCategoryStats = pgTable(
  'progress_category_stats',
  {
    id: text('id').primaryKey(), // e.g. '2026-11_all_subgrade'
    period: text('period').notNull(), // '2026-06' ~ '2026-11'
    sectionId: text('section_id').notNull(), // 'all' | 'sec1' ~ 'sec6'
    categoryKey: text('category_key').notNull(), // 'subgrade' | 'bridge' | ...
    categoryName: text('category_name').notNull(),
    unit: text('unit').notNull(),
    icon: text('icon').notNull(),
    isInt: boolean('is_int').notNull().default(false),
    totalQty: doublePrecision('total_qty').notNull(),
    doneQty: doublePrecision('done_qty').notNull(),
    pct: doublePrecision('pct').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('m02_cat_period_sec_idx').on(t.period, t.sectionId, t.sortOrder)]
);

export const progressTrendPoints = pgTable(
  'progress_trend_points',
  {
    id: text('id').primaryKey(), // e.g. '2026-11_all'
    period: text('period').notNull(), // '2026-06' ~ '2026-11'
    sectionId: text('section_id').notNull(), // 'all' | 'sec1' ~ 'sec6'
    totalQty: doublePrecision('total_qty').notNull(),
    periodQty: doublePrecision('period_qty').notNull(),
    cumQty: doublePrecision('cum_qty').notNull(),
    cumPct: doublePrecision('cum_pct').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('m02_trend_sec_sort_idx').on(t.sectionId, t.sortOrder)]
);

export const progressDetailItems = pgTable(
  'progress_detail_items',
  {
    id: text('id').primaryKey(), // 'd1'..'d10' or 'rep_sec1_1'...
    itemScope: text('item_scope').notNull().default('overview'), // 'overview' | 'report'
    sectionId: text('section_id').notNull(),
    sectionName: text('section_name').notNull(),
    objectName: text('object_name').notNull(),
    category: text('category').notNull(),
    subItem: text('sub_item').notNull(),
    unit: text('unit').notNull(),
    totalQty: text('total_qty').notNull(),
    periodQty: text('period_qty').notNull(),
    cumQty: text('cum_qty').notNull(),
    pct: doublePrecision('pct').notNull(),
    dueDate: text('due_date').notNull(),
    sourceReport: text('source_report').notNull(),
    poiId: text('poi_id'),
    reportPeriod: text('report_period').notNull().default('2026-11'),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('m02_detail_scope_sec_idx').on(t.itemScope, t.sectionId, t.category)]
);

export const progressReports = pgTable(
  'progress_reports',
  {
    id: text('id').primaryKey(), // e.g. 'rep_2026_11_sec2'
    sectionId: text('section_id').notNull(),
    sectionName: text('section_name').notNull(),
    year: text('year').notNull(),
    month: text('month').notNull(),
    periodLabel: text('period_label').notNull(), // e.g. '2026年11月'
    reportName: text('report_name').notNull(),
    dueDate: text('due_date').notNull(),
    updatedDate: text('updated_date').notNull(),
    sourceName: text('source_name').notNull(),
    docCode: text('doc_code').notNull(),
    status: text('status').notNull().default('已归档'),
    summary: text('summary').notNull().default(''),
    createdBy: text('created_by').notNull().default('system'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m02_rep_ym_sec_idx').on(t.year, t.month, t.sectionId)]
);

export const progressPlanTasks = pgTable(
  'progress_plan_tasks',
  {
    id: text('id').primaryKey(), // 't1'..'t8'
    name: text('name').notNull(),
    category: text('category').notNull(),
    sectionId: text('section_id').notNull(),
    planLevel: text('plan_level').notNull().default('total'), // 'total' | 'year' | 'month'
    timeRange: text('time_range').notNull().default('2026'), // '2026' | '2026-2027'
    startMonthIdx: doublePrecision('start_month_idx').notNull(),
    endMonthIdx: doublePrecision('end_month_idx').notNull(),
    actualMonthIdx: doublePrecision('actual_month_idx').notNull(),
    milestoneMonthIdx: doublePrecision('milestone_month_idx'),
    status: text('status').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('m02_task_sec_cat_idx').on(t.sectionId, t.category)]
);

export const progressPlanNodes = pgTable(
  'progress_plan_nodes',
  {
    id: text('id').primaryKey(), // 'n1'..'n7'
    seq: integer('seq').notNull(),
    title: text('title').notNull(),
    planDate: text('plan_date').notNull(),
    status: text('status').notNull(),
    statusTone: text('status_tone').notNull().default('info'), // 'ok' | 'info' | 'warn'
    sectionId: text('section_id').notNull(),
    sectionName: text('section_name').notNull(),
    objectName: text('object_name').notNull(),
    taskName: text('task_name').notNull(),
    category: text('category').notNull(),
    specialty: text('specialty').notNull(),
    inShortList: boolean('in_short_list').notNull().default(false),
    listOrder: integer('list_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m02_node_sec_seq_idx').on(t.sectionId, t.seq)]
);

export const progressBimObjects = pgTable(
  'progress_bim_objects',
  {
    id: text('id').primaryKey(), // 'bridgeA' | 'beamYardA' | 'batchPlantA' | 'subgrade1'
    name: text('name').notNull(),
    poiId: text('poi_id').notNull(),
    sectionId: text('section_id').notNull(),
    sectionName: text('section_name').notNull(),
    planName: text('plan_name').notNull(),
    planVersion: text('plan_version').notNull(),
    startDate: text('start_date').notNull(),
    endDate: text('end_date').notNull(),
    tasks: jsonb('tasks').$type<BimTaskDef[]>().notNull(),
    simProgress: doublePrecision('sim_progress').notNull().default(89.8),
    simDate: text('sim_date').notNull().default('2026-11-25'),
    selectedTaskId: text('selected_task_id').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m02_bim_sec_sort_idx').on(t.sectionId, t.sortOrder)]
);
