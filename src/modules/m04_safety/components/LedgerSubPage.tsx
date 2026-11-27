'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Download,
  ExternalLink,
  FileText,
  Flag,
  Plus,
  Search,
} from 'lucide-react';
import {
  PERIOD_OPTIONS,
  SECTION_META,
  getHazardStatusMeta,
  periodLabel,
  secUnit,
  type HazardStatsDTO,
  type SafetyExternalRecordDTO,
  type SafetyHazardDTO,
} from '../types';
import { AddHazardModal, BeforeAfterModal } from './SafetyModals';

interface HazardsResponse {
  period: string;
  stats: HazardStatsDTO;
  total: number;
  page: number;
  totalPages: number;
  items: SafetyHazardDTO[];
  externalRecords: SafetyExternalRecordDTO[];
  allPeriodHazards: SafetyHazardDTO[];
}

function buildPagerNumbers(cur: number, total: number): Array<number | '...'> {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const set = new Set([1, 2, 3, total]);
  if (cur > 3 && cur < total) set.add(cur);
  const arr = Array.from(set).sort((a, b) => a - b);
  const out: Array<number | '...'> = [];
  for (let i = 0; i < arr.length; i++) {
    if (i > 0 && arr[i] - arr[i - 1] > 1) out.push('...');
    out.push(arr[i]);
  }
  return out;
}

