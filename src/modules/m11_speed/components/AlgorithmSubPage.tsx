'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Cloud,
  Layers,
  Radio,
  RotateCcw,
  Search,
  Video,
} from 'lucide-react';
import type {
  SpeedAlgoRecordDTO,
  SpeedAlgorithmResponse,
} from '../types';
import { AlgoHistoryModal } from './SpeedModals';

function SourceIcon({ kind }: { kind: string }) {
  if (kind === 'video') return <Video size={15} />;
  if (kind === 'radar') return <Radio size={15} />;
  if (kind === 'weather') return <Cloud size={15} />;
  return <Layers size={15} />;
}

export function AlgorithmSubPage({
  activeSectionId,
  selectedDate,
  initialSegId,
  onClearSection,
  onNavigateStrategy,
}: {
  activeSectionId: string | null;
  selectedDate: string;
  initialSegId?: string;
  onClearSection: () => void;
  onNavigateStrategy: (segId: string) => void;
}) {
  const [data, setData] = useState<SpeedAlgorithmResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [segFilter, setSegFilter] = useState<string>(initialSegId || 'all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('2026-11-26');

  const [applied, setApplied] = useState({
    seg: initialSegId || 'all',
    type: 'all',
    status: 'all',
    date: '2026-11-26',
  });

  const [selectedId, setSelectedId] = useState<string>('YP-20261126-042');
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);
  const prevSelectedDateRef = useRef(selectedDate);

  useEffect(() => {
    if (prevSelectedDateRef.current !== selectedDate) {
      prevSelectedDateRef.current = selectedDate;
      if (selectedDate === '2026-11-26' || selectedDate === '2026-11-25') {
        setDateFilter(selectedDate);
        setApplied((prev) => ({ ...prev, date: selectedDate }));
      }
    }
  }, [selectedDate]);

  const fetchAlgorithm = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      qs.set('segId', applied.seg);
      qs.set('type', applied.type);
      qs.set('status', applied.status);
      qs.set('date', applied.date);
      const res = await fetch(`/api/v1/m11/algorithm?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as SpeedAlgorithmResponse;
      setData(json);
      if (json.records.length > 0) {
        setSelectedId((prev) =>
          json.records.some((r) => r.id === prev) ? prev : json.records[0].id
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, applied]);

  useEffect(() => {
    void fetchAlgorithm();
  }, [fetchAlgorithm]);

  const records = useMemo(() => data?.records ?? [], [data]);
  const allRecords = useMemo(() => data?.allRecords ?? [], [data]);
  const segments = useMemo(() => data?.segments ?? [], [data]);

  const activeRec: SpeedAlgoRecordDTO | null = useMemo(() => {
    return (
      records.find((r) => r.id === selectedId) ??
      records[0] ??
      allRecords[0] ??
      null
    );
  }, [records, allRecords, selectedId]);

  const activeSeg = useMemo(() => {
    if (!activeRec) return segments[0] ?? null;
    return segments.find((s) => s.id === activeRec.segId) ?? segments[0] ?? null;
  }, [activeRec, segments]);

  const kpis = data?.kpis ?? {
    typeCount: 3,
    todayCount: 16,
    generatedCount: 14,
    pendingSyncCount: 2,
    attentionSegCount: 2,
  };

  // Chart constants matching m11_speed.js buildQueuePredictionSvg
  const W = 680;
  const H = 240;
  const padL = 44;
  const padR = 20;
  const padT = 22;
  const padB = 34;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMax = 800;

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
            <span className="m11-field-label">研判类型</span>
            <select
              className="m11-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">全部类型</option>
              <option value="状态识别">状态识别</option>
              <option value="队列预测">队列预测</option>
              <option value="回退建议">回退建议</option>
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">输出状态</span>
            <select
              className="m11-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">全部状态</option>
              <option value="需关注">需关注</option>
              <option value="待核查">待核查</option>
              <option value="已生成">已生成</option>
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">分析日期</span>
            <select
              className="m11-select"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
            >
              <option value="2026-11-26">2026-11-26</option>
              <option value="2026-11-25">2026-11-25</option>
              <option value="all">全部日期</option>
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
                type: typeFilter,
                status: statusFilter,
                date: dateFilter,
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
              setTypeFilter('all');
              setStatusFilter('all');
              setDateFilter('2026-11-26');
              setApplied({
                seg: 'all',
                type: 'all',
                status: 'all',
                date: '2026-11-26',
              });
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
          <span className="panel-title">专项算法成果</span>
          <span className="panel-subtitle">（截至 2026-11-26 10:05）</span>
        </div>
        <div className="m11-kpi-5">
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Layers size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">接入研判类型</div>
              <div className="m11-kpi-card-val">
                {kpis.typeCount}
                <small>类</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <ClipboardList size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">本日研判</div>
              <div className="m11-kpi-card-val">
                {kpis.todayCount}
                <small>次</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico green">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">已生成结果</div>
              <div className="m11-kpi-card-val green">
                {kpis.generatedCount}
                <small>次</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico gold">
              <Clock size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">待同步结果</div>
              <div className="m11-kpi-card-val gold">
                {kpis.pendingSyncCount}
                <small>次</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico gold">
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">需关注试点区段</div>
              <div className="m11-kpi-card-val gold">
                {kpis.attentionSegCount}
                <small>段</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 3-COLUMN WORKSPACE */}
      {loading && !data ? (
        <div className="glass-panel m11-empty-box">正在加载专项算法研判数据...</div>
      ) : records.length === 0 || !activeRec ? (
        <div className="glass-panel m11-empty-box">
          当前工区或筛选条件下暂无算法研判记录（试点区段位于二工区、三工区、四工区、六工区）。
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="m11-btn-primary"
              onClick={() => {
                onClearSection();
                setSegFilter('all');
                setTypeFilter('all');
                setStatusFilter('all');
                setDateFilter('all');
                setApplied({ seg: 'all', type: 'all', status: 'all', date: 'all' });
              }}
            >
              查看全线研判记录
            </button>
          </div>
        </div>
      ) : (
        <div className="m11-algo-grid">
          {/* LEFT: RECORD LIST */}
          <div
            className="glass-panel"
            style={{ display: 'flex', flexDirection: 'column' }}
          >
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">专项研判记录</span>
              </div>
            </div>
            <div
              className="panel-body"
              style={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '10px',
              }}
            >
              <div className="m11-algo-list">
                {records.slice(0, 4).map((r) => {
                  const pillCls =
                    r.status === '已生成' ? 'm11-pill-ok' : 'm11-pill-warn';
                  return (
                    <div
                      key={r.id}
                      className={`m11-algo-card ${r.id === activeRec.id ? 'active' : ''}`}
                      onClick={() => {
                        setSelectedId(r.id);
                        setHoverIdx(null);
                      }}
                    >
                      <div className="m11-algo-card-top">
                        <span className="m11-algo-id">{r.id}</span>
                        <span className={pillCls}>{r.status}</span>
                      </div>
                      <div className="m11-algo-seg">{r.segName}</div>
                      <div className="m11-algo-meta">
                        {r.time} &nbsp; {r.summary}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div
                className="m11-kv-row"
                style={{
                  paddingTop: '6px',
                  borderTop: '1px solid rgba(56,189,248,0.16)',
                }}
              >
                <span className="m11-kv-k">本日研判 {kpis.todayCount} 次</span>
                <button
                  type="button"
                  className="m11-hud-link"
                  onClick={() => setHistoryOpen(true)}
                >
                  查看历史 &gt;
                </button>
              </div>
            </div>
          </div>

          {/* CENTER: PREDICTION & RISK */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">状态识别、预测与风险研判</span>
              </div>
              <button
                type="button"
                className="m11-hud-link"
                onClick={() => onNavigateStrategy(activeRec.segId)}
              >
                查看速度策略 &gt;
              </button>
            </div>
            <div className="panel-body">
              <div
                className="m11-seg-insp-top"
                style={{ marginBottom: '4px' }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '15px',
                      fontWeight: 700,
                      color: '#fff',
                    }}
                  >
                    {activeRec.segName}
                  </span>
                  <span
                    style={{
                      fontSize: '12px',
                      color: '#8fb4db',
                      marginLeft: '8px',
                    }}
                  >
                    {activeRec.id}
                  </span>
                </div>
                <span
                  className={
                    activeRec.status === '已生成'
                      ? 'm11-pill-ok'
                      : 'm11-pill-warn'
                  }
                >
                  {activeRec.badgeText}
                </span>
              </div>

              <div className="m11-algo-kpi-3">
                <div className="m11-algo-kpi-box">
                  <span>状态识别</span>
                  <strong
                    style={{
                      color:
                        activeRec.status === '已生成' ? '#4ade80' : '#facc15',
                    }}
                  >
                    {activeRec.stateDetect}
                  </strong>
                </div>
                <div className="m11-algo-kpi-box">
                  <span>实测排队长度</span>
                  <strong style={{ color: '#38f2ff' }}>
                    {activeRec.measuredQueue}{' '}
                    <small style={{ fontSize: '12px', color: '#cbe3fc' }}>
                      m
                    </small>
                  </strong>
                </div>
                <div className="m11-algo-kpi-box">
                  <span>15 分钟预测队列</span>
                  <strong style={{ color: '#c084fc' }}>
                    {activeRec.predictedQueue}{' '}
                    <small style={{ fontSize: '12px', color: '#cbe3fc' }}>
                      m
                    </small>
                  </strong>
                </div>
              </div>

              <div className="m11-chart-wrap">
                <div className="m11-chart-hdr">
                  <span>短时队列预测</span>
                  <span
                    style={{
                      fontSize: '11px',
                      color: '#8fb4db',
                      fontWeight: 500,
                    }}
                  >
                    单位 m
                  </span>
                </div>
                {(() => {
                  const xCount = activeRec.xLabels.length;
                  const xAt = (i: number) => padL + (i / (xCount - 1)) * plotW;
                  const yAt = (v: number) =>
                    padT +
                    (1 - Math.min(yMax, Math.max(0, v)) / yMax) * plotH;
                  const splitX = xAt(activeRec.splitIndex);
                  const measuredPts = activeRec.measuredSeries
                    .map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`)
                    .join(' ');
                  const predPts = activeRec.predictedSeries
                    .map(
                      (v, i) =>
                        `${xAt(activeRec.splitIndex + i).toFixed(1)},${yAt(v).toFixed(1)}`
                    )
                    .join(' ');

                  const hoverX = hoverIdx !== null ? xAt(hoverIdx) : 0;
                  const isHoverPred =
                    hoverIdx !== null && hoverIdx > activeRec.splitIndex;
                  const hoverVal =
                    hoverIdx !== null
                      ? isHoverPred
                        ? activeRec.predictedSeries[
                            hoverIdx - activeRec.splitIndex
                          ]
                        : activeRec.measuredSeries[hoverIdx]
                      : 0;

                  return (
                    <>
                      <svg
                        viewBox={`0 0 ${W} ${H}`}
                        style={{
                          width: '100%',
                          height: 'auto',
                          display: 'block',
                        }}
                      >
                        <defs>
                          <linearGradient
                            id="m11-pred-zone"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                          >
                            <stop
                              offset="0%"
                              stopColor="#8b5cf6"
                              stopOpacity="0.16"
                            />
                            <stop
                              offset="100%"
                              stopColor="#6366f1"
                              stopOpacity="0.08"
                            />
                          </linearGradient>
                        </defs>
                        {[0, 200, 400, 600, 800].map((val) => {
                          const y = yAt(val);
                          return (
                            <g key={val}>
                              <line
                                x1={padL}
                                y1={y}
                                x2={W - padR}
                                y2={y}
                                stroke="rgba(125,211,252,0.14)"
                                strokeWidth={1}
                              />
                              <text
                                x={padL - 8}
                                y={y + 4}
                                textAnchor="end"
                                fill="#8fb4db"
                                fontSize={11}
                              >
                                {val}
                              </text>
                            </g>
                          );
                        })}
                        <rect
                          x={splitX}
                          y={padT}
                          width={W - padR - splitX}
                          height={plotH}
                          fill="url(#m11-pred-zone)"
                        />
                        <text
                          x={W - padR - 6}
                          y={padT + 14}
                          textAnchor="end"
                          fill="#c4b5fd"
                          fontSize={11}
                        >
                          预测区间
                        </text>
                        <line
                          x1={splitX}
                          y1={padT}
                          x2={splitX}
                          y2={padT + plotH}
                          stroke="rgba(196,181,253,0.45)"
                          strokeWidth={1.2}
                          strokeDasharray="4 4"
                        />
                        <polyline
                          fill="none"
                          stroke="#22d3ee"
                          strokeWidth={2.6}
                          points={measuredPts}
                        />
                        <polyline
                          fill="none"
                          stroke="#c084fc"
                          strokeWidth={2.4}
                          strokeDasharray="6 4"
                          points={predPts}
                        />
                        {activeRec.measuredSeries.map((v, i) => {
                          const cx = xAt(i);
                          const cy = yAt(v);
                          return (
                            <g key={`m-${i}`}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill="#071b3d"
                                stroke="#22d3ee"
                                strokeWidth={2.2}
                              />
                              <text
                                x={cx}
                                y={cy - 10}
                                textAnchor="middle"
                                fill="#e6f4ff"
                                fontSize={11}
                                fontWeight={700}
                              >
                                {v}
                              </text>
                            </g>
                          );
                        })}
                        {activeRec.predictedSeries.map((v, i) => {
                          if (i === 0) return null;
                          const cx = xAt(activeRec.splitIndex + i);
                          const cy = yAt(v);
                          return (
                            <g key={`p-${i}`}>
                              <circle
                                cx={cx}
                                cy={cy}
                                r={4}
                                fill="#071b3d"
                                stroke="#c084fc"
                                strokeWidth={2.2}
                              />
                              <text
                                x={cx}
                                y={cy - 10}
                                textAnchor="middle"
                                fill="#e9d5ff"
                                fontSize={11}
                                fontWeight={700}
                              >
                                {v}
                              </text>
                            </g>
                          );
                        })}
                        {activeRec.xLabels.map((lbl, i) => {
                          const isSplit = i === activeRec.splitIndex;
                          return (
                            <text
                              key={`${lbl}-${i}`}
                              x={xAt(i)}
                              y={H - 10}
                              textAnchor="middle"
                              fill={isSplit ? '#38f2ff' : '#9dc2e8'}
                              fontSize={11}
                              fontWeight={isSplit ? 700 : 500}
                            >
                              {lbl}
                            </text>
                          );
                        })}
                        {hoverIdx !== null ? (
                          <line
                            x1={hoverX}
                            y1={padT}
                            x2={hoverX}
                            y2={padT + plotH}
                            stroke="rgba(56,242,255,0.45)"
                            strokeWidth={1}
                            strokeDasharray="3 3"
                          />
                        ) : null}
                        {activeRec.xLabels.map((_, i) => {
                          const cx = xAt(i);
                          return (
                            <rect
                              key={`hit-${i}`}
                              x={cx - 28}
                              y={padT}
                              width={56}
                              height={plotH}
                              fill="transparent"
                              style={{ cursor: 'crosshair' }}
                              onMouseEnter={() => setHoverIdx(i)}
                              onMouseLeave={() => setHoverIdx(null)}
                            />
                          );
                        })}
                      </svg>
                      {hoverIdx !== null ? (
                        <div
                          className="m11-chart-tooltip"
                          style={{
                            left: `${Math.min(72, Math.max(8, (hoverX / W) * 100))}%`,
                            top: '34px',
                          }}
                        >
                          <div
                            style={{
                              fontWeight: 700,
                              color: '#fff',
                              marginBottom: '2px',
                            }}
                          >
                            {activeRec.xLabels[hoverIdx]} ·{' '}
                            {isHoverPred ? '短时预测' : '实测采样'}
                          </div>
                          <div>
                            队列长度：
                            <strong
                              style={{
                                color: isHoverPred ? '#c084fc' : '#38f2ff',
                              }}
                            >
                              {hoverVal} m
                            </strong>
                          </div>
                          <div style={{ color: '#9ec4ea', fontSize: '10.5px' }}>
                            模型：{activeRec.model}
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()}
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '18px',
                    fontSize: '11.5px',
                    color: '#c9e2fb',
                    marginTop: '2px',
                  }}
                >
                  <span>
                    <i
                      className="m11-legend-swatch"
                      style={{ background: '#22d3ee' }}
                    />
                    实测队列
                  </span>
                  <span>
                    <i
                      className="m11-legend-swatch"
                      style={{
                        background: 'none',
                        borderTop: '2px dashed #c084fc',
                      }}
                    />
                    预测队列
                  </span>
                </div>
              </div>

              <div className="m11-info-callout">ⓘ {activeRec.note}</div>
            </div>
          </div>

          {/* RIGHT: INPUT SOURCES & GEOMETRY CHECK */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">输入来源与版本</span>
              </div>
            </div>
            <div className="panel-body">
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbe3fc',
                  marginBottom: '4px',
                }}
              >
                数据与校核依据
              </div>
              {activeRec.sources.map((src, idx) => (
                <div key={`${src.name}-${idx}`} className="m11-src-item">
                  <div className="m11-src-left">
                    <span className="m11-src-ico">
                      <SourceIcon kind={src.icon} />
                    </span>
                    <div>
                      <div
                        style={{
                          fontSize: '12.5px',
                          fontWeight: 700,
                          color: '#fff',
                        }}
                      >
                        {src.name}
                      </div>
                      <div style={{ fontSize: '11px', color: '#8fb4db' }}>
                        {src.desc}
                      </div>
                    </div>
                  </div>
                  <span
                    style={{
                      fontSize: '11.5px',
                      color: '#b8d7f7',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {src.time}
                  </span>
                </div>
              ))}

              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 700,
                  color: '#cbe3fc',
                  margin: '10px 0 6px',
                }}
              >
                分析记录
              </div>
              <div className="m11-kv-rows">
                <div className="m11-kv-row">
                  <span className="m11-kv-k">预测模型</span>
                  <span className="m11-kv-v">{activeRec.model}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">算法版本</span>
                  <span className="m11-kv-v">{activeRec.version}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">分析时间</span>
                  <span className="m11-kv-v">{activeRec.fullTime}</span>
                </div>
              </div>

              {activeSeg ? (
                <div className="m11-geo-box">
                  <div className="m11-sub-box-hdr">
                    <span>几何校核摘要</span>
                    <span className="m11-pill-info">专项成果</span>
                  </div>
                  <div className="m11-kv-rows">
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">停车视距</span>
                      <span className="m11-kv-v">
                        {activeSeg.geometryCheck.ssd}
                      </span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">平纵线形 / 超高</span>
                      <span className="m11-kv-v">
                        {activeSeg.geometryCheck.alignment}
                      </span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">横净距 / 硬路肩</span>
                      <span
                        className="m11-kv-v"
                        style={{
                          color: activeSeg.geometryCheck.clearance.includes(
                            '受限'
                          )
                            ? '#fde047'
                            : '#f1f7ff',
                        }}
                      >
                        {activeSeg.geometryCheck.clearance}
                      </span>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {historyOpen ? (
        <AlgoHistoryModal
          records={allRecords}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}
    </div>
  );
}
