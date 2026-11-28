'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { usePlatformStore } from '@/lib/store/platform-store';
import type { ActiveModalState } from './MeasureModals';
import { dateToPeriod, DEFAULT_SECTIONS } from './components/shared';
import type { MeasureContract, MeasureRecord } from './types';
import './m08.css';

const OverviewSubPage = dynamic(
  () => import('./components/OverviewSubPage').then((m) => m.OverviewSubPage),
  {
    ssr: false,
    loading: () => <div className="m08-loading">正在按需加载计量管理模块…</div>,
  }
);

const SectionStatsSubPage = dynamic(
  () =>
    import('./components/SectionStatsSubPage').then(
      (m) => m.SectionStatsSubPage
    ),
  {
    ssr: false,
    loading: () => <div className="m08-loading">正在按需加载计量管理模块…</div>,
  }
);

const PhysicalCompareSubPage = dynamic(
  () =>
    import('./components/PhysicalCompareSubPage').then(
      (m) => m.PhysicalCompareSubPage
    ),
  {
    ssr: false,
    loading: () => <div className="m08-loading">正在按需加载计量管理模块…</div>,
  }
);

const RawRecordsSubPage = dynamic(
  () =>
    import('./components/RawRecordsSubPage').then((m) => m.RawRecordsSubPage),
  {
    ssr: false,
    loading: () => <div className="m08-loading">正在按需加载计量管理模块…</div>,
  }
);

const LazyMeasureModalHost = dynamic(
  () => import('./MeasureModals').then((m) => m.MeasureModalHost),
  { ssr: false }
);

