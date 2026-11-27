'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { EquipmentSubPage } from './components/EquipmentSubPage';
import { KeyArchiveSubPage } from './components/KeyArchiveSubPage';
import { SECTIONS, type MachineMarkerDTO } from './types';
import './m06.css';

let pendingSelectedArchiveCode = '';

export function MachineModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const showToast = usePlatformStore((s) => s.showToast);

  const [jumpCode, setJumpCode] = useState<string>(() => {
    const code = pendingSelectedArchiveCode;
    pendingSelectedArchiveCode = '';
    return code;
  });

  const [markers, setMarkers] = useState<MachineMarkerDTO[]>(() =>
    SECTIONS.map((s) => ({
      code: `QZ-0${s.id.replace('sec', '')}-001`,
      name: `${s.name}重点起重设备`,
      sectionId: s.id,
      sectionName: s.name,
      type: '起重设备',
      useStatus: '在用',
      location: s.yard,
      lon: s.lon,
      lat: s.lat,
    }))
  );

  // Set Cesium mode to 'opaque' and clean up tracked entities on unmount
  useEffect(() => {
    setCesiumMode('opaque');
    return () => {
      getGlobalCesiumEngine().clearModuleEntities('machine');
    };
  }, [subPageId, setCesiumMode]);

  // Sync Cesium camera & tracked representative machine marker entities on section/marker change
  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready || !engine.viewer) return;

    if (activeSectionId) {
      engine.flyToSection(activeSectionId);
    } else {
      engine.flyToOverview(1.0);
    }

    engine.clearModuleEntities('machine');
    const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
    if (Cesium && markers.length > 0) {
      for (const m of markers) {
        const ent = engine.trackModuleEntity('machine', {
          id: `machine_marker_${m.code}`,
          position: Cesium.Cartesian3.fromDegrees(m.lon, m.lat, 230),
          point: {
            pixelSize: 11,
            color: Cesium.Color.fromCssColorString('#38f2ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY,
          },
          label: {
            text: `${m.code} ${m.name}`,
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
          ent._secId = m.sectionId;
        }
      }
    }

    return () => {
      engine.clearModuleEntities('machine');
    };
  }, [cesiumReady, activeSectionId, markers]);

  const handleMarkersLoaded = useCallback((nextMarkers: MachineMarkerDTO[]) => {
    if (nextMarkers.length > 0) {
      setMarkers(nextMarkers);
    }
  }, []);

  function handleJumpArchive(code: string) {
    pendingSelectedArchiveCode = code;
    setJumpCode(code);
    router.push('/machine/keyArchive');
  }

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      {subPageId === 'keyArchive' ? (
        <KeyArchiveSubPage
          activeSectionId={activeSectionId}
          initialSelectedCode={jumpCode}
          onSectionChange={setActiveSectionId}
          showToast={showToast}
        />
      ) : (
        <EquipmentSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onJumpArchive={handleJumpArchive}
          onMarkersLoaded={handleMarkersLoaded}
          showToast={showToast}
        />
      )}
    </section>
  );
}
