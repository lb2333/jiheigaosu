import {
  pgTable,
  text,
  integer,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export interface PinganDeliverableDoc {
  title: string;
  type: string;
  date: string;
  size: string;
  summary: string;
}

export interface PinganDeliverablesMap {
  midterm: PinganDeliverableDoc[];
  patent: PinganDeliverableDoc[];
  acceptance: PinganDeliverableDoc[];
}

export interface PinganStatItem {
  label: string;
  value: string;
  unit: string;
}

export interface PinganTelemetryItem {
  label: string;
  value: string;
}

/**
 * 平安工地项目展示条目（项目概览、媒体轮播幻灯片、阶段性重点成果）
 */
export const pinganShowcaseItems = pgTable(
  'pingan_showcase_items',
  {
    id: text('id').primaryKey(), // 'overview' | 'slide-1'..'slide-3' | 'res-1'..'res-3'
    itemType: text('item_type').notNull(), // 'overview' | 'slide' | 'featured'
    title: text('title').notNull(),
    subtitle: text('subtitle').notNull().default(''),
    summary: text('summary').notNull().default(''),
    topicId: text('topic_id').notNull().default(''),
    topicLabel: text('topic_label').notNull().default(''),
    kind: text('kind').notNull().default('image'), // 'image' | 'video' | ''
    imgPath: text('img_path').notNull().default(''),
    stake: text('stake').notNull().default(''),
    durationSec: integer('duration_sec').notNull().default(0),
    durationStr: text('duration_str').notNull().default(''),
    category: text('category').notNull().default(''),
    author: text('author').notNull().default(''),
    publishDate: text('publish_date').notNull().default(''),
    payload: jsonb('payload').$type<Record<string, unknown>>().notNull().default({}),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m12_showcase_type_sort_idx').on(t.itemType, t.sortOrder)]
);

/**
 * 平安百年品质工程研究专题台账（KT-01 ~ KT-08 及后续新增专题）
 */
export const pinganTopics = pgTable(
  'pingan_topics',
  {
    id: text('id').primaryKey(), // 'KT-01' .. 'KT-08'
    name: text('name').notNull(), // 专题全称
    shortName: text('short_name').notNull(), // 列表/矩阵展示简称
    summary: text('summary').notNull(), // 项目简介
    direction: text('direction').notNull(), // '品质提升' | '工业化建造' | '智慧提速' | '绿色低碳'
    stage: text('stage').notNull(), // '立项' | '计划与设计' | '研究执行' | '成果整理' | '验收与推广'
    achievements: text('achievements').notNull().default(''), // 已有成果
    note: text('note').notNull().default(''), // 备注
    sectionId: text('section_id').notNull().default('sec1'), // 'sec1' ~ 'sec6'
    deliverables: jsonb('deliverables').$type<PinganDeliverablesMap>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('m12_topics_dir_stage_sort_idx').on(t.direction, t.stage, t.sortOrder)]
);
