import type {
  PublishOrderAuditEntry,
  PublishOrderStepTimes,
  PublishPlanTriggerLog,
} from '@/db/schema/domains/m13';

export const SECTIONS = [
  { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
  { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
  { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
  { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
  { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
  { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' },
] as const;

export const BOARD_GROUPS = [
  '施工保通组',
  '场站出入口',
  '枢纽互通组',
  '长大桥梁组',
] as const;

export const BOARD_SPECS = [
  '单黄LED 128×48',
  '全彩LED 192×64',
] as const;

export const TEMPLATE_CATEGORIES = [
  '常用文本',
  '板面模板',
  '预案内容',
] as const;

const SECTION_NAME_BY_ID: Record<string, string> = Object.fromEntries(
  SECTIONS.map((s) => [s.id, s.name])
);

export function secName(secId: string): string {
  if (secId === 'line') return '全线';
  return SECTION_NAME_BY_ID[secId] ?? secId;
}

export function statusTagClass(status: string): string {
  if (
    [
      '在线',
      '已确认显示',
      '有效',
      '已批准',
      '接口就绪',
      '条件满足',
      '已接收',
      '内容一致',
      '授权已核验',
      '已确认对象',
      '已下发',
    ].includes(status)
  ) {
    if (status === '已下发') return 'm13-tag-blue';
    return 'm13-tag-green';
  }
  if (
    [
      '待确认显示',
      '待审核',
      '待授权',
      '待接入',
      '待核验',
      '待批准',
      '待回读',
      '待接收',
    ].includes(status)
  ) {
    return 'm13-tag-amber';
  }
  if (['已退回', '异常'].includes(status)) return 'm13-tag-red';
  return 'm13-tag-slate';
}

export interface PublishBoardDTO {
  id: string;
  sectionId: string;
  pointName: string;
  stake: string;
  group: string;
  groupDetail: string;
  direction: string;
  spec: string;
  online: boolean;
  confirmedTitle: string;
  line1: string;
  line2: string;
  prevTitle: string;
  prevLine1: string;
  prevLine2: string;
  lastTime: string;
  lastOrderId: string;
  verifyTime: string;
  feedbackStatus: string;
  sortOrder: number;
}

export interface PublishTemplateDTO {
  id: string;
  name: string;
  category: string;
  version: string;
  spec: string;
  validText: string;
  startTime: string;
  endTime: string;
  status: string;
  line1: string;
  line2: string;
  sortOrder: number;
}

export interface PublishOrderDTO {
  id: string;
  title: string;
  version: string;
  sectionId: string;
  groupLabel: string;
  templateId: string;
  spec: string;
  line1: string;
  line2: string;
  validRange: string;
  scheduleTime: string;
  fullTime: string;
  date: string;
  period: string;
  status: string;
  operator: string;
  reviewer: string;
  authorizer: string;
  authorized: boolean;
  prevBoardSummary: string;
  boardIds: string[];
  stepTimes: PublishOrderStepTimes;
  auditLogs: PublishOrderAuditEntry[];
  sortOrder: number;
}

export interface PublishPlanDTO {
  id: string;
  name: string;
  subTitle: string;
  scene: string;
  sectionId: string;
  triggerEvent: string;
  approvalStatus: string;
  interfaceStatus: string;
  conditionMet: boolean;
  targetGroup: string;
  targetGroupKey: string;
  validRange: string;
  templateId: string;
  templateVersion: string;
  line1: string;
  line2: string;
  linkedOrderId: string;
  linkedOrderNote: string;
  flowStage: number;
  triggerLogs: PublishPlanTriggerLog[];
  sortOrder: number;
}

export interface PublishReceiptDTO {
  id: string;
  orderId: string;
  boardId: string;
  dispatchStatus: string;
  dispatchTime: string;
  receiveStatus: string;
  receiveTime: string;
  readbackStatus: string;
  readbackTime: string;
  confirmStatus: string;
  confirmTime: string;
  verifyRecord: string;
  sortOrder: number;
}

export interface PublishNavBridge {
  selectedOrderId?: string;
  selectedBoardId?: string;
  openCreateOrderWithTplId?: string;
}
