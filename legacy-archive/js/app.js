/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   1.综合首页 四个页面高保真交互引擎
   ========================================================================== */

(function () {
  'use strict';

  const DATA = window.JIHEI_DATA;
  const CONFIG = window.JIHEI_CONFIG || {};
  const UI = window.JIHEI_UI || {};
  const STORE = UI.store || { get: (_, f) => f, set: () => false, remove: () => {}, resetAll: () => 0, listKeys: () => [] };
  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';
  const SCRIPT_BASE = window.JIHEI_SCRIPT_BASE || '';

  const DEFAULT_MODULE_SCRIPTS = {
    progress:  'js/modules/m02_progress.js',
    quality:   'js/modules/m03_quality.js',
    safety:    'js/modules/m04_safety.js',
    staff:     'js/modules/m05_staff.js',
    machine:   'js/modules/m06_machine.js',
    material:  'js/modules/m07_material.js',
    measure:   'js/modules/m08_measure.js',
    uav:       'js/modules/m09_uav.js',
    video:     'js/modules/m10_video.js',
    speed:     'js/modules/m11_speed.js',
    pingan:    'js/modules/m12_pingan.js',
    publish:   'js/modules/m13_publish.js',
    blacksoil: 'js/modules/m14_blacksoil.js',
    system:    'js/modules/m15_system.js',
    ai:        'js/modules/m16_ai.js'
  };
  const MODULE_SCRIPTS = CONFIG.moduleScripts || DEFAULT_MODULE_SCRIPTS;

  const IMG = {
    corridor: ASSET_BASE + 'corridor_aerial.jpg',
    milestoneBefore: ASSET_BASE + 'milestone_before.jpg',
    milestoneAfter: ASSET_BASE + 'milestone_after.jpg',
    showcase: ASSET_BASE + 'showcase_viaduct.jpg'
  };

  /* ------------------------------------------------------------------------
     INLINE SVG ICON LIBRARY (Zero external CDN dependency)
     ------------------------------------------------------------------------ */
  const ICONS = {
    brand: `<svg class="brand-logo" viewBox="0 0 42 32" fill="none">
      <defs>
        <linearGradient id="gBrand" x1="0" y1="0" x2="42" y2="32" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stop-color="#38f2ff"/>
          <stop offset="100%" stop-color="#1d8aff"/>
        </linearGradient>
      </defs>
      <path d="M3 26C9 15 19 8 38 6" stroke="url(#gBrand)" stroke-width="2.6" stroke-linecap="round"/>
      <path d="M7 28L18 13H24L35 28H26L21 19L16 28H7Z" fill="url(#gBrand)" opacity="0.92"/>
      <path d="M21 14V27" stroke="#071a38" stroke-width="1.8" stroke-dasharray="3 2.5"/>
    </svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    chevronDown: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>`,
    chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>`,
    close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
    road: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38f2ff" stroke-width="2"><path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/></svg>`,
    excavator: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.8"><rect x="3" y="15" width="11" height="4" rx="2"/><path d="M6 15V10h5l2 5M11 11l5-5 4 4-2 3"/></svg>`,
    helmet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><path d="M4 15a8 8 0 0116 0H4z"/><path d="M2 15h20v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z"/><path d="M12 7v4"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    yard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><path d="M3 20V8l9-5 9 5v12"/><path d="M7 20v-7h10v7"/><path d="M7 13h10"/></svg>`,
    subgrade: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18h18M5 18l3-7h8l3 7M9 11V7l5 2"/></svg>`,
    bridge: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9h20M2 13h20M6 13v7M18 13v7M6 13a6 6 0 0112 0"/></svg>`,
    pavement: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20L8 4M20 20L16 4M12 7v3M12 13v4"/></svg>`,
    guardrail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9h18M3 14h18M6 6v13M18 6v13"/></svg>`,
    leaf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/><path d="M2 21c0-3 1.9-5.4 5.1-6.7"/></svg>`,
    plant: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V7a2 2 0 012-2h3a2 2 0 012 2v13M13 20v-9l4-2 3 2v9M2 20h20"/></svg>`,
    flag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38f2ff" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
    handshake: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7dd3fc" stroke-width="1.8"><path d="M8 11l4 4 6-6"/><path d="M3 12l4-4 4 3 4-3 6 5-4 4-5-2-4 2-5-5z"/></svg>`,
    play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    volume: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 010 7M19 5a10 10 0 010 14"/></svg>`,
    mute: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`,
    fullscreen: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    doc: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
    photo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 20"/></svg>`,
    video: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/></svg>`,
    drone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h5M14 7h5M7.5 7l2.5 5h4l2.5-5M8 17l2-5h4l2 5M9 12h6"/></svg>`,
    bim: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/><path d="M12 22V12M21 7l-9 5-9-5"/></svg>`,
    pin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    camera: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 4v6c0 5.2-3.4 9.2-8 10-4.6-.8-8-4.8-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
    speed: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l6-6 4 4 8-8"/><polyline points="15 7 21 7 21 13"/></svg>`,
    hall: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18M4 18h16M6 18V9l6-4 6 4v9M10 18v-5h4v5"/></svg>`,
    robot: `<svg width="30" height="30" viewBox="0 0 36 36" fill="none">
      <line x1="18" y1="4" x2="18" y2="9" stroke="#7dd3fc" stroke-width="2.2" stroke-linecap="round"/>
      <circle cx="18" cy="4" r="2.2" fill="#38f2ff"/>
      <rect x="6" y="9" width="24" height="19" rx="9" fill="#e0f2fe" stroke="#38f2ff" stroke-width="1.6"/>
      <rect x="10" y="13" width="16" height="10" rx="5" fill="#09214d"/>
      <circle cx="14.5" cy="18" r="2.1" fill="#38f2ff"/>
      <circle cx="21.5" cy="18" r="2.1" fill="#38f2ff"/>
      <path d="M15 24.5c1.8 1.2 4.2 1.2 6 0" stroke="#0c4a9e" stroke-width="1.6" stroke-linecap="round"/>
    </svg>`
  };

  /* ------------------------------------------------------------------------
     GLOBAL REACTIVE STATE & MULTI-MODULE PLUGIN REGISTRY (Modules 2 ~ 16)
     ------------------------------------------------------------------------ */
  const moduleRegistry = Object.create(null);
  const moduleLoadPromises = Object.create(null);
  let switchSeq = 0;

  function parseHashRoute(hashStr) {
    const raw = String(hashStr || '').replace(/^#/, '').trim();
    if (!raw) {
      return { moduleId: 'home', subPageId: document.body.dataset.initialPage || 'overview' };
    }
    if (raw.includes('/')) {
      const [modId, subId] = raw.split('/');
      if (modId === 'home') {
        return {
          moduleId: 'home',
          subPageId: ['overview', 'roaming', 'milestone', 'showcase'].includes(subId) ? subId : 'overview'
        };
      }
      return { moduleId: modId || 'home', subPageId: subId || '' };
    }
    if (['overview', 'roaming', 'milestone', 'showcase'].includes(raw)) {
      return { moduleId: 'home', subPageId: raw };
    }
    if (MODULE_SCRIPTS[raw] || moduleRegistry[raw]) {
      return { moduleId: raw, subPageId: '' };
    }
    return { moduleId: 'home', subPageId: document.body.dataset.initialPage || 'overview' };
  }

  const initialRoute = parseHashRoute(location.hash);
  const savedSession = STORE.get('session', {}) || {};
  const DATE_PRESETS = Array.isArray(CONFIG.datePresets) && CONFIG.datePresets.length
    ? CONFIG.datePresets
    : [
        { date: '2026-11-25', label: '最新一期', progressDelta: 0.0, qualityDelta: 0.0, safetyDelta: 0.0 },
        { date: '2026-11-20', label: '11月下旬初', progressDelta: -1.4, qualityDelta: -0.1, safetyDelta: -0.2 },
        { date: '2026-10-31', label: '10月末归档', progressDelta: -4.8, qualityDelta: -0.3, safetyDelta: -0.5 },
        { date: '2026-09-25', label: '三季度末', progressDelta: -9.6, qualityDelta: -0.6, safetyDelta: -0.9 }
      ];

  const validDateStr = DATE_PRESETS.some(d => d.date === savedSession.selectedDate)
    ? savedSession.selectedDate
    : DATA.defaultDate;

  const state = {
    moduleId: initialRoute.moduleId,
    moduleSubPageId: initialRoute.subPageId,
    page: initialRoute.moduleId === 'home' && ['overview', 'roaming', 'milestone', 'showcase'].includes(initialRoute.subPageId)
      ? initialRoute.subPageId
      : (document.body.dataset.initialPage || 'overview'),
    activeSectionId: DATA.workSections.some(s => s.id === savedSession.activeSectionId) ? savedSession.activeSectionId : null,
    selectedDate: validDateStr,
    mgmtTab: ['progress', 'quality', 'safety'].includes(savedSession.mgmtTab) ? savedSession.mgmtTab : 'progress',
    selectedPoiId: 'bridgeA',
    poiDetailVisible: true,
    // Page 1 map & layers
    p1Layers: Object.assign({
      satellite: false,
      uav: true,
      bim: false,
      pois: true,
      sections: true,
      route: true
    }, savedSession.p1Layers || {}),
    p1VideoPlaying: true,
    p1VideoSec: 12,
    p1VideoMuted: false,

    // Page 2 roaming
    roamingIndex: 1, // 默认 桥梁示例A (2 / 5)
    roamingPlaying: true,
    roamingDwell: savedSession.roamingDwell !== undefined ? !!savedSession.roamingDwell : true,
    roamingView: savedSession.roamingView === 'along' ? 'along' : 'overhead',
    roamingAutoMode: 'auto', // auto | free
    roamingRenderMode: 'real', // real | design
    roamingSpeed: Number(savedSession.roamingSpeed) || 1.0,

    // Page 3 milestone
    msSection: '二工区',
    msObject: '桥梁示例A',
    msLeftDate: '2026-09-25',
    msRightDate: '2026-11-20',
    msActiveNodeId: 'm4',
    msSplitPct: 50,
    msZoom: 1,
    msFilters: { photo: true, uav: true, progress: true },

    // Page 4 showcase
    scTopicIndex: 0,
    scPlaying: false,
    scAutoCarousel: false,
    scHallMode: false,
    scMinimized: false,
    scClosed: false,
    scCurrentSec: 0,
    scVolume: 78,
    scMuted: false,
    scSpeed: 1.0
  };

  function persistSession() {
    STORE.set('session', {
      activeSectionId: state.activeSectionId,
      selectedDate: state.selectedDate,
      mgmtTab: state.mgmtTab,
      p1Layers: state.p1Layers,
      roamingDwell: state.roamingDwell,
      roamingView: state.roamingView,
      roamingSpeed: state.roamingSpeed
    });
  }

  function getActiveDatePreset() {
    return DATE_PRESETS.find(d => d.date === state.selectedDate) || DATE_PRESETS[0];
  }

  function resetDemoState() {
    const cleared = STORE.resetAll();
    state.activeSectionId = null;
    state.selectedDate = DATA.defaultDate;
    state.mgmtTab = 'progress';
    state.selectedPoiId = 'bridgeA';
    state.poiDetailVisible = true;
    state.p1Layers = { satellite: false, uav: true, bim: false, pois: true, sections: true, route: true };
    state.roamingIndex = 1;
    state.roamingDwell = true;
    state.roamingView = 'overhead';
    state.roamingAutoMode = 'auto';
    state.roamingRenderMode = 'real';
    state.roamingSpeed = 1.0;
    const dateEl = document.getElementById('globalDateText');
    if (dateEl) dateEl.textContent = state.selectedDate;
    closeModal();
    switchModule('home', 'overview');
    if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToOverview(1.2);
    showToast(`已重置全平台演示状态与本地缓存（清理 ${cleared} 项）`);
  }

  /* ------------------------------------------------------------------------
     UTILITIES
     ------------------------------------------------------------------------ */
  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  function showToast(msg) {
    const wrap = document.getElementById('toastContainer');
    if (!wrap) return;
    const el = document.createElement('div');
    el.className = 'toast-item';
    el.textContent = msg;
    wrap.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(-6px)';
      el.style.transition = 'all 0.25s ease';
      setTimeout(() => el.remove(), 260);
    }, 2400);
  }

  function openModal(title, bodyHtml) {
    const backdrop = document.getElementById('globalModal');
    document.getElementById('modalTitle').textContent = title;
    document.getElementById('modalBody').innerHTML = bodyHtml;
    backdrop.classList.add('open');
  }

  function closeModal() {
    document.getElementById('globalModal').classList.remove('open');
  }

  /* ------------------------------------------------------------------------
     SHELL MOUNT & RENDER
     ------------------------------------------------------------------------ */
  function mountApp() {
    const root = document.getElementById('app');
    root.innerHTML = `
      <div class="app-shell">
        <!-- TOP HEADER -->
        <header class="top-header">
          <div class="brand-area" id="brandHomeBtn" title="返回综合首页全线视图">
            ${ICONS.brand}
            <div class="brand-text">
              <span class="brand-title">${DATA.projectName}</span>
              <span class="brand-subtitle">${DATA.platformName}</span>
            </div>
          </div>
          <nav class="main-nav" id="mainNav"></nav>
        </header>

        <!-- SUB HEADER (4 Pages + 6 Work Sections + Meta) -->
        <div class="sub-header">
          <div class="sub-tabs" id="subTabs"></div>
          <span class="sub-group-divider"></span>
          <div class="section-filters" id="sectionFilters"></div>
          <span class="sub-group-divider"></span>
          <div class="header-meta">
            <button type="button" class="cmdk-trigger-btn" id="cmdkTriggerBtn" title="快捷搜索与直达全平台64页 (Ctrl+K)">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="cmdk-trigger-label">直达</span>
              <span class="cmdk-kbd">Ctrl+K</span>
            </button>
            <button class="demo-badge" id="demoInfoBtn">演示数据</button>
            <div class="date-chip" id="globalDateBtn" title="点击切换历史统计基准日期（全平台数据联动）">
              ${ICONS.calendar}
              <span id="globalDateText">${state.selectedDate}</span>
            </div>
            <button class="sys-gear-btn" id="sysManageBtn" title="系统管理（15.系统管理）">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.6.85 1 1.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
            </button>
          </div>
        </div>

        <!-- MAIN STAGE VIEWPORT -->
        <main class="stage-viewport">
          <!-- SHARED LIVE CESIUM 3D DIGITAL TWIN GLOBE -->
          <div id="cesiumContainer" class="cesium-host"></div>
          <div class="map-vignette" id="globalMapVignette"></div>
          <div id="cesiumOverlayRoot" class="cesium-overlay-root"></div>

          ${renderPage1Template()}
          ${renderPage2Template()}
          ${renderPage3Template()}
          ${renderPage4Template()}

          <!-- PLUGIN MODULE STAGE HOST (Modules 2 ~ 16) -->
          <section class="module-stage-host" id="moduleStageHost"></section>

          <!-- FLOATING AI ASSISTANT & WATERMARK (All Pages) -->
          <div class="floating-br">
            <button class="ai-fab" id="aiFabBtn" title="打开智能工程AI助手">
              <span class="ai-fab-label">AI助手</span>
              <span class="ai-fab-avatar">${ICONS.robot}</span>
            </button>
            <div class="watermark-pill">界面示意 · 演示数据</div>
          </div>
        </main>
      </div>

      <!-- AI ASSISTANT CHAT DRAWER -->
      <aside class="ai-drawer" id="aiDrawer">
        <div class="modal-header ai-drawer-header">
          <div class="panel-title-group ai-drawer-title-group">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">吉黑高速 · 智能AI助手</span>
          </div>
          <div class="ai-drawer-actions">
            <button type="button" class="ai-workbench-btn" id="aiWorkbenchBtn">进入 AI 助手全屏工作台</button>
            <button class="panel-toggle-btn" id="aiCloseBtn" title="关闭AI助手">${ICONS.close}</button>
          </div>
        </div>
        <div class="ai-messages" id="aiMessages">
          <div class="ai-msg bot">您好！我是 <strong>G1211吉黑高速建设平台 AI 助手</strong>。您可以向我查询全线进度、各工区关键工程状态，或让我直接帮您切换演示视图。</div>
        </div>
        <div class="ai-quick-prompts" id="aiQuickPrompts">
          <button class="ai-chip" data-q="二工区当前进度如何？">二工区进度</button>
          <button class="ai-chip" data-q="桥梁示例A建设详情">桥梁示例A</button>
          <button class="ai-chip" data-q="本月有哪些关键节点？">本月关键节点</button>
          <button class="ai-chip" data-q="打开建设里程碑对比">切换里程碑对比</button>
        </div>
        <div class="ai-input-bar">
          <input id="aiInput" type="text" placeholder="输入工程问题或指令，如“切换数字漫游”..." />
          <button class="dock-btn primary" id="aiSendBtn">发送</button>
        </div>
      </aside>

      <!-- GLOBAL DETAIL MODAL -->
      <div class="modal-backdrop" id="globalModal">
        <div class="modal-box">
          <div class="modal-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title" id="modalTitle">详情</span>
            </div>
            <button class="panel-toggle-btn" id="modalCloseBtn">${ICONS.close}</button>
          </div>
          <div class="modal-body" id="modalBody"></div>
        </div>
      </div>

      <!-- GLOBAL COMMAND PALETTE (Ctrl+K) -->
      <div class="cmdk-backdrop" id="cmdkBackdrop" role="dialog" aria-modal="true" aria-label="快捷导航检索">
        <div class="cmdk-dialog">
          <div class="cmdk-input-wrap">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input class="cmdk-input" id="cmdkInput" type="text" autocomplete="off" placeholder="搜索 16 大模块 / 64 个页面、工区或快捷操作（如：梁场、无人机、黑土地、二工区）..." />
            <span class="cmdk-kbd">ESC</span>
          </div>
          <div class="cmdk-list" id="cmdkList"></div>
          <div class="cmdk-footer">
            <span>↑↓ 选择 · Enter 直达 · 支持 16 模块 64 页毫秒检索</span>
            <span id="cmdkCountText">共 0 项</span>
          </div>
        </div>
      </div>

      <!-- TOAST CONTAINER -->
      <div class="toast-container" id="toastContainer"></div>
    `;

    renderHeaderNavs();

    // 初始化 CesiumJS 三维数字孪生底图引擎
    if (window.JIHEI_CESIUM) {
      window.JIHEI_CESIUM.init('cesiumContainer', 'cesiumOverlayRoot', {
        onPoiClick: poiId => {
          state.selectedPoiId = poiId;
          state.poiDetailVisible = true;
          if (DATA.poiObjects[poiId]) state.p1VideoSec = DATA.poiObjects[poiId].elapsed;
          if (state.page === 'roaming') {
            const idx = DATA.roamingStations.findIndex(s => s.id === poiId);
            if (idx >= 0) jumpToRoamingStation(idx, true);
          } else {
            syncAllViews();
            window.JIHEI_CESIUM.flyToPoi(poiId);
            showToast(`已选中工程对象：${DATA.poiObjects[poiId].name}`);
          }
        },
        onSectionClick: secId => toggleWorkSection(secId)
      });
    }

    bindGlobalEvents();
    bindPage1Events();
    bindPage2Events();
    bindPage3Events();
    bindPage4Events();
    startSimulationTimers();

    if (state.moduleId !== 'home' && !moduleRegistry[state.moduleId]) {
      const targetMod = state.moduleId;
      const targetSub = state.moduleSubPageId;
      state.moduleId = 'home';
      syncAllViews();
      switchModule(targetMod, targetSub, { replaceHistory: true });
    } else {
      syncAllViews();
      if (state.moduleId === 'home' && state.page === 'roaming' && window.JIHEI_CESIUM) {
        const st = DATA.roamingStations[state.roamingIndex];
        window.JIHEI_CESIUM.flyToRoamingStation(st.id, state.roamingView, state.roamingSpeed);
      }
    }
  }

  /* ------------------------------------------------------------------------
     PAGE 1 TEMPLATE: 01_项目总览 (Shared Cesium 3D Globe Behind HUD)
     ------------------------------------------------------------------------ */
  function renderPage1Template() {
    return `
      <section class="page-view" id="page-overview">
        <!-- LEFT COLUMN -->
        <div class="hud-left-col">
          <!-- 项目概况 -->
          <div class="glass-panel" id="panelOverviewSummary">
            <div class="panel-header" data-collapse="panelOverviewSummary">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">项目概况</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="info-line">${ICONS.road}<span id="p1ProjectScope">明水—北安段建设项目</span></div>
              <div class="info-line">${ICONS.excavator}<span>施工期</span></div>
              <div class="kpi-triple">
                <div class="kpi-cell" data-kpi="sections">
                  ${ICONS.helmet}
                  <span class="kpi-label">工区</span>
                  <div><span class="kpi-value" id="kpiSections">6</span><span class="kpi-unit">个</span></div>
                </div>
                <div class="kpi-cell" data-kpi="keyWorks">
                  ${ICONS.layers}
                  <span class="kpi-label">重点工程</span>
                  <div><span class="kpi-value" id="kpiKeyWorks">12</span><span class="kpi-unit">处</span></div>
                </div>
                <div class="kpi-cell" data-kpi="yards">
                  ${ICONS.yard}
                  <span class="kpi-label">场站</span>
                  <div><span class="kpi-value" id="kpiYards">8</span><span class="kpi-unit">处</span></div>
                </div>
              </div>
            </div>
          </div>

          <!-- 管理概览 -->
          <div class="glass-panel" id="panelMgmtOverview">
            <div class="panel-header" data-collapse="panelMgmtOverview">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">管理概览</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="seg-tabs" id="p1MgmtTabs">
                <button class="seg-tab active" data-tab="progress">进度</button>
                <button class="seg-tab" data-tab="quality">质量</button>
                <button class="seg-tab" data-tab="safety">安全</button>
              </div>
              <div class="progress-list" id="p1ProgressList"></div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="hud-right-col">
          <!-- 重点关注 -->
          <div class="glass-panel" id="panelFocus">
            <div class="panel-header" data-collapse="panelFocus">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">重点关注</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="focus-list" id="p1FocusList"></div>
            </div>
          </div>

          <!-- 对象详情 -->
          <div class="glass-panel" id="panelPoiDetail">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">对象详情</span>
                <span class="panel-subtitle" id="p1PoiTitle">桥梁示例A</span>
              </div>
              <button class="panel-toggle-btn" id="p1CloseDetailBtn" title="关闭详情卡片">${ICONS.close}</button>
            </div>
            <div class="panel-body">
              <div class="media-card playing" id="p1MediaCard">
                <img id="p1MediaImg" src="${IMG.milestoneAfter}" alt="实时监控画面" />
                <div class="media-top-badges">
                  <span class="live-pill"><span class="live-dot"></span>实时监控 · 演示</span>
                  <span class="cam-pill" id="p1CamName">桥梁示例A · 01号摄像机</span>
                </div>
                <div class="media-controls-bar">
                  <button class="mini-ctrl-btn" id="p1VideoToggle" title="播放/暂停">${ICONS.pause}</button>
                  <span class="mini-time" id="p1VideoTime">00:12 / 05:00</span>
                  <input class="mini-scrubber" id="p1VideoScrubber" type="range" min="0" max="300" value="12" />
                  <button class="mini-ctrl-btn" id="p1VideoMute" title="静音">${ICONS.volume}</button>
                  <button class="mini-ctrl-btn" id="p1VideoExpand" title="放大预览">${ICONS.fullscreen}</button>
                </div>
              </div>

              <div class="meta-table" id="p1PoiMeta"></div>

              <button class="btn-primary-glow" id="p1ViewDetailBtn">
                ${ICONS.doc}<span>查看工程详情</span>
              </button>
              <button class="link-subtle" id="p1ViewDocsBtn">
                <span>查看关联资料</span>${ICONS.chevronRight}
              </button>
            </div>
          </div>
        </div>

        <!-- BOTTOM CENTER LAYER BAR + ZOOM -->
        <div class="bottom-dock">
          <div class="layer-bar" id="p1LayerBar">
            <div class="layer-toggle-item" data-layer="satellite">
              <span class="layer-toggle-label">${ICONS.photo}高分遥感影像</span>
              <span class="switch" id="sw-satellite"></span>
            </div>
            <div class="layer-toggle-item" data-layer="uav">
              <span class="layer-toggle-label">${ICONS.drone}无人机倾斜摄影</span>
              <span class="switch on" id="sw-uav"></span>
            </div>
            <div class="layer-toggle-item" data-layer="bim">
              <span class="layer-toggle-label">${ICONS.bim}BIM模型</span>
              <span class="switch" id="sw-bim"></span>
            </div>
            <div class="layer-toggle-item" data-layer="pois">
              <span class="layer-toggle-label">${ICONS.pin}工程点位</span>
              <span class="switch on" id="sw-pois"></span>
            </div>
            <div class="layer-toggle-item" data-layer="sections">
              <span class="layer-toggle-label">${ICONS.layers}工区</span>
              <span class="switch on" id="sw-sections"></span>
            </div>
            <div class="layer-toggle-item" data-layer="route">
              <span class="layer-toggle-label">${ICONS.pavement}路线</span>
              <span class="switch on" id="sw-route"></span>
            </div>
          </div>

          <div class="zoom-pill">
            <button class="zoom-btn" id="p1ZoomIn" title="放大">+</button>
            <button class="zoom-btn" id="p1ZoomOut" title="缩小">−</button>
            <button class="zoom-btn" id="p1ZoomReset" title="重置全线视角">${ICONS.fullscreen}</button>
          </div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 2 TEMPLATE: 02_数字漫游 (Shared Cesium 3D Flight Roaming)
     ------------------------------------------------------------------------ */
  function renderPage2Template() {
    return `
      <section class="page-view" id="page-roaming">
        <!-- LEFT COLUMN -->
        <div class="hud-left-col">
          <!-- 漫游线路 -->
          <div class="glass-panel" id="panelRoamingRoute">
            <div class="panel-header" data-collapse="panelRoamingRoute">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">漫游线路</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <button class="route-header-btn" id="p2FullRouteBtn">全线漫游</button>
              <div class="timeline-list" id="p2RouteList"></div>
            </div>
          </div>

          <!-- 漫游设置 -->
          <div class="glass-panel" id="panelRoamingSettings">
            <div class="panel-header" data-collapse="panelRoamingSettings">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">漫游设置</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="setting-row">
                <span class="setting-label">到站停留</span>
                <span class="switch on" id="p2DwellSwitch"></span>
              </div>
              <div class="setting-row">
                <span class="setting-label">视角</span>
                <div class="dual-seg" id="p2ViewSeg">
                  <button class="dual-seg-btn active" data-view="overhead">俯瞰</button>
                  <button class="dual-seg-btn" data-view="along">沿线</button>
                </div>
              </div>
              <div class="dual-seg" id="p2AutoSeg" style="margin-top:4px;">
                <button class="dual-seg-btn active" data-mode="auto">自动漫游</button>
                <button class="dual-seg-btn" data-mode="free">自由漫游</button>
              </div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: 当前站点 -->
        <div class="hud-right-col">
          <div class="glass-panel" id="panelCurrentStation">
            <div class="panel-header" data-collapse="panelCurrentStation">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">当前站点</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div style="font-size:18px;font-weight:800;margin-bottom:10px;letter-spacing:0.4px;" id="p2StationName">桥梁示例A</div>
              <div class="media-card" id="p2StationMediaCard" style="cursor:pointer;">
                <img id="p2StationImg" src="${IMG.milestoneAfter}" alt="站点现场影像" />
                <div class="media-top-badges">
                  <span class="live-pill"><span class="live-dot"></span>现场影像 · 演示</span>
                </div>
                <button class="media-center-play" id="p2PlayStationVideo" title="播放站点影像">${ICONS.play}</button>
                <span class="duration-chip" id="p2StationDuration">05:00</span>
              </div>

              <div class="meta-table">
                <div class="meta-row">
                  <span class="meta-key">${ICONS.bridge}所属工区</span>
                  <span class="meta-val" id="p2StationSection">二工区</span>
                </div>
                <div class="meta-row">
                  <span class="meta-key">${ICONS.layers}建设阶段</span>
                  <span class="meta-val" id="p2StationStage">梁板架设</span>
                </div>
              </div>

              <div class="kpi-triple" style="margin-bottom:12px;">
                <div class="kpi-cell" data-station-tab="photos">
                  ${ICONS.photo}
                  <span class="kpi-label">关联照片</span>
                  <div><span class="kpi-value" id="p2Photos">3</span><span class="kpi-unit">张</span></div>
                </div>
                <div class="kpi-cell" data-station-tab="videos">
                  ${ICONS.video}
                  <span class="kpi-label">关联视频</span>
                  <div><span class="kpi-value" id="p2Videos">2</span><span class="kpi-unit">条</span></div>
                </div>
                <div class="kpi-cell" data-station-tab="inspections">
                  ${ICONS.doc}
                  <span class="kpi-label">巡检记录</span>
                  <div><span class="kpi-value" id="p2Inspections">26</span><span class="kpi-unit">条</span></div>
                </div>
              </div>

              <button class="btn-primary-glow" id="p2StationDetailBtn">
                ${ICONS.doc}<span>查看站点详情</span>
              </button>
              <button class="link-subtle" id="p2StationDocsBtn">
                <span>查看关联资料</span>${ICONS.chevronRight}
              </button>
            </div>
          </div>
        </div>

        <!-- BOTTOM ROAMING PLAYBACK DOCK -->
        <div class="bottom-dock">
          <div class="roaming-dock">
            <div class="roaming-dock-top">
              <div class="dual-seg" id="p2RenderSeg">
                <button class="dual-seg-btn active" data-render="real">实景漫游</button>
                <button class="dual-seg-btn" data-render="design">设计模型预览</button>
              </div>
              <div class="roaming-transport">
                <button class="dock-btn" id="p2PrevBtn">⏮ 上一站</button>
                <button class="dock-btn primary" id="p2PlayPauseBtn">${ICONS.pause}<span>暂停</span></button>
                <button class="dock-btn" id="p2NextBtn">下一站 ⏭</button>
                <select class="speed-select" id="p2SpeedSelect">
                  <option value="0.5">0.5 ×</option>
                  <option value="1" selected>1.0 ×</option>
                  <option value="1.5">1.5 ×</option>
                  <option value="2">2.0 ×</option>
                </select>
                <button class="dock-btn" id="p2FullscreenBtn">${ICONS.fullscreen}<span>全屏</span></button>
              </div>
            </div>
            <div class="roaming-dock-bottom">
              <div class="roaming-counter">
                <div>当前站点 <strong id="p2CounterNum">2 / 5</strong></div>
                <small>虚拟漫游 · 演示</small>
              </div>
              <div class="station-track" id="p2StationTrack"></div>
            </div>
          </div>

          <div class="zoom-pill grid-2x2">
            <button class="zoom-btn" id="p2ToggleLayers" title="切换实景/设计模型">${ICONS.layers}</button>
            <button class="zoom-btn" id="p2ZoomIn" title="放大">+</button>
            <button class="zoom-btn" id="p2ZoomOut" title="缩小">−</button>
            <button class="zoom-btn" id="p2ZoomReset" title="重置视角">${ICONS.fullscreen}</button>
          </div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 3 TEMPLATE: 03_建设里程碑 (Before / After Split Comparison)
     ------------------------------------------------------------------------ */
  function renderPage3Template() {
    const dateOpts = DATA.milestoneNodes.map(n => `<option value="${n.date}">${n.date}</option>`).join('');
    return `
      <section class="page-view" id="page-milestone">
        <!-- FULL VIEWPORT SPLIT COMPARISON CANVAS -->
        <div class="compare-stage" id="p3CompareStage">
          <!-- RIGHT / AFTER LAYER -->
          <div class="compare-layer compare-after-layer">
            <img id="p3AfterImg" src="${IMG.milestoneAfter}" alt="后期建设影像" />
          </div>

          <!-- LEFT / BEFORE LAYER (Clipped by slider %) -->
          <div class="compare-layer compare-before-clip" id="p3BeforeClip">
            <img id="p3BeforeImg" src="${IMG.milestoneBefore}" alt="前期建设影像" />
          </div>

          <div class="map-vignette" style="z-index:5;"></div>

          <!-- Floating work-section location tag -->
          <div class="work-section-tag" style="left:33.5%;top:37%;z-index:10;" id="p3MapTag">二工区</div>

          <!-- DRAGGABLE VERTICAL SPLIT DIVIDER -->
          <div class="compare-divider" id="p3Divider">
            <div class="compare-handle" id="p3Handle" tabindex="0" role="slider" aria-label="拖动对比前后时期影像" aria-valuemin="8" aria-valuemax="92" aria-valuenow="50">
              <div class="compare-handle-circle">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="9 6 3 12 9 18 9 6"/>
                  <polygon points="15 6 21 12 15 18 15 6"/>
                </svg>
              </div>
              <span class="compare-handle-pill">拖动对比</span>
            </div>
          </div>

          <!-- TOP FLOATING DATE COMPARISON SELECTORS -->
          <div class="compare-date-bar">
            <div class="compare-date-picker">
              ${ICONS.calendar}
              <select id="p3LeftDateSelect" title="左侧历史对比时期">${dateOpts}</select>
            </div>
            <div class="compare-date-picker">
              ${ICONS.calendar}
              <select id="p3RightDateSelect" title="右侧目标对比时期">${dateOpts}</select>
            </div>
          </div>

          <!-- BOTTOM CAPTION PILL -->
          <div class="compare-caption-pill">同位置 · 不同时期 · 影像示意</div>

          <!-- BOTTOM-RIGHT VERTICAL ZOOM STACK -->
          <div class="zoom-pill vertical" style="position:absolute;right:304px;bottom:20px;z-index:20;">
            <button class="zoom-btn" id="p3ZoomIn" title="放大">+</button>
            <button class="zoom-btn" id="p3ZoomOut" title="缩小">−</button>
            <button class="zoom-btn" id="p3ZoomReset" title="重置比例">${ICONS.fullscreen}</button>
          </div>
        </div>

        <!-- LEFT COLUMN -->
        <div class="hud-left-col">
          <div class="glass-panel" id="panelMilestoneLeft">
            <div class="panel-header" data-collapse="panelMilestoneLeft">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">对象选择</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="form-row">
                <label>所属工区</label>
                <select class="glass-select" id="p3SectionSelect">
                  ${DATA.workSections.map(s => `<option value="${s.name}" ${s.name === '二工区' ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-row" style="margin-bottom:14px;">
                <label>工程对象</label>
                <select class="glass-select" id="p3ObjectSelect">
                  <option value="桥梁示例A" selected>桥梁示例A</option>
                  <option value="梁场示例A">梁场示例A</option>
                  <option value="拌合站示例A">拌合站示例A</option>
                  <option value="K34路基示范段">K34路基示范段</option>
                </select>
              </div>

              <!-- 节点详情 -->
              <div class="panel-title-group" style="margin-bottom:8px;">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">节点详情</span>
              </div>
              <div style="font-size:17px;font-weight:800;margin-bottom:3px;" id="p3NodeTitle">梁板架设</div>
              <div style="font-size:12.5px;color:var(--text-sub);margin-bottom:10px;">节点日期 &nbsp;<strong style="color:#fff;" id="p3NodeDate">2026-11-20</strong></div>

              <div class="media-card" id="p3NodeMediaCard" style="cursor:pointer;">
                <img id="p3NodeThumb" src="${IMG.milestoneAfter}" alt="节点影像" />
                <div class="media-top-badges">
                  <span class="live-pill"><span class="live-dot"></span>现场影像 · 演示</span>
                </div>
                <button class="media-center-play" id="p3PlayNodeVideo">${ICONS.play}</button>
                <span class="duration-chip">05:00</span>
              </div>

              <!-- 影像来源 -->
              <div class="panel-title-group" style="margin:10px 0 8px;">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">影像来源</span>
              </div>
              <div class="source-pill">${ICONS.drone}<span>无人机历史影像 · 演示</span></div>

              <div class="icon-tile-row">
                <button class="icon-tile" data-ms-tab="photo">${ICONS.photo}<span>节点照片</span></button>
                <button class="icon-tile" data-ms-tab="video">${ICONS.video}<span>关联视频</span></button>
                <button class="icon-tile" data-ms-tab="progress">${ICONS.doc}<span>进度记录</span></button>
              </div>

              <button class="btn-primary-glow" id="p3ViewNodeDocsBtn">
                ${ICONS.doc}<span>查看节点资料</span>
              </button>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="hud-right-col">
          <div class="glass-panel" id="panelMilestoneRight">
            <div class="panel-header" data-collapse="panelMilestoneRight">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">关键建设节点</span>
              </div>
              <button class="panel-toggle-btn">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="route-header-btn" style="text-align:center;cursor:default;" id="p3ContextPill">二工区 · 桥梁示例A</div>
              <div class="timeline-list" id="p3MilestoneList" style="margin-bottom:16px;"></div>

              <div class="panel-title-group" style="margin-bottom:10px;">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">资料类型</span>
              </div>
              <div class="checkbox-list" id="p3TypeChecks">
                <label class="check-item"><input type="checkbox" data-type="photo" checked /><span>节点照片</span></label>
                <label class="check-item"><input type="checkbox" data-type="uav" checked /><span>无人机影像</span></label>
                <label class="check-item"><input type="checkbox" data-type="progress" checked /><span>进度记录</span></label>
              </div>
            </div>
          </div>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 4 TEMPLATE: 04_专题展示 (Exhibition / Presentation Theater)
     ------------------------------------------------------------------------ */
  function renderPage4Template() {
    return `
      <section class="page-view" id="page-showcase">
        <!-- Subtle dim overlay over live 3D Cesium globe backdrop -->
        <div class="showcase-backdrop-dim"></div>

        <!-- TOP CENTER PILLS -->
        <div class="showcase-top-pills">
          <div class="scene-mode-pill">• 场景示意 · 模型演示 •</div>
          <button class="hall-mode-btn" id="p4HallModeBtn">${ICONS.hall}<span>展厅模式</span></button>
        </div>

        <!-- LEFT COLUMN: 演示专题 -->
        <div class="hud-left-col" id="p4LeftCol">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">演示专题</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="topic-list" id="p4TopicList"></div>
            </div>
          </div>
        </div>

        <!-- CENTER SHOWCASE THEATER WINDOW -->
        <div class="theater-window" id="p4TheaterWin">
          <div class="theater-bar">
            <div class="theater-title">
              ${ICONS.video}
              <span id="p4VideoTitle">项目概览 · 演示视频</span>
            </div>
            <div class="theater-win-btns">
              <button class="theater-win-btn" id="p4WinMin" title="最小化/还原">−</button>
              <button class="theater-win-btn" id="p4WinClose" title="关闭窗口">${ICONS.close}</button>
            </div>
          </div>
          <div class="theater-stage" id="p4TheaterStage">
            <img id="p4StageImg" src="${IMG.showcase}" alt="专题演示视频画面" />
            <button class="theater-big-play" id="p4BigPlayBtn" title="开始演示">
              <svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor" style="margin-left:3px;"><polygon points="6 4 20 12 6 20 6 4"/></svg>
            </button>
            <div class="theater-hud-caption">
              <div>
                <span class="hud-caption-tag" id="p4HudChapterTag">自动讲解 · 章节 1/3</span>
                <div class="hud-caption-text" id="p4HudCaptionText"></div>
              </div>
              <div class="hud-kpi-pills" id="p4HudKpis"></div>
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN: 演示控制 & 内容摘要 -->
        <div class="hud-right-col" id="p4RightCol">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">演示控制</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="ctrl-grid">
                <button class="ctrl-btn primary" id="p4StartBtn">${ICONS.play}<span>开始演示</span></button>
                <button class="ctrl-btn" id="p4AutoBtn">⟳ <span>自动轮播</span></button>
                <button class="ctrl-btn" id="p4FullBtn">${ICONS.fullscreen}<span>全屏展示</span></button>
                <button class="ctrl-btn" id="p4SwitchBtn">⧉ <span>切换专题</span></button>
                <button class="ctrl-btn" id="p4PauseBtn">${ICONS.pause}<span>暂停</span></button>
                <button class="ctrl-btn" id="p4PrevTopicBtn">← <span>上一页</span></button>
                <button class="ctrl-btn full" id="p4NextTopicBtn">→ <span>下一页</span></button>
              </div>
            </div>
          </div>

          <div class="glass-panel" style="flex:1;overflow-y:auto;">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">内容摘要</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="summary-list" id="p4SummaryList"></div>
            </div>
          </div>
        </div>

        <!-- BOTTOM SHOWCASE PLAYER BAR & ZOOM -->
        <div class="zoom-pill vertical" style="position:absolute;right:250px;bottom:68px;z-index:20;">
          <button class="zoom-btn" id="p4BgZoomIn" title="放大展示">+</button>
          <button class="zoom-btn" id="p4BgZoomOut" title="缩小展示">−</button>
          <button class="zoom-btn" id="p4BgZoomReset" title="重置窗口">${ICONS.fullscreen}</button>
        </div>

        <div class="showcase-player-bar">
          <button class="mini-ctrl-btn" id="p4BarPlayBtn" style="font-size:18px;">${ICONS.play}</button>
          <span class="mini-time" id="p4TimeReadout" style="font-size:12.5px;">00:00 / 05:28</span>
          <input class="player-slider" id="p4ProgressSlider" type="range" min="0" max="328" value="0" />
          <button class="mini-ctrl-btn" id="p4MuteBtn">${ICONS.volume}</button>
          <input class="vol-slider" id="p4VolSlider" type="range" min="0" max="100" value="78" />
          <button class="dock-btn" id="p4SpeedBtn" style="padding:3px 9px;min-width:52px;justify-content:center;">1.0x</button>
          <button class="mini-ctrl-btn" id="p4BarFullBtn">${ICONS.fullscreen}</button>
        </div>
      </section>
    `;
  }

  /* ------------------------------------------------------------------------
     RENDER TOP NAV, SUB TABS, WORK SECTION PILLS
     ------------------------------------------------------------------------ */
  function renderHeaderNavs() {
    const mainNav = document.getElementById('mainNav');
    mainNav.innerHTML = DATA.topModules.map(m =>
      `<button class="main-nav-item ${m.active ? 'active' : ''}" data-mod="${m.id}">${m.name}</button>`
    ).join('');

    const subTabs = document.getElementById('subTabs');
    subTabs.innerHTML = DATA.subPages.map((p, idx) => `
      ${idx > 0 ? '<span class="sub-tab-divider"></span>' : ''}
      <button class="sub-tab-btn" data-page="${p.id}">${p.name}</button>
    `).join('');

    const secWrap = document.getElementById('sectionFilters');
    secWrap.innerHTML = DATA.workSections.map(s =>
      `<button class="section-pill" data-sec="${s.id}">${s.name}</button>`
    ).join('');
  }

  /* ------------------------------------------------------------------------
     SYNC ALL UI STATE (Supports Module 1 + All Registered Modules 2 ~ 16)
     ------------------------------------------------------------------------ */
  function renderSubTabsForCurrentModule() {
    const subTabs = document.getElementById('subTabs');
    if (state.moduleId === 'home') {
      subTabs.innerHTML = DATA.subPages.map((p, idx) => `
        ${idx > 0 ? '<span class="sub-tab-divider"></span>' : ''}
        <button class="sub-tab-btn" data-page="${p.id}">${p.name}</button>
      `).join('');
    } else {
      const mod = moduleRegistry[state.moduleId];
      const pages = (mod && mod.subPages) || [];
      subTabs.innerHTML = pages.map((p, idx) => `
        ${idx > 0 ? '<span class="sub-tab-divider"></span>' : ''}
        <button class="sub-tab-btn" data-page="${p.id}">${p.name}</button>
      `).join('');
    }
  }

  function getModuleDisplayName(moduleId) {
    const meta = DATA.topModules.find(m => m.id === moduleId);
    if (meta) return meta.name;
    if (moduleId === 'system') return '系统管理';
    if (moduleId === 'ai') return 'AI助手工作台';
    return moduleId;
  }

  function loadModuleScript(moduleId) {
    if (moduleRegistry[moduleId]) return Promise.resolve(moduleRegistry[moduleId]);
    if (moduleLoadPromises[moduleId]) return moduleLoadPromises[moduleId];

    const scriptRel = MODULE_SCRIPTS[moduleId];
    if (!scriptRel) return Promise.reject(new Error('UNREGISTERED_MODULE'));

    const ver = CONFIG.version ? `?v=${encodeURIComponent(CONFIG.version)}` : '';
    const src = `${SCRIPT_BASE}${scriptRel}${ver}`;

    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.async = true;
      script.onload = () => {
        if (moduleRegistry[moduleId]) {
          resolve(moduleRegistry[moduleId]);
        } else {
          delete moduleLoadPromises[moduleId];
          reject(new Error(`模块脚本已加载但未注册：${moduleId}`));
        }
      };
      script.onerror = () => {
        script.remove();
        delete moduleLoadPromises[moduleId];
        reject(new Error(`加载模块脚本失败：${src}`));
      };
      document.head.appendChild(script);
    });

    moduleLoadPromises[moduleId] = promise;
    return promise;
  }

  function getActiveCesiumMode() {
    if (state.moduleId === 'home') {
      return state.page === 'milestone' ? 'opaque' : 'interactive';
    }
    const mod = moduleRegistry[state.moduleId];
    if (!mod) return 'opaque';
    return typeof mod.getCesiumMode === 'function'
      ? mod.getCesiumMode(state.moduleSubPageId)
      : (mod.cesiumMode || 'opaque');
  }

  function buildModuleCtx() {
    return {
      state,
      data: DATA,
      icons: ICONS,
      cesium: window.JIHEI_CESIUM,
      ui: UI,
      store: STORE,
      datePreset: getActiveDatePreset(),
      escHtml,
      showToast,
      openModal,
      closeModal,
      switchModule
    };
  }

  function renderActiveModule(host, mod) {
    const mode = typeof mod.getCesiumMode === 'function'
      ? mod.getCesiumMode(state.moduleSubPageId)
      : (mod.cesiumMode || 'opaque');
    host.className = 'module-stage-host active' + (mode === 'opaque' ? ' mode-opaque' : mode === 'dimmed' ? ' mode-dimmed' : '');
    const overlayEl = document.getElementById('cesiumOverlayRoot');
    if (overlayEl) overlayEl.style.display = mode === 'interactive' ? 'block' : 'none';
    if (window.JIHEI_CESIUM) {
      window.JIHEI_CESIUM.setShowcaseBackdropMode(false);
      if (typeof window.JIHEI_CESIUM.setRenderActive === 'function') {
        window.JIHEI_CESIUM.setRenderActive(mode !== 'opaque');
      }
    }
    mod.render(host, state.moduleSubPageId, buildModuleCtx());
  }

  function updateUrlHash(hashValue, opts) {
    const targetHash = '#' + hashValue;
    if (location.hash === targetHash) return;
    if (opts && opts.fromHashChange) return;
    if (opts && opts.replaceHistory) {
      history.replaceState(null, '', targetHash);
    } else {
      history.pushState(null, '', targetHash);
    }
  }

  function switchModule(moduleId, subPageId, opts) {
    opts = opts || {};
    const seq = ++switchSeq;

    if (moduleId !== 'home' && !moduleRegistry[moduleId]) {
      if (!MODULE_SCRIPTS[moduleId]) {
        showToast(`【${getModuleDisplayName(moduleId)}】模块暂未配置接入`);
        return false;
      }

      const label = getModuleDisplayName(moduleId);
      const host = document.getElementById('moduleStageHost');
      let loaderTimer = setTimeout(() => {
        if (seq !== switchSeq || !host) return;
        host.className = 'module-stage-host active mode-opaque';
        host.innerHTML = `
          <div class="module-lazy-loader">
            <div class="module-lazy-spinner"></div>
            <div class="module-lazy-text">正在按需加载「${escHtml(label)}」模块...</div>
          </div>
        `;
      }, 120);

      loadModuleScript(moduleId)
        .then(() => {
          clearTimeout(loaderTimer);
          if (seq !== switchSeq) return;
          switchModule(moduleId, subPageId, opts);
        })
        .catch(err => {
          clearTimeout(loaderTimer);
          if (seq !== switchSeq) return;
          console.error('[JIHEI_PLATFORM] Lazy load failed:', err);
          if (host && state.moduleId === 'home') {
            host.className = 'module-stage-host';
            host.innerHTML = '';
          }
          showToast(`【${label}】模块加载失败，请检查本地服务或网络后重试`);
        });
      return true;
    }

    const prevMod = state.moduleId !== 'home' ? moduleRegistry[state.moduleId] : null;
    if (prevMod && prevMod.onLeave && state.moduleId !== moduleId) {
      try { prevMod.onLeave(); } catch (e) { console.warn(e); }
    }

    state.moduleId = moduleId;
    if (moduleId === 'home') {
      state.page = ['overview', 'roaming', 'milestone', 'showcase'].includes(subPageId) ? subPageId : state.page;
      updateUrlHash(state.page, opts);
    } else {
      const mod = moduleRegistry[moduleId];
      const validSubs = (mod.subPages || []).map(p => p.id);
      const firstId = validSubs[0] || 'main';
      state.moduleSubPageId = (subPageId && validSubs.includes(subPageId)) ? subPageId : firstId;
      updateUrlHash(`${moduleId}/${state.moduleSubPageId}`, opts);
    }
    renderSubTabsForCurrentModule();
    syncAllViews();
    return true;
  }

  function syncAllViews() {
    const isHome = state.moduleId === 'home';
    const host = document.getElementById('moduleStageHost');

    // 0. Top nav & gear active highlight
    document.querySelectorAll('.main-nav-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.mod === state.moduleId);
    });
    const gearBtn = document.getElementById('sysManageBtn');
    if (gearBtn) gearBtn.classList.toggle('active', state.moduleId === 'system');

    // 1. Page visibility & sub-tab active pill
    document.querySelectorAll('.page-view').forEach(el => {
      el.classList.toggle('active', isHome && el.id === `page-${state.page}`);
    });
    const activeSubId = isHome ? state.page : state.moduleSubPageId;
    document.querySelectorAll('.sub-tab-btn').forEach(btn => {
      const isActive = btn.dataset.page === activeSubId;
      btn.classList.toggle('active', isActive);
      btn.classList.toggle('gold-text', isActive && isHome && (state.page === 'overview' || state.page === 'showcase'));
    });

    // Update page title
    if (isHome) {
      const curMeta = DATA.subPages.find(p => p.id === state.page);
      if (curMeta) document.title = `${curMeta.name} - ${DATA.projectName}${DATA.platformName}`;
    } else {
      const mod = moduleRegistry[state.moduleId];
      const sp = mod && mod.subPages && mod.subPages.find(p => p.id === state.moduleSubPageId);
      document.title = `${sp ? sp.name : (mod ? mod.name : '')} - ${DATA.projectName}${DATA.platformName}`;
    }

    // 2. Section pills highlight
    document.querySelectorAll('.section-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.sec === state.activeSectionId);
    });

    // 3. Render home pages OR active plugin module
    if (isHome) {
      if (host) {
        host.className = 'module-stage-host';
        if (host.firstChild) host.innerHTML = '';
      }
      renderPage1Data();
      renderPage2Data();
      renderPage3Data();
      renderPage4Data();
      syncCesiumScene();
    } else if (host && moduleRegistry[state.moduleId]) {
      renderActiveModule(host, moduleRegistry[state.moduleId]);
    }
  }

  function syncCesiumScene() {
    const ces = window.JIHEI_CESIUM;
    const overlayEl = document.getElementById('cesiumOverlayRoot');
    if (overlayEl) {
      overlayEl.style.display = state.page === 'milestone' ? 'none' : 'block';
    }
    if (!ces || !ces.ready) return;

    if (typeof ces.setRenderActive === 'function') {
      ces.setRenderActive(state.page !== 'milestone');
    }

    if (state.page === 'overview') {
      ces.setShowcaseBackdropMode(false);
      ces.applyLayers({
        satellite: state.p1Layers.satellite,
        uav: state.p1Layers.uav,
        bim: state.p1Layers.bim,
        pois: state.p1Layers.pois,
        sections: state.p1Layers.sections,
        route: state.p1Layers.route,
        designMode: false,
        activeSectionId: state.activeSectionId
      });
      ces.syncHtmlOverlays({
        showRoute: state.p1Layers.route,
        showSections: state.p1Layers.sections,
        showPois: state.p1Layers.pois,
        activeSectionId: state.activeSectionId,
        activePoiId: state.selectedPoiId,
        poiObjects: DATA.poiObjects,
        icons: ICONS,
        showViewpoint: false
      });
    } else if (state.page === 'roaming') {
      const st = DATA.roamingStations[state.roamingIndex];
      ces.setShowcaseBackdropMode(false);
      ces.applyLayers({
        satellite: false,
        uav: true,
        bim: state.roamingRenderMode === 'design',
        pois: true,
        sections: true,
        route: true,
        designMode: state.roamingRenderMode === 'design',
        activeSectionId: state.activeSectionId
      });
      ces.syncHtmlOverlays({
        showRoute: true,
        showSections: true,
        showPois: true,
        activeSectionId: state.activeSectionId,
        activePoiId: st.id,
        poiObjects: DATA.poiObjects,
        icons: ICONS,
        showViewpoint: true,
        roamingStationId: st.id
      });
    } else if (state.page === 'showcase') {
      ces.applyLayers({
        satellite: false,
        uav: true,
        bim: true,
        pois: true,
        sections: true,
        route: true,
        designMode: false,
        activeSectionId: null
      });
      ces.syncHtmlOverlays({
        showRoute: true,
        showSections: false,
        showPois: false,
        icons: ICONS
      });
      ces.setShowcaseBackdropMode(true);
    } else {
      ces.setShowcaseBackdropMode(false);
    }
  }

  /* ------------------------------------------------------------------------
     PAGE 1 RENDERING & INTERACTIONS
     ------------------------------------------------------------------------ */
  function renderPage1Data() {
    const activeSec = DATA.workSections.find(s => s.id === state.activeSectionId);

    // KPI counts
    document.getElementById('p1ProjectScope').textContent = activeSec
      ? `明水—北安段 · ${activeSec.name} (${activeSec.stake})`
      : '明水—北安段建设项目';
    document.getElementById('kpiSections').textContent = activeSec ? activeSec.summary.sections : 6;
    document.getElementById('kpiKeyWorks').textContent = activeSec ? activeSec.summary.keyWorks : 12;
    document.getElementById('kpiYards').textContent = activeSec ? activeSec.summary.yards : 8;

    // Management overview tabs & bars
    document.querySelectorAll('#p1MgmtTabs .seg-tab').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === state.mgmtTab);
    });
    const baseItems = DATA.managementTabs[state.mgmtTab];
    const preset = getActiveDatePreset();
    const deltaMap = {
      progress: preset.progressDelta || 0,
      quality: preset.qualityDelta || 0,
      safety: preset.safetyDelta || 0
    };
    const dateDelta = deltaMap[state.mgmtTab] || 0;
    const mgmtTitleEl = document.querySelector('#panelMgmtOverview .panel-title');
    if (mgmtTitleEl) {
      mgmtTitleEl.innerHTML = dateDelta !== 0
        ? `管理概览<span class="date-delta-chip">${escHtml(preset.date)}</span>`
        : '管理概览';
    }
    const pList = document.getElementById('p1ProgressList');
    pList.innerHTML = baseItems.map((item, i) => {
      const rawVal = activeSec ? activeSec[state.mgmtTab][i] : item.pct;
      const val = Math.max(0, Math.min(100, rawVal + dateDelta));
      return `
        <div class="progress-item">
          <span class="progress-icon">${ICONS[item.icon] || ICONS.layers}</span>
          <div class="progress-main">
            <div class="progress-row-top">
              <span class="progress-name">${item.name}</span>
              <span class="progress-pct">${val.toFixed(1)}%</span>
            </div>
            <div class="progress-track">
              <div class="progress-fill" style="width:${Math.min(100, val)}%"></div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // Focus alerts
    const focusWrap = document.getElementById('p1FocusList');
    focusWrap.innerHTML = DATA.focusItems.map(item => `
      <div class="focus-row" data-focus="${item.id}">
        <span class="focus-left">${ICONS[item.icon]}<span>${item.title}</span></span>
        <span class="focus-right">${item.summaryPrefix}<span class="focus-count">${item.count}</span>${item.unit}${ICONS.chevronRight}</span>
      </div>
    `).join('');

    // POI Detail Card
    const poi = DATA.poiObjects[state.selectedPoiId] || DATA.poiObjects.bridgeA;
    document.getElementById('panelPoiDetail').style.display = state.poiDetailVisible ? 'block' : 'none';
    document.getElementById('p1PoiTitle').textContent = poi.name;
    document.getElementById('p1CamName').textContent = poi.camera;
    document.getElementById('p1MediaImg').src = IMG[poi.imgKey];
    document.getElementById('p1PoiMeta').innerHTML = `
      <div class="meta-row"><span class="meta-key">${ICONS.yard}工程名称</span><span class="meta-val">${poi.name}</span></div>
      <div class="meta-row"><span class="meta-key">${ICONS.bridge}工程类型</span><span class="meta-val">${poi.type}</span></div>
      <div class="meta-row"><span class="meta-key">${ICONS.layers}所属工区</span><span class="meta-val">${poi.section}</span></div>
      <div class="meta-row"><span class="meta-key">${ICONS.guardrail}当前阶段</span><span class="meta-val">${poi.stage}</span></div>
    `;

    // Video controls sync
    const p1Card = document.getElementById('p1MediaCard');
    p1Card.classList.toggle('playing', state.p1VideoPlaying);
    document.getElementById('p1VideoToggle').innerHTML = state.p1VideoPlaying ? ICONS.pause : ICONS.play;
    document.getElementById('p1VideoMute').innerHTML = state.p1VideoMuted ? ICONS.mute : ICONS.volume;
    document.getElementById('p1VideoTime').textContent = `${fmtTime(state.p1VideoSec)} / ${poi.duration}`;
    document.getElementById('p1VideoScrubber').value = state.p1VideoSec;

    // Layer switch UI sync
    Object.keys(state.p1Layers).forEach(k => {
      const sw = document.getElementById(`sw-${k}`);
      if (sw) sw.classList.toggle('on', state.p1Layers[k]);
    });
  }

  /* ------------------------------------------------------------------------
     PAGE 2 RENDERING (数字漫游)
     ------------------------------------------------------------------------ */
  function renderPage2Data() {
    const stations = DATA.roamingStations;
    const st = stations[state.roamingIndex];

    // Route vertical timeline
    document.getElementById('p2RouteList').innerHTML = stations.map((item, idx) => `
      <div class="timeline-item ${idx === state.roamingIndex ? 'active' : idx < state.roamingIndex ? 'visited' : ''}" data-ridx="${idx}">
        <span class="timeline-node"></span>
        <span class="timeline-label">${item.name}</span>
        ${idx === state.roamingIndex ? '<span class="current-badge">当前站点</span>' : ''}
      </div>
    `).join('');

    // Right station card
    document.getElementById('p2StationName').textContent = st.name;
    document.getElementById('p2StationImg').src = IMG[st.imgKey];
    document.getElementById('p2StationDuration').textContent = st.duration;
    document.getElementById('p2StationSection').textContent = st.section;
    document.getElementById('p2StationStage').textContent = st.stage;
    document.getElementById('p2Photos').textContent = st.photos;
    document.getElementById('p2Videos').textContent = st.videos;
    document.getElementById('p2Inspections').textContent = st.inspections;

    // Settings controls
    document.getElementById('p2DwellSwitch').classList.toggle('on', state.roamingDwell);
    document.querySelectorAll('#p2ViewSeg .dual-seg-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.view === state.roamingView));
    document.querySelectorAll('#p2AutoSeg .dual-seg-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.mode === state.roamingAutoMode));
    document.querySelectorAll('#p2RenderSeg .dual-seg-btn').forEach(b =>
      b.classList.toggle('active', b.dataset.render === state.roamingRenderMode));

    // Playback dock
    document.getElementById('p2PlayPauseBtn').innerHTML = state.roamingPlaying
      ? `${ICONS.pause}<span>暂停</span>`
      : `${ICONS.play}<span>播放</span>`;
    document.getElementById('p2CounterNum').textContent = `${state.roamingIndex + 1} / ${stations.length}`;

    const pct = (state.roamingIndex / (stations.length - 1)) * 100;
    document.getElementById('p2StationTrack').innerHTML = `
      <div class="station-track-line"><div class="station-track-fill" style="width:${pct}%"></div></div>
      ${stations.map((s, i) => `
        <button class="station-step ${i === state.roamingIndex ? 'active' : i < state.roamingIndex ? 'passed' : ''}" data-ridx="${i}">
          <span class="station-step-dot"></span>
          <span>${s.name}</span>
        </button>
      `).join('')}
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 3 RENDERING (建设里程碑)
     ------------------------------------------------------------------------ */
  function renderPage3Data() {
    const nodes = DATA.milestoneNodes;
    const activeNode = nodes.find(n => n.id === state.msActiveNodeId) || nodes[3];
    const leftNode = nodes.find(n => n.date === state.msLeftDate) || nodes[2];
    const rightNode = nodes.find(n => n.date === state.msRightDate) || nodes[3];

    // Sync dropdowns & badges
    document.getElementById('p3SectionSelect').value = state.msSection;
    document.getElementById('p3ObjectSelect').value = state.msObject;
    document.getElementById('p3LeftDateSelect').value = state.msLeftDate;
    document.getElementById('p3RightDateSelect').value = state.msRightDate;
    document.getElementById('p3MapTag').textContent = state.msSection;
    document.getElementById('p3ContextPill').textContent = `${state.msSection} · ${state.msObject}`;

    // Node detail card
    document.getElementById('p3NodeTitle').textContent = activeNode.title;
    document.getElementById('p3NodeDate').textContent = activeNode.date;
    document.getElementById('p3NodeThumb').src = activeNode.imgMode === 'after' ? IMG.milestoneAfter : IMG.milestoneBefore;

    // Split comparison images & filters
    const beforeImg = document.getElementById('p3BeforeImg');
    const afterImg = document.getElementById('p3AfterImg');
    beforeImg.src = leftNode.imgMode === 'after' ? IMG.milestoneAfter : IMG.milestoneBefore;
    beforeImg.style.filter = leftNode.filter;
    afterImg.src = rightNode.imgMode === 'after' ? IMG.milestoneAfter : IMG.milestoneBefore;
    afterImg.style.filter = rightNode.filter;

    beforeImg.style.transform = `scale(${state.msZoom})`;
    afterImg.style.transform = `scale(${state.msZoom})`;

    // Split position
    document.getElementById('p3BeforeClip').style.clipPath = `inset(0 ${100 - state.msSplitPct}% 0 0)`;
    document.getElementById('p3Divider').style.left = `${state.msSplitPct}%`;
    document.getElementById('p3Handle').setAttribute('aria-valuenow', Math.round(state.msSplitPct));

    // Right milestone timeline
    document.getElementById('p3MilestoneList').innerHTML = nodes.map(n => `
      <div class="timeline-item ${n.id === state.msActiveNodeId ? 'active' : ''}" data-msnode="${n.id}">
        <span class="timeline-node"></span>
        <div>
          <div class="timeline-sub">${n.date}</div>
          <div class="timeline-label">${n.title}</div>
        </div>
      </div>
    `).join('');
  }

  /* ------------------------------------------------------------------------
     PAGE 4 RENDERING (专题展示)
     ------------------------------------------------------------------------ */
  function renderPage4Data() {
    const topics = DATA.showcaseTopics;
    const topic = topics[state.scTopicIndex];

    // Left topic list
    document.getElementById('p4TopicList').innerHTML = topics.map((t, i) => `
      <button class="topic-card ${i === state.scTopicIndex ? 'active' : ''}" data-tidx="${i}">
        <span class="topic-icon">${ICONS[t.icon] || ICONS.layers}</span>
        <div class="topic-info">
          <div class="topic-title">${t.title}</div>
          <div class="topic-desc">${t.subtitle}</div>
        </div>
        ${i === state.scTopicIndex ? '' : `<span class="topic-arrow">${ICONS.chevronRight}</span>`}
      </button>
    `).join('');

    // Center theater window
    const win = document.getElementById('p4TheaterWin');
    win.style.display = state.scClosed ? 'none' : 'flex';
    win.classList.toggle('minimized', state.scMinimized);
    win.classList.toggle('hall-expanded', state.scHallMode);

    document.getElementById('p4LeftCol').classList.toggle('hall-hidden', state.scHallMode);
    document.getElementById('p4RightCol').classList.toggle('hall-hidden', state.scHallMode);
    document.getElementById('p4HallModeBtn').classList.toggle('active', state.scHallMode);
    document.getElementById('p4HallModeBtn').innerHTML = `${ICONS.hall}<span>${state.scHallMode ? '退出展厅' : '展厅模式'}</span>`;

    document.getElementById('p4VideoTitle').textContent = topic.videoTitle;
    document.getElementById('p4StageImg').src = IMG[topic.imgKey];
    document.getElementById('p4TheaterStage').classList.toggle('playing', state.scPlaying);

    // Chapter HUD synced to current progress
    const chIdx = Math.min(topic.chapters.length - 1, Math.floor((state.scCurrentSec / Math.max(1, topic.durationSec)) * topic.chapters.length));
    document.getElementById('p4HudChapterTag').textContent = `展厅讲解 · 章节 ${chIdx + 1}/${topic.chapters.length}`;
    document.getElementById('p4HudCaptionText').textContent = topic.chapters[chIdx];
    document.getElementById('p4HudKpis').innerHTML = topic.kpis.map(k => `
      <div class="hud-kpi-pill"><strong>${k.val}</strong><span>${k.label}</span></div>
    `).join('');

    // Right controls & summary
    document.getElementById('p4StartBtn').innerHTML = state.scPlaying
      ? `${ICONS.pause}<span>演示中</span>`
      : `${ICONS.play}<span>开始演示</span>`;
    document.getElementById('p4AutoBtn').classList.toggle('active-toggle', state.scAutoCarousel);

    document.getElementById('p4SummaryList').innerHTML = topic.summaries.map(s => `
      <div class="summary-item">
        <span class="summary-dot"></span>
        <div>
          <div class="summary-title">${s.title}</div>
          <div class="summary-desc">${s.desc}</div>
        </div>
      </div>
    `).join('');

    // Bottom playback bar
    document.getElementById('p4BarPlayBtn').innerHTML = state.scPlaying ? ICONS.pause : ICONS.play;
    document.getElementById('p4TimeReadout').textContent = `${fmtTime(state.scCurrentSec)} / ${topic.durationStr}`;
    const slider = document.getElementById('p4ProgressSlider');
    slider.max = topic.durationSec;
    slider.value = state.scCurrentSec;
    document.getElementById('p4MuteBtn').innerHTML = state.scMuted ? ICONS.mute : ICONS.volume;
    document.getElementById('p4SpeedBtn').textContent = `${state.scSpeed.toFixed(1)}x`;
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS: GLOBAL
     ------------------------------------------------------------------------ */
  function bindGlobalEvents() {
    // Brand home click
    document.getElementById('brandHomeBtn').addEventListener('click', () => {
      state.activeSectionId = null;
      switchModule('home', 'overview');
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToOverview(1.2);
      showToast('已返回综合首页全线三维总览视图');
    });

    // System management gear icon (Module 15)
    document.getElementById('sysManageBtn').addEventListener('click', () => {
      switchModule('system');
    });

    // Sub-page switching (works for Module 1 AND any registered plugin module)
    document.getElementById('subTabs').addEventListener('click', e => {
      const btn = e.target.closest('.sub-tab-btn');
      if (!btn) return;
      if (state.moduleId === 'home') {
        const prev = state.page;
        state.page = btn.dataset.page;
        updateUrlHash(state.page);
        syncAllViews();
        if (window.JIHEI_CESIUM && prev !== state.page) {
          if (state.page === 'overview') {
            if (state.activeSectionId) window.JIHEI_CESIUM.flyToSection(state.activeSectionId);
            else window.JIHEI_CESIUM.flyToOverview(1.2);
          } else if (state.page === 'roaming') {
            const st = DATA.roamingStations[state.roamingIndex];
            window.JIHEI_CESIUM.flyToRoamingStation(st.id, state.roamingView, state.roamingSpeed);
          } else if (state.page === 'showcase') {
            window.JIHEI_CESIUM.flyToOverview(1.2);
          }
        }
      } else {
        const prevSub = state.moduleSubPageId;
        const nextSub = btn.dataset.page;
        if (prevSub !== nextSub) {
          const curMod = moduleRegistry[state.moduleId];
          if (curMod && typeof curMod.onSubPageLeave === 'function') {
            try { curMod.onSubPageLeave(prevSub, nextSub); } catch (err) { console.warn(err); }
          }
        }
        state.moduleSubPageId = nextSub;
        updateUrlHash(`${state.moduleId}/${state.moduleSubPageId}`);
        syncAllViews();
      }
    });

    // Projected Cesium HTML markers click delegation
    document.getElementById('cesiumOverlayRoot').addEventListener('click', e => {
      const poiEl = e.target.closest('[data-poi]');
      if (poiEl) {
        const pid = poiEl.dataset.poi;
        state.selectedPoiId = pid;
        state.poiDetailVisible = true;
        if (DATA.poiObjects[pid]) state.p1VideoSec = DATA.poiObjects[pid].elapsed;
        if (state.page === 'roaming') {
          const idx = DATA.roamingStations.findIndex(s => s.id === pid);
          if (idx >= 0) jumpToRoamingStation(idx, true);
        } else {
          syncAllViews();
          if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToPoi(pid);
          showToast(`已飞抵工程对象：${DATA.poiObjects[pid].name}`);
        }
        return;
      }
      const secEl = e.target.closest('[data-map-sec]');
      if (secEl) {
        toggleWorkSection(secEl.dataset.mapSec);
        return;
      }
      const dirEl = e.target.closest('[data-dir]');
      if (dirEl) {
        if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToDirection(dirEl.dataset.dir);
        showToast(dirEl.dataset.dir === 'start' ? '已定位至明水方向起点（一工区）' : '已定位至北安方向终点（六工区）');
      }
    });

    // Main top nav modules (routes dynamically to registered plugin modules)
    document.getElementById('mainNav').addEventListener('click', e => {
      const btn = e.target.closest('.main-nav-item');
      if (!btn) return;
      switchModule(btn.dataset.mod);
    });

    // Global work section pills
    document.getElementById('sectionFilters').addEventListener('click', e => {
      const pill = e.target.closest('.section-pill');
      if (!pill) return;
      toggleWorkSection(pill.dataset.sec);
    });

    // Demo data badge modal (with one-click local demo state reset)
    document.getElementById('demoInfoBtn').addEventListener('click', () => {
      const loadedCount = Object.keys(moduleRegistry).length;
      const totalPluginCount = Object.keys(MODULE_SCRIPTS).length;
      const savedCount = STORE.listKeys().length;
      openModal('系统原型 · 演示数据说明', `
        <p style="color:#dbeafe;line-height:1.7;">当前界面为 <strong>G1211吉黑高速明水至北安段工程建设项目综合管理平台</strong>全量高保真可交互原型，覆盖 <strong>16 个业务模块 / 64 个页面</strong>（支持 Ctrl+K 全局快捷直达与本地演示状态持久化）。</p>
        <div class="detail-grid">
          <div class="detail-stat-card"><span>全量覆盖规模</span><strong>16 模块 / 64 页</strong></div>
          <div class="detail-stat-card"><span>按需懒加载状态</span><strong>已加载 ${loadedCount} / ${totalPluginCount} 模块</strong></div>
          <div class="detail-stat-card"><span>数据口径日期</span><strong>${escHtml(state.selectedDate)}</strong></div>
        </div>
        <div style="display:flex;align-items:center;justify-content:space-between;gap:12px;padding-top:6px;border-top:1px solid rgba(56,189,248,0.2);">
          <span style="font-size:12px;color:#93c5fd;">本地已持久化的演示偏好项：${savedCount} 项</span>
          <button type="button" class="dock-btn primary" data-reset-demo="1">一键重置演示状态</button>
        </div>
      `);
    });

    // Global date switcher (live linkage across home + active module)
    document.getElementById('globalDateBtn').addEventListener('click', () => {
      const idx = DATE_PRESETS.findIndex(d => d.date === state.selectedDate);
      const nextPreset = DATE_PRESETS[(idx + 1) % DATE_PRESETS.length];
      state.selectedDate = nextPreset.date;
      document.getElementById('globalDateText').textContent = nextPreset.date;
      persistSession();
      if (state.moduleId === 'home') {
        renderPage1Data();
      } else {
        const mod = moduleRegistry[state.moduleId];
        const host = document.getElementById('moduleStageHost');
        if (mod && typeof mod.onDateChange === 'function') {
          try { mod.onDateChange(nextPreset.date, state.moduleSubPageId, nextPreset); } catch (e) { console.warn(e); }
        } else if (mod && host) {
          renderActiveModule(host, mod);
        }
      }
      showToast(`已切换统计基准日期：${nextPreset.date}（${nextPreset.label}）`);
    });

    // Ctrl+K Global Command Palette
    initCommandPalette();

    // Panel collapse toggles
    document.addEventListener('click', e => {
      const hdr = e.target.closest('[data-collapse]');
      if (!hdr) return;
      const panel = document.getElementById(hdr.dataset.collapse);
      if (panel) panel.classList.toggle('collapsed');
    });

    // Modal close, doc preview & demo reset delegation
    document.getElementById('modalCloseBtn').addEventListener('click', closeModal);
    document.getElementById('globalModal').addEventListener('click', e => {
      if (e.target.id === 'globalModal') closeModal();
      const previewBtn = e.target.closest('[data-doc-preview]');
      if (previewBtn) {
        showToast(`正在在线预览归档资料：${previewBtn.dataset.docPreview}`);
      }
      if (e.target.closest('[data-reset-demo]')) {
        resetDemoState();
      }
    });

    // AI Assistant Drawer
    const aiDrawer = document.getElementById('aiDrawer');
    document.getElementById('aiFabBtn').addEventListener('click', () => {
      aiDrawer.classList.toggle('open');
      if (aiDrawer.classList.contains('open')) document.getElementById('aiInput').focus();
    });
    document.getElementById('aiCloseBtn').addEventListener('click', () => aiDrawer.classList.remove('open'));
    const aiWorkbenchBtn = document.getElementById('aiWorkbenchBtn');
    if (aiWorkbenchBtn) {
      aiWorkbenchBtn.addEventListener('click', () => {
        aiDrawer.classList.remove('open');
        switchModule('ai');
      });
    }
    document.getElementById('aiQuickPrompts').addEventListener('click', e => {
      const chip = e.target.closest('.ai-chip');
      if (chip) handleAiQuery(chip.dataset.q);
    });
    document.getElementById('aiSendBtn').addEventListener('click', () => {
      const inp = document.getElementById('aiInput');
      if (inp.value.trim()) {
        handleAiQuery(inp.value.trim());
        inp.value = '';
      }
    });
    document.getElementById('aiInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') document.getElementById('aiSendBtn').click();
    });

    // Global Escape & Ctrl+K shortcuts
    document.addEventListener('keydown', e => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleCommandPalette();
        return;
      }
      if (e.key !== 'Escape') return;
      const cmdk = document.getElementById('cmdkBackdrop');
      if (cmdk && cmdk.classList.contains('open')) {
        closeCommandPalette();
        return;
      }
      const modal = document.getElementById('globalModal');
      if (modal && modal.classList.contains('open')) {
        closeModal();
      } else if (aiDrawer && aiDrawer.classList.contains('open')) {
        aiDrawer.classList.remove('open');
      }
    });

    // Full Hash Navigation (Supports Module 1 & Modules 2 ~ 16 deep links + browser Back/Forward)
    window.addEventListener('hashchange', () => {
      const route = parseHashRoute(location.hash);
      if (route.moduleId === 'home') {
        if (state.moduleId !== 'home' || route.subPageId !== state.page) {
          switchModule('home', route.subPageId, { fromHashChange: true });
        }
      } else if (route.moduleId !== state.moduleId || (route.subPageId && route.subPageId !== state.moduleSubPageId)) {
        switchModule(route.moduleId, route.subPageId, { fromHashChange: true });
      }
    });
  }

  /* ------------------------------------------------------------------------
     GLOBAL COMMAND PALETTE (Ctrl+K — 16 Modules / 64 Pages + Sections + Actions)
     ------------------------------------------------------------------------ */
  let cmdkActiveIdx = 0;
  let cmdkFiltered = [];

  function buildCommandItems() {
    const items = [];
    const catalog = Array.isArray(CONFIG.pageCatalog) ? CONFIG.pageCatalog : [];
    catalog.forEach(p => {
      items.push({
        type: 'page',
        category: p.modName,
        title: p.name,
        sub: `#${p.mod}/${p.sub}`,
        keywords: `${p.modName} ${p.name} ${p.mod} ${p.sub}`.toLowerCase(),
        run: () => switchModule(p.mod, p.sub)
      });
    });
    DATA.workSections.forEach(s => {
      items.push({
        type: 'section',
        category: '工区定位',
        title: `${s.name}（${s.stake}）`,
        sub: state.activeSectionId === s.id ? '当前已选中 · 点击恢复全线' : '切换工区筛选并三维定位',
        keywords: `工区 ${s.name} ${s.stake} ${s.id}`.toLowerCase(),
        run: () => toggleWorkSection(s.id)
      });
    });
    Object.values(DATA.poiObjects).forEach(poi => {
      items.push({
        type: 'poi',
        category: '重点工程',
        title: `${poi.name}（${poi.section} · ${poi.stake}）`,
        sub: poi.stage,
        keywords: `重点工程 点位 ${poi.name} ${poi.section} ${poi.stake} ${poi.stage}`.toLowerCase(),
        run: () => {
          state.selectedPoiId = poi.id;
          state.poiDetailVisible = true;
          switchModule('home', 'overview');
          if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToPoi(poi.id);
        }
      });
    });
    items.push(
      {
        type: 'action', category: '快捷操作', title: '打开 AI 助手全屏工作台', sub: '16.AI助手',
        keywords: 'ai 助手 工作台 问答 讲解'.toLowerCase(),
        run: () => switchModule('ai')
      },
      {
        type: 'action', category: '快捷操作', title: '切换数据统计基准日期', sub: `当前 ${state.selectedDate}`,
        keywords: '日期 基准 历史 切换'.toLowerCase(),
        run: () => document.getElementById('globalDateBtn')?.click()
      },
      {
        type: 'action', category: '快捷操作', title: '切换全屏大屏展示', sub: 'Fullscreen',
        keywords: '全屏 大屏 展厅 fullscreen'.toLowerCase(),
        run: () => toggleDocFullscreen()
      },
      {
        type: 'action', category: '快捷操作', title: '一键重置演示状态与缓存', sub: '恢复初始默认状态',
        keywords: '重置 缓存 还原 初始 reset'.toLowerCase(),
        run: () => resetDemoState()
      }
    );
    return items;
  }

  function renderCommandList(query) {
    const q = String(query || '').trim().toLowerCase();
    const all = buildCommandItems();
    cmdkFiltered = q
      ? all.filter(it => it.keywords.includes(q))
      : all.slice(0, 18);
    if (cmdkActiveIdx >= cmdkFiltered.length) cmdkActiveIdx = 0;

    const listEl = document.getElementById('cmdkList');
    const countEl = document.getElementById('cmdkCountText');
    if (countEl) countEl.textContent = q ? `匹配 ${cmdkFiltered.length} 项` : `推荐 ${cmdkFiltered.length} / 全量 ${all.length} 项`;
    if (!listEl) return;

    if (!cmdkFiltered.length) {
      listEl.innerHTML = UI.renderEmptyState ? UI.renderEmptyState('未匹配到页面或操作，请更换关键词') : '<div class="jihei-empty">暂无匹配项</div>';
      return;
    }

    listEl.innerHTML = cmdkFiltered.map((it, idx) => `
      <button type="button" class="cmdk-item ${idx === cmdkActiveIdx ? 'active' : ''}" data-cmdk-idx="${idx}">
        <span class="cmdk-item-main">
          <span class="cmdk-item-cat">${escHtml(it.category)}</span>
          <span class="cmdk-item-title">${escHtml(it.title)}</span>
        </span>
        <span class="cmdk-item-sub">${escHtml(it.sub)}</span>
      </button>
    `).join('');
  }

  function openCommandPalette() {
    const bd = document.getElementById('cmdkBackdrop');
    const inp = document.getElementById('cmdkInput');
    if (!bd || !inp) return;
    cmdkActiveIdx = 0;
    inp.value = '';
    renderCommandList('');
    bd.classList.add('open');
    setTimeout(() => inp.focus(), 10);
  }

  function closeCommandPalette() {
    const bd = document.getElementById('cmdkBackdrop');
    if (bd) bd.classList.remove('open');
  }

  function toggleCommandPalette() {
    const bd = document.getElementById('cmdkBackdrop');
    if (bd && bd.classList.contains('open')) closeCommandPalette();
    else openCommandPalette();
  }

  function initCommandPalette() {
    const trigger = document.getElementById('cmdkTriggerBtn');
    const bd = document.getElementById('cmdkBackdrop');
    const inp = document.getElementById('cmdkInput');
    const list = document.getElementById('cmdkList');
    if (!bd || !inp || !list) return;

    if (trigger) trigger.addEventListener('click', openCommandPalette);
    bd.addEventListener('click', e => {
      if (e.target === bd) closeCommandPalette();
    });
    inp.addEventListener('input', e => {
      cmdkActiveIdx = 0;
      renderCommandList(e.target.value);
    });
    inp.addEventListener('keydown', e => {
      if (!cmdkFiltered.length) return;
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        cmdkActiveIdx = (cmdkActiveIdx + 1) % cmdkFiltered.length;
        renderCommandList(inp.value);
        list.querySelector('.cmdk-item.active')?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        cmdkActiveIdx = (cmdkActiveIdx - 1 + cmdkFiltered.length) % cmdkFiltered.length;
        renderCommandList(inp.value);
        list.querySelector('.cmdk-item.active')?.scrollIntoView({ block: 'nearest' });
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const item = cmdkFiltered[cmdkActiveIdx];
        if (item) {
          closeCommandPalette();
          item.run();
        }
      }
    });
    list.addEventListener('click', e => {
      const btn = e.target.closest('[data-cmdk-idx]');
      if (!btn) return;
      const item = cmdkFiltered[Number(btn.dataset.cmdkIdx)];
      if (item) {
        closeCommandPalette();
        item.run();
      }
    });
  }

  function toggleWorkSection(secId) {
    const cesVisible = getActiveCesiumMode() !== 'opaque';
    if (state.activeSectionId === secId) {
      state.activeSectionId = null;
      if (cesVisible && window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToOverview(1.2);
      showToast('已恢复全线（一至六工区）汇总视图');
    } else {
      state.activeSectionId = secId;
      const sec = DATA.workSections.find(s => s.id === secId);
      if (sec) {
        state.msSection = sec.name;
        if (cesVisible && window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToSection(secId);
        showToast(cesVisible ? `已三维飞抵 ${sec.name}（${sec.stake}）` : `已筛选 ${sec.name}（${sec.stake}）数据`);
      }
    }
    persistSession();

    if (state.moduleId === 'home') {
      syncAllViews();
      return;
    }

    // Update top section pill highlights without forcing an extra full-module re-render
    document.querySelectorAll('.section-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.sec === state.activeSectionId);
    });

    const host = document.getElementById('moduleStageHost');
    const mod = moduleRegistry[state.moduleId];
    if (!host || !mod) return;

    const prevChild = host.firstChild;
    if (typeof mod.onSectionChange === 'function') {
      try {
        mod.onSectionChange(state.activeSectionId, state.moduleSubPageId);
      } catch (e) {
        console.warn('[JIHEI_PLATFORM] onSectionChange error:', e);
      }
    }
    // Only re-render if onSectionChange did not already replace module DOM (preserve in-place canvas animation for blacksoil)
    if (host.firstChild === prevChild && state.moduleId !== 'blacksoil') {
      renderActiveModule(host, mod);
    }
  }

  function appendAiMessage(role, content, isHtml) {
    const box = document.getElementById('aiMessages');
    if (!box) return;
    const msgEl = document.createElement('div');
    msgEl.className = `ai-msg ${role}`;
    if (isHtml) msgEl.innerHTML = content;
    else msgEl.textContent = content;
    box.appendChild(msgEl);
    box.scrollTop = box.scrollHeight;
  }

  function handleAiQuery(q) {
    appendAiMessage('user', q, false);
    let reply = '已检索全线数字孪生台账：当前明水至北安段路基工程完成 <strong>72.8%</strong>，桥梁工程完成 <strong>63.4%</strong>，场站工程完成 <strong>88.9%</strong>，整体受控推进。';
    if (q.includes('二工区')) {
      reply = '<strong>二工区（K24+500 ~ K48+200）</strong>当前路基进度 <strong>74.6%</strong>，桥梁进度 <strong>66.8%</strong>，重点工程「桥梁示例A」处于梁板架设冲刺期，质量抽检合格率 <strong>99.5%</strong>。已为您飞抵二工区！';
      state.activeSectionId = 'sec2';
      switchModule('home', 'overview');
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToSection('sec2');
    } else if (q.includes('桥梁')) {
      reply = '<strong>桥梁示例A（二工区 · K34+280）</strong>全长 684m，当前处于 <strong>梁板架设</strong> 阶段，已架设预制箱梁 56/80 片（68.5%），01号摄像机实时在线监测中。';
      state.selectedPoiId = 'bridgeA';
      state.poiDetailVisible = true;
      switchModule('home', 'overview');
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToPoi('bridgeA');
    } else if (q.includes('节点')) {
      reply = '本月计划关键节点共 <strong>3 项</strong>：① 桥梁示例A主跨箱梁架设（推进中）；② 一工区 K18+400 路基交验（已完成）；③ 四工区跨河中桥盖梁浇筑（重点盯控）。';
    } else if (q.includes('里程碑') || q.includes('对比')) {
      reply = '已为您切换至 <strong>建设里程碑</strong> 视图，可拖动中间卷帘对比 2026-09-25 墩台施工与 2026-11-20 梁板架设实景变化。';
      switchModule('home', 'milestone');
    } else if (q.includes('漫游')) {
      reply = '已切换至 <strong>数字漫游</strong> 页面，正在沿明水至北安走廊自动飞行巡览 5 个关键站点。';
      switchModule('home', 'roaming');
      if (window.JIHEI_CESIUM) {
        const st = DATA.roamingStations[state.roamingIndex];
        window.JIHEI_CESIUM.flyToRoamingStation(st.id, state.roamingView, state.roamingSpeed);
      }
    } else if (q.includes('专题') || q.includes('展厅')) {
      reply = '已切换至 <strong>专题展示</strong> 页面，支持 6 大专题自动轮播与一键展厅模式。';
      switchModule('home', 'showcase');
    } else if (q.includes('进度')) {
      reply = '已为您切换至 <strong>进度管理</strong> 模块，可查看全线形象进度、报表及 BIM 进度模拟。';
      switchModule('progress');
    } else if (q.includes('质量')) {
      reply = '已为您切换至 <strong>质量管理</strong> 模块，可查看试验室、拌合站、智慧梁场与整改闭环。';
      switchModule('quality');
    } else if (q.includes('安全')) {
      reply = '已为您切换至 <strong>安全管理</strong> 模块，可查看风险点位、视频 AI 预警与隐患台账。';
      switchModule('safety');
    } else if (q.includes('无人机')) {
      reply = '已为您切换至 <strong>无人机巡检</strong> 模块，支持航线规划、实时巡检与隐患识别。';
      switchModule('uav');
    } else if (q.includes('黑土地')) {
      reply = '已为您切换至 <strong>黑土地保护</strong> 遥感影像卷帘对比页面。';
      switchModule('blacksoil');
    } else if (q.includes('工作台') || q.includes('全屏')) {
      reply = '正在为您打开 <strong>AI 助手全屏工作台</strong>。';
      const drawer = document.getElementById('aiDrawer');
      if (drawer) drawer.classList.remove('open');
      switchModule('ai');
    }
    setTimeout(() => {
      appendAiMessage('bot', reply, true);
    }, 220);
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS: PAGE 1
     ------------------------------------------------------------------------ */
  function bindPage1Events() {
    // Management tabs
    document.getElementById('p1MgmtTabs').addEventListener('click', e => {
      const btn = e.target.closest('.seg-tab');
      if (!btn) return;
      state.mgmtTab = btn.dataset.tab;
      persistSession();
      renderPage1Data();
    });

    // Focus rows modal
    document.getElementById('p1FocusList').addEventListener('click', e => {
      const row = e.target.closest('.focus-row');
      if (!row) return;
      const focus = DATA.focusItems.find(f => f.id === row.dataset.focus);
      if (!focus) return;
      openModal(`重点关注 · ${focus.title}（${focus.count}${focus.unit}）`, `
        <table class="data-table">
          <thead><tr><th>事项名称</th><th>责任工区</th><th>计划期限</th><th>状态</th></tr></thead>
          <tbody>
            ${focus.records.map(r => `
              <tr>
                <td>${r.name}</td>
                <td>${r.section}</td>
                <td style="font-variant-numeric:tabular-nums;">${r.due}</td>
                <td><span class="status-tag ${r.statusClass}">${r.status}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `);
    });

    // Close detail card
    document.getElementById('p1CloseDetailBtn').addEventListener('click', () => {
      state.poiDetailVisible = false;
      renderPage1Data();
      showToast('已收起对象详情，点击地图任意工程点位可重新打开');
    });

    // Video controls
    document.getElementById('p1VideoToggle').addEventListener('click', () => {
      state.p1VideoPlaying = !state.p1VideoPlaying;
      renderPage1Data();
    });
    document.getElementById('p1VideoMute').addEventListener('click', () => {
      state.p1VideoMuted = !state.p1VideoMuted;
      renderPage1Data();
    });
    document.getElementById('p1VideoScrubber').addEventListener('input', e => {
      state.p1VideoSec = Number(e.target.value);
      document.getElementById('p1VideoTime').textContent = `${fmtTime(state.p1VideoSec)} / ${DATA.poiObjects[state.selectedPoiId].duration}`;
    });
    document.getElementById('p1VideoExpand').addEventListener('click', () => {
      const poi = DATA.poiObjects[state.selectedPoiId];
      openModal(`高清视频监控 · ${poi.camera}`, `
        <div class="media-card playing" style="margin:0;">
          <img src="${IMG[poi.imgKey]}" alt="${poi.name}" />
          <div class="media-top-badges">
            <span class="live-pill"><span class="live-dot"></span>实时高清码流 1080P · 演示</span>
            <span class="cam-pill">${poi.stake}</span>
          </div>
        </div>
        <div style="display:flex;justify-content:space-between;color:#bae6fd;font-size:12.5px;">
          <span>所属工区：${poi.section}</span>
          <span>当前阶段：${poi.stage}</span>
          <span>责任人：${poi.metrics.supervisor}</span>
        </div>
      `);
    });

    // Engineering detail & docs modals
    document.getElementById('p1ViewDetailBtn').addEventListener('click', () => showPoiDetailModal(state.selectedPoiId));
    document.getElementById('p1ViewDocsBtn').addEventListener('click', () => showPoiDocsModal(state.selectedPoiId));

    // Bottom layer toggles (wired directly to Cesium 3D imagery, vector, & BIM layers)
    document.getElementById('p1LayerBar').addEventListener('click', e => {
      const item = e.target.closest('[data-layer]');
      if (!item) return;
      const k = item.dataset.layer;
      state.p1Layers[k] = !state.p1Layers[k];
      persistSession();
      renderPage1Data();
      syncCesiumScene();
      const labels = { satellite: '高分遥感与矢量叠加', uav: '开源高清实景影像', bim: '三维BIM模型', pois: '工程点位', sections: '矢量工区走廊', route: '发光矢量路线' };
      showToast(`${labels[k]}：${state.p1Layers[k] ? '已开启' : '已关闭'}`);
    });

    // Cesium 3D zoom + reset
    document.getElementById('p1ZoomIn').addEventListener('click', () => {
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.zoomIn();
    });
    document.getElementById('p1ZoomOut').addEventListener('click', () => {
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.zoomOut();
    });
    document.getElementById('p1ZoomReset').addEventListener('click', () => {
      state.activeSectionId = null;
      persistSession();
      syncAllViews();
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToOverview(1.2);
      showToast('已重置 Cesium 三维地图至全线俯瞰视角');
    });
  }

  function showPoiDetailModal(poiId) {
    const poi = DATA.poiObjects[poiId] || DATA.poiObjects.bridgeA;
    openModal(`工程详情 · ${poi.name}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区 / 桩号</span><strong>${poi.section} · ${poi.stake}</strong></div>
        <div class="detail-stat-card"><span>工程形象进度</span><strong>${poi.metrics.progress}</strong></div>
        <div class="detail-stat-card"><span>规模 / 完成量</span><strong>${poi.metrics.beamsDone}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:130px;">工程名称</th><td>${poi.name}</td><th style="width:130px;">工程类型</th><td>${poi.type}</td></tr>
          <tr><th>当前施工阶段</th><td><span class="status-tag info">${poi.stage}</span></td><th>现场负责人</th><td>${poi.metrics.supervisor}</td></tr>
          <tr><th>关联影像资料</th><td>照片 ${poi.photos} 张 / 视频 ${poi.videos} 条</td><th>累计巡检记录</th><td>${poi.inspections} 条（正常）</td></tr>
        </tbody>
      </table>
    `);
  }

  function showPoiDocsModal(poiId) {
    const poi = DATA.poiObjects[poiId] || DATA.poiObjects.bridgeA;
    openModal(`关联资料清单 · ${poi.name}`, `
      <table class="data-table">
        <thead><tr><th>文件名称</th><th>资料分类</th><th>归档日期</th><th>大小</th><th>操作</th></tr></thead>
        <tbody>
          ${poi.docs.map(d => `
            <tr>
              <td>${d.name}</td>
              <td><span class="status-tag info">${d.type}</span></td>
              <td>${d.date}</td>
              <td>${d.size}</td>
              <td><button class="dock-btn" data-doc-preview="${escHtml(d.name)}">预览</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS: PAGE 2 (数字漫游)
     ------------------------------------------------------------------------ */
  function jumpToRoamingStation(idx, notify) {
    const len = DATA.roamingStations.length;
    state.roamingIndex = (idx + len) % len;
    const st = DATA.roamingStations[state.roamingIndex];
    renderPage2Data();
    syncCesiumScene();
    if (window.JIHEI_CESIUM) {
      window.JIHEI_CESIUM.flyToRoamingStation(st.id, state.roamingView, state.roamingSpeed);
    }
    if (notify) showToast(`当前漫游站点 (${state.roamingIndex + 1}/${len})：${st.name}`);
  }

  function bindPage2Events() {
    document.getElementById('p2FullRouteBtn').addEventListener('click', () => {
      state.roamingAutoMode = 'auto';
      state.roamingPlaying = true;
      jumpToRoamingStation(0, false);
      showToast('已启动全线漫游（明水方向起点 → 北安方向终点）');
    });

    // Click left list or bottom track
    document.getElementById('p2RouteList').addEventListener('click', e => {
      const el = e.target.closest('[data-ridx]');
      if (el) jumpToRoamingStation(Number(el.dataset.ridx), true);
    });
    document.getElementById('p2StationTrack').addEventListener('click', e => {
      const el = e.target.closest('[data-ridx]');
      if (el) jumpToRoamingStation(Number(el.dataset.ridx), true);
    });

    // Settings
    document.getElementById('p2DwellSwitch').addEventListener('click', () => {
      state.roamingDwell = !state.roamingDwell;
      persistSession();
      renderPage2Data();
      showToast(`到站停留：${state.roamingDwell ? '已开启（每站停留展示）' : '已关闭（连续巡飞）'}`);
    });
    document.getElementById('p2ViewSeg').addEventListener('click', e => {
      const b = e.target.closest('[data-view]');
      if (!b) return;
      state.roamingView = b.dataset.view;
      persistSession();
      jumpToRoamingStation(state.roamingIndex, false);
      showToast(`已切换漫游视角：${state.roamingView === 'overhead' ? '俯瞰视角' : '沿线沉浸视角'}`);
    });
    document.getElementById('p2AutoSeg').addEventListener('click', e => {
      const b = e.target.closest('[data-mode]');
      if (!b) return;
      state.roamingAutoMode = b.dataset.mode;
      state.roamingPlaying = (b.dataset.mode === 'auto');
      renderPage2Data();
      showToast(state.roamingAutoMode === 'auto' ? '已进入自动漫游模式' : '已进入自由漫游模式（支持拖拽与滚轮缩放）');
    });
    document.getElementById('p2RenderSeg').addEventListener('click', e => {
      const b = e.target.closest('[data-render]');
      if (!b) return;
      state.roamingRenderMode = b.dataset.render;
      renderPage2Data();
      syncCesiumScene();
      showToast(state.roamingRenderMode === 'real' ? '已切换：开源高清实景三维漫游' : '已切换：暗色科技底图 + 三维BIM设计模型预览');
    });

    // Transport buttons
    document.getElementById('p2PrevBtn').addEventListener('click', () => jumpToRoamingStation(state.roamingIndex - 1, true));
    document.getElementById('p2NextBtn').addEventListener('click', () => jumpToRoamingStation(state.roamingIndex + 1, true));
    document.getElementById('p2PlayPauseBtn').addEventListener('click', () => {
      state.roamingPlaying = !state.roamingPlaying;
      renderPage2Data();
    });
    document.getElementById('p2SpeedSelect').addEventListener('change', e => {
      state.roamingSpeed = Number(e.target.value);
      persistSession();
      showToast(`漫游速度已调整为 ${state.roamingSpeed.toFixed(1)}×`);
    });
    document.getElementById('p2FullscreenBtn').addEventListener('click', toggleDocFullscreen);

    // Station detail & media buttons
    document.getElementById('p2StationMediaCard').addEventListener('click', () => {
      const st = DATA.roamingStations[state.roamingIndex];
      openModal(`站点现场影像 · ${st.name}`, `
        <div class="media-card playing" style="margin:0;">
          <img src="${IMG[st.imgKey]}" alt="${st.name}" />
          <div class="media-top-badges">
            <span class="live-pill"><span class="live-dot"></span>无人机巡航视频回放 · 演示</span>
            <span class="cam-pill">${st.section} · ${st.duration}</span>
          </div>
        </div>
        <p style="color:#dbeafe;">${st.desc}</p>
      `);
    });
    document.getElementById('p2StationDetailBtn').addEventListener('click', () => {
      const st = DATA.roamingStations[state.roamingIndex];
      const poiId = DATA.poiObjects[st.id] ? st.id : 'bridgeA';
      showPoiDetailModal(poiId);
    });
    document.getElementById('p2StationDocsBtn').addEventListener('click', () => {
      const st = DATA.roamingStations[state.roamingIndex];
      const poiId = DATA.poiObjects[st.id] ? st.id : 'bridgeA';
      showPoiDocsModal(poiId);
    });

    // Utility pad (Cesium 3D controls)
    document.getElementById('p2ToggleLayers').addEventListener('click', () => {
      state.roamingRenderMode = state.roamingRenderMode === 'real' ? 'design' : 'real';
      renderPage2Data();
      syncCesiumScene();
    });
    document.getElementById('p2ZoomIn').addEventListener('click', () => {
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.zoomIn();
    });
    document.getElementById('p2ZoomOut').addEventListener('click', () => {
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.zoomOut();
    });
    document.getElementById('p2ZoomReset').addEventListener('click', () => {
      if (window.JIHEI_CESIUM) window.JIHEI_CESIUM.flyToOverview(1.2);
    });
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS: PAGE 3 (建设里程碑 — Draggable Before/After Split)
     ------------------------------------------------------------------------ */
  function bindPage3Events() {
    const stage = document.getElementById('p3CompareStage');
    const divider = document.getElementById('p3Divider');
    const handle = document.getElementById('p3Handle');
    let dragging = false;

    function updateSplitFromClientX(clientX) {
      const rect = stage.getBoundingClientRect();
      const rawPct = ((clientX - rect.left) / rect.width) * 100;
      state.msSplitPct = Math.max(12, Math.min(88, rawPct));
      document.getElementById('p3BeforeClip').style.clipPath = `inset(0 ${100 - state.msSplitPct}% 0 0)`;
      divider.style.left = `${state.msSplitPct}%`;
      handle.setAttribute('aria-valuenow', Math.round(state.msSplitPct));
    }

    divider.addEventListener('pointerdown', e => {
      dragging = true;
      divider.classList.add('dragging');
      divider.setPointerCapture(e.pointerId);
      updateSplitFromClientX(e.clientX);
    });
    divider.addEventListener('pointermove', e => {
      if (dragging) updateSplitFromClientX(e.clientX);
    });
    divider.addEventListener('pointerup', () => {
      dragging = false;
      divider.classList.remove('dragging');
    });
    handle.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') { state.msSplitPct = Math.max(12, state.msSplitPct - 3); renderPage3Data(); }
      if (e.key === 'ArrowRight') { state.msSplitPct = Math.min(88, state.msSplitPct + 3); renderPage3Data(); }
    });

    // Dropdowns
    document.getElementById('p3SectionSelect').addEventListener('change', e => {
      state.msSection = e.target.value;
      renderPage3Data();
      showToast(`已切换对比工区：${state.msSection}`);
    });
    document.getElementById('p3ObjectSelect').addEventListener('change', e => {
      state.msObject = e.target.value;
      renderPage3Data();
      showToast(`已加载工程对象历史影像：${state.msObject}`);
    });
    document.getElementById('p3LeftDateSelect').addEventListener('change', e => {
      state.msLeftDate = e.target.value;
      renderPage3Data();
      showToast(`左侧对比影像已切换至 ${state.msLeftDate}`);
    });
    document.getElementById('p3RightDateSelect').addEventListener('change', e => {
      state.msRightDate = e.target.value;
      renderPage3Data();
      showToast(`右侧对比影像已切换至 ${state.msRightDate}`);
    });

    // Milestone nodes click
    document.getElementById('p3MilestoneList').addEventListener('click', e => {
      const item = e.target.closest('[data-msnode]');
      if (!item) return;
      state.msActiveNodeId = item.dataset.msnode;
      const node = DATA.milestoneNodes.find(n => n.id === state.msActiveNodeId);
      if (node) {
        if (node.imgMode === 'after') {
          state.msRightDate = node.date;
          state.msSplitPct = 36;
        } else {
          state.msLeftDate = node.date;
          state.msSplitPct = 62;
        }
        renderPage3Data();
        showToast(`已定位关键节点：${node.date} ${node.title}`);
      }
    });

    // Checkboxes
    document.getElementById('p3TypeChecks').addEventListener('change', e => {
      const cb = e.target.closest('input[data-type]');
      if (!cb) return;
      state.msFilters[cb.dataset.type] = cb.checked;
    });

    // Node video & docs modal
    document.getElementById('p3NodeMediaCard').addEventListener('click', () => {
      const node = DATA.milestoneNodes.find(n => n.id === state.msActiveNodeId) || DATA.milestoneNodes[3];
      openModal(`节点影像回放 · ${state.msObject} · ${node.title}`, `
        <div class="media-card playing" style="margin:0;">
          <img src="${node.imgMode === 'after' ? IMG.milestoneAfter : IMG.milestoneBefore}" alt="${node.title}" />
          <div class="media-top-badges">
            <span class="live-pill"><span class="live-dot"></span>无人机历史航拍 · ${node.date}</span>
          </div>
        </div>
        <p style="color:#dbeafe;">${node.desc}</p>
      `);
    });

    const openNodeDocs = () => {
      const node = DATA.milestoneNodes.find(n => n.id === state.msActiveNodeId) || DATA.milestoneNodes[3];
      openModal(`节点归档资料 · ${state.msObject}（${node.date} ${node.title}）`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>节点照片</span><strong>${node.photos} 张</strong></div>
          <div class="detail-stat-card"><span>无人机航拍视频</span><strong>${node.videos} 条</strong></div>
          <div class="detail-stat-card"><span>进度日志记录</span><strong>${node.logs} 条</strong></div>
        </div>
        <p style="color:#bae6fd;">${node.desc}</p>
        <table class="data-table">
          <thead><tr><th>资料名称</th><th>类型</th><th>采集日期</th><th>状态</th></tr></thead>
          <tbody>
            ${state.msFilters.photo ? `<tr><td>${state.msObject}_${node.title}_现场验收照片集.zip</td><td>节点照片</td><td>${node.date}</td><td><span class="status-tag ok">已归档</span></td></tr>` : ''}
            ${state.msFilters.uav ? `<tr><td>${state.msObject}_${node.date}_正射DOM航拍影像.tif</td><td>无人机影像</td><td>${node.date}</td><td><span class="status-tag info">已入库</span></td></tr>` : ''}
            ${state.msFilters.progress ? `<tr><td>${state.msSection}_${node.title}_监理签认进度表.pdf</td><td>进度记录</td><td>${node.date}</td><td><span class="status-tag ok">已签认</span></td></tr>` : ''}
          </tbody>
        </table>
      `);
    };
    document.getElementById('p3ViewNodeDocsBtn').addEventListener('click', openNodeDocs);
    document.querySelectorAll('[data-ms-tab]').forEach(btn => btn.addEventListener('click', openNodeDocs));

    // Zoom controls
    document.getElementById('p3ZoomIn').addEventListener('click', () => {
      state.msZoom = Math.min(1.9, +(state.msZoom + 0.15).toFixed(2));
      renderPage3Data();
    });
    document.getElementById('p3ZoomOut').addEventListener('click', () => {
      state.msZoom = Math.max(1, +(state.msZoom - 0.15).toFixed(2));
      renderPage3Data();
    });
    document.getElementById('p3ZoomReset').addEventListener('click', () => {
      state.msZoom = 1;
      state.msSplitPct = 50;
      renderPage3Data();
    });
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS: PAGE 4 (专题展示)
     ------------------------------------------------------------------------ */
  function selectShowcaseTopic(idx, autoPlay) {
    const len = DATA.showcaseTopics.length;
    state.scTopicIndex = (idx + len) % len;
    state.scCurrentSec = 0;
    state.scClosed = false;
    state.scMinimized = false;
    if (autoPlay !== undefined) state.scPlaying = autoPlay;
    renderPage4Data();
  }

  function bindPage4Events() {
    document.getElementById('p4TopicList').addEventListener('click', e => {
      const card = e.target.closest('[data-tidx]');
      if (!card) return;
      selectShowcaseTopic(Number(card.dataset.tidx));
      showToast(`已切换演示专题：${DATA.showcaseTopics[state.scTopicIndex].title}`);
    });

    const togglePlay = () => {
      state.scClosed = false;
      state.scMinimized = false;
      state.scPlaying = !state.scPlaying;
      renderPage4Data();
    };
    document.getElementById('p4BigPlayBtn').addEventListener('click', togglePlay);
    document.getElementById('p4BarPlayBtn').addEventListener('click', togglePlay);
    document.getElementById('p4StartBtn').addEventListener('click', () => {
      state.scClosed = false; state.scMinimized = false; state.scPlaying = true;
      renderPage4Data();
      showToast(`开始播放：${DATA.showcaseTopics[state.scTopicIndex].videoTitle}`);
    });
    document.getElementById('p4PauseBtn').addEventListener('click', () => {
      state.scPlaying = false;
      renderPage4Data();
    });
    document.getElementById('p4AutoBtn').addEventListener('click', () => {
      state.scAutoCarousel = !state.scAutoCarousel;
      if (state.scAutoCarousel) state.scPlaying = true;
      renderPage4Data();
      showToast(state.scAutoCarousel ? '已开启 6 大专题自动轮播演示' : '已关闭自动轮播');
    });
    document.getElementById('p4SwitchBtn').addEventListener('click', () => selectShowcaseTopic(state.scTopicIndex + 1, state.scPlaying));
    document.getElementById('p4PrevTopicBtn').addEventListener('click', () => selectShowcaseTopic(state.scTopicIndex - 1, state.scPlaying));
    document.getElementById('p4NextTopicBtn').addEventListener('click', () => selectShowcaseTopic(state.scTopicIndex + 1, state.scPlaying));

    // Hall mode & fullscreen
    document.getElementById('p4HallModeBtn').addEventListener('click', () => {
      state.scHallMode = !state.scHallMode;
      state.scClosed = false;
      state.scMinimized = false;
      if (state.scHallMode) state.scPlaying = true;
      renderPage4Data();
      showToast(state.scHallMode ? '已进入大屏展厅沉浸演示模式' : '已退出展厅模式');
    });
    document.getElementById('p4FullBtn').addEventListener('click', toggleDocFullscreen);
    document.getElementById('p4BarFullBtn').addEventListener('click', toggleDocFullscreen);

    // Window minimize / close
    document.getElementById('p4WinMin').addEventListener('click', () => {
      state.scMinimized = !state.scMinimized;
      renderPage4Data();
    });
    document.getElementById('p4WinClose').addEventListener('click', () => {
      state.scClosed = true;
      state.scPlaying = false;
      renderPage4Data();
      showToast('已关闭演示窗口，点击左侧任意专题或“开始演示”可重新打开');
    });

    // Scrubber, volume, speed
    document.getElementById('p4ProgressSlider').addEventListener('input', e => {
      state.scCurrentSec = Number(e.target.value);
      renderPage4Data();
    });
    document.getElementById('p4MuteBtn').addEventListener('click', () => {
      state.scMuted = !state.scMuted;
      renderPage4Data();
    });
    document.getElementById('p4VolSlider').addEventListener('input', e => {
      state.scVolume = Number(e.target.value);
      state.scMuted = state.scVolume === 0;
      renderPage4Data();
    });
    document.getElementById('p4SpeedBtn').addEventListener('click', () => {
      const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
      state.scSpeed = speeds[(speeds.indexOf(state.scSpeed) + 1) % speeds.length];
      renderPage4Data();
    });

    // Background zoom buttons restore/toggle hall size
    document.getElementById('p4BgZoomIn').addEventListener('click', () => { state.scHallMode = true; renderPage4Data(); });
    document.getElementById('p4BgZoomOut').addEventListener('click', () => { state.scHallMode = false; renderPage4Data(); });
    document.getElementById('p4BgZoomReset').addEventListener('click', () => {
      state.scHallMode = false; state.scClosed = false; state.scMinimized = false; renderPage4Data();
    });
  }

  function toggleDocFullscreen() {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen?.().catch(() => showToast('浏览器全屏受限时可使用展厅模式大屏展示'));
    } else {
      document.exitFullscreen?.();
    }
  }

  /* ------------------------------------------------------------------------
     SIMULATION TIMERS (Video playback, Auto-Roaming, Showcase Carousel)
     ------------------------------------------------------------------------ */
  function startSimulationTimers() {
    let roamTick = 0;

    setInterval(() => {
      // Only run home-page simulation timers while on Module 1 (综合首页) and tab is visible
      if (state.moduleId !== 'home' || document.hidden) return;

      // Page 1 simulated live monitor timer
      if (state.page === 'overview' && state.p1VideoPlaying && state.poiDetailVisible) {
        state.p1VideoSec = (state.p1VideoSec + 1) % 300;
        const poi = DATA.poiObjects[state.selectedPoiId] || DATA.poiObjects.bridgeA;
        const timeEl = document.getElementById('p1VideoTime');
        const scrubEl = document.getElementById('p1VideoScrubber');
        if (timeEl) timeEl.textContent = `${fmtTime(state.p1VideoSec)} / ${poi.duration}`;
        if (scrubEl) scrubEl.value = state.p1VideoSec;
      }

      // Page 2 auto roaming progression
      if (state.page === 'roaming' && state.roamingPlaying && state.roamingAutoMode === 'auto') {
        roamTick += state.roamingSpeed;
        const interval = state.roamingDwell ? 6.5 : 3.5;
        if (roamTick >= interval) {
          roamTick = 0;
          jumpToRoamingStation(state.roamingIndex + 1, false);
        }
      }

      // Page 4 showcase presentation playback
      if (state.page === 'showcase' && state.scPlaying && !state.scClosed) {
        const topic = DATA.showcaseTopics[state.scTopicIndex];
        state.scCurrentSec += state.scSpeed;
        if (state.scCurrentSec >= topic.durationSec) {
          if (state.scAutoCarousel) {
            selectShowcaseTopic(state.scTopicIndex + 1, true);
          } else {
            state.scCurrentSec = 0;
          }
        } else {
          renderPage4Data();
        }
      }
    }, 1000);
  }

  /* Expose standard Platform Plugin API for Modules 2 ~ 16 */
  window.JIHEI_PLATFORM = {
    registerModule(modDef) {
      if (!modDef || !modDef.id) return;
      moduleRegistry[modDef.id] = modDef;
      if (state.moduleId === modDef.id && document.getElementById('subTabs')) {
        renderSubTabsForCurrentModule();
        syncAllViews();
      }
    },
    switchModule,
    loadModuleScript,
    openCommandPalette,
    resetDemoState,
    getState: () => state,
    getRegisteredModules: () => Object.keys(moduleRegistry),
    ui: UI,
    store: STORE,
    escHtml,
    showToast,
    openModal,
    closeModal,
    icons: ICONS,
    data: DATA,
    cesium: () => window.JIHEI_CESIUM
  };

  /* Boot on DOM ready */
  document.addEventListener('DOMContentLoaded', mountApp);
})();
