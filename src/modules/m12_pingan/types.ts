import type {
  PinganDeliverablesMap,
  PinganStatItem,
  PinganTelemetryItem,
} from '@/db/schema/domains/m12';

export const STAGE_LIST = [
  '立项',
  '计划与设计',
  '研究执行',
  '成果整理',
  '验收与推广',
] as const;

export const DIRECTION_LIST = [
  '品质提升',
  '工业化建造',
  '智慧提速',
  '绿色低碳',
] as const;

export type PinganStage = (typeof STAGE_LIST)[number];
export type PinganDirection = (typeof DIRECTION_LIST)[number];

export const STAGE_META: Record<
  string,
  { index: number; tagClass: string; color: string }
> = {
  立项: { index: 0, tagClass: 'm12-tag-slate', color: '#38f2ff' },
  计划与设计: { index: 1, tagClass: 'm12-tag-cyan', color: '#38f2ff' },
  研究执行: { index: 2, tagClass: 'm12-tag-amber', color: '#facc15' },
  成果整理: { index: 3, tagClass: 'm12-tag-green', color: '#4ade80' },
  验收与推广: { index: 4, tagClass: 'm12-tag-teal', color: '#38f2ff' },
};

export interface PinganSlideDTO {
  id: string;
  kind: 'image' | 'video';
  title: string;
  subtitle: string;
  topicId: string;
  imgPath: string;
  stake: string;
  durationSec: number;
  durationStr: string;
  telemetry: PinganTelemetryItem[];
  caption: string;
}

export interface PinganFeaturedResultDTO {
  id: string;
  title: string;
  topicLabel: string;
  topicId: string;
  category: string;
  date: string;
  author: string;
  summary: string;
  metrics: string[];
}

export interface PinganOverviewDTO {
  title: string;
  desc: string;
  stats: PinganStatItem[];
}

export interface PinganTopicDTO {
  id: string;
  name: string;
  shortName: string;
  summary: string;
  direction: string;
  stage: string;
  achievements: string;
  note: string;
  sectionId: string;
  deliverables: PinganDeliverablesMap;
  sortOrder: number;
  updatedAt?: string;
}

export interface PinganShowcaseResponse {
  overview: PinganOverviewDTO;
  slides: PinganSlideDTO[];
  featuredResults: PinganFeaturedResultDTO[];
  topics: PinganTopicDTO[];
  totalTopics: number;
  lastUpdated: string;
}

export interface PinganTopicsResponse {
  items: PinganTopicDTO[];
  allTopicsCount: number;
  stageCounts: Record<string, number> & { total: number };
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  lastUpdated: string;
}

export function formatTimeSec(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const mm = String(Math.floor(s / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function formatStamp(dateInput?: Date | string | null): string {
  if (!dateInput) return '2026-11-25 10:45';
  const d = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  if (Number.isNaN(d.getTime())) return '2026-11-25 10:45';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
