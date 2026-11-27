import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { TopHeader } from '@/components/shell/TopHeader';
import { SubNavBar } from '@/components/shell/SubNavBar';
import { CesiumBackdrop } from '@/components/cesium/CesiumBackdrop';
import { AiFloatingDrawer } from '@/components/shell/AiFloatingDrawer';
import { CommandPalette } from '@/components/shell/CommandPalette';
import { GlobalModalHost } from '@/components/shell/GlobalModalHost';

export default async function PlatformLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) {
    redirect('/login');
  }

  return (
    <div className="app-shell">
      <TopHeader userName={session.user.name} userRole={session.user.role} />
      <SubNavBar />
      <main className="stage-viewport">
        <CesiumBackdrop />
        {children}
        <AiFloatingDrawer />
      </main>
      <CommandPalette />
      <GlobalModalHost />
    </div>
  );
}
