import { notFound } from 'next/navigation';
import { getSubPageDef } from '@/lib/modules/registry';
import { ModuleStageLoader } from '@/components/shell/ModuleStageLoader';

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

  return <ModuleStageLoader moduleId={mod.id} subPageId={sub.id} />;
}
