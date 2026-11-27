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

export interface UavWaypoint {
  no: string;
  name: string;
  lon: number;
  lat: number;
  alt: number;
  speed: number;
  action: string;
  req: string;
  checkItem: string;
  gimbal: string;
}

export interface UavRouteHistoryItem {
  ver: string;
  date: string;
  author: string;
  status: string;
  note: string;
}

export interface UavClueBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface UavTimelineStep {
  date: string;
  text: string;
  done: boolean;
}

export const uavHangars = pgTable(
  'uav_hangars',
  {
    id: text('id').primaryKey(), // H-A01 ~ H-B02
    name: text('name').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    status: text('status').notNull().default('在线'),
    temp: text('temp').notNull(),
    batterySlot: text('battery_slot').notNull(),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    alt: doublePrecision('alt').notNull().default(222),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('uav_hangars_sec_idx').on(t.sectionId)]
);

export const uavFleet = pgTable(
  'uav_fleet',
  {
    id: text('id').primaryKey(), // UAV-A01 ~ UAV-C01
    name: text('name').notNull(),
    model: text('model').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    hangarName: text('hangar_name').notNull(),
    status: text('status').notNull(), // 执行中 | 待命 | 充电中 | 离线维护
    battery: integer('battery').notNull().default(100),
    signal: text('signal').notNull().default('正常'),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('uav_fleet_sec_idx').on(t.sectionId)]
);

export const uavRoutes = pgTable(
  'uav_routes',
  {
    id: text('id').primaryKey(), // tpl-lc-a, tpl-bt-a, tpl-ql-a, ...
    name: text('name').notNull(),
    code: text('code').notNull(),
    status: text('status').notNull().default('已审核'), // 已审核 | 草稿
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    taskId: text('task_id').notNull(),
    targetName: text('target_name').notNull(),
    hangar: text('hangar').notNull(),
    lengthKm: doublePrecision('length_km').notNull(),
    icon: text('icon').notNull().default('layers'),
    center: jsonb('center').$type<[number, number]>().notNull(),
    boundary: jsonb('boundary').$type<[number, number][]>().notNull(),
    waypoints: jsonb('waypoints').$type<UavWaypoint[]>().notNull(),
    history: jsonb('history').$type<UavRouteHistoryItem[]>().notNull(),
    isTemplate: boolean('is_template').notNull().default(true),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('uav_routes_sec_idx').on(t.sectionId)]
);

export const uavTasks = pgTable(
  'uav_tasks',
  {
    id: text('id').primaryKey(), // UAV-20261126-01
    name: text('name').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    target: text('target').notNull(),
    type: text('type').notNull(), // 专项 | 全面 | 应急
    typeFull: text('type_full').notNull(),
    scene: text('scene').notNull(), // 施工保通 | 料场巡检 | 桥梁专项 | 路基边坡
    planTime: text('plan_time').notNull(),
    shortTime: text('short_time').notNull(),
    status: text('status').notNull(), // 待执行 | 执行中 | 待整理 | 已完成
    uav: text('uav').notNull(),
    owner: text('owner').notNull(),
    routeCode: text('route_code').notNull(),
    hangar: text('hangar').notNull(),
    checks: jsonb('checks').$type<string[]>().notNull(),
    allChecks: jsonb('all_checks').$type<string[]>().notNull(),
    preflightPassed: boolean('preflight_passed').notNull().default(false),
    stage: integer('stage').notNull().default(3),
    period: text('period').notNull().default('2026年11月'),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('uav_tasks_sec_status_idx').on(t.sectionId, t.status),
    index('uav_tasks_period_idx').on(t.period),
  ]
);

export const uavHazardClues = pgTable(
  'uav_hazard_clues',
  {
    id: text('id').primaryKey(), // UAI-20261126-004
    title: text('title').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    scene: text('scene').notNull(),
    period: text('period').notNull().default('2026年11月'),
    foundTime: text('found_time').notNull(),
    shortTime: text('short_time').notNull(),
    status: text('status').notNull(), // 待核查 | 已确认隐患 | 已标误报 | 已关联重复
    taskId: text('task_id').notNull(),
    waypoint: text('waypoint').notNull(),
    imgName: text('img_name').notNull(),
    wpLabel: text('wp_label').notNull(),
    category: text('category').notNull(),
    rule: text('rule').notNull(),
    source: text('source').notNull(),
    reviewer: text('reviewer').notNull(),
    note: text('note').notNull(),
    imgSrc: text('img_src').notNull().default('milestone_before.jpg'),
    box: jsonb('box').$type<UavClueBox>().notNull(),
    linkedHazard: text('linked_hazard').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('uav_clues_sec_status_idx').on(t.sectionId, t.status),
    index('uav_clues_period_idx').on(t.period),
  ]
);

export const uavReports = pgTable(
  'uav_reports',
  {
    id: text('id').primaryKey(), // RPT-20261126-03
    title: text('title').notNull(),
    taskId: text('task_id').notNull(),
    origTaskId: text('orig_task_id').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    location: text('location').notNull(),
    type: text('type').notNull(), // 复查报告 | 全面巡检报告 | 专项巡检报告
    reportDate: text('report_date').notNull(),
    period: text('period').notNull().default('2026年11月'),
    status: text('status').notNull(), // 已归档 | 待复查 | 草稿
    archiveTime: text('archive_time').notNull(),
    mediaSummary: text('media_summary').notNull(),
    flightRecCount: integer('flight_rec_count').notNull().default(1),
    photoCount: integer('photo_count').notNull().default(12),
    videoCount: integer('video_count').notNull().default(1),
    hazardCount: integer('hazard_count').notNull().default(1),
    isRecheck: boolean('is_recheck').notNull().default(false),
    summary: text('summary').notNull(),
    hazardId: text('hazard_id').notNull(),
    hazardDesc: text('hazard_desc').notNull(),
    hazardState: text('hazard_state').notNull(),
    recheckEvidence: text('recheck_evidence').notNull(),
    handleStatus: text('handle_status').notNull(),
    origTime: text('orig_time').notNull(),
    recheckTime: text('recheck_time').notNull(),
    timeline: jsonb('timeline').$type<UavTimelineStep[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('uav_reports_sec_status_idx').on(t.sectionId, t.status),
    index('uav_reports_period_idx').on(t.period),
  ]
);

export const uavLiveEvents = pgTable(
  'uav_live_events',
  {
    id: serial('id').primaryKey(),
    taskId: text('task_id').notNull(),
    uavId: text('uav_id').notNull(),
    eventTime: text('event_time').notNull(),
    eventType: text('event_type').notNull().default('telemetry'),
    text: text('text').notNull(),
    detail: jsonb('detail').$type<Record<string, unknown>>(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('uav_live_events_task_idx').on(t.taskId, t.createdAt)]
);
