export const SECTION_OPTIONS = [
  { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
  { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
  { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
  { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
  { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
  { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' },
] as const;

export const ORG_TYPE_OPTIONS = ['项目办', '监理单位', '施工单位'] as const;

export const KEY_ROLE_NAMES = [
  '项目负责人',
  '总监理工程师',
  '专业监理工程师',
  '安全负责人',
  '质量负责人',
  '技术负责人',
  '专职安全员',
] as const;

export const ATTENDANCE_DATES = ['2026-11-26', '2026-11-25', '2026-11-24'] as const;

export const ROLE_DUTY_MAP: Record<string, string> = {
  项目负责人: '统筹全线工程建设目标、进度节点、资金与重大技术决策。',
  项目管理人员: '负责项目办日常建设调度、合同台账归口与内外协调事务。',
  总监理工程师: '全面主持总监办监理工作，签发工程指令、计量支付与质量安全停复工令。',
  专业监理工程师: '负责本专业分项工程巡视旁站、工序验收与现场抽检复核。',
  安全负责人: '负责本工区施工安全管理，跟踪隐患整改和复查。',
  质量负责人: '负责本工区工程质量管控、自检体系运行及质量缺陷闭环整改。',
  技术负责人: '负责本工区施工组织设计、专项技术方案编制与技术交底。',
  专职安全员: '负责现场日常安全巡查、危大工程旁站监督与特种作业核查。',
  试验检测员: '负责原材料取样送检、试块养护与试验台账数据录入核验。',
  施工员: '负责现场施工放样、班组作业组织及每日工程量进度记录。',
  材料员: '负责进场原材料验收、物资台账登记及拌合站消耗核对。',
  测量工程师: '负责路线控制网复测、桥涵构筑物高程及桩位放样复核。',
  资料员: '负责工程内业资料收集整编、隐蔽工程影像归档与报验流转。',
};

export interface StaffOrganizationDTO {
  id: string;
  name: string;
  type: string;
  sectionId: string;
  sectionName: string;
  headcount: number;
  lon: number;
  lat: number;
  staffCount: number;
}

export interface StaffKeyRoleBriefDTO {
  code: string;
  roleName: string;
  assignDate: string | null;
}

export interface StaffMemberDTO {
  id: string;
  name: string;
  orgId: string;
  orgName: string;
  orgType: string;
  sectionId: string;
  sectionName: string;
  role: string;
  status: string; // '在岗' | '暂未在岗'
  phone: string;
  cert: string;
  certValid: string;
  joinDate: string;
  duty: string;
  offReason: string;
  keyRole: StaffKeyRoleBriefDTO | null;
}

export interface StaffKeyRoleDTO {
  code: string;
  orgId: string;
  orgName: string;
  orgType: string;
  sectionId: string;
  sectionName: string;
  roleName: string;
  holderId: string | null;
  assignDate: string | null;
  holder: {
    id: string;
    name: string;
    role: string;
    status: string;
    phone: string;
    cert: string;
    certValid: string;
    joinDate: string;
    duty: string;
  } | null;
}

export interface StaffAnomalyDTO {
  id: string;
  staffId: string;
  staffName: string;
  orgId: string;
  orgName: string;
  orgType: string;
  sectionId: string;
  sectionName: string;
  roleName: string;
  type: string;
  time: string;
  date: string;
  note: string;
  resolved: boolean;
  handleNote: string;
}

export interface OrgPageResponse {
  allOrgs: StaffOrganizationDTO[];
  treeOrgs: StaffOrganizationDTO[];
  kpis: {
    orgCount: number;
    staffTotal: number;
    onDutyCount: number;
    offDutyCount: number;
    roleTotal: number;
    assignedRolesCount: number;
  };
  items: StaffMemberDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  selectedPerson: StaffMemberDTO | null;
}

export interface AttendanceTierStatDTO {
  type: string;
  arrived: number;
  total: number;
  pct: number;
}

export interface AttendancePageResponse {
  kpis: {
    totalRoles: number;
    assignedCount: number;
    pendingCount: number;
    assignRate: string;
    onDutyHolders: number;
  };
  items: StaffKeyRoleDTO[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  summary: {
    expectedCount: number;
    arrivedCount: number;
    arrivalRate: string;
    anomalyCount: number;
    tierStats: AttendanceTierStatDTO[];
  };
  anomalies: StaffAnomalyDTO[];
}

export interface RoleDetailResponse {
  role: StaffKeyRoleDTO;
  candidates: Array<{
    id: string;
    name: string;
    orgId: string;
    orgName: string;
    role: string;
    status: string;
  }>;
}
