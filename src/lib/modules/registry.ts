export type CesiumMode = 'interactive' | 'dimmed' | 'opaque';
export type ModuleMode = 'native';

export interface SubPageDef {
  id: string;
  name: string;
  cesiumMode: CesiumMode;
}

export interface ModuleDef {
  id: string;
  name: string;
  mode: ModuleMode;
  showInTopNav: boolean;
  subPages: SubPageDef[];
}

export const DATE_PRESETS = [
  { date: '2026-11-25', label: '最新一期', progressDelta: 0.0, qualityDelta: 0.0, safetyDelta: 0.0 },
  { date: '2026-11-20', label: '11月下旬初', progressDelta: -1.4, qualityDelta: -0.1, safetyDelta: -0.2 },
  { date: '2026-10-31', label: '10月末归档', progressDelta: -4.8, qualityDelta: -0.3, safetyDelta: -0.5 },
  { date: '2026-09-25', label: '三季度末', progressDelta: -9.6, qualityDelta: -0.6, safetyDelta: -0.9 },
] as const;

export const MODULE_REGISTRY: ModuleDef[] = [
  {
    id: 'home',
    name: '综合首页',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '项目总览', cesiumMode: 'interactive' },
      { id: 'roaming', name: '数字漫游', cesiumMode: 'interactive' },
      { id: 'milestone', name: '建设里程碑', cesiumMode: 'opaque' },
      { id: 'showcase', name: '专题展示', cesiumMode: 'interactive' },
    ],
  },
  {
    id: 'progress',
    name: '进度管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '进度总览', cesiumMode: 'opaque' },
      { id: 'report', name: '进度报表', cesiumMode: 'opaque' },
      { id: 'plan', name: '计划与节点', cesiumMode: 'opaque' },
      { id: 'bim_a', name: 'BIM进度模拟(方案A)', cesiumMode: 'interactive' },
      { id: 'bim_b', name: 'BIM进度模拟(方案B)', cesiumMode: 'interactive' },
    ],
  },
  {
    id: 'quality',
    name: '质量管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '质量总览', cesiumMode: 'opaque' },
      { id: 'lab', name: '实验室', cesiumMode: 'opaque' },
      { id: 'mixing', name: '拌合站', cesiumMode: 'opaque' },
      { id: 'pavement', name: '路面质量', cesiumMode: 'opaque' },
      { id: 'beamYard', name: '智慧梁场', cesiumMode: 'opaque' },
      { id: 'issues', name: '质量问题与整改', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'safety',
    name: '安全管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '安全总览', cesiumMode: 'opaque' },
      { id: 'risk', name: '风险点位', cesiumMode: 'dimmed' },
      { id: 'ai_alert', name: '视频AI预警', cesiumMode: 'opaque' },
      { id: 'ledger', name: '隐患台账', cesiumMode: 'opaque' },
      { id: 'review', name: '整改复查', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'pingan',
    name: '平安工地',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'showcase', name: '项目展示', cesiumMode: 'opaque' },
      { id: 'topics', name: '专题管理', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'uav',
    name: '无人机巡检',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '巡检总览', cesiumMode: 'interactive' },
      { id: 'tasks', name: '巡检任务', cesiumMode: 'opaque' },
      { id: 'routes', name: '航线规划', cesiumMode: 'interactive' },
      { id: 'live', name: '实时巡检', cesiumMode: 'opaque' },
      { id: 'hazards', name: '隐患识别', cesiumMode: 'opaque' },
      { id: 'reports', name: '巡检报告', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'video',
    name: '视频监控',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'directory', name: '设备目录', cesiumMode: 'opaque' },
      { id: 'patrol', name: '视频巡查', cesiumMode: 'opaque' },
      { id: 'playback', name: '历史录像', cesiumMode: 'opaque' },
      { id: 'airground', name: '空地联动', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'staff',
    name: '人员管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'org', name: '组织与人员', cesiumMode: 'opaque' },
      { id: 'attendance', name: '岗位与考勤', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'machine',
    name: '机械管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'equipment', name: '机械设备', cesiumMode: 'opaque' },
      { id: 'keyArchive', name: '重点机械档案', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'material',
    name: '全周期备料管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '备料总览', cesiumMode: 'opaque' },
      { id: 'report', name: '报表管理', cesiumMode: 'opaque' },
      { id: 'yard', name: '料场详情', cesiumMode: 'opaque' },
      { id: 'inspect', name: '检验与现场关联', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'measure',
    name: '计量管理',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '计量总览', cesiumMode: 'opaque' },
      { id: 'sectionStats', name: '分工区统计', cesiumMode: 'opaque' },
      { id: 'physicalCompare', name: '实物进度对照', cesiumMode: 'opaque' },
      { id: 'rawRecords', name: '原始记录', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'speed',
    name: '智慧提速',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'traffic', name: '交通运行', cesiumMode: 'interactive' },
      { id: 'algorithm', name: '算法研判', cesiumMode: 'opaque' },
      { id: 'strategy', name: '速度策略', cesiumMode: 'opaque' },
      { id: 'feedback', name: '执行反馈', cesiumMode: 'opaque' },
      { id: 'replay', name: '场景回放', cesiumMode: 'interactive' },
    ],
  },
  {
    id: 'publish',
    name: '信息发布',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'overview', name: '情报板总览', cesiumMode: 'opaque' },
      { id: 'templates', name: '内容模板', cesiumMode: 'opaque' },
      { id: 'review', name: '审核发布', cesiumMode: 'opaque' },
      { id: 'plans', name: '联动预案', cesiumMode: 'opaque' },
      { id: 'receipts', name: '回执记录', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'blacksoil',
    name: '黑土地保护',
    mode: 'native',
    showInTopNav: true,
    subPages: [
      { id: 'compare', name: '遥感影像对比', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'system',
    name: '系统管理',
    mode: 'native',
    showInTopNav: false,
    subPages: [
      { id: 'base', name: '基础资料', cesiumMode: 'opaque' },
      { id: 'rbac', name: '用户权限', cesiumMode: 'opaque' },
      { id: 'integration', name: '系统接入', cesiumMode: 'opaque' },
      { id: 'metrics', name: '指标口径', cesiumMode: 'opaque' },
      { id: 'content', name: '内容配置', cesiumMode: 'opaque' },
      { id: 'logs', name: '日志档案', cesiumMode: 'opaque' },
    ],
  },
  {
    id: 'ai',
    name: 'AI助手工作台',
    mode: 'native',
    showInTopNav: false,
    subPages: [
      { id: 'exhibition', name: '展厅讲解', cesiumMode: 'opaque' },
      { id: 'analysis', name: '管理研判', cesiumMode: 'opaque' },
      { id: 'field', name: '一线办理', cesiumMode: 'opaque' },
    ],
  },
];

export function getModuleDef(moduleId: string): ModuleDef | undefined {
  return MODULE_REGISTRY.find((m) => m.id === moduleId);
}

export function getSubPageDef(moduleId: string, subPageId?: string): { mod: ModuleDef; sub: SubPageDef } | undefined {
  const mod = getModuleDef(moduleId);
  if (!mod) return undefined;
  const sub = mod.subPages.find((s) => s.id === subPageId) ?? mod.subPages[0];
  if (!sub) return undefined;
  return { mod, sub };
}

export function getAllPageCatalog() {
  return MODULE_REGISTRY.flatMap((m) =>
    m.subPages.map((s) => ({
      mod: m.id,
      modName: m.name,
      sub: s.id,
      name: s.name,
      mode: m.mode,
      href: `/${m.id}/${s.id}`,
    }))
  );
}
