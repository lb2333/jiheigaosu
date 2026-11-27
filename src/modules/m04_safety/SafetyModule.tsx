'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { usePlatformStore } from '@/lib/store/platform-store';
import { dateToPeriod, type SafetyHazardDTO } from './types';
import { OverviewSubPage } from './components/OverviewSubPage';
import { RiskSubPage } from './components/RiskSubPage';
import { AiAlertSubPage } from './components/AiAlertSubPage';
import { LedgerSubPage } from './components/LedgerSubPage';
import { ReviewSubPage } from './components/ReviewSubPage';
import './m04.css';

interface NavBridgeState {
  ledgerStatus?: string;
  selectedHazardId?: string;
  selectedReviewId?: string;
  reviewStatusFilter?: string;
}

let pendingNavBridge: NavBridgeState = {};

export function SafetyModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [period, setPeriod] = useState<string>(() => dateToPeriod(selectedDate));
  const [bridge] = useState<NavBridgeState>(() => {
    const snapshot = { ...pendingNavBridge };
    pendingNavBridge = {};
    return snapshot;
  });

  // Sync period when global topbar date preset changes
  useEffect(() => {
    setPeriod(dateToPeriod(selectedDate));
  }, [selectedDate]);

  // Sync CesiumMode per subpage ('dimmed' for risk, 'opaque' for others)
  useEffect(() => {
    const isRisk = subPageId === 'risk';
    setCesiumMode(isRisk ? 'dimmed' : 'opaque');

    return () => {
      if (isRisk) {
        getGlobalCesiumEngine().clearModuleEntities('safety');
      }
    };
  }, [subPageId, setCesiumMode]);

  // Global unmount safety entity cleanup
  useEffect(() => {
    return () => {
      getGlobalCesiumEngine().clearModuleEntities('safety');
    };
  }, []);

  function handleNavigate(
    targetSubPage: string,
    opts?: {
      ledgerStatus?: string;
      selectedHazardId?: string;
      selectedReviewId?: string;
      reviewStatusFilter?: string;
    }
  ) {
    if (opts) {
      pendingNavBridge = { ...opts };
    }
    router.push(`/safety/${targetSubPage}`);
  }

  function handleOpenHazard(h: SafetyHazardDTO) {
    if (h.status === '待复查' || h.status === '已销项') {
      handleNavigate('review', {
        selectedReviewId: h.id,
        reviewStatusFilter: 'all',
      });
    } else {
      handleNavigate('ledger', {
        selectedHazardId: h.id,
      });
    }
  }

  const isRisk = subPageId === 'risk';
  const stageClass = `module-stage-host active ${isRisk ? 'mode-dimmed' : 'mode-opaque'}`;

  return (
    <section id="moduleStageHost" className={stageClass}>
      {subPageId === 'risk' ? (
        <RiskSubPage
          activeSectionId={activeSectionId}
          onSectionChange={setActiveSectionId}
          onOpenHazard={handleOpenHazard}
          showToast={showToast}
        />
      ) : subPageId === 'ai_alert' ? (
        <AiAlertSubPage
          activeSectionId={activeSectionId}
          period={period}
          onSectionChange={setActiveSectionId}
          onPeriodChange={setPeriod}
          onJumpToLedgerHazard={(hazardId) =>
            handleNavigate('ledger', { selectedHazardId: hazardId })
          }
          showToast={showToast}
        />
      ) : subPageId === 'ledger' ? (
        <LedgerSubPage
          activeSectionId={activeSectionId}
          period={period}
          initialStatusFilter={bridge.ledgerStatus}
          initialSelectedHazardId={bridge.selectedHazardId}
          onSectionChange={setActiveSectionId}
          onPeriodChange={setPeriod}
          onNavigateReview={(hazardId, reviewStatus) =>
            handleNavigate('review', {
              selectedReviewId: hazardId,
              reviewStatusFilter: reviewStatus ?? 'all',
            })
          }
          showToast={showToast}
        />
      ) : subPageId === 'review' ? (
        <ReviewSubPage
          activeSectionId={activeSectionId}
          period={period}
          initialStatusFilter={bridge.reviewStatusFilter}
          initialSelectedReviewId={bridge.selectedReviewId}
          onSectionChange={setActiveSectionId}
          onBackToLedger={() => handleNavigate('ledger')}
          showToast={showToast}
        />
      ) : (
        <OverviewSubPage
          activeSectionId={activeSectionId}
          period={period}
          onSectionChange={setActiveSectionId}
          onPeriodChange={setPeriod}
          onNavigate={handleNavigate}
          onOpenHazard={handleOpenHazard}
          showToast={showToast}
        />
      )}
    </section>
  );
}
