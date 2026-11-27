'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  FileText,
  Plane,
  Play,
  RotateCcw,
  Search,
  Video,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { DataTable, type ColumnDef } from '@/components/ui/DataTable';
import { SvgGateCamera, SvgUavInspection } from '../MaterialSvgs';
import { EntryLedgerModal, LabReportModal, MediaPreviewModal } from '../MaterialModals';
import {
  DEFAULT_YARDS,
  MATERIAL_TYPES,
  YARD_BY_SECTION_ID,
  statusTone,
  type MaterialBatchDTO,
  type MaterialYardDTO,
} from '../types';

const INITIAL_BATCH: MaterialBatchDTO = {
  batchId: 'BM-JC-20261126-007',
  sectionId: 'sec2',
  sectionName: '二工区',
  yardId: 'yd-2',
  yardName: '料场示例A',
  material: '碎石',
  spec: '5–20 mm',
  entryTime: '11-26 08:16',
  videoTime: '2026-11-26 08:16:20',
  videoTimeShort: '11-26 08:16:20',
  uavTime: '2026-11-26 09:27:18',
  uavTimeShort: '11-26 09:27:18',
  uavFile: '料场全面巡检 · IMG_0018.jpg',
  qty: 720,
  status: '合格',
  reportId: 'JC-20261126-021',
  inspectTime: '2026-11-26 10:08',
  inspectTimeShort: '11-26 10:08',
  supplier: '明水宏达碎石料场',
  plateNo: '黑M·86219',
  quarantineNote: '',
  items: [
    { name: '颗粒级配', pass: true, val: '连续级配 5-20mm 合格', std: 'JTG/T 3650' },
    { name: '针片状含量', pass: true, val: '5.8% (≤15%)', std: '≤15.0%' },
    { name: '含泥量', pass: true, val: '0.6% (≤1.0%)', std: '≤1.0%' },
  ],
  sortOrder: 1,
};

interface LinkedRecordRow {
  id: string;
  source: string;
  refCode: string;
  time: string;
  actionLabel: string;
  onAction: () => void;
}

