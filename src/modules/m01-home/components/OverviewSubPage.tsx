'use client';

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  ChevronRight,
  Camera,
  Layers,
  ShieldCheck,
  MapPin,
  Box,
  Compass,
  Landmark,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  LEGACY_ICONS,
  MANAGEMENT_TAB_DEFS,
  STATIC_POI_OBJECTS,
} from '@/lib/modules/platform-data';
import { DATE_PRESETS } from '@/lib/modules/registry';
import {
  buildPoiDetailBlocks,
  buildPoiDocsBlocks,
  fmtTime,
  type ApiPoi,
  type ApiSection,
  type FocusGroup,
} from '../types';

export interface OverviewSubPageProps {
  activeSec: ApiSection | null;
  activePoi: ApiPoi;
  focusGroups: FocusGroup[];
  datePreset: (typeof DATE_PRESETS)[number];
}

export function OverviewSubPage({
  activeSec,
  activePoi,
  focusGroups,
  datePreset,
}: OverviewSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const selectedPoiId = usePlatformStore((s) => s.selectedPoiId);
  const poiDetailVisible = usePlatformStore((s) => s.poiDetailVisible);
  const setPoiDetailVisible = usePlatformStore((s) => s.setPoiDetailVisible);
  const p1Layers = usePlatformStore((s) => s.p1Layers);
  const toggleP1Layer = usePlatformStore((s) => s.toggleP1Layer);
  const openModal = usePlatformStore((s) => s.openModal);
  const showToast = usePlatformStore((s) => s.showToast);

  const [mgmtTab, setMgmtTab] = useState<'progress' | 'quality' | 'safety'>('progress');
  const [p1VideoPlaying, setP1VideoPlaying] = useState(true);
  const [p1VideoSec, setP1VideoSec] = useState(12);
  const [p1VideoMuted, setP1VideoMuted] = useState(false);

  // Sync Cesium layers & overlays for overview
  useEffect(() => {
    const ces = getGlobalCesiumEngine();
    if (!ces.ready) return;
    ces.setShowcaseBackdropMode(false);
    ces.applyLayers({ ...p1Layers, designMode: false, activeSectionId });
    ces.syncHtmlOverlays({
      showRoute: p1Layers.route,
      showSections: p1Layers.sections,
      showPois: p1Layers.pois,
      activeSectionId,
      activePoiId: selectedPoiId,
      poiObjects: STATIC_POI_OBJECTS,
      icons: LEGACY_ICONS,
      showViewpoint: false,
    });
  }, [activeSectionId, cesiumReady, p1Layers, selectedPoiId]);

  // Simulation timer for live monitoring scrubber
  useEffect(() => {
    if (!p1VideoPlaying || !poiDetailVisible) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      setP1VideoSec((s) => (s + 1) % 300);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [p1VideoPlaying, poiDetailVisible]);

  const deltaMap = {
    progress: datePreset.progressDelta,
    quality: datePreset.qualityDelta,
    safety: datePreset.safetyDelta,
  };
  const dateDelta = deltaMap[mgmtTab] ?? 0;
  const mgmtRows = MANAGEMENT_TAB_DEFS[mgmtTab].map((item, idx) => {
    const raw =
      activeSec
        ? (mgmtTab === 'progress'
            ? activeSec.progressMetrics[idx]
            : mgmtTab === 'quality'
              ? activeSec.qualityMetrics[idx]
              : activeSec.safetyMetrics[idx]) ?? item.pct
        : item.pct;
    return {
      ...item,
      pct: Math.max(0, Math.min(100, raw + dateDelta)),
    };
  });

  const layerItems: Array<{ key: keyof typeof p1Layers; label: string; icon: ReactNode }> = [
    { key: 'satellite', label: '高分遥感影像', icon: <Compass size={15} /> },
    { key: 'uav', label: '无人机倾斜摄影', icon: <Camera size={15} /> },
    { key: 'models', label: '三维模型', icon: <Landmark size={15} /> },
    { key: 'bim', label: 'BIM模型', icon: <Box size={15} /> },
    { key: 'pois', label: '工程点位', icon: <MapPin size={15} /> },
    { key: 'sections', label: '工区', icon: <Layers size={15} /> },
    { key: 'route', label: '路线', icon: <ShieldCheck size={15} /> },
  ];

  return (
    <section className="page-view active" id="page-overview">
      <div className="hud-left-col">
        <GlassPanel id="panelOverviewSummary" title="项目概况" collapsible>
          <div className="info-line">
            <span id="p1ProjectScope">
              {activeSec ? `明水—北安段 · ${activeSec.name} (${activeSec.stakeRange})` : '明水—北安段建设项目'}
            </span>
          </div>
          <div className="info-line">
            <span>施工期 · 全线 146.8 km</span>
          </div>
          <div className="kpi-triple">
            <div className="kpi-cell">
              <span className="kpi-label">工区</span>
              <div>
                <span className="kpi-value">{activeSec ? activeSec.sectionsCount : 6}</span>
                <span className="kpi-unit">个</span>
              </div>
            </div>
            <div className="kpi-cell">
              <span className="kpi-label">重点工程</span>
              <div>
                <span className="kpi-value">{activeSec ? activeSec.keyWorksCount : 12}</span>
                <span className="kpi-unit">处</span>
              </div>
            </div>
            <div className="kpi-cell">
              <span className="kpi-label">场站</span>
              <div>
                <span className="kpi-value">{activeSec ? activeSec.yardsCount : 8}</span>
                <span className="kpi-unit">处</span>
              </div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          id="panelMgmtOverview"
          title="管理概览"
          subtitle={dateDelta !== 0 ? datePreset.date : undefined}
          collapsible
        >
          <div className="seg-tabs" id="p1MgmtTabs">
            {(['progress', 'quality', 'safety'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`seg-tab ${mgmtTab === t ? 'active' : ''}`}
                onClick={() => setMgmtTab(t)}
              >
                {t === 'progress' ? '进度' : t === 'quality' ? '质量' : '安全'}
              </button>
            ))}
          </div>
          <div className="progress-list">
            {mgmtRows.map((item) => {
              const tier = item.pct >= 70 ? 'tier-high' : item.pct >= 40 ? 'tier-mid' : 'tier-low';
              return (
                <div key={item.key} className="progress-item">
                  <div className="progress-main">
                    <div className="progress-row-top">
                      <span className="progress-name">{item.name}</span>
                      <span className="progress-pct">{item.pct.toFixed(1)}%</span>
                    </div>
                    <div className="progress-track">
                      <div
                        className={`progress-fill ${tier}`}
                        style={{ width: `${Math.min(100, item.pct)}%` }}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </GlassPanel>
      </div>

      <div className="hud-right-col">
        <GlassPanel id="panelFocus" title="重点关注" collapsible>
          <div className="focus-list">
            {focusGroups.map((g) => (
              <div
                key={g.id}
                className="focus-row"
                onClick={() =>
                  openModal(`重点关注 · ${g.title}（${g.records.length}${g.unit}）`, [
                    {
                      type: 'dataTable',
                      headers: ['事项名称', '责任工区', '计划期限', '状态'],
                      rows: g.records.map((r) => ({
                        id: String(r.id),
                        cells: [
                          { text: r.title },
                          { text: r.sectionName },
                          { text: r.dueDate },
                          { badge: { text: r.status, tone: r.statusTone } },
                        ],
                      })),
                    },
                  ])
                }
              >
                <span className="focus-left">
                  <span>{g.title}</span>
                </span>
                <span className="focus-right">
                  {g.summaryPrefix}
                  <span className="focus-count">{g.records.length}</span>
                  {g.unit}
                  <ChevronRight size={13} />
                </span>
              </div>
            ))}
          </div>
        </GlassPanel>

        {poiDetailVisible ? (
          <GlassPanel
            id="panelPoiDetail"
            title="对象详情"
            subtitle={activePoi.name}
            headerRight={
              <button
                type="button"
                className="panel-toggle-btn"
                title="关闭详情卡片"
                onClick={() => {
                  setPoiDetailVisible(false);
                  showToast('已收起对象详情，点击地图任意工程点位可重新打开');
                }}
              >
                ×
              </button>
            }
          >
            <div className={`media-card ${p1VideoPlaying ? 'playing' : ''}`}>
              <img src={activePoi.imgPath} alt={activePoi.name} loading="lazy" decoding="async" />
              <div className="media-top-badges">
                <span className="live-pill">
                  <span className="live-dot" />
                  实时监控
                </span>
                <span className="cam-pill" title={activePoi.cameraName}>
                  {activePoi.cameraName}
                </span>
              </div>
              <div className="media-controls-bar">
                <button
                  type="button"
                  className="mini-ctrl-btn"
                  onClick={() => setP1VideoPlaying((p) => !p)}
                >
                  {p1VideoPlaying ? <Pause size={13} /> : <Play size={13} />}
                </button>
                <span className="mini-time">
                  {fmtTime(p1VideoSec)} / {activePoi.duration}
                </span>
                <input
                  className="mini-scrubber"
                  type="range"
                  min={0}
                  max={300}
                  value={p1VideoSec}
                  onChange={(e) => setP1VideoSec(Number(e.target.value))}
                />
                <button
                  type="button"
                  className="mini-ctrl-btn"
                  onClick={() => setP1VideoMuted((m) => !m)}
                >
                  {p1VideoMuted ? <VolumeX size={13} /> : <Volume2 size={13} />}
                </button>
                <button
                  type="button"
                  className="mini-ctrl-btn"
                  onClick={() =>
                    openModal(`高清视频监控 · ${activePoi.cameraName}`, [
                      {
                        type: 'media',
                        src: activePoi.imgPath,
                        alt: activePoi.name,
                        liveLabel: '实时高清码流 1080P',
                        camLabel: activePoi.stake,
                      },
                    ])
                  }
                >
                  <Maximize2 size={13} />
                </button>
              </div>
            </div>

            <div className="meta-table">
              <div className="meta-row">
                <span className="meta-key">工程名称</span>
                <span className="meta-val">{activePoi.name}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">工程类型</span>
                <span className="meta-val">{activePoi.type}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">所属工区</span>
                <span className="meta-val">{activePoi.sectionName}</span>
              </div>
              <div className="meta-row">
                <span className="meta-key">当前阶段</span>
                <span className="meta-val">{activePoi.stage}</span>
              </div>
            </div>

            <button
              type="button"
              className="btn-primary-glow"
              onClick={() => openModal(`工程详情 · ${activePoi.name}`, buildPoiDetailBlocks(activePoi))}
            >
              <FileText size={15} />
              <span>查看工程详情</span>
            </button>
            <button
              type="button"
              className="link-subtle"
              onClick={() => openModal(`关联资料清单 · ${activePoi.name}`, buildPoiDocsBlocks(activePoi))}
            >
              <span>查看关联资料</span>
              <ChevronRight size={13} />
            </button>
          </GlassPanel>
        ) : null}
      </div>

      <div className="bottom-dock">
        <div className="layer-bar" id="p1LayerBar">
          {layerItems.map((it) => (
            <div
              key={it.key}
              className={`layer-toggle-item ${p1Layers[it.key] ? 'is-on' : 'is-off'}`}
              onClick={() => {
                toggleP1Layer(it.key);
                showToast(`${it.label}：${!p1Layers[it.key] ? '已开启' : '已关闭'}`);
              }}
            >
              <span className="layer-toggle-label">
                {it.icon}
                {it.label}
              </span>
              <span className={`switch ${p1Layers[it.key] ? 'on' : ''}`} />
            </div>
          ))}
        </div>

        <div className="zoom-pill">
          <button type="button" className="zoom-btn" onClick={() => getGlobalCesiumEngine().zoomIn()}>
            +
          </button>
          <button type="button" className="zoom-btn" onClick={() => getGlobalCesiumEngine().zoomOut()}>
            −
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => {
              setActiveSectionId(null);
              getGlobalCesiumEngine().flyToOverview(1.2);
              showToast('已重置 Cesium 三维地图至全线俯瞰视角');
            }}
          >
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
