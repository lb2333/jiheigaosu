/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 8：计量管理 (js/modules/m08_measure.js)
   包含 4 个子页面：计量总览、分工区统计、实物进度对照、原始记录
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'overview', name: '计量总览' },
    { id: 'sectionStats', name: '分工区统计' },
    { id: 'physicalCompare', name: '实物进度对照' },
    { id: 'rawRecords', name: '原始记录' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', contract: 'A1合同段', stake: 'K0+000 ~ K24+500', supervisor: '第一总监办', cumBase: 10050.40, paidReturn: 1100.00, payReturned: true },
    { id: 'sec2', name: '二工区', contract: 'A2合同段', stake: 'K24+500 ~ K48+200', supervisor: '第二总监办', cumBase: 12864.60, paidReturn: 1520.00, payReturned: true },
    { id: 'sec3', name: '三工区', contract: 'A3合同段', stake: 'K48+200 ~ K72+800', supervisor: '第二总监办', cumBase: 9754.20, paidReturn: 1086.40, payReturned: true },
    { id: 'sec4', name: '四工区', contract: 'A4合同段', stake: 'K72+800 ~ K96+000', supervisor: '第三总监办', cumBase: 11996.80, paidReturn: 1350.10, payReturned: true },
    { id: 'sec5', name: '五工区', contract: 'A5合同段', stake: 'K96+000 ~ K121+400', supervisor: '第三总监办', cumBase: 10742.00, paidReturn: 1262.60, payReturned: true },
    { id: 'sec6', name: '六工区', contract: 'A6合同段', stake: 'K121+400 ~ K146+800', supervisor: '第四总监办', cumBase: 8174.40, paidReturn: 0, payReturned: false }
  ];

  const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

  // 近6期全线已确认计量金额（万元），6期合计 = 63,582.40 万元
  const SIX_PERIODS = [
    { period: '2026年06月', short: '6月', total: 6810.30, cumTotal: 6810.30, scale: 6810.30 / 8426.80 },
    { period: '2026年07月', short: '7月', total: 8425.70, cumTotal: 15236.00, scale: 8425.70 / 8426.80 },
    { period: '2026年08月', short: '8月', total: 10985.20, cumTotal: 26221.20, scale: 10985.20 / 8426.80 },
    { period: '2026年09月', short: '9月', total: 13526.40, cumTotal: 39747.60, scale: 13526.40 / 8426.80 },
    { period: '2026年10月', short: '10月', total: 15408.00, cumTotal: 55155.60, scale: 15408.00 / 8426.80 },
    { period: '2026年11月', short: '11月', total: 8426.80, cumTotal: 63582.40, scale: 1 }
  ];

  const PERIOD_OPTIONS = ['2026年11月', '2026年10月', '2026年09月', '2026年08月', '2026年07月', '2026年06月'];

  const WORK_ITEMS = ['路基土方', '桥梁桩基', '桥梁预制梁', '水稳基层', '沥青中面层', '路基防护'];
  const MATCHED_ITEMS = ['路基土方', '桥梁桩基', '桥梁预制梁', '水稳基层', '沥青中面层'];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    ext: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    coin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><ellipse cx="12" cy="6" rx="7" ry="3"/><path d="M5 6v6c0 1.66 3.13 3 7 3s7-1.34 7-3V6"/><path d="M5 12v6c0 1.66 3.13 3 7 3s7-1.34 7-3v-6"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    listDoc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="3" width="14" height="18" rx="2"/><line x1="9" y1="9" x2="15" y2="9"/><line x1="9" y1="13" x2="15" y2="13"/><line x1="9" y1="17" x2="13" y2="17"/></svg>`,
    checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    docWarn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="12" x2="12" y2="15"/><circle cx="12" cy="18" r="0.6" fill="currentColor"/></svg>`,
    sync: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>`,
    pin: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.6"/></svg>`,
    grid: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>`,
    filePdf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="14" x2="16" y2="14"/><line x1="8" y1="17" x2="14" y2="17"/></svg>`,
    fileXls: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><rect x="8" y="12" width="8" height="6" rx="1"/></svg>`
  };

  /* ------------------------------------------------------------------------
     GENUINE RECONCILED DATASET (36 Records for 2026年11月)
     Sums:
       - Total records: 36 (sec1=6, sec2=8, sec3=6, sec4=7, sec5=5, sec6=4)
       - Statuses: 已确认=24, 审核中=8, 待审核=4
       - Payment statuses: 已支付=12, 办理中=5, 待支付=7, 未回传=12
       - Confirmed amount sum: 1420.50 + 1867.20 + 1376.40 + 1549.80 + 1262.60 + 950.30 = 8,426.80 万元
       - Cumulative amount sum: 10050.40 + 12864.60 + 9754.20 + 11996.80 + 10742.00 + 8174.40 = 63,582.40 万元
       - Paid returned sum (5/6 sections): 1100.00 + 1520.00 + 1086.40 + 1350.10 + 1262.60 = 6,319.10 万元
     ------------------------------------------------------------------------ */
  const BASE_RECORDS_NOV = [
    // 首屏置顶 6 条精确对齐示意图 01 与 04
    { id: 'JL-A2-202611-018', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '路基土方', period: '2026年11月', amount: 636.50, status: '已确认', payStatus: '已支付', paidAmount: 636.50, payTime: '11-25 16:40', syncTime: '2026-11-26 10:45', stakeRange: 'K26+100 ~ K31+400', qtyDesc: '填方 14.2 万m³ / 挖方 3.8 万m³', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A1-202611-011', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '桥梁桩基', period: '2026年11月', amount: 284.70, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K08+400 ~ K12+200', qtyDesc: '钻孔灌注桩 24 根（φ1.5m）', reviewer: '第一总监办 · 王宁' },
    { id: 'JL-A3-202611-019', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '水稳基层', period: '2026年11月', amount: 320.50, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K51+200 ~ K56+800', qtyDesc: '水泥稳定碎石基层 4.8 万m²', reviewer: '第二总监办 · 孙凯' },
    { id: 'JL-A4-202611-023', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '沥青中面层', period: '2026年11月', amount: 312.80, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K74+500 ~ K79+100', qtyDesc: 'AC-20C 改性沥青中面层 3.4 万m²', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A5-202611-027', sectionId: 'sec5', section: '五工区', contract: 'A5合同段', item: '桥梁预制梁', period: '2026年11月', amount: 216.30, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K99+600 ~ K104+200', qtyDesc: '30m 预应力箱梁预制与安装 18 片', reviewer: '第三总监办 · 林峰' },
    { id: 'JL-A6-202611-031', sectionId: 'sec6', section: '六工区', contract: 'A6合同段', item: '路基防护', period: '2026年11月', amount: 168.20, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K124+800 ~ K130+400', qtyDesc: '拱形骨架护坡及急流槽 6,200 m³', reviewer: '第四总监办 · 韩涛' },

    // 一工区其余 5 条 (总计 6 条，已确认 4 条合计 1,420.50 万)
    { id: 'JL-A1-202611-005', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '路基土方', period: '2026年11月', amount: 468.20, status: '已确认', payStatus: '已支付', paidAmount: 468.20, payTime: '11-25 14:20', syncTime: '2026-11-26 10:45', stakeRange: 'K01+200 ~ K06+800', qtyDesc: '路基清表与分层填筑 11.6 万m³', reviewer: '第一总监办 · 王宁' },
    { id: 'JL-A1-202611-008', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '桥梁预制梁', period: '2026年11月', amount: 386.40, status: '已确认', payStatus: '已支付', paidAmount: 386.40, payTime: '11-24 16:50', syncTime: '2026-11-26 10:45', stakeRange: 'K14+000 ~ K18+300', qtyDesc: '30m 箱梁预制架设 32 片', reviewer: '第一总监办 · 王宁' },
    { id: 'JL-A1-202611-015', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '水稳基层', period: '2026年11月', amount: 281.20, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K18+500 ~ K22+100', qtyDesc: '底基层及基层摊铺 4.2 万m²', reviewer: '第一总监办 · 王宁' },
    { id: 'JL-A1-202611-017', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '沥青中面层', period: '2026年11月', amount: 215.60, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K22+100 ~ K24+500', qtyDesc: '沥青混凝土中面层 2.3 万m²', reviewer: '第一总监办 · 王宁' },
    { id: 'JL-A1-202611-022', sectionId: 'sec1', section: '一工区', contract: 'A1合同段', item: '路基防护', period: '2026年11月', amount: 136.40, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K04+500 ~ K07+900', qtyDesc: '边坡排水沟及挡土墙砌筑', reviewer: '第一总监办 · 王宁' },

    // 二工区其余 7 条 (总计 8 条，已确认 6 条合计 1,867.20 万)
    { id: 'JL-A2-202611-014', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '桥梁桩基', period: '2026年11月', amount: 424.60, status: '已确认', payStatus: '已支付', paidAmount: 424.60, payTime: '11-25 15:10', syncTime: '2026-11-26 10:45', stakeRange: 'K33+200 ~ K36+800', qtyDesc: '桥梁钻孔灌注桩 34 根（φ1.6m）', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-021', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '桥梁预制梁', period: '2026年11月', amount: 315.20, status: '已确认', payStatus: '已支付', paidAmount: 315.20, payTime: '11-24 17:20', syncTime: '2026-11-26 10:45', stakeRange: 'K37+100 ~ K40+500', qtyDesc: '40m 预应力T梁及箱梁 26 片', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-025', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '水稳基层', period: '2026年11月', amount: 143.70, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K41+000 ~ K43+600', qtyDesc: '左幅水稳上基层 2.1 万m²', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-026', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '水稳基层', period: '2026年11月', amount: 142.60, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K43+600 ~ K46+000', qtyDesc: '右幅水稳上基层 2.1 万m²', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-029', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '沥青中面层', period: '2026年11月', amount: 204.60, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K46+000 ~ K48+200', qtyDesc: '沥青中面层试铺及连续摊铺 2.2 万m²', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-032', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '路基土方', period: '2026年11月', amount: 185.40, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K31+400 ~ K33+100', qtyDesc: '高填方路堤强夯及土方补填', reviewer: '第二总监办 · 周志远' },
    { id: 'JL-A2-202611-035', sectionId: 'sec2', section: '二工区', contract: 'A2合同段', item: '路基防护', period: '2026年11月', amount: 118.00, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K28+000 ~ K30+500', qtyDesc: '边坡预制块六角护坡工程', reviewer: '第二总监办 · 周志远' },

    // 三工区其余 5 条 (总计 6 条，已确认 4 条合计 1,376.40 万)
    { id: 'JL-A3-202611-006', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '路基土方', period: '2026年11月', amount: 462.80, status: '已确认', payStatus: '已支付', paidAmount: 462.80, payTime: '11-25 13:50', syncTime: '2026-11-26 10:45', stakeRange: 'K48+200 ~ K51+200', qtyDesc: '路基土石方调配填筑 10.8 万m³', reviewer: '第二总监办 · 孙凯' },
    { id: 'JL-A3-202611-010', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '桥梁桩基', period: '2026年11月', amount: 358.20, status: '已确认', payStatus: '已支付', paidAmount: 358.20, payTime: '11-24 15:30', syncTime: '2026-11-26 10:45', stakeRange: 'K57+000 ~ K61+400', qtyDesc: '跨河大桥主墩桩基 28 根', reviewer: '第二总监办 · 孙凯' },
    { id: 'JL-A3-202611-014', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '桥梁预制梁', period: '2026年11月', amount: 265.40, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K62+000 ~ K66+800', qtyDesc: '25m/30m 预制箱梁 22 片', reviewer: '第二总监办 · 孙凯' },
    { id: 'JL-A3-202611-021', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '沥青中面层', period: '2026年11月', amount: 290.00, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K67+000 ~ K71+500', qtyDesc: '改性沥青中面层 3.1 万m²', reviewer: '第二总监办 · 孙凯' },
    { id: 'JL-A3-202611-024', sectionId: 'sec3', section: '三工区', contract: 'A3合同段', item: '路基防护', period: '2026年11月', amount: 142.30, status: '审核中', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K71+500 ~ K72+800', qtyDesc: '路堑边坡锚杆框架梁防护', reviewer: '第二总监办 · 孙凯' },

    // 四工区其余 6 条 (总计 7 条，已确认 5 条合计 1,549.80 万)
    { id: 'JL-A4-202611-004', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '路基土方', period: '2026年11月', amount: 485.60, status: '已确认', payStatus: '已支付', paidAmount: 485.60, payTime: '11-25 11:45', syncTime: '2026-11-26 10:45', stakeRange: 'K79+200 ~ K84+500', qtyDesc: '黑土区表土剥离及路堤填筑 11.2 万m³', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A4-202611-009', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '桥梁桩基', period: '2026年11月', amount: 342.50, status: '已确认', payStatus: '已支付', paidAmount: 342.50, payTime: '11-24 14:15', syncTime: '2026-11-26 10:45', stakeRange: 'K84+800 ~ K88+400', qtyDesc: '分离立交及通道桥桩基 27 根', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A4-202611-013', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '桥梁预制梁', period: '2026年11月', amount: 248.90, status: '已确认', payStatus: '已支付', paidAmount: 248.90, payTime: '11-23 17:10', syncTime: '2026-11-26 10:45', stakeRange: 'K88+600 ~ K92+100', qtyDesc: '30m 预制箱梁架设 20 片', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A4-202611-017', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '水稳基层', period: '2026年11月', amount: 160.00, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K92+200 ~ K96+000', qtyDesc: '双层连铺水稳碎石基层 2.4 万m²', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A4-202611-026', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '路基土方', period: '2026年11月', amount: 198.40, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K72+800 ~ K74+500', qtyDesc: '软基换填砂砾及路床精平', reviewer: '第三总监办 · 赵磊' },
    { id: 'JL-A4-202611-030', sectionId: 'sec4', section: '四工区', contract: 'A4合同段', item: '水稳基层', period: '2026年11月', amount: 154.20, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K76+100 ~ K78+900', qtyDesc: '水稳底基层补段施工 2.3 万m²', reviewer: '第三总监办 · 赵磊' },

    // 五工区其余 4 条 (总计 5 条，已确认 3 条合计 1,262.60 万)
    { id: 'JL-A5-202611-007', sectionId: 'sec5', section: '五工区', contract: 'A5合同段', item: '路基土方', period: '2026年11月', amount: 512.40, status: '已确认', payStatus: '已支付', paidAmount: 512.40, payTime: '11-25 15:30', syncTime: '2026-11-26 10:45', stakeRange: 'K96+000 ~ K99+600', qtyDesc: '路基土方压实成型 11.8 万m³', reviewer: '第三总监办 · 林峰' },
    { id: 'JL-A5-202611-012', sectionId: 'sec5', section: '五工区', contract: 'A5合同段', item: '桥梁桩基', period: '2026年11月', amount: 428.00, status: '已确认', payStatus: '已支付', paidAmount: 428.00, payTime: '11-24 16:05', syncTime: '2026-11-26 10:45', stakeRange: 'K104+500 ~ K110+200', qtyDesc: '互通匝道桥及主线桥桩基 35 根', reviewer: '第三总监办 · 林峰' },
    { id: 'JL-A5-202611-018', sectionId: 'sec5', section: '五工区', contract: 'A5合同段', item: '水稳基层', period: '2026年11月', amount: 322.20, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K110+500 ~ K118+000', qtyDesc: '全幅水稳碎石基层 4.9 万m²', reviewer: '第三总监办 · 林峰' },
    { id: 'JL-A5-202611-029', sectionId: 'sec5', section: '五工区', contract: 'A5合同段', item: '沥青中面层', period: '2026年11月', amount: 175.80, status: '审核中', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K118+000 ~ K121+400', qtyDesc: '沥青中面层摊铺 1.9 万m²', reviewer: '第三总监办 · 林峰' },

    // 六工区其余 3 条 (总计 4 条，已确认 2 条合计 950.30 万，全部未回传)
    { id: 'JL-A6-202611-009', sectionId: 'sec6', section: '六工区', contract: 'A6合同段', item: '路基土方', period: '2026年11月', amount: 536.80, status: '已确认', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K121+400 ~ K124+800', qtyDesc: '建华枢纽互通区土方填筑 12.4 万m³', reviewer: '第四总监办 · 韩涛' },
    { id: 'JL-A6-202611-016', sectionId: 'sec6', section: '六工区', contract: 'A6合同段', item: '桥梁桩基', period: '2026年11月', amount: 413.50, status: '已确认', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K131+000 ~ K140+200', qtyDesc: '枢纽主线桥及跨线桥桩基 32 根', reviewer: '第四总监办 · 韩涛' },
    { id: 'JL-A6-202611-034', sectionId: 'sec6', section: '六工区', contract: 'A6合同段', item: '水稳基层', period: '2026年11月', amount: 145.60, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K140+500 ~ K146+800', qtyDesc: '终点衔接段水稳基层 2.2 万m²', reviewer: '第四总监办 · 韩涛' }
  ];

  // 各工区 5 大匹配分项的实物进度对照数据（每工区本期计量金额精确等于该工区已确认计量总额）
  const PHYSICAL_DATA_BY_SEC = {
    sec1: [
      { item: '路基土方', unit: '万m³', contractQty: 108.0, measuredQty: 66.4, physicalQty: 72.1, periodAmt: 468.20, recId: 'JL-A1-202611-005' },
      { item: '桥梁桩基', unit: '根', contractQty: 132, measuredQty: 98, physicalQty: 105, periodAmt: 284.70, recId: 'JL-A1-202611-011' },
      { item: '桥梁预制梁', unit: '片', contractQty: 190, measuredQty: 120, physicalQty: 131, periodAmt: 386.40, recId: 'JL-A1-202611-008' },
      { item: '水稳基层', unit: '万m²', contractQty: 56.0, measuredQty: 27.6, physicalQty: 30.8, periodAmt: 281.20, recId: 'JL-A1-202611-015' },
      { item: '沥青中面层', unit: '万m²', contractQty: 46.0, measuredQty: 14.2, physicalQty: 16.5, periodAmt: 0.00, recId: 'JL-A1-202611-017' }
    ],
    sec2: [
      { item: '路基土方', unit: '万m³', contractQty: 120.0, measuredQty: 68.2, physicalQty: 74.8, periodAmt: 636.50, recId: 'JL-A2-202611-018' },
      { item: '桥梁桩基', unit: '根', contractQty: 156, measuredQty: 112, physicalQty: 120, periodAmt: 424.60, recId: 'JL-A2-202611-014' },
      { item: '桥梁预制梁', unit: '片', contractQty: 220, measuredQty: 132, physicalQty: 146, periodAmt: 315.20, recId: 'JL-A2-202611-021' },
      { item: '水稳基层', unit: '万m²', contractQty: 64.0, measuredQty: 28.4, physicalQty: 31.6, periodAmt: 286.30, recId: 'JL-A2-202611-025' },
      { item: '沥青中面层', unit: '万m²', contractQty: 52.0, measuredQty: 16.8, physicalQty: 18.4, periodAmt: 204.60, recId: 'JL-A2-202611-029' }
    ],
    sec3: [
      { item: '路基土方', unit: '万m³', contractQty: 112.0, measuredQty: 61.5, physicalQty: 67.2, periodAmt: 462.80, recId: 'JL-A3-202611-006' },
      { item: '桥梁桩基', unit: '根', contractQty: 140, measuredQty: 96, physicalQty: 104, periodAmt: 358.20, recId: 'JL-A3-202611-010' },
      { item: '桥梁预制梁', unit: '片', contractQty: 180, measuredQty: 102, physicalQty: 115, periodAmt: 265.40, recId: 'JL-A3-202611-014' },
      { item: '水稳基层', unit: '万m²', contractQty: 58.0, measuredQty: 24.0, physicalQty: 27.9, periodAmt: 0.00, recId: 'JL-A3-202611-019' },
      { item: '沥青中面层', unit: '万m²', contractQty: 48.0, measuredQty: 15.1, physicalQty: 16.8, periodAmt: 290.00, recId: 'JL-A3-202611-021' }
    ],
    sec4: [
      { item: '路基土方', unit: '万m³', contractQty: 115.0, measuredQty: 64.8, physicalQty: 71.0, periodAmt: 485.60, recId: 'JL-A4-202611-004' },
      { item: '桥梁桩基', unit: '根', contractQty: 148, measuredQty: 106, physicalQty: 114, periodAmt: 342.50, recId: 'JL-A4-202611-009' },
      { item: '桥梁预制梁', unit: '片', contractQty: 196, measuredQty: 118, physicalQty: 129, periodAmt: 248.90, recId: 'JL-A4-202611-013' },
      { item: '水稳基层', unit: '万m²', contractQty: 60.0, measuredQty: 26.2, physicalQty: 29.4, periodAmt: 160.00, recId: 'JL-A4-202611-017' },
      { item: '沥青中面层', unit: '万m²', contractQty: 50.0, measuredQty: 17.6, physicalQty: 19.2, periodAmt: 312.80, recId: 'JL-A4-202611-023' }
    ],
    sec5: [
      { item: '路基土方', unit: '万m³', contractQty: 106.0, measuredQty: 60.2, physicalQty: 66.8, periodAmt: 512.40, recId: 'JL-A5-202611-007' },
      { item: '桥梁桩基', unit: '根', contractQty: 136, measuredQty: 94, physicalQty: 102, periodAmt: 428.00, recId: 'JL-A5-202611-012' },
      { item: '桥梁预制梁', unit: '片', contractQty: 176, measuredQty: 98, physicalQty: 110, periodAmt: 0.00, recId: 'JL-A5-202611-027' },
      { item: '水稳基层', unit: '万m²', contractQty: 54.0, measuredQty: 25.0, physicalQty: 27.6, periodAmt: 322.20, recId: 'JL-A5-202611-018' },
      { item: '沥青中面层', unit: '万m²', contractQty: 44.0, measuredQty: 13.4, physicalQty: 15.1, periodAmt: 0.00, recId: 'JL-A5-202611-029' }
    ],
    sec6: [
      { item: '路基土方', unit: '万m³', contractQty: 118.0, measuredQty: 62.4, physicalQty: 69.5, periodAmt: 536.80, recId: 'JL-A6-202611-009' },
      { item: '桥梁桩基', unit: '根', contractQty: 164, measuredQty: 108, physicalQty: 116, periodAmt: 413.50, recId: 'JL-A6-202611-016' },
      { item: '桥梁预制梁', unit: '片', contractQty: 210, measuredQty: 105, physicalQty: 118, periodAmt: 0.00, recId: 'JL-A6-202611-009' },
      { item: '水稳基层', unit: '万m²', contractQty: 62.0, measuredQty: 21.8, physicalQty: 24.9, periodAmt: 0.00, recId: 'JL-A6-202611-034' },
      { item: '沥青中面层', unit: '万m²', contractQty: 54.0, measuredQty: 12.0, physicalQty: 14.2, periodAmt: 0.00, recId: 'JL-A6-202611-031' }
    ]
  };

  /* ------------------------------------------------------------------------
     PERSISTENT MODULE STATE
     ------------------------------------------------------------------------ */
  const uiState = {
    overview: {
      period: '2026年11月',
      caliber: '已确认计量',
      statusFilter: '',
      page: 1
    },
    sectionStats: {
      contract: '',
      item: '',
      period: '2026年11月',
      selectedSecId: 'sec2'
    },
    physicalCompare: {
      fallbackSecId: 'sec2',
      item: '',
      period: '2026年11月',
      selectedItem: '路基土方'
    },
    rawRecords: {
      period: '2026年11月',
      status: '',
      payStatus: '',
      keyword: '',
      selectedId: 'JL-A2-202611-018',
      page: 1
    }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'overview';
  let lastRenderedSecId = null;

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (<style id="m08-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m08-styles')) return;
    const style = document.createElement('style');
    style.id = 'm08-styles';
    style.textContent = `
      .m08-page {
        padding: 10px 18px 64px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }

      /* Filter Toolbar */
      .m08-filter-bar {
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m08-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m08-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m08-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m08-select {
        min-width: 126px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m08-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m08-search-wrap svg {
        position: absolute;
        left: 10px;
        color: #7da2cb;
        pointer-events: none;
      }
      .m08-input {
        height: 32px;
        width: 210px;
        padding: 0 10px 0 30px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(11, 38, 86, 0.82);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m08-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.28);
      }
      .m08-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m08-btn-query {
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
      .m08-btn-query:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m08-btn-outline {
        height: 32px;
        padding: 0 13px;
      }

      /* Panel Header */
      .m08-panel-header {
        cursor: default;
        padding: 8px 14px;
      }
      .m08-period-tag {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 4px;
      }
      .m08-header-meta {
        font-size: 12px;
        color: #93b8de;
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m08-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 0;
        transition: color 0.18s;
      }
      .m08-link-btn:hover {
        color: #a5f3fc;
        text-decoration: underline;
      }

      /* KPI Cards */
      .m08-kpi-grid {
        display: grid;
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m08-kpi-grid.cols-4 { grid-template-columns: repeat(4, minmax(0, 1fr)); }
      .m08-kpi-grid.cols-5 { grid-template-columns: repeat(5, minmax(0, 1fr)); }

      .m08-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m08-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        transform: translateY(-1px);
      }
      .m08-kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.22);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38f2ff;
      }
      .m08-kpi-icon.tone-green {
        background: rgba(22, 163, 74, 0.18);
        border-color: rgba(74, 222, 128, 0.38);
        color: #4ade80;
      }
      .m08-kpi-icon.tone-gold {
        background: rgba(234, 179, 8, 0.18);
        border-color: rgba(250, 204, 21, 0.42);
        color: #facc15;
      }
      .m08-kpi-icon.tone-blue {
        background: rgba(37, 99, 235, 0.24);
        border-color: rgba(96, 165, 250, 0.42);
        color: #60a5fa;
      }
      .m08-kpi-meta { min-width: 0; flex: 1; }
      .m08-kpi-label {
        font-size: 12px;
        color: #a9c6e8;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m08-kpi-val-row {
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .m08-kpi-val {
        font-size: 24px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0.3px;
        font-variant-numeric: tabular-nums;
        color: #38f2ff;
        text-shadow: 0 0 12px rgba(56, 242, 255, 0.35);
      }
      .m08-kpi-val.tone-green { color: #4ade80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.35); }
      .m08-kpi-val.tone-gold { color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
      .m08-kpi-val.tone-blue { color: #60a5fa; text-shadow: 0 0 12px rgba(96, 165, 250, 0.35); }
      .m08-kpi-unit {
        font-size: 12px;
        color: #d6e8ff;
        font-weight: 500;
      }

      /* Grids */
      .m08-grid-3 {
        display: grid;
        grid-template-columns: repeat(3, minmax(0, 1fr));
        gap: 10px;
      }
      .m08-grid-2 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .m08-split-overview {
        display: grid;
        grid-template-columns: minmax(0, 1.85fr) minmax(300px, 1fr);
        gap: 10px;
      }
      .m08-split-65-35 {
        display: grid;
        grid-template-columns: minmax(0, 1.72fr) minmax(320px, 1fr);
        gap: 10px;
      }
      .m08-split-compare {
        display: grid;
        grid-template-columns: minmax(0, 1.55fr) minmax(340px, 1fr);
        gap: 10px;
      }

      /* Charts */
      .m08-chart-body {
        padding: 10px 14px 12px;
        min-height: 176px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      }
      .m08-chart-svg {
        width: 100%;
        height: 162px;
        display: block;
      }
      .m08-bar-col {
        cursor: pointer;
        transition: opacity 0.18s;
      }
      .m08-bar-col:hover { opacity: 0.88; }

      .m08-donut-wrap {
        display: flex;
        align-items: center;
        justify-content: space-between;
        width: 100%;
        gap: 14px;
      }
      .m08-donut-svg {
        width: 150px;
        height: 150px;
        flex-shrink: 0;
      }
      .m08-legend-list {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m08-legend-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 4px 8px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.16s;
      }
      .m08-legend-row:hover, .m08-legend-row.active {
        background: rgba(56, 189, 248, 0.14);
      }
      .m08-legend-left {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #dbeafe;
        font-size: 12.5px;
      }
      .m08-legend-dot {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        flex-shrink: 0;
      }
      .m08-legend-right {
        display: inline-flex;
        align-items: center;
        gap: 12px;
        font-variant-numeric: tabular-nums;
      }
      .m08-legend-count { color: #ffffff; font-weight: 700; font-size: 13px; }
      .m08-legend-pct { color: #93b8de; font-size: 12px; min-width: 40px; text-align: right; }

      /* Payment Info Card (Page 1 & Page 2) */
      .m08-pay-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m08-pay-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m08-pay-sublabel {
        font-size: 12px;
        color: #a9c6e8;
        margin-bottom: 2px;
      }
      .m08-pay-amount {
        font-size: 22px;
        font-weight: 800;
        color: #4ade80;
        font-variant-numeric: tabular-nums;
        text-shadow: 0 0 12px rgba(74, 222, 128, 0.28);
      }
      .m08-pay-amount small {
        font-size: 12px;
        font-weight: 500;
        color: #d6e8ff;
        margin-left: 3px;
      }
      .m08-pill-badge {
        padding: 4px 10px;
        border-radius: 99px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(10, 40, 88, 0.72);
        color: #7dd3fc;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m08-pay-subhead {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12px;
        color: #a9c6e8;
      }
      .m08-pay-tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }
      .m08-pay-tile {
        padding: 9px 6px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.22);
        text-align: center;
        cursor: pointer;
        transition: all 0.18s;
      }
      .m08-pay-tile:hover {
        border-color: rgba(56, 220, 255, 0.62);
        background: rgba(18, 60, 128, 0.72);
      }
      .m08-pay-tile-name { font-size: 11.5px; color: #a9c6e8; margin-bottom: 4px; }
      .m08-pay-tile-val { font-size: 18px; font-weight: 800; font-variant-numeric: tabular-nums; }
      .m08-pay-tile-val small { font-size: 11px; font-weight: 500; color: #cfe4ff; margin-left: 2px; }

      /* Tables & Tags */
      .m08-table-wrap {
        padding: 0 14px;
        overflow-x: auto;
      }
      .m08-table th, .m08-table td {
        padding: 8px 10px;
        white-space: nowrap;
      }
      .m08-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m08-table tbody tr:hover {
        background: rgba(56, 189, 248, 0.08);
      }
      .m08-table tbody tr.active {
        background: rgba(22, 119, 255, 0.22);
        box-shadow: inset 2px 0 0 #38f2ff, inset 0 1px 0 rgba(56, 220, 255, 0.35), inset 0 -1px 0 rgba(56, 220, 255, 0.35);
      }
      .m08-num {
        font-variant-numeric: tabular-nums;
        font-weight: 700;
        color: #f1f7ff;
      }
      .m08-tag {
        display: inline-block;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m08-tag.ok { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.42); }
      .m08-tag.info { background: rgba(14, 165, 233, 0.2); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.45); }
      .m08-tag.warn { background: rgba(250, 204, 21, 0.18); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.45); }
      .m08-tag.muted { background: rgba(148, 163, 184, 0.14); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.34); }

      /* Pagination & Footers */
      .m08-table-foot {
        padding: 9px 14px 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        flex-wrap: wrap;
        font-size: 12px;
        color: #93b8de;
      }
      .m08-pager {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m08-page-btn {
        min-width: 26px;
        height: 26px;
        padding: 0 7px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.32);
        background: rgba(10, 34, 78, 0.7);
        color: #cfe4ff;
        font-size: 12px;
        cursor: pointer;
        transition: all 0.15s;
      }
      .m08-page-btn:hover:not(:disabled) {
        border-color: var(--cyan-bright);
        color: #ffffff;
      }
      .m08-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m08-page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Attention Cards (Page 1 Right) */
      .m08-side-body {
        padding: 10px 14px 12px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 10px;
      }
      .m08-att-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m08-att-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        cursor: pointer;
        transition: all 0.18s;
      }
      .m08-att-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        background: rgba(18, 58, 124, 0.72);
      }
      .m08-att-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m08-att-ico {
        width: 32px;
        height: 32px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.22);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38bdf8;
      }
      .m08-att-ico.warn {
        background: rgba(234, 179, 8, 0.18);
        border-color: rgba(250, 204, 21, 0.42);
        color: #facc15;
      }
      .m08-att-ico.muted {
        background: rgba(148, 163, 184, 0.15);
        border-color: rgba(148, 163, 184, 0.32);
        color: #94a3b8;
      }
      .m08-att-title { font-size: 13px; font-weight: 700; color: #f1f7ff; }
      .m08-att-sub { font-size: 11.5px; color: #8fb4da; font-variant-numeric: tabular-nums; margin-top: 2px; }

      .m08-side-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding-top: 8px;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: #8fb4da;
      }
      .m08-foot-clear {
        padding-right: 132px;
      }

      /* Page 3 Scope Banner & Detail Card */
      .m08-scope-banner {
        padding: 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
      }
      .m08-scope-left {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .m08-scope-ico {
        width: 34px;
        height: 34px;
        border-radius: 8px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(14, 165, 233, 0.2);
        border: 1px solid rgba(56, 189, 248, 0.4);
        color: #38f2ff;
      }
      .m08-scope-title { font-size: 14.5px; font-weight: 700; color: #ffffff; }
      .m08-scope-sub { font-size: 12px; color: #93b8de; margin-top: 1px; }
      .m08-scope-right {
        display: flex;
        align-items: center;
        gap: 14px;
        font-size: 12px;
        color: #cfe4ff;
      }

      .m08-compare-legend {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        font-size: 12px;
        color: #cfe4ff;
      }
      .m08-compare-legend span {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m08-pair-svg {
        width: 100%;
        height: 215px;
        display: block;
      }
      .m08-pair-row {
        cursor: pointer;
        transition: opacity 0.16s;
      }
      .m08-pair-row:hover { opacity: 0.9; }

      .m08-selected-body {
        padding: 12px 14px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m08-stat-duo {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .m08-stat-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.58);
        border: 1px solid rgba(56, 189, 248, 0.35);
      }
      .m08-stat-box.green {
        background: rgba(12, 54, 72, 0.56);
        border-color: rgba(74, 222, 128, 0.42);
      }
      .m08-stat-box-label { font-size: 11.5px; color: #a9c6e8; margin-bottom: 4px; }
      .m08-stat-box-val { font-size: 21px; font-weight: 800; color: #38f2ff; font-variant-numeric: tabular-nums; }
      .m08-stat-box.green .m08-stat-box-val { color: #4ade80; }
      .m08-stat-box-val small { font-size: 12px; font-weight: 500; color: #d6e8ff; margin-left: 3px; }

      .m08-kv-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m08-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        padding: 2px 0;
      }
      .m08-kv-k { color: #93b8de; }
      .m08-kv-v { color: #f1f7ff; font-weight: 700; font-variant-numeric: tabular-nums; }

      /* Page 4 Raw Record Detail Panel */
      .m08-raw-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }
      .m08-raw-id {
        font-size: 15px;
        font-weight: 800;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
      }
      .m08-subcard {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.25);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m08-subcard-title {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        font-weight: 700;
        color: #dbeafe;
      }
      .m08-attach-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m08-attach-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(10, 36, 82, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.22);
      }
      .m08-attach-left {
        display: flex;
        align-items: center;
        gap: 9px;
        min-width: 0;
      }
      .m08-attach-ico {
        color: #38bdf8;
        flex-shrink: 0;
        display: flex;
      }
      .m08-attach-name {
        font-size: 12.5px;
        font-weight: 600;
        color: #f1f7ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m08-attach-sub { font-size: 11px; color: #8fb4da; }
      .m08-attach-right {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        flex-shrink: 0;
      }
      .m08-ext-tag {
        font-size: 11px;
        color: #93b8de;
        font-weight: 600;
      }
      .m08-footnotes {
        padding: 8px 132px 10px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 8px;
        font-size: 11.5px;
        color: #8fb4da;
      }
      .m08-modal-panel {
        padding: 12px;
        border-radius: 8px;
        background: rgba(12, 40, 88, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m08-modal-heading {
        font-size: 13px;
        font-weight: 700;
        color: #7dd3fc;
      }

      @media (max-width: 1360px) {
        .m08-kpi-grid.cols-4,
        .m08-kpi-grid.cols-5 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .m08-grid-3,
        .m08-grid-2,
        .m08-split-overview,
        .m08-split-65-35,
        .m08-split-compare { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     HELPERS & PERIOD DATA BUILDER
     ------------------------------------------------------------------------ */
  function fmtMoney(n) {
    return Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }

  function fmtChartNum(n) {
    const val = Number(n);
    if (Math.abs(val - Math.round(val)) < 0.05) return Math.round(val).toLocaleString('en-US');
    return val.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 });
  }

  function fmtInt(n) {
    return Math.round(n).toLocaleString('en-US');
  }

  function statusTagClass(st) {
    if (st === '已确认' || st === '已支付' || st === '已回传') return 'ok';
    if (st === '审核中' || st === '办理中') return 'info';
    if (st === '待审核' || st === '待支付') return 'warn';
    return 'muted';
  }

  function getPeriodMeta(period) {
    return SIX_PERIODS.find(p => p.period === period) || SIX_PERIODS[SIX_PERIODS.length - 1];
  }

  function getRecordsForPeriod(period) {
    const pm = getPeriodMeta(period);
    if (pm.period === '2026年11月') {
      return BASE_RECORDS_NOV.map(r => Object.assign({}, r));
    }
    const ym = pm.period.replace('年', '').replace('月', '');
    const mm = pm.short.replace('月', '').padStart(2, '0');
    return BASE_RECORDS_NOV.map(r => {
      const scaledAmt = +(r.amount * pm.scale).toFixed(2);
      const isHistoricalDone = true;
      const st = isHistoricalDone ? '已确认' : r.status;
      const paySt = r.sectionId === 'sec6' && pm.period === '2026年10月' ? '办理中' : '已支付';
      return Object.assign({}, r, {
        id: r.id.replace('202611', ym),
        period: pm.period,
        amount: scaledAmt,
        status: st,
        payStatus: paySt,
        paidAmount: paySt === '已支付' ? scaledAmt : 0,
        payTime: paySt === '已支付' ? `${mm}-25 16:20` : '—',
        syncTime: `2026-${mm}-26 10:45`
      });
    });
  }

  function getCumAmountForSection(secId, period) {
    const pm = getPeriodMeta(period);
    const ratio = pm.cumTotal / 63582.40;
    if (!secId) return +(63582.40 * ratio).toFixed(2);
    const sec = SECTION_BY_ID[secId];
    return sec ? +(sec.cumBase * ratio).toFixed(2) : 0;
  }

  function syncSectionToHost(secId) {
    const target = secId || null;
    if (!lastCtx) return;
    if (lastCtx.state.activeSectionId === target) return;
    if (target) {
      const pill = document.querySelector(`#sectionFilters .section-pill[data-sec="${target}"]`) ||
        document.querySelector(`.section-pill[data-sec="${target}"]`);
      if (pill) { pill.click(); return; }
    } else if (lastCtx.state.activeSectionId) {
      const activePill = document.querySelector(`#sectionFilters .section-pill[data-sec="${lastCtx.state.activeSectionId}"]`) ||
        document.querySelector(`.section-pill[data-sec="${lastCtx.state.activeSectionId}"]`);
      if (activePill) { activePill.click(); return; }
    }
    lastCtx.state.activeSectionId = target;
    if (lastHost) renderPage(lastHost, lastSubPageId, lastCtx);
  }

  function renderSectionSelect(activeSecId, includeAll) {
    return `
      <div class="m08-field">
        <span class="m08-field-label">所属工区</span>
        <select class="glass-select m08-select" data-filter="section">
          ${includeAll ? `<option value="" ${!activeSecId ? 'selected' : ''}>全部工区</option>` : ''}
          ${SECTIONS.map(s => `<option value="${s.id}" ${activeSecId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function renderPeriodSelect(period) {
    return `
      <div class="m08-field">
        <span class="m08-field-label">计量期次</span>
        <select class="glass-select m08-select" data-filter="period">
          ${PERIOD_OPTIONS.map(p => `<option value="${p}" ${period === p ? 'selected' : ''}>${p}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function buildPaginationHtml(totalItems, currentPage, pageSize, unitLabel) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.max(1, Math.min(totalPages, currentPage));
    const pageButtons = [];
    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        pageButtons.push(`<button class="m08-page-btn ${i === safePage ? 'active' : ''}" data-page="${i}">${i}</button>`);
      }
    } else {
      const showSet = new Set([1, 2, 3, totalPages, safePage - 1, safePage, safePage + 1]);
      const sorted = Array.from(showSet).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
      let prev = 0;
      sorted.forEach(p => {
        if (p - prev > 1) pageButtons.push(`<span style="padding:0 3px;color:#789bc4;">...</span>`);
        pageButtons.push(`<button class="m08-page-btn ${p === safePage ? 'active' : ''}" data-page="${p}">${p}</button>`);
        prev = p;
      });
    }
    return `
      <div class="m08-pager">
        <span style="margin-right:6px;">共 ${fmtInt(totalItems)} ${unitLabel || '条记录'}</span>
        <button class="m08-page-btn" data-page="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''}>&lt;</button>
        ${pageButtons.join('')}
        <button class="m08-page-btn" data-page="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PURE INLINE SVG CHARTS (Zero external dependency)
     ------------------------------------------------------------------------ */
  function renderVerticalBarSvg(opts) {
    const { idPrefix, items, maxY, ticks, activeKey, clickAttr, gradientMode } = opts;
    const W = 480;
    const H = 172;
    const padL = 48;
    const padR = 14;
    const padT = 22;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const step = plotW / Math.max(1, items.length);
    const barW = Math.min(34, step * 0.48);

    const yFor = val => {
      const ratio = Math.max(0, Math.min(1, val / Math.max(0.01, maxY)));
      return padT + plotH * (1 - ratio);
    };

    const gridSvg = ticks.map(t => {
      const y = yFor(t.val).toFixed(1);
      return `
        <line x1="${padL}" y1="${y}" x2="${W - padR}" y2="${y}" stroke="rgba(56,189,248,0.14)" stroke-width="1"/>
        <text x="${padL - 8}" y="${Number(y) + 4}" text-anchor="end" fill="#89aed6" font-size="10.5">${t.label}</text>
      `;
    }).join('');

    const gradColors = gradientMode === 'teal'
      ? ['#2dd4bf', '#06b6d4', '#0e7490']
      : ['#38f2ff', '#0ea5e9', '#1d4ed8'];

    const barsSvg = items.map((item, idx) => {
      const cx = padL + step * (idx + 0.5);
      const x = cx - barW / 2;
      const rawY = yFor(item.value);
      const h = item.value > 0 ? Math.max(4, padT + plotH - rawY) : 0;
      const y = padT + plotH - h;
      const isActive = !activeKey || item.key === activeKey;
      const opacity = isActive ? 1 : 0.36;
      const fillUrl = (activeKey && item.key === activeKey)
        ? `url(#m08-bar-hi-${idPrefix})`
        : `url(#m08-bar-${idPrefix})`;

      return `
        <g class="m08-bar-col" opacity="${opacity}" ${clickAttr ? `${clickAttr}="${item.key}"` : ''}>
          ${h > 0 ? `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="3" fill="${fillUrl}"/>` : ''}
          <text x="${cx.toFixed(1)}" y="${(y - 6).toFixed(1)}" text-anchor="middle" fill="#f1f7ff" font-size="11" font-weight="700">${fmtChartNum(item.value)}</text>
          <text x="${cx.toFixed(1)}" y="${H - 7}" text-anchor="middle" fill="${isActive ? '#cfe4ff' : '#6c8eb5'}" font-size="11">${item.label}</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="m08-chart-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="m08-bar-${idPrefix}" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stop-color="${gradColors[0]}"/>
            <stop offset="55%" stop-color="${gradColors[1]}"/>
            <stop offset="100%" stop-color="${gradColors[2]}" stop-opacity="0.9"/>
          </linearGradient>
          <linearGradient id="m08-bar-hi-${idPrefix}" x1="0" y1="0" x2="0" y2="1">
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

  function renderDonutSvg(segments, totalCount, activeStatus) {
    const total = Math.max(1, segments.reduce((s, x) => s + x.count, 0));
    const R = 52;
    const C = 2 * Math.PI * R;
    let offset = 0;

    const arcs = segments.map(seg => {
      if (seg.count <= 0) return '';
      const len = (seg.count / total) * C;
      const gap = segments.filter(s => s.count > 0).length > 1 && len > 4 ? 2.5 : 0;
      const drawLen = Math.max(0, len - gap);
      const op = !activeStatus || activeStatus === seg.name ? 1 : 0.35;
      const el = `<circle cx="75" cy="75" r="${R}" fill="none" stroke="${seg.color}" stroke-width="15" opacity="${op}"
        stroke-dasharray="${drawLen.toFixed(2)} ${(C - drawLen).toFixed(2)}"
        stroke-dashoffset="${(-offset).toFixed(2)}"
        transform="rotate(-90 75 75)"
        style="cursor:pointer;" data-status-pick="${seg.name}"/>`;
      offset += len;
      return el;
    }).join('');

    const legendHtml = segments.map(seg => {
      const pct = totalCount > 0 ? ((seg.count / totalCount) * 100).toFixed(1) : '0.0';
      return `
        <div class="m08-legend-row ${activeStatus === seg.name ? 'active' : ''}" data-status-pick="${seg.name}">
          <span class="m08-legend-left">
            <span class="m08-legend-dot" style="background:${seg.color};box-shadow:0 0 6px ${seg.color};"></span>
            <span>${seg.name}</span>
          </span>
          <span class="m08-legend-right">
            <span class="m08-legend-count">${fmtInt(seg.count)}</span>
            <span class="m08-legend-pct">${pct}%</span>
          </span>
        </div>
      `;
    }).join('');

    return `
      <div class="m08-donut-wrap">
        <svg class="m08-donut-svg" viewBox="0 0 150 150">
          <circle cx="75" cy="75" r="${R}" fill="none" stroke="rgba(148,197,255,0.12)" stroke-width="15"/>
          ${arcs}
          <text x="75" y="72" text-anchor="middle" fill="#ffffff" font-size="21" font-weight="800" pointer-events="none">${fmtInt(totalCount)}<tspan font-size="11.5" font-weight="500" dx="2">条</tspan></text>
          <text x="75" y="92" text-anchor="middle" fill="#a9c6e8" font-size="11" pointer-events="none">计量记录</text>
        </svg>
        <div class="m08-legend-list">${legendHtml}</div>
      </div>
    `;
  }

  function renderPairedHorizontalBarSvg(items, selectedItem) {
    const W = 720;
    const H = 225;
    const padL = 88;
    const padR = 54;
    const padT = 10;
    const padB = 26;
    const plotW = W - padL - padR;
    const plotH = H - padT - padB;
    const rowStep = plotH / Math.max(1, items.length);

    const ticks = [0, 25, 50, 75, 100];
    const gridSvg = ticks.map(pct => {
      const x = (padL + (plotW * pct) / 100).toFixed(1);
      return `
        <line x1="${x}" y1="${padT}" x2="${x}" y2="${padT + plotH}" stroke="rgba(56,189,248,0.16)" stroke-width="1"/>
        <text x="${x}" y="${H - 6}" text-anchor="middle" fill="#89aed6" font-size="11">${pct}%</text>
      `;
    }).join('');

    const rowsSvg = items.map((it, idx) => {
      const cy = padT + rowStep * (idx + 0.5);
      const measuredPct = it.contractQty > 0 ? (it.measuredQty / it.contractQty) * 100 : 0;
      const physicalPct = it.contractQty > 0 ? (it.physicalQty / it.contractQty) * 100 : 0;
      const w1 = Math.max(4, Math.min(plotW, (measuredPct / 100) * plotW));
      const w2 = Math.max(4, Math.min(plotW, (physicalPct / 100) * plotW));
      const isSelected = selectedItem === it.item;
      const op = !selectedItem || isSelected ? 1 : 0.45;

      return `
        <g class="m08-pair-row" opacity="${op}" data-pick-item="${it.item}">
          ${isSelected ? `<rect x="2" y="${(cy - rowStep * 0.46).toFixed(1)}" width="${W - 4}" height="${(rowStep * 0.92).toFixed(1)}" rx="6" fill="rgba(56,189,248,0.08)" stroke="rgba(56,220,255,0.28)" stroke-width="1"/>` : ''}
          <text x="${padL - 10}" y="${(cy + 4).toFixed(1)}" text-anchor="end" fill="${isSelected ? '#ffffff' : '#cfe4ff'}" font-size="12" font-weight="${isSelected ? '700' : '500'}">${it.item}</text>
          <rect x="${padL}" y="${(cy - 10).toFixed(1)}" width="${plotW}" height="7" rx="3.5" fill="rgba(14,48,98,0.6)"/>
          <rect x="${padL}" y="${(cy - 10).toFixed(1)}" width="${w1.toFixed(1)}" height="7" rx="3.5" fill="url(#m08-hbar-blue)"/>
          <text x="${(padL + w1 + 7).toFixed(1)}" y="${(cy - 3.5).toFixed(1)}" fill="#38bdf8" font-size="10.5" font-weight="700">${measuredPct.toFixed(1)}%</text>
          <rect x="${padL}" y="${(cy + 3).toFixed(1)}" width="${plotW}" height="7" rx="3.5" fill="rgba(14,48,98,0.6)"/>
          <rect x="${padL}" y="${(cy + 3).toFixed(1)}" width="${w2.toFixed(1)}" height="7" rx="3.5" fill="url(#m08-hbar-green)"/>
          <text x="${(padL + w2 + 7).toFixed(1)}" y="${(cy + 9.5).toFixed(1)}" fill="#4ade80" font-size="10.5" font-weight="700">${physicalPct.toFixed(1)}%</text>
        </g>
      `;
    }).join('');

    return `
      <svg class="m08-pair-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid meet">
        <defs>
          <linearGradient id="m08-hbar-blue" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#0284c7"/>
            <stop offset="100%" stop-color="#38f2ff"/>
          </linearGradient>
          <linearGradient id="m08-hbar-green" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="#10b981"/>
            <stop offset="100%" stop-color="#4ade80"/>
          </linearGradient>
        </defs>
        ${gridSvg}
        ${rowsSvg}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS (Enter Original System, Record Detail, Attachments, Item Detail)
     ------------------------------------------------------------------------ */
  function openOriginalSystemModal(record) {
    if (!lastCtx) return;
    const focusInfo = record
      ? `<tr><th>定位单据</th><td>${record.id}</td><th>所属工区 / 合同段</th><td>${record.section} · ${record.contract}</td></tr>
         <tr><th>工程分项</th><td>${record.item}</td><th>记录金额</th><td>${fmtMoney(record.amount)} 万元（${record.status}）</td></tr>`
      : `<tr><th>对接接口</th><td>G1211 计量支付原系统 REST/HTTPS 网关</td><th>回传工区</th><td>5 / 6 工区已回传（一工区~五工区）</td></tr>`;

    lastCtx.openModal(`计量支付原系统协同门户${record ? ` · ${record.id}` : ''}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>原系统名称</span><strong style="font-size:15px;">公路工程计量支付系统 V4.2</strong></div>
        <div class="detail-stat-card"><span>数据同步状态</span><strong style="color:#4ade80;">在线已同步</strong></div>
        <div class="detail-stat-card"><span>最近回传时间</span><strong>2026-11-26 10:45</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          ${focusInfo}
          <tr><th>签认审批链</th><td>施工自检上报 → 驻地监理复核 → 总监办审核 → 指挥部核准支付</td><th>校验模式</th><td>电子签章 + 工程量清单台账核验</td></tr>
        </tbody>
      </table>
      <div class="m08-modal-panel">
        <div class="m08-modal-heading">各合同段支付接口回传通道状态</div>
        <table class="data-table">
          <thead><tr><th>工区 / 合同段</th><th>计量期次</th><th>本期已回传支付 (万元)</th><th>回传状态</th></tr></thead>
          <tbody>
            ${SECTIONS.map(s => `
              <tr>
                <td>${s.name} · ${s.contract}</td>
                <td>2026年11月</td>
                <td class="m08-num">${s.payReturned ? fmtMoney(s.paidReturn) : '—'}</td>
                <td><span class="status-tag ${s.payReturned ? 'ok' : 'warn'}">${s.payReturned ? '已回传' : '未回传'}</span></td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `);
  }

  function openRecordDetailModal(rec) {
    if (!lastCtx || !rec) return;
    lastCtx.openModal(`计量原始记录详情 · ${rec.id}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区 / 合同段</span><strong>${rec.section} · ${rec.contract}</strong></div>
        <div class="detail-stat-card"><span>记录金额</span><strong>${fmtMoney(rec.amount)} 万元</strong></div>
        <div class="detail-stat-card"><span>计量 / 支付状态</span><strong style="color:${rec.status === '已确认' ? '#4ade80' : '#facc15'};">${rec.status} · ${rec.payStatus}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">原始记录编号</th><td>${rec.id}</td><th style="width:120px;">计量期次</th><td>${rec.period}</td></tr>
          <tr><th>工程分项</th><td>${rec.item}</td><th>对应桩号范围</th><td>${rec.stakeRange}</td></tr>
          <tr><th>申报工程量</th><td>${rec.qtyDesc}</td><th>审核单位</th><td>${rec.reviewer}</td></tr>
          <tr><th>已回传支付金额</th><td>${rec.paidAmount > 0 ? `${fmtMoney(rec.paidAmount)} 万元` : '—'}</td><th>回传时间</th><td>${rec.payTime}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;gap:10px;flex-wrap:wrap;">
        <button class="btn-primary-glow" style="flex:1;" id="m08ModalJumpRaw">在「原始记录」台账中定位查阅</button>
        <button class="dock-btn" id="m08ModalPreviewPdf">查看计量确认单 (PDF)</button>
      </div>
    `);

    const jumpBtn = document.getElementById('m08ModalJumpRaw');
    if (jumpBtn) {
      jumpBtn.onclick = () => {
        uiState.rawRecords.selectedId = rec.id;
        uiState.rawRecords.period = rec.period;
        lastCtx.closeModal();
        if (lastSubPageId !== 'rawRecords') {
          lastCtx.switchModule('measure', 'rawRecords');
        } else {
          renderPage(lastHost, 'rawRecords', lastCtx);
        }
      };
    }
    const pdfBtn = document.getElementById('m08ModalPreviewPdf');
    if (pdfBtn) {
      pdfBtn.onclick = () => openAttachmentModal(rec, 'pdf');
    }
  }

  function openAttachmentModal(rec, type) {
    if (!lastCtx || !rec) return;
    if (type === 'pdf') {
      const fileName = `${rec.contract}计量确认单.pdf`;
      lastCtx.openModal(`PDF 附件预览 · ${fileName}`, `
        <div class="m08-modal-panel">
          <div style="display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid rgba(56,189,248,0.2);padding-bottom:8px;">
            <strong style="color:#ffffff;font-size:14px;">G1211吉黑高速明水至北安段 中间计量支付确认单</strong>
            <span class="status-tag ${rec.status === '已确认' ? 'ok' : 'warn'}">${rec.status}</span>
          </div>
          <table class="data-table">
            <tbody>
              <tr><th style="width:120px;">单据编号</th><td>${rec.id}</td><th style="width:120px;">计量期次</th><td>${rec.period}</td></tr>
              <tr><th>合同段</th><td>${rec.section} · ${rec.contract}</td><th>分项工程</th><td>${rec.item}（${rec.stakeRange}）</td></tr>
              <tr><th>核定计量金额</th><td class="m08-num" style="color:#38f2ff;">${fmtMoney(rec.amount)} 万元</td><th>监理核签人</th><td>${rec.reviewer}</td></tr>
            </tbody>
          </table>
          <div style="padding:10px 12px;border-radius:6px;background:rgba(6,22,52,0.75);font-size:12px;color:#cfe4ff;line-height:1.7;">
            <div>核定意见：经现场收方测量及质量检验合格证核对，本周期申报 ${rec.qtyDesc} 符合设计图纸与施工规范要求，予以计量确认。</div>
            <div style="margin-top:6px;color:#7dd3fc;">电子签章存证：CA-JHGS-${rec.id.slice(-3)} · 同步时间 ${rec.syncTime}</div>
          </div>
        </div>
      `);
      return;
    }

    const xlsName = `${rec.item}计量计算表.xlsx`;
    const partA = +(rec.amount * 0.56).toFixed(2);
    const partB = +(rec.amount * 0.29).toFixed(2);
    const partC = +(rec.amount - partA - partB).toFixed(2);
    lastCtx.openModal(`XLSX 附件预览 · ${xlsName}`, `
      <div class="m08-modal-panel">
        <div class="m08-modal-heading">工程量清单计量计算明细表（${rec.id} · ${rec.contract}）</div>
        <table class="data-table">
          <thead><tr><th>清单子目号</th><th>细目名称</th><th>计量桩号</th><th>本期核定数量</th><th>核定金额 (万元)</th></tr></thead>
          <tbody>
            <tr><td>204-1-a</td><td>${rec.item}主线施工段</td><td>${rec.stakeRange}</td><td>主体 56%</td><td class="m08-num">${fmtMoney(partA)}</td></tr>
            <tr><td>204-1-b</td><td>${rec.item}衔接过渡段</td><td>${rec.stakeRange.split('~')[0].trim()} 扩段</td><td>附属 29%</td><td class="m08-num">${fmtMoney(partB)}</td></tr>
            <tr><td>204-1-c</td><td>质检合格调差与零星工程</td><td>全段汇总</td><td>调差 15%</td><td class="m08-num">${fmtMoney(partC)}</td></tr>
            <tr><th colspan="4" style="text-align:right;">本期计量合计</th><th class="m08-num" style="color:#38f2ff;">${fmtMoney(rec.amount)} 万元</th></tr>
          </tbody>
        </table>
      </div>
    `);
  }

  function openPhysicalItemModal(sec, rowData, period) {
    if (!lastCtx || !sec || !rowData) return;
    const mPct = rowData.contractQty > 0 ? (rowData.measuredQty / rowData.contractQty) * 100 : 0;
    const pPct = rowData.contractQty > 0 ? (rowData.physicalQty / rowData.contractQty) * 100 : 0;
    const diff = +(rowData.physicalQty - rowData.measuredQty).toFixed(1);
    lastCtx.openModal(`实物进度与计量对照详情 · ${rowData.item}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>合同范围</span><strong>${sec.name} · ${sec.contract}</strong></div>
        <div class="detail-stat-card"><span>累计计量比例</span><strong>${mPct.toFixed(1)}%</strong></div>
        <div class="detail-stat-card"><span>实物完成率</span><strong style="color:#4ade80;">${pPct.toFixed(1)}%</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:140px;">工程分项</th><td>${rowData.item}</td><th style="width:140px;">计量期次</th><td>${period}</td></tr>
          <tr><th>合同工程量</th><td>${rowData.contractQty} ${rowData.unit}</td><th>累计计量工程量</th><td>${rowData.measuredQty} ${rowData.unit}</td></tr>
          <tr><th>经审核实物完成量</th><td>${rowData.physicalQty} ${rowData.unit}</td><th>数量差额（实物-计量）</th><td>${diff} ${rowData.unit}</td></tr>
          <tr><th>本期计量金额</th><td class="m08-num">${fmtMoney(rowData.periodAmt)} 万元</td><th>关联原始记录</th><td>${rowData.recId}</td></tr>
        </tbody>
      </table>
      <button class="btn-primary-glow" id="m08PhysJumpRaw">跳转查阅关联原始记录（${rowData.recId}）</button>
    `);
    const btn = document.getElementById('m08PhysJumpRaw');
    if (btn) {
      btn.onclick = () => {
        uiState.rawRecords.selectedId = rowData.recId;
        uiState.rawRecords.period = period;
        lastCtx.closeModal();
        lastCtx.switchModule('measure', 'rawRecords');
      };
    }
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 1: 计量总览 (overview)
     ------------------------------------------------------------------------ */
  function renderOverview(ctx) {
    const st = uiState.overview;
    const secId = ctx.state.activeSectionId;
    const periodRecords = getRecordsForPeriod(st.period);
    const secScoped = periodRecords.filter(r => !secId || r.sectionId === secId);

    const isAllDeclared = st.caliber === '全部申报金额';
    const currentAmt = secScoped
      .filter(r => isAllDeclared || r.status === '已确认')
      .reduce((sum, r) => sum + r.amount, 0);
    const cumAmt = getCumAmountForSection(secId, st.period);
    const totalCount = secScoped.length;
    const confirmedCount = secScoped.filter(r => r.status === '已确认').length;
    const reviewingCount = secScoped.filter(r => r.status === '审核中').length;
    const pendingCount = secScoped.filter(r => r.status === '待审核').length;

    // 近6期柱状图数据（随工区与金额口径联动）
    const secScale = secId
      ? (BASE_RECORDS_NOV.filter(r => r.sectionId === secId && r.status === '已确认').reduce((s, r) => s + r.amount, 0) / 8426.80)
      : 1;
    const caliberFactor = isAllDeclared ? 1.13 : 1;
    const barItems = SIX_PERIODS.map(p => ({
      key: p.period,
      label: p.short,
      value: +(p.total * secScale * caliberFactor).toFixed(1)
    }));
    const rawMax = Math.max(...barItems.map(b => b.value), 100);
    const maxY = secId ? Math.ceil(rawMax / 500) * 500 : (isAllDeclared ? 18000 : 16000);
    const tickVals = [0, maxY * 0.25, maxY * 0.5, maxY * 0.75, maxY];

    // 支付信息汇总
    const pm = getPeriodMeta(st.period);
    const paySections = SECTIONS.filter(s => !secId || s.id === secId);
    const returnedSections = paySections.filter(s => s.payReturned || st.period !== '2026年11月').length;
    const paidTotal = paySections.reduce((sum, s) => {
      const base = (s.payReturned || st.period !== '2026年11月') ? (s.paidReturn || 860.0) : 0;
      return sum + base * pm.scale;
    }, 0);
    const payCounts = {
      '已支付': secScoped.filter(r => r.payStatus === '已支付').length,
      '办理中': secScoped.filter(r => r.payStatus === '办理中').length,
      '待支付': secScoped.filter(r => r.payStatus === '待支付').length,
      '未回传': secScoped.filter(r => r.payStatus === '未回传').length
    };

    // 底部表格筛选与分页（每页 5 条，全线 36 条共 8 页）
    const tableList = secScoped.filter(r => !st.statusFilter || r.status === st.statusFilter);
    const pageSize = 5;
    const totalPages = Math.max(1, Math.ceil(tableList.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = tableList.slice((st.page - 1) * pageSize, st.page * pageSize);

    // 关注事项
    const attentionItems = [
      { id: 'JL-A3-202611-019', secId: 'sec3', title: '三工区 · 水稳基层', sub: 'JL-A3-202611-019', tag: '审核中', cls: 'info', ico: ICONS.clock },
      { id: 'JL-A6-202611-031', secId: 'sec6', title: '六工区 · 路基防护', sub: 'JL-A6-202611-031', tag: '待审核', cls: 'warn', ico: ICONS.docWarn },
      { id: 'JL-A6-202611-009', secId: 'sec6', title: '六工区 · 支付信息', sub: '本期原系统回传状态', tag: '未回传', cls: 'muted', ico: ICONS.sync }
    ].filter(a => !secId || a.secId === secId);

    const kpis = [
      { label: '本期计量金额', value: fmtMoney(currentAmt), unit: '万元', icon: ICONS.coin },
      { label: '累计计量金额', value: fmtMoney(cumAmt), unit: '万元', icon: ICONS.layers },
      { label: '本期计量记录', value: fmtInt(totalCount), unit: '条', icon: ICONS.listDoc },
      { label: '已确认记录', value: fmtInt(confirmedCount), unit: '条', icon: ICONS.checkCircle, tone: 'green' }
    ];

    return `
      <div class="m08-page">
        <div class="glass-panel m08-filter-bar">
          <div class="m08-filter-fields">
            ${renderSectionSelect(secId, true)}
            ${renderPeriodSelect(st.period)}
            <div class="m08-field">
              <span class="m08-field-label">金额口径</span>
              <select class="glass-select m08-select" data-filter="caliber">
                <option value="已确认计量" ${st.caliber === '已确认计量' ? 'selected' : ''}>已确认计量</option>
                <option value="全部申报金额" ${st.caliber === '全部申报金额' ? 'selected' : ''}>全部申报金额</option>
              </select>
            </div>
          </div>
          <div class="m08-filter-actions">
            <button class="m08-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m08-btn-outline" data-action="reset">${ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m08-btn-outline" data-action="openSys">${ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header m08-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">计量概况</span>
              <span class="m08-period-tag">(${st.period})</span>
            </div>
            <div class="m08-header-meta">金额按${st.caliber}统计 · 截至 2026-11-25</div>
          </div>
          <div class="m08-kpi-grid cols-4">
            ${kpis.map(k => `
              <div class="m08-kpi-card">
                <div class="m08-kpi-icon ${k.tone ? 'tone-' + k.tone : ''}">${k.icon}</div>
                <div class="m08-kpi-meta">
                  <div class="m08-kpi-label">${k.label}</div>
                  <div class="m08-kpi-val-row">
                    <span class="m08-kpi-val ${k.tone ? 'tone-' + k.tone : ''}">${k.value}</span>
                    <span class="m08-kpi-unit">${k.unit}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="m08-grid-3">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">近6期计量金额</span></div>
              <div class="m08-header-meta">单位 万元</div>
            </div>
            <div class="m08-chart-body">
              ${renderVerticalBarSvg({
                idPrefix: 'ov-6p',
                items: barItems,
                maxY,
                ticks: tickVals.map(v => ({ val: v, label: Math.round(v).toLocaleString('en-US') })),
                activeKey: st.period,
                clickAttr: 'data-period-pick'
              })}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">本期计量记录状态</span></div>
            </div>
            <div class="m08-chart-body">
              ${renderDonutSvg([
                { name: '已确认', count: confirmedCount, color: '#22c55e' },
                { name: '审核中', count: reviewingCount, color: '#0ea5e9' },
                { name: '待审核', count: pendingCount, color: '#f59e0b' }
              ], totalCount, st.statusFilter)}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">原系统支付信息</span></div>
              <div class="m08-header-meta">按支付发生期</div>
            </div>
            <div class="m08-pay-body">
              <div class="m08-pay-top">
                <div>
                  <div class="m08-pay-sublabel">本期已回传支付金额</div>
                  <div class="m08-pay-amount">${fmtMoney(paidTotal)}<small>万元</small></div>
                </div>
                <span class="m08-pill-badge">${returnedSections} / ${paySections.length} 工区已回传</span>
              </div>
              <div class="m08-pay-subhead">
                <span>本期原系统支付状态</span>
                <span>按记录统计</span>
              </div>
              <div class="m08-pay-tiles">
                <div class="m08-pay-tile" data-pay-jump="已支付">
                  <div class="m08-pay-tile-name">已支付</div>
                  <div class="m08-pay-tile-val" style="color:#4ade80;">${payCounts['已支付']}<small>条</small></div>
                </div>
                <div class="m08-pay-tile" data-pay-jump="办理中">
                  <div class="m08-pay-tile-name">办理中</div>
                  <div class="m08-pay-tile-val" style="color:#38bdf8;">${payCounts['办理中']}<small>条</small></div>
                </div>
                <div class="m08-pay-tile" data-pay-jump="待支付">
                  <div class="m08-pay-tile-name">待支付</div>
                  <div class="m08-pay-tile-val" style="color:#facc15;">${payCounts['待支付']}<small>条</small></div>
                </div>
                <div class="m08-pay-tile" data-pay-jump="未回传">
                  <div class="m08-pay-tile-name">未回传</div>
                  <div class="m08-pay-tile-val" style="color:#cbd5e1;">${payCounts['未回传']}<small>条</small></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="m08-split-overview">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">本期计量记录</span>
                ${st.statusFilter ? `<span class="m08-tag info" style="margin-left:6px;cursor:pointer;" data-status-pick="${st.statusFilter}">状态：${st.statusFilter} ×</span>` : ''}
              </div>
              <button class="m08-link-btn" data-jump-raw="">查看原始记录 &gt;</button>
            </div>
            <div class="m08-table-wrap">
              <table class="data-table m08-table">
                <thead>
                  <tr>
                    <th>原始记录编号</th><th>所属工区</th><th>合同段</th><th>工程分项</th><th>计量期次</th><th>记录金额（万元）</th><th>计量状态</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr data-record-modal="${r.id}">
                      <td class="m08-num">${r.id}</td>
                      <td>${r.section}</td>
                      <td>${r.contract}</td>
                      <td>${r.item}</td>
                      <td>${r.period}</td>
                      <td class="m08-num">${fmtMoney(r.amount)}</td>
                      <td><span class="m08-tag ${statusTagClass(r.status)}">${r.status}</span></td>
                      <td><button class="m08-link-btn" data-record-modal="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="8" style="text-align:center;color:#93b8de;padding:24px;">当前筛选条件下暂无计量记录</td></tr>`}
                </tbody>
              </table>
            </div>
            <div class="m08-table-foot">
              <span></span>
              ${buildPaginationHtml(tableList.length, st.page, pageSize, '条记录')}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">本期关注事项</span></div>
            </div>
            <div class="m08-side-body">
              <div class="m08-att-list">
                ${attentionItems.length ? attentionItems.map(a => `
                  <div class="m08-att-card" data-jump-raw="${a.id}">
                    <div class="m08-att-left">
                      <div class="m08-att-ico ${a.cls === 'warn' ? 'warn' : a.cls === 'muted' ? 'muted' : ''}">${a.ico}</div>
                      <div>
                        <div class="m08-att-title">${a.title}</div>
                        <div class="m08-att-sub">${a.sub}</div>
                      </div>
                    </div>
                    <span class="m08-tag ${a.cls}">${a.tag}</span>
                  </div>
                `).join('') : `
                  <div class="m08-att-card" style="justify-content:center;color:#4ade80;">当前工区本期关注事项均已闭环</div>
                `}
              </div>
              <div class="m08-side-footer m08-foot-clear">
                <span>同步于 2026-11-26 10:45</span>
                <button class="m08-link-btn" data-jump-raw="">查看记录 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 2: 分工区统计 (sectionStats)
     ------------------------------------------------------------------------ */
  function renderSectionStats(ctx) {
    const st = uiState.sectionStats;
    const secId = ctx.state.activeSectionId;
    const pm = getPeriodMeta(st.period);
    const periodRecords = getRecordsForPeriod(st.period);

    const matchingSections = SECTIONS.filter(s => {
      if (secId && s.id !== secId) return false;
      if (st.contract && s.contract !== st.contract) return false;
      return true;
    });

    const sectionRows = matchingSections.map(s => {
      const secRecs = periodRecords.filter(r => r.sectionId === s.id && (!st.item || r.item === st.item));
      const confirmedRecs = secRecs.filter(r => r.status === '已确认');
      const curAmt = confirmedRecs.reduce((sum, r) => sum + r.amount, 0);
      const itemFactor = st.item ? 0.24 : 1;
      const cumAmt = +(getCumAmountForSection(s.id, st.period) * itemFactor).toFixed(2);
      const isReturned = s.payReturned || st.period !== '2026年11月';
      const paidAmt = isReturned ? +((s.paidReturn || 860.0) * pm.scale * (st.item ? 0.24 : 1)).toFixed(2) : 0;
      return {
        sectionId: s.id,
        section: s.name,
        contract: s.contract,
        curAmt: +curAmt.toFixed(2),
        cumAmt,
        recCount: secRecs.length,
        confirmedCount: confirmedRecs.length,
        paidAmt,
        payReturned: isReturned
      };
    });

    const totalCurAmt = sectionRows.reduce((s, r) => s + r.curAmt, 0);
    const totalCumAmt = sectionRows.reduce((s, r) => s + r.cumAmt, 0);
    const totalRecs = sectionRows.reduce((s, r) => s + r.recCount, 0);
    const totalConfirmed = sectionRows.reduce((s, r) => s + r.confirmedCount, 0);
    const totalPaid = sectionRows.reduce((s, r) => s + r.paidAmt, 0);
    const returnedCount = sectionRows.filter(r => r.payReturned).length;

    const allSecChartRows = SECTIONS.map(s => {
      const secRecs = periodRecords.filter(r => r.sectionId === s.id && (!st.item || r.item === st.item) && r.status === '已确认');
      const curAmt = secRecs.reduce((sum, r) => sum + r.amount, 0);
      const cumAmt = +(getCumAmountForSection(s.id, st.period) * (st.item ? 0.24 : 1)).toFixed(2);
      return { key: s.id, label: s.name, curAmt: +curAmt.toFixed(1), cumAmt: +cumAmt.toFixed(1) };
    });
    const maxCur = Math.max(...allSecChartRows.map(x => x.curAmt), 500) <= 2000 ? 2000 : Math.ceil(Math.max(...allSecChartRows.map(x => x.curAmt)) / 500) * 500;
    const maxCum = Math.max(...allSecChartRows.map(x => x.cumAmt), 3500) <= 14000 ? 14000 : Math.ceil(Math.max(...allSecChartRows.map(x => x.cumAmt)) / 3500) * 3500;

    const kpis = [
      { label: '纳入统计工区', value: fmtInt(sectionRows.length), unit: '个', icon: ICONS.layers },
      { label: '合同段', value: fmtInt(sectionRows.length), unit: '个', icon: ICONS.listDoc },
      { label: '本期计量金额', value: fmtMoney(totalCurAmt), unit: '万元', icon: ICONS.coin },
      { label: '累计计量金额', value: fmtMoney(totalCumAmt), unit: '万元', icon: ICONS.grid },
      { label: '已确认记录', value: fmtInt(totalConfirmed), unit: '条', icon: ICONS.checkCircle, tone: 'green' }
    ];

    return `
      <div class="m08-page">
        <div class="glass-panel m08-filter-bar">
          <div class="m08-filter-fields">
            ${renderSectionSelect(secId, true)}
            <div class="m08-field">
              <span class="m08-field-label">合同段</span>
              <select class="glass-select m08-select" data-filter="contract">
                <option value="" ${!st.contract ? 'selected' : ''}>全部合同段</option>
                ${SECTIONS.map(s => `<option value="${s.contract}" ${st.contract === s.contract ? 'selected' : ''}>${s.contract}</option>`).join('')}
              </select>
            </div>
            <div class="m08-field">
              <span class="m08-field-label">工程分项</span>
              <select class="glass-select m08-select" data-filter="item">
                <option value="" ${!st.item ? 'selected' : ''}>全部接入分项</option>
                ${WORK_ITEMS.map(it => `<option value="${it}" ${st.item === it ? 'selected' : ''}>${it}</option>`).join('')}
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m08-filter-actions">
            <button class="m08-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m08-btn-outline" data-action="reset">${ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m08-btn-outline" data-action="openSys">${ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header m08-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">工区计量汇总</span>
              <span class="m08-period-tag">(${st.period})</span>
            </div>
            <div class="m08-header-meta">金额按已确认计量统计 · 截至 2026-11-25</div>
          </div>
          <div class="m08-kpi-grid cols-5">
            ${kpis.map(k => `
              <div class="m08-kpi-card">
                <div class="m08-kpi-icon ${k.tone ? 'tone-' + k.tone : ''}">${k.icon}</div>
                <div class="m08-kpi-meta">
                  <div class="m08-kpi-label">${k.label}</div>
                  <div class="m08-kpi-val-row">
                    <span class="m08-kpi-val ${k.tone ? 'tone-' + k.tone : ''}">${k.value}</span>
                    <span class="m08-kpi-unit">${k.unit}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="m08-grid-2">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区本期计量金额</span></div>
              <div class="m08-header-meta">单位 万元</div>
            </div>
            <div class="m08-chart-body">
              ${renderVerticalBarSvg({
                idPrefix: 'sec-cur',
                items: allSecChartRows.map(x => ({ key: x.key, label: x.label, value: x.curAmt })),
                maxY: maxCur,
                ticks: [0, maxCur * 0.25, maxCur * 0.5, maxCur * 0.75, maxCur].map(v => ({ val: v, label: Math.round(v).toLocaleString('en-US') })),
                activeKey: secId,
                clickAttr: 'data-sec-pick'
              })}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各工区累计计量金额</span></div>
              <div class="m08-header-meta">单位 万元</div>
            </div>
            <div class="m08-chart-body">
              ${renderVerticalBarSvg({
                idPrefix: 'sec-cum',
                items: allSecChartRows.map(x => ({ key: x.key, label: x.label, value: x.cumAmt })),
                maxY: maxCum,
                ticks: [0, maxCum * 0.25, maxCum * 0.5, maxCum * 0.75, maxCum].map(v => ({ val: v, label: Math.round(v).toLocaleString('en-US') })),
                activeKey: secId,
                clickAttr: 'data-sec-pick',
                gradientMode: 'teal'
              })}
            </div>
          </div>
        </div>

        <div class="m08-split-65-35">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">工区与合同段计量明细</span></div>
              <div class="m08-header-meta">金额按已确认计量统计</div>
            </div>
            <div class="m08-table-wrap">
              <table class="data-table m08-table">
                <thead>
                  <tr>
                    <th>所属工区</th><th>合同段</th><th>本期计量金额 (万元)</th><th>累计计量金额 (万元)</th><th>本期记录</th><th>已确认</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${sectionRows.map(r => `
                    <tr class="${(secId || st.selectedSecId) === r.sectionId ? 'active' : ''}" data-select-secrow="${r.sectionId}">
                      <td>${r.section}</td>
                      <td>${r.contract}</td>
                      <td class="m08-num">${fmtMoney(r.curAmt)}</td>
                      <td class="m08-num">${fmtMoney(r.cumAmt)}</td>
                      <td>${r.recCount} 条</td>
                      <td>${r.confirmedCount} 条</td>
                      <td><button class="m08-link-btn" data-jump-phys="${r.sectionId}">查看分项</button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="m08-table-foot">
              <span>合计 ${sectionRows.length} 个工区 &nbsp; ${fmtInt(totalRecs)} 条计量记录</span>
              <button class="m08-link-btn" data-jump-raw="">查看原始记录 &gt;</button>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">分工区支付信息</span></div>
              <div class="m08-header-meta">原系统回传</div>
            </div>
            <div class="m08-pay-body">
              <div class="m08-pay-top">
                <div>
                  <div class="m08-pay-sublabel">本期已回传支付金额</div>
                  <div class="m08-pay-amount">${fmtMoney(totalPaid)}<small>万元</small></div>
                </div>
                <span class="m08-pill-badge">${returnedCount} / ${sectionRows.length} 工区已回传</span>
              </div>
              <div class="m08-table-wrap" style="padding:0;">
                <table class="data-table m08-table">
                  <thead>
                    <tr><th>所属工区</th><th>本期支付金额 (万元)</th><th>支付信息状态</th></tr>
                  </thead>
                  <tbody>
                    ${sectionRows.map(r => `
                      <tr data-sec-pick="${r.sectionId}">
                        <td>${r.section}</td>
                        <td class="m08-num">${r.payReturned ? fmtMoney(r.paidAmt) : '—'}</td>
                        <td><span class="m08-tag ${r.payReturned ? 'ok' : 'muted'}">${r.payReturned ? '已回传' : '未回传'}</span></td>
                      </tr>
                    `).join('')}
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
     SUBPAGE 3: 实物进度对照 (physicalCompare)
     ------------------------------------------------------------------------ */
  function renderPhysicalCompare(ctx) {
    const st = uiState.physicalCompare;
    const activeSecId = ctx.state.activeSectionId || st.fallbackSecId || 'sec2';
    const sec = SECTION_BY_ID[activeSecId] || SECTIONS[1];
    const pm = getPeriodMeta(st.period);
    const scale = pm.scale;

    const rawItems = (PHYSICAL_DATA_BY_SEC[sec.id] || PHYSICAL_DATA_BY_SEC.sec2).map(it => {
      const mQty = +(it.measuredQty * Math.min(1, 0.45 + 0.55 * (pm.cumTotal / 63582.40))).toFixed(it.unit.startsWith('万') ? 1 : 0);
      const pQty = +(it.physicalQty * Math.min(1, 0.45 + 0.55 * (pm.cumTotal / 63582.40))).toFixed(it.unit.startsWith('万') ? 1 : 0);
      const isNov = st.period === '2026年11月';
      return {
        item: it.item,
        unit: it.unit,
        contractQty: it.contractQty,
        measuredQty: isNov ? it.measuredQty : mQty,
        physicalQty: isNov ? it.physicalQty : Math.max(mQty, pQty),
        periodAmt: +(it.periodAmt * scale).toFixed(2),
        recId: isNov ? it.recId : it.recId.replace('202611', pm.period.replace('年', '').replace('月', ''))
      };
    });

    const filteredItems = rawItems.filter(it => !st.item || it.item === st.item);
    let selected = filteredItems.find(it => it.item === st.selectedItem) || filteredItems[0];
    if (selected) st.selectedItem = selected.item;

    const selPhysPct = selected && selected.contractQty > 0 ? (selected.physicalQty / selected.contractQty) * 100 : 0;
    const selDiff = selected ? +(selected.physicalQty - selected.measuredQty).toFixed(1) : 0;

    return `
      <div class="m08-page">
        <div class="glass-panel m08-filter-bar">
          <div class="m08-filter-fields">
            ${renderSectionSelect(sec.id, false)}
            <div class="m08-field">
              <span class="m08-field-label">合同段</span>
              <select class="glass-select m08-select" data-filter="contractScope">
                ${SECTIONS.map(s => `<option value="${s.id}" ${sec.id === s.id ? 'selected' : ''}>${s.contract}</option>`).join('')}
              </select>
            </div>
            <div class="m08-field">
              <span class="m08-field-label">工程分项</span>
              <select class="glass-select m08-select" data-filter="item">
                <option value="" ${!st.item ? 'selected' : ''}>全部匹配分项</option>
                ${MATCHED_ITEMS.map(it => `<option value="${it}" ${st.item === it ? 'selected' : ''}>${it}</option>`).join('')}
              </select>
            </div>
            ${renderPeriodSelect(st.period)}
          </div>
          <div class="m08-filter-actions">
            <button class="m08-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m08-btn-outline" data-action="reset">${ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m08-btn-outline" data-action="openSys">${ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        <div class="glass-panel m08-scope-banner">
          <div class="m08-scope-left">
            <div class="m08-scope-ico">${ICONS.pin}</div>
            <div>
              <div class="m08-scope-title">${sec.name} · ${sec.contract}</div>
              <div class="m08-scope-sub">同一工程范围 &nbsp; ${filteredItems.length} 个匹配分项（${sec.stake}）</div>
            </div>
          </div>
          <div class="m08-scope-right">
            <span>计量统计截至 2026-11-25</span>
            <span>实物审核截至 2026-11-25</span>
            <span class="m08-tag ok">范围与日期已匹配</span>
          </div>
        </div>

        <div class="m08-split-compare">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">各分项工程量比例对照</span></div>
              <div class="m08-compare-legend">
                <span><i class="m08-legend-dot" style="background:#38bdf8;"></i>累计计量比例</span>
                <span><i class="m08-legend-dot" style="background:#4ade80;"></i>实物完成率</span>
              </div>
            </div>
            <div style="padding:10px 14px 12px;">
              ${renderPairedHorizontalBarSvg(filteredItems, selected ? selected.item : '')}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">选中分项 · ${selected ? selected.item : '—'}</span></div>
              <span class="m08-pill-badge">${sec.contract}</span>
            </div>
            ${selected ? `
              <div class="m08-selected-body">
                <div class="m08-stat-duo">
                  <div class="m08-stat-box">
                    <div class="m08-stat-box-label">累计计量工程量</div>
                    <div class="m08-stat-box-val">${selected.measuredQty}<small>${selected.unit}</small></div>
                  </div>
                  <div class="m08-stat-box green">
                    <div class="m08-stat-box-label">经审核实物完成量</div>
                    <div class="m08-stat-box-val">${selected.physicalQty}<small>${selected.unit}</small></div>
                  </div>
                </div>
                <div class="m08-kv-list">
                  <div class="m08-kv-row"><span class="m08-kv-k">合同工程量</span><span class="m08-kv-v">${selected.contractQty} ${selected.unit}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">实物完成率</span><span class="m08-kv-v">${selPhysPct.toFixed(1)}%</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">数量差额</span><span class="m08-kv-v">${selDiff} ${selected.unit}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">本期计量金额</span><span class="m08-kv-v">${fmtMoney(selected.periodAmt)} 万元</span></div>
                </div>
                <div class="m08-side-footer">
                  <span class="m08-num" style="color:#93b8de;font-weight:500;">${selected.recId}</span>
                  <button class="m08-link-btn" data-jump-raw="${selected.recId}">查看原始记录 &gt;</button>
                </div>
              </div>
            ` : ''}
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header m08-panel-header">
            <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">同范围计量与实物明细</span></div>
            <div class="m08-header-meta">匹配 ${filteredItems.length} 项</div>
          </div>
          <div class="m08-table-wrap">
            <table class="data-table m08-table">
              <thead>
                <tr>
                  <th>工程分项</th><th>合同工程量</th><th>累计计量工程量</th><th>经审核实物完成量</th><th>实物完成率</th><th>数量差额¹</th><th>本期计量金额 (万元)</th><th>操作</th>
                </tr>
              </thead>
              <tbody>
                ${filteredItems.map(it => {
                  const pct = it.contractQty > 0 ? ((it.physicalQty / it.contractQty) * 100).toFixed(1) : '0.0';
                  const diff = +(it.physicalQty - it.measuredQty).toFixed(1);
                  return `
                    <tr class="${selected && selected.item === it.item ? 'active' : ''}" data-pick-item="${it.item}">
                      <td>${it.item}</td>
                      <td>${it.contractQty} ${it.unit}</td>
                      <td>${it.measuredQty} ${it.unit}</td>
                      <td>${it.physicalQty} ${it.unit}</td>
                      <td class="m08-num" style="color:#4ade80;">${pct}%</td>
                      <td>${diff} ${it.unit}</td>
                      <td class="m08-num">${fmtMoney(it.periodAmt)}</td>
                      <td><button class="m08-link-btn" data-phys-modal="${it.item}">查看</button></td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          </div>
          <div class="m08-footnotes">
            <span>¹ 数量差额为经审核实物完成量减累计计量工程量</span>
            <span>工程量比例以各分项合同工程量为基准</span>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 4: 原始记录 (rawRecords)
     ------------------------------------------------------------------------ */
  function renderRawRecords(ctx) {
    const st = uiState.rawRecords;
    const secId = ctx.state.activeSectionId;
    const periodRecords = getRecordsForPeriod(st.period);
    const secScoped = periodRecords.filter(r => !secId || r.sectionId === secId);

    const totalCount = secScoped.length;
    const confirmedCount = secScoped.filter(r => r.status === '已确认').length;
    const reviewingCount = secScoped.filter(r => r.status === '审核中').length;
    const pendingCount = secScoped.filter(r => r.status === '待审核').length;

    const kw = (st.keyword || '').trim().toLowerCase();
    const filtered = secScoped.filter(r => {
      if (st.status && r.status !== st.status) return false;
      if (st.payStatus && r.payStatus !== st.payStatus) return false;
      if (kw) {
        const hay = `${r.id} ${r.section} ${r.contract} ${r.item}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const pageSize = 6;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (st.page > totalPages) st.page = 1;
    const rows = filtered.slice((st.page - 1) * pageSize, st.page * pageSize);

    let selected = filtered.find(r => r.id === st.selectedId) || rows[0] || secScoped[0] || null;
    if (selected) st.selectedId = selected.id;

    const kpis = [
      { label: '全部记录', value: fmtInt(totalCount), unit: '条', icon: ICONS.listDoc },
      { label: '已确认', value: fmtInt(confirmedCount), unit: '条', icon: ICONS.checkCircle, tone: 'green' },
      { label: '审核中', value: fmtInt(reviewingCount), unit: '条', icon: ICONS.clock, tone: 'blue' },
      { label: '待审核', value: fmtInt(pendingCount), unit: '条', icon: ICONS.docWarn, tone: 'gold' }
    ];

    return `
      <div class="m08-page">
        <div class="glass-panel m08-filter-bar">
          <div class="m08-filter-fields">
            ${renderSectionSelect(secId, true)}
            ${renderPeriodSelect(st.period)}
            <div class="m08-field">
              <span class="m08-field-label">计量状态</span>
              <select class="glass-select m08-select" data-filter="status">
                <option value="" ${!st.status ? 'selected' : ''}>全部状态</option>
                <option value="已确认" ${st.status === '已确认' ? 'selected' : ''}>已确认</option>
                <option value="审核中" ${st.status === '审核中' ? 'selected' : ''}>审核中</option>
                <option value="待审核" ${st.status === '待审核' ? 'selected' : ''}>待审核</option>
              </select>
            </div>
            <div class="m08-field">
              <span class="m08-field-label">关键词</span>
              <div class="m08-search-wrap">
                ${ICONS.search}
                <input class="m08-input" type="text" data-filter-input="keyword" value="${st.keyword || ''}" placeholder="原始编号 / 合同段 / 分项" />
              </div>
            </div>
          </div>
          <div class="m08-filter-actions">
            <button class="m08-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m08-btn-outline" data-action="reset">${ICONS.reset}<span>重置</span></button>
            <button class="dock-btn m08-btn-outline" data-action="openSys">${ICONS.ext}<span>进入原系统</span></button>
          </div>
        </div>

        <div class="glass-panel">
          <div class="panel-header m08-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">本期计量记录</span>
              <span class="m08-period-tag">(${st.period})</span>
            </div>
            <div class="m08-header-meta">统计截止 2026-11-25</div>
          </div>
          <div class="m08-kpi-grid cols-4">
            ${kpis.map(k => `
              <div class="m08-kpi-card">
                <div class="m08-kpi-icon ${k.tone ? 'tone-' + k.tone : ''}">${k.icon}</div>
                <div class="m08-kpi-meta">
                  <div class="m08-kpi-label">${k.label}</div>
                  <div class="m08-kpi-val-row">
                    <span class="m08-kpi-val ${k.tone ? 'tone-' + k.tone : ''}">${k.value}</span>
                    <span class="m08-kpi-unit">${k.unit}</span>
                  </div>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <div class="m08-split-65-35">
          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">原始计量记录</span>
                ${st.payStatus ? `<span class="m08-tag info" style="margin-left:6px;cursor:pointer;" data-clear-pay="">支付：${st.payStatus} ×</span>` : ''}
              </div>
              <div class="m08-header-meta">来源 计量支付原系统</div>
            </div>
            <div class="m08-table-wrap">
              <table class="data-table m08-table">
                <thead>
                  <tr>
                    <th>原始记录编号</th><th>工区 / 合同段</th><th>工程分项</th><th>计量期次</th><th>记录金额（万元）</th><th>计量状态</th><th>原系统支付状态</th><th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${rows.length ? rows.map(r => `
                    <tr class="${selected && selected.id === r.id ? 'active' : ''}" data-raw-select="${r.id}">
                      <td class="m08-num">${r.id}</td>
                      <td>
                        <div style="font-weight:600;color:#f1f7ff;">${r.section}</div>
                        <div style="font-size:11px;color:#8fb4da;">${r.contract}</div>
                      </td>
                      <td>${r.item}</td>
                      <td>${r.period}</td>
                      <td class="m08-num">${fmtMoney(r.amount)}</td>
                      <td><span class="m08-tag ${statusTagClass(r.status)}">${r.status}</span></td>
                      <td><span class="m08-tag ${statusTagClass(r.payStatus)}">${r.payStatus}</span></td>
                      <td><button class="m08-link-btn" data-raw-view="${r.id}">查看</button></td>
                    </tr>
                  `).join('') : `<tr><td colspan="8" style="text-align:center;color:#93b8de;padding:24px;">当前筛选条件下暂无原始计量记录</td></tr>`}
                </tbody>
              </table>
            </div>
            <div class="m08-table-foot">
              <span></span>
              ${buildPaginationHtml(filtered.length, st.page, pageSize, '条原始记录')}
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m08-panel-header">
              <div class="panel-title-group"><span class="panel-accent-bar"></span><span class="panel-title">原始记录详情</span></div>
            </div>
            ${selected ? `
              <div class="m08-side-body">
                <div class="m08-raw-head">
                  <span class="m08-raw-id">${selected.id}</span>
                  <span class="m08-tag ${statusTagClass(selected.status)}">${selected.status}</span>
                </div>

                <div class="m08-kv-list">
                  <div class="m08-kv-row"><span class="m08-kv-k">计量期次</span><span class="m08-kv-v">${selected.period}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">所属工区 / 合同段</span><span class="m08-kv-v">${selected.section} · ${selected.contract}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">工程分项</span><span class="m08-kv-v">${selected.item}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">原系统记录金额</span><span class="m08-kv-v">${fmtMoney(selected.amount)} 万元</span></div>
                </div>

                <div class="m08-subcard">
                  <div class="m08-subcard-title">
                    <span>原系统支付信息</span>
                    <span class="m08-tag ${statusTagClass(selected.payStatus)}">${selected.payStatus}</span>
                  </div>
                  <div class="m08-kv-row"><span class="m08-kv-k">已回传支付金额</span><span class="m08-kv-v">${selected.paidAmount > 0 ? `${fmtMoney(selected.paidAmount)} 万元` : '—'}</span></div>
                  <div class="m08-kv-row"><span class="m08-kv-k">支付信息回传时间</span><span class="m08-kv-v">${selected.payTime}</span></div>
                </div>

                <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;color:#93b8de;margin-top:2px;">
                  <span style="font-weight:700;color:#dbeafe;">可获取附件</span>
                  <span>2 份</span>
                </div>
                <div class="m08-attach-list">
                  <div class="m08-attach-item">
                    <div class="m08-attach-left">
                      <span class="m08-attach-ico">${ICONS.filePdf}</span>
                      <div style="min-width:0;">
                        <div class="m08-attach-name">${selected.contract}计量确认单.pdf</div>
                        <div class="m08-attach-sub">计量确认单</div>
                      </div>
                    </div>
                    <div class="m08-attach-right">
                      <span class="m08-ext-tag">PDF</span>
                      <button class="m08-link-btn" data-attach-type="pdf" data-attach-id="${selected.id}">查阅 ${ICONS.ext}</button>
                    </div>
                  </div>
                  <div class="m08-attach-item">
                    <div class="m08-attach-left">
                      <span class="m08-attach-ico">${ICONS.fileXls}</span>
                      <div style="min-width:0;">
                        <div class="m08-attach-name">${selected.item}计量计算表.xlsx</div>
                        <div class="m08-attach-sub">工程量计算</div>
                      </div>
                    </div>
                    <div class="m08-attach-right">
                      <span class="m08-ext-tag">XLSX</span>
                      <button class="m08-link-btn" data-attach-type="xlsx" data-attach-id="${selected.id}">查阅 ${ICONS.ext}</button>
                    </div>
                  </div>
                </div>

                <div class="m08-side-footer">
                  <span>同步于 ${selected.syncTime}</span>
                  <button class="dock-btn primary" data-open-sys-rec="${selected.id}">${ICONS.ext}<span>查看原系统记录</span></button>
                </div>
              </div>
            ` : `
              <div class="m08-side-body" style="text-align:center;color:#93b8de;padding:30px 14px;">暂无匹配的原始记录详情</div>
            `}
          </div>
        </div>
      </div>
    `;
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
      uiState.overview.page = 1;
      uiState.rawRecords.page = 1;
      uiState.sectionStats.contract = '';
      if (ctx.state.activeSectionId) {
        uiState.sectionStats.selectedSecId = ctx.state.activeSectionId;
        uiState.physicalCompare.fallbackSecId = ctx.state.activeSectionId;
      }
    }

    let html = '';
    switch (lastSubPageId) {
      case 'sectionStats': html = renderSectionStats(ctx); break;
      case 'physicalCompare': html = renderPhysicalCompare(ctx); break;
      case 'rawRecords': html = renderRawRecords(ctx); break;
      default: html = renderOverview(ctx); break;
    }

    hostEl.innerHTML = html;
    bindEvents(hostEl, lastSubPageId, ctx);
  }

  function bindEvents(hostEl, subPageId, ctx) {
    const st = uiState[subPageId] || uiState.overview;

    // Select filters
    hostEl.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        const key = e.target.dataset.filter;
        const val = e.target.value;
        if (key === 'section') {
          if (st.page !== undefined) st.page = 1;
          syncSectionToHost(val);
          return;
        }
        if (key === 'contractScope') {
          uiState.physicalCompare.fallbackSecId = val;
          syncSectionToHost(val);
          return;
        }
        if (key === 'contract' && subPageId === 'sectionStats') {
          st.contract = val;
          renderPage(hostEl, subPageId, ctx);
          return;
        }
        st[key] = val;
        if (st.page !== undefined) st.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Keyword input
    hostEl.querySelectorAll('[data-filter-input]').forEach(inp => {
      inp.addEventListener('input', e => {
        st[e.target.dataset.filterInput] = e.target.value;
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          if (st.page !== undefined) st.page = 1;
          renderPage(hostEl, subPageId, ctx);
        }
      });
    });

    // Action buttons
    hostEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'query') {
          if (st.page !== undefined) st.page = 1;
          renderPage(hostEl, subPageId, ctx);
          ctx.showToast('已按当前筛选条件刷新计量数据');
        } else if (act === 'reset') {
          if (subPageId === 'overview') {
            uiState.overview = { period: '2026年11月', caliber: '已确认计量', statusFilter: '', page: 1 };
          } else if (subPageId === 'sectionStats') {
            uiState.sectionStats = { contract: '', item: '', period: '2026年11月', selectedSecId: 'sec2' };
          } else if (subPageId === 'physicalCompare') {
            uiState.physicalCompare = { fallbackSecId: 'sec2', item: '', period: '2026年11月', selectedItem: '路基土方' };
          } else if (subPageId === 'rawRecords') {
            uiState.rawRecords = { period: '2026年11月', status: '', payStatus: '', keyword: '', selectedId: 'JL-A2-202611-018', page: 1 };
          }
          if (ctx.state.activeSectionId) {
            syncSectionToHost('');
          } else {
            renderPage(hostEl, subPageId, ctx);
          }
          ctx.showToast('已重置计量管理筛选条件');
        } else if (act === 'openSys') {
          openOriginalSystemModal(null);
        }
      });
    });

    // Pagination
    hostEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const nextPage = Number(btn.dataset.page);
        if (!Number.isFinite(nextPage) || nextPage < 1) return;
        st.page = nextPage;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Period bar click (Page 1)
    hostEl.querySelectorAll('[data-period-pick]').forEach(el => {
      el.addEventListener('click', () => {
        const p = el.dataset.periodPick;
        uiState.overview.period = p;
        uiState.overview.page = 1;
        renderPage(hostEl, subPageId, ctx);
        ctx.showToast(`已切换计量期次：${p}`);
      });
    });

    // Status donut / legend click (Page 1)
    hostEl.querySelectorAll('[data-status-pick]').forEach(el => {
      el.addEventListener('click', () => {
        const val = el.dataset.statusPick;
        uiState.overview.statusFilter = uiState.overview.statusFilter === val ? '' : val;
        uiState.overview.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Payment tile click (Page 1 -> Page 4 filtered by payStatus)
    hostEl.querySelectorAll('[data-pay-jump]').forEach(tile => {
      tile.addEventListener('click', () => {
        const pSt = tile.dataset.payJump;
        uiState.rawRecords.payStatus = pSt;
        uiState.rawRecords.period = uiState.overview.period;
        uiState.rawRecords.page = 1;
        ctx.switchModule('measure', 'rawRecords');
        ctx.showToast(`已筛选原系统支付状态：${pSt}`);
      });
    });

    // Clear pay filter chip on Page 4
    hostEl.querySelectorAll('[data-clear-pay]').forEach(chip => {
      chip.addEventListener('click', () => {
        uiState.rawRecords.payStatus = '';
        uiState.rawRecords.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Section bar / row pick (Page 2 -> 3-way sync)
    hostEl.querySelectorAll('[data-sec-pick]').forEach(el => {
      el.addEventListener('click', () => {
        const target = el.dataset.secPick;
        syncSectionToHost(ctx.state.activeSectionId === target ? '' : target);
      });
    });
    hostEl.querySelectorAll('[data-select-secrow]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        uiState.sectionStats.selectedSecId = row.dataset.selectSecrow;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Cross-tab jumps: Page 2 -> Page 3 (查看分项)
    hostEl.querySelectorAll('[data-jump-phys]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const targetSec = btn.dataset.jumpPhys;
        uiState.physicalCompare.fallbackSecId = targetSec;
        uiState.physicalCompare.period = uiState.sectionStats.period;
        if (ctx.state.activeSectionId !== targetSec) {
          syncSectionToHost(targetSec);
        }
        ctx.switchModule('measure', 'physicalCompare');
      });
    });

    // Cross-tab jumps: Page 1/2/3 -> Page 4 (查看原始记录)
    hostEl.querySelectorAll('[data-jump-raw]').forEach(el => {
      el.addEventListener('click', () => {
        const targetId = el.dataset.jumpRaw;
        if (targetId) {
          uiState.rawRecords.selectedId = targetId;
        }
        uiState.rawRecords.period = st.period || '2026年11月';
        uiState.rawRecords.page = 1;
        ctx.switchModule('measure', 'rawRecords');
      });
    });

    // Page 1 Record Detail Modal
    hostEl.querySelectorAll('[data-record-modal]').forEach(el => {
      el.addEventListener('click', e => {
        if (el.tagName === 'TR' && e.target.closest('button')) return;
        const id = el.dataset.recordModal;
        const periodList = getRecordsForPeriod(uiState.overview.period);
        const rec = periodList.find(r => r.id === id);
        if (rec) openRecordDetailModal(rec);
      });
    });

    // Page 3 Item Selection & Detail Modal
    hostEl.querySelectorAll('[data-pick-item]').forEach(el => {
      el.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        uiState.physicalCompare.selectedItem = el.dataset.pickItem;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-phys-modal]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const itemName = btn.dataset.physModal;
        const activeSecId = ctx.state.activeSectionId || uiState.physicalCompare.fallbackSecId || 'sec2';
        const sec = SECTION_BY_ID[activeSecId] || SECTIONS[1];
        const pm = getPeriodMeta(uiState.physicalCompare.period);
        const raw = (PHYSICAL_DATA_BY_SEC[sec.id] || PHYSICAL_DATA_BY_SEC.sec2).find(x => x.item === itemName);
        if (raw) {
          const isNov = pm.period === '2026年11月';
          const mQty = isNov ? raw.measuredQty : +(raw.measuredQty * Math.min(1, 0.45 + 0.55 * (pm.cumTotal / 63582.40))).toFixed(raw.unit.startsWith('万') ? 1 : 0);
          const pQty = isNov ? raw.physicalQty : Math.max(mQty, +(raw.physicalQty * Math.min(1, 0.45 + 0.55 * (pm.cumTotal / 63582.40))).toFixed(raw.unit.startsWith('万') ? 1 : 0));
          openPhysicalItemModal(sec, {
            item: raw.item,
            unit: raw.unit,
            contractQty: raw.contractQty,
            measuredQty: mQty,
            physicalQty: pQty,
            periodAmt: +(raw.periodAmt * pm.scale).toFixed(2),
            recId: isNov ? raw.recId : raw.recId.replace('202611', pm.period.replace('年', '').replace('月', ''))
          }, pm.period);
        }
      });
    });

    // Page 4 Row Select & View Modal & Attachment Preview Modals
    hostEl.querySelectorAll('[data-raw-select]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        uiState.rawRecords.selectedId = row.dataset.rawSelect;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-raw-view]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        const id = btn.dataset.rawView;
        uiState.rawRecords.selectedId = id;
        renderPage(hostEl, subPageId, ctx);
        const rec = getRecordsForPeriod(uiState.rawRecords.period).find(r => r.id === id);
        if (rec) openRecordDetailModal(rec);
      });
    });
    hostEl.querySelectorAll('[data-attach-type]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.attachId;
        const type = btn.dataset.attachType;
        const rec = getRecordsForPeriod(uiState.rawRecords.period).find(r => r.id === id);
        if (rec) openAttachmentModal(rec, type);
      });
    });
    hostEl.querySelectorAll('[data-open-sys-rec]').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.openSysRec;
        const rec = getRecordsForPeriod(uiState.rawRecords.period).find(r => r.id === id);
        openOriginalSystemModal(rec || null);
      });
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'measure',
    name: '计量管理',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange(secId) {
      if (secId) {
        uiState.sectionStats.selectedSecId = secId;
        uiState.physicalCompare.fallbackSecId = secId;
      }
    },

    onLeave() {
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
    }
  });
})();
