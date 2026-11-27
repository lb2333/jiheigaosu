'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Download,
  FileSpreadsheet,
  FileText,
  Info,
  RotateCcw,
  Search,
  Upload,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { ReportFilePreviewModal, UploadReportModal } from '../MaterialModals';
import {
  DEFAULT_YARDS,
  REPORT_DATES,
  statusTone,
  type MaterialInventoryDTO,
  type MaterialReportDTO,
  type MaterialYardDTO,
} from '../types';

const INITIAL_REPORTS: MaterialReportDTO[] = [
  {
    code: 'BL-20261126-A2',
    sectionId: 'sec2',
    sectionName: '二工区',
    yardId: 'yd-2',
    yardName: '料场示例A',
    version: 'V1.3',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:51',
    uploadFull: '2026-11-26 10:51',
    fieldCheck: '通过',
    confirmStatus: '待确认',
    fileName: '二工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '二工区看板当前使用 V1.2，确认时间 2026-11-26 10:42。',
    history: [
      { version: 'V1.3', time: '11-26 10:51', record: '字段检查通过', status: '待确认', uploader: '备料管理员A', rows: 5 },
      { version: 'V1.2', time: '11-26 10:42', record: '备料管理员A确认', status: '当前使用', uploader: '备料管理员A', rows: 5 },
      { version: 'V1.1', time: '11-25 17:30', record: '备料管理员A确认', status: '历史版本', uploader: '备料管理员A', rows: 5 },
    ],
    sortOrder: 1,
  },
];

