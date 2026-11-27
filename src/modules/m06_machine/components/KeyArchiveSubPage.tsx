'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Archive,
  ClipboardList,
  Clock,
  FileText,
  Plus,
  RotateCcw,
  Search,
  ShieldCheck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import {
  BASE_DATE,
  CERT_STATUS_OPTIONS,
  DEFAULT_REMINDER_CONFIG,
  KEY_EQUIP_TYPES,
  SECTIONS,
  type KeyArchiveDTO,
  type KeyArchiveListResponse,
  type PatrolLogDTO,
  type ReminderDateField,
} from '../types';
import { PaginationBar } from './PaginationBar';
import {
  ArchiveModal,
  DocPreviewModal,
  PatrolModal,
  ReminderConfigModal,
} from './MachineModals';

function useStatusTone(status: string): BadgeTone {
  if (status === '在用') return 'ok';
  if (status === '待用') return 'info';
  if (status === '停用') return 'warn';
  return 'muted';
}

function patrolTone(status: string): BadgeTone {
  if (status === '已处理') return 'info';
  return 'ok';
}

export function KeyArchiveSubPage({
  activeSectionId,
  initialSelectedCode,
  onSectionChange,
  showToast,
}: {
  activeSectionId: string | null;
  initialSelectedCode?: string;
  onSectionChange: (secId: string | null) => void;
  showToast: (msg: string) => void;
}) {
  const [equipType, setEquipType] = useState('');
  const [certStatus, setCertStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [committedKw, setCommittedKw] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 7;

  const [data, setData] = useState<KeyArchiveListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState(initialSelectedCode || 'QZ-03-006');
  const [saving, setSaving] = useState(false);

  const [archiveModalTarget, setArchiveModalTarget] = useState<KeyArchiveDTO | null>(null);
  const [docPreviewState, setDocPreviewState] = useState<{
    archive: KeyArchiveDTO;
    kind: 'inspect' | 'register';
  } | null>(null);
  const [patrolModalState, setPatrolModalState] = useState<{
    archive: KeyArchiveDTO;
    patrol: PatrolLogDTO | null;
    mode: 'view' | 'create';
  } | null>(null);
  const [reminderModalOpen, setReminderModalOpen] = useState(false);

  useEffect(() => {
    if (initialSelectedCode) {
      setSelectedCode(initialSelectedCode);
    }
  }, [initialSelectedCode]);

  const loadKeyArchives = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (equipType) qs.set('type', equipType);
      if (certStatus) qs.set('certStatus', certStatus);
      if (committedKw) qs.set('q', committedKw);
      qs.set('page', String(page));
      qs.set('pageSize', String(pageSize));

      const res = await fetch(`/api/v1/m06/key-archives?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as KeyArchiveListResponse;
      setData(json);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载重点机械档案失败');
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, equipType, certStatus, committedKw, page, showToast]);

  useEffect(() => {
    void loadKeyArchives();
  }, [loadKeyArchives]);

  const rows = useMemo(() => data?.items ?? [], [data]);
  const selected = useMemo(() => {
    if (!rows.length) return null;
    return rows.find((r) => r.code === selectedCode) ?? rows[0];
  }, [rows, selectedCode]);

  const kpis = data?.kpis ?? {
    total: 0,
    valid: 0,
    soon: 0,
    expired: 0,
    missing: 0,
    patrolTotal: 0,
  };
  const reminderConfig = data?.reminderConfig ?? DEFAULT_REMINDER_CONFIG;

  function handleQuery() {
    setCommittedKw(keyword.trim());
    setPage(1);
    showToast('已按当前筛选条件刷新重点机械档案');
  }

  function handleReset() {
    setEquipType('');
    setCertStatus('');
    setKeyword('');
    setCommittedKw('');
    setPage(1);
    if (activeSectionId) onSectionChange(null);
    showToast('已重置重点机械档案筛选条件');
  }

  async function handleUpdateReminder(payload: {
    dateField?: ReminderDateField;
    remindDays?: number;
    notifySystem?: boolean;
    autoBlockExpired?: boolean;
  }) {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/m06/reminder-config', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `更新提醒配置失败 (${res.status})`);
      }
      setReminderModalOpen(false);
      setPage(1);
      showToast(
        payload.remindDays
          ? `已保存到期提醒配置（提前 ${payload.remindDays} 天），台账与预警已刷新`
          : '到期提醒规则已即时更新'
      );
      await loadKeyArchives();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存到期提醒配置失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleSupplementReport(
    code: string,
    payload: {
      inspectNo: string;
      inspectDate: string;
      validUntil: string;
      installValidUntil: string;
      useStatus: '在用' | '待用' | '停用';
    }
  ) {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/m06/key-archives/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...payload,
          missingDocs: false,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `补录检验报告失败 (${res.status})`);
      }
      setDocPreviewState(null);
      showToast(`已补录 ${code} 定期检验报告，证书状态已更新为「${json.certMeta?.status ?? '正常有效'}」`);
      await loadKeyArchives();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '补录检验报告失败');
    } finally {
      setSaving(false);
    }
  }

  async function handleCreatePatrol(payload: {
    equipmentCode: string;
    content: string;
    status: '记录正常' | '已处理' | '已归档';
    inspector: string;
    detail: string;
  }) {
    setSaving(true);
    try {
      const res = await fetch('/api/v1/m06/patrols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `新增巡查记录失败 (${res.status})`);
      }
      setPatrolModalState(null);
      showToast(`已新增巡查记录 ${json.patrol?.id ?? ''} 并关联至 ${payload.equipmentCode}`);
      await loadKeyArchives();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '新增巡查记录失败');
    } finally {
      setSaving(false);
    }
  }

  const patrolLogs = selected?.patrolLogs ?? [];

  return (
    <div className="m06-page">
      {/* Filter Bar */}
      <div className="glass-panel m06-filter-bar">
        <div className="m06-filter-fields">
          <div className="m06-field">
            <span className="m06-field-label">所属工区</span>
            <select
              className="glass-select m06-select"
              value={activeSectionId ?? ''}
              onChange={(e) => {
                setPage(1);
                onSectionChange(e.target.value || null);
              }}
            >
              <option value="">全部工区</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">设备类型</span>
            <select
              className="glass-select m06-select"
              value={equipType}
              onChange={(e) => {
                setEquipType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              {KEY_EQUIP_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">证书状态</span>
            <select
              className="glass-select m06-select"
              value={certStatus}
              onChange={(e) => {
                setCertStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              {CERT_STATUS_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">档案检索</span>
            <div className="m06-search-wrap">
              <span className="m06-search-ico">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="m06-input"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuery();
                }}
                placeholder="设备编号或档案编号"
              />
            </div>
          </div>
        </div>

        <div className="m06-filter-actions">
          <button type="button" className="m06-btn-query" onClick={handleQuery}>
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="dock-btn m06-btn-reset" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* KPI Section */}
      <GlassPanel
        title="重点机械与检验概况"
        subtitle={`(截至 ${BASE_DATE})`}
        className="m06-kpi-panel"
      >
        <div className="m06-kpi-grid">
          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <Archive size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">重点机械</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.total}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-green">
              <ShieldCheck size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">正常有效</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-green">{kpis.valid}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-gold">
              <Clock size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">即将到期</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-gold">{kpis.soon}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-red">
              <AlertTriangle size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">已到期</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-red">{kpis.expired}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <FileText size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">待补资料</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.missing}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <ClipboardList size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">本期关联巡查</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.patrolTotal}</span>
                <span className="m06-kpi-unit">条</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 2-Column Workspace */}
      <div className="m06-archive-grid">
        {/* Left: Key Machine Archive Ledger */}
        <GlassPanel
          title="重点机械档案台账"
          headerRight={<span className="m06-header-meta">一机一档</span>}
          className="m06-no-pad-panel m06-table-panel"
        >
          <div className="m06-table-wrap">
            {loading && !data ? (
              <div className="m06-empty">正在读取重点机械档案台账...</div>
            ) : rows.length > 0 ? (
              <table className="data-table m06-table">
                <thead>
                  <tr>
                    <th>档案编号</th>
                    <th>设备编号</th>
                    <th>设备名称</th>
                    <th>所属工区</th>
                    <th>检验有效期至</th>
                    <th>证书状态</th>
                    <th>使用状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr
                      key={r.code}
                      className={selected?.code === r.code ? 'selected' : ''}
                      onClick={() => setSelectedCode(r.code)}
                    >
                      <td>{r.archiveId}</td>
                      <td>{r.code}</td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{r.name}</td>
                      <td>{r.sectionName}</td>
                      <td>{r.certMeta.displayDate}</td>
                      <td>
                        <StatusBadge text={r.certMeta.status} tone={r.certMeta.badgeTone} />
                      </td>
                      <td>
                        {r.useStatus === '—' ? (
                          <span style={{ color: '#93b8de' }}>—</span>
                        ) : (
                          <StatusBadge text={r.useStatus} tone={useStatusTone(r.useStatus)} />
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m06-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedCode(r.code);
                            setArchiveModalTarget(r);
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="m06-empty">
                当前筛选条件下暂无匹配重点机械档案，请调整筛选条件。
              </div>
            )}
          </div>

          <div>
            <PaginationBar
              totalItems={data?.total ?? 0}
              currentPage={data?.page ?? page}
              pageSize={pageSize}
              unitLabel="台设备"
              onPageChange={setPage}
            />

            <div className="m06-reminder-bar">
              <span style={{ fontSize: '12.5px', fontWeight: 700, color: '#dbeafe' }}>
                到期提醒
              </span>
              <div className="m06-reminder-controls">
                <span>日期字段</span>
                <select
                  className="glass-select m06-mini-select"
                  value={reminderConfig.dateField}
                  disabled={saving}
                  onChange={(e) =>
                    void handleUpdateReminder({
                      dateField: e.target.value as ReminderDateField,
                    })
                  }
                >
                  <option value="validUntil">检验有效期至</option>
                  <option value="installValidUntil">安装告知有效期</option>
                </select>
                <span>提前</span>
                <select
                  className="glass-select m06-mini-select"
                  value={reminderConfig.remindDays}
                  disabled={saving}
                  onChange={(e) =>
                    void handleUpdateReminder({
                      remindDays: Number(e.target.value) || 30,
                    })
                  }
                >
                  <option value={15}>15 天</option>
                  <option value={30}>30 天</option>
                  <option value={45}>45 天</option>
                  <option value={60}>60 天</option>
                </select>
              </div>
              <button
                type="button"
                className="m06-link-btn"
                onClick={() => setReminderModalOpen(true)}
              >
                配置提醒 &gt;
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Right Stacked Panels */}
        <div className="m06-archive-right">
          {/* Top: Equipment Archive & Inspection Docs */}
          <GlassPanel title="设备档案与检验资料" className="m06-no-pad-panel">
            {selected ? (
              <div className="m06-doc-body">
                <div className="m06-doc-title-row">
                  <div className="m06-doc-title-main">
                    <span className="m06-doc-name">{selected.name}</span>
                    <span className="m06-doc-codes">
                      {selected.code} &nbsp; {selected.archiveId}
                    </span>
                  </div>
                  <StatusBadge
                    text={selected.certMeta.status}
                    tone={selected.certMeta.badgeTone}
                  />
                </div>

                <div className="m06-meta-grid">
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">所属单位</span>
                    <span className="m06-kv-v">{selected.unit}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">使用状态</span>
                    <StatusBadge
                      text={selected.useStatus}
                      tone={useStatusTone(selected.useStatus)}
                    />
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">检验编号</span>
                    <span className="m06-kv-v">{selected.inspectNo}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">检验日期</span>
                    <span className="m06-kv-v">{selected.inspectDate}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">有效期至</span>
                    <span className="m06-kv-v">{selected.certMeta.displayDate}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">到期提醒</span>
                    <span
                      className="m06-kv-v"
                      style={{ color: selected.certMeta.remindColor }}
                    >
                      {selected.certMeta.remindText}
                    </span>
                  </div>
                </div>

                <div className="m06-doc-list-title">检验及登记资料</div>

                <div className="m06-doc-item">
                  <span className="m06-doc-left">
                    <FileText size={15} />
                    <span>
                      {selected.missingDocs
                        ? '定期检验报告.pdf（待补充盖章扫描件）'
                        : '定期检验报告.pdf'}
                    </span>
                  </span>
                  <button
                    type="button"
                    className="m06-link-btn"
                    onClick={() =>
                      setDocPreviewState({ archive: selected, kind: 'inspect' })
                    }
                  >
                    {selected.missingDocs ? '补录/预览 >' : '预览 >'}
                  </button>
                </div>

                <div className="m06-doc-item">
                  <span className="m06-doc-left">
                    <FileText size={15} />
                    <span>设备使用登记资料.pdf</span>
                  </span>
                  <button
                    type="button"
                    className="m06-link-btn"
                    onClick={() =>
                      setDocPreviewState({ archive: selected, kind: 'register' })
                    }
                  >
                    预览 &gt;
                  </button>
                </div>
              </div>
            ) : (
              <div className="m06-empty">请选择重点机械档案查看资料</div>
            )}
          </GlassPanel>

          {/* Bottom: Associated Patrol Logs */}
          <GlassPanel
            title="关联巡查记录"
            headerRight={
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <span className="m06-header-meta">本机记录</span>
                {selected ? (
                  <button
                    type="button"
                    className="m06-link-btn"
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}
                    onClick={() =>
                      setPatrolModalState({
                        archive: selected,
                        patrol: null,
                        mode: 'create',
                      })
                    }
                  >
                    <Plus size={13} />
                    <span>新增巡查</span>
                  </button>
                ) : null}
              </div>
            }
            className="m06-no-pad-panel m06-patrol-panel"
          >
            <div className="m06-table-wrap">
              {patrolLogs.length > 0 && selected ? (
                <table className="data-table m06-table">
                  <thead>
                    <tr>
                      <th>巡查编号</th>
                      <th>巡查时间</th>
                      <th>巡查内容</th>
                      <th>处理状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patrolLogs.map((log) => (
                      <tr key={log.id}>
                        <td>{log.id}</td>
                        <td>{log.patrolTime}</td>
                        <td style={{ color: '#ffffff' }}>{log.content}</td>
                        <td>
                          <StatusBadge text={log.status} tone={patrolTone(log.status)} />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m06-link-btn"
                            onClick={() =>
                              setPatrolModalState({
                                archive: selected,
                                patrol: log,
                                mode: 'view',
                              })
                            }
                          >
                            查看记录
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="m06-empty">暂无关联巡查记录</div>
              )}
            </div>

            <div className="m06-patrol-footer">
              <span>设备编号 &nbsp; {selected ? selected.code : '—'}</span>
              <span>共 {patrolLogs.length} 条关联记录</span>
            </div>
          </GlassPanel>
        </div>
      </div>

      {archiveModalTarget ? (
        <ArchiveModal
          archive={archiveModalTarget}
          onPreviewDoc={(kind) => {
            const target = archiveModalTarget;
            setArchiveModalTarget(null);
            setDocPreviewState({ archive: target, kind });
          }}
          onClose={() => setArchiveModalTarget(null)}
        />
      ) : null}

      {docPreviewState ? (
        <DocPreviewModal
          archive={docPreviewState.archive}
          docKind={docPreviewState.kind}
          saving={saving}
          onSupplementReport={handleSupplementReport}
          onDownload={(filename) => showToast(`已导出 ${filename}`)}
          onClose={() => setDocPreviewState(null)}
        />
      ) : null}

      {patrolModalState ? (
        <PatrolModal
          archive={patrolModalState.archive}
          patrol={patrolModalState.patrol}
          mode={patrolModalState.mode}
          saving={saving}
          onCreatePatrol={handleCreatePatrol}
          onClose={() => setPatrolModalState(null)}
        />
      ) : null}

      {reminderModalOpen ? (
        <ReminderConfigModal
          config={reminderConfig}
          totalKeyCount={data?.total ?? 28}
          saving={saving}
          onSave={(payload) => handleUpdateReminder(payload)}
          onClose={() => setReminderModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
