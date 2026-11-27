'use client';

import { useEffect, useRef } from 'react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { STATIC_POI_OBJECTS, STATIC_WORK_SECTIONS } from '@/lib/modules/platform-data';

export function CesiumBackdrop() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const overlayRef = useRef<HTMLDivElement | null>(null);

  const cesiumMode = usePlatformStore((s) => s.cesiumMode);
  const setCesiumReady = usePlatformStore((s) => s.setCesiumReady);
  const setSelectedPoiId = usePlatformStore((s) => s.setSelectedPoiId);
  const toggleSectionId = usePlatformStore((s) => s.toggleSectionId);
  const openModalHtml = usePlatformStore((s) => s.openModalHtml);
  const showToast = usePlatformStore((s) => s.showToast);

  useEffect(() => {
    let cancelled = false;

    async function bootCesium() {
      if (typeof window === 'undefined') return;
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

      if (cancelled || !containerRef.current || !overlayRef.current) return;

      const engine = getGlobalCesiumEngine();
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
          openModalHtml(
            `三维构造物 · ${asset.name}`,
            `
            <div class="detail-grid">
              <div class="detail-stat-card"><span>构造物分类</span><strong>${asset.categoryLabel}</strong></div>
              <div class="detail-stat-card"><span>所属工区 / 桩号</span><strong>${asset.sectionName} · ${asset.stake}</strong></div>
              <div class="detail-stat-card"><span>断面标准</span><strong>${asset.roadbedWidth}（双向四车道）</strong></div>
            </div>
            <table class="data-table">
              <tbody>
                <tr><th style="width:130px;">构造物名称</th><td>${asset.name}</td><th style="width:130px;">设计行车速度</th><td>${asset.designSpeed}</td></tr>
                <tr><th>结构特征说明</th><td colspan="3">${asset.structureDesc}</td></tr>
                <tr><th>三维展现方式</th><td colspan="3">${asset.modelTemplateLabel ? `Blender 5.0 参数化低模复用：<code>${asset.modelTemplateLabel}</code>` : '地图点位标注（服务区/养护工区暂不上模型）'}</td></tr>
              </tbody>
            </table>
            `
          );
        },
        onFallbackNotice: (msg) => showToast(msg),
      });

      if (ok && !cancelled) {
        setCesiumReady(true);
        engine.setRenderActive(usePlatformStore.getState().cesiumMode !== 'opaque');
      }
    }

    bootCesium().catch((err) => {
      console.warn('[CesiumBackdrop]', err);
    });

    return () => {
      cancelled = true;
    };
  }, [openModalHtml, setCesiumReady, setSelectedPoiId, showToast, toggleSectionId]);

  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (engine.ready) {
      engine.setRenderActive(cesiumMode !== 'opaque');
    }
    if (overlayRef.current) {
      overlayRef.current.style.display = cesiumMode === 'interactive' ? 'block' : 'none';
    }
  }, [cesiumMode]);

  return (
    <>
      <div
        ref={containerRef}
        id="cesiumContainer"
        className={`cesium-host ${cesiumMode === 'dimmed' ? 'opacity-35' : ''}`}
        style={{
          visibility: cesiumMode === 'opaque' ? 'hidden' : 'visible',
          pointerEvents: cesiumMode === 'interactive' ? 'auto' : 'none',
        }}
      />
      <div className="map-vignette" id="globalMapVignette" />
      <div
        ref={overlayRef}
        id="cesiumOverlayRoot"
        className="cesium-overlay-root"
        style={{ display: cesiumMode === 'interactive' ? 'block' : 'none' }}
      />
    </>
  );
}
