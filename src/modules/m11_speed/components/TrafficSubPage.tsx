'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Layers, LocateFixed } from 'lucide-react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  fmtComma,
  type DirectionKey,
  type SpeedOverviewResponse,
  type SpeedPilotSegmentDTO,
} from '../types';
import {
  drawTrafficCameraFrame,
  flyToAllPilotSegments,
  flyToPilotSegment,
  syncCesiumSpeedEntities,
  type SpeedMapLayerConfig,
} from './SpeedCesiumHelper';
import { TrafficVideoModal } from './SpeedModals';

export function TrafficSubPage({
  activeSectionId,
  cesiumReady,
  onNavigateAlgorithm,
  showToast,
}: {
  activeSectionId: string | null;
  cesiumReady: boolean;
  onNavigateAlgorithm: (segId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [data, setData] = useState<SpeedOverviewResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [segFilter, setSegFilter] = useState<string>('all');
  const [direction, setDirection] = useState<DirectionKey>('beian');
  const [selectedSegId, setSelectedSegId] = useState<string>('QD-01');
  const [showLayersPopover, setShowLayersPopover] = useState(false);
  const [layers, setLayers] = useState<SpeedMapLayerConfig>({
    corridor: true,
    attention: true,
    markers: true,
    satellite: true,
    sections: false,
  });
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  const camCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const camTickRef = useRef(0);
  const markersLayerRef = useRef<HTMLDivElement | null>(null);
  const pinElsRef = useRef<Record<string, HTMLDivElement | null>>({});
  const didInitialFlyRef = useRef(false);

  const fetchOverview = useCallback(async () => {
    try {
      const qs = new URLSearchParams();
      if (activeSectionId) qs.set('sectionId', activeSectionId);
      qs.set('direction', direction);
      if (segFilter !== 'all') qs.set('segmentId', segFilter);
      const res = await fetch(`/api/v1/m11/overview?${qs.toString()}`, {
        cache: 'no-store',
      });
      if (!res.ok) return;
      const json = (await res.json()) as SpeedOverviewResponse;
      setData(json);
      if (json.segments.length > 0) {
        setSelectedSegId((prev) =>
          json.segments.some((s) => s.id === prev) ? prev : json.segments[0].id
        );
      }
    } finally {
      setLoading(false);
    }
  }, [activeSectionId, direction, segFilter]);

  useEffect(() => {
    void fetchOverview();
  }, [fetchOverview]);

  const segments = useMemo(() => data?.segments ?? [], [data]);
  const allSegments = useMemo(() => data?.allSegments ?? [], [data]);

  const selectedSeg: SpeedPilotSegmentDTO | null = useMemo(() => {
    return (
      allSegments.find((s) => s.id === selectedSegId) ??
      segments[0] ??
      allSegments[0] ??
      null
    );
  }, [allSegments, segments, selectedSegId]);

  const selectedDir = selectedSeg ? selectedSeg.directions[direction] : null;
  const dirLabel = direction === 'beian' ? '北安方向' : '明水方向';

  // Camera flight on initial mount or section change
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready) return;
    const timer = window.setTimeout(() => {
      if (activeSectionId) {
        engine.flyToSection(activeSectionId);
      } else {
        flyToAllPilotSegments(false);
      }
      didInitialFlyRef.current = true;
    }, 60);
    return () => window.clearTimeout(timer);
  }, [cesiumReady, activeSectionId]);

  // Sync Cesium entities & projected pins with postRender cleanup
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (!allSegments.length) return;

    const attentionSegIds = allSegments
      .filter((s) => s.directions[direction].attention)
      .map((s) => s.id);

    if (cesiumReady && engine.ready && engine.viewer && Cesium) {
      syncCesiumSpeedEntities({
        layersCfg: layers,
        segments: allSegments,
        attentionSegIds,
        activeSectionId,
      });
    }

    const updatePositions = () => {
      const layerEl = markersLayerRef.current;
      if (!layerEl) return;
      const w = layerEl.clientWidth || window.innerWidth;
      const h = layerEl.clientHeight || window.innerHeight;
      const ready = Boolean(cesiumReady && engine.ready && engine.viewer && Cesium);

      allSegments.forEach((seg) => {
        const pin = pinElsRef.current[seg.id];
        if (!pin) return;
        if (ready) {
          const cart = Cesium.Cartesian3.fromDegrees(
            seg.lon,
            seg.lat,
            seg.alt + 12
          );
          const toWin =
            Cesium.SceneTransforms.worldToWindowCoordinates ||
            Cesium.SceneTransforms.wgs84ToWindowCoordinates;
          const win = toWin(engine.viewer.scene, cart);
          if (
            win &&
            Number.isFinite(win.x) &&
            Number.isFinite(win.y) &&
            win.x >= 245 &&
            win.x <= w - 275 &&
            win.y >= 28 &&
            win.y <= h - 28
          ) {
            pin.style.display = 'flex';
            pin.style.left = `${win.x.toFixed(1)}px`;
            pin.style.top = `${win.y.toFixed(1)}px`;
          } else {
            pin.style.display = 'none';
          }
        } else {
          pin.style.display = 'flex';
          pin.style.left = `${seg.fallbackPct.x}%`;
          pin.style.top = `${seg.fallbackPct.y}%`;
        }
      });
    };

    updatePositions();

    let removePostRender: (() => void) | null = null;
    if (cesiumReady && engine.ready && engine.viewer) {
      removePostRender =
        engine.viewer.scene.postRender.addEventListener(updatePositions);
    }

    return () => {
      if (removePostRender) {
        try {
          removePostRender();
        } catch {
          // ignore
        }
      }
    };
  }, [cesiumReady, allSegments, layers, direction, activeSectionId]);

  // Clear module entities on unmount
  useEffect(() => {
    return () => {
      getGlobalCesiumEngine().clearModuleEntities('speed');
    };
  }, []);

  // Roadside camera animated canvas
  useEffect(() => {
    if (!selectedSeg || !selectedDir) return;
    camTickRef.current = 0;
    drawTrafficCameraFrame(
      camCanvasRef.current,
      selectedSeg,
      selectedDir,
      camTickRef.current
    );
    const timer = window.setInterval(() => {
      camTickRef.current += 1;
      drawTrafficCameraFrame(
        camCanvasRef.current,
        selectedSeg,
        selectedDir,
        camTickRef.current
      );
    }, 90);
    return () => window.clearInterval(timer);
  }, [selectedSeg, selectedDir]);

  const handleSelectSeg = (seg: SpeedPilotSegmentDTO) => {
    setSelectedSegId(seg.id);
    flyToPilotSegment(seg, false);
  };

  const summary = data?.summary ?? {
    segmentCount: 4,
    totalLengthKm: 5.2,
    avgSpeed: 66.5,
    totalFlow: 3500,
    attentionCount: 2,
    maxQueueM: 460,
  };

  return (
    <div className="m11-map-stage">
      {/* LEFT HUD */}
      <aside className="hud-left-col">
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">受限路段运行概况</span>
            </div>
            <span className="m11-hud-head-meta">10:05</span>
          </div>
          <div className="panel-body">
            <div className="m11-kpi-grid-3x2">
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">试点区段</div>
                <div className="m11-mini-kpi-val">
                  {summary.segmentCount}
                  <span className="m11-mini-kpi-unit">段</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">研究范围</div>
                <div className="m11-mini-kpi-val">
                  约 {summary.totalLengthKm.toFixed(1)}
                  <span className="m11-mini-kpi-unit">km</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">区段均速</div>
                <div className="m11-mini-kpi-val">
                  {summary.avgSpeed.toFixed(1)}
                  <span className="m11-mini-kpi-unit">km/h</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">监测流量</div>
                <div className="m11-mini-kpi-val">
                  {fmtComma(summary.totalFlow)}
                  <span className="m11-mini-kpi-unit">辆/h</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">需关注区段</div>
                <div
                  className={`m11-mini-kpi-val ${summary.attentionCount > 0 ? 'gold' : ''}`}
                >
                  {summary.attentionCount}
                  <span className="m11-mini-kpi-unit">段</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">最长队列</div>
                <div
                  className={`m11-mini-kpi-val ${summary.maxQueueM > 0 ? 'gold' : ''}`}
                >
                  {summary.maxQueueM}
                  <span className="m11-mini-kpi-unit">m</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">分区段运行</span>
            </div>
            <span className="m11-hud-head-meta">{dirLabel}</span>
          </div>
          <div className="panel-body">
            <div className="m11-seg-head">
              <span>试点区段 / 事件</span>
              <span>km/h</span>
              <span>辆/h</span>
            </div>
            <div className="m11-seg-list">
              {loading && segments.length === 0 ? (
                <div className="m11-empty-box">加载中...</div>
              ) : (
                segments.map((seg) => {
                  const d = seg.directions[direction];
                  const active = selectedSeg?.id === seg.id;
                  return (
                    <div
                      key={seg.id}
                      className={`m11-seg-row ${active ? 'active' : ''}`}
                      onClick={() => handleSelectSeg(seg)}
                    >
                      <div style={{ minWidth: 0 }}>
                        <div className="m11-seg-name">{seg.name}</div>
                        <div
                          className={`m11-seg-sub ${d.attention ? 'warn' : ''}`}
                        >
                          {d.eventDesc}
                        </div>
                      </div>
                      <div className="m11-seg-num">{d.avgSpeed}</div>
                      <div className="m11-seg-num">{d.flow}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* TOP FLOATING TOOLBAR */}
      <div className="m11-map-toolbar">
        <div className="m11-map-toolbar-left">
          <select
            className="m11-compact-select"
            value={segFilter}
            onChange={(e) => {
              const nextVal = e.target.value;
              setSegFilter(nextVal);
              if (nextVal !== 'all') {
                setSelectedSegId(nextVal);
                const found = allSegments.find((s) => s.id === nextVal);
                flyToPilotSegment(found, false);
              } else {
                flyToAllPilotSegments(false);
              }
            }}
          >
            <option value="all">全部试点区段</option>
            {allSegments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.id})
              </option>
            ))}
          </select>
          <select
            className="m11-compact-select"
            value={direction}
            onChange={(e) => setDirection(e.target.value as DirectionKey)}
          >
            <option value="beian">北安方向</option>
            <option value="mingshui">明水方向</option>
          </select>
          <span className="m11-toolbar-time">2026-11-26 10:05</span>
        </div>
        <div className="m11-map-toolbar-right">
          <button
            type="button"
            className="dock-btn"
            onClick={() => setShowLayersPopover((v) => !v)}
          >
            <Layers size={14} /> 图层
          </button>
          <button
            type="button"
            className="dock-btn"
            onClick={() => {
              if (selectedSeg) {
                flyToPilotSegment(selectedSeg, false);
                showToast(`已定位至 ${selectedSeg.name}（${selectedSeg.stake}）`);
              }
            }}
          >
            <LocateFixed size={14} /> 定位试点
          </button>
          {showLayersPopover ? (
            <div className="m11-layer-popover">
              <label className="m11-layer-item">
                <input
                  type="checkbox"
                  checked={layers.corridor}
                  onChange={(e) =>
                    setLayers((p) => ({ ...p, corridor: e.target.checked }))
                  }
                />
                监测走廊
              </label>
              <label className="m11-layer-item">
                <input
                  type="checkbox"
                  checked={layers.attention}
                  onChange={(e) =>
                    setLayers((p) => ({ ...p, attention: e.target.checked }))
                  }
                />
                需关注区段
              </label>
              <label className="m11-layer-item">
                <input
                  type="checkbox"
                  checked={layers.markers}
                  onChange={(e) =>
                    setLayers((p) => ({ ...p, markers: e.target.checked }))
                  }
                />
                试点标注
              </label>
              <label className="m11-layer-item">
                <input
                  type="checkbox"
                  checked={layers.satellite}
                  onChange={(e) =>
                    setLayers((p) => ({ ...p, satellite: e.target.checked }))
                  }
                />
                卫星影像底图
              </label>
              <label className="m11-layer-item">
                <input
                  type="checkbox"
                  checked={layers.sections}
                  onChange={(e) =>
                    setLayers((p) => ({ ...p, sections: e.target.checked }))
                  }
                />
                工区范围高亮
              </label>
            </div>
          ) : null}
        </div>
      </div>

      {/* ZOOM & LOCATE CONTROLS */}
      <div className="zoom-pill vertical m11-map-zoom">
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
          title="全线视角"
          onClick={() => flyToAllPilotSegments(false)}
        >
          <LocateFixed size={14} />
        </button>
      </div>

      {/* CESIUM PROJECTED MARKERS */}
      <div
        ref={markersLayerRef}
        className="m11-map-markers-layer"
        style={{ display: layers.markers ? 'block' : 'none' }}
      >
        {allSegments.map((seg) => {
          const d = seg.directions[direction];
          const isSel = selectedSeg?.id === seg.id;
          return (
            <div
              key={seg.id}
              ref={(el) => {
                pinElsRef.current[seg.id] = el;
              }}
              className={`m11-pin-wrap ${isSel ? 'active' : ''} ${d.attention ? 'warn' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                handleSelectSeg(seg);
              }}
            >
              <div className="m11-pin-label">{seg.name}</div>
              <div className="m11-pin-dot" />
              {isSel ? (
                <div className="m11-pin-popup">
                  <div className="m11-pin-popup-title">
                    {seg.id} {d.eventTitle}
                  </div>
                  <div className="m11-pin-popup-sub">
                    区段均速 {d.avgSpeed} km/h · 排队 {d.queueM} m
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* BOTTOM LEGEND */}
      <div className="m11-map-legend">
        <div className="m11-legend-items">
          <span>
            <i
              className="m11-legend-swatch"
              style={{ background: '#38f2ff' }}
            />
            监测走廊
          </span>
          <span>
            <i
              className="m11-legend-swatch"
              style={{ background: '#f59e0b' }}
            />
            需关注区段
          </span>
        </div>
        <span>明水至北安段 · 底图与试点位置示意</span>
        <span>↑ 北</span>
      </div>

      {/* RIGHT HUD */}
      {selectedSeg && selectedDir ? (
        <aside className="hud-right-col">
          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">选中试点区段</span>
              </div>
            </div>
            <div className="panel-body">
              <div className="m11-seg-insp-top">
                <span className="m11-seg-insp-title">
                  {selectedSeg.name} · {selectedSeg.id}
                </span>
                <span
                  className={
                    selectedDir.attention ? 'm11-pill-warn' : 'm11-pill-ok'
                  }
                >
                  {selectedDir.statusLabel}
                </span>
              </div>
              <div className="m11-lane-cards-3">
                <div className="m11-lane-mini">
                  <div className="m11-lane-mini-lbl">内侧实测车速</div>
                  <div className="m11-lane-mini-val">
                    {selectedDir.innerSpeed}
                    <span className="m11-mini-kpi-unit">km/h</span>
                  </div>
                </div>
                <div className="m11-lane-mini">
                  <div className="m11-lane-mini-lbl">外侧实测车速</div>
                  <div className="m11-lane-mini-val">
                    {selectedDir.outerSpeed}
                    <span className="m11-mini-kpi-unit">km/h</span>
                  </div>
                </div>
                <div
                  className={`m11-lane-mini ${selectedDir.shoulderOccupied ? 'occupied' : ''}`}
                >
                  <div className="m11-lane-mini-lbl">硬路肩</div>
                  <div className="m11-lane-mini-val">
                    {selectedDir.shoulderStatus}
                  </div>
                </div>
              </div>
              <div className="m11-kv-rows">
                <div className="m11-kv-row">
                  <span className="m11-kv-k">识别时间</span>
                  <span className="m11-kv-v">{selectedDir.detectTime}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">感知来源</span>
                  <span className="m11-kv-v">{selectedDir.source}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">实测排队</span>
                  <span className="m11-kv-v">{selectedDir.queueM} m</span>
                </div>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-header">
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">气象、路面与视频</span>
              </div>
              <button
                type="button"
                className="m11-hud-link"
                onClick={() => setVideoModalOpen(true)}
              >
                关联视频 &gt;
              </button>
            </div>
            <div className="panel-body">
              <div className="m11-kv-rows">
                <div className="m11-kv-row">
                  <span className="m11-kv-k">气温</span>
                  <span className="m11-kv-v">{selectedSeg.weather.temp}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">能见度</span>
                  <span className="m11-kv-v">{selectedSeg.weather.vis}</span>
                </div>
                <div className="m11-kv-row">
                  <span className="m11-kv-k">路面状态</span>
                  <span className="m11-kv-v">{selectedSeg.weather.road}</span>
                </div>
              </div>
              <div
                className="m11-cam-box"
                title="点击放大查看关联路侧视频与雷达详情"
                onClick={() => setVideoModalOpen(true)}
              >
                <canvas ref={camCanvasRef} width={320} height={156} />
              </div>
            </div>
          </div>
        </aside>
      ) : null}

      {videoModalOpen && selectedSeg && selectedDir ? (
        <TrafficVideoModal
          segment={selectedSeg}
          dirData={selectedDir}
          initialTick={camTickRef.current}
          onClose={() => setVideoModalOpen(false)}
          onGoAlgorithm={() => onNavigateAlgorithm(selectedSeg.id)}
        />
      ) : null}
    </div>
  );
}
