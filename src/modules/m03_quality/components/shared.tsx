'use client';

import React from 'react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import type { BadgeTone } from '@/components/ui/StatusBadge';
import type { QualityModalPayload } from '../QualityModal';
import type { QualitySectionMetric, QualitySubPageId } from '../types';

export const PERIOD_FACTORS: Record<
  string,
  { mult: number; label: string; shortMonth: string; passDelta: number }
> = {
  '2026年11月': { mult: 1, label: '2026年11月', shortMonth: '11月', passDelta: 0 },
  '2026年10月': { mult: 0.94, label: '2026年10月', shortMonth: '10月', passDelta: -0.2 },
  '2026年Q4': { mult: 1.94, label: '2026年Q4', shortMonth: 'Q4', passDelta: -0.1 },
  '2026年度': { mult: 6.4, label: '2026年度', shortMonth: '全年', passDelta: -0.3 },
};

export const DEFAULT_SECTIONS: QualitySectionMetric[] = [
  { sectionId: 'sec1', name: '一工区', shortName: '一工区', labName: '一工区实验室', stationShort: '一号站', stationFull: '一号拌合站', yardName: '一号梁场', stakeRange: 'K0+000 ~ K24+500', labBatches: 1468, labPassRate: 98.9, mixVol: 7.6, mixBatches: 508, beams: 112, pavKm: 8.4, pavSegments: 3, issuesCount: 1, qualityRate: 98.9, sortOrder: 1 },
  { sectionId: 'sec2', name: '二工区', shortName: '二工区', labName: '二工区实验室', stationShort: '二号站', stationFull: '二号拌合站', yardName: '二号梁场', stakeRange: 'K24+500 ~ K48+200', labBatches: 1524, labPassRate: 98.4, mixVol: 6.8, mixBatches: 455, beams: 118, pavKm: 7.6, pavSegments: 3, issuesCount: 3, qualityRate: 98.4, sortOrder: 2 },
  { sectionId: 'sec3', name: '三工区', shortName: '三工区', labName: '三工区实验室', stationShort: '三号站', stationFull: '三号拌合站', yardName: '一号梁场', stakeRange: 'K48+200 ~ K72+800', labBatches: 1384, labPassRate: 98.7, mixVol: 6.2, mixBatches: 414, beams: 106, pavKm: 7.2, pavSegments: 3, issuesCount: 2, qualityRate: 98.7, sortOrder: 3 },
  { sectionId: 'sec4', name: '四工区', shortName: '四工区', labName: '四工区实验室', stationShort: '四号站', stationFull: '四号拌合站', yardName: '二号梁场', stakeRange: 'K72+800 ~ K96+000', labBatches: 1327, labPassRate: 98.6, mixVol: 5.9, mixBatches: 394, beams: 102, pavKm: 6.8, pavSegments: 3, issuesCount: 3, qualityRate: 98.6, sortOrder: 4 },
  { sectionId: 'sec5', name: '五工区', shortName: '五工区', labName: '五工区实验室', stationShort: '五号站', stationFull: '五号拌合站', yardName: '一号梁场', stakeRange: 'K96+000 ~ K121+400', labBatches: 1468, labPassRate: 98.8, mixVol: 5.4, mixBatches: 361, beams: 104, pavKm: 6.6, pavSegments: 3, issuesCount: 2, qualityRate: 98.8, sortOrder: 5 },
  { sectionId: 'sec6', name: '六工区', shortName: '六工区', labName: '六工区实验室', stationShort: '六号站', stationFull: '六号拌合站', yardName: '二号梁场', stakeRange: 'K121+400 ~ K146+800', labBatches: 1265, labPassRate: 99.0, mixVol: 4.9, mixBatches: 328, beams: 98, pavKm: 6.0, pavSegments: 3, issuesCount: 1, qualityRate: 99.0, sortOrder: 6 },
];

export const BeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M3 7h18v3H3z" />
    <path d="M6 10v9M18 10v9M3 13h18" />
  </svg>
);

export const RoadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2" />
  </svg>
);

export function fmtInt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

