'use client';

import dynamic from 'next/dynamic';

export const PoiDetailModal = dynamic(
  () => import('./UavModals').then((m) => m.PoiDetailModal),
  { ssr: false }
);

export const HangarDetailModal = dynamic(
  () => import('./UavModals').then((m) => m.HangarDetailModal),
  { ssr: false }
);

export const FleetModal = dynamic(
  () => import('./UavModals').then((m) => m.FleetModal),
  { ssr: false }
);

export const OverviewRecordModal = dynamic(
  () => import('./UavModals').then((m) => m.OverviewRecordModal),
  { ssr: false }
);

export const TaskCalendarModal = dynamic(
  () => import('./UavModals').then((m) => m.TaskCalendarModal),
  { ssr: false }
);

export const PreflightModal = dynamic(
  () => import('./UavModals').then((m) => m.PreflightModal),
  { ssr: false }
);

export const NewTaskModal = dynamic(
  () => import('./UavModals').then((m) => m.NewTaskModal),
  { ssr: false }
);

export const NewRouteModal = dynamic(
  () => import('./UavModals').then((m) => m.NewRouteModal),
  { ssr: false }
);

export const RouteHistoryModal = dynamic(
  () => import('./UavModals').then((m) => m.RouteHistoryModal),
  { ssr: false }
);

export const LiveTaskDetailModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveTaskDetailModal),
  { ssr: false }
);

export const LiveMarkClueModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveMarkClueModal),
  { ssr: false }
);

export const LiveGimbalModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveGimbalModal),
  { ssr: false }
);

export const LiveFullscreenModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveFullscreenModal),
  { ssr: false }
);

export const LiveRthModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveRthModal),
  { ssr: false }
);

export const LiveTakeoverModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveTakeoverModal),
  { ssr: false }
);

export const LiveEventsModal = dynamic(
  () => import('./UavModals').then((m) => m.LiveEventsModal),
  { ssr: false }
);

export const ClueFullImageModal = dynamic(
  () => import('./UavModals').then((m) => m.ClueFullImageModal),
  { ssr: false }
);

export const ClueLocateMapModal = dynamic(
  () => import('./UavModals').then((m) => m.ClueLocateMapModal),
  { ssr: false }
);

export const LinkedSafetyLedgerModal = dynamic(
  () => import('./UavModals').then((m) => m.LinkedSafetyLedgerModal),
  { ssr: false }
);

export const LinkDuplicateModal = dynamic(
  () => import('./UavModals').then((m) => m.LinkDuplicateModal),
  { ssr: false }
);

export const ReportPdfModal = dynamic(
  () => import('./UavModals').then((m) => m.ReportPdfModal),
  { ssr: false }
);

export const ReportCompareModal = dynamic(
  () => import('./UavModals').then((m) => m.ReportCompareModal),
  { ssr: false }
);

export const NewReportDraftModal = dynamic(
  () => import('./UavModals').then((m) => m.NewReportDraftModal),
  { ssr: false }
);
