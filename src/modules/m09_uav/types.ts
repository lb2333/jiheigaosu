import type {
  UavClueBox,
  UavRouteHistoryItem,
  UavTimelineStep,
  UavWaypoint,
} from '@/db/schema/domains/m09';

export type { UavClueBox, UavRouteHistoryItem, UavTimelineStep, UavWaypoint };

export interface SectionInfo {
  id: string;
  name: string;
  stake: string;
}

export const SECTIONS: SectionInfo[] = [
  { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
  { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
  { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
  { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
  { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
  { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' },
];

export const SEC_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s.name])
);

export function secLabel(secId: string): string {
  return SEC_NAME_BY_ID[secId] ?? '全线';
}

export interface MapPoiItem {
  id: string;
  name: string;
  shortName: string;
  secId: string;
  scene: string;
  lon: number;
  lat: number;
  alt: number;
  gold: boolean;
  desc: string;
}

export const MAP_POIS: MapPoiItem[] = [
  {
    id: 'yardA',
    name: '二工区·料场示例A',
    shortName: '料场示例A',
    secId: 'sec2',
    scene: '料场巡检',
    lon: 126.115,
    lat: 47.508,
    alt: 222,
    gold: false,
    desc: '二工区核心储料场与预制拌合场站，配置机巢A01与12航点全覆盖环线。',
  },
  {
    id: 'bridgeA',
    name: '桥梁示例A',
    shortName: '桥梁示例A',
    secId: 'sec2',
    scene: '桥梁专项',
    lon: 125.982,
    lat: 47.452,
    alt: 235,
    gold: false,
    desc: '跨河主线大桥，重点复查2号墩台临边防护与架梁作业安全。',
  },
  {
    id: 'roadbedA',
    name: '路基示例段',
    shortName: '路基示例段',
    secId: 'sec3',
    scene: '路基边坡',
    lon: 125.992,
    lat: 47.652,
    alt: 228,
    gold: false,
    desc: 'K51+400~K54+800 高填方边坡与排水沟防护巡检示范段。',
  },
  {
    id: 'baotongA',
    name: '一工区·保通示例段',
    shortName: '保通示例段',
    secId: 'sec1',
    scene: '施工保通',
    lon: 125.915,
    lat: 47.362,
    alt: 225,
    gold: true,
    desc: 'K16+400~K18+200 施工导改段，重点核查交通导改标志、围挡与通道畅通。',
  },
];

export interface CoverageItem {
  name: string;
  scene: string;
  done: number;
  total: number;
}

export const COVERAGE_ITEMS: CoverageItem[] = [
  { name: '施工保通', scene: '施工保通', done: 6, total: 8 },
  { name: '料场及临时设施', scene: '料场巡检', done: 5, total: 6 },
  { name: '桥梁施工', scene: '桥梁专项', done: 4, total: 6 },
  { name: '路基路面', scene: '路基边坡', done: 3, total: 4 },
];

export const SCENE_OPTIONS = ['全部场景', '料场巡检', '施工保通', '桥梁专项', '路基边坡'] as const;
export const TASK_TYPE_OPTIONS = ['全部类型', '专项', '全面', '应急'] as const;
export const TASK_STATUS_OPTIONS = ['全部状态', '待执行', '执行中', '待整理', '已完成'] as const;
export const CLUE_STATUS_OPTIONS = ['全部状态', '待核查', '已确认隐患', '已标误报', '已关联重复'] as const;
export const REPORT_TYPE_OPTIONS = ['全部类型', '复查报告', '全面巡检报告', '专项巡检报告'] as const;

export interface UavHangarDTO {
  id: string;
  name: string;
  sectionId: string;
  status: string;
  temp: string;
  batterySlot: string;
  lon: number;
  lat: number;
  alt: number;
}

export interface UavFleetDTO {
  id: string;
  name: string;
  model: string;
  sectionId: string;
  hangarName: string;
  status: string;
  battery: number;
  signal: string;
}

export interface UavRouteDTO {
  id: string;
  name: string;
  code: string;
  status: string;
  sectionId: string;
  taskId: string;
  targetName: string;
  hangar: string;
  lengthKm: number;
  icon: string;
  center: [number, number];
  boundary: [number, number][];
  waypoints: UavWaypoint[];
  history: UavRouteHistoryItem[];
  isTemplate: boolean;
}

export interface UavTaskDTO {
  id: string;
  name: string;
  sectionId: string;
  target: string;
  type: string;
  typeFull: string;
  scene: string;
  planTime: string;
  shortTime: string;
  status: string;
  uav: string;
  owner: string;
  routeCode: string;
  hangar: string;
  checks: string[];
  allChecks: string[];
  preflightPassed: boolean;
  stage: number;
  period: string;
}

export interface UavClueDTO {
  id: string;
  title: string;
  sectionId: string;
  location: string;
  scene: string;
  period: string;
  foundTime: string;
  shortTime: string;
  status: string;
  taskId: string;
  waypoint: string;
  imgName: string;
  wpLabel: string;
  category: string;
  rule: string;
  source: string;
  reviewer: string;
  note: string;
  imgSrc: string;
  box: UavClueBox;
  linkedHazard: string;
}

export interface UavReportDTO {
  id: string;
  title: string;
  taskId: string;
  origTaskId: string;
  sectionId: string;
  location: string;
  type: string;
  reportDate: string;
  period: string;
  status: string;
  archiveTime: string;
  mediaSummary: string;
  flightRecCount: number;
  photoCount: number;
  videoCount: number;
  hazardCount: number;
  isRecheck: boolean;
  summary: string;
  hazardId: string;
  hazardDesc: string;
  hazardState: string;
  recheckEvidence: string;
  handleStatus: string;
  origTime: string;
  recheckTime: string;
  timeline: UavTimelineStep[];
}

export interface UavLiveEventDTO {
  id: number;
  taskId: string;
  uavId: string;
  eventTime: string;
  eventType: string;
  text: string;
  detail?: Record<string, unknown> | null;
}

export interface LinkedSafetyOption {
  id: string;
  description: string;
  location: string;
  status: string;
}

export function statusTagClass(status: string): 'ok' | 'warn' | 'info' {
  if (
    status === '已完成' ||
    status === '已归档' ||
    status === '在线' ||
    status === '正常' ||
    status === '飞前检查已通过' ||
    status === '已确认隐患' ||
    status === '已审核' ||
    status === '已销项'
  ) {
    return 'ok';
  }
  if (
    status === '待执行' ||
    status === '待核查' ||
    status === '待复查' ||
    status === '人工接管'
  ) {
    return 'warn';
  }
  return 'info';
}

export function formatSecMMSS(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

export function haversineKm(lon1: number, lat1: number, lon2: number, lat2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export function recomputeRouteLengthKm(waypoints: UavWaypoint[]): number {
  let total = 0;
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    total += haversineKm(a.lon, a.lat, b.lon, b.lat);
  }
  if (waypoints.length > 2) {
    const first = waypoints[0];
    const last = waypoints[waypoints.length - 1];
    total += haversineKm(last.lon, last.lat, first.lon, first.lat);
  }
  return Math.max(0.35, Number(total.toFixed(2)));
}

export function interpolateWaypoints(
  waypoints: UavWaypoint[],
  floatIdx: number
): { lon: number; lat: number; alt: number } {
  if (!waypoints.length) return { lon: 126.115, lat: 47.508, alt: 40 };
  const n = waypoints.length;
  const wrapped = ((floatIdx % n) + n) % n;
  const i0 = Math.floor(wrapped);
  const i1 = (i0 + 1) % n;
  const t = wrapped - i0;
  const a = waypoints[i0];
  const b = waypoints[i1];
  return {
    lon: a.lon + (b.lon - a.lon) * t,
    lat: a.lat + (b.lat - a.lat) * t,
    alt: (a.alt || 40) + ((b.alt || 40) - (a.alt || 40)) * t,
  };
}

export function dateToPeriodLabel(selectedDate: string): string {
  if (selectedDate.startsWith('2026-10')) return '2026年10月';
  if (selectedDate.startsWith('2026-09')) return '2026年09月';
  return '2026年11月';
}
