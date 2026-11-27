'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  LayoutGrid,
  Layers,
  MapPin,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  fmtInt,
  fmtMoney,
  PairedHorizontalBarSvg,
  StatusDonutChart,
  VerticalBarChartSvg,
} from './MeasureCharts';
import {
  MeasureModalHost,
  statusToBadgeTone,
  type ActiveModalState,
} from './MeasureModals';
import type {
  MeasureContract,
  MeasureRecord,
  OverviewApiResponse,
  PhysicalCompareApiResponse,
  RawRecordsApiResponse,
  SectionsApiResponse,
} from './types';
import './m08.css';

const DEFAULT_SECTIONS: MeasureContract[] = [
  { sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', stakeRange: 'K0+000 ~ K24+500', supervisor: '第一总监办', cumBaseAmount: 10050.4, paidReturnAmount: 1100.0, payReturned: true, sortOrder: 1 },
  { sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', stakeRange: 'K24+500 ~ K48+200', supervisor: '第二总监办', cumBaseAmount: 12864.6, paidReturnAmount: 1520.0, payReturned: true, sortOrder: 2 },
  { sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', stakeRange: 'K48+200 ~ K72+800', supervisor: '第二总监办', cumBaseAmount: 9754.2, paidReturnAmount: 1086.4, payReturned: true, sortOrder: 3 },
  { sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', stakeRange: 'K72+800 ~ K96+000', supervisor: '第三总监办', cumBaseAmount: 11996.8, paidReturnAmount: 1350.1, payReturned: true, sortOrder: 4 },
  { sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', stakeRange: 'K96+000 ~ K121+400', supervisor: '第三总监办', cumBaseAmount: 10742.0, paidReturnAmount: 1262.6, payReturned: true, sortOrder: 5 },
  { sectionId: 'sec6', sectionName: '六工区', contractCode: 'A6合同段', stakeRange: 'K121+400 ~ K146+800', supervisor: '第四总监办', cumBaseAmount: 8174.4, paidReturnAmount: 0, payReturned: false, sortOrder: 6 },
];

const PERIOD_OPTIONS = [
  '2026年11月',
  '2026年10月',
  '2026年09月',
  '2026年08月',
  '2026年07月',
  '2026年06月',
];

const ALL_WORK_ITEMS = [
  '路基土方',
  '桥梁桩基',
  '桥梁预制梁',
  '水稳基层',
  '沥青中面层',
  '路基防护',
];

const MATCHED_WORK_ITEMS = [
  '路基土方',
  '桥梁桩基',
  '桥梁预制梁',
  '水稳基层',
  '沥青中面层',
];

// Cross-subpage state bridge so jumps (e.g. payment tiles -> rawRecords, 查看分项 -> physicalCompare) preserve filters
const bridgeState = {
  period: '2026年11月',
  overviewCaliber: '已确认计量' as '已确认计量' | '全部申报金额',
  overviewStatus: '',
  overviewPage: 1,
  sectionContract: '',
  sectionItem: '',
  sectionSelectedId: 'sec2',
  physFallbackSecId: 'sec2',
  physItemFilter: '',
  physSelectedItem: '路基土方',
  rawStatus: '',
  rawPayStatus: '',
  rawKeyword: '',
  rawSelectedId: 'JL-A2-202611-018',
  rawPage: 1,
};

function dateToPeriod(selectedDate: string): string {
  if (selectedDate.startsWith('2026-10')) return '2026年10月';
  if (selectedDate.startsWith('2026-09')) return '2026年09月';
  if (selectedDate.startsWith('2026-08')) return '2026年08月';
  if (selectedDate.startsWith('2026-07')) return '2026年07月';
  if (selectedDate.startsWith('2026-06')) return '2026年06月';
  return '2026年11月';
}

function buildPaginationPages(totalPages: number, currentPage: number): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const showSet = new Set([1, 2, 3, totalPages, currentPage - 1, currentPage, currentPage + 1]);
  const sorted = Array.from(showSet)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}

export function MeasureModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const pageKey =
    subPageId === 'sectionStats' ||
    subPageId === 'physicalCompare' ||
    subPageId === 'rawRecords'
      ? subPageId
      : 'overview';

  // Period & filter state
  const [period, setPeriod] = useState<string>(bridgeState.period);
  const [ovCaliber, setOvCaliber] = useState<'已确认计量' | '全部申报金额'>(
    bridgeState.overviewCaliber
  );
  const [ovStatusFilter, setOvStatusFilter] = useState<string>(bridgeState.overviewStatus);
  const [ovPage, setOvPage] = useState<number>(bridgeState.overviewPage);

  const [secContract, setSecContract] = useState<string>(bridgeState.sectionContract);
  const [secItem, setSecItem] = useState<string>(bridgeState.sectionItem);
  const [secSelectedRowId, setSecSelectedRowId] = useState<string>(
    activeSectionId || bridgeState.sectionSelectedId
  );

  const [physFallbackSecId, setPhysFallbackSecId] = useState<string>(
    activeSectionId || bridgeState.physFallbackSecId
  );
  const [physItemFilter, setPhysItemFilter] = useState<string>(bridgeState.physItemFilter);
  const [physSelectedItem, setPhysSelectedItem] = useState<string>(
    bridgeState.physSelectedItem
  );

  const [rawStatus, setRawStatus] = useState<string>(bridgeState.rawStatus);
  const [rawPayStatus, setRawPayStatus] = useState<string>(bridgeState.rawPayStatus);
  const [rawKeywordInput, setRawKeywordInput] = useState<string>(bridgeState.rawKeyword);
  const [rawKeywordQuery, setRawKeywordQuery] = useState<string>(bridgeState.rawKeyword);
  const [rawSelectedId, setRawSelectedId] = useState<string>(bridgeState.rawSelectedId);
  const [rawPage, setRawPage] = useState<number>(bridgeState.rawPage);

  // Data state
  const [ovData, setOvData] = useState<OverviewApiResponse | null>(null);
  const [secData, setSecData] = useState<SectionsApiResponse | null>(null);
  const [physData, setPhysData] = useState<PhysicalCompareApiResponse | null>(null);
  const [rawData, setRawData] = useState<RawRecordsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [modal, setModal] = useState<ActiveModalState>(null);

  const prevSelectedDateRef = useRef<string>(selectedDate);

  // Sync Cesium mode -> opaque
  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode, pageKey]);

  // Sync global selectedDate -> period when user clicks top date chip
  useEffect(() => {
    if (prevSelectedDateRef.current !== selectedDate) {
      prevSelectedDateRef.current = selectedDate;
      const mapped = dateToPeriod(selectedDate);
      bridgeState.period = mapped;
      setPeriod(mapped);
      setOvPage(1);
      setRawPage(1);
    }
  }, [selectedDate]);

  // Keep bridgeState updated
  useEffect(() => {
    bridgeState.period = period;
    bridgeState.overviewCaliber = ovCaliber;
    bridgeState.overviewStatus = ovStatusFilter;
    bridgeState.overviewPage = ovPage;
    bridgeState.sectionContract = secContract;
    bridgeState.sectionItem = secItem;
    bridgeState.sectionSelectedId = secSelectedRowId;
    bridgeState.physFallbackSecId = physFallbackSecId;
    bridgeState.physItemFilter = physItemFilter;
    bridgeState.physSelectedItem = physSelectedItem;
    bridgeState.rawStatus = rawStatus;
    bridgeState.rawPayStatus = rawPayStatus;
    bridgeState.rawKeyword = rawKeywordQuery;
    bridgeState.rawSelectedId = rawSelectedId;
    bridgeState.rawPage = rawPage;
  }, [
    period,
    ovCaliber,
    ovStatusFilter,
    ovPage,
    secContract,
    secItem,
    secSelectedRowId,
    physFallbackSecId,
    physItemFilter,
    physSelectedItem,
    rawStatus,
    rawPayStatus,
    rawKeywordQuery,
    rawSelectedId,
    rawPage,
  ]);

  // Sync global activeSectionId side effects
  useEffect(() => {
    setOvPage(1);
    setRawPage(1);
    if (activeSectionId) {
      setSecSelectedRowId(activeSectionId);
      setPhysFallbackSecId(activeSectionId);
    }
  }, [activeSectionId]);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (activeSectionId) sp.set('sectionId', activeSectionId);
      sp.set('period', period);
      sp.set('caliber', ovCaliber);
      if (ovStatusFilter) sp.set('status', ovStatusFilter);
      sp.set('page', String(ovPage));

      const res = await fetch(`/api/v1/m08/overview?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as OverviewApiResponse;
        setOvData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, period, ovCaliber, ovStatusFilter, ovPage]);

  const fetchSections = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (activeSectionId) sp.set('sectionId', activeSectionId);
      if (secContract) sp.set('contract', secContract);
      if (secItem) sp.set('item', secItem);
      sp.set('period', period);

      const res = await fetch(`/api/v1/m08/sections?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as SectionsApiResponse;
        setSecData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, secContract, secItem, period]);

  const physEffectiveSecId = activeSectionId || physFallbackSecId || 'sec2';

  const fetchPhysicalCompare = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set('sectionId', physEffectiveSecId);
      if (physItemFilter) sp.set('item', physItemFilter);
      sp.set('period', period);

      const res = await fetch(`/api/v1/m08/physical-compare?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as PhysicalCompareApiResponse;
        setPhysData(json);
        if (
          json.items.length > 0 &&
          !json.items.some((i) => i.workItem === physSelectedItem)
        ) {
          setPhysSelectedItem(json.items[0].workItem);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [physEffectiveSecId, physItemFilter, period, physSelectedItem]);

  const fetchRawRecords = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (activeSectionId) sp.set('sectionId', activeSectionId);
      sp.set('period', period);
      if (rawStatus) sp.set('status', rawStatus);
      if (rawPayStatus) sp.set('payStatus', rawPayStatus);
      if (rawKeywordQuery.trim()) sp.set('q', rawKeywordQuery.trim());
      sp.set('page', String(rawPage));

      const res = await fetch(`/api/v1/m08/records?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as RawRecordsApiResponse;
        setRawData(json);
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeSectionId,
    period,
    rawStatus,
    rawPayStatus,
    rawKeywordQuery,
    rawPage,
  ]);

  const refreshActivePage = useCallback(() => {
    if (pageKey === 'overview') return fetchOverview();
    if (pageKey === 'sectionStats') return fetchSections();
    if (pageKey === 'physicalCompare') return fetchPhysicalCompare();
    return fetchRawRecords();
  }, [
    pageKey,
    fetchOverview,
    fetchSections,
    fetchPhysicalCompare,
    fetchRawRecords,
  ]);

  useEffect(() => {
    void refreshActivePage();
  }, [refreshActivePage]);

  const contracts = useMemo(() => {
    if (ovData?.contracts?.length) return ovData.contracts;
    if (secData?.contracts?.length) return secData.contracts;
    if (physData?.contracts?.length) return physData.contracts;
    if (rawData?.contracts?.length) return rawData.contracts;
    return DEFAULT_SECTIONS;
  }, [ovData, secData, physData, rawData]);

  // Cross-subpage navigation helpers
  function jumpToRawRecord(recId?: string, targetPeriod?: string, payFilter?: string) {
    if (recId) {
      bridgeState.rawSelectedId = recId;
      setRawSelectedId(recId);
    }
    if (targetPeriod) {
      bridgeState.period = targetPeriod;
      setPeriod(targetPeriod);
    }
    if (payFilter !== undefined) {
      bridgeState.rawPayStatus = payFilter;
      setRawPayStatus(payFilter);
    }
    bridgeState.rawPage = 1;
    setRawPage(1);
    router.push('/measure/rawRecords');
  }

  function jumpToPhysicalCompare(targetSecId: string) {
    bridgeState.physFallbackSecId = targetSecId;
    bridgeState.period = period;
    setPhysFallbackSecId(targetSecId);
    setActiveSectionId(targetSecId);
    router.push('/measure/physicalCompare');
  }

  function handleReset() {
    bridgeState.period = '2026年11月';
    setPeriod('2026年11月');
    if (pageKey === 'overview') {
      setOvCaliber('已确认计量');
      setOvStatusFilter('');
      setOvPage(1);
    } else if (pageKey === 'sectionStats') {
      setSecContract('');
      setSecItem('');
      setSecSelectedRowId('sec2');
    } else if (pageKey === 'physicalCompare') {
      setPhysFallbackSecId('sec2');
      setPhysItemFilter('');
      setPhysSelectedItem('路基土方');
    } else if (pageKey === 'rawRecords') {
      setRawStatus('');
      setRawPayStatus('');
      setRawKeywordInput('');
      setRawKeywordQuery('');
      setRawSelectedId('JL-A2-202611-018');
      setRawPage(1);
    }
    if (activeSectionId) {
      setActiveSectionId(null);
    }
    showToast('已重置计量管理筛选条件');
  }

  async function handlePatchRecord(
    rec: MeasureRecord,
    action: 'audit' | 'confirm' | 'syncPay'
  ) {
    setMutatingId(rec.id);
    try {
      const res = await fetch(`/api/v1/m08/records/${encodeURIComponent(rec.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          showToast('当前账号角色无权执行变更（需管理员/工程师/监理权限）');
        } else {
          showToast(json.error || '操作失败');
        }
        return;
      }
      const actionLabel =
        action === 'audit'
          ? '已提交审核（审核中）'
          : action === 'confirm'
          ? '已确认计量并持久化'
          : `支付回传状态已更新为「${json.record?.payStatus ?? '已同步'}」`;
      showToast(`${rec.id} ${actionLabel}`);
      await fetchRawRecords();
    } finally {
      setMutatingId(null);
    }
  }

  async function handleCreateRecord(payload: {
    sectionId: string;
    workItem: string;
    period: string;
    amount: number;
    status: '已确认' | '审核中' | '待审核';
    payStatus: '已支付' | '办理中' | '待支付' | '未回传';
    qtyDesc: string;
  }): Promise<boolean> {
    const res = await fetch('/api/v1/m08/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const json = await res.json();
    if (!res.ok) {
      if (res.status === 403) {
        showToast('当前账号角色无权新增记录（需管理员/工程师/监理权限）');
      } else {
        showToast(json.error || '新增记录失败');
      }
      return false;
    }
    const created = json.record as MeasureRecord;
    setRawSelectedId(created.id);
    setRawPage(1);
    showToast(`已新增计量记录 ${created.id} 并写入 PostgreSQL`);
    await fetchRawRecords();
    return true;
  }

  // ==================== SUBPAGE 1: OVERVIEW ====================
  function renderOverview() {
    const kpis = ovData?.kpis ?? {
      currentAmt: 8426.8,
      cumAmt: 63582.4,
      totalCount: 36,
      confirmedCount: 24,
      reviewingCount: 8,
      pendingCount: 4,
    };
    const sixPeriods = ovData?.sixPeriods ?? [
      { period: '2026年06月', shortLabel: '6月', value: 6810.3, cumTotal: 6810.3 },
      { period: '2026年07月', shortLabel: '7月', value: 8425.7, cumTotal: 15236.0 },
      { period: '2026年08月', shortLabel: '8月', value: 10985.2, cumTotal: 26221.2 },
      { period: '2026年09月', shortLabel: '9月', value: 13526.4, cumTotal: 39747.6 },
      { period: '2026年10月', shortLabel: '10月', value: 15408.0, cumTotal: 55155.6 },
      { period: '2026年11月', shortLabel: '11月', value: 8426.8, cumTotal: 63582.4 },
    ];
    const barItems = sixPeriods.map((p) => ({
      key: p.period,
      label: p.shortLabel,
      value: p.value,
    }));
    const rawMax = Math.max(...barItems.map((b) => b.value), 100);
    const maxY = activeSectionId
      ? Math.ceil(rawMax / 500) * 500
      : ovCaliber === '全部申报金额'
      ? 18000
      : 16000;
    const ticks = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY].map((v) => ({
      val: v,
      label: Math.round(v).toLocaleString('en-US'),
    }));

    const payment = ovData?.payment ?? {
      paidTotal: 6319.1,
      returnedSections: 5,
      totalSections: 6,
      counts: { 已支付: 12, 办理中: 5, 待支付: 7, 未回传: 12 },
    };

    const recordsPage = ovData?.records ?? {
      rows: [],
      total: 0,
      page: 1,
      pageSize: 5,
      totalPages: 1,
    };

    const attentionItems = ovData?.attentionItems ?? [];
    const pages = buildPaginationPages(recordsPage.totalPages, recordsPage.page);

    return (
      <>
        <div className="glass-panel m08-filter-bar">
          <div className="m08-filter-fields">
            <div className="m08-field">
              <span className="m08-field-label">所属工区</span>
              <select
                className="glass-select m08-select"
                value={activeSectionId ?? ''}
                onChange={(e) => {
                  setOvPage(1);
                  setActiveSectionId(e.target.value || null);
                }}
              >
                <option value="">全部工区</option>
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">计量期次</span>
              <select
                className="glass-select m08-select"
                value={period}
                onChange={(e) => {
                  setOvPage(1);
                  setPeriod(e.target.value);
                }}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">金额口径</span>
              <select
                className="glass-select m08-select"
                value={ovCaliber}
                onChange={(e) => {
                  setOvPage(1);
                  setOvCaliber(
                    e.target.value as '已确认计量' | '全部申报金额'
                  );
                }}
              >
                <option value="已确认计量">已确认计量</option>
                <option value="全部申报金额">全部申报金额</option>
              </select>
            </div>
          </div>
          <div className="m08-filter-actions">
            <button
              type="button"
              className="m08-btn-query"
              onClick={() => {
                setOvPage(1);
                void fetchOverview();
                showToast('已按当前筛选条件刷新计量数据');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={() => setModal({ type: 'originalSystem', record: null })}
            >
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <GlassPanel
          title="计量概况"
          subtitle={`(${period})`}
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="m08-header-meta">
              金额按{ovCaliber}统计 · 截至 {selectedDate}
            </div>
          }
        >
          <div className="m08-kpi-grid cols-4">
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <Coins size={18} />
              </div>
              <KpiCard
                label="本期计量金额"
                value={fmtMoney(kpis.currentAmt)}
                unit="万元"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <Layers size={18} />
              </div>
              <KpiCard
                label="累计计量金额"
                value={fmtMoney(kpis.cumAmt)}
                unit="万元"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <FileText size={18} />
              </div>
              <KpiCard
                label="本期计量记录"
                value={fmtInt(kpis.totalCount)}
                unit="条"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon tone-green">
                <CheckCircle2 size={18} />
              </div>
              <KpiCard
                label="已确认记录"
                value={fmtInt(kpis.confirmedCount)}
                unit="条"
                tone="green"
              />
            </div>
          </div>
        </GlassPanel>

        <div className="m08-grid-3">
          <GlassPanel
            title="近6期计量金额"
            bodyClassName="m08-panel-body-zero"
            headerRight={<div className="m08-header-meta">单位 万元</div>}
          >
            <div className="m08-chart-body">
              <VerticalBarChartSvg
                idPrefix="ov-6p"
                items={barItems}
                maxY={maxY}
                ticks={ticks}
                activeKey={period}
                onBarClick={(p) => {
                  setPeriod(p);
                  setOvPage(1);
                  showToast(`已切换计量期次：${p}`);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="本期计量记录状态"
            bodyClassName="m08-panel-body-zero"
          >
            <div className="m08-chart-body">
              <StatusDonutChart
                segments={[
                  { name: '已确认', count: kpis.confirmedCount, color: '#22c55e' },
                  { name: '审核中', count: kpis.reviewingCount, color: '#0ea5e9' },
                  { name: '待审核', count: kpis.pendingCount, color: '#f59e0b' },
                ]}
                totalCount={kpis.totalCount}
                activeStatus={ovStatusFilter}
                onSelectStatus={(name) => {
                  setOvStatusFilter((prev) => (prev === name ? '' : name));
                  setOvPage(1);
                }}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="原系统支付信息"
            bodyClassName="m08-panel-body-zero"
            headerRight={<div className="m08-header-meta">按支付发生期</div>}
          >
            <div className="m08-pay-body">
              <div className="m08-pay-top">
                <div>
                  <div className="m08-pay-sublabel">本期已回传支付金额</div>
                  <div className="m08-pay-amount">
                    {fmtMoney(payment.paidTotal)}
                    <small>万元</small>
                  </div>
                </div>
                <span className="m08-pill-badge">
                  {payment.returnedSections} / {payment.totalSections} 工区已回传
                </span>
              </div>
              <div className="m08-pay-subhead">
                <span>本期原系统支付状态</span>
                <span>按记录统计</span>
              </div>
              <div className="m08-pay-tiles">
                {(
                  [
                    { label: '已支付', color: '#4ade80' },
                    { label: '办理中', color: '#38bdf8' },
                    { label: '待支付', color: '#facc15' },
                    { label: '未回传', color: '#cbd5e1' },
                  ] as const
                ).map((tile) => (
                  <div
                    key={tile.label}
                    className="m08-pay-tile"
                    onClick={() => {
                      jumpToRawRecord(undefined, period, tile.label);
                      showToast(`已筛选原系统支付状态：${tile.label}`);
                    }}
                  >
                    <div className="m08-pay-tile-name">{tile.label}</div>
                    <div
                      className="m08-pay-tile-val"
                      style={{ color: tile.color }}
                    >
                      {payment.counts[tile.label]}
                      <small>条</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>
        </div>

        <div className="m08-split-overview">
          <GlassPanel
            title="本期计量记录"
            bodyClassName="m08-panel-body-zero"
            headerRight={
              <div className="flex items-center gap-2">
                {ovStatusFilter ? (
                  <button
                    type="button"
                    className="m08-chip-filter"
                    onClick={() => {
                      setOvStatusFilter('');
                      setOvPage(1);
                    }}
                  >
                    状态：{ovStatusFilter} ×
                  </button>
                ) : null}
                <button
                  type="button"
                  className="m08-link-btn"
                  onClick={() => jumpToRawRecord(undefined, period)}
                >
                  查看原始记录 &gt;
                </button>
              </div>
            }
          >
            <div className="m08-table-wrap">
              <table className="data-table m08-table">
                <thead>
                  <tr>
                    <th>原始记录编号</th>
                    <th>所属工区</th>
                    <th>合同段</th>
                    <th>工程分项</th>
                    <th>计量期次</th>
                    <th>记录金额（万元）</th>
                    <th>计量状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {recordsPage.rows.length > 0 ? (
                    recordsPage.rows.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() =>
                          setModal({ type: 'recordDetail', record: r })
                        }
                      >
                        <td className="m08-num">{r.id}</td>
                        <td>{r.sectionName}</td>
                        <td>{r.contractCode}</td>
                        <td>{r.workItem}</td>
                        <td>{r.period}</td>
                        <td className="m08-num">{fmtMoney(r.amount)}</td>
                        <td>
                          <StatusBadge
                            text={r.status}
                            tone={statusToBadgeTone(r.status)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m08-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setModal({ type: 'recordDetail', record: r });
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: 'center',
                          color: '#93b8de',
                          padding: 24,
                        }}
                      >
                        {loading ? '正在加载计量数据...' : '当前筛选条件下暂无计量记录'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="m08-table-foot">
              <span />
              <div className="m08-pager">
                <span style={{ marginRight: 6 }}>
                  共 {fmtInt(recordsPage.total)} 条记录
                </span>
                <button
                  type="button"
                  className="m08-page-btn"
                  disabled={recordsPage.page <= 1}
                  onClick={() => setOvPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>
                {pages.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`e-${idx}`}
                      style={{ padding: '0 3px', color: '#789bc4' }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`m08-page-btn ${
                        p === recordsPage.page ? 'active' : ''
                      }`}
                      onClick={() => setOvPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="m08-page-btn"
                  disabled={recordsPage.page >= recordsPage.totalPages}
                  onClick={() =>
                    setOvPage((p) => Math.min(recordsPage.totalPages, p + 1))
                  }
                >
                  &gt;
                </button>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel
            title="本期关注事项"
            bodyClassName="m08-panel-body-zero"
          >
            <div className="m08-side-body">
              <div className="m08-att-list">
                {attentionItems.length > 0 ? (
                  attentionItems.map((a) => (
                    <div
                      key={a.id + a.kind}
                      className="m08-att-card"
                      onClick={() => jumpToRawRecord(a.id, period)}
                    >
                      <div className="m08-att-left">
                        <div
                          className={`m08-att-ico ${
                            a.cls === 'warn'
                              ? 'warn'
                              : a.cls === 'muted'
                              ? 'muted'
                              : ''
                          }`}
                        >
                          {a.kind === 'clock' ? (
                            <Clock size={16} />
                          ) : a.kind === 'warn' ? (
                            <AlertCircle size={16} />
                          ) : (
                            <RefreshCw size={15} />
                          )}
                        </div>
                        <div>
                          <div className="m08-att-title">{a.title}</div>
                          <div className="m08-att-sub">{a.sub}</div>
                        </div>
                      </div>
                      <StatusBadge
                        text={a.tag}
                        tone={statusToBadgeTone(a.tag)}
                      />
                    </div>
                  ))
                ) : (
                  <div
                    className="m08-att-card"
                    style={{ justifyContent: 'center', color: '#4ade80' }}
                  >
                    当前工区本期关注事项均已闭环
                  </div>
                )}
              </div>
              <div className="m08-side-footer m08-foot-clear">
                <span>同步于 2026-11-26 10:45</span>
                <button
                  type="button"
                  className="m08-link-btn"
                  onClick={() => jumpToRawRecord(undefined, period)}
                >
                  查看记录 &gt;
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // ==================== SUBPAGE 2: SECTION STATS ====================
  function renderSectionStats() {
    const kpis = secData?.kpis ?? {
      sectionCount: 6,
      contractCount: 6,
      totalCurAmt: 8426.8,
      totalCumAmt: 63582.4,
      totalConfirmed: 24,
      totalRecs: 36,
      totalPaid: 6319.1,
      returnedCount: 5,
    };
    const sectionRows = secData?.sectionRows ?? [];
    const chartRows = secData?.allSectionCharts ?? [];

    const maxCurRaw = Math.max(...chartRows.map((x) => x.curAmt), 500);
    const maxCur =
      maxCurRaw <= 2000 ? 2000 : Math.ceil(maxCurRaw / 500) * 500;
    const maxCumRaw = Math.max(...chartRows.map((x) => x.cumAmt), 3500);
    const maxCum =
      maxCumRaw <= 14000 ? 14000 : Math.ceil(maxCumRaw / 3500) * 3500;

    return (
      <>
        <div className="glass-panel m08-filter-bar">
          <div className="m08-filter-fields">
            <div className="m08-field">
              <span className="m08-field-label">所属工区</span>
              <select
                className="glass-select m08-select"
                value={activeSectionId ?? ''}
                onChange={(e) => setActiveSectionId(e.target.value || null)}
              >
                <option value="">全部工区</option>
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">合同段</span>
              <select
                className="glass-select m08-select"
                value={secContract}
                onChange={(e) => setSecContract(e.target.value)}
              >
                <option value="">全部合同段</option>
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.contractCode}>
                    {s.contractCode}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">工程分项</span>
              <select
                className="glass-select m08-select"
                value={secItem}
                onChange={(e) => setSecItem(e.target.value)}
              >
                <option value="">全部接入分项</option>
                {ALL_WORK_ITEMS.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">计量期次</span>
              <select
                className="glass-select m08-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="m08-filter-actions">
            <button
              type="button"
              className="m08-btn-query"
              onClick={() => {
                void fetchSections();
                showToast('已按当前筛选条件刷新工区统计');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={() => setModal({ type: 'originalSystem', record: null })}
            >
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <GlassPanel
          title="工区计量汇总"
          subtitle={`(${period})`}
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="m08-header-meta">
              金额按已确认计量统计 · 截至 {selectedDate}
            </div>
          }
        >
          <div className="m08-kpi-grid cols-5">
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <Layers size={18} />
              </div>
              <KpiCard
                label="纳入统计工区"
                value={fmtInt(kpis.sectionCount)}
                unit="个"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <FileText size={18} />
              </div>
              <KpiCard
                label="合同段"
                value={fmtInt(kpis.contractCount)}
                unit="个"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <Coins size={18} />
              </div>
              <KpiCard
                label="本期计量金额"
                value={fmtMoney(kpis.totalCurAmt)}
                unit="万元"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <LayoutGrid size={18} />
              </div>
              <KpiCard
                label="累计计量金额"
                value={fmtMoney(kpis.totalCumAmt)}
                unit="万元"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon tone-green">
                <CheckCircle2 size={18} />
              </div>
              <KpiCard
                label="已确认记录"
                value={fmtInt(kpis.totalConfirmed)}
                unit="条"
                tone="green"
              />
            </div>
          </div>
        </GlassPanel>

        <div className="m08-grid-2">
          <GlassPanel
            title="各工区本期计量金额"
            bodyClassName="m08-panel-body-zero"
            headerRight={<div className="m08-header-meta">单位 万元</div>}
          >
            <div className="m08-chart-body">
              <VerticalBarChartSvg
                idPrefix="sec-cur"
                items={chartRows.map((x) => ({
                  key: x.sectionId,
                  label: x.sectionName,
                  value: x.curAmt,
                }))}
                maxY={maxCur}
                ticks={[0, 0.25, 0.5, 0.75, 1].map((r) => ({
                  val: maxCur * r,
                  label: Math.round(maxCur * r).toLocaleString('en-US'),
                }))}
                activeKey={activeSectionId}
                onBarClick={(sid) =>
                  setActiveSectionId(activeSectionId === sid ? null : sid)
                }
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title="各工区累计计量金额"
            bodyClassName="m08-panel-body-zero"
            headerRight={<div className="m08-header-meta">单位 万元</div>}
          >
            <div className="m08-chart-body">
              <VerticalBarChartSvg
                idPrefix="sec-cum"
                items={chartRows.map((x) => ({
                  key: x.sectionId,
                  label: x.sectionName,
                  value: x.cumAmt,
                }))}
                maxY={maxCum}
                ticks={[0, 0.25, 0.5, 0.75, 1].map((r) => ({
                  val: maxCum * r,
                  label: Math.round(maxCum * r).toLocaleString('en-US'),
                }))}
                activeKey={activeSectionId}
                onBarClick={(sid) =>
                  setActiveSectionId(activeSectionId === sid ? null : sid)
                }
                gradientMode="teal"
              />
            </div>
          </GlassPanel>
        </div>

        <div className="m08-split-65-35">
          <GlassPanel
            title="工区与合同段计量明细"
            bodyClassName="m08-panel-body-zero"
            headerRight={
              <div className="m08-header-meta">金额按已确认计量统计</div>
            }
          >
            <div className="m08-table-wrap">
              <table className="data-table m08-table">
                <thead>
                  <tr>
                    <th>所属工区</th>
                    <th>合同段</th>
                    <th>本期计量金额 (万元)</th>
                    <th>累计计量金额 (万元)</th>
                    <th>本期记录</th>
                    <th>已确认</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {sectionRows.map((r) => (
                    <tr
                      key={r.sectionId}
                      className={
                        (activeSectionId || secSelectedRowId) === r.sectionId
                          ? 'active'
                          : ''
                      }
                      onClick={() => setSecSelectedRowId(r.sectionId)}
                    >
                      <td>{r.sectionName}</td>
                      <td>{r.contractCode}</td>
                      <td className="m08-num">{fmtMoney(r.curAmt)}</td>
                      <td className="m08-num">{fmtMoney(r.cumAmt)}</td>
                      <td>{r.recCount} 条</td>
                      <td>{r.confirmedCount} 条</td>
                      <td>
                        <button
                          type="button"
                          className="m08-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            jumpToPhysicalCompare(r.sectionId);
                          }}
                        >
                          查看分项
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="m08-table-foot">
              <span>
                合计 {sectionRows.length} 个工区 &nbsp;{' '}
                {fmtInt(kpis.totalRecs)} 条计量记录
              </span>
              <button
                type="button"
                className="m08-link-btn"
                onClick={() => jumpToRawRecord(undefined, period)}
              >
                查看原始记录 &gt;
              </button>
            </div>
          </GlassPanel>

          <GlassPanel
            title="分工区支付信息"
            bodyClassName="m08-panel-body-zero"
            headerRight={<div className="m08-header-meta">原系统回传</div>}
          >
            <div className="m08-pay-body">
              <div className="m08-pay-top">
                <div>
                  <div className="m08-pay-sublabel">本期已回传支付金额</div>
                  <div className="m08-pay-amount">
                    {fmtMoney(kpis.totalPaid)}
                    <small>万元</small>
                  </div>
                </div>
                <span className="m08-pill-badge">
                  {kpis.returnedCount} / {sectionRows.length} 工区已回传
                </span>
              </div>
              <div className="m08-table-wrap" style={{ padding: 0 }}>
                <DataTable
                  rows={sectionRows}
                  rowKey={(r) => r.sectionId}
                  columns={[
                    {
                      key: 'sec',
                      header: '所属工区',
                      render: (r) => r.sectionName,
                    },
                    {
                      key: 'paid',
                      header: '本期支付金额 (万元)',
                      render: (r) => (
                        <span className="m08-num">
                          {r.payReturned ? fmtMoney(r.paidAmt) : '—'}
                        </span>
                      ),
                    },
                    {
                      key: 'status',
                      header: '支付信息状态',
                      render: (r) => (
                        <StatusBadge
                          text={r.payReturned ? '已回传' : '未回传'}
                          tone={r.payReturned ? 'ok' : 'muted'}
                        />
                      ),
                    },
                  ]}
                />
              </div>
            </div>
          </GlassPanel>
        </div>
      </>
    );
  }

  // ==================== SUBPAGE 3: PHYSICAL COMPARE ====================
  function renderPhysicalCompare() {
    const activeContract =
      physData?.contract ??
      contracts.find((c) => c.sectionId === physEffectiveSecId) ??
      contracts[1] ??
      contracts[0];
    const items = physData?.items ?? [];
    const selected =
      items.find((it) => it.workItem === physSelectedItem) ?? items[0] ?? null;

    return (
      <>
        <div className="glass-panel m08-filter-bar">
          <div className="m08-filter-fields">
            <div className="m08-field">
              <span className="m08-field-label">所属工区</span>
              <select
                className="glass-select m08-select"
                value={activeContract.sectionId}
                onChange={(e) => {
                  setPhysFallbackSecId(e.target.value);
                  setActiveSectionId(e.target.value);
                }}
              >
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">合同段</span>
              <select
                className="glass-select m08-select"
                value={activeContract.sectionId}
                onChange={(e) => {
                  setPhysFallbackSecId(e.target.value);
                  setActiveSectionId(e.target.value);
                }}
              >
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.contractCode}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">工程分项</span>
              <select
                className="glass-select m08-select"
                value={physItemFilter}
                onChange={(e) => setPhysItemFilter(e.target.value)}
              >
                <option value="">全部匹配分项</option>
                {MATCHED_WORK_ITEMS.map((it) => (
                  <option key={it} value={it}>
                    {it}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">计量期次</span>
              <select
                className="glass-select m08-select"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="m08-filter-actions">
            <button
              type="button"
              className="m08-btn-query"
              onClick={() => {
                void fetchPhysicalCompare();
                showToast('已刷新实物进度与计量对照');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={() => setModal({ type: 'originalSystem', record: null })}
            >
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <div className="glass-panel m08-scope-banner">
          <div className="m08-scope-left">
            <div className="m08-scope-ico">
              <MapPin size={16} />
            </div>
            <div>
              <div className="m08-scope-title">
                {activeContract.sectionName} · {activeContract.contractCode}
              </div>
              <div className="m08-scope-sub">
                同一工程范围 &nbsp; {items.length} 个匹配分项（
                {activeContract.stakeRange}）
              </div>
            </div>
          </div>
          <div className="m08-scope-right">
            <span>计量统计截至 {selectedDate}</span>
            <span>实物审核截至 {selectedDate}</span>
            <StatusBadge text="范围与日期已匹配" tone="ok" />
          </div>
        </div>

        <div className="m08-split-compare">
          <GlassPanel
            title="各分项工程量比例对照"
            bodyClassName="m08-panel-body-zero"
            headerRight={
              <div className="m08-compare-legend">
                <span>
                  <i
                    className="m08-legend-dot"
                    style={{ background: '#38bdf8' }}
                  />
                  累计计量比例
                </span>
                <span>
                  <i
                    className="m08-legend-dot"
                    style={{ background: '#4ade80' }}
                  />
                  实物完成率
                </span>
              </div>
            }
          >
            <div style={{ padding: '10px 14px 12px' }}>
              <PairedHorizontalBarSvg
                items={items}
                selectedItem={selected?.workItem ?? ''}
                onPickItem={(w) => setPhysSelectedItem(w)}
              />
            </div>
          </GlassPanel>

          <GlassPanel
            title={`选中分项 · ${selected ? selected.workItem : '—'}`}
            bodyClassName="m08-panel-body-zero"
            headerRight={
              <span className="m08-pill-badge">
                {activeContract.contractCode}
              </span>
            }
          >
            {selected ? (
              <div className="m08-selected-body">
                <div className="m08-stat-duo">
                  <div className="m08-stat-box">
                    <div className="m08-stat-box-label">累计计量工程量</div>
                    <div className="m08-stat-box-val">
                      {selected.measuredQty}
                      <small>{selected.unit}</small>
                    </div>
                  </div>
                  <div className="m08-stat-box green">
                    <div className="m08-stat-box-label">经审核实物完成量</div>
                    <div className="m08-stat-box-val">
                      {selected.physicalQty}
                      <small>{selected.unit}</small>
                    </div>
                  </div>
                </div>
                <div className="m08-kv-list">
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">合同工程量</span>
                    <span className="m08-kv-v">
                      {selected.contractQty} {selected.unit}
                    </span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">实物完成率</span>
                    <span className="m08-kv-v">
                      {selected.physicalPct.toFixed(1)}%
                    </span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">数量差额</span>
                    <span className="m08-kv-v">
                      {selected.diffQty} {selected.unit}
                    </span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">本期计量金额</span>
                    <span className="m08-kv-v">
                      {fmtMoney(selected.periodAmount)} 万元
                    </span>
                  </div>
                </div>
                <div className="m08-side-footer">
                  <span
                    className="m08-num"
                    style={{ color: '#93b8de', fontWeight: 500 }}
                  >
                    {selected.linkedRecordId}
                  </span>
                  <button
                    type="button"
                    className="m08-link-btn"
                    onClick={() =>
                      jumpToRawRecord(selected.linkedRecordId, period)
                    }
                  >
                    查看原始记录 &gt;
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="m08-selected-body"
                style={{ color: '#93b8de', textAlign: 'center' }}
              >
                {loading ? '正在加载分项对照...' : '暂无匹配分项'}
              </div>
            )}
          </GlassPanel>
        </div>

        <GlassPanel
          title="同范围计量与实物明细"
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="m08-header-meta">匹配 {items.length} 项</div>
          }
        >
          <div className="m08-table-wrap">
            <table className="data-table m08-table">
              <thead>
                <tr>
                  <th>工程分项</th>
                  <th>合同工程量</th>
                  <th>累计计量工程量</th>
                  <th>经审核实物完成量</th>
                  <th>实物完成率</th>
                  <th>数量差额¹</th>
                  <th>本期计量金额 (万元)</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr
                    key={it.workItem}
                    className={
                      selected?.workItem === it.workItem ? 'active' : ''
                    }
                    onClick={() => setPhysSelectedItem(it.workItem)}
                  >
                    <td>{it.workItem}</td>
                    <td>
                      {it.contractQty} {it.unit}
                    </td>
                    <td>
                      {it.measuredQty} {it.unit}
                    </td>
                    <td>
                      {it.physicalQty} {it.unit}
                    </td>
                    <td className="m08-num" style={{ color: '#4ade80' }}>
                      {it.physicalPct.toFixed(1)}%
                    </td>
                    <td>
                      {it.diffQty} {it.unit}
                    </td>
                    <td className="m08-num">{fmtMoney(it.periodAmount)}</td>
                    <td>
                      <button
                        type="button"
                        className="m08-link-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModal({
                            type: 'physicalItem',
                            contract: activeContract,
                            item: it,
                            period,
                          });
                        }}
                      >
                        查看
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="m08-footnotes">
            <span>¹ 数量差额为经审核实物完成量减累计计量工程量</span>
            <span>工程量比例以各分项合同工程量为基准</span>
          </div>
        </GlassPanel>
      </>
    );
  }

  // ==================== SUBPAGE 4: RAW RECORDS ====================
  function renderRawRecords() {
    const summary = rawData?.summary ?? {
      total: 36,
      confirmed: 24,
      reviewing: 8,
      pending: 4,
    };
    const rows = rawData?.rows ?? [];
    const total = rawData?.total ?? 0;
    const currentPage = rawData?.page ?? 1;
    const totalPages = rawData?.totalPages ?? 1;
    const pages = buildPaginationPages(totalPages, currentPage);

    const selected =
      rows.find((r) => r.id === rawSelectedId) ?? rows[0] ?? null;
    const isMutating = selected ? mutatingId === selected.id : false;

    return (
      <>
        <div className="glass-panel m08-filter-bar">
          <div className="m08-filter-fields">
            <div className="m08-field">
              <span className="m08-field-label">所属工区</span>
              <select
                className="glass-select m08-select"
                value={activeSectionId ?? ''}
                onChange={(e) => {
                  setRawPage(1);
                  setActiveSectionId(e.target.value || null);
                }}
              >
                <option value="">全部工区</option>
                {contracts.map((s) => (
                  <option key={s.sectionId} value={s.sectionId}>
                    {s.sectionName}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">计量期次</span>
              <select
                className="glass-select m08-select"
                value={period}
                onChange={(e) => {
                  setRawPage(1);
                  setPeriod(e.target.value);
                }}
              >
                {PERIOD_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">计量状态</span>
              <select
                className="glass-select m08-select"
                value={rawStatus}
                onChange={(e) => {
                  setRawPage(1);
                  setRawStatus(e.target.value);
                }}
              >
                <option value="">全部状态</option>
                <option value="已确认">已确认</option>
                <option value="审核中">审核中</option>
                <option value="待审核">待审核</option>
              </select>
            </div>
            <div className="m08-field">
              <span className="m08-field-label">关键词</span>
              <div className="m08-search-wrap">
                <span className="m08-search-ico">
                  <Search size={14} />
                </span>
                <input
                  className="m08-input"
                  type="text"
                  value={rawKeywordInput}
                  placeholder="原始编号 / 合同段 / 分项"
                  onChange={(e) => setRawKeywordInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      setRawPage(1);
                      setRawKeywordQuery(rawKeywordInput);
                    }
                  }}
                />
              </div>
            </div>
          </div>
          <div className="m08-filter-actions">
            <button
              type="button"
              className="m08-btn-query"
              onClick={() => {
                setRawPage(1);
                setRawKeywordQuery(rawKeywordInput);
                void fetchRawRecords();
                showToast('已按当前筛选条件刷新原始记录');
              }}
            >
              <Search size={14} />
              <span>查询</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={handleReset}
            >
              <RotateCcw size={14} />
              <span>重置</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={() => setModal({ type: 'newRecord' })}
            >
              <Plus size={14} />
              <span>新增记录</span>
            </button>
            <button
              type="button"
              className="dock-btn m08-btn-outline"
              onClick={() => setModal({ type: 'originalSystem', record: null })}
            >
              <ExternalLink size={14} />
              <span>进入原系统</span>
            </button>
          </div>
        </div>

        <GlassPanel
          title="本期计量记录"
          subtitle={`(${period})`}
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="m08-header-meta">统计截止 {selectedDate}</div>
          }
        >
          <div className="m08-kpi-grid cols-4">
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon">
                <FileText size={18} />
              </div>
              <KpiCard
                label="全部记录"
                value={fmtInt(summary.total)}
                unit="条"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon tone-green">
                <CheckCircle2 size={18} />
              </div>
              <KpiCard
                label="已确认"
                value={fmtInt(summary.confirmed)}
                unit="条"
                tone="green"
              />
            </div>
            <div className="m08-kpi-card tone-blue">
              <div className="m08-kpi-icon tone-blue">
                <Clock size={18} />
              </div>
              <KpiCard
                label="审核中"
                value={fmtInt(summary.reviewing)}
                unit="条"
              />
            </div>
            <div className="m08-kpi-card">
              <div className="m08-kpi-icon tone-gold">
                <AlertCircle size={18} />
              </div>
              <KpiCard
                label="待审核"
                value={fmtInt(summary.pending)}
                unit="条"
                tone="gold"
              />
            </div>
          </div>
        </GlassPanel>

        <div className="m08-split-65-35">
          <GlassPanel
            title="原始计量记录"
            bodyClassName="m08-panel-body-zero"
            headerRight={
              <div className="flex items-center gap-2">
                {rawPayStatus ? (
                  <button
                    type="button"
                    className="m08-chip-filter"
                    onClick={() => {
                      setRawPayStatus('');
                      setRawPage(1);
                    }}
                  >
                    支付：{rawPayStatus} ×
                  </button>
                ) : null}
                <div className="m08-header-meta">来源 计量支付原系统</div>
              </div>
            }
          >
            <div className="m08-table-wrap">
              <table className="data-table m08-table">
                <thead>
                  <tr>
                    <th>原始记录编号</th>
                    <th>工区 / 合同段</th>
                    <th>工程分项</th>
                    <th>计量期次</th>
                    <th>记录金额（万元）</th>
                    <th>计量状态</th>
                    <th>原系统支付状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length > 0 ? (
                    rows.map((r) => (
                      <tr
                        key={r.id}
                        className={selected?.id === r.id ? 'active' : ''}
                        onClick={() => setRawSelectedId(r.id)}
                      >
                        <td className="m08-num">{r.id}</td>
                        <td>
                          <div style={{ fontWeight: 600, color: '#f1f7ff' }}>
                            {r.sectionName}
                          </div>
                          <div style={{ fontSize: 11, color: '#8fb4da' }}>
                            {r.contractCode}
                          </div>
                        </td>
                        <td>{r.workItem}</td>
                        <td>{r.period}</td>
                        <td className="m08-num">{fmtMoney(r.amount)}</td>
                        <td>
                          <StatusBadge
                            text={r.status}
                            tone={statusToBadgeTone(r.status)}
                          />
                        </td>
                        <td>
                          <StatusBadge
                            text={r.payStatus}
                            tone={statusToBadgeTone(r.payStatus)}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m08-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setRawSelectedId(r.id);
                              setModal({ type: 'recordDetail', record: r });
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={8}
                        style={{
                          textAlign: 'center',
                          color: '#93b8de',
                          padding: 24,
                        }}
                      >
                        {loading ? '正在加载原始记录...' : '当前筛选条件下暂无原始计量记录'}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="m08-table-foot">
              <span />
              <div className="m08-pager">
                <span style={{ marginRight: 6 }}>
                  共 {fmtInt(total)} 条原始记录
                </span>
                <button
                  type="button"
                  className="m08-page-btn"
                  disabled={currentPage <= 1}
                  onClick={() => setRawPage((p) => Math.max(1, p - 1))}
                >
                  &lt;
                </button>
                {pages.map((p, idx) =>
                  p === 'ellipsis' ? (
                    <span
                      key={`e-${idx}`}
                      style={{ padding: '0 3px', color: '#789bc4' }}
                    >
                      ...
                    </span>
                  ) : (
                    <button
                      key={p}
                      type="button"
                      className={`m08-page-btn ${
                        p === currentPage ? 'active' : ''
                      }`}
                      onClick={() => setRawPage(p)}
                    >
                      {p}
                    </button>
                  )
                )}
                <button
                  type="button"
                  className="m08-page-btn"
                  disabled={currentPage >= totalPages}
                  onClick={() => setRawPage((p) => Math.min(totalPages, p + 1))}
                >
                  &gt;
                </button>
              </div>
            </div>
          </GlassPanel>

          <GlassPanel
            title="原始记录详情"
            bodyClassName="m08-panel-body-zero"
          >
            {selected ? (
              <div className="m08-side-body">
                <div className="m08-raw-head">
                  <span className="m08-raw-id">{selected.id}</span>
                  <StatusBadge
                    text={selected.status}
                    tone={statusToBadgeTone(selected.status)}
                  />
                </div>

                <div className="m08-kv-list">
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">计量期次</span>
                    <span className="m08-kv-v">{selected.period}</span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">所属工区 / 合同段</span>
                    <span className="m08-kv-v">
                      {selected.sectionName} · {selected.contractCode}
                    </span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">工程分项</span>
                    <span className="m08-kv-v">{selected.workItem}</span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">原系统记录金额</span>
                    <span className="m08-kv-v">
                      {fmtMoney(selected.amount)} 万元
                    </span>
                  </div>
                </div>

                <div className="m08-subcard">
                  <div className="m08-subcard-title">
                    <span>原系统支付信息</span>
                    <StatusBadge
                      text={selected.payStatus}
                      tone={statusToBadgeTone(selected.payStatus)}
                    />
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">已回传支付金额</span>
                    <span className="m08-kv-v">
                      {selected.paidAmount > 0
                        ? `${fmtMoney(selected.paidAmount)} 万元`
                        : '—'}
                    </span>
                  </div>
                  <div className="m08-kv-row">
                    <span className="m08-kv-k">支付信息回传时间</span>
                    <span className="m08-kv-v">{selected.payTime}</span>
                  </div>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    fontSize: 12,
                    color: '#93b8de',
                    marginTop: 2,
                  }}
                >
                  <span style={{ fontWeight: 700, color: '#dbeafe' }}>
                    可获取附件
                  </span>
                  <span>2 份</span>
                </div>

                <div className="m08-attach-list">
                  <div className="m08-attach-item">
                    <div className="m08-attach-left">
                      <span className="m08-attach-ico">
                        <FileText size={16} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="m08-attach-name">
                          {selected.contractCode}计量确认单.pdf
                        </div>
                        <div className="m08-attach-sub">计量确认单</div>
                      </div>
                    </div>
                    <div className="m08-attach-right">
                      <span className="m08-ext-tag">PDF</span>
                      <button
                        type="button"
                        className="m08-link-btn"
                        onClick={() =>
                          setModal({
                            type: 'attachment',
                            record: selected,
                            fileType: 'pdf',
                          })
                        }
                      >
                        查阅 <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="m08-attach-item">
                    <div className="m08-attach-left">
                      <span className="m08-attach-ico">
                        <FileSpreadsheet size={16} />
                      </span>
                      <div style={{ minWidth: 0 }}>
                        <div className="m08-attach-name">
                          {selected.workItem}计量计算表.xlsx
                        </div>
                        <div className="m08-attach-sub">工程量计算</div>
                      </div>
                    </div>
                    <div className="m08-attach-right">
                      <span className="m08-ext-tag">XLSX</span>
                      <button
                        type="button"
                        className="m08-link-btn"
                        onClick={() =>
                          setModal({
                            type: 'attachment',
                            record: selected,
                            fileType: 'xlsx',
                          })
                        }
                      >
                        查阅 <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>

                {period === '2026年11月' &&
                (selected.status !== '已确认' ||
                  selected.payStatus !== '已支付') ? (
                  <div className="m08-action-strip">
                    {selected.status === '待审核' ? (
                      <button
                        type="button"
                        className="dock-btn"
                        disabled={isMutating}
                        onClick={() => void handlePatchRecord(selected, 'audit')}
                      >
                        <ShieldCheck size={13} />
                        <span>提交审核</span>
                      </button>
                    ) : null}
                    {selected.status !== '已确认' ? (
                      <button
                        type="button"
                        className="m08-btn-query"
                        disabled={isMutating}
                        onClick={() =>
                          void handlePatchRecord(selected, 'confirm')
                        }
                      >
                        <Check size={13} />
                        <span>确认计量</span>
                      </button>
                    ) : null}
                    {selected.payStatus !== '已支付' ? (
                      <button
                        type="button"
                        className="dock-btn"
                        disabled={isMutating}
                        onClick={() =>
                          void handlePatchRecord(selected, 'syncPay')
                        }
                      >
                        <RefreshCw size={13} />
                        <span>同步支付回传</span>
                      </button>
                    ) : null}
                  </div>
                ) : null}

                <div className="m08-side-footer">
                  <span>同步于 {selected.syncTime}</span>
                  <button
                    type="button"
                    className="dock-btn primary"
                    onClick={() =>
                      setModal({ type: 'originalSystem', record: selected })
                    }
                  >
                    <ExternalLink size={14} />
                    <span>查看原系统记录</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                className="m08-side-body"
                style={{
                  textAlign: 'center',
                  color: '#93b8de',
                  padding: '30px 14px',
                }}
              >
                暂无匹配的原始记录详情
              </div>
            )}
          </GlassPanel>
        </div>
      </>
    );
  }

  return (
    <section
      id="moduleStageHost"
      className="module-stage-host active mode-opaque"
    >
      <div className="m08-page">
        {pageKey === 'sectionStats'
          ? renderSectionStats()
          : pageKey === 'physicalCompare'
          ? renderPhysicalCompare()
          : pageKey === 'rawRecords'
          ? renderRawRecords()
          : renderOverview()}
      </div>

      <MeasureModalHost
        modal={modal}
        contracts={contracts}
        currentPeriod={period}
        onClose={() => setModal(null)}
        onJumpToRawRecord={(recId, targetPeriod) =>
          jumpToRawRecord(recId, targetPeriod)
        }
        onOpenAttachment={(rec, fileType) =>
          setModal({ type: 'attachment', record: rec, fileType })
        }
        onCreateRecord={handleCreateRecord}
      />
    </section>
  );
}
