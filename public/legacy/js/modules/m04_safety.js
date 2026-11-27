/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   Module 4: 安全管理 (m04_safety.js)
   5 Subpages: 安全总览 | 风险点位 | 视频AI预警 | 隐患台账 | 整改复查
   ========================================================================== */
(function () {
  'use strict';

  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';
  const IMG = {
    corridor: ASSET_BASE + 'corridor_aerial.jpg',
    before: ASSET_BASE + 'milestone_before.jpg',
    after: ASSET_BASE + 'milestone_after.jpg',
    showcase: ASSET_BASE + 'showcase_viaduct.jpg'
  };

  const SECTION_META = [
    { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500', unit: '一工区施工单位' },
    { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200', unit: '二工区施工单位' },
    { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800', unit: '三工区施工单位' },
    { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000', unit: '四工区施工单位' },
    { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400', unit: '五工区施工单位' },
    { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800', unit: '六工区施工单位' }
  ];

  const SECTION_NAME_BY_ID = Object.fromEntries(SECTION_META.map(s => [s.id, s.name]));
  const RISK_CATEGORIES = ['高处作业', '起重吊装', '临边防护', '临时用电', '场内运输', '施工保通'];
  const AI_ALGORITHMS = ['安全帽佩戴识别', '人员闯入识别', '反光衣穿戴识别', '烟雾明火识别', '临边越界识别'];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const SVG = {
    pin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
    clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    warnTri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.6" fill="currentColor"/></svg>`,
    checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    camera: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="16 10 22 7 22 17 16 14"/></svg>`,
    xCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="9.5" y1="9.5" x2="14.5" y2="14.5"/><line x1="14.5" y1="9.5" x2="9.5" y2="14.5"/></svg>`,
    link: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    flag: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    volume: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 010 7"/></svg>`,
    mute: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="22" y2="15"/></svg>`,
    fullscreen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    doc: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
    drone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 7h5M14 7h5M7.5 7l2.5 5h4l2.5-5M8 17l2-5h4l2 5M9 12h6"/></svg>`,
    user: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20a8 8 0 0116 0"/></svg>`,
    bridge: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9h20M2 13h20M6 13v7M18 13v7M6 13a6 6 0 0112 0"/></svg>`,
    yard: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 20V8l9-5 9 5v12"/><path d="M7 20v-7h10v7"/></svg>`,
    road: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 20L9 4M19 20L15 4M12 7v3M12 13v4"/></svg>`,
    bolt: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    layers: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`
  };

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (.m04-* ONLY)
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('m04-styles')) return;
    const style = document.createElement('style');
    style.id = 'm04-styles';
    style.textContent = `
      .m04-page {
        width: 100%;
        min-height: 100%;
        padding: 12px 16px 26px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: var(--text-main);
      }
      .m04-page.m04-compact {
        padding: 8px 16px 12px;
        gap: 8px;
      }
      .m04-page.m04-compact .m04-filter-bar { padding: 6px 14px; }
      .m04-page.m04-compact .m04-panel-head { padding: 7px 14px; }
      .m04-page.m04-compact .m04-panel-body { padding: 9px 14px; }
      .m04-page.m04-compact .m04-kpi-card { padding: 8px 12px; }
      .m04-page.m04-compact .m04-table th,
      .m04-page.m04-compact .m04-table td { padding: 6.5px 10px; }
      .m04-page.m04-compact .m04-pager { padding-top: 7px; }
      .m04-foot-fab-clear { padding-right: 132px; }
      .m04-page.m04-risk-mode {
        height: 100%;
        overflow-y: auto;
        padding-bottom: 22px;
      }

      /* Filter Bar */
      .m04-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.82);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m04-filter-group {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .m04-filter-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m04-filter-item label {
        font-size: 12.5px;
        color: #cfe4ff;
        white-space: nowrap;
      }
      .m04-select, .m04-input {
        height: 30px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 36, 82, 0.86);
        color: #f1f7ff;
        font-size: 12.5px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m04-select { min-width: 118px; cursor: pointer; }
      .m04-select option { background: #0a2252; color: #ffffff; }
      .m04-select:focus, .m04-input:focus, .m04-textarea:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.3);
      }
      .m04-search-box {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m04-search-box svg {
        position: absolute;
        left: 9px;
        color: #789bc4;
        pointer-events: none;
      }
      .m04-search-box .m04-input {
        padding-left: 28px;
        width: 196px;
      }
      .m04-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m04-btn-query {
        height: 30px;
        padding: 0 16px;
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
      .m04-btn-query:hover { box-shadow: 0 0 18px rgba(56, 220, 255, 0.65); }
      .m04-btn-ghost {
        height: 30px;
        padding: 0 13px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(12, 42, 92, 0.65);
        color: #d8ecff;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        transition: all 0.18s;
      }
      .m04-btn-ghost:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(20, 72, 146, 0.78);
      }
      .m04-btn-gold {
        height: 32px;
        padding: 0 16px;
        border-radius: 7px;
        border: 1px solid rgba(250, 204, 21, 0.65);
        background: rgba(250, 204, 21, 0.12);
        color: #fde047;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.18s;
      }
      .m04-btn-gold:hover {
        background: rgba(250, 204, 21, 0.24);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
      }

      /* Panel Extensions */
      .m04-panel {
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.86) 0%, rgba(7, 23, 56, 0.84) 100%);
        border: 1px solid var(--border-cyan);
        border-radius: 10px;
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .m04-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
        gap: 10px;
      }
      .m04-panel-head-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m04-panel-sub {
        font-size: 12px;
        color: #8ab4dc;
        font-weight: 400;
      }
      .m04-panel-body {
        padding: 12px 14px;
        flex: 1;
        display: flex;
        flex-direction: column;
      }

      /* KPI Strips */
      .m04-kpi-grid-6 {
        display: grid;
        grid-template-columns: repeat(6, 1fr);
        gap: 12px;
      }
      .m04-kpi-grid-5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 12px;
      }
      .m04-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 9px;
        background: rgba(11, 39, 86, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.25);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m04-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        background: rgba(16, 54, 114, 0.78);
        transform: translateY(-1px);
      }
      .m04-kpi-ico {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m04-ico-cyan { background: rgba(34, 211, 238, 0.14); border: 1px solid rgba(34, 211, 238, 0.4); color: #38f2ff; }
      .m04-ico-blue { background: rgba(59, 130, 246, 0.16); border: 1px solid rgba(96, 165, 250, 0.45); color: #60a5fa; }
      .m04-ico-gold { background: rgba(250, 204, 21, 0.14); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15; }
      .m04-ico-green { background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(74, 222, 128, 0.45); color: #4ade80; }
      .m04-ico-red { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(251, 113, 133, 0.48); color: #fb7185; }

      .m04-kpi-label { font-size: 12px; color: #a9c6e8; margin-bottom: 2px; }
      .m04-kpi-val { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.15; }
      .m04-kpi-unit { font-size: 12px; font-weight: 500; color: #cbd5e1; margin-left: 3px; }
      .m04-c-cyan { color: #38f2ff; }
      .m04-c-gold { color: #fde047; }
      .m04-c-green { color: #4ade80; }
      .m04-c-red { color: #fb7185; }
      .m04-c-blue { color: #60a5fa; }

      /* Grids */
      .m04-mid-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 12px;
      }
      .m04-split-2 {
        display: grid;
        grid-template-columns: minmax(0, 2.05fr) minmax(300px, 0.95fr);
        gap: 12px;
        flex: 1;
        min-height: 0;
      }
      .m04-cols-3 {
        display: grid;
        grid-template-columns: minmax(250px, 0.95fr) minmax(0, 1.85fr) minmax(290px, 1.05fr);
        gap: 12px;
        flex: 1;
        min-height: 0;
      }

      /* Charts */
      .m04-donut-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        height: 100%;
        padding: 4px 6px;
      }
      .m04-legend-list {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m04-legend-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
      }
      .m04-legend-left {
        display: flex;
        align-items: center;
        gap: 8px;
        color: #dbeafe;
      }
      .m04-legend-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .m04-legend-right {
        display: flex;
        align-items: center;
        gap: 14px;
        font-variant-numeric: tabular-nums;
      }
      .m04-legend-num { color: #ffffff; font-weight: 700; min-width: 22px; text-align: right; }
      .m04-legend-pct { color: #8ab4dc; min-width: 42px; text-align: right; }

      /* Quick Tabs / Status Pills / Table */
      .m04-pill-tabs {
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .m04-pill-tab {
        padding: 3px 11px;
        border-radius: 99px;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: rgba(10, 34, 78, 0.62);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        transition: all 0.18s;
      }
      .m04-pill-tab:hover { border-color: var(--cyan); color: #ffffff; }
      .m04-pill-tab.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 600;
      }

      .m04-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m04-tag-amber { background: rgba(250, 204, 21, 0.14); color: #fde047; border: 1px solid rgba(250, 204, 21, 0.45); }
      .m04-tag-red { background: rgba(244, 63, 94, 0.16); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.48); }
      .m04-tag-blue { background: rgba(56, 189, 248, 0.16); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.45); }
      .m04-tag-green { background: rgba(34, 197, 94, 0.16); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.45); }

      .m04-table-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .m04-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .m04-table th, .m04-table td {
        padding: 8px 10px;
        text-align: left;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        white-space: nowrap;
      }
      .m04-table th {
        color: #8eb8e5;
        background: rgba(11, 38, 86, 0.55);
        font-weight: 600;
      }
      .m04-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m04-table tbody tr:hover {
        background: rgba(22, 74, 150, 0.35);
      }
      .m04-table tbody tr.m04-row-selected {
        background: rgba(22, 119, 255, 0.22);
        box-shadow: inset 2px 0 0 #38f2ff;
      }
      .m04-act-link {
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
      .m04-act-link:hover {
        color: #ffffff;
        background: rgba(56, 189, 248, 0.22);
      }

      /* Pagination */
      .m04-pager {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-top: auto;
        padding-top: 10px;
        font-size: 12px;
        color: #93c5fd;
      }
      .m04-pager-info { margin-right: 6px; }
      .m04-pg-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(10, 34, 78, 0.7);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .m04-pg-btn:hover:not(:disabled) { border-color: var(--cyan); color: #fff; }
      .m04-pg-btn.active {
        background: #1677ff;
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m04-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Activity Feed */
      .m04-feed-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m04-feed-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.18);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m04-feed-item:hover {
        border-color: rgba(56, 220, 255, 0.5);
        background: rgba(18, 60, 128, 0.65);
      }
      .m04-feed-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m04-feed-title {
        font-size: 13px;
        font-weight: 600;
        color: #f1f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m04-feed-sub {
        font-size: 11.5px;
        color: #8ab4dc;
        margin-top: 2px;
        font-variant-numeric: tabular-nums;
      }
      .m04-panel-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: auto;
        padding-top: 10px;
        font-size: 11.5px;
        color: #789bc4;
      }
      .m04-text-link {
        background: none;
        border: none;
        color: #38bdf8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
      }
      .m04-text-link:hover { color: #7dd3fc; text-decoration: underline; }

      /* Risk Point Cards & Distribution */
      .m04-card-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m04-list-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(11, 39, 86, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.22);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m04-list-card:hover {
        border-color: rgba(56, 220, 255, 0.55);
        background: rgba(18, 60, 128, 0.72);
      }
      .m04-list-card.active {
        border-color: #38f2ff;
        background: linear-gradient(90deg, rgba(16, 86, 176, 0.62), rgba(10, 44, 96, 0.72));
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.28);
      }
      .m04-card-ico {
        width: 34px;
        height: 34px;
        border-radius: 7px;
        background: rgba(14, 52, 112, 0.75);
        border: 1px solid rgba(56, 189, 248, 0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7dd3fc;
        flex-shrink: 0;
      }
      .m04-card-main { flex: 1; min-width: 0; }
      .m04-card-title { font-size: 13px; font-weight: 700; color: #ffffff; }
      .m04-card-sub { font-size: 11.5px; color: #9ec0e6; margin-top: 2px; }

      .m04-dist-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }
      .m04-dist-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 12px;
        border-radius: 7px;
        background: rgba(11, 39, 86, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.2);
        font-size: 12.5px;
      }

      /* Risk Distribution Map Stage */
      .m04-map-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 8px;
        font-size: 12px;
      }
      .m04-chk-group {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .m04-chk {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        color: #e2f0ff;
      }
      .m04-chk input { accent-color: #1677ff; cursor: pointer; }
      .m04-map-frame {
        position: relative;
        flex: 1;
        min-height: 360px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: #061734;
      }
      .m04-map-frame img.m04-map-bg {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        filter: saturate(1.06) brightness(0.92);
      }
      .m04-map-pin {
        position: absolute;
        transform: translate(-50%, -100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
        z-index: 6;
      }
      .m04-map-pin:hover { z-index: 18; }
      .m04-map-pin.selected { z-index: 12; }
      .m04-map-pin.selected:hover { z-index: 20; }
      .m04-map-label {
        padding: 2px 8px;
        border-radius: 5px;
        background: rgba(7, 25, 58, 0.9);
        border: 1px solid rgba(250, 204, 21, 0.65);
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 3px 10px rgba(0, 8, 24, 0.65);
        text-align: center;
        transition: all 0.16s ease;
      }
      .m04-map-pin-name {
        display: none;
        margin-left: 5px;
        font-weight: 600;
      }
      .m04-map-pin:hover .m04-map-pin-name,
      .m04-map-pin.selected .m04-map-pin-name {
        display: inline;
      }
      .m04-map-pin:hover .m04-map-label {
        padding: 4px 10px;
        font-size: 12px;
        border-color: #fde047;
      }
      .m04-map-pin.selected .m04-map-label {
        background: linear-gradient(180deg, rgba(14, 96, 198, 0.94), rgba(8, 52, 128, 0.94));
        border-color: #38f2ff;
        padding: 5px 12px;
        font-size: 12.5px;
        box-shadow: 0 0 18px rgba(56, 242, 255, 0.68);
      }
      .m04-map-sec-chip {
        display: inline-block;
        margin-top: 3px;
        padding: 1px 8px;
        border-radius: 4px;
        background: rgba(6, 24, 58, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.55);
        font-size: 11px;
        font-weight: 500;
        color: #bae6fd;
      }
      .m04-pin-dot {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        margin-top: 4px;
        border: 2px solid #ffffff;
        background: #facc15;
        box-shadow: 0 0 10px #facc15;
      }
      .m04-map-pin.selected .m04-pin-dot {
        width: 16px;
        height: 16px;
        background: #38f2ff;
        box-shadow: 0 0 0 6px rgba(56, 242, 255, 0.25), 0 0 16px #38f2ff;
      }
      .m04-pin-hazard {
        position: absolute;
        transform: translate(-50%, -50%);
        padding: 2px 7px;
        border-radius: 99px;
        background: rgba(190, 18, 60, 0.9);
        border: 1px solid #fda4af;
        color: #fff;
        font-size: 10.5px;
        font-weight: 600;
        z-index: 5;
        cursor: pointer;
        white-space: nowrap;
      }
      .m04-pin-cam {
        position: absolute;
        transform: translate(-50%, -50%);
        padding: 2px 7px;
        border-radius: 6px;
        background: rgba(8, 47, 73, 0.92);
        border: 1px solid #38bdf8;
        color: #bae6fd;
        font-size: 10.5px;
        z-index: 5;
        cursor: pointer;
        white-space: nowrap;
      }
      .m04-map-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 8px;
        font-size: 12px;
        color: #8ab4dc;
      }

      /* Archive / Form Controls */
      .m04-kv-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
        margin-bottom: 10px;
      }
      .m04-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 12.5px;
      }
      .m04-kv-row span:first-child { color: #8ab4dc; flex-shrink: 0; }
      .m04-kv-row strong, .m04-kv-row span:last-child { color: #f1f7ff; text-align: right; }

      .m04-measures-box {
        padding: 9px 11px;
        border-radius: 8px;
        background: rgba(10, 34, 78, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.22);
        margin-bottom: 10px;
      }
      .m04-measures-title { font-size: 12px; color: #dbeafe; font-weight: 600; margin-bottom: 6px; }
      .m04-chip-row { display: flex; flex-wrap: wrap; gap: 6px; }
      .m04-chip {
        padding: 3px 8px;
        border-radius: 5px;
        background: rgba(16, 52, 110, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.28);
        color: #bae6fd;
        font-size: 11px;
      }

      .m04-video-box {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: #05132b;
        aspect-ratio: 16 / 9;
        cursor: pointer;
      }
      .m04-video-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .m04-video-tag {
        position: absolute;
        right: 8px;
        bottom: 8px;
        padding: 2px 8px;
        border-radius: 4px;
        background: rgba(4, 15, 36, 0.8);
        color: #e2f0ff;
        font-size: 11px;
      }
      .m04-linked-box {
        padding: 9px 11px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        margin: 10px 0;
      }
      .m04-btn-pair {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
      }

      /* AI Evidence Stage */
      .m04-evidence-frame {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9.2;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: #041026;
      }
      .m04-evidence-frame img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .m04-cam-hud {
        position: absolute;
        top: 8px;
        left: 10px;
        right: 10px;
        display: flex;
        justify-content: space-between;
        pointer-events: none;
      }
      .m04-hud-pill {
        padding: 3px 9px;
        border-radius: 5px;
        background: rgba(4, 14, 34, 0.78);
        color: #f8fafc;
        font-size: 11.5px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .m04-detect-box {
        position: absolute;
        border: 2px solid #facc15;
        background: rgba(250, 204, 21, 0.08);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.45);
        pointer-events: none;
      }
      .m04-detect-label {
        position: absolute;
        left: 50%;
        bottom: calc(100% + 6px);
        transform: translateX(-50%);
        padding: 4px 10px;
        border-radius: 5px;
        background: rgba(12, 24, 48, 0.9);
        border: 1px solid #facc15;
        color: #fde047;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
      }
      .m04-player-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        margin-top: 8px;
        border-radius: 7px;
        background: rgba(6, 22, 54, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .m04-thumbs-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin-top: 8px;
      }
      .m04-thumb-card {
        border-radius: 7px;
        overflow: hidden;
        border: 1.5px solid rgba(56, 189, 248, 0.28);
        background: rgba(8, 28, 64, 0.7);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m04-thumb-card.active {
        border-color: #38f2ff;
        box-shadow: 0 0 12px rgba(56, 242, 255, 0.45);
      }
      .m04-thumb-card img { width: 100%; height: 64px; object-fit: cover; display: block; }
      .m04-thumb-time {
        text-align: center;
        font-size: 11px;
        padding: 3px 0;
        color: #cfe4ff;
        font-variant-numeric: tabular-nums;
      }

      /* Form Rows */
      .m04-form-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
        margin-bottom: 10px;
      }
      .m04-form-row-inline {
        display: grid;
        grid-template-columns: 78px 1fr;
        align-items: center;
        gap: 10px;
        margin-bottom: 9px;
      }
      .m04-form-row-inline label, .m04-form-field label {
        font-size: 12px;
        color: #8ab4dc;
      }
      .m04-textarea {
        width: 100%;
        min-height: 68px;
        padding: 8px 10px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(8, 28, 66, 0.85);
        color: #f1f7ff;
        font-size: 12.5px;
        font-family: inherit;
        resize: vertical;
        outline: none;
      }

      /* Review 5-Step Flow */
      .m04-steps-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 10px;
      }
      .m04-step-card {
        flex: 1;
        padding: 9px 12px;
        border-radius: 8px;
        background: rgba(11, 39, 86, 0.68);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .m04-step-card.done { border-color: rgba(74, 222, 128, 0.48); }
      .m04-step-card.current {
        border-color: rgba(250, 204, 21, 0.78);
        background: rgba(68, 52, 16, 0.34);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.22);
      }
      .m04-step-arrow { color: #648cb8; font-size: 14px; flex-shrink: 0; }

      .m04-compare-2col {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
      }
      .m04-photo-box {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.32);
        aspect-ratio: 16 / 8.8;
        cursor: pointer;
        background: #06152d;
      }
      .m04-photo-box img { width: 100%; height: 100%; object-fit: cover; display: block; }
      .m04-photo-caption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #cfe4ff;
        margin-bottom: 5px;
      }
      .m04-defect-rect {
        position: absolute;
        right: 12%;
        bottom: 18%;
        width: 34%;
        height: 36%;
        border: 2px dashed #facc15;
        border-radius: 4px;
        background: rgba(250, 204, 21, 0.1);
        pointer-events: none;
      }
      .m04-guardrail-bar {
        position: absolute;
        left: 20%;
        right: 8%;
        bottom: 24%;
        height: 8px;
        border-radius: 3px;
        background: repeating-linear-gradient(90deg, #ef4444 0 12px, #ffffff 12px 24px);
        box-shadow: 0 0 8px rgba(34, 197, 94, 0.75);
        pointer-events: none;
      }
      .m04-review-banner {
        padding: 9px 12px;
        border-radius: 8px;
        background: rgba(20, 83, 45, 0.35);
        border: 1px solid rgba(74, 222, 128, 0.45);
        color: #86efac;
        font-size: 12.5px;
        display: flex;
        align-items: center;
        gap: 7px;
      }
      .m04-page.m04-compact .m04-evidence-frame {
        height: 336px;
        aspect-ratio: auto;
      }
      .m04-page.m04-compact .m04-player-bar {
        padding: 6px 10px;
        margin-top: 6px;
      }
      .m04-page.m04-compact .m04-thumbs-grid {
        margin-top: 6px;
        gap: 8px;
      }
      .m04-page.m04-compact .m04-thumb-card img {
        height: 54px;
      }
      .m04-page.m04-compact .m04-steps-row {
        margin-top: 6px;
      }
      .m04-page.m04-compact .m04-step-card {
        padding: 6px 10px;
      }
      .m04-page.m04-compact .m04-review-photos .m04-photo-box {
        height: 180px;
        aspect-ratio: auto;
      }
      .m04-page.m04-compact .m04-form-row-inline {
        margin-bottom: 6px;
      }
      .m04-page.m04-compact .m04-review-note {
        min-height: 44px;
        height: 44px;
      }

      @media (max-width: 1300px) {
        .m04-kpi-grid-6 { grid-template-columns: repeat(3, 1fr); }
        .m04-kpi-grid-5 { grid-template-columns: repeat(3, 1fr); }
        .m04-mid-grid-3 { grid-template-columns: 1fr; }
        .m04-split-2, .m04-cols-3 { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     GENUINE STATEFUL DATA INITIALIZATION
     ------------------------------------------------------------------------ */
  function createInitialRiskPoints() {
    return [
      {
        id: 'R-01', name: '材料场A', secId: 'sec1', category: '场内运输', level: '一般',
        location: '材料场A · 东侧主干道', unit: '一工区施工单位', x: 22, y: 84,
        status: '管控中', measures: ['限速15km/h标识', '人车分流通道', '夜间反光警示'],
        linkedHazardId: 'AQ-202611-032', imgKey: 'before', camCode: 'CAM-CL-A01'
      },
      {
        id: 'R-02', name: '桥梁示例A', secId: 'sec2', category: '高处作业', level: '较大',
        location: '桥梁示例A·2号墩', unit: '二工区施工单位', x: 50, y: 64,
        status: '管控中', measures: ['检查临边防护', '检查作业区围护', '核查人员防护'],
        linkedHazardId: 'AQ-202611-018', imgKey: 'after', camCode: 'CAM-QL-A01'
      },
      {
        id: 'R-03', name: '梁场示例A', secId: 'sec2', category: '起重吊装', level: '较大',
        location: '梁场示例A·龙门吊区', unit: '二工区施工单位', x: 24, y: 41,
        status: '管控中', measures: ['核查吊具索具', '划定吊装警戒区', '持证上岗核验'],
        linkedHazardId: 'AQ-202611-039', imgKey: 'corridor', camCode: 'CAM-LC-A03'
      },
      {
        id: 'R-04', name: '路面示例段', secId: 'sec3', category: '施工保通', level: '一般',
        location: 'K54+120 路面作业区', unit: '三工区施工单位', x: 80, y: 34,
        status: '管控中', measures: ['封闭施工围挡', '专职安全员疏导', '反光锥桶布设'],
        linkedHazardId: 'AQ-202611-035', imgKey: 'showcase', camCode: 'CAM-LM-B02'
      },
      {
        id: 'R-05', name: '拌合站示例A', secId: 'sec4', category: '临时用电', level: '一般',
        location: 'K78+400 拌合站配电房', unit: '四工区施工单位', x: 61, y: 20,
        status: '管控中', measures: ['三级配电两级保护', '一机一闸一漏保', '绝缘接地巡检'],
        linkedHazardId: 'AQ-202611-026', imgKey: 'showcase', camCode: 'CAM-BH-D04'
      },
      {
        id: 'R-06', name: '跨河特大桥深基坑', secId: 'sec2', category: '高处作业', level: '重大',
        location: 'K31+850 主墩承台基坑', unit: '二工区施工单位', x: 30, y: 60,
        status: '重点盯控', measures: ['基坑临边硬质围挡', '边坡位移自动化监测', '抽排水应急电源'],
        linkedHazardId: 'AQ-202611-029', imgKey: 'before', camCode: 'CAM-QL-B02'
      },
      {
        id: 'R-07', name: 'K18高边坡锚固区', secId: 'sec1', category: '临边防护', level: '较大',
        location: 'K18+400 右侧路堑边坡', unit: '一工区施工单位', x: 43, y: 90,
        status: '管控中', measures: ['平台防落石网', '安全绳双钩挂设', '雨后边坡巡查'],
        linkedHazardId: 'AQ-202611-011', imgKey: 'corridor', camCode: 'CAM-LJ-A02'
      },
      {
        id: 'R-08', name: '三工区存梁台座区', secId: 'sec3', category: '起重吊装', level: '一般',
        location: 'K62+300 预制梁场', unit: '三工区施工单位', x: 47, y: 38,
        status: '管控中', measures: ['运梁车声光报警', '支垫稳固核查', '防倾覆斜撑'],
        linkedHazardId: 'AQ-202611-024', imgKey: 'after', camCode: 'CAM-LC-B01'
      },
      {
        id: 'R-09', name: '四工区施工便道口', secId: 'sec4', category: '施工保通', level: '一般',
        location: 'K82+150 省道交叉口', unit: '四工区施工单位', x: 66, y: 46,
        status: '管控中', measures: ['爆闪警示灯', '减速带设置', '专人指挥放行'],
        linkedHazardId: 'AQ-202611-040', imgKey: 'corridor', camCode: 'CAM-BD-D01'
      },
      {
        id: 'R-10', name: '五工区钢筋加工棚', secId: 'sec5', category: '临时用电', level: '低风险',
        location: 'K104+200 加工车间', unit: '五工区施工单位', x: 44, y: 18,
        status: '正常受控', measures: ['机械防护罩完好', '电箱防雨棚', '消防器材点检'],
        linkedHazardId: 'AQ-202611-009', imgKey: 'after', camCode: 'CAM-GJ-E01'
      },
      {
        id: 'R-11', name: '五工区弃土场便道', secId: 'sec5', category: '场内运输', level: '低风险',
        location: 'K112+500 运输便道', unit: '五工区施工单位', x: 76, y: 17,
        status: '正常受控', measures: ['道路洒水降尘', '错车道警示牌', '限载限速巡查'],
        linkedHazardId: 'AQ-202611-007', imgKey: 'before', camCode: 'CAM-YS-E02'
      },
      {
        id: 'R-12', name: '六工区建华互通匝道', secId: 'sec6', category: '临边防护', level: '低风险',
        location: 'K138+600 互通现浇箱梁', unit: '六工区施工单位', x: 90, y: 18,
        status: '正常受控', measures: ['支架验收挂牌', '作业面满铺脚手板', '安全网封闭'],
        linkedHazardId: 'AQ-202611-003', imgKey: 'showcase', camCode: 'CAM-HT-F01'
      }
    ];
  }

  function createInitialHazards() {
    // Strictly calibrated for 2026-11:
    // Total 40: 待派发 4, 整改中 6 (2 overdue), 待复查 3, 已销项 27 (unclosed = 13)
    // Unclosed by section: sec1=3, sec2=5, sec3=3, sec4=2, sec5=0, sec6=0
    // Sources across 40: 人工巡查=15, 视频AI=16, 无人机巡检=9
    const rows = [
      // --- 13 UNCLOSED HAZARDS (in priority display order matching screenshots) ---
      { id: 'AQ-202611-039', period: '2026-11', secId: 'sec2', location: '二工区 · 梁场示例A·钢筋加工区', source: '人工巡查', category: '高处作业', desc: '人员防护缺项', level: '一般隐患', due: '2026-11-26', dueFull: '2026-11-26 17:00', status: '待派发', overdue: false, foundAt: '2026-11-24 08:30', owner: '整改负责人A（演示）', req: '补齐个人防护用品，整改后上传现场照片。', beforeNote: '钢筋加工区作业人员未规范佩戴安全帽及绝缘手套。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-032', period: '2026-11', secId: 'sec1', location: '一工区 · 材料场A', source: '人工巡查', category: '场内运输', desc: '场内通道占用', level: '一般隐患', due: '2026-11-23', dueFull: '2026-11-23 17:00', status: '整改中', overdue: true, foundAt: '2026-11-20 14:10', owner: '整改负责人B（演示）', req: '清理场内通道堆放钢筋物料，恢复应急车辆通行净宽。', beforeNote: '临时堆料占用消防与运输主通道约1.5米。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-035', period: '2026-11', secId: 'sec3', location: '三工区 · 路面作业区', source: '视频AI', category: '施工保通', desc: '人员防护缺项', level: '一般隐患', due: '2026-11-23', dueFull: '2026-11-23 17:00', status: '整改中', overdue: true, foundAt: '2026-11-21 09:40', owner: '安全员张伟', req: '作业人员全员穿戴高可视反光背心并设置隔离锥桶。', beforeNote: '视频AI抓拍到路面辅助人员未穿反光衣进入摊铺作业区。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-018', period: '2026-11', secId: 'sec2', location: '二工区 · 桥梁示例A·2号墩', source: '无人机巡检', category: '临边防护', desc: '临边防护缺失', level: '一般隐患', due: '2026-11-25', dueFull: '2026-11-25 17:00', status: '待复查', overdue: false, foundAt: '2026-11-21 10:18', dispatchedAt: '2026-11-21 10:46', feedbackAt: '2026-11-23 16:20', owner: '整改负责人A（演示）', req: '立即补齐2号墩作业平台红白警示临边防护栏杆及踢脚板。', beforeNote: '无人机正射巡检发现2号墩盖梁作业平台外侧缺少临边防护栏杆。', afterNote: '已补齐2号墩临边防护，上传现场照片，申请复查。', reviewer: '监理复查人员A（演示）', reviewTime: '2026-11-25 10:20', reviewNote: '临边防护已补齐，现场复查情况见附件。', attachment: '复查现场照片.jpg' },
      { id: 'AQ-202611-026', period: '2026-11', secId: 'sec4', location: '四工区 · 拌合站示例A', source: '人工巡查', category: '临时用电', desc: '临时用电标识缺失', level: '一般隐患', due: '2026-11-26', dueFull: '2026-11-26 17:00', status: '待复查', overdue: false, foundAt: '2026-11-22 11:05', dispatchedAt: '2026-11-22 11:30', feedbackAt: '2026-11-24 10:22', owner: '电工班长刘涛', req: '张贴配电箱警示标识及责任人信息卡，并锁闭箱门。', beforeNote: '二级配电箱缺少触电警示标识与巡检记录卡。', afterNote: '已张贴标准电力安全警示标识并完成接线复检。', reviewer: '监理复查人员A（演示）', reviewTime: '2026-11-25 10:00', reviewNote: '警示牌与箱门锁具已完善，待最终确认销项。', attachment: '配电箱整改复查.jpg' },
      { id: 'AQ-202611-040', period: '2026-11', secId: 'sec4', location: '四工区 · 施工便道口', source: '视频AI', category: '施工保通', desc: '警示标识缺失', level: '一般隐患', due: '2026-11-27', dueFull: '2026-11-27 17:00', status: '待派发', overdue: false, foundAt: '2026-11-24 15:20', owner: '整改负责人B（演示）', req: '便道交叉口补设夜间反光限速标志及爆闪灯。', beforeNote: '视频监控发现施工便道入口处临时警示牌倾倒缺失。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-038', period: '2026-11', secId: 'sec1', location: '一工区 · K18+400 路基边坡', source: '无人机巡检', category: '临边防护', desc: '高边坡截水沟临边警示绳破损', level: '一般隐患', due: '2026-11-27', dueFull: '2026-11-27 17:00', status: '待派发', overdue: false, foundAt: '2026-11-24 14:05', owner: '整改负责人A（演示）', req: '更换破损安全警戒绳并加固立杆。', beforeNote: '无人机巡检发现东侧边坡顶部警戒带断裂约12米。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-037', period: '2026-11', secId: 'sec3', location: '三工区 · 预制梁存梁区', source: '视频AI', category: '起重吊装', desc: '龙门吊吊装作业区警示线模糊', level: '一般隐患', due: '2026-11-28', dueFull: '2026-11-28 17:00', status: '待派发', overdue: false, foundAt: '2026-11-24 11:45', owner: '安全员张伟', req: '重新施划吊装作业安全警戒线并配置声光提示器。', beforeNote: 'AI识别作业区边界反光漆磨损严重。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-029', period: '2026-11', secId: 'sec2', location: '二工区 · 跨河特大桥深基坑', source: '人工巡查', category: '高处作业', desc: '基坑上下爬梯扶手松动', level: '重大隐患', due: '2026-11-26', dueFull: '2026-11-26 17:00', status: '整改中', overdue: false, foundAt: '2026-11-22 15:40', owner: '整改负责人A（演示）', req: '立即加固钢爬梯锚栓并增设防坠器。', beforeNote: '基坑南侧人员上下梯笼顶部连接螺栓松动。', afterNote: '', reviewer: '监理复查人员B（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-030', period: '2026-11', secId: 'sec2', location: '二工区 · 桥梁示例A·3号墩', source: '视频AI', category: '高处作业', desc: '高处作业安全带未高挂低用', level: '一般隐患', due: '2026-11-27', dueFull: '2026-11-27 17:00', status: '整改中', overdue: false, foundAt: '2026-11-23 09:15', owner: '整改负责人A（演示）', req: '现场班前再教育并增设独立生命绳。', beforeNote: '视频AI抓拍作业人员安全带挂点偏低。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-031', period: '2026-11', secId: 'sec1', location: '一工区 · 涵洞施工点', source: '视频AI', category: '临时用电', desc: '移动电缆线拖地未架空', level: '一般隐患', due: '2026-11-27', dueFull: '2026-11-27 17:00', status: '整改中', overdue: false, foundAt: '2026-11-23 14:25', owner: '电工班长刘涛', req: '使用绝缘支架架空敷设或穿管保护。', beforeNote: '涵洞口焊机电源线直接浸泡于积水边缘。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-028', period: '2026-11', secId: 'sec3', location: '三工区 · K62+300 梁场', source: '无人机巡检', category: '起重吊装', desc: '龙门吊轨道限位挡块螺栓缺损', level: '一般隐患', due: '2026-11-26', dueFull: '2026-11-26 17:00', status: '整改中', overdue: false, foundAt: '2026-11-22 16:30', owner: '安全员张伟', req: '补齐紧固轨道止挡器高强螺栓。', beforeNote: '航拍巡检发现西端轨道限位器缺失1颗紧固螺栓。', afterNote: '', reviewer: '监理复查人员A（演示）', reviewTime: '', reviewNote: '' },
      { id: 'AQ-202611-027', period: '2026-11', secId: 'sec2', location: '二工区 · 梁场示例A·养生区', source: '视频AI', category: '临边防护', desc: '喷淋管廊检修平台防护门未闭锁', level: '一般隐患', due: '2026-11-26', dueFull: '2026-11-26 17:00', status: '待复查', overdue: false, foundAt: '2026-11-21 16:50', dispatchedAt: '2026-11-21 17:20', feedbackAt: '2026-11-24 14:15', owner: '整改负责人A（演示）', req: '修复自闭弹簧门锁并恢复门禁联锁。', beforeNote: 'AI预警检修平台安全门敞开超过15分钟。', afterNote: '已更换闭门器及插销锁具，测试关闭正常。', reviewer: '监理复查人员A（演示）', reviewTime: '2026-11-25 09:40', reviewNote: '现场确认防护门已恢复自动闭锁。', attachment: '防护门复查照片.jpg' }
    ];

    // Add 27 closed hazards ('已销项') so total = 40 and exact source counts = 15 人工巡查, 16 视频AI, 9 无人机巡检
    // Current 13 unclosed sources:
    // 人工巡查: 039, 032, 026, 029 -> 4 (need 11 more)
    // 视频AI: 035, 040, 037, 030, 031, 027 -> 6 (need 10 more)
    // 无人机巡检: 018, 038, 028 -> 3 (need 6 more)
    const closedPlan = [
      { id: 'AQ-202611-011', secId: 'sec1', loc: '一工区 · 材料场A', src: '无人机巡检', cat: '场内运输', desc: '消防通道占用', due: '2026-11-20' },
      { id: 'AQ-202611-025', secId: 'sec5', loc: '五工区 · 钢筋加工棚', src: '人工巡查', cat: '临时用电', desc: '焊机二次线裸露包扎不规范', due: '2026-11-22' },
      { id: 'AQ-202611-024', secId: 'sec3', loc: '三工区 · 存梁台座区', src: '视频AI', cat: '起重吊装', desc: '吊装作业区人员未撤离', due: '2026-11-22' },
      { id: 'AQ-202611-023', secId: 'sec6', loc: '六工区 · 建华互通匝道', src: '人工巡查', cat: '临边防护', desc: '现浇箱梁支架扫地杆缺失', due: '2026-11-21' },
      { id: 'AQ-202611-022', secId: 'sec2', loc: '二工区 · 桥梁示例A', src: '视频AI', cat: '高处作业', desc: '作业人员未佩戴安全帽', due: '2026-11-21' },
      { id: 'AQ-202611-021', secId: 'sec4', loc: '四工区 · 拌合站示例A', src: '人工巡查', cat: '临时用电', desc: '配电箱未设置防雨遮檐', due: '2026-11-20' },
      { id: 'AQ-202611-020', secId: 'sec5', loc: '五工区 · 弃土场便道', src: '无人机巡检', cat: '场内运输', desc: '运输便道边缘防撞墩移位', due: '2026-11-20' },
      { id: 'AQ-202611-019', secId: 'sec1', loc: '一工区 · K12+200 涵洞', src: '视频AI', cat: '临边防护', desc: '基坑临边防护网局部破损', due: '2026-11-19' },
      { id: 'AQ-202611-017', secId: 'sec6', loc: '六工区 · K141+300 桥梁', src: '人工巡查', cat: '高处作业', desc: '墩柱模板平台护栏高度不足', due: '2026-11-19' },
      { id: 'AQ-202611-016', secId: 'sec2', loc: '二工区 · 梁场示例A', src: '视频AI', cat: '起重吊装', desc: '龙门吊作业鸣笛警示失效', due: '2026-11-18' },
      { id: 'AQ-202611-015', secId: 'sec3', loc: '三工区 · 路面示例段', src: '人工巡查', cat: '施工保通', desc: '保通引导员反光背心反光条脱落', due: '2026-11-18' },
      { id: 'AQ-202611-014', secId: 'sec4', loc: '四工区 · K85+400 通道桥', src: '无人机巡检', cat: '临边防护', desc: '桥面系施工临边护栏缺口', due: '2026-11-17' },
      { id: 'AQ-202611-013', secId: 'sec5', loc: '五工区 · K99+800 路基段', src: '视频AI', cat: '场内运输', desc: '自卸车倒车未安排专人指挥', due: '2026-11-17' },
      { id: 'AQ-202611-012', secId: 'sec1', loc: '一工区 · K08+900 拌合站', src: '人工巡查', cat: '临时用电', desc: '空压机未接入专用漏电保护器', due: '2026-11-16' },
      { id: 'AQ-202611-010', secId: 'sec6', loc: '六工区 · K134+200 边坡', src: '无人机巡检', cat: '高处作业', desc: '锚杆施工脚手架立杆垫板缺失', due: '2026-11-15' },
      { id: 'AQ-202611-009', secId: 'sec5', loc: '五工区 · 钢筋加工棚', src: '人工巡查', cat: '临时用电', desc: '配电箱内堆放杂物及手套', due: '2026-11-15' },
      { id: 'AQ-202611-008', secId: 'sec2', loc: '二工区 · 跨河特大桥', src: '视频AI', cat: '高处作业', desc: '夜间施工照明照度不足', due: '2026-11-14' },
      { id: 'AQ-202611-007', secId: 'sec5', loc: '五工区 · 弃土场便道', src: '无人机巡检', cat: '场内运输', desc: '急弯路段凸面镜积灰遮挡', due: '2026-11-14' },
      { id: 'AQ-202611-006', secId: 'sec3', loc: '三工区 · K58+600 路基', src: '视频AI', cat: '施工保通', desc: '社会车辆误入便道警示缺失', due: '2026-11-13' },
      { id: 'AQ-202611-005', secId: 'sec4', loc: '四工区 · 拌合站示例A', src: '人工巡查', cat: '临时用电', desc: '水泥罐爬梯防坠护笼固定松动', due: '2026-11-12' },
      { id: 'AQ-202611-004', secId: 'sec1', loc: '一工区 · K16+700 桥梁', src: '视频AI', cat: '起重吊装', desc: '汽车吊支腿未垫枕木', due: '2026-11-11' },
      { id: 'AQ-202611-003', secId: 'sec6', loc: '六工区 · 建华互通匝道', src: '人工巡查', cat: '临边防护', desc: '匝道桥墩顶临边防护网松脱', due: '2026-11-10' },
      { id: 'AQ-202611-002', secId: 'sec2', loc: '二工区 · 梁场示例A', src: '视频AI', cat: '高处作业', desc: '梁顶张拉平台人员未系安全带', due: '2026-11-09' },
      { id: 'AQ-202611-001', secId: 'sec3', loc: '三工区 · 路面示例段', src: '无人机巡检', cat: '施工保通', desc: '半幅施工水马注水不足', due: '2026-11-08' },
      { id: 'AQ-202611-033', secId: 'sec4', loc: '四工区 · K90+100 涵洞', src: '人工巡查', cat: '临边防护', desc: '基坑周边堆载超限已清理', due: '2026-11-18' },
      { id: 'AQ-202611-034', secId: 'sec5', loc: '五工区 · K108+400 桥台', src: '视频AI', cat: '高处作业', desc: '盖梁作业平台防护栏已复位', due: '2026-11-19' },
      { id: 'AQ-202611-036', secId: 'sec6', loc: '六工区 · K129+500 路基', src: '人工巡查', cat: '场内运输', desc: '运土通道限速牌已补设', due: '2026-11-20' }
    ];

    closedPlan.forEach(c => {
      rows.push({
        id: c.id,
        period: '2026-11',
        secId: c.secId,
        location: c.loc,
        source: c.src,
        category: c.cat,
        desc: c.desc,
        level: '一般隐患',
        due: c.due,
        dueFull: `${c.due} 17:00`,
        status: '已销项',
        overdue: false,
        foundAt: `${c.due} 09:00`,
        dispatchedAt: `${c.due} 09:30`,
        feedbackAt: `${c.due} 15:20`,
        owner: '整改负责人A（演示）',
        req: `限期完成「${c.desc}」隐患治理并拍照复验。`,
        beforeNote: `${c.src}发现${c.loc}存在${c.desc}问题。`,
        afterNote: `已完成整改并经现场安全员确认。`,
        reviewer: '监理复查人员A（演示）',
        reviewTime: `${c.due} 16:40`,
        reviewNote: '现场复查合格，同意销项归档。',
        attachment: `${c.id}_复查凭证.jpg`
      });
    });

    // Historical periods (2026-10 & 2026-09) for genuine period filter switching
    const oct = [
      { id: 'AQ-202610-018', secId: 'sec2', loc: '二工区 · 桥梁示例A', src: '视频AI', cat: '高处作业', desc: '墩身模板作业平台护栏间距超标', st: '已销项', due: '2026-10-28' },
      { id: 'AQ-202610-015', secId: 'sec1', loc: '一工区 · 材料场A', src: '人工巡查', cat: '场内运输', desc: '料仓消防通道临时堆料', st: '已销项', due: '2026-10-24' },
      { id: 'AQ-202610-012', secId: 'sec3', loc: '三工区 · K60+100 桥梁', src: '无人机巡检', cat: '临边防护', desc: '承台基坑防溺水救生设施缺失', st: '已销项', due: '2026-10-20' },
      { id: 'AQ-202610-009', secId: 'sec4', loc: '四工区 · 拌合站示例A', src: '人工巡查', cat: '临时用电', desc: '配电室绝缘胶垫老化', st: '待复查', due: '2026-10-30' },
      { id: 'AQ-202610-006', secId: 'sec5', loc: '五工区 · K102+300', src: '视频AI', cat: '起重吊装', desc: '吊装作业未设置警戒哨', st: '已销项', due: '2026-10-16' },
      { id: 'AQ-202610-004', secId: 'sec6', loc: '六工区 · 建华互通', src: '无人机巡检', cat: '施工保通', desc: '便道交汇处指示牌模糊', st: '已销项', due: '2026-10-12' }
    ];
    oct.forEach(c => rows.push({
      id: c.id, period: '2026-10', secId: c.secId, location: c.loc, source: c.src, category: c.cat, desc: c.desc,
      level: '一般隐患', due: c.due, dueFull: `${c.due} 17:00`, status: c.st, overdue: false,
      foundAt: `${c.due} 08:40`, dispatchedAt: `${c.due} 09:15`, feedbackAt: `${c.due} 14:50`,
      owner: '整改负责人A（演示）', req: `完成${c.desc}整改。`,
      beforeNote: `${c.src}发现${c.desc}。`, afterNote: '已按规范整改完毕。',
      reviewer: '监理复查人员A（演示）', reviewTime: `${c.due} 16:00`, reviewNote: '复查合格。', attachment: `${c.id}.jpg`
    }));

    const sep = [
      { id: 'AQ-202609-011', secId: 'sec2', loc: '二工区 · 梁场示例A', src: '人工巡查', cat: '起重吊装', desc: '门机钢丝绳磨损超标更换', st: '已销项', due: '2026-09-26' },
      { id: 'AQ-202609-008', secId: 'sec1', loc: '一工区 · K10+400 路基', src: '无人机巡检', cat: '临边防护', desc: '深路堑边坡警示护栏缺段', st: '已销项', due: '2026-09-20' },
      { id: 'AQ-202609-005', secId: 'sec3', loc: '三工区 · 拌合站', src: '视频AI', cat: '临时用电', desc: '夜间移动照明灯具未接地', st: '已销项', due: '2026-09-15' },
      { id: 'AQ-202609-003', secId: 'sec4', loc: '四工区 · 施工便道', src: '人工巡查', cat: '施工保通', desc: '便道转弯处警示桩补设', st: '已销项', due: '2026-09-10' }
    ];
    sep.forEach(c => rows.push({
      id: c.id, period: '2026-09', secId: c.secId, location: c.loc, source: c.src, category: c.cat, desc: c.desc,
      level: '一般隐患', due: c.due, dueFull: `${c.due} 17:00`, status: c.st, overdue: false,
      foundAt: `${c.due} 09:20`, dispatchedAt: `${c.due} 10:00`, feedbackAt: `${c.due} 16:10`,
      owner: '整改负责人B（演示）', req: `完成${c.desc}整改。`,
      beforeNote: `${c.src}发现${c.desc}。`, afterNote: '已整改完成。',
      reviewer: '监理复查人员A（演示）', reviewTime: `${c.due} 17:00`, reviewNote: '复查通过销项。', attachment: `${c.id}.jpg`
    }));

    return rows;
  }

  function createInitialAiAlerts() {
    // 2026-11: Total 30 => 待核实 8, 已确认 16, 已标误报 4, 重复关联 2
    const alerts = [
      { id: 'VAI-20261124-008', period: '2026-11', time: '2026-11-24 09:12', shortTime: '09:12', window: '2026-11-24  09:12:00—09:12:30', secId: 'sec2', location: '梁场示例A · 作业区', shortLoc: '二工区·梁场示例A', camera: 'CAM-LC-A03', algorithm: '安全帽佩戴识别', event: '疑似未佩戴安全帽', status: '待核实', imgKey: 'corridor', box: { left: 45, top: 47, width: 12, height: 32 }, frames: ['09:12:15', '09:12:18', '09:12:21'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-007', period: '2026-11', time: '2026-11-24 09:05', shortTime: '09:05', window: '2026-11-24  09:05:00—09:05:30', secId: 'sec3', location: '路面作业区', shortLoc: '三工区·路面作业区', camera: 'CAM-LM-B02', algorithm: '人员闯入识别', event: '疑似人员闯入', status: '待核实', imgKey: 'showcase', box: { left: 58, top: 42, width: 13, height: 30 }, frames: ['09:05:08', '09:05:15', '09:05:24'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-006', period: '2026-11', time: '2026-11-24 08:50', shortTime: '08:50', window: '2026-11-24  08:50:00—08:50:30', secId: 'sec1', location: '材料场A', shortLoc: '一工区·材料场A', camera: 'CAM-CL-A01', algorithm: '反光衣穿戴识别', event: '疑似未穿反光衣', status: '待核实', imgKey: 'before', box: { left: 36, top: 50, width: 11, height: 28 }, frames: ['08:50:10', '08:50:18', '08:50:25'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-005', period: '2026-11', time: '2026-11-24 08:20', shortTime: '08:20', window: '2026-11-24  08:20:00—08:20:30', secId: 'sec4', location: '拌合站示例A', shortLoc: '四工区·拌合站示例A', camera: 'CAM-BH-D04', algorithm: '烟雾明火识别', event: '疑似烟雾', status: '待核实', imgKey: 'after', box: { left: 28, top: 32, width: 18, height: 26 }, frames: ['08:20:06', '08:20:14', '08:20:22'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-004', period: '2026-11', time: '2026-11-24 08:10', shortTime: '08:10', window: '2026-11-24  08:10:00—08:10:30', secId: 'sec2', location: '桥梁作业区', shortLoc: '二工区·桥梁作业区', camera: 'CAM-QL-A01', algorithm: '人员闯入识别', event: '疑似人员闯入', status: '待核实', imgKey: 'after', box: { left: 62, top: 44, width: 12, height: 30 }, frames: ['08:10:09', '08:10:18', '08:10:27'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-003', period: '2026-11', time: '2026-11-24 07:55', shortTime: '07:55', window: '2026-11-24  07:55:00—07:55:30', secId: 'sec4', location: '施工便道口', shortLoc: '四工区·施工便道口', camera: 'CAM-BD-D01', algorithm: '临边越界识别', event: '疑似临边越界', status: '待核实', imgKey: 'corridor', box: { left: 40, top: 48, width: 14, height: 28 }, frames: ['07:55:05', '07:55:16', '07:55:24'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-002', period: '2026-11', time: '2026-11-24 07:38', shortTime: '07:38', window: '2026-11-24  07:38:00—07:38:30', secId: 'sec3', location: '存梁台座区', shortLoc: '三工区·存梁台座区', camera: 'CAM-LC-B01', algorithm: '安全帽佩戴识别', event: '疑似未佩戴安全帽', status: '待核实', imgKey: 'before', box: { left: 50, top: 45, width: 11, height: 31 }, frames: ['07:38:11', '07:38:19', '07:38:26'], note: '', linkedHazardId: '' },
      { id: 'VAI-20261124-001', period: '2026-11', time: '2026-11-24 07:15', shortTime: '07:15', window: '2026-11-24  07:15:00—07:15:30', secId: 'sec1', location: 'K18路基边坡', shortLoc: '一工区·K18边坡', camera: 'CAM-LJ-A02', algorithm: '临边越界识别', event: '疑似临边越界', status: '待核实', imgKey: 'showcase', box: { left: 33, top: 40, width: 15, height: 30 }, frames: ['07:15:08', '07:15:17', '07:15:25'], note: '', linkedHazardId: '' }
    ];

    const secCycle = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5', 'sec6'];
    const locCycle = ['桥梁示例A', '梁场示例A', '路面作业区', '拌合站示例A', '钢筋加工棚', '建华互通匝道'];
    const camCycle = ['CAM-QL-A01', 'CAM-LC-A03', 'CAM-LM-B02', 'CAM-BH-D04', 'CAM-GJ-E01', 'CAM-HT-F01'];
    const evtCycle = ['未佩戴安全帽', '人员违规闯入吊装区', '未穿戴反光背心', '临边作业越界', '施工通道烟雾报警'];

    for (let i = 1; i <= 16; i++) {
      const idx = i - 1;
      const day = String(Math.max(1, 23 - Math.floor(idx / 2))).padStart(2, '0');
      const secId = secCycle[idx % 6];
      alerts.push({
        id: `VAI-202611${day}-${String(10 + i).padStart(3, '0')}`,
        period: '2026-11',
        time: `2026-11-${day} ${String(9 + (idx % 8)).padStart(2, '0')}:20`,
        shortTime: `${String(9 + (idx % 8)).padStart(2, '0')}:20`,
        window: `2026-11-${day}  09:20:00—09:20:30`,
        secId,
        location: `${locCycle[idx % 6]}`,
        shortLoc: `${SECTION_NAME_BY_ID[secId]}·${locCycle[idx % 6]}`,
        camera: camCycle[idx % 6],
        algorithm: AI_ALGORITHMS[idx % AI_ALGORITHMS.length],
        event: evtCycle[idx % evtCycle.length],
        status: '已确认',
        imgKey: idx % 2 === 0 ? 'after' : 'corridor',
        box: { left: 42, top: 44, width: 13, height: 30 },
        frames: ['09:20:10', '09:20:18', '09:20:25'],
        note: '经人工回看视频确认属实，已转入隐患台账办理。',
        linkedHazardId: 'AQ-202611-035'
      });
    }
    for (let i = 1; i <= 4; i++) {
      const secId = secCycle[i % 6];
      alerts.push({
        id: `VAI-20261119-09${i}`,
        period: '2026-11',
        time: `2026-11-19 1${i}:10`,
        shortTime: `1${i}:10`,
        window: `2026-11-19  1${i}:10:00—1${i}:10:30`,
        secId,
        location: locCycle[i % 6],
        shortLoc: `${SECTION_NAME_BY_ID[secId]}·${locCycle[i % 6]}`,
        camera: camCycle[i % 6],
        algorithm: AI_ALGORITHMS[i % AI_ALGORITHMS.length],
        event: '疑似烟雾（水雾误报）',
        status: '已标误报',
        imgKey: 'before',
        box: { left: 30, top: 36, width: 16, height: 24 },
        frames: ['11:10:08', '11:10:15', '11:10:22'],
        note: '现场核实为喷淋降尘水雾反射，判定误报。',
        linkedHazardId: ''
      });
    }
    for (let i = 1; i <= 2; i++) {
      const secId = i === 1 ? 'sec2' : 'sec3';
      alerts.push({
        id: `VAI-20261121-08${i}`,
        period: '2026-11',
        time: `2026-11-21 1${i}:40`,
        shortTime: `1${i}:40`,
        window: `2026-11-21  1${i}:40:00—1${i}:40:30`,
        secId,
        location: i === 1 ? '桥梁示例A·2号墩' : '路面作业区',
        shortLoc: i === 1 ? '二工区·桥梁示例A' : '三工区·路面作业区',
        camera: i === 1 ? 'CAM-QL-A01' : 'CAM-LM-B02',
        algorithm: '临边越界识别',
        event: '同点位重复抓拍提醒',
        status: '重复关联',
        imgKey: 'after',
        box: { left: 48, top: 46, width: 13, height: 28 },
        frames: ['11:40:06', '11:40:14', '11:40:22'],
        note: '与已有隐患同点位重复报警，已关联既有台账。',
        linkedHazardId: i === 1 ? 'AQ-202611-018' : 'AQ-202611-035'
      });
    }

    // Oct & Sep sample alerts
    alerts.push(
      { id: 'VAI-20261022-012', period: '2026-10', time: '2026-10-22 10:15', shortTime: '10:15', window: '2026-10-22 10:15:00—10:15:30', secId: 'sec2', location: '桥梁示例A', shortLoc: '二工区·桥梁示例A', camera: 'CAM-QL-A01', algorithm: '安全帽佩戴识别', event: '疑似未佩戴安全帽', status: '已确认', imgKey: 'after', box: { left: 44, top: 45, width: 12, height: 30 }, frames: ['10:15:08', '10:15:16', '10:15:24'], note: '已确认并闭环。', linkedHazardId: 'AQ-202610-018' },
      { id: 'VAI-20261019-005', period: '2026-10', time: '2026-10-19 14:20', shortTime: '14:20', window: '2026-10-19 14:20:00—14:20:30', secId: 'sec1', location: '材料场A', shortLoc: '一工区·材料场A', camera: 'CAM-CL-A01', algorithm: '反光衣穿戴识别', event: '疑似未穿反光衣', status: '待核实', imgKey: 'before', box: { left: 38, top: 48, width: 12, height: 28 }, frames: ['14:20:05', '14:20:15', '14:20:25'], note: '', linkedHazardId: '' },
      { id: 'VAI-20260918-004', period: '2026-09', time: '2026-09-18 09:30', shortTime: '09:30', window: '2026-09-18 09:30:00—09:30:30', secId: 'sec3', location: '拌合站', shortLoc: '三工区·拌合站', camera: 'CAM-BH-D04', algorithm: '烟雾明火识别', event: '疑似烟雾', status: '已标误报', imgKey: 'corridor', box: { left: 35, top: 34, width: 15, height: 24 }, frames: ['09:30:10', '09:30:18', '09:30:26'], note: '蒸汽误报。', linkedHazardId: '' }
    );
    return alerts;
  }

  function createInitialExternalRecords() {
    return [
      { extId: 'PA-202611-108', secId: 'sec2', location: '二工区 · 桥梁示例A·2号墩', origin: '平安工地移动端巡查', desc: '临边防护缺失', linkedId: 'AQ-202611-018', syncTime: '2026-11-23 16:22', status: '待复查' },
      { extId: 'PA-202611-105', secId: 'sec1', location: '一工区 · 材料场A', origin: '平安工地网格员上报', desc: '场内通道占用', linkedId: 'AQ-202611-032', syncTime: '2026-11-20 14:15', status: '整改中·超期' },
      { extId: 'PA-202611-102', secId: 'sec4', location: '四工区 · 拌合站示例A', origin: '平安工地专项检查', desc: '临时用电标识缺失', linkedId: 'AQ-202611-026', syncTime: '2026-11-24 10:25', status: '待复查' },
      { extId: 'PA-202611-096', secId: 'sec2', location: '二工区 · 梁场示例A·钢筋加工区', origin: '平安工地班前检查', desc: '人员防护缺项', linkedId: 'AQ-202611-039', syncTime: '2026-11-24 08:35', status: '待派发' },
      { extId: 'PA-202611-089', secId: 'sec1', location: '一工区 · 材料场A', origin: '平安工地消防排查', desc: '消防通道占用', linkedId: 'AQ-202611-011', syncTime: '2026-11-20 16:45', status: '已销项' }
    ];
  }

  function createInitialActivities() {
    return [
      { id: 'act1', title: '三工区 · 人员防护缺项', time: '11-25 10:15', code: 'AQ-202611-035', status: '已催办', tagClass: 'm04-tag-red', secId: 'sec3', icon: 'clock' },
      { id: 'act2', title: '四工区 · 临时用电标识缺失', time: '11-24 10:22', code: 'AQ-202611-026', status: '待复查', tagClass: 'm04-tag-amber', secId: 'sec4', icon: 'doc' },
      { id: 'act3', title: '二工区 · 临边防护缺失', time: '11-23 16:20', code: 'AQ-202611-018', status: '待复查', tagClass: 'm04-tag-amber', secId: 'sec2', icon: 'checkCircle' }
    ];
  }

  /* ------------------------------------------------------------------------
     MODULE-SCOPE PERSISTENT STATE
     ------------------------------------------------------------------------ */
  const store = {
    riskPoints: createInitialRiskPoints(),
    hazards: createInitialHazards(),
    aiAlerts: createInitialAiAlerts(),
    externalRecords: createInitialExternalRecords(),
    activities: createInitialActivities(),
    nextHazardSeq: 41
  };

  const ui = {
    lastSeenGlobalSec: null,
    // Shared / Overview filters
    category: 'all',
    period: '2026-11',
    overviewQuickTab: 'unclosed', // unclosed | overdue | review
    overviewPage: 1,
    // Risk page
    riskCategory: 'all',
    riskLevel: 'all',
    riskQuery: '',
    riskPage: 1,
    selectedRiskId: 'R-02',
    riskLayers: { risk: true, hazard: false, video: false },
    // AI Alert page
    aiAlgo: 'all',
    aiStatus: 'all',
    aiPage: 1,
    selectedAiId: 'VAI-20261124-008',
    aiPlaying: false,
    aiScrubSec: 18,
    aiMuted: false,
    aiActiveFrameIdx: 1,
    aiNotes: {},
    // Ledger page
    ledgerSource: 'all',
    ledgerStatus: 'all',
    ledgerTab: 'local', // local | external
    ledgerQuery: '',
    ledgerPage: 1,
    selectedHazardId: 'AQ-202611-039',
    // Review page
    reviewStatusFilter: '待复查', // 待复查 | all | 整改中 | 已销项
    selectedReviewId: 'AQ-202611-018',
    reviewDrafts: {}
  };

  let lastHostEl = null;
  let lastCtx = null;
  let aiTimer = null;

  /* ------------------------------------------------------------------------
     HELPERS & COMPUTED FILTERS
     ------------------------------------------------------------------------ */
  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function secName(secId) {
    return SECTION_NAME_BY_ID[secId] || '全线';
  }

  function secUnit(secId) {
    const m = SECTION_META.find(s => s.id === secId);
    return m ? m.unit : '项目施工单位';
  }

  function periodLabel(p) {
    if (p === '2026-11') return '2026年11月';
    if (p === '2026-10') return '2026年10月';
    if (p === '2026-09') return '2026年09月';
    return p;
  }

  function getActiveSecId(ctx) {
    return (ctx && ctx.state && ctx.state.activeSectionId) || null;
  }

  function getHazardStatusMeta(h) {
    if (h.status === '整改中' && h.overdue) return { label: '整改中·超期', cls: 'm04-tag-red', action: '催办' };
    if (h.status === '待派发') return { label: '待派发', cls: 'm04-tag-amber', action: '派发' };
    if (h.status === '整改中') return { label: '整改中', cls: 'm04-tag-blue', action: '催办' };
    if (h.status === '待复查') return { label: '待复查', cls: 'm04-tag-amber', action: '复查' };
    return { label: '已销项', cls: 'm04-tag-green', action: '查看' };
  }

  function getRiskLevelTag(level) {
    if (level === '重大') return { cls: 'm04-tag-red', textCls: 'm04-c-red', label: '重大' };
    if (level === '较大') return { cls: 'm04-tag-amber', textCls: 'm04-c-gold', label: '较大' };
    if (level === '一般') return { cls: 'm04-tag-blue', textCls: 'm04-c-blue', label: '一般' };
    return { cls: 'm04-tag-green', textCls: 'm04-c-green', label: '低风险' };
  }

  function getAiStatusTag(status) {
    if (status === '待核实') return 'm04-tag-amber';
    if (status === '已确认') return 'm04-tag-green';
    if (status === '已标误报') return 'm04-tag-blue';
    return 'm04-tag-blue';
  }

  function getFilteredRisks(secId, applyLocalFilters) {
    return store.riskPoints.filter(r => {
      if (secId && r.secId !== secId) return false;
      if (applyLocalFilters) {
        if (ui.riskCategory !== 'all' && r.category !== ui.riskCategory) return false;
        if (ui.riskLevel !== 'all' && r.level !== ui.riskLevel) return false;
        if (ui.riskQuery.trim()) {
          const q = ui.riskQuery.trim().toLowerCase();
          const hit = `${r.id} ${r.name} ${r.location} ${r.category} ${secName(r.secId)}`.toLowerCase();
          if (!hit.includes(q)) return false;
        }
      }
      return true;
    });
  }

  function getHazardsByScope(secId, period, category) {
    return store.hazards.filter(h => {
      if (period && h.period !== period) return false;
      if (secId && h.secId !== secId) return false;
      if (category && category !== 'all' && h.category !== category) return false;
      return true;
    });
  }

  function getFilteredAiAlerts(secId, period, applyLocalFilters) {
    return store.aiAlerts.filter(a => {
      if (period && a.period !== period) return false;
      if (secId && a.secId !== secId) return false;
      if (applyLocalFilters) {
        if (ui.aiAlgo !== 'all' && a.algorithm !== ui.aiAlgo) return false;
        if (ui.aiStatus !== 'all' && a.status !== ui.aiStatus) return false;
      }
      return true;
    });
  }

  function computeHazardStats(list) {
    const total = list.length;
    let pendingDispatch = 0, rectifying = 0, pendingReview = 0, closed = 0, overdue = 0;
    let srcManual = 0, srcAi = 0, srcUav = 0;
    const secUnclosed = { sec1: 0, sec2: 0, sec3: 0, sec4: 0, sec5: 0, sec6: 0 };

    list.forEach(h => {
      if (h.status === '待派发') pendingDispatch++;
      else if (h.status === '整改中') rectifying++;
      else if (h.status === '待复查') pendingReview++;
      else if (h.status === '已销项') closed++;

      if (h.status !== '已销项') {
        if (secUnclosed[h.secId] !== undefined) secUnclosed[h.secId]++;
      }
      if (h.overdue && h.status !== '已销项') overdue++;

      if (h.source === '人工巡查') srcManual++;
      else if (h.source === '视频AI') srcAi++;
      else if (h.source === '无人机巡检') srcUav++;
    });

    const unclosed = pendingDispatch + rectifying + pendingReview;
    return {
      total, pendingDispatch, rectifying, pendingReview, closed, unclosed, overdue,
      srcManual, srcAi, srcUav, secUnclosed
    };
  }

  function computeAiStats(list) {
    let pending = 0, confirmed = 0, falseAlarm = 0, duplicate = 0;
    list.forEach(a => {
      if (a.status === '待核实') pending++;
      else if (a.status === '已确认') confirmed++;
      else if (a.status === '已标误报') falseAlarm++;
      else if (a.status === '重复关联') duplicate++;
    });
    return { total: list.length, pending, confirmed, falseAlarm, duplicate };
  }

  function toggleGlobalSection(secId) {
    const targetId = secId || null;
    const current = getActiveSecId(lastCtx);
    if (targetId === current) return;
    const pillsWrap = document.getElementById('sectionFilters');
    if (pillsWrap) {
      if (!targetId && current) {
        const activeBtn = pillsWrap.querySelector(`.section-pill[data-sec="${current}"]`);
        if (activeBtn) { activeBtn.click(); return; }
      } else if (targetId) {
        const targetBtn = pillsWrap.querySelector(`.section-pill[data-sec="${targetId}"]`);
        if (targetBtn) { targetBtn.click(); return; }
      }
    }
    if (lastCtx && lastCtx.state) {
      lastCtx.state.activeSectionId = targetId;
      rerender();
    }
  }

  function sectionOptionsHtml(activeSecId) {
    return `<option value="" ${!activeSecId ? 'selected' : ''}>全部工区</option>` +
      SECTION_META.map(s => `<option value="${s.id}" ${activeSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('');
  }

  /* ------------------------------------------------------------------------
     PURE INLINE SVG CHARTS (m04- prefixed <defs> IDs)
     ------------------------------------------------------------------------ */
  function renderSectionBarSvg(secUnclosed, activeSecId) {
    const vals = SECTION_META.map(s => ({ id: s.id, name: s.name, val: secUnclosed[s.id] || 0 }));
    const maxVal = Math.max(6, ...vals.map(v => v.val));
    const yTicks = 6;
    const W = 440, H = 180, padL = 34, padR = 14, padT = 18, padB = 28;
    const chartW = W - padL - padR;
    const chartH = H - padT - padB;
    const step = chartW / vals.length;
    const barW = 30;

    let gridLines = '';
    for (let i = 0; i <= yTicks; i++) {
      const yVal = Math.round((maxVal / yTicks) * i);
      const y = padT + chartH - (i / yTicks) * chartH;
      gridLines += `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(56,189,248,0.14)" stroke-width="1"/>
        <text x="${padL - 8}" y="${(y + 4).toFixed(1)}" fill="#8ab4dc" font-size="10.5" text-anchor="end">${yVal}</text>
      `;
    }

    const bars = vals.map((item, idx) => {
      const cx = padL + step * idx + step / 2;
      const bh = maxVal > 0 ? (item.val / maxVal) * chartH : 0;
      const x = cx - barW / 2;
      const y = padT + chartH - bh;
      const isHighlight = !activeSecId || activeSecId === item.id;
      const opacity = isHighlight ? 1 : 0.36;
      return `
        <g class="m04-bar-col" data-bar-sec="${item.id}" style="cursor:pointer;opacity:${opacity};">
          ${bh > 0
            ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${bh.toFixed(1)}" rx="3" fill="url(#m04-bar-grad)" filter="url(#m04-bar-glow)"/>`
            : `<line x1="${x.toFixed(1)}" y1="${(padT + chartH).toFixed(1)}" x2="${(x + barW).toFixed(1)}" y2="${(padT + chartH).toFixed(1)}" stroke="#38bdf8" stroke-width="2" opacity="0.5"/>`
          }
          <text x="${cx.toFixed(1)}" y="${Math.max(12, y - 5).toFixed(1)}" fill="#e2f0ff" font-size="11.5" font-weight="700" text-anchor="middle">${item.val}</text>
          <text x="${cx.toFixed(1)}" y="${H - 8}" fill="${activeSecId === item.id ? '#38f2ff' : '#a9c6e8'}" font-size="11" font-weight="${activeSecId === item.id ? '700' : '500'}" text-anchor="middle">${item.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:168px;display:block;">
        <defs>
          <linearGradient id="m04-bar-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38f2ff"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
          <filter id="m04-bar-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2.5" result="b"/>
            <feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>
        ${gridLines}
        <line x1="${padL}" y1="${padT}" x2="${padL}" y2="${padT + chartH}" stroke="rgba(56,189,248,0.28)" stroke-width="1"/>
        ${bars}
      </svg>
    `;
  }

  function renderDonutSvg(segments, totalVal, centerSub, gradPrefix) {
    const size = 148;
    const cx = 74, cy = 74, r = 52;
    const C = 2 * Math.PI * r;
    let offset = 0;

    const arcs = segments.map((seg, idx) => {
      const pct = totalVal > 0 ? seg.value / totalVal : 0;
      const len = pct * C;
      const gap = totalVal > 0 && seg.value > 0 && segments.filter(s => s.value > 0).length > 1 ? 2.5 : 0;
      const dashLen = Math.max(0, len - gap);
      const circle = `
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none"
          stroke="${seg.color}" stroke-width="16" stroke-linecap="butt"
          stroke-dasharray="${dashLen.toFixed(2)} ${(C - dashLen).toFixed(2)}"
          stroke-dashoffset="${(-offset).toFixed(2)}"
          transform="rotate(-90 ${cx} ${cy})"
          style="transition: stroke-dasharray 0.4s ease;"/>
      `;
      offset += len;
      return circle;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" style="width:136px;height:136px;flex-shrink:0;">
        <defs>
          <filter id="${gradPrefix}-shadow">
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" flood-color="#22d3ee" flood-opacity="0.35"/>
          </filter>
        </defs>
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(14,48,98,0.72)" stroke-width="16"/>
        <g filter="url(#${gradPrefix}-shadow)">${arcs}</g>
        <text x="${cx}" y="${cy - 2}" text-anchor="middle" fill="#ffffff" font-size="22" font-weight="800">${totalVal}<tspan font-size="12" font-weight="500" fill="#cbd5e1">项</tspan></text>
        <text x="${cx}" y="${cy + 18}" text-anchor="middle" fill="#93c5fd" font-size="11">${escHtml(centerSub)}</text>
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 1: 安全总览 (01_安全总览.png)
     ------------------------------------------------------------------------ */
  function renderOverviewPage(ctx) {
    const secId = getActiveSecId(ctx);
    const scopedHazards = getHazardsByScope(secId, ui.period, ui.category);
    const stats = computeHazardStats(scopedHazards);
    const scopedRisks = getFilteredRisks(secId, false).filter(r => ui.category === 'all' || r.category === ui.category);
    const scopedAi = getFilteredAiAlerts(secId, ui.period, false);
    const aiPendingCount = scopedAi.filter(a => a.status === '待核实').length;

    // Quick-filtered table list for "重点跟踪隐患"
    let trackList = scopedHazards.filter(h => h.status !== '已销项');
    if (ui.overviewQuickTab === 'overdue') trackList = trackList.filter(h => h.overdue);
    else if (ui.overviewQuickTab === 'review') trackList = trackList.filter(h => h.status === '待复查');

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(trackList.length / pageSize));
    if (ui.overviewPage > totalPages) ui.overviewPage = totalPages;
    const startIdx = (ui.overviewPage - 1) * pageSize;
    const pageRows = trackList.slice(startIdx, startIdx + pageSize);

    const statusSegs = [
      { label: '待派发', value: stats.pendingDispatch, color: '#38bdf8' },
      { label: '整改中', value: stats.rectifying, color: '#0ea5e9' },
      { label: '待复查', value: stats.pendingReview, color: '#facc15' },
      { label: '已销项', value: stats.closed, color: '#22c55e' }
    ];
    const sourceSegs = [
      { label: '人工巡查', value: stats.srcManual, color: '#3b82f6' },
      { label: '视频AI', value: stats.srcAi, color: '#22d3ee' },
      { label: '无人机巡检', value: stats.srcUav, color: '#22c55e' }
    ];

    const renderLegend = (segs, total) => segs.map(s => {
      const pct = total > 0 ? ((s.value / total) * 100).toFixed(1) : '0.0';
      return `
        <div class="m04-legend-row">
          <div class="m04-legend-left"><span class="m04-legend-dot" style="background:${s.color};"></span><span>${s.label}</span></div>
          <div class="m04-legend-right"><span class="m04-legend-num">${s.value}</span><span class="m04-legend-pct">${pct}%</span></div>
        </div>
      `;
    }).join('');

    const visibleActivities = store.activities.filter(a => !secId || a.secId === secId).slice(0, 4);

    return `
      <div class="m04-page m04-compact">
        <!-- Top Filter Bar -->
        <div class="m04-filter-bar">
          <div class="m04-filter-group">
            <div class="m04-filter-item">
              <label>所属工区</label>
              <select class="m04-select" data-action="global-sec">${sectionOptionsHtml(secId)}</select>
            </div>
            <div class="m04-filter-item">
              <label>风险类别</label>
              <select class="m04-select" data-filter="category">
                <option value="all" ${ui.category === 'all' ? 'selected' : ''}>全部类别</option>
                ${RISK_CATEGORIES.map(c => `<option value="${c}" ${ui.category === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="m04-filter-item">
              <label>统计周期</label>
              <select class="m04-select" data-filter="period">
                <option value="2026-11" ${ui.period === '2026-11' ? 'selected' : ''}>2026年11月</option>
                <option value="2026-10" ${ui.period === '2026-10' ? 'selected' : ''}>2026年10月</option>
                <option value="2026-09" ${ui.period === '2026-09' ? 'selected' : ''}>2026年09月</option>
              </select>
            </div>
          </div>
          <div class="m04-filter-actions">
            <button class="m04-btn-query" data-action="query-toast">${SVG.search}<span>查询</span></button>
            <button class="m04-btn-ghost" data-action="reset-overview">${SVG.refresh}<span>重置</span></button>
          </div>
        </div>

        <!-- 施工安全概况 -->
        <div class="m04-panel">
          <div class="m04-panel-head">
            <div class="m04-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">施工安全概况</span>
              <span class="m04-panel-sub">(${periodLabel(ui.period)})</span>
            </div>
          </div>
          <div class="m04-panel-body">
            <div class="m04-kpi-grid-6">
              <div class="m04-kpi-card" data-nav="risk">
                <div class="m04-kpi-ico m04-ico-blue">${SVG.pin}</div>
                <div><div class="m04-kpi-label">在管风险点</div><div class="m04-kpi-val m04-c-cyan">${scopedRisks.length}<span class="m04-kpi-unit">处</span></div></div>
              </div>
              <div class="m04-kpi-card" data-nav="ledger">
                <div class="m04-kpi-ico m04-ico-cyan">${SVG.clipboard}</div>
                <div><div class="m04-kpi-label">本期确认隐患</div><div class="m04-kpi-val m04-c-cyan">${stats.total}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-quick-tab="unclosed">
                <div class="m04-kpi-ico m04-ico-gold">${SVG.warnTri}</div>
                <div><div class="m04-kpi-label">未销项隐患</div><div class="m04-kpi-val m04-c-gold">${stats.unclosed}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-nav="ledger" data-ledger-status="已销项">
                <div class="m04-kpi-ico m04-ico-green">${SVG.checkCircle}</div>
                <div><div class="m04-kpi-label">已销项隐患</div><div class="m04-kpi-val m04-c-green">${stats.closed}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-quick-tab="overdue">
                <div class="m04-kpi-ico m04-ico-red">${SVG.clock}</div>
                <div><div class="m04-kpi-label">超期隐患</div><div class="m04-kpi-val m04-c-red">${stats.overdue}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-nav="ai_alert">
                <div class="m04-kpi-ico m04-ico-gold">${SVG.camera}</div>
                <div><div class="m04-kpi-label">待核实AI预警</div><div class="m04-kpi-val m04-c-gold">${aiPendingCount}<span class="m04-kpi-unit">条</span></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Middle 3 Charts -->
        <div class="m04-mid-grid-3">
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">各工区未销项隐患</span></div>
              <span class="m04-panel-sub">单位 项</span>
            </div>
            <div class="m04-panel-body">${renderSectionBarSvg(stats.secUnclosed, secId)}</div>
          </div>
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">隐患处置状态</span></div>
              <span class="m04-panel-sub">未销项含超期 ${stats.overdue} 项</span>
            </div>
            <div class="m04-panel-body">
              <div class="m04-donut-wrap">
                ${renderDonutSvg(statusSegs, stats.total, '确认隐患', 'm04-st')}
                <div class="m04-legend-list">${renderLegend(statusSegs, stats.total)}</div>
              </div>
            </div>
          </div>
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">已确认隐患来源</span></div>
            </div>
            <div class="m04-panel-body">
              <div class="m04-donut-wrap">
                ${renderDonutSvg(sourceSegs, stats.total, '确认隐患', 'm04-src')}
                <div class="m04-legend-list">${renderLegend(sourceSegs, stats.total)}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom 2 Panels -->
        <div class="m04-split-2">
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">重点跟踪隐患</span></div>
              <div class="m04-pill-tabs">
                <button class="m04-pill-tab ${ui.overviewQuickTab === 'unclosed' ? 'active' : ''}" data-quick-tab="unclosed">全部未销项</button>
                <button class="m04-pill-tab ${ui.overviewQuickTab === 'overdue' ? 'active' : ''}" data-quick-tab="overdue">超期</button>
                <button class="m04-pill-tab ${ui.overviewQuickTab === 'review' ? 'active' : ''}" data-quick-tab="review">待复查</button>
              </div>
            </div>
            <div class="m04-panel-body">
              <div class="m04-table-wrap">
                <table class="m04-table">
                  <thead>
                    <tr>
                      <th>隐患编号</th><th>工程位置</th><th>来源</th><th>隐患描述</th><th>整改期限</th><th>状态</th><th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pageRows.length ? pageRows.map(h => {
                      const sm = getHazardStatusMeta(h);
                      return `
                        <tr data-open-hazard="${h.id}">
                          <td>${escHtml(h.id)}</td>
                          <td>${escHtml(h.location)}</td>
                          <td>${escHtml(h.source)}</td>
                          <td>${escHtml(h.desc)}</td>
                          <td style="font-variant-numeric:tabular-nums;">${escHtml(h.due.slice(5))}</td>
                          <td><span class="m04-tag ${sm.cls}">${sm.label}</span></td>
                          <td><button class="m04-act-link" data-hazard-op="${h.id}" data-op-type="${sm.action}">${sm.action}</button></td>
                        </tr>
                      `;
                    }).join('') : `<tr><td colspan="7" style="text-align:center;color:#8ab4dc;padding:22px;">当前筛选条件下暂无未销项隐患</td></tr>`}
                  </tbody>
                </table>
              </div>
              <div class="m04-pager">
                <span class="m04-pager-info">共 ${trackList.length} 条记录</span>
                <button class="m04-pg-btn" data-pg="overview" data-pg-val="${ui.overviewPage - 1}" ${ui.overviewPage <= 1 ? 'disabled' : ''}>&lt;</button>
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
                  `<button class="m04-pg-btn ${p === ui.overviewPage ? 'active' : ''}" data-pg="overview" data-pg-val="${p}">${p}</button>`
                ).join('')}
                <button class="m04-pg-btn" data-pg="overview" data-pg-val="${ui.overviewPage + 1}" ${ui.overviewPage >= totalPages ? 'disabled' : ''}>&gt;</button>
              </div>
            </div>
          </div>

          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">最新办理动态</span></div>
            </div>
            <div class="m04-panel-body">
              <div class="m04-feed-list">
                ${visibleActivities.map(act => `
                  <div class="m04-feed-item" data-open-hazard="${act.code}">
                    <div class="m04-feed-left">
                      <div class="m04-kpi-ico ${act.tagClass === 'm04-tag-red' ? 'm04-ico-red' : act.tagClass === 'm04-tag-amber' ? 'm04-ico-gold' : 'm04-ico-green'}" style="width:32px;height:32px;">
                        ${SVG[act.icon] || SVG.clock}
                      </div>
                      <div style="min-width:0;">
                        <div class="m04-feed-title">${escHtml(act.title)}</div>
                        <div class="m04-feed-sub">${escHtml(act.time)} &nbsp; ${escHtml(act.code)}</div>
                      </div>
                    </div>
                    <span class="m04-tag ${act.tagClass}">${escHtml(act.status)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="m04-panel-foot m04-foot-fab-clear">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m04-text-link" data-nav="ledger">进入隐患台账 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 2: 风险点位 (02_风险点位.png)
     ------------------------------------------------------------------------ */
  function renderRiskPage(ctx) {
    const secId = getActiveSecId(ctx);
    const filtered = getFilteredRisks(secId, true);
    const allInScope = getFilteredRisks(secId, false);

    if (!filtered.some(r => r.id === ui.selectedRiskId)) {
      ui.selectedRiskId = filtered[0] ? filtered[0].id : (allInScope[0] ? allInScope[0].id : 'R-02');
    }
    const selRisk = store.riskPoints.find(r => r.id === ui.selectedRiskId) || store.riskPoints[1];
    const linkedHazard = store.hazards.find(h => h.id === selRisk.linkedHazardId) || store.hazards.find(h => h.secId === selRisk.secId) || store.hazards[0];
    const linkedMeta = getHazardStatusMeta(linkedHazard);
    const selLevel = getRiskLevelTag(selRisk.level);

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (ui.riskPage > totalPages) ui.riskPage = totalPages;
    const pageList = filtered.slice((ui.riskPage - 1) * pageSize, ui.riskPage * pageSize);

    // Risk level counts across current scope (matches 1 / 3 / 5 / 3 when all)
    const lvCounts = { 重大: 0, 较大: 0, 一般: 0, 低风险: 0 };
    allInScope.forEach(r => { if (lvCounts[r.level] !== undefined) lvCounts[r.level]++; });

    // Map pins: show filtered risks + optionally hazards & video cameras
    const mapRisks = filtered.length ? filtered : allInScope;
    const mapHazards = ui.riskLayers.hazard
      ? store.hazards.filter(h => h.status !== '已销项' && (!secId || h.secId === secId)).slice(0, 5)
      : [];

    const riskIconByCat = cat => {
      if (cat === '高处作业' || cat === '临边防护') return SVG.bridge;
      if (cat === '起重吊装') return SVG.yard;
      if (cat === '临时用电') return SVG.bolt;
      if (cat === '施工保通') return SVG.road;
      return SVG.layers;
    };

    return `
      <div class="m04-page m04-risk-mode">
        <!-- Top Filter Bar -->
        <div class="m04-filter-bar">
          <div class="m04-filter-group">
            <div class="m04-filter-item">
              <label>所属工区</label>
              <select class="m04-select" data-action="global-sec">${sectionOptionsHtml(secId)}</select>
            </div>
            <div class="m04-filter-item">
              <label>风险类别</label>
              <select class="m04-select" data-filter="riskCategory">
                <option value="all" ${ui.riskCategory === 'all' ? 'selected' : ''}>全部类别</option>
                ${RISK_CATEGORIES.map(c => `<option value="${c}" ${ui.riskCategory === c ? 'selected' : ''}>${c}</option>`).join('')}
              </select>
            </div>
            <div class="m04-filter-item">
              <label>风险等级</label>
              <select class="m04-select" data-filter="riskLevel">
                <option value="all" ${ui.riskLevel === 'all' ? 'selected' : ''}>全部等级</option>
                <option value="重大" ${ui.riskLevel === '重大' ? 'selected' : ''}>重大风险</option>
                <option value="较大" ${ui.riskLevel === '较大' ? 'selected' : ''}>较大风险</option>
                <option value="一般" ${ui.riskLevel === '一般' ? 'selected' : ''}>一般风险</option>
                <option value="低风险" ${ui.riskLevel === '低风险' ? 'selected' : ''}>低风险</option>
              </select>
            </div>
            <div class="m04-search-box">
              ${SVG.search}
              <input class="m04-input" type="text" data-input="riskQuery" value="${escHtml(ui.riskQuery)}" placeholder="搜索风险点或工程部位" />
            </div>
          </div>
          <div class="m04-filter-actions">
            <button class="m04-btn-query" data-action="query-toast">${SVG.search}<span>查询</span></button>
            <button class="m04-btn-ghost" data-action="reset-risk">${SVG.refresh}<span>重置</span></button>
          </div>
        </div>

        <!-- 3-Column Body -->
        <div class="m04-cols-3">
          <!-- Left: 在管风险点 + 风险等级分布 -->
          <div style="display:flex;flex-direction:column;gap:12px;min-height:0;">
            <div class="m04-panel" style="flex:1;">
              <div class="m04-panel-head">
                <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">在管风险点</span></div>
                <span class="m04-panel-sub">${filtered.length} 处</span>
              </div>
              <div class="m04-panel-body">
                <div class="m04-card-list">
                  ${pageList.length ? pageList.map(r => {
                    const lv = getRiskLevelTag(r.level);
                    return `
                      <div class="m04-list-card ${r.id === selRisk.id ? 'active' : ''}" data-select-risk="${r.id}">
                        <div class="m04-card-ico">${riskIconByCat(r.category)}</div>
                        <div class="m04-card-main">
                          <div class="m04-card-title">${escHtml(r.id)} &nbsp; ${escHtml(r.name)}</div>
                          <div class="m04-card-sub">${escHtml(secName(r.secId))} · ${escHtml(r.category)}</div>
                        </div>
                        <span class="m04-tag ${lv.cls}">${lv.label}</span>
                      </div>
                    `;
                  }).join('') : `<div style="color:#8ab4dc;text-align:center;padding:24px;">无匹配风险点位</div>`}
                </div>
                <div class="m04-pager">
                  <span class="m04-pager-info">显示 ${pageList.length} 处 / 共 ${filtered.length} 处</span>
                  <button class="m04-pg-btn" data-pg="risk" data-pg-val="${ui.riskPage - 1}" ${ui.riskPage <= 1 ? 'disabled' : ''}>&lt;</button>
                  ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
                    `<button class="m04-pg-btn ${p === ui.riskPage ? 'active' : ''}" data-pg="risk" data-pg-val="${p}">${p}</button>`
                  ).join('')}
                  <button class="m04-pg-btn" data-pg="risk" data-pg-val="${ui.riskPage + 1}" ${ui.riskPage >= totalPages ? 'disabled' : ''}>&gt;</button>
                </div>
              </div>
            </div>

            <div class="m04-panel">
              <div class="m04-panel-head">
                <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">风险等级分布</span></div>
              </div>
              <div class="m04-panel-body">
                <div class="m04-dist-grid">
                  <div class="m04-dist-box"><span>重大</span><strong class="m04-c-red">${lvCounts['重大']} 处</strong></div>
                  <div class="m04-dist-box"><span>较大</span><strong class="m04-c-gold">${lvCounts['较大']} 处</strong></div>
                  <div class="m04-dist-box"><span>一般</span><strong class="m04-c-blue">${lvCounts['一般']} 处</strong></div>
                  <div class="m04-dist-box"><span>低风险</span><strong class="m04-c-green">${lvCounts['低风险']} 处</strong></div>
                </div>
              </div>
            </div>
          </div>

          <!-- Center: 风险点位分布 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">风险点位分布</span></div>
              <span class="m04-panel-sub">点位示意</span>
            </div>
            <div class="m04-panel-body">
              <div class="m04-map-toolbar">
                <div class="m04-chk-group">
                  <label class="m04-chk"><input type="checkbox" data-risk-layer="risk" ${ui.riskLayers.risk ? 'checked' : ''} /><span>风险点</span></label>
                  <label class="m04-chk"><input type="checkbox" data-risk-layer="hazard" ${ui.riskLayers.hazard ? 'checked' : ''} /><span>隐患</span></label>
                  <label class="m04-chk"><input type="checkbox" data-risk-layer="video" ${ui.riskLayers.video ? 'checked' : ''} /><span>视频</span></label>
                </div>
                <div style="display:flex;align-items:center;gap:12px;color:#cfe4ff;">
                  <span><span style="color:#facc15;">●</span> 风险点</span>
                  <span><span style="color:#38f2ff;">●</span> 当前选中</span>
                </div>
              </div>

              <div class="m04-map-frame">
                <img class="m04-map-bg" src="${IMG.corridor}" alt="吉黑高速风险点位分布走廊" />
                <svg viewBox="0 0 100 100" preserveAspectRatio="none" style="position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:2;">
                  <defs>
                    <linearGradient id="m04-route-grad" x1="0" y1="1" x2="1" y2="0">
                      <stop offset="0%" stop-color="#38f2ff" stop-opacity="0.85"/>
                      <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.92"/>
                    </linearGradient>
                  </defs>
                  <path d="M 38 96 C 43 78, 49 62, 56 44 C 63 28, 74 16, 92 4" fill="none" stroke="rgba(56,242,255,0.28)" stroke-width="4.5"/>
                  <path d="M 38 96 C 43 78, 49 62, 56 44 C 63 28, 74 16, 92 4" fill="none" stroke="url(#m04-route-grad)" stroke-width="0.9" stroke-dasharray="2.5 1.5"/>
                </svg>

                ${ui.riskLayers.risk ? mapRisks.map(r => {
                  const isSel = r.id === selRisk.id;
                  return `
                    <div class="m04-map-pin ${isSel ? 'selected' : ''}" data-select-risk="${r.id}" style="left:${r.x}%;top:${r.y}%;" title="${escHtml(r.id)} ${escHtml(r.name)} (${escHtml(secName(r.secId))})">
                      <div class="m04-map-label">
                        <div>${escHtml(r.id)}<span class="m04-map-pin-name">${escHtml(r.name)}</span></div>
                        ${isSel ? `<div class="m04-map-sec-chip">${escHtml(secName(r.secId))}</div>` : ''}
                      </div>
                      <span class="m04-pin-dot"></span>
                    </div>
                  `;
                }).join('') : ''}

                ${mapHazards.map((h, i) => {
                  const r = store.riskPoints.find(rp => rp.secId === h.secId) || store.riskPoints[i % store.riskPoints.length];
                  return `
                    <div class="m04-pin-hazard" data-open-hazard="${h.id}" style="left:${Math.min(90, r.x + 7)}%;top:${Math.min(90, r.y + 5)}%;" title="${escHtml(h.desc)}">
                      ⚠ ${escHtml(h.id.slice(-6))}
                    </div>
                  `;
                }).join('')}

                ${ui.riskLayers.video ? mapRisks.slice(0, 6).map(r => `
                  <div class="m04-pin-cam" data-play-risk-cam="${r.id}" style="left:${Math.max(10, r.x - 8)}%;top:${Math.min(92, r.y + 4)}%;">
                    📹 ${escHtml(r.camCode)}
                  </div>
                `).join('') : ''}
              </div>

              <div class="m04-map-footer">
                <button class="m04-text-link" data-fly-dir="start">&lt; 明水方向</button>
                <span>G1211 明水至北安段</span>
                <button class="m04-text-link" data-fly-dir="end">北安方向 &gt;</button>
              </div>
            </div>
          </div>

          <!-- Right: 风险点位档案 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">风险点位档案</span></div>
            </div>
            <div class="m04-panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <strong style="font-size:15px;color:#ffffff;">${escHtml(selRisk.id)} &nbsp; ${escHtml(selRisk.category)}</strong>
                <span class="m04-tag m04-tag-amber">${escHtml(selRisk.status)}</span>
              </div>

              <div class="m04-kv-list">
                <div class="m04-kv-row"><span>工程位置</span><strong>${escHtml(selRisk.location)}</strong></div>
                <div class="m04-kv-row"><span>所属工区</span><strong>${escHtml(secName(selRisk.secId))}</strong></div>
                <div class="m04-kv-row"><span>评估等级</span><strong class="${selLevel.textCls}">${escHtml(selRisk.level)}风险</strong></div>
                <div class="m04-kv-row"><span>责任单位</span><strong>${escHtml(selRisk.unit)}</strong></div>
              </div>

              <div class="m04-measures-box">
                <div class="m04-measures-title">管控措施</div>
                <div class="m04-chip-row">
                  ${selRisk.measures.map(m => `<span class="m04-chip">${escHtml(m)}</span>`).join('')}
                </div>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;">
                <span style="font-size:12.5px;font-weight:600;color:#dbeafe;">现场视频</span>
                <button class="m04-text-link" data-action="open-risk-inspection" data-risk-id="${selRisk.id}">查看巡检成果 &gt;</button>
              </div>

              <div class="m04-video-box" data-play-risk-cam="${selRisk.id}">
                <img src="${IMG[selRisk.imgKey]}" alt="${escHtml(selRisk.name)}" />
                <button class="media-center-play" type="button" title="播放现场监控">${SVG.play}</button>
                <span class="m04-video-tag">视频示意</span>
              </div>

              <div class="m04-linked-box">
                <div>
                  <div style="font-size:12.5px;font-weight:700;color:#ffffff;">关联隐患 &nbsp; ${escHtml(linkedHazard.id)}</div>
                  <div style="font-size:11.5px;color:#9ec0e6;margin-top:2px;">${escHtml(linkedHazard.desc)}</div>
                </div>
                <span class="m04-tag ${linkedMeta.cls}">${linkedMeta.label}</span>
              </div>

              <div class="m04-btn-pair">
                <button class="btn-primary-glow" style="padding:7px 10px;font-size:12.5px;" data-open-hazard="${linkedHazard.id}">查看关联隐患</button>
                <button class="m04-btn-ghost" style="height:auto;justify-content:center;padding:7px 10px;" data-action="edit-risk-measures" data-risk-id="${selRisk.id}">维护管控记录</button>
              </div>

              <div class="m04-panel-foot">
                <span>同步于 2026-11-25 10:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 3: 视频AI预警 (03_视频AI预警.png)
     ------------------------------------------------------------------------ */
  function renderAiAlertPage(ctx) {
    const secId = getActiveSecId(ctx);
    const scopeAlerts = getFilteredAiAlerts(secId, ui.period, false);
    const aiStats = computeAiStats(scopeAlerts);

    // List matches user's status filter, or defaults to 待核实 list when status=all (matching mockup 03_视频AI预警.png)
    let listAlerts = getFilteredAiAlerts(secId, ui.period, true);
    let listTitle = '待核实预警';
    if (ui.aiStatus === 'all') {
      const pendingOnly = listAlerts.filter(a => a.status === '待核实');
      listAlerts = pendingOnly.length ? pendingOnly : listAlerts;
      listTitle = pendingOnly.length ? '待核实预警' : '全部AI预警';
    } else {
      listTitle = `${ui.aiStatus}预警`;
    }

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(listAlerts.length / pageSize));
    if (ui.aiPage > totalPages) ui.aiPage = totalPages;
    const pageAlerts = listAlerts.slice((ui.aiPage - 1) * pageSize, ui.aiPage * pageSize);

    if (!listAlerts.some(a => a.id === ui.selectedAiId)) {
      ui.selectedAiId = listAlerts[0] ? listAlerts[0].id : (scopeAlerts[0] ? scopeAlerts[0].id : store.aiAlerts[0].id);
    }
    const selAlert = store.aiAlerts.find(a => a.id === ui.selectedAiId) || store.aiAlerts[0];
    const draftNote = ui.aiNotes[selAlert.id] !== undefined ? ui.aiNotes[selAlert.id] : (selAlert.note || '');
    const frameTime = selAlert.frames[ui.aiActiveFrameIdx] || selAlert.frames[1] || '09:12:18';
    const curSecStr = `00:${String(ui.aiScrubSec).padStart(2, '0')} / 00:30`;

    return `
      <div class="m04-page m04-compact">
        <!-- Top Filter Bar -->
        <div class="m04-filter-bar">
          <div class="m04-filter-group">
            <div class="m04-filter-item">
              <label>所属工区</label>
              <select class="m04-select" data-action="global-sec">${sectionOptionsHtml(secId)}</select>
            </div>
            <div class="m04-filter-item">
              <label>识别算法</label>
              <select class="m04-select" data-filter="aiAlgo">
                <option value="all" ${ui.aiAlgo === 'all' ? 'selected' : ''}>全部算法</option>
                ${AI_ALGORITHMS.map(al => `<option value="${al}" ${ui.aiAlgo === al ? 'selected' : ''}>${al}</option>`).join('')}
              </select>
            </div>
            <div class="m04-filter-item">
              <label>核实状态</label>
              <select class="m04-select" data-filter="aiStatus">
                <option value="all" ${ui.aiStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="待核实" ${ui.aiStatus === '待核实' ? 'selected' : ''}>待核实</option>
                <option value="已确认" ${ui.aiStatus === '已确认' ? 'selected' : ''}>已确认</option>
                <option value="已标误报" ${ui.aiStatus === '已标误报' ? 'selected' : ''}>已标误报</option>
                <option value="重复关联" ${ui.aiStatus === '重复关联' ? 'selected' : ''}>重复关联</option>
              </select>
            </div>
            <div class="m04-filter-item">
              <label>统计周期</label>
              <select class="m04-select" data-filter="period">
                <option value="2026-11" ${ui.period === '2026-11' ? 'selected' : ''}>2026年11月</option>
                <option value="2026-10" ${ui.period === '2026-10' ? 'selected' : ''}>2026年10月</option>
                <option value="2026-09" ${ui.period === '2026-09' ? 'selected' : ''}>2026年09月</option>
              </select>
            </div>
          </div>
          <div class="m04-filter-actions">
            <button class="m04-btn-query" data-action="query-toast">${SVG.search}<span>查询</span></button>
            <button class="m04-btn-ghost" data-action="reset-ai">${SVG.refresh}<span>重置</span></button>
          </div>
        </div>

        <!-- 视频AI预警概况 -->
        <div class="m04-panel">
          <div class="m04-panel-head">
            <div class="m04-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">视频AI预警概况</span>
              <span class="m04-panel-sub">(${periodLabel(ui.period)})</span>
            </div>
          </div>
          <div class="m04-panel-body">
            <div class="m04-kpi-grid-5">
              <div class="m04-kpi-card" data-ai-status-pick="all">
                <div class="m04-kpi-ico m04-ico-blue">${SVG.camera}</div>
                <div><div class="m04-kpi-label">本期预警</div><div class="m04-kpi-val m04-c-cyan">${aiStats.total}<span class="m04-kpi-unit">条</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ai-status-pick="待核实">
                <div class="m04-kpi-ico m04-ico-gold">${SVG.warnTri}</div>
                <div><div class="m04-kpi-label">待核实</div><div class="m04-kpi-val m04-c-gold">${aiStats.pending}<span class="m04-kpi-unit">条</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ai-status-pick="已确认">
                <div class="m04-kpi-ico m04-ico-green">${SVG.checkCircle}</div>
                <div><div class="m04-kpi-label">已确认</div><div class="m04-kpi-val m04-c-green">${aiStats.confirmed}<span class="m04-kpi-unit">条</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ai-status-pick="已标误报">
                <div class="m04-kpi-ico m04-ico-blue">${SVG.xCircle}</div>
                <div><div class="m04-kpi-label">已标误报</div><div class="m04-kpi-val m04-c-blue">${aiStats.falseAlarm}<span class="m04-kpi-unit">条</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ai-status-pick="重复关联">
                <div class="m04-kpi-ico m04-ico-cyan">${SVG.link}</div>
                <div><div class="m04-kpi-label">重复关联</div><div class="m04-kpi-val m04-c-cyan">${aiStats.duplicate}<span class="m04-kpi-unit">条</span></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3-Column AI Workspace -->
        <div class="m04-cols-3">
          <!-- Left: 待核实预警列表 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">${listTitle}</span></div>
              <span class="m04-panel-sub">${listAlerts.length} 条</span>
            </div>
            <div class="m04-panel-body">
              <div class="m04-card-list">
                ${pageAlerts.length ? pageAlerts.map(a => `
                  <div class="m04-list-card ${a.id === selAlert.id ? 'active' : ''}" data-select-ai="${a.id}">
                    <div class="m04-card-ico" style="width:30px;height:30px;">${SVG.camera}</div>
                    <div class="m04-card-main">
                      <div class="m04-card-title">${escHtml(a.id)}</div>
                      <div class="m04-card-sub">${escHtml(a.shortTime)} &nbsp; ${escHtml(a.shortLoc)}</div>
                      <div class="m04-card-sub" style="color:#cfe4ff;">${escHtml(a.event)}</div>
                    </div>
                    <span class="m04-tag ${getAiStatusTag(a.status)}">${escHtml(a.status)}</span>
                  </div>
                `).join('') : `<div style="color:#8ab4dc;text-align:center;padding:24px;">当前条件下暂无预警记录</div>`}
              </div>
              <div class="m04-pager">
                <span class="m04-pager-info">显示 ${pageAlerts.length} 条 / 共 ${listAlerts.length} 条</span>
                <button class="m04-pg-btn" data-pg="ai" data-pg-val="${ui.aiPage - 1}" ${ui.aiPage <= 1 ? 'disabled' : ''}>&lt;</button>
                ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p =>
                  `<button class="m04-pg-btn ${p === ui.aiPage ? 'active' : ''}" data-pg="ai" data-pg-val="${p}">${p}</button>`
                ).join('')}
                <button class="m04-pg-btn" data-pg="ai" data-pg-val="${ui.aiPage + 1}" ${ui.aiPage >= totalPages ? 'disabled' : ''}>&gt;</button>
              </div>
            </div>
          </div>

          <!-- Center: 预警证据回看 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">预警证据回看</span></div>
              <span class="m04-panel-sub">${escHtml(selAlert.window)}</span>
            </div>
            <div class="m04-panel-body">
              <div class="m04-evidence-frame">
                <img src="${IMG[selAlert.imgKey] || IMG.corridor}" alt="AI预警视频证据" />
                <div class="m04-cam-hud">
                  <span class="m04-hud-pill">${escHtml(selAlert.camera)}</span>
                  <span class="m04-hud-pill">${escHtml(selAlert.time.slice(0, 10))} ${escHtml(frameTime)}</span>
                </div>
                <div class="m04-detect-box" style="left:${selAlert.box.left}%;top:${selAlert.box.top}%;width:${selAlert.box.width}%;height:${selAlert.box.height}%;">
                  <div class="m04-detect-label">${escHtml(selAlert.event)}</div>
                </div>
                <span class="m04-video-tag">监控画面示意</span>
              </div>

              <div class="m04-player-bar">
                <button class="mini-ctrl-btn" data-action="ai-play-toggle" title="播放/暂停">${ui.aiPlaying ? SVG.pause : SVG.play}</button>
                <input class="mini-scrubber" type="range" min="0" max="30" value="${ui.aiScrubSec}" data-action="ai-scrub" />
                <span class="mini-time">${curSecStr}</span>
                <button class="mini-ctrl-btn" data-action="ai-mute-toggle" title="静音">${ui.aiMuted ? SVG.mute : SVG.volume}</button>
                <button class="mini-ctrl-btn" data-action="ai-expand-video" title="放大回看">${SVG.fullscreen}</button>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;margin-top:6px;">
                <span style="font-size:12.5px;font-weight:600;color:#dbeafe;">关联截图</span>
                <span class="m04-panel-sub">选中 ${escHtml(frameTime)}</span>
              </div>
              <div class="m04-thumbs-grid">
                ${selAlert.frames.map((ft, idx) => `
                  <div class="m04-thumb-card ${idx === ui.aiActiveFrameIdx ? 'active' : ''}" data-ai-frame="${idx}">
                    <img src="${IMG[selAlert.imgKey] || IMG.corridor}" alt="${escHtml(ft)}" style="filter:brightness(${idx === 1 ? 1.05 : idx === 0 ? 0.94 : 0.98});" />
                    <div class="m04-thumb-time">${escHtml(ft)}</div>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <!-- Right: 人工核实 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">人工核实</span></div>
            </div>
            <div class="m04-panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:7px;">
                <strong style="font-size:14.5px;color:#ffffff;">${escHtml(selAlert.id)}</strong>
                <span class="m04-tag ${getAiStatusTag(selAlert.status)}">${escHtml(selAlert.status)}</span>
              </div>

              <div class="m04-kv-list" style="margin-bottom:7px;">
                <div class="m04-kv-row"><span>预警时间</span><strong>${escHtml(selAlert.time)}</strong></div>
                <div class="m04-kv-row"><span>所属工区</span><strong>${escHtml(secName(selAlert.secId))}</strong></div>
                <div class="m04-kv-row"><span>工程位置</span><strong>${escHtml(selAlert.location)}</strong></div>
                <div class="m04-kv-row"><span>来源设备</span><strong>${escHtml(selAlert.camera)}</strong></div>
                <div class="m04-kv-row"><span>识别算法</span><strong>${escHtml(selAlert.algorithm)}</strong></div>
                <div class="m04-kv-row"><span>识别事件</span><strong class="m04-c-gold">${escHtml(selAlert.event)}</strong></div>
              </div>

              <div class="m04-form-field" style="margin-bottom:7px;">
                <label>核实说明</label>
                <textarea class="m04-textarea" style="min-height:54px;height:54px;" data-input="aiNote" data-ai-id="${selAlert.id}" placeholder="结合视频回放及截图填写核实依据">${escHtml(draftNote)}</textarea>
              </div>

              <button class="btn-primary-glow" style="margin-bottom:7px;" data-action="ai-confirm" data-ai-id="${selAlert.id}">
                ${SVG.checkCircle}<span>${selAlert.status === '已确认' ? '已转入隐患台账（点击查看）' : '确认并转入隐患台账'}</span>
              </button>

              <div class="m04-btn-pair" style="margin-bottom:7px;">
                <button class="m04-btn-ghost" style="height:34px;justify-content:center;" data-action="ai-false" data-ai-id="${selAlert.id}">${SVG.xCircle}<span>标记误报</span></button>
                <button class="m04-btn-ghost" style="height:34px;justify-content:center;" data-action="ai-duplicate" data-ai-id="${selAlert.id}">${SVG.link}<span>关联重复</span></button>
              </div>

              <div style="font-size:11.5px;color:#8ab4dc;">ⓘ 重复线索可关联已有隐患编号${selAlert.linkedHazardId ? `（当前关联：${escHtml(selAlert.linkedHazardId)}）` : '。'}</div>
              <div class="m04-panel-foot"><span>同步于 2026-11-25 10:45</span></div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 4: 隐患台账 (04_隐患台账.png)
     ------------------------------------------------------------------------ */
  function renderLedgerPage(ctx) {
    const secId = getActiveSecId(ctx);
    const scopeHazards = getHazardsByScope(secId, ui.period, 'all');
    const stats = computeHazardStats(scopeHazards);

    const filtered = scopeHazards.filter(h => {
      if (ui.ledgerSource !== 'all' && h.source !== ui.ledgerSource) return false;
      if (ui.ledgerStatus === '超期') {
        if (!(h.overdue && h.status !== '已销项')) return false;
      } else if (ui.ledgerStatus !== 'all' && h.status !== ui.ledgerStatus) {
        return false;
      }
      if (ui.ledgerQuery.trim()) {
        const q = ui.ledgerQuery.trim().toLowerCase();
        const hay = `${h.id} ${h.location} ${h.desc} ${h.source} ${secName(h.secId)}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    const pageSize = 7;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (ui.ledgerPage > totalPages) ui.ledgerPage = totalPages;
    const pageRows = filtered.slice((ui.ledgerPage - 1) * pageSize, ui.ledgerPage * pageSize);

    if (!filtered.some(h => h.id === ui.selectedHazardId)) {
      ui.selectedHazardId = filtered[0] ? filtered[0].id : (scopeHazards[0] ? scopeHazards[0].id : store.hazards[0].id);
    }
    const selH = store.hazards.find(h => h.id === ui.selectedHazardId) || store.hazards[0];
    const selMeta = getHazardStatusMeta(selH);

    const extRows = store.externalRecords.filter(e => !secId || e.secId === secId).filter(e => {
      if (!ui.ledgerQuery.trim()) return true;
      const q = ui.ledgerQuery.trim().toLowerCase();
      return `${e.extId} ${e.location} ${e.desc} ${e.linkedId}`.toLowerCase().includes(q);
    });

    const buildPagerNumbers = (cur, total) => {
      if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
      const set = new Set([1, 2, 3, total]);
      if (cur > 3 && cur < total) set.add(cur);
      const arr = Array.from(set).sort((a, b) => a - b);
      const out = [];
      for (let i = 0; i < arr.length; i++) {
        if (i > 0 && arr[i] - arr[i - 1] > 1) out.push('...');
        out.push(arr[i]);
      }
      return out;
    };

    return `
      <div class="m04-page">
        <!-- Top Filter Bar -->
        <div class="m04-filter-bar">
          <div class="m04-filter-group">
            <div class="m04-filter-item">
              <label>所属工区</label>
              <select class="m04-select" data-action="global-sec">${sectionOptionsHtml(secId)}</select>
            </div>
            <div class="m04-filter-item">
              <label>发现来源</label>
              <select class="m04-select" data-filter="ledgerSource">
                <option value="all" ${ui.ledgerSource === 'all' ? 'selected' : ''}>全部来源</option>
                <option value="人工巡查" ${ui.ledgerSource === '人工巡查' ? 'selected' : ''}>人工巡查</option>
                <option value="视频AI" ${ui.ledgerSource === '视频AI' ? 'selected' : ''}>视频AI</option>
                <option value="无人机巡检" ${ui.ledgerSource === '无人机巡检' ? 'selected' : ''}>无人机巡检</option>
              </select>
            </div>
            <div class="m04-filter-item">
              <label>办理状态</label>
              <select class="m04-select" data-filter="ledgerStatus">
                <option value="all" ${ui.ledgerStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="待派发" ${ui.ledgerStatus === '待派发' ? 'selected' : ''}>待派发</option>
                <option value="整改中" ${ui.ledgerStatus === '整改中' ? 'selected' : ''}>整改中</option>
                <option value="待复查" ${ui.ledgerStatus === '待复查' ? 'selected' : ''}>待复查</option>
                <option value="已销项" ${ui.ledgerStatus === '已销项' ? 'selected' : ''}>已销项</option>
                <option value="超期" ${ui.ledgerStatus === '超期' ? 'selected' : ''}>超期隐患</option>
              </select>
            </div>
            <div class="m04-filter-item">
              <label>统计周期</label>
              <select class="m04-select" data-filter="period">
                <option value="2026-11" ${ui.period === '2026-11' ? 'selected' : ''}>2026年11月</option>
                <option value="2026-10" ${ui.period === '2026-10' ? 'selected' : ''}>2026年10月</option>
                <option value="2026-09" ${ui.period === '2026-09' ? 'selected' : ''}>2026年09月</option>
              </select>
            </div>
          </div>
          <div class="m04-filter-actions">
            <button class="m04-btn-query" data-action="open-add-hazard">${SVG.plus}<span>新增人工隐患</span></button>
            <button class="m04-btn-ghost" data-action="export-ledger">${SVG.download}<span>导出台账</span></button>
          </div>
        </div>

        <!-- 隐患办理概况 -->
        <div class="m04-panel">
          <div class="m04-panel-head">
            <div class="m04-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">隐患办理概况</span>
              <span class="m04-panel-sub">(${periodLabel(ui.period)})</span>
            </div>
          </div>
          <div class="m04-panel-body">
            <div class="m04-kpi-grid-6">
              <div class="m04-kpi-card" data-ledger-pick="all">
                <div class="m04-kpi-ico m04-ico-cyan">${SVG.clipboard}</div>
                <div><div class="m04-kpi-label">本期确认隐患</div><div class="m04-kpi-val m04-c-cyan">${stats.total}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ledger-pick="待派发">
                <div class="m04-kpi-ico m04-ico-gold">${SVG.flag}</div>
                <div><div class="m04-kpi-label">待派发</div><div class="m04-kpi-val m04-c-gold">${stats.pendingDispatch}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ledger-pick="整改中">
                <div class="m04-kpi-ico m04-ico-blue">${SVG.clock}</div>
                <div><div class="m04-kpi-label">整改中</div><div class="m04-kpi-val m04-c-cyan">${stats.rectifying}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ledger-pick="待复查">
                <div class="m04-kpi-ico m04-ico-gold">${SVG.search}</div>
                <div><div class="m04-kpi-label">待复查</div><div class="m04-kpi-val m04-c-gold">${stats.pendingReview}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ledger-pick="已销项">
                <div class="m04-kpi-ico m04-ico-green">${SVG.checkCircle}</div>
                <div><div class="m04-kpi-label">已销项</div><div class="m04-kpi-val m04-c-green">${stats.closed}<span class="m04-kpi-unit">项</span></div></div>
              </div>
              <div class="m04-kpi-card" data-ledger-pick="超期">
                <div class="m04-kpi-ico m04-ico-red">${SVG.warnTri}</div>
                <div><div class="m04-kpi-label">超期隐患</div><div class="m04-kpi-val m04-c-red">${stats.overdue}<span class="m04-kpi-unit">项</span></div></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom 2 Columns -->
        <div class="m04-split-2">
          <!-- Left: 统一隐患台账 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">统一隐患台账</span></div>
              <button class="m04-tag m04-tag-red" style="cursor:pointer;" data-ledger-pick="超期">超期 ${stats.overdue} 项</button>
            </div>
            <div class="m04-panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:10px;flex-wrap:wrap;">
                <div class="m04-pill-tabs">
                  <button class="m04-pill-tab ${ui.ledgerTab === 'local' ? 'active' : ''}" data-ledger-tab="local">本平台办理 (${stats.total})</button>
                  <button class="m04-pill-tab ${ui.ledgerTab === 'external' ? 'active' : ''}" data-ledger-tab="external">外部关联记录</button>
                </div>
                <div class="m04-search-box">
                  ${SVG.search}
                  <input class="m04-input" type="text" data-input="ledgerQuery" value="${escHtml(ui.ledgerQuery)}" placeholder="搜索隐患编号或工程对象" />
                </div>
              </div>

              ${ui.ledgerTab === 'local' ? `
                <div class="m04-table-wrap">
                  <table class="m04-table">
                    <thead>
                      <tr>
                        <th>隐患编号</th><th>工程位置</th><th>发现来源</th><th>隐患描述</th><th>确认等级</th><th>期限</th><th>状态</th><th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pageRows.length ? pageRows.map(h => {
                        const sm = getHazardStatusMeta(h);
                        return `
                          <tr class="${h.id === selH.id ? 'm04-row-selected' : ''}" data-select-hazard="${h.id}">
                            <td>${escHtml(h.id)}</td>
                            <td>${escHtml(h.location)}</td>
                            <td>${escHtml(h.source)}</td>
                            <td>${escHtml(h.desc)}</td>
                            <td>${escHtml(h.level)}</td>
                            <td style="font-variant-numeric:tabular-nums;">${escHtml(h.due.slice(5))}</td>
                            <td><span class="m04-tag ${sm.cls}">${sm.label}</span></td>
                            <td><button class="m04-act-link" data-hazard-op="${h.id}" data-op-type="${sm.action}">${sm.action}</button></td>
                          </tr>
                        `;
                      }).join('') : `<tr><td colspan="8" style="text-align:center;color:#8ab4dc;padding:24px;">无匹配隐患台账记录</td></tr>`}
                    </tbody>
                  </table>
                </div>
                <div class="m04-pager">
                  <span class="m04-pager-info">共 ${filtered.length} 条记录</span>
                  <button class="m04-pg-btn" data-pg="ledger" data-pg-val="${ui.ledgerPage - 1}" ${ui.ledgerPage <= 1 ? 'disabled' : ''}>&lt;</button>
                  ${buildPagerNumbers(ui.ledgerPage, totalPages).map(item => item === '...'
                    ? `<span style="padding:0 3px;color:#789bc4;">...</span>`
                    : `<button class="m04-pg-btn ${item === ui.ledgerPage ? 'active' : ''}" data-pg="ledger" data-pg-val="${item}">${item}</button>`
                  ).join('')}
                  <button class="m04-pg-btn" data-pg="ledger" data-pg-val="${ui.ledgerPage + 1}" ${ui.ledgerPage >= totalPages ? 'disabled' : ''}>&gt;</button>
                </div>
              ` : `
                <div class="m04-table-wrap">
                  <table class="m04-table">
                    <thead>
                      <tr><th>外部编号</th><th>工程位置</th><th>外部来源</th><th>隐患描述</th><th>关联平台编号</th><th>同步时间</th><th>状态</th></tr>
                    </thead>
                    <tbody>
                      ${extRows.map(e => `
                        <tr data-select-hazard="${e.linkedId}">
                          <td>${escHtml(e.extId)}</td>
                          <td>${escHtml(e.location)}</td>
                          <td>${escHtml(e.origin)}</td>
                          <td>${escHtml(e.desc)}</td>
                          <td style="color:#38f2ff;font-weight:600;">${escHtml(e.linkedId)}</td>
                          <td style="font-variant-numeric:tabular-nums;">${escHtml(e.syncTime)}</td>
                          <td><span class="m04-tag ${e.status.includes('超期') ? 'm04-tag-red' : e.status === '已销项' ? 'm04-tag-green' : 'm04-tag-amber'}">${escHtml(e.status)}</span></td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              `}

              <div class="m04-panel-foot" style="border-top:1px solid rgba(56,189,248,0.14);margin-top:10px;">
                <span>ⓘ 平安工地记录通过来源编号关联</span>
                <button class="m04-text-link" data-action="goto-pingan">进入原平安工地系统 ↗</button>
              </div>
            </div>
          </div>

          <!-- Right: 派发整改 -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">派发整改</span></div>
            </div>
            <div class="m04-panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <strong style="font-size:15px;color:#ffffff;">${escHtml(selH.id)}</strong>
                <span class="m04-tag ${selMeta.cls}">${selMeta.label}</span>
              </div>

              <div class="m04-kv-list">
                <div class="m04-kv-row"><span>隐患描述</span><strong>${escHtml(selH.desc)}</strong></div>
                <div class="m04-kv-row"><span>工程位置</span><strong>${escHtml(selH.location)}</strong></div>
                <div class="m04-kv-row"><span>发现来源</span><strong>${escHtml(selH.source)}</strong></div>
                <div class="m04-kv-row"><span>发现时间</span><strong>${escHtml(selH.foundAt)}</strong></div>
                <div class="m04-kv-row"><span>确认等级</span><strong>${escHtml(selH.level)}</strong></div>
              </div>

              <div class="m04-form-row-inline">
                <label>责任单位</label>
                <select class="m04-select" id="m04DispatchUnit" style="width:100%;">
                  ${SECTION_META.map(s => `<option value="${s.unit}" ${s.id === selH.secId ? 'selected' : ''}>${s.unit}</option>`).join('')}
                </select>
              </div>
              <div class="m04-form-row-inline">
                <label>整改负责人</label>
                <select class="m04-select" id="m04DispatchOwner" style="width:100%;">
                  <option value="整改负责人A（演示）" ${selH.owner === '整改负责人A（演示）' ? 'selected' : ''}>整改负责人A（演示）</option>
                  <option value="整改负责人B（演示）" ${selH.owner === '整改负责人B（演示）' ? 'selected' : ''}>整改负责人B（演示）</option>
                  <option value="安全员张伟" ${selH.owner === '安全员张伟' ? 'selected' : ''}>安全员张伟</option>
                  <option value="电工班长刘涛" ${selH.owner === '电工班长刘涛' ? 'selected' : ''}>电工班长刘涛</option>
                </select>
              </div>
              <div class="m04-form-row-inline">
                <label>整改期限</label>
                <input class="m04-input" id="m04DispatchDue" type="text" value="${escHtml(selH.dueFull)}" />
              </div>
              <div class="m04-form-row-inline" style="align-items:start;">
                <label style="padding-top:6px;">整改要求</label>
                <textarea class="m04-textarea" id="m04DispatchReq" style="min-height:60px;">${escHtml(selH.req)}</textarea>
              </div>

              <div class="m04-btn-pair" style="margin-top:4px;margin-bottom:10px;">
                <button class="btn-primary-glow" style="padding:8px 10px;font-size:12.5px;" data-action="dispatch-hazard" data-hazard-id="${selH.id}">
                  ${SVG.flag}<span>${selH.status === '待派发' ? '派发整改' : selH.status === '待复查' ? '前往复查' : selH.status === '整改中' ? '提交整改申请复查' : '查看复查详情'}</span>
                </button>
                <button class="m04-btn-ghost" style="height:auto;justify-content:center;padding:8px 10px;" data-action="view-hazard-evidence" data-hazard-id="${selH.id}">
                  ${SVG.doc}<span>查看证据</span>
                </button>
              </div>

              <div style="font-size:11.5px;color:#8ab4dc;">ⓘ 派发后将通知整改负责人。</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 5: 整改复查 (05_整改复查.png)
     ------------------------------------------------------------------------ */
  function renderReviewPage(ctx) {
    const secId = getActiveSecId(ctx);
    const candidates = store.hazards.filter(h => {
      if (secId && h.secId !== secId) return false;
      if (ui.reviewStatusFilter !== 'all' && h.status !== ui.reviewStatusFilter) return false;
      return true;
    });
    const fallbackPool = store.hazards.filter(h => !secId || h.secId === secId);
    const listPool = candidates.length ? candidates : fallbackPool;

    if (!listPool.some(h => h.id === ui.selectedReviewId)) {
      const pref = listPool.find(h => h.id === 'AQ-202611-018') || listPool.find(h => h.status === '待复查') || listPool[0];
      if (pref) ui.selectedReviewId = pref.id;
    }

    const h = store.hazards.find(x => x.id === ui.selectedReviewId) || store.hazards.find(x => x.id === 'AQ-202611-018') || store.hazards[0];
    const hMeta = getHazardStatusMeta(h);
    const pendingRevCount = store.hazards.filter(x => x.status === '待复查' && (!secId || x.secId === secId)).length;

    const draft = ui.reviewDrafts[h.id] || {
      reviewer: h.reviewer || '监理复查人员A（演示）',
      reviewTime: h.reviewTime || '2026-11-25 10:20',
      reviewNote: h.reviewNote || '临边防护已补齐，现场复查情况见附件。',
      attachment: h.attachment || '复查现场照片.jpg'
    };

    const stepState = (() => {
      if (h.status === '已销项') return [true, true, true, true, true];
      if (h.status === '待复查') return [true, true, true, 'current', false];
      if (h.status === '整改中') return [true, true, 'current', false, false];
      return [true, 'current', false, false, false];
    })();

    const stepDefs = [
      { label: '已核实', sub: (h.foundAt || '11-21 10:18').slice(5) },
      { label: '已派发', sub: (h.dispatchedAt || '11-21 10:46').slice(5) },
      { label: '整改反馈', sub: (h.feedbackAt || '11-23 16:20').slice(5) },
      { label: h.status === '已销项' ? '已复查' : '待复查', sub: h.status === '已销项' ? (draft.reviewTime || '11-25 10:20').slice(5) : (h.status === '待复查' ? '当前环节' : '待办理') },
      { label: '已销项', sub: h.status === '已销项' ? '已完成' : '未完成' }
    ];

    return `
      <div class="m04-page m04-compact">
        <!-- Top Bar -->
        <div class="m04-filter-bar">
          <div class="m04-filter-group">
            <div class="m04-filter-item">
              <label>办理状态</label>
              <select class="m04-select" data-filter="reviewStatusFilter">
                <option value="待复查" ${ui.reviewStatusFilter === '待复查' ? 'selected' : ''}>待复查 (${pendingRevCount}项)</option>
                <option value="all" ${ui.reviewStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="整改中" ${ui.reviewStatusFilter === '整改中' ? 'selected' : ''}>整改中</option>
                <option value="已销项" ${ui.reviewStatusFilter === '已销项' ? 'selected' : ''}>已销项</option>
              </select>
            </div>
            <div class="m04-filter-item">
              <label>所属工区</label>
              <select class="m04-select" data-action="global-sec">${sectionOptionsHtml(secId)}</select>
            </div>
            <div class="m04-filter-item">
              <label>隐患编号</label>
              <select class="m04-select" data-filter="selectedReviewId" style="min-width:170px;">
                ${listPool.map(item => `<option value="${item.id}" ${item.id === h.id ? 'selected' : ''}>${item.id} · ${item.desc}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m04-filter-actions">
            <button class="m04-btn-ghost" data-nav="ledger">&lt; 返回隐患台账</button>
          </div>
        </div>

        <!-- 2-Column Review Workspace -->
        <div class="m04-split-2">
          <!-- Left Column: Header + Evidence + Review Form -->
          <div style="display:flex;flex-direction:column;gap:8px;">
            <!-- Header & 5-Step Flow -->
            <div class="m04-panel">
              <div class="m04-panel-head">
                <div class="m04-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">${escHtml(h.id)} &nbsp; ${escHtml(h.desc)}</span>
                </div>
                <span class="m04-tag ${hMeta.cls}">${hMeta.label}</span>
              </div>
              <div class="m04-panel-body">
                <div style="display:flex;align-items:center;gap:16px;flex-wrap:wrap;font-size:12px;color:#9ec0e6;">
                  <span>📍 ${escHtml(h.location)}</span>
                  <span>🚁 ${escHtml(h.source)}</span>
                  <span>👤 ${escHtml(secUnit(h.secId))}</span>
                  <span>📅 整改期限 ${escHtml(h.dueFull)}</span>
                </div>
                <div class="m04-steps-row">
                  ${stepDefs.map((st, idx) => {
                    const stateVal = stepState[idx];
                    const cls = stateVal === true ? 'done' : stateVal === 'current' ? 'current' : '';
                    const ico = stateVal === true
                      ? `<span class="m04-c-green">${SVG.checkCircle}</span>`
                      : stateVal === 'current'
                        ? `<span class="m04-c-gold">${SVG.clock}</span>`
                        : `<span style="color:#648cb8;">○</span>`;
                    return `
                      ${idx > 0 ? '<span class="m04-step-arrow">&gt;</span>' : ''}
                      <div class="m04-step-card ${cls}">
                        ${ico}
                        <div>
                          <div style="font-size:12.5px;font-weight:700;color:${stateVal === 'current' ? '#fde047' : '#f1f7ff'};">${st.label}</div>
                          <div style="font-size:11px;color:${stateVal === 'current' ? '#fde047' : '#8ab4dc'};">${escHtml(st.sub)}</div>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <!-- 整改前后证据 -->
            <div class="m04-panel">
              <div class="m04-panel-head">
                <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">整改前后证据</span></div>
                <span class="m04-panel-sub">${escHtml(h.location)}</span>
              </div>
              <div class="m04-panel-body">
                <div class="m04-compare-2col m04-review-photos">
                  <div>
                    <div class="m04-photo-caption">
                      <span><strong>整改前</strong> &nbsp; ${escHtml((h.foundAt || '11-21').slice(5, 10))}</span>
                      <span style="color:#8ab4dc;">${escHtml(h.source)}影像</span>
                    </div>
                    <div class="m04-photo-box" data-action="open-before-after" data-hazard-id="${h.id}">
                      <img src="${IMG.before}" alt="整改前现场影像" />
                      <div class="m04-defect-rect"></div>
                    </div>
                  </div>
                  <div>
                    <div class="m04-photo-caption">
                      <span><strong>整改后</strong> &nbsp; ${escHtml((h.feedbackAt || '11-23').slice(5, 10))}</span>
                      <span style="color:#8ab4dc;">移动端反馈照片</span>
                    </div>
                    <div class="m04-photo-box" data-action="open-before-after" data-hazard-id="${h.id}">
                      <img src="${IMG.after}" alt="整改后现场照片" />
                      <div class="m04-guardrail-bar"></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 复查办理 -->
            <div class="m04-panel">
              <div class="m04-panel-head">
                <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">复查办理</span></div>
                <span class="m04-tag m04-tag-blue">${h.status === '已销项' ? '已归档' : '意见草稿'}</span>
              </div>
              <div class="m04-panel-body">
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:9px;">
                  <div class="m04-form-row-inline" style="margin:0;">
                    <label>复查人</label>
                    <input class="m04-input" data-review-field="reviewer" data-hazard-id="${h.id}" value="${escHtml(draft.reviewer)}" />
                  </div>
                  <div class="m04-form-row-inline" style="margin:0;">
                    <label>复查时间</label>
                    <input class="m04-input" data-review-field="reviewTime" data-hazard-id="${h.id}" value="${escHtml(draft.reviewTime)}" />
                  </div>
                </div>

                <div class="m04-form-row-inline" style="align-items:start;">
                  <label style="padding-top:6px;">复查意见</label>
                  <textarea class="m04-textarea m04-review-note" style="min-height:44px;" data-review-field="reviewNote" data-hazard-id="${h.id}">${escHtml(draft.reviewNote)}</textarea>
                </div>

                <div class="m04-form-row-inline">
                  <label>复查附件</label>
                  <div style="display:flex;align-items:center;justify-content:space-between;padding:0 10px;height:30px;border-radius:6px;border:1px solid rgba(56,189,248,0.34);background:rgba(8,28,66,0.75);">
                    <span style="font-size:12px;color:#cfe4ff;">📎 ${escHtml(draft.attachment)}</span>
                    <button class="m04-text-link" data-action="open-before-after" data-hazard-id="${h.id}">查看附件 &gt;</button>
                  </div>
                </div>

                <div style="display:flex;align-items:center;gap:10px;margin-top:2px;">
                  <button class="m04-btn-query" style="height:32px;padding:0 18px;" data-action="review-approve" data-hazard-id="${h.id}">
                    ${SVG.checkCircle}<span>复查通过并销项</span>
                  </button>
                  <button class="m04-btn-gold" style="height:32px;" data-action="review-reject" data-hazard-id="${h.id}">
                    ${SVG.refresh}<span>退回重改</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: 整改反馈（移动端） -->
          <div class="m04-panel">
            <div class="m04-panel-head">
              <div class="m04-panel-head-left"><span class="panel-accent-bar"></span><span class="panel-title">整改反馈（移动端）</span></div>
            </div>
            <div class="m04-panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                <strong style="font-size:15px;color:#ffffff;">${escHtml(h.id)}</strong>
                <span class="m04-tag ${h.feedbackAt || h.status === '待复查' || h.status === '已销项' ? 'm04-tag-green' : 'm04-tag-amber'}">
                  ${h.feedbackAt || h.status === '待复查' || h.status === '已销项' ? '已提交反馈' : '等待反馈'}
                </span>
              </div>

              <div class="m04-kv-list">
                <div class="m04-kv-row"><span>提交单位</span><strong>${escHtml(secUnit(h.secId))}</strong></div>
                <div class="m04-kv-row"><span>提交人</span><strong>${escHtml(h.owner || '整改负责人A（演示）')}</strong></div>
                <div class="m04-kv-row"><span>提交时间</span><strong>${escHtml(h.feedbackAt || '2026-11-23 16:20')}</strong></div>
                <div class="m04-kv-row"><span>工程位置</span><strong>${escHtml(h.location)}</strong></div>
              </div>

              <div class="m04-form-field">
                <label>整改说明</label>
                <div style="padding:10px 12px;border-radius:7px;background:rgba(8,28,66,0.75);border:1px solid rgba(56,189,248,0.28);color:#e2f0ff;font-size:12.5px;min-height:62px;">
                  ${escHtml(h.afterNote || '已完成现场整改并加固防护措施，申请监理复查。')}
                </div>
              </div>

              <div class="m04-form-field">
                <label>整改照片</label>
                <div class="m04-compare-2col">
                  <div style="text-align:center;">
                    <div class="m04-photo-box" style="aspect-ratio:16/10;" data-action="open-before-after" data-hazard-id="${h.id}">
                      <img src="${IMG.after}" alt="现场照片 1" />
                      <div class="m04-guardrail-bar"></div>
                    </div>
                    <div style="font-size:11.5px;color:#9ec0e6;margin-top:4px;">现场照片 1</div>
                  </div>
                  <div style="text-align:center;">
                    <div class="m04-photo-box" style="aspect-ratio:16/10;" data-action="open-before-after" data-hazard-id="${h.id}">
                      <img src="${IMG.showcase}" alt="现场照片 2" />
                      <div class="m04-guardrail-bar" style="bottom:32%;"></div>
                    </div>
                    <div style="font-size:11.5px;color:#9ec0e6;margin-top:4px;">现场照片 2</div>
                  </div>
                </div>
              </div>

              <div class="m04-review-banner" style="margin-top:6px;">
                ${SVG.checkCircle}
                <span>${h.status === '已销项' ? '复查已通过，隐患闭环销项' : '整改反馈已提交，等待复查'}</span>
              </div>

              <div class="m04-panel-foot m04-foot-fab-clear" style="margin-top:8px;">
                <span>提交于 ${escHtml(h.feedbackAt || '2026-11-23 16:20')}</span>
                <button class="m04-text-link" data-action="open-before-after" data-hazard-id="${h.id}">查看原始反馈 &gt;</button>
              </div>
              <div class="m04-panel-foot" style="padding-top:4px;">
                <span>同步于 2026-11-25 10:45</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     ACTIONS & MODALS
     ------------------------------------------------------------------------ */
  function openBeforeAfterModal(hazardId) {
    const h = store.hazards.find(x => x.id === hazardId) || store.hazards[0];
    if (!lastCtx) return;
    lastCtx.openModal(`整改前后对比与复查附件 · ${h.id}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>隐患位置</span><strong style="font-size:13.5px;">${escHtml(h.location)}</strong></div>
        <div class="detail-stat-card"><span>发现来源</span><strong style="font-size:14px;">${escHtml(h.source)}</strong></div>
        <div class="detail-stat-card"><span>当前状态</span><strong style="font-size:14px;">${escHtml(getHazardStatusMeta(h).label)}</strong></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
        <div>
          <div style="font-size:12px;color:#fde047;margin-bottom:6px;font-weight:600;">整改前（${escHtml(h.foundAt)}）</div>
          <div class="m04-photo-box" style="aspect-ratio:16/10;cursor:default;">
            <img src="${IMG.before}" alt="整改前" />
            <div class="m04-defect-rect"></div>
          </div>
          <p style="font-size:12px;color:#cfe4ff;margin-top:6px;">${escHtml(h.beforeNote || h.desc)}</p>
        </div>
        <div>
          <div style="font-size:12px;color:#4ade80;margin-bottom:6px;font-weight:600;">整改后（${escHtml(h.feedbackAt || '待上传')}）</div>
          <div class="m04-photo-box" style="aspect-ratio:16/10;cursor:default;">
            <img src="${IMG.after}" alt="整改后" />
            <div class="m04-guardrail-bar"></div>
          </div>
          <p style="font-size:12px;color:#cfe4ff;margin-top:6px;">${escHtml(h.afterNote || '待现场施工单位提交整改照片。')}</p>
        </div>
      </div>
    `);
  }

  function openAddHazardModal() {
    if (!lastCtx) return;
    const secId = getActiveSecId(lastCtx) || 'sec2';
    lastCtx.openModal('新增人工巡查隐患', `
      <form id="m04AddHazardForm" style="display:flex;flex-direction:column;gap:10px;">
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="m04-form-field" style="margin:0;">
            <label>所属工区</label>
            <select class="m04-select" name="secId" style="width:100%;">
              ${SECTION_META.map(s => `<option value="${s.id}" ${s.id === secId ? 'selected' : ''}>${s.name}</option>`).join('')}
            </select>
          </div>
          <div class="m04-form-field" style="margin:0;">
            <label>风险类别</label>
            <select class="m04-select" name="category" style="width:100%;">
              ${RISK_CATEGORIES.map(c => `<option value="${c}">${c}</option>`).join('')}
            </select>
          </div>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;">
          <div class="m04-form-field" style="margin:0;">
            <label>工程位置</label>
            <input class="m04-input" name="location" required value="桥梁示例A · 4号墩作业平台" />
          </div>
          <div class="m04-form-field" style="margin:0;">
            <label>整改期限</label>
            <input class="m04-input" name="due" required value="2026-11-28" />
          </div>
        </div>
        <div class="m04-form-field" style="margin:0;">
          <label>隐患描述</label>
          <input class="m04-input" name="desc" required placeholder="例如：高处作业临边防护网局部松动" />
        </div>
        <div class="m04-form-field" style="margin:0;">
          <label>整改要求</label>
          <textarea class="m04-textarea" name="req">立即停工整改并补齐标准防护设施，拍照提交复查。</textarea>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">
          <button type="button" class="m04-btn-ghost" id="m04CancelAdd">取消</button>
          <button type="submit" class="m04-btn-query">确认登记并生成台账</button>
        </div>
      </form>
    `);

    const form = document.getElementById('m04AddHazardForm');
    const cancel = document.getElementById('m04CancelAdd');
    if (cancel) cancel.addEventListener('click', () => lastCtx.closeModal());
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        const sId = fd.get('secId');
        const newId = `AQ-202611-${String(store.nextHazardSeq++).padStart(3, '0')}`;
        const due = String(fd.get('due') || '2026-11-28').slice(0, 10);
        const desc = String(fd.get('desc') || '现场安全防护缺项').trim();
        const locRaw = String(fd.get('location') || '现场作业面').trim();
        const locFull = locRaw.startsWith(secName(sId)) ? locRaw : `${secName(sId)} · ${locRaw}`;

        store.hazards.unshift({
          id: newId,
          period: ui.period,
          secId: sId,
          location: locFull,
          source: '人工巡查',
          category: String(fd.get('category') || '高处作业'),
          desc,
          level: '一般隐患',
          due,
          dueFull: `${due} 17:00`,
          status: '待派发',
          overdue: false,
          foundAt: '2026-11-25 10:45',
          owner: '整改负责人A（演示）',
          req: String(fd.get('req') || '限期整改到位。'),
          beforeNote: `人工巡查登记：${desc}`,
          afterNote: '',
          reviewer: '监理复查人员A（演示）',
          reviewTime: '',
          reviewNote: ''
        });
        store.activities.unshift({
          id: 'act_' + Date.now(),
          title: `${secName(sId)} · ${desc}`,
          time: '11-25 10:45',
          code: newId,
          status: '待派发',
          tagClass: 'm04-tag-amber',
          secId: sId,
          icon: 'flag'
        });
        ui.selectedHazardId = newId;
        ui.ledgerPage = 1;
        lastCtx.closeModal();
        lastCtx.showToast(`已新增隐患台账：${newId}`);
        rerender();
      });
    }
  }

  function exportLedgerCsv(secId) {
    const list = getHazardsByScope(secId, ui.period, 'all');
    const header = ['隐患编号', '工区', '工程位置', '发现来源', '风险类别', '隐患描述', '确认等级', '整改期限', '状态'];
    const lines = [header.join(',')].concat(
      list.map(h => [
        h.id, secName(h.secId), h.location, h.source, h.category, h.desc, h.level, h.due, getHazardStatusMeta(h).label
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(','))
    );
    const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `吉黑高速安全隐患台账_${ui.period}.csv`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    if (lastCtx) lastCtx.showToast(`已导出 ${list.length} 条隐患台账 CSV 文件`);
  }

  function handleDuplicateLinkModal(aiId) {
    const alertObj = store.aiAlerts.find(a => a.id === aiId);
    if (!alertObj || !lastCtx) return;
    const sameSecHazards = store.hazards.filter(h => h.status !== '已销项' && h.secId === alertObj.secId);
    const pool = sameSecHazards.length ? sameSecHazards : store.hazards.filter(h => h.status !== '已销项').slice(0, 6);

    lastCtx.openModal(`关联已有隐患 · ${alertObj.id}`, `
      <p style="color:#cfe4ff;font-size:12.5px;">选择与本条视频AI预警属于同一现场问题的已有隐患编号，完成去重关联：</p>
      <div class="m04-card-list">
        ${pool.map(h => `
          <div class="m04-list-card" data-dup-pick="${h.id}" style="cursor:pointer;">
            <div class="m04-card-main">
              <div class="m04-card-title">${escHtml(h.id)} · ${escHtml(h.desc)}</div>
              <div class="m04-card-sub">${escHtml(h.location)} | 来源：${escHtml(h.source)} | 期限：${escHtml(h.due)}</div>
            </div>
            <span class="m04-tag ${getHazardStatusMeta(h).cls}">${getHazardStatusMeta(h).label}</span>
          </div>
        `).join('')}
      </div>
    `);

    document.querySelectorAll('[data-dup-pick]').forEach(card => {
      card.addEventListener('click', () => {
        const targetId = card.dataset.dupPick;
        alertObj.status = '重复关联';
        alertObj.linkedHazardId = targetId;
        alertObj.note = ui.aiNotes[aiId] || `已关联既有隐患 ${targetId}`;
        lastCtx.closeModal();
        lastCtx.showToast(`已将 ${aiId} 关联至已有隐患 ${targetId}`);
        rerender();
      });
    });
  }

  function handleRiskMeasureModal(riskId) {
    const r = store.riskPoints.find(x => x.id === riskId);
    if (!r || !lastCtx) return;
    lastCtx.openModal(`维护管控记录 · ${r.id} ${r.name}`, `
      <form id="m04RiskEditForm" style="display:flex;flex-direction:column;gap:10px;">
        <div class="m04-form-field" style="margin:0;">
          <label>当前管控状态</label>
          <select class="m04-select" name="status" style="width:100%;">
            <option value="管控中" ${r.status === '管控中' ? 'selected' : ''}>管控中</option>
            <option value="重点盯控" ${r.status === '重点盯控' ? 'selected' : ''}>重点盯控</option>
            <option value="正常受控" ${r.status === '正常受控' ? 'selected' : ''}>正常受控</option>
          </select>
        </div>
        <div class="m04-form-field" style="margin:0;">
          <label>管控措施标签（以中文逗号或空格分隔）</label>
          <input class="m04-input" name="measures" value="${escHtml(r.measures.join('，'))}" />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">
          <button type="button" class="m04-btn-ghost" id="m04CancelRiskEdit">取消</button>
          <button type="submit" class="m04-btn-query">保存管控记录</button>
        </div>
      </form>
    `);
    const cancel = document.getElementById('m04CancelRiskEdit');
    if (cancel) cancel.addEventListener('click', () => lastCtx.closeModal());
    const form = document.getElementById('m04RiskEditForm');
    if (form) {
      form.addEventListener('submit', e => {
        e.preventDefault();
        const fd = new FormData(form);
        r.status = String(fd.get('status') || r.status);
        const raw = String(fd.get('measures') || '').split(/[，,\s]+/).map(s => s.trim()).filter(Boolean);
        if (raw.length) r.measures = raw;
        lastCtx.closeModal();
        lastCtx.showToast(`已更新 ${r.id} 管控措施与状态`);
        rerender();
      });
    }
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE EVENT DELEGATION
     ------------------------------------------------------------------------ */
  function bindEvents(hostEl, subPageId, ctx) {
    // Select / filter changes
    hostEl.querySelectorAll('select[data-action="global-sec"]').forEach(sel => {
      sel.addEventListener('change', e => toggleGlobalSection(e.target.value));
    });
    hostEl.querySelectorAll('select[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        const k = sel.dataset.filter;
        ui[k] = e.target.value;
        if (k === 'category' || k === 'period') ui.overviewPage = 1;
        if (k === 'riskCategory' || k === 'riskLevel') ui.riskPage = 1;
        if (k === 'aiAlgo' || k === 'aiStatus' || k === 'period') ui.aiPage = 1;
        if (k === 'ledgerSource' || k === 'ledgerStatus' || k === 'period') ui.ledgerPage = 1;
        rerender();
      });
    });

    // Search & text inputs
    hostEl.querySelectorAll('input[data-input], textarea[data-input]').forEach(inp => {
      inp.addEventListener('input', e => {
        const k = inp.dataset.input;
        if (k === 'aiNote') {
          ui.aiNotes[inp.dataset.aiId] = e.target.value;
        } else {
          const pos = e.target.selectionStart;
          ui[k] = e.target.value;
          if (k === 'riskQuery') ui.riskPage = 1;
          if (k === 'ledgerQuery') ui.ledgerPage = 1;
          rerender();
          const nextInp = hostEl.querySelector(`input[data-input="${k}"]`);
          if (nextInp) {
            nextInp.focus();
            if (typeof pos === 'number' && nextInp.setSelectionRange) {
              nextInp.setSelectionRange(pos, pos);
            }
          }
        }
      });
      if (inp.tagName === 'INPUT') {
        inp.addEventListener('keydown', e => {
          if (e.key === 'Enter') rerender();
        });
      }
    });

    // Review draft inputs
    hostEl.querySelectorAll('[data-review-field]').forEach(el => {
      el.addEventListener('input', () => {
        const hid = el.dataset.hazardId;
        const field = el.dataset.reviewField;
        if (!ui.reviewDrafts[hid]) {
          const h = store.hazards.find(x => x.id === hid);
          ui.reviewDrafts[hid] = {
            reviewer: (h && h.reviewer) || '监理复查人员A（演示）',
            reviewTime: (h && h.reviewTime) || '2026-11-25 10:20',
            reviewNote: (h && h.reviewNote) || '临边防护已补齐，现场复查情况见附件。',
            attachment: (h && h.attachment) || '复查现场照片.jpg'
          };
        }
        ui.reviewDrafts[hid][field] = el.value;
      });
    });

    // Risk map layer checkboxes
    hostEl.querySelectorAll('[data-risk-layer]').forEach(chk => {
      chk.addEventListener('change', () => {
        ui.riskLayers[chk.dataset.riskLayer] = chk.checked;
        rerender();
      });
    });

    // AI Scrubber
    const scrub = hostEl.querySelector('[data-action="ai-scrub"]');
    if (scrub) {
      scrub.addEventListener('input', e => {
        ui.aiScrubSec = Number(e.target.value);
        ui.aiActiveFrameIdx = ui.aiScrubSec < 12 ? 0 : ui.aiScrubSec < 22 ? 1 : 2;
        rerender();
      });
    }

    // Delegated click handlers inside hostEl
    hostEl.onclick = e => {
      // 1. Subpage navigation
      const navEl = e.target.closest('[data-nav]');
      if (navEl && !e.target.closest('[data-hazard-op]')) {
        const targetPage = navEl.dataset.nav;
        if (navEl.dataset.ledgerStatus) ui.ledgerStatus = navEl.dataset.ledgerStatus;
        ctx.switchModule('safety', targetPage);
        return;
      }

      // 2. Bar chart section click
      const barCol = e.target.closest('[data-bar-sec]');
      if (barCol) {
        const targetSec = barCol.dataset.barSec;
        const curSec = getActiveSecId(ctx);
        toggleGlobalSection(curSec === targetSec ? '' : targetSec);
        return;
      }

      // 3. Quick tabs (Overview)
      const qTab = e.target.closest('[data-quick-tab]');
      if (qTab) {
        ui.overviewQuickTab = qTab.dataset.quickTab;
        ui.overviewPage = 1;
        rerender();
        return;
      }

      // 4. Pagination
      const pgBtn = e.target.closest('[data-pg]');
      if (pgBtn && !pgBtn.disabled) {
        const target = pgBtn.dataset.pg;
        const val = Number(pgBtn.dataset.pgVal);
        if (target === 'overview') ui.overviewPage = val;
        if (target === 'risk') ui.riskPage = val;
        if (target === 'ai') ui.aiPage = val;
        if (target === 'ledger') ui.ledgerPage = val;
        rerender();
        return;
      }

      // 5. Hazard operation button (复查 / 催办 / 派发 / 查看)
      const opBtn = e.target.closest('[data-hazard-op]');
      if (opBtn) {
        const hid = opBtn.dataset.hazardOp;
        const opType = opBtn.dataset.opType;
        const h = store.hazards.find(x => x.id === hid);
        if (!h) return;
        if (opType === '复查' || opType === '查看') {
          ui.selectedReviewId = hid;
          ui.reviewStatusFilter = h.status === '已销项' ? '已销项' : 'all';
          ctx.switchModule('safety', 'review');
        } else if (opType === '派发') {
          ui.selectedHazardId = hid;
          ctx.switchModule('safety', 'ledger');
        } else if (opType === '催办') {
          store.activities.unshift({
            id: 'act_' + Date.now(),
            title: `${secName(h.secId)} · ${h.desc}`,
            time: '11-25 10:48',
            code: h.id,
            status: '已催办',
            tagClass: 'm04-tag-red',
            secId: h.secId,
            icon: 'clock'
          });
          ctx.showToast(`已向 ${secUnit(h.secId)}（${h.owner}）发送催办通知：${h.id}`);
          rerender();
        }
        return;
      }

      // 6. Open hazard detail / navigate
      const openHz = e.target.closest('[data-open-hazard]');
      if (openHz) {
        const hid = openHz.dataset.openHazard;
        const h = store.hazards.find(x => x.id === hid);
        if (!h) return;
        if (h.status === '待复查' || h.status === '已销项') {
          ui.selectedReviewId = hid;
          ui.reviewStatusFilter = 'all';
          ctx.switchModule('safety', 'review');
        } else {
          ui.selectedHazardId = hid;
          ctx.switchModule('safety', 'ledger');
        }
        return;
      }

      // 7. Risk selection
      const selRiskEl = e.target.closest('[data-select-risk]');
      if (selRiskEl) {
        ui.selectedRiskId = selRiskEl.dataset.selectRisk;
        const r = store.riskPoints.find(x => x.id === ui.selectedRiskId);
        if (r && ctx.cesium && ctx.cesium.ready) {
          ctx.cesium.flyToSection(r.secId);
        }
        rerender();
        return;
      }

      // 8. Fly direction on Risk map
      const flyDir = e.target.closest('[data-fly-dir]');
      if (flyDir) {
        const dir = flyDir.dataset.flyDir;
        if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToDirection(dir);
        ctx.showToast(dir === 'start' ? '已定位至明水方向起点（一工区）' : '已定位至北安方向终点（六工区）');
        return;
      }

      // 9. Risk camera preview
      const riskCam = e.target.closest('[data-play-risk-cam]');
      if (riskCam) {
        const r = store.riskPoints.find(x => x.id === riskCam.dataset.playRiskCam);
        if (r) {
          ctx.openModal(`现场视频监测 · ${r.id} ${r.name}`, `
            <div class="media-card playing" style="margin:0;">
              <img src="${IMG[r.imgKey]}" alt="${escHtml(r.name)}" />
              <div class="media-top-badges">
                <span class="live-pill"><span class="live-dot"></span>实时视频流 · ${escHtml(r.camCode)}</span>
                <span class="cam-pill">${escHtml(secName(r.secId))} · ${escHtml(r.category)}</span>
              </div>
            </div>
            <p style="color:#dbeafe;font-size:12.5px;">位置：${escHtml(r.location)} ｜ 风险等级：${escHtml(r.level)} ｜ 责任单位：${escHtml(r.unit)}</p>
          `);
        }
        return;
      }

      // 10. AI Alert selection & status KPI filter
      const aiCard = e.target.closest('[data-select-ai]');
      if (aiCard) {
        ui.selectedAiId = aiCard.dataset.selectAi;
        ui.aiPlaying = false;
        ui.aiScrubSec = 18;
        ui.aiActiveFrameIdx = 1;
        rerender();
        return;
      }
      const aiPick = e.target.closest('[data-ai-status-pick]');
      if (aiPick) {
        ui.aiStatus = aiPick.dataset.aiStatusPick;
        ui.aiPage = 1;
        rerender();
        return;
      }
      const aiFrame = e.target.closest('[data-ai-frame]');
      if (aiFrame) {
        const idx = Number(aiFrame.dataset.aiFrame);
        ui.aiActiveFrameIdx = idx;
        ui.aiScrubSec = idx === 0 ? 8 : idx === 1 ? 18 : 26;
        rerender();
        return;
      }

      // 11. Ledger tabs, KPI filter, row select
      const ledTab = e.target.closest('[data-ledger-tab]');
      if (ledTab) {
        ui.ledgerTab = ledTab.dataset.ledgerTab;
        rerender();
        return;
      }
      const ledPick = e.target.closest('[data-ledger-pick]');
      if (ledPick) {
        ui.ledgerStatus = ledPick.dataset.ledgerPick;
        ui.ledgerPage = 1;
        rerender();
        return;
      }
      const ledRow = e.target.closest('[data-select-hazard]');
      if (ledRow && !e.target.closest('[data-hazard-op]')) {
        ui.selectedHazardId = ledRow.dataset.selectHazard;
        rerender();
        return;
      }

      // 12. Named button actions
      const actEl = e.target.closest('[data-action]');
      if (!actEl) return;
      const act = actEl.dataset.action;

      if (act === 'query-toast') {
        rerender();
        ctx.showToast('已按当前筛选条件刷新安全数据');
      } else if (act === 'reset-overview') {
        ui.category = 'all'; ui.period = '2026-11'; ui.overviewQuickTab = 'unclosed'; ui.overviewPage = 1;
        if (getActiveSecId(ctx)) toggleGlobalSection('');
        else rerender();
        ctx.showToast('已重置安全总览筛选条件');
      } else if (act === 'reset-risk') {
        ui.riskCategory = 'all'; ui.riskLevel = 'all'; ui.riskQuery = ''; ui.riskPage = 1;
        ui.riskLayers = { risk: true, hazard: false, video: false };
        if (getActiveSecId(ctx)) toggleGlobalSection('');
        else rerender();
        ctx.showToast('已重置风险点位筛选条件');
      } else if (act === 'reset-ai') {
        ui.aiAlgo = 'all'; ui.aiStatus = 'all'; ui.period = '2026-11'; ui.aiPage = 1;
        if (getActiveSecId(ctx)) toggleGlobalSection('');
        else rerender();
        ctx.showToast('已重置视频AI预警筛选条件');
      } else if (act === 'open-risk-inspection') {
        const r = store.riskPoints.find(x => x.id === actEl.dataset.riskId);
        if (r) {
          ctx.openModal(`无人机与安全巡检成果 · ${r.id} ${r.name}`, `
            <div class="detail-grid">
              <div class="detail-stat-card"><span>最近巡检时间</span><strong style="font-size:14px;">2026-11-24 14:30</strong></div>
              <div class="detail-stat-card"><span>巡检方式</span><strong style="font-size:14px;">无人机正射 + 人工复核</strong></div>
              <div class="detail-stat-card"><span>关联监控设备</span><strong style="font-size:14px;">${escHtml(r.camCode)}</strong></div>
            </div>
            <p style="color:#dbeafe;font-size:12.5px;">管控要点：${escHtml(r.measures.join('；'))}</p>
          `);
        }
      } else if (act === 'edit-risk-measures') {
        handleRiskMeasureModal(actEl.dataset.riskId);
      } else if (act === 'ai-play-toggle') {
        ui.aiPlaying = !ui.aiPlaying;
        rerender();
      } else if (act === 'ai-mute-toggle') {
        ui.aiMuted = !ui.aiMuted;
        rerender();
      } else if (act === 'ai-expand-video') {
        const a = store.aiAlerts.find(x => x.id === ui.selectedAiId);
        if (a) {
          ctx.openModal(`AI预警证据高清回放 · ${a.id}`, `
            <div class="m04-evidence-frame">
              <img src="${IMG[a.imgKey] || IMG.corridor}" alt="${escHtml(a.event)}" />
              <div class="m04-cam-hud">
                <span class="m04-hud-pill">${escHtml(a.camera)}</span>
                <span class="m04-hud-pill">${escHtml(a.time)}</span>
              </div>
              <div class="m04-detect-box" style="left:${a.box.left}%;top:${a.box.top}%;width:${a.box.width}%;height:${a.box.height}%;">
                <div class="m04-detect-label">${escHtml(a.event)}</div>
              </div>
            </div>
            <p style="color:#dbeafe;font-size:12.5px;">识别算法：${escHtml(a.algorithm)} ｜ 工区位置：${escHtml(a.shortLoc)}</p>
          `);
        }
      } else if (act === 'ai-confirm') {
        const aid = actEl.dataset.aiId;
        const a = store.aiAlerts.find(x => x.id === aid);
        if (!a) return;
        if (a.status === '已确认' && a.linkedHazardId) {
          ui.selectedHazardId = a.linkedHazardId;
          ctx.switchModule('safety', 'ledger');
          return;
        }
        const newId = `AQ-202611-${String(store.nextHazardSeq++).padStart(3, '0')}`;
        const note = ui.aiNotes[aid] || `视频AI抓拍（${a.camera}）：${a.event}，人工核实确认。`;
        a.status = '已确认';
        a.note = note;
        a.linkedHazardId = newId;
        store.hazards.unshift({
          id: newId,
          period: a.period,
          secId: a.secId,
          location: `${secName(a.secId)} · ${a.location}`,
          source: '视频AI',
          category: a.algorithm.includes('安全帽') || a.algorithm.includes('反光衣') ? '高处作业' : '临边防护',
          desc: a.event.replace(/^疑似/, ''),
          level: '一般隐患',
          due: '2026-11-27',
          dueFull: '2026-11-27 17:00',
          status: '待派发',
          overdue: false,
          foundAt: a.time,
          owner: '整改负责人A（演示）',
          req: note,
          beforeNote: note,
          afterNote: '',
          reviewer: '监理复查人员A（演示）',
          reviewTime: '',
          reviewNote: ''
        });
        store.activities.unshift({
          id: 'act_' + Date.now(),
          title: `${secName(a.secId)} · ${a.event.replace(/^疑似/, '')}`,
          time: '11-25 10:46',
          code: newId,
          status: '待派发',
          tagClass: 'm04-tag-amber',
          secId: a.secId,
          icon: 'camera'
        });
        ctx.showToast(`已确认预警 ${aid} 并生成隐患台账 ${newId}`);
        rerender();
      } else if (act === 'ai-false') {
        const aid = actEl.dataset.aiId;
        const a = store.aiAlerts.find(x => x.id === aid);
        if (!a) return;
        a.status = '已标误报';
        a.note = ui.aiNotes[aid] || '经人工核查现场画面，判定为误报。';
        ctx.showToast(`预警 ${aid} 已标记为误报`);
        rerender();
      } else if (act === 'ai-duplicate') {
        handleDuplicateLinkModal(actEl.dataset.aiId);
      } else if (act === 'open-add-hazard') {
        openAddHazardModal();
      } else if (act === 'export-ledger') {
        exportLedgerCsv(getActiveSecId(ctx));
      } else if (act === 'goto-pingan') {
        const ok = ctx.switchModule('pingan');
        if (!ok) {
          ctx.showToast('平安工地子系统记录已通过来源编号实时同步至本统一台账');
        }
      } else if (act === 'dispatch-hazard') {
        const h = store.hazards.find(x => x.id === actEl.dataset.hazardId);
        if (!h) return;
        if (h.status === '待复查' || h.status === '已销项') {
          ui.selectedReviewId = h.id;
          ui.reviewStatusFilter = 'all';
          ctx.switchModule('safety', 'review');
          return;
        }
        const ownerEl = document.getElementById('m04DispatchOwner');
        const dueEl = document.getElementById('m04DispatchDue');
        const reqEl = document.getElementById('m04DispatchReq');
        if (ownerEl) h.owner = ownerEl.value;
        if (dueEl && dueEl.value.trim()) {
          h.dueFull = dueEl.value.trim();
          h.due = h.dueFull.slice(0, 10);
        }
        if (reqEl) h.req = reqEl.value.trim();

        if (h.status === '待派发') {
          h.status = '整改中';
          h.dispatchedAt = '2026-11-25 10:48';
          store.activities.unshift({
            id: 'act_' + Date.now(),
            title: `${secName(h.secId)} · ${h.desc}`,
            time: '11-25 10:48',
            code: h.id,
            status: '已派发',
            tagClass: 'm04-tag-blue',
            secId: h.secId,
            icon: 'flag'
          });
          ctx.showToast(`已派发整改工单 ${h.id} 至 ${h.owner}`);
        } else if (h.status === '整改中') {
          h.status = '待复查';
          h.overdue = false;
          h.feedbackAt = '2026-11-25 10:50';
          h.afterNote = '已完成现场整改并上传反馈照片，申请监理复查。';
          store.activities.unshift({
            id: 'act_' + Date.now(),
            title: `${secName(h.secId)} · ${h.desc}`,
            time: '11-25 10:50',
            code: h.id,
            status: '待复查',
            tagClass: 'm04-tag-amber',
            secId: h.secId,
            icon: 'checkCircle'
          });
          ctx.showToast(`工单 ${h.id} 已提交整改反馈，流转至待复查`);
        }
        rerender();
      } else if (act === 'view-hazard-evidence') {
        openBeforeAfterModal(actEl.dataset.hazardId);
      } else if (act === 'open-before-after') {
        openBeforeAfterModal(actEl.dataset.hazardId);
      } else if (act === 'review-approve') {
        const h = store.hazards.find(x => x.id === actEl.dataset.hazardId);
        if (!h) return;
        const draft = ui.reviewDrafts[h.id] || {};
        h.reviewer = draft.reviewer || h.reviewer || '监理复查人员A（演示）';
        h.reviewTime = draft.reviewTime || '2026-11-25 10:52';
        h.reviewNote = draft.reviewNote || '现场复查合格，予以销项。';
        h.status = '已销项';
        h.overdue = false;
        ui.reviewStatusFilter = 'all';
        store.activities.unshift({
          id: 'act_' + Date.now(),
          title: `${secName(h.secId)} · ${h.desc}`,
          time: '11-25 10:52',
          code: h.id,
          status: '已销项',
          tagClass: 'm04-tag-green',
          secId: h.secId,
          icon: 'checkCircle'
        });
        ctx.showToast(`隐患 ${h.id} 复查通过并已闭环销项`);
        rerender();
      } else if (act === 'review-reject') {
        const h = store.hazards.find(x => x.id === actEl.dataset.hazardId);
        if (!h) return;
        const draft = ui.reviewDrafts[h.id] || {};
        h.reviewer = draft.reviewer || h.reviewer || '监理复查人员A（演示）';
        h.reviewNote = draft.reviewNote || '防护细节仍需加固，退回施工单位重新整改。';
        h.status = '整改中';
        ui.reviewStatusFilter = 'all';
        store.activities.unshift({
          id: 'act_' + Date.now(),
          title: `${secName(h.secId)} · ${h.desc}`,
          time: '11-25 10:52',
          code: h.id,
          status: '退回重改',
          tagClass: 'm04-tag-red',
          secId: h.secId,
          icon: 'refresh'
        });
        ctx.showToast(`隐患 ${h.id} 已退回施工单位重新整改`);
        rerender();
      }
    };
  }

  /* ------------------------------------------------------------------------
     LIFECYCLE & REGISTRATION
     ------------------------------------------------------------------------ */
  function ensureAiPlaybackTimer() {
    if (aiTimer) return;
    aiTimer = setInterval(() => {
      if (!lastHostEl || !lastCtx || lastCtx.state.moduleId !== 'safety' || lastCtx.state.moduleSubPageId !== 'ai_alert') return;
      if (!ui.aiPlaying) return;
      ui.aiScrubSec = (ui.aiScrubSec + 1) % 31;
      ui.aiActiveFrameIdx = ui.aiScrubSec < 12 ? 0 : ui.aiScrubSec < 22 ? 1 : 2;
      rerender();
    }, 1000);
  }

  let currentSubPage = 'overview';

  function rerender() {
    if (!lastHostEl || !lastCtx) return;
    renderSafetyModule(lastHostEl, currentSubPage, lastCtx);
  }

  function renderSafetyModule(hostEl, subPageId, ctx) {
    injectStyles();
    lastHostEl = hostEl;
    lastCtx = ctx;
    currentSubPage = subPageId || 'overview';

    const secId = getActiveSecId(ctx);
    if (ui.lastSeenGlobalSec !== secId) {
      ui.lastSeenGlobalSec = secId;
      ui.overviewPage = 1;
      ui.riskPage = 1;
      ui.aiPage = 1;
      ui.ledgerPage = 1;
    }

    if (currentSubPage === 'risk' && ctx.cesium && ctx.cesium.ready) {
      ctx.cesium.applyLayers({
        satellite: false,
        uav: true,
        bim: false,
        pois: true,
        sections: true,
        route: true,
        designMode: false,
        activeSectionId: secId
      });
    }

    let html = '';
    if (currentSubPage === 'overview') html = renderOverviewPage(ctx);
    else if (currentSubPage === 'risk') html = renderRiskPage(ctx);
    else if (currentSubPage === 'ai_alert') html = renderAiAlertPage(ctx);
    else if (currentSubPage === 'ledger') html = renderLedgerPage(ctx);
    else if (currentSubPage === 'review') html = renderReviewPage(ctx);
    else html = renderOverviewPage(ctx);

    hostEl.innerHTML = html;
    bindEvents(hostEl, currentSubPage, ctx);
    ensureAiPlaybackTimer();
  }

  window.JIHEI_PLATFORM.registerModule({
    id: 'safety',
    name: '安全管理',
    subPages: [
      { id: 'overview', name: '安全总览' },
      { id: 'risk', name: '风险点位' },
      { id: 'ai_alert', name: '视频AI预警' },
      { id: 'ledger', name: '隐患台账' },
      { id: 'review', name: '整改复查' }
    ],
    getCesiumMode(subPageId) {
      return subPageId === 'risk' ? 'dimmed' : 'opaque';
    },
    render(hostEl, subPageId, ctx) {
      renderSafetyModule(hostEl, subPageId, ctx);
    },
    onSectionChange(secId, subPageId) {
      if (subPageId === 'risk' && lastCtx && lastCtx.cesium && lastCtx.cesium.ready) {
        if (secId) lastCtx.cesium.flyToSection(secId);
        else lastCtx.cesium.flyToOverview(1.2);
      }
    },
    onLeave() {
      if (aiTimer) {
        clearInterval(aiTimer);
        aiTimer = null;
      }
      ui.aiPlaying = false;
      if (lastHostEl) {
        lastHostEl.innerHTML = '';
      }
    }
  });
})();
