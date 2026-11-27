import {
  pgTable,
  text,
  integer,
  jsonb,
  serial,
  bigserial,
  doublePrecision,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export interface PoiMetricInfo {
  length: string;
  progress: string;
  beamsDone: string;
  supervisor: string;
}

export interface PoiDocItem {
  name: string;
  type: string;
  date: string;
  size: string;
}

export interface ShowcaseKpi {
  label: string;
  val: string;
}

export interface ShowcaseSummary {
  title: string;
  desc: string;
}

export const workSections = pgTable('work_sections', {
  id: text('id').primaryKey(), // sec1 ~ sec6
  name: text('name').notNull(),
  stakeRange: text('stake_range').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  sectionsCount: integer('sections_count').notNull().default(1),
  keyWorksCount: integer('key_works_count').notNull().default(1),
  yardsCount: integer('yards_count').notNull().default(1),
  progressMetrics: jsonb('progress_metrics').$type<number[]>().notNull(),
  qualityMetrics: jsonb('quality_metrics').$type<number[]>().notNull(),
  safetyMetrics: jsonb('safety_metrics').$type<number[]>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const poiObjects = pgTable(
  'poi_objects',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    type: text('type').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(),
    stage: text('stage').notNull(),
    stake: text('stake').notNull(),
    cameraName: text('camera_name').notNull(),
    icon: text('icon').notNull(),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    alt: doublePrecision('alt').notNull().default(220),
    imgPath: text('img_path').notNull(),
    duration: text('duration').notNull(),
    elapsedSec: integer('elapsed_sec').notNull().default(0),
    photosCount: integer('photos_count').notNull().default(0),
    videosCount: integer('videos_count').notNull().default(0),
    inspectionsCount: integer('inspections_count').notNull().default(0),
    metrics: jsonb('metrics').$type<PoiMetricInfo>().notNull(),
    docs: jsonb('docs').$type<PoiDocItem[]>().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('poi_objects_section_idx').on(t.sectionId)]
);

export const focusItems = pgTable(
  'focus_items',
  {
    id: serial('id').primaryKey(),
    category: text('category').notNull(), // 'nodes' | 'issues' | 'collab'
    categoryTitle: text('category_title').notNull(),
    summaryPrefix: text('summary_prefix').notNull(),
    unit: text('unit').notNull().default('项'),
    icon: text('icon').notNull(),
    title: text('title').notNull(),
    sectionName: text('section_name').notNull(),
    dueDate: text('due_date').notNull(),
    status: text('status').notNull(),
    statusTone: text('status_tone').notNull().default('info'), // ok | warn | info
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('focus_items_cat_sort_idx').on(t.category, t.sortOrder)]
);

export const milestoneNodes = pgTable('milestone_nodes', {
  id: text('id').primaryKey(),
  milestoneDate: text('milestone_date').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  imgMode: text('img_mode').notNull().default('before'), // before | after
  cssFilter: text('css_filter').notNull().default('none'),
  photosCount: integer('photos_count').notNull().default(0),
  videosCount: integer('videos_count').notNull().default(0),
  logsCount: integer('logs_count').notNull().default(0),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const showcaseTopics = pgTable('showcase_topics', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  subtitle: text('subtitle').notNull(),
  videoTitle: text('video_title').notNull(),
  durationSec: integer('duration_sec').notNull(),
  durationStr: text('duration_str').notNull(),
  icon: text('icon').notNull(),
  imgPath: text('img_path').notNull(),
  kpis: jsonb('kpis').$type<ShowcaseKpi[]>().notNull(),
  chapters: jsonb('chapters').$type<string[]>().notNull(),
  summaries: jsonb('summaries').$type<ShowcaseSummary[]>().notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

export const systemConfigs = pgTable(
  'system_configs',
  {
    key: text('key').primaryKey(),
    category: text('category').notNull(), // 'base' | 'integration' | 'metrics' | 'content'
    label: text('label').notNull(),
    value: jsonb('value').$type<Record<string, unknown>>().notNull(),
    updatedBy: text('updated_by').notNull().default('system'),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('system_configs_category_idx').on(t.category)]
);

export const auditLogs = pgTable(
  'audit_logs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: text('user_id'),
    userName: text('user_name').notNull(),
    action: text('action').notNull(),
    moduleId: text('module_id').notNull(),
    target: text('target').notNull(),
    detail: jsonb('detail').$type<Record<string, unknown>>(),
    ipAddress: text('ip_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('audit_logs_mod_created_idx').on(t.moduleId, t.createdAt)]
);
