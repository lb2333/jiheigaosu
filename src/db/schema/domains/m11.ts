import {
  pgTable,
  text,
  integer,
  doublePrecision,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export interface SpeedWeatherInfo {
  temp: string;
  vis: string;
  road: string;
}

export interface SpeedGeometryCheck {
  ssd: string;
  alignment: string;
  clearance: string;
}

export interface SpeedDirectionMetrics {
  avgSpeed: number;
  flow: number;
  innerSpeed: number;
  outerSpeed: number;
  shoulderStatus: string;
  shoulderOccupied: boolean;
  queueM: number;
  attention: boolean;
  statusLabel: string;
  eventTitle: string;
  eventDesc: string;
  detectTime: string;
  source: string;
  camBoxText: string;
}

export interface SpeedAlgoSource {
  name: string;
  desc: string;
  time: string;
  icon: 'video' | 'radar' | 'weather' | 'bim';
}

export interface SpeedAuditHistoryItem {
  time: string;
  actor: string;
  action: string;
  result: string;
}

export interface SpeedBatchSummaryItem {
  label: string;
  text: string;
}

export interface SpeedFeedbackDevice {
  id: string;
  type: '可变限速标志' | '情报板';
  name: string;
  cmd: string;
  receipt: string;
  time: string;
  exceptionTime: string;
  status: '回执成功' | '回执超时';
  logs: string[];
}

export interface SpeedReplayTimelineStep {
  min: number;
  clock: string;
  title: string;
  desc: string;
}

/**
 * 智慧提速受限试点区段（QD-01 ~ QD-04）
 * 注意：按工区筛选时部分记录关联全线 'line'，故 sectionId 不加 workSections.id 外键约束。
 */
export const speedPilotSegments = pgTable(
  'speed_pilot_segments',
  {
    id: text('id').primaryKey(), // QD-01 ~ QD-04
    name: text('name').notNull(),
    sectionId: text('section_id').notNull(), // sec2, sec3, sec4, sec6
    sectionName: text('section_name').notNull(),
    stake: text('stake').notNull(),
    lengthKm: doublePrecision('length_km').notNull(),
    lon: doublePrecision('lon').notNull(),
    lat: doublePrecision('lat').notNull(),
    alt: doublePrecision('alt').notNull().default(235),
    fallbackPct: jsonb('fallback_pct').$type<{ x: number; y: number }>().notNull(),
    spanCoords: jsonb('span_coords').$type<[number, number][]>().notNull(),
    camId: text('cam_id').notNull(),
    weather: jsonb('weather').$type<SpeedWeatherInfo>().notNull(),
    geometryCheck: jsonb('geometry_check').$type<SpeedGeometryCheck>().notNull(),
    directions: jsonb('directions')
      .$type<{ beian: SpeedDirectionMetrics; mingshui: SpeedDirectionMetrics }>()
      .notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m11_seg_sec_sort_idx').on(t.sectionId, t.sortOrder)]
);

/**
 * 专项算法研判记录（YP-*）
 */
export const speedAlgoRecords = pgTable(
  'speed_algo_records',
  {
    id: text('id').primaryKey(), // YP-20261126-042 ...
    segId: text('seg_id').notNull(),
    segName: text('seg_name').notNull(),
    date: text('date').notNull(),
    time: text('time').notNull(),
    fullTime: text('full_time').notNull(),
    type: text('type').notNull(), // 状态识别 | 队列预测 | 回退建议
    summary: text('summary').notNull(),
    status: text('status').notNull(), // 需关注 | 待核查 | 已生成
    badgeText: text('badge_text').notNull(),
    stateDetect: text('state_detect').notNull(),
    measuredQueue: integer('measured_queue').notNull(),
    predictedQueue: integer('predicted_queue').notNull(),
    xLabels: jsonb('x_labels').$type<string[]>().notNull(),
    splitIndex: integer('split_index').notNull().default(3),
    measuredSeries: jsonb('measured_series').$type<number[]>().notNull(),
    predictedSeries: jsonb('predicted_series').$type<number[]>().notNull(),
    note: text('note').notNull(),
    sources: jsonb('sources').$type<SpeedAlgoSource[]>().notNull(),
    model: text('model').notNull(),
    version: text('version').notNull(),
    strategyId: text('strategy_id').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m11_algo_seg_date_idx').on(t.segId, t.date, t.status)]
);

/**
 * 分车道速度策略台账（QD-01 ~ QD-04，每区段含内/外侧两车道策略参数及审核历史）
 */
export const speedStrategies = pgTable(
  'speed_strategies',
  {
    segId: text('seg_id').primaryKey(), // QD-01 ~ QD-04
    segName: text('seg_name').notNull(),
    direction: text('direction').notNull().default('beian'),
    date: text('date').notNull().default('2026-11-26'),
    measuredInner: integer('measured_inner').notNull(),
    measuredOuter: integer('measured_outer').notNull(),
    suggestInner: integer('suggest_inner').notNull(),
    suggestOuter: integer('suggest_outer').notNull(),
    publishedInner: integer('published_inner').notNull(),
    publishedOuter: integer('published_outer').notNull(),
    auditStatus: text('audit_status').notNull(), // 待审核 | 已审核
    currentMode: text('current_mode').notNull(), // 异常回退 | 风险待核 | 常态管控
    triggerScene: text('trigger_scene').notNull(),
    latestStrategyId: text('latest_strategy_id').notNull(),
    latestGeneratedAt: text('latest_generated_at').notNull(),
    linkedAlgoId: text('linked_algo_id').notNull(),
    publishedStrategyId: text('published_strategy_id').notNull(),
    publishedBatchId: text('published_batch_id').notNull(),
    publishedAt: text('published_at').notNull(),
    vmsMessage: text('vms_message').notNull(),
    auditHistory: jsonb('audit_history').$type<SpeedAuditHistoryItem[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m11_strategy_audit_sort_idx').on(t.auditStatus, t.sortOrder)]
);

/**
 * 信息发布与设备执行反馈批次（FB-20261126-017 等）
 */
export const speedFeedbackBatches = pgTable(
  'speed_feedback_batches',
  {
    batchId: text('batch_id').primaryKey(), // FB-20261126-017 ...
    segId: text('seg_id').notNull(),
    segName: text('seg_name').notNull(),
    directionLabel: text('direction_label').notNull(),
    strategyId: text('strategy_id').notNull(),
    strategyAuthLabel: text('strategy_auth_label').notNull(),
    strategyTimeDesc: text('strategy_time_desc').notNull(),
    publishState: text('publish_state').notNull(),
    publishTime: text('publish_time').notNull(),
    publishShortDesc: text('publish_short_desc').notNull(),
    confirmDurationSec: integer('confirm_duration_sec').notNull().default(4),
    sameBatchSummary: jsonb('same_batch_summary').$type<SpeedBatchSummaryItem[]>().notNull(),
    devices: jsonb('devices').$type<SpeedFeedbackDevice[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m11_feedback_seg_sort_idx').on(t.segId, t.sortOrder)]
);

/**
 * 场景回放与模拟演示（RP-* & SIM-*）
 */
export const speedReplayScenarios = pgTable(
  'speed_replay_scenarios',
  {
    id: text('id').primaryKey(), // RP-20261126-01 ... SIM-20261126-03
    title: text('title').notNull(),
    chartTitle: text('chart_title').notNull(),
    mode: text('mode').notNull(), // 实际回放 | 模拟演示
    segId: text('seg_id').notNull(),
    segName: text('seg_name').notNull(),
    dateRangeLabel: text('date_range_label').notNull(),
    windowLabel: text('window_label').notNull(),
    durationMin: integer('duration_min').notNull(),
    defaultMin: integer('default_min').notNull(),
    sampleTag: text('sample_tag').notNull(),
    popupSub: text('popup_sub').notNull(),
    xTicks: jsonb('x_ticks').$type<string[]>().notNull(),
    suggestStartMin: integer('suggest_start_min').notNull(),
    measuredInner: jsonb('measured_inner').$type<number[]>().notNull(),
    measuredOuter: jsonb('measured_outer').$type<number[]>().notNull(),
    suggestInner: jsonb('suggest_inner').$type<number[]>().notNull(),
    suggestOuter: jsonb('suggest_outer').$type<number[]>().notNull(),
    publishedInner: jsonb('published_inner').$type<number[]>().notNull(),
    publishedOuter: jsonb('published_outer').$type<number[]>().notNull(),
    queueSeries: jsonb('queue_series').$type<number[]>().notNull(),
    timeline: jsonb('timeline').$type<SpeedReplayTimelineStep[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m11_replay_mode_seg_idx').on(t.mode, t.segId, t.sortOrder)]
);
