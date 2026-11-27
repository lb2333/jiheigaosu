'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FlaskConical,
  Layers,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MaterialDonutSvg, SectionBarChartSvg, type DonutSegment, type SectionBarStat } from '../MaterialSvgs';
import { InventoryDetailModal } from '../MaterialModals';
import {
  DEFAULT_YARDS,
  MATERIAL_PERIODS,
  MATERIAL_TYPES,
  fmtNum,
  statusTone,
  type MaterialFocusAlert,
  type MaterialInventoryDTO,
  type MaterialYardDTO,
} from '../types';

interface OverviewResponse {
  period: string;
  cutoff: string;
  syncTime: string;
  yards: MaterialYardDTO[];
  kpis: {
    planQty: number;
    arrivalQty: number;
    physicalQty: number;
    usableQty: number;
    gapQty: number;
    pendingBatches: number;
  };
  sectionBars: SectionBarStat[];
  gapBreakdown: DonutSegment[];
  donutGapTotal: number;
  batchSegments: DonutSegment[];
  batchTotal: number;
  focusAlerts: MaterialFocusAlert[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  items: MaterialInventoryDTO[];
}

const INITIAL_OVERVIEW: OverviewResponse = {
  period: '2026年11月',
  cutoff: '2026-11-26 10:40',
  syncTime: '2026-11-26 10:52',
  yards: DEFAULT_YARDS,
  kpis: {
    planQty: 127890,
    arrivalQty: 100150,
    physicalQty: 33370,
    usableQty: 32555,
    gapQty: 27740,
    pendingBatches: 6,
  },
  sectionBars: [
    { sectionId: 'sec1', sectionName: '一工区', planW: 2.11, arrivalW: 1.7 },
    { sectionId: 'sec2', sectionName: '二工区', planW: 2.45, arrivalW: 1.83 },
    { sectionId: 'sec3', sectionName: '三工区', planW: 2.12, arrivalW: 1.7 },
    { sectionId: 'sec4', sectionName: '四工区', planW: 2.3, arrivalW: 1.8 },
    { sectionId: 'sec5', sectionName: '五工区', planW: 1.95, arrivalW: 1.55 },
    { sectionId: 'sec6', sectionName: '六工区', planW: 1.86, arrivalW: 1.44 },
  ],
  gapBreakdown: [
    { name: '碎石', value: 13500, color: '#3b82f6', pct: '48.7' },
    { name: '机制砂', value: 7340, color: '#22d3ee', pct: '26.5' },
    { name: '水泥', value: 3890, color: '#2dd4bf', pct: '14.0' },
    { name: '矿粉', value: 1420, color: '#facc15', pct: '5.1' },
    { name: '钢筋', value: 1590, color: '#a78bfa', pct: '5.7' },
  ],
  donutGapTotal: 27740,
  batchSegments: [
    { name: '检验合格', value: 41, color: '#22c55e', pct: '82.0' },
    { name: '待检', value: 6, color: '#facc15', pct: '12.0' },
    { name: '复检中', value: 2, color: '#38bdf8', pct: '4.0' },
    { name: '不合格', value: 1, color: '#f87171', pct: '2.0' },
  ],
  batchTotal: 50,
  focusAlerts: [
    {
      id: 'fa1',
      sectionId: 'sec2',
      material: '碎石',
      title: '二工区 · 碎石缺口',
      sub: '料场示例A 缺口 3,250 t',
      btnText: '查缺口',
      kind: 'warn',
      action: 'yard',
    },
    {
      id: 'fa2',
      sectionId: 'sec4',
      material: '碎石',
      title: '四工区 · 碎石缺口',
      sub: '料场示例B 缺口 2,750 t',
      btnText: '查缺口',
      kind: 'warn',
      action: 'yard',
    },
    {
      id: 'fa3',
      sectionId: 'sec2',
      material: '钢筋',
      title: '二工区 · 钢筋隔离',
      sub: '料场示例A 隔离 40 t',
      btnText: '查检验',
      kind: 'danger',
      action: 'inspect',
      batchId: 'BM-JC-20261125-006',
    },
  ],
  total: 30,
  page: 1,
  pageSize: 5,
  totalPages: 6,
  items: [
    {
      id: '2026年11月_inv-sec2-ss',
      baseId: 'inv-sec2-ss',
      period: '2026年11月',
      sectionId: 'sec2',
      sectionName: '二工区',
      yardId: 'yd-2',
      yardName: '料场示例A',
      material: '碎石',
      spec: '5–20 mm',
      planQty: 12000,
      arrivalQty: 8750,
      physicalQty: 3020,
      quarantineQty: 260,
      usableQty: 2760,
      gapQty: 3250,
      status: '部分待检',
      batchCounts: { pass: 5, pending: 2, recheck: 0, fail: 0 },
      sortOrder: 1,
    },
  ],
};

export function OverviewSubPage({
  activeSectionId,
  period,
  onSectionChange,
  onPeriodChange,
  onNavigate,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  onSectionChange: (secId: string | null) => void;
  onPeriodChange: (period: string) => void;
  onNavigate: (
    subPage: 'yard' | 'inspect',
    opts?: { sectionId?: string; material?: string; batchId?: string }
  ) => void;
  showToast: (msg: string) => void;
}) {
  const [yardId, setYardId] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [selectedInvId, setSelectedInvId] = useState<string>('2026年11月_inv-sec2-ss');
  const [detailModalItem, setDetailModalItem] = useState<MaterialInventoryDTO | null>(null);
  const [data, setData] = useState<OverviewResponse>(INITIAL_OVERVIEW);

  const yards = data.yards.length > 0 ? data.yards : DEFAULT_YARDS;

  const yardOptions = useMemo(() => {
    if (activeSectionId) {
      return yards.filter((y) => y.sectionId === activeSectionId);
    }
    return yards;
  }, [yards, activeSectionId]);

  useEffect(() => {
    if (yardId && !yardOptions.some((y) => y.id === yardId)) {
      setYardId('');
    }
  }, [yardId, yardOptions]);

  const fetchOverview = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeSectionId) params.set('sectionId', activeSectionId);
    if (yardId) params.set('yardId', yardId);
    if (category) params.set('category', category);
    params.set('period', period);
    params.set('page', String(page));
    params.set('pageSize', '5');

