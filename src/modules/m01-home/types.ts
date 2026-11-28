import type { ModalBlock } from '@/lib/store/platform-store';

export interface ApiSection {
  id: string;
  name: string;
  stakeRange: string;
  sectionsCount: number;
  keyWorksCount: number;
  yardsCount: number;
  progressMetrics: number[];
  qualityMetrics: number[];
  safetyMetrics: number[];
}

export interface ApiPoi {
  id: string;
  name: string;
  type: string;
  sectionId: string;
  sectionName: string;
  stage: string;
  stake: string;
  cameraName: string;
  icon: string;
  imgPath: string;
  duration: string;
  elapsedSec: number;
  photosCount: number;
  videosCount: number;
  inspectionsCount: number;
  metrics: { length: string; progress: string; beamsDone: string; supervisor: string };
  docs: Array<{ name: string; type: string; date: string; size: string }>;
}

export interface ApiFocusRow {
  id: number;
  category: string;
  categoryTitle: string;
  summaryPrefix: string;
  unit: string;
  icon: string;
  title: string;
  sectionName: string;
  dueDate: string;
  status: string;
  statusTone: string;
}

export interface ApiMilestone {
  id: string;
  milestoneDate: string;
  title: string;
  description: string;
  imgMode: string;
  cssFilter: string;
  photosCount: number;
  videosCount: number;
  logsCount: number;
}

export interface ApiTopic {
  id: string;
  title: string;
  subtitle: string;
  videoTitle: string;
  durationSec: number;
  durationStr: string;
  icon: string;
  imgPath: string;
  kpis: Array<{ label: string; val: string }>;
  chapters: string[];
  summaries: Array<{ title: string; desc: string }>;
}

export interface FocusGroup {
  id: string;
  title: string;
  summaryPrefix: string;
  unit: string;
  icon: string;
  records: ApiFocusRow[];
}

export function fmtTime(sec: number): string {
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

export function buildPoiDetailBlocks(poi: ApiPoi): ModalBlock[] {
  return [
    {
      type: 'stats',
      items: [
        { label: '所属工区 / 桩号', value: `${poi.sectionName} · ${poi.stake}` },
        { label: '工程形象进度', value: poi.metrics.progress },
        { label: '规模 / 完成量', value: poi.metrics.beamsDone },
      ],
    },
    {
      type: 'kvTable',
      rows: [
        {
          cells: [
            { label: '工程名称', value: poi.name },
            { label: '工程类型', value: poi.type },
          ],
        },
        {
          cells: [
            { label: '当前施工阶段', value: poi.stage, tone: 'info' },
            { label: '现场负责人', value: poi.metrics.supervisor },
          ],
        },
        {
          cells: [
            { label: '关联影像资料', value: `照片 ${poi.photosCount} 张 / 视频 ${poi.videosCount} 条` },
            { label: '累计巡检记录', value: `${poi.inspectionsCount} 条（正常）` },
          ],
        },
      ],
    },
  ];
}

export function buildPoiDocsBlocks(poi: ApiPoi): ModalBlock[] {
  return [
    {
      type: 'dataTable',
      headers: ['文件名称', '资料分类', '归档日期', '大小', '操作'],
      rows: poi.docs.map((d, idx) => ({
        id: `${d.name}_${idx}`,
        cells: [
          { text: d.name },
          { badge: { text: d.type, tone: 'info' } },
          { text: d.date },
          { text: d.size },
          { action: { label: '预览', previewDocName: d.name } },
        ],
      })),
    },
  ];
}
