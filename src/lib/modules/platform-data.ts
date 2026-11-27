export const STATIC_WORK_SECTIONS = [
  {
    id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500', x: 41.5, y: 76.5,
    scale: 1.32, panX: 4, panY: -12,
    summary: { sections: 1, keyWorks: 2, yards: 1 },
    progress: [78.4, 68.2, 52.0, 92.0, 38.5, 34.0],
    quality: [99.6, 99.0, 99.4, 98.1, 99.3, 95.8],
    safety: [97.4, 100, 99.0, 96.5, 100, 94.2],
  },
  {
    id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200', x: 30.8, y: 51.5,
    scale: 1.35, panX: 5, panY: -2,
    summary: { sections: 1, keyWorks: 3, yards: 2 },
    progress: [74.6, 66.8, 49.5, 91.2, 35.0, 30.2],
    quality: [99.5, 98.9, 99.5, 97.9, 99.2, 96.0],
    safety: [96.8, 100, 98.8, 95.8, 100, 93.6],
  },
  {
    id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800', x: 28.8, y: 35.5,
    scale: 1.42, panX: 9, panY: 9,
    summary: { sections: 1, keyWorks: 2, yards: 2 },
    progress: [71.2, 61.5, 45.4, 87.5, 31.2, 27.4],
    quality: [99.2, 98.6, 99.0, 97.4, 98.9, 93.5],
    safety: [95.9, 100, 98.2, 94.6, 100, 92.1],
  },
  {
    id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000', x: 34.5, y: 22.0,
    scale: 1.52, panX: 6, panY: 18,
    summary: { sections: 1, keyWorks: 2, yards: 1 },
    progress: [69.5, 60.1, 43.2, 85.4, 29.8, 25.9],
    quality: [99.1, 98.5, 98.8, 97.2, 99.0, 94.0],
    safety: [95.5, 100, 98.0, 94.0, 100, 91.5],
  },
  {
    id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400', x: 46.5, y: 14.2,
    scale: 1.6, panX: 1, panY: 22,
    summary: { sections: 1, keyWorks: 2, yards: 1 },
    progress: [72.0, 62.0, 46.0, 88.0, 31.8, 28.0],
    quality: [99.3, 98.8, 99.1, 97.5, 99.1, 94.8],
    safety: [96.0, 100, 98.4, 95.0, 100, 92.5],
  },
  {
    id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800', x: 58.2, y: 9.8,
    scale: 1.65, panX: -6, panY: 25,
    summary: { sections: 1, keyWorks: 1, yards: 1 },
    progress: [70.8, 61.8, 44.1, 89.2, 28.7, 26.1],
    quality: [99.4, 98.7, 99.2, 97.6, 98.8, 94.2],
    safety: [96.1, 100, 98.6, 94.8, 100, 93.0],
  },
];

export const MANAGEMENT_TAB_DEFS = {
  progress: [
    { key: 'subgrade', name: '路基工程', pct: 72.8, icon: 'subgrade' },
    { key: 'bridge', name: '桥梁工程', pct: 63.4, icon: 'bridge' },
    { key: 'pavement', name: '路面工程', pct: 46.7, icon: 'pavement' },
    { key: 'yard', name: '场站工程', pct: 88.9, icon: 'yard' },
    { key: 'safetyFac', name: '交安工程', pct: 32.5, icon: 'guardrail' },
    { key: 'green', name: '绿化工程', pct: 28.6, icon: 'leaf' },
  ],
  quality: [
    { key: 'pile', name: '桩基检测合格率', pct: 99.4, icon: 'bridge' },
    { key: 'concrete', name: '混凝土强度合格率', pct: 98.8, icon: 'yard' },
    { key: 'beam', name: '预制梁抽检合格率', pct: 99.2, icon: 'subgrade' },
    { key: 'compact', name: '路基压实度合格率', pct: 97.6, icon: 'pavement' },
    { key: 'mix', name: '拌合站数据合规率', pct: 99.1, icon: 'guardrail' },
    { key: 'rectify', name: '质量隐患闭环率', pct: 94.5, icon: 'leaf' },
  ],
  safety: [
    { key: 'hazard', name: '安全隐患闭环率', pct: 96.2, icon: 'guardrail' },
    { key: 'edu', name: '班前教育覆盖率', pct: 100.0, icon: 'subgrade' },
    { key: 'risk', name: '危大工程管控率', pct: 98.5, icon: 'bridge' },
    { key: 'site', name: '平安工地达标率', pct: 95.0, icon: 'yard' },
    { key: 'equip', name: '特种设备年检率', pct: 100.0, icon: 'pavement' },
    { key: 'ai', name: 'AI风险识别处置率', pct: 92.8, icon: 'leaf' },
  ],
} as const;

