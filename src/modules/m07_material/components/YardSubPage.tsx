'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  ExternalLink,
  FileText,
  Layers,
  MapPin,
  RotateCcw,
  Search,
  Truck,
  Video,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { SvgGateCamera, SvgYardAerial } from '../MaterialSvgs';
import { MediaPreviewModal } from '../MaterialModals';
import {
  DEFAULT_YARDS,
  MATERIAL_PERIODS,
  MATERIAL_TYPES,
  YARD_BY_SECTION_ID,
  fmtNum,
  statusTone,
  type MaterialBatchDTO,
  type MaterialInventoryDTO,
  type MaterialYardDTO,
} from '../types';

interface YardResponse {
  period: string;
  cutoff: string;
  yard: MaterialYardDTO;
  yards: MaterialYardDTO[];
  activeVersion: string;
  kpis: {
    planQty: number;
    arrivalQty: number;
    physicalQty: number;
    usableQty: number;
    gapQty: number;
    categoryCount: number;
  };
  topGapItem: MaterialInventoryDTO | null;
  items: MaterialInventoryDTO[];
}

const DEFAULT_SEC2_YARD = YARD_BY_SECTION_ID['sec2'];

const INITIAL_YARD_DATA: YardResponse = {
  period: '2026年11月',
  cutoff: '2026-11-26 10:40',
  yard: DEFAULT_SEC2_YARD,
  yards: DEFAULT_YARDS,
  activeVersion: 'V1.2',
  kpis: {
    planQty: 24500,
    arrivalQty: 18250,
    physicalQty: 6220,
    usableQty: 5750,
    gapQty: 6250,
    categoryCount: 5,
  },
  topGapItem: {
    id: '2026年11月_inv-sec2-ss',
    baseId: 'inv-sec2-ss',
    period: '2026年11月',
    sectionId: 'sec2',
    sectionName: '二工区',
    yardId: 'yd-2',
    yardName: '料场示例A',
    material: '碎石',
    spec: '5–20 mm',
    planQty: 12000,
    arrivalQty: 8750,
    physicalQty: 3020,
    quarantineQty: 260,
    usableQty: 2760,
    gapQty: 3250,
    status: '部分待检',
    batchCounts: { pass: 5, pending: 2, recheck: 0, fail: 0 },
    sortOrder: 1,
  },
  items: [
    {
      id: '2026年11月_inv-sec2-ss',
      baseId: 'inv-sec2-ss',
      period: '2026年11月',
      sectionId: 'sec2',
      sectionName: '二工区',
      yardId: 'yd-2',
      yardName: '料场示例A',
      material: '碎石',
      spec: '5–20 mm',
      planQty: 12000,
      arrivalQty: 8750,
      physicalQty: 3020,
      quarantineQty: 260,
      usableQty: 2760,
      gapQty: 3250,
      status: '部分待检',
      batchCounts: { pass: 5, pending: 2, recheck: 0, fail: 0 },
      sortOrder: 1,
    },
  ],
};

