'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ChevronRight,
  Crosshair,
  MapPin,
  Radio,
  Route,
  Warehouse,
} from 'lucide-react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  COVERAGE_ITEMS,
  SCENE_OPTIONS,
  SECTIONS,
  interpolateWaypoints,
  secLabel,
  statusTagClass,
  type MapPoiItem,
  type UavFleetDTO,
  type UavHangarDTO,
  type UavRouteDTO,
  type UavTaskDTO,
} from '../types';
import {
  FleetModal,
  HangarDetailModal,
  OverviewRecordModal,
  PoiDetailModal,
} from './UavModals';

interface OverviewResponse {
  hangars: UavHangarDTO[];
  allHangars: UavHangarDTO[];
  fleet: UavFleetDTO[];
  allFleet: UavFleetDTO[];
  pois: MapPoiItem[];
  primaryRoute: UavRouteDTO | null;
  coverageItems: typeof COVERAGE_ITEMS;
  activeMission: UavTaskDTO | null;
  recentTasks: UavTaskDTO[];
  taskKpis: { total: number; done: number; doing: number; todo: number; pendingOrg: number };
  hazardKpis: {
    pendingClues: number;
    confirmedHazards: number;
    recheckCount: number;
    closedCount: number;
  };
  deviceKpis: { onlineUav: number; totalUav: number; onlineHangar: number };
}

const PIN_SVG_DRONE = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0"/><path d="M5 5l4.2 4.2M19 5l-4.2 4.2M5 19l4.2-4.2M19 19l-4.2-4.2"/><circle cx="5" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="19" cy="19" r="2.6"/></svg>`;
const PIN_SVG_HANGAR = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8.5 8v8M15.5 8v8M8.5 12h7"/></svg>`;
const PIN_SVG_POI = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.4-6-10.2a6 6 0 1 1 12 0C18 15.6 12 21 12 21z"/><circle cx="12" cy="10.8" r="2.1"/></svg>`;

