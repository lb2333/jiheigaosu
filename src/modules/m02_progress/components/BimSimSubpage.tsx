'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  ChevronRight,
  ExternalLink,
  Layers,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { LEGACY_ICONS, STATIC_POI_OBJECTS } from '@/lib/modules/legacy-data';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { M02BimObject, M02BimResponse, M02BimTask } from '../types';
import { M02Icon } from './M02Icon';
import { M02Modal } from './M02Modal';

const PRESET_DATES = [
  '2026-06-15',
  '2026-07-20',
  '2026-08-10',
  '2026-09-25',
  '2026-10-20',
  '2026-11-25',
  '2026-12-15',
];

const FALLBACK_BIM_OBJECTS: M02BimObject[] = [
  {
    id: 'bridgeA',
    name: '桥梁示例A',
    poiId: 'bridgeA',
    sectionId: 'sec2',
    sectionName: '二工区',
    planName: '2026年阶段计划',
    planVersion: 'V1.3',
    startDate: '2026-06-01',
    endDate: '2026-12-15',
    simProgress: 89.8,
    simDate: '2026-11-25',
    selectedTaskId: 'bt4',
    tasks: [
      { id: 'bt1', name: '场地准备', start: '2026-06-01', end: '2026-06-25', icon: 'excavator', part: '便道与施工平台' },
      { id: 'bt2', name: '桩基施工', start: '2026-06-26', end: '2026-08-15', icon: 'layers', part: '48根钻孔灌注桩' },
      { id: 'bt3', name: '墩台施工', start: '2026-08-16', end: '2026-09-25', icon: 'guardrail', part: '6座双柱墩及盖梁' },
      { id: 'bt4', name: '梁板架设', start: '2026-09-26', end: '2026-12-15', icon: 'bridge', part: '80片预制箱梁架设' },
    ],
  },
];

const BIM_POI_COORDS: Record<string, { lon: number; lat: number; alt: number }> = {
  bridgeA: { lon: 125.882, lat: 47.465, alt: 460 },
  beamYardA: { lon: 125.91, lat: 47.49, alt: 420 },
  batchPlantA: { lon: 125.868, lat: 47.442, alt: 430 },
  subgrade1: { lon: 125.838, lat: 47.345, alt: 380 },
};

function dateToMs(s: string) {
  return new Date(`${s}T00:00:00Z`).getTime();
}

