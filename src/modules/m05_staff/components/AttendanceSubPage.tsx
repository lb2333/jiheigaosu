'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  Plug,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
} from 'lucide-react';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ATTENDANCE_DATES,
  KEY_ROLE_NAMES,
  SECTION_OPTIONS,
  type AttendancePageResponse,
  type StaffAnomalyDTO,
  type StaffKeyRoleDTO,
} from '../types';
import { AnomalyModal, KeyRoleModal } from './StaffModals';

function buildPageButtons(totalPages: number, currentPage: number): Array<number | '...'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  if (currentPage <= 3) {
    return [1, 2, 3, '...', totalPages];
  }
  if (currentPage >= totalPages - 2) {
    return [1, '...', totalPages - 2, totalPages - 1, totalPages];
  }
  return [1, '...', currentPage, '...', totalPages];
}

function TierProgressSvg({ idSuffix, pct }: { idSuffix: number; pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  const gradId = `m05-tier-grad-${idSuffix}`;
  const barWidth = ((clamped / 100) * 260).toFixed(1);

  return (
    <svg
      className="m05-tier-svg"
      viewBox="0 0 260 12"
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#38f2ff" />
        </linearGradient>
      </defs>
      <rect
        x="0"
        y="2"
        width="260"
        height="8"
        rx="4"
        fill="rgba(12, 42, 92, 0.85)"
        stroke="rgba(56, 189, 248, 0.22)"
        strokeWidth="1"
      />
      {clamped > 0 ? (
        <rect x="0" y="2" width={barWidth} height="8" rx="4" fill={`url(#${gradId})`} />
      ) : null}
    </svg>
  );
}

export function AttendanceSubPage({
  activeSectionId,
  initialSelectedRoleCode,
  onSectionChange,
  onJumpOrgProfile,
  showToast,
}: {
  activeSectionId: string | null;
  initialSelectedRoleCode?: string;
  onSectionChange: (secId: string | null) => void;
  onJumpOrgProfile: (staffId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [lineOnly, setLineOnly] = useState(false);
  const [roleName, setRoleName] = useState('');
  const [assignedStatus, setAssignedStatus] = useState('');
  const [date, setDate] = useState<string>('2026-11-26');
  const [selectedRoleCode, setSelectedRoleCode] = useState(
    initialSelectedRoleCode || 'GW-02-03'
  );
  const [page, setPage] = useState(1);

  const [data, setData] = useState<AttendancePageResponse | null>(null);
  const [modalRole, setModalRole] = useState<StaffKeyRoleDTO | null>(null);
  const [modalAnomaly, setModalAnomaly] = useState<StaffAnomalyDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const effectiveSectionId = activeSectionId ?? (lineOnly ? 'line' : '');

  useEffect(() => {
    if (activeSectionId) {
      setLineOnly(false);
    }
    setPage(1);
  }, [activeSectionId]);

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: effectiveSectionId,
      roleName,
      assignedStatus,
      date,
      page: String(page),
      pageSize: '7',
    });
    const res = await fetch(`/api/v1/m05/attendance?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as AttendancePageResponse;
      setData(json);
    }
  }, [effectiveSectionId, roleName, assignedStatus, date, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const selRole = useMemo(() => {
    return items.find((r) => r.code === selectedRoleCode) ?? items[0] ?? null;
  }, [items, selectedRoleCode]);

  const kpis = data?.kpis ?? {
    totalRoles: 36,
    assignedCount: 33,
    pendingCount: 3,
    assignRate: '91.7',
    onDutyHolders: 31,
  };

  const summary = data?.summary ?? {
    expectedCount: 33,
    arrivedCount: 30,
    arrivalRate: '90.9',
    anomalyCount: 3,
    tierStats: [
      { type: '项目办', arrived: 3, total: 3, pct: 100 },
      { type: '监理单位', arrived: 9, total: 10, pct: 90 },
      { type: '施工单位', arrived: 18, total: 20, pct: 90 },
    ],
  };

  const anomalies = useMemo(() => data?.anomalies ?? [], [data]);
  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = data?.page ?? page;
  const pageButtons = buildPageButtons(totalPages, safePage);

  function handleSectionSelect(val: string) {
    setPage(1);
    if (val === 'line') {
      setLineOnly(true);
      if (activeSectionId) onSectionChange(null);
    } else if (val) {
      setLineOnly(false);
      onSectionChange(val);
    } else {
      setLineOnly(false);
      if (activeSectionId) onSectionChange(null);
    }
  }

  function handleQuery() {
    setPage(1);
    void loadData();
    showToast('已按当前筛选条件刷新人员管理数据');
  }

  function handleReset() {
    setLineOnly(false);
    setRoleName('');
    setAssignedStatus('');
    setDate('2026-11-26');
    setPage(1);
    if (activeSectionId) {
      onSectionChange(null);
    }
    showToast('已重置筛选条件');
  }

  async function handleAssignRole(roleCode: string, holderId: string, assignDate: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m05/roles/${encodeURIComponent(roleCode)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'assign', holderId, assignDate }),
      });
      if (res.ok) {
        const roleLabel = modalRole?.roleName ?? '';
        setModalRole(null);
        showToast(`已完成岗位 ${roleCode} (${roleLabel}) 人员配置`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '配置岗位人员失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleUnassignRole(roleCode: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m05/roles/${encodeURIComponent(roleCode)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'unassign' }),
      });
      if (res.ok) {
        setModalRole(null);
        showToast(`岗位 ${roleCode} 已变更为「待配置」，请尽快补配责任人`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '变更岗位状态失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleResolveAnomaly(anomalyId: string, handleNote: string) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m05/anomalies/${encodeURIComponent(anomalyId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resolved: true, handleNote }),
      });
      if (res.ok) {
        const staffName = modalAnomaly?.staffName ?? anomalyId;
        setModalAnomaly(null);
        showToast(`已完成 ${staffName} 考勤异常核查销号`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '核查考勤异常失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  const anomalyColumns: ColumnDef<StaffAnomalyDTO>[] = [
    {
      key: 'staffName',
      header: '人员',
      render: (a) => (
        <button
          type="button"
          className="m05-anom-cell-btn"
          style={{ fontWeight: 700, color: '#ffffff' }}
          onClick={() => setModalAnomaly(a)}
        >
          {a.staffName}
        </button>
      ),
    },
    {
      key: 'orgName',
      header: '所属组织',
      render: (a) => (
        <button type="button" className="m05-anom-cell-btn" onClick={() => setModalAnomaly(a)}>
          {a.orgName}
        </button>
      ),
    },
    {
      key: 'roleName',
      header: '岗位',
      render: (a) => (
        <button type="button" className="m05-anom-cell-btn" onClick={() => setModalAnomaly(a)}>
          {a.roleName}
        </button>
      ),
    },
    {
      key: 'type',
      header: '异常类型',
      render: (a) => (
        <button type="button" className="m05-anom-cell-btn" onClick={() => setModalAnomaly(a)}>
          <StatusBadge text={a.type} tone="warn" />
        </button>
      ),
    },
    {
      key: 'time',
      header: '记录时间',
      render: (a) => (
        <button type="button" className="m05-anom-cell-btn" onClick={() => setModalAnomaly(a)}>
          {a.time}
        </button>
      ),
    },
  ];

  return (
    <div className="m05-page">
      {/* 1. Top Filter Bar */}
      <div className="glass-panel m05-filter-panel">
        <div className="m05-filter-fields">
          <div className="m05-field">
            <span className="m05-field-label">所属工区</span>
            <select
              className="glass-select m05-select"
              value={effectiveSectionId}
              onChange={(e) => handleSectionSelect(e.target.value)}
            >
              <option value="">全部工区</option>
              <option value="line">全线</option>
              {SECTION_OPTIONS.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m05-field">
            <span className="m05-field-label">关键岗位</span>
            <select
              className="glass-select m05-select"
              value={roleName}
              onChange={(e) => {
                setRoleName(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部岗位</option>
              {KEY_ROLE_NAMES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="m05-field">
            <span className="m05-field-label">配置状态</span>
            <select
              className="glass-select m05-select"
              value={assignedStatus}
              onChange={(e) => {
                setAssignedStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="已配置">已配置</option>
              <option value="待配置">待配置</option>
            </select>
          </div>

          <div className="m05-field">
            <span className="m05-field-label">考勤日期</span>
            <select
              className="glass-select m05-select"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setPage(1);
              }}
            >
              {ATTENDANCE_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m05-filter-actions">
          <button type="button" className="m05-btn-query" onClick={handleQuery}>
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="dock-btn m05-btn-outline" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* 2. 5-Card KPI Row */}
      <GlassPanel
        title="关键岗位配置概况"
        subtitle="(截至 2026-11-26)"
        className="m05-glass-no-pad"
      >
        <div className="m05-kpi-grid-5">
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <ClipboardList size={18} />
            </div>
            <KpiCard label="应配置岗位" value={kpis.totalRoles} unit="个" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon tone-green">
              <CheckCircle2 size={18} />
            </div>
            <KpiCard label="已配置岗位" value={kpis.assignedCount} unit="个" tone="green" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon tone-amber">
              <Clock size={18} />
            </div>
            <KpiCard label="待配置岗位" value={kpis.pendingCount} unit="个" tone="gold" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <ShieldCheck size={18} />
            </div>
            <KpiCard label="配置率" value={`${kpis.assignRate}%`} />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <User size={18} />
            </div>
            <KpiCard label="在岗责任人" value={kpis.onDutyHolders} unit="人" />
          </div>
        </div>
      </GlassPanel>

      {/* 3. Bottom 2-Column Workspace */}
      <div className="m05-att-workspace">
        {/* Left: 关键岗位配置 */}
        <GlassPanel
          title="关键岗位配置"
          className="m05-glass-no-pad m05-table-panel"
          headerRight={
            <div className="m05-header-right">人员台账 · 更新于 2026-11-26 09:30</div>
          }
        >
          <div className="m05-table-wrap">
            <table className="data-table m05-table">
              <thead>
                <tr>
                  <th>岗位编号</th>
                  <th>责任单位</th>
                  <th>工区</th>
                  <th>关键岗位</th>
                  <th>责任人</th>
                  <th>配置状态</th>
                  <th>台账状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((r) => {
                    const isSel = selRole?.code === r.code;
                    return (
                      <tr
                        key={r.code}
                        className={isSel ? 'selected' : ''}
                        onClick={() => setSelectedRoleCode(r.code)}
                      >
                        <td>{r.code}</td>
                        <td>{r.orgName}</td>
                        <td>{r.sectionName}</td>
                        <td>{r.roleName}</td>
                        <td
                          style={{
                            fontWeight: r.holder ? 700 : 400,
                            color: r.holder ? '#ffffff' : '#93b8de',
                          }}
                        >
                          {r.holder ? r.holder.name : '—'}
                        </td>
                        <td>
                          <StatusBadge
                            text={r.holder ? '已配置' : '待配置'}
                            tone={r.holder ? 'ok' : 'warn'}
                          />
                        </td>
                        <td>
                          {r.holder ? (
                            <StatusBadge
                              text={r.holder.status}
                              tone={r.holder.status === '在岗' ? 'ok' : 'muted'}
                            />
                          ) : (
                            <span style={{ color: '#789bc4' }}>—</span>
                          )}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m05-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedRoleCode(r.code);
                              setModalRole(r);
                            }}
                          >
                            查看
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={8}
                      style={{ textAlign: 'center', padding: '36px 12px', color: '#93b8de' }}
                    >
                      {data ? '当前筛选条件下暂无关键岗位记录' : '关键岗位台账加载中...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="m05-pagination">
            <span style={{ marginRight: '4px' }}>共 {totalItems} 个岗位</span>
            <button
              type="button"
              className="m05-page-btn"
              disabled={safePage <= 1}
              title="上一页"
              onClick={() => setPage(safePage - 1)}
            >
              <ChevronLeft size={12} />
            </button>
            {pageButtons.map((p, idx) =>
              p === '...' ? (
                <span key={`ellipsis-${idx}`} style={{ padding: '0 3px', color: '#789bc4' }}>
                  ...
                </span>
              ) : (
                <button
                  key={p}
                  type="button"
                  className={`m05-page-btn ${p === safePage ? 'active' : ''}`}
                  onClick={() => setPage(p)}
                >
                  {p}
                </button>
              )
            )}
            <button
              type="button"
              className="m05-page-btn"
              disabled={safePage >= totalPages}
              title="下一页"
              onClick={() => setPage(safePage + 1)}
            >
              <ChevronRight size={12} />
            </button>
          </div>

          {selRole ? (
            <div className="m05-selected-bar">
              <div className="m05-selected-left">
                <span className="m05-selected-code">{selRole.code}</span>
                <span style={{ color: '#cfe4ff' }}>
                  {selRole.sectionName} · {selRole.roleName}
                </span>
                <span className="m05-selected-person">
                  {selRole.holder
                    ? `${selRole.holder.name} (${selRole.holder.id})`
                    : '待配置责任人'}
                </span>
              </div>
              {selRole.holder ? (
                <button
                  type="button"
                  className="m05-link-btn"
                  onClick={() => onJumpOrgProfile(selRole.holder!.id)}
                >
                  查看人员档案 &gt;
                </button>
              ) : (
                <button
                  type="button"
                  className="m05-link-btn"
                  onClick={() => setModalRole(selRole)}
                >
                  立即配置人员 &gt;
                </button>
              )}
            </div>
          ) : null}
        </GlassPanel>

        {/* Right Column: Stacked Attendance Summary + Anomalies */}
        <div className="m05-att-right-col">
          <GlassPanel
            title="到岗与考勤汇总"
            className="m05-glass-no-pad"
            headerRight={<span className="m05-preview-badge">演示预览</span>}
          >
            <div className="m05-att-body">
              <div className="m05-iface-strip">
                <div className="m05-iface-left">
                  <span style={{ display: 'inline-flex', color: '#38bdf8' }}>
                    <Plug size={14} />
                  </span>
                  <span>考勤接口</span>
                  <StatusBadge text="待接入" tone="warn" />
                </div>
                <span className="m05-iface-note">接口具备后同步到岗与考勤数据</span>
              </div>

              <div className="m05-mini-tiles">
                <div className="m05-mini-tile">
                  <div className="m05-mini-lbl">当日应到</div>
                  <div className="m05-mini-val">
                    {summary.expectedCount}
                    <span className="m05-mini-unit">人</span>
                  </div>
                </div>
                <div className="m05-mini-tile">
                  <div className="m05-mini-lbl">已到岗</div>
                  <div className="m05-mini-val tone-green">
                    {summary.arrivedCount}
                    <span className="m05-mini-unit">人</span>
                  </div>
                </div>
                <div className="m05-mini-tile">
                  <div className="m05-mini-lbl">到岗率</div>
                  <div className="m05-mini-val tone-cyan">{summary.arrivalRate}%</div>
                </div>
                <div className="m05-mini-tile">
                  <div className="m05-mini-lbl">异常记录</div>
                  <div className="m05-mini-val tone-amber">
                    {summary.anomalyCount}
                    <span className="m05-mini-unit">条</span>
                  </div>
                </div>
              </div>

              <div className="m05-tier-bars">
                {summary.tierStats.map((t, idx) => (
                  <div key={t.type} className="m05-tier-row">
                    <span className="m05-tier-name">{t.type}</span>
                    <TierProgressSvg idSuffix={idx} pct={t.pct} />
                    <span className="m05-tier-ratio">
                      {t.arrived} / {t.total}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </GlassPanel>

          <GlassPanel
            title="考勤异常记录"
            className="m05-glass-no-pad m05-anomaly-panel"
            headerRight={<span className="m05-preview-badge">演示预览</span>}
          >
            <div className="m05-table-wrap m05-anom-table-wrap">
              <DataTable
                columns={anomalyColumns}
                rows={anomalies}
                rowKey={(row) => row.id}
                emptyText="当前工区考勤异常记录已全部核查清零"
              />
            </div>
            <div className="m05-anomaly-footer">
              <span>演示日期 &nbsp; {date}</span>
              <span>共 {anomalies.length} 条异常记录</span>
            </div>
          </GlassPanel>
        </div>
      </div>

      {modalRole ? (
        <KeyRoleModal
          role={modalRole}
          attendanceDate={date}
          submitting={submitting}
          onAssign={handleAssignRole}
          onUnassign={handleUnassignRole}
          onJumpProfile={(staffId) => {
            setModalRole(null);
            onJumpOrgProfile(staffId);
          }}
          onClose={() => setModalRole(null)}
        />
      ) : null}

      {modalAnomaly ? (
        <AnomalyModal
          anomaly={modalAnomaly}
          submitting={submitting}
          onResolve={handleResolveAnomaly}
          onClose={() => setModalAnomaly(null)}
        />
      ) : null}
    </div>
  );
}
