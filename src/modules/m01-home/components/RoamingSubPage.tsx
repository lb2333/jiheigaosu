'use client';

import { useEffect, useRef, useState } from 'react';
import {
  Play,
  Pause,
  Maximize2,
  FileText,
  ChevronRight,
  Camera,
  Video,
  Layers,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  LEGACY_ICONS,
  ROAMING_STATIONS,
  STATIC_POI_OBJECTS,
  type RoamingStationItem,
} from '@/lib/modules/platform-data';
import { type ApiPoi } from '../types';
import type { ModalBlock } from '@/lib/store/platform-store';

export interface RoamingSubPageProps {
  activePoi: ApiPoi;
}

function buildStationDetailBlocks(st: RoamingStationItem): ModalBlock[] {
  return [
    {
      type: 'stats',
      items: [
        { label: '工程类别', value: st.category },
        { label: '中心桩号', value: st.stake },
        { label: '所属工区', value: st.section },
      ],
    },
    {
      type: 'paragraph',
      text: `${st.desc} 当前建设阶段：${st.stage}。`,
    },
    {
      type: 'stats',
      items: [
        { label: '关联照片', value: `${st.photos} 张` },
        { label: '无人机巡航视频', value: `${st.videos} 条` },
        { label: '累计巡检记录', value: `${st.inspections} 条` },
      ],
    },
  ];
}

function buildStationDocsBlocks(st: RoamingStationItem): ModalBlock[] {
  return [
    {
      type: 'dataTable',
      headers: ['资料名称', '类型', '更新日期', '大小'],
      rows: [
        {
          id: `${st.id}-d1`,
          cells: [
            { text: `${st.name}（${st.stake}）三维设计模型与施工图会审纪要.pdf` },
            { badge: { text: '设计资料', tone: 'info' } },
            { text: '2026-10-20' },
            { text: '5.8 MB' },
          ],
        },
        {
          id: `${st.id}-d2`,
          cells: [
            { text: `${st.name} ${st.section}质量安全专项巡检台账.xlsx` },
            { badge: { text: '巡检台账', tone: 'ok' } },
            { text: '2026-11-24' },
            { text: '2.4 MB' },
          ],
        },
      ],
    },
  ];
}

