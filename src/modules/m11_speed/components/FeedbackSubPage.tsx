'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Car,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  Flag,
  Monitor,
  Search,
} from 'lucide-react';
import type {
  SpeedFeedbackBatchDTO,
  SpeedFeedbackDevice,
  SpeedFeedbackResponse,
} from '../types';
import {
  FeedbackBatchModal,
  FeedbackHistoryModal,
  FeedbackLogModal,
} from './SpeedModals';

export function FeedbackSubPage({
  activeSectionId,
  initialSegId,
  initialBatchId,
  onClearSection,
  showToast,
}: {
  activeSectionId: string | null;
  initialSegId?: string;
  initialBatchId?: string;
  onClearSection: () => void;
  showToast: (msg: string) => void;
}) {
  const [data, setData] = useState<SpeedFeedbackResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [segFilter, setSegFilter] = useState<string>(initialSegId || 'QD-01');
  const [batchFilter, setBatchFilter] = useState<string>(
    initialBatchId || 'FB-20261126-017'
  );
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const [applied, setApplied] = useState({
    seg: initialSegId || 'QD-01',
    batch: initialBatchId || 'FB-20261126-017',
    type: 'all',
  });

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('QB-01-02');
  const [historyOpen, setHistoryOpen] = useState(false);
  const [batchModalOpen, setBatchModalOpen] = useState(false);
  const [logModalOpen, setLogModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchFeedback = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      qs.set('segId', applied.seg);
      if (applied.batch) qs.set('batchId', applied.batch);
      const res = await fetch(`/api/v1/m11/feedback?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as SpeedFeedbackResponse;
      setData(json);
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, applied.seg, applied.batch]);

  useEffect(() => {
    void fetchFeedback();
  }, [fetchFeedback]);

  const batches = useMemo(() => data?.batches ?? [], [data]);
  const allBatches = useMemo(() => data?.allBatches ?? [], [data]);
  const segments = useMemo(() => data?.segments ?? [], [data]);

  const activeBatch: SpeedFeedbackBatchDTO | null = useMemo(() => {
    return (
      batches.find((b) => b.batchId === applied.batch) ?? batches[0] ?? null
    );
  }, [batches, applied.batch]);

  const allDevs = useMemo(() => activeBatch?.devices ?? [], [activeBatch]);
  const shownDevs = useMemo(
    () =>
      applied.type === 'all'
        ? allDevs
        : allDevs.filter((d) => d.type === applied.type),
    [allDevs, applied.type]
  );

  const selDev: SpeedFeedbackDevice | null = useMemo(() => {
    if (shownDevs.length === 0) return null;
    return (
      shownDevs.find((d) => d.id === selectedDeviceId) ??
      shownDevs.find((d) => d.status !== '回执成功') ??
      shownDevs[0]
    );
  }, [shownDevs, selectedDeviceId]);

  const totalDevs = allDevs.length;
  const vslCount = allDevs.filter((d) => d.type === '可变限速标志').length;
  const qbCount = allDevs.filter((d) => d.type === '情报板').length;
  const okCount = allDevs.filter((d) => d.status === '回执成功').length;
  const errCount = allDevs.filter((d) => d.status !== '回执成功').length;

  const handleRetryDispatch = async (batchId: string, deviceId: string) => {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m11/feedback/${encodeURIComponent(batchId)}/retry`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deviceId }),
        }
      );
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        showToast(body.error || '重新下发指令失败');
        return;
      }
      setBatchModalOpen(false);
      showToast(`已通过备用链路重新下发至 ${deviceId}，设备回执成功`);
      await fetchFeedback();
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
            <span className="m11-field-label">发布批次</span>
            <select
              className="m11-select"
              value={batchFilter}
              onChange={(e) => setBatchFilter(e.target.value)}
            >
              {allBatches.map((b) => (
                <option key={b.batchId} value={b.batchId}>
                  {b.batchId}
                </option>
              ))}
            </select>
          </label>
          <label className="m11-field">
            <span className="m11-field-label">设备类型</span>
            <select
              className="m11-select"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="all">全部设备</option>
              <option value="可变限速标志">可变限速标志</option>
              <option value="情报板">情报板</option>
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
                batch: batchFilter,
                type: typeFilter,
              })
            }
          >
            <Search size={13} /> 查询
          </button>
          <button
            type="button"
            className="m11-btn-ghost"
            onClick={() => setHistoryOpen(true)}
          >
            <ExternalLink size={13} /> 查看信息发布记录
          </button>
        </div>
      </div>

      {/* KPI STRIP */}
      <div className="glass-panel m11-kpi-strip">
        <div className="m11-strip-header">
          <span className="panel-accent-bar" />
          <span className="panel-title">本次发布设备反馈</span>
          <span className="panel-subtitle">（截至 2026-11-26 10:05）</span>
        </div>
        <div className="m11-kpi-5">
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Car size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">目标设备</div>
              <div className="m11-kpi-card-val">
                {totalDevs}
                <small>台</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Flag size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">可变限速标志</div>
              <div className="m11-kpi-card-val">
                {vslCount}
                <small>台</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico">
              <Monitor size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">情报板</div>
              <div className="m11-kpi-card-val">
                {qbCount}
                <small>台</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className="m11-kpi-ico green">
              <CheckCircle2 size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">回执成功</div>
              <div className="m11-kpi-card-val green">
                {okCount}
                <small>台</small>
              </div>
            </div>
          </div>
          <div className="m11-kpi-card">
            <div className={`m11-kpi-ico ${errCount > 0 ? 'red' : 'green'}`}>
              <AlertTriangle size={16} />
            </div>
            <div>
              <div className="m11-kpi-card-lbl">回执异常</div>
              <div
                className={`m11-kpi-card-val ${errCount > 0 ? 'red' : 'green'}`}
              >
                {errCount}
                <small>台</small>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN 2-COL WORKSPACE */}
      {loading && !data ? (
        <div className="glass-panel m11-empty-box">正在加载执行反馈数据...</div>
      ) : !activeBatch ? (
        <div className="glass-panel m11-empty-box">
          当前工区暂无信息发布批次记录。
          <div style={{ marginTop: '10px' }}>
            <button
              type="button"
              className="m11-btn-primary"
              onClick={() => {
                onClearSection();
                setSegFilter('all');
                setApplied({ seg: 'all', batch: batchFilter, type: 'all' });
              }}
            >
              查看全线发布回执
            </button>
          </div>
        </div>
      ) : (
        <div className="m11-split-2col">
          {/* LEFT: PIPELINE + DEVICE TABLE */}
          <div
            style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}
          >
            <div className="glass-panel">
              <div className="panel-header">
                <div className="panel-title-group">
                  <span className="panel-accent-bar" />
                  <span className="panel-title">回退建议、发布与回执</span>
                </div>
                <span className="m11-hud-head-meta">
                  {activeBatch.segName} · {activeBatch.directionLabel}
                </span>
              </div>
              <div className="panel-body">
                <div className="m11-pipeline-3">
                  <div className="m11-pipe-card">
                    <div className="m11-sub-box-hdr">
                      <span style={{ color: '#a9c6e8', fontWeight: 500 }}>
                        回退建议
                      </span>
                      <span className="m11-pill-ok">
                        {activeBatch.strategyAuthLabel}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '4px',
                      }}
                    >
                      {activeBatch.strategyId}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#8fb4db' }}>
                      {activeBatch.strategyTimeDesc}
                    </div>
                  </div>
                  <div className="m11-pipe-arrow">&gt;</div>
                  <div className="m11-pipe-card">
                    <div className="m11-sub-box-hdr">
                      <span style={{ color: '#a9c6e8', fontWeight: 500 }}>
                        信息发布
                      </span>
                      <span className="m11-pill-info">
                        {activeBatch.publishState}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '4px',
                      }}
                    >
                      {activeBatch.batchId}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#8fb4db' }}>
                      {activeBatch.publishShortDesc}
                    </div>
                  </div>
                  <div className="m11-pipe-arrow">&gt;</div>
                  <div className="m11-pipe-card">
                    <div className="m11-sub-box-hdr">
                      <span style={{ color: '#a9c6e8', fontWeight: 500 }}>
                        设备执行反馈
                      </span>
                      <span
                        className={
                          errCount > 0 ? 'm11-pill-warn' : 'm11-pill-ok'
                        }
                      >
                        {errCount > 0 ? '有异常' : '全部成功'}
                      </span>
                    </div>
                    <div
                      style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: '#fff',
                        marginBottom: '4px',
                      }}
                    >
                      {totalDevs} 台设备
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#8fb4db' }}>
                      成功 {okCount} 台 · 回执异常 {errCount} 台
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div
              className="glass-panel"
              style={{ flex: 1, display: 'flex', flexDirection: 'column' }}
            >
              <div className="panel-header">
                <div className="panel-title-group">
                  <span className="panel-accent-bar" />
                  <span className="panel-title">设备指令与回执</span>
                </div>
                <span className="m11-hud-head-meta">
                  发布于 {activeBatch.publishTime}
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
                      <th>设备编号</th>
                      <th>设备 / 车道</th>
                      <th>发布指令</th>
                      <th>设备回执</th>
                      <th>回执时间</th>
                      <th>结果</th>
                    </tr>
                  </thead>
                  <tbody>
                    {shownDevs.map((dev) => {
                      const isSel = selDev && dev.id === selDev.id;
                      const isOk = dev.status === '回执成功';
                      return (
                        <tr
                          key={dev.id}
                          className={`m11-tr-selectable ${isSel ? 'm11-tr-selected' : ''}`}
                          onClick={() => setSelectedDeviceId(dev.id)}
                        >
                          <td>
                            <strong>{dev.id}</strong>
                          </td>
                          <td>{dev.name}</td>
                          <td>{dev.cmd}</td>
                          <td>{dev.receipt}</td>
                          <td>{dev.time}</td>
                          <td>
                            <span
                              className={isOk ? 'm11-pill-ok' : 'm11-pill-err'}
                            >
                              {dev.status}
                            </span>
                          </td>
                        </tr>
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
                  <span>按原发布批次关联设备指令、回执及异常</span>
                  <button
                    type="button"
                    className="m11-hud-link"
                    onClick={() => setHistoryOpen(true)}
                  >
                    信息发布记录 &gt;
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: EXCEPTION / DEVICE RECEIPT INSPECTOR */}
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">
                  {selDev && selDev.status !== '回执成功'
                    ? '异常回执详情'
                    : '设备回执详情'}
                </span>
              </div>
            </div>
            <div className="panel-body">
              {selDev ? (
                <>
                  <div
                    className="m11-seg-insp-top"
                    style={{ marginBottom: '10px' }}
                  >
                    <div>
                      <span
                        style={{
                          fontSize: '16px',
                          fontWeight: 800,
                          color: '#fff',
                        }}
                      >
                        {selDev.id}
                      </span>
                      <span
                        style={{
                          fontSize: '12.5px',
                          color: '#b8d7f7',
                          marginLeft: '8px',
                        }}
                      >
                        {selDev.name}
                      </span>
                    </div>
                    <span
                      className={
                        selDev.status === '回执成功'
                          ? 'm11-pill-ok'
                          : 'm11-pill-err'
                      }
                    >
                      {selDev.status}
                    </span>
                  </div>

                  <div className="m11-kv-rows">
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">关联试点</span>
                      <span className="m11-kv-v">{activeBatch.segName}</span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">发布批次</span>
                      <span className="m11-kv-v">{activeBatch.batchId}</span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">发布指令</span>
                      <span className="m11-kv-v">{selDev.cmd}</span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">下发时间</span>
                      <span className="m11-kv-v">
                        {activeBatch.publishTime}
                      </span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">异常记录</span>
                      <span className="m11-kv-v">{selDev.exceptionTime}</span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">设备反馈</span>
                      <span
                        className="m11-kv-v"
                        style={{
                          color:
                            selDev.status === '回执成功'
                              ? '#4ade80'
                              : '#fca5a5',
                        }}
                      >
                        {selDev.receipt}
                      </span>
                    </div>
                    <div className="m11-kv-row">
                      <span className="m11-kv-k">记录来源</span>
                      <span className="m11-kv-v">信息发布</span>
                    </div>
                  </div>

                  <div className="m11-highlight-metric">
                    <span>风险出现至两块限速标志均确认</span>
                    <strong style={{ fontSize: '16px', color: '#38f2ff' }}>
                      {activeBatch.confirmDurationSec} 秒
                    </strong>
                  </div>

                  <div className="m11-sub-box">
                    <div className="m11-sub-box-hdr">
                      <span>同批次回退结果</span>
                    </div>
                    <div className="m11-kv-rows">
                      {activeBatch.sameBatchSummary.map((item, idx) => (
                        <div key={`${item.label}-${idx}`} className="m11-kv-row">
                          <span className="m11-kv-k">{item.label}</span>
                          <span className="m11-kv-v">{item.text}</span>
                        </div>
                      ))}
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
                      className="m11-btn-primary"
                      style={{ justifyContent: 'center' }}
                      onClick={() => setBatchModalOpen(true)}
                    >
                      <ExternalLink size={13} /> 查看发布批次
                    </button>
                    <button
                      type="button"
                      className="m11-btn-ghost"
                      style={{ justifyContent: 'center' }}
                      onClick={() => setLogModalOpen(true)}
                    >
                      <ClipboardList size={14} /> 查看回执日志
                    </button>
                  </div>
                </>
              ) : (
                <div className="m11-empty-box">请选择左侧设备查看回执详情</div>
              )}
            </div>
          </div>
        </div>
      )}

      {historyOpen ? (
        <FeedbackHistoryModal
          batches={allBatches}
          onSelectBatch={(bId, sId) => {
            setSegFilter(sId);
            setBatchFilter(bId);
            setTypeFilter('all');
            setApplied({ seg: sId, batch: bId, type: 'all' });
          }}
          onClose={() => setHistoryOpen(false)}
        />
      ) : null}

      {batchModalOpen && activeBatch && selDev ? (
        <FeedbackBatchModal
          batch={activeBatch}
          selectedDevice={selDev}
          submitting={submitting}
          onRetry={handleRetryDispatch}
          onClose={() => setBatchModalOpen(false)}
        />
      ) : null}

      {logModalOpen && activeBatch && selDev ? (
        <FeedbackLogModal
          batch={activeBatch}
          device={selDev}
          onClose={() => setLogModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
