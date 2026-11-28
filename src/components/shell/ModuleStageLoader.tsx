'use client';

import type { ComponentType } from 'react';
import dynamic from 'next/dynamic';

function ModuleStageSkeleton() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-15 flex items-center justify-center p-6"
      aria-busy="true"
      aria-label="正在加载业务模块视图"
    >
      <div className="w-[min(420px,90%)] rounded-xl border border-cyan-400/30 bg-[#081c42]/80 px-5 py-4 shadow-xl backdrop-blur-md">
        <div className="flex items-center gap-2.5">
          <span className="h-4 w-1 rounded-full bg-amber-300 shadow-[0_0_8px_rgba(250,204,21,0.65)]" />
          <div className="h-3.5 w-36 animate-pulse rounded bg-sky-300/25" />
          <span className="ml-auto text-xs text-sky-200/75">正在加载业务模块视图...</span>
        </div>
        <div className="mt-3.5 space-y-2.5">
          <div className="h-3 w-full animate-pulse rounded bg-sky-400/15" />
          <div className="h-3 w-5/6 animate-pulse rounded bg-sky-400/15" />
          <div className="h-3 w-2/3 animate-pulse rounded bg-sky-400/10" />
        </div>
      </div>
    </div>
  );
}

const loadingFallback = () => <ModuleStageSkeleton />;

const MODULE_COMPONENTS: Record<string, ComponentType<{ subPageId: string }>> = {
  home: dynamic(() => import('@/modules/m01-home/HomeModule').then((m) => m.HomeModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  progress: dynamic(() => import('@/modules/m02_progress/ProgressModule').then((m) => m.ProgressModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  quality: dynamic(() => import('@/modules/m03_quality/QualityModule').then((m) => m.QualityModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  safety: dynamic(() => import('@/modules/m04_safety/SafetyModule').then((m) => m.SafetyModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  staff: dynamic(() => import('@/modules/m05_staff/StaffModule').then((m) => m.StaffModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  machine: dynamic(() => import('@/modules/m06_machine/MachineModule').then((m) => m.MachineModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  material: dynamic(() => import('@/modules/m07_material/MaterialModule').then((m) => m.MaterialModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  measure: dynamic(() => import('@/modules/m08_measure/MeasureModule').then((m) => m.MeasureModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  uav: dynamic(() => import('@/modules/m09_uav/UavModule').then((m) => m.UavModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  video: dynamic(() => import('@/modules/m10_video/VideoModule').then((m) => m.VideoModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  speed: dynamic(() => import('@/modules/m11_speed/SpeedModule').then((m) => m.SpeedModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  pingan: dynamic(() => import('@/modules/m12_pingan/PinganModule').then((m) => m.PinganModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  publish: dynamic(() => import('@/modules/m13_publish/PublishModule').then((m) => m.PublishModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  blacksoil: dynamic(() => import('@/modules/m14_blacksoil/BlacksoilModule').then((m) => m.BlacksoilModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  system: dynamic(() => import('@/modules/m15-system/SystemModule').then((m) => m.SystemModule), {
    ssr: false,
    loading: loadingFallback,
  }),
  ai: dynamic(() => import('@/modules/m16-ai/AiWorkbenchModule').then((m) => m.AiWorkbenchModule), {
    ssr: false,
    loading: loadingFallback,
  }),
};

const preloadedModules = new Set<string>();

/** Preload a module chunk on hover/focus without blocking initial bundle or SSR. */
export function preloadModule(moduleId: string): void {
  if (typeof window === 'undefined' || preloadedModules.has(moduleId)) {
    return;
  }
  preloadedModules.add(moduleId);

  switch (moduleId) {
    case 'home':
      void import('@/modules/m01-home/HomeModule');
      break;
    case 'progress':
      void import('@/modules/m02_progress/ProgressModule');
      break;
    case 'quality':
      void import('@/modules/m03_quality/QualityModule');
      break;
    case 'safety':
      void import('@/modules/m04_safety/SafetyModule');
      break;
    case 'staff':
      void import('@/modules/m05_staff/StaffModule');
      break;
    case 'machine':
      void import('@/modules/m06_machine/MachineModule');
      break;
    case 'material':
      void import('@/modules/m07_material/MaterialModule');
      break;
    case 'measure':
      void import('@/modules/m08_measure/MeasureModule');
      break;
    case 'uav':
      void import('@/modules/m09_uav/UavModule');
      break;
    case 'video':
      void import('@/modules/m10_video/VideoModule');
      break;
    case 'speed':
      void import('@/modules/m11_speed/SpeedModule');
      break;
    case 'pingan':
      void import('@/modules/m12_pingan/PinganModule');
      break;
    case 'publish':
      void import('@/modules/m13_publish/PublishModule');
      break;
    case 'blacksoil':
      void import('@/modules/m14_blacksoil/BlacksoilModule');
      break;
    case 'system':
      void import('@/modules/m15-system/SystemModule');
      break;
    case 'ai':
      void import('@/modules/m16-ai/AiWorkbenchModule');
      break;
  }
}

/** Client-side dispatcher that lazy-loads only the active module bundle. */
export function ModuleStageLoader({
  moduleId,
  subPageId,
}: {
  moduleId: string;
  subPageId: string;
}) {
  const ModuleComponent = MODULE_COMPONENTS[moduleId];
  if (!ModuleComponent) {
    return null;
  }
  return <ModuleComponent subPageId={subPageId} />;
}
