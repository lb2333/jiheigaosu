'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { AlgorithmSubPage } from './components/AlgorithmSubPage';
import { FeedbackSubPage } from './components/FeedbackSubPage';
import { ReplaySubPage } from './components/ReplaySubPage';
import { restoreDefaultCesiumLayers } from './components/SpeedCesiumHelper';
import { StrategySubPage } from './components/StrategySubPage';
import { TrafficSubPage } from './components/TrafficSubPage';
import './m11.css';

interface SpeedNavBridge {
  segId?: string;
  batchId?: string;
}

let pendingNavBridge: SpeedNavBridge = {};

export function SpeedModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const showToast = usePlatformStore((s) => s.showToast);

  const [bridge] = useState<SpeedNavBridge>(() => {
    const snap = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snap;
  });

  const isInteractive = subPageId === 'traffic' || subPageId === 'replay';

  // Align CesiumMode: interactive for 'traffic' and 'replay'; opaque for 'algorithm', 'strategy', 'feedback'
  useEffect(() => {
    setCesiumMode(isInteractive ? 'interactive' : 'opaque');

    return () => {
      const engine = getGlobalCesiumEngine();
      engine.clearModuleEntities('speed');
      if (isInteractive) {
        restoreDefaultCesiumLayers(usePlatformStore.getState().activeSectionId);
      }
    };
  }, [isInteractive, setCesiumMode]);

  // Global unmount safety cleanup
  useEffect(() => {
    return () => {
      const engine = getGlobalCesiumEngine();
      engine.clearModuleEntities('speed');
      restoreDefaultCesiumLayers(usePlatformStore.getState().activeSectionId);
    };
  }, []);

  function handleNavigate(targetSubPage: string, opts?: SpeedNavBridge) {
    if (opts) {
      pendingNavBridge = { ...opts };
    }
    router.push(`/speed/${targetSubPage}`);
  }

  const stageClass = `module-stage-host active ${isInteractive ? '' : 'mode-opaque'}`;

  return (
    <section id="moduleStageHost" className={stageClass}>
      {subPageId === 'algorithm' ? (
        <AlgorithmSubPage
          activeSectionId={activeSectionId}
          selectedDate={selectedDate}
          initialSegId={bridge.segId}
          onClearSection={() => setActiveSectionId(null)}
          onNavigateStrategy={(segId) => handleNavigate('strategy', { segId })}
        />
      ) : subPageId === 'strategy' ? (
        <StrategySubPage
          activeSectionId={activeSectionId}
          initialSegId={bridge.segId}
          onClearSection={() => setActiveSectionId(null)}
          onNavigateFeedback={(opts) => handleNavigate('feedback', opts)}
          showToast={showToast}
        />
      ) : subPageId === 'feedback' ? (
        <FeedbackSubPage
          activeSectionId={activeSectionId}
          initialSegId={bridge.segId}
          initialBatchId={bridge.batchId}
          onClearSection={() => setActiveSectionId(null)}
          showToast={showToast}
        />
      ) : subPageId === 'replay' ? (
        <ReplaySubPage
          activeSectionId={activeSectionId}
          cesiumReady={cesiumReady}
          onNavigateAlgorithm={() => handleNavigate('algorithm')}
          onNavigateFeedback={(segId) => handleNavigate('feedback', { segId })}
          showToast={showToast}
        />
      ) : (
        <TrafficSubPage
          activeSectionId={activeSectionId}
          cesiumReady={cesiumReady}
          onNavigateAlgorithm={(segId) => handleNavigate('algorithm', { segId })}
          showToast={showToast}
        />
      )}
    </section>
  );
}
