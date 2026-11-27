import type { db } from '@/db';
import {
  measureContracts,
  measurePeriods,
  measureRecords,
  measurePhysicalItems,
} from '@/db/schema/domains/m08';

export const SEED_CONTRACTS = [
  {
    sectionId: 'sec1',
    sectionName: '一工区',
    contractCode: 'A1合同段',
    stakeRange: 'K0+000 ~ K24+500',
    supervisor: '第一总监办',
    cumBaseAmount: 10050.4,
    paidReturnAmount: 1100.0,
    payReturned: true,
    sortOrder: 1,
  },
  {
    sectionId: 'sec2',
    sectionName: '二工区',
    contractCode: 'A2合同段',
    stakeRange: 'K24+500 ~ K48+200',
    supervisor: '第二总监办',
    cumBaseAmount: 12864.6,
    paidReturnAmount: 1520.0,
    payReturned: true,
    sortOrder: 2,
  },
  {
    sectionId: 'sec3',
    sectionName: '三工区',
    contractCode: 'A3合同段',
    stakeRange: 'K48+200 ~ K72+800',
    supervisor: '第二总监办',
    cumBaseAmount: 9754.2,
    paidReturnAmount: 1086.4,
    payReturned: true,
    sortOrder: 3,
  },
  {
    sectionId: 'sec4',
    sectionName: '四工区',
    contractCode: 'A4合同段',
    stakeRange: 'K72+800 ~ K96+000',
    supervisor: '第三总监办',
    cumBaseAmount: 11996.8,
    paidReturnAmount: 1350.1,
    payReturned: true,
    sortOrder: 4,
  },
  {
    sectionId: 'sec5',
    sectionName: '五工区',
    contractCode: 'A5合同段',
    stakeRange: 'K96+000 ~ K121+400',
    supervisor: '第三总监办',
    cumBaseAmount: 10742.0,
    paidReturnAmount: 1262.6,
    payReturned: true,
    sortOrder: 5,
  },
  {
    sectionId: 'sec6',
    sectionName: '六工区',
    contractCode: 'A6合同段',
    stakeRange: 'K121+400 ~ K146+800',
    supervisor: '第四总监办',
    cumBaseAmount: 8174.4,
    paidReturnAmount: 0,
    payReturned: false,
    sortOrder: 6,
  },
];

export const SEED_PERIODS = [
  {
    period: '2026年06月',
    shortLabel: '6月',
    totalAmount: 6810.3,
    cumTotalAmount: 6810.3,
    scaleFactor: 6810.3 / 8426.8,
    sortOrder: 1,
  },
  {
    period: '2026年07月',
    shortLabel: '7月',
    totalAmount: 8425.7,
    cumTotalAmount: 15236.0,
    scaleFactor: 8425.7 / 8426.8,
    sortOrder: 2,
  },
  {
    period: '2026年08月',
    shortLabel: '8月',
    totalAmount: 10985.2,
    cumTotalAmount: 26221.2,
    scaleFactor: 10985.2 / 8426.8,
    sortOrder: 3,
  },
  {
    period: '2026年09月',
    shortLabel: '9月',
    totalAmount: 13526.4,
    cumTotalAmount: 39747.6,
    scaleFactor: 13526.4 / 8426.8,
    sortOrder: 4,
  },
  {
    period: '2026年10月',
    shortLabel: '10月',
    totalAmount: 15408.0,
    cumTotalAmount: 55155.6,
    scaleFactor: 15408.0 / 8426.8,
    sortOrder: 5,
  },
  {
    period: '2026年11月',
    shortLabel: '11月',
    totalAmount: 8426.8,
    cumTotalAmount: 63582.4,
    scaleFactor: 1,
    sortOrder: 6,
  },
];

