export interface M02SectionBrief {
  id: string;
  name: string;
  stakeRange?: string;
}

export interface M02CategoryStat {
  id: string;
  period: string;
  sectionId: string;
  categoryKey: string;
  categoryName: string;
  unit: string;
  icon: string;
  isInt: boolean;
  totalQty: number;
  doneQty: number;
  pct: number;
  sortOrder: number;
}

export interface M02TrendPoint {
  id: string;
  period: string;
  sectionId: string;
  totalQty: number;
  periodQty: number;
  cumQty: number;
  cumPct: number;
  sortOrder: number;
}

export interface M02DetailItem {
  id: string;
  itemScope: string;
  sectionId: string;
  sectionName: string;
  objectName: string;
  category: string;
  subItem: string;
  unit: string;
  totalQty: string;
  periodQty: string;
  cumQty: string;
  pct: number;
  dueDate: string;
  sourceReport: string;
  poiId: string | null;
  reportPeriod: string;
}

export interface M02OverviewResponse {
  month: string;
  sectionId: string;
  category: string;
  sections: M02SectionBrief[];
  kpis: M02CategoryStat[];
  matrix: {
    rows: Array<{
      sectionId: string;
      sectionName: string;
      values: Array<{ categoryKey: string; categoryName: string; pct: number }>;
    }>;
    allLine: Array<{ categoryKey: string; categoryName: string; pct: number }>;
  };
  trend: {
    summary: { totalQty: number; periodQty: number; cumQty: number };
    points: M02TrendPoint[];
  };
  details: {
    rows: M02DetailItem[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface M02ReportRow {
  id: string;
  sectionId: string;
  sectionName: string;
  year: string;
  month: string;
  periodLabel: string;
  reportName: string;
  dueDate: string;
  updatedDate: string;
  sourceName: string;
  docCode: string;
  status: string;
  summary: string;
}

export interface M02ReportsResponse {
  year: string;
  month: string;
  periodLabel: string;
  dueDate: string;
  sectionId: string;
  sections: M02SectionBrief[];
  reports: M02ReportRow[];
  selectedReport: M02ReportRow | null;
  items: M02DetailItem[];
}

export interface M02PlanTask {
  id: string;
  name: string;
  category: string;
  sectionId: string;
  planLevel: string;
  timeRange: string;
  startMonthIdx: number;
  endMonthIdx: number;
  actualMonthIdx: number;
  milestoneMonthIdx: number | null;
  status: string;
  sortOrder: number;
}

export interface M02PlanNode {
  id: string;
  seq: number;
  title: string;
  planDate: string;
  status: string;
  statusTone: string;
  sectionId: string;
  sectionName: string;
  objectName: string;
  taskName: string;
  category: string;
  specialty: string;
  inShortList: boolean;
  listOrder: number;
}

export interface M02PlanResponse {
  sectionId: string;
  level: string;
  range: string;
  category: string;
  sections: M02SectionBrief[];
  kpis: {
    totalNodesCount: number;
    monthTodoCount: number;
    expiringCount: number;
    stageLabel: string;
  };
  tasks: M02PlanTask[];
  nodes: M02PlanNode[];
  filteredNodes: M02PlanNode[];
  shortListNodes: M02PlanNode[];
  assocNodes: M02PlanNode[];
}

export interface M02BimTask {
  id: string;
  name: string;
  start: string;
  end: string;
  icon: string;
  part: string;
}

export interface M02BimObject {
  id: string;
  name: string;
  poiId: string;
  sectionId: string;
  sectionName: string;
  planName: string;
  planVersion: string;
  startDate: string;
  endDate: string;
  tasks: M02BimTask[];
  simProgress: number;
  simDate: string;
  selectedTaskId: string;
}

export interface M02BimResponse {
  sections: M02SectionBrief[];
  objects: M02BimObject[];
  activeObject: M02BimObject | null;
}
