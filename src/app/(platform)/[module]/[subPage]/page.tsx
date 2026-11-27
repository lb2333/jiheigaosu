import { notFound } from 'next/navigation';
import { getSubPageDef } from '@/lib/modules/registry';
import { HomeModule } from '@/modules/m01-home/HomeModule';
import { ProgressModule } from '@/modules/m02_progress/ProgressModule';
import { QualityModule } from '@/modules/m03_quality/QualityModule';
import { SafetyModule } from '@/modules/m04_safety/SafetyModule';
import { MeasureModule } from '@/modules/m08_measure/MeasureModule';
import { SystemModule } from '@/modules/m15-system/SystemModule';
import { AiWorkbenchModule } from '@/modules/m16-ai/AiWorkbenchModule';
import { LegacyModuleHost } from '@/components/legacy/LegacyModuleHost';

export default async function ModuleSubPage({
  params,
}: {
  params: Promise<{ module: string; subPage: string }>;
}) {
  const { module, subPage } = await params;
  const resolved = getSubPageDef(module, subPage);
  if (!resolved) {
    notFound();
  }

  const { mod, sub } = resolved;

  if (mod.id === 'home') {
    return <HomeModule subPageId={sub.id} />;
  }
  if (mod.id === 'progress') {
    return <ProgressModule subPageId={sub.id} />;
  }
  if (mod.id === 'quality') {
    return <QualityModule subPageId={sub.id} />;
  }
  if (mod.id === 'safety') {
    return <SafetyModule subPageId={sub.id} />;
  }
  if (mod.id === 'measure') {
    return <MeasureModule subPageId={sub.id} />;
  }
  if (mod.id === 'system') {
    return <SystemModule subPageId={sub.id} />;
  }
  if (mod.id === 'ai') {
    return <AiWorkbenchModule subPageId={sub.id} />;
  }

  return <LegacyModuleHost mod={mod} subPageId={sub.id} />;
}