export function MeasureModule({ subPageId }: { subPageId: string }) {
  const router = useRouter();
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);
  const period = usePlatformStore((s) => s.measureBridge.period);
  const patchMeasureBridge = usePlatformStore((s) => s.patchMeasureBridge);

  const pageKey =
    subPageId === 'sectionStats' ||
    subPageId === 'physicalCompare' ||
    subPageId === 'rawRecords'
      ? subPageId
      : 'overview';

  const [contracts, setContracts] =
    useState<MeasureContract[]>(DEFAULT_SECTIONS);
  const [refreshKey, setRefreshKey] = useState<number>(0);
  const [modal, setModal] = useState<ActiveModalState>(null);

  const prevSelectedDateRef = useRef<string>(selectedDate);
  const prevActiveSectionRef = useRef<string | null>(activeSectionId);

  // Sync Cesium mode -> opaque
  useEffect(() => {
    setCesiumMode('opaque');
  }, [setCesiumMode, pageKey]);

  // Sync global selectedDate -> period when user clicks top date chip
  useEffect(() => {
    if (prevSelectedDateRef.current !== selectedDate) {
      prevSelectedDateRef.current = selectedDate;
      const mapped = dateToPeriod(selectedDate);
      patchMeasureBridge({ period: mapped, overviewPage: 1, rawPage: 1 });
    }
  }, [selectedDate, patchMeasureBridge]);

  // Sync global activeSectionId side effects
  useEffect(() => {
    if (prevActiveSectionRef.current !== activeSectionId) {
      prevActiveSectionRef.current = activeSectionId;
      patchMeasureBridge({
        overviewPage: 1,
        rawPage: 1,
        ...(activeSectionId
          ? {
              sectionSelectedId: activeSectionId,
              physFallbackSecId: activeSectionId,
            }
          : {}),
      });
    }
  }, [activeSectionId, patchMeasureBridge]);

  const jumpToRawRecord = useCallback(
    (recId?: string, targetPeriod?: string, payFilter?: string) => {
      patchMeasureBridge({
        ...(recId ? { rawSelectedId: recId } : {}),
        ...(targetPeriod ? { period: targetPeriod } : {}),
        ...(payFilter !== undefined ? { rawPayStatus: payFilter } : {}),
        rawPage: 1,
      });
      router.push('/measure/rawRecords');
    },
    [patchMeasureBridge, router]
  );

  const jumpToPhysicalCompare = useCallback(
    (targetSecId: string) => {
      patchMeasureBridge({
        physFallbackSecId: targetSecId,
      });
      setActiveSectionId(targetSecId);
      router.push('/measure/physicalCompare');
    },
    [patchMeasureBridge, setActiveSectionId, router]
  );

  const handleReset = useCallback(() => {
    if (pageKey === 'overview') {
      patchMeasureBridge({
        period: '2026年11月',
        overviewCaliber: '已确认计量',
        overviewStatus: '',
        overviewPage: 1,
      });
    } else if (pageKey === 'sectionStats') {
      patchMeasureBridge({
        period: '2026年11月',
        sectionContract: '',
        sectionItem: '',
        sectionSelectedId: 'sec2',
      });
    } else if (pageKey === 'physicalCompare') {
      patchMeasureBridge({
        period: '2026年11月',
        physFallbackSecId: 'sec2',
        physItemFilter: '',
        physSelectedItem: '路基土方',
      });
    } else if (pageKey === 'rawRecords') {
      patchMeasureBridge({
        period: '2026年11月',
        rawStatus: '',
        rawPayStatus: '',
        rawKeyword: '',
        rawSelectedId: 'JL-A2-202611-018',
        rawPage: 1,
      });
    }
    if (activeSectionId) {
      setActiveSectionId(null);
    }
    showToast('已重置计量管理筛选条件');
  }, [pageKey, activeSectionId, patchMeasureBridge, setActiveSectionId, showToast]);

  const handleCreateRecord = useCallback(
    async (payload: {
      sectionId: string;
      workItem: string;
      period: string;
      amount: number;
      status: '已确认' | '审核中' | '待审核';
      payStatus: '已支付' | '办理中' | '待支付' | '未回传';
      qtyDesc: string;
    }): Promise<boolean> => {
      const res = await fetch('/api/v1/m08/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        if (res.status === 403) {
          showToast('当前账号角色无权新增记录（需管理员/工程师/监理权限）');
        } else {
          showToast(json.error || '新增记录失败');
        }
        return false;
      }
      const created = json.record as MeasureRecord;
      patchMeasureBridge({ rawSelectedId: created.id, rawPage: 1 });
      showToast(`已新增计量记录 ${created.id} 并写入 PostgreSQL`);
      setRefreshKey((k) => k + 1);
      return true;
    },
    [patchMeasureBridge, showToast]
  );

  return (
    <section
      id="moduleStageHost"
      className="module-stage-host active mode-opaque"
    >
      <div className="m08-page">
        {pageKey === 'sectionStats' ? (
          <SectionStatsSubPage
            onOpenModal={setModal}
            onJumpToRawRecord={jumpToRawRecord}
            onJumpToPhysicalCompare={jumpToPhysicalCompare}
            onReset={handleReset}
            onContractsChange={setContracts}
          />
        ) : pageKey === 'physicalCompare' ? (
          <PhysicalCompareSubPage
            onOpenModal={setModal}
            onJumpToRawRecord={jumpToRawRecord}
            onReset={handleReset}
            onContractsChange={setContracts}
          />
        ) : pageKey === 'rawRecords' ? (
          <RawRecordsSubPage
            refreshKey={refreshKey}
            onOpenModal={setModal}
            onReset={handleReset}
            onContractsChange={setContracts}
          />
        ) : (
          <OverviewSubPage
            onOpenModal={setModal}
            onJumpToRawRecord={jumpToRawRecord}
            onReset={handleReset}
            onContractsChange={setContracts}
          />
        )}
      </div>

      {modal ? (
        <LazyMeasureModalHost
          modal={modal}
          contracts={contracts}
          currentPeriod={period}
          onClose={() => setModal(null)}
          onJumpToRawRecord={(recId, targetPeriod) =>
            jumpToRawRecord(recId, targetPeriod)
          }
          onOpenAttachment={(rec, fileType) =>
            setModal({ type: 'attachment', record: rec, fileType })
          }
          onCreateRecord={handleCreateRecord}
        />
      ) : null}
    </section>
  );
}