export function YardSubPage({
  activeSectionId,
  period,
  initialMaterial,
  onSectionChange,
  onPeriodChange,
  onNavigateInspect,
  showToast,
}: {
  activeSectionId: string | null;
  period: string;
  initialMaterial?: string;
  onSectionChange: (secId: string | null) => void;
  onPeriodChange: (period: string) => void;
  onNavigateInspect: (opts?: { sectionId?: string; material?: string }) => void;
  showToast: (msg: string) => void;
}) {
  const effectiveSecId = activeSectionId ?? 'sec2';
  const [category, setCategory] = useState<string>('');
  const [selectedMaterial, setSelectedMaterial] = useState<string>(initialMaterial ?? '');
  const [data, setData] = useState<YardResponse>(INITIAL_YARD_DATA);
  const [mediaType, setMediaType] = useState<'aerial' | 'gate' | null>(null);
  const [firstBatch, setFirstBatch] = useState<MaterialBatchDTO | null>(null);
  const matTableRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (initialMaterial) {
      setSelectedMaterial(initialMaterial);
    }
  }, [initialMaterial]);

  const fetchYard = useCallback(async () => {
    const params = new URLSearchParams();
    params.set('sectionId', effectiveSecId);
    if (category) params.set('category', category);
    params.set('period', period);

    try {
      const res = await fetch(`/api/v1/m07/yard?${params.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as YardResponse;
      setData(json);
    } catch {
      // Keep existing state on error
    }
  }, [effectiveSecId, category, period]);

  useEffect(() => {
    void fetchYard();
  }, [fetchYard]);

  async function openMedia(type: 'aerial' | 'gate') {
    setMediaType(type);
    try {
      const res = await fetch(`/api/v1/m07/batches?sectionId=${encodeURIComponent(effectiveSecId)}`, {
        cache: 'no-store',
      });
      if (res.ok) {
        const json = (await res.json()) as { batches?: MaterialBatchDTO[] };
        setFirstBatch(json.batches?.[0] ?? null);
      }
    } catch {
      // ignore
    }
  }

  const yards = data.yards.length > 0 ? data.yards : DEFAULT_YARDS;
  const yard = data.yard ?? YARD_BY_SECTION_ID[effectiveSecId] ?? DEFAULT_SEC2_YARD;

  const kpiCards = [
    { label: '计划量', val: fmtNum(data.kpis.planQty), unit: 't', cls: '', icon: <ClipboardList size={18} /> },
    { label: '累计进场量', val: fmtNum(data.kpis.arrivalQty), unit: 't', cls: '', icon: <Truck size={18} /> },
    { label: '实物库存', val: fmtNum(data.kpis.physicalQty), unit: 't', cls: '', icon: <Layers size={18} /> },
    { label: '可用库存', val: fmtNum(data.kpis.usableQty), unit: 't', cls: 'green', icon: <CheckCircle2 size={18} /> },
    { label: '备料缺口', val: fmtNum(data.kpis.gapQty), unit: 't', cls: 'gold', icon: <AlertTriangle size={18} /> },
    { label: '材料类别', val: String(data.kpis.categoryCount), unit: '类', cls: '', icon: <FileText size={18} /> },
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
              value={yard.sectionId}
              onChange={(e) => {
                setSelectedMaterial('');
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
              value={yard.sectionId}
              onChange={(e) => {
                setSelectedMaterial('');
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
              value={category}
              onChange={(e) => setCategory(e.target.value)}
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
            <span className="m07-field-label">统计周期</span>
            <select
              className="glass-select m07-select"
              value={period}
              onChange={(e) => onPeriodChange(e.target.value)}
            >
              {MATERIAL_PERIODS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.id}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m07-filter-actions">
          <button
            type="button"
            className="m07-btn-primary"
            onClick={() => {
              void fetchYard();
              showToast('已更新当前料场库存明细');
            }}
          >
            <Search size={14} /> 查询
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() => {
              setCategory('');
              setSelectedMaterial('');
              onPeriodChange('2026年11月');
              onSectionChange(null);
              showToast('已重置料场筛选条件');
            }}
          >
            <RotateCcw size={14} /> 重置
          </button>
          <button
            type="button"
            className="m07-btn-outline"
            onClick={() =>
              onNavigateInspect({
                sectionId: yard.sectionId,
                material: category || undefined,
              })
            }
          >
            <ExternalLink size={14} /> 检验与现场关联
          </button>
        </div>
      </div>

      {/* Yard KPI Summary */}
      <GlassPanel title="料场库存概况" subtitle={`(${period})`} bodyClassName="m07-panel-body-flush">
        <div className="m07-kpi-grid-6">
          {kpiCards.map((k) => (
            <div key={k.label} className="m07-kpi-card">
              <div className={`m07-kpi-icon ${k.cls}`}>{k.icon}</div>
              <div>
                <div className="m07-kpi-label">{k.label}</div>
                <div className={`m07-kpi-val ${k.cls}`}>
                  {k.val}
                  <span className="m07-kpi-unit">{k.unit}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </GlassPanel>

      {/* Middle Split: Spatial & Gate Scenes + Yard Info */}
      <div className="m07-p3-mid">
        <GlassPanel
          title="料场位置与出入口"
          bodyClassName="m07-panel-body-flush"
          headerRight={
            <button
              type="button"
              className="m07-link-btn"
              onClick={() =>
                onNavigateInspect({
                  sectionId: yard.sectionId,
                  material: category || undefined,
                })
              }
            >
              查看现场关联 <ChevronRight size={12} />
            </button>
          }
        >
          <div className="m07-scene-grid">
            <div className="m07-scene-card">
              <div className="m07-scene-frame" onClick={() => void openMedia('aerial')}>
                <SvgYardAerial yard={yard} />
                <span className="m07-hud-tl">
                  <MapPin size={12} /> {yard.name}
                </span>
                <span className="m07-hud-tr">位置示意</span>
              </div>
              <div className="m07-scene-cap">
                <span>
                  {yard.sectionName} · {yard.stake}
                </span>
              </div>
            </div>

            <div className="m07-scene-card">
              <div className="m07-scene-frame" onClick={() => void openMedia('gate')}>
                <SvgGateCamera />
                <span className="m07-hud-tl">{yard.camId}</span>
                <span className="m07-hud-tr">
                  <Video size={13} /> 主入口
                </span>
              </div>
              <div className="m07-scene-cap">
                <span>主入口 {yard.gateStake}</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="料场信息"
          className="m07-table-panel"
          bodyClassName="m07-panel-body-flush"
        >
          <div className="m07-yard-info-body">
            <div>
              <div className="m07-file-hdr" style={{ marginBottom: '12px' }}>
                <span style={{ fontSize: '15px', fontWeight: 800, color: '#ffffff' }}>
                  {yard.name}
                </span>
                <StatusBadge text="报表已确认" tone="ok" />
              </div>
              <div className="m07-kv-list">
                <div className="m07-kv-row">
                  <span className="m07-kv-k">服务工区</span>
                  <span className="m07-kv-v">{yard.sectionName}</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">料场位置</span>
                  <span className="m07-kv-v">{yard.stake}</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">材料类别</span>
                  <span className="m07-kv-v">碎石、机制砂、水泥、矿粉、钢筋</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">统计截至</span>
                  <span className="m07-kv-v">{data.cutoff}</span>
                </div>
                <div className="m07-kv-row">
                  <span className="m07-kv-k">数据版本</span>
                  <span className="m07-kv-v">
                    {yard.reportCode} · {data.activeVersion || yard.activeVer}
                  </span>
                </div>
              </div>
            </div>

            {data.topGapItem ? (
              <div className="m07-yard-gap-box">
                <span>
                  {data.topGapItem.material}备料缺口 &nbsp;
                  <strong className="m07-num-gold">{fmtNum(data.topGapItem.gapQty)} t</strong>
                </span>
                <button
                  type="button"
                  className="m07-link-btn"
                  onClick={() =>
                    matTableRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
                  }
                >
                  查看材料分项 <ChevronRight size={12} />
                </button>
              </div>
            ) : null}
          </div>
        </GlassPanel>
      </div>

      {/* Material Breakdown Table */}
      <div ref={matTableRef}>
        <GlassPanel
          title="材料分项与库存"
          className="m07-table-panel"
          bodyClassName="m07-panel-body-flush"
          headerRight={<div className="m07-header-right">单位 t</div>}
        >
          <div className="m07-table-wrap">
            <table className="data-table m07-table">
              <thead>
                <tr>
                  <th>材料类别</th>
                  <th>规格</th>
                  <th>计划量</th>
                  <th>累计进场量</th>
                  <th>实物库存</th>
                  <th>待检及隔离量</th>
                  <th>可用库存</th>
                  <th>备料缺口</th>
                  <th>检验状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r, idx) => {
                  const isSel = selectedMaterial
                    ? selectedMaterial === r.material
                    : idx === 0;
                  return (
                    <tr
                      key={r.id}
                      className={isSel ? 'selected' : ''}
                      onClick={() => setSelectedMaterial(r.material)}
                    >
                      <td>{r.material}</td>
                      <td>{r.spec}</td>
                      <td>{fmtNum(r.planQty)}</td>
                      <td>{fmtNum(r.arrivalQty)}</td>
                      <td>{fmtNum(r.physicalQty)}</td>
                      <td>{fmtNum(r.quarantineQty)}</td>
                      <td className="m07-num-green">{fmtNum(r.usableQty)}</td>
                      <td className="m07-num-gold">{fmtNum(r.gapQty)}</td>
                      <td>
                        <StatusBadge text={r.status} tone={statusTone(r.status)} />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m07-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onNavigateInspect({
                              sectionId: yard.sectionId,
                              material: r.material,
                            });
                          }}
                        >
                          查看批次
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="m07-panel-footer">
            <span>可用库存 = 实物库存 - 待检及隔离量</span>
            <span>备料缺口 = 计划量 - 累计进场量</span>
            <span>统计截至 {data.cutoff}</span>
          </div>
        </GlassPanel>
      </div>

      {mediaType ? (
        <MediaPreviewModal
          type={mediaType}
          yard={yard}
          batch={firstBatch}
          onClose={() => setMediaType(null)}
        />
      ) : null}
    </div>
  );
}
