'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  CheckCircle2,
  ChevronRight,
  Crosshair,
  FileText,
  Layers,
  MapPin,
  Move,
  Pause,
  PenTool,
  Play,
  Route,
  Save,
  Search,
  Warehouse,
} from 'lucide-react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  interpolateWaypoints,
  recomputeRouteLengthKm,
  statusTagClass,
  type UavHangarDTO,
  type UavRouteDTO,
  type UavWaypoint,
} from '../types';
import { NewRouteModal, RouteHistoryModal } from './UavModalsLazy';

interface RoutesResponse {
  routes: UavRouteDTO[];
  allRoutes: UavRouteDTO[];
}

const DEFAULT_HANGARS: UavHangarDTO[] = [
  { id: 'H-A01', name: '机巢A01', sectionId: 'sec2', status: '在线', temp: '18.4 ℃', batterySlot: '2块满电', lon: 126.115, lat: 47.505, alt: 222 },
  { id: 'H-A02', name: '机巢A02', sectionId: 'sec1', status: '在线', temp: '17.9 ℃', batterySlot: '2块满电', lon: 125.9158, lat: 47.3602, alt: 224 },
  { id: 'H-B01', name: '机巢B01', sectionId: 'sec3', status: '在线', temp: '18.1 ℃', batterySlot: '1块充电中', lon: 125.9925, lat: 47.6504, alt: 226 },
  { id: 'H-B02', name: '机巢B02', sectionId: 'sec4', status: '在线', temp: '17.5 ℃', batterySlot: '2块满电', lon: 126.135, lat: 47.838, alt: 230 },
];

const PIN_SVG_DRONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0"/><path d="M5 5l4.2 4.2M19 5l-4.2 4.2M5 19l4.2-4.2M19 19l-4.2-4.2"/><circle cx="5" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="19" cy="19" r="2.6"/></svg>`;
const PIN_SVG_HANGAR = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8.5 8v8M15.5 8v8M8.5 12h7"/></svg>`;
const PIN_SVG_POI = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.4-6-10.2a6 6 0 1 1 12 0C18 15.6 12 21 12 21z"/><circle cx="12" cy="10.8" r="2.1"/></svg>`;

function flyCameraToBounds(
  lon: number,
  lat: number,
  rangeMeters: number,
  pitchDeg = -58,
  durationSec = 0.85
) {
  const engine = getGlobalCesiumEngine();
  const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
  if (!engine.ready || !engine.viewer || !Cesium) return;
  if (typeof engine.viewer.camera.cancelFlight === 'function') {
    engine.viewer.camera.cancelFlight();
  }
  const target = Cesium.Cartesian3.fromDegrees(lon, lat, 220);
  engine.viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(target, rangeMeters * 0.35),
    {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(8),
        Cesium.Math.toRadians(pitchDeg),
        rangeMeters
      ),
      duration: durationSec,
    }
  );
}

