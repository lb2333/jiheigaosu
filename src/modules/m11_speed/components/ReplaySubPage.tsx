'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Layers,
  LocateFixed,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  formatMinClock,
  formatPlayTimeMMSS,
  type SpeedPilotSegmentDTO,
  type SpeedReplayScenarioDTO,
  type SpeedReplaysResponse,
} from '../types';
import {
  flyToAllPilotSegments,
  flyToPilotSegment,
  syncCesiumSpeedEntities,
  type SpeedMapLayerConfig,
} from './SpeedCesiumHelper';
import { ReplayLinkedModal } from './SpeedModals';

function ReplaySvgChart({
  scenario,
  currentMin,
}: {
  scenario: SpeedReplayScenarioDTO;
  currentMin: number;
}) {
  const W = 720;
  const H = 148;
  const padL = 36;
  const padR = 16;
  const padT = 14;
  const padB = 24;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const yMin = 40;
  const yMax = 90;

  const totalMin = scenario.durationMin;
  const xAtMin = (m: number) =>
    padL + (Math.min(totalMin, Math.max(0, m)) / totalMin) * plotW;
  const yAtVal = (v: number) =>
    padT +
    (1 - (Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin)) * plotH;

  const measuredPts = scenario.measuredInner
    .map((v, i) => `${xAtMin(i).toFixed(1)},${yAtVal(v).toFixed(1)}`)
    .join(' ');

  let stepD = '';
  scenario.publishedInner.forEach((v, i) => {
    const x = xAtMin(i).toFixed(1);
    const y = yAtVal(v).toFixed(1);
    if (i === 0) {
      stepD = `M ${x} ${y}`;
    } else {
      const prevY = yAtVal(scenario.publishedInner[i - 1]).toFixed(1);
      stepD += ` L ${x} ${prevY} L ${x} ${y}`;
    }
  });

  const sugStart = Math.max(0, Math.min(totalMin, scenario.suggestStartMin));
  const sugPts = scenario.suggestInner
    .map((v, i) => ({ v, i }))
    .filter((p) => p.i >= sugStart)
    .map((p) => `${xAtMin(p.i).toFixed(1)},${yAtVal(p.v).toFixed(1)}`)
    .join(' ');

  const phX = xAtMin(currentMin);
  const idxFloor = Math.min(
    scenario.measuredInner.length - 1,
    Math.max(0, Math.floor(currentMin))
  );
  const idxCeil = Math.min(scenario.measuredInner.length - 1, idxFloor + 1);
  const frac = currentMin - idxFloor;
  const curVal =
    scenario.measuredInner[idxFloor] * (1 - frac) +
    scenario.measuredInner[idxCeil] * frac;
  const phY = yAtVal(curVal);

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    >
      {[40, 50, 60, 70, 80, 90].map((v) => {
        const y = yAtVal(v);
        return (
          <g key={v}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(125,211,252,0.14)"
              strokeWidth={1}
            />
            <text
              x={padL - 7}
              y={y + 3.5}
              textAnchor="end"
              fill="#8fb4db"
              fontSize={10.5}
            >
              {v}
            </text>
          </g>
        );
      })}
      {scenario.xTicks.map((lbl, idx) => {
        const m = (idx / (scenario.xTicks.length - 1)) * totalMin;
        return (
          <text
            key={`${lbl}-${idx}`}
            x={xAtMin(m)}
            y={H - 6}
            textAnchor="middle"
            fill="#9dc2e8"
            fontSize={10.5}
          >
            {lbl}
          </text>
        );
      })}
      <path d={stepD} fill="none" stroke="#8b5cf6" strokeWidth={2.1} />
      <polyline
        fill="none"
        stroke="#facc15"
        strokeWidth={2}
        strokeDasharray="5 4"
        points={sugPts}
      />
      <polyline
        fill="none"
        stroke="#22d3ee"
        strokeWidth={2.4}
        points={measuredPts}
      />
      <line
        x1={phX}
        y1={padT}
        x2={phX}
        y2={padT + plotH}
        stroke="rgba(226,240,255,0.65)"
        strokeWidth={1.2}
        strokeDasharray="3 3"
      />
      <circle
        cx={phX}
        cy={phY}
        r={4.2}
        fill="#ffffff"
        stroke="#22d3ee"
        strokeWidth={2.2}
      />
    </svg>
  );
}

