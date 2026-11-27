export type MeasureSubPage =
  | 'overview'
  | 'sectionStats'
  | 'physicalCompare'
  | 'rawRecords';

export interface MeasureContract {
  sectionId: string;
  sectionName: string;
  contractCode: string;
  stakeRange: string;
  supervisor: string;
  cumBaseAmount: number;
  paidReturnAmount: number;
  payReturned: boolean;
  sortOrder: number;
}

export interface MeasurePeriod {
  period: string;
  shortLabel: string;
  totalAmount: number;
  cumTotalAmount: number;
  scaleFactor: number;
  sortOrder: number;
}

export interface MeasureRecord {
  id: string;
  sectionId: string;
  sectionName: string;
  contractCode: string;
  workItem: string;
  period: string;
  amount: number;
  status: '已确认' | '审核中' | '待审核' | string;
  payStatus: '已支付' | '办理中' | '待支付' | '未回传' | string;
  paidAmount: number;
  payTime: string;
  syncTime: string;
  stakeRange: string;
  qtyDesc: string;
  reviewer: string;
  sortOrder: number;
}

export interface AttentionItem {
  id: string;
  secId: string;
  title: string;
  sub: string;
  tag: string;
  cls: 'ok' | 'info' | 'warn' | 'muted';
  kind: 'clock' | 'warn' | 'sync';
}

export interface OverviewApiResponse {
  period: string;
  caliber: '已确认计量' | '全部申报金额';
  sectionId: string | null;
  statusFilter: string;
  kpis: {
    currentAmt: number;
    cumAmt: number;
    totalCount: number;
    confirmedCount: number;
    reviewingCount: number;
    pendingCount: number;
  };
  sixPeriods: Array<{
    period: string;
    shortLabel: string;
    value: number;
    cumTotal: number;
  }>;
  payment: {
    paidTotal: number;
    returnedSections: number;
    totalSections: number;
    counts: Record<'已支付' | '办理中' | '待支付' | '未回传', number>;
  };
  records: {
    rows: MeasureRecord[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
  attentionItems: AttentionItem[];
  contracts: MeasureContract[];
  periods: MeasurePeriod[];
}

export interface SectionStatRow {
  sectionId: string;
  sectionName: string;
  contractCode: string;
  curAmt: number;
  cumAmt: number;
  recCount: number;
  confirmedCount: number;
  paidAmt: number;
  payReturned: boolean;
}

export interface SectionsApiResponse {
  period: string;
  sectionId: string | null;
  contract: string;
  item: string;
  kpis: {
    sectionCount: number;
    contractCount: number;
    totalCurAmt: number;
    totalCumAmt: number;
    totalConfirmed: number;
    totalRecs: number;
    totalPaid: number;
    returnedCount: number;
  };
  sectionRows: SectionStatRow[];
  allSectionCharts: Array<{
    sectionId: string;
    sectionName: string;
    curAmt: number;
    cumAmt: number;
  }>;
  contracts: MeasureContract[];
  periods: MeasurePeriod[];
}

export interface PhysicalCompareItem {
  id: number;
  sectionId: string;
  workItem: string;
  unit: string;
  contractQty: number;
  measuredQty: number;
  physicalQty: number;
  measuredPct: number;
  physicalPct: number;
  diffQty: number;
  periodAmount: number;
  linkedRecordId: string;
}

export interface PhysicalCompareApiResponse {
  period: string;
  contract: MeasureContract;
  item: string;
  items: PhysicalCompareItem[];
  contracts: MeasureContract[];
  periods: MeasurePeriod[];
}

export interface RawRecordsApiResponse {
  period: string;
  sectionId: string | null;
  summary: {
    total: number;
    confirmed: number;
    reviewing: number;
    pending: number;
  };
  rows: MeasureRecord[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  contracts: MeasureContract[];
  periods: MeasurePeriod[];
}
