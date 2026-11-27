'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import {
  IMG_PATHS,
  SECTION_META,
  getHazardStatusMeta,
  secUnit,
  type SafetyHazardDTO,
} from '../types';
import { BeforeAfterModal } from './SafetyModals';

interface HazardsListResponse {
  allPeriodHazards: SafetyHazardDTO[];
}

export function ReviewSubPage({
  activeSectionId,
  period,
  initialStatusFilter,
  initialSelectedReviewId,
  onSectionChange,
  onBackToLedger,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  initialStatusFilter?: string;
  initialSelectedReviewId?: string;
  onSectionChange: (secId: string | null) => void;
  onBackToLedger: () => void;
  showToast: (msg: string) => void;
}) {
  const [statusFilter, setStatusFilter] = useState(initialStatusFilter || '待复查');
  const [selectedReviewId, setSelectedReviewId] = useState(
    initialSelectedReviewId || 'AQ-202611-018'
  );
  const [allHazards, setAllHazards] = useState<SafetyHazardDTO[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const [reviewer, setReviewer] = useState('监理复查人员A（演示）');
  const [reviewTime, setReviewTime] = useState('2026-11-25 10:20');
  const [reviewNote, setReviewNote] = useState('临边防护已补齐，现场复查情况见附件。');

  useEffect(() => {
    if (initialStatusFilter) setStatusFilter(initialStatusFilter);
  }, [initialStatusFilter]);

  useEffect(() => {
    if (initialSelectedReviewId) setSelectedReviewId(initialSelectedReviewId);
  }, [initialSelectedReviewId]);

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      period,
      page: '1',
    });
    const res = await fetch(`/api/v1/m04/hazards?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as HazardsListResponse;
      setAllHazards(json.allPeriodHazards ?? []);
    }
  }, [activeSectionId, period]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const pendingRevCount = useMemo(
    () => allHazards.filter((h) => h.status === '待复查').length,
    [allHazards]
  );

  const listPool = useMemo(() => {
    const filtered = allHazards.filter((h) => {
      if (statusFilter !== 'all' && h.status !== statusFilter) return false;
      return true;
    });
    return filtered.length > 0 ? filtered : allHazards;
  }, [allHazards, statusFilter]);

  const activeHazard = useMemo(() => {
    const exact = listPool.find((h) => h.id === selectedReviewId);
    if (exact) return exact;
    return (
      listPool.find((h) => h.id === 'AQ-202611-018') ??
      listPool.find((h) => h.status === '待复查') ??
      listPool[0] ??
      null
    );
  }, [listPool, selectedReviewId]);

  useEffect(() => {
    if (activeHazard) {
      setReviewer(activeHazard.reviewer || '监理复查人员A（演示）');
      setReviewTime(activeHazard.reviewTime || '2026-11-25 10:20');
      setReviewNote(
        activeHazard.reviewNote || '临边防护已补齐，现场复查情况见附件。'
      );
    }
  }, [activeHazard]);

  async function handleReviewAction(action: 'approveReview' | 'rejectReview') {
    if (!activeHazard) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m04/hazards/${encodeURIComponent(activeHazard.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action,
            reviewer,
            reviewTime,
            reviewNote:
              action === 'rejectReview' && reviewNote === '临边防护已补齐，现场复查情况见附件。'
                ? '防护细节仍需加固，退回施工单位重新整改。'
                : reviewNote,
          }),
        }
      );
      if (res.ok) {
        setStatusFilter('all');
        showToast(
          action === 'approveReview'
            ? `隐患 ${activeHazard.id} 复查通过并已闭环销项`
            : `隐患 ${activeHazard.id} 已退回施工单位重新整改`
        );
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '复查提交失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const h = activeHazard;
  const hMeta = h ? getHazardStatusMeta(h) : null;

  const stepState: Array<boolean | 'current'> = !h
    ? [true, 'current', false, false, false]
    : h.status === '已销项'
      ? [true, true, true, true, true]
      : h.status === '待复查'
        ? [true, true, true, 'current', false]
        : h.status === '整改中'
          ? [true, true, 'current', false, false]
          : [true, 'current', false, false, false];

  const stepDefs = h
    ? [
        { label: '已核实', sub: (h.foundAt || '11-21 10:18').slice(5) },
        { label: '已派发', sub: (h.dispatchedAt || '11-21 10:46').slice(5) },
        { label: '整改反馈', sub: (h.feedbackAt || '11-23 16:20').slice(5) },
        {
          label: h.status === '已销项' ? '已复查' : '待复查',
          sub:
            h.status === '已销项'
              ? (reviewTime || '11-25 10:20').slice(5)
              : h.status === '待复查'
                ? '当前环节'
                : '待办理',
        },
        { label: '已销项', sub: h.status === '已销项' ? '已完成' : '未完成' },
      ]
    : [];

  return (
    <div className="m04-page m04-compact">
      {/* Top Bar */}
      <div className="m04-filter-bar">
        <div className="m04-filter-group">
          <div className="m04-filter-item">
            <label>办理状态</label>
            <select
              className="m04-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="待复查">待复查 ({pendingRevCount}项)</option>
              <option value="all">全部状态</option>
              <option value="整改中">整改中</option>
              <option value="已销项">已销项</option>
            </select>
          </div>
          <div className="m04-filter-item">
            <label>所属工区</label>
            <select
              className="m04-select"
              value={activeSectionId ?? 'all'}
              onChange={(e) =>
                onSectionChange(e.target.value === 'all' ? null : e.target.value)
              }
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
            <label>隐患编号</label>
            <select
              className="m04-select"
              style={{ minWidth: '170px' }}
              value={h?.id ?? ''}
              onChange={(e) => setSelectedReviewId(e.target.value)}
            >
              {listPool.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.id} · {item.description}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m04-filter-actions">
          <button type="button" className="m04-btn-ghost" onClick={onBackToLedger}>
            &lt; 返回隐患台账
          </button>
        </div>
      </div>

      {/* 2-Column Review Workspace */}
      {h && hMeta ? (
        <div className="m04-split-2">
          {/* Left Column: Header + Evidence + Review Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {/* Header & 5-Step Flow */}
            <div className="m04-panel">
              <div className="m04-panel-head">
                <div className="m04-panel-head-left">
                  <span className="panel-accent-bar" />
                  <span className="panel-title">
                    {h.id} &nbsp; {h.description}
                  </span>
                </div>
                <span className={`m04-tag ${hMeta.cls}`}>{hMeta.label}</span>
              </div>
              <div className="m04-panel-body">
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    flexWrap: 'wrap',
                    fontSize: '12px',
                    color: '#9ec0e6',
                  }}
                >
                  <span>📍 {h.location}</span>
                  <span>🚁 {h.source}</span>
                  <span>👤 {secUnit(h.sectionId)}</span>
                  <span>📅 整改期限 {h.dueFull}</span>
                </div>

                <div className="m04-steps-row">
                  {stepDefs.map((st, idx) => {
                    const stateVal = stepState[idx];
                    const cls =
                      stateVal === true ? 'done' : stateVal === 'current' ? 'current' : '';
                    return (
                      <div key={st.label} style={{ display: 'contents' }}>
                        {idx > 0 ? <span className="m04-step-arrow">&gt;</span> : null}
                        <div className={`m04-step-card ${cls}`}>
                          {stateVal === true ? (
                            <span className="m04-c-green">
                              <CheckCircle2 size={16} />
                            </span>
                          ) : stateVal === 'current' ? (
                            <span className="m04-c-gold">
                              <Clock size={16} />
                            </span>
                          ) : (
                            <span style={{ color: '#648cb8' }}>○</span>
                          )}
                          <div>
                            <div
                              style={{
                                fontSize: '12.5px',
                                fontWeight: 700,
                                color: stateVal === 'current' ? '#fde047' : '#f1f7ff',
                              }}
                            >
                              {st.label}
                            </div>
                            <div
                              style={{
                                fontSize: '11px',
                                color: stateVal === 'current' ? '#fde047' : '#8ab4dc',
                              }}
                            >
                              {st.sub}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 整改前后证据 */}
            <div className="m04-panel">
              <div className="m04-panel-head">
                <div className="m04-panel-head-left">
                  <span className="panel-accent-bar" />
                  <span className="panel-title">整改前后证据</span>
                </div>
                <span className="m04-panel-sub">{h.location}</span>
              </div>
              <div className="m04-panel-body">
                <div className="m04-compare-2col m04-review-photos">
                  <div>
                    <div className="m04-photo-caption">
                      <span>
                        <strong>整改前</strong> &nbsp; {(h.foundAt || '11-21').slice(5, 10)}
                      </span>
                      <span style={{ color: '#8ab4dc' }}>{h.source}影像</span>
                    </div>
                    <div className="m04-photo-box" onClick={() => setShowCompareModal(true)}>
                      <img src={IMG_PATHS.before} alt="整改前现场影像" />
                      <div className="m04-defect-rect" />
                    </div>
                  </div>
                  <div>
                    <div className="m04-photo-caption">
                      <span>
                        <strong>整改后</strong> &nbsp; {(h.feedbackAt || '11-23').slice(5, 10)}
                      </span>
                      <span style={{ color: '#8ab4dc' }}>移动端反馈照片</span>
                    </div>
                    <div className="m04-photo-box" onClick={() => setShowCompareModal(true)}>
                      <img src={IMG_PATHS.after} alt="整改后现场照片" />
                      <div className="m04-guardrail-bar" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 复查办理 */}
            <div className="m04-panel">
              <div className="m04-panel-head">
                <div className="m04-panel-head-left">
                  <span className="panel-accent-bar" />
                  <span className="panel-title">复查办理</span>
                </div>
                <span className="m04-tag m04-tag-blue">
                  {h.status === '已销项' ? '已归档' : '意见草稿'}
                </span>
              </div>
              <div className="m04-panel-body">
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '12px',
                    marginBottom: '9px',
                  }}
                >
                  <div className="m04-form-row-inline" style={{ margin: 0 }}>
                    <label>复查人</label>
                    <input
                      className="m04-input"
                      value={reviewer}
                      onChange={(e) => setReviewer(e.target.value)}
                    />
                  </div>
                  <div className="m04-form-row-inline" style={{ margin: 0 }}>
                    <label>复查时间</label>
                    <input
                      className="m04-input"
                      value={reviewTime}
                      onChange={(e) => setReviewTime(e.target.value)}
                    />
                  </div>
                </div>

                <div className="m04-form-row-inline" style={{ alignItems: 'start' }}>
                  <label style={{ paddingTop: '6px' }}>复查意见</label>
                  <textarea
                    className="m04-textarea m04-review-note"
                    style={{ minHeight: '44px' }}
                    value={reviewNote}
                    onChange={(e) => setReviewNote(e.target.value)}
                  />
                </div>

                <div className="m04-form-row-inline">
                  <label>复查附件</label>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0 10px',
                      height: '30px',
                      borderRadius: '6px',
                      border: '1px solid rgba(56,189,248,0.34)',
                      background: 'rgba(8,28,66,0.75)',
                    }}
                  >
                    <span style={{ fontSize: '12px', color: '#cfe4ff' }}>
                      📎 {h.attachment || '复查现场照片.jpg'}
                    </span>
                    <button
                      type="button"
                      className="m04-text-link"
                      onClick={() => setShowCompareModal(true)}
                    >
                      查看附件 &gt;
                    </button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '2px' }}>
                  <button
                    type="button"
                    className="m04-btn-query"
                    style={{ height: '32px', padding: '0 18px' }}
                    disabled={submitting}
                    onClick={() => void handleReviewAction('approveReview')}
                  >
                    <CheckCircle2 size={15} />
                    <span>复查通过并销项</span>
                  </button>
                  <button
                    type="button"
                    className="m04-btn-gold"
                    style={{ height: '32px' }}
                    disabled={submitting}
                    onClick={() => void handleReviewAction('rejectReview')}
                  >
                    <RefreshCw size={14} />
                    <span>退回重改</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: 整改反馈（移动端） */}
          <div className="m04-panel">
            <div className="m04-panel-head">
              <div className="m04-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">整改反馈（移动端）</span>
              </div>
            </div>
            <div className="m04-panel-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>{h.id}</strong>
                <span
                  className={`m04-tag ${
                    h.feedbackAt || h.status === '待复查' || h.status === '已销项'
                      ? 'm04-tag-green'
                      : 'm04-tag-amber'
                  }`}
                >
                  {h.feedbackAt || h.status === '待复查' || h.status === '已销项'
                    ? '已提交反馈'
                    : '等待反馈'}
                </span>
              </div>

              <div className="m04-kv-list">
                <div className="m04-kv-row">
                  <span>提交单位</span>
                  <strong>{secUnit(h.sectionId)}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>提交人</span>
                  <strong>{h.owner || '整改负责人A（演示）'}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>提交时间</span>
                  <strong>{h.feedbackAt || '2026-11-23 16:20'}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>工程位置</span>
                  <strong>{h.location}</strong>
                </div>
              </div>

              <div className="m04-form-field">
                <label>整改说明</label>
                <div
                  style={{
                    padding: '10px 12px',
                    borderRadius: '7px',
                    background: 'rgba(8,28,66,0.75)',
                    border: '1px solid rgba(56,189,248,0.28)',
                    color: '#e2f0ff',
                    fontSize: '12.5px',
                    minHeight: '62px',
                  }}
                >
                  {h.afterNote || '已完成现场整改并加固防护措施，申请监理复查。'}
                </div>
              </div>

              <div className="m04-form-field">
                <label>整改照片</label>
                <div className="m04-compare-2col">
                  <div style={{ textAlign: 'center' }}>
                    <div
                      className="m04-photo-box"
                      style={{ aspectRatio: '16/10' }}
                      onClick={() => setShowCompareModal(true)}
                    >
                      <img src={IMG_PATHS.after} alt="现场照片 1" />
                      <div className="m04-guardrail-bar" />
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9ec0e6', marginTop: '4px' }}>
                      现场照片 1
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      className="m04-photo-box"
                      style={{ aspectRatio: '16/10' }}
                      onClick={() => setShowCompareModal(true)}
                    >
                      <img src={IMG_PATHS.showcase} alt="现场照片 2" />
                      <div className="m04-guardrail-bar" style={{ bottom: '32%' }} />
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9ec0e6', marginTop: '4px' }}>
                      现场照片 2
                    </div>
                  </div>
                </div>
              </div>

              <div className="m04-review-banner" style={{ marginTop: '6px' }}>
                <CheckCircle2 size={16} />
                <span>
                  {h.status === '已销项'
                    ? '复查已通过，隐患闭环销项'
                    : '整改反馈已提交，等待复查'}
                </span>
              </div>

              <div className="m04-panel-foot m04-foot-fab-clear" style={{ marginTop: '8px' }}>
                <span>提交于 {h.feedbackAt || '2026-11-23 16:20'}</span>
                <button
                  type="button"
                  className="m04-text-link"
                  onClick={() => setShowCompareModal(true)}
                >
                  查看原始反馈 &gt;
                </button>
              </div>
              <div className="m04-panel-foot" style={{ paddingTop: '4px' }}>
                <span>同步于 2026-11-25 10:45</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="m04-panel" style={{ padding: '32px', textAlign: 'center', color: '#8ab4dc' }}>
          正在加载整改复查工单...
        </div>
      )}

      {showCompareModal && h ? (
        <BeforeAfterModal hazard={h} onClose={() => setShowCompareModal(false)} />
      ) : null}
    </div>
  );
}