export function InspectSubPage({
  activeSectionId,
  initialMaterial,
  initialBatchId,
  onSectionChange,
  showToast,
}: {
  activeSectionId: string | null;
  initialMaterial?: string;
  initialBatchId?: string;
  onSectionChange: (secId: string | null) => void;
  showToast: (msg: string) => void;
}) {
  const router = useRouter();
  const effectiveSecId = activeSectionId ?? 'sec2';

  const [material, setMaterial] = useState<string>(initialMaterial ?? '');
  const [batchQuery, setBatchQuery] = useState<string>('');
  const [selectedBatchId, setSelectedBatchId] = useState<string>(
    initialBatchId ?? 'BM-JC-20261126-007'
  );

  useEffect(() => {
    if (initialMaterial !== undefined) {
      setMaterial(initialMaterial);
    }
  }, [initialMaterial]);

  useEffect(() => {
    if (initialBatchId) {
      setSelectedBatchId(initialBatchId);
    }
  }, [initialBatchId]);
  const [yards, setYards] = useState<MaterialYardDTO[]>(DEFAULT_YARDS);
  const [currentYard, setCurrentYard] = useState<MaterialYardDTO>(
    YARD_BY_SECTION_ID[effectiveSecId] ?? YARD_BY_SECTION_ID['sec2']
  );
  const [batches, setBatches] = useState<MaterialBatchDTO[]>([INITIAL_BATCH]);

  const [labModalOpen, setLabModalOpen] = useState(false);
  const [updatingBatch, setUpdatingBatch] = useState(false);
  const [mediaModalType, setMediaModalType] = useState<'gate' | 'uav' | null>(null);
  const [ledgerModalOpen, setLedgerModalOpen] = useState(false);

  const fetchBatches = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('sectionId', effectiveSecId);
    if (material) params.set('category', material);
    if (batchQuery.trim()) params.set('q', batchQuery.trim());

    try {
      const res = await fetch(`/api/v1/m07/batches?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as {
        yards?: MaterialYardDTO[];
        currentYard?: MaterialYardDTO;
        batches?: MaterialBatchDTO[];
      };
      if (json.yards?.length) setYards(json.yards);
      if (json.currentYard) setCurrentYard(json.currentYard);
      if (json.batches) {
        setBatches(json.batches);
        if (json.batches.length > 0 && !json.batches.some((b) => b.batchId === selectedBatchId)) {
          setSelectedBatchId(json.batches[0].batchId);
        }
      }
    } catch {
      // Keep current state on transient error
    }
  }, [effectiveSecId, material, batchQuery, selectedBatchId]);

  useEffect(() => {
    void fetchBatches();
  }, [fetchBatches]);

  const selected =
    batches.find((b) => b.batchId === selectedBatchId) ?? batches[0] ?? INITIAL_BATCH;

  async function handleUpdateBatchStatus(
    batchId: string,
    nextStatus: '合格' | '复检中' | '不合格'
  ) {
    setUpdatingBatch(true);
    try {
      const res = await fetch(`/api/v1/m07/batches/${encodeURIComponent(batchId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = (await res.json()) as { batch?: MaterialBatchDTO; error?: string };
      if (!res.ok) {
        showToast(json.error ?? '更新批次检验状态失败');
        return;
      }
      showToast(`批次 ${batchId} 检验状态已更新为「${nextStatus}」`);
      await fetchBatches();
    } catch {
      showToast('更新批次检验状态请求失败');
    } finally {
      setUpdatingBatch(false);
    }
  }

  const linkedRows: LinkedRecordRow[] = [
    {
      id: 'rel-lab',
      source: '实验室报告',
      refCode: selected.reportId,
      time: selected.inspectTimeShort,
      actionLabel: '查看报告',
      onAction: () => setLabModalOpen(true),
    },
    {
      id: 'rel-gate',
      source: '入口视频',
      refCode: currentYard.camId,
      time: selected.videoTimeShort,
      actionLabel: '回看录像',
      onAction: () => setMediaModalType('gate'),
    },
    {
      id: 'rel-uav',
      source: '无人机巡检',
      refCode: currentYard.uavId,
      time: selected.uavTimeShort,
      actionLabel: '查看成果',
      onAction: () => setMediaModalType('uav'),
    },
  ];

  const linkedColumns: ColumnDef<LinkedRecordRow>[] = [
    { key: 'source', header: '来源', render: (r) => r.source },
    { key: 'refCode', header: '关联编号', render: (r) => r.refCode },
    { key: 'time', header: '记录时间', render: (r) => r.time },
    {
      key: 'action',
      header: '操作',
      render: (r) => (
        <button type="button" className="m07-link-btn" onClick={r.onAction}>
          {r.actionLabel}
        </button>
      ),
    },
  ];

  return (
    <div className="m07-page">
      {/* Top Filter Bar */}
      <div className="glass-panel m07-filter-panel">
        <div className="m07-filter-fields">
          <div className="m07-field">
            <span className="m07-field-label">所属工区</span>
            <select
              className="glass-select m07-select"
              value={currentYard.sectionId}
              onChange={(e) => {
                setBatchQuery('');
                onSectionChange(e.target.value);
              }}
            >
              {yards.map((y) => (
                <option key={y.sectionId} value={y.sectionId}>
                  {y.sectionName}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">料场</span>
            <select
              className="glass-select m07-select"
              value={currentYard.sectionId}
              onChange={(e) => {
                setBatchQuery('');
                onSectionChange(e.target.value);
              }}
            >
              {yards.map((y) => (
                <option key={y.id} value={y.sectionId}>
                  {y.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">材料类别</span>
            <select
              className="glass-select m07-select"
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
            >
              <option value="">全部材料</option>
              {MATERIAL_TYPES.map((m) => (
                <option key={m.name} value={m.name}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div className="m07-field">
            <span className="m07-field-label">进场批次</span>
            <span className="m07-search-wrap">
              <span className="m07-search-ico">
                <Search size={14} />
              </span>
              <input
                className="m07-input"
                value={batchQuery}
                onChange={(e) => setBatchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') void fetchBatches();
                }}
                placeholder="BM-JC-20261126-007"
              />
            </span>
          </div>
        </div>

        <div className="m07-filter-actions">
          <button
            type="button"
            className="m07-btn-primary"
            onClick={() => {
              void fetchBatches();
              showToast('已更新进场批次与现场影像关联');
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() => {
              setMaterial('');
              setBatchQuery('');
              setSelectedBatchId('BM-JC-20261126-007');
              onSectionChange(null);
              showToast('已重置批次关联筛选');
            }}
          >
            <RotateCcw size={14} /> 重置
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="m07-p4-grid">
        {/* Left Column: Batch List + Lab Result */}
        <div className="m07-stack">
          <GlassPanel
            title="关联进场批次"
            className="m07-table-panel"
            bodyClassName="m07-panel-body-flush"
            headerRight={<div className="m07-header-right">{currentYard.name}</div>}
          >
            <div className="m07-table-wrap">
              <table className="data-table m07-table">
                <thead>
                  <tr>
                    <th>进场批次</th>
                    <th>材料</th>
                    <th>进场时间</th>
                    <th>检验状态</th>
                  </tr>
                </thead>
                <tbody>
                  {batches.length > 0 ? (
                    batches.map((b) => (
                      <tr
                        key={b.batchId}
                        className={b.batchId === selected.batchId ? 'selected' : ''}
                        onClick={() => setSelectedBatchId(b.batchId)}
                      >
                        <td>{b.batchId}</td>
                        <td>{b.material}</td>
                        <td>{b.entryTime}</td>
                        <td>
                          <StatusBadge text={b.status} tone={statusTone(b.status)} />
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', color: '#93b8de', padding: '20px' }}>
                        未匹配到进场批次
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="m07-panel-footer">
              <span>显示 {batches.length} 条批次记录</span>
              <button
                type="button"
                className="m07-link-btn"
                onClick={() => setLedgerModalOpen(true)}
              >
                查看进场明细 <ChevronRight size={12} />
              </button>
            </div>
          </GlassPanel>

          <GlassPanel title="检验结果" bodyClassName="m07-panel-body-flush">
            <div className="m07-verify-body">
              <div className="m07-file-hdr">
                <span
                  style={{
                    fontSize: '15px',
                    fontWeight: 800,
                    color: '#ffffff',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {selected.reportId}
                </span>
                <StatusBadge text={selected.status} tone={statusTone(selected.status)} />
              </div>

              <div className="m07-kv-list">
                <div className="m07-kv-row">
                  <span className="m07-kv-k">进场批次</span>
                  <span className="m07-kv-v">{selected.batchId}</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">材料与规格</span>
                  <span className="m07-kv-v">
                    {selected.material} · {selected.spec}
                  </span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">进场量</span>
                  <span className="m07-kv-v">{selected.qty} t</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">检验时间</span>
                  <span className="m07-kv-v">{selected.inspectTime}</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">检验来源</span>
                  <span className="m07-kv-v">{currentYard.labName}</span>
                </div>
              </div>

              <div>
                <div style={{ fontSize: '12px', color: '#8cb2db', marginBottom: '4px' }}>检验项目</div>
                <div className="m07-test-chips">
                  {selected.items.map((it) => {
                    const cls = it.pass === true ? '' : it.pass === false ? 'fail' : 'pending';
                    return (
                      <span key={it.name} className={`m07-test-chip ${cls}`}>
                        <CheckCircle2 size={13} /> {it.name}
                      </span>
                    );
                  })}
                </div>
              </div>

              <div className="m07-btn-row-2">
                <button
                  type="button"
                  className="m07-btn-primary"
                  onClick={() => setLabModalOpen(true)}
                >
                  <FileText size={14} /> 查看检验报告
                </button>
                <button
                  type="button"
                  className="m07-btn-outline"
                  onClick={() => router.push('/quality/lab')}
                >
                  <ExternalLink size={14} /> 进入实验室
                </button>
              </div>
            </div>
          </GlassPanel>
        </div>

        {/* Right Column: Site Imagery + Batch Linked Records */}
        <div className="m07-stack">
          <GlassPanel
            title="现场影像"
            bodyClassName="m07-panel-body-flush"
            headerRight={<div className="m07-header-right">2 路来源</div>}
          >
            <div className="m07-scene-grid">
              <div className="m07-scene-card">
                <div className="m07-media-card-hdr">
                  <span>料场出入口录像</span>
                  <StatusBadge text="原视频系统" tone="info" />
                </div>
                <div
                  className="m07-scene-frame m07-media-frame"
                  onClick={() => setMediaModalType('gate')}
                >
                  <SvgGateCamera timeLabel={selected.videoTime} />
                  <span className="m07-hud-tl">{currentYard.camId}</span>
                  <span className="m07-hud-tr">
                    <Video size={13} /> 入口录像
                  </span>
                </div>
                <div className="m07-scene-cap">
                  <span>{currentYard.name} · 主入口</span>
                  <button
                    type="button"
                    className="m07-link-btn"
                    onClick={() => setMediaModalType('gate')}
                  >
                    查看录像 <Play size={11} />
                  </button>
                </div>
              </div>

              <div className="m07-scene-card">
                <div className="m07-media-card-hdr">
                  <span>无人机巡检成果</span>
                  <StatusBadge text="已回传" tone="ok" />
                </div>
                <div
                  className="m07-scene-frame m07-media-frame"
                  onClick={() => setMediaModalType('uav')}
                >
                  <SvgUavInspection timeLabel={selected.uavTime} />
                  <span className="m07-hud-tl">{currentYard.uavId}</span>
                  <span className="m07-hud-tr">
                    <Plane size={13} /> {currentYard.waypoint}
                  </span>
                </div>
                <div className="m07-scene-cap">
                  <span>{selected.uavFile}</span>
                  <button
                    type="button"
                    className="m07-link-btn"
                    onClick={() => setMediaModalType('uav')}
                  >
                    查看巡检成果 <ExternalLink size={12} />
                  </button>
                </div>
              </div>
            </div>

            <div className="m07-panel-footer">
              <span>
                工程位置 &nbsp;
                <strong style={{ color: '#e6f2ff' }}>
                  {currentYard.sectionName} · {currentYard.name}
                </strong>
              </span>
              <span>录像按进场时刻定位，巡检影像按料场关联</span>
            </div>
          </GlassPanel>

          <GlassPanel
            title="批次关联记录"
            className="m07-table-panel"
            bodyClassName="m07-panel-body-flush"
            headerRight={<div className="m07-header-right">{selected.batchId}</div>}
          >
            <div className="m07-table-wrap" style={{ paddingBottom: '10px' }}>
              <DataTable
                columns={linkedColumns}
                rows={linkedRows}
                rowKey={(r) => r.id}
                emptyText="暂无批次关联记录"
              />
            </div>
          </GlassPanel>
        </div>
      </div>

      {labModalOpen ? (
        <LabReportModal
          batch={selected}
          yard={currentYard}
          updating={updatingBatch}
          onClose={() => setLabModalOpen(false)}
          onEnterLab={() => router.push('/quality/lab')}
          onUpdateStatus={handleUpdateBatchStatus}
        />
      ) : null}

      {mediaModalType ? (
        <MediaPreviewModal
          type={mediaModalType}
          yard={currentYard}
          batch={selected}
          onClose={() => setMediaModalType(null)}
        />
      ) : null}

      {ledgerModalOpen ? (
        <EntryLedgerModal
          yard={currentYard}
          batches={batches}
          onClose={() => setLedgerModalOpen(false)}
        />
      ) : null}
    </div>
  );
}
