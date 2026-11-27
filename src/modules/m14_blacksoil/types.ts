import type {
  BlacksoilComplianceStatus,
  BlacksoilPoint2D,
  EpochNotesMap,
  EpochSeriesMap,
} from '@/db/schema/domains/m14';

export const WORLD_W = 1600;
export const WORLD_H = 900;
export const MIN_ZOOM = 1.0;
export const MAX_ZOOM = 3.0;

export const EPOCH_LIST = ['2024', '2025', '2026'] as const;
export type EpochKey = (typeof EPOCH_LIST)[number];

export interface EpochMetaItem {
  epoch: EpochKey;
  year: string;
  tag: string;
  tagTone: 'base' | 'pre' | 'active';
  summary: string;
}

export const EPOCH_META: Record<EpochKey, EpochMetaItem> = {
  '2024': {
    epoch: '2024',
    year: '2024 年',
    tag: '基线期',
    tagTone: 'base',
    summary: '原生黑土耕地连片完整，仅见原有乡道',
  },
  '2025': {
    epoch: '2025',
    year: '2025 年',
    tag: '施工前',
    tagTone: 'pre',
    summary: '原有道路与完整耕地',
  },
  '2026': {
    epoch: '2026',
    year: '2026 年',
    tag: '施工期',
    tagTone: 'active',
    summary: '道路沿线可见拓宽施工带',
  },
};

/* 公路工程施工走廊中心线（世界坐标 1600x900） */
export const CORRIDOR_CENTERLINE: BlacksoilPoint2D[] = [
  [0, 622],
  [380, 544],
  [800, 456],
  [1220, 368],
  [1600, 290],
];

/* 施工红线多边形（半宽 46 世界单位，围绕中心线） */
export const CORRIDOR_POLYGON: BlacksoilPoint2D[] = [
  [0, 576],
  [380, 498],
  [800, 410],
  [1220, 322],
  [1600, 244],
  [1600, 336],
  [1220, 414],
  [800, 502],
  [380, 590],
  [0, 668],
];

export const COMPLIANCE_STATUS_OPTIONS: readonly BlacksoilComplianceStatus[] = [
  '已达标',
  '待核验',
  '整改中',
];

export interface BlacksoilParcelDTO {
  id: string;
  name: string;
  sectionId: string;
  sectionName: string;
  scope: string;
  stake: string;
  landType: string;
  protectionLayer: string;
  grade: string;
  areaHa: number;
  relation: string;
  topsoilStatus: string;
  topsoilThicknessCm: number;
  topsoilCompliant: boolean;
  complianceStatus: BlacksoilComplianceStatus;
  reviewNote: string;
  reviewedBy: string;
  reviewedAt: string;
  stripVol: string;
  backfillPlan: string;
  ndviSeries: EpochSeriesMap;
  moistureSeries: EpochSeriesMap;
  epochNotes: EpochNotesMap;
  polygonPoints: BlacksoilPoint2D[];
  centerPoint: BlacksoilPoint2D;
  labelOffset: BlacksoilPoint2D;
  focusZoom: number;
  sortOrder: number;
  updatedAt: string;
}

export interface BlacksoilParcelsResponse {
  epochs: Record<EpochKey, EpochMetaItem>;
  corridor: {
    worldWidth: number;
    worldHeight: number;
    centerline: BlacksoilPoint2D[];
    polygon: BlacksoilPoint2D[];
  };
  parcels: BlacksoilParcelDTO[];
}

export interface LayerVisibilityState {
  basemap: boolean;
  protection: boolean;
  corridor: boolean;
  labels: boolean;
}

export function computePolygonCenter(points: BlacksoilPoint2D[]): BlacksoilPoint2D {
  if (!points.length) return [WORLD_W / 2, WORLD_H / 2];
  let cx = 0;
  let cy = 0;
  for (const [x, y] of points) {
    cx += x;
    cy += y;
  }
  return [Math.round((cx / points.length) * 10) / 10, Math.round((cy / points.length) * 10) / 10];
}
