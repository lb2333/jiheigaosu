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
import { workSections } from '../core';

export type EpochSeriesMap = {
  '2024': number;
  '2025': number;
  '2026': number;
};

export type EpochNotesMap = {
  '2024': string;
  '2025': string;
  '2026': string;
};

export type BlacksoilPoint2D = [number, number];

export type BlacksoilComplianceStatus = '已达标' | '待核验' | '整改中';

/**
 * 黑土地保护监测地块台账（HT-01 ~ HT-06，覆盖一至六工区）
 */
export const blacksoilParcels = pgTable(
  'blacksoil_parcels',
  {
    id: text('id').primaryKey(), // 'HT-01' ~ 'HT-06'
    name: text('name').notNull(),
    sectionId: text('section_id')
      .notNull()
      .references(() => workSections.id, { onDelete: 'cascade' }),
    sectionName: text('section_name').notNull(),
    scope: text('scope').notNull().default('沿线演示区'),
    stake: text('stake').notNull(),
    landType: text('land_type').notNull(),
    protectionLayer: text('protection_layer').notNull().default('黑土地保护范围'),
    grade: text('grade').notNull(),
    areaHa: doublePrecision('area_ha').notNull(),
    relation: text('relation').notNull(),
    topsoilStatus: text('topsoil_status').notNull(),
    topsoilThicknessCm: integer('topsoil_thickness_cm').notNull().default(35),
    topsoilCompliant: boolean('topsoil_compliant').notNull().default(true),
    complianceStatus: text('compliance_status')
      .$type<BlacksoilComplianceStatus>()
      .notNull()
      .default('已达标'),
    reviewNote: text('review_note').notNull().default(''),
    reviewedBy: text('reviewed_by').notNull().default(''),
    reviewedAt: text('reviewed_at').notNull().default(''),
    stripVol: text('strip_vol').notNull(),
    backfillPlan: text('backfill_plan').notNull(),
    ndviSeries: jsonb('ndvi_series').$type<EpochSeriesMap>().notNull(),
    moistureSeries: jsonb('moisture_series').$type<EpochSeriesMap>().notNull(),
    epochNotes: jsonb('epoch_notes').$type<EpochNotesMap>().notNull(),
    polygonPoints: jsonb('polygon_points').$type<BlacksoilPoint2D[]>().notNull(),
    centerPoint: jsonb('center_point').$type<BlacksoilPoint2D>().notNull(),
    labelOffset: jsonb('label_offset').$type<BlacksoilPoint2D>().notNull(),
    focusZoom: doublePrecision('focus_zoom').notNull().default(1.5),
    sortOrder: integer('sort_order').notNull().default(0),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index('m14_parcel_sec_sort_idx').on(t.sectionId, t.sortOrder),
    index('m14_parcel_status_idx').on(t.complianceStatus),
  ]
);
