import {
  pgTable,
  text,
  integer,
  boolean,
  jsonb,
  serial,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workSections } from '../core';

export interface PlaybackSegmentMeta {
  idx: number;
  label: string;
  fullLabel: string;
  durationMin: number;
  hasAlarm: boolean;
}

export const videoCameras = pgTable(
  'video_cameras',
  {
    id: text('id').primaryKey(), // e.g. CAM-YD-A01
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(), // 一工区 ~ 六工区
    name: text('name').notNull(),
    stake: text('stake').notNull(),
    location: text('location').notNull(),
    siteType: text('site_type').notNull(), // 料场 | 梁场 | 保通段 | 桥梁 | 拌合站 | 路基边坡
    purpose: text('purpose').notNull(),
    status: text('status').notNull(), // 在线 | 图像异常 | 离线
    sceneType: text('scene_type').notNull(), // yardLane | gate | beamYard | highway | bridgePier | yardRoad | batchPlant | subgrade
    lastTime: text('last_time').notNull(),
    source: text('source').notNull().default('原视频系统'),
    resolution: text('resolution').notNull().default('1920×1080'),
    ip: text('ip').notNull(),
    faultNote: text('fault_note').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('video_cameras_section_idx').on(t.sectionId),
    index('video_cameras_status_idx').on(t.status),
  ]
);

export const videoPatrolGroups = pgTable(
  'video_patrol_groups',
  {
    id: text('id').primaryKey(), // grp-key | grp-yard | grp-traffic | grp-custom-...
    name: text('name').notNull(),
    builtIn: boolean('built_in').notNull().default(false),
    cameraIds: jsonb('camera_ids').$type<string[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('video_patrol_groups_sort_idx').on(t.sortOrder)]
);

export const videoPlaybackAlarms = pgTable(
  'video_playback_alarms',
  {
    id: text('id').primaryKey(), // VAI-20261126-014
    cameraId: text('camera_id')
      .notNull()
      .references(() => videoCameras.id, { onDelete: 'cascade' }),
    recordDate: text('record_date').notNull().default('2026-11-26'),
    timeRange: text('time_range').notNull().default('09:00–10:00'),
    title: text('title').notNull(),
    status: text('status').notNull().default('已关联'),
    alarmTime: text('alarm_time').notNull(),
    alarmClipIdx: integer('alarm_clip_idx').notNull().default(1),
    alarmSecInClip: integer('alarm_sec_in_clip').notNull().default(752),
    clipWindow: text('clip_window').notNull(),
    hazardId: text('hazard_id').notNull(),
    note: text('note').notNull(),
    safetyDetail: text('safety_detail').notNull(),
    segments: jsonb('segments').$type<PlaybackSegmentMeta[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    index('video_playback_alarms_cam_idx').on(t.cameraId),
    index('video_playback_alarms_date_idx').on(t.recordDate),
  ]
);

export const videoAirGroundPairs = pgTable(
  'video_air_ground_pairs',
  {
    id: text('id').primaryKey(), // AG-01 ~ AG-05
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(),
    siteName: text('site_name').notNull(),
    partName: text('part_name').notNull(),
    evidenceDate: text('evidence_date').notNull(),
    matched: boolean('matched').notNull().default(true),
    camId: text('cam_id').notNull(),
    camLabel: text('cam_label').notNull(),
    camStake: text('cam_stake').notNull(),
    camTime: text('cam_time').notNull(),
    camTag: text('cam_tag').notNull(),
    uavTaskId: text('uav_task_id').notNull(),
    uavTaskName: text('uav_task_name').notNull(),
    uavFile: text('uav_file').notNull(),
    uavTime: text('uav_time').notNull(),
    uavPart: text('uav_part').notNull(),
    timeDiffSec: integer('time_diff_sec').notNull(),
    hazardTitle: text('hazard_title').notNull(),
    hazardId: text('hazard_id').notNull(),
    alarmId: text('alarm_id').notNull(),
    summary: text('summary').notNull(),
    sceneType: text('scene_type').notNull(),
    recheckSent: boolean('recheck_sent').notNull().default(false),
    recheckTime: text('recheck_time').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [
    index('video_air_ground_sec_idx').on(t.sectionId),
    index('video_air_ground_date_idx').on(t.evidenceDate),
  ]
);

export const videoAirGroundReviews = pgTable(
  'video_air_ground_reviews',
  {
    id: serial('id').primaryKey(),
    pairId: text('pair_id')
      .notNull()
      .references(() => videoAirGroundPairs.id, { onDelete: 'cascade' }),
    hazardId: text('hazard_id').notNull(),
    camId: text('cam_id').notNull(),
    uavRoute: text('uav_route').notNull(),
    instruction: text('instruction').notNull(),
    submittedBy: text('submitted_by').notNull(),
    status: text('status').notNull().default('已下发'),
    recheckTime: text('recheck_time').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('video_air_ground_reviews_pair_idx').on(t.pairId)]
);

export const videoEvidenceCaptures = pgTable(
  'video_evidence_captures',
  {
    id: serial('id').primaryKey(),
    cameraId: text('camera_id')
      .notNull()
      .references(() => videoCameras.id, { onDelete: 'cascade' }),
    recordDate: text('record_date').notNull(),
    capturedAt: text('captured_at').notNull(),
    clipLabel: text('clip_label').notNull(),
    note: text('note').notNull().default('历史录像截图取证'),
    capturedBy: text('captured_by').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('video_evidence_captures_cam_idx').on(t.cameraId)]
);
