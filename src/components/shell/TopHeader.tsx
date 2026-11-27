'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LogOut, UserCheck } from 'lucide-react';
import { MODULE_REGISTRY } from '@/lib/modules/registry';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { authClient } from '@/lib/auth-client';

export function TopHeader({
  userName,
  userRole,
}: {
  userName?: string | null;
  userRole?: string | null;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveSectionId = usePlatformStore((s) => s.setActiveSectionId);
  const showToast = usePlatformStore((s) => s.showToast);

  const segments = pathname.split('/').filter(Boolean);
  const currentModId = segments[0] || 'home';
  const topMods = MODULE_REGISTRY.filter((m) => m.showInTopNav);

  async function handleSignOut() {
    await authClient.signOut();
    router.push('/login');
    router.refresh();
  }

  return (
    <header className="top-header">
      <div
        className="brand-area"
        id="brandHomeBtn"
        title="返回综合首页全线视图"
        onClick={() => {
          setActiveSectionId(null);
          const ces = getGlobalCesiumEngine();
          if (ces.ready) ces.flyToOverview(1.2);
          router.push('/home/overview');
          showToast('已返回综合首页全线三维总览视图');
        }}
      >
        <svg className="brand-logo" viewBox="0 0 42 32" fill="none">
          <defs>
            <linearGradient id="gBrandNext" x1="0" y1="0" x2="42" y2="32" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38f2ff" />
              <stop offset="100%" stopColor="#1d8aff" />
            </linearGradient>
          </defs>
          <path d="M3 26C9 15 19 8 38 6" stroke="url(#gBrandNext)" strokeWidth="2.6" strokeLinecap="round" />
          <path d="M7 28L18 13H24L35 28H26L21 19L16 28H7Z" fill="url(#gBrandNext)" opacity="0.92" />
          <path d="M21 14V27" stroke="#071a38" strokeWidth="1.8" strokeDasharray="3 2.5" />
        </svg>
        <div className="brand-text">
          <span className="brand-title">G1211吉黑高速明水至北安段</span>
          <span className="brand-subtitle">工程建设项目综合管理平台</span>
        </div>
      </div>

      <nav className="main-nav" id="mainNav">
        {topMods.map((m) => {
          const defaultSub = m.subPages[0]?.id ?? 'overview';
          const isActive = currentModId === m.id;
          return (
            <Link
              key={m.id}
              href={`/${m.id}/${defaultSub}`}
              className={`main-nav-item ${isActive ? 'active' : ''}`}
              data-mod={m.id}
            >
              {m.name}
            </Link>
          );
        })}
      </nav>

      {userName ? (
        <div className="ml-auto flex items-center gap-2 shrink-0">
          <span className="hidden xl:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] bg-sky-950/75 border border-sky-400/35 text-sky-200">
            <UserCheck size={12} className="text-cyan-300" />
            <span>{userName}</span>
            {userRole ? (
              <span className="text-cyan-300/90 font-semibold">[{userRole}]</span>
            ) : null}
          </span>
          <button
            type="button"
            onClick={handleSignOut}
            title="退出登录"
            className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-[11px] border border-sky-400/35 bg-sky-950/70 text-sky-200 hover:border-cyan-300 hover:text-white cursor-pointer"
          >
            <LogOut size={12} />
            <span className="hidden sm:inline">退出</span>
          </button>
        </div>
      ) : null}
    </header>
  );
}
