import type { BadgeTone } from '@/components/ui/StatusBadge';
import type {
  BatchTestItem,
  MaterialBatchCounts,
  ReportHistoryEntry,
} from '@/db/schema/domains/m07';

export type MaterialSubPageId = 'overview' | 'report' | 'yard' | 'inspect';

export interface MaterialYardDTO {
  id: string;
  sectionId: string;
  sectionName: string;
  name: string;
  stake: string;
  gateStake: string;
  camId: string;
  uavId: string;
  waypoint: string;
  labName: string;
  reportCode: string;
  activeVer: string;
  lon: number;
  lat: number;
  sortOrder: number;
}

export interface MaterialInventoryDTO {
  id: string;
  baseId: string;
  period: string;
  sectionId: string;
  sectionName: string;
  yardId: string;
  yardName: string;
  material: string;
  spec: string;
  planQty: number;
  arrivalQty: number;
  physicalQty: number;
  quarantineQty: number;
  usableQty: number;
  gapQty: number;
  status: string;
  batchCounts: MaterialBatchCounts;
  sortOrder: number;
}

export interface MaterialReportDTO {
  code: string;
  sectionId: string;
  sectionName: string;
  yardId: string;
  yardName: string;
  version: string;
  reportDate: string;
  cutoff: string;
  cutoffFull: string;
  uploadTime: string;
  uploadFull: string;
  fieldCheck: string;
  confirmStatus: string;
  fileName: string;
  templateVer: string;
  currentBoardNotice: string;
  history: ReportHistoryEntry[];
  sortOrder: number;
}

export interface MaterialBatchDTO {
  batchId: string;
  sectionId: string;
  sectionName: string;
  yardId: string;
  yardName: string;
  material: string;
  spec: string;
  entryTime: string;
  videoTime: string;
  videoTimeShort: string;
  uavTime: string;
  uavTimeShort: string;
  uavFile: string;
  qty: number;
  status: string;
  reportId: string;
  inspectTime: string;
  inspectTimeShort: string;
  supplier: string;
  plateNo: string;
  quarantineNote: string;
  items: BatchTestItem[];
  sortOrder: number;
}

export interface MaterialFocusAlert {
  id: string;
  sectionId: string;
  material: string;
  title: string;
  sub: string;
  btnText: string;
  kind: 'warn' | 'danger';
  action: 'yard' | 'inspect';
  batchId?: string;
}

export interface MaterialTypeMeta {
  name: string;
  spec: string;
  color: string;
  tests: string[];
}

export const MATERIAL_TYPES: MaterialTypeMeta[] = [
  { name: '碎石', spec: '5–20 mm', color: '#3b82f6', tests: ['颗粒级配', '针片状含量', '含泥量'] },
  { name: '机制砂', spec: '0–4.75 mm', color: '#22d3ee', tests: ['细度模数', '石粉含量', '亚甲蓝MB值'] },
  { name: '水泥', spec: 'P·O 42.5', color: '#2dd4bf', tests: ['凝结时间', '安定性', '28d抗压强度'] },
  { name: '矿粉', spec: 'S95', color: '#facc15', tests: ['比表面积', '活性指数', '流动度比'] },
  { name: '钢筋', spec: 'HRB400', color: '#a78bfa', tests: ['屈服强度', '抗拉强度', '冷弯性能'] },
];

export const MATERIAL_META: Record<string, MaterialTypeMeta> = Object.fromEntries(
  MATERIAL_TYPES.map((m) => [m.name, m])
);

export const MATERIAL_PERIODS = [
  { id: '2026年11月', scale: 1.0, cutoff: '2026-11-26 10:40', sync: '2026-11-26 10:52' },
  { id: '2026年10月', scale: 0.86, cutoff: '2026-10-31 17:30', sync: '2026-10-31 18:00' },
  { id: '2026年09月', scale: 0.72, cutoff: '2026-09-30 17:30', sync: '2026-09-30 18:00' },
];

export const REPORT_DATES = ['2026-11-26', '2026-11-25', '2026-11-24'];

