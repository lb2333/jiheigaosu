import type {
  SpeedAlgoSource,
  SpeedAuditHistoryItem,
  SpeedBatchSummaryItem,
  SpeedDirectionMetrics,
  SpeedFeedbackDevice,
  SpeedGeometryCheck,
  SpeedReplayTimelineStep,
  SpeedWeatherInfo,
} from '@/db/schema/domains/m11';

export type {
  SpeedAlgoSource,
  SpeedAuditHistoryItem,
  SpeedBatchSummaryItem,
  SpeedDirectionMetrics,
  SpeedFeedbackDevice,
  SpeedGeometryCheck,
  SpeedReplayTimelineStep,
  SpeedWeatherInfo,
};

export type SpeedSubPageId =
  | 'traffic'
  | 'algorithm'
  | 'strategy'
  | 'feedback'
  | 'replay';

export type DirectionKey = 'beian' | 'mingshui';

export interface SpeedPilotSegmentDTO {
  id: string;
  name: string;
  sectionId: string;
  sectionName: string;
  stake: string;
  lengthKm: number;
  lon: number;
  lat: number;
  alt: number;
  fallbackPct: { x: number; y: number };
  spanCoords: [number, number][];
  camId: string;
  weather: SpeedWeatherInfo;
  geometryCheck: SpeedGeometryCheck;
  directions: {
    beian: SpeedDirectionMetrics;
    mingshui: SpeedDirectionMetrics;
  };
  sortOrder: number;
}

export interface SpeedAlgoRecordDTO {
  id: string;
  segId: string;
  segName: string;
  date: string;
  time: string;
  fullTime: string;
  type: string;
  summary: string;
  status: string;
  badgeText: string;
  stateDetect: string;
  measuredQueue: number;
  predictedQueue: number;
  xLabels: string[];
  splitIndex: number;
  measuredSeries: number[];
  predictedSeries: number[];
  note: string;
  sources: SpeedAlgoSource[];
  model: string;
  version: string;
  strategyId: string;
  sortOrder: number;
}

export interface SpeedStrategyDTO {
  segId: string;
  segName: string;
  direction: string;
  date: string;
  measuredInner: number;
  measuredOuter: number;
  suggestInner: number;
  suggestOuter: number;
  publishedInner: number;
  publishedOuter: number;
  auditStatus: string;
  currentMode: string;
  triggerScene: string;
  latestStrategyId: string;
  latestGeneratedAt: string;
  linkedAlgoId: string;
  publishedStrategyId: string;
  publishedBatchId: string;
  publishedAt: string;
  vmsMessage: string;
  auditHistory: SpeedAuditHistoryItem[];
  sortOrder: number;
}

export interface SpeedFeedbackBatchDTO {
  batchId: string;
  segId: string;
  segName: string;
  directionLabel: string;
  strategyId: string;
  strategyAuthLabel: string;
  strategyTimeDesc: string;
  publishState: string;
  publishTime: string;
  publishShortDesc: string;
  confirmDurationSec: number;
  sameBatchSummary: SpeedBatchSummaryItem[];
  devices: SpeedFeedbackDevice[];
  sortOrder: number;
}

export interface SpeedReplayScenarioDTO {
  id: string;
  title: string;
  chartTitle: string;
  mode: string;
  segId: string;
  segName: string;
  dateRangeLabel: string;
  windowLabel: string;
  durationMin: number;
  defaultMin: number;
  sampleTag: string;
  popupSub: string;
  xTicks: string[];
  suggestStartMin: number;
  measuredInner: number[];
  measuredOuter: number[];
  suggestInner: number[];
  suggestOuter: number[];
  publishedInner: number[];
  publishedOuter: number[];
  queueSeries: number[];
  timeline: SpeedReplayTimelineStep[];
  sortOrder: number;
}

export interface SpeedOverviewResponse {
  segments: SpeedPilotSegmentDTO[];
  allSegments: SpeedPilotSegmentDTO[];
  corridorGeo: [number, number][];
  summary: {
    segmentCount: number;
    totalLengthKm: number;
    avgSpeed: number;
    totalFlow: number;
    attentionCount: number;
    maxQueueM: number;
  };
}

export interface SpeedAlgorithmResponse {
  records: SpeedAlgoRecordDTO[];
  allRecords: SpeedAlgoRecordDTO[];
  segments: SpeedPilotSegmentDTO[];
  kpis: {
    typeCount: number;
    todayCount: number;
    generatedCount: number;
    pendingSyncCount: number;
    attentionSegCount: number;
  };
}

export interface SpeedStrategiesResponse {
  strategies: SpeedStrategyDTO[];
  allStrategies: SpeedStrategyDTO[];
  segments: SpeedPilotSegmentDTO[];
  kpis: {
    segmentCount: number;
    laneSuggestionCount: number;
    pendingCount: number;
    approvedCount: number;
    publishedCount: number;
  };
}

export interface SpeedFeedbackResponse {
  batches: SpeedFeedbackBatchDTO[];
  allBatches: SpeedFeedbackBatchDTO[];
  segments: SpeedPilotSegmentDTO[];
}

export interface SpeedReplaysResponse {
  scenarios: SpeedReplayScenarioDTO[];
  segments: SpeedPilotSegmentDTO[];
  corridorGeo: [number, number][];
}

export const CORRIDOR_GEO: [number, number][] = [
  [125.925, 47.372],
  [125.955, 47.412],
  [125.982, 47.452],
  [126.005, 47.532],
  [125.995, 47.628],
  [126.028, 47.742],
  [126.132, 47.835],
  [126.252, 47.926],
  [126.328, 48.028],
  [126.368, 48.138],
  [126.405, 48.222],
];

export function fmtComma(n: number | null | undefined): string {
  return Number(n || 0).toLocaleString('en-US');
}

export function formatMinClock(xTicks: string[], minVal: number): string {
  const startClock = xTicks[0] || '09:55';
  const parts = startClock.split(':');
  const baseTotalMin =
    (Number.parseInt(parts[0] || '9', 10) || 9) * 60 +
    (Number.parseInt(parts[1] || '55', 10) || 55);
  const curTotalSec = Math.round((baseTotalMin + minVal) * 60);
  const hh = String(Math.floor(curTotalSec / 3600) % 24).padStart(2, '0');
  const mm = String(Math.floor((curTotalSec % 3600) / 60)).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function formatPlayTimeMMSS(minVal: number): string {
  const totalSec = Math.max(0, Math.round(minVal * 60));
  const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
  const ss = String(totalSec % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function modePillClass(mode: string): string {
  if (mode === '异常回退') return 'm11-pill-warn';
  if (mode === '风险待核') return 'm11-pill-info';
  return 'm11-pill-ok';
}
