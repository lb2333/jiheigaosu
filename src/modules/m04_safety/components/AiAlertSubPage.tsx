'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CheckCircle2,
  Link2,
  Maximize2,
  Pause,
  Play,
  RefreshCw,
  Search,
  Volume2,
  VolumeX,
  XCircle,
} from 'lucide-react';
import {
  AI_ALGORITHMS,
  IMG_PATHS,
  PERIOD_OPTIONS,
  SECTION_META,
  getAiStatusTag,
  periodLabel,
  secName,
  type SafetyAiAlertDTO,
  type SafetyHazardDTO,
} from '../types';
import { AiFullscreenModal, DuplicateAlertModal } from './SafetyModals';

interface AiAlertsResponse {
  period: string;
  stats: {
    total: number;
    pending: number;
    confirmed: number;
    falseAlarm: number;
    duplicate: number;
  };
  listTitle: string;
  total: number;
  page: number;
  totalPages: number;
  items: SafetyAiAlertDTO[];
  pendingCandidates: SafetyHazardDTO[];
}

export function AiAlertSubPage({
  activeSectionId,
  period,
  onSectionChange,
  onPeriodChange,
  onJumpToLedgerHazard,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  onSectionChange: (secId: string | null) => void;
  onPeriodChange: (p: string) => void;
  onJumpToLedgerHazard: (hazardId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [algorithm, setAlgorithm] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [data, setData] = useState<AiAlertsResponse | null>(null);
  const [selectedAiId, setSelectedAiId] = useState('VAI-20261124-008');

  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [scrubSec, setScrubSec] = useState(18);
  const [activeFrameIdx, setActiveFrameIdx] = useState(1);
  const [notesById, setNotesById] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showDuplicateModal, setShowDuplicateModal] = useState(false);

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      algorithm,
      status: statusFilter,
      period,
      page: String(page),
    });
    const res = await fetch(`/api/v1/m04/ai-alerts?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as AiAlertsResponse;
      setData(json);
    }
  }, [activeSectionId, algorithm, statusFilter, period, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // 30s simulated playback timer
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setScrubSec((prev) => {
        const next = (prev + 1) % 31;
        setActiveFrameIdx(next < 12 ? 0 : next < 22 ? 1 : 2);
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [playing]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const selAlert = useMemo(() => {
    return items.find((a) => a.id === selectedAiId) ?? items[0] ?? null;
  }, [items, selectedAiId]);

  const draftNote = selAlert
    ? notesById[selAlert.id] !== undefined
      ? notesById[selAlert.id]
      : selAlert.note || ''
    : '';

  async function handleConfirm() {
    if (!selAlert) return;
    if (selAlert.status === '已确认' && selAlert.linkedHazardId) {
      onJumpToLedgerHazard(selAlert.linkedHazardId);
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m04/ai-alerts/${encodeURIComponent(selAlert.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'confirm',
          note: draftNote,
        }),
      });
      if (res.ok) {
        const result = (await res.json()) as { hazard?: SafetyHazardDTO; hazardId?: string };
        const hid = result.hazard?.id || result.hazardId || '';
        showToast(`已确认预警 ${selAlert.id} 并生成隐患台账 ${hid}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '预警确认操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFalseAlarm() {
    if (!selAlert) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m04/ai-alerts/${encodeURIComponent(selAlert.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'falseAlarm',
          note: draftNote,
        }),
      });
      if (res.ok) {
        showToast(`预警 ${selAlert.id} 已标记为误报`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '标记误报失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDuplicatePick(targetHazardId: string) {
    if (!selAlert) return;
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m04/ai-alerts/${encodeURIComponent(selAlert.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'duplicate',
          linkedHazardId: targetHazardId,
          note: draftNote || `已关联既有隐患 ${targetHazardId}`,
        }),
      });
      if (res.ok) {
        setShowDuplicateModal(false);
        showToast(`已将 ${selAlert.id} 关联至已有隐患 ${targetHazardId}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '重复关联操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setAlgorithm('all');
    setStatusFilter('all');
    onPeriodChange('2026-11');
    setPage(1);
    if (activeSectionId) onSectionChange(null);
    showToast('已重置视频AI预警筛选条件');
  }

  const aiStats = data?.stats ?? {
    total: 0,
    pending: 0,
    confirmed: 0,
    falseAlarm: 0,
    duplicate: 0,
  };

  const frameTime = selAlert?.frames[activeFrameIdx] || selAlert?.frames[1] || '09:12:18';
  const curSecStr = `00:${String(scrubSec).padStart(2, '0')} / 00:30`;

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
            <label>识别算法</label>
            <select
              className="m04-select"
              value={algorithm}
              onChange={(e) => {
                setPage(1);
                setAlgorithm(e.target.value);
              }}
            >
              <option value="all">全部算法</option>
              {AI_ALGORITHMS.map((al) => (
                <option key={al} value={al}>
                  {al}
                </option>
              ))}
            </select>
          </div>
          <div className="m04-filter-item">
            <label>核实状态</label>
            <select
              className="m04-select"
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
            >
              <option value="all">全部状态</option>
              <option value="待核实">待核实</option>
              <option value="已确认">已确认</option>
              <option value="已标误报">已标误报</option>
              <option value="重复关联">重复关联</option>
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
              void loadData();
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

      {/* 视频AI预警概况 */}
      <div className="m04-panel">
        <div className="m04-panel-head">
          <div className="m04-panel-head-left">
            <span className="panel-accent-bar" />
            <span className="panel-title">视频AI预警概况</span>
            <span className="m04-panel-sub">({periodLabel(period)})</span>
          </div>
        </div>
        <div className="m04-panel-body">
          <div className="m04-kpi-grid-5">
            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('all');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-blue">
                <Camera size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">本期预警</div>
                <div className="m04-kpi-val m04-c-cyan">
                  {aiStats.total}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '待核实' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('待核实');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-gold">
                <AlertTriangle size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">待核实</div>
                <div className="m04-kpi-val m04-c-gold">
                  {aiStats.pending}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '已确认' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('已确认');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-green">
                <CheckCircle2 size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">已确认</div>
                <div className="m04-kpi-val m04-c-green">
                  {aiStats.confirmed}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '已标误报' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('已标误报');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-blue">
                <XCircle size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">已标误报</div>
                <div className="m04-kpi-val m04-c-blue">
                  {aiStats.falseAlarm}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>

            <button
              type="button"
              className={`m04-kpi-card ${statusFilter === '重复关联' ? 'active' : ''}`}
              onClick={() => {
                setStatusFilter('重复关联');
                setPage(1);
              }}
            >
              <div className="m04-kpi-ico m04-ico-cyan">
                <Link2 size={18} />
              </div>
              <div>
                <div className="m04-kpi-label">重复关联</div>
                <div className="m04-kpi-val m04-c-cyan">
                  {aiStats.duplicate}
                  <span className="m04-kpi-unit">条</span>
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* 3-Column AI Workspace */}
      <div className="m04-cols-3">
        {/* Left: 待核实预警 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">{data?.listTitle ?? '待核实预警'}</span>
            </div>
            <span className="m04-panel-sub">{data?.total ?? 0} 条</span>
          </div>
          <div className="m04-panel-body">
            <div className="m04-card-list">
              {items.length > 0 ? (
                items.map((a) => (
                  <div
                    key={a.id}
                    className={`m04-list-card ${selAlert?.id === a.id ? 'active' : ''}`}
                    onClick={() => {
                      setSelectedAiId(a.id);
                      setPlaying(false);
                      setScrubSec(18);
                      setActiveFrameIdx(1);
                    }}
                  >
                    <div className="m04-card-ico" style={{ width: '30px', height: '30px' }}>
                      <Camera size={15} />
                    </div>
                    <div className="m04-card-main">
                      <div className="m04-card-title">{a.id}</div>
                      <div className="m04-card-sub">
                        {a.shortTime} &nbsp; {a.shortLoc}
                      </div>
                      <div className="m04-card-sub" style={{ color: '#cfe4ff' }}>
                        {a.event}
                      </div>
                    </div>
                    <span className={`m04-tag ${getAiStatusTag(a.status)}`}>{a.status}</span>
                  </div>
                ))
              ) : (
                <div style={{ color: '#8ab4dc', textAlign: 'center', padding: '24px' }}>
                  当前条件下暂无预警记录
                </div>
              )}
            </div>

            <div className="m04-pager">
              <span className="m04-pager-info">
                显示 {items.length} 条 / 共 {data?.total ?? 0} 条
              </span>
              <button
                type="button"
                className="m04-pg-btn"
                disabled={(data?.page ?? 1) <= 1}
                onClick={() => setPage((data?.page ?? 1) - 1)}
              >
                &lt;
              </button>
              {Array.from({ length: data?.totalPages ?? 1 }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`m04-pg-btn ${p === (data?.page ?? 1) ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                className="m04-pg-btn"
                disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
                onClick={() => setPage((data?.page ?? 1) + 1)}
              >
                &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Center: 预警证据回看 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">预警证据回看</span>
            </div>
            <span className="m04-panel-sub">{selAlert?.timeWindow ?? ''}</span>
          </div>
          {selAlert ? (
            <div className="m04-panel-body">
              <div className="m04-evidence-frame">
                <img
                  src={IMG_PATHS[selAlert.imgKey] || IMG_PATHS.corridor}
                  alt="AI预警视频证据"
                />
                <div className="m04-cam-hud">
                  <span className="m04-hud-pill">{selAlert.camera}</span>
                  <span className="m04-hud-pill">
                    {selAlert.alertTime.slice(0, 10)} {frameTime}
                  </span>
                </div>
                <div
                  className="m04-detect-box"
                  style={{
                    left: `${selAlert.box.left}%`,
                    top: `${selAlert.box.top}%`,
                    width: `${selAlert.box.width}%`,
                    height: `${selAlert.box.height}%`,
                  }}
                >
                  <div className="m04-detect-label">{selAlert.event}</div>
                </div>
                <span className="m04-video-tag">监控画面示意</span>
              </div>

              <div className="m04-player-bar">
                <button
                  type="button"
                  className="m04-act-link"
                  style={{ color: '#fff' }}
                  onClick={() => setPlaying((p) => !p)}
                  title="播放/暂停"
                >
                  {playing ? <Pause size={14} /> : <Play size={14} />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={30}
                  value={scrubSec}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    setScrubSec(v);
                    setActiveFrameIdx(v < 12 ? 0 : v < 22 ? 1 : 2);
                  }}
                  style={{ flex: 1, accentColor: '#38f2ff', cursor: 'pointer' }}
                />
                <span
                  style={{
                    fontSize: '11.5px',
                    color: '#cfe4ff',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {curSecStr}
                </span>
                <button
                  type="button"
                  className="m04-act-link"
                  onClick={() => setMuted((m) => !m)}
                  title="静音"
                >
                  {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
                </button>
                <button
                  type="button"
                  className="m04-act-link"
                  onClick={() => setShowFullscreen(true)}
                  title="全屏查看"
                >
                  <Maximize2 size={14} />
                </button>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '8px',
                  fontSize: '12px',
                  color: '#8ab4dc',
                }}
              >
                <strong style={{ color: '#dbeafe' }}>关联截图</strong>
                <span>选中 {frameTime}</span>
              </div>

              <div className="m04-thumbs-grid">
                {selAlert.frames.map((ft, idx) => (
                  <div
                    key={`${ft}_${idx}`}
                    className={`m04-thumb-card ${idx === activeFrameIdx ? 'active' : ''}`}
                    onClick={() => {
                      setActiveFrameIdx(idx);
                      setScrubSec(idx === 0 ? 8 : idx === 1 ? 18 : 26);
                    }}
                  >
                    <img
                      src={IMG_PATHS[selAlert.imgKey] || IMG_PATHS.corridor}
                      alt={`截图 ${ft}`}
                      style={
                        idx === 0
                          ? { filter: 'brightness(0.95)' }
                          : idx === 2
                            ? { filter: 'contrast(1.06)' }
                            : undefined
                      }
                    />
                    <div className="m04-thumb-time">{ft}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="m04-panel-body" style={{ color: '#8ab4dc', justifyContent: 'center', alignItems: 'center' }}>
              请选择左侧AI预警条目回看证据
            </div>
          )}
        </div>

        {/* Right: 人工核实 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">人工核实</span>
            </div>
          </div>
          {selAlert ? (
            <div className="m04-panel-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>{selAlert.id}</strong>
                <span className={`m04-tag ${getAiStatusTag(selAlert.status)}`}>
                  {selAlert.status}
                </span>
              </div>

              <div className="m04-kv-list">
                <div className="m04-kv-row">
                  <span>预警时间</span>
                  <strong>{selAlert.alertTime}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>所属工区</span>
                  <strong>{secName(selAlert.sectionId)}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>工程位置</span>
                  <strong>{selAlert.location}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>来源设备</span>
                  <strong>{selAlert.camera}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>识别算法</span>
                  <strong>{selAlert.algorithm}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>识别事件</span>
                  <strong className="m04-c-gold">{selAlert.event}</strong>
                </div>
              </div>

              <div className="m04-form-field">
                <label>核实说明</label>
                <textarea
                  className="m04-textarea"
                  placeholder="结合视频回放及截图填写核实依据"
                  value={draftNote}
                  onChange={(e) =>
                    setNotesById((prev) => ({
                      ...prev,
                      [selAlert.id]: e.target.value,
                    }))
                  }
                />
              </div>

              <button
                type="button"
                className="btn-primary-glow"
                style={{
                  width: '100%',
                  justifyContent: 'center',
                  padding: '9px 12px',
                  fontSize: '13px',
                  marginBottom: '8px',
                }}
                disabled={submitting}
                onClick={() => void handleConfirm()}
              >
                <CheckCircle2 size={16} />
                <span>
                  {selAlert.status === '已确认' && selAlert.linkedHazardId
                    ? `查看已转隐患 ${selAlert.linkedHazardId}`
                    : '确认并转入隐患台账'}
                </span>
              </button>

              <div className="m04-btn-pair" style={{ marginBottom: '10px' }}>
                <button
                  type="button"
                  className="m04-btn-ghost"
                  style={{ height: 'auto', justifyContent: 'center', padding: '7px 8px' }}
                  disabled={submitting}
                  onClick={() => void handleFalseAlarm()}
                >
                  <XCircle size={15} />
                  <span>标记误报</span>
                </button>
                <button
                  type="button"
                  className="m04-btn-ghost"
                  style={{ height: 'auto', justifyContent: 'center', padding: '7px 8px' }}
                  disabled={submitting}
                  onClick={() => setShowDuplicateModal(true)}
                >
                  <Link2 size={15} />
                  <span>关联重复</span>
                </button>
              </div>

              <div style={{ fontSize: '11.5px', color: '#8ab4dc', marginBottom: '6px' }}>
                ⓘ 重复线索可关联已有隐患编号。
              </div>

              <div className="m04-panel-foot m04-foot-fab-clear">
                <span>同步于 2026-11-25 10:45</span>
              </div>
            </div>
          ) : (
            <div className="m04-panel-body" style={{ color: '#8ab4dc', justifyContent: 'center', alignItems: 'center' }}>
              暂无选中预警
            </div>
          )}
        </div>
      </div>

      {showFullscreen && selAlert ? (
        <AiFullscreenModal alert={selAlert} onClose={() => setShowFullscreen(false)} />
      ) : null}

      {showDuplicateModal && selAlert ? (
        <DuplicateAlertModal
          alert={selAlert}
          candidates={data?.pendingCandidates ?? []}
          submitting={submitting}
          onPick={handleDuplicatePick}
          onClose={() => setShowDuplicateModal(false)}
        />
      ) : null}
    </div>
  );
}
