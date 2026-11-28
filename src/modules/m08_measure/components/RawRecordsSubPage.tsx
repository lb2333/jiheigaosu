'use client';

import { useCallback, useEffect, useState } from 'react';
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { usePlatformStore } from '@/lib/store/platform-store';
import { fmtInt, fmtMoney } from '../MeasureCharts';
import type { ActiveModalState } from '../MeasureModals';
import type {
  MeasureContract,
  MeasureRecord,
  RawRecordsApiResponse,
} from '../types';
import {
  buildPaginationPages,
  DEFAULT_SECTIONS,
  PERIOD_OPTIONS,
  statusToBadgeTone,
} from './shared';

export interface RawRecordsSubPageProps {
  refreshKey: number;
  onOpenModal: (modal: ActiveModalState) => void;
  onReset: () => void;
  onContractsChange?: (contracts: MeasureContract[]) => void;
}

export function RawRecordsSubPage({
  refreshKey,
  onOpenModal,
  onReset,
  onContractsChange,
}: RawRecordsSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const showToast = usePlatformStore((s) => s.showToast);
  const measureBridge = usePlatformStore((s) => s.measureBridge);
  const patchMeasureBridge = usePlatformStore((s) => s.patchMeasureBridge);

  const {
    period,
    rawStatus,
    rawPayStatus,
    rawKeyword,
    rawSelectedId,
    rawPage,
  } = measureBridge;

  const [rawKeywordInput, setRawKeywordInput] = useState<string>(rawKeyword);
  const [rawData, setRawData] = useState<RawRecordsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [mutatingId, setMutatingId] = useState<string | null>(null);

  useEffect(() => {
    setRawKeywordInput(rawKeyword);
  }, [rawKeyword]);

  const fetchRawRecords = useCallback(async () => {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      if (activeSectionId) sp.set('sectionId', activeSectionId);
      sp.set('period', period);
      if (rawStatus) sp.set('status', rawStatus);
      if (rawPayStatus) sp.set('payStatus', rawPayStatus);
      if (rawKeyword.trim()) sp.set('q', rawKeyword.trim());
      sp.set('page', String(rawPage));

      const res = await fetch(`/api/v1/m08/records?${sp.toString()}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as RawRecordsApiResponse;
        setRawData(json);
        if (json.contracts?.length) {
          onContractsChange?.(json.contracts);
        }
      }
    } finally {
      setLoading(false);
    }
  }, [
    activeSectionId,
    period,
    rawStatus,
    rawPayStatus,
    rawKeyword,
    rawPage,
    onContractsChange,
  ]);

  useEffect(() => {
    void fetchRawRecords();
  }, [fetchRawRecords, refreshKey]);

  const contracts = rawData?.contracts?.length
    ? rawData.contracts
    : DEFAULT_SECTIONS;

  async function handlePatchRecord(
    rec: MeasureRecord,
    action: 'audit' | 'confirm' | 'syncPay'
  ) {
    setMutatingId(rec.id);
    try {
      const res = await fetch(
        `/api/v1/m08/records/${encodeURIComponent(rec.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          showToast('当前账号角色无权执行变更（需管理员/工程师/监理权限）');
        } else {
          showToast(json.error || '操作失败');
        }
        return;
      }
      const actionLabel =
        action === 'audit'
          ? '已提交审核（审核中）'
          : action === 'confirm'
            ? '已确认计量并持久化'
            : `支付回传状态已更新为「${json.record?.payStatus ?? '已同步'}」`;
      showToast(`${rec.id} ${actionLabel}`);
      await fetchRawRecords();
    } finally {
      setMutatingId(null);
    }
  }

  const summary = rawData?.summary ?? {
    total: 36,
    confirmed: 24,
    reviewing: 8,
    pending: 4,
  };
  const rows = rawData?.rows ?? [];
  const total = rawData?.total ?? 0;
  const currentPage = rawData?.page ?? 1;
  const totalPages = rawData?.totalPages ?? 1;
  const pages = buildPaginationPages(totalPages, currentPage);

  const selected =
    rows.find((r) => r.id === rawSelectedId) ?? rows[0] ?? null;
  const isMutating = selected ? mutatingId === selected.id : false;

  return (
    <>
      <div className="glass-panel m08-filter-bar">
        <div className="m08-filter-fields">
          <div className="m08-field">
            <span className="m08-field-label">所属工区</span>
            <select
              className="glass-select m08-select"
              value={activeSectionId ?? ''}
              onChange={(e) => {
                patchMeasureBridge({ rawPage: 1 });
                setActiveSectionId(e.target.value || null);
              }}
            >
              <option value="">全部工区</option>
              {contracts.map((s) => (
                <option key={s.sectionId} value={s.sectionId}>
                  {s.sectionName}
                </option>
              ))}
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">计量期次</span>
            <select
              className="glass-select m08-select"
              value={period}
              onChange={(e) => {
                patchMeasureBridge({ rawPage: 1, period: e.target.value });
              }}
            >
              {PERIOD_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">计量状态</span>
            <select
              className="glass-select m08-select"
              value={rawStatus}
              onChange={(e) => {
                patchMeasureBridge({ rawPage: 1, rawStatus: e.target.value });
              }}
            >
              <option value="">全部状态</option>
              <option value="已确认">已确认</option>
              <option value="审核中">审核中</option>
              <option value="待审核">待审核</option>
            </select>
          </div>
          <div className="m08-field">
            <span className="m08-field-label">关键词</span>
            <div className="m08-search-wrap">
              <span className="m08-search-ico">
                <Search size={14} />
              </span>
              <input
                className="m08-input"
                type="text"
                value={rawKeywordInput}
                placeholder="原始编号 / 合同段 / 分项"
                onChange={(e) => setRawKeywordInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    patchMeasureBridge({
                      rawPage: 1,
                      rawKeyword: rawKeywordInput,
                    });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="m08-filter-actions">
          <button
            type="button"
            className="m08-btn-query"
            onClick={() => {
              if (rawKeyword !== rawKeywordInput || rawPage !== 1) {
                patchMeasureBridge({
                  rawPage: 1,
                  rawKeyword: rawKeywordInput,
                });
              } else {
                void fetchRawRecords();
              }
              showToast('已按当前筛选条件刷新原始记录');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={() => {
              setRawKeywordInput('');
              onReset();
            }}
          >
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={() => onOpenModal({ type: 'newRecord' })}
          >
            <Plus size={14} />
            <span>新增记录</span>
          </button>
          <button
            type="button"
            className="dock-btn m08-btn-outline"
            onClick={() => onOpenModal({ type: 'originalSystem', record: null })}
          >
            <ExternalLink size={14} />
            <span>进入原系统</span>
          </button>
        </div>
      </div>

      <GlassPanel
        title="本期计量记录"
        subtitle={`(${period})`}
        bodyClassName="m08-panel-body-zero"
        headerRight={
          <div className="m08-header-meta">统计截止 {selectedDate}</div>
        }
      >
        <div className="m08-kpi-grid cols-4">
          <div className="m08-kpi-card">
            <div className="m08-kpi-icon">
              <FileText size={18} />
            </div>
            <KpiCard
              label="全部记录"
              value={fmtInt(summary.total)}
              unit="条"
            />
          </div>
          <div className="m08-kpi-card">
            <div className="m08-kpi-icon tone-green">
              <CheckCircle2 size={18} />
            </div>
            <KpiCard
              label="已确认"
              value={fmtInt(summary.confirmed)}
              unit="条"
              tone="green"
            />
          </div>
          <div className="m08-kpi-card tone-blue">
            <div className="m08-kpi-icon tone-blue">
              <Clock size={18} />
            </div>
            <KpiCard
              label="审核中"
              value={fmtInt(summary.reviewing)}
              unit="条"
            />
          </div>
          <div className="m08-kpi-card">
            <div className="m08-kpi-icon tone-gold">
              <AlertCircle size={18} />
            </div>
            <KpiCard
              label="待审核"
              value={fmtInt(summary.pending)}
              unit="条"
              tone="gold"
            />
          </div>
        </div>
      </GlassPanel>

      <div className="m08-split-65-35">
        <GlassPanel
          title="原始计量记录"
          bodyClassName="m08-panel-body-zero"
          headerRight={
            <div className="flex items-center gap-2">
              {rawPayStatus ? (
                <button
                  type="button"
                  className="m08-chip-filter"
                  onClick={() => {
                    patchMeasureBridge({ rawPayStatus: '', rawPage: 1 });
                  }}
                >
                  支付：{rawPayStatus} ×
                </button>
              ) : null}
              <div className="m08-header-meta">来源 计量支付原系统</div>
            </div>
          }
        >
          <div className="m08-table-wrap">
            <table className="data-table m08-table">
              <thead>
                <tr>
                  <th>原始记录编号</th>
                  <th>工区 / 合同段</th>
                  <th>工程分项</th>
                  <th>计量期次</th>
                  <th>记录金额（万元）</th>
                  <th>计量状态</th>
                  <th>原系统支付状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className={selected?.id === r.id ? 'active' : ''}
                      onClick={() => patchMeasureBridge({ rawSelectedId: r.id })}
                    >
                      <td className="m08-num">{r.id}</td>
                      <td>
                        <div style={{ fontWeight: 600, color: '#f1f7ff' }}>
                          {r.sectionName}
                        </div>
                        <div style={{ fontSize: 11, color: '#8fb4da' }}>
                          {r.contractCode}
                        </div>
                      </td>
                      <td>{r.workItem}</td>
                      <td>{r.period}</td>
                      <td className="m08-num">{fmtMoney(r.amount)}</td>
                      <td>
                        <StatusBadge
                          text={r.status}
                          tone={statusToBadgeTone(r.status)}
                        />
                      </td>
                      <td>
                        <StatusBadge
                          text={r.payStatus}
                          tone={statusToBadgeTone(r.payStatus)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m08-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            patchMeasureBridge({ rawSelectedId: r.id });
                            onOpenModal({ type: 'recordDetail', record: r });
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: 'center',
                        color: '#93b8de',
                        padding: 24,
                      }}
                    >
                      {loading ? '正在加载原始记录...' : '当前筛选条件下暂无原始计量记录'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="m08-table-foot">
            <span />
            <div className="m08-pager">
              <span style={{ marginRight: 6 }}>
                共 {fmtInt(total)} 条原始记录
              </span>
              <button
                type="button"
                className="m08-page-btn"
                disabled={currentPage <= 1}
                onClick={() =>
                  patchMeasureBridge({ rawPage: Math.max(1, rawPage - 1) })
                }
              >
                &lt;
              </button>
              {pages.map((p, idx) =>
                p === 'ellipsis' ? (
                  <span
                    key={`e-${idx}`}
                    style={{ padding: '0 3px', color: '#789bc4' }}
                  >
                    ...
                  </span>
                ) : (
                  <button
                    key={p}
                    type="button"
                    className={`m08-page-btn ${
                      p === currentPage ? 'active' : ''
                    }`}
                    onClick={() => patchMeasureBridge({ rawPage: p })}
                  >
                    {p}
                  </button>
                )
              )}
              <button
                type="button"
                className="m08-page-btn"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  patchMeasureBridge({
                    rawPage: Math.min(totalPages, rawPage + 1),
                  })
                }
              >
                &gt;
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="原始记录详情"
          bodyClassName="m08-panel-body-zero"
        >
          {selected ? (
            <div className="m08-side-body">
              <div className="m08-raw-head">
                <span className="m08-raw-id">{selected.id}</span>
                <StatusBadge
                  text={selected.status}
                  tone={statusToBadgeTone(selected.status)}
                />
              </div>

              <div className="m08-kv-list">
                <div className="m08-kv-row">
                  <span className="m08-kv-k">计量期次</span>
                  <span className="m08-kv-v">{selected.period}</span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">所属工区 / 合同段</span>
                  <span className="m08-kv-v">
                    {selected.sectionName} · {selected.contractCode}
                  </span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">工程分项</span>
                  <span className="m08-kv-v">{selected.workItem}</span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">原系统记录金额</span>
                  <span className="m08-kv-v">
                    {fmtMoney(selected.amount)} 万元
                  </span>
                </div>
              </div>

              <div className="m08-subcard">
                <div className="m08-subcard-title">
                  <span>原系统支付信息</span>
                  <StatusBadge
                    text={selected.payStatus}
                    tone={statusToBadgeTone(selected.payStatus)}
                  />
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">已回传支付金额</span>
                  <span className="m08-kv-v">
                    {selected.paidAmount > 0
                      ? `${fmtMoney(selected.paidAmount)} 万元`
                      : '—'}
                  </span>
                </div>
                <div className="m08-kv-row">
                  <span className="m08-kv-k">支付信息回传时间</span>
                  <span className="m08-kv-v">{selected.payTime}</span>
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: 12,
                  color: '#93b8de',
                  marginTop: 2,
                }}
              >
                <span style={{ fontWeight: 700, color: '#dbeafe' }}>
                  可获取附件
                </span>
                <span>2 份</span>
              </div>

              <div className="m08-attach-list">
                <div className="m08-attach-item">
                  <div className="m08-attach-left">
                    <span className="m08-attach-ico">
                      <FileText size={16} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="m08-attach-name">
                        {selected.contractCode}计量确认单.pdf
                      </div>
                      <div className="m08-attach-sub">计量确认单</div>
                    </div>
                  </div>
                  <div className="m08-attach-right">
                    <span className="m08-ext-tag">PDF</span>
                    <button
                      type="button"
                      className="m08-link-btn"
                      onClick={() =>
                        onOpenModal({
                          type: 'attachment',
                          record: selected,
                          fileType: 'pdf',
                        })
                      }
                    >
                      查阅 <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
                <div className="m08-attach-item">
                  <div className="m08-attach-left">
                    <span className="m08-attach-ico">
                      <FileSpreadsheet size={16} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="m08-attach-name">
                        {selected.workItem}计量计算表.xlsx
                      </div>
                      <div className="m08-attach-sub">工程量计算</div>
                    </div>
                  </div>
                  <div className="m08-attach-right">
                    <span className="m08-ext-tag">XLSX</span>
                    <button
                      type="button"
                      className="m08-link-btn"
                      onClick={() =>
                        onOpenModal({
                          type: 'attachment',
                          record: selected,
                          fileType: 'xlsx',
                        })
                      }
                    >
                      查阅 <ExternalLink size={12} />
                    </button>
                  </div>
                </div>
              </div>

              {period === '2026年11月' &&
              (selected.status !== '已确认' ||
                selected.payStatus !== '已支付') ? (
                <div className="m08-action-strip">
                  {selected.status === '待审核' ? (
                    <button
                      type="button"
                      className="dock-btn"
                      disabled={isMutating}
                      onClick={() => void handlePatchRecord(selected, 'audit')}
                    >
                      <ShieldCheck size={13} />
                      <span>提交审核</span>
                    </button>
                  ) : null}
                  {selected.status !== '已确认' ? (
                    <button
                      type="button"
                      className="m08-btn-query"
                      disabled={isMutating}
                      onClick={() =>
                        void handlePatchRecord(selected, 'confirm')
                      }
                    >
                      <Check size={13} />
                      <span>确认计量</span>
                    </button>
                  ) : null}
                  {selected.payStatus !== '已支付' ? (
                    <button
                      type="button"
                      className="dock-btn"
                      disabled={isMutating}
                      onClick={() =>
                        void handlePatchRecord(selected, 'syncPay')
                      }
                    >
                      <RefreshCw size={13} />
                      <span>同步支付回传</span>
                    </button>
                  ) : null}
                </div>
              ) : null}

              <div className="m08-side-footer">
                <span>同步于 {selected.syncTime}</span>
                <button
                  type="button"
                  className="dock-btn primary"
                  onClick={() =>
                    onOpenModal({ type: 'originalSystem', record: selected })
                  }
                >
                  <ExternalLink size={14} />
                  <span>查看原系统记录</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="m08-side-body"
              style={{
                textAlign: 'center',
                color: '#93b8de',
                padding: '30px 14px',
              }}
            >
              暂无匹配的原始记录详情
            </div>
          )}
        </GlassPanel>
      </div>
    </>
  );
}
