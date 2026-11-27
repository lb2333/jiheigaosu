'use client';

import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import {
  Archive,
  BarChart3,
  Clock,
  Cog,
  FileText,
  MapPin,
  PauseCircle,
  RotateCcw,
  Search,
  Truck,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge, type BadgeTone } from '@/components/ui/StatusBadge';
import {
  BASE_DATE,
  EQUIP_TYPES,
  SECTIONS,
  type EquipmentDTO,
  type EquipmentListResponse,
  type MachineMarkerDTO,
} from '../types';
import { PaginationBar } from './PaginationBar';
import { EquipmentModal } from './MachineModals';

function entryTone(status: string): BadgeTone {
  return status === '在场' ? 'info' : 'muted';
}

function useStatusTone(status: string): BadgeTone {
  if (status === '在用') return 'ok';
  if (status === '待用') return 'info';
  if (status === '停用') return 'warn';
  return 'muted';
}

function HorizontalBarSvg({
  value,
  maxVal,
  isActive,
}: {
  value: number;
  maxVal: number;
  isActive: boolean;
}) {
  const gradId = useId().replace(/:/g, '_');
  const W = 120;
  const H = 12;
  const ratio = maxVal > 0 ? Math.max(0, Math.min(1, value / maxVal)) : 0;
  const fillW = value > 0 ? Math.max(5, ratio * W) : 0;

  return (
    <svg className="m06-hbar-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={isActive ? '#fde047' : '#0ea5e9'} />
          <stop offset="100%" stopColor="#38f2ff" />
        </linearGradient>
      </defs>
      <rect x="0" y="3" width={W} height="6" rx="3" fill="rgba(22, 58, 114, 0.85)" />
      {fillW > 0 ? (
        <rect
          x="0"
          y="3"
          width={fillW.toFixed(1)}
          height="6"
          rx="3"
          fill={`url(#${gradId})`}
        />
      ) : null}
    </svg>
  );
}

