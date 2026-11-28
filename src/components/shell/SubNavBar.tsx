'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Calendar, Search, Settings } from 'lucide-react';
import { DATE_PRESETS, getModuleDef, MODULE_REGISTRY } from '@/lib/modules/registry';
import { STATIC_WORK_SECTIONS } from '@/lib/modules/platform-data';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

export function SubNavBar() {
  const pathname = usePathname();
  const router = useRouter();
  const segments = pathname.split('/').filter(Boolean);
  const currentModId = segments[0] || 'home';
  const mod = getModuleDef(currentModId) ?? MODULE_REGISTRY[0];
  const currentSubId = segments[1] || mod.subPages[0]?.id || 'overview';

  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const toggleSectionId = usePlatformStore((s) => s.toggleSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setSelectedDate = usePlatformStore((s) => s.setSelectedDate);
  const cesiumMode = usePlatformStore((s) => s.cesiumMode);
  const setCmdkOpen = usePlatformStore((s) => s.setCmdkOpen);
  const openModal = usePlatformStore((s) => s.openModal);
  const showToast = usePlatformStore((s) => s.showToast);
  const hydrateSession = usePlatformStore((s) => s.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  function handleSectionClick(secId: string) {
    const next = toggleSectionId(secId);
    const ces = getGlobalCesiumEngine();
    const cesVisible = cesiumMode !== 'opaque';
    if (!next) {
      if (cesVisible && ces.ready) ces.flyToOverview(1.2);
      showToast('已恢复全线（一至六工区）汇总视图');
    } else {
      const sec = STATIC_WORK_SECTIONS.find((s) => s.id === next);
      if (cesVisible && ces.ready) ces.flyToSection(next);
      if (sec) {
        showToast(cesVisible ? `已三维飞抵 ${sec.name}（${sec.stake}）` : `已筛选 ${sec.name}（${sec.stake}）数据`);
      }
    }
  }

  function handleDateCycle() {
    const idx = DATE_PRESETS.findIndex((d) => d.date === selectedDate);
    const next = DATE_PRESETS[(idx + 1) % DATE_PRESETS.length];
    setSelectedDate(next.date);
    showToast(`已切换统计基准日期：${next.date}（${next.label}）`);
  }

  function handlePlatformInfoModal() {
    const nativeCount = MODULE_REGISTRY.filter((m) => m.mode === 'native').length;
    const totalPages = MODULE_REGISTRY.reduce((sum, m) => sum + m.subPages.length, 0);
    openModal('系统平台 · Next.js 全栈原生架构状态', [
      {
        type: 'paragraph',
        text: `当前平台已全面升级为 Next.js 16 + PostgreSQL 16 + Better Auth RBAC + Vercel AI SDK 原生全栈架构，全量覆盖 ${MODULE_REGISTRY.length} 个业务模块 / ${totalPages} 个页面。`,
      },
      {
        type: 'stats',
        items: [
          {
            label: '原生 React 全栈模块',
            value: `${nativeCount} / ${MODULE_REGISTRY.length} 个模块（100% 原生化）`,
          },
          { label: '持久化三维底座', value: `CesiumJS 跨 ${totalPages} 页共享引擎` },
          { label: '统计基准日期', value: selectedDate },
        ],
      },
      {
        type: 'resetDemoFooter',
        hint: '支持一键清理本地偏好缓存并重置全线总览视图',
        buttonLabel: '一键重置演示状态',
      },
    ]);
  }

  return (
    <div className="sub-header">
      <div className="sub-tabs" id="subTabs">
        {mod.subPages.map((p, idx) => {
          const isActive = p.id === currentSubId;
          const isGold = isActive && mod.id === 'home' && (p.id === 'overview' || p.id === 'showcase');
          return (
            <span key={p.id} className="inline-flex items-center">
              {idx > 0 ? <span className="sub-tab-divider" /> : null}
              <Link
                href={`/${mod.id}/${p.id}`}
                className={`sub-tab-btn ${isActive ? 'active' : ''} ${isGold ? 'gold-text' : ''}`}
                data-page={p.id}
              >
                {p.name}
              </Link>
            </span>
          );
        })}
      </div>

      <span className="sub-group-divider" />

      <div className="section-filters" id="sectionFilters">
        {STATIC_WORK_SECTIONS.map((s) => (
          <button
            key={s.id}
            type="button"
            className={`section-pill ${activeSectionId === s.id ? 'active' : ''}`}
            data-sec={s.id}
            onClick={() => handleSectionClick(s.id)}
          >
            {s.name}
          </button>
        ))}
      </div>

      <span className="sub-group-divider" />

      <div className="header-meta">
        <button
          type="button"
          className="cmdk-trigger-btn"
          id="cmdkTriggerBtn"
          title="快捷搜索与直达全平台64页 (Ctrl+K)"
          onClick={() => setCmdkOpen(true)}
        >
          <Search size={13} />
          <span className="cmdk-trigger-label">直达</span>
          <span className="cmdk-kbd">Ctrl+K</span>
        </button>

        <button type="button" className="demo-badge" id="demoInfoBtn" onClick={handlePlatformInfoModal}>
          <span className="demo-live-dot" aria-hidden="true" />
          <span>全栈数据</span>
        </button>

        <div
          className="date-chip"
          id="globalDateBtn"
          title="点击切换历史统计基准日期（全平台数据联动）"
          onClick={handleDateCycle}
        >
          <Calendar size={14} />
          <span id="globalDateText">{selectedDate}</span>
        </div>

        <button
          type="button"
          className={`sys-gear-btn ${currentModId === 'system' ? 'active' : ''}`}
          id="sysManageBtn"
          title="系统管理（15.系统管理）"
          onClick={() => router.push('/system/base')}
        >
          <Settings size={14} />
        </button>
      </div>
    </div>
  );
}