export function periodForDate(selectedDate: string): string {
  if (selectedDate === '2026-10-31') return '2026年10月';
  if (selectedDate === '2026-09-25') return '2026年Q4';
  return '2026年11月';
}

export function PaginationBar({
  totalItems,
  currentPage,
  pageSize,
  onPageChange,
}: {
  totalItems: number;
  currentPage: number;
  pageSize: number;
  onPageChange: (nextPage: number) => void;
}) {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const safePage = Math.max(1, Math.min(totalPages, currentPage));
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <div className="m03-pagination">
      <span>共 {fmtInt(totalItems)} 条记录</span>
      <button
        type="button"
        className="m03-page-btn"
        disabled={safePage <= 1}
        onClick={() => onPageChange(safePage - 1)}
      >
        &lt;
      </button>
      {pages.map((p) => (
        <button
          key={p}
          type="button"
          className={`m03-page-btn ${p === safePage ? 'active' : ''}`}
          onClick={() => onPageChange(p)}
        >
          {p}
        </button>
      ))}
      <button
        type="button"
        className="m03-page-btn"
        disabled={safePage >= totalPages}
        onClick={() => onPageChange(safePage + 1)}
      >
        &gt;
      </button>
    </div>
  );
}

export interface KpiItem {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  tone?: 'green' | 'gold' | 'blue';
}

export function M03KpiSection({
  title,
  periodLabel,
  cards,
}: {
  title: string;
  periodLabel: string;
  cards: KpiItem[];
}) {
  return (
    <GlassPanel title={title} subtitle={`(${periodLabel})`} bodyClassName="m03-panel-body-flush">
      <div className="m03-kpi-grid">
        {cards.map((c) => (
          <div key={c.label} className="m03-kpi-card">
            <div className={`m03-kpi-icon ${c.tone ? `tone-${c.tone}` : ''}`}>{c.icon}</div>
            <div className="m03-kpi-meta">
              <div className="m03-kpi-label">{c.label}</div>
              <div className="m03-kpi-val-row">
                <span className={`m03-kpi-val ${c.tone ? `tone-${c.tone}` : ''}`}>{c.value}</span>
                <span className="m03-kpi-unit">{c.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
}

export function beamBadgeTone(val: string): BadgeTone {
  if (val === '合格' || val === '已完成') return 'ok';
  if (val === '待复检') return 'warn';
  if (val === '养护中' || val === '压浆中') return 'info';
  return 'muted';
}

export function openGatewayModalPayload(activeSub: QualitySubPageId | string): QualityModalPayload {
  const map: Record<string, [string, string]> = {
    lab: [
      '智慧工地试验室 LIMS 系统',
      '已接入全线 6 座工地试验室万能机、压力机、沥青针入度仪与马歇尔自动采集终端，支持曲线溯源与电子签章。',
    ],
    mixing: [
      '混凝土及水稳拌合站智能监控系统',
      '实时对接全线 6 座拌合站 PLC 称量模块，按盘采集骨料/胶凝材料偏差与出料温度。',
    ],
    pavement: [
      '路面摊铺碾压北斗智能质控系统',
      '实时回传摊铺机红外测温阵列与双钢轮/胶轮压路机北斗高精度碾压遍数轨迹。',
    ],
    beamYard: [
      '智慧梁场工业互联网管控平台',
      '对接 1 号、2 号智慧梁场移动台座、智能喷淋养生、双控张拉与真空压浆物联网端机。',
    ],
  };
  const [sysName, subDesc] = map[activeSub] ?? ['质量业务原系统', '实时数据同步链路在线。'];
  return { kind: 'gateway', sysName, subDesc };
}

export interface QualitySubPageProps {
  activeSectionId: string | null;
  selectedDate: string;
  period: string;
  sections: QualitySectionMetric[];
  refreshKey: number;
  onSectionSelect: (nextId: string) => void;
  onBarToggle: (secId: string) => void;
  onPeriodChange: (nextPeriod: string) => void;
  onSectionsLoaded: (nextSections: QualitySectionMetric[]) => void;
  onOpenModal: (payload: QualityModalPayload) => void;
  onResetGlobalSection: () => void;
  showToast: (msg: string) => void;
}
