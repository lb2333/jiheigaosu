import { notFound } from 'next/navigation';
import { getSubPageDef } from '@/lib/modules/registry';
import { HomeModule } from '@/modules/m01-home/HomeModule';
import { ProgressModule } from '@/modules/m02_progress/ProgressModule';
import { QualityModule } from '@/modules/m03_quality/QualityModule';
import { SafetyModule } from '@/modules/m04_safety/SafetyModule';
import { StaffModule } from '@/modules/m05_staff/StaffModule';
import { MachineModule } from '@/modules/m06_machine/MachineModule';
import { MaterialModule } from '@/modules/m07_material/MaterialModule';
import { MeasureModule } from '@/modules/m08_measure/MeasureModule';
import { UavModule } from '@/modules/m09_uav/UavModule';
import { VideoModule } from '@/modules/m10_video/VideoModule';
import { SpeedModule } from '@/modules/m11_speed/SpeedModule';
import { PinganModule } from '@/modules/m12_pingan/PinganModule';
import { PublishModule } from '@/modules/m13_publish/PublishModule';
import { BlacksoilModule } from '@/modules/m14_blacksoil/BlacksoilModule';
import { SystemModule } from '@/modules/m15-system/SystemModule';
import { AiWorkbenchModule } from '@/modules/m16-ai/AiWorkbenchModule';

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
  if (mod.id === 'staff') {
    return <StaffModule subPageId={sub.id} />;
  }
  if (mod.id === 'machine') {
    return <MachineModule subPageId={sub.id} />;
  }
  if (mod.id === 'material') {
    return <MaterialModule subPageId={sub.id} />;
  }
  if (mod.id === 'measure') {
    return <MeasureModule subPageId={sub.id} />;
  }
  if (mod.id === 'uav') {
    return <UavModule subPageId={sub.id} />;
  }
  if (mod.id === 'video') {
    return <VideoModule subPageId={sub.id} />;
  }
  if (mod.id === 'speed') {
    return <SpeedModule subPageId={sub.id} />;
  }
  if (mod.id === 'pingan') {
    return <PinganModule subPageId={sub.id} />;
  }
  if (mod.id === 'publish') {
    return <PublishModule subPageId={sub.id} />;
  }
  if (mod.id === 'blacksoil') {
    return <BlacksoilModule subPageId={sub.id} />;
  }
  if (mod.id === 'system') {
    return <SystemModule subPageId={sub.id} />;
  }
  if (mod.id === 'ai') {
    return <AiWorkbenchModule subPageId={sub.id} />;
  }

  notFound();
}
