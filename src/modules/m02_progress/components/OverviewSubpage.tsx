'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { M02DetailItem, M02OverviewResponse } from '../types';
import { M02Icon } from './M02Icon';
import { M02Modal } from './M02Modal';

const TREND_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];

const CATEGORIES_FALLBACK = [
  { key: 'subgrade', name: '路基工程', unit: '万m³', icon: 'subgrade', pct: 72.8, doneQty: 1458.6, isInt: false },
  { key: 'bridge', name: '桥梁工程', unit: 'm³', icon: 'bridge', pct: 63.4, doneQty: 38520.0, isInt: false },
  { key: 'pavement', name: '路面工程', unit: '千m²', icon: 'pavement', pct: 46.7, doneQty: 2803.5, isInt: false },
  { key: 'yard', name: '场站工程', unit: '座', icon: 'yard', pct: 88.9, doneQty: 12, isInt: true },
  { key: 'safetyFac', name: '交安工程', unit: 'km', icon: 'guardrail', pct: 32.5, doneQty: 86.3, isInt: false },
  { key: 'green', name: '绿化工程', unit: '万m²', icon: 'leaf', pct: 28.6, doneQty: 286.0, isInt: false },
];

function fmtNum(val: number, decimals: number) {
  return Number(val).toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

export function OverviewSubpage() {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const showToast = usePlatformStore((s) => s.showToast);

  const [category, setCategory] = useState<string>('all');
  const [month, setMonth] = useState<string>('2026-11');
  const [chartMode, setChartMode] = useState<'period' | 'cum'>('period');
  const [page, setPage] = useState<number>(1);
  const [showAll, setShowAll] = useState<boolean>(false);
  const [detailRow, setDetailRow] = useState<M02DetailItem | null>(null);

  // Hide redundant top-right section pills on overview (inline pills handle it)
  useEffect(() => {
    document.body.classList.add('m02-hide-top-sections');
    return () => {
      document.body.classList.remove('m02-hide-top-sections');
    };
  }, []);

  const overviewUrl = useMemo(() => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? 'all',
      category,
      month,
      page: String(page),
      pageSize: showAll ? 'all' : '6',
    });
    return `/api/v1/m02/overview?${qs.toString()}`;
  }, [activeSectionId, category, month, page, showAll]);

  const { data, loading } = useApiQuery<M02OverviewResponse>(overviewUrl, { staleTimeMs: 15_000 });

  const sections = data?.sections ?? [
    { id: 'sec1', name: '一工区' },
    { id: 'sec2', name: '二工区' },
    { id: 'sec3', name: '三工区' },
    { id: 'sec4', name: '四工区' },
    { id: 'sec5', name: '五工区' },
    { id: 'sec6', name: '六工区' },
  ];

  const kpis = data?.kpis?.length
    ? data.kpis
    : CATEGORIES_FALLBACK.map((c, idx) => ({
        id: `fallback_${c.key}`,
        period: month,
        sectionId: activeSectionId ?? 'all',
        categoryKey: c.key,
        categoryName: c.name,
        unit: c.unit,
        icon: c.icon,
        isInt: c.isInt,
        totalQty: 100,
        doneQty: c.doneQty,
        pct: c.pct,
        sortOrder: idx + 1,
      }));

  const trendPoints = data?.trend?.points ?? [];
  const totalQty = data?.trend?.summary?.totalQty ?? 5872.0;
  const periodQty = data?.trend?.summary?.periodQty ?? 179.6;
  const cumQty = data?.trend?.summary?.cumQty ?? 2729.8;

  const detailRows = data?.details?.rows ?? [];
  const totalDetails = data?.details?.total ?? detailRows.length;
  const totalPages = data?.details?.totalPages ?? 1;
  const activeSecName =
    activeSectionId ? sections.find((s) => s.id === activeSectionId)?.name ?? activeSectionId : null;

  const detailColumns: ColumnDef<M02DetailItem>[] = [
    { key: 'sec', header: '工区', render: (r) => r.sectionName },
    {
      key: 'obj',
      header: '工程对象',
      render: (r) => <strong className="text-white">{r.objectName}</strong>,
    },
    { key: 'cat', header: '工程类别', render: (r) => r.category },
    { key: 'sub', header: '分项指标', render: (r) => r.subItem },
    { key: 'unit', header: '计量单位', render: (r) => r.unit },
    {
      key: 'total',
      header: '总工程量',
      render: (r) => <span className="tabular-nums">{r.totalQty}</span>,
    },
    {
      key: 'cur',
      header: '本期完成量',
      render: (r) => <span className="tabular-nums">{r.periodQty}</span>,
    },
    {
      key: 'cum',
      header: '累计完成量',
      render: (r) => <span className="tabular-nums">{r.cumQty}</span>,
    },
    {
      key: 'pct',
      header: '完成比例',
      render: (r) => (
        <span className="font-bold text-[#38f2ff] tabular-nums">{r.pct.toFixed(1)}%</span>
      ),
    },
    {
      key: 'due',
      header: '统计截止日期',
      render: (r) => <span className="tabular-nums">{r.dueDate}</span>,
    },
    {
      key: 'src',
      header: '来源报表',
      render: (r) => <span className="text-sky-200">{r.sourceReport}</span>,
    },
    {
      key: 'op',
      header: '操作',
      render: (r) => (
        <button
          type="button"
          className="m02-action-link"
          onClick={() => setDetailRow(r)}
        >
          查看详情
        </button>
      ),
    },
  ];

  // Trend SVG geometry
  const W = 700;
  const H = 142;
  const padL = 42;
  const padR = 44;
  const padT = 24;
  const padB = 20;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const isCum = chartMode === 'cum';
  const rawBars = trendPoints.length
    ? trendPoints.map((pt) => (isCum ? pt.cumQty : pt.periodQty))
    : [126.4, 139.2, 155.7, 166.8, 161.9, 179.6];
  const barMonths = trendPoints.length ? trendPoints.map((pt) => pt.period) : TREND_MONTHS;
  const barPcts = trendPoints.length
    ? trendPoints.map((pt) => pt.cumPct)
    : [37.8, 40.9, 44.7, 48.8, 51.8, 55.8];

  const maxBarRaw = Math.max(10, ...rawBars);
  const yMaxBar = isCum
    ? Math.ceil((maxBarRaw * 1.15) / 500) * 500 || 500
    : Math.ceil((maxBarRaw * 1.3) / 50) * 50 || 50;
  const colW = plotW / barMonths.length;
  const barW = Math.min(34, colW * 0.44);
  const linePts = barMonths.map((_, i) => {
    const cx = padL + colW * (i + 0.5);
    const pct = barPcts[i] ?? 0;
    const cy = padT + plotH - (pct / 100) * plotH;
    return { cx, cy, pct };
  });
  const pathD = linePts
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`)
    .join(' ');

  return (
    <div className="m02-page m02-ov-page">
      {/* Top Filter Bar */}
      <div className="m02-filter-bar">
        <div className="m02-filter-row">
          <div className="m02-filter-left">
            <span className="m02-filter-label">工区</span>
            <div className="m02-pill-group">
              <button
                type="button"
                className={`m02-pill-btn ${!activeSectionId ? 'active' : ''}`}
                onClick={() => {
                  setPage(1);
                  setActiveSectionId(null);
                }}
              >
                全线
              </button>
              {sections.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`m02-pill-btn ${activeSectionId === s.id ? 'active' : ''}`}
                  onClick={() => {
                    setPage(1);
                    setActiveSectionId(activeSectionId === s.id ? null : s.id);
                  }}
                >
                  {s.name}
                </button>
              ))}
            </div>
            <span className="m02-vdiv" />
            <span className="m02-filter-label">工程类别</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 132px' }}
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="all">全部</option>
              {CATEGORIES_FALLBACK.map((c) => (
                <option key={c.key} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="m02-filter-label">统计年月</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 120px' }}
              value={month}
              onChange={(e) => {
                const nextM = e.target.value;
                setMonth(nextM);
                showToast(`已切换统计年月：${nextM}`);
              }}
            >
              {TREND_MONTHS.slice()
                .reverse()
                .map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
            </select>
          </div>
          <div className="m02-filter-right">
            <span>
              数据截止 <strong className="text-white">{month}-20</strong>
            </span>
            <span>|</span>
            <span>统计依据</span>
            <button
              type="button"
              className="m02-action-link"
              style={{ padding: 0 }}
              onClick={() => router.push('/progress/report')}
            >
              已发布进度报表
            </button>
          </div>
        </div>
      </div>

      {/* 6 Category KPI Cards */}
      <div className="m02-kpi-6">
        {kpis.map((k) => {
          const doneLabel = k.isInt
            ? `${Math.max(1, Math.round(k.doneQty))} ${k.unit}`
            : `${fmtNum(k.doneQty, 1)} ${k.unit}`;
          const isActive = category === k.categoryName;
          return (
            <button
              key={k.categoryKey}
              type="button"
              className={`m02-kpi-card ${isActive ? 'active' : ''}`}
              onClick={() => {
                setCategory((prev) => (prev === k.categoryName ? 'all' : k.categoryName));
                setPage(1);
              }}
            >
              <div className="m02-kpi-top">
                <span className="m02-kpi-name">
                  <M02Icon name={k.icon} size={16} />
                  <span>{k.categoryName}</span>
                </span>
                <span className="m02-kpi-pct">{k.pct.toFixed(1)}%</span>
              </div>
              <div className="progress-track">
                <div className="progress-fill" style={{ width: `${Math.min(100, k.pct)}%` }} />
              </div>
              <div className="m02-kpi-foot">
                累计完成 <strong>{doneLabel}</strong>
              </div>
            </button>
          );
        })}
      </div>

      {/* Middle Split: Section Progress Matrix + Volume & Trend Chart */}
      <div className="m02-mid-split">
        <GlassPanel
          title="各工区进度汇总"
          bodyClassName="m02-table-wrap"
          headerRight={
            <span className="text-[11.5px] text-[var(--text-sub)]">
              {activeSecName ? `当前聚焦：${activeSecName}` : '点击工区行可联动筛选'}
            </span>
          }
        >
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ minWidth: '68px' }}>工区</th>
                {CATEGORIES_FALLBACK.map((c) => (
                  <th
                    key={c.key}
                    style={{
                      minWidth: '92px',
                      color: category === c.name ? '#fde047' : undefined,
                    }}
                  >
                    {c.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(data?.matrix?.rows ?? []).map((row) => {
                const isSel = activeSectionId === row.sectionId;
                return (
                  <tr
                    key={row.sectionId}
                    className={`m02-row-clickable ${isSel ? 'm02-row-selected' : ''}`}
                    onClick={() => {
                      setPage(1);
                      setActiveSectionId(isSel ? null : row.sectionId);
                    }}
                  >
                    <td className="font-bold text-white">{row.sectionName}</td>
                    {row.values.map((v) => (
                      <td key={v.categoryKey}>
                        <div className="m02-mini-bar">
                          <div className="m02-mini-track">
                            <div className="m02-mini-fill" style={{ width: `${v.pct}%` }} />
                          </div>
                          <span className="m02-mini-val">{v.pct.toFixed(1)}%</span>
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
              {data?.matrix?.allLine?.length ? (
                <tr className="m02-row-summary">
                  <td style={{ color: '#38f2ff' }}>全线汇总</td>
                  {data.matrix.allLine.map((v) => (
                    <td key={v.categoryKey}>
                      <div className="m02-mini-bar">
                        <div className="m02-mini-track">
                          <div className="m02-mini-fill" style={{ width: `${v.pct}%` }} />
                        </div>
                        <span className="m02-mini-val" style={{ color: '#38f2ff' }}>
                          {v.pct.toFixed(1)}%
                        </span>
                      </div>
                    </td>
                  ))}
                </tr>
              ) : null}
            </tbody>
          </table>
        </GlassPanel>

        <GlassPanel
          title="工程量与进展趋势"
          headerRight={
            <span className="text-[11.5px] text-[var(--text-sub)]">
              {activeSecName ?? '全线折算'}
            </span>
          }
        >
          <div className="m02-trend-kpis">
            <div className="m02-trend-box">
              <div className="m02-trend-icon">
                <M02Icon name="layers" size={16} />
              </div>
              <div>
                <div className="m02-trend-label">总工程量</div>
                <div className="m02-trend-val">
                  {fmtNum(totalQty, 1)}
                  <small>万m³ (折算)</small>
                </div>
              </div>
            </div>
            <div className="m02-trend-box">
              <div className="m02-trend-icon">
                <M02Icon name="speed" size={16} />
              </div>
              <div>
                <div className="m02-trend-label">本期完成量</div>
                <div className="m02-trend-val" style={{ color: '#38f2ff' }}>
                  {fmtNum(periodQty, 1)}
                  <small>万m³ (折算)</small>
                </div>
              </div>
            </div>
            <div className="m02-trend-box">
              <div className="m02-trend-icon">
                <M02Icon name="shield" size={16} />
              </div>
              <div>
                <div className="m02-trend-label">累计完成量</div>
                <div className="m02-trend-val">
                  {fmtNum(cumQty, 1)}
                  <small>万m³ (折算)</small>
                </div>
              </div>
            </div>
          </div>

          <div className="m02-chart-toolbar">
            <div className="m02-pill-group">
              <button
                type="button"
                className={`m02-pill-btn ${chartMode === 'period' ? 'active' : ''}`}
                onClick={() => setChartMode('period')}
              >
                本期完成量
              </button>
              <button
                type="button"
                className={`m02-pill-btn ${chartMode === 'cum' ? 'active' : ''}`}
                onClick={() => setChartMode('cum')}
              >
                累计完成量
              </button>
            </div>
            <div className="m02-chart-legend">
              <span className="m02-legend-item">
                <span className="inline-block w-3 h-2 rounded-[2px] bg-[#1d8aff]" />
                {isCum ? '累计完成量' : '本期完成量'}
              </span>
              <span className="m02-legend-item">
                <span className="inline-block w-4 h-0.5 bg-[#38f2ff]" />
                完成比例 (累计)
              </span>
            </div>
          </div>

          <svg className="m02-svg-chart" viewBox={`0 0 ${W} ${H}`}>
            <defs>
              <linearGradient id="m02-barGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.95" />
                <stop offset="100%" stopColor="#0d5bd9" stopOpacity="0.72" />
              </linearGradient>
            </defs>
            <text x={padL - 4} y="11" fill="#8db4dc" fontSize="10.5">
              工程量 (万m³, 折算)
            </text>
            <text x={W - 4} y="11" fill="#8db4dc" fontSize="10.5" textAnchor="end">
              完成比例
            </text>
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const y = padT + (plotH * i) / 5;
              const leftVal = Math.round(yMaxBar * (1 - i / 5));
              const rightVal = Math.round(100 * (1 - i / 5));
              return (
                <g key={i}>
                  <line
                    x1={padL}
                    y1={y}
                    x2={W - padR}
                    y2={y}
                    stroke="rgba(125,211,252,0.16)"
                    strokeDasharray="3 3"
                  />
                  <text
                    x={padL - 7}
                    y={y + 4}
                    fill="#8db4dc"
                    fontSize="10.5"
                    textAnchor="end"
                  >
                    {leftVal}
                  </text>
                  <text
                    x={W - padR + 7}
                    y={y + 4}
                    fill="#8db4dc"
                    fontSize="10.5"
                    textAnchor="start"
                  >
                    {rightVal}%
                  </text>
                </g>
              );
            })}
            {barMonths.map((m, i) => {
              const cx = padL + colW * (i + 0.5);
              const val = rawBars[i] ?? 0;
              const barH = Math.max(4, (val / yMaxBar) * plotH);
              const bx = cx - barW / 2;
              const by = padT + plotH - barH;
              const active = m === month;
              return (
                <g
                  key={m}
                  style={{ cursor: 'pointer' }}
                  onClick={() => {
                    setMonth(m);
                    showToast(`已切换统计年月：${m}`);
                  }}
                >
                  <rect
                    x={bx}
                    y={by}
                    width={barW}
                    height={barH}
                    rx="3"
                    fill="url(#m02-barGrad)"
                    stroke={active ? '#38f2ff' : 'rgba(56,189,248,0.5)'}
                    strokeWidth={active ? 1.5 : 0.8}
                  />
                  <text
                    x={cx}
                    y={by - 5}
                    fill={active ? '#38f2ff' : '#ffffff'}
                    fontSize="11"
                    fontWeight="700"
                    textAnchor="middle"
                  >
                    {val.toFixed(1)}
                  </text>
                  <text
                    x={cx}
                    y={H - 6}
                    fill={active ? '#38f2ff' : '#a9c6e8'}
                    fontSize="11"
                    fontWeight={active ? 700 : 500}
                    textAnchor="middle"
                  >
                    {m}
                  </text>
                </g>
              );
            })}
            <path
              d={pathD}
              fill="none"
              stroke="#38f2ff"
              strokeWidth="2.4"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            {linePts.map((p, i) => (
              <g
                key={barMonths[i]}
                style={{ cursor: 'pointer' }}
                onClick={() => {
                  setMonth(barMonths[i]);
                  showToast(`已切换统计年月：${barMonths[i]}`);
                }}
              >
                <circle
                  cx={p.cx}
                  cy={p.cy}
                  r="4.2"
                  fill="#06214c"
                  stroke="#38f2ff"
                  strokeWidth="2.2"
                />
                <rect
                  x={p.cx - 19}
                  y={p.cy + 7}
                  width="38"
                  height="15"
                  rx="4"
                  fill="rgba(8,32,74,0.85)"
                  stroke="rgba(56,220,255,0.45)"
                  strokeWidth="0.7"
                />
                <text
                  x={p.cx}
                  y={p.cy + 18}
                  fill="#bae6fd"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  {p.pct.toFixed(1)}%
                </text>
              </g>
            ))}
          </svg>
        </GlassPanel>
      </div>

      {/* Bottom Table: 工程进度明细 */}
      <GlassPanel
        title="工程进度明细"
        bodyClassName="m02-table-wrap"
        headerRight={
          <div className="m02-ov-pager">
            <span className="text-[11.5px] text-[var(--text-sub)]">
              {loading ? '同步实时库中...' : `共 ${totalDetails} 条分项明细`}
            </span>
            {totalDetails > 6 ? (
              <>
                {!showAll ? (
                  <>
                    <button
                      type="button"
                      className="m02-ov-page-btn"
                      disabled={page <= 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      ‹
                    </button>
                    <span className="text-[11.5px] text-blue-100 tabular-nums">
                      {page}/{totalPages}
                    </span>
                    <button
                      type="button"
                      className="m02-ov-page-btn"
                      disabled={page >= totalPages}
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    >
                      ›
                    </button>
                  </>
                ) : null}
                <button
                  type="button"
                  className={`m02-ov-page-btn ${showAll ? 'active' : ''}`}
                  onClick={() => {
                    setShowAll((v) => !v);
                    setPage(1);
                  }}
                >
                  {showAll ? '分页显示' : '展开全部'}
                </button>
              </>
            ) : null}
          </div>
        }
      >
        <DataTable
          columns={detailColumns}
          rows={detailRows}
          rowKey={(r) => r.id}
          emptyText="当前筛选条件下暂无工程进度明细"
        />
      </GlassPanel>

      {/* Progress Detail Modal */}
      <M02Modal
        open={!!detailRow}
        title={detailRow ? `工程进度详情 · ${detailRow.objectName}` : ''}
        onClose={() => setDetailRow(null)}
      >
        {detailRow ? (
          <>
            <div className="detail-grid">
              <div className="detail-stat-card">
                <span>所属工区 / 类别</span>
                <strong>
                  {detailRow.sectionName} · {detailRow.category}
                </strong>
              </div>
              <div className="detail-stat-card">
                <span>累计完成比例</span>
                <strong>{detailRow.pct.toFixed(1)}%</strong>
              </div>
              <div className="detail-stat-card">
                <span>累计 / 总工程量</span>
                <strong>
                  {detailRow.cumQty} / {detailRow.totalQty} {detailRow.unit}
                </strong>
              </div>
            </div>
            <table className="data-table">
              <tbody>
                <tr>
                  <th style={{ width: '120px' }}>分项指标</th>
                  <td>{detailRow.subItem}</td>
                  <th style={{ width: '120px' }}>本期完成量</th>
                  <td>
                    {detailRow.periodQty} {detailRow.unit}
                  </td>
                </tr>
                <tr>
                  <th>统计截止日期</th>
                  <td>{detailRow.dueDate}</td>
                  <th>来源报表</th>
                  <td>{detailRow.sourceReport}</td>
                </tr>
                <tr>
                  <th>工程形象状态</th>
                  <td>
                    <StatusBadge
                      text={detailRow.pct >= 100 ? '已完工' : '按计划推进'}
                      tone={detailRow.pct >= 80 ? 'ok' : 'info'}
                    />
                  </td>
                  <th>监理签认</th>
                  <td>已核验归档</td>
                </tr>
              </tbody>
            </table>
            <div className="flex justify-end gap-2.5 mt-1">
              <button
                type="button"
                className="dock-btn"
                onClick={() => {
                  const secId = detailRow.sectionId;
                  setDetailRow(null);
                  router.push(`/progress/report?sectionId=${secId}`);
                }}
              >
                查看对应工区报表
              </button>
              <button
                type="button"
                className="dock-btn primary"
                onClick={() => {
                  const objId = detailRow.poiId || 'bridgeA';
                  const secId = detailRow.sectionId;
                  setDetailRow(null);
                  router.push(`/progress/bim_a?sectionId=${secId}&objectId=${objId}`);
                }}
              >
                进入 BIM 进度模拟
              </button>
            </div>
          </>
        ) : null}
      </M02Modal>
    </div>
  );
}