export function LedgerSubPage({
  activeSectionId,
  period,
  initialStatusFilter,
  initialSelectedHazardId,
  onSectionChange,
  onPeriodChange,
  onNavigateReview,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  initialStatusFilter?: string;
  initialSelectedHazardId?: string;
  onSectionChange: (secId: string | null) => void;
  onPeriodChange: (p: string) => void;
  onNavigateReview: (hazardId: string, reviewStatus?: string) => void;
  showToast: (msg: string) => void;
}) {
  const router = useRouter();
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || 'all');
  const [tab, setTab] = useState<'local' | 'external'>('local');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedHazardId, setSelectedHazardId] = useState(
    initialSelectedHazardId || 'AQ-202611-039'
  );
  const [data, setData] = useState<HazardsResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showAddModal, setShowAddModal] = useState(false);
  const [evidenceHazard, setEvidenceHazard] = useState<SafetyHazardDTO | null>(null);

  // Dispatch form controlled drafts keyed by hazard ID
  const [dispatchUnit, setDispatchUnit] = useState('');
  const [dispatchOwner, setDispatchOwner] = useState('');
  const [dispatchDue, setDispatchDue] = useState('');
  const [dispatchReq, setDispatchReq] = useState('');

  useEffect(() => {
    if (initialStatusFilter) setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialSelectedHazardId) setSelectedHazardId(initialSelectedHazardId);
  }, [initialSelectedHazardId]);

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      source: sourceFilter,
      status: statusFilter,
      period,
      q: query,
      page: String(page),
    });
    const res = await fetch(`/api/v1/m04/hazards?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as HazardsResponse;
      setData(json);
    }
  }, [activeSectionId, sourceFilter, statusFilter, period, query, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const allPeriodHazards = useMemo(() => data?.allPeriodHazards ?? [], [data]);

  const selH = useMemo(() => {
    return (
      items.find((h) => h.id === selectedHazardId) ??
      allPeriodHazards.find((h) => h.id === selectedHazardId) ??
      items[0] ??
      allPeriodHazards[0] ??
      null
    );
  }, [items, allPeriodHazards, selectedHazardId]);

  useEffect(() => {
    if (selH) {
      setDispatchUnit(secUnit(selH.sectionId));
      setDispatchOwner(selH.owner || '整改负责人A（演示）');
      setDispatchDue(selH.dueFull || `${selH.dueDate} 17:00`);
      setDispatchReq(selH.req || '');
    }
  }, [selH]);

  async function handleCreateHazard(payload: {
    period: string;
    sectionId: string;
    category: string;
    location: string;
    dueDate: string;
    description: string;
    req: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m04/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const result = (await res.json()) as { hazard: SafetyHazardDTO };
        setSelectedHazardId(result.hazard.id);
        setPage(1);
        setShowAddModal(false);
        showToast(`已新增隐患台账：${result.hazard.id}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '新增隐患失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDispatchOrProgress(h: SafetyHazardDTO) {
    if (h.status === '待复查' || h.status === '已销项') {
      onNavigateReview(h.id, 'all');
      return;
    }

    setSubmitting(true);
    try {
      const action = h.status === '待派发' ? 'dispatch' : 'submitFeedback';
      const res = await fetch(`/api/v1/m04/hazards/${encodeURIComponent(h.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action,
          owner: dispatchOwner,
          dueFull: dispatchDue,
          req: dispatchReq,
        }),
      });
      if (res.ok) {
        showToast(
          action === 'dispatch'
            ? `已派发整改工单 ${h.id} 至 ${dispatchOwner}`
            : `工单 ${h.id} 已提交整改反馈，流转至待复查`
        );
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '工单流转操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUrge(h: SafetyHazardDTO) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m04/hazards/${encodeURIComponent(h.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'urge' }),
      });
      if (res.ok) {
        showToast(`已向 ${secUnit(h.sectionId)}（${h.owner}）发送催办通知：${h.id}`);
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '催办失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleExportCsv() {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      period,
    });
    const res = await fetch(`/api/v1/m04/hazards/export?${qs.toString()}`);
    if (!res.ok) {
      showToast('导出台账失败');
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `吉黑高速安全隐患台账_${period}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    showToast(`已导出 ${stats.total} 条隐患台账 CSV 文件`);
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
    secUnclosed: [],
  };

  const selMeta = selH ? getHazardStatusMeta(selH) : null;
  const extRows = data?.externalRecords ?? [];

  return (
    <div className="m04-page">
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
            <label>发现来源</label>
            <select
              className="m04-select"
              value={sourceFilter}
              onChange={(e) => {
                setPage(1);
                setSourceFilter(e.target.value);
              }}
            >
              <option value="all">全部来源</option>
              <option value="人工巡查">人工巡查</option>
              <option value="视频AI">视频AI</option>
              <option value="无人机巡检">无人机巡检</option>
            </select>
          </div>
          <div className="m04-filter-item">
            <label>办理状态</label>
            <select
              className="m04-select"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="all">全部状态</option>
              <option value="待派发">待派发</option>
              <option value="整改中">整改中</option>
              <option value="待复查">待复查</option>
              <option value="已销项">已销项</option>
              <option value="超期">超期隐患</option>
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
            onClick={() => setShowAddModal(true)}
          >
            <Plus size={14} />
            <span>新增人工隐患</span>
          </button>
          <button
            type="button"
            className="m04-btn-ghost"
            onClick={() => void handleExportCsv()}
          >
            <Download size={14} />
            <span>导出台账</span>
          </button>
        </div>
      </div>

      {/* 隐患办理概况 */}
      <div className="m04-panel">
        <div className="m04-panel-head">
          <div className="m04-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">隐患办理概况</span>
            <span className="m04-panel-sub">({periodLabel(period)})</span>
          </div>
        </div>
        <div className="m04-panel-body">
          <div className="m04-kpi-grid-6">
            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
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
              className={`m04-kpi-card ${statusFilter === '待派发' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('待派发');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-gold">
                <Flag size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">待派发</div>
                <div className="m04-kpi-val m04-c-gold">
                  {stats.pendingDispatch}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '整改中' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('整改中');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-blue">
                <Clock size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">整改中</div>
                <div className="m04-kpi-val m04-c-cyan">
                  {stats.rectifying}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '待复查' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('待复查');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-gold">
                <Search size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">待复查</div>
                <div className="m04-kpi-val m04-c-gold">
                  {stats.pendingReview}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '已销项' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('已销项');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-green">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">已销项</div>
                <div className="m04-kpi-val m04-c-green">
                  {stats.closed}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '超期' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('超期');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-red">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">超期隐患</div>
                <div className="m04-kpi-val m04-c-red">
                  {stats.overdue}
                  <span className="m04-kpi-unit">项</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Bottom 2 Columns */}
      <div className="m04-split-2">
        {/* Left: 统一隐患台账 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">统一隐患台账</span>
            </div>
            <button
              type="button"
              className="m04-tag m04-tag-red"
              style={{ cursor: 'pointer' }}
              onClick={() => {
                setStatusFilter('超期');
                setPage(1);
              }}
            >
              超期 {stats.overdue} 项
            </button>
          </div>
          <div className="m04-panel-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                marginBottom: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div className="m04-pill-tabs">
                <button
                  type="button"
                  className={`m04-pill-tab ${tab === 'local' ? 'active' : ''}`}
                  onClick={() => setTab('local')}
                >
                  本平台办理 ({stats.total})
                </button>
                <button
                  type="button"
                  className={`m04-pill-tab ${tab === 'external' ? 'active' : ''}`}
                  onClick={() => setTab('external')}
                >
                  外部关联记录
                </button>
              </div>

              <div className="m04-search-box">
                <Search size={14} />
                <input
                  className="m04-input"
                  type="text"
                  value={query}
                  placeholder="搜索隐患编号或工程对象"
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setPage(1);
                  }}
                />
              </div>
            </div>

            {tab === 'local' ? (
              <>
                <div className="m04-table-wrap">
                  <table className="m04-table">
                    <thead>
                      <tr>
                        <th>隐患编号</th>
                        <th>工程位置</th>
                        <th>发现来源</th>
                        <th>隐患描述</th>
                        <th>确认等级</th>
                        <th>期限</th>
                        <th>状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.length > 0 ? (
                        items.map((h) => {
                          const sm = getHazardStatusMeta(h);
                          return (
                            <tr
                              key={h.id}
                              className={selH?.id === h.id ? 'm04-row-selected' : ''}
                              onClick={() => setSelectedHazardId(h.id)}
                            >
                              <td>{h.id}</td>
                              <td>{h.location}</td>
                              <td>{h.source}</td>
                              <td>{h.description}</td>
                              <td>{h.level}</td>
                              <td style={{ fontVariantNumeric: 'tabular-nums' }}>
                                {h.dueDate.slice(5)}
                              </td>
                              <td>
                                <span className={`m04-tag ${sm.cls}`}>{sm.label}</span>
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="m04-act-link"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (sm.action === '派发') {
                                      setSelectedHazardId(h.id);
                                    } else if (sm.action === '催办') {
                                      void handleUrge(h);
                                    } else {
                                      onNavigateReview(
                                        h.id,
                                        h.status === '已销项' ? '已销项' : 'all'
                                      );
                                    }
                                  }}
                                >
                                  {sm.action}
                                </button>
                              </td>
                            </tr>
                          );
                        })
                      ) : (
                        <tr>
                          <td colSpan={8} style={{ textAlign: 'center', color: '#8ab4dc', padding: '24px' }}>
                            无匹配隐患台账记录
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="m04-pager">
                  <span className="m04-pager-info">共 {data?.total ?? 0} 条记录</span>
                  <button
                    type="button"
                    className="m04-pg-btn"
                    disabled={(data?.page ?? 1) <= 1}
                    onClick={() => setPage((data?.page ?? 1) - 1)}
                  >
                    &lt;
                  </button>
                  {buildPagerNumbers(data?.page ?? 1, data?.totalPages ?? 1).map((item, idx) =>
                    item === '...' ? (
                      <span key={`ellipsis_${idx}`} style={{ padding: '0 3px', color: '#789bc4' }}>
                        ...
                      </span>
                    ) : (
                      <button
                        key={item}
                        type="button"
                        className={`m04-pg-btn ${item === (data?.page ?? 1) ? 'active' : ''}`}
                        onClick={() => setPage(item)}
                      >
                        {item}
                      </button>
                    )
                  )}
                  <button
                    type="button"
                    className="m04-pg-btn"
                    disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
                    onClick={() => setPage((data?.page ?? 1) + 1)}
                  >
                    &gt;
                  </button>
                </div>
              </>
            ) : (
              <div className="m04-table-wrap">
                <table className="m04-table">
                  <thead>
                    <tr>
                      <th>外部编号</th>
                      <th>工程位置</th>
                      <th>外部来源</th>
                      <th>隐患描述</th>
                      <th>关联平台编号</th>
                      <th>同步时间</th>
                      <th>状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    {extRows.map((e) => (
                      <tr
                        key={e.extId}
                        onClick={() => {
                          setSelectedHazardId(e.linkedHazardId);
                        }}
                      >
                        <td>{e.extId}</td>
                        <td>{e.location}</td>
                        <td>{e.origin}</td>
                        <td>{e.description}</td>
                        <td style={{ color: '#38f2ff', fontWeight: 600 }}>{e.linkedHazardId}</td>
                        <td style={{ fontVariantNumeric: 'tabular-nums' }}>{e.syncTime}</td>
                        <td>
                          <span
                            className={`m04-tag ${
                              e.status.includes('超期')
                                ? 'm04-tag-red'
                                : e.status === '已销项'
                                  ? 'm04-tag-green'
                                  : 'm04-tag-amber'
                            }`}
                          >
                            {e.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div
              className="m04-panel-foot"
              style={{ borderTop: '1px solid rgba(56,189,248,0.14)', marginTop: '10px' }}
            >
              <span>ⓘ 平安工地记录通过来源编号关联</span>
              <button
                type="button"
                className="m04-text-link"
                style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                onClick={() => router.push('/pingan/showcase')}
              >
                <span>进入原平安工地系统</span>
                <ExternalLink size={12} />
              </button>
            </div>
          </div>
        </div>

        {/* Right: 派发整改 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">派发整改</span>
            </div>
          </div>
          {selH && selMeta ? (
            <div className="m04-panel-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>{selH.id}</strong>
                <span className={`m04-tag ${selMeta.cls}`}>{selMeta.label}</span>
              </div>

              <div className="m04-kv-list">
                <div className="m04-kv-row">
                  <span>隐患描述</span>
                  <strong>{selH.description}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>工程位置</span>
                  <strong>{selH.location}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>发现来源</span>
                  <strong>{selH.source}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>发现时间</span>
                  <strong>{selH.foundAt}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>确认等级</span>
                  <strong>{selH.level}</strong>
                </div>
              </div>

              <div className="m04-form-row-inline">
                <label>责任单位</label>
                <select
                  className="m04-select"
                  style={{ width: '100%' }}
                  value={dispatchUnit}
                  onChange={(e) => setDispatchUnit(e.target.value)}
                >
                  {SECTION_META.map((s) => (
                    <option key={s.id} value={s.unit}>
                      {s.unit}
                    </option>
                  ))}
                </select>
              </div>

              <div className="m04-form-row-inline">
                <label>整改负责人</label>
                <select
                  className="m04-select"
                  style={{ width: '100%' }}
                  value={dispatchOwner}
                  onChange={(e) => setDispatchOwner(e.target.value)}
                >
                  <option value="整改负责人A（演示）">整改负责人A（演示）</option>
                  <option value="整改负责人B（演示）">整改负责人B（演示）</option>
                  <option value="安全员张伟">安全员张伟</option>
                  <option value="电工班长刘涛">电工班长刘涛</option>
                </select>
              </div>

              <div className="m04-form-row-inline">
                <label>整改期限</label>
                <input
                  className="m04-input"
                  type="text"
                  value={dispatchDue}
                  onChange={(e) => setDispatchDue(e.target.value)}
                />
              </div>

              <div className="m04-form-row-inline" style={{ alignItems: 'start' }}>
                <label style={{ paddingTop: '6px' }}>整改要求</label>
                <textarea
                  className="m04-textarea"
                  style={{ minHeight: '60px' }}
                  value={dispatchReq}
                  onChange={(e) => setDispatchReq(e.target.value)}
                />
              </div>

              <div className="m04-btn-pair" style={{ marginTop: '4px', marginBottom: '10px' }}>
                <button
                  type="button"
                  className="btn-primary-glow"
                  style={{ padding: '8px 10px', fontSize: '12.5px', justifyContent: 'center' }}
                  disabled={submitting}
                  onClick={() => void handleDispatchOrProgress(selH)}
                >
                  <Flag size={15} />
                  <span>
                    {selH.status === '待派发'
                      ? '派发整改'
                      : selH.status === '待复查'
                        ? '前往复查'
                        : selH.status === '整改中'
                          ? '提交整改申请复查'
                          : '查看复查详情'}
                  </span>
                </button>
                <button
                  type="button"
                  className="m04-btn-ghost"
                  style={{ height: 'auto', justifyContent: 'center', padding: '8px 10px' }}
                  onClick={() => setEvidenceHazard(selH)}
                >
                  <FileText size={14} />
                  <span>查看证据</span>
                </button>
              </div>

              <div style={{ fontSize: '11.5px', color: '#8ab4dc' }}>
                ⓘ 派发后将通知整改负责人。
              </div>
            </div>
          ) : (
            <div className="m04-panel-body" style={{ color: '#8ab4dc', justifyContent: 'center', alignItems: 'center' }}>
              请选择左侧台账记录查看派发详情
            </div>
          )}
        </div>
      </div>

      {showAddModal ? (
        <AddHazardModal
          defaultSectionId={activeSectionId || 'sec2'}
          period={period}
          submitting={submitting}
          onSubmit={handleCreateHazard}
          onClose={() => setShowAddModal(false)}
        />
      ) : null}

      {evidenceHazard ? (
        <BeforeAfterModal hazard={evidenceHazard} onClose={() => setEvidenceHazard(null)} />
      ) : null}
    </div>
  );
}