export const DEFAULT_YARDS: MaterialYardDTO[] = [
  {
    id: 'yd-1',
    sectionId: 'sec1',
    sectionName: '一工区',
    name: '材料场A',
    stake: 'K12+600 附近',
    gateStake: 'K12+540',
    camId: 'CAM-YD-A01',
    uavId: 'UAV-20261126-01',
    waypoint: '航点03',
    labName: '一工区实验室',
    reportCode: 'BL-20261126-A1',
    activeVer: 'V1.2',
    lon: 125.885,
    lat: 47.345,
    sortOrder: 1,
  },
  {
    id: 'yd-2',
    sectionId: 'sec2',
    sectionName: '二工区',
    name: '料场示例A',
    stake: 'K28+400 附近',
    gateStake: 'K28+360',
    camId: 'CAM-YD-A03',
    uavId: 'UAV-20261126-02',
    waypoint: '航点07',
    labName: '二工区实验室',
    reportCode: 'BL-20261126-A2',
    activeVer: 'V1.2',
    lon: 125.988,
    lat: 47.465,
    sortOrder: 2,
  },
  {
    id: 'yd-3',
    sectionId: 'sec3',
    sectionName: '三工区',
    name: '料场示例C',
    stake: 'K56+200 附近',
    gateStake: 'K56+150',
    camId: 'CAM-YD-C02',
    uavId: 'UAV-20261126-03',
    waypoint: '航点11',
    labName: '三工区实验室',
    reportCode: 'BL-20261126-A3',
    activeVer: 'V1.0',
    lon: 125.995,
    lat: 47.655,
    sortOrder: 3,
  },
  {
    id: 'yd-4',
    sectionId: 'sec4',
    sectionName: '四工区',
    name: '料场示例B',
    stake: 'K81+500 附近',
    gateStake: 'K81+440',
    camId: 'CAM-YD-B04',
    uavId: 'UAV-20261126-04',
    waypoint: '航点14',
    labName: '四工区实验室',
    reportCode: 'BL-20261126-A4',
    activeVer: 'V1.1',
    lon: 126.135,
    lat: 47.838,
    sortOrder: 4,
  },
  {
    id: 'yd-5',
    sectionId: 'sec5',
    sectionName: '五工区',
    name: '料场示例D',
    stake: 'K106+800 附近',
    gateStake: 'K106+730',
    camId: 'CAM-YD-D01',
    uavId: 'UAV-20261126-05',
    waypoint: '航点18',
    labName: '五工区实验室',
    reportCode: 'BL-20261126-A5',
    activeVer: 'V1.0',
    lon: 126.31,
    lat: 48.01,
    sortOrder: 5,
  },
  {
    id: 'yd-6',
    sectionId: 'sec6',
    sectionName: '六工区',
    name: '料场示例E',
    stake: 'K132+900 附近',
    gateStake: 'K132+850',
    camId: 'CAM-YD-E02',
    uavId: 'UAV-20261126-06',
    waypoint: '航点22',
    labName: '六工区实验室',
    reportCode: 'BL-20261126-A6',
    activeVer: 'V1.0',
    lon: 126.385,
    lat: 48.18,
    sortOrder: 6,
  },
];

export const YARD_BY_SECTION_ID: Record<string, MaterialYardDTO> = Object.fromEntries(
  DEFAULT_YARDS.map((y) => [y.sectionId, y])
);

export const YARD_BY_ID: Record<string, MaterialYardDTO> = Object.fromEntries(
  DEFAULT_YARDS.map((y) => [y.id, y])
);

export function getPeriodObj(periodId: string) {
  return MATERIAL_PERIODS.find((p) => p.id === periodId) ?? MATERIAL_PERIODS[0];
}

export function dateToMaterialPeriod(selectedDate: string): string {
  if (selectedDate.startsWith('2026-10')) return '2026年10月';
  if (selectedDate.startsWith('2026-09')) return '2026年09月';
  return '2026年11月';
}

export function fmtNum(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export function statusTone(status: string): BadgeTone {
  if (
    status === '已合格' ||
    status === '合格' ||
    status === '通过' ||
    status === '已确认' ||
    status === '当前使用'
  ) {
    return 'ok';
  }
  if (status === '部分待检' || status === '待检' || status === '待确认') {
    return 'warn';
  }
  if (status === '复检中') {
    return 'info';
  }
  if (status === '含隔离批次' || status === '不合格') {
    return 'danger';
  }
  return 'muted';
}