export function ReplaySubPage({
  activeSectionId,
  cesiumReady,
  onNavigateAlgorithm,
  onNavigateFeedback,
  showToast,
}: {
  activeSectionId: string | null;
  cesiumReady: boolean;
  onNavigateAlgorithm: () => void;
  onNavigateFeedback: (segId: string) => void;
  showToast: (msg: string) => void;
}) {
  const [data, setData] = useState<SpeedReplaysResponse | null>(null);
  const [selectedId, setSelectedId] = useState<string>('RP-20261126-01');
  const [playing, setPlaying] = useState<boolean>(false);
  const [currentMin, setCurrentMin] = useState<number>(10);
  const [showLayersPopover, setShowLayersPopover] = useState(false);
  const [layers, setLayers] = useState<SpeedMapLayerConfig>({
    corridor: true,
    attention: true,
    markers: true,
    satellite: true,
    sections: false,
  });
  const [linkedModalOpen, setLinkedModalOpen] = useState(false);

  const markersLayerRef = useRef<HTMLDivElement | null>(null);
  const pinElsRef = useRef<Record<string, HTMLDivElement | null>>({});

  const fetchReplays = useCallback(async () => {
    const res = await fetch('/api/v1/m11/replays', { cache: 'no-store' });
    if (!res.ok) return;
    const json = (await res.json()) as SpeedReplaysResponse;
    setData(json);
  }, []);

  useEffect(() => {
    void fetchReplays();
  }, [fetchReplays]);

  const scenarios = useMemo(() => data?.scenarios ?? [], [data]);
  const segments = useMemo(() => data?.segments ?? [], [data]);

  const activeSc: SpeedReplayScenarioDTO | null = useMemo(() => {
    return (
      scenarios.find((s) => s.id === selectedId) ?? scenarios[0] ?? null
    );
  }, [scenarios, selectedId]);

  const activeSeg: SpeedPilotSegmentDTO | null = useMemo(() => {
    if (!activeSc) return segments[0] ?? null;
    return segments.find((s) => s.id === activeSc.segId) ?? segments[0] ?? null;
  }, [activeSc, segments]);

  const matchingSecSegIds = useMemo(() => {
    if (!activeSectionId) return null;
    return new Set(
      segments.filter((s) => s.sectionId === activeSectionId).map((s) => s.id)
    );
  }, [activeSectionId, segments]);

  // Camera flight on initial mount or section change
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready) return;
    const timer = window.setTimeout(() => {
      if (activeSectionId) {
        engine.flyToSection(activeSectionId);
      } else {
        flyToAllPilotSegments(true);
      }
    }, 60);
    return () => window.clearTimeout(timer);
  }, [cesiumReady, activeSectionId]);

  // Sync Cesium entities & projected pins with postRender cleanup
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (!segments.length || !activeSc) return;

    if (cesiumReady && engine.ready && engine.viewer && Cesium) {
      syncCesiumSpeedEntities({
        layersCfg: layers,
        segments,
        attentionSegIds: [activeSc.segId],
        activeSectionId,
      });
    }

    const updatePositions = () => {
      const layerEl = markersLayerRef.current;
      if (!layerEl) return;
      const w = layerEl.clientWidth || window.innerWidth;
      const h = layerEl.clientHeight || window.innerHeight;
      const ready = Boolean(cesiumReady && engine.ready && engine.viewer && Cesium);

      segments.forEach((seg) => {
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
  }, [cesiumReady, segments, layers, activeSc, activeSectionId]);

  // Clear module entities on unmount
  useEffect(() => {
    return () => {
      getGlobalCesiumEngine().clearModuleEntities('speed');
    };
  }, []);

  // Playback timer
  useEffect(() => {
    if (!playing || !activeSc) return;
    const timer = window.setInterval(() => {
      setCurrentMin((prev) => {
        const next = +(prev + 0.5).toFixed(1);
        if (next >= activeSc.durationMin) {
          setPlaying(false);
          showToast(`【${activeSc.title}】场景回放演示完成`);
          return activeSc.durationMin;
        }
        return next;
      });
    }, 550);
    return () => window.clearInterval(timer);
  }, [playing, activeSc, showToast]);

  const selectScenario = (sc: SpeedReplayScenarioDTO) => {
    setSelectedId(sc.id);
    setCurrentMin(sc.defaultMin);
    setPlaying(false);
    const seg = segments.find((s) => s.id === sc.segId);
    flyToPilotSegment(seg, true);
  };

  if (!activeSc) {
    return (
      <div className="m11-map-stage">
        <aside className="hud-left-col">
          <div className="glass-panel">
            <div className="panel-body">
              <div className="m11-empty-box">正在加载场景回放...</div>
            </div>
          </div>
        </aside>
      </div>
    );
  }

  const curIdx = Math.min(
    activeSc.measuredInner.length - 1,
    Math.max(0, Math.round(currentMin))
  );
  const mIn = Math.round(activeSc.measuredInner[curIdx]);
  const mOut = Math.round(activeSc.measuredOuter[curIdx]);
  const sIn = activeSc.suggestInner[curIdx];
  const sOut = activeSc.suggestOuter[curIdx];
  const pIn = activeSc.publishedInner[curIdx];
  const pOut = activeSc.publishedOuter[curIdx];
  const qLen = activeSc.queueSeries[curIdx];
  const curClock = formatMinClock(activeSc.xTicks, currentMin);

  return (
    <div className="m11-map-stage">
      {/* LEFT HUD: 5 SCENARIOS */}
      <aside className="hud-left-col">
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">场景记录</span>
            </div>
            <span className="m11-hud-head-meta">{scenarios.length} 个示例</span>
          </div>
          <div className="panel-body">
            <div className="m11-algo-list">
              {scenarios.map((sc) => {
                const isSel = sc.id === activeSc.id;
                const modeCls =
                  sc.mode === '实际回放' ? 'm11-pill-info' : 'm11-pill-warn';
                const secMatch =
                  !matchingSecSegIds || matchingSecSegIds.has(sc.segId);
                return (
                  <div
                    key={sc.id}
                    className={`m11-algo-card ${isSel ? 'active' : ''}`}
                    style={secMatch ? undefined : { opacity: 0.6 }}
                    onClick={() => selectScenario(sc)}
                  >
                    <div className="m11-algo-card-top">
                      <span className="m11-algo-id">{sc.title}</span>
                      <span className={modeCls}>{sc.mode}</span>
                    </div>
                    <div className="m11-algo-meta">{sc.id}</div>
                    <div className="m11-algo-meta" style={{ color: '#d6e9ff' }}>
                      {sc.segName}
                    </div>
                    <div className="m11-algo-meta">{sc.dateRangeLabel}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {/* TOP FLOATING TOOLBAR */}
      <div className="m11-map-toolbar">
        <div className="m11-map-toolbar-left">
          <div className="dual-seg">
            <button
              type="button"
              className={`dual-seg-btn ${activeSc.mode === '实际回放' ? 'active' : ''}`}
              onClick={() => {
                const firstReal = scenarios.find((s) => s.mode === '实际回放');
                if (firstReal && activeSc.mode !== '实际回放') {
                  selectScenario(firstReal);
                }
              }}
            >
              实际回放
            </button>
            <button
              type="button"
              className={`dual-seg-btn ${activeSc.mode === '模拟演示' ? 'active' : ''}`}
              onClick={() => {
                const firstSim = scenarios.find((s) => s.mode === '模拟演示');
                if (firstSim && activeSc.mode !== '模拟演示') {
                  selectScenario(firstSim);
                }
              }}
            >
              模拟演示
            </button>
          </div>
          <select
            className="m11-compact-select"
            value={activeSc.segId}
            onChange={(e) => {
              const targetSegId = e.target.value;
              const match = scenarios.find((s) => s.segId === targetSegId);
              if (match) {
                selectScenario(match);
              } else {
                const seg = segments.find((s) => s.id === targetSegId);
                flyToPilotSegment(seg, true);
                if (seg) showToast(`已定位至 ${seg.name}`);
              }
            }}
          >
            {segments.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
          <span className="m11-toolbar-time">{activeSc.windowLabel}</span>
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
              flyToPilotSegment(activeSeg ?? undefined, true);
              if (activeSeg) showToast(`已定位至回放区段：${activeSeg.name}`);
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
                回放焦点区段
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
          onClick={() => flyToAllPilotSegments(true)}
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
        {segments.map((seg) => {
          const isSel = seg.id === activeSc.segId;
          return (
            <div
              key={seg.id}
              ref={(el) => {
                pinElsRef.current[seg.id] = el;
              }}
              className={`m11-pin-wrap ${isSel ? 'active warn' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                const match = scenarios.find((s) => s.segId === seg.id);
                if (match) {
                  selectScenario(match);
                } else {
                  flyToPilotSegment(seg, true);
                }
              }}
            >
              <div className="m11-pin-label">{seg.name}</div>
              <div className="m11-pin-dot" />
              {isSel ? (
                <div className="m11-pin-popup">
                  <div className="m11-pin-popup-title">{activeSc.title}</div>
                  <div className="m11-pin-popup-sub">
                    回放时点 {curClock} · {activeSc.popupSub}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      {/* BOTTOM FLOATING REPLAY CHART DOCK */}
      <div className="m11-replay-dock">
        <div className="m11-seg-insp-top" style={{ marginBottom: '4px' }}>
          <div className="panel-title-group">
            <span className="panel-accent-bar" />
            <span className="panel-title" style={{ fontSize: '13.5px' }}>
              {activeSc.chartTitle}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              className={
                activeSc.mode === '实际回放'
                  ? 'm11-pill-info'
                  : 'm11-pill-warn'
              }
            >
              {activeSc.mode}
            </span>
            <span style={{ fontSize: '11px', color: '#9dc2e8' }}>
              内侧车道 · 单位 km/h
            </span>
          </div>
        </div>

        <ReplaySvgChart scenario={activeSc} currentMin={currentMin} />

        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '18px',
            fontSize: '11px',
            color: '#c9e2fb',
            marginTop: '1px',
          }}
        >
          <span>
            <i
              className="m11-legend-swatch"
              style={{ background: '#22d3ee' }}
            />
            内侧实测车速
          </span>
          <span>
            <i
              className="m11-legend-swatch"
              style={{
                background: 'none',
                borderTop: '2px dashed #facc15',
              }}
            />
            内侧算法建议
          </span>
          <span>
            <i
              className="m11-legend-swatch"
              style={{ background: '#8b5cf6' }}
            />
            内侧已发布限速
          </span>
        </div>

        <div className="m11-replay-controls">
          <button
            type="button"
            className="m11-replay-btn"
            title={playing ? '暂停' : '播放'}
            onClick={() => {
              if (!playing && currentMin >= activeSc.durationMin) {
                setCurrentMin(0);
              }
              setPlaying((p) => !p);
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            className="m11-replay-btn"
            title="重置到关键时点"
            onClick={() => {
              setPlaying(false);
              setCurrentMin(activeSc.defaultMin);
            }}
          >
            <RotateCcw size={13} />
          </button>
          <input
            type="range"
            className="m11-replay-slider"
            min={0}
            max={activeSc.durationMin}
            step={0.5}
            value={currentMin}
            onChange={(e) => setCurrentMin(Number.parseFloat(e.target.value))}
          />
          <span
            style={{
              fontSize: '11.5px',
              color: '#b8d7f7',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formatPlayTimeMMSS(currentMin)} /{' '}
            {formatPlayTimeMMSS(activeSc.durationMin)}
          </span>
          <strong
            style={{
              fontSize: '13px',
              color: '#38f2ff',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {curClock}
          </strong>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            padding: '2px 86px 0 80px',
            fontSize: '10.5px',
            color: '#8fb4db',
          }}
        >
          {activeSc.xTicks.map((t, i) => (
            <span
              key={`${t}-${i}`}
              style={
                i === 2 ? { color: '#38f2ff', fontWeight: 700 } : undefined
              }
            >
              {t}
            </span>
          ))}
        </div>
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

      {/* RIGHT HUD: REPLAY METRICS & 5-STEP TIMELINE */}
      <aside className="hud-right-col">
        <div className="glass-panel">
          <div className="panel-header">
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">回放时点 {curClock}</span>
            </div>
            <span className="m11-hud-head-meta">{activeSc.sampleTag}</span>
          </div>
          <div className="panel-body">
            <div className="m11-kpi-grid-3x2">
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">实测 内侧 / 外侧</div>
                <div
                  className="m11-mini-kpi-val"
                  style={{ fontSize: '15px' }}
                >
                  {mIn} / {mOut}
                  <span className="m11-mini-kpi-unit">km/h</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">建议 内侧 / 外侧</div>
                <div
                  className="m11-mini-kpi-val gold"
                  style={{ fontSize: '15px' }}
                >
                  {sIn} / {sOut}
                  <span className="m11-mini-kpi-unit">km/h</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">发布 内侧 / 外侧</div>
                <div
                  className="m11-mini-kpi-val"
                  style={{ fontSize: '15px' }}
                >
                  {pIn} / {pOut}
                  <span className="m11-mini-kpi-unit">km/h</span>
                </div>
              </div>
              <div className="m11-mini-kpi">
                <div className="m11-mini-kpi-label">实测排队</div>
                <div
                  className="m11-mini-kpi-val"
                  style={{ fontSize: '15px' }}
                >
                  {qLen}
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
              <span className="panel-title">风险、策略与回执</span>
            </div>
            <button
              type="button"
              className="m11-hud-link"
              onClick={() => setLinkedModalOpen(true)}
            >
              查看关联记录 &gt;
            </button>
          </div>
          <div className="panel-body">
            <div className="timeline-list">
              {activeSc.timeline.map((step, idx) => {
                const isVisited = currentMin >= step.min;
                const nextStep = activeSc.timeline[idx + 1];
                const isCurrent =
                  isVisited && (!nextStep || currentMin < nextStep.min);
                return (
                  <div
                    key={`${step.clock}-${idx}`}
                    className={`timeline-item ${isCurrent ? 'active' : isVisited ? 'visited' : ''}`}
                    style={{ alignItems: 'flex-start' }}
                    onClick={() => setCurrentMin(step.min)}
                  >
                    <div
                      className="timeline-node"
                      style={{ marginTop: '3px' }}
                    />
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                        }}
                      >
                        <span
                          style={{
                            fontSize: '11px',
                            color: '#38f2ff',
                            fontWeight: 700,
                            fontVariantNumeric: 'tabular-nums',
                          }}
                        >
                          {step.clock}
                        </span>
                        <span
                          style={{
                            fontSize: '12px',
                            fontWeight: 700,
                            color: '#fff',
                          }}
                        >
                          {step.title}
                        </span>
                      </div>
                      <div
                        className="timeline-sub"
                        style={{ marginTop: '2px' }}
                      >
                        {step.desc}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </aside>

      {linkedModalOpen ? (
        <ReplayLinkedModal
          scenario={activeSc}
          currentMin={currentMin}
          onClose={() => setLinkedModalOpen(false)}
          onGoAlgorithm={onNavigateAlgorithm}
          onGoFeedback={() => onNavigateFeedback(activeSc.segId)}
        />
      ) : null}
    </div>
  );
}
