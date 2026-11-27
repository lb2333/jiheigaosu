/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 14：黑土地保护 (js/modules/m14_blacksoil.js)
   子页面：
     01_遥感影像对比 (compare) — 多期高分遥感影像卷帘对比、同步缩放漫游、
                                 纯SVG黑土地保护范围与施工红线叠加、地块监测详情
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'compare', name: '遥感影像对比' }
  ];

  const WORLD_W = 1600;
  const WORLD_H = 900;
  const MIN_ZOOM = 1.0;
  const MAX_ZOOM = 3.0;

  const EPOCH_META = {
    '2024': {
      year: '2024 年',
      tag: '基线期',
      tagTone: 'base',
      summary: '原生黑土耕地连片完整，仅见原有乡道'
    },
    '2025': {
      year: '2025 年',
      tag: '施工前',
      tagTone: 'pre',
      summary: '原有道路与完整耕地'
    },
    '2026': {
      year: '2026 年',
      tag: '施工期',
      tagTone: 'active',
      summary: '道路沿线可见拓宽施工带'
    }
  };

  /* 公路工程施工走廊中心线（世界坐标 1600x900） */
  const CORRIDOR_CENTERLINE = [
    [0, 622],
    [380, 544],
    [800, 456],
    [1220, 368],
    [1600, 290]
  ];

  /* 施工红线多边形（半宽 46 世界单位，围绕中心线） */
  const CORRIDOR_POLYGON = [
    [0, 576], [380, 498], [800, 410], [1220, 322], [1600, 244],
    [1600, 336], [1220, 414], [800, 502], [380, 590], [0, 668]
  ];

  /* 6 个黑土地保护演示地块（HT-01 ~ HT-06，覆盖全线 6 个工区映射） */
  const PARCELS = [
    {
      id: 'HT-01',
      name: '明水南示范耕作块',
      sectionId: 'sec2',
      sectionName: '二工区',
      scope: '沿线演示区',
      stake: 'K28+150 ~ K28+780',
      landType: '耕地（黑土耕层）',
      protectionLayer: '黑土地保护范围',
      grade: '一级黑土地保护区',
      areaHa: 14.8,
      relation: '位于施工范围北侧边界外 18m',
      topsoilStatus: '已完成表土剥离界桩核验，无越界扰动',
      topsoilCompliant: true,
      stripVol: '0.0 万m³（非占压区）',
      backfillPlan: '保持原位耕作，设立生态截水沟',
      ndviSeries: [
        { label: '2024', ndvi: 0.76, moisture: 27.4 },
        { label: '2025', ndvi: 0.75, moisture: 26.9 },
        { label: '2026', ndvi: 0.74, moisture: 26.5 }
      ],
      epochNotes: {
        '2024': '早春条带耕作清晰，防风林带郁闭度高',
        '2025': '大豆长势均匀，北侧界桩及排水沟完整',
        '2026': '南缘紧邻施工围挡，耕作层未受碾压'
      },
      points: [
        [374, 178], [520, 146], [598, 412], [452, 444]
      ],
      labelOffset: [0, -18],
      focusZoom: 1.55
    },
    {
      id: 'HT-02',
      name: 'K34+600 路基衔接示范块',
      sectionId: 'sec3',
      sectionName: '三工区',
      scope: '沿线演示区',
      stake: 'K34+200 ~ K35+100',
      landType: '耕地',
      protectionLayer: '黑土地保护范围',
      grade: '一级黑土地保护区',
      areaHa: 18.6,
      relation: '与施工范围局部相交',
      topsoilStatus: '表土剥离 4.2 万m³ 已入场集中堆存（合规）',
      topsoilCompliant: true,
      stripVol: '4.2 万m³（剥离厚度 35cm）',
      backfillPlan: '施工后优先用于边坡及临时占地复垦回填',
      ndviSeries: [
        { label: '2024', ndvi: 0.78, moisture: 27.9 },
        { label: '2025', ndvi: 0.76, moisture: 27.2 },
        { label: '2026', ndvi: 0.71, moisture: 25.8 }
      ],
      epochNotes: {
        '2024': '连片黑土耕地，原有乡道窄路穿过北缘',
        '2025': '原有道路与完整耕地',
        '2026': '道路沿线可见拓宽施工带'
      },
      points: [
        [674, 434], [848, 396], [948, 776], [774, 814]
      ],
      labelOffset: [42, 18],
      focusZoom: 1.5
    },
    {
      id: 'HT-03',
      name: '永兴东轮作保护地块',
      sectionId: 'sec4',
      sectionName: '四工区',
      scope: '沿线演示区',
      stake: 'K62+400 ~ K63+120',
      landType: '耕地（黑土耕层）',
      protectionLayer: '黑土地保护范围',
      grade: '二级黑土地保护区',
      areaHa: 16.2,
      relation: '位于施工范围南侧 26m（已设防尘围堰）',
      topsoilStatus: '耕层含水率与有机质稳定，已设防尘抑尘网',
      topsoilCompliant: true,
      stripVol: '0.0 万m³（红线外避让）',
      backfillPlan: '维持玉米-大豆轮作与秸秆还田保护',
      ndviSeries: [
        { label: '2024', ndvi: 0.73, moisture: 26.2 },
        { label: '2025', ndvi: 0.74, moisture: 26.6 },
        { label: '2026', ndvi: 0.72, moisture: 26.1 }
      ],
      epochNotes: {
        '2024': '条田规整，农田防护林带长势良好',
        '2025': '作物覆盖度 91%，排灌渠系畅通',
        '2026': '北侧紧邻施工带，植被指数波动在正常阈值内'
      },
      points: [
        [1048, 398], [1202, 364], [1292, 706], [1138, 740]
      ],
      labelOffset: [22, -6],
      focusZoom: 1.55
    },
    {
      id: 'HT-04',
      name: '新发西生态缓冲耕地',
      sectionId: 'sec1',
      sectionName: '一工区',
      scope: '沿线演示区',
      stake: 'K12+300 ~ K12+960',
      landType: '耕地（黑土耕层）',
      protectionLayer: '黑土地保护范围',
      grade: '一级黑土地保护区',
      areaHa: 12.4,
      relation: '与施工范围安全间距 42m',
      topsoilStatus: '未涉占压，沿线监测点运行正常',
      topsoilCompliant: true,
      stripVol: '0.0 万m³（避让区）',
      backfillPlan: '保持原生黑土耕作层及防护林带',
      ndviSeries: [
        { label: '2024', ndvi: 0.75, moisture: 28.1 },
        { label: '2025', ndvi: 0.76, moisture: 27.8 },
        { label: '2026', ndvi: 0.75, moisture: 27.6 }
      ],
      epochNotes: {
        '2024': '春季深松整地，黑土表层含水充足',
        '2025': '耕地边界与林带保持完整',
        '2026': '远离拓宽作业面，生态指标零异常'
      },
      points: [
        [108, 636], [244, 606], [306, 840], [170, 870]
      ],
      labelOffset: [0, -14],
      focusZoom: 1.75
    },
    {
      id: 'HT-05',
      name: '通北取土场表土回填区',
      sectionId: 'sec5',
      sectionName: '五工区',
      scope: '沿线演示区',
      stake: 'K104+500 ~ K105+200',
      landType: '耕地及临时表土堆场',
      protectionLayer: '黑土地保护范围',
      grade: '一级黑土地保护区',
      areaHa: 15.1,
      relation: '与施工范围局部相交（表土集中堆存区）',
      topsoilStatus: '临时占地表土剥离完成 3.6 万m³，覆绿防流失达标',
      topsoilCompliant: true,
      stripVol: '3.6 万m³（集中覆膜绿化）',
      backfillPlan: '2026 年底主体完工后按 35cm 标准复垦耕层',
      ndviSeries: [
        { label: '2024', ndvi: 0.74, moisture: 26.8 },
        { label: '2025', ndvi: 0.73, moisture: 26.4 },
        { label: '2026', ndvi: 0.67, moisture: 24.9 }
      ],
      epochNotes: {
        '2024': '高标准条带农田，无临时工程占地',
        '2025': '拟定临时表土堆存边界放样',
        '2026': '可见标准化表土堆存平台及边坡防护网'
      },
      points: [
        [898, 92], [1044, 60], [1106, 294], [960, 326]
      ],
      labelOffset: [0, 12],
      focusZoom: 1.75
    },
    {
      id: 'HT-06',
      name: '建华互通生态保护区',
      sectionId: 'sec6',
      sectionName: '六工区',
      scope: '沿线演示区',
      stake: 'K138+200 ~ K139+050',
      landType: '耕地与防护林带',
      protectionLayer: '黑土地保护范围',
      grade: '二级黑土地保护区',
      areaHa: 13.9,
      relation: '与互通连接线施工范围相邻 14m',
      topsoilStatus: '已设置截排水盲沟与防泥沙拦截堤（待复核）',
      topsoilCompliant: false,
      stripVol: '1.8 万m³（局部剥离堆存）',
      backfillPlan: '待冬季冻融监测复核后补齐边坡覆土',
      ndviSeries: [
        { label: '2024', ndvi: 0.72, moisture: 25.9 },
        { label: '2025', ndvi: 0.71, moisture: 25.4 },
        { label: '2026', ndvi: 0.66, moisture: 24.1 }
      ],
      epochNotes: {
        '2024': '农田林网结构稳定',
        '2025': '原有道路与耕地边界清晰',
        '2026': '北侧互通施工段需重点复核排水防护'
      },
      points: [
        [1236, 368], [1360, 342], [1424, 588], [1300, 614]
      ],
      labelOffset: [-34, -14],
      focusZoom: 1.7
    }
  ];

  const PARCEL_MAP = Object.fromEntries(PARCELS.map(p => [p.id, p]));

  /* ------------------------------------------------------------------------
     MODULE STATE & OFFSCREEN IMAGERY CACHE
     ------------------------------------------------------------------------ */
  const uiState = {
    searchQuery: 'HT-02',
    selectedParcelId: 'HT-02',
    leftEpoch: '2025',
    rightEpoch: '2026',
    splitRatio: 50,
    zoom: 1.0,
    panX: 0,
    panY: 0,
    layersPanelCollapsed: false,
    layers: {
      basemap: true,
      protection: true,
      corridor: true,
      labels: true
    }
  };

  let lastHost = null;
  let lastCtx = null;
  let animFrameId = null;
  let resizeObserver = null;
  let epochCanvases = null;

  /* ------------------------------------------------------------------------
     SVG ICONS & HELPERS
     ------------------------------------------------------------------------ */
  const ICONS = {
    pin: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.33-6-10.5a6 6 0 1112 0C18 15.67 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/></svg>',
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M21 21l-4.35-4.35"/></svg>',
    target: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>',
    sync: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>',
    info: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4M12 8h.01"/></svg>',
    chevronDown: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M6 9l6 6 6-6"/></svg>',
    plus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 5v14M5 12h14"/></svg>',
    minus: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M5 12h14"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12a9 9 0 103-6.7L3 8"/><path d="M3 3v5h5"/></svg>',
    north: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 3 19 20 12 16 5 20 12 3"/></svg>',
    splitArrows: '<svg width="20" height="14" viewBox="0 0 24 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M7 3L2 8l5 5"/><line x1="12" y1="2" x2="12" y2="14" stroke-opacity="0.85"/><path d="M17 3l5 5-5 5"/></svg>',
    chart: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 3v18h18"/><path d="M7 15l4-4 4 3 5-6"/></svg>'
  };

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      let t = (a += 0x6d2b79f5);
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getParcelCenter(parcel) {
    const pts = parcel.points;
    let cx = 0;
    let cy = 0;
    for (let i = 0; i < pts.length; i++) {
      cx += pts[i][0];
      cy += pts[i][1];
    }
    return [cx / pts.length, cy / pts.length];
  }

  /* ------------------------------------------------------------------------
     SCOPED CSS INJECTION (<style id="m14-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m14-styles')) return;
    const style = document.createElement('style');
    style.id = 'm14-styles';
    style.textContent = `
      .m14-root {
        position: relative;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        background: #040f24;
        color: var(--text-main);
        user-select: none;
      }

      /* Top Toolbar */
      .m14-toolbar {
        height: 48px;
        flex-shrink: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 0 16px;
        background: linear-gradient(180deg, rgba(8, 28, 64, 0.96) 0%, rgba(5, 19, 46, 0.94) 100%);
        border-bottom: 1px solid rgba(56, 189, 248, 0.34);
        box-shadow: 0 4px 16px rgba(0, 8, 26, 0.45);
        z-index: 24;
      }
      .m14-toolbar-left,
      .m14-toolbar-right {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .m14-scope-pill {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        height: 32px;
        padding: 0 12px;
        border-radius: 7px;
        background: rgba(11, 38, 84, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.36);
        font-size: 13px;
        white-space: nowrap;
      }
      .m14-scope-pill svg { color: var(--cyan); flex-shrink: 0; }
      .m14-scope-pill strong { color: #ffffff; font-weight: 700; }
      .m14-scope-pill span { color: var(--text-sub); font-size: 12px; }

      .m14-search-wrap {
        position: relative;
        display: flex;
        align-items: center;
      }
      .m14-search-wrap svg {
        position: absolute;
        left: 10px;
        color: #7dd3fc;
        pointer-events: none;
      }
      .m14-search-input {
        width: 210px;
        height: 32px;
        padding: 0 10px 0 30px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(6, 22, 54, 0.88);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 600;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m14-search-input::placeholder { color: #6e92bd; font-weight: 400; }
      .m14-search-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 0 2px rgba(56, 242, 255, 0.18);
      }

      .m14-locate-btn {
        height: 32px;
        padding: 0 14px;
        border-radius: 7px;
        border: 1px solid rgba(96, 210, 255, 0.85);
        background: linear-gradient(180deg, #1a88ff 0%, #0d5cd2 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        box-shadow: 0 3px 12px rgba(14, 125, 255, 0.38);
        transition: filter 0.18s, transform 0.15s;
        white-space: nowrap;
      }
      .m14-locate-btn:hover { filter: brightness(1.12); transform: translateY(-1px); }

      .m14-sync-badge {
        height: 30px;
        padding: 0 12px;
        border-radius: 99px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 34, 78, 0.78);
        color: #cfe7ff;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        white-space: nowrap;
      }
      .m14-sync-badge svg { color: var(--cyan); }

      .m14-pending-badge {
        height: 30px;
        padding: 0 13px;
        border-radius: 99px;
        border: 1px solid rgba(250, 204, 21, 0.78);
        background: rgba(74, 52, 8, 0.65);
        color: #fde047;
        font-size: 12px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.18s, box-shadow 0.18s;
        white-space: nowrap;
      }
      .m14-pending-badge:hover {
        background: rgba(110, 76, 12, 0.82);
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.35);
      }

      /* Full-Canvas Interactive Split-Curtain Stage */
      .m14-stage {
        position: relative;
        flex: 1;
        min-height: 0;
        overflow: hidden;
        background: radial-gradient(circle at 50% 45%, #0a234e 0%, #051430 68%, #030b1c 100%);
        cursor: grab;
        touch-action: none;
      }
      .m14-stage.panning { cursor: grabbing; }

      .m14-layer-right,
      .m14-layer-left {
        position: absolute;
        inset: 0;
        pointer-events: none;
      }
      .m14-layer-right { z-index: 2; }
      .m14-layer-left {
        z-index: 3;
        clip-path: inset(0 50% 0 0);
      }
      .m14-canvas {
        display: block;
        width: 100%;
        height: 100%;
      }

      /* Vector SVG Overlay */
      .m14-svg-overlay {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        z-index: 6;
        pointer-events: none;
      }
      .m14-parcel-poly {
        pointer-events: auto;
        cursor: pointer;
        transition: fill 0.2s, stroke-width 0.2s;
      }
      .m14-parcel-poly:hover {
        filter: brightness(1.18);
      }
      .m14-parcel-label-g {
        pointer-events: auto;
        cursor: pointer;
      }

      /* Split Curtain Divider */
      .m14-divider {
        position: absolute;
        top: 0;
        bottom: 0;
        left: 50%;
        width: 3px;
        transform: translateX(-50%);
        z-index: 15;
        background: linear-gradient(180deg, rgba(56, 242, 255, 0.85) 0%, #ffffff 50%, rgba(56, 242, 255, 0.85) 100%);
        box-shadow: 0 0 18px rgba(56, 242, 255, 0.95);
        cursor: ew-resize;
        touch-action: none;
      }
      .m14-divider::before {
        content: '';
        position: absolute;
        top: 0;
        bottom: 0;
        left: -14px;
        right: -14px;
      }
      .m14-handle {
        position: absolute;
        top: 52%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 7px;
        cursor: ew-resize;
        outline: none;
      }
      .m14-handle-circle {
        width: 44px;
        height: 44px;
        border-radius: 50%;
        background: linear-gradient(180deg, rgba(22, 130, 248, 0.96), rgba(8, 72, 178, 0.96));
        border: 2.5px solid #a5f3fc;
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 22px rgba(56, 242, 255, 0.85);
        transition: transform 0.16s ease, box-shadow 0.16s ease;
      }
      .m14-handle:hover .m14-handle-circle,
      .m14-handle:focus-visible .m14-handle-circle,
      .m14-divider.dragging .m14-handle-circle {
        transform: scale(1.1);
        box-shadow: 0 0 28px rgba(56, 242, 255, 1);
      }
      .m14-handle-pill {
        padding: 3px 12px;
        border-radius: 99px;
        background: rgba(8, 30, 70, 0.92);
        border: 1px solid rgba(56, 220, 255, 0.72);
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 10, 32, 0.6);
      }

      /* Floating Epoch Pickers */
      .m14-epoch-bar {
        position: absolute;
        top: 14px;
        left: 286px;
        right: 312px;
        z-index: 16;
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 12px;
        pointer-events: none;
      }
      .m14-epoch-picker {
        pointer-events: auto;
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 5px 12px;
        border-radius: 8px;
        background: rgba(8, 28, 66, 0.88);
        border: 1px solid rgba(56, 200, 255, 0.55);
        backdrop-filter: blur(10px);
        color: #dbeafe;
        font-size: 12.5px;
        box-shadow: 0 4px 16px rgba(0, 10, 32, 0.52);
        white-space: nowrap;
      }
      .m14-epoch-select {
        padding: 2px 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(11, 38, 84, 0.88);
        color: #ffffff;
        font-size: 13px;
        font-weight: 700;
        outline: none;
        cursor: pointer;
      }
      .m14-epoch-select option {
        background: #0a2252;
        color: #ffffff;
      }
      .m14-epoch-tag {
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
      }
      .m14-epoch-tag.pre {
        background: rgba(14, 116, 204, 0.35);
        border: 1px solid rgba(56, 220, 255, 0.65);
        color: #7dd3fc;
      }
      .m14-epoch-tag.active {
        background: rgba(120, 82, 10, 0.65);
        border: 1px solid rgba(250, 204, 21, 0.8);
        color: #fde047;
      }
      .m14-epoch-tag.base {
        background: rgba(20, 83, 45, 0.55);
        border: 1px solid rgba(74, 222, 128, 0.6);
        color: #86efac;
      }

      /* Left Floating Panel: 图层叠加 */
      .m14-left-panel {
        position: absolute;
        left: 14px;
        top: 14px;
        width: 256px;
        z-index: 20;
      }
      .m14-layer-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .m14-layer-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 6px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.16s;
      }
      .m14-layer-item:hover { background: rgba(56, 189, 248, 0.08); }
      .m14-layer-item:last-of-type { border-bottom: none; }
      .m14-layer-label {
        display: flex;
        align-items: center;
        gap: 9px;
        font-size: 13px;
        color: #e6f2ff;
      }
      .m14-layer-label input[type="checkbox"] {
        width: 15px;
        height: 15px;
        accent-color: #1677ff;
        cursor: pointer;
      }
      .m14-swatch-raster {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        border: 1px solid rgba(255, 255, 255, 0.32);
        background: linear-gradient(135deg, #3c542b 0%, #5a7239 45%, #3c2f23 46%, #7d6b4e 100%);
      }
      .m14-swatch-soil {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        border: 1.5px solid #34d399;
        background: rgba(16, 185, 129, 0.22);
      }
      .m14-swatch-corridor {
        width: 22px;
        height: 14px;
        border-radius: 3px;
        border: 1.5px dashed #facc15;
        background: rgba(250, 204, 21, 0.15);
      }
      .m14-swatch-ht {
        font-size: 11px;
        font-weight: 800;
        font-style: italic;
        color: #bae6fd;
        letter-spacing: 0.5px;
      }
      .m14-layer-tip {
        margin-top: 8px;
        padding: 7px 10px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #cfe4ff;
        font-size: 11.5px;
        display: flex;
        align-items: center;
        gap: 6px;
      }
      .m14-layer-tip svg { color: var(--cyan); flex-shrink: 0; }

      /* Right Floating Panel: 地块信息 */
      .m14-right-panel {
        position: absolute;
        right: 14px;
        top: 14px;
        width: 284px;
        max-height: calc(100% - 252px);
        z-index: 20;
        display: flex;
        flex-direction: column;
      }
      .m14-right-body {
        padding: 11px 13px 13px;
        overflow-y: auto;
        scrollbar-width: thin;
      }
      .m14-demo-chip {
        padding: 2px 9px;
        border-radius: 99px;
        background: rgba(14, 48, 104, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #cfe4ff;
        font-size: 11px;
      }
      .m14-parcel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 9px;
        margin-bottom: 6px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      }
      .m14-parcel-title {
        font-size: 17px;
        font-weight: 800;
        color: #ffffff;
        letter-spacing: 0.3px;
      }
      .m14-selected-pill {
        padding: 2px 10px;
        border-radius: 99px;
        background: rgba(14, 116, 204, 0.32);
        border: 1px solid rgba(56, 220, 255, 0.65);
        color: #7dd3fc;
        font-size: 11px;
        font-weight: 700;
      }
      .m14-kv-list {
        display: flex;
        flex-direction: column;
      }
      .m14-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid rgba(56, 189, 248, 0.12);
        font-size: 12px;
      }
      .m14-kv-k { color: var(--text-sub); flex-shrink: 0; }
      .m14-kv-v {
        color: #f1f7ff;
        font-weight: 600;
        text-align: right;
      }
      .m14-kv-v.cyan { color: #38f2ff; }
      .m14-kv-v.ok { color: #4ade80; }
      .m14-kv-v.warn { color: #fde047; }

      .m14-metrics-box {
        margin-top: 8px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(8, 28, 66, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .m14-metrics-kpis {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin-bottom: 6px;
      }
      .m14-metric-cell {
        padding: 5px 7px;
        border-radius: 6px;
        background: rgba(14, 48, 104, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.18);
      }
      .m14-metric-cell span {
        display: block;
        font-size: 10.5px;
        color: var(--text-sub);
      }
      .m14-metric-cell strong {
        display: block;
        font-size: 13.5px;
        color: var(--cyan-bright);
        margin-top: 2px;
        font-variant-numeric: tabular-nums;
      }

      .m14-epoch-summary {
        margin-top: 8px;
        padding: 9px 10px;
        border-radius: 8px;
        background: rgba(9, 32, 74, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.26);
      }
      .m14-epoch-summary-title {
        font-size: 12px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 6px;
      }
      .m14-epoch-summary-row {
        display: flex;
        align-items: flex-start;
        gap: 8px;
        font-size: 11.5px;
        line-height: 1.45;
        margin-top: 4px;
      }
      .m14-epoch-summary-row strong {
        color: #7dd3fc;
        flex-shrink: 0;
        font-variant-numeric: tabular-nums;
      }
      .m14-epoch-summary-row span { color: #dbeafe; }

      .m14-panel-actions {
        display: flex;
        gap: 8px;
        margin-top: 10px;
      }
      .m14-btn-primary {
        flex: 1;
        height: 34px;
        border-radius: 7px;
        border: 1px solid rgba(96, 210, 255, 0.85);
        background: linear-gradient(180deg, #1b88ff 0%, #0d5dd4 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        box-shadow: 0 4px 14px rgba(14, 125, 255, 0.36);
        transition: filter 0.18s;
      }
      .m14-btn-primary:hover { filter: brightness(1.12); }
      .m14-btn-secondary {
        height: 34px;
        padding: 0 11px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.46);
        background: rgba(12, 44, 96, 0.8);
        color: #dbeafe;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        transition: border-color 0.18s, color 0.18s;
        white-space: nowrap;
      }
      .m14-btn-secondary:hover { border-color: var(--cyan-bright); color: #ffffff; }

      /* Bottom-Left Scale / Demo Notice */
      .m14-scale-badge {
        position: absolute;
        left: 14px;
        bottom: 14px;
        z-index: 20;
        display: inline-flex;
        align-items: center;
        gap: 7px;
        padding: 6px 13px;
        border-radius: 9px;
        background: rgba(8, 28, 66, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.42);
        backdrop-filter: blur(10px);
        color: #dbeafe;
        font-size: 12px;
        box-shadow: var(--shadow-panel);
      }
      .m14-scale-badge svg { color: var(--cyan); }
      .m14-scale-val {
        color: #ffffff;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }

      /* Bottom-Right Map Controls (Clear above .floating-br) */
      .m14-map-controls {
        position: absolute;
        right: 16px;
        bottom: 108px;
        z-index: 22;
        display: flex;
        flex-direction: column;
        width: 96px;
        border-radius: 9px;
        background: rgba(8, 28, 66, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.48);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        overflow: hidden;
      }
      .m14-ctrl-btn {
        height: 31px;
        padding: 0 10px;
        border: none;
        background: transparent;
        color: #e6f4ff;
        font-size: 12px;
        font-weight: 600;
        display: flex;
        align-items: center;
        gap: 7px;
        cursor: pointer;
        transition: background 0.16s, color 0.16s;
      }
      .m14-ctrl-btn + .m14-ctrl-btn {
        border-top: 1px solid rgba(56, 189, 248, 0.2);
      }
      .m14-ctrl-btn:hover {
        background: rgba(56, 189, 248, 0.22);
        color: var(--cyan-bright);
      }
      .m14-ctrl-btn svg { color: #7dd3fc; flex-shrink: 0; }

      @media (max-width: 1220px) {
        .m14-left-panel { width: 224px; }
        .m14-right-panel { width: 252px; }
        .m14-epoch-bar { left: 250px; right: 278px; }
        .m14-search-input { width: 160px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     SEEDED DETERMINISTIC HIGH-RES REMOTE SENSING CANVAS SYNTHESIS
     ------------------------------------------------------------------------ */
  function drawRotatedParcelPattern(ctx, epoch) {
    const rand = mulberry32(20261126 + Number(epoch) * 137);

    // Tilted farmland strips (-14 deg, matching Heilongjiang black-soil strip fields)
    ctx.save();
    ctx.translate(WORLD_W / 2, WORLD_H / 2);
    ctx.rotate(-0.24); // ~ -13.8 deg

    const stripWidths = [135, 118, 146, 128, 152, 132, 142, 158, 134, 148, 126, 145, 138, 150];
    const stripTypes = [
      'blacksoil', 'crop_dark', 'wheat_tan', 'crop_bright',
      'blacksoil', 'crop_mid', 'blacksoil', 'wheat_tan',
      'crop_bright', 'crop_dark', 'crop_mid', 'blacksoil',
      'crop_bright', 'wheat_tan'
    ];

    const palettes = {
      '2024': {
        blacksoil: ['#261f18', '#31271e', '#1e1812'],
        crop_dark: ['#2f4d23', '#3b5d2b', '#27421c'],
        crop_mid: ['#3f602d', '#4c7036', '#335224'],
        crop_bright: ['#4c7333', '#5c843d', '#3e6229'],
        wheat_tan: ['#786a4d', '#877858', '#685b42']
      },
      '2025': {
        blacksoil: ['#2c231b', '#382c22', '#231b14'],
        crop_dark: ['#375728', '#456931', '#2f4c22'],
        crop_mid: ['#4b6d34', '#587c3c', '#3d5c29'],
        crop_bright: ['#5a7f3a', '#698e45', '#4c6e30'],
        wheat_tan: ['#8b7857', '#9b8763', '#7a684a']
      },
      '2026': {
        blacksoil: ['#31271e', '#3e3126', '#281f18'],
        crop_dark: ['#3b592a', '#496b34', '#314c23'],
        crop_mid: ['#507036', '#5e7e40', '#42602c'],
        crop_bright: ['#60823e', '#6f9248', '#527134'],
        wheat_tan: ['#94805d', '#a48f6a', '#827050']
      }
    };

    const pal = palettes[epoch] || palettes['2025'];
    let curX = -1020;

    for (let i = 0; i < stripWidths.length; i++) {
      const w = stripWidths[i];
      const kind = stripTypes[i % stripTypes.length];
      const colors = pal[kind];

      // Base strip fill
      ctx.fillStyle = colors[0];
      ctx.fillRect(curX, -900, w, 1800);

      // Sub-bands & crop/furrow lines along strip
      for (let fx = curX + 3; fx < curX + w - 2; fx += 5.5) {
        ctx.fillStyle = rand() > 0.45 ? colors[1] : colors[2];
        ctx.globalAlpha = 0.35 + rand() * 0.35;
        ctx.fillRect(fx, -900, 2.2 + rand() * 1.4, 1800);
      }
      ctx.globalAlpha = 1;

      // Cross-field moisture/organic patches
      for (let p = 0; p < 18; p++) {
        const py = -840 + rand() * 1680;
        const ph = 40 + rand() * 110;
        ctx.fillStyle = rand() > 0.5 ? colors[2] : colors[1];
        ctx.globalAlpha = 0.14 + rand() * 0.14;
        ctx.fillRect(curX + 2, py, w - 4, ph);
      }
      ctx.globalAlpha = 1;

      // Horizontal drainage ditches / plot subdivisions
      for (let dy = -680; dy <= 680; dy += 260 + Math.floor(rand() * 90)) {
        ctx.fillStyle = epoch === '2024' ? 'rgba(26, 36, 30, 0.6)' : 'rgba(42, 46, 36, 0.55)';
        ctx.fillRect(curX, dy, w, 3.5);
      }

      // Shelterbelt windbreaks (防护林带) along every strip boundary
      const treeDensity = i % 2 === 0 ? 11 : 16;
      // Cast shadow to SE
      ctx.fillStyle = 'rgba(10, 16, 10, 0.42)';
      ctx.fillRect(curX - 2, -900, 18, 1800);

      for (let ty = -880; ty < 880; ty += treeDensity) {
        const jx = (rand() - 0.5) * 9;
        const r = 6 + rand() * 6.5;
        ctx.fillStyle = rand() > 0.38 ? '#233f1e' : '#305427';
        ctx.beginPath();
        ctx.arc(curX + jx, ty, r, 0, Math.PI * 2);
        ctx.fill();

        // Sunlit crown highlight
        ctx.fillStyle = epoch === '2026' ? '#496e35' : '#3d632c';
        ctx.beginPath();
        ctx.arc(curX + jx - 1.5, ty - 1.5, r * 0.55, 0, Math.PI * 2);
        ctx.fill();
      }

      curX += w;
    }
    ctx.restore();
  }

  function drawCorridorForEpoch(ctx, epoch) {
    const rand = mulberry32(9910 + Number(epoch) * 53);

    const drawPolyline = (pts, width, color, lineCap) => {
      ctx.save();
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.lineCap = lineCap || 'butt';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pts[0][0], pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
      ctx.stroke();
      ctx.restore();
    };

    if (epoch === '2024') {
      // 2024: Narrow original township road + intact green roadside grass
      drawPolyline(CORRIDOR_CENTERLINE, 22, 'rgba(62, 74, 46, 0.75)');
      drawPolyline(CORRIDOR_CENTERLINE, 11, '#7c7e74');
      drawPolyline(CORRIDOR_CENTERLINE, 1.5, 'rgba(226, 232, 240, 0.45)');
      return;
    }

    if (epoch === '2025') {
      // 2025 (施工前): Upgraded existing two-lane road with light shoulders, farmland intact
      drawPolyline(CORRIDOR_CENTERLINE, 28, 'rgba(72, 82, 54, 0.85)');
      drawPolyline(CORRIDOR_CENTERLINE, 15, '#96988e');
      ctx.save();
      ctx.setLineDash([12, 10]);
      drawPolyline(CORRIDOR_CENTERLINE, 1.6, 'rgba(245, 245, 220, 0.65)');
      ctx.restore();
      return;
    }

    // 2026 (施工期): Full widened construction earthwork corridor + protection berms + equipment!
    // 1. Outer protective topsoil / dust-control berm along black-soil edge
    drawPolyline(CORRIDOR_CENTERLINE, 92, 'rgba(78, 88, 56, 0.72)');
    // 2. Stripped earthwork & compacted subgrade band
    drawPolyline(CORRIDOR_CENTERLINE, 74, '#b39062');
    drawPolyline(CORRIDOR_CENTERLINE, 56, '#c7a474');

    // 3. Textured earthwork wheel tracks and gravel variation
    ctx.save();
    for (let t = 0; t <= 1; t += 0.012) {
      const x = t * WORLD_W;
      const y = 622 - t * 332;
      const off = (rand() - 0.5) * 34;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(138, 108, 70, 0.45)' : 'rgba(218, 192, 146, 0.35)';
      ctx.beginPath();
      ctx.ellipse(x, y + off, 14 + rand() * 18, 4 + rand() * 4, -0.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 4. Dual carriageway compacted haul tracks & central median
    const northLane = CORRIDOR_CENTERLINE.map(([x, y]) => [x, y - 13]);
    const southLane = CORRIDOR_CENTERLINE.map(([x, y]) => [x, y + 13]);
    drawPolyline(northLane, 12, '#d5b98e');
    drawPolyline(southLane, 12, '#d2b486');
    drawPolyline(CORRIDOR_CENTERLINE, 5, '#7c6b53');

    // 5. Topsoil stripping stockpile & green dust-screen protection pad at HT-02 edge
    ctx.save();
    ctx.translate(760, 520);
    ctx.rotate(-0.21);
    ctx.fillStyle = 'rgba(20, 48, 32, 0.55)';
    ctx.fillRect(-52, -8, 104, 18);
    ctx.fillStyle = '#336b47';
    ctx.fillRect(-48, -6, 96, 13);
    ctx.strokeStyle = 'rgba(134, 239, 172, 0.55)';
    ctx.lineWidth = 1;
    ctx.strokeRect(-48, -6, 96, 13);
    ctx.restore();

    // 6. Construction machinery markers along active subgrade (yellow excavators/rollers)
    const rigs = [
      [560, 502],
      [924, 424],
      [1190, 368],
      [1355, 336]
    ];
    rigs.forEach(([rx, ry]) => {
      ctx.save();
      ctx.translate(rx, ry);
      ctx.rotate(-0.2);
      ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
      ctx.fillRect(-6, -3, 14, 9);
      ctx.fillStyle = '#eab308';
      ctx.fillRect(-7, -5, 13, 8);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-3, -4, 4, 6);
      ctx.restore();
    });
  }

  function addSensorGrain(ctx, seedOffset) {
    const rand = mulberry32(4400 + seedOffset);
    ctx.save();
    for (let i = 0; i < 2400; i++) {
      const x = rand() * WORLD_W;
      const y = rand() * WORLD_H;
      ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)';
      ctx.fillRect(x, y, 2.2, 2.2);
    }
    ctx.restore();
  }

  function buildEpochCanvas(epoch) {
    const scale = 1.2;
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(WORLD_W * scale);
    canvas.height = Math.round(WORLD_H * scale);
    const ctx = canvas.getContext('2d');
    ctx.scale(scale, scale);

    drawRotatedParcelPattern(ctx, epoch);
    drawCorridorForEpoch(ctx, epoch);
    addSensorGrain(ctx, Number(epoch));

    return canvas;
  }

  function ensureEpochCanvases() {
    if (epochCanvases) return epochCanvases;
    epochCanvases = {
      '2024': buildEpochCanvas('2024'),
      '2025': buildEpochCanvas('2025'),
      '2026': buildEpochCanvas('2026')
    };
    return epochCanvases;
  }

  /* ------------------------------------------------------------------------
     PROJECTION & CLAMPING HELPERS
     ------------------------------------------------------------------------ */
  function getStageRect() {
    const stage = document.getElementById('m14Stage');
    if (!stage) return { width: 1280, height: 720 };
    const rect = stage.getBoundingClientRect();
    return {
      width: Math.max(320, rect.width || 1280),
      height: Math.max(240, rect.height || 720)
    };
  }

  function getViewTransform(stageW, stageH) {
    const baseScale = Math.max(stageW / WORLD_W, stageH / WORLD_H);
    const scale = baseScale * uiState.zoom;
    return { baseScale, scale, stageW, stageH };
  }

  function clampPan(panX, panY, zoom, stageW, stageH) {
    const baseScale = Math.max(stageW / WORLD_W, stageH / WORLD_H);
    const scale = baseScale * zoom;
    const maxPanX = Math.max(120, (WORLD_W * scale - stageW) * 0.5 + 110);
    const maxPanY = Math.max(90, (WORLD_H * scale - stageH) * 0.5 + 90);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
      y: Math.max(-maxPanY, Math.min(maxPanY, panY))
    };
  }

  function worldToScreen(wx, wy, stageW, stageH) {
    const { scale } = getViewTransform(stageW, stageH);
    return [
      stageW / 2 + (wx - WORLD_W / 2) * scale + uiState.panX,
      stageH / 2 + (wy - WORLD_H / 2) * scale + uiState.panY
    ];
  }

  /* ------------------------------------------------------------------------
     DRAWING STAGE CANVASES + SVG OVERLAY IN SYNC
     ------------------------------------------------------------------------ */
  function renderCanvasLayer(canvas, epoch, stageW, stageH, dpr) {
    if (!canvas) return;
    const targetW = Math.round(stageW * dpr);
    const targetH = Math.round(stageH * dpr);
    if (canvas.width !== targetW || canvas.height !== targetH) {
      canvas.width = targetW;
      canvas.height = targetH;
    }

    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, stageW, stageH);

    const { scale } = getViewTransform(stageW, stageH);

    if (uiState.layers.basemap) {
      const cache = ensureEpochCanvases();
      const src = cache[epoch] || cache['2025'];
      ctx.save();
      ctx.translate(stageW / 2 + uiState.panX, stageH / 2 + uiState.panY);
      ctx.scale(scale, scale);
      ctx.translate(-WORLD_W / 2, -WORLD_H / 2);
      ctx.drawImage(src, 0, 0, WORLD_W, WORLD_H);
      ctx.restore();
    } else {
      // GIS vector grid backdrop when basemap is hidden
      ctx.fillStyle = '#071b3c';
      ctx.fillRect(0, 0, stageW, stageH);
      ctx.save();
      ctx.translate(stageW / 2 + uiState.panX, stageH / 2 + uiState.panY);
      ctx.scale(scale, scale);
      ctx.translate(-WORLD_W / 2, -WORLD_H / 2);
      ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
      ctx.lineWidth = 1 / scale;
      for (let gx = 0; gx <= WORLD_W; gx += 80) {
        ctx.beginPath();
        ctx.moveTo(gx, 0);
        ctx.lineTo(gx, WORLD_H);
        ctx.stroke();
      }
      for (let gy = 0; gy <= WORLD_H; gy += 80) {
        ctx.beginPath();
        ctx.moveTo(0, gy);
        ctx.lineTo(WORLD_W, gy);
        ctx.stroke();
      }
      ctx.restore();
    }
  }

  function renderSvgOverlay(stageW, stageH) {
    const svg = document.getElementById('m14SvgOverlay');
    if (!svg) return;
    svg.setAttribute('viewBox', `0 0 ${stageW} ${stageH}`);

    const parts = [];
    parts.push(`
      <defs>
        <filter id="m14CyanGlow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="0" stdDeviation="4" flood-color="#38f2ff" flood-opacity="0.85"/>
        </filter>
      </defs>
    `);

    // 1. 工程施工范围 (Dashed Yellow Corridor)
    if (uiState.layers.corridor) {
      const corridorPts = CORRIDOR_POLYGON.map(([wx, wy]) => {
        const [sx, sy] = worldToScreen(wx, wy, stageW, stageH);
        return `${sx.toFixed(1)},${sy.toFixed(1)}`;
      }).join(' ');
      parts.push(`
        <polygon points="${corridorPts}"
          fill="rgba(250, 204, 21, 0.12)"
          stroke="#facc15"
          stroke-width="2"
          stroke-dasharray="9 6" />
      `);
    }

    // 2. 黑土地保护范围 (Parcel Polygons)
    if (uiState.layers.protection) {
      PARCELS.forEach(parcel => {
        const isSel = parcel.id === uiState.selectedParcelId;
        const ptsStr = parcel.points.map(([wx, wy]) => {
          const [sx, sy] = worldToScreen(wx, wy, stageW, stageH);
          return `${sx.toFixed(1)},${sy.toFixed(1)}`;
        }).join(' ');

        parts.push(`
          <polygon class="m14-parcel-poly"
            data-parcel="${parcel.id}"
            points="${ptsStr}"
            fill="${isSel ? 'rgba(34, 211, 238, 0.18)' : 'rgba(16, 185, 129, 0.16)'}"
            stroke="${isSel ? '#38f2ff' : '#34d399'}"
            stroke-width="${isSel ? 2.6 : 1.8}"
            ${isSel ? 'filter="url(#m14CyanGlow)"' : ''} />
        `);
      });
    }

    // 3. 地块标识 (Parcel Labels + Pins)
    if (uiState.layers.labels) {
      PARCELS.forEach(parcel => {
        const isSel = parcel.id === uiState.selectedParcelId;
        const [cx, cy] = getParcelCenter(parcel);
        const [sx, sy] = worldToScreen(
          cx + (parcel.labelOffset ? parcel.labelOffset[0] : 0),
          cy + (parcel.labelOffset ? parcel.labelOffset[1] : 0),
          stageW,
          stageH
        );
        const text = isSel ? `${parcel.id} • 选中地块` : parcel.id;
        const pillW = isSel ? 128 : 58;
        const pillH = 24;
        const rx = sx - pillW / 2;
        const ry = sy - pillH - 12;

        parts.push(`
          <g class="m14-parcel-label-g" data-parcel="${parcel.id}">
            <rect x="${rx.toFixed(1)}" y="${ry.toFixed(1)}" width="${pillW}" height="${pillH}" rx="5"
              fill="${isSel ? 'rgba(10, 48, 96, 0.94)' : 'rgba(8, 28, 62, 0.88)'}"
              stroke="${isSel ? '#38f2ff' : 'rgba(96, 210, 255, 0.65)'}"
              stroke-width="${isSel ? 1.5 : 1}" />
            <text x="${sx.toFixed(1)}" y="${(ry + 16).toFixed(1)}"
              text-anchor="middle"
              fill="#ffffff"
              font-size="12"
              font-weight="700"
              font-family="Microsoft YaHei, PingFang SC, sans-serif">${escHtml(text)}</text>
            <circle cx="${sx.toFixed(1)}" cy="${sy.toFixed(1)}" r="4.5"
              fill="${isSel ? '#38f2ff' : '#34d399'}"
              stroke="#ffffff" stroke-width="1.4" />
          </g>
        `);
      });
    }

    svg.innerHTML = parts.join('');
  }

  function syncStageGraphics() {
    const { width: stageW, height: stageH } = getStageRect();
    const clamped = clampPan(uiState.panX, uiState.panY, uiState.zoom, stageW, stageH);
    uiState.panX = clamped.x;
    uiState.panY = clamped.y;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const leftCanvas = document.getElementById('m14CanvasLeft');
    const rightCanvas = document.getElementById('m14CanvasRight');

    renderCanvasLayer(rightCanvas, uiState.rightEpoch, stageW, stageH, dpr);
    renderCanvasLayer(leftCanvas, uiState.leftEpoch, stageW, stageH, dpr);
    renderSvgOverlay(stageW, stageH);

    const zoomEl = document.getElementById('m14ZoomText');
    if (zoomEl) zoomEl.textContent = `${uiState.zoom.toFixed(1)}×`;
  }

  function syncSplitInPlace() {
    const leftLayer = document.getElementById('m14LeftLayer');
    const divider = document.getElementById('m14Divider');
    const handle = document.getElementById('m14Handle');
    if (leftLayer) leftLayer.style.clipPath = `inset(0 ${100 - uiState.splitRatio}% 0 0)`;
    if (divider) divider.style.left = `${uiState.splitRatio}%`;
    if (handle) handle.setAttribute('aria-valuenow', String(Math.round(uiState.splitRatio)));
  }

  function animateViewTo(targetZoom, targetPanX, targetPanY, durationMs) {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    const startZoom = uiState.zoom;
    const startPanX = uiState.panX;
    const startPanY = uiState.panY;
    const startTime = performance.now();
    const dur = durationMs || 360;

    function step(now) {
      const t = Math.min(1, (now - startTime) / dur);
      const ease = 1 - Math.pow(1 - t, 3);
      uiState.zoom = startZoom + (targetZoom - startZoom) * ease;
      uiState.panX = startPanX + (targetPanX - startPanX) * ease;
      uiState.panY = startPanY + (targetPanY - startPanY) * ease;
      syncStageGraphics();
      if (t < 1) {
        animFrameId = requestAnimationFrame(step);
      } else {
        animFrameId = null;
      }
    }
    animFrameId = requestAnimationFrame(step);
  }

  function focusParcel(parcelId, animate) {
    const parcel = PARCEL_MAP[parcelId];
    if (!parcel) return;
    uiState.selectedParcelId = parcel.id;
    uiState.searchQuery = parcel.id;
    const searchInput = document.getElementById('m14SearchInput');
    if (searchInput) searchInput.value = parcel.id;

    const { width: stageW, height: stageH } = getStageRect();
    const targetZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, parcel.focusZoom || 1.5));
    const baseScale = Math.max(stageW / WORLD_W, stageH / WORLD_H);
    const targetScale = baseScale * targetZoom;
    const [cx, cy] = getParcelCenter(parcel);
    const rawPanX = -(cx - WORLD_W / 2) * targetScale;
    const rawPanY = -(cy - WORLD_H / 2) * targetScale;
    const clamped = clampPan(rawPanX, rawPanY, targetZoom, stageW, stageH);

    renderParcelInfoPanel();
    if (animate === false) {
      uiState.zoom = targetZoom;
      uiState.panX = clamped.x;
      uiState.panY = clamped.y;
      syncStageGraphics();
    } else {
      animateViewTo(targetZoom, clamped.x, clamped.y, 380);
    }
  }

  /* ------------------------------------------------------------------------
     COMPACT SVG CHART & RIGHT PANEL RENDERING
     ------------------------------------------------------------------------ */
  function buildMonitoringMiniSvg(parcel) {
    const W = 236;
    const H = 68;
    const series = parcel.ndviSeries;
    const barW = 20;
    const groupSpacing = 74;
    const baseX = 28;

    const bars = series.map((pt, idx) => {
      const gx = baseX + idx * groupSpacing;
      const ndviH = Math.max(8, Math.round((pt.ndvi - 0.5) * 95));
      const moistH = Math.max(8, Math.round((pt.moisture - 18) * 2.4));
      return `
        <rect x="${gx}" y="${48 - ndviH}" width="11" height="${ndviH}" rx="2" fill="#38f2ff" fill-opacity="0.88" />
        <rect x="${gx + 13}" y="${48 - moistH}" width="11" height="${moistH}" rx="2" fill="#4ade80" fill-opacity="0.85" />
        <text x="${gx + 12}" y="61" text-anchor="middle" fill="#a9c6e8" font-size="10">${escHtml(pt.label)}</text>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:68px;display:block;">
        <line x1="12" y1="48" x2="${W - 10}" y2="48" stroke="rgba(56,189,248,0.28)" stroke-width="1" />
        <line x1="12" y1="24" x2="${W - 10}" y2="24" stroke="rgba(56,189,248,0.14)" stroke-dasharray="3 3" stroke-width="1" />
        ${bars}
        <g transform="translate(12, 8)">
          <rect x="0" y="0" width="7" height="7" rx="1.5" fill="#38f2ff" />
          <text x="10" y="7" fill="#bae6fd" font-size="9.5">NDVI</text>
          <rect x="44" y="0" width="7" height="7" rx="1.5" fill="#4ade80" />
          <text x="54" y="7" fill="#bae6fd" font-size="9.5">土壤含水率</text>
        </g>
      </svg>
    `;
  }

  function renderParcelInfoPanel() {
    const container = document.getElementById('m14ParcelInfoBody');
    if (!container) return;
    const p = PARCEL_MAP[uiState.selectedParcelId] || PARCELS[1];
    const leftInfo = EPOCH_META[uiState.leftEpoch];
    const rightInfo = EPOCH_META[uiState.rightEpoch];
    const leftSeries = p.ndviSeries.find(s => s.label === uiState.leftEpoch) || p.ndviSeries[1];
    const rightSeries = p.ndviSeries.find(s => s.label === uiState.rightEpoch) || p.ndviSeries[2];

    container.innerHTML = `
      <div class="m14-parcel-head">
        <span class="m14-parcel-title">地块 ${escHtml(p.id)}</span>
        <span class="m14-selected-pill">当前选中</span>
      </div>

      <div class="m14-kv-list">
        <div class="m14-kv-row">
          <span class="m14-kv-k">所属范围</span>
          <span class="m14-kv-v">${escHtml(p.scope)} · ${escHtml(p.sectionName)}</span>
        </div>
        <div class="m14-kv-row">
          <span class="m14-kv-k">位置桩号</span>
          <span class="m14-kv-v">${escHtml(p.stake)}</span>
        </div>
        <div class="m14-kv-row">
          <span class="m14-kv-k">地表类型</span>
          <span class="m14-kv-v">${escHtml(p.landType)}</span>
        </div>
        <div class="m14-kv-row">
          <span class="m14-kv-k">保护等级</span>
          <span class="m14-kv-v cyan">${escHtml(p.grade)}（${p.areaHa.toFixed(1)} 公顷）</span>
        </div>
        <div class="m14-kv-row">
          <span class="m14-kv-k">范围关系</span>
          <span class="m14-kv-v">${escHtml(p.relation)}</span>
        </div>
        <div class="m14-kv-row">
          <span class="m14-kv-k">剥离回填</span>
          <span class="m14-kv-v ${p.topsoilCompliant ? 'ok' : 'warn'}">${p.topsoilCompliant ? '合规 · ' : '待复核 · '}${escHtml(p.stripVol)}</span>
        </div>
      </div>

      <div class="m14-metrics-box">
        <div class="m14-metrics-kpis">
          <div class="m14-metric-cell">
            <span>植被 NDVI (${escHtml(uiState.leftEpoch)}→${escHtml(uiState.rightEpoch)})</span>
            <strong>${leftSeries.ndvi.toFixed(2)} → ${rightSeries.ndvi.toFixed(2)}</strong>
          </div>
          <div class="m14-metric-cell">
            <span>土壤含水率</span>
            <strong>${leftSeries.moisture.toFixed(1)}% → ${rightSeries.moisture.toFixed(1)}%</strong>
          </div>
        </div>
        ${buildMonitoringMiniSvg(p)}
      </div>

      <div class="m14-epoch-summary">
        <div class="m14-epoch-summary-title">两期影像示意</div>
        <div class="m14-epoch-summary-row">
          <strong>${escHtml(leftInfo.year)}</strong>
          <span>${escHtml(p.epochNotes[uiState.leftEpoch] || leftInfo.summary)}</span>
        </div>
        <div class="m14-epoch-summary-row">
          <strong>${escHtml(rightInfo.year)}</strong>
          <span>${escHtml(p.epochNotes[uiState.rightEpoch] || rightInfo.summary)}</span>
        </div>
      </div>

      <div class="m14-panel-actions">
        <button type="button" class="m14-btn-primary" id="m14FocusParcelBtn">
          ${ICONS.target}
          <span>定位选中地块</span>
        </button>
        <button type="button" class="m14-btn-secondary" id="m14DetailModalBtn">
          ${ICONS.chart}
          <span>监测详情</span>
        </button>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS (专项资料说明 & 地块监测详情)
     ------------------------------------------------------------------------ */
  function openPendingSpecModal() {
    if (!lastCtx || !lastCtx.openModal) return;
    lastCtx.openModal('黑土地保护专项资料接入说明', `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>已纳管演示地块</span><strong>6 块（HT-01~06）</strong></div>
        <div class="detail-stat-card"><span>多期遥感时相</span><strong>2024 / 2025 / 2026</strong></div>
        <div class="detail-stat-card"><span>专项接口状态</span><strong style="color:#fde047;">待接入实测数据</strong></div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>专项资料类别</th><th>当前状态</th><th>演示替代说明</th><th>拟接入来源</th></tr>
        </thead>
        <tbody>
          <tr>
            <td>0.5m 高分卫星正射影像</td>
            <td><span class="status-tag warn">演示渲染</span></td>
            <td>按明水—北安段典型黑土条田特征合成三期影像</td>
            <td>省自然资源遥感中心 WMTS</td>
          </tr>
          <tr>
            <td>黑土地永久保护红线矢量</td>
            <td><span class="status-tag info">标准矢量</span></td>
            <td>已实现与施工范围走廊的相交及缓冲区空间叠加</td>
            <td>国土空间规划 GeoJSON</td>
          </tr>
          <tr>
            <td>表土剥离与复垦台账</td>
            <td><span class="status-tag ok">结构就绪</span></td>
            <td>支持分地块剥离方量、堆存合规性与 NDVI 趋势核验</td>
            <td>环保水保监测物联网平台</td>
          </tr>
        </tbody>
      </table>
    `);
  }

  function openParcelDetailModal() {
    if (!lastCtx || !lastCtx.openModal) return;
    const p = PARCEL_MAP[uiState.selectedParcelId] || PARCELS[1];
    const latest = p.ndviSeries[p.ndviSeries.length - 1];
    lastCtx.openModal(`黑土地保护监测详情 · 地块 ${escHtml(p.id)}（${escHtml(p.name)}）`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>保护面积 / 等级</span><strong>${p.areaHa.toFixed(1)} 公顷</strong></div>
        <div class="detail-stat-card"><span>2026 植被指数 NDVI</span><strong>${latest.ndvi.toFixed(2)}</strong></div>
        <div class="detail-stat-card"><span>表土剥离回填状态</span><strong style="color:${p.topsoilCompliant ? '#4ade80' : '#fde047'};">${p.topsoilCompliant ? '合规达标' : '待现场复核'}</strong></div>
      </div>
      <table class="data-table">
        <thead>
          <tr><th>监测年份</th><th>植被指数 NDVI</th><th>耕层土壤含水率</th><th>遥感解译与保护措施核查</th></tr>
        </thead>
        <tbody>
          ${p.ndviSeries.map(row => `
            <tr>
              <td><strong>${escHtml(row.label)} 年</strong></td>
              <td>${row.ndvi.toFixed(2)}</td>
              <td>${row.moisture.toFixed(1)}%</td>
              <td>${escHtml(p.epochNotes[row.label] || '')}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <div class="detail-stat-card" style="background:rgba(12,42,92,0.45);">
        <span>表土剥离与复垦方案</span>
        <div style="margin-top:6px;font-size:12.5px;color:#e6f4ff;line-height:1.6;">
          <div><strong>剥离核验：</strong>${escHtml(p.topsoilStatus)}</div>
          <div><strong>工程措施：</strong>${escHtml(p.backfillPlan)}</div>
          <div><strong>所在工区与桩号：</strong>${escHtml(p.sectionName)}（${escHtml(p.stake)}）· ${escHtml(p.relation)}</div>
        </div>
      </div>
    `);
  }

  /* ------------------------------------------------------------------------
     MAIN TEMPLATE & EVENT BINDINGS
     ------------------------------------------------------------------------ */
  function buildHtml() {
    const leftMeta = EPOCH_META[uiState.leftEpoch];
    const rightMeta = EPOCH_META[uiState.rightEpoch];

    return `
      <div class="m14-root">
        <!-- TOP MODULE TOOLBAR -->
        <div class="m14-toolbar">
          <div class="m14-toolbar-left">
            <div class="m14-scope-pill">
              ${ICONS.pin}
              <strong>明水至北安段</strong>
              <span>沿线演示区</span>
            </div>
            <div class="m14-search-wrap">
              ${ICONS.search}
              <input type="text" class="m14-search-input" id="m14SearchInput"
                value="${escHtml(uiState.searchQuery)}"
                placeholder="输入地块编号 HT-01~HT-06"
                aria-label="搜索黑土地保护地块编号" />
            </div>
            <button type="button" class="m14-locate-btn" id="m14LocateSearchBtn">
              ${ICONS.target}
              <span>定位地块</span>
            </button>
          </div>

          <div class="m14-toolbar-right">
            <div class="m14-sync-badge">
              ${ICONS.sync}
              <span>左右视图同步</span>
            </div>
            <button type="button" class="m14-pending-badge" id="m14PendingBadgeBtn">专项资料待接入</button>
          </div>
        </div>

        <!-- INTERACTIVE SPLIT-CURTAIN COMPARISON STAGE -->
        <div class="m14-stage" id="m14Stage">
          <div class="m14-layer-right">
            <canvas class="m14-canvas" id="m14CanvasRight"></canvas>
          </div>
          <div class="m14-layer-left" id="m14LeftLayer" style="clip-path: inset(0 ${100 - uiState.splitRatio}% 0 0);">
            <canvas class="m14-canvas" id="m14CanvasLeft"></canvas>
          </div>

          <!-- SYNCHRONIZED PURE-SVG VECTOR OVERLAY -->
          <svg class="m14-svg-overlay" id="m14SvgOverlay" xmlns="http://www.w3.org/2000/svg"></svg>

          <!-- SPLIT-CURTAIN DIVIDER -->
          <div class="m14-divider" id="m14Divider" style="left: ${uiState.splitRatio}%;">
            <div class="m14-handle" id="m14Handle"
              role="slider"
              tabindex="0"
              aria-label="拖动卷帘对比左右两期遥感影像"
              aria-valuemin="5"
              aria-valuemax="95"
              aria-valuenow="${Math.round(uiState.splitRatio)}">
              <div class="m14-handle-circle">${ICONS.splitArrows}</div>
              <div class="m14-handle-pill">拖动卷帘对比</div>
            </div>
          </div>

          <!-- FLOATING EPOCH DROPDOWNS -->
          <div class="m14-epoch-bar">
            <div class="m14-epoch-picker">
              <span>左侧影像</span>
              <select class="m14-epoch-select" id="m14LeftEpochSelect" aria-label="选择左侧遥感影像年份">
                <option value="2024" ${uiState.leftEpoch === '2024' ? 'selected' : ''}>2024 年</option>
                <option value="2025" ${uiState.leftEpoch === '2025' ? 'selected' : ''}>2025 年</option>
                <option value="2026" ${uiState.leftEpoch === '2026' ? 'selected' : ''}>2026 年</option>
              </select>
              <span class="m14-epoch-tag ${leftMeta.tagTone}" id="m14LeftEpochTag">${escHtml(leftMeta.tag)}</span>
            </div>

            <div class="m14-epoch-picker">
              <span>右侧影像</span>
              <select class="m14-epoch-select" id="m14RightEpochSelect" aria-label="选择右侧遥感影像年份">
                <option value="2024" ${uiState.rightEpoch === '2024' ? 'selected' : ''}>2024 年</option>
                <option value="2025" ${uiState.rightEpoch === '2025' ? 'selected' : ''}>2025 年</option>
                <option value="2026" ${uiState.rightEpoch === '2026' ? 'selected' : ''}>2026 年</option>
              </select>
              <span class="m14-epoch-tag ${rightMeta.tagTone}" id="m14RightEpochTag">${escHtml(rightMeta.tag)}</span>
            </div>
          </div>

          <!-- LEFT FLOATING PANEL: 图层叠加 -->
          <aside class="glass-panel m14-left-panel ${uiState.layersPanelCollapsed ? 'collapsed' : ''}" id="m14LayersPanel">
            <div class="panel-header" id="m14LayersPanelHeader">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">图层叠加</span>
              </div>
              <button type="button" class="panel-toggle-btn" aria-label="折叠或展开图层叠加">${ICONS.chevronDown}</button>
            </div>
            <div class="panel-body">
              <div class="m14-layer-list">
                <label class="m14-layer-item">
                  <span class="m14-layer-label">
                    <input type="checkbox" data-layer="basemap" ${uiState.layers.basemap ? 'checked' : ''} />
                    <span>高分遥感底图</span>
                  </span>
                  <span class="m14-swatch-raster"></span>
                </label>
                <label class="m14-layer-item">
                  <span class="m14-layer-label">
                    <input type="checkbox" data-layer="protection" ${uiState.layers.protection ? 'checked' : ''} />
                    <span>黑土地保护范围</span>
                  </span>
                  <span class="m14-swatch-soil"></span>
                </label>
                <label class="m14-layer-item">
                  <span class="m14-layer-label">
                    <input type="checkbox" data-layer="corridor" ${uiState.layers.corridor ? 'checked' : ''} />
                    <span>工程施工范围</span>
                  </span>
                  <span class="m14-swatch-corridor"></span>
                </label>
                <label class="m14-layer-item">
                  <span class="m14-layer-label">
                    <input type="checkbox" data-layer="labels" ${uiState.layers.labels ? 'checked' : ''} />
                    <span>地块标识</span>
                  </span>
                  <span class="m14-swatch-ht">HT</span>
                </label>
              </div>
              <div class="m14-layer-tip">
                ${ICONS.info}
                <span>两侧影像同步叠加所选图层</span>
              </div>
            </div>
          </aside>

          <!-- RIGHT FLOATING PANEL: 地块信息 -->
          <aside class="glass-panel m14-right-panel">
            <div class="panel-header" style="cursor:default;">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">地块信息</span>
              </div>
              <span class="m14-demo-chip">演示地块</span>
            </div>
            <div class="m14-right-body" id="m14ParcelInfoBody"></div>
          </aside>

          <!-- BOTTOM-LEFT SCALE / NOTICE -->
          <div class="m14-scale-badge">
            ${ICONS.north}
            <span>北向示意 影像与范围均为演示</span>
            <span style="opacity:0.45;">|</span>
            <span class="m14-scale-val" id="m14ZoomText">${uiState.zoom.toFixed(1)}×</span>
          </div>

          <!-- BOTTOM-RIGHT MAP CONTROLS (CLEAR OF .floating-br) -->
          <div class="m14-map-controls" role="group" aria-label="影像视图缩放与定位控制">
            <button type="button" class="m14-ctrl-btn" id="m14ZoomInBtn">${ICONS.plus}<span>放大</span></button>
            <button type="button" class="m14-ctrl-btn" id="m14ZoomOutBtn">${ICONS.minus}<span>缩小</span></button>
            <button type="button" class="m14-ctrl-btn" id="m14FocusBtn">${ICONS.target}<span>定位</span></button>
            <button type="button" class="m14-ctrl-btn" id="m14ResetBtn">${ICONS.reset}<span>视图复位</span></button>
          </div>
        </div>
      </div>
    `;
  }

  function handleSearchLocate() {
    const input = document.getElementById('m14SearchInput');
    const raw = (input ? input.value : uiState.searchQuery).trim().toUpperCase();
    uiState.searchQuery = raw;

    const match = PARCELS.find(p =>
      p.id.toUpperCase() === raw ||
      p.id.toUpperCase().includes(raw) ||
      p.name.toUpperCase().includes(raw)
    );

    if (!match) {
      if (lastCtx && lastCtx.showToast) {
        lastCtx.showToast('未找到匹配地块，请输入 HT-01 ~ HT-06');
      }
      return;
    }
    focusParcel(match.id, true);
    if (lastCtx && lastCtx.showToast) {
      lastCtx.showToast(`已定位黑土地地块 ${match.id}（${match.stake}）`);
    }
  }

  function bindEvents(hostEl) {
    const stage = document.getElementById('m14Stage');
    const divider = document.getElementById('m14Divider');
    const handle = document.getElementById('m14Handle');

    // 1. Search & toolbar actions
    const searchInput = document.getElementById('m14SearchInput');
    const locateSearchBtn = document.getElementById('m14LocateSearchBtn');
    const pendingBtn = document.getElementById('m14PendingBadgeBtn');

    if (searchInput) {
      searchInput.addEventListener('input', e => {
        uiState.searchQuery = e.target.value;
      });
      searchInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSearchLocate();
        }
      });
    }
    if (locateSearchBtn) locateSearchBtn.addEventListener('click', handleSearchLocate);
    if (pendingBtn) pendingBtn.addEventListener('click', openPendingSpecModal);

    // 2. Split-curtain drag + keyboard slider
    let draggingSplit = false;
    function updateSplitFromClientX(clientX) {
      const rect = stage.getBoundingClientRect();
      if (!rect.width) return;
      const pct = ((clientX - rect.left) / rect.width) * 100;
      uiState.splitRatio = Math.max(5, Math.min(95, pct));
      syncSplitInPlace();
    }

    if (divider && handle) {
      divider.addEventListener('pointerdown', e => {
        e.stopPropagation();
        draggingSplit = true;
        divider.classList.add('dragging');
        if (divider.setPointerCapture) divider.setPointerCapture(e.pointerId);
        updateSplitFromClientX(e.clientX);
      });
      divider.addEventListener('pointermove', e => {
        if (!draggingSplit) return;
        e.stopPropagation();
        updateSplitFromClientX(e.clientX);
      });
      const stopSplitDrag = () => {
        if (!draggingSplit) return;
        draggingSplit = false;
        divider.classList.remove('dragging');
      };
      divider.addEventListener('pointerup', stopSplitDrag);
      divider.addEventListener('pointercancel', stopSplitDrag);

      handle.addEventListener('keydown', e => {
        const step = e.shiftKey ? 5 : 2;
        if (e.key === 'ArrowLeft') {
          e.preventDefault();
          uiState.splitRatio = Math.max(5, uiState.splitRatio - step);
          syncSplitInPlace();
        } else if (e.key === 'ArrowRight') {
          e.preventDefault();
          uiState.splitRatio = Math.min(95, uiState.splitRatio + step);
          syncSplitInPlace();
        } else if (e.key === 'Home') {
          e.preventDefault();
          uiState.splitRatio = 5;
          syncSplitInPlace();
        } else if (e.key === 'End') {
          e.preventDefault();
          uiState.splitRatio = 95;
          syncSplitInPlace();
        }
      });
    }

    // 3. Synchronized Pan & Mouse-Wheel Zoom on Stage
    let panning = false;
    let panStartX = 0;
    let panStartY = 0;
    let origPanX = 0;
    let origPanY = 0;
    let downTarget = null;

    if (stage) {
      stage.addEventListener('pointerdown', e => {
        if (e.target.closest('.m14-divider, .m14-left-panel, .m14-right-panel, .m14-epoch-bar, .m14-map-controls, .m14-scale-badge')) {
          return;
        }
        panning = true;
        downTarget = e.target;
        panStartX = e.clientX;
        panStartY = e.clientY;
        origPanX = uiState.panX;
        origPanY = uiState.panY;
        stage.classList.add('panning');
        if (stage.setPointerCapture) stage.setPointerCapture(e.pointerId);
      });

      stage.addEventListener('pointermove', e => {
        if (!panning) return;
        const dx = e.clientX - panStartX;
        const dy = e.clientY - panStartY;
        if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
          if (animFrameId) {
            cancelAnimationFrame(animFrameId);
            animFrameId = null;
          }
        }
        const { width: stageW, height: stageH } = getStageRect();
        const clamped = clampPan(origPanX + dx, origPanY + dy, uiState.zoom, stageW, stageH);
        uiState.panX = clamped.x;
        uiState.panY = clamped.y;
        syncStageGraphics();
      });

      const stopPan = e => {
        if (!panning) return;
        const moved = Math.hypot(e.clientX - panStartX, e.clientY - panStartY);
        const clickTarget = downTarget;
        panning = false;
        downTarget = null;
        stage.classList.remove('panning');
        if (moved < 5 && clickTarget) {
          const hit = clickTarget.closest ? clickTarget.closest('[data-parcel]') : null;
          if (hit) {
            const pid = hit.getAttribute('data-parcel');
            if (PARCEL_MAP[pid]) {
              uiState.selectedParcelId = pid;
              uiState.searchQuery = pid;
              if (searchInput) searchInput.value = pid;
              renderParcelInfoPanel();
              syncStageGraphics();
              if (lastCtx && lastCtx.showToast) {
                lastCtx.showToast(`已选中地块 ${pid}（${PARCEL_MAP[pid].name}）`);
              }
            }
          }
        }
      };
      stage.addEventListener('pointerup', stopPan);
      stage.addEventListener('pointercancel', stopPan);

      // Mouse wheel zoom around pointer
      stage.addEventListener('wheel', e => {
        if (e.target.closest('.m14-right-panel, .m14-left-panel')) return;
        e.preventDefault();
        if (animFrameId) {
          cancelAnimationFrame(animFrameId);
          animFrameId = null;
        }
        const { width: stageW, height: stageH } = getStageRect();
        const rect = stage.getBoundingClientRect();
        const cursorX = e.clientX - rect.left;
        const cursorY = e.clientY - rect.top;

        const oldZoom = uiState.zoom;
        const delta = e.deltaY < 0 ? 0.2 : -0.2;
        const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(oldZoom + delta).toFixed(2)));
        if (newZoom === oldZoom) return;

        const factor = newZoom / oldZoom;
        const cxOffset = cursorX - stageW / 2;
        const cyOffset = cursorY - stageH / 2;
        const nextPanX = cxOffset - (cxOffset - uiState.panX) * factor;
        const nextPanY = cyOffset - (cyOffset - uiState.panY) * factor;
        const clamped = clampPan(nextPanX, nextPanY, newZoom, stageW, stageH);

        uiState.zoom = newZoom;
        uiState.panX = clamped.x;
        uiState.panY = clamped.y;
        syncStageGraphics();
      }, { passive: false });
    }

    // 4. Epoch Selectors
    const leftEpochSel = document.getElementById('m14LeftEpochSelect');
    const rightEpochSel = document.getElementById('m14RightEpochSelect');

    function updateEpochTag(elId, epochVal) {
      const tagEl = document.getElementById(elId);
      const meta = EPOCH_META[epochVal];
      if (!tagEl || !meta) return;
      tagEl.textContent = meta.tag;
      tagEl.className = `m14-epoch-tag ${meta.tagTone}`;
    }

    if (leftEpochSel) {
      leftEpochSel.addEventListener('change', e => {
        uiState.leftEpoch = e.target.value;
        updateEpochTag('m14LeftEpochTag', uiState.leftEpoch);
        syncStageGraphics();
        renderParcelInfoPanel();
        if (lastCtx && lastCtx.showToast) {
          lastCtx.showToast(`左侧影像已切换至 ${EPOCH_META[uiState.leftEpoch].year}（${EPOCH_META[uiState.leftEpoch].tag}）`);
        }
      });
    }
    if (rightEpochSel) {
      rightEpochSel.addEventListener('change', e => {
        uiState.rightEpoch = e.target.value;
        updateEpochTag('m14RightEpochTag', uiState.rightEpoch);
        syncStageGraphics();
        renderParcelInfoPanel();
        if (lastCtx && lastCtx.showToast) {
          lastCtx.showToast(`右侧影像已切换至 ${EPOCH_META[uiState.rightEpoch].year}（${EPOCH_META[uiState.rightEpoch].tag}）`);
        }
      });
    }

    // 5. Left Panel Layer Checkboxes & Collapse Toggle
    const layersHeader = document.getElementById('m14LayersPanelHeader');
    const layersPanel = document.getElementById('m14LayersPanel');
    if (layersHeader && layersPanel) {
      layersHeader.addEventListener('click', () => {
        uiState.layersPanelCollapsed = !uiState.layersPanelCollapsed;
        layersPanel.classList.toggle('collapsed', uiState.layersPanelCollapsed);
      });
    }

    hostEl.querySelectorAll('input[data-layer]').forEach(cb => {
      cb.addEventListener('change', e => {
        const key = e.target.getAttribute('data-layer');
        uiState.layers[key] = e.target.checked;
        syncStageGraphics();
      });
    });

    // 6. Right Panel Delegated Buttons (Focus & Detail Modal)
    const infoBody = document.getElementById('m14ParcelInfoBody');
    if (infoBody) {
      infoBody.addEventListener('click', e => {
        if (e.target.closest('#m14FocusParcelBtn')) {
          focusParcel(uiState.selectedParcelId, true);
          if (lastCtx && lastCtx.showToast) {
            lastCtx.showToast(`已居中定位地块 ${uiState.selectedParcelId}`);
          }
        } else if (e.target.closest('#m14DetailModalBtn')) {
          openParcelDetailModal();
        }
      });
    }

    // 7. Bottom-Right Map Controls
    const zoomInBtn = document.getElementById('m14ZoomInBtn');
    const zoomOutBtn = document.getElementById('m14ZoomOutBtn');
    const focusBtn = document.getElementById('m14FocusBtn');
    const resetBtn = document.getElementById('m14ResetBtn');

    if (zoomInBtn) {
      zoomInBtn.addEventListener('click', () => {
        const nextZoom = Math.min(MAX_ZOOM, +(uiState.zoom + 0.25).toFixed(2));
        const factor = nextZoom / uiState.zoom;
        const { width: stageW, height: stageH } = getStageRect();
        const clamped = clampPan(uiState.panX * factor, uiState.panY * factor, nextZoom, stageW, stageH);
        animateViewTo(nextZoom, clamped.x, clamped.y, 220);
      });
    }
    if (zoomOutBtn) {
      zoomOutBtn.addEventListener('click', () => {
        const nextZoom = Math.max(MIN_ZOOM, +(uiState.zoom - 0.25).toFixed(2));
        const factor = nextZoom / uiState.zoom;
        const { width: stageW, height: stageH } = getStageRect();
        const clamped = clampPan(uiState.panX * factor, uiState.panY * factor, nextZoom, stageW, stageH);
        animateViewTo(nextZoom, clamped.x, clamped.y, 220);
      });
    }
    if (focusBtn) {
      focusBtn.addEventListener('click', () => {
        focusParcel(uiState.selectedParcelId, true);
        if (lastCtx && lastCtx.showToast) {
          lastCtx.showToast(`已定位当前选中地块 ${uiState.selectedParcelId}`);
        }
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        uiState.splitRatio = 50;
        syncSplitInPlace();
        animateViewTo(1.0, 0, 0, 300);
        if (lastCtx && lastCtx.showToast) {
          lastCtx.showToast('已复位遥感对比视图（1.0×）');
        }
      });
    }

    // 8. Responsive ResizeObserver on Stage
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (typeof ResizeObserver !== 'undefined' && stage) {
      resizeObserver = new ResizeObserver(() => {
        syncStageGraphics();
      });
      resizeObserver.observe(stage);
    }
  }

  /* ------------------------------------------------------------------------
     LIFECYCLE HOOKS
     ------------------------------------------------------------------------ */
  function render(hostEl, subPageId, ctx) {
    lastHost = hostEl;
    lastCtx = ctx;
    ensureStyles();
    ensureEpochCanvases();

    hostEl.innerHTML = buildHtml();
    renderParcelInfoPanel();
    bindEvents(hostEl);
    syncSplitInPlace();
    syncStageGraphics();
  }

  function onSectionChange(secId) {
    if (!lastHost) return;
    if (!secId) {
      animateViewTo(1.0, 0, 0, 320);
      return;
    }
    const secParcel = PARCELS.find(p => p.sectionId === secId);
    if (secParcel) {
      focusParcel(secParcel.id, true);
      if (lastCtx && lastCtx.showToast) {
        lastCtx.showToast(`已联动${secParcel.sectionName}黑土地保护地块 ${secParcel.id}`);
      }
    }
  }

  function onLeave() {
    if (animFrameId) {
      cancelAnimationFrame(animFrameId);
      animFrameId = null;
    }
    if (resizeObserver) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    if (lastHost) {
      lastHost.innerHTML = '';
      lastHost = null;
    }
    lastCtx = null;
  }

  /* ------------------------------------------------------------------------
     REGISTER PLUGIN
     ------------------------------------------------------------------------ */
  if (window.JIHEI_PLATFORM && typeof window.JIHEI_PLATFORM.registerModule === 'function') {
    window.JIHEI_PLATFORM.registerModule({
      id: 'blacksoil',
      name: '黑土地保护',
      subPages: SUB_PAGES,
      getCesiumMode: () => 'opaque',
      render,
      onSectionChange,
      onLeave
    });
  }
})();
