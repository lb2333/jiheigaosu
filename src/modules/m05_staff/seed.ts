import { db } from '@/db';
import {
  staffAttendanceAnomalies,
  staffKeyRoles,
  staffMembers,
  staffOrganizations,
} from '@/db/schema/domains/m05';
import { ROLE_DUTY_MAP } from './types';

const ORGANIZATIONS: Array<typeof staffOrganizations.$inferInsert> = [
  { id: 'org-xmb', name: '项目办', type: '项目办', sectionId: 'line', sectionName: '全线', headcount: 12, lon: 125.982, lat: 47.452, sortOrder: 1 },
  { id: 'org-jl1', name: '第一总监办', type: '监理单位', sectionId: 'sec1', sectionName: '一工区', headcount: 8, lon: 125.89, lat: 47.345, sortOrder: 2 },
  { id: 'org-jl2', name: '第二总监办', type: '监理单位', sectionId: 'sec2', sectionName: '二工区', headcount: 6, lon: 125.975, lat: 47.448, sortOrder: 3 },
  { id: 'org-jl3', name: '第三总监办', type: '监理单位', sectionId: 'sec3', sectionName: '三工区', headcount: 6, lon: 126.002, lat: 47.648, sortOrder: 4 },
  { id: 'org-jl4', name: '第四总监办', type: '监理单位', sectionId: 'sec4', sectionName: '四工区', headcount: 6, lon: 126.13, lat: 47.835, sortOrder: 5 },
  { id: 'org-sg1', name: '一工区施工单位', type: '施工单位', sectionId: 'sec1', sectionName: '一工区', headcount: 24, lon: 125.865, lat: 47.33, sortOrder: 6 },
  { id: 'org-sg2', name: '二工区施工单位', type: '施工单位', sectionId: 'sec2', sectionName: '二工区', headcount: 28, lon: 126.04, lat: 47.495, sortOrder: 7 },
  { id: 'org-sg3', name: '三工区施工单位', type: '施工单位', sectionId: 'sec3', sectionName: '三工区', headcount: 26, lon: 125.992, lat: 47.652, sortOrder: 8 },
  { id: 'org-sg4', name: '四工区施工单位', type: '施工单位', sectionId: 'sec4', sectionName: '四工区', headcount: 25, lon: 126.135, lat: 47.838, sortOrder: 9 },
  { id: 'org-sg5', name: '五工区施工单位', type: '施工单位', sectionId: 'sec5', sectionName: '五工区', headcount: 23, lon: 126.298, lat: 47.985, sortOrder: 10 },
  { id: 'org-sg6', name: '六工区施工单位', type: '施工单位', sectionId: 'sec6', sectionName: '六工区', headcount: 22, lon: 126.392, lat: 48.195, sortOrder: 11 },
];

