/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 6：机械管理 (js/modules/m06_machine.js)
   包含 2 个子页面：机械设备 (equipment)、重点机械档案 (keyArchive)
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'equipment', name: '机械设备' },
    { id: 'keyArchive', name: '重点机械档案' }
  ];

  const BASE_DATE = '2026-11-26';
  const BASE_DATE_MS = Date.parse('2026-11-26T00:00:00Z');
  const DAY_MS = 86400000;

  const SECTIONS = [
    { id: 'sec1', name: '一工区', unit: '一工区施工单位', stake: 'K0+000 ~ K24+500', yard: '一工区材料场', bridge: 'K12+600 跨线桥', road: 'K08+120 路基段' },
    { id: 'sec2', name: '二工区', unit: '二工区施工单位', stake: 'K24+500 ~ K48+200', yard: '二号梁场', bridge: '二工区 · 桥梁示例A', road: 'K28+400 路基段' },
    { id: 'sec3', name: '三工区', unit: '三工区施工单位', stake: 'K48+200 ~ K72+800', yard: '三工区 · 一号梁场', bridge: 'K56+300 大桥', road: 'K62+100 水稳段' },
    { id: 'sec4', name: '四工区', unit: '四工区施工单位', stake: 'K72+800 ~ K96+000', yard: '四工区 · 二号梁场', bridge: '跨河中桥 3#墩', road: 'K84+500 路面段' },
    { id: 'sec5', name: '五工区', unit: '五工区施工单位', stake: 'K96+000 ~ K121+400', yard: '五工区预制场', bridge: 'K104+200 枢纽桥', road: 'K110+600 路基段' },
    { id: 'sec6', name: '六工区', unit: '六工区施工单位', stake: 'K121+400 ~ K146+800', yard: '六工区拌合站区', bridge: '建华枢纽互通桥', road: 'K135+400 沥青段' }
  ];

  const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));

  const EQUIP_TYPES = [
    { name: '土石方设备', prefix: 'TS', color: '#38f2ff' },
    { name: '路面设备', prefix: 'LM', color: '#22d3ee' },
    { name: '起重设备', prefix: 'QZ', color: '#38bdf8' },
    { name: '运输及其他', prefix: 'YS', color: '#0ea5e9' },
    { name: '架桥机', prefix: 'JQ', color: '#60a5fa' }
  ];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external CDN dependency)
     ------------------------------------------------------------------------ */
  const ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    chartBox: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7 16V11M12 16V8M17 16v-4"/></svg>`,
    pin: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 21s-6-5.3-6-10.5a6 6 0 1112 0C18 15.7 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.3"/></svg>`,
    gear: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="3.2"/><path d="M19.4 15a1.6 1.6 0 00.33 1.82l.06.06a2 2 0 01-2.83 2.83l-.06-.06a1.6 1.6 0 00-1.82-.33 1.6 1.6 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.6 1.6 0 00-1-1.51 1.6 1.6 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06a1.6 1.6 0 00.33-1.82 1.6 1.6 0 00-1.51-1H3a2 2 0 010-4h.09a1.6 1.6 0 001.51-1 1.6 1.6 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06a1.6 1.6 0 001.82.33H9a1.6 1.6 0 001-1.51V3a2 2 0 014 0v.09a1.6 1.6 0 001 1.51 1.6 1.6 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06a1.6 1.6 0 00-.33 1.82V9a1.6 1.6 0 001.51 1H21a2 2 0 010 4h-.09a1.6 1.6 0 00-1.51 1z"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    pauseCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><line x1="10" y1="9" x2="10" y2="15"/><line x1="14" y1="9" x2="14" y2="15"/></svg>`,
    truckExit: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2" y="7" width="12" height="9" rx="1.5"/><path d="M14 10h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17.5" cy="17.5" r="1.8"/></svg>`,
    crane: `<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20h16M6 20V5h12v15M6 9h12M12 9v4l-2 2"/></svg>`,
    archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="4" rx="1"/><path d="M5 8v11a1.5 1.5 0 001.5 1.5h11A1.5 1.5 0 0019 19V8"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    shieldCheck: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2l8 4v6c0 5.2-3.4 9.2-8 10-4.6-.8-8-4.8-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
    warnTri: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>`,
    doc: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
    clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    pdf: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="8" y1="14" x2="16" y2="14"/></svg>`
  };

  /* ------------------------------------------------------------------------
     GENUINE RECONCILED DATASET (128 Equipment, 28 Key Machines, 42 Patrol Logs)
     ------------------------------------------------------------------------ */
  function buildReconciledDataset() {
    // Target matrix for 112 on-site equipment by section & type:
    // sec1:17, sec2:22, sec3:20, sec4:19, sec5:18, sec6:16 (sum=112)
    // TS:42, LM:28, QZ:24, YS:14, JQ:4 (sum=112)
    const onSiteMatrix = {
      sec1: { '土石方设备': 7, '路面设备': 4, '起重设备': 4, '运输及其他': 2, '架桥机': 0 },
      sec2: { '土石方设备': 8, '路面设备': 5, '起重设备': 5, '运输及其他': 3, '架桥机': 1 },
      sec3: { '土石方设备': 7, '路面设备': 5, '起重设备': 4, '运输及其他': 3, '架桥机': 1 },
      sec4: { '土石方设备': 7, '路面设备': 5, '起重设备': 4, '运输及其他': 2, '架桥机': 1 },
      sec5: { '土石方设备': 7, '路面设备': 5, '起重设备': 4, '运输及其他': 2, '架桥机': 0 },
      sec6: { '土石方设备': 6, '路面设备': 4, '起重设备': 3, '运输及其他': 2, '架桥机': 1 }
    };

    // Exited matrix for 16 exited equipment: TS:6, LM:4, YS:6 (sum=16)
    const exitedMatrix = {
      sec1: { '土石方设备': 1, '路面设备': 1, '起重设备': 0, '运输及其他': 1, '架桥机': 0 },
      sec2: { '土石方设备': 1, '路面设备': 1, '起重设备': 0, '运输及其他': 1, '架桥机': 0 },
      sec3: { '土石方设备': 1, '路面设备': 1, '起重设备': 0, '运输及其他': 1, '架桥机': 0 },
      sec4: { '土石方设备': 1, '路面设备': 0, '起重设备': 0, '运输及其他': 1, '架桥机': 0 },
      sec5: { '土石方设备': 1, '路面设备': 1, '起重设备': 0, '运输及其他': 1, '架桥机': 0 },
      sec6: { '土石方设备': 1, '路面设备': 0, '起重设备': 0, '运输及其他': 1, '架桥机': 0 }
    };

    // Pinned Page 1 top 8 rows (exact match to 01_机械设备.png) + Page 2 pinned 4 rows (exact match to 02_重点机械档案.png)
    const pinnedDefs = [
      {
        code: 'QZ-03-006', name: '门式起重机', type: '起重设备', secId: 'sec3', entryStatus: '在场', useStatus: '在用',
        isKey: true, keyOrder: 1, archiveId: 'DA-QZ-03006', model: 'MG-80T/32m', spec: '额定起重量 80t · 跨度 32m',
        entryDate: '2026-09-14', exitDate: '—', location: '三工区 · 一号梁场',
        inspectNo: 'JY-2025-0316', inspectDate: '2025-12-19', validUntil: '2026-12-18', installValidUntil: '2027-03-10',
        operator: '张海峰（特种作业证号 JL-QZ-0306）', manufacturer: '河南卫华重型机械股份有限公司',
        patrolLogs: [
          { id: 'XC-20261125-016', time: '11-25 15:20', content: '起重设备例行巡查', status: '记录正常', inspector: '周明', detail: '主梁焊缝、大车走行机构、起升制动器及声光报警器运行正常，无异常声响。' },
          { id: 'XC-20261120-008', time: '11-20 10:35', content: '限位标识专项巡查', status: '已处理', inspector: '陈亮', detail: '复核起升高度限位器与轨道端部止挡标识，已补充反光警示贴并拍照归档。' },
          { id: 'XC-20261114-003', time: '11-14 09:46', content: '维护后检查记录', status: '已归档', inspector: '李伟', detail: '完成钢丝绳润滑保养与卷筒压板力矩复紧，空载及额定载荷试吊合格。' }
        ]
      },
      {
        code: 'JQ-02-001', name: '架桥机', type: '架桥机', secId: 'sec2', entryStatus: '在场', useStatus: '在用',
        isKey: true, keyOrder: 2, archiveId: 'DA-JQ-02001', model: 'DJ180/40m', spec: '额定起重量 180t · 适应跨径 40m',
        entryDate: '2026-07-18', exitDate: '—', location: '二工区 · 桥梁示例A',
        inspectNo: 'JY-2026-0118', inspectDate: '2026-04-21', validUntil: '2027-04-20', installValidUntil: '2027-06-15',
        operator: '刘建国（特种作业证号 JL-JQ-0201）', manufacturer: '郑州大方桥梁机械有限公司',
        patrolLogs: [
          { id: 'XC-20261124-011', time: '11-24 14:10', content: '过孔前支腿锁定核查', status: '记录正常', inspector: '王涛', detail: '前中后支腿液压锁止可靠，主梁挠度监测在允许范围内。' },
          { id: 'XC-20261115-004', time: '11-15 09:20', content: '架桥机风速仪校准检查', status: '已归档', inspector: '赵刚', detail: '风速报警阈值设定 10.8m/s（6级风），信号回传正常。' }
        ]
      },
      {
        code: 'TS-01-018', name: '履带挖掘机', type: '土石方设备', secId: 'sec1', entryStatus: '在场', useStatus: '在用',
        isKey: false, model: 'CAT 336', spec: '工作重量 36.2t · 斗容 1.9m³',
        entryDate: '2026-06-12', exitDate: '—', location: '一工区 · K08+120 路基段',
        operator: '赵铁柱', manufacturer: '卡特彼勒（徐州）有限公司'
      },
      {
        code: 'LM-04-013', name: '双钢轮压路机', type: '路面设备', secId: 'sec4', entryStatus: '在场', useStatus: '待用',
        isKey: false, model: 'BOMAG BW203AD-4', spec: '工作重量 13.5t · 碾压宽度 2.13m',
        entryDate: '2026-08-22', exitDate: '—', location: '四工区 · K84+500 路面段',
        operator: '马志远', manufacturer: '宝马格（中国）工程机械有限公司'
      },
      {
        code: 'LM-06-004', name: '沥青摊铺机', type: '路面设备', secId: 'sec6', entryStatus: '在场', useStatus: '在用',
        isKey: false, model: 'VÖGELE SUPER 2100-3', spec: '最大摊铺宽度 13m · 功率 186kW',
        entryDate: '2026-09-03', exitDate: '—', location: '六工区 · K135+400 沥青段',
        operator: '韩志强', manufacturer: '维特根（中国）机械有限公司'
      },
      {
        code: 'QZ-04-012', name: '履带起重机', type: '起重设备', secId: 'sec4', entryStatus: '在场', useStatus: '停用',
        isKey: true, keyOrder: 3, archiveId: 'DA-QZ-04012', model: 'QUY80A', spec: '额定起重量 80t · 主臂 52m',
        entryDate: '2026-06-25', exitDate: '—', location: '四工区 · 跨河中桥 3#墩',
        inspectNo: 'JY-2025-0209', inspectDate: '2025-11-19', validUntil: '2026-11-18', installValidUntil: '2026-11-18',
        operator: '孙立群（特种作业证号 JL-QZ-0412）', manufacturer: '徐州重型机械有限公司',
        patrolLogs: [
          { id: 'XC-20261119-002', time: '11-19 08:50', content: '证书超期停用封存核查', status: '已处理', inspector: '周海涛', detail: '检验有效期 2026-11-18 已届满，已下发停用锁机通知并预约特检院复检。' },
          { id: 'XC-20261110-005', time: '11-10 14:30', content: '力矩限制器灵敏度抽查', status: '已归档', inspector: '周海涛', detail: '复检前例行检查，工况设定与变幅限位开关正常。' }
        ]
      },
      {
        code: 'TS-05-009', name: '轮式装载机', type: '土石方设备', secId: 'sec5', entryStatus: '在场', useStatus: '在用',
        isKey: false, model: 'XCMG LW500KV', spec: '额定载重 5.0t · 斗容 3.0m³',
        entryDate: '2026-07-08', exitDate: '—', location: '五工区 · 五工区预制场',
        operator: '王海龙', manufacturer: '徐工集团工程机械股份有限公司'
      },
      {
        code: 'YS-02-011', name: '自卸式运输车', type: '运输及其他', secId: 'sec2', entryStatus: '已退场', useStatus: '—',
        isKey: false, model: 'HOWO TX 8×4', spec: '核定载质量 31t · 货箱容积 22m³',
        entryDate: '2026-05-12', exitDate: '2026-11-15', location: '二工区 · 已办理退场（原K28+400）',
        operator: '高强', manufacturer: '中国重汽集团济南卡车股份有限公司'
      },
      // Pinned from Page 2 (rows 4..7 of 02_重点机械档案.png)
      {
        code: 'QZ-02-003', name: '汽车起重机', type: '起重设备', secId: 'sec2', entryStatus: '在场', useStatus: '在用',
        isKey: true, keyOrder: 4, archiveId: 'DA-QZ-02003', model: 'QAY55K5', spec: '额定起重量 55t · 5节主臂',
        entryDate: '2026-07-29', exitDate: '—', location: '二工区 · 二号梁场',
        inspectNo: 'JY-2025-0288', inspectDate: '2025-12-08', validUntil: '2026-12-07', installValidUntil: '2027-02-01',
        operator: '陈志勇（特种作业证号 JL-QZ-0203）', manufacturer: '中联重科股份有限公司',
        patrolLogs: [
          { id: 'XC-20261123-012', time: '11-23 11:15', content: '支腿垫木与风力作业巡查', status: '记录正常', inspector: '刘志鹏', detail: '支腿全伸垫板稳固，吊钩防脱棘爪完好。' },
          { id: 'XC-20261112-007', time: '11-12 16:05', content: '检验到期前30日预检提示', status: '已处理', inspector: '刘志鹏', detail: '已提交年度定期检验预约单，计划 11-29 现场检测。' }
        ]
      },
      {
        code: 'JQ-04-002', name: '架桥机', type: '架桥机', secId: 'sec4', entryStatus: '在场', useStatus: '待用',
        isKey: true, keyOrder: 5, archiveId: 'DA-JQ-04002', model: 'JQ160/40m', spec: '额定起重量 160t · 双导梁步履式',
        entryDate: '2026-08-19', exitDate: '—', location: '四工区 · 二号梁场存梁区',
        inspectNo: 'JY-2026-0142', inspectDate: '2026-05-03', validUntil: '2027-05-02', installValidUntil: '2027-06-20',
        operator: '吴国梁（特种作业证号 JL-JQ-0402）', manufacturer: '中铁工程装备集团有限公司',
        patrolLogs: [
          { id: 'XC-20261122-009', time: '11-22 10:20', content: '待用设备防风防冻巡查', status: '记录正常', inspector: '周海涛', detail: '液压油箱防寒伴热运行正常，轨道夹轨器已锁紧。' }
        ]
      },
      {
        code: 'QZ-05-002', name: '随车起重机', type: '起重设备', secId: 'sec5', entryStatus: '在场', useStatus: '停用',
        isKey: true, keyOrder: 6, archiveId: 'DA-QZ-05002', model: 'SQS300-4', spec: '额定起重量 12t · 最大工作幅度 14.5m',
        entryDate: '2026-10-18', exitDate: '—', location: '五工区 · 五工区预制场',
        inspectNo: 'JY-待补录', inspectDate: '—', validUntil: '—', installValidUntil: '—',
        operator: '杨鹏（特种作业证号 JL-QZ-0502）', manufacturer: '徐工随车起重机有限公司',
        missingDocs: true,
        patrolLogs: [
          { id: 'XC-20261121-014', time: '11-21 15:40', content: '进场资料缺项复核', status: '已处理', inspector: '孙明辉', detail: '原定期检验报告扫描件未盖检测章，暂按停用管控，待施工单位补齐资料后启用。' }
        ]
      },
      {
        code: 'QZ-01-002', name: '汽车起重机', type: '起重设备', secId: 'sec1', entryStatus: '在场', useStatus: '停用',
        isKey: true, keyOrder: 7, archiveId: 'DA-QZ-01002', model: 'STC500E', spec: '额定起重量 50t · 主臂 42.5m',
        entryDate: '2026-06-05', exitDate: '—', location: '一工区 · K12+600 跨线桥',
        inspectNo: 'JY-2025-0194', inspectDate: '2025-11-22', validUntil: '2026-11-21', installValidUntil: '2026-11-21',
        operator: '郑海涛（特种作业证号 JL-QZ-0102）', manufacturer: '三一重工股份有限公司',
        patrolLogs: [
          { id: 'XC-20261122-001', time: '11-22 09:05', content: '检验过期强制停用检查', status: '已处理', inspector: '赵建军', detail: '证书于 2026-11-21 到期，已张贴停用警示牌并收回作业钥匙。' }
        ]
      }
    ];

    // Remaining key machine validUntil schedule to achieve exact counts:
    // Pinned 7 key machines already have:
    //   即将到期: 2 (2026-12-18, 2026-12-07) -> need 3 more (total 5)
    //   已到期:   2 (2026-11-18, 2026-11-21) -> need 0 more (total 2)
    //   待补资料: 1 (QZ-05-002) -> need 1 more (total 2)
    //   正常有效: 2 (2027-04-20, 2027-05-02) -> need 17 more (total 19)
    // Total remaining key slots = 28 - 7 = 21 (19 QZ + 2 JQ)
    const remainingKeyDates = [
      '2026-12-11', '2026-12-15', '2026-12-22', // 3 即将到期
      '—', // 1 待补资料
      '2027-01-18', '2027-02-04', '2027-02-19', '2027-03-08', '2027-03-22',
      '2027-04-06', '2027-04-15', '2027-05-12', '2027-05-28', '2027-06-09',
      '2027-06-21', '2027-07-05', '2027-07-19', '2027-08-03', '2027-08-18',
      '2027-09-02', '2027-09-16' // 17 正常有效
    ];

    // Catalogs for generated equipment
    const NAME_CATALOG = {
      '土石方设备': [
        { name: '履带挖掘机', model: 'SY365H', spec: '工作重量 36t · 斗容 1.8m³', mfg: '三一重机有限公司' },
        { name: '轮式装载机', model: 'ZL50GN', spec: '额定载重 5.0t · 斗容 3.0m³', mfg: '徐工集团工程机械股份有限公司' },
        { name: '履带推土机', model: 'SD22', spec: '功率 162kW · 铲刀 6.4m³', mfg: '山推工程机械股份有限公司' },
        { name: '振动压路机', model: 'XS223J', spec: '工作重量 22t · 激振力 390kN', mfg: '徐工道路机械事业部' },
        { name: '平地机', model: 'GR215', spec: '功率 160kW · 刮刀长 4.27m', mfg: '徐工道路机械事业部' }
      ],
      '路面设备': [
        { name: '双钢轮压路机', model: 'XD133', spec: '工作重量 13t · 振动频率 67Hz', mfg: '徐工道路机械事业部' },
        { name: '沥青摊铺机', model: 'RP953T', spec: '最大摊铺宽度 9.5m · 190kW', mfg: '徐工道路机械事业部' },
        { name: '胶轮压路机', model: 'XP303', spec: '工作重量 30t · 11轮充气轮胎', mfg: '徐工道路机械事业部' },
        { name: '水稳摊铺机', model: 'DTU95C', spec: '最大摊铺宽度 9.5m · 双振捣', mfg: '三一重工路机事业部' },
        { name: '路面铣刨机', model: 'XM200K', spec: '铣刨宽度 2.0m · 最大深度 320mm', mfg: '徐工道路机械事业部' }
      ],
      '起重设备': [
        { name: '门式起重机', model: 'MG-80T', spec: '额定起重量 80t · 跨度 32m', mfg: '河南卫华重型机械股份有限公司' },
        { name: '汽车起重机', model: 'STC500E', spec: '额定起重量 50t · 主臂 42.5m', mfg: '三一重工股份有限公司' },
        { name: '履带起重机', model: 'SCC800A', spec: '额定起重量 80t · 主臂 56m', mfg: '三一重工股份有限公司' },
        { name: '塔式起重机', model: 'QTZ125', spec: '最大起重量 10t · 臂长 60m', mfg: '中联重科股份有限公司' },
        { name: '随车起重机', model: 'SQS250', spec: '额定起重量 10t · 幅度 13.8m', mfg: '徐工随车起重机有限公司' }
      ],
      '运输及其他': [
        { name: '自卸式运输车', model: 'SHACMAN X3000', spec: '核定载重 31t · 8×4 驱动', mfg: '陕西重型汽车有限公司' },
        { name: '混凝土搅拌运输车', model: 'SY412C-8', spec: '搅拌容积 12m³ · 寒区保温', mfg: '三一汽车制造有限公司' },
        { name: '洒水抑尘车', model: 'DFH5180', spec: '罐体容积 14m³ · 雾炮 30m', mfg: '东风商用车有限公司' },
        { name: '柴油发电机组', model: 'GF-400kW', spec: '额定功率 400kW · 静音箱式', mfg: '潍柴重机股份有限公司' }
      ],
      '架桥机': [
        { name: '架桥机', model: 'DJ180/40m', spec: '额定起重量 180t · 双主梁', mfg: '郑州大方桥梁机械有限公司' },
        { name: '架桥机', model: 'JQ160/40m', spec: '额定起重量 160t · 步履式', mfg: '中铁工程装备集团有限公司' }
      ]
    };

    const OPERATORS = ['李志强', '张建军', '刘伟', '王俊杰', '陈晓东', '赵永刚', '孙海军', '周立新', '吴志刚', '马春光', '郭文斌', '韩磊'];
    const INSPECTORS = ['周明', '陈亮', '王涛', '赵建军', '刘志鹏', '周海涛', '孙明辉', '韩立新'];

    // Track remaining counts per (secId, type) for on-site & exited
    const remOnSite = JSON.parse(JSON.stringify(onSiteMatrix));
    const remExited = JSON.parse(JSON.stringify(exitedMatrix));
    const usedCodes = new Set();

    const list = [];

    // Helper to consume slot
    pinnedDefs.forEach(p => {
      usedCodes.add(p.code);
      if (p.entryStatus === '在场') remOnSite[p.secId][p.type]--;
      else remExited[p.secId][p.type]--;
      list.push(Object.assign({
        section: SECTION_BY_ID[p.secId].name,
        unit: SECTION_BY_ID[p.secId].unit,
        patrolLogs: []
      }, p));
    });

    // Usage status remaining quotas for generated on-site items:
    // Total target on-site = 112: 在用 86, 待用 18, 停用 8
    // Pinned on-site (11 items):
    //   在用: QZ-03-006, JQ-02-001, TS-01-018, LM-06-004, TS-05-009, QZ-02-003 (6)
    //   待用: LM-04-013, JQ-04-002 (2)
    //   停用: QZ-04-012, QZ-05-002, QZ-01-002 (3)
    // Remaining 101 on-site slots need: 在用 80, 待用 16, 停用 5
    let remInUse = 80;
    let remStandby = 16;
    let remStopped = 5;

    // Build remaining slots list
    const pendingSlots = [];
    SECTIONS.forEach(sec => {
      EQUIP_TYPES.forEach(t => {
        for (let i = 0; i < remOnSite[sec.id][t.name]; i++) {
          pendingSlots.push({ secId: sec.id, type: t.name, prefix: t.prefix, entryStatus: '在场' });
        }
        for (let i = 0; i < remExited[sec.id][t.name]; i++) {
          pendingSlots.push({ secId: sec.id, type: t.name, prefix: t.prefix, entryStatus: '已退场' });
        }
      });
    });

    // Assign remaining key machine dates & patrol counts so total patrol logs === 42
    // Pinned 7 key machines already have: 3 + 2 + 2 + 2 + 1 + 1 + 1 = 12 patrol logs!
    // Remaining 21 key machines need 42 - 12 = 30 patrol logs -> 9 machines get 2 logs, 12 machines get 1 log (9*2 + 12*1 = 30!)
    let keyIdx = 0;
    const seqBySecPrefix = {};

    function nextCode(prefix, secId) {
      const secNum = secId.replace('sec', '').padStart(2, '0');
      const k = `${prefix}-${secNum}`;
      let n = seqBySecPrefix[k] || 1;
      while (true) {
        const candidate = `${k}-${String(n).padStart(3, '0')}`;
        n++;
        if (!usedCodes.has(candidate)) {
          seqBySecPrefix[k] = n;
          usedCodes.add(candidate);
          return candidate;
        }
      }
    }

    pendingSlots.forEach((slot, idx) => {
      const sec = SECTION_BY_ID[slot.secId];
      const code = nextCode(slot.prefix, slot.secId);
      const catList = NAME_CATALOG[slot.type];
      const tpl = catList[idx % catList.length];
      const isKey = slot.type === '起重设备' || slot.type === '架桥机';

      let useStatus = '—';
      if (slot.entryStatus === '在场') {
        // Assign usage status deterministically matching exact quotas (80, 16, 5)
        if (isKey && keyIdx === 3) {
          // Wait: let missing-doc key item be 停用 or 待用 cleanly
          useStatus = remStopped > 0 ? (remStopped--, '停用') : (remInUse--, '在用');
        } else if (remStopped > 0 && idx % 19 === 6) {
          remStopped--;
          useStatus = '停用';
        } else if (remStandby > 0 && idx % 6 === 3) {
          remStandby--;
          useStatus = '待用';
        } else if (remInUse > 0) {
          remInUse--;
          useStatus = '在用';
        } else if (remStandby > 0) {
          remStandby--;
          useStatus = '待用';
        } else {
          remStopped--;
          useStatus = '停用';
        }
      }

      const monthNum = 6 + (idx % 5);
      const dayNum = 10 + (idx % 18);
      const entryDate = `2026-${String(monthNum).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
      const exitDate = slot.entryStatus === '已退场' ? `2026-11-${String(10 + (idx % 14)).padStart(2, '0')}` : '—';
      const loc = slot.type === '架桥机' || slot.type === '起重设备'
        ? sec.yard
        : (slot.type === '路面设备' || slot.type === '土石方设备' ? sec.road : sec.bridge);

      const rec = {
        code,
        name: tpl.name,
        type: slot.type,
        secId: slot.secId,
        section: sec.name,
        unit: sec.unit,
        entryStatus: slot.entryStatus,
        useStatus,
        isKey,
        model: tpl.model,
        spec: tpl.spec,
        manufacturer: tpl.mfg,
        entryDate,
        exitDate,
        location: slot.entryStatus === '已退场' ? `${sec.name} · 已办理退场` : loc,
        operator: OPERATORS[idx % OPERATORS.length] + (isKey ? `（特种证 JL-${code.replace(/-/g, '')}）` : ''),
        patrolLogs: []
      };

      if (isKey) {
        const validUntil = remainingKeyDates[keyIdx] || '2027-06-15';
        const missingDocs = validUntil === '—';
        const inspectDate = missingDocs ? '—' : `${Number(validUntil.slice(0, 4)) - 1}-${validUntil.slice(5)}`;
        const installMonth = String(Math.min(12, Math.max(1, Number(validUntil === '—' ? '06' : validUntil.slice(5, 7)) + 2))).padStart(2, '0');
        rec.keyOrder = 8 + keyIdx;
        rec.archiveId = `DA-${code.replace(/-/g, '')}`;
        rec.inspectNo = missingDocs ? 'JY-待补录' : `JY-2026-${String(410 + keyIdx).padStart(4, '0')}`;
        rec.inspectDate = inspectDate;
        rec.validUntil = validUntil;
        rec.installValidUntil = missingDocs ? '—' : `${validUntil.slice(0, 4)}-${installMonth}-${validUntil.slice(8)}`;
        rec.missingDocs = missingDocs;

        // Assign 2 patrol logs for first 9 generated key machines, 1 for remaining 12 => 30 logs total
        const logCount = keyIdx < 9 ? 2 : 1;
        for (let j = 0; j < logCount; j++) {
          const d = String(24 - ((keyIdx + j) % 14)).padStart(2, '0');
          const hh = String(9 + ((keyIdx + j) % 7)).padStart(2, '0');
          const mm = String(15 + ((keyIdx * 7 + j * 13) % 40)).padStart(2, '0');
          const topics = ['起重设备例行巡查', '限位装置与制动系统检查', '钢丝绳及吊具安全核查', '作业前支腿与风速仪点检'];
          const states = ['记录正常', '已处理', '已归档'];
          rec.patrolLogs.push({
            id: `XC-202611${d}-${String(100 + keyIdx * 3 + j).slice(-3)}`,
            time: `11-${d} ${hh}:${mm}`,
            content: topics[(keyIdx + j) % topics.length],
            status: states[(keyIdx + j) % states.length],
            inspector: INSPECTORS[(keyIdx + j) % INSPECTORS.length],
            detail: `对 ${sec.name} ${rec.name}（${code}）开展安全专项巡查，安全装置及作业环境受控。`
          });
        }
        keyIdx++;
      }

      list.push(rec);
    });

    return list;
  }

  const equipmentData = buildReconciledDataset();

  /* ------------------------------------------------------------------------
     PERSISTENT UI STATE
     ------------------------------------------------------------------------ */
  const uiState = {
    equipment: {
      equipType: '',
      entryStatus: '',
      useStatus: '',
      keyword: '',
      page: 1,
      pageSize: 8,
      selectedCode: 'QZ-03-006'
    },
    keyArchive: {
      equipType: '',
      certStatus: '',
      keyword: '',
      page: 1,
      pageSize: 7,
      selectedCode: 'QZ-03-006',
      dateField: 'validUntil',
      remindDays: 30,
      notifySystem: true,
      notifySms: false,
      autoBlockExpired: true
    }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'equipment';
  let lastRenderedSecId = null;

  /* ------------------------------------------------------------------------
     CERTIFICATE & REMINDER STATUS HELPERS
     ------------------------------------------------------------------------ */
  function getCertMeta(rec) {
    const ka = uiState.keyArchive;
    const dateVal = ka.dateField === 'installValidUntil' ? rec.installValidUntil : rec.validUntil;
    if (rec.missingDocs || !dateVal || dateVal === '—') {
      return {
        status: '待补资料',
        tagCls: 'info',
        tone: 'cyan',
        remindText: '待补全检验报告',
        remindColor: '#38f2ff',
        diffDays: null,
        displayDate: '—'
      };
    }
    const targetMs = Date.parse(dateVal + 'T00:00:00Z');
    const diffDays = Math.round((targetMs - BASE_DATE_MS) / DAY_MS);
    if (diffDays < 0) {
      return {
        status: '已到期',
        tagCls: 'fail',
        tone: 'red',
        remindText: `已超期 ${Math.abs(diffDays)} 天`,
        remindColor: '#f87171',
        diffDays,
        displayDate: dateVal
      };
    }
    if (diffDays <= Number(ka.remindDays || 30)) {
      return {
        status: '即将到期',
        tagCls: 'warn',
        tone: 'gold',
        remindText: `${diffDays} 天后到期`,
        remindColor: '#facc15',
        diffDays,
        displayDate: dateVal
      };
    }
    return {
      status: '正常有效',
      tagCls: 'ok',
      tone: 'green',
      remindText: `正常有效（余 ${diffDays} 天）`,
      remindColor: '#4ade80',
      diffDays,
      displayDate: dateVal
    };
  }

  /* ------------------------------------------------------------------------
     SCOPED CSS (<style id="m06-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m06-styles')) return;
    const style = document.createElement('style');
    style.id = 'm06-styles';
    style.textContent = `
      .m06-page {
        padding: 10px 16px 76px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }

      /* Filter Toolbar */
      .m06-filter-bar {
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m06-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m06-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m06-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m06-select {
        min-width: 122px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m06-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m06-search-ico {
        position: absolute;
        left: 10px;
        color: #7eb6ea;
        pointer-events: none;
        display: inline-flex;
      }
      .m06-input {
        width: 205px;
        height: 32px;
        padding: 4px 10px 4px 30px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: rgba(8, 28, 66, 0.85);
        color: #f1f7ff;
        font-size: 12.5px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m06-input::placeholder { color: #789bc4; }
      .m06-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 10px rgba(56, 220, 255, 0.25);
      }
      .m06-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m06-btn-query {
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
      .m06-btn-query:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m06-btn-reset {
        height: 32px;
        padding: 0 13px;
      }

      /* Panel Header */
      .m06-panel-header {
        cursor: default;
        padding: 8px 14px;
      }
      .m06-period-tag {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 4px;
      }
      .m06-header-meta {
        font-size: 12px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
      }

      /* 6-Card KPI Grid */
      .m06-kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        padding: 8px 14px 11px;
      }
      .m06-kpi-card {
        display: flex;
        align-items: center;
        gap: 11px;
        padding: 10px 12px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m06-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        transform: translateY(-1px);
      }
      .m06-kpi-icon {
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
      .m06-kpi-icon.tone-green { background: rgba(22, 163, 74, 0.18); border-color: rgba(74, 222, 128, 0.38); color: #4ade80; }
      .m06-kpi-icon.tone-gold { background: rgba(234, 179, 8, 0.18); border-color: rgba(250, 204, 21, 0.42); color: #facc15; }
      .m06-kpi-icon.tone-red { background: rgba(239, 68, 68, 0.18); border-color: rgba(248, 113, 113, 0.45); color: #f87171; }
      .m06-kpi-icon.tone-blue { background: rgba(37, 99, 235, 0.24); border-color: rgba(96, 165, 250, 0.42); color: #60a5fa; }
      .m06-kpi-meta { min-width: 0; flex: 1; }
      .m06-kpi-label {
        font-size: 11.5px;
        color: #a9c6e8;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m06-kpi-val-row { display: flex; align-items: baseline; gap: 3px; }
      .m06-kpi-val {
        font-size: 22px;
        font-weight: 800;
        line-height: 1.1;
        letter-spacing: 0.3px;
        font-variant-numeric: tabular-nums;
        color: #38f2ff;
        text-shadow: 0 0 12px rgba(56, 242, 255, 0.35);
      }
      .m06-kpi-val.tone-green { color: #4ade80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.35); }
      .m06-kpi-val.tone-gold { color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
      .m06-kpi-val.tone-red { color: #f87171; text-shadow: 0 0 12px rgba(248, 113, 113, 0.38); }
      .m06-kpi-val.tone-blue { color: #60a5fa; text-shadow: 0 0 12px rgba(96, 165, 250, 0.35); }
      .m06-kpi-unit { font-size: 12px; color: #d6e8ff; font-weight: 500; }

      /* Page 1: 3-Column Workspace */
      .m06-equip-grid {
        display: grid;
        grid-template-columns: minmax(235px, 19%) minmax(0, 1fr) minmax(290px, 24%);
        gap: 10px;
        flex: 1;
        align-items: stretch;
      }

      /* Left Distribution Charts */
      .m06-dist-body {
        padding: 10px 14px 12px;
        display: flex;
        flex-direction: column;
        gap: 14px;
      }
      .m06-dist-group {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m06-dist-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        color: #dbeafe;
        font-weight: 600;
      }
      .m06-dist-head span:last-child {
        color: #93b8de;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .m06-dist-divider {
        height: 1px;
        background: rgba(56, 189, 248, 0.18);
      }
      .m06-hbar-row {
        display: grid;
        grid-template-columns: 74px 1fr 26px;
        align-items: center;
        gap: 8px;
        padding: 4px 6px;
        margin: 0 -6px;
        border-radius: 6px;
        cursor: pointer;
        transition: background 0.16s, opacity 0.16s;
      }
      .m06-hbar-row:hover {
        background: rgba(56, 189, 248, 0.12);
      }
      .m06-hbar-row.active {
        background: rgba(20, 118, 224, 0.28);
        box-shadow: inset 0 0 0 1px rgba(56, 242, 255, 0.45);
      }
      .m06-hbar-row.dimmed {
        opacity: 0.45;
      }
      .m06-hbar-label {
        font-size: 12px;
        color: #d6e8ff;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m06-hbar-svg {
        width: 100%;
        height: 12px;
        display: block;
      }
      .m06-hbar-val {
        font-size: 12.5px;
        font-weight: 700;
        color: #f1f7ff;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* Table Panels */
      .m06-table-panel {
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .m06-table-wrap {
        padding: 0 14px 4px;
        overflow-x: auto;
        flex: 1;
      }
      .m06-table th {
        font-size: 12px;
        font-weight: 600;
        color: #93c5fd;
        background: rgba(12, 42, 92, 0.55);
        padding: 9px 10px;
        white-space: nowrap;
      }
      .m06-table td {
        padding: 9px 10px;
        font-size: 12.5px;
        color: #e6f2ff;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .m06-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m06-table tbody tr:hover {
        background: rgba(20, 74, 152, 0.25);
      }
      .m06-table tbody tr.selected {
        background: rgba(20, 108, 214, 0.30);
        box-shadow: inset 3px 0 0 #38f2ff, inset 0 1px 0 rgba(56, 220, 255, 0.35), inset 0 -1px 0 rgba(56, 220, 255, 0.35);
      }
      .m06-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        min-width: 48px;
      }
      .m06-tag.ok { background: rgba(34, 197, 94, 0.16); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.45); }
      .m06-tag.warn { background: rgba(234, 179, 8, 0.18); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.48); }
      .m06-tag.fail { background: rgba(239, 68, 68, 0.18); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.50); }
      .m06-tag.info { background: rgba(14, 165, 233, 0.20); color: #38bdf8; border: 1px solid rgba(56, 189, 248, 0.48); }
      .m06-tag.muted { background: rgba(100, 116, 139, 0.22); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.38); }

      .m06-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 4px;
        transition: color 0.16s, text-shadow 0.16s;
      }
      .m06-link-btn:hover {
        color: #ffffff;
        text-shadow: 0 0 8px rgba(56, 242, 255, 0.8);
      }

      /* Pagination */
      .m06-pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        padding: 8px 14px 10px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m06-page-btn {
        min-width: 26px;
        height: 26px;
        padding: 0 7px;
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
      .m06-page-btn:hover:not(:disabled) {
        border-color: var(--cyan);
        color: #ffffff;
      }
      .m06-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0c5fd4);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m06-page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }
      .m06-page-dots {
        padding: 0 4px;
        color: #789bc4;
      }

      /* Page 1 Right Detail Panel */
      .m06-detail-body {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
      }
      .m06-detail-top {
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .m06-hero-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m06-hero-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
      }
      .m06-hero-ico {
        width: 38px;
        height: 38px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(14, 116, 204, 0.25);
        border: 1px solid rgba(56, 189, 248, 0.42);
        color: #38f2ff;
        flex-shrink: 0;
      }
      .m06-hero-title {
        font-size: 15.5px;
        font-weight: 700;
        color: #ffffff;
      }
      .m06-hero-code {
        font-size: 12px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
      }
      .m06-kv-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m06-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 12.5px;
      }
      .m06-kv-k { color: #93b8de; }
      .m06-kv-v { color: #f1f7ff; font-weight: 600; text-align: right; font-variant-numeric: tabular-nums; }
      .m06-subbox {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(13, 44, 96, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m06-subbox-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 12.5px;
        font-weight: 700;
        color: #dbeafe;
      }
      .m06-detail-footer {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m06-cta-btn {
        width: 100%;
        height: 36px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
        font-size: 13px;
      }

      /* Page 2: 2-Column Workspace */
      .m06-archive-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.38fr) minmax(380px, 1fr);
        gap: 10px;
        flex: 1;
        align-items: stretch;
      }
      .m06-archive-right {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m06-reminder-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        padding: 10px 14px;
        border-top: 1px solid rgba(56, 189, 248, 0.18);
        background: rgba(9, 32, 72, 0.45);
      }
      .m06-reminder-controls {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px;
        font-size: 12px;
        color: #cfe4ff;
      }
      .m06-mini-select {
        height: 28px;
        padding: 2px 8px;
        font-size: 12px;
        min-width: 88px;
      }

      /* Page 2 Right Top: Archive & Docs */
      .m06-doc-body {
        padding: 10px 14px 12px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m06-doc-title-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 8px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m06-doc-title-main {
        display: flex;
        align-items: baseline;
        gap: 10px;
        flex-wrap: wrap;
      }
      .m06-doc-name { font-size: 15px; font-weight: 700; color: #ffffff; }
      .m06-doc-codes { font-size: 12px; color: #93b8de; font-variant-numeric: tabular-nums; }
      .m06-meta-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px 20px;
      }
      .m06-doc-list-title {
        font-size: 12.5px;
        font-weight: 700;
        color: #dbeafe;
        margin-top: 2px;
      }
      .m06-doc-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 7px;
        background: rgba(13, 44, 96, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        transition: border-color 0.18s, background 0.18s;
      }
      .m06-doc-item:hover {
        border-color: rgba(56, 220, 255, 0.55);
        background: rgba(18, 58, 124, 0.7);
      }
      .m06-doc-left {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        color: #e6f2ff;
        font-size: 12.5px;
      }
      .m06-doc-left svg { color: #38f2ff; flex-shrink: 0; }

      /* Page 2 Right Bottom: Patrol Records */
      .m06-patrol-panel {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .m06-patrol-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 14px 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
      }

      /* Modal Helpers */
      .m06-modal-sheet {
        padding: 14px 16px;
        border-radius: 9px;
        background: rgba(10, 34, 78, 0.72);
        border: 1px solid rgba(56, 189, 248, 0.34);
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m06-seal-stamp {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 5px 12px;
        border-radius: 6px;
        border: 2px dashed rgba(248, 113, 113, 0.75);
        color: #fca5a5;
        font-size: 11.5px;
        font-weight: 700;
        letter-spacing: 0.5px;
        transform: rotate(-3deg);
      }
      .m06-form-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 12px;
        border-radius: 7px;
        background: rgba(13, 44, 96, 0.52);
        border: 1px solid rgba(56, 189, 248, 0.22);
      }
      .m06-empty {
        padding: 36px 16px;
        text-align: center;
        color: #93b8de;
        font-size: 13px;
      }

      @media (max-width: 1400px) {
        .m06-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m06-equip-grid { grid-template-columns: 240px minmax(0, 1fr); }
        .m06-equip-grid > :last-child { grid-column: span 2; }
        .m06-archive-grid { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     SHARED HELPERS & SECTION LINKAGE
     ------------------------------------------------------------------------ */
  function syncSectionToHost(secId) {
    const target = secId || null;
    if (!lastCtx) return;
    if (lastCtx.state.activeSectionId === target) return;
    if (target) {
      const pill = document.querySelector(`#sectionFilters .section-pill[data-sec="${target}"]`)
        || document.querySelector(`.section-pill[data-sec="${target}"]`);
      if (pill) { pill.click(); return; }
    } else if (lastCtx.state.activeSectionId) {
      const activePill = document.querySelector(`#sectionFilters .section-pill[data-sec="${lastCtx.state.activeSectionId}"]`)
        || document.querySelector(`.section-pill[data-sec="${lastCtx.state.activeSectionId}"]`);
      if (activePill) { activePill.click(); return; }
    }
    lastCtx.state.activeSectionId = target;
    if (lastHost) renderPage(lastHost, lastSubPageId, lastCtx);
  }

  function renderKpiSection(title, periodLabel, cards) {
    return `
      <div class="glass-panel">
        <div class="panel-header m06-panel-header">
          <div class="panel-title-group">
            <span class="panel-accent-bar"></span>
            <span class="panel-title">${title}</span>
            <span class="m06-period-tag">(${periodLabel})</span>
          </div>
        </div>
        <div class="m06-kpi-grid">
          ${cards.map(c => `
            <div class="m06-kpi-card">
              <div class="m06-kpi-icon ${c.tone ? 'tone-' + c.tone : ''}">${c.icon}</div>
              <div class="m06-kpi-meta">
                <div class="m06-kpi-label">${c.label}</div>
                <div class="m06-kpi-val-row">
                  <span class="m06-kpi-val ${c.tone ? 'tone-' + c.tone : ''}">${c.value}</span>
                  <span class="m06-kpi-unit">${c.unit}</span>
                </div>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  function renderPagination(totalItems, currentPage, pageSize, unitLabel) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.max(1, Math.min(totalPages, currentPage));
    const btnList = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) {
        btnList.push(`<button class="m06-page-btn ${i === safePage ? 'active' : ''}" data-page="${i}">${i}</button>`);
      }
    } else {
      const shown = new Set([1, 2, 3, totalPages]);
      if (safePage > 2 && safePage < totalPages) {
        shown.add(safePage - 1);
        shown.add(safePage);
        shown.add(safePage + 1);
      }
      const sorted = Array.from(shown).filter(p => p >= 1 && p <= totalPages).sort((a, b) => a - b);
      let prev = 0;
      sorted.forEach(p => {
        if (p - prev > 1) btnList.push(`<span class="m06-page-dots">...</span>`);
        btnList.push(`<button class="m06-page-btn ${p === safePage ? 'active' : ''}" data-page="${p}">${p}</button>`);
        prev = p;
      });
    }

    return `
      <div class="m06-pagination">
        <span>共 ${totalItems} ${unitLabel}</span>
        <button class="m06-page-btn" data-page="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''}>&lt;</button>
        ${btnList.join('')}
        <button class="m06-page-btn" data-page="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''}>&gt;</button>
      </div>
    `;
  }

  function renderHorizontalBarSvg(value, maxVal, gradId, isActive) {
    const W = 120;
    const H = 12;
    const ratio = maxVal > 0 ? Math.max(0, Math.min(1, value / maxVal)) : 0;
    const fillW = value > 0 ? Math.max(5, ratio * W) : 0;
    return `
      <svg class="m06-hbar-svg" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">
        <defs>
          <linearGradient id="${gradId}" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stop-color="${isActive ? '#fde047' : '#0ea5e9'}"/>
            <stop offset="100%" stop-color="${isActive ? '#38f2ff' : '#38f2ff'}"/>
          </linearGradient>
        </defs>
        <rect x="0" y="3" width="${W}" height="6" rx="3" fill="rgba(22, 58, 114, 0.85)"/>
        ${fillW > 0 ? `<rect x="0" y="3" width="${fillW.toFixed(1)}" height="6" rx="3" fill="url(#${gradId})"/>` : ''}
      </svg>
    `;
  }

  function getEntryTag(entryStatus) {
    return entryStatus === '在场'
      ? `<span class="m06-tag info">在场</span>`
      : `<span class="m06-tag muted">已退场</span>`;
  }

  function getUseStatusTag(useStatus) {
    if (useStatus === '在用') return `<span class="m06-tag ok">在用</span>`;
    if (useStatus === '待用') return `<span class="m06-tag info">待用</span>`;
    if (useStatus === '停用') return `<span class="m06-tag warn">停用</span>`;
    return `<span style="color:#93b8de;">—</span>`;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 1: 机械设备 (equipment)
     ------------------------------------------------------------------------ */
  function filterEquipmentList(secId, opts) {
    const st = uiState.equipment;
    const kw = (st.keyword || '').trim().toLowerCase();
    const skipType = opts && opts.skipType;
    const skipSec = opts && opts.skipSec;

    return equipmentData.filter(item => {
      if (!skipSec && secId && item.secId !== secId) return false;
      if (!skipType && st.equipType && item.type !== st.equipType) return false;
      if (st.entryStatus && item.entryStatus !== st.entryStatus) return false;
      if (st.useStatus && item.useStatus !== st.useStatus) return false;
      if (kw) {
        const hay = `${item.code} ${item.name} ${item.unit} ${item.type} ${item.section}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  function renderEquipmentPage(ctx) {
    const st = uiState.equipment;
    const secId = ctx.state.activeSectionId;

    const filtered = filterEquipmentList(secId);
    const totalCount = filtered.length;
    const onSiteCount = filtered.filter(x => x.entryStatus === '在场').length;
    const inUseCount = filtered.filter(x => x.useStatus === '在用').length;
    const standbyCount = filtered.filter(x => x.useStatus === '待用').length;
    const stoppedCount = filtered.filter(x => x.useStatus === '停用').length;
    const exitedCount = filtered.filter(x => x.entryStatus === '已退场').length;

    // Distribution charts data (reconciled dynamically)
    const typeScope = filterEquipmentList(secId, { skipType: true });
    const typeCounts = EQUIP_TYPES.map(t => ({
      name: t.name,
      count: typeScope.filter(x => x.type === t.name).length
    }));
    const maxTypeCount = Math.max(1, ...typeCounts.map(t => t.count));

    const secOnSiteScope = filterEquipmentList(secId, { skipSec: true }).filter(x => x.entryStatus === '在场');
    const secCounts = SECTIONS.map(s => ({
      id: s.id,
      name: s.name,
      count: secOnSiteScope.filter(x => x.secId === s.id).length
    }));
    const maxSecCount = Math.max(1, ...secCounts.map(s => s.count));

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filtered.length / st.pageSize));
    if (st.page > totalPages) st.page = totalPages;
    const startIdx = (st.page - 1) * st.pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + st.pageSize);

    // Selected item
    let selected = filtered.find(x => x.code === st.selectedCode);
    if (!selected) {
      selected = pageRows[0] || filtered[0] || equipmentData[0];
      if (selected) st.selectedCode = selected.code;
    }

    const certMeta = selected && selected.isKey ? getCertMeta(selected) : null;

    return `
      <div class="m06-page">
        <div class="glass-panel m06-filter-bar">
          <div class="m06-filter-fields">
            <div class="m06-field">
              <span class="m06-field-label">所属工区</span>
              <select class="glass-select m06-select" data-filter="section">
                <option value="" ${!secId ? 'selected' : ''}>全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${secId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">设备类型</span>
              <select class="glass-select m06-select" data-filter="equipType">
                <option value="" ${!st.equipType ? 'selected' : ''}>全部类型</option>
                ${EQUIP_TYPES.map(t => `<option value="${t.name}" ${st.equipType === t.name ? 'selected' : ''}>${t.name}</option>`).join('')}
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">进退场</span>
              <select class="glass-select m06-select" data-filter="entryStatus">
                <option value="" ${!st.entryStatus ? 'selected' : ''}>全部状态</option>
                <option value="在场" ${st.entryStatus === '在场' ? 'selected' : ''}>在场</option>
                <option value="已退场" ${st.entryStatus === '已退场' ? 'selected' : ''}>已退场</option>
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">使用状态</span>
              <select class="glass-select m06-select" data-filter="useStatus">
                <option value="" ${!st.useStatus ? 'selected' : ''}>全部状态</option>
                <option value="在用" ${st.useStatus === '在用' ? 'selected' : ''}>在用</option>
                <option value="待用" ${st.useStatus === '待用' ? 'selected' : ''}>待用</option>
                <option value="停用" ${st.useStatus === '停用' ? 'selected' : ''}>停用</option>
                <option value="—" ${st.useStatus === '—' ? 'selected' : ''}>已退场（—）</option>
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">设备检索</span>
              <div class="m06-search-wrap">
                <span class="m06-search-ico">${ICONS.search}</span>
                <input type="text" class="m06-input" data-filter-input="keyword" value="${escapeAttr(st.keyword)}" placeholder="编号、名称或所属单位" />
              </div>
            </div>
          </div>
          <div class="m06-filter-actions">
            <button class="m06-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m06-btn-reset" data-action="reset">${ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        ${renderKpiSection('设备台账概况', `截至 ${BASE_DATE}`, [
          { label: '登记设备', value: totalCount, unit: '台', icon: ICONS.chartBox, tone: '' },
          { label: '在场设备', value: onSiteCount, unit: '台', icon: ICONS.pin, tone: '' },
          { label: '在用设备', value: inUseCount, unit: '台', icon: ICONS.gear, tone: 'green' },
          { label: '待用设备', value: standbyCount, unit: '台', icon: ICONS.clock, tone: '' },
          { label: '停用设备', value: stoppedCount, unit: '台', icon: ICONS.pauseCircle, tone: 'gold' },
          { label: '已退场设备', value: exitedCount, unit: '台', icon: ICONS.truckExit, tone: 'blue' }
        ])}

        <div class="m06-equip-grid">
          <div class="glass-panel">
            <div class="panel-header m06-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">设备分布</span>
              </div>
            </div>
            <div class="m06-dist-body">
              <div class="m06-dist-group">
                <div class="m06-dist-head">
                  <span>按设备类型</span>
                  <span>${typeScope.length} 台</span>
                </div>
                ${typeCounts.map((t, i) => {
                  const active = st.equipType === t.name;
                  const dimmed = st.equipType && !active;
                  return `
                    <div class="m06-hbar-row ${active ? 'active' : ''} ${dimmed ? 'dimmed' : ''}" data-pick-type="${t.name}" title="点击按「${t.name}」筛选">
                      <span class="m06-hbar-label">${t.name}</span>
                      ${renderHorizontalBarSvg(t.count, maxTypeCount, `m06-tg-${i}`, active)}
                      <span class="m06-hbar-val">${t.count}</span>
                    </div>
                  `;
                }).join('')}
              </div>

              <div class="m06-dist-divider"></div>

              <div class="m06-dist-group">
                <div class="m06-dist-head">
                  <span>按工区查看在场设备</span>
                  <span>${secOnSiteScope.length} 台</span>
                </div>
                ${secCounts.map((s, i) => {
                  const active = secId === s.id;
                  const dimmed = secId && !active;
                  return `
                    <div class="m06-hbar-row ${active ? 'active' : ''} ${dimmed ? 'dimmed' : ''}" data-pick-sec="${s.id}" title="点击联动筛选${s.name}">
                      <span class="m06-hbar-label">${s.name}</span>
                      ${renderHorizontalBarSvg(s.count, maxSecCount, `m06-sg-${i}`, active)}
                      <span class="m06-hbar-val">${s.count}</span>
                    </div>
                  `;
                }).join('')}
              </div>
            </div>
          </div>

          <div class="glass-panel m06-table-panel">
            <div>
              <div class="panel-header m06-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">设备台账</span>
                </div>
                <span class="m06-header-meta">更新于 ${BASE_DATE} 09:30</span>
              </div>
              <div class="m06-table-wrap">
                ${pageRows.length ? `
                  <table class="data-table m06-table">
                    <thead>
                      <tr>
                        <th>设备编号</th>
                        <th>设备名称</th>
                        <th>设备类型</th>
                        <th>所属单位</th>
                        <th>工区</th>
                        <th>进退场</th>
                        <th>使用状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pageRows.map(r => `
                        <tr class="${selected && selected.code === r.code ? 'selected' : ''}" data-select-code="${r.code}">
                          <td>${r.code}</td>
                          <td style="font-weight:600;color:#ffffff;">${r.name}</td>
                          <td>${r.type}</td>
                          <td>${r.unit}</td>
                          <td>${r.section}</td>
                          <td>${getEntryTag(r.entryStatus)}</td>
                          <td>${getUseStatusTag(r.useStatus)}</td>
                          <td>
                            <button class="m06-link-btn" data-open-equip="${r.code}">${r.isKey ? '查看档案' : '查看'}</button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                ` : `<div class="m06-empty">当前筛选条件下暂无匹配设备记录，请调整筛选条件或点击“重置”。</div>`}
              </div>
            </div>
            ${renderPagination(filtered.length, st.page, st.pageSize, '台设备')}
          </div>

          <div class="glass-panel m06-table-panel">
            <div class="panel-header m06-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">设备详情</span>
              </div>
            </div>
            ${selected ? `
              <div class="m06-detail-body">
                <div class="m06-detail-top">
                  <div class="m06-hero-card">
                    <div class="m06-hero-left">
                      <div class="m06-hero-ico">${ICONS.crane}</div>
                      <div>
                        <div class="m06-hero-title">${selected.name}</div>
                        <div class="m06-hero-code">${selected.code}</div>
                      </div>
                    </div>
                    ${selected.entryStatus === '在场' ? getUseStatusTag(selected.useStatus) : getEntryTag(selected.entryStatus)}
                  </div>

                  <div class="m06-kv-list">
                    <div class="m06-kv-row"><span class="m06-kv-k">设备类型</span><span class="m06-kv-v">${selected.type}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">所属单位</span><span class="m06-kv-v">${selected.unit}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">所属工区</span><span class="m06-kv-v">${selected.section}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">设备位置</span><span class="m06-kv-v">${selected.location}</span></div>
                  </div>

                  <div class="m06-subbox">
                    <div class="m06-subbox-head">
                      <span>进退场记录</span>
                      ${getEntryTag(selected.entryStatus)}
                    </div>
                    <div class="m06-kv-row"><span class="m06-kv-k">进场日期</span><span class="m06-kv-v">${selected.entryDate}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">退场日期</span><span class="m06-kv-v">${selected.exitDate}</span></div>
                  </div>

                  ${selected.isKey ? `
                    <div class="m06-subbox">
                      <div class="m06-subbox-head"><span>关联重点档案</span></div>
                      <div class="m06-kv-row"><span class="m06-kv-k">档案编号</span><span class="m06-kv-v">${selected.archiveId}</span></div>
                      <div class="m06-kv-row"><span class="m06-kv-k">证书状态</span><span class="m06-tag ${certMeta.tagCls}">${certMeta.status}</span></div>
                    </div>
                  ` : `
                    <div class="m06-subbox">
                      <div class="m06-subbox-head"><span>设备技术规格</span></div>
                      <div class="m06-kv-row"><span class="m06-kv-k">型号规格</span><span class="m06-kv-v">${selected.model}</span></div>
                      <div class="m06-kv-row"><span class="m06-kv-k">重点机械标识</span><span class="m06-kv-v" style="color:#93b8de;">一般施工设备</span></div>
                    </div>
                  `}
                </div>

                <div class="m06-detail-footer">
                  <div class="m06-kv-row">
                    <span class="m06-kv-k">台账更新</span>
                    <span class="m06-kv-v" style="color:#93b8de;font-weight:500;">${BASE_DATE} 09:30</span>
                  </div>
                  ${selected.isKey ? `
                    <button class="btn-primary-glow m06-cta-btn" data-jump-archive="${selected.code}">
                      ${ICONS.archive}<span>查看重点机械档案</span>
                    </button>
                  ` : `
                    <button class="btn-primary-glow m06-cta-btn" data-open-equip="${selected.code}">
                      ${ICONS.doc}<span>查看设备台账详情</span>
                    </button>
                  `}
                </div>
              </div>
            ` : `<div class="m06-empty">暂无设备详情</div>`}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     SUBPAGE 2: 重点机械档案 (keyArchive)
     ------------------------------------------------------------------------ */
  function getAllKeyMachinesSorted() {
    return equipmentData
      .filter(x => x.isKey)
      .slice()
      .sort((a, b) => (a.keyOrder || 999) - (b.keyOrder || 999));
  }

  function filterKeyMachines(secId) {
    const st = uiState.keyArchive;
    const kw = (st.keyword || '').trim().toLowerCase();
    return getAllKeyMachinesSorted().filter(item => {
      if (secId && item.secId !== secId) return false;
      if (st.equipType && item.type !== st.equipType) return false;
      if (st.certStatus) {
        const cm = getCertMeta(item);
        if (cm.status !== st.certStatus) return false;
      }
      if (kw) {
        const hay = `${item.archiveId} ${item.code} ${item.name} ${item.unit} ${item.section}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  function renderKeyArchivePage(ctx) {
    const st = uiState.keyArchive;
    const secId = ctx.state.activeSectionId;

    const filtered = filterKeyMachines(secId);
    let validCount = 0;
    let soonCount = 0;
    let expiredCount = 0;
    let missingCount = 0;
    let patrolTotal = 0;

    filtered.forEach(r => {
      const cm = getCertMeta(r);
      if (cm.status === '正常有效') validCount++;
      else if (cm.status === '即将到期') soonCount++;
      else if (cm.status === '已到期') expiredCount++;
      else missingCount++;
      patrolTotal += (r.patrolLogs ? r.patrolLogs.length : 0);
    });

    const totalPages = Math.max(1, Math.ceil(filtered.length / st.pageSize));
    if (st.page > totalPages) st.page = totalPages;
    const startIdx = (st.page - 1) * st.pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + st.pageSize);

    let selected = filtered.find(x => x.code === st.selectedCode);
    if (!selected) {
      selected = pageRows[0] || filtered[0] || getAllKeyMachinesSorted()[0];
      if (selected) st.selectedCode = selected.code;
    }

    const selCert = selected ? getCertMeta(selected) : null;
    const patrolLogs = selected && selected.patrolLogs ? selected.patrolLogs : [];

    return `
      <div class="m06-page">
        <div class="glass-panel m06-filter-bar">
          <div class="m06-filter-fields">
            <div class="m06-field">
              <span class="m06-field-label">所属工区</span>
              <select class="glass-select m06-select" data-filter="section">
                <option value="" ${!secId ? 'selected' : ''}>全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.id}" ${secId === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">设备类型</span>
              <select class="glass-select m06-select" data-filter="equipType">
                <option value="" ${!st.equipType ? 'selected' : ''}>全部类型</option>
                <option value="起重设备" ${st.equipType === '起重设备' ? 'selected' : ''}>起重设备</option>
                <option value="架桥机" ${st.equipType === '架桥机' ? 'selected' : ''}>架桥机</option>
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">证书状态</span>
              <select class="glass-select m06-select" data-filter="certStatus">
                <option value="" ${!st.certStatus ? 'selected' : ''}>全部状态</option>
                <option value="正常有效" ${st.certStatus === '正常有效' ? 'selected' : ''}>正常有效</option>
                <option value="即将到期" ${st.certStatus === '即将到期' ? 'selected' : ''}>即将到期</option>
                <option value="已到期" ${st.certStatus === '已到期' ? 'selected' : ''}>已到期</option>
                <option value="待补资料" ${st.certStatus === '待补资料' ? 'selected' : ''}>待补资料</option>
              </select>
            </div>
            <div class="m06-field">
              <span class="m06-field-label">档案检索</span>
              <div class="m06-search-wrap">
                <span class="m06-search-ico">${ICONS.search}</span>
                <input type="text" class="m06-input" data-filter-input="keyword" value="${escapeAttr(st.keyword)}" placeholder="设备编号或档案编号" />
              </div>
            </div>
          </div>
          <div class="m06-filter-actions">
            <button class="m06-btn-query" data-action="query">${ICONS.search}<span>查询</span></button>
            <button class="dock-btn m06-btn-reset" data-action="reset">${ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        ${renderKpiSection('重点机械与检验概况', `截至 ${BASE_DATE}`, [
          { label: '重点机械', value: filtered.length, unit: '台', icon: ICONS.archive, tone: '' },
          { label: '正常有效', value: validCount, unit: '台', icon: ICONS.shieldCheck, tone: 'green' },
          { label: '即将到期', value: soonCount, unit: '台', icon: ICONS.clock, tone: 'gold' },
          { label: '已到期', value: expiredCount, unit: '台', icon: ICONS.warnTri, tone: 'red' },
          { label: '待补资料', value: missingCount, unit: '台', icon: ICONS.doc, tone: '' },
          { label: '本期关联巡查', value: patrolTotal, unit: '条', icon: ICONS.clipboard, tone: '' }
        ])}

        <div class="m06-archive-grid">
          <div class="glass-panel m06-table-panel">
            <div>
              <div class="panel-header m06-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">重点机械档案台账</span>
                </div>
                <span class="m06-header-meta">一机一档</span>
              </div>
              <div class="m06-table-wrap">
                ${pageRows.length ? `
                  <table class="data-table m06-table">
                    <thead>
                      <tr>
                        <th>档案编号</th>
                        <th>设备编号</th>
                        <th>设备名称</th>
                        <th>所属工区</th>
                        <th>检验有效期至</th>
                        <th>证书状态</th>
                        <th>使用状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${pageRows.map(r => {
                        const cm = getCertMeta(r);
                        return `
                          <tr class="${selected && selected.code === r.code ? 'selected' : ''}" data-select-code="${r.code}">
                            <td>${r.archiveId}</td>
                            <td>${r.code}</td>
                            <td style="font-weight:600;color:#ffffff;">${r.name}</td>
                            <td>${r.section}</td>
                            <td>${cm.displayDate}</td>
                            <td><span class="m06-tag ${cm.tagCls}">${cm.status}</span></td>
                            <td>${getUseStatusTag(r.useStatus)}</td>
                            <td>
                              <button class="m06-link-btn" data-open-archive="${r.code}">查看</button>
                            </td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                ` : `<div class="m06-empty">当前筛选条件下暂无匹配重点机械档案，请调整筛选条件。</div>`}
              </div>
            </div>
            <div>
              ${renderPagination(filtered.length, st.page, st.pageSize, '台设备')}
              <div class="m06-reminder-bar">
                <span style="font-size:12.5px;font-weight:700;color:#dbeafe;">到期提醒</span>
                <div class="m06-reminder-controls">
                  <span>日期字段</span>
                  <select class="glass-select m06-mini-select" data-reminder-field="dateField">
                    <option value="validUntil" ${st.dateField === 'validUntil' ? 'selected' : ''}>检验有效期至</option>
                    <option value="installValidUntil" ${st.dateField === 'installValidUntil' ? 'selected' : ''}>安装告知有效期</option>
                  </select>
                  <span>提前</span>
                  <select class="glass-select m06-mini-select" data-reminder-field="remindDays">
                    <option value="15" ${Number(st.remindDays) === 15 ? 'selected' : ''}>15 天</option>
                    <option value="30" ${Number(st.remindDays) === 30 ? 'selected' : ''}>30 天</option>
                    <option value="45" ${Number(st.remindDays) === 45 ? 'selected' : ''}>45 天</option>
                    <option value="60" ${Number(st.remindDays) === 60 ? 'selected' : ''}>60 天</option>
                  </select>
                </div>
                <button class="m06-link-btn" data-action="configReminder">配置提醒 &gt;</button>
              </div>
            </div>
          </div>

          <div class="m06-archive-right">
            <div class="glass-panel">
              <div class="panel-header m06-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">设备档案与检验资料</span>
                </div>
              </div>
              ${selected ? `
                <div class="m06-doc-body">
                  <div class="m06-doc-title-row">
                    <div class="m06-doc-title-main">
                      <span class="m06-doc-name">${selected.name}</span>
                      <span class="m06-doc-codes">${selected.code} &nbsp; ${selected.archiveId}</span>
                    </div>
                    <span class="m06-tag ${selCert.tagCls}">${selCert.status}</span>
                  </div>

                  <div class="m06-meta-grid">
                    <div class="m06-kv-row"><span class="m06-kv-k">所属单位</span><span class="m06-kv-v">${selected.unit}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">使用状态</span><span>${getUseStatusTag(selected.useStatus)}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">检验编号</span><span class="m06-kv-v">${selected.inspectNo}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">检验日期</span><span class="m06-kv-v">${selected.inspectDate}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">有效期至</span><span class="m06-kv-v">${selCert.displayDate}</span></div>
                    <div class="m06-kv-row"><span class="m06-kv-k">到期提醒</span><span class="m06-kv-v" style="color:${selCert.remindColor};">${selCert.remindText}</span></div>
                  </div>

                  <div class="m06-doc-list-title">检验及登记资料</div>
                  <div class="m06-doc-item">
                    <span class="m06-doc-left">
                      ${ICONS.pdf}
                      <span>${selected.missingDocs ? '定期检验报告.pdf（待补充盖章扫描件）' : '定期检验报告.pdf'}</span>
                    </span>
                    <button class="m06-link-btn" data-preview-doc="inspect" data-code="${selected.code}">${selected.missingDocs ? '补录/预览 &gt;' : '预览 &gt;'}</button>
                  </div>
                  <div class="m06-doc-item">
                    <span class="m06-doc-left">
                      ${ICONS.pdf}
                      <span>设备使用登记资料.pdf</span>
                    </span>
                    <button class="m06-link-btn" data-preview-doc="register" data-code="${selected.code}">预览 &gt;</button>
                  </div>
                </div>
              ` : `<div class="m06-empty">请选择重点机械档案查看资料</div>`}
            </div>

            <div class="glass-panel m06-patrol-panel">
              <div class="panel-header m06-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">关联巡查记录</span>
                </div>
                <span class="m06-header-meta">本机记录</span>
              </div>
              <div class="m06-table-wrap">
                ${patrolLogs.length ? `
                  <table class="data-table m06-table">
                    <thead>
                      <tr>
                        <th>巡查编号</th>
                        <th>巡查时间</th>
                        <th>巡查内容</th>
                        <th>处理状态</th>
                        <th>操作</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${patrolLogs.map(log => {
                        const cls = log.status === '记录正常' ? 'ok' : (log.status === '已处理' ? 'info' : 'ok');
                        return `
                          <tr>
                            <td>${log.id}</td>
                            <td>${log.time}</td>
                            <td style="color:#ffffff;">${log.content}</td>
                            <td><span class="m06-tag ${cls}">${log.status}</span></td>
                            <td><button class="m06-link-btn" data-open-patrol="${log.id}" data-code="${selected.code}">查看记录</button></td>
                          </tr>
                        `;
                      }).join('')}
                    </tbody>
                  </table>
                ` : `<div class="m06-empty">暂无关联巡查记录</div>`}
              </div>
              <div class="m06-patrol-footer">
                <span>设备编号 &nbsp; ${selected ? selected.code : '—'}</span>
                <span>共 ${patrolLogs.length} 条关联记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS (Equipment Detail, Key Archive Detail, PDF Preview, Patrol, Reminder)
     ------------------------------------------------------------------------ */
  function openEquipmentModal(code) {
    if (!lastCtx) return;
    const rec = equipmentData.find(x => x.code === code);
    if (!rec) return;
    const cm = rec.isKey ? getCertMeta(rec) : null;

    lastCtx.openModal(`机械设备台账详情 · ${rec.code}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>设备名称 / 型号</span><strong>${rec.name} · ${rec.model}</strong></div>
        <div class="detail-stat-card"><span>所属工区 / 进退场</span><strong>${rec.section} · ${rec.entryStatus}</strong></div>
        <div class="detail-stat-card"><span>当前使用状态</span><strong style="color:${rec.useStatus === '在用' ? '#4ade80' : (rec.useStatus === '停用' ? '#facc15' : '#38bdf8')};">${rec.useStatus}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">设备类型</th><td>${rec.type}</td><th style="width:120px;">所属单位</th><td>${rec.unit}</td></tr>
          <tr><th>技术规格</th><td>${rec.spec}</td><th>生产厂家</th><td>${rec.manufacturer}</td></tr>
          <tr><th>作业位置</th><td>${rec.location}</td><th>操作手 / 责任人</th><td>${rec.operator}</td></tr>
          <tr><th>进场日期</th><td>${rec.entryDate}</td><th>退场日期</th><td>${rec.exitDate}</td></tr>
          ${rec.isKey ? `
            <tr><th>重点档案编号</th><td>${rec.archiveId}</td><th>检验状态</th><td><span class="m06-tag ${cm.tagCls}">${cm.status}（${cm.remindText}）</span></td></tr>
          ` : ''}
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        ${rec.isKey ? `<button class="btn-primary-glow" id="m06ModalGoArchive">进入重点机械一机一档 &gt;</button>` : ''}
        <button class="dock-btn" id="m06ModalClose">关闭</button>
      </div>
    `);

    const goBtn = document.getElementById('m06ModalGoArchive');
    if (goBtn) {
      goBtn.onclick = () => {
        uiState.keyArchive.selectedCode = rec.code;
        lastCtx.closeModal();
        lastCtx.switchModule('machine', 'keyArchive');
      };
    }
    const closeBtn = document.getElementById('m06ModalClose');
    if (closeBtn) closeBtn.onclick = () => lastCtx.closeModal();
  }

  function openArchiveModal(code) {
    if (!lastCtx) return;
    const rec = equipmentData.find(x => x.code === code && x.isKey);
    if (!rec) return;
    const cm = getCertMeta(rec);

    lastCtx.openModal(`重点机械一机一档 · ${rec.archiveId}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>设备编号 / 名称</span><strong>${rec.code} · ${rec.name}</strong></div>
        <div class="detail-stat-card"><span>检验有效期至</span><strong>${cm.displayDate}</strong></div>
        <div class="detail-stat-card"><span>证书状态</span><strong style="color:${cm.remindColor};">${cm.status}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">所属工区</th><td>${rec.section}（${rec.unit}）</td><th style="width:120px;">型号规格</th><td>${rec.model} · ${rec.spec}</td></tr>
          <tr><th>检验报告编号</th><td>${rec.inspectNo}</td><th>检验日期</th><td>${rec.inspectDate}</td></tr>
          <tr><th>安装告知有效期</th><td>${rec.installValidUntil}</td><th>到期提醒</th><td style="color:${cm.remindColor};font-weight:700;">${cm.remindText}</td></tr>
          <tr><th>作业部位</th><td>${rec.location}</td><th>特种作业人员</th><td>${rec.operator}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="dock-btn" id="m06ModPrevInspect">预览定期检验报告</button>
        <button class="btn-primary-glow" id="m06ModPrevReg">预览使用登记资料</button>
      </div>
    `);

    const b1 = document.getElementById('m06ModPrevInspect');
    const b2 = document.getElementById('m06ModPrevReg');
    if (b1) b1.onclick = () => openDocPreviewModal(rec.code, 'inspect');
    if (b2) b2.onclick = () => openDocPreviewModal(rec.code, 'register');
  }

  function openDocPreviewModal(code, docKind) {
    if (!lastCtx) return;
    const rec = equipmentData.find(x => x.code === code && x.isKey);
    if (!rec) return;
    const cm = getCertMeta(rec);
    const isInspect = docKind === 'inspect';
    const title = isInspect
      ? `PDF 预览 · ${rec.code} 定期检验报告.pdf`
      : `PDF 预览 · ${rec.code} 设备使用登记资料.pdf`;

    const bodyHtml = isInspect ? `
      <div class="m06-modal-sheet">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#ffffff;">黑龙江省特种设备监督检验研究院 · 定期检验报告（电子归档件）</div>
            <div style="font-size:12px;color:#93c5fd;margin-top:3px;">报告编号：${rec.inspectNo} &nbsp;|&nbsp; 档案号：${rec.archiveId}</div>
          </div>
          <span class="m06-seal-stamp">${rec.missingDocs ? '待补录盖章件' : '特检机构检验专用章'}</span>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">使用单位</th><td>${rec.unit}</td><th style="width:120px;">设备名称</th><td>${rec.name}（${rec.model}）</td></tr>
            <tr><th>设备代码</th><td>${rec.code}</td><th>制造单位</th><td>${rec.manufacturer}</td></tr>
            <tr><th>检验日期</th><td>${rec.inspectDate}</td><th>下次检验日期</th><td style="color:${cm.remindColor};font-weight:700;">${rec.validUntil}</td></tr>
            <tr><th>主要检验项目</th><td colspan="3">金属结构焊缝无损检测（合格）、起升/变幅机构及制动器（合格）、力矩限制器与高度限位（合格）、1.25倍静载及1.1倍动载试验（合格）</td></tr>
            <tr><th>检验结论</th><td colspan="3"><span class="m06-tag ${cm.tagCls}">${rec.missingDocs ? '资料待补齐后复核' : '检验合格（状态：' + cm.status + '）'}</span></td></tr>
          </tbody>
        </table>
      </div>
      ${rec.missingDocs ? `
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;">
          <span style="font-size:12px;color:#facc15;">该设备缺少盖章版定期检验报告，可模拟补录扫描件并更新有效期。</span>
          <button class="btn-primary-glow" id="m06MockUploadBtn">模拟补录检验报告（有效期至 2027-06-30）</button>
        </div>
      ` : `
        <div style="display:flex;justify-content:flex-end;gap:10px;">
          <button class="dock-btn" id="m06DocDownloadBtn">下载电子档 PDF</button>
          <button class="btn-primary-glow" id="m06DocCloseBtn">完成查阅</button>
        </div>
      `}
    ` : `
      <div class="m06-modal-sheet">
        <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:12px;">
          <div>
            <div style="font-size:15px;font-weight:800;color:#ffffff;">特种设备使用登记表与安装告知备案资料</div>
            <div style="font-size:12px;color:#93c5fd;margin-top:3px;">登记证编号：车10黑M-${rec.code.replace(/-/g, '')} &nbsp;|&nbsp; 档案号：${rec.archiveId}</div>
          </div>
          <span class="m06-seal-stamp">设备备案登记有效</span>
        </div>
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">工程项目</th><td>G1211吉黑高速明水至北安段</td><th style="width:120px;">责任工区</th><td>${rec.section}（${rec.unit}）</td></tr>
            <tr><th>安装位置</th><td>${rec.location}</td><th>安装告知有效期</th><td>${rec.installValidUntil}</td></tr>
            <tr><th>操作人员</th><td colspan="3">${rec.operator}（持证在岗，年度安全教育考核合格）</td></tr>
            <tr><th>资料清单</th><td colspan="3">1. 特种设备使用登记证；2. 安装告知受理回执；3. 联合验收合格表；4. 操作人员特种作业资格证复印件。</td></tr>
          </tbody>
        </table>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="dock-btn" id="m06DocDownloadBtn">下载电子档 PDF</button>
        <button class="btn-primary-glow" id="m06DocCloseBtn">完成查阅</button>
      </div>
    `;

    lastCtx.openModal(title, bodyHtml);

    const upBtn = document.getElementById('m06MockUploadBtn');
    if (upBtn) {
      upBtn.onclick = () => {
        rec.missingDocs = false;
        rec.inspectNo = `JY-2026-${String(880 + (rec.keyOrder || 1)).padStart(4, '0')}`;
        rec.inspectDate = '2026-11-26';
        rec.validUntil = '2027-06-30';
        rec.installValidUntil = '2027-08-30';
        rec.useStatus = '待用';
        lastCtx.closeModal();
        lastCtx.showToast(`已补录 ${rec.code} 定期检验报告，证书状态已更新为「正常有效」`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }
    const dlBtn = document.getElementById('m06DocDownloadBtn');
    if (dlBtn) {
      dlBtn.onclick = () => lastCtx.showToast(`已导出 ${rec.code}_${isInspect ? '定期检验报告' : '使用登记资料'}.pdf`);
    }
    const clsBtn = document.getElementById('m06DocCloseBtn');
    if (clsBtn) clsBtn.onclick = () => lastCtx.closeModal();
  }

  function openPatrolModal(code, patrolId) {
    if (!lastCtx) return;
    const rec = equipmentData.find(x => x.code === code);
    if (!rec) return;
    const log = (rec.patrolLogs || []).find(l => l.id === patrolId);
    if (!log) return;

    lastCtx.openModal(`关联巡查记录详情 · ${log.id}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>关联机械</span><strong>${rec.name} (${rec.code})</strong></div>
        <div class="detail-stat-card"><span>巡查时间 / 人员</span><strong>${log.time} · ${log.inspector}</strong></div>
        <div class="detail-stat-card"><span>处理状态</span><strong style="color:#4ade80;">${log.status}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">巡查内容</th><td>${log.content}</td><th style="width:120px;">所属工区</th><td>${rec.section} · ${rec.location}</td></tr>
          <tr><th>现场检查纪要</th><td colspan="3" style="line-height:1.65;">${log.detail}</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="btn-primary-glow" id="m06PatrolClose">确认并关闭</button>
      </div>
    `);
    const btn = document.getElementById('m06PatrolClose');
    if (btn) btn.onclick = () => lastCtx.closeModal();
  }

  function openReminderConfigModal() {
    if (!lastCtx) return;
    const st = uiState.keyArchive;
    const keyAll = getAllKeyMachinesSorted();

    lastCtx.openModal('重点机械到期提醒规则配置', `
      <div class="m06-form-row">
        <div>
          <div style="font-weight:700;color:#ffffff;">预警触发日期字段</div>
          <div style="font-size:11.5px;color:#93b8de;">选择用于计算证书倒计时的基准期限字段</div>
        </div>
        <select class="glass-select m06-select" id="m06CfgField">
          <option value="validUntil" ${st.dateField === 'validUntil' ? 'selected' : ''}>检验有效期至</option>
          <option value="installValidUntil" ${st.dateField === 'installValidUntil' ? 'selected' : ''}>安装告知有效期</option>
        </select>
      </div>
      <div class="m06-form-row">
        <div>
          <div style="font-weight:700;color:#ffffff;">提前提醒阈值（天）</div>
          <div style="font-size:11.5px;color:#93b8de;">剩余有效期小于等于该天数时标为“即将到期”</div>
        </div>
        <select class="glass-select m06-select" id="m06CfgDays">
          <option value="15" ${Number(st.remindDays) === 15 ? 'selected' : ''}>提前 15 天</option>
          <option value="30" ${Number(st.remindDays) === 30 ? 'selected' : ''}>提前 30 天</option>
          <option value="45" ${Number(st.remindDays) === 45 ? 'selected' : ''}>提前 45 天</option>
          <option value="60" ${Number(st.remindDays) === 60 ? 'selected' : ''}>提前 60 天</option>
        </select>
      </div>
      <div class="m06-form-row">
        <div>
          <div style="font-weight:700;color:#ffffff;">平台工作台站内消息推送</div>
          <div style="font-size:11.5px;color:#93b8de;">向对应工区设备管理员与专职安全员发送预警</div>
        </div>
        <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" id="m06CfgSys" ${st.notifySystem ? 'checked' : ''} /> 启用
        </label>
      </div>
      <div class="m06-form-row">
        <div>
          <div style="font-weight:700;color:#ffffff;">超期自动标记停用管控</div>
          <div style="font-size:11.5px;color:#93b8de;">证书超期且未续检的重点机械禁止派工签发</div>
        </div>
        <label style="display:inline-flex;align-items:center;gap:6px;cursor:pointer;">
          <input type="checkbox" id="m06CfgBlock" ${st.autoBlockExpired ? 'checked' : ''} /> 启用
        </label>
      </div>
      <div style="font-size:12px;color:#93c5fd;">当前全线共纳入 ${keyAll.length} 台重点机械监控（点击保存后将按新阈值实时刷新统计）。</div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="dock-btn" id="m06CfgCancel">取消</button>
        <button class="btn-primary-glow" id="m06CfgSave">保存配置并生效</button>
      </div>
    `);

    const cancelBtn = document.getElementById('m06CfgCancel');
    const saveBtn = document.getElementById('m06CfgSave');
    if (cancelBtn) cancelBtn.onclick = () => lastCtx.closeModal();
    if (saveBtn) {
      saveBtn.onclick = () => {
        const fEl = document.getElementById('m06CfgField');
        const dEl = document.getElementById('m06CfgDays');
        const sEl = document.getElementById('m06CfgSys');
        const bEl = document.getElementById('m06CfgBlock');
        if (fEl) st.dateField = fEl.value;
        if (dEl) st.remindDays = Number(dEl.value) || 30;
        if (sEl) st.notifySystem = !!sEl.checked;
        if (bEl) st.autoBlockExpired = !!bEl.checked;
        st.page = 1;
        lastCtx.closeModal();
        lastCtx.showToast(`已保存到期提醒配置（提前 ${st.remindDays} 天），台账与预警已刷新`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }
  }

  function escapeAttr(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  /* ------------------------------------------------------------------------
     RENDER DISPATCH & EVENT BINDING
     ------------------------------------------------------------------------ */
  function renderPage(hostEl, subPageId, ctx) {
    ensureStyles();
    lastCtx = ctx;
    lastHost = hostEl;
    lastSubPageId = subPageId === 'keyArchive' ? 'keyArchive' : 'equipment';

    if (lastRenderedSecId !== ctx.state.activeSectionId) {
      lastRenderedSecId = ctx.state.activeSectionId;
      uiState.equipment.page = 1;
      uiState.keyArchive.page = 1;
    }

    hostEl.innerHTML = lastSubPageId === 'keyArchive'
      ? renderKeyArchivePage(ctx)
      : renderEquipmentPage(ctx);

    bindStageEvents(hostEl, lastSubPageId, ctx);
  }

  function bindStageEvents(hostEl, subPageId, ctx) {
    const st = uiState[subPageId] || uiState.equipment;

    // Filter dropdowns
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

    // Search input (Enter key & live input value sync)
    hostEl.querySelectorAll('[data-filter-input]').forEach(inp => {
      inp.addEventListener('input', e => {
        st[e.target.dataset.filterInput] = e.target.value;
      });
      inp.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          st.page = 1;
          renderPage(hostEl, subPageId, ctx);
        }
      });
    });

    // Query / Reset / Config Reminder buttons
    hostEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'query') {
          st.page = 1;
          renderPage(hostEl, subPageId, ctx);
          ctx.showToast('已按当前筛选条件刷新机械管理台账');
        } else if (act === 'reset') {
          if (subPageId === 'equipment') {
            st.equipType = '';
            st.entryStatus = '';
            st.useStatus = '';
            st.keyword = '';
            st.page = 1;
          } else {
            st.equipType = '';
            st.certStatus = '';
            st.keyword = '';
            st.page = 1;
          }
          if (ctx.state.activeSectionId) {
            syncSectionToHost('');
          } else {
            renderPage(hostEl, subPageId, ctx);
          }
          ctx.showToast('已重置机械管理筛选条件');
        } else if (act === 'configReminder') {
          openReminderConfigModal();
        }
      });
    });

    // Left distribution bars (Page 1)
    hostEl.querySelectorAll('[data-pick-type]').forEach(row => {
      row.addEventListener('click', () => {
        const t = row.dataset.pickType;
        uiState.equipment.equipType = uiState.equipment.equipType === t ? '' : t;
        uiState.equipment.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-pick-sec]').forEach(row => {
      row.addEventListener('click', () => {
        const s = row.dataset.pickSec;
        syncSectionToHost(ctx.state.activeSectionId === s ? '' : s);
      });
    });

    // Table row selection
    hostEl.querySelectorAll('[data-select-code]').forEach(tr => {
      tr.addEventListener('click', e => {
        if (e.target.closest('button')) return;
        st.selectedCode = tr.dataset.selectCode;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Pagination buttons
    hostEl.querySelectorAll('[data-page]').forEach(btn => {
      btn.addEventListener('click', () => {
        const p = Number(btn.dataset.page);
        if (!Number.isFinite(p) || p < 1) return;
        st.page = p;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Action buttons inside table & detail panel
    hostEl.querySelectorAll('[data-open-equip]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.openEquip;
        uiState.equipment.selectedCode = code;
        openEquipmentModal(code);
      });
    });
    hostEl.querySelectorAll('[data-jump-archive]').forEach(btn => {
      btn.addEventListener('click', () => {
        uiState.keyArchive.selectedCode = btn.dataset.jumpArchive;
        uiState.keyArchive.page = 1;
        ctx.switchModule('machine', 'keyArchive');
      });
    });
    hostEl.querySelectorAll('[data-open-archive]').forEach(btn => {
      btn.addEventListener('click', () => {
        const code = btn.dataset.openArchive;
        uiState.keyArchive.selectedCode = code;
        openArchiveModal(code);
      });
    });
    hostEl.querySelectorAll('[data-preview-doc]').forEach(btn => {
      btn.addEventListener('click', () => {
        openDocPreviewModal(btn.dataset.code, btn.dataset.previewDoc);
      });
    });
    hostEl.querySelectorAll('[data-open-patrol]').forEach(btn => {
      btn.addEventListener('click', () => {
        openPatrolModal(btn.dataset.code, btn.dataset.openPatrol);
      });
    });

    // Page 2 inline reminder config dropdowns
    hostEl.querySelectorAll('[data-reminder-field]').forEach(sel => {
      sel.addEventListener('change', e => {
        const f = e.target.dataset.reminderField;
        uiState.keyArchive[f] = f === 'remindDays' ? Number(e.target.value) : e.target.value;
        uiState.keyArchive.page = 1;
        renderPage(hostEl, subPageId, ctx);
        ctx.showToast('到期提醒规则已即时更新');
      });
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'machine',
    name: '机械管理',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange(secId) {
      if (lastCtx && lastCtx.cesium) {
        try {
          if (secId && typeof lastCtx.cesium.flyToSection === 'function') {
            // Keep 3D camera aligned with selected work section
            lastCtx.cesium.flyToSection(secId);
          } else if (!secId && typeof lastCtx.cesium.flyToOverview === 'function') {
            lastCtx.cesium.flyToOverview(1.0);
          }
        } catch (err) {
          // Safe no-op if Cesium viewer is uninitialized in headless mode
        }
      }
    },

    onLeave() {
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
    }
  });
})();