export const ROAMING_STATIONS = [
  {
    id: 'start',
    name: '明水方向起点',
    section: '一工区',
    stage: 'BK0+000 路基交验与底基层施工',
    photos: 6, videos: 2, inspections: 18,
    imgPath: '/assets/corridor_aerial.jpg',
    duration: '03:20',
    desc: '项目起点位于明水县北新发四队东南侧（BK0+000，125.8202°E, 47.2916°N），路基土石方工程已基本成型。',
  },
  {
    id: 'bridgeA',
    name: '桥梁示例A',
    section: '二工区',
    stage: '梁板架设',
    photos: 3, videos: 2, inspections: 26,
    imgPath: '/assets/milestone_after.jpg',
    duration: '05:00',
    desc: '二工区控制性跨河大桥，当前正在开展主跨 40m 预制箱梁架设作业。',
  },
  {
    id: 'beamYardA',
    name: '梁场示例A',
    section: '二工区',
    stage: '智慧梁场预制生产',
    photos: 8, videos: 4, inspections: 41,
    imgPath: '/assets/corridor_aerial.jpg',
    duration: '04:30',
    desc: '标准化智慧预制梁场，配置自动喷淋养护与智能张拉压浆系统。',
  },
  {
    id: 'batchPlantA',
    name: '拌合站示例A',
    section: '二工区',
    stage: '智能拌合供料',
    photos: 5, videos: 3, inspections: 34,
    imgPath: '/assets/showcase_viaduct.jpg',
    duration: '03:45',
    desc: '全封闭式绿色混凝土拌合站，实现骨料计量与配比偏差实时预警。',
  },
  {
    id: 'end',
    name: '北安方向终点',
    section: '六工区',
    stage: '建华枢纽互通主线贯通冲刺',
    photos: 4, videos: 2, inspections: 22,
    imgPath: '/assets/showcase_viaduct.jpg',
    duration: '04:10',
    desc: '项目终点位于北安市建华枢纽互通（126.4135°E, 48.2372°N），同步落实沿线黑土地表土剥离复垦保护。',
  },
];

