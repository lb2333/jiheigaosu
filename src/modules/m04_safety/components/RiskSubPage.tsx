'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Construction,
  Layers,
  Play,
  RefreshCw,
  Route,
  Search,
  Warehouse,
  Zap,
} from 'lucide-react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  IMG_PATHS,
  RISK_CATEGORIES,
  SECTION_META,
  getHazardStatusMeta,
  getRiskLevelTag,
  secName,
  type SafetyHazardDTO,
  type SafetyRiskPointDTO,
} from '../types';
import {
  RiskCameraModal,
  RiskInspectionModal,
  RiskMeasuresModal,
} from './SafetyModals';

interface RisksResponse {
  risks: SafetyRiskPointDTO[];
  allInScope: SafetyRiskPointDTO[];
  levelCounts: { 重大: number; 较大: number; 一般: number; 低风险: number };
  total: number;
  page: number;
  totalPages: number;
  pageItems: SafetyRiskPointDTO[];
  unclosedHazards: SafetyHazardDTO[];
  allHazards: SafetyHazardDTO[];
}

function riskSeverityColor(level: string): string {
  if (level === '重大') return '#fb7185';
  if (level === '较大') return '#facc15';
  if (level === '一般') return '#38bdf8';
  return '#4ade80';
}

function renderRiskIcon(cat: string) {
  if (cat === '高处作业' || cat === '临边防护') return <Construction size={16} />;
  if (cat === '起重吊装') return <Warehouse size={16} />;
  if (cat === '临时用电') return <Zap size={16} />;
  if (cat === '施工保通') return <Route size={16} />;
  return <Layers size={16} />;
}