export function RoamingSubPage({ activePoi: _activePoi }: RoamingSubPageProps) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const openModal = usePlatformStore((s) => s.openModal);
  const showToast = usePlatformStore((s) => s.showToast);

  const [roamingIndex, setRoamingIndex] = useState(0);
  const [roamingPlaying, setRoamingPlaying] = useState(true);
  const [roamingDwell, setRoamingDwell] = useState(true);
  const [roamingView, setRoamingView] = useState<'overhead' | 'along'>('overhead');
  const [roamingAutoMode, setRoamingAutoMode] = useState<'auto' | 'free'>('auto');
  const [roamingRenderMode, setRoamingRenderMode] = useState<'real' | 'design'>('real');
  const [roamingSpeed, setRoamingSpeed] = useState(1.0);
  const timelineRefs = useRef<Array<HTMLDivElement | null>>([]);

  // Keep active station visible in the scrollable timeline list
  useEffect(() => {
    const el = timelineRefs.current[roamingIndex];
    el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [roamingIndex]);

  // Sync Cesium layers, overlays & low-altitude camera flyTo for roaming station
  useEffect(() => {
    const ces = getGlobalCesiumEngine();
    if (!ces.ready) return;
    const st = ROAMING_STATIONS[roamingIndex];
    ces.setShowcaseBackdropMode(false);
    ces.applyLayers({
      satellite: false,
      uav: true,
      bim: roamingRenderMode === 'design',
      models: true,
      pois: true,
      sections: true,
      route: true,
      designMode: roamingRenderMode === 'design',
      activeSectionId,
    });
    ces.syncHtmlOverlays({
      showRoute: true,
      showSections: true,
      showPois: true,
      activeSectionId,
      activePoiId: st.poiId ?? st.id,
      poiObjects: STATIC_POI_OBJECTS,
      icons: LEGACY_ICONS,
      showViewpoint: true,
      roamingStationId: st.id,
    });
    ces.flyToRoamingStation(st.id, roamingView, roamingSpeed, roamingRenderMode);
  }, [activeSectionId, cesiumReady, roamingIndex, roamingRenderMode, roamingSpeed, roamingView]);

  // Simulation timer for auto-roaming stations
  useEffect(() => {
    if (!roamingPlaying || roamingAutoMode !== 'auto') return;
    let roamTick = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      roamTick += roamingSpeed;
      const interval = roamingDwell ? 6.5 : 3.5;
      if (roamTick >= interval) {
        roamTick = 0;
        setRoamingIndex((idx) => (idx + 1) % ROAMING_STATIONS.length);
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [roamingAutoMode, roamingDwell, roamingPlaying, roamingSpeed]);

  const st = ROAMING_STATIONS[roamingIndex];
  const pct = (roamingIndex / (ROAMING_STATIONS.length - 1)) * 100;

  return (
    <section className="page-view active" id="page-roaming">
      <div className="hud-left-col">
        <GlassPanel
          id="panelRoamingRoute"
          title="漫游线路"
          subtitle={`${ROAMING_STATIONS.length} 站`}
          collapsible
        >
          <button
            type="button"
            className="route-header-btn"
            onClick={() => {
              setRoamingAutoMode('auto');
              setRoamingPlaying(true);
              setRoamingIndex(0);
              showToast(`已启动全线漫游（共 ${ROAMING_STATIONS.length} 个沿线桥梁与互通站点）`);
            }}
          >
            全线漫游（明水 → 北安）
          </button>
          <div className="timeline-list timeline-list-scroll">
            {ROAMING_STATIONS.map((item, idx) => (
              <div
                key={item.id}
                ref={(el) => {
                  timelineRefs.current[idx] = el;
                }}
                className={`timeline-item ${idx === roamingIndex ? 'active' : idx < roamingIndex ? 'visited' : ''}`}
                onClick={() => {
                  setRoamingIndex(idx);
                  showToast(`当前漫游站点 (${idx + 1}/${ROAMING_STATIONS.length})：${item.name}（${item.stake}）`);
                }}
              >
                <span className="timeline-node" />
                <div className="timeline-main">
                  <span className="timeline-label">{item.name}</span>
                  <span className="timeline-meta">
                    <span className={`timeline-tag tag-${item.tag}`}>{item.tag}</span>
                    <span>{item.stake}</span>
                  </span>
                </div>
                {idx === roamingIndex ? <span className="current-badge">当前</span> : null}
              </div>
            ))}
          </div>
        </GlassPanel>

        <GlassPanel id="panelRoamingSettings" title="漫游设置" collapsible>
          <div className="setting-row">
            <span className="setting-label">到站停留</span>
            <span
              className={`switch ${roamingDwell ? 'on' : ''}`}
              onClick={() => {
                const next = !roamingDwell;
                setRoamingDwell(next);
                showToast(`到站停留：${next ? '已开启' : '已关闭'}`);
              }}
            />
          </div>
          <div className="setting-row">
            <span className="setting-label">视角</span>
            <div className="dual-seg">
              <button
                type="button"
                className={`dual-seg-btn ${roamingView === 'overhead' ? 'active' : ''}`}
                onClick={() => setRoamingView('overhead')}
              >
                俯瞰
              </button>
              <button
                type="button"
                className={`dual-seg-btn ${roamingView === 'along' ? 'active' : ''}`}
                onClick={() => setRoamingView('along')}
              >
                沿线
              </button>
            </div>
          </div>
          <div className="dual-seg" style={{ marginTop: 4 }}>
            <button
              type="button"
              className={`dual-seg-btn ${roamingAutoMode === 'auto' ? 'active' : ''}`}
              onClick={() => {
                setRoamingAutoMode('auto');
                setRoamingPlaying(true);
              }}
            >
              自动漫游
            </button>
            <button
              type="button"
              className={`dual-seg-btn ${roamingAutoMode === 'free' ? 'active' : ''}`}
              onClick={() => {
                setRoamingAutoMode('free');
                setRoamingPlaying(false);
              }}
            >
              自由漫游
            </button>
          </div>
        </GlassPanel>
      </div>

      <div className="hud-right-col">
        <GlassPanel id="panelCurrentStation" title="当前站点" subtitle={st.stake} collapsible>
          <div className="flex items-center justify-between gap-2 mb-2">
            <div style={{ fontSize: 16.5, fontWeight: 800 }}>{st.name}</div>
            <span className={`timeline-tag tag-${st.tag}`}>{st.category}</span>
          </div>
          <div
            className="media-card"
            style={{ cursor: 'pointer' }}
            onClick={() =>
              openModal(`站点现场影像 · ${st.name}`, [
                {
                  type: 'media',
                  src: st.imgPath,
                  alt: st.name,
                  liveLabel: '无人机巡航视频回放',
                  camLabel: `${st.section} · ${st.stake} · ${st.duration}`,
                  caption: st.desc,
                },
              ])
            }
          >
            <img src={st.imgPath} alt={st.name} loading="lazy" decoding="async" />
            <div className="media-top-badges">
              <span className="live-pill">
                <span className="live-dot" />
                现场影像
              </span>
              <span className="cam-pill" title={`${st.section} · ${st.stake}`}>
                {st.section} · {st.stake}
              </span>
            </div>
            <button type="button" className="media-center-play">
              <Play size={16} fill="currentColor" />
            </button>
            <span className="duration-chip">{st.duration}</span>
          </div>

          <div className="meta-table">
            <div className="meta-row">
              <span className="meta-key">所属工区</span>
              <span className="meta-val">{st.section}</span>
            </div>
            <div className="meta-row">
              <span className="meta-key">建设阶段</span>
              <span className="meta-val">{st.stage}</span>
            </div>
          </div>

          <div className="kpi-triple" style={{ marginBottom: 10 }}>
            <div className="kpi-cell">
              <Camera size={15} />
              <span className="kpi-label">关联照片</span>
              <div>
                <span className="kpi-value">{st.photos}</span>
                <span className="kpi-unit">张</span>
              </div>
            </div>
            <div className="kpi-cell">
              <Video size={15} />
              <span className="kpi-label">关联视频</span>
              <div>
                <span className="kpi-value">{st.videos}</span>
                <span className="kpi-unit">条</span>
              </div>
            </div>
            <div className="kpi-cell">
              <FileText size={15} />
              <span className="kpi-label">巡检记录</span>
              <div>
                <span className="kpi-value">{st.inspections}</span>
                <span className="kpi-unit">条</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            className="btn-primary-glow"
            onClick={() => openModal(`站点详情 · ${st.name}`, buildStationDetailBlocks(st))}
          >
            <FileText size={15} />
            <span>查看站点详情</span>
          </button>
          <button
            type="button"
            className="link-subtle"
            onClick={() => openModal(`关联资料清单 · ${st.name}`, buildStationDocsBlocks(st))}
          >
            <span>查看关联资料</span>
            <ChevronRight size={13} />
          </button>
        </GlassPanel>
      </div>

      <div className="bottom-dock">
        <div className="roaming-dock">
          <div className="roaming-dock-top">
            <div className="dual-seg">
              <button
                type="button"
                className={`dual-seg-btn ${roamingRenderMode === 'real' ? 'active' : ''}`}
                onClick={() => setRoamingRenderMode('real')}
              >
                实景漫游
              </button>
              <button
                type="button"
                className={`dual-seg-btn ${roamingRenderMode === 'design' ? 'active' : ''}`}
                onClick={() => setRoamingRenderMode('design')}
              >
                设计模型预览
              </button>
            </div>
            <div className="roaming-transport">
              <button
                type="button"
                className="dock-btn"
                onClick={() =>
                  setRoamingIndex((i) => (i - 1 + ROAMING_STATIONS.length) % ROAMING_STATIONS.length)
                }
              >
                ⏮ 上一站
              </button>
              <button
                type="button"
                className="dock-btn primary"
                onClick={() => setRoamingPlaying((p) => !p)}
              >
                {roamingPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{roamingPlaying ? '暂停' : '播放'}</span>
              </button>
              <button
                type="button"
                className="dock-btn"
                onClick={() => setRoamingIndex((i) => (i + 1) % ROAMING_STATIONS.length)}
              >
                下一站 ⏭
              </button>
              <select
                className="speed-select"
                value={String(roamingSpeed)}
                onChange={(e) => setRoamingSpeed(Number(e.target.value))}
              >
                <option value="0.5">0.5 ×</option>
                <option value="1">1.0 ×</option>
                <option value="1.5">1.5 ×</option>
                <option value="2">2.0 ×</option>
              </select>
              <button
                type="button"
                className="dock-btn"
                onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
              >
                <Maximize2 size={14} />
                <span>全屏</span>
              </button>
            </div>
          </div>
          <div className="roaming-dock-bottom">
            <div className="roaming-counter">
              <div>
                当前站点 <strong>{roamingIndex + 1} / {ROAMING_STATIONS.length}</strong>
              </div>
              <small>{st.name} · {st.stake}</small>
            </div>
            <div className="station-track-wrap">
              <div className="station-track station-track-dense">
                <div className="station-track-line">
                  <div className="station-track-fill" style={{ width: `${pct}%` }} />
                </div>
                {ROAMING_STATIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    title={`${i + 1}. ${s.name}（${s.category} · ${s.stake}）`}
                    className={`station-step ${i === roamingIndex ? 'active' : i < roamingIndex ? 'passed' : ''}`}
                    onClick={() => setRoamingIndex(i)}
                  >
                    <span className="station-step-dot" />
                    <span className="station-step-tip">{s.shortName}</span>
                  </button>
                ))}
              </div>
              <div className="station-track-ends">
                <span>起点 · {ROAMING_STATIONS[0].shortName}</span>
                <span className="station-track-current">{st.name}（{st.category}）</span>
                <span>终点 · {ROAMING_STATIONS[ROAMING_STATIONS.length - 1].shortName}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="zoom-pill grid-2x2">
          <button
            type="button"
            className="zoom-btn"
            title="切换实景/设计模型"
            onClick={() => setRoamingRenderMode((m) => (m === 'real' ? 'design' : 'real'))}
          >
            <Layers size={16} />
          </button>
          <button type="button" className="zoom-btn" onClick={() => getGlobalCesiumEngine().zoomIn()}>
            +
          </button>
          <button type="button" className="zoom-btn" onClick={() => getGlobalCesiumEngine().zoomOut()}>
            −
          </button>
          <button type="button" className="zoom-btn" onClick={() => getGlobalCesiumEngine().flyToOverview(1.2)}>
            <Maximize2 size={14} />
          </button>
        </div>
      </div>
    </section>
  );
}