    try {
      const res = await fetch(`/api/v1/m07/overview?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as OverviewResponse;
      setData(json);
    } catch {
      // Keep current display on transient error
    }
  }, [activeSectionId, yardId, category, period, page]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const kpiCards = [
    {
      label: '计划量',
      val: fmtNum(data.kpis.planQty),
      unit: 't',
      cls: '',
      icon: <ClipboardList size={18} />,
    },
    {
      label: '累计进场量',
      val: fmtNum(data.kpis.arrivalQty),
      unit: 't',
      cls: '',
      icon: <Truck size={18} />,
    },
    {
      label: '实物库存',
      val: fmtNum(data.kpis.physicalQty),
      unit: 't',
      cls: '',
      icon: <Layers size={18} />,
    },
    {
      label: '可用库存',
      val: fmtNum(data.kpis.usableQty),
      unit: 't',
      cls: 'green',
      icon: <CheckCircle2 size={18} />,
    },
    {
      label: '备料缺口',
      val: fmtNum(data.kpis.gapQty),
      unit: 't',
      cls: 'gold',
      icon: <AlertTriangle size={18} />,
    },
    {
      label: '待检批次',
      val: fmtNum(data.kpis.pendingBatches),
      unit: '批',
      cls: 'gold',
      icon: <FlaskConical size={18} />,
    },
  ];

  const pageNumbers = useMemo(() => {
    const totalPages = Math.max(1, data.totalPages);
    const out: Array<number | 'ellipsis'> = [];
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages <= 5 || p <= 3 || p === totalPages || p === data.page) {
        out.push(p);
      } else if (p === 4 && totalPages > 5) {
        out.push('ellipsis');
      }
    }
    return out;
  }, [data.totalPages, data.page]);

  return (
    <div className="m07-page">
      {/* Top Filter Bar */}
      <div className="glass-panel m07-filter-panel">
        <div className="m07-filter-fields">
          <div className="m07-field">
            <span className="m07-field-label">所属工区</span>
            <select
              className="glass-select m07-select"
              value={activeSectionId ?? ''}
              onChange={(e) => {
                const nextSec = e.target.value || null;
                setYardId('');
                setPage(1);
                onSectionChange(nextSec);
              }}
            >
              <option value="">全部工区</option>
              {yards.map((y) => (
                <option key={y.sectionId} value={y.sectionId}>
                  {y.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">料场</span>
            <select
              className="glass-select m07-select"
              value={yardId}
              onChange={(e) => {
                setYardId(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部料场</option>
              {yardOptions.map((y) => (
                <option key={y.id} value={y.id}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">材料类别</span>
            <select
              className="glass-select m07-select"
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部材料</option>
              {MATERIAL_TYPES.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">统计周期</span>
            <select
              className="glass-select m07-select"
              value={period}
              onChange={(e) => {
                onPeriodChange(e.target.value);
                setPage(1);
              }}
            >
              {MATERIAL_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m07-filter-actions">
          <button
            type="button"
            className="m07-btn-primary"
            onClick={() => {
              void fetchOverview();
              showToast('已更新备料总览筛选统计');
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() => {
              setYardId('');
              setCategory('');
              setPage(1);
              onPeriodChange('2026年11月');
              onSectionChange(null);
              showToast('已重置全部筛选条件');
            }}
          >
            <RotateCcw size={14} /> 重置
          </button>
        </div>
      </div>

      {/* KPI Summary Row */}
      <GlassPanel title="备料汇总" subtitle={`(${period})`} bodyClassName="m07-panel-body-flush">
        <div className="m07-kpi-grid-6">
          {kpiCards.map((k) => (
            <div key={k.label} className="m07-kpi-card">
              <div className={`m07-kpi-icon ${k.cls}`}>{k.icon}</div>
              <div>
                <div className="m07-kpi-label">{k.label}</div>
                <div className={`m07-kpi-val ${k.cls}`}>
                  {k.val}
                  <span className="m07-kpi-unit">{k.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* 3 Charts Row */}
      <div className="m07-charts-row">
        <GlassPanel
          title="各工区计划量与进场量"
          headerRight={
            <div className="m07-chart-legend-inline">
              <span>
                <i className="m07-dot" style={{ background: '#4f8df9' }} />
                计划量
              </span>
              <span>
                <i className="m07-dot" style={{ background: '#2adcf8' }} />
                累计进场量 万t
              </span>
            </div>
          }
          bodyClassName="m07-panel-body-flush"
        >
          <div className="m07-chart-body">
            <SectionBarChartSvg
              data={data.sectionBars}
              activeSectionId={activeSectionId}
              onSelectSection={(secId) => {
                setYardId('');
                setPage(1);
                onSectionChange(activeSectionId === secId ? null : secId);
              }}
            />
          </div>
        </GlassPanel>

        <GlassPanel title="各类材料备料缺口" bodyClassName="m07-panel-body-flush">
          <div className="m07-donut-wrap">
            <MaterialDonutSvg
              segments={data.gapBreakdown}
              centerTop={fmtNum(data.donutGapTotal)}
              centerUnit="t"
              centerSub="缺口合计"
            />
            <div className="m07-donut-legend">
              {data.gapBreakdown.map((s) => (
                <div
                  key={s.name}
                  className={`m07-legend-row ${category === s.name ? 'active' : ''}`}
                  onClick={() => {
                    setCategory(category === s.name ? '' : s.name);
                    setPage(1);
                  }}
                >
                  <span className="m07-legend-name">
                    <i className="m07-dot" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="m07-legend-num">{fmtNum(s.value)}</span>
                  <span className="m07-legend-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title="检验批次状态" bodyClassName="m07-panel-body-flush">
          <div className="m07-donut-wrap">
            <MaterialDonutSvg
              segments={data.batchSegments}
              centerTop={fmtNum(data.batchTotal)}
              centerUnit="批"
              centerSub="本期检验批次"
            />
            <div className="m07-donut-legend">
              {data.batchSegments.map((s) => (
                <div
                  key={s.name}
                  className="m07-legend-row"
                  onClick={() => onNavigate('inspect')}
                >
                  <span className="m07-legend-name">
                    <i className="m07-dot" style={{ background: s.color }} />
                    {s.name}
                  </span>
                  <span className="m07-legend-num">{s.value}</span>
                  <span className="m07-legend-pct">{s.pct}%</span>
                </div>
              ))}
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Bottom Split: Table + Focus Alerts */}
      <div className="m07-p1-bottom">
        <GlassPanel
          title="备料明细"
          className="m07-table-panel"
          bodyClassName="m07-panel-body-flush"
          headerRight={
            <div className="m07-header-right">
              <span>单位 t</span>
              <span>统计截至 {data.cutoff}</span>
            </div>
          }
        >
          <div className="m07-table-wrap">
            <table className="data-table m07-table">
              <thead>
                <tr>
                  <th>所属工区</th>
                  <th>料场</th>
                  <th>材料</th>
                  <th>计划量</th>
                  <th>累计进场量</th>
                  <th>实物库存</th>
                  <th>可用库存</th>
                  <th>备料缺口</th>
                  <th>检验状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.items.length > 0 ? (
                  data.items.map((r) => (
                    <tr
                      key={r.id}
                      className={selectedInvId === r.id ? 'selected' : ''}
                      onClick={() => setSelectedInvId(r.id)}
                    >
                      <td>{r.sectionName}</td>
                      <td>{r.yardName}</td>
                      <td>{r.material}</td>
                      <td>{fmtNum(r.planQty)}</td>
                      <td>{fmtNum(r.arrivalQty)}</td>
                      <td>{fmtNum(r.physicalQty)}</td>
                      <td className="m07-num-green">{fmtNum(r.usableQty)}</td>
                      <td className="m07-num-gold">{fmtNum(r.gapQty)}</td>
                      <td>
                        <StatusBadge text={r.status} tone={statusTone(r.status)} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m07-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedInvId(r.id);
                            setDetailModalItem(r);
                          }}
                        >
                          详情
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={10} style={{ textAlign: 'center', color: '#93b8de', padding: '24px' }}>
                      当前筛选条件下暂无备料明细记录
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="m07-pagination">
            <span>共 {data.total} 条材料记录</span>
            <button
              type="button"
              className="m07-page-btn"
              disabled={data.page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={12} />
            </button>
            {pageNumbers.map((p, idx) =>
              p === 'ellipsis' ? (
                <span key={`el-${idx}`} style={{ padding: '0 3px' }}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`m07-page-btn ${p === data.page ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className="m07-page-btn"
              disabled={data.page >= data.totalPages}
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
            >
              <ChevronRight size={12} />
            </button>
          </div>
        </GlassPanel>

        <GlassPanel
          title="重点关注"
          className="m07-table-panel"
          bodyClassName="m07-panel-body-flush"
        >
          <div className="m07-focus-list">
            {data.focusAlerts.length > 0 ? (
              data.focusAlerts.map((a) => (
                <div key={a.id} className="m07-focus-item">
                  <div className="m07-focus-left">
                    <div className={`m07-focus-ico ${a.kind}`}>
                      {a.kind === 'danger' ? (
                        <FlaskConical size={17} />
                      ) : a.id === 'fa2' ? (
                        <Layers size={17} />
                      ) : (
                        <AlertTriangle size={17} />
                      )}
                    </div>
                    <div>
                      <div className="m07-focus-title">{a.title}</div>
                      <div className="m07-focus-sub">{a.sub}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className={`m07-pill-action ${a.kind}`}
                    onClick={() => {
                      onSectionChange(a.sectionId);
                      onNavigate(a.action, {
                        sectionId: a.sectionId,
                        material: a.material,
                        batchId: a.batchId,
                      });
                    }}
                  >
                    {a.btnText}
                  </button>
                </div>
              ))
            ) : (
              <div style={{ padding: '20px', textAlign: 'center', color: '#93b8de', fontSize: '12.5px' }}>
                该工区当前无重点缺口或隔离预警
              </div>
            )}
          </div>

          <div className="m07-panel-footer fab-clear">
            <span>同步于 {data.syncTime}</span>
            <button
              type="button"
              className="m07-link-btn"
              onClick={() => onNavigate('yard')}
            >
              查看料场详情 <ChevronRight size={12} />
            </button>
          </div>
        </GlassPanel>
      </div>

      {detailModalItem ? (
        <InventoryDetailModal
          item={detailModalItem}
          period={period}
          onClose={() => setDetailModalItem(null)}
          onJumpYard={(secId, mat) => {
            onSectionChange(secId);
            onNavigate('yard', { sectionId: secId, material: mat });
          }}
          onJumpInspect={(secId, mat) => {
            onSectionChange(secId);
            onNavigate('inspect', { sectionId: secId, material: mat });
          }}
        />
      ) : null}
    </div>
  );
}
