'use client';

import { useEffect, useMemo, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getModuleDef, getSubPageDef, type CesiumMode } from '@/lib/modules/registry';
import { STATIC_POI_OBJECTS, STATIC_WORK_SECTIONS } from '@/lib/modules/platform-data';

function ensureCesiumStylesheet() {
  if (typeof document === 'undefined') return;
  if (document.querySelector('link[data-jihei-cesium-css="1"]')) return;
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = '/lib/cesium/Widgets/widgets.css';
  link.dataset.jiheiCesiumCss = '1';
  document.head.appendChild(link);
}

export function CesiumBackdrop() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const bootStartedRef = useRef(false);

  const pathname = usePathname();
  const routeCesiumMode = useMemo<CesiumMode>(() => {
    const segs = (pathname || '').split('/').filter(Boolean);
    if (segs.length >= 2) {
      const resolved = getSubPageDef(segs[0], segs[1]);
      if (resolved) return resolved.sub.cesiumMode;
    }
    if (segs.length === 1) {
      const mod = getModuleDef(segs[0]);
      if (mod?.subPages[0]) return mod.subPages[0].cesiumMode;
    }
    return 'interactive';
  }, [pathname]);

  const effectiveModeRef = useRef<CesiumMode>(routeCesiumMode);
  effectiveModeRef.current = routeCesiumMode;

  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const setCesiumReady = usePlatformStore((s) => s.setCesiumReady);
  const setSelectedPoiId = usePlatformStore((s) => s.setSelectedPoiId);
  const toggleSectionId = usePlatformStore((s) => s.toggleSectionId);
  const openModal = usePlatformStore((s) => s.openModal);
  const showToast = usePlatformStore((s) => s.showToast);

  useEffect(() => {
    setCesiumMode(routeCesiumMode);
  }, [routeCesiumMode, setCesiumMode]);

  useEffect(() => {
    if (routeCesiumMode === 'opaque') return;

    const engine = getGlobalCesiumEngine();
    if (engine.ready || bootStartedRef.current) return;

    let cancelled = false;
    bootStartedRef.current = true;

    async function bootCesium() {
      if (typeof window === 'undefined') return;
      ensureCesiumStylesheet();
      window.CESIUM_BASE_URL = '/lib/cesium/';

      if (!window.Cesium) {
        await new Promise<void>((resolve, reject) => {
          const existing = document.querySelector<HTMLScriptElement>('script[data-jihei-cesium="1"]');
          if (existing) {
            if (window.Cesium) {
              resolve();
              return;
            }
            existing.addEventListener('load', () => resolve(), { once: true });
            existing.addEventListener('error', () => reject(new Error('Cesium load failed')), { once: true });
            return;
          }
          const script = document.createElement('script');
          script.src = '/lib/cesium/Cesium.js';
          script.async = true;
          script.dataset.jiheiCesium = '1';
          script.onload = () => resolve();
          script.onerror = () => reject(new Error('Cesium.js failed to load'));
          document.head.appendChild(script);
        });
      }

      if (cancelled || !containerRef.current || !overlayRef.current) {
        if (!engine.ready) bootStartedRef.current = false;
        return;
      }

      const ok = engine.init(containerRef.current, overlayRef.current, {
        onPoiClick: (poiId) => {
          setSelectedPoiId(poiId);
          engine.flyToPoi(poiId);
          const poi = STATIC_POI_OBJECTS[poiId];
          if (poi) showToast(`已飞抵工程对象：${poi.name}`);
        },
        onSectionClick: (secId) => {
          const next = toggleSectionId(secId);
          if (next) {
            engine.flyToSection(next);
            const sec = STATIC_WORK_SECTIONS.find((s) => s.id === next);
            if (sec) showToast(`已三维飞抵 ${sec.name}（${sec.stake}）`);
          } else {
            engine.flyToOverview(1.2);
            showToast('已恢复全线（一至六工区）汇总视图');
          }
        },
        onDirectionClick: (dir) => {
          showToast(dir === 'start' ? '已定位至明水方向起点（一工区）' : '已定位至北安方向终点（六工区）');
        },
        onAssetClick: (asset) => {
          showToast(`已飞抵${asset.categoryLabel}：${asset.name}（${asset.stake}）`);
          openModal(`三维构造物 · ${asset.name}`, [
            {
              type: 'stats',
              items: [
                { label: '构造物分类', value: asset.categoryLabel },
                { label: '所属工区 / 桩号', value: `${asset.sectionName} · ${asset.stake}` },
                { label: '断面标准', value: `${asset.roadbedWidth}（双向四车道）` },
              ],
            },
            {
              type: 'kvTable',
              rows: [
                {
                  cells: [
                    { label: '构造物名称', value: asset.name },
                    { label: '设计行车速度', value: asset.designSpeed },
                  ],
                },
                {
                  cells: [{ label: '结构特征说明', value: asset.structureDesc, colSpan: 3 }],
                },
                {
                  cells: [
                    {
                      label: '三维展现方式',
                      value: asset.modelTemplateLabel ? 'Blender 5.0 参数化低模复用：' : '地图点位标注（服务区/养护工区暂不上模型）',
                      code: asset.modelTemplateLabel ?? undefined,
                      colSpan: 3,
                    },
                  ],
                },
              ],
            },
          ]);
        },
        onFallbackNotice: (msg) => showToast(msg),
      });

      if (ok && !cancelled) {
        const latestMode = effectiveModeRef.current;
        setCesiumReady(true);
        engine.setResolutionMode(latestMode);
        engine.setRenderActive(latestMode !== 'opaque');
      } else if (!ok) {
        bootStartedRef.current = false;
      }
    }

    bootCesium().catch((err) => {
      bootStartedRef.current = false;
      console.warn('[CesiumBackdrop]', err);
    });

    return () => {
      cancelled = true;
    };
  }, [openModal, routeCesiumMode, setCesiumReady, setSelectedPoiId, showToast, toggleSectionId]);

  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (engine.ready) {
      engine.setResolutionMode(routeCesiumMode);
      engine.setRenderActive(routeCesiumMode !== 'opaque');
    }
    if (overlayRef.current) {
      overlayRef.current.style.display = routeCesiumMode === 'interactive' ? 'block' : 'none';
    }
  }, [routeCesiumMode]);

  return (
    <>
      <div
        ref={containerRef}
        id="cesiumContainer"
        className={`cesium-host ${routeCesiumMode === 'dimmed' ? 'opacity-35' : ''}`}
        style={{
          visibility: routeCesiumMode === 'opaque' ? 'hidden' : 'visible',
          pointerEvents: routeCesiumMode === 'interactive' ? 'auto' : 'none',
        }}
      />
      <div className="map-vignette" id="globalMapVignette" />
      <div
        ref={overlayRef}
        id="cesiumOverlayRoot"
        className="cesium-overlay-root"
        style={{ display: routeCesiumMode === 'interactive' ? 'block' : 'none' }}
      />
    </>
  );
}
