'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  FileText,
  ChevronRight,
  Camera,
  Video,
  Layers,
  ShieldCheck,
  MapPin,
  Box,
  Compass,
  Calendar,
  Landmark,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SplitImageCompare } from '@/components/ui/SplitImageCompare';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  LEGACY_ICONS,
  MANAGEMENT_TAB_DEFS,
  ROAMING_STATIONS,
  STATIC_POI_OBJECTS,
  STATIC_WORK_SECTIONS,
} from '@/lib/modules/legacy-data';
import { DATE_PRESETS } from '@/lib/modules/registry';

interface ApiSection {
  id: string;
  name: string;
  stakeRange: string;
  sectionsCount: number;
  keyWorksCount: number;
  yardsCount: number;
  progressMetrics: number[];
  qualityMetrics: number[];
  safetyMetrics: number[];
}

interface ApiPoi {
  id: string;
  name: string;
  type: string;
  sectionId: string;
  sectionName: string;
  stage: string;
  stake: string;
  cameraName: string;
  icon: string;
  imgPath: string;
  duration: string;
  elapsedSec: number;
  photosCount: number;
  videosCount: number;
  inspectionsCount: number;
  metrics: { length: string; progress: string; beamsDone: string; supervisor: string };
  docs: Array<{ name: string; type: string; date: string; size: string }>;
}

interface ApiFocusRow {
  id: number;
  category: string;
  categoryTitle: string;
  summaryPrefix: string;
  unit: string;
  icon: string;
  title: string;
  sectionName: string;
  dueDate: string;
  status: string;
  statusTone: string;
}

interface ApiMilestone {
  id: string;
  milestoneDate: string;
  title: string;
  description: string;
  imgMode: string;
  cssFilter: string;
  photosCount: number;
  videosCount: number;
  logsCount: number;
}

interface ApiTopic {
  id: string;
  title: string;
  subtitle: string;
  videoTitle: string;
  durationSec: number;
  durationStr: string;
  icon: string;
  imgPath: string;
  kpis: Array<{ label: string; val: string }>;
  chapters: string[];
  summaries: Array<{ title: string; desc: string }>;
}

function fmtTime(sec: number) {
  const s = Math.max(0, Math.floor(sec));
  const m = String(Math.floor(s / 60)).padStart(2, '0');
  const r = String(s % 60).padStart(2, '0');
  return `${m}:${r}`;
}

