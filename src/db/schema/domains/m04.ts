import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  jsonb,
  serial,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workSections } from '../core';

export interface AiDetectBox {
  left: number;
  top: number;
  width: number;
  height: number;
}

export const safetyRiskPoints = pgTable(
  'safety_risk_points',
  {
    id: text('id').primaryKey(), // R-01 ~ R-12
    name: text('name').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    category: text('category').notNull(),
    level: text('level').notNull(), // 重大 | 较大 | 一般 | 低风险
    location: text('location').notNull(),
    unit: text('unit').notNull(),
    mapX: doublePrecision('map_x').notNull(),
    mapY: doublePrecision('map_y').notNull(),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    status: text('status').notNull(), // 管控中 | 重点盯控 | 正常受控
    measures: jsonb('measures').$type<string[]>().notNull(),
    linkedHazardId: text('linked_hazard_id').notNull().default(''),
    imgKey: text('img_key').notNull().default('corridor'),
    camCode: text('cam_code').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('safety_risk_points_sec_idx').on(t.sectionId)]
);

export const safetyHazards = pgTable(
  'safety_hazards',
  {
    id: text('id').primaryKey(), // AQ-202611-039
    period: text('period').notNull(), // 2026-11 | 2026-10 | 2026-09
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    source: text('source').notNull(), // 人工巡查 | 视频AI | 无人机巡检
    category: text('category').notNull(),
    description: text('description').notNull(),
    level: text('level').notNull().default('一般隐患'),
    dueDate: text('due_date').notNull(),
    dueFull: text('due_full').notNull(),
    status: text('status').notNull(), // 待派发 | 整改中 | 待复查 | 已销项
    overdue: boolean('overdue').notNull().default(false),
    foundAt: text('found_at').notNull(),
    dispatchedAt: text('dispatched_at').notNull().default(''),
    feedbackAt: text('feedback_at').notNull().default(''),
    owner: text('owner').notNull().default('整改负责人A（演示）'),
    req: text('req').notNull().default(''),
    beforeNote: text('before_note').notNull().default(''),
    afterNote: text('after_note').notNull().default(''),
    reviewer: text('reviewer').notNull().default('监理复查人员A（演示）'),
    reviewTime: text('review_time').notNull().default(''),
    reviewNote: text('review_note').notNull().default(''),
    attachment: text('attachment').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('safety_hazards_period_sec_idx').on(t.period, t.sectionId),
    index('safety_hazards_status_idx').on(t.status),
  ]
);

export const safetyAiAlerts = pgTable(
  'safety_ai_alerts',
  {
    id: text('id').primaryKey(), // VAI-20261124-008
    period: text('period').notNull(),
    alertTime: text('alert_time').notNull(),
    shortTime: text('short_time').notNull(),
    timeWindow: text('time_window').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    shortLoc: text('short_loc').notNull(),
    camera: text('camera').notNull(),
    algorithm: text('algorithm').notNull(),
    event: text('event').notNull(),
    status: text('status').notNull(), // 待核实 | 已确认 | 已标误报 | 重复关联
    imgKey: text('img_key').notNull().default('corridor'),
    box: jsonb('box').$type<AiDetectBox>().notNull(),
    frames: jsonb('frames').$type<string[]>().notNull(),
    note: text('note').notNull().default(''),
    linkedHazardId: text('linked_hazard_id').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('safety_ai_alerts_period_sec_st_idx').on(t.period, t.sectionId, t.status)]
);

export const safetyExternalRecords = pgTable(
  'safety_external_records',
  {
    extId: text('ext_id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    origin: text('origin').notNull(),
    description: text('description').notNull(),
    linkedHazardId: text('linked_hazard_id').notNull(),
    syncTime: text('sync_time').notNull(),
    status: text('status').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('safety_ext_sec_idx').on(t.sectionId)]
);

export const safetyActivities = pgTable(
  'safety_activities',
  {
    id: serial('id').primaryKey(),
    title: text('title').notNull(),
    timeLabel: text('time_label').notNull(),
    code: text('code').notNull(),
    status: text('status').notNull(),
    tagClass: text('tag_class').notNull(),
    sectionId: text('section_id').notNull(),
    icon: text('icon').notNull().default('clock'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('safety_activities_created_idx').on(t.createdAt)]
);
