'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Crosshair,
  Image as ImageIcon,
  Link2,
  Plane,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import {
  CLUE_STATUS_OPTIONS,
  SCENE_OPTIONS,
  SECTIONS,
  statusTagClass,
  type LinkedSafetyOption,
  type UavClueDTO,
} from '../types';
import {
  ClueFullImageModal,
  ClueLocateMapModal,
  LinkDuplicateModal,
  LinkedSafetyLedgerModal,
} from './UavModalsLazy';

interface HazardsResponse {
  clues: UavClueDTO[];
  kpis: {
    total: number;
    pending: number;
    confirmed: number;
    falsePositive: number;
    duplicate: number;
  };
  linkedSafetyHazards: LinkedSafetyOption[];
}

export function HazardsSubPage({
  activeSectionId,
  initialStatusFilter,
  onSectionChange,
  onNavigateRoutes,
  onNavigateSafety,
  showToast,
}: {
  activeSectionId: string | null;
  initialStatusFilter?: string;
  onSectionChange: (secId: string | null) => void;
  onNavigateRoutes: () => void;
  onNavigateSafety: () => void;
  showToast: (msg: string) => void;
}) {
  const [scene, setScene] = useState('全部场景');
  const [status, setStatus] = useState(initialStatusFilter || '全部状态');
  const [period, setPeriod] = useState('2026年11月');
  const [selectedId, setSelectedId] = useState('UAI-20261126-004');
  const [viewMode, setViewMode] = useState<'ai' | 'raw'>('ai');
  const [noteDraft, setNoteDraft] = useState('');
  const [data, setData] = useState<HazardsResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showFullImg, setShowFullImg] = useState(false);
  const [showLocateMap, setShowLocateMap] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [showLinkDup, setShowLinkDup] = useState(false);

  const secParam = activeSectionId ?? 'all';

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: secParam,
      scene,
      status,
      period,
    });
    const res = await fetch(`/api/v1/m09/hazards?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as HazardsResponse;
      setData(json);
    }
  }, [secParam, scene, status, period]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const clues = useMemo(() => data?.clues ?? [], [data]);

  const selClue = useMemo(() => {
    return clues.find((c) => c.id === selectedId) ?? clues[0] ?? null;
  }, [clues, selectedId]);

  useEffect(() => {
    if (selClue) setNoteDraft(selClue.note);
  }, [selClue]);

  async function handleConfirmPush() {
    if (!selClue) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m09/hazards/${encodeURIComponent(selClue.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'confirm', note: noteDraft }),
        }
      );
      if (res.ok) {
        const json = (await res.json()) as { linkedHazard: string };
        showToast(`已确认隐患并推送安全管理台账（${json.linkedHazard}）`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '确认推送安全管理失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleFalsePositive() {
    if (!selClue) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m09/hazards/${encodeURIComponent(selClue.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'falsePositive', note: noteDraft }),
        }
      );
      if (res.ok) {
        showToast(`已将线索 ${selClue.id} 标记为误报`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '标记误报失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLinkDuplicate(linkedHazard: string) {
    if (!selClue) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m09/hazards/${encodeURIComponent(selClue.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'linkDuplicate',
            linkedHazard,
            note: noteDraft,
          }),
        }
      );
      if (res.ok) {
        setShowLinkDup(false);
        showToast(`已将 ${selClue.id} 关联至已有隐患 ${linkedHazard}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '关联已有隐患失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const kpis = data?.kpis ?? {
    total: 18,
    pending: 4,
    confirmed: 10,
    falsePositive: 3,
    duplicate: 1,
  };

  const imgUrl = `/assets/${selClue?.imgSrc || 'milestone_before.jpg'}`;
  const box = selClue?.box ?? { x: 0.56, y: 0.44, w: 0.24, h: 0.31 };

  return (
    <div className="m09-opaque-page">
      {/* Top Filter Bar */}
      <div className="m09-filter-bar">
        <div className="m09-filter-group">
          <label className="m09-field-inline">
            所属工区
            <select
              className="m09-select"
              value={secParam}
              onChange={(e) =>
                onSectionChange(e.target.value === 'all' ? null : e.target.value)
              }
            >
              <option value="all">全部工区</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            巡检场景
            <select
              className="m09-select"
              value={scene}
              onChange={(e) => setScene(e.target.value)}
            >
              {SCENE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            核查状态
            <select
              className="m09-select"
              value={status}
              onChange={(e) => setStatus(e.target.value)}
            >
              {CLUE_STATUS_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            统计周期
            <select
              className="m09-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="2026年11月">2026年11月</option>
              <option value="2026年10月">2026年10月</option>
            </select>
          </label>
        </div>
        <div className="m09-filter-group">
          <button
            type="button"
            className="m09-btn primary"
            onClick={() => {
              void loadData();
              showToast(`共匹配 ${clues.length} 条识别线索`);
            }}
          >
            <Search size={13} /> 查询
          </button>
          <button
            type="button"
            className="m09-btn"
            onClick={() => {
              onSectionChange(null);
              setScene('全部场景');
              setStatus('全部状态');
            }}
          >
            <RotateCcw size={13} /> 重置
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="m09-section-title">
        <span className="panel-accent-bar" /> 识别与核查概况 <small>({period})</small>
      </div>
      <div className="m09-kpi-5">
        <div className="m09-kpi-card" onClick={() => setStatus('全部状态')}>
          <div className="m09-kpi-icon">
            <Plane size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">本期识别线索</div>
            <div className="m09-kpi-num">
              {kpis.total}
              <span>条</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card" onClick={() => setStatus('待核查')}>
          <div className="m09-kpi-icon gold">
            <Search size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">待核查</div>
            <div className="m09-kpi-num gold">
              {kpis.pending}
              <span>条</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card" onClick={() => setStatus('已确认隐患')}>
          <div className="m09-kpi-icon green">
            <ShieldCheck size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">已确认隐患</div>
            <div className="m09-kpi-num">
              {kpis.confirmed}
              <span>项</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card" onClick={() => setStatus('已标误报')}>
          <div className="m09-kpi-icon">
            <RotateCcw size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">已标误报</div>
            <div className="m09-kpi-num">
              {kpis.falsePositive}
              <span>条</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card" onClick={() => setStatus('已关联重复')}>
          <div className="m09-kpi-icon">
            <Link2 size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">已关联重复</div>
            <div className="m09-kpi-num">
              {kpis.duplicate}
              <span>条</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="m09-split-3col">
        {/* Left: Clue List + Linked Safety Ledger */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">待核查线索</span>
            </div>
            <span className="panel-subtitle">{kpis.pending} 条</span>
          </div>
          <div
            className="panel-body"
            style={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
            }}
          >
            <div style={{ maxHeight: '335px', overflowY: 'auto', paddingRight: '2px' }}>
              {clues.slice(0, 8).map((c) => (
                <div
                  key={c.id}
                  className={`m09-list-card ${selClue?.id === c.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(c.id)}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}
                  >
                    <strong style={{ fontSize: '12px', color: '#38f2ff' }}>{c.id}</strong>
                    <span className={`status-tag ${statusTagClass(c.status)}`}>
                      {c.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#fff',
                      margin: '3px 0',
                    }}
                  >
                    {c.title}
                  </div>
                  <div style={{ fontSize: '11.5px', color: 'var(--text-sub)' }}>
                    {c.location}
                  </div>
                  <div
                    style={{
                      fontSize: '11px',
                      color: 'var(--text-muted)',
                      marginTop: '2px',
                    }}
                  >
                    {c.shortTime}
                  </div>
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: '10px',
                padding: '10px',
                borderRadius: '8px',
                background: 'rgba(12,42,92,0.58)',
                border: '1px solid rgba(56,189,248,0.28)',
              }}
            >
              <div
                style={{
                  fontSize: '12.5px',
                  fontWeight: 700,
                  color: '#fff',
                  marginBottom: '6px',
                }}
              >
                已关联安全台账
              </div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '6px',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '12px', color: '#dbeafe' }}>
                  AQ-202611-018·临边防护缺失
                </span>
                <span className="status-tag warn">待复查</span>
              </div>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => setShowSafetyModal(true)}
              >
                查看隐患详情 <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        {/* Center: AI识别影像 */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">AI识别影像</span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                type="button"
                className="m09-btn"
                style={{ padding: '4px 10px' }}
                disabled={!selClue}
                onClick={() => setShowFullImg(true)}
              >
                <ImageIcon size={13} /> 查看原图
              </button>
              <button
                type="button"
                className="m09-btn"
                style={{ padding: '4px 10px' }}
                disabled={!selClue}
                onClick={() => setShowLocateMap(true)}
              >
                <Crosshair size={13} /> 地图定位
              </button>
            </div>
          </div>
          <div className="panel-body">
            {selClue ? (
              <>
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '16/9',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(56,189,248,0.38)',
                    background: '#071b3d',
                  }}
                >
                  <img
                    src={imgUrl}
                    alt={selClue.title}
                    loading="lazy"
                    decoding="async"
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  {viewMode === 'ai' ? (
                    <>
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          left: '12px',
                          padding: '4px 12px',
                          borderRadius: '6px',
                          background: 'rgba(92,62,8,0.88)',
                          border: '1.5px solid #facc15',
                          color: '#fef08a',
                          fontSize: '15px',
                          fontWeight: 800,
                        }}
                      >
                        判读演示
                      </div>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${(box.x * 100).toFixed(1)}%`,
                          top: `${(box.y * 100).toFixed(1)}%`,
                          width: `${(box.w * 100).toFixed(1)}%`,
                          height: `${(box.h * 100).toFixed(1)}%`,
                          border: '2.5px dashed #facc15',
                          background: 'rgba(250,204,21,0.12)',
                          borderRadius: '4px',
                          boxShadow: '0 0 12px rgba(250,204,21,0.35)',
                        }}
                      >
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '-38px',
                            transform: 'translateX(-50%)',
                            padding: '4px 12px',
                            borderRadius: '99px',
                            background: 'rgba(128,84,8,0.94)',
                            border: '1.5px solid #facc15',
                            color: '#fef08a',
                            fontSize: '13px',
                            fontWeight: 800,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {selClue.title}
                        </div>
                        <div
                          style={{
                            position: 'absolute',
                            left: '50%',
                            top: '-12px',
                            width: '2px',
                            height: '12px',
                            background: '#facc15',
                          }}
                        />
                      </div>
                    </>
                  ) : null}
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    fontSize: '12px',
                    color: 'var(--text-sub)',
                    margin: '7px 0 10px',
                  }}
                >
                  <span>{selClue.imgName}</span>
                  <span>{selClue.foundTime}</span>
                  <span>{selClue.wpLabel}</span>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1.35fr',
                    gap: '10px',
                    alignItems: 'stretch',
                  }}
                >
                  <div
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '1fr 1fr',
                      gap: '8px',
                    }}
                  >
                    <div
                      className={`m09-list-card ${viewMode === 'raw' ? 'active' : ''}`}
                      style={{ marginBottom: 0, padding: '5px', textAlign: 'center' }}
                      onClick={() => setViewMode('raw')}
                    >
                      <img
                        src={imgUrl}
                        alt="原始影像"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                        }}
                      />
                      <div style={{ fontSize: '11.5px', marginTop: '3px' }}>原始影像</div>
                    </div>
                    <div
                      className={`m09-list-card ${viewMode === 'ai' ? 'active' : ''}`}
                      style={{ marginBottom: 0, padding: '5px', textAlign: 'center' }}
                      onClick={() => setViewMode('ai')}
                    >
                      <img
                        src={imgUrl}
                        alt="AI标注影像"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '52px',
                          objectFit: 'cover',
                          borderRadius: '4px',
                          border: '1px dashed #facc15',
                        }}
                      />
                      <div style={{ fontSize: '11.5px', marginTop: '3px' }}>
                        AI标注影像
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      padding: '7px 10px',
                      borderRadius: '7px',
                      background: 'rgba(12,42,92,0.52)',
                      border: '1px solid rgba(56,189,248,0.22)',
                    }}
                  >
                    <div className="m09-kv-row" style={{ padding: '3px 0' }}>
                      <span className="m09-kv-k">巡检场景</span>
                      <span className="m09-kv-v">{selClue.scene}</span>
                    </div>
                    <div className="m09-kv-row" style={{ padding: '3px 0' }}>
                      <span className="m09-kv-k">识别规则</span>
                      <span className="m09-kv-v">{selClue.rule}</span>
                    </div>
                    <div
                      className="m09-kv-row"
                      style={{ padding: '3px 0', borderBottom: 'none' }}
                    >
                      <span className="m09-kv-k">证据来源</span>
                      <span className="m09-kv-v">{selClue.source}</span>
                    </div>
                  </div>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Right: 人工核查 */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">人工核查</span>
            </div>
          </div>
          <div className="panel-body">
            {selClue ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <strong style={{ fontSize: '15px', color: '#fff' }}>{selClue.id}</strong>
                  <span className={`status-tag ${statusTagClass(selClue.status)}`}>
                    {selClue.status}
                  </span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">关联任务</span>
                  <span className="m09-kv-v">{selClue.taskId}</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">工程位置</span>
                  <span className="m09-kv-v">{selClue.location}</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">发现时间</span>
                  <span className="m09-kv-v">{selClue.foundTime}</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">关联航点</span>
                  <span className="m09-kv-v">{selClue.waypoint}</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">建议类别</span>
                  <span className="m09-kv-v" style={{ color: '#facc15' }}>
                    {selClue.category}
                  </span>
                </div>
                <div className="m09-kv-row" style={{ marginBottom: '8px' }}>
                  <span className="m09-kv-k">核查人</span>
                  <span className="m09-kv-v">{selClue.reviewer}</span>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '10px' }}>
                  <span className="m09-form-lbl">核查说明</span>
                  <textarea
                    className="m09-input"
                    rows={3}
                    style={{ resize: 'vertical', fontFamily: 'inherit' }}
                    value={noteDraft}
                    onChange={(e) => setNoteDraft(e.target.value)}
                  />
                </div>
                <button
                  type="button"
                  className="m09-btn primary"
                  style={{ width: '100%', marginBottom: '8px', padding: '8px 12px' }}
                  disabled={submitting}
                  onClick={() => void handleConfirmPush()}
                >
                  <CheckCircle2 size={14} /> 确认并推送安全管理
                </button>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '7px',
                    marginBottom: '10px',
                  }}
                >
                  <button
                    type="button"
                    className="m09-btn"
                    disabled={submitting}
                    onClick={() => void handleFalsePositive()}
                  >
                    ⊗ 标记误报
                  </button>
                  <button
                    type="button"
                    className="m09-btn"
                    disabled={submitting}
                    onClick={() => setShowLinkDup(true)}
                  >
                    <Link2 size={13} /> 关联已有隐患
                  </button>
                </div>
                <div className="m09-hint-box">
                  ⓘ 人工确认后，关联隐患编号及取证影像将同步至安全管理。
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {showFullImg && selClue ? (
        <ClueFullImageModal clue={selClue} onClose={() => setShowFullImg(false)} />
      ) : null}

      {showLocateMap && selClue ? (
        <ClueLocateMapModal
          clue={selClue}
          onClose={() => setShowLocateMap(false)}
          onJumpRoutes={onNavigateRoutes}
        />
      ) : null}

      {showSafetyModal ? (
        <LinkedSafetyLedgerModal
          onClose={() => setShowSafetyModal(false)}
          onJumpSafety={onNavigateSafety}
        />
      ) : null}

      {showLinkDup && selClue ? (
        <LinkDuplicateModal
          clue={selClue}
          options={data?.linkedSafetyHazards ?? []}
          submitting={submitting}
          onConfirm={handleLinkDuplicate}
          onClose={() => setShowLinkDup(false)}
        />
      ) : null}
    </div>
  );
}
