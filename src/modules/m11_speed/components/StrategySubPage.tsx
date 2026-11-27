'use client';

import { Fragment, useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ClipboardList,
  Clock,
  Flag,
  Gauge,
  Link2,
  RotateCcw,
  Search,
  Waypoints,
} from 'lucide-react';
import {
  modePillClass,
  type DirectionKey,
  type SpeedStrategiesResponse,
  type SpeedStrategyDTO,
} from '../types';
import { StrategyAuditModal } from './SpeedModals';

export function StrategySubPage({
  activeSectionId,
  initialSegId,
  onClearSection,
  onNavigateFeedback,
  showToast,
}: {
  activeSectionId: string | null;
  initialSegId?: string;
  onClearSection: () => void;
  onNavigateFeedback: (opts: { segId: string; batchId?: string }) => void;
  showToast: (msg: string) => void;
}) {
  const [data, setData] = useState<SpeedStrategiesResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [segFilter, setSegFilter] = useState<string>('all');
  const [direction, setDirection] = useState<DirectionKey>('beian');
  const [auditFilter, setAuditFilter] = useState<string>('all');
  const [applied, setApplied] = useState<{
    seg: string;
    dir: DirectionKey;
    audit: string;
  }>({
    seg: 'all',
    dir: 'beian',
    audit: 'all',
  });

  const [selectedSegId, setSelectedSegId] = useState<string>(
    initialSegId || 'QD-01'
  );
  const [auditModalOpen, setAuditModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchStrategies = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      qs.set('segId', applied.seg);
      qs.set('direction', applied.dir);
      qs.set('auditStatus', applied.audit);
      const res = await fetch(`/api/v1/m11/strategies?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as SpeedStrategiesResponse;
      setData(json);
      if (json.strategies.length > 0) {
        setSelectedSegId((prev) =>
          json.strategies.some((s) => s.segId === prev)
            ? prev
            : json.strategies[0].segId
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, applied]);

  useEffect(() => {
    void fetchStrategies();
  }, [fetchStrategies]);

  const strategies = useMemo(() => data?.strategies ?? [], [data]);
  const segments = useMemo(() => data?.segments ?? [], [data]);

  const selectedStrategy: SpeedStrategyDTO | null = useMemo(() => {
    return (
      strategies.find((s) => s.segId === selectedSegId) ??
      strategies[0] ??
      data?.allStrategies[0] ??
      null
    );
  }, [strategies, data, selectedSegId]);

  const kpis = data?.kpis ?? {
    segmentCount: 4,
    laneSuggestionCount: 4,
    pendingCount: 2,
    approvedCount: 2,
    publishedCount: 4,
  };

  const dirLabel = applied.dir === 'beian' ? '北安方向' : '明水方向';

  const handleAuditSubmit = async (payload: {
    innerSpeed: number;
    outerSpeed: number;
    vmsMessage: string;
    direction: DirectionKey;
  }) => {
    if (!selectedStrategy) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m11/strategies/${encodeURIComponent(selectedStrategy.segId)}/audit`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(body.error || '策略审核下发失败');
        return;
      }
      setAuditModalOpen(false);
      showToast(
        `已审核并下发 ${selectedStrategy.segName} 限速策略（批次 ${body.batch?.batchId ?? ''}）`
      );
      await fetchStrategies();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="m11-page">
      {/* FILTER BAR */}
      <div className="glass-panel m11-filter-bar">
        <div className="m11-filter-fields">
          <label className="m11-field">
            <span className="m11-field-label">试点区段</span>
            <select
              className="m11-select"
              value={segFilter}
              onChange={(e) => setSegFilter(e.target.value)}
            >
              <option value="all">全部区段</option>
              {segments.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">行驶方向</span>
            <select
              className="m11-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value as DirectionKey)}
            >
              <option value="beian">北安方向</option>
              <option value="mingshui">明水方向</option>
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">审核状态</span>
            <select
              className="m11-select"
              value={auditFilter}
              onChange={(e) => setAuditFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="待审核">待审核</option>
              <option value="已审核">已审核</option>
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">策略日期</span>
            <select className="m11-select" defaultValue="2026-11-26">
              <option value="2026-11-26">2026-11-26</option>
            </select>
          </label>
        </div>
        <div className="m11-filter-actions">
          <button
            type="button"
            className="m11-btn-primary"
            onClick={() =>
              setApplied({
                seg: segFilter,
                dir: direction,
                audit: auditFilter,
              })
            }
          >
            <Search size={13} /> 查询
          </button>
          <button
            type="button"
            className="m11-btn-ghost"
            onClick={() => {
              setSegFilter('all');
              setDirection('beian');
              setAuditFilter('all');
              setApplied({ seg: 'all', dir: 'beian', audit: 'all' });
            }}
          >
            <RotateCcw size={13} /> 重置
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="glass-panel m11-kpi-strip">
        <div className="m11-strip-header">
          <span className="panel-accent-bar" />
          <span className="panel-title">分区段速度策略概况</span>
          <span className="panel-subtitle">（截至 2026-11-26 10:05）</span>
        </div>
        <div className="m11-kpi-5">
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Waypoints size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">监测试点区段</div>
              <div className="m11-kpi-card-val">
                {kpis.segmentCount}
                <small>段</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Gauge size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">有分车道建议</div>
              <div className="m11-kpi-card-val">
                {kpis.laneSuggestionCount}
                <small>段</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico gold">
              <Clock size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">待审核</div>
              <div className="m11-kpi-card-val gold">
                {kpis.pendingCount}
                <small>段</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico green">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">已审核</div>
              <div className="m11-kpi-card-val green">
                {kpis.approvedCount}
                <small>段</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Flag size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">已发布限速</div>
              <div className="m11-kpi-card-val">
                {kpis.publishedCount}
                <small>段</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2-COL WORKSPACE */}
      {loading && !data ? (
        <div className="glass-panel m11-empty-box">正在加载速度策略台账...</div>
      ) : strategies.length === 0 || !selectedStrategy ? (
        <div className="glass-panel m11-empty-box">
          当前工区或筛选条件下无匹配的分车道速度策略。
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="m11-btn-primary"
              onClick={() => {
                onClearSection();
                setSegFilter('all');
                setAuditFilter('all');
                setApplied({ seg: 'all', dir: direction, audit: 'all' });
              }}
            >
              恢复全线策略列表
            </button>
          </div>
        </div>
      ) : (
        <div className="m11-split-2col">
          {/* LEFT: 8-ROW LANE TABLE */}
          <div
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">分车道速度策略</span>
              </div>
              <span className="m11-hud-head-meta">
                {dirLabel} · {strategies.length} 段 {strategies.length * 2} 车道
              </span>
            </div>
            <div
              className="panel-body m11-table-wrap"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <table className="data-table">
                <thead>
                  <tr>
                    <th>区段编号</th>
                    <th>试点区段</th>
                    <th>车道</th>
                    <th>实测车速</th>
                    <th>算法建议</th>
                    <th>审核状态</th>
                    <th>已发布限速</th>
                    <th>当前模式</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {strategies.map((st) => {
                    const isSel = st.segId === selectedStrategy.segId;
                    const auditTag =
                      st.auditStatus === '已审核'
                        ? 'm11-pill-ok'
                        : 'm11-pill-warn';
                    const suggestChangedIn =
                      st.suggestInner < st.publishedInner;
                    const suggestChangedOut =
                      st.suggestOuter < st.publishedOuter;
                    const rowClass = `m11-tr-selectable ${isSel ? 'm11-tr-selected' : ''}`;
                    return (
                      <Fragment key={st.segId}>
                        <tr
                          className={rowClass}
                          onClick={() => setSelectedSegId(st.segId)}
                        >
                          <td>{st.segId}</td>
                          <td>{st.segName}</td>
                          <td>内侧</td>
                          <td>
                            <strong style={{ color: '#38f2ff' }}>
                              {st.measuredInner}
                            </strong>
                          </td>
                          <td>
                            <strong
                              style={{
                                color: suggestChangedIn ? '#facc15' : '#fff',
                              }}
                            >
                              {st.suggestInner}
                            </strong>
                          </td>
                          <td>
                            <span className={auditTag}>{st.auditStatus}</span>
                          </td>
                          <td>
                            <strong style={{ color: '#38f2ff' }}>
                              {st.publishedInner}
                            </strong>
                          </td>
                          <td>
                            <span className={modePillClass(st.currentMode)}>
                              {st.currentMode}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="m11-hud-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSegId(st.segId);
                              }}
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                        <tr
                          className={rowClass}
                          onClick={() => setSelectedSegId(st.segId)}
                        >
                          <td>{st.segId}</td>
                          <td>{st.segName}</td>
                          <td>外侧</td>
                          <td>
                            <strong style={{ color: '#38f2ff' }}>
                              {st.measuredOuter}
                            </strong>
                          </td>
                          <td>
                            <strong
                              style={{
                                color: suggestChangedOut ? '#facc15' : '#fff',
                              }}
                            >
                              {st.suggestOuter}
                            </strong>
                          </td>
                          <td>
                            <span className={auditTag}>{st.auditStatus}</span>
                          </td>
                          <td>
                            <strong style={{ color: '#38f2ff' }}>
                              {st.publishedOuter}
                            </strong>
                          </td>
                          <td>
                            <span className={modePillClass(st.currentMode)}>
                              {st.currentMode}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className="m11-hud-link"
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSegId(st.segId);
                              }}
                            >
                              查看
                            </button>
                          </td>
                        </tr>
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
              <div
                className="m11-kv-row"
                style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(56,189,248,0.16)',
                  fontSize: '11.5px',
                  color: '#8fb4db',
                }}
              >
                <span>速度单位 km/h · 实测时点 10:05</span>
                <span>发布记录来源 信息发布</span>
              </div>
            </div>
          </div>

          {/* RIGHT: SELECTED SEGMENT INSPECTOR */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">选中区段的策略与发布状态</span>
              </div>
            </div>
            <div className="panel-body">
              <div
                className="m11-seg-insp-top"
                style={{ marginBottom: '6px' }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {selectedStrategy.segName}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#8fb4db',
                      marginLeft: '8px',
                    }}
                  >
                    {selectedStrategy.segId}
                  </span>
                </div>
                <span className={modePillClass(selectedStrategy.currentMode)}>
                  {selectedStrategy.currentMode}
                </span>
              </div>

              <div className="m11-mode-grid">
                <div
                  className={`m11-mode-card ${selectedStrategy.currentMode === '常态管控' ? 'active-ok' : ''}`}
                >
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    常态提速研判
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#9dc2e8',
                      marginTop: '3px',
                    }}
                  >
                    依据专项方案的校核条件
                  </div>
                </div>
                <div
                  className={`m11-mode-card ${selectedStrategy.currentMode !== '常态管控' ? 'active-warn' : ''}`}
                >
                  <div
                    style={{
                      fontSize: '12.5px',
                      fontWeight: 700,
                      color:
                        selectedStrategy.currentMode !== '常态管控'
                          ? '#fde047'
                          : '#fff',
                    }}
                  >
                    {selectedStrategy.currentMode}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: '#dbeafe',
                      marginTop: '3px',
                    }}
                  >
                    {selectedStrategy.triggerScene}
                  </div>
                </div>
              </div>

              <div className="m11-lane-cards-3">
                <div className="m11-lane-mini">
                  <div className="m11-lane-mini-lbl">实测 内侧 / 外侧</div>
                  <div className="m11-lane-mini-val">
                    {selectedStrategy.measuredInner} /{' '}
                    {selectedStrategy.measuredOuter}
                    <span className="m11-mini-kpi-unit">km/h</span>
                  </div>
                </div>
                <div className="m11-lane-mini">
                  <div className="m11-lane-mini-lbl">建议 内侧 / 外侧</div>
                  <div
                    className="m11-lane-mini-val"
                    style={{ color: '#facc15' }}
                  >
                    {selectedStrategy.suggestInner} /{' '}
                    {selectedStrategy.suggestOuter}
                    <span className="m11-mini-kpi-unit">km/h</span>
                  </div>
                </div>
                <div className="m11-lane-mini">
                  <div className="m11-lane-mini-lbl">发布 内侧 / 外侧</div>
                  <div className="m11-lane-mini-val">
                    {selectedStrategy.publishedInner} /{' '}
                    {selectedStrategy.publishedOuter}
                    <span className="m11-mini-kpi-unit">km/h</span>
                  </div>
                </div>
              </div>

              <div className="m11-sub-box">
                <div className="m11-sub-box-hdr">
                  <span>最新算法建议</span>
                  <span
                    className={
                      selectedStrategy.auditStatus === '已审核'
                        ? 'm11-pill-ok'
                        : 'm11-pill-warn'
                    }
                  >
                    {selectedStrategy.auditStatus}
                  </span>
                </div>
                <div className="m11-kv-rows">
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">策略编号</span>
                    <span className="m11-kv-v">
                      {selectedStrategy.latestStrategyId}
                    </span>
                  </div>
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">生成时间</span>
                    <span className="m11-kv-v">
                      {selectedStrategy.latestGeneratedAt}
                    </span>
                  </div>
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">关联研判</span>
                    <span className="m11-kv-v">
                      {selectedStrategy.linkedAlgoId}
                    </span>
                  </div>
                </div>
              </div>

              <div className="m11-sub-box">
                <div className="m11-sub-box-hdr">
                  <span>当前发布限速</span>
                  <span className="m11-pill-ok">已发布</span>
                </div>
                <div className="m11-kv-rows">
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">
                      {selectedStrategy.currentMode === '常态管控'
                        ? '执行策略'
                        : '回退策略'}
                    </span>
                    <span className="m11-kv-v">
                      {selectedStrategy.publishedStrategyId}
                    </span>
                  </div>
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">发布批次</span>
                    <span className="m11-kv-v">
                      {selectedStrategy.publishedBatchId}
                    </span>
                  </div>
                  <div className="m11-kv-row">
                    <span className="m11-kv-k">发布时间</span>
                    <span className="m11-kv-v">
                      {selectedStrategy.publishedAt}
                    </span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '12px',
                }}
              >
                <button
                  type="button"
                  className="m11-btn-ghost"
                  style={{ justifyContent: 'center' }}
                  onClick={() => setAuditModalOpen(true)}
                >
                  <ClipboardList size={14} /> 查看审核记录
                </button>
                <button
                  type="button"
                  className="m11-btn-primary"
                  style={{ justifyContent: 'center' }}
                  onClick={() =>
                    onNavigateFeedback({
                      segId: selectedStrategy.segId,
                      batchId: selectedStrategy.publishedBatchId,
                    })
                  }
                >
                  <Link2 size={14} /> 查看执行反馈
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {auditModalOpen && selectedStrategy ? (
        <StrategyAuditModal
          strategy={selectedStrategy}
          direction={applied.dir}
          submitting={submitting}
          onSubmit={handleAuditSubmit}
          onClose={() => setAuditModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
