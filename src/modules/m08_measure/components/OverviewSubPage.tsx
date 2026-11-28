'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Coins,
  ExternalLink,
  FileText,
  Layers,
  RefreshCw,
  RotateCcw,
  Search,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  fmtInt,
  fmtMoney,
  StatusDonutChart,
  VerticalBarChartSvg,
} from '../MeasureCharts';
import type { ActiveModalState } from '../MeasureModals';
import type { MeasureContract, OverviewApiResponse } from '../types';
import {
  buildPaginationPages,
  DEFAULT_SECTIONS,
  PERIOD_OPTIONS,
  statusToBadgeTone,
} from './shared';

export interface OverviewSubPageProps {
  onOpenModal: (modal: ActiveModalState) => void;
  onJumpToRawRecord: (
    recId?: string,
    targetPeriod?: string,
    payFilter?: string
  ) => void;
  onReset: () => void;
  onContractsChange?: (contracts: MeasureContract[]) => void;
}

export function OverviewSubPage({
  onOpenModal,
  onJumpToRawRecord,
  onReset,
  onContractsChange,
}: OverviewSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const showToast = usePlatformStore((s) => s.showToast);
  const measureBridge = usePlatformStore((s) => s.measureBridge);
  const patchMeasureBridge = usePlatformStore((s) => s.patchMeasureBridge);

  const { period, overviewCaliber, overviewStatus, overviewPage } =
    measureBridge;

  const [ovData, setOvData] = useState<OverviewApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (activeSectionId) sp.set('sectionId', activeSectionId);
      sp.set('period', period);
      sp.set('caliber', overviewCaliber);
      if (overviewStatus) sp.set('status', overviewStatus);
      sp.set('page', String(overviewPage));

      const res = await fetch(`/api/v1/m08/overview?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as OverviewApiResponse;
        setOvData(json);
        if (json.contracts?.length) {
          onContractsChange?.(json.contracts);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeSectionId,
    period,
    overviewCaliber,
    overviewStatus,
    overviewPage,
    onContractsChange,
  ]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const contracts = ovData?.contracts?.length
    ? ovData.contracts
    : DEFAULT_SECTIONS;

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
    : overviewCaliber === '全部申报金额'
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
                patchMeasureBridge({ overviewPage: 1 });
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
                patchMeasureBridge({
                  overviewPage: 1,
                  period: e.target.value,
                });
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
              value={overviewCaliber}
              onChange={(e) => {
                patchMeasureBridge({
                  overviewPage: 1,
                  overviewCaliber: e.target.value as '已确认计量' | '全部申报金额',
                });
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
              if (overviewPage !== 1) {
                patchMeasureBridge({ overviewPage: 1 });
              } else {
                void fetchOverview();
              }
              showToast('已按当前筛选条件刷新计量数据');
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
        title="计量概况"
        subtitle={`(${period})`}
        bodyClassName="m08-panel-body-zero"
        headerRight={
          <div className="m08-header-meta">
            金额按{overviewCaliber}统计 · 截至 {selectedDate}
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
                patchMeasureBridge({ period: p, overviewPage: 1 });
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
              activeStatus={overviewStatus}
              onSelectStatus={(name) => {
                patchMeasureBridge({
                  overviewStatus: overviewStatus === name ? '' : name,
                  overviewPage: 1,
                });
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
                    onJumpToRawRecord(undefined, period, tile.label);
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
              {overviewStatus ? (
                <button
                  type="button"
                  className="m08-chip-filter"
                  onClick={() => {
                    patchMeasureBridge({ overviewStatus: '', overviewPage: 1 });
                  }}
                >
                  状态：{overviewStatus} ×
                </button>
              ) : null}
              <button
                type="button"
                className="m08-link-btn"
                onClick={() => onJumpToRawRecord(undefined, period)}
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
                        onOpenModal({ type: 'recordDetail', record: r })
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
                            onOpenModal({ type: 'recordDetail', record: r });
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
                onClick={() =>
                  patchMeasureBridge({
                    overviewPage: Math.max(1, overviewPage - 1),
                  })
                }
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
                    onClick={() => patchMeasureBridge({ overviewPage: p })}
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
                  patchMeasureBridge({
                    overviewPage: Math.min(
                      recordsPage.totalPages,
                      overviewPage + 1
                    ),
                  })
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
                    onClick={() => onJumpToRawRecord(a.id, period)}
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
                onClick={() => onJumpToRawRecord(undefined, period)}
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