export function RoutesSubPage({
  activeSectionId,
  showToast,
}: {
  activeSectionId: string | null;
  showToast: (msg: string) => void;
}) {
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);

  const [routes, setRoutes] = useState<UavRouteDTO[]>([]);
  const [search, setSearch] = useState('');
  const [selectedTplId, setSelectedTplId] = useState('tpl-lc-a');
  const [selectedWpIdx, setSelectedWpIdx] = useState(6); // 07·消防通道
  const [toolMode, setToolMode] = useState<'select' | 'draw' | 'move'>('select');
  const [previewing, setPreviewing] = useState(false);
  const [showRouteLine, setShowRouteLine] = useState(true);
  const [showBoundary, setShowBoundary] = useState(true);
  const [showLayerPopover, setShowLayerPopover] = useState(false);
  const [showSatLayer, setShowSatLayer] = useState(true);
  const [showGridLayer, setShowGridLayer] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [showNewRoute, setShowNewRoute] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const pinsLayerRef = useRef<HTMLDivElement | null>(null);
  const previewProgressRef = useRef(6.0);
  const toolModeRef = useRef(toolMode);
  toolModeRef.current = toolMode;
  const selectedWpIdxRef = useRef(selectedWpIdx);
  selectedWpIdxRef.current = selectedWpIdx;

  const loadRoutes = useCallback(async () => {
    const res = await fetch('/api/v1/m09/routes');
    if (res.ok) {
      const json = (await res.json()) as RoutesResponse;
      setRoutes(json.allRoutes ?? json.routes ?? []);
    }
  }, []);

  useEffect(() => {
    void loadRoutes();
  }, [loadRoutes]);

  // Auto-select matching section template when global activeSectionId changes
  useEffect(() => {
    if (!activeSectionId || !routes.length) return;
    const match = routes.find((r) => r.sectionId === activeSectionId);
    if (match && match.id !== selectedTplId) {
      setSelectedTplId(match.id);
      setSelectedWpIdx(0);
      setPreviewing(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  const activeRoute = useMemo(() => {
    return routes.find((r) => r.id === selectedTplId) ?? routes[0] ?? null;
  }, [routes, selectedTplId]);

  const safeWpIdx = useMemo(() => {
    if (!activeRoute || !activeRoute.waypoints.length) return 0;
    return Math.min(selectedWpIdx, activeRoute.waypoints.length - 1);
  }, [activeRoute, selectedWpIdx]);

  const selWp = activeRoute?.waypoints[safeWpIdx] ?? null;

  const filteredRoutes = useMemo(() => {
    const kw = search.trim().toLowerCase();
    if (!kw) return routes;
    return routes.filter(
      (t) =>
        t.name.toLowerCase().includes(kw) ||
        t.code.toLowerCase().includes(kw)
    );
  }, [routes, search]);

  // Preview animation timer
  useEffect(() => {
    if (!previewing || !activeRoute?.waypoints.length) return;
    const n = activeRoute.waypoints.length;
    const timer = window.setInterval(() => {
      previewProgressRef.current = (previewProgressRef.current + 0.14) % n;
    }, 120);
    return () => {
      window.clearInterval(timer);
    };
  }, [previewing, activeRoute?.id, activeRoute?.waypoints.length]);

  // Fly camera when active route changes
  useEffect(() => {
    if (!cesiumReady || !activeRoute) return;
    const timer = window.setTimeout(() => {
      flyCameraToBounds(activeRoute.center[0], activeRoute.center[1] - 0.0007, 1700, -58);
    }, 60);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cesiumReady, activeRoute?.id]);

  // Update active route waypoints locally + optionally persist
  const applyLocalWaypointMutation = useCallback(
    (routeId: string, nextWaypoints: UavWaypoint[], nextStatus = '草稿') => {
      const nextLen = recomputeRouteLengthKm(nextWaypoints);
      setRoutes((prev) =>
        prev.map((r) =>
          r.id === routeId
            ? { ...r, waypoints: nextWaypoints, lengthKm: nextLen, status: nextStatus }
            : r
        )
      );
    },
    []
  );

  // Cesium entities + ScreenSpaceEventHandler + projected HTML pins
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (!cesiumReady || !engine.ready || !engine.viewer || !Cesium || !activeRoute) return;

    engine.applyLayers({
      satellite: showSatLayer,
      uav: true,
      bim: false,
      pois: false,
      sections: false,
      route: true,
      designMode: showGridLayer,
      activeSectionId,
    });
    engine.syncHtmlOverlays({ showRoute: false, showSections: false, showPois: false });
    engine.clearModuleEntities('uav');

    const viewer = engine.viewer;
    const pinsLayer = pinsLayerRef.current;
    if (pinsLayer) pinsLayer.innerHTML = '';

    const htmlPins: Array<{
      el: HTMLElement;
      cartesian?: unknown;
      getCartesian?: () => unknown;
    }> = [];

    const wps = activeRoute.waypoints;

    if (showBoundary && activeRoute.boundary.length >= 3) {
      const bDeg: number[] = [];
      activeRoute.boundary.forEach((pt) => bDeg.push(pt[0], pt[1]));
      bDeg.push(activeRoute.boundary[0][0], activeRoute.boundary[0][1]);
      engine.trackModuleEntity('uav', {
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(activeRoute.boundary.flat()),
          material: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.08),
          classificationType: Cesium.ClassificationType.TERRAIN,
        },
      });
      engine.trackModuleEntity('uav', {
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(bDeg),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.95),
            dashLength: 16,
          }),
        },
      });
    }

    if (showRouteLine && wps.length >= 2) {
      const rDeg: number[] = [];
      wps.forEach((w) => rDeg.push(w.lon, w.lat));
      if (wps.length > 2) rDeg.push(wps[0].lon, wps[0].lat);
      engine.trackModuleEntity('uav', {
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(rDeg),
          width: 4.5,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#38f2ff'),
          }),
        },
      });
    }

    if (pinsLayer) {
      const centerEl = document.createElement('div');
      centerEl.className = 'm09-pin-anchor';
      centerEl.innerHTML = `
        <div class="m09-map-pin">
          <div class="m09-map-pill">${PIN_SVG_POI}<span>${activeRoute.targetName}</span></div>
          <div class="m09-map-stem"></div>
        </div>
      `;
      pinsLayer.appendChild(centerEl);
      htmlPins.push({
        el: centerEl,
        cartesian: Cesium.Cartesian3.fromDegrees(
          activeRoute.center[0],
          activeRoute.center[1],
          245
        ),
      });

      const hangar =
        DEFAULT_HANGARS.find((h) => h.name === activeRoute.hangar) ?? DEFAULT_HANGARS[0];
      const hEl = document.createElement('div');
      hEl.className = 'm09-pin-anchor';
      hEl.innerHTML = `
        <div class="m09-map-pin">
          <div class="m09-map-pill green">${PIN_SVG_HANGAR}<span>${hangar.name}</span></div>
        </div>
      `;
      pinsLayer.appendChild(hEl);
      const hLon = activeRoute.id === 'tpl-lc-a' ? hangar.lon : wps[0]?.lon ?? hangar.lon;
      const hLat =
        activeRoute.id === 'tpl-lc-a'
          ? 47.5048
          : (wps[0]?.lat ?? hangar.lat) - 0.00025;
      htmlPins.push({
        el: hEl,
        cartesian: Cesium.Cartesian3.fromDegrees(hLon, hLat, 248),
      });
    }

    wps.forEach((wp, idx) => {
      const isSel = idx === safeWpIdx;
      engine.trackModuleEntity('uav', {
        position: Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, 252),
        point: {
          pixelSize: isSel ? 12 : 8,
          color: Cesium.Color.fromCssColorString(isSel ? '#facc15' : '#38f2ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      if (pinsLayer) {
        const el = document.createElement('div');
        el.className = 'm09-pin-anchor';
        el.innerHTML = `
          <div class="m09-wp-node ${isSel ? 'active' : ''}" title="航点 ${wp.no}·${wp.name}">
            ${isSel ? `<div class="m09-wp-callout">${wp.no} · ${wp.name}</div>` : ''}
            ${wp.no}
          </div>
        `;
        el.addEventListener('click', (e) => {
          e.stopPropagation();
          setSelectedWpIdx(idx);
        });
        pinsLayer.appendChild(el);
        htmlPins.push({
          el,
          cartesian: Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, 252),
        });
      }
    });

    if (previewing && wps.length > 0) {
      engine.trackModuleEntity('uav', {
        position: new Cesium.CallbackProperty(() => {
          const p = interpolateWaypoints(wps, previewProgressRef.current);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }, false),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString('#facc15'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      if (pinsLayer) {
        const dEl = document.createElement('div');
        dEl.className = 'm09-pin-anchor';
        dEl.innerHTML =
          `<div class="m09-map-pin"><div class="m09-map-pill gold">${PIN_SVG_DRONE}<span>预览飞行中</span></div></div>`;
        pinsLayer.appendChild(dEl);
        htmlPins.push({
          el: dEl,
          getCartesian: () => {
            const p = interpolateWaypoints(wps, previewProgressRef.current);
            return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
          },
        });
      }
    }

    // ScreenSpaceEventHandler for draw / move mode
    const clickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    clickHandler.setInputAction((movement: { position: unknown }) => {
      const mode = toolModeRef.current;
      if (mode === 'select') return;
      const ray = viewer.camera.getPickRay(movement.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lon = Number(Cesium.Math.toDegrees(carto.longitude).toFixed(5));
      const lat = Number(Cesium.Math.toDegrees(carto.latitude).toFixed(5));

      if (mode === 'draw') {
        const nextNo = String(wps.length + 1).padStart(2, '0');
        const nextWps: UavWaypoint[] = [
          ...wps,
          {
            no: nextNo,
            name: `新增航点${nextNo}`,
            lon,
            lat,
            alt: 40,
            speed: 3.0,
            action: '定点拍照',
            req: '取证全景与近景',
            checkItem: '现场安全',
            gimbal: '俯视',
          },
        ];
        applyLocalWaypointMutation(activeRoute.id, nextWps);
        setSelectedWpIdx(nextWps.length - 1);
        showToast(`已在地图选点新增航点 ${nextNo}`);
      } else if (mode === 'move') {
        const idx = Math.min(selectedWpIdxRef.current, wps.length - 1);
        if (idx >= 0 && wps[idx]) {
          const nextWps = wps.map((w, i) => (i === idx ? { ...w, lon, lat } : w));
          const len = recomputeRouteLengthKm(nextWps);
          applyLocalWaypointMutation(activeRoute.id, nextWps);
          showToast(`已移动航点 ${wps[idx].no} 坐标（航线长度更新为 ${len} km）`);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    const syncProjection = () => {
      if (!viewer || !htmlPins.length) return;
      const sc = viewer.scene;
      const w = sc.canvas.clientWidth || window.innerWidth;
      const h = sc.canvas.clientHeight || window.innerHeight;
      const toWin =
        Cesium.SceneTransforms.worldToWindowCoordinates ||
        Cesium.SceneTransforms.wgs84ToWindowCoordinates;
      for (const item of htmlPins) {
        const cart = item.getCartesian ? item.getCartesian() : item.cartesian;
        const pt = toWin(sc, cart);
        if (pt && pt.x >= -140 && pt.x <= w + 140 && pt.y >= -100 && pt.y <= h + 100) {
          item.el.style.display = 'block';
          item.el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
        } else {
          item.el.style.display = 'none';
        }
      }
    };

    const removePostRender = viewer.scene.postRender.addEventListener(syncProjection);
    syncProjection();

    return () => {
      try {
        clickHandler.destroy();
      } catch {
        // ignore
      }
      if (typeof removePostRender === 'function') {
        try {
          removePostRender();
        } catch {
          // ignore
        }
      }
      if (pinsLayer) pinsLayer.innerHTML = '';
      engine.clearModuleEntities('uav');
    };
  }, [
    cesiumReady,
    activeRoute,
    safeWpIdx,
    showRouteLine,
    showBoundary,
    previewing,
    showSatLayer,
    showGridLayer,
    activeSectionId,
    applyLocalWaypointMutation,
    showToast,
  ]);

  function updateSelectedWaypoint(patch: Partial<UavWaypoint>, toastMsg?: string) {
    if (!activeRoute || !selWp) return;
    const nextWps = activeRoute.waypoints.map((w, i) =>
      i === safeWpIdx ? { ...w, ...patch } : w
    );
    applyLocalWaypointMutation(activeRoute.id, nextWps);
    if (toastMsg) showToast(toastMsg);
  }

  async function handleSaveDraft() {
    if (!activeRoute) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m09/routes/${encodeURIComponent(activeRoute.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'saveDraft',
            waypoints: activeRoute.waypoints,
            boundary: activeRoute.boundary,
          }),
        }
      );
      if (res.ok) {
        const json = (await res.json()) as { route: UavRouteDTO };
        setRoutes((prev) =>
          prev.map((r) => (r.id === json.route.id ? json.route : r))
        );
        showToast(
          `已另存航线草稿：${json.route.code}（${json.route.waypoints.length}个航点）`
        );
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '另存航线草稿失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateRoute(payload: {
    name: string;
    code: string;
    sectionId: string;
    targetName: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m09/routes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create',
          sourceRouteId: activeRoute?.id,
          ...payload,
        }),
      });
      if (res.ok) {
        const json = (await res.json()) as { route: UavRouteDTO };
        setRoutes((prev) => [...prev, json.route]);
        setSelectedTplId(json.route.id);
        setSelectedWpIdx(0);
        setShowNewRoute(false);
        showToast(`已新建航线：${json.route.name}`);
      } else {
        const err = (await res.json().catch(() => ({}))) as { error?: string };
        showToast(err.error || '新建航线失败');
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCloneTemplate() {
    if (!activeRoute) return;
    showToast(`已调用航线模板：${activeRoute.name}（${activeRoute.code}）`);
    flyCameraToBounds(activeRoute.center[0], activeRoute.center[1] - 0.0007, 1700, -58);
  }

  function renderTplIcon(icon: string) {
    if (icon === 'layers') return <Layers size={14} />;
    if (icon === 'hangar') return <Warehouse size={14} />;
    return <Route size={14} />;
  }

  return (
    <div className="m09-map-stage">
      <div ref={pinsLayerRef} className="m09-cesium-pins" />

      {/* Top Floating Draw/Preview Toolbar */}
      <div className="m09-map-topbar">
        <div className="m09-map-bar-left">
          <strong style={{ fontSize: '13px', color: '#fff', marginRight: '4px' }}>
            {activeRoute?.code ?? 'LC-A V2.0'}
          </strong>
          <button
            type="button"
            className={`m09-btn ${toolMode === 'select' ? 'primary' : ''}`}
            style={{ padding: '4px 10px' }}
            onClick={() => setToolMode('select')}
          >
            <MapPin size={13} /> 选点
          </button>
          <button
            type="button"
            className={`m09-btn ${toolMode === 'draw' ? 'primary' : ''}`}
            style={{ padding: '4px 10px' }}
            onClick={() => {
              setToolMode('draw');
              showToast('绘制航线模式：在三维地图上点击即可顺序追加航点');
            }}
          >
            <PenTool size={13} /> 绘制航线
          </button>
          <button
            type="button"
            className={`m09-btn ${toolMode === 'move' ? 'primary' : ''}`}
            style={{ padding: '4px 10px' }}
            onClick={() => {
              setToolMode('move');
              showToast(
                `移动航点模式：点击三维地图可将航点 ${selWp?.no ?? '01'} 移动至新位置`
              );
            }}
          >
            <Move size={13} /> 移动
          </button>
          <button
            type="button"
            className={`m09-btn ${previewing ? 'gold' : ''}`}
            style={{ padding: '4px 10px' }}
            onClick={() => {
              const next = !previewing;
              if (next) {
                previewProgressRef.current = 0;
                showToast(`开始模拟预览航线 ${activeRoute?.code ?? ''}`);
              }
              setPreviewing(next);
            }}
          >
            {previewing ? <Pause size={13} /> : <Play size={13} />}
            {previewing ? '停止预览' : '预览'}
          </button>
        </div>

        <div
          className="m09-map-bar-right"
          style={{ position: 'relative', fontSize: '12px', color: '#dbeafe' }}
        >
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showRouteLine}
              onChange={(e) => setShowRouteLine(e.target.checked)}
              style={{ accentColor: '#22d3ee' }}
            />
            规划航线
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showBoundary}
              onChange={(e) => setShowBoundary(e.target.checked)}
              style={{ accentColor: '#facc15' }}
            />
            巡检范围
          </label>
          <button
            type="button"
            className="m09-btn"
            style={{ padding: '4px 10px' }}
            onClick={() => setShowLayerPopover((v) => !v)}
          >
            <Layers size={13} /> 图层
          </button>
          {showLayerPopover ? (
            <div className="m09-popover">
              <strong style={{ color: '#fff' }}>底图图层控制</strong>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showSatLayer}
                  onChange={(e) => setShowSatLayer(e.target.checked)}
                  style={{ accentColor: '#22d3ee' }}
                />
                高清卫星实景
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={showGridLayer}
                  onChange={(e) => setShowGridLayer(e.target.checked)}
                  style={{ accentColor: '#22d3ee' }}
                />
                科技网格叠加
              </label>
            </div>
          ) : null}
        </div>
      </div>

      {/* Left HUD Column */}
      <div className="hud-left-col" style={{ width: '264px' }}>
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">航线模板</span>
            </div>
          </div>
          <div className="panel-body">
            <div style={{ position: 'relative', marginBottom: '9px' }}>
              <input
                className="m09-input"
                style={{ width: '100%', paddingLeft: '28px', boxSizing: 'border-box' }}
                placeholder="搜索航线模板"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '9px',
                  top: '7px',
                  color: 'var(--text-muted)',
                }}
              >
                <Search size={13} />
              </span>
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '7px',
                marginBottom: '10px',
              }}
            >
              {filteredRoutes.map((t) => (
                <div
                  key={t.id}
                  className={`m09-list-card ${t.id === activeRoute?.id ? 'active' : ''}`}
                  style={{
                    marginBottom: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                  onClick={() => {
                    setSelectedTplId(t.id);
                    setSelectedWpIdx(0);
                    setPreviewing(false);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span style={{ color: '#38f2ff' }}>{renderTplIcon(t.icon)}</span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontSize: '12.5px', fontWeight: 700, color: '#fff' }}>
                        {t.name}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        {t.code} · {t.waypoints.length}个航点
                      </div>
                    </div>
                  </div>
                  <span className={`status-tag ${statusTagClass(t.status)}`}>{t.status}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              <button
                type="button"
                className="m09-btn primary"
                onClick={() => void handleCloneTemplate()}
              >
                <CheckCircle2 size={13} /> 调用模板
              </button>
              <button
                type="button"
                className="m09-btn"
                onClick={() => setShowNewRoute(true)}
              >
                + 新建航线
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">当前航线</span>
            </div>
            <span className={`status-tag ${statusTagClass(activeRoute?.status ?? '已审核')}`}>
              {activeRoute?.status ?? '已审核'}
            </span>
          </div>
          <div className="panel-body">
            <div className="m09-kv-row">
              <span className="m09-kv-k">关联任务</span>
              <span className="m09-kv-v">{activeRoute?.taskId ?? 'UAV-20261126-02'}</span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">巡检对象</span>
              <span className="m09-kv-v">{activeRoute?.targetName ?? '二工区·料场示例A'}</span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">规划航点</span>
              <span className="m09-kv-v">{activeRoute?.waypoints.length ?? 12} 个</span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">航线长度</span>
              <span className="m09-kv-v">{activeRoute?.lengthKm ?? 1.24} km</span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">关联机巢</span>
              <span className="m09-kv-v">{activeRoute?.hangar ?? '机巢A01'}</span>
            </div>
            <div className="m09-panel-foot" style={{ justifyContent: 'flex-start' }}>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => setShowHistory(true)}
              >
                查看历史版本 <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right HUD Column */}
      <div className="hud-right-col" style={{ width: '282px' }}>
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">航点设置</span>
            </div>
          </div>
          <div className="panel-body">
            {selWp ? (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: '8px',
                  }}
                >
                  <strong style={{ fontSize: '13.5px', color: '#fff' }}>
                    航点 {selWp.no} · {selWp.name}
                  </strong>
                  <span className="status-tag info">已选中</span>
                </div>
                <div className="m09-form-grid-2" style={{ marginBottom: '8px' }}>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">相对航高</span>
                    <select
                      className="m09-select"
                      value={selWp.alt}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        updateSelectedWaypoint({ alt: v }, `航点 ${selWp.no} 航高已设为 ${v} m`);
                      }}
                    >
                      {[25, 30, 35, 40, 45, 50, 60, 80].map((v) => (
                        <option key={v} value={v}>
                          {v} m
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="m09-form-item">
                    <span className="m09-form-lbl">飞行速度</span>
                    <select
                      className="m09-select"
                      value={selWp.speed}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        updateSelectedWaypoint(
                          { speed: v },
                          `航点 ${selWp.no} 速度已设为 ${v.toFixed(1)} m/s`
                        );
                      }}
                    >
                      {[2.0, 2.5, 3.0, 3.5, 4.0, 5.0].map((v) => (
                        <option key={v} value={v}>
                          {v.toFixed(1)} m/s
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '7px' }}>
                  <span className="m09-form-lbl">拍摄动作</span>
                  <select
                    className="m09-select"
                    value={selWp.action}
                    onChange={(e) => updateSelectedWaypoint({ action: e.target.value })}
                  >
                    {['定点拍照', '连续抓拍', '悬停录像', '起降自检'].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '7px' }}>
                  <span className="m09-form-lbl">拍摄要求</span>
                  <select
                    className="m09-select"
                    value={selWp.req}
                    onChange={(e) => updateSelectedWaypoint({ req: e.target.value })}
                  >
                    {[
                      selWp.req,
                      '取证全景与通道近景',
                      '通道边界正射',
                      '堆料高度侧拍',
                      '同点位临边防护复查取证',
                    ]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '7px' }}>
                  <span className="m09-form-lbl">检查项</span>
                  <select
                    className="m09-select"
                    value={selWp.checkItem}
                    onChange={(e) => updateSelectedWaypoint({ checkItem: e.target.value })}
                  >
                    {[
                      selWp.checkItem,
                      '消防通道',
                      '起降安全区',
                      '围挡封闭',
                      '临边防护',
                      '交通导改',
                    ]
                      .filter((v, i, a) => a.indexOf(v) === i)
                      .map((v) => (
                        <option key={v} value={v}>
                          {v}
                        </option>
                      ))}
                  </select>
                </div>
                <div className="m09-form-item" style={{ marginBottom: '8px' }}>
                  <span className="m09-form-lbl">云台视角</span>
                  <select
                    className="m09-select"
                    value={selWp.gimbal}
                    onChange={(e) => updateSelectedWaypoint({ gimbal: e.target.value })}
                  >
                    {['俯视', '前倾45°', '前视', '环绕'].map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="m09-panel-foot">
                  <button
                    type="button"
                    className="m09-link-btn"
                    onClick={() => {
                      flyCameraToBounds(selWp.lon, selWp.lat, 650, -58);
                      showToast(`已定位至航点 ${selWp.no} · ${selWp.name}`);
                    }}
                  >
                    定位航点 <Crosshair size={13} />
                  </button>
                  <span>参数示意</span>
                </div>
              </>
            ) : null}
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">执行前校核</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <MapPin size={13} /> 现场范围核对
              </span>
              <span className="m09-kv-v" style={{ color: '#67e8f9' }}>
                已记录
              </span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <FileText size={13} /> 检查项关联
              </span>
              <span className="m09-kv-v" style={{ color: '#67e8f9' }}>
                已配置
              </span>
            </div>
            <div className="m09-kv-row" style={{ marginBottom: '10px' }}>
              <span className="m09-kv-k">
                <CheckCircle2 size={13} /> 航线状态
              </span>
              <span className="m09-kv-v" style={{ color: '#22c55e' }}>
                {activeRoute?.status ?? '已审核'}
              </span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '7px' }}>
              <button
                type="button"
                className="m09-btn"
                onClick={() => {
                  if (!activeRoute) return;
                  const nextNo = String(activeRoute.waypoints.length + 1).padStart(2, '0');
                  const last = activeRoute.waypoints[activeRoute.waypoints.length - 1];
                  const nextWps: UavWaypoint[] = [
                    ...activeRoute.waypoints,
                    {
                      no: nextNo,
                      name: `扩展点${nextNo}`,
                      lon: Number(((last?.lon ?? 126.115) - 0.0012).toFixed(5)),
                      lat: Number(((last?.lat ?? 47.508) + 0.0004).toFixed(5)),
                      alt: 40,
                      speed: 3.0,
                      action: '定点拍照',
                      req: '取证全景与通道近景',
                      checkItem: '消防通道',
                      gimbal: '俯视',
                    },
                  ];
                  applyLocalWaypointMutation(activeRoute.id, nextWps);
                  setSelectedWpIdx(nextWps.length - 1);
                  showToast(`已新增航点 ${nextNo}`);
                }}
              >
                + 新增航点
              </button>
              <button
                type="button"
                className="m09-btn primary"
                disabled={submitting}
                onClick={() => void handleSaveDraft()}
              >
                <Save size={13} /> {submitting ? '保存中...' : '另存草稿'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Map Zoom Controls */}
      <div className="m09-map-zoom routes-pos">
        <div className="zoom-pill vertical">
          <button
            type="button"
            className="zoom-btn"
            onClick={() => getGlobalCesiumEngine().zoomIn()}
          >
            +
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => getGlobalCesiumEngine().zoomOut()}
          >
            −
          </button>
          <button
            type="button"
            className="zoom-btn"
            onClick={() => {
              if (activeRoute) {
                flyCameraToBounds(
                  activeRoute.center[0],
                  activeRoute.center[1] - 0.0007,
                  1700,
                  -58
                );
              }
            }}
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Bottom 12-Waypoint Ribbon */}
      <div className="m09-wp-ribbon">
        {(activeRoute?.waypoints ?? []).map((wp, idx) => (
          <div
            key={`${wp.no}-${idx}`}
            className={`m09-wp-chip ${idx === safeWpIdx ? 'active' : ''}`}
            title={`${wp.no} ${wp.name}`}
            onClick={() => setSelectedWpIdx(idx)}
          >
            <div className="m09-wp-chip-no">{wp.no}</div>
            <div className="m09-wp-chip-name">{wp.name}</div>
          </div>
        ))}
      </div>

      {/* Bottom Legend */}
      <div className="m09-map-legend">
        <div className="m09-legend-items">
          <span className="m09-legend-item">
            <span className="m09-line-solid" /> 规划航线
          </span>
          <span className="m09-legend-item">
            <span className="m09-line-dash-gold" /> 巡检范围
          </span>
        </div>
        <span>明水至北安段·地图与点位示意</span>
        <span>⊕ 北</span>
      </div>

      {showNewRoute ? (
        <NewRouteModal
          submitting={submitting}
          onSubmit={handleCreateRoute}
          onClose={() => setShowNewRoute(false)}
        />
      ) : null}

      {showHistory && activeRoute ? (
        <RouteHistoryModal route={activeRoute} onClose={() => setShowHistory(false)} />
      ) : null}
    </div>
  );
}
