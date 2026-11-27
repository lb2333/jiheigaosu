'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { AttendanceSubPage } from './components/AttendanceSubPage';
import { OrgSubPage } from './components/OrgSubPage';
import './m05.css';

interface StaffNavBridge {
  selectedStaffId?: string;
  selectedRoleCode?: string;
}

const STAFF_SECTION_MARKERS = [
  { id: 'org-xmb', name: '项目办 (12人)', sectionId: 'line', lon: 125.982, lat: 47.452, color: '#38f2ff' },
  { id: 'org-sg1', name: '一工区驻地 (32人)', sectionId: 'sec1', lon: 125.865, lat: 47.33, color: '#22d3ee' },
  { id: 'org-sg2', name: '二工区驻地 (34人)', sectionId: 'sec2', lon: 126.04, lat: 47.495, color: '#22d3ee' },
  { id: 'org-sg3', name: '三工区驻地 (32人)', sectionId: 'sec3', lon: 125.992, lat: 47.652, color: '#22d3ee' },
  { id: 'org-sg4', name: '四工区驻地 (31人)', sectionId: 'sec4', lon: 126.135, lat: 47.838, color: '#22d3ee' },
  { id: 'org-sg5', name: '五工区驻地 (23人)', sectionId: 'sec5', lon: 126.298, lat: 47.985, color: '#22d3ee' },
  { id: 'org-sg6', name: '六工区驻地 (22人)', sectionId: 'sec6', lon: 126.392, lat: 48.195, color: '#22d3ee' },
] as const;

let pendingNavBridge: StaffNavBridge = {};

export function StaffModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const showToast = usePlatformStore((s) => s.showToast);

  const [bridge] = useState<StaffNavBridge>(() => {
    const snap = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snap;
  });

  useEffect(() => {
    setCesiumMode('opaque');
  }, [subPageId, setCesiumMode]);

  useEffect(() => {
    const engine = getGlobalCesiumEngine();
    if (!cesiumReady || !engine.ready || !engine.viewer) return;

    try {
      engine.applyLayers({ activeSectionId });
      engine.clearModuleEntities('staff');

      const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
      if (Cesium) {
        const markers = activeSectionId
          ? STAFF_SECTION_MARKERS.filter(
              (m) => m.sectionId === activeSectionId || m.sectionId === 'line'
            )
          : STAFF_SECTION_MARKERS;

        for (const m of markers) {
          const isFocus = activeSectionId === m.sectionId;
          const ent = engine.trackModuleEntity('staff', {
            id: `staff_marker_${m.id}`,
            position: Cesium.Cartesian3.fromDegrees(m.lon, m.lat, 240),
            point: {
              pixelSize: isFocus ? 14 : 10,
              color: Cesium.Color.fromCssColorString(m.color),
              outlineColor: Cesium.Color.WHITE,
              outlineWidth: 2,
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
              text: m.name,
              font: '600 12px sans-serif',
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.fromCssColorString('#041026'),
              outlineWidth: 3,
              style: Cesium.LabelStyle.FILL_AND_OUTLINE,
              pixelOffset: new Cesium.Cartesian2(0, -16),
              disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
          });
          if (ent) {
            ent._secId = m.sectionId === 'line' ? null : m.sectionId;
          }
        }
      }
    } catch {
      // Ignore Cesium background sync errors when scene is opaque
    }

    return () => {
      engine.clearModuleEntities('staff');
    };
  }, [cesiumReady, activeSectionId]);

  useEffect(() => {
    return () => {
      getGlobalCesiumEngine().clearModuleEntities('staff');
    };
  }, []);

  const normalizedSubPage = subPageId === 'attendance' ? 'attendance' : 'org';

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      {normalizedSubPage === 'attendance' ? (
        <AttendanceSubPage
          activeSectionId={activeSectionId}
          initialSelectedRoleCode={bridge.selectedRoleCode}
          onSectionChange={setActiveSectionId}
          onJumpOrgProfile={(staffId) => {
            pendingNavBridge = { selectedStaffId: staffId };
            router.push('/staff/org');
          }}
          showToast={showToast}
        />
      ) : (
        <OrgSubPage
          activeSectionId={activeSectionId}
          initialSelectedStaffId={bridge.selectedStaffId}
          onSectionChange={setActiveSectionId}
          onJumpAttendance={(roleCode) => {
            pendingNavBridge = roleCode ? { selectedRoleCode: roleCode } : {};
            router.push('/staff/attendance');
          }}
          showToast={showToast}
        />
      )}
    </section>
  );
}