// 36 Nov records: 24 已确认 (8,426.80 万元), 8 审核中, 4 待审核
// Payment status: 12 已支付, 5 办理中, 7 待支付, 12 未回传
export const SEED_RECORDS_NOV = [
  // Top 6 featured records aligned with mockups 01 and 04
  { id: 'JL-A2-202611-018', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '路基土方', period: '2026年11月', amount: 636.5, status: '已确认', payStatus: '已支付', paidAmount: 636.5, payTime: '11-25 16:40', syncTime: '2026-11-26 10:45', stakeRange: 'K26+100 ~ K31+400', qtyDesc: '填方 14.2 万m³ / 挖方 3.8 万m³', reviewer: '第二总监办 · 周志远', sortOrder: 1 },
  { id: 'JL-A1-202611-011', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 284.7, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K08+400 ~ K12+200', qtyDesc: '钻孔灌注桩 24 根（φ1.5m）', reviewer: '第一总监办 · 王宁', sortOrder: 2 },
  { id: 'JL-A3-202611-019', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '水稳基层', period: '2026年11月', amount: 320.5, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K51+200 ~ K56+800', qtyDesc: '水泥稳定碎石基层 4.8 万m²', reviewer: '第二总监办 · 孙凯', sortOrder: 3 },
  { id: 'JL-A4-202611-023', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '沥青中面层', period: '2026年11月', amount: 312.8, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K74+500 ~ K79+100', qtyDesc: 'AC-20C 改性沥青中面层 3.4 万m²', reviewer: '第三总监办 · 赵磊', sortOrder: 4 },
  { id: 'JL-A5-202611-027', sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', workItem: '桥梁预制梁', period: '2026年11月', amount: 216.3, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K99+600 ~ K104+200', qtyDesc: '30m 预应力箱梁预制与安装 18 片', reviewer: '第三总监办 · 林峰', sortOrder: 5 },
  { id: 'JL-A6-202611-031', sectionId: 'sec6', sectionName: '六工区', contractCode: 'A6合同段', workItem: '路基防护', period: '2026年11月', amount: 168.2, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K124+800 ~ K130+400', qtyDesc: '拱形骨架护坡及急流槽 6,200 m³', reviewer: '第四总监办 · 韩涛', sortOrder: 6 },

  // sec1 remaining 5 (total 6, 4 confirmed = 1,420.50)
  { id: 'JL-A1-202611-005', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '路基土方', period: '2026年11月', amount: 468.2, status: '已确认', payStatus: '已支付', paidAmount: 468.2, payTime: '11-25 14:20', syncTime: '2026-11-26 10:45', stakeRange: 'K01+200 ~ K06+800', qtyDesc: '路基清表与分层填筑 11.6 万m³', reviewer: '第一总监办 · 王宁', sortOrder: 7 },
  { id: 'JL-A1-202611-008', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '桥梁预制梁', period: '2026年11月', amount: 386.4, status: '已确认', payStatus: '已支付', paidAmount: 386.4, payTime: '11-24 16:50', syncTime: '2026-11-26 10:45', stakeRange: 'K14+000 ~ K18+300', qtyDesc: '30m 箱梁预制架设 32 片', reviewer: '第一总监办 · 王宁', sortOrder: 8 },
  { id: 'JL-A1-202611-015', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '水稳基层', period: '2026年11月', amount: 281.2, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K18+500 ~ K22+100', qtyDesc: '底基层及基层摊铺 4.2 万m²', reviewer: '第一总监办 · 王宁', sortOrder: 9 },
  { id: 'JL-A1-202611-017', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '沥青中面层', period: '2026年11月', amount: 215.6, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K22+100 ~ K24+500', qtyDesc: '沥青混凝土中面层 2.3 万m²', reviewer: '第一总监办 · 王宁', sortOrder: 10 },
  { id: 'JL-A1-202611-022', sectionId: 'sec1', sectionName: '一工区', contractCode: 'A1合同段', workItem: '路基防护', period: '2026年11月', amount: 136.4, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K04+500 ~ K07+900', qtyDesc: '边坡排水沟及挡土墙砌筑', reviewer: '第一总监办 · 王宁', sortOrder: 11 },

  // sec2 remaining 7 (total 8, 6 confirmed = 1,867.20)
  { id: 'JL-A2-202611-014', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 424.6, status: '已确认', payStatus: '已支付', paidAmount: 424.6, payTime: '11-25 15:10', syncTime: '2026-11-26 10:45', stakeRange: 'K33+200 ~ K36+800', qtyDesc: '桥梁钻孔灌注桩 34 根（φ1.6m）', reviewer: '第二总监办 · 周志远', sortOrder: 12 },
  { id: 'JL-A2-202611-021', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '桥梁预制梁', period: '2026年11月', amount: 315.2, status: '已确认', payStatus: '已支付', paidAmount: 315.2, payTime: '11-24 17:20', syncTime: '2026-11-26 10:45', stakeRange: 'K37+100 ~ K40+500', qtyDesc: '40m 预应力T梁及箱梁 26 片', reviewer: '第二总监办 · 周志远', sortOrder: 13 },
  { id: 'JL-A2-202611-025', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '水稳基层', period: '2026年11月', amount: 143.7, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K41+000 ~ K43+600', qtyDesc: '左幅水稳上基层 2.1 万m²', reviewer: '第二总监办 · 周志远', sortOrder: 14 },
  { id: 'JL-A2-202611-026', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '水稳基层', period: '2026年11月', amount: 142.6, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K43+600 ~ K46+000', qtyDesc: '右幅水稳上基层 2.1 万m²', reviewer: '第二总监办 · 周志远', sortOrder: 15 },
  { id: 'JL-A2-202611-029', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '沥青中面层', period: '2026年11月', amount: 204.6, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K46+000 ~ K48+200', qtyDesc: '沥青中面层试铺及连续摊铺 2.2 万m²', reviewer: '第二总监办 · 周志远', sortOrder: 16 },
  { id: 'JL-A2-202611-032', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '路基土方', period: '2026年11月', amount: 185.4, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K31+400 ~ K33+100', qtyDesc: '高填方路堤强夯及土方补填', reviewer: '第二总监办 · 周志远', sortOrder: 17 },
  { id: 'JL-A2-202611-035', sectionId: 'sec2', sectionName: '二工区', contractCode: 'A2合同段', workItem: '路基防护', period: '2026年11月', amount: 118.0, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K28+000 ~ K30+500', qtyDesc: '边坡预制块六角护坡工程', reviewer: '第二总监办 · 周志远', sortOrder: 18 },

  // sec3 remaining 5 (total 6, 4 confirmed = 1,376.40)
  { id: 'JL-A3-202611-006', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '路基土方', period: '2026年11月', amount: 462.8, status: '已确认', payStatus: '已支付', paidAmount: 462.8, payTime: '11-25 13:50', syncTime: '2026-11-26 10:45', stakeRange: 'K48+200 ~ K51+200', qtyDesc: '路基土石方调配填筑 10.8 万m³', reviewer: '第二总监办 · 孙凯', sortOrder: 19 },
  { id: 'JL-A3-202611-010', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 358.2, status: '已确认', payStatus: '已支付', paidAmount: 358.2, payTime: '11-24 15:30', syncTime: '2026-11-26 10:45', stakeRange: 'K57+000 ~ K61+400', qtyDesc: '跨河大桥主墩桩基 28 根', reviewer: '第二总监办 · 孙凯', sortOrder: 20 },
  { id: 'JL-A3-202611-014', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '桥梁预制梁', period: '2026年11月', amount: 265.4, status: '已确认', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K62+000 ~ K66+800', qtyDesc: '25m/30m 预制箱梁 22 片', reviewer: '第二总监办 · 孙凯', sortOrder: 21 },
  { id: 'JL-A3-202611-021', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '沥青中面层', period: '2026年11月', amount: 290.0, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K67+000 ~ K71+500', qtyDesc: '改性沥青中面层 3.1 万m²', reviewer: '第二总监办 · 孙凯', sortOrder: 22 },
  { id: 'JL-A3-202611-024', sectionId: 'sec3', sectionName: '三工区', contractCode: 'A3合同段', workItem: '路基防护', period: '2026年11月', amount: 142.3, status: '审核中', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K71+500 ~ K72+800', qtyDesc: '路堑边坡锚杆框架梁防护', reviewer: '第二总监办 · 孙凯', sortOrder: 23 },

  // sec4 remaining 6 (total 7, 5 confirmed = 1,549.80)
  { id: 'JL-A4-202611-004', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '路基土方', period: '2026年11月', amount: 485.6, status: '已确认', payStatus: '已支付', paidAmount: 485.6, payTime: '11-25 11:45', syncTime: '2026-11-26 10:45', stakeRange: 'K79+200 ~ K84+500', qtyDesc: '黑土区表土剥离及路堤填筑 11.2 万m³', reviewer: '第三总监办 · 赵磊', sortOrder: 24 },
  { id: 'JL-A4-202611-009', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 342.5, status: '已确认', payStatus: '已支付', paidAmount: 342.5, payTime: '11-24 14:15', syncTime: '2026-11-26 10:45', stakeRange: 'K84+800 ~ K88+400', qtyDesc: '分离立交及通道桥桩基 27 根', reviewer: '第三总监办 · 赵磊', sortOrder: 25 },
  { id: 'JL-A4-202611-013', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '桥梁预制梁', period: '2026年11月', amount: 248.9, status: '已确认', payStatus: '已支付', paidAmount: 248.9, payTime: '11-23 17:10', syncTime: '2026-11-26 10:45', stakeRange: 'K88+600 ~ K92+100', qtyDesc: '30m 预制箱梁架设 20 片', reviewer: '第三总监办 · 赵磊', sortOrder: 26 },
  { id: 'JL-A4-202611-017', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '水稳基层', period: '2026年11月', amount: 160.0, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K92+200 ~ K96+000', qtyDesc: '双层连铺水稳碎石基层 2.4 万m²', reviewer: '第三总监办 · 赵磊', sortOrder: 27 },
  { id: 'JL-A4-202611-026', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '路基土方', period: '2026年11月', amount: 198.4, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K72+800 ~ K74+500', qtyDesc: '软基换填砂砾及路床精平', reviewer: '第三总监办 · 赵磊', sortOrder: 28 },
  { id: 'JL-A4-202611-030', sectionId: 'sec4', sectionName: '四工区', contractCode: 'A4合同段', workItem: '水稳基层', period: '2026年11月', amount: 154.2, status: '审核中', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K76+100 ~ K78+900', qtyDesc: '水稳底基层补段施工 2.3 万m²', reviewer: '第三总监办 · 赵磊', sortOrder: 29 },

  // sec5 remaining 4 (total 5, 3 confirmed = 1,262.60)
  { id: 'JL-A5-202611-007', sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', workItem: '路基土方', period: '2026年11月', amount: 512.4, status: '已确认', payStatus: '已支付', paidAmount: 512.4, payTime: '11-25 15:30', syncTime: '2026-11-26 10:45', stakeRange: 'K96+000 ~ K99+600', qtyDesc: '路基土方压实成型 11.8 万m³', reviewer: '第三总监办 · 林峰', sortOrder: 30 },
  { id: 'JL-A5-202611-012', sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 428.0, status: '已确认', payStatus: '已支付', paidAmount: 428.0, payTime: '11-24 16:05', syncTime: '2026-11-26 10:45', stakeRange: 'K104+500 ~ K110+200', qtyDesc: '互通匝道桥及主线桥桩基 35 根', reviewer: '第三总监办 · 林峰', sortOrder: 31 },
  { id: 'JL-A5-202611-018', sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', workItem: '水稳基层', period: '2026年11月', amount: 322.2, status: '已确认', payStatus: '办理中', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K110+500 ~ K118+000', qtyDesc: '全幅水稳碎石基层 4.9 万m²', reviewer: '第三总监办 · 林峰', sortOrder: 32 },
  { id: 'JL-A5-202611-029', sectionId: 'sec5', sectionName: '五工区', contractCode: 'A5合同段', workItem: '沥青中面层', period: '2026年11月', amount: 175.8, status: '审核中', payStatus: '待支付', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K118+000 ~ K121+400', qtyDesc: '沥青中面层摊铺 1.9 万m²', reviewer: '第三总监办 · 林峰', sortOrder: 33 },

  // sec6 remaining 3 (total 4, 2 confirmed = 950.30, all unreturned)
  { id: 'JL-A6-202611-009', sectionId: 'sec6', sectionName: '六工区', contractCode: 'A6合同段', workItem: '路基土方', period: '2026年11月', amount: 536.8, status: '已确认', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K121+400 ~ K124+800', qtyDesc: '建华枢纽互通区土方填筑 12.4 万m³', reviewer: '第四总监办 · 韩涛', sortOrder: 34 },
  { id: 'JL-A6-202611-016', sectionId: 'sec6', sectionName: '六工区', contractCode: 'A6合同段', workItem: '桥梁桩基', period: '2026年11月', amount: 413.5, status: '已确认', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K131+000 ~ K140+200', qtyDesc: '枢纽主线桥及跨线桥桩基 32 根', reviewer: '第四总监办 · 韩涛', sortOrder: 35 },
  { id: 'JL-A6-202611-034', sectionId: 'sec6', sectionName: '六工区', contractCode: 'A6合同段', workItem: '水稳基层', period: '2026年11月', amount: 145.6, status: '待审核', payStatus: '未回传', paidAmount: 0, payTime: '—', syncTime: '2026-11-26 10:45', stakeRange: 'K140+500 ~ K146+800', qtyDesc: '终点衔接段水稳基层 2.2 万m²', reviewer: '第四总监办 · 韩涛', sortOrder: 36 },
];

export const SEED_PHYSICAL_ITEMS = [
  // sec1
  { sectionId: 'sec1', workItem: '路基土方', unit: '万m³', contractQty: 108.0, measuredQty: 66.4, physicalQty: 72.1, periodAmount: 468.2, linkedRecordId: 'JL-A1-202611-005', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec1', workItem: '桥梁桩基', unit: '根', contractQty: 132, measuredQty: 98, physicalQty: 105, periodAmount: 284.7, linkedRecordId: 'JL-A1-202611-011', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec1', workItem: '桥梁预制梁', unit: '片', contractQty: 190, measuredQty: 120, physicalQty: 131, periodAmount: 386.4, linkedRecordId: 'JL-A1-202611-008', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec1', workItem: '水稳基层', unit: '万m²', contractQty: 56.0, measuredQty: 27.6, physicalQty: 30.8, periodAmount: 281.2, linkedRecordId: 'JL-A1-202611-015', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec1', workItem: '沥青中面层', unit: '万m²', contractQty: 46.0, measuredQty: 14.2, physicalQty: 16.5, periodAmount: 0.0, linkedRecordId: 'JL-A1-202611-017', period: '2026年11月', sortOrder: 5 },
  // sec2
  { sectionId: 'sec2', workItem: '路基土方', unit: '万m³', contractQty: 120.0, measuredQty: 68.2, physicalQty: 74.8, periodAmount: 636.5, linkedRecordId: 'JL-A2-202611-018', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec2', workItem: '桥梁桩基', unit: '根', contractQty: 156, measuredQty: 112, physicalQty: 120, periodAmount: 424.6, linkedRecordId: 'JL-A2-202611-014', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec2', workItem: '桥梁预制梁', unit: '片', contractQty: 220, measuredQty: 132, physicalQty: 146, periodAmount: 315.2, linkedRecordId: 'JL-A2-202611-021', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec2', workItem: '水稳基层', unit: '万m²', contractQty: 64.0, measuredQty: 28.4, physicalQty: 31.6, periodAmount: 286.3, linkedRecordId: 'JL-A2-202611-025', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec2', workItem: '沥青中面层', unit: '万m²', contractQty: 52.0, measuredQty: 16.8, physicalQty: 18.4, periodAmount: 204.6, linkedRecordId: 'JL-A2-202611-029', period: '2026年11月', sortOrder: 5 },
  // sec3
  { sectionId: 'sec3', workItem: '路基土方', unit: '万m³', contractQty: 112.0, measuredQty: 61.5, physicalQty: 67.2, periodAmount: 462.8, linkedRecordId: 'JL-A3-202611-006', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec3', workItem: '桥梁桩基', unit: '根', contractQty: 140, measuredQty: 96, physicalQty: 104, periodAmount: 358.2, linkedRecordId: 'JL-A3-202611-010', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec3', workItem: '桥梁预制梁', unit: '片', contractQty: 180, measuredQty: 102, physicalQty: 115, periodAmount: 265.4, linkedRecordId: 'JL-A3-202611-014', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec3', workItem: '水稳基层', unit: '万m²', contractQty: 58.0, measuredQty: 24.0, physicalQty: 27.9, periodAmount: 0.0, linkedRecordId: 'JL-A3-202611-019', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec3', workItem: '沥青中面层', unit: '万m²', contractQty: 48.0, measuredQty: 15.1, physicalQty: 16.8, periodAmount: 290.0, linkedRecordId: 'JL-A3-202611-021', period: '2026年11月', sortOrder: 5 },
  // sec4
  { sectionId: 'sec4', workItem: '路基土方', unit: '万m³', contractQty: 115.0, measuredQty: 64.8, physicalQty: 71.0, periodAmount: 485.6, linkedRecordId: 'JL-A4-202611-004', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec4', workItem: '桥梁桩基', unit: '根', contractQty: 148, measuredQty: 106, physicalQty: 114, periodAmount: 342.5, linkedRecordId: 'JL-A4-202611-009', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec4', workItem: '桥梁预制梁', unit: '片', contractQty: 196, measuredQty: 118, physicalQty: 129, periodAmount: 248.9, linkedRecordId: 'JL-A4-202611-013', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec4', workItem: '水稳基层', unit: '万m²', contractQty: 60.0, measuredQty: 26.2, physicalQty: 29.4, periodAmount: 160.0, linkedRecordId: 'JL-A4-202611-017', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec4', workItem: '沥青中面层', unit: '万m²', contractQty: 50.0, measuredQty: 17.6, physicalQty: 19.2, periodAmount: 312.8, linkedRecordId: 'JL-A4-202611-023', period: '2026年11月', sortOrder: 5 },
  // sec5
  { sectionId: 'sec5', workItem: '路基土方', unit: '万m³', contractQty: 106.0, measuredQty: 60.2, physicalQty: 66.8, periodAmount: 512.4, linkedRecordId: 'JL-A5-202611-007', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec5', workItem: '桥梁桩基', unit: '根', contractQty: 136, measuredQty: 94, physicalQty: 102, periodAmount: 428.0, linkedRecordId: 'JL-A5-202611-012', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec5', workItem: '桥梁预制梁', unit: '片', contractQty: 176, measuredQty: 98, physicalQty: 110, periodAmount: 0.0, linkedRecordId: 'JL-A5-202611-027', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec5', workItem: '水稳基层', unit: '万m²', contractQty: 54.0, measuredQty: 25.0, physicalQty: 27.6, periodAmount: 322.2, linkedRecordId: 'JL-A5-202611-018', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec5', workItem: '沥青中面层', unit: '万m²', contractQty: 44.0, measuredQty: 13.4, physicalQty: 15.1, periodAmount: 0.0, linkedRecordId: 'JL-A5-202611-029', period: '2026年11月', sortOrder: 5 },
  // sec6
  { sectionId: 'sec6', workItem: '路基土方', unit: '万m³', contractQty: 118.0, measuredQty: 62.4, physicalQty: 69.5, periodAmount: 536.8, linkedRecordId: 'JL-A6-202611-009', period: '2026年11月', sortOrder: 1 },
  { sectionId: 'sec6', workItem: '桥梁桩基', unit: '根', contractQty: 164, measuredQty: 108, physicalQty: 116, periodAmount: 413.5, linkedRecordId: 'JL-A6-202611-016', period: '2026年11月', sortOrder: 2 },
  { sectionId: 'sec6', workItem: '桥梁预制梁', unit: '片', contractQty: 210, measuredQty: 105, physicalQty: 118, periodAmount: 0.0, linkedRecordId: 'JL-A6-202611-009', period: '2026年11月', sortOrder: 3 },
  { sectionId: 'sec6', workItem: '水稳基层', unit: '万m²', contractQty: 62.0, measuredQty: 21.8, physicalQty: 24.9, periodAmount: 0.0, linkedRecordId: 'JL-A6-202611-034', period: '2026年11月', sortOrder: 4 },
  { sectionId: 'sec6', workItem: '沥青中面层', unit: '万m²', contractQty: 54.0, measuredQty: 12.0, physicalQty: 14.2, periodAmount: 0.0, linkedRecordId: 'JL-A6-202611-031', period: '2026年11月', sortOrder: 5 },
];

export async function seedM08(dbInstance: typeof db) {
  for (const c of SEED_CONTRACTS) {
    await dbInstance
      .insert(measureContracts)
      .values(c)
      .onConflictDoUpdate({
        target: measureContracts.sectionId,
        set: {
          sectionName: c.sectionName,
          contractCode: c.contractCode,
          stakeRange: c.stakeRange,
          supervisor: c.supervisor,
          cumBaseAmount: c.cumBaseAmount,
          paidReturnAmount: c.paidReturnAmount,
          payReturned: c.payReturned,
          sortOrder: c.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  for (const p of SEED_PERIODS) {
    await dbInstance
      .insert(measurePeriods)
      .values(p)
      .onConflictDoUpdate({
        target: measurePeriods.period,
        set: {
          shortLabel: p.shortLabel,
          totalAmount: p.totalAmount,
          cumTotalAmount: p.cumTotalAmount,
          scaleFactor: p.scaleFactor,
          sortOrder: p.sortOrder,
        },
      });
  }

  for (const r of SEED_RECORDS_NOV) {
    await dbInstance
      .insert(measureRecords)
      .values(r)
      .onConflictDoNothing({
        target: measureRecords.id,
      });
  }

  for (const item of SEED_PHYSICAL_ITEMS) {
    await dbInstance
      .insert(measurePhysicalItems)
      .values(item)
      .onConflictDoUpdate({
        target: [
          measurePhysicalItems.sectionId,
          measurePhysicalItems.period,
          measurePhysicalItems.workItem,
        ],
        set: {
          unit: item.unit,
          contractQty: item.contractQty,
          measuredQty: item.measuredQty,
          physicalQty: item.physicalQty,
          periodAmount: item.periodAmount,
          linkedRecordId: item.linkedRecordId,
          sortOrder: item.sortOrder,
          updatedAt: new Date(),
        },
      });
  }
}
