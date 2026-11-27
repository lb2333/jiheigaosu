'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  Clock,
  ExternalLink,
  FileText,
  FlaskConical,
  Gauge,
  Layers,
  Plus,
  RotateCcw,
  Ruler,
  Search,
  ShieldCheck,
  Thermometer,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import { BarChartSvg, DonutChartSvg, RingGaugeSvg, TrendLineSvg } from './QualityCharts';
import { QualityModal, type QualityModalPayload } from './QualityModal';
import type {
  QualityBeamRecord,
  QualityInspectionRecord,
  QualityIssueRecord,
  QualityLabRecord,
  QualityMixingRecord,
  QualityPavementRecord,
  QualitySectionMetric,
  QualitySubPageId,
} from './types';
import './m03.css';

const PERIOD_FACTORS: Record<
  string,
  { mult: number; label: string; shortMonth: string; passDelta: number }
> = {
  '2026年11月': { mult: 1, label: '2026年11月', shortMonth: '11月', passDelta: 0 },
  '2026年10月': { mult: 0.94, label: '2026年10月', shortMonth: '10月', passDelta: -0.2 },
  '2026年Q4': { mult: 1.94, label: '2026年Q4', shortMonth: 'Q4', passDelta: -0.1 },
  '2026年度': { mult: 6.4, label: '2026年度', shortMonth: '全年', passDelta: -0.3 },
};

const DEFAULT_SECTIONS: QualitySectionMetric[] = [
  { sectionId: 'sec1', name: '一工区', shortName: '一工区', labName: '一工区实验室', stationShort: '一号站', stationFull: '一号拌合站', yardName: '一号梁场', stakeRange: 'K0+000 ~ K24+500', labBatches: 1468, labPassRate: 98.9, mixVol: 7.6, mixBatches: 508, beams: 112, pavKm: 8.4, pavSegments: 3, issuesCount: 1, qualityRate: 98.9, sortOrder: 1 },
  { sectionId: 'sec2', name: '二工区', shortName: '二工区', labName: '二工区实验室', stationShort: '二号站', stationFull: '二号拌合站', yardName: '二号梁场', stakeRange: 'K24+500 ~ K48+200', labBatches: 1524, labPassRate: 98.4, mixVol: 6.8, mixBatches: 455, beams: 118, pavKm: 7.6, pavSegments: 3, issuesCount: 3, qualityRate: 98.4, sortOrder: 2 },
  { sectionId: 'sec3', name: '三工区', shortName: '三工区', labName: '三工区实验室', stationShort: '三号站', stationFull: '三号拌合站', yardName: '一号梁场', stakeRange: 'K48+200 ~ K72+800', labBatches: 1384, labPassRate: 98.7, mixVol: 6.2, mixBatches: 414, beams: 106, pavKm: 7.2, pavSegments: 3, issuesCount: 2, qualityRate: 98.7, sortOrder: 3 },
  { sectionId: 'sec4', name: '四工区', shortName: '四工区', labName: '四工区实验室', stationShort: '四号站', stationFull: '四号拌合站', yardName: '二号梁场', stakeRange: 'K72+800 ~ K96+000', labBatches: 1327, labPassRate: 98.6, mixVol: 5.9, mixBatches: 394, beams: 102, pavKm: 6.8, pavSegments: 3, issuesCount: 3, qualityRate: 98.6, sortOrder: 4 },
  { sectionId: 'sec5', name: '五工区', shortName: '五工区', labName: '五工区实验室', stationShort: '五号站', stationFull: '五号拌合站', yardName: '一号梁场', stakeRange: 'K96+000 ~ K121+400', labBatches: 1468, labPassRate: 98.8, mixVol: 5.4, mixBatches: 361, beams: 104, pavKm: 6.6, pavSegments: 3, issuesCount: 2, qualityRate: 98.8, sortOrder: 5 },
  { sectionId: 'sec6', name: '六工区', shortName: '六工区', labName: '六工区实验室', stationShort: '六号站', stationFull: '六号拌合站', yardName: '二号梁场', stakeRange: 'K121+400 ~ K146+800', labBatches: 1265, labPassRate: 99.0, mixVol: 4.9, mixBatches: 328, beams: 98, pavKm: 6.0, pavSegments: 3, issuesCount: 1, qualityRate: 99.0, sortOrder: 6 },
];

const BeamIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M3 7h18v3H3z" />
    <path d="M6 10v9M18 10v9M3 13h18" />
  </svg>
);

const RoadIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9">
    <path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2" />
  </svg>
);

function fmtInt(n: number) {
  return Math.round(n).toLocaleString('en-US');
}

function periodForDate(selectedDate: string): string {
  if (selectedDate === '2026-10-31') return '2026年10月';
  if (selectedDate === '2026-09-25') return '2026年Q4';
  return '2026年11月';
}

