export interface SectionMetaItem {
  id: string;
  name: string;
  stake: string;
  unit: string;
}

export const SECTION_META: SectionMetaItem[] = [
  { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500', unit: '一工区施工单位' },
  { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200', unit: '二工区施工单位' },
  { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800', unit: '三工区施工单位' },
  { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000', unit: '四工区施工单位' },
  { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400', unit: '五工区施工单位' },
  { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800', unit: '六工区施工单位' },
];

export const SECTION_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  SECTION_META.map((s) => [s.id, s.name])
);

export const SECTION_UNIT_BY_ID: Record<string, string> = Object.fromEntries(
  SECTION_META.map((s) => [s.id, s.unit])
);

export const RISK_CATEGORIES = [
  '高处作业',
  '起重吊装',
  '临边防护',
  '临时用电',
  '场内运输',
  '施工保通',
] as const;

export const AI_ALGORITHMS = [
  '安全帽佩戴识别',
  '人员闯入识别',
  '反光衣穿戴识别',
  '烟雾明火识别',
  '临边越界识别',
] as const;

export const PERIOD_OPTIONS = [
  { value: '2026-11', label: '2026年11月' },
  { value: '2026-10', label: '2026年10月' },
  { value: '2026-09', label: '2026年09月' },
] as const;

export const IMG_PATHS: Record<string, string> = {
  corridor: '/assets/corridor_aerial.jpg',
  before: '/assets/milestone_before.jpg',
  after: '/assets/milestone_after.jpg',
  showcase: '/assets/showcase_viaduct.jpg',
};

export interface SafetyRiskPointDTO {
  id: string;
  name: string;
  sectionId: string;
  category: string;
  level: string;
  location: string;
  unit: string;
  mapX: number;
  mapY: number;
  lon: number;
  lat: number;
  status: string;
  measures: string[];
  linkedHazardId: string;
  imgKey: string;
  camCode: string;
  sortOrder: number;
}

export interface SafetyHazardDTO {
  id: string;
  period: string;
  sectionId: string;
  location: string;
  source: string;
  category: string;
  description: string;
  level: string;
  dueDate: string;
  dueFull: string;
  status: string;
  overdue: boolean;
  foundAt: string;
  dispatchedAt: string;
  feedbackAt: string;
  owner: string;
  req: string;
  beforeNote: string;
  afterNote: string;
  reviewer: string;
  reviewTime: string;
  reviewNote: string;
  attachment: string;
}

export interface SafetyAiAlertDTO {
  id: string;
  period: string;
  alertTime: string;
  shortTime: string;
  timeWindow: string;
  sectionId: string;
  location: string;
  shortLoc: string;
  camera: string;
  algorithm: string;
  event: string;
  status: string;
  imgKey: string;
  box: { left: number; top: number; width: number; height: number };
  frames: string[];
  note: string;
  linkedHazardId: string;
}

export interface SafetyExternalRecordDTO {
  extId: string;
  sectionId: string;
  location: string;
  origin: string;
  description: string;
  linkedHazardId: string;
  syncTime: string;
  status: string;
}

export interface SafetyActivityDTO {
  id: number;
  title: string;
  timeLabel: string;
  code: string;
  status: string;
  tagClass: string;
  sectionId: string;
  icon: string;
}

export interface HazardStatsDTO {
  total: number;
  pendingDispatch: number;
  rectifying: number;
  pendingReview: number;
  closed: number;
  overdue: number;
  unclosed: number;
  srcManual: number;
  srcAi: number;
  srcUav: number;
  secUnclosed: { id: string; name: string; val: number }[];
}

export function secName(secId: string): string {
  return SECTION_NAME_BY_ID[secId] ?? secId;
}

export function secUnit(secId: string): string {
  return SECTION_UNIT_BY_ID[secId] ?? '施工单位';
}

export function periodLabel(period: string): string {
  if (period === '2026-10') return '2026年10月';
  if (period === '2026-09') return '2026年09月';
  return '2026年11月';
}

export function dateToPeriod(dateStr: string): string {
  if (dateStr.startsWith('2026-10')) return '2026-10';
  if (dateStr.startsWith('2026-09')) return '2026-09';
  return '2026-11';
}

export function getHazardStatusMeta(h: { status: string; overdue: boolean }): {
  label: string;
  cls: string;
  action: string;
} {
  if (h.status === '已销项') {
    return { label: '已销项', cls: 'm04-tag-green', action: '查看' };
  }
  if (h.status === '待复查') {
    return { label: '待复查', cls: 'm04-tag-amber', action: '复查' };
  }
  if (h.status === '整改中' && h.overdue) {
    return { label: '整改中·超期', cls: 'm04-tag-red', action: '催办' };
  }
  if (h.status === '整改中') {
    return { label: '整改中', cls: 'm04-tag-blue', action: '催办' };
  }
  return { label: '待派发', cls: 'm04-tag-amber', action: '派发' };
}

export function getRiskLevelTag(level: string): { label: string; cls: string; textCls: string } {
  if (level === '重大') return { label: '重大', cls: 'm04-tag-red', textCls: 'm04-c-red' };
  if (level === '较大') return { label: '较大', cls: 'm04-tag-amber', textCls: 'm04-c-gold' };
  if (level === '一般') return { label: '一般', cls: 'm04-tag-blue', textCls: 'm04-c-blue' };
  return { label: '低风险', cls: 'm04-tag-green', textCls: 'm04-c-green' };
}

export function getAiStatusTag(status: string): string {
  if (status === '待核实') return 'm04-tag-amber';
  if (status === '已确认') return 'm04-tag-green';
  if (status === '已标误报') return 'm04-tag-blue';
  return 'm04-tag-blue';
}

export function computeHazardStats(hazards: SafetyHazardDTO[]): HazardStatsDTO {
  const pendingDispatch = hazards.filter((h) => h.status === '待派发').length;
  const rectifying = hazards.filter((h) => h.status === '整改中').length;
  const pendingReview = hazards.filter((h) => h.status === '待复查').length;
  const closed = hazards.filter((h) => h.status === '已销项').length;
  const overdue = hazards.filter((h) => h.overdue && h.status !== '已销项').length;
  const unclosed = hazards.filter((h) => h.status !== '已销项').length;
  const srcManual = hazards.filter((h) => h.source === '人工巡查').length;
  const srcAi = hazards.filter((h) => h.source === '视频AI').length;
  const srcUav = hazards.filter((h) => h.source === '无人机巡检').length;

  const secUnclosed = SECTION_META.map((s) => ({
    id: s.id,
    name: s.name,
    val: hazards.filter((h) => h.sectionId === s.id && h.status !== '已销项').length,
  }));

  return {
    total: hazards.length,
    pendingDispatch,
    rectifying,
    pendingReview,
    closed,
    overdue,
    unclosed,
    srcManual,
    srcAi,
    srcUav,
    secUnclosed,
  };
}
