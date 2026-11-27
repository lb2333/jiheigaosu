/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   Module 15: 系统管理 (m15_system.js)
   6 Subpages: 基础资料 | 用户权限 | 系统接入 | 指标口径 | 内容配置 | 日志档案
   ========================================================================== */
(function () {
  'use strict';

  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';
  const IMG = {
    corridor: ASSET_BASE + 'corridor_aerial.jpg',
    showcase: ASSET_BASE + 'showcase_viaduct.jpg',
    before: ASSET_BASE + 'milestone_before.jpg',
    after: ASSET_BASE + 'milestone_after.jpg'
  };

  const SECTION_MAP = {
    sec1: '一工区',
    sec2: '二工区',
    sec3: '三工区',
    sec4: '四工区',
    sec5: '五工区',
    sec6: '六工区'
  };

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS
     ------------------------------------------------------------------------ */
  const SVG = {
    shield: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 3v6c0 5-3.1 9.4-7 11-3.9-1.6-7-6-7-11V5l7-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/></svg>`,
    exit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    upload: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    building: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="3" width="10" height="18" rx="1"/><path d="M14 9h6v12h-6"/><line x1="7" y1="7" x2="11" y2="7"/><line x1="7" y1="11" x2="11" y2="11"/><line x1="7" y1="15" x2="11" y2="15"/></svg>`,
    yard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 20V9l6-4v4l6-4v4l6-4v15H3z"/><line x1="7" y1="15" x2="11" y2="15"/><line x1="14" y1="15" x2="18" y2="15"/></svg>`,
    bridge: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M2 8h20M2 12h20M6 12v8M18 12v8M6 12a6 6 0 0112 0"/></svg>`,
    map: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="1 6 8 2 16 6 23 2 23 18 16 22 8 18 1 22 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    pin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/></svg>`,
    monitor: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    sliders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/><circle cx="9" cy="7" r="2" fill="#081c40"/><circle cx="15" cy="12" r="2" fill="#081c40"/><circle cx="10" cy="17" r="2" fill="#081c40"/></svg>`,
    link: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
    warnTri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>`,
    chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="8" y1="16" x2="8" y2="11"/><line x1="12" y1="16" x2="12" y2="7"/><line x1="16" y1="16" x2="16" y2="13"/></svg>`,
    image: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 20"/></svg>`,
    video: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="5" width="20" height="14" rx="2"/><polygon points="10 9 16 12 10 15 10 9" fill="currentColor"/></svg>`,
    save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    sync: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
    folder: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>`,
    grip: `<svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor"><circle cx="5" cy="3" r="1.2"/><circle cx="11" cy="3" r="1.2"/><circle cx="5" cy="8" r="1.2"/><circle cx="11" cy="8" r="1.2"/><circle cx="5" cy="13" r="1.2"/><circle cx="11" cy="13" r="1.2"/></svg>`,
    up: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="18 15 12 9 6 15"/></svg>`,
    down: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="6 9 12 15 18 9"/></svg>`,
    calendar: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  };

  /* ------------------------------------------------------------------------
     SCOPED CSS (.m15-* ONLY)
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('m15-styles')) return;
    const style = document.createElement('style');
    style.id = 'm15-styles';
    style.textContent = `
      .m15-page {
        width: 100%;
        min-height: 100%;
        padding: 10px 16px 100px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        color: var(--text-main);
      }

      /* System Admin Sub-Banner */
      .m15-banner {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
        border-radius: 10px;
        background: linear-gradient(90deg, rgba(10, 38, 86, 0.92) 0%, rgba(8, 30, 68, 0.86) 60%, rgba(12, 46, 98, 0.9) 100%);
        border: 1px solid rgba(56, 220, 255, 0.36);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m15-banner-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m15-banner-badge {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 11px;
        border-radius: 99px;
        background: rgba(14, 165, 233, 0.16);
        border: 1px solid rgba(56, 220, 255, 0.55);
        color: #7dd3fc;
        font-size: 13px;
        font-weight: 700;
        letter-spacing: 0.4px;
      }
      .m15-banner-title {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m15-banner-title::before {
        content: "";
        width: 3px;
        height: 14px;
        border-radius: 2px;
        background: var(--gold);
        box-shadow: 0 0 8px rgba(250, 204, 21, 0.7);
      }
      .m15-banner-sub {
        font-size: 12px;
        color: var(--text-sub);
      }
      .m15-banner-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .m15-admin-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 12px;
        border-radius: 99px;
        background: rgba(12, 42, 92, 0.7);
        border: 1px solid rgba(56, 189, 248, 0.32);
        color: #dbeafe;
        font-size: 12px;
      }
      .m15-btn-return {
        height: 30px;
        padding: 0 13px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.45);
        background: rgba(14, 48, 104, 0.78);
        color: #e6f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.18s;
      }
      .m15-btn-return:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(22, 82, 162, 0.85);
        box-shadow: 0 0 12px rgba(56, 220, 255, 0.35);
      }

      /* Filter Bar */
      .m15-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.84);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m15-filter-group {
        display: flex;
        align-items: center;
        gap: 12px;
        flex-wrap: wrap;
      }
      .m15-filter-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }
      .m15-filter-item label {
        font-size: 12.5px;
        color: #cfe4ff;
        white-space: nowrap;
      }
      .m15-select, .m15-input, .m15-textarea {
        height: 30px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 36, 82, 0.88);
        color: #f1f7ff;
        font-size: 12.5px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m15-select { min-width: 118px; cursor: pointer; }
      .m15-select option { background: #0a2252; color: #ffffff; }
      .m15-textarea { height: auto; padding: 8px 10px; width: 100%; resize: vertical; font-family: inherit; }
      .m15-select:focus, .m15-input:focus, .m15-textarea:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.3);
      }
      .m15-search-box {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m15-search-box svg {
        position: absolute;
        left: 9px;
        color: #789bc4;
        pointer-events: none;
      }
      .m15-search-box .m15-input {
        padding-left: 28px;
        width: 185px;
      }
      .m15-date-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m15-date-wrap svg {
        position: absolute;
        right: 9px;
        color: #8ab4dc;
        pointer-events: none;
      }
      .m15-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m15-divider-v {
        width: 1px;
        height: 18px;
        background: rgba(125, 211, 252, 0.3);
        margin: 0 2px;
      }
      .m15-btn-query {
        height: 30px;
        padding: 0 15px;
        border-radius: 6px;
        border: 1px solid rgba(125, 211, 252, 0.72);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.45);
        transition: all 0.18s;
      }
      .m15-btn-query:hover { box-shadow: 0 0 18px rgba(56, 220, 255, 0.65); }
      .m15-btn-ghost {
        height: 30px;
        padding: 0 13px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(12, 42, 92, 0.72);
        color: #d8ecff;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s;
      }
      .m15-btn-ghost:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(20, 72, 146, 0.8);
      }
      .m15-btn-cyan {
        height: 30px;
        padding: 0 13px;
        border-radius: 6px;
        border: 1px solid rgba(56, 220, 255, 0.58);
        background: rgba(14, 72, 136, 0.68);
        color: #bae6fd;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s;
      }
      .m15-btn-cyan:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        box-shadow: 0 0 12px rgba(56, 220, 255, 0.4);
      }

      /* Panels */
      .m15-panel {
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.86) 0%, rgba(7, 23, 56, 0.85) 100%);
        border: 1px solid var(--border-cyan);
        border-radius: 10px;
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .m15-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
        gap: 10px;
      }
      .m15-panel-head-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m15-panel-title {
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.3px;
      }
      .m15-panel-sub {
        font-size: 12px;
        color: #8ab4dc;
        font-weight: 400;
      }
      .m15-panel-body {
        padding: 11px 14px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* KPI Grids */
      .m15-kpi-grid-4 { display: grid; grid-template-columns: repeat(4, 1fr); gap: 11px; }
      .m15-kpi-grid-5 { display: grid; grid-template-columns: repeat(5, 1fr); gap: 11px; }
      .m15-kpi-grid-6 { display: grid; grid-template-columns: repeat(6, 1fr); gap: 10px; }
      .m15-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 13px;
        border-radius: 9px;
        background: rgba(11, 39, 86, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.24);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m15-kpi-card:hover, .m15-kpi-card.active {
        border-color: rgba(56, 220, 255, 0.72);
        background: rgba(16, 56, 120, 0.8);
        transform: translateY(-1px);
      }
      .m15-kpi-ico {
        width: 36px;
        height: 36px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m15-ico-cyan { background: rgba(34, 211, 238, 0.14); border: 1px solid rgba(34, 211, 238, 0.42); color: #38f2ff; }
      .m15-ico-blue { background: rgba(59, 130, 246, 0.16); border: 1px solid rgba(96, 165, 250, 0.45); color: #60a5fa; }
      .m15-ico-green { background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(74, 222, 128, 0.45); color: #4ade80; }
      .m15-ico-gold { background: rgba(250, 204, 21, 0.14); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15; }
      .m15-ico-red { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(251, 113, 133, 0.48); color: #fb7185; }
      .m15-kpi-label { font-size: 12px; color: #a9c6e8; margin-bottom: 2px; }
      .m15-kpi-val { font-size: 21px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.1; }
      .m15-kpi-unit { font-size: 12px; font-weight: 500; color: #cbd5e1; margin-left: 3px; }
      .m15-c-cyan { color: #38f2ff; }
      .m15-c-blue { color: #60a5fa; }
      .m15-c-green { color: #4ade80; }
      .m15-c-gold { color: #fde047; }
      .m15-c-red { color: #fb7185; }

      /* Split Main Body */
      .m15-split-main {
        display: grid;
        grid-template-columns: minmax(0, 1.98fr) minmax(320px, 1.02fr);
        gap: 12px;
        align-items: stretch;
      }
      .m15-left-stack {
        display: flex;
        flex-direction: column;
        gap: 11px;
        min-width: 0;
      }

      /* Category Pills */
      .m15-cat-row {
        display: grid;
        grid-template-columns: repeat(8, minmax(0, 1fr));
        gap: 7px;
      }
      .m15-cat-pill {
        height: 28px;
        padding: 0 8px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(11, 38, 84, 0.72);
        color: #cfe4ff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.18s;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m15-cat-pill:hover { border-color: var(--cyan); color: #ffffff; }
      .m15-cat-pill.active {
        background: linear-gradient(180deg, rgba(16, 108, 210, 0.85), rgba(10, 68, 150, 0.9));
        border-color: #38f2ff;
        color: #ffffff;
        font-weight: 700;
        box-shadow: 0 0 12px rgba(56, 220, 255, 0.35);
      }

      /* Tables */
      .m15-table-wrap { width: 100%; overflow-x: auto; }
      .m15-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .m15-table th, .m15-table td {
        padding: 8px 10px;
        text-align: left;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        white-space: nowrap;
      }
      .m15-table th {
        color: #8eb8e5;
        background: rgba(11, 38, 86, 0.58);
        font-weight: 600;
      }
      .m15-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m15-table tbody tr:hover { background: rgba(22, 74, 150, 0.34); }
      .m15-table tbody tr.m15-row-selected {
        background: rgba(22, 119, 255, 0.24);
        box-shadow: inset 2px 0 0 #38f2ff;
      }
      .m15-code-txt { color: #7dd3fc; font-variant-numeric: tabular-nums; }

      /* Status Tags */
      .m15-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 9px;
        border-radius: 5px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m15-tag-green { background: rgba(34, 197, 94, 0.16); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.45); }
      .m15-tag-slate { background: rgba(100, 116, 139, 0.22); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.4); }
      .m15-tag-amber { background: rgba(250, 204, 21, 0.16); color: #fde047; border: 1px solid rgba(250, 204, 21, 0.48); }
      .m15-tag-red { background: rgba(244, 63, 94, 0.18); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.5); }
      .m15-tag-cyan { background: rgba(56, 189, 248, 0.18); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.5); }

      /* Pagination */
      .m15-pager {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-top: auto;
        padding-top: 6px;
        font-size: 12px;
        color: #93c5fd;
      }
      .m15-pager-info { margin-right: 4px; }
      .m15-pg-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(10, 34, 78, 0.72);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .m15-pg-btn:hover:not(:disabled) { border-color: var(--cyan); color: #fff; }
      .m15-pg-btn.active {
        background: #1677ff;
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m15-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Bottom Sub-Cards */
      .m15-subcard-grid-2 { display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; }
      .m15-subcard-grid-3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
      .m15-resource-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(11, 39, 86, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m15-resource-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m15-resource-ico {
        width: 34px;
        height: 34px;
        border-radius: 7px;
        background: rgba(14, 54, 114, 0.75);
        border: 1px solid rgba(56, 189, 248, 0.32);
        color: #38f2ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m15-resource-title { font-size: 13px; font-weight: 700; color: #f1f7ff; }
      .m15-resource-sub { font-size: 11.5px; color: #8ab4dc; margin-top: 2px; }
      .m15-resource-right { display: flex; align-items: center; gap: 10px; flex-shrink: 0; font-size: 12px; color: #cbd5e1; }

      .m15-act-link {
        background: none;
        border: none;
        color: #38bdf8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: all 0.15s;
      }
      .m15-act-link:hover { color: #ffffff; background: rgba(56, 189, 248, 0.22); }

      /* Right Detail Panel Components */
      .m15-detail-hero {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 44, 98, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m15-detail-hero-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m15-detail-title { font-size: 14.5px; font-weight: 700; color: #ffffff; }
      .m15-detail-code { font-size: 11.5px; color: #8ab4dc; margin-top: 2px; }
      .m15-big-metric { font-size: 24px; font-weight: 800; color: #38f2ff; white-space: nowrap; }
      .m15-big-metric span { font-size: 12px; color: #cbd5e1; margin-left: 3px; font-weight: 500; }

      .m15-meta-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px 14px;
        padding: 8px 2px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m15-meta-cell label { display: block; font-size: 11px; color: #8ab4dc; margin-bottom: 2px; }
      .m15-meta-cell div { font-size: 12.5px; font-weight: 700; color: #f1f7ff; word-break: break-all; }
      .m15-meta-single {
        padding: 6px 2px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m15-meta-single label { display: block; font-size: 11px; color: #8ab4dc; margin-bottom: 2px; }
      .m15-meta-single div { font-size: 12.5px; font-weight: 700; color: #f1f7ff; }

      /* Media Thumb & Markers */
      .m15-thumb-box {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: #05132b;
        aspect-ratio: 16 / 9.4;
      }
      .m15-thumb-box img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .m15-base-detail .m15-panel-body {
        padding: 9px 14px;
        gap: 8px;
      }
      .m15-base-detail .m15-detail-hero {
        padding: 8px 12px;
      }
      .m15-base-detail .m15-meta-grid-2 {
        gap: 7px 14px;
        padding: 6px 2px;
      }
      .m15-thumb-box.m15-thumb-base {
        aspect-ratio: auto;
        height: 170px;
      }
      .m15-thumb-badge {
        position: absolute;
        top: 8px;
        right: 8px;
        padding: 2px 8px;
        border-radius: 5px;
        background: rgba(6, 22, 52, 0.85);
        border: 1px solid rgba(148, 197, 255, 0.4);
        color: #e2e8f0;
        font-size: 11px;
      }
      .m15-stake-pin {
        position: absolute;
        left: 66%;
        top: 64%;
        transform: translate(-50%, -50%);
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(8, 34, 78, 0.92);
        border: 1.5px solid #38f2ff;
        color: #ffffff;
        font-size: 11.5px;
        font-weight: 700;
        box-shadow: 0 0 14px rgba(56, 242, 255, 0.55);
      }
      .m15-preview-overlay {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(4, 15, 36, 0.08) 35%, rgba(4, 15, 36, 0.88) 100%);
        display: flex;
        flex-direction: column;
        justify-content: flex-end;
        padding: 14px;
      }
      .m15-preview-sub { font-size: 11.5px; color: #dbeafe; margin-bottom: 3px; }
      .m15-preview-title { font-size: 20px; font-weight: 800; color: #ffffff; letter-spacing: 0.6px; }

      .m15-panel-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin-top: auto;
        padding-top: 8px;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: #a9c6e8;
      }

      /* RBAC Permission Matrix */
      .m15-perm-btn {
        width: 24px;
        height: 24px;
        border-radius: 99px;
        border: 1px solid transparent;
        background: transparent;
        color: #789bc4;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .m15-perm-btn.on {
        background: rgba(34, 197, 94, 0.16);
        border-color: rgba(74, 222, 128, 0.55);
        color: #4ade80;
      }
      .m15-perm-btn:hover {
        border-color: var(--cyan-bright);
        transform: scale(1.08);
      }
      .m15-scope-cards { display: grid; grid-template-columns: repeat(2, 1fr); gap: 8px; }
      .m15-scope-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 11px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        background: rgba(11, 39, 86, 0.56);
        font-size: 12px;
        color: #94a3b8;
      }
      .m15-scope-card.granted {
        background: rgba(20, 83, 45, 0.28);
        border-color: rgba(74, 222, 128, 0.5);
        color: #e2fbe8;
      }

      /* Status Map Pills & Rules Box */
      .m15-state-pills { display: grid; grid-template-columns: repeat(3, 1fr); gap: 7px; }
      .m15-state-pill {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        padding: 6px 8px;
        border-radius: 6px;
        background: rgba(10, 34, 78, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.28);
        font-size: 11px;
        color: #e2f0ff;
      }
      .m15-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }
      .m15-dot-green { background: #4ade80; }
      .m15-dot-red { background: #fb7185; }
      .m15-dot-amber { background: #fde047; }

      .m15-rules-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(10, 34, 78, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.22);
        display: flex;
        flex-direction: column;
        gap: 8px;
        font-size: 12.5px;
        color: #dbeafe;
      }

      /* Content Preview Pills & Reorder Controls */
      .m15-preview-pills {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 6px;
      }
      .m15-preview-pill {
        height: 28px;
        padding: 0 6px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(10, 34, 78, 0.7);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m15-preview-pill.active {
        background: linear-gradient(180deg, rgba(16, 108, 210, 0.85), rgba(10, 68, 150, 0.9));
        border-color: #38f2ff;
        color: #ffffff;
        font-weight: 700;
      }
      .m15-order-cell {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .m15-move-btns {
        display: inline-flex;
        gap: 2px;
      }
      .m15-move-btn {
        width: 18px;
        height: 18px;
        border-radius: 4px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(10, 36, 82, 0.75);
        color: #93c5fd;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .m15-move-btn:hover:not(:disabled) { border-color: var(--cyan-bright); color: #ffffff; }
      .m15-move-btn:disabled { opacity: 0.3; cursor: not-allowed; }

      /* Log Device Feedback */
      .m15-feedback-triple { display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; }
      .m15-feedback-cell {
        padding: 10px 8px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.24);
        text-align: center;
      }
      .m15-feedback-cell span { display: block; font-size: 11.5px; color: #a9c6e8; margin-bottom: 4px; }
      .m15-feedback-cell strong { font-size: 20px; font-weight: 800; }

      /* Modal Form Helpers */
      .m15-form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px; }
      .m15-field { display: flex; flex-direction: column; gap: 5px; }
      .m15-field.full { grid-column: 1 / -1; }
      .m15-field label { font-size: 12px; color: #93c5fd; }
      .m15-modal-foot { display: flex; justify-content: flex-end; gap: 10px; margin-top: 6px; }
      .m15-pre {
        margin: 0;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(4, 15, 36, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.26);
        color: #bae6fd;
        font-size: 11.5px;
        font-family: Consolas, Monaco, monospace;
        max-height: 220px;
        overflow: auto;
        white-space: pre-wrap;
      }

      @media (max-width: 1260px) {
        .m15-split-main { grid-template-columns: 1fr; }
        .m15-kpi-grid-6 { grid-template-columns: repeat(3, 1fr); }
        .m15-kpi-grid-5 { grid-template-columns: repeat(3, 1fr); }
        .m15-cat-row { grid-template-columns: repeat(4, 1fr); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------------ */
  function esc(val) {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function nowShortTime() {
    return '11-26 ' + new Date().toTimeString().slice(0, 5);
  }

  function nowFullTime() {
    return '2026-11-26 ' + new Date().toTimeString().slice(0, 8);
  }

  function renderTag(status) {
    const map = {
      '启用': 'm15-tag-green',
      '正常回传': 'm15-tag-green',
      '正常更新': 'm15-tag-green',
      '已发布': 'm15-tag-green',
      '当前版本': 'm15-tag-green',
      '同步成功': 'm15-tag-green',
      '已归档': 'm15-tag-slate',
      '已确认显示': 'm15-tag-green',
      '审核通过': 'm15-tag-green',
      '已核实': 'm15-tag-green',
      '停用': 'm15-tag-slate',
      '未接入': 'm15-tag-slate',
      '待接入': 'm15-tag-slate',
      '草稿': 'm15-tag-slate',
      '无数据': 'm15-tag-amber',
      '待核对': 'm15-tag-amber',
      '待审核': 'm15-tag-amber',
      '离线': 'm15-tag-red',
      '已下发': 'm15-tag-cyan'
    };
    const cls = map[status] || 'm15-tag-cyan';
    return `<span class="m15-tag ${cls}">${esc(status)}</span>`;
  }

  /* ------------------------------------------------------------------------
     DATA STORE (Authentic Demo Dataset Across All 6 Subpages)
     ------------------------------------------------------------------------ */
  const BASE_CATEGORIES = ['项目', '工区', '参建单位', '场站', '桩号', '结构物', '构件编码', '地图与模型'];

  const store = {
    base: {
      '项目': [
        { code: 'PRJ-G1211-MB', name: 'G1211吉黑高速明水至北安段', type: '新建高速公路', section: '全线', stake: 'BK0+000~K146+800', status: '启用', updated: '11-26 08:00', unit: '吉黑高速建设指挥部（演示）', cam: 'CAM-HQ-001', mapFile: 'MB-ALL-CORRIDOR.geojson', modelFile: 'MB-ALL-OVERVIEW.ifc' }
      ],
      '工区': [
        { code: 'SEC-01', name: '一工区', type: '路基/桥梁综合', section: '一工区', stake: 'K0+000~K24+500', status: '启用', updated: '11-26 09:00', unit: '一工区施工单位（演示）', cam: 'CAM-SEC1-01', mapFile: 'MB-A1-MAP.geojson', modelFile: 'MB-A1-LINE.ifc' },
        { code: 'SEC-02', name: '二工区', type: '路基/桥梁综合', section: '二工区', stake: 'K24+500~K48+200', status: '启用', updated: '11-26 09:15', unit: '二工区施工单位（演示）', cam: 'CAM-SEC2-01', mapFile: 'MB-A2-MAP.geojson', modelFile: 'MB-A2-LINE.ifc' },
        { code: 'SEC-03', name: '三工区', type: '桥梁/预制梁场', section: '三工区', stake: 'K48+200~K72+800', status: '启用', updated: '11-26 09:20', unit: '三工区施工单位（演示）', cam: 'CAM-SEC3-01', mapFile: 'MB-A3-MAP.geojson', modelFile: 'MB-A3-LINE.ifc' },
        { code: 'SEC-04', name: '四工区', type: '路基/涵洞通道', section: '四工区', stake: 'K72+800~K96+000', status: '启用', updated: '11-25 17:40', unit: '四工区施工单位（演示）', cam: 'CAM-SEC4-01', mapFile: 'MB-A4-MAP.geojson', modelFile: 'MB-A4-LINE.ifc' },
        { code: 'SEC-05', name: '五工区', type: '路面/试验检测', section: '五工区', stake: 'K96+000~K121+400', status: '启用', updated: '11-25 16:50', unit: '五工区施工单位（演示）', cam: 'CAM-SEC5-01', mapFile: 'MB-A5-MAP.geojson', modelFile: 'MB-A5-LINE.ifc' },
        { code: 'SEC-06', name: '六工区', type: '互通枢纽/房建', section: '六工区', stake: 'K121+400~K146+800', status: '启用', updated: '11-25 15:10', unit: '六工区施工单位（演示）', cam: 'CAM-SEC6-01', mapFile: 'MB-A6-MAP.geojson', modelFile: 'MB-A6-LINE.ifc' }
      ],
      '参建单位': [
        { code: 'ORG-JS-01', name: '明北项目建设指挥部', type: '建设单位', section: '全线', stake: 'K0+000~K146+800', status: '启用', updated: '11-26 08:30', unit: '建设管理方', cam: 'CAM-HQ-001' },
        { code: 'ORG-SG-01', name: '一工区施工单位（演示）', type: '施工总包', section: '一工区', stake: 'K0+000~K24+500', status: '启用', updated: '11-26 09:05', unit: '一工区项目部', cam: 'CAM-A1-MX01' },
        { code: 'ORG-SG-02', name: '二工区施工单位（演示）', type: '施工总包', section: '二工区', stake: 'K24+500~K48+200', status: '启用', updated: '11-26 09:40', unit: '二工区项目部', cam: 'CAM-YD-A01' },
        { code: 'ORG-SG-03', name: '三工区施工单位（演示）', type: '施工总包', section: '三工区', stake: 'K48+200~K72+800', status: '启用', updated: '11-25 16:20', unit: '三工区项目部', cam: 'CAM-A3-BM01' },
        { code: 'ORG-SG-04', name: '四工区施工单位（演示）', type: '施工总包', section: '四工区', stake: 'K72+800~K96+000', status: '启用', updated: '11-25 15:15', unit: '四工区项目部', cam: 'CAM-A4-YD02' },
        { code: 'ORG-SG-05', name: '五工区施工单位（演示）', type: '施工总包', section: '五工区', stake: 'K96+000~K121+400', status: '启用', updated: '11-25 11:05', unit: '五工区项目部', cam: 'CAM-A5-LAB01' },
        { code: 'ORG-SG-06', name: '六工区施工单位（演示）', type: '施工总包', section: '六工区', stake: 'K121+400~K146+800', status: '启用', updated: '11-24 17:30', unit: '六工区项目部', cam: 'CAM-A6-YD03' },
        { code: 'ORG-JL-01', name: '北安片区总监理办', type: '监理单位', section: '一工区', stake: 'K0+000~K72+800', status: '启用', updated: '11-25 14:00', unit: '一驻地办', cam: 'CAM-JL-01' },
        { code: 'ORG-JL-02', name: '明水片区驻地监理办', type: '监理单位', section: '四工区', stake: 'K72+800~K146+800', status: '启用', updated: '11-25 14:00', unit: '二驻地办', cam: 'CAM-JL-02' },
        { code: 'ORG-SJ-01', name: '寒区公路设计院（演示）', type: '勘察设计', section: '全线', stake: 'K0+000~K146+800', status: '启用', updated: '11-24 11:20', unit: '设计代表处', cam: 'CAM-HQ-002' },
        { code: 'ORG-JC-01', name: '第三方中心试验室', type: '试验检测', section: '五工区', stake: 'K96+000~K121+400', status: '启用', updated: '11-24 10:15', unit: '中心试验室', cam: 'CAM-A5-LAB01' },
        { code: 'ORG-JA-01', name: '生态与黑土监测顾问组', type: '环水保监测', section: '全线', stake: 'K0+000~K146+800', status: '启用', updated: '11-23 16:00', unit: '环保专班', cam: 'CAM-ENV-01' }
      ],
      '场站': [
        { code: 'MB-A2-YD-01', name: '料场示例A', type: '料场', section: '二工区', stake: 'K28+400', status: '启用', updated: '11-26 09:40', unit: '二工区施工单位（演示）', cam: 'CAM-YD-A01', mapFile: 'MB-A2-MAP.geojson', modelFile: 'MB-A2-YD-01.ifc', mapLabel: '二工区工程底图', modelLabel: '二工区场站模型' },
        { code: 'MB-A1-MX-01', name: '拌合站示例A', type: '拌合站', section: '一工区', stake: 'K14+600', status: '启用', updated: '11-26 09:30', unit: '一工区施工单位（演示）', cam: 'CAM-MX-A01', mapFile: 'MB-A1-MAP.geojson', modelFile: 'MB-A1-MX-01.ifc', mapLabel: '一工区工程底图', modelLabel: '一工区拌合站模型' },
        { code: 'MB-A3-BM-01', name: '梁场示例A', type: '梁场', section: '三工区', stake: 'K42+150', status: '启用', updated: '11-25 16:20', unit: '三工区施工单位（演示）', cam: 'CAM-BM-A01', mapFile: 'MB-A3-MAP.geojson', modelFile: 'MB-A3-BM-01.ifc', mapLabel: '三工区工程底图', modelLabel: '三工区梁场模型' },
        { code: 'MB-A4-YD-02', name: '料场示例B', type: '料场', section: '四工区', stake: 'K56+200', status: '启用', updated: '11-25 15:15', unit: '四工区施工单位（演示）', cam: 'CAM-YD-B02', mapFile: 'MB-A4-MAP.geojson', modelFile: 'MB-A4-YD-02.ifc', mapLabel: '四工区工程底图', modelLabel: '四工区场站模型' },
        { code: 'MB-A5-LAB-01', name: '实验室A', type: '实验室', section: '五工区', stake: 'K69+320', status: '启用', updated: '11-25 11:05', unit: '五工区施工单位（演示）', cam: 'CAM-LAB-A01', mapFile: 'MB-A5-MAP.geojson', modelFile: 'MB-A5-LAB-01.ifc', mapLabel: '五工区工程底图', modelLabel: '五工区试验室模型' },
        { code: 'MB-A6-YD-03', name: '材料场示例C', type: '材料场', section: '六工区', stake: 'K81+670', status: '停用', updated: '11-24 17:30', unit: '六工区施工单位（演示）', cam: 'CAM-YD-C03', mapFile: 'MB-A6-MAP.geojson', modelFile: 'MB-A6-YD-03.ifc', mapLabel: '六工区工程底图', modelLabel: '六工区材料场模型' },
        { code: 'MB-A1-BM-02', name: '预制梁场B', type: '梁场', section: '一工区', stake: 'K18+900', status: '启用', updated: '11-24 15:10', unit: '一工区施工单位（演示）', cam: 'CAM-BM-B02' },
        { code: 'MB-A2-MX-02', name: '水稳拌合站A', type: '拌合站', section: '二工区', stake: 'K36+100', status: '启用', updated: '11-24 14:25', unit: '二工区施工单位（演示）', cam: 'CAM-MX-B02' },
        { code: 'MB-A3-RE-01', name: '钢筋加工厂A', type: '钢筋场', section: '三工区', stake: 'K51+480', status: '启用', updated: '11-24 11:40', unit: '三工区施工单位（演示）', cam: 'CAM-RE-A01' },
        { code: 'MB-A4-MX-03', name: '沥青拌合站B', type: '拌合站', section: '四工区', stake: 'K78+350', status: '启用', updated: '11-23 18:10', unit: '四工区施工单位（演示）', cam: 'CAM-MX-C03' },
        { code: 'MB-A5-YD-04', name: '碎石料场D', type: '料场', section: '五工区', stake: 'K103+800', status: '启用', updated: '11-23 16:40', unit: '五工区施工单位（演示）', cam: 'CAM-YD-D04' },
        { code: 'MB-A6-BM-03', name: '小型构件预制场', type: '梁场', section: '六工区', stake: 'K129+500', status: '启用', updated: '11-23 14:20', unit: '六工区施工单位（演示）', cam: 'CAM-BM-C03' },
        { code: 'MB-A2-LAB-02', name: '工地分室试验室', type: '实验室', section: '二工区', stake: 'K31+050', status: '启用', updated: '11-22 15:00', unit: '二工区施工单位（演示）', cam: 'CAM-LAB-B02' },
        { code: 'MB-A3-YD-05', name: '冬施保温料仓', type: '材料场', section: '三工区', stake: 'K62+900', status: '启用', updated: '11-22 10:30', unit: '三工区施工单位（演示）', cam: 'CAM-YD-E05' }
      ],
      '桩号': [
        { code: 'STK-BK000', name: '明水起点桩号', type: '起点控制桩', section: '一工区', stake: 'BK0+000', status: '启用', updated: '11-26 08:10', unit: '一工区施工单位（演示）', cam: 'CAM-STK-01' },
        { code: 'STK-K14600', name: '一工区拌合站道口', type: '场站控制桩', section: '一工区', stake: 'K14+600', status: '启用', updated: '11-26 09:30', unit: '一工区施工单位（演示）', cam: 'CAM-MX-A01' },
        { code: 'STK-K28400', name: '二工区料场道口', type: '场站控制桩', section: '二工区', stake: 'K28+400', status: '启用', updated: '11-26 09:40', unit: '二工区施工单位（演示）', cam: 'CAM-YD-A01' },
        { code: 'STK-K34280', name: '呼兰河特大桥中心', type: '桥梁控制桩', section: '二工区', stake: 'K34+280', status: '启用', updated: '11-25 17:10', unit: '二工区施工单位（演示）', cam: 'CAM-BR-A01' },
        { code: 'STK-K42150', name: '三工区梁场节点', type: '场站控制桩', section: '三工区', stake: 'K42+150', status: '启用', updated: '11-25 16:20', unit: '三工区施工单位（演示）', cam: 'CAM-BM-A01' },
        { code: 'STK-K72800', name: '三四工区分界桩', type: '标段分界桩', section: '三工区', stake: 'K72+800', status: '启用', updated: '11-24 14:00', unit: '三工区施工单位（演示）', cam: 'CAM-STK-06' },
        { code: 'STK-K96000', name: '黑土区边界监测桩', type: '环保监测桩', section: '四工区', stake: 'K96+000', status: '启用', updated: '11-24 11:30', unit: '四工区施工单位（演示）', cam: 'CAM-ENV-02' },
        { code: 'STK-K146800', name: '建华枢纽互通终点', type: '终点控制桩', section: '六工区', stake: 'K146+800', status: '启用', updated: '11-23 16:45', unit: '六工区施工单位（演示）', cam: 'CAM-HUB-01' }
      ],
      '结构物': [
        { code: 'STR-BR-001', name: '呼兰河特大桥', type: '特大桥', section: '二工区', stake: 'K34+280', status: '启用', updated: '11-26 09:20', unit: '二工区施工单位（演示）', cam: 'CAM-BR-A01' },
        { code: 'STR-BR-002', name: '通肯河中桥', type: '中桥', section: '一工区', stake: 'K16+450', status: '启用', updated: '11-25 16:30', unit: '一工区施工单位（演示）', cam: 'CAM-BR-002' },
        { code: 'STR-IC-001', name: '明水北互通立交', type: '互通立交', section: '一工区', stake: 'K08+120', status: '启用', updated: '11-25 15:10', unit: '一工区施工单位（演示）', cam: 'CAM-IC-001' },
        { code: 'STR-BR-003', name: '海伦东分离立交桥', type: '大桥', section: '三工区', stake: 'K54+600', status: '启用', updated: '11-25 14:20', unit: '三工区施工单位（演示）', cam: 'CAM-BR-003' },
        { code: 'STR-CV-004', name: '农田灌溉通道箱涵', type: '箱涵', section: '四工区', stake: 'K84+210', status: '启用', updated: '11-24 17:15', unit: '四工区施工单位（演示）', cam: 'CAM-CV-004' },
        { code: 'STR-BR-005', name: '乌裕尔河大桥', type: '大桥', section: '五工区', stake: 'K108+400', status: '启用', updated: '11-24 11:50', unit: '五工区施工单位（演示）', cam: 'CAM-BR-005' },
        { code: 'STR-IC-002', name: '建华枢纽互通', type: '枢纽互通', section: '六工区', stake: 'K144+900', status: '启用', updated: '11-23 16:00', unit: '六工区施工单位（演示）', cam: 'CAM-HUB-01' }
      ],
      '构件编码': [
        { code: 'CMP-BR01-P08', name: '呼兰河特大桥8号主墩', type: '桥墩柱', section: '二工区', stake: 'K34+240', status: '启用', updated: '11-26 09:35', unit: '二工区施工单位（演示）', cam: 'CAM-BR-A01' },
        { code: 'CMP-BR01-BX12', name: '30m预应力小箱梁#12', type: '预制箱梁', section: '三工区', stake: 'K42+150', status: '启用', updated: '11-25 16:15', unit: '三工区施工单位（演示）', cam: 'CAM-BM-A01' },
        { code: 'CMP-BR01-CAP09', name: '9号墩盖梁结构', type: '盖梁', section: '二工区', stake: 'K34+270', status: '启用', updated: '11-25 14:40', unit: '二工区施工单位（演示）', cam: 'CAM-BR-A01' },
        { code: 'CMP-CV04-WALL1', name: '箱涵左侧八字墙', type: '涵洞构件', section: '四工区', stake: 'K84+210', status: '启用', updated: '11-24 15:20', unit: '四工区施工单位（演示）', cam: 'CAM-CV-004' },
        { code: 'CMP-IC02-RMP01', name: 'A匝道现浇箱梁首联', type: '现浇梁', section: '六工区', stake: 'K145+020', status: '启用', updated: '11-24 10:10', unit: '六工区施工单位（演示）', cam: 'CAM-HUB-01' },
        { code: 'CMP-RD05-SUB03', name: '五工区K102底基层试验段', type: '路面结构层', section: '五工区', stake: 'K102+000', status: '停用', updated: '11-22 18:00', unit: '五工区施工单位（演示）', cam: 'CAM-RD-05' }
      ],
      '地图与模型': [
        { code: 'GIS-A2-MAP', name: '二工区工程底图', type: 'GeoJSON矢量', section: '二工区', stake: 'K24+500~K48+200', status: '启用', updated: '11-26 09:40', unit: 'GIS数据中心', cam: 'CAM-YD-A01', mapFile: 'MB-A2-MAP.geojson', modelFile: 'MB-A2-YD-01.ifc' },
        { code: 'BIM-A2-YD01', name: '二工区场站模型', type: 'IFC建筑模型', section: '二工区', stake: 'K28+400', status: '启用', updated: '11-26 09:40', unit: 'BIM应用中心', cam: 'CAM-YD-A01', mapFile: 'MB-A2-MAP.geojson', modelFile: 'MB-A2-YD-01.ifc' },
        { code: 'GIS-ALL-LINE', name: '全线红线与桩号矢量图', type: 'GeoJSON矢量', section: '全线', stake: 'BK0+000~K146+800', status: '启用', updated: '11-25 18:00', unit: 'GIS数据中心', cam: 'CAM-HQ-001' },
        { code: 'BIM-BR-001', name: '呼兰河特大桥LOD400模型', type: 'IFC桥梁模型', section: '二工区', stake: 'K34+280', status: '启用', updated: '11-25 16:10', unit: 'BIM应用中心', cam: 'CAM-BR-A01' },
        { code: 'GIS-BLK-SOIL', name: '沿线黑土地保护区矢量', type: 'GeoJSON矢量', section: '四工区', stake: 'K72+800~K112+000', status: '启用', updated: '11-25 11:30', unit: '环保监测专班', cam: 'CAM-ENV-02' },
        { code: 'DOM-UAV-1126', name: '二工区正射影像DOM', type: 'GeoTIFF影像', section: '二工区', stake: 'K24+500~K48+200', status: '启用', updated: '11-24 17:00', unit: '无人机航测组', cam: 'CAM-UAV-02' },
        { code: 'BIM-A3-BM01', name: '三工区智慧梁场模型', type: 'IFC场站模型', section: '三工区', stake: 'K42+150', status: '启用', updated: '11-23 15:40', unit: 'BIM应用中心', cam: 'CAM-BM-A01' },
        { code: 'BIM-IC-002', name: '建华枢纽互通立交模型', type: 'IFC立交模型', section: '六工区', stake: 'K144+900', status: '启用', updated: '11-22 14:20', unit: 'BIM应用中心', cam: 'CAM-HUB-01' }
      ]
    },
    baseStructureCount: 26,
    baseMapModelCount: 8,

    rbac: {
      permCols: ['管理查看', '业务办理', '系统配置', '展厅展示', '设备控制'],
      roles: [
        {
          id: 'role_view',
          name: '管理查看',
          scope: '本项目',
          accountCount: 5,
          status: '启用',
          version: '标准权限版 V1.2',
          accessContent: '全线总览、进度、质量、安全统计报表',
          perms: { '管理查看': true, '业务办理': false, '系统配置': false, '展厅展示': false, '设备控制': false },
          accounts: [
            { id: 'GL-001', name: '指挥部总工账号', status: '启用' },
            { id: 'GL-002', name: '项目办综合查看', status: '启用' },
            { id: 'GL-003', name: '监理总监巡查端', status: '启用' }
          ]
        },
        {
          id: 'role_biz',
          name: '业务办理',
          scope: '所属工区',
          accountCount: 6,
          status: '启用',
          version: '工区协作版 V1.2',
          accessContent: '隐患整改、工序报验、计量申报与巡检上报',
          perms: { '管理查看': true, '业务办理': true, '系统配置': false, '展厅展示': false, '设备控制': false },
          accounts: [
            { id: 'YW-001', name: '一工区工程部长', status: '启用' },
            { id: 'YW-002', name: '二工区安全主管', status: '启用' },
            { id: 'YW-003', name: '三工区资料员B', status: '启用' }
          ]
        },
        {
          id: 'role_admin',
          name: '系统管理员',
          scope: '项目管理后台',
          accountCount: 2,
          status: '启用',
          version: '管理后台 V1.2',
          accessContent: '基础资料、用户权限、系统接入、口径与配置',
          perms: { '管理查看': true, '业务办理': false, '系统配置': true, '展厅展示': false, '设备控制': false },
          accounts: [
            { id: 'ADM-001', name: '管理员A（演示）', status: '启用' },
            { id: 'ADM-002', name: '运维管理员B', status: '启用' }
          ]
        },
        {
          id: 'role_expo',
          name: '展厅展示',
          scope: '已发布汇报版',
          accountCount: 3,
          status: '启用',
          version: '展厅汇报版 V1.2',
          accessContent: '项目介绍、宣传片、图片及专题',
          perms: { '管理查看': false, '业务办理': false, '系统配置': false, '展厅展示': true, '设备控制': false },
          accounts: [
            { id: 'ZT-001', name: '展厅大屏', status: '启用' },
            { id: 'ZT-002', name: '展厅讲解终端', status: '启用' },
            { id: 'ZT-003', name: '参观接待终端', status: '启用' }
          ]
        },
        {
          id: 'role_dev',
          name: '设备控制员',
          scope: '授权设备组',
          accountCount: 2,
          status: '启用',
          version: '设备下发版 V1.1',
          accessContent: '情报板内容发布、摄像头云台与联动策略',
          perms: { '管理查看': true, '业务办理': false, '系统配置': false, '展厅展示': false, '设备控制': true },
          accounts: [
            { id: 'DEV-001', name: '设备操作员A', status: '启用' },
            { id: 'DEV-002', name: '设备操作员B', status: '启用' }
          ]
        }
      ],
      grants: [
        { time: '11-26 10:27', role: '设备控制员', account: '设备操作员B', scope: '一工区施工保通组', grantor: '授权员C' },
        { time: '11-25 16:20', role: '展厅展示', account: 'ZT-001', scope: '已发布展厅汇报版', grantor: '管理员A' },
        { time: '11-25 11:05', role: '业务办理', account: 'YW-002', scope: '二工区业务办理权限', grantor: '管理员A' }
      ]
    },

    integration: {
      systems: [
        {
          code: 'SYS-VIDEO-01',
          name: '视频监控系统',
          scope: '设备目录、状态、录像索引',
          detailScope: '摄像头设备目录、状态、录像索引',
          freq: '每分钟',
          lastResp: '10:45',
          lastRespFull: '2026-11-26 10:45',
          status: '正常回传',
          endpoint: 'https://video.example.invalid/portal',
          latencyMs: 38,
          mappings: [
            { src: 'device_id', target: '设备编号', usage: '标识点位' },
            { src: 'work_area_code', target: '工区编码', usage: '关联工区' },
            { src: 'device_status', target: '设备状态', usage: '状态展示' },
            { src: 'status_time', target: '状态时间', usage: '确定状态时点' }
          ],
          statusMap: [
            { label: 'ONLINE 在线', tone: 'green' },
            { label: 'OFFLINE 离线', tone: 'red' },
            { label: 'IMAGE_ERROR 图像异常', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-LAB-01',
          name: '实验室系统',
          scope: '检测记录与结果',
          detailScope: '混凝土抗压、钢筋力学试验报告与合格率',
          freq: '30分钟',
          lastResp: '10:30',
          lastRespFull: '2026-11-26 10:30',
          status: '正常回传',
          endpoint: 'https://lab.example.invalid/api/v2/tests',
          latencyMs: 64,
          mappings: [
            { src: 'sample_no', target: '试件编号', usage: '试验追溯' },
            { src: 'section_id', target: '工区编码', usage: '关联工区' },
            { src: 'test_result', target: '评定结论', usage: '质量统计' },
            { src: 'report_time', target: '报告时间', usage: '更新时点' }
          ],
          statusMap: [
            { label: 'PASS 合格', tone: 'green' },
            { label: 'FAIL 不合格', tone: 'red' },
            { label: 'PENDING 待复核', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-MIX-01',
          name: '拌合站系统',
          scope: '配合比、产量与生产记录',
          detailScope: '盘次生产量、骨料偏差与超标预警',
          freq: '5分钟',
          lastResp: '10:40',
          lastRespFull: '2026-11-26 10:40',
          status: '正常回传',
          endpoint: 'https://mix.example.invalid/sync/batches',
          latencyMs: 52,
          mappings: [
            { src: 'station_code', target: '场站编码', usage: '定位拌合站' },
            { src: 'formula_id', target: '配合比编号', usage: '核算配比' },
            { src: 'output_vol', target: '单盘方量', usage: '产量统计' },
            { src: 'batch_time', target: '生产时间', usage: '周期汇总' }
          ],
          statusMap: [
            { label: 'RUN 生产中', tone: 'green' },
            { label: 'STOP 停机', tone: 'red' },
            { label: 'WARN 配比预警', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-UAV-01',
          name: '无人机巡检系统',
          scope: '飞行记录、巡检影像',
          detailScope: '航线任务、高清照片与正射DOM成果索引',
          freq: '5分钟',
          lastResp: '10:40',
          lastRespFull: '2026-11-26 10:40',
          status: '正常回传',
          endpoint: 'https://uav.example.invalid/flights/feed',
          latencyMs: 71,
          mappings: [
            { src: 'flight_id', target: '架次编号', usage: '航迹追踪' },
            { src: 'work_area_code', target: '工区编码', usage: '归属分区' },
            { src: 'media_url', target: '影像索引', usage: '图像调阅' },
            { src: 'fly_time', target: '巡检时间', usage: '台账归档' }
          ],
          statusMap: [
            { label: 'SYNCED 已入库', tone: 'green' },
            { label: 'OFFLINE 机库离线', tone: 'red' },
            { label: 'PROCESSING 拼接中', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-MEASURE-01',
          name: '计量支付系统',
          scope: '计量记录、可获取支付状态',
          detailScope: '期次工程量清单、审批进度与支付回执',
          freq: '—',
          lastResp: '—',
          lastRespFull: '尚未完成首次同步',
          status: '未接入',
          endpoint: 'https://measure.example.invalid/pending',
          latencyMs: null,
          mappings: [
            { src: 'bill_no', target: '计量期号', usage: '期次关联' },
            { src: 'section_id', target: '工区编码', usage: '合同拆分' },
            { src: 'amount_wan', target: '计量金额', usage: '投资统计' },
            { src: 'pay_state', target: '支付状态', usage: '台账展示' }
          ],
          statusMap: [
            { label: 'PAID 已支付', tone: 'green' },
            { label: 'UNCONFIG 未开通', tone: 'red' },
            { label: 'AUDITING 审核中', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-EQP-01',
          name: '机械检验系统',
          scope: '检验与维保记录',
          detailScope: '特种设备年检证书、司机持证与维保工单',
          freq: '30分钟',
          lastResp: '10:30',
          lastRespFull: '2026-11-26 10:30（空数据包）',
          status: '无数据',
          endpoint: 'https://eqp.example.invalid/inspect/records',
          latencyMs: 95,
          mappings: [
            { src: 'eqp_code', target: '机械编码', usage: '设备识别' },
            { src: 'work_area_code', target: '工区编码', usage: '关联工区' },
            { src: 'inspect_state', target: '检验状态', usage: '合规判定' },
            { src: 'check_date', target: '检验日期', usage: '预警到期' }
          ],
          statusMap: [
            { label: 'VALID 有效', tone: 'green' },
            { label: 'EXPIRED 逾期', tone: 'red' },
            { label: 'EMPTY 本期空值', tone: 'amber' }
          ]
        },
        {
          code: 'SYS-PAVE-01',
          name: '摊铺碾压系统',
          scope: '摊铺位置、碾压记录',
          detailScope: '沥青/水稳摊铺温度、遍数轨迹与压实度',
          freq: '5分钟',
          lastResp: '09:55',
          lastRespFull: '2026-11-26 09:55（连接超时）',
          status: '离线',
          endpoint: 'https://pave.example.invalid/telemetry',
          latencyMs: null,
          mappings: [
            { src: 'roller_id', target: '压路机编号', usage: '定位车辆' },
            { src: 'stake_no', target: '施工桩号', usage: '里程定位' },
            { src: 'pass_count', target: '碾压遍数', usage: '质量控制' },
            { src: 'gps_time', target: '采集时间', usage: '轨迹回放' }
          ],
          statusMap: [
            { label: 'WORKING 作业中', tone: 'green' },
            { label: 'TIMEOUT 网关离线', tone: 'red' },
            { label: 'WEAK 信号弱', tone: 'amber' }
          ]
        }
      ]
    },

    metrics: {
      items: [
        {
          code: 'IDX-VIDEO-001',
          name: '正常在线摄像头数',
          module: '视频监控',
          period: '11-26 10:45',
          periodFull: '2026-11-26 10:45',
          unit: '路',
          value: '43',
          sourceSystem: '视频监控系统',
          status: '正常更新',
          fields: 'device_id • device_status • status_time',
          version: 'V1.1',
          rules: [
            '1. 取截止时点前回传的有效设备状态。',
            '2. 按项目及设备编号去重，每台保留最近一条状态。',
            '3. 仅统计状态为 ONLINE 的摄像头。'
          ],
          anomalies: [
            { time: '11-26 10:42', source: 'SYS-VIDEO-01', type: '设备状态重复', handling: '按设备编号去重' },
            { time: '11-26 10:38', source: 'SYS-VIDEO-01', type: '状态时间缺失', handling: '待核对 · 暂缓纳入' }
          ],
          history: [
            { ver: 'V1.1', date: '2026-11-20', author: '管理员A', note: '新增按设备编号去重规则，过滤 IMAGE_ERROR 异常画面' },
            { ver: 'V1.0', date: '2026-11-01', author: '管理员A', note: '初始上线：统计全线回传 ONLINE 状态摄像头总路数' }
          ]
        },
        {
          code: 'IDX-SAFE-002',
          name: '已确认隐患数',
          module: '安全管理',
          period: '2026年11月',
          periodFull: '2026年11月（累计）',
          unit: '项',
          value: '19',
          sourceSystem: '安全隐患台账',
          status: '正常更新',
          fields: 'hazard_id • confirm_flag • section_id',
          version: 'V1.0',
          rules: [
            '1. 仅纳入经安全员与监理双重确认的有效隐患工单。',
            '2. 剔除重复上报及测试演示单据。',
            '3. 按工区和整改状态实时汇总。'
          ],
          anomalies: [
            { time: '11-26 09:15', source: 'M04-SAFE', type: '重复拍照工单', handling: '关联主隐患单合并' }
          ],
          history: [
            { ver: 'V1.0', date: '2026-11-05', author: '安全主管', note: '明确监理确认环节作为统计准入条件' }
          ]
        },
        {
          code: 'IDX-MEAS-001',
          name: '本期计量金额',
          module: '计量管理',
          period: '2026年11月',
          periodFull: '2026年11月第08期',
          unit: '万元',
          value: '4,820',
          sourceSystem: '计量支付系统',
          status: '待接入',
          fields: 'bill_no • amount_wan • pay_state',
          version: 'V1.0',
          rules: [
            '1. 以财务审批通过且签章完成的计量期次为准。',
            '2. 扣回预付款及保留金前展示合同清单产值。',
            '3. 接口开通前沿用人工导入台账口径。'
          ],
          anomalies: [
            { time: '11-26 08:30', source: 'SYS-MEASURE-01', type: '系统尚未接入', handling: '暂采用离线导入台账' }
          ],
          history: [
            { ver: 'V1.0', date: '2026-11-02', author: '计量工程师', note: '预设计量支付接口字段映射口径' }
          ]
        },
        {
          code: 'IDX-QUAL-001',
          name: '工区合格率',
          module: '质量管理',
          period: '2026年11月',
          periodFull: '2026年11月抽检周期',
          unit: '%',
          value: '98.6',
          sourceSystem: '实验室系统',
          status: '待核对',
          fields: 'sample_no • test_result • section_id',
          version: 'V1.2',
          rules: [
            '1. 分母为当月已完成评定的有效抽检总批次。',
            '2. 分子为初检合格与复检合格批次数之和。',
            '3. 存在待复核试验报告时标为待核对状态。'
          ],
          anomalies: [
            { time: '11-26 10:12', source: 'SYS-LAB-01', type: '三工区2份报告待复核', handling: '已通知中心试验室核对' }
          ],
          history: [
            { ver: 'V1.2', date: '2026-11-24', author: '质量总监', note: '明确复检合格样本的统计归属周期' },
            { ver: 'V1.0', date: '2026-11-01', author: '管理员A', note: '初始发布合格率计算公式' }
          ]
        },
        {
          code: 'IDX-QUAL-002',
          name: '梁片生产数量',
          module: '质量管理',
          period: '2026年11月',
          periodFull: '2026年11月累计',
          unit: '片',
          value: '142',
          sourceSystem: '智慧梁场台账',
          status: '正常更新',
          fields: 'beam_code • cast_date • pass_flag',
          version: 'V1.0',
          rules: [
            '1. 仅统计已完成张拉压浆并验收合格的预制梁片。',
            '2. 按唯一构件编码去重统计。',
            '3. 每日18:00自动汇总至全线进度看板。'
          ],
          anomalies: [
            { time: '11-25 18:00', source: 'M03-QUAL', type: '数据校验正常', handling: '自动入库 142 片' }
          ],
          history: [
            { ver: 'V1.0', date: '2026-11-01', author: '管理员A', note: '确定预制梁片以压浆验收为完成标志' }
          ]
        },
        {
          code: 'IDX-QUAL-003',
          name: '拌合站产量',
          module: '质量管理',
          period: '2026年11月',
          periodFull: '2026年11月累计',
          unit: 'm³',
          value: '28,640',
          sourceSystem: '拌合站系统',
          status: '正常更新',
          fields: 'station_code • output_vol • batch_time',
          version: 'V1.1',
          rules: [
            '1. 汇总全线6座拌合站每5分钟回传的单盘生产方量。',
            '2. 剔除空盘清洗及标定测试方量。',
            '3. 按工区与混凝土标号维度支持下钻查询。'
          ],
          anomalies: [
            { time: '11-26 09:40', source: 'SYS-MIX-01', type: '标定测试盘过滤', handling: '已自动剔除 2.5 m³ 测试数据' }
          ],
          history: [
            { ver: 'V1.1', date: '2026-11-18', author: '管理员A', note: '新增标定盘自动剔除过滤规则' }
          ]
        }
      ]
    },

    content: {
      activeVersion: '展厅汇报版 V1.2',
      versions: [
        { version: '展厅汇报版 V1.2', status: '当前版本', publishTime: '2026-11-25 16:30', operator: '管理员A', defaultView: '二工区场站俯视', role: '展厅展示角色' },
        { version: '展厅汇报版 V1.1', status: '已归档', publishTime: '2026-11-20 15:20', operator: '管理员A', defaultView: '全线宏观走廊俯视', role: '展厅展示角色' }
      ],
      itemsByVersion: {
        '展厅汇报版 V1.2': [
          { id: 'CNT-01', name: '项目介绍', type: '图文', material: '项目概况 · 封面图', status: '已发布', img: IMG.showcase, overlaySub: '工程建设项目综合管理平台', overlayTitle: '吉黑高速明水至北安段', summary: '展示G1211明水至北安段146.8公里建设规模、技术标准与寒区高速公路示范亮点。' },
          { id: 'CNT-02', name: '建设进展', type: '图片', material: '沿线施工图集 · 6 张', status: '已发布', img: IMG.after, overlaySub: '2026年11月建设形象进度', overlayTitle: '六大工区同步推进建设', summary: '精选6张沿线桥梁下部结构、智慧梁场与路基成型实景图集。' },
          { id: 'CNT-03', name: '项目宣传片', type: '视频', material: '明北段建设宣传片.mp4', status: '已发布', img: IMG.corridor, overlaySub: '4K数字孪生汇报影片 · 04:28', overlayTitle: '数智赋能 · 匠心筑路', summary: '涵盖路线走廊航拍、BIM应用、黑土地保护与智慧工地全流程成果演示。' },
          { id: 'CNT-04', name: '平安工地', type: '专题', material: '专题入口 · 项目展示', status: '已发布', img: IMG.before, overlaySub: '安全生产标准化专题成果', overlayTitle: '平安百年品质工程示范', summary: '直连平安工地专题页，集中汇报风险分级管控与AI视频预警成效。' },
          { id: 'CNT-05', name: '沿线全景', type: '地图视角', material: '路线全景 / 二工区场站', status: '已发布', img: IMG.corridor, overlaySub: '三维数字孪生漫游视角', overlayTitle: '二工区场站与特大桥全景', summary: '联动Cesium三维实景底图，支持一键切换全线总览与重点场站视角。' }
        ],
        '展厅汇报版 V1.1': [
          { id: 'CNT-V1-01', name: '项目介绍', type: '图文', material: '初版概况 · 线路图', status: '已归档', img: IMG.corridor, overlaySub: '工程建设项目综合管理平台 V1.1', overlayTitle: '吉黑高速明水至北安段', summary: '第一阶段汇报版项目基础情况介绍。' },
          { id: 'CNT-V1-02', name: '建设进展', type: '图片', material: '秋季施工图集 · 4 张', status: '已归档', img: IMG.before, overlaySub: '秋季集中施工阶段实景', overlayTitle: '路基与桥梁基础施工', summary: '归档版施工形象进展图片集。' },
          { id: 'CNT-V1-03', name: '沿线全景', type: '地图视角', material: '全线宏观走廊俯视', status: '已归档', img: IMG.showcase, overlaySub: '宏观三维路线走廊', overlayTitle: '明水至北安段全线视角', summary: '归档版默认三维视角配置。' }
        ]
      }
    },

    logs: []
  };

  // Build 36 authentic log records matching the exact type counts (12 接口同步 + 5 导入审核 + 8 问题办理 + 4 设备指令 + 7 资料归档 = 36)
  (function initLogs() {
    const top8 = [
      { time: '10:45:00', date: '2026-11-26', id: 'LOG-20261126-036', type: '接口同步', content: '同步48路摄像头状态', actor: '视频监控系统', source: '视频监控系统', result: '同步成功', module: '视频监控', grantor: '系统自动调度', refDoc: 'SYNC-VIDEO-20261126-036', version: 'SYS-VIDEO-01 V2.0', target: '全线视频点位 · 48 路', note: '在线43路、离线3路、图像异常2路' },
      { time: '10:42:00', date: '2026-11-26', id: 'LOG-20261126-035', type: '资料归档', content: '归档 RPT-20261126-03', actor: '巡检员A', source: '无人机巡检系统', result: '已归档', module: '无人机巡检', grantor: '资料主管B', refDoc: 'RPT-20261126-03', version: '航测成果 V1.0', target: '二工区 K24+500~K48+200', note: '正射影像与巡检简报已写入档案库' },
      { time: '10:31:08', date: '2026-11-26', id: 'LOG-20261126-034', type: '设备指令', content: 'VMS-BT-A01 现场显示确认', actor: '巡查员D', source: '信息发布', result: '已确认显示', module: '信息发布', grantor: '授权员C', refDoc: 'FB-20261126-007', version: 'MB-202611-003 V1.2', target: '一工区施工保通组 · VMS-BT-A01', feedback: { sent: 3, received: 3, confirmed: 2 }, feedbackTime: '10:31:08', note: '巡查员D上传现场回执照片并确认显示完整' },
      { time: '10:30:00', date: '2026-11-26', id: 'LOG-20261126-033', type: '设备指令', content: 'FB-20261126-007 下发', actor: '发布员A', source: '信息发布', result: '已下发', module: '信息发布', grantor: '授权员C', refDoc: 'FB-20261126-007', version: 'MB-202611-003 V1.2', target: '一工区施工保通组 · 3 块', feedback: { sent: 3, received: 2, confirmed: 1 }, feedbackTime: '10:31:08', note: '巡查员D已确认 VMS-BT-A01 现场显示' },
      { time: '10:20:00', date: '2026-11-26', id: 'LOG-20261126-032', type: '导入审核', content: '工区编码表 V1.1', actor: '资料员B', source: '资料管理', result: '审核通过', module: '系统管理', grantor: '管理员A', refDoc: 'IMP-20261126-012', version: 'CODE-SEC V1.1', target: '全线六大工区基础台账', note: '校验6个工区、14座场站编码无冲突' },
      { time: '10:18:00', date: '2026-11-26', id: 'LOG-20261126-031', type: '问题办理', content: '核实 AQ-202611-041', actor: '安全员C', source: '安全管理', result: '已核实', module: '安全管理', grantor: '安全总监', refDoc: 'AQ-202611-041', version: '整改单 V1.0', target: '二工区呼兰河特大桥临边防护', note: '现场已完成防护栏杆加固及反光标识复查' },
      { time: '10:11:12', date: '2026-11-26', id: 'LOG-20261126-030', type: '接口同步', content: '无人机航迹记录入库', actor: '无人机巡检系统', source: '无人机巡检系统', result: '同步成功', module: '无人机巡检', grantor: '系统自动调度', refDoc: 'SYNC-UAV-20261126-019', version: 'SYS-UAV-01 V1.4', target: '三工区梁场及主线航线', note: '入库有效航迹3条、高清巡检图64张' },
      { time: '10:05:00', date: '2026-11-26', id: 'LOG-20261126-029', type: '资料归档', content: '场站资料 V1.2', actor: '资料员B', source: '资料管理', result: '已归档', module: '系统管理', grantor: '管理员A', refDoc: 'ARC-20261126-009', version: 'STN-BASE V1.2', target: '料场示例A（MB-A2-YD-01）', note: '更新中心桩号坐标与关联底图版本' }
    ];

    // Remaining 28 items: need 10 接口同步, 4 导入审核, 7 问题办理, 2 设备指令, 5 资料归档
    const restTemplates = [
      ['接口同步', '拌合站盘次数据拉取', '拌合站系统', '拌合站系统', '同步成功', '质量管理'],
      ['接口同步', '实验室抗压报告同步', '实验室系统', '实验室系统', '同步成功', '质量管理'],
      ['问题办理', '复查 AQ-202611-039', '安全员A', '安全管理', '已核实', '安全管理'],
      ['资料归档', '归档黑土监测旬报', '环保专员', '资料管理', '已归档', '黑土地保护'],
      ['接口同步', '视频点位心跳状态检测', '视频监控系统', '视频监控系统', '同步成功', '视频监控'],
      ['导入审核', '参建单位名录导入', '资料员B', '资料管理', '审核通过', '系统管理'],
      ['问题办理', '处理 ZL-202611-018 偏差', '质检员D', '安全管理', '已核实', '质量管理'],
      ['设备指令', 'VMS-KY-B02 降雪提示发布', '发布员A', '信息发布', '已确认显示', '信息发布'],
      ['接口同步', '无人机机库电量巡检回传', '无人机巡检系统', '无人机巡检系统', '同步成功', '无人机巡检'],
      ['资料归档', '归档十一月计量草表', '计量员C', '资料管理', '已归档', '计量管理'],
      ['问题办理', '核销 AQ-202611-036 隐患', '安全员C', '安全管理', '已核实', '安全管理'],
      ['接口同步', '拌合站骨料配比同步', '拌合站系统', '拌合站系统', '同步成功', '质量管理'],
      ['导入审核', '桥墩构件编码批量校验', 'BIM专员', '资料管理', '审核通过', '系统管理'],
      ['问题办理', '办结现场临电巡检单', '安全员B', '安全管理', '已核实', '安全管理'],
      ['接口同步', '视频监控录像索引同步', '视频监控系统', '视频监控系统', '同步成功', '视频监控'],
      ['资料归档', '归档二工区场站IFC模型', 'BIM专员', '资料管理', '已归档', '系统管理'],
      ['问题办理', '确认三工区梁场养护提醒', '质检员A', '安全管理', '已核实', '质量管理'],
      ['设备指令', 'FB-20261126-005 保通指令', '发布员B', '信息发布', '已下发', '信息发布'],
      ['接口同步', '试验室钢筋检测批次同步', '实验室系统', '实验室系统', '同步成功', '质量管理'],
      ['导入审核', '展厅V1.2图集素材审核', '管理员A', '资料管理', '审核通过', '系统管理'],
      ['问题办理', '复核五工区K102试验段', '质检员D', '安全管理', '已核实', '质量管理'],
      ['接口同步', '视频AI告警事件拉取', '视频监控系统', '视频监控系统', '同步成功', '安全管理'],
      ['资料归档', '归档全线桩号控制点表', '测量主管', '资料管理', '已归档', '系统管理'],
      ['接口同步', '无人机正射成果索引更新', '无人机巡检系统', '无人机巡检系统', '同步成功', '无人机巡检'],
      ['问题办理', '闭环四工区施工通道提醒', '安全员C', '安全管理', '已核实', '安全管理'],
      ['导入审核', '设备状态映射字典更新', '管理员A', '资料管理', '审核通过', '系统管理'],
      ['资料归档', '归档安全教育培训记录', '安全员A', '资料管理', '已归档', '平安工地'],
      ['接口同步', '拌合站日产量汇总同步', '拌合站系统', '拌合站系统', '同步成功', '质量管理']
    ];

    const rest = restTemplates.map((tpl, idx) => {
      const seq = 28 - idx;
      const totalMin = 9 * 60 + 58 - idx * 3;
      const hh = String(Math.floor(totalMin / 60)).padStart(2, '0');
      const mm = String(totalMin % 60).padStart(2, '0');
      return {
        time: `${hh}:${mm}:00`,
        date: '2026-11-26',
        id: `LOG-20261126-${String(seq).padStart(3, '0')}`,
        type: tpl[0],
        content: tpl[1],
        actor: tpl[2],
        source: tpl[3],
        result: tpl[4],
        module: tpl[5],
        grantor: tpl[0] === '设备指令' ? '授权员C' : '管理员A',
        refDoc: `REF-20261126-${String(seq).padStart(3, '0')}`,
        version: 'V1.2',
        target: `${tpl[5]}关联业务单元`,
        feedback: tpl[0] === '设备指令' ? { sent: 2, received: 2, confirmed: tpl[4] === '已确认显示' ? 2 : 1 } : null,
        feedbackTime: `${hh}:${mm}:15`,
        note: `${tpl[1]}，状态：${tpl[4]}`
      };
    });

    store.logs = top8.concat(rest);
  })();

  /* ------------------------------------------------------------------------
     UI STATE
     ------------------------------------------------------------------------ */
  const ui = {
    base: {
      project: '明水至北安段',
      section: '',
      status: '',
      keyword: '',
      category: '场站',
      page: 1,
      pageSize: 6,
      selectedCode: 'MB-A2-YD-01'
    },
    rbac: {
      roleFilter: '',
      statusFilter: '',
      keyword: '',
      selectedRoleId: 'role_expo'
    },
    integration: {
      sysFilter: '',
      statusFilter: '',
      keyword: '',
      selectedCode: 'SYS-VIDEO-01'
    },
    metrics: {
      modFilter: '',
      statusFilter: '',
      keyword: '',
      selectedCode: 'IDX-VIDEO-001'
    },
    content: {
      typeFilter: '',
      statusFilter: '',
      selectedId: 'CNT-01',
      dragId: null
    },
    logs: {
      date: '2026-11-26',
      typeFilter: '',
      sourceFilter: '',
      keyword: '',
      page: 1,
      pageSize: 8,
      selectedId: 'LOG-20261126-033'
    }
  };

  let lastHostEl = null;
  let lastCtx = null;
  let currentSubPage = 'base';

  function rerender() {
    if (!lastHostEl || !lastCtx) return;
    renderSystemModule(lastHostEl, currentSubPage, lastCtx);
  }

  function addSystemLog(type, content, actor, source, result, moduleName, note) {
    const nextNum = store.logs.length + 1;
    const id = `LOG-20261126-${String(nextNum).padStart(3, '0')}`;
    store.logs.unshift({
      time: new Date().toTimeString().slice(0, 8),
      date: '2026-11-26',
      id,
      type,
      content,
      actor,
      source,
      result,
      module: moduleName,
      grantor: '管理员（演示）',
      refDoc: id,
      version: 'V1.2',
      target: moduleName,
      note: note || content
    });
  }

  /* ------------------------------------------------------------------------
     SHARED SUB-BANNER
     ------------------------------------------------------------------------ */
  function renderBanner(subPageId) {
    const names = {
      base: '基础资料',
      rbac: '用户权限',
      integration: '系统接入',
      metrics: '指标口径',
      content: '内容配置',
      logs: '日志档案'
    };
    return `
      <div class="m15-banner">
        <div class="m15-banner-left">
          <span class="m15-banner-badge">${SVG.shield} 系统管理后台</span>
          <span class="m15-banner-title">系统管理 · ${esc(names[subPageId] || '基础资料')}</span>
          <span class="m15-banner-sub">全局主数据、权限矩阵、接口接入与日志审计中枢</span>
        </div>
        <div class="m15-banner-right">
          <span class="m15-admin-pill">${SVG.user} 管理员（演示）</span>
          <button class="m15-btn-return" id="m15ReturnHomeBtn">${SVG.exit} 返回业务平台</button>
        </div>
      </div>
    `;
  }

  function renderPager(total, page, pageSize, unitLabel) {
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    let btns = '';
    for (let p = 1; p <= totalPages; p++) {
      btns += `<button class="m15-pg-btn ${p === safePage ? 'active' : ''}" data-pg="${p}">${p}</button>`;
    }
    return `
      <div class="m15-pager">
        <span class="m15-pager-info">共 ${total} ${esc(unitLabel)}</span>
        <button class="m15-pg-btn" data-pg="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''}>&lt;</button>
        ${btns}
        <button class="m15-pg-btn" data-pg="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 1: 基础资料 (base)
     ------------------------------------------------------------------------ */
  function getFilteredBaseRows() {
    const list = store.base[ui.base.category] || [];
    const kw = ui.base.keyword.trim().toLowerCase();
    return list.filter(item => {
      if (ui.base.section && item.section !== ui.base.section && item.section !== '全线') return false;
      if (ui.base.status && item.status !== ui.base.status) return false;
      if (kw && !item.name.toLowerCase().includes(kw) && !item.code.toLowerCase().includes(kw) && !(item.stake || '').toLowerCase().includes(kw)) return false;
      return true;
    });
  }

  function renderBasePage() {
    const rows = getFilteredBaseRows();
    const totalPages = Math.max(1, Math.ceil(rows.length / ui.base.pageSize));
    if (ui.base.page > totalPages) ui.base.page = 1;
    const start = (ui.base.page - 1) * ui.base.pageSize;
    const pageRows = rows.slice(start, start + ui.base.pageSize);
    const active = rows.find(r => r.code === ui.base.selectedCode) || pageRows[0] || rows[0] || (store.base[ui.base.category] || [])[0];
    if (active) ui.base.selectedCode = active.code;

    const unitLabelMap = {
      '项目': '个项目',
      '工区': '个工区',
      '参建单位': '家单位',
      '场站': '座场站',
      '桩号': '个桩号',
      '结构物': '处结构物',
      '构件编码': '个构件',
      '地图与模型': '份资源'
    };
    const colPrefix = ui.base.category === '场站' ? '场站' : ui.base.category;
    const mapLabel = (active && active.mapLabel) || `${(active && active.section) || '二工区'}工程底图`;
    const mapFile = (active && active.mapFile) || 'MB-A2-MAP.geojson';
    const modelLabel = (active && active.modelLabel) || `${(active && active.section) || '二工区'}场站模型`;
    const modelFile = (active && active.modelFile) || 'MB-A2-YD-01.ifc';

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>所属项目</label>
            <select class="m15-select" id="m15BaseProj">
              <option value="明水至北安段" ${ui.base.project === '明水至北安段' ? 'selected' : ''}>明水至北安段</option>
              <option value="全部项目" ${ui.base.project === '全部项目' ? 'selected' : ''}>全部项目</option>
            </select>
          </div>
          <div class="m15-filter-item">
            <label>所属工区</label>
            <select class="m15-select" id="m15BaseSec">
              <option value="">全部工区</option>
              ${Object.values(SECTION_MAP).map(s => `<option value="${s}" ${ui.base.section === s ? 'selected' : ''}>${s}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>资料状态</label>
            <select class="m15-select" id="m15BaseStatus">
              <option value="">全部状态</option>
              <option value="启用" ${ui.base.status === '启用' ? 'selected' : ''}>启用</option>
              <option value="停用" ${ui.base.status === '停用' ? 'selected' : ''}>停用</option>
            </select>
          </div>
          <div class="m15-filter-item">
            <label>关键词</label>
            <div class="m15-search-box">
              ${SVG.search}
              <input class="m15-input" id="m15BaseKw" type="text" placeholder="名称 / 编码" value="${esc(ui.base.keyword)}" />
            </div>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15BaseQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15BaseReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15BaseImport">${SVG.upload} 导入资料</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">基础资料概况</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-5">
            <div class="m15-kpi-card ${ui.base.category === '工区' ? 'active' : ''}" data-base-cat="工区">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.layers}</div>
              <div><div class="m15-kpi-label">工区</div><div class="m15-kpi-val m15-c-cyan">${store.base['工区'].length}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.base.category === '参建单位' ? 'active' : ''}" data-base-cat="参建单位">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.building}</div>
              <div><div class="m15-kpi-label">参建单位</div><div class="m15-kpi-val m15-c-cyan">${store.base['参建单位'].length}<span class="m15-kpi-unit">家</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.base.category === '场站' ? 'active' : ''}" data-base-cat="场站">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.yard}</div>
              <div><div class="m15-kpi-label">场站</div><div class="m15-kpi-val m15-c-cyan">${store.base['场站'].length}<span class="m15-kpi-unit">座</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.base.category === '结构物' ? 'active' : ''}" data-base-cat="结构物">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.bridge}</div>
              <div><div class="m15-kpi-label">结构物</div><div class="m15-kpi-val m15-c-cyan">${Math.max(store.baseStructureCount, store.base['结构物'].length)}<span class="m15-kpi-unit">处</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.base.category === '地图与模型' ? 'active' : ''}" data-base-cat="地图与模型">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.map}</div>
              <div><div class="m15-kpi-label">地图与模型</div><div class="m15-kpi-val m15-c-cyan">${Math.max(store.baseMapModelCount, store.base['地图与模型'].length)}<span class="m15-kpi-unit">份</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-left-stack">
          <div class="m15-panel" style="flex:1;">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">基础资料目录</span>
              </div>
              <span class="m15-panel-sub">当前分类：${esc(ui.base.category)}</span>
            </div>
            <div class="m15-panel-body">
              <div class="m15-cat-row">
                ${BASE_CATEGORIES.map(c => `<button class="m15-cat-pill ${ui.base.category === c ? 'active' : ''}" data-base-cat="${c}">${c}</button>`).join('')}
              </div>
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr>
                      <th>${esc(colPrefix)}编码</th>
                      <th>${esc(colPrefix)}名称</th>
                      <th>类型</th>
                      <th>工区</th>
                      <th>桩号</th>
                      <th>状态</th>
                      <th>更新时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pageRows.length ? pageRows.map(r => `
                      <tr data-base-row="${esc(r.code)}" class="${active && active.code === r.code ? 'm15-row-selected' : ''}">
                        <td class="m15-code-txt">${esc(r.code)}</td>
                        <td>${esc(r.name)}</td>
                        <td>${esc(r.type)}</td>
                        <td>${esc(r.section)}</td>
                        <td class="m15-code-txt">${esc(r.stake)}</td>
                        <td>${renderTag(r.status)}</td>
                        <td>${esc(r.updated)}</td>
                      </tr>
                    `).join('') : `<tr><td colspan="7" style="text-align:center;color:#8ab4dc;padding:24px;">暂无匹配的${esc(ui.base.category)}记录</td></tr>`}
                  </tbody>
                </table>
              </div>
              ${renderPager(rows.length, ui.base.page, ui.base.pageSize, unitLabelMap[ui.base.category] || '条记录')}
            </div>
          </div>

          <div class="m15-panel">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">关联地图与模型</span>
              </div>
              <span class="m15-panel-sub">${esc((active && active.section) || '二工区')} · ${esc((active && active.name) || '料场示例A')}</span>
            </div>
            <div class="m15-panel-body">
              <div class="m15-subcard-grid-2">
                <div class="m15-resource-card">
                  <div class="m15-resource-left">
                    <div class="m15-resource-ico">${SVG.map}</div>
                    <div>
                      <div class="m15-resource-title">${esc(mapLabel)}</div>
                      <div class="m15-resource-sub">${esc(mapFile)}</div>
                    </div>
                  </div>
                  <div class="m15-resource-right">
                    <span>V1.2</span>
                    <button class="m15-act-link" data-view-resource="geojson" data-file="${esc(mapFile)}" data-label="${esc(mapLabel)}">查看</button>
                  </div>
                </div>
                <div class="m15-resource-card">
                  <div class="m15-resource-left">
                    <div class="m15-resource-ico">${SVG.layers}</div>
                    <div>
                      <div class="m15-resource-title">${esc(modelLabel)}</div>
                      <div class="m15-resource-sub">${esc(modelFile)}</div>
                    </div>
                  </div>
                  <div class="m15-resource-right">
                    <span>V1.0</span>
                    <button class="m15-act-link" data-view-resource="ifc" data-file="${esc(modelFile)}" data-label="${esc(modelLabel)}">查看</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="m15-panel m15-base-detail">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">${esc(colPrefix)}档案</span>
            </div>
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-detail-hero">
                <div class="m15-detail-hero-left">
                  <div class="m15-resource-ico">${SVG.yard}</div>
                  <div>
                    <div class="m15-detail-title">${esc(active.name)}</div>
                    <div class="m15-detail-code">${esc(active.code)}</div>
                  </div>
                </div>
                ${renderTag(active.status)}
              </div>
              <div class="m15-meta-grid-2">
                <div class="m15-meta-cell"><label>所属项目</label><div>明水至北安段</div></div>
                <div class="m15-meta-cell"><label>所属工区</label><div>${esc(active.section)}</div></div>
                <div class="m15-meta-cell"><label>参建单位</label><div>${esc(active.unit || '二工区施工单位（演示）')}</div></div>
                <div class="m15-meta-cell"><label>${esc(colPrefix)}类型</label><div>${esc(active.type)}</div></div>
                <div class="m15-meta-cell"><label>中心桩号</label><div>${esc(active.stake)}</div></div>
                <div class="m15-meta-cell"><label>档案更新</label><div>2026-${esc(active.updated)}</div></div>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;">${esc(colPrefix)}位置</div>
              <div class="m15-thumb-box m15-thumb-base">
                <img src="${IMG.corridor}" alt="${esc(active.name)}" />
                <span class="m15-thumb-badge">位置示意</span>
                <span class="m15-stake-pin">${SVG.pin} ${esc(active.stake)}</span>
              </div>
              <div class="m15-panel-foot">
                <span>关联视频点位 <strong style="color:#f1f7ff;">${esc(active.cam || 'CAM-YD-A01')}</strong></span>
                <button class="m15-act-link" id="m15ViewArchiveBtn">查看档案 &gt;</button>
              </div>
            ` : `<div style="color:#8ab4dc;padding:24px;text-align:center;">请选择一条基础资料</div>`}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 2: 用户权限 (rbac)
     ------------------------------------------------------------------------ */
  function getFilteredRoles() {
    const kw = ui.rbac.keyword.trim().toLowerCase();
    return store.rbac.roles.filter(r => {
      if (ui.rbac.roleFilter && r.name !== ui.rbac.roleFilter) return false;
      if (ui.rbac.statusFilter && r.status !== ui.rbac.statusFilter) return false;
      if (kw) {
        const matchRole = r.name.toLowerCase().includes(kw) || r.scope.toLowerCase().includes(kw);
        const matchAcc = r.accounts.some(a => a.id.toLowerCase().includes(kw) || a.name.toLowerCase().includes(kw));
        if (!matchRole && !matchAcc) return false;
      }
      return true;
    });
  }

  function renderRbacPage() {
    const roles = getFilteredRoles();
    const active = roles.find(r => r.id === ui.rbac.selectedRoleId) || roles[0] || store.rbac.roles[0];
    if (active) ui.rbac.selectedRoleId = active.id;

    const totalAccounts = store.rbac.roles.reduce((s, r) => s + r.accountCount, 0);
    const expoAccounts = (store.rbac.roles.find(r => r.id === 'role_expo') || { accountCount: 3 }).accountCount;
    const devAccounts = (store.rbac.roles.find(r => r.id === 'role_dev') || { accountCount: 2 }).accountCount;

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>账号类型</label>
            <select class="m15-select" id="m15RbacRoleSel">
              <option value="">全部类型</option>
              ${store.rbac.roles.map(r => `<option value="${esc(r.name)}" ${ui.rbac.roleFilter === r.name ? 'selected' : ''}>${esc(r.name)}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>账号状态</label>
            <select class="m15-select" id="m15RbacStatusSel">
              <option value="">全部状态</option>
              <option value="启用" ${ui.rbac.statusFilter === '启用' ? 'selected' : ''}>启用</option>
              <option value="停用" ${ui.rbac.statusFilter === '停用' ? 'selected' : ''}>停用</option>
            </select>
          </div>
          <div class="m15-filter-item">
            <label>关键词</label>
            <div class="m15-search-box">
              ${SVG.search}
              <input class="m15-input" id="m15RbacKw" type="text" placeholder="账号 / 角色名称" value="${esc(ui.rbac.keyword)}" />
            </div>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15RbacQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15RbacReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15RbacNewBtn">${SVG.plus} 新建角色</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">权限概况</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-4">
            <div class="m15-kpi-card" data-rbac-kpi="">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.users}</div>
              <div><div class="m15-kpi-label">账号</div><div class="m15-kpi-val m15-c-cyan">${totalAccounts}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-rbac-kpi="">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.shield}</div>
              <div><div class="m15-kpi-label">角色</div><div class="m15-kpi-val m15-c-cyan">${store.rbac.roles.length}<span class="m15-kpi-unit">类</span></div></div>
            </div>
            <div class="m15-kpi-card" data-rbac-kpi="展厅展示">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.monitor}</div>
              <div><div class="m15-kpi-label">展厅展示账号</div><div class="m15-kpi-val m15-c-blue">${expoAccounts}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-rbac-kpi="设备控制员">
              <div class="m15-kpi-ico m15-ico-gold">${SVG.sliders}</div>
              <div><div class="m15-kpi-label">设备控制账号</div><div class="m15-kpi-val m15-c-gold">${devAccounts}<span class="m15-kpi-unit">个</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-left-stack">
          <div class="m15-panel" style="flex:1;">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">角色权限矩阵</span>
              </div>
              <span class="m15-panel-sub">点击 ✓ / — 可实时切换权限</span>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr>
                      <th>角色</th>
                      <th>数据范围</th>
                      <th>账号数</th>
                      ${store.rbac.permCols.map(p => `<th style="text-align:center;">${esc(p)}</th>`).join('')}
                    </tr>
                  </thead>
                  <tbody>
                    ${roles.map(r => `
                      <tr data-role-id="${esc(r.id)}" class="${active && active.id === r.id ? 'm15-row-selected' : ''}">
                        <td style="font-weight:700;color:#ffffff;">${esc(r.name)}</td>
                        <td>${esc(r.scope)}</td>
                        <td>${r.accountCount}</td>
                        ${store.rbac.permCols.map(p => {
                          const on = !!r.perms[p];
                          return `<td style="text-align:center;"><button class="m15-perm-btn ${on ? 'on' : ''}" data-toggle-perm="${esc(r.id)}|${esc(p)}" title="点击切换 ${esc(r.name)} 的 ${esc(p)} 权限">${on ? '✓' : '—'}</button></td>`;
                        }).join('')}
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="m15-panel-foot" style="border-top:none;">
                <span style="display:inline-flex;align-items:center;gap:12px;"><span style="color:#4ade80;">✓ 已授权</span><span>— 未授权</span></span>
                <span>共 ${roles.length} 类角色</span>
              </div>
            </div>
          </div>

          <div class="m15-panel">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">近期授权记录</span>
              </div>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr><th>授权时间</th><th>授权角色</th><th>关联账号</th><th>授权范围</th><th>授权人</th></tr>
                  </thead>
                  <tbody>
                    ${store.rbac.grants.slice(0, 4).map(g => `
                      <tr>
                        <td class="m15-code-txt">${esc(g.time)}</td>
                        <td>${esc(g.role)}</td>
                        <td>${esc(g.account)}</td>
                        <td>${esc(g.scope)}</td>
                        <td>${esc(g.grantor)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">角色详情</span>
            </div>
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-detail-hero">
                <div class="m15-detail-hero-left">
                  <div class="m15-resource-ico">${SVG.monitor}</div>
                  <div>
                    <div class="m15-detail-title">${esc(active.name)}</div>
                    <div class="m15-detail-code">${active.id === 'role_expo' ? '展示账号' : '绑定账号'} · ${active.accountCount} 个</div>
                  </div>
                </div>
                ${renderTag(active.status)}
              </div>
              <div class="m15-meta-grid-2">
                <div class="m15-meta-cell"><label>数据范围</label><div>${esc(active.scope)}</div></div>
                <div class="m15-meta-cell"><label>关联版本</label><div>${esc(active.version)}</div></div>
              </div>
              <div class="m15-meta-single">
                <label>可访问内容</label>
                <div>${esc(active.accessContent)}</div>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;">账号绑定</div>
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead><tr><th>账号编号</th><th>账号名称</th><th>状态</th></tr></thead>
                  <tbody>
                    ${active.accounts.map(a => `
                      <tr data-toggle-acc="${esc(active.id)}|${esc(a.id)}" title="点击切换账号启停状态">
                        <td class="m15-code-txt">${esc(a.id)}</td>
                        <td>${esc(a.name)}</td>
                        <td>${renderTag(a.status)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;margin-top:auto;">授权范围</div>
              <div class="m15-scope-cards">
                <div class="m15-scope-card ${active.perms['展厅展示'] ? 'granted' : ''}">
                  <span>${active.perms['展厅展示'] ? '✓ ' : ''}展厅展示</span>
                  <span>${active.perms['展厅展示'] ? '已授权' : '未授权'}</span>
                </div>
                <div class="m15-scope-card ${active.perms['设备控制'] ? 'granted' : ''}">
                  <span>${active.perms['设备控制'] ? '✓ ' : ''}设备控制</span>
                  <span>${active.perms['设备控制'] ? '已授权' : '未授权'}</span>
                </div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 3: 系统接入 (integration)
     ------------------------------------------------------------------------ */
  function getFilteredSystems() {
    const kw = ui.integration.keyword.trim().toLowerCase();
    return store.integration.systems.filter(s => {
      if (ui.integration.sysFilter && s.name !== ui.integration.sysFilter) return false;
      if (ui.integration.statusFilter && s.status !== ui.integration.statusFilter) return false;
      if (kw && !s.name.toLowerCase().includes(kw) && !s.code.toLowerCase().includes(kw)) return false;
      return true;
    });
  }

  function renderIntegrationPage() {
    const systems = getFilteredSystems();
    const active = systems.find(s => s.code === ui.integration.selectedCode) || systems[0] || store.integration.systems[0];
    if (active) ui.integration.selectedCode = active.code;

    const all = store.integration.systems;
    const countNormal = all.filter(s => s.status === '正常回传').length;
    const countUnconn = all.filter(s => s.status === '未接入').length;
    const countEmpty = all.filter(s => s.status === '无数据').length;
    const countOffline = all.filter(s => s.status === '离线').length;

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>专项系统</label>
            <select class="m15-select" id="m15IntSysSel">
              <option value="">全部系统</option>
              ${all.map(s => `<option value="${esc(s.name)}" ${ui.integration.sysFilter === s.name ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>接入状态</label>
            <select class="m15-select" id="m15IntStatusSel">
              <option value="">全部状态</option>
              ${['正常回传', '未接入', '无数据', '离线'].map(st => `<option value="${st}" ${ui.integration.statusFilter === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>关键词</label>
            <div class="m15-search-box">
              ${SVG.search}
              <input class="m15-input" id="m15IntKw" type="text" placeholder="系统名称 / 编码" value="${esc(ui.integration.keyword)}" />
            </div>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15IntQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15IntReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15IntNewBtn">${SVG.plus} 登记系统</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">接入概况</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-5">
            <div class="m15-kpi-card" data-int-kpi="">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.link}</div>
              <div><div class="m15-kpi-label">登记专项系统</div><div class="m15-kpi-val m15-c-cyan">${all.length}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-int-kpi="正常回传">
              <div class="m15-kpi-ico m15-ico-green">${SVG.checkCircle}</div>
              <div><div class="m15-kpi-label">正常回传</div><div class="m15-kpi-val m15-c-green">${countNormal}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-int-kpi="未接入">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.layers}</div>
              <div><div class="m15-kpi-label">未接入</div><div class="m15-kpi-val m15-c-cyan">${countUnconn}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-int-kpi="无数据">
              <div class="m15-kpi-ico m15-ico-gold">${SVG.doc}</div>
              <div><div class="m15-kpi-label">无数据</div><div class="m15-kpi-val m15-c-gold">${countEmpty}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-int-kpi="离线">
              <div class="m15-kpi-ico m15-ico-red">${SVG.warnTri}</div>
              <div><div class="m15-kpi-label">离线</div><div class="m15-kpi-val m15-c-red">${countOffline}<span class="m15-kpi-unit">个</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-left-stack">
          <div class="m15-panel" style="flex:1;">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">专项系统清单</span>
              </div>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr><th>专项系统</th><th>接入编码</th><th>数据范围</th><th>更新频率</th><th>最近响应</th><th>接入状态</th></tr>
                  </thead>
                  <tbody>
                    ${systems.map(s => `
                      <tr data-int-code="${esc(s.code)}" class="${active && active.code === s.code ? 'm15-row-selected' : ''}">
                        <td style="font-weight:600;color:#ffffff;">${esc(s.name)}</td>
                        <td class="m15-code-txt">${esc(s.code)}</td>
                        <td>${esc(s.scope)}</td>
                        <td>${esc(s.freq)}</td>
                        <td class="m15-code-txt">${esc(s.lastResp)}</td>
                        <td>${renderTag(s.status)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="m15-panel-foot" style="border-top:none;justify-content:flex-end;">
                <span>共 ${systems.length} 个专项系统</span>
              </div>
            </div>
          </div>

          <div class="m15-panel">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">接入状态说明</span>
              </div>
            </div>
            <div class="m15-panel-body">
              <div class="m15-subcard-grid-3">
                <div class="m15-resource-card">${renderTag('未接入')}<span style="font-size:12px;color:#cbd5e1;">接口尚未配置或开通</span></div>
                <div class="m15-resource-card">${renderTag('无数据')}<span style="font-size:12px;color:#cbd5e1;">接口已响应，本期返回空记录</span></div>
                <div class="m15-resource-card">${renderTag('离线')}<span style="font-size:12px;color:#cbd5e1;">接口已接入，当前无法连接</span></div>
              </div>
            </div>
          </div>
        </div>

        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">接入配置</span>
            </div>
            ${active ? `<button class="m15-btn-cyan" id="m15TestConnBtn" style="height:26px;font-size:11.5px;">连通性测试</button>` : ''}
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-detail-hero">
                <div class="m15-detail-hero-left">
                  <div class="m15-resource-ico">${SVG.link}</div>
                  <div>
                    <div class="m15-detail-title">${esc(active.name)}</div>
                    <div class="m15-detail-code">${esc(active.code)}</div>
                  </div>
                </div>
                ${renderTag(active.status)}
              </div>
              <div class="m15-meta-grid-2">
                <div class="m15-meta-cell"><label>更新频率</label><div>${esc(active.freq)}</div></div>
                <div class="m15-meta-cell"><label>最近响应</label><div>${esc(active.lastRespFull)}</div></div>
              </div>
              <div class="m15-meta-single">
                <label>系统入口</label>
                <div class="m15-code-txt">${esc(active.endpoint)}</div>
              </div>
              <div class="m15-meta-single">
                <label>数据范围</label>
                <div>${esc(active.detailScope)}</div>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;">字段映射</div>
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead><tr><th>来源字段</th><th>平台字段</th><th>用途</th></tr></thead>
                  <tbody>
                    ${active.mappings.map(m => `
                      <tr>
                        <td class="m15-code-txt">${esc(m.src)}</td>
                        <td>${esc(m.target)}</td>
                        <td>${esc(m.usage)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;margin-top:auto;">设备状态映射</div>
              <div class="m15-state-pills">
                ${active.statusMap.map(sm => `<div class="m15-state-pill"><span class="m15-dot m15-dot-${sm.tone}"></span><span>${esc(sm.label)}</span></div>`).join('')}
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 4: 指标口径 (metrics)
     ------------------------------------------------------------------------ */
  function getFilteredMetrics() {
    const kw = ui.metrics.keyword.trim().toLowerCase();
    return store.metrics.items.filter(m => {
      if (ui.metrics.modFilter && m.module !== ui.metrics.modFilter) return false;
      if (ui.metrics.statusFilter && m.status !== ui.metrics.statusFilter) return false;
      if (kw && !m.name.toLowerCase().includes(kw) && !m.code.toLowerCase().includes(kw)) return false;
      return true;
    });
  }

  function renderMetricsPage() {
    const items = getFilteredMetrics();
    const active = items.find(m => m.code === ui.metrics.selectedCode) || items[0] || store.metrics.items[0];
    if (active) ui.metrics.selectedCode = active.code;

    const all = store.metrics.items;
    const countOk = all.filter(m => m.status === '正常更新').length;
    const countWait = all.filter(m => m.status === '待接入').length;
    const countCheck = all.filter(m => m.status === '待核对').length;

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>业务模块</label>
            <select class="m15-select" id="m15MetModSel">
              <option value="">全部模块</option>
              ${['视频监控', '安全管理', '计量管理', '质量管理'].map(mod => `<option value="${mod}" ${ui.metrics.modFilter === mod ? 'selected' : ''}>${mod}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>更新状态</label>
            <select class="m15-select" id="m15MetStatusSel">
              <option value="">全部状态</option>
              ${['正常更新', '待接入', '待核对'].map(st => `<option value="${st}" ${ui.metrics.statusFilter === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>关键词</label>
            <div class="m15-search-box">
              ${SVG.search}
              <input class="m15-input" id="m15MetKw" type="text" placeholder="指标名称 / 编码" value="${esc(ui.metrics.keyword)}" />
            </div>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15MetQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15MetReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15MetNewBtn">${SVG.plus} 新增指标</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">指标概况</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-4">
            <div class="m15-kpi-card" data-met-kpi="">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.chart}</div>
              <div><div class="m15-kpi-label">登记指标</div><div class="m15-kpi-val m15-c-cyan">${all.length}<span class="m15-kpi-unit">项</span></div></div>
            </div>
            <div class="m15-kpi-card" data-met-kpi="正常更新">
              <div class="m15-kpi-ico m15-ico-green">${SVG.checkCircle}</div>
              <div><div class="m15-kpi-label">正常更新</div><div class="m15-kpi-val m15-c-green">${countOk}<span class="m15-kpi-unit">项</span></div></div>
            </div>
            <div class="m15-kpi-card" data-met-kpi="待接入">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.link}</div>
              <div><div class="m15-kpi-label">待接入</div><div class="m15-kpi-val m15-c-blue">${countWait}<span class="m15-kpi-unit">项</span></div></div>
            </div>
            <div class="m15-kpi-card" data-met-kpi="待核对">
              <div class="m15-kpi-ico m15-ico-gold">${SVG.warnTri}</div>
              <div><div class="m15-kpi-label">待核对</div><div class="m15-kpi-val m15-c-gold">${countCheck}<span class="m15-kpi-unit">项</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-left-stack">
          <div class="m15-panel" style="flex:1;">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">指标目录</span>
              </div>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr><th>指标编码</th><th>指标名称</th><th>业务模块</th><th>统计时点 / 周期</th><th>单位</th><th>更新状态</th></tr>
                  </thead>
                  <tbody>
                    ${items.map(m => `
                      <tr data-met-code="${esc(m.code)}" class="${active && active.code === m.code ? 'm15-row-selected' : ''}">
                        <td class="m15-code-txt">${esc(m.code)}</td>
                        <td style="font-weight:600;color:#ffffff;">${esc(m.name)}</td>
                        <td>${esc(m.module)}</td>
                        <td class="m15-code-txt">${esc(m.period)}</td>
                        <td>${esc(m.unit)}</td>
                        <td>${renderTag(m.status)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              <div class="m15-panel-foot" style="border-top:none;justify-content:flex-end;">
                <span>共 ${items.length} 项指标</span>
              </div>
            </div>
          </div>

          <div class="m15-panel">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">指标异常记录</span>
              </div>
              <span class="m15-panel-sub">${esc((active && active.name) || '')}</span>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead><tr><th>发现时间</th><th>来源</th><th>异常类型</th><th>处理记录</th></tr></thead>
                  <tbody>
                    ${(active ? active.anomalies : []).map(a => `
                      <tr>
                        <td class="m15-code-txt">${esc(a.time)}</td>
                        <td class="m15-code-txt">${esc(a.source)}</td>
                        <td>${esc(a.type)}</td>
                        <td>${esc(a.handling)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">口径详情</span>
            </div>
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-detail-hero">
                <div class="m15-detail-hero-left">
                  <div class="m15-resource-ico">${SVG.chart}</div>
                  <div>
                    <div class="m15-detail-title">${esc(active.name)}</div>
                    <div class="m15-detail-code">${esc(active.code)}</div>
                  </div>
                </div>
                <div class="m15-big-metric">${esc(active.value)}<span>${esc(active.unit)}</span></div>
              </div>
              <div class="m15-meta-grid-2">
                <div class="m15-meta-cell"><label>统计时点</label><div>${esc(active.periodFull)}</div></div>
                <div class="m15-meta-cell"><label>统计单位</label><div>${esc(active.unit)}</div></div>
                <div class="m15-meta-cell"><label>数据来源</label><div>${esc(active.sourceSystem)}</div></div>
                <div class="m15-meta-cell"><label>更新状态</label><div>${renderTag(active.status)}</div></div>
              </div>
              <div class="m15-meta-single">
                <label>来源字段</label>
                <div class="m15-code-txt">${esc(active.fields)}</div>
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;">统计与去重规则</div>
              <div class="m15-rules-box">
                ${active.rules.map(rule => `<div>${esc(rule)}</div>`).join('')}
              </div>
              <div class="m15-panel-foot">
                <span>规则版本 <strong style="color:#ffffff;">${esc(active.version)}</strong></span>
                <button class="m15-act-link" id="m15ViewMetricHistBtn">查看版本记录 &gt;</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 5: 内容配置 (content)
     ------------------------------------------------------------------------ */
  function getActiveVersionItems() {
    return store.content.itemsByVersion[store.content.activeVersion] || [];
  }

  function getFilteredContentItems() {
    return getActiveVersionItems().filter(item => {
      if (ui.content.typeFilter && item.type !== ui.content.typeFilter) return false;
      if (ui.content.statusFilter && item.status !== ui.content.statusFilter) return false;
      return true;
    });
  }

  function renderContentPage() {
    const allItems = getActiveVersionItems();
    const rows = getFilteredContentItems();
    const active = allItems.find(i => i.id === ui.content.selectedId) || rows[0] || allItems[0];
    if (active) ui.content.selectedId = active.id;

    const verMeta = store.content.versions.find(v => v.version === store.content.activeVersion) || store.content.versions[0];
    const kpiDoc = allItems.filter(i => i.type === '图文').length;
    const kpiImg = allItems.some(i => i.type === '图片') ? 6 : 0;
    const kpiVid = allItems.filter(i => i.type === '视频').length;
    const kpiTopic = allItems.filter(i => i.type === '专题').length;
    const kpiMap = allItems.some(i => i.type === '地图视角') ? 2 : 0;

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>汇报版本</label>
            <select class="m15-select" id="m15CntVerSel" style="min-width:155px;">
              ${store.content.versions.map(v => `<option value="${esc(v.version)}" ${store.content.activeVersion === v.version ? 'selected' : ''}>${esc(v.version)}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>内容类型</label>
            <select class="m15-select" id="m15CntTypeSel">
              <option value="">全部类型</option>
              ${['图文', '图片', '视频', '专题', '地图视角'].map(t => `<option value="${t}" ${ui.content.typeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>发布状态</label>
            <select class="m15-select" id="m15CntStatusSel">
              <option value="">全部状态</option>
              ${['已发布', '草稿', '待审核', '已归档'].map(st => `<option value="${st}" ${ui.content.statusFilter === st ? 'selected' : ''}>${st}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15CntQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15CntReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15CntPreviewBtn">${SVG.monitor} 预览展厅</button>
          <button class="m15-btn-cyan" id="m15CntSaveBtn">${SVG.save} 保存配置</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">展厅内容概况</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-5">
            <div class="m15-kpi-card" data-cnt-kpi="图文">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.doc}</div>
              <div><div class="m15-kpi-label">图文内容</div><div class="m15-kpi-val m15-c-cyan">${kpiDoc}<span class="m15-kpi-unit">项</span></div></div>
            </div>
            <div class="m15-kpi-card" data-cnt-kpi="图片">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.image}</div>
              <div><div class="m15-kpi-label">图片</div><div class="m15-kpi-val m15-c-cyan">${kpiImg}<span class="m15-kpi-unit">张</span></div></div>
            </div>
            <div class="m15-kpi-card" data-cnt-kpi="视频">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.video}</div>
              <div><div class="m15-kpi-label">宣传片</div><div class="m15-kpi-val m15-c-cyan">${kpiVid}<span class="m15-kpi-unit">部</span></div></div>
            </div>
            <div class="m15-kpi-card" data-cnt-kpi="专题">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.layers}</div>
              <div><div class="m15-kpi-label">专题</div><div class="m15-kpi-val m15-c-cyan">${kpiTopic}<span class="m15-kpi-unit">个</span></div></div>
            </div>
            <div class="m15-kpi-card" data-cnt-kpi="地图视角">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.map}</div>
              <div><div class="m15-kpi-label">地图视角</div><div class="m15-kpi-val m15-c-cyan">${kpiMap}<span class="m15-kpi-unit">处</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-left-stack">
          <div class="m15-panel" style="flex:1;">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">展厅内容编排</span>
              </div>
              <span class="m15-panel-sub">${esc(store.content.activeVersion)} · 支持拖拽或上下调整顺序</span>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead>
                    <tr><th>顺序</th><th>内容名称</th><th>类型</th><th>素材 / 配置</th><th>发布状态</th><th>操作</th></tr>
                  </thead>
                  <tbody>
                    ${rows.map((item, idx) => {
                      const realIdx = allItems.findIndex(x => x.id === item.id);
                      return `
                        <tr draggable="true" data-cnt-id="${esc(item.id)}" class="${active && active.id === item.id ? 'm15-row-selected' : ''}">
                          <td>
                            <div class="m15-order-cell">
                              <span style="color:#64748b;display:inline-flex;">${SVG.grip}</span>
                              <span class="m15-code-txt">${String(realIdx + 1).padStart(2, '0')}</span>
                              <span class="m15-move-btns">
                                <button class="m15-move-btn" data-move-cnt="${esc(item.id)}|-1" ${realIdx <= 0 ? 'disabled' : ''} title="上移">${SVG.up}</button>
                                <button class="m15-move-btn" data-move-cnt="${esc(item.id)}|1" ${realIdx >= allItems.length - 1 ? 'disabled' : ''} title="下移">${SVG.down}</button>
                              </span>
                            </div>
                          </td>
                          <td style="font-weight:600;color:#ffffff;">${esc(item.name)}</td>
                          <td>${esc(item.type)}</td>
                          <td>${esc(item.material)}</td>
                          <td>${renderTag(item.status)}</td>
                          <td><button class="m15-act-link" data-edit-cnt="${esc(item.id)}">编辑</button></td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
              </div>
              <div class="m15-panel-foot" style="border-top:none;justify-content:flex-end;">
                <span>共 ${rows.length} 项内容</span>
              </div>
            </div>
          </div>

          <div class="m15-panel">
            <div class="m15-panel-head">
              <div class="m15-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="m15-panel-title">汇报版本</span>
              </div>
            </div>
            <div class="m15-panel-body">
              <div class="m15-table-wrap">
                <table class="m15-table">
                  <thead><tr><th>版本</th><th>状态</th><th>发布时间</th><th>操作人</th></tr></thead>
                  <tbody>
                    ${store.content.versions.map(v => `
                      <tr data-switch-ver="${esc(v.version)}" class="${store.content.activeVersion === v.version ? 'm15-row-selected' : ''}">
                        <td style="font-weight:600;color:#ffffff;">${esc(v.version)}</td>
                        <td>${renderTag(v.status)}</td>
                        <td class="m15-code-txt">${esc(v.publishTime)}</td>
                        <td>${esc(v.operator)}</td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">展厅预览</span>
            </div>
            <span class="m15-panel-sub">${esc((active && active.name) || '项目介绍')}</span>
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-thumb-box" style="aspect-ratio:16/9;">
                <img src="${esc(active.img || IMG.showcase)}" alt="${esc(active.name)}" />
                <span class="m15-thumb-badge">演示图像</span>
                <div class="m15-preview-overlay">
                  <div class="m15-preview-sub">${esc(active.overlaySub)}</div>
                  <div class="m15-preview-title">${esc(active.overlayTitle)}</div>
                </div>
              </div>
              <div class="m15-preview-pills">
                ${allItems.slice(0, 5).map(item => `
                  <button class="m15-preview-pill ${active.id === item.id ? 'active' : ''}" data-preview-cnt="${esc(item.id)}">${esc(item.name)}</button>
                `).join('')}
              </div>
              <div style="font-size:12.5px;font-weight:700;color:#dbeafe;">展厅显示设置</div>
              <div class="m15-meta-grid-2" style="border-bottom:none;">
                <div class="m15-meta-cell"><label>当前汇报版本</label><div>${esc(verMeta.version)}</div></div>
                <div class="m15-meta-cell"><label>首页内容</label><div>${esc((allItems[0] && allItems[0].name) || '项目介绍')}</div></div>
                <div class="m15-meta-cell"><label>默认地图视角</label><div>${esc(verMeta.defaultView)}</div></div>
                <div class="m15-meta-cell"><label>展厅账号</label><div>${esc(verMeta.role)}</div></div>
                <div class="m15-meta-cell"><label>最近发布时间</label><div>${esc(verMeta.publishTime)}</div></div>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 6: 日志档案 (logs)
     ------------------------------------------------------------------------ */
  function getFilteredLogs() {
    const kw = ui.logs.keyword.trim().toLowerCase();
    return store.logs.filter(l => {
      if (ui.logs.date && l.date !== ui.logs.date) return false;
      if (ui.logs.typeFilter && l.type !== ui.logs.typeFilter) return false;
      if (ui.logs.sourceFilter && l.source !== ui.logs.sourceFilter) return false;
      if (kw && !l.id.toLowerCase().includes(kw) && !l.actor.toLowerCase().includes(kw) && !l.content.toLowerCase().includes(kw)) return false;
      return true;
    });
  }

  function renderLogsPage() {
    const rows = getFilteredLogs();
    const totalPages = Math.max(1, Math.ceil(rows.length / ui.logs.pageSize));
    if (ui.logs.page > totalPages) ui.logs.page = 1;
    const start = (ui.logs.page - 1) * ui.logs.pageSize;
    const pageRows = rows.slice(start, start + ui.logs.pageSize);
    const active = rows.find(l => l.id === ui.logs.selectedId) || pageRows[0] || rows[0] || store.logs[0];
    if (active) ui.logs.selectedId = active.id;

    const all = store.logs;
    const cSync = all.filter(l => l.type === '接口同步').length;
    const cImp = all.filter(l => l.type === '导入审核').length;
    const cIssue = all.filter(l => l.type === '问题办理').length;
    const cCmd = all.filter(l => l.type === '设备指令').length;
    const cArc = all.filter(l => l.type === '资料归档').length;

    const sources = Array.from(new Set(all.map(l => l.source)));

    return `
      <div class="m15-filter-bar">
        <div class="m15-filter-group">
          <div class="m15-filter-item">
            <label>日期</label>
            <div class="m15-date-wrap">
              <input class="m15-input" id="m15LogDate" type="text" value="${esc(ui.logs.date)}" style="width:126px;padding-right:26px;" />
              ${SVG.calendar}
            </div>
          </div>
          <div class="m15-filter-item">
            <label>日志类型</label>
            <select class="m15-select" id="m15LogTypeSel">
              <option value="">全部类型</option>
              ${['接口同步', '导入审核', '问题办理', '设备指令', '资料归档'].map(t => `<option value="${t}" ${ui.logs.typeFilter === t ? 'selected' : ''}>${t}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>来源</label>
            <select class="m15-select" id="m15LogSrcSel">
              <option value="">全部来源</option>
              ${sources.map(s => `<option value="${esc(s)}" ${ui.logs.sourceFilter === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
            </select>
          </div>
          <div class="m15-filter-item">
            <label>关键词</label>
            <div class="m15-search-box">
              ${SVG.search}
              <input class="m15-input" id="m15LogKw" type="text" placeholder="编号 / 操作人" value="${esc(ui.logs.keyword)}" />
            </div>
          </div>
        </div>
        <div class="m15-filter-actions">
          <button class="m15-btn-query" id="m15LogQuery">${SVG.search} 查询</button>
          <button class="m15-btn-ghost" id="m15LogReset">${SVG.refresh} 重置</button>
          <span class="m15-divider-v"></span>
          <button class="m15-btn-ghost" id="m15LogExport">${SVG.download} 导出记录</button>
        </div>
      </div>

      <div class="m15-panel">
        <div class="m15-panel-head">
          <div class="m15-panel-head-left">
            <span class="panel-accent-bar"></span>
            <span class="m15-panel-title">日志统计</span>
            <span class="m15-panel-sub">(2026-11-26)</span>
          </div>
        </div>
        <div class="m15-panel-body">
          <div class="m15-kpi-grid-6">
            <div class="m15-kpi-card ${ui.logs.typeFilter === '' ? 'active' : ''}" data-log-kpi="">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.doc}</div>
              <div><div class="m15-kpi-label">记录合计</div><div class="m15-kpi-val m15-c-cyan">${all.length}<span class="m15-kpi-unit">条</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.logs.typeFilter === '接口同步' ? 'active' : ''}" data-log-kpi="接口同步">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.sync}</div>
              <div><div class="m15-kpi-label">接口同步</div><div class="m15-kpi-val m15-c-cyan">${cSync}<span class="m15-kpi-unit">条</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.logs.typeFilter === '导入审核' ? 'active' : ''}" data-log-kpi="导入审核">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.upload}</div>
              <div><div class="m15-kpi-label">导入审核</div><div class="m15-kpi-val m15-c-cyan">${cImp}<span class="m15-kpi-unit">条</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.logs.typeFilter === '问题办理' ? 'active' : ''}" data-log-kpi="问题办理">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.checkCircle}</div>
              <div><div class="m15-kpi-label">问题办理</div><div class="m15-kpi-val m15-c-cyan">${cIssue}<span class="m15-kpi-unit">条</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.logs.typeFilter === '设备指令' ? 'active' : ''}" data-log-kpi="设备指令">
              <div class="m15-kpi-ico m15-ico-cyan">${SVG.sliders}</div>
              <div><div class="m15-kpi-label">设备指令</div><div class="m15-kpi-val m15-c-cyan">${cCmd}<span class="m15-kpi-unit">条</span></div></div>
            </div>
            <div class="m15-kpi-card ${ui.logs.typeFilter === '资料归档' ? 'active' : ''}" data-log-kpi="资料归档">
              <div class="m15-kpi-ico m15-ico-blue">${SVG.folder}</div>
              <div><div class="m15-kpi-label">资料归档</div><div class="m15-kpi-val m15-c-cyan">${cArc}<span class="m15-kpi-unit">条</span></div></div>
            </div>
          </div>
        </div>
      </div>

      <div class="m15-split-main">
        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">操作与归档记录</span>
            </div>
            <span class="m15-panel-sub">${esc(ui.logs.date || '2026-11-26')}</span>
          </div>
          <div class="m15-panel-body">
            <div class="m15-table-wrap">
              <table class="m15-table">
                <thead>
                  <tr><th>操作时间</th><th>日志编号</th><th>事件类型</th><th>记录内容</th><th>操作人 / 来源</th><th>结果</th></tr>
                </thead>
                <tbody>
                  ${pageRows.length ? pageRows.map(l => `
                    <tr data-log-id="${esc(l.id)}" class="${active && active.id === l.id ? 'm15-row-selected' : ''}">
                      <td class="m15-code-txt">${esc(l.time)}</td>
                      <td class="m15-code-txt">${esc(l.id)}</td>
                      <td>${esc(l.type)}</td>
                      <td>${esc(l.content)}</td>
                      <td>${esc(l.actor)}</td>
                      <td>${renderTag(l.result)}</td>
                    </tr>
                  `).join('') : `<tr><td colspan="6" style="text-align:center;color:#8ab4dc;padding:24px;">暂无匹配的日志记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${renderPager(rows.length, ui.logs.page, ui.logs.pageSize, '条记录')}
          </div>
        </div>

        <div class="m15-panel">
          <div class="m15-panel-head">
            <div class="m15-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="m15-panel-title">日志详情</span>
            </div>
          </div>
          <div class="m15-panel-body">
            ${active ? `
              <div class="m15-detail-hero">
                <div class="m15-detail-hero-left">
                  <div class="m15-resource-ico">${SVG.sliders}</div>
                  <div>
                    <div class="m15-detail-title">${active.id === 'LOG-20261126-033' ? '情报板内容下发' : esc(active.content)}</div>
                    <div class="m15-detail-code">${esc(active.id)}</div>
                  </div>
                </div>
                ${renderTag(active.result)}
              </div>
              <div class="m15-meta-grid-2">
                <div class="m15-meta-cell"><label>操作时间</label><div>${esc(active.date)} ${esc(active.time)}</div></div>
                <div class="m15-meta-cell"><label>操作模块</label><div>${esc(active.module)}</div></div>
                <div class="m15-meta-cell"><label>操作人</label><div>${esc(active.actor)}</div></div>
                <div class="m15-meta-cell"><label>授权人</label><div>${esc(active.grantor || '授权员C')}</div></div>
                <div class="m15-meta-cell"><label>${active.type === '设备指令' ? '关联发布单' : '关联单号'}</label><div>${esc(active.refDoc)}</div></div>
                <div class="m15-meta-cell"><label>内容版本</label><div>${esc(active.version)}</div></div>
              </div>
              <div class="m15-meta-single">
                <label>${active.type === '设备指令' ? '目标设备' : '作用对象'}</label>
                <div>${esc(active.target)}</div>
              </div>
              ${active.feedback ? `
                <div style="display:flex;align-items:center;justify-content:space-between;">
                  <span style="font-size:12.5px;font-weight:700;color:#dbeafe;">设备反馈</span>
                  <span style="font-size:11.5px;color:#8ab4dc;">截至 ${esc(active.feedbackTime || active.time)}</span>
                </div>
                <div class="m15-feedback-triple">
                  <div class="m15-feedback-cell"><span>已下发</span><strong class="m15-c-cyan">${active.feedback.sent}</strong></div>
                  <div class="m15-feedback-cell"><span>已接收</span><strong class="m15-c-blue">${active.feedback.received}</strong></div>
                  <div class="m15-feedback-cell"><span>已确认显示</span><strong class="m15-c-green">${active.feedback.confirmed}</strong></div>
                </div>
              ` : `
                <div class="m15-rules-box">
                  <div style="font-weight:700;color:#93c5fd;">归档与审计摘要</div>
                  <div>${esc(active.note)}</div>
                </div>
              `}
              <div style="font-size:12px;color:#cbd5e1;display:flex;align-items:center;gap:6px;">
                <span style="color:#4ade80;">✓</span>
                <span>${esc(active.note)}</span>
              </div>
              <div class="m15-panel-foot">
                <button class="m15-act-link" id="m15JumpPublishReview">查看发布单 &gt;</button>
                <button class="m15-act-link" id="m15JumpPublishReceipts">查看回执记录 &gt;</button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS & INTERACTIVE ACTIONS
     ------------------------------------------------------------------------ */
  function openImportBaseModal(ctx) {
    const html = `
      <div class="m15-form-grid">
        <div class="m15-field">
          <label>资料分类</label>
          <select class="m15-select" id="m15ImpCat">
            ${BASE_CATEGORIES.map(c => `<option value="${c}" ${ui.base.category === c ? 'selected' : ''}>${c}</option>`).join('')}
          </select>
        </div>
        <div class="m15-field">
          <label>所属工区</label>
          <select class="m15-select" id="m15ImpSec">
            ${Object.values(SECTION_MAP).map(s => `<option value="${s}">${s}</option>`).join('')}
          </select>
        </div>
        <div class="m15-field">
          <label>资料编码</label>
          <input class="m15-input" id="m15ImpCode" type="text" value="MB-A2-YD-${String(store.base['场站'].length + 1).padStart(2, '0')}" />
        </div>
        <div class="m15-field">
          <label>资料名称</label>
          <input class="m15-input" id="m15ImpName" type="text" placeholder="如：二工区临时材料场" />
        </div>
        <div class="m15-field">
          <label>资料类型</label>
          <input class="m15-input" id="m15ImpType" type="text" value="料场" />
        </div>
        <div class="m15-field">
          <label>中心桩号</label>
          <input class="m15-input" id="m15ImpStake" type="text" value="K32+600" />
        </div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15ImpCancel">取消</button>
        <button class="m15-btn-query" id="m15ImpConfirm">确认导入</button>
      </div>
    `;
    ctx.openModal('导入基础资料', html);
    setTimeout(() => {
      const cancelBtn = document.getElementById('m15ImpCancel');
      const okBtn = document.getElementById('m15ImpConfirm');
      if (cancelBtn) cancelBtn.onclick = () => ctx.closeModal();
      if (okBtn) {
        okBtn.onclick = () => {
          const cat = document.getElementById('m15ImpCat').value;
          const sec = document.getElementById('m15ImpSec').value;
          const code = document.getElementById('m15ImpCode').value.trim() || `MB-${Date.now().toString().slice(-4)}`;
          const name = document.getElementById('m15ImpName').value.trim() || `${sec}新增${cat}`;
          const type = document.getElementById('m15ImpType').value.trim() || cat;
          const stake = document.getElementById('m15ImpStake').value.trim() || 'K32+600';
          store.base[cat] = store.base[cat] || [];
          store.base[cat].unshift({
            code,
            name,
            type,
            section: sec,
            stake,
            status: '启用',
            updated: nowShortTime(),
            unit: `${sec}施工单位（演示）`,
            cam: `CAM-${code.slice(-4)}`
          });
          ui.base.category = cat;
          ui.base.page = 1;
          ui.base.selectedCode = code;
          addSystemLog('导入审核', `导入${cat} ${code}`, '管理员（演示）', '资料管理', '审核通过', '系统管理', `新增${cat}记录：${name}`);
          ctx.closeModal();
          ctx.showToast(`已导入 ${name} (${code}) 至【${cat}】目录`);
          rerender();
        };
      }
    }, 0);
  }

  function openResourcePreviewModal(ctx, kind, file, label) {
    const isGeo = kind === 'geojson';
    const svgContent = isGeo
      ? `<svg viewBox="0 0 560 210" style="width:100%;border-radius:8px;background:#04122b;border:1px solid rgba(56,189,248,0.35);">
          <defs><linearGradient id="m15RouteGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#0ea5e9"/><stop offset="100%" stop-color="#38f2ff"/></linearGradient></defs>
          <g stroke="rgba(56,189,248,0.12)" stroke-width="1">${[35, 70, 105, 140, 175].map(y => `<line x1="0" y1="${y}" x2="560" y2="${y}"/>`).join('')}${[80, 160, 240, 320, 400, 480].map(x => `<line x1="${x}" y1="0" x2="${x}" y2="210"/>`).join('')}</g>
          <polygon points="110,70 260,52 445,86 430,154 210,165 95,130" fill="rgba(14,165,233,0.12)" stroke="#38bdf8" stroke-dasharray="5 3" stroke-width="1.5"/>
          <path d="M35 162 Q 160 120, 280 105 T 525 58" fill="none" stroke="url(#m15RouteGrad)" stroke-width="4.5" stroke-linecap="round"/>
          <circle cx="280" cy="105" r="7" fill="#facc15" stroke="#ffffff" stroke-width="2"/>
          <rect x="292" y="88" width="128" height="24" rx="5" fill="rgba(6,22,54,0.9)" stroke="#38f2ff"/>
          <text x="302" y="104" fill="#f1f7ff" font-size="11" font-weight="700">K28+400 场站红线区</text>
          <text x="20" y="24" fill="#7dd3fc" font-size="11">EPSG:4490 (CGCS2000) · GeoJSON 矢量底图示意</text>
        </svg>`
      : `<svg viewBox="0 0 560 210" style="width:100%;border-radius:8px;background:#04122b;border:1px solid rgba(56,189,248,0.35);">
          <g stroke="#38f2ff" stroke-width="1.6" fill="rgba(56,189,248,0.14)">
            <polygon points="85,155 240,120 420,150 265,188" fill="rgba(14,165,233,0.18)"/>
            <rect x="130" y="75" width="76" height="62"/>
            <polygon points="130,75 168,52 244,52 206,75"/>
            <polygon points="206,75 244,52 244,114 206,137"/>
            <rect x="276" y="60" width="44" height="84" rx="5"/>
            <rect x="336" y="68" width="44" height="76" rx="5"/>
          </g>
          <text x="20" y="24" fill="#7dd3fc" font-size="11">IFC4 · LOD-350 场站建筑与料仓BIM模型线框示意</text>
          <text x="275" y="168" fill="#fde047" font-size="11" font-weight="700">料仓钢结构 + 拌合料斗构件树 (128个构件)</text>
        </svg>`;

    ctx.openModal(`${label} (${file})`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>资源编码</span><strong>${esc(file)}</strong></div>
        <div class="detail-stat-card"><span>格式标准</span><strong>${isGeo ? 'GeoJSON 2.0' : 'IFC 4.0'}</strong></div>
        <div class="detail-stat-card"><span>当前版本</span><strong>${isGeo ? 'V1.2' : 'V1.0'}</strong></div>
      </div>
      ${svgContent}
      <div class="m15-modal-foot">
        <button class="m15-btn-query" id="m15ResCloseBtn">关闭预览</button>
      </div>
    `);
    setTimeout(() => {
      const btn = document.getElementById('m15ResCloseBtn');
      if (btn) btn.onclick = () => ctx.closeModal();
    }, 0);
  }

  function openArchiveModal(ctx, active) {
    ctx.openModal(`档案详情 · ${active.name}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>编码</span><strong>${esc(active.code)}</strong></div>
        <div class="detail-stat-card"><span>所属工区</span><strong>${esc(active.section)}</strong></div>
        <div class="detail-stat-card"><span>中心桩号</span><strong>${esc(active.stake)}</strong></div>
      </div>
      <div class="m15-rules-box">
        <div><strong>名称：</strong>${esc(active.name)}（${esc(active.type)}）</div>
        <div><strong>参建单位：</strong>${esc(active.unit || '二工区施工单位（演示）')}</div>
        <div><strong>关联视频点位：</strong>${esc(active.cam || 'CAM-YD-A01')}</div>
        <div><strong>当前状态：</strong>${esc(active.status)}（更新于 2026-${esc(active.updated)}）</div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15ToggleBaseStatusBtn">切换状态（当前：${esc(active.status)}）</button>
        <button class="m15-btn-query" id="m15ArchiveCloseBtn">确定</button>
      </div>
    `);
    setTimeout(() => {
      const togBtn = document.getElementById('m15ToggleBaseStatusBtn');
      const okBtn = document.getElementById('m15ArchiveCloseBtn');
      if (togBtn) {
        togBtn.onclick = () => {
          active.status = active.status === '启用' ? '停用' : '启用';
          active.updated = nowShortTime();
          ctx.closeModal();
          ctx.showToast(`${active.name} 状态已变更为【${active.status}】`);
          rerender();
        };
      }
      if (okBtn) okBtn.onclick = () => ctx.closeModal();
    }, 0);
  }

  function openNewRoleModal(ctx) {
    ctx.openModal('新建权限角色', `
      <div class="m15-form-grid">
        <div class="m15-field"><label>角色名称</label><input class="m15-input" id="m15RoleName" type="text" placeholder="如：巡查督导员" /></div>
        <div class="m15-field"><label>数据范围</label><input class="m15-input" id="m15RoleScope" type="text" value="所属工区" /></div>
        <div class="m15-field full"><label>初始权限勾选</label>
          <div style="display:flex;gap:14px;flex-wrap:wrap;padding:6px 0;">
            ${store.rbac.permCols.map((p, i) => `<label style="display:inline-flex;align-items:center;gap:5px;color:#e2f0ff;font-size:12.5px;"><input type="checkbox" class="m15-role-perm-chk" value="${esc(p)}" ${i === 0 ? 'checked' : ''} /> ${esc(p)}</label>`).join('')}
          </div>
        </div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15RoleCancel">取消</button>
        <button class="m15-btn-query" id="m15RoleSave">创建角色</button>
      </div>
    `);
    setTimeout(() => {
      const c = document.getElementById('m15RoleCancel');
      const s = document.getElementById('m15RoleSave');
      if (c) c.onclick = () => ctx.closeModal();
      if (s) {
        s.onclick = () => {
          const name = document.getElementById('m15RoleName').value.trim() || `自定义角色${store.rbac.roles.length + 1}`;
          const scope = document.getElementById('m15RoleScope').value.trim() || '所属工区';
          const perms = {};
          store.rbac.permCols.forEach(p => { perms[p] = false; });
          document.querySelectorAll('.m15-role-perm-chk:checked').forEach(el => { perms[el.value] = true; });
          const newId = 'role_' + Date.now();
          store.rbac.roles.push({
            id: newId,
            name,
            scope,
            accountCount: 1,
            status: '启用',
            version: '自定义版本 V1.0',
            accessContent: '按角色权限矩阵动态控制可访问模块',
            perms,
            accounts: [{ id: `USR-${String(store.rbac.roles.length + 10)}`, name: `${name}演示账号`, status: '启用' }]
          });
          store.rbac.grants.unshift({ time: nowShortTime(), role: name, account: `${name}演示账号`, scope, grantor: '管理员（演示）' });
          ui.rbac.selectedRoleId = newId;
          addSystemLog('导入审核', `新建角色 ${name}`, '管理员（演示）', '资料管理', '审核通过', '用户权限', `创建角色 ${name}（${scope}）`);
          ctx.closeModal();
          ctx.showToast(`已新增角色【${name}】`);
          rerender();
        };
      }
    }, 0);
  }

  function openNewSystemModal(ctx) {
    ctx.openModal('登记专项接入系统', `
      <div class="m15-form-grid">
        <div class="m15-field"><label>系统名称</label><input class="m15-input" id="m15SysName" type="text" placeholder="如：边坡监测系统" /></div>
        <div class="m15-field"><label>接入编码</label><input class="m15-input" id="m15SysCode" type="text" value="SYS-SLOPE-01" /></div>
        <div class="m15-field"><label>更新频率</label><input class="m15-input" id="m15SysFreq" type="text" value="10分钟" /></div>
        <div class="m15-field"><label>初始接入状态</label>
          <select class="m15-select" id="m15SysStat">
            <option value="正常回传">正常回传</option>
            <option value="未接入" selected>未接入</option>
            <option value="无数据">无数据</option>
            <option value="离线">离线</option>
          </select>
        </div>
        <div class="m15-field full"><label>系统入口地址</label><input class="m15-input" id="m15SysUrl" type="text" value="https://slope.example.invalid/api/v1" /></div>
        <div class="m15-field full"><label>数据范围</label><input class="m15-input" id="m15SysScope" type="text" value="边坡位移、沉降观测与预警阈值" /></div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15SysCancel">取消</button>
        <button class="m15-btn-query" id="m15SysSave">确认登记</button>
      </div>
    `);
    setTimeout(() => {
      const c = document.getElementById('m15SysCancel');
      const s = document.getElementById('m15SysSave');
      if (c) c.onclick = () => ctx.closeModal();
      if (s) {
        s.onclick = () => {
          const name = document.getElementById('m15SysName').value.trim() || '边坡监测系统';
          const code = document.getElementById('m15SysCode').value.trim() || `SYS-${Date.now().toString().slice(-4)}`;
          const freq = document.getElementById('m15SysFreq').value.trim() || '10分钟';
          const status = document.getElementById('m15SysStat').value;
          const endpoint = document.getElementById('m15SysUrl').value.trim() || 'https://api.example.invalid/feed';
          const scope = document.getElementById('m15SysScope').value.trim() || '专项监测数据';
          store.integration.systems.push({
            code,
            name,
            scope,
            detailScope: scope,
            freq: status === '未接入' ? '—' : freq,
            lastResp: status === '未接入' ? '—' : new Date().toTimeString().slice(0, 5),
            lastRespFull: status === '未接入' ? '尚未配置完成' : nowFullTime(),
            status,
            endpoint,
            latencyMs: status === '正常回传' ? 45 : null,
            mappings: [
              { src: 'device_id', target: '设备编号', usage: '标识点位' },
              { src: 'work_area_code', target: '工区编码', usage: '关联工区' },
              { src: 'status_time', target: '状态时间', usage: '时点标记' }
            ],
            statusMap: [
              { label: 'ONLINE 在线', tone: 'green' },
              { label: 'OFFLINE 离线', tone: 'red' },
              { label: 'WARN 告警', tone: 'amber' }
            ]
          });
          ui.integration.selectedCode = code;
          ctx.closeModal();
          ctx.showToast(`已登记专项系统【${name} (${code})】`);
          rerender();
        };
      }
    }, 0);
  }

  function openNewMetricModal(ctx) {
    ctx.openModal('新增指标口径', `
      <div class="m15-form-grid">
        <div class="m15-field"><label>指标编码</label><input class="m15-input" id="m15MetNewCode" type="text" value="IDX-ENV-001" /></div>
        <div class="m15-field"><label>指标名称</label><input class="m15-input" id="m15MetNewName" type="text" placeholder="如：黑土表土剥离复垦率" /></div>
        <div class="m15-field"><label>业务模块</label>
          <select class="m15-select" id="m15MetNewMod">
            <option value="视频监控">视频监控</option>
            <option value="安全管理">安全管理</option>
            <option value="计量管理">计量管理</option>
            <option value="质量管理" selected>质量管理</option>
          </select>
        </div>
        <div class="m15-field"><label>统计单位</label><input class="m15-input" id="m15MetNewUnit" type="text" value="%" /></div>
        <div class="m15-field"><label>演示数值</label><input class="m15-input" id="m15MetNewVal" type="text" value="96.4" /></div>
        <div class="m15-field"><label>更新状态</label>
          <select class="m15-select" id="m15MetNewStat">
            <option value="正常更新">正常更新</option>
            <option value="待核对">待核对</option>
            <option value="待接入">待接入</option>
          </select>
        </div>
        <div class="m15-field full"><label>统计与去重规则</label><textarea class="m15-textarea" id="m15MetNewRule" rows="3">1. 取截止时点前有效监测数据。\n2. 按工区及监测编码去重统计。</textarea></div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15MetCancel">取消</button>
        <button class="m15-btn-query" id="m15MetSave">保存指标</button>
      </div>
    `);
    setTimeout(() => {
      const c = document.getElementById('m15MetCancel');
      const s = document.getElementById('m15MetSave');
      if (c) c.onclick = () => ctx.closeModal();
      if (s) {
        s.onclick = () => {
          const code = document.getElementById('m15MetNewCode').value.trim() || `IDX-${Date.now().toString().slice(-4)}`;
          const name = document.getElementById('m15MetNewName').value.trim() || '新建质量监测指标';
          const moduleName = document.getElementById('m15MetNewMod').value;
          const unit = document.getElementById('m15MetNewUnit').value.trim() || '项';
          const value = document.getElementById('m15MetNewVal').value.trim() || '12';
          const status = document.getElementById('m15MetNewStat').value;
          const ruleText = document.getElementById('m15MetNewRule').value.trim();
          store.metrics.items.push({
            code,
            name,
            module: moduleName,
            period: '2026年11月',
            periodFull: '2026-11-26 实时统计',
            unit,
            value,
            sourceSystem: `${moduleName}业务系统`,
            status,
            fields: 'record_id • work_area_code • stat_time',
            version: 'V1.0',
            rules: ruleText.split(/\n+/).filter(Boolean),
            anomalies: [{ time: nowShortTime(), source: code, type: '新建口径校验', handling: '初始规则已生效' }],
            history: [{ ver: 'V1.0', date: '2026-11-26', author: '管理员（演示）', note: '新增指标口径定义' }]
          });
          ui.metrics.selectedCode = code;
          ctx.closeModal();
          ctx.showToast(`已新增指标口径【${name} (${code})】`);
          rerender();
        };
      }
    }, 0);
  }

  function openMetricHistoryModal(ctx, active) {
    ctx.openModal(`规则版本记录 · ${active.name} (${active.code})`, `
      <table class="data-table">
        <thead><tr><th>版本号</th><th>发布日期</th><th>修订人</th><th>口径变更说明</th></tr></thead>
        <tbody>
          ${active.history.map(h => `
            <tr>
              <td class="m15-code-txt">${esc(h.ver)}</td>
              <td>${esc(h.date)}</td>
              <td>${esc(h.author)}</td>
              <td>${esc(h.note)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="m15-modal-foot">
        <button class="m15-btn-query" id="m15HistCloseBtn">关闭</button>
      </div>
    `);
    setTimeout(() => {
      const b = document.getElementById('m15HistCloseBtn');
      if (b) b.onclick = () => ctx.closeModal();
    }, 0);
  }

  function openEditContentModal(ctx, item) {
    ctx.openModal(`编辑展厅内容 · ${item.name}`, `
      <div class="m15-form-grid">
        <div class="m15-field"><label>内容名称</label><input class="m15-input" id="m15EditCntName" type="text" value="${esc(item.name)}" /></div>
        <div class="m15-field"><label>发布状态</label>
          <select class="m15-select" id="m15EditCntStatus">
            ${['已发布', '草稿', '待审核', '已归档'].map(st => `<option value="${st}" ${item.status === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </div>
        <div class="m15-field full"><label>素材 / 配置描述</label><input class="m15-input" id="m15EditCntMat" type="text" value="${esc(item.material)}" /></div>
        <div class="m15-field full"><label>展厅封面标题</label><input class="m15-input" id="m15EditCntTitle" type="text" value="${esc(item.overlayTitle)}" /></div>
        <div class="m15-field full"><label>内容摘要</label><textarea class="m15-textarea" id="m15EditCntSum" rows="3">${esc(item.summary)}</textarea></div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15EditCntCancel">取消</button>
        <button class="m15-btn-query" id="m15EditCntSave">保存修改</button>
      </div>
    `);
    setTimeout(() => {
      const c = document.getElementById('m15EditCntCancel');
      const s = document.getElementById('m15EditCntSave');
      if (c) c.onclick = () => ctx.closeModal();
      if (s) {
        s.onclick = () => {
          item.name = document.getElementById('m15EditCntName').value.trim() || item.name;
          item.status = document.getElementById('m15EditCntStatus').value;
          item.material = document.getElementById('m15EditCntMat').value.trim() || item.material;
          item.overlayTitle = document.getElementById('m15EditCntTitle').value.trim() || item.overlayTitle;
          item.summary = document.getElementById('m15EditCntSum').value.trim() || item.summary;
          ctx.closeModal();
          ctx.showToast(`已更新展厅内容【${item.name}】`);
          rerender();
        };
      }
    }, 0);
  }

  function openPreviewGalleryModal(ctx) {
    const list = getActiveVersionItems();
    const active = list.find(i => i.id === ui.content.selectedId) || list[0];
    ctx.openModal(`展厅大屏预览 · ${store.content.activeVersion}`, `
      <div class="m15-thumb-box" style="aspect-ratio:16/8.5;">
        <img src="${esc((active && active.img) || IMG.showcase)}" alt="${esc(active && active.name)}" />
        <span class="m15-thumb-badge">${esc(store.content.activeVersion)} · 演示视图</span>
        <div class="m15-preview-overlay">
          <div class="m15-preview-sub">${esc(active && active.overlaySub)}</div>
          <div class="m15-preview-title">${esc(active && active.overlayTitle)}</div>
        </div>
      </div>
      <div class="m15-rules-box">
        <div><strong>当前模块：</strong>${esc(active && active.name)}（${esc(active && active.type)}）</div>
        <div><strong>编排摘要：</strong>${esc(active && active.summary)}</div>
        <div><strong>汇报顺序：</strong>${list.map((i, idx) => `${idx + 1}.${esc(i.name)}`).join(' → ')}</div>
      </div>
      <div class="m15-modal-foot">
        <button class="m15-btn-query" id="m15PrevCloseBtn">退出展厅预览</button>
      </div>
    `);
    setTimeout(() => {
      const b = document.getElementById('m15PrevCloseBtn');
      if (b) b.onclick = () => ctx.closeModal();
    }, 0);
  }

  function openExportLogsModal(ctx, rows) {
    const csvLines = ['日志编号,日期,操作时间,事件类型,记录内容,操作人/来源,结果'];
    rows.slice(0, 12).forEach(r => {
      csvLines.push([r.id, r.date, r.time, r.type, r.content, r.actor, r.result].join(','));
    });
    const csvPreview = csvLines.join('\n');
    const jsonPreview = JSON.stringify(rows.slice(0, 5), null, 2);

    ctx.openModal(`导出日志记录（共 ${rows.length} 条）`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>筛选范围</span><strong>${esc(ui.logs.date || '全部日期')}</strong></div>
        <div class="detail-stat-card"><span>导出条数</span><strong>${rows.length} 条</strong></div>
        <div class="detail-stat-card"><span>支持格式</span><strong>CSV / JSON</strong></div>
      </div>
      <div style="font-size:12px;color:#93c5fd;font-weight:600;">CSV 导出预览（前 12 条）</div>
      <pre class="m15-pre" id="m15ExportPre">${esc(csvPreview)}</pre>
      <div class="m15-modal-foot">
        <button class="m15-btn-ghost" id="m15ExpToggleFmt">切换 JSON 预览</button>
        <button class="m15-btn-cyan" id="m15ExpDownloadCsv">${SVG.download} 下载 CSV 文件</button>
        <button class="m15-btn-query" id="m15ExpClose">关闭</button>
      </div>
    `);
    setTimeout(() => {
      let isJson = false;
      const togBtn = document.getElementById('m15ExpToggleFmt');
      const dlBtn = document.getElementById('m15ExpDownloadCsv');
      const closeBtn = document.getElementById('m15ExpClose');
      const pre = document.getElementById('m15ExportPre');
      if (togBtn && pre) {
        togBtn.onclick = () => {
          isJson = !isJson;
          pre.textContent = isJson ? jsonPreview : csvPreview;
          togBtn.textContent = isJson ? '切换 CSV 预览' : '切换 JSON 预览';
        };
      }
      if (dlBtn) {
        dlBtn.onclick = () => {
          try {
            const fullCsv = ['日志编号,日期,操作时间,事件类型,记录内容,操作人/来源,结果']
              .concat(rows.map(r => [r.id, r.date, r.time, r.type, r.content, r.actor, r.result].join(',')))
              .join('\n');
            const blob = new Blob(['\uFEFF' + fullCsv], { type: 'text/csv;charset=utf-8;' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `jihei-system-logs-${ui.logs.date || 'all'}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          } catch (e) { /* ignore fallback */ }
          ctx.showToast(`已导出 ${rows.length} 条日志归档记录 (CSV)`);
        };
      }
      if (closeBtn) closeBtn.onclick = () => ctx.closeModal();
    }, 0);
  }

  /* ------------------------------------------------------------------------
     EVENT BINDING
     ------------------------------------------------------------------------ */
  function bindEvents(hostEl, subPageId, ctx) {
    const retBtn = hostEl.querySelector('#m15ReturnHomeBtn');
    if (retBtn) retBtn.onclick = () => ctx.switchModule('home');

    if (subPageId === 'base') {
      const proj = hostEl.querySelector('#m15BaseProj');
      const sec = hostEl.querySelector('#m15BaseSec');
      const stat = hostEl.querySelector('#m15BaseStatus');
      const kw = hostEl.querySelector('#m15BaseKw');
      const qBtn = hostEl.querySelector('#m15BaseQuery');
      const rBtn = hostEl.querySelector('#m15BaseReset');
      const impBtn = hostEl.querySelector('#m15BaseImport');

      if (proj) proj.onchange = () => { ui.base.project = proj.value; rerender(); };
      if (sec) sec.onchange = () => { ui.base.section = sec.value; ui.base.page = 1; rerender(); };
      if (stat) stat.onchange = () => { ui.base.status = stat.value; ui.base.page = 1; rerender(); };
      if (qBtn) qBtn.onclick = () => { ui.base.keyword = kw ? kw.value : ''; ui.base.page = 1; rerender(); };
      if (kw) kw.onkeydown = e => { if (e.key === 'Enter') { ui.base.keyword = kw.value; ui.base.page = 1; rerender(); } };
      if (rBtn) rBtn.onclick = () => { ui.base.project = '明水至北安段'; ui.base.section = ''; ui.base.status = ''; ui.base.keyword = ''; ui.base.page = 1; rerender(); };
      if (impBtn) impBtn.onclick = () => openImportBaseModal(ctx);

      hostEl.querySelectorAll('[data-base-cat]').forEach(el => {
        el.onclick = () => {
          ui.base.category = el.dataset.baseCat;
          ui.base.page = 1;
          const list = store.base[ui.base.category] || [];
          ui.base.selectedCode = list[0] ? list[0].code : '';
          rerender();
        };
      });
      hostEl.querySelectorAll('[data-base-row]').forEach(tr => {
        tr.onclick = () => { ui.base.selectedCode = tr.dataset.baseRow; rerender(); };
      });
      hostEl.querySelectorAll('.m15-pg-btn').forEach(btn => {
        btn.onclick = () => {
          const p = Number(btn.dataset.pg);
          if (p >= 1) { ui.base.page = p; rerender(); }
        };
      });
      hostEl.querySelectorAll('[data-view-resource]').forEach(btn => {
        btn.onclick = () => openResourcePreviewModal(ctx, btn.dataset.viewResource, btn.dataset.file, btn.dataset.label);
      });
      const arcBtn = hostEl.querySelector('#m15ViewArchiveBtn');
      if (arcBtn) {
        arcBtn.onclick = () => {
          const rows = getFilteredBaseRows();
          const active = rows.find(r => r.code === ui.base.selectedCode) || rows[0];
          if (active) openArchiveModal(ctx, active);
        };
      }
    }

    if (subPageId === 'rbac') {
      const rSel = hostEl.querySelector('#m15RbacRoleSel');
      const sSel = hostEl.querySelector('#m15RbacStatusSel');
      const kw = hostEl.querySelector('#m15RbacKw');
      const qBtn = hostEl.querySelector('#m15RbacQuery');
      const rBtn = hostEl.querySelector('#m15RbacReset');
      const newBtn = hostEl.querySelector('#m15RbacNewBtn');

      if (rSel) rSel.onchange = () => { ui.rbac.roleFilter = rSel.value; rerender(); };
      if (sSel) sSel.onchange = () => { ui.rbac.statusFilter = sSel.value; rerender(); };
      if (qBtn) qBtn.onclick = () => { ui.rbac.keyword = kw ? kw.value : ''; rerender(); };
      if (kw) kw.onkeydown = e => { if (e.key === 'Enter') { ui.rbac.keyword = kw.value; rerender(); } };
      if (rBtn) rBtn.onclick = () => { ui.rbac.roleFilter = ''; ui.rbac.statusFilter = ''; ui.rbac.keyword = ''; rerender(); };
      if (newBtn) newBtn.onclick = () => openNewRoleModal(ctx);

      hostEl.querySelectorAll('[data-rbac-kpi]').forEach(card => {
        card.onclick = () => { ui.rbac.roleFilter = card.dataset.rbacKpi; rerender(); };
      });
      hostEl.querySelectorAll('[data-role-id]').forEach(tr => {
        tr.onclick = () => { ui.rbac.selectedRoleId = tr.dataset.roleId; rerender(); };
      });
      hostEl.querySelectorAll('[data-toggle-perm]').forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          const [roleId, permName] = btn.dataset.togglePerm.split('|');
          const role = store.rbac.roles.find(r => r.id === roleId);
          if (!role) return;
          role.perms[permName] = !role.perms[permName];
          const stateText = role.perms[permName] ? '已授权' : '已取消授权';
          store.rbac.grants.unshift({
            time: nowShortTime(),
            role: role.name,
            account: role.accounts[0] ? role.accounts[0].id : '角色策略',
            scope: `${permName}（${stateText}）`,
            grantor: '管理员（演示）'
          });
          ui.rbac.selectedRoleId = roleId;
          ctx.showToast(`${role.name} - ${permName}：${stateText}`);
          rerender();
        };
      });
      hostEl.querySelectorAll('[data-toggle-acc]').forEach(tr => {
        tr.onclick = () => {
          const [roleId, accId] = tr.dataset.toggleAcc.split('|');
          const role = store.rbac.roles.find(r => r.id === roleId);
          const acc = role && role.accounts.find(a => a.id === accId);
          if (!acc) return;
          acc.status = acc.status === '启用' ? '停用' : '启用';
          ctx.showToast(`账号 ${acc.id} (${acc.name}) 已${acc.status}`);
          rerender();
        };
      });
    }

    if (subPageId === 'integration') {
      const sSel = hostEl.querySelector('#m15IntSysSel');
      const stSel = hostEl.querySelector('#m15IntStatusSel');
      const kw = hostEl.querySelector('#m15IntKw');
      const qBtn = hostEl.querySelector('#m15IntQuery');
      const rBtn = hostEl.querySelector('#m15IntReset');
      const newBtn = hostEl.querySelector('#m15IntNewBtn');
      const testBtn = hostEl.querySelector('#m15TestConnBtn');

      if (sSel) sSel.onchange = () => { ui.integration.sysFilter = sSel.value; rerender(); };
      if (stSel) stSel.onchange = () => { ui.integration.statusFilter = stSel.value; rerender(); };
      if (qBtn) qBtn.onclick = () => { ui.integration.keyword = kw ? kw.value : ''; rerender(); };
      if (kw) kw.onkeydown = e => { if (e.key === 'Enter') { ui.integration.keyword = kw.value; rerender(); } };
      if (rBtn) rBtn.onclick = () => { ui.integration.sysFilter = ''; ui.integration.statusFilter = ''; ui.integration.keyword = ''; rerender(); };
      if (newBtn) newBtn.onclick = () => openNewSystemModal(ctx);

      hostEl.querySelectorAll('[data-int-kpi]').forEach(card => {
        card.onclick = () => { ui.integration.statusFilter = card.dataset.intKpi; rerender(); };
      });
      hostEl.querySelectorAll('[data-int-code]').forEach(tr => {
        tr.onclick = () => { ui.integration.selectedCode = tr.dataset.intCode; rerender(); };
      });
      if (testBtn) {
        testBtn.onclick = () => {
          const sys = store.integration.systems.find(s => s.code === ui.integration.selectedCode);
          if (!sys) return;
          if (sys.status === '未接入') {
            ctx.showToast(`${sys.name} (${sys.code}) 尚未配置接口凭证，状态仍为【未接入】`);
            return;
          }
          const timeNow = new Date().toTimeString().slice(0, 5);
          sys.lastResp = timeNow;
          sys.lastRespFull = `2026-11-26 ${timeNow}`;
          if (sys.status === '离线') {
            sys.status = '正常回传';
            sys.latencyMs = 54;
            addSystemLog('接口同步', `${sys.name} 重连恢复`, sys.name, sys.name, '同步成功', '系统接入', `连通性测试通过，响应延迟 ${sys.latencyMs}ms`);
            ctx.showToast(`连通性测试成功：${sys.name} 已恢复【正常回传】（延迟 54ms）`);
          } else {
            const ms = sys.latencyMs || 42;
            addSystemLog('接口同步', `检测 ${sys.code} 接口心跳`, sys.name, sys.name, '同步成功', '系统接入', `连通性测试通过（${ms}ms）`);
            ctx.showToast(`连通性测试通过：${sys.name} 响应正常（${ms}ms）`);
          }
          rerender();
        };
      }
    }

    if (subPageId === 'metrics') {
      const mSel = hostEl.querySelector('#m15MetModSel');
      const stSel = hostEl.querySelector('#m15MetStatusSel');
      const kw = hostEl.querySelector('#m15MetKw');
      const qBtn = hostEl.querySelector('#m15MetQuery');
      const rBtn = hostEl.querySelector('#m15MetReset');
      const newBtn = hostEl.querySelector('#m15MetNewBtn');
      const histBtn = hostEl.querySelector('#m15ViewMetricHistBtn');

      if (mSel) mSel.onchange = () => { ui.metrics.modFilter = mSel.value; rerender(); };
      if (stSel) stSel.onchange = () => { ui.metrics.statusFilter = stSel.value; rerender(); };
      if (qBtn) qBtn.onclick = () => { ui.metrics.keyword = kw ? kw.value : ''; rerender(); };
      if (kw) kw.onkeydown = e => { if (e.key === 'Enter') { ui.metrics.keyword = kw.value; rerender(); } };
      if (rBtn) rBtn.onclick = () => { ui.metrics.modFilter = ''; ui.metrics.statusFilter = ''; ui.metrics.keyword = ''; rerender(); };
      if (newBtn) newBtn.onclick = () => openNewMetricModal(ctx);

      hostEl.querySelectorAll('[data-met-kpi]').forEach(card => {
        card.onclick = () => { ui.metrics.statusFilter = card.dataset.metKpi; rerender(); };
      });
      hostEl.querySelectorAll('[data-met-code]').forEach(tr => {
        tr.onclick = () => { ui.metrics.selectedCode = tr.dataset.metCode; rerender(); };
      });
      if (histBtn) {
        histBtn.onclick = () => {
          const active = store.metrics.items.find(m => m.code === ui.metrics.selectedCode) || store.metrics.items[0];
          if (active) openMetricHistoryModal(ctx, active);
        };
      }
    }

    if (subPageId === 'content') {
      const vSel = hostEl.querySelector('#m15CntVerSel');
      const tSel = hostEl.querySelector('#m15CntTypeSel');
      const sSel = hostEl.querySelector('#m15CntStatusSel');
      const qBtn = hostEl.querySelector('#m15CntQuery');
      const rBtn = hostEl.querySelector('#m15CntReset');
      const prevBtn = hostEl.querySelector('#m15CntPreviewBtn');
      const saveBtn = hostEl.querySelector('#m15CntSaveBtn');

      if (vSel) {
        vSel.onchange = () => {
          store.content.activeVersion = vSel.value;
          const list = getActiveVersionItems();
          ui.content.selectedId = list[0] ? list[0].id : '';
          rerender();
        };
      }
      if (tSel) tSel.onchange = () => { ui.content.typeFilter = tSel.value; rerender(); };
      if (sSel) sSel.onchange = () => { ui.content.statusFilter = sSel.value; rerender(); };
      if (qBtn) qBtn.onclick = () => rerender();
      if (rBtn) rBtn.onclick = () => { ui.content.typeFilter = ''; ui.content.statusFilter = ''; rerender(); };
      if (prevBtn) prevBtn.onclick = () => openPreviewGalleryModal(ctx);
      if (saveBtn) {
        saveBtn.onclick = () => {
          addSystemLog('资料归档', `保存${store.content.activeVersion}编排`, '管理员（演示）', '资料管理', '已归档', '内容配置', `已保存 ${store.content.activeVersion} 展厅顺序与显示设置`);
          ctx.showToast(`已保存【${store.content.activeVersion}】展厅内容配置`);
        };
      }

      hostEl.querySelectorAll('[data-cnt-kpi]').forEach(card => {
        card.onclick = () => {
          const val = card.dataset.cntKpi;
          ui.content.typeFilter = ui.content.typeFilter === val ? '' : val;
          rerender();
        };
      });
      hostEl.querySelectorAll('[data-cnt-id]').forEach(tr => {
        tr.onclick = () => { ui.content.selectedId = tr.dataset.cntId; rerender(); };
        tr.ondragstart = () => { ui.content.dragId = tr.dataset.cntId; };
        tr.ondragover = e => { e.preventDefault(); };
        tr.ondrop = e => {
          e.preventDefault();
          const targetId = tr.dataset.cntId;
          const list = getActiveVersionItems();
          const fromIdx = list.findIndex(i => i.id === ui.content.dragId);
          const toIdx = list.findIndex(i => i.id === targetId);
          if (fromIdx >= 0 && toIdx >= 0 && fromIdx !== toIdx) {
            const [moved] = list.splice(fromIdx, 1);
            list.splice(toIdx, 0, moved);
            ui.content.selectedId = moved.id;
            ctx.showToast(`已调整【${moved.name}】展示顺序至第 ${toIdx + 1} 位`);
            rerender();
          }
          ui.content.dragId = null;
        };
      });
      hostEl.querySelectorAll('[data-move-cnt]').forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          const [id, deltaStr] = btn.dataset.moveCnt.split('|');
          const delta = Number(deltaStr);
          const list = getActiveVersionItems();
          const idx = list.findIndex(i => i.id === id);
          const targetIdx = idx + delta;
          if (idx >= 0 && targetIdx >= 0 && targetIdx < list.length) {
            const [moved] = list.splice(idx, 1);
            list.splice(targetIdx, 0, moved);
            ui.content.selectedId = moved.id;
            rerender();
          }
        };
      });
      hostEl.querySelectorAll('[data-edit-cnt]').forEach(btn => {
        btn.onclick = e => {
          e.stopPropagation();
          const item = getActiveVersionItems().find(i => i.id === btn.dataset.editCnt);
          if (item) openEditContentModal(ctx, item);
        };
      });
      hostEl.querySelectorAll('[data-switch-ver]').forEach(tr => {
        tr.onclick = () => {
          store.content.activeVersion = tr.dataset.switchVer;
          const list = getActiveVersionItems();
          ui.content.selectedId = list[0] ? list[0].id : '';
          rerender();
        };
      });
      hostEl.querySelectorAll('[data-preview-cnt]').forEach(btn => {
        btn.onclick = () => { ui.content.selectedId = btn.dataset.previewCnt; rerender(); };
      });
    }

    if (subPageId === 'logs') {
      const dInput = hostEl.querySelector('#m15LogDate');
      const tSel = hostEl.querySelector('#m15LogTypeSel');
      const sSel = hostEl.querySelector('#m15LogSrcSel');
      const kw = hostEl.querySelector('#m15LogKw');
      const qBtn = hostEl.querySelector('#m15LogQuery');
      const rBtn = hostEl.querySelector('#m15LogReset');
      const expBtn = hostEl.querySelector('#m15LogExport');
      const jRev = hostEl.querySelector('#m15JumpPublishReview');
      const jRec = hostEl.querySelector('#m15JumpPublishReceipts');

      if (tSel) tSel.onchange = () => { ui.logs.typeFilter = tSel.value; ui.logs.page = 1; rerender(); };
      if (sSel) sSel.onchange = () => { ui.logs.sourceFilter = sSel.value; ui.logs.page = 1; rerender(); };
      if (qBtn) {
        qBtn.onclick = () => {
          ui.logs.date = dInput ? dInput.value.trim() : '';
          ui.logs.keyword = kw ? kw.value : '';
          ui.logs.page = 1;
          rerender();
        };
      }
      if (kw) {
        kw.onkeydown = e => {
          if (e.key === 'Enter') {
            ui.logs.date = dInput ? dInput.value.trim() : '';
            ui.logs.keyword = kw.value;
            ui.logs.page = 1;
            rerender();
          }
        };
      }
      if (rBtn) {
        rBtn.onclick = () => {
          ui.logs.date = '2026-11-26';
          ui.logs.typeFilter = '';
          ui.logs.sourceFilter = '';
          ui.logs.keyword = '';
          ui.logs.page = 1;
          rerender();
        };
      }
      if (expBtn) expBtn.onclick = () => openExportLogsModal(ctx, getFilteredLogs());

      hostEl.querySelectorAll('[data-log-kpi]').forEach(card => {
        card.onclick = () => {
          ui.logs.typeFilter = card.dataset.logKpi;
          ui.logs.page = 1;
          rerender();
        };
      });
      hostEl.querySelectorAll('[data-log-id]').forEach(tr => {
        tr.onclick = () => { ui.logs.selectedId = tr.dataset.logId; rerender(); };
      });
      hostEl.querySelectorAll('.m15-pg-btn').forEach(btn => {
        btn.onclick = () => {
          const p = Number(btn.dataset.pg);
          if (p >= 1) { ui.logs.page = p; rerender(); }
        };
      });
      if (jRev) jRev.onclick = () => ctx.switchModule('publish', 'review');
      if (jRec) jRec.onclick = () => ctx.switchModule('publish', 'receipts');
    }
  }

  /* ------------------------------------------------------------------------
     RENDER & REGISTRATION
     ------------------------------------------------------------------------ */
  function renderSystemModule(hostEl, subPageId, ctx) {
    injectStyles();
    lastHostEl = hostEl;
    lastCtx = ctx;
    currentSubPage = subPageId || 'base';

    let bodyHtml = '';
    if (currentSubPage === 'base') bodyHtml = renderBasePage();
    else if (currentSubPage === 'rbac') bodyHtml = renderRbacPage();
    else if (currentSubPage === 'integration') bodyHtml = renderIntegrationPage();
    else if (currentSubPage === 'metrics') bodyHtml = renderMetricsPage();
    else if (currentSubPage === 'content') bodyHtml = renderContentPage();
    else if (currentSubPage === 'logs') bodyHtml = renderLogsPage();
    else bodyHtml = renderBasePage();

    hostEl.innerHTML = `<div class="m15-page">${renderBanner(currentSubPage)}${bodyHtml}</div>`;
    bindEvents(hostEl, currentSubPage, ctx);
  }

  window.JIHEI_PLATFORM.registerModule({
    id: 'system',
    name: '系统管理',
    subPages: [
      { id: 'base', name: '基础资料' },
      { id: 'rbac', name: '用户权限' },
      { id: 'integration', name: '系统接入' },
      { id: 'metrics', name: '指标口径' },
      { id: 'content', name: '内容配置' },
      { id: 'logs', name: '日志档案' }
    ],
    getCesiumMode() {
      return 'opaque';
    },
    render(hostEl, subPageId, ctx) {
      renderSystemModule(hostEl, subPageId, ctx);
    },
    onSectionChange(secId, subPageId) {
      if ((subPageId || currentSubPage) === 'base') {
        ui.base.section = secId && SECTION_MAP[secId] ? SECTION_MAP[secId] : '';
        ui.base.page = 1;
        rerender();
      }
    },
    onLeave() {
      if (lastHostEl) lastHostEl.innerHTML = '';
    }
  });
})();
