/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 5：人员管理 (js/modules/m05_staff.js)
   包含 2 个子页面：组织与人员 (org)、岗位与考勤 (attendance)
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'org', name: '组织与人员' },
    { id: 'attendance', name: '岗位与考勤' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
    { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
    { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
    { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
    { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
    { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' }
  ];

  const KEY_ROLE_NAMES = [
    '项目负责人',
    '总监理工程师',
    '专业监理工程师',
    '安全负责人',
    '质量负责人',
    '技术负责人',
    '专职安全员'
  ];

  const ATTENDANCE_DATES = ['2026-11-26', '2026-11-25', '2026-11-24'];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external CDN dependencies)
     ------------------------------------------------------------------------ */
  const ICONS = {
    search: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>',
    reset: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>',
    building: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="3" width="16" height="18" rx="2"/><path d="M9 7h2M13 7h2M9 11h2M13 11h2M9 15h2M13 15h2M10 21v-3h4v3"/></svg>',
    users: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
    user: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
    clock: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>',
    role: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 15h16v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2z"/><path d="M6 15a6 6 0 0112 0"/><path d="M12 5v4"/></svg>',
    checkCircle: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M9 12l2 2 4-4"/></svg>',
    shieldCheck: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2l8 4v6c0 5.2-3.4 9.2-8 10-4.6-.8-8-4.8-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    clipboard: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="13" y2="14"/></svg>',
    plug: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22v-5"/><path d="M9 8V2M15 8V2"/><path d="M18 8v5a6 6 0 01-12 0V8z"/></svg>',
    chevronDown: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="6 9 12 15 18 9"/></svg>',
    chevronRight: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="9 6 15 12 9 18"/></svg>',
    chevronLeft: '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><polyline points="15 18 9 12 15 6"/></svg>',
    orgOffice: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 21h18"/><path d="M5 21V7l7-4 7 4v14"/><path d="M9 11h2M13 11h2M9 15h2M13 15h2"/></svg>',
    orgSuper: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l7 4v5c0 5-3 9-7 11-4-2-7-6-7-11V6l7-4z"/><path d="M9 12l2 2 4-4"/></svg>',
    orgBuild: '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M2 18h20"/><path d="M6 18v-5a6 6 0 0112 0v5"/><path d="M12 7v3"/></svg>'
  };

  /* ------------------------------------------------------------------------
     ORGANIZATIONS (11 Orgs, total 186 Staff)
     ------------------------------------------------------------------------ */
  const ORGANIZATIONS = [
    { id: 'org-xmb', name: '项目办', type: '项目办', sectionId: 'line', sectionName: '全线', headcount: 12 },
    { id: 'org-jl1', name: '第一总监办', type: '监理单位', sectionId: 'sec1', sectionName: '一工区', headcount: 8 },
    { id: 'org-jl2', name: '第二总监办', type: '监理单位', sectionId: 'sec2', sectionName: '二工区', headcount: 6 },
    { id: 'org-jl3', name: '第三总监办', type: '监理单位', sectionId: 'sec3', sectionName: '三工区', headcount: 6 },
    { id: 'org-jl4', name: '第四总监办', type: '监理单位', sectionId: 'sec4', sectionName: '四工区', headcount: 6 },
    { id: 'org-sg1', name: '一工区施工单位', type: '施工单位', sectionId: 'sec1', sectionName: '一工区', headcount: 24 },
    { id: 'org-sg2', name: '二工区施工单位', type: '施工单位', sectionId: 'sec2', sectionName: '二工区', headcount: 28 },
    { id: 'org-sg3', name: '三工区施工单位', type: '施工单位', sectionId: 'sec3', sectionName: '三工区', headcount: 26 },
    { id: 'org-sg4', name: '四工区施工单位', type: '施工单位', sectionId: 'sec4', sectionName: '四工区', headcount: 25 },
    { id: 'org-sg5', name: '五工区施工单位', type: '施工单位', sectionId: 'sec5', sectionName: '五工区', headcount: 23 },
    { id: 'org-sg6', name: '六工区施工单位', type: '施工单位', sectionId: 'sec6', sectionName: '六工区', headcount: 22 }
  ];

  const ORG_GROUPS = [
    { type: '项目办', icon: ICONS.orgOffice },
    { type: '监理单位', icon: ICONS.orgSuper },
    { type: '施工单位', icon: ICONS.orgBuild }
  ];

  const ROLE_DUTY_MAP = {
    '项目负责人': '统筹全线工程建设目标、进度节点、资金与重大技术决策。',
    '项目管理人员': '负责项目办日常建设调度、合同台账归口与内外协调事务。',
    '总监理工程师': '全面主持总监办监理工作，签发工程指令、计量支付与质量安全停复工令。',
    '专业监理工程师': '负责本专业分项工程巡视旁站、工序验收与现场抽检复核。',
    '安全负责人': '负责本工区施工安全管理，跟踪隐患整改和复查。',
    '质量负责人': '负责本工区工程质量管控、自检体系运行及质量缺陷闭环整改。',
    '技术负责人': '负责本工区施工组织设计、专项技术方案编制与技术交底。',
    '专职安全员': '负责现场日常安全巡查、危大工程旁站监督与特种作业核查。',
    '试验检测员': '负责原材料取样送检、试块养护与试验台账数据录入核验。',
    '施工员': '负责现场施工放样、班组作业组织及每日工程量进度记录。',
    '材料员': '负责进场原材料验收、物资台账登记及拌合站消耗核对。',
    '测量工程师': '负责路线控制网复测、桥涵构筑物高程及桩位放样复核。',
    '资料员': '负责工程内业资料收集整编、隐蔽工程影像归档与报验流转。'
  };

  /* ------------------------------------------------------------------------
     GENUINE DETERMINISTIC DATASET BUILDER (186 Staff, 36 Key Roles, 3 Anomalies)
     ------------------------------------------------------------------------ */
  function buildInitialData() {
    // 1. Seeded top records matching schematics exactly on Page 1
    const seededStaff = [
      { id: 'RY-0201', name: '李明', orgId: 'org-sg2', role: '安全负责人', status: '在岗', phone: '13845102201', cert: '建安B20240812', certValid: '2028-08-14', joinDate: '2026-08-15', duty: '负责本工区施工安全管理，跟踪隐患整改和复查。' },
      { id: 'RY-0103', name: '张晨', orgId: 'org-xmb', role: '项目管理人员', status: '在岗', phone: '13845101103', cert: '高工20210419', certValid: '2029-05-01', joinDate: '2026-03-10', duty: '负责全线参建单位协调、月度计划督办及项目办台账管理。' },
      { id: 'RY-0304', name: '王宁', orgId: 'org-jl1', role: '专业监理工程师', status: '在岗', phone: '13845103304', cert: '交监20231108', certValid: '2028-11-30', joinDate: '2026-04-02', duty: '负责一工区路基桥梁专业监理抽检、旁站及工序报验签认。' },
      { id: 'RY-0209', name: '赵峰', orgId: 'org-sg2', role: '专职安全员', status: '在岗', phone: '13845102209', cert: '建安C20250214', certValid: '2028-02-13', joinDate: '2026-05-18', duty: '负责二工区现场日常安全巡检、临时用电检查及隐患闭环跟踪。' },
      { id: 'RY-0412', name: '陈静', orgId: 'org-sg4', role: '试验检测员', status: '在岗', phone: '13845104412', cert: '试验检20240632', certValid: '2028-06-30', joinDate: '2026-04-20', duty: '负责四工区原材料进场抽检、拌合料配合比验证及试验报告出具。' },
      { id: 'RY-0506', name: '郑杰', orgId: 'org-sg5', role: '施工员', status: '暂未在岗', phone: '13845105506', cert: '施工员20240915', certValid: '2027-09-14', joinDate: '2026-05-06', duty: '负责五工区路基填筑与防护工程现场班组调度及施工记录。', offReason: '外业培训调休（11-25~11-27）' },
      { id: 'RY-0608', name: '孙洁', orgId: 'org-sg6', role: '材料员', status: '在岗', phone: '13845106608', cert: '材料员20240328', certValid: '2028-03-27', joinDate: '2026-04-12', duty: '负责六工区料场集料、钢筋水泥进场验收及盘点台账核算。' },
      { id: 'RY-0307', name: '刘欣', orgId: 'org-sg3', role: '质量负责人', status: '在岗', phone: '13845103307', cert: '一建20221087', certValid: '2028-10-15', joinDate: '2026-04-08', duty: '负责三工区工程质量体系运行、隐蔽工程自检及质量问题整改复核。' },

      // Additional named key-role holders appearing in Page 2 schematic & across orgs
      { id: 'RY-0101', name: '周航', orgId: 'org-xmb', role: '项目负责人', status: '在岗', phone: '13845101101', cert: '正高20190028', certValid: '2030-01-01', joinDate: '2026-01-15', duty: '全面主持明水至北安段工程建设管理，统筹安全质量进度与投资控制。' },
      { id: 'RY-0301', name: '宋凯', orgId: 'org-jl1', role: '总监理工程师', status: '在岗', phone: '13845103301', cert: '交总监20200145', certValid: '2029-03-20', joinDate: '2026-03-01', duty: '主持第一总监办全面监理工作，签发工程开工令及计量支付证书。' },
      { id: 'RY-0404', name: '何磊', orgId: 'org-sg4', role: '专职安全员', status: '在岗', phone: '13845104404', cert: '建安C20240711', certValid: '2027-07-10', joinDate: '2026-04-15', duty: '负责四工区跨河桥梁及路面作业区安全隐患日查与班前安全交底。' },
      { id: 'RY-0501', name: '许博', orgId: 'org-sg5', role: '技术负责人', status: '暂未在岗', phone: '13845105501', cert: '高工20220391', certValid: '2028-12-31', joinDate: '2026-03-22', duty: '主持五工区施工技术方案审批、冬期施工热工计算及现场技术指导。', offReason: '因事请假待确认（已报备工区）' }
    ];

    // 2. Seeded 36 Key Roles (first 7 match Page 2 schematic order exactly)
    // Distribution: 项目办=3 (3 assigned, 0 pending), 监理单位=11 (10 assigned, 1 pending), 施工单位=22 (20 assigned, 2 pending) => 36 total, 33 assigned, 3 pending
    const keyRoleSpecs = [
      // Page 1 top 7
      { code: 'GW-02-03', orgId: 'org-sg2', roleName: '安全负责人', holderId: 'RY-0201', assignDate: '2026-08-15' },
      { code: 'GW-00-01', orgId: 'org-xmb', roleName: '项目负责人', holderId: 'RY-0101', assignDate: '2026-01-15' },
      { code: 'GW-01-04', orgId: 'org-jl1', roleName: '总监理工程师', holderId: 'RY-0301', assignDate: '2026-03-01' },
      { code: 'GW-03-02', orgId: 'org-sg3', roleName: '质量负责人', holderId: 'RY-0307', assignDate: '2026-04-08' },
      { code: 'GW-04-04', orgId: 'org-sg4', roleName: '专职安全员', holderId: 'RY-0404', assignDate: '2026-04-15' },
      { code: 'GW-05-01', orgId: 'org-sg5', roleName: '技术负责人', holderId: 'RY-0501', assignDate: '2026-03-22' },
      { code: 'GW-06-03', orgId: 'org-sg6', roleName: '专职安全员', holderId: null, assignDate: null },

      // Remaining 项目办 (2 more => total 3)
      { code: 'GW-00-02', orgId: 'org-xmb', roleName: '技术负责人', holderId: 'RY-0102', assignDate: '2026-01-20' },
      { code: 'GW-00-03', orgId: 'org-xmb', roleName: '安全负责人', holderId: 'RY-0104', assignDate: '2026-02-10' },

      // Remaining 监理单位 (10 more => total 11: 10 assigned, 1 pending)
      { code: 'GW-01-05', orgId: 'org-jl1', roleName: '专业监理工程师', holderId: 'RY-0304', assignDate: '2026-04-02' },
      { code: 'GW-01-06', orgId: 'org-jl1', roleName: '专职安全员', holderId: 'RY-0302', assignDate: '2026-04-05' },
      { code: 'GW-02-05', orgId: 'org-jl2', roleName: '总监理工程师', holderId: 'RY-0311', assignDate: '2026-03-08' },
      { code: 'GW-02-06', orgId: 'org-jl2', roleName: '专业监理工程师', holderId: 'RY-0312', assignDate: '2026-04-11' },
      { code: 'GW-03-05', orgId: 'org-jl3', roleName: '总监理工程师', holderId: 'RY-0321', assignDate: '2026-03-10' },
      { code: 'GW-03-06', orgId: 'org-jl3', roleName: '专业监理工程师', holderId: 'RY-0322', assignDate: '2026-04-14' },
      { code: 'GW-03-07', orgId: 'org-jl3', roleName: '专职安全员', holderId: null, assignDate: null },
      { code: 'GW-04-05', orgId: 'org-jl4', roleName: '总监理工程师', holderId: 'RY-0331', assignDate: '2026-03-12' },
      { code: 'GW-04-06', orgId: 'org-jl4', roleName: '专业监理工程师', holderId: 'RY-0332', assignDate: '2026-04-18' },
      { code: 'GW-04-07', orgId: 'org-jl4', roleName: '专职安全员', holderId: 'RY-0333', assignDate: '2026-05-02' },

      // Remaining 施工单位 (17 more => total 22: 20 assigned, 2 pending)
      { code: 'GW-01-01', orgId: 'org-sg1', roleName: '项目负责人', holderId: 'RY-0111', assignDate: '2026-03-15' },
      { code: 'GW-01-02', orgId: 'org-sg1', roleName: '技术负责人', holderId: 'RY-0112', assignDate: '2026-03-16' },
      { code: 'GW-01-03', orgId: 'org-sg1', roleName: '质量负责人', holderId: 'RY-0113', assignDate: '2026-03-18' },
      { code: 'GW-01-07', orgId: 'org-sg1', roleName: '安全负责人', holderId: 'RY-0114', assignDate: '2026-03-20' },
      { code: 'GW-02-01', orgId: 'org-sg2', roleName: '项目负责人', holderId: 'RY-0202', assignDate: '2026-03-15' },
      { code: 'GW-02-02', orgId: 'org-sg2', roleName: '技术负责人', holderId: 'RY-0203', assignDate: '2026-03-18' },
      { code: 'GW-02-04', orgId: 'org-sg2', roleName: '质量负责人', holderId: 'RY-0204', assignDate: '2026-03-20' },
      { code: 'GW-03-01', orgId: 'org-sg3', roleName: '项目负责人', holderId: 'RY-0305', assignDate: '2026-03-16' },
      { code: 'GW-03-03', orgId: 'org-sg3', roleName: '技术负责人', holderId: 'RY-0306', assignDate: '2026-03-20' },
      { code: 'GW-03-04', orgId: 'org-sg3', roleName: '安全负责人', holderId: 'RY-0308', assignDate: '2026-04-01' },
      { code: 'GW-04-01', orgId: 'org-sg4', roleName: '项目负责人', holderId: 'RY-0401', assignDate: '2026-03-18' },
      { code: 'GW-04-02', orgId: 'org-sg4', roleName: '技术负责人', holderId: 'RY-0402', assignDate: '2026-03-22' },
      { code: 'GW-04-03', orgId: 'org-sg4', roleName: '质量负责人', holderId: 'RY-0403', assignDate: '2026-04-05' },
      { code: 'GW-05-02', orgId: 'org-sg5', roleName: '项目负责人', holderId: 'RY-0502', assignDate: '2026-03-20' },
      { code: 'GW-05-03', orgId: 'org-sg5', roleName: '质量负责人', holderId: 'RY-0503', assignDate: '2026-04-02' },
      { code: 'GW-06-01', orgId: 'org-sg6', roleName: '项目负责人', holderId: 'RY-0601', assignDate: '2026-03-22' },
      { code: 'GW-06-02', orgId: 'org-sg6', roleName: '技术负责人', holderId: null, assignDate: null }
    ];

    // 1 more key-role holder is 暂未在岗 so 在岗责任人 = 31 (out of 33 assigned)
    const offDutyKeyHolderIds = new Set(['RY-0501', 'RY-0332']);

    const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'];
    const givenNames = ['伟', '敏', '磊', '静', '洋', '勇', '艳', '杰', '强', '军', '婷', '波', '涛', '明', '超', '辉', '华', '刚', '平', '飞', '鹏', '佳', '宇', '浩', '博', '凯', '宁', '峰', '欣', '晨', '航', '洁', '翔', '瑞', '霖', '哲'];
    const regularRolesByType = {
      '项目办': ['项目管理人员', '合同造价工程师', '工程调度专员', '内业资料员'],
      '监理单位': ['专业监理工程师', '现场监理员', '试验监理员', '测量监理员'],
      '施工单位': ['施工员', '测量工程师', '试验检测员', '材料员', '专职安全员', '质检员', '资料员', '机械管理员']
    };

    const staffList = seededStaff.map(s => Object.assign({}, s));
    const existingIds = new Set(staffList.map(s => s.id));
    const usedNames = new Set(staffList.map(s => s.name));

    function nextUniqueName(idx) {
      let attempt = 0;
      while (attempt < 400) {
        const sn = surnames[(idx * 7 + attempt * 3) % surnames.length];
        const gn = givenNames[(idx * 11 + attempt * 5) % givenNames.length];
        const full = sn + gn;
        if (!usedNames.has(full)) {
          usedNames.add(full);
          return full;
        }
        attempt++;
      }
      return '成员' + idx;
    }

    // Add missing key-role holders first
    let seqIdx = 1;
    keyRoleSpecs.forEach(spec => {
      if (!spec.holderId || existingIds.has(spec.holderId)) return;
      const org = ORGANIZATIONS.find(o => o.id === spec.orgId);
      const isOff = offDutyKeyHolderIds.has(spec.holderId);
      staffList.push({
        id: spec.holderId,
        name: nextUniqueName(seqIdx++),
        orgId: spec.orgId,
        role: spec.roleName,
        status: isOff ? '暂未在岗' : '在岗',
        phone: '1384511' + String(1000 + seqIdx).slice(-4),
        cert: (spec.roleName.includes('安全') ? '建安B' : spec.roleName.includes('监理') ? '交监' : '一建') + '2024' + String(1000 + seqIdx),
        certValid: '2028-10-20',
        joinDate: spec.assignDate,
        duty: ROLE_DUTY_MAP[spec.roleName] || '履行岗位职责，确保施工与管理过程受控。',
        offReason: isOff ? '外业技术交流调休（11-26 返岗）' : ''
      });
      existingIds.add(spec.holderId);
    });

    // Distribute remaining 10 regular 暂未在岗 staff across orgs (total 暂未在岗 = 12)
    // Already 暂未在岗: RY-0506 (org-sg5), RY-0501 (org-sg5), RY-0332 (org-jl4) => 3 people. Need 9 more.
    const extraOffQuota = {
      'org-xmb': 1,
      'org-jl1': 1,
      'org-jl2': 1,
      'org-sg1': 2,
      'org-sg2': 1,
      'org-sg3': 1,
      'org-sg4': 1,
      'org-sg6': 1
    };

    const orgCodePrefix = {
      'org-xmb': '01',
      'org-jl1': '03',
      'org-jl2': '03',
      'org-jl3': '03',
      'org-jl4': '03',
      'org-sg1': '01',
      'org-sg2': '02',
      'org-sg3': '03',
      'org-sg4': '04',
      'org-sg5': '05',
      'org-sg6': '06'
    };

    // Fill remaining headcounts up to exact target per org (sum = 186)
    let idCounter = 50;
    ORGANIZATIONS.forEach(org => {
      let current = staffList.filter(s => s.orgId === org.id).length;
      const rolesPool = regularRolesByType[org.type];
      let offLeft = extraOffQuota[org.id] || 0;
      while (current < org.headcount) {
        idCounter++;
        const code = 'RY-' + orgCodePrefix[org.id] + String(idCounter).padStart(2, '0');
        if (existingIds.has(code)) continue;
        existingIds.add(code);
        const role = rolesPool[(current + idCounter) % rolesPool.length];
        const isOff = offLeft > 0;
        if (isOff) offLeft--;
        staffList.push({
          id: code,
          name: nextUniqueName(seqIdx++),
          orgId: org.id,
          role,
          status: isOff ? '暂未在岗' : '在岗',
          phone: '1394512' + String(1000 + idCounter).slice(-4),
          cert: '岗位证2025' + String(100 + idCounter),
          certValid: '2028-06-30',
          joinDate: '2026-04-' + String(10 + (current % 18)).padStart(2, '0'),
          duty: ROLE_DUTY_MAP[role] || '负责工区现场业务执行与台账记录核查。',
          offReason: isOff ? '轮休调休（已履行审批手续）' : ''
        });
        current++;
      }
    });

    // Build Key Roles objects
    const keyRoles = keyRoleSpecs.map(spec => ({
      code: spec.code,
      orgId: spec.orgId,
      roleName: spec.roleName,
      holderId: spec.holderId,
      assignDate: spec.assignDate
    }));

    // Build 3 Attendance Anomalies matching Page 2 schematic
    const anomalies = [
      { id: 'KQ-20261126-01', staffId: 'RY-0301', orgId: 'org-jl1', roleName: '总监理工程师', type: '签到记录待核', time: '09:12', date: '2026-11-26', note: '现场巡查未在闸机补录人脸，待核实巡检定位轨迹。', resolved: false },
      { id: 'KQ-20261126-02', staffId: 'RY-0404', orgId: 'org-sg4', roleName: '专职安全员', type: '未签到', time: '09:30', date: '2026-11-26', note: '截至 09:30 尚未接入当日门禁考勤记录，已推送提醒至工区安全负责人。', resolved: false },
      { id: 'KQ-20261126-03', staffId: 'RY-0501', orgId: 'org-sg5', roleName: '技术负责人', type: '请假待确认', time: '09:30', date: '2026-11-26', note: '已提交请假申请单，待工区项目负责人及总监办线上确认。', resolved: false }
    ];

    return { staffList, keyRoles, anomalies };
  }

  const store = buildInitialData();

  /* ------------------------------------------------------------------------
     PERSISTENT UI STATE
     ------------------------------------------------------------------------ */
  const uiState = {
    org: {
      orgType: '',
      lineOnly: false,
      status: '',
      keyword: '',
      selectedOrgId: '',
      collapsedGroups: {},
      selectedStaffId: 'RY-0201',
      page: 1,
      pageSize: 8
    },
    attendance: {
      lineOnly: false,
      roleName: '',
      configState: '',
      date: '2026-11-26',
      selectedRoleCode: 'GW-02-03',
      page: 1,
      pageSize: 7
    }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'org';
  let lastSyncedSecId = null;

  /* ------------------------------------------------------------------------
     SCOPED CSS (<style id="m05-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m05-styles')) return;
    const style = document.createElement('style');
    style.id = 'm05-styles';
    style.textContent = `
      .m05-page {
        padding: 10px 18px 80px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }

      /* Top Filter Bar */
      .m05-filter-panel {
        padding: 9px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m05-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 16px;
      }
      .m05-field {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m05-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m05-select {
        min-width: 132px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m05-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m05-search-ico {
        position: absolute;
        left: 10px;
        color: #78a2d4;
        display: inline-flex;
        pointer-events: none;
      }
      .m05-input {
        width: 224px;
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
      .m05-input::placeholder { color: #789bc4; }
      .m05-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 10px rgba(56, 242, 255, 0.28);
      }

      .m05-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m05-btn-query {
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
      .m05-btn-query:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m05-btn-outline {
        height: 32px;
        padding: 0 13px;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }

      /* Panel Header Overrides */
      .m05-panel-header {
        cursor: default;
        padding: 9px 14px;
      }
      .m05-subnote {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 6px;
      }
      .m05-header-right {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 12px;
        color: var(--text-sub);
        font-variant-numeric: tabular-nums;
      }

      /* KPI Grids (6 columns on Page 1, 5 columns on Page 2) */
      .m05-kpi-grid-6 {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m05-kpi-grid-5 {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m05-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 13px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m05-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        transform: translateY(-1px);
      }
      .m05-kpi-icon {
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
      .m05-kpi-icon.tone-green {
        background: rgba(22, 163, 74, 0.18);
        border-color: rgba(74, 222, 128, 0.38);
        color: #4ade80;
      }
      .m05-kpi-icon.tone-amber {
        background: rgba(234, 179, 8, 0.18);
        border-color: rgba(250, 204, 21, 0.42);
        color: #facc15;
      }
      .m05-kpi-meta { min-width: 0; flex: 1; }
      .m05-kpi-label {
        font-size: 12px;
        color: #a9c6e8;
        margin-bottom: 3px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .m05-kpi-val-row {
        display: flex;
        align-items: baseline;
        gap: 3px;
      }
      .m05-kpi-val {
        font-size: 24px;
        font-weight: 800;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: #38f2ff;
        text-shadow: 0 0 12px rgba(56, 242, 255, 0.35);
      }
      .m05-kpi-val.tone-green { color: #4ade80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.35); }
      .m05-kpi-val.tone-amber { color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
      .m05-kpi-unit {
        font-size: 12px;
        color: #d6e8ff;
        font-weight: 500;
      }

      /* Page 1: 3-Column Workspace (~20% / 56% / 24%) */
      .m05-org-workspace {
        display: grid;
        grid-template-columns: minmax(230px, 0.95fr) minmax(0, 2.75fr) minmax(280px, 1.18fr);
        gap: 10px;
        flex: 1;
        align-items: stretch;
      }

      /* Org Tree Panel */
      .m05-tree-body {
        padding: 10px 12px 12px;
        display: flex;
        flex-direction: column;
        gap: 6px;
      }
      .m05-tree-all {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 11px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: rgba(12, 42, 92, 0.55);
        color: #eaf4ff;
        font-size: 13px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.16s;
      }
      .m05-tree-all:hover {
        border-color: var(--cyan);
        background: rgba(16, 62, 132, 0.72);
      }
      .m05-tree-all.active {
        background: linear-gradient(90deg, rgba(22, 119, 255, 0.42), rgba(14, 165, 233, 0.28));
        border-color: #38f2ff;
        box-shadow: 0 0 12px rgba(56, 220, 255, 0.25);
        color: #ffffff;
      }
      .m05-tree-group {
        display: flex;
        flex-direction: column;
        gap: 2px;
        margin-top: 2px;
      }
      .m05-tree-group-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 8px;
        border-radius: 6px;
        color: #d6e8ff;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        transition: background 0.15s;
      }
      .m05-tree-group-hdr:hover {
        background: rgba(56, 189, 248, 0.1);
      }
      .m05-tree-group-left {
        display: inline-flex;
        align-items: center;
        gap: 6px;
      }
      .m05-tree-group-count {
        font-size: 11.5px;
        color: #93b8de;
        font-weight: 500;
        font-variant-numeric: tabular-nums;
      }
      .m05-tree-children {
        display: flex;
        flex-direction: column;
        gap: 2px;
        padding-left: 16px;
      }
      .m05-tree-item {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 6px 10px;
        border-radius: 6px;
        border: 1px solid transparent;
        color: #cfe4ff;
        font-size: 12.5px;
        cursor: pointer;
        transition: all 0.16s;
      }
      .m05-tree-item:hover {
        background: rgba(20, 72, 148, 0.35);
        color: #ffffff;
      }
      .m05-tree-item.active {
        background: rgba(22, 119, 255, 0.28);
        border-color: rgba(56, 220, 255, 0.65);
        color: #ffffff;
        font-weight: 700;
      }
      .m05-tree-item.dimmed {
        opacity: 0.42;
      }
      .m05-tree-item-cnt {
        font-size: 12px;
        color: #93c5fd;
        font-variant-numeric: tabular-nums;
      }

      /* Table Panels */
      .m05-table-panel {
        display: flex;
        flex-direction: column;
      }
      .m05-table-wrap {
        padding: 0 14px 6px;
        overflow-x: auto;
        flex: 1;
      }
      .m05-table th {
        font-size: 12px;
        font-weight: 600;
        color: #93c5fd;
        background: rgba(12, 42, 92, 0.58);
        padding: 9px 10px;
        white-space: nowrap;
      }
      .m05-table td {
        padding: 9px 10px;
        font-size: 12.5px;
        color: #e6f2ff;
        white-space: nowrap;
        font-variant-numeric: tabular-nums;
      }
      .m05-table tbody tr {
        cursor: pointer;
        transition: background 0.15s;
      }
      .m05-table tbody tr:hover {
        background: rgba(20, 74, 152, 0.28);
      }
      .m05-table tbody tr.selected {
        background: rgba(22, 110, 220, 0.28);
        box-shadow: inset 3px 0 0 #38f2ff;
      }

      /* Status Pills */
      .m05-tag {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 10px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        min-width: 52px;
        white-space: nowrap;
      }
      .m05-tag.ok {
        background: rgba(34, 197, 94, 0.18);
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.45);
      }
      .m05-tag.off {
        background: rgba(100, 116, 139, 0.22);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.42);
      }
      .m05-tag.warn {
        background: rgba(234, 179, 8, 0.18);
        color: #facc15;
        border: 1px solid rgba(250, 204, 21, 0.48);
      }
      .m05-tag.info {
        background: rgba(14, 165, 233, 0.2);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.48);
      }

      .m05-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 4px;
        transition: color 0.15s, text-shadow 0.15s;
      }
      .m05-link-btn:hover {
        color: #ffffff;
        text-shadow: 0 0 8px rgba(56, 242, 255, 0.85);
      }

      /* Pagination */
      .m05-pagination {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 6px;
        padding: 8px 14px 10px;
        font-size: 12px;
        color: var(--text-sub);
      }
      .m05-page-btn {
        min-width: 25px;
        height: 25px;
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
      .m05-page-btn:hover:not(:disabled) {
        border-color: var(--cyan);
        color: #ffffff;
      }
      .m05-page-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0c5fd4);
        border-color: #7dd3fc;
        color: #ffffff;
        font-weight: 700;
      }
      .m05-page-btn:disabled {
        opacity: 0.4;
        cursor: not-allowed;
      }

      /* Right Detail Card (人员档案) */
      .m05-profile-body {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        gap: 12px;
        flex: 1;
      }
      .m05-profile-top {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding-bottom: 10px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.16);
      }
      .m05-profile-idwrap {
        display: flex;
        align-items: center;
        gap: 11px;
        min-width: 0;
      }
      .m05-avatar-box {
        width: 42px;
        height: 42px;
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        background: rgba(14, 116, 204, 0.25);
        border: 1px solid rgba(56, 189, 248, 0.45);
        color: #38f2ff;
        flex-shrink: 0;
      }
      .m05-profile-name {
        font-size: 17px;
        font-weight: 800;
        color: #ffffff;
        line-height: 1.2;
      }
      .m05-profile-code {
        font-size: 12px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
        margin-top: 2px;
      }

      .m05-kv-list {
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m05-kv-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        font-size: 12.5px;
      }
      .m05-kv-k { color: #93b8de; }
      .m05-kv-v { color: #ffffff; font-weight: 600; text-align: right; }

      .m05-subcard {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.26);
        display: flex;
        flex-direction: column;
        gap: 7px;
      }
      .m05-subcard-hdr {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 13px;
        font-weight: 700;
        color: #eaf4ff;
        padding-bottom: 5px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.15);
      }

      .m05-duty-box {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(10, 34, 78, 0.5);
        border: 1px solid rgba(56, 189, 248, 0.2);
      }
      .m05-duty-title {
        font-size: 12.5px;
        font-weight: 700;
        color: #eaf4ff;
        margin-bottom: 5px;
      }
      .m05-duty-text {
        font-size: 12.5px;
        color: #cfe4ff;
        line-height: 1.55;
      }

      .m05-profile-foot {
        display: flex;
        flex-direction: column;
        gap: 9px;
      }
      .m05-update-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 11.5px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
      }

      /* Page 2: 2-Column Workspace (~58% / 42%) */
      .m05-att-workspace {
        display: grid;
        grid-template-columns: minmax(0, 1.4fr) minmax(360px, 1fr);
        gap: 10px;
        flex: 1;
        align-items: stretch;
      }
      .m05-att-right-col {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .m05-selected-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        margin: 0 14px 12px;
        padding: 8px 12px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.58);
        border: 1px solid rgba(56, 189, 248, 0.28);
        font-size: 12.5px;
      }
      .m05-selected-left {
        display: flex;
        align-items: center;
        gap: 10px;
        min-width: 0;
        flex-wrap: wrap;
      }
      .m05-selected-code {
        color: #38f2ff;
        font-weight: 700;
        font-variant-numeric: tabular-nums;
      }
      .m05-selected-person {
        color: #ffffff;
        font-weight: 700;
      }

      .m05-preview-badge {
        padding: 2px 10px;
        border-radius: 99px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(14, 116, 204, 0.22);
        color: #93c5fd;
        font-size: 11px;
        font-weight: 600;
      }

      /* Attendance Summary Panel */
      .m05-att-body {
        padding: 10px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 12px;
      }
      .m05-iface-strip {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 11px;
        border-radius: 7px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.24);
        font-size: 12px;
      }
      .m05-iface-left {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #dbeafe;
        font-weight: 600;
      }
      .m05-iface-note {
        font-size: 11.5px;
        color: #93b8de;
      }

      .m05-mini-tiles {
        display: grid;
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 8px;
      }
      .m05-mini-tile {
        padding: 8px 10px;
        border-radius: 7px;
        background: rgba(13, 44, 96, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.24);
      }
      .m05-mini-lbl {
        font-size: 11.5px;
        color: #93b8de;
        margin-bottom: 4px;
      }
      .m05-mini-val {
        font-size: 18px;
        font-weight: 800;
        color: #ffffff;
        font-variant-numeric: tabular-nums;
      }
      .m05-mini-val.tone-green { color: #4ade80; }
      .m05-mini-val.tone-cyan { color: #38f2ff; }
      .m05-mini-val.tone-amber { color: #facc15; }
      .m05-mini-unit { font-size: 11.5px; font-weight: 500; color: #cfe4ff; margin-left: 2px; }

      .m05-tier-bars {
        display: flex;
        flex-direction: column;
        gap: 11px;
        padding-top: 2px;
      }
      .m05-tier-row {
        display: grid;
        grid-template-columns: 68px 1fr 48px;
        align-items: center;
        gap: 10px;
      }
      .m05-tier-name {
        font-size: 12.5px;
        color: #dbeafe;
        font-weight: 500;
      }
      .m05-tier-svg {
        width: 100%;
        height: 12px;
        display: block;
      }
      .m05-tier-ratio {
        font-size: 12.5px;
        font-weight: 700;
        color: #ffffff;
        text-align: right;
        font-variant-numeric: tabular-nums;
      }

      /* Anomaly Footer with .floating-br clearance */
      .m05-anomaly-panel {
        display: flex;
        flex-direction: column;
        flex: 1;
      }
      .m05-anomaly-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 8px 148px 10px 14px;
        border-top: 1px solid rgba(56, 189, 248, 0.15);
        font-size: 11.5px;
        color: #93b8de;
        font-variant-numeric: tabular-nums;
      }

      /* Modal Helpers */
      .m05-modal-box {
        display: flex;
        flex-direction: column;
        gap: 10px;
        padding: 12px;
        border-radius: 8px;
        background: rgba(12, 40, 88, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m05-modal-title {
        font-size: 13px;
        font-weight: 700;
        color: #7dd3fc;
      }
      .m05-modal-textarea {
        width: 100%;
        min-height: 64px;
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
      .m05-modal-textarea:focus {
        border-color: var(--cyan-bright);
      }
      .m05-modal-actions {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .m05-modal-actions .btn-primary-glow {
        width: auto;
        flex: 1;
      }

      @media (max-width: 1380px) {
        .m05-kpi-grid-6 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m05-kpi-grid-5 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m05-org-workspace { grid-template-columns: 240px minmax(0, 1fr); }
        .m05-org-workspace > :last-child { grid-column: span 2; }
        .m05-att-workspace { grid-template-columns: 1fr; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     HELPERS & FILTERS
     ------------------------------------------------------------------------ */
  function getOrg(orgId) {
    return ORGANIZATIONS.find(o => o.id === orgId) || ORGANIZATIONS[0];
  }

  function getStaff(staffId) {
    return store.staffList.find(s => s.id === staffId) || null;
  }

  function getStaffKeyRole(staffId) {
    return store.keyRoles.find(r => r.holderId === staffId) || null;
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

  function matchesSectionFilter(org, activeSectionId, lineOnly) {
    if (activeSectionId) {
      return org.sectionId === activeSectionId;
    }
    if (lineOnly) {
      return org.sectionId === 'line';
    }
    return true;
  }

  function renderSectionSelect(activeSecId, lineOnly) {
    const curVal = activeSecId || (lineOnly ? 'line' : '');
    return `
      <div class="m05-field">
        <span class="m05-field-label">所属工区</span>
        <select class="glass-select m05-select" data-filter="section">
          <option value="" ${curVal === '' ? 'selected' : ''}>全部工区</option>
          <option value="line" ${curVal === 'line' ? 'selected' : ''}>全线</option>
          ${SECTIONS.map(s => `<option value="${s.id}" ${curVal === s.id ? 'selected' : ''}>${s.name}</option>`).join('')}
        </select>
      </div>
    `;
  }

  function renderPagination(totalItems, page, pageSize) {
    const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
    const safePage = Math.min(Math.max(1, page), totalPages);
    const pages = [];

    if (totalPages <= 5) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      if (safePage <= 3) {
        pages.push(1, 2, 3, '...', totalPages);
      } else if (safePage >= totalPages - 2) {
        pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
      } else {
        pages.push(1, '...', safePage, '...', totalPages);
      }
    }

    return {
      safePage,
      totalPages,
      html: `
        <button class="m05-page-btn" data-page="${safePage - 1}" ${safePage <= 1 ? 'disabled' : ''} title="上一页">${ICONS.chevronLeft}</button>
        ${pages.map(p => p === '...'
          ? '<span style="padding:0 3px;color:#789bc4;">...</span>'
          : `<button class="m05-page-btn ${p === safePage ? 'active' : ''}" data-page="${p}">${p}</button>`
        ).join('')}
        <button class="m05-page-btn" data-page="${safePage + 1}" ${safePage >= totalPages ? 'disabled' : ''} title="下一页">${ICONS.chevronRight}</button>
      `
    };
  }

  /* ------------------------------------------------------------------------
     PURE SVG PROGRESS BAR (Page 2 Tier Breakdown)
     ------------------------------------------------------------------------ */
  function renderTierProgressSvg(idSuffix, pct) {
    const clamped = Math.max(0, Math.min(100, pct));
    const gradId = `m05-tier-grad-${idSuffix}`;
    return `
      <svg class="m05-tier-svg" viewBox="0 0 260 12" preserveAspectRatio="none" aria-hidden="true">
        <defs>
          <linearGradient id="${gradId}" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stop-color="#0ea5e9"/>
            <stop offset="100%" stop-color="#38f2ff"/>
          </linearGradient>
        </defs>
        <rect x="0" y="2" width="260" height="8" rx="4" fill="rgba(12, 42, 92, 0.85)" stroke="rgba(56, 189, 248, 0.22)" stroke-width="1"/>
        ${clamped > 0 ? `<rect x="0" y="2" width="${((clamped / 100) * 260).toFixed(1)}" height="8" rx="4" fill="url(#${gradId})"/>` : ''}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 1: 组织与人员 (org)
     ------------------------------------------------------------------------ */
  function getFilteredOrgData(ctx) {
    const st = uiState.org;
    const activeSecId = ctx.state.activeSectionId;
    const kw = (st.keyword || '').trim().toLowerCase();

    // Scope orgs matching top section / orgType filter (for KPIs)
    const scopedOrgs = ORGANIZATIONS.filter(org => {
      if (!matchesSectionFilter(org, activeSecId, st.lineOnly)) return false;
      if (st.orgType && org.type !== st.orgType) return false;
      if (st.selectedOrgId && org.id !== st.selectedOrgId) return false;
      return true;
    });
    const scopedOrgIds = new Set(scopedOrgs.map(o => o.id));

    const scopedStaff = store.staffList.filter(s => {
      if (!scopedOrgIds.has(s.orgId)) return false;
      if (st.status && s.status !== st.status) return false;
      if (kw) {
        const org = getOrg(s.orgId);
        const hay = `${s.id} ${s.name} ${s.role} ${org.name} ${org.sectionName}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const scopedRoles = store.keyRoles.filter(r => scopedOrgIds.has(r.orgId));
    const onDutyCount = scopedStaff.filter(s => s.status === '在岗').length;
    const offDutyCount = scopedStaff.filter(s => s.status === '暂未在岗').length;
    const assignedRolesCount = scopedRoles.filter(r => !!r.holderId).length;

    return {
      scopedOrgs,
      scopedStaff,
      orgCount: scopedOrgs.length,
      staffTotal: scopedStaff.length,
      onDutyCount,
      offDutyCount,
      roleTotal: scopedRoles.length,
      assignedRolesCount
    };
  }

  function renderOrgPage(ctx) {
    const st = uiState.org;
    const activeSecId = ctx.state.activeSectionId;
    const data = getFilteredOrgData(ctx);
    const pager = renderPagination(data.scopedStaff.length, st.page, st.pageSize);
    st.page = pager.safePage;

    const startIdx = (pager.safePage - 1) * st.pageSize;
    const pageRows = data.scopedStaff.slice(startIdx, startIdx + st.pageSize);

    // Selected person for right profile panel
    let selectedPerson = getStaff(st.selectedStaffId);
    if (!selectedPerson || !data.scopedStaff.some(s => s.id === selectedPerson.id)) {
      selectedPerson = data.scopedStaff[0] || store.staffList[0];
      if (selectedPerson) st.selectedStaffId = selectedPerson.id;
    }
    const selOrg = selectedPerson ? getOrg(selectedPerson.orgId) : ORGANIZATIONS[0];
    const selRole = selectedPerson ? getStaffKeyRole(selectedPerson.id) : null;

    // Tree visible org count per group
    const treeOrgs = ORGANIZATIONS.filter(org =>
      matchesSectionFilter(org, activeSecId, st.lineOnly) &&
      (!st.orgType || org.type === st.orgType)
    );
    const treeOrgIdSet = new Set(treeOrgs.map(o => o.id));

    return `
      <div class="m05-page">
        <!-- 1. Top Filter Bar -->
        <div class="glass-panel m05-filter-panel">
          <div class="m05-filter-fields">
            <div class="m05-field">
              <span class="m05-field-label">组织类型</span>
              <select class="glass-select m05-select" data-filter="orgType">
                <option value="" ${st.orgType === '' ? 'selected' : ''}>全部类型</option>
                <option value="项目办" ${st.orgType === '项目办' ? 'selected' : ''}>项目办</option>
                <option value="监理单位" ${st.orgType === '监理单位' ? 'selected' : ''}>监理单位</option>
                <option value="施工单位" ${st.orgType === '施工单位' ? 'selected' : ''}>施工单位</option>
              </select>
            </div>
            ${renderSectionSelect(activeSecId, st.lineOnly)}
            <div class="m05-field">
              <span class="m05-field-label">在岗状态</span>
              <select class="glass-select m05-select" data-filter="status">
                <option value="" ${st.status === '' ? 'selected' : ''}>全部状态</option>
                <option value="在岗" ${st.status === '在岗' ? 'selected' : ''}>在岗</option>
                <option value="暂未在岗" ${st.status === '暂未在岗' ? 'selected' : ''}>暂未在岗</option>
              </select>
            </div>
            <div class="m05-field">
              <span class="m05-field-label">人员搜索</span>
              <div class="m05-search-wrap">
                <span class="m05-search-ico">${ICONS.search}</span>
                <input type="text" class="m05-input" id="m05OrgKeywordInput" placeholder="姓名、岗位或所属单位" value="${escapeHtml(st.keyword)}">
              </div>
            </div>
          </div>
          <div class="m05-filter-actions">
            <button class="m05-btn-query" data-action="query">${ICONS.search} 查询</button>
            <button class="dock-btn m05-btn-outline" data-action="reset">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- 2. 6-Card KPI Row -->
        <div class="glass-panel">
          <div class="panel-header m05-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">人员台账概况</span>
              <span class="m05-subnote">(截至 2026-11-26)</span>
            </div>
          </div>
          <div class="m05-kpi-grid-6">
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.building}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">参建组织</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.orgCount}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.users}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">登记人员</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.staffTotal}</span><span class="m05-kpi-unit">人</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon tone-green">${ICONS.user}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">在岗人员</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val tone-green">${data.onDutyCount}</span><span class="m05-kpi-unit">人</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon tone-amber">${ICONS.clock}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">暂未在岗</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val tone-amber">${data.offDutyCount}</span><span class="m05-kpi-unit">人</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.role}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">关键岗位</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.roleTotal}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.checkCircle}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">已配置岗位</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.assignedRolesCount}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Bottom 3-Column Workspace -->
        <div class="m05-org-workspace">
          <!-- Left: 参建组织 -->
          <div class="glass-panel">
            <div class="panel-header m05-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">参建组织</span>
              </div>
            </div>
            <div class="m05-tree-body">
              <div class="m05-tree-all ${!st.selectedOrgId ? 'active' : ''}" data-org-pick="">
                <span>全部参建组织</span>
                <span>${treeOrgs.length}个</span>
              </div>
              ${ORG_GROUPS.map(grp => {
                const members = ORGANIZATIONS.filter(o => o.type === grp.type);
                const visibleMembers = members.filter(o => treeOrgIdSet.has(o.id));
                const collapsed = !!st.collapsedGroups[grp.type];
                return `
                  <div class="m05-tree-group">
                    <div class="m05-tree-group-hdr" data-group-toggle="${grp.type}">
                      <span class="m05-tree-group-left">
                        <span style="display:inline-flex;color:#78a2d4;">${collapsed ? ICONS.chevronRight : ICONS.chevronDown}</span>
                        <span style="display:inline-flex;color:#38bdf8;">${grp.icon}</span>
                        <span>${grp.type}</span>
                      </span>
                      <span class="m05-tree-group-count">${visibleMembers.length} 个</span>
                    </div>
                    ${collapsed ? '' : `
                      <div class="m05-tree-children">
                        ${members.map(org => {
                          const cnt = store.staffList.filter(s => s.orgId === org.id).length;
                          const inScope = treeOrgIdSet.has(org.id);
                          const isActive = st.selectedOrgId === org.id;
                          return `
                            <div class="m05-tree-item ${isActive ? 'active' : ''} ${!inScope ? 'dimmed' : ''}" data-org-pick="${org.id}">
                              <span>${org.name}</span>
                              <span class="m05-tree-item-cnt">${cnt} 人</span>
                            </div>
                          `;
                        }).join('')}
                      </div>
                    `}
                  </div>
                `;
              }).join('')}
            </div>
          </div>

          <!-- Center: 人员台账 -->
          <div class="glass-panel m05-table-panel">
            <div class="panel-header m05-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">人员台账</span>
              </div>
              <div class="m05-header-right">更新于 2026-11-26 09:30</div>
            </div>
            <div class="m05-table-wrap">
              <table class="data-table m05-table">
                <thead>
                  <tr>
                    <th>人员编号</th>
                    <th>姓名</th>
                    <th>所属组织</th>
                    <th>所属工区</th>
                    <th>岗位</th>
                    <th>在岗状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageRows.length ? pageRows.map(s => {
                    const org = getOrg(s.orgId);
                    const isSel = selectedPerson && selectedPerson.id === s.id;
                    return `
                      <tr class="${isSel ? 'selected' : ''}" data-staff-select="${s.id}">
                        <td>${s.id}</td>
                        <td style="font-weight:700;color:#ffffff;">${s.name}</td>
                        <td>${org.name}</td>
                        <td>${org.sectionName}</td>
                        <td>${s.role}</td>
                        <td><span class="m05-tag ${s.status === '在岗' ? 'ok' : 'off'}">${s.status}</span></td>
                        <td><button class="m05-link-btn" data-staff-modal="${s.id}">查看档案</button></td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr><td colspan="7" style="text-align:center;padding:36px 12px;color:#93b8de;">当前筛选条件下暂无匹配人员记录</td></tr>
                  `}
                </tbody>
              </table>
            </div>
            <div class="m05-pagination">
              <span style="margin-right:4px;">共 ${data.scopedStaff.length} 人</span>
              ${pager.html}
            </div>
          </div>

          <!-- Right: 人员档案 -->
          <div class="glass-panel m05-table-panel">
            <div class="panel-header m05-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">人员档案</span>
              </div>
            </div>
            ${selectedPerson ? `
              <div class="m05-profile-body">
                <div style="display:flex;flex-direction:column;gap:12px;">
                  <div class="m05-profile-top">
                    <div class="m05-profile-idwrap">
                      <div class="m05-avatar-box">${ICONS.user}</div>
                      <div>
                        <div class="m05-profile-name">${selectedPerson.name}</div>
                        <div class="m05-profile-code">${selectedPerson.id}</div>
                      </div>
                    </div>
                    <span class="m05-tag ${selectedPerson.status === '在岗' ? 'ok' : 'off'}">${selectedPerson.status}</span>
                  </div>

                  <div class="m05-kv-list">
                    <div class="m05-kv-row"><span class="m05-kv-k">组织类型</span><span class="m05-kv-v">${selOrg.type}</span></div>
                    <div class="m05-kv-row"><span class="m05-kv-k">所属单位</span><span class="m05-kv-v">${selOrg.name}</span></div>
                    <div class="m05-kv-row"><span class="m05-kv-k">所属工区</span><span class="m05-kv-v">${selOrg.sectionName}</span></div>
                    <div class="m05-kv-row"><span class="m05-kv-k">岗位</span><span class="m05-kv-v">${selectedPerson.role}</span></div>
                  </div>

                  <div class="m05-subcard">
                    <div class="m05-subcard-hdr">
                      <span>关键岗位任职</span>
                      <span class="m05-tag ${selRole ? 'info' : 'off'}">${selRole ? '已配置' : '一般岗位'}</span>
                    </div>
                    ${selRole ? `
                      <div class="m05-kv-row"><span class="m05-kv-k">岗位编号</span><span class="m05-kv-v" style="font-variant-numeric:tabular-nums;">${selRole.code}</span></div>
                      <div class="m05-kv-row"><span class="m05-kv-k">入岗日期</span><span class="m05-kv-v" style="font-variant-numeric:tabular-nums;">${selRole.assignDate || selectedPerson.joinDate}</span></div>
                      <div class="m05-kv-row"><span class="m05-kv-k">任职状态</span><span class="m05-kv-v">${selectedPerson.status}</span></div>
                    ` : `
                      <div class="m05-kv-row"><span class="m05-kv-k">入场日期</span><span class="m05-kv-v" style="font-variant-numeric:tabular-nums;">${selectedPerson.joinDate}</span></div>
                      <div class="m05-kv-row"><span class="m05-kv-k">资格证号</span><span class="m05-kv-v" style="font-variant-numeric:tabular-nums;">${selectedPerson.cert}</span></div>
                    `}
                  </div>

                  <div class="m05-duty-box">
                    <div class="m05-duty-title">主要职责</div>
                    <div class="m05-duty-text">${selectedPerson.duty}</div>
                  </div>
                </div>

                <div class="m05-profile-foot">
                  <div class="m05-update-row">
                    <span>台账更新</span>
                    <span>2026-11-26 09:30</span>
                  </div>
                  <button class="btn-primary-glow" data-action="jumpAttendance" data-staff-id="${selectedPerson.id}">
                    ${ICONS.clipboard} 查看岗位配置
                  </button>
                </div>
              </div>
            ` : `
              <div class="m05-profile-body" style="justify-content:center;align-items:center;color:#93b8de;">请选择左侧人员查看档案</div>
            `}
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 2: 岗位与考勤 (attendance)
     ------------------------------------------------------------------------ */
  function getFilteredAttendanceData(ctx) {
    const st = uiState.attendance;
    const activeSecId = ctx.state.activeSectionId;

    // Roles scoped by section (for KPIs and breakdown)
    const sectionRoles = store.keyRoles.filter(r => {
      const org = getOrg(r.orgId);
      return matchesSectionFilter(org, activeSecId, st.lineOnly);
    });

    // Filtered table roles
    const tableRoles = sectionRoles.filter(r => {
      if (st.roleName && r.roleName !== st.roleName) return false;
      const isAssigned = !!r.holderId;
      if (st.configState === '已配置' && !isAssigned) return false;
      if (st.configState === '待配置' && isAssigned) return false;
      return true;
    });

    // KPI counts reflect active section + filters
    const kpiRoles = tableRoles;
    const totalRoles = kpiRoles.length;
    const assignedRoles = kpiRoles.filter(r => !!r.holderId);
    const pendingRoles = kpiRoles.filter(r => !r.holderId);
    const assignRate = totalRoles > 0 ? ((assignedRoles.length / totalPagesZeroSafe(totalRoles)) * 100).toFixed(1) : '0.0';
    const onDutyHolders = assignedRoles.filter(r => {
      const h = getStaff(r.holderId);
      return h && h.status === '在岗';
    }).length;

    // Attendance summary & anomalies (scoped by section)
    const scopedOrgIds = new Set(sectionRoles.map(r => r.orgId));
    const scopedAnomalies = store.anomalies.filter(a => !a.resolved && scopedOrgIds.has(a.orgId));

    // Date-based slight realistic variation for non-default dates while keeping 2026-11-26 exact
    const dateOffset = st.date === '2026-11-25' ? 1 : st.date === '2026-11-24' ? 2 : 0;
    const expectedCount = assignedRoles.length;
    const anomalyCount = st.date === '2026-11-26'
      ? scopedAnomalies.length
      : Math.max(0, scopedAnomalies.length - dateOffset);
    const arrivedCount = Math.max(0, expectedCount - anomalyCount);
    const arrivalRate = expectedCount > 0 ? ((arrivedCount / expectedCount) * 100).toFixed(1) : '0.0';

    // Breakdown by org type (项目办 / 监理单位 / 施工单位)
    const tierStats = ['项目办', '监理单位', '施工单位'].map((type, idx) => {
      const typeAssigned = assignedRoles.filter(r => getOrg(r.orgId).type === type);
      const typeAnomalies = st.date === '2026-11-26'
        ? scopedAnomalies.filter(a => getOrg(a.orgId).type === type).length
        : Math.max(0, scopedAnomalies.filter(a => getOrg(a.orgId).type === type).length - (idx === 1 ? dateOffset : 0));
      const total = typeAssigned.length;
      const arrived = Math.max(0, total - typeAnomalies);
      const pct = total > 0 ? (arrived / total) * 100 : 0;
      return { type, arrived, total, pct };
    });

    return {
      tableRoles,
      totalRoles,
      assignedCount: assignedRoles.length,
      pendingCount: pendingRoles.length,
      assignRate,
      onDutyHolders,
      expectedCount,
      arrivedCount,
      arrivalRate,
      anomalyCount,
      scopedAnomalies,
      tierStats
    };
  }

  function totalPagesZeroSafe(v) {
    return v > 0 ? v : 1;
  }

  function renderAttendancePage(ctx) {
    const st = uiState.attendance;
    const activeSecId = ctx.state.activeSectionId;
    const data = getFilteredAttendanceData(ctx);
    const pager = renderPagination(data.tableRoles.length, st.page, st.pageSize);
    st.page = pager.safePage;

    const startIdx = (pager.safePage - 1) * st.pageSize;
    const pageRows = data.tableRoles.slice(startIdx, startIdx + st.pageSize);

    let selRole = data.tableRoles.find(r => r.code === st.selectedRoleCode);
    if (!selRole) {
      selRole = data.tableRoles[0] || store.keyRoles[0];
      if (selRole) st.selectedRoleCode = selRole.code;
    }
    const selOrg = selRole ? getOrg(selRole.orgId) : ORGANIZATIONS[0];
    const selHolder = selRole && selRole.holderId ? getStaff(selRole.holderId) : null;

    return `
      <div class="m05-page">
        <!-- 1. Top Filter Bar -->
        <div class="glass-panel m05-filter-panel">
          <div class="m05-filter-fields">
            ${renderSectionSelect(activeSecId, st.lineOnly)}
            <div class="m05-field">
              <span class="m05-field-label">关键岗位</span>
              <select class="glass-select m05-select" data-filter="roleName">
                <option value="" ${st.roleName === '' ? 'selected' : ''}>全部岗位</option>
                ${KEY_ROLE_NAMES.map(r => `<option value="${r}" ${st.roleName === r ? 'selected' : ''}>${r}</option>`).join('')}
              </select>
            </div>
            <div class="m05-field">
              <span class="m05-field-label">配置状态</span>
              <select class="glass-select m05-select" data-filter="configState">
                <option value="" ${st.configState === '' ? 'selected' : ''}>全部状态</option>
                <option value="已配置" ${st.configState === '已配置' ? 'selected' : ''}>已配置</option>
                <option value="待配置" ${st.configState === '待配置' ? 'selected' : ''}>待配置</option>
              </select>
            </div>
            <div class="m05-field">
              <span class="m05-field-label">考勤日期</span>
              <select class="glass-select m05-select" data-filter="date">
                ${ATTENDANCE_DATES.map(d => `<option value="${d}" ${st.date === d ? 'selected' : ''}>${d}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m05-filter-actions">
            <button class="m05-btn-query" data-action="query">${ICONS.search} 查询</button>
            <button class="dock-btn m05-btn-outline" data-action="reset">${ICONS.reset} 重置</button>
          </div>
        </div>

        <!-- 2. 5-Card KPI Row -->
        <div class="glass-panel">
          <div class="panel-header m05-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">关键岗位配置概况</span>
              <span class="m05-subnote">(截至 2026-11-26)</span>
            </div>
          </div>
          <div class="m05-kpi-grid-5">
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.clipboard}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">应配置岗位</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.totalRoles}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon tone-green">${ICONS.checkCircle}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">已配置岗位</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val tone-green">${data.assignedCount}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon tone-amber">${ICONS.clock}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">待配置岗位</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val tone-amber">${data.pendingCount}</span><span class="m05-kpi-unit">个</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.shieldCheck}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">配置率</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.assignRate}%</span></div>
              </div>
            </div>
            <div class="m05-kpi-card">
              <div class="m05-kpi-icon">${ICONS.user}</div>
              <div class="m05-kpi-meta">
                <div class="m05-kpi-label">在岗责任人</div>
                <div class="m05-kpi-val-row"><span class="m05-kpi-val">${data.onDutyHolders}</span><span class="m05-kpi-unit">人</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- 3. Bottom 2-Column Workspace -->
        <div class="m05-att-workspace">
          <!-- Left: 关键岗位配置 -->
          <div class="glass-panel m05-table-panel">
            <div class="panel-header m05-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">关键岗位配置</span>
              </div>
              <div class="m05-header-right">人员台账 · 更新于 2026-11-26 09:30</div>
            </div>
            <div class="m05-table-wrap">
              <table class="data-table m05-table">
                <thead>
                  <tr>
                    <th>岗位编号</th>
                    <th>责任单位</th>
                    <th>工区</th>
                    <th>关键岗位</th>
                    <th>责任人</th>
                    <th>配置状态</th>
                    <th>台账状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageRows.length ? pageRows.map(r => {
                    const org = getOrg(r.orgId);
                    const holder = r.holderId ? getStaff(r.holderId) : null;
                    const isSel = selRole && selRole.code === r.code;
                    return `
                      <tr class="${isSel ? 'selected' : ''}" data-role-select="${r.code}">
                        <td>${r.code}</td>
                        <td>${org.name}</td>
                        <td>${org.sectionName}</td>
                        <td>${r.roleName}</td>
                        <td style="font-weight:${holder ? '700' : '400'};color:${holder ? '#ffffff' : '#93b8de'};">${holder ? holder.name : '—'}</td>
                        <td><span class="m05-tag ${holder ? 'ok' : 'warn'}">${holder ? '已配置' : '待配置'}</span></td>
                        <td>${holder ? `<span class="m05-tag ${holder.status === '在岗' ? 'ok' : 'off'}">${holder.status}</span>` : '<span style="color:#789bc4;">—</span>'}</td>
                        <td><button class="m05-link-btn" data-role-modal="${r.code}">查看</button></td>
                      </tr>
                    `;
                  }).join('') : `
                    <tr><td colspan="8" style="text-align:center;padding:36px 12px;color:#93b8de;">当前筛选条件下暂无关键岗位记录</td></tr>
                  `}
                </tbody>
              </table>
            </div>
            <div class="m05-pagination">
              <span style="margin-right:4px;">共 ${data.tableRoles.length} 个岗位</span>
              ${pager.html}
            </div>
            ${selRole ? `
              <div class="m05-selected-bar">
                <div class="m05-selected-left">
                  <span class="m05-selected-code">${selRole.code}</span>
                  <span style="color:#cfe4ff;">${selOrg.sectionName} · ${selRole.roleName}</span>
                  <span class="m05-selected-person">${selHolder ? `${selHolder.name} (${selHolder.id})` : '待配置责任人'}</span>
                </div>
                ${selHolder
                  ? `<button class="m05-link-btn" data-action="jumpProfile" data-staff-id="${selHolder.id}">查看人员档案 &gt;</button>`
                  : `<button class="m05-link-btn" data-role-modal="${selRole.code}">立即配置人员 &gt;</button>`
                }
              </div>
            ` : ''}
          </div>

          <!-- Right Column: Stacked Attendance Summary + Anomalies -->
          <div class="m05-att-right-col">
            <!-- Top Right: 到岗与考勤汇总 -->
            <div class="glass-panel">
              <div class="panel-header m05-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">到岗与考勤汇总</span>
                </div>
                <span class="m05-preview-badge">演示预览</span>
              </div>
              <div class="m05-att-body">
                <div class="m05-iface-strip">
                  <div class="m05-iface-left">
                    <span style="display:inline-flex;color:#38bdf8;">${ICONS.plug}</span>
                    <span>考勤接口</span>
                    <span class="m05-tag warn" style="min-width:46px;">待接入</span>
                  </div>
                  <span class="m05-iface-note">接口具备后同步到岗与考勤数据</span>
                </div>

                <div class="m05-mini-tiles">
                  <div class="m05-mini-tile">
                    <div class="m05-mini-lbl">当日应到</div>
                    <div class="m05-mini-val">${data.expectedCount}<span class="m05-mini-unit">人</span></div>
                  </div>
                  <div class="m05-mini-tile">
                    <div class="m05-mini-lbl">已到岗</div>
                    <div class="m05-mini-val tone-green">${data.arrivedCount}<span class="m05-mini-unit">人</span></div>
                  </div>
                  <div class="m05-mini-tile">
                    <div class="m05-mini-lbl">到岗率</div>
                    <div class="m05-mini-val tone-cyan">${data.arrivalRate}%</div>
                  </div>
                  <div class="m05-mini-tile">
                    <div class="m05-mini-lbl">异常记录</div>
                    <div class="m05-mini-val tone-amber">${data.anomalyCount}<span class="m05-mini-unit">条</span></div>
                  </div>
                </div>

                <div class="m05-tier-bars">
                  ${data.tierStats.map((t, idx) => `
                    <div class="m05-tier-row">
                      <span class="m05-tier-name">${t.type}</span>
                      ${renderTierProgressSvg(idx, t.pct)}
                      <span class="m05-tier-ratio">${t.arrived} / ${t.total}</span>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>

            <!-- Bottom Right: 考勤异常记录 -->
            <div class="glass-panel m05-anomaly-panel">
              <div class="panel-header m05-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">考勤异常记录</span>
                </div>
                <span class="m05-preview-badge">演示预览</span>
              </div>
              <div class="m05-table-wrap">
                <table class="data-table m05-table">
                  <thead>
                    <tr>
                      <th>人员</th>
                      <th>所属组织</th>
                      <th>岗位</th>
                      <th>异常类型</th>
                      <th>记录时间</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${data.scopedAnomalies.length ? data.scopedAnomalies.map(a => {
                      const person = getStaff(a.staffId);
                      const org = getOrg(a.orgId);
                      return `
                        <tr data-anomaly-modal="${a.id}" title="点击核查考勤异常">
                          <td style="font-weight:700;color:#ffffff;">${person ? person.name : a.staffId}</td>
                          <td>${org.name}</td>
                          <td>${a.roleName}</td>
                          <td><span class="m05-tag warn">${a.type}</span></td>
                          <td>${a.time}</td>
                        </tr>
                      `;
                    }).join('') : `
                      <tr><td colspan="5" style="text-align:center;padding:24px 12px;color:#4ade80;">当前工区考勤异常记录已全部核查清零</td></tr>
                    `}
                  </tbody>
                </table>
              </div>
              <div class="m05-anomaly-footer">
                <span>演示日期 &nbsp; ${st.date}</span>
                <span>共 ${data.scopedAnomalies.length} 条异常记录</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     INTERACTIVE MODALS (Archive, Key Role Assignment, Attendance Anomaly)
     ------------------------------------------------------------------------ */
  function openStaffArchiveModal(staffId) {
    if (!lastCtx) return;
    const person = getStaff(staffId);
    if (!person) return;
    const org = getOrg(person.orgId);
    const keyRole = getStaffKeyRole(person.id);

    lastCtx.openModal(`人员档案详情 · ${person.name} (${person.id})`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属单位 / 工区</span><strong>${org.name} · ${org.sectionName}</strong></div>
        <div class="detail-stat-card"><span>当前岗位</span><strong>${person.role}</strong></div>
        <div class="detail-stat-card"><span>在岗状态</span><strong style="color:${person.status === '在岗' ? '#4ade80' : '#facc15'};">${person.status}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">人员编号</th><td>${person.id}</td><th style="width:120px;">组织类型</th><td>${org.type}</td></tr>
          <tr><th>联系电话</th><td>${person.phone}</td><th>入场日期</th><td>${person.joinDate}</td></tr>
          <tr><th>执业/岗位证书</th><td>${person.cert}</td><th>证书有效期至</th><td>${person.certValid}</td></tr>
          <tr><th>关键岗位任职</th><td>${keyRole ? `${keyRole.code} (${keyRole.roleName})` : '一般岗位人员'}</td><th>三级安全教育</th><td><span class="status-tag ok">已培训考核合格</span></td></tr>
        </tbody>
      </table>
      <div class="m05-modal-box">
        <div class="m05-modal-title">主要职责与履职说明</div>
        <div style="color:#dbeafe;line-height:1.6;">${person.duty}</div>
        ${person.offReason ? `<div style="color:#facc15;font-size:12px;">离岗/调休备注：${person.offReason}</div>` : ''}
      </div>
      <div class="m05-modal-box">
        <div class="m05-modal-title">台账在岗状态维护</div>
        <textarea class="m05-modal-textarea" id="m05StaffStatusNote" placeholder="输入在岗调整或休假/返岗说明...">${person.offReason || '正常在岗履职，持证有效。'}</textarea>
        <div class="m05-modal-actions">
          <button class="btn-primary-glow" id="m05ToggleStaffStatusBtn">
            ${person.status === '在岗' ? '标记为「暂未在岗」' : '确认返岗并标记「在岗」'}
          </button>
          ${keyRole ? `<button class="dock-btn" id="m05ModalJumpRoleBtn" style="padding:8px 14px;">查看岗位配置 (${keyRole.code})</button>` : ''}
        </div>
      </div>
    `);

    const toggleBtn = document.getElementById('m05ToggleStaffStatusBtn');
    if (toggleBtn) {
      toggleBtn.onclick = () => {
        const noteEl = document.getElementById('m05StaffStatusNote');
        const note = noteEl ? noteEl.value.trim() : '';
        if (person.status === '在岗') {
          person.status = '暂未在岗';
          person.offReason = note || '临时调休/外出培训';
        } else {
          person.status = '在岗';
          person.offReason = '';
        }
        lastCtx.closeModal();
        lastCtx.showToast(`已更新 ${person.name} (${person.id}) 台账状态为「${person.status}」`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }

    const jumpBtn = document.getElementById('m05ModalJumpRoleBtn');
    if (jumpBtn && keyRole) {
      jumpBtn.onclick = () => {
        uiState.attendance.selectedRoleCode = keyRole.code;
        lastCtx.closeModal();
        lastCtx.switchModule('staff', 'attendance');
      };
    }
  }

  function openKeyRoleModal(roleCode) {
    if (!lastCtx) return;
    const role = store.keyRoles.find(r => r.code === roleCode);
    if (!role) return;
    const org = getOrg(role.orgId);
    const holder = role.holderId ? getStaff(role.holderId) : null;

    // Candidate pool for assignment (same org or same section, not already holding another key role)
    const busyHolders = new Set(store.keyRoles.filter(r => r.holderId && r.code !== role.code).map(r => r.holderId));
    const candidates = store.staffList.filter(s => {
      const sOrg = getOrg(s.orgId);
      return !busyHolders.has(s.id) && (s.orgId === role.orgId || (org.sectionId !== 'line' && sOrg.sectionId === org.sectionId && sOrg.type === org.type));
    });

    lastCtx.openModal(`关键岗位配置详情 · ${role.code}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>责任单位 / 工区</span><strong>${org.name} · ${org.sectionName}</strong></div>
        <div class="detail-stat-card"><span>关键岗位</span><strong>${role.roleName}</strong></div>
        <div class="detail-stat-card"><span>配置状态</span><strong style="color:${holder ? '#4ade80' : '#facc15'};">${holder ? '已配置' : '待配置'}</strong></div>
      </div>
      ${holder ? `
        <table class="data-table">
          <tbody>
            <tr><th style="width:120px;">责任人</th><td>${holder.name} (${holder.id})</td><th style="width:120px;">台账状态</th><td><span class="status-tag ${holder.status === '在岗' ? 'ok' : 'warn'}">${holder.status}</span></td></tr>
            <tr><th>入岗日期</th><td>${role.assignDate || holder.joinDate}</td><th>资格证书</th><td>${holder.cert} (有效期至 ${holder.certValid})</td></tr>
            <tr><th>考勤日期</th><td>${uiState.attendance.date}</td><th>岗位职责</th><td>${ROLE_DUTY_MAP[role.roleName] || holder.duty}</td></tr>
          </tbody>
        </table>
      ` : `
        <div class="m05-modal-box">
          <div class="m05-modal-title">空缺岗位指派责任人</div>
          <div style="color:#dbeafe;font-size:12.5px;">该岗位当前为「待配置」状态，请从本单位/同工区在册人员中选择具备相应执业资格的人员上岗：</div>
          <select class="glass-select" id="m05AssignCandidateSelect" style="width:100%;height:34px;">
            ${candidates.map(c => `<option value="${c.id}">${c.name} (${c.id}) · ${c.role} · ${c.status}</option>`).join('')}
          </select>
          <button class="btn-primary-glow" id="m05AssignConfirmBtn">确认配置到岗并更新台账</button>
        </div>
      `}
      ${holder ? `
        <div class="m05-modal-actions">
          <button class="btn-primary-glow" id="m05RoleJumpProfileBtn">查看责任人完整档案</button>
          <button class="dock-btn" id="m05RoleUnassignBtn" style="padding:8px 14px;">调离/设为待配置</button>
        </div>
      ` : ''}
    `);

    const assignBtn = document.getElementById('m05AssignConfirmBtn');
    if (assignBtn) {
      assignBtn.onclick = () => {
        const sel = document.getElementById('m05AssignCandidateSelect');
        if (!sel || !sel.value) return;
        role.holderId = sel.value;
        role.assignDate = uiState.attendance.date;
        const p = getStaff(sel.value);
        if (p) {
          p.role = role.roleName;
          p.status = '在岗';
        }
        lastCtx.closeModal();
        lastCtx.showToast(`已完成岗位 ${role.code} (${role.roleName}) 人员配置`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }

    const jumpProfileBtn = document.getElementById('m05RoleJumpProfileBtn');
    if (jumpProfileBtn && holder) {
      jumpProfileBtn.onclick = () => {
        uiState.org.selectedStaffId = holder.id;
        uiState.org.selectedOrgId = '';
        uiState.org.page = 1;
        lastCtx.closeModal();
        lastCtx.switchModule('staff', 'org');
      };
    }

    const unassignBtn = document.getElementById('m05RoleUnassignBtn');
    if (unassignBtn) {
      unassignBtn.onclick = () => {
        role.holderId = null;
        role.assignDate = null;
        lastCtx.closeModal();
        lastCtx.showToast(`岗位 ${role.code} 已变更为「待配置」，请尽快补配责任人`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }
  }

  function openAnomalyModal(anomalyId) {
    if (!lastCtx) return;
    const item = store.anomalies.find(a => a.id === anomalyId);
    if (!item) return;
    const person = getStaff(item.staffId);
    const org = getOrg(item.orgId);

    lastCtx.openModal(`考勤异常核查处置 · ${person ? person.name : item.staffId}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属组织 / 工区</span><strong>${org.name} · ${org.sectionName}</strong></div>
        <div class="detail-stat-card"><span>异常类型</span><strong style="color:#facc15;">${item.type}</strong></div>
        <div class="detail-stat-card"><span>记录时间</span><strong>${item.date} ${item.time}</strong></div>
      </div>
      <table class="data-table">
        <tbody>
          <tr><th style="width:120px;">异常单号</th><td>${item.id}</td><th style="width:120px;">责任岗位</th><td>${item.roleName}</td></tr>
          <tr><th>异常说明</th><td colspan="3">${item.note}</td></tr>
        </tbody>
      </table>
      <div class="m05-modal-box">
        <div class="m05-modal-title">现场核查与闭环处理</div>
        <textarea class="m05-modal-textarea" id="m05AnomalyHandleNote">已电话核实并比对现场带班巡检轨迹，确认处置结果无误。</textarea>
        <div class="m05-modal-actions">
          <button class="btn-primary-glow" id="m05AnomalyConfirmBtn">核实到岗 / 完成异常销号</button>
        </div>
      </div>
    `);

    const btn = document.getElementById('m05AnomalyConfirmBtn');
    if (btn) {
      btn.onclick = () => {
        item.resolved = true;
        if (person && item.type === '请假待确认') {
          // keep off-duty or confirm leave record; resolving anomaly removes it from active exceptions
        }
        lastCtx.closeModal();
        lastCtx.showToast(`已完成 ${person ? person.name : item.staffId} 考勤异常核查销号`);
        renderPage(lastHost, lastSubPageId, lastCtx);
      };
    }
  }

  function escapeHtml(str) {
    return String(str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ------------------------------------------------------------------------
     RENDER DISPATCH & EVENT BINDING
     ------------------------------------------------------------------------ */
  function renderPage(hostEl, subPageId, ctx) {
    ensureStyles();
    lastCtx = ctx;
    lastHost = hostEl;
    lastSubPageId = subPageId === 'attendance' ? 'attendance' : 'org';

    // Reset page & conflicting org selection when global section changes
    if (lastSyncedSecId !== ctx.state.activeSectionId) {
      lastSyncedSecId = ctx.state.activeSectionId;
      uiState.org.page = 1;
      uiState.attendance.page = 1;
      if (ctx.state.activeSectionId) {
        uiState.org.lineOnly = false;
        uiState.attendance.lineOnly = false;
        if (uiState.org.selectedOrgId) {
          const selOrg = getOrg(uiState.org.selectedOrgId);
          if (selOrg.sectionId !== ctx.state.activeSectionId) {
            uiState.org.selectedOrgId = '';
          }
        }
      }
    }

    hostEl.innerHTML = lastSubPageId === 'attendance'
      ? renderAttendancePage(ctx)
      : renderOrgPage(ctx);

    bindEvents(hostEl, lastSubPageId, ctx);
  }

  function bindEvents(hostEl, subPageId, ctx) {
    const st = uiState[subPageId];

    // Filter selects
    hostEl.querySelectorAll('[data-filter]').forEach(sel => {
      sel.addEventListener('change', e => {
        const key = e.target.dataset.filter;
        const val = e.target.value;
        if (key === 'section') {
          st.page = 1;
          if (val === 'line') {
            uiState.org.lineOnly = true;
            uiState.attendance.lineOnly = true;
            uiState.org.selectedOrgId = '';
            if (ctx.state.activeSectionId) {
              syncSectionToHost('');
            } else {
              renderPage(hostEl, subPageId, ctx);
            }
          } else {
            uiState.org.lineOnly = false;
            uiState.attendance.lineOnly = false;
            if (val) {
              syncSectionToHost(val);
            } else if (ctx.state.activeSectionId) {
              syncSectionToHost('');
            } else {
              renderPage(hostEl, subPageId, ctx);
            }
          }
          return;
        }
        st[key] = val;
        st.page = 1;
        renderPage(hostEl, subPageId, ctx);
      });
    });

    // Keyword input (Enter key & live sync on Query)
    const kwInput = hostEl.querySelector('#m05OrgKeywordInput');
    if (kwInput) {
      kwInput.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          uiState.org.keyword = kwInput.value;
          uiState.org.page = 1;
          renderPage(hostEl, subPageId, ctx);
        }
      });
    }

    // Query / Reset / Cross-tab Jump buttons
    hostEl.querySelectorAll('[data-action]').forEach(btn => {
      btn.addEventListener('click', () => {
        const act = btn.dataset.action;
        if (act === 'query') {
          if (kwInput) uiState.org.keyword = kwInput.value;
          st.page = 1;
          renderPage(hostEl, subPageId, ctx);
          ctx.showToast('已按当前筛选条件刷新人员管理数据');
        } else if (act === 'reset') {
          if (subPageId === 'org') {
            uiState.org.orgType = '';
            uiState.org.lineOnly = false;
            uiState.org.status = '';
            uiState.org.keyword = '';
            uiState.org.selectedOrgId = '';
            uiState.org.page = 1;
          } else {
            uiState.attendance.lineOnly = false;
            uiState.attendance.roleName = '';
            uiState.attendance.configState = '';
            uiState.attendance.date = '2026-11-26';
            uiState.attendance.page = 1;
          }
          if (ctx.state.activeSectionId) {
            syncSectionToHost('');
          } else {
            renderPage(hostEl, subPageId, ctx);
          }
          ctx.showToast('已重置筛选条件');
        } else if (act === 'jumpAttendance') {
          const staffId = btn.dataset.staffId;
          const role = getStaffKeyRole(staffId);
          if (role) {
            uiState.attendance.selectedRoleCode = role.code;
            const roleIdx = store.keyRoles.findIndex(r => r.code === role.code);
            if (roleIdx >= 0) {
              uiState.attendance.page = Math.floor(roleIdx / uiState.attendance.pageSize) + 1;
            }
          }
          ctx.switchModule('staff', 'attendance');
        } else if (act === 'jumpProfile') {
          const staffId = btn.dataset.staffId;
          if (staffId) {
            uiState.org.selectedStaffId = staffId;
            uiState.org.selectedOrgId = '';
            uiState.org.keyword = '';
            const idx = store.staffList.findIndex(s => s.id === staffId);
            if (idx >= 0) {
              uiState.org.page = Math.floor(idx / uiState.org.pageSize) + 1;
            }
          }
          ctx.switchModule('staff', 'org');
        }
      });
    });

    // Org Tree collapse/expand & selection
    hostEl.querySelectorAll('[data-group-toggle]').forEach(hdr => {
      hdr.addEventListener('click', () => {
        const grp = hdr.dataset.groupToggle;
        uiState.org.collapsedGroups[grp] = !uiState.org.collapsedGroups[grp];
        renderPage(hostEl, subPageId, ctx);
      });
    });

    hostEl.querySelectorAll('[data-org-pick]').forEach(el => {
      el.addEventListener('click', () => {
        const pick = el.dataset.orgPick;
        uiState.org.selectedOrgId = uiState.org.selectedOrgId === pick ? '' : pick;
        uiState.org.page = 1;
        renderPage(hostEl, subPageId, ctx);
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

    // Page 1 row selection & archive modal
    hostEl.querySelectorAll('[data-staff-select]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('[data-staff-modal]')) return;
        uiState.org.selectedStaffId = row.dataset.staffSelect;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-staff-modal]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        uiState.org.selectedStaffId = btn.dataset.staffModal;
        openStaffArchiveModal(btn.dataset.staffModal);
      });
    });

    // Page 2 row selection & role modal
    hostEl.querySelectorAll('[data-role-select]').forEach(row => {
      row.addEventListener('click', e => {
        if (e.target.closest('[data-role-modal]')) return;
        uiState.attendance.selectedRoleCode = row.dataset.roleSelect;
        renderPage(hostEl, subPageId, ctx);
      });
    });
    hostEl.querySelectorAll('[data-role-modal]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        uiState.attendance.selectedRoleCode = btn.dataset.roleModal;
        openKeyRoleModal(btn.dataset.roleModal);
      });
    });

    // Page 2 anomaly row modal
    hostEl.querySelectorAll('[data-anomaly-modal]').forEach(row => {
      row.addEventListener('click', () => {
        openAnomalyModal(row.dataset.anomalyModal);
      });
    });
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'staff',
    name: '人员管理',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange(secId) {
      uiState.org.page = 1;
      uiState.attendance.page = 1;
      if (secId) {
        uiState.org.lineOnly = false;
        uiState.attendance.lineOnly = false;
      }
      if (lastCtx && lastCtx.cesium && lastCtx.cesium.ready && typeof lastCtx.cesium.applyLayers === 'function') {
        try {
          lastCtx.cesium.applyLayers({ activeSectionId: secId || null });
        } catch (e) {
          // Ignore silent background Cesium sync if viewer is hidden
        }
      }
    },

    onLeave() {
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
    }
  });
})();