function flyCameraToBounds(
  lon: number,
  lat: number,
  rangeMeters: number,
  pitchDeg = -42,
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

export function OverviewSubPage({
  activeSectionId,
  onSectionChange,
  onNavigate,
  showToast,
}: {
  activeSectionId: string | null;
  onSectionChange: (secId: string | null) => void;
  onNavigate: (
    subPage: string,
    opts?: { taskStatus?: string; hazardStatus?: string; selectedTaskId?: string }
  ) => void;
  showToast: (msg: string) => void;
}) {
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);

  const [period, setPeriod] = useState('2026年11月');
  const [scene, setScene] = useState('全部场景');
  const [showRoutes, setShowRoutes] = useState(true);
  const [showHangars, setShowHangars] = useState(true);
  const [showPois, setShowPois] = useState(true);
  const [data, setData] = useState<OverviewResponse | null>(null);

  const [selectedPoi, setSelectedPoi] = useState<MapPoiItem | null>(null);
  const [selectedHangar, setSelectedHangar] = useState<UavHangarDTO | null>(null);
  const [showFleetModal, setShowFleetModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<UavTaskDTO | null>(null);

  const pinsLayerRef = useRef<HTMLDivElement | null>(null);
  const droneWpIdxRef = useRef<number>(6.35);
  const didInitialFlyRef = useRef(false);

  const secParam = activeSectionId ?? 'all';

  const loadData = useCallback(async () => {
    const qs = new URLSearchParams({
      sectionId: secParam,
      period,
      scene,
    });
    const res = await fetch(`/api/v1/m09/overview?${qs.toString()}`);
    if (res.ok) {
      const json = (await res.json()) as OverviewResponse;
      setData(json);
    }
  }, [secParam, period, scene]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  // Drone gentle animation timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      droneWpIdxRef.current = (droneWpIdxRef.current + 0.08) % 12;
    }, 240);
    return () => {
      window.clearInterval(timer);
    };
  }, []);

  // Fly camera on initial enter & section changes
  useEffect(() => {
    if (!cesiumReady) return;
    const engine = getGlobalCesiumEngine();
    if (!engine.ready) return;

    const timer = window.setTimeout(() => {
      if (activeSectionId) {
        engine.flyToSection(activeSectionId);
      } else {
        flyCameraToBounds(126.115, 47.508, didInitialFlyRef.current ? 1800 : 1850, -44);
      }
      didInitialFlyRef.current = true;
    }, 60);

    return () => {
      window.clearTimeout(timer);
    };
  }, [cesiumReady, activeSectionId]);

  // Cesium entities + projected HTML pins lifecycle
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (!cesiumReady || !engine.ready || !engine.viewer || !Cesium || !data) return;

    engine.applyLayers({
      satellite: true,
      uav: true,
      bim: false,
      pois: false,
      sections: false,
      route: true,
      designMode: false,
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

    const wps = data.primaryRoute?.waypoints ?? [];

    if (showRoutes && wps.length >= 7) {
      const flownDeg: number[] = [];
      for (let i = 0; i <= 6; i++) flownDeg.push(wps[i].lon, wps[i].lat);
      engine.trackModuleEntity('uav', {
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(flownDeg),
          width: 4.5,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#38f2ff'),
          }),
        },
      });

      const planDeg: number[] = [];
      for (let i = 6; i < wps.length; i++) planDeg.push(wps[i].lon, wps[i].lat);
      planDeg.push(wps[0].lon, wps[0].lat);
      engine.trackModuleEntity('uav', {
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(planDeg),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#e2e8f0').withAlpha(0.92),
            dashLength: 14,
          }),
        },
      });

      engine.trackModuleEntity('uav', {
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            125.915, 47.362, 125.982, 47.452, 126.115, 47.508, 125.992, 47.652,
          ]),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.85),
            dashLength: 12,
          }),
        },
      });

      engine.trackModuleEntity('uav', {
        position: new Cesium.CallbackProperty(() => {
          const p = interpolateWaypoints(wps, droneWpIdxRef.current);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }, false),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#38f2ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY,
        },
      });

      if (pinsLayer) {
        const droneEl = document.createElement('div');
        droneEl.className = 'm09-pin-anchor';
        droneEl.innerHTML = `
          <div class="m09-map-pin">
            <div class="m09-map-pill" style="border-color:#38f2ff;background:rgba(10,48,108,0.95);">
              ${PIN_SVG_DRONE}<span>无人机A01 · 执行中</span>
            </div>
            <div class="m09-map-stem"></div>
          </div>
        `;
        droneEl.addEventListener('click', () => onNavigate('live'));
        pinsLayer.appendChild(droneEl);
        htmlPins.push({
          el: droneEl,
          getCartesian: () => {
            const p = interpolateWaypoints(wps, droneWpIdxRef.current);
            return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
          },
        });
      }
    }

    if (showHangars) {
      data.hangars.forEach((h) => {
        engine.trackModuleEntity('uav', {
          position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, h.alt),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#22c55e'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        if (pinsLayer) {
          const el = document.createElement('div');
          el.className = 'm09-pin-anchor';
          el.innerHTML = `
            <div class="m09-map-pin">
              <div class="m09-map-pill green">${PIN_SVG_HANGAR}<span>${h.name}</span></div>
              <div class="m09-map-stem" style="background:#22c55e;"></div>
            </div>
          `;
          el.addEventListener('click', () => setSelectedHangar(h));
          pinsLayer.appendChild(el);
          htmlPins.push({
            el,
            cartesian: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, h.alt),
          });
        }
      });
    }

    if (showPois) {
      data.pois.forEach((poi) => {
        engine.trackModuleEntity('uav', {
          position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, poi.alt),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(poi.gold ? '#facc15' : '#38f2ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });

        if (pinsLayer) {
          const el = document.createElement('div');
          el.className = 'm09-pin-anchor';
          el.innerHTML = `
            <div class="m09-map-pin">
              <div class="m09-map-pill ${poi.gold ? 'gold' : ''}">${PIN_SVG_POI}<span>${poi.name}</span></div>
              <div class="m09-map-stem" style="${poi.gold ? 'background:#facc15;' : ''}"></div>
            </div>
          `;
          el.addEventListener('click', () => setSelectedPoi(poi));
          pinsLayer.appendChild(el);
          htmlPins.push({
            el,
            cartesian: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, poi.alt),
          });
        }
      });
    }

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
  }, [cesiumReady, data, showRoutes, showHangars, showPois, activeSectionId, onNavigate]);

  const tkKpis = data?.taskKpis ?? { total: 24, done: 16, doing: 1, todo: 4, pendingOrg: 3 };
  const hzKpis = data?.hazardKpis ?? {
    pendingClues: 4,
    confirmedHazards: 10,
    recheckCount: 2,
    closedCount: 6,
  };
  const devKpis = data?.deviceKpis ?? { onlineUav: 5, totalUav: 6, onlineHangar: 4 };
  const activeMission = data?.activeMission;
  const recent3 = data?.recentTasks ?? [];
  const covItems = data?.coverageItems ?? COVERAGE_ITEMS;
  const wpDone = 7;
  const wpPct = Math.round((wpDone / 12) * 100);

  return (
    <div className="m09-map-stage">
      <div ref={pinsLayerRef} className="m09-cesium-pins" />

      {/* Top Floating Filter & Layer Bar */}
      <div className="m09-map-topbar">
        <div className="m09-map-bar-left">
          <select
            className="m09-select"
            value={secParam}
            onChange={(e) => {
              const v = e.target.value;
              onSectionChange(v === 'all' ? null : v);
            }}
          >
            <option value="all">全部工区</option>
            {SECTIONS.map((sec) => (
              <option key={sec.id} value={sec.id}>
                {sec.name}
              </option>
            ))}
          </select>
          <select
            className="m09-select"
            value={period}
            onChange={(e) => {
              setPeriod(e.target.value);
              showToast(`已切换统计周期：${e.target.value}`);
            }}
          >
            <option value="2026年11月">2026年11月</option>
            <option value="2026年10月">2026年10月</option>
          </select>
          <select
            className="m09-select"
            value={scene}
            onChange={(e) => setScene(e.target.value)}
          >
            {SCENE_OPTIONS.map((sc) => (
              <option key={sc} value={sc}>
                {sc}
              </option>
            ))}
          </select>
        </div>

        <div className="m09-map-bar-right" style={{ fontSize: '12px', color: '#dbeafe' }}>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showRoutes}
              onChange={(e) => setShowRoutes(e.target.checked)}
              style={{ accentColor: '#22d3ee' }}
            />
            航线
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showHangars}
              onChange={(e) => setShowHangars(e.target.checked)}
              style={{ accentColor: '#22d3ee' }}
            />
            机巢
          </label>
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={showPois}
              onChange={(e) => setShowPois(e.target.checked)}
              style={{ accentColor: '#22d3ee' }}
            />
            工程点位
          </label>
          <button
            type="button"
            className="m09-btn"
            style={{ padding: '4px 10px' }}
            onClick={() => {
              onSectionChange(null);
              setScene('全部场景');
              const engine = getGlobalCesiumEngine();
              if (engine.ready) engine.flyToOverview(1.2);
              showToast('已恢复全线三维视图');
            }}
          >
            <Crosshair size={13} />
            全线视图
          </button>
        </div>
      </div>

      {/* Left HUD Column */}
      <div className="hud-left-col" style={{ width: '264px' }}>
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">巡检任务</span>
            </div>
            <span className="panel-subtitle">11月</span>
          </div>
          <div className="panel-body">
            <div className="m09-kpi-2x2">
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('tasks', { taskStatus: '全部状态' })}
              >
                <div className="m09-kpi-mini-lbl">本期任务</div>
                <div className="m09-kpi-mini-val">
                  {tkKpis.total}
                  <span>项</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('tasks', { taskStatus: '已完成' })}
              >
                <div className="m09-kpi-mini-lbl">已完成</div>
                <div className="m09-kpi-mini-val green">
                  {tkKpis.done}
                  <span>项</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('tasks', { taskStatus: '执行中' })}
              >
                <div className="m09-kpi-mini-lbl">执行中</div>
                <div className="m09-kpi-mini-val">
                  {tkKpis.doing}
                  <span>项</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('tasks', { taskStatus: '待执行' })}
              >
                <div className="m09-kpi-mini-lbl">待执行</div>
                <div className="m09-kpi-mini-val gold">
                  {tkKpis.todo}
                  <span>项</span>
                </div>
              </div>
            </div>
            <div className="m09-panel-foot">
              <span>待整理 {tkKpis.pendingOrg} 项</span>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => onNavigate('tasks')}
              >
                查看任务 <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">设备状态</span>
            </div>
          </div>
          <div
            className="panel-body"
            style={{ cursor: 'pointer' }}
            title="点击查看无人机与机巢详细台账"
            onClick={() => setShowFleetModal(true)}
          >
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <Radio size={13} /> 无人机在线
              </span>
              <span className="m09-kv-v">
                {devKpis.onlineUav} / {devKpis.totalUav} 架
              </span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <Warehouse size={13} /> 机巢在线
              </span>
              <span className="m09-kv-v">
                {devKpis.onlineHangar} / {devKpis.onlineHangar} 座
              </span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <Radio size={13} /> 在线设备通信
              </span>
              <span className="m09-kv-v" style={{ color: '#22c55e' }}>
                正常
              </span>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">重点对象覆盖</span>
            </div>
            <span className="panel-subtitle">18 / 24 处</span>
          </div>
          <div className="panel-body">
            {covItems.map((item) => {
              const pct = Math.round((item.done / item.total) * 100);
              return (
                <div
                  key={item.name}
                  className="m09-cov-row"
                  onClick={() => {
                    const next = scene === item.scene ? '全部场景' : item.scene;
                    setScene(next);
                    const matchPoi = data?.pois.find((p) => p.scene === item.scene);
                    if (matchPoi) flyCameraToBounds(matchPoi.lon, matchPoi.lat, 1800, -40);
                  }}
                >
                  <div className="m09-cov-top">
                    <span>{item.name}</span>
                    <strong style={{ color: '#fff' }}>
                      {item.done} / {item.total}
                    </strong>
                  </div>
                  <div className="m09-cov-track">
                    <div className="m09-cov-fill" style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right HUD Column */}
      <div className="hud-right-col" style={{ width: '282px' }}>
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">实时任务</span>
            </div>
          </div>
          <div className="panel-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
              }}
            >
              <strong style={{ fontSize: '14.5px', color: '#fff' }}>
                {activeMission?.name ?? '料场全面巡检'}
              </strong>
              <span className="status-tag info">执行中</span>
            </div>
            <div style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: '3px 0 8px' }}>
              {activeMission?.id ?? 'UAV-20261126-02'}
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <MapPin size={13} /> 巡检对象
              </span>
              <span className="m09-kv-v">
                {secLabel(activeMission?.sectionId ?? 'sec2')}·
                {activeMission?.target ?? '料场示例A'}
              </span>
            </div>
            <div className="m09-kv-row">
              <span className="m09-kv-k">
                <Radio size={13} /> 执行设备
              </span>
              <span className="m09-kv-v">{activeMission?.uav ?? '无人机A01'}</span>
            </div>
            <div className="m09-kv-row" style={{ borderBottom: 'none' }}>
              <span className="m09-kv-k">
                <Route size={13} /> 已到达航点
              </span>
              <span className="m09-kv-v">{wpDone} / 12</span>
            </div>
            <div className="m09-cov-track" style={{ margin: '4px 0 8px' }}>
              <div className="m09-cov-fill" style={{ width: `${wpPct}%` }} />
            </div>
            <div className="m09-panel-foot" style={{ justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => onNavigate('live')}
              >
                进入实时巡检 <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">隐患统计</span>
            </div>
          </div>
          <div className="panel-body">
            <div className="m09-kpi-2x2">
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('hazards', { hazardStatus: '待核查' })}
              >
                <div className="m09-kpi-mini-lbl">待核查线索</div>
                <div className="m09-kpi-mini-val gold">
                  {hzKpis.pendingClues}
                  <span>条</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('hazards', { hazardStatus: '已确认隐患' })}
              >
                <div className="m09-kpi-mini-lbl">已确认隐患</div>
                <div className="m09-kpi-mini-val">
                  {hzKpis.confirmedHazards}
                  <span>项</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('hazards', { hazardStatus: '全部状态' })}
              >
                <div className="m09-kpi-mini-lbl">待复查</div>
                <div className="m09-kpi-mini-val gold">
                  {hzKpis.recheckCount}
                  <span>项</span>
                </div>
              </div>
              <div
                className="m09-kpi-mini"
                onClick={() => onNavigate('hazards', { hazardStatus: '全部状态' })}
              >
                <div className="m09-kpi-mini-lbl">已销项</div>
                <div className="m09-kpi-mini-val">
                  {hzKpis.closedCount}
                  <span>项</span>
                </div>
              </div>
            </div>
            <div className="m09-panel-foot">
              <span>整改中 {hzKpis.recheckCount} 项</span>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => onNavigate('hazards')}
              >
                查看隐患识别 <ChevronRight size={13} />
              </button>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">近期巡检记录</span>
            </div>
          </div>
          <div className="panel-body" style={{ paddingTop: '6px' }}>
            {recent3.map((r) => (
              <div
                key={r.id}
                className="m09-kv-row"
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedRecord(r)}
              >
                <div>
                  <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#eaf4ff' }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    {r.shortTime} &nbsp; {secLabel(r.sectionId)}
                  </div>
                </div>
                <span className={`status-tag ${statusTagClass(r.status)}`}>{r.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Map Zoom Controls */}
      <div className="m09-map-zoom">
        <div className="zoom-pill vertical">
          <button
            type="button"
            className="zoom-btn"
            title="放大"
            onClick={() => getGlobalCesiumEngine().zoomIn()}
          >
            +
          </button>
          <button
            type="button"
            className="zoom-btn"
            title="缩小"
            onClick={() => getGlobalCesiumEngine().zoomOut()}
          >
            −
          </button>
          <button
            type="button"
            className="zoom-btn"
            title="定位重点巡检区"
            onClick={() => {
              flyCameraToBounds(126.115, 47.508, 1600, -44);
              showToast('已定位至二工区·料场示例A巡检区');
            }}
          >
            <Crosshair size={14} />
          </button>
        </div>
      </div>

      {/* Bottom Legend Strip */}
      <div className="m09-map-legend">
        <div className="m09-legend-items">
          <span className="m09-legend-item">
            <span className="m09-line-solid" /> 已飞航迹
          </span>
          <span className="m09-legend-item">
            <span className="m09-line-dash" /> 规划航线
          </span>
        </div>
        <span>明水至北安段·地图与点位示意</span>
        <span>⊕ 北</span>
      </div>

      {selectedPoi ? (
        <PoiDetailModal
          poi={selectedPoi}
          onClose={() => setSelectedPoi(null)}
          onNavigate={(sp) => onNavigate(sp)}
        />
      ) : null}

      {selectedHangar ? (
        <HangarDetailModal
          hangar={selectedHangar}
          onClose={() => setSelectedHangar(null)}
        />
      ) : null}

      {showFleetModal && data ? (
        <FleetModal
          fleet={data.allFleet}
          hangars={data.allHangars}
          onClose={() => setShowFleetModal(false)}
        />
      ) : null}

      {selectedRecord ? (
        <OverviewRecordModal
          task={selectedRecord}
          onClose={() => setSelectedRecord(null)}
          onNavigate={(sp) => onNavigate(sp, { selectedTaskId: selectedRecord.id })}
        />
      ) : null}
    </div>
  );
}
