'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Download,
  FileText,
  Image as ImageIcon,
  Link2,
  PenTool,
  RotateCcw,
  Route,
  Save,
  Search,
  Video,
} from 'lucide-react';
import {
  REPORT_TYPE_OPTIONS,
  SECTIONS,
  statusTagClass,
  type UavReportDTO,
  type UavTaskDTO,
} from '../types';
import { A4ReportSheet } from './A4ReportSheet';
import {
  NewReportDraftModal,
  ReportCompareModal,
  ReportPdfModal,
} from './UavModalsLazy';

interface ReportsResponse {
  reports: UavReportDTO[];
  tasks: UavTaskDTO[];
  kpis: {
    total: number;
    archived: number;
    recheck: number;
    draft: number;
    samePoint: number;
  };
}

export function ReportsSubPage({
  activeSectionId,
  onSectionChange,
  onNavigateSafety,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  onNavigateSafety: () => void;
  showToast: (msg: string) => void;
}) {
  const [type, setType] = useState('全部类型');
  const [period, setPeriod] = useState('2026年11月');
  const [keyword, setKeyword] = useState('');
  const [selectedId, setSelectedId] = useState('RPT-20261126-03');
  const [pageNo, setPageNo] = useState<1 | 2>(1);
  const [data, setData] = useState<ReportsResponse | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [showPdfModal, setShowPdfModal] = useState(false);
  const [showCompareModal, setShowCompareModal] = useState(false);
  const [showNewDraft, setShowNewDraft] = useState(false);

  const secParam = activeSectionId ?? 'all';

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: secParam,
      type,
      period,
      keyword,
    });
    const res = await fetch(`/api/v1/m09/reports?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as ReportsResponse;
      setData(json);
    }
  }, [secParam, type, period, keyword]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const reports = useMemo(() => data?.reports ?? [], [data]);
  const selRpt = useMemo(() => {
    return reports.find((r) => r.id === selectedId) ?? reports[0] ?? null;
  }, [reports, selectedId]);

  async function handleCreateDraft(payload: {
    title: string;
    taskId: string;
    type: '专项巡检报告' | '全面巡检报告' | '复查报告';
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m09/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        const json = (await res.json()) as { report: UavReportDTO };
        setShowNewDraft(false);
        setSelectedId(json.report.id);
        setPageNo(1);
        showToast(`已生成报告草稿 ${json.report.id}`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '生成报告草稿失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleArchiveReport() {
    if (!selRpt) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m09/reports/${encodeURIComponent(selRpt.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'archive' }),
        }
      );
      if (res.ok) {
        showToast(`报告 ${selRpt.id} 已正式归档`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '归档操作失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const kpis = data?.kpis ?? {
    total: 16,
    archived: 13,
    recheck: 2,
    draft: 1,
    samePoint: 3,
  };

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
            报告类型
            <select
              className="m09-select"
              value={type}
              onChange={(e) => setType(e.target.value)}
            >
              {REPORT_TYPE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            报告日期
            <select
              className="m09-select"
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
            >
              <option value="2026年11月">2026年11月</option>
              <option value="2026年10月">2026年10月</option>
            </select>
          </label>
          <label className="m09-field-inline">
            关键词
            <input
              className="m09-input"
              placeholder="报告名称或任务编号"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              style={{ width: '170px' }}
            />
          </label>
        </div>
        <div className="m09-filter-group">
          <button
            type="button"
            className="m09-btn primary"
            onClick={() => {
              void loadData();
              showToast(`共筛选出 ${reports.length} 份巡检报告`);
            }}
          >
            <Search size={13} /> 查询
          </button>
          <button
            type="button"
            className="m09-btn"
            onClick={() => {
              onSectionChange(null);
              setType('全部类型');
              setKeyword('');
            }}
          >
            <RotateCcw size={13} /> 重置
          </button>
          <button
            type="button"
            className="m09-btn"
            onClick={() => setShowNewDraft(true)}
          >
            + 生成报告草稿
          </button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="m09-section-title">
        <span className="panel-accent-bar" /> 报告归档概况 <small>({period})</small>
      </div>
      <div className="m09-kpi-5">
        <div className="m09-kpi-card">
          <div className="m09-kpi-icon">
            <FileText size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">本期报告</div>
            <div className="m09-kpi-num">
              {kpis.total}
              <span>份</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card">
          <div className="m09-kpi-icon green">
            <Save size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">已归档</div>
            <div className="m09-kpi-num green">
              {kpis.archived}
              <span>份</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card">
          <div className="m09-kpi-icon gold">
            <Search size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">待复查</div>
            <div className="m09-kpi-num gold">
              {kpis.recheck}
              <span>份</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card">
          <div className="m09-kpi-icon">
            <PenTool size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">报告草稿</div>
            <div className="m09-kpi-num">
              {kpis.draft}
              <span>份</span>
            </div>
          </div>
        </div>
        <div className="m09-kpi-card">
          <div className="m09-kpi-icon">
            <Video size={16} />
          </div>
          <div>
            <div className="m09-kpi-lbl">同点位复查记录</div>
            <div className="m09-kpi-num">
              {kpis.samePoint}
              <span>次</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3-Column Workspace */}
      <div className="m09-split-3col">
        {/* Left: Report List */}
        <div className="glass-panel" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">巡检报告列表</span>
            </div>
            <span className="panel-subtitle">本期 {kpis.total} 份</span>
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
            <div style={{ maxHeight: '330px', overflowY: 'auto' }}>
              {reports.slice(0, 8).map((r) => (
                <div
                  key={r.id}
                  className={`m09-list-card ${selRpt?.id === r.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedId(r.id);
                    setPageNo(1);
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                    }}
                  >
                    <strong style={{ fontSize: '13px', color: '#fff' }}>{r.title}</strong>
                    <span className={`status-tag ${statusTagClass(r.status)}`}>
                      {r.status}
                    </span>
                  </div>
                  <div
                    style={{
                      fontSize: '11.5px',
                      color: 'var(--text-sub)',
                      marginTop: '3px',
                    }}
                  >
                    {r.id}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {r.taskId}
                  </div>
                </div>
              ))}
            </div>

            {selRpt ? (
              <div
                style={{
                  marginTop: '10px',
                  paddingTop: '8px',
                  borderTop: '1px solid rgba(56,189,248,0.18)',
                }}
              >
                <div className="m09-kv-row">
                  <span className="m09-kv-k">
                    <Route size={13} /> 飞行记录
                  </span>
                  <span className="m09-kv-v">{selRpt.flightRecCount} 条</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">
                    <ImageIcon size={13} /> 巡检与复查影像
                  </span>
                  <span className="m09-kv-v">{selRpt.photoCount} 张</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">
                    <Video size={13} /> 录像
                  </span>
                  <span className="m09-kv-v">{selRpt.videoCount} 段</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">
                    <Link2 size={13} /> 关联隐患
                  </span>
                  <span className="m09-kv-v">{selRpt.hazardCount} 项</span>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* Center: A4 Document Preview */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">巡检报告预览</span>
            </div>
            {selRpt ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className={`status-tag ${statusTagClass(selRpt.status)}`}>
                  {selRpt.status}
                </span>
                {selRpt.status !== '已归档' ? (
                  <button
                    type="button"
                    className="m09-btn primary"
                    style={{ padding: '4px 10px' }}
                    disabled={submitting}
                    onClick={() => void handleArchiveReport()}
                  >
                    <Save size={13} /> 归档确认
                  </button>
                ) : null}
                <button
                  type="button"
                  className="m09-btn"
                  style={{ padding: '4px 10px' }}
                  onClick={() => setShowPdfModal(true)}
                >
                  <Download size={13} /> 下载 PDF
                </button>
              </div>
            ) : null}
          </div>
          <div className="panel-body">
            {selRpt ? (
              <>
                <A4ReportSheet report={selRpt} pageNo={pageNo} />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    marginTop: '11px',
                    fontSize: '12px',
                    color: 'var(--text-sub)',
                  }}
                >
                  <button
                    type="button"
                    className="m09-page-btn"
                    onClick={() => setPageNo((p) => (p === 2 ? 1 : 2))}
                  >
                    &lt;
                  </button>
                  <span>{pageNo} / 2</span>
                  <button
                    type="button"
                    className="m09-page-btn"
                    onClick={() => setPageNo((p) => (p === 1 ? 2 : 1))}
                  >
                    &gt;
                  </button>
                  <span style={{ marginLeft: '8px' }}>100%</span>
                  <span>归档于 {selRpt.archiveTime}</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        {/* Right: 复查与关联成果 */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">复查与关联成果</span>
            </div>
          </div>
          <div className="panel-body">
            {selRpt ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <strong style={{ fontSize: '15px', color: '#fff' }}>
                    {selRpt.hazardId}
                  </strong>
                  <span className={`status-tag ${statusTagClass(selRpt.hazardState)}`}>
                    {selRpt.hazardState}
                  </span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">发现问题</span>
                  <span className="m09-kv-v">{selRpt.hazardDesc}</span>
                </div>
                <div className="m09-kv-row">
                  <span className="m09-kv-k">工程位置</span>
                  <span className="m09-kv-v">{selRpt.location}</span>
                </div>
                <div className="m09-kv-row" style={{ marginBottom: '10px' }}>
                  <span className="m09-kv-k">复查方式</span>
                  <span className="m09-kv-v">无人机同点位取证</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '6px',
                  }}
                >
                  <strong style={{ fontSize: '12.5px', color: '#fff' }}>
                    同点位影像对比
                  </strong>
                  <button
                    type="button"
                    className="m09-link-btn"
                    onClick={() => setShowCompareModal(true)}
                  >
                    并排查看
                  </button>
                </div>
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid rgba(56,189,248,0.35)',
                      }}
                    >
                      <img
                        src="/assets/milestone_before.jpg"
                        alt="原巡检"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '78px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '8%',
                          bottom: '16%',
                          width: '38%',
                          height: '32%',
                          border: '1.5px dashed #facc15',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-sub)',
                        marginTop: '4px',
                      }}
                    >
                      原巡检 {selRpt.origTime}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div
                      style={{
                        position: 'relative',
                        borderRadius: '6px',
                        overflow: 'hidden',
                        border: '1px solid rgba(56,189,248,0.35)',
                      }}
                    >
                      <img
                        src="/assets/milestone_after.jpg"
                        alt="复查取证"
                        loading="lazy"
                        decoding="async"
                        style={{
                          width: '100%',
                          height: '78px',
                          objectFit: 'cover',
                          display: 'block',
                        }}
                      />
                      <div
                        style={{
                          position: 'absolute',
                          right: '8%',
                          bottom: '16%',
                          width: '38%',
                          height: '32%',
                          border: '1.5px dashed #22c55e',
                        }}
                      />
                    </div>
                    <div
                      style={{
                        fontSize: '11px',
                        color: 'var(--text-sub)',
                        marginTop: '4px',
                      }}
                    >
                      复查取证 {selRpt.recheckTime}
                    </div>
                  </div>
                </div>

                {/* 3-Step Timeline */}
                <div
                  style={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    marginBottom: '12px',
                  }}
                >
                  {selRpt.timeline.map((tl, idx) => (
                    <div
                      key={`${tl.date}-${idx}`}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontSize: '12px',
                      }}
                    >
                      <span style={{ color: tl.done ? '#38f2ff' : '#facc15' }}>
                        {tl.done ? '✓' : '○'}
                      </span>
                      <span style={{ color: 'var(--text-muted)', minWidth: '46px' }}>
                        {tl.date}
                      </span>
                      <span style={{ color: '#e6f2ff' }}>{tl.text}</span>
                    </div>
                  ))}
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '8px',
                  }}
                >
                  <button
                    type="button"
                    className="m09-btn"
                    onClick={() => setShowCompareModal(true)}
                  >
                    <ImageIcon size={13} /> 查看全部影像
                  </button>
                  <button
                    type="button"
                    className="m09-btn primary"
                    onClick={onNavigateSafety}
                  >
                    <Link2 size={13} /> 进入安全管理
                  </button>
                </div>
              </>
            ) : null}
          </div>
        </div>
      </div>

      {showPdfModal && selRpt ? (
        <ReportPdfModal
          report={selRpt}
          onDownload={() => {
            setShowPdfModal(false);
            showToast(`已生成并开始下载 ${selRpt.id}_${selRpt.title}.pdf`);
          }}
          onClose={() => setShowPdfModal(false)}
        />
      ) : null}

      {showCompareModal && selRpt ? (
        <ReportCompareModal
          report={selRpt}
          onClose={() => setShowCompareModal(false)}
        />
      ) : null}

      {showNewDraft ? (
        <NewReportDraftModal
          tasks={data?.tasks ?? []}
          submitting={submitting}
          onSubmit={handleCreateDraft}
          onClose={() => setShowNewDraft(false)}
        />
      ) : null}
    </div>
  );
}
