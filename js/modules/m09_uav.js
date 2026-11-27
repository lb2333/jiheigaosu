/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 9：无人机巡检 (js/modules/m09_uav.js)
   包含 6 个子页面：
     01 巡检总览 (overview - interactive Cesium)
     02 巡检任务 (tasks    - opaque)
     03 航线规划 (routes   - interactive Cesium)
     04 实时巡检 (live     - opaque + Canvas aerial viewport & mini-map)
     05 隐患识别 (hazards  - opaque + AI/Raw canvas comparison & review)
     06 巡检报告 (reports  - opaque + A4 preview & before/after comparison)
   ========================================================================== */

(function () {
  'use strict';

  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';

  const SUB_PAGES = [
    { id: 'overview', name: '巡检总览' },
    { id: 'tasks', name: '巡检任务' },
    { id: 'routes', name: '航线规划' },
    { id: 'live', name: '实时巡检' },
    { id: 'hazards', name: '隐患识别' },
    { id: 'reports', name: '巡检报告' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
    { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
    { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
    { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
    { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
    { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' }
  ];

  const SEC_NAME_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s.name]));

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Module 9 scoped, zero external dependency)
     ------------------------------------------------------------------------ */
  const SVG = {
    drone: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 12m-2.2 0a2.2 2.2 0 1 0 4.4 0a2.2 2.2 0 1 0 -4.4 0"/><path d="M5 5l4.2 4.2M19 5l-4.2 4.2M5 19l4.2-4.2M19 19l-4.2-4.2"/><circle cx="5" cy="5" r="2.6"/><circle cx="19" cy="5" r="2.6"/><circle cx="5" cy="19" r="2.6"/><circle cx="19" cy="19" r="2.6"/></svg>`,
    hangar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="16" rx="2.5"/><path d="M8.5 8v8M15.5 8v8M8.5 12h7"/></svg>`,
    signal: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 18v-3M9 18v-6M14 18v-9M19 18V6"/></svg>`,
    pin: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s-6-5.4-6-10.2a6 6 0 1 1 12 0C18 15.6 12 21 12 21z"/><circle cx="12" cy="10.8" r="2.1"/></svg>`,
    route: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="6" r="2.5"/><path d="M8 16.5C12 14 11 10 16 7.5"/></svg>`,
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.8-3.8"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>`,
    calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="17" rx="2"/><path d="M8 2v4M16 2v4M3 10h18"/></svg>`,
    check: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="12" cy="12" r="9"/><path d="m8.5 12.2 2.5 2.5 4.8-5"/></svg>`,
    doc: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
    shield: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>`,
    lock: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>`,
    camera: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    video: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>`,
    flag: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4a1 1 0 0 1 1-1h13l-2.5 5L18 13H4"/></svg>`,
    target: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="2.2"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>`,
    fullscreen: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    layers: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    download: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>`,
    image: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>`,
    play: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    home: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 10.5 12 3l9 7.5V20a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/></svg>`,
    move: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="5 9 2 12 5 15"/><polyline points="9 5 12 2 15 5"/><polyline points="15 19 12 22 9 19"/><polyline points="19 9 22 12 19 15"/><line x1="2" y1="12" x2="22" y2="12"/><line x1="12" y1="2" x2="12" y2="22"/></svg>`,
    draw: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/></svg>`,
    save: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    chevronR: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>`,
    chevronL: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>`
  };

  /* ------------------------------------------------------------------------
     GEOGRAPHY, MAP POIS, FLEET & HANGARS (Real G1211 Coordinates)
     ------------------------------------------------------------------------ */
  const MAP_POIS = [
    { id: 'yardA', name: '二工区·料场示例A', shortName: '料场示例A', secId: 'sec2', scene: '料场巡检', lon: 126.1150, lat: 47.5080, alt: 222, gold: false, desc: '二工区核心储料场与预制拌合场站，配置机巢A01与12航点全覆盖环线。' },
    { id: 'bridgeA', name: '桥梁示例A', shortName: '桥梁示例A', secId: 'sec2', scene: '桥梁专项', lon: 125.9820, lat: 47.4520, alt: 235, gold: false, desc: '跨河主线大桥，重点复查2号墩台临边防护与架梁作业安全。' },
    { id: 'roadbedA', name: '路基示例段', shortName: '路基示例段', secId: 'sec3', scene: '路基边坡', lon: 125.9920, lat: 47.6520, alt: 228, gold: false, desc: 'K51+400~K54+800 高填方边坡与排水沟防护巡检示范段。' },
    { id: 'baotongA', name: '一工区·保通示例段', shortName: '保通示例段', secId: 'sec1', scene: '施工保通', lon: 125.9150, lat: 47.3620, alt: 225, gold: true, desc: 'K16+400~K18+200 施工导改段，重点核查交通导改标志、围挡与通道畅通。' }
  ];

  const HANGARS = [
    { id: 'H-A01', name: '机巢A01', secId: 'sec2', status: '在线', temp: '18.4 ℃', batterySlot: '2块满电', lon: 126.1150, lat: 47.5050, alt: 222 },
    { id: 'H-A02', name: '机巢A02', secId: 'sec1', status: '在线', temp: '17.9 ℃', batterySlot: '2块满电', lon: 125.9158, lat: 47.3602, alt: 224 },
    { id: 'H-B01', name: '机巢B01', secId: 'sec3', status: '在线', temp: '18.1 ℃', batterySlot: '1块充电中', lon: 125.9925, lat: 47.6504, alt: 226 },
    { id: 'H-B02', name: '机巢B02', secId: 'sec4', status: '在线', temp: '17.5 ℃', batterySlot: '2块满电', lon: 126.1350, lat: 47.8380, alt: 230 }
  ];

  const FLEET = [
    { id: 'UAV-A01', name: '无人机A01', model: 'M350 RTK · 双光云台', secId: 'sec2', hangar: '机巢A01', status: '执行中', battery: 72, signal: '正常' },
    { id: 'UAV-A02', name: '无人机A02', model: 'M350 RTK · 变焦云台', secId: 'sec1', hangar: '机巢A02', status: '待命', battery: 98, signal: '正常' },
    { id: 'UAV-A03', name: '无人机A03', model: 'Matrice 30T · 热成像', secId: 'sec2', hangar: '机巢A01', status: '待命', battery: 95, signal: '正常' },
    { id: 'UAV-B01', name: '无人机B01', model: 'M350 RTK · 激光雷达', secId: 'sec3', hangar: '机巢B01', status: '待命', battery: 88, signal: '正常' },
    { id: 'UAV-B02', name: '无人机B02', model: 'Matrice 30T', secId: 'sec4', hangar: '机巢B02', status: '充电中', battery: 64, signal: '正常' },
    { id: 'UAV-C01', name: '无人机C01', model: 'M300 RTK（备用）', secId: 'sec5', hangar: '机巢B02', status: '离线维护', battery: 0, signal: '维护' }
  ];

  const COVERAGE_ITEMS = [
    { name: '施工保通', scene: '施工保通', done: 6, total: 8 },
    { name: '料场及临时设施', scene: '料场巡检', done: 5, total: 6 },
    { name: '桥梁施工', scene: '桥梁专项', done: 4, total: 6 },
    { name: '路基路面', scene: '路基边坡', done: 3, total: 4 }
  ];

  /* ------------------------------------------------------------------------
     GENUINE ROUTE TEMPLATES & 12-WAYPOINT POLYGON (Centered on 料场示例A)
     ------------------------------------------------------------------------ */
  const ROUTE_TEMPLATES = [
    {
      id: 'tpl-lc-a',
      name: '料场巡检',
      code: 'LC-A V2.0',
      status: '已审核',
      secId: 'sec2',
      taskId: 'UAV-20261126-02',
      targetName: '二工区·料场示例A',
      hangar: '机巢A01',
      lengthKm: 1.24,
      icon: 'layers',
      center: [126.1150, 47.5080],
      boundary: [
        [126.1108, 47.5109],
        [126.1194, 47.5109],
        [126.1198, 47.5046],
        [126.1104, 47.5046]
      ],
      waypoints: [
        { no: '01', name: '机巢起降点', lon: 126.1136, lat: 47.5051, alt: 30, speed: 2.0, action: '起降自检', req: '确认机巢起降净空及信号', checkItem: '起降安全区', gimbal: '俯视' },
        { no: '02', name: '场内入口', lon: 126.1117, lat: 47.5056, alt: 35, speed: 3.0, action: '定点拍照', req: '门岗出入登记及车辆识别', checkItem: '场站出入口', gimbal: '前倾45°' },
        { no: '03', name: '西侧场界', lon: 126.1112, lat: 47.5072, alt: 40, speed: 3.0, action: '连续抓拍', req: '核查围挡封闭及排水沟', checkItem: '围挡封闭', gimbal: '前倾45°' },
        { no: '04', name: '料堆西侧', lon: 126.1114, lat: 47.5089, alt: 40, speed: 3.0, action: '定点拍照', req: '核查料堆覆盖防尘网状态', checkItem: '扬尘覆盖', gimbal: '俯视' },
        { no: '05', name: '1号料棚', lon: 126.1120, lat: 47.5099, alt: 45, speed: 3.0, action: '定点拍照', req: '料棚钢构顶棚与标牌巡检', checkItem: '料棚结构', gimbal: '前倾45°' },
        { no: '06', name: '棚间通道', lon: 126.1133, lat: 47.5105, alt: 40, speed: 3.0, action: '定点拍照', req: '通道净宽与物料堆码界线', checkItem: '场内通道', gimbal: '俯视' },
        { no: '07', name: '消防通道', lon: 126.1152, lat: 47.5105, alt: 40, speed: 3.0, action: '定点拍照', req: '取证全景与通道近景', checkItem: '消防通道', gimbal: '俯视' },
        { no: '08', name: '3号料棚', lon: 126.1173, lat: 47.5104, alt: 45, speed: 3.0, action: '定点拍照', req: '3号料棚消防器材与标识', checkItem: '消防设施', gimbal: '前倾45°' },
        { no: '09', name: '场内转弯', lon: 126.1187, lat: 47.5096, alt: 40, speed: 3.0, action: '连续抓拍', req: '转角限速与反光标识核对', checkItem: '交通标识', gimbal: '前倾45°' },
        { no: '10', name: '东侧堆料区', lon: 126.1192, lat: 47.5081, alt: 40, speed: 3.0, action: '定点拍照', req: '粗集料分区堆放与隔离墙', checkItem: '分区隔离', gimbal: '俯视' },
        { no: '11', name: '东南边界', lon: 126.1190, lat: 47.5060, alt: 35, speed: 3.0, action: '定点拍照', req: '沉淀池及东南场界安全', checkItem: '边坡防护', gimbal: '前倾45°' },
        { no: '12', name: '回收航段', lon: 126.1169, lat: 47.5051, alt: 30, speed: 2.5, action: '悬停录像', req: '返航降落前全景环视', checkItem: '起降安全区', gimbal: '俯视' }
      ],
      history: [
        { ver: 'LC-A V2.0', date: '2026-11-24', author: '技术员张工', status: '已审核', note: '新增航点07消防通道近景拍照与09转角连续抓拍' },
        { ver: 'LC-A V1.2', date: '2026-11-12', author: '巡检员A', status: '历史归档', note: '调整1号/3号料棚相对航高由35m提升至45m' },
        { ver: 'LC-A V1.0', date: '2026-10-28', author: '巡检员A', status: '历史归档', note: '料场示例A初始10航点闭环巡检航线' }
      ]
    },
    {
      id: 'tpl-bt-a',
      name: '施工保通巡检',
      code: 'BT-A V1.3',
      status: '已审核',
      secId: 'sec1',
      taskId: 'UAV-20261126-01',
      targetName: '一工区·保通示例段',
      hangar: '机巢A02',
      lengthKm: 2.15,
      icon: 'route',
      center: [125.9150, 47.3620],
      boundary: [
        [125.9085, 47.3655],
        [125.9225, 47.3655],
        [125.9225, 47.3585],
        [125.9085, 47.3585]
      ],
      waypoints: [
        { no: '01', name: '机巢起降点', lon: 125.9158, lat: 47.3602, alt: 35, speed: 3.0, action: '起降自检', req: '起降平台确认', checkItem: '起降安全区', gimbal: '俯视' },
        { no: '02', name: '明水侧导改口', lon: 125.9102, lat: 47.3600, alt: 45, speed: 4.0, action: '定点拍照', req: '核查限速及导改锥桶', checkItem: '交通导改', gimbal: '前倾45°' },
        { no: '03', name: 'K16+800围挡', lon: 125.9118, lat: 47.3618, alt: 45, speed: 4.0, action: '连续抓拍', req: '检查施工围挡连续性', checkItem: '施工围挡', gimbal: '前倾45°' },
        { no: '04', name: '中央分隔带开口', lon: 125.9146, lat: 47.3625, alt: 50, speed: 4.0, action: '定点拍照', req: '反光警示标志完整度', checkItem: '警示标志', gimbal: '俯视' },
        { no: '05', name: '跨线保通桥段', lon: 125.9175, lat: 47.3636, alt: 50, speed: 4.0, action: '悬停录像', req: '通行车流与保通宽度', checkItem: '道路通行', gimbal: '前倾45°' },
        { no: '06', name: '北安侧合流段', lon: 125.9206, lat: 47.3642, alt: 45, speed: 4.0, action: '定点拍照', req: '合流段提示标志与夜间反光', checkItem: '警示标志', gimbal: '前倾45°' },
        { no: '07', name: '东侧施工便道', lon: 125.9192, lat: 47.3608, alt: 40, speed: 3.5, action: '定点拍照', req: '施工便道出入口值守', checkItem: '交通导改', gimbal: '俯视' },
        { no: '08', name: '返航回收点', lon: 125.9165, lat: 47.3603, alt: 35, speed: 2.5, action: '起降自检', req: '降落前全景回传', checkItem: '起降安全区', gimbal: '俯视' }
      ],
      history: [
        { ver: 'BT-A V1.3', date: '2026-11-22', author: '巡检员B', status: '已审核', note: '加密中央分隔带开口与北安侧合流段航点' },
        { ver: 'BT-A V1.0', date: '2026-11-05', author: '巡检员B', status: '历史归档', note: '保通示例段初始往返巡检航线' }
      ]
    },
    {
      id: 'tpl-ql-a',
      name: '桥梁专项巡检',
      code: 'QL-A V1.1',
      status: '已审核',
      secId: 'sec2',
      taskId: 'UAV-20261126-03',
      targetName: '二工区·桥梁示例A·2号墩',
      hangar: '机巢A01',
      lengthKm: 0.92,
      icon: 'hangar',
      center: [125.9820, 47.4520],
      boundary: [
        [125.9785, 47.4545],
        [125.9858, 47.4545],
        [125.9858, 47.4495],
        [125.9785, 47.4495]
      ],
      waypoints: [
        { no: '01', name: '桥头起飞点', lon: 125.9794, lat: 47.4504, alt: 35, speed: 2.5, action: '起降自检', req: '桥头空域及电磁自检', checkItem: '起降安全区', gimbal: '俯视' },
        { no: '02', name: '1号墩盖梁', lon: 125.9806, lat: 47.4514, alt: 45, speed: 2.5, action: '定点拍照', req: '墩顶作业平台防护核查', checkItem: '临边防护', gimbal: '前倾45°' },
        { no: '03', name: '2号墩东侧立面', lon: 125.9820, lat: 47.4520, alt: 42, speed: 2.0, action: '定点拍照', req: '同点位临边防护复查取证', checkItem: '临边防护', gimbal: '前视' },
        { no: '04', name: '2号墩顶面俯拍', lon: 125.9822, lat: 47.4525, alt: 50, speed: 2.0, action: '定点拍照', req: '生命线及安全网张挂情况', checkItem: '高处作业', gimbal: '俯视' },
        { no: '05', name: '3号墩架梁区', lon: 125.9840, lat: 47.4533, alt: 55, speed: 3.0, action: '悬停录像', req: '架桥机支腿与临时支座', checkItem: '起重吊装', gimbal: '前倾45°' },
        { no: '06', name: '南侧返航点', lon: 125.9802, lat: 47.4500, alt: 35, speed: 2.5, action: '起降自检', req: '返航降落', checkItem: '起降安全区', gimbal: '俯视' }
      ],
      history: [
        { ver: 'QL-A V1.1', date: '2026-11-25', author: '巡检员A', status: '已审核', note: '锁定2号墩复查同点位相机姿态角' },
        { ver: 'QL-A V1.0', date: '2026-11-15', author: '巡检员A', status: '历史归档', note: '桥梁示例A基线航线' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     GENUINE 24 NOVEMBER MISSIONS (Matches 24 / 16 / 1 / 4 / 3 KPIs exactly!)
     ------------------------------------------------------------------------ */
  function createInitialTasks() {
    const top6 = [
      {
        id: 'UAV-20261126-01', name: '施工保通专项巡检', secId: 'sec1', target: '保通示例段',
        type: '专项', typeFull: '专项巡检', scene: '施工保通', planTime: '2026-11-26 10:00', shortTime: '11-26 10:00',
        status: '待执行', uav: '无人机A02', owner: '巡检员B（演示）', routeCode: 'BT-A V1.3', hangar: '机巢A02',
        checks: ['交通导改', '施工围挡', '警示标志', '道路通行'], allChecks: ['交通导改', '施工围挡', '警示标志', '道路通行'],
        preflightPassed: false, stage: 3, period: '2026年11月'
      },
      {
        id: 'UAV-20261126-02', name: '料场全面巡检', secId: 'sec2', target: '料场示例A',
        type: '全面', typeFull: '全面巡检', scene: '料场巡检', planTime: '2026-11-26 09:20', shortTime: '11-26 09:20',
        status: '执行中', uav: '无人机A01', owner: '巡检员A（演示）', routeCode: 'LC-A V2.0', hangar: '机巢A01',
        checks: ['消防通道', '扬尘覆盖', '围挡封闭', '分区隔离'], allChecks: ['消防通道', '扬尘覆盖', '围挡封闭', '分区隔离'],
        preflightPassed: true, stage: 4, period: '2026年11月'
      },
      {
        id: 'UAV-20261126-03', name: '桥梁防护复查', secId: 'sec2', target: '桥梁示例A·2号墩',
        type: '专项', typeFull: '专项巡检', scene: '桥梁专项', planTime: '2026-11-26 08:35', shortTime: '11-26 08:35',
        status: '已完成', uav: '无人机A03', owner: '巡检员A（演示）', routeCode: 'QL-A V1.1', hangar: '机巢A01',
        checks: ['临边防护', '高处作业', '起重吊装'], allChecks: ['临边防护', '高处作业', '起重吊装'],
        preflightPassed: true, stage: 6, period: '2026年11月'
      },
      {
        id: 'UAV-20261126-04', name: '路基边坡应急巡检', secId: 'sec3', target: '路基示例段',
        type: '应急', typeFull: '应急巡检', scene: '路基边坡', planTime: '2026-11-26 11:20', shortTime: '11-26 11:20',
        status: '待执行', uav: '无人机B01', owner: '巡检员C（演示）', routeCode: 'LJ-C V1.0', hangar: '机巢B01',
        checks: ['边坡稳定', '排水沟畅通', '警示隔离'], allChecks: ['边坡稳定', '排水沟畅通', '警示隔离'],
        preflightPassed: false, stage: 3, period: '2026年11月'
      },
      {
        id: 'UAV-20261125-03', name: '施工保通专项巡检', secId: 'sec1', target: '保通示例段',
        type: '专项', typeFull: '专项巡检', scene: '施工保通', planTime: '2026-11-25 15:10', shortTime: '11-25 15:10',
        status: '已完成', uav: '无人机A02', owner: '巡检员B（演示）', routeCode: 'BT-A V1.3', hangar: '机巢A02',
        checks: ['交通导改', '施工围挡', '警示标志', '道路通行'], allChecks: ['交通导改', '施工围挡', '警示标志', '道路通行'],
        preflightPassed: true, stage: 6, period: '2026年11月'
      },
      {
        id: 'UAV-20261125-01', name: '料场出入口巡检', secId: 'sec4', target: '料场示例B',
        type: '全面', typeFull: '全面巡检', scene: '料场巡检', planTime: '2026-11-25 09:30', shortTime: '11-25 09:30',
        status: '待整理', uav: '无人机B02', owner: '巡检员D（演示）', routeCode: 'LC-B V1.2', hangar: '机巢B02',
        checks: ['出入口通道', '扬尘覆盖', '车辆停放'], allChecks: ['出入口通道', '扬尘覆盖', '车辆停放'],
        preflightPassed: true, stage: 5, period: '2026年11月'
      }
    ];

    // Remaining 18 tasks: 2 待执行, 2 待整理, 14 已完成 => Total 24 (待执行=4, 执行中=1, 待整理=3, 已完成=16)
    const restMeta = [
      ['UAV-20261127-01', '建华枢纽互通巡检', 'sec6', '建华枢纽互通', '全面', '2026-11-27 09:00', '待执行', '无人机B02', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261127-02', '五工区预制梁场巡检', 'sec5', '梁场示例B', '专项', '2026-11-27 14:00', '待执行', '无人机B02', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261124-02', '跨河大桥墩身复核', 'sec3', '跨河主桥3号墩', '专项', '2026-11-24 14:30', '待整理', '无人机B01', '机巢B01', 'QL-A V1.1'],
      ['UAV-20261124-01', '路基边坡日常巡检', 'sec3', '路基示例段', '全面', '2026-11-24 10:15', '待整理', '无人机B01', '机巢B01', 'LC-A V2.0'],
      ['UAV-20261123-03', '一工区导改段夜间复查', 'sec1', '保通示例段', '专项', '2026-11-23 16:40', '已完成', '无人机A02', '机巢A02', 'BT-A V1.3'],
      ['UAV-20261123-01', '二工区梁场龙门吊专项', 'sec2', '梁场示例A', '专项', '2026-11-23 09:10', '已完成', '无人机A01', '机巢A01', 'QL-A V1.1'],
      ['UAV-20261122-02', '四工区拌合站防尘巡检', 'sec4', '拌合站示例A', '全面', '2026-11-22 14:20', '已完成', '无人机B02', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261121-04', '桥梁示例A临边安全首巡', 'sec2', '桥梁示例A·2号墩', '专项', '2026-11-21 10:00', '已完成', '无人机A03', '机巢A01', 'QL-A V1.1'],
      ['UAV-20261120-02', '五工区高填方边坡巡查', 'sec5', 'K104边坡段', '全面', '2026-11-20 11:00', '已完成', '无人机B01', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261119-01', '六工区路基防护专项', 'sec6', 'K128+500段', '专项', '2026-11-19 09:30', '已完成', '无人机B02', '机巢B02', 'BT-A V1.3'],
      ['UAV-20261118-03', '二工区料场消防专项', 'sec2', '料场示例A', '专项', '2026-11-18 15:00', '已完成', '无人机A01', '机巢A01', 'LC-A V2.0'],
      ['UAV-20261117-01', '一工区施工保通周巡检', 'sec1', '保通示例段', '全面', '2026-11-17 10:00', '已完成', '无人机A02', '机巢A02', 'BT-A V1.3'],
      ['UAV-20261115-02', '三工区水稳摊铺区巡检', 'sec3', 'K54+200摊铺面', '全面', '2026-11-15 13:30', '已完成', '无人机B01', '机巢B01', 'LC-A V2.0'],
      ['UAV-20261114-01', '四工区黑土表土堆场巡检', 'sec4', '表土临时堆场', '专项', '2026-11-14 09:45', '已完成', '无人机B02', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261112-02', '二工区跨线桥现浇梁巡检', 'sec2', '桥梁示例A', '专项', '2026-11-12 14:15', '已完成', '无人机A03', '机巢A01', 'QL-A V1.1'],
      ['UAV-20261110-01', '一工区起点互通保通巡查', 'sec1', 'BK0+000互通', '全面', '2026-11-10 09:20', '已完成', '无人机A02', '机巢A02', 'BT-A V1.3'],
      ['UAV-20261108-01', '五工区拌合站料仓巡查', 'sec5', '五工区拌合站', '全面', '2026-11-08 10:30', '已完成', '无人机B01', '机巢B02', 'LC-A V2.0'],
      ['UAV-20261105-01', '六工区枢纽桥梁桩基巡查', 'sec6', '建华枢纽主桥', '专项', '2026-11-05 15:20', '已完成', '无人机B02', '机巢B02', 'QL-A V1.1']
    ];

    const rest = restMeta.map(r => ({
      id: r[0], name: r[1], secId: r[2], target: r[3],
      type: r[4], typeFull: r[4] + '巡检',
      scene: r[1].includes('保通') ? '施工保通' : r[1].includes('桥') ? '桥梁专项' : r[1].includes('路基') || r[1].includes('边坡') ? '路基边坡' : '料场巡检',
      planTime: r[5], shortTime: r[5].slice(5),
      status: r[6], uav: r[7], owner: '巡检员A（演示）', routeCode: r[9], hangar: r[8],
      checks: ['现场安全', '重点部位', '标识标牌'], allChecks: ['现场安全', '重点部位', '标识标牌'],
      preflightPassed: r[6] !== '待执行', stage: r[6] === '已完成' ? 6 : r[6] === '待整理' ? 5 : 3, period: '2026年11月'
    }));

    return [...top6, ...rest];
  }

  /* ------------------------------------------------------------------------
     GENUINE 18 CLUES FOR SUB-PAGE 05 (Matches 18 / 4 / 10 / 3 / 1 KPIs!)
     ------------------------------------------------------------------------ */
  function createInitialClues() {
    const pending4 = [
      {
        id: 'UAI-20261126-004', title: '疑似消防通道占用', secId: 'sec2', location: '二工区·料场示例A',
        scene: '料场巡检', time: '2026-11-26 09:27:18', shortTime: '11-26 09:27', status: '待核查',
        taskId: 'UAV-20261126-02', waypoint: '航点07·消防通道', imgName: 'IMG_0018.jpg', wpLabel: '航点 07',
        category: '消防通道占用', rule: '消防通道占用识别', source: '无人机A01·可见光',
        reviewer: '核查人员A（演示）', note: '结合取证影像，核对消防通道边界及材料堆放位置。',
        imgSrc: 'milestone_before.jpg', box: { x: 0.56, y: 0.44, w: 0.24, h: 0.31 }, linkedHazard: ''
      },
      {
        id: 'UAI-20261125-003', title: '疑似隔离设施异常', secId: 'sec1', location: '一工区·保通示例段',
        scene: '施工保通', time: '2026-11-25 15:18:40', shortTime: '11-25 15:18', status: '待核查',
        taskId: 'UAV-20261125-03', waypoint: '航点03·K16+800围挡', imgName: 'IMG_0012.jpg', wpLabel: '航点 03',
        category: '隔离围挡破损', rule: '导改隔离设施识别', source: '无人机A02·可见光',
        reviewer: '核查人员A（演示）', note: '导改段西侧水马局部移位约1.2m，需核实是否已完成复位。',
        imgSrc: 'corridor_aerial.jpg', box: { x: 0.34, y: 0.48, w: 0.22, h: 0.24 }, linkedHazard: ''
      },
      {
        id: 'UAI-20261125-002', title: '疑似场内通道占用', secId: 'sec4', location: '四工区·料场示例B',
        scene: '料场巡检', time: '2026-11-25 09:33:12', shortTime: '11-25 09:33', status: '待核查',
        taskId: 'UAV-20261125-01', waypoint: '航点05·东侧通道', imgName: 'IMG_0009.jpg', wpLabel: '航点 05',
        category: '运输通道占用', rule: '场内通道阻塞识别', source: '无人机B02·可见光',
        reviewer: '核查人员B（演示）', note: '预制构件临时卸车占道，核查是否超出临时装卸作业窗口。',
        imgSrc: 'milestone_before.jpg', box: { x: 0.44, y: 0.50, w: 0.26, h: 0.25 }, linkedHazard: ''
      },
      {
        id: 'UAI-20261124-001', title: '疑似临边防护缺项', secId: 'sec3', location: '三工区·路基示例段',
        scene: '路基边坡', time: '2026-11-24 14:42:05', shortTime: '11-24 14:42', status: '待核查',
        taskId: 'UAV-20261124-01', waypoint: '航点04·深挖方平台', imgName: 'IMG_0004.jpg', wpLabel: '航点 04',
        category: '临边防护缺失', rule: '高差临边防护识别', source: '无人机B01·可见光',
        reviewer: '核查人员A（演示）', note: '路堑二级平台局部警示护栏缺口，请核对安全台账是否已下发整改。',
        imgSrc: 'showcase_viaduct.jpg', box: { x: 0.50, y: 0.40, w: 0.22, h: 0.26 }, linkedHazard: ''
      }
    ];

    const histSpecs = [
      ['UAI-20261123-005', '临边防护缺失（桥梁2号墩）', 'sec2', '二工区·桥梁示例A·2号墩', '桥梁专项', '2026-11-21 10:02:14', '11-21 10:02', '已确认隐患', 'AQ-202611-018'],
      ['UAI-20261123-004', '保通段锥桶间距偏大', 'sec1', '一工区·保通示例段', '施工保通', '2026-11-23 16:45:00', '11-23 16:45', '已确认隐患', 'AQ-202611-021'],
      ['UAI-20261122-003', '细集料堆防尘网掀角', 'sec4', '四工区·拌合站示例A', '料场巡检', '2026-11-22 14:28:10', '11-22 14:28', '已确认隐患', 'AQ-202611-022'],
      ['UAI-20261121-002', '跨线桥作业区未设警戒绳', 'sec2', '二工区·桥梁示例A', '桥梁专项', '2026-11-21 11:12:00', '11-21 11:12', '已确认隐患', 'AQ-202611-019'],
      ['UAI-20261120-003', '边坡截水沟局部淤堵', 'sec5', '五工区·K104边坡段', '路基边坡', '2026-11-20 11:18:00', '11-20 11:18', '已确认隐患', 'AQ-202611-016'],
      ['UAI-20261119-002', '护坡脚手架连墙件缺扣', 'sec6', '六工区·K128+500段', '路基边坡', '2026-11-19 09:42:00', '11-19 09:42', '已确认隐患', 'AQ-202611-015'],
      ['UAI-20261118-002', '配电箱周边易燃杂物', 'sec2', '二工区·料场示例A', '料场巡检', '2026-11-18 15:14:00', '11-18 15:14', '已确认隐患', 'AQ-202611-014'],
      ['UAI-20261117-001', '导改入口限高架反光贴脱落', 'sec1', '一工区·保通示例段', '施工保通', '2026-11-17 10:22:00', '11-17 10:22', '已确认隐患', 'AQ-202611-012'],
      ['UAI-20261115-002', '水稳摊铺区临时标牌倒伏', 'sec3', '三工区·K54+200摊铺面', '路基边坡', '2026-11-15 13:45:00', '11-15 13:45', '已确认隐患', 'AQ-202611-011'],
      ['UAI-20261114-001', '表土堆场挡水坎缺口', 'sec4', '四工区·表土临时堆场', '料场巡检', '2026-11-14 09:58:00', '11-14 09:58', '已确认隐患', 'AQ-202611-009'],
      ['UAI-20261122-001', '阴影误判为物料侵占通道', 'sec2', '二工区·料场示例A', '料场巡检', '2026-11-22 09:10:00', '11-22 09:10', '已标误报', ''],
      ['UAI-20261119-001', '反光膜反光误识别为明火点', 'sec6', '六工区·建华枢纽', '料场巡检', '2026-11-19 11:05:00', '11-19 11:05', '已标误报', ''],
      ['UAI-20261116-001', '过往养护车误判为违停占道', 'sec1', '一工区·保通示例段', '施工保通', '2026-11-16 14:15:00', '11-16 14:15', '已标误报', ''],
      ['UAI-20261120-001', '重复识别2号墩临边缺失', 'sec2', '二工区·桥梁示例A·2号墩', '桥梁专项', '2026-11-20 16:00:00', '11-20 16:00', '已关联重复', 'AQ-202611-018']
    ];

    const hist14 = histSpecs.map(h => ({
      id: h[0], title: h[1], secId: h[2], location: h[3], scene: h[4],
      time: h[5], shortTime: h[6], status: h[7],
      taskId: 'UAV-20261121-04', waypoint: '航点03', imgName: 'IMG_0015.jpg', wpLabel: '航点 03',
      category: h[1], rule: h[4] + 'AI规则', source: '无人机A03·可见光',
      reviewer: '核查人员A（演示）', note: h[7] === '已标误报' ? '经人工复核为光照阴影或过境车辆导致的误识别。' : '已核查确认并关联安全管理台账处理。',
      imgSrc: 'showcase_viaduct.jpg', box: { x: 0.42, y: 0.45, w: 0.24, h: 0.26 }, linkedHazard: h[8]
    }));

    return [...pending4, ...hist14];
  }

  /* ------------------------------------------------------------------------
     GENUINE 16 REPORTS FOR SUB-PAGE 06 (Matches 16 / 13 / 2 / 1 / 3 KPIs!)
     ------------------------------------------------------------------------ */
  function createInitialReports() {
    const top4 = [
      {
        id: 'RPT-20261126-03', title: '桥梁防护复查报告', taskId: 'UAV-20261126-03', origTaskId: 'UAV-20261121-04',
        secId: 'sec2', location: '二工区·桥梁示例A·2号墩', type: '复查报告', date: '2026-11-26',
        status: '已归档', archiveTime: '11-26 10:42', mediaSummary: '照片12张·视频1段',
        flightRecCount: 1, photoCount: 25, videoCount: 3, hazardCount: 1, isRecheck: true,
        summary: '对桥梁示例A的2号墩作业区进行同点位巡检，补充临边防护复查影像。',
        hazardId: 'AQ-202611-018', hazardDesc: '临边防护缺失', hazardState: '待复查',
        recheckEvidence: '已回传2号墩作业区同点位影像。', handleStatus: '待安全管理复查',
        origTime: '11-21 10:02', recheckTime: '11-26 08:43',
        timeline: [
          { date: '11-21', text: '原巡检发现临边防护缺失', done: true },
          { date: '11-23', text: '安全管理台账收到整改反馈', done: true },
          { date: '11-26', text: '同点位复查影像已回传', done: true }
        ]
      },
      {
        id: 'RPT-20261126-02', title: '料场全面巡检报告', taskId: 'UAV-20261126-02', origTaskId: 'UAV-20261118-03',
        secId: 'sec2', location: '二工区·料场示例A', type: '全面巡检报告', date: '2026-11-26',
        status: '待复查', archiveTime: '待归档确认', mediaSummary: '照片18张·视频1段',
        flightRecCount: 1, photoCount: 18, videoCount: 1, hazardCount: 1, isRecheck: true,
        summary: '对二工区料场示例A全区12个航点进行环线巡检，重点排查消防通道与堆料隔离状态。',
        hazardId: 'AQ-202611-041', hazardDesc: '疑似消防通道占用', hazardState: '待复查',
        recheckEvidence: '航点07已采集近景取证影像（IMG_0018.jpg），待人工核查确认。', handleStatus: '已触发安全复查流程',
        origTime: '11-18 15:08', recheckTime: '11-26 09:27',
        timeline: [
          { date: '11-26 09:20', text: '无人机A01执行料场全面巡检', done: true },
          { date: '11-26 09:27', text: '航点07识别疑似消防通道占用', done: true },
          { date: '11-26 09:35', text: '生成待复查报告等待核销闭环', done: false }
        ]
      },
      {
        id: 'RPT-20261125-03', title: '施工保通专项巡检报告', taskId: 'UAV-20261125-03', origTaskId: 'UAV-20261117-01',
        secId: 'sec1', location: '一工区·保通示例段', type: '专项巡检报告', date: '2026-11-25',
        status: '已归档', archiveTime: '11-25 16:48', mediaSummary: '照片16张·视频2段',
        flightRecCount: 1, photoCount: 16, videoCount: 2, hazardCount: 1, isRecheck: true,
        summary: '沿一工区保通示例段K16+400~K18+200导改走廊完成全段空中巡视与设施核查。',
        hazardId: 'AQ-202611-021', hazardDesc: '导改段西侧水马局部移位', hazardState: '已销项',
        recheckEvidence: '经同点位复拍确认水马及反光警示牌已全部复位。', handleStatus: '安全管理台账已闭环销项',
        origTime: '11-17 10:12', recheckTime: '11-25 15:18',
        timeline: [
          { date: '11-17', text: '首轮巡检发现导改水马偏移', done: true },
          { date: '11-22', text: '一工区现场完成整改加固', done: true },
          { date: '11-25', text: '无人机复飞核查确认闭环', done: true }
        ]
      },
      {
        id: 'RPT-20261125-01', title: '料场出入口巡检简报', taskId: 'UAV-20261125-01', origTaskId: 'UAV-20261114-01',
        secId: 'sec4', location: '四工区·料场示例B', type: '全面巡检报告', date: '2026-11-25',
        status: '草稿', archiveTime: '未归档（草稿）', mediaSummary: '照片10张·视频1段',
        flightRecCount: 1, photoCount: 10, videoCount: 1, hazardCount: 1, isRecheck: false,
        summary: '针对四工区料场示例B运输便道及门岗出入口开展例行空中巡检，待补充核查结论后归档。',
        hazardId: 'AQ-202611-022', hazardDesc: '临时装卸占用运输通道', hazardState: '待复查',
        recheckEvidence: '草稿已挂载航点05现场影像，等待巡检负责人签批归档。', handleStatus: '草稿待提交审核',
        origTime: '11-14 09:45', recheckTime: '11-25 09:33',
        timeline: [
          { date: '11-25 09:30', text: '采集料场出入口影像10张', done: true },
          { date: '11-25 10:15', text: '系统自动生成报告草稿', done: true },
          { date: '待完成', text: '等待负责人补充结论并归档', done: false }
        ]
      }
    ];

    // Remaining 12 reports: 11 已归档, 1 待复查 => Total 16 (已归档=13, 待复查=2, 草稿=1, 同点位复查记录=3)
    const extraMeta = [
      ['RPT-20261123-03', '一工区导改段夜间复查报告', 'UAV-20261123-03', 'sec1', '一工区·保通示例段', '专项巡检报告', '2026-11-23', '已归档'],
      ['RPT-20261123-01', '梁场龙门吊专项巡检报告', 'UAV-20261123-01', 'sec2', '二工区·梁场示例A', '专项巡检报告', '2026-11-23', '已归档'],
      ['RPT-20261122-02', '拌合站防尘防污巡检报告', 'UAV-20261122-02', 'sec4', '四工区·拌合站示例A', '全面巡检报告', '2026-11-22', '已归档'],
      ['RPT-20261121-04', '桥梁示例A安全首巡报告', 'UAV-20261121-04', 'sec2', '二工区·桥梁示例A·2号墩', '专项巡检报告', '2026-11-21', '待复查'],
      ['RPT-20261120-02', '五工区高填方边坡巡查报告', 'UAV-20261120-02', 'sec5', '五工区·K104边坡段', '全面巡检报告', '2026-11-20', '已归档'],
      ['RPT-20261119-01', '六工区路基防护专项报告', 'UAV-20261119-01', 'sec6', '六工区·K128+500段', '专项巡检报告', '2026-11-19', '已归档'],
      ['RPT-20261118-03', '料场消防专项巡检报告', 'UAV-20261118-03', 'sec2', '二工区·料场示例A', '专项巡检报告', '2026-11-18', '已归档'],
      ['RPT-20261117-01', '施工保通周例行巡检报告', 'UAV-20261117-01', 'sec1', '一工区·保通示例段', '全面巡检报告', '2026-11-17', '已归档'],
      ['RPT-20261115-02', '三工区水稳摊铺区巡检报告', 'UAV-20261115-02', 'sec3', '三工区·K54+200摊铺面', '全面巡检报告', '2026-11-15', '已归档'],
      ['RPT-20261114-01', '表土临时堆场保护巡检报告', 'UAV-20261114-01', 'sec4', '四工区·表土临时堆场', '专项巡检报告', '2026-11-14', '已归档'],
      ['RPT-20261112-02', '跨线桥现浇梁支架巡检报告', 'UAV-20261112-02', 'sec2', '二工区·桥梁示例A', '专项巡检报告', '2026-11-12', '已归档'],
      ['RPT-20261110-01', '起点互通保通专项巡查报告', 'UAV-20261110-01', 'sec1', '一工区·BK0+000互通', '全面巡检报告', '2026-11-10', '已归档']
    ];

    const rest = extraMeta.map(r => ({
      id: r[0], title: r[1], taskId: r[2], origTaskId: r[2],
      secId: r[3], location: r[4], type: r[5], date: r[6],
      status: r[7], archiveTime: r[6].slice(5) + ' 17:10', mediaSummary: '照片14张·视频1段',
      flightRecCount: 1, photoCount: 14, videoCount: 1, hazardCount: 1, isRecheck: false,
      summary: `对${r[4]}开展${r[5].replace('报告', '')}，全航段影像与遥测记录完整归档。`,
      hazardId: 'AQ-202611-012', hazardDesc: '现场例行巡查核验记录', hazardState: r[7] === '待复查' ? '待复查' : '已销项',
      recheckEvidence: '航拍全覆盖影像与飞行轨迹日志已绑定存档。', handleStatus: r[7] === '已归档' ? '已完成归档' : '待复查闭环',
      origTime: r[6].slice(5) + ' 09:30', recheckTime: r[6].slice(5) + ' 15:20',
      timeline: [
        { date: r[6].slice(5), text: '无人机完成规定航线自动飞行取证', done: true },
        { date: r[6].slice(5), text: 'AI与人工联合核验现场隐患点位', done: true },
        { date: r[6].slice(5), text: r[7] === '已归档' ? '报告正式归档并同步安全台账' : '等待复查照片回传归档', done: r[7] === '已归档' }
      ]
    }));

    return [...top4, ...rest];
  }

  /* ------------------------------------------------------------------------
     MODULE PERSISTENT STATE
     ------------------------------------------------------------------------ */
  const ui = {
    overview: {
      secId: 'all',
      period: '2026年11月',
      scene: '全部场景',
      showRoutes: true,
      showHangars: true,
      showPois: true,
      droneWpIdx: 6.35 // between 07 & 08
    },
    tasks: {
      secId: 'all',
      type: '全部类型',
      status: '全部状态',
      period: '2026年11月',
      page: 1,
      pageSize: 6,
      selectedId: 'UAV-20261126-01',
      list: createInitialTasks()
    },
    routes: {
      search: '',
      selectedTplId: 'tpl-lc-a',
      selectedWpIdx: 6, // 07·消防通道
      toolMode: 'select', // select | draw | move
      previewing: false,
      previewProgress: 6.0, // 0..11.99
      showRouteLine: true,
      showBoundary: true,
      showLayerPopover: false,
      templates: ROUTE_TEMPLATES.map(t => ({
        ...t,
        waypoints: t.waypoints.map(w => ({ ...w })),
        boundary: t.boundary.map(b => [...b]),
        history: t.history.map(h => ({ ...h }))
      }))
    },
    live: {
      taskId: 'UAV-20261126-02',
      uavId: 'UAV-A01',
      feedMode: 'visible', // visible | thermal
      flightStatus: '执行中', // 执行中 | 已暂停 | 返航中 | 人工接管
      battery: 72,
      altitude: 40,
      speed: 3.0,
      elapsedSec: 600, // 10:00
      wpFloat: 6.45, // 7/12
      recording: false,
      recSeconds: 0,
      gimbalPitch: -45,
      gimbalYaw: 0,
      gimbalZoom: 1.0,
      snapshots: [],
      events: [
        { time: '09:12', text: '飞前检查及授权核验通过' },
        { time: '09:20', text: '开始料场全面巡检' },
        { time: '09:27', text: '航点07取证并生成待核查线索' },
        { time: '09:30', text: '链路稳定，影像持续回传' }
      ]
    },
    hazards: {
      secId: 'all',
      scene: '全部场景',
      status: '全部状态',
      period: '2026年11月',
      selectedId: 'UAI-20261126-004',
      viewMode: 'ai', // ai | raw
      clues: createInitialClues()
    },
    reports: {
      secId: 'all',
      type: '全部类型',
      dateFilter: '2026年11月',
      keyword: '',
      selectedId: 'RPT-20261126-03',
      pageNo: 1, // 1 / 2
      list: createInitialReports()
    }
  };

  /* ------------------------------------------------------------------------
     RUNTIME REFS & CLEANUP HANDLES
     ------------------------------------------------------------------------ */
  let lastCtx = null;
  let lastSubPageId = null;
  let cesiumEntities = [];
  let cesiumHtmlPins = [];
  let cesiumOverlayLayer = null;
  let cesiumPostRenderRemover = null;
  let cesiumClickHandler = null;
  let overviewDroneTimer = null;
  let routePreviewTimer = null;
  let liveRafId = null;
  let liveTickTimer = null;
  let cameraFlyTimer = null;
  const imgCache = {};

  function getCachedImage(filename) {
    if (!filename) return null;
    if (imgCache[filename]) return imgCache[filename];
    const im = new Image();
    im.src = ASSET_BASE + filename;
    imgCache[filename] = im;
    return im;
  }

  function formatSecMMSS(sec) {
    const s = Math.max(0, Math.floor(sec));
    const m = String(Math.floor(s / 60)).padStart(2, '0');
    const r = String(s % 60).padStart(2, '0');
    return `${m}:${r}`;
  }

  function escapeHtml(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function secLabel(secId) {
    return SEC_NAME_BY_ID[secId] || '全线';
  }

  function statusTagClass(status) {
    if (status === '已完成' || status === '已归档' || status === '在线' || status === '正常' || status === '飞前检查已通过' || status === '已确认隐患' || status === '已审核' || status === '已销项') return 'ok';
    if (status === '待执行' || status === '待核查' || status === '待复查' || status === '人工接管') return 'warn';
    return 'info';
  }

  /* ------------------------------------------------------------------------
     SINGLETON SCOPED STYLESHEET (.m09-* prefix only)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m09-styles')) return;
    const style = document.createElement('style');
    style.id = 'm09-styles';
    style.textContent = `
      /* Shared opaque page shell */
      .m09-opaque-page {
        padding: 12px 18px 100px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        min-height: 100%;
        color: var(--text-main);
        box-sizing: border-box;
      }

      /* Interactive map stage shell (lets pointer drag/zoom pass to Cesium) */
      .m09-map-stage {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .m09-map-stage .hud-left-col {
        max-height: calc(100% - 26px);
      }
      .m09-map-stage .hud-right-col {
        max-height: calc(100% - 114px);
        overflow-y: auto;
      }
      .m09-cesium-pins {
        position: absolute;
        inset: 0;
        pointer-events: none;
        z-index: 9;
        overflow: hidden;
      }
      .m09-pin-anchor {
        position: absolute;
        top: 0;
        left: 0;
        pointer-events: auto;
        will-change: transform;
      }

      /* Map top floating filter/toolbar */
      .m09-map-topbar {
        position: absolute;
        top: 12px;
        left: 282px;
        right: 300px;
        z-index: 21;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 12px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(9, 32, 74, 0.88), rgba(6, 22, 54, 0.86));
        border: 1px solid var(--border-cyan);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m09-map-bar-left, .m09-map-bar-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-wrap: wrap;
      }

      /* Map legend strip at bottom center */
      .m09-map-legend {
        position: absolute;
        bottom: 12px;
        left: 282px;
        right: 300px;
        z-index: 20;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 14px;
        border-radius: 8px;
        background: rgba(6, 22, 52, 0.84);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(10px);
        font-size: 12px;
        color: #cfe6ff;
      }
      .m09-legend-items {
        display: inline-flex;
        align-items: center;
        gap: 14px;
      }
      .m09-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .m09-line-solid { width: 16px; height: 2.5px; background: #38f2ff; border-radius: 2px; box-shadow: 0 0 6px #38f2ff; }
      .m09-line-dash { width: 16px; height: 0; border-top: 2px dashed #e2e8f0; }
      .m09-line-dash-gold { width: 16px; height: 0; border-top: 2px dashed #facc15; }

      /* Map Zoom Dock right-of-center */
      .m09-map-zoom {
        position: absolute;
        right: 308px;
        bottom: 58px;
        z-index: 21;
        pointer-events: auto;
      }
      .m09-map-zoom.routes-pos {
        bottom: 112px;
      }

      /* Bottom 12-waypoint ribbon in routes */
      .m09-wp-ribbon {
        position: absolute;
        left: 282px;
        right: 300px;
        bottom: 50px;
        z-index: 21;
        pointer-events: auto;
        display: grid;
        grid-template-columns: repeat(12, minmax(0, 1fr));
        gap: 5px;
        padding: 6px 8px;
        border-radius: 9px;
        background: rgba(7, 24, 58, 0.88);
        border: 1px solid rgba(56, 189, 248, 0.36);
        backdrop-filter: blur(12px);
      }
      .m09-wp-chip {
        padding: 5px 3px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(12, 42, 92, 0.65);
        color: #d8ecff;
        text-align: center;
        cursor: pointer;
        transition: all 0.16s;
        overflow: hidden;
      }
      .m09-wp-chip:hover {
        border-color: var(--cyan-bright);
        background: rgba(16, 66, 134, 0.78);
      }
      .m09-wp-chip.active {
        border-color: #facc15;
        background: linear-gradient(180deg, rgba(180, 118, 12, 0.68), rgba(112, 72, 10, 0.78));
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.38);
        color: #fef08a;
      }
      .m09-wp-chip-no {
        font-size: 12px;
        font-weight: 800;
        line-height: 1.1;
      }
      .m09-wp-chip-name {
        font-size: 10.5px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin-top: 2px;
        opacity: 0.92;
      }

      /* Projected Cesium map pills */
      .m09-map-pin {
        transform: translate(-50%, -100%);
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      .m09-map-pill {
        display: inline-flex;
        align-items: center;
        gap: 5px;
        padding: 4px 10px;
        border-radius: 7px;
        background: rgba(8, 30, 68, 0.92);
        border: 1.2px solid rgba(56, 220, 255, 0.75);
        color: #f1f7ff;
        font-size: 12px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 4px 14px rgba(0, 8, 28, 0.65);
      }
      .m09-map-pill.gold {
        border-color: #facc15;
        background: linear-gradient(180deg, rgba(126, 86, 12, 0.92), rgba(76, 52, 8, 0.92));
        color: #fef08a;
        box-shadow: 0 0 14px rgba(250, 204, 21, 0.45);
      }
      .m09-map-pill.green {
        border-color: #22c55e;
        background: linear-gradient(180deg, rgba(12, 72, 48, 0.92), rgba(8, 46, 32, 0.92));
        color: #bbf7d0;
      }
      .m09-map-stem {
        width: 1.5px;
        height: 9px;
        background: rgba(56, 242, 255, 0.85);
      }
      .m09-map-dot {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #38f2ff;
        border: 1.5px solid #fff;
        box-shadow: 0 0 8px #38f2ff;
      }
      .m09-wp-node {
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(8, 34, 78, 0.92);
        border: 2px solid #38f2ff;
        color: #ffffff;
        font-size: 11px;
        font-weight: 800;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 10px rgba(56, 242, 255, 0.55);
      }
      .m09-wp-node.active {
        background: #ca8a04;
        border-color: #fef08a;
        color: #fff;
        transform: translate(-50%, -50%) scale(1.18);
        box-shadow: 0 0 16px rgba(250, 204, 21, 0.85);
      }
      .m09-wp-callout {
        position: absolute;
        bottom: 28px;
        left: 50%;
        transform: translateX(-50%);
        padding: 3px 10px;
        border-radius: 99px;
        background: rgba(110, 74, 8, 0.94);
        border: 1px solid #facc15;
        color: #fef08a;
        font-size: 11.5px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.55);
      }

      /* HUD 2x2 KPI Grid & Progress */
      .m09-kpi-2x2 {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 8px;
      }
      .m09-kpi-mini {
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(14, 44, 96, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.24);
        cursor: pointer;
        transition: border-color 0.16s;
      }
      .m09-kpi-mini:hover { border-color: var(--cyan-bright); }
      .m09-kpi-mini-lbl { font-size: 11.5px; color: var(--text-sub); }
      .m09-kpi-mini-val { font-size: 20px; font-weight: 800; color: #38f2ff; margin-top: 2px; font-variant-numeric: tabular-nums; }
      .m09-kpi-mini-val span { font-size: 11.5px; font-weight: 500; color: var(--text-sub); margin-left: 2px; }
      .m09-kpi-mini-val.green { color: #22c55e; }
      .m09-kpi-mini-val.gold { color: #facc15; }

      .m09-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        font-size: 12.5px;
      }
      .m09-kv-row:last-child { border-bottom: none; }
      .m09-kv-k { color: var(--text-sub); display: inline-flex; align-items: center; gap: 6px; }
      .m09-kv-v { color: #ffffff; font-weight: 600; text-align: right; }

      .m09-panel-foot {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-top: 8px;
        padding-top: 7px;
        border-top: 1px solid rgba(56, 189, 248, 0.15);
        font-size: 12px;
        color: var(--text-muted);
      }
      .m09-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
        display: inline-flex;
        align-items: center;
        gap: 3px;
      }
      .m09-link-btn:hover { color: #a5f3fc; text-decoration: underline; }

      .m09-cov-row {
        display: flex;
        flex-direction: column;
        gap: 4px;
        padding: 4px 0;
        cursor: pointer;
      }
      .m09-cov-top {
        display: flex;
        justify-content: space-between;
        font-size: 12px;
        color: #e6f2ff;
      }
      .m09-cov-track {
        height: 5px;
        border-radius: 99px;
        background: rgba(14, 48, 98, 0.85);
        overflow: hidden;
      }
      .m09-cov-fill {
        height: 100%;
        border-radius: 99px;
        background: linear-gradient(90deg, #0ea5e9, #38f2ff);
      }

      /* Opaque Top Filter Bar & 5 KPI Strip */
      .m09-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 9px 14px;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(10, 34, 78, 0.88), rgba(7, 23, 56, 0.86));
        border: 1px solid var(--border-cyan);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m09-filter-group {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }
      .m09-field-inline {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        color: var(--text-sub);
      }
      .m09-select, .m09-input {
        padding: 5px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(8, 28, 66, 0.88);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
      }
      .m09-select:focus, .m09-input:focus { border-color: var(--cyan-bright); }
      .m09-btn {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 5px;
        padding: 6px 13px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(12, 42, 92, 0.76);
        color: #e6f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.16s;
        white-space: nowrap;
      }
      .m09-btn:hover { border-color: var(--cyan-bright); color: #fff; background: rgba(18, 66, 138, 0.85); }
      .m09-btn.primary {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #7dd3fc;
        color: #ffffff;
        box-shadow: 0 0 12px rgba(27, 136, 255, 0.42);
      }
      .m09-btn.gold {
        border-color: #facc15;
        background: linear-gradient(180deg, rgba(168, 114, 12, 0.72), rgba(102, 66, 8, 0.82));
        color: #fef08a;
      }
      .m09-btn:disabled { opacity: 0.45; cursor: not-allowed; }

      .m09-kpi-5 {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
      }
      .m09-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 10px;
        background: linear-gradient(180deg, rgba(12, 42, 92, 0.78), rgba(8, 28, 64, 0.84));
        border: 1px solid rgba(56, 189, 248, 0.32);
        box-shadow: var(--shadow-panel);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m09-kpi-card:hover { border-color: var(--cyan-bright); transform: translateY(-1px); }
      .m09-kpi-icon {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(14, 165, 233, 0.18);
        border: 1px solid rgba(56, 220, 255, 0.42);
        color: #38f2ff;
        flex-shrink: 0;
      }
      .m09-kpi-icon.gold { background: rgba(250, 204, 21, 0.14); border-color: rgba(250, 204, 21, 0.55); color: #facc15; }
      .m09-kpi-icon.green { background: rgba(34, 197, 94, 0.16); border-color: rgba(34, 197, 94, 0.55); color: #22c55e; }
      .m09-kpi-num { font-size: 22px; font-weight: 800; color: #38f2ff; font-variant-numeric: tabular-nums; line-height: 1.15; }
      .m09-kpi-num.gold { color: #facc15; }
      .m09-kpi-num.green { color: #22c55e; }
      .m09-kpi-num span { font-size: 12px; font-weight: 500; color: var(--text-sub); margin-left: 3px; }
      .m09-kpi-lbl { font-size: 12px; color: var(--text-sub); margin-bottom: 3px; }

      .m09-section-title {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 14px;
        font-weight: 700;
        color: #ffffff;
      }
      .m09-section-title small { font-weight: 500; color: var(--text-sub); font-size: 12px; }

      /* Split Grids */
      .m09-split-63-37 {
        display: grid;
        grid-template-columns: minmax(0, 1.68fr) minmax(0, 1fr);
        gap: 12px;
        align-items: start;
      }
      .m09-split-3col {
        display: grid;
        grid-template-columns: minmax(230px, 0.88fr) minmax(0, 1.85fr) minmax(270px, 1.18fr);
        gap: 12px;
        align-items: stretch;
      }

      /* Table rows selection & pagination */
      .m09-tr { cursor: pointer; transition: background 0.14s; }
      .m09-tr:hover { background: rgba(24, 78, 156, 0.35); }
      .m09-tr.selected { background: rgba(14, 116, 210, 0.28); outline: 1px solid rgba(56, 242, 255, 0.55); }
      .m09-pager {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        margin-top: 10px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m09-page-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.32);
        background: rgba(10, 34, 78, 0.72);
        color: #cfe6ff;
        cursor: pointer;
        font-size: 12px;
      }
      .m09-page-btn.active {
        background: #1677ff;
        border-color: #7dd3fc;
        color: #fff;
        font-weight: 700;
      }

      /* 6-Stage Stepper */
      .m09-stepper {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        margin-bottom: 8px;
      }
      .m09-step-box {
        padding: 9px 6px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(10, 34, 76, 0.65);
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 5px;
        font-size: 11.5px;
        color: #cfe6ff;
        text-align: center;
        position: relative;
      }
      .m09-step-box.done {
        border-color: rgba(34, 211, 238, 0.55);
        background: rgba(14, 88, 128, 0.38);
        color: #67e8f9;
      }
      .m09-step-box.active {
        border-color: #facc15;
        background: linear-gradient(180deg, rgba(168, 114, 12, 0.45), rgba(88, 56, 10, 0.55));
        color: #fef08a;
        font-weight: 700;
        box-shadow: 0 0 12px rgba(250, 204, 21, 0.28);
      }
      .m09-hint-box {
        padding: 7px 11px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.25);
        font-size: 12px;
        color: #bae6fd;
      }

      /* Form chips */
      .m09-chip-row { display: flex; flex-wrap: wrap; gap: 6px; margin: 6px 0 10px; }
      .m09-check-chip {
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.32);
        background: rgba(10, 36, 80, 0.68);
        color: #93c5fd;
        font-size: 11.5px;
        cursor: pointer;
      }
      .m09-check-chip.on {
        border-color: rgba(56, 242, 255, 0.72);
        background: rgba(14, 116, 184, 0.42);
        color: #e0f2fe;
        font-weight: 600;
      }
      .m09-form-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px;
      }
      .m09-form-item { display: flex; flex-direction: column; gap: 4px; }
      .m09-form-lbl { font-size: 11.5px; color: var(--text-sub); }

      /* Live Viewport & Telemetry */
      .m09-live-canvas-wrap {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: #041229;
      }
      .m09-live-canvas-wrap canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      .m09-telemetry-6 {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 8px;
        margin: 10px 0;
      }
      .m09-tel-card {
        padding: 8px 10px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.58);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m09-tel-k { font-size: 11px; color: var(--text-sub); }
      .m09-tel-v { font-size: 17px; font-weight: 800; color: #38f2ff; margin-top: 2px; font-variant-numeric: tabular-nums; }
      .m09-tel-v.green { color: #22c55e; }
      .m09-tel-v span { font-size: 11px; font-weight: 500; color: var(--text-sub); margin-left: 2px; }

      /* Clue / Report selectable cards */
      .m09-list-card {
        padding: 9px 11px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.24);
        background: rgba(12, 40, 88, 0.52);
        cursor: pointer;
        transition: all 0.16s;
        margin-bottom: 7px;
      }
      .m09-list-card:hover { border-color: rgba(56, 220, 255, 0.65); background: rgba(16, 58, 122, 0.65); }
      .m09-list-card.active {
        border-color: #38f2ff;
        background: linear-gradient(90deg, rgba(16, 92, 168, 0.52), rgba(10, 38, 86, 0.78));
        box-shadow: 0 0 12px rgba(56, 242, 255, 0.25);
      }

      /* White A4 Document Preview */
      .m09-a4-sheet {
        background: #f8fafc;
        color: #1e293b;
        border-radius: 6px;
        padding: 18px 22px;
        box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
        font-size: 12.5px;
        line-height: 1.55;
      }
      .m09-a4-title {
        text-align: center;
        font-size: 18px;
        font-weight: 800;
        color: #0f172a;
        margin: 6px 0 12px;
      }
      .m09-a4-meta {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 12px;
        font-size: 12px;
      }
      .m09-a4-meta td {
        border: 1px solid #cbd5e1;
        padding: 5px 8px;
      }
      .m09-a4-meta td.k {
        background: #f1f5f9;
        color: #475569;
        font-weight: 600;
        width: 82px;
      }
      .m09-a4-sec-h {
        font-size: 13.5px;
        font-weight: 800;
        color: #0f172a;
        margin: 10px 0 5px;
        border-left: 3px solid #0284c7;
        padding-left: 7px;
      }
      .m09-a4-note {
        margin-top: 10px;
        padding: 7px 10px;
        background: #e0f2fe;
        border: 1px solid #bae6fd;
        border-radius: 4px;
        color: #0369a1;
        font-size: 11.5px;
      }

      /* Layer popover */
      .m09-popover {
        position: absolute;
        top: 44px;
        right: 0;
        min-width: 170px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(8, 30, 70, 0.96);
        border: 1px solid var(--border-cyan-bright);
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        z-index: 30;
        display: flex;
        flex-direction: column;
        gap: 7px;
        font-size: 12px;
      }

      /* Responsive tweaks */
      @media (max-width: 1360px) {
        .m09-wp-ribbon { grid-template-columns: repeat(6, minmax(0, 1fr)); }
        .m09-telemetry-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m09-split-3col { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     CESIUM 3D ENTITIES & PROJECTED OVERLAY CLEANUP / SYNC
     ------------------------------------------------------------------------ */
  function stopTimers() {
    if (overviewDroneTimer) {
      clearInterval(overviewDroneTimer);
      overviewDroneTimer = null;
    }
    if (routePreviewTimer) {
      clearInterval(routePreviewTimer);
      routePreviewTimer = null;
    }
    ui.routes.previewing = false;
    if (liveRafId) {
      cancelAnimationFrame(liveRafId);
      liveRafId = null;
    }
    if (liveTickTimer) {
      clearInterval(liveTickTimer);
      liveTickTimer = null;
    }
    if (cameraFlyTimer) {
      clearTimeout(cameraFlyTimer);
      cameraFlyTimer = null;
    }
  }

  function cleanupCesium(restoreDefault) {
    if (cesiumPostRenderRemover) {
      try { cesiumPostRenderRemover(); } catch (e) {}
      cesiumPostRenderRemover = null;
    }
    if (cesiumClickHandler) {
      try { cesiumClickHandler.destroy(); } catch (e) {}
      cesiumClickHandler = null;
    }
    if (cesiumOverlayLayer && cesiumOverlayLayer.parentNode) {
      cesiumOverlayLayer.parentNode.removeChild(cesiumOverlayLayer);
    }
    cesiumOverlayLayer = null;
    cesiumHtmlPins = [];

    const ces = lastCtx && lastCtx.cesium;
    if (ces && ces.ready && ces.viewer) {
      cesiumEntities.forEach(ent => {
        try { ces.viewer.entities.remove(ent); } catch (e) {}
      });
      if (restoreDefault) {
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
    }
    cesiumEntities = [];
  }

  function getActiveTemplate() {
    return ui.routes.templates.find(t => t.id === ui.routes.selectedTplId) || ui.routes.templates[0];
  }

  function haversineKm(lon1, lat1, lon2, lat2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  }

  function recomputeTemplateLength(tpl) {
    let total = 0;
    for (let i = 0; i < tpl.waypoints.length - 1; i++) {
      const a = tpl.waypoints[i];
      const b = tpl.waypoints[i + 1];
      total += haversineKm(a.lon, a.lat, b.lon, b.lat);
    }
    if (tpl.waypoints.length > 2) {
      const first = tpl.waypoints[0];
      const last = tpl.waypoints[tpl.waypoints.length - 1];
      total += haversineKm(last.lon, last.lat, first.lon, first.lat);
    }
    tpl.lengthKm = Math.max(0.35, +total.toFixed(2));
  }

  function interpolateWaypoints(waypoints, floatIdx) {
    if (!waypoints || !waypoints.length) return { lon: 126.115, lat: 47.508, alt: 40 };
    const n = waypoints.length;
    const wrapped = ((floatIdx % n) + n) % n;
    const i0 = Math.floor(wrapped);
    const i1 = (i0 + 1) % n;
    const t = wrapped - i0;
    const a = waypoints[i0];
    const b = waypoints[i1];
    return {
      lon: a.lon + (b.lon - a.lon) * t,
      lat: a.lat + (b.lat - a.lat) * t,
      alt: (a.alt || 40) + ((b.alt || 40) - (a.alt || 40)) * t
    };
  }

  function syncCesiumProjection(viewer) {
    if (!viewer || !cesiumHtmlPins.length) return;
    const scene = viewer.scene;
    const w = scene.canvas.clientWidth || window.innerWidth;
    const h = scene.canvas.clientHeight || window.innerHeight;
    const toWin = Cesium.SceneTransforms.worldToWindowCoordinates || Cesium.SceneTransforms.wgs84ToWindowCoordinates;
    for (let i = 0; i < cesiumHtmlPins.length; i++) {
      const item = cesiumHtmlPins[i];
      const pt = toWin(scene, item.getCartesian ? item.getCartesian() : item.cartesian);
      if (pt && pt.x >= -140 && pt.x <= w + 140 && pt.y >= -100 && pt.y <= h + 100) {
        item.el.style.display = 'block';
        item.el.style.transform = `translate3d(${pt.x.toFixed(1)}px, ${pt.y.toFixed(1)}px, 0)`;
      } else {
        item.el.style.display = 'none';
      }
    }
  }

  function attachCesiumPinsContainer(hostEl) {
    if (cesiumOverlayLayer && cesiumOverlayLayer.parentNode) {
      cesiumOverlayLayer.parentNode.removeChild(cesiumOverlayLayer);
    }
    cesiumOverlayLayer = document.createElement('div');
    cesiumOverlayLayer.className = 'm09-cesium-pins';
    hostEl.appendChild(cesiumOverlayLayer);
    return cesiumOverlayLayer;
  }

  function flyCameraToBounds(ces, lon, lat, rangeMeters, pitchDeg, durationSec) {
    if (!ces || !ces.ready || !ces.viewer || !window.Cesium) return;
    if (typeof ces.viewer.camera.cancelFlight === 'function') {
      ces.viewer.camera.cancelFlight();
    }
    const target = Cesium.Cartesian3.fromDegrees(lon, lat, 220);
    ces.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, rangeMeters * 0.35), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(8), Cesium.Math.toRadians(pitchDeg || -42), rangeMeters),
      duration: durationSec !== undefined ? durationSec : 0.85
    });
  }

  function scheduleCameraFly(fn) {
    if (cameraFlyTimer) {
      clearTimeout(cameraFlyTimer);
      cameraFlyTimer = null;
    }
    fn();
    cameraFlyTimer = setTimeout(() => {
      cameraFlyTimer = null;
      fn();
    }, 60);
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 1: 01_巡检总览 (overview - interactive Cesium)
     ------------------------------------------------------------------------ */
  function setupOverviewCesium(hostEl, ctx) {
    cleanupCesium(false);
    const ces = ctx.cesium;
    if (!ces || !ces.ready || !ces.viewer || !window.Cesium) return;

    ces.applyLayers({
      satellite: true,
      uav: true,
      bim: false,
      pois: false,
      sections: false,
      route: true,
      designMode: false,
      activeSectionId: ui.overview.secId !== 'all' ? ui.overview.secId : ctx.state.activeSectionId
    });
    ces.syncHtmlOverlays({ showRoute: false, showSections: false, showPois: false });

    const viewer = ces.viewer;
    const pinsLayer = attachCesiumPinsContainer(hostEl);
    const tpl = ui.routes.templates[0]; // 料场示例A 12-waypoint loop
    const wps = tpl.waypoints;

    if (ui.overview.showRoutes) {
      // Flown track (01 -> 07)
      const flownDeg = [];
      for (let i = 0; i <= 6; i++) flownDeg.push(wps[i].lon, wps[i].lat);
      const flownEnt = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(flownDeg),
          width: 4.5,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#38f2ff')
          })
        }
      });
      // Planned dashed track (07 -> 12 -> 01)
      const planDeg = [];
      for (let i = 6; i < wps.length; i++) planDeg.push(wps[i].lon, wps[i].lat);
      planDeg.push(wps[0].lon, wps[0].lat);
      const planEnt = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(planDeg),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#e2e8f0').withAlpha(0.92),
            dashLength: 14
          })
        }
      });
      // Highway inspection corridor dashed feeder from 保通示例段 -> 桥梁示例A -> 料场示例A -> 路基示例段
      const corridorEnt = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray([
            125.9150, 47.3620,
            125.9820, 47.4520,
            126.1150, 47.5080,
            125.9920, 47.6520
          ]),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#22d3ee').withAlpha(0.85),
            dashLength: 12
          })
        }
      });
      cesiumEntities.push(flownEnt, planEnt, corridorEnt);

      // Animated drone entity on Cesium
      const droneEnt = viewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          const p = interpolateWaypoints(wps, ui.overview.droneWpIdx);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }, false),
        point: {
          pixelSize: 12,
          color: Cesium.Color.fromCssColorString('#38f2ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      cesiumEntities.push(droneEnt);

      // Projected HTML pill for live drone
      const droneEl = document.createElement('div');
      droneEl.className = 'm09-pin-anchor';
      droneEl.innerHTML = `
        <div class="m09-map-pin">
          <div class="m09-map-pill" style="border-color:#38f2ff;background:rgba(10,48,108,0.95);">
            ${SVG.drone}<span>无人机A01 · 执行中</span>
          </div>
          <div class="m09-map-stem"></div>
        </div>
      `;
      droneEl.addEventListener('click', () => {
        ctx.switchModule('uav', 'live');
      });
      pinsLayer.appendChild(droneEl);
      cesiumHtmlPins.push({
        el: droneEl,
        getCartesian: () => {
          const p = interpolateWaypoints(wps, ui.overview.droneWpIdx);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }
      });
    }

    if (ui.overview.showHangars) {
      const filteredHangars = HANGARS.filter(h => ui.overview.secId === 'all' || h.secId === ui.overview.secId);
      filteredHangars.forEach(h => {
        const hEnt = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, h.alt),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString('#22c55e'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        cesiumEntities.push(hEnt);

        const el = document.createElement('div');
        el.className = 'm09-pin-anchor';
        el.innerHTML = `
          <div class="m09-map-pin">
            <div class="m09-map-pill green">${SVG.hangar}<span>${h.name}</span></div>
            <div class="m09-map-stem" style="background:#22c55e;"></div>
          </div>
        `;
        el.addEventListener('click', () => openHangarModal(h, ctx));
        pinsLayer.appendChild(el);
        cesiumHtmlPins.push({ el, cartesian: Cesium.Cartesian3.fromDegrees(h.lon, h.lat, h.alt) });
      });
    }

    if (ui.overview.showPois) {
      const filteredPois = MAP_POIS.filter(p =>
        (ui.overview.secId === 'all' || p.secId === ui.overview.secId) &&
        (ui.overview.scene === '全部场景' || p.scene === ui.overview.scene)
      );
      filteredPois.forEach(poi => {
        const pEnt = viewer.entities.add({
          position: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, poi.alt),
          point: {
            pixelSize: 10,
            color: Cesium.Color.fromCssColorString(poi.gold ? '#facc15' : '#38f2ff'),
            outlineColor: Cesium.Color.WHITE,
            outlineWidth: 2,
            disableDepthTestDistance: Number.POSITIVE_INFINITY
          }
        });
        cesiumEntities.push(pEnt);

        const el = document.createElement('div');
        el.className = 'm09-pin-anchor';
        el.innerHTML = `
          <div class="m09-map-pin">
            <div class="m09-map-pill ${poi.gold ? 'gold' : ''}">${SVG.pin}<span>${poi.name}</span></div>
            <div class="m09-map-stem" style="${poi.gold ? 'background:#facc15;' : ''}"></div>
          </div>
        `;
        el.addEventListener('click', () => openPoiModal(poi, ctx));
        pinsLayer.appendChild(el);
        cesiumHtmlPins.push({ el, cartesian: Cesium.Cartesian3.fromDegrees(poi.lon, poi.lat, poi.alt) });
      });
    }

    cesiumPostRenderRemover = viewer.scene.postRender.addEventListener(() => syncCesiumProjection(viewer));
    syncCesiumProjection(viewer);
  }

  function openPoiModal(poi, ctx) {
    ctx.openModal(`巡检点位详情 · ${poi.name}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区</span><strong>${secLabel(poi.secId)}</strong></div>
        <div class="detail-stat-card"><span>巡检场景</span><strong>${poi.scene}</strong></div>
        <div class="detail-stat-card"><span>经纬度坐标</span><strong>${poi.lon.toFixed(4)}, ${poi.lat.toFixed(4)}</strong></div>
      </div>
      <div style="padding:10px 12px;border-radius:8px;background:rgba(12,42,92,0.55);border:1px solid rgba(56,189,248,0.25);font-size:13px;color:#e6f2ff;margin-bottom:12px;">
        ${poi.desc}
      </div>
      <div style="display:flex;justify-content:flex-end;gap:8px;">
        <button class="m09-btn" id="m09PoiToRoutes">查看规划航线</button>
        <button class="m09-btn primary" id="m09PoiToLive">进入实时巡检</button>
      </div>
    `);
    setTimeout(() => {
      document.getElementById('m09PoiToRoutes')?.addEventListener('click', () => { ctx.closeModal(); ctx.switchModule('uav', 'routes'); });
      document.getElementById('m09PoiToLive')?.addEventListener('click', () => { ctx.closeModal(); ctx.switchModule('uav', 'live'); });
    }, 0);
  }

  function openHangarModal(h, ctx) {
    ctx.openModal(`机巢运行状态 · ${h.name}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区</span><strong>${secLabel(h.secId)}</strong></div>
        <div class="detail-stat-card"><span>在线状态</span><strong style="color:#22c55e;">${h.status}</strong></div>
        <div class="detail-stat-card"><span>舱内温度</span><strong>${h.temp}</strong></div>
      </div>
      <div class="meta-table">
        <div class="meta-row"><span class="meta-key">备电状态</span><span class="meta-val">${h.batterySlot}</span></div>
        <div class="meta-row"><span class="meta-key">部署坐标</span><span class="meta-val">${h.lon.toFixed(4)}, ${h.lat.toFixed(4)}</span></div>
      </div>
    `);
  }

  function openFleetModal(ctx) {
    ctx.openModal('无人机与机巢在线监控台账', `
      <table class="data-table" style="margin-bottom:12px;">
        <thead><tr><th>设备编号</th><th>设备型号</th><th>归属工区</th><th>配属机巢</th><th>电量</th><th>状态</th></tr></thead>
        <tbody>
          ${FLEET.map(f => `
            <tr>
              <td style="font-weight:700;color:#fff;">${f.name}</td>
              <td>${f.model}</td>
              <td>${secLabel(f.secId)}</td>
              <td>${f.hangar}</td>
              <td>${f.battery}%</td>
              <td><span class="status-tag ${f.status === '执行中' ? 'info' : f.status === '待命' ? 'ok' : 'warn'}">${f.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
      <table class="data-table">
        <thead><tr><th>机巢名称</th><th>归属工区</th><th>舱温</th><th>备电状态</th><th>通信状态</th></tr></thead>
        <tbody>
          ${HANGARS.map(h => `
            <tr>
              <td style="font-weight:700;color:#fff;">${h.name}</td>
              <td>${secLabel(h.secId)}</td>
              <td>${h.temp}</td>
              <td>${h.batterySlot}</td>
              <td><span class="status-tag ok">${h.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
  }

  function renderOverview(hostEl, ctx) {
    const s = ui.overview;
    const tasksPool = ui.tasks.list.filter(t => s.secId === 'all' || t.secId === s.secId);
    const totalCount = tasksPool.length;
    const doneCount = tasksPool.filter(t => t.status === '已完成').length;
    const doingCount = tasksPool.filter(t => t.status === '执行中').length;
    const todoCount = tasksPool.filter(t => t.status === '待执行').length;
    const pendingOrgCount = tasksPool.filter(t => t.status === '待整理').length;

    const cluesPool = ui.hazards.clues.filter(c => s.secId === 'all' || c.secId === s.secId);
    const pendingClues = cluesPool.filter(c => c.status === '待核查').length;
    const confirmedHazards = cluesPool.filter(c => c.status === '已确认隐患').length;
    const recheckCount = ui.reports.list.filter(r => (s.secId === 'all' || r.secId === s.secId) && r.status === '待复查').length;
    const closedCount = Math.max(1, Math.round(confirmedHazards * 0.6));

    const onlineUav = FLEET.filter(f => (s.secId === 'all' || f.secId === s.secId) && f.status !== '离线维护').length;
    const totalUav = FLEET.filter(f => s.secId === 'all' || f.secId === s.secId).length;
    const onlineHangar = HANGARS.filter(h => s.secId === 'all' || h.secId === s.secId).length;

    const activeMission = ui.tasks.list.find(t => t.status === '执行中') || ui.tasks.list[1];
    const wpDone = Math.min(12, Math.max(1, Math.floor(ui.live.wpFloat) + 1));
    const wpPct = Math.round((wpDone / 12) * 100);
    const recent3 = tasksPool.slice(0, 3);

    hostEl.innerHTML = `
      <div class="m09-map-stage">
        <!-- Top Floating Filter & Layer Bar -->
        <div class="m09-map-topbar">
          <div class="m09-map-bar-left">
            <select class="m09-select" id="m09OvSec">
              <option value="all" ${s.secId === 'all' ? 'selected' : ''}>全部工区</option>
              ${SECTIONS.map(sec => `<option value="${sec.id}" ${s.secId === sec.id ? 'selected' : ''}>${sec.name}</option>`).join('')}
            </select>
            <select class="m09-select" id="m09OvPeriod">
              <option value="2026年11月" ${s.period === '2026年11月' ? 'selected' : ''}>2026年11月</option>
              <option value="2026年10月" ${s.period === '2026年10月' ? 'selected' : ''}>2026年10月</option>
            </select>
            <select class="m09-select" id="m09OvScene">
              <option value="全部场景" ${s.scene === '全部场景' ? 'selected' : ''}>全部场景</option>
              <option value="料场巡检" ${s.scene === '料场巡检' ? 'selected' : ''}>料场巡检</option>
              <option value="施工保通" ${s.scene === '施工保通' ? 'selected' : ''}>施工保通</option>
              <option value="桥梁专项" ${s.scene === '桥梁专项' ? 'selected' : ''}>桥梁专项</option>
              <option value="路基边坡" ${s.scene === '路基边坡' ? 'selected' : ''}>路基边坡</option>
            </select>
          </div>
          <div class="m09-map-bar-right" style="font-size:12px;color:#dbeafe;">
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="m09OvLayerRoutes" ${s.showRoutes ? 'checked' : ''} style="accent-color:#22d3ee;" /> 航线
            </label>
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="m09OvLayerHangars" ${s.showHangars ? 'checked' : ''} style="accent-color:#22d3ee;" /> 机巢
            </label>
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="m09OvLayerPois" ${s.showPois ? 'checked' : ''} style="accent-color:#22d3ee;" /> 工程点位
            </label>
            <button class="m09-btn" id="m09OvFullView" style="padding:4px 10px;">${SVG.target} 全线视图</button>
          </div>
        </div>

        <!-- Left HUD Column -->
        <div class="hud-left-col" style="width:264px;">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">巡检任务</span></div>
              <span class="panel-subtitle">11月</span>
            </div>
            <div class="panel-body">
              <div class="m09-kpi-2x2">
                <div class="m09-kpi-mini" data-ov-task-st="全部状态">
                  <div class="m09-kpi-mini-lbl">本期任务</div>
                  <div class="m09-kpi-mini-val">${totalCount}<span>项</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-task-st="已完成">
                  <div class="m09-kpi-mini-lbl">已完成</div>
                  <div class="m09-kpi-mini-val green">${doneCount}<span>项</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-task-st="执行中">
                  <div class="m09-kpi-mini-lbl">执行中</div>
                  <div class="m09-kpi-mini-val">${doingCount}<span>项</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-task-st="待执行">
                  <div class="m09-kpi-mini-lbl">待执行</div>
                  <div class="m09-kpi-mini-val gold">${todoCount}<span>项</span></div>
                </div>
              </div>
              <div class="m09-panel-foot">
                <span>待整理 ${pendingOrgCount} 项</span>
                <button class="m09-link-btn" id="m09OvGoTasks">查看任务 ${SVG.chevronR}</button>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">设备状态</span></div>
            </div>
            <div class="panel-body" style="cursor:pointer;" id="m09OvFleetCard" title="点击查看无人机与机巢详细台账">
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.drone} 无人机在线</span><span class="m09-kv-v">${onlineUav} / ${totalUav} 架</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.hangar} 机巢在线</span><span class="m09-kv-v">${onlineHangar} / ${onlineHangar} 座</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.signal} 在线设备通信</span><span class="m09-kv-v" style="color:#22c55e;">正常</span></div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">重点对象覆盖</span></div>
              <span class="panel-subtitle">18 / 24 处</span>
            </div>
            <div class="panel-body">
              ${COVERAGE_ITEMS.map(item => {
                const pct = Math.round((item.done / item.total) * 100);
                return `
                  <div class="m09-cov-row" data-ov-scene="${item.scene}">
                    <div class="m09-cov-top"><span>${item.name}</span><strong style="color:#fff;">${item.done} / ${item.total}</strong></div>
                    <div class="m09-cov-track"><div class="m09-cov-fill" style="width:${pct}%;"></div></div>
                  </div>
                `;
              }).join('')}
            </div>
          </div>
        </div>

        <!-- Right HUD Column -->
        <div class="hud-right-col" style="width:282px;">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">实时任务</span></div>
            </div>
            <div class="panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;">
                <strong style="font-size:14.5px;color:#fff;">${escapeHtml(activeMission.name)}</strong>
                <span class="status-tag info">执行中</span>
              </div>
              <div style="font-size:11.5px;color:var(--text-muted);margin:3px 0 8px;">${activeMission.id}</div>
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.pin} 巡检对象</span><span class="m09-kv-v">${secLabel(activeMission.secId)}·${activeMission.target}</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.drone} 执行设备</span><span class="m09-kv-v">${activeMission.uav}</span></div>
              <div class="m09-kv-row" style="border-bottom:none;"><span class="m09-kv-k">${SVG.route} 已到达航点</span><span class="m09-kv-v">${wpDone} / 12</span></div>
              <div class="m09-cov-track" style="margin:4px 0 8px;"><div class="m09-cov-fill" style="width:${wpPct}%;"></div></div>
              <div class="m09-panel-foot" style="justify-content:flex-end;">
                <button class="m09-link-btn" id="m09OvGoLive">进入实时巡检 ${SVG.chevronR}</button>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">隐患统计</span></div>
            </div>
            <div class="panel-body">
              <div class="m09-kpi-2x2">
                <div class="m09-kpi-mini" data-ov-hazard-st="待核查">
                  <div class="m09-kpi-mini-lbl">待核查线索</div>
                  <div class="m09-kpi-mini-val gold">${pendingClues}<span>条</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-hazard-st="已确认隐患">
                  <div class="m09-kpi-mini-lbl">已确认隐患</div>
                  <div class="m09-kpi-mini-val">${confirmedHazards}<span>项</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-hazard-st="全部状态">
                  <div class="m09-kpi-mini-lbl">待复查</div>
                  <div class="m09-kpi-mini-val gold">${recheckCount}<span>项</span></div>
                </div>
                <div class="m09-kpi-mini" data-ov-hazard-st="全部状态">
                  <div class="m09-kpi-mini-lbl">已销项</div>
                  <div class="m09-kpi-mini-val">${closedCount}<span>项</span></div>
                </div>
              </div>
              <div class="m09-panel-foot">
                <span>整改中 ${recheckCount} 项</span>
                <button class="m09-link-btn" id="m09OvGoHazards">查看隐患识别 ${SVG.chevronR}</button>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">近期巡检记录</span></div>
            </div>
            <div class="panel-body" style="padding-top:6px;">
              ${recent3.map(r => `
                <div class="m09-kv-row" data-ov-rec="${r.id}" style="cursor:pointer;">
                  <div>
                    <div style="font-size:12.5px;font-weight:600;color:#eaf4ff;">${escapeHtml(r.name)}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${r.shortTime} &nbsp; ${secLabel(r.secId)}</div>
                  </div>
                  <span class="status-tag ${statusTagClass(r.status)}">${r.status}</span>
                </div>
              `).join('')}
            </div>
          </div>
        </div>

        <!-- Map Zoom Controls -->
        <div class="m09-map-zoom">
          <div class="zoom-pill vertical">
            <button class="zoom-btn" id="m09OvZoomIn" title="放大">+</button>
            <button class="zoom-btn" id="m09OvZoomOut" title="缩小">−</button>
            <button class="zoom-btn" id="m09OvLocate" title="定位重点巡检区">${SVG.target}</button>
          </div>
        </div>

        <!-- Bottom Legend Strip -->
        <div class="m09-map-legend">
          <div class="m09-legend-items">
            <span class="m09-legend-item"><span class="m09-line-solid"></span> 已飞航迹</span>
            <span class="m09-legend-item"><span class="m09-line-dash"></span> 规划航线</span>
          </div>
          <span>明水至北安段·地图与点位示意</span>
          <span>⊕ 北</span>
        </div>
      </div>
    `;

    setupOverviewCesium(hostEl, ctx);

    // Start gentle overview drone flight along loop
    if (!overviewDroneTimer) {
      overviewDroneTimer = setInterval(() => {
        if (lastSubPageId !== 'overview') return;
        ui.overview.droneWpIdx = (ui.overview.droneWpIdx + 0.08) % 12;
      }, 240);
    }

    // Bind events
    hostEl.querySelector('#m09OvSec').addEventListener('change', e => {
      ui.overview.secId = e.target.value;
      if (ui.overview.secId === 'all') {
        flyCameraToBounds(ctx.cesium, 126.1150, 47.5080, 1800, -42);
      } else if (ctx.cesium && ctx.cesium.ready) {
        ctx.cesium.flyToSection(ui.overview.secId);
      }
      renderOverview(hostEl, ctx);
    });
    hostEl.querySelector('#m09OvPeriod').addEventListener('change', e => {
      ui.overview.period = e.target.value;
      ctx.showToast(`已切换统计周期：${ui.overview.period}`);
    });
    hostEl.querySelector('#m09OvScene').addEventListener('change', e => {
      ui.overview.scene = e.target.value;
      renderOverview(hostEl, ctx);
    });
    hostEl.querySelector('#m09OvLayerRoutes').addEventListener('change', e => {
      ui.overview.showRoutes = e.target.checked;
      setupOverviewCesium(hostEl, ctx);
    });
    hostEl.querySelector('#m09OvLayerHangars').addEventListener('change', e => {
      ui.overview.showHangars = e.target.checked;
      setupOverviewCesium(hostEl, ctx);
    });
    hostEl.querySelector('#m09OvLayerPois').addEventListener('change', e => {
      ui.overview.showPois = e.target.checked;
      setupOverviewCesium(hostEl, ctx);
    });
    hostEl.querySelector('#m09OvFullView').addEventListener('click', () => {
      ui.overview.secId = 'all';
      ui.overview.scene = '全部场景';
      if (ctx.cesium && ctx.cesium.ready) ctx.cesium.flyToOverview(1.2);
      renderOverview(hostEl, ctx);
      ctx.showToast('已恢复全线三维视图');
    });
    hostEl.querySelector('#m09OvZoomIn').addEventListener('click', () => ctx.cesium?.zoomIn());
    hostEl.querySelector('#m09OvZoomOut').addEventListener('click', () => ctx.cesium?.zoomOut());
    hostEl.querySelector('#m09OvLocate').addEventListener('click', () => {
      flyCameraToBounds(ctx.cesium, 126.1150, 47.5080, 1600, -44);
      ctx.showToast('已定位至二工区·料场示例A巡检区');
    });

    hostEl.querySelector('#m09OvGoTasks').addEventListener('click', () => ctx.switchModule('uav', 'tasks'));
    hostEl.querySelector('#m09OvGoLive').addEventListener('click', () => ctx.switchModule('uav', 'live'));
    hostEl.querySelector('#m09OvGoHazards').addEventListener('click', () => ctx.switchModule('uav', 'hazards'));
    hostEl.querySelector('#m09OvFleetCard').addEventListener('click', () => openFleetModal(ctx));

    hostEl.querySelectorAll('[data-ov-task-st]').forEach(el => {
      el.addEventListener('click', () => {
        ui.tasks.status = el.dataset.ovTaskSt;
        ui.tasks.page = 1;
        ctx.switchModule('uav', 'tasks');
      });
    });
    hostEl.querySelectorAll('[data-ov-hazard-st]').forEach(el => {
      el.addEventListener('click', () => {
        ui.hazards.status = el.dataset.ovHazardSt;
        ctx.switchModule('uav', 'hazards');
      });
    });
    hostEl.querySelectorAll('[data-ov-scene]').forEach(el => {
      el.addEventListener('click', () => {
        const sc = el.dataset.ovScene;
        ui.overview.scene = ui.overview.scene === sc ? '全部场景' : sc;
        const matchPoi = MAP_POIS.find(p => p.scene === sc);
        if (matchPoi) flyCameraToBounds(ctx.cesium, matchPoi.lon, matchPoi.lat, 1800, -40);
        renderOverview(hostEl, ctx);
      });
    });
    hostEl.querySelectorAll('[data-ov-rec]').forEach(el => {
      el.addEventListener('click', () => {
        const task = ui.tasks.list.find(t => t.id === el.dataset.ovRec);
        if (!task) return;
        ui.tasks.selectedId = task.id;
        ctx.openModal(`巡检记录详情 · ${task.id}`, `
          <div class="detail-grid">
            <div class="detail-stat-card"><span>巡检任务</span><strong>${escapeHtml(task.name)}</strong></div>
            <div class="detail-stat-card"><span>工区与对象</span><strong>${secLabel(task.secId)}·${escapeHtml(task.target)}</strong></div>
            <div class="detail-stat-card"><span>当前状态</span><strong>${task.status}</strong></div>
          </div>
          <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
            <button class="m09-btn" id="m09OvModalTask">查看任务详情</button>
            <button class="m09-btn primary" id="m09OvModalJump">${task.status === '执行中' ? '进入实时监控' : '查看巡检报告'}</button>
          </div>
        `);
        setTimeout(() => {
          document.getElementById('m09OvModalTask')?.addEventListener('click', () => { ctx.closeModal(); ctx.switchModule('uav', 'tasks'); });
          document.getElementById('m09OvModalJump')?.addEventListener('click', () => {
            ctx.closeModal();
            ctx.switchModule('uav', task.status === '执行中' ? 'live' : 'reports');
          });
        }, 0);
      });
    });
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 2: 02_巡检任务 (tasks - opaque)
     ------------------------------------------------------------------------ */
  function renderTasks(hostEl, ctx) {
    const tState = ui.tasks;
    const filtered = tState.list.filter(t => {
      if (tState.secId !== 'all' && t.secId !== tState.secId) return false;
      if (tState.type !== '全部类型' && t.type !== tState.type) return false;
      if (tState.status !== '全部状态' && t.status !== tState.status) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / tState.pageSize));
    if (tState.page > totalPages) tState.page = totalPages;
    const slice = filtered.slice((tState.page - 1) * tState.pageSize, tState.page * tState.pageSize);

    let selTask = tState.list.find(t => t.id === tState.selectedId) || slice[0] || tState.list[0];
    if (selTask) tState.selectedId = selTask.id;

    // KPI counts from entire month pool (or section-filtered if top section active)
    const kpiPool = tState.list.filter(t => tState.secId === 'all' || t.secId === tState.secId);
    const kpiTotal = kpiPool.length;
    const kpiTodo = kpiPool.filter(t => t.status === '待执行').length;
    const kpiDoing = kpiPool.filter(t => t.status === '执行中').length;
    const kpiPending = kpiPool.filter(t => t.status === '待整理').length;
    const kpiDone = kpiPool.filter(t => t.status === '已完成').length;

    const stages = [
      { idx: 1, name: '任务配置', icon: SVG.doc },
      { idx: 2, name: '航线规划', icon: SVG.route },
      { idx: 3, name: '飞行前检查', icon: SVG.shield },
      { idx: 4, name: '执行巡检与取证', icon: SVG.drone },
      { idx: 5, name: '识别与人工核查', icon: SVG.search },
      { idx: 6, name: '复查与报告归档', icon: SVG.save }
    ];

    const activeStage = selTask ? (selTask.status === '已完成' ? 6 : selTask.status === '待整理' ? 5 : selTask.status === '执行中' ? 4 : selTask.preflightPassed ? 4 : 3) : 3;

    hostEl.innerHTML = `
      <div class="m09-opaque-page">
        <!-- Top Filter Bar -->
        <div class="m09-filter-bar">
          <div class="m09-filter-group">
            <label class="m09-field-inline">所属工区
              <select class="m09-select" id="m09TkSec">
                <option value="all" ${tState.secId === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTIONS.map(sec => `<option value="${sec.id}" ${tState.secId === sec.id ? 'selected' : ''}>${sec.name}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">巡检类型
              <select class="m09-select" id="m09TkType">
                ${['全部类型', '专项', '全面', '应急'].map(v => `<option value="${v}" ${tState.type === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">任务状态
              <select class="m09-select" id="m09TkStatus">
                ${['全部状态', '待执行', '执行中', '待整理', '已完成'].map(v => `<option value="${v}" ${tState.status === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">统计周期
              <select class="m09-select" id="m09TkPeriod">
                <option value="2026年11月" selected>2026年11月</option>
                <option value="2026年10月">2026年10月</option>
              </select>
            </label>
          </div>
          <div class="m09-filter-group">
            <button class="m09-btn primary" id="m09TkQuery">${SVG.search} 查询</button>
            <button class="m09-btn" id="m09TkReset">${SVG.reset} 重置</button>
            <button class="m09-btn" id="m09TkNew">+ 新建巡检任务</button>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="m09-section-title"><span class="panel-accent-bar"></span> 任务执行概况 <small>(${tState.period})</small></div>
        <div class="m09-kpi-5">
          <div class="m09-kpi-card" data-tk-kpi="全部状态">
            <div class="m09-kpi-icon">${SVG.doc}</div>
            <div><div class="m09-kpi-lbl">本期任务</div><div class="m09-kpi-num">${kpiTotal}<span>项</span></div></div>
          </div>
          <div class="m09-kpi-card" data-tk-kpi="待执行">
            <div class="m09-kpi-icon gold">${SVG.calendar}</div>
            <div><div class="m09-kpi-lbl">待执行</div><div class="m09-kpi-num gold">${kpiTodo}<span>项</span></div></div>
          </div>
          <div class="m09-kpi-card" data-tk-kpi="执行中">
            <div class="m09-kpi-icon">${SVG.drone}</div>
            <div><div class="m09-kpi-lbl">执行中</div><div class="m09-kpi-num">${kpiDoing}<span>项</span></div></div>
          </div>
          <div class="m09-kpi-card" data-tk-kpi="待整理">
            <div class="m09-kpi-icon">${SVG.doc}</div>
            <div><div class="m09-kpi-lbl">待整理</div><div class="m09-kpi-num">${kpiPending}<span>项</span></div></div>
          </div>
          <div class="m09-kpi-card" data-tk-kpi="已完成">
            <div class="m09-kpi-icon green">${SVG.check}</div>
            <div><div class="m09-kpi-lbl">已完成</div><div class="m09-kpi-num green">${kpiDone}<span>项</span></div></div>
          </div>
        </div>

        <!-- Lower 2-Column Split -->
        <div class="m09-split-63-37">
          <div style="display:flex;flex-direction:column;gap:11px;">
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">任务列表</span></div>
                <button class="m09-link-btn" id="m09TkCalendar">日历视图 ${SVG.calendar}</button>
              </div>
              <div class="panel-body">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>任务编号</th><th>巡检任务</th><th>工区与巡检对象</th><th>类型</th><th>计划时间</th><th>状态</th><th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${slice.map(t => {
                      const isSel = selTask && selTask.id === t.id;
                      const actLbl = t.status === '待执行' ? '编辑' : t.status === '执行中' ? '监控' : '查看';
                      return `
                        <tr class="m09-tr ${isSel ? 'selected' : ''}" data-tk-row="${t.id}">
                          <td style="font-weight:700;color:#eaf4ff;">${t.id}</td>
                          <td style="font-weight:600;color:#fff;">${escapeHtml(t.name)}</td>
                          <td><div style="font-weight:600;">${secLabel(t.secId)}</div><div style="font-size:11px;color:var(--text-muted);">${escapeHtml(t.target)}</div></td>
                          <td>${t.type}</td>
                          <td style="font-variant-numeric:tabular-nums;">${t.shortTime}</td>
                          <td><span class="status-tag ${statusTagClass(t.status)}">${t.status}</span></td>
                          <td><button class="m09-link-btn" data-tk-act="${t.id}" data-tk-mode="${actLbl}">${actLbl}</button></td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
                <div class="m09-pager">
                  <span style="margin-right:4px;">共 ${total} 项任务</span>
                  <button class="m09-page-btn" id="m09TkPrev">&lt;</button>
                  ${Array.from({ length: totalPages }, (_, i) => i + 1).map(p => `
                    <button class="m09-page-btn ${p === tState.page ? 'active' : ''}" data-tk-page="${p}">${p}</button>
                  `).join('')}
                  <button class="m09-page-btn" id="m09TkNext">&gt;</button>
                </div>
              </div>
            </div>

            <!-- 6-stage stepper -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">任务执行流程</span></div>
                <span class="panel-subtitle">${selTask ? selTask.id : ''}</span>
              </div>
              <div class="panel-body">
                <div class="m09-stepper">
                  ${stages.map(st => {
                    const cls = st.idx < activeStage ? 'done' : st.idx === activeStage ? 'active' : '';
                    return `<div class="m09-step-box ${cls}">${st.icon}<span>${st.name}</span></div>`;
                  }).join('')}
                </div>
                <div class="m09-hint-box">ⓘ 飞前检查包括设备、通信、气象、现场条件及授权核验。</div>
              </div>
            </div>
          </div>

          <!-- Right Inspector: 任务详情与配置 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">任务详情与配置</span></div>
            </div>
            <div class="panel-body">
              ${selTask ? `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:10px;">
                  <strong style="font-size:15px;color:#fff;">${selTask.id}</strong>
                  <span class="status-tag ${statusTagClass(selTask.status)}">${selTask.status}</span>
                </div>
                <div class="m09-form-item" style="margin-bottom:8px;">
                  <span class="m09-form-lbl">任务名称</span>
                  <input class="m09-input" id="m09CfgName" value="${escapeHtml(selTask.name)}" />
                </div>
                <div class="m09-form-grid-2">
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">所属工区</span>
                    <select class="m09-select" id="m09CfgSec">
                      ${SECTIONS.map(sec => `<option value="${sec.id}" ${selTask.secId === sec.id ? 'selected' : ''}>${sec.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">巡检对象</span>
                    <input class="m09-input" id="m09CfgTarget" value="${escapeHtml(selTask.target)}" />
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">巡检类型</span>
                    <select class="m09-select" id="m09CfgType">
                      ${['专项', '全面', '应急'].map(v => `<option value="${v}" ${selTask.type === v ? 'selected' : ''}>${v}巡检</option>`).join('')}
                    </select>
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">计划执行</span>
                    <input class="m09-input" id="m09CfgTime" value="${escapeHtml(selTask.planTime)}" />
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">执行设备</span>
                    <select class="m09-select" id="m09CfgUav">
                      ${FLEET.filter(f => f.status !== '离线维护').map(f => `<option value="${f.name}" ${selTask.uav === f.name ? 'selected' : ''}>${f.name}</option>`).join('')}
                    </select>
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">巡检负责人</span>
                    <select class="m09-select" id="m09CfgOwner">
                      ${['巡检员A（演示）', '巡检员B（演示）', '巡检员C（演示）', '巡检员D（演示）'].map(o => `<option value="${o}" ${selTask.owner === o ? 'selected' : ''}>${o}</option>`).join('')}
                    </select>
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">关联航线</span>
                    <select class="m09-select" id="m09CfgRoute">
                      ${['BT-A V1.3', 'LC-A V2.0', 'QL-A V1.1', 'LJ-C V1.0'].map(r => `<option value="${r}" ${selTask.routeCode === r ? 'selected' : ''}>${r}</option>`).join('')}
                    </select>
                  </div>
                  <div class="m09-form-item">
                    <span class="m09-form-lbl">机巢</span>
                    <select class="m09-select" id="m09CfgHangar">
                      ${HANGARS.map(h => `<option value="${h.name}" ${selTask.hangar === h.name ? 'selected' : ''}>${h.name}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div style="display:flex;justify-content:space-between;align-items:center;margin-top:10px;">
                  <span class="m09-form-lbl">检查内容</span>
                  <span style="font-size:11.5px;color:var(--text-muted);">${selTask.scene}</span>
                </div>
                <div class="m09-chip-row">
                  ${selTask.allChecks.map(ch => {
                    const on = selTask.checks.includes(ch);
                    return `<button type="button" class="m09-check-chip ${on ? 'on' : ''}" data-tk-chip="${ch}">${on ? '✓ ' : ''}${ch}</button>`;
                  }).join('')}
                </div>
                <div class="m09-hint-box" style="margin-bottom:10px;${selTask.preflightPassed ? 'border-color:rgba(34,197,94,0.55);color:#bbf7d0;' : ''}">
                  ${selTask.preflightPassed
                    ? (selTask.status === '执行中' ? '✓ 任务已下发执行中，可点击列表「监控」进入实时画面。' : '✓ 飞前检查已通过，已解锁「下发任务」。')
                    : 'ⓘ 航线已审核，飞行前检查待完成。'}
                </div>
                <div style="display:grid;grid-template-columns:1fr 1.15fr 1fr;gap:7px;">
                  <button class="m09-btn" id="m09TkSave">${SVG.save} 保存计划</button>
                  <button class="m09-btn primary" id="m09TkPreflight">${SVG.shield} 去飞前检查</button>
                  <button class="m09-btn ${selTask.preflightPassed && selTask.status === '待执行' ? 'gold' : ''}" id="m09TkDispatch" ${!selTask.preflightPassed || selTask.status !== '待执行' ? 'disabled' : ''}>${SVG.lock} 下发任务</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Filter events
    hostEl.querySelector('#m09TkSec').addEventListener('change', e => { tState.secId = e.target.value; tState.page = 1; renderTasks(hostEl, ctx); });
    hostEl.querySelector('#m09TkType').addEventListener('change', e => { tState.type = e.target.value; tState.page = 1; renderTasks(hostEl, ctx); });
    hostEl.querySelector('#m09TkStatus').addEventListener('change', e => { tState.status = e.target.value; tState.page = 1; renderTasks(hostEl, ctx); });
    hostEl.querySelector('#m09TkQuery').addEventListener('click', () => { renderTasks(hostEl, ctx); ctx.showToast(`已筛选出 ${total} 项巡检任务`); });
    hostEl.querySelector('#m09TkReset').addEventListener('click', () => {
      tState.secId = 'all'; tState.type = '全部类型'; tState.status = '全部状态'; tState.page = 1;
      renderTasks(hostEl, ctx);
    });
    hostEl.querySelectorAll('[data-tk-kpi]').forEach(el => {
      el.addEventListener('click', () => {
        tState.status = el.dataset.tkKpi;
        tState.page = 1;
        renderTasks(hostEl, ctx);
      });
    });

    // Pagination & row select
    hostEl.querySelector('#m09TkPrev').addEventListener('click', () => { if (tState.page > 1) { tState.page--; renderTasks(hostEl, ctx); } });
    hostEl.querySelector('#m09TkNext').addEventListener('click', () => { if (tState.page < totalPages) { tState.page++; renderTasks(hostEl, ctx); } });
    hostEl.querySelectorAll('[data-tk-page]').forEach(b => b.addEventListener('click', () => { tState.page = Number(b.dataset.tkPage); renderTasks(hostEl, ctx); }));
    hostEl.querySelectorAll('[data-tk-row]').forEach(tr => tr.addEventListener('click', () => {
      tState.selectedId = tr.dataset.tkRow;
      renderTasks(hostEl, ctx);
    }));
    hostEl.querySelectorAll('[data-tk-act]').forEach(btn => btn.addEventListener('click', e => {
      e.stopPropagation();
      const id = btn.dataset.tkAct;
      const mode = btn.dataset.tkMode;
      tState.selectedId = id;
      if (mode === '监控') {
        ui.live.taskId = id;
        ctx.switchModule('uav', 'live');
      } else {
        renderTasks(hostEl, ctx);
      }
    }));

    // Inspector edits
    hostEl.querySelectorAll('[data-tk-chip]').forEach(ch => ch.addEventListener('click', () => {
      if (!selTask) return;
      const key = ch.dataset.tkChip;
      if (selTask.checks.includes(key)) selTask.checks = selTask.checks.filter(x => x !== key);
      else selTask.checks.push(key);
      renderTasks(hostEl, ctx);
    }));
    hostEl.querySelector('#m09TkSave')?.addEventListener('click', () => {
      if (!selTask) return;
      selTask.name = hostEl.querySelector('#m09CfgName').value.trim() || selTask.name;
      selTask.secId = hostEl.querySelector('#m09CfgSec').value;
      selTask.target = hostEl.querySelector('#m09CfgTarget').value.trim() || selTask.target;
      selTask.type = hostEl.querySelector('#m09CfgType').value;
      selTask.planTime = hostEl.querySelector('#m09CfgTime').value.trim() || selTask.planTime;
      selTask.shortTime = selTask.planTime.slice(5);
      selTask.uav = hostEl.querySelector('#m09CfgUav').value;
      selTask.owner = hostEl.querySelector('#m09CfgOwner').value;
      selTask.routeCode = hostEl.querySelector('#m09CfgRoute').value;
      selTask.hangar = hostEl.querySelector('#m09CfgHangar').value;
      renderTasks(hostEl, ctx);
      ctx.showToast(`已保存任务计划：${selTask.id}`);
    });

    // Pre-flight Checklist Modal
    hostEl.querySelector('#m09TkPreflight')?.addEventListener('click', () => {
      if (!selTask) return;
      const items = [
        { k: 'eq', label: `1. 设备与电池自检（${selTask.uav} / ${selTask.hangar} 满电就绪）` },
        { k: 'comm', label: '2. RTK 差分链路及图传通信正常（延迟 < 80ms）' },
        { k: 'wx', label: '3. 作业气象条件满足（风速 3.2 m/s，无降水结冰）' },
        { k: 'site', label: `4. 现场起降净空及作业人员避让确认（${selTask.target}）` },
        { k: 'auth', label: `5. 空域及航线版本授权核验通过（${selTask.routeCode}）` }
      ];
      ctx.openModal(`飞行前安全检查 · ${selTask.id}`, `
        <div style="font-size:12.5px;color:#bae6fd;margin-bottom:10px;">
          请逐项完成 5 项飞前核验，全部确认通过后即可解锁「下发任务」指令：
        </div>
        <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:14px;">
          ${items.map(it => `
            <label style="display:flex;align-items:center;gap:9px;padding:8px 10px;border-radius:7px;background:rgba(12,42,92,0.58);border:1px solid rgba(56,189,248,0.28);cursor:pointer;font-size:12.5px;color:#fff;">
              <input type="checkbox" class="m09-pf-chk" ${selTask.preflightPassed ? 'checked' : ''} style="accent-color:#22c55e;width:15px;height:15px;" />
              <span>${it.label}</span>
            </label>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:space-between;align-items:center;">
          <button class="m09-btn" id="m09PfCheckAll">一键全选核验</button>
          <button class="m09-btn primary" id="m09PfConfirm">确认通过飞前检查</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09PfCheckAll')?.addEventListener('click', () => {
          document.querySelectorAll('.m09-pf-chk').forEach(c => { c.checked = true; });
        });
        document.getElementById('m09PfConfirm')?.addEventListener('click', () => {
          const allOk = Array.from(document.querySelectorAll('.m09-pf-chk')).every(c => c.checked);
          if (!allOk) {
            ctx.showToast('请先完成全部 5 项飞前核验勾选');
            return;
          }
          selTask.preflightPassed = true;
          ctx.closeModal();
          renderTasks(hostEl, ctx);
          ctx.showToast(`${selTask.id} 飞前检查已通过，现可点击「下发任务」`);
        });
      }, 0);
    });

    // Dispatch Task
    hostEl.querySelector('#m09TkDispatch')?.addEventListener('click', () => {
      if (!selTask || !selTask.preflightPassed) return;
      selTask.status = '执行中';
      selTask.stage = 4;
      renderTasks(hostEl, ctx);
      ctx.showToast(`已向 ${selTask.hangar} / ${selTask.uav} 下发巡检任务 ${selTask.id}`);
    });

    // New Task Modal
    hostEl.querySelector('#m09TkNew').addEventListener('click', () => {
      ctx.openModal('新建无人机巡检任务', `
        <div class="m09-form-grid-2" style="margin-bottom:12px;">
          <div class="m09-form-item" style="grid-column:1 / -1;">
            <span class="m09-form-lbl">任务名称</span>
            <input class="m09-input" id="m09NewTkName" value="二工区桥梁边坡联合巡检" />
          </div>
          <div class="m09-form-item">
            <span class="m09-form-lbl">所属工区</span>
            <select class="m09-select" id="m09NewTkSec">
              ${SECTIONS.map(sec => `<option value="${sec.id}">${sec.name}</option>`).join('')}
            </select>
          </div>
          <div class="m09-form-item">
            <span class="m09-form-lbl">巡检对象</span>
            <input class="m09-input" id="m09NewTkTarget" value="桥梁示例A" />
          </div>
          <div class="m09-form-item">
            <span class="m09-form-lbl">巡检类型</span>
            <select class="m09-select" id="m09NewTkType">
              <option value="专项">专项巡检</option>
              <option value="全面">全面巡检</option>
              <option value="应急">应急巡检</option>
            </select>
          </div>
          <div class="m09-form-item">
            <span class="m09-form-lbl">计划执行时间</span>
            <input class="m09-input" id="m09NewTkTime" value="2026-11-26 15:30" />
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn" id="m09NewTkCancel">取消</button>
          <button class="m09-btn primary" id="m09NewTkSubmit">创建任务计划</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09NewTkCancel')?.addEventListener('click', () => ctx.closeModal());
        document.getElementById('m09NewTkSubmit')?.addEventListener('click', () => {
          const name = document.getElementById('m09NewTkName').value.trim();
          const secId = document.getElementById('m09NewTkSec').value;
          const target = document.getElementById('m09NewTkTarget').value.trim();
          const type = document.getElementById('m09NewTkType').value;
          const time = document.getElementById('m09NewTkTime').value.trim();
          const newId = `UAV-20261126-0${tState.list.length + 1}`;
          tState.list.unshift({
            id: newId, name: name || '新建巡检任务', secId, target: target || '现场示范点位',
            type, typeFull: type + '巡检', scene: '料场巡检', planTime: time, shortTime: time.slice(5),
            status: '待执行', uav: '无人机A02', owner: '巡检员A（演示）', routeCode: 'LC-A V2.0', hangar: '机巢A01',
            checks: ['现场安全', '重点部位', '警示标志'], allChecks: ['现场安全', '重点部位', '警示标志'],
            preflightPassed: false, stage: 3, period: '2026年11月'
          });
          tState.selectedId = newId;
          tState.page = 1;
          ctx.closeModal();
          renderTasks(hostEl, ctx);
          ctx.showToast(`已新建巡检任务 ${newId}`);
        });
      }, 0);
    });

    // Calendar View Modal
    hostEl.querySelector('#m09TkCalendar').addEventListener('click', () => {
      const days = Array.from({ length: 30 }, (_, i) => i + 1);
      ctx.openModal('巡检任务月度排程日历 · 2026年11月', `
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;font-size:11.5px;margin-bottom:8px;color:#93c5fd;text-align:center;">
          <span>周日</span><span>周一</span><span>周二</span><span>周三</span><span>周四</span><span>周五</span><span>周六</span>
        </div>
        <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:6px;">
          ${days.map(d => {
            const ds = `2026-11-${String(d).padStart(2, '0')}`;
            const dayTasks = tState.list.filter(t => t.planTime.startsWith(ds));
            return `
              <div style="min-height:58px;padding:5px;border-radius:6px;background:${d === 26 ? 'rgba(14,116,210,0.3)' : 'rgba(10,34,78,0.62)'};border:1px solid ${d === 26 ? '#38f2ff' : 'rgba(56,189,248,0.2)'};">
                <div style="font-weight:700;color:${d === 26 ? '#38f2ff' : '#cfe6ff'};margin-bottom:3px;">${d}</div>
                ${dayTasks.slice(0, 2).map(dt => `
                  <div style="font-size:10px;padding:1px 4px;border-radius:3px;background:${dt.status === '执行中' ? 'rgba(34,211,238,0.28)' : dt.status === '待执行' ? 'rgba(250,204,21,0.25)' : 'rgba(34,197,94,0.22)'};color:#fff;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;margin-bottom:2px;">
                    ${escapeHtml(dt.name)}
                  </div>
                `).join('')}
              </div>
            `;
          }).join('')}
        </div>
      `);
    });
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 3: 03_航线规划 (routes - interactive Cesium)
     ------------------------------------------------------------------------ */
  function setupRoutesCesium(hostEl, ctx) {
    cleanupCesium(false);
    const ces = ctx.cesium;
    if (!ces || !ces.ready || !ces.viewer || !window.Cesium) return;

    ces.applyLayers({
      satellite: true,
      uav: true,
      bim: false,
      pois: false,
      sections: false,
      route: true,
      designMode: false,
      activeSectionId: ctx.state.activeSectionId
    });
    ces.syncHtmlOverlays({ showRoute: false, showSections: false, showPois: false });

    const viewer = ces.viewer;
    const pinsLayer = attachCesiumPinsContainer(hostEl);
    const tpl = getActiveTemplate();
    const wps = tpl.waypoints;

    // Boundary dashed yellow polygon + ground-clamped dashed perimeter
    if (ui.routes.showBoundary && tpl.boundary.length >= 3) {
      const bDeg = [];
      tpl.boundary.forEach(pt => bDeg.push(pt[0], pt[1]));
      bDeg.push(tpl.boundary[0][0], tpl.boundary[0][1]);
      const bPoly = viewer.entities.add({
        polygon: {
          hierarchy: Cesium.Cartesian3.fromDegreesArray(tpl.boundary.flat()),
          material: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.08),
          classificationType: Cesium.ClassificationType.TERRAIN
        }
      });
      const bOutline = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(bDeg),
          width: 2.8,
          clampToGround: true,
          material: new Cesium.PolylineDashMaterialProperty({
            color: Cesium.Color.fromCssColorString('#facc15').withAlpha(0.95),
            dashLength: 16
          })
        }
      });
      cesiumEntities.push(bPoly, bOutline);
    }

    // Solid cyan closed route polyline
    if (ui.routes.showRouteLine && wps.length >= 2) {
      const rDeg = [];
      wps.forEach(w => rDeg.push(w.lon, w.lat));
      if (wps.length > 2) rDeg.push(wps[0].lon, wps[0].lat);
      const rEnt = viewer.entities.add({
        polyline: {
          positions: Cesium.Cartesian3.fromDegreesArray(rDeg),
          width: 4.5,
          clampToGround: true,
          material: new Cesium.PolylineGlowMaterialProperty({
            glowPower: 0.25,
            color: Cesium.Color.fromCssColorString('#38f2ff')
          })
        }
      });
      cesiumEntities.push(rEnt);
    }

    // Site center pin & Hangar pin
    const centerEl = document.createElement('div');
    centerEl.className = 'm09-pin-anchor';
    centerEl.innerHTML = `
      <div class="m09-map-pin">
        <div class="m09-map-pill">${SVG.pin}<span>${tpl.targetName}</span></div>
        <div class="m09-map-stem"></div>
      </div>
    `;
    pinsLayer.appendChild(centerEl);
    cesiumHtmlPins.push({ el: centerEl, cartesian: Cesium.Cartesian3.fromDegrees(tpl.center[0], tpl.center[1], 245) });

    const hangar = HANGARS.find(h => h.name === tpl.hangar) || HANGARS[0];
    const hEl = document.createElement('div');
    hEl.className = 'm09-pin-anchor';
    hEl.innerHTML = `
      <div class="m09-map-pin">
        <div class="m09-map-pill green">${SVG.hangar}<span>${hangar.name}</span></div>
      </div>
    `;
    pinsLayer.appendChild(hEl);
    const hLon = tpl.id === 'tpl-lc-a' ? hangar.lon : wps[0].lon;
    const hLat = tpl.id === 'tpl-lc-a' ? 47.5048 : wps[0].lat - 0.00025;
    cesiumHtmlPins.push({ el: hEl, cartesian: Cesium.Cartesian3.fromDegrees(hLon, hLat, 248) });

    // 12 interactive waypoint nodes
    wps.forEach((wp, idx) => {
      const isSel = idx === ui.routes.selectedWpIdx;
      const wpEnt = viewer.entities.add({
        position: Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, 252),
        point: {
          pixelSize: isSel ? 12 : 8,
          color: Cesium.Color.fromCssColorString(isSel ? '#facc15' : '#38f2ff'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      cesiumEntities.push(wpEnt);

      const el = document.createElement('div');
      el.className = 'm09-pin-anchor';
      el.innerHTML = `
        <div class="m09-wp-node ${isSel ? 'active' : ''}" title="航点 ${wp.no}·${wp.name}">
          ${isSel ? `<div class="m09-wp-callout">${wp.no} · ${escapeHtml(wp.name)}</div>` : ''}
          ${wp.no}
        </div>
      `;
      el.addEventListener('click', e => {
        e.stopPropagation();
        ui.routes.selectedWpIdx = idx;
        renderRoutes(hostEl, ctx, true);
      });
      pinsLayer.appendChild(el);
      cesiumHtmlPins.push({ el, cartesian: Cesium.Cartesian3.fromDegrees(wp.lon, wp.lat, 252) });
    });

    // Preview flying drone entity
    if (ui.routes.previewing) {
      const prevDrone = viewer.entities.add({
        position: new Cesium.CallbackProperty(() => {
          const p = interpolateWaypoints(wps, ui.routes.previewProgress);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }, false),
        point: {
          pixelSize: 13,
          color: Cesium.Color.fromCssColorString('#facc15'),
          outlineColor: Cesium.Color.WHITE,
          outlineWidth: 2.5,
          disableDepthTestDistance: Number.POSITIVE_INFINITY
        }
      });
      cesiumEntities.push(prevDrone);

      const dEl = document.createElement('div');
      dEl.className = 'm09-pin-anchor';
      dEl.innerHTML = `<div class="m09-map-pin"><div class="m09-map-pill gold">${SVG.drone}<span>预览飞行中</span></div></div>`;
      pinsLayer.appendChild(dEl);
      cesiumHtmlPins.push({
        el: dEl,
        getCartesian: () => {
          const p = interpolateWaypoints(wps, ui.routes.previewProgress);
          return Cesium.Cartesian3.fromDegrees(p.lon, p.lat, 265);
        }
      });
    }

    // Globe click handler for draw / move mode
    cesiumClickHandler = new Cesium.ScreenSpaceEventHandler(viewer.scene.canvas);
    cesiumClickHandler.setInputAction(movement => {
      if (ui.routes.toolMode === 'select') return;
      const ray = viewer.camera.getPickRay(movement.position);
      const cartesian = viewer.scene.globe.pick(ray, viewer.scene);
      if (!cartesian) return;
      const carto = Cesium.Cartographic.fromCartesian(cartesian);
      const lon = +Cesium.Math.toDegrees(carto.longitude).toFixed(5);
      const lat = +Cesium.Math.toDegrees(carto.latitude).toFixed(5);
      if (ui.routes.toolMode === 'draw') {
        const nextNo = String(tpl.waypoints.length + 1).padStart(2, '0');
        tpl.waypoints.push({
          no: nextNo, name: `新增航点${nextNo}`, lon, lat,
          alt: 40, speed: 3.0, action: '定点拍照', req: '取证全景与近景', checkItem: '现场安全', gimbal: '俯视'
        });
        tpl.status = '草稿';
        ui.routes.selectedWpIdx = tpl.waypoints.length - 1;
        recomputeTemplateLength(tpl);
        renderRoutes(hostEl, ctx, true);
        ctx.showToast(`已在地图选点新增航点 ${nextNo}`);
      } else if (ui.routes.toolMode === 'move') {
        const wp = tpl.waypoints[ui.routes.selectedWpIdx];
        if (wp) {
          wp.lon = lon;
          wp.lat = lat;
          tpl.status = '草稿';
          recomputeTemplateLength(tpl);
          renderRoutes(hostEl, ctx, true);
          ctx.showToast(`已移动航点 ${wp.no} 坐标（航线长度更新为 ${tpl.lengthKm} km）`);
        }
      }
    }, Cesium.ScreenSpaceEventType.LEFT_CLICK);

    cesiumPostRenderRemover = viewer.scene.postRender.addEventListener(() => syncCesiumProjection(viewer));
    syncCesiumProjection(viewer);
  }

  function renderRoutes(hostEl, ctx, skipCameraFly) {
    const rState = ui.routes;
    const tpl = getActiveTemplate();
    if (rState.selectedWpIdx >= tpl.waypoints.length) rState.selectedWpIdx = tpl.waypoints.length - 1;
    const selWp = tpl.waypoints[rState.selectedWpIdx] || tpl.waypoints[0];

    const filteredTpls = rState.templates.filter(t =>
      !rState.search.trim() ||
      t.name.includes(rState.search.trim()) ||
      t.code.toLowerCase().includes(rState.search.trim().toLowerCase())
    );

    hostEl.innerHTML = `
      <div class="m09-map-stage">
        <!-- Top Floating Draw/Preview Toolbar -->
        <div class="m09-map-topbar">
          <div class="m09-map-bar-left">
            <strong style="font-size:13px;color:#fff;margin-right:4px;">${tpl.code}</strong>
            <button class="m09-btn ${rState.toolMode === 'select' ? 'primary' : ''}" id="m09RtSelect" style="padding:4px 10px;">${SVG.pin} 选点</button>
            <button class="m09-btn ${rState.toolMode === 'draw' ? 'primary' : ''}" id="m09RtDraw" style="padding:4px 10px;">${SVG.draw} 绘制航线</button>
            <button class="m09-btn ${rState.toolMode === 'move' ? 'primary' : ''}" id="m09RtMove" style="padding:4px 10px;">${SVG.move} 移动</button>
            <button class="m09-btn ${rState.previewing ? 'gold' : ''}" id="m09RtPreview" style="padding:4px 10px;">${rState.previewing ? SVG.pause : SVG.play} ${rState.previewing ? '停止预览' : '预览'}</button>
          </div>
          <div class="m09-map-bar-right" style="position:relative;font-size:12px;color:#dbeafe;">
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="m09RtShowLine" ${rState.showRouteLine ? 'checked' : ''} style="accent-color:#22d3ee;" /> 规划航线
            </label>
            <label style="display:inline-flex;align-items:center;gap:4px;cursor:pointer;">
              <input type="checkbox" id="m09RtShowBound" ${rState.showBoundary ? 'checked' : ''} style="accent-color:#facc15;" /> 巡检范围
            </label>
            <button class="m09-btn" id="m09RtLayerBtn" style="padding:4px 10px;">${SVG.layers} 图层</button>
            ${rState.showLayerPopover ? `
              <div class="m09-popover">
                <strong style="color:#fff;">底图图层控制</strong>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" checked id="m09RtPopSat" style="accent-color:#22d3ee;"/> 高清卫星实景</label>
                <label style="display:flex;align-items:center;gap:6px;cursor:pointer;"><input type="checkbox" id="m09RtPopGrid" style="accent-color:#22d3ee;"/> 科技网格叠加</label>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- Left HUD Column -->
        <div class="hud-left-col" style="width:264px;">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">航线模板</span></div>
            </div>
            <div class="panel-body">
              <div style="position:relative;margin-bottom:9px;">
                <input class="m09-input" id="m09RtSearch" style="width:100%;padding-left:28px;box-sizing:border-box;" placeholder="搜索航线模板" value="${escapeHtml(rState.search)}" />
                <span style="position:absolute;left:9px;top:7px;color:var(--text-muted);">${SVG.search}</span>
              </div>
              <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:10px;">
                ${filteredTpls.map(t => `
                  <div class="m09-list-card ${t.id === tpl.id ? 'active' : ''}" data-rt-tpl="${t.id}" style="margin-bottom:0;display:flex;align-items:center;justify-content:space-between;gap:8px;">
                    <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                      <span style="color:#38f2ff;">${SVG[t.icon] || SVG.route}</span>
                      <div style="min-width:0;">
                        <div style="font-size:12.5px;font-weight:700;color:#fff;">${t.name}</div>
                        <div style="font-size:11px;color:var(--text-muted);">${t.code} · ${t.waypoints.length}个航点</div>
                      </div>
                    </div>
                    <span class="status-tag ${statusTagClass(t.status)}">${t.status}</span>
                  </div>
                `).join('')}
              </div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
                <button class="m09-btn primary" id="m09RtApplyTpl">${SVG.check} 调用模板</button>
                <button class="m09-btn" id="m09RtNewRoute">+ 新建航线</button>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">当前航线</span></div>
              <span class="status-tag ${statusTagClass(tpl.status)}">${tpl.status}</span>
            </div>
            <div class="panel-body">
              <div class="m09-kv-row"><span class="m09-kv-k">关联任务</span><span class="m09-kv-v">${tpl.taskId}</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">巡检对象</span><span class="m09-kv-v">${tpl.targetName}</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">规划航点</span><span class="m09-kv-v">${tpl.waypoints.length} 个</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">航线长度</span><span class="m09-kv-v">${tpl.lengthKm} km</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">关联机巢</span><span class="m09-kv-v">${tpl.hangar}</span></div>
              <div class="m09-panel-foot" style="justify-content:flex-start;">
                <button class="m09-link-btn" id="m09RtHistory">查看历史版本 ${SVG.chevronR}</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Right HUD Column -->
        <div class="hud-right-col" style="width:282px;">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">航点设置</span></div>
            </div>
            <div class="panel-body">
              <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                <strong style="font-size:13.5px;color:#fff;">航点 ${selWp.no} · ${escapeHtml(selWp.name)}</strong>
                <span class="status-tag info">已选中</span>
              </div>
              <div class="m09-form-grid-2" style="margin-bottom:8px;">
                <div class="m09-form-item">
                  <span class="m09-form-lbl">相对航高</span>
                  <select class="m09-select" id="m09WpAlt">
                    ${[25, 30, 35, 40, 45, 50, 60, 80].map(v => `<option value="${v}" ${selWp.alt === v ? 'selected' : ''}>${v} m</option>`).join('')}
                  </select>
                </div>
                <div class="m09-form-item">
                  <span class="m09-form-lbl">飞行速度</span>
                  <select class="m09-select" id="m09WpSpeed">
                    ${[2.0, 2.5, 3.0, 3.5, 4.0, 5.0].map(v => `<option value="${v}" ${selWp.speed === v ? 'selected' : ''}>${v.toFixed(1)} m/s</option>`).join('')}
                  </select>
                </div>
              </div>
              <div class="m09-form-item" style="margin-bottom:7px;">
                <span class="m09-form-lbl">拍摄动作</span>
                <select class="m09-select" id="m09WpAction">
                  ${['定点拍照', '连续抓拍', '悬停录像', '起降自检'].map(v => `<option value="${v}" ${selWp.action === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>
              <div class="m09-form-item" style="margin-bottom:7px;">
                <span class="m09-form-lbl">拍摄要求</span>
                <select class="m09-select" id="m09WpReq">
                  ${[selWp.req, '取证全景与通道近景', '通道边界正射', '堆料高度侧拍', '同点位临边防护复查取证'].filter((v, i, a) => a.indexOf(v) === i).map(v => `<option value="${v}" ${selWp.req === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>
              <div class="m09-form-item" style="margin-bottom:7px;">
                <span class="m09-form-lbl">检查项</span>
                <select class="m09-select" id="m09WpCheck">
                  ${[selWp.checkItem, '消防通道', '起降安全区', '围挡封闭', '临边防护', '交通导改'].filter((v, i, a) => a.indexOf(v) === i).map(v => `<option value="${v}" ${selWp.checkItem === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>
              <div class="m09-form-item" style="margin-bottom:8px;">
                <span class="m09-form-lbl">云台视角</span>
                <select class="m09-select" id="m09WpGimbal">
                  ${['俯视', '前倾45°', '前视', '环绕'].map(v => `<option value="${v}" ${selWp.gimbal === v ? 'selected' : ''}>${v}</option>`).join('')}
                </select>
              </div>
              <div class="m09-panel-foot">
                <button class="m09-link-btn" id="m09WpLocate">定位航点 ${SVG.target}</button>
                <span>参数示意</span>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">执行前校核</span></div>
            </div>
            <div class="panel-body">
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.pin} 现场范围核对</span><span class="m09-kv-v" style="color:#67e8f9;">已记录</span></div>
              <div class="m09-kv-row"><span class="m09-kv-k">${SVG.doc} 检查项关联</span><span class="m09-kv-v" style="color:#67e8f9;">已配置</span></div>
              <div class="m09-kv-row" style="margin-bottom:10px;"><span class="m09-kv-k">${SVG.check} 航线状态</span><span class="m09-kv-v" style="color:#22c55e;">${tpl.status}</span></div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;">
                <button class="m09-btn" id="m09RtAddWp">+ 新增航点</button>
                <button class="m09-btn primary" id="m09RtSaveDraft">${SVG.save} 另存草稿</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Map Zoom Controls -->
        <div class="m09-map-zoom routes-pos">
          <div class="zoom-pill vertical">
            <button class="zoom-btn" id="m09RtZoomIn">+</button>
            <button class="zoom-btn" id="m09RtZoomOut">−</button>
            <button class="zoom-btn" id="m09RtLocate">${SVG.target}</button>
          </div>
        </div>

        <!-- Bottom 12-Waypoint Ribbon -->
        <div class="m09-wp-ribbon">
          ${tpl.waypoints.map((wp, idx) => `
            <div class="m09-wp-chip ${idx === rState.selectedWpIdx ? 'active' : ''}" data-rt-wp="${idx}" title="${wp.no} ${wp.name}">
              <div class="m09-wp-chip-no">${wp.no}</div>
              <div class="m09-wp-chip-name">${escapeHtml(wp.name)}</div>
            </div>
          `).join('')}
        </div>

        <!-- Bottom Legend -->
        <div class="m09-map-legend">
          <div class="m09-legend-items">
            <span class="m09-legend-item"><span class="m09-line-solid"></span> 规划航线</span>
            <span class="m09-legend-item"><span class="m09-line-dash-gold"></span> 巡检范围</span>
          </div>
          <span>明水至北安段·地图与点位示意</span>
          <span>⊕ 北</span>
        </div>
      </div>
    `;

    setupRoutesCesium(hostEl, ctx);
    if (!skipCameraFly) {
      scheduleCameraFly(() => flyCameraToBounds(ctx.cesium, tpl.center[0], tpl.center[1] - 0.0007, 1700, -58));
    }

    // Bind events
    hostEl.querySelector('#m09RtSearch').addEventListener('input', e => {
      rState.search = e.target.value;
      renderRoutes(hostEl, ctx, true);
    });
    hostEl.querySelectorAll('[data-rt-tpl]').forEach(el => el.addEventListener('click', () => {
      rState.selectedTplId = el.dataset.rtTpl;
      rState.selectedWpIdx = 0;
      rState.previewing = false;
      renderRoutes(hostEl, ctx, false);
    }));
    hostEl.querySelector('#m09RtApplyTpl').addEventListener('click', () => {
      ctx.showToast(`已调用航线模板：${tpl.name}（${tpl.code}）`);
      flyCameraToBounds(ctx.cesium, tpl.center[0], tpl.center[1] - 0.0007, 1700, -58);
    });
    hostEl.querySelector('#m09RtNewRoute').addEventListener('click', () => {
      ctx.openModal('新建巡检航线', `
        <div class="m09-form-grid-2" style="margin-bottom:12px;">
          <div class="m09-form-item"><span class="m09-form-lbl">航线名称</span><input class="m09-input" id="m09NewRtName" value="三工区路基边坡航线" /></div>
          <div class="m09-form-item"><span class="m09-form-lbl">版本号</span><input class="m09-input" id="m09NewRtCode" value="LJ-C V1.0" /></div>
          <div class="m09-form-item"><span class="m09-form-lbl">归属工区</span><select class="m09-select" id="m09NewRtSec">${SECTIONS.map(s => `<option value="${s.id}">${s.name}</option>`).join('')}</select></div>
          <div class="m09-form-item"><span class="m09-form-lbl">巡检对象</span><input class="m09-input" id="m09NewRtTarget" value="路基示例段" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn primary" id="m09NewRtOk">生成航线模板</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09NewRtOk')?.addEventListener('click', () => {
          const name = document.getElementById('m09NewRtName').value.trim();
          const code = document.getElementById('m09NewRtCode').value.trim();
          const secId = document.getElementById('m09NewRtSec').value;
          const target = document.getElementById('m09NewRtTarget').value.trim();
          const base = rState.templates[0];
          const newId = 'tpl-' + Date.now();
          rState.templates.push({
            id: newId, name: name || '新巡检航线', code: code || 'NEW V1.0', status: '草稿', secId,
            taskId: 'UAV-20261126-04', targetName: `${secLabel(secId)}·${target}`, hangar: '机巢B01',
            lengthKm: 1.15, icon: 'route', center: [125.9920, 47.6520],
            boundary: [[125.988, 47.655], [125.996, 47.655], [125.996, 47.649], [125.988, 47.649]],
            waypoints: base.waypoints.slice(0, 6).map((w, idx) => ({
              ...w, lon: 125.990 + idx * 0.001, lat: 47.650 + (idx % 2) * 0.003
            })),
            history: [{ ver: code || 'NEW V1.0', date: '2026-11-26', author: '当前用户', status: '草稿', note: '新建初始航线' }]
          });
          rState.selectedTplId = newId;
          rState.selectedWpIdx = 0;
          ctx.closeModal();
          renderRoutes(hostEl, ctx, false);
          ctx.showToast(`已新建航线：${name}`);
        });
      }, 0);
    });

    hostEl.querySelector('#m09RtHistory').addEventListener('click', () => {
      ctx.openModal(`航线历史版本 · ${tpl.name}`, `
        <table class="data-table">
          <thead><tr><th>版本</th><th>修订日期</th><th>修订人</th><th>状态</th><th>修订说明</th></tr></thead>
          <tbody>
            ${tpl.history.map(h => `
              <tr>
                <td style="font-weight:700;color:#38f2ff;">${h.ver}</td>
                <td>${h.date}</td>
                <td>${h.author}</td>
                <td><span class="status-tag ${h.status === '已审核' ? 'ok' : 'info'}">${h.status}</span></td>
                <td>${escapeHtml(h.note)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `);
    });

    // Toolbar actions
    hostEl.querySelector('#m09RtSelect').addEventListener('click', () => { rState.toolMode = 'select'; renderRoutes(hostEl, ctx, true); });
    hostEl.querySelector('#m09RtDraw').addEventListener('click', () => {
      rState.toolMode = 'draw';
      renderRoutes(hostEl, ctx, true);
      ctx.showToast('绘制航线模式：在三维地图上点击即可顺序追加航点');
    });
    hostEl.querySelector('#m09RtMove').addEventListener('click', () => {
      rState.toolMode = 'move';
      renderRoutes(hostEl, ctx, true);
      ctx.showToast(`移动航点模式：点击三维地图可将航点 ${selWp.no} 移动至新位置`);
    });
    hostEl.querySelector('#m09RtPreview').addEventListener('click', () => {
      rState.previewing = !rState.previewing;
      if (rState.previewing) {
        rState.previewProgress = 0;
        if (routePreviewTimer) clearInterval(routePreviewTimer);
        routePreviewTimer = setInterval(() => {
          if (!ui.routes.previewing || lastSubPageId !== 'routes') {
            clearInterval(routePreviewTimer);
            routePreviewTimer = null;
            return;
          }
          ui.routes.previewProgress = (ui.routes.previewProgress + 0.14) % tpl.waypoints.length;
        }, 120);
        ctx.showToast(`开始模拟预览航线 ${tpl.code}`);
      } else {
        if (routePreviewTimer) { clearInterval(routePreviewTimer); routePreviewTimer = null; }
      }
      renderRoutes(hostEl, ctx, true);
    });

    hostEl.querySelector('#m09RtShowLine').addEventListener('change', e => { rState.showRouteLine = e.target.checked; setupRoutesCesium(hostEl, ctx); });
    hostEl.querySelector('#m09RtShowBound').addEventListener('change', e => { rState.showBoundary = e.target.checked; setupRoutesCesium(hostEl, ctx); });
    hostEl.querySelector('#m09RtLayerBtn').addEventListener('click', () => { rState.showLayerPopover = !rState.showLayerPopover; renderRoutes(hostEl, ctx, true); });
    hostEl.querySelector('#m09RtPopGrid')?.addEventListener('change', e => {
      ctx.cesium?.applyLayers({ satellite: true, uav: true, bim: false, pois: false, sections: false, route: true, designMode: e.target.checked });
    });

    hostEl.querySelector('#m09RtZoomIn').addEventListener('click', () => ctx.cesium?.zoomIn());
    hostEl.querySelector('#m09RtZoomOut').addEventListener('click', () => ctx.cesium?.zoomOut());
    hostEl.querySelector('#m09RtLocate').addEventListener('click', () => flyCameraToBounds(ctx.cesium, tpl.center[0], tpl.center[1] - 0.0007, 1700, -58));

    hostEl.querySelectorAll('[data-rt-wp]').forEach(el => el.addEventListener('click', () => {
      rState.selectedWpIdx = Number(el.dataset.rtWp);
      renderRoutes(hostEl, ctx, true);
    }));

    // Waypoint settings edits
    hostEl.querySelector('#m09WpAlt').addEventListener('change', e => { selWp.alt = Number(e.target.value); ctx.showToast(`航点 ${selWp.no} 航高已设为 ${selWp.alt} m`); });
    hostEl.querySelector('#m09WpSpeed').addEventListener('change', e => { selWp.speed = Number(e.target.value); ctx.showToast(`航点 ${selWp.no} 速度已设为 ${selWp.speed} m/s`); });
    hostEl.querySelector('#m09WpAction').addEventListener('change', e => { selWp.action = e.target.value; });
    hostEl.querySelector('#m09WpReq').addEventListener('change', e => { selWp.req = e.target.value; });
    hostEl.querySelector('#m09WpCheck').addEventListener('change', e => { selWp.checkItem = e.target.value; });
    hostEl.querySelector('#m09WpGimbal').addEventListener('change', e => { selWp.gimbal = e.target.value; });
    hostEl.querySelector('#m09WpLocate').addEventListener('click', () => {
      flyCameraToBounds(ctx.cesium, selWp.lon, selWp.lat, 650, -58);
      ctx.showToast(`已定位至航点 ${selWp.no} · ${selWp.name}`);
    });

    hostEl.querySelector('#m09RtAddWp').addEventListener('click', () => {
      const nextNo = String(tpl.waypoints.length + 1).padStart(2, '0');
      const last = tpl.waypoints[tpl.waypoints.length - 1];
      tpl.waypoints.push({
        no: nextNo, name: `扩展点${nextNo}`, lon: +(last.lon - 0.0012).toFixed(5), lat: +(last.lat + 0.0004).toFixed(5),
        alt: 40, speed: 3.0, action: '定点拍照', req: '取证全景与通道近景', checkItem: '消防通道', gimbal: '俯视'
      });
      tpl.status = '草稿';
      rState.selectedWpIdx = tpl.waypoints.length - 1;
      recomputeTemplateLength(tpl);
      renderRoutes(hostEl, ctx, true);
      ctx.showToast(`已新增航点 ${nextNo}`);
    });

    hostEl.querySelector('#m09RtSaveDraft').addEventListener('click', () => {
      tpl.status = '草稿';
      renderRoutes(hostEl, ctx, true);
      ctx.showToast(`已另存航线草稿：${tpl.code}（${tpl.waypoints.length}个航点）`);
    });
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 4: 04_实时巡检 (live - opaque + Canvas animated aerial feed)
     ------------------------------------------------------------------------ */
  function drawLiveVideoFrame(canvas) {
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    const lv = ui.live;
    const t = Date.now() * 0.001;
    const isThermal = lv.feedMode === 'thermal';

    ctx2d.clearRect(0, 0, w, h);

    // Base aerial image with gentle flight pan & gimbal zoom/pitch
    const baseImg = getCachedImage('milestone_before.jpg');
    ctx2d.save();
    const panX = lv.flightStatus === '执行中' ? Math.sin(t * 0.35) * 14 : 0;
    const panY = lv.flightStatus === '执行中' ? Math.cos(t * 0.25) * 8 : 0;
    const zoom = lv.gimbalZoom;
    ctx2d.translate(w / 2 + panX + lv.gimbalYaw * 1.4, h / 2 + panY + (lv.gimbalPitch + 45) * 1.1);
    ctx2d.scale(zoom * 1.06, zoom * 1.06);

    if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
      if (isThermal) {
        ctx2d.filter = 'contrast(1.35) saturate(2.1) hue-rotate(195deg) brightness(0.92)';
      } else {
        ctx2d.filter = 'contrast(1.06) saturate(1.12)';
      }
      ctx2d.drawImage(baseImg, -w / 2, -h / 2, w, h);
      ctx2d.filter = 'none';
    } else {
      // Procedural aerial fallback if image still loading
      const bgGrad = ctx2d.createLinearGradient(0, -h / 2, 0, h / 2);
      bgGrad.addColorStop(0, isThermal ? '#1e1b4b' : '#1b3b5a');
      bgGrad.addColorStop(1, isThermal ? '#4c1d95' : '#0f2744');
      ctx2d.fillStyle = bgGrad;
      ctx2d.fillRect(-w / 2, -h / 2, w, h);
    }

    // Yellow dashed detection box (通道占用线索·待核实)
    const bx = w * 0.14;
    const by = h * 0.12;
    const bw = w * 0.19;
    const bh = h * 0.25;
    ctx2d.save();
    ctx2d.strokeStyle = '#facc15';
    ctx2d.lineWidth = 2.5;
    ctx2d.setLineDash([8, 5]);
    ctx2d.lineDashOffset = -(t * 18) % 26;
    ctx2d.strokeRect(bx, by, bw, bh);
    ctx2d.fillStyle = 'rgba(250, 204, 21, 0.14)';
    ctx2d.fillRect(bx, by, bw, bh);
    ctx2d.restore();

    // Leader line + callout pill for detection box
    ctx2d.strokeStyle = '#facc15';
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(bx + bw * 0.5, by);
    ctx2d.lineTo(bx + bw * 0.5, by - 36);
    ctx2d.stroke();

    const pillW = 166, pillH = 28, pillX = bx + bw * 0.5 - pillW / 2, pillY = by - 66;
    ctx2d.fillStyle = 'rgba(130, 86, 10, 0.92)';
    ctx2d.strokeStyle = '#facc15';
    ctx2d.lineWidth = 1.5;
    ctx2d.beginPath();
    ctx2d.roundRect(pillX, pillY, pillW, pillH, 14);
    ctx2d.fill();
    ctx2d.stroke();
    ctx2d.fillStyle = '#fef08a';
    ctx2d.font = 'bold 13px "Microsoft YaHei", sans-serif';
    ctx2d.textAlign = 'center';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillText('通道占用线索·待核实', pillX + pillW / 2, pillY + pillH / 2);

    // Site blue label callout (二工区料场示例A)
    const sx = -w * 0.13, sy = -h * 0.17;
    ctx2d.strokeStyle = '#38f2ff';
    ctx2d.lineWidth = 1.8;
    ctx2d.beginPath();
    ctx2d.moveTo(sx, sy);
    ctx2d.lineTo(sx + 28, sy - 48);
    ctx2d.stroke();
    ctx2d.fillStyle = '#38f2ff';
    ctx2d.beginPath();
    ctx2d.arc(sx, sy, 4, 0, Math.PI * 2);
    ctx2d.fill();

    ctx2d.fillStyle = 'rgba(8, 36, 84, 0.88)';
    ctx2d.strokeStyle = '#38f2ff';
    ctx2d.beginPath();
    ctx2d.roundRect(sx - 56, sy - 82, 166, 32, 7);
    ctx2d.fill();
    ctx2d.stroke();
    ctx2d.fillStyle = '#ffffff';
    ctx2d.font = 'bold 15px "Microsoft YaHei", sans-serif';
    ctx2d.fillText('二工区料场示例A', sx + 27, sy - 66);

    ctx2d.restore();

    // HUD Crosshair + OSD overlays
    ctx2d.strokeStyle = 'rgba(56, 242, 255, 0.45)';
    ctx2d.lineWidth = 1.2;
    ctx2d.beginPath();
    ctx2d.moveTo(w / 2 - 18, h / 2); ctx2d.lineTo(w / 2 - 6, h / 2);
    ctx2d.moveTo(w / 2 + 6, h / 2); ctx2d.lineTo(w / 2 + 18, h / 2);
    ctx2d.moveTo(w / 2, h / 2 - 18); ctx2d.lineTo(w / 2, h / 2 - 6);
    ctx2d.moveTo(w / 2, h / 2 + 6); ctx2d.lineTo(w / 2, h / 2 + 18);
    ctx2d.stroke();

    // Top-left timestamp
    const secStr = formatSecMMSS(lv.elapsedSec % 3600);
    const clockStr = `2026-11-26 09:${String(20 + Math.floor(lv.elapsedSec / 60)).padStart(2, '0')}:${String(lv.elapsedSec % 60).padStart(2, '0')}`;
    ctx2d.fillStyle = 'rgba(5, 20, 48, 0.78)';
    ctx2d.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx2d.lineWidth = 1;
    ctx2d.beginPath();
    ctx2d.roundRect(12, 12, 162, 26, 5);
    ctx2d.fill();
    ctx2d.stroke();
    ctx2d.fillStyle = '#e2f1ff';
    ctx2d.font = '600 12px Consolas, monospace';
    ctx2d.textAlign = 'left';
    ctx2d.textBaseline = 'middle';
    ctx2d.fillText(clockStr, 21, 25);

    // Top-right badge
    ctx2d.fillStyle = 'rgba(5, 20, 48, 0.78)';
    ctx2d.beginPath();
    ctx2d.roundRect(w - 114, 12, 102, 26, 5);
    ctx2d.fill();
    ctx2d.stroke();
    ctx2d.fillStyle = isThermal ? '#facc15' : '#bae6fd';
    ctx2d.font = '600 12px "Microsoft YaHei", sans-serif';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(isThermal ? '热成像通道' : '模拟实时画面', w - 63, 25);

    // REC indicator
    if (lv.recording) {
      ctx2d.fillStyle = 'rgba(185, 28, 28, 0.88)';
      ctx2d.beginPath();
      ctx2d.roundRect(184, 12, 92, 26, 5);
      ctx2d.fill();
      ctx2d.fillStyle = '#ffffff';
      ctx2d.font = 'bold 12px sans-serif';
      ctx2d.fillText(`● REC ${formatSecMMSS(lv.recSeconds)}`, 230, 25);
    }
  }

  function buildMiniRouteMapSvg() {
    const w = 360, h = 152;
    const pts = [
      [148, 128], [76, 118], [58, 92], [62, 64], [78, 42], [116, 29],
      [176, 26], [238, 30], [282, 46], [296, 76], [288, 106], [234, 124]
    ];
    const doneIdx = Math.min(11, Math.max(0, Math.floor(ui.live.wpFloat)));
    const donePts = pts.slice(0, doneIdx + 1).map(p => p.join(',')).join(' ');
    const planPts = [...pts.slice(doneIdx), pts[0]].map(p => p.join(',')).join(' ');
    const dp = pts[doneIdx];
    const np = pts[(doneIdx + 1) % pts.length];
    const frac = ui.live.wpFloat - Math.floor(ui.live.wpFloat);
    const dx = dp[0] + (np[0] - dp[0]) * frac;
    const dy = dp[1] + (np[1] - dp[1]) * frac;

    return `
      <svg viewBox="0 0 ${w} ${h}" style="width:100%;display:block;border-radius:7px;border:1px solid rgba(56,189,248,0.32);background:#071b3d;">
        <defs>
          <clipPath id="m09-mini-clip"><rect width="${w}" height="${h}" rx="7"/></clipPath>
        </defs>
        <image href="${ASSET_BASE}corridor_aerial.jpg" width="${w}" height="${h}" preserveAspectRatio="xMidYMid slice" opacity="0.62" clip-path="url(#m09-mini-clip)"/>
        <rect width="${w}" height="${h}" fill="rgba(4,16,38,0.36)"/>
        <polyline points="${planPts}" fill="none" stroke="#e2e8f0" stroke-width="2" stroke-dasharray="6 4"/>
        <polyline points="${donePts}" fill="none" stroke="#38f2ff" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
        <!-- 01 & 12 & H markers -->
        <circle cx="${pts[0][0]}" cy="${pts[0][1]}" r="9" fill="#0c2f66" stroke="#38f2ff" stroke-width="1.5"/>
        <text x="${pts[0][0]}" y="${pts[0][1] + 3.5}" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">01</text>
        <circle cx="182" cy="127" r="9" fill="#0d4f38" stroke="#22c55e" stroke-width="1.5"/>
        <text x="182" y="130.5" fill="#bbf7d0" font-size="9.5" font-weight="800" text-anchor="middle">H</text>
        <circle cx="${pts[11][0]}" cy="${pts[11][1]}" r="9" fill="#0c2f66" stroke="#38f2ff" stroke-width="1.5"/>
        <text x="${pts[11][0]}" y="${pts[11][1] + 3.5}" fill="#fff" font-size="9" font-weight="700" text-anchor="middle">12</text>
        <!-- Current waypoint 07 & UAV badge -->
        <circle cx="${dx}" cy="${dy}" r="7" fill="#0e7490" stroke="#fff" stroke-width="1.8"/>
        <text x="${dx}" y="${dy + 3}" fill="#fff" font-size="8.5" font-weight="800" text-anchor="middle">${String(doneIdx + 1).padStart(2, '0')}</text>
        <rect x="${dx - 32}" y="${Math.max(4, dy - 30)}" width="64" height="18" rx="4" fill="rgba(6,30,72,0.92)" stroke="#38f2ff"/>
        <text x="${dx}" y="${Math.max(16, dy - 18)}" fill="#38f2ff" font-size="10" font-weight="700" text-anchor="middle">A01 · ${String(doneIdx + 1).padStart(2, '0')}</text>
      </svg>
    `;
  }

  function startLiveLoops(hostEl, ctx) {
    if (liveRafId) cancelAnimationFrame(liveRafId);
    const loop = () => {
      if (lastSubPageId !== 'live') return;
      const canvas = document.getElementById('m09LiveCanvas');
      if (canvas) drawLiveVideoFrame(canvas);
      liveRafId = requestAnimationFrame(loop);
    };
    liveRafId = requestAnimationFrame(loop);

    if (liveTickTimer) clearInterval(liveTickTimer);
    liveTickTimer = setInterval(() => {
      if (lastSubPageId !== 'live') {
        clearInterval(liveTickTimer);
        liveTickTimer = null;
        return;
      }
      const lv = ui.live;
      if (lv.recording) lv.recSeconds++;
      if (lv.flightStatus === '执行中') {
        lv.elapsedSec++;
        lv.wpFloat = (lv.wpFloat + 0.04) % 12;
        if (lv.elapsedSec % 25 === 0 && lv.battery > 18) lv.battery--;
      } else if (lv.flightStatus === '返航中') {
        lv.wpFloat = Math.max(0, lv.wpFloat - 0.35);
        if (lv.wpFloat <= 0.05) {
          lv.wpFloat = 0;
          lv.flightStatus = '已返航';
          lv.events.unshift({ time: '09:32', text: '无人机A01已安全降落机巢A01并开始自动充电' });
          ctx.showToast('无人机已安全返航至机巢A01');
          renderLive(hostEl, ctx);
          return;
        }
      }
      // Patch lightweight DOM telemetry without tearing down canvas
      const elTime = document.getElementById('m09LvTime');
      const elBat = document.getElementById('m09LvBat');
      const elWp = document.getElementById('m09LvWp');
      const elMini = document.getElementById('m09LvMiniMap');
      const elProgTxt = document.getElementById('m09LvProgTxt');
      const elProgFill = document.getElementById('m09LvProgFill');
      const wpCur = Math.min(12, Math.floor(lv.wpFloat) + 1);
      const pct = Math.round((wpCur / 12) * 100);
      if (elTime) elTime.textContent = formatSecMMSS(lv.elapsedSec);
      if (elBat) elBat.innerHTML = `${lv.battery}<span>%</span>`;
      if (elWp) elWp.textContent = `${wpCur} / 12`;
      if (elMini) elMini.innerHTML = buildMiniRouteMapSvg();
      if (elProgTxt) elProgTxt.textContent = `已到达 ${wpCur} / 12 航点`;
      if (elProgFill) elProgFill.style.width = `${pct}%`;
    }, 1000);
  }

  function renderLive(hostEl, ctx) {
    const lv = ui.live;
    const task = ui.tasks.list.find(t => t.id === lv.taskId) || ui.tasks.list[1];
    const wpCur = Math.min(12, Math.floor(lv.wpFloat) + 1);
    const wpPct = Math.round((wpCur / 12) * 100);

    hostEl.innerHTML = `
      <div class="m09-opaque-page">
        <!-- Top Selector Bar -->
        <div class="m09-filter-bar">
          <div class="m09-filter-group">
            <label class="m09-field-inline">执行任务
              <select class="m09-select" id="m09LvTask">
                ${ui.tasks.list.slice(0, 6).map(t => `<option value="${t.id}" ${t.id === lv.taskId ? 'selected' : ''}>${t.id} &nbsp; ${escapeHtml(t.name)}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">飞行设备
              <select class="m09-select" id="m09LvUav">
                ${FLEET.filter(f => f.status !== '离线维护').map(f => `<option value="${f.id}" ${f.id === lv.uavId ? 'selected' : ''}>${f.name}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">画面
              <select class="m09-select" id="m09LvFeed">
                <option value="visible" ${lv.feedMode === 'visible' ? 'selected' : ''}>可见光</option>
                <option value="thermal" ${lv.feedMode === 'thermal' ? 'selected' : ''}>热成像</option>
              </select>
            </label>
          </div>
          <div class="m09-filter-group">
            <span class="status-tag ${lv.flightStatus === '执行中' ? 'info' : lv.flightStatus === '人工接管' ? 'warn' : 'ok'}">${lv.flightStatus}</span>
            <button class="m09-btn" id="m09LvTaskDetail">${SVG.doc} 任务详情</button>
          </div>
        </div>

        <!-- Main 2-Column Split -->
        <div class="m09-split-63-37">
          <!-- Left Viewport + Controls + Telemetry -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">${FLEET.find(f => f.id === lv.uavId)?.name || '无人机A01'} · ${lv.feedMode === 'thermal' ? '热成像画面' : '可见光画面'}</span></div>
              <div style="display:flex;gap:6px;">
                <span class="status-tag info">${lv.flightStatus}</span>
                <span class="status-tag" style="background:rgba(148,163,184,0.18);border-color:rgba(148,163,184,0.4);color:#cbd5e1;">模拟飞行</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m09-live-canvas-wrap">
                <canvas id="m09LiveCanvas" width="920" height="518"></canvas>
              </div>

              <!-- Media Action Bar -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-top:10px;flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:7px;flex-wrap:wrap;">
                  <button class="m09-btn primary" id="m09LvSnap">${SVG.camera} 截图取证${lv.snapshots.length ? ` (${lv.snapshots.length})` : ''}</button>
                  <button class="m09-btn ${lv.recording ? 'gold' : ''}" id="m09LvRec">${SVG.video} ${lv.recording ? '停止录制' : '录制片段'}</button>
                  <button class="m09-btn" id="m09LvMarkClue">${SVG.flag} 标记线索</button>
                  <button class="m09-btn" id="m09LvGimbal">${SVG.target} 云台视角</button>
                  <button class="m09-btn" id="m09LvFull">${SVG.fullscreen} 全屏</button>
                </div>
                <span style="font-size:12px;color:var(--text-sub);">${secLabel(task.secId)}·${escapeHtml(task.target)}</span>
              </div>

              <!-- 6 Telemetry Cards -->
              <div class="m09-telemetry-6">
                <div class="m09-tel-card"><div class="m09-tel-k">电量</div><div class="m09-tel-v green" id="m09LvBat">${lv.battery}<span>%</span></div></div>
                <div class="m09-tel-card"><div class="m09-tel-k">通信</div><div class="m09-tel-v green">正常</div></div>
                <div class="m09-tel-card"><div class="m09-tel-k">相对航高</div><div class="m09-tel-v">${lv.altitude}<span>m</span></div></div>
                <div class="m09-tel-card"><div class="m09-tel-k">飞行速度</div><div class="m09-tel-v">${lv.speed.toFixed(1)}<span>m/s</span></div></div>
                <div class="m09-tel-card"><div class="m09-tel-k">已飞时间</div><div class="m09-tel-v" id="m09LvTime">${formatSecMMSS(lv.elapsedSec)}</div></div>
                <div class="m09-tel-card"><div class="m09-tel-k">航点</div><div class="m09-tel-v" id="m09LvWp">${wpCur} / 12</div></div>
              </div>

              <!-- Flight Control Bar -->
              <div style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding-top:8px;border-top:1px solid rgba(56,189,248,0.18);flex-wrap:wrap;">
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="status-tag ok">授权已核验</span>
                  <span style="font-size:12px;color:var(--text-sub);">飞行操作（模拟）</span>
                </div>
                <div style="display:flex;align-items:center;gap:7px;">
                  <button class="m09-btn" id="m09LvPause">${lv.flightStatus === '执行中' ? `${SVG.pause} 暂停巡检` : `${SVG.play} 继续巡检`}</button>
                  <button class="m09-btn" id="m09LvRth">${SVG.home} 返航</button>
                  <button class="m09-btn gold" id="m09LvTakeover">${SVG.lock} 申请接管</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: 航线地图 + 任务信息 + 巡检事件 -->
          <div style="display:flex;flex-direction:column;gap:11px;">
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">航线地图</span></div>
                <div style="display:inline-flex;gap:10px;font-size:11.5px;color:#cfe6ff;">
                  <span class="m09-legend-item"><span class="m09-line-solid"></span> 已飞</span>
                  <span class="m09-legend-item"><span class="m09-line-dash"></span> 规划</span>
                </div>
              </div>
              <div class="panel-body">
                <div id="m09LvMiniMap">${buildMiniRouteMapSvg()}</div>
                <div style="display:flex;justify-content:space-between;font-size:12px;margin:7px 0 4px;">
                  <span id="m09LvProgTxt" style="color:var(--text-sub);">已到达 ${wpCur} / 12 航点</span>
                  <strong style="color:#38f2ff;">${wpPct}%</strong>
                </div>
                <div class="m09-cov-track"><div class="m09-cov-fill" id="m09LvProgFill" style="width:${wpPct}%;"></div></div>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">任务信息</span></div>
                <span class="status-tag ok">飞前检查已通过</span>
              </div>
              <div class="panel-body">
                <div class="m09-kv-row"><span class="m09-kv-k">执行任务</span><span class="m09-kv-v">${task.id}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">巡检对象</span><span class="m09-kv-v">${secLabel(task.secId)}·${escapeHtml(task.target)}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">航线 / 机巢</span><span class="m09-kv-v">${task.routeCode} / ${task.hangar}</span></div>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">巡检事件</span></div>
                <button class="m09-link-btn" id="m09LvLogs">查看飞行记录 ${SVG.chevronR}</button>
              </div>
              <div class="panel-body" style="padding-top:6px;">
                ${lv.events.slice(0, 4).map(ev => `
                  <div class="m09-kv-row">
                    <span style="color:#38f2ff;font-weight:700;font-variant-numeric:tabular-nums;min-width:44px;">${ev.time}</span>
                    <span style="flex:1;color:#e6f2ff;">${escapeHtml(ev.text)}</span>
                  </div>
                `).join('')}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    drawLiveVideoFrame(document.getElementById('m09LiveCanvas'));
    startLiveLoops(hostEl, ctx);

    // Event bindings
    hostEl.querySelector('#m09LvTask').addEventListener('change', e => { lv.taskId = e.target.value; renderLive(hostEl, ctx); });
    hostEl.querySelector('#m09LvUav').addEventListener('change', e => { lv.uavId = e.target.value; renderLive(hostEl, ctx); });
    hostEl.querySelector('#m09LvFeed').addEventListener('change', e => { lv.feedMode = e.target.value; renderLive(hostEl, ctx); });
    hostEl.querySelector('#m09LvTaskDetail').addEventListener('click', () => {
      ctx.openModal(`任务详情 · ${task.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>任务名称</span><strong>${escapeHtml(task.name)}</strong></div>
          <div class="detail-stat-card"><span>巡检对象</span><strong>${secLabel(task.secId)}·${escapeHtml(task.target)}</strong></div>
          <div class="detail-stat-card"><span>关联航线</span><strong>${task.routeCode}</strong></div>
        </div>
        <div class="meta-table">
          <div class="meta-row"><span class="meta-key">执行设备</span><span class="meta-val">${task.uav}</span></div>
          <div class="meta-row"><span class="meta-key">关联机巢</span><span class="meta-val">${task.hangar}</span></div>
          <div class="meta-row"><span class="meta-key">检查内容</span><span class="meta-val">${task.checks.join('、')}</span></div>
        </div>
      `);
    });

    hostEl.querySelector('#m09LvSnap').addEventListener('click', () => {
      const canvas = document.getElementById('m09LiveCanvas');
      let dataUrl = '';
      try { dataUrl = canvas.toDataURL('image/png'); } catch (e) {}
      const snapName = `SNAP_${Date.now().toString().slice(-4)}.png`;
      lv.snapshots.unshift({ name: snapName, time: formatSecMMSS(lv.elapsedSec), url: dataUrl });
      lv.events.unshift({ time: '09:31', text: `截图取证已保存（${snapName}）` });
      renderLive(hostEl, ctx);
      ctx.showToast(`截图取证成功：${snapName}`);
    });

    hostEl.querySelector('#m09LvRec').addEventListener('click', () => {
      lv.recording = !lv.recording;
      if (lv.recording) {
        lv.recSeconds = 0;
        ctx.showToast('已开始录制实时巡检视频片段');
      } else {
        lv.events.unshift({ time: '09:31', text: `已保存巡检录像片段（时长 ${formatSecMMSS(lv.recSeconds)}）` });
        ctx.showToast(`录像片段已保存（${formatSecMMSS(lv.recSeconds)}）`);
      }
      renderLive(hostEl, ctx);
    });

    hostEl.querySelector('#m09LvMarkClue').addEventListener('click', () => {
      ctx.openModal('标记巡检疑似隐患线索', `
        <div class="m09-form-grid-2" style="margin-bottom:12px;">
          <div class="m09-form-item" style="grid-column:1 / -1;"><span class="m09-form-lbl">线索标题</span><input class="m09-input" id="m09MkTitle" value="疑似材料占道堆放" /></div>
          <div class="m09-form-item"><span class="m09-form-lbl">隐患类别</span><input class="m09-input" id="m09MkCat" value="消防通道占用" /></div>
          <div class="m09-form-item"><span class="m09-form-lbl">关联航点</span><input class="m09-input" id="m09MkWp" value="航点${String(wpCur).padStart(2, '0')}" /></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn primary" id="m09MkOk">保存并推送至隐患识别</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09MkOk')?.addEventListener('click', () => {
          const title = document.getElementById('m09MkTitle').value.trim() || '疑似现场安全线索';
          const cat = document.getElementById('m09MkCat').value.trim() || '消防通道占用';
          const wpName = document.getElementById('m09MkWp').value.trim();
          const newId = `UAI-20261126-00${ui.hazards.clues.length + 1}`;
          ui.hazards.clues.unshift({
            id: newId, title, secId: task.secId, location: `${secLabel(task.secId)}·${task.target}`,
            scene: task.scene, time: '2026-11-26 09:31:15', shortTime: '11-26 09:31', status: '待核查',
            taskId: task.id, waypoint: wpName, imgName: 'IMG_LIVE_01.jpg', wpLabel: wpName,
            category: cat, rule: '人工实时标记', source: '无人机A01·可见光',
            reviewer: '核查人员A（演示）', note: '实时巡检画面人工标记线索，待核查确认。',
            imgSrc: 'milestone_before.jpg', box: { x: 0.56, y: 0.44, w: 0.24, h: 0.31 }, linkedHazard: ''
          });
          lv.events.unshift({ time: '09:31', text: `人工标记疑似线索 ${newId}（${title}）` });
          ctx.closeModal();
          renderLive(hostEl, ctx);
          ctx.showToast(`已标记线索 ${newId}，可在「隐患识别」中核查`);
        });
      }, 0);
    });

    hostEl.querySelector('#m09LvGimbal').addEventListener('click', () => {
      ctx.openModal('云台相机姿态控制（模拟）', `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <label class="m09-form-item"><span class="m09-form-lbl">俯仰角 Pitch (<strong id="m09GmPVal">${lv.gimbalPitch}°</strong>)</span>
            <input type="range" min="-90" max="0" value="${lv.gimbalPitch}" id="m09GmPitch" />
          </label>
          <label class="m09-form-item"><span class="m09-form-lbl">偏航角 Yaw (<strong id="m09GmYVal">${lv.gimbalYaw}°</strong>)</span>
            <input type="range" min="-45" max="45" value="${lv.gimbalYaw}" id="m09GmYaw" />
          </label>
          <label class="m09-form-item"><span class="m09-form-lbl">光学变焦 (<strong id="m09GmZVal">${lv.gimbalZoom.toFixed(1)}×</strong>)</span>
            <input type="range" min="1" max="2.2" step="0.1" value="${lv.gimbalZoom}" id="m09GmZoom" />
          </label>
          <div style="display:flex;justify-content:flex-end;gap:8px;">
            <button class="m09-btn" id="m09GmReset">归中复位</button>
            <button class="m09-btn primary" id="m09GmClose">确定</button>
          </div>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09GmPitch')?.addEventListener('input', e => {
          lv.gimbalPitch = Number(e.target.value);
          document.getElementById('m09GmPVal').textContent = `${lv.gimbalPitch}°`;
        });
        document.getElementById('m09GmYaw')?.addEventListener('input', e => {
          lv.gimbalYaw = Number(e.target.value);
          document.getElementById('m09GmYVal').textContent = `${lv.gimbalYaw}°`;
        });
        document.getElementById('m09GmZoom')?.addEventListener('input', e => {
          lv.gimbalZoom = Number(e.target.value);
          document.getElementById('m09GmZVal').textContent = `${lv.gimbalZoom.toFixed(1)}×`;
        });
        document.getElementById('m09GmReset')?.addEventListener('click', () => {
          lv.gimbalPitch = -45; lv.gimbalYaw = 0; lv.gimbalZoom = 1.0;
          ctx.closeModal();
          ctx.showToast('云台已归中复位');
        });
        document.getElementById('m09GmClose')?.addEventListener('click', () => ctx.closeModal());
      }, 0);
    });

    hostEl.querySelector('#m09LvFull').addEventListener('click', () => {
      const srcCanvas = document.getElementById('m09LiveCanvas');
      let imgUrl = ASSET_BASE + 'milestone_before.jpg';
      try { imgUrl = srcCanvas.toDataURL('image/png'); } catch (e) {}
      ctx.openModal(`全屏实时画面 · ${task.id}`, `
        <img src="${imgUrl}" style="width:100%;border-radius:8px;border:1px solid rgba(56,189,248,0.4);" />
      `);
    });

    hostEl.querySelector('#m09LvPause').addEventListener('click', () => {
      if (lv.flightStatus === '执行中') {
        lv.flightStatus = '已暂停';
        lv.events.unshift({ time: '09:31', text: '操作员触发悬停暂停巡检' });
        ctx.showToast('无人机已在当前航点安全悬停');
      } else {
        lv.flightStatus = '执行中';
        lv.events.unshift({ time: '09:31', text: '恢复自动航线巡检飞行' });
        ctx.showToast('已恢复自动巡检飞行');
      }
      renderLive(hostEl, ctx);
    });

    hostEl.querySelector('#m09LvRth').addEventListener('click', () => {
      ctx.openModal('确认一键返航指令', `
        <p style="font-size:13px;color:#e6f2ff;margin:0 0 14px;">是否向 <strong>无人机A01</strong> 发送安全返航（RTH）指令？无人机将沿预设安全高度返回 <strong>${task.hangar}</strong>。</p>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn" id="m09RthNo">取消</button>
          <button class="m09-btn primary" id="m09RthYes">确认立即返航</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09RthNo')?.addEventListener('click', () => ctx.closeModal());
        document.getElementById('m09RthYes')?.addEventListener('click', () => {
          lv.flightStatus = '返航中';
          lv.events.unshift({ time: '09:31', text: `下发安全返航指令，正返回${task.hangar}` });
          ctx.closeModal();
          renderLive(hostEl, ctx);
          ctx.showToast('已触发无人机安全返航仿真');
        });
      }, 0);
    });

    hostEl.querySelector('#m09LvTakeover').addEventListener('click', () => {
      ctx.openModal('申请远程人工接管', `
        <div style="font-size:12.5px;color:#fde68a;margin-bottom:10px;">人工接管将切换为摇杆/指点飞行模式，需校验飞手资质授权码：</div>
        <div class="m09-form-item" style="margin-bottom:12px;">
          <span class="m09-form-lbl">接管口令（默认：JIHEI-UAV-01）</span>
          <input class="m09-input" id="m09TkCode" value="JIHEI-UAV-01" />
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn gold" id="m09TkOk">验证并接管控制权</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09TkOk')?.addEventListener('click', () => {
          lv.flightStatus = '人工接管';
          lv.events.unshift({ time: '09:31', text: '操作员已通过授权核验并接管飞行控制权' });
          ctx.closeModal();
          renderLive(hostEl, ctx);
          ctx.showToast('已进入远程人工接管模式');
        });
      }, 0);
    });

    hostEl.querySelector('#m09LvLogs').addEventListener('click', () => {
      ctx.openModal(`飞行事件日志 · ${task.id}`, `
        <table class="data-table">
          <thead><tr><th>时间</th><th>事件记录</th></tr></thead>
          <tbody>
            ${lv.events.map(ev => `<tr><td style="color:#38f2ff;font-weight:700;">${ev.time}</td><td>${escapeHtml(ev.text)}</td></tr>`).join('')}
          </tbody>
        </table>
      `);
    });
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 5: 05_隐患识别 (hazards - opaque + AI/Raw inspection)
     ------------------------------------------------------------------------ */
  function buildClueImageCanvasHtml(clue, isAi) {
    const imgUrl = ASSET_BASE + (clue.imgSrc || 'milestone_before.jpg');
    const b = clue.box || { x: 0.56, y: 0.44, w: 0.24, h: 0.31 };
    const bx = (b.x * 100).toFixed(1);
    const by = (b.y * 100).toFixed(1);
    const bw = (b.w * 100).toFixed(1);
    const bh = (b.h * 100).toFixed(1);

    return `
      <div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.38);background:#071b3d;">
        <img src="${imgUrl}" style="width:100%;height:100%;object-fit:cover;display:block;" alt="${escapeHtml(clue.title)}"/>
        ${isAi ? `
          <div style="position:absolute;top:12px;left:12px;padding:4px 12px;border-radius:6px;background:rgba(92,62,8,0.88);border:1.5px solid #facc15;color:#fef08a;font-size:15px;font-weight:800;">判读演示</div>
          <div style="position:absolute;left:${bx}%;top:${by}%;width:${bw}%;height:${bh}%;border:2.5px dashed #facc15;background:rgba(250,204,21,0.12);border-radius:4px;box-shadow:0 0 12px rgba(250,204,21,0.35);">
            <div style="position:absolute;left:50%;top:-38px;transform:translateX(-50%);padding:4px 12px;border-radius:99px;background:rgba(128,84,8,0.94);border:1.5px solid #facc15;color:#fef08a;font-size:13px;font-weight:800;white-space:nowrap;">${escapeHtml(clue.title)}</div>
            <div style="position:absolute;left:50%;top:-12px;width:2px;height:12px;background:#facc15;"></div>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderHazards(hostEl, ctx) {
    const hState = ui.hazards;
    const kpiPool = hState.clues.filter(c => hState.secId === 'all' || c.secId === hState.secId);
    const kTotal = kpiPool.length;
    const kPending = kpiPool.filter(c => c.status === '待核查').length;
    const kConfirmed = kpiPool.filter(c => c.status === '已确认隐患').length;
    const kFalse = kpiPool.filter(c => c.status === '已标误报').length;
    const kDup = kpiPool.filter(c => c.status === '已关联重复').length;

    const filtered = hState.clues.filter(c => {
      if (hState.secId !== 'all' && c.secId !== hState.secId) return false;
      if (hState.scene !== '全部场景' && c.scene !== hState.scene) return false;
      if (hState.status !== '全部状态' && c.status !== hState.status) return false;
      return true;
    });

    // By default show pending first if status === '全部状态' so top 4 match PNG
    const ordered = [...filtered].sort((a, b) => (a.status === '待核查' ? -1 : 1) - (b.status === '待核查' ? -1 : 1));
    const listToShow = hState.status === '全部状态' ? ordered.filter(c => c.status === '待核查').concat(ordered.filter(c => c.status !== '待核查')) : ordered;
    let selClue = hState.clues.find(c => c.id === hState.selectedId) || listToShow[0] || hState.clues[0];
    if (selClue) hState.selectedId = selClue.id;

    hostEl.innerHTML = `
      <div class="m09-opaque-page">
        <!-- Top Filter Bar -->
        <div class="m09-filter-bar">
          <div class="m09-filter-group">
            <label class="m09-field-inline">所属工区
              <select class="m09-select" id="m09HzSec">
                <option value="all" ${hState.secId === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${hState.secId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">巡检场景
              <select class="m09-select" id="m09HzScene">
                ${['全部场景', '料场巡检', '施工保通', '桥梁专项', '路基边坡'].map(v => `<option value="${v}" ${hState.scene === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">核查状态
              <select class="m09-select" id="m09HzStatus">
                ${['全部状态', '待核查', '已确认隐患', '已标误报', '已关联重复'].map(v => `<option value="${v}" ${hState.status === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">统计周期
              <select class="m09-select"><option selected>2026年11月</option><option>2026年10月</option></select>
            </label>
          </div>
          <div class="m09-filter-group">
            <button class="m09-btn primary" id="m09HzQuery">${SVG.search} 查询</button>
            <button class="m09-btn" id="m09HzReset">${SVG.reset} 重置</button>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="m09-section-title"><span class="panel-accent-bar"></span> 识别与核查概况 <small>(${hState.period})</small></div>
        <div class="m09-kpi-5">
          <div class="m09-kpi-card" data-hz-kpi="全部状态">
            <div class="m09-kpi-icon">${SVG.drone}</div>
            <div><div class="m09-kpi-lbl">本期识别线索</div><div class="m09-kpi-num">${kTotal}<span>条</span></div></div>
          </div>
          <div class="m09-kpi-card" data-hz-kpi="待核查">
            <div class="m09-kpi-icon gold">${SVG.search}</div>
            <div><div class="m09-kpi-lbl">待核查</div><div class="m09-kpi-num gold">${kPending}<span>条</span></div></div>
          </div>
          <div class="m09-kpi-card" data-hz-kpi="已确认隐患">
            <div class="m09-kpi-icon green">${SVG.shield}</div>
            <div><div class="m09-kpi-lbl">已确认隐患</div><div class="m09-kpi-num">${kConfirmed}<span>项</span></div></div>
          </div>
          <div class="m09-kpi-card" data-hz-kpi="已标误报">
            <div class="m09-kpi-icon">${SVG.reset}</div>
            <div><div class="m09-kpi-lbl">已标误报</div><div class="m09-kpi-num">${kFalse}<span>条</span></div></div>
          </div>
          <div class="m09-kpi-card" data-hz-kpi="已关联重复">
            <div class="m09-kpi-icon">${SVG.link}</div>
            <div><div class="m09-kpi-lbl">已关联重复</div><div class="m09-kpi-num">${kDup}<span>条</span></div></div>
          </div>
        </div>

        <!-- 3-Column Workspace -->
        <div class="m09-split-3col">
          <!-- Left: Clue List + Linked Safety Ledger -->
          <div class="glass-panel" style="display:flex;flex-direction:column;">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">待核查线索</span></div>
              <span class="panel-subtitle">${kPending} 条</span>
            </div>
            <div class="panel-body" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="max-height:335px;overflow-y:auto;padding-right:2px;">
                ${listToShow.slice(0, 8).map(c => `
                  <div class="m09-list-card ${selClue && selClue.id === c.id ? 'active' : ''}" data-hz-clue="${c.id}">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                      <strong style="font-size:12px;color:#38f2ff;">${c.id}</strong>
                      <span class="status-tag ${statusTagClass(c.status)}">${c.status}</span>
                    </div>
                    <div style="font-size:13px;font-weight:700;color:#fff;margin:3px 0;">${escapeHtml(c.title)}</div>
                    <div style="font-size:11.5px;color:var(--text-sub);">${escapeHtml(c.location)}</div>
                    <div style="font-size:11px;color:var(--text-muted);margin-top:2px;">${c.shortTime}</div>
                  </div>
                `).join('')}
              </div>

              <div style="margin-top:10px;padding:10px;border-radius:8px;background:rgba(12,42,92,0.58);border:1px solid rgba(56,189,248,0.28);">
                <div style="font-size:12.5px;font-weight:700;color:#fff;margin-bottom:6px;">已关联安全台账</div>
                <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;margin-bottom:6px;">
                  <span style="font-size:12px;color:#dbeafe;">AQ-202611-018·临边防护缺失</span>
                  <span class="status-tag warn">待复查</span>
                </div>
                <button class="m09-link-btn" id="m09HzViewSafety">查看隐患详情 ${SVG.chevronR}</button>
              </div>
            </div>
          </div>

          <!-- Center: AI识别影像 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">AI识别影像</span></div>
              <div style="display:flex;gap:6px;">
                <button class="m09-btn" id="m09HzFullImg" style="padding:4px 10px;">${SVG.image} 查看原图</button>
                <button class="m09-btn" id="m09HzLocateMap" style="padding:4px 10px;">${SVG.target} 地图定位</button>
              </div>
            </div>
            <div class="panel-body">
              ${selClue ? `
                ${buildClueImageCanvasHtml(selClue, hState.viewMode === 'ai')}
                <div style="display:flex;justify-content:space-between;font-size:12px;color:var(--text-sub);margin:7px 0 10px;">
                  <span>${selClue.imgName}</span>
                  <span>${selClue.time}</span>
                  <span>${selClue.wpLabel}</span>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1.35fr;gap:10px;align-items:stretch;">
                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                    <div class="m09-list-card ${hState.viewMode === 'raw' ? 'active' : ''}" id="m09HzModeRaw" style="margin-bottom:0;padding:5px;text-align:center;">
                      <img src="${ASSET_BASE}${selClue.imgSrc}" style="width:100%;height:52px;object-fit:cover;border-radius:4px;"/>
                      <div style="font-size:11.5px;margin-top:3px;">原始影像</div>
                    </div>
                    <div class="m09-list-card ${hState.viewMode === 'ai' ? 'active' : ''}" id="m09HzModeAi" style="margin-bottom:0;padding:5px;text-align:center;">
                      <img src="${ASSET_BASE}${selClue.imgSrc}" style="width:100%;height:52px;object-fit:cover;border-radius:4px;border:1px dashed #facc15;"/>
                      <div style="font-size:11.5px;margin-top:3px;">AI标注影像</div>
                    </div>
                  </div>
                  <div style="padding:7px 10px;border-radius:7px;background:rgba(12,42,92,0.52);border:1px solid rgba(56,189,248,0.22);">
                    <div class="m09-kv-row" style="padding:3px 0;"><span class="m09-kv-k">巡检场景</span><span class="m09-kv-v">${selClue.scene}</span></div>
                    <div class="m09-kv-row" style="padding:3px 0;"><span class="m09-kv-k">识别规则</span><span class="m09-kv-v">${selClue.rule}</span></div>
                    <div class="m09-kv-row" style="padding:3px 0;border-bottom:none;"><span class="m09-kv-k">证据来源</span><span class="m09-kv-v">${selClue.source}</span></div>
                  </div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right: 人工核查 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">人工核查</span></div>
            </div>
            <div class="panel-body">
              ${selClue ? `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <strong style="font-size:15px;color:#fff;">${selClue.id}</strong>
                  <span class="status-tag ${statusTagClass(selClue.status)}">${selClue.status}</span>
                </div>
                <div class="m09-kv-row"><span class="m09-kv-k">关联任务</span><span class="m09-kv-v">${selClue.taskId}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">工程位置</span><span class="m09-kv-v">${escapeHtml(selClue.location)}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">发现时间</span><span class="m09-kv-v">${selClue.time}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">关联航点</span><span class="m09-kv-v">${escapeHtml(selClue.waypoint)}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">建议类别</span><span class="m09-kv-v" style="color:#facc15;">${escapeHtml(selClue.category)}</span></div>
                <div class="m09-kv-row" style="margin-bottom:8px;"><span class="m09-kv-k">核查人</span><span class="m09-kv-v">${escapeHtml(selClue.reviewer)}</span></div>
                <div class="m09-form-item" style="margin-bottom:10px;">
                  <span class="m09-form-lbl">核查说明</span>
                  <textarea class="m09-input" id="m09HzNote" rows="3" style="resize:vertical;font-family:inherit;">${escapeHtml(selClue.note)}</textarea>
                </div>
                <button class="m09-btn primary" id="m09HzConfirmPush" style="width:100%;margin-bottom:8px;padding:8px 12px;">
                  ${SVG.check} 确认并推送安全管理
                </button>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:10px;">
                  <button class="m09-btn" id="m09HzFalsePos">⊗ 标记误报</button>
                  <button class="m09-btn" id="m09HzLinkDup">${SVG.link} 关联已有隐患</button>
                </div>
                <div class="m09-hint-box">ⓘ 人工确认后，关联隐患编号及取证影像将同步至安全管理。</div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events
    hostEl.querySelector('#m09HzSec').addEventListener('change', e => { hState.secId = e.target.value; renderHazards(hostEl, ctx); });
    hostEl.querySelector('#m09HzScene').addEventListener('change', e => { hState.scene = e.target.value; renderHazards(hostEl, ctx); });
    hostEl.querySelector('#m09HzStatus').addEventListener('change', e => { hState.status = e.target.value; renderHazards(hostEl, ctx); });
    hostEl.querySelector('#m09HzQuery').addEventListener('click', () => { renderHazards(hostEl, ctx); ctx.showToast(`共匹配 ${filtered.length} 条识别线索`); });
    hostEl.querySelector('#m09HzReset').addEventListener('click', () => {
      hState.secId = 'all'; hState.scene = '全部场景'; hState.status = '全部状态';
      renderHazards(hostEl, ctx);
    });
    hostEl.querySelectorAll('[data-hz-kpi]').forEach(el => el.addEventListener('click', () => {
      hState.status = el.dataset.hzKpi;
      renderHazards(hostEl, ctx);
    }));
    hostEl.querySelectorAll('[data-hz-clue]').forEach(el => el.addEventListener('click', () => {
      hState.selectedId = el.dataset.hzClue;
      renderHazards(hostEl, ctx);
    }));
    hostEl.querySelector('#m09HzModeRaw')?.addEventListener('click', () => { hState.viewMode = 'raw'; renderHazards(hostEl, ctx); });
    hostEl.querySelector('#m09HzModeAi')?.addEventListener('click', () => { hState.viewMode = 'ai'; renderHazards(hostEl, ctx); });

    hostEl.querySelector('#m09HzFullImg')?.addEventListener('click', () => {
      if (!selClue) return;
      ctx.openModal(`原始高清取证影像 · ${selClue.imgName}`, `
        <img src="${ASSET_BASE}${selClue.imgSrc}" style="width:100%;border-radius:8px;border:1px solid rgba(56,189,248,0.4);" />
        <div style="display:flex;justify-content:space-between;font-size:12px;color:#bae6fd;margin-top:8px;">
          <span>${escapeHtml(selClue.location)} · ${escapeHtml(selClue.waypoint)}</span>
          <span>${selClue.time}</span>
        </div>
      `);
    });

    hostEl.querySelector('#m09HzLocateMap')?.addEventListener('click', () => {
      if (!selClue) return;
      ctx.openModal(`线索点位三维定位 · ${selClue.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>工程位置</span><strong>${escapeHtml(selClue.location)}</strong></div>
          <div class="detail-stat-card"><span>关联航点</span><strong>${escapeHtml(selClue.waypoint)}</strong></div>
          <div class="detail-stat-card"><span>坐标示意</span><strong>126.1152°E, 47.5105°N</strong></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
          <button class="m09-btn primary" id="m09HzJumpMap">前往三维航线地图查看</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09HzJumpMap')?.addEventListener('click', () => {
          ctx.closeModal();
          ctx.switchModule('uav', 'routes');
        });
      }, 0);
    });

    hostEl.querySelector('#m09HzViewSafety').addEventListener('click', () => {
      ctx.openModal('关联安全台账 · AQ-202611-018', `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>隐患编号</span><strong>AQ-202611-018</strong></div>
          <div class="detail-stat-card"><span>隐患名称</span><strong>临边防护缺失</strong></div>
          <div class="detail-stat-card"><span>当前状态</span><strong style="color:#facc15;">待复查</strong></div>
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:10px;">
          <button class="m09-btn primary" id="m09HzToSafetyMod">进入「安全管理」台账</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09HzToSafetyMod')?.addEventListener('click', () => {
          ctx.closeModal();
          ctx.switchModule('safety');
        });
      }, 0);
    });

    hostEl.querySelector('#m09HzConfirmPush')?.addEventListener('click', () => {
      if (!selClue) return;
      selClue.note = hostEl.querySelector('#m09HzNote').value;
      selClue.status = '已确认隐患';
      selClue.linkedHazard = selClue.linkedHazard || `AQ-202611-0${40 + Math.floor(Math.random() * 50)}`;
      renderHazards(hostEl, ctx);
      ctx.showToast(`已确认隐患并推送安全管理台账（${selClue.linkedHazard}）`);
    });

    hostEl.querySelector('#m09HzFalsePos')?.addEventListener('click', () => {
      if (!selClue) return;
      selClue.note = hostEl.querySelector('#m09HzNote').value;
      selClue.status = '已标误报';
      renderHazards(hostEl, ctx);
      ctx.showToast(`已将线索 ${selClue.id} 标记为误报`);
    });

    hostEl.querySelector('#m09HzLinkDup')?.addEventListener('click', () => {
      if (!selClue) return;
      ctx.openModal(`关联已有安全隐患 · ${selClue.id}`, `
        <div style="font-size:12.5px;color:#bae6fd;margin-bottom:10px;">请选择要关联归并的现有安全管理台账记录：</div>
        <div style="display:flex;flex-direction:column;gap:7px;margin-bottom:12px;">
          ${['AQ-202611-018 · 二工区桥梁2号墩临边防护缺失', 'AQ-202611-041 · 二工区料场A消防通道占用', 'AQ-202611-021 · 一工区保通段导改水马偏移'].map(item => `
            <label style="display:flex;align-items:center;gap:8px;padding:8px 10px;border-radius:7px;background:rgba(12,42,92,0.58);border:1px solid rgba(56,189,248,0.28);cursor:pointer;font-size:12.5px;">
              <input type="radio" name="m09LinkAq" value="${item.split(' ')[0]}" checked style="accent-color:#38f2ff;"/>
              <span>${item}</span>
            </label>
          `).join('')}
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="m09-btn primary" id="m09LinkConfirm">确认关联为重复线索</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09LinkConfirm')?.addEventListener('click', () => {
          const picked = document.querySelector('input[name="m09LinkAq"]:checked')?.value || 'AQ-202611-018';
          selClue.status = '已关联重复';
          selClue.linkedHazard = picked;
          ctx.closeModal();
          renderHazards(hostEl, ctx);
          ctx.showToast(`已将 ${selClue.id} 关联至已有隐患 ${picked}`);
        });
      }, 0);
    });
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 6: 06_巡检报告 (reports - opaque + A4 preview & comparison)
     ------------------------------------------------------------------------ */
  function buildA4PreviewHtml(rpt, pageNo) {
    if (pageNo === 2) {
      return `
        <div class="m09-a4-sheet">
          <div style="display:flex;justify-content:space-between;color:#64748b;font-size:11.5px;">
            <span>吉黑高速明水至北安段</span>
            <span>第 2 页 / 共 2 页</span>
          </div>
          <div class="m09-a4-title">${escapeHtml(rpt.title)} · 飞行与取证附表</div>
          <div class="m09-a4-sec-h">三、飞行参数与航点取证清单</div>
          <table class="m09-a4-meta">
            <tr><td class="k">航点序号</td><td class="k">部位名称</td><td class="k">相对航高</td><td class="k">采集影像</td></tr>
            <tr><td>WP-01</td><td>起降点与机巢核验</td><td>30 m</td><td>2 张全景</td></tr>
            <tr><td>WP-03</td><td>${escapeHtml(rpt.location)}</td><td>42 m</td><td>${rpt.mediaSummary}</td></tr>
            <tr><td>WP-07</td><td>同点位复查核验区</td><td>40 m</td><td>同角度对比影像</td></tr>
          </table>
          <div class="m09-a4-sec-h">四、核查意见与归档签章</div>
          <p style="margin:4px 0 8px;">本报告由无人机巡检子系统自动汇总飞行轨迹、遥测参数及人工核查结论生成。</p>
          <div class="m09-a4-note">归档校验码：JH-${rpt.id.slice(-8)} · 归档时间：${rpt.archiveTime}</div>
        </div>
      `;
    }

    return `
      <div class="m09-a4-sheet">
        <div style="display:flex;justify-content:space-between;color:#64748b;font-size:11.5px;">
          <span>吉黑高速明水至北安段</span>
          <span>报告示意</span>
        </div>
        <div class="m09-a4-title">${escapeHtml(rpt.title)}</div>
        <table class="m09-a4-meta">
          <tr>
            <td class="k">报告编号</td><td>${rpt.id}</td>
            <td class="k">关联任务</td><td>${rpt.taskId}</td>
          </tr>
          <tr>
            <td class="k">复查位置</td><td>${escapeHtml(rpt.location)}</td>
            <td class="k">复查日期</td><td>${rpt.date}</td>
          </tr>
          <tr>
            <td class="k">新采影像</td><td>${rpt.mediaSummary}</td>
            <td class="k">原巡检任务</td><td>${rpt.origTaskId}</td>
          </tr>
        </table>
        <div class="m09-a4-sec-h">一、复查概况</div>
        <p style="margin:4px 0 10px;color:#334155;">${escapeHtml(rpt.summary)}</p>
        <div class="m09-a4-sec-h">二、关联隐患与证据</div>
        <div style="display:grid;grid-template-columns:1.15fr 1fr;gap:12px;align-items:center;margin-top:6px;">
          <div style="font-size:12px;line-height:1.8;">
            <div><span style="color:#64748b;">关联隐患</span> &nbsp; <strong>${rpt.hazardId}</strong></div>
            <div><span style="color:#64748b;">问题描述</span> &nbsp; <strong>${escapeHtml(rpt.hazardDesc)}</strong></div>
            <div><span style="color:#64748b;">复查取证</span> &nbsp; ${escapeHtml(rpt.recheckEvidence)}</div>
            <div><span style="color:#64748b;">办理状态</span> &nbsp; <strong style="color:#b45309;">${escapeHtml(rpt.handleStatus)}</strong></div>
          </div>
          <img src="${ASSET_BASE}milestone_after.jpg" style="width:100%;height:112px;object-fit:cover;border-radius:4px;border:1px solid #cbd5e1;" />
        </div>
        <div class="m09-a4-note">原巡检与复查影像已随报告归档，隐患办理状态以安全管理台账为准。</div>
      </div>
    `;
  }

  function renderReports(hostEl, ctx) {
    const rState = ui.reports;
    const kpiPool = rState.list.filter(r => rState.secId === 'all' || r.secId === rState.secId);
    const kTotal = kpiPool.length;
    const kArchived = kpiPool.filter(r => r.status === '已归档').length;
    const kRecheck = kpiPool.filter(r => r.status === '待复查').length;
    const kDraft = kpiPool.filter(r => r.status === '草稿').length;
    const kSamePoint = kpiPool.filter(r => r.isRecheck).length;

    const filtered = rState.list.filter(r => {
      if (rState.secId !== 'all' && r.secId !== rState.secId) return false;
      if (rState.type !== '全部类型' && r.type !== rState.type) return false;
      if (rState.keyword.trim()) {
        const kw = rState.keyword.trim().toLowerCase();
        if (!r.title.toLowerCase().includes(kw) && !r.id.toLowerCase().includes(kw) && !r.taskId.toLowerCase().includes(kw)) return false;
      }
      return true;
    });

    let selRpt = rState.list.find(r => r.id === rState.selectedId) || filtered[0] || rState.list[0];
    if (selRpt) rState.selectedId = selRpt.id;

    hostEl.innerHTML = `
      <div class="m09-opaque-page">
        <!-- Top Filter Bar -->
        <div class="m09-filter-bar">
          <div class="m09-filter-group">
            <label class="m09-field-inline">所属工区
              <select class="m09-select" id="m09RpSec">
                <option value="all" ${rState.secId === 'all' ? 'selected' : ''}>全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${rState.secId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">报告类型
              <select class="m09-select" id="m09RpType">
                ${['全部类型', '复查报告', '全面巡检报告', '专项巡检报告'].map(v => `<option value="${v}" ${rState.type === v ? 'selected' : ''}>${v}</option>`).join('')}
              </select>
            </label>
            <label class="m09-field-inline">报告日期
              <select class="m09-select"><option selected>2026年11月</option><option>2026年10月</option></select>
            </label>
            <label class="m09-field-inline">关键词
              <input class="m09-input" id="m09RpKw" placeholder="报告名称或任务编号" value="${escapeHtml(rState.keyword)}" style="width:170px;"/>
            </label>
          </div>
          <div class="m09-filter-group">
            <button class="m09-btn primary" id="m09RpQuery">${SVG.search} 查询</button>
            <button class="m09-btn" id="m09RpReset">${SVG.reset} 重置</button>
            <button class="m09-btn" id="m09RpNewDraft">+ 生成报告草稿</button>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="m09-section-title"><span class="panel-accent-bar"></span> 报告归档概况 <small>(${rState.dateFilter})</small></div>
        <div class="m09-kpi-5">
          <div class="m09-kpi-card">
            <div class="m09-kpi-icon">${SVG.doc}</div>
            <div><div class="m09-kpi-lbl">本期报告</div><div class="m09-kpi-num">${kTotal}<span>份</span></div></div>
          </div>
          <div class="m09-kpi-card">
            <div class="m09-kpi-icon green">${SVG.save}</div>
            <div><div class="m09-kpi-lbl">已归档</div><div class="m09-kpi-num green">${kArchived}<span>份</span></div></div>
          </div>
          <div class="m09-kpi-card">
            <div class="m09-kpi-icon gold">${SVG.search}</div>
            <div><div class="m09-kpi-lbl">待复查</div><div class="m09-kpi-num gold">${kRecheck}<span>份</span></div></div>
          </div>
          <div class="m09-kpi-card">
            <div class="m09-kpi-icon">${SVG.draw}</div>
            <div><div class="m09-kpi-lbl">报告草稿</div><div class="m09-kpi-num">${kDraft}<span>份</span></div></div>
          </div>
          <div class="m09-kpi-card">
            <div class="m09-kpi-icon">${SVG.video}</div>
            <div><div class="m09-kpi-lbl">同点位复查记录</div><div class="m09-kpi-num">${kSamePoint}<span>次</span></div></div>
          </div>
        </div>

        <!-- 3-Column Workspace -->
        <div class="m09-split-3col">
          <!-- Left: Report List -->
          <div class="glass-panel" style="display:flex;flex-direction:column;">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">巡检报告列表</span></div>
              <span class="panel-subtitle">本期 ${kTotal} 份</span>
            </div>
            <div class="panel-body" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;">
              <div style="max-height:330px;overflow-y:auto;">
                ${filtered.slice(0, 8).map(r => `
                  <div class="m09-list-card ${selRpt && selRpt.id === r.id ? 'active' : ''}" data-rp-id="${r.id}">
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:6px;">
                      <strong style="font-size:13px;color:#fff;">${escapeHtml(r.title)}</strong>
                      <span class="status-tag ${statusTagClass(r.status)}">${r.status}</span>
                    </div>
                    <div style="font-size:11.5px;color:var(--text-sub);margin-top:3px;">${r.id}</div>
                    <div style="font-size:11px;color:var(--text-muted);">${r.taskId}</div>
                  </div>
                `).join('')}
              </div>
              ${selRpt ? `
                <div style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(56,189,248,0.18);">
                  <div class="m09-kv-row"><span class="m09-kv-k">${SVG.route} 飞行记录</span><span class="m09-kv-v">${selRpt.flightRecCount} 条</span></div>
                  <div class="m09-kv-row"><span class="m09-kv-k">${SVG.image} 巡检与复查影像</span><span class="m09-kv-v">${selRpt.photoCount} 张</span></div>
                  <div class="m09-kv-row"><span class="m09-kv-k">${SVG.video} 录像</span><span class="m09-kv-v">${selRpt.videoCount} 段</span></div>
                  <div class="m09-kv-row"><span class="m09-kv-k">${SVG.link} 关联隐患</span><span class="m09-kv-v">${selRpt.hazardCount} 项</span></div>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Center: A4 Document Preview -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">巡检报告预览</span></div>
              ${selRpt ? `
                <div style="display:flex;align-items:center;gap:8px;">
                  <span class="status-tag ${statusTagClass(selRpt.status)}">${selRpt.status}</span>
                  <button class="m09-btn" id="m09RpPdf" style="padding:4px 10px;">${SVG.download} 下载 PDF</button>
                </div>
              ` : ''}
            </div>
            <div class="panel-body">
              ${selRpt ? `
                ${buildA4PreviewHtml(selRpt, rState.pageNo)}
                <div style="display:flex;align-items:center;justify-content:center;gap:10px;margin-top:11px;font-size:12px;color:var(--text-sub);">
                  <button class="m09-page-btn" id="m09RpPagePrev">&lt;</button>
                  <span>${rState.pageNo} / 2</span>
                  <button class="m09-page-btn" id="m09RpPageNext">&gt;</button>
                  <span style="margin-left:8px;">100%</span>
                  <span>归档于 ${selRpt.archiveTime}</span>
                </div>
              ` : ''}
            </div>
          </div>

          <!-- Right: 复查与关联成果 -->
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">复查与关联成果</span></div>
            </div>
            <div class="panel-body">
              ${selRpt ? `
                <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px;">
                  <strong style="font-size:15px;color:#fff;">${selRpt.hazardId}</strong>
                  <span class="status-tag ${statusTagClass(selRpt.hazardState)}">${selRpt.hazardState}</span>
                </div>
                <div class="m09-kv-row"><span class="m09-kv-k">发现问题</span><span class="m09-kv-v">${escapeHtml(selRpt.hazardDesc)}</span></div>
                <div class="m09-kv-row"><span class="m09-kv-k">工程位置</span><span class="m09-kv-v">${escapeHtml(selRpt.location)}</span></div>
                <div class="m09-kv-row" style="margin-bottom:10px;"><span class="m09-kv-k">复查方式</span><span class="m09-kv-v">无人机同点位取证</span></div>

                <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
                  <strong style="font-size:12.5px;color:#fff;">同点位影像对比</strong>
                  <button class="m09-link-btn" id="m09RpCompare">并排查看</button>
                </div>
                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:12px;">
                  <div style="text-align:center;">
                    <div style="position:relative;border-radius:6px;overflow:hidden;border:1px solid rgba(56,189,248,0.35);">
                      <img src="${ASSET_BASE}milestone_before.jpg" style="width:100%;height:78px;object-fit:cover;display:block;"/>
                      <div style="position:absolute;right:8%;bottom:16%;width:38%;height:32%;border:1.5px dashed #facc15;"></div>
                    </div>
                    <div style="font-size:11px;color:var(--text-sub);margin-top:4px;">原巡检 ${selRpt.origTime}</div>
                  </div>
                  <div style="text-align:center;">
                    <div style="position:relative;border-radius:6px;overflow:hidden;border:1px solid rgba(56,189,248,0.35);">
                      <img src="${ASSET_BASE}milestone_after.jpg" style="width:100%;height:78px;object-fit:cover;display:block;"/>
                      <div style="position:absolute;right:8%;bottom:16%;width:38%;height:32%;border:1.5px dashed #22c55e;"></div>
                    </div>
                    <div style="font-size:11px;color:var(--text-sub);margin-top:4px;">复查取证 ${selRpt.recheckTime}</div>
                  </div>
                </div>

                <!-- 3-step timeline -->
                <div style="display:flex;flex-direction:column;gap:8px;margin-bottom:12px;">
                  ${selRpt.timeline.map(tl => `
                    <div style="display:flex;align-items:center;gap:8px;font-size:12px;">
                      <span style="color:${tl.done ? '#38f2ff' : '#facc15'};">${tl.done ? '✓' : '○'}</span>
                      <span style="color:var(--text-muted);min-width:46px;">${tl.date}</span>
                      <span style="color:#e6f2ff;">${escapeHtml(tl.text)}</span>
                    </div>
                  `).join('')}
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;">
                  <button class="m09-btn" id="m09RpAllImgs">${SVG.image} 查看全部影像</button>
                  <button class="m09-btn primary" id="m09RpToSafety">${SVG.link} 进入安全管理</button>
                </div>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Bind events
    hostEl.querySelector('#m09RpSec').addEventListener('change', e => { rState.secId = e.target.value; renderReports(hostEl, ctx); });
    hostEl.querySelector('#m09RpType').addEventListener('change', e => { rState.type = e.target.value; renderReports(hostEl, ctx); });
    hostEl.querySelector('#m09RpQuery').addEventListener('click', () => {
      rState.keyword = hostEl.querySelector('#m09RpKw').value;
      renderReports(hostEl, ctx);
    });
    hostEl.querySelector('#m09RpReset').addEventListener('click', () => {
      rState.secId = 'all'; rState.type = '全部类型'; rState.keyword = '';
      renderReports(hostEl, ctx);
    });
    hostEl.querySelectorAll('[data-rp-id]').forEach(el => el.addEventListener('click', () => {
      rState.selectedId = el.dataset.rpId;
      rState.pageNo = 1;
      renderReports(hostEl, ctx);
    }));
    hostEl.querySelector('#m09RpPagePrev')?.addEventListener('click', () => { rState.pageNo = rState.pageNo === 2 ? 1 : 2; renderReports(hostEl, ctx); });
    hostEl.querySelector('#m09RpPageNext')?.addEventListener('click', () => { rState.pageNo = rState.pageNo === 1 ? 2 : 1; renderReports(hostEl, ctx); });

    hostEl.querySelector('#m09RpPdf')?.addEventListener('click', () => {
      if (!selRpt) return;
      ctx.openModal(`导出巡检报告 PDF · ${selRpt.id}`, `
        <div style="max-height:62vh;overflow-y:auto;margin-bottom:12px;">
          ${buildA4PreviewHtml(selRpt, 1)}
        </div>
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button class="m09-btn" id="m09PdfPrint">浏览器打印 / 另存为 PDF</button>
          <button class="m09-btn primary" id="m09PdfDownload">立即下载文档</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09PdfPrint')?.addEventListener('click', () => window.print());
        document.getElementById('m09PdfDownload')?.addEventListener('click', () => {
          ctx.closeModal();
          ctx.showToast(`已生成并开始下载 ${selRpt.id}_${selRpt.title}.pdf`);
        });
      }, 0);
    });

    const openCompareModal = () => {
      if (!selRpt) return;
      ctx.openModal(`同点位影像对比 · ${selRpt.hazardId}`, `
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;">
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#fde68a;margin-bottom:6px;">原巡检取证（${selRpt.origTime}）</div>
            <img src="${ASSET_BASE}milestone_before.jpg" style="width:100%;border-radius:8px;border:1.5px solid #facc15;" />
          </div>
          <div>
            <div style="font-size:12.5px;font-weight:700;color:#86efac;margin-bottom:6px;">无人机复查取证（${selRpt.recheckTime}）</div>
            <img src="${ASSET_BASE}milestone_after.jpg" style="width:100%;border-radius:8px;border:1.5px solid #22c55e;" />
          </div>
        </div>
      `);
    };
    hostEl.querySelector('#m09RpCompare')?.addEventListener('click', openCompareModal);
    hostEl.querySelector('#m09RpAllImgs')?.addEventListener('click', openCompareModal);
    hostEl.querySelector('#m09RpToSafety')?.addEventListener('click', () => ctx.switchModule('safety'));

    hostEl.querySelector('#m09RpNewDraft').addEventListener('click', () => {
      ctx.openModal('生成无人机巡检报告草稿', `
        <div class="m09-form-grid-2" style="margin-bottom:12px;">
          <div class="m09-form-item" style="grid-column:1 / -1;"><span class="m09-form-lbl">报告标题</span><input class="m09-input" id="m09DrTitle" value="二工区料场巡检复核报告（草稿）" /></div>
          <div class="m09-form-item"><span class="m09-form-lbl">关联任务</span>
            <select class="m09-select" id="m09DrTask">${ui.tasks.list.slice(0, 6).map(t => `<option value="${t.id}">${t.id} ${t.name}</option>`).join('')}</select>
          </div>
          <div class="m09-form-item"><span class="m09-form-lbl">报告类型</span>
            <select class="m09-select" id="m09DrType"><option>专项巡检报告</option><option>全面巡检报告</option><option>复查报告</option></select>
          </div>
        </div>
        <div style="display:flex;justify-content:flex-end;">
          <button class="m09-btn primary" id="m09DrCreate">生成报告草稿</button>
        </div>
      `);
      setTimeout(() => {
        document.getElementById('m09DrCreate')?.addEventListener('click', () => {
          const title = document.getElementById('m09DrTitle').value.trim() || '新建巡检报告草稿';
          const taskId = document.getElementById('m09DrTask').value;
          const type = document.getElementById('m09DrType').value;
          const tk = ui.tasks.list.find(t => t.id === taskId) || ui.tasks.list[0];
          const newId = `RPT-20261126-0${rState.list.length + 1}`;
          rState.list.unshift({
            id: newId, title, taskId: tk.id, origTaskId: tk.id,
            secId: tk.secId, location: `${secLabel(tk.secId)}·${tk.target}`, type, date: '2026-11-26',
            status: '草稿', archiveTime: '未归档（草稿）', mediaSummary: '照片12张·视频1段',
            flightRecCount: 1, photoCount: 12, videoCount: 1, hazardCount: 1, isRecheck: false,
            summary: `系统依据任务 ${tk.id} 自动汇总飞行记录与航拍取证生成的报告草稿。`,
            hazardId: 'AQ-202611-041', hazardDesc: '待人工复核关联问题', hazardState: '待复查',
            recheckEvidence: '已自动挂载本架次航拍图集。', handleStatus: '草稿待提交审核',
            origTime: '11-26 09:20', recheckTime: '11-26 10:15',
            timeline: [
              { date: '11-26', text: `关联任务 ${tk.id} 数据拉取完成`, done: true },
              { date: '11-26', text: '生成巡检报告草稿', done: true },
              { date: '待完成', text: '等待审核归档', done: false }
            ]
          });
          rState.selectedId = newId;
          rState.pageNo = 1;
          ctx.closeModal();
          renderReports(hostEl, ctx);
          ctx.showToast(`已生成报告草稿 ${newId}`);
        });
      }, 0);
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION (window.JIHEI_PLATFORM.registerModule)
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'uav',
    name: '无人机巡检',
    subPages: SUB_PAGES,

    getCesiumMode(subPageId) {
      return (subPageId === 'overview' || subPageId === 'routes') ? 'interactive' : 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      ensureStyles();
      lastCtx = ctx;

      const prevSub = lastSubPageId;
      lastSubPageId = subPageId;

      if (prevSub && prevSub !== subPageId) {
        stopTimers();
        if ((prevSub === 'overview' || prevSub === 'routes') && subPageId !== 'overview' && subPageId !== 'routes') {
          cleanupCesium(true);
        } else {
          cleanupCesium(false);
        }
      }

      if (subPageId === 'overview') {
        renderOverview(hostEl, ctx);
        if (prevSub !== 'overview' && ctx.cesium && ctx.cesium.ready) {
          scheduleCameraFly(() => flyCameraToBounds(ctx.cesium, 126.1150, 47.5080, 1850, -44));
        }
      } else if (subPageId === 'tasks') {
        renderTasks(hostEl, ctx);
      } else if (subPageId === 'routes') {
        renderRoutes(hostEl, ctx, prevSub === 'routes');
      } else if (subPageId === 'live') {
        renderLive(hostEl, ctx);
      } else if (subPageId === 'hazards') {
        renderHazards(hostEl, ctx);
      } else if (subPageId === 'reports') {
        renderReports(hostEl, ctx);
      }
    },

    onSectionChange(secId, subPageId) {
      if (!lastCtx) return;
      const hostEl = document.getElementById('moduleStageHost');
      if (!hostEl) return;
      if (cameraFlyTimer) {
        clearTimeout(cameraFlyTimer);
        cameraFlyTimer = null;
      }

      if (subPageId === 'overview') {
        ui.overview.secId = secId || 'all';
        renderOverview(hostEl, lastCtx);
        if (secId && lastCtx.cesium?.ready) lastCtx.cesium.flyToSection(secId);
        else flyCameraToBounds(lastCtx.cesium, 126.1150, 47.5080, 1850, -44);
      } else if (subPageId === 'routes') {
        if (secId) {
          const matchTpl = ui.routes.templates.find(t => t.secId === secId);
          if (matchTpl) ui.routes.selectedTplId = matchTpl.id;
          renderRoutes(hostEl, lastCtx, true);
          if (lastCtx.cesium?.ready) lastCtx.cesium.flyToSection(secId);
        } else {
          const tpl = getActiveTemplate();
          flyCameraToBounds(lastCtx.cesium, tpl.center[0], tpl.center[1] - 0.0007, 1700, -58);
        }
      } else if (subPageId === 'tasks') {
        ui.tasks.secId = secId || 'all';
        ui.tasks.page = 1;
        renderTasks(hostEl, lastCtx);
      } else if (subPageId === 'live') {
        if (secId) {
          const matchTask = ui.tasks.list.find(t => t.secId === secId);
          if (matchTask) ui.live.taskId = matchTask.id;
        }
        renderLive(hostEl, lastCtx);
      } else if (subPageId === 'hazards') {
        ui.hazards.secId = secId || 'all';
        renderHazards(hostEl, lastCtx);
      } else if (subPageId === 'reports') {
        ui.reports.secId = secId || 'all';
        renderReports(hostEl, lastCtx);
      }
    },

    onLeave() {
      stopTimers();
      cleanupCesium(true);
      lastSubPageId = null;
      const host = document.getElementById('moduleStageHost');
      if (host) host.innerHTML = '';
    }
  });
})();
