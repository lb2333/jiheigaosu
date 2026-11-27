import type { PlaybackSegmentMeta } from '@/db/schema/domains/m10';
import type { BadgeTone } from '@/components/ui/StatusBadge';

export const SECTIONS = [
  { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
  { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
  { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
  { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
  { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
  { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' },
] as const;

export const SECTION_BY_ID: Record<string, (typeof SECTIONS)[number]> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s])
);
export const SECTION_BY_NAME: Record<string, (typeof SECTIONS)[number]> = Object.fromEntries(
  SECTIONS.map((s) => [s.name, s])
);

export const SITE_TYPES = ['料场', '梁场', '保通段', '桥梁', '拌合站', '路基边坡'] as const;
export const PURPOSE_TYPES = [
  '消防通道巡查',
  '出入口巡查',
  '梁场作业巡查',
  '施工保通',
  '临边防护巡查',
  '场内交通巡查',
  '路基边坡监测',
] as const;
export const STATUS_TYPES = ['在线', '图像异常', '离线'] as const;

export const PLAYBACK_DATES = ['2026-11-26', '2026-11-25', '2026-11-24'] as const;
export const PLAYBACK_RANGES = ['09:00–10:00', '10:00–11:00', '08:00–09:00'] as const;
export const PLAYBACK_SPEEDS = [0.5, 1, 2, 4] as const;
export const PATROL_INTERVALS = [15, 30, 60] as const;

export interface VideoCameraDTO {
  id: string;
  sectionId: string;
  sectionName: string;
  name: string;
  stake: string;
  location: string;
  siteType: string;
  purpose: string;
  status: string;
  sceneType: string;
  lastTime: string;
  source: string;
  resolution: string;
  ip: string;
  faultNote: string;
  sortOrder: number;
}

export interface VideoDirectoryKpis {
  total: number;
  online: number;
  offline: number;
  abnormal: number;
  sections: number;
}

export interface VideoPatrolGroupDTO {
  id: string;
  name: string;
  builtIn: boolean;
  cameraIds: string[];
  sortOrder: number;
}

export interface VideoPlaybackAlarmDTO {
  id: string;
  cameraId: string;
  recordDate: string;
  timeRange: string;
  title: string;
  status: string;
  alarmTime: string;
  alarmClipIdx: number;
  alarmSecInClip: number;
  clipWindow: string;
  hazardId: string;
  note: string;
  safetyDetail: string;
  segments: PlaybackSegmentMeta[];
}

export interface VideoEvidenceCaptureDTO {
  id: number;
  cameraId: string;
  recordDate: string;
  capturedAt: string;
  clipLabel: string;
  note: string;
  capturedBy: string;
}

export interface VideoAirGroundPairDTO {
  id: string;
  sectionId: string;
  sectionName: string;
  siteName: string;
  partName: string;
  evidenceDate: string;
  matched: boolean;
  camId: string;
  camLabel: string;
  camStake: string;
  camTime: string;
  camTag: string;
  uavTaskId: string;
  uavTaskName: string;
  uavFile: string;
  uavTime: string;
  uavPart: string;
  timeDiffSec: number;
  hazardTitle: string;
  hazardId: string;
  alarmId: string;
  summary: string;
  sceneType: string;
  recheckSent: boolean;
  recheckTime: string;
}

export interface VideoAirGroundReviewDTO {
  id: number;
  pairId: string;
  hazardId: string;
  camId: string;
  uavRoute: string;
  instruction: string;
  submittedBy: string;
  status: string;
  recheckTime: string;
}

export function pad2(n: number): string {
  return String(Math.floor(n)).padStart(2, '0');
}

export function formatHms(totalSec: number): string {
  const s = ((Math.floor(totalSec) % 86400) + 86400) % 86400;
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;
  return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
}

export function formatMmSs(sec: number): string {
  const clamped = Math.max(0, Math.min(900, Math.floor(sec)));
  return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
}

export function getRangeStartHour(rangeStr: string): number {
  const m = /^(\d{2}):/.exec(rangeStr || '09:00–10:00');
  return m ? Number.parseInt(m[1], 10) : 9;
}

export function getClipLabel(rangeStr: string, idx: number): string {
  const startH = getRangeStartHour(rangeStr);
  const m0 = idx * 15;
  const m1 = (idx + 1) * 15;
  const hEnd = m1 === 60 ? startH + 1 : startH;
  const mEnd = m1 === 60 ? 0 : m1;
  return `${pad2(startH)}:${pad2(m0)}:00 – ${pad2(hEnd)}:${pad2(mEnd)}:00`;
}

export function getPlaybackClockStr(date: string, range: string, clipIdx: number, secInClip: number): string {
  const startH = getRangeStartHour(range);
  const absSec = startH * 3600 + clipIdx * 900 + Math.floor(secInClip);
  return `${date} ${formatHms(absSec)}`;
}

export function statusToBadgeTone(status: string): BadgeTone {
  if (status === '在线') return 'ok';
  if (status === '图像异常') return 'warn';
  return 'muted';
}

export function statusToTagClass(status: string): string {
  if (status === '在线') return 'ok';
  if (status === '图像异常') return 'warn';
  return 'muted';
}

export function buildPlaybackSegments(rangeStr: string, alarmClipIdx = 1): PlaybackSegmentMeta[] {
  return [0, 1, 2, 3].map((idx) => {
    const fullLabel = getClipLabel(rangeStr, idx);
    return {
      idx,
      label: fullLabel.replace(/(\d{2}:\d{2}):00/g, '$1'),
      fullLabel,
      durationMin: 15,
      hasAlarm: idx === alarmClipIdx,
    };
  });
}

export function buildFallbackPlaybackAlarm(
  cam: Pick<VideoCameraDTO, 'id' | 'name' | 'sectionName' | 'stake' | 'purpose'>,
  date: string,
  range: string
): VideoPlaybackAlarmDTO {
  const startH = getRangeStartHour(range);
  const hh = pad2(startH);
  return {
    id: `VAI-${date.replace(/-/g, '')}-${cam.id.slice(-3)}`,
    cameraId: cam.id,
    recordDate: date,
    timeRange: range,
    title: `${cam.purpose}智能预警`,
    status: '已关联',
    alarmTime: `${date} ${hh}:27:32`,
    alarmClipIdx: 1,
    alarmSecInClip: 752,
    clipWindow: `${hh}:27:00 – ${hh}:28:00`,
    hazardId: 'AQ-202611-041',
    note: '处理记录来自安全管理。',
    safetyDetail: `${cam.sectionName} ${cam.name}（${cam.stake}）视频智能识别触发复核提醒，安全管理员已完成现场核实。`,
    segments: buildPlaybackSegments(range, 1),
  };
}