function PaginationBar({
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

interface KpiItem {
  label: string;
  value: string;
  unit: string;
  icon: React.ReactNode;
  tone?: 'green' | 'gold' | 'blue';
}

function M03KpiSection({
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

function beamBadgeTone(val: string): BadgeTone {
  if (val === '合格' || val === '已完成') return 'ok';
  if (val === '待复检') return 'warn';
  if (val === '养护中' || val === '压浆中') return 'info';
  return 'muted';
}

export function QualityModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSub: QualitySubPageId = (
    ['overview', 'lab', 'mixing', 'pavement', 'beamYard', 'issues'].includes(subPageId)
      ? subPageId
      : 'overview'
  ) as QualitySubPageId;

  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode, activeSub]);

  // Subpage filters & pagination
  const [period, setPeriod] = useState<string>(() => periodForDate(selectedDate));
  const [page, setPage] = useState(1);

  const [ovCategory, setOvCategory] = useState('');
  const [ovQuick, setOvQuick] = useState('全部');

  const [labName, setLabName] = useState('');
  const [labCategory, setLabCategory] = useState('');
  const [labQuick, setLabQuick] = useState('全部');

  const [mixStation, setMixStation] = useState('');
  const [mixProdType, setMixProdType] = useState('');
  const [mixQuick, setMixQuick] = useState('全部');

  const [pavDirection, setPavDirection] = useState('');
  const [pavLayer, setPavLayer] = useState('');
  const [pavQuick, setPavQuick] = useState('全部');

  const [beamYard, setBeamYard] = useState('');
  const [beamType, setBeamType] = useState('');
  const [beamQuick, setBeamQuick] = useState('全部');

  const [issueType, setIssueType] = useState('');
  const [issueStatus, setIssueStatus] = useState('');
  const [issueQuick, setIssueQuick] = useState('全部');

  // Sync global selectedDate changes smoothly
  useEffect(() => {
    setPeriod(periodForDate(selectedDate));
  }, [selectedDate]);

  // Reset sub-filters when global section changes
  useEffect(() => {
    setPage(1);
    setLabName('');
    setMixStation('');
  }, [activeSectionId]);

  useEffect(() => {
    setPage(1);
  }, [activeSub]);

  // Data states from PostgreSQL APIs
  const [sections, setSections] = useState<QualitySectionMetric[]>(DEFAULT_SECTIONS);
  const [inspections, setInspections] = useState<QualityInspectionRecord[]>([]);
  const [overviewIssues, setOverviewIssues] = useState<QualityIssueRecord[]>([]);
  const [labRecords, setLabRecords] = useState<QualityLabRecord[]>([]);
  const [labAlerts, setLabAlerts] = useState<QualityLabRecord[]>([]);
  const [mixingRecords, setMixingRecords] = useState<QualityMixingRecord[]>([]);
  const [mixingAlerts, setMixingAlerts] = useState<QualityMixingRecord[]>([]);
  const [pavementRecords, setPavementRecords] = useState<QualityPavementRecord[]>([]);
  const [pavementAlerts, setPavementAlerts] = useState<QualityPavementRecord[]>([]);
  const [beamRecords, setBeamRecords] = useState<QualityBeamRecord[]>([]);
  const [beamAlerts, setBeamAlerts] = useState<QualityBeamRecord[]>([]);
  const [issueRecords, setIssueRecords] = useState<QualityIssueRecord[]>([]);
  const [issueScopedRecords, setIssueScopedRecords] = useState<QualityIssueRecord[]>([]);
  const [sectionIssueCounts, setSectionIssueCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  const [modalPayload, setModalPayload] = useState<QualityModalPayload | null>(null);

  const fetchActiveData = useCallback(async () => {
    setLoading(true);
    try {
      const sec = activeSectionId ?? '';
      if (activeSub === 'overview') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (ovCategory) qs.set('category', ovCategory);
        if (ovQuick !== '全部') qs.set('quickFilter', ovQuick);
        const res = await fetch(`/api/v1/m03/overview?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setInspections(data.inspections ?? []);
          setOverviewIssues(data.issues ?? []);
        }
      } else if (activeSub === 'lab') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (labName) qs.set('labName', labName);
        if (labCategory) qs.set('category', labCategory);
        if (labQuick !== '全部') qs.set('quickFilter', labQuick);
        const res = await fetch(`/api/v1/m03/lab?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setLabRecords(data.records ?? []);
          setLabAlerts(data.alerts ?? []);
        }
      } else if (activeSub === 'mixing') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (mixStation) qs.set('station', mixStation);
        if (mixProdType) qs.set('prodType', mixProdType);
        if (mixQuick !== '全部') qs.set('quickFilter', mixQuick);
        const res = await fetch(`/api/v1/m03/mixing?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setMixingRecords(data.records ?? []);
          setMixingAlerts(data.alerts ?? []);
        }
      } else if (activeSub === 'pavement') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (pavDirection) qs.set('direction', pavDirection);
        if (pavLayer) qs.set('layer', pavLayer);
        if (pavQuick !== '全部') qs.set('quickFilter', pavQuick);
        const res = await fetch(`/api/v1/m03/pavement?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setPavementRecords(data.records ?? []);
          setPavementAlerts(data.alerts ?? []);
        }
      } else if (activeSub === 'beamYard') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (beamYard) qs.set('yard', beamYard);
        if (beamType) qs.set('beamType', beamType);
        if (beamQuick !== '全部') qs.set('quickFilter', beamQuick);
        const res = await fetch(`/api/v1/m03/beam-yard?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setBeamRecords(data.records ?? []);
          setBeamAlerts(data.alerts ?? []);
        }
      } else if (activeSub === 'issues') {
        const qs = new URLSearchParams();
        if (sec) qs.set('sectionId', sec);
        if (issueType) qs.set('issueType', issueType);
        if (issueStatus) qs.set('status', issueStatus);
        if (issueQuick !== '全部') qs.set('quickFilter', issueQuick);
        const res = await fetch(`/api/v1/m03/issues?${qs.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.sections) && data.sections.length) setSections(data.sections);
          setIssueRecords(data.records ?? []);
          setIssueScopedRecords(data.scopedRecords ?? []);
          setSectionIssueCounts(data.sectionIssueCounts ?? {});
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeSub,
    activeSectionId,
    ovCategory,
    ovQuick,
    labName,
    labCategory,
    labQuick,
    mixStation,
    mixProdType,
    mixQuick,
    pavDirection,
    pavLayer,
    pavQuick,
    beamYard,
    beamType,
    beamQuick,
    issueType,
    issueStatus,
    issueQuick,
  ]);

  useEffect(() => {
    fetchActiveData();
  }, [fetchActiveData]);

  const pf = PERIOD_FACTORS[period] || PERIOD_FACTORS['2026年11月'];
  const secMeta = useMemo(
    () => (activeSectionId ? sections.find((s) => s.sectionId === activeSectionId) ?? null : null),
    [sections, activeSectionId]
  );

  function handleSectionSelect(nextId: string) {
    setPage(1);
    setActiveSectionId(nextId || null);
  }

  function handleBarToggle(secId: string) {
    setPage(1);
    setActiveSectionId(activeSectionId === secId ? null : secId);
  }

  function handleReset() {
    setPeriod(periodForDate(selectedDate));
    setPage(1);
    if (activeSub === 'overview') {
      setOvCategory('');
      setOvQuick('全部');
    } else if (activeSub === 'lab') {
      setLabName('');
      setLabCategory('');
      setLabQuick('全部');
    } else if (activeSub === 'mixing') {
      setMixStation('');
      setMixProdType('');
      setMixQuick('全部');
    } else if (activeSub === 'pavement') {
      setPavDirection('');
      setPavLayer('');
      setPavQuick('全部');
    } else if (activeSub === 'beamYard') {
      setBeamYard('');
      setBeamType('');
      setBeamQuick('全部');
    } else if (activeSub === 'issues') {
      setIssueType('');
      setIssueStatus('');
      setIssueQuick('全部');
    }
    if (activeSectionId) setActiveSectionId(null);
    showToast('已重置质量管理筛选条件');
  }

  function openGatewayModal() {
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
    setModalPayload({ kind: 'gateway', sysName, subDesc });
  }

  const pageSize = 5;

  // Render Overview
  function renderOverview() {
    const baseIssueCount = overviewIssues.length;
    const doneCount = overviewIssues.filter((i) => i.status === '已整改').length;
    const ingCount = overviewIssues.filter((i) => i.status === '整改中').length;
    const overCount = overviewIssues.filter((i) => i.status === '已超期').length;
    const issueMult = period === '2026年11月' || period === '2026年10月' ? 1 : pf.mult;
    const dispTotalIssues =
      period === '2026年11月' ? baseIssueCount : Math.max(1, Math.round(baseIssueCount * issueMult));
    const dispDone =
      period === '2026年11月' ? doneCount : Math.max(1, Math.round(doneCount * issueMult));
    const dispIng =
      period === '2026年11月' ? ingCount : Math.max(0, dispTotalIssues - dispDone - overCount);
    const rectifyPct = dispTotalIssues > 0 ? (dispDone / dispTotalIssues) * 100 : 100;

    const catFactor = ovCategory ? 0.28 : 1;
    const rawBatches = secMeta ? secMeta.labBatches : 8436;
    const batches = Math.round(rawBatches * pf.mult * catFactor);
    const passRate = Math.min(99.9, (secMeta ? secMeta.qualityRate : 98.7) + pf.passDelta);
    const mixVol = (
      (secMeta ? secMeta.mixVol : 36.8) *
      pf.mult *
      (ovCategory === '桥梁工程' ? 0.52 : ovCategory ? 0.35 : 1)
    ).toFixed(1);
    const beams = Math.round(
      (secMeta ? secMeta.beams : 640) *
        pf.mult *
        (ovCategory && ovCategory !== '桥梁工程' ? 0.25 : 1)
    );

    const typeDefs = [
      { name: '原材料质量', filterVal: '原材料', color: '#2563eb' },
      { name: '施工工艺', filterVal: '施工工艺', color: '#06b6d4' },
      { name: '检测异常', filterVal: '检测', color: '#10b981' },
      { name: '构件质量', filterVal: '构件质量', color: '#f59e0b' },
      { name: '其他', filterVal: '全部', color: '#f43f5e' },
    ];
    const donutSegs = typeDefs
      .map((td) => {
        const cnt = overviewIssues.filter((i) => i.issueType === td.name).length;
        return {
          name: td.name,
          filterVal: td.filterVal,
          color: td.color,
          count: period === '2026年11月' ? cnt : Math.round(cnt * issueMult),
        };
      })
      .filter((s) => s.count > 0 || !activeSectionId);

    const totalPages = Math.max(1, Math.ceil(inspections.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = inspections.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cols: ColumnDef<QualityInspectionRecord>[] = [
      {
        key: 'idx',
        header: '序号',
        render: (r) => {
          const idx = inspections.findIndex((x) => x.id === r.id);
          return idx >= 0 ? idx + 1 : 1;
        },
      },
      { key: 'section', header: '所属工区', render: (r) => r.section },
      { key: 'target', header: '检查对象', render: (r) => r.target },
      { key: 'content', header: '检查内容', render: (r) => r.content },
      {
        key: 'result',
        header: '检查结果',
        render: (r) => <StatusBadge text={r.result} tone={r.result === '合格' ? 'ok' : 'danger'} />,
      },
      { key: 'desc', header: '问题描述', render: (r) => r.description },
      {
        key: 'rectify',
        header: '整改状态',
        render: (r) =>
          r.rectify === '—' ? (
            '—'
          ) : (
            <StatusBadge text={r.rectify} tone={r.rectify === '已整改' ? 'ok' : 'info'} />
          ),
      },
      {
        key: 'op',
        header: '操作',
        render: (r) => (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => setModalPayload({ kind: 'inspection', record: r })}
          >
            查看
          </button>
        ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">工程类别</span>
              <select
                className="glass-select m03-select"
                value={ovCategory}
                onChange={(e) => {
                  setOvCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部类别</option>
                <option value="路基工程">路基工程</option>
                <option value="桥梁工程">桥梁工程</option>
                <option value="路面工程">路面工程</option>
                <option value="场站工程">场站工程</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已按当前筛选条件刷新质量数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="质量概况"
          periodLabel={pf.label}
          cards={[
            { label: '检测批次', value: fmtInt(batches), unit: '批', icon: <ClipboardCheck size={18} /> },
            { label: '质量合格率', value: passRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
            { label: '拌合站生产量', value: mixVol, unit: '万m³', icon: <Layers size={18} /> },
            { label: '梁片生产数量', value: fmtInt(beams), unit: '片', icon: <BeamIcon /> },
            { label: '质量问题', value: fmtInt(dispTotalIssues), unit: '项', icon: <AlertTriangle size={18} />, tone: 'gold' },
            { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: <CheckCircle2 size={18} />, tone: 'green' },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel title="各工区质量合格率" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="ov-rate"
                items={sections.map((s) => ({
                  secId: s.sectionId,
                  label: s.shortName,
                  value: +(s.qualityRate + pf.passDelta).toFixed(1),
                }))}
                minY={90}
                maxY={100}
                ticks={[90, 92, 94, 96, 98, 100].map((v) => ({ val: v, label: `${v}%` }))}
                valueFormatter={(v) => `${v.toFixed(1)}%`}
                activeSecId={activeSectionId}
                onBarClick={handleBarToggle}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="质量问题类型分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={donutSegs}
                centerVal={fmtInt(dispTotalIssues)}
                centerUnit="项"
                centerSub="问题总数"
                onSegmentClick={(val) => {
                  setOvQuick(val);
                  setPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="整改进展" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <RingGaugeSvg
                idPrefix="ov-rectify"
                pct={rectifyPct}
                subLabel="整改完成率"
                rows={[
                  { label: '问题总数', value: `${fmtInt(dispTotalIssues)} 项`, valColor: '#ffffff' },
                  { label: '已整改', value: `${fmtInt(dispDone)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
                  { label: '整改中', value: `${fmtInt(dispIng)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
                  { label: '已超期', value: `${fmtInt(overCount)} 项`, dotColor: '#f87171', valColor: '#f87171' },
                ]}
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="质量检查记录"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '原材料', '施工工艺', '检测', '构件质量'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${ovQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setOvQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载质量检查记录...' : '当前筛选条件下暂无质量检查记录'}
              />
            </div>
            <PaginationBar
              totalItems={inspections.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="关键场站质量状态" className="m03-side-panel" bodyClassName="m03-side-body">
            <div className="m03-side-list">
              <div className="m03-side-card" onClick={() => router.push('/quality/mixing')}>
                <div className="m03-side-left">
                  <div className="m03-side-ico">
                    <Building2 size={18} />
                  </div>
                  <div>
                    <div className="m03-side-title">拌合站 ({activeSectionId ? '1座' : '6座'})</div>
                    <div className="m03-side-sub">生产及配合比数据已同步</div>
                  </div>
                </div>
                <StatusBadge text="运行正常" tone="ok" />
              </div>

              <div className="m03-side-card" onClick={() => router.push('/quality/beamYard')}>
                <div className="m03-side-left">
                  <div className="m03-side-ico">
                    <BeamIcon />
                  </div>
                  <div>
                    <div className="m03-side-title">梁场 ({activeSectionId ? '1座' : '2座'})</div>
                    <div className="m03-side-sub">梁片及工序数据已同步</div>
                  </div>
                </div>
                <StatusBadge text="运行正常" tone="ok" />
              </div>

              <div className="m03-side-card" onClick={() => router.push('/quality/lab')}>
                <div className="m03-side-left">
                  <div className="m03-side-ico">
                    <FlaskConical size={18} />
                  </div>
                  <div>
                    <div className="m03-side-title">实验室 ({activeSectionId ? '1座' : '6座'})</div>
                    <div className="m03-side-sub">检测及报告数据已同步</div>
                  </div>
                </div>
                <StatusBadge text="运行正常" tone="ok" />
              </div>
            </div>

            <div className="m03-side-footer">
              <span>同步于 {selectedDate} 10:45</span>
              <button
                type="button"
                className="m03-link-btn"
                onClick={() =>
                  setModalPayload({ kind: 'stations', sections, activeSectionId })
                }
              >
                查看场站 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // Render Lab
  function renderLab() {
    const effectiveSec =
      activeSectionId ||
      (labName ? sections.find((s) => s.labName === labName)?.sectionId ?? null : null);
    const effMeta = effectiveSec
      ? sections.find((s) => s.sectionId === effectiveSec) ?? null
      : null;

    const catRatioMap: Record<string, number> = {
      '': 1,
      原材料: 0.37,
      混合料: 0.266,
      混凝土: 0.173,
      路基路面: 0.12,
      其他: 0.071,
    };
    const catRatio = catRatioMap[labCategory] ?? 1;
    const baseBatches = effMeta ? effMeta.labBatches : 8436;
    const totalBatches = Math.round(baseBatches * pf.mult * catRatio);
    const passRate = Math.min(99.9, (effMeta ? effMeta.labPassRate : 98.7) + pf.passDelta);
    const passBatches = Math.round(totalBatches * (passRate / 100));
    const failBatches = Math.max(0, totalBatches - passBatches);
    const reportCount = Math.max(0, totalBatches - Math.round(34 * pf.mult * (effMeta ? 0.17 : 1)));

    const distItems = [
      { name: '原材料', color: '#2563eb', ratio: 0.37 },
      { name: '混合料', color: '#06b6d4', ratio: 0.266 },
      { name: '混凝土', color: '#10b981', ratio: 0.173 },
      { name: '路基路面', color: '#f59e0b', ratio: 0.12 },
      { name: '其他', color: '#8b5cf6', ratio: 0.071 },
    ].map((d) => ({
      name: d.name,
      color: d.color,
      count: Math.round(baseBatches * pf.mult * d.ratio),
    }));

    const baseTrend = [98.2, 98.6, 98.5, 99.0, 98.8, 98.9];
    const trendShift = (effMeta ? effMeta.labPassRate - 98.7 : 0) + pf.passDelta;
    const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
      label: lbl,
      value: +Math.min(99.9, Math.max(97.1, baseTrend[i] + trendShift)).toFixed(1),
    }));

    const totalPages = Math.max(1, Math.ceil(labRecords.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = labRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cols: ColumnDef<QualityLabRecord>[] = [
      { key: 'id', header: '检测编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
      { key: 'lab', header: '实验室', render: (r) => r.lab },
      { key: 'sample', header: '样品名称', render: (r) => r.sample },
      { key: 'item', header: '检测项目', render: (r) => r.item },
      { key: 'time', header: '检测时间', render: (r) => <span className="tabular-nums">{r.testedAt}</span> },
      {
        key: 'result',
        header: '检测结论',
        render: (r) => <StatusBadge text={r.result} tone={r.result === '合格' ? 'ok' : 'danger'} />,
      },
      {
        key: 'report',
        header: '报告',
        render: (r) =>
          r.reportState === '待出具' ? (
            <button
              type="button"
              className="m03-tag muted"
              style={{ cursor: 'pointer' }}
              onClick={() => setModalPayload({ kind: 'lab', record: r })}
            >
              待出具
            </button>
          ) : (
            <button
              type="button"
              className="m03-link-btn"
              onClick={() => setModalPayload({ kind: 'lab', record: r })}
            >
              查看报告
            </button>
          ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">实验室</span>
              <select
                className="glass-select m03-select"
                value={labName}
                onChange={(e) => {
                  setLabName(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部实验室</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.labName}>
                    {s.labName}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">检测类别</span>
              <select
                className="glass-select m03-select"
                value={labCategory}
                onChange={(e) => {
                  setLabCategory(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部类别</option>
                <option value="原材料">原材料</option>
                <option value="混合料">混合料</option>
                <option value="混凝土">混凝土</option>
                <option value="路基路面">路基路面</option>
                <option value="其他">其他</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已刷新实验室检测数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={openGatewayModal}>
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="实验室检测概况"
          periodLabel={pf.label}
          cards={[
            { label: '接入实验室', value: effectiveSec ? '1' : '6', unit: '座', icon: <FlaskConical size={18} /> },
            { label: '检测批次', value: fmtInt(totalBatches), unit: '批', icon: <ClipboardCheck size={18} /> },
            { label: '合格批次', value: fmtInt(passBatches), unit: '批', icon: <CheckCircle2 size={18} />, tone: 'green' },
            { label: '不合格批次', value: fmtInt(failBatches), unit: '批', icon: <AlertTriangle size={18} />, tone: 'gold' },
            { label: '检测合格率', value: passRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
            { label: '已出具报告', value: fmtInt(reportCount), unit: '份', icon: <FileText size={18} /> },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel
            title="各工区检测批次"
            headerRight={<span className="m03-header-right">单位 批</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="lab-batches"
                items={sections.map((s) => ({
                  secId: s.sectionId,
                  label: s.shortName,
                  value: Math.round(s.labBatches * pf.mult),
                }))}
                minY={0}
                maxY={Math.round(1600 * pf.mult)}
                ticks={[0, 400, 800, 1200, 1600].map((v) => ({
                  val: Math.round(v * pf.mult),
                  label: fmtInt(v * pf.mult),
                }))}
                valueFormatter={(v) => fmtInt(v)}
                activeSecId={effectiveSec}
                onBarClick={handleBarToggle}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="检测类别分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={distItems}
                centerVal={fmtInt(Math.round(baseBatches * pf.mult))}
                centerUnit="批"
                centerSub="检测批次"
                onSegmentClick={(val) => {
                  setLabCategory((prev) => (prev === val ? '' : val));
                  setPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="检测合格率趋势"
            headerRight={<span className="m03-header-right">{pf.shortMonth}</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <TrendLineSvg
                idPrefix="lab-trend"
                points={trendPts}
                minY={97}
                maxY={100}
                ticks={[97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="检测记录"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '合格', '不合格'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${labQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setLabQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载检测记录...' : '暂无匹配的检测记录'}
              />
            </div>
            <PaginationBar
              totalItems={labRecords.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="最新不合格记录" className="m03-side-panel" bodyClassName="m03-side-body">
            <div className="m03-side-list">
              {labAlerts.length ? (
                labAlerts.map((a) => {
                  const secName = sections.find((s) => s.sectionId === a.sectionId)?.name ?? '';
                  return (
                    <div
                      key={a.id}
                      className="m03-side-card"
                      onClick={() => setModalPayload({ kind: 'lab', record: a })}
                    >
                      <div className="m03-side-left">
                        <div className={`m03-side-ico ${a.retestState === '待复检' ? 'warn' : ''}`}>
                          {a.retestState === '待复检' ? (
                            <AlertTriangle size={18} />
                          ) : (
                            <FileText size={18} />
                          )}
                        </div>
                        <div>
                          <div className="m03-side-title">
                            {secName} · {a.sample}
                            {a.item.replace('含量', '')}
                          </div>
                          <div className="m03-side-sub">
                            {a.testedAt} &nbsp;{a.id}
                          </div>
                        </div>
                      </div>
                      <StatusBadge
                        text={a.retestState}
                        tone={a.retestState === '已复检' ? 'ok' : 'warn'}
                      />
                    </div>
                  );
                })
              ) : (
                <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                  本工区暂无不合格检测记录
                </div>
              )}
            </div>
            <div className="m03-side-footer">
              <span>同步于 {selectedDate} 10:45</span>
              <button
                type="button"
                className="m03-link-btn"
                onClick={() => {
                  setLabQuick('不合格');
                  setPage(1);
                  showToast('已定位筛选：不合格');
                }}
              >
                查看全部 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // Render Mixing
  function renderMixing() {
    const effectiveSec =
      activeSectionId ||
      (mixStation ? sections.find((s) => s.stationFull === mixStation)?.sectionId ?? null : null);
    const effMeta = effectiveSec
      ? sections.find((s) => s.sectionId === effectiveSec) ?? null
      : null;

    const totalVol = (
      (effMeta ? effMeta.mixVol : 36.8) *
      pf.mult *
      (mixProdType ? 0.42 : 1)
    ).toFixed(1);
    const baseBatches = effMeta ? Math.round(2460 * (effMeta.mixVol / 36.8)) : 2460;
    const typeRatioMap: Record<string, number> = {
      '': 1,
      水泥混凝土: 0.439,
      水泥稳定碎石: 0.335,
      沥青混合料: 0.226,
    };
    const totalBatches = Math.round(baseBatches * pf.mult * (typeRatioMap[mixProdType] ?? 1));

    const newlyHandled = mixingAlerts.filter(
      (r) => r.handled && r.id !== 'BH-20261124-077'
    ).length;
    const baseWarn = effMeta ? Math.max(3, Math.round(27 * (effMeta.mixVol / 36.8))) : 27;
    const warnCount = Math.round(baseWarn * pf.mult);
    const baseHandled = Math.max(
      0,
      warnCount - Math.max(0, (effectiveSec ? 1 : 2) - newlyHandled)
    );
    const warnHandleRate = warnCount > 0 ? (baseHandled / warnCount) * 100 : 100;
    const mixPassRate = Math.min(
      99.9,
      (effMeta ? 98.7 + (effMeta.qualityRate - 98.7) * 0.6 : 98.9) + pf.passDelta
    );

    const typeSegs = [
      { name: '水泥混凝土', color: '#2563eb', ratio: 1080 / 2460 },
      { name: '水泥稳定碎石', color: '#06b6d4', ratio: 824 / 2460 },
      { name: '沥青混合料', color: '#10b981', ratio: 556 / 2460 },
    ].map((d) => ({ name: d.name, color: d.color, count: Math.round(baseBatches * pf.mult * d.ratio) }));

    const totalPages = Math.max(1, Math.ceil(mixingRecords.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = mixingRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cols: ColumnDef<QualityMixingRecord>[] = [
      { key: 'id', header: '批次编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
      { key: 'section', header: '所属工区', render: (r) => r.section },
      { key: 'station', header: '拌合站', render: (r) => r.station },
      { key: 'type', header: '生产类型', render: (r) => r.prodType },
      { key: 'mixCode', header: '配合比', render: (r) => r.mixCode },
      {
        key: 'volume',
        header: '生产量',
        render: (r) => <span className="tabular-nums">{r.volume.toFixed(1)} m³</span>,
      },
      { key: 'time', header: '生产时间', render: (r) => <span className="tabular-nums">{r.producedAt}</span> },
      {
        key: 'judge',
        header: '质量判定',
        render: (r) => <StatusBadge text={r.judge} tone={r.judge === '合格' ? 'ok' : 'warn'} />,
      },
      {
        key: 'op',
        header: '操作',
        render: (r) => (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => setModalPayload({ kind: 'mixing', record: r })}
          >
            查看
          </button>
        ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">拌合站</span>
              <select
                className="glass-select m03-select"
                value={mixStation}
                onChange={(e) => {
                  setMixStation(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部拌合站</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.stationFull}>
                    {s.stationFull}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">生产类型</span>
              <select
                className="glass-select m03-select"
                value={mixProdType}
                onChange={(e) => {
                  setMixProdType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部类型</option>
                <option value="水泥混凝土">水泥混凝土</option>
                <option value="水泥稳定碎石">水泥稳定碎石</option>
                <option value="沥青混合料">沥青混合料</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已刷新拌合站生产数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={openGatewayModal}>
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="拌合站生产概况"
          periodLabel={pf.label}
          cards={[
            { label: '接入拌合站', value: effectiveSec ? '1' : '6', unit: '座', icon: <Building2 size={18} /> },
            { label: '累计产量', value: totalVol, unit: '万m³', icon: <Layers size={18} /> },
            { label: '生产批次', value: fmtInt(totalBatches), unit: '批', icon: <ClipboardCheck size={18} /> },
            { label: '配合比合格率', value: mixPassRate.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
            { label: '预警批次', value: fmtInt(warnCount), unit: '批', icon: <AlertTriangle size={18} />, tone: 'gold' },
            { label: '已处理批次', value: fmtInt(baseHandled), unit: '批', icon: <CheckCircle2 size={18} />, tone: 'green' },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel
            title="各拌合站累计产量"
            headerRight={<span className="m03-header-right">单位 万m³</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="mix-vol"
                items={sections.map((s) => ({
                  secId: s.sectionId,
                  label: s.stationShort,
                  value: +(s.mixVol * pf.mult).toFixed(1),
                }))}
                minY={0}
                maxY={+(8 * pf.mult).toFixed(1)}
                ticks={[0, 2, 4, 6, 8].map((v) => ({
                  val: +(v * pf.mult).toFixed(1),
                  label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1),
                }))}
                valueFormatter={(v) => v.toFixed(1)}
                activeSecId={effectiveSec}
                onBarClick={handleBarToggle}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="生产批次分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={typeSegs}
                centerVal={fmtInt(Math.round(baseBatches * pf.mult))}
                centerUnit="批"
                centerSub="生产批次"
                onSegmentClick={(val) => {
                  setMixProdType((prev) => (prev === val ? '' : val));
                  setPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="生产预警处理" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <RingGaugeSvg
                idPrefix="mix-warn"
                pct={warnHandleRate}
                subLabel="预警处理率"
                rows={[
                  { label: '预警批次', value: `${fmtInt(warnCount)} 批`, valColor: '#ffffff' },
                  { label: '已处理', value: `${fmtInt(baseHandled)} 批`, dotColor: '#22c55e', valColor: '#4ade80' },
                  {
                    label: '待处理',
                    value: `${fmtInt(Math.max(0, warnCount - baseHandled))} 批`,
                    dotColor: '#facc15',
                    valColor: '#facc15',
                  },
                ]}
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="生产批次记录"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '正常批次', '预警批次'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${mixQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setMixQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载拌合批次...' : '暂无匹配的生产批次记录'}
              />
            </div>
            <PaginationBar
              totalItems={mixingRecords.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="最新生产预警" className="m03-side-panel" bodyClassName="m03-side-body">
            <div className="m03-side-list">
              {mixingAlerts.slice(0, 3).length ? (
                mixingAlerts.slice(0, 3).map((a) => (
                  <div
                    key={a.id}
                    className="m03-side-card"
                    onClick={() => setModalPayload({ kind: 'mixing', record: a })}
                  >
                    <div className="m03-side-left">
                      <div className={`m03-side-ico ${!a.handled ? 'warn' : ''}`}>
                        {!a.handled ? <AlertTriangle size={18} /> : <FileText size={18} />}
                      </div>
                      <div>
                        <div className="m03-side-title">{a.alertTitle}</div>
                        <div className="m03-side-sub">
                          {a.producedAt} &nbsp;{a.id}
                        </div>
                      </div>
                    </div>
                    <StatusBadge text={a.handled ? '已处理' : '待处理'} tone={a.handled ? 'ok' : 'warn'} />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                  当前拌合站无生产预警
                </div>
              )}
            </div>
            <div className="m03-side-footer">
              <span>同步于 {selectedDate} 10:45</span>
              <button
                type="button"
                className="m03-link-btn"
                onClick={() => {
                  setMixQuick('预警批次');
                  setPage(1);
                  showToast('已定位筛选：预警批次');
                }}
              >
                查看全部 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // Render Pavement
  function renderPavement() {
    const segCount = Math.round(
      (secMeta ? secMeta.pavSegments : 18) *
        (period === '2026年11月' ? 1 : pf.mult) *
        (pavLayer ? 0.35 : 1) *
        (pavDirection ? 0.5 : 1)
    );
    const pavKm = (
      (secMeta ? secMeta.pavKm : 42.6) *
      (period === '2026年11月' ? 1 : pf.mult) *
      (pavLayer ? 0.38 : 1) *
      (pavDirection ? 0.5 : 1)
    ).toFixed(1);
    const tempRate = Math.min(
      99.9,
      99.1 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.4 : 0)
    ).toFixed(1);
    const compRate = Math.min(
      99.9,
      98.6 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0)
    ).toFixed(1);
    const thickRate = Math.min(
      99.9,
      99.0 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.3 : 0)
    ).toFixed(1);

    const warnRatio = secMeta ? secMeta.pavKm / 42.6 : 1;
    const mult = period === '2026年11月' ? 1 : pf.mult;
    const warnSegs = [
      { name: '厚度偏差', color: '#2563eb', count: Math.max(activeSectionId ? 0 : 1, Math.round(3 * warnRatio * mult)) },
      { name: '压实度不足', color: '#06b6d4', count: Math.max(activeSectionId ? 0 : 1, Math.round(2 * warnRatio * mult)) },
      { name: '摊铺温度偏低', color: '#f59e0b', count: Math.max(activeSectionId ? 0 : 1, Math.round(2 * warnRatio * mult)) },
      { name: '碾压遍数不足', color: '#f43f5e', count: Math.max(0, Math.round(1 * warnRatio * mult)) },
    ];
    const totalWarn = Math.max(1, warnSegs.reduce((s, d) => s + d.count, 0));

    const trendBase = [98.0, 98.3, 98.5, 99.0, 98.7, 99.1];
    const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
      label: lbl,
      value: +Math.min(
        99.9,
        Math.max(97.2, trendBase[i] + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0))
      ).toFixed(1),
    }));

    const totalPages = Math.max(1, Math.ceil(pavementRecords.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = pavementRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cols: ColumnDef<QualityPavementRecord>[] = [
      { key: 'section', header: '所属工区', render: (r) => r.section },
      { key: 'stake', header: '施工桩号', render: (r) => <span className="tabular-nums">{r.stake}</span> },
      { key: 'layer', header: '层位', render: (r) => r.layer },
      { key: 'temp', header: '摊铺温度', render: (r) => <span className="tabular-nums">{r.temp} ℃</span> },
      { key: 'passes', header: '碾压遍数', render: (r) => `${r.passes} 遍` },
      {
        key: 'compaction',
        header: '压实度',
        render: (r) => <span className="tabular-nums">{r.compaction.toFixed(1)}%</span>,
      },
      {
        key: 'thickness',
        header: '实测厚度',
        render: (r) => <span className="tabular-nums">{r.thickness.toFixed(1)} cm</span>,
      },
      {
        key: 'judge',
        header: '判定',
        render: (r) => <StatusBadge text={r.judge} tone={r.judge === '合格' ? 'ok' : 'warn'} />,
      },
      {
        key: 'op',
        header: '操作',
        render: (r) => (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => setModalPayload({ kind: 'pavement', record: r })}
          >
            查看
          </button>
        ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">路线方向</span>
              <select
                className="glass-select m03-select"
                value={pavDirection}
                onChange={(e) => {
                  setPavDirection(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部方向</option>
                <option value="左幅（明水→北安）">左幅（明水→北安）</option>
                <option value="右幅（北安→明水）">右幅（北安→明水）</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">施工层位</span>
              <select
                className="glass-select m03-select"
                value={pavLayer}
                onChange={(e) => {
                  setPavLayer(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部层位</option>
                <option value="上面层">上面层</option>
                <option value="中面层">中面层</option>
                <option value="下面层">下面层</option>
                <option value="水稳基层">水稳基层</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已刷新路面施工质量数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={openGatewayModal}>
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="路面施工质量概况"
          periodLabel={pf.label}
          cards={[
            { label: '施工段', value: fmtInt(Math.max(1, segCount)), unit: '段', icon: <RoadIcon /> },
            { label: '摊铺里程', value: pavKm, unit: 'km', icon: <Layers size={18} /> },
            { label: '摊铺温度合格率', value: tempRate, unit: '%', icon: <Thermometer size={18} /> },
            { label: '压实度合格率', value: compRate, unit: '%', icon: <Gauge size={18} /> },
            { label: '厚度合格率', value: thickRate, unit: '%', icon: <Ruler size={18} /> },
            {
              label: '质量预警',
              value: fmtInt(activeSectionId ? pavementAlerts.length : totalWarn),
              unit: '条',
              icon: <AlertTriangle size={18} />,
              tone: 'gold',
            },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel
            title="各工区摊铺里程"
            headerRight={<span className="m03-header-right">单位 km</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="pav-km"
                items={sections.map((s) => ({
                  secId: s.sectionId,
                  label: s.shortName,
                  value: +(s.pavKm * pf.mult).toFixed(1),
                }))}
                minY={0}
                maxY={+(10 * pf.mult).toFixed(1)}
                ticks={[0, 2, 4, 6, 8, 10].map((v) => ({
                  val: +(v * pf.mult).toFixed(1),
                  label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1),
                }))}
                valueFormatter={(v) => v.toFixed(1)}
                activeSecId={activeSectionId}
                onBarClick={handleBarToggle}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="压实度合格率趋势"
            headerRight={<span className="m03-header-right">{pf.shortMonth}</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <TrendLineSvg
                idPrefix="pav-trend"
                points={trendPts}
                minY={97}
                maxY={100}
                ticks={[97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="路面质量预警分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={warnSegs.filter((w) => w.count > 0)}
                centerVal={fmtInt(totalWarn)}
                centerUnit="条"
                centerSub="质量预警"
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="摊铺碾压与检测记录"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '合格', '预警'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${pavQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setPavQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载路面质控记录...' : '暂无匹配的路面检测记录'}
              />
            </div>
            <PaginationBar
              totalItems={pavementRecords.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="最新路面质量预警" className="m03-side-panel" bodyClassName="m03-side-body">
            <div className="m03-side-list">
              {pavementAlerts.length ? (
                pavementAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="m03-side-card"
                    onClick={() => setModalPayload({ kind: 'pavement', record: a })}
                  >
                    <div className="m03-side-left">
                      <div className={`m03-side-ico ${!a.verified ? 'warn' : ''}`}>
                        {a.judge.includes('厚度') ? (
                          <Ruler size={18} />
                        ) : a.judge.includes('压实') ? (
                          <Gauge size={18} />
                        ) : (
                          <Thermometer size={18} />
                        )}
                      </div>
                      <div>
                        <div className="m03-side-title">{a.alertTitle}</div>
                        <div className="m03-side-sub">
                          {a.recordedAt} &nbsp;{a.stake}
                        </div>
                      </div>
                    </div>
                    <StatusBadge
                      text={a.verified ? '已核查' : '待核查'}
                      tone={a.verified ? 'ok' : 'warn'}
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                  本工区暂无路面预警
                </div>
              )}
            </div>
            <div className="m03-side-footer">
              <span>同步于 {selectedDate} 10:45</span>
              <button
                type="button"
                className="m03-link-btn"
                onClick={() => {
                  setPavQuick('预警');
                  setPage(1);
                  showToast('已定位筛选：预警');
                }}
              >
                查看全部 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // Render Beam Yard
  function renderBeamYard() {
    const targetYard = beamYard || (secMeta ? secMeta.yardName : '');
    const baseTotal = secMeta ? secMeta.beams : beamYard ? 320 : 640;
    const typeRatioMap: Record<string, number> = {
      '': 1,
      '30 m 箱梁': 360 / 640,
      '40 m 箱梁': 220 / 640,
      '20 m 空心板梁': 60 / 640,
    };
    const totalBeams = Math.round(baseTotal * pf.mult * (typeRatioMap[beamType] ?? 1));
    const prodRatio = baseTotal / 640;

    const trendBars = [
      { label: '01—05日', value: Math.round(104 * prodRatio * pf.mult) },
      { label: '06—10日', value: Math.round(121 * prodRatio * pf.mult) },
      { label: '11—15日', value: Math.round(123 * prodRatio * pf.mult) },
      { label: '16—20日', value: Math.round(148 * prodRatio * pf.mult) },
      { label: '21—25日', value: Math.round(144 * prodRatio * pf.mult) },
    ];

    const beamTypesDist = [
      { name: '30 m 箱梁', color: '#2563eb', count: Math.round(360 * prodRatio * pf.mult) },
      { name: '40 m 箱梁', color: '#06b6d4', count: Math.round(220 * prodRatio * pf.mult) },
      { name: '20 m 空心板梁', color: '#10b981', count: Math.round(60 * prodRatio * pf.mult) },
    ];

    const tensionPct = Math.min(99.9, 99.5 + pf.passDelta);
    const groutPct = Math.min(99.9, 99.7 + pf.passDelta);
    const inspectPct = Math.min(99.9, 99.2 + pf.passDelta);
    const warnTotal = Math.max(
      beamAlerts.length,
      Math.round(5 * prodRatio * (period === '2026年11月' ? 1 : pf.mult))
    );

    const totalPages = Math.max(1, Math.ceil(beamRecords.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = beamRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

    const cols: ColumnDef<QualityBeamRecord>[] = [
      { key: 'id', header: '梁片编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
      { key: 'yard', header: '所属梁场', render: (r) => r.yard },
      { key: 'type', header: '梁型', render: (r) => r.beamType },
      { key: 'date', header: '浇筑日期', render: (r) => <span className="tabular-nums">{r.castDate}</span> },
      { key: 'curing', header: '养护状态', render: (r) => <StatusBadge text={r.curing} tone={beamBadgeTone(r.curing)} /> },
      { key: 'tension', header: '张拉', render: (r) => <StatusBadge text={r.tension} tone={beamBadgeTone(r.tension)} /> },
      { key: 'grout', header: '压浆', render: (r) => <StatusBadge text={r.grout} tone={beamBadgeTone(r.grout)} /> },
      { key: 'inspect', header: '检验', render: (r) => <StatusBadge text={r.inspect} tone={beamBadgeTone(r.inspect)} /> },
      {
        key: 'op',
        header: '操作',
        render: (r) => (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => setModalPayload({ kind: 'beamYard', record: r })}
          >
            查看
          </button>
        ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">梁场</span>
              <select
                className="glass-select m03-select"
                value={beamYard}
                onChange={(e) => {
                  setBeamYard(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部梁场</option>
                <option value="一号梁场">一号梁场</option>
                <option value="二号梁场">二号梁场</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">梁型</span>
              <select
                className="glass-select m03-select"
                value={beamType}
                onChange={(e) => {
                  setBeamType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部梁型</option>
                <option value="30 m 箱梁">30 m 箱梁</option>
                <option value="40 m 箱梁">40 m 箱梁</option>
                <option value="20 m 空心板梁">20 m 空心板梁</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已刷新智慧梁场生产与工序数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={openGatewayModal}>
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="梁片生产质量概况"
          periodLabel={pf.label}
          cards={[
            { label: '接入梁场', value: targetYard ? '1' : '2', unit: '座', icon: <Building2 size={18} /> },
            { label: '累计生产', value: fmtInt(totalBeams), unit: '片', icon: <BeamIcon /> },
            { label: '成品检验合格率', value: inspectPct.toFixed(1), unit: '%', icon: <ShieldCheck size={18} /> },
            { label: '张拉合格率', value: tensionPct.toFixed(1), unit: '%', icon: <Gauge size={18} /> },
            { label: '压浆合格率', value: groutPct.toFixed(1), unit: '%', icon: <FlaskConical size={18} /> },
            { label: '工序预警', value: fmtInt(warnTotal), unit: '条', icon: <AlertTriangle size={18} />, tone: 'gold' },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel
            title="梁片生产趋势"
            headerRight={<span className="m03-header-right">单位 片</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="beam-trend"
                items={trendBars}
                minY={0}
                maxY={Math.round(160 * prodRatio * pf.mult)}
                ticks={[0, 40, 80, 120, 160].map((v) => ({
                  val: Math.round(v * prodRatio * pf.mult),
                  label: fmtInt(v * prodRatio * pf.mult),
                }))}
                valueFormatter={(v) => fmtInt(v)}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="梁型分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={beamTypesDist}
                centerVal={fmtInt(Math.round(baseTotal * pf.mult))}
                centerUnit="片"
                centerSub="累计生产"
                onSegmentClick={(val) => {
                  setBeamType((prev) => (prev === val ? '' : val));
                  setPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="关键工序合格率" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <div className="m03-proc-bars">
                <div>
                  <div className="m03-proc-top">
                    <span className="m03-proc-name">预应力张拉</span>
                    <span className="m03-proc-val">{tensionPct.toFixed(1)}%</span>
                  </div>
                  <div className="m03-proc-track">
                    <div
                      className="m03-proc-fill"
                      style={{
                        width: `${tensionPct}%`,
                        background: 'linear-gradient(90deg,#0284c7,#38f2ff)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="m03-proc-top">
                    <span className="m03-proc-name">孔道压浆</span>
                    <span className="m03-proc-val" style={{ color: '#4ade80' }}>
                      {groutPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="m03-proc-track">
                    <div
                      className="m03-proc-fill"
                      style={{
                        width: `${groutPct}%`,
                        background: 'linear-gradient(90deg,#0d9488,#22c55e)',
                      }}
                    />
                  </div>
                </div>
                <div>
                  <div className="m03-proc-top">
                    <span className="m03-proc-name">成品检验</span>
                    <span className="m03-proc-val" style={{ color: '#60a5fa' }}>
                      {inspectPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="m03-proc-track">
                    <div
                      className="m03-proc-fill"
                      style={{
                        width: `${inspectPct}%`,
                        background: 'linear-gradient(90deg,#1d4ed8,#38bdf8)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="梁片生产与工序记录"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '生产中', '已检验'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${beamQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setBeamQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载梁片台账...' : '暂无匹配的梁片记录'}
              />
            </div>
            <PaginationBar
              totalItems={beamRecords.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="最新工序预警" className="m03-side-panel" bodyClassName="m03-side-body">
            <div className="m03-side-list">
              {beamAlerts.length ? (
                beamAlerts.map((a) => (
                  <div
                    key={a.id}
                    className="m03-side-card"
                    onClick={() => setModalPayload({ kind: 'beamYard', record: a })}
                  >
                    <div className="m03-side-left">
                      <div className={`m03-side-ico ${a.alertState === '待复检' ? 'warn' : ''}`}>
                        {a.alertTitle.includes('温度') ? (
                          <Thermometer size={18} />
                        ) : (
                          <Gauge size={18} />
                        )}
                      </div>
                      <div>
                        <div className="m03-side-title">{a.alertTitle}</div>
                        <div className="m03-side-sub">
                          {a.alertTime} &nbsp;{a.id}
                        </div>
                      </div>
                    </div>
                    <StatusBadge
                      text={a.alertState}
                      tone={
                        a.alertState === '已处理'
                          ? 'ok'
                          : a.alertState === '跟踪中'
                            ? 'info'
                            : 'warn'
                      }
                    />
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                  当前梁场暂无工序预警
                </div>
              )}
            </div>
            <div className="m03-side-footer">
              <span>同步于 {selectedDate} 10:45</span>
              <button
                type="button"
                className="m03-link-btn"
                onClick={() => {
                  setBeamQuick('生产中');
                  setPage(1);
                  showToast('已定位筛选：生产中');
                }}
              >
                查看全部 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // Render Issues
  function renderIssues() {
    const totalCount = issueScopedRecords.length;
    const doneList = issueScopedRecords.filter((i) => i.status === '已整改');
    const ingList = issueScopedRecords.filter((i) => i.status === '整改中');
    const overList = issueScopedRecords.filter((i) => i.status === '已超期');
    const rectifyPct = totalCount > 0 ? (doneList.length / totalCount) * 100 : 100;
    const avgDays =
      doneList.length > 0
        ? (doneList.reduce((s, i) => s + (i.daysUsed ?? 2.3), 0) / doneList.length).toFixed(1)
        : '0.0';

    const typeDefs = [
      { name: '原材料质量', color: '#2563eb' },
      { name: '施工工艺', color: '#06b6d4' },
      { name: '检测异常', color: '#10b981' },
      { name: '构件质量', color: '#f59e0b' },
      { name: '其他', color: '#f43f5e' },
    ];
    const donutSegs = typeDefs
      .map((td) => ({
        name: td.name,
        color: td.color,
        count: issueScopedRecords.filter((i) => i.issueType === td.name).length,
      }))
      .filter((d) => d.count > 0 || !activeSectionId);

    const totalPages = Math.max(1, Math.ceil(issueRecords.length / pageSize));
    const safePage = Math.min(page, totalPages);
    const pagedRows = issueRecords.slice((safePage - 1) * pageSize, safePage * pageSize);

    const pendingIssue = ingList[0] ?? overList[0] ?? null;

    const cols: ColumnDef<QualityIssueRecord>[] = [
      { key: 'id', header: '问题编号', render: (r) => <span className="tabular-nums">{r.id}</span> },
      { key: 'section', header: '所属工区', render: (r) => r.section },
      { key: 'type', header: '问题类型', render: (r) => r.issueType },
      { key: 'desc', header: '问题描述', render: (r) => r.description },
      { key: 'unit', header: '整改责任单位', render: (r) => r.unit },
      { key: 'deadline', header: '整改期限', render: (r) => <span className="tabular-nums">{r.deadline}</span> },
      {
        key: 'status',
        header: '状态',
        render: (r) => (
          <StatusBadge
            text={r.status}
            tone={r.status === '已整改' ? 'ok' : r.status === '已超期' ? 'danger' : 'info'}
          />
        ),
      },
      {
        key: 'op',
        header: '操作',
        render: (r) => (
          <button
            type="button"
            className="m03-link-btn"
            onClick={() => setModalPayload({ kind: 'issue', record: r })}
          >
            详情
          </button>
        ),
      },
    ];

    return (
      <>
        <div className="glass-panel m03-filter-panel">
          <div className="m03-filter-fields">
            <div className="m03-field">
              <span className="m03-field-label">所属工区</span>
              <select
                className="glass-select m03-select"
                value={activeSectionId ?? ''}
                onChange={(e) => handleSectionSelect(e.target.value)}
              >
                <option value="">全部工区</option>
                {sections.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">问题类型</span>
              <select
                className="glass-select m03-select"
                value={issueType}
                onChange={(e) => {
                  setIssueType(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部类型</option>
                {typeDefs.map((t) => (
                  <option key={t.name} value={t.name}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">整改状态</span>
              <select
                className="glass-select m03-select"
                value={issueStatus}
                onChange={(e) => {
                  setIssueStatus(e.target.value);
                  setPage(1);
                }}
              >
                <option value="">全部状态</option>
                <option value="整改中">整改中</option>
                <option value="已整改">已整改</option>
                <option value="已超期">已超期</option>
              </select>
            </div>
            <div className="m03-field">
              <span className="m03-field-label">统计周期</span>
              <select
                className="glass-select m03-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {Object.keys(PERIOD_FACTORS).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="m03-filter-actions">
            <button
              type="button"
              className="m03-btn-query"
              onClick={() => {
                setPage(1);
                fetchActiveData();
                showToast('已刷新质量问题整改台账');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button type="button" className="dock-btn m03-btn-outline" onClick={handleReset}>
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
          </div>
        </div>

        <M03KpiSection
          title="质量问题与整改概况"
          periodLabel={pf.label}
          cards={[
            { label: '本期问题', value: fmtInt(totalCount), unit: '项', icon: <ClipboardCheck size={18} /> },
            { label: '已整改', value: fmtInt(doneList.length), unit: '项', icon: <CheckCircle2 size={18} />, tone: 'green' },
            { label: '整改中', value: fmtInt(ingList.length), unit: '项', icon: <Clock size={18} />, tone: 'blue' },
            { label: '已超期', value: fmtInt(overList.length), unit: '项', icon: <AlertTriangle size={18} />, tone: 'gold' },
            { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: <ShieldCheck size={18} />, tone: 'green' },
            { label: '平均整改用时', value: avgDays, unit: '天', icon: <Clock size={18} /> },
          ]}
        />

        <div className="m03-charts-row">
          <GlassPanel
            title="各工区问题数量"
            headerRight={<span className="m03-header-right">单位 项</span>}
            bodyClassName="m03-panel-body-flush"
          >
            <div className="m03-chart-body">
              <BarChartSvg
                idPrefix="iss-cnt"
                items={sections.map((s) => ({
                  secId: s.sectionId,
                  label: s.shortName,
                  value: sectionIssueCounts[s.sectionId] ?? 0,
                }))}
                minY={0}
                maxY={Math.max(4, ...sections.map((s) => sectionIssueCounts[s.sectionId] ?? 0))}
                ticks={[0, 1, 2, 3, 4].map((v) => ({ val: v, label: String(v) }))}
                valueFormatter={(v) => fmtInt(v)}
                activeSecId={activeSectionId}
                onBarClick={handleBarToggle}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="质量问题类型分布" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <DonutChartSvg
                segments={donutSegs}
                centerVal={fmtInt(totalCount)}
                centerUnit="项"
                centerSub="问题总数"
                onSegmentClick={(val) => {
                  setIssueType((prev) => (prev === val ? '' : val));
                  setPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel title="整改进展" bodyClassName="m03-panel-body-flush">
            <div className="m03-chart-body">
              <RingGaugeSvg
                idPrefix="iss-rectify"
                pct={rectifyPct}
                subLabel="整改完成率"
                rows={[
                  { label: '问题总数', value: `${fmtInt(totalCount)} 项`, valColor: '#ffffff' },
                  { label: '已整改', value: `${fmtInt(doneList.length)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
                  { label: '整改中', value: `${fmtInt(ingList.length)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
                  { label: '已超期', value: `${fmtInt(overList.length)} 项`, dotColor: '#f87171', valColor: '#f87171' },
                ]}
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m03-bottom-row">
          <GlassPanel
            title="质量问题台账"
            bodyClassName="m03-panel-body-flush"
            headerRight={
              <div className="m03-quick-pills">
                {['全部', '整改中', '已整改', '已超期'].map((q) => (
                  <button
                    key={q}
                    type="button"
                    className={`m03-qpill ${issueQuick === q ? 'active' : ''}`}
                    onClick={() => {
                      setIssueQuick(q);
                      setPage(1);
                    }}
                  >
                    {q}
                  </button>
                ))}
                <button
                  type="button"
                  className="m03-qpill"
                  onClick={() =>
                    setModalPayload({ kind: 'createIssue', defaultSectionId: activeSectionId })
                  }
                >
                  <Plus size={12} style={{ display: 'inline', marginRight: '3px' }} />
                  上报问题
                </button>
              </div>
            }
          >
            <div className="m03-table-wrap">
              <DataTable
                columns={cols}
                rows={pagedRows}
                rowKey={(r) => r.id}
                emptyText={loading ? '正在加载质量问题台账...' : '当前筛选条件下暂无质量问题记录'}
              />
            </div>
            <PaginationBar
              totalItems={issueRecords.length}
              currentPage={safePage}
              pageSize={pageSize}
              onPageChange={setPage}
            />
          </GlassPanel>

          <GlassPanel title="待整改事项" className="m03-side-panel" bodyClassName="m03-side-body">
            {pendingIssue ? (
              <>
                <div className="m03-pending-card">
                  <div className="m03-pending-top">
                    <span className="m03-pending-code">{pendingIssue.id}</span>
                    <StatusBadge
                      text={pendingIssue.status}
                      tone={pendingIssue.status === '已超期' ? 'danger' : 'info'}
                    />
                  </div>
                  <div className="m03-pending-title">
                    {pendingIssue.section} · {pendingIssue.title}
                  </div>
                  <div className="m03-pending-desc">{pendingIssue.description}</div>
                  <div className="m03-pending-kv">
                    <span className="m03-pending-k">整改责任单位</span>
                    <span className="m03-pending-v">{pendingIssue.unit}</span>
                  </div>
                  <div className="m03-pending-kv">
                    <span className="m03-pending-k">发现时间</span>
                    <span className="m03-pending-v">{pendingIssue.foundAt}</span>
                  </div>
                  <div className="m03-pending-kv">
                    <span className="m03-pending-k">整改期限</span>
                    <span className="m03-pending-v">{pendingIssue.deadline}</span>
                  </div>
                </div>
                <div className="m03-side-footer">
                  <span>待整改 {ingList.length + overList.length} 项</span>
                  <button
                    type="button"
                    className="m03-link-btn"
                    onClick={() => setModalPayload({ kind: 'issue', record: pendingIssue })}
                  >
                    查看详情 &gt;
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="m03-pending-card" style={{ textAlign: 'center', padding: '28px 16px' }}>
                  <div style={{ color: '#4ade80', fontSize: '15px', fontWeight: 700 }}>
                    当前范围已全部整改销号
                  </div>
                  <div style={{ color: '#93b8de', fontSize: '12px' }}>
                    全部质量问题均已完成闭环复验（整改率 100.0%）
                  </div>
                </div>
                <div className="m03-side-footer">
                  <span>待整改 0 项</span>
                  <button
                    type="button"
                    className="m03-link-btn"
                    onClick={() => {
                      setIssueQuick('全部');
                      setPage(1);
                    }}
                  >
                    查看全部 &gt;
                  </button>
                </div>
              </>
            )}
          </GlassPanel>
        </div>
      </>
    );
  }

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      <div className="m03-page">
        {activeSub === 'lab'
          ? renderLab()
          : activeSub === 'mixing'
            ? renderMixing()
            : activeSub === 'pavement'
              ? renderPavement()
              : activeSub === 'beamYard'
                ? renderBeamYard()
                : activeSub === 'issues'
                  ? renderIssues()
                  : renderOverview()}
      </div>

      <QualityModal
        payload={modalPayload}
        sections={sections}
        onClose={() => setModalPayload(null)}
        onJumpToIssues={() => router.push('/quality/issues')}
        onMutated={fetchActiveData}
        showToast={showToast}
      />
    </section>
  );
}
