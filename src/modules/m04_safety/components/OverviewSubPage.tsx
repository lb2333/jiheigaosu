'use client';

import { useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  ClipboardList,
  Clock,
  FileText,
  Flag,
  MapPin,
  RefreshCw,
  Search,
} from 'lucide-react';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import {
  PERIOD_OPTIONS,
  RISK_CATEGORIES,
  SECTION_META,
  getHazardStatusMeta,
  periodLabel,
  secUnit,
  type HazardStatsDTO,
  type SafetyActivityDTO,
  type SafetyHazardDTO,
} from '../types';
import { SafetyDonutChart, SectionUnclosedBarChart } from './SafetyCharts';

interface OverviewResponse {
  period: string;
  riskCount: number;
  aiPendingCount: number;
  stats: HazardStatsDTO;
  trackTotal: number;
  trackPage: number;
  trackTotalPages: number;
  trackRows: SafetyHazardDTO[];
  activities: SafetyActivityDTO[];
}

function renderActivityIcon(icon: string) {
  if (icon === 'camera') return <Camera size={15} />;
  if (icon === 'doc') return <FileText size={15} />;
  if (icon === 'checkCircle') return <CheckCircle2 size={15} />;
  if (icon === 'flag') return <Flag size={15} />;
  if (icon === 'refresh') return <RefreshCw size={15} />;
  return <Clock size={15} />;
}