export const STATIC_POI_OBJECTS: Record<string, {
  id: string; name: string; type: string; sectionId: string; section: string;
  stage: string; stake: string; camera: string; icon: string; imgPath: string;
  duration: string; elapsed: number; photos: number; videos: number; inspections: number;
  metrics: { length: string; progress: string; beamsDone: string; supervisor: string };
  docs: Array<{ name: string; type: string; date: string; size: string }>;
}> = {
  bridgeA: {
    id: 'bridgeA', name: '桥梁示例A', type: '桥梁工程', sectionId: 'sec2', section: '二工区',
    stage: '梁板架设', stake: 'K34+280', camera: '桥梁示例A · 01号摄像机', icon: 'bridge',
    imgPath: '/assets/milestone_after.jpg', duration: '05:00', elapsed: 12,
    photos: 3, videos: 2, inspections: 26,
    metrics: { length: '684 m', progress: '68.5%', beamsDone: '56 / 80 片', supervisor: '张建国 (二工区总工)' },
    docs: [
      { name: '桥梁示例A 预制箱梁架设专项施工方案.pdf', type: '施工方案', date: '2026-10-18', size: '6.4 MB' },
      { name: 'K34+280 主桥墩柱混凝土抗压强度检测报告.pdf', type: '试验检测', date: '2026-10-29', size: '2.1 MB' },
    ],
  },
  beamYardA: {
    id: 'beamYardA', name: '梁场示例A', type: '场站工程', sectionId: 'sec2', section: '二工区',
    stage: '智慧梁场预制生产', stake: 'K35+120 右侧', camera: '梁场示例A · 龙门吊02号枪机', icon: 'yard',
    imgPath: '/assets/corridor_aerial.jpg', duration: '04:30', elapsed: 38,
    photos: 8, videos: 4, inspections: 41,
    metrics: { length: '占地 42 亩', progress: '91.2%', beamsDone: '218 / 240 片', supervisor: '李明远 (梁场场长)' },
    docs: [
      { name: '智慧梁场智能张拉与压浆自动采集台账.xlsx', type: '质量台账', date: '2026-11-22', size: '3.2 MB' },
    ],
  },
  batchPlantA: {
    id: 'batchPlantA', name: '拌合站示例A', type: '场站工程', sectionId: 'sec2', section: '二工区',
    stage: '全天候智能拌合供料', stake: 'K33+860 右侧', camera: '拌合站示例A · 料仓全景球机', icon: 'plant',
    imgPath: '/assets/showcase_viaduct.jpg', duration: '03:45', elapsed: 24,
    photos: 5, videos: 3, inspections: 34,
    metrics: { length: '双 HZS180 机组', progress: '88.9%', beamsDone: '累计产能 9.4万 m³', supervisor: '王志强 (站长)' },
    docs: [
      { name: 'C50 预应力混凝土配合比动态监测周报.pdf', type: '配合比报告', date: '2026-11-24', size: '2.7 MB' },
    ],
  },
};

export const LEGACY_ICONS: Record<string, string> = {
  chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>`,
  close: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  road: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38f2ff" stroke-width="2"><path d="M5 20L9 4M19 20L15 4M12 6v3M12 12v3M12 18v2"/></svg>`,
  helmet: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><path d="M4 15a8 8 0 0116 0H4z"/><path d="M2 15h20v2a1 1 0 01-1 1H3a1 1 0 01-1-1v-2z"/><path d="M12 7v4"/></svg>`,
  layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
  yard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#93e5ff" stroke-width="1.8"><path d="M3 20V8l9-5 9 5v12"/><path d="M7 20v-7h10v7"/><path d="M7 13h10"/></svg>`,
  subgrade: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 18h18M5 18l3-7h8l3 7M9 11V7l5 2"/></svg>`,
  bridge: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M2 9h20M2 13h20M6 13v7M18 13v7M6 13a6 6 0 0112 0"/></svg>`,
  pavement: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20L8 4M20 20L16 4M12 7v3M12 13v4"/></svg>`,
  guardrail: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 9h18M3 14h18M6 6v13M18 6v13"/></svg>`,
  leaf: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M11 20A7 7 0 019.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10z"/></svg>`,
  plant: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 20V7a2 2 0 012-2h3a2 2 0 012 2v13M13 20v-9l4-2 3 2v9M2 20h20"/></svg>`,
  flag: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#38f2ff" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
  alert: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#60a5fa" stroke-width="2"><circle cx="12" cy="12" r="9"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  play: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
  pause: `<svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
  doc: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
  photo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="8.5" cy="9.5" r="1.5"/><path d="M21 15l-5-5L5 20"/></svg>`,
  video: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="3" y="5" width="18" height="14" rx="2"/><polygon points="10 9 15 12 10 15 10 9" fill="currentColor"/></svg>`,
  drone: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M5 7h5M14 7h5M7.5 7l2.5 5h4l2.5-5M8 17l2-5h4l2 5M9 12h6"/></svg>`,
  bim: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M12 2l9 5v10l-9 5-9-5V7l9-5z"/><path d="M12 22V12M21 7l-9 5-9-5"/></svg>`,
  pin: `<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s7-6.2 7-12a7 7 0 10-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/></svg>`,
  camera: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  shield: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 2l8 4v6c0 5.2-3.4 9.2-8 10-4.6-.8-8-4.8-8-10V6l8-4z"/><path d="M9 12l2 2 4-4"/></svg>`,
  speed: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17l6-6 4 4 8-8"/><polyline points="15 7 21 7 21 13"/></svg>`,
  calendar: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>`,
};
