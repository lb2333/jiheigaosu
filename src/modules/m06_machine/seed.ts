import { db, type Database } from '@/db';
import {
  machineEquipment,
  machineKeyArchives,
  machinePatrolLogs,
  machineReminderConfig,
} from '@/db/schema/domains/m06';
import { EQUIP_TYPES, SECTIONS, SECTION_BY_ID } from './types';

interface PinnedEquipDef {
  code: string;
  name: string;
  type: string;
  secId: string;
  entryStatus: string;
  useStatus: string;
  isKey: boolean;
  keyOrder?: number;
  archiveId?: string;
  model: string;
  spec: string;
  manufacturer: string;
  entryDate: string;
  exitDate: string;
  location: string;
  operator: string;
  inspectNo?: string;
  inspectDate?: string;
  validUntil?: string;
  installValidUntil?: string;
  missingDocs?: boolean;
  patrolLogs?: Array<{
    id: string;
    time: string;
    content: string;
    status: string;
    inspector: string;
    detail: string;
  }>;
}

export function buildReconciledM06Seed() {
  // Target matrix for 112 on-site equipment by section & type:
  // sec1:17, sec2:22, sec3:20, sec4:19, sec5:18, sec6:16 (sum=112)
  // TS:42, LM:28, QZ:24, YS:14, JQ:4 (sum=112)
  const onSiteMatrix: Record<string, Record<string, number>> = {
    sec1: { 土石方设备: 7, 路面设备: 4, 起重设备: 4, 运输及其他: 2, 架桥机: 0 },
    sec2: { 土石方设备: 8, 路面设备: 5, 起重设备: 5, 运输及其他: 3, 架桥机: 1 },
    sec3: { 土石方设备: 7, 路面设备: 5, 起重设备: 4, 运输及其他: 3, 架桥机: 1 },
    sec4: { 土石方设备: 7, 路面设备: 5, 起重设备: 4, 运输及其他: 2, 架桥机: 1 },
    sec5: { 土石方设备: 7, 路面设备: 5, 起重设备: 4, 运输及其他: 2, 架桥机: 0 },
    sec6: { 土石方设备: 6, 路面设备: 4, 起重设备: 3, 运输及其他: 2, 架桥机: 1 },
  };

  // Exited matrix for 16 exited equipment: TS:6, LM:4, YS:6 (sum=16)
  const exitedMatrix: Record<string, Record<string, number>> = {
    sec1: { 土石方设备: 1, 路面设备: 1, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
    sec2: { 土石方设备: 1, 路面设备: 1, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
    sec3: { 土石方设备: 1, 路面设备: 1, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
    sec4: { 土石方设备: 1, 路面设备: 0, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
    sec5: { 土石方设备: 1, 路面设备: 1, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
    sec6: { 土石方设备: 1, 路面设备: 0, 起重设备: 0, 运输及其他: 1, 架桥机: 0 },
  };

  const pinnedDefs: PinnedEquipDef[] = [
    {
      code: 'QZ-03-006',
      name: '门式起重机',
      type: '起重设备',
      secId: 'sec3',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: true,
      keyOrder: 1,
      archiveId: 'DA-QZ-03006',
      model: 'MG-80T/32m',
      spec: '额定起重量 80t · 跨度 32m',
      entryDate: '2026-09-14',
      exitDate: '—',
      location: '三工区 · 一号梁场',
      inspectNo: 'JY-2025-0316',
      inspectDate: '2025-12-19',
      validUntil: '2026-12-18',
      installValidUntil: '2027-03-10',
      operator: '张海峰（特种作业证号 JL-QZ-0306）',
      manufacturer: '河南卫华重型机械股份有限公司',
      patrolLogs: [
        {
          id: 'XC-20261125-016',
          time: '11-25 15:20',
          content: '起重设备例行巡查',
          status: '记录正常',
          inspector: '周明',
          detail: '主梁焊缝、大车走行机构、起升制动器及声光报警器运行正常，无异常声响。',
        },
        {
          id: 'XC-20261120-008',
          time: '11-20 10:35',
          content: '限位标识专项巡查',
          status: '已处理',
          inspector: '陈亮',
          detail: '复核起升高度限位器与轨道端部止挡标识，已补充反光警示贴并拍照归档。',
        },
        {
          id: 'XC-20261114-003',
          time: '11-14 09:46',
          content: '维护后检查记录',
          status: '已归档',
          inspector: '李伟',
          detail: '完成钢丝绳润滑保养与卷筒压板力矩复紧，空载及额定载荷试吊合格。',
        },
      ],
    },
    {
      code: 'JQ-02-001',
      name: '架桥机',
      type: '架桥机',
      secId: 'sec2',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: true,
      keyOrder: 2,
      archiveId: 'DA-JQ-02001',
      model: 'DJ180/40m',
      spec: '额定起重量 180t · 适应跨径 40m',
      entryDate: '2026-07-18',
      exitDate: '—',
      location: '二工区 · 桥梁示例A',
      inspectNo: 'JY-2026-0118',
      inspectDate: '2026-04-21',
      validUntil: '2027-04-20',
      installValidUntil: '2027-06-15',
      operator: '刘建国（特种作业证号 JL-JQ-0201）',
      manufacturer: '郑州大方桥梁机械有限公司',
      patrolLogs: [
        {
          id: 'XC-20261124-011',
          time: '11-24 14:10',
          content: '过孔前支腿锁定核查',
          status: '记录正常',
          inspector: '王涛',
          detail: '前中后支腿液压锁止可靠，主梁挠度监测在允许范围内。',
        },
        {
          id: 'XC-20261115-004',
          time: '11-15 09:20',
          content: '架桥机风速仪校准检查',
          status: '已归档',
          inspector: '赵刚',
          detail: '风速报警阈值设定 10.8m/s（6级风），信号回传正常。',
        },
      ],
    },
    {
      code: 'TS-01-018',
      name: '履带挖掘机',
      type: '土石方设备',
      secId: 'sec1',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: false,
      model: 'CAT 336',
      spec: '工作重量 36.2t · 斗容 1.9m³',
      entryDate: '2026-06-12',
      exitDate: '—',
      location: '一工区 · K08+120 路基段',
      operator: '赵铁柱',
      manufacturer: '卡特彼勒（徐州）有限公司',
    },
    {
      code: 'LM-04-013',
      name: '双钢轮压路机',
      type: '路面设备',
      secId: 'sec4',
      entryStatus: '在场',
      useStatus: '待用',
      isKey: false,
      model: 'BOMAG BW203AD-4',
      spec: '工作重量 13.5t · 碾压宽度 2.13m',
      entryDate: '2026-08-22',
      exitDate: '—',
      location: '四工区 · K84+500 路面段',
      operator: '马志远',
      manufacturer: '宝马格（中国）工程机械有限公司',
    },
    {
      code: 'LM-06-004',
      name: '沥青摊铺机',
      type: '路面设备',
      secId: 'sec6',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: false,
      model: 'VÖGELE SUPER 2100-3',
      spec: '最大摊铺宽度 13m · 功率 186kW',
      entryDate: '2026-09-03',
      exitDate: '—',
      location: '六工区 · K135+400 沥青段',
      operator: '韩志强',
      manufacturer: '维特根（中国）机械有限公司',
    },
    {
      code: 'QZ-04-012',
      name: '履带起重机',
      type: '起重设备',
      secId: 'sec4',
      entryStatus: '在场',
      useStatus: '停用',
      isKey: true,
      keyOrder: 3,
      archiveId: 'DA-QZ-04012',
      model: 'QUY80A',
      spec: '额定起重量 80t · 主臂 52m',
      entryDate: '2026-06-25',
      exitDate: '—',
      location: '四工区 · 跨河中桥 3#墩',
      inspectNo: 'JY-2025-0209',
      inspectDate: '2025-11-19',
      validUntil: '2026-11-18',
      installValidUntil: '2026-11-18',
      operator: '孙立群（特种作业证号 JL-QZ-0412）',
      manufacturer: '徐州重型机械有限公司',
      patrolLogs: [
        {
          id: 'XC-20261119-002',
          time: '11-19 08:50',
          content: '证书超期停用封存核查',
          status: '已处理',
          inspector: '周海涛',
          detail: '检验有效期 2026-11-18 已届满，已下发停用锁机通知并预约特检院复检。',
        },
        {
          id: 'XC-20261110-005',
          time: '11-10 14:30',
          content: '力矩限制器灵敏度抽查',
          status: '已归档',
          inspector: '周海涛',
          detail: '复检前例行检查，工况设定与变幅限位开关正常。',
        },
      ],
    },
    {
      code: 'TS-05-009',
      name: '轮式装载机',
      type: '土石方设备',
      secId: 'sec5',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: false,
      model: 'XCMG LW500KV',
      spec: '额定载重 5.0t · 斗容 3.0m³',
      entryDate: '2026-07-08',
      exitDate: '—',
      location: '五工区 · 五工区预制场',
      operator: '王海龙',
      manufacturer: '徐工集团工程机械股份有限公司',
    },
    {
      code: 'YS-02-011',
      name: '自卸式运输车',
      type: '运输及其他',
      secId: 'sec2',
      entryStatus: '已退场',
      useStatus: '—',
      isKey: false,
      model: 'HOWO TX 8×4',
      spec: '核定载质量 31t · 货箱容积 22m³',
      entryDate: '2026-05-12',
      exitDate: '2026-11-15',
      location: '二工区 · 已办理退场（原K28+400）',
      operator: '高强',
      manufacturer: '中国重汽集团济南卡车股份有限公司',
    },
    {
      code: 'QZ-02-003',
      name: '汽车起重机',
      type: '起重设备',
      secId: 'sec2',
      entryStatus: '在场',
      useStatus: '在用',
      isKey: true,
      keyOrder: 4,
      archiveId: 'DA-QZ-02003',
      model: 'QAY55K5',
      spec: '额定起重量 55t · 5节主臂',
      entryDate: '2026-07-29',
      exitDate: '—',
      location: '二工区 · 二号梁场',
      inspectNo: 'JY-2025-0288',
      inspectDate: '2025-12-08',
      validUntil: '2026-12-07',
      installValidUntil: '2027-02-01',
      operator: '陈志勇（特种作业证号 JL-QZ-0203）',
      manufacturer: '中联重科股份有限公司',
      patrolLogs: [
        {
          id: 'XC-20261123-012',
          time: '11-23 11:15',
          content: '支腿垫木与风力作业巡查',
          status: '记录正常',
          inspector: '刘志鹏',
          detail: '支腿全伸垫板稳固，吊钩防脱棘爪完好。',
        },
        {
          id: 'XC-20261112-007',
          time: '11-12 16:05',
          content: '检验到期前30日预检提示',
          status: '已处理',
          inspector: '刘志鹏',
          detail: '已提交年度定期检验预约单，计划 11-29 现场检测。',
        },
      ],
    },
    {
      code: 'JQ-04-002',
      name: '架桥机',
      type: '架桥机',
      secId: 'sec4',
      entryStatus: '在场',
      useStatus: '待用',
      isKey: true,
      keyOrder: 5,
      archiveId: 'DA-JQ-04002',
      model: 'JQ160/40m',
      spec: '额定起重量 160t · 双导梁步履式',
      entryDate: '2026-08-19',
      exitDate: '—',
      location: '四工区 · 二号梁场存梁区',
      inspectNo: 'JY-2026-0142',
      inspectDate: '2026-05-03',
      validUntil: '2027-05-02',
      installValidUntil: '2027-06-20',
      operator: '吴国梁（特种作业证号 JL-JQ-0402）',
      manufacturer: '中铁工程装备集团有限公司',
      patrolLogs: [
        {
          id: 'XC-20261122-009',
          time: '11-22 10:20',
          content: '待用设备防风防冻巡查',
          status: '记录正常',
          inspector: '周海涛',
          detail: '液压油箱防寒伴热运行正常，轨道夹轨器已锁紧。',
        },
      ],
    },
    {
      code: 'QZ-05-002',
      name: '随车起重机',
      type: '起重设备',
      secId: 'sec5',
      entryStatus: '在场',
      useStatus: '停用',
      isKey: true,
      keyOrder: 6,
      archiveId: 'DA-QZ-05002',
      model: 'SQS300-4',
      spec: '额定起重量 12t · 最大工作幅度 14.5m',
      entryDate: '2026-10-18',
      exitDate: '—',
      location: '五工区 · 五工区预制场',
      inspectNo: 'JY-待补录',
      inspectDate: '—',
      validUntil: '—',
      installValidUntil: '—',
      operator: '杨鹏（特种作业证号 JL-QZ-0502）',
      manufacturer: '徐工随车起重机有限公司',
      missingDocs: true,
      patrolLogs: [
        {
          id: 'XC-20261121-014',
          time: '11-21 15:40',
          content: '进场资料缺项复核',
          status: '已处理',
          inspector: '孙明辉',
          detail: '原定期检验报告扫描件未盖检测章，暂按停用管控，待施工单位补齐资料后启用。',
        },
      ],
    },
    {
      code: 'QZ-01-002',
      name: '汽车起重机',
      type: '起重设备',
      secId: 'sec1',
      entryStatus: '在场',
      useStatus: '停用',
      isKey: true,
      keyOrder: 7,
      archiveId: 'DA-QZ-01002',
      model: 'STC500E',
      spec: '额定起重量 50t · 主臂 42.5m',
      entryDate: '2026-06-05',
      exitDate: '—',
      location: '一工区 · K12+600 跨线桥',
      inspectNo: 'JY-2025-0194',
      inspectDate: '2025-11-22',
      validUntil: '2026-11-21',
      installValidUntil: '2026-11-21',
      operator: '郑海涛（特种作业证号 JL-QZ-0102）',
      manufacturer: '三一重工股份有限公司',
      patrolLogs: [
        {
          id: 'XC-20261122-001',
          time: '11-22 09:05',
          content: '检验过期强制停用检查',
          status: '已处理',
          inspector: '赵建军',
          detail: '证书于 2026-11-21 到期，已张贴停用警示牌并收回作业钥匙。',
        },
      ],
    },
  ];

  const remainingKeyDates = [
    '2026-12-11',
    '2026-12-15',
    '2026-12-22', // 3 即将到期
    '—', // 1 待补资料
    '2027-01-18',
    '2027-02-04',
    '2027-02-19',
    '2027-03-08',
    '2027-03-22',
    '2027-04-06',
    '2027-04-15',
    '2027-05-12',
    '2027-05-28',
    '2027-06-09',
    '2027-06-21',
    '2027-07-05',
    '2027-07-19',
    '2027-08-03',
    '2027-08-18',
    '2027-09-02',
    '2027-09-16', // 17 正常有效
  ];

  const NAME_CATALOG: Record<string, Array<{ name: string; model: string; spec: string; mfg: string }>> = {
    土石方设备: [
      { name: '履带挖掘机', model: 'SY365H', spec: '工作重量 36t · 斗容 1.8m³', mfg: '三一重机有限公司' },
      { name: '轮式装载机', model: 'ZL50GN', spec: '额定载重 5.0t · 斗容 3.0m³', mfg: '徐工集团工程机械股份有限公司' },
      { name: '履带推土机', model: 'SD22', spec: '功率 162kW · 铲刀 6.4m³', mfg: '山推工程机械股份有限公司' },
      { name: '振动压路机', model: 'XS223J', spec: '工作重量 22t · 激振力 390kN', mfg: '徐工道路机械事业部' },
      { name: '平地机', model: 'GR215', spec: '功率 160kW · 刮刀长 4.27m', mfg: '徐工道路机械事业部' },
    ],
    路面设备: [
      { name: '双钢轮压路机', model: 'XD133', spec: '工作重量 13t · 振动频率 67Hz', mfg: '徐工道路机械事业部' },
      { name: '沥青摊铺机', model: 'RP953T', spec: '最大摊铺宽度 9.5m · 190kW', mfg: '徐工道路机械事业部' },
      { name: '胶轮压路机', model: 'XP303', spec: '工作重量 30t · 11轮充气轮胎', mfg: '徐工道路机械事业部' },
      { name: '水稳摊铺机', model: 'DTU95C', spec: '最大摊铺宽度 9.5m · 双振捣', mfg: '三一重工路机事业部' },
      { name: '路面铣刨机', model: 'XM200K', spec: '铣刨宽度 2.0m · 最大深度 320mm', mfg: '徐工道路机械事业部' },
    ],
    起重设备: [
      { name: '门式起重机', model: 'MG-80T', spec: '额定起重量 80t · 跨度 32m', mfg: '河南卫华重型机械股份有限公司' },
      { name: '汽车起重机', model: 'STC500E', spec: '额定起重量 50t · 主臂 42.5m', mfg: '三一重工股份有限公司' },
      { name: '履带起重机', model: 'SCC800A', spec: '额定起重量 80t · 主臂 56m', mfg: '三一重工股份有限公司' },
      { name: '塔式起重机', model: 'QTZ125', spec: '最大起重量 10t · 臂长 60m', mfg: '中联重科股份有限公司' },
      { name: '随车起重机', model: 'SQS250', spec: '额定起重量 10t · 幅度 13.8m', mfg: '徐工随车起重机有限公司' },
    ],
    运输及其他: [
      { name: '自卸式运输车', model: 'SHACMAN X3000', spec: '核定载重 31t · 8×4 驱动', mfg: '陕西重型汽车有限公司' },
      { name: '混凝土搅拌运输车', model: 'SY412C-8', spec: '搅拌容积 12m³ · 寒区保温', mfg: '三一汽车制造有限公司' },
      { name: '洒水抑尘车', model: 'DFH5180', spec: '罐体容积 14m³ · 雾炮 30m', mfg: '东风商用车有限公司' },
      { name: '柴油发电机组', model: 'GF-400kW', spec: '额定功率 400kW · 静音箱式', mfg: '潍柴重机股份有限公司' },
    ],
    架桥机: [
      { name: '架桥机', model: 'DJ180/40m', spec: '额定起重量 180t · 双主梁', mfg: '郑州大方桥梁机械有限公司' },
      { name: '架桥机', model: 'JQ160/40m', spec: '额定起重量 160t · 步履式', mfg: '中铁工程装备集团有限公司' },
    ],
  };

  const OPERATORS = [
    '李志强', '张建军', '刘伟', '王俊杰', '陈晓东', '赵永刚',
    '孙海军', '周立新', '吴志刚', '马春光', '郭文斌', '韩磊',
  ];
  const INSPECTORS = ['周明', '陈亮', '王涛', '赵建军', '刘志鹏', '周海涛', '孙明辉', '韩立新'];

  const remOnSite = JSON.parse(JSON.stringify(onSiteMatrix)) as Record<string, Record<string, number>>;
  const remExited = JSON.parse(JSON.stringify(exitedMatrix)) as Record<string, Record<string, number>>;
  const usedCodes = new Set<string>();

  const equipmentRows: Array<typeof machineEquipment.$inferInsert> = [];
  const archiveRows: Array<typeof machineKeyArchives.$inferInsert> = [];
  const patrolRows: Array<typeof machinePatrolLogs.$inferInsert> = [];

  let patrolSeq = 1;

  pinnedDefs.forEach((p, idx) => {
    usedCodes.add(p.code);
    if (p.entryStatus === '在场') remOnSite[p.secId][p.type]--;
    else remExited[p.secId][p.type]--;

    const sec = SECTION_BY_ID[p.secId];
    equipmentRows.push({
      code: p.code,
      name: p.name,
      type: p.type,
      sectionId: p.secId,
      sectionName: sec.name,
      unit: sec.unit,
      entryStatus: p.entryStatus,
      useStatus: p.useStatus,
      isKey: p.isKey,
      model: p.model,
      spec: p.spec,
      manufacturer: p.manufacturer,
      entryDate: p.entryDate,
      exitDate: p.exitDate,
      location: p.location,
      operator: p.operator,
      sortOrder: idx + 1,
    });

    if (p.isKey && p.archiveId) {
      archiveRows.push({
        archiveId: p.archiveId,
        equipmentCode: p.code,
        keyOrder: p.keyOrder ?? 99,
        inspectNo: p.inspectNo ?? 'JY-待补录',
        inspectDate: p.inspectDate ?? '—',
        validUntil: p.validUntil ?? '—',
        installValidUntil: p.installValidUntil ?? '—',
        missingDocs: Boolean(p.missingDocs),
      });

      for (const log of p.patrolLogs ?? []) {
        patrolRows.push({
          id: log.id,
          equipmentCode: p.code,
          patrolTime: log.time,
          content: log.content,
          status: log.status,
          inspector: log.inspector,
          detail: log.detail,
          sortOrder: patrolSeq++,
        });
      }
    }
  });

  // Remaining 101 on-site quotas: 在用 80, 待用 16, 停用 5
  let remInUse = 80;
  let remStandby = 16;
  let remStopped = 5;

  const pendingSlots: Array<{ secId: string; type: string; prefix: string; entryStatus: string }> = [];
  for (const sec of SECTIONS) {
    for (const t of EQUIP_TYPES) {
      for (let i = 0; i < remOnSite[sec.id][t.name]; i++) {
        pendingSlots.push({ secId: sec.id, type: t.name, prefix: t.prefix, entryStatus: '在场' });
      }
      for (let i = 0; i < remExited[sec.id][t.name]; i++) {
        pendingSlots.push({ secId: sec.id, type: t.name, prefix: t.prefix, entryStatus: '已退场' });
      }
    }
  }

  let keyIdx = 0;
  const seqBySecPrefix: Record<string, number> = {};

  function nextCode(prefix: string, secId: string): string {
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
      if (isKey && keyIdx === 3) {
        if (remStopped > 0) {
          remStopped--;
          useStatus = '停用';
        } else {
          remInUse--;
          useStatus = '在用';
        }
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
    const exitDate =
      slot.entryStatus === '已退场' ? `2026-11-${String(10 + (idx % 14)).padStart(2, '0')}` : '—';
    const loc =
      slot.type === '架桥机' || slot.type === '起重设备'
        ? sec.yard
        : slot.type === '路面设备' || slot.type === '土石方设备'
          ? sec.road
          : sec.bridge;

    equipmentRows.push({
      code,
      name: tpl.name,
      type: slot.type,
      sectionId: slot.secId,
      sectionName: sec.name,
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
      sortOrder: pinnedDefs.length + idx + 1,
    });

    if (isKey) {
      const validUntil = remainingKeyDates[keyIdx] || '2027-06-15';
      const missingDocs = validUntil === '—';
      const inspectDate = missingDocs ? '—' : `${Number(validUntil.slice(0, 4)) - 1}-${validUntil.slice(5)}`;
      const installMonth = String(
        Math.min(12, Math.max(1, Number(validUntil === '—' ? '06' : validUntil.slice(5, 7)) + 2))
      ).padStart(2, '0');

      archiveRows.push({
        archiveId: `DA-${code.replace(/-/g, '')}`,
        equipmentCode: code,
        keyOrder: 8 + keyIdx,
        inspectNo: missingDocs ? 'JY-待补录' : `JY-2026-${String(410 + keyIdx).padStart(4, '0')}`,
        inspectDate,
        validUntil,
        installValidUntil: missingDocs ? '—' : `${validUntil.slice(0, 4)}-${installMonth}-${validUntil.slice(8)}`,
        missingDocs,
      });

      const logCount = keyIdx < 9 ? 2 : 1;
      for (let j = 0; j < logCount; j++) {
        const d = String(24 - ((keyIdx + j) % 14)).padStart(2, '0');
        const hh = String(9 + ((keyIdx + j) % 7)).padStart(2, '0');
        const mm = String(15 + ((keyIdx * 7 + j * 13) % 40)).padStart(2, '0');
        const topics = [
          '起重设备例行巡查',
          '限位装置与制动系统检查',
          '钢丝绳及吊具安全核查',
          '作业前支腿与风速仪点检',
        ];
        const states = ['记录正常', '已处理', '已归档'];
        patrolRows.push({
          id: `XC-202611${d}-${String(100 + keyIdx * 3 + j).slice(-3)}`,
          equipmentCode: code,
          patrolTime: `11-${d} ${hh}:${mm}`,
          content: topics[(keyIdx + j) % topics.length],
          status: states[(keyIdx + j) % states.length],
          inspector: INSPECTORS[(keyIdx + j) % INSPECTORS.length],
          detail: `对 ${sec.name} ${tpl.name}（${code}）开展安全专项巡查，安全装置及作业环境受控。`,
          sortOrder: patrolSeq++,
        });
      }
      keyIdx++;
    }
  });

  return { equipmentRows, archiveRows, patrolRows };
}

export async function seedM06(dbInstance: Database = db) {
  const { equipmentRows, archiveRows, patrolRows } = buildReconciledM06Seed();

  await dbInstance.insert(machineEquipment).values(equipmentRows).onConflictDoNothing();
  await dbInstance.insert(machineKeyArchives).values(archiveRows).onConflictDoNothing();
  await dbInstance.insert(machinePatrolLogs).values(patrolRows).onConflictDoNothing();
  await dbInstance
    .insert(machineReminderConfig)
    .values({
      id: 'default',
      dateField: 'validUntil',
      remindDays: 30,
      notifySystem: true,
      notifySms: false,
      autoBlockExpired: true,
      updatedBy: 'system',
    })
    .onConflictDoNothing();
}
