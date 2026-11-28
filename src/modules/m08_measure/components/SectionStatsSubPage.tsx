'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  Coins,
  ExternalLink,
  FileText,
  Layers,
  LayoutGrid,
  RotateCcw,
  Search,
} from 'lucide-react';
import { DataTable } from '@/components/ui/DataTable';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import { fmtInt, fmtMoney, VerticalBarChartSvg } from '../MeasureCharts';
import type { ActiveModalState } from '../MeasureModals';
import type { MeasureContract, SectionsApiResponse } from '../types';
import { ALL_WORK_ITEMS, DEFAULT_SECTIONS, PERIOD_OPTIONS } from './shared';

export interface SectionStatsSubPageProps {
  onOpenModal: (modal: ActiveModalState) => void;
  onJumpToRawRecord: (
    recId?: string,
    targetPeriod?: string,
    payFilter?: string
  ) => void;
  onJumpToPhysicalCompare: (targetSecId: string) => void;
  onReset: () => void;
  onContractsChange?: (contracts: MeasureContract[]) => void;
}

export function SectionStatsSubPage({
  onOpenModal,
  onJumpToRawRecord,
  onJumpToPhysicalCompare,
  onReset,
  onContractsChange,
}: SectionStatsSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const showToast = usePlatformStore((s) => s.showToast);
  const measureBridge = usePlatformStore((s) => s.measureBridge);
  const patchMeasureBridge = usePlatformStore((s) => s.patchMeasureBridge);

  const { period, sectionContract, sectionItem, sectionSelectedId } =
    measureBridge;

  const [secData, setSecData] = useState<SectionsApiResponse | null>(null);

  const fetchSections = useCallback(async () => {
    const sp = new URLSearchParams();
    if (activeSectionId) sp.set('sectionId', activeSectionId);
    if (sectionContract) sp.set('contract', sectionContract);
    if (sectionItem) sp.set('item', sectionItem);
    sp.set('period', period);

    const res = await fetch(`/api/v1/m08/sections?${sp.toString()}`, {
      cache: 'no-store',
    });
    if (res.ok) {
      const json = (await res.json()) as SectionsApiResponse;
      setSecData(json);
      if (json.contracts?.length) {
        onContractsChange?.(json.contracts);
      }
    }
  }, [
    activeSectionId,
    sectionContract,
    sectionItem,
    period,
    onContractsChange,
  ]);

  useEffect(() => {
    void fetchSections();
  }, [fetchSections]);

  const contracts = secData?.contracts?.length
    ? secData.contracts
    : DEFAULT_SECTIONS;

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
  const maxCur = maxCurRaw <= 2000 ? 2000 : Math.ceil(maxCurRaw / 500) * 500;
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
              value={sectionContract}
              onChange={(e) =>
                patchMeasureBridge({ sectionContract: e.target.value })
              }
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
              value={sectionItem}
              onChange={(e) =>
                patchMeasureBridge({ sectionItem: e.target.value })
              }
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
              onChange={(e) => patchMeasureBridge({ period: e.target.value })}
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
            onClick={onReset}
          >
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={() => onOpenModal({ type: 'originalSystem', record: null })}
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
                      (activeSectionId || sectionSelectedId) === r.sectionId
                        ? 'active'
                        : ''
                    }
                    onClick={() =>
                      patchMeasureBridge({ sectionSelectedId: r.sectionId })
                    }
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
                          onJumpToPhysicalCompare(r.sectionId);
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
              onClick={() => onJumpToRawRecord(undefined, period)}
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