export function OverviewSubPage({
  activeSectionId,
  period,
  onSectionChange,
  onPeriodChange,
  onNavigate,
  onOpenHazard,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  onSectionChange: (secId: string | null) => void;
  onPeriodChange: (p: string) => void;
  onNavigate: (subPage: string, opts?: { ledgerStatus?: string; selectedHazardId?: string; selectedReviewId?: string; reviewStatusFilter?: string }) => void;
  onOpenHazard: (h: SafetyHazardDTO) => void;
  showToast: (msg: string) => void;
}) {
  const [category, setCategory] = useState('all');
  const [quickTab, setQuickTab] = useState<'unclosed' | 'overdue' | 'review'>('unclosed');
  const [page, setPage] = useState(1);
  const [urgingId, setUrgingId] = useState<string | null>(null);

  const overviewUrl = useMemo(() => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      category,
      period,
      quickTab,
      page: String(page),
    });
    return `/api/v1/m04/overview?${qs.toString()}`;
  }, [activeSectionId, category, period, quickTab, page]);

  const { data, loading, refetch } = useApiQuery<OverviewResponse>(overviewUrl, {
    staleTimeMs: 15_000,
  });

  async function handleUrge(h: SafetyHazardDTO) {
    setUrgingId(h.id);
    try {
      const res = await fetch(`/api/v1/m04/hazards/${encodeURIComponent(h.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'urge' }),
      });
      if (res.ok) {
        showToast(`已向 ${secUnit(h.sectionId)}（${h.owner}）发送催办通知：${h.id}`);
        await refetch({ force: true });
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '催办发送失败');
      }
    } finally {
      setUrgingId(null);
    }
  }

  function handleReset() {
    setCategory('all');
    onPeriodChange('2026-11');
    setQuickTab('unclosed');
    setPage(1);
    if (activeSectionId) onSectionChange(null);
    showToast('已重置安全总览筛选条件');
  }

  const stats: HazardStatsDTO = data?.stats ?? {
    total: 0,
    pendingDispatch: 0,
    rectifying: 0,
    pendingReview: 0,
    closed: 0,
    overdue: 0,
    unclosed: 0,
    srcManual: 0,
    srcAi: 0,
    srcUav: 0,
    secUnclosed: SECTION_META.map((s) => ({ id: s.id, name: s.name, val: 0 })),
  };

  const statusSegments = [
    { label: '待派发', value: stats.pendingDispatch, color: '#38bdf8' },
    { label: '整改中', value: stats.rectifying, color: '#0ea5e9' },
    { label: '待复查', value: stats.pendingReview, color: '#facc15' },
    { label: '已销项', value: stats.closed, color: '#22c55e' },
  ];

  const sourceSegments = [
    { label: '人工巡查', value: stats.srcManual, color: '#3b82f6' },
    { label: '视频AI', value: stats.srcAi, color: '#22d3ee' },
    { label: '无人机巡检', value: stats.srcUav, color: '#22c55e' },
  ];

  const trackRows = data?.trackRows ?? [];
  const trackTotal = data?.trackTotal ?? 0;
  const trackPage = data?.trackPage ?? 1;
  const trackTotalPages = data?.trackTotalPages ?? 1;
  const activities = data?.activities ?? [];

  return (
    <div className="m04-page m04-compact">
      {/* Top Filter Bar */}
      <div className="m04-filter-bar">
        <div className="m04-filter-group">
          <div className="m04-filter-item">
            <label>所属工区</label>
            <select
              className="m04-select"
              value={activeSectionId ?? 'all'}
              onChange={(e) => {
                setPage(1);
                onSectionChange(e.target.value === 'all' ? null : e.target.value);
              }}
            >
              <option value="all">全部工区</option>
              {SECTION_META.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m04-filter-item">
            <label>风险类别</label>
            <select
              className="m04-select"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="all">全部类别</option>
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="m04-filter-item">
            <label>统计周期</label>
            <select
              className="m04-select"
              value={period}
              onChange={(e) => {
                setPage(1);
                onPeriodChange(e.target.value);
              }}
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m04-filter-actions">
          <button
            type="button"
            className="m04-btn-query"
            onClick={() => {
              void refetch({ force: true });
              showToast('已按当前筛选条件刷新安全数据');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="m04-btn-ghost" onClick={handleReset}>
            <RefreshCw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* 施工安全概况 */}
      <div className="m04-panel">
        <div className="m04-panel-head">
          <div className="m04-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">施工安全概况</span>
            <span className="m04-panel-sub">({periodLabel(period)})</span>
          </div>
        </div>
        <div className="m04-panel-body">
          <div className="m04-kpi-grid-6">
            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => onNavigate('risk')}
            >
              <div className="m04-kpi-ico m04-ico-blue">
                <MapPin size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">在管风险点</div>
                <div className="m04-kpi-val m04-c-cyan">
                  {data?.riskCount ?? 12}
                  <span className="m04-kpi-unit">处</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => onNavigate('ledger', { ledgerStatus: 'all' })}
            >
              <div className="m04-kpi-ico m04-ico-cyan">
                <ClipboardList size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">本期确认隐患</div>
                <div className="m04-kpi-val m04-c-cyan">
                  {stats.total}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => {
                setQuickTab('unclosed');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-gold">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">未销项隐患</div>
                <div className="m04-kpi-val m04-c-gold">
                  {stats.unclosed}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => onNavigate('ledger', { ledgerStatus: '已销项' })}
            >
              <div className="m04-kpi-ico m04-ico-green">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">已销项隐患</div>
                <div className="m04-kpi-val m04-c-green">
                  {stats.closed}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => {
                setQuickTab('overdue');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-red">
                <Clock size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">超期隐患</div>
                <div className="m04-kpi-val m04-c-red">
                  {stats.overdue}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className="m04-kpi-card"
              onClick={() => onNavigate('ai_alert')}
            >
              <div className="m04-kpi-ico m04-ico-gold">
                <Camera size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">待核实AI预警</div>
                <div className="m04-kpi-val m04-c-gold">
                  {data?.aiPendingCount ?? 8}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Middle 3 Charts */}
      <div className="m04-mid-grid-3">
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">各工区未销项隐患</span>
            </div>
            <span className="m04-panel-sub">单位 项</span>
          </div>
          <div className="m04-panel-body">
            <SectionUnclosedBarChart
              items={stats.secUnclosed}
              activeSectionId={activeSectionId}
              onSelectSection={(secId) => {
                setPage(1);
                onSectionChange(activeSectionId === secId ? null : secId);
              }}
            />
          </div>
        </div>

        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">隐患处置状态</span>
            </div>
            <span className="m04-panel-sub">未销项含超期 {stats.overdue} 项</span>
          </div>
          <div className="m04-panel-body">
            <SafetyDonutChart
              segments={statusSegments}
              total={stats.total}
              centerSub="确认隐患"
              filterId="m04-st-shadow"
            />
          </div>
        </div>

        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">已确认隐患来源</span>
            </div>
          </div>
          <div className="m04-panel-body">
            <SafetyDonutChart
              segments={sourceSegments}
              total={stats.total}
              centerSub="确认隐患"
              filterId="m04-src-shadow"
            />
          </div>
        </div>
      </div>

      {/* Bottom 2 Panels */}
      <div className="m04-split-2">
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">重点跟踪隐患</span>
            </div>
            <div className="m04-pill-tabs">
              <button
                type="button"
                className={`m04-pill-tab ${quickTab === 'unclosed' ? 'active' : ''}`}
                onClick={() => {
                  setQuickTab('unclosed');
                  setPage(1);
                }}
              >
                全部未销项
              </button>
              <button
                type="button"
                className={`m04-pill-tab ${quickTab === 'overdue' ? 'active' : ''}`}
                onClick={() => {
                  setQuickTab('overdue');
                  setPage(1);
                }}
              >
                超期
              </button>
              <button
                type="button"
                className={`m04-pill-tab ${quickTab === 'review' ? 'active' : ''}`}
                onClick={() => {
                  setQuickTab('review');
                  setPage(1);
                }}
              >
                待复查
              </button>
            </div>
          </div>
          <div className="m04-panel-body">
            <div className="m04-table-wrap">
              <table className="m04-table">
                <thead>
                  <tr>
                    <th>隐患编号</th>
                    <th>工程位置</th>
                    <th>来源</th>
                    <th>隐患描述</th>
                    <th>整改期限</th>
                    <th>状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {loading && !data ? (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#8ab4dc', padding: '22px' }}>
                        正在加载安全隐患数据...
                      </td>
                    </tr>
                  ) : trackRows.length > 0 ? (
                    trackRows.map((h) => {
                      const sm = getHazardStatusMeta(h);
                      return (
                        <tr key={h.id} onClick={() => onOpenHazard(h)}>
                          <td>{h.id}</td>
                          <td>{h.location}</td>
                          <td>{h.source}</td>
                          <td>{h.description}</td>
                          <td style={{ fontVariantNumeric: 'tabular-nums' }}>{h.dueDate.slice(5)}</td>
                          <td>
                            <span className={`m04-tag ${sm.cls}`}>{sm.label}</span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="m04-act-link"
                              disabled={urgingId === h.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                if (sm.action === '催办') {
                                  void handleUrge(h);
                                } else if (sm.action === '派发') {
                                  onNavigate('ledger', { selectedHazardId: h.id });
                                } else {
                                  onNavigate('review', {
                                    selectedReviewId: h.id,
                                    reviewStatusFilter: h.status === '已销项' ? '已销项' : 'all',
                                  });
                                }
                              }}
                            >
                              {urgingId === h.id ? '催办中' : sm.action}
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} style={{ textAlign: 'center', color: '#8ab4dc', padding: '22px' }}>
                        当前筛选条件下暂无未销项隐患
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="m04-pager">
              <span className="m04-pager-info">共 {trackTotal} 条记录</span>
              <button
                type="button"
                className="m04-pg-btn"
                disabled={trackPage <= 1}
                onClick={() => setPage(trackPage - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: trackTotalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`m04-pg-btn ${p === trackPage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="m04-pg-btn"
                disabled={trackPage >= trackTotalPages}
                onClick={() => setPage(trackPage + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">最新办理动态</span>
            </div>
          </div>
          <div className="m04-panel-body">
            <div className="m04-feed-list">
              {activities.map((act) => (
                <div
                  key={act.id}
                  className="m04-feed-item"
                  onClick={() => {
                    if (act.code.startsWith('R-')) {
                      onNavigate('risk');
                    } else if (act.status === '待复查' || act.status === '已销项') {
                      onNavigate('review', { selectedReviewId: act.code, reviewStatusFilter: 'all' });
                    } else {
                      onNavigate('ledger', { selectedHazardId: act.code });
                    }
                  }}
                >
                  <div className="m04-feed-left">
                    <div
                      className={`m04-kpi-ico ${
                        act.tagClass === 'm04-tag-red'
                          ? 'm04-ico-red'
                          : act.tagClass === 'm04-tag-amber'
                            ? 'm04-ico-gold'
                            : 'm04-ico-green'
                      }`}
                      style={{ width: '32px', height: '32px' }}
                    >
                      {renderActivityIcon(act.icon)}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div className="m04-feed-title">{act.title}</div>
                      <div className="m04-feed-sub">
                        {act.timeLabel} &nbsp; {act.code}
                      </div>
                    </div>
                  </div>
                  <span className={`m04-tag ${act.tagClass}`}>{act.status}</span>
                </div>
              ))}
            </div>
            <div className="m04-panel-foot m04-foot-fab-clear">
              <span>同步于 2026-11-25 10:45</span>
              <button
                type="button"
                className="m04-text-link"
                onClick={() => onNavigate('ledger')}
              >
                进入隐患台账 &gt;
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