export function RiskSubPage({
  activeSectionId,
  onSectionChange,
  onOpenHazard,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  onOpenHazard: (h: SafetyHazardDTO) => void;
  showToast: (msg: string) => void;
}) {
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);

  const [category, setCategory] = useState('all');
  const [level, setLevel] = useState('all');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedRiskId, setSelectedRiskId] = useState('R-02');
  const [layers, setLayers] = useState({ risk: true, hazard: false, video: false });
  const [data, setData] = useState<RisksResponse | null>(null);
  const [saving, setSaving] = useState(false);

  const [showMeasuresModal, setShowMeasuresModal] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [cameraRisk, setCameraRisk] = useState<SafetyRiskPointDTO | null>(null);

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: activeSectionId ?? '',
      category,
      level,
      q: query,
      page: String(page),
    });
    const res = await fetch(`/api/v1/m04/risks?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as RisksResponse;
      setData(json);
    }
  }, [activeSectionId, category, level, query, page]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const filteredRisks = useMemo(() => data?.risks ?? [], [data]);
  const allInScope = useMemo(() => data?.allInScope ?? [], [data]);
  const pageItems = useMemo(() => data?.pageItems ?? [], [data]);

  const activeSelectedId = useMemo(() => {
    if (filteredRisks.some((r) => r.id === selectedRiskId)) return selectedRiskId;
    return filteredRisks[0]?.id ?? allInScope[0]?.id ?? 'R-02';
  }, [filteredRisks, allInScope, selectedRiskId]);

  const selRisk = useMemo(() => {
    return (
      filteredRisks.find((r) => r.id === activeSelectedId) ??
      allInScope.find((r) => r.id === activeSelectedId) ??
      allInScope[0] ??
      null
    );
  }, [filteredRisks, allInScope, activeSelectedId]);

  // Sync Cesium layers + tracked 3D risk point entities + strict cleanup
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready || !engine.viewer) return;

    engine.applyLayers({
      satellite: false,
      uav: true,
      bim: false,
      pois: true,
      sections: true,
      route: true,
      designMode: false,
      activeSectionId,
    });

    engine.clearModuleEntities('safety');
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (Cesium && allInScope.length > 0) {
      for (const r of allInScope) {
        const isSel = r.id === activeSelectedId;
        const hex = riskSeverityColor(r.level);
        const ent = engine.trackModuleEntity('safety', {
          id: `safety_risk_${r.id}`,
          position: Cesium.Cartesian3.fromDegrees(r.lon, r.lat, 240),
          point: {
            pixelSize: isSel ? 16 : 11,
            color: Cesium.Color.fromCssColorString(hex),
            outlineColor: isSel ? Cesium.Color.fromCssColorString('#38f2ff') : Cesium.Color.WHITE,
            outlineWidth: isSel ? 3 : 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `${r.id} ${r.name}`,
            font: isSel ? '700 13px sans-serif' : '600 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString('#041026'),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -18),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        if (ent) {
          ent._secId = r.sectionId;
        }
      }
    }

    return () => {
      engine.clearModuleEntities('safety');
    };
  }, [cesiumReady, activeSectionId, allInScope, activeSelectedId]);

  // Fly Cesium when global activeSectionId changes on risk subpage
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready) return;
    if (activeSectionId) {
      engine.flyToSection(activeSectionId);
    } else {
      engine.flyToOverview(1.2);
    }
  }, [cesiumReady, activeSectionId]);

  function handleSelectRisk(risk: SafetyRiskPointDTO) {
    setSelectedRiskId(risk.id);
    const engine = getGlobalCesiumEngine();
    if (engine.ready) {
      engine.flyToSection(risk.sectionId);
    }
  }

  function handleFlyDirection(dir: 'start' | 'end') {
    const engine = getGlobalCesiumEngine();
    if (engine.ready) {
      engine.flyToDirection(dir);
    }
    showToast(dir === 'start' ? '已定位至明水方向起点（一工区）' : '已定位至北安方向终点（六工区）');
  }

  function handleReset() {
    setCategory('all');
    setLevel('all');
    setQuery('');
    setPage(1);
    setLayers({ risk: true, hazard: false, video: false });
    if (activeSectionId) onSectionChange(null);
    showToast('已重置风险点位筛选条件');
  }

  async function handleSaveMeasures(payload: { status: string; measures: string[] }) {
    if (!selRisk) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/v1/m04/risks/${encodeURIComponent(selRisk.id)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setShowMeasuresModal(false);
        showToast(`已更新风险点 ${selRisk.id} 的管控记录`);
        await loadData();
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '更新管控记录失败');
      }
    } finally {
      setSaving(false);
    }
  }

  const allHazards = data?.allHazards ?? [];
  const linkedHazard: SafetyHazardDTO | null = selRisk
    ? allHazards.find((h) => h.id === selRisk.linkedHazardId) ??
      allHazards.find((h) => h.sectionId === selRisk.sectionId) ??
      allHazards[0] ??
      null
    : null;
  const linkedMeta = linkedHazard ? getHazardStatusMeta(linkedHazard) : null;
  const selLevel = selRisk ? getRiskLevelTag(selRisk.level) : null;

  const mapRisks = filteredRisks.length > 0 ? filteredRisks : allInScope;
  const mapHazards = layers.hazard ? (data?.unclosedHazards ?? []).slice(0, 5) : [];
  const lvCounts = data?.levelCounts ?? { 重大: 0, 较大: 0, 一般: 0, 低风险: 0 };

  return (
    <div className="m04-page m04-risk-mode">
      {/* Top Filter Bar */}
      <div className="m04-filter-bar">
        <div className="m04-filter-group">
          <div className="m04-filter-item">
            <label>所属工区</label>
            <select
              className="m04-select"
              value={activeSectionId ?? 'all'}
              onChange={(e) => {
                setPage(1);
                onSectionChange(e.target.value === 'all' ? null : e.target.value);
              }}
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
            <label>风险类别</label>
            <select
              className="m04-select"
              value={category}
              onChange={(e) => {
                setPage(1);
                setCategory(e.target.value);
              }}
            >
              <option value="all">全部类别</option>
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="m04-filter-item">
            <label>风险等级</label>
            <select
              className="m04-select"
              value={level}
              onChange={(e) => {
                setPage(1);
                setLevel(e.target.value);
              }}
            >
              <option value="all">全部等级</option>
              <option value="重大">重大风险</option>
              <option value="较大">较大风险</option>
              <option value="一般">一般风险</option>
              <option value="低风险">低风险</option>
            </select>
          </div>
          <div className="m04-search-box">
            <Search size={14} />
            <input
              className="m04-input"
              type="text"
              value={query}
              placeholder="搜索风险点或工程部位"
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
            />
          </div>
        </div>
        <div className="m04-filter-actions">
          <button
            type="button"
            className="m04-btn-query"
            onClick={() => {
              void loadData();
              showToast('已按当前筛选条件刷新安全数据');
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="m04-btn-ghost" onClick={handleReset}>
            <RefreshCw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* 3-Column Body */}
      <div className="m04-cols-3">
        {/* Left: 在管风险点 + 风险等级分布 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: 0 }}>
          <div className="m04-panel" style={{ flex: 1 }}>
            <div className="m04-panel-head">
              <div className="m04-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">在管风险点</span>
              </div>
              <span className="m04-panel-sub">{data?.total ?? 0} 处</span>
            </div>
            <div className="m04-panel-body">
              <div className="m04-card-list">
                {pageItems.length > 0 ? (
                  pageItems.map((r) => {
                    const lv = getRiskLevelTag(r.level);
                    return (
                      <div
                        key={r.id}
                        className={`m04-list-card ${r.id === activeSelectedId ? 'active' : ''}`}
                        onClick={() => handleSelectRisk(r)}
                      >
                        <div className="m04-card-ico">{renderRiskIcon(r.category)}</div>
                        <div className="m04-card-main">
                          <div className="m04-card-title">
                            {r.id} &nbsp; {r.name}
                          </div>
                          <div className="m04-card-sub">
                            {secName(r.sectionId)} · {r.category}
                          </div>
                        </div>
                        <span className={`m04-tag ${lv.cls}`}>{lv.label}</span>
                      </div>
                    );
                  })
                ) : (
                  <div style={{ color: '#8ab4dc', textAlign: 'center', padding: '24px' }}>
                    无匹配风险点位
                  </div>
                )}
              </div>

              <div className="m04-pager">
                <span className="m04-pager-info">
                  显示 {pageItems.length} 处 / 共 {data?.total ?? 0} 处
                </span>
                <button
                  type="button"
                  className="m04-pg-btn"
                  disabled={(data?.page ?? 1) <= 1}
                  onClick={() => setPage((data?.page ?? 1) - 1)}
                >
                  &lt;
                </button>
                {Array.from({ length: data?.totalPages ?? 1 }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    className={`m04-pg-btn ${p === (data?.page ?? 1) ? 'active' : ''}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  className="m04-pg-btn"
                  disabled={(data?.page ?? 1) >= (data?.totalPages ?? 1)}
                  onClick={() => setPage((data?.page ?? 1) + 1)}
                >
                  &gt;
                </button>
              </div>
            </div>
          </div>

          <div className="m04-panel">
            <div className="m04-panel-head">
              <div className="m04-panel-head-left">
                <span className="panel-accent-bar" />
                <span className="panel-title">风险等级分布</span>
              </div>
            </div>
            <div className="m04-panel-body">
              <div className="m04-dist-grid">
                <div className="m04-dist-box">
                  <span>重大</span>
                  <strong className="m04-c-red">{lvCounts['重大']} 处</strong>
                </div>
                <div className="m04-dist-box">
                  <span>较大</span>
                  <strong className="m04-c-gold">{lvCounts['较大']} 处</strong>
                </div>
                <div className="m04-dist-box">
                  <span>一般</span>
                  <strong className="m04-c-blue">{lvCounts['一般']} 处</strong>
                </div>
                <div className="m04-dist-box">
                  <span>低风险</span>
                  <strong className="m04-c-green">{lvCounts['低风险']} 处</strong>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Center: 风险点位分布 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">风险点位分布</span>
            </div>
            <span className="m04-panel-sub">点位示意</span>
          </div>
          <div className="m04-panel-body">
            <div className="m04-map-toolbar">
              <div className="m04-chk-group">
                <label className="m04-chk">
                  <input
                    type="checkbox"
                    checked={layers.risk}
                    onChange={(e) => setLayers((prev) => ({ ...prev, risk: e.target.checked }))}
                  />
                  <span>风险点</span>
                </label>
                <label className="m04-chk">
                  <input
                    type="checkbox"
                    checked={layers.hazard}
                    onChange={(e) => setLayers((prev) => ({ ...prev, hazard: e.target.checked }))}
                  />
                  <span>隐患</span>
                </label>
                <label className="m04-chk">
                  <input
                    type="checkbox"
                    checked={layers.video}
                    onChange={(e) => setLayers((prev) => ({ ...prev, video: e.target.checked }))}
                  />
                  <span>视频</span>
                </label>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: '#cfe4ff' }}>
                <span>
                  <span style={{ color: '#facc15' }}>●</span> 风险点
                </span>
                <span>
                  <span style={{ color: '#38f2ff' }}>●</span> 当前选中
                </span>
              </div>
            </div>

            <div className="m04-map-frame">
              <img
                className="m04-map-bg"
                src={IMG_PATHS.corridor}
                alt="吉黑高速风险点位分布走廊"
              />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  pointerEvents: 'none',
                  zIndex: 2,
                }}
              >
                <defs>
                  <linearGradient id="m04-route-grad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0%" stopColor="#38f2ff" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.92" />
                  </linearGradient>
                </defs>
                <path
                  d="M 38 96 C 43 78, 49 62, 56 44 C 63 28, 74 16, 92 4"
                  fill="none"
                  stroke="rgba(56,242,255,0.28)"
                  strokeWidth="4.5"
                />
                <path
                  d="M 38 96 C 43 78, 49 62, 56 44 C 63 28, 74 16, 92 4"
                  fill="none"
                  stroke="url(#m04-route-grad)"
                  strokeWidth="0.9"
                  strokeDasharray="2.5 1.5"
                />
              </svg>

              {layers.risk &&
                mapRisks.map((r) => {
                  const isSel = r.id === activeSelectedId;
                  return (
                    <div
                      key={r.id}
                      className={`m04-map-pin ${isSel ? 'selected' : ''}`}
                      style={{ left: `${r.mapX}%`, top: `${r.mapY}%` }}
                      title={`${r.id} ${r.name} (${secName(r.sectionId)})`}
                      onClick={() => handleSelectRisk(r)}
                    >
                      <div className="m04-map-label">
                        <div>
                          {r.id}
                          <span className="m04-map-pin-name">{r.name}</span>
                        </div>
                        {isSel ? (
                          <div className="m04-map-sec-chip">{secName(r.sectionId)}</div>
                        ) : null}
                      </div>
                      <span className="m04-pin-dot" />
                    </div>
                  );
                })}

              {mapHazards.map((h, i) => {
                const r =
                  allInScope.find((rp) => rp.sectionId === h.sectionId) ??
                  allInScope[i % Math.max(1, allInScope.length)];
                if (!r) return null;
                return (
                  <div
                    key={h.id}
                    className="m04-pin-hazard"
                    style={{
                      left: `${Math.min(90, r.mapX + 7)}%`,
                      top: `${Math.min(90, r.mapY + 5)}%`,
                    }}
                    title={h.description}
                    onClick={() => onOpenHazard(h)}
                  >
                    ⚠ {h.id.slice(-6)}
                  </div>
                );
              })}

              {layers.video &&
                mapRisks.slice(0, 6).map((r) => (
                  <div
                    key={`cam_${r.id}`}
                    className="m04-pin-cam"
                    style={{
                      left: `${Math.max(10, r.mapX - 8)}%`,
                      top: `${Math.min(92, r.mapY + 4)}%`,
                    }}
                    onClick={() => setCameraRisk(r)}
                  >
                    📹 {r.camCode}
                  </div>
                ))}
            </div>

            <div className="m04-map-footer">
              <button
                type="button"
                className="m04-text-link"
                onClick={() => handleFlyDirection('start')}
              >
                &lt; 明水方向
              </button>
              <span>G1211 明水至北安段</span>
              <button
                type="button"
                className="m04-text-link"
                onClick={() => handleFlyDirection('end')}
              >
                北安方向 &gt;
              </button>
            </div>
          </div>
        </div>

        {/* Right: 风险点位档案 */}
        <div className="m04-panel">
          <div className="m04-panel-head">
            <div className="m04-panel-head-left">
              <span className="panel-accent-bar" />
              <span className="panel-title">风险点位档案</span>
            </div>
          </div>
          {selRisk ? (
            <div className="m04-panel-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '10px',
                }}
              >
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>
                  {selRisk.id} &nbsp; {selRisk.category}
                </strong>
                <span className="m04-tag m04-tag-amber">{selRisk.status}</span>
              </div>

              <div className="m04-kv-list">
                <div className="m04-kv-row">
                  <span>工程位置</span>
                  <strong>{selRisk.location}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>所属工区</span>
                  <strong>{secName(selRisk.sectionId)}</strong>
                </div>
                <div className="m04-kv-row">
                  <span>评估等级</span>
                  <strong className={selLevel?.textCls}>{selRisk.level}风险</strong>
                </div>
                <div className="m04-kv-row">
                  <span>责任单位</span>
                  <strong>{selRisk.unit}</strong>
                </div>
              </div>

              <div className="m04-measures-box">
                <div className="m04-measures-title">管控措施</div>
                <div className="m04-chip-row">
                  {selRisk.measures.map((m) => (
                    <span key={m} className="m04-chip">
                      {m}
                    </span>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '6px',
                }}
              >
                <span style={{ fontSize: '12.5px', fontWeight: 600, color: '#dbeafe' }}>现场视频</span>
                <button
                  type="button"
                  className="m04-text-link"
                  onClick={() => setShowInspectionModal(true)}
                >
                  查看巡检成果 &gt;
                </button>
              </div>

              <div className="m04-video-box" onClick={() => setCameraRisk(selRisk)}>
                <img
                  src={IMG_PATHS[selRisk.imgKey] || IMG_PATHS.corridor}
                  alt={selRisk.name}
                />
                <button className="media-center-play" type="button" title="播放现场监控">
                  <Play size={16} fill="currentColor" />
                </button>
                <span className="m04-video-tag">视频示意</span>
              </div>

              {linkedHazard && linkedMeta ? (
                <div className="m04-linked-box">
                  <div>
                    <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#ffffff' }}>
                      关联隐患 &nbsp; {linkedHazard.id}
                    </div>
                    <div style={{ fontSize: '11.5px', color: '#9ec0e6', marginTop: '2px' }}>
                      {linkedHazard.description}
                    </div>
                  </div>
                  <span className={`m04-tag ${linkedMeta.cls}`}>{linkedMeta.label}</span>
                </div>
              ) : null}

              <div className="m04-btn-pair">
                <button
                  type="button"
                  className="btn-primary-glow"
                  style={{ padding: '7px 10px', fontSize: '12.5px' }}
                  disabled={!linkedHazard}
                  onClick={() => {
                    if (linkedHazard) onOpenHazard(linkedHazard);
                  }}
                >
                  查看关联隐患
                </button>
                <button
                  type="button"
                  className="m04-btn-ghost"
                  style={{ height: 'auto', justifyContent: 'center', padding: '7px 10px' }}
                  onClick={() => setShowMeasuresModal(true)}
                >
                  维护管控记录
                </button>
              </div>

              <div className="m04-panel-foot">
                <span>同步于 2026-11-25 10:45</span>
              </div>
            </div>
          ) : (
            <div className="m04-panel-body" style={{ color: '#8ab4dc', justifyContent: 'center', alignItems: 'center' }}>
              正在加载风险点位档案...
            </div>
          )}
        </div>
      </div>

      {showMeasuresModal && selRisk ? (
        <RiskMeasuresModal
          risk={selRisk}
          submitting={saving}
          onSave={handleSaveMeasures}
          onClose={() => setShowMeasuresModal(false)}
        />
      ) : null}

      {showInspectionModal && selRisk ? (
        <RiskInspectionModal
          risk={selRisk}
          onClose={() => setShowInspectionModal(false)}
        />
      ) : null}

      {cameraRisk ? (
        <RiskCameraModal risk={cameraRisk} onClose={() => setCameraRisk(null)} />
      ) : null}
    </div>
  );
}
