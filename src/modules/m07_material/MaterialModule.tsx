'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { OverviewSubPage } from './components/OverviewSubPage';
import { ReportSubPage } from './components/ReportSubPage';
import { YardSubPage } from './components/YardSubPage';
import { InspectSubPage } from './components/InspectSubPage';
import { DEFAULT_YARDS, dateToMaterialPeriod } from './types';
import './m07.css';

interface MaterialNavBridge {
  material?: string;
  batchId?: string;
  seq: number;
}

export function MaterialModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const showToast = usePlatformStore((s) => s.showToast);

  const [period, setPeriod] = useState<string>(() => dateToMaterialPeriod(selectedDate));
  const [bridge, setBridge] = useState<MaterialNavBridge>({ seq: 0 });

  useEffect(() => {
    setPeriod(dateToMaterialPeriod(selectedDate));
  }, [selectedDate]);

  // Enforce opaque Cesium mode for m07_material
  useEffect(() => {
    setCesiumMode('opaque');
  }, [subPageId, setCesiumMode]);

  // Cesium layer sync & representative yard entity tracking with strict unmount cleanup
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready || !engine.viewer) return;

    engine.applyLayers({ activeSectionId });
    engine.clearModuleEntities('material');

    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (Cesium) {
      const targetYards = activeSectionId
        ? DEFAULT_YARDS.filter((y) => y.sectionId === activeSectionId)
        : DEFAULT_YARDS;

      for (const yard of targetYards) {
        const ent = engine.trackModuleEntity('material', {
          id: `material_yard_${yard.id}`,
          position: Cesium.Cartesian3.fromDegrees(yard.lon, yard.lat, 230),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString('#38f2ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `${yard.sectionName} · ${yard.name}`,
            font: '600 11px sans-serif',
            fillColor: Cesium.Color.WHITE,
            outlineColor: Cesium.Color.fromCssColorString('#041026'),
            outlineWidth: 3,
            style: Cesium.LabelStyle.FILL_AND_OUTLINE,
            pixelOffset: new Cesium.Cartesian2(0, -16),
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
        });
        if (ent) {
          ent._secId = yard.sectionId;
        }
      }
    }

    return () => {
      engine.clearModuleEntities('material');
    };
  }, [cesiumReady, activeSectionId]);

  function navigateSubPage(
    target: 'overview' | 'report' | 'yard' | 'inspect',
    opts?: { sectionId?: string; material?: string; batchId?: string }
  ) {
    if (opts?.sectionId) {
      setActiveSectionId(opts.sectionId);
    }
    setBridge((prev) => ({
      material: opts?.material,
      batchId: opts?.batchId,
      seq: prev.seq + 1,
    }));
    router.push(`/material/${target}`);
  }

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      {subPageId === 'report' ? (
        <ReportSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          showToast={showToast}
        />
      ) : subPageId === 'yard' ? (
        <YardSubPage
          activeSectionId={activeSectionId}
          period={period}
          initialMaterial={bridge.material}
          onSectionChange={setActiveSectionId}
          onPeriodChange={setPeriod}
          onNavigateInspect={(opts) => navigateSubPage('inspect', opts)}
          showToast={showToast}
        />
      ) : subPageId === 'inspect' ? (
        <InspectSubPage
          activeSectionId={activeSectionId}
          initialMaterial={bridge.material}
          initialBatchId={bridge.batchId}
          onSectionChange={setActiveSectionId}
          showToast={showToast}
        />
      ) : (
        <OverviewSubPage
          activeSectionId={activeSectionId}
          period={period}
          onSectionChange={setActiveSectionId}
          onPeriodChange={setPeriod}
          onNavigate={(target, opts) => navigateSubPage(target, opts)}
          showToast={showToast}
        />
      )}
    </section>
  );
}
