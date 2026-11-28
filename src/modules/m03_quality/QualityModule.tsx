'use client';

import React, { useCallback, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { QualityModalPayload } from './QualityModal';
import { DEFAULT_SECTIONS, periodForDate, type QualitySubPageProps } from './components/shared';
import type { QualitySectionMetric, QualitySubPageId } from './types';
import './m03.css';

const OverviewSubPage = dynamic(
  () => import('./components/OverviewSubPage').then((m) => m.OverviewSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const LabSubPage = dynamic(
  () => import('./components/LabSubPage').then((m) => m.LabSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const MixingSubPage = dynamic(
  () => import('./components/MixingSubPage').then((m) => m.MixingSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const PavementSubPage = dynamic(
  () => import('./components/PavementSubPage').then((m) => m.PavementSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const BeamYardSubPage = dynamic(
  () => import('./components/BeamYardSubPage').then((m) => m.BeamYardSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const IssuesSubPage = dynamic(
  () => import('./components/IssuesSubPage').then((m) => m.IssuesSubPage),
  {
    ssr: false,
    loading: () => <div className="m03-loading">正在按需加载质量管理模块…</div>,
  }
);

const LazyQualityModal = dynamic(
  () => import('./QualityModal').then((m) => m.QualityModal),
  { ssr: false }
);

export function QualityModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSub: QualitySubPageId = (
    ['overview', 'lab', 'mixing', 'pavement', 'beamYard', 'issues'].includes(subPageId)
      ? subPageId
      : 'overview'
  ) as QualitySubPageId;

  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode, activeSub]);

  const [period, setPeriod] = useState<string>(() => periodForDate(selectedDate));
  const [sections, setSections] = useState<QualitySectionMetric[]>(DEFAULT_SECTIONS);
  const [refreshKey, setRefreshKey] = useState(0);
  const [modalPayload, setModalPayload] = useState<QualityModalPayload | null>(null);

  // Sync global selectedDate changes smoothly
  useEffect(() => {
    setPeriod(periodForDate(selectedDate));
  }, [selectedDate]);

  const handleSectionSelect = useCallback(
    (nextId: string) => {
      setActiveSectionId(nextId || null);
    },
    [setActiveSectionId]
  );

  const handleBarToggle = useCallback(
    (secId: string) => {
      setActiveSectionId(activeSectionId === secId ? null : secId);
    },
    [activeSectionId, setActiveSectionId]
  );

  const handleResetGlobalSection = useCallback(() => {
    if (activeSectionId) setActiveSectionId(null);
  }, [activeSectionId, setActiveSectionId]);

  const handleSectionsLoaded = useCallback((nextSections: QualitySectionMetric[]) => {
    setSections(nextSections);
  }, []);

  const handleOpenModal = useCallback((payload: QualityModalPayload) => {
    setModalPayload(payload);
  }, []);

  const handleCloseModal = useCallback(() => {
    setModalPayload(null);
  }, []);

  const handleMutated = useCallback(async () => {
    setRefreshKey((k) => k + 1);
  }, []);

  const subPageProps: QualitySubPageProps = {
    activeSectionId,
    selectedDate,
    period,
    sections,
    refreshKey,
    onSectionSelect: handleSectionSelect,
    onBarToggle: handleBarToggle,
    onPeriodChange: setPeriod,
    onSectionsLoaded: handleSectionsLoaded,
    onOpenModal: handleOpenModal,
    onResetGlobalSection: handleResetGlobalSection,
    showToast,
  };

  const subpage =
    activeSub === 'lab' ? (
      <LabSubPage {...subPageProps} />
    ) : activeSub === 'mixing' ? (
      <MixingSubPage {...subPageProps} />
    ) : activeSub === 'pavement' ? (
      <PavementSubPage {...subPageProps} />
    ) : activeSub === 'beamYard' ? (
      <BeamYardSubPage {...subPageProps} />
    ) : activeSub === 'issues' ? (
      <IssuesSubPage {...subPageProps} />
    ) : (
      <OverviewSubPage {...subPageProps} />
    );

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      <div className="m03-page">{subpage}</div>

      {modalPayload ? (
        <LazyQualityModal
          payload={modalPayload}
          sections={sections}
          onClose={handleCloseModal}
          onJumpToIssues={() => router.push('/quality/issues')}
          onMutated={handleMutated}
          showToast={showToast}
        />
      ) : null}
    </section>
  );
}