function buildM05SeedRows() {
  const orgMap = new Map(ORGANIZATIONS.map((o) => [o.id, o]));

  const seededStaff: Array<Omit<typeof staffMembers.$inferInsert, 'sectionId' | 'sortOrder'>> = [
    { id: 'RY-0201', name: '李明', orgId: 'org-sg2', role: '安全负责人', status: '在岗', phone: '13845102201', cert: '建安B20240812', certValid: '2028-08-14', joinDate: '2026-08-15', duty: '负责本工区施工安全管理，跟踪隐患整改和复查。', offReason: '' },
    { id: 'RY-0103', name: '张晨', orgId: 'org-xmb', role: '项目管理人员', status: '在岗', phone: '13845101103', cert: '高工20210419', certValid: '2029-05-01', joinDate: '2026-03-10', duty: '负责全线参建单位协调、月度计划督办及项目办台账管理。', offReason: '' },
    { id: 'RY-0304', name: '王宁', orgId: 'org-jl1', role: '专业监理工程师', status: '在岗', phone: '13845103304', cert: '交监20231108', certValid: '2028-11-30', joinDate: '2026-04-02', duty: '负责一工区路基桥梁专业监理抽检、旁站及工序报验签认。', offReason: '' },
    { id: 'RY-0209', name: '赵峰', orgId: 'org-sg2', role: '专职安全员', status: '在岗', phone: '13845102209', cert: '建安C20250214', certValid: '2028-02-13', joinDate: '2026-05-18', duty: '负责二工区现场日常安全巡检、临时用电检查及隐患闭环跟踪。', offReason: '' },
    { id: 'RY-0412', name: '陈静', orgId: 'org-sg4', role: '试验检测员', status: '在岗', phone: '13845104412', cert: '试验检20240632', certValid: '2028-06-30', joinDate: '2026-04-20', duty: '负责四工区原材料进场抽检、拌合料配合比验证及试验报告出具。', offReason: '' },
    { id: 'RY-0506', name: '郑杰', orgId: 'org-sg5', role: '施工员', status: '暂未在岗', phone: '13845105506', cert: '施工员20240915', certValid: '2027-09-14', joinDate: '2026-05-06', duty: '负责五工区路基填筑与防护工程现场班组调度及施工记录。', offReason: '外业培训调休（11-25~11-27）' },
    { id: 'RY-0608', name: '孙洁', orgId: 'org-sg6', role: '材料员', status: '在岗', phone: '13845106608', cert: '材料员20240328', certValid: '2028-03-27', joinDate: '2026-04-12', duty: '负责六工区料场集料、钢筋水泥进场验收及盘点台账核算。', offReason: '' },
    { id: 'RY-0307', name: '刘欣', orgId: 'org-sg3', role: '质量负责人', status: '在岗', phone: '13845103307', cert: '一建20221087', certValid: '2028-10-15', joinDate: '2026-04-08', duty: '负责三工区工程质量体系运行、隐蔽工程自检及质量问题整改复核。', offReason: '' },
    { id: 'RY-0101', name: '周航', orgId: 'org-xmb', role: '项目负责人', status: '在岗', phone: '13845101101', cert: '正高20190028', certValid: '2030-01-01', joinDate: '2026-01-15', duty: '全面主持明水至北安段工程建设管理，统筹安全质量进度与投资控制。', offReason: '' },
    { id: 'RY-0301', name: '宋凯', orgId: 'org-jl1', role: '总监理工程师', status: '在岗', phone: '13845103301', cert: '交总监20200145', certValid: '2029-03-20', joinDate: '2026-03-01', duty: '主持第一总监办全面监理工作，签发工程开工令及计量支付证书。', offReason: '' },
    { id: 'RY-0404', name: '何磊', orgId: 'org-sg4', role: '专职安全员', status: '在岗', phone: '13845104404', cert: '建安C20240711', certValid: '2027-07-10', joinDate: '2026-04-15', duty: '负责四工区跨河桥梁及路面作业区安全隐患日查与班前安全交底。', offReason: '' },
    { id: 'RY-0501', name: '许博', orgId: 'org-sg5', role: '技术负责人', status: '暂未在岗', phone: '13845105501', cert: '高工20220391', certValid: '2028-12-31', joinDate: '2026-03-22', duty: '主持五工区施工技术方案审批、冬期施工热工计算及现场技术指导。', offReason: '因事请假待确认（已报备工区）' },
  ];

  const keyRoleSpecs: Array<{
    code: string;
    orgId: string;
    roleName: string;
    holderId: string | null;
    assignDate: string | null;
  }> = [
    // Page 1 top 7
    { code: 'GW-02-03', orgId: 'org-sg2', roleName: '安全负责人', holderId: 'RY-0201', assignDate: '2026-08-15' },
    { code: 'GW-00-01', orgId: 'org-xmb', roleName: '项目负责人', holderId: 'RY-0101', assignDate: '2026-01-15' },
    { code: 'GW-01-04', orgId: 'org-jl1', roleName: '总监理工程师', holderId: 'RY-0301', assignDate: '2026-03-01' },
    { code: 'GW-03-02', orgId: 'org-sg3', roleName: '质量负责人', holderId: 'RY-0307', assignDate: '2026-04-08' },
    { code: 'GW-04-04', orgId: 'org-sg4', roleName: '专职安全员', holderId: 'RY-0404', assignDate: '2026-04-15' },
    { code: 'GW-05-01', orgId: 'org-sg5', roleName: '技术负责人', holderId: 'RY-0501', assignDate: '2026-03-22' },
    { code: 'GW-06-03', orgId: 'org-sg6', roleName: '专职安全员', holderId: null, assignDate: null },

    // 项目办 (total 3)
    { code: 'GW-00-02', orgId: 'org-xmb', roleName: '技术负责人', holderId: 'RY-0102', assignDate: '2026-01-20' },
    { code: 'GW-00-03', orgId: 'org-xmb', roleName: '安全负责人', holderId: 'RY-0104', assignDate: '2026-02-10' },

    // 监理单位 (total 11: 10 assigned, 1 pending)
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

    // 施工单位 (total 22: 20 assigned, 2 pending)
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
    { code: 'GW-06-02', orgId: 'org-sg6', roleName: '技术负责人', holderId: null, assignDate: null },
  ];

  const offDutyKeyHolderIds = new Set(['RY-0501', 'RY-0332']);
  const surnames = ['王', '李', '张', '刘', '陈', '杨', '赵', '黄', '周', '吴', '徐', '孙', '胡', '朱', '高', '林', '何', '郭', '马', '罗', '梁', '宋', '郑', '谢', '韩', '唐', '冯', '于', '董', '萧', '程', '曹', '袁', '邓', '许', '傅', '沈', '曾', '彭', '吕'];
  const givenNames = ['伟', '敏', '磊', '静', '洋', '勇', '艳', '杰', '强', '军', '婷', '波', '涛', '明', '超', '辉', '华', '刚', '平', '飞', '鹏', '佳', '宇', '浩', '博', '凯', '宁', '峰', '欣', '晨', '航', '洁', '翔', '瑞', '霖', '哲'];
  const regularRolesByType: Record<string, string[]> = {
    项目办: ['项目管理人员', '合同造价工程师', '工程调度专员', '内业资料员'],
    监理单位: ['专业监理工程师', '现场监理员', '试验监理员', '测量监理员'],
    施工单位: ['施工员', '测量工程师', '试验检测员', '材料员', '专职安全员', '质检员', '资料员', '机械管理员'],
  };

  const staffRows: Array<typeof staffMembers.$inferInsert> = seededStaff.map((s, idx) => ({
    ...s,
    sectionId: orgMap.get(s.orgId)?.sectionId ?? 'line',
    sortOrder: idx + 1,
  }));

  const existingIds = new Set(staffRows.map((s) => s.id));
  const usedNames = new Set(staffRows.map((s) => s.name));

  function nextUniqueName(idx: number): string {
    let attempt = 0;
    while (attempt < 400) {
      const sn = surnames[(idx * 7 + attempt * 3) % surnames.length];
      const gn = givenNames[(idx * 11 + attempt * 5) % givenNames.length];
      const full = sn + gn;
      if (!usedNames.has(full)) {
        usedNames.add(full);
        return full;
      }
      attempt += 1;
    }
    return `成员${idx}`;
  }

  let seqIdx = 1;
  for (const spec of keyRoleSpecs) {
    if (!spec.holderId || existingIds.has(spec.holderId)) continue;
    const org = orgMap.get(spec.orgId)!;
    const isOff = offDutyKeyHolderIds.has(spec.holderId);
    const curIdx = seqIdx++;
    staffRows.push({
      id: spec.holderId,
      name: nextUniqueName(curIdx),
      orgId: spec.orgId,
      sectionId: org.sectionId,
      role: spec.roleName,
      status: isOff ? '暂未在岗' : '在岗',
      phone: '1384511' + String(1000 + curIdx + 1).slice(-4),
      cert:
        (spec.roleName.includes('安全')
          ? '建安B'
          : spec.roleName.includes('监理')
            ? '交监'
            : '一建') +
        '2024' +
        String(1000 + curIdx + 1),
      certValid: '2028-10-20',
      joinDate: spec.assignDate ?? '2026-04-01',
      duty: ROLE_DUTY_MAP[spec.roleName] ?? '履行岗位职责，确保施工与管理过程受控。',
      offReason: isOff ? '外业技术交流调休（11-26 返岗）' : '',
      sortOrder: staffRows.length + 1,
    });
    existingIds.add(spec.holderId);
  }

  const extraOffQuota: Record<string, number> = {
    'org-xmb': 1,
    'org-jl1': 1,
    'org-jl2': 1,
    'org-sg1': 2,
    'org-sg2': 1,
    'org-sg3': 1,
    'org-sg4': 1,
    'org-sg6': 1,
  };

  const orgCodePrefix: Record<string, string> = {
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
    'org-sg6': '06',
  };

  let idCounter = 50;
  for (const org of ORGANIZATIONS) {
    let current = staffRows.filter((s) => s.orgId === org.id).length;
    const rolesPool = regularRolesByType[org.type] ?? ['施工员'];
    let offLeft = extraOffQuota[org.id] ?? 0;
    const targetHeadcount = org.headcount ?? 0;
    while (current < targetHeadcount) {
      idCounter += 1;
      const code = `RY-${orgCodePrefix[org.id]}${String(idCounter).padStart(2, '0')}`;
      if (existingIds.has(code)) continue;
      existingIds.add(code);
      const role = rolesPool[(current + idCounter) % rolesPool.length];
      const isOff = offLeft > 0;
      if (isOff) offLeft -= 1;
      staffRows.push({
        id: code,
        name: nextUniqueName(seqIdx++),
        orgId: org.id,
        sectionId: org.sectionId,
        role,
        status: isOff ? '暂未在岗' : '在岗',
        phone: '1394512' + String(1000 + idCounter).slice(-4),
        cert: '岗位证2025' + String(100 + idCounter),
        certValid: '2028-06-30',
        joinDate: '2026-04-' + String(10 + (current % 18)).padStart(2, '0'),
        duty: ROLE_DUTY_MAP[role] ?? '负责工区现场业务执行与台账记录核查。',
        offReason: isOff ? '轮休调休（已履行审批手续）' : '',
        sortOrder: staffRows.length + 1,
      });
      current += 1;
    }
  }

  const keyRoleRows: Array<typeof staffKeyRoles.$inferInsert> = keyRoleSpecs.map((spec, idx) => ({
    code: spec.code,
    orgId: spec.orgId,
    sectionId: orgMap.get(spec.orgId)?.sectionId ?? 'line',
    roleName: spec.roleName,
    holderId: spec.holderId,
    assignDate: spec.assignDate,
    sortOrder: idx + 1,
  }));

  const anomalyRows: Array<typeof staffAttendanceAnomalies.$inferInsert> = [
    {
      id: 'KQ-20261126-01',
      staffId: 'RY-0301',
      orgId: 'org-jl1',
      sectionId: 'sec1',
      roleName: '总监理工程师',
      type: '签到记录待核',
      time: '09:12',
      date: '2026-11-26',
      note: '现场巡查未在闸机补录人脸，待核实巡检定位轨迹。',
      resolved: false,
      handleNote: '',
      resolvedBy: '',
      resolvedAt: '',
      sortOrder: 1,
    },
    {
      id: 'KQ-20261126-02',
      staffId: 'RY-0404',
      orgId: 'org-sg4',
      sectionId: 'sec4',
      roleName: '专职安全员',
      type: '未签到',
      time: '09:30',
      date: '2026-11-26',
      note: '截至 09:30 尚未接入当日门禁考勤记录，已推送提醒至工区安全负责人。',
      resolved: false,
      handleNote: '',
      resolvedBy: '',
      resolvedAt: '',
      sortOrder: 2,
    },
    {
      id: 'KQ-20261126-03',
      staffId: 'RY-0501',
      orgId: 'org-sg5',
      sectionId: 'sec5',
      roleName: '技术负责人',
      type: '请假待确认',
      time: '09:30',
      date: '2026-11-26',
      note: '已提交请假申请单，待工区项目负责人及总监办线上确认。',
      resolved: false,
      handleNote: '',
      resolvedBy: '',
      resolvedAt: '',
      sortOrder: 3,
    },
  ];

  return { staffRows, keyRoleRows, anomalyRows };
}

export async function seedM05(dbInstance = db) {
  for (const org of ORGANIZATIONS) {
    await dbInstance
      .insert(staffOrganizations)
      .values(org)
      .onConflictDoUpdate({
        target: staffOrganizations.id,
        set: {
          name: org.name,
          type: org.type,
          sectionId: org.sectionId,
          sectionName: org.sectionName,
          headcount: org.headcount,
          lon: org.lon,
          lat: org.lat,
          sortOrder: org.sortOrder,
        },
      });
  }

  const { staffRows, keyRoleRows, anomalyRows } = buildM05SeedRows();

  await dbInstance.insert(staffMembers).values(staffRows).onConflictDoNothing();
  await dbInstance.insert(staffKeyRoles).values(keyRoleRows).onConflictDoNothing();
  await dbInstance.insert(staffAttendanceAnomalies).values(anomalyRows).onConflictDoNothing();
}
