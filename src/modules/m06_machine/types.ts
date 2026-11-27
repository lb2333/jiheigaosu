import type { BadgeTone } from '@/components/ui/StatusBadge';

export const BASE_DATE = '2026-11-26';
export const BASE_DATE_MS = Date.parse('2026-11-26T00:00:00Z');
export const DAY_MS = 86_400_000;

export interface SectionMeta {
  id: string;
  name: string;
  unit: string;
  stake: string;
  yard: string;
  bridge: string;
  road: string;
  lon: number;
  lat: number;
}

export const SECTIONS: SectionMeta[] = [
  {
    id: 'sec1',
    name: '一工区',
    unit: '一工区施工单位',
    stake: 'K0+000 ~ K24+500',
    yard: '一工区材料场',
    bridge: 'K12+600 跨线桥',
    road: 'K08+120 路基段',
    lon: 125.915,
    lat: 47.362,
  },
  {
    id: 'sec2',
    name: '二工区',
    unit: '二工区施工单位',
    stake: 'K24+500 ~ K48+200',
    yard: '二号梁场',
    bridge: '二工区 · 桥梁示例A',
    road: 'K28+400 路基段',
    lon: 125.982,
    lat: 47.452,
  },
  {
    id: 'sec3',
    name: '三工区',
    unit: '三工区施工单位',
    stake: 'K48+200 ~ K72+800',
    yard: '三工区 · 一号梁场',
    bridge: 'K56+300 大桥',
    road: 'K62+100 水稳段',
    lon: 125.992,
    lat: 47.652,
  },
  {
    id: 'sec4',
    name: '四工区',
    unit: '四工区施工单位',
    stake: 'K72+800 ~ K96+000',
    yard: '四工区 · 二号梁场',
    bridge: '跨河中桥 3#墩',
    road: 'K84+500 路面段',
    lon: 126.135,
    lat: 47.838,
  },
  {
    id: 'sec5',
    name: '五工区',
    unit: '五工区施工单位',
    stake: 'K96+000 ~ K121+400',
    yard: '五工区预制场',
    bridge: 'K104+200 枢纽桥',
    road: 'K110+600 路基段',
    lon: 126.298,
    lat: 47.985,
  },
  {
    id: 'sec6',
    name: '六工区',
    unit: '六工区施工单位',
    stake: 'K121+400 ~ K146+800',
    yard: '六工区拌合站区',
    bridge: '建华枢纽互通桥',
    road: 'K135+400 沥青段',
    lon: 126.392,
    lat: 48.195,
  },
];

export const SECTION_BY_ID: Record<string, SectionMeta> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
);

export const EQUIP_TYPES = [
  { name: '土石方设备', prefix: 'TS', color: '#38f2ff' },
  { name: '路面设备', prefix: 'LM', color: '#22d3ee' },
  { name: '起重设备', prefix: 'QZ', color: '#38bdf8' },
  { name: '运输及其他', prefix: 'YS', color: '#0ea5e9' },
  { name: '架桥机', prefix: 'JQ', color: '#60a5fa' },
] as const;

export const KEY_EQUIP_TYPES = ['起重设备', '架桥机'] as const;
export const CERT_STATUS_OPTIONS = ['正常有效', '即将到期', '已到期', '待补资料'] as const;
export const PATROL_STATUS_OPTIONS = ['记录正常', '已处理', '已归档'] as const;

export type CertStatus = (typeof CERT_STATUS_OPTIONS)[number];
export type ReminderDateField = 'validUntil' | 'installValidUntil';

export interface ReminderConfigDTO {
  id: string;
  dateField: ReminderDateField;
  remindDays: number;
  notifySystem: boolean;
  notifySms: boolean;
  autoBlockExpired: boolean;
  updatedBy: string;
}

export const DEFAULT_REMINDER_CONFIG: ReminderConfigDTO = {
  id: 'default',
  dateField: 'validUntil',
  remindDays: 30,
  notifySystem: true,
  notifySms: false,
  autoBlockExpired: true,
  updatedBy: 'system',
};

export interface CertMeta {
  status: CertStatus;
  badgeTone: BadgeTone;
  tagCls: 'ok' | 'warn' | 'fail' | 'info';
  tone: 'green' | 'gold' | 'red' | 'cyan';
  remindText: string;
  remindColor: string;
  diffDays: number | null;
  displayDate: string;
}

