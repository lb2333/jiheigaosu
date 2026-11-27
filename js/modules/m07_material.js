/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 7：全周期备料管理 (js/modules/m07_material.js)
   包含 4 个子页面：
     1. 备料总览 (overview)
     2. 报表管理 (report)
     3. 料场详情 (yard)
     4. 检验与现场关联 (inspect)
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'overview', name: '备料总览' },
    { id: 'report', name: '报表管理' },
    { id: 'yard', name: '料场详情' },
    { id: 'inspect', name: '检验与现场关联' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', yardId: 'yd-1', yardName: '材料场A', stake: 'K12+600 附近', gateStake: 'K12+540', camId: 'CAM-YD-A01', uavId: 'UAV-20261126-01', waypoint: '航点03', labName: '一工区实验室', reportCode: 'BL-20261126-A1', activeVer: 'V1.2' },
    { id: 'sec2', name: '二工区', yardId: 'yd-2', yardName: '料场示例A', stake: 'K28+400 附近', gateStake: 'K28+360', camId: 'CAM-YD-A03', uavId: 'UAV-20261126-02', waypoint: '航点07', labName: '二工区实验室', reportCode: 'BL-20261126-A2', activeVer: 'V1.2' },
    { id: 'sec3', name: '三工区', yardId: 'yd-3', yardName: '料场示例C', stake: 'K56+200 附近', gateStake: 'K56+150', camId: 'CAM-YD-C02', uavId: 'UAV-20261126-03', waypoint: '航点11', labName: '三工区实验室', reportCode: 'BL-20261126-A3', activeVer: 'V1.0' },
    { id: 'sec4', name: '四工区', yardId: 'yd-4', yardName: '料场示例B', stake: 'K81+500 附近', gateStake: 'K81+440', camId: 'CAM-YD-B04', uavId: 'UAV-20261126-04', waypoint: '航点14', labName: '四工区实验室', reportCode: 'BL-20261126-A4', activeVer: 'V1.1' },
    { id: 'sec5', name: '五工区', yardId: 'yd-5', yardName: '料场示例D', stake: 'K106+800 附近', gateStake: 'K106+730', camId: 'CAM-YD-D01', uavId: 'UAV-20261126-05', waypoint: '航点18', labName: '五工区实验室', reportCode: 'BL-20261126-A5', activeVer: 'V1.0' },
    { id: 'sec6', name: '六工区', yardId: 'yd-6', yardName: '料场示例E', stake: 'K132+900 附近', gateStake: 'K132+850', camId: 'CAM-YD-E02', uavId: 'UAV-20261126-06', waypoint: '航点22', labName: '六工区实验室', reportCode: 'BL-20261126-A6', activeVer: 'V1.0' }
  ];

  const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

  const MATERIAL_TYPES = [
    { name: '碎石', spec: '5–20 mm', color: '#3b82f6', tests: ['颗粒级配', '针片状含量', '含泥量'] },
    { name: '机制砂', spec: '0–4.75 mm', color: '#22d3ee', tests: ['细度模数', '石粉含量', '亚甲蓝MB值'] },
    { name: '水泥', spec: 'P·O 42.5', color: '#2dd4bf', tests: ['凝结时间', '安定性', '28d抗压强度'] },
    { name: '矿粉', spec: 'S95', color: '#facc15', tests: ['比表面积', '活性指数', '流动度比'] },
    { name: '钢筋', spec: 'HRB400', color: '#a78bfa', tests: ['屈服强度', '抗拉强度', '冷弯性能'] }
  ];

  const MATERIAL_META = Object.fromEntries(MATERIAL_TYPES.map(m => [m.name, m]));

  const PERIODS = [
    { id: '2026年11月', scale: 1.0, cutoff: '2026-11-26 10:40', sync: '2026-11-26 10:52' },
    { id: '2026年10月', scale: 0.86, cutoff: '2026-10-31 17:30', sync: '2026-10-31 18:00' },
    { id: '2026年09月', scale: 0.72, cutoff: '2026-09-30 17:30', sync: '2026-09-30 18:00' }
  ];

  const REPORT_DATES = ['2026-11-26', '2026-11-25', '2026-11-24'];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external CDN dependency)
     ------------------------------------------------------------------------ */
  const ICONS = {
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
    plan: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/><line x1="9" y1="18" x2="12" y2="18"/></svg>',
    truck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="7" width="13" height="10" rx="1.5"/><path d="M15 10h4l3 3v4h-7V10z"/><circle cx="6.5" cy="18.5" r="1.8"/><circle cx="17.5" cy="18.5" r="1.8"/></svg>',
    layers: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 3 2 8.5 12 14 22 8.5 12 3"/><polyline points="2 13.5 12 19 22 13.5"/><polyline points="2 17.5 12 23 22 17.5"/></svg>',
    checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.2l2.3 2.3 4.8-5"/></svg>',
    alertTri: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    flask: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 3h6"/><path d="M10 3v6l-5.2 9.1A2 2 0 006.5 21h11a2 2 0 001.7-2.9L14 9V3"/><path d="M7.5 15h9"/></svg>',
    docList: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>',
    download: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    upload: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>',
    extLink: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>',
    fileXls: '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#34d399" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M9 13l4 4m0-4l-4 4"/></svg>',
    pin: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 21s7-5.8 7-11a7 7 0 10-14 0c0 5.2 7 11 7 11z"/><circle cx="12" cy="10" r="2.5"/></svg>',
    cam: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="22 8 16 12 22 16 22 8"/></svg>',
    drone: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h5M15 7h5M7 7l2.5 5h5L17 7M7.5 17l2-5h5l2 5"/></svg>',
    checkSm: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><circle cx="12" cy="12" r="9"/><path d="M8.5 12l2.3 2.3 4.5-4.8"/></svg>',
    info: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>',
    calendar: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    stepBox: '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="16" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="14" x2="15" y2="14"/></svg>',
    chevLeft: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg>',
    chevRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 6 15 12 9 18"/></svg>',
    play: '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>'
  };

  /* ------------------------------------------------------------------------
     DETERMINISTIC 30-ITEM INVENTORY DATASET
     Exact reconciliation with 01_备料总览.png & 03_料场详情.png:
       Plan = 127,890 t | Arrival = 100,150 t | Physical = 33,370 t
       Usable = 32,555 t | Gap = 27,740 t | Pending Batches = 6 (of 50)
     ------------------------------------------------------------------------ */
  const BASE_INVENTORY = [
    // Top 5 priority rows matching 01_备料总览.png table order verbatim
    { id: 'inv-sec2-ss', secId: 'sec2', material: '碎石', plan: 12000, arrival: 8750, physical: 3020, quarantine: 260, status: '部分待检', batches: { pass: 5, pending: 2, recheck: 0, fail: 0 } },
    { id: 'inv-sec2-jzs', secId: 'sec2', material: '机制砂', plan: 6000, arrival: 4200, physical: 1520, quarantine: 120, status: '部分待检', batches: { pass: 3, pending: 1, recheck: 0, fail: 0 } },
    { id: 'inv-sec1-ss', secId: 'sec1', material: '碎石', plan: 10000, arrival: 8200, physical: 2730, quarantine: 0, status: '已合格', batches: { pass: 4, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec4-ss', secId: 'sec4', material: '碎石', plan: 11000, arrival: 8250, physical: 2940, quarantine: 160, status: '部分待检', batches: { pass: 4, pending: 1, recheck: 0, fail: 0 } },
    { id: 'inv-sec3-sn', secId: 'sec3', material: '水泥', plan: 3300, arrival: 2700, physical: 880, quarantine: 80, status: '部分待检', batches: { pass: 2, pending: 1, recheck: 0, fail: 0 } },

    // Remaining sec2 (料场示例A) materials (sum matches 03_料场详情.png: 24,500 / 18,250 / 6,220 / 5,750 / 6,250)
    { id: 'inv-sec2-sn', secId: 'sec2', material: '水泥', plan: 3800, arrival: 3200, physical: 970, quarantine: 50, status: '复检中', batches: { pass: 2, pending: 0, recheck: 1, fail: 0 } },
    { id: 'inv-sec2-kf', secId: 'sec2', material: '矿粉', plan: 1200, arrival: 910, physical: 290, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec2-gj', secId: 'sec2', material: '钢筋', plan: 1500, arrival: 1190, physical: 420, quarantine: 40, status: '含隔离批次', batches: { pass: 1, pending: 0, recheck: 0, fail: 1 } },

    // Remaining sec1 (材料场A) materials (sum: 21,100 / 17,000)
    { id: 'inv-sec1-jzs', secId: 'sec1', material: '机制砂', plan: 5200, arrival: 4050, physical: 1410, quarantine: 0, status: '已合格', batches: { pass: 2, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec1-sn', secId: 'sec1', material: '水泥', plan: 3400, arrival: 2750, physical: 860, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec1-kf', secId: 'sec1', material: '矿粉', plan: 1100, arrival: 880, physical: 280, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec1-gj', secId: 'sec1', material: '钢筋', plan: 1400, arrival: 1120, physical: 390, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

    // Remaining sec3 (料场示例C) materials (sum: 21,200 / 17,000)
    { id: 'inv-sec3-ss', secId: 'sec3', material: '碎石', plan: 10200, arrival: 8200, physical: 2680, quarantine: 0, status: '已合格', batches: { pass: 2, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec3-jzs', secId: 'sec3', material: '机制砂', plan: 5200, arrival: 4100, physical: 1340, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec3-kf', secId: 'sec3', material: '矿粉', plan: 1100, arrival: 870, physical: 270, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec3-gj', secId: 'sec3', material: '钢筋', plan: 1400, arrival: 1130, physical: 370, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

    // Remaining sec4 (料场示例B) materials (sum: 23,000 / 18,000)
    { id: 'inv-sec4-jzs', secId: 'sec4', material: '机制砂', plan: 5600, arrival: 4400, physical: 1450, quarantine: 55, status: '部分待检', batches: { pass: 1, pending: 1, recheck: 0, fail: 0 } },
    { id: 'inv-sec4-sn', secId: 'sec4', material: '水泥', plan: 3600, arrival: 3020, physical: 910, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec4-kf', secId: 'sec4', material: '矿粉', plan: 1250, arrival: 1030, physical: 310, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec4-gj', secId: 'sec4', material: '钢筋', plan: 1550, arrival: 1300, physical: 410, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

    // sec5 (料场示例D) materials (sum: 19,500 / 15,500)
    { id: 'inv-sec5-ss', secId: 'sec5', material: '碎石', plan: 9400, arrival: 7550, physical: 2420, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec5-jzs', secId: 'sec5', material: '机制砂', plan: 4800, arrival: 3750, physical: 1240, quarantine: 50, status: '复检中', batches: { pass: 0, pending: 0, recheck: 1, fail: 0 } },
    { id: 'inv-sec5-sn', secId: 'sec5', material: '水泥', plan: 3000, arrival: 2360, physical: 790, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec5-kf', secId: 'sec5', material: '矿粉', plan: 1050, arrival: 830, physical: 260, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec5-gj', secId: 'sec5', material: '钢筋', plan: 1250, arrival: 1010, physical: 340, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

    // sec6 (料场示例E) materials (sum: 18,590 / 14,400)
    { id: 'inv-sec6-ss', secId: 'sec6', material: '碎石', plan: 8850, arrival: 7000, physical: 2350, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec6-jzs', secId: 'sec6', material: '机制砂', plan: 4540, arrival: 3500, physical: 1180, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec6-sn', secId: 'sec6', material: '水泥', plan: 2970, arrival: 2150, physical: 760, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec6-kf', secId: 'sec6', material: '矿粉', plan: 1040, arrival: 800, physical: 250, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
    { id: 'inv-sec6-gj', secId: 'sec6', material: '钢筋', plan: 1190, arrival: 950, physical: 330, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } }
  ];

  /* ------------------------------------------------------------------------
     REPORTS DATASET (Page 2: 报表管理)
     ------------------------------------------------------------------------ */
  const REPORTS = [
    {
      code: 'BL-20261126-A2',
      secId: 'sec2',
      version: 'V1.3',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:51',
      uploadFull: '2026-11-26 10:51',
      fieldCheck: '通过',
      status: '待确认',
      fileName: '二工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '二工区看板当前使用 V1.2，确认时间 2026-11-26 10:42。',
      history: [
        { version: 'V1.3', time: '11-26 10:51', record: '字段检查通过', status: '待确认', uploader: '备料管理员A', rows: 5 },
        { version: 'V1.2', time: '11-26 10:42', record: '备料管理员A确认', status: '当前使用', uploader: '备料管理员A', rows: 5 },
        { version: 'V1.1', time: '11-25 17:30', record: '备料管理员A确认', status: '历史版本', uploader: '备料管理员A', rows: 5 }
      ]
    },
    {
      code: 'BL-20261126-A1',
      secId: 'sec1',
      version: 'V1.2',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:41',
      uploadFull: '2026-11-26 10:41',
      fieldCheck: '通过',
      status: '已确认',
      fileName: '一工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '一工区看板当前使用 V1.2，确认时间 2026-11-26 10:43。',
      history: [
        { version: 'V1.2', time: '11-26 10:43', record: '一工区材料主管确认', status: '当前使用', uploader: '材料员张博', rows: 5 },
        { version: 'V1.1', time: '11-25 17:20', record: '一工区材料主管确认', status: '历史版本', uploader: '材料员张博', rows: 5 }
      ]
    },
    {
      code: 'BL-20261126-A3',
      secId: 'sec3',
      version: 'V1.0',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:43',
      uploadFull: '2026-11-26 10:43',
      fieldCheck: '通过',
      status: '已确认',
      fileName: '三工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '三工区看板当前使用 V1.0，确认时间 2026-11-26 10:45。',
      history: [
        { version: 'V1.0', time: '11-26 10:45', record: '三工区材料主管确认', status: '当前使用', uploader: '材料员王晨', rows: 5 }
      ]
    },
    {
      code: 'BL-20261126-A4',
      secId: 'sec4',
      version: 'V1.1',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:44',
      uploadFull: '2026-11-26 10:44',
      fieldCheck: '通过',
      status: '已确认',
      fileName: '四工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '四工区看板当前使用 V1.1，确认时间 2026-11-26 10:46。',
      history: [
        { version: 'V1.1', time: '11-26 10:46', record: '四工区材料主管确认', status: '当前使用', uploader: '材料员赵宇', rows: 5 },
        { version: 'V1.0', time: '11-25 17:15', record: '四工区材料主管确认', status: '历史版本', uploader: '材料员赵宇', rows: 5 }
      ]
    },
    {
      code: 'BL-20261126-A5',
      secId: 'sec5',
      version: 'V1.0',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:45',
      uploadFull: '2026-11-26 10:45',
      fieldCheck: '通过',
      status: '已确认',
      fileName: '五工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '五工区看板当前使用 V1.0，确认时间 2026-11-26 10:47。',
      history: [
        { version: 'V1.0', time: '11-26 10:47', record: '五工区材料主管确认', status: '当前使用', uploader: '材料员陈思', rows: 5 }
      ]
    },
    {
      code: 'BL-20261126-A6',
      secId: 'sec6',
      version: 'V1.0',
      date: '2026-11-26',
      cutoff: '11-26 10:40',
      cutoffFull: '2026-11-26 10:40',
      uploadTime: '11-26 10:46',
      uploadFull: '2026-11-26 10:46',
      fieldCheck: '通过',
      status: '已确认',
      fileName: '六工区备料报表_20261126.xlsx',
      templateVer: '备料固定模板 V1.0',
      currentBoardNotice: '六工区看板当前使用 V1.0，确认时间 2026-11-26 10:48。',
      history: [
        { version: 'V1.0', time: '11-26 10:48', record: '六工区材料主管确认', status: '当前使用', uploader: '材料员孙洁', rows: 5 }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     BATCHES DATASET (Page 4: 检验与现场关联)
     ------------------------------------------------------------------------ */
  function buildBatches() {
    const sec2Batches = [
      {
        batchId: 'BM-JC-20261126-007',
        secId: 'sec2',
        material: '碎石',
        spec: '5–20 mm',
        entryTime: '11-26 08:16',
        videoTime: '2026-11-26 08:16:20',
        videoTimeShort: '11-26 08:16:20',
        uavTime: '2026-11-26 09:27:18',
        uavTimeShort: '11-26 09:27:18',
        uavFile: '料场全面巡检 · IMG_0018.jpg',
        qty: 720,
        status: '合格',
        reportId: 'JC-20261126-021',
        inspectTime: '2026-11-26 10:08',
        inspectTimeShort: '11-26 10:08',
        supplier: '明水宏达碎石料场',
        plateNo: '黑M·86219',
        items: [
          { name: '颗粒级配', pass: true, val: '连续级配 5-20mm 合格', std: 'JTG/T 3650' },
          { name: '针片状含量', pass: true, val: '5.8% (≤15%)', std: '≤15.0%' },
          { name: '含泥量', pass: true, val: '0.6% (≤1.0%)', std: '≤1.0%' }
        ]
      },
      {
        batchId: 'BM-JC-20261126-008',
        secId: 'sec2',
        material: '机制砂',
        spec: '0–4.75 mm',
        entryTime: '11-26 08:51',
        videoTime: '2026-11-26 08:51:09',
        videoTimeShort: '11-26 08:51:09',
        uavTime: '2026-11-26 09:27:18',
        uavTimeShort: '11-26 09:27:18',
        uavFile: '料场全面巡检 · IMG_0019.jpg',
        qty: 120,
        status: '待检',
        reportId: 'JC-20261126-024',
        inspectTime: '2026-11-26 10:35（待出报告）',
        inspectTimeShort: '11-26 10:35',
        supplier: '北安兴源机制砂厂',
        plateNo: '黑N·41508',
        items: [
          { name: '细度模数', pass: null, val: '取样筛分中', std: '2.3~3.0' },
          { name: '石粉含量', pass: null, val: '待检测', std: '≤7.0%' },
          { name: '亚甲蓝MB值', pass: null, val: '待检测', std: '<1.4' }
        ]
      },
      {
        batchId: 'BM-JC-20261126-009',
        secId: 'sec2',
        material: '水泥',
        spec: 'P·O 42.5',
        entryTime: '11-26 09:22',
        videoTime: '2026-11-26 09:22:41',
        videoTimeShort: '11-26 09:22:41',
        uavTime: '2026-11-26 09:27:18',
        uavTimeShort: '11-26 09:27:18',
        uavFile: '料场全面巡检 · IMG_0020.jpg',
        qty: 50,
        status: '复检中',
        reportId: 'JC-20261126-026',
        inspectTime: '2026-11-26 10:20（复检中）',
        inspectTimeShort: '11-26 10:20',
        supplier: '北方水泥海伦有限公司',
        plateNo: '黑M·30912',
        items: [
          { name: '凝结时间', pass: true, val: '初凝 185min / 终凝 260min', std: '初≥45 / 终≤600' },
          { name: '安定性', pass: true, val: '雷氏夹合格', std: '沸煮法合格' },
          { name: '3d抗压强度', pass: null, val: '平行样复检中', std: '≥17.0 MPa' }
        ]
      },
      {
        batchId: 'BM-JC-20261125-006',
        secId: 'sec2',
        material: '钢筋',
        spec: 'HRB400',
        entryTime: '11-25 15:40',
        videoTime: '2026-11-25 15:40:14',
        videoTimeShort: '11-25 15:40:14',
        uavTime: '2026-11-25 16:12:05',
        uavTimeShort: '11-25 16:12:05',
        uavFile: '隔离区核查巡检 · IMG_0012.jpg',
        qty: 40,
        status: '不合格',
        reportId: 'JC-20261125-019',
        inspectTime: '2026-11-25 17:15',
        inspectTimeShort: '11-25 17:15',
        supplier: '龙江钢铁直供中心',
        plateNo: '黑A·77421',
        quarantineNote: '已挂红色不合格隔离牌，存放于料场示例A西侧隔离棚，待退场清运。',
        items: [
          { name: '屈服强度', pass: true, val: '418 MPa', std: '≥400 MPa' },
          { name: '抗拉强度', pass: false, val: '522 MPa（偏低，已隔离）', std: '≥540 MPa' },
          { name: '冷弯性能', pass: true, val: '无裂纹', std: '180°无裂纹' }
        ]
      },
      {
        batchId: 'BM-JC-20261125-004',
        secId: 'sec2',
        material: '矿粉',
        spec: 'S95',
        entryTime: '11-25 14:20',
        videoTime: '2026-11-25 14:20:33',
        videoTimeShort: '11-25 14:20:33',
        uavTime: '2026-11-25 16:12:05',
        uavTimeShort: '11-25 16:12:05',
        uavFile: '料场全面巡检 · IMG_0011.jpg',
        qty: 160,
        status: '合格',
        reportId: 'JC-20261125-015',
        inspectTime: '2026-11-25 16:40',
        inspectTimeShort: '11-25 16:40',
        supplier: '齐齐哈尔建龙矿微粉厂',
        plateNo: '黑B·55309',
        items: [
          { name: '比表面积', pass: true, val: '428 m²/kg', std: '≥400 m²/kg' },
          { name: '活性指数', pass: true, val: '7d 81% / 28d 98%', std: '≥75% / ≥95%' },
          { name: '流动度比', pass: true, val: '99%', std: '≥95%' }
        ]
      }
    ];

    const generated = [...sec2Batches];
    const secConfigs = [
      { secId: 'sec1', prefix: '01', statuses: ['合格', '合格', '合格', '合格', '合格'] },
      { secId: 'sec3', prefix: '03', statuses: ['合格', '合格', '待检', '合格', '合格'] },
      { secId: 'sec4', prefix: '04', statuses: ['待检', '待检', '合格', '合格', '合格'] },
      { secId: 'sec5', prefix: '05', statuses: ['合格', '复检中', '合格', '合格', '合格'] },
      { secId: 'sec6', prefix: '06', statuses: ['合格', '合格', '合格', '合格', '合格'] }
    ];

    secConfigs.forEach(cfg => {
      MATERIAL_TYPES.forEach((m, idx) => {
        const st = cfg.statuses[idx];
        const num = String(idx + 1).padStart(3, '0');
        const hr = String(8 + idx).padStart(2, '0');
        const min = String(12 + idx * 9).padStart(2, '0');
        generated.push({
          batchId: `BM-JC-20261126-${cfg.prefix}${num}`,
          secId: cfg.secId,
          material: m.name,
          spec: m.spec,
          entryTime: `11-26 ${hr}:${min}`,
          videoTime: `2026-11-26 ${hr}:${min}:15`,
          videoTimeShort: `11-26 ${hr}:${min}:15`,
          uavTime: `2026-11-26 09:42:10`,
          uavTimeShort: `11-26 09:42:10`,
          uavFile: `料场例行巡检 · IMG_${cfg.prefix}${idx + 11}.jpg`,
          qty: [640, 320, 180, 110, 95][idx],
          status: st,
          reportId: `JC-20261126-${cfg.prefix}${idx + 1}`,
          inspectTime: st === '合格' ? `2026-11-26 ${String(10 + idx).padStart(2, '0')}:15` : `2026-11-26 10:30（${st}）`,
          inspectTimeShort: `11-26 ${String(10 + idx).padStart(2, '0')}:15`,
          supplier: ['绥化鑫磊矿业', '北安兴源砂厂', '北方水泥直供', '建龙矿粉中心', '龙江钢铁中心'][idx],
          plateNo: `黑M·${cfg.prefix}${idx + 2}89`,
          items: m.tests.map(t => ({
            name: t,
            pass: st === '合格' ? true : null,
            val: st === '合格' ? '符合规范要求' : (st === '复检中' ? '复检试验中' : '取样待检'),
            std: 'JTG 规范标准'
          }))
        });
      });
    });

    return generated;
  }

  const BATCHES = buildBatches();

  /* ------------------------------------------------------------------------
     PERSISTENT UI STATE
     ------------------------------------------------------------------------ */
  const uiState = {
    overview: {
      yardName: '',
      material: '',
      period: '2026年11月',
      selectedInvId: 'inv-sec2-ss',
      page: 1,
      pageSize: 5
    },
    report: {
      date: '2026-11-26',
      status: '',
      keyword: '',
      selectedCode: 'BL-20261126-A2',
      page: 1,
      pageSize: 6
    },
    yard: {
      fallbackSecId: 'sec2',
      yardName: '料场示例A',
      material: '',
      period: '2026年11月',
      selectedMaterial: ''
    },
    inspect: {
      fallbackSecId: 'sec2',
      yardName: '料场示例A',
      material: '',
      batchQuery: '',
      selectedBatchId: 'BM-JC-20261126-007'
    }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'overview';

  /* ------------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------------ */
  function fmtNum(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function getPeriodObj(periodId) {
    return PERIODS.find(p => p.id === periodId) || PERIODS[0];
  }

  function getScaledInventory(periodId) {
    const p = getPeriodObj(periodId);
    const s = p.scale;
    return BASE_INVENTORY.map(item => {
      const sec = SECTION_BY_ID[item.secId];
      const meta = MATERIAL_META[item.material];
      const plan = s === 1 ? item.plan : Math.round((item.plan * s) / 10) * 10;
      const arrival = s === 1 ? item.arrival : Math.round((item.arrival * s) / 10) * 10;
      const physical = s === 1 ? item.physical : Math.round((item.physical * s) / 10) * 10;
      const quarantine = s === 1 ? item.quarantine : Math.round((item.quarantine * s) / 5) * 5;
      const usable = Math.max(0, physical - quarantine);
      const gap = Math.max(0, plan - arrival);
      return {
        ...item,
        secName: sec.name,
        yardName: sec.yardName,
        spec: meta.spec,
        plan,
        arrival,
        physical,
        quarantine,
        usable,
        gap
      };
    });
  }

  function statusTagClass(status) {
    if (status === '已合格' || status === '合格' || status === '通过' || status === '已确认' || status === '当前使用') return 'ok';
    if (status === '部分待检' || status === '待检' || status === '待确认') return 'warn';
    if (status === '复检中') return 'info';
    if (status === '含隔离批次' || status === '不合格') return 'danger';
    return 'muted';
  }

  function syncSectionToHost(secId) {
    if (!lastCtx) return;
    lastCtx.state.activeSectionId = secId || null;
    document.querySelectorAll('#sectionNav .sec-item').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.sec === secId);
    });
    if (lastCtx.cesium && lastCtx.cesium.ready && typeof lastCtx.cesium.applyLayers === 'function') {
      try {
        lastCtx.cesium.applyLayers({ activeSectionId: secId || null });
      } catch (e) {
        // Silent background Cesium sync
      }
    }
  }

  function switchSubPage(targetSubPageId) {
    if (lastCtx && typeof lastCtx.switchModule === 'function') {
      lastCtx.switchModule('material', targetSubPageId);
    } else if (lastHost && lastCtx) {
      renderPage(lastHost, targetSubPageId, lastCtx);
    }
  }

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (<style id="m07-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m07-styles')) return;
    const style = document.createElement('style');
    style.id = 'm07-styles';
    style.textContent = `
      .m07-page {
        padding: 8px 18px 108px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }

      /* Filter Bar */
      .m07-filter-panel {
        padding: 9px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m07-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m07-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m07-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m07-select {
        min-width: 122px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m07-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m07-search-ico {
        position: absolute;
        left: 10px;
        color: #78a2d4;
        display: inline-flex;
        pointer-events: none;
      }
      .m07-input {
        width: 210px;
        height: 32px;
        padding: 4px 10px 4px 30px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(6, 22, 54, 0.88);
        color: #f1f7ff;
        font-size: 12.5px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m07-input::placeholder { color: #789bc4; }
      .m07-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 10px rgba(56, 242, 255, 0.28);
      }
      .m07-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }
      .m07-btn-primary {
        height: 32px;
        padding: 0 16px;
        border-radius: 6px;
        border: 1px solid rgba(103, 232, 249, 0.72);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        box-shadow: 0 0 14px rgba(22, 119, 255, 0.42);
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m07-btn-primary:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.62);
      }
      .m07-btn-outline {
        height: 32px;
        padding: 0 13px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 35, 78, 0.76);
        color: #dbeeff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m07-btn-outline:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(18, 56, 118, 0.88);
      }

      /* Panel Header tweaks */
      .m07-panel-header {
        cursor: default;
        padding: 9px 14px;
      }
      .m07-subnote {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 6px;
      }
      .m07-header-right {
        display: flex;
        align-items: center;
        gap: 10px;
        font-size: 12px;
        color: var(--text-sub);
        font-variant-numeric: tabular-nums;
      }

      /* KPI Grid (6 columns) */
      .m07-kpi-grid-6 {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m07-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.86) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m07-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.58);
        transform: translateY(-1px);
      }
      .m07-kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.24);
        border: 1px solid rgba(56, 220, 255, 0.34);
        color: #38f2ff;
      }
      .m07-kpi-icon.green {
        background: rgba(16, 185, 129, 0.18);
        border-color: rgba(52, 211, 153, 0.42);
        color: #34d399;
      }
      .m07-kpi-icon.gold {
        background: rgba(234, 179, 8, 0.16);
        border-color: rgba(250, 204, 21, 0.44);
        color: #facc15;
      }
      .m07-kpi-label {
        font-size: 12px;
        color: #b4d2f4;
        margin-bottom: 3px;
      }
      .m07-kpi-val {
        font-size: 24px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0.3px;
        color: #38f2ff;
        font-variant-numeric: tabular-nums;
      }
      .m07-kpi-val.green { color: #2be695; }
      .m07-kpi-val.gold { color: #facc15; }
      .m07-kpi-unit {
        font-size: 12px;
        font-weight: 600;
        color: #cfe6ff;
        margin-left: 4px;
      }

      /* Charts Row (Page 1) */
      .m07-charts-row {
        display: grid;
        grid-template-columns: 1.18fr 1fr 1fr;
        gap: 10px;
      }
      .m07-chart-body {
        padding: 8px 14px 12px;
      }
      .m07-chart-legend-inline {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-size: 11.5px;
        color: #b7d5f7;
      }
      .m07-dot {
        display: inline-block;
        width: 8px;
        height: 8px;
        border-radius: 50%;
        margin-right: 5px;
        vertical-align: middle;
      }
      .m07-donut-wrap {
        display: grid;
        grid-template-columns: 142px 1fr;
        align-items: center;
        gap: 14px;
        padding: 8px 14px 10px;
        min-height: 156px;
      }
      .m07-donut-legend {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m07-legend-row {
        display: grid;
        grid-template-columns: 1fr auto 52px;
        align-items: center;
        gap: 8px;
        padding: 3px 6px;
        border-radius: 5px;
        font-size: 12.5px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .m07-legend-row:hover {
        background: rgba(56, 189, 248, 0.12);
      }
      .m07-legend-row.active {
        background: rgba(22, 119, 255, 0.25);
        box-shadow: inset 2px 0 0 #38f2ff;
      }
      .m07-legend-name {
        color: #d6e9ff;
        display: inline-flex;
        align-items: center;
      }
      .m07-legend-num {
        color: #ffffff;
        font-weight: 700;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }
      .m07-legend-pct {
        color: #93b8de;
        font-size: 12px;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* Bottom Split (Page 1) */
      .m07-p1-bottom {
        display: grid;
        grid-template-columns: minmax(0, 2.25fr) minmax(320px, 1fr);
        gap: 10px;
      }

      /* Tables */
      .m07-table-panel {
        display: flex;
        flex-direction: column;
      }
      .m07-table-wrap {
        padding: 0 14px 6px;
        overflow-x: auto;
        flex: 1;
      }
      .m07-table th {
        font-size: 12px;
        font-weight: 600;
        color: #93c5fd;
        background: rgba(12, 42, 92, 0.62);
        padding: 9px 10px;
        white-space: nowrap;
      }
      .m07-table td {
        padding: 7.5px 10px;
        font-size: 12.5px;
        color: #e6f2ff;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .m07-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m07-table tbody tr:hover {
        background: rgba(20, 74, 152, 0.28);
      }
      .m07-table tbody tr.selected {
        background: rgba(22, 110, 220, 0.3);
        box-shadow: inset 3px 0 0 #38f2ff;
      }
      .m07-num-green { color: #2be695 !important; font-weight: 700; }
      .m07-num-gold { color: #facc15 !important; font-weight: 700; }

      /* Tags & Links */
      .m07-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 10px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        min-width: 54px;
        white-space: nowrap;
      }
      .m07-tag.ok {
        background: rgba(34, 197, 94, 0.18);
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.45);
      }
      .m07-tag.warn {
        background: rgba(234, 179, 8, 0.16);
        color: #facc15;
        border: 1px solid rgba(250, 204, 21, 0.48);
      }
      .m07-tag.info {
        background: rgba(14, 165, 233, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.48);
      }
      .m07-tag.danger {
        background: rgba(239, 68, 68, 0.2);
        color: #f87171;
        border: 1px solid rgba(248, 113, 113, 0.5);
      }
      .m07-tag.muted {
        background: rgba(100, 116, 139, 0.22);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.42);
      }
      .m07-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 4px;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        transition: color 0.15s, text-shadow 0.15s;
      }
      .m07-link-btn:hover {
        color: #ffffff;
        text-shadow: 0 0 8px rgba(56, 242, 255, 0.85);
      }

      /* Pagination */
      .m07-pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 8px;
        padding: 8px 14px 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.14);
        font-size: 12px;
        color: #93c5fd;
      }
      .m07-page-btn {
        min-width: 26px;
        height: 26px;
        padding: 0 7px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(10, 34, 76, 0.72);
        color: #cfe6ff;
        font-size: 12px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
      }
      .m07-page-btn:hover:not(:disabled) {
        border-color: var(--cyan-bright);
        color: #ffffff;
      }
      .m07-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #67e8f9;
        color: #ffffff;
        font-weight: 700;
      }
      .m07-page-btn:disabled {
        opacity: 0.38;
        cursor: not-allowed;
      }

      /* Focus Alerts (Page 1 Right Bottom) */
      .m07-focus-list {
        padding: 8px 14px 10px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        flex: 1;
      }
      .m07-focus-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(10, 34, 76, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.2);
        transition: border-color 0.18s;
      }
      .m07-focus-item:hover {
        border-color: rgba(56, 220, 255, 0.5);
      }
      .m07-focus-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m07-focus-ico {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m07-focus-ico.warn {
        background: rgba(234, 179, 8, 0.16);
        border: 1px solid rgba(250, 204, 21, 0.4);
        color: #facc15;
      }
      .m07-focus-ico.danger {
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid rgba(248, 113, 113, 0.45);
        color: #f87171;
      }
      .m07-focus-title {
        font-size: 13px;
        font-weight: 700;
        color: #eef6ff;
        margin-bottom: 2px;
      }
      .m07-focus-sub {
        font-size: 11.5px;
        color: #93b8de;
      }
      .m07-pill-action {
        padding: 4px 11px;
        border-radius: 99px;
        font-size: 11.5px;
        font-weight: 700;
        cursor: pointer;
        white-space: nowrap;
        transition: all 0.16s;
      }
      .m07-pill-action.warn {
        background: rgba(234, 179, 8, 0.16);
        border: 1px solid rgba(250, 204, 21, 0.52);
        color: #facc15;
      }
      .m07-pill-action.warn:hover {
        background: rgba(234, 179, 8, 0.3);
        color: #ffffff;
      }
      .m07-pill-action.danger {
        background: rgba(239, 68, 68, 0.18);
        border: 1px solid rgba(248, 113, 113, 0.55);
        color: #fca5a5;
      }
      .m07-pill-action.danger:hover {
        background: rgba(239, 68, 68, 0.35);
        color: #ffffff;
      }
      .m07-panel-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.14);
        font-size: 11.5px;
        color: #8cb2db;
      }

      /* Page 2: Stepper & Report Layout */
      .m07-stepper {
        display: grid;
        grid-template-columns: 1fr auto 1fr auto 1fr auto 1fr;
        align-items: center;
        gap: 8px;
        padding: 10px 14px 12px;
      }
      .m07-step-card {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 11px 14px;
        border-radius: 8px;
        background: rgba(11, 38, 84, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m07-step-card.active-warn {
        background: linear-gradient(180deg, rgba(66, 54, 22, 0.45), rgba(32, 34, 46, 0.72));
        border-color: rgba(250, 204, 21, 0.65);
        box-shadow: 0 0 14px rgba(250, 204, 21, 0.14);
      }
      .m07-step-card.active-ok {
        background: linear-gradient(180deg, rgba(16, 78, 66, 0.45), rgba(10, 38, 64, 0.75));
        border-color: rgba(52, 211, 153, 0.62);
      }
      .m07-step-ico {
        color: #38f2ff;
        display: inline-flex;
      }
      .m07-step-card.active-warn .m07-step-ico { color: #facc15; }
      .m07-step-card.active-ok .m07-step-ico { color: #34d399; }
      .m07-step-title {
        font-size: 13px;
        font-weight: 700;
        color: #f1f7ff;
      }
      .m07-step-card.active-warn .m07-step-title { color: #fde047; }
      .m07-step-sub {
        font-size: 11.5px;
        color: #93b8de;
        margin-top: 2px;
      }
      .m07-step-arrow {
        color: #60a5fa;
        opacity: 0.7;
        display: inline-flex;
      }

      .m07-p2-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.58fr) minmax(350px, 1fr);
        gap: 10px;
        align-items: start;
      }
      .m07-stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m07-verify-body {
        padding: 10px 16px 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .m07-file-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      }
      .m07-file-title {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        font-size: 13.5px;
        font-weight: 700;
        color: #f1f7ff;
      }
      .m07-kv-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m07-kv-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
        font-size: 12.5px;
      }
      .m07-kv-k {
        width: 78px;
        color: #8cb2db;
        flex-shrink: 0;
      }
      .m07-kv-v {
        color: #f0f7ff;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
      }
      .m07-check-box {
        padding-top: 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m07-check-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 10px;
        font-size: 13px;
        font-weight: 700;
        color: #eaf4ff;
      }
      .m07-check-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 0;
        border-bottom: 1px dashed rgba(56, 189, 248, 0.12);
        font-size: 12.5px;
      }
      .m07-check-row:last-child { border-bottom: none; }
      .m07-check-left {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        color: #cfe4ff;
      }
      .m07-check-left svg { color: #34d399; }
      .m07-check-right {
        color: #9dc2e8;
        font-size: 12px;
      }
      .m07-info-banner {
        display: flex;
        align-items: center;
        gap: 8px;
        padding: 9px 12px;
        border-radius: 7px;
        background: rgba(14, 52, 108, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.3);
        font-size: 12px;
        color: #b7dcff;
      }
      .m07-btn-row-2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 2px;
      }

      /* Page 3: Yard Detail */
      .m07-p3-mid {
        display: grid;
        grid-template-columns: minmax(0, 1.48fr) minmax(340px, 1fr);
        gap: 10px;
      }
      .m07-scene-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m07-scene-card {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m07-scene-frame {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: #071936;
        aspect-ratio: 16 / 9.2;
        cursor: pointer;
        transition: border-color 0.2s, box-shadow 0.2s;
      }
      .m07-scene-frame:hover {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 14px rgba(56, 220, 255, 0.32);
      }
      .m07-scene-frame > svg {
        width: 100%;
        height: 100%;
        display: block;
      }
      .m07-hud-tl, .m07-hud-tr, .m07-hud-bl {
        position: absolute;
        padding: 3px 8px;
        border-radius: 5px;
        background: rgba(5, 18, 42, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #e6f4ff;
        font-size: 11px;
        font-weight: 600;
        display: inline-flex;
        align-items: center;
        gap: 4px;
        white-space: nowrap;
        backdrop-filter: blur(4px);
      }
      .m07-hud-tl { top: 8px; left: 8px; }
      .m07-hud-tr { top: 8px; right: 8px; }
      .m07-hud-bl { bottom: 8px; left: 8px; font-variant-numeric: tabular-nums; }
      .m07-scene-cap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #9ec0e6;
      }
      .m07-yard-info-body {
        padding: 12px 16px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
      }
      .m07-yard-gap-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.28);
        font-size: 12.5px;
      }

      /* Page 4: Inspect & Site Link */
      .m07-p4-grid {
        display: grid;
        grid-template-columns: minmax(340px, 0.76fr) minmax(0, 1.45fr);
        gap: 10px;
        align-items: start;
      }
      .m07-test-chips {
        display: flex;
        flex-wrap: wrap;
        gap: 7px;
        margin-top: 6px;
      }
      .m07-test-chip {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 6px;
        font-size: 11.5px;
        font-weight: 600;
        border: 1px solid rgba(52, 211, 153, 0.45);
        background: rgba(16, 185, 129, 0.14);
        color: #6ee7b7;
      }
      .m07-test-chip.pending {
        border-color: rgba(250, 204, 21, 0.45);
        background: rgba(234, 179, 8, 0.14);
        color: #fde047;
      }
      .m07-test-chip.fail {
        border-color: rgba(248, 113, 113, 0.5);
        background: rgba(239, 68, 68, 0.18);
        color: #fca5a5;
      }
      .m07-media-card-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 6px;
        font-size: 12.5px;
        font-weight: 700;
        color: #e6f2ff;
      }
      .m07-media-frame {
        aspect-ratio: 16 / 11;
      }

      /* Modal helpers */
      .m07-modal-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
        margin-bottom: 12px;
      }
      .m07-modal-kv {
        padding: 9px 12px;
        border-radius: 8px;
        background: rgba(12, 40, 88, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m07-modal-kv .k { font-size: 11.5px; color: #93b8de; margin-bottom: 3px; }
      .m07-modal-kv .v { font-size: 14px; font-weight: 700; color: #f1f7ff; font-variant-numeric: tabular-nums; }

      @media (max-width: 1360px) {
        .m07-kpi-grid-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m07-charts-row { grid-template-columns: 1fr; }
        .m07-p1-bottom, .m07-p2-grid, .m07-p3-mid, .m07-p4-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     PURE SVG CHARTS (Zero external CDN dependencies)
     ------------------------------------------------------------------------ */
  function buildSectionBarSvg(allPeriodItems, activeSecId) {
    const W = 500;
    const H = 178;
    const padL = 36;
    const padR = 14;
    const padT = 22;
    const padB = 28;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const maxVal = 2.6;

    const sectionStats = SECTIONS.map(sec => {
      const items = allPeriodItems.filter(it => it.secId === sec.id);
      const planW = items.reduce((acc, it) => acc + it.plan, 0) / 10000;
      const arrW = items.reduce((acc, it) => acc + it.arrival, 0) / 10000;
      return { sec, planW, arrW };
    });

    const ticks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
    const gridLines = ticks.map(t => {
      const y = padT + plotH - (t / maxVal) * plotH;
      return `
        <line x1="${padL}" y1="${y.toFixed(1)}" x2="${W - padR}" y2="${y.toFixed(1)}" stroke="rgba(148,186,232,0.16)" stroke-dasharray="${t === 0 ? '0' : '3 3'}"/>
        <text x="${padL - 7}" y="${(y + 4).toFixed(1)}" fill="#8db4de" font-size="10.5" text-anchor="end">${t === 0 ? '0' : t.toFixed(1)}</text>
      `;
    }).join('');

    const groupW = plotW / sectionStats.length;
    const barW = 19;
    const barGap = 4;

    const bars = sectionStats.map((d, i) => {
      const cx = padL + i * groupW + groupW / 2;
      const x1 = cx - barW - barGap / 2;
      const x2 = cx + barGap / 2;
      const h1 = Math.max(2, (d.planW / maxVal) * plotH);
      const h2 = Math.max(2, (d.arrW / maxVal) * plotH);
      const y1 = padT + plotH - h1;
      const y2 = padT + plotH - h2;
      const isSelected = activeSecId === d.sec.id;
      const dim = activeSecId && !isSelected ? 0.35 : 1;

      return `
        <g data-chart-sec="${d.sec.id}" style="cursor:pointer;opacity:${dim};transition:opacity 0.2s;">
          ${isSelected ? `<rect x="${(cx - 28).toFixed(1)}" y="${padT - 8}" width="56" height="${plotH + 30}" rx="6" fill="rgba(56,220,255,0.1)" stroke="rgba(56,220,255,0.45)"/>` : ''}
          <rect x="${x1.toFixed(1)}" y="${y1.toFixed(1)}" width="${barW}" height="${h1.toFixed(1)}" rx="2.5" fill="url(#m07BarPlan)"/>
          <text x="${(x1 + barW / 2).toFixed(1)}" y="${(y1 - 5).toFixed(1)}" fill="#cfe6ff" font-size="10" font-weight="600" text-anchor="middle">${d.planW.toFixed(2)}</text>
          <rect x="${x2.toFixed(1)}" y="${y2.toFixed(1)}" width="${barW}" height="${h2.toFixed(1)}" rx="2.5" fill="url(#m07BarArr)"/>
          <text x="${(x2 + barW / 2).toFixed(1)}" y="${(y2 - 5).toFixed(1)}" fill="#67e8f9" font-size="10" font-weight="600" text-anchor="middle">${d.arrW.toFixed(2)}</text>
          <text x="${cx.toFixed(1)}" y="${H - 9}" fill="${isSelected ? '#38f2ff' : '#bdd8f7'}" font-size="11" font-weight="${isSelected ? '700' : '500'}" text-anchor="middle">${d.sec.name}</text>
        </g>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${W} ${H}" width="100%" height="156" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="m07BarPlan" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#5a9cff"/>
            <stop offset="100%" stop-color="#2c63d6"/>
          </linearGradient>
          <linearGradient id="m07BarArr" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38f2ff"/>
            <stop offset="100%" stop-color="#0ea5e9"/>
          </linearGradient>
        </defs>
        ${gridLines}
        ${bars}
      </svg>
    `;
  }

  function buildDonutSvg(segments, centerTop, centerUnit, centerSub) {
    const size = 148;
    const cx = size / 2;
    const cy = size / 2;
    const r = 54;
    const strokeW = 16;
    const circ = 2 * Math.PI * r;
    const total = segments.reduce((a, s) => a + s.value, 0) || 1;
    let accLen = 0;

    const arcs = segments.map(seg => {
      const frac = seg.value / total;
      const len = Math.max(0, frac * circ - (segments.filter(s => s.value > 0).length > 1 ? 2 : 0));
      const offset = -accLen;
      accLen += frac * circ;
      if (seg.value <= 0) return '';
      return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${seg.color}" stroke-width="${strokeW}" stroke-dasharray="${len.toFixed(2)} ${(circ - len).toFixed(2)}" stroke-dashoffset="${offset.toFixed(2)}" transform="rotate(-90 ${cx} ${cy})"/>`;
    }).join('');

    return `
      <svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
        <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="rgba(18,52,108,0.65)" stroke-width="${strokeW}"/>
        ${arcs}
        <text x="${cx}" y="${cy - 3}" text-anchor="middle" fill="#ffffff" font-size="19" font-weight="800">${esc(centerTop)}<tspan font-size="11" font-weight="600" fill="#a8d1f7"> ${esc(centerUnit)}</tspan></text>
        <text x="${cx}" y="${cy + 16}" text-anchor="middle" fill="#9bc0e6" font-size="11">${esc(centerSub)}</text>
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     PURE INLINE SVG SITE IMAGERY (Yard Aerial, Gate Camera, UAV Inspection)
     Zero external image URLs — guaranteed crisp render offline
     ------------------------------------------------------------------------ */
  function svgYardAerial(sec) {
    return `
      <svg viewBox="0 0 420 240" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="m07FieldBg" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#8b7d5b"/>
            <stop offset="100%" stop-color="#695e44"/>
          </linearGradient>
          <linearGradient id="m07ShedRoof" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#2563eb"/>
            <stop offset="100%" stop-color="#1d4ed8"/>
          </linearGradient>
          <linearGradient id="m07YardConcrete" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stop-color="#b8b5ad"/>
            <stop offset="100%" stop-color="#96938b"/>
          </linearGradient>
        </defs>
        <!-- Surrounding autumn farmland & trees -->
        <rect width="420" height="240" fill="url(#m07FieldBg)"/>
        <rect x="0" y="0" width="52" height="240" fill="#5e683e"/>
        <rect x="368" y="0" width="52" height="240" fill="#7c6d48"/>
        <path d="M52 10 L368 10 L368 232 L52 232 Z" fill="url(#m07YardConcrete)" stroke="#6c6960" stroke-width="2"/>
        <!-- Internal access roads -->
        <path d="M62 12 L62 228 M352 12 L352 228 M62 118 L352 118" stroke="#d4d2cb" stroke-width="14" opacity="0.65"/>
        <!-- 3 Blue arched material sheds (matching schematic) -->
        <g>
          <rect x="92" y="18" width="66" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" stroke-width="1.2"/>
          <line x1="125" y1="18" x2="125" y2="104" stroke="#60a5fa" stroke-width="1.5" opacity="0.7"/>
          <rect x="172" y="18" width="68" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" stroke-width="1.2"/>
          <line x1="206" y1="18" x2="206" y2="104" stroke="#60a5fa" stroke-width="1.5" opacity="0.7"/>
          <rect x="254" y="18" width="68" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" stroke-width="1.2"/>
          <line x1="288" y1="18" x2="288" y2="104" stroke="#60a5fa" stroke-width="1.5" opacity="0.7"/>
        </g>
        <!-- Mixing station silos on left -->
        <g>
          <circle cx="98" cy="148" r="10" fill="#e2e8f0" stroke="#475569" stroke-width="1.5"/>
          <circle cx="118" cy="148" r="10" fill="#cbd5e1" stroke="#475569" stroke-width="1.5"/>
          <rect x="86" y="166" width="46" height="32" rx="2" fill="#3b82f6" stroke="#93c5fd" stroke-width="1"/>
        </g>
        <!-- Aggregate stockpiles (crushed stone & sand mounds) -->
        <g>
          <path d="M150 202 Q196 116 244 202 Z" fill="#8b9198" stroke="#64748b" stroke-width="1.2"/>
          <path d="M174 202 Q204 134 234 202 Z" fill="#a1a8b0" opacity="0.8"/>
          <path d="M256 202 Q296 138 338 202 Z" fill="#c7b28e" stroke="#9a8560" stroke-width="1.2"/>
          <path d="M276 202 Q302 152 326 202 Z" fill="#d6c4a4" opacity="0.85"/>
        </g>
        <!-- Yellow loaders -->
        <g>
          <rect x="192" y="204" width="18" height="9" rx="2" fill="#eab308" stroke="#713f12" stroke-width="1"/>
          <rect x="296" y="205" width="16" height="8" rx="2" fill="#eab308" stroke="#713f12" stroke-width="1"/>
        </g>
        <!-- Perimeter subtle blue boundary highlight -->
        <rect x="52" y="10" width="316" height="222" fill="none" stroke="rgba(56,242,255,0.45)" stroke-width="1.5" stroke-dasharray="6 4"/>
        <!-- Autumn trees along edges -->
        <g fill="#b48a2c" opacity="0.85">
          <circle cx="382" cy="48" r="14"/><circle cx="395" cy="76" r="16"/><circle cx="384" cy="108" r="13"/>
          <circle cx="34" cy="64" r="13"/><circle cx="28" cy="126" r="15"/><circle cx="36" cy="178" r="14"/>
        </g>
        <text x="358" y="226" fill="rgba(255,255,255,0.75)" font-size="9" text-anchor="end">${esc(sec.name)} · ${esc(sec.stake)}</text>
      </svg>
    `;
  }

  function svgGateCamera(sec, timeLabel) {
    return `
      <svg viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="m07Sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#8ab8e6"/>
            <stop offset="100%" stop-color="#cfe4f7"/>
          </linearGradient>
          <linearGradient id="m07Road" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#b4b7bc"/>
            <stop offset="100%" stop-color="#d5d7db"/>
          </linearGradient>
        </defs>
        <rect width="420" height="84" fill="url(#m07Sky)"/>
        <!-- Distant autumn forest & material shed -->
        <path d="M0 78 Q40 54 90 74 Q140 52 210 72 L210 92 L0 92 Z" fill="#8d7843"/>
        <rect x="242" y="24" width="178" height="74" fill="#334155"/>
        <polygon points="242,24 335,14 420,24" fill="#1d4ed8"/>
        <!-- Gravel yard behind gate -->
        <rect x="0" y="84" width="420" height="176" fill="#c8c6be"/>
        <!-- Stockpiles in background -->
        <path d="M18 112 Q88 52 162 112 Z" fill="#8b949e" stroke="#64748b"/>
        <path d="M128 112 Q186 64 246 112 Z" fill="#9aa2ab"/>
        <path d="M318 114 Q366 78 416 114 Z" fill="#bfa882"/>
        <!-- Yellow wheel loader in mid-ground -->
        <g transform="translate(226,74)">
          <rect x="10" y="14" width="30" height="16" rx="3" fill="#eab308" stroke="#78350f"/>
          <rect x="18" y="4" width="16" height="11" rx="2" fill="#1e293b"/>
          <circle cx="16" cy="31" r="6" fill="#1f2937"/><circle cx="34" cy="31" r="6" fill="#1f2937"/>
          <path d="M10 22 L0 26 L4 32 L12 28" fill="#ca8a04"/>
        </g>
        <!-- Concrete entrance lane -->
        <polygon points="154,112 266,112 356,260 66,260" fill="url(#m07Road)" stroke="#94a3b8" stroke-width="1.5"/>
        <line x1="210" y1="112" x2="210" y2="260" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="8 6"/>
        <!-- Guardhouse on left -->
        <g>
          <polygon points="12,118 96,118 112,130 2,130" fill="#1d4ed8"/>
          <rect x="12" y="130" width="84" height="66" fill="#f1f5f9" stroke="#64748b"/>
          <rect x="22" y="140" width="32" height="24" fill="#334155" stroke="#94a3b8"/>
          <rect x="64" y="140" width="24" height="44" fill="#475569"/>
        </g>
        <!-- Blue steel perimeter fence -->
        <rect x="314" y="132" width="106" height="46" fill="none" stroke="#2563eb" stroke-width="2.5"/>
        <line x1="334" y1="132" x2="334" y2="178" stroke="#2563eb" stroke-width="1.5"/>
        <line x1="354" y1="132" x2="354" y2="178" stroke="#2563eb" stroke-width="1.5"/>
        <line x1="374" y1="132" x2="374" y2="178" stroke="#2563eb" stroke-width="1.5"/>
        <line x1="394" y1="132" x2="394" y2="178" stroke="#2563eb" stroke-width="1.5"/>
        <!-- Boom barrier pedestals & red/white arm -->
        <rect x="124" y="148" width="14" height="42" rx="2" fill="#facc15" stroke="#854d0e"/>
        <rect x="284" y="148" width="14" height="42" rx="2" fill="#facc15" stroke="#854d0e"/>
        <line x1="138" y1="162" x2="284" y2="162" stroke="#f8fafc" stroke-width="5"/>
        <line x1="138" y1="162" x2="284" y2="162" stroke="#ef4444" stroke-width="5" stroke-dasharray="14 14"/>
        ${timeLabel ? `<rect x="8" y="232" width="128" height="20" rx="4" fill="rgba(5,18,42,0.82)" stroke="rgba(56,189,248,0.45)"/><text x="15" y="245" fill="#e6f4ff" font-size="10.5" font-weight="600">${esc(timeLabel)}</text>` : ''}
      </svg>
    `;
  }

  function svgUavInspection(sec, timeLabel) {
    return `
      <svg viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice">
        <defs>
          <linearGradient id="m07UavSky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#87b6e3"/>
            <stop offset="100%" stop-color="#d4e6f7"/>
          </linearGradient>
        </defs>
        <rect width="420" height="48" fill="url(#m07UavSky)"/>
        <rect x="0" y="42" width="420" height="28" fill="#8b7b4b"/>
        <!-- Yard concrete ground -->
        <rect x="0" y="64" width="420" height="196" fill="#c6c4bd"/>
        <!-- Perspective central lane with yellow safety borders -->
        <polygon points="184,64 218,64 334,260 112,260" fill="#d8d6cf"/>
        <line x1="184" y1="64" x2="112" y2="260" stroke="#facc15" stroke-width="2.5"/>
        <line x1="218" y1="64" x2="334" y2="260" stroke="#facc15" stroke-width="2.5"/>
        <!-- Left blue steel shed roof + rebar racks underneath -->
        <polygon points="0,36 168,64 76,144 0,136" fill="#1d4ed8" stroke="#60a5fa" stroke-width="1.5"/>
        <polygon points="0,136 76,144 106,260 0,260" fill="#64748b"/>
        <!-- Stacked steel rebar bundles -->
        <g stroke="#334155" stroke-width="3">
          <line x1="12" y1="154" x2="88" y2="154"/><line x1="8" y1="168" x2="92" y2="168"/>
          <line x1="4" y1="184" x2="96" y2="184"/><line x1="4" y1="202" x2="98" y2="202"/>
          <line x1="4" y1="222" x2="102" y2="222"/><line x1="4" y1="242" x2="104" y2="242"/>
        </g>
        <!-- Right green tarp covered aggregate/cement stock -->
        <polygon points="244,72 372,78 420,178 332,178" fill="#1b5e4b" stroke="#0f3f32" stroke-width="1.5"/>
        <path d="M270 76 L354 176 M304 78 L388 176 M340 80 L414 166" stroke="#2a7d65" stroke-width="2"/>
        <!-- Concrete masonry blocks pallets on bottom right -->
        <g fill="#a8adb3" stroke="#64748b" stroke-width="1">
          <rect x="296" y="164" width="44" height="34" rx="2"/>
          <rect x="348" y="176" width="52" height="44" rx="2"/>
          <rect x="334" y="218" width="66" height="38" rx="2"/>
        </g>
        <!-- Subtle UAV scan crosshair -->
        <g stroke="rgba(56,242,255,0.45)" stroke-width="1" fill="none">
          <rect x="148" y="88" width="124" height="84" stroke-dasharray="4 4"/>
          <line x1="210" y1="120" x2="210" y2="140"/><line x1="200" y1="130" x2="220" y2="130"/>
        </g>
        ${timeLabel ? `<rect x="8" y="232" width="128" height="20" rx="4" fill="rgba(5,18,42,0.82)" stroke="rgba(56,189,248,0.45)"/><text x="15" y="245" fill="#e6f4ff" font-size="10.5" font-weight="600">${esc(timeLabel)}</text>` : ''}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS (Detail, Report Excel Preview, Upload Report, Lab Report, Media)
     ------------------------------------------------------------------------ */
  function openInventoryModal(invItem, periodId) {
    if (!lastCtx) return;
    const pObj = getPeriodObj(periodId);
    const sec = SECTION_BY_ID[invItem.secId];
    const ratio = invItem.plan > 0 ? ((invItem.arrival / invItem.plan) * 100).toFixed(1) : '0.0';
    const body = `
      <div class="m07-modal-grid">
        <div class="m07-modal-kv"><div class="k">所属工区 / 料场</div><div class="v">${esc(sec.name)} · ${esc(sec.yardName)}</div></div>
        <div class="m07-modal-kv"><div class="k">材料及规格</div><div class="v">${esc(invItem.material)}（${esc(invItem.spec)}）</div></div>
        <div class="m07-modal-kv"><div class="k">计划量 / 累计进场量</div><div class="v">${fmtNum(invItem.plan)} t / ${fmtNum(invItem.arrival)} t（${ratio}%）</div></div>
        <div class="m07-modal-kv"><div class="k">实物库存 / 可用库存</div><div class="v">${fmtNum(invItem.physical)} t / <span style="color:#2be695">${fmtNum(invItem.usable)} t</span></div></div>
        <div class="m07-modal-kv"><div class="k">待检及隔离量</div><div class="v" style="color:${invItem.quarantine > 0 ? '#facc15' : '#93c5fd'}">${fmtNum(invItem.quarantine)} t</div></div>
        <div class="m07-modal-kv"><div class="k">当前备料缺口</div><div class="v" style="color:#facc15">${fmtNum(invItem.gap)} t</div></div>
      </div>
      <div style="padding:10px 12px;border-radius:8px;background:rgba(8,28,64,0.75);border:1px solid rgba(56,189,248,0.25);font-size:12.5px;color:#cfe6ff;margin-bottom:14px;">
        <div><strong>校验公式：</strong>可用库存（${fmtNum(invItem.usable)} t）= 实物库存（${fmtNum(invItem.physical)} t）- 待检及隔离量（${fmtNum(invItem.quarantine)} t）</div>
        <div style="margin-top:4px;"><strong>统计口径：</strong>${esc(periodId)} · 统计截至 ${esc(pObj.cutoff)} · 检验状态：<span class="m07-tag ${statusTagClass(invItem.status)}">${esc(invItem.status)}</span></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m07-btn-outline" id="m07ModalJumpYard">查看料场详情</button>
        <button class="m07-btn-primary" id="m07ModalJumpInspect">查看检验与现场关联</button>
      </div>
    `;
    lastCtx.openModal(`备料明细台账 — ${sec.name} · ${invItem.material}`, body);
    const jYard = document.getElementById('m07ModalJumpYard');
    const jInsp = document.getElementById('m07ModalJumpInspect');
    if (jYard) {
      jYard.addEventListener('click', () => {
        uiState.yard.fallbackSecId = invItem.secId;
        uiState.yard.yardName = sec.yardName;
        uiState.yard.material = '';
        lastCtx.closeModal();
        switchSubPage('yard');
      });
    }
    if (jInsp) {
      jInsp.addEventListener('click', () => {
        uiState.inspect.fallbackSecId = invItem.secId;
        uiState.inspect.yardName = sec.yardName;
        uiState.inspect.material = invItem.material;
        const matchB = BATCHES.find(b => b.secId === invItem.secId && b.material === invItem.material) || BATCHES.find(b => b.secId === invItem.secId);
        if (matchB) uiState.inspect.selectedBatchId = matchB.batchId;
        lastCtx.closeModal();
        switchSubPage('inspect');
      });
    }
  }

  function openReportFileModal(rep, verOverride) {
    if (!lastCtx) return;
    const sec = SECTION_BY_ID[rep.secId];
    const items = getScaledInventory('2026年11月').filter(it => it.secId === rep.secId);
    const verLabel = verOverride || rep.version;
    const rowsHtml = items.map(it => `
      <tr>
        <td>${esc(sec.name)}</td>
        <td>${esc(sec.yardName)}</td>
        <td>${esc(it.material)}</td>
        <td>${esc(it.spec)}</td>
        <td>${fmtNum(it.plan)}</td>
        <td>${fmtNum(it.arrival)}</td>
        <td>${fmtNum(it.physical)}</td>
        <td class="m07-num-green">${fmtNum(it.usable)}</td>
        <td class="m07-num-gold">${fmtNum(it.gap)}</td>
      </tr>
    `).join('');
    const body = `
      <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;font-size:12.5px;color:#b8d7f7;">
        <span>文件：<strong>${esc(rep.fileName)}</strong>（${esc(verLabel)}）</span>
        <span>模板：${esc(rep.templateVer)} · 统计截至 ${esc(rep.cutoffFull)}</span>
      </div>
      <div style="overflow-x:auto;">
        <table class="data-table m07-table">
          <thead>
            <tr><th>工区</th><th>料场</th><th>材料</th><th>规格</th><th>计划量(t)</th><th>累计进场(t)</th><th>实物库存(t)</th><th>可用库存(t)</th><th>缺口(t)</th></tr>
          </thead>
          <tbody>${rowsHtml}</tbody>
        </table>
      </div>
      <div style="margin-top:12px;display:flex;justify-content:flex-end;">
        <button class="m07-btn-outline" id="m07ModalCloseBtn">关闭预览</button>
      </div>
    `;
    lastCtx.openModal(`上传报表数据预览 — ${rep.code} (${verLabel})`, body);
    const btn = document.getElementById('m07ModalCloseBtn');
    if (btn) btn.addEventListener('click', () => lastCtx.closeModal());
  }

  function openUploadReportModal() {
    if (!lastCtx) return;
    const activeSec = lastCtx.state.activeSectionId || 'sec2';
    const options = SECTIONS.map(s => `<option value="${s.id}" ${s.id === activeSec ? 'selected' : ''}>${s.name}（${s.yardName}）</option>`).join('');
    const body = `
      <div style="display:flex;flex-direction:column;gap:12px;font-size:12.5px;">
        <div>
          <label style="display:block;color:#9bc0e6;margin-bottom:5px;">选择填报工区</label>
          <select class="glass-select" id="m07UpSec" style="width:100%;height:34px;">${options}</select>
        </div>
        <div>
          <label style="display:block;color:#9bc0e6;margin-bottom:5px;">报表文件名称（固定模板 V1.0）</label>
          <input class="m07-input" id="m07UpFile" style="width:100%;padding-left:10px;" value="二工区备料报表_20261126_补报.xlsx"/>
        </div>
        <div style="padding:10px 12px;border-radius:7px;background:rgba(14,52,108,0.55);border:1px solid rgba(56,189,248,0.3);color:#b7dcff;">
          上传后将自动执行 12 列必填字段校验、数量单位（t）校验与「可用库存 ≤ 实物库存」逻辑校验，状态标记为<strong>待确认</strong>。
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
          <button class="m07-btn-outline" id="m07UpCancel">取消</button>
          <button class="m07-btn-primary" id="m07UpSubmit">执行校验并上传</button>
        </div>
      </div>
    `;
    lastCtx.openModal('上传备料报表（模板 V1.0）', body);
    const selEl = document.getElementById('m07UpSec');
    const fileEl = document.getElementById('m07UpFile');
    if (selEl && fileEl) {
      selEl.addEventListener('change', () => {
        const s = SECTION_BY_ID[selEl.value];
        if (s) fileEl.value = `${s.name}备料报表_20261126_新版.xlsx`;
      });
    }
    const cancelBtn = document.getElementById('m07UpCancel');
    if (cancelBtn) cancelBtn.addEventListener('click', () => lastCtx.closeModal());
    const submitBtn = document.getElementById('m07UpSubmit');
    if (submitBtn) {
      submitBtn.addEventListener('click', () => {
        const secId = selEl ? selEl.value : 'sec2';
        const sec = SECTION_BY_ID[secId];
        const rep = REPORTS.find(r => r.secId === secId);
        if (rep) {
          const curNum = parseFloat(rep.version.replace('V', '')) || 1.0;
          const nextVer = 'V' + (curNum + 0.1).toFixed(1);
          rep.version = nextVer;
          rep.status = '待确认';
          rep.uploadTime = '11-26 11:05';
          rep.uploadFull = '2026-11-26 11:05';
          rep.fileName = (fileEl && fileEl.value.trim()) || `${sec.name}备料报表_20261126.xlsx`;
          rep.history.unshift({
            version: nextVer,
            time: '11-26 11:05',
            record: '字段检查通过（新上传）',
            status: '待确认',
            uploader: '备料管理员A',
            rows: 5
          });
          uiState.report.selectedCode = rep.code;
        }
        lastCtx.closeModal();
        lastCtx.showToast(`已上传 ${sec.name} 备料报表并通过 12 项字段校验`);
        if (lastHost) renderPage(lastHost, 'report', lastCtx);
      });
    }
  }

  function openLabReportModal(batch) {
    if (!lastCtx) return;
    const sec = SECTION_BY_ID[batch.secId];
    const rows = batch.items.map(it => {
      const badge = it.pass === true
        ? '<span class="m07-tag ok">合格</span>'
        : (it.pass === false ? '<span class="m07-tag danger">不合格</span>' : '<span class="m07-tag warn">待定/检测中</span>');
      return `<tr><td>${esc(it.name)}</td><td>${esc(it.std)}</td><td>${esc(it.val)}</td><td>${badge}</td></tr>`;
    }).join('');
    const body = `
      <div class="m07-modal-grid">
        <div class="m07-modal-kv"><div class="k">检验报告编号</div><div class="v">${esc(batch.reportId)}</div></div>
        <div class="m07-modal-kv"><div class="k">关联进场批次</div><div class="v">${esc(batch.batchId)}</div></div>
        <div class="m07-modal-kv"><div class="k">材料及规格 / 数量</div><div class="v">${esc(batch.material)} · ${esc(batch.spec)} / ${batch.qty} t</div></div>
        <div class="m07-modal-kv"><div class="k">检验实验室 / 判定</div><div class="v">${esc(sec.labName)} · <span class="m07-tag ${statusTagClass(batch.status)}">${esc(batch.status)}</span></div></div>
      </div>
      <table class="data-table m07-table" style="margin-bottom:12px;">
        <thead><tr><th>检测项目</th><th>标准要求</th><th>实测结果</th><th>单项判定</th></tr></thead>
        <tbody>${rows}</tbody>
      </table>
      ${batch.quarantineNote ? `<div style="padding:9px 12px;border-radius:7px;background:rgba(239,68,68,0.16);border:1px solid rgba(248,113,113,0.45);color:#fecaca;font-size:12.5px;margin-bottom:12px;"><strong>隔离处置：</strong>${esc(batch.quarantineNote)}</div>` : ''}
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m07-btn-outline" id="m07LabClose">关闭</button>
        <button class="m07-btn-primary" id="m07LabJump">进入实验室模块</button>
      </div>
    `;
    lastCtx.openModal(`实验室检验报告 — ${batch.reportId}`, body);
    const cBtn = document.getElementById('m07LabClose');
    if (cBtn) cBtn.addEventListener('click', () => lastCtx.closeModal());
    const jBtn = document.getElementById('m07LabJump');
    if (jBtn) {
      jBtn.addEventListener('click', () => {
        lastCtx.closeModal();
        if (typeof lastCtx.switchModule === 'function') {
          lastCtx.switchModule('quality', 'lab');
        }
      });
    }
  }

  function openMediaModal(type, sec, batch) {
    if (!lastCtx) return;
    const isGate = type === 'gate';
    const isAerial = type === 'aerial';
    const title = isAerial
      ? `料场空间位置与分区示意 — ${sec.name} · ${sec.yardName}`
      : isGate
        ? `料场出入口录像回放 — ${sec.camId}（${sec.yardName} · 主入口）`
        : `无人机料场巡检成果 — ${sec.uavId}（${sec.waypoint}）`;
    const svg = isAerial
      ? svgYardAerial(sec)
      : isGate
        ? svgGateCamera(sec, batch ? batch.videoTime : '2026-11-26 08:16:20')
        : svgUavInspection(sec, batch ? batch.uavTime : '2026-11-26 09:27:18');
    const infoLine = isAerial
      ? `位置：${sec.name} · ${sec.stake} ｜ 主入口桩号：${sec.gateStake} ｜ 料仓结构：3 座全封闭蓝棚 + 2 处露天骨料堆区 + 拌合楼配料区`
      : isGate
        ? `点位编号：${sec.camId} ｜ 关联批次：${batch ? batch.batchId : '—'} ｜ 车牌识别：${batch ? batch.plateNo : '黑M·86219'} ｜ 过磅时刻：${batch ? batch.videoTime : '2026-11-26 08:16:20'}`
        : `架次编号：${sec.uavId} ｜ 航点：${sec.waypoint} ｜ 影像文件：${batch ? batch.uavFile : '料场全面巡检 · IMG_0018.jpg'} ｜ 回传状态：已归档`;
    const body = `
      <div style="border-radius:9px;overflow:hidden;border:1px solid rgba(56,220,255,0.45);margin-bottom:10px;">
        ${svg}
      </div>
      <div style="padding:9px 12px;border-radius:7px;background:rgba(12,40,88,0.68);border:1px solid rgba(56,189,248,0.26);font-size:12.5px;color:#cfe6ff;margin-bottom:12px;">
        ${esc(infoLine)}
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m07-btn-outline" id="m07MediaClose">关闭</button>
      </div>
    `;
    lastCtx.openModal(title, body);
    const btn = document.getElementById('m07MediaClose');
    if (btn) btn.addEventListener('click', () => lastCtx.closeModal());
  }

  /* ------------------------------------------------------------------------
     PAGE 1 RENDERER: 备料总览 (overview)
     ------------------------------------------------------------------------ */
  function renderOverview(ctx) {
    const st = uiState.overview;
    const activeSec = ctx.state.activeSectionId || '';
    const periodObj = getPeriodObj(st.period);
    const allPeriodItems = getScaledInventory(st.period);

    // Filter options for yard based on activeSec
    const yardOptions = activeSec
      ? [SECTION_BY_ID[activeSec].yardName]
      : SECTIONS.map(s => s.yardName);
    if (st.yardName && !yardOptions.includes(st.yardName)) {
      st.yardName = '';
    }

    const filtered = allPeriodItems.filter(it => {
      if (activeSec && it.secId !== activeSec) return false;
      if (st.yardName && it.yardName !== st.yardName) return false;
      if (st.material && it.material !== st.material) return false;
      return true;
    });

    // Aggregate KPIs
    const sumPlan = filtered.reduce((a, b) => a + b.plan, 0);
    const sumArr = filtered.reduce((a, b) => a + b.arrival, 0);
    const sumPhys = filtered.reduce((a, b) => a + b.physical, 0);
    const sumUsable = filtered.reduce((a, b) => a + b.usable, 0);
    const sumGap = filtered.reduce((a, b) => a + b.gap, 0);

    const bPass = filtered.reduce((a, b) => a + b.batches.pass, 0);
    const bPending = filtered.reduce((a, b) => a + b.batches.pending, 0);
    const bRecheck = filtered.reduce((a, b) => a + b.batches.recheck, 0);
    const bFail = filtered.reduce((a, b) => a + b.batches.fail, 0);
    const bTotal = bPass + bPending + bRecheck + bFail;

    // Gap breakdown by material (using section/yard filtered set so material donut stays informative)
    const secYardItems = allPeriodItems.filter(it => {
      if (activeSec && it.secId !== activeSec) return false;
      if (st.yardName && it.yardName !== st.yardName) return false;
      return true;
    });
    const gapTotalForDonut = secYardItems.reduce((a, b) => a + b.gap, 0) || 1;
    const matGapSegs = MATERIAL_TYPES.map(m => {
      const val = secYardItems.filter(it => it.material === m.name).reduce((a, b) => a + b.gap, 0);
      return { name: m.name, value: val, color: m.color, pct: ((val / gapTotalForDonut) * 100).toFixed(1) };
    });

    const batchSegs = [
      { name: '检验合格', value: bPass, color: '#22c55e', pct: bTotal ? ((bPass / bTotal) * 100).toFixed(1) : '0.0' },
      { name: '待检', value: bPending, color: '#facc15', pct: bTotal ? ((bPending / bTotal) * 100).toFixed(1) : '0.0' },
      { name: '复检中', value: bRecheck, color: '#38bdf8', pct: bTotal ? ((bRecheck / bTotal) * 100).toFixed(1) : '0.0' },
      { name: '不合格', value: bFail, color: '#f87171', pct: bTotal ? ((bFail / bTotal) * 100).toFixed(1) : '0.0' }
    ];

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / st.pageSize));
    if (st.page > totalPages) st.page = totalPages;
    const pageRows = filtered.slice((st.page - 1) * st.pageSize, st.page * st.pageSize);

    // Focus alerts
    const focusAlerts = [
      { id: 'fa1', secId: 'sec2', material: '碎石', title: '二工区 · 碎石缺口', sub: '料场示例A 缺口 3,250 t', btnText: '查缺口', kind: 'warn', action: 'yard' },
      { id: 'fa2', secId: 'sec4', material: '碎石', title: '四工区 · 碎石缺口', sub: '料场示例B 缺口 2,750 t', btnText: '查缺口', kind: 'warn', action: 'yard' },
      { id: 'fa3', secId: 'sec2', material: '钢筋', title: '二工区 · 钢筋隔离', sub: '料场示例A 隔离 40 t', btnText: '查检验', kind: 'danger', action: 'inspect', batchId: 'BM-JC-20261125-006' }
    ].filter(a => !activeSec || a.secId === activeSec);

    const kpis = [
      { label: '计划量', val: fmtNum(sumPlan), unit: 't', icon: ICONS.plan, cls: '' },
      { label: '累计进场量', val: fmtNum(sumArr), unit: 't', icon: ICONS.truck, cls: '' },
      { label: '实物库存', val: fmtNum(sumPhys), unit: 't', icon: ICONS.layers, cls: '' },
      { label: '可用库存', val: fmtNum(sumUsable), unit: 't', icon: ICONS.checkCircle, cls: 'green' },
      { label: '备料缺口', val: fmtNum(sumGap), unit: 't', icon: ICONS.alertTri, cls: 'gold' },
      { label: '待检批次', val: fmtNum(bPending), unit: '批', icon: ICONS.flask, cls: 'gold' }
    ];

    const pageBtns = [];
    for (let p = 1; p <= totalPages; p++) {
      if (totalPages <= 5 || p <= 3 || p === totalPages || p === st.page) {
        pageBtns.push(`<button class="m07-page-btn ${p === st.page ? 'active' : ''}" data-page="${p}">${p}</button>`);
      } else if (p === 4 && totalPages > 5) {
        pageBtns.push(`<span style="padding:0 3px;">...</span>`);
      }
    }

    return `
      <div class="m07-page">
        <!-- Top Filter Bar -->
        <div class="glass-panel m07-filter-panel">
          <div class="m07-filter-fields">
            <div class="m07-field">
              <span class="m07-field-label">所属工区</span>
              <select class="glass-select m07-select" id="m07OvrSec">
                <option value="">全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${activeSec === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">料场</span>
              <select class="glass-select m07-select" id="m07OvrYard">
                <option value="">全部料场</option>
                ${yardOptions.map(y => `<option value="${y}" ${st.yardName === y ? 'selected' : ''}>${y}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">材料类别</span>
              <select class="glass-select m07-select" id="m07OvrMat">
                <option value="">全部材料</option>
                ${MATERIAL_TYPES.map(m => `<option value="${m.name}" ${st.material === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">统计周期</span>
              <select class="glass-select m07-select" id="m07OvrPeriod">
                ${PERIODS.map(p => `<option value="${p.id}" ${st.period === p.id ? 'selected' : ''}>${p.id}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m07-filter-actions">
            <button class="m07-btn-primary" id="m07OvrQuery">${ICONS.search} 查询</button>
            <button class="m07-btn-outline" id="m07OvrReset">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- KPI Summary Row -->
        <div class="glass-panel">
          <div class="panel-header m07-panel-header">
            <div class="panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">备料汇总</span>
              <span class="m07-subnote">(${esc(st.period)})</span>
            </div>
          </div>
          <div class="m07-kpi-grid-6">
            ${kpis.map(k => `
              <div class="m07-kpi-card">
                <div class="m07-kpi-icon ${k.cls}">${k.icon}</div>
                <div>
                  <div class="m07-kpi-label">${k.label}</div>
                  <div class="m07-kpi-val ${k.cls}">${k.val}<span class="m07-kpi-unit">${k.unit}</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- 3 Charts Row -->
        <div class="m07-charts-row">
          <div class="glass-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">各工区计划量与进场量</span>
              </div>
              <div class="m07-chart-legend-inline">
                <span><i class="m07-dot" style="background:#4f8df9;"></i>计划量</span>
                <span><i class="m07-dot" style="background:#2adcf8;"></i>累计进场量 万t</span>
              </div>
            </div>
            <div class="m07-chart-body">
              ${buildSectionBarSvg(allPeriodItems, activeSec)}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">各类材料备料缺口</span>
              </div>
            </div>
            <div class="m07-donut-wrap">
              ${buildDonutSvg(matGapSegs, fmtNum(secYardItems.reduce((a, b) => a + b.gap, 0)), 't', '缺口合计')}
              <div class="m07-donut-legend">
                ${matGapSegs.map(s => `
                  <div class="m07-legend-row ${st.material === s.name ? 'active' : ''}" data-mat-pick="${s.name}">
                    <span class="m07-legend-name"><i class="m07-dot" style="background:${s.color};"></i>${s.name}</span>
                    <span class="m07-legend-num">${fmtNum(s.value)}</span>
                    <span class="m07-legend-pct">${s.pct}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">检验批次状态</span>
              </div>
            </div>
            <div class="m07-donut-wrap">
              ${buildDonutSvg(batchSegs, fmtNum(bTotal), '批', '本期检验批次')}
              <div class="m07-donut-legend">
                ${batchSegs.map(s => `
                  <div class="m07-legend-row" data-jump-inspect="1">
                    <span class="m07-legend-name"><i class="m07-dot" style="background:${s.color};"></i>${s.name}</span>
                    <span class="m07-legend-num">${s.value}</span>
                    <span class="m07-legend-pct">${s.pct}%</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>

        <!-- Bottom Split: Table + Focus Alerts -->
        <div class="m07-p1-bottom">
          <div class="glass-panel m07-table-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">备料明细</span>
              </div>
              <div class="m07-header-right">
                <span>单位 t</span>
                <span>统计截至 ${esc(periodObj.cutoff)}</span>
              </div>
            </div>
            <div class="m07-table-wrap">
              <table class="data-table m07-table">
                <thead>
                  <tr>
                    <th>所属工区</th>
                    <th>料场</th>
                    <th>材料</th>
                    <th>计划量</th>
                    <th>累计进场量</th>
                    <th>实物库存</th>
                    <th>可用库存</th>
                    <th>备料缺口</th>
                    <th>检验状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageRows.length ? pageRows.map(r => `
                    <tr class="${st.selectedInvId === r.id ? 'selected' : ''}" data-inv-select="${r.id}">
                      <td>${esc(r.secName)}</td>
                      <td>${esc(r.yardName)}</td>
                      <td>${esc(r.material)}</td>
                      <td>${fmtNum(r.plan)}</td>
                      <td>${fmtNum(r.arrival)}</td>
                      <td>${fmtNum(r.physical)}</td>
                      <td class="m07-num-green">${fmtNum(r.usable)}</td>
                      <td class="m07-num-gold">${fmtNum(r.gap)}</td>
                      <td><span class="m07-tag ${statusTagClass(r.status)}">${esc(r.status)}</span></td>
                      <td><button class="m07-link-btn" data-inv-detail="${r.id}">详情</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="10" style="text-align:center;color:#93b8de;padding:24px;">当前筛选条件下暂无备料明细记录</td></tr>`}
                </tbody>
              </table>
            </div>
            <div class="m07-pagination">
              <span>共 ${filtered.length} 条材料记录</span>
              <button class="m07-page-btn" data-page="${st.page - 1}" ${st.page <= 1 ? 'disabled' : ''}>${ICONS.chevLeft}</button>
              ${pageBtns.join('')}
              <button class="m07-page-btn" data-page="${st.page + 1}" ${st.page >= totalPages ? 'disabled' : ''}>${ICONS.chevRight}</button>
            </div>
          </div>

          <div class="glass-panel m07-table-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">重点关注</span>
              </div>
            </div>
            <div class="m07-focus-list">
              ${focusAlerts.length ? focusAlerts.map(a => `
                <div class="m07-focus-item">
                  <div class="m07-focus-left">
                    <div class="m07-focus-ico ${a.kind}">${a.kind === 'danger' ? ICONS.flask : (a.id === 'fa2' ? ICONS.layers : ICONS.alertTri)}</div>
                    <div>
                      <div class="m07-focus-title">${esc(a.title)}</div>
                      <div class="m07-focus-sub">${esc(a.sub)}</div>
                    </div>
                  </div>
                  <button class="m07-pill-action ${a.kind}" data-focus-action="${a.action}" data-focus-sec="${a.secId}" data-focus-mat="${a.material}" data-focus-batch="${a.batchId || ''}">${a.btnText}</button>
                </div>
              `).join('') : `<div style="padding:20px;text-align:center;color:#93b8de;font-size:12.5px;">该工区当前无重点缺口或隔离预警</div>`}
            </div>
            <div class="m07-panel-footer" style="padding-right:136px;">
              <span>同步于 ${esc(periodObj.sync)}</span>
              <button class="m07-link-btn" id="m07GoYardDetail">查看料场详情 ${ICONS.chevRight}</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 2 RENDERER: 报表管理 (report)
     ------------------------------------------------------------------------ */
  function renderReport(ctx) {
    const st = uiState.report;
    const activeSec = ctx.state.activeSectionId || '';
    const kw = st.keyword.trim().toLowerCase();

    const filtered = REPORTS.filter(r => {
      if (activeSec && r.secId !== activeSec) return false;
      if (st.status && r.status !== st.status) return false;
      if (kw && !r.code.toLowerCase().includes(kw) && !SECTION_BY_ID[r.secId].name.includes(kw)) return false;
      return true;
    });

    let selected = filtered.find(r => r.code === st.selectedCode) || filtered[0] || REPORTS[0];
    if (selected) st.selectedCode = selected.code;
    const selSec = SECTION_BY_ID[selected.secId];
    const isPending = selected.status === '待确认';

    return `
      <div class="m07-page">
        <!-- Top Filter Bar -->
        <div class="glass-panel m07-filter-panel">
          <div class="m07-filter-fields">
            <div class="m07-field">
              <span class="m07-field-label">所属工区</span>
              <select class="glass-select m07-select" id="m07RepSec">
                <option value="">全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${activeSec === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">统计日期</span>
              <select class="glass-select m07-select" id="m07RepDate">
                ${REPORT_DATES.map(d => `<option value="${d}" ${st.date === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">确认状态</span>
              <select class="glass-select m07-select" id="m07RepStatus">
                <option value="">全部状态</option>
                <option value="待确认" ${st.status === '待确认' ? 'selected' : ''}>待确认</option>
                <option value="已确认" ${st.status === '已确认' ? 'selected' : ''}>已确认</option>
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">关键词</span>
              <span class="m07-search-wrap">
                <span class="m07-search-ico">${ICONS.search}</span>
                <input class="m07-input" id="m07RepKw" value="${esc(st.keyword)}" placeholder="搜索报表编号"/>
              </span>
            </div>
          </div>
          <div class="m07-filter-actions">
            <button class="m07-btn-outline" id="m07RepQuery">${ICONS.search} 查询</button>
            <button class="m07-btn-outline" id="m07RepReset">${ICONS.reset} 重置</button>
            <button class="m07-btn-outline" id="m07RepDownload">${ICONS.download} 下载固定模板</button>
            <button class="m07-btn-primary" id="m07RepUpload">${ICONS.upload} 上传报表</button>
          </div>
        </div>

        <!-- Stepper Panel -->
        <div class="glass-panel">
          <div class="panel-header m07-panel-header">
            <div class="panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">报表填报流程</span>
            </div>
            <div class="m07-header-right">统计口径 ${esc(st.date)} 10:40</div>
          </div>
          <div class="m07-stepper">
            <div class="m07-step-card">
              <span class="m07-step-ico">${ICONS.stepBox}</span>
              <div>
                <div class="m07-step-title">下载固定模板</div>
                <div class="m07-step-sub">模板 V1.0</div>
              </div>
            </div>
            <span class="m07-step-arrow">${ICONS.chevRight}</span>
            <div class="m07-step-card">
              <span class="m07-step-ico">${ICONS.upload}</span>
              <div>
                <div class="m07-step-title">上传备料报表</div>
                <div class="m07-step-sub">${esc(selSec.name)} · ${esc(selected.version)}</div>
              </div>
            </div>
            <span class="m07-step-arrow">${ICONS.chevRight}</span>
            <div class="m07-step-card">
              <span class="m07-step-ico">${ICONS.plan}</span>
              <div>
                <div class="m07-step-title">字段检查</div>
                <div class="m07-step-sub">必填字段已通过</div>
              </div>
            </div>
            <span class="m07-step-arrow">${ICONS.chevRight}</span>
            <div class="m07-step-card ${isPending ? 'active-warn' : 'active-ok'}">
              <span class="m07-step-ico">${ICONS.checkCircle}</span>
              <div>
                <div class="m07-step-title">确认报表</div>
                <div class="m07-step-sub">${isPending ? '待确认' : '已确认生效'}</div>
              </div>
            </div>
          </div>
        </div>

        <!-- Main Split -->
        <div class="m07-p2-grid">
          <div class="m07-stack">
            <!-- Report List -->
            <div class="glass-panel m07-table-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">报表列表</span>
                </div>
                <div class="m07-header-right">${esc(st.date)}</div>
              </div>
              <div class="m07-table-wrap">
                <table class="data-table m07-table">
                  <thead>
                    <tr>
                      <th>报表编号</th>
                      <th>填报工区</th>
                      <th>报表版本</th>
                      <th>统计截至</th>
                      <th>上传时间</th>
                      <th>字段校验</th>
                      <th>确认状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filtered.length ? filtered.map(r => `
                      <tr class="${r.code === selected.code ? 'selected' : ''}" data-rep-select="${r.code}">
                        <td>${esc(r.code)}</td>
                        <td>${esc(SECTION_BY_ID[r.secId].name)}</td>
                        <td>${esc(r.version)}</td>
                        <td>${esc(r.cutoff)}</td>
                        <td>${esc(r.uploadTime)}</td>
                        <td><span class="m07-tag ok">${esc(r.fieldCheck)}</span></td>
                        <td><span class="m07-tag ${statusTagClass(r.status)}">${esc(r.status)}</span></td>
                        <td><button class="m07-link-btn" data-rep-view="${r.code}">查看</button></td>
                      </tr>
                    `).join('') : `<tr><td colspan="8" style="text-align:center;color:#93b8de;padding:20px;">未找到符合条件的报表</td></tr>`}
                  </tbody>
                </table>
              </div>
              <div class="m07-pagination">
                <span>本期显示 ${filtered.length} 份报表</span>
                <button class="m07-page-btn" disabled>${ICONS.chevLeft}</button>
                <button class="m07-page-btn active">1</button>
                <button class="m07-page-btn" disabled>${ICONS.chevRight}</button>
              </div>
            </div>

            <!-- Version History -->
            <div class="glass-panel m07-table-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">历史版本与确认记录</span>
                </div>
                <div class="m07-header-right">${esc(selected.code)} &nbsp; ${esc(selSec.name)}</div>
              </div>
              <div class="m07-table-wrap" style="padding-bottom:10px;">
                <table class="data-table m07-table">
                  <thead>
                    <tr>
                      <th>版本</th>
                      <th>记录时间</th>
                      <th>确认记录</th>
                      <th>版本状态</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${selected.history.map((h, i) => `
                      <tr class="${i === 0 ? 'selected' : ''}">
                        <td>${esc(h.version)}</td>
                        <td>${esc(h.time)}</td>
                        <td>${esc(h.record)}</td>
                        <td><span class="m07-tag ${statusTagClass(h.status)}">${esc(h.status)}</span></td>
                        <td><button class="m07-link-btn" data-ver-view="${esc(h.version)}">查看</button></td>
                      </tr>
                    `).join('')}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <!-- Right Verify & Confirm Panel -->
          <div class="glass-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">报表校验与确认</span>
              </div>
            </div>
            <div class="m07-verify-body">
              <div class="m07-file-hdr">
                <span class="m07-file-title">${ICONS.fileXls} ${esc(selected.fileName)}</span>
                <span class="m07-tag ${statusTagClass(selected.status)}">${esc(selected.version)} ${esc(selected.status)}</span>
              </div>

              <div class="m07-kv-list">
                <div class="m07-kv-row"><span class="m07-kv-k">报表编号</span><span class="m07-kv-v">${esc(selected.code)}</span></div>
                <div class="m07-kv-row"><span class="m07-kv-k">填报工区</span><span class="m07-kv-v">${esc(selSec.name)}</span></div>
                <div class="m07-kv-row"><span class="m07-kv-k">模板版本</span><span class="m07-kv-v">${esc(selected.templateVer)}</span></div>
                <div class="m07-kv-row"><span class="m07-kv-k">统计截至</span><span class="m07-kv-v">${esc(selected.cutoffFull)}</span></div>
                <div class="m07-kv-row"><span class="m07-kv-k">上传时间</span><span class="m07-kv-v">${esc(selected.uploadFull)}</span></div>
              </div>

              <div class="m07-check-box">
                <div class="m07-check-hdr">
                  <span>字段检查结果</span>
                  <span class="m07-tag ok">全部通过</span>
                </div>
                <div class="m07-check-row"><span class="m07-check-left">${ICONS.checkSm} 必填字段</span><span class="m07-check-right">12 / 12 列齐全</span></div>
                <div class="m07-check-row"><span class="m07-check-left">${ICONS.checkSm} 数量及单位</span><span class="m07-check-right">数量字段有效，单位为 t</span></div>
                <div class="m07-check-row"><span class="m07-check-left">${ICONS.checkSm} 库存口径</span><span class="m07-check-right">可用库存 ≤ 实物库存</span></div>
                <div class="m07-check-row"><span class="m07-check-left">${ICONS.checkSm} 统计时间</span><span class="m07-check-right">截止时间已填写</span></div>
              </div>

              <div class="m07-info-banner">
                ${ICONS.info}
                <span>${esc(selected.currentBoardNotice)}</span>
              </div>

              <div class="m07-btn-row-2">
                <button class="m07-btn-primary" id="m07ConfirmRepBtn" ${!isPending ? 'disabled style="opacity:0.65;cursor:default;"' : ''}>
                  ${ICONS.checkSm} ${isPending ? '确认报表' : '报表已确认'}
                </button>
                <button class="m07-btn-outline" id="m07PreviewRepFile">${ICONS.docList} 查看上传文件</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 3 RENDERER: 料场详情 (yard)
     ------------------------------------------------------------------------ */
  function renderYard(ctx) {
    const st = uiState.yard;
    const secId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
    const sec = SECTION_BY_ID[secId] || SECTIONS[1];
    st.yardName = sec.yardName;

    const periodObj = getPeriodObj(st.period);
    const allYardItems = getScaledInventory(st.period).filter(it => it.secId === sec.id);
    const filteredItems = allYardItems.filter(it => !st.material || it.material === st.material);

    const sumPlan = filteredItems.reduce((a, b) => a + b.plan, 0);
    const sumArr = filteredItems.reduce((a, b) => a + b.arrival, 0);
    const sumPhys = filteredItems.reduce((a, b) => a + b.physical, 0);
    const sumUsable = filteredItems.reduce((a, b) => a + b.usable, 0);
    const sumGap = filteredItems.reduce((a, b) => a + b.gap, 0);
    const catCount = filteredItems.length;

    const topGapItem = [...allYardItems].sort((a, b) => b.gap - a.gap)[0] || allYardItems[0];
    const rep = REPORTS.find(r => r.secId === sec.id);

    const kpis = [
      { label: '计划量', val: fmtNum(sumPlan), unit: 't', icon: ICONS.plan, cls: '' },
      { label: '累计进场量', val: fmtNum(sumArr), unit: 't', icon: ICONS.truck, cls: '' },
      { label: '实物库存', val: fmtNum(sumPhys), unit: 't', icon: ICONS.layers, cls: '' },
      { label: '可用库存', val: fmtNum(sumUsable), unit: 't', icon: ICONS.checkCircle, cls: 'green' },
      { label: '备料缺口', val: fmtNum(sumGap), unit: 't', icon: ICONS.alertTri, cls: 'gold' },
      { label: '材料类别', val: String(catCount), unit: '类', icon: ICONS.docList, cls: '' }
    ];

    return `
      <div class="m07-page">
        <!-- Top Filter Bar -->
        <div class="glass-panel m07-filter-panel">
          <div class="m07-filter-fields">
            <div class="m07-field">
              <span class="m07-field-label">所属工区</span>
              <select class="glass-select m07-select" id="m07YardSec">
                ${SECTIONS.map(s => `<option value="${s.id}" ${sec.id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">料场</span>
              <select class="glass-select m07-select" id="m07YardPick">
                ${SECTIONS.map(s => `<option value="${s.id}" ${sec.id === s.id ? 'selected' : ''}>${s.yardName}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">材料类别</span>
              <select class="glass-select m07-select" id="m07YardMat">
                <option value="">全部材料</option>
                ${MATERIAL_TYPES.map(m => `<option value="${m.name}" ${st.material === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">统计周期</span>
              <select class="glass-select m07-select" id="m07YardPeriod">
                ${PERIODS.map(p => `<option value="${p.id}" ${st.period === p.id ? 'selected' : ''}>${p.id}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m07-filter-actions">
            <button class="m07-btn-primary" id="m07YardQuery">${ICONS.search} 查询</button>
            <button class="m07-btn-outline" id="m07YardReset">${ICONS.reset} 重置</button>
            <button class="m07-btn-outline" id="m07YardGoInspect">${ICONS.extLink} 检验与现场关联</button>
          </div>
        </div>

        <!-- Yard KPI Summary -->
        <div class="glass-panel">
          <div class="panel-header m07-panel-header">
            <div class="panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">料场库存概况</span>
              <span class="m07-subnote">(${esc(st.period)})</span>
            </div>
          </div>
          <div class="m07-kpi-grid-6">
            ${kpis.map(k => `
              <div class="m07-kpi-card">
                <div class="m07-kpi-icon ${k.cls}">${k.icon}</div>
                <div>
                  <div class="m07-kpi-label">${k.label}</div>
                  <div class="m07-kpi-val ${k.cls}">${k.val}<span class="m07-kpi-unit">${k.unit}</span></div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Middle Split: Spatial & Gate Scenes + Yard Info -->
        <div class="m07-p3-mid">
          <div class="glass-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">料场位置与出入口</span>
              </div>
              <button class="m07-link-btn" id="m07YardLinkInspect">查看现场关联 ${ICONS.chevRight}</button>
            </div>
            <div class="m07-scene-grid">
              <div class="m07-scene-card">
                <div class="m07-scene-frame" data-open-media="aerial">
                  ${svgYardAerial(sec)}
                  <span class="m07-hud-tl">${ICONS.pin} ${esc(sec.yardName)}</span>
                  <span class="m07-hud-tr">位置示意</span>
                </div>
                <div class="m07-scene-cap">
                  <span>${esc(sec.name)} · ${esc(sec.stake)}</span>
                </div>
              </div>
              <div class="m07-scene-card">
                <div class="m07-scene-frame" data-open-media="gate">
                  ${svgGateCamera(sec, '')}
                  <span class="m07-hud-tl">${esc(sec.camId)}</span>
                  <span class="m07-hud-tr">${ICONS.cam} 主入口</span>
                </div>
                <div class="m07-scene-cap">
                  <span>主入口 ${esc(sec.gateStake)}</span>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-panel m07-table-panel">
            <div class="panel-header m07-panel-header">
              <div class="panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">料场信息</span>
              </div>
            </div>
            <div class="m07-yard-info-body">
              <div>
                <div class="m07-file-hdr" style="margin-bottom:12px;">
                  <span style="font-size:15px;font-weight:800;color:#ffffff;">${esc(sec.yardName)}</span>
                  <span class="m07-tag ok">报表已确认</span>
                </div>
                <div class="m07-kv-list">
                  <div class="m07-kv-row"><span class="m07-kv-k">服务工区</span><span class="m07-kv-v">${esc(sec.name)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">料场位置</span><span class="m07-kv-v">${esc(sec.stake)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">材料类别</span><span class="m07-kv-v">碎石、机制砂、水泥、矿粉、钢筋</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">统计截至</span><span class="m07-kv-v">${esc(periodObj.cutoff)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">数据版本</span><span class="m07-kv-v">${esc(sec.reportCode)} · ${esc(rep ? (rep.status === '已确认' ? rep.version : sec.activeVer) : sec.activeVer)}</span></div>
                </div>
              </div>
              <div class="m07-yard-gap-box">
                <span>${esc(topGapItem.material)}备料缺口 &nbsp;<strong class="m07-num-gold">${fmtNum(topGapItem.gap)} t</strong></span>
                <button class="m07-link-btn" id="m07ScrollMatTable">查看材料分项 ${ICONS.chevRight}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Material Breakdown Table -->
        <div class="glass-panel m07-table-panel" id="m07YardMatTablePanel">
          <div class="panel-header m07-panel-header">
            <div class="panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">材料分项与库存</span>
            </div>
            <div class="m07-header-right">单位 t</div>
          </div>
          <div class="m07-table-wrap">
            <table class="data-table m07-table">
              <thead>
                <tr>
                  <th>材料类别</th>
                  <th>规格</th>
                  <th>计划量</th>
                  <th>累计进场量</th>
                  <th>实物库存</th>
                  <th>待检及隔离量</th>
                  <th>可用库存</th>
                  <th>备料缺口</th>
                  <th>检验状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${filteredItems.map((r, idx) => `
                  <tr class="${(st.selectedMaterial ? st.selectedMaterial === r.material : idx === 0) ? 'selected' : ''}" data-yard-mat-row="${r.material}">
                    <td>${esc(r.material)}</td>
                    <td>${esc(r.spec)}</td>
                    <td>${fmtNum(r.plan)}</td>
                    <td>${fmtNum(r.arrival)}</td>
                    <td>${fmtNum(r.physical)}</td>
                    <td>${fmtNum(r.quarantine)}</td>
                    <td class="m07-num-green">${fmtNum(r.usable)}</td>
                    <td class="m07-num-gold">${fmtNum(r.gap)}</td>
                    <td><span class="m07-tag ${statusTagClass(r.status)}">${esc(r.status)}</span></td>
                    <td><button class="m07-link-btn" data-yard-batches="${r.material}">查看批次</button></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="m07-panel-footer">
            <span>可用库存 = 实物库存 - 待检及隔离量</span>
            <span>备料缺口 = 计划量 - 累计进场量</span>
            <span>统计截至 ${esc(periodObj.cutoff)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 4 RENDERER: 检验与现场关联 (inspect)
     ------------------------------------------------------------------------ */
  function renderInspect(ctx) {
    const st = uiState.inspect;
    const secId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
    const sec = SECTION_BY_ID[secId] || SECTIONS[1];
    st.yardName = sec.yardName;

    const q = st.batchQuery.trim().toLowerCase();
    const secBatches = BATCHES.filter(b => b.secId === sec.id);
    const filtered = secBatches.filter(b => {
      if (st.material && b.material !== st.material) return false;
      if (q && !b.batchId.toLowerCase().includes(q) && !b.material.includes(q)) return false;
      return true;
    });

    let selected = filtered.find(b => b.batchId === st.selectedBatchId) || filtered[0] || secBatches[0];
    if (selected) st.selectedBatchId = selected.batchId;

    return `
      <div class="m07-page">
        <!-- Top Filter Bar -->
        <div class="glass-panel m07-filter-panel">
          <div class="m07-filter-fields">
            <div class="m07-field">
              <span class="m07-field-label">所属工区</span>
              <select class="glass-select m07-select" id="m07InspSec">
                ${SECTIONS.map(s => `<option value="${s.id}" ${sec.id === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">料场</span>
              <select class="glass-select m07-select" id="m07InspYard">
                ${SECTIONS.map(s => `<option value="${s.id}" ${sec.id === s.id ? 'selected' : ''}>${s.yardName}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">材料类别</span>
              <select class="glass-select m07-select" id="m07InspMat">
                <option value="">全部材料</option>
                ${MATERIAL_TYPES.map(m => `<option value="${m.name}" ${st.material === m.name ? 'selected' : ''}>${m.name}</option>`).join('')}
              </select>
            </div>
            <div class="m07-field">
              <span class="m07-field-label">进场批次</span>
              <span class="m07-search-wrap">
                <span class="m07-search-ico">${ICONS.search}</span>
                <input class="m07-input" id="m07InspKw" value="${esc(st.batchQuery)}" placeholder="BM-JC-20261126-007"/>
              </span>
            </div>
          </div>
          <div class="m07-filter-actions">
            <button class="m07-btn-primary" id="m07InspQuery">${ICONS.search} 查询</button>
            <button class="m07-btn-outline" id="m07InspReset">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- Main Split -->
        <div class="m07-p4-grid">
          <!-- Left Column: Batch List + Lab Result -->
          <div class="m07-stack">
            <div class="glass-panel m07-table-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">关联进场批次</span>
                </div>
                <div class="m07-header-right">${esc(sec.yardName)}</div>
              </div>
              <div class="m07-table-wrap">
                <table class="data-table m07-table">
                  <thead>
                    <tr>
                      <th>进场批次</th>
                      <th>材料</th>
                      <th>进场时间</th>
                      <th>检验状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${filtered.length ? filtered.map(b => `
                      <tr class="${b.batchId === selected.batchId ? 'selected' : ''}" data-batch-select="${b.batchId}">
                        <td>${esc(b.batchId)}</td>
                        <td>${esc(b.material)}</td>
                        <td>${esc(b.entryTime)}</td>
                        <td><span class="m07-tag ${statusTagClass(b.status)}">${esc(b.status)}</span></td>
                      </tr>
                    `).join('') : `<tr><td colspan="4" style="text-align:center;color:#93b8de;padding:20px;">未匹配到进场批次</td></tr>`}
                  </tbody>
                </table>
              </div>
              <div class="m07-panel-footer">
                <span>显示 ${filtered.length} 条批次记录</span>
                <button class="m07-link-btn" id="m07OpenEntryLedger">查看进场明细 ${ICONS.chevRight}</button>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">检验结果</span>
                </div>
              </div>
              <div class="m07-verify-body">
                <div class="m07-file-hdr">
                  <span style="font-size:15px;font-weight:800;color:#ffffff;font-variant-numeric:tabular-nums;">${esc(selected.reportId)}</span>
                  <span class="m07-tag ${statusTagClass(selected.status)}">${esc(selected.status)}</span>
                </div>
                <div class="m07-kv-list">
                  <div class="m07-kv-row"><span class="m07-kv-k">进场批次</span><span class="m07-kv-v">${esc(selected.batchId)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">材料与规格</span><span class="m07-kv-v">${esc(selected.material)} · ${esc(selected.spec)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">进场量</span><span class="m07-kv-v">${selected.qty} t</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">检验时间</span><span class="m07-kv-v">${esc(selected.inspectTime)}</span></div>
                  <div class="m07-kv-row"><span class="m07-kv-k">检验来源</span><span class="m07-kv-v">${esc(sec.labName)}</span></div>
                </div>
                <div>
                  <div style="font-size:12px;color:#8cb2db;margin-bottom:4px;">检验项目</div>
                  <div class="m07-test-chips">
                    ${selected.items.map(it => {
                      const cls = it.pass === true ? '' : (it.pass === false ? 'fail' : 'pending');
                      return `<span class="m07-test-chip ${cls}">${ICONS.checkSm} ${esc(it.name)}</span>`;
                    }).join('')}
                  </div>
                </div>
                <div class="m07-btn-row-2">
                  <button class="m07-btn-primary" id="m07ViewLabReport">${ICONS.docList} 查看检验报告</button>
                  <button class="m07-btn-outline" id="m07EnterLabBtn">${ICONS.extLink} 进入实验室</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Site Imagery + Batch Linked Records -->
          <div class="m07-stack">
            <div class="glass-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">现场影像</span>
                </div>
                <div class="m07-header-right">2 路来源</div>
              </div>
              <div class="m07-scene-grid">
                <div class="m07-scene-card">
                  <div class="m07-media-card-hdr">
                    <span>料场出入口录像</span>
                    <span class="m07-tag info">原视频系统</span>
                  </div>
                  <div class="m07-scene-frame m07-media-frame" data-open-media="gate">
                    ${svgGateCamera(sec, selected.videoTime)}
                    <span class="m07-hud-tl">${esc(sec.camId)}</span>
                    <span class="m07-hud-tr">${ICONS.cam} 入口录像</span>
                  </div>
                  <div class="m07-scene-cap">
                    <span>${esc(sec.yardName)} · 主入口</span>
                    <button class="m07-link-btn" data-open-media="gate">查看录像 ${ICONS.play}</button>
                  </div>
                </div>

                <div class="m07-scene-card">
                  <div class="m07-media-card-hdr">
                    <span>无人机巡检成果</span>
                    <span class="m07-tag ok">已回传</span>
                  </div>
                  <div class="m07-scene-frame m07-media-frame" data-open-media="uav">
                    ${svgUavInspection(sec, selected.uavTime)}
                    <span class="m07-hud-tl">${esc(sec.uavId)}</span>
                    <span class="m07-hud-tr">${ICONS.drone} ${esc(sec.waypoint)}</span>
                  </div>
                  <div class="m07-scene-cap">
                    <span>${esc(selected.uavFile)}</span>
                    <button class="m07-link-btn" data-open-media="uav">查看巡检成果 ${ICONS.extLink}</button>
                  </div>
                </div>
              </div>
              <div class="m07-panel-footer">
                <span>工程位置 &nbsp;<strong style="color:#e6f2ff;">${esc(sec.name)} · ${esc(sec.yardName)}</strong></span>
                <span>录像按进场时刻定位，巡检影像按料场关联</span>
              </div>
            </div>

            <div class="glass-panel m07-table-panel">
              <div class="panel-header m07-panel-header">
                <div class="panel-title-wrap">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">批次关联记录</span>
                </div>
                <div class="m07-header-right">${esc(selected.batchId)}</div>
              </div>
              <div class="m07-table-wrap" style="padding-bottom:10px;">
                <table class="data-table m07-table">
                  <thead>
                    <tr>
                      <th>来源</th>
                      <th>关联编号</th>
                      <th>记录时间</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>实验室报告</td>
                      <td>${esc(selected.reportId)}</td>
                      <td>${esc(selected.inspectTimeShort)}</td>
                      <td><button class="m07-link-btn" id="m07RelLabBtn">查看报告</button></td>
                    </tr>
                    <tr>
                      <td>入口视频</td>
                      <td>${esc(sec.camId)}</td>
                      <td>${esc(selected.videoTimeShort)}</td>
                      <td><button class="m07-link-btn" data-open-media="gate">回看录像</button></td>
                    </tr>
                    <tr>
                      <td>无人机巡检</td>
                      <td>${esc(sec.uavId)}</td>
                      <td>${esc(selected.uavTimeShort)}</td>
                      <td><button class="m07-link-btn" data-open-media="uav">查看成果</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MAIN RENDER & EVENT BINDING
     ------------------------------------------------------------------------ */
  function renderPage(hostEl, subPageId, ctx) {
    ensureStyles();
    lastCtx = ctx;
    lastHost = hostEl;
    lastSubPageId = subPageId || 'overview';

    if (lastSubPageId === 'report') {
      hostEl.innerHTML = renderReport(ctx);
      bindReportEvents(hostEl, ctx);
    } else if (lastSubPageId === 'yard') {
      hostEl.innerHTML = renderYard(ctx);
      bindYardEvents(hostEl, ctx);
    } else if (lastSubPageId === 'inspect') {
      hostEl.innerHTML = renderInspect(ctx);
      bindInspectEvents(hostEl, ctx);
    } else {
      hostEl.innerHTML = renderOverview(ctx);
      bindOverviewEvents(hostEl, ctx);
    }
  }

  function bindOverviewEvents(hostEl, ctx) {
    const st = uiState.overview;
    const secSel = hostEl.querySelector('#m07OvrSec');
    const yardSel = hostEl.querySelector('#m07OvrYard');
    const matSel = hostEl.querySelector('#m07OvrMat');
    const perSel = hostEl.querySelector('#m07OvrPeriod');

    const applyFilters = () => {
      const nextSec = secSel ? secSel.value : '';
      st.yardName = yardSel ? yardSel.value : '';
      st.material = matSel ? matSel.value : '';
      st.period = perSel ? perSel.value : '2026年11月';
      st.page = 1;
      syncSectionToHost(nextSec);
      renderPage(hostEl, 'overview', ctx);
    };

    if (secSel) secSel.addEventListener('change', applyFilters);
    if (yardSel) yardSel.addEventListener('change', applyFilters);
    if (matSel) matSel.addEventListener('change', applyFilters);
    if (perSel) perSel.addEventListener('change', applyFilters);

    const qBtn = hostEl.querySelector('#m07OvrQuery');
    if (qBtn) qBtn.addEventListener('click', () => { applyFilters(); ctx.showToast('已更新备料总览筛选统计'); });

    const rBtn = hostEl.querySelector('#m07OvrReset');
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        st.yardName = '';
        st.material = '';
        st.period = '2026年11月';
        st.page = 1;
        syncSectionToHost('');
        renderPage(hostEl, 'overview', ctx);
        ctx.showToast('已重置全部筛选条件');
      });
    }

    // Bar chart section click
    hostEl.querySelectorAll('[data-chart-sec]').forEach(g => {
      g.addEventListener('click', () => {
        const pick = g.dataset.chartSec;
        const next = ctx.state.activeSectionId === pick ? '' : pick;
        st.yardName = '';
        st.page = 1;
        syncSectionToHost(next);
        renderPage(hostEl, 'overview', ctx);
      });
    });

    // Material donut legend click
    hostEl.querySelectorAll('[data-mat-pick]').forEach(row => {
      row.addEventListener('click', () => {
        const m = row.dataset.matPick;
        st.material = st.material === m ? '' : m;
        st.page = 1;
        renderPage(hostEl, 'overview', ctx);
      });
    });

    // Batch donut legend click -> jump to inspect
    hostEl.querySelectorAll('[data-jump-inspect]').forEach(row => {
      row.addEventListener('click', () => switchSubPage('inspect'));
    });

    // Pagination
    hostEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Number(btn.dataset.page);
        if (Number.isFinite(p) && p >= 1) {
          st.page = p;
          renderPage(hostEl, 'overview', ctx);
        }
      });
    });

    // Table row selection & detail modal
    const periodItems = getScaledInventory(st.period);
    hostEl.querySelectorAll('[data-inv-select]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('[data-inv-detail]')) return;
        st.selectedInvId = tr.dataset.invSelect;
        renderPage(hostEl, 'overview', ctx);
      });
    });
    hostEl.querySelectorAll('[data-inv-detail]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const item = periodItems.find(it => it.id === btn.dataset.invDetail);
        if (item) {
          st.selectedInvId = item.id;
          openInventoryModal(item, st.period);
        }
      });
    });

    // Focus alerts jump
    hostEl.querySelectorAll('[data-focus-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const action = btn.dataset.focusAction;
        const secId = btn.dataset.focusSec;
        const mat = btn.dataset.focusMat;
        const batchId = btn.dataset.focusBatch;
        if (action === 'inspect') {
          uiState.inspect.fallbackSecId = secId;
          uiState.inspect.material = '';
          if (batchId) uiState.inspect.selectedBatchId = batchId;
          syncSectionToHost(secId);
          switchSubPage('inspect');
        } else {
          uiState.yard.fallbackSecId = secId;
          uiState.yard.material = '';
          uiState.yard.selectedMaterial = mat;
          syncSectionToHost(secId);
          switchSubPage('yard');
        }
      });
    });

    const goYardBtn = hostEl.querySelector('#m07GoYardDetail');
    if (goYardBtn) goYardBtn.addEventListener('click', () => switchSubPage('yard'));
  }

  function bindReportEvents(hostEl, ctx) {
    const st = uiState.report;
    const secSel = hostEl.querySelector('#m07RepSec');
    const dateSel = hostEl.querySelector('#m07RepDate');
    const statusSel = hostEl.querySelector('#m07RepStatus');
    const kwInput = hostEl.querySelector('#m07RepKw');

    const apply = () => {
      const nextSec = secSel ? secSel.value : '';
      st.date = dateSel ? dateSel.value : '2026-11-26';
      st.status = statusSel ? statusSel.value : '';
      st.keyword = kwInput ? kwInput.value : '';
      syncSectionToHost(nextSec);
      renderPage(hostEl, 'report', ctx);
    };

    if (secSel) secSel.addEventListener('change', apply);
    if (dateSel) dateSel.addEventListener('change', apply);
    if (statusSel) statusSel.addEventListener('change', apply);
    if (kwInput) {
      kwInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') apply();
      });
    }

    const qBtn = hostEl.querySelector('#m07RepQuery');
    if (qBtn) qBtn.addEventListener('click', () => { apply(); ctx.showToast('已刷新报表列表'); });

    const rBtn = hostEl.querySelector('#m07RepReset');
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        st.date = '2026-11-26';
        st.status = '';
        st.keyword = '';
        syncSectionToHost('');
        renderPage(hostEl, 'report', ctx);
        ctx.showToast('已重置报表筛选条件');
      });
    }

    const dlBtn = hostEl.querySelector('#m07RepDownload');
    if (dlBtn) {
      dlBtn.addEventListener('click', () => {
        ctx.showToast('已下载《全周期备料管理固定模板_V1.0.xlsx》（含 12 列标准校验字段）');
      });
    }

    const upBtn = hostEl.querySelector('#m07RepUpload');
    if (upBtn) upBtn.addEventListener('click', openUploadReportModal);

    // Select report row
    hostEl.querySelectorAll('[data-rep-select]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('[data-rep-view]')) return;
        st.selectedCode = tr.dataset.repSelect;
        renderPage(hostEl, 'report', ctx);
      });
    });

    hostEl.querySelectorAll('[data-rep-view]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const rep = REPORTS.find(r => r.code === btn.dataset.repView);
        if (rep) openReportFileModal(rep);
      });
    });

    hostEl.querySelectorAll('[data-ver-view]').forEach(btn => {
      btn.addEventListener('click', () => {
        const rep = REPORTS.find(r => r.code === st.selectedCode) || REPORTS[0];
        openReportFileModal(rep, btn.dataset.verView);
      });
    });

    const confirmBtn = hostEl.querySelector('#m07ConfirmRepBtn');
    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        const rep = REPORTS.find(r => r.code === st.selectedCode);
        if (!rep || rep.status !== '待确认') return;
        const sec = SECTION_BY_ID[rep.secId];
        rep.status = '已确认';
        rep.currentBoardNotice = `${sec.name}看板已切换使用 ${rep.version}，确认时间 2026-11-26 11:02。`;
        rep.history.forEach(h => {
          if (h.status === '当前使用') h.status = '历史版本';
          if (h.version === rep.version) {
            h.status = '当前使用';
            h.record = '备料管理员A确认';
          }
        });
        ctx.showToast(`${rep.code}（${rep.version}）已确认生效并同步至${sec.name}看板`);
        renderPage(hostEl, 'report', ctx);
      });
    }

    const previewBtn = hostEl.querySelector('#m07PreviewRepFile');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => {
        const rep = REPORTS.find(r => r.code === st.selectedCode) || REPORTS[0];
        openReportFileModal(rep);
      });
    }
  }

  function bindYardEvents(hostEl, ctx) {
    const st = uiState.yard;
    const secSel = hostEl.querySelector('#m07YardSec');
    const yardSel = hostEl.querySelector('#m07YardPick');
    const matSel = hostEl.querySelector('#m07YardMat');
    const perSel = hostEl.querySelector('#m07YardPeriod');

    const applySec = nextSecId => {
      st.fallbackSecId = nextSecId;
      st.selectedMaterial = '';
      syncSectionToHost(nextSecId);
      renderPage(hostEl, 'yard', ctx);
    };

    if (secSel) secSel.addEventListener('change', () => applySec(secSel.value));
    if (yardSel) yardSel.addEventListener('change', () => applySec(yardSel.value));
    if (matSel) {
      matSel.addEventListener('change', () => {
        st.material = matSel.value;
        renderPage(hostEl, 'yard', ctx);
      });
    }
    if (perSel) {
      perSel.addEventListener('change', () => {
        st.period = perSel.value;
        renderPage(hostEl, 'yard', ctx);
      });
    }

    const qBtn = hostEl.querySelector('#m07YardQuery');
    if (qBtn) qBtn.addEventListener('click', () => ctx.showToast('已更新当前料场库存明细'));

    const rBtn = hostEl.querySelector('#m07YardReset');
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        st.fallbackSecId = 'sec2';
        st.material = '';
        st.period = '2026年11月';
        st.selectedMaterial = '';
        syncSectionToHost('');
        renderPage(hostEl, 'yard', ctx);
        ctx.showToast('已重置料场筛选条件');
      });
    }

    const goInspect = () => {
      const secId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
      uiState.inspect.fallbackSecId = secId;
      uiState.inspect.material = st.material;
      switchSubPage('inspect');
    };
    const topGo = hostEl.querySelector('#m07YardGoInspect');
    const midGo = hostEl.querySelector('#m07YardLinkInspect');
    if (topGo) topGo.addEventListener('click', goInspect);
    if (midGo) midGo.addEventListener('click', goInspect);

    const scrollBtn = hostEl.querySelector('#m07ScrollMatTable');
    if (scrollBtn) {
      scrollBtn.addEventListener('click', () => {
        const panel = hostEl.querySelector('#m07YardMatTablePanel');
        if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      });
    }

    const secId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
    const sec = SECTION_BY_ID[secId] || SECTIONS[1];
    hostEl.querySelectorAll('[data-open-media]').forEach(el => {
      el.addEventListener('click', () => {
        const batch = BATCHES.find(b => b.secId === sec.id);
        openMediaModal(el.dataset.openMedia, sec, batch);
      });
    });

    hostEl.querySelectorAll('[data-yard-mat-row]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('[data-yard-batches]')) return;
        st.selectedMaterial = tr.dataset.yardMatRow;
        renderPage(hostEl, 'yard', ctx);
      });
    });

    hostEl.querySelectorAll('[data-yard-batches]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const mat = btn.dataset.yardBatches;
        uiState.inspect.fallbackSecId = sec.id;
        uiState.inspect.material = mat;
        const matchB = BATCHES.find(b => b.secId === sec.id && b.material === mat);
        if (matchB) uiState.inspect.selectedBatchId = matchB.batchId;
        switchSubPage('inspect');
      });
    });
  }

  function bindInspectEvents(hostEl, ctx) {
    const st = uiState.inspect;
    const secSel = hostEl.querySelector('#m07InspSec');
    const yardSel = hostEl.querySelector('#m07InspYard');
    const matSel = hostEl.querySelector('#m07InspMat');
    const kwInput = hostEl.querySelector('#m07InspKw');

    const applySec = nextSecId => {
      st.fallbackSecId = nextSecId;
      st.batchQuery = '';
      const firstB = BATCHES.find(b => b.secId === nextSecId);
      if (firstB) st.selectedBatchId = firstB.batchId;
      syncSectionToHost(nextSecId);
      renderPage(hostEl, 'inspect', ctx);
    };

    if (secSel) secSel.addEventListener('change', () => applySec(secSel.value));
    if (yardSel) yardSel.addEventListener('change', () => applySec(yardSel.value));
    if (matSel) {
      matSel.addEventListener('change', () => {
        st.material = matSel.value;
        renderPage(hostEl, 'inspect', ctx);
      });
    }
    if (kwInput) {
      kwInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          st.batchQuery = kwInput.value;
          renderPage(hostEl, 'inspect', ctx);
        }
      });
    }

    const qBtn = hostEl.querySelector('#m07InspQuery');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        st.batchQuery = kwInput ? kwInput.value : '';
        renderPage(hostEl, 'inspect', ctx);
        ctx.showToast('已更新进场批次与现场影像关联');
      });
    }

    const rBtn = hostEl.querySelector('#m07InspReset');
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        st.fallbackSecId = 'sec2';
        st.material = '';
        st.batchQuery = '';
        st.selectedBatchId = 'BM-JC-20261126-007';
        syncSectionToHost('');
        renderPage(hostEl, 'inspect', ctx);
        ctx.showToast('已重置批次关联筛选');
      });
    }

    hostEl.querySelectorAll('[data-batch-select]').forEach(tr => {
      tr.addEventListener('click', () => {
        st.selectedBatchId = tr.dataset.batchSelect;
        renderPage(hostEl, 'inspect', ctx);
      });
    });

    const secId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
    const sec = SECTION_BY_ID[secId] || SECTIONS[1];
    const selectedBatch = BATCHES.find(b => b.batchId === st.selectedBatchId) || BATCHES.find(b => b.secId === sec.id);

    const labBtn = hostEl.querySelector('#m07ViewLabReport');
    const relLabBtn = hostEl.querySelector('#m07RelLabBtn');
    if (labBtn && selectedBatch) labBtn.addEventListener('click', () => openLabReportModal(selectedBatch));
    if (relLabBtn && selectedBatch) relLabBtn.addEventListener('click', () => openLabReportModal(selectedBatch));

    const enterLabBtn = hostEl.querySelector('#m07EnterLabBtn');
    if (enterLabBtn) {
      enterLabBtn.addEventListener('click', () => {
        if (typeof ctx.switchModule === 'function') {
          ctx.switchModule('quality', 'lab');
        } else {
          ctx.showToast('正在进入实验室管理模块');
        }
      });
    }

    hostEl.querySelectorAll('[data-open-media]').forEach(el => {
      el.addEventListener('click', () => {
        openMediaModal(el.dataset.openMedia, sec, selectedBatch);
      });
    });

    const ledgerBtn = hostEl.querySelector('#m07OpenEntryLedger');
    if (ledgerBtn) {
      ledgerBtn.addEventListener('click', () => {
        const list = BATCHES.filter(b => b.secId === sec.id);
        const rowsHtml = list.map(b => `
          <tr>
            <td>${esc(b.batchId)}</td>
            <td>${esc(b.material)}（${esc(b.spec)}）</td>
            <td>${b.qty} t</td>
            <td>${esc(b.entryTime)}</td>
            <td>${esc(b.supplier)}</td>
            <td>${esc(b.plateNo)}</td>
            <td><span class="m07-tag ${statusTagClass(b.status)}">${esc(b.status)}</span></td>
          </tr>
        `).join('');
        ctx.openModal(`进场批次明细台账 — ${sec.name} · ${sec.yardName}`, `
          <div style="overflow-x:auto;">
            <table class="data-table m07-table">
              <thead><tr><th>进场批次</th><th>材料规格</th><th>进场量</th><th>进场时间</th><th>供应单位</th><th>运料车辆</th><th>检验状态</th></tr></thead>
              <tbody>${rowsHtml}</tbody>
            </table>
          </div>
          <div style="margin-top:12px;display:flex;justify-content:flex-end;">
            <button class="m07-btn-outline" id="m07LedgerClose">关闭</button>
          </div>
        `);
        const cb = document.getElementById('m07LedgerClose');
        if (cb) cb.addEventListener('click', () => ctx.closeModal());
      });
    }
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'material',
    name: '全周期备料管理',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange(secId, subPageId) {
      uiState.overview.page = 1;
      uiState.overview.yardName = '';
      if (secId) {
        uiState.yard.fallbackSecId = secId;
        uiState.inspect.fallbackSecId = secId;
        const firstB = BATCHES.find(b => b.secId === secId);
        if (firstB) uiState.inspect.selectedBatchId = firstB.batchId;
      }
      if (lastCtx && lastCtx.cesium && lastCtx.cesium.ready && typeof lastCtx.cesium.applyLayers === 'function') {
        try {
          lastCtx.cesium.applyLayers({ activeSectionId: secId || null });
        } catch (e) {
          // Silent background Cesium sync
        }
      }
      if (lastHost && lastCtx) {
        renderPage(lastHost, subPageId || lastSubPageId, lastCtx);
      }
    },

    onLeave() {
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
    }
  });
})();
