/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 3：质量管理 (js/modules/m03_quality.js)
   包含 6 个子页面：质量总览、实验室、拌合站、路面质量、智慧梁场、质量问题与整改
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'overview', name: '质量总览' },
    { id: 'lab', name: '实验室' },
    { id: 'mixing', name: '拌合站' },
    { id: 'pavement', name: '路面质量' },
    { id: 'beamYard', name: '智慧梁场' },
    { id: 'issues', name: '质量问题与整改' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', short: '一工区', lab: '一工区实验室', station: '一号站', stationFull: '一号拌合站', yard: '一号梁场', stake: 'K0+000 ~ K24+500' },
    { id: 'sec2', name: '二工区', short: '二工区', lab: '二工区实验室', station: '二号站', stationFull: '二号拌合站', yard: '二号梁场', stake: 'K24+500 ~ K48+200' },
    { id: 'sec3', name: '三工区', short: '三工区', lab: '三工区实验室', station: '三号站', stationFull: '三号拌合站', yard: '一号梁场', stake: 'K48+200 ~ K72+800' },
    { id: 'sec4', name: '四工区', short: '四工区', lab: '四工区实验室', station: '四号站', stationFull: '四号拌合站', yard: '二号梁场', stake: 'K72+800 ~ K96+000' },
    { id: 'sec5', name: '五工区', short: '五工区', lab: '五工区实验室', station: '五号站', stationFull: '五号拌合站', yard: '一号梁场', stake: 'K96+000 ~ K121+400' },
    { id: 'sec6', name: '六工区', short: '六工区', lab: '六工区实验室', station: '六号站', stationFull: '六号拌合站', yard: '二号梁场', stake: 'K121+400 ~ K146+800' }
  ];

  const PERIOD_FACTORS = {
    '2026年11月': { mult: 1, label: '2026年11月', shortMonth: '11月', passDelta: 0 },
    '2026年10月': { mult: 0.94, label: '2026年10月', shortMonth: '10月', passDelta: -0.2 },
    '2026年Q4': { mult: 1.94, label: '2026年Q4', shortMonth: 'Q4', passDelta: -0.1 },
    '2026年度': { mult: 6.4, label: '2026年度', shortMonth: '全年', passDelta: -0.3 }
  };

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const M03_ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    ext: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    batch: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    shieldCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2l8 4v6c0 5.2-3.4 9.2-8 10-4.6-.8-8-4.8-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    beam: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 7h18v3H3z"/><path d="M6 10v9M18 10v9M3 13h18"/></svg>`,
    warn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>`,
    flask: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M9 3h6M10 3v6l-5 9a2 2 0 001.7 3h10.6a2 2 0 001.7-3l-5-9V3"/><path d="M7.5 14h9"/></svg>`,
    report: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
    plant: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M3 21h18M5 21V9l4-2v14M11 21V5l5-2v18M17 21v-8l3-1v9"/></svg>`,
    road: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/></svg>`,
    temp: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 14.76V3.5a2.5 2.5 0 00-5 0v11.26a4.5 4.5 0 105 0z"/></svg>`,
    roller: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="8"/><path d="M12 8v8M9 13l3 3 3-3"/></svg>`,
    ruler: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="7" width="18" height="10" rx="2"/><path d="M7 7v4M11 7v3M15 7v4M19 7v3"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`
  };

  /* ------------------------------------------------------------------------
     GENUINE STATEFUL MOCK DATASET (Mathematically Reconciled Across All 6 Pages)
     ------------------------------------------------------------------------ */
  const SECTION_METRICS = {
    sec1: { name: '一工区', labBatches: 1468, labPassRate: 98.9, mixVol: 7.6, beams: 112, pavKm: 8.4, pavSegments: 3, issues: 1, qualityRate: 98.9 },
    sec2: { name: '二工区', labBatches: 1524, labPassRate: 98.4, mixVol: 6.8, mixBatches: 455, beams: 118, pavKm: 7.6, pavSegments: 3, issues: 3, qualityRate: 98.4 },
    sec3: { name: '三工区', labBatches: 1384, labPassRate: 98.7, mixVol: 6.2, beams: 106, pavKm: 7.2, pavSegments: 3, issues: 2, qualityRate: 98.7 },
    sec4: { name: '四工区', labBatches: 1327, labPassRate: 98.6, mixVol: 5.9, beams: 102, pavKm: 6.8, pavSegments: 3, issues: 3, qualityRate: 98.6 },
    sec5: { name: '五工区', labBatches: 1468, labPassRate: 98.8, mixVol: 5.4, beams: 104, pavKm: 6.6, pavSegments: 3, issues: 2, qualityRate: 98.8 },
    sec6: { name: '六工区', labBatches: 1265, labPassRate: 99.0, mixVol: 4.9, beams: 98, pavKm: 6.0, pavSegments: 3, issues: 1, qualityRate: 99.0 }
  };

  const inspectionRecords = [
    { id: 'QJ-20261125-01', sectionId: 'sec2', section: '二工区', category: '施工工艺', target: '二号拌合站', content: '水稳混合料含水率', result: '不合格', desc: '含水率超出控制范围', rectify: '已整改', date: '2026-11-25 09:40', measured: '5.8%', standard: '4.5%~5.3%', inspector: '刘志鹏', note: '已调整骨料冷料仓含水补偿参数并复检合格。' },
    { id: 'QJ-20261125-02', sectionId: 'sec3', section: '三工区', category: '构件质量', target: '一号梁场', content: '预制箱梁外观质量', result: '不合格', desc: '梁体局部蜂窝麻面', rectify: '整改中', date: '2026-11-24 14:10', measured: '局部 0.18m²', standard: '表面平整密实无蜂窝', inspector: '陈晓宇', note: '正在按监理批准方案采用高标号聚合物砂浆修补打磨。' },
    { id: 'QJ-20261125-03', sectionId: 'sec4', section: '四工区', category: '施工工艺', target: '沥青中面层', content: '摊铺厚度', result: '不合格', desc: '实测厚度偏小', rectify: '已整改', date: '2026-11-24 10:20', measured: '5.1 cm', standard: '5.8~6.2 cm', inspector: '周海涛', note: '已校核摊铺机平衡梁传感器并完成补铺复核。' },
    { id: 'QJ-20261125-04', sectionId: 'sec1', section: '一工区', category: '原材料', target: '钢筋加工场', content: '钢筋力学性能', result: '合格', desc: '—', rectify: '—', date: '2026-11-25 08:50', measured: '屈服 432 MPa', standard: '≥ 400 MPa', inspector: '赵建军', note: 'HRB400E 螺纹钢抗拉与冷弯性能均符合设计要求。' },
    { id: 'QJ-20261125-05', sectionId: 'sec5', section: '五工区', category: '构件质量', target: '二号梁场', content: '梁片预应力张拉', result: '合格', desc: '—', rectify: '—', date: '2026-11-25 08:15', measured: '伸长量偏差 +2.1%', standard: '±6% 以内', inspector: '孙明辉', note: '双控张拉千斤顶与油表校验同步在线采集正常。' },
    { id: 'QJ-20261124-06', sectionId: 'sec6', section: '六工区', category: '检测', target: '建华枢纽路基', content: '路基压实度灌砂检测', result: '合格', desc: '—', rectify: '—', date: '2026-11-24 16:35', measured: '96.8%', standard: '≥ 96.0%', inspector: '韩立新', note: '上路床 96 区压实度抽检 12 点全部达标。' },
    { id: 'QJ-20261124-07', sectionId: 'sec2', section: '二工区', category: '原材料', target: '粗集料堆场', content: '粗集料针片状含量', result: '不合格', desc: '针片状颗粒含量偏高', rectify: '已整改', date: '2026-11-24 11:20', measured: '16.4%', standard: '≤ 15.0%', inspector: '刘志鹏', note: '已退场处理 120 吨并更换反击破筛网。' },
    { id: 'QJ-20261123-08', sectionId: 'sec4', section: '四工区', category: '检测', target: '跨河中桥 3#墩', content: '混凝土 28d 抗压强度', result: '合格', desc: '—', rectify: '—', date: '2026-11-23 15:10', measured: '45.6 MPa', standard: '≥ 40.0 MPa (C40)', inspector: '周海涛', note: '同条件及标准养护试块强度评定合格。' },
    { id: 'QJ-20261123-09', sectionId: 'sec3', section: '三工区', category: '原材料', target: '水泥罐区 2#', content: 'P·O 42.5 水泥安定性', result: '不合格', desc: '雷氏夹沸煮法临界值波动', rectify: '已整改', date: '2026-11-23 09:50', measured: '4.8 mm', standard: '≤ 5.0 mm (内控≤3.5)', inspector: '陈晓宇', note: '复检合格，已加强进场散装水泥留样频次。' },
    { id: 'QJ-20261122-10', sectionId: 'sec5', section: '五工区', category: '施工工艺', target: 'K104+300 路面', content: '沥青混合料摊铺温度', result: '合格', desc: '—', rectify: '—', date: '2026-11-22 14:40', measured: '154 ℃', standard: '145~165 ℃', inspector: '孙明辉', note: '全幅摊铺红外测温分布均匀，无低温离析。' },
    { id: 'QJ-20261122-11', sectionId: 'sec1', section: '一工区', category: '检测', target: 'K12+600 桥台', content: '桩基超声波透射法检测', result: '合格', desc: '—', rectify: '—', date: '2026-11-22 10:05', measured: '声速 4.38 km/s', standard: 'I 类桩要求', inspector: '赵建军', note: '全部 16 根桩基评定为 I 类桩，波形连续清晰。' },
    { id: 'QJ-20261121-12', sectionId: 'sec6', section: '六工区', category: '构件质量', target: '二号梁场', content: '孔道压浆密实度抽检', result: '合格', desc: '—', rectify: '—', date: '2026-11-21 16:00', measured: '充盈度 100%', standard: '无空洞脱空', inspector: '韩立新', note: '真空辅助智能压浆压力稳压 0.62 MPa 持荷 5 分钟。' },
    { id: 'QJ-20261121-13', sectionId: 'sec2', section: '二工区', category: '施工工艺', target: '桥梁示例A 主跨', content: '支座垫石平整度与高程', result: '合格', desc: '—', rectify: '—', date: '2026-11-21 11:30', measured: '±1.2 mm', standard: '±2.0 mm', inspector: '刘志鹏', note: '激光水准仪复测全部垫石标高符合架梁精度要求。' },
    { id: 'QJ-20261120-14', sectionId: 'sec4', section: '四工区', category: '原材料', target: '四号拌合站', content: 'SBS 改性沥青软化点', result: '合格', desc: '—', rectify: '—', date: '2026-11-20 15:20', measured: '68.5 ℃', standard: '≥ 60.0 ℃', inspector: '周海涛', note: '针入度、延度及软化点全指标满足寒区指标。' },
    { id: 'QJ-20261120-15', sectionId: 'sec1', section: '一工区', category: '检测', target: 'K08+120 水稳基层', content: '7日无侧限抗压强度', result: '合格', desc: '—', rectify: '—', date: '2026-11-20 09:45', measured: '4.6 MPa', standard: '≥ 4.0 MPa', inspector: '赵建军', note: '水泥剂量 4.5%，7日强度富余系数充足。' }
  ];

  const labRecords = [
    { id: 'JC-20261125-018', sectionId: 'sec2', lab: '二工区实验室', category: '原材料', sample: '粗集料', item: '针片状含量', time: '11-25 10:12', result: '不合格', reportState: '已出具', retestState: '待复检', measured: '16.4%', limit: '≤ 15.0%', machine: '电子游标卡尺规准仪', hash: '9F4A...82C1' },
    { id: 'JC-20261125-017', sectionId: 'sec1', lab: '一工区实验室', category: '混合料', sample: '水泥稳定碎石', item: '7日无侧限抗压强度', time: '11-25 10:04', result: '合格', reportState: '已出具', retestState: '正常', measured: '4.6 MPa', limit: '≥ 4.0 MPa', machine: 'WAW-1000B 万能试验机', hash: '7C2E...14B9' },
    { id: 'JC-20261125-016', sectionId: 'sec5', lab: '五工区实验室', category: '原材料', sample: '钢筋 HRB400', item: '屈服强度与伸长率', time: '11-25 09:46', result: '合格', reportState: '已出具', retestState: '正常', measured: '436 MPa / 18.5%', limit: '≥ 400 MPa / ≥ 16%', machine: 'WEW-600D 液压万能机', hash: '3D8A...51E0' },
    { id: 'JC-20261125-015', sectionId: 'sec4', lab: '四工区实验室', category: '混合料', sample: '沥青混合料', item: '马歇尔稳定度', time: '11-25 09:31', result: '不合格', reportState: '已出具', retestState: '待复检', measured: '7.4 kN', limit: '≥ 8.0 kN', machine: 'SYD-0709A 自动马歇尔仪', hash: '6B11...7A44' },
    { id: 'JC-20261125-014', sectionId: 'sec6', lab: '六工区实验室', category: '混凝土', sample: '混凝土试件', item: '28日抗压强度', time: '11-25 09:18', result: '合格', reportState: '待出具', retestState: '正常', measured: '54.8 MPa', limit: '≥ 50.0 MPa (C50)', machine: 'YAW-3000B 全自动压力机', hash: '待签章生成' },
    { id: 'JC-20261124-026', sectionId: 'sec3', lab: '三工区实验室', category: '原材料', sample: 'P·O 42.5 水泥', item: '水泥安定性', time: '11-24 15:22', result: '不合格', reportState: '已出具', retestState: '已复检', measured: '4.8 mm → 1.9 mm', limit: '≤ 5.0 mm', machine: 'FZ-31A 雷氏沸煮箱', hash: '4E09...C312' },
    { id: 'JC-20261124-021', sectionId: 'sec2', lab: '二工区实验室', category: '混凝土', sample: 'C50 预应力箱梁试块', item: '7日弹性模量', time: '11-24 13:50', result: '合格', reportState: '已出具', retestState: '正常', measured: '3.52×10⁴ MPa', limit: '≥ 3.45×10⁴ MPa', machine: 'WAW-1000B 万能试验机', hash: '2A7F...90B3' },
    { id: 'JC-20261124-019', sectionId: 'sec1', lab: '一工区实验室', category: '路基路面', sample: '路基填土', item: '击实试验最大干密度', time: '11-24 11:15', result: '合格', reportState: '已出具', retestState: '正常', measured: '2.14 g/cm³', limit: '设计基准 2.10', machine: 'JDS-3 自动电动击实仪', hash: '8F33...2E11' },
    { id: 'JC-20261124-012', sectionId: 'sec3', lab: '三工区实验室', category: '混合料', sample: 'AC-20C 沥青混合料', item: '油石比抽提检验', time: '11-24 09:40', result: '合格', reportState: '已出具', retestState: '正常', measured: '4.62%', limit: '4.5%~4.9%', machine: '自动离心式沥青抽提仪', hash: '1C5D...88A2' },
    { id: 'JC-20261123-031', sectionId: 'sec5', lab: '五工区实验室', category: '路基路面', sample: '水稳基层芯样', item: '抗压强度与完整性', time: '11-23 16:08', result: '合格', reportState: '已出具', retestState: '正常', measured: '芯样完整 4.9 MPa', limit: '≥ 4.0 MPa', machine: 'YAW-2000 压力试验机', hash: '5A20...41F8' },
    { id: 'JC-20261123-028', sectionId: 'sec4', lab: '四工区实验室', category: '其他', sample: '桥梁伸缩缝止水带', item: '拉伸强度与扯断伸长率', time: '11-23 14:15', result: '合格', reportState: '已出具', retestState: '正常', measured: '16.2 MPa / 440%', limit: '≥ 14 MPa / ≥ 380%', machine: 'WDW-50 电子拉力机', hash: '7D18...66C0' },
    { id: 'JC-20261123-022', sectionId: 'sec6', lab: '六工区实验室', category: '原材料', sample: '机制砂（中砂）', item: '含泥量及细度模数', time: '11-23 10:30', result: '合格', reportState: '已出具', retestState: '正常', measured: '1.8% / 2.65', limit: '≤ 3.0% / 2.3~3.0', machine: '标准振筛机', hash: '0E91...3B77' }
  ];

  const mixingRecords = [
    {
      id: 'BH-20261125-062', sectionId: 'sec2', section: '二工区', station: '二号拌合站', type: '水泥稳定碎石', mixCode: 'WS-05', volume: 168.0, time: '11-25 10:21',
      judge: '预警', alertTitle: '二号拌合站 · 含水率超限', handled: false, temp: '18 ℃', deviation: '+0.9%',
      materials: [
        { name: '水泥 P·O 42.5', target: 4.5, actual: 4.52, unit: '%' },
        { name: '10-20mm碎石', target: 38.0, actual: 37.8, unit: '%' },
        { name: '5-10mm碎石', target: 26.0, actual: 26.1, unit: '%' },
        { name: '0-5mm石屑', target: 31.5, actual: 31.6, unit: '%' },
        { name: '拌合水', target: 4.8, actual: 5.7, unit: '%' }
      ]
    },
    {
      id: 'BH-20261125-061', sectionId: 'sec1', section: '一工区', station: '一号拌合站', type: '水泥混凝土', mixCode: 'C40', volume: 148.0, time: '11-25 10:16',
      judge: '合格', alertTitle: '', handled: true, temp: '21 ℃', deviation: '±0.3%',
      materials: [
        { name: '水泥', target: 395, actual: 396, unit: 'kg/m³' },
        { name: '粉煤灰', target: 65, actual: 65, unit: 'kg/m³' },
        { name: '碎石', target: 1090, actual: 1093, unit: 'kg/m³' },
        { name: '中砂', target: 715, actual: 713, unit: 'kg/m³' },
        { name: '拌合水', target: 158, actual: 157, unit: 'kg/m³' }
      ]
    },
    {
      id: 'BH-20261125-060', sectionId: 'sec4', section: '四工区', station: '四号拌合站', type: '沥青混合料', mixCode: 'AC-20', volume: 126.5, time: '11-25 10:08',
      judge: '预警', alertTitle: '四号拌合站 · 出料温度偏低', handled: false, temp: '141 ℃', deviation: '-9 ℃',
      materials: [
        { name: 'SBS 改性沥青', target: 4.6, actual: 4.58, unit: '%' },
        { name: '10-20mm玄武岩', target: 34.0, actual: 34.2, unit: '%' },
        { name: '5-10mm碎石', target: 28.0, actual: 27.9, unit: '%' },
        { name: '机制砂', target: 32.0, actual: 32.1, unit: '%' },
        { name: '矿粉', target: 6.0, actual: 5.8, unit: '%' }
      ]
    },
    {
      id: 'BH-20261125-059', sectionId: 'sec3', section: '三工区', station: '三号拌合站', type: '水泥混凝土', mixCode: 'C50', volume: 96.0, time: '11-25 09:55',
      judge: '合格', alertTitle: '', handled: true, temp: '22 ℃', deviation: '±0.4%',
      materials: [
        { name: '水泥', target: 440, actual: 441, unit: 'kg/m³' },
        { name: '矿粉', target: 55, actual: 55, unit: 'kg/m³' },
        { name: '碎石', target: 1075, actual: 1078, unit: 'kg/m³' },
        { name: '中砂', target: 690, actual: 688, unit: 'kg/m³' },
        { name: '减水剂', target: 5.2, actual: 5.21, unit: 'kg/m³' }
      ]
    },
    {
      id: 'BH-20261125-058', sectionId: 'sec5', section: '五工区', station: '五号拌合站', type: '水泥稳定碎石', mixCode: 'WS-04', volume: 173.0, time: '11-25 09:37',
      judge: '合格', alertTitle: '', handled: true, temp: '17 ℃', deviation: '±0.2%',
      materials: [
        { name: '水泥 P·O 42.5', target: 4.2, actual: 4.21, unit: '%' },
        { name: '10-20mm碎石', target: 36.0, actual: 36.0, unit: '%' },
        { name: '5-10mm碎石', target: 28.0, actual: 27.9, unit: '%' },
        { name: '0-5mm石屑', target: 31.8, actual: 31.9, unit: '%' },
        { name: '拌合水', target: 4.9, actual: 4.92, unit: '%' }
      ]
    },
    {
      id: 'BH-20261124-077', sectionId: 'sec3', section: '三工区', station: '三号拌合站', type: '水泥混凝土', mixCode: 'C35', volume: 112.0, time: '11-24 16:16',
      judge: '预警', alertTitle: '三号拌合站 · 集料计量偏差', handled: true, temp: '20 ℃', deviation: '+2.3%',
      materials: [
        { name: '水泥', target: 365, actual: 366, unit: 'kg/m³' },
        { name: '碎石', target: 1120, actual: 1146, unit: 'kg/m³' },
        { name: '中砂', target: 730, actual: 728, unit: 'kg/m³' },
        { name: '拌合水', target: 162, actual: 161, unit: 'kg/m³' }
      ]
    },
    {
      id: 'BH-20261124-074', sectionId: 'sec6', section: '六工区', station: '六号拌合站', type: '水泥混凝土', mixCode: 'C40', volume: 134.0, time: '11-24 14:52',
      judge: '合格', alertTitle: '', handled: true, temp: '21 ℃', deviation: '±0.3%',
      materials: [
        { name: '水泥', target: 395, actual: 395, unit: 'kg/m³' },
        { name: '碎石', target: 1090, actual: 1089, unit: 'kg/m³' },
        { name: '中砂', target: 715, actual: 717, unit: 'kg/m³' },
        { name: '拌合水', target: 158, actual: 158, unit: 'kg/m³' }
      ]
    },
    {
      id: 'BH-20261124-070', sectionId: 'sec2', section: '二工区', station: '二号拌合站', type: '水泥混凝土', mixCode: 'C50', volume: 156.0, time: '11-24 11:08',
      judge: '合格', alertTitle: '', handled: true, temp: '22 ℃', deviation: '±0.2%',
      materials: [
        { name: '水泥', target: 440, actual: 440, unit: 'kg/m³' },
        { name: '碎石', target: 1075, actual: 1076, unit: 'kg/m³' },
        { name: '中砂', target: 690, actual: 691, unit: 'kg/m³' },
        { name: '拌合水', target: 152, actual: 152, unit: 'kg/m³' }
      ]
    },
    {
      id: 'BH-20261124-068', sectionId: 'sec1', section: '一工区', station: '一号拌合站', type: '沥青混合料', mixCode: 'SMA-13', volume: 118.5, time: '11-24 09:44',
      judge: '合格', alertTitle: '', handled: true, temp: '174 ℃', deviation: '±0.2%',
      materials: [
        { name: '改性沥青', target: 6.1, actual: 6.11, unit: '%' },
        { name: '玄武岩集料', target: 83.6, actual: 83.5, unit: '%' },
        { name: '矿粉', target: 10.0, actual: 10.1, unit: '%' },
        { name: '木质素纤维', target: 0.3, actual: 0.3, unit: '%' }
      ]
    },
    {
      id: 'BH-20261123-085', sectionId: 'sec6', section: '六工区', station: '六号拌合站', type: '水泥稳定碎石', mixCode: 'WS-05', volume: 162.0, time: '11-23 15:20',
      judge: '合格', alertTitle: '', handled: true, temp: '18 ℃', deviation: '±0.3%',
      materials: [
        { name: '水泥 P·O 42.5', target: 4.5, actual: 4.49, unit: '%' },
        { name: '碎石', target: 64.0, actual: 64.2, unit: '%' },
        { name: '石屑', target: 31.5, actual: 31.3, unit: '%' },
        { name: '拌合水', target: 4.8, actual: 4.82, unit: '%' }
      ]
    }
  ];

  const pavementRecords = [
    { id: 'PM-01', sectionId: 'sec1', section: '一工区', dir: '左幅（明水→北安）', stake: 'K15+220 ~ K15+860', layer: '上面层', temp: 156, passes: 8, compaction: 98.9, thickness: 4.1, designThick: 4.0, judge: '合格', verified: true, time: '11-25 10:30' },
    { id: 'PM-02', sectionId: 'sec4', section: '四工区', dir: '右幅（北安→明水）', stake: 'K48+200 ~ K49+020', layer: '中面层', temp: 151, passes: 8, compaction: 98.6, thickness: 5.1, designThick: 6.0, judge: '厚度预警', alertTitle: '四工区 · 中面层厚度偏小', verified: false, time: '11-25 10:24' },
    { id: 'PM-03', sectionId: 'sec2', section: '二工区', dir: '左幅（明水→北安）', stake: 'K26+740 ~ K27+480', layer: '下面层', temp: 149, passes: 9, compaction: 99.1, thickness: 8.0, designThick: 8.0, judge: '合格', verified: true, time: '11-25 09:58' },
    { id: 'PM-04', sectionId: 'sec3', section: '三工区', dir: '左幅（明水→北安）', stake: 'K35+100 ~ K35+760', layer: '中面层', temp: 146, passes: 7, compaction: 97.0, thickness: 6.0, designThick: 6.0, judge: '压实预警', alertTitle: '三工区 · 压实度不足', verified: false, time: '11-25 09:36' },
    { id: 'PM-05', sectionId: 'sec6', section: '六工区', dir: '右幅（北安→明水）', stake: 'K71+040 ~ K71+680', layer: '上面层', temp: 155, passes: 8, compaction: 98.8, thickness: 4.0, designThick: 4.0, judge: '合格', verified: true, time: '11-25 09:12' },
    { id: 'PM-06', sectionId: 'sec5', section: '五工区', dir: '左幅（明水→北安）', stake: 'K61+480 ~ K61+960', layer: '中面层', temp: 138, passes: 8, compaction: 98.4, thickness: 6.0, designThick: 6.0, judge: '温度预警', alertTitle: '五工区 · 摊铺温度偏低', verified: true, time: '11-24 15:42' },
    { id: 'PM-07', sectionId: 'sec1', section: '一工区', dir: '右幅（北安→明水）', stake: 'K10+400 ~ K11+150', layer: '中面层', temp: 153, passes: 8, compaction: 99.0, thickness: 6.1, designThick: 6.0, judge: '合格', verified: true, time: '11-24 14:18' },
    { id: 'PM-08', sectionId: 'sec2', section: '二工区', dir: '右幅（北安→明水）', stake: 'K30+120 ~ K30+880', layer: '上面层', temp: 157, passes: 9, compaction: 99.2, thickness: 4.0, designThick: 4.0, judge: '合格', verified: true, time: '11-24 11:05' },
    { id: 'PM-09', sectionId: 'sec3', section: '三工区', dir: '右幅（北安→明水）', stake: 'K52+600 ~ K53+420', layer: '下面层', temp: 148, passes: 8, compaction: 98.7, thickness: 8.1, designThick: 8.0, judge: '合格', verified: true, time: '11-23 16:40' },
    { id: 'PM-10', sectionId: 'sec5', section: '五工区', dir: '右幅（北安→明水）', stake: 'K102+200 ~ K103+050', layer: '上面层', temp: 154, passes: 8, compaction: 98.9, thickness: 4.1, designThick: 4.0, judge: '合格', verified: true, time: '11-23 14:25' },
    { id: 'PM-11', sectionId: 'sec4', section: '四工区', dir: '左幅（明水→北安）', stake: 'K78+100 ~ K78+940', layer: '下面层', temp: 150, passes: 8, compaction: 98.8, thickness: 7.9, designThick: 8.0, judge: '合格', verified: true, time: '11-22 15:10' },
    { id: 'PM-12', sectionId: 'sec6', section: '六工区', dir: '左幅（明水→北安）', stake: 'K129+300 ~ K130+120', layer: '水稳基层', temp: 19, passes: 6, compaction: 98.5, thickness: 18.0, designThick: 18.0, judge: '合格', verified: true, time: '11-22 10:50' }
  ];

  const beamRecords = [
    { id: 'YL-30-0640', sectionId: 'sec1', yard: '一号梁场', type: '30 m 箱梁', castDate: '2026-11-25', curing: '养护中', tension: '待张拉', grout: '待压浆', inspect: '待检', pedestal: 'A-12 台座', alertTitle: '', statusState: 'producing', temp: '46.2 ℃', humidity: '94%', elongation: '—', groutPressure: '—' },
    { id: 'YL-40-0639', sectionId: 'sec2', yard: '二号梁场', type: '40 m 箱梁', castDate: '2026-11-25', curing: '养护中', tension: '待张拉', grout: '待压浆', inspect: '待检', pedestal: 'B-08 台座', alertTitle: '二号梁场 · 养护温度超限', alertState: '跟踪中', alertTime: '11-25 09:28', statusState: 'producing', temp: '61.5 ℃', humidity: '91%', elongation: '—', groutPressure: '—' },
    { id: 'YL-30-0592', sectionId: 'sec3', yard: '一号梁场', type: '30 m 箱梁', castDate: '2026-11-21', curing: '已完成', tension: '待复检', grout: '待压浆', inspect: '待检', pedestal: 'A-05 台座', alertTitle: '一号梁场 · 张拉伸长量偏差', alertState: '待复检', alertTime: '11-25 10:09', statusState: 'producing', temp: '45.0 ℃', humidity: '95%', elongation: '+6.8% (限±6%)', groutPressure: '—' },
    { id: 'YL-30-0581', sectionId: 'sec4', yard: '二号梁场', type: '30 m 箱梁', castDate: '2026-11-20', curing: '已完成', tension: '合格', grout: '压浆中', inspect: '待检', pedestal: 'B-03 台座', alertTitle: '', statusState: 'producing', temp: '44.8 ℃', humidity: '96%', elongation: '+1.8%', groutPressure: '0.58 MPa' },
    { id: 'YL-20-0568', sectionId: 'sec1', yard: '一号梁场', type: '20 m 空心板梁', castDate: '2026-11-20', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'C-04 台座', alertTitle: '', statusState: 'inspected', temp: '44.5 ℃', humidity: '95%', elongation: '+1.2%', groutPressure: '0.62 MPa' },
    { id: 'YL-30-0572', sectionId: 'sec3', yard: '一号梁场', type: '30 m 箱梁', castDate: '2026-11-19', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'A-09 台座', alertTitle: '一号梁场 · 压浆压力异常', alertState: '已处理', alertTime: '11-24 14:20', statusState: 'inspected', temp: '45.1 ℃', humidity: '95%', elongation: '+1.5%', groutPressure: '0.61 MPa' },
    { id: 'YL-40-0560', sectionId: 'sec2', yard: '二号梁场', type: '40 m 箱梁', castDate: '2026-11-18', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'B-11 台座', alertTitle: '', statusState: 'inspected', temp: '45.6 ℃', humidity: '94%', elongation: '+2.0%', groutPressure: '0.63 MPa' },
    { id: 'YL-30-0554', sectionId: 'sec5', yard: '一号梁场', type: '30 m 箱梁', castDate: '2026-11-18', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'A-02 台座', alertTitle: '', statusState: 'inspected', temp: '44.2 ℃', humidity: '95%', elongation: '+1.1%', groutPressure: '0.60 MPa' },
    { id: 'YL-40-0548', sectionId: 'sec6', yard: '二号梁场', type: '40 m 箱梁', castDate: '2026-11-17', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'B-06 台座', alertTitle: '', statusState: 'inspected', temp: '45.3 ℃', humidity: '96%', elongation: '+1.7%', groutPressure: '0.64 MPa' },
    { id: 'YL-20-0541', sectionId: 'sec5', yard: '一号梁场', type: '20 m 空心板梁', castDate: '2026-11-16', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'C-01 台座', alertTitle: '', statusState: 'inspected', temp: '44.0 ℃', humidity: '95%', elongation: '+0.9%', groutPressure: '0.61 MPa' }
  ];

  // Exact 12 quality issues matching 01_质量总览.png & 06_质量问题与整改.png:
  // By section: sec1=1, sec2=3, sec3=2, sec4=3, sec5=2, sec6=1 (sum=12)
  // By type: 原材料质量=4, 施工工艺=3, 检测异常=2, 构件质量=2, 其他=1 (sum=12)
  // By status: 已整改=11, 整改中=1, 已超期=0
  const qualityIssues = [
    { id: 'ZL-202611-012', sectionId: 'sec3', section: '三工区', type: '构件质量', title: '预制箱梁外观质量', desc: '预制箱梁局部蜂窝麻面', unit: '三工区项目部', foundAt: '2026-11-24 14:10', deadline: '2026-11-27', status: '整改中', daysUsed: null, measure: '采用高标号聚合物修补砂浆凿毛清理分层修补，安排监理现场旁站复验。' },
    { id: 'ZL-202611-011', sectionId: 'sec2', section: '二工区', type: '施工工艺', title: '水稳混合料含水率超限', desc: '水稳混合料含水率超限', unit: '二工区项目部', foundAt: '2026-11-24 09:20', deadline: '2026-11-25', status: '已整改', daysUsed: 1.4, measure: '已暂停供料并校准冷料仓湿度补偿系数，重新取样测定含水率 4.9% 合格。' },
    { id: 'ZL-202611-010', sectionId: 'sec4', section: '四工区', type: '施工工艺', title: '沥青中面层实测厚度偏小', desc: '沥青中面层实测厚度偏小', unit: '四工区项目部', foundAt: '2026-11-23 11:05', deadline: '2026-11-24', status: '已整改', daysUsed: 1.8, measure: '校核摊铺机找平传感器基准线，对 K48+200~K49+020 路段完成微表处补强复测。' },
    { id: 'ZL-202611-009', sectionId: 'sec1', section: '一工区', type: '检测异常', title: '混凝土试件抗压强度异常', desc: '混凝土试件抗压强度异常', unit: '一工区项目部', foundAt: '2026-11-21 15:40', deadline: '2026-11-23', status: '已整改', daysUsed: 2.1, measure: '经现场回弹及钻芯取样复核，实体结构强度达到设计值 112%，系单组试模振捣偏差所致。' },
    { id: 'ZL-202611-008', sectionId: 'sec5', section: '五工区', type: '原材料质量', title: '粗集料针片状含量超限', desc: '粗集料针片状含量超限', unit: '五工区项目部', foundAt: '2026-11-20 10:15', deadline: '2026-11-22', status: '已整改', daysUsed: 2.0, measure: '不合格批次 85 吨清退出场，料源厂更换整形破碎机筛网后抽检 11.2% 合格。' },
    { id: 'ZL-202611-007', sectionId: 'sec2', section: '二工区', type: '原材料质量', title: '细集料含泥量轻微偏高', desc: '机制砂含泥量实测 3.4% 超内控指标', unit: '二工区项目部', foundAt: '2026-11-18 16:30', deadline: '2026-11-20', status: '已整改', daysUsed: 2.3, measure: '启用水洗砂二次冲洗工艺并覆盖防尘网，复检含泥量降至 1.9%。' },
    { id: 'ZL-202611-006', sectionId: 'sec4', section: '四工区', type: '检测异常', title: '沥青马歇尔稳定度波动', desc: '局部试件稳定度实测 7.6 kN 偏低', unit: '四工区项目部', foundAt: '2026-11-16 14:00', deadline: '2026-11-19', status: '已整改', daysUsed: 2.6, measure: '调整沥青加热温度至 162℃ 并复配矿粉比例，平行复测稳定度 9.2 kN 合格。' },
    { id: 'ZL-202611-005', sectionId: 'sec3', section: '三工区', type: '原材料质量', title: '散装水泥进场留样复核', desc: '3#罐水泥安定性临近内控上限', unit: '三工区项目部', foundAt: '2026-11-14 09:50', deadline: '2026-11-17', status: '已整改', daysUsed: 2.5, measure: '封存该罐 24 小时后二次沸煮复检合格，监理签认恢复使用。' },
    { id: 'ZL-202611-004', sectionId: 'sec2', section: '二工区', type: '构件质量', title: '预制箱梁端模接缝错台', desc: '30m 箱梁端头局部错台 3.5mm', unit: '二工区项目部', foundAt: '2026-11-11 11:20', deadline: '2026-11-14', status: '已整改', daysUsed: 2.4, measure: '机械打磨平滑并更换端模高强螺栓及橡胶止浆条，后续浇筑未再发生。' },
    { id: 'ZL-202611-003', sectionId: 'sec4', section: '四工区', type: '施工工艺', title: '盖梁钢筋保护层垫块不足', desc: '局部侧模垫块间距大于 1.0m', unit: '四工区项目部', foundAt: '2026-11-08 15:10', deadline: '2026-11-10', status: '已整改', daysUsed: 2.2, measure: '已补齐高强梅花形塑料垫块，钢筋保护层厚度实测合格率 98%。' },
    { id: 'ZL-202611-002', sectionId: 'sec5', section: '五工区', type: '原材料质量', title: '外加剂减水率批次偏差', desc: '聚羧酸减水剂固含量偏差 0.6%', unit: '五工区项目部', foundAt: '2026-11-05 10:40', deadline: '2026-11-08', status: '已整改', daysUsed: 2.9, measure: '协调供应商补发合格批次并完成拌合站外加剂储罐清洗。' },
    { id: 'ZL-202611-001', sectionId: 'sec6', section: '六工区', type: '其他', title: '寒区冬季施工保温棚温控记录缺失', desc: '夜间 02:00 养生棚自动记录断点', unit: '六工区项目部', foundAt: '2026-11-02 08:30', deadline: '2026-11-05', status: '已整改', daysUsed: 2.8, measure: '更换无线 LoRa 温湿度探头并配置 UPS 备用电源，数据连续上传正常。' }
  ];

  /* ------------------------------------------------------------------------
     PERSISTENT MODULE UI STATE (Preserved across render() calls)
     ------------------------------------------------------------------------ */
  const uiState = {
    overview: { category: '', period: '2026年11月', quickFilter: '全部', page: 1 },
    lab: { labName: '', category: '', period: '2026年11月', quickFilter: '全部', page: 1 },
    mixing: { station: '', prodType: '', period: '2026年11月', quickFilter: '全部', page: 1 },
    pavement: { direction: '', layer: '', period: '2026年11月', quickFilter: '全部', page: 1 },
    beamYard: { yard: '', beamType: '', period: '2026年11月', quickFilter: '全部', page: 1 },
    issues: { issueType: '', status: '', period: '2026年11月', quickFilter: '全部', page: 1 }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'overview';
  let lastRenderedSecId = null;

  /* ------------------------------------------------------------------------
     SCOPED STYLES (<style id="m03-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m03-styles')) return;
    const style = document.createElement('style');
    style.id = 'm03-styles';
    style.textContent = `
      .m03-page {
        padding: 10px 18px 14px;
        display: flex;
        flex-direction: column;
        gap: 9px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }

      /* Filter Toolbar */
      .m03-filter-panel {
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m03-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m03-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m03-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m03-select {
        min-width: 132px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m03-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m03-btn-query {
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
        gap: 6px;
        box-shadow: 0 0 14px rgba(22, 119, 255, 0.45);
        transition: all 0.18s ease;
      }
      .m03-btn-query:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m03-btn-outline {
        height: 32px;
        padding: 0 13px;
      }

      /* Panel Header Adjustments */
      .m03-panel-header {
        cursor: default;
        padding: 8px 14px;
      }
      .m03-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m03-period-tag {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 4px;
      }

      /* 6-Card KPI Grid */
      .m03-kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        padding: 8px 14px 10px;
      }
      .m03-kpi-card {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 9px 12px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m03-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        transform: translateY(-1px);
      }
      .m03-kpi-icon {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.22);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38f2ff;
      }
      .m03-kpi-icon.tone-green {
        background: rgba(22, 163, 74, 0.18);
        border-color: rgba(74, 222, 128, 0.38);
        color: #4ade80;
      }
      .m03-kpi-icon.tone-gold {
        background: rgba(234, 179, 8, 0.18);
        border-color: rgba(250, 204, 21, 0.42);
        color: #facc15;
      }
      .m03-kpi-icon.tone-blue {
        background: rgba(37, 99, 235, 0.24);
        border-color: rgba(96, 165, 250, 0.42);
        color: #60a5fa;
      }
      .m03-kpi-meta {
        min-width: 0;
        flex: 1;
      }
      .m03-kpi-label {
        font-size: 11.5px;
        color: #a9c6e8;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m03-kpi-val-row {
        display: flex;
        align-items: baseline;
        gap: 3px;
      }
      .m03-kpi-val {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0.3px;
        font-variant-numeric: tabular-nums;
        color: #38f2ff;
        text-shadow: 0 0 12px rgba(56, 242, 255, 0.35);
      }
      .m03-kpi-val.tone-green { color: #4ade80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.35); }
      .m03-kpi-val.tone-gold { color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
      .m03-kpi-val.tone-blue { color: #60a5fa; text-shadow: 0 0 12px rgba(96, 165, 250, 0.35); }
      .m03-kpi-unit {
        font-size: 12px;
        color: #d6e8ff;
        font-weight: 500;
      }

      /* 3-Column Charts Row */
      .m03-charts-row {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .m03-chart-body {
        padding: 8px 14px 10px;
        min-height: 168px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .m03-chart-svg {
        width: 100%;
        height: 154px;
        display: block;
      }
      .m03-bar-col {
        cursor: pointer;
        transition: opacity 0.18s;
      }
      .m03-bar-col:hover {
        opacity: 0.9;
      }

      /* Donut & Ring Legend */
      .m03-donut-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 14px;
      }
      .m03-donut-svg {
        width: 150px;
        height: 150px;
        flex-shrink: 0;
      }
      .m03-legend-list {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m03-legend-row {
        display: grid;
        grid-template-columns: auto 1fr auto auto;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        padding: 2px 4px;
        border-radius: 5px;
        cursor: pointer;
        transition: background 0.15s;
      }
      .m03-legend-row:hover {
        background: rgba(56, 189, 248, 0.12);
      }
      .m03-legend-dot {
        width: 7px;
        height: 7px;
        border-radius: 50%;
      }
      .m03-legend-name {
        color: #dbeafe;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m03-legend-count {
        color: #ffffff;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .m03-legend-pct {
        color: #94b8de;
        font-variant-numeric: tabular-nums;
        min-width: 40px;
        text-align: right;
      }

      /* Ring Progress Legend */
      .m03-ring-rows {
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 11px;
      }
      .m03-ring-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 6px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.12);
        font-size: 12.5px;
      }
      .m03-ring-row:last-child {
        border-bottom: none;
        padding-bottom: 0;
      }
      .m03-ring-key {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #d6e8ff;
      }
      .m03-ring-val {
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }

      /* Horizontal Process Bars (智慧梁场) */
      .m03-proc-bars {
        width: 100%;
        display: flex;
        flex-direction: column;
        gap: 18px;
        padding: 6px 2px;
      }
      .m03-proc-top {
        display: flex;
        justify-content: space-between;
        align-items: baseline;
        margin-bottom: 6px;
        font-size: 13px;
      }
      .m03-proc-name { color: #dbeafe; font-weight: 500; }
      .m03-proc-val { color: #38f2ff; font-weight: 800; font-size: 14px; font-variant-numeric: tabular-nums; }
      .m03-proc-track {
        height: 8px;
        border-radius: 99px;
        background: rgba(12, 42, 92, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.22);
        overflow: hidden;
      }
      .m03-proc-fill {
        height: 100%;
        border-radius: 99px;
        transition: width 0.45s ease;
      }

      /* Bottom Split Row */
      .m03-bottom-row {
        display: grid;
        grid-template-columns: minmax(0, 2.15fr) minmax(310px, 0.85fr);
        gap: 10px;
        flex: 1;
      }
      .m03-quick-pills {
        display: flex;
        align-items: center;
        gap: 6px;
        flex-wrap: wrap;
      }
      .m03-qpill {
        padding: 3px 11px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(10, 34, 78, 0.65);
        color: #cfe4ff;
        font-size: 11.5px;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.16s;
      }
      .m03-qpill:hover {
        border-color: var(--cyan);
        color: #ffffff;
      }
      .m03-qpill.active {
        background: linear-gradient(180deg, #1b88ff, #0c5fd4);
        border-color: #7dd3fc;
        color: #ffffff;
        box-shadow: 0 0 10px rgba(27, 136, 255, 0.5);
      }

      /* Table Styling */
      .m03-table-wrap {
        padding: 0 14px 6px;
        overflow-x: auto;
      }
      .m03-table th {
        font-size: 12px;
        font-weight: 600;
        color: #93c5fd;
        background: rgba(12, 42, 92, 0.55);
        padding: 8px 10px;
        white-space: nowrap;
      }
      .m03-table td {
        padding: 7.5px 10px;
        font-size: 12.5px;
        color: #e6f2ff;
        white-space: nowrap;
      }
      .m03-table tbody tr:hover {
        background: rgba(20, 74, 152, 0.25);
      }
      .m03-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        min-width: 52px;
      }
      .m03-tag.ok { background: rgba(34, 197, 94, 0.16); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.45); }
      .m03-tag.fail { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.48); }
      .m03-tag.warn { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.48); }
      .m03-tag.info { background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.48); }
      .m03-tag.muted { background: rgba(100, 116, 139, 0.2); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.35); }

      .m03-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 4px;
        transition: color 0.16s, text-shadow 0.16s;
      }
      .m03-link-btn:hover {
        color: #ffffff;
        text-shadow: 0 0 8px rgba(56, 242, 255, 0.8);
      }

      /* Pagination */
      .m03-pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        padding: 6px 14px 10px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m03-page-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(10, 32, 74, 0.65);
        color: #cfe4ff;
        font-size: 11.5px;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.15s;
      }
      .m03-page-btn:hover:not(:disabled) {
        border-color: var(--cyan);
        color: #ffffff;
      }
      .m03-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0c5fd4);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m03-page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Right Side Alert / Station Cards */
      .m03-side-panel {
        display: flex;
        flex-direction: column;
      }
      .m03-side-body {
        padding: 8px 14px 10px;
        flex: 1;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 8px;
      }
      .m03-side-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m03-side-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(13, 44, 96, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m03-side-card:hover {
        background: rgba(18, 62, 132, 0.72);
        border-color: rgba(56, 220, 255, 0.6);
      }
      .m03-side-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m03-side-ico {
        width: 32px;
        height: 32px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.24);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38f2ff;
      }
      .m03-side-ico.warn {
        background: rgba(234, 179, 8, 0.18);
        border-color: rgba(250, 204, 21, 0.45);
        color: #facc15;
      }
      .m03-side-title {
        font-size: 13px;
        font-weight: 700;
        color: #f1f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m03-side-sub {
        font-size: 11.5px;
        color: #93b8de;
        margin-top: 2px;
        font-variant-numeric: tabular-nums;
      }
      .m03-side-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        padding: 8px 148px 0 0;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 11.5px;
        color: #93b8de;
      }
      .m03-side-footer > span,
      .m03-side-footer .m03-link-btn {
        white-space: nowrap;
        flex-shrink: 0;
      }

      /* Pending Issue Detail Card (Subpage 6 Right) */
      .m03-pending-card {
        padding: 13px 14px;
        border-radius: 9px;
        background: rgba(13, 44, 96, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m03-pending-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .m03-pending-code {
        color: #38f2ff;
        font-weight: 700;
        font-size: 13px;
        font-variant-numeric: tabular-nums;
      }
      .m03-pending-title {
        font-size: 15px;
        font-weight: 700;
        color: #ffffff;
      }
      .m03-pending-desc {
        font-size: 12.5px;
        color: #a9c6e8;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m03-pending-kv {
        display: flex;
        justify-content: space-between;
        font-size: 12.5px;
      }
      .m03-pending-k { color: #93b8de; }
      .m03-pending-v { color: #ffffff; font-weight: 600; font-variant-numeric: tabular-nums; }

      /* Modal Helpers */
      .m03-modal-section-title {
        font-size: 13px;
        font-weight: 700;
        color: #7dd3fc;
        margin-bottom: 4px;
      }
      .m03-modal-form {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(12, 40, 88, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m03-modal-textarea {
        width: 100%;
        min-height: 68px;
        padding: 8px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(6, 22, 54, 0.86);
        color: #ffffff;
        font-size: 12.5px;
        font-family: inherit;
        resize: vertical;
        outline: none;
      }
      .m03-modal-textarea:focus {
        border-color: var(--cyan-bright);
      }
      .m03-stepper {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 8px;
      }
      .m03-step-box {
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(14, 46, 98, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.26);
        text-align: center;
      }
      .m03-step-box.done { border-color: rgba(74, 222, 128, 0.5); }
      .m03-step-box.warn { border-color: rgba(250, 204, 21, 0.6); }

      @media (max-width: 1360px) {
        .m03-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m03-charts-row { grid-template-columns: 1fr; }
        .m03-bottom-row { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     PURE SVG CHART GENERATORS (Zero external chart libraries)
     ------------------------------------------------------------------------ */
  function renderBarChartSvg(opts) {
    const { idPrefix, items, minY, maxY, ticks, valueFormatter, activeSecId } = opts;
    const W = 440;
    const H = 170;
    const padL = 42;
    const padR = 12;
    const padT = 20;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const step = plotW / Math.max(1, items.length);
    const barW = Math.min(34, step * 0.52);

    const yFor = val => {
      const ratio = Math.max(0, Math.min(1, (val - minY) / Math.max(0.0001, maxY - minY)));
      return padT + plotH * (1 - ratio);
    };

    const gridSvg = ticks.map(t => {
      const y = yFor(t.val).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(56,189,248,0.14)" stroke-width="1"/>
        <text x="${padL - 7}" y="${Number(y) + 4}" text-anchor="end" fill="#89aed6" font-size="10.5">${t.label}</text>
      `;
    }).join('');

    const barsSvg = items.map((item, idx) => {
      const cx = padL + step * (idx + 0.5);
      const x = cx - barW / 2;
      const rawY = yFor(item.value);
      const h = item.value > 0 ? Math.max(4, padT + plotH - rawY) : 0;
      const y = padT + plotH - h;
      const isHighlighted = !activeSecId || item.secId === activeSecId;
      const opacity = isHighlighted ? 1 : 0.35;
      const fillId = (activeSecId && item.secId === activeSecId)
        ? `url(#m03-bar-active-${idPrefix})`
        : `url(#m03-bar-grad-${idPrefix})`;

      return `
        <g class="m03-bar-col" opacity="${opacity}" ${item.secId ? `data-sec-pick="${item.secId}"` : ''}>
          ${h > 0 ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${fillId}"/>` : ''}
          <text x="${cx.toFixed(1)}" y="${(y - 5).toFixed(1)}" text-anchor="middle" fill="#f1f7ff" font-size="11" font-weight="700">${valueFormatter(item.value)}</text>
          <text x="${cx.toFixed(1)}" y="${H - 7}" text-anchor="middle" fill="${isHighlighted ? '#cfe4ff' : '#6c8eb5'}" font-size="11">${item.label}</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="m03-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="m03-bar-grad-${idPrefix}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38f2ff"/>
            <stop offset="55%" stop-color="#0ea5e9"/>
            <stop offset="100%" stop-color="#1d4ed8" stop-opacity="0.88"/>
          </linearGradient>
          <linearGradient id="m03-bar-active-${idPrefix}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#fde047"/>
            <stop offset="55%" stop-color="#38f2ff"/>
            <stop offset="100%" stop-color="#0284c7"/>
          </linearGradient>
        </defs>
        ${gridSvg}
        ${barsSvg}
      </svg>
    `;
  }

  function renderDonutChartSvg(opts) {
    const { segments, centerVal, centerUnit, centerSub, filterKey } = opts;
    const total = Math.max(1, segments.reduce((s, item) => s + item.count, 0));
    const R = 54;
    const C = 2 * Math.PI * R;
    let offset = 0;

    const arcs = segments.map(seg => {
      const len = (seg.count / total) * C;
      const gap = segments.length > 1 && len > 4 ? 3 : 0;
      const drawLen = Math.max(0, len - gap);
      const el = `<circle cx="75" cy="75" r="${R}" fill="none" stroke="${seg.color}" stroke-width="15"
        stroke-dasharray="${drawLen.toFixed(2)} ${(C - drawLen).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 75 75)"
        style="cursor:pointer;" ${filterKey ? `data-donut-filter="${seg.filterVal || seg.name}"` : ''}/>`;
      offset += len;
      return el;
    }).join('');

    const legendHtml = segments.map(seg => {
      const pct = ((seg.count / total) * 100).toFixed(1);
      return `
        <div class="m03-legend-row" ${filterKey ? `data-donut-filter="${seg.filterVal || seg.name}"` : ''}>
          <span class="m03-legend-dot" style="background:${seg.color};box-shadow:0 0 6px ${seg.color};"></span>
          <span class="m03-legend-name">${seg.name}</span>
          <span class="m03-legend-count">${seg.count.toLocaleString('en-US')}</span>
          <span class="m03-legend-pct">${pct}%</span>
        </div>
      `;
    }).join('');

    return `
      <div class="m03-donut-wrap">
        <svg class="m03-donut-svg" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="${R}" fill="none" stroke="rgba(148,197,255,0.12)" stroke-width="15"/>
          ${arcs}
          <text x="75" y="73" text-anchor="middle" fill="#ffffff" font-size="20" font-weight="800" pointer-events="none">${centerVal}<tspan font-size="11.5" font-weight="500" dx="2">${centerUnit}</tspan></text>
          <text x="75" y="92" text-anchor="middle" fill="#a9c6e8" font-size="11" pointer-events="none">${centerSub}</text>
        </svg>
        <div class="m03-legend-list">${legendHtml}</div>
      </div>
    `;
  }

  function renderRingGaugeSvg(opts) {
    const { idPrefix, pct, subLabel, rows } = opts;
    const R = 52;
    const C = 2 * Math.PI * R;
    const clamped = Math.max(0, Math.min(100, pct));
    const fillLen = (clamped / 100) * C;

    const rowsHtml = rows.map(r => `
      <div class="m03-ring-row">
        <span class="m03-ring-key">
          ${r.dotColor ? `<span class="m03-legend-dot" style="background:${r.dotColor};box-shadow:0 0 6px ${r.dotColor};"></span>` : ''}
          <span>${r.label}</span>
        </span>
        <span class="m03-ring-val" style="color:${r.valColor || '#ffffff'};">${r.value}</span>
      </div>
    `).join('');

    return `
      <div class="m03-donut-wrap">
        <svg class="m03-donut-svg" viewBox="0 0 150 150">
          <defs>
            <linearGradient id="m03-ring-${idPrefix}" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stop-color="#22d3ee"/>
              <stop offset="55%" stop-color="#10b981"/>
              <stop offset="100%" stop-color="#34d399"/>
            </linearGradient>
          </defs>
          <circle cx="75" cy="75" r="${R}" fill="none" stroke="rgba(56,189,248,0.16)" stroke-width="12"/>
          <circle cx="75" cy="75" r="${R}" fill="none" stroke="url(#m03-ring-${idPrefix})" stroke-width="12"
            stroke-linecap="round"
            stroke-dasharray="${fillLen.toFixed(2)} ${(C - fillLen).toFixed(2)}"
            transform="rotate(-90 75 75)"/>
          <text x="75" y="72" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="800" pointer-events="none">${clamped.toFixed(1)}%</text>
          <text x="75" y="92" text-anchor="middle" fill="#a9c6e8" font-size="11" pointer-events="none">${subLabel}</text>
        </svg>
        <div class="m03-ring-rows">${rowsHtml}</div>
      </div>
    `;
  }

  function renderTrendLineSvg(opts) {
    const { idPrefix, points, minY, maxY, ticks } = opts;
    const W = 440;
    const H = 170;
    const padL = 44;
    const padR = 22;
    const padT = 22;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;

    const xFor = idx => padL + (plotW * idx) / Math.max(1, points.length - 1);
    const yFor = val => {
      const ratio = Math.max(0, Math.min(1, (val - minY) / Math.max(0.0001, maxY - minY)));
      return padT + plotH * (1 - ratio);
    };

    const gridSvg = ticks.map(t => {
      const y = yFor(t.val).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(56,189,248,0.14)" stroke-width="1"/>
        <text x="${padL - 7}" y="${Number(y) + 4}" text-anchor="end" fill="#89aed6" font-size="10.5">${t.label}</text>
      `;
    }).join('');

    const coords = points.map((p, idx) => ({ x: xFor(idx), y: yFor(p.value), label: p.label, value: p.value }));
    const polyPts = coords.map(c => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
    const areaPts = `${coords[0].x.toFixed(1)},${padT + plotH} ${polyPts} ${coords[coords.length - 1].x.toFixed(1)},${padT + plotH}`;

    const dotsSvg = coords.map(c => `
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="#38f2ff" stroke="#ffffff" stroke-width="1.6"/>
      <text x="${c.x.toFixed(1)}" y="${(c.y - 9).toFixed(1)}" text-anchor="middle" fill="#ffffff" font-size="10.5" font-weight="700">${c.value.toFixed(1)}%</text>
      <text x="${c.x.toFixed(1)}" y="${H - 7}" text-anchor="middle" fill="#a9c6e8" font-size="11">${c.label}</text>
    `).join('');

    return `
      <svg class="m03-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="m03-area-${idPrefix}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="#38f2ff" stop-opacity="0.34"/>
            <stop offset="100%" stop-color="#0ea5e9" stop-opacity="0.02"/>
          </linearGradient>
        </defs>
        ${gridSvg}
        <polygon points="${areaPts}" fill="url(#m03-area-${idPrefix})"/>
        <polyline points="${polyPts}" fill="none" stroke="#38f2ff" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>
        ${dotsSvg}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     SHARED HELPERS
     ------------------------------------------------------------------------ */
  function fmtInt(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function buildPaginationHtml(totalItems, currentPage, pageSize, totalDisplayCount) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.max(1, Math.min(totalPages, currentPage));
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(`<button class="m03-page-btn ${i === safePage ? 'active' : ''}" data-page="${i}">${i}</button>`);
    }
    const countLabel = totalDisplayCount !== undefined ? totalDisplayCount : totalItems;
    return `
      <div class="m03-pagination">
        <span>共 ${fmtInt(countLabel)} 条记录</span>
        <button class="m03-page-btn" data-page="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''}>&lt;</button>
        ${pages.join('')}
        <button class="m03-page-btn" data-page="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    `;
  }

  function renderKpiSection(title, periodLabel, cards) {
    return `
      <div class="glass-panel">
        <div class="panel-header m03-panel-header">
          <div class="panel-title-group">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">${title}</span>
            <span class="m03-period-tag">(${periodLabel})</span>
          </div>
        </div>
        <div class="m03-kpi-grid">
          ${cards.map(c => `
            <div class="m03-kpi-card">
              <div class="m03-kpi-icon ${c.tone ? 'tone-' + c.tone : ''}">${c.icon}</div>
              <div class="m03-kpi-meta">
                <div class="m03-kpi-label">${c.label}</div>
                <div class="m03-kpi-val-row">
                  <span class="m03-kpi-val ${c.tone ? 'tone-' + c.tone : ''}">${c.value}</span>
                  <span class="m03-kpi-unit">${c.unit}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderSectionSelect(activeSecId) {
    return `
      <div class="m03-field">
        <span class="m03-field-label">所属工区</span>
        <select class="glass-select m03-select" data-filter="section">
          <option value="" ${!activeSecId ? 'selected' : ''}>全部工区</option>
          ${SECTIONS.map(s => `<option value="${s.id}" ${activeSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function renderPeriodSelect(period) {
    const opts = Object.keys(PERIOD_FACTORS);
    return `
      <div class="m03-field">
        <span class="m03-field-label">统计周期</span>
        <select class="glass-select m03-select" data-filter="period">
          ${opts.map(p => `<option value="${p}" ${period === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function syncSectionToHost(secId) {
    const target = secId || null;
    if (!lastCtx) return;
    if (lastCtx.state.activeSectionId === target) return;
    if (target) {
      const pill = document.querySelector(`.section-pill[data-sec="${target}"]`);
      if (pill) { pill.click(); return; }
    } else if (lastCtx.state.activeSectionId) {
      const activePill = document.querySelector(`.section-pill[data-sec="${lastCtx.state.activeSectionId}"]`);
      if (activePill) { activePill.click(); return; }
    }
    lastCtx.state.activeSectionId = target;
    if (lastHost) renderPage(lastHost, lastSubPageId, lastCtx);
  }

  function openOriginalSystemModal(sysName, subDesc) {
    if (!lastCtx) return;
    lastCtx.openModal(`第三方业务系统接口 · ${sysName}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>对接系统名称</span><strong>${sysName}</strong></div>
        <div class="detail-stat-card"><span>链路与同步状态</span><strong style="color:#4ade80;">在线实时同步</strong></div>
        <div class="detail-stat-card"><span>最近同步时间</span><strong>2026-11-25 10:45</strong></div>
      </div>
      <p style="color:#dbeafe;line-height:1.7;">${subDesc}</p>
      <div class="m03-modal-form">
        <div class="m03-modal-section-title">数据采集通道监测</div>
        <table class="data-table">
          <thead><tr><th>工区 / 节点</th><th>采集终端</th><th>协议类型</th><th>心跳状态</th></tr></thead>
          <tbody>
            <tr><td>一工区 ~ 三工区</td><td>试验机/拌合机/摊铺传感器</td><td>MQTT + HTTPS 加密回传</td><td><span class="status-tag ok">正常 (12ms)</span></td></tr>
            <tr><td>四工区 ~ 六工区</td><td>智慧梁场张拉压浆端机</td><td>数字签名防篡改网关</td><td><span class="status-tag ok">正常 (15ms)</span></td></tr>
          </tbody>
        </table>
      </div>
    `);
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 1: 质量总览 (overview)
     ------------------------------------------------------------------------ */
  function renderOverview(ctx) {
    const st = uiState.overview;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];
    const secMeta = secId ? SECTION_METRICS[secId] : null;

    // Issue metrics derived live from qualityIssues
    const secIssues = qualityIssues.filter(i => !secId || i.sectionId === secId);
    const baseIssueCount = secIssues.length;
    const doneCount = secIssues.filter(i => i.status === '已整改').length;
    const ingCount = secIssues.filter(i => i.status === '整改中').length;
    const overCount = secIssues.filter(i => i.status === '已超期').length;
    const issueMult = st.period === '2026年11月' ? 1 : (st.period === '2026年10月' ? 1 : pf.mult);
    const dispTotalIssues = st.period === '2026年11月' ? baseIssueCount : Math.max(1, Math.round(baseIssueCount * issueMult));
    const dispDone = st.period === '2026年11月' ? doneCount : Math.max(1, Math.round(doneCount * issueMult));
    const dispIng = st.period === '2026年11月' ? ingCount : Math.max(0, dispTotalIssues - dispDone - overCount);
    const rectifyPct = dispTotalIssues > 0 ? (dispDone / dispTotalIssues) * 100 : 100;

    // Category filter factor for KPI display
    const catFactor = st.category ? 0.28 : 1;
    const rawBatches = secMeta ? secMeta.labBatches : 8436;
    const batches = Math.round(rawBatches * pf.mult * catFactor);
    const passRate = Math.min(99.9, (secMeta ? secMeta.qualityRate : 98.7) + pf.passDelta);
    const mixVol = ((secMeta ? secMeta.mixVol : 36.8) * pf.mult * (st.category === '桥梁工程' ? 0.52 : st.category ? 0.35 : 1)).toFixed(1);
    const beams = Math.round((secMeta ? secMeta.beams : 640) * pf.mult * (st.category && st.category !== '桥梁工程' ? 0.25 : 1));

    // Issue type distribution from live qualityIssues
    const typeDefs = [
      { name: '原材料质量', filterVal: '原材料', color: '#2563eb' },
      { name: '施工工艺', filterVal: '施工工艺', color: '#06b6d4' },
      { name: '检测异常', filterVal: '检测', color: '#10b981' },
      { name: '构件质量', filterVal: '构件质量', color: '#f59e0b' },
      { name: '其他', filterVal: '全部', color: '#f43f5e' }
    ];
    const donutSegs = typeDefs.map(td => {
      const cnt = secIssues.filter(i => i.type === td.name).length;
      return { name: td.name, filterVal: td.filterVal, color: td.color, count: st.period === '2026年11月' ? cnt : Math.round(cnt * issueMult) };
    }).filter(s => s.count > 0 || !secId);

    // Filtered inspection table
    const filtered = inspectionRecords.filter(r => {
      if (secId && r.sectionId !== secId) return false;
      if (st.category) {
        if (st.category === '场站工程' && !r.target.includes('拌合站') && !r.target.includes('梁场')) return false;
        if (st.category === '桥梁工程' && !r.target.includes('梁') && !r.target.includes('桥')) return false;
        if (st.category === '路面工程' && !r.target.includes('沥青') && !r.target.includes('水稳') && !r.target.includes('路面')) return false;
        if (st.category === '路基工程' && !r.target.includes('路基')) return false;
      }
      if (st.quickFilter !== '全部' && r.category !== st.quickFilter) return false;
      return true;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    const kpiHtml = renderKpiSection('质量概况', pf.label, [
      { label: '检测批次', value: fmtInt(batches), unit: '批', icon: M03_ICONS.batch },
      { label: '质量合格率', value: passRate.toFixed(1), unit: '%', icon: M03_ICONS.shieldCheck },
      { label: '拌合站生产量', value: mixVol, unit: '万m³', icon: M03_ICONS.layers },
      { label: '梁片生产数量', value: fmtInt(beams), unit: '片', icon: M03_ICONS.beam },
      { label: '质量问题', value: fmtInt(dispTotalIssues), unit: '项', icon: M03_ICONS.warn, tone: 'gold' },
      { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: M03_ICONS.checkCircle, tone: 'green' }
    ]);

    const barSvg = renderBarChartSvg({
      idPrefix: 'ov-rate',
      items: SECTIONS.map(s => ({ secId: s.id, label: s.short, value: +(SECTION_METRICS[s.id].qualityRate + pf.passDelta).toFixed(1) })),
      minY: 90,
      maxY: 100,
      ticks: [90, 92, 94, 96, 98, 100].map(v => ({ val: v, label: v + '%' })),
      valueFormatter: v => v.toFixed(1) + '%',
      activeSecId: secId
    });

    const donutHtml = renderDonutChartSvg({
      segments: donutSegs,
      centerVal: fmtInt(dispTotalIssues),
      centerUnit: '项',
      centerSub: '问题总数',
      filterKey: 'quick'
    });

    const ringHtml = renderRingGaugeSvg({
      idPrefix: 'ov-rectify',
      pct: rectifyPct,
      subLabel: '整改完成率',
      rows: [
        { label: '问题总数', value: `${fmtInt(dispTotalIssues)} 项`, valColor: '#ffffff' },
        { label: '已整改', value: `${fmtInt(dispDone)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
        { label: '整改中', value: `${fmtInt(dispIng)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
        { label: '已超期', value: `${fmtInt(overCount)} 项`, dotColor: '#f87171', valColor: '#f87171' }
      ]
    });

    const quickTabs = ['全部', '原材料', '施工工艺', '检测', '构件质量'];

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">工程类别</span>
              <select class="glass-select m03-select" data-filter="category">
                <option value="" ${!st.category ? 'selected' : ''}>全部类别</option>
                <option value="路基工程" ${st.category === '路基工程' ? 'selected' : ''}>路基工程</option>
                <option value="桥梁工程" ${st.category === '桥梁工程' ? 'selected' : ''}>桥梁工程</option>
                <option value="路面工程" ${st.category === '路面工程' ? 'selected' : ''}>路面工程</option>
                <option value="场站工程" ${st.category === '场站工程' ? 'selected' : ''}>场站工程</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        ${kpiHtml}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区质量合格率</span></div>
            </div>
            <div class="m03-chart-body">${barSvg}</div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">质量问题类型分布</span></div>
            </div>
            <div class="m03-chart-body">${donutHtml}</div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">整改进展</span></div>
            </div>
            <div class="m03-chart-body">${ringHtml}</div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">质量检查记录</span></div>
              <div class="m03-quick-pills">
                ${quickTabs.map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr>
                    <th>序号</th><th>所属工区</th><th>检查对象</th><th>检查内容</th><th>检查结果</th><th>问题描述</th><th>整改状态</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map((r, idx) => `
                    <tr>
                      <td>${(st.page - 1) * pageSize + idx + 1}</td>
                      <td>${r.section}</td>
                      <td>${r.target}</td>
                      <td>${r.content}</td>
                      <td><span class="m03-tag ${r.result === '合格' ? 'ok' : 'fail'}">${r.result}</span></td>
                      <td>${r.desc}</td>
                      <td>${r.rectify === '—' ? '—' : `<span class="m03-tag ${r.rectify === '已整改' ? 'ok' : 'info'}">${r.rectify}</span>`}</td>
                      <td><button class="m03-link-btn" data-detail-id="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="8" style="text-align:center;color:#93b8de;padding:24px;">当前筛选条件下暂无质量检查记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(filtered.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">关键场站质量状态</span></div>
            </div>
            <div class="m03-side-body">
              <div class="m03-side-list">
                <div class="m03-side-card" data-jump-sub="mixing">
                  <div class="m03-side-left">
                    <div class="m03-side-ico">${M03_ICONS.plant}</div>
                    <div>
                      <div class="m03-side-title">拌合站 (${secId ? '1座' : '6座'})</div>
                      <div class="m03-side-sub">生产及配合比数据已同步</div>
                    </div>
                  </div>
                  <span class="m03-tag ok">运行正常</span>
                </div>
                <div class="m03-side-card" data-jump-sub="beamYard">
                  <div class="m03-side-left">
                    <div class="m03-side-ico">${M03_ICONS.beam}</div>
                    <div>
                      <div class="m03-side-title">梁场 (${secId ? '1座' : '2座'})</div>
                      <div class="m03-side-sub">梁片及工序数据已同步</div>
                    </div>
                  </div>
                  <span class="m03-tag ok">运行正常</span>
                </div>
                <div class="m03-side-card" data-jump-sub="lab">
                  <div class="m03-side-left">
                    <div class="m03-side-ico">${M03_ICONS.flask}</div>
                    <div>
                      <div class="m03-side-title">实验室 (${secId ? '1座' : '6座'})</div>
                      <div class="m03-side-sub">检测及报告数据已同步</div>
                    </div>
                  </div>
                  <span class="m03-tag ok">运行正常</span>
                </div>
              </div>
              <div class="m03-side-footer">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m03-link-btn" data-action="viewStations">查看场站 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 2: 实验室 (lab)
     ------------------------------------------------------------------------ */
  function renderLab(ctx) {
    const st = uiState.lab;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];
    const effectiveSec = secId || (st.labName ? (SECTIONS.find(s => s.lab === st.labName)?.id || null) : null);
    const secMeta = effectiveSec ? SECTION_METRICS[effectiveSec] : null;

    const catRatioMap = { '': 1, '原材料': 0.37, '混合料': 0.266, '混凝土': 0.173, '路基路面': 0.12, '其他': 0.071 };
    const catRatio = catRatioMap[st.category] || 1;
    const baseBatches = secMeta ? secMeta.labBatches : 8436;
    const totalBatches = Math.round(baseBatches * pf.mult * catRatio);
    const passRate = Math.min(99.9, (secMeta ? secMeta.labPassRate : 98.7) + pf.passDelta);
    const passBatches = Math.round(totalBatches * (passRate / 100));
    const failBatches = Math.max(0, totalBatches - passBatches);
    const reportCount = Math.max(0, totalBatches - Math.round(34 * pf.mult * (secMeta ? 0.17 : 1)));

    const distItems = [
      { name: '原材料', color: '#2563eb', ratio: 0.370 },
      { name: '混合料', color: '#06b6d4', ratio: 0.266 },
      { name: '混凝土', color: '#10b981', ratio: 0.173 },
      { name: '路基路面', color: '#f59e0b', ratio: 0.120 },
      { name: '其他', color: '#8b5cf6', ratio: 0.071 }
    ].map(d => ({
      name: d.name,
      color: d.color,
      count: Math.round(baseBatches * pf.mult * d.ratio)
    }));

    const baseTrend = [98.2, 98.6, 98.5, 99.0, 98.8, 98.9];
    const trendShift = (secMeta ? secMeta.labPassRate - 98.7 : 0) + pf.passDelta;
    const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
      label: lbl,
      value: +(Math.min(99.9, Math.max(97.1, baseTrend[i] + trendShift))).toFixed(1)
    }));

    const filtered = labRecords.filter(r => {
      if (effectiveSec && r.sectionId !== effectiveSec) return false;
      if (st.category && r.category !== st.category) return false;
      if (st.quickFilter !== '全部' && r.result !== st.quickFilter) return false;
      return true;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    const failAlerts = labRecords.filter(r => r.result === '不合格' && (!effectiveSec || r.sectionId === effectiveSec)).slice(0, 3);

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">实验室</span>
              <select class="glass-select m03-select" data-filter="labName">
                <option value="" ${!st.labName ? 'selected' : ''}>全部实验室</option>
                ${SECTIONS.map(s => `<option value="${s.lab}" ${st.labName === s.lab ? 'selected' : ''}>${s.lab}</option>`).join('')}
              </select>
            </div>
            <div class="m03-field">
              <span class="m03-field-label">检测类别</span>
              <select class="glass-select m03-select" data-filter="category">
                <option value="" ${!st.category ? 'selected' : ''}>全部类别</option>
                <option value="原材料" ${st.category === '原材料' ? 'selected' : ''}>原材料</option>
                <option value="混合料" ${st.category === '混合料' ? 'selected' : ''}>混合料</option>
                <option value="混凝土" ${st.category === '混凝土' ? 'selected' : ''}>混凝土</option>
                <option value="路基路面" ${st.category === '路基路面' ? 'selected' : ''}>路基路面</option>
                <option value="其他" ${st.category === '其他' ? 'selected' : ''}>其他</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m03-btn-outline" data-action="openSys">${M03_ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        ${renderKpiSection('实验室检测概况', pf.label, [
          { label: '接入实验室', value: effectiveSec ? '1' : '6', unit: '座', icon: M03_ICONS.flask },
          { label: '检测批次', value: fmtInt(totalBatches), unit: '批', icon: M03_ICONS.batch },
          { label: '合格批次', value: fmtInt(passBatches), unit: '批', icon: M03_ICONS.checkCircle, tone: 'green' },
          { label: '不合格批次', value: fmtInt(failBatches), unit: '批', icon: M03_ICONS.warn, tone: 'gold' },
          { label: '检测合格率', value: passRate.toFixed(1), unit: '%', icon: M03_ICONS.shieldCheck },
          { label: '已出具报告', value: fmtInt(reportCount), unit: '份', icon: M03_ICONS.report }
        ])}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区检测批次</span></div>
              <div class="m03-header-right">单位 批</div>
            </div>
            <div class="m03-chart-body">
              ${renderBarChartSvg({
                idPrefix: 'lab-batches',
                items: SECTIONS.map(s => ({ secId: s.id, label: s.short, value: Math.round(SECTION_METRICS[s.id].labBatches * pf.mult) })),
                minY: 0,
                maxY: Math.round(1600 * pf.mult),
                ticks: [0, 400, 800, 1200, 1600].map(v => ({ val: Math.round(v * pf.mult), label: fmtInt(v * pf.mult) })),
                valueFormatter: v => fmtInt(v),
                activeSecId: effectiveSec
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">检测类别分布</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderDonutChartSvg({
                segments: distItems,
                centerVal: fmtInt(Math.round(baseBatches * pf.mult)),
                centerUnit: '批',
                centerSub: '检测批次',
                filterKey: 'category'
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">检测合格率趋势</span></div>
              <div class="m03-header-right">${pf.shortMonth}</div>
            </div>
            <div class="m03-chart-body">
              ${renderTrendLineSvg({
                idPrefix: 'lab-trend',
                points: trendPts,
                minY: 97,
                maxY: 100,
                ticks: [97, 98, 99, 100].map(v => ({ val: v, label: v + '%' }))
              })}
            </div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">检测记录</span></div>
              <div class="m03-quick-pills">
                ${['全部', '合格', '不合格'].map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr><th>检测编号</th><th>实验室</th><th>样品名称</th><th>检测项目</th><th>检测时间</th><th>检测结论</th><th>报告</th></tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr>
                      <td style="font-variant-numeric:tabular-nums;">${r.id}</td>
                      <td>${r.lab}</td>
                      <td>${r.sample}</td>
                      <td>${r.item}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.time}</td>
                      <td><span class="m03-tag ${r.result === '合格' ? 'ok' : 'fail'}">${r.result}</span></td>
                      <td>
                        ${r.reportState === '待出具'
                          ? `<button class="m03-tag muted" style="cursor:pointer;" data-detail-id="${r.id}">待出具</button>`
                          : `<button class="m03-link-btn" data-detail-id="${r.id}">查看报告</button>`}
                      </td>
                    </tr>
                  `).join('') : `<tr><td colspan="7" style="text-align:center;color:#93b8de;padding:24px;">暂无匹配的检测记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(filtered.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">最新不合格记录</span></div>
            </div>
            <div class="m03-side-body">
              <div class="m03-side-list">
                ${failAlerts.length ? failAlerts.map(a => `
                  <div class="m03-side-card" data-detail-id="${a.id}">
                    <div class="m03-side-left">
                      <div class="m03-side-ico ${a.retestState === '待复检' ? 'warn' : ''}">${a.retestState === '待复检' ? M03_ICONS.warn : M03_ICONS.report}</div>
                      <div>
                        <div class="m03-side-title">${SECTION_METRICS[a.sectionId].name} · ${a.sample}${a.item.replace('含量', '')}</div>
                        <div class="m03-side-sub">${a.time} &nbsp;${a.id}</div>
                      </div>
                    </div>
                    <span class="m03-tag ${a.retestState === '已复检' ? 'ok' : 'warn'}">${a.retestState}</span>
                  </div>
                `).join('') : `<div style="text-align:center;color:#93b8de;padding:20px;">本工区暂无不合格检测记录</div>`}
              </div>
              <div class="m03-side-footer">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m03-link-btn" data-quick-jump="不合格">查看全部 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 3: 拌合站 (mixing)
     ------------------------------------------------------------------------ */
  function renderMixing(ctx) {
    const st = uiState.mixing;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];
    const effectiveSec = secId || (st.station ? (SECTIONS.find(s => s.stationFull === st.station)?.id || null) : null);
    const secMeta = effectiveSec ? SECTION_METRICS[effectiveSec] : null;

    const totalVol = ((secMeta ? secMeta.mixVol : 36.8) * pf.mult * (st.prodType ? 0.42 : 1)).toFixed(1);
    const baseBatches = secMeta ? Math.round(2460 * (secMeta.mixVol / 36.8)) : 2460;
    const typeRatioMap = { '': 1, '水泥混凝土': 0.439, '水泥稳定碎石': 0.335, '沥青混合料': 0.226 };
    const totalBatches = Math.round(baseBatches * pf.mult * (typeRatioMap[st.prodType] || 1));

    // Reconcile warning counts dynamically with interactive handling state
    const secAlertsAll = mixingRecords.filter(r => r.judge === '预警' && (!effectiveSec || r.sectionId === effectiveSec));
    const newlyHandled = secAlertsAll.filter(r => r.handled && r.id !== 'BH-20261124-077').length;
    const baseWarn = effectiveSec ? Math.max(3, Math.round(27 * (secMeta.mixVol / 36.8))) : 27;
    const warnCount = Math.round(baseWarn * pf.mult);
    const baseHandled = Math.max(0, warnCount - Math.max(0, (effectiveSec ? 1 : 2) - newlyHandled));
    const warnHandleRate = warnCount > 0 ? (baseHandled / warnCount) * 100 : 100;
    const mixPassRate = Math.min(99.9, (effectiveSec ? (98.7 + (secMeta.qualityRate - 98.7) * 0.6) : 98.9) + pf.passDelta);

    const typeSegs = [
      { name: '水泥混凝土', color: '#2563eb', ratio: 1080 / 2460 },
      { name: '水泥稳定碎石', color: '#06b6d4', ratio: 824 / 2460 },
      { name: '沥青混合料', color: '#10b981', ratio: 556 / 2460 }
    ].map(d => ({ name: d.name, color: d.color, count: Math.round(baseBatches * pf.mult * d.ratio) }));

    const filtered = mixingRecords.filter(r => {
      if (effectiveSec && r.sectionId !== effectiveSec) return false;
      if (st.prodType && r.type !== st.prodType) return false;
      if (st.quickFilter === '正常批次' && r.judge !== '合格') return false;
      if (st.quickFilter === '预警批次' && r.judge !== '预警') return false;
      return true;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    const sideAlerts = mixingRecords.filter(r => r.judge === '预警' && (!effectiveSec || r.sectionId === effectiveSec)).slice(0, 3);

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">拌合站</span>
              <select class="glass-select m03-select" data-filter="station">
                <option value="" ${!st.station ? 'selected' : ''}>全部拌合站</option>
                ${SECTIONS.map(s => `<option value="${s.stationFull}" ${st.station === s.stationFull ? 'selected' : ''}>${s.stationFull}</option>`).join('')}
              </select>
            </div>
            <div class="m03-field">
              <span class="m03-field-label">生产类型</span>
              <select class="glass-select m03-select" data-filter="prodType">
                <option value="" ${!st.prodType ? 'selected' : ''}>全部类型</option>
                <option value="水泥混凝土" ${st.prodType === '水泥混凝土' ? 'selected' : ''}>水泥混凝土</option>
                <option value="水泥稳定碎石" ${st.prodType === '水泥稳定碎石' ? 'selected' : ''}>水泥稳定碎石</option>
                <option value="沥青混合料" ${st.prodType === '沥青混合料' ? 'selected' : ''}>沥青混合料</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m03-btn-outline" data-action="openSys">${M03_ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        ${renderKpiSection('拌合站生产概况', pf.label, [
          { label: '接入拌合站', value: effectiveSec ? '1' : '6', unit: '座', icon: M03_ICONS.plant },
          { label: '累计产量', value: totalVol, unit: '万m³', icon: M03_ICONS.layers },
          { label: '生产批次', value: fmtInt(totalBatches), unit: '批', icon: M03_ICONS.batch },
          { label: '配合比合格率', value: mixPassRate.toFixed(1), unit: '%', icon: M03_ICONS.shieldCheck },
          { label: '预警批次', value: fmtInt(warnCount), unit: '批', icon: M03_ICONS.warn, tone: 'gold' },
          { label: '已处理批次', value: fmtInt(baseHandled), unit: '批', icon: M03_ICONS.checkCircle, tone: 'green' }
        ])}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各拌合站累计产量</span></div>
              <div class="m03-header-right">单位 万m³</div>
            </div>
            <div class="m03-chart-body">
              ${renderBarChartSvg({
                idPrefix: 'mix-vol',
                items: SECTIONS.map(s => ({ secId: s.id, label: s.station, value: +(SECTION_METRICS[s.id].mixVol * pf.mult).toFixed(1) })),
                minY: 0,
                maxY: +(8 * pf.mult).toFixed(1),
                ticks: [0, 2, 4, 6, 8].map(v => ({ val: +(v * pf.mult).toFixed(1), label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1) })),
                valueFormatter: v => v.toFixed(1),
                activeSecId: effectiveSec
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">生产批次分布</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderDonutChartSvg({
                segments: typeSegs,
                centerVal: fmtInt(Math.round(baseBatches * pf.mult)),
                centerUnit: '批',
                centerSub: '生产批次',
                filterKey: 'prodType'
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">生产预警处理</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderRingGaugeSvg({
                idPrefix: 'mix-warn',
                pct: warnHandleRate,
                subLabel: '预警处理率',
                rows: [
                  { label: '预警批次', value: `${fmtInt(warnCount)} 批`, valColor: '#ffffff' },
                  { label: '已处理', value: `${fmtInt(baseHandled)} 批`, dotColor: '#22c55e', valColor: '#4ade80' },
                  { label: '待处理', value: `${fmtInt(Math.max(0, warnCount - baseHandled))} 批`, dotColor: '#facc15', valColor: '#facc15' }
                ]
              })}
            </div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">生产批次记录</span></div>
              <div class="m03-quick-pills">
                ${['全部', '正常批次', '预警批次'].map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr><th>批次编号</th><th>所属工区</th><th>拌合站</th><th>生产类型</th><th>配合比</th><th>生产量</th><th>生产时间</th><th>质量判定</th><th>操作</th></tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr>
                      <td style="font-variant-numeric:tabular-nums;">${r.id}</td>
                      <td>${r.section}</td>
                      <td>${r.station}</td>
                      <td>${r.type}</td>
                      <td>${r.mixCode}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.volume.toFixed(1)} m³</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.time}</td>
                      <td><span class="m03-tag ${r.judge === '合格' ? 'ok' : 'warn'}">${r.judge}</span></td>
                      <td><button class="m03-link-btn" data-detail-id="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="9" style="text-align:center;color:#93b8de;padding:24px;">暂无匹配的生产批次记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(filtered.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">最新生产预警</span></div>
            </div>
            <div class="m03-side-body">
              <div class="m03-side-list">
                ${sideAlerts.length ? sideAlerts.map(a => `
                  <div class="m03-side-card" data-detail-id="${a.id}">
                    <div class="m03-side-left">
                      <div class="m03-side-ico ${!a.handled ? 'warn' : ''}">${!a.handled ? M03_ICONS.warn : M03_ICONS.report}</div>
                      <div>
                        <div class="m03-side-title">${a.alertTitle}</div>
                        <div class="m03-side-sub">${a.time} &nbsp;${a.id}</div>
                      </div>
                    </div>
                    <span class="m03-tag ${a.handled ? 'ok' : 'warn'}">${a.handled ? '已处理' : '待处理'}</span>
                  </div>
                `).join('') : `<div style="text-align:center;color:#93b8de;padding:20px;">当前拌合站无生产预警</div>`}
              </div>
              <div class="m03-side-footer">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m03-link-btn" data-quick-jump="预警批次">查看全部 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 4: 路面质量 (pavement)
     ------------------------------------------------------------------------ */
  function renderPavement(ctx) {
    const st = uiState.pavement;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];
    const secMeta = secId ? SECTION_METRICS[secId] : null;

    const segCount = Math.round((secMeta ? secMeta.pavSegments : 18) * (st.period === '2026年11月' ? 1 : pf.mult) * (st.layer ? 0.35 : 1) * (st.direction ? 0.5 : 1));
    const pavKm = ((secMeta ? secMeta.pavKm : 42.6) * (st.period === '2026年11月' ? 1 : pf.mult) * (st.layer ? 0.38 : 1) * (st.direction ? 0.5 : 1)).toFixed(1);
    const tempRate = Math.min(99.9, 99.1 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.4 : 0)).toFixed(1);
    const compRate = Math.min(99.9, 98.6 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0)).toFixed(1);
    const thickRate = Math.min(99.9, 99.0 + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.3 : 0)).toFixed(1);

    const warnRatio = secMeta ? (secMeta.pavKm / 42.6) : 1;
    const warnSegs = [
      { name: '厚度偏差', color: '#2563eb', count: Math.max(secId ? 0 : 1, Math.round(3 * warnRatio * (st.period === '2026年11月' ? 1 : pf.mult))) },
      { name: '压实度不足', color: '#06b6d4', count: Math.max(secId ? 0 : 1, Math.round(2 * warnRatio * (st.period === '2026年11月' ? 1 : pf.mult))) },
      { name: '摊铺温度偏低', color: '#f59e0b', count: Math.max(secId ? 0 : 1, Math.round(2 * warnRatio * (st.period === '2026年11月' ? 1 : pf.mult))) },
      { name: '碾压遍数不足', color: '#f43f5e', count: Math.max(0, Math.round(1 * warnRatio * (st.period === '2026年11月' ? 1 : pf.mult))) }
    ];
    const totalWarn = Math.max(1, warnSegs.reduce((s, d) => s + d.count, 0));

    const trendBase = [98.0, 98.3, 98.5, 99.0, 98.7, 99.1];
    const trendPts = ['11-01', '11-05', '11-10', '11-15', '11-20', '11-25'].map((lbl, i) => ({
      label: lbl,
      value: +(Math.min(99.9, Math.max(97.2, trendBase[i] + pf.passDelta + (secMeta ? (secMeta.qualityRate - 98.7) * 0.5 : 0)))).toFixed(1)
    }));

    const filtered = pavementRecords.filter(r => {
      if (secId && r.sectionId !== secId) return false;
      if (st.direction && r.dir !== st.direction) return false;
      if (st.layer && r.layer !== st.layer) return false;
      if (st.quickFilter === '合格' && r.judge !== '合格') return false;
      if (st.quickFilter === '预警' && r.judge === '合格') return false;
      return true;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    const sideAlerts = pavementRecords.filter(r => r.judge !== '合格' && (!secId || r.sectionId === secId)).slice(0, 3);

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">路线方向</span>
              <select class="glass-select m03-select" data-filter="direction">
                <option value="" ${!st.direction ? 'selected' : ''}>全部方向</option>
                <option value="左幅（明水→北安）" ${st.direction === '左幅（明水→北安）' ? 'selected' : ''}>左幅（明水→北安）</option>
                <option value="右幅（北安→明水）" ${st.direction === '右幅（北安→明水）' ? 'selected' : ''}>右幅（北安→明水）</option>
              </select>
            </div>
            <div class="m03-field">
              <span class="m03-field-label">施工层位</span>
              <select class="glass-select m03-select" data-filter="layer">
                <option value="" ${!st.layer ? 'selected' : ''}>全部层位</option>
                <option value="上面层" ${st.layer === '上面层' ? 'selected' : ''}>上面层</option>
                <option value="中面层" ${st.layer === '中面层' ? 'selected' : ''}>中面层</option>
                <option value="下面层" ${st.layer === '下面层' ? 'selected' : ''}>下面层</option>
                <option value="水稳基层" ${st.layer === '水稳基层' ? 'selected' : ''}>水稳基层</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m03-btn-outline" data-action="openSys">${M03_ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        ${renderKpiSection('路面施工质量概况', pf.label, [
          { label: '施工段', value: fmtInt(Math.max(1, segCount)), unit: '段', icon: M03_ICONS.road },
          { label: '摊铺里程', value: pavKm, unit: 'km', icon: M03_ICONS.layers },
          { label: '摊铺温度合格率', value: tempRate, unit: '%', icon: M03_ICONS.temp },
          { label: '压实度合格率', value: compRate, unit: '%', icon: M03_ICONS.roller },
          { label: '厚度合格率', value: thickRate, unit: '%', icon: M03_ICONS.ruler },
          { label: '质量预警', value: fmtInt(secId ? sideAlerts.length : totalWarn), unit: '条', icon: M03_ICONS.warn, tone: 'gold' }
        ])}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区摊铺里程</span></div>
              <div class="m03-header-right">单位 km</div>
            </div>
            <div class="m03-chart-body">
              ${renderBarChartSvg({
                idPrefix: 'pav-km',
                items: SECTIONS.map(s => ({ secId: s.id, label: s.short, value: +(SECTION_METRICS[s.id].pavKm * pf.mult).toFixed(1) })),
                minY: 0,
                maxY: +(10 * pf.mult).toFixed(1),
                ticks: [0, 2, 4, 6, 8, 10].map(v => ({ val: +(v * pf.mult).toFixed(1), label: (v * pf.mult).toFixed(pf.mult === 1 ? 0 : 1) })),
                valueFormatter: v => v.toFixed(1),
                activeSecId: secId
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">压实度合格率趋势</span></div>
              <div class="m03-header-right">${pf.shortMonth}</div>
            </div>
            <div class="m03-chart-body">
              ${renderTrendLineSvg({
                idPrefix: 'pav-trend',
                points: trendPts,
                minY: 97,
                maxY: 100,
                ticks: [97, 98, 99, 100].map(v => ({ val: v, label: v + '%' }))
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">路面质量预警分布</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderDonutChartSvg({
                segments: warnSegs.filter(w => w.count > 0),
                centerVal: fmtInt(totalWarn),
                centerUnit: '条',
                centerSub: '质量预警'
              })}
            </div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">摊铺碾压与检测记录</span></div>
              <div class="m03-quick-pills">
                ${['全部', '合格', '预警'].map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr><th>所属工区</th><th>施工桩号</th><th>层位</th><th>摊铺温度</th><th>碾压遍数</th><th>压实度</th><th>实测厚度</th><th>判定</th><th>操作</th></tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr>
                      <td>${r.section}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.stake}</td>
                      <td>${r.layer}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.temp} ℃</td>
                      <td>${r.passes} 遍</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.compaction.toFixed(1)}%</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.thickness.toFixed(1)} cm</td>
                      <td><span class="m03-tag ${r.judge === '合格' ? 'ok' : 'warn'}">${r.judge}</span></td>
                      <td><button class="m03-link-btn" data-detail-id="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="9" style="text-align:center;color:#93b8de;padding:24px;">暂无匹配的路面检测记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(filtered.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">最新路面质量预警</span></div>
            </div>
            <div class="m03-side-body">
              <div class="m03-side-list">
                ${sideAlerts.length ? sideAlerts.map(a => `
                  <div class="m03-side-card" data-detail-id="${a.id}">
                    <div class="m03-side-left">
                      <div class="m03-side-ico ${!a.verified ? 'warn' : ''}">${a.judge.includes('厚度') ? M03_ICONS.ruler : a.judge.includes('压实') ? M03_ICONS.roller : M03_ICONS.temp}</div>
                      <div>
                        <div class="m03-side-title">${a.alertTitle}</div>
                        <div class="m03-side-sub">${a.time} &nbsp;${a.stake}</div>
                      </div>
                    </div>
                    <span class="m03-tag ${a.verified ? 'ok' : 'warn'}">${a.verified ? '已核查' : '待核查'}</span>
                  </div>
                `).join('') : `<div style="text-align:center;color:#93b8de;padding:20px;">本工区暂无路面预警</div>`}
              </div>
              <div class="m03-side-footer">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m03-link-btn" data-quick-jump="预警">查看全部 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 5: 智慧梁场 (beamYard)
     ------------------------------------------------------------------------ */
  function renderBeamYard(ctx) {
    const st = uiState.beamYard;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];
    const secMeta = secId ? SECTION_METRICS[secId] : null;
    const targetYard = st.yard || (secId ? SECTION_METRICS[secId] && SECTIONS.find(s => s.id === secId).yard : '');

    const baseTotal = secMeta ? secMeta.beams : (st.yard ? 320 : 640);
    const typeRatioMap = { '': 1, '30 m 箱梁': 360 / 640, '40 m 箱梁': 220 / 640, '20 m 空心板梁': 60 / 640 };
    const totalBeams = Math.round(baseTotal * pf.mult * (typeRatioMap[st.beamType] || 1));

    const prodRatio = baseTotal / 640;
    const trendBars = [
      { label: '01—05日', value: Math.round(104 * prodRatio * pf.mult) },
      { label: '06—10日', value: Math.round(121 * prodRatio * pf.mult) },
      { label: '11—15日', value: Math.round(123 * prodRatio * pf.mult) },
      { label: '16—20日', value: Math.round(148 * prodRatio * pf.mult) },
      { label: '21—25日', value: Math.round(144 * prodRatio * pf.mult) }
    ];

    const beamTypesDist = [
      { name: '30 m 箱梁', color: '#2563eb', count: Math.round(360 * prodRatio * pf.mult) },
      { name: '40 m 箱梁', color: '#06b6d4', count: Math.round(220 * prodRatio * pf.mult) },
      { name: '20 m 空心板梁', color: '#10b981', count: Math.round(60 * prodRatio * pf.mult) }
    ];

    const tensionPct = Math.min(99.9, 99.5 + pf.passDelta);
    const groutPct = Math.min(99.9, 99.7 + pf.passDelta);
    const inspectPct = Math.min(99.9, 99.2 + pf.passDelta);

    const filtered = beamRecords.filter(r => {
      if (secId && r.sectionId !== secId) return false;
      if (st.yard && r.yard !== st.yard) return false;
      if (st.beamType && r.type !== st.beamType) return false;
      if (st.quickFilter === '生产中' && r.statusState !== 'producing') return false;
      if (st.quickFilter === '已检验' && r.statusState !== 'inspected') return false;
      return true;
    });
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    const sideAlerts = beamRecords.filter(r => r.alertTitle && (!secId || r.sectionId === secId) && (!st.yard || r.yard === st.yard)).slice(0, 3);
    const warnTotal = Math.max(sideAlerts.length, Math.round(5 * prodRatio * (st.period === '2026年11月' ? 1 : pf.mult)));

    function badgeClass(val) {
      if (val === '合格' || val === '已完成') return 'ok';
      if (val === '待复检') return 'warn';
      if (val === '养护中' || val === '压浆中') return 'info';
      return 'muted';
    }

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">梁场</span>
              <select class="glass-select m03-select" data-filter="yard">
                <option value="" ${!st.yard ? 'selected' : ''}>全部梁场</option>
                <option value="一号梁场" ${st.yard === '一号梁场' ? 'selected' : ''}>一号梁场</option>
                <option value="二号梁场" ${st.yard === '二号梁场' ? 'selected' : ''}>二号梁场</option>
              </select>
            </div>
            <div class="m03-field">
              <span class="m03-field-label">梁型</span>
              <select class="glass-select m03-select" data-filter="beamType">
                <option value="" ${!st.beamType ? 'selected' : ''}>全部梁型</option>
                <option value="30 m 箱梁" ${st.beamType === '30 m 箱梁' ? 'selected' : ''}>30 m 箱梁</option>
                <option value="40 m 箱梁" ${st.beamType === '40 m 箱梁' ? 'selected' : ''}>40 m 箱梁</option>
                <option value="20 m 空心板梁" ${st.beamType === '20 m 空心板梁' ? 'selected' : ''}>20 m 空心板梁</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m03-btn-outline" data-action="openSys">${M03_ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        ${renderKpiSection('梁片生产质量概况', pf.label, [
          { label: '接入梁场', value: targetYard ? '1' : '2', unit: '座', icon: M03_ICONS.plant },
          { label: '累计生产', value: fmtInt(totalBeams), unit: '片', icon: M03_ICONS.beam },
          { label: '成品检验合格率', value: inspectPct.toFixed(1), unit: '%', icon: M03_ICONS.shieldCheck },
          { label: '张拉合格率', value: tensionPct.toFixed(1), unit: '%', icon: M03_ICONS.roller },
          { label: '压浆合格率', value: groutPct.toFixed(1), unit: '%', icon: M03_ICONS.flask },
          { label: '工序预警', value: fmtInt(warnTotal), unit: '条', icon: M03_ICONS.warn, tone: 'gold' }
        ])}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">梁片生产趋势</span></div>
              <div class="m03-header-right">单位 片</div>
            </div>
            <div class="m03-chart-body">
              ${renderBarChartSvg({
                idPrefix: 'beam-trend',
                items: trendBars,
                minY: 0,
                maxY: Math.round(160 * prodRatio * pf.mult),
                ticks: [0, 40, 80, 120, 160].map(v => ({ val: Math.round(v * prodRatio * pf.mult), label: fmtInt(v * prodRatio * pf.mult) })),
                valueFormatter: v => fmtInt(v)
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">梁型分布</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderDonutChartSvg({
                segments: beamTypesDist,
                centerVal: fmtInt(Math.round(baseTotal * pf.mult)),
                centerUnit: '片',
                centerSub: '累计生产',
                filterKey: 'beamType'
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">关键工序合格率</span></div>
            </div>
            <div class="m03-chart-body">
              <div class="m03-proc-bars">
                <div>
                  <div class="m03-proc-top"><span class="m03-proc-name">预应力张拉</span><span class="m03-proc-val">${tensionPct.toFixed(1)}%</span></div>
                  <div class="m03-proc-track"><div class="m03-proc-fill" style="width:${tensionPct}%;background:linear-gradient(90deg,#0284c7,#38f2ff);"></div></div>
                </div>
                <div>
                  <div class="m03-proc-top"><span class="m03-proc-name">孔道压浆</span><span class="m03-proc-val" style="color:#4ade80;">${groutPct.toFixed(1)}%</span></div>
                  <div class="m03-proc-track"><div class="m03-proc-fill" style="width:${groutPct}%;background:linear-gradient(90deg,#0d9488,#22c55e);"></div></div>
                </div>
                <div>
                  <div class="m03-proc-top"><span class="m03-proc-name">成品检验</span><span class="m03-proc-val" style="color:#60a5fa;">${inspectPct.toFixed(1)}%</span></div>
                  <div class="m03-proc-track"><div class="m03-proc-fill" style="width:${inspectPct}%;background:linear-gradient(90deg,#1d4ed8,#38bdf8);"></div></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">梁片生产与工序记录</span></div>
              <div class="m03-quick-pills">
                ${['全部', '生产中', '已检验'].map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr><th>梁片编号</th><th>所属梁场</th><th>梁型</th><th>浇筑日期</th><th>养护状态</th><th>张拉</th><th>压浆</th><th>检验</th><th>操作</th></tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr>
                      <td style="font-variant-numeric:tabular-nums;">${r.id}</td>
                      <td>${r.yard}</td>
                      <td>${r.type}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.castDate}</td>
                      <td><span class="m03-tag ${badgeClass(r.curing)}">${r.curing}</span></td>
                      <td><span class="m03-tag ${badgeClass(r.tension)}">${r.tension}</span></td>
                      <td><span class="m03-tag ${badgeClass(r.grout)}">${r.grout}</span></td>
                      <td><span class="m03-tag ${badgeClass(r.inspect)}">${r.inspect}</span></td>
                      <td><button class="m03-link-btn" data-detail-id="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="9" style="text-align:center;color:#93b8de;padding:24px;">暂无匹配的梁片记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(filtered.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">最新工序预警</span></div>
            </div>
            <div class="m03-side-body">
              <div class="m03-side-list">
                ${sideAlerts.length ? sideAlerts.map(a => `
                  <div class="m03-side-card" data-detail-id="${a.id}">
                    <div class="m03-side-left">
                      <div class="m03-side-ico ${a.alertState === '待复检' ? 'warn' : ''}">${a.alertTitle.includes('温度') ? M03_ICONS.temp : M03_ICONS.roller}</div>
                      <div>
                        <div class="m03-side-title">${a.alertTitle}</div>
                        <div class="m03-side-sub">${a.alertTime} &nbsp;${a.id}</div>
                      </div>
                    </div>
                    <span class="m03-tag ${a.alertState === '已处理' ? 'ok' : a.alertState === '跟踪中' ? 'info' : 'warn'}">${a.alertState}</span>
                  </div>
                `).join('') : `<div style="text-align:center;color:#93b8de;padding:20px;">当前梁场暂无工序预警</div>`}
              </div>
              <div class="m03-side-footer">
                <span>同步于 2026-11-25 10:45</span>
                <button class="m03-link-btn" data-quick-jump="生产中">查看全部 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 6: 质量问题与整改 (issues)
     ------------------------------------------------------------------------ */
  function renderIssues(ctx) {
    const st = uiState.issues;
    const secId = ctx.state.activeSectionId;
    const pf = PERIOD_FACTORS[st.period] || PERIOD_FACTORS['2026年11月'];

    const scopedIssues = qualityIssues.filter(i => (!secId || i.sectionId === secId) && (!st.issueType || i.type === st.issueType));
    const totalCount = scopedIssues.length;
    const doneList = scopedIssues.filter(i => i.status === '已整改');
    const ingList = scopedIssues.filter(i => i.status === '整改中');
    const overList = scopedIssues.filter(i => i.status === '已超期');
    const rectifyPct = totalCount > 0 ? (doneList.length / totalCount) * 100 : 100;
    const avgDays = doneList.length > 0
      ? (doneList.reduce((s, i) => s + (i.daysUsed || 2.3), 0) / doneList.length).toFixed(1)
      : '0.0';

    const typeDefs = [
      { name: '原材料质量', color: '#2563eb' },
      { name: '施工工艺', color: '#06b6d4' },
      { name: '检测异常', color: '#10b981' },
      { name: '构件质量', color: '#f59e0b' },
      { name: '其他', color: '#f43f5e' }
    ];
    const donutSegs = typeDefs.map(td => ({
      name: td.name,
      color: td.color,
      count: scopedIssues.filter(i => i.type === td.name).length
    })).filter(d => d.count > 0 || !secId);

    const effectiveStatusFilter = st.quickFilter !== '全部' ? st.quickFilter : st.status;
    const tableIssues = scopedIssues.filter(i => !effectiveStatusFilter || i.status === effectiveStatusFilter);
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(tableIssues.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = tableIssues.slice((st.page - 1) * pageSize, st.page * pageSize);

    const pendingIssue = ingList[0] || overList[0] || null;

    return `
      <div class="m03-page">
        <div class="glass-panel m03-filter-panel">
          <div class="m03-filter-fields">
            ${renderSectionSelect(secId)}
            <div class="m03-field">
              <span class="m03-field-label">问题类型</span>
              <select class="glass-select m03-select" data-filter="issueType">
                <option value="" ${!st.issueType ? 'selected' : ''}>全部类型</option>
                ${typeDefs.map(t => `<option value="${t.name}" ${st.issueType === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="m03-field">
              <span class="m03-field-label">整改状态</span>
              <select class="glass-select m03-select" data-filter="status">
                <option value="" ${!st.status ? 'selected' : ''}>全部状态</option>
                <option value="整改中" ${st.status === '整改中' ? 'selected' : ''}>整改中</option>
                <option value="已整改" ${st.status === '已整改' ? 'selected' : ''}>已整改</option>
                <option value="已超期" ${st.status === '已超期' ? 'selected' : ''}>已超期</option>
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m03-filter-actions">
            <button class="m03-btn-query" data-action="query">${M03_ICONS.search}<span>查询</span></button>
            <button class="dock-btn m03-btn-outline" data-action="reset">${M03_ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        ${renderKpiSection('质量问题与整改概况', pf.label, [
          { label: '本期问题', value: fmtInt(totalCount), unit: '项', icon: M03_ICONS.batch },
          { label: '已整改', value: fmtInt(doneList.length), unit: '项', icon: M03_ICONS.checkCircle, tone: 'green' },
          { label: '整改中', value: fmtInt(ingList.length), unit: '项', icon: M03_ICONS.clock, tone: 'blue' },
          { label: '已超期', value: fmtInt(overList.length), unit: '项', icon: M03_ICONS.warn, tone: 'gold' },
          { label: '整改完成率', value: rectifyPct.toFixed(1), unit: '%', icon: M03_ICONS.shieldCheck, tone: 'green' },
          { label: '平均整改用时', value: avgDays, unit: '天', icon: M03_ICONS.clock }
        ])}

        <div class="m03-charts-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区问题数量</span></div>
              <div class="m03-header-right">单位 项</div>
            </div>
            <div class="m03-chart-body">
              ${renderBarChartSvg({
                idPrefix: 'iss-sec',
                items: SECTIONS.map(s => ({ secId: s.id, label: s.short, value: qualityIssues.filter(i => i.sectionId === s.id && (!st.issueType || i.type === st.issueType)).length })),
                minY: 0,
                maxY: 4,
                ticks: [0, 1, 2, 3, 4].map(v => ({ val: v, label: String(v) })),
                valueFormatter: v => String(v),
                activeSecId: secId
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">质量问题类型分布</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderDonutChartSvg({
                segments: donutSegs,
                centerVal: fmtInt(totalCount),
                centerUnit: '项',
                centerSub: '问题总数',
                filterKey: 'issueType'
              })}
            </div>
          </div>
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">整改进展</span></div>
            </div>
            <div class="m03-chart-body">
              ${renderRingGaugeSvg({
                idPrefix: 'iss-ring',
                pct: rectifyPct,
                subLabel: '整改完成率',
                rows: [
                  { label: '问题总数', value: `${fmtInt(totalCount)} 项`, valColor: '#ffffff' },
                  { label: '已整改', value: `${fmtInt(doneList.length)} 项`, dotColor: '#22c55e', valColor: '#4ade80' },
                  { label: '整改中', value: `${fmtInt(ingList.length)} 项`, dotColor: '#38bdf8', valColor: '#38bdf8' },
                  { label: '已超期', value: `${fmtInt(overList.length)} 项`, dotColor: '#f87171', valColor: '#f87171' }
                ]
              })}
            </div>
          </div>
        </div>

        <div class="m03-bottom-row">
          <div class="glass-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">质量问题台账</span></div>
              <div class="m03-quick-pills">
                ${['全部', '整改中', '已整改', '已超期'].map(q => `<button class="m03-qpill ${st.quickFilter === q ? 'active' : ''}" data-quick="${q}">${q}</button>`).join('')}
              </div>
            </div>
            <div class="m03-table-wrap">
              <table class="data-table m03-table">
                <thead>
                  <tr><th>问题编号</th><th>所属工区</th><th>问题类型</th><th>问题描述</th><th>整改责任单位</th><th>整改期限</th><th>状态</th><th>操作</th></tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr>
                      <td style="font-variant-numeric:tabular-nums;">${r.id}</td>
                      <td>${r.section}</td>
                      <td>${r.type}</td>
                      <td>${r.desc}</td>
                      <td>${r.unit}</td>
                      <td style="font-variant-numeric:tabular-nums;">${r.deadline}</td>
                      <td><span class="m03-tag ${r.status === '已整改' ? 'ok' : r.status === '已超期' ? 'fail' : 'info'}">${r.status}</span></td>
                      <td><button class="m03-link-btn" data-detail-id="${r.id}">详情</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="8" style="text-align:center;color:#93b8de;padding:24px;">当前筛选条件下暂无质量问题记录</td></tr>`}
                </tbody>
              </table>
            </div>
            ${buildPaginationHtml(tableIssues.length, st.page, pageSize)}
          </div>

          <div class="glass-panel m03-side-panel">
            <div class="panel-header m03-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">待整改事项</span></div>
            </div>
            <div class="m03-side-body">
              ${pendingIssue ? `
                <div class="m03-pending-card">
                  <div class="m03-pending-top">
                    <span class="m03-pending-code">${pendingIssue.id}</span>
                    <span class="m03-tag ${pendingIssue.status === '已超期' ? 'fail' : 'info'}">${pendingIssue.status}</span>
                  </div>
                  <div class="m03-pending-title">${pendingIssue.section} · ${pendingIssue.title}</div>
                  <div class="m03-pending-desc">${pendingIssue.desc}</div>
                  <div class="m03-pending-kv"><span class="m03-pending-k">整改责任单位</span><span class="m03-pending-v">${pendingIssue.unit}</span></div>
                  <div class="m03-pending-kv"><span class="m03-pending-k">发现时间</span><span class="m03-pending-v">${pendingIssue.foundAt}</span></div>
                  <div class="m03-pending-kv"><span class="m03-pending-k">整改期限</span><span class="m03-pending-v">${pendingIssue.deadline}</span></div>
                </div>
                <div class="m03-side-footer">
                  <span>待整改 ${ingList.length + overList.length} 项</span>
                  <button class="m03-link-btn" data-detail-id="${pendingIssue.id}">查看详情 &gt;</button>
                </div>
              ` : `
                <div class="m03-pending-card" style="text-align:center;padding:28px 16px;">
                  <div style="color:#4ade80;font-size:15px;font-weight:700;">当前范围已全部整改销号</div>
                  <div style="color:#93b8de;font-size:12px;">全部质量问题均已完成闭环复验（整改率 100.0%）</div>
                </div>
                <div class="m03-side-footer">
                  <span>待整改 0 项</span>
                  <button class="m03-link-btn" data-quick-jump="全部">查看全部 &gt;</button>
                </div>
              `}
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE DETAIL MODALS & MUTATION ACTIONS
     ------------------------------------------------------------------------ */
  function openDetailModal(subPageId, id) {
    if (!lastCtx) return;

    if (subPageId === 'overview') {
      const r = inspectionRecords.find(x => x.id === id);
      if (!r) return;
      lastCtx.openModal(`质量检查详情 · ${r.target}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>所属工区 / 类别</span><strong>${r.section} · ${r.category}</strong></div>
          <div class="detail-stat-card"><span>实测结果</span><strong style="color:${r.result === '合格' ? '#4ade80' : '#f87171'};">${r.measured}</strong></div>
          <div class="detail-stat-card"><span>规范标准</span><strong>${r.standard}</strong></div>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">检查编号</th><td>${r.id}</td><th style="width:120px;">检查时间</th><td>${r.date}</td></tr>
            <tr><th>检查对象</th><td>${r.target}</td><th>检查内容</th><td>${r.content}</td></tr>
            <tr><th>检验员</th><td>${r.inspector}</td><th>整改状态</th><td><span class="status-tag ${r.rectify === '已整改' || r.result === '合格' ? 'ok' : 'warn'}">${r.rectify === '—' ? '无需整改' : r.rectify}</span></td></tr>
          </tbody>
        </table>
        <p style="color:#dbeafe;line-height:1.6;"><strong>处置与复核说明：</strong>${r.note}</p>
        ${r.rectify === '整改中' ? `<button class="btn-primary-glow" id="m03ModalJumpIssues">前往「质量问题与整改」办理闭环</button>` : ''}
      `);
      const jumpBtn = document.getElementById('m03ModalJumpIssues');
      if (jumpBtn) {
        jumpBtn.onclick = () => {
          lastCtx.closeModal();
          lastCtx.switchModule('quality', 'issues');
        };
      }
      return;
    }

    if (subPageId === 'lab') {
      const r = labRecords.find(x => x.id === id);
      if (!r) return;
      const curvePts = r.result === '合格'
        ? [{ label: '0s', value: 98.1 }, { label: '20s', value: 98.5 }, { label: '40s', value: 98.9 }, { label: '60s', value: 99.2 }, { label: '80s', value: 99.0 }]
        : [{ label: '0s', value: 97.4 }, { label: '20s', value: 97.8 }, { label: '40s', value: 97.5 }, { label: '60s', value: 97.9 }, { label: '80s', value: 97.6 }];
      lastCtx.openModal(`试验检测电子报告 · ${r.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>实测数值</span><strong style="color:${r.result === '合格' ? '#4ade80' : '#f87171'};">${r.measured}</strong></div>
          <div class="detail-stat-card"><span>标准限值</span><strong>${r.limit}</strong></div>
          <div class="detail-stat-card"><span>防篡改存证哈希</span><strong style="font-size:14px;">${r.hash}</strong></div>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">所属实验室</th><td>${r.lab}</td><th style="width:120px;">样品名称</th><td>${r.sample}</td></tr>
            <tr><th>检测项目</th><td>${r.item}</td><th>采集设备</th><td>${r.machine}</td></tr>
            <tr><th>检测时间</th><td>${r.time}</td><th>复检状态</th><td><span class="status-tag ${r.retestState === '待复检' ? 'warn' : 'ok'}">${r.retestState}</span></td></tr>
          </tbody>
        </table>
        <div class="m03-modal-form">
          <div class="m03-modal-section-title">试验机自动采集过程曲线（设备直传防篡改）</div>
          ${renderTrendLineSvg({
            idPrefix: 'modal-lab',
            points: curvePts,
            minY: 97,
            maxY: 100,
            ticks: [97, 98, 99, 100].map(v => ({ val: v, label: v + '%' }))
          })}
        </div>
        ${r.retestState === '待复检' ? `<button class="btn-primary-glow" id="m03ModalRetestBtn">发起平行复检并标记为「已复检」</button>` : ''}
        ${r.reportState === '待出具' ? `<button class="btn-primary-glow" id="m03ModalSignReportBtn">签章出具电子检测报告</button>` : ''}
      `);
      const retestBtn = document.getElementById('m03ModalRetestBtn');
      if (retestBtn) {
        retestBtn.onclick = () => {
          r.retestState = '已复检';
          lastCtx.closeModal();
          lastCtx.showToast(`已完成 ${r.id} 平行复检存证并更新状态为「已复检」`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      const signBtn = document.getElementById('m03ModalSignReportBtn');
      if (signBtn) {
        signBtn.onclick = () => {
          r.reportState = '已出具';
          r.hash = '8A1C...F92E';
          lastCtx.closeModal();
          lastCtx.showToast(`已签章生成 ${r.id} 电子检测报告`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      return;
    }

    if (subPageId === 'mixing') {
      const r = mixingRecords.find(x => x.id === id);
      if (!r) return;
      lastCtx.openModal(`拌合生产配合比详情 · ${r.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>拌合站 / 工区</span><strong>${r.station} · ${r.section}</strong></div>
          <div class="detail-stat-card"><span>生产类型 / 配合比</span><strong>${r.type} · ${r.mixCode}</strong></div>
          <div class="detail-stat-card"><span>出料温度 / 最大偏差</span><strong style="color:${r.judge === '合格' ? '#4ade80' : '#facc15'};">${r.temp} · ${r.deviation}</strong></div>
        </div>
        <table class="data-table">
          <thead><tr><th>材料名称</th><th>目标配比</th><th>实际称量</th><th>偏差率</th><th>状态</th></tr></thead>
          <tbody>
            ${r.materials.map(m => {
              const diffPct = (((m.actual - m.target) / Math.max(0.01, m.target)) * 100).toFixed(1);
              const over = Math.abs(Number(diffPct)) > 2.0;
              return `
                <tr>
                  <td>${m.name}</td>
                  <td>${m.target} ${m.unit}</td>
                  <td>${m.actual} ${m.unit}</td>
                  <td style="color:${over ? '#facc15' : '#4ade80'};">${Number(diffPct) > 0 ? '+' : ''}${diffPct}%</td>
                  <td><span class="status-tag ${over ? 'warn' : 'ok'}">${over ? '超差预警' : '正常'}</span></td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
        ${r.judge === '预警' && !r.handled ? `
          <div class="m03-modal-form">
            <div class="m03-modal-section-title">预警处置闭环（${r.alertTitle}）</div>
            <textarea class="m03-modal-textarea" id="m03MixHandleNote" placeholder="输入校准与处置说明...">已通知拌合站操作手校核称重传感器与骨料含水率补偿，后续盘次已恢复正常。</textarea>
            <button class="btn-primary-glow" id="m03MixHandleBtn">提交处置并标记「已处理」</button>
          </div>
        ` : `<p style="color:#4ade80;">该生产批次${r.judge === '预警' ? '预警已完成校准处置' : '全程称量偏差在允许范围内'}。</p>`}
      `);
      const hBtn = document.getElementById('m03MixHandleBtn');
      if (hBtn) {
        hBtn.onclick = () => {
          r.handled = true;
          lastCtx.closeModal();
          lastCtx.showToast(`批次 ${r.id} 预警已处置完成，预警处理率已同步更新`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      return;
    }

    if (subPageId === 'pavement') {
      const r = pavementRecords.find(x => x.id === id);
      if (!r) return;
      const tempProfile = [r.temp + 2, r.temp + 1, r.temp, r.temp - 1, r.temp + 1];
      lastCtx.openModal(`路面摊铺碾压质控详情 · ${r.stake}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>施工层位 / 方向</span><strong>${r.layer} · ${r.dir.split('（')[0]}</strong></div>
          <div class="detail-stat-card"><span>实测压实度 / 遍数</span><strong style="color:${r.compaction >= 98 ? '#4ade80' : '#facc15'};">${r.compaction.toFixed(1)}% · ${r.passes}遍</strong></div>
          <div class="detail-stat-card"><span>实测厚度 / 设计值</span><strong style="color:${r.thickness >= r.designThick - 0.3 ? '#4ade80' : '#facc15'};">${r.thickness.toFixed(1)} / ${r.designThick.toFixed(1)} cm</strong></div>
        </div>
        <div class="m03-modal-form">
          <div class="m03-modal-section-title">北斗压实轨迹与摊铺温度沿程分布</div>
          ${renderTrendLineSvg({
            idPrefix: 'modal-pav',
            points: ['起点', '1/4段', '1/2段', '3/4段', '终点'].map((lbl, idx) => ({
              label: lbl,
              value: Math.min(99.8, Math.max(96.5, r.compaction + (idx === 2 ? -0.3 : 0.2)))
            })),
            minY: 96,
            maxY: 100,
            ticks: [96, 97, 98, 99, 100].map(v => ({ val: v, label: v + '%' }))
          })}
          <div style="font-size:12px;color:#bae6fd;">红外连续测温采样：${tempProfile.map(t => t + '℃').join(' → ')}</div>
        </div>
        ${r.judge !== '合格' && !r.verified ? `<button class="btn-primary-glow" id="m03PavVerifyBtn">核查补压/补铺结果并标记「已核查」</button>` : ''}
      `);
      const vBtn = document.getElementById('m03PavVerifyBtn');
      if (vBtn) {
        vBtn.onclick = () => {
          r.verified = true;
          lastCtx.closeModal();
          lastCtx.showToast(`已完成 ${r.stake} 路面质量预警现场核查确认`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      return;
    }

    if (subPageId === 'beamYard') {
      const r = beamRecords.find(x => x.id === id);
      if (!r) return;
      lastCtx.openModal(`智慧梁场梁片全周期追溯 · ${r.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>所属梁场 / 台座</span><strong>${r.yard} · ${r.pedestal}</strong></div>
          <div class="detail-stat-card"><span>梁型 / 浇筑日期</span><strong>${r.type} · ${r.castDate}</strong></div>
          <div class="detail-stat-card"><span>蒸汽养护温湿度</span><strong>${r.temp} / ${r.humidity}</strong></div>
        </div>
        <div class="m03-stepper">
          <div class="m03-step-box ${r.curing === '已完成' ? 'done' : ''}"><div style="font-size:11px;color:#93b8de;">1.智能养护</div><strong>${r.curing}</strong></div>
          <div class="m03-step-box ${r.tension === '合格' ? 'done' : r.tension === '待复检' ? 'warn' : ''}"><div style="font-size:11px;color:#93b8de;">2.预应力张拉</div><strong>${r.tension}</strong></div>
          <div class="m03-step-box ${r.grout === '合格' ? 'done' : ''}"><div style="font-size:11px;color:#93b8de;">3.孔道压浆</div><strong>${r.grout}</strong></div>
          <div class="m03-step-box ${r.inspect === '合格' ? 'done' : ''}"><div style="font-size:11px;color:#93b8de;">4.成品检验</div><strong>${r.inspect}</strong></div>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:130px;">张拉伸长量偏差</th><td>${r.elongation}</td><th style="width:130px;">压浆持荷压力</th><td>${r.groutPressure}</td></tr>
          </tbody>
        </table>
        ${r.tension === '待复检' || r.alertState === '跟踪中' ? `
          <button class="btn-primary-glow" id="m03BeamClearBtn">确认工序复检合格并清除预警</button>
        ` : r.statusState === 'producing' ? `
          <button class="btn-primary-glow" id="m03BeamAdvanceBtn">推进下一质检工序（模拟验收）</button>
        ` : `<p style="color:#4ade80;">该梁片已完成全部智慧梁场工序检验并出具二维码出厂合格证。</p>`}
      `);
      const clrBtn = document.getElementById('m03BeamClearBtn');
      if (clrBtn) {
        clrBtn.onclick = () => {
          r.curing = '已完成';
          if (r.tension === '待复检') r.tension = '合格';
          r.alertState = '已处理';
          r.temp = '45.2 ℃';
          lastCtx.closeModal();
          lastCtx.showToast(`梁片 ${r.id} 工序预警已复检合格`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      const advBtn = document.getElementById('m03BeamAdvanceBtn');
      if (advBtn) {
        advBtn.onclick = () => {
          if (r.curing !== '已完成') r.curing = '已完成';
          else if (r.tension !== '合格') { r.tension = '合格'; r.elongation = '+1.6%'; }
          else if (r.grout !== '合格') { r.grout = '合格'; r.groutPressure = '0.62 MPa'; }
          else { r.inspect = '合格'; r.statusState = 'inspected'; }
          lastCtx.closeModal();
          lastCtx.showToast(`已推进梁片 ${r.id} 工序状态`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
      return;
    }

    if (subPageId === 'issues') {
      const r = qualityIssues.find(x => x.id === id);
      if (!r) return;
      const safeMeasure = (lastCtx && typeof lastCtx.escHtml === 'function')
        ? lastCtx.escHtml(r.measure)
        : String(r.measure || '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
      lastCtx.openModal(`质量问题整改闭环单 · ${r.id}`, `
        <div class="detail-grid">
          <div class="detail-stat-card"><span>所属工区 / 问题类型</span><strong>${r.section} · ${r.type}</strong></div>
          <div class="detail-stat-card"><span>整改责任单位</span><strong>${r.unit}</strong></div>
          <div class="detail-stat-card"><span>整改状态 / 期限</span><strong style="color:${r.status === '已整改' ? '#4ade80' : '#38bdf8'};">${r.status} · ${r.deadline}</strong></div>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">问题描述</th><td>${r.desc}</td><th style="width:120px;">发现时间</th><td>${r.foundAt}</td></tr>
            <tr><th>整改措施</th><td colspan="3">${safeMeasure}</td></tr>
          </tbody>
        </table>
        ${r.status !== '已整改' ? `
          <div class="m03-modal-form">
            <div class="m03-modal-section-title">监理复核与整改销号</div>
            <textarea class="m03-modal-textarea" id="m03IssueMeasureInput">${safeMeasure}</textarea>
            <button class="btn-primary-glow" id="m03IssueCloseBtn">确认整改落实并销号（「整改中」→「已整改」）</button>
          </div>
        ` : `<p style="color:#4ade80;">该质量问题已完成现场复核销号，整改用时 ${r.daysUsed || 2.1} 天。</p>`}
      `);
      const closeIssueBtn = document.getElementById('m03IssueCloseBtn');
      if (closeIssueBtn) {
        closeIssueBtn.onclick = () => {
          const txt = document.getElementById('m03IssueMeasureInput');
          if (txt && txt.value.trim()) r.measure = txt.value.trim();
          r.status = '已整改';
          r.daysUsed = 1.9;
          lastCtx.closeModal();
          lastCtx.showToast(`问题 ${r.id} 已完成整改复核销号，整改进展已更新`);
          renderPage(lastHost, lastSubPageId, lastCtx);
        };
      }
    }
  }

  function openAllStationsModal(secId) {
    if (!lastCtx) return;
    const rows = SECTIONS.filter(s => !secId || s.id === secId);
    lastCtx.openModal('全线关键场站质量与数据同步清单', `
      <table class="data-table">
        <thead><tr><th>工区</th><th>拌合站</th><th>实验室</th><th>服务梁场</th><th>在线状态</th><th>同步时间</th></tr></thead>
        <tbody>
          ${rows.map(s => `
            <tr>
              <td>${s.name}</td>
              <td>${s.stationFull}</td>
              <td>${s.lab}</td>
              <td>${s.yard}</td>
              <td><span class="status-tag ok">运行正常</span></td>
              <td style="font-variant-numeric:tabular-nums;">2026-11-25 10:45</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
  }

  /* ------------------------------------------------------------------------
     RENDER DISPATCH & EVENT BINDING
     ------------------------------------------------------------------------ */
  function renderPage(hostEl, subPageId, ctx) {
    ensureStyles();
    lastCtx = ctx;
    lastHost = hostEl;
    lastSubPageId = subPageId || 'overview';

    if (lastRenderedSecId !== ctx.state.activeSectionId) {
      lastRenderedSecId = ctx.state.activeSectionId;
      Object.keys(uiState).forEach(k => { uiState[k].page = 1; });
      uiState.lab.labName = '';
      uiState.mixing.station = '';
    }

    let html = '';
    switch (lastSubPageId) {
      case 'lab': html = renderLab(ctx); break;
      case 'mixing': html = renderMixing(ctx); break;
      case 'pavement': html = renderPavement(ctx); break;
      case 'beamYard': html = renderBeamYard(ctx); break;
      case 'issues': html = renderIssues(ctx); break;
      default: html = renderOverview(ctx); break;
    }

    hostEl.innerHTML = html;
    bindStageEvents(hostEl, lastSubPageId, ctx);
  }

  function bindStageEvents(hostEl, subPageId, ctx) {
    const st = uiState[subPageId] || uiState.overview;

    // Filter selects
    hostEl.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        const key = e.target.dataset.filter;
        const val = e.target.value;
        if (key === 'section') {
          st.page = 1;
          syncSectionToHost(val);
          return;
        }
        st[key] = val;
        st.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Query / Reset / Open Original System / View Stations
    hostEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'query') {
          st.page = 1;
          renderPage(hostEl, subPageId, ctx);
          ctx.showToast('已按当前筛选条件刷新质量数据');
        } else if (act === 'reset') {
          Object.keys(st).forEach(k => {
            if (k === 'period') st[k] = '2026年11月';
            else if (k === 'quickFilter') st[k] = '全部';
            else if (k === 'page') st[k] = 1;
            else st[k] = '';
          });
          if (ctx.state.activeSectionId) {
            syncSectionToHost('');
          } else {
            renderPage(hostEl, subPageId, ctx);
          }
          ctx.showToast('已重置质量管理筛选条件');
        } else if (act === 'openSys') {
          const sysNames = {
            lab: ['智慧工地试验室 LIMS 系统', '已接入全线 6 座工地试验室万能机、压力机、沥青针入度仪与马歇尔自动采集终端，支持曲线溯源与电子签章。'],
            mixing: ['混凝土及水稳拌合站智能监控系统', '实时对接全线 6 座拌合站 PLC 称量模块，按盘采集骨料/胶凝材料偏差与出料温度。'],
            pavement: ['路面摊铺碾压北斗智能质控系统', '实时回传摊铺机红外测温阵列与双钢轮/胶轮压路机北斗高精度碾压遍数轨迹。'],
            beamYard: ['智慧梁场工业互联网管控平台', '对接 1 号、2 号智慧梁场移动台座、智能喷淋养生、双控张拉与真空压浆物联网端机。']
          };
          const meta = sysNames[subPageId] || ['质量业务原系统', '实时数据同步链路在线。'];
          openOriginalSystemModal(meta[0], meta[1]);
        } else if (act === 'viewStations') {
          openAllStationsModal(ctx.state.activeSectionId);
        }
      });
    });

    // Quick filter pills & side footer jump
    hostEl.querySelectorAll('[data-quick]').forEach(btn => {
      btn.addEventListener('click', () => {
        st.quickFilter = btn.dataset.quick;
        st.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-quick-jump]').forEach(btn => {
      btn.addEventListener('click', () => {
        st.quickFilter = btn.dataset.quickJump;
        st.page = 1;
        renderPage(hostEl, subPageId, ctx);
        ctx.showToast(`已定位筛选：${st.quickFilter}`);
      });
    });

    // Pagination buttons
    hostEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextPage = Number(btn.dataset.page);
        if (!Number.isFinite(nextPage) || nextPage < 1) return;
        st.page = nextPage;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Bar chart click -> toggle work section filter
    hostEl.querySelectorAll('[data-sec-pick]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.secPick;
        syncSectionToHost(ctx.state.activeSectionId === target ? '' : target);
      });
    });

    // Donut segment / legend click -> quick filter
    hostEl.querySelectorAll('[data-donut-filter]').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.dataset.donutFilter;
        if (subPageId === 'overview') st.quickFilter = val;
        else if (subPageId === 'lab') st.category = st.category === val ? '' : val;
        else if (subPageId === 'mixing') st.prodType = st.prodType === val ? '' : val;
        else if (subPageId === 'beamYard') st.beamType = st.beamType === val ? '' : val;
        else if (subPageId === 'issues') st.issueType = st.issueType === val ? '' : val;
        st.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Side station cards jump (overview -> mixing/beamYard/lab)
    hostEl.querySelectorAll('[data-jump-sub]').forEach(card => {
      card.addEventListener('click', () => {
        ctx.switchModule('quality', card.dataset.jumpSub);
      });
    });

    // Row & alert card detail modals
    hostEl.querySelectorAll('[data-detail-id]').forEach(el => {
      el.addEventListener('click', () => {
        openDetailModal(subPageId, el.dataset.detailId);
      });
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'quality',
    name: '质量管理',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange() {
      // render() is already called by syncAllViews() with updated activeSectionId
    },

    onLeave() {
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
    }
  });
})();