export function getCertMeta(
  rec: {
    validUntil: string;
    installValidUntil: string;
    missingDocs: boolean;
  },
  cfg: Pick<ReminderConfigDTO, 'dateField' | 'remindDays'> = DEFAULT_REMINDER_CONFIG
): CertMeta {
  const dateVal = cfg.dateField === 'installValidUntil' ? rec.installValidUntil : rec.validUntil;
  if (rec.missingDocs || !dateVal || dateVal === '—') {
    return {
      status: '待补资料',
      badgeTone: 'info',
      tagCls: 'info',
      tone: 'cyan',
      remindText: '待补全检验报告',
      remindColor: '#38f2ff',
      diffDays: null,
      displayDate: '—',
    };
  }
  const targetMs = Date.parse(`${dateVal}T00:00:00Z`);
  if (!Number.isFinite(targetMs)) {
    return {
      status: '待补资料',
      badgeTone: 'info',
      tagCls: 'info',
      tone: 'cyan',
      remindText: '待补全检验报告',
      remindColor: '#38f2ff',
      diffDays: null,
      displayDate: '—',
    };
  }
  const diffDays = Math.round((targetMs - BASE_DATE_MS) / DAY_MS);
  if (diffDays < 0) {
    return {
      status: '已到期',
      badgeTone: 'danger',
      tagCls: 'fail',
      tone: 'red',
      remindText: `已超期 ${Math.abs(diffDays)} 天`,
      remindColor: '#f87171',
      diffDays,
      displayDate: dateVal,
    };
  }
  if (diffDays <= Number(cfg.remindDays || 30)) {
    return {
      status: '即将到期',
      badgeTone: 'warn',
      tagCls: 'warn',
      tone: 'gold',
      remindText: `${diffDays} 天后到期`,
      remindColor: '#facc15',
      diffDays,
      displayDate: dateVal,
    };
  }
  return {
    status: '正常有效',
    badgeTone: 'ok',
    tagCls: 'ok',
    tone: 'green',
    remindText: `正常有效（余 ${diffDays} 天）`,
    remindColor: '#4ade80',
    diffDays,
    displayDate: dateVal,
  };
}

export interface PatrolLogDTO {
  id: string;
  equipmentCode: string;
  patrolTime: string;
  content: string;
  status: string;
  inspector: string;
  detail: string;
}

export interface EquipmentDTO {
  code: string;
  name: string;
  type: string;
  sectionId: string;
  sectionName: string;
  unit: string;
  entryStatus: string;
  useStatus: string;
  isKey: boolean;
  model: string;
  spec: string;
  manufacturer: string;
  entryDate: string;
  exitDate: string;
  location: string;
  operator: string;
  sortOrder: number;
  archiveId?: string;
  certMeta?: CertMeta | null;
}

export interface KeyArchiveDTO extends EquipmentDTO {
  archiveId: string;
  keyOrder: number;
  inspectNo: string;
  inspectDate: string;
  validUntil: string;
  installValidUntil: string;
  missingDocs: boolean;
  certMeta: CertMeta;
  patrolLogs: PatrolLogDTO[];
}

export interface EquipmentKpis {
  total: number;
  onSite: number;
  inUse: number;
  standby: number;
  stopped: number;
  exited: number;
}

export interface KeyArchiveKpis {
  total: number;
  valid: number;
  soon: number;
  expired: number;
  missing: number;
  patrolTotal: number;
}

export interface MachineMarkerDTO {
  code: string;
  name: string;
  sectionId: string;
  sectionName: string;
  type: string;
  useStatus: string;
  location: string;
  lon: number;
  lat: number;
}

export interface EquipmentListResponse {
  kpis: EquipmentKpis;
  distributions: {
    byType: Array<{ name: string; count: number }>;
    bySection: Array<{ id: string; name: string; count: number }>;
    typeTotal: number;
    sectionTotal: number;
  };
  items: EquipmentDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  representativeMarkers: MachineMarkerDTO[];
}

export interface KeyArchiveListResponse {
  kpis: KeyArchiveKpis;
  items: KeyArchiveDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  reminderConfig: ReminderConfigDTO;
}
