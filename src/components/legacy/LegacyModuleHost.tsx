/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { DATE_PRESETS, getModuleDef, type ModuleDef } from '@/lib/modules/registry';
import { LEGACY_CONFIG, LEGACY_DATA, LEGACY_ICONS } from '@/lib/modules/legacy-data';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';

declare global {
  interface Window {
    JIHEI_ASSET_BASE?: string;
    JIHEI_SCRIPT_BASE?: string;
    JIHEI_CONFIG?: any;
    JIHEI_DATA?: any;
    JIHEI_UI?: any;
    JIHEI_PLATFORM?: any;
  }
}

const STORAGE_PREFIX = 'jihei_proto_v1_';

function escHtml(val: unknown): string {
  return String(val == null ? '' : val)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function createLegacyUiKit() {
  const store = {
    prefix: STORAGE_PREFIX,
    get(key: string, fallback: unknown) {
      try {
        const raw = window.localStorage.getItem(STORAGE_PREFIX + key);
        return raw === null ? fallback : JSON.parse(raw);
      } catch {
        return fallback;
      }
    },
    set(key: string, value: unknown) {
      try {
        window.localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove(key: string) {
      try {
        window.localStorage.removeItem(STORAGE_PREFIX + key);
      } catch {
        // ignore
      }
    },
    listKeys() {
      const keys: string[] = [];
      try {
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && k.startsWith(STORAGE_PREFIX)) keys.push(k.slice(STORAGE_PREFIX.length));
        }
      } catch {
        // ignore
      }
      return keys;
    },
    resetAll() {
      const keys = this.listKeys();
      keys.forEach((k) => this.remove(k));
      return keys.length;
    },
  };

  return {
    escHtml,
    fmtNum(n: unknown, digits?: number) {
      const num = Number(n);
      if (!Number.isFinite(num)) return '-';
      return digits !== undefined ? num.toFixed(digits) : num.toLocaleString('zh-CN');
    },
    fmtPct(n: unknown, digits?: number) {
      const num = Number(n);
      if (!Number.isFinite(num)) return '0.0%';
      return `${Math.max(0, Math.min(100, num)).toFixed(digits !== undefined ? digits : 1)}%`;
    },
    store,
    renderStatusBadge(text: string, tone: string) {
      const cls = ['ok', 'warn', 'danger', 'info', 'muted'].includes(tone) ? tone : 'info';
      return `<span class="jihei-badge ${cls}">${escHtml(text)}</span>`;
    },
    renderKpiCard(opts: Record<string, any> = {}) {
      const toneClass = opts.tone ? ` tone-${escHtml(opts.tone)}` : '';
      const trendHtml = opts.trend ? `<span class="jihei-kpi-trend">${escHtml(opts.trend)}</span>` : '';
      return `<div class="jihei-kpi-card${toneClass}"><div class="jihei-kpi-label">${escHtml(opts.label || '')}</div><div class="jihei-kpi-val-row"><strong class="jihei-kpi-val">${escHtml(opts.value != null ? opts.value : '-')}</strong>${opts.unit ? `<span class="jihei-kpi-unit">${escHtml(opts.unit)}</span>` : ''}${trendHtml}</div></div>`;
    },
    renderEmptyState(message?: string) {
      return `<div class="jihei-empty"><span>${escHtml(message || '当前筛选条件下暂无数据')}</span></div>`;
    },
    renderPagination(opts: Record<string, any>) {
      const page = Math.max(1, Number(opts.page) || 1);
      const pageSize = Math.max(1, Number(opts.pageSize) || 10);
      const total = Math.max(0, Number(opts.total) || 0);
      const totalPages = Math.max(1, Math.ceil(total / pageSize));
      const attrName = opts.attrName || 'data-page';
      return `<div class="jihei-pagination"><span class="jihei-page-info">共 <strong>${total}</strong> 条 · 第 ${page} / ${totalPages} 页</span><div class="jihei-page-btns"><button type="button" class="dock-btn" ${attrName}="${Math.max(1, page - 1)}" ${page <= 1 ? 'disabled' : ''}>上一页</button><button type="button" class="dock-btn" ${attrName}="${Math.min(totalPages, page + 1)}" ${page >= totalPages ? 'disabled' : ''}>下一页</button></div></div>`;
    },
    renderSparklineSvg(values: number[], opts: Record<string, any> = {}) {
      const arr = Array.isArray(values) && values.length ? values.map(Number) : [0, 0];
      const w = opts.width || 140;
      const h = opts.height || 36;
      const pad = 4;
      const min = Math.min(...arr);
      const max = Math.max(...arr);
      const span = max - min || 1;
      const color = opts.color || '#38f2ff';
      const pts = arr.map((v, i) => `${(pad + (i / Math.max(1, arr.length - 1)) * (w - pad * 2)).toFixed(1)},${(h - pad - ((v - min) / span) * (h - pad * 2)).toFixed(1)}`);
      const area = `${pad},${h - pad} ${pts.join(' ')} ${w - pad},${h - pad}`;
      return `<svg class="jihei-sparkline" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none"><polygon points="${area}" fill="${color}" fill-opacity="0.16"/><polyline points="${pts.join(' ')}" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
    },
    renderDonutSvg(pct: number, opts: Record<string, any> = {}) {
      const size = opts.size || 64;
      const stroke = opts.stroke || 6;
      const r = (size - stroke) / 2;
      const c = 2 * Math.PI * r;
      const clamped = Math.max(0, Math.min(100, Number(pct) || 0));
      const offset = c * (1 - clamped / 100);
      const color = opts.color || '#38f2ff';
      return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="rgba(56,189,248,0.18)" stroke-width="${stroke}"/><circle cx="${size / 2}" cy="${size / 2}" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" stroke-dasharray="${c.toFixed(1)}" stroke-dashoffset="${offset.toFixed(1)}" stroke-linecap="round" transform="rotate(-90 ${size / 2} ${size / 2})"/><text x="50%" y="52%" text-anchor="middle" dominant-baseline="middle" fill="#ffffff" font-size="${Math.round(size * 0.22)}" font-weight="700">${clamped.toFixed(0)}%</text></svg>`;
    },
  };
}

const legacyRegistry: Record<string, any> = Object.create(null);
const legacyScriptPromises: Record<string, Promise<any>> = Object.create(null);

export function LegacyModuleHost({ mod, subPageId }: { mod: ModuleDef; subPageId: string }) {
  const router = useRouter();
  const hostRef = useRef<HTMLElement | null>(null);
  const prevSubRef = useRef<string>(subPageId);
  const prevSectionRef = useRef<string | null>(null);
  const prevDateRef = useRef<string>('');

  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const selectedDate = usePlatformStore((s) => s.selectedDate);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.JIHEI_ASSET_BASE = '/assets/';
    window.JIHEI_SCRIPT_BASE = '/legacy/';
    window.JIHEI_CONFIG = LEGACY_CONFIG;
    window.JIHEI_DATA = LEGACY_DATA;
    if (!window.JIHEI_UI) window.JIHEI_UI = createLegacyUiKit();

    const storeApi = usePlatformStore.getState();

    window.JIHEI_PLATFORM = {
      registerModule(modDef: any) {
        if (!modDef?.id) return;
        legacyRegistry[modDef.id] = modDef;
      },
      switchModule(targetModId: string, targetSubId?: string) {
        const targetMod = getModuleDef(targetModId);
        const sub = targetSubId || targetMod?.subPages[0]?.id || 'overview';
        router.push(`/${targetModId}/${sub}`);
        return true;
      },
      openCommandPalette() {
        usePlatformStore.getState().setCmdkOpen(true);
      },
      resetDemoState() {
        const cleared = usePlatformStore.getState().resetDemoState();
        router.push('/home/overview');
        return cleared;
      },
      getState() {
        const s = usePlatformStore.getState();
        return {
          moduleId: mod.id,
          moduleSubPageId: subPageId,
          activeSectionId: s.activeSectionId,
          selectedDate: s.selectedDate,
          selectedPoiId: s.selectedPoiId,
        };
      },
      getRegisteredModules: () => Object.keys(legacyRegistry),
      ui: window.JIHEI_UI,
      store: window.JIHEI_UI.store,
      escHtml,
      showToast: (msg: string) => storeApi.showToast(msg),
      openModal: (title: string, html: string) => storeApi.openModalHtml(title, html),
      closeModal: () => storeApi.closeModal(),
      icons: LEGACY_ICONS,
      data: LEGACY_DATA,
      cesium: () => getGlobalCesiumEngine(),
    };
  }, [mod.id, router, subPageId]);

  useEffect(() => {
    let cancelled = false;

    async function loadAndRender() {
      const hostEl = hostRef.current;
      if (!hostEl) return;

      if (!legacyRegistry[mod.id] && mod.legacyScript) {
        if (!legacyScriptPromises[mod.id]) {
          legacyScriptPromises[mod.id] = new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = mod.legacyScript!;
            script.async = true;
            script.onload = () => {
              if (legacyRegistry[mod.id]) resolve(legacyRegistry[mod.id]);
              else reject(new Error(`Legacy module ${mod.id} did not register`));
            };
            script.onerror = () => reject(new Error(`Failed to load ${mod.legacyScript}`));
            document.head.appendChild(script);
          });
        }
        await legacyScriptPromises[mod.id];
      }

      if (cancelled || !hostRef.current) return;

      const modDef = legacyRegistry[mod.id];
      if (!modDef) return;

      if (prevSubRef.current !== subPageId && typeof modDef.onSubPageLeave === 'function') {
        try {
          modDef.onSubPageLeave(prevSubRef.current, subPageId);
        } catch (err) {
          console.warn(err);
        }
      }
      prevSubRef.current = subPageId;

      const mode =
        typeof modDef.getCesiumMode === 'function'
          ? modDef.getCesiumMode(subPageId)
          : modDef.cesiumMode || 'opaque';
      setCesiumMode(mode);

      hostEl.className =
        'module-stage-host active' +
        (mode === 'opaque' ? ' mode-opaque' : mode === 'dimmed' ? ' mode-dimmed' : '');

      const preset = DATE_PRESETS.find((d) => d.date === usePlatformStore.getState().selectedDate) ?? DATE_PRESETS[0];
      const storeApi = usePlatformStore.getState();

      modDef.render(hostEl, subPageId, {
        state: {
          moduleId: mod.id,
          moduleSubPageId: subPageId,
          activeSectionId: storeApi.activeSectionId,
          selectedDate: storeApi.selectedDate,
          selectedPoiId: storeApi.selectedPoiId,
        },
        data: LEGACY_DATA,
        icons: LEGACY_ICONS,
        cesium: getGlobalCesiumEngine(),
        ui: window.JIHEI_UI,
        store: window.JIHEI_UI.store,
        datePreset: preset,
        escHtml,
        showToast: (msg: string) => storeApi.showToast(msg),
        openModal: (title: string, html: string) => storeApi.openModalHtml(title, html),
        closeModal: () => storeApi.closeModal(),
        switchModule: (targetMod: string, targetSub?: string) => {
          const targetDef = getModuleDef(targetMod);
          router.push(`/${targetMod}/${targetSub || targetDef?.subPages[0]?.id || 'overview'}`);
        },
      });

      prevSectionRef.current = storeApi.activeSectionId;
      prevDateRef.current = storeApi.selectedDate;
    }

    loadAndRender().catch((err) => {
      console.error('[LegacyModuleHost]', err);
      usePlatformStore.getState().showToast(`模块「${mod.name}」加载异常`);
    });

    return () => {
      cancelled = true;
    };
  }, [mod, router, setCesiumMode, subPageId]);

  // React to global section change without recreating script
  useEffect(() => {
    if (prevSectionRef.current === activeSectionId) return;
    prevSectionRef.current = activeSectionId;
    const modDef = legacyRegistry[mod.id];
    const hostEl = hostRef.current;
    if (!modDef || !hostEl) return;

    const prevChild = hostEl.firstChild;
    if (typeof modDef.onSectionChange === 'function') {
      try {
        modDef.onSectionChange(activeSectionId, subPageId);
      } catch (err) {
        console.warn(err);
      }
    }
    if (hostEl.firstChild === prevChild && mod.id !== 'blacksoil') {
      const storeApi = usePlatformStore.getState();
      const preset = DATE_PRESETS.find((d) => d.date === storeApi.selectedDate) ?? DATE_PRESETS[0];
      modDef.render(hostEl, subPageId, {
        state: {
          moduleId: mod.id,
          moduleSubPageId: subPageId,
          activeSectionId,
          selectedDate: storeApi.selectedDate,
        },
        data: LEGACY_DATA,
        icons: LEGACY_ICONS,
        cesium: getGlobalCesiumEngine(),
        ui: window.JIHEI_UI,
        store: window.JIHEI_UI.store,
        datePreset: preset,
        escHtml,
        showToast: (msg: string) => storeApi.showToast(msg),
        openModal: (title: string, html: string) => storeApi.openModalHtml(title, html),
        closeModal: () => storeApi.closeModal(),
        switchModule: (targetMod: string, targetSub?: string) => {
          const targetDef = getModuleDef(targetMod);
          router.push(`/${targetMod}/${targetSub || targetDef?.subPages[0]?.id || 'overview'}`);
        },
      });
    }
  }, [activeSectionId, mod.id, router, subPageId]);

  // React to global date change
  useEffect(() => {
    if (!prevDateRef.current) {
      prevDateRef.current = selectedDate;
      return;
    }
    if (prevDateRef.current === selectedDate) return;
    prevDateRef.current = selectedDate;
    const modDef = legacyRegistry[mod.id];
    const hostEl = hostRef.current;
    if (!modDef || !hostEl) return;
    const preset = DATE_PRESETS.find((d) => d.date === selectedDate) ?? DATE_PRESETS[0];
    if (typeof modDef.onDateChange === 'function') {
      try {
        modDef.onDateChange(selectedDate, subPageId, preset);
      } catch (err) {
        console.warn(err);
      }
    } else {
      const storeApi = usePlatformStore.getState();
      modDef.render(hostEl, subPageId, {
        state: {
          moduleId: mod.id,
          moduleSubPageId: subPageId,
          activeSectionId: storeApi.activeSectionId,
          selectedDate,
        },
        data: LEGACY_DATA,
        icons: LEGACY_ICONS,
        cesium: getGlobalCesiumEngine(),
        ui: window.JIHEI_UI,
        store: window.JIHEI_UI.store,
        datePreset: preset,
        escHtml,
        showToast: (msg: string) => storeApi.showToast(msg),
        openModal: (title: string, html: string) => storeApi.openModalHtml(title, html),
        closeModal: () => storeApi.closeModal(),
        switchModule: (targetMod: string, targetSub?: string) => {
          const targetDef = getModuleDef(targetMod);
          router.push(`/${targetMod}/${targetSub || targetDef?.subPages[0]?.id || 'overview'}`);
        },
      });
    }
  }, [mod.id, router, selectedDate, subPageId]);

  // Cleanup when leaving this legacy module completely
  useEffect(() => {
    return () => {
      const modDef = legacyRegistry[mod.id];
      if (modDef && typeof modDef.onLeave === 'function') {
        try {
          modDef.onLeave();
        } catch (err) {
          console.warn(err);
        }
      }
      getGlobalCesiumEngine().clearModuleEntities(mod.id);
    };
  }, [mod.id]);

  return <section ref={hostRef} className="module-stage-host active mode-opaque" id="moduleStageHost" />;
}
