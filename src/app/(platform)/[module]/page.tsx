import { notFound, redirect } from 'next/navigation';
import { getModuleDef } from '@/lib/modules/registry';

export default async function ModuleIndexPage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const mod = getModuleDef(module);
  if (!mod || !mod.subPages.length) {
    notFound();
  }
  redirect(`/${mod.id}/${mod.subPages[0].id}`);
}