export function EquipmentSubPage({
  activeSectionId,
  onSectionChange,
  onJumpArchive,
  onMarkersLoaded,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  onJumpArchive: (code: string) => void;
  onMarkersLoaded: (markers: MachineMarkerDTO[]) => void;
  showToast: (msg: string) => void;
}) {
  const [equipType, setEquipType] = useState('');
  const [entryStatus, setEntryStatus] = useState('');
  const [useStatus, setUseStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [committedKw, setCommittedKw] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 8;

  const [data, setData] = useState<EquipmentListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCode, setSelectedCode] = useState('QZ-03-006');
  const [modalEquipment, setModalEquipment] = useState<EquipmentDTO | null>(null);
  const [saving, setSaving] = useState(false);

  const loadEquipment = useCallback(async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      if (equipType) qs.set('type', equipType);
      if (entryStatus) qs.set('entryStatus', entryStatus);
      if (useStatus) qs.set('useStatus', useStatus);
      if (committedKw) qs.set('q', committedKw);
      qs.set('page', String(page));
      qs.set('pageSize', String(pageSize));

      const res = await fetch(`/api/v1/m06/equipment?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `HTTP ${res.status}`);
      }
      const json = (await res.json()) as EquipmentListResponse;
      setData(json);
      onMarkersLoaded(json.representativeMarkers ?? []);
    } catch (err) {
      showToast(err instanceof Error ? err.message : '加载机械设备台账失败');
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, equipType, entryStatus, useStatus, committedKw, page, onMarkersLoaded, showToast]);

  useEffect(() => {
    void loadEquipment();
  }, [loadEquipment]);

  const rows = useMemo(() => data?.items ?? [], [data]);
  const selected = useMemo(() => {
    if (!rows.length) return null;
    return rows.find((r) => r.code === selectedCode) ?? rows[0];
  }, [rows, selectedCode]);

  const kpis = data?.kpis ?? {
    total: 0,
    onSite: 0,
    inUse: 0,
    standby: 0,
    stopped: 0,
    exited: 0,
  };

  const byType = data?.distributions.byType ?? EQUIP_TYPES.map((t) => ({ name: t.name, count: 0 }));
  const bySection = data?.distributions.bySection ?? SECTIONS.map((s) => ({ id: s.id, name: s.name, count: 0 }));
  const maxTypeCount = Math.max(1, ...byType.map((t) => t.count));
  const maxSecCount = Math.max(1, ...bySection.map((s) => s.count));

  function handleQuery() {
    setCommittedKw(keyword.trim());
    setPage(1);
    showToast('已按当前筛选条件刷新机械管理台账');
  }

  function handleReset() {
    setEquipType('');
    setEntryStatus('');
    setUseStatus('');
    setKeyword('');
    setCommittedKw('');
    setPage(1);
    if (activeSectionId) onSectionChange(null);
    showToast('已重置机械管理筛选条件');
  }

  async function handleSaveStatus(
    code: string,
    payload: { entryStatus: string; useStatus: string; location: string }
  ) {
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/m06/equipment/${encodeURIComponent(code)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `状态变更失败 (${res.status})`);
      }
      setModalEquipment(null);
      showToast(`已更新设备 ${code} 状态并记录审计日志`);
      await loadEquipment();
    } catch (err) {
      showToast(err instanceof Error ? err.message : '保存设备状态失败');
    } finally {
      setSaving(false);
    }
  }

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
              {EQUIP_TYPES.map((t) => (
                <option key={t.name} value={t.name}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">进退场</span>
            <select
              className="glass-select m06-select"
              value={entryStatus}
              onChange={(e) => {
                setEntryStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="在场">在场</option>
              <option value="已退场">已退场</option>
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">使用状态</span>
            <select
              className="glass-select m06-select"
              value={useStatus}
              onChange={(e) => {
                setUseStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              <option value="在用">在用</option>
              <option value="待用">待用</option>
              <option value="停用">停用</option>
              <option value="—">已退场（—）</option>
            </select>
          </div>

          <div className="m06-field">
            <span className="m06-field-label">设备检索</span>
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
                placeholder="编号、名称或所属单位"
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
        title="设备台账概况"
        subtitle={`(截至 ${BASE_DATE})`}
        className="m06-kpi-panel"
      >
        <div className="m06-kpi-grid">
          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <BarChart3 size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">登记设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.total}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <MapPin size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">在场设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.onSite}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-green">
              <Cog size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">在用设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-green">{kpis.inUse}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon">
              <Clock size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">待用设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val">{kpis.standby}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-gold">
              <PauseCircle size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">停用设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-gold">{kpis.stopped}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>

          <div className="m06-kpi-card">
            <div className="m06-kpi-icon tone-blue">
              <Truck size={18} />
            </div>
            <div className="m06-kpi-meta">
              <div className="m06-kpi-label">已退场设备</div>
              <div className="m06-kpi-val-row">
                <span className="m06-kpi-val tone-blue">{kpis.exited}</span>
                <span className="m06-kpi-unit">台</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* 3-Column Workspace */}
      <div className="m06-equip-grid">
        {/* Left: Distribution */}
        <GlassPanel title="设备分布" className="m06-no-pad-panel">
          <div className="m06-dist-body">
            <div className="m06-dist-group">
              <div className="m06-dist-head">
                <span>按设备类型</span>
                <span>{data?.distributions.typeTotal ?? 0} 台</span>
              </div>
              {byType.map((t) => {
                const active = equipType === t.name;
                const dimmed = Boolean(equipType && !active);
                return (
                  <button
                    key={t.name}
                    type="button"
                    className={`m06-hbar-row ${active ? 'active' : ''} ${dimmed ? 'dimmed' : ''}`}
                    title={`点击按「${t.name}」筛选`}
                    onClick={() => {
                      setEquipType((prev) => (prev === t.name ? '' : t.name));
                      setPage(1);
                    }}
                  >
                    <span className="m06-hbar-label">{t.name}</span>
                    <HorizontalBarSvg value={t.count} maxVal={maxTypeCount} isActive={active} />
                    <span className="m06-hbar-val">{t.count}</span>
                  </button>
                );
              })}
            </div>

            <div className="m06-dist-divider" />

            <div className="m06-dist-group">
              <div className="m06-dist-head">
                <span>按工区查看在场设备</span>
                <span>{data?.distributions.sectionTotal ?? 0} 台</span>
              </div>
              {bySection.map((s) => {
                const active = activeSectionId === s.id;
                const dimmed = Boolean(activeSectionId && !active);
                return (
                  <button
                    key={s.id}
                    type="button"
                    className={`m06-hbar-row ${active ? 'active' : ''} ${dimmed ? 'dimmed' : ''}`}
                    title={`点击联动筛选${s.name}`}
                    onClick={() => {
                      setPage(1);
                      onSectionChange(activeSectionId === s.id ? null : s.id);
                    }}
                  >
                    <span className="m06-hbar-label">{s.name}</span>
                    <HorizontalBarSvg value={s.count} maxVal={maxSecCount} isActive={active} />
                    <span className="m06-hbar-val">{s.count}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </GlassPanel>

        {/* Center: Equipment Table */}
        <GlassPanel
          title="设备台账"
          headerRight={<span className="m06-header-meta">更新于 {BASE_DATE} 09:30</span>}
          className="m06-no-pad-panel m06-table-panel"
        >
          <div className="m06-table-wrap">
            {loading && !data ? (
              <div className="m06-empty">正在读取机械设备台账数据...</div>
            ) : rows.length > 0 ? (
              <table className="data-table m06-table">
                <thead>
                  <tr>
                    <th>设备编号</th>
                    <th>设备名称</th>
                    <th>设备类型</th>
                    <th>所属单位</th>
                    <th>工区</th>
                    <th>进退场</th>
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
                      <td>{r.code}</td>
                      <td style={{ fontWeight: 600, color: '#ffffff' }}>{r.name}</td>
                      <td>{r.type}</td>
                      <td>{r.unit}</td>
                      <td>{r.sectionName}</td>
                      <td>
                        <StatusBadge text={r.entryStatus} tone={entryTone(r.entryStatus)} />
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
                            setModalEquipment(r);
                          }}
                        >
                          {r.isKey ? '查看档案' : '查看'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="m06-empty">
                当前筛选条件下暂无匹配设备记录，请调整筛选条件或点击“重置”。
              </div>
            )}
          </div>

          <PaginationBar
            totalItems={data?.total ?? 0}
            currentPage={data?.page ?? page}
            pageSize={pageSize}
            unitLabel="台设备"
            onPageChange={setPage}
          />
        </GlassPanel>

        {/* Right: Equipment Detail */}
        <GlassPanel title="设备详情" className="m06-no-pad-panel m06-table-panel">
          {selected ? (
            <div className="m06-detail-body">
              <div className="m06-detail-top">
                <div className="m06-hero-card">
                  <div className="m06-hero-left">
                    <div className="m06-hero-ico">
                      <Cog size={20} />
                    </div>
                    <div>
                      <div className="m06-hero-title">{selected.name}</div>
                      <div className="m06-hero-code">{selected.code}</div>
                    </div>
                  </div>
                  {selected.entryStatus === '在场' ? (
                    <StatusBadge
                      text={selected.useStatus}
                      tone={useStatusTone(selected.useStatus)}
                    />
                  ) : (
                    <StatusBadge
                      text={selected.entryStatus}
                      tone={entryTone(selected.entryStatus)}
                    />
                  )}
                </div>

                <div className="m06-kv-list">
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">设备类型</span>
                    <span className="m06-kv-v">{selected.type}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">所属单位</span>
                    <span className="m06-kv-v">{selected.unit}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">所属工区</span>
                    <span className="m06-kv-v">{selected.sectionName}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">设备位置</span>
                    <span className="m06-kv-v">{selected.location}</span>
                  </div>
                </div>

                <div className="m06-subbox">
                  <div className="m06-subbox-head">
                    <span>进退场记录</span>
                    <StatusBadge
                      text={selected.entryStatus}
                      tone={entryTone(selected.entryStatus)}
                    />
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">进场日期</span>
                    <span className="m06-kv-v">{selected.entryDate}</span>
                  </div>
                  <div className="m06-kv-row">
                    <span className="m06-kv-k">退场日期</span>
                    <span className="m06-kv-v">{selected.exitDate}</span>
                  </div>
                </div>

                {selected.isKey && selected.certMeta ? (
                  <div className="m06-subbox">
                    <div className="m06-subbox-head">
                      <span>关联重点档案</span>
                    </div>
                    <div className="m06-kv-row">
                      <span className="m06-kv-k">档案编号</span>
                      <span className="m06-kv-v">{selected.archiveId}</span>
                    </div>
                    <div className="m06-kv-row">
                      <span className="m06-kv-k">证书状态</span>
                      <StatusBadge
                        text={selected.certMeta.status}
                        tone={selected.certMeta.badgeTone}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="m06-subbox">
                    <div className="m06-subbox-head">
                      <span>设备技术规格</span>
                    </div>
                    <div className="m06-kv-row">
                      <span className="m06-kv-k">型号规格</span>
                      <span className="m06-kv-v">{selected.model}</span>
                    </div>
                    <div className="m06-kv-row">
                      <span className="m06-kv-k">重点机械标识</span>
                      <span className="m06-kv-v" style={{ color: '#93b8de' }}>
                        一般施工设备
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="m06-detail-footer">
                <div className="m06-kv-row">
                  <span className="m06-kv-k">台账更新</span>
                  <span className="m06-kv-v" style={{ color: '#93b8de', fontWeight: 500 }}>
                    {BASE_DATE} 09:30
                  </span>
                </div>
                {selected.isKey ? (
                  <button
                    type="button"
                    className="btn-primary-glow m06-cta-btn"
                    onClick={() => onJumpArchive(selected.code)}
                  >
                    <Archive size={16} />
                    <span>查看重点机械档案</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-primary-glow m06-cta-btn"
                    onClick={() => setModalEquipment(selected)}
                  >
                    <FileText size={16} />
                    <span>查看设备台账详情</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="m06-empty">暂无设备详情</div>
          )}
        </GlassPanel>
      </div>

      {modalEquipment ? (
        <EquipmentModal
          equipment={modalEquipment}
          saving={saving}
          onSaveStatus={handleSaveStatus}
          onJumpArchive={(code) => {
            setModalEquipment(null);
            onJumpArchive(code);
          }}
          onClose={() => setModalEquipment(null)}
        />
      ) : null}
    </div>
  );
}
