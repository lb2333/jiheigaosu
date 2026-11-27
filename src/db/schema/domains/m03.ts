import {
  pgTable,
  text,
  integer,
  doublePrecision,
  boolean,
  jsonb,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';
import { workSections } from '../core';

export interface MixingMaterialItem {
  name: string;
  target: number;
  actual: number;
  unit: string;
}

export const qualitySectionMetrics = pgTable('quality_section_metrics', {
  sectionId: text('section_id')
    .primaryKey()
    .references(() => workSections.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  shortName: text('short_name').notNull(),
  labName: text('lab_name').notNull(),
  stationShort: text('station_short').notNull(),
  stationFull: text('station_full').notNull(),
  yardName: text('yard_name').notNull(),
  stakeRange: text('stake_range').notNull(),
  labBatches: integer('lab_batches').notNull(),
  labPassRate: doublePrecision('lab_pass_rate').notNull(),
  mixVol: doublePrecision('mix_vol').notNull(),
  mixBatches: integer('mix_batches').notNull(),
  beams: integer('beams').notNull(),
  pavKm: doublePrecision('pav_km').notNull(),
  pavSegments: integer('pav_segments').notNull(),
  issuesCount: integer('issues_count').notNull(),
  qualityRate: doublePrecision('quality_rate').notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

export const qualityInspections = pgTable(
  'quality_inspections',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    section: text('section').notNull(),
    category: text('category').notNull(),
    target: text('target').notNull(),
    content: text('content').notNull(),
    result: text('result').notNull(),
    description: text('description').notNull(),
    rectify: text('rectify').notNull(),
    inspectedAt: text('inspected_at').notNull(),
    measured: text('measured').notNull(),
    standard: text('standard').notNull(),
    inspector: text('inspector').notNull(),
    note: text('note').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (t) => [index('quality_inspections_sec_idx').on(t.sectionId)]
);

export const qualityLabRecords = pgTable(
  'quality_lab_records',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    lab: text('lab').notNull(),
    category: text('category').notNull(),
    sample: text('sample').notNull(),
    item: text('item').notNull(),
    testedAt: text('tested_at').notNull(),
    result: text('result').notNull(),
    reportState: text('report_state').notNull(),
    retestState: text('retest_state').notNull(),
    measured: text('measured').notNull(),
    limitSpec: text('limit_spec').notNull(),
    machine: text('machine').notNull(),
    hash: text('hash').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quality_lab_records_sec_idx').on(t.sectionId)]
);

export const qualityMixingRecords = pgTable(
  'quality_mixing_records',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    section: text('section').notNull(),
    station: text('station').notNull(),
    prodType: text('prod_type').notNull(),
    mixCode: text('mix_code').notNull(),
    volume: doublePrecision('volume').notNull(),
    producedAt: text('produced_at').notNull(),
    judge: text('judge').notNull(),
    alertTitle: text('alert_title').notNull().default(''),
    handled: boolean('handled').notNull().default(true),
    handleNote: text('handle_note').notNull().default(''),
    temp: text('temp').notNull(),
    deviation: text('deviation').notNull(),
    materials: jsonb('materials').$type<MixingMaterialItem[]>().notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quality_mixing_records_sec_idx').on(t.sectionId)]
);

export const qualityPavementRecords = pgTable(
  'quality_pavement_records',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    section: text('section').notNull(),
    dir: text('dir').notNull(),
    stake: text('stake').notNull(),
    layer: text('layer').notNull(),
    temp: doublePrecision('temp').notNull(),
    passes: integer('passes').notNull(),
    compaction: doublePrecision('compaction').notNull(),
    thickness: doublePrecision('thickness').notNull(),
    designThick: doublePrecision('design_thick').notNull(),
    judge: text('judge').notNull(),
    alertTitle: text('alert_title').notNull().default(''),
    verified: boolean('verified').notNull().default(true),
    recordedAt: text('recorded_at').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quality_pavement_records_sec_idx').on(t.sectionId)]
);

export const qualityBeamRecords = pgTable(
  'quality_beam_records',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    yard: text('yard').notNull(),
    beamType: text('beam_type').notNull(),
    castDate: text('cast_date').notNull(),
    curing: text('curing').notNull(),
    tension: text('tension').notNull(),
    grout: text('grout').notNull(),
    inspect: text('inspect').notNull(),
    pedestal: text('pedestal').notNull(),
    alertTitle: text('alert_title').notNull().default(''),
    alertState: text('alert_state').notNull().default(''),
    alertTime: text('alert_time').notNull().default(''),
    statusState: text('status_state').notNull(),
    temp: text('temp').notNull(),
    humidity: text('humidity').notNull(),
    elongation: text('elongation').notNull(),
    groutPressure: text('grout_pressure').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quality_beam_records_sec_idx').on(t.sectionId)]
);

export const qualityIssues = pgTable(
  'quality_issues',
  {
    id: text('id').primaryKey(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    section: text('section').notNull(),
    issueType: text('issue_type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    unit: text('unit').notNull(),
    foundAt: text('found_at').notNull(),
    deadline: text('deadline').notNull(),
    status: text('status').notNull(),
    daysUsed: doublePrecision('days_used'),
    measure: text('measure').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [index('quality_issues_sec_idx').on(t.sectionId)]
);
