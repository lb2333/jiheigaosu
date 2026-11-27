'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react';
import { getAllPageCatalog } from '@/lib/modules/registry';
import { STATIC_POI_OBJECTS, STATIC_WORK_SECTIONS } from '@/lib/modules/legacy-data';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

interface CmdItem {
  category: string;
  title: string;
  sub: string;
  keywords: string;
  run: () => void;
}

export function CommandPalette() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [query, setQuery] = useState('');
  const [activeIdx, setActiveIdx] = useState(0);

  const cmdkOpen = usePlatformStore((s) => s.cmdkOpen);
  const setCmdkOpen = usePlatformStore((s) => s.setCmdkOpen);
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const toggleSectionId = usePlatformStore((s) => s.toggleSectionId);
  const setSelectedPoiId = usePlatformStore((s) => s.setSelectedPoiId);
  const resetDemoState = usePlatformStore((s) => s.resetDemoState);
  const showToast = usePlatformStore((s) => s.showToast);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCmdkOpen(!usePlatformStore.getState().cmdkOpen);
        return;
      }
      if (e.key === 'Escape' && usePlatformStore.getState().cmdkOpen) {
        setCmdkOpen(false);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [setCmdkOpen]);

  useEffect(() => {
    if (cmdkOpen) {
      setQuery('');
      setActiveIdx(0);
      window.setTimeout(() => inputRef.current?.focus(), 15);
    }
  }, [cmdkOpen]);

  const allItems = useMemo<CmdItem[]>(() => {
    const pages = getAllPageCatalog().map((p) => ({
      category: p.modName,
      title: p.name,
      sub: `${p.href} · ${p.mode === 'native' ? '原生' : '双轨'}`,
      keywords: `${p.modName} ${p.name} ${p.mod} ${p.sub}`.toLowerCase(),
      run: () => router.push(p.href),
    }));

    const sections = STATIC_WORK_SECTIONS.map((s) => ({
      category: '工区定位',
      title: `${s.name}（${s.stake}）`,
      sub: activeSectionId === s.id ? '当前已选中 · 点击恢复全线' : '切换工区筛选并三维定位',
      keywords: `工区 ${s.name} ${s.stake} ${s.id}`.toLowerCase(),
      run: () => {
        const next = toggleSectionId(s.id);
        const ces = getGlobalCesiumEngine();
        if (ces.ready) {
          if (next) ces.flyToSection(next);
          else ces.flyToOverview(1.2);
        }
        showToast(next ? `已切换至 ${s.name}` : '已恢复全线视图');
      },
    }));

    const pois = Object.values(STATIC_POI_OBJECTS).map((poi) => ({
      category: '重点工程',
      title: `${poi.name}（${poi.section} · ${poi.stake}）`,
      sub: poi.stage,
      keywords: `重点工程 点位 ${poi.name} ${poi.section} ${poi.stake} ${poi.stage}`.toLowerCase(),
      run: () => {
        setSelectedPoiId(poi.id);
        router.push('/home/overview');
        const ces = getGlobalCesiumEngine();
        if (ces.ready) ces.flyToPoi(poi.id);
      },
    }));

    const actions: CmdItem[] = [
      {
        category: '快捷操作',
        title: '打开 AI 助手全屏工作台',
        sub: '/ai/exhibition',
        keywords: 'ai 助手 工作台 问答 讲解',
        run: () => router.push('/ai/exhibition'),
      },
      {
        category: '快捷操作',
        title: '进入系统管理与权限中心',
        sub: '/system/rbac',
        keywords: '系统管理 权限 用户 rbac 日志',
        run: () => router.push('/system/rbac'),
      },
      {
        category: '快捷操作',
        title: '一键重置演示状态与缓存',
        sub: '恢复初始默认状态',
        keywords: '重置 缓存 还原 reset',
        run: () => {
          const cleared = resetDemoState();
          router.push('/home/overview');
          const ces = getGlobalCesiumEngine();
          if (ces.ready) ces.flyToOverview(1.2);
          showToast(`已重置平台状态与本地缓存（清理 ${cleared} 项）`);
        },
      },
    ];

    return [...pages, ...sections, ...pois, ...actions];
  }, [activeSectionId, resetDemoState, router, setSelectedPoiId, showToast, toggleSectionId]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return q ? allItems.filter((it) => it.keywords.includes(q)) : allItems.slice(0, 18);
  }, [allItems, query]);

  if (!cmdkOpen) return null;

  return (
    <div
      className="cmdk-backdrop open"
      id="cmdkBackdrop"
      role="dialog"
      aria-modal="true"
      aria-label="快捷导航检索"
      onClick={(e) => {
        if (e.target === e.currentTarget) setCmdkOpen(false);
      }}
    >
      <div className="cmdk-dialog">
        <div className="cmdk-input-wrap">
          <Search size={16} />
          <input
            ref={inputRef}
            className="cmdk-input"
            id="cmdkInput"
            type="text"
            autoComplete="off"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setActiveIdx(0);
            }}
            onKeyDown={(e) => {
              if (!filtered.length) return;
              if (e.key === 'ArrowDown') {
                e.preventDefault();
                setActiveIdx((i) => (i + 1) % filtered.length);
              } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                setActiveIdx((i) => (i - 1 + filtered.length) % filtered.length);
              } else if (e.key === 'Enter') {
                e.preventDefault();
                const target = filtered[activeIdx];
                if (target) {
                  setCmdkOpen(false);
                  target.run();
                }
              }
            }}
            placeholder="搜索 16 大模块 / 64 个页面、工区或快捷操作（如：梁场、无人机、黑土地、二工区）..."
          />
          <span className="cmdk-kbd">ESC</span>
        </div>

        <div className="cmdk-list" id="cmdkList">
          {filtered.length ? (
            filtered.map((it, idx) => (
              <button
                key={`${it.category}-${it.title}-${idx}`}
                type="button"
                className={`cmdk-item ${idx === activeIdx ? 'active' : ''}`}
                onClick={() => {
                  setCmdkOpen(false);
                  it.run();
                }}
              >
                <span className="cmdk-item-main">
                  <span className="cmdk-item-cat">{it.category}</span>
                  <span className="cmdk-item-title">{it.title}</span>
                </span>
                <span className="cmdk-item-sub">{it.sub}</span>
              </button>
            ))
          ) : (
            <div className="jihei-empty">未匹配到页面或操作，请更换关键词</div>
          )}
        </div>

        <div className="cmdk-footer">
          <span>↑↓ 选择 · Enter 直达 · 支持 16 模块 64 页毫秒检索</span>
          <span id="cmdkCountText">
            {query.trim() ? `匹配 ${filtered.length} 项` : `推荐 ${filtered.length} / 全量 ${allItems.length} 项`}
          </span>
        </div>
      </div>
    </div>
  );
}
