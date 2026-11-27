import { db, type Database } from '@/db';
import {
  materialArrivalBatches,
  materialInventoryItems,
  materialReports,
  materialYards,
  type BatchTestItem,
  type MaterialBatchCounts,
  type ReportHistoryEntry,
} from '@/db/schema/domains/m07';
import {
  DEFAULT_YARDS,
  MATERIAL_META,
  MATERIAL_PERIODS,
  MATERIAL_TYPES,
  YARD_BY_SECTION_ID,
} from './types';

interface BaseInventorySeed {
  id: string;
  secId: string;
  material: string;
  plan: number;
  arrival: number;
  physical: number;
  quarantine: number;
  status: string;
  batches: MaterialBatchCounts;
}

const BASE_INVENTORY: BaseInventorySeed[] = [
  // Top 5 priority rows matching 01_备料总览.png table order verbatim
  { id: 'inv-sec2-ss', secId: 'sec2', material: '碎石', plan: 12000, arrival: 8750, physical: 3020, quarantine: 260, status: '部分待检', batches: { pass: 5, pending: 2, recheck: 0, fail: 0 } },
  { id: 'inv-sec2-jzs', secId: 'sec2', material: '机制砂', plan: 6000, arrival: 4200, physical: 1520, quarantine: 120, status: '部分待检', batches: { pass: 3, pending: 1, recheck: 0, fail: 0 } },
  { id: 'inv-sec1-ss', secId: 'sec1', material: '碎石', plan: 10000, arrival: 8200, physical: 2730, quarantine: 0, status: '已合格', batches: { pass: 4, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec4-ss', secId: 'sec4', material: '碎石', plan: 11000, arrival: 8250, physical: 2940, quarantine: 160, status: '部分待检', batches: { pass: 4, pending: 1, recheck: 0, fail: 0 } },
  { id: 'inv-sec3-sn', secId: 'sec3', material: '水泥', plan: 3300, arrival: 2700, physical: 880, quarantine: 80, status: '部分待检', batches: { pass: 2, pending: 1, recheck: 0, fail: 0 } },

  // Remaining sec2 (料场示例A) materials
  { id: 'inv-sec2-sn', secId: 'sec2', material: '水泥', plan: 3800, arrival: 3200, physical: 970, quarantine: 50, status: '复检中', batches: { pass: 2, pending: 0, recheck: 1, fail: 0 } },
  { id: 'inv-sec2-kf', secId: 'sec2', material: '矿粉', plan: 1200, arrival: 910, physical: 290, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec2-gj', secId: 'sec2', material: '钢筋', plan: 1500, arrival: 1190, physical: 420, quarantine: 40, status: '含隔离批次', batches: { pass: 1, pending: 0, recheck: 0, fail: 1 } },

  // Remaining sec1 (材料场A) materials
  { id: 'inv-sec1-jzs', secId: 'sec1', material: '机制砂', plan: 5200, arrival: 4050, physical: 1410, quarantine: 0, status: '已合格', batches: { pass: 2, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec1-sn', secId: 'sec1', material: '水泥', plan: 3400, arrival: 2750, physical: 860, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec1-kf', secId: 'sec1', material: '矿粉', plan: 1100, arrival: 880, physical: 280, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec1-gj', secId: 'sec1', material: '钢筋', plan: 1400, arrival: 1120, physical: 390, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

  // Remaining sec3 (料场示例C) materials
  { id: 'inv-sec3-ss', secId: 'sec3', material: '碎石', plan: 10200, arrival: 8200, physical: 2680, quarantine: 0, status: '已合格', batches: { pass: 2, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec3-jzs', secId: 'sec3', material: '机制砂', plan: 5200, arrival: 4100, physical: 1340, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec3-kf', secId: 'sec3', material: '矿粉', plan: 1100, arrival: 870, physical: 270, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec3-gj', secId: 'sec3', material: '钢筋', plan: 1400, arrival: 1130, physical: 370, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

  // Remaining sec4 (料场示例B) materials
  { id: 'inv-sec4-jzs', secId: 'sec4', material: '机制砂', plan: 5600, arrival: 4400, physical: 1450, quarantine: 55, status: '部分待检', batches: { pass: 1, pending: 1, recheck: 0, fail: 0 } },
  { id: 'inv-sec4-sn', secId: 'sec4', material: '水泥', plan: 3600, arrival: 3020, physical: 910, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec4-kf', secId: 'sec4', material: '矿粉', plan: 1250, arrival: 1030, physical: 310, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec4-gj', secId: 'sec4', material: '钢筋', plan: 1550, arrival: 1300, physical: 410, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

  // sec5 (料场示例D) materials
  { id: 'inv-sec5-ss', secId: 'sec5', material: '碎石', plan: 9400, arrival: 7550, physical: 2420, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec5-jzs', secId: 'sec5', material: '机制砂', plan: 4800, arrival: 3750, physical: 1240, quarantine: 50, status: '复检中', batches: { pass: 0, pending: 0, recheck: 1, fail: 0 } },
  { id: 'inv-sec5-sn', secId: 'sec5', material: '水泥', plan: 3000, arrival: 2360, physical: 790, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec5-kf', secId: 'sec5', material: '矿粉', plan: 1050, arrival: 830, physical: 260, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec5-gj', secId: 'sec5', material: '钢筋', plan: 1250, arrival: 1010, physical: 340, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },

  // sec6 (料场示例E) materials
  { id: 'inv-sec6-ss', secId: 'sec6', material: '碎石', plan: 8850, arrival: 7000, physical: 2350, quarantine: 0, status: '已合格', batches: { pass: 1, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec6-jzs', secId: 'sec6', material: '机制砂', plan: 4540, arrival: 3500, physical: 1180, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec6-sn', secId: 'sec6', material: '水泥', plan: 2970, arrival: 2150, physical: 760, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec6-kf', secId: 'sec6', material: '矿粉', plan: 1040, arrival: 800, physical: 250, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
  { id: 'inv-sec6-gj', secId: 'sec6', material: '钢筋', plan: 1190, arrival: 950, physical: 330, quarantine: 0, status: '已合格', batches: { pass: 0, pending: 0, recheck: 0, fail: 0 } },
];

const REPORTS_SEED: Array<{
  code: string;
  secId: string;
  version: string;
  reportDate: string;
  cutoff: string;
  cutoffFull: string;
  uploadTime: string;
  uploadFull: string;
  fieldCheck: string;
  confirmStatus: string;
  fileName: string;
  templateVer: string;
  currentBoardNotice: string;
  history: ReportHistoryEntry[];
  sortOrder: number;
}> = [
  {
    code: 'BL-20261126-A2',
    secId: 'sec2',
    version: 'V1.3',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:51',
    uploadFull: '2026-11-26 10:51',
    fieldCheck: '通过',
    confirmStatus: '待确认',
    fileName: '二工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '二工区看板当前使用 V1.2，确认时间 2026-11-26 10:42。',
    history: [
      { version: 'V1.3', time: '11-26 10:51', record: '字段检查通过', status: '待确认', uploader: '备料管理员A', rows: 5 },
      { version: 'V1.2', time: '11-26 10:42', record: '备料管理员A确认', status: '当前使用', uploader: '备料管理员A', rows: 5 },
      { version: 'V1.1', time: '11-25 17:30', record: '备料管理员A确认', status: '历史版本', uploader: '备料管理员A', rows: 5 },
    ],
    sortOrder: 1,
  },
  {
    code: 'BL-20261126-A1',
    secId: 'sec1',
    version: 'V1.2',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:41',
    uploadFull: '2026-11-26 10:41',
    fieldCheck: '通过',
    confirmStatus: '已确认',
    fileName: '一工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '一工区看板当前使用 V1.2，确认时间 2026-11-26 10:43。',
    history: [
      { version: 'V1.2', time: '11-26 10:43', record: '一工区材料主管确认', status: '当前使用', uploader: '材料员张博', rows: 5 },
      { version: 'V1.1', time: '11-25 17:20', record: '一工区材料主管确认', status: '历史版本', uploader: '材料员张博', rows: 5 },
    ],
    sortOrder: 2,
  },
  {
    code: 'BL-20261126-A3',
    secId: 'sec3',
    version: 'V1.0',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:43',
    uploadFull: '2026-11-26 10:43',
    fieldCheck: '通过',
    confirmStatus: '已确认',
    fileName: '三工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '三工区看板当前使用 V1.0，确认时间 2026-11-26 10:45。',
    history: [
      { version: 'V1.0', time: '11-26 10:45', record: '三工区材料主管确认', status: '当前使用', uploader: '材料员王晨', rows: 5 },
    ],
    sortOrder: 3,
  },
  {
    code: 'BL-20261126-A4',
    secId: 'sec4',
    version: 'V1.1',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:44',
    uploadFull: '2026-11-26 10:44',
    fieldCheck: '通过',
    confirmStatus: '已确认',
    fileName: '四工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '四工区看板当前使用 V1.1，确认时间 2026-11-26 10:46。',
    history: [
      { version: 'V1.1', time: '11-26 10:46', record: '四工区材料主管确认', status: '当前使用', uploader: '材料员赵宇', rows: 5 },
      { version: 'V1.0', time: '11-25 17:15', record: '四工区材料主管确认', status: '历史版本', uploader: '材料员赵宇', rows: 5 },
    ],
    sortOrder: 4,
  },
  {
    code: 'BL-20261126-A5',
    secId: 'sec5',
    version: 'V1.0',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:45',
    uploadFull: '2026-11-26 10:45',
    fieldCheck: '通过',
    confirmStatus: '已确认',
    fileName: '五工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '五工区看板当前使用 V1.0，确认时间 2026-11-26 10:47。',
    history: [
      { version: 'V1.0', time: '11-26 10:47', record: '五工区材料主管确认', status: '当前使用', uploader: '材料员陈思', rows: 5 },
    ],
    sortOrder: 5,
  },
  {
    code: 'BL-20261126-A6',
    secId: 'sec6',
    version: 'V1.0',
    reportDate: '2026-11-26',
    cutoff: '11-26 10:40',
    cutoffFull: '2026-11-26 10:40',
    uploadTime: '11-26 10:46',
    uploadFull: '2026-11-26 10:46',
    fieldCheck: '通过',
    confirmStatus: '已确认',
    fileName: '六工区备料报表_20261126.xlsx',
    templateVer: '备料固定模板 V1.0',
    currentBoardNotice: '六工区看板当前使用 V1.0，确认时间 2026-11-26 10:48。',
    history: [
      { version: 'V1.0', time: '11-26 10:48', record: '六工区材料主管确认', status: '当前使用', uploader: '材料员孙洁', rows: 5 },
    ],
    sortOrder: 6,
  },
];

interface BatchSeed {
  batchId: string;
  secId: string;
  material: string;
  spec: string;
  entryTime: string;
  videoTime: string;
  videoTimeShort: string;
  uavTime: string;
  uavTimeShort: string;
  uavFile: string;
  qty: number;
  status: string;
  reportId: string;
  inspectTime: string;
  inspectTimeShort: string;
  supplier: string;
  plateNo: string;
  quarantineNote?: string;
  items: BatchTestItem[];
}

function buildBatchesSeed(): BatchSeed[] {
  const sec2Batches: BatchSeed[] = [
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
        { name: '含泥量', pass: true, val: '0.6% (≤1.0%)', std: '≤1.0%' },
      ],
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
        { name: '亚甲蓝MB值', pass: null, val: '待检测', std: '<1.4' },
      ],
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
        { name: '3d抗压强度', pass: null, val: '平行样复检中', std: '≥17.0 MPa' },
      ],
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
        { name: '冷弯性能', pass: true, val: '无裂纹', std: '180°无裂纹' },
      ],
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
        { name: '流动度比', pass: true, val: '99%', std: '≥95%' },
      ],
    },
  ];

  const generated: BatchSeed[] = [...sec2Batches];
  const secConfigs = [
    { secId: 'sec1', prefix: '01', statuses: ['合格', '合格', '合格', '合格', '合格'] },
    { secId: 'sec3', prefix: '03', statuses: ['合格', '合格', '待检', '合格', '合格'] },
    { secId: 'sec4', prefix: '04', statuses: ['待检', '待检', '合格', '合格', '合格'] },
    { secId: 'sec5', prefix: '05', statuses: ['合格', '复检中', '合格', '合格', '合格'] },
    { secId: 'sec6', prefix: '06', statuses: ['合格', '合格', '合格', '合格', '合格'] },
  ];

  secConfigs.forEach((cfg) => {
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
        uavTime: '2026-11-26 09:42:10',
        uavTimeShort: '11-26 09:42:10',
        uavFile: `料场例行巡检 · IMG_${cfg.prefix}${idx + 11}.jpg`,
        qty: [640, 320, 180, 110, 95][idx],
        status: st,
        reportId: `JC-20261126-${cfg.prefix}${idx + 1}`,
        inspectTime:
          st === '合格'
            ? `2026-11-26 ${String(10 + idx).padStart(2, '0')}:15`
            : `2026-11-26 10:30（${st}）`,
        inspectTimeShort: `11-26 ${String(10 + idx).padStart(2, '0')}:15`,
        supplier: ['绥化鑫磊矿业', '北安兴源砂厂', '北方水泥直供', '建龙矿粉中心', '龙江钢铁中心'][idx],
        plateNo: `黑M·${cfg.prefix}${idx + 2}89`,
        quarantineNote: '',
        items: m.tests.map((t) => ({
          name: t,
          pass: st === '合格' ? true : null,
          val: st === '合格' ? '符合规范要求' : st === '复检中' ? '复检试验中' : '取样待检',
          std: 'JTG 规范标准',
        })),
      });
    });
  });

  return generated;
}

export async function seedM07(dbInstance: Database = db): Promise<void> {
  // 1. Seed 6 Yards
  for (const y of DEFAULT_YARDS) {
    await dbInstance
      .insert(materialYards)
      .values({
        id: y.id,
        sectionId: y.sectionId,
        sectionName: y.sectionName,
        name: y.name,
        stake: y.stake,
        gateStake: y.gateStake,
        camId: y.camId,
        uavId: y.uavId,
        waypoint: y.waypoint,
        labName: y.labName,
        reportCode: y.reportCode,
        activeVer: y.activeVer,
        lon: y.lon,
        lat: y.lat,
        sortOrder: y.sortOrder,
      })
      .onConflictDoUpdate({
        target: materialYards.id,
        set: {
          sectionId: y.sectionId,
          sectionName: y.sectionName,
          name: y.name,
          stake: y.stake,
          gateStake: y.gateStake,
          camId: y.camId,
          uavId: y.uavId,
          waypoint: y.waypoint,
          labName: y.labName,
          reportCode: y.reportCode,
          activeVer: y.activeVer,
          lon: y.lon,
          lat: y.lat,
          sortOrder: y.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  // 2. Seed 90 Period-Inventory rows (30 items × 3 periods)
  for (const periodObj of MATERIAL_PERIODS) {
    const s = periodObj.scale;
    for (let idx = 0; idx < BASE_INVENTORY.length; idx++) {
      const item = BASE_INVENTORY[idx];
      const yard = YARD_BY_SECTION_ID[item.secId];
      const meta = MATERIAL_META[item.material];
      const planQty = s === 1 ? item.plan : Math.round((item.plan * s) / 10) * 10;
      const arrivalQty = s === 1 ? item.arrival : Math.round((item.arrival * s) / 10) * 10;
      const physicalQty = s === 1 ? item.physical : Math.round((item.physical * s) / 10) * 10;
      const quarantineQty = s === 1 ? item.quarantine : Math.round((item.quarantine * s) / 5) * 5;
      const usableQty = Math.max(0, physicalQty - quarantineQty);
      const gapQty = Math.max(0, planQty - arrivalQty);
      const rowId = `${periodObj.id}_${item.id}`;

      await dbInstance
        .insert(materialInventoryItems)
        .values({
          id: rowId,
          baseId: item.id,
          period: periodObj.id,
          sectionId: item.secId,
          yardId: yard.id,
          yardName: yard.name,
          material: item.material,
          spec: meta.spec,
          planQty,
          arrivalQty,
          physicalQty,
          quarantineQty,
          usableQty,
          gapQty,
          status: item.status,
          batchCounts: item.batches,
          sortOrder: idx + 1,
        })
        .onConflictDoUpdate({
          target: materialInventoryItems.id,
          set: {
            baseId: item.id,
            period: periodObj.id,
            sectionId: item.secId,
            yardId: yard.id,
            yardName: yard.name,
            material: item.material,
            spec: meta.spec,
            planQty,
            arrivalQty,
            physicalQty,
            quarantineQty,
            usableQty,
            gapQty,
            status: item.status,
            batchCounts: item.batches,
            sortOrder: idx + 1,
            updatedAt: new Date(),
          },
        });
    }
  }

  // 3. Seed 6 Material Reports with history
  for (const rep of REPORTS_SEED) {
    const yard = YARD_BY_SECTION_ID[rep.secId];
    await dbInstance
      .insert(materialReports)
      .values({
        code: rep.code,
        sectionId: rep.secId,
        yardId: yard.id,
        version: rep.version,
        reportDate: rep.reportDate,
        cutoff: rep.cutoff,
        cutoffFull: rep.cutoffFull,
        uploadTime: rep.uploadTime,
        uploadFull: rep.uploadFull,
        fieldCheck: rep.fieldCheck,
        confirmStatus: rep.confirmStatus,
        fileName: rep.fileName,
        templateVer: rep.templateVer,
        currentBoardNotice: rep.currentBoardNotice,
        history: rep.history,
        sortOrder: rep.sortOrder,
      })
      .onConflictDoUpdate({
        target: materialReports.code,
        set: {
          sectionId: rep.secId,
          yardId: yard.id,
          version: rep.version,
          reportDate: rep.reportDate,
          cutoff: rep.cutoff,
          cutoffFull: rep.cutoffFull,
          uploadTime: rep.uploadTime,
          uploadFull: rep.uploadFull,
          fieldCheck: rep.fieldCheck,
          confirmStatus: rep.confirmStatus,
          fileName: rep.fileName,
          templateVer: rep.templateVer,
          currentBoardNotice: rep.currentBoardNotice,
          history: rep.history,
          sortOrder: rep.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  // 4. Seed 30 Arrival Batches
  const batchesSeed = buildBatchesSeed();
  for (let i = 0; i < batchesSeed.length; i++) {
    const b = batchesSeed[i];
    const yard = YARD_BY_SECTION_ID[b.secId];
    await dbInstance
      .insert(materialArrivalBatches)
      .values({
        batchId: b.batchId,
        sectionId: b.secId,
        yardId: yard.id,
        material: b.material,
        spec: b.spec,
        entryTime: b.entryTime,
        videoTime: b.videoTime,
        videoTimeShort: b.videoTimeShort,
        uavTime: b.uavTime,
        uavTimeShort: b.uavTimeShort,
        uavFile: b.uavFile,
        qty: b.qty,
        status: b.status,
        reportId: b.reportId,
        inspectTime: b.inspectTime,
        inspectTimeShort: b.inspectTimeShort,
        supplier: b.supplier,
        plateNo: b.plateNo,
        quarantineNote: b.quarantineNote ?? '',
        items: b.items,
        sortOrder: i + 1,
      })
      .onConflictDoUpdate({
        target: materialArrivalBatches.batchId,
        set: {
          sectionId: b.secId,
          yardId: yard.id,
          material: b.material,
          spec: b.spec,
          entryTime: b.entryTime,
          videoTime: b.videoTime,
          videoTimeShort: b.videoTimeShort,
          uavTime: b.uavTime,
          uavTimeShort: b.uavTimeShort,
          uavFile: b.uavFile,
          qty: b.qty,
          status: b.status,
          reportId: b.reportId,
          inspectTime: b.inspectTime,
          inspectTimeShort: b.inspectTimeShort,
          supplier: b.supplier,
          plateNo: b.plateNo,
          quarantineNote: b.quarantineNote ?? '',
          items: b.items,
          sortOrder: i + 1,
          updatedAt: new Date(),
        },
      });
  }
}
