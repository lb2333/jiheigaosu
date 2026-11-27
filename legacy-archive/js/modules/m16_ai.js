/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   Module 16: AI助手工作台 (m16_ai.js)
   3 Subpages (Scenarios): 展厅讲解 (exhibition) | 管理研判 (analysis) | 一线办理 (field)
   ========================================================================== */
(function () {
  'use strict';

  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';
  const IMG = {
    corridor: ASSET_BASE + 'corridor_aerial.jpg',
    showcase: ASSET_BASE + 'showcase_viaduct.jpg',
    after: ASSET_BASE + 'milestone_after.jpg',
    before: ASSET_BASE + 'milestone_before.jpg'
  };

  const SUB_PAGES = [
    { id: 'exhibition', name: '展厅讲解' },
    { id: 'analysis', name: '管理研判' },
    { id: 'field', name: '一线办理' }
  ];

  const SECTION_NAME_BY_ID = {
    sec1: '一工区',
    sec2: '二工区',
    sec3: '三工区',
    sec4: '四工区',
    sec5: '五工区',
    sec6: '六工区'
  };

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const SVG = {
    bot: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="7" width="16" height="12" rx="3.5"/><path d="M12 3v4"/><circle cx="12" cy="2.5" r="1" fill="currentColor"/><circle cx="9.2" cy="12.5" r="1.2" fill="currentColor"/><circle cx="14.8" cy="12.5" r="1.2" fill="currentColor"/><path d="M9 16h6"/><path d="M2 12h2M20 12h2"/></svg>`,
    spark: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l1.9 4.7L18.5 9.5l-4.6 1.8L12 16l-1.9-4.7L5.5 9.5l4.6-1.8L12 3z"/><path d="M19 15l.9 2.1L22 18l-2.1.9L19 21l-.9-2.1L16 18l2.1-.9L19 15z"/></svg>`,
    mic: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0014 0"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="8.5" y1="22" x2="15.5" y2="22"/></svg>`,
    send: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    play: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>`,
    pause: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    mapPin: `<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
    sandbox: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>`,
    doc: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
    chart: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 3l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V6l8-3z"/><path d="M9 12l2 2 4-4"/></svg>`,
    card: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
    lock: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 018 0v4"/></svg>`,
    check: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>`,
    external: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    layers: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    history: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15 14"/></svg>`,
    refresh: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`
  };

  /* ------------------------------------------------------------------------
     SCENARIO CONFIG & SIMULATION DATASETS
     ------------------------------------------------------------------------ */
  const SCENARIOS = {
    exhibition: {
      id: 'exhibition',
      name: '展厅讲解',
      subtitle: '语音导览与沙盘视角联动',
      contextBadge: '平安工地 / 项目展示',
      linkedModule: 'pingan',
      linkedSubPage: 'showcase',
      voiceSample: '盖梁拓宽专题有哪些阶段成果？',
      quickPrompts: [
        '盖梁拓宽专题有哪些成果?',
        '播放项目宣传片',
        '介绍一下二工区场站与便道情况'
      ],
      summaryDesc: '面向领导调研与展厅汇报场景，支持一键播报工程概况、课题阶段成果与已发布三维沙盘视角切换。',
      sandboxViews: [
        {
          id: 'sv-1',
          title: '二工区场站俯视',
          stake: 'K28+400',
          desc: '料场示例A · 场站及施工便道',
          secId: 'sec2',
          img: IMG.corridor
        },
        {
          id: 'sv-2',
          title: '寒区盖梁拓宽试验桥',
          stake: 'K42+150',
          desc: 'KT-04 钢悬臂拓宽施工示范点',
          secId: 'sec2',
          img: IMG.showcase
        },
        {
          id: 'sv-3',
          title: '标准段路基路面示范区',
          stake: 'K18+600',
          desc: '全线智慧提速与交安标准化走廊',
          secId: 'sec1',
          img: IMG.after
        }
      ],
      defaultThread: {
        id: 'conv-exhibition-1',
        title: '明北段工程与盖梁拓宽专题讲解',
        time: '11-26 10:15',
        pinned: true,
        messages: [
          {
            role: 'user',
            isVoice: true,
            text: '介绍一下明北段工程和盖梁拓宽专题'
          },
          {
            role: 'ai',
            cardType: 'exhibition_card'
          }
        ]
      }
    },
    analysis: {
      id: 'analysis',
      name: '管理研判',
      subtitle: '多业务指标核对与关联诊断',
      contextBadge: '质量管理 / 质量总览',
      linkedModule: 'quality',
      linkedSubPage: 'overview',
      voiceSample: '二工区哪些工序进度滞后，梁场产量怎么样？',
      quickPrompts: [
        '梁场产量怎么样?',
        '哪些工序进度滞后?',
        '备料还差多少?'
      ],
      summaryDesc: '面向项目管理人员日常研判，自动对比工区与全线基准，关联进度、安全与计量数据并附原始台账依据。',
      qualityBars: [
        { secId: 'sec1', name: '一工区', pct: 98.9, batches: 1412 },
        { secId: 'sec2', name: '二工区', pct: 98.4, batches: 1386, highlight: true },
        { secId: 'sec3', name: '三工区', pct: 98.7, batches: 1450 },
        { secId: 'sec4', name: '四工区', pct: 98.6, batches: 1320 },
        { secId: 'sec5', name: '五工区', pct: 98.8, batches: 1468 },
        { secId: 'sec6', name: '六工区', pct: 99.0, batches: 1400 }
      ],
      defaultThread: {
        id: 'conv-analysis-1',
        title: '二工区 11 月质量及关联业务研判',
        time: '11-25 10:45',
        pinned: true,
        messages: [
          {
            role: 'user',
            isVoice: false,
            text: '二工区本月质量怎么样? 帮我一起查下进度、安全和计量。'
          },
          {
            role: 'ai',
            cardType: 'analysis_card'
          }
        ]
      }
    },
    field: {
      id: 'field',
      name: '一线办理',
      subtitle: '审核待办核对与人工授权下发',
      contextBadge: '信息发布 / 审核发布',
      linkedModule: 'publish',
      linkedSubPage: 'review',
      voiceSample: '生成授权待办，并说明在哪里查看设备回执',
      quickPrompts: [
        '生成授权待办',
        '在哪里查看显示回执?',
        '低能见度提示怎么安排下发?'
      ],
      summaryDesc: '面向一线调度与值班人员，提供发布单审核指引、关键参数复核及需人工确认的设备下发授权办理入口。',
      defaultThread: {
        id: 'conv-field-1',
        title: '施工出口提示发布办理与授权',
        time: '11-26 11:20',
        pinned: true,
        messages: [
          {
            role: 'user',
            isVoice: false,
            text: '“施工出口提示”已审核，下一步怎么发到情报板?'
          },
          {
            role: 'ai',
            cardType: 'field_card'
          }
        ]
      }
    }
  };

  const WAVEFORM_BARS = [
    22, 34, 52, 40, 68, 86, 62, 46, 78, 92, 56, 38, 72, 88, 64, 48, 82, 95, 58, 42, 66, 74, 44, 30, 50, 36, 24
  ];

  /* ------------------------------------------------------------------------
     SCOPED MODULE STYLES (.m16-* ONLY)
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('m16-styles')) return;
    const style = document.createElement('style');
    style.id = 'm16-styles';
    style.textContent = `
      .m16-page {
        width: 100%;
        min-height: 100%;
        padding: 12px 16px 100px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: var(--text-main);
      }

      /* Top Workbench Bar */
      .m16-topbar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 10px 16px;
        border-radius: 10px;
        background: linear-gradient(90deg, rgba(10, 34, 78, 0.9) 0%, rgba(7, 24, 58, 0.86) 100%);
        border: 1px solid rgba(56, 189, 248, 0.4);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m16-brand {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .m16-brand-ico {
        width: 34px;
        height: 34px;
        border-radius: 9px;
        background: linear-gradient(135deg, rgba(34, 211, 238, 0.25), rgba(22, 119, 255, 0.32));
        border: 1px solid rgba(56, 242, 255, 0.65);
        color: #38f2ff;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 14px rgba(34, 211, 238, 0.28);
        flex-shrink: 0;
      }
      .m16-brand-title {
        font-size: 15px;
        font-weight: 700;
        letter-spacing: 0.4px;
        color: #f1f7ff;
      }
      .m16-brand-sub {
        font-size: 11.5px;
        color: #8ab4dc;
        margin-top: 1px;
      }
      .m16-topbar-meta {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .m16-ctx-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 4px 10px;
        border-radius: 99px;
        background: rgba(14, 52, 112, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.42);
        color: #bae6fd;
        font-size: 12px;
        font-weight: 500;
      }
      .m16-ctx-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
        background: #22c55e;
        box-shadow: 0 0 8px #22c55e;
      }
      .m16-sec-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 99px;
        background: rgba(250, 204, 21, 0.12);
        border: 1px solid rgba(250, 204, 21, 0.48);
        color: #fde047;
        font-size: 12px;
        font-weight: 600;
      }

      /* 3-Column Workbench Grid */
      .m16-grid {
        display: grid;
        grid-template-columns: 274px minmax(0, 1fr) 316px;
        gap: 12px;
        align-items: stretch;
        flex: 1;
        min-height: 600px;
      }
      @media (max-width: 1220px) {
        .m16-grid {
          grid-template-columns: 245px minmax(0, 1fr) 280px;
        }
      }
      @media (max-width: 980px) {
        .m16-grid {
          grid-template-columns: 1fr;
        }
      }

      /* Glass Panel Base */
      .m16-col-panel {
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.86) 0%, rgba(6, 20, 48, 0.88) 100%);
        border: 1px solid var(--border-cyan);
        border-radius: 11px;
        backdrop-filter: blur(14px);
        box-shadow: var(--shadow-panel);
        display: flex;
        flex-direction: column;
        overflow: hidden;
        min-height: 0;
      }
      .m16-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 14px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.2);
        background: rgba(8, 28, 66, 0.6);
        gap: 8px;
      }
      .m16-head-left {
        display: flex;
        align-items: center;
        gap: 8px;
        min-width: 0;
      }
      .m16-panel-scroll {
        padding: 12px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }

      /* Left Panel: Scenario Cards */
      .m16-sec-label {
        font-size: 11.5px;
        font-weight: 600;
        color: #8ab4dc;
        letter-spacing: 0.4px;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .m16-scenario-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m16-scenario-card {
        text-align: left;
        width: 100%;
        padding: 10px 11px;
        border-radius: 9px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        color: #dbeafe;
        cursor: pointer;
        transition: all 0.18s;
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .m16-scenario-card:hover {
        border-color: rgba(56, 220, 255, 0.62);
        background: rgba(18, 60, 128, 0.72);
      }
      .m16-scenario-card.active {
        border-color: #38f2ff;
        background: linear-gradient(135deg, rgba(22, 102, 204, 0.52), rgba(10, 44, 98, 0.85));
        box-shadow: 0 0 16px rgba(34, 211, 238, 0.26);
      }
      .m16-sc-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
      }
      .m16-sc-name {
        font-size: 13.5px;
        font-weight: 700;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .m16-sc-tag {
        font-size: 10.5px;
        padding: 2px 7px;
        border-radius: 99px;
        background: rgba(56, 189, 248, 0.16);
        border: 1px solid rgba(56, 189, 248, 0.36);
        color: #7dd3fc;
        white-space: nowrap;
      }
      .m16-scenario-card.active .m16-sc-tag {
        background: rgba(34, 211, 238, 0.22);
        border-color: rgba(56, 242, 255, 0.72);
        color: #e0f2fe;
      }
      .m16-sc-sub {
        font-size: 11.5px;
        color: #9ec0e6;
      }

      .m16-btn-new-chat {
        width: 100%;
        height: 34px;
        border-radius: 8px;
        border: 1px solid rgba(56, 220, 255, 0.58);
        background: linear-gradient(180deg, rgba(27, 136, 255, 0.9), rgba(11, 95, 214, 0.92));
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.38);
        transition: all 0.18s;
      }
      .m16-btn-new-chat:hover {
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
        transform: translateY(-1px);
      }

      /* History List */
      .m16-history-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m16-history-item {
        width: 100%;
        text-align: left;
        padding: 8px 10px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.18);
        background: rgba(9, 32, 74, 0.55);
        color: #cfe4ff;
        cursor: pointer;
        transition: all 0.15s;
      }
      .m16-history-item:hover {
        border-color: rgba(56, 189, 248, 0.5);
        background: rgba(15, 50, 108, 0.7);
      }
      .m16-history-item.active {
        border-color: #38f2ff;
        background: rgba(20, 74, 152, 0.62);
      }
      .m16-hist-title {
        font-size: 12px;
        font-weight: 600;
        color: #f1f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m16-hist-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 10.5px;
        color: #7ea6cf;
        margin-top: 3px;
      }

      /* Prompt Presets */
      .m16-prompt-list {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m16-prompt-btn {
        text-align: left;
        padding: 7px 10px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.26);
        background: rgba(11, 38, 86, 0.55);
        color: #d8ecff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s;
        line-height: 1.35;
      }
      .m16-prompt-btn:hover {
        border-color: #38f2ff;
        color: #ffffff;
        background: rgba(20, 70, 142, 0.72);
      }

      /* Center Panel: Main Conversation Stage */
      .m16-chat-stage {
        display: flex;
        flex-direction: column;
        flex: 1;
        min-height: 0;
      }
      .m16-chat-stream {
        flex: 1;
        overflow-y: auto;
        padding: 16px 18px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .m16-msg-user-wrap {
        display: flex;
        flex-direction: column;
        align-items: flex-end;
        gap: 5px;
      }
      .m16-voice-badge {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        font-size: 11px;
        color: #7dd3fc;
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(14, 56, 118, 0.66);
        border: 1px solid rgba(56, 189, 248, 0.34);
      }
      .m16-user-bubble {
        max-width: 82%;
        padding: 10px 15px;
        border-radius: 12px 12px 2px 12px;
        background: linear-gradient(135deg, rgba(24, 114, 226, 0.85), rgba(14, 72, 168, 0.92));
        border: 1px solid rgba(125, 211, 252, 0.6);
        color: #ffffff;
        font-size: 13.5px;
        line-height: 1.5;
        box-shadow: 0 4px 16px rgba(14, 72, 168, 0.38);
      }

      /* Structured AI Card */
      .m16-ai-card {
        width: 100%;
        padding: 15px 16px;
        border-radius: 12px;
        background: linear-gradient(180deg, rgba(12, 42, 92, 0.78) 0%, rgba(8, 28, 66, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.38);
        box-shadow: 0 8px 24px rgba(0, 12, 36, 0.45), inset 0 1px 0 rgba(125, 211, 252, 0.18);
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .m16-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
      }
      .m16-card-title {
        font-size: 15.5px;
        font-weight: 700;
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m16-card-time {
        font-size: 11.5px;
        color: #8ab4dc;
        font-variant-numeric: tabular-nums;
      }
      .m16-card-text {
        font-size: 13px;
        line-height: 1.65;
        color: #dcecff;
      }

      /* Exhibition Audio Player Bar */
      .m16-audio-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 14px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(9, 32, 74, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.34);
      }
      .m16-audio-left {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }
      .m16-play-btn {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        border: 1px solid rgba(56, 242, 255, 0.72);
        background: linear-gradient(180deg, rgba(22, 119, 255, 0.85), rgba(10, 68, 162, 0.92));
        color: #ffffff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.18s;
      }
      .m16-play-btn:hover {
        box-shadow: 0 0 14px rgba(56, 242, 255, 0.55);
        transform: scale(1.04);
      }
      .m16-audio-title {
        font-size: 13px;
        font-weight: 700;
        color: #f1f7ff;
      }
      .m16-audio-sub {
        font-size: 11px;
        color: #8ab4dc;
        margin-top: 2px;
      }
      .m16-audio-right {
        display: flex;
        align-items: center;
        gap: 12px;
        flex: 1;
        justify-content: flex-end;
      }
      .m16-wave-svg {
        width: 170px;
        max-width: 100%;
        height: 30px;
        cursor: pointer;
        display: block;
      }
      .m16-audio-timer {
        font-size: 12px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        color: #bae6fd;
        white-space: nowrap;
      }

      /* Exhibition Sandbox Preview Card */
      .m16-sandbox-card {
        display: grid;
        grid-template-columns: 220px minmax(0, 1fr);
        gap: 14px;
        padding: 10px;
        border-radius: 10px;
        background: rgba(8, 28, 66, 0.82);
        border: 1px solid rgba(56, 189, 248, 0.34);
        align-items: center;
      }
      @media (max-width: 720px) {
        .m16-sandbox-card { grid-template-columns: 1fr; }
      }
      .m16-sandbox-thumb {
        position: relative;
        aspect-ratio: 16 / 10;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.45);
        background: #041024;
      }
      .m16-sandbox-thumb img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .m16-stake-badge {
        position: absolute;
        left: 7px;
        bottom: 7px;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 8px;
        border-radius: 6px;
        background: rgba(5, 19, 43, 0.86);
        border: 1px solid rgba(56, 220, 255, 0.55);
        color: #f1f7ff;
        font-size: 11px;
        font-weight: 600;
      }
      .m16-sandbox-info {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m16-sandbox-kicker {
        font-size: 11px;
        color: #38f2ff;
        font-weight: 600;
      }
      .m16-sandbox-name {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
      }
      .m16-sandbox-desc {
        font-size: 12px;
        color: #9ec0e6;
      }
      .m16-sandbox-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-top: 4px;
        flex-wrap: wrap;
      }
      .m16-btn-sandbox {
        height: 30px;
        padding: 0 12px;
        border-radius: 7px;
        border: 1px solid rgba(56, 220, 255, 0.65);
        background: linear-gradient(180deg, rgba(22, 119, 255, 0.86), rgba(11, 74, 178, 0.92));
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        transition: all 0.16s;
      }
      .m16-btn-sandbox:hover {
        box-shadow: 0 0 14px rgba(56, 220, 255, 0.55);
      }

      /* Analysis KPI Comparison + SVG Chart + Cross-Module Links */
      .m16-kpi-pair {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .m16-kpi-box {
        padding: 11px 14px;
        border-radius: 9px;
        background: rgba(8, 28, 66, 0.82);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m16-kpi-lbl {
        font-size: 11.5px;
        color: #9ec0e6;
        margin-bottom: 4px;
      }
      .m16-kpi-val-cyan {
        font-size: 24px;
        font-weight: 800;
        color: #38f2ff;
        font-variant-numeric: tabular-nums;
      }
      .m16-kpi-val-warn {
        font-size: 18px;
        font-weight: 700;
        color: #fde047;
        font-variant-numeric: tabular-nums;
      }
      .m16-kpi-unit {
        font-size: 12px;
        font-weight: 500;
        color: #cfe4ff;
        margin-left: 3px;
      }

      .m16-chart-box {
        padding: 10px 12px;
        border-radius: 9px;
        background: rgba(7, 24, 58, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.26);
      }
      .m16-chart-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #bae6fd;
        margin-bottom: 6px;
      }
      .m16-sub-section-title {
        font-size: 13px;
        font-weight: 700;
        color: #f1f7ff;
        margin-top: 2px;
      }
      .m16-cross-list {
        display: flex;
        flex-direction: column;
        border-radius: 9px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.24);
        background: rgba(8, 28, 66, 0.7);
      }
      .m16-cross-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 12px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        font-size: 12.5px;
      }
      .m16-cross-row:last-child { border-bottom: none; }
      .m16-cross-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m16-cross-mod {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        color: #9ec0e6;
        min-width: 56px;
      }
      .m16-cross-val {
        color: #f1f7ff;
        font-weight: 600;
      }
      .m16-cross-val.warn { color: #fde047; }
      .m16-cross-val.muted { color: #8ab4dc; font-weight: 500; }
      .m16-cross-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .m16-jump-link {
        background: rgba(22, 119, 255, 0.16);
        border: 1px solid rgba(56, 189, 248, 0.42);
        color: #7dd3fc;
        font-size: 11.5px;
        font-weight: 600;
        padding: 3px 9px;
        border-radius: 6px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .m16-jump-link:hover {
        background: rgba(22, 119, 255, 0.34);
        border-color: #38f2ff;
        color: #ffffff;
      }

      /* Field Scenario: 3-Step Stepper & Actionable Task Card */
      .m16-stepper {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        padding: 8px 4px;
      }
      .m16-step-item {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 12px;
        color: #7ea6cf;
        white-space: nowrap;
      }
      .m16-step-num {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: 1px solid rgba(125, 211, 252, 0.35);
        background: rgba(10, 34, 78, 0.8);
        color: #9ec0e6;
        font-size: 11px;
        font-weight: 700;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .m16-step-item.done { color: #bae6fd; }
      .m16-step-item.done .m16-step-num {
        border-color: rgba(74, 222, 128, 0.65);
        background: rgba(34, 197, 94, 0.22);
        color: #4ade80;
      }
      .m16-step-item.active { color: #fde047; font-weight: 700; }
      .m16-step-item.active .m16-step-num {
        border-color: #facc15;
        background: rgba(250, 204, 21, 0.2);
        color: #fde047;
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.35);
      }
      .m16-step-line {
        flex: 1;
        height: 1px;
        background: rgba(56, 189, 248, 0.28);
        min-width: 16px;
      }
      .m16-step-line.done {
        background: linear-gradient(90deg, rgba(74, 222, 128, 0.7), rgba(56, 220, 255, 0.7));
      }

      .m16-task-card {
        padding: 13px 14px;
        border-radius: 10px;
        background: rgba(8, 28, 66, 0.85);
        border: 1px solid rgba(250, 204, 21, 0.48);
        display: flex;
        flex-direction: column;
        gap: 10px;
        transition: border-color 0.2s;
      }
      .m16-task-card.authorized {
        border-color: rgba(74, 222, 128, 0.56);
      }
      .m16-task-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
      }
      .m16-task-id {
        display: flex;
        align-items: center;
        gap: 9px;
      }
      .m16-task-ico {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        background: rgba(250, 204, 21, 0.14);
        border: 1px solid rgba(250, 204, 21, 0.45);
        color: #fde047;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m16-task-card.authorized .m16-task-ico {
        background: rgba(34, 197, 94, 0.16);
        border-color: rgba(74, 222, 128, 0.52);
        color: #4ade80;
      }
      .m16-task-title { font-size: 13.5px; font-weight: 700; color: #ffffff; }
      .m16-task-sub { font-size: 11.5px; color: #9ec0e6; margin-top: 1px; }
      .m16-pill-warn {
        padding: 3px 10px;
        border-radius: 99px;
        background: rgba(250, 204, 21, 0.16);
        border: 1px solid rgba(250, 204, 21, 0.55);
        color: #fde047;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m16-pill-ok {
        padding: 3px 10px;
        border-radius: 99px;
        background: rgba(34, 197, 94, 0.18);
        border: 1px solid rgba(74, 222, 128, 0.58);
        color: #4ade80;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m16-pill-muted {
        padding: 2px 8px;
        border-radius: 99px;
        background: rgba(120, 155, 196, 0.15);
        border: 1px solid rgba(120, 155, 196, 0.35);
        color: #9ec0e6;
        font-size: 11px;
      }
      .m16-task-meta {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(6, 20, 48, 0.6);
      }
      .m16-tm-lbl { font-size: 11px; color: #8ab4dc; }
      .m16-tm-val { font-size: 13px; font-weight: 700; color: #f1f7ff; margin-top: 2px; }
      .m16-task-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        padding-top: 4px;
      }
      .m16-task-note {
        font-size: 11.5px;
        color: #fde047;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m16-task-card.authorized .m16-task-note {
        color: #4ade80;
      }
      .m16-btn-auth {
        height: 32px;
        padding: 0 14px;
        border-radius: 7px;
        border: 1px solid rgba(56, 220, 255, 0.7);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        cursor: pointer;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.42);
      }
      .m16-btn-auth:hover {
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.68);
      }
      .m16-btn-ghost {
        height: 28px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.34);
        background: rgba(12, 42, 92, 0.62);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m16-btn-ghost:hover {
        border-color: #38f2ff;
        color: #ffffff;
      }

      /* Citations Bar */
      .m16-citations {
        display: flex;
        align-items: center;
        gap: 7px;
        flex-wrap: wrap;
        padding-top: 4px;
        border-top: 1px solid rgba(56, 189, 248, 0.14);
      }
      .m16-cite-label {
        font-size: 11.5px;
        color: #7ea6cf;
        margin-right: 2px;
      }
      .m16-cite-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 6px;
        background: rgba(11, 38, 86, 0.8);
        border: 1px solid rgba(56, 189, 248, 0.34);
        color: #bae6fd;
        font-size: 11.5px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .m16-cite-chip:hover {
        border-color: #38f2ff;
        color: #ffffff;
        background: rgba(22, 76, 152, 0.82);
      }

      /* Typing Indicator */
      .m16-typing-card {
        display: inline-flex;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-radius: 10px;
        background: rgba(12, 42, 92, 0.7);
        border: 1px solid rgba(56, 189, 248, 0.34);
        color: #bae6fd;
        font-size: 12.5px;
        align-self: flex-start;
      }
      .m16-dots {
        display: inline-flex;
        gap: 4px;
      }
      .m16-dots span {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: #38f2ff;
        animation: m16Pulse 1s infinite ease-in-out;
      }
      .m16-dots span:nth-child(2) { animation-delay: 0.18s; }
      .m16-dots span:nth-child(3) { animation-delay: 0.36s; }
      @keyframes m16Pulse {
        0%, 80%, 100% { opacity: 0.28; transform: scale(0.8); }
        40% { opacity: 1; transform: scale(1.15); }
      }

      /* Center Input Dock */
      .m16-composer {
        padding: 10px 14px 12px;
        border-top: 1px solid rgba(56, 189, 248, 0.22);
        background: rgba(7, 23, 56, 0.9);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m16-chip-row {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .m16-ask-chip {
        padding: 3px 10px;
        border-radius: 6px;
        background: rgba(12, 42, 92, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.3);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .m16-ask-chip:hover {
        border-color: #38f2ff;
        color: #ffffff;
        background: rgba(20, 70, 142, 0.8);
      }
      .m16-input-row {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 5px 7px 5px 12px;
        border-radius: 9px;
        background: rgba(10, 34, 78, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.38);
      }
      .m16-input-row:focus-within {
        border-color: #38f2ff;
        box-shadow: 0 0 12px rgba(56, 242, 255, 0.26);
      }
      .m16-input {
        flex: 1;
        min-width: 0;
        background: transparent;
        border: none;
        outline: none;
        color: #f1f7ff;
        font-size: 13px;
      }
      .m16-input::placeholder { color: #789bc4; }
      .m16-icon-btn {
        width: 30px;
        height: 30px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.34);
        background: rgba(14, 48, 102, 0.72);
        color: #bae6fd;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
        transition: all 0.15s;
      }
      .m16-icon-btn:hover { border-color: #38f2ff; color: #ffffff; }
      .m16-icon-btn.listening {
        border-color: #fb7185;
        background: rgba(244, 63, 94, 0.24);
        color: #fda4af;
        box-shadow: 0 0 0 4px rgba(244, 63, 94, 0.22);
      }
      .m16-send-btn {
        height: 30px;
        padding: 0 12px;
        border-radius: 7px;
        border: 1px solid rgba(125, 211, 252, 0.72);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        flex-shrink: 0;
      }
      .m16-send-btn:hover { box-shadow: 0 0 12px rgba(56, 220, 255, 0.58); }

      /* Right Panel: Context & Citation Inspector */
      .m16-info-card {
        padding: 10px 11px;
        border-radius: 9px;
        background: rgba(11, 38, 86, 0.6);
        border: 1px solid rgba(56, 189, 248, 0.24);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m16-info-desc {
        font-size: 12px;
        line-height: 1.55;
        color: #cfe4ff;
      }
      .m16-mod-status-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m16-mod-item {
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(9, 32, 74, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.2);
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .m16-mod-name { font-size: 12.5px; font-weight: 700; color: #f1f7ff; }
      .m16-mod-stat { font-size: 11px; color: #8ab4dc; margin-top: 2px; }
      .m16-launch-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 7px;
      }
      .m16-launch-btn {
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.34);
        background: rgba(14, 48, 102, 0.65);
        color: #e0f2fe;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        transition: all 0.16s;
      }
      .m16-launch-btn:hover {
        border-color: #38f2ff;
        background: rgba(22, 82, 166, 0.8);
        color: #ffffff;
      }

      /* Right Voice/Input Simulator Card */
      .m16-sim-box {
        padding: 11px;
        border-radius: 9px;
        background: rgba(8, 30, 70, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.36);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m16-voice-sim-btn {
        width: 100%;
        height: 34px;
        border-radius: 8px;
        border: 1px solid rgba(56, 220, 255, 0.5);
        background: rgba(14, 56, 118, 0.72);
        color: #7dd3fc;
        font-size: 12px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        cursor: pointer;
        transition: all 0.18s;
      }
      .m16-voice-sim-btn.listening {
        border-color: #fb7185;
        background: rgba(190, 18, 60, 0.32);
        color: #ffe4e6;
        box-shadow: 0 0 14px rgba(244, 63, 94, 0.4);
      }

      /* Modal Form Styling */
      .m16-modal-card {
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: #e2f0ff;
      }
      .m16-modal-preview {
        padding: 12px 14px;
        border-radius: 8px;
        background: #041024;
        border: 1px solid rgba(250, 204, 21, 0.55);
        color: #fde047;
        font-weight: 700;
        font-size: 14px;
        text-align: center;
        letter-spacing: 0.6px;
      }
      .m16-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .m16-modal-cell {
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(10, 34, 78, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m16-modal-cell span { display: block; font-size: 11px; color: #8ab4dc; }
      .m16-modal-cell strong { display: block; font-size: 13px; color: #ffffff; margin-top: 2px; }
      .m16-modal-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .m16-modal-field label { font-size: 12px; color: #bae6fd; }
      .m16-modal-input, .m16-modal-select {
        height: 34px;
        padding: 0 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 34, 78, 0.88);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
      }
      .m16-modal-actions {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding-top: 6px;
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     MODULE STATE & HELPERS
     ------------------------------------------------------------------------ */
  function cloneDefaultThread(scId) {
    const sc = SCENARIOS[scId];
    return {
      id: sc.defaultThread.id,
      title: sc.defaultThread.title,
      time: sc.defaultThread.time,
      pinned: true,
      messages: sc.defaultThread.messages.map(m => Object.assign({}, m))
    };
  }

  const ui = {
    activeSectionId: null,
    audioPlaying: false,
    audioSec: 0,
    audioTotal: 38,
    sandboxIdx: 0,
    fieldAuthorized: false,
    fieldApprover: '张建国（总工办值班领导）',
    fieldRemark: '核对K34+200门架情报板版面及下发时段无误，同意下发。',
    typingScenario: null,
    voiceListening: false,
    draftText: '',
    hoveredBarSec: null,
    conversations: {
      exhibition: [cloneDefaultThread('exhibition')],
      analysis: [cloneDefaultThread('analysis')],
      field: [cloneDefaultThread('field')]
    },
    activeConvId: {
      exhibition: 'conv-exhibition-1',
      analysis: 'conv-analysis-1',
      field: 'conv-field-1'
    }
  };

  let lastHostEl = null;
  let lastCtx = null;
  let currentSubPage = 'exhibition';
  let audioTimer = null;
  let typingTimer = null;
  let voiceTimer = null;
  let newChatSeq = 2;

  function escHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function formatSec(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function getActiveThread(scId) {
    const list = ui.conversations[scId] || [];
    const targetId = ui.activeConvId[scId];
    return list.find(c => c.id === targetId) || list[0];
  }

  function cleanupTimers() {
    if (audioTimer) {
      clearInterval(audioTimer);
      audioTimer = null;
    }
    if (typingTimer) {
      clearTimeout(typingTimer);
      typingTimer = null;
    }
    if (voiceTimer) {
      clearTimeout(voiceTimer);
      voiceTimer = null;
    }
    ui.audioPlaying = false;
    ui.typingScenario = null;
    ui.voiceListening = false;
  }

  /* ------------------------------------------------------------------------
     SVG CHART & WAVEFORM RENDERERS
     ------------------------------------------------------------------------ */
  function renderAudioWaveformSvg() {
    const ratio = ui.audioSec / ui.audioTotal;
    const activeCount = Math.round(ratio * WAVEFORM_BARS.length);
    const barW = 4;
    const gap = 2.3;
    const svgW = Math.ceil(WAVEFORM_BARS.length * (barW + gap));
    const bars = WAVEFORM_BARS.map((h, i) => {
      const played = i < activeCount || (ui.audioPlaying && i === activeCount);
      const jitter = ui.audioPlaying ? ((ui.audioSec + i) % 3 - 1) * 8 : 0;
      const barH = Math.max(18, Math.min(96, h + jitter));
      const y = (30 - (barH / 100) * 26) / 2;
      const rectH = (barH / 100) * 26;
      const fill = played ? '#38f2ff' : 'rgba(125, 211, 252, 0.34)';
      return `<rect x="${(i * (barW + gap)).toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${rectH.toFixed(1)}" rx="1.5" fill="${fill}"/>`;
    }).join('');
    return `<svg class="m16-wave-svg" id="m16WaveSvg" viewBox="0 0 ${svgW} 30" preserveAspectRatio="none">${bars}</svg>`;
  }

  function renderAnalysisBenchmarkSvg() {
    const bars = SCENARIOS.analysis.qualityBars;
    const W = 520;
    const H = 154;
    const padL = 38;
    const padR = 14;
    const padT = 28;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const minVal = 97.5;
    const maxVal = 99.5;

    const valToY = v => padT + plotH * (1 - (v - minVal) / (maxVal - minVal));
    const avgY = valToY(98.7);

    const gridLines = [98.0, 98.5, 99.0, 99.5].map(v => {
      const y = valToY(v).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(56,189,248,0.14)" stroke-dasharray="3 3"/>
        <text x="${padL - 6}" y="${Number(y) + 3.5}" text-anchor="end" fill="#7ea6cf" font-size="9.5">${v.toFixed(1)}%</text>
      `;
    }).join('');

    const slotW = plotW / bars.length;
    const barW = 30;
    const barEls = bars.map((b, idx) => {
      const x = padL + slotW * idx + (slotW - barW) / 2;
      const y = valToY(b.pct);
      const h = padT + plotH - y;
      const isFocus = b.highlight || ui.hoveredBarSec === b.secId;
      const fillId = isFocus ? 'url(#m16BarGold)' : 'url(#m16BarCyan)';
      const stroke = isFocus ? '#fde047' : '#38bdf8';
      return `
        <g class="m16-svg-bar" data-sec="${b.secId}" style="cursor:pointer;">
          <rect x="${(x - 6).toFixed(1)}" y="${padT}" width="${barW + 12}" height="${plotH + padB}" fill="transparent"/>
          <rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${Math.max(4, h).toFixed(1)}" rx="4" fill="${fillId}" stroke="${stroke}" stroke-width="${isFocus ? '1.3' : '0.6'}"/>
          <text x="${(x + barW / 2).toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" fill="${isFocus ? '#fde047' : '#e0f2fe'}" font-size="10.5" font-weight="700">${b.pct.toFixed(1)}%</text>
          <text x="${(x + barW / 2).toFixed(1)}" y="${H - 7}" text-anchor="middle" fill="${isFocus ? '#fde047' : '#a9c6e8'}" font-size="10.5" font-weight="${isFocus ? '700' : '500'}">${b.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:152px;display:block;">
        <defs>
          <linearGradient id="m16BarCyan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38f2ff" stop-opacity="0.95"/>
            <stop offset="100%" stop-color="#0b5fd6" stop-opacity="0.72"/>
          </linearGradient>
          <linearGradient id="m16BarGold" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fde047" stop-opacity="0.96"/>
            <stop offset="100%" stop-color="#d97706" stop-opacity="0.78"/>
          </linearGradient>
        </defs>
        <g class="m16-svg-avg-legend">
          <line x1="${W - padR - 88}" y1="8.5" x2="${W - padR - 72}" y2="8.5" stroke="#22d3ee" stroke-width="1.3" stroke-dasharray="4 2"/>
          <text x="${W - padR}" y="12" text-anchor="end" fill="#38f2ff" font-size="9.5" font-weight="600">全线均值 98.7%</text>
        </g>
        ${gridLines}
        <line x1="${padL}" y1="${avgY.toFixed(1)}" x2="${W - padR}" y2="${avgY.toFixed(1)}" stroke="#22d3ee" stroke-width="1.2" stroke-dasharray="5 3"/>
        ${barEls}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     STRUCTURED SCENARIO AI CARDS
     ------------------------------------------------------------------------ */
  function renderExhibitionCard() {
    const view = SCENARIOS.exhibition.sandboxViews[ui.sandboxIdx % SCENARIOS.exhibition.sandboxViews.length];
    return `
      <div class="m16-ai-card">
        <div class="m16-card-head">
          <div class="m16-card-title">
            <span class="panel-accent-bar"></span>
            <span>明北段工程与盖梁拓宽</span>
          </div>
          <span class="m16-card-time">展厅讲解 · 语音与沙盘同步</span>
        </div>
        <div class="m16-card-text">
          明水至北安段按双向四车道高速公路标准建设，路线全长 142.608 km。盖梁拓宽专题（KT-04 寒区钢悬臂拓宽混凝土盖梁）聚焦既有桥梁的改扩建，目前正在整理结构计算模型和施工工法草案，并同步联动二工区场站与试验桥三维沙盘视角。
        </div>

        <div class="m16-audio-bar">
          <div class="m16-audio-left">
            <button type="button" class="m16-play-btn" id="m16AudioPlayBtn" title="${ui.audioPlaying ? '暂停讲解音频' : '播放讲解音频'}">
              ${ui.audioPlaying ? SVG.pause : SVG.play}
            </button>
            <div>
              <div class="m16-audio-title">讲解音频</div>
              <div class="m16-audio-sub">项目概况与阶段成果</div>
            </div>
          </div>
          <div class="m16-audio-right">
            ${renderAudioWaveformSvg()}
            <span class="m16-audio-timer" id="m16AudioTimer">${formatSec(ui.audioSec)} / ${formatSec(ui.audioTotal)}</span>
          </div>
        </div>

        <div class="m16-sandbox-card">
          <div class="m16-sandbox-thumb">
            <img src="${escHtml(view.img)}" alt="${escHtml(view.title)}"/>
            <span class="m16-stake-badge">${SVG.mapPin} ${escHtml(view.stake)}</span>
          </div>
          <div class="m16-sandbox-info">
            <div class="m16-sandbox-kicker">已发布沙盘视角（${ui.sandboxIdx + 1}/${SCENARIOS.exhibition.sandboxViews.length}）</div>
            <div class="m16-sandbox-name">${escHtml(view.title)}</div>
            <div class="m16-sandbox-desc">${escHtml(view.desc)}</div>
            <div class="m16-sandbox-actions">
              <button type="button" class="m16-btn-sandbox" id="m16SwitchSandboxBtn">
                ${SVG.sandbox} 切换沙盘视角
              </button>
              <button type="button" class="m16-btn-ghost" data-jump-mod="home" data-jump-sub="overview">
                ${SVG.external} 进入三维沙盘
              </button>
            </div>
          </div>
        </div>

        <div class="m16-citations">
          <span class="m16-cite-label">数据依据</span>
          <button type="button" class="m16-cite-chip" data-jump-mod="pingan" data-jump-sub="showcase">
            ${SVG.doc} 项目展示 • 项目简介 &gt;
          </button>
          <button type="button" class="m16-cite-chip" data-jump-mod="pingan" data-jump-sub="topics">
            ${SVG.doc} 课题进度 • KT-04 &gt;
          </button>
        </div>
      </div>
    `;
  }

  function renderAnalysisCard() {
    const hovered = SCENARIOS.analysis.qualityBars.find(b => b.secId === ui.hoveredBarSec);
    return `
      <div class="m16-ai-card">
        <div class="m16-card-head">
          <div class="m16-card-title">
            <span class="panel-accent-bar"></span>
            <span>二工区 11 月质量</span>
          </div>
          <span class="m16-card-time">截至 11-25 10:45</span>
        </div>

        <div class="m16-kpi-pair">
          <div class="m16-kpi-box">
            <div class="m16-kpi-lbl">工区质量合格率</div>
            <div class="m16-kpi-val-cyan">98.4<span class="m16-kpi-unit">%</span></div>
          </div>
          <div class="m16-kpi-box">
            <div class="m16-kpi-lbl">较项目合格率 98.7%</div>
            <div class="m16-kpi-val-warn">低 0.3<span class="m16-kpi-unit">个百分点</span></div>
          </div>
        </div>

        <div class="m16-chart-box">
          <div class="m16-chart-head">
            <span>各工区本月质量合格率对比（11月）</span>
            <span style="color:#7dd3fc;">${hovered ? `${hovered.name}：${hovered.pct.toFixed(1)}%（检测 ${hovered.batches} 批）` : '点击或悬停柱条查看工区明细'}</span>
          </div>
          ${renderAnalysisBenchmarkSvg()}
        </div>

        <div class="m16-card-text">
          二号拌合站的水稳混合料曾出现含水率超限，记录显示已整改。需要核对检测批次明细，才能判断这条记录对合格率的影响。
        </div>

        <div class="m16-sub-section-title">同工区关联结果</div>
        <div class="m16-cross-list">
          <div class="m16-cross-row">
            <div class="m16-cross-left">
              <span class="m16-cross-mod">${SVG.chart} 进度</span>
              <span class="m16-cross-val">正常推进 94.2%</span>
            </div>
            <div class="m16-cross-right">
              <button type="button" class="m16-jump-link" data-jump-mod="progress" data-jump-sub="overview">进度明细 &gt;</button>
            </div>
          </div>
          <div class="m16-cross-row">
            <div class="m16-cross-left">
              <span class="m16-cross-mod">${SVG.shield} 安全</span>
              <span class="m16-cross-val warn">5 项隐患未销项</span>
            </div>
            <div class="m16-cross-right">
              <button type="button" class="m16-jump-link" data-jump-mod="safety" data-jump-sub="ledger">隐患台账 &gt;</button>
            </div>
          </div>
          <div class="m16-cross-row">
            <div class="m16-cross-left">
              <span class="m16-cross-mod">${SVG.card} 计量</span>
              <span class="m16-cross-val muted">来源系统未接入</span>
            </div>
            <div class="m16-cross-right">
              <span class="m16-pill-muted">未接入</span>
              <button type="button" class="m16-jump-link" data-jump-mod="measure" data-jump-sub="overview">计量管理 &gt;</button>
            </div>
          </div>
        </div>

        <div class="m16-citations">
          <span class="m16-cite-label">数据依据</span>
          <button type="button" class="m16-cite-chip" data-jump-mod="quality" data-jump-sub="overview">
            ${SVG.doc} 质量总览 • 11月 &gt;
          </button>
          <button type="button" class="m16-cite-chip" data-jump-mod="quality" data-jump-sub="issues">
            ${SVG.doc} 整改记录 • ZL-202611-011 &gt;
          </button>
          <button type="button" class="m16-cite-chip" data-jump-mod="safety" data-jump-sub="overview">
            ${SVG.doc} 安全总览 &gt;
          </button>
        </div>
      </div>
    `;
  }

  function renderFieldCard() {
    const authDone = ui.fieldAuthorized;
    return `
      <div class="m16-ai-card">
        <div class="m16-card-head">
          <div class="m16-card-title">
            <span class="panel-accent-bar"></span>
            <span>施工出口提示 • 发布办理</span>
          </div>
          <span class="m16-card-time">${authDone ? '已授权下发' : '等待人工授权'}</span>
        </div>

        <div class="m16-card-text">
          已查到发布单 <strong>FB-20261126-009</strong>，${authDone ? '已完成人工授权确认并发送至目标情报板设备队列，请前往回执记录查看设备显示反馈。' : '目前待授权。核对版面、发布对象和下发时间后，由授权人员确认。'}
        </div>

        <div class="m16-stepper">
          <div class="m16-step-item done">
            <span class="m16-step-num">${SVG.check}</span>
            <span>1 核对发布单</span>
          </div>
          <div class="m16-step-line done"></div>
          <div class="m16-step-item ${authDone ? 'done' : 'active'}">
            <span class="m16-step-num">${authDone ? SVG.check : '2'}</span>
            <span>2 人工授权</span>
          </div>
          <div class="m16-step-line ${authDone ? 'done' : ''}"></div>
          <div class="m16-step-item ${authDone ? 'active' : ''}">
            <span class="m16-step-num">3</span>
            <span>3 查看设备回执</span>
          </div>
        </div>

        <div class="m16-task-card ${authDone ? 'authorized' : ''}">
          <div class="m16-task-head">
            <div class="m16-task-id">
              <div class="m16-task-ico">${authDone ? SVG.check : SVG.lock}</div>
              <div>
                <div class="m16-task-title">设备下发确认</div>
                <div class="m16-task-sub">施工出口提示 • V1.0（FB-20261126-009）</div>
              </div>
            </div>
            <span class="${authDone ? 'm16-pill-ok' : 'm16-pill-warn'}">${authDone ? '已授权下发' : '待人工确认'}</span>
          </div>

          <div class="m16-task-meta">
            <div>
              <div class="m16-tm-lbl">发布对象</div>
              <div class="m16-tm-val">情报板 1 块</div>
            </div>
            <div>
              <div class="m16-tm-lbl">计划下发</div>
              <div class="m16-tm-val">11-26 11:30</div>
            </div>
            <div>
              <div class="m16-tm-lbl">授权状态</div>
              <div class="m16-tm-val">${authDone ? '已签名下发' : '等待确认'}</div>
            </div>
          </div>

          <div class="m16-task-foot">
            <span class="m16-task-note">
              ${authDone ? `${SVG.check} 已由 ${escHtml(ui.fieldApprover)} 授权并下发` : `${SVG.shield} 授权人确认后下发`}
            </span>
            <div style="display:flex;align-items:center;gap:8px;">
              ${authDone
                ? `
                  <button type="button" class="m16-btn-ghost" id="m16ResetAuthBtn">${SVG.refresh} 重置待授权</button>
                  <button type="button" class="m16-btn-auth" data-jump-mod="publish" data-jump-sub="receipts">${SVG.external} 查看设备回执</button>
                `
                : `
                  <button type="button" class="m16-btn-auth" id="m16OpenAuthModalBtn">${SVG.external} 打开授权单</button>
                `}
            </div>
          </div>
        </div>

        <div class="m16-citations">
          <span class="m16-cite-label">数据依据</span>
          <button type="button" class="m16-cite-chip" data-jump-mod="publish" data-jump-sub="review">
            ${SVG.doc} 审核发布 • FB-20261126-009 &gt;
          </button>
          <button type="button" class="m16-cite-chip" data-jump-mod="publish" data-jump-sub="receipts">
            ${SVG.doc} 回执记录 &gt;
          </button>
        </div>
      </div>
    `;
  }

  function renderSimulatedResponseCard(msg) {
    return `
      <div class="m16-ai-card">
        <div class="m16-card-head">
          <div class="m16-card-title">
            <span class="panel-accent-bar"></span>
            <span>${escHtml(msg.title)}</span>
          </div>
          <span class="m16-card-time">${escHtml(msg.time || '刚刚')}</span>
        </div>
        <div class="m16-card-text">${escHtml(msg.body)}</div>
        ${msg.metrics && msg.metrics.length ? `
          <div class="m16-kpi-pair">
            ${msg.metrics.map(m => `
              <div class="m16-kpi-box">
                <div class="m16-kpi-lbl">${escHtml(m.label)}</div>
                <div class="${m.warn ? 'm16-kpi-val-warn' : 'm16-kpi-val-cyan'}">${escHtml(m.value)}<span class="m16-kpi-unit">${escHtml(m.unit || '')}</span></div>
              </div>
            `).join('')}
          </div>
        ` : ''}
        ${msg.citations && msg.citations.length ? `
          <div class="m16-citations">
            <span class="m16-cite-label">数据依据</span>
            ${msg.citations.map(c => `
              <button type="button" class="m16-cite-chip" data-jump-mod="${escHtml(c.mod)}" data-jump-sub="${escHtml(c.sub || '')}">
                ${SVG.doc} ${escHtml(c.label)} &gt;
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;
  }

  function buildSimulatedReply(scId, queryText) {
    const q = queryText.trim();
    const now = new Date();
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const timeStr = `11-26 ${hh}:${mm}`;

    if (scId === 'exhibition' || /盖梁|宣传片|场站|沙盘|课题/.test(q)) {
      if (/宣传片|视频/.test(q)) {
        return {
          role: 'ai',
          cardType: 'sim_card',
          title: '项目专题成果与视频索引',
          time: timeStr,
          body: '已为您检索到「平安工地 / 项目展示」中的 3 项多媒体展示资料，包含《盖梁拓宽施工图例》《梁场生产专题视频》和《路基现场试验图例》，支持直接跳转专题展示大屏播放。',
          metrics: [
            { label: '已上线专题视频', value: '3', unit: '部' },
            { label: '研究课题总计', value: '8', unit: '项（KT-01~08）' }
          ],
          citations: [
            { label: '项目展示 • 成果视频', mod: 'pingan', sub: 'showcase' },
            { label: '课题管理 • KT-04', mod: 'pingan', sub: 'topics' }
          ]
        };
      }
      if (/场站|便道|沙盘/.test(q)) {
        return {
          role: 'ai',
          cardType: 'sim_card',
          title: '二工区场站与便道展厅讲解',
          time: timeStr,
          body: '二工区场站（K28+400）集成智慧梁场、水稳拌合站及标准化施工便道。可通过“切换沙盘视角”按钮在三维地图上快速对比 K28+400 场站与 K42+150 盖梁试验桥。',
          metrics: [
            { label: '桩号位置', value: 'K28+400', unit: '' },
            { label: '场站建设进度', value: '91.2', unit: '%' }
          ],
          citations: [
            { label: '项目展示 • 项目简介', mod: 'pingan', sub: 'showcase' },
            { label: '综合首页 • 数字漫游', mod: 'home', sub: 'roaming' }
          ]
        };
      }
      return {
        role: 'ai',
        cardType: 'sim_card',
        title: 'KT-04 盖梁拓宽专题阶段成果',
        time: timeStr,
        body: 'KT-04「寒区钢悬臂拓宽混凝土盖梁」已完成立项、计划与设计及现场试验执行，当前处于「成果整理」阶段，已沉淀组合结构计算模型、盖梁拓宽施工工法草案与现场监测数据集。',
        metrics: [
          { label: '当前推进阶段', value: '成果整理', unit: '4/5' },
          { label: '已形成阶段成果', value: '3', unit: '项' }
        ],
        citations: [
          { label: '课题进度 • KT-04', mod: 'pingan', sub: 'topics' },
          { label: '项目展示 • 成果图例', mod: 'pingan', sub: 'showcase' }
        ]
      };
    }

    if (scId === 'analysis' || /梁场|滞后|备料|质量|进度|安全|计量/.test(q)) {
      if (/梁场|产量/.test(q)) {
        return {
          role: 'ai',
          cardType: 'sim_card',
          title: '全线智慧梁场生产核对（11月）',
          time: timeStr,
          body: '本月全线梁片累计生产 640 片，其中二号梁场承担二工区与四工区供梁任务，张拉压浆一次合格率 99.2%，满足架梁节点需求。',
          metrics: [
            { label: '梁片生产总量', value: '640', unit: '片' },
            { label: '预制梁抽检合格率', value: '99.2', unit: '%' }
          ],
          citations: [
            { label: '质量管理 • 智慧梁场', mod: 'quality', sub: 'beamYard' },
            { label: '质量管理 • 质量总览', mod: 'quality', sub: 'overview' }
          ]
        };
      }
      if (/滞后|进度/.test(q)) {
        return {
          role: 'ai',
          cardType: 'sim_card',
          title: '分工序进度滞后排查',
          time: timeStr,
          body: '对照年度计划节点，二工区主体路基与桥梁进度 94.2% 正常推进；三、四工区交安工程与绿化工程受入冬前气温窗口约束，需重点关注计划与节点偏离预警。',
          metrics: [
            { label: '二工区关键节点达成', value: '94.2', unit: '%' },
            { label: '需重点督办工序', value: '交安 / 绿化', unit: '', warn: true }
          ],
          citations: [
            { label: '进度管理 • 进度总览', mod: 'progress', sub: 'overview' },
            { label: '进度管理 • 计划与节点', mod: 'progress', sub: 'plan' }
          ]
        };
      }
      if (/备料/.test(q)) {
        return {
          role: 'ai',
          cardType: 'sim_card',
          title: '冬储备料与地材缺口测算',
          time: timeStr,
          body: '当前全线粗集料及水泥稳定碎石骨料已入库 86.4%，二工区二号拌合站仍需补充 1.8 万吨玄武岩碎石以保障明年开春连续摊铺。',
          metrics: [
            { label: '全线备料完成率', value: '86.4', unit: '%' },
            { label: '二工区建议补库', value: '1.8', unit: '万吨', warn: true }
          ],
          citations: [
            { label: '全周期备料管理', mod: 'material', sub: '' },
            { label: '质量管理 • 拌合站', mod: 'quality', sub: 'mixing' }
          ]
        };
      }
      return {
        role: 'ai',
        cardType: 'sim_card',
        title: '工区多业务交叉研判结果',
        time: timeStr,
        body: `已围绕「${q}」检索质量、安全、进度与计量台账：二工区本月质量合格率 98.4%，存在 5 项安全隐患待销项；计量系统待完成数据桥接。`,
        metrics: [
          { label: '质量合格率', value: '98.4', unit: '%' },
          { label: '未销项安全隐患', value: '5', unit: '项', warn: true }
        ],
        citations: [
          { label: '质量总览 • 11月', mod: 'quality', sub: 'overview' },
          { label: '安全管理 • 隐患台账', mod: 'safety', sub: 'ledger' }
        ]
      };
    }

    // Field operations scenario
    if (/回执/.test(q)) {
      return {
        role: 'ai',
        cardType: 'sim_card',
        title: '情报板显示回执查询指引',
        time: timeStr,
        body: '发布单授权下发后，系统会自动向目标情报板发送显示指令并回传抓拍截图与通信状态。点击下方依据可直达「信息发布 / 回执记录」查看每块情报板的确认状态。',
        metrics: [
          { label: '当前回执追踪', value: ui.fieldAuthorized ? '2/2' : '1/3', unit: '块确认' },
          { label: '通信协议状态', value: '在线', unit: '正常' }
        ],
        citations: [
          { label: '信息发布 • 回执记录', mod: 'publish', sub: 'receipts' },
          { label: '信息发布 • 情报板总览', mod: 'publish', sub: 'overview' }
        ]
      };
    }
    if (/低能见度|联动/.test(q)) {
      return {
        role: 'ai',
        cardType: 'sim_card',
        title: '低能见度提示审核与预案建议',
        time: timeStr,
        body: '发布单 FB-20261126-008「低能见度提示 V1.1」当前处于待审核状态，涉及 2 块情报板。建议先在「审核发布」完成内容审核，再结合团雾气象联动预案一键安排下发。',
        metrics: [
          { label: '关联发布单', value: 'FB-20261126-008', unit: '' },
          { label: '涉及情报板', value: '2', unit: '块', warn: true }
        ],
        citations: [
          { label: '信息发布 • 审核发布', mod: 'publish', sub: 'review' },
          { label: '信息发布 • 联动预案', mod: 'publish', sub: 'plans' }
        ]
      };
    }
    return {
      role: 'ai',
      cardType: 'sim_card',
      title: '授权待办生成与办理状态',
      time: timeStr,
      body: ui.fieldAuthorized
        ? '发布单 FB-20261126-009 已完成人工授权并下发至 K34+200 上行门架情报板，待办事项已闭环并转入设备回执跟踪。'
        : '已为您生成待办提醒：发布单 FB-20261126-009（施工出口提示 • V1.0）需由值班授权人核对情报板 1 块及计划时间 11-26 11:30 后点击“打开授权单”完成签发。',
      metrics: [
        { label: '待办发布单', value: 'FB-20261126-009', unit: '' },
        { label: '办理状态', value: ui.fieldAuthorized ? '已授权下发' : '待人工确认', unit: '', warn: !ui.fieldAuthorized }
      ],
      citations: [
        { label: '审核发布 • FB-20261126-009', mod: 'publish', sub: 'review' },
        { label: '回执记录', mod: 'publish', sub: 'receipts' }
      ]
    };
  }

  /* ------------------------------------------------------------------------
     LAYOUT RENDERERS (LEFT / CENTER / RIGHT)
     ------------------------------------------------------------------------ */
  function renderLeftPanel(scId) {
    const activeSc = SCENARIOS[scId];
    const threads = ui.conversations[scId] || [];
    const activeThread = getActiveThread(scId);

    return `
      <aside class="m16-col-panel">
        <div class="m16-panel-head">
          <div class="m16-head-left">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">场景与会话</span>
          </div>
          <span class="m16-sc-tag">3 大场景</span>
        </div>
        <div class="m16-panel-scroll">
          <div class="m16-sec-label">
            <span>工作台场景切换</span>
            <span>同步子页签</span>
          </div>
          <div class="m16-scenario-list">
            ${SUB_PAGES.map(p => {
              const sc = SCENARIOS[p.id];
              const isAct = p.id === scId;
              return `
                <button type="button" class="m16-scenario-card ${isAct ? 'active' : ''}" data-switch-sc="${p.id}">
                  <div class="m16-sc-top">
                    <span class="m16-sc-name">${SVG.spark} ${escHtml(sc.name)}</span>
                    <span class="m16-sc-tag">${escHtml(sc.contextBadge)}</span>
                  </div>
                  <div class="m16-sc-sub">${escHtml(sc.subtitle)}</div>
                </button>
              `;
            }).join('')}
          </div>

          <button type="button" class="m16-btn-new-chat" id="m16NewChatBtn">
            ${SVG.plus} 新对话
          </button>

          <div class="m16-sec-label">
            <span>${SVG.history} 对话历史</span>
            <span>${threads.length} 条</span>
          </div>
          <div class="m16-history-list">
            ${threads.map(t => `
              <button type="button" class="m16-history-item ${activeThread && activeThread.id === t.id ? 'active' : ''}" data-thread-id="${escHtml(t.id)}">
                <div class="m16-hist-title">${escHtml(t.title)}</div>
                <div class="m16-hist-meta">
                  <span>${t.pinned ? '标准演示会话' : '新建会话'}</span>
                  <span>${escHtml(t.time)}</span>
                </div>
              </button>
            `).join('')}
          </div>

          <div class="m16-sec-label">
            <span>场景快捷提问预设</span>
          </div>
          <div class="m16-prompt-list">
            ${activeSc.quickPrompts.map(p => `
              <button type="button" class="m16-prompt-btn" data-quick-ask="${escHtml(p)}">${escHtml(p)}</button>
            `).join('')}
          </div>
        </div>
      </aside>
    `;
  }

  function renderCenterPanel(scId) {
    const sc = SCENARIOS[scId];
    const thread = getActiveThread(scId);
    const messages = thread ? thread.messages : [];

    return `
      <main class="m16-col-panel">
        <div class="m16-panel-head">
          <div class="m16-head-left">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">${escHtml(thread ? thread.title : sc.name)}</span>
          </div>
          <div style="display:flex;align-items:center;gap:8px;">
            <span class="m16-sc-tag">${escHtml(sc.contextBadge)}</span>
            ${thread && !thread.pinned ? `
              <button type="button" class="m16-btn-ghost" id="m16BackPinnedBtn">返回标准卡片</button>
            ` : ''}
          </div>
        </div>

        <div class="m16-chat-stage">
          <div class="m16-chat-stream" id="m16ChatStream">
            ${messages.map(m => {
              if (m.role === 'user') {
                return `
                  <div class="m16-msg-user-wrap">
                    ${m.isVoice ? `<span class="m16-voice-badge">${SVG.mic} 语音提问</span>` : ''}
                    <div class="m16-user-bubble">${escHtml(m.text)}</div>
                  </div>
                `;
              }
              if (m.cardType === 'exhibition_card') return renderExhibitionCard();
              if (m.cardType === 'analysis_card') return renderAnalysisCard();
              if (m.cardType === 'field_card') return renderFieldCard();
              return renderSimulatedResponseCard(m);
            }).join('')}

            ${ui.typingScenario === scId ? `
              <div class="m16-typing-card">
                <div class="m16-dots"><span></span><span></span><span></span></div>
                <span>AI 正在检索「${escHtml(sc.contextBadge)}」台账与业务指标...</span>
              </div>
            ` : ''}
          </div>

          <div class="m16-composer">
            <div class="m16-chip-row">
              ${sc.quickPrompts.map(p => `
                <button type="button" class="m16-ask-chip" data-quick-ask="${escHtml(p)}">${escHtml(p)}</button>
              `).join('')}
            </div>
            <div class="m16-input-row">
              <input type="text" class="m16-input" id="m16CenterInput" placeholder="继续提问，例如：${escHtml(sc.quickPrompts[0])}" value="${escHtml(ui.draftText)}"/>
              <button type="button" class="m16-icon-btn ${ui.voiceListening ? 'listening' : ''}" id="m16CenterMicBtn" title="模拟语音输入">
                ${SVG.mic}
              </button>
              <button type="button" class="m16-send-btn" id="m16CenterSendBtn">
                ${SVG.send} 发送
              </button>
            </div>
          </div>
        </div>
      </main>
    `;
  }

  function renderRightPanel(scId) {
    const sc = SCENARIOS[scId];
    const secLabel = ui.activeSectionId && SECTION_NAME_BY_ID[ui.activeSectionId]
      ? `${SECTION_NAME_BY_ID[ui.activeSectionId]}（已联动）`
      : '全线范围（K0+000 ~ K146+800）';

    return `
      <aside class="m16-col-panel">
        <div class="m16-panel-head">
          <div class="m16-head-left">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">上下文与依据核查</span>
          </div>
          <span class="m16-sc-tag">Inspector</span>
        </div>

        <div class="m16-panel-scroll">
          <div class="m16-info-card">
            <div class="m16-sec-label">
              <span>当前场景摘要</span>
              <span style="color:#38f2ff;">${escHtml(sc.name)}</span>
            </div>
            <div style="font-size:12.5px;font-weight:700;color:#ffffff;">业务上下文：${escHtml(sc.contextBadge)}</div>
            <div style="font-size:11.5px;color:#fde047;">作用工区：${escHtml(secLabel)}</div>
            <div class="m16-info-desc">${escHtml(sc.summaryDesc)}</div>
          </div>

          <div class="m16-sec-label">
            <span>关联模块实时状态</span>
            <span>本地台账</span>
          </div>
          <div class="m16-mod-status-list">
            <div class="m16-mod-item">
              <div>
                <div class="m16-mod-name">平安工地</div>
                <div class="m16-mod-stat">课题 KT-01~08 · KT-04 成果整理中</div>
              </div>
              <span class="m16-pill-ok">在线</span>
            </div>
            <div class="m16-mod-item">
              <div>
                <div class="m16-mod-name">质量管理</div>
                <div class="m16-mod-stat">全线合格率 98.7% · 二工区 98.4%</div>
              </div>
              <span class="m16-pill-ok">在线</span>
            </div>
            <div class="m16-mod-item">
              <div>
                <div class="m16-mod-name">信息发布</div>
                <div class="m16-mod-stat">${ui.fieldAuthorized ? 'FB-20261126-009 已授权下发' : 'FB-20261126-009 待人工授权'}</div>
              </div>
              <span class="${ui.fieldAuthorized ? 'm16-pill-ok' : 'm16-pill-warn'}">${ui.fieldAuthorized ? '已下发' : '待授权'}</span>
            </div>
            <div class="m16-mod-item">
              <div>
                <div class="m16-mod-name">黑土地保护</div>
                <div class="m16-mod-stat">监测保护区 6 处 · 遥感对比就绪</div>
              </div>
              <span class="m16-pill-ok">在线</span>
            </div>
          </div>

          <div class="m16-sec-label">
            <span>${SVG.layers} 跨模块快速直达</span>
          </div>
          <div class="m16-launch-grid">
            <button type="button" class="m16-launch-btn" data-jump-mod="pingan" data-jump-sub="showcase">
              <span>平安工地</span> ${SVG.external}
            </button>
            <button type="button" class="m16-launch-btn" data-jump-mod="quality" data-jump-sub="overview">
              <span>质量管理</span> ${SVG.external}
            </button>
            <button type="button" class="m16-launch-btn" data-jump-mod="publish" data-jump-sub="review">
              <span>信息发布</span> ${SVG.external}
            </button>
            <button type="button" class="m16-launch-btn" data-jump-mod="blacksoil" data-jump-sub="compare">
              <span>黑土地保护</span> ${SVG.external}
            </button>
          </div>

          <div class="m16-sec-label">
            <span>语音与追问交互仿真</span>
          </div>
          <div class="m16-sim-box">
            <button type="button" class="m16-voice-sim-btn ${ui.voiceListening ? 'listening' : ''}" id="m16RightVoiceBtn">
              ${SVG.mic} ${ui.voiceListening ? '正在识别语音指令...' : '模拟语音提问（脉冲采集）'}
            </button>
            <div class="m16-chip-row">
              ${sc.quickPrompts.map(p => `
                <button type="button" class="m16-ask-chip" data-quick-ask="${escHtml(p)}">${escHtml(p)}</button>
              `).join('')}
            </div>
            <div class="m16-input-row">
              <input type="text" class="m16-input" id="m16RightInput" placeholder="继续提问..." value="${escHtml(ui.draftText)}"/>
              <button type="button" class="m16-send-btn" id="m16RightSendBtn">
                ${SVG.send} 发送
              </button>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE ACTIONS (AUDIO, SANDBOX, CHAT, AUTH MODAL)
     ------------------------------------------------------------------------ */
  function submitQuestion(scId, text, isVoice) {
    const clean = String(text || '').trim();
    if (!clean) {
      if (lastCtx) lastCtx.showToast('请输入问题或点击快捷提问词条');
      return;
    }
    const thread = getActiveThread(scId);
    if (!thread) return;

    ui.draftText = '';
    thread.messages.push({
      role: 'user',
      isVoice: Boolean(isVoice),
      text: clean
    });
    ui.typingScenario = scId;
    rerender(true);

    if (typingTimer) clearTimeout(typingTimer);
    typingTimer = setTimeout(() => {
      typingTimer = null;
      ui.typingScenario = null;
      const reply = buildSimulatedReply(scId, clean);
      thread.messages.push(reply);
      rerender(true);
    }, 460);
  }

  function triggerVoiceSimulation(scId) {
    if (ui.voiceListening) return;
    ui.voiceListening = true;
    rerender();
    if (voiceTimer) clearTimeout(voiceTimer);
    voiceTimer = setTimeout(() => {
      voiceTimer = null;
      ui.voiceListening = false;
      const sample = SCENARIOS[scId].voiceSample;
      submitQuestion(scId, sample, true);
    }, 950);
  }

  function toggleAudioPlayback() {
    ui.audioPlaying = !ui.audioPlaying;
    if (ui.audioPlaying) {
      if (ui.audioSec >= ui.audioTotal) ui.audioSec = 0;
      if (audioTimer) clearInterval(audioTimer);
      audioTimer = setInterval(() => {
        if (!lastHostEl || !lastCtx || lastCtx.state.moduleId !== 'ai' || currentSubPage !== 'exhibition') {
          clearInterval(audioTimer);
          audioTimer = null;
          ui.audioPlaying = false;
          return;
        }
        ui.audioSec += 1;
        if (ui.audioSec >= ui.audioTotal) {
          ui.audioSec = ui.audioTotal;
          ui.audioPlaying = false;
          clearInterval(audioTimer);
          audioTimer = null;
          if (lastCtx) lastCtx.showToast('展厅讲解音频播报完毕');
        }
        updateAudioDomInPlace();
      }, 1000);
    } else if (audioTimer) {
      clearInterval(audioTimer);
      audioTimer = null;
    }
    updateAudioDomInPlace();
  }

  function updateAudioDomInPlace() {
    if (!lastHostEl) return;
    const playBtn = lastHostEl.querySelector('#m16AudioPlayBtn');
    const timerEl = lastHostEl.querySelector('#m16AudioTimer');
    const waveEl = lastHostEl.querySelector('#m16WaveSvg');
    if (playBtn) {
      playBtn.innerHTML = ui.audioPlaying ? SVG.pause : SVG.play;
      playBtn.title = ui.audioPlaying ? '暂停讲解音频' : '播放讲解音频';
    }
    if (timerEl) {
      timerEl.textContent = `${formatSec(ui.audioSec)} / ${formatSec(ui.audioTotal)}`;
    }
    if (waveEl) {
      const tmp = document.createElement('div');
      tmp.innerHTML = renderAudioWaveformSvg();
      const nextSvg = tmp.firstElementChild;
      if (nextSvg) {
        waveEl.innerHTML = nextSvg.innerHTML;
      }
    }
  }

  function openAuthorizationModal(ctx) {
    const bodyHtml = `
      <div class="m16-modal-card">
        <div class="m16-modal-preview">【施工出口提示】前方 K35+200 施工出口，请减速慢行注意避让</div>
        <div class="m16-modal-grid">
          <div class="m16-modal-cell">
            <span>发布单编号</span>
            <strong>FB-20261126-009（V1.0）</strong>
          </div>
          <div class="m16-modal-cell">
            <span>发布对象</span>
            <strong>K34+200 上行门架情报板（1 块）</strong>
          </div>
          <div class="m16-modal-cell">
            <span>计划下发时间</span>
            <strong>2026-11-26 11:30</strong>
          </div>
          <div class="m16-modal-cell">
            <span>当前审核状态</span>
            <strong>内容已审核 · 待人工授权</strong>
          </div>
        </div>
        <div class="m16-modal-field">
          <label for="m16ModalApprover">授权确认人</label>
          <select id="m16ModalApprover" class="m16-modal-select">
            <option value="张建国（总工办值班领导）" ${ui.fieldApprover.indexOf('张建国') >= 0 ? 'selected' : ''}>张建国（总工办值班领导）</option>
            <option value="李志强（二工区值班站长）" ${ui.fieldApprover.indexOf('李志强') >= 0 ? 'selected' : ''}>李志强（二工区值班站长）</option>
            <option value="王海涛（交安保通负责人）" ${ui.fieldApprover.indexOf('王海涛') >= 0 ? 'selected' : ''}>王海涛（交安保通负责人）</option>
          </select>
        </div>
        <div class="m16-modal-field">
          <label for="m16ModalRemark">授权签发意见</label>
          <input id="m16ModalRemark" class="m16-modal-input" type="text" value="${escHtml(ui.fieldRemark)}"/>
        </div>
        <div class="m16-modal-actions">
          <button type="button" class="m16-btn-ghost" id="m16ModalCancelBtn">取消</button>
          <button type="button" class="m16-btn-auth" id="m16ModalConfirmBtn">${SVG.check} 确认授权并下发</button>
        </div>
      </div>
    `;
    ctx.openModal('发布单人工授权确认 — FB-20261126-009', bodyHtml);

    const cancelBtn = document.getElementById('m16ModalCancelBtn');
    const confirmBtn = document.getElementById('m16ModalConfirmBtn');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => ctx.closeModal());
    }
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const approverSel = document.getElementById('m16ModalApprover');
        const remarkInput = document.getElementById('m16ModalRemark');
        if (approverSel) ui.fieldApprover = approverSel.value;
        if (remarkInput && remarkInput.value.trim()) ui.fieldRemark = remarkInput.value.trim();

        ui.fieldAuthorized = true;
        const thread = getActiveThread('field');
        if (thread) {
          thread.messages.push({
            role: 'ai',
            cardType: 'sim_card',
            title: '授权完成 • 指令已下发至情报板',
            time: '11-26 11:30',
            body: `发布单 FB-20261126-009 已由 ${ui.fieldApprover} 授权确认，显示内容已推送至 K34+200 上行门架情报板（1 块），状态更新为「已授权下发」。`,
            metrics: [
              { label: '发布状态', value: '已授权下发', unit: '' },
              { label: '目标设备回执', value: '队列跟踪中', unit: '1 块' }
            ],
            citations: [
              { label: '信息发布 • 设备回执记录', mod: 'publish', sub: 'receipts' },
              { label: '信息发布 • 审核发布', mod: 'publish', sub: 'review' }
            ]
          });
        }
        ctx.closeModal();
        ctx.showToast('发布单 FB-20261126-009 已授权下发至情报板');
        rerender(true);
      });
    }
  }

  /* ------------------------------------------------------------------------
     EVENT BINDING & MODULE RENDER
     ------------------------------------------------------------------------ */
  function bindEvents(hostEl, scId, ctx) {
    // Scenario switcher cards (sync with #subTabs via switchModule)
    hostEl.querySelectorAll('[data-switch-sc]').forEach(btn => {
      btn.addEventListener('click', () => {
        const targetSc = btn.dataset.switchSc;
        if (targetSc && targetSc !== scId) {
          ctx.switchModule('ai', targetSc);
        }
      });
    });

    // + New chat button
    const newChatBtn = hostEl.querySelector('#m16NewChatBtn');
    if (newChatBtn) {
      newChatBtn.addEventListener('click', () => {
        const sc = SCENARIOS[scId];
        const newId = `conv-${scId}-${newChatSeq++}`;
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        ui.conversations[scId].unshift({
          id: newId,
          title: `${sc.name}新会话 #${newChatSeq - 1}`,
          time: `11-26 ${hh}:${mm}`,
          pinned: false,
          messages: [
            {
              role: 'ai',
              cardType: 'sim_card',
              title: `欢迎进入「${sc.name}」新对话`,
              time: `11-26 ${hh}:${mm}`,
              body: `当前已挂载「${sc.contextBadge}」业务上下文。您可以点击下方快捷提问词条、使用语音模拟，或直接输入问题进行交互演示；也可随时点击右上角“返回标准卡片”或左侧历史会话切回标准展示。`,
              citations: [
                { label: sc.contextBadge, mod: sc.linkedModule, sub: sc.linkedSubPage }
              ]
            }
          ]
        });
        ui.activeConvId[scId] = newId;
        ctx.showToast(`已新建「${sc.name}」会话`);
        rerender();
      });
    }

    // Back to pinned demonstration thread
    const backPinnedBtn = hostEl.querySelector('#m16BackPinnedBtn');
    if (backPinnedBtn) {
      backPinnedBtn.addEventListener('click', () => {
        const list = ui.conversations[scId] || [];
        const pinned = list.find(t => t.pinned) || list[list.length - 1];
        if (pinned) {
          ui.activeConvId[scId] = pinned.id;
          rerender();
        }
      });
    }

    // History item click
    hostEl.querySelectorAll('[data-thread-id]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.activeConvId[scId] = btn.dataset.threadId;
        rerender();
      });
    });

    // Quick-prompt chips
    hostEl.querySelectorAll('[data-quick-ask]').forEach(btn => {
      btn.addEventListener('click', () => {
        submitQuestion(scId, btn.dataset.quickAsk, false);
      });
    });

    // Cross-module jumps (citations + inspector buttons + analysis links)
    hostEl.querySelectorAll('[data-jump-mod]').forEach(btn => {
      btn.addEventListener('click', () => {
        const mod = btn.dataset.jumpMod;
        const sub = btn.dataset.jumpSub || undefined;
        if (mod) {
          ctx.switchModule(mod, sub);
        }
      });
    });

    // Exhibition audio play/pause + waveform click seek
    const audioPlayBtn = hostEl.querySelector('#m16AudioPlayBtn');
    if (audioPlayBtn) {
      audioPlayBtn.addEventListener('click', toggleAudioPlayback);
    }
    const waveSvg = hostEl.querySelector('#m16WaveSvg');
    if (waveSvg) {
      waveSvg.addEventListener('click', ev => {
        const rect = waveSvg.getBoundingClientRect();
        if (!rect.width) return;
        const ratio = Math.max(0, Math.min(1, (ev.clientX - rect.left) / rect.width));
        ui.audioSec = Math.round(ratio * ui.audioTotal);
        updateAudioDomInPlace();
      });
    }

    // Exhibition sandbox viewpoint switcher
    const sandboxBtn = hostEl.querySelector('#m16SwitchSandboxBtn');
    if (sandboxBtn) {
      sandboxBtn.addEventListener('click', () => {
        const views = SCENARIOS.exhibition.sandboxViews;
        ui.sandboxIdx = (ui.sandboxIdx + 1) % views.length;
        const nextView = views[ui.sandboxIdx];
        if (ctx.cesium && ctx.cesium.ready) {
          try {
            ctx.cesium.flyToSection(nextView.secId);
          } catch (e) { /* safe fallback */ }
        }
        ctx.showToast(`已切换沙盘视角：${nextView.title}（${nextView.stake}）`);
        rerender();
      });
    }

    // Analysis benchmark bar hover/click
    hostEl.querySelectorAll('.m16-svg-bar').forEach(el => {
      el.addEventListener('click', () => {
        ui.hoveredBarSec = el.dataset.sec;
        const bar = SCENARIOS.analysis.qualityBars.find(b => b.secId === ui.hoveredBarSec);
        if (bar) {
          ctx.showToast(`${bar.name} 11月质量合格率 ${bar.pct.toFixed(1)}%（共检测 ${bar.batches} 批）`);
        }
        rerender();
      });
    });

    // Field authorization modal & reset
    const openAuthBtn = hostEl.querySelector('#m16OpenAuthModalBtn');
    if (openAuthBtn) {
      openAuthBtn.addEventListener('click', () => openAuthorizationModal(ctx));
    }
    const resetAuthBtn = hostEl.querySelector('#m16ResetAuthBtn');
    if (resetAuthBtn) {
      resetAuthBtn.addEventListener('click', () => {
        ui.fieldAuthorized = false;
        ctx.showToast('已重置为「待人工确认」演示状态');
        rerender();
      });
    }

    // Center & Right inputs + send + mic simulation (kept synced)
    const centerInput = hostEl.querySelector('#m16CenterInput');
    const rightInput = hostEl.querySelector('#m16RightInput');
    const syncDraft = (val, source) => {
      ui.draftText = val;
      if (source !== centerInput && centerInput) centerInput.value = val;
      if (source !== rightInput && rightInput) rightInput.value = val;
    };
    if (centerInput) {
      centerInput.addEventListener('input', () => syncDraft(centerInput.value, centerInput));
      centerInput.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          submitQuestion(scId, centerInput.value, false);
        }
      });
    }
    if (rightInput) {
      rightInput.addEventListener('input', () => syncDraft(rightInput.value, rightInput));
      rightInput.addEventListener('keydown', ev => {
        if (ev.key === 'Enter') {
          ev.preventDefault();
          submitQuestion(scId, rightInput.value, false);
        }
      });
    }

    const centerSend = hostEl.querySelector('#m16CenterSendBtn');
    if (centerSend) {
      centerSend.addEventListener('click', () => submitQuestion(scId, centerInput ? centerInput.value : ui.draftText, false));
    }
    const rightSend = hostEl.querySelector('#m16RightSendBtn');
    if (rightSend) {
      rightSend.addEventListener('click', () => submitQuestion(scId, rightInput ? rightInput.value : ui.draftText, false));
    }

    const centerMic = hostEl.querySelector('#m16CenterMicBtn');
    if (centerMic) {
      centerMic.addEventListener('click', () => triggerVoiceSimulation(scId));
    }
    const rightVoice = hostEl.querySelector('#m16RightVoiceBtn');
    if (rightVoice) {
      rightVoice.addEventListener('click', () => triggerVoiceSimulation(scId));
    }
  }

  function rerender(scrollBottom) {
    if (!lastHostEl || !lastCtx) return;
    renderWorkbench(lastHostEl, currentSubPage, lastCtx, scrollBottom);
  }

  function renderWorkbench(hostEl, subPageId, ctx, scrollBottom) {
    injectStyles();
    lastHostEl = hostEl;
    lastCtx = ctx;
    currentSubPage = SCENARIOS[subPageId] ? subPageId : 'exhibition';
    if (ctx && ctx.state) {
      ui.activeSectionId = ctx.state.activeSectionId || null;
    }

    const sc = SCENARIOS[currentSubPage];
    const secLabel = ui.activeSectionId && SECTION_NAME_BY_ID[ui.activeSectionId]
      ? SECTION_NAME_BY_ID[ui.activeSectionId]
      : '全线工区';

    hostEl.innerHTML = `
      <div class="m16-page">
        <div class="m16-topbar">
          <div class="m16-brand">
            <div class="m16-brand-ico">${SVG.bot}</div>
            <div>
              <div class="m16-brand-title">吉黑高速 · 智能AI工作台</div>
              <div class="m16-brand-sub">G1211 明水至北安段工程全场景智能辅助决策与业务办理</div>
            </div>
          </div>
          <div class="m16-topbar-meta">
            <span class="m16-ctx-pill"><span class="m16-ctx-dot"></span> 当前场景：${escHtml(sc.name)}（${escHtml(sc.contextBadge)}）</span>
            <span class="m16-sec-pill">当前范围：${escHtml(secLabel)}</span>
          </div>
        </div>

        <div class="m16-grid">
          ${renderLeftPanel(currentSubPage)}
          ${renderCenterPanel(currentSubPage)}
          ${renderRightPanel(currentSubPage)}
        </div>
      </div>
    `;

    bindEvents(hostEl, currentSubPage, ctx);
    if (scrollBottom) {
      const stream = hostEl.querySelector('#m16ChatStream');
      if (stream) stream.scrollTop = stream.scrollHeight;
    }
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'ai',
    name: 'AI助手工作台',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      if (subPageId !== 'exhibition' && audioTimer) {
        clearInterval(audioTimer);
        audioTimer = null;
        ui.audioPlaying = false;
      }
      renderWorkbench(hostEl, subPageId, ctx, false);
    },

    onSectionChange(secId, subPageId) {
      ui.activeSectionId = secId || null;
      if (lastHostEl && lastCtx) {
        renderWorkbench(lastHostEl, subPageId || currentSubPage, lastCtx, false);
      }
    },

    onLeave() {
      cleanupTimers();
      if (lastHostEl) {
        lastHostEl.innerHTML = '';
      }
      lastHostEl = null;
    }
  });
})();
