'use client';

import dynamic from 'next/dynamic';

export const AddTemplateModal = dynamic(
  () => import('./PublishModals').then((m) => m.AddTemplateModal),
  { ssr: false }
);

export const CreateOrderModal = dynamic(
  () => import('./PublishModals').then((m) => m.CreateOrderModal),
  { ssr: false }
);

export const AuditOrderModal = dynamic(
  () => import('./PublishModals').then((m) => m.AuditOrderModal),
  { ssr: false }
);

export const AuthorizeOrderModal = dynamic(
  () => import('./PublishModals').then((m) => m.AuthorizeOrderModal),
  { ssr: false }
);

export const RevokeOrderModal = dynamic(
  () => import('./PublishModals').then((m) => m.RevokeOrderModal),
  { ssr: false }
);

export const ConfigPlanModal = dynamic(
  () => import('./PublishModals').then((m) => m.ConfigPlanModal),
  { ssr: false }
);

export const PlanTriggersModal = dynamic(
  () => import('./PublishModals').then((m) => m.PlanTriggersModal),
  { ssr: false }
);

export const AuditTrailModal = dynamic(
  () => import('./PublishModals').then((m) => m.AuditTrailModal),
  { ssr: false }
);
