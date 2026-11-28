'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo } from 'react';
import { useApiQuery } from '@/lib/hooks/useApiQuery';
import { usePlatformStore } from '@/lib/store/platform-store';
import {
  STATIC_POI_OBJECTS,
  STATIC_WORK_SECTIONS,
} from '@/lib/modules/platform-data';
import { DATE_PRESETS } from '@/lib/modules/registry';
import type {
  ApiFocusRow,
  ApiMilestone,
  ApiPoi,
  ApiSection,
  ApiTopic,
  FocusGroup,
} from './types';

const OverviewSubPage = dynamic(
  () => import('./components/OverviewSubPage').then((m) => m.OverviewSubPage),
  { ssr: false, loading: () => <div className="page-view active" aria-busy="true" /> }
);
const RoamingSubPage = dynamic(
  () => import('./components/RoamingSubPage').then((m) => m.RoamingSubPage),
  { ssr: false, loading: () => <div className="page-view active" aria-busy="true" /> }
);
const MilestoneSubPage = dynamic(
  () => import('./components/MilestoneSubPage').then((m) => m.MilestoneSubPage),
  { ssr: false, loading: () => <div className="page-view active" aria-busy="true" /> }
);
const ShowcaseSubPage = dynamic(
  () => import('./components/ShowcaseSubPage').then((m) => m.ShowcaseSubPage),
  { ssr: false, loading: () => <div className="page-view active" aria-busy="true" /> }
);

export function HomeModule({ subPageId }: { subPageId: string }) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const selectedPoiId = usePlatformStore((s) => s.selectedPoiId);

  // Live DB data via cached abort-safe query
  const { data: overviewData } = useApiQuery<{
    workSections?: ApiSection[];
    poiObjects?: ApiPoi[];
    focusItems?: ApiFocusRow[];
    milestoneNodes?: ApiMilestone[];
    showcaseTopics?: ApiTopic[];
  }>(`/api/home/overview?date=${encodeURIComponent(selectedDate)}`, { staleTimeMs: 15_000 });

  const sections = overviewData?.workSections ?? [];
  const pois = overviewData?.poiObjects ?? [];
  const focusRows = overviewData?.focusItems ?? [];
  const milestones = overviewData?.milestoneNodes ?? [];
  const topics = overviewData?.showcaseTopics ?? [];

  useEffect(() => {
    setCesiumMode(subPageId === 'milestone' ? 'opaque' : 'interactive');
  }, [setCesiumMode, subPageId]);

  const activeSec: ApiSection | null = useMemo(() => {
    const dbSec = sections.find((s) => s.id === activeSectionId);
    if (dbSec) return dbSec;
    const st = STATIC_WORK_SECTIONS.find((s) => s.id === activeSectionId);
    if (!st) return null;
    return {
      id: st.id,
      name: st.name,
      stakeRange: st.stake,
      sectionsCount: st.summary.sections,
      keyWorksCount: st.summary.keyWorks,
      yardsCount: st.summary.yards,
      progressMetrics: [...st.progress],
      qualityMetrics: [...st.quality],
      safetyMetrics: [...st.safety],
    };
  }, [activeSectionId, sections]);

  const activePoi: ApiPoi = useMemo(() => {
    const found = pois.find((p) => p.id === selectedPoiId);
    if (found) return found;
    const st = STATIC_POI_OBJECTS[selectedPoiId] ?? STATIC_POI_OBJECTS.bridgeA;
    return {
      id: st.id,
      name: st.name,
      type: st.type,
      sectionId: st.sectionId,
      sectionName: st.section,
      stage: st.stage,
      stake: st.stake,
      cameraName: st.camera,
      icon: st.icon,
      imgPath: st.imgPath,
      duration: st.duration,
      elapsedSec: st.elapsed,
      photosCount: st.photos,
      videosCount: st.videos,
      inspectionsCount: st.inspections,
      metrics: st.metrics,
      docs: st.docs,
    };
  }, [pois, selectedPoiId]);

  const focusGroups: FocusGroup[] = useMemo(() => {
    const map: Record<string, FocusGroup> = {
      nodes: { id: 'nodes', title: '关键节点', summaryPrefix: '本月计划关键节点', unit: '项', icon: 'flag', records: [] },
      issues: { id: 'issues', title: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', records: [] },
      collab: { id: 'collab', title: '协同事项', summaryPrefix: '跨工区协同', unit: '项', icon: 'handshake', records: [] },
    };
    for (const r of focusRows) {
      if (map[r.category]) map[r.category].records.push(r);
    }
    return Object.values(map);
  }, [focusRows]);

  const datePreset = DATE_PRESETS.find((d) => d.date === selectedDate) ?? DATE_PRESETS[0];

  if (subPageId === 'roaming') {
    return <RoamingSubPage activePoi={activePoi} />;
  }

  if (subPageId === 'milestone') {
    return <MilestoneSubPage milestones={milestones} />;
  }

  if (subPageId === 'showcase') {
    return <ShowcaseSubPage topics={topics} />;
  }

  return (
    <OverviewSubPage
      activeSec={activeSec}
      activePoi={activePoi}
      focusGroups={focusGroups}
      datePreset={datePreset}
    />
  );
}
