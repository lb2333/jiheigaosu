import { db } from '@/db';
import {
  publishBoards,
  publishOrders,
  publishPlans,
  publishReceipts,
  publishTemplates,
} from '@/db/schema/domains/m13';

function buildBoardsSeed() {
  const rows = [
    { id: 'VMS-BT-A01', sectionId: 'sec1', pointName: '导改入口', stake: 'K16+720', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工导改提示', line1: '前方施工导改', line2: '请按标志通行', prevTitle: '施工区域安全提示 · V1.0', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '11-26 10:31:08', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-A02', sectionId: 'sec1', pointName: '导改中段', stake: 'K17+200', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '保通安全提示', line1: '保通便道通行', line2: '注意避让机械', prevTitle: '保通安全提示 · V1.0', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '—', feedbackStatus: '待确认显示' },
    { id: 'VMS-BT-A03', sectionId: 'sec1', pointName: '导改结束段', stake: 'K18+100', group: '施工保通组', groupDetail: '一工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: false, confirmedTitle: '通行提醒', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '通行提醒 · V1.0', prevLine1: '施工导改结束', prevLine2: '祝您一路平安', lastTime: '11-26 10:30', lastOrderId: 'FB-20261126-007', verifyTime: '—', feedbackStatus: '待确认显示' },
    { id: 'VMS-BT-A04', sectionId: 'sec2', pointName: '桥梁绕行段', stake: 'K31+120', group: '施工保通组', groupDetail: '二工区施工保通组', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工安全提醒', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '桥梁绕行提示 · V1.0', prevLine1: '桥梁施工绕行', prevLine2: '限速四十通行', lastTime: '11-26 08:40', lastOrderId: 'FB-20261126-005', verifyTime: '11-26 08:42:15', feedbackStatus: '已确认显示' },
    { id: 'VMS-ZD-A01', sectionId: 'sec4', pointName: '便道汇入口', stake: 'K48+500', group: '场站出入口', groupDetail: '四工区场站出入口', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工区域安全提示 · V1.0', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-25 16:20', lastOrderId: 'FB-20261125-004', verifyTime: '11-25 16:21:44', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-A05', sectionId: 'sec6', pointName: '施工缓行段', stake: 'K69+350', group: '施工保通组', groupDetail: '六工区施工保通组', direction: '明水方向', spec: '单黄LED 128×48', online: false, confirmedTitle: '施工缓行提示', line1: '前方施工缓行', line2: '请勿随意变道', prevTitle: '施工缓行提示 · V1.0', prevLine1: '前方施工缓行', prevLine2: '请勿随意变道', lastTime: '11-25 11:30', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 11:32:05', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-A06', sectionId: 'sec2', pointName: '枢纽分流口', stake: 'K28+900', group: '施工保通组', groupDetail: '二工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工安全提醒', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '保通通用板面 · V1.0', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-26 08:40', lastOrderId: 'FB-20261126-005', verifyTime: '11-26 08:43:10', feedbackStatus: '已确认显示' },
    { id: 'VMS-ZD-A02', sectionId: 'sec1', pointName: '明水拌合站口', stake: 'K08+400', group: '场站出入口', groupDetail: '一工区场站出入口', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '场站车辆进出提示', prevLine1: '前方场站路口', prevLine2: '注意工程车辆', lastTime: '11-25 09:15', lastOrderId: 'FB-20261125-001', verifyTime: '11-25 09:16:30', feedbackStatus: '已确认显示' },
    { id: 'VMS-HT-B01', sectionId: 'sec1', pointName: '明水互通主线', stake: 'K02+150', group: '枢纽互通组', groupDetail: '一工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '低能见度预警备选', line1: '雾雪能见度低', line2: '开启雾灯控速', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 17:40', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 17:41:20', feedbackStatus: '已确认显示' },
    { id: 'VMS-HT-B02', sectionId: 'sec1', pointName: '明水互通匝道', stake: 'K03+600', group: '枢纽互通组', groupDetail: '一工区枢纽互通组', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '低能见度预警备选', line1: '雾雪能见度低', line2: '开启雾灯控速', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 17:40', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 17:41:45', feedbackStatus: '已确认显示' },
    { id: 'VMS-QL-C01', sectionId: 'sec2', pointName: '通肯河特大桥北', stake: 'K35+800', group: '长大桥梁组', groupDetail: '二工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-25 14:10', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 14:11:09', feedbackStatus: '已确认显示' },
    { id: 'VMS-QL-C02', sectionId: 'sec2', pointName: '通肯河特大桥南', stake: 'K37+250', group: '长大桥梁组', groupDetail: '二工区长大桥梁组', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-25 14:10', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 14:11:32', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-B01', sectionId: 'sec3', pointName: '青肯泡导改北', stake: 'K52+400', group: '施工保通组', groupDetail: '三工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工保通通用板面', line1: '保通便道通行', line2: '注意避让机械', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 15:00', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 15:01:12', feedbackStatus: '已确认显示' },
    { id: 'VMS-ZD-B01', sectionId: 'sec3', pointName: '三工区梁场入口', stake: 'K58+900', group: '场站出入口', groupDetail: '三工区场站出入口', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-25 09:15', lastOrderId: 'FB-20261125-001', verifyTime: '11-25 09:17:02', feedbackStatus: '已确认显示' },
    { id: 'VMS-QL-C03', sectionId: 'sec3', pointName: '呼兰河大桥东', stake: 'K64+100', group: '长大桥梁组', groupDetail: '三工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工区域安全提示', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '桥梁施工提示', prevLine1: '前方桥梁施工', prevLine2: '注意安全间距', lastTime: '11-24 11:20', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 11:21:40', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-B02', sectionId: 'sec4', pointName: '海伦西导改入口', stake: 'K76+300', group: '施工保通组', groupDetail: '四工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工导改提示', line1: '前方施工导改', line2: '请按标志通行', prevTitle: '施工区域安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 10:05', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 10:06:18', feedbackStatus: '已确认显示' },
    { id: 'VMS-HT-C01', sectionId: 'sec4', pointName: '海伦北互通主线', stake: 'K84+600', group: '枢纽互通组', groupDetail: '四工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 09:30', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 09:31:05', feedbackStatus: '已确认显示' },
    { id: 'VMS-ZD-C01', sectionId: 'sec4', pointName: '四工区水稳站口', stake: 'K91+200', group: '场站出入口', groupDetail: '四工区场站出入口', direction: '明水方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '保通安全提示', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-25 16:20', lastOrderId: 'FB-20261125-004', verifyTime: '11-25 16:22:08', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-C01', sectionId: 'sec5', pointName: '伦河镇保通路口', stake: 'K99+450', group: '施工保通组', groupDetail: '五工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '保通结束提示', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '保通通用板面', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-24 16:40', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 16:41:22', feedbackStatus: '已确认显示' },
    { id: 'VMS-QL-D01', sectionId: 'sec5', pointName: '扎音河特大桥南', stake: 'K107+800', group: '长大桥梁组', groupDetail: '五工区长大桥梁组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '桥梁绕行安全提示', line1: '桥梁施工绕行', line2: '限速四十通行', prevTitle: '施工区域安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 14:25', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 14:26:49', feedbackStatus: '已确认显示' },
    { id: 'VMS-ZD-D01', sectionId: 'sec5', pointName: '五工区预制场口', stake: 'K115+100', group: '场站出入口', groupDetail: '五工区场站出入口', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '车辆进出提示', line1: '前方场站路口', line2: '注意工程车辆', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-24 13:50', lastOrderId: 'FB-20261124-001', verifyTime: '11-24 13:51:11', feedbackStatus: '已确认显示' },
    { id: 'VMS-BT-D01', sectionId: 'sec6', pointName: '建华分流引导段', stake: 'K128+600', group: '施工保通组', groupDetail: '六工区施工保通组', direction: '北安方向', spec: '单黄LED 128×48', online: true, confirmedTitle: '施工区域安全提示', line1: '前方施工区域', line2: '减速谨慎驾驶', prevTitle: '保通通用板面', prevLine1: '保通便道通行', prevLine2: '注意避让机械', lastTime: '11-25 11:30', lastOrderId: 'FB-20261125-002', verifyTime: '11-25 11:31:50', feedbackStatus: '已确认显示' },
    { id: 'VMS-HT-D01', sectionId: 'sec6', pointName: '建华枢纽主线南', stake: 'K141+200', group: '枢纽互通组', groupDetail: '六工区枢纽互通组', direction: '北安方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '施工出口提示板面', line1: '施工出口路段', line2: '严禁超速抢行', prevTitle: '通行安全提示', prevLine1: '前方施工区域', prevLine2: '减速谨慎驾驶', lastTime: '11-24 18:10', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 18:11:36', feedbackStatus: '已确认显示' },
    { id: 'VMS-HT-D02', sectionId: 'sec6', pointName: '建华枢纽终点匝道', stake: 'K145+900', group: '枢纽互通组', groupDetail: '六工区枢纽互通组', direction: '明水方向', spec: '全彩LED 192×64', online: true, confirmedTitle: '保通结束提示', line1: '施工导改结束', line2: '祝您一路平安', prevTitle: '施工出口提示', prevLine1: '施工出口路段', prevLine2: '严禁超速抢行', lastTime: '11-24 18:10', lastOrderId: 'FB-20261124-003', verifyTime: '11-24 18:12:04', feedbackStatus: '已确认显示' },
  ];
  return rows.map((r, i) => ({ ...r, sortOrder: i + 1 }));
}

function buildTemplatesSeed() {
  const rows = [
    { id: 'MB-202611-003', name: '施工导改提示', category: '预案内容', version: 'V1.2', spec: '单黄LED 128×48', validText: '11-26 10:30–18:00', startTime: '2026-11-26 10:30', endTime: '2026-11-26 18:00', status: '有效', line1: '前方施工导改', line2: '请按标志通行' },
    { id: 'MB-202611-004', name: '施工区域安全提示', category: '常用文本', version: 'V1.0', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '前方施工区域', line2: '减速谨慎驾驶' },
    { id: 'MB-202611-006', name: '低能见度提示', category: '预案内容', version: 'V1.1', spec: '全彩LED 192×64', validText: '按预案时段', startTime: '2026-11-26 06:00', endTime: '2026-11-26 22:00', status: '待启用', line1: '雾雪能见度低', line2: '开启雾灯控速' },
    { id: 'MB-202611-001', name: '施工保通通用板面', category: '板面模板', version: 'V1.3', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '保通便道通行', line2: '注意避让机械' },
    { id: 'MB-202611-007', name: '施工出口提示板面', category: '板面模板', version: 'V1.0', spec: '全彩LED 192×64', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '施工出口路段', line2: '严禁超速抢行' },
    { id: 'MB-202611-005', name: '保通结束提示', category: '常用文本', version: 'V1.1', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '施工导改结束', line2: '祝您一路平安' },
    { id: 'MB-202611-002', name: '桥梁绕行安全提示', category: '板面模板', version: 'V1.1', spec: '单黄LED 128×48', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '桥梁施工绕行', line2: '限速四十通行' },
    { id: 'MB-202611-008', name: '场站车辆进出提示', category: '常用文本', version: 'V1.0', spec: '全彩LED 192×64', validText: '长期有效', startTime: '2026-11-01 00:00', endTime: '2026-12-31 23:59', status: '有效', line1: '前方场站路口', line2: '注意工程车辆' },
  ];
  return rows.map((r, i) => ({ ...r, sortOrder: i + 1 }));
}

function buildOrdersSeed() {
  const rows = [
    {
      id: 'FB-20261126-007', title: '施工导改提示', version: 'V1.2', sectionId: 'sec1', groupLabel: '一工区施工保通组',
      templateId: 'MB-202611-003', spec: '单黄LED 128×48', line1: '前方施工导改', line2: '请按标志通行',
      validRange: '11-26 10:30–18:00', scheduleTime: '11-26 10:30', fullTime: '2026-11-26 10:30:00',
      date: '2026-11-26', period: '2026年11月', status: '已下发',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
      authorized: true, prevBoardSummary: '施工区域安全提示 · V1.0',
      boardIds: ['VMS-BT-A01', 'VMS-BT-A02', 'VMS-BT-A03'],
      stepTimes: { compose: '10:12', review: '10:22', auth: '10:27', dispatch: '10:30' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 10:12', action: 'create', note: '创建施工导改提示发布单' },
        { stage: '内容审核', actor: '审核员B（演示）', time: '2026-11-26 10:22', action: 'review_pass', note: '文案规范符合保通发布要求' },
        { stage: '授权下发', actor: '授权员C（演示）', time: '2026-11-26 10:30', action: 'authorize_dispatch', note: '二级授权通过并下发至3块情报板' },
      ],
    },
    {
      id: 'FB-20261126-008', title: '低能见度提示', version: 'V1.1', sectionId: 'sec1', groupLabel: '一工区枢纽互通组',
      templateId: 'MB-202611-006', spec: '全彩LED 192×64', line1: '雾雪能见度低', line2: '开启雾灯控速',
      validRange: '按预案触发时段', scheduleTime: '待安排', fullTime: '待审核确认',
      date: '2026-11-26', period: '2026年11月', status: '待审核',
      operator: '发布员A（演示）', reviewer: '待审核', authorizer: '待授权',
      authorized: false, prevBoardSummary: '通行安全提示 · V1.0',
      boardIds: ['VMS-HT-B01', 'VMS-HT-B02'],
      stepTimes: { compose: '10:40', review: '待审核', auth: '待授权', dispatch: '待下发' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 10:40', action: 'create', note: '联动预案 YA-TQ-002 手工补录草稿' },
      ],
    },
    {
      id: 'FB-20261126-009', title: '施工出口提示', version: 'V1.0', sectionId: 'sec1', groupLabel: '一工区场站出入口',
      templateId: 'MB-202611-007', spec: '全彩LED 192×64', line1: '施工出口路段', line2: '严禁超速抢行',
      validRange: '11-26 11:30–19:00', scheduleTime: '11-26 11:30', fullTime: '计划 2026-11-26 11:30:00',
      date: '2026-11-26', period: '2026年11月', status: '待授权',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '待授权',
      authorized: false, prevBoardSummary: '场站车辆进出提示 · V1.0',
      boardIds: ['VMS-ZD-A02'],
      stepTimes: { compose: '10:15', review: '10:28', auth: '待授权', dispatch: '待下发' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 10:15', action: 'create', note: '创建施工出口提示发布单' },
        { stage: '内容审核', actor: '审核员B（演示）', time: '2026-11-26 10:28', action: 'review_pass', note: '审核通过，待二级授权' },
      ],
    },
    {
      id: 'FB-20261126-005', title: '施工安全提醒', version: 'V1.0', sectionId: 'sec2', groupLabel: '二工区施工保通组',
      templateId: 'MB-202611-004', spec: '单黄LED 128×48', line1: '前方施工区域', line2: '减速谨慎驾驶',
      validRange: '11-26 08:40–18:00', scheduleTime: '11-26 08:40', fullTime: '2026-11-26 08:40:00',
      date: '2026-11-26', period: '2026年11月', status: '已下发',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
      authorized: true, prevBoardSummary: '桥梁绕行提示 · V1.0',
      boardIds: ['VMS-BT-A04', 'VMS-BT-A06'],
      stepTimes: { compose: '08:18', review: '08:26', auth: '08:35', dispatch: '08:40' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 08:18', action: 'create', note: '提交二工区安全提醒发布单' },
        { stage: '内容审核', actor: '审核员B（演示）', time: '2026-11-26 08:26', action: 'review_pass', note: '内容审核通过' },
        { stage: '授权下发', actor: '授权员C（演示）', time: '2026-11-26 08:40', action: 'authorize_dispatch', note: '已授权并下发至2块情报板' },
      ],
    },
    {
      id: 'FB-20261125-006', title: '临时保通提示', version: 'V1.3', sectionId: 'sec3', groupLabel: '三工区施工保通组',
      templateId: 'MB-202611-001', spec: '单黄LED 128×48', line1: '保通便道通行', line2: '注意避让机械',
      validRange: '11-25 16:05–20:00', scheduleTime: '11-25 16:05', fullTime: '2026-11-25 16:05:00',
      date: '2026-11-25', period: '2026年11月', status: '已撤销',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
      authorized: true, prevBoardSummary: '通行安全提示 · V1.0',
      boardIds: ['VMS-BT-B01', 'VMS-QL-C03'],
      stepTimes: { compose: '15:40', review: '15:52', auth: '16:00', dispatch: '16:05' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-25 15:40', action: 'create', note: '提交三工区临时保通提示' },
        { stage: '授权下发', actor: '授权员C（演示）', time: '2026-11-25 16:05', action: 'authorize_dispatch', note: '已下发至2块情报板' },
        { stage: '撤销发布', actor: '授权员C（演示）', time: '2026-11-25 20:05', action: 'revoke', note: '临时作业结束，授权撤销发布' },
      ],
    },
    {
      id: 'FB-20261125-004', title: '车辆进出提示', version: 'V1.0', sectionId: 'sec4', groupLabel: '四工区场站出入口',
      templateId: 'MB-202611-008', spec: '全彩LED 192×64', line1: '前方场站路口', line2: '注意工程车辆',
      validRange: '11-25 16:20–21:00', scheduleTime: '11-25 16:20', fullTime: '2026-11-25 16:20:00',
      date: '2026-11-25', period: '2026年11月', status: '已下发',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '授权员C（演示）',
      authorized: true, prevBoardSummary: '施工区域安全提示 · V1.0',
      boardIds: ['VMS-ZD-A01'],
      stepTimes: { compose: '15:55', review: '16:06', auth: '16:15', dispatch: '16:20' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-25 15:55', action: 'create', note: '提交四工区场站出入口提示' },
        { stage: '授权下发', actor: '授权员C（演示）', time: '2026-11-25 16:20', action: 'authorize_dispatch', note: '已授权并下发' },
      ],
    },
    {
      id: 'FB-20261126-010', title: '桥梁绕行安全提示', version: 'V1.1', sectionId: 'sec2', groupLabel: '二工区长大桥梁组',
      templateId: 'MB-202611-002', spec: '单黄LED 128×48', line1: '桥梁施工绕行', line2: '限速四十通行',
      validRange: '待安排', scheduleTime: '待安排', fullTime: '待审核确认',
      date: '2026-11-26', period: '2026年11月', status: '待审核',
      operator: '发布员A（演示）', reviewer: '待审核', authorizer: '待授权',
      authorized: false, prevBoardSummary: '桥梁施工提示 · V1.0',
      boardIds: ['VMS-QL-C01', 'VMS-QL-C02'],
      stepTimes: { compose: '10:36', review: '待审核', auth: '待授权', dispatch: '待下发' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 10:36', action: 'create', note: '关联智慧提速策略预案生成草稿' },
      ],
    },
    {
      id: 'FB-20261126-011', title: '保通结束提示', version: 'V1.1', sectionId: 'sec5', groupLabel: '五工区施工保通组',
      templateId: 'MB-202611-005', spec: '单黄LED 128×48', line1: '施工导改结束', line2: '祝您一路平安',
      validRange: '11-26 14:00–18:00', scheduleTime: '11-26 14:00', fullTime: '计划 2026-11-26 14:00:00',
      date: '2026-11-26', period: '2026年11月', status: '待授权',
      operator: '发布员A（演示）', reviewer: '审核员B（演示）', authorizer: '待授权',
      authorized: false, prevBoardSummary: '保通通用板面 · V1.3',
      boardIds: ['VMS-BT-C01', 'VMS-QL-D01'],
      stepTimes: { compose: '10:02', review: '10:20', auth: '待授权', dispatch: '待下发' },
      auditLogs: [
        { stage: '内容编排', actor: '发布员A（演示）', time: '2026-11-26 10:02', action: 'create', note: '创建五工区保通结束提示单' },
        { stage: '内容审核', actor: '审核员B（演示）', time: '2026-11-26 10:20', action: 'review_pass', note: '审核通过，待授权' },
      ],
    },
  ];
  return rows.map((r, i) => ({ ...r, sortOrder: i + 1 }));
}

function buildPlansSeed() {
  const rows = [
    {
      id: 'YA-DG-003',
      name: '施工导改提示联动',
      subTitle: '施工导改计划',
      scene: '施工导改',
      sectionId: 'sec1',
      triggerEvent: 'DG-20261126-01 · 导改时段生效',
      approvalStatus: '已批准',
      interfaceStatus: '接口就绪',
      conditionMet: true,
      targetGroup: '一工区施工保通组 · 3 块',
      targetGroupKey: '施工保通组',
      validRange: '11-26 10:30–18:00',
      templateId: 'MB-202611-003',
      templateVersion: 'V1.2',
      line1: '前方施工导改',
      line2: '请按标志通行',
      linkedOrderId: 'FB-20261126-007',
      linkedOrderNote: '10:30 已授权下发',
      flowStage: 4,
      triggerLogs: [
        { time: '2026-11-26 10:10:04', event: '接收施工导改计划 DG-20261126-01 时段激活信号', result: '匹配成功' },
        { time: '2026-11-26 10:12:00', event: '自动生成发布草稿 FB-20261126-007 并锁定一工区3块情报板', result: '已建单' },
        { time: '2026-11-26 10:30:00', event: '审核与授权通过，系统下发至目标情报板', result: '已下发' },
      ],
    },
    {
      id: 'YA-TQ-002',
      name: '天气预警提示联动',
      subTitle: '天气预警信息',
      scene: '天气预警',
      sectionId: 'sec1',
      triggerEvent: 'QX-20261126-04 · 大雾黄色预警信号',
      approvalStatus: '待批准',
      interfaceStatus: '待接入',
      conditionMet: false,
      targetGroup: '一工区枢纽互通组 · 2 块',
      targetGroupKey: '枢纽互通组',
      validRange: '按气象预警解除时间',
      templateId: 'MB-202611-006',
      templateVersion: 'V1.1',
      line1: '雾雪能见度低',
      line2: '开启雾灯控速',
      linkedOrderId: 'FB-20261126-008',
      linkedOrderNote: '草稿待审核（手工补录）',
      flowStage: 1,
      triggerLogs: [
        { time: '2026-11-26 09:42:18', event: '气象接口待正式鉴权接入，当前处于模拟校验状态', result: '待接入' },
        { time: '2026-11-26 10:40:00', event: '值班员手动创建对应草稿 FB-20261126-008', result: '待审核' },
      ],
    },
    {
      id: 'YA-TS-001',
      name: '智慧提速策略联动',
      subTitle: '已批准速度策略',
      scene: '智慧提速',
      sectionId: 'sec2',
      triggerEvent: 'TS-20261126-02 · 桥梁段限速策略',
      approvalStatus: '已批准',
      interfaceStatus: '待核验',
      conditionMet: false,
      targetGroup: '二工区长大桥梁组 · 2 块',
      targetGroupKey: '长大桥梁组',
      validRange: '11-26 09:00–19:00',
      templateId: 'MB-202611-002',
      templateVersion: 'V1.1',
      line1: '桥梁施工绕行',
      line2: '限速四十通行',
      linkedOrderId: 'FB-20261126-010',
      linkedOrderNote: '接口签名待核验',
      flowStage: 2,
      triggerLogs: [
        { time: '2026-11-26 08:55:12', event: '智慧提速子系统推送速度策略 TS-20261126-02', result: '已接收' },
        { time: '2026-11-26 08:56:00', event: '策略口径与桩号映射核验未完成，暂未自动触发下发', result: '待核验' },
      ],
    },
  ];
  return rows.map((r, i) => ({ ...r, sortOrder: i + 1 }));
}

function buildReceiptsSeed() {
  const rows = [
    {
      orderId: 'FB-20261126-007',
      boardId: 'VMS-BT-A01',
      dispatchStatus: '已下发', dispatchTime: '10:30:00',
      receiveStatus: '已接收', receiveTime: '10:30:02',
      readbackStatus: '内容一致', readbackTime: '10:30:06',
      confirmStatus: '已确认显示', confirmTime: '10:31:08',
      verifyRecord: '现场核验 · 巡查员D（演示）',
    },
    {
      orderId: 'FB-20261126-007',
      boardId: 'VMS-BT-A02',
      dispatchStatus: '已下发', dispatchTime: '10:30:00',
      receiveStatus: '已接收', receiveTime: '10:30:04',
      readbackStatus: '未回读', readbackTime: '—',
      confirmStatus: '待确认显示', confirmTime: '—',
      verifyRecord: '待设备回读与现场核验',
    },
    {
      orderId: 'FB-20261126-007',
      boardId: 'VMS-BT-A03',
      dispatchStatus: '已下发', dispatchTime: '10:30:00',
      receiveStatus: '未回执', receiveTime: '—',
      readbackStatus: '未回读', readbackTime: '—',
      confirmStatus: '待确认显示', confirmTime: '—',
      verifyRecord: '设备当前离线，等待重连回执',
    },
    {
      orderId: 'FB-20261126-005',
      boardId: 'VMS-BT-A04',
      dispatchStatus: '已下发', dispatchTime: '08:40:00',
      receiveStatus: '已接收', receiveTime: '08:40:03',
      readbackStatus: '内容一致', readbackTime: '08:40:08',
      confirmStatus: '已确认显示', confirmTime: '08:42:15',
      verifyRecord: '现场核验 · 巡查员D（演示）',
    },
    {
      orderId: 'FB-20261126-005',
      boardId: 'VMS-BT-A06',
      dispatchStatus: '已下发', dispatchTime: '08:40:00',
      receiveStatus: '已接收', receiveTime: '08:40:05',
      readbackStatus: '内容一致', readbackTime: '08:40:11',
      confirmStatus: '已确认显示', confirmTime: '08:43:10',
      verifyRecord: '现场核验 · 巡查员E（演示）',
    },
    {
      orderId: 'FB-20261125-004',
      boardId: 'VMS-ZD-A01',
      dispatchStatus: '已下发', dispatchTime: '16:20:00',
      receiveStatus: '已接收', receiveTime: '16:20:02',
      readbackStatus: '内容一致', readbackTime: '16:20:07',
      confirmStatus: '已确认显示', confirmTime: '16:21:44',
      verifyRecord: '现场核验 · 巡查员D（演示）',
    },
    {
      orderId: 'FB-20261125-006',
      boardId: 'VMS-BT-B01',
      dispatchStatus: '已下发', dispatchTime: '16:05:00',
      receiveStatus: '已接收', receiveTime: '16:05:03',
      readbackStatus: '内容一致', readbackTime: '16:05:09',
      confirmStatus: '已确认显示', confirmTime: '16:06:12',
      verifyRecord: '已撤销前曾现场核验（演示）',
    },
    {
      orderId: 'FB-20261125-006',
      boardId: 'VMS-QL-C03',
      dispatchStatus: '已下发', dispatchTime: '16:05:00',
      receiveStatus: '已接收', receiveTime: '16:05:04',
      readbackStatus: '内容一致', readbackTime: '16:05:10',
      confirmStatus: '已确认显示', confirmTime: '16:06:35',
      verifyRecord: '已撤销前曾现场核验（演示）',
    },
  ];
  return rows.map((r, i) => ({
    ...r,
    id: `${r.orderId}__${r.boardId}`,
    sortOrder: i + 1,
  }));
}

export async function seedM13(dbInstance = db) {
  for (const b of buildBoardsSeed()) {
    await dbInstance
      .insert(publishBoards)
      .values(b)
      .onConflictDoUpdate({
        target: publishBoards.id,
        set: {
          sectionId: b.sectionId,
          pointName: b.pointName,
          stake: b.stake,
          group: b.group,
          groupDetail: b.groupDetail,
          direction: b.direction,
          spec: b.spec,
          online: b.online,
          confirmedTitle: b.confirmedTitle,
          line1: b.line1,
          line2: b.line2,
          prevTitle: b.prevTitle,
          prevLine1: b.prevLine1,
          prevLine2: b.prevLine2,
          lastTime: b.lastTime,
          lastOrderId: b.lastOrderId,
          verifyTime: b.verifyTime,
          feedbackStatus: b.feedbackStatus,
          sortOrder: b.sortOrder,
        },
      });
  }

  for (const t of buildTemplatesSeed()) {
    await dbInstance
      .insert(publishTemplates)
      .values(t)
      .onConflictDoUpdate({
        target: publishTemplates.id,
        set: {
          name: t.name,
          category: t.category,
          version: t.version,
          spec: t.spec,
          validText: t.validText,
          startTime: t.startTime,
          endTime: t.endTime,
          status: t.status,
          line1: t.line1,
          line2: t.line2,
          sortOrder: t.sortOrder,
        },
      });
  }

  for (const o of buildOrdersSeed()) {
    await dbInstance
      .insert(publishOrders)
      .values(o)
      .onConflictDoUpdate({
        target: publishOrders.id,
        set: {
          title: o.title,
          version: o.version,
          sectionId: o.sectionId,
          groupLabel: o.groupLabel,
          templateId: o.templateId,
          spec: o.spec,
          line1: o.line1,
          line2: o.line2,
          validRange: o.validRange,
          scheduleTime: o.scheduleTime,
          fullTime: o.fullTime,
          date: o.date,
          period: o.period,
          status: o.status,
          operator: o.operator,
          reviewer: o.reviewer,
          authorizer: o.authorizer,
          authorized: o.authorized,
          prevBoardSummary: o.prevBoardSummary,
          boardIds: o.boardIds,
          stepTimes: o.stepTimes,
          auditLogs: o.auditLogs,
          sortOrder: o.sortOrder,
        },
      });
  }

  for (const p of buildPlansSeed()) {
    await dbInstance
      .insert(publishPlans)
      .values(p)
      .onConflictDoUpdate({
        target: publishPlans.id,
        set: {
          name: p.name,
          subTitle: p.subTitle,
          scene: p.scene,
          sectionId: p.sectionId,
          triggerEvent: p.triggerEvent,
          approvalStatus: p.approvalStatus,
          interfaceStatus: p.interfaceStatus,
          conditionMet: p.conditionMet,
          targetGroup: p.targetGroup,
          targetGroupKey: p.targetGroupKey,
          validRange: p.validRange,
          templateId: p.templateId,
          templateVersion: p.templateVersion,
          line1: p.line1,
          line2: p.line2,
          linkedOrderId: p.linkedOrderId,
          linkedOrderNote: p.linkedOrderNote,
          flowStage: p.flowStage,
          triggerLogs: p.triggerLogs,
          sortOrder: p.sortOrder,
        },
      });
  }

  for (const r of buildReceiptsSeed()) {
    await dbInstance
      .insert(publishReceipts)
      .values(r)
      .onConflictDoUpdate({
        target: publishReceipts.id,
        set: {
          orderId: r.orderId,
          boardId: r.boardId,
          dispatchStatus: r.dispatchStatus,
          dispatchTime: r.dispatchTime,
          receiveStatus: r.receiveStatus,
          receiveTime: r.receiveTime,
          readbackStatus: r.readbackStatus,
          readbackTime: r.readbackTime,
          confirmStatus: r.confirmStatus,
          confirmTime: r.confirmTime,
          verifyRecord: r.verifyRecord,
          sortOrder: r.sortOrder,
        },
      });
  }
}
