'use client';

import { useEffect } from 'react';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import './m02.css';
import { BimSimSubpage } from './components/BimSimSubpage';
import { OverviewSubpage } from './components/OverviewSubpage';
import { PlanSubpage } from './components/PlanSubpage';
import { ReportSubpage } from './components/ReportSubpage';

export function ProgressModule({ subPageId }: { subPageId: string }) {
  const isBim = subPageId === 'bim_a' || subPageId === 'bim_b';

  useEffect(() => {
    usePlatformStore.getState().setCesiumMode(isBim ? 'interactive' : 'opaque');
    if (!isBim) {
      getGlobalCesiumEngine().clearModuleEntities('progress');
    }
  }, [isBim]);

  useEffect(() => {
    return () => {
      document.body.classList.remove('m02-hide-top-sections');
      getGlobalCesiumEngine().clearModuleEntities('progress');
    };
  }, []);

  return (
    <section
      id="moduleStageHost"
      className={`module-stage-host active ${isBim ? '' : 'mode-opaque'}`}
    >
      {subPageId === 'report' ? (
        <ReportSubpage />
      ) : subPageId === 'plan' ? (
        <PlanSubpage />
      ) : subPageId === 'bim_a' ? (
        <BimSimSubpage isSchemeB={false} />
      ) : subPageId === 'bim_b' ? (
        <BimSimSubpage isSchemeB={true} />
      ) : (
        <OverviewSubpage />
      )}
    </section>
  );
}
