/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   Module 13: 信息发布 (m13_publish.js)
   5 Subpages: 情报板总览 | 内容模板 | 审核发布 | 联动预案 | 回执记录
   ========================================================================== */
(function () {
  'use strict';

  const SECTION_META = [
    { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
    { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
    { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
    { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
    { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
    { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' }
  ];
  const SECTION_NAME_BY_ID = Object.fromEntries(SECTION_META.map(s => [s.id, s.name]));

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const SVG = {
    board: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="12" rx="2"/><line x1="7" y1="8.5" x2="17" y2="8.5"/><line x1="7" y1="12" x2="14" y2="12"/><line x1="12" y1="16" x2="12" y2="20"/><line x1="8" y1="20" x2="16" y2="20"/></svg>`,
    signal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="18" x2="6" y2="14"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="8"/><line x1="18" y1="18" x2="18" y2="5"/></svg>`,
    signalOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="6" y1="18" x2="6" y2="14"/><line x1="10" y1="18" x2="10" y2="12"/><line x1="14" y1="18" x2="14" y2="14"/><line x1="4" y1="4" x2="20" y2="20"/></svg>`,
    doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="8.5" y1="8" x2="15.5" y2="8"/><line x1="8.5" y1="12" x2="15.5" y2="12"/><line x1="8.5" y1="16" x2="12.5" y2="16"/></svg>`,
    warnTri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 3 2 8 12 13 22 8 12 3"/><polyline points="2 12.5 12 17.5 22 12.5"/><polyline points="2 17 12 22 22 17"/></svg>`,
    lines: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="6" x2="20" y2="6"/><line x1="4" y1="12" x2="16" y2="12"/><line x1="4" y1="18" x2="12" y2="18"/></svg>`,
    shieldCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 3l7 3v6c0 4.5-3 7.8-7 9-4-1.2-7-4.5-7-9V6l7-3z"/><path d="M9 12l2.2 2.2L15.5 10"/></svg>`,
    search: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    lock: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`,
    send: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    checkCircle: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.3l2.4 2.4 4.8-4.8"/></svg>`,
    edit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    link: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    inbox: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 002 2h16a2 2 0 002-2v-6l-3.45-6.89A2 2 0 0016.76 4H7.24a2 2 0 00-1.79 1.11z"/></svg>`,
    monitor: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
    clock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    road: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 20L9 4M19 20L15 4M12 7v3M12 13v4"/></svg>`,
    cloud: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"/></svg>`,
    trend: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 17 9 11 13 15 21 7"/><polyline points="15 7 21 7 21 13"/></svg>`,
    info: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><circle cx="12" cy="8" r="0.8" fill="currentColor"/></svg>`,
    undo: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="9 14 4 9 9 4"/><path d="M20 20v-7a4 4 0 00-4-4H4"/></svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`
  };

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (.m13-* ONLY)
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('m13-styles')) return;
    const style = document.createElement('style');
    style.id = 'm13-styles';
    style.textContent = `
      .m13-page {
        width: 100%;
        min-height: 100%;
        padding: 10px 18px 68px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        color: var(--text-main);
        box-sizing: border-box;
      }

      /* Filter Bar */
      .m13-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 9px 14px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.84);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m13-filter-group {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .m13-filter-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m13-filter-item label {
        font-size: 12.5px;
        color: #cfe4ff;
        white-space: nowrap;
      }
      .m13-select, .m13-input, .m13-textarea {
        height: 31px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(10, 36, 82, 0.86);
        color: #f1f7ff;
        font-size: 12.5px;
        outline: none;
        box-sizing: border-box;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m13-textarea {
        height: auto;
        padding: 8px 10px;
        resize: vertical;
        font-family: inherit;
      }
      .m13-select { min-width: 120px; cursor: pointer; }
      .m13-select option { background: #09214d; color: #ffffff; }
      .m13-select:focus, .m13-input:focus, .m13-textarea:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.28);
      }
      .m13-search-box {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m13-search-box svg {
        position: absolute;
        left: 9px;
        color: #789bc4;
        pointer-events: none;
      }
      .m13-search-box .m13-input {
        padding-left: 28px;
        width: 192px;
      }
      .m13-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Buttons */
      .m13-btn-primary {
        height: 31px;
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
        justify-content: center;
        gap: 6px;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.42);
        transition: all 0.18s;
        white-space: nowrap;
      }
      .m13-btn-primary:hover { box-shadow: 0 0 18px rgba(56, 220, 255, 0.65); }
      .m13-btn-ghost {
        height: 31px;
        padding: 0 14px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(12, 42, 92, 0.65);
        color: #d8ecff;
        font-size: 12.5px;
        font-weight: 500;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s;
        white-space: nowrap;
      }
      .m13-btn-ghost:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(20, 72, 146, 0.78);
      }
      .m13-btn-gold {
        height: 31px;
        padding: 0 14px;
        border-radius: 6px;
        border: 1px solid rgba(250, 204, 21, 0.62);
        background: rgba(250, 204, 21, 0.12);
        color: #fde047;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s;
        white-space: nowrap;
      }
      .m13-btn-gold:hover {
        background: rgba(250, 204, 21, 0.24);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.32);
      }
      .m13-btn-green {
        height: 31px;
        padding: 0 14px;
        border-radius: 6px;
        border: 1px solid rgba(74, 222, 128, 0.65);
        background: rgba(34, 197, 94, 0.18);
        color: #4ade80;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s;
        white-space: nowrap;
      }
      .m13-btn-green:hover {
        background: rgba(34, 197, 94, 0.3);
        box-shadow: 0 0 12px rgba(74, 222, 128, 0.35);
      }

      /* Panel Shell */
      .m13-panel {
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.86) 0%, rgba(7, 23, 56, 0.86) 100%);
        border: 1px solid var(--border-cyan);
        border-radius: 10px;
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        display: flex;
        flex-direction: column;
        overflow: hidden;
      }
      .m13-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
        gap: 10px;
      }
      .m13-panel-head-left {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m13-panel-sub {
        font-size: 12px;
        color: #8ab4dc;
        font-weight: 400;
      }
      .m13-panel-body {
        padding: 12px 14px;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* KPI Strip Panel */
      .m13-kpi-grid-5 {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 12px;
      }
      .m13-kpi-grid-4 {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 12px;
      }
      .m13-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 9px;
        background: rgba(11, 39, 86, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.25);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m13-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.62);
        background: rgba(16, 54, 114, 0.8);
        transform: translateY(-1px);
      }
      .m13-kpi-ico {
        width: 38px;
        height: 38px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m13-ico-cyan { background: rgba(34, 211, 238, 0.14); border: 1px solid rgba(34, 211, 238, 0.42); color: #38f2ff; }
      .m13-ico-green { background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(74, 222, 128, 0.45); color: #4ade80; }
      .m13-ico-blue { background: rgba(59, 130, 246, 0.16); border: 1px solid rgba(96, 165, 250, 0.45); color: #60a5fa; }
      .m13-ico-gold { background: rgba(250, 204, 21, 0.14); border: 1px solid rgba(250, 204, 21, 0.45); color: #facc15; }
      .m13-ico-slate { background: rgba(148, 163, 184, 0.14); border: 1px solid rgba(148, 163, 184, 0.4); color: #cbd5e1; }

      .m13-kpi-label { font-size: 12px; color: #a9c6e8; margin-bottom: 2px; }
      .m13-kpi-val { font-size: 22px; font-weight: 800; font-variant-numeric: tabular-nums; line-height: 1.15; }
      .m13-kpi-unit { font-size: 12px; font-weight: 500; color: #cbd5e1; margin-left: 3px; }
      .m13-c-cyan { color: #38f2ff; }
      .m13-c-green { color: #4ade80; }
      .m13-c-blue { color: #60a5fa; }
      .m13-c-gold { color: #fde047; }
      .m13-c-slate { color: #e2e8f0; }

      /* Split Layout */
      .m13-split-main {
        display: grid;
        grid-template-columns: minmax(0, 1.56fr) minmax(350px, 1fr);
        gap: 12px;
        align-items: stretch;
      }
      .m13-left-stack {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }

      /* Table */
      .m13-table-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .m13-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .m13-table th, .m13-table td {
        padding: 9px 10px;
        text-align: left;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        white-space: nowrap;
        vertical-align: middle;
      }
      .m13-table th {
        color: #8eb8e5;
        background: rgba(11, 38, 86, 0.58);
        font-weight: 600;
      }
      .m13-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m13-table tbody tr:hover {
        background: rgba(22, 74, 150, 0.34);
      }
      .m13-table tbody tr.m13-row-selected {
        background: rgba(22, 119, 255, 0.22);
        box-shadow: inset 2px 0 0 #38f2ff, inset 0 1px 0 rgba(56, 220, 255, 0.35), inset 0 -1px 0 rgba(56, 220, 255, 0.35);
      }
      .m13-cell-main { font-size: 12.5px; font-weight: 600; color: #f1f7ff; }
      .m13-cell-sub { font-size: 11px; color: #8ab4dc; margin-top: 2px; font-variant-numeric: tabular-nums; }

      .m13-act-link {
        background: none;
        border: none;
        color: #38bdf8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 3px 7px;
        border-radius: 4px;
        transition: all 0.15s;
      }
      .m13-act-link:hover {
        color: #ffffff;
        background: rgba(56, 189, 248, 0.22);
      }

      /* Tags & Pills */
      .m13-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m13-tag-green { background: rgba(34, 197, 94, 0.16); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.48); }
      .m13-tag-amber { background: rgba(250, 204, 21, 0.14); color: #fde047; border: 1px solid rgba(250, 204, 21, 0.45); }
      .m13-tag-blue { background: rgba(56, 189, 248, 0.16); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.45); }
      .m13-tag-slate { background: rgba(148, 163, 184, 0.16); color: #cbd5e1; border: 1px solid rgba(148, 163, 184, 0.4); }
      .m13-tag-red { background: rgba(244, 63, 94, 0.16); color: #fb7185; border: 1px solid rgba(244, 63, 94, 0.48); }

      .m13-head-chip {
        padding: 2px 10px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(12, 52, 110, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.42);
        color: #93c5fd;
        white-space: nowrap;
      }

      /* Pagination */
      .m13-pager {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-top: auto;
        padding-top: 8px;
        font-size: 12px;
        color: #93c5fd;
      }
      .m13-pager-info { margin-right: 6px; }
      .m13-pg-btn {
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
      .m13-pg-btn:hover:not(:disabled) { border-color: var(--cyan); color: #fff; }
      .m13-pg-btn.active {
        background: #1677ff;
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m13-pg-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Right Detail Panel */
      .m13-detail-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .m13-detail-code {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.3px;
      }
      .m13-detail-ver {
        font-size: 12.5px;
        font-weight: 600;
        color: #93c5fd;
        margin-left: 6px;
      }
      .m13-kv-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m13-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        font-size: 12.5px;
      }
      .m13-kv-row .m13-kv-k { color: #8ab4dc; flex-shrink: 0; }
      .m13-kv-row .m13-kv-v { color: #f1f7ff; font-weight: 600; text-align: right; }

      .m13-subhead-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        font-size: 12.5px;
        font-weight: 600;
        color: #dbeafe;
        margin-top: 2px;
      }

      /* LED Dot-Matrix Bezel */
      .m13-led-bezel {
        position: relative;
        border-radius: 8px;
        padding: 5px 6px;
        background: linear-gradient(180deg, #101724 0%, #070a10 100%);
        border: 1px solid rgba(56, 189, 248, 0.28);
        box-shadow: inset 0 2px 10px rgba(0, 0, 0, 0.85), 0 4px 14px rgba(0, 8, 24, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .m13-led-bezel svg {
        width: 100%;
        height: clamp(96px, 12.2vh, 132px);
        max-height: 132px;
        display: block;
        border-radius: 5px;
      }
      .m13-led-caption {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11.5px;
        color: #8ab4dc;
        font-variant-numeric: tabular-nums;
      }

      /* Alert Rows & Device Target Rows */
      .m13-alert-list, .m13-target-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m13-alert-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(250, 204, 21, 0.28);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m13-alert-row:hover {
        border-color: rgba(250, 204, 21, 0.65);
        background: rgba(18, 56, 118, 0.72);
      }
      .m13-alert-left {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #e2f0ff;
        min-width: 0;
      }
      .m13-alert-ico { color: #facc15; display: inline-flex; flex-shrink: 0; }
      .m13-target-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 10px;
        border-radius: 7px;
        background: rgba(11, 39, 86, 0.6);
        border: 1px solid rgba(56, 189, 248, 0.22);
        font-size: 12px;
      }
      .m13-target-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .m13-target-code { font-weight: 700; color: #f1f7ff; }
      .m13-target-loc { color: #8ab4dc; }

      .m13-actions-row {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: auto;
        padding-top: 4px;
      }
      .m13-actions-row > button {
        flex: 1;
        height: 34px;
      }

      /* Compact vertical rhythm for Review right panel (clears .floating-br at 1920x1080) */
      .m13-review-detail .m13-panel-body {
        padding: 10px 14px;
        gap: 7px;
      }
      .m13-review-detail .m13-kv-list {
        gap: 4px;
      }
      .m13-review-detail .m13-led-bezel {
        padding: 4px 6px;
      }
      .m13-review-detail .m13-led-bezel svg {
        height: clamp(92px, 11vh, 118px);
        max-height: 118px;
      }
      .m13-review-detail .m13-target-list {
        gap: 5px;
        max-height: 132px;
        overflow-y: auto;
      }
      .m13-review-detail .m13-target-row {
        padding: 5px 10px;
      }
      .m13-review-detail .m13-note-box {
        padding: 6px 10px;
      }

      /* Template Editor Form */
      .m13-form-grid-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 9px 10px;
      }
      .m13-field {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .m13-field label {
        font-size: 11.5px;
        color: #9ec0e6;
      }
      .m13-field .m13-input, .m13-field .m13-select {
        width: 100%;
      }
      .m13-input-icon-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .m13-input-icon-wrap .m13-input { padding-right: 28px; }
      .m13-input-icon-wrap svg {
        position: absolute;
        right: 9px;
        color: #789bc4;
        pointer-events: none;
      }

      /* 5-Step Flow Strip */
      .m13-flow-strip {
        display: flex;
        align-items: stretch;
        gap: 6px;
      }
      .m13-flow-step {
        flex: 1;
        min-width: 0;
        padding: 10px 8px;
        border-radius: 8px;
        background: rgba(11, 39, 86, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        gap: 4px;
      }
      .m13-flow-step.done {
        border-color: rgba(56, 189, 248, 0.42);
        background: rgba(12, 46, 98, 0.72);
      }
      .m13-flow-step.active {
        border-color: rgba(250, 204, 21, 0.78);
        background: linear-gradient(180deg, rgba(64, 58, 22, 0.42), rgba(24, 38, 64, 0.8));
        box-shadow: 0 0 14px rgba(250, 204, 21, 0.22);
      }
      .m13-flow-step.pending {
        opacity: 0.65;
      }
      .m13-flow-ico { color: #38bdf8; display: inline-flex; }
      .m13-flow-step.done .m13-flow-ico { color: #4ade80; }
      .m13-flow-step.active .m13-flow-ico { color: #fde047; }
      .m13-flow-title { font-size: 12.5px; font-weight: 700; color: #f1f7ff; }
      .m13-flow-step.active .m13-flow-title { color: #fde047; }
      .m13-flow-sub { font-size: 11px; color: #9ec0e6; font-variant-numeric: tabular-nums; }
      .m13-flow-arrow {
        display: flex;
        align-items: center;
        justify-content: center;
        color: #5ea3e6;
        flex-shrink: 0;
      }

      /* Note Box */
      .m13-note-box {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 8px 11px;
        border-radius: 7px;
        background: rgba(10, 34, 78, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.2);
        font-size: 11.5px;
        color: #9ec0e6;
      }
      .m13-note-box svg { color: #7dd3fc; flex-shrink: 0; }

      /* Linkage Plan Cards */
      .m13-plan-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m13-plan-card {
        display: grid;
        grid-template-columns: minmax(180px, 1.4fr) minmax(90px, 0.7fr) minmax(90px, 0.7fr) auto;
        align-items: center;
        gap: 12px;
        padding: 13px 14px;
        border-radius: 9px;
        background: rgba(11, 39, 86, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.25);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m13-plan-card:hover {
        border-color: rgba(56, 220, 255, 0.58);
        background: rgba(16, 56, 118, 0.75);
      }
      .m13-plan-card.active {
        border-color: #38f2ff;
        background: linear-gradient(90deg, rgba(16, 86, 176, 0.52), rgba(10, 44, 96, 0.78));
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.24);
      }
      .m13-plan-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m13-plan-ico {
        width: 36px;
        height: 36px;
        border-radius: 8px;
        background: rgba(14, 52, 112, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.34);
        display: flex;
        align-items: center;
        justify-content: center;
        color: #7dd3fc;
        flex-shrink: 0;
      }
      .m13-plan-col-lbl { font-size: 11px; color: #8ab4dc; margin-bottom: 4px; }

      /* Recessed Content & Linked Order Boxes (Plans Right Panel) */
      .m13-recessed-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(6, 21, 50, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.22);
      }
      .m13-recessed-title { font-size: 11.5px; color: #8ab4dc; margin-bottom: 5px; }
      .m13-recessed-lines { font-size: 13px; color: #f1f7ff; line-height: 1.55; font-weight: 500; }

      /* Receipts Trace Cards & Timeline */
      .m13-trace-grid {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 9px;
      }
      .m13-trace-card {
        padding: 9px 11px;
        border-radius: 8px;
        background: rgba(11, 39, 86, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.22);
      }
      .m13-trace-k { font-size: 11px; color: #8ab4dc; margin-bottom: 4px; }
      .m13-trace-v { font-size: 12.5px; font-weight: 700; color: #f1f7ff; font-variant-numeric: tabular-nums; }

      .m13-step-timeline {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m13-step-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(10, 34, 78, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.2);
        font-size: 12px;
      }
      .m13-step-row-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .m13-step-time {
        font-size: 11.5px;
        color: #93c5fd;
        font-variant-numeric: tabular-nums;
        min-width: 58px;
      }
      .m13-step-text { color: #e2f0ff; }

      .m13-text-link {
        background: none;
        border: none;
        color: #38bdf8;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
      .m13-text-link:hover { color: #7dd3fc; text-decoration: underline; }

      /* Modal Helpers */
      .m13-modal-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px 12px;
      }
      .m13-modal-checks {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        max-height: 150px;
        overflow-y: auto;
        padding: 8px;
        border-radius: 7px;
        background: rgba(7, 24, 56, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .m13-modal-chk {
        display: flex;
        align-items: center;
        gap: 6px;
        font-size: 12px;
        color: #dbeafe;
        cursor: pointer;
      }
      .m13-modal-chk input { accent-color: #1677ff; }
      .m13-modal-footer {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 6px;
        border-top: 1px solid rgba(56, 189, 248, 0.18);
      }

      @media (max-width: 1220px) {
        .m13-split-main { grid-template-columns: 1fr; }
        .m13-kpi-grid-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m13-kpi-grid-4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------------ */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function secName(secId) {
    return SECTION_NAME_BY_ID[secId] || secId;
  }

  let ledUidSeed = 0;
  function renderLedPreviewSvg(line1, line2, spec, opts) {
    ledUidSeed += 1;
    const uid = 'led_' + ledUidSeed;
    const options = opts || {};
    const isFullColor = String(spec || '').includes('全彩');
    const c1 = options.dimmed ? '#64748b' : (isFullColor ? '#fbbf24' : '#facc15');
    const c2 = options.dimmed ? '#64748b' : (isFullColor ? '#4ade80' : '#facc15');
    const l1 = String(line1 || '').trim() || ' ';
    const l2 = String(line2 || '').trim() || ' ';
    const maxLen = Math.max(l1.length, l2.length);
    const fontSize = maxLen > 9 ? 28 : maxLen > 7 ? 33 : 37;
    const letterSpacing = maxLen > 8 ? 2 : 3.5;
    const textOpacity = options.dimmed ? '0.26' : '1';

    return `
      <div class="m13-led-bezel">
        <svg viewBox="0 0 384 128" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(l1 + ' ' + l2)}">
          <defs>
            <pattern id="${uid}_bg" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#07090f"/>
              <circle cx="2" cy="2" r="1.2" fill="#171d27"/>
            </pattern>
            <pattern id="${uid}_maskdots" width="4" height="4" patternUnits="userSpaceOnUse">
              <rect width="4" height="4" fill="#000000"/>
              <circle cx="2" cy="2" r="1.45" fill="#ffffff"/>
            </pattern>
            <mask id="${uid}_mask">
              <rect x="0" y="0" width="384" height="128" fill="url(#${uid}_maskdots)"/>
            </mask>
            <filter id="${uid}_glow" x="-12%" y="-12%" width="124%" height="124%">
              <feGaussianBlur stdDeviation="1.35" result="blur"/>
              <feMerge>
                <feMergeNode in="blur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <rect x="0" y="0" width="384" height="128" rx="4" fill="url(#${uid}_bg)"/>
          <g mask="url(#${uid}_mask)" filter="url(#${uid}_glow)" opacity="${textOpacity}">
            <text x="192" y="52" text-anchor="middle" fill="${c1}" font-size="${fontSize}" font-weight="800" letter-spacing="${letterSpacing}" font-family="'Microsoft YaHei','PingFang SC','SimHei',sans-serif">${esc(l1)}</text>
            <text x="192" y="100" text-anchor="middle" fill="${c2}" font-size="${fontSize}" font-weight="800" letter-spacing="${letterSpacing}" font-family="'Microsoft YaHei','PingFang SC','SimHei',sans-serif">${esc(l2)}</text>
          </g>
          ${options.dimmed ? `<g><rect x="116" y="48" width="152" height="30" rx="6" fill="rgba(10,25,52,0.88)" stroke="rgba(250,204,21,0.5)"/><text x="192" y="67" text-anchor="middle" fill="#fde047" font-size="12" font-weight="700" font-family="'Microsoft YaHei',sans-serif">${esc(options.dimmedLabel || '设备回读待返回')}</text></g>` : ''}
        </svg>
      </div>
    `;
  }

  function renderPagerHtml(totalCount, pageSize, currentPage, unitLabel, pageAttr) {
    const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
    const cur = Math.min(Math.max(1, currentPage), totalPages);
    let btns = `<button class="m13-pg-btn" ${cur <= 1 ? 'disabled' : ''} data-page-target="${pageAttr}" data-page="${cur - 1}">&lt;</button>`;
    for (let p = 1; p <= totalPages; p++) {
      btns += `<button class="m13-pg-btn ${p === cur ? 'active' : ''}" data-page-target="${pageAttr}" data-page="${p}">${p}</button>`;
    }
    btns += `<button class="m13-pg-btn" ${cur >= totalPages ? 'disabled' : ''} data-page-target="${pageAttr}" data-page="${cur + 1}">&gt;</button>`;
    return `
      <div class="m13-pager">
        <span class="m13-pager-info">共 ${totalCount} ${esc(unitLabel)}</span>
        ${btns}
      </div>
    `;
  }

  function statusTagClass(status) {
    if (['在线', '已确认显示', '有效', '已批准', '接口就绪', '条件满足', '已接收', '内容一致', '授权已核验', '已确认对象', '已下发'].includes(status)) {
      if (status === '已下发') return 'm13-tag-blue';
      return 'm13-tag-green';
    }
    if (['待确认显示', '待审核', '待授权', '待接入', '待核验', '待批准', '待回读', '待接收'].includes(status)) {
      return 'm13-tag-amber';
    }
    if (['已退回', '异常'].includes(status)) return 'm13-tag-red';
    return 'm13-tag-slate';
  }

  /* ------------------------------------------------------------------------
     INITIAL INTERCONNECTED STORE
     24 VMS boards, 8 templates, 8 publish orders, 3 linkage plans, receipts
     ------------------------------------------------------------------------ */
  const store = {
    lastUpdated: '11-26 10:45',
    boards: [
      { id: 'VMS-BT-A01', secId: 'sec1', pointName: '导改入口', stake: 'K16+720', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工导改提示', line1: '前方施工导改', line2: '请按标志通行', prevTitle: '施工区域安全提示 · V1.0', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '11-26 10:31:08', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-A02', secId: 'sec1', pointName: '导改中段', stake: 'K17+200', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '保通安全提示', line1: '保通便道通行', line2: '注意避让机械', prevTitle: '保通安全提示 · V1.0', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '—', feedbackStatus: '待确认显示' },
      { id: 'VMS-BT-A03', secId: 'sec1', pointName: '导改结束段', stake: 'K18+100', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: false, confirmedTitle: '通行提醒', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '通行提醒 · V1.0', prevLine1: '施工导改结束', prevLine2: '祝您一路平安', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '—', feedbackStatus: '待确认显示' },
      { id: 'VMS-BT-A04', secId: 'sec2', pointName: '桥梁绕行段', stake: 'K31+120', group: '施工保通组', groupDetail: '二工区施工保通组', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工安全提醒', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '桥梁绕行提示 · V1.0', prevLine1: '桥梁施工绕行', prevLine2: '限速四十通行', lastTime: '11-26 08:40', lastOrderId: 'FB-20261126-005', verifyTime: '11-26 08:42:15', feedbackStatus: '已确认显示' },
      { id: 'VMS-ZD-A01', secId: 'sec4', pointName: '便道汇入口', stake: 'K48+500', group: '场站出入口', groupDetail: '四工区场站出入口', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工区域安全提示 · V1.0', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-25 16:20', lastOrderId: 'FB-20261125-004', verifyTime: '11-25 16:21:44', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-A05', secId: 'sec6', pointName: '施工缓行段', stake: 'K69+350', group: '施工保通组', groupDetail: '六工区施工保通组', direction: '明水方向', spec: '单黄LED 128×48', online: false, confirmedTitle: '施工缓行提示', line1: '前方施工缓行', line2: '请勿随意变道', prevTitle: '施工缓行提示 · V1.0', prevLine1: '前方施工缓行', prevLine2: '请勿随意变道', lastTime: '11-25 11:30', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 11:32:05', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-A06', secId: 'sec2', pointName: '枢纽分流口', stake: 'K28+900', group: '施工保通组', groupDetail: '二工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工安全提醒', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '保通通用板面 · V1.0', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-26 08:40', lastOrderId: 'FB-20261126-005', verifyTime: '11-26 08:43:10', feedbackStatus: '已确认显示' },
      { id: 'VMS-ZD-A02', secId: 'sec1', pointName: '明水拌合站口', stake: 'K08+400', group: '场站出入口', groupDetail: '一工区场站出入口', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '场站车辆进出提示', prevLine1: '前方场站路口', prevLine2: '注意工程车辆', lastTime: '11-25 09:15', lastOrderId: 'FB-20261125-001', verifyTime: '11-25 09:16:30', feedbackStatus: '已确认显示' },
      { id: 'VMS-HT-B01', secId: 'sec1', pointName: '明水互通主线', stake: 'K02+150', group: '枢纽互通组', groupDetail: '一工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '低能见度预警备选', line1: '雾雪能见度低', line2: '开启雾灯控速', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 17:40', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 17:41:20', feedbackStatus: '已确认显示' },
      { id: 'VMS-HT-B02', secId: 'sec1', pointName: '明水互通匝道', stake: 'K03+600', group: '枢纽互通组', groupDetail: '一工区枢纽互通组', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '低能见度预警备选', line1: '雾雪能见度低', line2: '开启雾灯控速', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 17:40', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 17:41:45', feedbackStatus: '已确认显示' },
      { id: 'VMS-QL-C01', secId: 'sec2', pointName: '通肯河特大桥北', stake: 'K35+800', group: '长大桥梁组', groupDetail: '二工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-25 14:10', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 14:11:09', feedbackStatus: '已确认显示' },
      { id: 'VMS-QL-C02', secId: 'sec2', pointName: '通肯河特大桥南', stake: 'K37+250', group: '长大桥梁组', groupDetail: '二工区长大桥梁组', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-25 14:10', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 14:11:32', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-B01', secId: 'sec3', pointName: '青肯泡导改北', stake: 'K52+400', group: '施工保通组', groupDetail: '三工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工保通通用板面', line1: '保通便道通行', line2: '注意避让机械', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 15:00', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 15:01:12', feedbackStatus: '已确认显示' },
      { id: 'VMS-ZD-B01', secId: 'sec3', pointName: '三工区梁场入口', stake: 'K58+900', group: '场站出入口', groupDetail: '三工区场站出入口', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-25 09:15', lastOrderId: 'FB-20261125-001', verifyTime: '11-25 09:17:02', feedbackStatus: '已确认显示' },
      { id: 'VMS-QL-C03', secId: 'sec3', pointName: '呼兰河大桥东', stake: 'K64+100', group: '长大桥梁组', groupDetail: '三工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工区域安全提示', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-24 11:20', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 11:21:40', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-B02', secId: 'sec4', pointName: '海伦西导改入口', stake: 'K76+300', group: '施工保通组', groupDetail: '四工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工导改提示', line1: '前方施工导改', line2: '请按标志通行', prevTitle: '施工区域安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 10:05', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 10:06:18', feedbackStatus: '已确认显示' },
      { id: 'VMS-HT-C01', secId: 'sec4', pointName: '海伦北互通主线', stake: 'K84+600', group: '枢纽互通组', groupDetail: '四工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 09:30', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 09:31:05', feedbackStatus: '已确认显示' },
      { id: 'VMS-ZD-C01', secId: 'sec4', pointName: '四工区水稳站口', stake: 'K91+200', group: '场站出入口', groupDetail: '四工区场站出入口', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '保通安全提示', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-25 16:20', lastOrderId: 'FB-20261125-004', verifyTime: '11-25 16:22:08', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-C01', secId: 'sec5', pointName: '伦河镇保通路口', stake: 'K99+450', group: '施工保通组', groupDetail: '五工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '保通结束提示', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '保通通用板面', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-24 16:40', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 16:41:22', feedbackStatus: '已确认显示' },
      { id: 'VMS-QL-D01', secId: 'sec5', pointName: '扎音河特大桥南', stake: 'K107+800', group: '长大桥梁组', groupDetail: '五工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '施工区域安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 14:25', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 14:26:49', feedbackStatus: '已确认显示' },
      { id: 'VMS-ZD-D01', secId: 'sec5', pointName: '五工区预制场口', stake: 'K115+100', group: '场站出入口', groupDetail: '五工区场站出入口', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-24 13:50', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 13:51:11', feedbackStatus: '已确认显示' },
      { id: 'VMS-BT-D01', secId: 'sec6', pointName: '建华分流引导段', stake: 'K128+600', group: '施工保通组', groupDetail: '六工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工区域安全提示', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '保通通用板面', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-25 11:30', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 11:31:50', feedbackStatus: '已确认显示' },
      { id: 'VMS-HT-D01', secId: 'sec6', pointName: '建华枢纽主线南', stake: 'K141+200', group: '枢纽互通组', groupDetail: '六工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 18:10', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 18:11:36', feedbackStatus: '已确认显示' },
      { id: 'VMS-HT-D02', secId: 'sec6', pointName: '建华枢纽终点匝道', stake: 'K145+900', group: '枢纽互通组', groupDetail: '六工区枢纽互通组', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '保通结束提示', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-24 18:10', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 18:12:04', feedbackStatus: '已确认显示' }
    ],

    templates: [
      { id: 'MB-202611-003', name: '施工导改提示', category: '预案内容', version: 'V1.2', spec: '单黄LED 128×48', validText: '11-26 10:30–18:00', startTime: '2026-11-26 10:30', endTime: '2026-11-26 18:00', status: '有效', line1: '前方施工导改', line2: '请按标志通行' },
      { id: 'MB-202611-004', name: '施工区域安全提示', category: '常用文本', version: 'V1.0', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '前方施工区域', line2: '减速谨慎驾驶' },
      { id: 'MB-202611-006', name: '低能见度提示', category: '预案内容', version: 'V1.1', spec: '全彩LED 192×64', validText: '按预案时段', startTime: '2026-11-26 06:00', endTime: '2026-11-26 22:00', status: '待启用', line1: '雾雪能见度低', line2: '开启雾灯控速' },
      { id: 'MB-202611-001', name: '施工保通通用板面', category: '板面模板', version: 'V1.3', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '保通便道通行', line2: '注意避让机械' },
      { id: 'MB-202611-007', name: '施工出口提示板面', category: '板面模板', version: 'V1.0', spec: '全彩LED 192×64', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '施工出口路段', line2: '严禁超速抢行' },
      { id: 'MB-202611-005', name: '保通结束提示', category: '常用文本', version: 'V1.1', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '施工导改结束', line2: '祝您一路平安' },
      { id: 'MB-202611-002', name: '桥梁绕行安全提示', category: '板面模板', version: 'V1.1', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '桥梁施工绕行', line2: '限速四十通行' },
      { id: 'MB-202611-008', name: '场站车辆进出提示', category: '常用文本', version: 'V1.0', spec: '全彩LED 192×64', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '前方场站路口', line2: '注意工程车辆' }
    ],

    orders: [
      {
        id: 'FB-20261126-007', title: '施工导改提示', version: 'V1.2', secId: 'sec1', groupLabel: '一工区施工保通组',
        templateId: 'MB-202611-003', spec: '单黄LED 128×48', line1: '前方施工导改', line2: '请按标志通行',
        validRange: '11-26 10:30–18:00', scheduleTime: '11-26 10:30', fullTime: '2026-11-26 10:30:00',
        date: '2026-11-26', period: '2026年11月', status: '已下发',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
        authorized: true, prevBoardSummary: '施工区域安全提示 · V1.0',
        boardIds: ['VMS-BT-A01', 'VMS-BT-A02', 'VMS-BT-A03'],
        stepTimes: { compose: '10:12', review: '10:22', auth: '10:27', dispatch: '10:30' }
      },
      {
        id: 'FB-20261126-008', title: '低能见度提示', version: 'V1.1', secId: 'sec1', groupLabel: '一工区枢纽互通组',
        templateId: 'MB-202611-006', spec: '全彩LED 192×64', line1: '雾雪能见度低', line2: '开启雾灯控速',
        validRange: '按预案触发时段', scheduleTime: '待安排', fullTime: '待审核确认',
        date: '2026-11-26', period: '2026年11月', status: '待审核',
        operator: '发布员A（演示）', reviewer: '待审核', authorizer: '待授权',
        authorized: false, prevBoardSummary: '通行安全提示 · V1.0',
        boardIds: ['VMS-HT-B01', 'VMS-HT-B02'],
        stepTimes: { compose: '10:40', review: '待审核', auth: '待授权', dispatch: '待下发' }
      },
      {
        id: 'FB-20261126-009', title: '施工出口提示', version: 'V1.0', secId: 'sec1', groupLabel: '一工区场站出入口',
        templateId: 'MB-202611-007', spec: '全彩LED 192×64', line1: '施工出口路段', line2: '严禁超速抢行',
        validRange: '11-26 11:30–19:00', scheduleTime: '11-26 11:30', fullTime: '计划 2026-11-26 11:30:00',
        date: '2026-11-26', period: '2026年11月', status: '待授权',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '待授权',
        authorized: false, prevBoardSummary: '场站车辆进出提示 · V1.0',
        boardIds: ['VMS-ZD-A02'],
        stepTimes: { compose: '10:15', review: '10:28', auth: '待授权', dispatch: '待下发' }
      },
      {
        id: 'FB-20261126-005', title: '施工安全提醒', version: 'V1.0', secId: 'sec2', groupLabel: '二工区施工保通组',
        templateId: 'MB-202611-004', spec: '单黄LED 128×48', line1: '前方施工区域', line2: '减速谨慎驾驶',
        validRange: '11-26 08:40–18:00', scheduleTime: '11-26 08:40', fullTime: '2026-11-26 08:40:00',
        date: '2026-11-26', period: '2026年11月', status: '已下发',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
        authorized: true, prevBoardSummary: '桥梁绕行提示 · V1.0',
        boardIds: ['VMS-BT-A04', 'VMS-BT-A06'],
        stepTimes: { compose: '08:18', review: '08:26', auth: '08:35', dispatch: '08:40' }
      },
      {
        id: 'FB-20261125-006', title: '临时保通提示', version: 'V1.3', secId: 'sec3', groupLabel: '三工区施工保通组',
        templateId: 'MB-202611-001', spec: '单黄LED 128×48', line1: '保通便道通行', line2: '注意避让机械',
        validRange: '11-25 16:05–20:00', scheduleTime: '11-25 16:05', fullTime: '2026-11-25 16:05:00',
        date: '2026-11-25', period: '2026年11月', status: '已撤销',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
        authorized: true, prevBoardSummary: '通行安全提示 · V1.0',
        boardIds: ['VMS-BT-B01', 'VMS-QL-C03'],
        stepTimes: { compose: '15:40', review: '15:52', auth: '16:00', dispatch: '16:05' }
      },
      {
        id: 'FB-20261125-004', title: '车辆进出提示', version: 'V1.0', secId: 'sec4', groupLabel: '四工区场站出入口',
        templateId: 'MB-202611-008', spec: '全彩LED 192×64', line1: '前方场站路口', line2: '注意工程车辆',
        validRange: '11-25 16:20–21:00', scheduleTime: '11-25 16:20', fullTime: '2026-11-25 16:20:00',
        date: '2026-11-25', period: '2026年11月', status: '已下发',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
        authorized: true, prevBoardSummary: '施工区域安全提示 · V1.0',
        boardIds: ['VMS-ZD-A01'],
        stepTimes: { compose: '15:55', review: '16:06', auth: '16:15', dispatch: '16:20' }
      },
      {
        id: 'FB-20261126-010', title: '桥梁绕行安全提示', version: 'V1.1', secId: 'sec2', groupLabel: '二工区长大桥梁组',
        templateId: 'MB-202611-002', spec: '单黄LED 128×48', line1: '桥梁施工绕行', line2: '限速四十通行',
        validRange: '待安排', scheduleTime: '待安排', fullTime: '待审核确认',
        date: '2026-11-26', period: '2026年11月', status: '待审核',
        operator: '发布员A（演示）', reviewer: '待审核', authorizer: '待授权',
        authorized: false, prevBoardSummary: '桥梁施工提示 · V1.0',
        boardIds: ['VMS-QL-C01', 'VMS-QL-C02'],
        stepTimes: { compose: '10:36', review: '待审核', auth: '待授权', dispatch: '待下发' }
      },
      {
        id: 'FB-20261126-011', title: '保通结束提示', version: 'V1.1', secId: 'sec5', groupLabel: '五工区施工保通组',
        templateId: 'MB-202611-005', spec: '单黄LED 128×48', line1: '施工导改结束', line2: '祝您一路平安',
        validRange: '11-26 14:00–18:00', scheduleTime: '11-26 14:00', fullTime: '计划 2026-11-26 14:00:00',
        date: '2026-11-26', period: '2026年11月', status: '待授权',
        operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '待授权',
        authorized: false, prevBoardSummary: '保通通用板面 · V1.3',
        boardIds: ['VMS-BT-C01', 'VMS-QL-D01'],
        stepTimes: { compose: '10:02', review: '10:20', auth: '待授权', dispatch: '待下发' }
      }
    ],

    plans: [
      {
        id: 'YA-DG-003',
        name: '施工导改提示联动',
        subTitle: '施工导改计划',
        scene: '施工导改',
        secId: 'sec1',
        triggerEvent: 'DG-20261126-01 · 导改时段生效',
        approvalStatus: '已批准',
        interfaceStatus: '接口就绪',
        conditionMet: true,
        targetGroup: '一工区施工保通组 · 3 块',
        targetGroupKey: '施工保通组',
        validRange: '11-26 10:30–18:00',
        templateId: 'MB-202611-003',
        templateVersion: 'V1.2',
        line1: '前方施工导改',
        line2: '请按标志通行',
        linkedOrderId: 'FB-20261126-007',
        linkedOrderNote: '10:30 已授权下发',
        flowStage: 4,
        triggerLogs: [
          { time: '2026-11-26 10:10:04', event: '接收施工导改计划 DG-20261126-01 时段激活信号', result: '匹配成功' },
          { time: '2026-11-26 10:12:00', event: '自动生成发布草稿 FB-20261126-007 并锁定一工区3块情报板', result: '已建单' },
          { time: '2026-11-26 10:30:00', event: '审核与授权通过，系统下发至目标情报板', result: '已下发' }
        ]
      },
      {
        id: 'YA-TQ-002',
        name: '天气预警提示联动',
        subTitle: '天气预警信息',
        scene: '天气预警',
        secId: 'sec1',
        triggerEvent: 'QX-20261126-04 · 大雾黄色预警信号',
        approvalStatus: '待批准',
        interfaceStatus: '待接入',
        conditionMet: false,
        targetGroup: '一工区枢纽互通组 · 2 块',
        targetGroupKey: '枢纽互通组',
        validRange: '按气象预警解除时间',
        templateId: 'MB-202611-006',
        templateVersion: 'V1.1',
        line1: '雾雪能见度低',
        line2: '开启雾灯控速',
        linkedOrderId: 'FB-20261126-008',
        linkedOrderNote: '草稿待审核（手工补录）',
        flowStage: 1,
        triggerLogs: [
          { time: '2026-11-26 09:42:18', event: '气象接口待正式鉴权接入，当前处于模拟校验状态', result: '待接入' },
          { time: '2026-11-26 10:40:00', event: '值班员手动创建对应草稿 FB-20261126-008', result: '待审核' }
        ]
      },
      {
        id: 'YA-TS-001',
        name: '智慧提速策略联动',
        subTitle: '已批准速度策略',
        scene: '智慧提速',
        secId: 'sec2',
        triggerEvent: 'TS-20261126-02 · 桥梁段限速策略',
        approvalStatus: '已批准',
        interfaceStatus: '待核验',
        conditionMet: false,
        targetGroup: '二工区长大桥梁组 · 2 块',
        targetGroupKey: '长大桥梁组',
        validRange: '11-26 09:00–19:00',
        templateId: 'MB-202611-002',
        templateVersion: 'V1.1',
        line1: '桥梁施工绕行',
        line2: '限速四十通行',
        linkedOrderId: 'FB-20261126-010',
        linkedOrderNote: '接口签名待核验',
        flowStage: 2,
        triggerLogs: [
          { time: '2026-11-26 08:55:12', event: '智慧提速子系统推送速度策略 TS-20261126-02', result: '已接收' },
          { time: '2026-11-26 08:56:00', event: '策略口径与桩号映射核验未完成，暂未自动触发下发', result: '待核验' }
        ]
      }
    ],

    receipts: {
      'FB-20261126-007': [
        {
          boardId: 'VMS-BT-A01',
          dispatchStatus: '已下发', dispatchTime: '10:30:00',
          receiveStatus: '已接收', receiveTime: '10:30:02',
          readbackStatus: '内容一致', readbackTime: '10:30:06',
          confirmStatus: '已确认显示', confirmTime: '10:31:08',
          verifyRecord: '现场核验 · 巡查员D（演示）'
        },
        {
          boardId: 'VMS-BT-A02',
          dispatchStatus: '已下发', dispatchTime: '10:30:00',
          receiveStatus: '已接收', receiveTime: '10:30:04',
          readbackStatus: '未回读', readbackTime: '—',
          confirmStatus: '待确认显示', confirmTime: '—',
          verifyRecord: '待设备回读与现场核验'
        },
        {
          boardId: 'VMS-BT-A03',
          dispatchStatus: '已下发', dispatchTime: '10:30:00',
          receiveStatus: '未回执', receiveTime: '—',
          readbackStatus: '未回读', readbackTime: '—',
          confirmStatus: '待确认显示', confirmTime: '—',
          verifyRecord: '设备当前离线，等待重连回执'
        }
      ],
      'FB-20261126-005': [
        {
          boardId: 'VMS-BT-A04',
          dispatchStatus: '已下发', dispatchTime: '08:40:00',
          receiveStatus: '已接收', receiveTime: '08:40:03',
          readbackStatus: '内容一致', readbackTime: '08:40:08',
          confirmStatus: '已确认显示', confirmTime: '08:42:15',
          verifyRecord: '现场核验 · 巡查员D（演示）'
        },
        {
          boardId: 'VMS-BT-A06',
          dispatchStatus: '已下发', dispatchTime: '08:40:00',
          receiveStatus: '已接收', receiveTime: '08:40:05',
          readbackStatus: '内容一致', readbackTime: '08:40:11',
          confirmStatus: '已确认显示', confirmTime: '08:43:10',
          verifyRecord: '现场核验 · 巡查员E（演示）'
        }
      ],
      'FB-20261125-004': [
        {
          boardId: 'VMS-ZD-A01',
          dispatchStatus: '已下发', dispatchTime: '16:20:00',
          receiveStatus: '已接收', receiveTime: '16:20:02',
          readbackStatus: '内容一致', readbackTime: '16:20:07',
          confirmStatus: '已确认显示', confirmTime: '16:21:44',
          verifyRecord: '现场核验 · 巡查员D（演示）'
        }
      ],
      'FB-20261125-006': [
        {
          boardId: 'VMS-BT-B01',
          dispatchStatus: '已下发', dispatchTime: '16:05:00',
          receiveStatus: '已接收', receiveTime: '16:05:03',
          readbackStatus: '内容一致', readbackTime: '16:05:09',
          confirmStatus: '已确认显示', confirmTime: '16:06:12',
          verifyRecord: '已撤销前曾现场核验（演示）'
        },
        {
          boardId: 'VMS-QL-C03',
          dispatchStatus: '已下发', dispatchTime: '16:05:00',
          receiveStatus: '已接收', receiveTime: '16:05:04',
          readbackStatus: '内容一致', readbackTime: '16:05:10',
          confirmStatus: '已确认显示', confirmTime: '16:06:35',
          verifyRecord: '已撤销前曾现场核验（演示）'
        }
      ]
    }
  };

  /* ------------------------------------------------------------------------
     UI STATE
     ------------------------------------------------------------------------ */
  const ui = {
    lastSeenGlobalSec: null,
    // Page 1: overview
    ovSec: 'all',
    ovGroup: 'all',
    ovOnline: 'all',
    ovFeedback: 'all',
    ovKw: '',
    ovPage: 1,
    selectedBoardId: 'VMS-BT-A01',

    // Page 2: templates
    tplCat: 'all',
    tplSpec: 'all',
    tplStatus: 'all',
    tplKw: '',
    tplPage: 1,
    selectedTplId: 'MB-202611-003',
    tplDraft: null,

    // Page 3: review
    revSec: 'all',
    revStatus: 'all',
    revPeriod: '2026年11月',
    revKw: '',
    revPage: 1,
    selectedOrderId: 'FB-20261126-007',

    // Page 4: plans
    planScene: 'all',
    planApproval: 'all',
    planInterface: 'all',
    planSec: 'all',
    planCond: 'all',
    selectedPlanId: 'YA-DG-003',

    // Page 5: receipts
    recOrderId: 'FB-20261126-007',
    recGroup: 'all',
    recDate: '2026-11-26',
    recKw: '',
    selectedRecBoardId: 'VMS-BT-A01'
  };

  let lastHostEl = null;
  let lastCtx = null;
  let currentSubPage = 'overview';

  function getNowHm() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function getNowHms() {
    const d = new Date();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    const ss = String(d.getSeconds()).padStart(2, '0');
    return `${hh}:${mm}:${ss}`;
  }

  function getBoard(boardId) {
    return store.boards.find(b => b.id === boardId) || store.boards[0];
  }

  function getOrder(orderId) {
    return store.orders.find(o => o.id === orderId) || store.orders[0];
  }

  function getTemplate(tplId) {
    return store.templates.find(t => t.id === tplId) || store.templates[0];
  }

  function getOrderReceipts(orderId) {
    const order = getOrder(orderId);
    if (!order) return [];
    if (!store.receipts[order.id]) {
      return order.boardIds.map(bid => ({
        boardId: bid,
        dispatchStatus: order.status === '已下发' ? '已下发' : '待下发',
        dispatchTime: order.status === '已下发' ? `${order.scheduleTime.split(' ')[1] || '10:30'}:00` : '—',
        receiveStatus: '未回执',
        receiveTime: '—',
        readbackStatus: '未回读',
        readbackTime: '—',
        confirmStatus: '待确认显示',
        confirmTime: '—',
        verifyRecord: order.status === '已下发' ? '待设备回读与现场核验' : '发布单尚未下发'
      }));
    }
    return store.receipts[order.id];
  }

  function ensureTplDraft(tpl) {
    if (!tpl) return;
    if (!ui.tplDraft || ui.tplDraft.id !== tpl.id) {
      ui.tplDraft = {
        id: tpl.id,
        category: tpl.category,
        spec: tpl.spec,
        line1: tpl.line1,
        line2: tpl.line2,
        startTime: tpl.startTime,
        endTime: tpl.endTime
      };
    }
  }

  /* ------------------------------------------------------------------------
     1. SUBPAGE: 情报板总览 (overview)
     ------------------------------------------------------------------------ */
  function renderOverviewPage() {
    const filtered = store.boards.filter(b => {
      if (ui.ovSec !== 'all' && b.secId !== ui.ovSec) return false;
      if (ui.ovGroup !== 'all' && b.group !== ui.ovGroup) return false;
      if (ui.ovOnline === 'online' && !b.online) return false;
      if (ui.ovOnline === 'offline' && b.online) return false;
      if (ui.ovFeedback === 'pending' && b.feedbackStatus !== '待确认显示') return false;
      if (ui.ovKw.trim()) {
        const kw = ui.ovKw.trim().toLowerCase();
        const hay = `${b.id} ${b.stake} ${b.pointName} ${secName(b.secId)} ${b.confirmedTitle}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (ui.ovPage > totalPages) ui.ovPage = totalPages;
    const pageRows = filtered.slice((ui.ovPage - 1) * pageSize, ui.ovPage * pageSize);

    if (!filtered.some(b => b.id === ui.selectedBoardId) && pageRows.length > 0) {
      ui.selectedBoardId = pageRows[0].id;
    }
    const sel = getBoard(ui.selectedBoardId);

    const totalBoards = store.boards.length;
    const onlineBoards = store.boards.filter(b => b.online).length;
    const offlineBoards = totalBoards - onlineBoards;
    const totalOrders = store.orders.length;
    const latestIssuedOrder = store.orders.find(o => o.status === '已下发') || store.orders[0];
    const latestRecs = getOrderReceipts(latestIssuedOrder.id);
    const pendingConfirmCount = latestRecs.filter(r => r.confirmStatus !== '已确认显示').length;

    // Pending alerts related to selected board's latest order (or latest order)
    const contextOrderId = sel.lastOrderId || latestIssuedOrder.id;
    const contextRecs = getOrderReceipts(contextOrderId);
    const pendingRecs = contextRecs.filter(r => r.confirmStatus !== '已确认显示');

    return `
      <div class="m13-page">
        <div class="m13-filter-bar">
          <div class="m13-filter-group">
            <div class="m13-filter-item">
              <label>所属工区</label>
              <select class="m13-select" id="m13OvSec">
                <option value="all" ${ui.ovSec === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTION_META.map(s => `<option value="${s.id}" ${ui.ovSec === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m13-filter-item">
              <label>设备分组</label>
              <select class="m13-select" id="m13OvGroup">
                <option value="all" ${ui.ovGroup === 'all' ? 'selected' : ''}>全部分组</option>
                <option value="施工保通组" ${ui.ovGroup === '施工保通组' ? 'selected' : ''}>施工保通组</option>
                <option value="场站出入口" ${ui.ovGroup === '场站出入口' ? 'selected' : ''}>场站出入口</option>
                <option value="枢纽互通组" ${ui.ovGroup === '枢纽互通组' ? 'selected' : ''}>枢纽互通组</option>
                <option value="长大桥梁组" ${ui.ovGroup === '长大桥梁组' ? 'selected' : ''}>长大桥梁组</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>在线状态</label>
              <select class="m13-select" id="m13OvOnline">
                <option value="all" ${ui.ovOnline === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="online" ${ui.ovOnline === 'online' ? 'selected' : ''}>在线</option>
                <option value="offline" ${ui.ovOnline === 'offline' ? 'selected' : ''}>离线</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>关键词</label>
              <div class="m13-search-box">
                ${SVG.search}
                <input type="text" class="m13-input" id="m13OvKw" placeholder="桩号 / 设备编号" value="${esc(ui.ovKw)}">
              </div>
            </div>
          </div>
          <div class="m13-filter-actions">
            <button class="m13-btn-primary" data-action="ov-query">${SVG.search} 查询</button>
            <button class="m13-btn-ghost" data-action="ov-reset">${SVG.refresh} 重置</button>
          </div>
        </div>

        <section class="m13-panel">
          <div class="m13-panel-head">
            <div class="m13-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">情报板运行概况</span>
              <span class="m13-panel-sub">(2026年11月)</span>
            </div>
          </div>
          <div class="m13-panel-body">
            <div class="m13-kpi-grid-5">
              <div class="m13-kpi-card" data-action="ov-kpi" data-kpi="all">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.board}</div>
                <div>
                  <div class="m13-kpi-label">接入情报板</div>
                  <div class="m13-kpi-val m13-c-cyan">${totalBoards}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="ov-kpi" data-kpi="online">
                <div class="m13-kpi-ico m13-ico-green">${SVG.signal}</div>
                <div>
                  <div class="m13-kpi-label">在线</div>
                  <div class="m13-kpi-val m13-c-green">${onlineBoards}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="ov-kpi" data-kpi="offline">
                <div class="m13-kpi-ico m13-ico-slate">${SVG.signalOff}</div>
                <div>
                  <div class="m13-kpi-label">离线</div>
                  <div class="m13-kpi-val m13-c-slate">${offlineBoards}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="goto-review">
                <div class="m13-kpi-ico m13-ico-blue">${SVG.doc}</div>
                <div>
                  <div class="m13-kpi-label">本期发布单</div>
                  <div class="m13-kpi-val m13-c-blue">${totalOrders}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="ov-kpi" data-kpi="pending">
                <div class="m13-kpi-ico m13-ico-gold">${SVG.warnTri}</div>
                <div>
                  <div class="m13-kpi-label">最新发布待确认</div>
                  <div class="m13-kpi-val m13-c-gold">${pendingConfirmCount}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="m13-split-main">
          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">情报板设备列表</span>
              </div>
              <span class="m13-panel-sub">更新于 ${esc(store.lastUpdated)}</span>
            </div>
            <div class="m13-panel-body">
              <div class="m13-table-wrap">
                <table class="m13-table">
                  <thead>
                    <tr>
                      <th>设备编号</th>
                      <th>工区与点位</th>
                      <th>设备分组</th>
                      <th>在线状态</th>
                      <th>最近确认板面</th>
                      <th>最近发布</th>
                      <th>显示反馈</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pageRows.length === 0 ? `<tr><td colspan="8" style="text-align:center;color:#8ab4dc;padding:28px;">暂无匹配的情报板设备</td></tr>` : pageRows.map(b => `
                      <tr class="${b.id === sel.id ? 'm13-row-selected' : ''}" data-action="ov-select-board" data-board-id="${esc(b.id)}">
                        <td><span class="m13-cell-main">${esc(b.id)}</span></td>
                        <td>
                          <div class="m13-cell-main">${esc(secName(b.secId))} · ${esc(b.pointName)}</div>
                          <div class="m13-cell-sub">${esc(b.stake)}</div>
                        </td>
                        <td>${esc(b.group)}</td>
                        <td><span class="m13-tag ${b.online ? 'm13-tag-green' : 'm13-tag-slate'}">${b.online ? '在线' : '离线'}</span></td>
                        <td>${esc(b.confirmedTitle)}</td>
                        <td>
                          <div class="m13-cell-main">${esc(b.lastTime)}</div>
                          <div class="m13-cell-sub">${esc(b.lastOrderId)}</div>
                        </td>
                        <td><span class="m13-tag ${statusTagClass(b.feedbackStatus)}">${esc(b.feedbackStatus)}</span></td>
                        <td><button class="m13-act-link" data-action="ov-select-board" data-board-id="${esc(b.id)}">查看</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ${renderPagerHtml(filtered.length, pageSize, ui.ovPage, '块情报板', 'ovPage')}
            </div>
          </section>

          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">情报板详情</span>
              </div>
              <span class="m13-head-chip">${esc(sel.direction)}</span>
            </div>
            <div class="m13-panel-body">
              <div class="m13-detail-top">
                <span class="m13-detail-code">${esc(sel.id)}</span>
                <span class="m13-tag ${sel.online ? 'm13-tag-green' : 'm13-tag-slate'}">${sel.online ? '在线' : '离线'}</span>
              </div>
              <div class="m13-kv-list">
                <div class="m13-kv-row"><span class="m13-kv-k">工程位置</span><span class="m13-kv-v">${esc(secName(sel.secId))} · ${esc(sel.stake)} · ${esc(sel.pointName)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">设备分组</span><span class="m13-kv-v">${esc(sel.groupDetail)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">设备规格</span><span class="m13-kv-v">${esc(sel.spec)}</span></div>
              </div>
              <div class="m13-subhead-row">
                <span>当前已确认板面</span>
                <span class="m13-tag ${statusTagClass(sel.feedbackStatus)}">${esc(sel.feedbackStatus)}</span>
              </div>
              ${renderLedPreviewSvg(sel.line1, sel.line2, sel.spec)}
              <div class="m13-led-caption">
                <span>发布单 ${esc(sel.lastOrderId)}</span>
                <span>${sel.feedbackStatus === '已确认显示' ? `现场核验 ${esc(sel.verifyTime)}` : '等待现场显示确认'}</span>
              </div>
              <div class="m13-alert-list">
                ${pendingRecs.length === 0 ? `
                  <div class="m13-note-box">${SVG.checkCircle} 关联发布单 ${esc(contextOrderId)} 全部目标设备已完成显示确认</div>
                ` : pendingRecs.map(r => {
                  const rb = getBoard(r.boardId);
                  const hint = !rb.online
                    ? '离线，接收回执待返回'
                    : (r.receiveStatus === '已接收' ? '已接收，显示回读待返回' : '已下发，接收回执待返回');
                  return `
                    <div class="m13-alert-row" data-action="ov-goto-rec-board" data-order-id="${esc(contextOrderId)}" data-board-id="${esc(r.boardId)}">
                      <div class="m13-alert-left">
                        <span class="m13-alert-ico">${SVG.warnTri}</span>
                        <span><strong>${esc(r.boardId)}</strong> ${esc(hint)}</span>
                      </div>
                      <span class="m13-tag m13-tag-amber">${esc(r.confirmStatus)}</span>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="m13-actions-row">
                <button class="m13-btn-ghost" data-action="ov-goto-order" data-order-id="${esc(sel.lastOrderId)}">${SVG.doc} 查看发布单</button>
                <button class="m13-btn-primary" data-action="ov-goto-receipt" data-order-id="${esc(sel.lastOrderId)}" data-board-id="${esc(sel.id)}">${SVG.monitor} 查看回执记录</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     2. SUBPAGE: 内容模板 (templates)
     ------------------------------------------------------------------------ */
  function renderTemplatesPage() {
    const filtered = store.templates.filter(t => {
      if (ui.tplCat !== 'all' && t.category !== ui.tplCat) return false;
      if (ui.tplSpec !== 'all' && t.spec !== ui.tplSpec) return false;
      if (ui.tplStatus !== 'all' && t.status !== ui.tplStatus) return false;
      if (ui.tplKw.trim()) {
        const kw = ui.tplKw.trim().toLowerCase();
        const hay = `${t.id} ${t.name} ${t.line1} ${t.line2}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (ui.tplPage > totalPages) ui.tplPage = totalPages;
    const pageRows = filtered.slice((ui.tplPage - 1) * pageSize, ui.tplPage * pageSize);

    if (!filtered.some(t => t.id === ui.selectedTplId) && pageRows.length > 0) {
      ui.selectedTplId = pageRows[0].id;
    }
    const sel = getTemplate(ui.selectedTplId);
    ensureTplDraft(sel);
    const draft = ui.tplDraft;

    const totalTpl = store.templates.length;
    const cntText = store.templates.filter(t => t.category === '常用文本').length;
    const cntBoard = store.templates.filter(t => t.category === '板面模板').length;
    const cntPlan = store.templates.filter(t => t.category === '预案内容').length;
    const charCap = String(draft.spec).includes('192') ? 10 : 8;

    return `
      <div class="m13-page">
        <div class="m13-filter-bar">
          <div class="m13-filter-group">
            <div class="m13-filter-item">
              <label>模板分类</label>
              <select class="m13-select" id="m13TplCatFilter">
                <option value="all" ${ui.tplCat === 'all' ? 'selected' : ''}>全部分类</option>
                <option value="常用文本" ${ui.tplCat === '常用文本' ? 'selected' : ''}>常用文本</option>
                <option value="板面模板" ${ui.tplCat === '板面模板' ? 'selected' : ''}>板面模板</option>
                <option value="预案内容" ${ui.tplCat === '预案内容' ? 'selected' : ''}>预案内容</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>适配规格</label>
              <select class="m13-select" id="m13TplSpecFilter">
                <option value="all" ${ui.tplSpec === 'all' ? 'selected' : ''}>全部规格</option>
                <option value="单黄LED 128×48" ${ui.tplSpec === '单黄LED 128×48' ? 'selected' : ''}>单黄LED 128×48</option>
                <option value="全彩LED 192×64" ${ui.tplSpec === '全彩LED 192×64' ? 'selected' : ''}>全彩LED 192×64</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>有效状态</label>
              <select class="m13-select" id="m13TplStatusFilter">
                <option value="all" ${ui.tplStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="有效" ${ui.tplStatus === '有效' ? 'selected' : ''}>有效</option>
                <option value="待启用" ${ui.tplStatus === '待启用' ? 'selected' : ''}>待启用</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>关键词</label>
              <div class="m13-search-box">
                ${SVG.search}
                <input type="text" class="m13-input" id="m13TplKw" placeholder="模板编号 / 名称" value="${esc(ui.tplKw)}">
              </div>
            </div>
          </div>
          <div class="m13-filter-actions">
            <button class="m13-btn-primary" data-action="tpl-query">${SVG.search} 查询</button>
            <button class="m13-btn-ghost" data-action="tpl-reset">${SVG.refresh} 重置</button>
            <button class="m13-btn-ghost" data-action="open-add-tpl">${SVG.plus} 新增模板</button>
          </div>
        </div>

        <section class="m13-panel">
          <div class="m13-panel-head">
            <div class="m13-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">模板分类统计</span>
              <span class="m13-panel-sub">(2026年11月)</span>
            </div>
          </div>
          <div class="m13-panel-body">
            <div class="m13-kpi-grid-4">
              <div class="m13-kpi-card" data-action="tpl-kpi" data-cat="all">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.layers}</div>
                <div>
                  <div class="m13-kpi-label">模板总数</div>
                  <div class="m13-kpi-val m13-c-cyan">${totalTpl}<span class="m13-kpi-unit">个</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="tpl-kpi" data-cat="常用文本">
                <div class="m13-kpi-ico m13-ico-blue">${SVG.lines}</div>
                <div>
                  <div class="m13-kpi-label">常用文本</div>
                  <div class="m13-kpi-val m13-c-blue">${cntText}<span class="m13-kpi-unit">个</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="tpl-kpi" data-cat="板面模板">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.board}</div>
                <div>
                  <div class="m13-kpi-label">板面模板</div>
                  <div class="m13-kpi-val m13-c-cyan">${cntBoard}<span class="m13-kpi-unit">个</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="tpl-kpi" data-cat="预案内容">
                <div class="m13-kpi-ico m13-ico-green">${SVG.shieldCheck}</div>
                <div>
                  <div class="m13-kpi-label">预案内容</div>
                  <div class="m13-kpi-val m13-c-green">${cntPlan}<span class="m13-kpi-unit">个</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="m13-split-main">
          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">情报板内容模板</span>
              </div>
              <span class="m13-panel-sub">按分类与设备规格筛选</span>
            </div>
            <div class="m13-panel-body">
              <div class="m13-table-wrap">
                <table class="m13-table">
                  <thead>
                    <tr>
                      <th>模板名称 / 编号</th>
                      <th>模板分类</th>
                      <th>内容版本</th>
                      <th>适配规格</th>
                      <th>有效期</th>
                      <th>模板状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${pageRows.length === 0 ? `<tr><td colspan="7" style="text-align:center;color:#8ab4dc;padding:28px;">暂无匹配模板</td></tr>` : pageRows.map(t => `
                      <tr class="${t.id === sel.id ? 'm13-row-selected' : ''}" data-action="tpl-select" data-tpl-id="${esc(t.id)}">
                        <td>
                          <div class="m13-cell-main">${esc(t.name)}</div>
                          <div class="m13-cell-sub">${esc(t.id)}</div>
                        </td>
                        <td>${esc(t.category)}</td>
                        <td>${esc(t.version)}</td>
                        <td>${esc(t.spec)}</td>
                        <td>${esc(t.validText)}</td>
                        <td><span class="m13-tag ${statusTagClass(t.status)}">${esc(t.status)}</span></td>
                        <td><button class="m13-act-link" data-action="tpl-select" data-tpl-id="${esc(t.id)}">编辑</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
              ${renderPagerHtml(filtered.length, pageSize, ui.tplPage, '个模板', 'tplPage')}
            </div>
          </section>

          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">编辑内容模板</span>
              </div>
              <span class="m13-head-chip" id="m13TplCatBadge">${esc(draft.category)}</span>
            </div>
            <div class="m13-panel-body">
              <div class="m13-detail-top">
                <div>
                  <span class="m13-detail-code">${esc(sel.id)}</span>
                  <span class="m13-detail-ver">${esc(sel.version)}</span>
                </div>
                <span class="m13-tag ${statusTagClass(sel.status)}">${esc(sel.status)}</span>
              </div>
              <div class="m13-subhead-row">
                <span>板面预览</span>
                <span class="m13-panel-sub" id="m13TplSpecLabel">${esc(draft.spec)}</span>
              </div>
              <div id="m13TplLivePreviewWrap">
                ${renderLedPreviewSvg(draft.line1, draft.line2, draft.spec)}
              </div>
              <div class="m13-led-caption">
                <span>${esc(sel.name)}</span>
                <span id="m13TplCharHint">双行显示 每行上限 ${charCap} 字</span>
              </div>
              <div class="m13-form-grid-2">
                <div class="m13-field">
                  <label>模板分类</label>
                  <select class="m13-select" id="m13TplEditCat">
                    <option value="预案内容" ${draft.category === '预案内容' ? 'selected' : ''}>预案内容</option>
                    <option value="常用文本" ${draft.category === '常用文本' ? 'selected' : ''}>常用文本</option>
                    <option value="板面模板" ${draft.category === '板面模板' ? 'selected' : ''}>板面模板</option>
                  </select>
                </div>
                <div class="m13-field">
                  <label>适配规格</label>
                  <select class="m13-select" id="m13TplEditSpec">
                    <option value="单黄LED 128×48" ${draft.spec === '单黄LED 128×48' ? 'selected' : ''}>单黄LED 128×48</option>
                    <option value="全彩LED 192×64" ${draft.spec === '全彩LED 192×64' ? 'selected' : ''}>全彩LED 192×64</option>
                  </select>
                </div>
                <div class="m13-field">
                  <label>第一行文案</label>
                  <input type="text" class="m13-input" id="m13TplLine1" maxlength="12" value="${esc(draft.line1)}">
                </div>
                <div class="m13-field">
                  <label>第二行文案</label>
                  <input type="text" class="m13-input" id="m13TplLine2" maxlength="12" value="${esc(draft.line2)}">
                </div>
                <div class="m13-field">
                  <label>生效时间</label>
                  <div class="m13-input-icon-wrap">
                    <input type="text" class="m13-input" id="m13TplStart" value="${esc(draft.startTime)}">
                    ${SVG.calendar}
                  </div>
                </div>
                <div class="m13-field">
                  <label>失效时间</label>
                  <div class="m13-input-icon-wrap">
                    <input type="text" class="m13-input" id="m13TplEnd" value="${esc(draft.endTime)}">
                    ${SVG.calendar}
                  </div>
                </div>
              </div>
              <div class="m13-actions-row">
                <button class="m13-btn-primary" data-action="tpl-save">${SVG.edit} 保存模板</button>
                <button class="m13-btn-ghost" data-action="tpl-use-order">${SVG.doc} 引用到发布单</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     3. SUBPAGE: 审核发布 (review)
     ------------------------------------------------------------------------ */
  function renderReviewPage() {
    const filtered = store.orders.filter(o => {
      if (ui.revSec !== 'all' && o.secId !== ui.revSec) return false;
      if (ui.revStatus !== 'all' && o.status !== ui.revStatus) return false;
      if (ui.revPeriod === '近7日' && !o.date.startsWith('2026-11-2')) return false;
      if (ui.revKw.trim()) {
        const kw = ui.revKw.trim().toLowerCase();
        const hay = `${o.id} ${o.title} ${o.line1} ${o.line2} ${o.groupLabel}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (ui.revPage > totalPages) ui.revPage = totalPages;
    const pageRows = filtered.slice((ui.revPage - 1) * pageSize, ui.revPage * pageSize);

    if (!filtered.some(o => o.id === ui.selectedOrderId) && pageRows.length > 0) {
      ui.selectedOrderId = pageRows[0].id;
    }
    const sel = getOrder(ui.selectedOrderId);
    const recs = getOrderReceipts(sel.id);
    const confirmedCount = recs.filter(r => r.confirmStatus === '已确认显示').length;
    const firstBoard = getBoard(sel.boardIds[0]);

    const totalOrders = store.orders.length;
    const cntReview = store.orders.filter(o => o.status === '待审核').length;
    const cntAuth = store.orders.filter(o => o.status === '待授权').length;
    const cntIssued = store.orders.filter(o => o.status === '已下发').length;
    const cntRevoked = store.orders.filter(o => o.status === '已撤销').length;

    // 5-step flow state
    const isComposeDone = true;
    const isReviewDone = ['待授权', '已下发', '已撤销'].includes(sel.status);
    const isAuthDone = ['已下发', '已撤销'].includes(sel.status);
    const isDispatchDone = ['已下发', '已撤销'].includes(sel.status);

    const stepClass = (idx) => {
      if (idx === 0) return isComposeDone ? 'done' : 'active';
      if (idx === 1) return isReviewDone ? 'done' : (sel.status === '待审核' ? 'active' : 'pending');
      if (idx === 2) return isAuthDone ? 'done' : (sel.status === '待授权' ? 'active' : 'pending');
      if (idx === 3) return isDispatchDone ? 'done' : 'pending';
      if (idx === 4) return sel.status === '已下发' ? 'active' : (sel.status === '已撤销' ? 'done' : 'pending');
      return 'pending';
    };

    const actionBtnForRow = (o) => {
      if (o.status === '待审核') return `<button class="m13-act-link" data-action="rev-open-audit" data-order-id="${esc(o.id)}">审核</button>`;
      if (o.status === '待授权') return `<button class="m13-act-link" data-action="rev-open-auth" data-order-id="${esc(o.id)}">授权下发</button>`;
      return `<button class="m13-act-link" data-action="rev-select-order" data-order-id="${esc(o.id)}">查看</button>`;
    };

    const authBadgeText = sel.status === '已下发'
      ? '授权已核验'
      : sel.status === '待授权'
        ? '待授权确认'
        : sel.status === '待审核'
          ? '待内容审核'
          : '已撤销发布';
    const authBadgeCls = sel.status === '已下发'
      ? 'm13-tag-green'
      : (sel.status === '已撤销' ? 'm13-tag-slate' : 'm13-tag-amber');

    return `
      <div class="m13-page">
        <div class="m13-filter-bar">
          <div class="m13-filter-group">
            <div class="m13-filter-item">
              <label>所属工区</label>
              <select class="m13-select" id="m13RevSec">
                <option value="all" ${ui.revSec === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTION_META.map(s => `<option value="${s.id}" ${ui.revSec === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m13-filter-item">
              <label>发布状态</label>
              <select class="m13-select" id="m13RevStatus">
                <option value="all" ${ui.revStatus === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="待审核" ${ui.revStatus === '待审核' ? 'selected' : ''}>待审核</option>
                <option value="待授权" ${ui.revStatus === '待授权' ? 'selected' : ''}>待授权</option>
                <option value="已下发" ${ui.revStatus === '已下发' ? 'selected' : ''}>已下发</option>
                <option value="已撤销" ${ui.revStatus === '已撤销' ? 'selected' : ''}>已撤销</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>统计周期</label>
              <select class="m13-select" id="m13RevPeriod">
                <option value="2026年11月" ${ui.revPeriod === '2026年11月' ? 'selected' : ''}>2026年11月</option>
                <option value="近7日" ${ui.revPeriod === '近7日' ? 'selected' : ''}>近7日</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>关键词</label>
              <div class="m13-search-box">
                ${SVG.search}
                <input type="text" class="m13-input" id="m13RevKw" placeholder="发布编号 / 内容" value="${esc(ui.revKw)}">
              </div>
            </div>
          </div>
          <div class="m13-filter-actions">
            <button class="m13-btn-primary" data-action="rev-query">${SVG.search} 查询</button>
            <button class="m13-btn-ghost" data-action="rev-reset">${SVG.refresh} 重置</button>
            <button class="m13-btn-ghost" data-action="rev-open-create">${SVG.plus} 新建发布单</button>
          </div>
        </div>

        <section class="m13-panel">
          <div class="m13-panel-head">
            <div class="m13-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">发布办理概况</span>
              <span class="m13-panel-sub">(2026年11月)</span>
            </div>
          </div>
          <div class="m13-panel-body">
            <div class="m13-kpi-grid-5">
              <div class="m13-kpi-card" data-action="rev-kpi" data-status="all">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.doc}</div>
                <div>
                  <div class="m13-kpi-label">本期发布单</div>
                  <div class="m13-kpi-val m13-c-cyan">${totalOrders}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="rev-kpi" data-status="待审核">
                <div class="m13-kpi-ico m13-ico-gold">${SVG.search}</div>
                <div>
                  <div class="m13-kpi-label">待审核</div>
                  <div class="m13-kpi-val m13-c-gold">${cntReview}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="rev-kpi" data-status="待授权">
                <div class="m13-kpi-ico m13-ico-blue">${SVG.lock}</div>
                <div>
                  <div class="m13-kpi-label">待授权</div>
                  <div class="m13-kpi-val m13-c-blue">${cntAuth}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="rev-kpi" data-status="已下发">
                <div class="m13-kpi-ico m13-ico-green">${SVG.send}</div>
                <div>
                  <div class="m13-kpi-label">已下发</div>
                  <div class="m13-kpi-val m13-c-green">${cntIssued}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="rev-kpi" data-status="已撤销">
                <div class="m13-kpi-ico m13-ico-slate">${SVG.undo}</div>
                <div>
                  <div class="m13-kpi-label">已撤销</div>
                  <div class="m13-kpi-val m13-c-slate">${cntRevoked}<span class="m13-kpi-unit">条</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="m13-split-main">
          <div class="m13-left-stack">
            <section class="m13-panel">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">审核与发布单</span>
                </div>
                <span class="m13-panel-sub">已下发状态按系统发送统计</span>
              </div>
              <div class="m13-panel-body">
                <div class="m13-table-wrap">
                  <table class="m13-table">
                    <thead>
                      <tr>
                        <th>发布单编号</th>
                        <th>发布内容</th>
                        <th>版本</th>
                        <th>对象数</th>
                        <th>计划 / 下发时间</th>
                        <th>发布状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pageRows.length === 0 ? `<tr><td colspan="7" style="text-align:center;color:#8ab4dc;padding:24px;">暂无匹配发布单</td></tr>` : pageRows.map(o => `
                        <tr class="${o.id === sel.id ? 'm13-row-selected' : ''}" data-action="rev-select-order" data-order-id="${esc(o.id)}">
                          <td><span class="m13-cell-main">${esc(o.id)}</span></td>
                          <td>${esc(o.title)}</td>
                          <td>${esc(o.version)}</td>
                          <td>${o.boardIds.length} 块</td>
                          <td>${esc(o.scheduleTime)}</td>
                          <td><span class="m13-tag ${statusTagClass(o.status)}">${esc(o.status)}</span></td>
                          <td>${actionBtnForRow(o)}</td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
                ${renderPagerHtml(filtered.length, pageSize, ui.revPage, '条发布单', 'revPage')}
              </div>
            </section>

            <section class="m13-panel">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">本单发布流程</span>
                </div>
                <button class="m13-text-link" data-action="rev-goto-receipts" data-order-id="${esc(sel.id)}">查看回执记录 &gt;</button>
              </div>
              <div class="m13-panel-body">
                <div class="m13-flow-strip">
                  <div class="m13-flow-step ${stepClass(0)}">
                    <span class="m13-flow-ico">${SVG.edit}</span>
                    <div class="m13-flow-title">内容编排</div>
                    <div class="m13-flow-sub">${esc(sel.stepTimes.compose)}</div>
                  </div>
                  <div class="m13-flow-arrow">&rsaquo;</div>
                  <div class="m13-flow-step ${stepClass(1)}">
                    <span class="m13-flow-ico">${SVG.shieldCheck}</span>
                    <div class="m13-flow-title">内容审核</div>
                    <div class="m13-flow-sub">${esc(sel.stepTimes.review)}</div>
                  </div>
                  <div class="m13-flow-arrow">&rsaquo;</div>
                  <div class="m13-flow-step ${stepClass(2)}">
                    <span class="m13-flow-ico">${SVG.lock}</span>
                    <div class="m13-flow-title">授权确认</div>
                    <div class="m13-flow-sub">${esc(sel.stepTimes.auth)}</div>
                  </div>
                  <div class="m13-flow-arrow">&rsaquo;</div>
                  <div class="m13-flow-step ${stepClass(3)}">
                    <span class="m13-flow-ico">${SVG.send}</span>
                    <div class="m13-flow-title">下发情报板</div>
                    <div class="m13-flow-sub">${esc(sel.stepTimes.dispatch)}</div>
                  </div>
                  <div class="m13-flow-arrow">&rsaquo;</div>
                  <div class="m13-flow-step ${stepClass(4)}">
                    <span class="m13-flow-ico">${SVG.board}</span>
                    <div class="m13-flow-title">回执跟踪</div>
                    <div class="m13-flow-sub">${sel.status === '已下发' ? `${confirmedCount} / ${sel.boardIds.length} 块确认显示` : (sel.status === '已撤销' ? '已撤销停止跟踪' : '待下发后跟踪')}</div>
                  </div>
                </div>
                <div class="m13-note-box">
                  ${SVG.info}
                  <span>发布单授权通过后下发，显示反馈按设备分别记录。</span>
                </div>
              </div>
            </section>
          </div>

          <section class="m13-panel m13-review-detail">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">发布对象与授权</span>
              </div>
            </div>
            <div class="m13-panel-body">
              <div class="m13-detail-top">
                <div>
                  <span class="m13-detail-code">${esc(sel.id)}</span>
                  <span class="m13-detail-ver">${esc(sel.version)}</span>
                </div>
                <span class="m13-tag ${statusTagClass(sel.status)}">${esc(sel.status)}</span>
              </div>
              <div class="m13-kv-list">
                <div class="m13-kv-row"><span class="m13-kv-k">内容模板 / 版本</span><span class="m13-kv-v">${esc(sel.templateId)} · ${esc(sel.version)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">发布有效期</span><span class="m13-kv-v">${esc(sel.validRange)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">审核 / 授权</span><span class="m13-kv-v">${esc(sel.reviewer)} / ${esc(sel.authorizer)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">${esc((firstBoard.id || 'A01').split('-').pop())}原板面</span><span class="m13-kv-v">${esc(sel.prevBoardSummary)}</span></div>
              </div>
              <div class="m13-subhead-row">
                <span>${esc(sel.title)}</span>
                <span class="m13-tag ${authBadgeCls}">${esc(authBadgeText)}</span>
              </div>
              ${renderLedPreviewSvg(sel.line1, sel.line2, sel.spec)}
              <div class="m13-subhead-row">
                <span>已确认发布对象</span>
                <span class="m13-panel-sub">${sel.boardIds.length} 块 · ${esc(sel.groupLabel)}</span>
              </div>
              <div class="m13-target-list">
                ${sel.boardIds.map(bid => {
                  const b = getBoard(bid);
                  return `
                    <div class="m13-target-row">
                      <div class="m13-target-left">
                        <span style="color:#7dd3fc;display:inline-flex;">${SVG.monitor}</span>
                        <span class="m13-target-code">${esc(b.id)}</span>
                        <span class="m13-target-loc">${esc(b.stake)} · ${esc(b.pointName)}</span>
                      </div>
                      <span class="m13-tag m13-tag-blue">已确认对象</span>
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="m13-actions-row">
                ${sel.status === '待审核' ? `
                  <button class="m13-btn-primary" data-action="rev-open-audit" data-order-id="${esc(sel.id)}">${SVG.shieldCheck} 内容审核</button>
                  <button class="m13-btn-ghost" data-action="rev-goto-receipts" data-order-id="${esc(sel.id)}">${SVG.monitor} 查看回执</button>
                ` : sel.status === '待授权' ? `
                  <button class="m13-btn-primary" data-action="rev-open-auth" data-order-id="${esc(sel.id)}">${SVG.lock} 授权并下发</button>
                  <button class="m13-btn-ghost" data-action="rev-goto-receipts" data-order-id="${esc(sel.id)}">${SVG.monitor} 查看回执</button>
                ` : sel.status === '已下发' ? `
                  <button class="m13-btn-gold" data-action="rev-open-revoke" data-order-id="${esc(sel.id)}">${SVG.undo} 撤销发布</button>
                  <button class="m13-btn-ghost" data-action="rev-restore-prev" data-order-id="${esc(sel.id)}">${SVG.refresh} 恢复原内容</button>
                  <button class="m13-btn-primary" data-action="rev-goto-receipts" data-order-id="${esc(sel.id)}">${SVG.monitor} 查看回执</button>
                ` : `
                  <button class="m13-btn-ghost" data-action="rev-reopen" data-order-id="${esc(sel.id)}">${SVG.refresh} 重新提交审核</button>
                  <button class="m13-btn-primary" data-action="rev-goto-receipts" data-order-id="${esc(sel.id)}">${SVG.monitor} 查看回执</button>
                `}
              </div>
              <div class="m13-note-box">
                ${SVG.info}
                <span>恢复按各设备发布前的板面记录执行，撤销与恢复均需授权。</span>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     4. SUBPAGE: 联动预案 (plans)
     ------------------------------------------------------------------------ */
  function renderPlansPage() {
    const filtered = store.plans.filter(p => {
      if (ui.planScene !== 'all' && p.scene !== ui.planScene) return false;
      if (ui.planApproval !== 'all' && p.approvalStatus !== ui.planApproval) return false;
      if (ui.planInterface !== 'all' && p.interfaceStatus !== ui.planInterface) return false;
      if (ui.planSec !== 'all' && p.secId !== ui.planSec) return false;
      if (ui.planCond === 'met' && !p.conditionMet) return false;
      if (ui.planCond === 'pending' && p.conditionMet) return false;
      return true;
    });

    if (!filtered.some(p => p.id === ui.selectedPlanId) && filtered.length > 0) {
      ui.selectedPlanId = filtered[0].id;
    }
    const sel = store.plans.find(p => p.id === ui.selectedPlanId) || store.plans[0];
    const linkedOrder = sel.linkedOrderId ? store.orders.find(o => o.id === sel.linkedOrderId) : null;

    const totalPlans = store.plans.length;
    const approvedPlans = store.plans.filter(p => p.approvalStatus === '已批准').length;
    const metPlans = store.plans.filter(p => p.conditionMet).length;
    const pendingPlans = totalPlans - metPlans;

    const sceneIcon = (scene) => {
      if (scene === '施工导改') return SVG.road;
      if (scene === '天气预警') return SVG.cloud;
      return SVG.trend;
    };

    const planSteps = [
      { ico: SVG.road, title: '外部事件', sub: sel.scene === '施工导改' ? '导改时段生效' : (sel.scene === '天气预警' ? '气象预警信号' : '速度策略推送') },
      { ico: SVG.link, title: '计划匹配', sub: '接口与预案核验' },
      { ico: SVG.doc, title: '形成发布草稿', sub: '匹配对象与文案' },
      { ico: SVG.lock, title: '审核与授权', sub: '确认后下发' },
      { ico: SVG.board, title: '设备反馈', sub: '接收与显示核验' }
    ];

    return `
      <div class="m13-page">
        <div class="m13-filter-bar">
          <div class="m13-filter-group">
            <div class="m13-filter-item">
              <label>关联场景</label>
              <select class="m13-select" id="m13PlanScene">
                <option value="all" ${ui.planScene === 'all' ? 'selected' : ''}>全部场景</option>
                <option value="施工导改" ${ui.planScene === '施工导改' ? 'selected' : ''}>施工导改</option>
                <option value="天气预警" ${ui.planScene === '天气预警' ? 'selected' : ''}>天气预警</option>
                <option value="智慧提速" ${ui.planScene === '智慧提速' ? 'selected' : ''}>智慧提速</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>预案审批</label>
              <select class="m13-select" id="m13PlanApproval">
                <option value="all" ${ui.planApproval === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="已批准" ${ui.planApproval === '已批准' ? 'selected' : ''}>已批准</option>
                <option value="待批准" ${ui.planApproval === '待批准' ? 'selected' : ''}>待批准</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>接口状态</label>
              <select class="m13-select" id="m13PlanInterface">
                <option value="all" ${ui.planInterface === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="接口就绪" ${ui.planInterface === '接口就绪' ? 'selected' : ''}>接口就绪</option>
                <option value="待接入" ${ui.planInterface === '待接入' ? 'selected' : ''}>待接入</option>
                <option value="待核验" ${ui.planInterface === '待核验' ? 'selected' : ''}>待核验</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>所属工区</label>
              <select class="m13-select" id="m13PlanSec">
                <option value="all" ${ui.planSec === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTION_META.map(s => `<option value="${s.id}" ${ui.planSec === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m13-filter-actions">
            <button class="m13-btn-primary" data-action="plan-query">${SVG.search} 查询</button>
            <button class="m13-btn-ghost" data-action="plan-reset">${SVG.refresh} 重置</button>
            <button class="m13-btn-ghost" data-action="plan-open-config">${SVG.edit} 配置预案</button>
          </div>
        </div>

        <section class="m13-panel">
          <div class="m13-panel-head">
            <div class="m13-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">预案配置概况</span>
              <span class="m13-panel-sub">(2026年11月)</span>
            </div>
          </div>
          <div class="m13-panel-body">
            <div class="m13-kpi-grid-4">
              <div class="m13-kpi-card" data-action="plan-kpi" data-kpi="all">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.layers}</div>
                <div>
                  <div class="m13-kpi-label">联动预案</div>
                  <div class="m13-kpi-val m13-c-cyan">${totalPlans}<span class="m13-kpi-unit">项</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="plan-kpi" data-kpi="approved">
                <div class="m13-kpi-ico m13-ico-green">${SVG.shieldCheck}</div>
                <div>
                  <div class="m13-kpi-label">已批准</div>
                  <div class="m13-kpi-val m13-c-green">${approvedPlans}<span class="m13-kpi-unit">项</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="plan-kpi" data-kpi="met">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.link}</div>
                <div>
                  <div class="m13-kpi-label">满足联动条件</div>
                  <div class="m13-kpi-val m13-c-cyan">${metPlans}<span class="m13-kpi-unit">项</span></div>
                </div>
              </div>
              <div class="m13-kpi-card" data-action="plan-kpi" data-kpi="pending">
                <div class="m13-kpi-ico m13-ico-gold">${SVG.warnTri}</div>
                <div>
                  <div class="m13-kpi-label">待补条件</div>
                  <div class="m13-kpi-val m13-c-gold">${pendingPlans}<span class="m13-kpi-unit">项</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="m13-split-main">
          <div class="m13-left-stack">
            <section class="m13-panel" style="flex:1;">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">联动预案列表</span>
                </div>
                <span class="m13-panel-sub">施工导改 · 天气预警 · 智慧提速</span>
              </div>
              <div class="m13-panel-body">
                <div class="m13-plan-list">
                  ${filtered.length === 0 ? `<div style="text-align:center;color:#8ab4dc;padding:28px;">暂无匹配联动预案</div>` : filtered.map(p => `
                    <div class="m13-plan-card ${p.id === sel.id ? 'active' : ''}" data-action="plan-select" data-plan-id="${esc(p.id)}">
                      <div class="m13-plan-left">
                        <div class="m13-plan-ico">${sceneIcon(p.scene)}</div>
                        <div>
                          <div class="m13-cell-main">${esc(p.name)}</div>
                          <div class="m13-cell-sub">${esc(p.id)} &nbsp; ${esc(p.subTitle)}</div>
                        </div>
                      </div>
                      <div>
                        <div class="m13-plan-col-lbl">预案审批</div>
                        <span class="m13-tag ${statusTagClass(p.approvalStatus)}">${esc(p.approvalStatus)}</span>
                      </div>
                      <div>
                        <div class="m13-plan-col-lbl">联动接口</div>
                        <span class="m13-tag ${statusTagClass(p.interfaceStatus)}">${esc(p.interfaceStatus)}</span>
                      </div>
                      <div>
                        <span class="m13-tag ${p.conditionMet ? 'm13-tag-green' : 'm13-tag-slate'}">${p.conditionMet ? '条件满足' : '未启用'}</span>
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </section>

            <section class="m13-panel">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">联动发布流程</span>
                </div>
              </div>
              <div class="m13-panel-body">
                <div class="m13-flow-strip">
                  ${planSteps.map((st, idx) => {
                    const cls = idx < sel.flowStage ? 'done' : (idx === sel.flowStage ? 'active' : 'pending');
                    return `
                      ${idx > 0 ? '<div class="m13-flow-arrow">&rsaquo;</div>' : ''}
                      <div class="m13-flow-step ${cls}">
                        <span class="m13-flow-ico">${st.ico}</span>
                        <div class="m13-flow-title">${esc(st.title)}</div>
                        <div class="m13-flow-sub">${esc(st.sub)}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="m13-note-box">
                  ${SVG.info}
                  <span>联动规则匹配后形成发布草稿，按审核和授权流程下发。</span>
                </div>
              </div>
            </section>
          </div>

          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">联动条件与发布关联</span>
              </div>
            </div>
            <div class="m13-panel-body">
              <div class="m13-detail-top">
                <div>
                  <span class="m13-detail-code">${esc(sel.id)}</span>
                  <span class="m13-detail-ver">${esc(sel.name)}</span>
                </div>
                <span class="m13-tag ${sel.conditionMet ? 'm13-tag-green' : 'm13-tag-amber'}">${sel.conditionMet ? '条件满足' : '待补条件'}</span>
              </div>
              <div class="m13-kv-list">
                <div class="m13-kv-row"><span class="m13-kv-k">关联场景</span><span class="m13-kv-v">${esc(sel.scene)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">触发事件</span><span class="m13-kv-v">${esc(sel.triggerEvent)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">接口状态</span><span class="m13-kv-v"><span class="m13-tag ${statusTagClass(sel.interfaceStatus)}">${esc(sel.interfaceStatus)}</span></span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">预案审批</span><span class="m13-kv-v"><span class="m13-tag ${statusTagClass(sel.approvalStatus)}">${esc(sel.approvalStatus)}</span></span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">目标设备组</span><span class="m13-kv-v">${esc(sel.targetGroup)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">联动有效期</span><span class="m13-kv-v">${esc(sel.validRange)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">关联内容模板</span><span class="m13-kv-v">${esc(sel.templateId)} · ${esc(sel.templateVersion)}</span></div>
              </div>
              <div class="m13-recessed-box">
                <div class="m13-recessed-title">匹配板面内容</div>
                <div class="m13-recessed-lines">${esc(sel.line1)}<br>${esc(sel.line2)}</div>
              </div>
              <div class="m13-recessed-box">
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;">
                  <span class="m13-recessed-title" style="margin:0;">关联发布单</span>
                  ${linkedOrder ? `<span class="m13-tag ${statusTagClass(linkedOrder.status)}">${esc(linkedOrder.status)}</span>` : '<span class="m13-tag m13-tag-slate">未建单</span>'}
                </div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                  <strong style="font-size:13px;color:#38bdf8;">${esc(linkedOrder ? linkedOrder.id : '待满足条件后生成')}</strong>
                  <span style="font-size:11.5px;color:#9ec0e6;">${esc(sel.linkedOrderNote)}</span>
                </div>
              </div>
              <div class="m13-actions-row">
                <button class="m13-btn-primary" data-action="plan-goto-order" data-plan-id="${esc(sel.id)}">${SVG.doc} 查看关联发布单</button>
                <button class="m13-btn-ghost" data-action="plan-check-triggers" data-plan-id="${esc(sel.id)}">${SVG.clock} 核对触发记录</button>
              </div>
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     5. SUBPAGE: 回执记录 (receipts)
     ------------------------------------------------------------------------ */
  function renderReceiptsPage() {
    const order = getOrder(ui.recOrderId);
    const allRecs = getOrderReceipts(order.id);
    const filtered = allRecs.filter(r => {
      const b = getBoard(r.boardId);
      if (ui.recGroup !== 'all' && b.groupDetail !== ui.recGroup && b.group !== ui.recGroup) return false;
      if (ui.recDate !== 'all' && order.date !== ui.recDate) return false;
      if (ui.recKw.trim()) {
        const kw = ui.recKw.trim().toLowerCase();
        const hay = `${b.id} ${b.stake} ${b.pointName}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    if (!filtered.some(r => r.boardId === ui.selectedRecBoardId) && filtered.length > 0) {
      ui.selectedRecBoardId = filtered[0].boardId;
    }
    const selRec = filtered.find(r => r.boardId === ui.selectedRecBoardId) || allRecs[0];
    const selBoard = getBoard(selRec ? selRec.boardId : order.boardIds[0]);

    const cntTarget = allRecs.length;
    const cntDispatched = allRecs.filter(r => r.dispatchStatus === '已下发').length;
    const cntReceived = allRecs.filter(r => r.receiveStatus === '已接收').length;
    const cntConfirmed = allRecs.filter(r => r.confirmStatus === '已确认显示').length;
    const cntPending = cntTarget - cntConfirmed;

    const groupOptions = Array.from(new Set(store.boards.map(b => b.groupDetail)));

    return `
      <div class="m13-page">
        <div class="m13-filter-bar">
          <div class="m13-filter-group">
            <div class="m13-filter-item">
              <label>发布单</label>
              <select class="m13-select" id="m13RecOrder">
                ${store.orders.map(o => `<option value="${esc(o.id)}" ${order.id === o.id ? 'selected' : ''}>${esc(o.id)}</option>`).join('')}
              </select>
            </div>
            <div class="m13-filter-item">
              <label>设备分组</label>
              <select class="m13-select" id="m13RecGroup">
                <option value="all" ${ui.recGroup === 'all' ? 'selected' : ''}>全部分组</option>
                ${groupOptions.map(g => `<option value="${esc(g)}" ${ui.recGroup === g ? 'selected' : ''}>${esc(g)}</option>`).join('')}
              </select>
            </div>
            <div class="m13-filter-item">
              <label>反馈日期</label>
              <select class="m13-select" id="m13RecDate">
                <option value="all" ${ui.recDate === 'all' ? 'selected' : ''}>全部日期</option>
                <option value="2026-11-26" ${ui.recDate === '2026-11-26' ? 'selected' : ''}>2026-11-26</option>
                <option value="2026-11-25" ${ui.recDate === '2026-11-25' ? 'selected' : ''}>2026-11-25</option>
              </select>
            </div>
            <div class="m13-filter-item">
              <label>关键词</label>
              <div class="m13-search-box">
                ${SVG.search}
                <input type="text" class="m13-input" id="m13RecKw" placeholder="设备编号 / 桩号" value="${esc(ui.recKw)}">
              </div>
            </div>
          </div>
          <div class="m13-filter-actions">
            <button class="m13-btn-primary" data-action="rec-query">${SVG.search} 查询</button>
            <button class="m13-btn-ghost" data-action="rec-reset">${SVG.refresh} 重置</button>
          </div>
        </div>

        <section class="m13-panel">
          <div class="m13-panel-head">
            <div class="m13-panel-head-left">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">本单设备反馈</span>
              <span class="m13-panel-sub">(2026年11月)</span>
            </div>
            <span class="m13-panel-sub">发布单 ${esc(order.id)} · ${esc(order.title)}</span>
          </div>
          <div class="m13-panel-body">
            <div class="m13-kpi-grid-5">
              <div class="m13-kpi-card">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.board}</div>
                <div>
                  <div class="m13-kpi-label">发布对象</div>
                  <div class="m13-kpi-val m13-c-cyan">${cntTarget}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card">
                <div class="m13-kpi-ico m13-ico-blue">${SVG.send}</div>
                <div>
                  <div class="m13-kpi-label">已下发</div>
                  <div class="m13-kpi-val m13-c-blue">${cntDispatched}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card">
                <div class="m13-kpi-ico m13-ico-cyan">${SVG.inbox}</div>
                <div>
                  <div class="m13-kpi-label">已接收</div>
                  <div class="m13-kpi-val m13-c-cyan">${cntReceived}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card">
                <div class="m13-kpi-ico m13-ico-green">${SVG.checkCircle}</div>
                <div>
                  <div class="m13-kpi-label">已确认显示</div>
                  <div class="m13-kpi-val m13-c-green">${cntConfirmed}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
              <div class="m13-kpi-card">
                <div class="m13-kpi-ico m13-ico-gold">${SVG.warnTri}</div>
                <div>
                  <div class="m13-kpi-label">待确认显示</div>
                  <div class="m13-kpi-val m13-c-gold">${cntPending}<span class="m13-kpi-unit">块</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div class="m13-split-main">
          <div class="m13-left-stack">
            <section class="m13-panel" style="flex:1;">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">逐设备反馈明细</span>
                </div>
                <span class="m13-panel-sub">${esc(order.date)} &nbsp; ${esc(order.id)}</span>
              </div>
              <div class="m13-panel-body">
                <div class="m13-table-wrap">
                  <table class="m13-table">
                    <thead>
                      <tr>
                        <th>设备与点位</th>
                        <th>下发状态</th>
                        <th>接收回执</th>
                        <th>设备回读</th>
                        <th>显示确认</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${filtered.length === 0 ? `<tr><td colspan="6" style="text-align:center;color:#8ab4dc;padding:24px;">暂无匹配的设备反馈记录</td></tr>` : filtered.map(r => {
                        const b = getBoard(r.boardId);
                        return `
                          <tr class="${selRec && r.boardId === selRec.boardId ? 'm13-row-selected' : ''}" data-action="rec-select-board" data-board-id="${esc(r.boardId)}">
                            <td>
                              <div class="m13-cell-main">${esc(b.id)}</div>
                              <div class="m13-cell-sub">${esc(b.stake)} · ${esc(b.pointName)}</div>
                            </td>
                            <td style="text-align:center;">
                              <div><span class="m13-tag ${statusTagClass(r.dispatchStatus)}">${esc(r.dispatchStatus)}</span></div>
                              <div class="m13-cell-sub">${esc(r.dispatchTime)}</div>
                            </td>
                            <td style="text-align:center;">
                              <div><span class="m13-tag ${statusTagClass(r.receiveStatus)}">${esc(r.receiveStatus)}</span></div>
                              <div class="m13-cell-sub">${esc(r.receiveTime)}</div>
                            </td>
                            <td style="text-align:center;">
                              <div><span class="m13-tag ${statusTagClass(r.readbackStatus)}">${esc(r.readbackStatus)}</span></div>
                              <div class="m13-cell-sub">${esc(r.readbackTime)}</div>
                            </td>
                            <td style="text-align:center;">
                              <div><span class="m13-tag ${statusTagClass(r.confirmStatus)}">${esc(r.confirmStatus)}</span></div>
                              <div class="m13-cell-sub">${esc(r.confirmTime)}</div>
                            </td>
                            <td><button class="m13-act-link" data-action="rec-select-board" data-board-id="${esc(r.boardId)}">查看</button></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                </div>
                <div class="m13-note-box" style="margin-top:auto;">
                  ${SVG.info}
                  <span>显示确认时间取自现场核验记录。</span>
                </div>
              </div>
            </section>

            <section class="m13-panel">
              <div class="m13-panel-head">
                <div class="m13-panel-head-left">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">发布过程留痕</span>
                </div>
                <button class="m13-text-link" data-action="rec-open-audit-log" data-order-id="${esc(order.id)}">查看审核与授权记录 &gt;</button>
              </div>
              <div class="m13-panel-body">
                <div class="m13-trace-grid">
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">发布编号</div>
                    <div class="m13-trace-v">${esc(order.id)}</div>
                  </div>
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">内容版本</div>
                    <div class="m13-trace-v">${esc(order.templateId)} · ${esc(order.version)}</div>
                  </div>
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">发布操作人</div>
                    <div class="m13-trace-v">${esc(order.operator)}</div>
                  </div>
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">审核人</div>
                    <div class="m13-trace-v">${esc(order.reviewer)}</div>
                  </div>
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">授权人</div>
                    <div class="m13-trace-v">${esc(order.authorizer)}</div>
                  </div>
                  <div class="m13-trace-card">
                    <div class="m13-trace-k">发布时间</div>
                    <div class="m13-trace-v">${esc(order.fullTime)}</div>
                  </div>
                </div>
              </div>
            </section>
          </div>

          <section class="m13-panel">
            <div class="m13-panel-head">
              <div class="m13-panel-head-left">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">设备回读与显示确认</span>
              </div>
            </div>
            <div class="m13-panel-body">
              <div class="m13-detail-top">
                <span class="m13-detail-code">${esc(selBoard.id)}</span>
                <span class="m13-tag ${statusTagClass(selRec ? selRec.confirmStatus : '待确认显示')}">${esc(selRec ? selRec.confirmStatus : '待确认显示')}</span>
              </div>
              <div class="m13-kv-list">
                <div class="m13-kv-row"><span class="m13-kv-k">设备位置</span><span class="m13-kv-v">${esc(secName(selBoard.secId))} · ${esc(selBoard.stake)} · ${esc(selBoard.pointName)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">关联发布单</span><span class="m13-kv-v">${esc(order.id)} · ${esc(order.version)}</span></div>
                <div class="m13-kv-row"><span class="m13-kv-k">核验记录</span><span class="m13-kv-v">${esc(selRec ? selRec.verifyRecord : '—')}</span></div>
              </div>
              <div class="m13-subhead-row">
                <span>设备回读板面</span>
                <span class="m13-tag ${statusTagClass(selRec ? selRec.readbackStatus : '未回读')}">${esc(selRec && selRec.readbackStatus === '内容一致' ? '内容一致' : '回读待返回')}</span>
              </div>
              ${renderLedPreviewSvg(order.line1, order.line2, selBoard.spec, {
                dimmed: !selRec || selRec.readbackStatus !== '内容一致',
                dimmedLabel: selBoard.online ? '等待设备回读校验' : '设备离线暂未回读'
              })}
              <div class="m13-led-caption">
                <span>回读时间 ${esc(selRec ? selRec.readbackTime : '—')}</span>
                <span>${esc(selBoard.spec)}</span>
              </div>
              <div class="m13-step-timeline">
                <div class="m13-step-row">
                  <div class="m13-step-row-left">
                    <span style="color:#38bdf8;display:inline-flex;">${SVG.send}</span>
                    <span class="m13-step-time">${esc(selRec ? selRec.dispatchTime : '—')}</span>
                    <span class="m13-step-text">系统向设备发送</span>
                  </div>
                  <span class="m13-tag ${statusTagClass(selRec ? selRec.dispatchStatus : '待下发')}">${esc(selRec ? selRec.dispatchStatus : '待下发')}</span>
                </div>
                <div class="m13-step-row">
                  <div class="m13-step-row-left">
                    <span style="color:#38bdf8;display:inline-flex;">${SVG.inbox}</span>
                    <span class="m13-step-time">${esc(selRec ? selRec.receiveTime : '—')}</span>
                    <span class="m13-step-text">${selRec && selRec.receiveStatus === '已接收' ? '收到设备接收回执' : '等待设备返回接收回执'}</span>
                  </div>
                  <span class="m13-tag ${statusTagClass(selRec ? selRec.receiveStatus : '未回执')}">${esc(selRec ? selRec.receiveStatus : '未回执')}</span>
                </div>
                <div class="m13-step-row">
                  <div class="m13-step-row-left">
                    <span style="color:#4ade80;display:inline-flex;">${SVG.monitor}</span>
                    <span class="m13-step-time">${esc(selRec ? selRec.readbackTime : '—')}</span>
                    <span class="m13-step-text">${selRec && selRec.readbackStatus === '内容一致' ? '设备回读板面与发布版本一致' : '待采集设备板面回读数据'}</span>
                  </div>
                  <span class="m13-tag ${statusTagClass(selRec ? selRec.readbackStatus : '未回读')}">${esc(selRec ? selRec.readbackStatus : '未回读')}</span>
                </div>
                <div class="m13-step-row">
                  <div class="m13-step-row-left">
                    <span style="color:${selRec && selRec.confirmStatus === '已确认显示' ? '#4ade80' : '#facc15'};display:inline-flex;">${SVG.checkCircle}</span>
                    <span class="m13-step-time">${esc(selRec ? selRec.confirmTime : '—')}</span>
                    <span class="m13-step-text">现场核验</span>
                  </div>
                  <span class="m13-tag ${statusTagClass(selRec ? selRec.confirmStatus : '待确认显示')}">${esc(selRec ? selRec.confirmStatus : '待确认显示')}</span>
                </div>
              </div>
              ${selRec && order.status === '已下发' && selRec.confirmStatus !== '已确认显示' ? `
                <div class="m13-actions-row">
                  ${selRec.readbackStatus !== '内容一致' ? `<button class="m13-btn-ghost" data-action="rec-simulate-readback" data-order-id="${esc(order.id)}" data-board-id="${esc(selBoard.id)}">${SVG.refresh} 采集设备回读</button>` : ''}
                  <button class="m13-btn-green" data-action="rec-confirm-display" data-order-id="${esc(order.id)}" data-board-id="${esc(selBoard.id)}">${SVG.checkCircle} 现场确认显示</button>
                </div>
              ` : ''}
            </div>
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE MODALS
     ------------------------------------------------------------------------ */
  function openAddTemplateModal() {
    if (!lastCtx) return;
    const html = `
      <div class="m13-modal-grid">
        <div class="m13-field">
          <label>模板名称</label>
          <input type="text" class="m13-input" id="m13NewTplName" placeholder="例如：夜间施工警示提示">
        </div>
        <div class="m13-field">
          <label>模板分类</label>
          <select class="m13-select" id="m13NewTplCat">
            <option value="常用文本">常用文本</option>
            <option value="板面模板">板面模板</option>
            <option value="预案内容">预案内容</option>
          </select>
        </div>
        <div class="m13-field">
          <label>适配规格</label>
          <select class="m13-select" id="m13NewTplSpec">
            <option value="单黄LED 128×48">单黄LED 128×48</option>
            <option value="全彩LED 192×64">全彩LED 192×64</option>
          </select>
        </div>
        <div class="m13-field">
          <label>模板状态</label>
          <select class="m13-select" id="m13NewTplStatus">
            <option value="有效">有效</option>
            <option value="待启用">待启用</option>
          </select>
        </div>
        <div class="m13-field">
          <label>第一行文案（上限 8 字）</label>
          <input type="text" class="m13-input" id="m13NewTplL1" maxlength="10" value="前方夜间施工">
        </div>
        <div class="m13-field">
          <label>第二行文案（上限 8 字）</label>
          <input type="text" class="m13-input" id="m13NewTplL2" maxlength="10" value="注意减速慢行">
        </div>
      </div>
      <div id="m13NewTplPreview">${renderLedPreviewSvg('前方夜间施工', '注意减速慢行', '单黄LED 128×48')}</div>
      <div class="m13-modal-footer">
        <button class="m13-btn-ghost" id="m13ModalCancelBtn">取消</button>
        <button class="m13-btn-primary" id="m13ModalSaveTplBtn">${SVG.plus} 确认新增模板</button>
      </div>
    `;
    lastCtx.openModal('新增情报板内容模板', html);

    const refreshPreview = () => {
      const l1 = (document.getElementById('m13NewTplL1') || {}).value || '';
      const l2 = (document.getElementById('m13NewTplL2') || {}).value || '';
      const sp = (document.getElementById('m13NewTplSpec') || {}).value || '单黄LED 128×48';
      const wrap = document.getElementById('m13NewTplPreview');
      if (wrap) wrap.innerHTML = renderLedPreviewSvg(l1, l2, sp);
    };
    ['m13NewTplL1', 'm13NewTplL2', 'm13NewTplSpec'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener(id === 'm13NewTplSpec' ? 'change' : 'input', refreshPreview);
    });
    const cancelBtn = document.getElementById('m13ModalCancelBtn');
    if (cancelBtn) cancelBtn.onclick = () => lastCtx.closeModal();

    const saveBtn = document.getElementById('m13ModalSaveTplBtn');
    if (saveBtn) {
      saveBtn.onclick = () => {
        const name = (document.getElementById('m13NewTplName').value || '').trim() || '自定义安全提示模板';
        const category = document.getElementById('m13NewTplCat').value;
        const spec = document.getElementById('m13NewTplSpec').value;
        const status = document.getElementById('m13NewTplStatus').value;
        const line1 = (document.getElementById('m13NewTplL1').value || '').trim() || '前方施工区域';
        const line2 = (document.getElementById('m13NewTplL2').value || '').trim() || '减速谨慎驾驶';
        const nextNum = String(store.templates.length + 1).padStart(3, '0');
        const newId = `MB-202611-${nextNum}`;
        store.templates.unshift({
          id: newId,
          name,
          category,
          version: 'V1.0',
          spec,
          validText: '长期有效',
          startTime: '2026-11-26 00:00',
          endTime: '2026-12-31 23:59',
          status,
          line1,
          line2
        });
        ui.selectedTplId = newId;
        ui.tplDraft = null;
        ui.tplPage = 1;
        lastCtx.closeModal();
        lastCtx.showToast(`已新增模板 ${newId}（${name}）`);
        rerender();
      };
    }
  }

  function openCreateOrderModal(prefillTplId) {
    if (!lastCtx) return;
    const tpl = prefillTplId ? getTemplate(prefillTplId) : store.templates[0];
    const defaultBoards = store.boards.slice(0, 3).map(b => b.id);
    const html = `
      <div class="m13-modal-grid">
        <div class="m13-field">
          <label>引用内容模板</label>
          <select class="m13-select" id="m13NewOrdTpl">
            ${store.templates.map(t => `<option value="${esc(t.id)}" ${t.id === tpl.id ? 'selected' : ''}>${esc(t.id)} · ${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <div class="m13-field">
          <label>所属工区</label>
          <select class="m13-select" id="m13NewOrdSec">
            ${SECTION_META.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="m13-field">
          <label>发布内容标题</label>
          <input type="text" class="m13-input" id="m13NewOrdTitle" value="${esc(tpl.name)}">
        </div>
        <div class="m13-field">
          <label>发布有效期</label>
          <input type="text" class="m13-input" id="m13NewOrdRange" value="11-26 14:00–20:00">
        </div>
        <div class="m13-field">
          <label>第一行板面文案</label>
          <input type="text" class="m13-input" id="m13NewOrdL1" maxlength="10" value="${esc(tpl.line1)}">
        </div>
        <div class="m13-field">
          <label>第二行板面文案</label>
          <input type="text" class="m13-input" id="m13NewOrdL2" maxlength="10" value="${esc(tpl.line2)}">
        </div>
      </div>
      <div id="m13NewOrdPreview">${renderLedPreviewSvg(tpl.line1, tpl.line2, tpl.spec)}</div>
      <div class="m13-field">
        <label>选择目标情报板（至少选择 1 块）</label>
        <div class="m13-modal-checks" id="m13NewOrdBoards">
          ${store.boards.slice(0, 12).map(b => `
            <label class="m13-modal-chk">
              <input type="checkbox" value="${esc(b.id)}" ${defaultBoards.includes(b.id) ? 'checked' : ''}>
              <span>${esc(b.id)}（${esc(secName(b.secId))} · ${esc(b.pointName)}）</span>
            </label>
          `).join('')}
        </div>
      </div>
      <div class="m13-modal-footer">
        <button class="m13-btn-ghost" id="m13ModalCancelBtn">取消</button>
        <button class="m13-btn-primary" id="m13ModalCreateOrdBtn">${SVG.plus} 提交审核发布单</button>
      </div>
    `;
    lastCtx.openModal('新建信息发布单', html);

    const refreshPreview = () => {
      const l1 = (document.getElementById('m13NewOrdL1') || {}).value || '';
      const l2 = (document.getElementById('m13NewOrdL2') || {}).value || '';
      const tId = (document.getElementById('m13NewOrdTpl') || {}).value;
      const tObj = getTemplate(tId);
      const wrap = document.getElementById('m13NewOrdPreview');
      if (wrap) wrap.innerHTML = renderLedPreviewSvg(l1, l2, tObj.spec);
    };
    const tplSel = document.getElementById('m13NewOrdTpl');
    if (tplSel) {
      tplSel.addEventListener('change', () => {
        const chosen = getTemplate(tplSel.value);
        document.getElementById('m13NewOrdTitle').value = chosen.name;
        document.getElementById('m13NewOrdL1').value = chosen.line1;
        document.getElementById('m13NewOrdL2').value = chosen.line2;
        refreshPreview();
      });
    }
    ['m13NewOrdL1', 'm13NewOrdL2'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.addEventListener('input', refreshPreview);
    });
    const cancelBtn = document.getElementById('m13ModalCancelBtn');
    if (cancelBtn) cancelBtn.onclick = () => lastCtx.closeModal();

    const submitBtn = document.getElementById('m13ModalCreateOrdBtn');
    if (submitBtn) {
      submitBtn.onclick = () => {
        const checked = Array.from(document.querySelectorAll('#m13NewOrdBoards input[type="checkbox"]:checked')).map(el => el.value);
        if (checked.length === 0) {
          lastCtx.showToast('请至少选择 1 块目标情报板');
          return;
        }
        const tplObj = getTemplate(document.getElementById('m13NewOrdTpl').value);
        const secId = document.getElementById('m13NewOrdSec').value;
        const title = (document.getElementById('m13NewOrdTitle').value || '').trim() || tplObj.name;
        const validRange = (document.getElementById('m13NewOrdRange').value || '').trim() || '11-26 14:00–20:00';
        const line1 = (document.getElementById('m13NewOrdL1').value || '').trim() || tplObj.line1;
        const line2 = (document.getElementById('m13NewOrdL2').value || '').trim() || tplObj.line2;
        const nextIdx = String(store.orders.length + 7).padStart(3, '0');
        const newId = `FB-20261126-${nextIdx}`;
        const firstB = getBoard(checked[0]);

        store.orders.unshift({
          id: newId,
          title,
          version: tplObj.version,
          secId,
          groupLabel: firstB.groupDetail,
          templateId: tplObj.id,
          spec: tplObj.spec,
          line1,
          line2,
          validRange,
          scheduleTime: '待安排',
          fullTime: '待审核确认',
          date: '2026-11-26',
          period: '2026年11月',
          status: '待审核',
          operator: '发布员A（演示）',
          reviewer: '待审核',
          authorizer: '待授权',
          authorized: false,
          prevBoardSummary: `${firstB.confirmedTitle} · V1.0`,
          boardIds: checked,
          stepTimes: { compose: getNowHm(), review: '待审核', auth: '待授权', dispatch: '待下发' }
        });
        ui.selectedOrderId = newId;
        ui.revStatus = 'all';
        ui.revPage = 1;
        lastCtx.closeModal();
        lastCtx.showToast(`已新建发布单 ${newId}，等待内容审核`);
        rerender();
      };
    }
  }

  function openAuditOrderModal(orderId) {
    if (!lastCtx) return;
    const o = getOrder(orderId);
    const html = `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>发布单编号</span><strong>${esc(o.id)}</strong></div>
        <div class="detail-stat-card"><span>内容模板</span><strong>${esc(o.templateId)} · ${esc(o.version)}</strong></div>
        <div class="detail-stat-card"><span>目标情报板</span><strong>${o.boardIds.length} 块</strong></div>
      </div>
      ${renderLedPreviewSvg(o.line1, o.line2, o.spec)}
      <div class="m13-modal-grid">
        <div class="m13-field">
          <label>审核人</label>
          <input type="text" class="m13-input" id="m13AuditReviewer" value="审核员B（演示）">
        </div>
        <div class="m13-field">
          <label>计划下发时间</label>
          <input type="text" class="m13-input" id="m13AuditSchedule" value="${o.scheduleTime === '待安排' ? '11-26 11:45' : esc(o.scheduleTime)}">
        </div>
      </div>
      <div class="m13-field">
        <label>审核意见</label>
        <textarea class="m13-textarea" rows="2" id="m13AuditComment">文案内容符合高速公路施工保通信息发布规范，同意进入授权环节。</textarea>
      </div>
      <div class="m13-modal-footer">
        <button class="m13-btn-gold" id="m13AuditRejectBtn">退回撤销</button>
        <button class="m13-btn-primary" id="m13AuditPassBtn">${SVG.shieldCheck} 审核通过（流转至待授权）</button>
      </div>
    `;
    lastCtx.openModal(`内容审核 — ${o.id}`, html);

    document.getElementById('m13AuditPassBtn').onclick = () => {
      o.reviewer = (document.getElementById('m13AuditReviewer').value || '').trim() || '审核员B（演示）';
      o.scheduleTime = (document.getElementById('m13AuditSchedule').value || '').trim() || '11-26 11:45';
      o.status = '待授权';
      o.stepTimes.review = getNowHm();
      lastCtx.closeModal();
      lastCtx.showToast(`发布单 ${o.id} 内容审核通过，已流转至待授权`);
      rerender();
    };
    document.getElementById('m13AuditRejectBtn').onclick = () => {
      o.reviewer = (document.getElementById('m13AuditReviewer').value || '').trim() || '审核员B（演示）';
      o.status = '已撤销';
      o.stepTimes.review = getNowHm();
      lastCtx.closeModal();
      lastCtx.showToast(`发布单 ${o.id} 已退回并标记为已撤销`);
      rerender();
    };
  }

  function openAuthorizeOrderModal(orderId) {
    if (!lastCtx) return;
    const o = getOrder(orderId);
    const html = `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>发布单编号</span><strong>${esc(o.id)}</strong></div>
        <div class="detail-stat-card"><span>审核人</span><strong>${esc(o.reviewer)}</strong></div>
        <div class="detail-stat-card"><span>下发对象</span><strong>${o.boardIds.length} 块情报板</strong></div>
      </div>
      ${renderLedPreviewSvg(o.line1, o.line2, o.spec)}
      <div class="m13-recessed-box">
        <div class="m13-recessed-title">即将下发的目标情报板</div>
        <div style="font-size:12.5px;color:#e2f0ff;">${o.boardIds.map(id => {
          const b = getBoard(id);
          return `${esc(b.id)}（${esc(b.stake)} · ${b.online ? '在线' : '离线'}）`;
        }).join('、')}</div>
      </div>
      <div class="m13-modal-grid">
        <div class="m13-field">
          <label>授权人</label>
          <input type="text" class="m13-input" id="m13AuthPerson" value="授权员C（演示）">
        </div>
        <div class="m13-field">
          <label>授权核验方式</label>
          <input type="text" class="m13-input" value="数字签名已核验（二级授权）" readonly>
        </div>
      </div>
      <div class="m13-modal-footer">
        <button class="m13-btn-ghost" id="m13ModalCancelBtn">取消</button>
        <button class="m13-btn-primary" id="m13AuthConfirmBtn">${SVG.send} 确认授权并下发情报板</button>
      </div>
    `;
    lastCtx.openModal(`授权确认与下发 — ${o.id}`, html);

    document.getElementById('m13ModalCancelBtn').onclick = () => lastCtx.closeModal();
    document.getElementById('m13AuthConfirmBtn').onclick = () => {
      const hm = getNowHm();
      const hms = getNowHms();
      o.authorizer = (document.getElementById('m13AuthPerson').value || '').trim() || '授权员C（演示）';
      o.authorized = true;
      o.status = '已下发';
      o.scheduleTime = `11-26 ${hm}`;
      o.fullTime = `2026-11-26 ${hms}`;
      o.stepTimes.auth = hm;
      o.stepTimes.dispatch = hm;

      // Update boards and generate receipts
      const recs = o.boardIds.map(bid => {
        const b = getBoard(bid);
        b.prevTitle = `${b.confirmedTitle} · ${o.version}`;
        b.prevLine1 = b.line1;
        b.prevLine2 = b.line2;
        b.lastOrderId = o.id;
        b.lastTime = `11-26 ${hm}`;
        b.feedbackStatus = '待确认显示';
        return {
          boardId: bid,
          dispatchStatus: '已下发',
          dispatchTime: hms,
          receiveStatus: b.online ? '已接收' : '未回执',
          receiveTime: b.online ? hms : '—',
          readbackStatus: '未回读',
          readbackTime: '—',
          confirmStatus: '待确认显示',
          confirmTime: '—',
          verifyRecord: b.online ? '待设备回读与现场核验' : '设备离线，等待重连回执'
        };
      });
      store.receipts[o.id] = recs;
      store.lastUpdated = `11-26 ${hm}`;

      // Update linked plan if any
      store.plans.forEach(p => {
        if (p.linkedOrderId === o.id) {
          p.linkedOrderNote = `${hm} 已授权下发`;
          p.flowStage = 4;
        }
      });

      lastCtx.closeModal();
      lastCtx.showToast(`发布单 ${o.id} 已授权并下发至 ${o.boardIds.length} 块情报板`);
      rerender();
    };
  }

  function openRevokeOrderModal(orderId) {
    if (!lastCtx) return;
    const o = getOrder(orderId);
    const html = `
      <div class="m13-recessed-box">
        <div class="m13-recessed-title">撤销确认</div>
        <div class="m13-recessed-lines">确定撤销发布单 <strong>${esc(o.id)}</strong>（${esc(o.title)}）？<br>撤销后将停止跟踪回执，并标记为「已撤销」。</div>
      </div>
      <div class="m13-field">
        <label>授权复核人</label>
        <input type="text" class="m13-input" id="m13RevokeAuth" value="授权员C（演示）">
      </div>
      <div class="m13-modal-footer">
        <button class="m13-btn-ghost" id="m13ModalCancelBtn">取消</button>
        <button class="m13-btn-gold" id="m13RevokeConfirmBtn">${SVG.undo} 确认授权撤销</button>
      </div>
    `;
    lastCtx.openModal(`撤销发布单 — ${o.id}`, html);

    document.getElementById('m13ModalCancelBtn').onclick = () => lastCtx.closeModal();
    document.getElementById('m13RevokeConfirmBtn').onclick = () => {
      o.status = '已撤销';
      o.authorizer = (document.getElementById('m13RevokeAuth').value || '').trim() || o.authorizer;
      store.lastUpdated = `11-26 ${getNowHm()}`;
      lastCtx.closeModal();
      lastCtx.showToast(`发布单 ${o.id} 已授权撤销`);
      rerender();
    };
  }

  function openConfigPlanModal(planId) {
    if (!lastCtx) return;
    const p = store.plans.find(x => x.id === planId) || store.plans[0];
    const html = `
      <div class="m13-modal-grid">
        <div class="m13-field">
          <label>预案名称</label>
          <input type="text" class="m13-input" id="m13CfgPlanName" value="${esc(p.name)}">
        </div>
        <div class="m13-field">
          <label>关联场景</label>
          <select class="m13-select" id="m13CfgPlanScene">
            <option value="施工导改" ${p.scene === '施工导改' ? 'selected' : ''}>施工导改</option>
            <option value="天气预警" ${p.scene === '天气预警' ? 'selected' : ''}>天气预警</option>
            <option value="智慧提速" ${p.scene === '智慧提速' ? 'selected' : ''}>智慧提速</option>
          </select>
        </div>
        <div class="m13-field">
          <label>预案审批状态</label>
          <select class="m13-select" id="m13CfgPlanApproval">
            <option value="已批准" ${p.approvalStatus === '已批准' ? 'selected' : ''}>已批准</option>
            <option value="待批准" ${p.approvalStatus === '待批准' ? 'selected' : ''}>待批准</option>
          </select>
        </div>
        <div class="m13-field">
          <label>联动接口状态</label>
          <select class="m13-select" id="m13CfgPlanIface">
            <option value="接口就绪" ${p.interfaceStatus === '接口就绪' ? 'selected' : ''}>接口就绪</option>
            <option value="待接入" ${p.interfaceStatus === '待接入' ? 'selected' : ''}>待接入</option>
            <option value="待核验" ${p.interfaceStatus === '待核验' ? 'selected' : ''}>待核验</option>
          </select>
        </div>
        <div class="m13-field">
          <label>关联内容模板</label>
          <select class="m13-select" id="m13CfgPlanTpl">
            ${store.templates.map(t => `<option value="${esc(t.id)}" ${t.id === p.templateId ? 'selected' : ''}>${esc(t.id)} · ${esc(t.name)}</option>`).join('')}
          </select>
        </div>
        <div class="m13-field">
          <label>联动有效期</label>
          <input type="text" class="m13-input" id="m13CfgPlanValid" value="${esc(p.validRange)}">
        </div>
      </div>
      <div class="m13-modal-footer">
        <button class="m13-btn-ghost" id="m13ModalCancelBtn">取消</button>
        <button class="m13-btn-primary" id="m13CfgPlanSaveBtn">保存预案配置</button>
      </div>
    `;
    lastCtx.openModal(`配置联动预案 — ${p.id}`, html);

    document.getElementById('m13ModalCancelBtn').onclick = () => lastCtx.closeModal();
    document.getElementById('m13CfgPlanSaveBtn').onclick = () => {
      const tpl = getTemplate(document.getElementById('m13CfgPlanTpl').value);
      p.name = (document.getElementById('m13CfgPlanName').value || '').trim() || p.name;
      p.scene = document.getElementById('m13CfgPlanScene').value;
      p.approvalStatus = document.getElementById('m13CfgPlanApproval').value;
      p.interfaceStatus = document.getElementById('m13CfgPlanIface').value;
      p.validRange = (document.getElementById('m13CfgPlanValid').value || '').trim() || p.validRange;
      p.templateId = tpl.id;
      p.templateVersion = tpl.version;
      p.line1 = tpl.line1;
      p.line2 = tpl.line2;
      p.conditionMet = (p.approvalStatus === '已批准' && p.interfaceStatus === '接口就绪');
      if (p.conditionMet && p.flowStage < 3) p.flowStage = 3;
      lastCtx.closeModal();
      lastCtx.showToast(`已更新联动预案 ${p.id} 配置`);
      rerender();
    };
  }

  function openPlanTriggersModal(planId) {
    if (!lastCtx) return;
    const p = store.plans.find(x => x.id === planId) || store.plans[0];
    const html = `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>预案编号</span><strong>${esc(p.id)}</strong></div>
        <div class="detail-stat-card"><span>预案审批</span><strong>${esc(p.approvalStatus)}</strong></div>
        <div class="detail-stat-card"><span>接口状态</span><strong>${esc(p.interfaceStatus)}</strong></div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>记录时间</th><th>联动触发核对事件</th><th>状态结果</th></tr>
        </thead>
        <tbody>
          ${p.triggerLogs.map(log => `
            <tr>
              <td>${esc(log.time)}</td>
              <td>${esc(log.event)}</td>
              <td><span class="status-tag ${log.result === '匹配成功' || log.result === '已下发' ? 'ok' : (log.result === '已建单' || log.result === '已接收' ? 'info' : 'warn')}">${esc(log.result)}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="m13-modal-footer">
        ${!p.conditionMet ? `<button class="m13-btn-green" id="m13PlanCompleteCondBtn">${SVG.checkCircle} 完成审批与接口核验</button>` : ''}
        <button class="m13-btn-primary" id="m13ModalCloseBtn">关闭</button>
      </div>
    `;
    lastCtx.openModal(`触发核对记录 — ${p.id} ${p.name}`, html);

    document.getElementById('m13ModalCloseBtn').onclick = () => lastCtx.closeModal();
    const completeBtn = document.getElementById('m13PlanCompleteCondBtn');
    if (completeBtn) {
      completeBtn.onclick = () => {
        p.approvalStatus = '已批准';
        p.interfaceStatus = '接口就绪';
        p.conditionMet = true;
        p.flowStage = 3;
        p.triggerLogs.push({
          time: `2026-11-26 ${getNowHms()}`,
          event: '人工完成预案审批与联动接口连通性核验，条件已满足',
          result: '匹配成功'
        });
        lastCtx.closeModal();
        lastCtx.showToast(`联动预案 ${p.id} 已满足全部联动条件`);
        rerender();
      };
    }
  }

  function openAuditTrailModal(orderId) {
    if (!lastCtx) return;
    const o = getOrder(orderId);
    const recs = getOrderReceipts(o.id);
    const html = `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>发布单号</span><strong>${esc(o.id)}</strong></div>
        <div class="detail-stat-card"><span>模板版本</span><strong>${esc(o.templateId)} · ${esc(o.version)}</strong></div>
        <div class="detail-stat-card"><span>发布状态</span><strong>${esc(o.status)}</strong></div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>环节</th><th>经办人 / 责任角色</th><th>时间</th><th>核验结论</th></tr>
        </thead>
        <tbody>
          <tr><td>内容编排</td><td>${esc(o.operator)}</td><td>${esc(o.date)} ${esc(o.stepTimes.compose)}</td><td><span class="status-tag ok">已提交</span></td></tr>
          <tr><td>内容审核</td><td>${esc(o.reviewer)}</td><td>${o.stepTimes.review === '待审核' ? '—' : `${esc(o.date)} ${esc(o.stepTimes.review)}`}</td><td><span class="status-tag ${o.stepTimes.review === '待审核' ? 'warn' : 'ok'}">${o.stepTimes.review === '待审核' ? '待审核' : '审核通过'}</span></td></tr>
          <tr><td>授权确认</td><td>${esc(o.authorizer)}</td><td>${o.stepTimes.auth === '待授权' ? '—' : `${esc(o.date)} ${esc(o.stepTimes.auth)}`}</td><td><span class="status-tag ${o.authorized ? 'ok' : 'warn'}">${o.authorized ? '授权已核验' : '待授权'}</span></td></tr>
          <tr><td>系统下发</td><td>信息发布网关</td><td>${esc(o.fullTime)}</td><td><span class="status-tag info">${esc(o.status)}</span></td></tr>
          <tr><td>现场核验</td><td>巡查员D（演示）</td><td>${recs.filter(r => r.confirmStatus === '已确认显示').length} / ${recs.length} 块已确认</td><td><span class="status-tag ${recs.every(r => r.confirmStatus === '已确认显示') ? 'ok' : 'warn'}">${recs.every(r => r.confirmStatus === '已确认显示') ? '全部确认' : '跟踪中'}</span></td></tr>
        </tbody>
      </table>
      <div class="m13-modal-footer">
        <button class="m13-btn-primary" id="m13ModalCloseBtn">关闭</button>
      </div>
    `;
    lastCtx.openModal(`审核与授权留痕记录 — ${o.id}`, html);
    document.getElementById('m13ModalCloseBtn').onclick = () => lastCtx.closeModal();
  }

  /* ------------------------------------------------------------------------
     EVENT BINDING
     ------------------------------------------------------------------------ */
  function syncFilterInputs(subPage) {
    if (subPage === 'overview') {
      const s = document.getElementById('m13OvSec');
      const g = document.getElementById('m13OvGroup');
      const o = document.getElementById('m13OvOnline');
      const k = document.getElementById('m13OvKw');
      if (s) ui.ovSec = s.value;
      if (g) ui.ovGroup = g.value;
      if (o) ui.ovOnline = o.value;
      if (k) ui.ovKw = k.value;
    } else if (subPage === 'templates') {
      const c = document.getElementById('m13TplCatFilter');
      const s = document.getElementById('m13TplSpecFilter');
      const st = document.getElementById('m13TplStatusFilter');
      const k = document.getElementById('m13TplKw');
      if (c) ui.tplCat = c.value;
      if (s) ui.tplSpec = s.value;
      if (st) ui.tplStatus = st.value;
      if (k) ui.tplKw = k.value;
    } else if (subPage === 'review') {
      const s = document.getElementById('m13RevSec');
      const st = document.getElementById('m13RevStatus');
      const p = document.getElementById('m13RevPeriod');
      const k = document.getElementById('m13RevKw');
      if (s) ui.revSec = s.value;
      if (st) ui.revStatus = st.value;
      if (p) ui.revPeriod = p.value;
      if (k) ui.revKw = k.value;
    } else if (subPage === 'plans') {
      const sc = document.getElementById('m13PlanScene');
      const ap = document.getElementById('m13PlanApproval');
      const inf = document.getElementById('m13PlanInterface');
      const sec = document.getElementById('m13PlanSec');
      if (sc) ui.planScene = sc.value;
      if (ap) ui.planApproval = ap.value;
      if (inf) ui.planInterface = inf.value;
      if (sec) ui.planSec = sec.value;
    } else if (subPage === 'receipts') {
      const o = document.getElementById('m13RecOrder');
      const g = document.getElementById('m13RecGroup');
      const d = document.getElementById('m13RecDate');
      const k = document.getElementById('m13RecKw');
      if (o) ui.recOrderId = o.value;
      if (g) ui.recGroup = g.value;
      if (d) ui.recDate = d.value;
      if (k) ui.recKw = k.value;
    }
  }

  function updateTplLivePreviewInPlace() {
    if (!ui.tplDraft) return;
    const wrap = document.getElementById('m13TplLivePreviewWrap');
    if (wrap) {
      wrap.innerHTML = renderLedPreviewSvg(ui.tplDraft.line1, ui.tplDraft.line2, ui.tplDraft.spec);
    }
    const specLbl = document.getElementById('m13TplSpecLabel');
    if (specLbl) specLbl.textContent = ui.tplDraft.spec;
    const catBadge = document.getElementById('m13TplCatBadge');
    if (catBadge) catBadge.textContent = ui.tplDraft.category;
    const charHint = document.getElementById('m13TplCharHint');
    if (charHint) {
      const cap = String(ui.tplDraft.spec).includes('192') ? 10 : 8;
      charHint.textContent = `双行显示 每行上限 ${cap} 字`;
    }
  }

  function bindEvents(hostEl, subPage, ctx) {
    // Live editor bindings on templates page (no full rerender to preserve input focus)
    if (subPage === 'templates' && ui.tplDraft) {
      const l1 = document.getElementById('m13TplLine1');
      const l2 = document.getElementById('m13TplLine2');
      const cat = document.getElementById('m13TplEditCat');
      const spec = document.getElementById('m13TplEditSpec');
      const st = document.getElementById('m13TplStart');
      const ed = document.getElementById('m13TplEnd');
      if (l1) l1.addEventListener('input', () => { ui.tplDraft.line1 = l1.value; updateTplLivePreviewInPlace(); });
      if (l2) l2.addEventListener('input', () => { ui.tplDraft.line2 = l2.value; updateTplLivePreviewInPlace(); });
      if (cat) cat.addEventListener('change', () => { ui.tplDraft.category = cat.value; updateTplLivePreviewInPlace(); });
      if (spec) spec.addEventListener('change', () => { ui.tplDraft.spec = spec.value; updateTplLivePreviewInPlace(); });
      if (st) st.addEventListener('input', () => { ui.tplDraft.startTime = st.value; });
      if (ed) ed.addEventListener('input', () => { ui.tplDraft.endTime = ed.value; });
    }

    // Immediate order selector change on receipts page
    if (subPage === 'receipts') {
      const ordSel = document.getElementById('m13RecOrder');
      if (ordSel) {
        ordSel.addEventListener('change', () => {
          ui.recOrderId = ordSel.value;
          const chosenOrd = getOrder(ui.recOrderId);
          ui.recDate = chosenOrd ? chosenOrd.date : 'all';
          ui.recGroup = 'all';
          const recs = getOrderReceipts(ui.recOrderId);
          ui.selectedRecBoardId = recs.length ? recs[0].boardId : '';
          rerender();
        });
      }
    }

    // Enter-to-query on keyword search inputs
    const kwHandlers = [
      ['m13OvKw', () => { syncFilterInputs('overview'); ui.ovPage = 1; rerender(); }],
      ['m13TplKw', () => { syncFilterInputs('templates'); ui.tplPage = 1; rerender(); }],
      ['m13RevKw', () => { syncFilterInputs('review'); ui.revPage = 1; rerender(); }],
      ['m13RecKw', () => { syncFilterInputs('receipts'); rerender(); }]
    ];
    kwHandlers.forEach(([id, fn]) => {
      const el = document.getElementById(id);
      if (el) {
        el.addEventListener('keydown', (ev) => {
          if (ev.key === 'Enter') { ev.preventDefault(); fn(); }
        });
      }
    });

    hostEl.onclick = (e) => {
      const pgBtn = e.target.closest('[data-page-target]');
      if (pgBtn && !pgBtn.disabled) {
        const key = pgBtn.dataset.pageTarget;
        const p = parseInt(pgBtn.dataset.page, 10);
        if (!Number.isNaN(p) && p >= 1) {
          ui[key] = p;
          rerender();
        }
        return;
      }

      const actEl = e.target.closest('[data-action]');
      if (!actEl) return;
      const act = actEl.dataset.action;

      if (act === 'ov-query') {
        syncFilterInputs('overview');
        ui.ovFeedback = 'all';
        ui.ovPage = 1;
        rerender();
      } else if (act === 'ov-reset') {
        ui.ovSec = 'all'; ui.ovGroup = 'all'; ui.ovOnline = 'all'; ui.ovFeedback = 'all'; ui.ovKw = ''; ui.ovPage = 1;
        rerender();
      } else if (act === 'ov-kpi') {
        const kpi = actEl.dataset.kpi;
        ui.ovSec = 'all'; ui.ovGroup = 'all'; ui.ovKw = ''; ui.ovPage = 1;
        if (kpi === 'online') { ui.ovOnline = 'online'; ui.ovFeedback = 'all'; }
        else if (kpi === 'offline') { ui.ovOnline = 'offline'; ui.ovFeedback = 'all'; }
        else if (kpi === 'pending') { ui.ovOnline = 'all'; ui.ovFeedback = 'pending'; }
        else { ui.ovOnline = 'all'; ui.ovFeedback = 'all'; }
        rerender();
      } else if (act === 'goto-review') {
        ctx.switchModule('publish', 'review');
      } else if (act === 'ov-select-board') {
        ui.selectedBoardId = actEl.dataset.boardId;
        rerender();
      } else if (act === 'ov-goto-order') {
        ui.selectedOrderId = actEl.dataset.orderId;
        ui.revSec = 'all'; ui.revStatus = 'all'; ui.revKw = '';
        const idx = store.orders.findIndex(o => o.id === ui.selectedOrderId);
        ui.revPage = idx >= 0 ? Math.floor(idx / 5) + 1 : 1;
        ctx.switchModule('publish', 'review');
      } else if (act === 'ov-goto-receipt' || act === 'ov-goto-rec-board') {
        ui.recOrderId = actEl.dataset.orderId;
        ui.selectedRecBoardId = actEl.dataset.boardId;
        ui.recGroup = 'all';
        ui.recDate = 'all';
        ctx.switchModule('publish', 'receipts');
      } else if (act === 'tpl-query') {
        syncFilterInputs('templates');
        ui.tplPage = 1;
        rerender();
      } else if (act === 'tpl-reset') {
        ui.tplCat = 'all'; ui.tplSpec = 'all'; ui.tplStatus = 'all'; ui.tplKw = ''; ui.tplPage = 1;
        rerender();
      } else if (act === 'tpl-kpi') {
        ui.tplCat = actEl.dataset.cat || 'all';
        ui.tplPage = 1;
        rerender();
      } else if (act === 'tpl-select') {
        ui.selectedTplId = actEl.dataset.tplId;
        ui.tplDraft = null;
        rerender();
      } else if (act === 'open-add-tpl') {
        openAddTemplateModal();
      } else if (act === 'tpl-save') {
        const t = getTemplate(ui.selectedTplId);
        if (t && ui.tplDraft) {
          t.category = ui.tplDraft.category;
          t.spec = ui.tplDraft.spec;
          t.line1 = ui.tplDraft.line1.trim() || t.line1;
          t.line2 = ui.tplDraft.line2.trim() || t.line2;
          t.startTime = ui.tplDraft.startTime.trim() || t.startTime;
          t.endTime = ui.tplDraft.endTime.trim() || t.endTime;
          const m = String(t.version).match(/^V(\d+)\.(\d+)$/);
          if (m) t.version = `V${m[1]}.${parseInt(m[2], 10) + 1}`;
          ui.tplDraft = null;
          ctx.showToast(`已保存模板 ${t.id}（${t.version}）`);
          rerender();
        }
      } else if (act === 'tpl-use-order') {
        const t = getTemplate(ui.selectedTplId);
        if (t && ui.tplDraft) {
          t.category = ui.tplDraft.category;
          t.spec = ui.tplDraft.spec;
          t.line1 = ui.tplDraft.line1.trim() || t.line1;
          t.line2 = ui.tplDraft.line2.trim() || t.line2;
        }
        ctx.switchModule('publish', 'review');
        setTimeout(() => openCreateOrderModal(t.id), 30);
      } else if (act === 'rev-query') {
        syncFilterInputs('review');
        ui.revPage = 1;
        rerender();
      } else if (act === 'rev-reset') {
        ui.revSec = 'all'; ui.revStatus = 'all'; ui.revPeriod = '2026年11月'; ui.revKw = ''; ui.revPage = 1;
        rerender();
      } else if (act === 'rev-kpi') {
        ui.revStatus = actEl.dataset.status || 'all';
        ui.revPage = 1;
        rerender();
      } else if (act === 'rev-select-order') {
        ui.selectedOrderId = actEl.dataset.orderId;
        rerender();
      } else if (act === 'rev-open-create') {
        openCreateOrderModal();
      } else if (act === 'rev-open-audit') {
        ui.selectedOrderId = actEl.dataset.orderId;
        openAuditOrderModal(actEl.dataset.orderId);
      } else if (act === 'rev-open-auth') {
        ui.selectedOrderId = actEl.dataset.orderId;
        openAuthorizeOrderModal(actEl.dataset.orderId);
      } else if (act === 'rev-open-revoke') {
        openRevokeOrderModal(actEl.dataset.orderId);
      } else if (act === 'rev-restore-prev') {
        const o = getOrder(actEl.dataset.orderId);
        o.boardIds.forEach(bid => {
          const b = getBoard(bid);
          b.line1 = b.prevLine1 || b.line1;
          b.line2 = b.prevLine2 || b.line2;
          b.confirmedTitle = (b.prevTitle || '原板面').split(' · ')[0];
          b.feedbackStatus = '已确认显示';
          b.verifyTime = `11-26 ${getNowHms()}`;
        });
        store.lastUpdated = `11-26 ${getNowHm()}`;
        ctx.showToast(`已授权恢复 ${o.id} 涉及 ${o.boardIds.length} 块情报板的原板面内容`);
        rerender();
      } else if (act === 'rev-reopen') {
        const o = getOrder(actEl.dataset.orderId);
        o.status = '待审核';
        o.reviewer = '待审核';
        o.authorizer = '待授权';
        o.authorized = false;
        o.stepTimes.review = '待审核';
        o.stepTimes.auth = '待授权';
        o.stepTimes.dispatch = '待下发';
        ctx.showToast(`发布单 ${o.id} 已重新提交至待审核`);
        rerender();
      } else if (act === 'rev-goto-receipts') {
        const o = getOrder(actEl.dataset.orderId);
        ui.recOrderId = o.id;
        ui.selectedRecBoardId = o.boardIds[0];
        ui.recGroup = 'all';
        ui.recDate = 'all';
        ctx.switchModule('publish', 'receipts');
      } else if (act === 'plan-query') {
        syncFilterInputs('plans');
        ui.planCond = 'all';
        rerender();
      } else if (act === 'plan-reset') {
        ui.planScene = 'all'; ui.planApproval = 'all'; ui.planInterface = 'all'; ui.planSec = 'all'; ui.planCond = 'all';
        rerender();
      } else if (act === 'plan-kpi') {
        const k = actEl.dataset.kpi;
        ui.planScene = 'all'; ui.planSec = 'all'; ui.planInterface = 'all'; ui.planApproval = 'all'; ui.planCond = 'all';
        if (k === 'approved') ui.planApproval = '已批准';
        else if (k === 'met') ui.planCond = 'met';
        else if (k === 'pending') ui.planCond = 'pending';
        rerender();
      } else if (act === 'plan-select') {
        ui.selectedPlanId = actEl.dataset.planId;
        rerender();
      } else if (act === 'plan-open-config') {
        openConfigPlanModal(ui.selectedPlanId);
      } else if (act === 'plan-check-triggers') {
        openPlanTriggersModal(actEl.dataset.planId);
      } else if (act === 'plan-goto-order') {
        const p = store.plans.find(x => x.id === actEl.dataset.planId);
        if (!p) return;
        if (p.linkedOrderId && store.orders.some(o => o.id === p.linkedOrderId)) {
          ui.selectedOrderId = p.linkedOrderId;
          ui.revSec = 'all'; ui.revStatus = 'all'; ui.revKw = '';
          const idx = store.orders.findIndex(o => o.id === ui.selectedOrderId);
          ui.revPage = idx >= 0 ? Math.floor(idx / 5) + 1 : 1;
          ctx.switchModule('publish', 'review');
        } else {
          openCreateOrderModal(p.templateId);
        }
      } else if (act === 'rec-query') {
        syncFilterInputs('receipts');
        rerender();
      } else if (act === 'rec-reset') {
        ui.recGroup = 'all'; ui.recDate = 'all'; ui.recKw = '';
        rerender();
      } else if (act === 'rec-select-board') {
        ui.selectedRecBoardId = actEl.dataset.boardId;
        rerender();
      } else if (act === 'rec-open-audit-log') {
        openAuditTrailModal(actEl.dataset.orderId);
      } else if (act === 'rec-simulate-readback') {
        const recs = getOrderReceipts(actEl.dataset.orderId);
        const r = recs.find(x => x.boardId === actEl.dataset.boardId);
        const b = getBoard(actEl.dataset.boardId);
        if (r && b) {
          const hms = getNowHms();
          b.online = true;
          r.receiveStatus = '已接收';
          if (r.receiveTime === '—') r.receiveTime = hms;
          r.readbackStatus = '内容一致';
          r.readbackTime = hms;
          r.verifyRecord = '设备已回读一致，待现场核验确认';
          ctx.showToast(`已采集 ${b.id} 设备回读：板面内容一致`);
          rerender();
        }
      } else if (act === 'rec-confirm-display') {
        const o = getOrder(actEl.dataset.orderId);
        const recs = getOrderReceipts(o.id);
        const r = recs.find(x => x.boardId === actEl.dataset.boardId);
        const b = getBoard(actEl.dataset.boardId);
        if (r && b) {
          const hms = getNowHms();
          const hm = getNowHm();
          b.online = true;
          r.receiveStatus = '已接收';
          if (r.receiveTime === '—') r.receiveTime = hms;
          r.readbackStatus = '内容一致';
          if (r.readbackTime === '—') r.readbackTime = hms;
          r.confirmStatus = '已确认显示';
          r.confirmTime = hms;
          r.verifyRecord = '现场核验 · 巡查员D（演示）';

          b.confirmedTitle = o.title;
          b.line1 = o.line1;
          b.line2 = o.line2;
          b.lastOrderId = o.id;
          b.lastTime = `11-26 ${hm}`;
          b.verifyTime = `11-26 ${hms}`;
          b.feedbackStatus = '已确认显示';
          store.lastUpdated = `11-26 ${hm}`;

          ctx.showToast(`${b.id} 已完成现场显示确认`);
          rerender();
        }
      }
    };
  }

  /* ------------------------------------------------------------------------
     LIFECYCLE & MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  function rerender() {
    if (!lastHostEl || !lastCtx) return;
    renderPublishModule(lastHostEl, currentSubPage, lastCtx);
  }

  function renderPublishModule(hostEl, subPageId, ctx) {
    injectStyles();
    lastHostEl = hostEl;
    lastCtx = ctx;
    currentSubPage = subPageId || 'overview';

    const secId = (ctx.state && ctx.state.activeSectionId) ? ctx.state.activeSectionId : 'all';
    if (ui.lastSeenGlobalSec !== secId) {
      ui.lastSeenGlobalSec = secId;
      ui.ovSec = secId;
      ui.revSec = secId;
      ui.planSec = secId;
      ui.ovPage = 1;
      ui.revPage = 1;
    }

    let html = '';
    if (currentSubPage === 'overview') html = renderOverviewPage();
    else if (currentSubPage === 'templates') html = renderTemplatesPage();
    else if (currentSubPage === 'review') html = renderReviewPage();
    else if (currentSubPage === 'plans') html = renderPlansPage();
    else if (currentSubPage === 'receipts') html = renderReceiptsPage();
    else html = renderOverviewPage();

    hostEl.innerHTML = html;
    bindEvents(hostEl, currentSubPage, ctx);
  }

  window.JIHEI_PLATFORM.registerModule({
    id: 'publish',
    name: '信息发布',
    subPages: [
      { id: 'overview', name: '情报板总览' },
      { id: 'templates', name: '内容模板' },
      { id: 'review', name: '审核发布' },
      { id: 'plans', name: '联动预案' },
      { id: 'receipts', name: '回执记录' }
    ],
    getCesiumMode() {
      return 'opaque';
    },
    render(hostEl, subPageId, ctx) {
      renderPublishModule(hostEl, subPageId, ctx);
    },
    onSectionChange(secId) {
      const nextSec = secId || 'all';
      ui.lastSeenGlobalSec = nextSec;
      ui.ovSec = nextSec;
      ui.revSec = nextSec;
      ui.planSec = nextSec;
      ui.ovPage = 1;
      ui.revPage = 1;
      rerender();
    },
    onLeave() {
      if (lastHostEl) {
        lastHostEl.innerHTML = '';
      }
      lastHostEl = null;
    }
  });
})();
