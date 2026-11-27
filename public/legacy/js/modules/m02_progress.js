/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 2：进度管理 (01_进度总览 / 02_进度报表 / 03_计划与节点 / 04~05_BIM进度模拟)
   ========================================================================== */

(function () {
  'use strict';

  /* ------------------------------------------------------------------------
     SCOPED STYLESHEET (.m02-* prefix only)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m02-styles')) return;
    const style = document.createElement('style');
    style.id = 'm02-styles';
    style.textContent = `
      .m02-page {
        padding: 14px 18px 24px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-height: 100%;
        color: var(--text-main);
      }

      /* Filter Bar */
      .m02-filter-bar {
        display: flex;
        flex-direction: column;
        gap: 8px;
        padding: 10px 14px;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.86) 0%, rgba(7, 23, 56, 0.84) 100%);
        border: 1px solid var(--border-cyan);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
      }
      .m02-filter-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        flex-wrap: wrap;
      }
      .m02-filter-left {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .m02-filter-right {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m02-filter-label {
        font-size: 12.5px;
        color: var(--text-sub);
        font-weight: 600;
        white-space: nowrap;
      }
      .m02-vdiv {
        width: 1px;
        height: 18px;
        background: rgba(56, 189, 248, 0.3);
        margin: 0 2px;
      }
      .m02-pill-group {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .m02-pill-btn {
        padding: 4px 12px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.34);
        background: rgba(11, 38, 86, 0.65);
        color: #cfe6ff;
        font-size: 12px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m02-pill-btn:hover {
        border-color: var(--cyan);
        color: #ffffff;
        background: rgba(18, 72, 148, 0.65);
      }
      .m02-pill-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.5);
      }
      .m02-input {
        padding: 5px 11px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(8, 28, 66, 0.85);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
        min-width: 190px;
      }
      .m02-input:focus { border-color: var(--cyan-bright); }
      .m02-input::placeholder { color: var(--text-muted); }
      .m02-meta-strip {
        display: flex;
        align-items: center;
        gap: 14px;
        padding-top: 6px;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: var(--text-sub);
        flex-wrap: wrap;
      }
      .m02-meta-strip strong { color: #ffffff; font-weight: 700; }

      /* Overview 6 KPI Cards */
      .m02-kpi-6 {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
      }
      .m02-kpi-card {
        padding: 11px 13px;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(12, 42, 92, 0.78) 0%, rgba(8, 28, 64, 0.82) 100%);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(10px);
        box-shadow: var(--shadow-panel);
        cursor: pointer;
        transition: all 0.2s ease;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m02-kpi-card:hover {
        border-color: var(--cyan-bright);
        transform: translateY(-2px);
      }
      .m02-kpi-card.active {
        border-color: var(--gold);
        box-shadow: 0 0 18px rgba(250, 204, 21, 0.28);
        background: linear-gradient(180deg, rgba(16, 62, 134, 0.88) 0%, rgba(10, 36, 82, 0.9) 100%);
      }
      .m02-kpi-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .m02-kpi-name {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #eaf4ff;
      }
      .m02-kpi-pct {
        font-size: 20px;
        font-weight: 800;
        color: var(--cyan-bright);
        font-variant-numeric: tabular-nums;
        text-shadow: 0 0 10px rgba(56, 242, 255, 0.45);
      }
      .m02-kpi-foot {
        font-size: 11.5px;
        color: var(--text-sub);
      }
      .m02-kpi-foot strong { color: #ffffff; font-weight: 700; }

      /* Middle Split */
      .m02-mid-split {
        display: grid;
        grid-template-columns: 1.18fr 1fr;
        gap: 12px;
      }
      .m02-mini-bar {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        width: 100%;
      }
      .m02-mini-track {
        flex: 1;
        min-width: 34px;
        height: 6px;
        border-radius: 99px;
        background: rgba(14, 48, 98, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.2);
        overflow: hidden;
      }
      .m02-mini-fill {
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, #0ea5e9, #38f2ff);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.55);
      }
      .m02-mini-val {
        font-size: 12px;
        font-weight: 700;
        color: #eaf4ff;
        font-variant-numeric: tabular-nums;
        min-width: 40px;
        text-align: right;
      }

      .m02-table-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .m02-row-clickable {
        cursor: pointer;
        transition: background 0.16s ease;
      }
      .m02-row-clickable:hover {
        background: rgba(24, 82, 164, 0.35);
      }
      .m02-row-selected {
        background: rgba(14, 116, 214, 0.34) !important;
        box-shadow: inset 0 0 0 1px rgba(56, 242, 255, 0.72);
      }
      .m02-row-summary {
        background: rgba(14, 62, 132, 0.48);
        font-weight: 700;
      }
      .m02-action-link {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 4px;
        transition: background 0.16s, color 0.16s;
        white-space: nowrap;
      }
      .m02-action-link:hover {
        background: rgba(56, 242, 255, 0.16);
        color: #ffffff;
      }

      /* Trend Card */
      .m02-trend-kpis {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 8px;
        margin-bottom: 10px;
      }
      .m02-trend-box {
        padding: 9px 11px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.58);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .m02-trend-icon {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        background: rgba(14, 116, 184, 0.32);
        border: 1px solid rgba(56, 220, 255, 0.35);
        color: #38f2ff;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m02-trend-label { font-size: 11px; color: var(--text-sub); }
      .m02-trend-val {
        font-size: 16px;
        font-weight: 800;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
      }
      .m02-trend-val small {
        font-size: 11px;
        font-weight: 500;
        color: var(--text-sub);
        margin-left: 3px;
      }
      .m02-chart-toolbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin-bottom: 6px;
        flex-wrap: wrap;
      }
      .m02-chart-legend {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 11.5px;
        color: var(--text-sub);
      }
      .m02-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m02-svg-chart {
        width: 100%;
        height: auto;
        display: block;
      }

      /* Page 2: Reports */
      .m02-report-grid {
        display: grid;
        grid-template-columns: 1fr 310px;
        gap: 12px;
        align-items: start;
      }
      .m02-report-left {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .m02-panel-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        font-size: 11.5px;
        color: var(--text-sub);
      }
      .m02-kv-list {
        display: flex;
        flex-direction: column;
        gap: 9px;
        margin-bottom: 14px;
      }
      .m02-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 7px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        font-size: 12.5px;
      }
      .m02-kv-k {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: var(--text-sub);
      }
      .m02-kv-v {
        color: #ffffff;
        font-weight: 700;
        text-align: right;
      }

      /* Page 3: Plan & Nodes */
      .m02-plan-kpi-4 {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 10px;
      }
      .m02-plan-kpi-card {
        padding: 10px 16px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(12, 42, 92, 0.78) 0%, rgba(8, 28, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.34);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
        font-size: 13px;
        color: var(--text-sub);
      }
      .m02-plan-kpi-card strong {
        font-size: 20px;
        font-weight: 800;
        color: var(--cyan-bright);
        font-variant-numeric: tabular-nums;
      }
      .m02-plan-grid {
        display: grid;
        grid-template-columns: 230px minmax(0, 1fr) 290px;
        gap: 12px;
        align-items: start;
      }
      .m02-plan-col {
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 0;
      }
      .m02-tree-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .m02-tree-root {
        display: flex;
        align-items: center;
        gap: 7px;
        padding: 6px 9px;
        border-radius: 6px;
        font-size: 13px;
        font-weight: 700;
        color: #ffffff;
        cursor: pointer;
      }
      .m02-tree-root:hover { background: rgba(56, 189, 248, 0.14); }
      .m02-tree-root.active { background: rgba(22, 119, 255, 0.35); border: 1px solid rgba(56, 220, 255, 0.5); }
      .m02-tree-item {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 7px 10px 7px 22px;
        border-radius: 7px;
        border: 1px solid transparent;
        background: transparent;
        color: #cfe4ff;
        font-size: 12.5px;
        cursor: pointer;
        width: 100%;
        text-align: left;
        transition: all 0.16s;
      }
      .m02-tree-item:hover {
        background: rgba(18, 66, 138, 0.45);
        color: #ffffff;
      }
      .m02-tree-item.active {
        background: linear-gradient(90deg, rgba(22, 119, 255, 0.45), rgba(14, 165, 233, 0.25));
        border-color: rgba(56, 220, 255, 0.72);
        color: #ffffff;
        font-weight: 700;
      }
      .m02-note-list {
        display: flex;
        flex-direction: column;
        gap: 10px;
        font-size: 12.5px;
        line-height: 1.6;
        color: #dbeafe;
      }
      .m02-note-list strong { color: #38f2ff; }

      /* Gantt */
      .m02-gantt-wrap {
        position: relative;
        overflow-x: auto;
      }
      .m02-gantt-svg {
        width: 100%;
        min-width: 620px;
        display: block;
      }
      .m02-gantt-legend {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 18px;
        margin-top: 8px;
        font-size: 11.5px;
        color: var(--text-sub);
        flex-wrap: wrap;
      }

      /* Milestone Stepper */
      .m02-ms-stepper {
        position: relative;
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 8px;
        padding: 4px 0 2px;
      }
      .m02-ms-line {
        position: absolute;
        left: 10%;
        right: 10%;
        bottom: 11px;
        height: 2px;
        background: linear-gradient(90deg, #38f2ff 0%, #38f2ff 60%, rgba(148, 197, 255, 0.3) 60%, rgba(148, 197, 255, 0.3) 100%);
      }
      .m02-ms-step {
        position: relative;
        z-index: 2;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
        background: none;
        border: none;
        cursor: pointer;
        padding: 0;
      }
      .m02-ms-box {
        width: 100%;
        padding: 8px 6px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.36);
        text-align: center;
        transition: all 0.18s;
      }
      .m02-ms-step:hover .m02-ms-box,
      .m02-ms-step.active .m02-ms-box {
        border-color: #38f2ff;
        background: rgba(18, 76, 156, 0.85);
        box-shadow: 0 0 14px rgba(56, 242, 255, 0.32);
      }
      .m02-ms-title { font-size: 12.5px; font-weight: 700; color: #ffffff; }
      .m02-ms-date { font-size: 11px; color: var(--text-sub); font-variant-numeric: tabular-nums; margin-top: 2px; }
      .m02-ms-dot {
        width: 16px;
        height: 16px;
        border-radius: 50%;
        border: 2px solid #93c5fd;
        background: #09204a;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 10px;
        color: #ffffff;
      }
      .m02-ms-step.done .m02-ms-dot {
        border-color: #38f2ff;
        background: #0e7490;
      }
      .m02-ms-step.active .m02-ms-dot {
        border-color: #ffffff;
        background: #1677ff;
        box-shadow: 0 0 10px #38f2ff;
      }

      /* BIM Simulation (Interactive Mode over Cesium) */
      .m02-bim-stage {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .m02-bim-banner {
        position: absolute;
        top: 14px;
        left: 50%;
        transform: translateX(-50%);
        z-index: 22;
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 6px 18px;
        border-radius: 99px;
        background: linear-gradient(90deg, rgba(168, 122, 16, 0.88), rgba(202, 138, 4, 0.72) 58%, rgba(10, 34, 78, 0.88) 100%);
        border: 1px solid rgba(250, 204, 21, 0.75);
        box-shadow: 0 6px 24px rgba(0, 8, 28, 0.6);
        cursor: pointer;
      }
      .m02-bim-banner-main {
        font-size: 16px;
        font-weight: 800;
        color: #fef08a;
        letter-spacing: 1px;
        text-shadow: 0 0 10px rgba(250, 204, 21, 0.5);
      }
      .m02-bim-banner-sub {
        font-size: 12px;
        color: #e2f0ff;
        padding-left: 8px;
        border-left: 1px solid rgba(255, 255, 255, 0.28);
      }
      .m02-task-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m02-task-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 9px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        background: rgba(12, 42, 92, 0.52);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m02-task-row:hover {
        border-color: rgba(56, 220, 255, 0.65);
        background: rgba(18, 66, 138, 0.68);
      }
      .m02-task-row.active {
        border-color: #f59e0b;
        background: linear-gradient(90deg, rgba(180, 102, 12, 0.45), rgba(14, 46, 98, 0.72));
        box-shadow: 0 0 12px rgba(245, 158, 11, 0.28);
      }
      .m02-task-name {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 12.5px;
        font-weight: 600;
        color: #ffffff;
      }
      .m02-badge-done {
        padding: 2px 7px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(6, 182, 212, 0.22);
        border: 1px solid rgba(56, 242, 255, 0.55);
        color: #67e8f9;
        white-space: nowrap;
      }
      .m02-badge-doing {
        padding: 2px 7px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(245, 158, 11, 0.25);
        border: 1px solid rgba(251, 191, 36, 0.75);
        color: #fde68a;
        white-space: nowrap;
      }
      .m02-badge-todo {
        padding: 2px 7px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        background: rgba(148, 163, 184, 0.2);
        border: 1px solid rgba(148, 163, 184, 0.45);
        color: #cbd5e1;
        white-space: nowrap;
      }
      .m02-legend-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m02-legend-row {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 12px;
        color: #e2f0ff;
      }
      .m02-swatch {
        width: 24px;
        height: 11px;
        border-radius: 99px;
        flex-shrink: 0;
      }
      .m02-swatch.done { background: linear-gradient(90deg, #1b88ff, #38bdf8); box-shadow: 0 0 8px rgba(56, 189, 248, 0.55); }
      .m02-swatch.doing { background: linear-gradient(90deg, #f59e0b, #fbbf24); box-shadow: 0 0 8px rgba(245, 158, 11, 0.55); }
      .m02-swatch.todo { background: linear-gradient(90deg, #64748b, #94a3b8); }

      .m02-link-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.36);
        font-size: 12px;
        color: #eaf4ff;
        margin-bottom: 10px;
      }

      /* Bottom BIM Playback Dock */
      .m02-bim-dock {
        position: absolute;
        left: 50%;
        bottom: 14px;
        transform: translateX(-50%);
        z-index: 22;
        pointer-events: auto;
        width: min(640px, calc(100% - 580px));
        min-width: 480px;
        padding: 10px 16px 11px;
        border-radius: 12px;
        background: rgba(8, 28, 66, 0.9);
        border: 1px solid var(--border-cyan);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m02-bim-dock-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .m02-bim-ctrl-group {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m02-play-circle {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 1.5px solid #7dd3fc;
        background: linear-gradient(180deg, #2596ff, #0c5fd4);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.55);
      }
      .m02-play-circle:hover { transform: scale(1.06); }
      .m02-icon-circle {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(12, 42, 92, 0.72);
        color: #eaf4ff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .m02-icon-circle:hover { border-color: var(--cyan-bright); color: #fff; }
      .m02-timeline-row {
        display: flex;
        align-items: flex-end;
        gap: 10px;
      }
      .m02-timeline-bound {
        font-size: 11px;
        color: var(--text-sub);
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
        padding-bottom: 16px;
      }
      .m02-slider-wrap {
        position: relative;
        flex: 1;
        padding-top: 22px;
      }
      .m02-timeline-box {
        position: relative;
      }
      .m02-date-bubble {
        position: absolute;
        top: 0;
        transform: translateX(-50%);
        padding: 2px 9px;
        border-radius: 99px;
        background: rgba(8, 32, 74, 0.95);
        border: 1px solid #38f2ff;
        color: #ffffff;
        font-size: 11px;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
        box-shadow: 0 0 10px rgba(56, 242, 255, 0.45);
        white-space: nowrap;
        pointer-events: none;
      }
      .m02-bim-range {
        width: 100%;
        height: 5px;
        accent-color: #38f2ff;
        cursor: pointer;
      }
      .m02-month-ticks {
        display: flex;
        justify-content: space-between;
        padding: 2px 4px 0;
        font-size: 10.5px;
        color: var(--text-sub);
      }

      /* Optional Interactive 3D BIM Isometric Inspector Card */
      .m02-bim-inspector {
        position: absolute;
        left: 50%;
        top: 64px;
        transform: translateX(-50%);
        z-index: 18;
        pointer-events: auto;
        width: min(560px, calc(100% - 580px));
        border-radius: 12px;
        background: rgba(6, 22, 54, 0.86);
        border: 1px solid rgba(56, 220, 255, 0.52);
        backdrop-filter: blur(10px);
        box-shadow: 0 14px 36px rgba(0, 8, 28, 0.65);
        overflow: hidden;
      }
      .m02-bim-insp-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 7px 12px;
        background: rgba(12, 42, 92, 0.72);
        border-bottom: 1px solid rgba(56, 189, 248, 0.25);
        font-size: 12px;
        font-weight: 700;
        color: #eaf4ff;
      }

      /* Floating BIM Scene HUD Badge (when inspector collapsed) */
      .m02-bim-hud-chip {
        position: absolute;
        left: 50%;
        top: 58px;
        transform: translateX(-50%);
        z-index: 19;
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 5px 14px;
        border-radius: 99px;
        background: rgba(8, 28, 66, 0.84);
        border: 1px solid rgba(56, 200, 255, 0.5);
        color: #dbeafe;
        font-size: 12px;
        backdrop-filter: blur(8px);
      }
      .m02-bim-hud-chip strong { color: #fde047; }

      /* Hide redundant top-right work-section pills on 进度总览 (already in page filter bar) */
      body.m02-hide-top-sections #sectionFilters,
      body.m02-hide-top-sections .sub-header > .sub-group-divider {
        display: none;
      }

      /* Compact Polish Overrides: 01_进度总览 */
      .m02-page.m02-ov-page {
        padding: 8px 16px 56px;
        gap: 7px;
      }
      .m02-ov-page .m02-filter-bar {
        padding: 6px 12px;
      }
      .m02-ov-page .m02-kpi-card {
        padding: 6px 11px;
        gap: 4px;
      }
      .m02-ov-page .m02-kpi-pct {
        font-size: 17.5px;
      }
      .m02-ov-page .m02-mid-split {
        gap: 10px;
      }
      .m02-ov-page .panel-header {
        padding: 6px 12px;
      }
      .m02-ov-page .panel-body {
        padding: 6px 11px 7px;
      }
      .m02-ov-page .data-table th,
      .m02-ov-page .data-table td {
        padding: 4.5px 8px;
        font-size: 12px;
        white-space: nowrap;
      }
      .m02-ov-page .m02-trend-kpis {
        gap: 7px;
        margin-bottom: 6px;
      }
      .m02-ov-page .m02-trend-box {
        padding: 6px 9px;
        gap: 7px;
      }
      .m02-ov-page .m02-trend-val {
        font-size: 14.5px;
      }
      .m02-ov-page .m02-chart-toolbar {
        margin-bottom: 4px;
      }
      .m02-ov-pager {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .m02-ov-page-btn {
        padding: 2px 8px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(11, 38, 86, 0.72);
        color: #cfe6ff;
        font-size: 11.5px;
        cursor: pointer;
        transition: all 0.16s;
      }
      .m02-ov-page-btn:hover:not(:disabled) {
        border-color: var(--cyan-bright);
        color: #ffffff;
      }
      .m02-ov-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m02-ov-page-btn:disabled {
        opacity: 0.45;
        cursor: default;
      }

      /* Compact Polish Overrides: 03_计划与节点 */
      .m02-page.m02-plan-page {
        padding: 10px 16px 14px;
        gap: 9px;
      }
      .m02-plan-page .m02-filter-bar {
        padding: 7px 12px;
      }
      .m02-plan-page .m02-plan-kpi-4 {
        gap: 9px;
      }
      .m02-plan-page .m02-plan-kpi-card {
        padding: 7px 14px;
        font-size: 12.5px;
      }
      .m02-plan-page .m02-plan-kpi-card strong {
        font-size: 18px;
      }
      .m02-plan-page .m02-plan-grid {
        grid-template-columns: 216px minmax(0, 1fr) 318px;
        gap: 10px;
      }
      .m02-plan-page .m02-plan-col {
        gap: 9px;
      }
      .m02-plan-page .panel-header {
        padding: 7px 12px;
      }
      .m02-plan-page .panel-body {
        padding: 8px 11px 10px;
      }
      .m02-plan-page .m02-tree-item {
        padding: 5.5px 9px 5.5px 20px;
      }
      .m02-plan-page .m02-gantt-legend {
        margin-top: 5px;
      }
      .m02-plan-page .m02-ms-box {
        padding: 6px 5px;
      }
      .m02-plan-page .m02-node-table th,
      .m02-plan-page .m02-node-table td {
        padding: 5.5px 6px;
        font-size: 12px;
        white-space: nowrap;
      }
      .m02-plan-page .m02-node-table th:nth-child(1),
      .m02-plan-page .m02-node-table td:nth-child(1) {
        width: 34px;
        text-align: center;
      }
      .m02-plan-page .m02-node-table .status-tag {
        white-space: nowrap;
        padding: 2px 6px;
      }
      .m02-plan-page .m02-assoc-table th,
      .m02-plan-page .m02-assoc-table td {
        padding: 5.5px 8px;
        font-size: 12px;
        white-space: nowrap;
      }
      .m02-plan-page .m02-kv-list {
        gap: 6px;
        margin-bottom: 9px;
      }
      .m02-plan-page .m02-kv-row {
        padding-bottom: 5px;
        font-size: 12px;
      }
      .m02-plan-page .btn-primary-glow {
        padding: 7px 12px;
        font-size: 13px;
      }

      /* Responsive */
      @media (max-width: 1320px) {
        .m02-kpi-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m02-mid-split { grid-template-columns: 1fr; }
        .m02-report-grid { grid-template-columns: 1fr; }
        .m02-plan-grid { grid-template-columns: 210px 1fr; }
        .m02-plan-grid > .m02-plan-col:last-child { grid-column: span 2; }
        .m02-bim-dock { width: min(560px, calc(100% - 490px)); min-width: 400px; }
        .m02-bim-inspector { width: min(520px, calc(100% - 490px)); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     MODULE DATA & HELPERS
     ------------------------------------------------------------------------ */
  const SUB_PAGES = [
    { id: 'overview', name: '进度总览' },
    { id: 'report', name: '进度报表' },
    { id: 'plan', name: '计划与节点' },
    { id: 'bim_a', name: 'BIM进度模拟(方案A)' },
    { id: 'bim_b', name: 'BIM进度模拟(方案B)' }
  ];

  const CATEGORIES = [
    { key: 'subgrade', name: '路基工程', unit: '万m³', total: 2003.6, icon: 'subgrade' },
    { key: 'bridge', name: '桥梁工程', unit: 'm³', total: 60757.0, icon: 'bridge' },
    { key: 'pavement', name: '路面工程', unit: '千m²', total: 6003.2, icon: 'pavement' },
    { key: 'yard', name: '场站工程', unit: '座', total: 13.5, icon: 'yard', isInt: true },
    { key: 'safetyFac', name: '交安工程', unit: 'km', total: 265.5, icon: 'guardrail' },
    { key: 'green', name: '绿化工程', unit: '万m²', total: 1000.0, icon: 'leaf' }
  ];

  const SECTION_MATRIX_NOV = {
    sec1: [78.2, 68.5, 52.4, 90.0, 36.8, 30.4],
    sec2: [71.5, 62.1, 44.9, 86.7, 31.9, 27.6],
    sec3: [73.6, 63.8, 45.1, 88.8, 32.2, 28.1],
    sec4: [72.3, 61.7, 46.3, 88.9, 33.1, 28.9],
    sec5: [71.9, 62.9, 44.7, 89.5, 30.8, 27.9],
    sec6: [70.7, 61.8, 45.6, 88.3, 29.7, 28.8]
  };
  const ALL_LINE_PCT_NOV = [72.8, 63.4, 46.7, 88.9, 32.5, 28.6];
  const ALL_LINE_DONE_NOV = [1458.6, 38520.0, 2803.5, 12, 86.3, 286.0];

  const MONTH_FACTORS = {
    '2026-06': 0.677,
    '2026-07': 0.733,
    '2026-08': 0.801,
    '2026-09': 0.875,
    '2026-10': 0.928,
    '2026-11': 1.000
  };

  const TREND_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
  const TREND_PERIOD_QTY = [126.4, 139.2, 155.7, 166.8, 161.9, 179.6];
  const TREND_CUM_QTY = [2219.6, 2401.6, 2624.8, 2865.5, 3041.7, 2729.8]; // 累计折算展示
  const TREND_CUM_PCT = [37.8, 40.9, 44.7, 48.8, 51.8, 55.8];

  const PROGRESS_DETAILS = [
    { id: 'd1', secId: 'sec2', secName: '二工区', obj: '桥梁示例A', cat: '桥梁工程', item: '桥梁下部结构（墩台、基础）', unit: 'm³', total: '18,000.0', cur: '1,240.0', cum: '11,412.0', pct: 63.4, due: '2026-11-20', src: '《二工区2026年11月进度报表》', poiId: 'bridgeA' },
    { id: 'd2', secId: 'sec2', secName: '二工区', obj: '梁场示例A', cat: '桥梁工程', item: '预制梁生产（含养护）', unit: '片', total: '640', cur: '40', cum: '406', pct: 63.4, due: '2026-11-20', src: '《二工区2026年11月进度报表》', poiId: 'beamYardA' },
    { id: 'd3', secId: 'sec3', secName: '三工区', obj: '拌合站示例A', cat: '场站工程', item: '拌合站建设（主体及配套）', unit: '座', total: '1', cur: '0', cum: '1', pct: 100.0, due: '2026-11-20', src: '《三工区2026年11月进度报表》', poiId: 'batchPlantA' },
    { id: 'd4', secId: 'sec4', secName: '四工区', obj: '路面试验段K42+000~K44+000', cat: '路面工程', item: '沥青混合料面层（下面层）', unit: '千m²', total: '200.0', cur: '12.6', cum: '92.8', pct: 46.4, due: '2026-11-20', src: '《四工区2026年11月进度报表》' },
    { id: 'd5', secId: 'sec1', secName: '一工区', obj: '交安设施K12+000~K20+000', cat: '交安工程', item: '波形梁护栏安装', unit: 'km', total: '8.0', cur: '1.2', cum: '2.6', pct: 32.5, due: '2026-11-20', src: '《一工区2026年11月进度报表》' },
    { id: 'd6', secId: 'sec6', secName: '六工区', obj: '绿化示例段K68+000~K72+000', cat: '绿化工程', item: '边坡绿化（喷播、植草）', unit: '万m²', total: '16.0', cur: '2.1', cum: '4.6', pct: 28.8, due: '2026-11-20', src: '《六工区2026年11月进度报表》' },
    { id: 'd7', secId: 'sec1', secName: '一工区', obj: '一工区K18+400路基段', cat: '路基工程', item: '黑土地表土剥离与路基填筑', unit: '万m³', total: '340.0', cur: '18.5', cum: '265.9', pct: 78.2, due: '2026-11-20', src: '《一工区2026年11月进度报表》' },
    { id: 'd8', secId: 'sec3', secName: '三工区', obj: '三工区跨河中桥K58+120', cat: '桥梁工程', item: '钻孔灌注桩与承台浇筑', unit: 'm³', total: '9,600.0', cur: '680.0', cum: '6,124.8', pct: 63.8, due: '2026-11-20', src: '《三工区2026年11月进度报表》' },
    { id: 'd9', secId: 'sec5', secName: '五工区', obj: '五工区水稳基层K102~K112', cat: '路面工程', item: '水泥稳定碎石基层摊铺', unit: '千m²', total: '420.0', cur: '28.4', cum: '187.7', pct: 44.7, due: '2026-11-20', src: '《五工区2026年11月进度报表》' },
    { id: 'd10', secId: 'sec6', secName: '六工区', obj: '建华枢纽互通主线桥', cat: '桥梁工程', item: '现浇箱梁支架搭设与浇筑', unit: 'm³', total: '14,200.0', cur: '920.0', cum: '8,775.6', pct: 61.8, due: '2026-11-20', src: '《六工区2026年11月进度报表》' }
  ];

  const REPORT_ITEMS_BY_SEC = {
    sec1: [
      { obj: '一工区K18+400路基段', cat: '路基工程', item: '路基土石方填筑', unit: '万m³', total: '340', cur: '18.5', cum: '265.9', pct: 78.2 },
      { obj: '交安设施K12+000~K20+000', cat: '交安工程', item: '波形梁护栏安装', unit: 'km', total: '8.0', cur: '1.2', cum: '2.6', pct: 32.5 },
      { obj: '明水起点互通匝道桥', cat: '桥梁工程', item: '墩柱与盖梁施工', unit: 'm³', total: '8,400', cur: '560', cum: '5,754', pct: 68.5 },
      { obj: '一工区路面试验段', cat: '路面工程', item: '级配碎石底基层', unit: '千m²', total: '180', cur: '14.2', cum: '94.3', pct: 52.4 }
    ],
    sec2: [
      { obj: '桥梁示例A', cat: '桥梁工程', item: '下部结构', unit: 'm³', total: '18,000', cur: '1,240', cum: '11,412', pct: 63.4 },
      { obj: '梁场示例A', cat: '梁场工程', item: '预制梁生产', unit: '片', total: '640', cur: '40', cum: '406', pct: 63.4 },
      { obj: '二工区路基示例段', cat: '路基工程', item: '路基填筑', unit: '万m³', total: '120', cur: '8.0', cum: '86.4', pct: 72.0 },
      { obj: '二工区路面示例段', cat: '路面工程', item: '路面施工', unit: '千m²', total: '200', cur: '12.6', cum: '93.4', pct: 46.7 }
    ],
    sec3: [
      { obj: '拌合站示例A', cat: '场站工程', item: '主体与智能供料线', unit: '座', total: '1', cur: '0', cum: '1', pct: 100.0 },
      { obj: '三工区跨河中桥K58+120', cat: '桥梁工程', item: '桩基与承台浇筑', unit: 'm³', total: '9,600', cur: '680', cum: '6,125', pct: 63.8 },
      { obj: '三工区K56路基段', cat: '路基工程', item: '冻土路基换填', unit: '万m³', total: '150', cur: '9.4', cum: '110.4', pct: 73.6 },
      { obj: '三工区路面底基层', cat: '路面工程', item: '水稳底基层摊铺', unit: '千m²', total: '240', cur: '11.2', cum: '108.2', pct: 45.1 }
    ],
    sec4: [
      { obj: '路面试验段K42+000~K44+000', cat: '路面工程', item: '沥青混合料下面层', unit: '千m²', total: '200', cur: '12.6', cum: '92.8', pct: 46.4 },
      { obj: '四工区跨河大桥', cat: '桥梁工程', item: '盖梁预应力施工', unit: 'm³', total: '11,200', cur: '720', cum: '6,910', pct: 61.7 },
      { obj: '四工区路基填筑段', cat: '路基工程', item: '高填方路基碾压', unit: '万m³', total: '165', cur: '10.1', cum: '119.3', pct: 72.3 },
      { obj: '四工区边坡防护工程', cat: '绿化工程', item: '拱形骨架植草防护', unit: '万m²', total: '18', cur: '1.8', cum: '5.2', pct: 28.9 }
    ],
    sec5: [
      { obj: '五工区水稳基层K102~K112', cat: '路面工程', item: '水稳基层摊铺', unit: '千m²', total: '420', cur: '28.4', cum: '187.7', pct: 44.7 },
      { obj: '五工区分离式立交桥', cat: '桥梁工程', item: '预制箱梁架设', unit: '片', total: '160', cur: '14', cum: '101', pct: 63.1 },
      { obj: '五工区K108路基段', cat: '路基工程', item: '路床精平交验', unit: '万m³', total: '138', cur: '7.5', cum: '99.2', pct: 71.9 },
      { obj: '五工区交安标线标志', cat: '交安工程', item: '门架基础浇筑', unit: '处', total: '26', cur: '3', cum: '8', pct: 30.8 }
    ],
    sec6: [
      { obj: '建华枢纽互通主线桥', cat: '桥梁工程', item: '现浇箱梁施工', unit: 'm³', total: '14,200', cur: '920', cum: '8,776', pct: 61.8 },
      { obj: '绿化示例段K68+000~K72+000', cat: '绿化工程', item: '边坡喷播植草', unit: '万m²', total: '16.0', cur: '2.1', cum: '4.6', pct: 28.8 },
      { obj: '六工区路基交验段', cat: '路基工程', item: '黑土复垦与边坡整修', unit: '万m³', total: '145', cur: '8.2', cum: '102.5', pct: 70.7 },
      { obj: '北安终点连接线', cat: '路面工程', item: '沥青上面层试验铺筑', unit: '千m²', total: '210', cur: '13.5', cum: '95.8', pct: 45.6 }
    ]
  };

  const GANTT_TASKS = [
    { id: 't1', name: '路基施工', cat: '路基工程', secId: 'sec1', startM: 0, endM: 7.0, actualM: 6.1, milestoneM: 6.1, status: '已完成' },
    { id: 't2', name: '桥梁下部结构', cat: '桥梁工程', secId: 'sec2', startM: 0.6, endM: 7.0, actualM: 6.6, milestoneM: 6.6, status: '已完成' },
    { id: 't3', name: '梁场预制', cat: '场站工程', secId: 'sec2', startM: 1.5, endM: 8.0, actualM: 7.5, milestoneM: null, status: '推进中' },
    { id: 't4', name: '架梁施工', cat: '桥梁工程', secId: 'sec2', startM: 3.6, endM: 8.8, actualM: 7.0, milestoneM: 8.3, status: '按计划推进' },
    { id: 't5', name: '路面基层', cat: '路面工程', secId: 'sec4', startM: 4.3, endM: 8.5, actualM: 7.3, milestoneM: null, status: '推进中' },
    { id: 't6', name: '路面面层', cat: '路面工程', secId: 'sec5', startM: 6.9, endM: 10.0, actualM: 9.5, milestoneM: null, status: '正常' },
    { id: 't7', name: '交安工程', cat: '交安工程', secId: 'sec1', startM: 6.1, endM: 10.0, actualM: 9.5, milestoneM: null, status: '正常' },
    { id: 't8', name: '绿化工程', cat: '绿化工程', secId: 'sec6', startM: 6.4, endM: 10.0, actualM: 9.5, milestoneM: null, status: '正常' }
  ];

  const PLAN_NODES = [
    { id: 'n1', idx: 1, title: '场地准备', date: '2026-06-15', status: '已完成', statusCls: 'ok', secId: 'sec1', secName: '一工区', obj: '明水起点工区', task: '路基施工', cat: '路基工程', spec: '路基专业', inShortList: false },
    { id: 'n2', idx: 2, title: '桩基施工', date: '2026-08-10', status: '已完成', statusCls: 'ok', secId: 'sec2', secName: '二工区', obj: '桥梁示例A', task: '桥梁下部结构', cat: '桥梁工程', spec: '桥梁专业', inShortList: false },
    { id: 'n3', idx: 3, title: '墩台施工', date: '2026-09-25', status: '已完成', statusCls: 'ok', secId: 'sec2', secName: '二工区', obj: '桥梁示例A', task: '桥梁下部结构', cat: '桥梁工程', spec: '桥梁专业', inShortList: true, listIdx: 1 },
    { id: 'n4', idx: 4, title: '梁板架设', date: '2026-11-20', status: '按计划推进', statusCls: 'info', secId: 'sec2', secName: '二工区', obj: '桥梁示例A', task: '架梁施工', cat: '桥梁工程', spec: '桥梁专业', inShortList: true, listIdx: 2 },
    { id: 'n5', idx: 5, title: '路面基层完成', date: '2026-12-10', status: '正常', statusCls: 'ok', secId: 'sec4', secName: '四工区', obj: '路面试验段K42+000', task: '路面基层', cat: '路面工程', spec: '路面专业', inShortList: true, listIdx: 3 },
    { id: 'n6', idx: 6, title: '路面面层启动', date: '2026-12-20', status: '正常', statusCls: 'ok', secId: 'sec5', secName: '五工区', obj: '五工区路面段', task: '路面面层', cat: '路面工程', spec: '路面专业', inShortList: true, listIdx: 4 },
    { id: 'n7', idx: 7, title: '路面贯通', date: '2027-05-18', status: '规划节点', statusCls: 'info', secId: 'sec6', secName: '六工区', obj: '建华枢纽互通', task: '路面面层', cat: '路面工程', spec: '路面专业', inShortList: false }
  ];

  const BIM_OBJECTS = [
    {
      id: 'bridgeA',
      name: '桥梁示例A',
      poiId: 'bridgeA',
      secId: 'sec2',
      secName: '二工区',
      planName: '2026年阶段计划',
      planVer: 'V1.3',
      start: '2026-06-01',
      end: '2026-12-15',
      tasks: [
        { id: 'bt1', name: '场地准备', start: '2026-06-01', end: '2026-06-25', icon: 'excavator', part: '便道与施工平台' },
        { id: 'bt2', name: '桩基施工', start: '2026-06-26', end: '2026-08-15', icon: 'layers', part: '48根钻孔灌注桩' },
        { id: 'bt3', name: '墩台施工', start: '2026-08-16', end: '2026-09-25', icon: 'guardrail', part: '6座双柱墩及盖梁' },
        { id: 'bt4', name: '梁板架设', start: '2026-09-26', end: '2026-12-15', icon: 'bridge', part: '80片预制箱梁架设' }
      ]
    },
    {
      id: 'beamYardA',
      name: '梁场示例A',
      poiId: 'beamYardA',
      secId: 'sec2',
      secName: '二工区',
      planName: '2026年梁场预制计划',
      planVer: 'V1.2',
      start: '2026-06-01',
      end: '2026-12-15',
      tasks: [
        { id: 'yt1', name: '台座基础硬化', start: '2026-06-01', end: '2026-06-28', icon: 'excavator', part: '制梁台座区' },
        { id: 'yt2', name: '龙门吊拼装检定', start: '2026-06-29', end: '2026-07-25', icon: 'layers', part: '双80t门式起重机' },
        { id: 'yt3', name: '箱梁批量预制', start: '2026-07-26', end: '2026-11-10', icon: 'yard', part: '240片标准箱梁' },
        { id: 'yt4', name: '智能张拉与出梁', start: '2026-11-11', end: '2026-12-15', icon: 'bridge', part: '存梁转运出场' }
      ]
    },
    {
      id: 'batchPlantA',
      name: '拌合站示例A',
      poiId: 'batchPlantA',
      secId: 'sec2',
      secName: '二工区',
      planName: '2026年场站保供计划',
      planVer: 'V1.1',
      start: '2026-06-01',
      end: '2026-12-15',
      tasks: [
        { id: 'pt1', name: '料仓地基施工', start: '2026-06-01', end: '2026-06-20', icon: 'excavator', part: '骨料封闭大棚基础' },
        { id: 'pt2', name: 'HZS180机组安装', start: '2026-06-21', end: '2026-07-30', icon: 'plant', part: '双机组拌合楼' },
        { id: 'pt3', name: '标定试生产', start: '2026-07-31', end: '2026-08-31', icon: 'layers', part: '配合比联调' },
        { id: 'pt4', name: '冬季保温供料', start: '2026-09-01', end: '2026-12-15', icon: 'yard', part: '全线C50混凝土保供' }
      ]
    },
    {
      id: 'subgrade1',
      name: '一工区K18+400路基',
      poiId: 'bridgeA',
      secId: 'sec1',
      secName: '一工区',
      planName: '2026年路基交验计划',
      planVer: 'V1.3',
      start: '2026-06-01',
      end: '2026-12-15',
      tasks: [
        { id: 'st1', name: '黑土表土剥离', start: '2026-06-01', end: '2026-06-30', icon: 'leaf', part: '表土集中堆存' },
        { id: 'st2', name: '路基分层填筑', start: '2026-07-01', end: '2026-09-20', icon: 'subgrade', part: '96区路床压实' },
        { id: 'st3', name: '边坡防护砌筑', start: '2026-09-21', end: '2026-11-15', icon: 'guardrail', part: '拱形骨架防护' },
        { id: 'st4', name: '路基交验移交', start: '2026-11-16', end: '2026-12-15', icon: 'pavement', part: '移交路面施工' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     PERSISTENT MODULE UI STATE
     ------------------------------------------------------------------------ */
  const ui = {
    // Subpage 1: 进度总览
    ovCategory: 'all',
    ovMonth: '2026-11',
    ovChartMode: 'period', // 'period' | 'cum'
    ovHoverMonthIdx: -1,
    ovPage: 0,
    ovShowAll: false,

    // Subpage 2: 进度报表
    rpSecId: 'all',
    rpYear: '2026',
    rpMonth: '11',
    rpKeyword: '',
    rpAppliedSecId: 'all',
    rpAppliedYear: '2026',
    rpAppliedMonth: '11',
    rpAppliedKeyword: '',
    rpSelectedSecId: 'sec2',

    // Subpage 3: 计划与节点
    plSecId: 'all',
    plLevel: 'total',
    plRange: '2026',
    plKeyword: '',
    plAppliedSecId: 'all',
    plAppliedLevel: 'total',
    plAppliedKeyword: '',
    plTreeCat: '桥梁工程', // 'all' or category name
    plSelectedNodeId: 'n4',

    // Subpage 4 & 5: BIM进度模拟
    bimSecId: 'sec2',
    bimObjId: 'bridgeA',
    bimSelectedTaskId: 'bt4',
    bimProgress: 89.8, // 0..100 representing 2026-06-01..2026-12-15 (89.8 ≈ 2026-11-25)
    bimPlaying: false,
    bimSpeed: 1.0,
    bimShowInspector: false,
    bimForceDesignBase: null // null = auto by scheme (A: real, B: design)
  };

  let simTimer = null;
  let lastCtx = null;
  let lastSubPageId = null;
  let savedBimStyles = null;
  let lastGlobalPoiId = null;
  let lastCesiumBimSig = '';

  /* ------------------------------------------------------------------------
     DATE & MATH HELPERS
     ------------------------------------------------------------------------ */
  function dateToMs(s) {
    return new Date(s + 'T00:00:00Z').getTime();
  }

  function msToDate(ms) {
    const d = new Date(ms);
    const y = d.getUTCFullYear();
    const m = String(d.getUTCMonth() + 1).padStart(2, '0');
    const day = String(d.getUTCDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  function pctToSimDate(startStr, endStr, pct) {
    const t0 = dateToMs(startStr);
    const t1 = dateToMs(endStr);
    const clamped = Math.max(0, Math.min(100, pct)) / 100;
    return msToDate(t0 + (t1 - t0) * clamped);
  }

  function simDateToPct(startStr, endStr, dateStr) {
    const t0 = dateToMs(startStr);
    const t1 = dateToMs(endStr);
    const t = dateToMs(dateStr);
    if (t1 <= t0) return 50;
    return Math.max(0, Math.min(100, +(((t - t0) / (t1 - t0)) * 100).toFixed(1)));
  }

  function getTaskStateAtDate(task, simDate) {
    if (simDate > task.end) return 'done';
    if (simDate >= task.start && simDate <= task.end) return 'doing';
    return 'todo';
  }

  function getIcon(icons, key) {
    return (icons && icons[key]) || (icons && icons.layers) || '';
  }

  function secNameById(secId, workSections) {
    if (!secId || secId === 'all') return '全线';
    const found = (workSections || []).find(s => s.id === secId);
    return found ? found.name : secId;
  }

  function fmtNum(val, decimals) {
    return Number(val).toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    });
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 1: 01_进度总览
     ------------------------------------------------------------------------ */
  function renderOverview(hostEl, ctx) {
    const { state, data, icons } = ctx;
    const activeSec = state.activeSectionId;
    const factor = MONTH_FACTORS[ui.ovMonth] || 1;
    const workSections = data.workSections || [];

    // Compute 6 KPI cards based on activeSectionId & selected month
    const kpis = CATEGORIES.map((cat, idx) => {
      const basePct = activeSec ? SECTION_MATRIX_NOV[activeSec][idx] : ALL_LINE_PCT_NOV[idx];
      const pct = +Math.min(100, basePct * factor).toFixed(1);
      const secShare = activeSec ? 0.165 : 1.0;
      const doneVal = ALL_LINE_DONE_NOV[idx] * secShare * factor * (basePct / ALL_LINE_PCT_NOV[idx]);
      const doneStr = cat.isInt
        ? `${Math.max(1, Math.round(doneVal))} ${cat.unit}`
        : `${fmtNum(doneVal, 1)} ${cat.unit}`;
      return { ...cat, pct, doneStr };
    });

    // Trend metrics
    const secScale = activeSec ? 0.172 : 1.0;
    const selMonthIdx = Math.max(0, TREND_MONTHS.indexOf(ui.ovMonth));
    const totalQty = 5872.0 * secScale;
    const periodQty = TREND_PERIOD_QTY[selMonthIdx] * secScale;
    const cumQty = (ui.ovMonth === '2026-11' ? 2729.8 : TREND_CUM_QTY[selMonthIdx]) * secScale;

    // Filter detail rows
    const detailRows = PROGRESS_DETAILS.filter(r => {
      if (activeSec && r.secId !== activeSec) return false;
      if (ui.ovCategory !== 'all' && r.cat !== ui.ovCategory) return false;
      return true;
    });
    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(detailRows.length / pageSize));
    if (ui.ovPage >= totalPages) ui.ovPage = 0;
    const visibleDetails = (ui.ovShowAll || detailRows.length <= pageSize)
      ? detailRows
      : detailRows.slice(ui.ovPage * pageSize, (ui.ovPage + 1) * pageSize);

    const chartSvg = buildOverviewTrendSvg(secScale, selMonthIdx);

    hostEl.innerHTML = `
      <div class="m02-page m02-ov-page">
        <!-- Top Filter Bar -->
        <div class="m02-filter-bar">
          <div class="m02-filter-row">
            <div class="m02-filter-left">
              <span class="m02-filter-label">工区</span>
              <div class="m02-pill-group" id="m02OvSecPills">
                <button class="m02-pill-btn ${!activeSec ? 'active' : ''}" data-sec="all">全线</button>
                ${workSections.map(s => `
                  <button class="m02-pill-btn ${activeSec === s.id ? 'active' : ''}" data-sec="${s.id}">${s.name}</button>
                `).join('')}
              </div>
              <span class="m02-vdiv"></span>
              <span class="m02-filter-label">工程类别</span>
              <select class="glass-select" id="m02OvCatSelect" style="flex:0 0 132px;">
                <option value="all" ${ui.ovCategory === 'all' ? 'selected' : ''}>全部</option>
                ${CATEGORIES.map(c => `<option value="${c.name}" ${ui.ovCategory === c.name ? 'selected' : ''}>${c.name}</option>`).join('')}
              </select>
              <span class="m02-filter-label">统计年月</span>
              <select class="glass-select" id="m02OvMonthSelect" style="flex:0 0 120px;">
                ${TREND_MONTHS.slice().reverse().map(m => `<option value="${m}" ${ui.ovMonth === m ? 'selected' : ''}>${m}</option>`).join('')}
              </select>
            </div>
            <div class="m02-filter-right">
              <span>数据截止 <strong style="color:#fff;">${ui.ovMonth}-20</strong></span>
              <span>|</span>
              <span>统计依据</span>
              <button class="m02-action-link" id="m02OvGoReport" style="padding:0;">已发布进度报表</button>
            </div>
          </div>
        </div>

        <!-- 6 Category KPI Cards -->
        <div class="m02-kpi-6" id="m02OvKpiGrid">
          ${kpis.map(k => `
            <div class="m02-kpi-card ${ui.ovCategory === k.name ? 'active' : ''}" data-cat="${k.name}">
              <div class="m02-kpi-top">
                <span class="m02-kpi-name">${getIcon(icons, k.icon)}<span>${k.name}</span></span>
                <span class="m02-kpi-pct">${k.pct.toFixed(1)}%</span>
              </div>
              <div class="progress-track"><div class="progress-fill" style="width:${k.pct}%"></div></div>
              <div class="m02-kpi-foot">累计完成 <strong>${k.doneStr}</strong></div>
            </div>
          `).join('')}
        </div>

        <!-- Middle Split: Section Progress Matrix + Volume & Trend Chart -->
        <div class="m02-mid-split">
          <!-- Left: 各工区进度汇总 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">各工区进度汇总</span>
              </div>
              <span style="font-size:11.5px;color:var(--text-sub);">${activeSec ? `当前聚焦：${secNameById(activeSec, workSections)}` : '点击工区行可联动筛选'}</span>
            </div>
            <div class="panel-body m02-table-wrap">
              <table class="data-table">
                <thead>
                  <tr>
                    <th style="min-width:68px;">工区</th>
                    ${CATEGORIES.map(c => `<th style="min-width:92px;${ui.ovCategory === c.name ? 'color:#fde047;' : ''}">${c.name}</th>`).join('')}
                  </tr>
                </thead>
                <tbody id="m02OvMatrixBody">
                  ${workSections.map(s => {
                    const rowVals = SECTION_MATRIX_NOV[s.id].map(v => +(v * factor).toFixed(1));
                    const isSel = activeSec === s.id;
                    return `
                      <tr class="m02-row-clickable ${isSel ? 'm02-row-selected' : ''}" data-matrix-sec="${s.id}">
                        <td style="font-weight:700;color:#fff;">${s.name}</td>
                        ${rowVals.map(val => `
                          <td>
                            <div class="m02-mini-bar">
                              <div class="m02-mini-track"><div class="m02-mini-fill" style="width:${val}%"></div></div>
                              <span class="m02-mini-val">${val.toFixed(1)}%</span>
                            </div>
                          </td>
                        `).join('')}
                      </tr>
                    `;
                  }).join('')}
                  <tr class="m02-row-summary">
                    <td style="color:#38f2ff;">全线汇总</td>
                    ${ALL_LINE_PCT_NOV.map(v => {
                      const val = +(v * factor).toFixed(1);
                      return `
                        <td>
                          <div class="m02-mini-bar">
                            <div class="m02-mini-track"><div class="m02-mini-fill" style="width:${val}%"></div></div>
                            <span class="m02-mini-val" style="color:#38f2ff;">${val.toFixed(1)}%</span>
                          </div>
                        </td>
                      `;
                    }).join('')}
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Right: 工程量与进展趋势 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">工程量与进展趋势</span>
              </div>
              <span style="font-size:11.5px;color:var(--text-sub);">${activeSec ? secNameById(activeSec, workSections) : '全线折算'}</span>
            </div>
            <div class="panel-body">
              <div class="m02-trend-kpis">
                <div class="m02-trend-box">
                  <div class="m02-trend-icon">${getIcon(icons, 'layers')}</div>
                  <div>
                    <div class="m02-trend-label">总工程量</div>
                    <div class="m02-trend-val">${fmtNum(totalQty, 1)}<small>万m³ (折算)</small></div>
                  </div>
                </div>
                <div class="m02-trend-box">
                  <div class="m02-trend-icon">${getIcon(icons, 'speed')}</div>
                  <div>
                    <div class="m02-trend-label">本期完成量</div>
                    <div class="m02-trend-val" style="color:#38f2ff;">${fmtNum(periodQty, 1)}<small>万m³ (折算)</small></div>
                  </div>
                </div>
                <div class="m02-trend-box">
                  <div class="m02-trend-icon">${getIcon(icons, 'shield')}</div>
                  <div>
                    <div class="m02-trend-label">累计完成量</div>
                    <div class="m02-trend-val">${fmtNum(cumQty, 1)}<small>万m³ (折算)</small></div>
                  </div>
                </div>
              </div>

              <div class="m02-chart-toolbar">
                <div class="m02-pill-group" id="m02OvChartToggle">
                  <button class="m02-pill-btn ${ui.ovChartMode === 'period' ? 'active' : ''}" data-mode="period">本期完成量</button>
                  <button class="m02-pill-btn ${ui.ovChartMode === 'cum' ? 'active' : ''}" data-mode="cum">累计完成量</button>
                </div>
                <div class="m02-chart-legend">
                  <span class="m02-legend-item"><span style="width:12px;height:8px;border-radius:2px;background:#1d8aff;display:inline-block;"></span>${ui.ovChartMode === 'period' ? '本期完成量' : '累计完成量'}</span>
                  <span class="m02-legend-item"><span style="width:16px;height:2px;background:#38f2ff;display:inline-block;"></span>完成比例 (累计)</span>
                </div>
              </div>

              <div id="m02OvChartHost">${chartSvg}</div>
            </div>
          </div>
        </div>

        <!-- Bottom Table: 工程进度明细 -->
        <div class="glass-panel">
          <div class="panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">工程进度明细</span>
            </div>
            <div class="m02-ov-pager">
              <span style="font-size:11.5px;color:var(--text-sub);">共 ${detailRows.length} 条分项明细</span>
              ${detailRows.length > pageSize ? `
                ${!ui.ovShowAll ? `
                  <button class="m02-ov-page-btn" id="m02OvPrevPage" ${ui.ovPage === 0 ? 'disabled' : ''}>‹</button>
                  <span style="font-size:11.5px;color:#dbeafe;font-variant-numeric:tabular-nums;">${ui.ovPage + 1}/${totalPages}</span>
                  <button class="m02-ov-page-btn" id="m02OvNextPage" ${ui.ovPage >= totalPages - 1 ? 'disabled' : ''}>›</button>
                ` : ''}
                <button class="m02-ov-page-btn ${ui.ovShowAll ? 'active' : ''}" id="m02OvToggleAll">${ui.ovShowAll ? '分页显示' : '展开全部'}</button>
              ` : ''}
            </div>
          </div>
          <div class="panel-body m02-table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>工区</th>
                  <th>工程对象</th>
                  <th>工程类别</th>
                  <th>分项指标</th>
                  <th>计量单位</th>
                  <th>总工程量</th>
                  <th>本期完成量</th>
                  <th>累计完成量</th>
                  <th>完成比例</th>
                  <th>统计截止日期</th>
                  <th>来源报表</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody id="m02OvDetailBody">
                ${visibleDetails.length ? visibleDetails.map(r => {
                  const pct = +(r.pct * factor).toFixed(1);
                  return `
                    <tr>
                      <td>${r.secName}</td>
                      <td style="font-weight:700;color:#fff;">${r.obj}</td>
                      <td>${r.cat}</td>
                      <td>${r.item}</td>
                      <td>${r.unit}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.total}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.cur}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.cum}</td>
                      <td style="font-weight:700;color:#38f2ff;font-variant-numeric:tabular-nums;">${pct.toFixed(1)}%</td>
                      <td style="font-variant-numeric:tabular-nums;">${ui.ovMonth}-20</td>
                      <td style="color:#bae6fd;">${r.src}</td>
                      <td><button class="m02-action-link" data-detail-id="${r.id}">查看详情</button></td>
                    </tr>
                  `;
                }).join('') : `<tr><td colspan="12" style="text-align:center;color:var(--text-sub);padding:18px;">当前筛选条件下暂无工程进度明细</td></tr>`}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;

    // Bind events
    hostEl.querySelectorAll('#m02OvSecPills [data-sec]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.ovPage = 0;
        const targetSec = btn.dataset.sec === 'all' ? null : btn.dataset.sec;
        syncGlobalSection(targetSec, ctx);
      });
    });
    hostEl.querySelector('#m02OvCatSelect').addEventListener('change', e => {
      ui.ovCategory = e.target.value;
      ui.ovPage = 0;
      renderOverview(hostEl, ctx);
    });
    hostEl.querySelector('#m02OvMonthSelect').addEventListener('change', e => {
      ui.ovMonth = e.target.value;
      renderOverview(hostEl, ctx);
      ctx.showToast(`已切换统计年月：${ui.ovMonth}`);
    });
    hostEl.querySelector('#m02OvGoReport').addEventListener('click', () => {
      ctx.switchModule('progress', 'report');
    });
    hostEl.querySelectorAll('#m02OvKpiGrid [data-cat]').forEach(card => {
      card.addEventListener('click', () => {
        const cat = card.dataset.cat;
        ui.ovCategory = ui.ovCategory === cat ? 'all' : cat;
        ui.ovPage = 0;
        renderOverview(hostEl, ctx);
      });
    });
    const prevPageBtn = hostEl.querySelector('#m02OvPrevPage');
    if (prevPageBtn) {
      prevPageBtn.addEventListener('click', () => {
        if (ui.ovPage > 0) {
          ui.ovPage -= 1;
          renderOverview(hostEl, ctx);
        }
      });
    }
    const nextPageBtn = hostEl.querySelector('#m02OvNextPage');
    if (nextPageBtn) {
      nextPageBtn.addEventListener('click', () => {
        if (ui.ovPage < totalPages - 1) {
          ui.ovPage += 1;
          renderOverview(hostEl, ctx);
        }
      });
    }
    const toggleAllBtn = hostEl.querySelector('#m02OvToggleAll');
    if (toggleAllBtn) {
      toggleAllBtn.addEventListener('click', () => {
        ui.ovShowAll = !ui.ovShowAll;
        renderOverview(hostEl, ctx);
      });
    }
    hostEl.querySelectorAll('#m02OvMatrixBody [data-matrix-sec]').forEach(tr => {
      tr.addEventListener('click', () => {
        const secId = tr.dataset.matrixSec;
        const nextSec = state.activeSectionId === secId ? null : secId;
        syncGlobalSection(nextSec, ctx);
      });
    });
    hostEl.querySelectorAll('#m02OvChartToggle [data-mode]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.ovChartMode = btn.dataset.mode;
        renderOverview(hostEl, ctx);
      });
    });
    hostEl.querySelectorAll('#m02OvChartHost [data-m-idx]').forEach(el => {
      el.addEventListener('click', () => {
        const idx = Number(el.dataset.mIdx);
        ui.ovMonth = TREND_MONTHS[idx];
        renderOverview(hostEl, ctx);
      });
    });
    hostEl.querySelectorAll('#m02OvDetailBody [data-detail-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        const row = PROGRESS_DETAILS.find(r => r.id === btn.dataset.detailId);
        if (row) openProgressDetailModal(row, ctx);
      });
    });
  }

  function buildOverviewTrendSvg(secScale, selMonthIdx) {
    const W = 700;
    const H = 142;
    const padL = 42;
    const padR = 44;
    const padT = 24;
    const padB = 20;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const isCum = ui.ovChartMode === 'cum';
    const rawBars = isCum
      ? TREND_CUM_QTY.map((v, i) => (i === 5 ? 2729.8 : v) * secScale)
      : TREND_PERIOD_QTY.map(v => v * secScale);

    const maxBarRaw = Math.max(...rawBars);
    const yMaxBar = isCum
      ? Math.ceil((maxBarRaw * 1.15) / 500) * 500 || 500
      : Math.ceil((maxBarRaw * 1.3) / 50) * 50 || 50;

    const yTicks = 5;
    const gridLines = [];
    for (let i = 0; i <= yTicks; i++) {
      const y = padT + (plotH * i) / yTicks;
      const leftVal = Math.round(yMaxBar * (1 - i / yTicks));
      const rightVal = Math.round(100 * (1 - i / yTicks));
      gridLines.push(`
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(125,211,252,0.16)" stroke-dasharray="3 3"/>
        <text x="${padL - 7}" y="${(y + 4).toFixed(1)}" fill="#8db4dc" font-size="10.5" text-anchor="end">${leftVal}</text>
        <text x="${W - padR + 7}" y="${(y + 4).toFixed(1)}" fill="#8db4dc" font-size="10.5" text-anchor="start">${rightVal}%</text>
      `);
    }

    const colW = plotW / TREND_MONTHS.length;
    const barW = Math.min(34, colW * 0.44);
    const linePts = [];

    const barsHtml = TREND_MONTHS.map((m, i) => {
      const cx = padL + colW * (i + 0.5);
      const val = rawBars[i];
      const barH = Math.max(4, (val / yMaxBar) * plotH);
      const bx = cx - barW / 2;
      const by = padT + plotH - barH;
      const pct = TREND_CUM_PCT[i];
      const py = padT + plotH - (pct / 100) * plotH;
      linePts.push({ cx, cy: py, pct });
      const active = i === selMonthIdx;
      return `
        <g data-m-idx="${i}" style="cursor:pointer;">
          <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${barW}" height="${barH.toFixed(1)}" rx="3"
                fill="url(#m02-barGrad)" stroke="${active ? '#38f2ff' : 'rgba(56,189,248,0.5)'}" stroke-width="${active ? 1.5 : 0.8}"/>
          <text x="${cx.toFixed(1)}" y="${(by - 5).toFixed(1)}" fill="${active ? '#38f2ff' : '#ffffff'}" font-size="11" font-weight="700" text-anchor="middle">${val.toFixed(1)}</text>
          <text x="${cx.toFixed(1)}" y="${H - 6}" fill="${active ? '#38f2ff' : '#a9c6e8'}" font-size="11" font-weight="${active ? 700 : 500}" text-anchor="middle">${m}</text>
        </g>
      `;
    }).join('');

    const pathD = linePts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.cx.toFixed(1)} ${p.cy.toFixed(1)}`).join(' ');
    const dotsHtml = linePts.map((p, i) => `
      <g data-m-idx="${i}" style="cursor:pointer;">
        <circle cx="${p.cx.toFixed(1)}" cy="${p.cy.toFixed(1)}" r="4.2" fill="#06214c" stroke="#38f2ff" stroke-width="2.2"/>
        <rect x="${(p.cx - 19).toFixed(1)}" y="${(p.cy + 7).toFixed(1)}" width="38" height="15" rx="4" fill="rgba(8,32,74,0.85)" stroke="rgba(56,220,255,0.45)" stroke-width="0.7"/>
        <text x="${p.cx.toFixed(1)}" y="${(p.cy + 18).toFixed(1)}" fill="#bae6fd" font-size="10" font-weight="700" text-anchor="middle">${p.pct.toFixed(1)}%</text>
      </g>
    `).join('');

    return `
      <svg class="m02-svg-chart" viewBox="0 0 ${W} ${H}">
        <defs>
          <linearGradient id="m02-barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#22d3ee" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#0d5bd9" stop-opacity="0.72"/>
          </linearGradient>
        </defs>
        <text x="${padL - 4}" y="11" fill="#8db4dc" font-size="10.5">工程量 (万m³, 折算)</text>
        <text x="${W - 4}" y="11" fill="#8db4dc" font-size="10.5" text-anchor="end">完成比例</text>
        ${gridLines.join('')}
        ${barsHtml}
        <path d="${pathD}" fill="none" stroke="#38f2ff" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/>
        ${dotsHtml}
      </svg>
    `;
  }

  function openProgressDetailModal(row, ctx) {
    const factor = MONTH_FACTORS[ui.ovMonth] || 1;
    const scaledPct = +(row.pct * factor).toFixed(1);
    ctx.openModal(`工程进度详情 · ${row.obj}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区 / 类别</span><strong>${row.secName} · ${row.cat}</strong></div>
        <div class="detail-stat-card"><span>累计完成比例</span><strong>${scaledPct.toFixed(1)}%</strong></div>
        <div class="detail-stat-card"><span>累计 / 总工程量</span><strong>${row.cum} / ${row.total} ${row.unit}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">分项指标</th><td>${row.item}</td><th style="width:120px;">本期完成量</th><td>${row.cur} ${row.unit}</td></tr>
          <tr><th>统计截止日期</th><td>${ui.ovMonth}-20</td><th>来源报表</th><td>${row.src}</td></tr>
          <tr><th>工程形象状态</th><td><span class="status-tag ${scaledPct >= 80 ? 'ok' : 'info'}">${scaledPct >= 100 ? '已完工' : '按计划推进'}</span></td><th>监理签认</th><td>已核验归档</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
        <button class="dock-btn" id="m02ModalGoRep">查看对应工区报表</button>
        <button class="dock-btn primary" id="m02ModalGoBim">进入 BIM 进度模拟</button>
      </div>
    `);
    setTimeout(() => {
      const repBtn = document.getElementById('m02ModalGoRep');
      const bimBtn = document.getElementById('m02ModalGoBim');
      if (repBtn) repBtn.addEventListener('click', () => {
        ui.rpSelectedSecId = row.secId;
        ctx.closeModal();
        ctx.switchModule('progress', 'report');
      });
      if (bimBtn) bimBtn.addEventListener('click', () => {
        ui.bimSecId = row.secId;
        if (row.poiId && BIM_OBJECTS.some(b => b.id === row.poiId)) ui.bimObjId = row.poiId;
        ctx.closeModal();
        ctx.switchModule('progress', 'bim_a');
      });
    }, 0);
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 2: 02_进度报表
     ------------------------------------------------------------------------ */
  function renderReport(hostEl, ctx) {
    const { data, icons } = ctx;
    const workSections = data.workSections || [];
    const ymLabel = `${ui.rpAppliedYear}年${ui.rpAppliedMonth}月`;
    const dueStr = `${ui.rpAppliedYear}-${ui.rpAppliedMonth}-20`;
    const updStr = `${ui.rpAppliedYear}-${ui.rpAppliedMonth}-24`;

    const allReports = workSections.map(s => ({
      secId: s.id,
      secName: s.name,
      period: ymLabel,
      name: `${ymLabel}进度报表`,
      due: dueStr,
      updated: updStr,
      source: `${s.name}${ymLabel}进度报表`
    }));

    const filteredReports = allReports.filter(r => {
      if (ui.rpAppliedSecId !== 'all' && r.secId !== ui.rpAppliedSecId) return false;
      if (ui.rpAppliedKeyword.trim()) {
        const kw = ui.rpAppliedKeyword.trim().toLowerCase();
        if (!r.name.toLowerCase().includes(kw) && !r.secName.toLowerCase().includes(kw)) return false;
      }
      return true;
    });

    if (filteredReports.length && !filteredReports.some(r => r.secId === ui.rpSelectedSecId)) {
      ui.rpSelectedSecId = filteredReports[0].secId;
    }
    const selReport = filteredReports.find(r => r.secId === ui.rpSelectedSecId) || allReports.find(r => r.secId === ui.rpSelectedSecId) || allReports[1];
    const baseItems = REPORT_ITEMS_BY_SEC[selReport.secId] || REPORT_ITEMS_BY_SEC.sec2;
    const rpFactor = (ui.rpAppliedYear === '2025' ? 0.35 : 1.0) * (MONTH_FACTORS[`${ui.rpAppliedYear}-${ui.rpAppliedMonth}`] || (ui.rpAppliedYear === '2025' ? 0.85 : 1.0));
    const items = baseItems.map(it => {
      if (rpFactor >= 0.999) return it;
      const numCum = parseFloat(String(it.cum).replace(/,/g, '')) * rpFactor;
      const numCur = parseFloat(String(it.cur).replace(/,/g, '')) * (0.7 + 0.3 * rpFactor);
      const pct = +Math.min(100, it.pct * rpFactor).toFixed(1);
      return {
        ...it,
        cur: numCur >= 100 ? fmtNum(numCur, 0) : numCur.toFixed(1),
        cum: numCum >= 100 ? fmtNum(numCum, 0) : numCum.toFixed(1),
        pct
      };
    });
    const scopeLabel = ui.rpAppliedSecId === 'all' ? '全线' : secNameById(ui.rpAppliedSecId, workSections);

    hostEl.innerHTML = `
      <div class="m02-page">
        <!-- Top Search & Filter Bar -->
        <div class="m02-filter-bar">
          <div class="m02-filter-row">
            <div class="m02-filter-left">
              <span class="m02-filter-label">所属工区</span>
              <select class="glass-select" id="m02RpSecSelect" style="flex:0 0 130px;">
                <option value="all" ${ui.rpSecId === 'all' ? 'selected' : ''}>全部工区</option>
                ${workSections.map(s => `<option value="${s.id}" ${ui.rpSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
              <span class="m02-filter-label">统计年度</span>
              <select class="glass-select" id="m02RpYearSelect" style="flex:0 0 105px;">
                <option value="2026" ${ui.rpYear === '2026' ? 'selected' : ''}>2026年</option>
                <option value="2025" ${ui.rpYear === '2025' ? 'selected' : ''}>2025年</option>
              </select>
              <span class="m02-filter-label">统计月份</span>
              <select class="glass-select" id="m02RpMonthSelect" style="flex:0 0 100px;">
                ${['11', '10', '09', '08', '07', '06'].map(m => `<option value="${m}" ${ui.rpMonth === m ? 'selected' : ''}>${Number(m)}月</option>`).join('')}
              </select>
              <span class="m02-filter-label">报表名称</span>
              <input class="m02-input" id="m02RpKwInput" type="text" placeholder="请输入报表名称" value="${ui.rpKeyword}" />
            </div>
            <div class="m02-filter-right">
              <button class="dock-btn primary" id="m02RpSearchBtn" style="padding:6px 18px;">🔍 查询</button>
              <button class="dock-btn" id="m02RpResetBtn" style="padding:6px 14px;">↻ 重置</button>
            </div>
          </div>
          <div class="m02-meta-strip">
            <span>当前范围 <strong>${scopeLabel}</strong></span>
            <span>|</span>
            <span>统计周期 <strong>${ymLabel}</strong></span>
            <span>|</span>
            <span>归集报表 <strong>${filteredReports.length} 份</strong></span>
            <span>|</span>
            <span>数据截止 <strong>${dueStr}</strong></span>
          </div>
        </div>

        <!-- 2-Column Report Layout -->
        <div class="m02-report-grid">
          <div class="m02-report-left">
            <!-- 工区报表汇总 -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">工区报表汇总</span>
                </div>
              </div>
              <div class="panel-body m02-table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>所属工区</th>
                      <th>统计周期</th>
                      <th>报表名称</th>
                      <th>数据截止日期</th>
                      <th>更新时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody id="m02RpSummaryBody">
                    ${filteredReports.length ? filteredReports.map(r => `
                      <tr class="m02-row-clickable ${r.secId === selReport.secId ? 'm02-row-selected' : ''}" data-rep-sec="${r.secId}">
                        <td style="font-weight:700;color:#fff;">${r.secName}</td>
                        <td>${r.period}</td>
                        <td>${r.name}</td>
                        <td style="font-variant-numeric:tabular-nums;">${r.due}</td>
                        <td style="font-variant-numeric:tabular-nums;">${r.updated}</td>
                        <td><button class="m02-action-link" data-rep-sec="${r.secId}">查看报表</button></td>
                      </tr>
                    `).join('') : `<tr><td colspan="6" style="text-align:center;color:var(--text-sub);padding:18px;">未检索到匹配的进度报表</td></tr>`}
                  </tbody>
                </table>
                <div class="m02-panel-footer">
                  <span></span>
                  <span>共 ${filteredReports.length} 份报表</span>
                </div>
              </div>
            </div>

            <!-- 报表内容 -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">报表内容 · ${selReport.secName} / ${selReport.period}</span>
                </div>
                <span style="font-size:11.5px;color:var(--text-sub);">数据来源 &nbsp;<strong style="color:#eaf4ff;">${selReport.source}</strong></span>
              </div>
              <div class="panel-body m02-table-wrap">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>工程对象</th>
                      <th>工程类别</th>
                      <th>分项指标</th>
                      <th>计量单位</th>
                      <th>总工程量</th>
                      <th>本期完成量</th>
                      <th>累计完成量</th>
                      <th style="min-width:130px;">完成比例</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody id="m02RpContentBody">
                    ${items.map((it, idx) => `
                      <tr>
                        <td style="font-weight:700;color:#fff;">${it.obj}</td>
                        <td>${it.cat}</td>
                        <td>${it.item}</td>
                        <td>${it.unit}</td>
                        <td style="font-variant-numeric:tabular-nums;">${it.total}</td>
                        <td style="font-variant-numeric:tabular-nums;">${it.cur}</td>
                        <td style="font-variant-numeric:tabular-nums;">${it.cum}</td>
                        <td>
                          <div class="m02-mini-bar">
                            <div class="m02-mini-track"><div class="m02-mini-fill" style="width:${it.pct}%"></div></div>
                            <span class="m02-mini-val">${it.pct.toFixed(1)}%</span>
                          </div>
                        </td>
                        <td><button class="m02-action-link" data-item-idx="${idx}">查看明细</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
                <div class="m02-panel-footer">
                  <span>ⓘ 统计口径 &nbsp;相同工程指标和计量单位分别汇总</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: 选中报表概要 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">选中报表概要</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m02-kv-list">
                <div class="m02-kv-row">
                  <span class="m02-kv-k">${getIcon(icons, 'doc')}报表名称</span>
                  <span class="m02-kv-v">${selReport.name}</span>
                </div>
                <div class="m02-kv-row">
                  <span class="m02-kv-k">${getIcon(icons, 'layers')}所属工区</span>
                  <span class="m02-kv-v">${selReport.secName}</span>
                </div>
                <div class="m02-kv-row">
                  <span class="m02-kv-k">${getIcon(icons, 'calendar')}统计周期</span>
                  <span class="m02-kv-v">${selReport.period}</span>
                </div>
                <div class="m02-kv-row">
                  <span class="m02-kv-k">${getIcon(icons, 'flag')}数据截止</span>
                  <span class="m02-kv-v">${selReport.due}</span>
                </div>
                <div class="m02-kv-row" style="border-bottom:none;">
                  <span class="m02-kv-k">${getIcon(icons, 'doc')}数据来源</span>
                  <span class="m02-kv-v">${selReport.source}</span>
                </div>
              </div>
              <button class="btn-primary-glow" id="m02RpViewOriginBtn">
                ${getIcon(icons, 'doc')}<span>查看报表原件</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events
    hostEl.querySelector('#m02RpSecSelect').addEventListener('change', e => { ui.rpSecId = e.target.value; });
    hostEl.querySelector('#m02RpYearSelect').addEventListener('change', e => { ui.rpYear = e.target.value; });
    hostEl.querySelector('#m02RpMonthSelect').addEventListener('change', e => { ui.rpMonth = e.target.value; });
    hostEl.querySelector('#m02RpKwInput').addEventListener('input', e => { ui.rpKeyword = e.target.value; });

    const applySearch = () => {
      ui.rpAppliedSecId = ui.rpSecId;
      ui.rpAppliedYear = ui.rpYear;
      ui.rpAppliedMonth = ui.rpMonth;
      ui.rpAppliedKeyword = ui.rpKeyword;
      renderReport(hostEl, ctx);
    };
    hostEl.querySelector('#m02RpSearchBtn').addEventListener('click', applySearch);
    hostEl.querySelector('#m02RpKwInput').addEventListener('keydown', e => {
      if (e.key === 'Enter') applySearch();
    });
    hostEl.querySelector('#m02RpResetBtn').addEventListener('click', () => {
      ui.rpSecId = 'all'; ui.rpYear = '2026'; ui.rpMonth = '11'; ui.rpKeyword = '';
      applySearch();
      ctx.showToast('已重置进度报表筛选条件');
    });

    hostEl.querySelectorAll('#m02RpSummaryBody [data-rep-sec]').forEach(el => {
      el.addEventListener('click', () => {
        ui.rpSelectedSecId = el.dataset.repSec;
        renderReport(hostEl, ctx);
      });
    });

    hostEl.querySelectorAll('#m02RpContentBody [data-item-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        const it = items[Number(btn.dataset.itemIdx)];
        if (!it) return;
        ctx.openModal(`分项报表核验明细 · ${it.obj}`, `
          <div class="detail-grid">
            <div class="detail-stat-card"><span>所属工区 / 类别</span><strong>${selReport.secName} · ${it.cat}</strong></div>
            <div class="detail-stat-card"><span>本期完成量</span><strong>${it.cur} ${it.unit}</strong></div>
            <div class="detail-stat-card"><span>累计完成比例</span><strong>${it.pct.toFixed(1)}%</strong></div>
          </div>
          <table class="data-table">
            <thead><tr><th>细目编号</th><th>工程部位 / 施工内容</th><th>计量单位</th><th>本期核定</th><th>监理复核</th></tr></thead>
            <tbody>
              <tr><td>FM-${selReport.secId.toUpperCase()}-01</td><td>${it.item}（主线左幅）</td><td>${it.unit}</td><td>${(parseFloat(String(it.cur).replace(/,/g, '')) * 0.52).toFixed(1)}</td><td><span class="status-tag ok">已签认</span></td></tr>
              <tr><td>FM-${selReport.secId.toUpperCase()}-02</td><td>${it.item}（主线右幅）</td><td>${it.unit}</td><td>${(parseFloat(String(it.cur).replace(/,/g, '')) * 0.48).toFixed(1)}</td><td><span class="status-tag ok">已签认</span></td></tr>
            </tbody>
          </table>
        `);
      });
    });

    hostEl.querySelector('#m02RpViewOriginBtn').addEventListener('click', () => {
      ctx.openModal(`正式进度月报原件 · ${selReport.source}`, `
        <div style="padding:12px 14px;border-radius:8px;background:rgba(12,42,92,0.55);border:1px solid rgba(56,189,248,0.3);display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#fff;">G1211吉黑高速明水至北安段 ${selReport.source}</div>
            <div style="font-size:12px;color:#bae6fd;margin-top:3px;">文件编号：JHGS-${selReport.secId.toUpperCase()}-${ui.rpAppliedYear}${ui.rpAppliedMonth} &nbsp;|&nbsp; 统计截止：${selReport.due}</div>
          </div>
          <span class="status-tag ok">总监办已归档签认</span>
        </div>
        <table class="data-table">
          <thead><tr><th>工程对象</th><th>工程类别</th><th>分项指标</th><th>总工程量</th><th>本期完成</th><th>累计完成</th><th>比例</th></tr></thead>
          <tbody>
            ${items.map(it => `
              <tr>
                <td>${it.obj}</td><td>${it.cat}</td><td>${it.item}</td>
                <td>${it.total} ${it.unit}</td><td>${it.cur}</td><td>${it.cum}</td>
                <td style="color:#38f2ff;font-weight:700;">${it.pct.toFixed(1)}%</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#a9c6e8;">
          <span>编制：${selReport.secName}工程部 &nbsp;|&nbsp; 复核：驻地监理办 &nbsp;|&nbsp; 签发日期：${selReport.updated}</span>
          <button class="dock-btn primary" id="m02ExportOriginBtn">导出 PDF 归档件</button>
        </div>
      `);
      setTimeout(() => {
        const expBtn = document.getElementById('m02ExportOriginBtn');
        if (expBtn) expBtn.addEventListener('click', () => ctx.showToast(`已生成《${selReport.source}.pdf》下载任务（演示）`));
      }, 0);
    });
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 3: 03_计划与节点
     ------------------------------------------------------------------------ */
  function renderPlan(hostEl, ctx) {
    const { data, icons } = ctx;
    const workSections = data.workSections || [];

    const filteredTasks = GANTT_TASKS.filter(t => {
      if (ui.plTreeCat !== 'all' && t.cat !== ui.plTreeCat) return false;
      if (ui.plAppliedSecId !== 'all' && t.secId !== ui.plAppliedSecId) return false;
      if (ui.plAppliedKeyword.trim()) {
        const kw = ui.plAppliedKeyword.trim().toLowerCase();
        if (!t.name.toLowerCase().includes(kw) && !t.cat.toLowerCase().includes(kw)) return false;
      }
      return true;
    });
    const displayTasks = filteredTasks.length ? filteredTasks : GANTT_TASKS;

    const filteredNodes = PLAN_NODES.filter(n => {
      if (ui.plAppliedSecId !== 'all' && n.secId !== ui.plAppliedSecId) return false;
      if (ui.plAppliedKeyword.trim()) {
        const kw = ui.plAppliedKeyword.trim().toLowerCase();
        if (!n.title.toLowerCase().includes(kw) && !n.obj.toLowerCase().includes(kw) && !n.task.toLowerCase().includes(kw)) return false;
      }
      return true;
    });

    const assocNodes = PLAN_NODES.filter(n => n.id === 'n2' || n.id === 'n3' || n.id === 'n4' || (ui.plTreeCat !== 'all' && n.cat === ui.plTreeCat));
    const uniqueAssoc = [];
    const seen = new Set();
    assocNodes.forEach(n => {
      if (!seen.has(n.id)) {
        seen.add(n.id);
        uniqueAssoc.push(n);
      }
    });

    const shortListNodes = PLAN_NODES.filter(n => n.inShortList);
    const activeNode = PLAN_NODES.find(n => n.id === ui.plSelectedNodeId) || PLAN_NODES[3];

    // KPI metrics adjusted subtly when section filtered
    const secFilterFactor = ui.plAppliedSecId === 'all' ? 1 : 0.25;
    const totalNodesCount = ui.plAppliedSecId === 'all' ? 18 : 5;
    const monthTodoCount = ui.plAppliedSecId === 'all' ? 4 : Math.max(1, Math.round(4 * secFilterFactor));
    const expiringCount = ui.plAppliedSecId === 'all' ? 3 : 1;

    const ganttSvg = buildPlanGanttSvg(displayTasks);

    hostEl.innerHTML = `
      <div class="m02-page m02-plan-page">
        <!-- Top Filter Bar -->
        <div class="m02-filter-bar">
          <div class="m02-filter-row">
            <div class="m02-filter-left">
              <span class="m02-filter-label">所属工区</span>
              <select class="glass-select" id="m02PlSecSelect" style="flex:0 0 115px;">
                <option value="all" ${ui.plSecId === 'all' ? 'selected' : ''}>全线</option>
                ${workSections.map(s => `<option value="${s.id}" ${ui.plSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
              <span class="m02-filter-label">计划层级</span>
              <select class="glass-select" id="m02PlLevelSelect" style="flex:0 0 128px;">
                <option value="total" ${ui.plLevel === 'total' ? 'selected' : ''}>总体计划</option>
                <option value="year" ${ui.plLevel === 'year' ? 'selected' : ''}>年度阶段计划</option>
                <option value="month" ${ui.plLevel === 'month' ? 'selected' : ''}>月度滚动计划</option>
              </select>
              <span class="m02-filter-label">时间范围</span>
              <select class="glass-select" id="m02PlRangeSelect" style="flex:0 0 120px;">
                <option value="2026" ${ui.plRange === '2026' ? 'selected' : ''}>2026年</option>
                <option value="2026-2027" ${ui.plRange === '2026-2027' ? 'selected' : ''}>2026—2027年</option>
              </select>
              <input class="m02-input" id="m02PlKwInput" type="text" placeholder="工程对象 / 关键词搜索" value="${ui.plKeyword}" />
            </div>
            <div class="m02-filter-right">
              <button class="dock-btn primary" id="m02PlSearchBtn" style="padding:6px 18px;">🔍 查询</button>
              <button class="dock-btn" id="m02PlResetBtn" style="padding:6px 14px;">↻ 重置</button>
            </div>
          </div>
        </div>

        <!-- 4 KPI Cards -->
        <div class="m02-plan-kpi-4">
          <div class="m02-plan-kpi-card">${getIcon(icons, 'calendar')}<span>关键节点总数</span><strong>${totalNodesCount}</strong></div>
          <div class="m02-plan-kpi-card">${getIcon(icons, 'doc')}<span>本月待完成</span><strong>${monthTodoCount}</strong></div>
          <div class="m02-plan-kpi-card">${getIcon(icons, 'alert')}<span>即将到期</span><strong>${expiringCount}</strong></div>
          <div class="m02-plan-kpi-card">${getIcon(icons, 'flag')}<span>当前阶段</span><strong style="font-size:16px;">施工高峰期</strong></div>
        </div>

        <!-- 3-Column Main Grid -->
        <div class="m02-plan-grid">
          <!-- Left Column: 计划结构 + 计划说明 -->
          <div class="m02-plan-col">
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">计划结构</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="m02-tree-list" id="m02PlTree">
                  <div class="m02-tree-root ${ui.plTreeCat === 'all' ? 'active' : ''}" data-tree-cat="all">
                    <span>▾</span><span>📁</span><span>总体计划</span>
                  </div>
                  ${CATEGORIES.map(c => `
                    <button class="m02-tree-item ${ui.plTreeCat === c.name ? 'active' : ''}" data-tree-cat="${c.name}">
                      ${getIcon(icons, c.icon)}<span>${c.name}</span>
                    </button>
                  `).join('')}
                </div>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">计划说明</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="m02-note-list">
                  <div>• <strong>总体计划</strong> 2026年3月—2027年5月，统筹路基、桥梁、路面等各专业工程。</div>
                  <div>• <strong>阶段目标</strong> 2026年12月底前完成桥梁主体及路面基层施工，为2027年上半年路面贯通创造条件。</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Center Column: Gantt + Key Milestones + Associated Engineering -->
          <div class="m02-plan-col">
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">总体计划与阶段计划</span>
                </div>
                <span style="font-size:11.5px;color:var(--text-sub);">${ui.plAppliedLevel === 'month' ? '月度滚动计划' : ui.plAppliedLevel === 'year' ? '年度阶段计划' : '总体计划'} · ${ui.plRange === '2026-2027' ? '2026—2027年' : '2026年'} · ${ui.plTreeCat === 'all' ? '全专业' : ui.plTreeCat}</span>
              </div>
              <div class="panel-body">
                <div class="m02-gantt-wrap" id="m02PlGanttHost">${ganttSvg}</div>
                <div class="m02-gantt-legend">
                  <span class="m02-legend-item"><span style="width:14px;height:6px;border-radius:3px;background:#1e3a6e;display:inline-block;"></span>计划工期</span>
                  <span class="m02-legend-item"><span style="width:14px;height:6px;border-radius:3px;background:#22d3ee;display:inline-block;"></span>实际进度</span>
                  <span class="m02-legend-item"><span style="width:9px;height:9px;transform:rotate(45deg);background:#facc15;display:inline-block;"></span>关键节点</span>
                  <span class="m02-legend-item"><span style="width:14px;border-top:2px dashed #38f2ff;display:inline-block;"></span>当前进度线 (2026-09-28)</span>
                </div>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">关键建设节点</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="m02-ms-stepper" id="m02PlStepper">
                  <div class="m02-ms-line"></div>
                  ${['n1', 'n2', 'n3', 'n4', 'n7'].map(nid => {
                    const node = PLAN_NODES.find(x => x.id === nid);
                    const done = node.status === '已完成';
                    const active = activeNode.id === node.id;
                    return `
                      <button class="m02-ms-step ${done ? 'done' : ''} ${active ? 'active' : ''}" data-node-id="${node.id}">
                        <div class="m02-ms-box">
                          <div class="m02-ms-title">${node.title}</div>
                          <div class="m02-ms-date">${node.date}</div>
                        </div>
                        <div class="m02-ms-dot">${done ? '✓' : ''}</div>
                      </button>
                    `;
                  }).join('')}
                </div>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">节点关联工程</span>
                </div>
              </div>
              <div class="panel-body m02-table-wrap">
                <table class="data-table m02-assoc-table">
                  <thead>
                    <tr><th>序号</th><th>节点名称</th><th>关联工程</th><th>责任专业</th><th>计划日期</th><th>状态</th></tr>
                  </thead>
                  <tbody id="m02PlAssocBody">
                    ${uniqueAssoc.slice(0, 4).map((n, idx) => `
                      <tr class="m02-row-clickable ${n.id === activeNode.id ? 'm02-row-selected' : ''}" data-node-id="${n.id}">
                        <td>${idx + 1}</td>
                        <td style="font-weight:700;color:#fff;">${n.title}</td>
                        <td>${n.task}</td>
                        <td>${n.spec}</td>
                        <td style="font-variant-numeric:tabular-nums;">${n.date}</td>
                        <td><span class="status-tag ${n.statusCls}">${n.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Column: 节点清单 + 节点详情 -->
          <div class="m02-plan-col">
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">节点清单</span>
                  <span class="panel-subtitle">(近期关键节点)</span>
                </div>
              </div>
              <div class="panel-body m02-table-wrap">
                <table class="data-table m02-node-table">
                  <thead>
                    <tr><th>序号</th><th>节点名称</th><th>计划日期</th><th>状态</th></tr>
                  </thead>
                  <tbody id="m02PlNodeListBody">
                    ${(filteredNodes.length ? shortListNodes.filter(n => filteredNodes.some(f => f.id === n.id) || ui.plAppliedSecId === 'all') : shortListNodes).map((n, idx) => `
                      <tr class="m02-row-clickable ${n.id === activeNode.id ? 'm02-row-selected' : ''}" data-node-id="${n.id}">
                        <td>${n.listIdx || idx + 1}</td>
                        <td style="font-weight:700;color:#fff;">${n.title}</td>
                        <td style="font-variant-numeric:tabular-nums;font-size:11.5px;">${n.date}</td>
                        <td><span class="status-tag ${n.statusCls}">${n.status}</span></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">节点详情</span>
                </div>
              </div>
              <div class="panel-body">
                <div style="display:flex;align-items:center;gap:8px;font-size:16px;font-weight:800;color:#fff;margin-bottom:12px;">
                  ${getIcon(icons, 'bridge')}<span>${activeNode.title}</span>
                </div>
                <div class="m02-kv-list">
                  <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'layers')}所属工区</span><span class="m02-kv-v">${activeNode.secName}</span></div>
                  <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'bridge')}工程对象</span><span class="m02-kv-v">${activeNode.obj}</span></div>
                  <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'calendar')}计划日期</span><span class="m02-kv-v">${activeNode.date}</span></div>
                  <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'doc')}关联工程</span><span class="m02-kv-v">${activeNode.task}</span></div>
                  <div class="m02-kv-row" style="border-bottom:none;"><span class="m02-kv-k">${getIcon(icons, 'flag')}当前状态</span><span class="status-tag ${activeNode.statusCls}">${activeNode.status}</span></div>
                </div>
                <button class="btn-primary-glow" id="m02PlViewObjBtn">
                  <span>🔗 查看关联工程</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events
    hostEl.querySelector('#m02PlSecSelect').addEventListener('change', e => { ui.plSecId = e.target.value; });
    hostEl.querySelector('#m02PlLevelSelect').addEventListener('change', e => { ui.plLevel = e.target.value; });
    hostEl.querySelector('#m02PlRangeSelect').addEventListener('change', e => { ui.plRange = e.target.value; });
    hostEl.querySelector('#m02PlKwInput').addEventListener('input', e => { ui.plKeyword = e.target.value; });

    const applyPlanFilter = () => {
      ui.plAppliedSecId = ui.plSecId;
      ui.plAppliedLevel = ui.plLevel;
      ui.plAppliedKeyword = ui.plKeyword;
      renderPlan(hostEl, ctx);
    };
    hostEl.querySelector('#m02PlSearchBtn').addEventListener('click', applyPlanFilter);
    hostEl.querySelector('#m02PlKwInput').addEventListener('keydown', e => { if (e.key === 'Enter') applyPlanFilter(); });
    hostEl.querySelector('#m02PlResetBtn').addEventListener('click', () => {
      ui.plSecId = 'all'; ui.plLevel = 'total'; ui.plRange = '2026'; ui.plKeyword = ''; ui.plTreeCat = 'all';
      applyPlanFilter();
    });

    hostEl.querySelectorAll('#m02PlTree [data-tree-cat]').forEach(el => {
      el.addEventListener('click', () => {
        ui.plTreeCat = el.dataset.treeCat;
        renderPlan(hostEl, ctx);
      });
    });

    hostEl.querySelectorAll('[data-node-id]').forEach(el => {
      el.addEventListener('click', () => {
        ui.plSelectedNodeId = el.dataset.nodeId;
        renderPlan(hostEl, ctx);
      });
    });

    hostEl.querySelectorAll('#m02PlGanttHost [data-task-id]').forEach(el => {
      el.addEventListener('click', () => {
        const t = GANTT_TASKS.find(x => x.id === el.dataset.taskId);
        if (!t) return;
        ctx.openModal(`计划任务详情 · ${t.name}`, `
          <div class="detail-grid">
            <div class="detail-stat-card"><span>专业分类</span><strong>${t.cat}</strong></div>
            <div class="detail-stat-card"><span>计划周期</span><strong>2026-${String(Math.floor(t.startM) + 3).padStart(2, '0')} ~ 2026-${String(Math.min(12, Math.ceil(t.endM) + 3)).padStart(2, '0')}</strong></div>
            <div class="detail-stat-card"><span>当前状态</span><strong>${t.status}</strong></div>
          </div>
          <p style="color:#dbeafe;line-height:1.6;">该工序任务受控推进，已关联至工区月度计划与关键里程碑节点控制线。</p>
        `);
      });
    });

    hostEl.querySelector('#m02PlViewObjBtn').addEventListener('click', () => {
      ctx.openModal(`节点关联工程 · ${activeNode.obj}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>所属工区</span><strong>${activeNode.secName}</strong></div>
          <div class="detail-stat-card"><span>计划日期</span><strong>${activeNode.date}</strong></div>
          <div class="detail-stat-card"><span>节点状态</span><strong>${activeNode.status}</strong></div>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">节点名称</th><td>${activeNode.title}</td><th style="width:120px;">关联工程任务</th><td>${activeNode.task}</td></tr>
            <tr><th>责任专业</th><td>${activeNode.spec}</td><th>管控层级</th><td>总体控制性节点</td></tr>
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="dock-btn primary" id="m02PlJumpBimBtn">在 BIM 进度模拟中演练</button>
        </div>
      `);
      setTimeout(() => {
        const jumpBtn = document.getElementById('m02PlJumpBimBtn');
        if (jumpBtn) jumpBtn.addEventListener('click', () => {
          ui.bimSecId = activeNode.secId || 'sec2';
          ui.bimObjId = 'bridgeA';
          ctx.closeModal();
          ctx.switchModule('progress', 'bim_a');
        });
      }, 0);
    });
  }

  function buildPlanGanttSvg(tasks) {
    const months = ['2026-03', '2026-04', '2026-05', '2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11', '2026-12'];
    const W = 920;
    const rowH = 22;
    const padL = 118;
    const padR = 16;
    const padT = 54;
    const padB = 8;
    const H = padT + tasks.length * rowH + padB;
    const plotW = W - padL - padR;
    const colW = plotW / months.length;
    const progressX = padL + 6.9 * colW; // 2026-09-28

    const colLines = months.map((m, i) => {
      const x = padL + i * colW;
      return `
        <line x1="${x.toFixed(1)}" y1="${padT - 5}" x2="${x.toFixed(1)}" y2="${H - 4}" stroke="rgba(125,211,252,0.14)"/>
        <text x="${(x + colW / 2).toFixed(1)}" y="${padT - 11}" fill="#cfe4ff" font-size="11.5" font-weight="600" text-anchor="middle">${m}</text>
      `;
    }).join('');

    const rowsHtml = tasks.map((t, i) => {
      const cy = padT + i * rowH + rowH / 2;
      const x1 = padL + t.startM * colW;
      const x2 = padL + t.endM * colW;
      const ax2 = padL + t.actualM * colW;
      const planW = Math.max(12, x2 - x1);
      const actW = Math.max(8, ax2 - x1);
      const diamond = t.milestoneM !== null
        ? `<polygon points="${(padL + t.milestoneM * colW).toFixed(1)},${cy - 5} ${(padL + t.milestoneM * colW + 5).toFixed(1)},${cy} ${(padL + t.milestoneM * colW).toFixed(1)},${cy + 5} ${(padL + t.milestoneM * colW - 5).toFixed(1)},${cy}" fill="#facc15" stroke="#fff" stroke-width="0.8"/>`
        : '';
      return `
        <g data-task-id="${t.id}" style="cursor:pointer;">
          <line x1="0" y1="${padT + (i + 1) * rowH}" x2="${W}" y2="${padT + (i + 1) * rowH}" stroke="rgba(56,189,248,0.12)"/>
          <text x="8" y="${cy + 4}" fill="#eaf4ff" font-size="12" font-weight="600">${t.name}</text>
          <rect x="${x1.toFixed(1)}" y="${cy - 4.5}" width="${planW.toFixed(1)}" height="9" rx="4.5" fill="rgba(30, 64, 124, 0.85)" stroke="rgba(56,189,248,0.3)"/>
          <rect x="${x1.toFixed(1)}" y="${cy - 4.5}" width="${actW.toFixed(1)}" height="9" rx="4.5" fill="url(#m02-ganttGrad)"/>
          ${diamond}
        </g>
      `;
    }).join('');

    return `
      <svg class="m02-gantt-svg" viewBox="0 0 ${W} ${H}">
        <defs>
          <linearGradient id="m02-ganttGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0ea5e9"/>
            <stop offset="100%" stop-color="#38f2ff"/>
          </linearGradient>
        </defs>
        <text x="8" y="${padT - 11}" fill="#93c5fd" font-size="11.5" font-weight="700">工程任务</text>
        ${colLines}
        <line x1="${W - padR}" y1="${padT - 5}" x2="${W - padR}" y2="${H - 4}" stroke="rgba(125,211,252,0.14)"/>
        ${rowsHtml}
        <!-- Current progress vertical line -->
        <line x1="${progressX.toFixed(1)}" y1="${padT - 5}" x2="${progressX.toFixed(1)}" y2="${H - 4}" stroke="#38f2ff" stroke-width="1.4" stroke-dasharray="4 3"/>
        <rect x="${(progressX - 42).toFixed(1)}" y="2" width="84" height="17" rx="8.5" fill="rgba(10,42,92,0.96)" stroke="#38f2ff" stroke-width="1"/>
        <text x="${progressX.toFixed(1)}" y="14" fill="#ffffff" font-size="11" font-weight="700" text-anchor="middle">2026-09-28</text>
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGES 4 & 5: 04_BIM进度模拟_方案A & 05_BIM进度模拟_方案B
     ------------------------------------------------------------------------ */
  function syncCesiumForBim(ctx, isSchemeB, simObj, simDate) {
    const ces = ctx.cesium;
    if (!ces || !ces.ready) return;

    const useDesign = ui.bimForceDesignBase !== null ? ui.bimForceDesignBase : isSchemeB;
    const sig = `${useDesign ? 'D' : 'R'}|${simObj.secId}|${simObj.poiId}`;
    if (sig !== lastCesiumBimSig) {
      lastCesiumBimSig = sig;
      ces.applyLayers({
        satellite: false,
        uav: !useDesign,
        bim: true,
        pois: true,
        sections: true,
        route: true,
        designMode: useDesign,
        activeSectionId: simObj.secId
      });

      ces.syncHtmlOverlays({
        showRoute: true,
        showSections: true,
        showPois: true,
        activeSectionId: simObj.secId,
        activePoiId: simObj.poiId,
        poiObjects: ctx.data.poiObjects,
        icons: ctx.icons,
        showViewpoint: false
      });
    }

    // Save original materials once before dynamic recoloring
    if (!savedBimStyles && ces.bimEntities && ces.bimEntities.length && window.Cesium) {
      savedBimStyles = ces.bimEntities.map(ent => ({
        boxMat: ent.box ? ent.box.material : null,
        boxOut: ent.box ? ent.box.outlineColor : null,
        cylMat: ent.cylinder ? ent.cylinder.material : null,
        cylOut: ent.cylinder ? ent.cylinder.outlineColor : null
      }));
    }

    // Color Cesium 3D BIM entities dynamically according to simulation task phases
    if (window.Cesium && ces.bimEntities && ces.bimEntities.length) {
      const doneFill = Cesium.Color.fromCssColorString('#1b88ff').withAlpha(0.72);
      const doneOut = Cesium.Color.fromCssColorString('#38f2ff');
      const doingFill = Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.84);
      const doingOut = Cesium.Color.fromCssColorString('#fde047');
      const todoFill = Cesium.Color.fromCssColorString('#64748b').withAlpha(0.45);
      const todoOut = Cesium.Color.fromCssColorString('#cbd5e1');

      const t2State = getTaskStateAtDate(simObj.tasks[1], simDate); // piers / foundation
      const t3State = getTaskStateAtDate(simObj.tasks[2], simDate); // substructure / mid
      const t4State = getTaskStateAtDate(simObj.tasks[3], simDate); // deck / gantry / late

      const pickStyle = st => st === 'done' ? [doneFill, doneOut] : st === 'doing' ? [doingFill, doingOut] : [todoFill, todoOut];

      ces.bimEntities.forEach((ent, idx) => {
        let st = t4State;
        if (idx >= 1 && idx <= 5) st = idx <= 3 ? t2State : t3State; // piers
        else if (idx === 0) st = t4State; // bridge deck
        else if (idx === 6 || idx === 8 || idx === 9) st = t3State; // yard pad / silos
        else st = t4State;

        const [fill, out] = pickStyle(st);
        if (ent.box) {
          ent.box.material = fill;
          ent.box.outlineColor = out;
        }
        if (ent.cylinder) {
          ent.cylinder.material = fill;
          ent.cylinder.outlineColor = out;
        }
      });
    }
  }

  function renderBimSim(hostEl, ctx, isSchemeB) {
    const { data, icons } = ctx;
    const workSections = data.workSections || [];
    const simObj = BIM_OBJECTS.find(b => b.id === ui.bimObjId) || BIM_OBJECTS[0];
    const simDate = pctToSimDate(simObj.start, simObj.end, ui.bimProgress);

    // Determine task statuses at simDate
    const tasksWithState = simObj.tasks.map(t => ({
      ...t,
      simState: getTaskStateAtDate(t, simDate)
    }));
    let activeTask = tasksWithState.find(t => t.id === ui.bimSelectedTaskId);
    if (!activeTask) {
      activeTask = tasksWithState.find(t => t.simState === 'doing') || tasksWithState[tasksWithState.length - 1];
      ui.bimSelectedTaskId = activeTask.id;
    }

    const activeStateLabel = activeTask.simState === 'done' ? '计划已完成' : activeTask.simState === 'doing' ? '计划施工中' : '计划未开始';
    const activeStateBadgeCls = activeTask.simState === 'done' ? 'm02-badge-done' : activeTask.simState === 'doing' ? 'm02-badge-doing' : 'm02-badge-todo';

    // Task progress percentage
    const taskPct = activeTask.simState === 'done'
      ? 100
      : activeTask.simState === 'todo'
        ? 0
        : simDateToPct(activeTask.start, activeTask.end, simDate);

    // Sync Cesium 3D scene
    syncCesiumForBim(ctx, isSchemeB, simObj, simDate);

    const presetDates = ['2026-06-15', '2026-07-20', '2026-08-10', '2026-09-25', '2026-10-20', '2026-11-25', '2026-12-15'];
    const hasExactPreset = presetDates.includes(simDate);

    // Only fly Cesium when entering BIM subpage or changing object explicitly (done in event handlers / subPage transition)
    const legendLabels = isSchemeB
      ? ['计划已完成', '计划施工中', '计划未开始']
      : ['计划已完成（基础、墩柱、盖梁）', '计划施工中（正在架设的梁板）', '计划未开始（后续桥面及附属）'];

    hostEl.innerHTML = `
      <div class="m02-bim-stage">
        <!-- Top Center Title Banner -->
        <div class="m02-bim-banner" id="m02BimBannerBtn" title="点击切换三维构件剖面透视窗">
          <span class="m02-bim-banner-main">计划模拟 · 演示</span>
          <span class="m02-bim-banner-sub">${isSchemeB ? '模型示意 · 方案B' : '模型示意'}</span>
        </div>

        ${ui.bimShowInspector ? buildBimInspectorCard(simObj, tasksWithState, simDate, ui.bimProgress) : `
          <div class="m02-bim-hud-chip">
            <span>当前推进：<strong>${simObj.name} · ${activeTask.name}</strong></span>
            <span>|</span>
            <span>模拟日期 <strong style="color:#38f2ff;">${simDate}</strong></span>
            <span>|</span>
            <button class="m02-action-link" id="m02BimOpenInsp" style="padding:0;">展开三维构件推演窗 ▾</button>
          </div>
        `}

        <!-- Left HUD Column -->
        <div class="hud-left-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">模拟范围</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="form-row">
                <label>所属工区</label>
                <select class="glass-select" id="m02BimSecSelect">
                  ${workSections.map(s => `<option value="${s.id}" ${ui.bimSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
                </select>
              </div>
              <div class="form-row" style="margin-bottom:0;">
                <label>工程对象</label>
                <select class="glass-select" id="m02BimObjSelect">
                  ${BIM_OBJECTS.map(o => `<option value="${o.id}" ${simObj.id === o.id ? 'selected' : ''}>${o.name}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">计划任务</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m02-task-list" id="m02BimTaskList">
                ${tasksWithState.map(t => {
                  const stLabel = t.simState === 'done' ? '✓ 计划已完成' : t.simState === 'doing' ? '▶ 计划施工中' : '○ 计划未开始';
                  const stCls = t.simState === 'done' ? 'm02-badge-done' : t.simState === 'doing' ? 'm02-badge-doing' : 'm02-badge-todo';
                  return `
                    <div class="m02-task-row ${t.id === activeTask.id ? 'active' : ''}" data-btask-id="${t.id}">
                      <span class="m02-task-name">${getIcon(icons, t.icon)}<span>${t.name}</span></span>
                      <span class="${stCls}">${stLabel}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">关联计划</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m02-kv-list" style="margin-bottom:0;gap:6px;">
                <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'layers')}${simObj.planName}</span></div>
                <div class="m02-kv-row"><span class="m02-kv-k">${getIcon(icons, 'doc')}计划版本</span><span class="m02-kv-v">${simObj.planVer}</span></div>
                <div class="m02-kv-row" style="border-bottom:none;padding-bottom:0;">
                  <span class="m02-kv-k">${getIcon(icons, 'calendar')}计划周期</span>
                  <span class="m02-kv-v" style="font-size:11px;white-space:nowrap;">${simObj.start} 至 ${simObj.end}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">模型状态图例</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m02-legend-list">
                <div class="m02-legend-row"><span class="m02-swatch done"></span><span>${legendLabels[0]}</span></div>
                <div class="m02-legend-row"><span class="m02-swatch doing"></span><span>${legendLabels[1]}</span></div>
                <div class="m02-legend-row"><span class="m02-swatch todo"></span><span>${legendLabels[2]}</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right HUD Column -->
        <div class="hud-right-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">模拟任务</span>
              </div>
            </div>
            <div class="panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px;">
                <span style="display:inline-flex;align-items:center;gap:7px;font-size:15.5px;font-weight:800;color:#fff;">
                  ${getIcon(icons, activeTask.icon)}<span>${activeTask.name}</span>
                </span>
                <span class="${activeStateBadgeCls}">${activeStateLabel}</span>
              </div>
              <div class="m02-kv-list" style="margin-bottom:8px;">
                <div class="m02-kv-row"><span class="m02-kv-k">关联工程</span><span class="m02-kv-v">${simObj.name}</span></div>
                <div class="m02-kv-row"><span class="m02-kv-k">所属工区</span><span class="m02-kv-v">${simObj.secName}</span></div>
                <div class="m02-kv-row"><span class="m02-kv-k">计划开始</span><span class="m02-kv-v">${activeTask.start}</span></div>
                <div class="m02-kv-row"><span class="m02-kv-k">计划完成</span><span class="m02-kv-v">${activeTask.end}</span></div>
                <div class="m02-kv-row"><span class="m02-kv-k">模拟日期</span><span class="m02-kv-v" style="color:#38f2ff;" id="m02BimRightDate">${simDate}</span></div>
                <div class="m02-kv-row" style="border-bottom:none;"><span class="m02-kv-k">工序进度</span><span class="m02-kv-v">${taskPct.toFixed(1)}%</span></div>
              </div>

              <div class="panel-title-group" style="margin:6px 0 8px;">
                <span class="panel-accent-bar"></span>
                <span class="panel-title" style="font-size:13.5px;">任务与模型关联</span>
              </div>
              <div class="m02-link-card">
                <span>🔗 ${activeTask.name} ↔ ${simObj.name}</span>
                <span class="m02-badge-done">✓ 已关联</span>
              </div>
              <button class="btn-primary-glow" id="m02BimViewPlanBtn">
                <span>↗ 查看关联计划</span>
              </button>
              <button class="link-subtle" id="m02BimLocateBtn">
                <span>定位工程对象</span>${getIcon(icons, 'chevronRight')}
              </button>
            </div>
          </div>
        </div>

        <!-- Bottom Playback Timeline Dock -->
        <div class="m02-bim-dock">
          <div class="m02-bim-dock-top">
            <div class="m02-bim-ctrl-group">
              <span class="m02-filter-label">模拟日期</span>
              <select class="glass-select" id="m02BimDatePreset" style="flex:0 0 128px;">
                ${!hasExactPreset ? `<option value="${simDate}" selected>${simDate}</option>` : ''}
                ${presetDates.slice().reverse().map(d => `<option value="${d}" ${simDate === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="m02-bim-ctrl-group">
              <button class="m02-play-circle" id="m02BimPlayBtn" title="${ui.bimPlaying ? '暂停模拟' : '播放进度模拟'}">
                ${ui.bimPlaying ? getIcon(icons, 'pause') : getIcon(icons, 'play')}
              </button>
              <button class="m02-icon-circle" id="m02BimStepBtn" title="步进下一阶段">${getIcon(icons, 'chevronRight')}</button>
              <select class="speed-select" id="m02BimSpeedSel">
                <option value="0.5" ${ui.bimSpeed === 0.5 ? 'selected' : ''}>0.5×</option>
                <option value="1" ${ui.bimSpeed === 1 ? 'selected' : ''}>1.0×</option>
                <option value="1.5" ${ui.bimSpeed === 1.5 ? 'selected' : ''}>1.5×</option>
                <option value="2" ${ui.bimSpeed === 2 ? 'selected' : ''}>2.0×</option>
              </select>
              <button class="m02-icon-circle" id="m02BimFullBtn" title="全屏">${getIcon(icons, 'fullscreen')}</button>
            </div>
            <div class="m02-bim-ctrl-group">
              <button class="m02-icon-circle" id="m02BimLayerToggle" title="切换实景/精模底图 & 构件透视">${getIcon(icons, 'layers')}</button>
              <button class="m02-icon-circle" id="m02BimZoomOut" title="缩小">−</button>
              <button class="m02-icon-circle" id="m02BimZoomIn" title="放大">+</button>
              <button class="m02-icon-circle" id="m02BimResetBtn" title="重置模拟与视角">↻</button>
            </div>
          </div>

          <div class="m02-timeline-box">
            <div class="m02-timeline-row">
              <span class="m02-timeline-bound">${simObj.start}</span>
              <div class="m02-slider-wrap">
                <div class="m02-date-bubble" id="m02BimBubble" style="left:${Math.max(4, Math.min(96, ui.bimProgress))}%;">${simDate}</div>
                <input class="m02-bim-range" id="m02BimSlider" type="range" min="0" max="100" step="0.5" value="${ui.bimProgress}" />
                <div class="m02-month-ticks">
                  <span>6月</span><span>7月</span><span>8月</span><span>9月</span><span>10月</span><span>11月</span><span>12月</span>
                </div>
              </div>
              <span class="m02-timeline-bound">${simObj.end}</span>
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind BIM events
    hostEl.querySelector('#m02BimBannerBtn').addEventListener('click', () => {
      ui.bimShowInspector = !ui.bimShowInspector;
      renderBimSim(hostEl, ctx, isSchemeB);
    });
    const openInspBtn = hostEl.querySelector('#m02BimOpenInsp');
    if (openInspBtn) {
      openInspBtn.addEventListener('click', () => {
        ui.bimShowInspector = true;
        renderBimSim(hostEl, ctx, isSchemeB);
      });
    }
    const closeInspBtn = hostEl.querySelector('#m02BimCloseInsp');
    if (closeInspBtn) {
      closeInspBtn.addEventListener('click', () => {
        ui.bimShowInspector = false;
        renderBimSim(hostEl, ctx, isSchemeB);
      });
    }

    hostEl.querySelector('#m02BimSecSelect').addEventListener('change', e => {
      ui.bimSecId = e.target.value;
      const matchObj = BIM_OBJECTS.find(o => o.secId === ui.bimSecId);
      if (matchObj) {
        ui.bimObjId = matchObj.id;
        ui.bimSelectedTaskId = matchObj.tasks[3].id;
      }
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToSection(ui.bimSecId);
      renderBimSim(hostEl, ctx, isSchemeB);
      ctx.showToast(`已切换模拟工区：${secNameById(ui.bimSecId, workSections)}`);
    });

    hostEl.querySelector('#m02BimObjSelect').addEventListener('change', e => {
      ui.bimObjId = e.target.value;
      const obj = BIM_OBJECTS.find(o => o.id === ui.bimObjId);
      if (obj) {
        ui.bimSecId = obj.secId;
        ui.bimSelectedTaskId = obj.tasks[3].id;
        if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToPoi(obj.poiId);
      }
      renderBimSim(hostEl, ctx, isSchemeB);
    });

    hostEl.querySelectorAll('#m02BimTaskList [data-btask-id]').forEach(el => {
      el.addEventListener('click', () => {
        const task = simObj.tasks.find(t => t.id === el.dataset.btaskId);
        if (!task) return;
        ui.bimSelectedTaskId = task.id;
        const midMs = (dateToMs(task.start) + dateToMs(task.end)) / 2;
        ui.bimProgress = simDateToPct(simObj.start, simObj.end, msToDate(midMs));
        renderBimSim(hostEl, ctx, isSchemeB);
        ctx.showToast(`已定位模拟工序：${task.name}`);
      });
    });

    hostEl.querySelector('#m02BimDatePreset').addEventListener('change', e => {
      ui.bimProgress = simDateToPct(simObj.start, simObj.end, e.target.value);
      renderBimSim(hostEl, ctx, isSchemeB);
    });

    hostEl.querySelector('#m02BimSlider').addEventListener('input', e => {
      ui.bimProgress = Number(e.target.value);
      renderBimSim(hostEl, ctx, isSchemeB);
    });

    hostEl.querySelector('#m02BimPlayBtn').addEventListener('click', () => {
      ui.bimPlaying = !ui.bimPlaying;
      if (ui.bimPlaying && ui.bimProgress >= 99.5) ui.bimProgress = 0;
      ensureSimTimer(hostEl, ctx, isSchemeB);
      renderBimSim(hostEl, ctx, isSchemeB);
    });

    hostEl.querySelector('#m02BimStepBtn').addEventListener('click', () => {
      ui.bimProgress = Math.min(100, +(ui.bimProgress + 12.5).toFixed(1));
      renderBimSim(hostEl, ctx, isSchemeB);
    });

    hostEl.querySelector('#m02BimSpeedSel').addEventListener('change', e => {
      ui.bimSpeed = Number(e.target.value);
      ctx.showToast(`BIM模拟倍速：${ui.bimSpeed}×`);
    });

    hostEl.querySelector('#m02BimFullBtn').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen?.().catch(() => {});
      } else {
        document.exitFullscreen?.();
      }
    });

    hostEl.querySelector('#m02BimLayerToggle').addEventListener('click', () => {
      const cur = ui.bimForceDesignBase !== null ? ui.bimForceDesignBase : isSchemeB;
      ui.bimForceDesignBase = !cur;
      ui.bimShowInspector = true;
      renderBimSim(hostEl, ctx, isSchemeB);
      ctx.showToast(ui.bimForceDesignBase ? '已切换：暗色数字孪生BIM精模底图' : '已切换：高清实景三维联动底图');
    });

    hostEl.querySelector('#m02BimZoomIn').addEventListener('click', () => {
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.zoomIn();
    });
    hostEl.querySelector('#m02BimZoomOut').addEventListener('click', () => {
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.zoomOut();
    });
    hostEl.querySelector('#m02BimResetBtn').addEventListener('click', () => {
      ui.bimPlaying = false;
      ui.bimProgress = 89.8;
      ui.bimForceDesignBase = null;
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToPoi(simObj.poiId);
      renderBimSim(hostEl, ctx, isSchemeB);
      ctx.showToast('已重置 BIM 进度模拟视角与日期');
    });

    hostEl.querySelector('#m02BimLocateBtn').addEventListener('click', () => {
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToPoi(simObj.poiId);
      ctx.showToast(`三维视角已飞抵：${simObj.name}（${simObj.secName}）`);
    });

    hostEl.querySelector('#m02BimViewPlanBtn').addEventListener('click', () => {
      ctx.openModal(`关联计划详情 · ${simObj.name}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>关联计划</span><strong>${simObj.planName}</strong></div>
          <div class="detail-stat-card"><span>计划版本</span><strong>${simObj.planVer}</strong></div>
          <div class="detail-stat-card"><span>当前模拟日期</span><strong>${simDate}</strong></div>
        </div>
        <table class="data-table">
          <thead><tr><th>工序任务</th><th>关联构件</th><th>计划开始</th><th>计划完成</th><th>模拟状态</th></tr></thead>
          <tbody>
            ${tasksWithState.map(t => `
              <tr>
                <td style="font-weight:700;color:#fff;">${t.name}</td>
                <td>${t.part}</td>
                <td>${t.start}</td>
                <td>${t.end}</td>
                <td><span class="status-tag ${t.simState === 'done' ? 'ok' : t.simState === 'doing' ? 'warn' : 'info'}">${t.simState === 'done' ? '计划已完成' : t.simState === 'doing' ? '计划施工中' : '计划未开始'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div style="display:flex;justify-content:flex-end;">
          <button class="dock-btn primary" id="m02BimToPlanPage">前往「计划与节点」查看总体甘特图</button>
        </div>
      `);
      setTimeout(() => {
        const pBtn = document.getElementById('m02BimToPlanPage');
        if (pBtn) pBtn.addEventListener('click', () => {
          ctx.closeModal();
          ctx.switchModule('progress', 'plan');
        });
      }, 0);
    });
  }

  function buildBimInspectorCard(simObj, tasksWithState, simDate, progressPct) {
    // 6 spans of isometric 3D BIM bridge/structure colored dynamically by task phase
    const t2 = tasksWithState[1].simState;
    const t3 = tasksWithState[2].simState;
    const t4 = tasksWithState[3].simState;
    const spanProg = t4 === 'done' ? 6 : t4 === 'todo' ? 0 : Math.max(1, Math.min(5, Math.round((progressPct - 55) / 8)));
    const colorOf = st => st === 'done' ? '#2596ff' : st === 'doing' ? '#f59e0b' : '#64748b';
    const strokeOf = st => st === 'done' ? '#7dd3fc' : st === 'doing' ? '#fde047' : '#94a3b8';

    const spansSvg = [0, 1, 2, 3, 4, 5].map(i => {
      const x = 44 + i * 76;
      const y = 132 - i * 14;
      const st = i < spanProg ? 'done' : i === spanProg && t4 !== 'todo' ? 'doing' : 'todo';
      const pierSt = i < 3 ? t2 : t3;
      return `
        <!-- Pier -->
        <rect x="${x + 26}" y="${y + 18}" width="16" height="44" rx="2" fill="${colorOf(pierSt)}" stroke="${strokeOf(pierSt)}" stroke-width="1.2"/>
        <!-- Box Girder Span -->
        <polygon points="${x},${y + 16} ${x + 74},${y + 2} ${x + 88},${y + 10} ${x + 14},${y + 24}"
                 fill="${colorOf(st)}" stroke="${strokeOf(st)}" stroke-width="1.3"/>
        ${st === 'doing' ? `
          <!-- Gantry Launcher -->
          <rect x="${x + 12}" y="${y - 8}" width="60" height="8" rx="2" fill="#facc15" stroke="#fff" stroke-width="0.8"/>
          <line x1="${x + 22}" y1="${y}" x2="${x + 22}" y2="${y + 14}" stroke="#fde047" stroke-width="2"/>
          <line x1="${x + 62}" y1="${y - 2}" x2="${x + 62}" y2="${y + 10}" stroke="#fde047" stroke-width="2"/>
        ` : ''}
      `;
    }).join('');

    return `
      <div class="m02-bim-inspector">
        <div class="m02-bim-insp-hdr">
          <span>三维 BIM 构件进度透视 · ${simObj.name} (${simDate})</span>
          <button class="m02-action-link" id="m02BimCloseInsp">收起 ✕</button>
        </div>
        <svg viewBox="0 0 540 198" style="width:100%;display:block;background:radial-gradient(circle at 50% 35%, rgba(16,68,142,0.45), rgba(4,15,36,0.9));">
          <defs>
            <pattern id="m02-bimGrid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="rgba(56,189,248,0.12)" stroke-width="1"/>
            </pattern>
          </defs>
          <rect width="540" height="198" fill="url(#m02-bimGrid)"/>
          ${spansSvg}
          <text x="16" y="22" fill="#bae6fd" font-size="11" font-weight="700">实时构件状态着色（蓝色=已完成 / 橙色=施工中 / 灰色=未开始）</text>
        </svg>
      </div>
    `;
  }

  function ensureSimTimer(hostEl, ctx, isSchemeB) {
    if (simTimer) {
      clearInterval(simTimer);
      simTimer = null;
    }
    if (!ui.bimPlaying) return;
    simTimer = setInterval(() => {
      if (!ui.bimPlaying || !lastCtx || (lastSubPageId !== 'bim_a' && lastSubPageId !== 'bim_b')) {
        clearInterval(simTimer);
        simTimer = null;
        return;
      }
      ui.bimProgress = +(ui.bimProgress + 1.2 * ui.bimSpeed).toFixed(1);
      if (ui.bimProgress >= 100) {
        ui.bimProgress = 100;
        ui.bimPlaying = false;
        clearInterval(simTimer);
        simTimer = null;
        lastCtx.showToast('BIM 进度模拟演练完成');
      }
      renderBimSim(hostEl, lastCtx, lastSubPageId === 'bim_b');
    }, 350);
  }

  function syncGlobalSection(targetSecId, ctx) {
    const pill = targetSecId
      ? document.querySelector(`#sectionFilters .section-pill[data-sec="${targetSecId}"]`)
      : document.querySelector(`#sectionFilters .section-pill[data-sec="${ctx.state.activeSectionId}"]`);
    if (pill) {
      pill.click();
    } else {
      ctx.state.activeSectionId = targetSecId;
      renderOverview(document.getElementById('moduleStageHost'), ctx);
    }
  }

  function restoreCesiumFromBim() {
    if (simTimer) {
      clearInterval(simTimer);
      simTimer = null;
    }
    ui.bimPlaying = false;
    lastCesiumBimSig = '';
    if (!lastCtx || !lastCtx.cesium || !lastCtx.cesium.ready) return;
    const ces = lastCtx.cesium;
    if (savedBimStyles && ces.bimEntities) {
      ces.bimEntities.forEach((ent, i) => {
        const st = savedBimStyles[i];
        if (!st) return;
        if (ent.box && st.boxMat) {
          ent.box.material = st.boxMat;
          ent.box.outlineColor = st.boxOut;
        }
        if (ent.cylinder && st.cylMat) {
          ent.cylinder.material = st.cylMat;
          ent.cylinder.outlineColor = st.cylOut;
        }
      });
      savedBimStyles = null;
    }
    ces.applyLayers({
      satellite: false,
      uav: true,
      bim: false,
      pois: true,
      sections: true,
      route: true,
      designMode: false,
      activeSectionId: lastCtx.state.activeSectionId
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'progress',
    name: '进度管理',
    subPages: SUB_PAGES,

    getCesiumMode(subPageId) {
      return (subPageId === 'bim_a' || subPageId === 'bim_b') ? 'interactive' : 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      ensureStyles();
      lastCtx = ctx;

      const prevSub = lastSubPageId;
      lastSubPageId = subPageId;

      // Sync if global Cesium POI was clicked
      if ((subPageId === 'bim_a' || subPageId === 'bim_b') && ctx.state.selectedPoiId !== lastGlobalPoiId) {
        lastGlobalPoiId = ctx.state.selectedPoiId;
        const matched = BIM_OBJECTS.find(o => o.poiId === ctx.state.selectedPoiId);
        if (matched && prevSub === subPageId) {
          ui.bimObjId = matched.id;
          ui.bimSecId = matched.secId;
        }
      }

      if (prevSub && prevSub.startsWith('bim') && !subPageId.startsWith('bim')) {
        restoreCesiumFromBim();
      }

      document.body.classList.toggle('m02-hide-top-sections', subPageId === 'overview');

      if (subPageId === 'overview') {
        renderOverview(hostEl, ctx);
      } else if (subPageId === 'report') {
        renderReport(hostEl, ctx);
      } else if (subPageId === 'plan') {
        renderPlan(hostEl, ctx);
      } else if (subPageId === 'bim_a' || subPageId === 'bim_b') {
        const isSchemeB = subPageId === 'bim_b';
        if (prevSub !== subPageId) {
          ui.bimForceDesignBase = null;
          const simObj = BIM_OBJECTS.find(b => b.id === ui.bimObjId) || BIM_OBJECTS[0];
          if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToPoi(simObj.poiId);
        }
        renderBimSim(hostEl, ctx, isSchemeB);
        if (ui.bimPlaying) ensureSimTimer(hostEl, ctx, isSchemeB);
      }
    },

    onSectionChange(secId, subPageId) {
      if (!lastCtx) return;
      if (subPageId === 'report') {
        ui.rpSecId = secId || 'all';
        ui.rpAppliedSecId = secId || 'all';
        if (secId) ui.rpSelectedSecId = secId;
        renderReport(document.getElementById('moduleStageHost'), lastCtx);
      } else if (subPageId === 'plan') {
        ui.plSecId = secId || 'all';
        ui.plAppliedSecId = secId || 'all';
        renderPlan(document.getElementById('moduleStageHost'), lastCtx);
      } else if (subPageId === 'bim_a' || subPageId === 'bim_b') {
        if (secId) {
          ui.bimSecId = secId;
          const matchObj = BIM_OBJECTS.find(o => o.secId === secId);
          if (matchObj) ui.bimObjId = matchObj.id;
        }
        renderBimSim(document.getElementById('moduleStageHost'), lastCtx, subPageId === 'bim_b');
      }
    },

    onLeave() {
      document.body.classList.remove('m02-hide-top-sections');
      restoreCesiumFromBim();
      lastSubPageId = null;
      const host = document.getElementById('moduleStageHost');
      if (host) host.innerHTML = '';
    }
  });
})();
