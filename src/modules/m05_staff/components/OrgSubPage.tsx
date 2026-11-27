'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Award,
  Building2,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Clock,
  HardHat,
  RotateCcw,
  Search,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { KpiCard } from '@/components/ui/KpiCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  ORG_TYPE_OPTIONS,
  SECTION_OPTIONS,
  type OrgPageResponse,
  type StaffMemberDTO,
} from '../types';
import { StaffArchiveModal } from './StaffModals';

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

function renderOrgGroupIcon(type: string) {
  if (type === '项目办') return <Building2 size={13} />;
  if (type === '监理单位') return <ShieldCheck size={13} />;
  return <HardHat size={13} />;
}

export function OrgSubPage({
  activeSectionId,
  initialSelectedStaffId,
  onSectionChange,
  onJumpAttendance,
  showToast,
}: {
  activeSectionId: string | null;
  initialSelectedStaffId?: string;
  onSectionChange: (secId: string | null) => void;
  onJumpAttendance: (roleCode?: string) => void;
  showToast: (msg: string) => void;
}) {
  const [orgType, setOrgType] = useState('');
  const [lineOnly, setLineOnly] = useState(false);
  const [dutyStatus, setDutyStatus] = useState('');
  const [keywordDraft, setKeywordDraft] = useState('');
  const [keyword, setKeyword] = useState('');
  const [selectedOrgId, setSelectedOrgId] = useState('');
  const [collapsedGroups, setCollapsedGroups] = useState<Record<string, boolean>>({});
  const [selectedStaffId, setSelectedStaffId] = useState(initialSelectedStaffId || 'RY-0201');
  const [page, setPage] = useState(1);

  const [data, setData] = useState<OrgPageResponse | null>(null);
  const [modalPerson, setModalPerson] = useState<StaffMemberDTO | null>(null);
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
      orgType,
      sectionId: effectiveSectionId,
      orgId: selectedOrgId,
      dutyStatus,
      q: keyword,
      selectedStaffId,
      page: String(page),
      pageSize: '8',
    });
    const res = await fetch(`/api/v1/m05/org?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as OrgPageResponse;
      setData(json);
    }
  }, [orgType, effectiveSectionId, selectedOrgId, dutyStatus, keyword, selectedStaffId, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const allOrgs = useMemo(() => data?.allOrgs ?? [], [data]);
  const treeOrgs = useMemo(() => data?.treeOrgs ?? [], [data]);
  const treeOrgIdSet = useMemo(() => new Set(treeOrgs.map((o) => o.id)), [treeOrgs]);

  const items = useMemo(() => data?.items ?? [], [data]);
  const selectedPerson = useMemo(() => {
    if (data?.selectedPerson) return data.selectedPerson;
    return items.find((s) => s.id === selectedStaffId) ?? items[0] ?? null;
  }, [data, items, selectedStaffId]);

  const kpis = data?.kpis ?? {
    orgCount: 11,
    staffTotal: 186,
    onDutyCount: 174,
    offDutyCount: 12,
    roleTotal: 36,
    assignedRolesCount: 33,
  };

  const totalItems = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 1;
  const safePage = data?.page ?? page;
  const pageButtons = buildPageButtons(totalPages, safePage);

  function handleSectionSelect(val: string) {
    setPage(1);
    setSelectedOrgId('');
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
    setKeyword(keywordDraft);
    setPage(1);
    showToast('已按当前筛选条件刷新人员管理数据');
  }

  function handleReset() {
    setOrgType('');
    setLineOnly(false);
    setDutyStatus('');
    setKeywordDraft('');
    setKeyword('');
    setSelectedOrgId('');
    setPage(1);
    if (activeSectionId) {
      onSectionChange(null);
    }
    showToast('已重置筛选条件');
  }

  async function handleToggleStaffStatus(
    staffId: string,
    nextStatus: '在岗' | '暂未在岗',
    offReason: string
  ) {
    setSubmitting(true);
    try {
      const res = await fetch(`/api/v1/m05/staff/${encodeURIComponent(staffId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus, offReason }),
      });
      if (res.ok) {
        const name = modalPerson?.name ?? staffId;
        setModalPerson(null);
        showToast(`已更新 ${name} (${staffId}) 台账状态为「${nextStatus}」`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '更新人员台账状态失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="m05-page">
      {/* 1. Top Filter Bar */}
      <div className="glass-panel m05-filter-panel">
        <div className="m05-filter-fields">
          <div className="m05-field">
            <span className="m05-field-label">组织类型</span>
            <select
              className="glass-select m05-select"
              value={orgType}
              onChange={(e) => {
                setOrgType(e.target.value);
                setSelectedOrgId('');
                setPage(1);
              }}
            >
              <option value="">全部类型</option>
              {ORG_TYPE_OPTIONS.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

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
            <span className="m05-field-label">在岗状态</span>
            <select
              className="glass-select m05-select"
              value={dutyStatus}
              onChange={(e) => {
                setDutyStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="在岗">在岗</option>
              <option value="暂未在岗">暂未在岗</option>
            </select>
          </div>

          <div className="m05-field">
            <span className="m05-field-label">人员搜索</span>
            <div className="m05-search-wrap">
              <span className="m05-search-ico">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="m05-input"
                placeholder="姓名、岗位或所属单位"
                value={keywordDraft}
                onChange={(e) => setKeywordDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleQuery();
                }}
              />
            </div>
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

      {/* 2. 6-Card KPI Row */}
      <GlassPanel
        title="人员台账概况"
        subtitle="(截至 2026-11-26)"
        className="m05-glass-no-pad"
      >
        <div className="m05-kpi-grid-6">
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <Building2 size={18} />
            </div>
            <KpiCard label="参建组织" value={kpis.orgCount} unit="个" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <Users size={18} />
            </div>
            <KpiCard label="登记人员" value={kpis.staffTotal} unit="人" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon tone-green">
              <User size={18} />
            </div>
            <KpiCard label="在岗人员" value={kpis.onDutyCount} unit="人" tone="green" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon tone-amber">
              <Clock size={18} />
            </div>
            <KpiCard label="暂未在岗" value={kpis.offDutyCount} unit="人" tone="gold" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <Award size={18} />
            </div>
            <KpiCard label="关键岗位" value={kpis.roleTotal} unit="个" />
          </div>
          <div className="m05-kpi-shell">
            <div className="m05-kpi-icon">
              <CheckCircle2 size={18} />
            </div>
            <KpiCard label="已配置岗位" value={kpis.assignedRolesCount} unit="个" />
          </div>
        </div>
      </GlassPanel>

      {/* 3. Bottom 3-Column Workspace */}
      <div className="m05-org-workspace">
        {/* Left: 参建组织 */}
        <GlassPanel title="参建组织" className="m05-glass-no-pad">
          <div className="m05-tree-body">
            <button
              type="button"
              className={`m05-tree-all ${!selectedOrgId ? 'active' : ''}`}
              onClick={() => {
                setSelectedOrgId('');
                setPage(1);
              }}
            >
              <span>全部参建组织</span>
              <span>{treeOrgs.length || 11}个</span>
            </button>

            {ORG_TYPE_OPTIONS.map((grpType) => {
              const members = allOrgs.filter((o) => o.type === grpType);
              const visibleCount = members.filter((o) => treeOrgIdSet.has(o.id)).length;
              const collapsed = Boolean(collapsedGroups[grpType]);

              return (
                <div key={grpType} className="m05-tree-group">
                  <button
                    type="button"
                    className="m05-tree-group-hdr"
                    onClick={() =>
                      setCollapsedGroups((prev) => ({
                        ...prev,
                        [grpType]: !prev[grpType],
                      }))
                    }
                  >
                    <span className="m05-tree-group-left">
                      <span style={{ display: 'inline-flex', color: '#78a2d4' }}>
                        {collapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
                      </span>
                      <span style={{ display: 'inline-flex', color: '#38bdf8' }}>
                        {renderOrgGroupIcon(grpType)}
                      </span>
                      <span>{grpType}</span>
                    </span>
                    <span className="m05-tree-group-count">{visibleCount} 个</span>
                  </button>

                  {!collapsed ? (
                    <div className="m05-tree-children">
                      {members.map((org) => {
                        const inScope = treeOrgIdSet.has(org.id);
                        const isActive = selectedOrgId === org.id;
                        return (
                          <button
                            key={org.id}
                            type="button"
                            className={`m05-tree-item ${isActive ? 'active' : ''} ${
                              !inScope ? 'dimmed' : ''
                            }`}
                            onClick={() => {
                              setSelectedOrgId((prev) => (prev === org.id ? '' : org.id));
                              setPage(1);
                            }}
                          >
                            <span>{org.name}</span>
                            <span className="m05-tree-item-cnt">{org.staffCount} 人</span>
                          </button>
                        );
                      })}
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </GlassPanel>

        {/* Center: 人员台账 */}
        <GlassPanel
          title="人员台账"
          className="m05-glass-no-pad m05-table-panel"
          headerRight={<div className="m05-header-right">更新于 2026-11-26 09:30</div>}
        >
          <div className="m05-table-wrap">
            <table className="data-table m05-table">
              <thead>
                <tr>
                  <th>人员编号</th>
                  <th>姓名</th>
                  <th>所属组织</th>
                  <th>所属工区</th>
                  <th>岗位</th>
                  <th>在岗状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length > 0 ? (
                  items.map((s) => {
                    const isSel = selectedPerson?.id === s.id;
                    return (
                      <tr
                        key={s.id}
                        className={isSel ? 'selected' : ''}
                        onClick={() => setSelectedStaffId(s.id)}
                      >
                        <td>{s.id}</td>
                        <td style={{ fontWeight: 700, color: '#ffffff' }}>{s.name}</td>
                        <td>{s.orgName}</td>
                        <td>{s.sectionName}</td>
                        <td>{s.role}</td>
                        <td>
                          <StatusBadge
                            text={s.status}
                            tone={s.status === '在岗' ? 'ok' : 'muted'}
                          />
                        </td>
                        <td>
                          <button
                            type="button"
                            className="m05-link-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedStaffId(s.id);
                              setModalPerson(s);
                            }}
                          >
                            查看档案
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td
                      colSpan={7}
                      style={{ textAlign: 'center', padding: '36px 12px', color: '#93b8de' }}
                    >
                      {data ? '当前筛选条件下暂无匹配人员记录' : '人员台账明细加载中...'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <div className="m05-pagination">
            <span style={{ marginRight: '4px' }}>共 {totalItems} 人</span>
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
        </GlassPanel>

        {/* Right: 人员档案 */}
        <GlassPanel title="人员档案" className="m05-glass-no-pad m05-table-panel">
          {selectedPerson ? (
            <div className="m05-profile-body">
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div className="m05-profile-top">
                  <div className="m05-profile-idwrap">
                    <div className="m05-avatar-box">
                      <User size={18} />
                    </div>
                    <div>
                      <div className="m05-profile-name">{selectedPerson.name}</div>
                      <div className="m05-profile-code">{selectedPerson.id}</div>
                    </div>
                  </div>
                  <StatusBadge
                    text={selectedPerson.status}
                    tone={selectedPerson.status === '在岗' ? 'ok' : 'muted'}
                  />
                </div>

                <div className="m05-kv-list">
                  <div className="m05-kv-row">
                    <span className="m05-kv-k">组织类型</span>
                    <span className="m05-kv-v">{selectedPerson.orgType}</span>
                  </div>
                  <div className="m05-kv-row">
                    <span className="m05-kv-k">所属单位</span>
                    <span className="m05-kv-v">{selectedPerson.orgName}</span>
                  </div>
                  <div className="m05-kv-row">
                    <span className="m05-kv-k">所属工区</span>
                    <span className="m05-kv-v">{selectedPerson.sectionName}</span>
                  </div>
                  <div className="m05-kv-row">
                    <span className="m05-kv-k">岗位</span>
                    <span className="m05-kv-v">{selectedPerson.role}</span>
                  </div>
                </div>

                <div className="m05-subcard">
                  <div className="m05-subcard-hdr">
                    <span>关键岗位任职</span>
                    <StatusBadge
                      text={selectedPerson.keyRole ? '已配置' : '一般岗位'}
                      tone={selectedPerson.keyRole ? 'info' : 'muted'}
                    />
                  </div>
                  {selectedPerson.keyRole ? (
                    <>
                      <div className="m05-kv-row">
                        <span className="m05-kv-k">岗位编号</span>
                        <span
                          className="m05-kv-v"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {selectedPerson.keyRole.code}
                        </span>
                      </div>
                      <div className="m05-kv-row">
                        <span className="m05-kv-k">入岗日期</span>
                        <span
                          className="m05-kv-v"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {selectedPerson.keyRole.assignDate || selectedPerson.joinDate}
                        </span>
                      </div>
                      <div className="m05-kv-row">
                        <span className="m05-kv-k">任职状态</span>
                        <span className="m05-kv-v">{selectedPerson.status}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="m05-kv-row">
                        <span className="m05-kv-k">入场日期</span>
                        <span
                          className="m05-kv-v"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {selectedPerson.joinDate}
                        </span>
                      </div>
                      <div className="m05-kv-row">
                        <span className="m05-kv-k">资格证号</span>
                        <span
                          className="m05-kv-v"
                          style={{ fontVariantNumeric: 'tabular-nums' }}
                        >
                          {selectedPerson.cert}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                <div className="m05-duty-box">
                  <div className="m05-duty-title">主要职责</div>
                  <div className="m05-duty-text">{selectedPerson.duty}</div>
                </div>
              </div>

              <div className="m05-profile-foot">
                <div className="m05-update-row">
                  <span>台账更新</span>
                  <span>2026-11-26 09:30</span>
                </div>
                <button
                  type="button"
                  className="btn-primary-glow"
                  onClick={() => onJumpAttendance(selectedPerson.keyRole?.code)}
                >
                  <ClipboardList size={15} />
                  <span>查看岗位配置</span>
                </button>
              </div>
            </div>
          ) : (
            <div
              className="m05-profile-body"
              style={{ justifyContent: 'center', alignItems: 'center', color: '#93b8de' }}
            >
              请选择左侧人员查看档案
            </div>
          )}
        </GlassPanel>
      </div>

      {modalPerson ? (
        <StaffArchiveModal
          person={modalPerson}
          submitting={submitting}
          onToggleStatus={handleToggleStaffStatus}
          onJumpToRole={(roleCode) => {
            setModalPerson(null);
            onJumpAttendance(roleCode);
          }}
          onClose={() => setModalPerson(null)}
        />
      ) : null}
    </div>
  );
}
