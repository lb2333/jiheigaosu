import type { BadgeTone } from '@/components/ui/StatusBadge';
import type { MeasureContract } from '../types';

export const DEFAULT_SECTIONS: MeasureContract[] = [
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

export const PERIOD_OPTIONS = [
  '2026年11月',
  '2026年10月',
  '2026年09月',
  '2026年08月',
  '2026年07月',
  '2026年06月',
];

export const ALL_WORK_ITEMS = [
  '路基土方',
  '桥梁桩基',
  '桥梁预制梁',
  '水稳基层',
  '沥青中面层',
  '路基防护',
];

export const MATCHED_WORK_ITEMS = [
  '路基土方',
  '桥梁桩基',
  '桥梁预制梁',
  '水稳基层',
  '沥青中面层',
];

export function dateToPeriod(selectedDate: string): string {
  if (selectedDate.startsWith('2026-10')) return '2026年10月';
  if (selectedDate.startsWith('2026-09')) return '2026年09月';
  if (selectedDate.startsWith('2026-08')) return '2026年08月';
  if (selectedDate.startsWith('2026-07')) return '2026年07月';
  if (selectedDate.startsWith('2026-06')) return '2026年06月';
  return '2026年11月';
}

export function buildPaginationPages(
  totalPages: number,
  currentPage: number
): Array<number | 'ellipsis'> {
  if (totalPages <= 5) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const showSet = new Set([
    1,
    2,
    3,
    totalPages,
    currentPage - 1,
    currentPage,
    currentPage + 1,
  ]);
  const sorted = Array.from(showSet)
    .filter((p) => p >= 1 && p <= totalPages)
    .sort((a, b) => a - b);
  const out: Array<number | 'ellipsis'> = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('ellipsis');
    out.push(p);
    prev = p;
  }
  return out;
}

export function statusToBadgeTone(st: string): BadgeTone {
  if (st === '已确认' || st === '已支付' || st === '已回传') return 'ok';
  if (st === '审核中' || st === '办理中') return 'info';
  if (st === '待审核' || st === '待支付') return 'warn';
  return 'muted';
}
