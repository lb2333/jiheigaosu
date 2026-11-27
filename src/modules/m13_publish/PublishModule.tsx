'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/platform-store';
import { OverviewSubPage } from './components/OverviewSubPage';
import { PlansSubPage } from './components/PlansSubPage';
import { ReceiptsSubPage } from './components/ReceiptsSubPage';
import { ReviewSubPage } from './components/ReviewSubPage';
import { TemplatesSubPage } from './components/TemplatesSubPage';
import type { PublishNavBridge } from './types';
import './m13.css';

let pendingNavBridge: PublishNavBridge = {};

export function PublishModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [bridge] = useState<PublishNavBridge>(() => {
    const snap = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snap;
  });

  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode]);

  function handleNavigate(targetSubPage: string, opts?: PublishNavBridge) {
    if (opts) {
      pendingNavBridge = { ...opts };
    }
    router.push(`/publish/${targetSubPage}`);
  }

  return (
    <section
      id="moduleStageHost"
      className="module-stage-host active mode-opaque"
    >
      {subPageId === 'templates' ? (
        <TemplatesSubPage
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      ) : subPageId === 'review' ? (
        <ReviewSubPage
          activeSectionId={activeSectionId}
          initialSelectedOrderId={bridge.selectedOrderId}
          initialCreateWithTplId={bridge.openCreateOrderWithTplId}
          onSectionChange={setActiveSectionId}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      ) : subPageId === 'plans' ? (
        <PlansSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onNavigate={handleNavigate}
          showToast={showToast}
        />
      ) : subPageId === 'receipts' ? (
        <ReceiptsSubPage
          selectedDate={selectedDate}
          initialOrderId={bridge.selectedOrderId}
          initialBoardId={bridge.selectedBoardId}
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
