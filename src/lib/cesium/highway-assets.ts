export const CONTROL_POINTS: [number, number][] = [
  [125.8202, 47.2916],
  [125.915, 47.362],
  [125.982, 47.452],
  [126.015, 47.552],
  [125.992, 47.652],
  [126.028, 47.748],
  [126.135, 47.838],
  [126.252, 47.926],
  [126.328, 48.028],
  [126.362, 48.135],
  [126.4135, 48.2372],
];

export function interpolateSpline(pts: [number, number][], samplesPerSeg: number): [number, number][] {
  const out: [number, number][] = [];
  const n = pts.length;
  for (let i = 0; i < n - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(n - 1, i + 2)];
    for (let s = 0; s < samplesPerSeg; s++) {
      const t = s / samplesPerSeg;
      const t2 = t * t;
      const t3 = t2 * t;
      const lon =
        0.5 *
        (2 * p1[0] +
          (-p0[0] + p2[0]) * t +
          (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 +
          (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3);
      const lat =
        0.5 *
        (2 * p1[1] +
          (-p0[1] + p2[1]) * t +
          (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 +
          (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3);
      out.push([lon, lat]);
    }
  }
  out.push(pts[n - 1]);
  return out;
}

export const ROUTE_COORDS = interpolateSpline(CONTROL_POINTS, 18);

export const SECTION_RANGES = [
  { id: 'sec1', name: '一工区', start: 0.0, end: 0.16, color: '#22d3ee' },
  { id: 'sec2', name: '二工区', start: 0.16, end: 0.34, color: '#06b6d4' },
  { id: 'sec3', name: '三工区', start: 0.34, end: 0.51, color: '#38bdf8' },
  { id: 'sec4', name: '四工区', start: 0.51, end: 0.68, color: '#22d3ee' },
  { id: 'sec5', name: '五工区', start: 0.68, end: 0.84, color: '#0ea5e9' },
  { id: 'sec6', name: '六工区', start: 0.84, end: 1.0, color: '#38f2ff' },
];

export type HighwayAssetCategory =
  | 'interchange'
  | 'bridge_large'
  | 'bridge_medium'
  | 'bridge_small'
  | 'service_area'
  | 'maintenance_area';

export interface HighwayAssetItem {
  id: string;
  name: string;
  category: HighwayAssetCategory;
  categoryLabel: string;
  ratio: number;
  sectionId: string;
  sectionName: string;
  stake: string;
  designSpeed: string;
  roadbedWidth: string;
  structureDesc: string;
  modelUrl?: string;
  modelTemplateLabel?: string;
  scale?: number;
}

export function getPointAtRatio(r: number): [number, number] {
  const clamped = Math.max(0, Math.min(1, r));
  const fIdx = clamped * (ROUTE_COORDS.length - 1);
  const i0 = Math.floor(fIdx);
  const i1 = Math.min(ROUTE_COORDS.length - 1, i0 + 1);
  const frac = fIdx - i0;
  return [
    ROUTE_COORDS[i0][0] + (ROUTE_COORDS[i1][0] - ROUTE_COORDS[i0][0]) * frac,
    ROUTE_COORDS[i0][1] + (ROUTE_COORDS[i1][1] - ROUTE_COORDS[i0][1]) * frac,
  ];
}

export function sampleRoutePose(ratio: number): { lon: number; lat: number; headingRad: number } {
  const clamped = Math.max(0, Math.min(1, ratio));
  const [lon, lat] = getPointAtRatio(clamped);
  const delta = 0.008;
  const pPrev = getPointAtRatio(Math.max(0, clamped - delta));
  const pNext = getPointAtRatio(Math.min(1, clamped + delta));
  const cosLat = Math.cos((lat * Math.PI) / 180);
  const dE = (pNext[0] - pPrev[0]) * cosLat;
  const dN = pNext[1] - pPrev[1];
  // Cesium 1.119 Model (upAxis=Y, forwardAxis=Z) maps Blender +X to local +Y (North at heading=0).
  // Thus heading = atan2(dE, dN) aligns Blender +X with route tangent (dE, dN).
  const headingRad = Math.atan2(dE, dN);
  return { lon, lat, headingRad };
}

function formatStakeFromRatio(ratio: number): string {
  const kmTotal = ratio * 146.8;
  const km = Math.floor(kmTotal);
  const m = Math.round((kmTotal - km) * 1000);
  return `K${km}+${String(m).padStart(3, '0')}`;
}

function resolveSpeedLabel(ratio: number): string {
  if (ratio <= 0.16) return '100 km/h（新建双向四车道）';
  return '100 / 80 km/h（部分利用旧路段 80 km/h）';
}

/**
 * 30 个实例化三维模型资产（4 处互通立交 + 7 座大桥 + 8 座中桥 + 11 座小桥）
 * 按 5 套 Blender 5.0 导出 .glb 模板沿线自动切线定向落位
 */
export const HIGHWAY_MODEL_ASSETS: HighwayAssetItem[] = [
  // ── 4 处互通立交（含枢纽及配套匝道收费站） ──────────────────────────────────
  {
    id: 'ic_mingshui',
    name: '明水枢纽互通',
    category: 'interchange',
    categoryLabel: '互通立交（枢纽）',
    ratio: 0.02,
    sectionId: 'sec1',
    sectionName: '一工区',
    stake: 'BK2+940',
    designSpeed: '100 km/h（双向四车道）',
    roadbedWidth: '26.0 m',
    structureDesc: '双层十字/苜蓿叶枢纽立交（含匝道收费站 1 座，主线跨线桥与 4 向立体匝道）',
    modelUrl: '/models/interchange-hub.glb',
    modelTemplateLabel: 'interchange-hub.glb（枢纽互通模板）',
    scale: 1.0,
  },
  {
    id: 'ic_tongda',
    name: '通达互通立交',
    category: 'interchange',
    categoryLabel: '互通立交',
    ratio: 0.275,
    sectionId: 'sec2',
    sectionName: '二工区',
    stake: formatStakeFromRatio(0.275),
    designSpeed: '100 / 80 km/h（双向四车道）',
    roadbedWidth: '26.0 m',
    structureDesc: '单喇叭互通式立体交叉 + 配套通达匝道收费站（4 车道收费大棚）',
    modelUrl: '/models/interchange-trumpet.glb',
    modelTemplateLabel: 'interchange-trumpet.glb（一般互通模板）',
    scale: 1.0,
  },
  {
    id: 'ic_baiquan',
    name: '拜泉互通立交',
    category: 'interchange',
    categoryLabel: '互通立交',
    ratio: 0.595,
    sectionId: 'sec4',
    sectionName: '四工区',
    stake: formatStakeFromRatio(0.595),
    designSpeed: '100 / 80 km/h（双向四车道）',
    roadbedWidth: '26.0 m',
    structureDesc: '单喇叭互通式立体交叉 + 配套拜泉匝道收费站（4 车道收费大棚）',
    modelUrl: '/models/interchange-trumpet.glb',
    modelTemplateLabel: 'interchange-trumpet.glb（一般互通模板）',
    scale: 1.0,
  },
  {
    id: 'ic_jianhua',
    name: '建华枢纽互通',
    category: 'interchange',
    categoryLabel: '互通立交（枢纽）',
    ratio: 0.98,
    sectionId: 'sec6',
    sectionName: '六工区',
    stake: 'K143+860',
    designSpeed: '100 / 80 km/h（双向四车道）',
    roadbedWidth: '26.0 m',
    structureDesc: '终点枢纽式立体交叉（含匝道收费站 1 座，衔接建华高速路网）',
    modelUrl: '/models/interchange-hub.glb',
    modelTemplateLabel: 'interchange-hub.glb（枢纽互通模板）',
    scale: 1.0,
  },

  // ── 7 座主线新建大桥（复用 bridge-large.glb） ─────────────────────────────────
  {
    id: 'br_l1',
    name: '乌裕尔河大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.145,
    sectionId: 'sec1',
    sectionName: '一工区',
    stake: formatStakeFromRatio(0.145),
    designSpeed: '100 km/h（起点至乌裕尔河大桥段）',
    roadbedWidth: '26.0 m',
    structureDesc: '双向四车道 6 跨预应力混凝土箱梁大桥，双柱式桥墩 + 盖梁基础',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l2',
    name: '二工区控制性大桥（桥梁示例A）',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.2,
    sectionId: 'sec2',
    sectionName: '二工区',
    stake: 'K34+280',
    designSpeed: resolveSpeedLabel(0.2),
    roadbedWidth: '26.0 m',
    structureDesc: '二工区控制性跨河大桥，双向四车道箱梁桥面与双柱墩结构',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l3',
    name: '三工区跨河大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.365,
    sectionId: 'sec3',
    sectionName: '三工区',
    stake: formatStakeFromRatio(0.365),
    designSpeed: resolveSpeedLabel(0.365),
    roadbedWidth: '26.0 m',
    structureDesc: '双向四车道多跨箱梁大桥，跨度 320m，含防撞护栏与中央分隔带',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l4',
    name: '通肯河大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.485,
    sectionId: 'sec3',
    sectionName: '三工区',
    stake: formatStakeFromRatio(0.485),
    designSpeed: resolveSpeedLabel(0.485),
    roadbedWidth: '26.0 m',
    structureDesc: '跨通肯河主线新建大桥，双向四车道箱梁结构',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l5',
    name: '拜泉西跨线大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.66,
    sectionId: 'sec4',
    sectionName: '四工区',
    stake: formatStakeFromRatio(0.66),
    designSpeed: resolveSpeedLabel(0.66),
    roadbedWidth: '26.0 m',
    structureDesc: '四工区跨河谷主线新建大桥，双向四车道标准断面',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l6',
    name: '五工区跨沟大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.785,
    sectionId: 'sec5',
    sectionName: '五工区',
    stake: formatStakeFromRatio(0.785),
    designSpeed: resolveSpeedLabel(0.785),
    roadbedWidth: '26.0 m',
    structureDesc: '五工区主线新建大桥，6 跨双柱墩箱梁结构',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },
  {
    id: 'br_l7',
    name: '建华跨线大桥',
    category: 'bridge_large',
    categoryLabel: '主线大桥（7座）',
    ratio: 0.905,
    sectionId: 'sec6',
    sectionName: '六工区',
    stake: formatStakeFromRatio(0.905),
    designSpeed: resolveSpeedLabel(0.905),
    roadbedWidth: '26.0 m',
    structureDesc: '六工区主线新建大桥，双向四车道箱梁结构',
    modelUrl: '/models/bridge-large.glb',
    modelTemplateLabel: 'bridge-large.glb（大桥模板）',
    scale: 1.0,
  },

  // ── 8 座主线新建中桥（复用 bridge-medium.glb） ────────────────────────────────
  ...[
    { id: 'br_m1', name: '一工区1号中桥', ratio: 0.075, sectionId: 'sec1', sectionName: '一工区' },
    { id: 'br_m2', name: '二工区1号中桥', ratio: 0.238, sectionId: 'sec2', sectionName: '二工区' },
    { id: 'br_m3', name: '二工区2号中桥', ratio: 0.33, sectionId: 'sec2', sectionName: '二工区' },
    { id: 'br_m4', name: '三工区1号中桥', ratio: 0.435, sectionId: 'sec3', sectionName: '三工区' },
    { id: 'br_m5', name: '四工区1号中桥', ratio: 0.54, sectionId: 'sec4', sectionName: '四工区' },
    { id: 'br_m6', name: '五工区1号中桥', ratio: 0.715, sectionId: 'sec5', sectionName: '五工区' },
    { id: 'br_m7', name: '五工区2号中桥', ratio: 0.835, sectionId: 'sec5', sectionName: '五工区' },
    { id: 'br_m8', name: '六工区1号中桥', ratio: 0.94, sectionId: 'sec6', sectionName: '六工区' },
  ].map((b) => ({
    ...b,
    category: 'bridge_medium' as const,
    categoryLabel: '主线中桥（8座）',
    stake: formatStakeFromRatio(b.ratio),
    designSpeed: resolveSpeedLabel(b.ratio),
    roadbedWidth: '26.0 m',
    structureDesc: '3 跨双向四车道预应力箱梁中桥，2 组双柱墩 + 桥台锥坡',
    modelUrl: '/models/bridge-medium.glb',
    modelTemplateLabel: 'bridge-medium.glb（中桥模板）',
    scale: 1.0,
  })),

  // ── 11 座主线新建小桥（复用 bridge-small.glb） ────────────────────────────────
  ...[
    { id: 'br_s1', name: '一工区1号小桥', ratio: 0.05, sectionId: 'sec1', sectionName: '一工区' },
    { id: 'br_s2', name: '一工区2号小桥', ratio: 0.105, sectionId: 'sec1', sectionName: '一工区' },
    { id: 'br_s3', name: '二工区1号小桥', ratio: 0.172, sectionId: 'sec2', sectionName: '二工区' },
    { id: 'br_s4', name: '二工区2号小桥', ratio: 0.305, sectionId: 'sec2', sectionName: '二工区' },
    { id: 'br_s5', name: '三工区1号小桥', ratio: 0.4, sectionId: 'sec3', sectionName: '三工区' },
    { id: 'br_s6', name: '三工区2号小桥', ratio: 0.46, sectionId: 'sec3', sectionName: '三工区' },
    { id: 'br_s7', name: '四工区1号小桥', ratio: 0.515, sectionId: 'sec4', sectionName: '四工区' },
    { id: 'br_s8', name: '四工区2号小桥', ratio: 0.63, sectionId: 'sec4', sectionName: '四工区' },
    { id: 'br_s9', name: '五工区1号小桥', ratio: 0.69, sectionId: 'sec5', sectionName: '五工区' },
    { id: 'br_s10', name: '五工区2号小桥', ratio: 0.81, sectionId: 'sec5', sectionName: '五工区' },
    { id: 'br_s11', name: '六工区1号小桥', ratio: 0.872, sectionId: 'sec6', sectionName: '六工区' },
  ].map((b) => ({
    ...b,
    category: 'bridge_small' as const,
    categoryLabel: '主线小桥（11座）',
    stake: formatStakeFromRatio(b.ratio),
    designSpeed: resolveSpeedLabel(b.ratio),
    roadbedWidth: '26.0 m',
    structureDesc: '单跨双向四车道简支板桥，含两端斜坡桥台及防撞护栏',
    modelUrl: '/models/bridge-small.glb',
    modelTemplateLabel: 'bridge-small.glb（小桥模板）',
    scale: 1.0,
  })),
];

/**
 * 2 处服务区 + 2 处养护工区（按约定仅使用地图点位标注，不加载 3D 模型）
 */
export const HIGHWAY_FACILITIES: HighwayAssetItem[] = [
  {
    id: 'fac_svc_1',
    name: '明水服务区',
    category: 'service_area',
    categoryLabel: '服务区（2处）',
    ratio: 0.256,
    sectionId: 'sec2',
    sectionName: '二工区',
    stake: formatStakeFromRatio(0.256),
    designSpeed: '100 / 80 km/h',
    roadbedWidth: '26.0 m',
    structureDesc: '双侧配套服务区（综合服务楼、停车坪与新能源补能区，采用点位标注演示）',
  },
  {
    id: 'fac_svc_2',
    name: '拜泉服务区',
    category: 'service_area',
    categoryLabel: '服务区（2处）',
    ratio: 0.752,
    sectionId: 'sec5',
    sectionName: '五工区',
    stake: formatStakeFromRatio(0.752),
    designSpeed: '100 / 80 km/h',
    roadbedWidth: '26.0 m',
    structureDesc: '双侧配套服务区（综合服务楼、停车坪与加油站区，采用点位标注演示）',
  },
  {
    id: 'fac_mnt_1',
    name: '明水养护工区',
    category: 'maintenance_area',
    categoryLabel: '养护工区（2处）',
    ratio: 0.125,
    sectionId: 'sec1',
    sectionName: '一工区',
    stake: formatStakeFromRatio(0.125),
    designSpeed: '100 km/h',
    roadbedWidth: '26.0 m',
    structureDesc: '路段综合养护工区（含除雪应急备料库与养护机械停放坪，采用点位标注演示）',
  },
  {
    id: 'fac_mnt_2',
    name: '北安养护工区',
    category: 'maintenance_area',
    categoryLabel: '养护工区（2处）',
    ratio: 0.855,
    sectionId: 'sec5',
    sectionName: '五工区',
    stake: formatStakeFromRatio(0.855),
    designSpeed: '100 / 80 km/h',
    roadbedWidth: '26.0 m',
    structureDesc: '北段综合养护工区（含路面巡检与冬季防滑保通物资库，采用点位标注演示）',
  },
];

export const ALL_HIGHWAY_ASSETS: HighwayAssetItem[] = [
  ...HIGHWAY_MODEL_ASSETS,
  ...HIGHWAY_FACILITIES,
];