function msToDate(ms: number) {
  const d = new Date(ms);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  const day = String(d.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

function pctToSimDate(startStr: string, endStr: string, pct: number) {
  const t0 = dateToMs(startStr);
  const t1 = dateToMs(endStr);
  const clamped = Math.max(0, Math.min(100, pct)) / 100;
  return msToDate(t0 + (t1 - t0) * clamped);
}

function simDateToPct(startStr: string, endStr: string, dateStr: string) {
  const t0 = dateToMs(startStr);
  const t1 = dateToMs(endStr);
  const t = dateToMs(dateStr);
  if (t1 <= t0) return 50;
  return Math.max(0, Math.min(100, +(((t - t0) / (t1 - t0)) * 100).toFixed(1)));
}

function getTaskStateAtDate(task: M02BimTask, simDate: string): 'done' | 'doing' | 'todo' {
  if (simDate > task.end) return 'done';
  if (simDate >= task.start && simDate <= task.end) return 'doing';
  return 'todo';
}

interface SavedBimStyle {
  boxMat: unknown;
  boxOut: unknown;
  cylMat: unknown;
  cylOut: unknown;
}

export function BimSimSubpage({ isSchemeB }: { isSchemeB: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialObjParam = searchParams.get('objectId');
  const initialSecParam = searchParams.get('sectionId');

  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const selectedPoiId = usePlatformStore((s) => s.selectedPoiId);
  const showToast = usePlatformStore((s) => s.showToast);

  const [objects, setObjects] = useState<M02BimObject[]>(FALLBACK_BIM_OBJECTS);
  const [sections, setSections] = useState([
    { id: 'sec1', name: '一工区' },
    { id: 'sec2', name: '二工区' },
    { id: 'sec3', name: '三工区' },
    { id: 'sec4', name: '四工区' },
    { id: 'sec5', name: '五工区' },
    { id: 'sec6', name: '六工区' },
  ]);

  const [bimSecId, setBimSecId] = useState<string>(initialSecParam || 'sec2');
  const [bimObjId, setBimObjId] = useState<string>(initialObjParam || 'bridgeA');
  const [selectedTaskId, setSelectedTaskId] = useState<string>('bt4');
  const [progress, setProgress] = useState<number>(89.8);
  const [playing, setPlaying] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1.0);
  const [showInspector, setShowInspector] = useState<boolean>(false);
  const [forceDesignBase, setForceDesignBase] = useState<boolean | null>(null);
  const [planModalOpen, setPlanModalOpen] = useState<boolean>(false);

  const savedStylesRef = useRef<SavedBimStyle[] | null>(null);
  const lastCesiumSigRef = useRef<string>('');
  const lastTrackedObjRef = useRef<string>('');
  const lastPoiRef = useRef<string>(selectedPoiId);
  const flewOnInitRef = useRef<boolean>(false);

  // Load persisted BIM objects from PostgreSQL
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await fetch('/api/v1/m02/bim');
      if (!res.ok || cancelled) return;
      const json = (await res.json()) as M02BimResponse;
      if (cancelled) return;
      if (json.sections?.length) setSections(json.sections);
      if (json.objects?.length) {
        setObjects(json.objects);
        const target =
          (initialObjParam ? json.objects.find((o) => o.id === initialObjParam) : undefined) ??
          (initialSecParam ? json.objects.find((o) => o.sectionId === initialSecParam) : undefined) ??
          json.objects[0];
        if (target) {
          setBimObjId(target.id);
          setBimSecId(target.sectionId);
          setSelectedTaskId(target.selectedTaskId || target.tasks[3]?.id || target.tasks[0]?.id);
          setProgress(typeof target.simProgress === 'number' ? target.simProgress : 89.8);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [initialObjParam, initialSecParam]);

  // Reset scheme override when switching between Scheme A and Scheme B
  useEffect(() => {
    setForceDesignBase(null);
    flewOnInitRef.current = false;
    lastCesiumSigRef.current = '';
  }, [isSchemeB]);

  // Sync with global section pill click
  useEffect(() => {
    if (!activeSectionId) return;
    setBimSecId(activeSectionId);
    const match = objects.find((o) => o.sectionId === activeSectionId);
    if (match) {
      setBimObjId(match.id);
      setSelectedTaskId(match.tasks[3]?.id || match.tasks[0]?.id);
    }
  }, [activeSectionId, objects]);

  // Sync if user clicks a POI marker directly on Cesium canvas
  useEffect(() => {
    if (selectedPoiId === lastPoiRef.current) return;
    lastPoiRef.current = selectedPoiId;
    const matched = objects.find((o) => o.poiId === selectedPoiId);
    if (matched) {
      setBimObjId(matched.id);
      setBimSecId(matched.sectionId);
    }
  }, [selectedPoiId, objects]);

  const simObj = objects.find((b) => b.id === bimObjId) || objects[0];
  const simDate = pctToSimDate(simObj.startDate, simObj.endDate, progress);

  const tasksWithState = simObj.tasks.map((t) => ({
    ...t,
    simState: getTaskStateAtDate(t, simDate),
  }));
  const activeTask =
    tasksWithState.find((t) => t.id === selectedTaskId) ??
    tasksWithState.find((t) => t.simState === 'doing') ??
    tasksWithState[tasksWithState.length - 1];

  const persistBimState = useCallback(
    async (objId: string, nextPct: number, nextTaskId: string) => {
      const target = objects.find((o) => o.id === objId) ?? simObj;
      const nextDate = pctToSimDate(target.startDate, target.endDate, nextPct);
      setObjects((prev) =>
        prev.map((o) =>
          o.id === objId
            ? { ...o, simProgress: nextPct, simDate: nextDate, selectedTaskId: nextTaskId }
            : o
        )
      );
      try {
        await fetch(`/api/v1/m02/bim/${objId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            simProgress: nextPct,
            simDate: nextDate,
            selectedTaskId: nextTaskId,
          }),
        });
      } catch {
        // ignore network error in read-only viewer role
      }
    },
    [objects, simObj]
  );

  // Playback interval timer
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setProgress((prev) => {
        const next = +(prev + 1.2 * speed).toFixed(1);
        if (next >= 100) {
          setPlaying(false);
          showToast('BIM 进度模拟演练完成');
          void persistBimState(simObj.id, 100, activeTask.id);
          return 100;
        }
        return next;
      });
    }, 350);
    return () => window.clearInterval(timer);
  }, [playing, speed, showToast, persistBimState, simObj.id, activeTask.id]);

  // Sync Cesium layers, overlays, tracked stage beacon, and dynamic BIM entity recoloring
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready) return;

    const useDesign = forceDesignBase !== null ? forceDesignBase : isSchemeB;
    const sig = `${useDesign ? 'D' : 'R'}|${simObj.sectionId}|${simObj.poiId}`;
    if (sig !== lastCesiumSigRef.current) {
      lastCesiumSigRef.current = sig;
      engine.applyLayers({
        satellite: false,
        uav: !useDesign,
        bim: true,
        pois: true,
        sections: true,
        route: true,
        designMode: useDesign,
        activeSectionId: simObj.sectionId,
      });

      engine.syncHtmlOverlays({
        showRoute: true,
        showSections: true,
        showPois: true,
        activeSectionId: simObj.sectionId,
        activePoiId: simObj.poiId,
        poiObjects: STATIC_POI_OBJECTS,
        icons: LEGACY_ICONS,
        showViewpoint: false,
      });
    }

    if (!flewOnInitRef.current) {
      flewOnInitRef.current = true;
      engine.flyToPoi(simObj.poiId);
    }

    // Track a dedicated BIM stage beacon entity via engine.trackModuleEntity('progress', ...)
    const Cesium = window.Cesium;
    if (Cesium) {
      if (lastTrackedObjRef.current !== simObj.id) {
        lastTrackedObjRef.current = simObj.id;
        engine.clearModuleEntities('progress');
        const coords = BIM_POI_COORDS[simObj.id] ?? BIM_POI_COORDS.bridgeA;
        const beacon = engine.trackModuleEntity('progress', {
          position: Cesium.Cartesian3.fromDegrees(coords.lon, coords.lat, coords.alt + 140),
          ellipse: {
            semiMajorAxis: 780,
            semiMinorAxis: 780,
            height: 180,
            material: Cesium.Color.fromCssColorString(useDesign ? '#38f2ff' : '#facc15').withAlpha(0.22),
            outline: true,
            outlineColor: Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.85),
          },
        });
        if (beacon) {
          beacon._poiId = simObj.poiId;
        }
      }

      // Save original bimEntities materials once before recoloring
      if (!savedStylesRef.current && engine.bimEntities?.length) {
        savedStylesRef.current = engine.bimEntities.map((ent) => ({
          boxMat: ent.box ? ent.box.material : null,
          boxOut: ent.box ? ent.box.outlineColor : null,
          cylMat: ent.cylinder ? ent.cylinder.material : null,
          cylOut: ent.cylinder ? ent.cylinder.outlineColor : null,
        }));
      }

      // Dynamically recolor Cesium 3D BIM entities according to task states at simDate
      if (engine.bimEntities?.length) {
        const doneFill = Cesium.Color.fromCssColorString('#1b88ff').withAlpha(0.72);
        const doneOut = Cesium.Color.fromCssColorString('#38f2ff');
        const doingFill = Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.84);
        const doingOut = Cesium.Color.fromCssColorString('#fde047');
        const todoFill = Cesium.Color.fromCssColorString('#64748b').withAlpha(0.45);
        const todoOut = Cesium.Color.fromCssColorString('#cbd5e1');

        const t2State = getTaskStateAtDate(simObj.tasks[1], simDate);
        const t3State = getTaskStateAtDate(simObj.tasks[2], simDate);
        const t4State = getTaskStateAtDate(simObj.tasks[3], simDate);

        const pickStyle = (st: 'done' | 'doing' | 'todo') =>
          st === 'done'
            ? [doneFill, doneOut]
            : st === 'doing'
              ? [doingFill, doingOut]
              : [todoFill, todoOut];

        engine.bimEntities.forEach((ent, idx) => {
          let st: 'done' | 'doing' | 'todo' = t4State;
          if (idx >= 1 && idx <= 5) st = idx <= 3 ? t2State : t3State;
          else if (idx === 0) st = t4State;
          else if (idx === 6 || idx === 8 || idx === 9) st = t3State;
          else st = t4State;

          const [fill, out] = pickStyle(st);
          if (ent.box) {
            ent.box.material = fill;
            ent.box.outlineColor = out;
          }
          if (ent.cylinder) {
            ent.cylinder.material = fill;
            ent.cylinder.outlineColor = out;
          }
        });
      }
    }
  }, [cesiumReady, isSchemeB, forceDesignBase, simObj, simDate]);

  // Cleanup Cesium styles, layers, and tracked module entities on unmount
  useEffect(() => {
    return () => {
      const engine = getGlobalCesiumEngine();
      engine.clearModuleEntities('progress');
      if (engine.ready && savedStylesRef.current && engine.bimEntities) {
        engine.bimEntities.forEach((ent, i) => {
          const st = savedStylesRef.current?.[i];
          if (!st) return;
          if (ent.box && st.boxMat) {
            ent.box.material = st.boxMat;
            ent.box.outlineColor = st.boxOut;
          }
          if (ent.cylinder && st.cylMat) {
            ent.cylinder.material = st.cylMat;
            ent.cylinder.outlineColor = st.cylOut;
          }
        });
        savedStylesRef.current = null;
      }
      if (engine.ready) {
        engine.applyLayers({
          satellite: false,
          uav: true,
          bim: false,
          pois: true,
          sections: true,
          route: true,
          designMode: false,
          activeSectionId: usePlatformStore.getState().activeSectionId,
        });
      }
      lastCesiumSigRef.current = '';
      lastTrackedObjRef.current = '';
    };
  }, []);

  const activeStateLabel =
    activeTask.simState === 'done'
      ? '计划已完成'
      : activeTask.simState === 'doing'
        ? '计划施工中'
        : '计划未开始';
  const activeStateBadgeCls =
    activeTask.simState === 'done'
      ? 'm02-badge-done'
      : activeTask.simState === 'doing'
        ? 'm02-badge-doing'
        : 'm02-badge-todo';
  const taskPct =
    activeTask.simState === 'done'
      ? 100
      : activeTask.simState === 'todo'
        ? 0
        : simDateToPct(activeTask.start, activeTask.end, simDate);

  const hasExactPreset = PRESET_DATES.includes(simDate);
  const legendLabels = isSchemeB
    ? ['计划已完成', '计划施工中', '计划未开始']
    : ['计划已完成（基础、墩柱、盖梁）', '计划施工中（正在架设的梁板）', '计划未开始（后续桥面及附属）'];

  // Isometric 6-span 3D BIM Inspector SVG calculations
  const t2State = tasksWithState[1]?.simState ?? 'done';
  const t3State = tasksWithState[2]?.simState ?? 'done';
  const t4State = tasksWithState[3]?.simState ?? 'doing';
  const spanProg =
    t4State === 'done'
      ? 6
      : t4State === 'todo'
        ? 0
        : Math.max(1, Math.min(5, Math.round((progress - 55) / 8)));
  const colorOf = (st: 'done' | 'doing' | 'todo') =>
    st === 'done' ? '#2596ff' : st === 'doing' ? '#f59e0b' : '#64748b';
  const strokeOf = (st: 'done' | 'doing' | 'todo') =>
    st === 'done' ? '#7dd3fc' : st === 'doing' ? '#fde047' : '#94a3b8';

  return (
    <div className="m02-bim-stage">
      {/* Top Center Title Banner */}
      <button
        type="button"
        className="m02-bim-banner"
        title="点击切换三维构件剖面透视窗"
        onClick={() => setShowInspector((v) => !v)}
      >
        <span className="m02-bim-banner-main">计划模拟 · 演示</span>
        <span className="m02-bim-banner-sub">{isSchemeB ? '模型示意 · 方案B' : '模型示意'}</span>
      </button>

      {showInspector ? (
        <div className="m02-bim-inspector">
          <div className="m02-bim-insp-hdr">
            <span>
              三维 BIM 构件进度透视 · {simObj.name} ({simDate})
            </span>
            <button
              type="button"
              className="m02-action-link"
              onClick={() => setShowInspector(false)}
            >
              收起 ✕
            </button>
          </div>
          <svg
            viewBox="0 0 540 198"
            style={{
              width: '100%',
              display: 'block',
              background:
                'radial-gradient(circle at 50% 35%, rgba(16,68,142,0.45), rgba(4,15,36,0.9))',
            }}
          >
            <defs>
              <pattern id="m02-bimGrid" width="24" height="24" patternUnits="userSpaceOnUse">
                <path
                  d="M 24 0 L 0 0 0 24"
                  fill="none"
                  stroke="rgba(56,189,248,0.12)"
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="540" height="198" fill="url(#m02-bimGrid)" />
            {[0, 1, 2, 3, 4, 5].map((i) => {
              const x = 44 + i * 76;
              const y = 132 - i * 14;
              const st: 'done' | 'doing' | 'todo' =
                i < spanProg ? 'done' : i === spanProg && t4State !== 'todo' ? 'doing' : 'todo';
              const pierSt = i < 3 ? t2State : t3State;
              return (
                <g key={i}>
                  <rect
                    x={x + 26}
                    y={y + 18}
                    width="16"
                    height="44"
                    rx="2"
                    fill={colorOf(pierSt)}
                    stroke={strokeOf(pierSt)}
                    strokeWidth="1.2"
                  />
                  <polygon
                    points={`${x},${y + 16} ${x + 74},${y + 2} ${x + 88},${y + 10} ${x + 14},${y + 24}`}
                    fill={colorOf(st)}
                    stroke={strokeOf(st)}
                    strokeWidth="1.3"
                  />
                  {st === 'doing' ? (
                    <>
                      <rect
                        x={x + 12}
                        y={y - 8}
                        width="60"
                        height="8"
                        rx="2"
                        fill="#facc15"
                        stroke="#fff"
                        strokeWidth="0.8"
                      />
                      <line
                        x1={x + 22}
                        y1={y}
                        x2={x + 22}
                        y2={y + 14}
                        stroke="#fde047"
                        strokeWidth="2"
                      />
                      <line
                        x1={x + 62}
                        y1={y - 2}
                        x2={x + 62}
                        y2={y + 10}
                        stroke="#fde047"
                        strokeWidth="2"
                      />
                    </>
                  ) : null}
                </g>
              );
            })}
            <text x="16" y="22" fill="#bae6fd" fontSize="11" fontWeight="700">
              实时构件状态着色（蓝色=已完成 / 橙色=施工中 / 灰色=未开始）
            </text>
          </svg>
        </div>
      ) : (
        <div className="m02-bim-hud-chip">
          <span>
            当前推进：
            <strong>
              {simObj.name} · {activeTask.name}
            </strong>
          </span>
          <span>|</span>
          <span>
            模拟日期 <strong style={{ color: '#38f2ff' }}>{simDate}</strong>
          </span>
          <span>|</span>
          <button
            type="button"
            className="m02-action-link"
            style={{ padding: 0 }}
            onClick={() => setShowInspector(true)}
          >
            展开三维构件推演窗 ▾
          </button>
        </div>
      )}

      {/* Left HUD Column */}
      <div className="hud-left-col">
        <GlassPanel title="模拟范围">
          <div className="form-row">
            <label>所属工区</label>
            <select
              className="glass-select"
              value={bimSecId}
              onChange={(e) => {
                const nextSec = e.target.value;
                setBimSecId(nextSec);
                const matchObj = objects.find((o) => o.sectionId === nextSec);
                if (matchObj) {
                  setBimObjId(matchObj.id);
                  setSelectedTaskId(matchObj.tasks[3]?.id || matchObj.tasks[0]?.id);
                }
                const engine = getGlobalCesiumEngine();
                if (engine.ready) engine.flyToSection(nextSec);
                const secName = sections.find((s) => s.id === nextSec)?.name ?? nextSec;
                showToast(`已切换模拟工区：${secName}`);
              }}
            >
              {sections.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ marginBottom: 0 }}>
            <label>工程对象</label>
            <select
              className="glass-select"
              value={simObj.id}
              onChange={(e) => {
                const nextObjId = e.target.value;
                setBimObjId(nextObjId);
                const obj = objects.find((o) => o.id === nextObjId);
                if (obj) {
                  setBimSecId(obj.sectionId);
                  setSelectedTaskId(obj.tasks[3]?.id || obj.tasks[0]?.id);
                  const engine = getGlobalCesiumEngine();
                  if (engine.ready) engine.flyToPoi(obj.poiId);
                }
              }}
            >
              {objects.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.name}
                </option>
              ))}
            </select>
          </div>
        </GlassPanel>

        <GlassPanel title="计划任务">
          <div className="m02-task-list">
            {tasksWithState.map((t) => {
              const stLabel =
                t.simState === 'done'
                  ? '✓ 计划已完成'
                  : t.simState === 'doing'
                    ? '▶ 计划施工中'
                    : '○ 计划未开始';
              const stCls =
                t.simState === 'done'
                  ? 'm02-badge-done'
                  : t.simState === 'doing'
                    ? 'm02-badge-doing'
                    : 'm02-badge-todo';
              return (
                <button
                  key={t.id}
                  type="button"
                  className={`m02-task-row ${t.id === activeTask.id ? 'active' : ''}`}
                  onClick={() => {
                    setSelectedTaskId(t.id);
                    const midMs = (dateToMs(t.start) + dateToMs(t.end)) / 2;
                    const nextPct = simDateToPct(simObj.startDate, simObj.endDate, msToDate(midMs));
                    setProgress(nextPct);
                    void persistBimState(simObj.id, nextPct, t.id);
                    showToast(`已定位模拟工序：${t.name}`);
                  }}
                >
                  <span className="m02-task-name">
                    <M02Icon name={t.icon} size={15} />
                    <span>{t.name}</span>
                  </span>
                  <span className={stCls}>{stLabel}</span>
                </button>
              );
            })}
          </div>
        </GlassPanel>

        <GlassPanel title="关联计划">
          <div className="m02-kv-list" style={{ marginBottom: 0, gap: '6px' }}>
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="layers" size={14} />
                {simObj.planName}
              </span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">
                <M02Icon name="doc" size={14} />
                计划版本
              </span>
              <span className="m02-kv-v">{simObj.planVersion}</span>
            </div>
            <div className="m02-kv-row" style={{ borderBottom: 'none', paddingBottom: 0 }}>
              <span className="m02-kv-k">
                <M02Icon name="calendar" size={14} />
                计划周期
              </span>
              <span className="m02-kv-v" style={{ fontSize: '11px', whiteSpace: 'nowrap' }}>
                {simObj.startDate} 至 {simObj.endDate}
              </span>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel title="模型状态图例">
          <div className="m02-legend-list">
            <div className="m02-legend-row">
              <span className="m02-swatch done" />
              <span>{legendLabels[0]}</span>
            </div>
            <div className="m02-legend-row">
              <span className="m02-swatch doing" />
              <span>{legendLabels[1]}</span>
            </div>
            <div className="m02-legend-row">
              <span className="m02-swatch todo" />
              <span>{legendLabels[2]}</span>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Right HUD Column */}
      <div className="hud-right-col">
        <GlassPanel title="模拟任务">
          <div className="flex items-center justify-between gap-2 mb-2.5">
            <span className="inline-flex items-center gap-1.5 text-[15.5px] font-extrabold text-white">
              <M02Icon name={activeTask.icon} size={17} />
              <span>{activeTask.name}</span>
            </span>
            <span className={activeStateBadgeCls}>{activeStateLabel}</span>
          </div>
          <div className="m02-kv-list" style={{ marginBottom: '8px' }}>
            <div className="m02-kv-row">
              <span className="m02-kv-k">关联工程</span>
              <span className="m02-kv-v">{simObj.name}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">所属工区</span>
              <span className="m02-kv-v">{simObj.sectionName}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">计划开始</span>
              <span className="m02-kv-v">{activeTask.start}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">计划完成</span>
              <span className="m02-kv-v">{activeTask.end}</span>
            </div>
            <div className="m02-kv-row">
              <span className="m02-kv-k">模拟日期</span>
              <span className="m02-kv-v" style={{ color: '#38f2ff' }}>
                {simDate}
              </span>
            </div>
            <div className="m02-kv-row" style={{ borderBottom: 'none' }}>
              <span className="m02-kv-k">工序进度</span>
              <span className="m02-kv-v">{taskPct.toFixed(1)}%</span>
            </div>
          </div>

          <div className="panel-title-group" style={{ margin: '6px 0 8px' }}>
            <span className="panel-accent-bar" />
            <span className="panel-title" style={{ fontSize: '13.5px' }}>
              任务与模型关联
            </span>
          </div>
          <div className="m02-link-card">
            <span>
              🔗 {activeTask.name} ↔ {simObj.name}
            </span>
            <StatusBadge text="✓ 已关联" tone="ok" />
          </div>
          <button
            type="button"
            className="btn-primary-glow"
            onClick={() => setPlanModalOpen(true)}
          >
            <ExternalLink size={14} />
            <span>查看关联计划</span>
          </button>
          <button
            type="button"
            className="link-subtle"
            onClick={() => {
              const engine = getGlobalCesiumEngine();
              if (engine.ready) engine.flyToPoi(simObj.poiId);
              showToast(`三维视角已飞抵：${simObj.name}（${simObj.sectionName}）`);
            }}
          >
            <span>定位工程对象</span>
            <ChevronRight size={13} />
          </button>
        </GlassPanel>
      </div>

      {/* Bottom Playback Timeline Dock */}
      <div className="m02-bim-dock">
        <div className="m02-bim-dock-top">
          <div className="m02-bim-ctrl-group">
            <span className="m02-filter-label">模拟日期</span>
            <select
              className="glass-select"
              style={{ flex: '0 0 128px' }}
              value={simDate}
              onChange={(e) => {
                const nextPct = simDateToPct(simObj.startDate, simObj.endDate, e.target.value);
                setProgress(nextPct);
                void persistBimState(simObj.id, nextPct, activeTask.id);
              }}
            >
              {!hasExactPreset ? <option value={simDate}>{simDate}</option> : null}
              {PRESET_DATES.slice()
                .reverse()
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>
          <div className="m02-bim-ctrl-group">
            <button
              type="button"
              className="m02-play-circle"
              title={playing ? '暂停模拟' : '播放进度模拟'}
              onClick={() => {
                if (playing) {
                  setPlaying(false);
                  void persistBimState(simObj.id, progress, activeTask.id);
                } else {
                  if (progress >= 99.5) setProgress(0);
                  setPlaying(true);
                }
              }}
            >
              {playing ? <Pause size={15} /> : <Play size={15} />}
            </button>
            <button
              type="button"
              className="m02-icon-circle"
              title="步进下一阶段"
              onClick={() => {
                const nextPct = Math.min(100, +(progress + 12.5).toFixed(1));
                setProgress(nextPct);
                void persistBimState(simObj.id, nextPct, activeTask.id);
              }}
            >
              <ChevronRight size={14} />
            </button>
            <select
              className="speed-select"
              value={String(speed)}
              onChange={(e) => {
                const s = Number(e.target.value);
                setSpeed(s);
                showToast(`BIM模拟倍速：${s}×`);
              }}
            >
              <option value="0.5">0.5×</option>
              <option value="1">1.0×</option>
              <option value="1.5">1.5×</option>
              <option value="2">2.0×</option>
            </select>
            <button
              type="button"
              className="m02-icon-circle"
              title="全屏"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.().catch(() => {});
                } else {
                  document.exitFullscreen?.();
                }
              }}
            >
              <Maximize2 size={13} />
            </button>
          </div>
          <div className="m02-bim-ctrl-group">
            <button
              type="button"
              className="m02-icon-circle"
              title="切换实景/精模底图 & 构件透视"
              onClick={() => {
                const cur = forceDesignBase !== null ? forceDesignBase : isSchemeB;
                const next = !cur;
                setForceDesignBase(next);
                setShowInspector(true);
                showToast(
                  next ? '已切换：暗色数字孪生BIM精模底图' : '已切换：高清实景三维联动底图'
                );
              }}
            >
              <Layers size={13} />
            </button>
            <button
              type="button"
              className="m02-icon-circle"
              title="缩小"
              onClick={() => {
                const engine = getGlobalCesiumEngine();
                if (engine.ready) engine.zoomOut();
              }}
            >
              −
            </button>
            <button
              type="button"
              className="m02-icon-circle"
              title="放大"
              onClick={() => {
                const engine = getGlobalCesiumEngine();
                if (engine.ready) engine.zoomIn();
              }}
            >
              +
            </button>
            <button
              type="button"
              className="m02-icon-circle"
              title="重置模拟与视角"
              onClick={() => {
                setPlaying(false);
                setProgress(89.8);
                setForceDesignBase(null);
                const engine = getGlobalCesiumEngine();
                if (engine.ready) engine.flyToPoi(simObj.poiId);
                void persistBimState(simObj.id, 89.8, activeTask.id);
                showToast('已重置 BIM 进度模拟视角与日期');
              }}
            >
              <RotateCcw size={13} />
            </button>
          </div>
        </div>

        <div className="m02-timeline-box">
          <div className="m02-timeline-row">
            <span className="m02-timeline-bound">{simObj.startDate}</span>
            <div className="m02-slider-wrap">
              <div
                className="m02-date-bubble"
                style={{ left: `${Math.max(4, Math.min(96, progress))}%` }}
              >
                {simDate}
              </div>
              <input
                className="m02-bim-range"
                type="range"
                min="0"
                max="100"
                step="0.5"
                value={progress}
                onChange={(e) => setProgress(Number(e.target.value))}
                onMouseUp={() => void persistBimState(simObj.id, progress, activeTask.id)}
                onTouchEnd={() => void persistBimState(simObj.id, progress, activeTask.id)}
              />
              <div className="m02-month-ticks">
                <span>6月</span>
                <span>7月</span>
                <span>8月</span>
                <span>9月</span>
                <span>10月</span>
                <span>11月</span>
                <span>12月</span>
              </div>
            </div>
            <span className="m02-timeline-bound">{simObj.endDate}</span>
          </div>
        </div>
      </div>

      {/* Associated Plan Modal */}
      <M02Modal
        open={planModalOpen}
        title={`关联计划详情 · ${simObj.name}`}
        onClose={() => setPlanModalOpen(false)}
      >
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>关联计划</span>
            <strong>{simObj.planName}</strong>
          </div>
          <div className="detail-stat-card">
            <span>计划版本</span>
            <strong>{simObj.planVersion}</strong>
          </div>
          <div className="detail-stat-card">
            <span>当前模拟日期</span>
            <strong>{simDate}</strong>
          </div>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>工序任务</th>
              <th>关联构件</th>
              <th>计划开始</th>
              <th>计划完成</th>
              <th>模拟状态</th>
            </tr>
          </thead>
          <tbody>
            {tasksWithState.map((t) => (
              <tr key={t.id}>
                <td className="font-bold text-white">{t.name}</td>
                <td>{t.part}</td>
                <td>{t.start}</td>
                <td>{t.end}</td>
                <td>
                  <StatusBadge
                    text={
                      t.simState === 'done'
                        ? '计划已完成'
                        : t.simState === 'doing'
                          ? '计划施工中'
                          : '计划未开始'
                    }
                    tone={t.simState === 'done' ? 'ok' : t.simState === 'doing' ? 'warn' : 'info'}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex justify-end">
          <button
            type="button"
            className="dock-btn primary"
            onClick={() => {
              setPlanModalOpen(false);
              router.push('/progress/plan');
            }}
          >
            前往「计划与节点」查看总体甘特图
          </button>
        </div>
      </M02Modal>
    </div>
  );
}
