import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export interface PublishOrderStepTimes {
  compose: string;
  review: string;
  auth: string;
  dispatch: string;
}

export interface PublishOrderAuditEntry {
  stage: string;
  actor: string;
  time: string;
  action: string;
  note: string;
}

export interface PublishPlanTriggerLog {
  time: string;
  event: string;
  result: string;
}

/**
 * 24 块情报板设备台账（VMS-BT-A01 ~ VMS-HT-D02）
 * 注：不强制外键引用 workSections.id，保持与 m05/m02 相同的灵活性（支持全线 'line' 扩展）。
 */
export const publishBoards = pgTable(
  'publish_boards',
  {
    id: text('id').primaryKey(), // VMS-BT-A01
    sectionId: text('section_id').notNull(), // sec1 ~ sec6
    pointName: text('point_name').notNull(),
    stake: text('stake').notNull(),
    group: text('group').notNull(), // 施工保通组 | 场站出入口 | 枢纽互通组 | 长大桥梁组
    groupDetail: text('group_detail').notNull(),
    direction: text('direction').notNull(), // 北安方向 | 明水方向
    spec: text('spec').notNull(), // 单黄LED 128×48 | 全彩LED 192×64
    online: boolean('online').notNull().default(true),
    confirmedTitle: text('confirmed_title').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2').notNull(),
    prevTitle: text('prev_title').notNull(),
    prevLine1: text('prev_line1').notNull(),
    prevLine2: text('prev_line2').notNull(),
    lastTime: text('last_time').notNull(),
    lastOrderId: text('last_order_id').notNull(),
    verifyTime: text('verify_time').notNull(),
    feedbackStatus: text('feedback_status').notNull().default('已确认显示'), // 已确认显示 | 待确认显示
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m13_boards_sec_group_idx').on(t.sectionId, t.group),
    index('m13_boards_online_fb_idx').on(t.online, t.feedbackStatus),
  ]
);

/**
 * 8 个情报板内容模板（MB-202611-001 ~ 008）
 */
export const publishTemplates = pgTable(
  'publish_templates',
  {
    id: text('id').primaryKey(), // MB-202611-003
    name: text('name').notNull(),
    category: text('category').notNull(), // 预案内容 | 常用文本 | 板面模板
    version: text('version').notNull().default('V1.0'),
    spec: text('spec').notNull(), // 单黄LED 128×48 | 全彩LED 192×64
    validText: text('valid_text').notNull(),
    startTime: text('start_time').notNull(),
    endTime: text('end_time').notNull(),
    status: text('status').notNull().default('有效'), // 有效 | 待启用
    line1: text('line1').notNull(),
    line2: text('line2').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m13_tpl_cat_spec_idx').on(t.category, t.spec),
    index('m13_tpl_status_idx').on(t.status),
  ]
);

/**
 * 8 条审核与信息发布单（FB-20261126-007 等）
 */
export const publishOrders = pgTable(
  'publish_orders',
  {
    id: text('id').primaryKey(), // FB-20261126-007
    title: text('title').notNull(),
    version: text('version').notNull(),
    sectionId: text('section_id').notNull(), // sec1 ~ sec6 | line
    groupLabel: text('group_label').notNull(),
    templateId: text('template_id').notNull(),
    spec: text('spec').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2').notNull(),
    validRange: text('valid_range').notNull(),
    scheduleTime: text('schedule_time').notNull(),
    fullTime: text('full_time').notNull(),
    date: text('date').notNull(), // YYYY-MM-DD
    period: text('period').notNull().default('2026年11月'),
    status: text('status').notNull().default('待审核'), // 待审核 | 待授权 | 已下发 | 已撤销
    operator: text('operator').notNull(),
    reviewer: text('reviewer').notNull(),
    authorizer: text('authorizer').notNull(),
    authorized: boolean('authorized').notNull().default(false),
    prevBoardSummary: text('prev_board_summary').notNull(),
    boardIds: jsonb('board_ids').$type<string[]>().notNull(),
    stepTimes: jsonb('step_times').$type<PublishOrderStepTimes>().notNull(),
    auditLogs: jsonb('audit_logs').$type<PublishOrderAuditEntry[]>().notNull().default([]),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m13_orders_sec_status_idx').on(t.sectionId, t.status),
    index('m13_orders_date_idx').on(t.date),
  ]
);

/**
 * 3 条联动预案（YA-DG-003, YA-TQ-002, YA-TS-001）
 */
export const publishPlans = pgTable(
  'publish_plans',
  {
    id: text('id').primaryKey(), // YA-DG-003
    name: text('name').notNull(),
    subTitle: text('sub_title').notNull(),
    scene: text('scene').notNull(), // 施工导改 | 天气预警 | 智慧提速
    sectionId: text('section_id').notNull(),
    triggerEvent: text('trigger_event').notNull(),
    approvalStatus: text('approval_status').notNull(), // 已批准 | 待批准
    interfaceStatus: text('interface_status').notNull(), // 接口就绪 | 待接入 | 待核验
    conditionMet: boolean('condition_met').notNull().default(false),
    targetGroup: text('target_group').notNull(),
    targetGroupKey: text('target_group_key').notNull(),
    validRange: text('valid_range').notNull(),
    templateId: text('template_id').notNull(),
    templateVersion: text('template_version').notNull(),
    line1: text('line1').notNull(),
    line2: text('line2').notNull(),
    linkedOrderId: text('linked_order_id').notNull().default(''),
    linkedOrderNote: text('linked_order_note').notNull().default(''),
    flowStage: integer('flow_stage').notNull().default(1),
    triggerLogs: jsonb('trigger_logs').$type<PublishPlanTriggerLog[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m13_plans_scene_sec_idx').on(t.scene, t.sectionId),
    index('m13_plans_cond_idx').on(t.conditionMet),
  ]
);

/**
 * 逐单逐设备下发/回执/回读/现场确认记录
 */
export const publishReceipts = pgTable(
  'publish_receipts',
  {
    id: text('id').primaryKey(), // `${orderId}__${boardId}`
    orderId: text('order_id').notNull(),
    boardId: text('board_id').notNull(),
    dispatchStatus: text('dispatch_status').notNull(), // 已下发 | 待下发
    dispatchTime: text('dispatch_time').notNull(),
    receiveStatus: text('receive_status').notNull(), // 已接收 | 未回执
    receiveTime: text('receive_time').notNull(),
    readbackStatus: text('readback_status').notNull(), // 内容一致 | 未回读
    readbackTime: text('readback_time').notNull(),
    confirmStatus: text('confirm_status').notNull(), // 已确认显示 | 待确认显示
    confirmTime: text('confirm_time').notNull(),
    verifyRecord: text('verify_record').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m13_receipts_order_idx').on(t.orderId, t.sortOrder),
    index('m13_receipts_board_idx').on(t.boardId),
  ]
);
