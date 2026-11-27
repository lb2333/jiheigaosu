/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 11：智慧提速 (js/modules/m11_speed.js)
   包含 5 个子页面：
     01_交通运行 (traffic)   — Cesium 三维走廊联动 + 试点监测 + 气象/视频预览
     02_算法研判 (algorithm) — 专项算法成果 + 短时队列预测 SVG 曲线 + 输入/校核
     03_速度策略 (strategy)  — 分车道速度策略表 + 策略对比 + 审核下发闭环
     04_执行反馈 (feedback)  — 三段式执行流水线 + 设备指令回执 + 超时重发闭环
     05_场景回放 (replay)    — Cesium 三维场景联动 + 同步回放曲线 + 时序事件轴
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'traffic', name: '交通运行' },
    { id: 'algorithm', name: '算法研判' },
    { id: 'strategy', name: '速度策略' },
    { id: 'feedback', name: '执行反馈' },
    { id: 'replay', name: '场景回放' }
  ];

  /* ------------------------------------------------------------------------
     PILOT SEGMENTS & GEOGRAPHIC CORRIDOR (G1211 明水 -> 北安)
     ------------------------------------------------------------------------ */
  const CORRIDOR_GEO = [
    [125.925, 47.372],
    [125.955, 47.412],
    [125.982, 47.452],
    [126.005, 47.532],
    [125.995, 47.628],
    [126.028, 47.742],
    [126.132, 47.835],
    [126.252, 47.926],
    [126.328, 48.028],
    [126.368, 48.138],
    [126.405, 48.222]
  ];

  const PILOT_SEGMENTS = [
    {
      id: 'QD-01',
      name: '桥梁受限段A',
      sectionId: 'sec2',
      sectionName: '二工区',
      stake: 'K26+400 ~ K27+800',
      lengthKm: 1.4,
      lon: 125.9820,
      lat: 47.4520,
      alt: 235,
      fallbackPct: { x: 41, y: 50 },
      spanCoords: [[125.962, 47.424], [125.974, 47.441], [125.982, 47.452], [125.991, 47.466]],
      camId: 'CAM-QD-01',
      weather: { temp: '-5.2 ℃', vis: '2.1 km', road: '干燥' },
      geometryCheck: { ssd: '已校核', alignment: '已校核', clearance: '断面受限' },
      directions: {
        beian: {
          avgSpeed: 58,
          flow: 960,
          innerSpeed: 64,
          outerSpeed: 52,
          shoulderStatus: '车辆占用',
          shoulderOccupied: true,
          queueM: 460,
          attention: true,
          statusLabel: '需关注',
          eventTitle: '硬路肩车辆占用',
          eventDesc: '排队 460 m · 硬路肩车辆占用',
          detectTime: '10:04:00',
          source: '现场视频、毫米波雷达',
          camBoxText: '硬路肩车辆占用'
        },
        mingshui: {
          avgSpeed: 72,
          flow: 840,
          innerSpeed: 78,
          outerSpeed: 66,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行正常',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:05:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        }
      }
    },
    {
      id: 'QD-02',
      name: '桥梁受限段B',
      sectionId: 'sec3',
      sectionName: '三工区',
      stake: 'K52+100 ~ K53+400',
      lengthKm: 1.3,
      lon: 126.0050,
      lat: 47.5320,
      alt: 230,
      fallbackPct: { x: 52, y: 46 },
      spanCoords: [[125.999, 47.515], [126.005, 47.532], [126.011, 47.548]],
      camId: 'CAM-QD-02',
      weather: { temp: '-5.8 ℃', vis: '2.4 km', road: '干燥' },
      geometryCheck: { ssd: '已校核', alignment: '已校核', clearance: '满足要求' },
      directions: {
        beian: {
          avgSpeed: 70,
          flow: 860,
          innerSpeed: 74,
          outerSpeed: 66,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行平稳',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:05:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        },
        mingshui: {
          avgSpeed: 74,
          flow: 820,
          innerSpeed: 79,
          outerSpeed: 69,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行平稳',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:05:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        }
      }
    },
    {
      id: 'QD-03',
      name: '桥梁受限段C',
      sectionId: 'sec4',
      sectionName: '四工区',
      stake: 'K78+200 ~ K79+500',
      lengthKm: 1.3,
      lon: 126.1320,
      lat: 47.8350,
      alt: 235,
      fallbackPct: { x: 62, y: 42 },
      spanCoords: [[126.118, 47.822], [126.132, 47.835], [126.146, 47.848]],
      camId: 'CAM-QD-03',
      weather: { temp: '-6.1 ℃', vis: '1.9 km', road: '局部微霜' },
      geometryCheck: { ssd: '已校核', alignment: '已校核', clearance: '断面受限' },
      directions: {
        beian: {
          avgSpeed: 62,
          flow: 780,
          innerSpeed: 68,
          outerSpeed: 56,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 210,
          attention: true,
          statusLabel: '需关注',
          eventTitle: '疑似抛洒物',
          eventDesc: '排队 210 m · 疑似抛洒物',
          detectTime: '10:03:20',
          source: '现场视频、毫米波雷达',
          camBoxText: '疑似抛洒物待核'
        },
        mingshui: {
          avgSpeed: 71,
          flow: 760,
          innerSpeed: 76,
          outerSpeed: 66,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行平稳',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:05:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        }
      }
    },
    {
      id: 'QD-04',
      name: '终点衔接段',
      sectionId: 'sec6',
      sectionName: '六工区',
      stake: 'K143+600 ~ K144+800',
      lengthKm: 1.2,
      lon: 126.4000,
      lat: 48.2180,
      alt: 250,
      fallbackPct: { x: 70, y: 31 },
      spanCoords: [[126.390, 48.202], [126.400, 48.218], [126.410, 48.234]],
      camId: 'CAM-QD-04',
      weather: { temp: '-6.4 ℃', vis: '2.8 km', road: '干燥' },
      geometryCheck: { ssd: '已校核', alignment: '已校核', clearance: '满足要求' },
      directions: {
        beian: {
          avgSpeed: 76,
          flow: 900,
          innerSpeed: 80,
          outerSpeed: 72,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行稳定',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:00:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        },
        mingshui: {
          avgSpeed: 78,
          flow: 880,
          innerSpeed: 82,
          outerSpeed: 74,
          shoulderStatus: '未见占用',
          shoulderOccupied: false,
          queueM: 0,
          attention: false,
          statusLabel: '正常',
          eventTitle: '通行稳定',
          eventDesc: '硬路肩未见占用',
          detectTime: '10:00:00',
          source: '现场视频、毫米波雷达',
          camBoxText: ''
        }
      }
    }
  ];

  const SEGMENT_BY_ID = Object.fromEntries(PILOT_SEGMENTS.map(s => [s.id, s]));

  /* ------------------------------------------------------------------------
     02_算法研判 DATASET
     ------------------------------------------------------------------------ */
  const INITIAL_ALGO_RECORDS = [
    {
      id: 'YP-20261126-042',
      segId: 'QD-01',
      segName: '桥梁受限段A',
      date: '2026-11-26',
      time: '11-26 10:05',
      fullTime: '2026-11-26 10:05',
      type: '队列预测',
      summary: '占用持续·队列增长',
      status: '需关注',
      badgeText: '占用持续',
      stateDetect: '硬路肩占用',
      measuredQueue: 460,
      predictedQueue: 610,
      xLabels: ['09:50', '09:55', '10:00', '10:05', '10:10', '10:15', '10:20'],
      splitIndex: 3,
      measuredSeries: [230, 300, 380, 460],
      predictedSeries: [460, 520, 565, 610],
      note: '风险研判显示外侧车流放缓、队列继续增长，关联分车道速度建议已生成。',
      sources: [
        { name: '路侧视频', desc: '识别硬路肩车辆占用', time: '10:05', icon: 'video' },
        { name: '毫米波雷达', desc: '车速、流量与排队长度', time: '10:05', icon: 'radar' },
        { name: '气象与路面', desc: '气温、能见度与路面状态', time: '10:04', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '受限断面及安全边界校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'LSTM短时交通流预测',
      version: '演示 V1.3',
      strategyId: 'CL-20261126-042'
    },
    {
      id: 'YP-20261126-041',
      segId: 'QD-03',
      segName: '桥梁受限段C',
      date: '2026-11-26',
      time: '11-26 10:03',
      fullTime: '2026-11-26 10:03',
      type: '状态识别',
      summary: '抛洒物待核',
      status: '待核查',
      badgeText: '抛洒物待核',
      stateDetect: '疑似抛洒物',
      measuredQueue: 210,
      predictedQueue: 295,
      xLabels: ['09:48', '09:53', '09:58', '10:03', '10:08', '10:13', '10:18'],
      splitIndex: 3,
      measuredSeries: [95, 130, 175, 210],
      predictedSeries: [210, 245, 275, 295],
      note: '路侧视频检出外侧车道边缘疑似小型抛洒物，已同步生成降速待核建议 CL-20261126-041。',
      sources: [
        { name: '路侧视频', desc: '外侧车道异常目标识别', time: '10:03', icon: 'video' },
        { name: '毫米波雷达', desc: '单车道车速波动与跟驰密度', time: '10:03', icon: 'radar' },
        { name: '气象与路面', desc: '气温 -6.1 ℃，微霜', time: '10:02', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '视距与横净距安全裕度校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'YOLO-Traffic + LSTM 融合模型',
      version: '演示 V1.3',
      strategyId: 'CL-20261126-041'
    },
    {
      id: 'YP-20261126-040',
      segId: 'QD-04',
      segName: '终点衔接段',
      date: '2026-11-26',
      time: '11-26 10:00',
      fullTime: '2026-11-26 10:00',
      type: '状态识别',
      summary: '通行稳定',
      status: '已生成',
      badgeText: '通行稳定',
      stateDetect: '常态畅通',
      measuredQueue: 0,
      predictedQueue: 20,
      xLabels: ['09:45', '09:50', '09:55', '10:00', '10:05', '10:10', '10:15'],
      splitIndex: 3,
      measuredSeries: [10, 0, 0, 0],
      predictedSeries: [0, 10, 15, 20],
      note: '全断面通行平稳、无硬路肩占用与队列积聚，维持 80 km/h 常态提速管控。',
      sources: [
        { name: '路侧视频', desc: '全断面运行常态确认', time: '10:00', icon: 'video' },
        { name: '毫米波雷达', desc: '车速稳定 76 km/h', time: '10:00', icon: 'radar' },
        { name: '气象与路面', desc: '路面干燥，能见度 2.8 km', time: '10:00', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '枢纽衔接段线形校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'LSTM短时交通流预测',
      version: '演示 V1.3',
      strategyId: 'CL-20261126-038'
    },
    {
      id: 'YP-20261126-035',
      segId: 'QD-01',
      segName: '桥梁受限段A',
      date: '2026-11-26',
      time: '11-26 10:04',
      fullTime: '2026-11-26 10:04',
      type: '回退建议',
      summary: '生成回退建议',
      status: '已生成',
      badgeText: '已生成回退',
      stateDetect: '硬路肩初占',
      measuredQueue: 380,
      predictedQueue: 490,
      xLabels: ['09:49', '09:54', '09:59', '10:04', '10:09', '10:14', '10:19'],
      splitIndex: 3,
      measuredSeries: [180, 240, 310, 380],
      predictedSeries: [380, 425, 460, 490],
      note: '初次识别硬路肩占道后自动生成一级回退策略 CL-20261126-035（内侧 70 / 外侧 60 km/h）。',
      sources: [
        { name: '路侧视频', desc: '初次识别硬路肩车辆停靠', time: '10:04', icon: 'video' },
        { name: '毫米波雷达', desc: '外侧车速降至 54 km/h', time: '10:04', icon: 'radar' },
        { name: '气象与路面', desc: '气温 -5.2 ℃，路面干燥', time: '10:04', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '受限断面停车视距校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'LSTM短时交通流预测',
      version: '演示 V1.3',
      strategyId: 'CL-20261126-035'
    },
    {
      id: 'YP-20261126-032',
      segId: 'QD-02',
      segName: '桥梁受限段B',
      date: '2026-11-26',
      time: '11-26 09:58',
      fullTime: '2026-11-26 09:58',
      type: '状态识别',
      summary: '通行平稳',
      status: '已生成',
      badgeText: '常态运行',
      stateDetect: '常态畅通',
      measuredQueue: 0,
      predictedQueue: 30,
      xLabels: ['09:43', '09:48', '09:53', '09:58', '10:03', '10:08', '10:13'],
      splitIndex: 3,
      measuredSeries: [20, 10, 0, 0],
      predictedSeries: [0, 15, 20, 30],
      note: '桥梁受限段B断面通行秩序良好，维持内/外侧 80 km/h 常态限速。',
      sources: [
        { name: '路侧视频', desc: '硬路肩无异常占用', time: '09:58', icon: 'video' },
        { name: '毫米波雷达', desc: '区间均速 70 km/h', time: '09:58', icon: 'radar' },
        { name: '气象与路面', desc: '干燥，能见度 2.4 km', time: '09:56', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '纵坡及超高参数校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'LSTM短时交通流预测',
      version: '演示 V1.3',
      strategyId: 'CL-20261126-032'
    },
    {
      id: 'YP-20261125-029',
      segId: 'QD-03',
      segName: '桥梁受限段C',
      date: '2026-11-25',
      time: '11-25 17:15',
      fullTime: '2026-11-25 17:15',
      type: '队列预测',
      summary: '晚高峰队列增长',
      status: '已生成',
      badgeText: '历史归档',
      stateDetect: '车流密集',
      measuredQueue: 340,
      predictedQueue: 420,
      xLabels: ['17:00', '17:05', '17:10', '17:15', '17:20', '17:25', '17:30'],
      splitIndex: 3,
      measuredSeries: [140, 210, 280, 340],
      predictedSeries: [340, 380, 405, 420],
      note: '昨日晚高峰短时交通流上升导致队列延长，分车道降速后于 17:35 消散。',
      sources: [
        { name: '路侧视频', desc: '车流密集通行监测', time: '17:15', icon: 'video' },
        { name: '毫米波雷达', desc: '峰值流量 1,120 辆/h', time: '17:15', icon: 'radar' },
        { name: '气象与路面', desc: '气温 -7.0 ℃，干燥', time: '17:10', icon: 'weather' },
        { name: 'BIM 与仿真成果', desc: '桥梁受限断面通行能力校核', time: '模型 V1.2', icon: 'bim' }
      ],
      model: 'LSTM短时交通流预测',
      version: '演示 V1.3',
      strategyId: 'CL-20261125-029'
    }
  ];

  /* ------------------------------------------------------------------------
     03_速度策略 INITIAL STATE (4 Segments × 2 Lanes = 8 Rows)
     ------------------------------------------------------------------------ */
  const INITIAL_STRATEGIES = [
    {
      segId: 'QD-01',
      segName: '桥梁受限段A',
      direction: 'beian',
      date: '2026-11-26',
      measuredInner: 64,
      measuredOuter: 52,
      suggestInner: 60,
      suggestOuter: 60,
      publishedInner: 70,
      publishedOuter: 60,
      auditStatus: '待审核',
      currentMode: '异常回退',
      triggerScene: '触发场景 硬路肩车辆占用',
      latestStrategyId: 'CL-20261126-042',
      latestGeneratedAt: '2026-11-26 10:05',
      linkedAlgoId: 'YP-20261126-042',
      publishedStrategyId: 'CL-20261126-035',
      publishedBatchId: 'FB-20261126-017',
      publishedAt: '2026-11-26 10:04:07',
      vmsMessage: '硬路肩车辆占用 注意安全',
      auditHistory: [
        { time: '10:04:03', actor: '智慧提速引擎', action: '自动生成一级回退建议 CL-20261126-035（内侧70 / 外侧60 km/h）', result: '预案自动授权' },
        { time: '10:04:07', actor: '信息发布平台', action: '下发批次 FB-20261126-017 至 4 台路侧设备', result: '已下发' },
        { time: '10:05:00', actor: 'LSTM队列预测', action: '预测排队增至 610 m，建议升级为 CL-20261126-042（内侧60 / 外侧60 km/h）', result: '待人工审核' }
      ]
    },
    {
      segId: 'QD-02',
      segName: '桥梁受限段B',
      direction: 'beian',
      date: '2026-11-26',
      measuredInner: 74,
      measuredOuter: 66,
      suggestInner: 80,
      suggestOuter: 80,
      publishedInner: 80,
      publishedOuter: 80,
      auditStatus: '已审核',
      currentMode: '常态管控',
      triggerScene: '常态提速运行中',
      latestStrategyId: 'CL-20261126-032',
      latestGeneratedAt: '2026-11-26 09:58',
      linkedAlgoId: 'YP-20261126-032',
      publishedStrategyId: 'CL-20261126-032',
      publishedBatchId: 'FB-20261126-014',
      publishedAt: '2026-11-26 09:59:12',
      vmsMessage: '受限路段常态通行 限速80',
      auditHistory: [
        { time: '09:58:10', actor: '智慧提速引擎', action: '生成常态提速策略 CL-20261126-032（80 / 80 km/h）', result: '待审核' },
        { time: '09:59:02', actor: '监控值班员（演示）', action: '核对断面干燥无占用，审核通过并下发', result: '已审核' }
      ]
    },
    {
      segId: 'QD-03',
      segName: '桥梁受限段C',
      direction: 'beian',
      date: '2026-11-26',
      measuredInner: 68,
      measuredOuter: 56,
      suggestInner: 70,
      suggestOuter: 60,
      publishedInner: 80,
      publishedOuter: 80,
      auditStatus: '待审核',
      currentMode: '风险待核',
      triggerScene: '触发场景 疑似抛洒物与排队 210 m',
      latestStrategyId: 'CL-20261126-041',
      latestGeneratedAt: '2026-11-26 10:03',
      linkedAlgoId: 'YP-20261126-041',
      publishedStrategyId: 'CL-20261126-028',
      publishedBatchId: 'FB-20261126-012',
      publishedAt: '2026-11-26 09:42:18',
      vmsMessage: '前方疑似抛洒物 减速慢行',
      auditHistory: [
        { time: '09:42:18', actor: '信息发布平台', action: '当前执行常态管控 FB-20261126-012（80 / 80 km/h）', result: '已发布' },
        { time: '10:03:22', actor: '事件识别引擎', action: '检出疑似抛洒物，建议降速 CL-20261126-041（内侧70 / 外侧60 km/h）', result: '待审核' }
      ]
    },
    {
      segId: 'QD-04',
      segName: '终点衔接段',
      direction: 'beian',
      date: '2026-11-26',
      measuredInner: 80,
      measuredOuter: 72,
      suggestInner: 80,
      suggestOuter: 80,
      publishedInner: 80,
      publishedOuter: 80,
      auditStatus: '已审核',
      currentMode: '常态管控',
      triggerScene: '常态提速运行中',
      latestStrategyId: 'CL-20261126-038',
      latestGeneratedAt: '2026-11-26 10:00',
      linkedAlgoId: 'YP-20261126-040',
      publishedStrategyId: 'CL-20261126-038',
      publishedBatchId: 'FB-20261126-015',
      publishedAt: '2026-11-26 10:00:45',
      vmsMessage: '主线衔接顺畅 限速80',
      auditHistory: [
        { time: '10:00:15', actor: '智慧提速引擎', action: '生成常态维持策略 CL-20261126-038（80 / 80 km/h）', result: '已审核' },
        { time: '10:00:45', actor: '信息发布平台', action: '下发批次 FB-20261126-015 并完成全部回执', result: '已发布' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     04_执行反馈 INITIAL PUBLISH BATCHES & DEVICE RECEIPTS
     ------------------------------------------------------------------------ */
  const INITIAL_BATCHES = [
    {
      batchId: 'FB-20261126-017',
      segId: 'QD-01',
      segName: '桥梁受限段A',
      directionLabel: '北安方向',
      strategyId: 'CL-20261126-035',
      strategyAuthLabel: '预案已授权',
      strategyTimeDesc: '10:04:03 内侧70 / 外侧60 km/h',
      publishState: '已下发',
      publishTime: '2026-11-26 10:04:07',
      publishShortDesc: '10:04:07 区段限速与情报板指令',
      confirmDurationSec: 9,
      sameBatchSummary: [
        { label: '内侧标志', text: '确认 70 km/h · 10:04:08' },
        { label: '外侧标志', text: '确认 60 km/h · 10:04:09' }
      ],
      devices: [
        {
          id: 'VSL-01-01',
          type: '可变限速标志',
          name: '内侧可变限速标志',
          cmd: '70 km/h',
          receipt: '确认显示 70 km/h',
          time: '10:04:08',
          exceptionTime: '—',
          status: '回执成功',
          logs: [
            '10:04:07.120 [TX] 帧头=0xAA55 设备=VSL-01-01 指令=LIMIT_70',
            '10:04:08.042 [RX] ACK_OK 当前牌面=70 km/h 亮度=自动(6级)'
          ]
        },
        {
          id: 'VSL-01-02',
          type: '可变限速标志',
          name: '外侧可变限速标志',
          cmd: '60 km/h',
          receipt: '确认显示 60 km/h',
          time: '10:04:09',
          exceptionTime: '—',
          status: '回执成功',
          logs: [
            '10:04:07.135 [TX] 帧头=0xAA55 设备=VSL-01-02 指令=LIMIT_60',
            '10:04:09.118 [RX] ACK_OK 当前牌面=60 km/h 亮度=自动(6级)'
          ]
        },
        {
          id: 'QB-01-01',
          type: '情报板',
          name: '前方情报板',
          cmd: '硬路肩车辆占用 注意安全',
          receipt: '显示内容与指令一致',
          time: '10:04:09',
          exceptionTime: '—',
          status: '回执成功',
          logs: [
            '10:04:07.180 [TX] TCP_PUSH 设备=QB-01-01 文本="硬路肩车辆占用 注意安全" 字体=黄黑高对比',
            '10:04:09.305 [RX] DISPLAY_VERIFIED MD5校验一致'
          ]
        },
        {
          id: 'QB-01-02',
          type: '情报板',
          name: '上游情报板',
          cmd: '硬路肩车辆占用 注意安全',
          receipt: '未收到设备回执',
          time: '—',
          exceptionTime: '10:04:17',
          status: '回执超时',
          logs: [
            '10:04:07.210 [TX] TCP_PUSH 设备=QB-01-02 文本="硬路肩车辆占用 注意安全"',
            '10:04:12.210 [WARN] 首次等待ACK超时 (5000ms)，自动触发心跳探测',
            '10:04:17.210 [ERR] 链路握手超时 (10000ms)，标记为【回执超时】，来源：信息发布'
          ]
        }
      ]
    },
    {
      batchId: 'FB-20261126-015',
      segId: 'QD-04',
      segName: '终点衔接段',
      directionLabel: '北安方向',
      strategyId: 'CL-20261126-038',
      strategyAuthLabel: '已审核授权',
      strategyTimeDesc: '10:00:15 内侧80 / 外侧80 km/h',
      publishState: '已下发',
      publishTime: '2026-11-26 10:00:45',
      publishShortDesc: '10:00:45 常态限速与情报板指令',
      confirmDurationSec: 4,
      sameBatchSummary: [
        { label: '内侧标志', text: '确认 80 km/h · 10:00:47' },
        { label: '外侧标志', text: '确认 80 km/h · 10:00:48' }
      ],
      devices: [
        { id: 'VSL-04-01', type: '可变限速标志', name: '内侧可变限速标志', cmd: '80 km/h', receipt: '确认显示 80 km/h', time: '10:00:47', exceptionTime: '—', status: '回执成功', logs: ['10:00:45 [TX] LIMIT_80', '10:00:47 [RX] ACK_OK'] },
        { id: 'VSL-04-02', type: '可变限速标志', name: '外侧可变限速标志', cmd: '80 km/h', receipt: '确认显示 80 km/h', time: '10:00:48', exceptionTime: '—', status: '回执成功', logs: ['10:00:45 [TX] LIMIT_80', '10:00:48 [RX] ACK_OK'] },
        { id: 'QB-04-01', type: '情报板', name: '前方情报板', cmd: '主线衔接顺畅 限速80', receipt: '显示内容与指令一致', time: '10:00:49', exceptionTime: '—', status: '回执成功', logs: ['10:00:45 [TX] PUSH_TEXT', '10:00:49 [RX] VERIFIED'] },
        { id: 'QB-04-02', type: '情报板', name: '上游情报板', cmd: '主线衔接顺畅 限速80', receipt: '显示内容与指令一致', time: '10:00:49', exceptionTime: '—', status: '回执成功', logs: ['10:00:45 [TX] PUSH_TEXT', '10:00:49 [RX] VERIFIED'] }
      ]
    },
    {
      batchId: 'FB-20261126-014',
      segId: 'QD-02',
      segName: '桥梁受限段B',
      directionLabel: '北安方向',
      strategyId: 'CL-20261126-032',
      strategyAuthLabel: '已审核授权',
      strategyTimeDesc: '09:59:02 内侧80 / 外侧80 km/h',
      publishState: '已下发',
      publishTime: '2026-11-26 09:59:12',
      publishShortDesc: '09:59:12 常态限速指令',
      confirmDurationSec: 3,
      sameBatchSummary: [
        { label: '内侧标志', text: '确认 80 km/h · 09:59:14' },
        { label: '外侧标志', text: '确认 80 km/h · 09:59:15' }
      ],
      devices: [
        { id: 'VSL-02-01', type: '可变限速标志', name: '内侧可变限速标志', cmd: '80 km/h', receipt: '确认显示 80 km/h', time: '09:59:14', exceptionTime: '—', status: '回执成功', logs: ['09:59:12 [TX] LIMIT_80', '09:59:14 [RX] ACK_OK'] },
        { id: 'VSL-02-02', type: '可变限速标志', name: '外侧可变限速标志', cmd: '80 km/h', receipt: '确认显示 80 km/h', time: '09:59:15', exceptionTime: '—', status: '回执成功', logs: ['09:59:12 [TX] LIMIT_80', '09:59:15 [RX] ACK_OK'] },
        { id: 'QB-02-01', type: '情报板', name: '前方情报板', cmd: '受限路段常态通行 限速80', receipt: '显示内容与指令一致', time: '09:59:15', exceptionTime: '—', status: '回执成功', logs: ['09:59:12 [TX] PUSH_TEXT', '09:59:15 [RX] VERIFIED'] },
        { id: 'QB-02-02', type: '情报板', name: '上游情报板', cmd: '受限路段常态通行 限速80', receipt: '显示内容与指令一致', time: '09:59:16', exceptionTime: '—', status: '回执成功', logs: ['09:59:12 [TX] PUSH_TEXT', '09:59:16 [RX] VERIFIED'] }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     05_场景回放 5 SCENARIO RECORDS
     ------------------------------------------------------------------------ */
  const REPLAY_SCENARIOS = [
    {
      id: 'RP-20261126-01',
      title: '硬路肩车辆占用',
      chartTitle: '硬路肩车辆占用回放',
      mode: '实际回放',
      segId: 'QD-01',
      segName: '桥梁受限段A',
      dateRangeLabel: '11-26 09:55—10:15',
      windowLabel: '09:55—10:15',
      durationMin: 20,
      defaultMin: 10,
      sampleTag: '历史记录样例',
      popupSub: '两块限速标志已回执',
      xTicks: ['09:55', '10:00', '10:05', '10:10', '10:15'],
      suggestStartMin: 10,
      // 0..20 min (every 1 min -> 21 points)
      measuredInner: [73, 73, 72, 72, 71, 70, 69, 68, 67, 66, 64, 63.5, 63, 63, 63, 63, 63.5, 64, 64, 64.5, 65],
      measuredOuter: [66, 65, 64, 63, 62, 61, 59, 57, 55, 53, 52, 51, 51, 50, 51, 52, 52, 53, 53, 54, 54],
      suggestInner:  [80, 80, 80, 80, 80, 80, 80, 80, 80, 70, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
      suggestOuter:  [80, 80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
      publishedInner:[80, 80, 80, 80, 80, 80, 80, 80, 80, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70],
      publishedOuter:[80, 80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60],
      queueSeries:   [110, 140, 170, 210, 250, 290, 325, 360, 395, 430, 460, 485, 510, 530, 550, 565, 580, 590, 600, 605, 610],
      timeline: [
        { min: 9.0, clock: '10:04:00', title: '识别硬路肩占用', desc: '视频与毫米波雷达融合结果' },
        { min: 9.05, clock: '10:04:03', title: '生成限速回退建议', desc: 'CL-20261126-035 · 内侧70 / 外侧60' },
        { min: 9.12, clock: '10:04:07', title: '信息发布下发指令', desc: 'FB-20261126-017' },
        { min: 9.15, clock: '10:04:09', title: '限速标志均已回执', desc: '内侧70 km/h · 外侧60 km/h' },
        { min: 10.0, clock: '10:05:00', title: '生成更新建议', desc: 'CL-20261126-042 · 待审核' }
      ]
    },
    {
      id: 'RP-20261125-02',
      title: '施工导改',
      chartTitle: '施工导改限速回放',
      mode: '实际回放',
      segId: 'QD-04',
      segName: '终点衔接段',
      dateRangeLabel: '11-25 08:45—09:10',
      windowLabel: '08:45—09:10',
      durationMin: 25,
      defaultMin: 12,
      sampleTag: '历史记录样例',
      popupSub: '导改过渡区平滑限速 60',
      xTicks: ['08:45', '08:51', '08:57', '09:03', '09:10'],
      suggestStartMin: 10,
      measuredInner: [80, 79, 78, 77, 75, 74, 72, 70, 68, 66, 65, 64, 64, 65, 66, 66, 67, 68, 68, 69, 70, 71, 72, 74, 76, 78],
      measuredOuter: [74, 73, 72, 70, 68, 66, 64, 62, 60, 58, 57, 56, 56, 57, 58, 59, 60, 60, 61, 62, 64, 65, 66, 68, 70, 72],
      suggestInner:  [80, 80, 80, 80, 80, 80, 80, 80, 70, 70, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 70, 80, 80, 80, 80],
      suggestOuter:  [80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 80, 80],
      publishedInner:[80, 80, 80, 80, 80, 80, 80, 80, 70, 70, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 70, 80, 80, 80, 80],
      publishedOuter:[80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 80, 80],
      queueSeries:   [0, 0, 20, 40, 60, 85, 110, 140, 175, 200, 220, 230, 215, 195, 170, 150, 130, 110, 90, 70, 50, 30, 20, 10, 0, 0],
      timeline: [
        { min: 6.0, clock: '08:51:00', title: '临时导改区启用', desc: '一/六工区施工导改作业启动' },
        { min: 8.0, clock: '08:53:00', title: '生成导改分级降速策略', desc: 'CL-20261125-018 · 内侧70 / 外侧60' },
        { min: 10.0, clock: '08:55:00', title: '二次下发60 km/h限速', desc: 'FB-20261125-009 全部情报板同步提示' },
        { min: 12.0, clock: '08:57:00', title: '全设备回执完成', desc: '4 台设备确认显示，车流秩序稳定' },
        { min: 22.0, clock: '09:07:00', title: '导改撤除恢复常态', desc: '恢复内/外侧 80 km/h 限速' }
      ]
    },
    {
      id: 'RP-20261125-03',
      title: '排队增长',
      chartTitle: '晚高峰排队增长回放',
      mode: '实际回放',
      segId: 'QD-03',
      segName: '桥梁受限段C',
      dateRangeLabel: '11-25 17:00—17:30',
      windowLabel: '17:00—17:30',
      durationMin: 30,
      defaultMin: 15,
      sampleTag: '历史记录样例',
      popupSub: '分车道协同降速抑制队列',
      xTicks: ['17:00', '17:07', '17:15', '17:22', '17:30'],
      suggestStartMin: 12,
      measuredInner: [76, 75, 74, 73, 72, 71, 70, 69, 68, 67, 66, 65, 64, 64, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 76, 77, 78, 78, 79],
      measuredOuter: [70, 69, 68, 66, 65, 63, 62, 60, 59, 58, 57, 56, 55, 55, 56, 57, 58, 59, 60, 61, 63, 64, 65, 66, 68, 69, 70, 71, 72, 72, 73],
      suggestInner:  [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 70, 70, 70, 60, 60, 60, 60, 60, 70, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      suggestOuter:  [80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 80, 80, 80, 80, 80, 80, 80],
      publishedInner:[80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      publishedOuter:[80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 60, 70, 70, 80, 80, 80, 80, 80, 80, 80],
      queueSeries:   [80, 100, 125, 150, 180, 210, 240, 265, 290, 310, 325, 335, 340, 330, 310, 285, 260, 230, 200, 170, 140, 115, 95, 75, 55, 40, 25, 15, 10, 0, 0],
      timeline: [
        { min: 8.0, clock: '17:08:00', title: '识别车流密度上升', desc: '外侧车道排队突破 280 m' },
        { min: 10.0, clock: '17:10:00', title: '下发分车道协同限速', desc: '内侧 70 / 外侧 60 km/h 均衡车道负荷' },
        { min: 12.0, clock: '17:12:00', title: 'LSTM 预测峰值 340 m', desc: '建议维持限速窗口 10 分钟' },
        { min: 15.0, clock: '17:15:00', title: '排队长度拐点回落', desc: '实测排队回落至 285 m' },
        { min: 22.0, clock: '17:22:00', title: '恢复 80 km/h 常态管控', desc: '断面通行能力恢复正常' }
      ]
    },
    {
      id: 'SIM-20261126-02',
      title: '不利天气',
      chartTitle: '不利天气模拟演示回放',
      mode: '模拟演示',
      segId: 'QD-02',
      segName: '桥梁受限段B',
      dateRangeLabel: '冰雪与低能见度',
      windowLabel: '10:00—10:20 (模拟)',
      durationMin: 20,
      defaultMin: 10,
      sampleTag: '模拟演示样例',
      popupSub: '低能见度(<500m)触发防滑回退',
      xTicks: ['10:00', '10:05', '10:10', '10:15', '10:20'],
      suggestStartMin: 6,
      measuredInner: [76, 75, 73, 70, 67, 64, 60, 58, 57, 56, 56, 57, 58, 59, 60, 62, 64, 66, 68, 70, 72],
      measuredOuter: [70, 68, 65, 62, 58, 55, 52, 50, 49, 48, 48, 49, 50, 51, 52, 54, 56, 58, 60, 62, 64],
      suggestInner:  [80, 80, 80, 80, 70, 60, 60, 60, 50, 50, 50, 50, 60, 60, 60, 60, 70, 70, 70, 80, 80],
      suggestOuter:  [80, 80, 80, 80, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 60, 60, 60, 60, 70, 70, 80],
      publishedInner:[80, 80, 80, 80, 70, 60, 60, 60, 50, 50, 50, 50, 60, 60, 60, 60, 70, 70, 70, 80, 80],
      publishedOuter:[80, 80, 80, 80, 60, 50, 50, 50, 50, 50, 50, 50, 50, 50, 60, 60, 60, 60, 70, 70, 80],
      queueSeries:   [0, 20, 40, 80, 120, 165, 210, 245, 270, 285, 280, 260, 230, 195, 160, 125, 95, 70, 45, 25, 10],
      timeline: [
        { min: 4.0, clock: '10:04:00', title: '路面湿滑与能见度下降', desc: '模拟雪雾导致能见度降至 420 m' },
        { min: 5.0, clock: '10:05:00', title: '触发冰雪气象一级回退', desc: 'SIM-CL-01 · 内侧 60 / 外侧 50 km/h' },
        { min: 8.0, clock: '10:08:00', title: '升级全断面 50 km/h 防滑管控', desc: '同步联动上游情报板防追尾警示' },
        { min: 10.0, clock: '10:10:00', title: '模拟车流稳定降速通过', desc: '离散度下降 34%，未发生二次拥堵' },
        { min: 16.0, clock: '10:16:00', title: '除雪作业完成逐步提速', desc: '分阶段恢复至 70 / 80 km/h' }
      ]
    },
    {
      id: 'SIM-20261126-03',
      title: '风险解除',
      chartTitle: '风险解除与状态复核演示',
      mode: '模拟演示',
      segId: 'QD-01',
      segName: '桥梁受限段A',
      dateRangeLabel: '占用解除与状态复核',
      windowLabel: '10:15—10:35 (模拟)',
      durationMin: 20,
      defaultMin: 10,
      sampleTag: '模拟演示样例',
      popupSub: '清障完成后渐进恢复 80 km/h',
      xTicks: ['10:15', '10:20', '10:25', '10:30', '10:35'],
      suggestStartMin: 6,
      measuredInner: [64, 64, 65, 66, 68, 70, 72, 74, 75, 76, 77, 78, 79, 79, 80, 80, 80, 80, 80, 80, 80],
      measuredOuter: [52, 53, 54, 56, 58, 60, 62, 65, 67, 69, 70, 71, 72, 72, 73, 74, 74, 75, 75, 75, 76],
      suggestInner:  [60, 60, 60, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      suggestOuter:  [60, 60, 60, 60, 60, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      publishedInner:[70, 70, 70, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      publishedOuter:[60, 60, 60, 60, 60, 70, 70, 70, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80, 80],
      queueSeries:   [460, 420, 380, 330, 275, 220, 170, 125, 85, 50, 25, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0],
      timeline: [
        { min: 2.0, clock: '10:17:00', title: '清障车辆到达作业', desc: '硬路肩故障车辆拖离受限断面' },
        { min: 5.0, clock: '10:20:00', title: '确认硬路肩占用解除', desc: '视频与雷达连续 60 秒复核无占用' },
        { min: 6.0, clock: '10:21:00', title: '触发阶梯提速恢复策略', desc: '内侧先行恢复 80 / 外侧过渡 70 km/h' },
        { min: 10.0, clock: '10:25:00', title: '排队消散至 25 m', desc: '断面全车道恢复 80 km/h 常态管控' },
        { min: 14.0, clock: '10:29:00', title: '状态闭环归档', desc: '回放记录同步至智慧提速案例库' }
      ]
    }
  ];

  /* ------------------------------------------------------------------------
     MODULE MUTABLE STATE
     ------------------------------------------------------------------------ */
  const ui = {
    // 01_交通运行
    trSegFilter: 'all',
    trDirection: 'beian',
    trSelectedSegId: 'QD-01',
    trShowLayersPopover: false,
    trLayers: { corridor: true, attention: true, markers: true, satellite: true, sections: false },

    // 02_算法研判
    algoSegFilter: 'all',
    algoTypeFilter: 'all',
    algoStatusFilter: 'all',
    algoDateFilter: '2026-11-26',
    algoApplied: { seg: 'all', type: 'all', status: 'all', date: '2026-11-26' },
    algoSelectedId: 'YP-20261126-042',
    algoHoverIdx: null,

    // 03_速度策略
    stSegFilter: 'all',
    stDirection: 'beian',
    stAuditFilter: 'all',
    stDateFilter: '2026-11-26',
    stApplied: { seg: 'all', dir: 'beian', audit: 'all', date: '2026-11-26' },
    stSelectedSegId: 'QD-01',
    strategies: JSON.parse(JSON.stringify(INITIAL_STRATEGIES)),

    // 04_执行反馈
    fbSegFilter: 'QD-01',
    fbBatchFilter: 'FB-20261126-017',
    fbTypeFilter: 'all',
    fbApplied: { seg: 'QD-01', batch: 'FB-20261126-017', type: 'all' },
    fbSelectedDeviceId: 'QB-01-02',
    batches: JSON.parse(JSON.stringify(INITIAL_BATCHES)),

    // 05_场景回放
    rpModeFilter: 'all', // 'all' | '实际回放' | '模拟演示'
    rpSelectedId: 'RP-20261126-01',
    rpPlaying: false,
    rpCurrentMin: 10,
    rpShowLayersPopover: false,
    rpLayers: { corridor: true, attention: true, markers: true, satellite: true, sections: false }
  };

  let lastCtx = null;
  let lastHostEl = null;
  let lastSubPageId = null;
  let camAnimTimer = null;
  let modalCamTimer = null;
  let replayTimer = null;
  let tempCesiumEntities = [];
  let postRenderRemover = null;
  let lastCesiumLayerSig = '';

  /* ------------------------------------------------------------------------
     ICONS & HELPERS
     ------------------------------------------------------------------------ */
  const ICONS = {
    layers: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    locate: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M12 2v4M12 18v4M2 12h4M18 12h4"/><circle cx="12" cy="12" r="7" opacity="0.65"/></svg>`,
    search: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    reset: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16"/><rect x="14" y="4" width="4" height="16"/></svg>`,
    audit: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="12" y2="17"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    ext: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    check: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    clock: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    warn: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    road: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 20L9 4M20 20L15 4M12 6v3M12 12v3M12 18v2"/></svg>`,
    speed: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 14l4-4"/><path d="M3.34 19a10 10 0 1117.32 0"/></svg>`,
    flag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 22V4h12l-2 4 2 4H4"/></svg>`,
    board: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="12" rx="2"/><path d="M8 20h8M12 16v4"/></svg>`,
    car: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 11l2-5h10l2 5"/><rect x="3" y="11" width="18" height="7" rx="2"/><circle cx="7" cy="18" r="1.5"/><circle cx="17" cy="18" r="1.5"/></svg>`,
    video: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="6" width="14" height="12" rx="2"/><polygon points="16 10 22 7 22 17 16 14 16 10"/></svg>`,
    radar: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 12m-2 0a2 2 0 104 0 2 2 0 10-4 0"/><path d="M16.24 7.76a6 6 0 010 8.49M19.07 4.93a10 10 0 010 14.14"/><path d="M12 12l4-4"/></svg>`,
    weather: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M17.5 19a4.5 4.5 0 00.5-8.97A6 6 0 006.1 11.4 3.5 3.5 0 007 18.5h10.5z"/></svg>`,
    bim: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`
  };

  function esc(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function fmtComma(n) {
    return Number(n || 0).toLocaleString('en-US');
  }

  function getActiveSectionFilter(ctx) {
    return (ctx && ctx.state && ctx.state.activeSectionId) ? ctx.state.activeSectionId : null;
  }

  function getSegmentsForSection(secId) {
    if (!secId) return PILOT_SEGMENTS;
    return PILOT_SEGMENTS.filter(s => s.sectionId === secId);
  }

  function formatMinClock(scenario, minVal) {
    const startClock = scenario.xTicks[0] || '09:55';
    const parts = startClock.split(':');
    const baseTotalMin = (parseInt(parts[0], 10) || 9) * 60 + (parseInt(parts[1], 10) || 55);
    const curTotalSec = Math.round((baseTotalMin + minVal) * 60);
    const hh = String(Math.floor(curTotalSec / 3600) % 24).padStart(2, '0');
    const mm = String(Math.floor((curTotalSec % 3600) / 60)).padStart(2, '0');
    return `${hh}:${mm}`;
  }

  function formatPlayTimeMMSS(minVal) {
    const totalSec = Math.max(0, Math.round(minVal * 60));
    const mm = String(Math.floor(totalSec / 60)).padStart(2, '0');
    const ss = String(totalSec % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  /* ------------------------------------------------------------------------
     SINGLETON SCOPED STYLES (<style id="m11-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m11-styles')) return;
    const style = document.createElement('style');
    style.id = 'm11-styles';
    style.textContent = `
      /* Interactive Cesium Sub-Pages (01_交通运行 & 05_场景回放) */
      .m11-map-stage {
        position: absolute;
        inset: 0;
        pointer-events: none;
        overflow: hidden;
      }
      .m11-map-stage .hud-left-col {
        width: 266px;
        max-height: calc(100% - 26px);
      }
      .m11-map-stage .hud-right-col {
        width: 294px;
        max-height: calc(100% - 96px);
      }
      .m11-hud-head-meta {
        font-size: 11.5px;
        color: #9bc5ee;
        font-variant-numeric: tabular-nums;
      }
      .m11-hud-link {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        padding: 0;
      }
      .m11-hud-link:hover { text-decoration: underline; color: #93f0ff; }

      /* 01 Left KPI 3x2 grid */
      .m11-kpi-grid-3x2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 7px;
      }
      .m11-mini-kpi {
        padding: 7px 10px;
        border-radius: 7px;
        background: rgba(11, 38, 86, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m11-mini-kpi-label {
        font-size: 11px;
        color: var(--text-sub);
        margin-bottom: 2px;
      }
      .m11-mini-kpi-val {
        font-size: 17px;
        font-weight: 800;
        color: var(--cyan-bright);
        font-variant-numeric: tabular-nums;
        line-height: 1.2;
      }
      .m11-mini-kpi-val.gold {
        color: var(--gold);
        text-shadow: 0 0 10px rgba(250, 204, 21, 0.35);
      }
      .m11-mini-kpi-unit {
        font-size: 11px;
        font-weight: 500;
        color: #cbe3fc;
        margin-left: 3px;
      }

      /* 01 Left Segment List */
      .m11-seg-head {
        display: grid;
        grid-template-columns: 1fr 44px 48px;
        gap: 4px;
        padding: 0 6px 6px;
        font-size: 11px;
        color: #88aed8;
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      }
      .m11-seg-head span:nth-child(2),
      .m11-seg-head span:nth-child(3) { text-align: right; }
      .m11-seg-list {
        display: flex;
        flex-direction: column;
        gap: 4px;
        margin-top: 6px;
      }
      .m11-seg-row {
        display: grid;
        grid-template-columns: 1fr 44px 48px;
        align-items: center;
        gap: 4px;
        padding: 7px 8px;
        border-radius: 7px;
        border: 1px solid transparent;
        background: rgba(10, 34, 76, 0.36);
        cursor: pointer;
        transition: all 0.16s ease;
      }
      .m11-seg-row:hover {
        background: rgba(16, 56, 118, 0.58);
        border-color: rgba(56, 220, 255, 0.42);
      }
      .m11-seg-row.active {
        background: linear-gradient(90deg, rgba(18, 74, 152, 0.72), rgba(10, 42, 92, 0.68));
        border-color: rgba(56, 242, 255, 0.75);
        box-shadow: 0 0 12px rgba(34, 211, 238, 0.24);
      }
      .m11-seg-name {
        font-size: 12.5px;
        font-weight: 700;
        color: #f1f7ff;
      }
      .m11-seg-sub {
        font-size: 10.5px;
        color: #8ab4df;
        margin-top: 2px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m11-seg-sub.warn { color: #facc15; }
      .m11-seg-num {
        text-align: right;
        font-size: 13px;
        font-weight: 700;
        color: #f1f7ff;
        font-variant-numeric: tabular-nums;
      }

      /* Top Floating Map Toolbar */
      .m11-map-toolbar {
        position: absolute;
        top: 14px;
        left: 294px;
        right: 322px;
        z-index: 21;
        pointer-events: auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 12px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.86);
        border: 1px solid var(--border-cyan);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
      }
      .m11-map-toolbar-left,
      .m11-map-toolbar-right {
        display: flex;
        align-items: center;
        gap: 8px;
        position: relative;
      }
      .m11-toolbar-time {
        font-size: 12px;
        color: #d4e8ff;
        font-variant-numeric: tabular-nums;
        padding-left: 4px;
      }
      .m11-compact-select {
        height: 29px;
        padding: 2px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(11, 38, 86, 0.85);
        color: #ffffff;
        font-size: 12px;
        outline: none;
        cursor: pointer;
      }
      .m11-layer-popover {
        position: absolute;
        top: 38px;
        right: 88px;
        width: 174px;
        padding: 10px 12px;
        border-radius: 9px;
        background: rgba(7, 24, 58, 0.96);
        border: 1px solid rgba(56, 220, 255, 0.65);
        box-shadow: 0 12px 28px rgba(0, 8, 28, 0.72);
        z-index: 30;
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m11-layer-item {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: #e4f2ff;
        cursor: pointer;
      }
      .m11-layer-item input { accent-color: #38f2ff; cursor: pointer; }

      /* Map Zoom Vertical Pill (top-right inside center viewport) */
      .m11-map-zoom {
        position: absolute;
        top: 66px;
        right: 322px;
        z-index: 20;
        pointer-events: auto;
      }

      /* Projected Map Markers & Popup Callout */
      .m11-map-markers-layer {
        position: absolute;
        inset: 0;
        z-index: 18;
        pointer-events: none;
      }
      .m11-pin-wrap {
        position: absolute;
        transform: translate(-50%, -100%);
        pointer-events: auto;
        display: flex;
        flex-direction: column;
        align-items: center;
        cursor: pointer;
      }
      .m11-pin-label {
        padding: 3px 10px;
        border-radius: 6px;
        background: rgba(8, 28, 66, 0.9);
        border: 1px solid rgba(56, 189, 248, 0.65);
        color: #eaf6ff;
        font-size: 11.5px;
        font-weight: 700;
        white-space: nowrap;
        box-shadow: 0 4px 12px rgba(0, 10, 30, 0.6);
        margin-bottom: 5px;
        transition: all 0.16s;
      }
      .m11-pin-wrap.active .m11-pin-label,
      .m11-pin-wrap:hover .m11-pin-label {
        border-color: #facc15;
        color: #fef08a;
        background: rgba(56, 38, 12, 0.9);
        box-shadow: 0 0 14px rgba(250, 204, 21, 0.45);
      }
      .m11-pin-dot {
        width: 11px;
        height: 11px;
        border-radius: 50%;
        background: #38f2ff;
        border: 2px solid #ffffff;
        box-shadow: 0 0 10px #38f2ff;
      }
      .m11-pin-wrap.warn .m11-pin-dot {
        background: #facc15;
        box-shadow: 0 0 12px #facc15;
      }
      .m11-pin-popup {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translate(-50%, 10px);
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(6, 22, 52, 0.94);
        border: 1.5px solid rgba(250, 204, 21, 0.72);
        box-shadow: 0 10px 26px rgba(0, 8, 28, 0.72);
        white-space: nowrap;
        pointer-events: auto;
      }
      .m11-pin-popup-title {
        font-size: 12px;
        font-weight: 700;
        color: #fef08a;
        margin-bottom: 3px;
      }
      .m11-pin-popup-sub {
        font-size: 11px;
        color: #d6e9ff;
      }

      /* Bottom Map Legend Strip */
      .m11-map-legend {
        position: absolute;
        left: 294px;
        right: 322px;
        bottom: 12px;
        z-index: 20;
        pointer-events: auto;
        height: 30px;
        padding: 0 14px;
        border-radius: 8px;
        background: rgba(8, 28, 64, 0.86);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(10px);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11.5px;
        color: #c9e2fb;
      }
      .m11-legend-items {
        display: flex;
        align-items: center;
        gap: 14px;
      }
      .m11-legend-swatch {
        display: inline-block;
        width: 14px;
        height: 3px;
        border-radius: 2px;
        vertical-align: middle;
        margin-right: 5px;
      }

      /* 01 Right Selected Segment & Camera Preview */
      .m11-seg-insp-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 9px;
      }
      .m11-seg-insp-title {
        font-size: 13.5px;
        font-weight: 700;
        color: #ffffff;
      }
      .m11-pill-warn {
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        background: rgba(250, 204, 21, 0.16);
        border: 1px solid rgba(250, 204, 21, 0.58);
        color: #fde047;
      }
      .m11-pill-ok {
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        background: rgba(34, 197, 94, 0.18);
        border: 1px solid rgba(74, 222, 128, 0.45);
        color: #4ade80;
      }
      .m11-pill-info {
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        background: rgba(56, 189, 248, 0.18);
        border: 1px solid rgba(56, 189, 248, 0.55);
        color: #7dd3fc;
      }
      .m11-pill-err {
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 700;
        background: rgba(239, 68, 68, 0.2);
        border: 1px solid rgba(248, 113, 113, 0.55);
        color: #fca5a5;
      }
      .m11-lane-cards-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 6px;
        margin-bottom: 10px;
      }
      .m11-lane-mini {
        padding: 7px 6px;
        border-radius: 7px;
        background: rgba(11, 38, 86, 0.6);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m11-lane-mini.occupied {
        background: rgba(88, 62, 14, 0.42);
        border-color: rgba(250, 204, 21, 0.68);
      }
      .m11-lane-mini-lbl {
        font-size: 10.5px;
        color: #a9c6e8;
        margin-bottom: 3px;
      }
      .m11-lane-mini-val {
        font-size: 15px;
        font-weight: 800;
        color: var(--cyan-bright);
        font-variant-numeric: tabular-nums;
      }
      .m11-lane-mini.occupied .m11-lane-mini-val {
        font-size: 13px;
        color: #fde047;
      }
      .m11-kv-rows {
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m11-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        gap: 8px;
      }
      .m11-kv-k { color: #8fb4db; white-space: nowrap; }
      .m11-kv-v { color: #f1f7ff; font-weight: 600; text-align: right; }

      .m11-cam-box {
        position: relative;
        margin-top: 9px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: #071426;
        cursor: pointer;
      }
      .m11-cam-box canvas {
        width: 100%;
        height: 126px;
        display: block;
      }

      /* Opaque Sub-Pages (02_算法研判, 03_速度策略, 04_执行反馈) */
      .m11-page {
        padding: 10px 18px 100px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }
      .m11-filter-bar {
        padding: 9px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m11-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m11-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m11-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
      }
      .m11-select {
        min-width: 128px;
        height: 31px;
        padding: 3px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(11, 38, 86, 0.85);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
        cursor: pointer;
      }
      .m11-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m11-btn-primary {
        height: 31px;
        padding: 0 15px;
        border-radius: 6px;
        border: 1px solid rgba(103, 232, 249, 0.72);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 0 12px rgba(22, 119, 255, 0.42);
        transition: all 0.16s;
      }
      .m11-btn-primary:hover {
        background: linear-gradient(180deg, #2d98ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m11-btn-ghost {
        height: 31px;
        padding: 0 14px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(11, 38, 86, 0.72);
        color: #dff0ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        transition: all 0.16s;
      }
      .m11-btn-ghost:hover {
        border-color: var(--cyan-bright);
        background: rgba(18, 62, 128, 0.85);
        color: #ffffff;
      }

      /* Upper 5-Card KPI Strip */
      .m11-kpi-strip {
        padding: 10px 14px 12px;
      }
      .m11-strip-header {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 9px;
      }
      .m11-kpi-5 {
        display: grid;
        grid-template-columns: repeat(5, 1fr);
        gap: 10px;
      }
      .m11-kpi-card {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 10px 13px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m11-kpi-ico {
        width: 34px;
        height: 34px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 165, 233, 0.16);
        border: 1px solid rgba(56, 220, 255, 0.42);
        color: #38f2ff;
      }
      .m11-kpi-ico.green {
        background: rgba(34, 197, 94, 0.16);
        border-color: rgba(74, 222, 128, 0.45);
        color: #4ade80;
      }
      .m11-kpi-ico.gold {
        background: rgba(250, 204, 21, 0.14);
        border-color: rgba(250, 204, 21, 0.48);
        color: #facc15;
      }
      .m11-kpi-ico.red {
        background: rgba(239, 68, 68, 0.16);
        border-color: rgba(248, 113, 113, 0.5);
        color: #f87171;
      }
      .m11-kpi-card-lbl {
        font-size: 11.5px;
        color: #b4d2f4;
        margin-bottom: 2px;
      }
      .m11-kpi-card-val {
        font-size: 20px;
        font-weight: 800;
        color: #38f2ff;
        font-variant-numeric: tabular-nums;
      }
      .m11-kpi-card-val.green { color: #4ade80; }
      .m11-kpi-card-val.gold { color: #facc15; }
      .m11-kpi-card-val.red { color: #f87171; }
      .m11-kpi-card-val small {
        font-size: 12px;
        font-weight: 500;
        color: #d6e9ff;
        margin-left: 3px;
      }

      /* 02 Algorithm 3-Col Workspace */
      .m11-algo-grid {
        display: grid;
        grid-template-columns: 270px 1fr 315px;
        gap: 10px;
        align-items: stretch;
      }
      .m11-algo-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m11-algo-card {
        padding: 9px 11px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.25);
        background: rgba(11, 38, 86, 0.45);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m11-algo-card:hover {
        border-color: rgba(56, 220, 255, 0.55);
        background: rgba(16, 56, 118, 0.6);
      }
      .m11-algo-card.active {
        border-color: #38f2ff;
        background: linear-gradient(90deg, rgba(16, 72, 148, 0.72), rgba(10, 40, 88, 0.65));
        box-shadow: 0 0 12px rgba(56, 242, 255, 0.25);
      }
      .m11-algo-card-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 6px;
        margin-bottom: 3px;
      }
      .m11-algo-id {
        font-size: 12.5px;
        font-weight: 700;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
      }
      .m11-algo-seg { font-size: 12px; color: #d6e9ff; }
      .m11-algo-meta { font-size: 11px; color: #8db3db; margin-top: 2px; }

      .m11-algo-kpi-3 {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
        margin: 10px 0 12px;
      }
      .m11-algo-kpi-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m11-algo-kpi-box span {
        display: block;
        font-size: 11.5px;
        color: #a9c6e8;
        margin-bottom: 4px;
      }
      .m11-algo-kpi-box strong {
        font-size: 20px;
        font-weight: 800;
        font-variant-numeric: tabular-nums;
      }
      .m11-chart-wrap {
        position: relative;
        border-radius: 8px;
        background: rgba(8, 28, 66, 0.5);
        border: 1px solid rgba(56, 189, 248, 0.2);
        padding: 10px 12px 8px;
      }
      .m11-chart-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #d7ebff;
        font-weight: 700;
        margin-bottom: 4px;
      }
      .m11-chart-tooltip {
        position: absolute;
        z-index: 15;
        pointer-events: none;
        padding: 7px 10px;
        border-radius: 7px;
        background: rgba(6, 20, 48, 0.96);
        border: 1px solid rgba(56, 220, 255, 0.65);
        box-shadow: 0 8px 20px rgba(0, 8, 28, 0.72);
        font-size: 11.5px;
        color: #eaf6ff;
        white-space: nowrap;
      }
      .m11-info-callout {
        margin-top: 10px;
        padding: 8px 11px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
        font-size: 12px;
        color: #c8e2fc;
      }
      .m11-src-item {
        display: flex;
        align-items: flex-start;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 0;
        border-bottom: 1px solid rgba(56, 189, 248, 0.12);
      }
      .m11-src-left {
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }
      .m11-src-ico {
        color: #38f2ff;
        margin-top: 2px;
        flex-shrink: 0;
      }
      .m11-geo-box {
        margin-top: 10px;
        padding: 10px 11px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }

      /* 03 Strategy & 04 Feedback 2-Col Split */
      .m11-split-2col {
        display: grid;
        grid-template-columns: 1.62fr 1fr;
        gap: 10px;
        align-items: stretch;
      }
      .m11-table-wrap {
        overflow-x: auto;
      }
      .m11-tr-selectable {
        cursor: pointer;
        transition: background 0.14s;
      }
      .m11-tr-selectable:hover {
        background: rgba(24, 78, 152, 0.36);
      }
      .m11-tr-selected {
        background: rgba(22, 96, 186, 0.34);
      }
      .m11-mode-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        margin: 10px 0;
      }
      .m11-mode-card {
        padding: 9px 10px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.5);
        border: 1px solid rgba(56, 189, 248, 0.25);
      }
      .m11-mode-card.active-warn {
        background: rgba(88, 60, 14, 0.38);
        border-color: rgba(250, 204, 21, 0.68);
      }
      .m11-mode-card.active-ok {
        background: rgba(16, 72, 138, 0.45);
        border-color: rgba(56, 242, 255, 0.65);
      }
      .m11-sub-box {
        padding: 10px 11px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.24);
        margin-top: 9px;
      }
      .m11-sub-box-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        font-weight: 700;
        color: #ffffff;
        margin-bottom: 7px;
      }

      /* 04 Feedback 3-Stage Pipeline */
      .m11-pipeline-3 {
        display: grid;
        grid-template-columns: 1fr 18px 1fr 18px 1fr;
        align-items: center;
        gap: 4px;
      }
      .m11-pipe-card {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(11, 38, 86, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m11-pipe-arrow {
        text-align: center;
        color: #5ea5e6;
        font-size: 16px;
        font-weight: 700;
      }
      .m11-highlight-metric {
        margin-top: 9px;
        padding: 8px 11px;
        border-radius: 7px;
        background: rgba(14, 48, 104, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.32);
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #d6e9ff;
      }

      /* 05 Replay Bottom Floating Chart Card */
      .m11-replay-dock {
        position: absolute;
        left: 294px;
        right: 322px;
        bottom: 48px;
        z-index: 20;
        pointer-events: auto;
        padding: 10px 14px 10px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.88);
        border: 1px solid var(--border-cyan);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
      }
      .m11-replay-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        margin-top: 6px;
      }
      .m11-replay-btn {
        width: 32px;
        height: 28px;
        border-radius: 6px;
        border: 1px solid rgba(56, 220, 255, 0.6);
        background: rgba(14, 72, 152, 0.68);
        color: #ffffff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }
      .m11-replay-btn:hover {
        background: rgba(24, 118, 232, 0.88);
        border-color: #38f2ff;
      }
      .m11-replay-slider {
        flex: 1;
        height: 5px;
        accent-color: #38f2ff;
        cursor: pointer;
      }

      /* Modals internal helpers */
      .m11-modal-form-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .m11-modal-input {
        width: 100%;
        height: 32px;
        padding: 4px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.45);
        background: rgba(9, 32, 74, 0.9);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
      }
      .m11-modal-input:focus { border-color: #38f2ff; }
      .m11-empty-box {
        padding: 28px 16px;
        text-align: center;
        color: #9ec4ea;
        font-size: 13px;
      }

      @media (max-width: 1280px) {
        .m11-algo-grid { grid-template-columns: 1fr; }
        .m11-split-2col { grid-template-columns: 1fr; }
        .m11-kpi-5 { grid-template-columns: repeat(3, 1fr); }
        .m11-map-stage .hud-left-col { width: 236px; }
        .m11-map-stage .hud-right-col { width: 256px; }
        .m11-map-toolbar, .m11-map-legend, .m11-replay-dock { left: 260px; right: 280px; }
        .m11-map-zoom { right: 280px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     CESIUM 3D CORRIDOR ENTITIES, MARKER PROJECTION & CLEANUP
     ------------------------------------------------------------------------ */
  function clearCesiumTempEntities(cesium) {
    if (postRenderRemover) {
      try { postRenderRemover(); } catch (e) {}
      postRenderRemover = null;
    }
    if (cesium && cesium.ready && cesium.viewer && tempCesiumEntities.length) {
      tempCesiumEntities.forEach(ent => {
        try { cesium.viewer.entities.remove(ent); } catch (e) {}
      });
    }
    tempCesiumEntities = [];
  }

  function clearAllTimers() {
    if (camAnimTimer) {
      clearInterval(camAnimTimer);
      camAnimTimer = null;
    }
    if (modalCamTimer) {
      clearInterval(modalCamTimer);
      modalCamTimer = null;
    }
    if (replayTimer) {
      clearInterval(replayTimer);
      replayTimer = null;
    }
  }

  function flyToAllPilotSegments(cesium, isReplay) {
    if (!cesium || !cesium.ready || !cesium.viewer || !window.Cesium) return;
    cesium.orbitActive = false;
    const targetLon = isReplay ? 126.14 : 126.16;
    const targetLat = isReplay ? 47.34 : 47.76;
    const target = Cesium.Cartesian3.fromDegrees(targetLon, targetLat, 240);
    const pitch = isReplay ? -26 : -28;
    const range = isReplay ? 150000 : 132000;
    cesium.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 48000), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(2), Cesium.Math.toRadians(pitch), range),
      duration: 1.2
    });
  }

  function flyToCorridorOverview(cesium) {
    flyToAllPilotSegments(cesium, lastSubPageId === 'replay');
  }

  function flyToPilotSegment(cesium, segId) {
    if (!cesium || !cesium.ready || !cesium.viewer || !window.Cesium) return;
    const seg = SEGMENT_BY_ID[segId];
    if (!seg) {
      flyToCorridorOverview(cesium);
      return;
    }
    cesium.orbitActive = false;
    const target = Cesium.Cartesian3.fromDegrees(seg.lon, seg.lat, seg.alt);
    cesium.viewer.camera.flyToBoundingSphere(new Cesium.BoundingSphere(target, 3200), {
      offset: new Cesium.HeadingPitchRange(Cesium.Math.toRadians(18), Cesium.Math.toRadians(-32), 14500),
      duration: 1.2
    });
  }

  function syncCesiumForSpeedMap(ctx, layersCfg, attentionSegIds, selectedSegId) {
    const ces = ctx && ctx.cesium;
    if (!ces || !ces.ready || !ces.viewer || !window.Cesium) return;

    const sig = JSON.stringify({
      sat: !!layersCfg.satellite,
      sec: !!layersCfg.sections,
      cor: !!layersCfg.corridor,
      att: !!layersCfg.attention,
      activeSec: getActiveSectionFilter(ctx),
      attIds: attentionSegIds
    });

    if (sig !== lastCesiumLayerSig) {
      lastCesiumLayerSig = sig;
      ces.applyLayers({
        satellite: !!layersCfg.satellite,
        uav: true,
        bim: false,
        pois: false,
        sections: !!layersCfg.sections,
        route: false,
        designMode: false,
        activeSectionId: getActiveSectionFilter(ctx)
      });
      if (typeof ces.syncHtmlOverlays === 'function') {
        ces.syncHtmlOverlays({ showRoute: false, showSections: false, showPois: false });
      }

      clearCesiumTempEntities(ces);

      if (layersCfg.corridor) {
        const positions = CORRIDOR_GEO.map(p => Cesium.Cartesian3.fromDegrees(p[0], p[1], 245));
        const corridorEnt = ces.viewer.entities.add({
          name: '智慧提速监测走廊',
          polyline: {
            positions,
            width: 5,
            clampToGround: true,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.25,
              color: Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.92)
            })
          }
        });
        tempCesiumEntities.push(corridorEnt);
      }

      if (layersCfg.attention) {
        PILOT_SEGMENTS.filter(s => attentionSegIds.includes(s.id)).forEach(seg => {
          const spanPos = seg.spanCoords.map(p => Cesium.Cartesian3.fromDegrees(p[0], p[1], 255));
          const warnEnt = ces.viewer.entities.add({
            name: `${seg.name} 需关注区段`,
            polyline: {
              positions: spanPos,
              width: 8,
              clampToGround: true,
              material: new Cesium.PolylineGlowMaterialProperty({
                glowPower: 0.35,
                color: Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.95)
              })
            }
          });
          tempCesiumEntities.push(warnEnt);
        });
      }
    }
  }

  function bindProjectedMarkers(ctx, markersLayerEl, selectedSegId, onSelectSeg, modeInfoFn) {
    const ces = ctx && ctx.cesium;
    if (!markersLayerEl) return;

    function updatePositions() {
      const w = markersLayerEl.clientWidth || window.innerWidth;
      const h = markersLayerEl.clientHeight || window.innerHeight;
      const cesReady = !!(ces && ces.ready && ces.viewer && window.Cesium);
      const pinEls = markersLayerEl.querySelectorAll('.m11-pin-wrap');
      pinEls.forEach(pin => {
        const seg = SEGMENT_BY_ID[pin.dataset.seg];
        if (!seg) return;
        if (cesReady) {
          const cart = Cesium.Cartesian3.fromDegrees(seg.lon, seg.lat, seg.alt + 12);
          const win = Cesium.SceneTransforms.worldToWindowCoordinates(ces.viewer.scene, cart);
          if (win && isFinite(win.x) && isFinite(win.y) && win.x >= 245 && win.x <= w - 275 && win.y >= 28 && win.y <= h - 28) {
            pin.style.display = 'flex';
            pin.style.left = `${win.x.toFixed(1)}px`;
            pin.style.top = `${win.y.toFixed(1)}px`;
          } else {
            pin.style.display = 'none';
          }
        } else {
          pin.style.display = 'flex';
          pin.style.left = `${seg.fallbackPct.x}%`;
          pin.style.top = `${seg.fallbackPct.y}%`;
        }
      });
    }

    updatePositions();
    if (ces && ces.ready && ces.viewer) {
      if (postRenderRemover) {
        try { postRenderRemover(); } catch (e) {}
      }
      postRenderRemover = ces.viewer.scene.postRender.addEventListener(updatePositions);
    }

    markersLayerEl.querySelectorAll('.m11-pin-wrap').forEach(pin => {
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        onSelectSeg(pin.dataset.seg);
      });
    });
  }

  /* ------------------------------------------------------------------------
     ANIMATED CAMERA CANVAS RENDERER (01_交通运行 & Modal)
     ------------------------------------------------------------------------ */
  function drawTrafficCameraFrame(canvas, seg, dirData, tick) {
    if (!canvas) return;
    const ctx2d = canvas.getContext('2d');
    if (!ctx2d) return;
    const W = canvas.width;
    const H = canvas.height;

    // Sky / winter dusk backdrop
    const skyGrad = ctx2d.createLinearGradient(0, 0, 0, H * 0.25);
    skyGrad.addColorStop(0, '#4e657d');
    skyGrad.addColorStop(1, '#7c8e9e');
    ctx2d.fillStyle = skyGrad;
    ctx2d.fillRect(0, 0, W, H);

    // Snow embankment left & right
    ctx2d.fillStyle = '#c8d2dc';
    ctx2d.beginPath();
    ctx2d.moveTo(0, H * 0.14);
    ctx2d.lineTo(W * 0.35, H * 0.14);
    ctx2d.lineTo(0, H * 0.92);
    ctx2d.closePath();
    ctx2d.fill();

    ctx2d.fillStyle = '#d3dce4';
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.68, H * 0.14);
    ctx2d.lineTo(W, H * 0.14);
    ctx2d.lineTo(W, H * 0.96);
    ctx2d.closePath();
    ctx2d.fill();

    // Asphalt highway trapezoid
    const roadGrad = ctx2d.createLinearGradient(0, H * 0.14, 0, H);
    roadGrad.addColorStop(0, '#5a636e');
    roadGrad.addColorStop(1, '#3b424c');
    ctx2d.fillStyle = roadGrad;
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.34, H * 0.14);
    ctx2d.lineTo(W * 0.69, H * 0.14);
    ctx2d.lineTo(W * 0.96, H);
    ctx2d.lineTo(W * 0.03, H);
    ctx2d.closePath();
    ctx2d.fill();

    // Left yellow edge line & right white shoulder line
    ctx2d.strokeStyle = '#d4a634';
    ctx2d.lineWidth = 2;
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.36, H * 0.14);
    ctx2d.lineTo(W * 0.08, H);
    ctx2d.stroke();

    ctx2d.strokeStyle = '#e5edf5';
    ctx2d.lineWidth = 2.2;
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.59, H * 0.14);
    ctx2d.lineTo(W * 0.72, H);
    ctx2d.stroke();

    // Guardrail on right edge
    ctx2d.strokeStyle = '#9aa8b8';
    ctx2d.lineWidth = 3;
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.69, H * 0.14);
    ctx2d.lineTo(W * 0.96, H);
    ctx2d.stroke();

    // Animated center lane dashed divider
    const dashOffset = (tick * 2.4) % 28;
    ctx2d.strokeStyle = 'rgba(241, 245, 249, 0.85)';
    ctx2d.lineWidth = 2;
    ctx2d.setLineDash([14, 14]);
    ctx2d.lineDashOffset = -dashOffset;
    ctx2d.beginPath();
    ctx2d.moveTo(W * 0.47, H * 0.14);
    ctx2d.lineTo(W * 0.38, H);
    ctx2d.stroke();
    ctx2d.setLineDash([]);

    // Moving passenger vehicle in inner lane
    const carProg = ((tick * 0.012) % 1);
    const carY = H * (0.24 + carProg * 0.56);
    const carScale = 0.45 + carProg * 0.85;
    const carX = W * (0.44 - carProg * 0.04);
    ctx2d.fillStyle = '#cbd5e1';
    ctx2d.fillRect(carX - 18 * carScale, carY - 12 * carScale, 36 * carScale, 20 * carScale);
    ctx2d.fillStyle = '#1e293b';
    ctx2d.fillRect(carX - 13 * carScale, carY - 10 * carScale, 26 * carScale, 8 * carScale);
    ctx2d.fillStyle = '#ef4444';
    ctx2d.fillRect(carX - 16 * carScale, carY + 3 * carScale, 5 * carScale, 3 * carScale);
    ctx2d.fillRect(carX + 11 * carScale, carY + 3 * carScale, 5 * carScale, 3 * carScale);

    // Distant second vehicle
    const car2Y = H * (0.18 + ((carProg + 0.45) % 1) * 0.4);
    const car2S = 0.3 + ((carProg + 0.45) % 1) * 0.45;
    const car2X = W * 0.53;
    ctx2d.fillStyle = '#64748b';
    ctx2d.fillRect(car2X - 16 * car2S, car2Y - 10 * car2S, 32 * car2S, 16 * car2S);

    // Hard shoulder stopped truck or debris box if attention segment
    if (dirData.shoulderOccupied || dirData.camBoxText) {
      const bx = W * 0.62;
      const by = H * 0.36;
      const bw = W * 0.19;
      const bh = H * 0.46;

      if (dirData.shoulderOccupied) {
        // Stationary white box truck on hard shoulder
        ctx2d.fillStyle = '#e2e8f0';
        ctx2d.fillRect(bx + 8, by + 6, bw - 16, bh - 20);
        ctx2d.fillStyle = '#94a3b8';
        ctx2d.fillRect(bx + 8, by + bh - 16, bw - 16, 10);
        // Hazard blinkers
        if (Math.floor(tick / 6) % 2 === 0) {
          ctx2d.fillStyle = '#f59e0b';
          ctx2d.fillRect(bx + 10, by + bh - 14, 7, 4);
          ctx2d.fillRect(bx + bw - 17, by + bh - 14, 7, 4);
        }
      } else {
        // Debris object on outer edge
        ctx2d.fillStyle = '#b45309';
        ctx2d.fillRect(bx + bw * 0.25, by + bh * 0.55, bw * 0.45, bh * 0.25);
      }

      // Yellow dashed AI detection box
      ctx2d.strokeStyle = '#facc15';
      ctx2d.lineWidth = 2;
      ctx2d.setLineDash([5, 4]);
      ctx2d.strokeRect(bx, by, bw, bh);
      ctx2d.setLineDash([]);

      // Detection label badge
      const label = dirData.camBoxText || '异常事件识别';
      ctx2d.font = 'bold 11px "Microsoft YaHei", sans-serif';
      const tw = ctx2d.measureText(label).width + 12;
      const lx = Math.min(W - tw - 6, bx - 4);
      const ly = by + bh + 4;
      ctx2d.fillStyle = 'rgba(15, 23, 42, 0.88)';
      ctx2d.fillRect(lx, ly - 14, tw, 18);
      ctx2d.strokeStyle = 'rgba(250, 204, 21, 0.8)';
      ctx2d.lineWidth = 1;
      ctx2d.strokeRect(lx, ly - 14, tw, 18);
      ctx2d.fillStyle = '#fef08a';
      ctx2d.fillText(label, lx + 6, ly - 1);
    }

    // Top-left camera pill
    const camTag = `${seg.camId} · 视频示意`;
    ctx2d.font = '600 11px "Microsoft YaHei", sans-serif';
    const tagW = ctx2d.measureText(camTag).width + 16;
    ctx2d.fillStyle = 'rgba(4, 15, 36, 0.78)';
    ctx2d.fillRect(8, 8, tagW, 20);
    ctx2d.strokeStyle = 'rgba(56, 189, 248, 0.48)';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(8, 8, tagW, 20);
    ctx2d.fillStyle = '#f1f7ff';
    ctx2d.fillText(camTag, 16, 22);
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 01: 交通运行 (traffic)
     ------------------------------------------------------------------------ */
  function renderTraffic(hostEl, ctx) {
    const activeSec = getActiveSectionFilter(ctx);
    let segments = PILOT_SEGMENTS;
    if (activeSec) {
      const secSegs = getSegmentsForSection(activeSec);
      if (secSegs.length) segments = secSegs;
    }
    if (ui.trSegFilter !== 'all') {
      const f = segments.filter(s => s.id === ui.trSegFilter);
      if (f.length) segments = f;
    }
    if (!segments.some(s => s.id === ui.trSelectedSegId)) {
      ui.trSelectedSegId = segments[0].id;
    }

    const dirKey = ui.trDirection;
    const dirLabel = dirKey === 'beian' ? '北安方向' : '明水方向';

    // Compute KPIs genuinely from active segments & direction
    const segCount = segments.length;
    const totalLen = segments.reduce((acc, s) => acc + s.lengthKm, 0);
    const avgSpeed = segCount ? (segments.reduce((acc, s) => acc + s.directions[dirKey].avgSpeed, 0) / segCount) : 0;
    const totalFlow = segments.reduce((acc, s) => acc + s.directions[dirKey].flow, 0);
    const attentionSegs = segments.filter(s => s.directions[dirKey].attention);
    const maxQueue = segments.reduce((acc, s) => Math.max(acc, s.directions[dirKey].queueM), 0);

    const selSeg = SEGMENT_BY_ID[ui.trSelectedSegId] || segments[0];
    const selDir = selSeg.directions[dirKey];

    // Sync Cesium 3D layers & corridor polylines
    syncCesiumForSpeedMap(
      ctx,
      ui.trLayers,
      PILOT_SEGMENTS.filter(s => s.directions[dirKey].attention).map(s => s.id),
      selSeg.id
    );

    hostEl.innerHTML = `
      <div class="m11-map-stage">
        <!-- LEFT HUD -->
        <aside class="hud-left-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">受限路段运行概况</span>
              </div>
              <span class="m11-hud-head-meta">10:05</span>
            </div>
            <div class="panel-body">
              <div class="m11-kpi-grid-3x2">
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">试点区段</div>
                  <div class="m11-mini-kpi-val">${segCount}<span class="m11-mini-kpi-unit">段</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">研究范围</div>
                  <div class="m11-mini-kpi-val">约 ${totalLen.toFixed(1)}<span class="m11-mini-kpi-unit">km</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">区段均速</div>
                  <div class="m11-mini-kpi-val">${avgSpeed.toFixed(1)}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">监测流量</div>
                  <div class="m11-mini-kpi-val">${fmtComma(totalFlow)}<span class="m11-mini-kpi-unit">辆/h</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">需关注区段</div>
                  <div class="m11-mini-kpi-val ${attentionSegs.length ? 'gold' : ''}">${attentionSegs.length}<span class="m11-mini-kpi-unit">段</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">最长队列</div>
                  <div class="m11-mini-kpi-val ${maxQueue > 0 ? 'gold' : ''}">${maxQueue}<span class="m11-mini-kpi-unit">m</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">分区段运行</span>
              </div>
              <span class="m11-hud-head-meta">${esc(dirLabel)}</span>
            </div>
            <div class="panel-body">
              <div class="m11-seg-head">
                <span>试点区段 / 事件</span>
                <span>km/h</span>
                <span>辆/h</span>
              </div>
              <div class="m11-seg-list">
                ${segments.map(seg => {
                  const d = seg.directions[dirKey];
                  const active = seg.id === selSeg.id;
                  return `
                    <div class="m11-seg-row ${active ? 'active' : ''}" data-seg="${esc(seg.id)}">
                      <div style="min-width:0;">
                        <div class="m11-seg-name">${esc(seg.name)}</div>
                        <div class="m11-seg-sub ${d.attention ? 'warn' : ''}">${esc(d.eventDesc)}</div>
                      </div>
                      <div class="m11-seg-num">${d.avgSpeed}</div>
                      <div class="m11-seg-num">${d.flow}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </aside>

        <!-- TOP FLOATING TOOLBAR -->
        <div class="m11-map-toolbar">
          <div class="m11-map-toolbar-left">
            <select class="m11-compact-select" id="m11TrSegSelect">
              <option value="all" ${ui.trSegFilter === 'all' ? 'selected' : ''}>全部试点区段</option>
              ${PILOT_SEGMENTS.map(s => `<option value="${esc(s.id)}" ${ui.trSegFilter === s.id ? 'selected' : ''}>${esc(s.name)} (${esc(s.id)})</option>`).join('')}
            </select>
            <select class="m11-compact-select" id="m11TrDirSelect">
              <option value="beian" ${dirKey === 'beian' ? 'selected' : ''}>北安方向</option>
              <option value="mingshui" ${dirKey === 'mingshui' ? 'selected' : ''}>明水方向</option>
            </select>
            <span class="m11-toolbar-time">2026-11-26 10:05</span>
          </div>
          <div class="m11-map-toolbar-right">
            <button class="dock-btn" id="m11TrLayerBtn">${ICONS.layers} 图层</button>
            <button class="dock-btn" id="m11TrLocateBtn">${ICONS.locate} 定位试点</button>
            ${ui.trShowLayersPopover ? `
              <div class="m11-layer-popover" id="m11TrLayerPopover">
                <label class="m11-layer-item"><input type="checkbox" data-layer="corridor" ${ui.trLayers.corridor ? 'checked' : ''}> 监测走廊</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="attention" ${ui.trLayers.attention ? 'checked' : ''}> 需关注区段</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="markers" ${ui.trLayers.markers ? 'checked' : ''}> 试点标注</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="satellite" ${ui.trLayers.satellite ? 'checked' : ''}> 卫星影像底图</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="sections" ${ui.trLayers.sections ? 'checked' : ''}> 工区范围高亮</label>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- ZOOM & LOCATE CONTROLS -->
        <div class="zoom-pill vertical m11-map-zoom">
          <button class="zoom-btn" id="m11TrZoomIn" title="放大">+</button>
          <button class="zoom-btn" id="m11TrZoomOut" title="缩小">−</button>
          <button class="zoom-btn" id="m11TrZoomReset" title="全线视角">${ICONS.locate}</button>
        </div>

        <!-- CESIUM PROJECTED MARKERS -->
        <div class="m11-map-markers-layer" id="m11TrMarkersLayer" style="${ui.trLayers.markers ? '' : 'display:none;'}">
          ${PILOT_SEGMENTS.map(seg => {
            const d = seg.directions[dirKey];
            const isSel = seg.id === selSeg.id;
            return `
              <div class="m11-pin-wrap ${isSel ? 'active' : ''} ${d.attention ? 'warn' : ''}" data-seg="${esc(seg.id)}">
                <div class="m11-pin-label">${esc(seg.name)}</div>
                <div class="m11-pin-dot"></div>
                ${isSel ? `
                  <div class="m11-pin-popup">
                    <div class="m11-pin-popup-title">${esc(seg.id)} ${esc(d.eventTitle)}</div>
                    <div class="m11-pin-popup-sub">区段均速 ${d.avgSpeed} km/h · 排队 ${d.queueM} m</div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- BOTTOM LEGEND -->
        <div class="m11-map-legend">
          <div class="m11-legend-items">
            <span><i class="m11-legend-swatch" style="background:#38f2ff;"></i>监测走廊</span>
            <span><i class="m11-legend-swatch" style="background:#f59e0b;"></i>需关注区段</span>
          </div>
          <span>明水至北安段 · 底图与试点位置示意</span>
          <span>↑ 北</span>
        </div>

        <!-- RIGHT HUD -->
        <aside class="hud-right-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">选中试点区段</span>
              </div>
            </div>
            <div class="panel-body">
              <div class="m11-seg-insp-top">
                <span class="m11-seg-insp-title">${esc(selSeg.name)} · ${esc(selSeg.id)}</span>
                <span class="${selDir.attention ? 'm11-pill-warn' : 'm11-pill-ok'}">${esc(selDir.statusLabel)}</span>
              </div>
              <div class="m11-lane-cards-3">
                <div class="m11-lane-mini">
                  <div class="m11-lane-mini-lbl">内侧实测车速</div>
                  <div class="m11-lane-mini-val">${selDir.innerSpeed}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-lane-mini">
                  <div class="m11-lane-mini-lbl">外侧实测车速</div>
                  <div class="m11-lane-mini-val">${selDir.outerSpeed}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-lane-mini ${selDir.shoulderOccupied ? 'occupied' : ''}">
                  <div class="m11-lane-mini-lbl">硬路肩</div>
                  <div class="m11-lane-mini-val">${esc(selDir.shoulderStatus)}</div>
                </div>
              </div>
              <div class="m11-kv-rows">
                <div class="m11-kv-row"><span class="m11-kv-k">识别时间</span><span class="m11-kv-v">${esc(selDir.detectTime)}</span></div>
                <div class="m11-kv-row"><span class="m11-kv-k">感知来源</span><span class="m11-kv-v">${esc(selDir.source)}</span></div>
                <div class="m11-kv-row"><span class="m11-kv-k">实测排队</span><span class="m11-kv-v">${selDir.queueM} m</span></div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">气象、路面与视频</span>
              </div>
              <button class="m11-hud-link" id="m11TrOpenVideo">关联视频 &gt;</button>
            </div>
            <div class="panel-body">
              <div class="m11-kv-rows">
                <div class="m11-kv-row"><span class="m11-kv-k">气温</span><span class="m11-kv-v">${esc(selSeg.weather.temp)}</span></div>
                <div class="m11-kv-row"><span class="m11-kv-k">能见度</span><span class="m11-kv-v">${esc(selSeg.weather.vis)}</span></div>
                <div class="m11-kv-row"><span class="m11-kv-k">路面状态</span><span class="m11-kv-v">${esc(selSeg.weather.road)}</span></div>
              </div>
              <div class="m11-cam-box" id="m11TrCamBox" title="点击放大查看关联路侧视频与雷达详情">
                <canvas id="m11TrCamCanvas" width="320" height="156"></canvas>
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Bind left list selection
    hostEl.querySelectorAll('.m11-seg-row').forEach(row => {
      row.addEventListener('click', () => {
        ui.trSelectedSegId = row.dataset.seg;
        flyToPilotSegment(ctx.cesium, ui.trSelectedSegId);
        renderTraffic(hostEl, ctx);
      });
    });

    // Toolbar controls
    const segSelect = hostEl.querySelector('#m11TrSegSelect');
    if (segSelect) {
      segSelect.addEventListener('change', () => {
        ui.trSegFilter = segSelect.value;
        if (ui.trSegFilter !== 'all') {
          ui.trSelectedSegId = ui.trSegFilter;
          flyToPilotSegment(ctx.cesium, ui.trSelectedSegId);
        } else {
          flyToCorridorOverview(ctx.cesium);
        }
        renderTraffic(hostEl, ctx);
      });
    }

    const dirSelect = hostEl.querySelector('#m11TrDirSelect');
    if (dirSelect) {
      dirSelect.addEventListener('change', () => {
        ui.trDirection = dirSelect.value;
        renderTraffic(hostEl, ctx);
      });
    }

    const layerBtn = hostEl.querySelector('#m11TrLayerBtn');
    if (layerBtn) {
      layerBtn.addEventListener('click', () => {
        ui.trShowLayersPopover = !ui.trShowLayersPopover;
        renderTraffic(hostEl, ctx);
      });
    }

    const popover = hostEl.querySelector('#m11TrLayerPopover');
    if (popover) {
      popover.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          ui.trLayers[cb.dataset.layer] = cb.checked;
          renderTraffic(hostEl, ctx);
        });
      });
    }

    const locateBtn = hostEl.querySelector('#m11TrLocateBtn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        flyToPilotSegment(ctx.cesium, selSeg.id);
        ctx.showToast(`已定位至 ${selSeg.name}（${selSeg.stake}）`);
      });
    }

    const zoomIn = hostEl.querySelector('#m11TrZoomIn');
    const zoomOut = hostEl.querySelector('#m11TrZoomOut');
    const zoomReset = hostEl.querySelector('#m11TrZoomReset');
    if (zoomIn) zoomIn.addEventListener('click', () => ctx.cesium && ctx.cesium.zoomIn());
    if (zoomOut) zoomOut.addEventListener('click', () => ctx.cesium && ctx.cesium.zoomOut());
    if (zoomReset) zoomReset.addEventListener('click', () => flyToCorridorOverview(ctx.cesium));

    // Projected markers
    bindProjectedMarkers(ctx, hostEl.querySelector('#m11TrMarkersLayer'), selSeg.id, (segId) => {
      ui.trSelectedSegId = segId;
      flyToPilotSegment(ctx.cesium, segId);
      renderTraffic(hostEl, ctx);
    });

    // Camera live canvas animation
    const camCanvas = hostEl.querySelector('#m11TrCamCanvas');
    if (camAnimTimer) { clearInterval(camAnimTimer); camAnimTimer = null; }
    let camTick = 0;
    drawTrafficCameraFrame(camCanvas, selSeg, selDir, camTick);
    camAnimTimer = setInterval(() => {
      if (lastSubPageId !== 'traffic' || !document.body.contains(camCanvas)) {
        clearInterval(camAnimTimer);
        camAnimTimer = null;
        return;
      }
      camTick += 1;
      drawTrafficCameraFrame(camCanvas, selSeg, selDir, camTick);
    }, 90);

    // Open video modal
    const openVideoModal = () => {
      if (modalCamTimer) { clearInterval(modalCamTimer); modalCamTimer = null; }
      ctx.openModal(`${selSeg.name} · 路侧实时视频与雷达融合画面（${selSeg.camId}）`, `
        <div style="display:flex;flex-direction:column;gap:12px;">
          <div style="border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.45);background:#071426;">
            <canvas id="m11ModalCamCanvas" width="660" height="290" style="width:100%;display:block;"></canvas>
          </div>
          <div class="detail-grid">
            <div class="detail-stat-card"><span>内侧 / 外侧车速</span><strong>${selDir.innerSpeed} / ${selDir.outerSpeed} km/h</strong></div>
            <div class="detail-stat-card"><span>硬路肩识别状态</span><strong style="color:${selDir.shoulderOccupied ? '#facc15' : '#4ade80'}">${esc(selDir.shoulderStatus)}</strong></div>
            <div class="detail-stat-card"><span>实测排队 / 流量</span><strong>${selDir.queueM} m / ${selDir.flow} 辆/h</strong></div>
          </div>
          <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#b4d2f4;">
            <span>桩号位置：${esc(selSeg.stake)}（${esc(selSeg.sectionName)}） · 气象：${esc(selSeg.weather.temp)} / 能见度 ${esc(selSeg.weather.vis)}</span>
            <button class="m11-btn-primary" id="m11ModalGoAlgo">进入算法研判 &gt;</button>
          </div>
        </div>
      `);
      const modalCanvas = document.getElementById('m11ModalCamCanvas');
      let mTick = camTick;
      drawTrafficCameraFrame(modalCanvas, selSeg, selDir, mTick);
      modalCamTimer = setInterval(() => {
        const modalEl = document.getElementById('globalModal');
        if (!modalCanvas || !document.body.contains(modalCanvas) || !modalEl || !modalEl.classList.contains('open')) {
          clearInterval(modalCamTimer);
          modalCamTimer = null;
          return;
        }
        mTick += 1;
        drawTrafficCameraFrame(modalCanvas, selSeg, selDir, mTick);
      }, 90);
      const goAlgoBtn = document.getElementById('m11ModalGoAlgo');
      if (goAlgoBtn) {
        goAlgoBtn.addEventListener('click', () => {
          ctx.closeModal();
          ctx.switchModule('speed', 'algorithm');
        });
      }
    };

    const openVidBtn = hostEl.querySelector('#m11TrOpenVideo');
    const camBox = hostEl.querySelector('#m11TrCamBox');
    if (openVidBtn) openVidBtn.addEventListener('click', openVideoModal);
    if (camBox) camBox.addEventListener('click', openVideoModal);
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 02: 算法研判 (algorithm)
     ------------------------------------------------------------------------ */
  function buildQueuePredictionSvg(rec) {
    const W = 680;
    const H = 240;
    const padL = 44;
    const padR = 20;
    const padT = 22;
    const padB = 34;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const yMax = 800;

    const xCount = rec.xLabels.length;
    const xAt = (i) => padL + (i / (xCount - 1)) * plotW;
    const yAt = (v) => padT + (1 - Math.min(yMax, Math.max(0, v)) / yMax) * plotH;

    const splitX = xAt(rec.splitIndex);

    // Build measured polyline points (0 .. splitIndex)
    const measuredPts = rec.measuredSeries.map((v, i) => `${xAt(i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');
    // Build predicted polyline points (splitIndex .. xCount - 1)
    const predPts = rec.predictedSeries.map((v, i) => `${xAt(rec.splitIndex + i).toFixed(1)},${yAt(v).toFixed(1)}`).join(' ');

    const gridYs = [0, 200, 400, 600, 800].map(val => {
      const y = yAt(val).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(125,211,252,0.14)" stroke-width="1"/>
        <text x="${padL - 8}" y="${Number(y) + 4}" text-anchor="end" fill="#8fb4db" font-size="11">${val}</text>
      `;
    }).join('');

    const xAxisLabels = rec.xLabels.map((lbl, i) => {
      const isSplit = i === rec.splitIndex;
      return `<text x="${xAt(i).toFixed(1)}" y="${H - 10}" text-anchor="middle" fill="${isSplit ? '#38f2ff' : '#9dc2e8'}" font-size="11" font-weight="${isSplit ? '700' : '500'}">${esc(lbl)}</text>`;
    }).join('');

    const measuredDots = rec.measuredSeries.map((v, i) => {
      const cx = xAt(i).toFixed(1);
      const cy = yAt(v).toFixed(1);
      return `
        <circle cx="${cx}" cy="${cy}" r="4" fill="#071b3d" stroke="#22d3ee" stroke-width="2.2"/>
        <text x="${cx}" y="${Number(cy) - 10}" text-anchor="middle" fill="#e6f4ff" font-size="11" font-weight="700">${v}</text>
      `;
    }).join('');

    const predDots = rec.predictedSeries.map((v, i) => {
      if (i === 0) return ''; // shared split point already rendered
      const cx = xAt(rec.splitIndex + i).toFixed(1);
      const cy = yAt(v).toFixed(1);
      return `
        <circle cx="${cx}" cy="${cy}" r="4" fill="#071b3d" stroke="#c084fc" stroke-width="2.2"/>
        <text x="${cx}" y="${Number(cy) - 10}" text-anchor="middle" fill="#e9d5ff" font-size="11" font-weight="700">${v}</text>
      `;
    }).join('');

    // Hover hit zones
    const hitZones = rec.xLabels.map((lbl, i) => {
      const cx = xAt(i);
      const isPred = i > rec.splitIndex;
      const val = isPred ? rec.predictedSeries[i - rec.splitIndex] : rec.measuredSeries[i];
      return `<rect class="m11-algo-hit" data-idx="${i}" data-x="${cx.toFixed(1)}" data-y="${yAt(val).toFixed(1)}" x="${(cx - 28).toFixed(1)}" y="${padT}" width="56" height="${plotH}" fill="transparent" style="cursor:crosshair;"/>`;
    }).join('');

    return `
      <svg id="m11AlgoSvg" viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
        <defs>
          <linearGradient id="m11-pred-zone" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#8b5cf6" stop-opacity="0.16"/>
            <stop offset="100%" stop-color="#6366f1" stop-opacity="0.08"/>
          </linearGradient>
        </defs>
        ${gridYs}
        <rect x="${splitX.toFixed(1)}" y="${padT}" width="${(W - padR - splitX).toFixed(1)}" height="${plotH}" fill="url(#m11-pred-zone)"/>
        <text x="${W - padR - 6}" y="${padT + 14}" text-anchor="end" fill="#c4b5fd" font-size="11">预测区间</text>
        <line x1="${splitX.toFixed(1)}" y1="${padT}" x2="${splitX.toFixed(1)}" y2="${padT + plotH}" stroke="rgba(196,181,253,0.45)" stroke-width="1.2" stroke-dasharray="4 4"/>
        <polyline fill="none" stroke="#22d3ee" stroke-width="2.6" points="${measuredPts}"/>
        <polyline fill="none" stroke="#c084fc" stroke-width="2.4" stroke-dasharray="6 4" points="${predPts}"/>
        ${measuredDots}
        ${predDots}
        ${xAxisLabels}
        <line id="m11AlgoCrosshair" x1="0" y1="${padT}" x2="0" y2="${padT + plotH}" stroke="rgba(56,242,255,0.45)" stroke-width="1" stroke-dasharray="3 3" style="display:none;"/>
        ${hitZones}
      </svg>
    `;
  }

  function renderAlgorithm(hostEl, ctx) {
    const activeSec = getActiveSectionFilter(ctx);
    const matchingSecSegIds = activeSec ? getSegmentsForSection(activeSec).map(s => s.id) : null;

    const filtered = INITIAL_ALGO_RECORDS.filter(r => {
      if (matchingSecSegIds && !matchingSecSegIds.includes(r.segId)) return false;
      if (ui.algoApplied.seg !== 'all' && r.segId !== ui.algoApplied.seg) return false;
      if (ui.algoApplied.type !== 'all' && r.type !== ui.algoApplied.type) return false;
      if (ui.algoApplied.status !== 'all' && r.status !== ui.algoApplied.status) return false;
      if (ui.algoApplied.date !== 'all' && r.date !== ui.algoApplied.date) return false;
      return true;
    });

    if (filtered.length && !filtered.some(r => r.id === ui.algoSelectedId)) {
      ui.algoSelectedId = filtered[0].id;
    }
    const activeRec = filtered.find(r => r.id === ui.algoSelectedId) || filtered[0] || INITIAL_ALGO_RECORDS[0];
    const activeSeg = SEGMENT_BY_ID[activeRec.segId] || PILOT_SEGMENTS[0];

    // Dynamic KPI counts when filtered by section or full corridor
    const isDefaultAll = !matchingSecSegIds && ui.algoApplied.seg === 'all' && ui.algoApplied.type === 'all' && ui.algoApplied.status === 'all' && ui.algoApplied.date === '2026-11-26';
    const kpiTodayCount = isDefaultAll ? 16 : filtered.length;
    const kpiGenCount = isDefaultAll ? 14 : filtered.filter(r => r.status === '已生成').length;
    const kpiSyncCount = isDefaultAll ? 2 : filtered.filter(r => r.status !== '已生成').length;
    const kpiAttnSegs = isDefaultAll ? 2 : new Set(filtered.filter(r => r.status !== '已生成').map(r => r.segId)).size;

    const srcIcon = (key) => ICONS[key] || ICONS.bim;

    hostEl.innerHTML = `
      <div class="m11-page">
        <!-- FILTER BAR -->
        <div class="glass-panel m11-filter-bar">
          <div class="m11-filter-fields">
            <label class="m11-field">
              <span class="m11-field-label">试点区段</span>
              <select class="m11-select" id="m11AlgoSeg">
                <option value="all" ${ui.algoSegFilter === 'all' ? 'selected' : ''}>全部区段</option>
                ${PILOT_SEGMENTS.map(s => `<option value="${esc(s.id)}" ${ui.algoSegFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">研判类型</span>
              <select class="m11-select" id="m11AlgoType">
                <option value="all" ${ui.algoTypeFilter === 'all' ? 'selected' : ''}>全部类型</option>
                <option value="状态识别" ${ui.algoTypeFilter === '状态识别' ? 'selected' : ''}>状态识别</option>
                <option value="队列预测" ${ui.algoTypeFilter === '队列预测' ? 'selected' : ''}>队列预测</option>
                <option value="回退建议" ${ui.algoTypeFilter === '回退建议' ? 'selected' : ''}>回退建议</option>
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">输出状态</span>
              <select class="m11-select" id="m11AlgoStatus">
                <option value="all" ${ui.algoStatusFilter === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="需关注" ${ui.algoStatusFilter === '需关注' ? 'selected' : ''}>需关注</option>
                <option value="待核查" ${ui.algoStatusFilter === '待核查' ? 'selected' : ''}>待核查</option>
                <option value="已生成" ${ui.algoStatusFilter === '已生成' ? 'selected' : ''}>已生成</option>
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">分析日期</span>
              <select class="m11-select" id="m11AlgoDate">
                <option value="2026-11-26" ${ui.algoDateFilter === '2026-11-26' ? 'selected' : ''}>2026-11-26</option>
                <option value="2026-11-25" ${ui.algoDateFilter === '2026-11-25' ? 'selected' : ''}>2026-11-25</option>
                <option value="all" ${ui.algoDateFilter === 'all' ? 'selected' : ''}>全部日期</option>
              </select>
            </label>
          </div>
          <div class="m11-filter-actions">
            <button class="m11-btn-primary" id="m11AlgoQueryBtn">${ICONS.search} 查询</button>
            <button class="m11-btn-ghost" id="m11AlgoResetBtn">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- KPI STRIP -->
        <div class="glass-panel m11-kpi-strip">
          <div class="m11-strip-header">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">专项算法成果</span>
            <span class="panel-subtitle">（截至 2026-11-26 10:05）</span>
          </div>
          <div class="m11-kpi-5">
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.bim}</div>
              <div><div class="m11-kpi-card-lbl">接入研判类型</div><div class="m11-kpi-card-val">3<small>类</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.audit}</div>
              <div><div class="m11-kpi-card-lbl">本日研判</div><div class="m11-kpi-card-val">${kpiTodayCount}<small>次</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico green">${ICONS.check}</div>
              <div><div class="m11-kpi-card-lbl">已生成结果</div><div class="m11-kpi-card-val green">${kpiGenCount}<small>次</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico gold">${ICONS.clock}</div>
              <div><div class="m11-kpi-card-lbl">待同步结果</div><div class="m11-kpi-card-val gold">${kpiSyncCount}<small>次</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico gold">${ICONS.warn}</div>
              <div><div class="m11-kpi-card-lbl">需关注试点区段</div><div class="m11-kpi-card-val gold">${kpiAttnSegs}<small>段</small></div></div>
            </div>
          </div>
        </div>

        <!-- 3-COLUMN WORKSPACE -->
        ${filtered.length === 0 ? `
          <div class="glass-panel m11-empty-box">
            当前工区或筛选条件下暂无算法研判记录（试点区段位于二工区、三工区、四工区、六工区）。
            <div style="margin-top:10px;"><button class="m11-btn-primary" id="m11AlgoClearSecBtn">查看全线研判记录</button></div>
          </div>
        ` : `
          <div class="m11-algo-grid">
            <!-- LEFT: RECORD LIST -->
            <div class="glass-panel" style="display:flex;flex-direction:column;">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">专项研判记录</span>
                </div>
              </div>
              <div class="panel-body" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;gap:10px;">
                <div class="m11-algo-list">
                  ${filtered.slice(0, 4).map(r => {
                    const pillCls = r.status === '已生成' ? 'm11-pill-ok' : 'm11-pill-warn';
                    return `
                      <div class="m11-algo-card ${r.id === activeRec.id ? 'active' : ''}" data-algo-id="${esc(r.id)}">
                        <div class="m11-algo-card-top">
                          <span class="m11-algo-id">${esc(r.id)}</span>
                          <span class="${pillCls}">${esc(r.status)}</span>
                        </div>
                        <div class="m11-algo-seg">${esc(r.segName)}</div>
                        <div class="m11-algo-meta">${esc(r.time)} &nbsp; ${esc(r.summary)}</div>
                      </div>
                    `;
                  }).join('')}
                </div>
                <div class="m11-kv-row" style="padding-top:6px;border-top:1px solid rgba(56,189,248,0.16);">
                  <span class="m11-kv-k">本日研判 ${kpiTodayCount} 次</span>
                  <button class="m11-hud-link" id="m11AlgoHistoryBtn">查看历史 &gt;</button>
                </div>
              </div>
            </div>

            <!-- CENTER: PREDICTION & RISK -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">状态识别、预测与风险研判</span>
                </div>
                <button class="m11-hud-link" id="m11AlgoGoStrategy">查看速度策略 &gt;</button>
              </div>
              <div class="panel-body">
                <div class="m11-seg-insp-top" style="margin-bottom:4px;">
                  <div>
                    <span style="font-size:15px;font-weight:700;color:#fff;">${esc(activeRec.segName)}</span>
                    <span style="font-size:12px;color:#8fb4db;margin-left:8px;">${esc(activeRec.id)}</span>
                  </div>
                  <span class="${activeRec.status === '已生成' ? 'm11-pill-ok' : 'm11-pill-warn'}">${esc(activeRec.badgeText)}</span>
                </div>

                <div class="m11-algo-kpi-3">
                  <div class="m11-algo-kpi-box">
                    <span>状态识别</span>
                    <strong style="color:${activeRec.status === '已生成' ? '#4ade80' : '#facc15'};">${esc(activeRec.stateDetect)}</strong>
                  </div>
                  <div class="m11-algo-kpi-box">
                    <span>实测排队长度</span>
                    <strong style="color:#38f2ff;">${activeRec.measuredQueue} <small style="font-size:12px;color:#cbe3fc;">m</small></strong>
                  </div>
                  <div class="m11-algo-kpi-box">
                    <span>15 分钟预测队列</span>
                    <strong style="color:#c084fc;">${activeRec.predictedQueue} <small style="font-size:12px;color:#cbe3fc;">m</small></strong>
                  </div>
                </div>

                <div class="m11-chart-wrap" id="m11AlgoChartWrap">
                  <div class="m11-chart-hdr">
                    <span>短时队列预测</span>
                    <span style="font-size:11px;color:#8fb4db;font-weight:500;">单位 m</span>
                  </div>
                  ${buildQueuePredictionSvg(activeRec)}
                  <div style="display:flex;justify-content:center;gap:18px;font-size:11.5px;color:#c9e2fb;margin-top:2px;">
                    <span><i class="m11-legend-swatch" style="background:#22d3ee;"></i>实测队列</span>
                    <span><i class="m11-legend-swatch" style="background:none;border-top:2px dashed #c084fc;"></i>预测队列</span>
                  </div>
                  <div class="m11-chart-tooltip" id="m11AlgoTooltip" style="display:none;"></div>
                </div>

                <div class="m11-info-callout">
                  ⓘ ${esc(activeRec.note)}
                </div>
              </div>
            </div>

            <!-- RIGHT: INPUT SOURCES & GEOMETRY CHECK -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">输入来源与版本</span>
                </div>
              </div>
              <div class="panel-body">
                <div style="font-size:12px;font-weight:700;color:#cbe3fc;margin-bottom:4px;">数据与校核依据</div>
                ${activeRec.sources.map(src => `
                  <div class="m11-src-item">
                    <div class="m11-src-left">
                      <span class="m11-src-ico">${srcIcon(src.icon)}</span>
                      <div>
                        <div style="font-size:12.5px;font-weight:700;color:#fff;">${esc(src.name)}</div>
                        <div style="font-size:11px;color:#8fb4db;">${esc(src.desc)}</div>
                      </div>
                    </div>
                    <span style="font-size:11.5px;color:#b8d7f7;white-space:nowrap;">${esc(src.time)}</span>
                  </div>
                `).join('')}

                <div style="font-size:12px;font-weight:700;color:#cbe3fc;margin:10px 0 6px;">分析记录</div>
                <div class="m11-kv-rows">
                  <div class="m11-kv-row"><span class="m11-kv-k">预测模型</span><span class="m11-kv-v">${esc(activeRec.model)}</span></div>
                  <div class="m11-kv-row"><span class="m11-kv-k">算法版本</span><span class="m11-kv-v">${esc(activeRec.version)}</span></div>
                  <div class="m11-kv-row"><span class="m11-kv-k">分析时间</span><span class="m11-kv-v">${esc(activeRec.fullTime)}</span></div>
                </div>

                <div class="m11-geo-box">
                  <div class="m11-sub-box-hdr">
                    <span>几何校核摘要</span>
                    <span class="m11-pill-info">专项成果</span>
                  </div>
                  <div class="m11-kv-rows">
                    <div class="m11-kv-row"><span class="m11-kv-k">停车视距</span><span class="m11-kv-v">${esc(activeSeg.geometryCheck.ssd)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">平纵线形 / 超高</span><span class="m11-kv-v">${esc(activeSeg.geometryCheck.alignment)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">横净距 / 硬路肩</span><span class="m11-kv-v" style="color:${activeSeg.geometryCheck.clearance.includes('受限') ? '#fde047' : '#f1f7ff'}">${esc(activeSeg.geometryCheck.clearance)}</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Event bindings
    const qBtn = hostEl.querySelector('#m11AlgoQueryBtn');
    const rBtn = hostEl.querySelector('#m11AlgoResetBtn');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        ui.algoSegFilter = hostEl.querySelector('#m11AlgoSeg').value;
        ui.algoTypeFilter = hostEl.querySelector('#m11AlgoType').value;
        ui.algoStatusFilter = hostEl.querySelector('#m11AlgoStatus').value;
        ui.algoDateFilter = hostEl.querySelector('#m11AlgoDate').value;
        ui.algoApplied = {
          seg: ui.algoSegFilter,
          type: ui.algoTypeFilter,
          status: ui.algoStatusFilter,
          date: ui.algoDateFilter
        };
        renderAlgorithm(hostEl, ctx);
      });
    }
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        ui.algoSegFilter = 'all';
        ui.algoTypeFilter = 'all';
        ui.algoStatusFilter = 'all';
        ui.algoDateFilter = '2026-11-26';
        ui.algoApplied = { seg: 'all', type: 'all', status: 'all', date: '2026-11-26' };
        renderAlgorithm(hostEl, ctx);
      });
    }

    const clearSecBtn = hostEl.querySelector('#m11AlgoClearSecBtn');
    if (clearSecBtn) {
      clearSecBtn.addEventListener('click', () => {
        const pill = document.querySelector('#sectionFilters .section-pill.active');
        if (pill) pill.click();
        else {
          ctx.state.activeSectionId = null;
          renderAlgorithm(hostEl, ctx);
        }
      });
    }

    hostEl.querySelectorAll('.m11-algo-card').forEach(card => {
      card.addEventListener('click', () => {
        ui.algoSelectedId = card.dataset.algoId;
        renderAlgorithm(hostEl, ctx);
      });
    });

    const goStrategy = hostEl.querySelector('#m11AlgoGoStrategy');
    if (goStrategy) {
      goStrategy.addEventListener('click', () => {
        ui.stSelectedSegId = activeRec.segId;
        ctx.switchModule('speed', 'strategy');
      });
    }

    const historyBtn = hostEl.querySelector('#m11AlgoHistoryBtn');
    if (historyBtn) {
      historyBtn.addEventListener('click', () => {
        ctx.openModal('专项算法研判历史台账（2026-11-25 ~ 11-26）', `
          <table class="data-table">
            <thead>
              <tr><th>研判编号</th><th>试点区段</th><th>研判类型</th><th>分析时间</th><th>状态识别</th><th>实测/预测队列</th><th>状态</th></tr>
            </thead>
            <tbody>
              ${INITIAL_ALGO_RECORDS.map(r => `
                <tr>
                  <td><strong>${esc(r.id)}</strong></td>
                  <td>${esc(r.segName)}</td>
                  <td>${esc(r.type)}</td>
                  <td>${esc(r.fullTime)}</td>
                  <td>${esc(r.stateDetect)}</td>
                  <td>${r.measuredQueue} m / <span style="color:#c084fc">${r.predictedQueue} m</span></td>
                  <td><span class="status-tag ${r.status === '已生成' ? 'ok' : 'warn'}">${esc(r.status)}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `);
      });
    }

    // SVG Hover Tooltip interaction
    const chartWrap = hostEl.querySelector('#m11AlgoChartWrap');
    const tooltipEl = hostEl.querySelector('#m11AlgoTooltip');
    const crosshair = hostEl.querySelector('#m11AlgoCrosshair');
    if (chartWrap && tooltipEl) {
      chartWrap.querySelectorAll('.m11-algo-hit').forEach(hit => {
        hit.addEventListener('mouseenter', () => {
          const idx = parseInt(hit.dataset.idx, 10);
          const x = parseFloat(hit.dataset.x);
          const isPred = idx > activeRec.splitIndex;
          const val = isPred ? activeRec.predictedSeries[idx - activeRec.splitIndex] : activeRec.measuredSeries[idx];
          if (crosshair) {
            crosshair.setAttribute('x1', x);
            crosshair.setAttribute('x2', x);
            crosshair.style.display = 'block';
          }
          tooltipEl.innerHTML = `
            <div style="font-weight:700;color:#fff;margin-bottom:2px;">${esc(activeRec.xLabels[idx])} · ${isPred ? '短时预测' : '实测采样'}</div>
            <div>队列长度：<strong style="color:${isPred ? '#c084fc' : '#38f2ff'}">${val} m</strong></div>
            <div style="color:#9ec4ea;font-size:10.5px;">模型：${esc(activeRec.model)}</div>
          `;
          tooltipEl.style.display = 'block';
          const leftPct = Math.min(72, Math.max(8, (x / 680) * 100));
          tooltipEl.style.left = `${leftPct}%`;
          tooltipEl.style.top = '34px';
        });
        hit.addEventListener('mouseleave', () => {
          if (crosshair) crosshair.style.display = 'none';
          tooltipEl.style.display = 'none';
        });
      });
    }
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 03: 速度策略 (strategy)
     ------------------------------------------------------------------------ */
  function renderStrategy(hostEl, ctx) {
    const activeSec = getActiveSectionFilter(ctx);
    const matchingSecSegIds = activeSec ? getSegmentsForSection(activeSec).map(s => s.id) : null;

    const list = ui.strategies.filter(st => {
      if (matchingSecSegIds && !matchingSecSegIds.includes(st.segId)) return false;
      if (ui.stApplied.seg !== 'all' && st.segId !== ui.stApplied.seg) return false;
      if (ui.stApplied.audit !== 'all' && st.auditStatus !== ui.stApplied.audit) return false;
      return true;
    });

    if (list.length && !list.some(s => s.segId === ui.stSelectedSegId)) {
      ui.stSelectedSegId = list[0].segId;
    }
    const selSt = list.find(s => s.segId === ui.stSelectedSegId) || list[0] || ui.strategies[0];
    const selSegObj = SEGMENT_BY_ID[selSt.segId];
    const selDirInfo = selSegObj ? selSegObj.directions[ui.stApplied.dir] : null;
    const selMeasuredIn = selDirInfo ? selDirInfo.innerSpeed : selSt.measuredInner;
    const selMeasuredOut = selDirInfo ? selDirInfo.outerSpeed : selSt.measuredOuter;

    const segCount = list.length;
    const pendingCount = list.filter(s => s.auditStatus === '待审核').length;
    const approvedCount = list.filter(s => s.auditStatus === '已审核').length;
    const dirLabel = ui.stApplied.dir === 'beian' ? '北安方向' : '明水方向';

    const modeTagClass = (mode) => {
      if (mode === '异常回退') return 'm11-pill-warn';
      if (mode === '风险待核') return 'm11-pill-info';
      return 'm11-pill-ok';
    };

    hostEl.innerHTML = `
      <div class="m11-page">
        <!-- FILTER BAR -->
        <div class="glass-panel m11-filter-bar">
          <div class="m11-filter-fields">
            <label class="m11-field">
              <span class="m11-field-label">试点区段</span>
              <select class="m11-select" id="m11StSeg">
                <option value="all" ${ui.stSegFilter === 'all' ? 'selected' : ''}>全部区段</option>
                ${PILOT_SEGMENTS.map(s => `<option value="${esc(s.id)}" ${ui.stSegFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">行驶方向</span>
              <select class="m11-select" id="m11StDir">
                <option value="beian" ${ui.stDirection === 'beian' ? 'selected' : ''}>北安方向</option>
                <option value="mingshui" ${ui.stDirection === 'mingshui' ? 'selected' : ''}>明水方向</option>
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">审核状态</span>
              <select class="m11-select" id="m11StAudit">
                <option value="all" ${ui.stAuditFilter === 'all' ? 'selected' : ''}>全部状态</option>
                <option value="待审核" ${ui.stAuditFilter === '待审核' ? 'selected' : ''}>待审核</option>
                <option value="已审核" ${ui.stAuditFilter === '已审核' ? 'selected' : ''}>已审核</option>
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">策略日期</span>
              <select class="m11-select" id="m11StDate">
                <option value="2026-11-26" selected>2026-11-26</option>
              </select>
            </label>
          </div>
          <div class="m11-filter-actions">
            <button class="m11-btn-primary" id="m11StQueryBtn">${ICONS.search} 查询</button>
            <button class="m11-btn-ghost" id="m11StResetBtn">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- KPI STRIP -->
        <div class="glass-panel m11-kpi-strip">
          <div class="m11-strip-header">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">分区段速度策略概况</span>
            <span class="panel-subtitle">（截至 2026-11-26 10:05）</span>
          </div>
          <div class="m11-kpi-5">
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.road}</div>
              <div><div class="m11-kpi-card-lbl">监测试点区段</div><div class="m11-kpi-card-val">${segCount}<small>段</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.speed}</div>
              <div><div class="m11-kpi-card-lbl">有分车道建议</div><div class="m11-kpi-card-val">${segCount}<small>段</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico gold">${ICONS.clock}</div>
              <div><div class="m11-kpi-card-lbl">待审核</div><div class="m11-kpi-card-val gold">${pendingCount}<small>段</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico green">${ICONS.check}</div>
              <div><div class="m11-kpi-card-lbl">已审核</div><div class="m11-kpi-card-val green">${approvedCount}<small>段</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.flag}</div>
              <div><div class="m11-kpi-card-lbl">已发布限速</div><div class="m11-kpi-card-val">${segCount}<small>段</small></div></div>
            </div>
          </div>
        </div>

        <!-- 2-COL WORKSPACE -->
        ${list.length === 0 ? `
          <div class="glass-panel m11-empty-box">
            当前工区或筛选条件下无匹配的分车道速度策略。
            <div style="margin-top:10px;"><button class="m11-btn-primary" id="m11StClearSecBtn">恢复全线策略列表</button></div>
          </div>
        ` : `
          <div class="m11-split-2col">
            <!-- LEFT: 8-ROW LANE TABLE -->
            <div class="glass-panel" style="display:flex;flex-direction:column;">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">分车道速度策略</span>
                </div>
                <span class="m11-hud-head-meta">${esc(dirLabel)} · ${segCount} 段 ${segCount * 2} 车道</span>
              </div>
              <div class="panel-body m11-table-wrap" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                <table class="data-table">
                  <thead>
                    <tr>
                      <th>区段编号</th>
                      <th>试点区段</th>
                      <th>车道</th>
                      <th>实测车速</th>
                      <th>算法建议</th>
                      <th>审核状态</th>
                      <th>已发布限速</th>
                      <th>当前模式</th>
                      <th>操作</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${list.map(st => {
                      const isSel = st.segId === selSt.segId;
                      const segObj = SEGMENT_BY_ID[st.segId];
                      const dInfo = segObj ? segObj.directions[ui.stApplied.dir] : null;
                      const mIn = dInfo ? dInfo.innerSpeed : st.measuredInner;
                      const mOut = dInfo ? dInfo.outerSpeed : st.measuredOuter;
                      const auditTag = st.auditStatus === '已审核' ? 'm11-pill-ok' : 'm11-pill-warn';
                      const suggestChangedIn = st.suggestInner < st.publishedInner;
                      const suggestChangedOut = st.suggestOuter < st.publishedOuter;
                      return `
                        <tr class="m11-tr-selectable ${isSel ? 'm11-tr-selected' : ''}" data-seg="${esc(st.segId)}">
                          <td>${esc(st.segId)}</td>
                          <td>${esc(st.segName)}</td>
                          <td>内侧</td>
                          <td><strong style="color:#38f2ff;">${mIn}</strong></td>
                          <td><strong style="color:${suggestChangedIn ? '#facc15' : '#fff'};">${st.suggestInner}</strong></td>
                          <td><span class="${auditTag}">${esc(st.auditStatus)}</span></td>
                          <td><strong style="color:#38f2ff;">${st.publishedInner}</strong></td>
                          <td><span class="${modeTagClass(st.currentMode)}">${esc(st.currentMode)}</span></td>
                          <td><button class="m11-hud-link m11-st-view" data-seg="${esc(st.segId)}">查看</button></td>
                        </tr>
                        <tr class="m11-tr-selectable ${isSel ? 'm11-tr-selected' : ''}" data-seg="${esc(st.segId)}">
                          <td>${esc(st.segId)}</td>
                          <td>${esc(st.segName)}</td>
                          <td>外侧</td>
                          <td><strong style="color:#38f2ff;">${mOut}</strong></td>
                          <td><strong style="color:${suggestChangedOut ? '#facc15' : '#fff'};">${st.suggestOuter}</strong></td>
                          <td><span class="${auditTag}">${esc(st.auditStatus)}</span></td>
                          <td><strong style="color:#38f2ff;">${st.publishedOuter}</strong></td>
                          <td><span class="${modeTagClass(st.currentMode)}">${esc(st.currentMode)}</span></td>
                          <td><button class="m11-hud-link m11-st-view" data-seg="${esc(st.segId)}">查看</button></td>
                        </tr>
                      `;
                    }).join('')}
                  </tbody>
                </table>
                <div class="m11-kv-row" style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(56,189,248,0.16);font-size:11.5px;color:#8fb4db;">
                  <span>速度单位 km/h · 实测时点 10:05</span>
                  <span>发布记录来源 信息发布</span>
                </div>
              </div>
            </div>

            <!-- RIGHT: SELECTED SEGMENT INSPECTOR -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">选中区段的策略与发布状态</span>
                </div>
              </div>
              <div class="panel-body">
                <div class="m11-seg-insp-top" style="margin-bottom:6px;">
                  <div>
                    <span style="font-size:15px;font-weight:700;color:#fff;">${esc(selSt.segName)}</span>
                    <span style="font-size:12px;color:#8fb4db;margin-left:8px;">${esc(selSt.segId)}</span>
                  </div>
                  <span class="${modeTagClass(selSt.currentMode)}">${esc(selSt.currentMode)}</span>
                </div>

                <div class="m11-mode-grid">
                  <div class="m11-mode-card ${selSt.currentMode === '常态管控' ? 'active-ok' : ''}">
                    <div style="font-size:12.5px;font-weight:700;color:#fff;">常态提速研判</div>
                    <div style="font-size:11px;color:#9dc2e8;margin-top:3px;">依据专项方案的校核条件</div>
                  </div>
                  <div class="m11-mode-card ${selSt.currentMode !== '常态管控' ? 'active-warn' : ''}">
                    <div style="font-size:12.5px;font-weight:700;color:${selSt.currentMode !== '常态管控' ? '#fde047' : '#fff'};">${esc(selSt.currentMode)}</div>
                    <div style="font-size:11px;color:#dbeafe;margin-top:3px;">${esc(selSt.triggerScene)}</div>
                  </div>
                </div>

                <div class="m11-lane-cards-3">
                  <div class="m11-lane-mini">
                    <div class="m11-lane-mini-lbl">实测 内侧 / 外侧</div>
                    <div class="m11-lane-mini-val">${selMeasuredIn} / ${selMeasuredOut}<span class="m11-mini-kpi-unit">km/h</span></div>
                  </div>
                  <div class="m11-lane-mini">
                    <div class="m11-lane-mini-lbl">建议 内侧 / 外侧</div>
                    <div class="m11-lane-mini-val" style="color:#facc15;">${selSt.suggestInner} / ${selSt.suggestOuter}<span class="m11-mini-kpi-unit">km/h</span></div>
                  </div>
                  <div class="m11-lane-mini">
                    <div class="m11-lane-mini-lbl">发布 内侧 / 外侧</div>
                    <div class="m11-lane-mini-val">${selSt.publishedInner} / ${selSt.publishedOuter}<span class="m11-mini-kpi-unit">km/h</span></div>
                  </div>
                </div>

                <div class="m11-sub-box">
                  <div class="m11-sub-box-hdr">
                    <span>最新算法建议</span>
                    <span class="${selSt.auditStatus === '已审核' ? 'm11-pill-ok' : 'm11-pill-warn'}">${esc(selSt.auditStatus)}</span>
                  </div>
                  <div class="m11-kv-rows">
                    <div class="m11-kv-row"><span class="m11-kv-k">策略编号</span><span class="m11-kv-v">${esc(selSt.latestStrategyId)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">生成时间</span><span class="m11-kv-v">${esc(selSt.latestGeneratedAt)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">关联研判</span><span class="m11-kv-v">${esc(selSt.linkedAlgoId)}</span></div>
                  </div>
                </div>

                <div class="m11-sub-box">
                  <div class="m11-sub-box-hdr">
                    <span>当前发布限速</span>
                    <span class="m11-pill-ok">已发布</span>
                  </div>
                  <div class="m11-kv-rows">
                    <div class="m11-kv-row"><span class="m11-kv-k">${selSt.currentMode === '常态管控' ? '执行策略' : '回退策略'}</span><span class="m11-kv-v">${esc(selSt.publishedStrategyId)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">发布批次</span><span class="m11-kv-v">${esc(selSt.publishedBatchId)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">发布时间</span><span class="m11-kv-v">${esc(selSt.publishedAt)}</span></div>
                  </div>
                </div>

                <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
                  <button class="m11-btn-ghost" style="justify-content:center;" id="m11StAuditModalBtn">${ICONS.audit} 查看审核记录</button>
                  <button class="m11-btn-primary" style="justify-content:center;" id="m11StGoFeedbackBtn">${ICONS.link} 查看执行反馈</button>
                </div>
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Bind filters
    const qBtn = hostEl.querySelector('#m11StQueryBtn');
    const rBtn = hostEl.querySelector('#m11StResetBtn');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        ui.stSegFilter = hostEl.querySelector('#m11StSeg').value;
        ui.stDirection = hostEl.querySelector('#m11StDir').value;
        ui.stAuditFilter = hostEl.querySelector('#m11StAudit').value;
        ui.stApplied = { seg: ui.stSegFilter, dir: ui.stDirection, audit: ui.stAuditFilter, date: '2026-11-26' };
        renderStrategy(hostEl, ctx);
      });
    }
    if (rBtn) {
      rBtn.addEventListener('click', () => {
        ui.stSegFilter = 'all';
        ui.stDirection = 'beian';
        ui.stAuditFilter = 'all';
        ui.stApplied = { seg: 'all', dir: 'beian', audit: 'all', date: '2026-11-26' };
        renderStrategy(hostEl, ctx);
      });
    }

    const clrBtn = hostEl.querySelector('#m11StClearSecBtn');
    if (clrBtn) {
      clrBtn.addEventListener('click', () => {
        const pill = document.querySelector('#sectionFilters .section-pill.active');
        if (pill) pill.click();
        else { ctx.state.activeSectionId = null; renderStrategy(hostEl, ctx); }
      });
    }

    hostEl.querySelectorAll('.m11-tr-selectable').forEach(tr => {
      tr.addEventListener('click', () => {
        ui.stSelectedSegId = tr.dataset.seg;
        renderStrategy(hostEl, ctx);
      });
    });

    // Strategy Audit & Dispatch Modal
    const auditBtn = hostEl.querySelector('#m11StAuditModalBtn');
    if (auditBtn) {
      auditBtn.addEventListener('click', () => {
        const isPending = selSt.auditStatus === '待审核';
        ctx.openModal(`策略审核记录与动态下发 — ${selSt.segName} (${selSt.segId})`, `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <table class="data-table">
              <thead><tr><th>时间</th><th>操作节点</th><th>审核与执行内容</th><th>结果</th></tr></thead>
              <tbody>
                ${selSt.auditHistory.map(h => `
                  <tr>
                    <td>${esc(h.time)}</td>
                    <td>${esc(h.actor)}</td>
                    <td>${esc(h.action)}</td>
                    <td><span class="status-tag ${h.result.includes('待') ? 'warn' : 'ok'}">${esc(h.result)}</span></td>
                  </tr>
                `).join('')}
              </tbody>
            </table>

            <div class="m11-sub-box">
              <div class="m11-sub-box-hdr">
                <span>动态限速策略审核下发（${esc(selSt.latestStrategyId)}）</span>
                <span class="${isPending ? 'm11-pill-warn' : 'm11-pill-ok'}">${esc(selSt.auditStatus)}</span>
              </div>
              <div class="m11-modal-form-grid">
                <div>
                  <div style="font-size:11.5px;color:#9ec4ea;margin-bottom:4px;">内侧车道下发限速 (km/h)</div>
                  <select class="m11-modal-input" id="m11DispatchIn">
                    ${[50, 60, 70, 80].map(v => `<option value="${v}" ${v === selSt.suggestInner ? 'selected' : ''}>${v} km/h</option>`).join('')}
                  </select>
                </div>
                <div>
                  <div style="font-size:11.5px;color:#9ec4ea;margin-bottom:4px;">外侧车道下发限速 (km/h)</div>
                  <select class="m11-modal-input" id="m11DispatchOut">
                    ${[50, 60, 70, 80].map(v => `<option value="${v}" ${v === selSt.suggestOuter ? 'selected' : ''}>${v} km/h</option>`).join('')}
                  </select>
                </div>
              </div>
              <div style="margin-top:8px;">
                <div style="font-size:11.5px;color:#9ec4ea;margin-bottom:4px;">情报板同步警示内容</div>
                <input type="text" class="m11-modal-input" id="m11DispatchVms" value="${esc(selSt.vmsMessage)}" />
              </div>
              <div style="display:flex;justify-content:flex-end;gap:8px;margin-top:12px;">
                <button class="m11-btn-ghost" id="m11DispatchCancel">关闭</button>
                <button class="m11-btn-primary" id="m11DispatchSubmit">审核通过并下发限速指令</button>
              </div>
            </div>
          </div>
        `);

        const cancelBtn = document.getElementById('m11DispatchCancel');
        if (cancelBtn) cancelBtn.addEventListener('click', () => ctx.closeModal());

        const submitBtn = document.getElementById('m11DispatchSubmit');
        if (submitBtn) {
          submitBtn.addEventListener('click', () => {
            const newIn = parseInt(document.getElementById('m11DispatchIn').value, 10) || selSt.suggestInner;
            const newOut = parseInt(document.getElementById('m11DispatchOut').value, 10) || selSt.suggestOuter;
            const vmsText = (document.getElementById('m11DispatchVms').value || selSt.vmsMessage).trim();
            const nowTime = '10:05:32';
            const nowFull = `2026-11-26 ${nowTime}`;
            const nextBatchNum = 17 + ui.batches.length - INITIAL_BATCHES.length + 1;
            const newBatchId = `FB-20261126-0${nextBatchNum}`;

            selSt.auditStatus = '已审核';
            selSt.publishedInner = newIn;
            selSt.publishedOuter = newOut;
            selSt.publishedStrategyId = selSt.latestStrategyId;
            selSt.publishedBatchId = newBatchId;
            selSt.publishedAt = nowFull;
            selSt.vmsMessage = vmsText;
            selSt.auditHistory.push({
              time: nowTime,
              actor: '平台指挥员（演示）',
              action: `审核通过 ${selSt.latestStrategyId} 并下发（内侧${newIn} / 外侧${newOut} km/h），批次 ${newBatchId}`,
              result: '已审核并发布'
            });

            // Sync into 04_执行反馈 batches
            const prefix = selSt.segId.replace('QD-', '');
            ui.batches.unshift({
              batchId: newBatchId,
              segId: selSt.segId,
              segName: selSt.segName,
              directionLabel: '北安方向',
              strategyId: selSt.latestStrategyId,
              strategyAuthLabel: '人工审核授权',
              strategyTimeDesc: `${nowTime} 内侧${newIn} / 外侧${newOut} km/h`,
              publishState: '已下发',
              publishTime: nowFull,
              publishShortDesc: `${nowTime} 区段限速与情报板指令`,
              confirmDurationSec: 4,
              sameBatchSummary: [
                { label: '内侧标志', text: `确认 ${newIn} km/h · 10:05:34` },
                { label: '外侧标志', text: `确认 ${newOut} km/h · 10:05:35` }
              ],
              devices: [
                { id: `VSL-${prefix}-01`, type: '可变限速标志', name: '内侧可变限速标志', cmd: `${newIn} km/h`, receipt: `确认显示 ${newIn} km/h`, time: '10:05:34', exceptionTime: '—', status: '回执成功', logs: [`${nowTime} [TX] LIMIT_${newIn}`, `10:05:34 [RX] ACK_OK`] },
                { id: `VSL-${prefix}-02`, type: '可变限速标志', name: '外侧可变限速标志', cmd: `${newOut} km/h`, receipt: `确认显示 ${newOut} km/h`, time: '10:05:35', exceptionTime: '—', status: '回执成功', logs: [`${nowTime} [TX] LIMIT_${newOut}`, `10:05:35 [RX] ACK_OK`] },
                { id: `QB-${prefix}-01`, type: '情报板', name: '前方情报板', cmd: vmsText, receipt: '显示内容与指令一致', time: '10:05:35', exceptionTime: '—', status: '回执成功', logs: [`${nowTime} [TX] PUSH_TEXT`, `10:05:35 [RX] VERIFIED`] },
                { id: `QB-${prefix}-02`, type: '情报板', name: '上游情报板', cmd: vmsText, receipt: '显示内容与指令一致', time: '10:05:36', exceptionTime: '—', status: '回执成功', logs: [`${nowTime} [TX] PUSH_TEXT`, `10:05:36 [RX] VERIFIED`] }
              ]
            });

            // Point feedback filters to the new batch so user can inspect immediately
            ui.fbSegFilter = selSt.segId;
            ui.fbBatchFilter = newBatchId;
            ui.fbApplied = { seg: selSt.segId, batch: newBatchId, type: 'all' };
            ui.fbSelectedDeviceId = `VSL-${prefix}-01`;

            ctx.closeModal();
            ctx.showToast(`已审核并下发 ${selSt.segName} 限速策略（批次 ${newBatchId}）`);
            renderStrategy(hostEl, ctx);
          });
        }
      });
    }

    const goFeedbackBtn = hostEl.querySelector('#m11StGoFeedbackBtn');
    if (goFeedbackBtn) {
      goFeedbackBtn.addEventListener('click', () => {
        const matchedBatch = ui.batches.find(b => b.segId === selSt.segId);
        if (matchedBatch) {
          ui.fbSegFilter = matchedBatch.segId;
          ui.fbBatchFilter = matchedBatch.batchId;
          ui.fbApplied = { seg: matchedBatch.segId, batch: matchedBatch.batchId, type: 'all' };
          const errDev = matchedBatch.devices.find(d => d.status !== '回执成功');
          ui.fbSelectedDeviceId = errDev ? errDev.id : matchedBatch.devices[0].id;
        }
        ctx.switchModule('speed', 'feedback');
      });
    }
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 04: 执行反馈 (feedback)
     ------------------------------------------------------------------------ */
  function renderFeedback(hostEl, ctx) {
    const activeSec = getActiveSectionFilter(ctx);
    const matchingSecSegIds = activeSec ? getSegmentsForSection(activeSec).map(s => s.id) : null;

    // Pick batch matching section / filters
    let candidateBatches = ui.batches;
    if (matchingSecSegIds) {
      candidateBatches = candidateBatches.filter(b => matchingSecSegIds.includes(b.segId));
    }
    if (ui.fbApplied.seg !== 'all') {
      const segMatches = candidateBatches.filter(b => b.segId === ui.fbApplied.seg);
      if (segMatches.length) candidateBatches = segMatches;
    }

    const activeBatch = candidateBatches.find(b => b.batchId === ui.fbApplied.batch) || candidateBatches[0] || null;
    const allDevs = activeBatch ? activeBatch.devices : [];
    const shownDevs = ui.fbApplied.type === 'all' ? allDevs : allDevs.filter(d => d.type === ui.fbApplied.type);

    if (shownDevs.length && !shownDevs.some(d => d.id === ui.fbSelectedDeviceId)) {
      ui.fbSelectedDeviceId = shownDevs[0].id;
    }
    const selDev = shownDevs.find(d => d.id === ui.fbSelectedDeviceId) || shownDevs[0] || null;

    const totalDevs = allDevs.length;
    const vslCount = allDevs.filter(d => d.type === '可变限速标志').length;
    const qbCount = allDevs.filter(d => d.type === '情报板').length;
    const okCount = allDevs.filter(d => d.status === '回执成功').length;
    const errCount = allDevs.filter(d => d.status !== '回执成功').length;

    hostEl.innerHTML = `
      <div class="m11-page">
        <!-- FILTER BAR -->
        <div class="glass-panel m11-filter-bar">
          <div class="m11-filter-fields">
            <label class="m11-field">
              <span class="m11-field-label">试点区段</span>
              <select class="m11-select" id="m11FbSeg">
                <option value="all" ${ui.fbSegFilter === 'all' ? 'selected' : ''}>全部区段</option>
                ${PILOT_SEGMENTS.map(s => `<option value="${esc(s.id)}" ${ui.fbSegFilter === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">发布批次</span>
              <select class="m11-select" id="m11FbBatch">
                ${ui.batches.map(b => `<option value="${esc(b.batchId)}" ${ui.fbBatchFilter === b.batchId ? 'selected' : ''}>${esc(b.batchId)}</option>`).join('')}
              </select>
            </label>
            <label class="m11-field">
              <span class="m11-field-label">设备类型</span>
              <select class="m11-select" id="m11FbType">
                <option value="all" ${ui.fbTypeFilter === 'all' ? 'selected' : ''}>全部设备</option>
                <option value="可变限速标志" ${ui.fbTypeFilter === '可变限速标志' ? 'selected' : ''}>可变限速标志</option>
                <option value="情报板" ${ui.fbTypeFilter === '情报板' ? 'selected' : ''}>情报板</option>
              </select>
            </label>
          </div>
          <div class="m11-filter-actions">
            <button class="m11-btn-primary" id="m11FbQueryBtn">${ICONS.search} 查询</button>
            <button class="m11-btn-ghost" id="m11FbHistoryBtn">${ICONS.ext} 查看信息发布记录</button>
          </div>
        </div>

        <!-- KPI STRIP -->
        <div class="glass-panel m11-kpi-strip">
          <div class="m11-strip-header">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">本次发布设备反馈</span>
            <span class="panel-subtitle">（截至 2026-11-26 10:05）</span>
          </div>
          <div class="m11-kpi-5">
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.car}</div>
              <div><div class="m11-kpi-card-lbl">目标设备</div><div class="m11-kpi-card-val">${totalDevs}<small>台</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.flag}</div>
              <div><div class="m11-kpi-card-lbl">可变限速标志</div><div class="m11-kpi-card-val">${vslCount}<small>台</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico">${ICONS.board}</div>
              <div><div class="m11-kpi-card-lbl">情报板</div><div class="m11-kpi-card-val">${qbCount}<small>台</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico green">${ICONS.check}</div>
              <div><div class="m11-kpi-card-lbl">回执成功</div><div class="m11-kpi-card-val green">${okCount}<small>台</small></div></div>
            </div>
            <div class="m11-kpi-card">
              <div class="m11-kpi-ico ${errCount > 0 ? 'red' : 'green'}">${ICONS.warn}</div>
              <div><div class="m11-kpi-card-lbl">回执异常</div><div class="m11-kpi-card-val ${errCount > 0 ? 'red' : 'green'}">${errCount}<small>台</small></div></div>
            </div>
          </div>
        </div>

        ${!activeBatch ? `
          <div class="glass-panel m11-empty-box">
            当前工区暂无信息发布批次记录。
            <div style="margin-top:10px;"><button class="m11-btn-primary" id="m11FbClearSecBtn">查看全线发布回执</button></div>
          </div>
        ` : `
          <div class="m11-split-2col">
            <!-- LEFT: PIPELINE + DEVICE TABLE -->
            <div style="display:flex;flex-direction:column;gap:10px;">
              <div class="glass-panel">
                <div class="panel-header">
                  <div class="panel-title-group">
                    <span class="panel-accent-bar"></span>
                    <span class="panel-title">回退建议、发布与回执</span>
                  </div>
                  <span class="m11-hud-head-meta">${esc(activeBatch.segName)} · ${esc(activeBatch.directionLabel)}</span>
                </div>
                <div class="panel-body">
                  <div class="m11-pipeline-3">
                    <div class="m11-pipe-card">
                      <div class="m11-sub-box-hdr">
                        <span style="color:#a9c6e8;font-weight:500;">回退建议</span>
                        <span class="m11-pill-ok">${esc(activeBatch.strategyAuthLabel)}</span>
                      </div>
                      <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:4px;">${esc(activeBatch.strategyId)}</div>
                      <div style="font-size:11.5px;color:#8fb4db;">${esc(activeBatch.strategyTimeDesc)}</div>
                    </div>
                    <div class="m11-pipe-arrow">&gt;</div>
                    <div class="m11-pipe-card">
                      <div class="m11-sub-box-hdr">
                        <span style="color:#a9c6e8;font-weight:500;">信息发布</span>
                        <span class="m11-pill-info">${esc(activeBatch.publishState)}</span>
                      </div>
                      <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:4px;">${esc(activeBatch.batchId)}</div>
                      <div style="font-size:11.5px;color:#8fb4db;">${esc(activeBatch.publishShortDesc)}</div>
                    </div>
                    <div class="m11-pipe-arrow">&gt;</div>
                    <div class="m11-pipe-card">
                      <div class="m11-sub-box-hdr">
                        <span style="color:#a9c6e8;font-weight:500;">设备执行反馈</span>
                        <span class="${errCount > 0 ? 'm11-pill-warn' : 'm11-pill-ok'}">${errCount > 0 ? '有异常' : '全部成功'}</span>
                      </div>
                      <div style="font-size:15px;font-weight:800;color:#fff;margin-bottom:4px;">${totalDevs} 台设备</div>
                      <div style="font-size:11.5px;color:#8fb4db;">成功 ${okCount} 台 · 回执异常 ${errCount} 台</div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="glass-panel" style="flex:1;display:flex;flex-direction:column;">
                <div class="panel-header">
                  <div class="panel-title-group">
                    <span class="panel-accent-bar"></span>
                    <span class="panel-title">设备指令与回执</span>
                  </div>
                  <span class="m11-hud-head-meta">发布于 ${esc(activeBatch.publishTime)}</span>
                </div>
                <div class="panel-body m11-table-wrap" style="flex:1;display:flex;flex-direction:column;justify-content:space-between;">
                  <table class="data-table">
                    <thead>
                      <tr>
                        <th>设备编号</th>
                        <th>设备 / 车道</th>
                        <th>发布指令</th>
                        <th>设备回执</th>
                        <th>回执时间</th>
                        <th>结果</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${shownDevs.map(dev => {
                        const isSel = selDev && dev.id === selDev.id;
                        const isOk = dev.status === '回执成功';
                        return `
                          <tr class="m11-tr-selectable ${isSel ? 'm11-tr-selected' : ''}" data-dev="${esc(dev.id)}">
                            <td><strong>${esc(dev.id)}</strong></td>
                            <td>${esc(dev.name)}</td>
                            <td>${esc(dev.cmd)}</td>
                            <td>${esc(dev.receipt)}</td>
                            <td>${esc(dev.time)}</td>
                            <td><span class="${isOk ? 'm11-pill-ok' : 'm11-pill-err'}">${esc(dev.status)}</span></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                  <div class="m11-kv-row" style="margin-top:10px;padding-top:8px;border-top:1px solid rgba(56,189,248,0.16);font-size:11.5px;color:#8fb4db;">
                    <span>按原发布批次关联设备指令、回执及异常</span>
                    <button class="m11-hud-link" id="m11FbFooterHistBtn">信息发布记录 &gt;</button>
                  </div>
                </div>
              </div>
            </div>

            <!-- RIGHT: EXCEPTION / DEVICE RECEIPT INSPECTOR -->
            <div class="glass-panel">
              <div class="panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">${selDev && selDev.status !== '回执成功' ? '异常回执详情' : '设备回执详情'}</span>
                </div>
              </div>
              <div class="panel-body">
                ${selDev ? `
                  <div class="m11-seg-insp-top" style="margin-bottom:10px;">
                    <div>
                      <span style="font-size:16px;font-weight:800;color:#fff;">${esc(selDev.id)}</span>
                      <span style="font-size:12.5px;color:#b8d7f7;margin-left:8px;">${esc(selDev.name)}</span>
                    </div>
                    <span class="${selDev.status === '回执成功' ? 'm11-pill-ok' : 'm11-pill-err'}">${esc(selDev.status)}</span>
                  </div>

                  <div class="m11-kv-rows">
                    <div class="m11-kv-row"><span class="m11-kv-k">关联试点</span><span class="m11-kv-v">${esc(activeBatch.segName)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">发布批次</span><span class="m11-kv-v">${esc(activeBatch.batchId)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">发布指令</span><span class="m11-kv-v">${esc(selDev.cmd)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">下发时间</span><span class="m11-kv-v">${esc(activeBatch.publishTime)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">异常记录</span><span class="m11-kv-v">${esc(selDev.exceptionTime)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">设备反馈</span><span class="m11-kv-v" style="color:${selDev.status === '回执成功' ? '#4ade80' : '#fca5a5'}">${esc(selDev.receipt)}</span></div>
                    <div class="m11-kv-row"><span class="m11-kv-k">记录来源</span><span class="m11-kv-v">信息发布</span></div>
                  </div>

                  <div class="m11-highlight-metric">
                    <span>风险出现至两块限速标志均确认</span>
                    <strong style="font-size:16px;color:#38f2ff;">${activeBatch.confirmDurationSec} 秒</strong>
                  </div>

                  <div class="m11-sub-box">
                    <div class="m11-sub-box-hdr">
                      <span>同批次回退结果</span>
                    </div>
                    <div class="m11-kv-rows">
                      ${activeBatch.sameBatchSummary.map(item => `
                        <div class="m11-kv-row"><span class="m11-kv-k">${esc(item.label)}</span><span class="m11-kv-v">${esc(item.text)}</span></div>
                      `).join('')}
                    </div>
                  </div>

                  <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;">
                    <button class="m11-btn-primary" style="justify-content:center;" id="m11FbBatchModalBtn">${ICONS.ext} 查看发布批次</button>
                    <button class="m11-btn-ghost" style="justify-content:center;" id="m11FbLogModalBtn">${ICONS.audit} 查看回执日志</button>
                  </div>
                ` : '<div class="m11-empty-box">请选择左侧设备查看回执详情</div>'}
              </div>
            </div>
          </div>
        `}
      </div>
    `;

    // Bind filters
    const qBtn = hostEl.querySelector('#m11FbQueryBtn');
    if (qBtn) {
      qBtn.addEventListener('click', () => {
        ui.fbSegFilter = hostEl.querySelector('#m11FbSeg').value;
        ui.fbBatchFilter = hostEl.querySelector('#m11FbBatch').value;
        ui.fbTypeFilter = hostEl.querySelector('#m11FbType').value;
        ui.fbApplied = { seg: ui.fbSegFilter, batch: ui.fbBatchFilter, type: ui.fbTypeFilter };
        renderFeedback(hostEl, ctx);
      });
    }

    const clrBtn = hostEl.querySelector('#m11FbClearSecBtn');
    if (clrBtn) {
      clrBtn.addEventListener('click', () => {
        const pill = document.querySelector('#sectionFilters .section-pill.active');
        if (pill) pill.click();
        else { ctx.state.activeSectionId = null; renderFeedback(hostEl, ctx); }
      });
    }

    hostEl.querySelectorAll('.m11-tr-selectable').forEach(tr => {
      tr.addEventListener('click', () => {
        ui.fbSelectedDeviceId = tr.dataset.dev;
        renderFeedback(hostEl, ctx);
      });
    });

    // Publish History Modal
    const openPubHist = () => {
      ctx.openModal('信息发布批次历史记录', `
        <table class="data-table">
          <thead><tr><th>发布批次</th><th>试点区段</th><th>关联策略</th><th>下发时间</th><th>成功 / 异常</th><th>操作</th></tr></thead>
          <tbody>
            ${ui.batches.map(b => {
              const okN = b.devices.filter(d => d.status === '回执成功').length;
              const errN = b.devices.length - okN;
              return `
                <tr>
                  <td><strong>${esc(b.batchId)}</strong></td>
                  <td>${esc(b.segName)}</td>
                  <td>${esc(b.strategyId)}</td>
                  <td>${esc(b.publishTime)}</td>
                  <td><span class="status-tag ok">${okN} 成功</span> ${errN ? `<span class="status-tag warn">${errN} 异常</span>` : ''}</td>
                  <td><button class="m11-hud-link m11-pick-batch" data-batch="${esc(b.batchId)}" data-seg="${esc(b.segId)}">切至该批次</button></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      `);
      document.querySelectorAll('.m11-pick-batch').forEach(btn => {
        btn.addEventListener('click', () => {
          ui.fbSegFilter = btn.dataset.seg;
          ui.fbBatchFilter = btn.dataset.batch;
          ui.fbApplied = { seg: btn.dataset.seg, batch: btn.dataset.batch, type: 'all' };
          ctx.closeModal();
          renderFeedback(hostEl, ctx);
        });
      });
    };

    const histBtn = hostEl.querySelector('#m11FbHistoryBtn');
    const footHistBtn = hostEl.querySelector('#m11FbFooterHistBtn');
    if (histBtn) histBtn.addEventListener('click', openPubHist);
    if (footHistBtn) footHistBtn.addEventListener('click', openPubHist);

    // Batch Detail & Interactive Retry Dispatch Modal
    const batchBtn = hostEl.querySelector('#m11FbBatchModalBtn');
    if (batchBtn && activeBatch && selDev) {
      batchBtn.addEventListener('click', () => {
        const hasErr = selDev.status !== '回执成功';
        ctx.openModal(`发布批次指令核查与补发 — ${activeBatch.batchId}`, `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="detail-grid">
              <div class="detail-stat-card"><span>关联试点区段</span><strong>${esc(activeBatch.segName)}</strong></div>
              <div class="detail-stat-card"><span>关联策略编号</span><strong>${esc(activeBatch.strategyId)}</strong></div>
              <div class="detail-stat-card"><span>下发时间</span><strong>${esc(activeBatch.publishTime)}</strong></div>
            </div>
            <table class="data-table">
              <thead><tr><th>设备编号</th><th>设备类型</th><th>指令内容</th><th>回执状态</th><th>回执时间</th></tr></thead>
              <tbody>
                ${activeBatch.devices.map(d => `
                  <tr>
                    <td><strong>${esc(d.id)}</strong></td>
                    <td>${esc(d.type)}</td>
                    <td>${esc(d.cmd)}</td>
                    <td><span class="status-tag ${d.status === '回执成功' ? 'ok' : 'warn'}">${esc(d.status)}</span></td>
                    <td>${esc(d.time)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            ${hasErr ? `
              <div class="m11-sub-box" style="border-color:rgba(250,204,21,0.55);">
                <div style="font-size:12.5px;color:#fde047;font-weight:700;margin-bottom:4px;">异常处理建议（${esc(selDev.id)}）</div>
                <div style="font-size:12px;color:#dbeafe;margin-bottom:10px;">检测到 4G/RS-485 链路首轮握手超时（${esc(selDev.exceptionTime)}），建议通过备用光纤通道重新下发当前批次情报板指令。</div>
                <div style="display:flex;justify-content:flex-end;gap:8px;">
                  <button class="m11-btn-ghost" id="m11RetryClose">取消</button>
                  <button class="m11-btn-primary" id="m11RetryConfirm">重新下发指令至 ${esc(selDev.id)}</button>
                </div>
              </div>
            ` : `
              <div style="display:flex;justify-content:flex-end;">
                <button class="m11-btn-primary" id="m11RetryClose">确认关闭</button>
              </div>
            `}
          </div>
        `);
        const closeB = document.getElementById('m11RetryClose');
        if (closeB) closeB.addEventListener('click', () => ctx.closeModal());
        const retryB = document.getElementById('m11RetryConfirm');
        if (retryB) {
          retryB.addEventListener('click', () => {
            selDev.status = '回执成功';
            selDev.receipt = selDev.type === '情报板' ? '显示内容与指令一致' : `确认显示 ${selDev.cmd}`;
            selDev.time = '10:05:18';
            selDev.exceptionTime = '已恢复 (10:05:18)';
            selDev.logs.push(
              `10:05:16.040 [TX] 备用光纤通道重发 设备=${selDev.id} 指令="${selDev.cmd}"`,
              `10:05:18.112 [RX] DISPLAY_VERIFIED 补发回执成功`
            );
            ctx.closeModal();
            ctx.showToast(`已通过备用链路重新下发至 ${selDev.id}，设备回执成功`);
            renderFeedback(hostEl, ctx);
          });
        }
      });
    }

    // Communication Receipt Log Modal
    const logBtn = hostEl.querySelector('#m11FbLogModalBtn');
    if (logBtn && activeBatch && selDev) {
      logBtn.addEventListener('click', () => {
        ctx.openModal(`设备通信与回执日志 — ${selDev.id} (${selDev.name})`, `
          <div style="display:flex;flex-direction:column;gap:10px;">
            <div style="font-size:12px;color:#b4d2f4;">发布批次：${esc(activeBatch.batchId)} · 当前状态：<strong style="color:${selDev.status === '回执成功' ? '#4ade80' : '#fca5a5'}">${esc(selDev.status)}</strong></div>
            <div style="padding:12px;border-radius:8px;background:#040f24;border:1px solid rgba(56,189,248,0.3);font-family:Consolas,monospace;font-size:12px;line-height:1.7;color:#cce6ff;">
              ${selDev.logs.map(line => `<div>${esc(line)}</div>`).join('')}
            </div>
          </div>
        `);
      });
    }
  }

  /* ------------------------------------------------------------------------
     SUB-PAGE 05: 场景回放 (replay)
     ------------------------------------------------------------------------ */
  function buildReplaySvg(scenario, currentMin) {
    const W = 720;
    const H = 148;
    const padL = 36;
    const padR = 16;
    const padT = 14;
    const padB = 24;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const yMin = 40;
    const yMax = 90;

    const totalMin = scenario.durationMin;
    const xAtMin = (m) => padL + (Math.min(totalMin, Math.max(0, m)) / totalMin) * plotW;
    const yAtVal = (v) => padT + (1 - (Math.min(yMax, Math.max(yMin, v)) - yMin) / (yMax - yMin)) * plotH;

    // Grid lines 40..90
    const yTicks = [40, 50, 60, 70, 80, 90].map(v => {
      const y = yAtVal(v).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(125,211,252,0.14)" stroke-width="1"/>
        <text x="${padL - 7}" y="${Number(y) + 3.5}" text-anchor="end" fill="#8fb4db" font-size="10.5">${v}</text>
      `;
    }).join('');

    // X ticks (5 evenly spaced)
    const xTickEls = scenario.xTicks.map((lbl, idx) => {
      const m = (idx / (scenario.xTicks.length - 1)) * totalMin;
      const x = xAtMin(m).toFixed(1);
      return `<text x="${x}" y="${H - 6}" text-anchor="middle" fill="#9dc2e8" font-size="10.5">${esc(lbl)}</text>`;
    }).join('');

    // Measured inner polyline
    const measuredPts = scenario.measuredInner.map((v, i) => `${xAtMin(i).toFixed(1)},${yAtVal(v).toFixed(1)}`).join(' ');

    // Published inner step line
    let stepD = '';
    scenario.publishedInner.forEach((v, i) => {
      const x = xAtMin(i).toFixed(1);
      const y = yAtVal(v).toFixed(1);
      if (i === 0) {
        stepD = `M ${x} ${y}`;
      } else {
        const prevY = yAtVal(scenario.publishedInner[i - 1]).toFixed(1);
        stepD += ` L ${x} ${prevY} L ${x} ${y}`;
      }
    });

    // Suggested inner dashed line (starts at suggestStartMin)
    const sugStart = Math.max(0, Math.min(totalMin, scenario.suggestStartMin));
    const sugPts = scenario.suggestInner
      .map((v, i) => ({ v, i }))
      .filter(p => p.i >= sugStart)
      .map(p => `${xAtMin(p.i).toFixed(1)},${yAtVal(p.v).toFixed(1)}`)
      .join(' ');

    // Playhead vertical line + dot on measured curve
    const phX = xAtMin(currentMin).toFixed(1);
    const idxFloor = Math.min(scenario.measuredInner.length - 1, Math.max(0, Math.floor(currentMin)));
    const idxCeil = Math.min(scenario.measuredInner.length - 1, idxFloor + 1);
    const frac = currentMin - idxFloor;
    const curVal = scenario.measuredInner[idxFloor] * (1 - frac) + scenario.measuredInner[idxCeil] * frac;
    const phY = yAtVal(curVal).toFixed(1);

    return `
      <svg viewBox="0 0 ${W} ${H}" style="width:100%;height:auto;display:block;">
        ${yTicks}
        ${xTickEls}
        <path d="${stepD}" fill="none" stroke="#8b5cf6" stroke-width="2.1"/>
        <polyline fill="none" stroke="#facc15" stroke-width="2" stroke-dasharray="5 4" points="${sugPts}"/>
        <polyline fill="none" stroke="#22d3ee" stroke-width="2.4" points="${measuredPts}"/>
        <line x1="${phX}" y1="${padT}" x2="${phX}" y2="${padT + plotH}" stroke="rgba(226,240,255,0.65)" stroke-width="1.2" stroke-dasharray="3 3"/>
        <circle cx="${phX}" cy="${phY}" r="4.2" fill="#ffffff" stroke="#22d3ee" stroke-width="2.2"/>
      </svg>
    `;
  }

  function renderReplay(hostEl, ctx) {
    const activeSec = getActiveSectionFilter(ctx);
    const matchingSecSegIds = activeSec ? getSegmentsForSection(activeSec).map(s => s.id) : null;

    let scenarioList = REPLAY_SCENARIOS;
    if (ui.rpModeFilter !== 'all') {
      scenarioList = scenarioList.filter(sc => sc.mode === ui.rpModeFilter);
    }

    if (!scenarioList.some(sc => sc.id === ui.rpSelectedId)) {
      ui.rpSelectedId = scenarioList[0].id;
      ui.rpCurrentMin = scenarioList[0].defaultMin;
    }

    const activeSc = scenarioList.find(sc => sc.id === ui.rpSelectedId) || REPLAY_SCENARIOS[0];
    const activeSeg = SEGMENT_BY_ID[activeSc.segId] || PILOT_SEGMENTS[0];

    // Interpolated metrics at current replay timestamp
    const curIdx = Math.min(activeSc.measuredInner.length - 1, Math.max(0, Math.round(ui.rpCurrentMin)));
    const mIn = Math.round(activeSc.measuredInner[curIdx]);
    const mOut = Math.round(activeSc.measuredOuter[curIdx]);
    const sIn = activeSc.suggestInner[curIdx];
    const sOut = activeSc.suggestOuter[curIdx];
    const pIn = activeSc.publishedInner[curIdx];
    const pOut = activeSc.publishedOuter[curIdx];
    const qLen = activeSc.queueSeries[curIdx];
    const curClock = formatMinClock(activeSc, ui.rpCurrentMin);

    // Sync Cesium 3D layers & highlight active replay segment
    syncCesiumForSpeedMap(ctx, ui.rpLayers, [activeSc.segId], activeSc.segId);

    hostEl.innerHTML = `
      <div class="m11-map-stage">
        <!-- LEFT HUD: 5 SCENARIOS -->
        <aside class="hud-left-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">场景记录</span>
              </div>
              <span class="m11-hud-head-meta">${scenarioList.length} 个示例</span>
            </div>
            <div class="panel-body">
              <div class="m11-algo-list">
                ${scenarioList.map(sc => {
                  const isSel = sc.id === activeSc.id;
                  const modeCls = sc.mode === '实际回放' ? 'm11-pill-info' : 'm11-pill-warn';
                  const secMatch = !matchingSecSegIds || matchingSecSegIds.includes(sc.segId);
                  return `
                    <div class="m11-algo-card ${isSel ? 'active' : ''}" data-sc-id="${esc(sc.id)}" style="${secMatch ? '' : 'opacity:0.6;'}">
                      <div class="m11-algo-card-top">
                        <span class="m11-algo-id">${esc(sc.title)}</span>
                        <span class="${modeCls}">${esc(sc.mode)}</span>
                      </div>
                      <div class="m11-algo-meta">${esc(sc.id)}</div>
                      <div class="m11-algo-meta" style="color:#d6e9ff;">${esc(sc.segName)}</div>
                      <div class="m11-algo-meta">${esc(sc.dateRangeLabel)}</div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </aside>

        <!-- TOP FLOATING TOOLBAR -->
        <div class="m11-map-toolbar">
          <div class="m11-map-toolbar-left">
            <div class="dual-seg">
              <button class="dual-seg-btn ${activeSc.mode === '实际回放' ? 'active' : ''}" id="m11RpModeReal">实际回放</button>
              <button class="dual-seg-btn ${activeSc.mode === '模拟演示' ? 'active' : ''}" id="m11RpModeSim">模拟演示</button>
            </div>
            <select class="m11-compact-select" id="m11RpSegSelect">
              ${PILOT_SEGMENTS.map(s => `<option value="${esc(s.id)}" ${activeSc.segId === s.id ? 'selected' : ''}>${esc(s.name)}</option>`).join('')}
            </select>
            <span class="m11-toolbar-time">${esc(activeSc.windowLabel)}</span>
          </div>
          <div class="m11-map-toolbar-right">
            <button class="dock-btn" id="m11RpLayerBtn">${ICONS.layers} 图层</button>
            <button class="dock-btn" id="m11RpLocateBtn">${ICONS.locate} 定位试点</button>
            ${ui.rpShowLayersPopover ? `
              <div class="m11-layer-popover" id="m11RpLayerPopover">
                <label class="m11-layer-item"><input type="checkbox" data-layer="corridor" ${ui.rpLayers.corridor ? 'checked' : ''}> 监测走廊</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="attention" ${ui.rpLayers.attention ? 'checked' : ''}> 回放焦点区段</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="markers" ${ui.rpLayers.markers ? 'checked' : ''}> 试点标注</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="satellite" ${ui.rpLayers.satellite ? 'checked' : ''}> 卫星影像底图</label>
                <label class="m11-layer-item"><input type="checkbox" data-layer="sections" ${ui.rpLayers.sections ? 'checked' : ''}> 工区范围高亮</label>
              </div>
            ` : ''}
          </div>
        </div>

        <!-- ZOOM & LOCATE CONTROLS -->
        <div class="zoom-pill vertical m11-map-zoom">
          <button class="zoom-btn" id="m11RpZoomIn" title="放大">+</button>
          <button class="zoom-btn" id="m11RpZoomOut" title="缩小">−</button>
          <button class="zoom-btn" id="m11RpZoomReset" title="全线视角">${ICONS.locate}</button>
        </div>

        <!-- CESIUM PROJECTED MARKERS -->
        <div class="m11-map-markers-layer" id="m11RpMarkersLayer" style="${ui.rpLayers.markers ? '' : 'display:none;'}">
          ${PILOT_SEGMENTS.map(seg => {
            const isSel = seg.id === activeSc.segId;
            return `
              <div class="m11-pin-wrap ${isSel ? 'active warn' : ''}" data-seg="${esc(seg.id)}">
                <div class="m11-pin-label">${esc(seg.name)}</div>
                <div class="m11-pin-dot"></div>
                ${isSel ? `
                  <div class="m11-pin-popup">
                    <div class="m11-pin-popup-title">${esc(activeSc.title)}</div>
                    <div class="m11-pin-popup-sub">回放时点 ${esc(curClock)} · ${esc(activeSc.popupSub)}</div>
                  </div>
                ` : ''}
              </div>
            `;
          }).join('')}
        </div>

        <!-- BOTTOM FLOATING REPLAY CHART DOCK -->
        <div class="m11-replay-dock">
          <div class="m11-seg-insp-top" style="margin-bottom:4px;">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title" style="font-size:13.5px;">${esc(activeSc.chartTitle)}</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span class="${activeSc.mode === '实际回放' ? 'm11-pill-info' : 'm11-pill-warn'}">${esc(activeSc.mode)}</span>
              <span style="font-size:11px;color:#9dc2e8;">内侧车道 · 单位 km/h</span>
            </div>
          </div>

          <div id="m11ReplaySvgHost">
            ${buildReplaySvg(activeSc, ui.rpCurrentMin)}
          </div>

          <div style="display:flex;justify-content:center;gap:18px;font-size:11px;color:#c9e2fb;margin-top:1px;">
            <span><i class="m11-legend-swatch" style="background:#22d3ee;"></i>内侧实测车速</span>
            <span><i class="m11-legend-swatch" style="background:none;border-top:2px dashed #facc15;"></i>内侧算法建议</span>
            <span><i class="m11-legend-swatch" style="background:#8b5cf6;"></i>内侧已发布限速</span>
          </div>

          <div class="m11-replay-controls">
            <button class="m11-replay-btn" id="m11RpPlayBtn" title="${ui.rpPlaying ? '暂停' : '播放'}">
              ${ui.rpPlaying ? ICONS.pause : ICONS.play}
            </button>
            <button class="m11-replay-btn" id="m11RpResetBtn" title="重置到关键时点">${ICONS.reset}</button>
            <input type="range" class="m11-replay-slider" id="m11RpSlider" min="0" max="${activeSc.durationMin}" step="0.5" value="${ui.rpCurrentMin}">
            <span style="font-size:11.5px;color:#b8d7f7;font-variant-numeric:tabular-nums;" id="m11RpTimePair">${formatPlayTimeMMSS(ui.rpCurrentMin)} / ${formatPlayTimeMMSS(activeSc.durationMin)}</span>
            <strong style="font-size:13px;color:#38f2ff;font-variant-numeric:tabular-nums;" id="m11RpClockText">${esc(curClock)}</strong>
          </div>
          <div style="display:flex;justify-content:space-between;padding:2px 86px 0 80px;font-size:10.5px;color:#8fb4db;">
            ${activeSc.xTicks.map((t, i) => `<span style="${i === 2 ? 'color:#38f2ff;font-weight:700;' : ''}">${esc(t)}</span>`).join('')}
          </div>
        </div>

        <!-- BOTTOM LEGEND -->
        <div class="m11-map-legend">
          <div class="m11-legend-items">
            <span><i class="m11-legend-swatch" style="background:#38f2ff;"></i>监测走廊</span>
            <span><i class="m11-legend-swatch" style="background:#f59e0b;"></i>需关注区段</span>
          </div>
          <span>明水至北安段 · 底图与试点位置示意</span>
          <span>↑ 北</span>
        </div>

        <!-- RIGHT HUD: REPLAY METRICS & 5-STEP TIMELINE -->
        <aside class="hud-right-col">
          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title" id="m11RpTimeTitle">回放时点 ${esc(curClock)}</span>
              </div>
              <span class="m11-hud-head-meta">${esc(activeSc.sampleTag)}</span>
            </div>
            <div class="panel-body">
              <div class="m11-kpi-grid-3x2">
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">实测 内侧 / 外侧</div>
                  <div class="m11-mini-kpi-val" style="font-size:15px;" id="m11RpKpiMeasured">${mIn} / ${mOut}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">建议 内侧 / 外侧</div>
                  <div class="m11-mini-kpi-val gold" style="font-size:15px;" id="m11RpKpiSuggest">${sIn} / ${sOut}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">发布 内侧 / 外侧</div>
                  <div class="m11-mini-kpi-val" style="font-size:15px;" id="m11RpKpiPub">${pIn} / ${pOut}<span class="m11-mini-kpi-unit">km/h</span></div>
                </div>
                <div class="m11-mini-kpi">
                  <div class="m11-mini-kpi-label">实测排队</div>
                  <div class="m11-mini-kpi-val" style="font-size:15px;" id="m11RpKpiQueue">${qLen}<span class="m11-mini-kpi-unit">m</span></div>
                </div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">风险、策略与回执</span>
              </div>
              <button class="m11-hud-link" id="m11RpLinkedBtn">查看关联记录 &gt;</button>
            </div>
            <div class="panel-body">
              <div class="timeline-list">
                ${activeSc.timeline.map((step, idx) => {
                  const isVisited = ui.rpCurrentMin >= step.min;
                  const nextStep = activeSc.timeline[idx + 1];
                  const isCurrent = isVisited && (!nextStep || ui.rpCurrentMin < nextStep.min);
                  return `
                    <div class="timeline-item ${isCurrent ? 'active' : isVisited ? 'visited' : ''}" data-step-min="${step.min}" style="align-items:flex-start;">
                      <div class="timeline-node" style="margin-top:3px;"></div>
                      <div style="min-width:0;flex:1;">
                        <div style="display:flex;align-items:center;gap:6px;">
                          <span style="font-size:11px;color:#38f2ff;font-weight:700;font-variant-numeric:tabular-nums;">${esc(step.clock)}</span>
                          <span style="font-size:12px;font-weight:700;color:#fff;">${esc(step.title)}</span>
                        </div>
                        <div class="timeline-sub" style="margin-top:2px;">${esc(step.desc)}</div>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>
        </aside>
      </div>
    `;

    // Scenario card clicks
    hostEl.querySelectorAll('.m11-algo-card[data-sc-id]').forEach(card => {
      card.addEventListener('click', () => {
        ui.rpSelectedId = card.dataset.scId;
        const sc = REPLAY_SCENARIOS.find(s => s.id === ui.rpSelectedId);
        if (sc) {
          ui.rpCurrentMin = sc.defaultMin;
          ui.rpPlaying = false;
          if (replayTimer) { clearInterval(replayTimer); replayTimer = null; }
          flyToPilotSegment(ctx.cesium, sc.segId);
        }
        renderReplay(hostEl, ctx);
      });
    });

    // Mode toggle (实际回放 | 模拟演示)
    const realBtn = hostEl.querySelector('#m11RpModeReal');
    const simBtn = hostEl.querySelector('#m11RpModeSim');
    if (realBtn) {
      realBtn.addEventListener('click', () => {
        const firstReal = REPLAY_SCENARIOS.find(s => s.mode === '实际回放');
        if (firstReal && activeSc.mode !== '实际回放') {
          ui.rpSelectedId = firstReal.id;
          ui.rpCurrentMin = firstReal.defaultMin;
          ui.rpPlaying = false;
          flyToPilotSegment(ctx.cesium, firstReal.segId);
          renderReplay(hostEl, ctx);
        }
      });
    }
    if (simBtn) {
      simBtn.addEventListener('click', () => {
        const firstSim = REPLAY_SCENARIOS.find(s => s.mode === '模拟演示');
        if (firstSim && activeSc.mode !== '模拟演示') {
          ui.rpSelectedId = firstSim.id;
          ui.rpCurrentMin = firstSim.defaultMin;
          ui.rpPlaying = false;
          flyToPilotSegment(ctx.cesium, firstSim.segId);
          renderReplay(hostEl, ctx);
        }
      });
    }

    // Segment selector
    const segSel = hostEl.querySelector('#m11RpSegSelect');
    if (segSel) {
      segSel.addEventListener('change', () => {
        const match = REPLAY_SCENARIOS.find(s => s.segId === segSel.value);
        if (match) {
          ui.rpSelectedId = match.id;
          ui.rpCurrentMin = match.defaultMin;
          ui.rpPlaying = false;
          flyToPilotSegment(ctx.cesium, match.segId);
          renderReplay(hostEl, ctx);
        } else {
          flyToPilotSegment(ctx.cesium, segSel.value);
          ctx.showToast(`已定位至 ${SEGMENT_BY_ID[segSel.value].name}`);
        }
      });
    }

    // Layer popover & locate
    const layerBtn = hostEl.querySelector('#m11RpLayerBtn');
    if (layerBtn) {
      layerBtn.addEventListener('click', () => {
        ui.rpShowLayersPopover = !ui.rpShowLayersPopover;
        renderReplay(hostEl, ctx);
      });
    }
    const rpPop = hostEl.querySelector('#m11RpLayerPopover');
    if (rpPop) {
      rpPop.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          ui.rpLayers[cb.dataset.layer] = cb.checked;
          renderReplay(hostEl, ctx);
        });
      });
    }
    const locateBtn = hostEl.querySelector('#m11RpLocateBtn');
    if (locateBtn) {
      locateBtn.addEventListener('click', () => {
        flyToPilotSegment(ctx.cesium, activeSc.segId);
        ctx.showToast(`已定位至回放区段：${activeSeg.name}`);
      });
    }

    const zIn = hostEl.querySelector('#m11RpZoomIn');
    const zOut = hostEl.querySelector('#m11RpZoomOut');
    const zReset = hostEl.querySelector('#m11RpZoomReset');
    if (zIn) zIn.addEventListener('click', () => ctx.cesium && ctx.cesium.zoomIn());
    if (zOut) zOut.addEventListener('click', () => ctx.cesium && ctx.cesium.zoomOut());
    if (zReset) zReset.addEventListener('click', () => flyToCorridorOverview(ctx.cesium));

    // Projected markers
    bindProjectedMarkers(ctx, hostEl.querySelector('#m11RpMarkersLayer'), activeSc.segId, (segId) => {
      const match = REPLAY_SCENARIOS.find(s => s.segId === segId);
      if (match) {
        ui.rpSelectedId = match.id;
        ui.rpCurrentMin = match.defaultMin;
        ui.rpPlaying = false;
      }
      flyToPilotSegment(ctx.cesium, segId);
      renderReplay(hostEl, ctx);
    });

    // Playback scrubber, play/pause, reset, timeline click
    const slider = hostEl.querySelector('#m11RpSlider');
    if (slider) {
      slider.addEventListener('input', () => {
        ui.rpCurrentMin = parseFloat(slider.value);
        syncReplayInPlace(hostEl, activeSc);
      });
    }

    const playBtn = hostEl.querySelector('#m11RpPlayBtn');
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        ui.rpPlaying = !ui.rpPlaying;
        if (ui.rpPlaying && ui.rpCurrentMin >= activeSc.durationMin) {
          ui.rpCurrentMin = 0;
        }
        ensureReplayTimer(hostEl, ctx, activeSc);
        renderReplay(hostEl, ctx);
      });
    }

    const resetBtn = hostEl.querySelector('#m11RpResetBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        ui.rpPlaying = false;
        if (replayTimer) { clearInterval(replayTimer); replayTimer = null; }
        ui.rpCurrentMin = activeSc.defaultMin;
        syncReplayInPlace(hostEl, activeSc);
        const pb = hostEl.querySelector('#m11RpPlayBtn');
        if (pb) { pb.innerHTML = ICONS.play; pb.title = '播放'; }
      });
    }

    hostEl.querySelectorAll('.timeline-item[data-step-min]').forEach(item => {
      item.addEventListener('click', () => {
        ui.rpCurrentMin = parseFloat(item.dataset.stepMin);
        syncReplayInPlace(hostEl, activeSc);
      });
    });

    // Linked records modal
    const linkedBtn = hostEl.querySelector('#m11RpLinkedBtn');
    if (linkedBtn) {
      linkedBtn.addEventListener('click', () => {
        const latestClock = formatMinClock(activeSc, ui.rpCurrentMin);
        ctx.openModal(`关联业务闭环记录 — ${activeSc.title} (${activeSc.id})`, `
          <div style="display:flex;flex-direction:column;gap:12px;">
            <div class="detail-grid">
              <div class="detail-stat-card"><span>回放区段</span><strong>${esc(activeSc.segName)}</strong></div>
              <div class="detail-stat-card"><span>场景类型</span><strong>${esc(activeSc.mode)}</strong></div>
              <div class="detail-stat-card"><span>当前回放时点</span><strong>${esc(latestClock)}</strong></div>
            </div>
            <table class="data-table">
              <thead><tr><th>发生时间</th><th>事件节点</th><th>关联闭环说明</th></tr></thead>
              <tbody>
                ${activeSc.timeline.map(st => `
                  <tr>
                    <td><strong>${esc(st.clock)}</strong></td>
                    <td>${esc(st.title)}</td>
                    <td>${esc(st.desc)}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
            <div style="display:flex;justify-content:flex-end;gap:8px;">
              <button class="m11-btn-ghost" id="m11RpModalAlgo">查看算法研判</button>
              <button class="m11-btn-primary" id="m11RpModalFeedback">查看执行反馈</button>
            </div>
          </div>
        `);
        const toAlgo = document.getElementById('m11RpModalAlgo');
        const toFb = document.getElementById('m11RpModalFeedback');
        if (toAlgo) toAlgo.addEventListener('click', () => { ctx.closeModal(); ctx.switchModule('speed', 'algorithm'); });
        if (toFb) toFb.addEventListener('click', () => { ctx.closeModal(); ctx.switchModule('speed', 'feedback'); });
      });
    }
  }

  function syncReplayInPlace(hostEl, activeSc) {
    const svgHost = hostEl.querySelector('#m11ReplaySvgHost');
    if (svgHost) svgHost.innerHTML = buildReplaySvg(activeSc, ui.rpCurrentMin);

    const curIdx = Math.min(activeSc.measuredInner.length - 1, Math.max(0, Math.round(ui.rpCurrentMin)));
    const curClock = formatMinClock(activeSc, ui.rpCurrentMin);

    const slider = hostEl.querySelector('#m11RpSlider');
    if (slider) slider.value = String(ui.rpCurrentMin);

    const pair = hostEl.querySelector('#m11RpTimePair');
    if (pair) pair.textContent = `${formatPlayTimeMMSS(ui.rpCurrentMin)} / ${formatPlayTimeMMSS(activeSc.durationMin)}`;

    const clk = hostEl.querySelector('#m11RpClockText');
    if (clk) clk.textContent = curClock;

    const ttl = hostEl.querySelector('#m11RpTimeTitle');
    if (ttl) ttl.textContent = `回放时点 ${curClock}`;

    const km = hostEl.querySelector('#m11RpKpiMeasured');
    if (km) km.innerHTML = `${Math.round(activeSc.measuredInner[curIdx])} / ${Math.round(activeSc.measuredOuter[curIdx])}<span class="m11-mini-kpi-unit">km/h</span>`;

    const ks = hostEl.querySelector('#m11RpKpiSuggest');
    if (ks) ks.innerHTML = `${activeSc.suggestInner[curIdx]} / ${activeSc.suggestOuter[curIdx]}<span class="m11-mini-kpi-unit">km/h</span>`;

    const kp = hostEl.querySelector('#m11RpKpiPub');
    if (kp) kp.innerHTML = `${activeSc.publishedInner[curIdx]} / ${activeSc.publishedOuter[curIdx]}<span class="m11-mini-kpi-unit">km/h</span>`;

    const kq = hostEl.querySelector('#m11RpKpiQueue');
    if (kq) kq.innerHTML = `${activeSc.queueSeries[curIdx]}<span class="m11-mini-kpi-unit">m</span>`;

    const popSub = hostEl.querySelector('.m11-pin-popup-sub');
    if (popSub) popSub.textContent = `回放时点 ${curClock} · ${activeSc.popupSub}`;

    const steps = hostEl.querySelectorAll('.timeline-item[data-step-min]');
    steps.forEach((el, idx) => {
      const stepMin = activeSc.timeline[idx].min;
      const nextStep = activeSc.timeline[idx + 1];
      const isVisited = ui.rpCurrentMin >= stepMin;
      const isCurrent = isVisited && (!nextStep || ui.rpCurrentMin < nextStep.min);
      el.classList.toggle('active', isCurrent);
      el.classList.toggle('visited', !isCurrent && isVisited);
    });
  }

  function ensureReplayTimer(hostEl, ctx, activeSc) {
    if (replayTimer) {
      clearInterval(replayTimer);
      replayTimer = null;
    }
    if (!ui.rpPlaying) return;
    replayTimer = setInterval(() => {
      if (!ui.rpPlaying || lastSubPageId !== 'replay') {
        clearInterval(replayTimer);
        replayTimer = null;
        return;
      }
      const sc = REPLAY_SCENARIOS.find(s => s.id === ui.rpSelectedId) || activeSc;
      ui.rpCurrentMin = +(ui.rpCurrentMin + 0.5).toFixed(1);
      if (ui.rpCurrentMin >= sc.durationMin) {
        ui.rpCurrentMin = sc.durationMin;
        ui.rpPlaying = false;
        clearInterval(replayTimer);
        replayTimer = null;
        const pb = hostEl.querySelector('#m11RpPlayBtn');
        if (pb) { pb.innerHTML = ICONS.play; pb.title = '播放'; }
        if (lastCtx) lastCtx.showToast(`【${sc.title}】场景回放演示完成`);
      }
      syncReplayInPlace(hostEl, sc);
    }, 550);
  }

  /* ------------------------------------------------------------------------
     CLEANUP & MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  function cleanupModuleRuntime(ctx) {
    clearAllTimers();
    ui.rpPlaying = false;
    lastCesiumLayerSig = '';
    const ces = (ctx && ctx.cesium) || (lastCtx && lastCtx.cesium) || window.JIHEI_CESIUM;
    clearCesiumTempEntities(ces);
    if (ces && ces.ready) {
      ces.applyLayers({
        satellite: false,
        uav: true,
        bim: false,
        pois: true,
        sections: true,
        route: true,
        designMode: false,
        activeSectionId: (ctx && ctx.state && ctx.state.activeSectionId) || null
      });
      if (typeof ces.syncHtmlOverlays === 'function') {
        ces.syncHtmlOverlays({
          showRoute: true,
          showSections: true,
          showPois: true,
          activeSectionId: (ctx && ctx.state && ctx.state.activeSectionId) || null,
          activePoiId: (ctx && ctx.state && ctx.state.selectedPoiId) || null,
          poiObjects: (ctx && ctx.data && ctx.data.poiObjects) || (window.JIHEI_DATA && window.JIHEI_DATA.poiObjects) || undefined,
          icons: (ctx && ctx.icons) || undefined,
          showViewpoint: false
        });
      }
    }
  }

  window.JIHEI_PLATFORM.registerModule({
    id: 'speed',
    name: '智慧提速',
    subPages: SUB_PAGES,

    getCesiumMode(subPageId) {
      return (subPageId === 'traffic' || subPageId === 'replay') ? 'interactive' : 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      ensureStyles();
      lastCtx = ctx;
      lastHostEl = hostEl;

      const prevSub = lastSubPageId;
      lastSubPageId = subPageId;

      const isMapSub = (subPageId === 'traffic' || subPageId === 'replay');
      const wasMapSub = (prevSub === 'traffic' || prevSub === 'replay');

      // Stop non-active sub-page timers & clean entities when leaving map sub-pages
      if (prevSub !== subPageId) {
        clearAllTimers();
        ui.rpPlaying = false;
        if (wasMapSub && !isMapSub) {
          cleanupModuleRuntime(ctx);
        }
      }

      if (subPageId === 'traffic') {
        if (prevSub !== 'traffic') {
          lastCesiumLayerSig = '';
          const activeSec = getActiveSectionFilter(ctx);
          if (activeSec && ctx.cesium) {
            ctx.cesium.flyToSection(activeSec);
          } else if (ctx.cesium) {
            flyToAllPilotSegments(ctx.cesium, false);
          }
        }
        renderTraffic(hostEl, ctx);
      } else if (subPageId === 'algorithm') {
        renderAlgorithm(hostEl, ctx);
      } else if (subPageId === 'strategy') {
        renderStrategy(hostEl, ctx);
      } else if (subPageId === 'feedback') {
        renderFeedback(hostEl, ctx);
      } else if (subPageId === 'replay') {
        if (prevSub !== 'replay') {
          lastCesiumLayerSig = '';
          const activeSec = getActiveSectionFilter(ctx);
          if (activeSec && ctx.cesium) {
            ctx.cesium.flyToSection(activeSec);
          } else if (ctx.cesium) {
            flyToAllPilotSegments(ctx.cesium, true);
          }
        }
        renderReplay(hostEl, ctx);
        if (ui.rpPlaying) {
          const sc = REPLAY_SCENARIOS.find(s => s.id === ui.rpSelectedId) || REPLAY_SCENARIOS[0];
          ensureReplayTimer(hostEl, ctx, sc);
        }
      }
    },

    onSectionChange(secId, subPageId) {
      if (!lastCtx || !lastHostEl) return;
      const segs = secId ? getSegmentsForSection(secId) : PILOT_SEGMENTS;
      const firstSeg = segs[0] || null;

      if (subPageId === 'traffic') {
        if (firstSeg) {
          ui.trSelectedSegId = firstSeg.id;
        }
        lastCesiumLayerSig = '';
        if (lastCtx.cesium) {
          if (secId) lastCtx.cesium.flyToSection(secId);
          else flyToAllPilotSegments(lastCtx.cesium, false);
        }
        renderTraffic(lastHostEl, lastCtx);
      } else if (subPageId === 'replay') {
        if (firstSeg) {
          const match = REPLAY_SCENARIOS.find(s => s.segId === firstSeg.id);
          if (match) {
            ui.rpSelectedId = match.id;
            ui.rpCurrentMin = match.defaultMin;
          }
        }
        lastCesiumLayerSig = '';
        if (lastCtx.cesium) {
          if (secId) lastCtx.cesium.flyToSection(secId);
          else flyToAllPilotSegments(lastCtx.cesium, true);
        }
        renderReplay(lastHostEl, lastCtx);
      } else if (subPageId === 'algorithm') {
        renderAlgorithm(lastHostEl, lastCtx);
      } else if (subPageId === 'strategy') {
        renderStrategy(lastHostEl, lastCtx);
      } else if (subPageId === 'feedback') {
        renderFeedback(lastHostEl, lastCtx);
      }
    },

    onLeave() {
      lastSubPageId = null;
      cleanupModuleRuntime(lastCtx);
      if (lastHostEl) {
        lastHostEl.innerHTML = '';
        lastHostEl = null;
      } else {
        const host = document.getElementById('moduleStageHost');
        if (host) host.innerHTML = '';
      }
    }
  });
})();