export function ReportSubPage({
  activeSectionId,
  onSectionChange,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  showToast: (msg: string) => void;
}) {
  const [date, setDate] = useState<string>('2026-11-26');
  const [confirmStatus, setConfirmStatus] = useState<string>('');
  const [keyword, setKeyword] = useState<string>('');
  const [selectedCode, setSelectedCode] = useState<string>('BL-20261126-A2');

  const [yards, setYards] = useState<MaterialYardDTO[]>(DEFAULT_YARDS);
  const [reports, setReports] = useState<MaterialReportDTO[]>(INITIAL_REPORTS);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [previewPayload, setPreviewPayload] = useState<{
    report: MaterialReportDTO;
    version?: string;
    items: MaterialInventoryDTO[];
  } | null>(null);

  const fetchReports = useCallback(async () => {
    const params = new URLSearchParams();
    if (activeSectionId) params.set('sectionId', activeSectionId);
    if (date) params.set('date', date);
    if (confirmStatus) params.set('confirmStatus', confirmStatus);
    if (keyword.trim()) params.set('q', keyword.trim());

    try {
      const res = await fetch(`/api/v1/m07/reports?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        yards?: MaterialYardDTO[];
        reports?: MaterialReportDTO[];
      };
      if (json.yards?.length) setYards(json.yards);
      if (json.reports) {
        setReports(json.reports);
        if (json.reports.length > 0 && !json.reports.some((r) => r.code === selectedCode)) {
          setSelectedCode(json.reports[0].code);
        }
      }
    } catch {
      // Keep current display on transient error
    }
  }, [activeSectionId, date, confirmStatus, keyword, selectedCode]);

  useEffect(() => {
    void fetchReports();
  }, [fetchReports]);

  const selected =
    reports.find((r) => r.code === selectedCode) ?? reports[0] ?? INITIAL_REPORTS[0];
  const isPending = selected.confirmStatus === '待确认';

  async function openReportFilePreview(rep: MaterialReportDTO, versionOverride?: string) {
    try {
      const res = await fetch(
        `/api/v1/m07/yard?sectionId=${encodeURIComponent(rep.sectionId)}&period=${encodeURIComponent('2026年11月')}`,
        { cache: 'no-store' }
      );
      if (res.ok) {
        const json = (await res.json()) as { items?: MaterialInventoryDTO[] };
        setPreviewPayload({
          report: rep,
          version: versionOverride,
          items: json.items ?? [],
        });
        return;
      }
    } catch {
      // fallback empty list
    }
    setPreviewPayload({ report: rep, version: versionOverride, items: [] });
  }

  async function handleUploadReport(sectionId: string, fileName: string) {
    setUploading(true);
    try {
      const res = await fetch('/api/v1/m07/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sectionId, fileName, reportDate: date }),
      });
      const json = (await res.json()) as { report?: MaterialReportDTO; error?: string };
      if (!res.ok) {
        showToast(json.error ?? '上传报表失败');
        return;
      }
      if (json.report) {
        setSelectedCode(json.report.code);
      }
      setUploadOpen(false);
      showToast(`已上传 ${json.report?.sectionName ?? ''} 备料报表并通过 12 项字段校验`);
      await fetchReports();
    } catch {
      showToast('上传报表请求失败，请检查网络连接');
    } finally {
      setUploading(false);
    }
  }

  async function handleConfirmReport() {
    if (!selected || !isPending) return;
    setConfirming(true);
    try {
      const res = await fetch(`/api/v1/m07/reports/${encodeURIComponent(selected.code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm' }),
      });
      const json = (await res.json()) as { report?: MaterialReportDTO; error?: string };
      if (!res.ok) {
        showToast(json.error ?? '确认报表失败');
        return;
      }
      showToast(
        `${selected.code}（${selected.version}）已确认生效并同步至${selected.sectionName}看板`
      );
      await fetchReports();
    } catch {
      showToast('确认报表请求失败');
    } finally {
      setConfirming(false);
    }
  }

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
              onChange={(e) => onSectionChange(e.target.value || null)}
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
            <span className="m07-field-label">统计日期</span>
            <select
              className="glass-select m07-select"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            >
              {REPORT_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">确认状态</span>
            <select
              className="glass-select m07-select"
              value={confirmStatus}
              onChange={(e) => setConfirmStatus(e.target.value)}
            >
              <option value="">全部状态</option>
              <option value="待确认">待确认</option>
              <option value="已确认">已确认</option>
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">关键词</span>
            <span className="m07-search-wrap">
              <span className="m07-search-ico">
                <Search size={14} />
              </span>
              <input
                className="m07-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void fetchReports();
                }}
                placeholder="搜索报表编号"
              />
            </span>
          </div>
        </div>

        <div className="m07-filter-actions">
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() => {
              void fetchReports();
              showToast('已刷新报表列表');
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() => {
              setDate('2026-11-26');
              setConfirmStatus('');
              setKeyword('');
              onSectionChange(null);
              showToast('已重置报表筛选条件');
            }}
          >
            <RotateCcw size={14} /> 重置
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() =>
              showToast('已下载《全周期备料管理固定模板_V1.0.xlsx》（含 12 列标准校验字段）')
            }
          >
            <Download size={14} /> 下载固定模板
          </button>
          <button
            type="button"
            className="m07-btn-primary"
            onClick={() => setUploadOpen(true)}
          >
            <Upload size={14} /> 上传报表
          </button>
        </div>
      </div>

      {/* Stepper Panel */}
      <GlassPanel
        title="报表填报流程"
        headerRight={<div className="m07-header-right">统计口径 {date} 10:40</div>}
        bodyClassName="m07-panel-body-flush"
      >
        <div className="m07-stepper">
          <div className="m07-step-card">
            <span className="m07-step-ico">
              <FileSpreadsheet size={16} />
            </span>
            <div>
              <div className="m07-step-title">下载固定模板</div>
              <div className="m07-step-sub">模板 V1.0</div>
            </div>
          </div>
          <span className="m07-step-arrow">
            <ChevronRight size={14} />
          </span>
          <div className="m07-step-card">
            <span className="m07-step-ico">
              <Upload size={16} />
            </span>
            <div>
              <div className="m07-step-title">上传备料报表</div>
              <div className="m07-step-sub">
                {selected.sectionName} · {selected.version}
              </div>
            </div>
          </div>
          <span className="m07-step-arrow">
            <ChevronRight size={14} />
          </span>
          <div className="m07-step-card">
            <span className="m07-step-ico">
              <ClipboardList size={16} />
            </span>
            <div>
              <div className="m07-step-title">字段检查</div>
              <div className="m07-step-sub">必填字段已通过</div>
            </div>
          </div>
          <span className="m07-step-arrow">
            <ChevronRight size={14} />
          </span>
          <div className={`m07-step-card ${isPending ? 'active-warn' : 'active-ok'}`}>
            <span className="m07-step-ico">
              <CheckCircle2 size={16} />
            </span>
            <div>
              <div className="m07-step-title">确认报表</div>
              <div className="m07-step-sub">{isPending ? '待确认' : '已确认生效'}</div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Main Split */}
      <div className="m07-p2-grid">
        <div className="m07-stack">
          <GlassPanel
            title="报表列表"
            className="m07-table-panel"
            bodyClassName="m07-panel-body-flush"
            headerRight={<div className="m07-header-right">{date}</div>}
          >
            <div className="m07-table-wrap">
              <table className="data-table m07-table">
                <thead>
                  <tr>
                    <th>报表编号</th>
                    <th>填报工区</th>
                    <th>报表版本</th>
                    <th>统计截至</th>
                    <th>上传时间</th>
                    <th>字段校验</th>
                    <th>确认状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.length > 0 ? (
                    reports.map((r) => (
                      <tr
                        key={r.code}
                        className={r.code === selected.code ? 'selected' : ''}
                        onClick={() => setSelectedCode(r.code)}
                      >
                        <td>{r.code}</td>
                        <td>{r.sectionName}</td>
                        <td>{r.version}</td>
                        <td>{r.cutoff}</td>
                        <td>{r.uploadTime}</td>
                        <td>
                          <StatusBadge text={r.fieldCheck} tone="ok" />
                        </td>
                        <td>
                          <StatusBadge text={r.confirmStatus} tone={statusTone(r.confirmStatus)} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m07-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              void openReportFilePreview(r);
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                        未找到符合条件的报表
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="m07-pagination">
              <span>本期显示 {reports.length} 份报表</span>
              <button type="button" className="m07-page-btn" disabled>
                <ChevronLeft size={12} />
              </button>
              <button type="button" className="m07-page-btn active">
                1
              </button>
              <button type="button" className="m07-page-btn" disabled>
                <ChevronRight size={12} />
              </button>
            </div>
          </GlassPanel>

          <GlassPanel
            title="历史版本与确认记录"
            className="m07-table-panel"
            bodyClassName="m07-panel-body-flush"
            headerRight={
              <div className="m07-header-right">
                {selected.code} &nbsp; {selected.sectionName}
              </div>
            }
          >
            <div className="m07-table-wrap" style={{ paddingBottom: '10px' }}>
              <table className="data-table m07-table">
                <thead>
                  <tr>
                    <th>版本</th>
                    <th>记录时间</th>
                    <th>确认记录</th>
                    <th>版本状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {selected.history.map((h, i) => (
                    <tr key={`${h.version}-${i}`} className={i === 0 ? 'selected' : ''}>
                      <td>{h.version}</td>
                      <td>{h.time}</td>
                      <td>{h.record}</td>
                      <td>
                        <StatusBadge text={h.status} tone={statusTone(h.status)} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m07-link-btn"
                          onClick={() => void openReportFilePreview(selected, h.version)}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </GlassPanel>
        </div>

        {/* Right Verify & Confirm Panel */}
        <GlassPanel title="报表校验与确认" bodyClassName="m07-panel-body-flush">
          <div className="m07-verify-body">
            <div className="m07-file-hdr">
              <span className="m07-file-title">
                <FileSpreadsheet size={15} color="#34d399" />
                {selected.fileName}
              </span>
              <StatusBadge
                text={`${selected.version} ${selected.confirmStatus}`}
                tone={statusTone(selected.confirmStatus)}
              />
            </div>

            <div className="m07-kv-list">
              <div className="m07-kv-row">
                <span className="m07-kv-k">报表编号</span>
                <span className="m07-kv-v">{selected.code}</span>
              </div>
              <div className="m07-kv-row">
                <span className="m07-kv-k">填报工区</span>
                <span className="m07-kv-v">{selected.sectionName}</span>
              </div>
              <div className="m07-kv-row">
                <span className="m07-kv-k">模板版本</span>
                <span className="m07-kv-v">{selected.templateVer}</span>
              </div>
              <div className="m07-kv-row">
                <span className="m07-kv-k">统计截至</span>
                <span className="m07-kv-v">{selected.cutoffFull}</span>
              </div>
              <div className="m07-kv-row">
                <span className="m07-kv-k">上传时间</span>
                <span className="m07-kv-v">{selected.uploadFull}</span>
              </div>
            </div>

            <div className="m07-check-box">
              <div className="m07-check-hdr">
                <span>字段检查结果</span>
                <StatusBadge text="全部通过" tone="ok" />
              </div>
              <div className="m07-check-row">
                <span className="m07-check-left">
                  <CheckCircle2 size={13} /> 必填字段
                </span>
                <span className="m07-check-right">12 / 12 列齐全</span>
              </div>
              <div className="m07-check-row">
                <span className="m07-check-left">
                  <CheckCircle2 size={13} /> 数量及单位
                </span>
                <span className="m07-check-right">数量字段有效，单位为 t</span>
              </div>
              <div className="m07-check-row">
                <span className="m07-check-left">
                  <CheckCircle2 size={13} /> 库存口径
                </span>
                <span className="m07-check-right">可用库存 ≤ 实物库存</span>
              </div>
              <div className="m07-check-row">
                <span className="m07-check-left">
                  <CheckCircle2 size={13} /> 统计时间
                </span>
                <span className="m07-check-right">截止时间已填写</span>
              </div>
            </div>

            <div className="m07-info-banner">
              <Info size={14} />
              <span>{selected.currentBoardNotice}</span>
            </div>

            <div className="m07-btn-row-2">
              <button
                type="button"
                className="m07-btn-primary"
                disabled={!isPending || confirming}
                onClick={() => void handleConfirmReport()}
              >
                <CheckCircle2 size={13} />{' '}
                {confirming ? '确认中...' : isPending ? '确认报表' : '报表已确认'}
              </button>
              <button
                type="button"
                className="m07-btn-outline"
                onClick={() => void openReportFilePreview(selected)}
              >
                <FileText size={14} /> 查看上传文件
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {uploadOpen ? (
        <UploadReportModal
          defaultSectionId={activeSectionId ?? 'sec2'}
          yards={yards}
          submitting={uploading}
          onClose={() => setUploadOpen(false)}
          onSubmit={handleUploadReport}
        />
      ) : null}

      {previewPayload ? (
        <ReportFilePreviewModal
          report={previewPayload.report}
          versionLabel={previewPayload.version}
          items={previewPayload.items}
          onClose={() => setPreviewPayload(null)}
        />
      ) : null}
    </div>
  );
}