export function HomeModule({ subPageId }: { subPageId: string }) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const selectedPoiId = usePlatformStore((s) => s.selectedPoiId);
  const poiDetailVisible = usePlatformStore((s) => s.poiDetailVisible);
  const setPoiDetailVisible = usePlatformStore((s) => s.setPoiDetailVisible);
  const p1Layers = usePlatformStore((s) => s.p1Layers);
  const toggleP1Layer = usePlatformStore((s) => s.toggleP1Layer);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const openModalHtml = usePlatformStore((s) => s.openModalHtml);
  const showToast = usePlatformStore((s) => s.showToast);

  // Live DB data
  const [sections, setSections] = useState<ApiSection[]>([]);
  const [pois, setPois] = useState<ApiPoi[]>([]);
  const [focusRows, setFocusRows] = useState<ApiFocusRow[]>([]);
  const [milestones, setMilestones] = useState<ApiMilestone[]>([]);
  const [topics, setTopics] = useState<ApiTopic[]>([]);

  // Page 1 state
  const [mgmtTab, setMgmtTab] = useState<'progress' | 'quality' | 'safety'>('progress');
  const [p1VideoPlaying, setP1VideoPlaying] = useState(true);
  const [p1VideoSec, setP1VideoSec] = useState(12);
  const [p1VideoMuted, setP1VideoMuted] = useState(false);

  // Page 2 state (roaming)
  const [roamingIndex, setRoamingIndex] = useState(1);
  const [roamingPlaying, setRoamingPlaying] = useState(true);
  const [roamingDwell, setRoamingDwell] = useState(true);
  const [roamingView, setRoamingView] = useState<'overhead' | 'along'>('overhead');
  const [roamingAutoMode, setRoamingAutoMode] = useState<'auto' | 'free'>('auto');
  const [roamingRenderMode, setRoamingRenderMode] = useState<'real' | 'design'>('real');
  const [roamingSpeed, setRoamingSpeed] = useState(1.0);

  // Page 3 state (milestone)
  const [msSection, setMsSection] = useState('二工区');
  const [msObject, setMsObject] = useState('桥梁示例A');
  const [msLeftDate, setMsLeftDate] = useState('2026-09-25');
  const [msRightDate, setMsRightDate] = useState('2026-11-20');
  const [msActiveNodeId, setMsActiveNodeId] = useState('m4');
  const [msSplitPct, setMsSplitPct] = useState(50);
  const [msZoom, setMsZoom] = useState(1);
  const [msFilters, setMsFilters] = useState({ photo: true, uav: true, progress: true });

  // Page 4 state (showcase)
  const [scTopicIndex, setScTopicIndex] = useState(0);
  const [scPlaying, setScPlaying] = useState(false);
  const [scAutoCarousel, setScAutoCarousel] = useState(false);
  const [scHallMode, setScHallMode] = useState(false);
  const [scMinimized, setScMinimized] = useState(false);
  const [scClosed, setScClosed] = useState(false);
  const [scCurrentSec, setScCurrentSec] = useState(0);
  const [scVolume, setScVolume] = useState(78);
  const [scMuted, setScMuted] = useState(false);
  const [scSpeed, setScSpeed] = useState(1.0);

  // Fetch PostgreSQL home overview data
  useEffect(() => {
    let cancelled = false;
    fetch(`/api/home/overview?date=${encodeURIComponent(selectedDate)}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data || cancelled) return;
        setSections(data.workSections ?? []);
        setPois(data.poiObjects ?? []);
        setFocusRows(data.focusItems ?? []);
        setMilestones(data.milestoneNodes ?? []);
        setTopics(data.showcaseTopics ?? []);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [selectedDate]);

  // Sync Cesium mode & layers
  useEffect(() => {
    const mode = subPageId === 'milestone' ? 'opaque' : 'interactive';
    setCesiumMode(mode);
    const ces = getGlobalCesiumEngine();
    if (!ces.ready) return;

    if (subPageId === 'overview') {
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
    } else if (subPageId === 'roaming') {
      const st = ROAMING_STATIONS[roamingIndex];
      ces.setShowcaseBackdropMode(false);
      ces.applyLayers({
        satellite: false,
        uav: true,
        bim: roamingRenderMode === 'design',
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
        activePoiId: st.id,
        poiObjects: STATIC_POI_OBJECTS,
        icons: LEGACY_ICONS,
        showViewpoint: true,
        roamingStationId: st.id,
      });
      ces.flyToRoamingStation(st.id, roamingView, roamingSpeed);
    } else if (subPageId === 'showcase') {
      ces.applyLayers({
        satellite: false,
        uav: true,
        bim: true,
        pois: true,
        sections: true,
        route: true,
        designMode: false,
        activeSectionId: null,
      });
      ces.syncHtmlOverlays({
        showRoute: true,
        showSections: false,
        showPois: false,
        icons: LEGACY_ICONS,
      });
      ces.setShowcaseBackdropMode(true);
    } else {
      ces.setShowcaseBackdropMode(false);
    }
  }, [
    activeSectionId,
    cesiumReady,
    p1Layers,
    roamingIndex,
    roamingRenderMode,
    roamingSpeed,
    roamingView,
    selectedPoiId,
    setCesiumMode,
    subPageId,
  ]);

  // Simulation timers
  useEffect(() => {
    let roamTick = 0;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      if (subPageId === 'overview' && p1VideoPlaying && poiDetailVisible) {
        setP1VideoSec((s) => (s + 1) % 300);
      }
      if (subPageId === 'roaming' && roamingPlaying && roamingAutoMode === 'auto') {
        roamTick += roamingSpeed;
        const interval = roamingDwell ? 6.5 : 3.5;
        if (roamTick >= interval) {
          roamTick = 0;
          setRoamingIndex((idx) => (idx + 1) % ROAMING_STATIONS.length);
        }
      }
      if (subPageId === 'showcase' && scPlaying && !scClosed && topics.length) {
        const currentTopic = topics[scTopicIndex] ?? topics[0];
        setScCurrentSec((sec) => {
          const next = sec + scSpeed;
          if (next >= currentTopic.durationSec) {
            if (scAutoCarousel) {
              setScTopicIndex((i) => (i + 1) % topics.length);
            }
            return 0;
          }
          return next;
        });
      }
    }, 1000);
    return () => window.clearInterval(timer);
  }, [
    p1VideoPlaying,
    poiDetailVisible,
    roamingAutoMode,
    roamingDwell,
    roamingPlaying,
    roamingSpeed,
    scAutoCarousel,
    scClosed,
    scPlaying,
    scSpeed,
    scTopicIndex,
    subPageId,
    topics,
  ]);

  const activeSec = useMemo(() => {
    const dbSec = sections.find((s) => s.id === activeSectionId);
    if (dbSec) return dbSec;
    const st = STATIC_WORK_SECTIONS.find((s) => s.id === activeSectionId);
    if (!st) return null;
    return {
      id: st.id,
      name: st.name,
      stakeRange: st.stake,
      sectionsCount: st.summary.sections,
      keyWorksCount: st.summary.keyWorks,
      yardsCount: st.summary.yards,
      progressMetrics: st.progress,
      qualityMetrics: st.quality,
      safetyMetrics: st.safety,
    };
  }, [activeSectionId, sections]);

  const activePoi: ApiPoi = useMemo(() => {
    const found = pois.find((p) => p.id === selectedPoiId);
    if (found) return found;
    const st = STATIC_POI_OBJECTS[selectedPoiId] ?? STATIC_POI_OBJECTS.bridgeA;
    return {
      id: st.id,
      name: st.name,
      type: st.type,
      sectionId: st.sectionId,
      sectionName: st.section,
      stage: st.stage,
      stake: st.stake,
      cameraName: st.camera,
      icon: st.icon,
      imgPath: st.imgPath,
      duration: st.duration,
      elapsedSec: st.elapsed,
      photosCount: st.photos,
      videosCount: st.videos,
      inspectionsCount: st.inspections,
      metrics: st.metrics,
      docs: st.docs,
    };
  }, [pois, selectedPoiId]);

  const focusGroups = useMemo(() => {
    const map: Record<string, { id: string; title: string; summaryPrefix: string; unit: string; icon: string; records: ApiFocusRow[] }> = {
      nodes: { id: 'nodes', title: '关键节点', summaryPrefix: '本月计划关键节点', unit: '项', icon: 'flag', records: [] },
      issues: { id: 'issues', title: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', records: [] },
      collab: { id: 'collab', title: '协同事项', summaryPrefix: '跨工区协同', unit: '项', icon: 'handshake', records: [] },
    };
    for (const r of focusRows) {
      if (map[r.category]) map[r.category].records.push(r);
    }
    return Object.values(map);
  }, [focusRows]);

  const datePreset = DATE_PRESETS.find((d) => d.date === selectedDate) ?? DATE_PRESETS[0];

  function openPoiDetail(poi: ApiPoi) {
    openModalHtml(
      `工程详情 · ${poi.name}`,
      `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区 / 桩号</span><strong>${poi.sectionName} · ${poi.stake}</strong></div>
        <div class="detail-stat-card"><span>工程形象进度</span><strong>${poi.metrics.progress}</strong></div>
        <div class="detail-stat-card"><span>规模 / 完成量</span><strong>${poi.metrics.beamsDone}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:130px;">工程名称</th><td>${poi.name}</td><th style="width:130px;">工程类型</th><td>${poi.type}</td></tr>
          <tr><th>当前施工阶段</th><td><span class="status-tag info">${poi.stage}</span></td><th>现场负责人</th><td>${poi.metrics.supervisor}</td></tr>
          <tr><th>关联影像资料</th><td>照片 ${poi.photosCount} 张 / 视频 ${poi.videosCount} 条</td><th>累计巡检记录</th><td>${poi.inspectionsCount} 条（正常）</td></tr>
        </tbody>
      </table>
      `
    );
  }

  function openPoiDocs(poi: ApiPoi) {
    openModalHtml(
      `关联资料清单 · ${poi.name}`,
      `
      <table class="data-table">
        <thead><tr><th>文件名称</th><th>资料分类</th><th>归档日期</th><th>大小</th><th>操作</th></tr></thead>
        <tbody>
          ${poi.docs
            .map(
              (d) => `<tr>
                <td>${d.name}</td>
                <td><span class="status-tag info">${d.type}</span></td>
                <td>${d.date}</td>
                <td>${d.size}</td>
                <td><button class="dock-btn" data-doc-preview="${d.name}">预览</button></td>
              </tr>`
            )
            .join('')}
        </tbody>
      </table>
      `
    );
  }

  if (subPageId === 'roaming') {
    const st = ROAMING_STATIONS[roamingIndex];
    const pct = (roamingIndex / (ROAMING_STATIONS.length - 1)) * 100;
    return (
      <section className="page-view active" id="page-roaming">
        <div className="hud-left-col">
          <GlassPanel id="panelRoamingRoute" title="漫游线路" collapsible>
            <button
              type="button"
              className="route-header-btn"
              onClick={() => {
                setRoamingAutoMode('auto');
                setRoamingPlaying(true);
                setRoamingIndex(0);
                showToast('已启动全线漫游（明水方向起点 → 北安方向终点）');
              }}
            >
              全线漫游
            </button>
            <div className="timeline-list">
              {ROAMING_STATIONS.map((item, idx) => (
                <div
                  key={item.id}
                  className={`timeline-item ${idx === roamingIndex ? 'active' : idx < roamingIndex ? 'visited' : ''}`}
                  onClick={() => {
                    setRoamingIndex(idx);
                    showToast(`当前漫游站点 (${idx + 1}/${ROAMING_STATIONS.length})：${item.name}`);
                  }}
                >
                  <span className="timeline-node" />
                  <span className="timeline-label">{item.name}</span>
                  {idx === roamingIndex ? <span className="current-badge">当前站点</span> : null}
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
          <GlassPanel id="panelCurrentStation" title="当前站点" collapsible>
            <div style={{ fontSize: 18, fontWeight: 800, marginBottom: 10 }}>{st.name}</div>
            <div
              className="media-card"
              style={{ cursor: 'pointer' }}
              onClick={() =>
                openModalHtml(
                  `站点现场影像 · ${st.name}`,
                  `<div class="media-card playing" style="margin:0;"><img src="${st.imgPath}" alt="${st.name}" /><div class="media-top-badges"><span class="live-pill"><span class="live-dot"></span>无人机巡航视频回放</span><span class="cam-pill">${st.section} · ${st.duration}</span></div></div><p style="color:#dbeafe;">${st.desc}</p>`
                )
              }
            >
              <img src={st.imgPath} alt={st.name} />
              <div className="media-top-badges">
                <span className="live-pill">
                  <span className="live-dot" />
                  现场影像 · 演示
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

            <div className="kpi-triple" style={{ marginBottom: 12 }}>
              <div className="kpi-cell">
                <Camera size={16} />
                <span className="kpi-label">关联照片</span>
                <div>
                  <span className="kpi-value">{st.photos}</span>
                  <span className="kpi-unit">张</span>
                </div>
              </div>
              <div className="kpi-cell">
                <Video size={16} />
                <span className="kpi-label">关联视频</span>
                <div>
                  <span className="kpi-value">{st.videos}</span>
                  <span className="kpi-unit">条</span>
                </div>
              </div>
              <div className="kpi-cell">
                <FileText size={16} />
                <span className="kpi-label">巡检记录</span>
                <div>
                  <span className="kpi-value">{st.inspections}</span>
                  <span className="kpi-unit">条</span>
                </div>
              </div>
            </div>

            <button type="button" className="btn-primary-glow" onClick={() => openPoiDetail(activePoi)}>
              <FileText size={15} />
              <span>查看站点详情</span>
            </button>
            <button type="button" className="link-subtle" onClick={() => openPoiDocs(activePoi)}>
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
                <small>虚拟漫游 · 演示</small>
              </div>
              <div className="station-track">
                <div className="station-track-line">
                  <div className="station-track-fill" style={{ width: `${pct}%` }} />
                </div>
                {ROAMING_STATIONS.map((s, i) => (
                  <button
                    key={s.id}
                    type="button"
                    className={`station-step ${i === roamingIndex ? 'active' : i < roamingIndex ? 'passed' : ''}`}
                    onClick={() => setRoamingIndex(i)}
                  >
                    <span className="station-step-dot" />
                    <span>{s.name}</span>
                  </button>
                ))}
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

  if (subPageId === 'milestone') {
    const activeNode = milestones.find((n) => n.id === msActiveNodeId) ?? milestones[3];
    const leftNode = milestones.find((n) => n.milestoneDate === msLeftDate) ?? milestones[2];
    const rightNode = milestones.find((n) => n.milestoneDate === msRightDate) ?? milestones[3];
    const beforeSrc = leftNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg';
    const afterSrc = rightNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg';

    return (
      <section className="page-view active" id="page-milestone">
        <SplitImageCompare
          beforeSrc={beforeSrc}
          afterSrc={afterSrc}
          beforeFilter={leftNode?.cssFilter ?? 'none'}
          afterFilter={rightNode?.cssFilter ?? 'none'}
          splitPct={msSplitPct}
          onSplitChange={setMsSplitPct}
          zoom={msZoom}
          tagText={msSection}
        />

        <div className="compare-date-bar">
          <div className="compare-date-picker">
            <Calendar size={14} />
            <select value={msLeftDate} onChange={(e) => setMsLeftDate(e.target.value)}>
              {milestones.map((n) => (
                <option key={n.id} value={n.milestoneDate}>
                  {n.milestoneDate}
                </option>
              ))}
            </select>
          </div>
          <div className="compare-date-picker">
            <Calendar size={14} />
            <select value={msRightDate} onChange={(e) => setMsRightDate(e.target.value)}>
              {milestones.map((n) => (
                <option key={n.id} value={n.milestoneDate}>
                  {n.milestoneDate}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="zoom-pill vertical" style={{ position: 'absolute', right: 304, bottom: 20, zIndex: 20 }}>
          <button type="button" className="zoom-btn" onClick={() => setMsZoom((z) => Math.min(1.9, +(z + 0.15).toFixed(2)))}>
            +
          </button>
          <button type="button" className="zoom-btn" onClick={() => setMsZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}>
            −
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => {
              setMsZoom(1);
              setMsSplitPct(50);
            }}
          >
            <Maximize2 size={14} />
          </button>
        </div>

        <div className="hud-left-col">
          <GlassPanel id="panelMilestoneLeft" title="对象选择" collapsible>
            <div className="form-row">
              <label>所属工区</label>
              <select className="glass-select" value={msSection} onChange={(e) => setMsSection(e.target.value)}>
                {STATIC_WORK_SECTIONS.map((s) => (
                  <option key={s.id} value={s.name}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row" style={{ marginBottom: 14 }}>
              <label>工程对象</label>
              <select className="glass-select" value={msObject} onChange={(e) => setMsObject(e.target.value)}>
                <option value="桥梁示例A">桥梁示例A</option>
                <option value="梁场示例A">梁场示例A</option>
                <option value="拌合站示例A">拌合站示例A</option>
                <option value="K34路基示范段">K34路基示范段</option>
              </select>
            </div>

            <div className="panel-title-group" style={{ marginBottom: 8 }}>
              <span className="panel-accent-bar" />
              <span className="panel-title">节点详情</span>
            </div>
            <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{activeNode?.title ?? '梁板架设'}</div>
            <div style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 10 }}>
              节点日期 &nbsp;<strong style={{ color: '#fff' }}>{activeNode?.milestoneDate ?? '2026-11-20'}</strong>
            </div>

            <div className="media-card">
              <img
                src={activeNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg'}
                alt="节点影像"
              />
              <div className="media-top-badges">
                <span className="live-pill">
                  <span className="live-dot" />
                  现场影像 · 演示
                </span>
              </div>
              <span className="duration-chip">05:00</span>
            </div>

            <button
              type="button"
              className="btn-primary-glow"
              onClick={() => {
                if (!activeNode) return;
                openModalHtml(
                  `节点归档资料 · ${msObject}（${activeNode.milestoneDate} ${activeNode.title}）`,
                  `<div class="detail-grid"><div class="detail-stat-card"><span>节点照片</span><strong>${activeNode.photosCount} 张</strong></div><div class="detail-stat-card"><span>无人机航拍视频</span><strong>${activeNode.videosCount} 条</strong></div><div class="detail-stat-card"><span>进度日志记录</span><strong>${activeNode.logsCount} 条</strong></div></div><p style="color:#bae6fd;">${activeNode.description}</p>`
                );
              }}
            >
              <FileText size={15} />
              <span>查看节点资料</span>
            </button>
          </GlassPanel>
        </div>

        <div className="hud-right-col">
          <GlassPanel id="panelMilestoneRight" title="关键建设节点" collapsible>
            <div className="route-header-btn" style={{ textAlign: 'center', cursor: 'default' }}>
              {msSection} · {msObject}
            </div>
            <div className="timeline-list" style={{ marginBottom: 16 }}>
              {milestones.map((n) => (
                <div
                  key={n.id}
                  className={`timeline-item ${n.id === msActiveNodeId ? 'active' : ''}`}
                  onClick={() => {
                    setMsActiveNodeId(n.id);
                    if (n.imgMode === 'after') {
                      setMsRightDate(n.milestoneDate);
                      setMsSplitPct(36);
                    } else {
                      setMsLeftDate(n.milestoneDate);
                      setMsSplitPct(62);
                    }
                    showToast(`已定位关键节点：${n.milestoneDate} ${n.title}`);
                  }}
                >
                  <span className="timeline-node" />
                  <div>
                    <div className="timeline-sub">{n.milestoneDate}</div>
                    <div className="timeline-label">{n.title}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="panel-title-group" style={{ marginBottom: 10 }}>
              <span className="panel-accent-bar" />
              <span className="panel-title">资料类型</span>
            </div>
            <div className="checkbox-list">
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={msFilters.photo}
                  onChange={(e) => setMsFilters((f) => ({ ...f, photo: e.target.checked }))}
                />
                <span>节点照片</span>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={msFilters.uav}
                  onChange={(e) => setMsFilters((f) => ({ ...f, uav: e.target.checked }))}
                />
                <span>无人机影像</span>
              </label>
              <label className="check-item">
                <input
                  type="checkbox"
                  checked={msFilters.progress}
                  onChange={(e) => setMsFilters((f) => ({ ...f, progress: e.target.checked }))}
                />
                <span>进度记录</span>
              </label>
            </div>
          </GlassPanel>
        </div>
      </section>
    );
  }

  if (subPageId === 'showcase') {
    const topic = topics[scTopicIndex] ?? topics[0];
    const chIdx = topic
      ? Math.min(topic.chapters.length - 1, Math.floor((scCurrentSec / Math.max(1, topic.durationSec)) * topic.chapters.length))
      : 0;

    return (
      <section className="page-view active" id="page-showcase">
        <div className="showcase-backdrop-dim" />
        <div className="showcase-top-pills">
          <div className="scene-mode-pill">• 场景示意 · 模型演示 •</div>
          <button
            type="button"
            className={`hall-mode-btn ${scHallMode ? 'active' : ''}`}
            onClick={() => {
              const next = !scHallMode;
              setScHallMode(next);
              setScClosed(false);
              setScMinimized(false);
              if (next) setScPlaying(true);
            }}
          >
            <Landmark size={15} />
            <span>{scHallMode ? '退出展厅' : '展厅模式'}</span>
          </button>
        </div>

        <div className={`hud-left-col ${scHallMode ? 'hall-hidden' : ''}`}>
          <GlassPanel title="演示专题">
            <div className="topic-list">
              {topics.map((t, i) => (
                <button
                  key={t.id}
                  type="button"
                  className={`topic-card ${i === scTopicIndex ? 'active' : ''}`}
                  onClick={() => {
                    setScTopicIndex(i);
                    setScCurrentSec(0);
                    setScClosed(false);
                    setScMinimized(false);
                  }}
                >
                  <span className="topic-icon">
                    <Layers size={16} />
                  </span>
                  <div className="topic-info">
                    <div className="topic-title">{t.title}</div>
                    <div className="topic-desc">{t.subtitle}</div>
                  </div>
                  {i !== scTopicIndex ? (
                    <span className="topic-arrow">
                      <ChevronRight size={13} />
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </GlassPanel>
        </div>

        {topic && !scClosed ? (
          <div className={`theater-window ${scMinimized ? 'minimized' : ''} ${scHallMode ? 'hall-expanded' : ''}`}>
            <div className="theater-bar">
              <div className="theater-title">
                <Video size={15} />
                <span>{topic.videoTitle}</span>
              </div>
              <div className="theater-win-btns">
                <button type="button" className="theater-win-btn" onClick={() => setScMinimized((m) => !m)}>
                  −
                </button>
                <button
                  type="button"
                  className="theater-win-btn"
                  onClick={() => {
                    setScClosed(true);
                    setScPlaying(false);
                  }}
                >
                  ×
                </button>
              </div>
            </div>
            <div className={`theater-stage ${scPlaying ? 'playing' : ''}`}>
              <img src={topic.imgPath} alt={topic.title} />
              <button
                type="button"
                className="theater-big-play"
                onClick={() => setScPlaying((p) => !p)}
              >
                {scPlaying ? <Pause size={24} /> : <Play size={26} fill="currentColor" />}
              </button>
              <div className="theater-hud-caption">
                <div>
                  <span className="hud-caption-tag">
                    展厅讲解 · 章节 {chIdx + 1}/{topic.chapters.length}
                  </span>
                  <div className="hud-caption-text">{topic.chapters[chIdx]}</div>
                </div>
                <div className="hud-kpi-pills">
                  {topic.kpis.map((k) => (
                    <div key={k.label} className="hud-kpi-pill">
                      <strong>{k.val}</strong>
                      <span>{k.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : null}

        <div className={`hud-right-col ${scHallMode ? 'hall-hidden' : ''}`}>
          <GlassPanel title="演示控制">
            <div className="ctrl-grid">
              <button
                type="button"
                className="ctrl-btn primary"
                onClick={() => {
                  setScClosed(false);
                  setScMinimized(false);
                  setScPlaying(true);
                }}
              >
                {scPlaying ? <Pause size={14} /> : <Play size={14} />}
                <span>{scPlaying ? '演示中' : '开始演示'}</span>
              </button>
              <button
                type="button"
                className={`ctrl-btn ${scAutoCarousel ? 'active-toggle' : ''}`}
                onClick={() => {
                  const next = !scAutoCarousel;
                  setScAutoCarousel(next);
                  if (next) setScPlaying(true);
                }}
              >
                ⟳ <span>自动轮播</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
              >
                <Maximize2 size={14} />
                <span>全屏展示</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => {
                  if (!topics.length) return;
                  setScTopicIndex((i) => (i + 1) % topics.length);
                  setScCurrentSec(0);
                }}
              >
                ⧉ <span>切换专题</span>
              </button>
              <button type="button" className="ctrl-btn" onClick={() => setScPlaying(false)}>
                <Pause size={14} />
                <span>暂停</span>
              </button>
              <button
                type="button"
                className="ctrl-btn"
                onClick={() => {
                  if (!topics.length) return;
                  setScTopicIndex((i) => (i - 1 + topics.length) % topics.length);
                  setScCurrentSec(0);
                }}
              >
                ← <span>上一页</span>
              </button>
              <button
                type="button"
                className="ctrl-btn full"
                onClick={() => {
                  if (!topics.length) return;
                  setScTopicIndex((i) => (i + 1) % topics.length);
                  setScCurrentSec(0);
                }}
              >
                → <span>下一页</span>
              </button>
            </div>
          </GlassPanel>

          <GlassPanel title="内容摘要" className="flex-1 overflow-y-auto">
            <div className="summary-list">
              {(topic?.summaries ?? []).map((s) => (
                <div key={s.title} className="summary-item">
                  <span className="summary-dot" />
                  <div>
                    <div className="summary-title">{s.title}</div>
                    <div className="summary-desc">{s.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </GlassPanel>
        </div>

        {topic ? (
          <div className="showcase-player-bar">
            <button type="button" className="mini-ctrl-btn" onClick={() => setScPlaying((p) => !p)}>
              {scPlaying ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <span className="mini-time" style={{ fontSize: 12.5 }}>
              {fmtTime(scCurrentSec)} / {topic.durationStr}
            </span>
            <input
              className="player-slider"
              type="range"
              min={0}
              max={topic.durationSec}
              value={scCurrentSec}
              onChange={(e) => setScCurrentSec(Number(e.target.value))}
            />
            <button type="button" className="mini-ctrl-btn" onClick={() => setScMuted((m) => !m)}>
              {scMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
            </button>
            <input
              className="vol-slider"
              type="range"
              min={0}
              max={100}
              value={scMuted ? 0 : scVolume}
              onChange={(e) => {
                const v = Number(e.target.value);
                setScVolume(v);
                setScMuted(v === 0);
              }}
            />
            <button
              type="button"
              className="dock-btn"
              style={{ padding: '3px 9px', minWidth: 52, justifyContent: 'center' }}
              onClick={() => {
                const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
                setScSpeed(speeds[(speeds.indexOf(scSpeed) + 1) % speeds.length]);
              }}
            >
              {scSpeed.toFixed(1)}x
            </button>
            <button
              type="button"
              className="mini-ctrl-btn"
              onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
            >
              <Maximize2 size={15} />
            </button>
          </div>
        ) : null}
      </section>
    );
  }

  // Default: Page 1 (overview)
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

  const layerItems: Array<{ key: keyof typeof p1Layers; label: string; icon: React.ReactNode }> = [
    { key: 'satellite', label: '高分遥感影像', icon: <Compass size={15} /> },
    { key: 'uav', label: '无人机倾斜摄影', icon: <Camera size={15} /> },
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
            {mgmtRows.map((item) => (
              <div key={item.key} className="progress-item">
                <span className="progress-icon">
                  <Layers size={15} />
                </span>
                <div className="progress-main">
                  <div className="progress-row-top">
                    <span className="progress-name">{item.name}</span>
                    <span className="progress-pct">{item.pct.toFixed(1)}%</span>
                  </div>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width: `${Math.min(100, item.pct)}%` }} />
                  </div>
                </div>
              </div>
            ))}
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
                  openModalHtml(
                    `重点关注 · ${g.title}（${g.records.length}${g.unit}）`,
                    `<table class="data-table"><thead><tr><th>事项名称</th><th>责任工区</th><th>计划期限</th><th>状态</th></tr></thead><tbody>${g.records
                      .map(
                        (r) =>
                          `<tr><td>${r.title}</td><td>${r.sectionName}</td><td>${r.dueDate}</td><td><span class="status-tag ${r.statusTone}">${r.status}</span></td></tr>`
                      )
                      .join('')}</tbody></table>`
                  )
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
              <img src={activePoi.imgPath} alt={activePoi.name} />
              <div className="media-top-badges">
                <span className="live-pill">
                  <span className="live-dot" />
                  实时监控 · 演示
                </span>
                <span className="cam-pill">{activePoi.cameraName}</span>
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
                    openModalHtml(
                      `高清视频监控 · ${activePoi.cameraName}`,
                      `<div class="media-card playing" style="margin:0;"><img src="${activePoi.imgPath}" alt="${activePoi.name}" /><div class="media-top-badges"><span class="live-pill"><span class="live-dot"></span>实时高清码流 1080P</span><span class="cam-pill">${activePoi.stake}</span></div></div>`
                    )
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
              onClick={() => openPoiDetail(activePoi)}
            >
              <FileText size={15} />
              <span>查看工程详情</span>
            </button>
            <button
              type="button"
              className="link-subtle"
              onClick={() => openPoiDocs(activePoi)}
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
              className="layer-toggle-item"
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
