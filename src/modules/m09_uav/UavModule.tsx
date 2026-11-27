'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { HazardsSubPage } from './components/HazardsSubPage';
import { LiveSubPage } from './components/LiveSubPage';
import { OverviewSubPage } from './components/OverviewSubPage';
import { ReportsSubPage } from './components/ReportsSubPage';
import { RoutesSubPage } from './components/RoutesSubPage';
import { TasksSubPage } from './components/TasksSubPage';
import './m09.css';

interface UavNavBridge {
  taskStatus?: string;
  hazardStatus?: string;
  selectedTaskId?: string;
}

let pendingNavBridge: UavNavBridge = {};

function restoreDefaultCesiumLayers(activeSectionId: string | null) {
  const engine = getGlobalCesiumEngine();
  if (!engine.ready || !engine.viewer) return;
  engine.applyLayers({
    satellite: false,
    uav: true,
    bim: false,
    pois: true,
    sections: true,
    route: true,
    designMode: false,
    activeSectionId,
  });
}

export function UavModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [bridge] = useState<UavNavBridge>(() => {
    const snap = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snap;
  });

  const isInteractive = subPageId === 'overview' || subPageId === 'routes';

  // Align CesiumMode: interactive ONLY for 'overview' and 'routes'; opaque for 'live', 'tasks', 'hazards', 'reports'
  useEffect(() => {
    setCesiumMode(isInteractive ? 'interactive' : 'opaque');

    return () => {
      const engine = getGlobalCesiumEngine();
      engine.clearModuleEntities('uav');
      if (isInteractive) {
        restoreDefaultCesiumLayers(usePlatformStore.getState().activeSectionId);
      }
    };
  }, [isInteractive, setCesiumMode]);

  // Global unmount safety cleanup
  useEffect(() => {
    return () => {
      const engine = getGlobalCesiumEngine();
      engine.clearModuleEntities('uav');
      restoreDefaultCesiumLayers(usePlatformStore.getState().activeSectionId);
    };
  }, []);

  function handleNavigate(targetSubPage: string, opts?: UavNavBridge) {
    if (opts) {
      pendingNavBridge = { ...opts };
    }
    router.push(`/uav/${targetSubPage}`);
  }

  function handleNavigateSafety() {
    router.push('/safety/ledger');
  }

  const stageClass = `module-stage-host active ${isInteractive ? '' : 'mode-opaque'}`;

  return (
    <section id="moduleStageHost" className={stageClass}>
      {subPageId === 'tasks' ? (
        <TasksSubPage
          activeSectionId={activeSectionId}
          initialStatusFilter={bridge.taskStatus}
          initialSelectedTaskId={bridge.selectedTaskId}
          onSectionChange={setActiveSectionId}
          onNavigateLive={(taskId) =>
            handleNavigate('live', { selectedTaskId: taskId })
          }
          showToast={showToast}
        />
      ) : subPageId === 'routes' ? (
        <RoutesSubPage
          activeSectionId={activeSectionId}
          showToast={showToast}
        />
      ) : subPageId === 'live' ? (
        <LiveSubPage
          activeSectionId={activeSectionId}
          initialTaskId={bridge.selectedTaskId}
          showToast={showToast}
        />
      ) : subPageId === 'hazards' ? (
        <HazardsSubPage
          activeSectionId={activeSectionId}
          initialStatusFilter={bridge.hazardStatus}
          onSectionChange={setActiveSectionId}
          onNavigateRoutes={() => handleNavigate('routes')}
          onNavigateSafety={handleNavigateSafety}
          showToast={showToast}
        />
      ) : subPageId === 'reports' ? (
        <ReportsSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onNavigateSafety={handleNavigateSafety}
          showToast={showToast}
        />
      ) : (
        <OverviewSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      )}
    </section>
  );
}
