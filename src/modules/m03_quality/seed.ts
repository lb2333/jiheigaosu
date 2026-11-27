import type { db } from '@/db';
import {
  qualitySectionMetrics,
  qualityInspections,
  qualityLabRecords,
  qualityMixingRecords,
  qualityPavementRecords,
  qualityBeamRecords,
  qualityIssues,
  type MixingMaterialItem,
} from '@/db/schema/domains/m03';

export async function seedM03(dbInstance: typeof db) {
  const sectionRows = [
    {
      sectionId: 'sec1',
      name: '一工区',
      shortName: '一工区',
      labName: '一工区实验室',
      stationShort: '一号站',
      stationFull: '一号拌合站',
      yardName: '一号梁场',
      stakeRange: 'K0+000 ~ K24+500',
      labBatches: 1468,
      labPassRate: 98.9,
      mixVol: 7.6,
      mixBatches: 508,
      beams: 112,
      pavKm: 8.4,
      pavSegments: 3,
      issuesCount: 1,
      qualityRate: 98.9,
      sortOrder: 1,
    },
    {
      sectionId: 'sec2',
      name: '二工区',
      shortName: '二工区',
      labName: '二工区实验室',
      stationShort: '二号站',
      stationFull: '二号拌合站',
      yardName: '二号梁场',
      stakeRange: 'K24+500 ~ K48+200',
      labBatches: 1524,
      labPassRate: 98.4,
      mixVol: 6.8,
      mixBatches: 455,
      beams: 118,
      pavKm: 7.6,
      pavSegments: 3,
      issuesCount: 3,
      qualityRate: 98.4,
      sortOrder: 2,
    },
    {
      sectionId: 'sec3',
      name: '三工区',
      shortName: '三工区',
      labName: '三工区实验室',
      stationShort: '三号站',
      stationFull: '三号拌合站',
      yardName: '一号梁场',
      stakeRange: 'K48+200 ~ K72+800',
      labBatches: 1384,
      labPassRate: 98.7,
      mixVol: 6.2,
      mixBatches: 414,
      beams: 106,
      pavKm: 7.2,
      pavSegments: 3,
      issuesCount: 2,
      qualityRate: 98.7,
      sortOrder: 3,
    },
    {
      sectionId: 'sec4',
      name: '四工区',
      shortName: '四工区',
      labName: '四工区实验室',
      stationShort: '四号站',
      stationFull: '四号拌合站',
      yardName: '二号梁场',
      stakeRange: 'K72+800 ~ K96+000',
      labBatches: 1327,
      labPassRate: 98.6,
      mixVol: 5.9,
      mixBatches: 394,
      beams: 102,
      pavKm: 6.8,
      pavSegments: 3,
      issuesCount: 3,
      qualityRate: 98.6,
      sortOrder: 4,
    },
    {
      sectionId: 'sec5',
      name: '五工区',
      shortName: '五工区',
      labName: '五工区实验室',
      stationShort: '五号站',
      stationFull: '五号拌合站',
      yardName: '一号梁场',
      stakeRange: 'K96+000 ~ K121+400',
      labBatches: 1468,
      labPassRate: 98.8,
      mixVol: 5.4,
      mixBatches: 361,
      beams: 104,
      pavKm: 6.6,
      pavSegments: 3,
      issuesCount: 2,
      qualityRate: 98.8,
      sortOrder: 5,
    },
    {
      sectionId: 'sec6',
      name: '六工区',
      shortName: '六工区',
      labName: '六工区实验室',
      stationShort: '六号站',
      stationFull: '六号拌合站',
      yardName: '二号梁场',
      stakeRange: 'K121+400 ~ K146+800',
      labBatches: 1265,
      labPassRate: 99.0,
      mixVol: 4.9,
      mixBatches: 328,
      beams: 98,
      pavKm: 6.0,
      pavSegments: 3,
      issuesCount: 1,
      qualityRate: 99.0,
      sortOrder: 6,
    },
  ];

  for (const row of sectionRows) {
    await dbInstance
      .insert(qualitySectionMetrics)
      .values(row)
      .onConflictDoUpdate({
        target: qualitySectionMetrics.sectionId,
        set: {
          name: row.name,
          shortName: row.shortName,
          labName: row.labName,
          stationShort: row.stationShort,
          stationFull: row.stationFull,
          yardName: row.yardName,
          stakeRange: row.stakeRange,
          labBatches: row.labBatches,
          labPassRate: row.labPassRate,
          mixVol: row.mixVol,
          mixBatches: row.mixBatches,
          beams: row.beams,
          pavKm: row.pavKm,
          pavSegments: row.pavSegments,
          issuesCount: row.issuesCount,
          qualityRate: row.qualityRate,
          sortOrder: row.sortOrder,
          updatedAt: new Date(),
        },
      });
  }

  const inspectionRows = [
    { id: 'QJ-20261125-01', sectionId: 'sec2', section: '二工区', category: '施工工艺', target: '二号拌合站', content: '水稳混合料含水率', result: '不合格', description: '含水率超出控制范围', rectify: '已整改', inspectedAt: '2026-11-25 09:40', measured: '5.8%', standard: '4.5%~5.3%', inspector: '刘志鹏', note: '已调整骨料冷料仓含水补偿参数并复检合格。', sortOrder: 1 },
    { id: 'QJ-20261125-02', sectionId: 'sec3', section: '三工区', category: '构件质量', target: '一号梁场', content: '预制箱梁外观质量', result: '不合格', description: '梁体局部蜂窝麻面', rectify: '整改中', inspectedAt: '2026-11-24 14:10', measured: '局部 0.18m²', standard: '表面平整密实无蜂窝', inspector: '陈晓宇', note: '正在按监理批准方案采用高标号聚合物砂浆修补打磨。', sortOrder: 2 },
    { id: 'QJ-20261125-03', sectionId: 'sec4', section: '四工区', category: '施工工艺', target: '沥青中面层', content: '摊铺厚度', result: '不合格', description: '实测厚度偏小', rectify: '已整改', inspectedAt: '2026-11-24 10:20', measured: '5.1 cm', standard: '5.8~6.2 cm', inspector: '周海涛', note: '已校核摊铺机平衡梁传感器并完成补铺复核。', sortOrder: 3 },
    { id: 'QJ-20261125-04', sectionId: 'sec1', section: '一工区', category: '原材料', target: '钢筋加工场', content: '钢筋力学性能', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-25 08:50', measured: '屈服 432 MPa', standard: '≥ 400 MPa', inspector: '赵建军', note: 'HRB400E 螺纹钢抗拉与冷弯性能均符合设计要求。', sortOrder: 4 },
    { id: 'QJ-20261125-05', sectionId: 'sec5', section: '五工区', category: '构件质量', target: '二号梁场', content: '梁片预应力张拉', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-25 08:15', measured: '伸长量偏差 +2.1%', standard: '±6% 以内', inspector: '孙明辉', note: '双控张拉千斤顶与油表校验同步在线采集正常。', sortOrder: 5 },
    { id: 'QJ-20261124-06', sectionId: 'sec6', section: '六工区', category: '检测', target: '建华枢纽路基', content: '路基压实度灌砂检测', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-24 16:35', measured: '96.8%', standard: '≥ 96.0%', inspector: '韩立新', note: '上路床 96 区压实度抽检 12 点全部达标。', sortOrder: 6 },
    { id: 'QJ-20261124-07', sectionId: 'sec2', section: '二工区', category: '原材料', target: '粗集料堆场', content: '粗集料针片状含量', result: '不合格', description: '针片状颗粒含量偏高', rectify: '已整改', inspectedAt: '2026-11-24 11:20', measured: '16.4%', standard: '≤ 15.0%', inspector: '刘志鹏', note: '已退场处理 120 吨并更换反击破筛网。', sortOrder: 7 },
    { id: 'QJ-20261123-08', sectionId: 'sec4', section: '四工区', category: '检测', target: '跨河中桥 3#墩', content: '混凝土 28d 抗压强度', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-23 15:10', measured: '45.6 MPa', standard: '≥ 40.0 MPa (C40)', inspector: '周海涛', note: '同条件及标准养护试块强度评定合格。', sortOrder: 8 },
    { id: 'QJ-20261123-09', sectionId: 'sec3', section: '三工区', category: '原材料', target: '水泥罐区 2#', content: 'P·O 42.5 水泥安定性', result: '不合格', description: '雷氏夹沸煮法临界值波动', rectify: '已整改', inspectedAt: '2026-11-23 09:50', measured: '4.8 mm', standard: '≤ 5.0 mm (内控≤3.5)', inspector: '陈晓宇', note: '复检合格，已加强进场散装水泥留样频次。', sortOrder: 9 },
    { id: 'QJ-20261122-10', sectionId: 'sec5', section: '五工区', category: '施工工艺', target: 'K104+300 路面', content: '沥青混合料摊铺温度', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-22 14:40', measured: '154 ℃', standard: '145~165 ℃', inspector: '孙明辉', note: '全幅摊铺红外测温分布均匀，无低温离析。', sortOrder: 10 },
    { id: 'QJ-20261122-11', sectionId: 'sec1', section: '一工区', category: '检测', target: 'K12+600 桥台', content: '桩基超声波透射法检测', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-22 10:05', measured: '声速 4.38 km/s', standard: 'I 类桩要求', inspector: '赵建军', note: '全部 16 根桩基评定为 I 类桩，波形连续清晰。', sortOrder: 11 },
    { id: 'QJ-20261121-12', sectionId: 'sec6', section: '六工区', category: '构件质量', target: '二号梁场', content: '孔道压浆密实度抽检', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-21 16:00', measured: '充盈度 100%', standard: '无空洞脱空', inspector: '韩立新', note: '真空辅助智能压浆压力稳压 0.62 MPa 持荷 5 分钟。', sortOrder: 12 },
    { id: 'QJ-20261121-13', sectionId: 'sec2', section: '二工区', category: '施工工艺', target: '桥梁示例A 主跨', content: '支座垫石平整度与高程', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-21 11:30', measured: '±1.2 mm', standard: '±2.0 mm', inspector: '刘志鹏', note: '激光水准仪复测全部垫石标高符合架梁精度要求。', sortOrder: 13 },
    { id: 'QJ-20261120-14', sectionId: 'sec4', section: '四工区', category: '原材料', target: '四号拌合站', content: 'SBS 改性沥青软化点', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-20 15:20', measured: '68.5 ℃', standard: '≥ 60.0 ℃', inspector: '周海涛', note: '针入度、延度及软化点全指标满足寒区指标。', sortOrder: 14 },
    { id: 'QJ-20261120-15', sectionId: 'sec1', section: '一工区', category: '检测', target: 'K08+120 水稳基层', content: '7日无侧限抗压强度', result: '合格', description: '—', rectify: '—', inspectedAt: '2026-11-20 09:45', measured: '4.6 MPa', standard: '≥ 4.0 MPa', inspector: '赵建军', note: '水泥剂量 4.5%，7日强度富余系数充足。', sortOrder: 15 },
  ];

  await dbInstance.insert(qualityInspections).values(inspectionRows).onConflictDoNothing();

  const labRows = [
    { id: 'JC-20261125-018', sectionId: 'sec2', lab: '二工区实验室', category: '原材料', sample: '粗集料', item: '针片状含量', testedAt: '11-25 10:12', result: '不合格', reportState: '已出具', retestState: '待复检', measured: '16.4%', limitSpec: '≤ 15.0%', machine: '电子游标卡尺规准仪', hash: '9F4A...82C1', sortOrder: 1 },
    { id: 'JC-20261125-017', sectionId: 'sec1', lab: '一工区实验室', category: '混合料', sample: '水泥稳定碎石', item: '7日无侧限抗压强度', testedAt: '11-25 10:04', result: '合格', reportState: '已出具', retestState: '正常', measured: '4.6 MPa', limitSpec: '≥ 4.0 MPa', machine: 'WAW-1000B 万能试验机', hash: '7C2E...14B9', sortOrder: 2 },
    { id: 'JC-20261125-016', sectionId: 'sec5', lab: '五工区实验室', category: '原材料', sample: '钢筋 HRB400', item: '屈服强度与伸长率', testedAt: '11-25 09:46', result: '合格', reportState: '已出具', retestState: '正常', measured: '436 MPa / 18.5%', limitSpec: '≥ 400 MPa / ≥ 16%', machine: 'WEW-600D 液压万能机', hash: '3D8A...51E0', sortOrder: 3 },
    { id: 'JC-20261125-015', sectionId: 'sec4', lab: '四工区实验室', category: '混合料', sample: '沥青混合料', item: '马歇尔稳定度', testedAt: '11-25 09:31', result: '不合格', reportState: '已出具', retestState: '待复检', measured: '7.4 kN', limitSpec: '≥ 8.0 kN', machine: 'SYD-0709A 自动马歇尔仪', hash: '6B11...7A44', sortOrder: 4 },
    { id: 'JC-20261125-014', sectionId: 'sec6', lab: '六工区实验室', category: '混凝土', sample: '混凝土试件', item: '28日抗压强度', testedAt: '11-25 09:18', result: '合格', reportState: '待出具', retestState: '正常', measured: '54.8 MPa', limitSpec: '≥ 50.0 MPa (C50)', machine: 'YAW-3000B 全自动压力机', hash: '待签章生成', sortOrder: 5 },
    { id: 'JC-20261124-026', sectionId: 'sec3', lab: '三工区实验室', category: '原材料', sample: 'P·O 42.5 水泥', item: '水泥安定性', testedAt: '11-24 15:22', result: '不合格', reportState: '已出具', retestState: '已复检', measured: '4.8 mm → 1.9 mm', limitSpec: '≤ 5.0 mm', machine: 'FZ-31A 雷氏沸煮箱', hash: '4E09...C312', sortOrder: 6 },
    { id: 'JC-20261124-021', sectionId: 'sec2', lab: '二工区实验室', category: '混凝土', sample: 'C50 预应力箱梁试块', item: '7日弹性模量', testedAt: '11-24 13:50', result: '合格', reportState: '已出具', retestState: '正常', measured: '3.52×10⁴ MPa', limitSpec: '≥ 3.45×10⁴ MPa', machine: 'WAW-1000B 万能试验机', hash: '2A7F...90B3', sortOrder: 7 },
    { id: 'JC-20261124-019', sectionId: 'sec1', lab: '一工区实验室', category: '路基路面', sample: '路基填土', item: '击实试验最大干密度', testedAt: '11-24 11:15', result: '合格', reportState: '已出具', retestState: '正常', measured: '2.14 g/cm³', limitSpec: '设计基准 2.10', machine: 'JDS-3 自动电动击实仪', hash: '8F33...2E11', sortOrder: 8 },
    { id: 'JC-20261124-012', sectionId: 'sec3', lab: '三工区实验室', category: '混合料', sample: 'AC-20C 沥青混合料', item: '油石比抽提检验', testedAt: '11-24 09:40', result: '合格', reportState: '已出具', retestState: '正常', measured: '4.62%', limitSpec: '4.5%~4.9%', machine: '自动离心式沥青抽提仪', hash: '1C5D...88A2', sortOrder: 9 },
    { id: 'JC-20261123-031', sectionId: 'sec5', lab: '五工区实验室', category: '路基路面', sample: '水稳基层芯样', item: '抗压强度与完整性', testedAt: '11-23 16:08', result: '合格', reportState: '已出具', retestState: '正常', measured: '芯样完整 4.9 MPa', limitSpec: '≥ 4.0 MPa', machine: 'YAW-2000 压力试验机', hash: '5A20...41F8', sortOrder: 10 },
    { id: 'JC-20261123-028', sectionId: 'sec4', lab: '四工区实验室', category: '其他', sample: '桥梁伸缩缝止水带', item: '拉伸强度与扯断伸长率', testedAt: '11-23 14:15', result: '合格', reportState: '已出具', retestState: '正常', measured: '16.2 MPa / 440%', limitSpec: '≥ 14 MPa / ≥ 380%', machine: 'WDW-50 电子拉力机', hash: '7D18...66C0', sortOrder: 11 },
    { id: 'JC-20261123-022', sectionId: 'sec6', lab: '六工区实验室', category: '原材料', sample: '机制砂（中砂）', item: '含泥量及细度模数', testedAt: '11-23 10:30', result: '合格', reportState: '已出具', retestState: '正常', measured: '1.8% / 2.65', limitSpec: '≤ 3.0% / 2.3~3.0', machine: '标准振筛机', hash: '0E91...3B77', sortOrder: 12 },
  ];

  await dbInstance.insert(qualityLabRecords).values(labRows).onConflictDoNothing();

  const mixingRows: Array<{
    id: string;
    sectionId: string;
    section: string;
    station: string;
    prodType: string;
    mixCode: string;
    volume: number;
    producedAt: string;
    judge: string;
    alertTitle: string;
    handled: boolean;
    handleNote: string;
    temp: string;
    deviation: string;
    materials: MixingMaterialItem[];
    sortOrder: number;
  }> = [
    {
      id: 'BH-20261125-062', sectionId: 'sec2', section: '二工区', station: '二号拌合站', prodType: '水泥稳定碎石', mixCode: 'WS-05', volume: 168.0, producedAt: '11-25 10:21',
      judge: '预警', alertTitle: '二号拌合站 · 含水率超限', handled: false, handleNote: '', temp: '18 ℃', deviation: '+0.9%', sortOrder: 1,
      materials: [
        { name: '水泥 P·O 42.5', target: 4.5, actual: 4.52, unit: '%' },
        { name: '10-20mm碎石', target: 38.0, actual: 37.8, unit: '%' },
        { name: '5-10mm碎石', target: 26.0, actual: 26.1, unit: '%' },
        { name: '0-5mm石屑', target: 31.5, actual: 31.6, unit: '%' },
        { name: '拌合水', target: 4.8, actual: 5.7, unit: '%' },
      ],
    },
    {
      id: 'BH-20261125-061', sectionId: 'sec1', section: '一工区', station: '一号拌合站', prodType: '水泥混凝土', mixCode: 'C40', volume: 148.0, producedAt: '11-25 10:16',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '21 ℃', deviation: '±0.3%', sortOrder: 2,
      materials: [
        { name: '水泥', target: 395, actual: 396, unit: 'kg/m³' },
        { name: '粉煤灰', target: 65, actual: 65, unit: 'kg/m³' },
        { name: '碎石', target: 1090, actual: 1093, unit: 'kg/m³' },
        { name: '中砂', target: 715, actual: 713, unit: 'kg/m³' },
        { name: '拌合水', target: 158, actual: 157, unit: 'kg/m³' },
      ],
    },
    {
      id: 'BH-20261125-060', sectionId: 'sec4', section: '四工区', station: '四号拌合站', prodType: '沥青混合料', mixCode: 'AC-20', volume: 126.5, producedAt: '11-25 10:08',
      judge: '预警', alertTitle: '四号拌合站 · 出料温度偏低', handled: false, handleNote: '', temp: '141 ℃', deviation: '-9 ℃', sortOrder: 3,
      materials: [
        { name: 'SBS 改性沥青', target: 4.6, actual: 4.58, unit: '%' },
        { name: '10-20mm玄武岩', target: 34.0, actual: 34.2, unit: '%' },
        { name: '5-10mm碎石', target: 28.0, actual: 27.9, unit: '%' },
        { name: '机制砂', target: 32.0, actual: 32.1, unit: '%' },
        { name: '矿粉', target: 6.0, actual: 5.8, unit: '%' },
      ],
    },
    {
      id: 'BH-20261125-059', sectionId: 'sec3', section: '三工区', station: '三号拌合站', prodType: '水泥混凝土', mixCode: 'C50', volume: 96.0, producedAt: '11-25 09:55',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '22 ℃', deviation: '±0.4%', sortOrder: 4,
      materials: [
        { name: '水泥', target: 440, actual: 441, unit: 'kg/m³' },
        { name: '矿粉', target: 55, actual: 55, unit: 'kg/m³' },
        { name: '碎石', target: 1075, actual: 1078, unit: 'kg/m³' },
        { name: '中砂', target: 690, actual: 688, unit: 'kg/m³' },
        { name: '减水剂', target: 5.2, actual: 5.21, unit: 'kg/m³' },
      ],
    },
    {
      id: 'BH-20261125-058', sectionId: 'sec5', section: '五工区', station: '五号拌合站', prodType: '水泥稳定碎石', mixCode: 'WS-04', volume: 173.0, producedAt: '11-25 09:37',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '17 ℃', deviation: '±0.2%', sortOrder: 5,
      materials: [
        { name: '水泥 P·O 42.5', target: 4.2, actual: 4.21, unit: '%' },
        { name: '10-20mm碎石', target: 36.0, actual: 36.0, unit: '%' },
        { name: '5-10mm碎石', target: 28.0, actual: 27.9, unit: '%' },
        { name: '0-5mm石屑', target: 31.8, actual: 31.9, unit: '%' },
        { name: '拌合水', target: 4.9, actual: 4.92, unit: '%' },
      ],
    },
    {
      id: 'BH-20261124-077', sectionId: 'sec3', section: '三工区', station: '三号拌合站', prodType: '水泥混凝土', mixCode: 'C35', volume: 112.0, producedAt: '11-24 16:16',
      judge: '预警', alertTitle: '三号拌合站 · 集料计量偏差', handled: true, handleNote: '已校准三号拌合站骨料称重传感器并重新标定。', temp: '20 ℃', deviation: '+2.3%', sortOrder: 6,
      materials: [
        { name: '水泥', target: 365, actual: 366, unit: 'kg/m³' },
        { name: '碎石', target: 1120, actual: 1146, unit: 'kg/m³' },
        { name: '中砂', target: 730, actual: 728, unit: 'kg/m³' },
        { name: '拌合水', target: 162, actual: 161, unit: 'kg/m³' },
      ],
    },
    {
      id: 'BH-20261124-074', sectionId: 'sec6', section: '六工区', station: '六号拌合站', prodType: '水泥混凝土', mixCode: 'C40', volume: 134.0, producedAt: '11-24 14:52',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '21 ℃', deviation: '±0.3%', sortOrder: 7,
      materials: [
        { name: '水泥', target: 395, actual: 395, unit: 'kg/m³' },
        { name: '碎石', target: 1090, actual: 1089, unit: 'kg/m³' },
        { name: '中砂', target: 715, actual: 717, unit: 'kg/m³' },
        { name: '拌合水', target: 158, actual: 158, unit: 'kg/m³' },
      ],
    },
    {
      id: 'BH-20261124-070', sectionId: 'sec2', section: '二工区', station: '二号拌合站', prodType: '水泥混凝土', mixCode: 'C50', volume: 156.0, producedAt: '11-24 11:08',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '22 ℃', deviation: '±0.2%', sortOrder: 8,
      materials: [
        { name: '水泥', target: 440, actual: 440, unit: 'kg/m³' },
        { name: '碎石', target: 1075, actual: 1076, unit: 'kg/m³' },
        { name: '中砂', target: 690, actual: 691, unit: 'kg/m³' },
        { name: '拌合水', target: 152, actual: 152, unit: 'kg/m³' },
      ],
    },
    {
      id: 'BH-20261124-068', sectionId: 'sec1', section: '一工区', station: '一号拌合站', prodType: '沥青混合料', mixCode: 'SMA-13', volume: 118.5, producedAt: '11-24 09:44',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '174 ℃', deviation: '±0.2%', sortOrder: 9,
      materials: [
        { name: '改性沥青', target: 6.1, actual: 6.11, unit: '%' },
        { name: '玄武岩集料', target: 83.6, actual: 83.5, unit: '%' },
        { name: '矿粉', target: 10.0, actual: 10.1, unit: '%' },
        { name: '木质素纤维', target: 0.3, actual: 0.3, unit: '%' },
      ],
    },
    {
      id: 'BH-20261123-085', sectionId: 'sec6', section: '六工区', station: '六号拌合站', prodType: '水泥稳定碎石', mixCode: 'WS-05', volume: 162.0, producedAt: '11-23 15:20',
      judge: '合格', alertTitle: '', handled: true, handleNote: '', temp: '18 ℃', deviation: '±0.3%', sortOrder: 10,
      materials: [
        { name: '水泥 P·O 42.5', target: 4.5, actual: 4.49, unit: '%' },
        { name: '碎石', target: 64.0, actual: 64.2, unit: '%' },
        { name: '石屑', target: 31.5, actual: 31.3, unit: '%' },
        { name: '拌合水', target: 4.8, actual: 4.82, unit: '%' },
      ],
    },
  ];

  await dbInstance.insert(qualityMixingRecords).values(mixingRows).onConflictDoNothing();

  const pavementRows = [
    { id: 'PM-01', sectionId: 'sec1', section: '一工区', dir: '左幅（明水→北安）', stake: 'K15+220 ~ K15+860', layer: '上面层', temp: 156, passes: 8, compaction: 98.9, thickness: 4.1, designThick: 4.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-25 10:30', sortOrder: 1 },
    { id: 'PM-02', sectionId: 'sec4', section: '四工区', dir: '右幅（北安→明水）', stake: 'K48+200 ~ K49+020', layer: '中面层', temp: 151, passes: 8, compaction: 98.6, thickness: 5.1, designThick: 6.0, judge: '厚度预警', alertTitle: '四工区 · 中面层厚度偏小', verified: false, recordedAt: '11-25 10:24', sortOrder: 2 },
    { id: 'PM-03', sectionId: 'sec2', section: '二工区', dir: '左幅（明水→北安）', stake: 'K26+740 ~ K27+480', layer: '下面层', temp: 149, passes: 9, compaction: 99.1, thickness: 8.0, designThick: 8.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-25 09:58', sortOrder: 3 },
    { id: 'PM-04', sectionId: 'sec3', section: '三工区', dir: '左幅（明水→北安）', stake: 'K35+100 ~ K35+760', layer: '中面层', temp: 146, passes: 7, compaction: 97.0, thickness: 6.0, designThick: 6.0, judge: '压实预警', alertTitle: '三工区 · 压实度不足', verified: false, recordedAt: '11-25 09:36', sortOrder: 4 },
    { id: 'PM-05', sectionId: 'sec6', section: '六工区', dir: '右幅（北安→明水）', stake: 'K71+040 ~ K71+680', layer: '上面层', temp: 155, passes: 8, compaction: 98.8, thickness: 4.0, designThick: 4.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-25 09:12', sortOrder: 5 },
    { id: 'PM-06', sectionId: 'sec5', section: '五工区', dir: '左幅（明水→北安）', stake: 'K61+480 ~ K61+960', layer: '中面层', temp: 138, passes: 8, compaction: 98.4, thickness: 6.0, designThick: 6.0, judge: '温度预警', alertTitle: '五工区 · 摊铺温度偏低', verified: true, recordedAt: '11-24 15:42', sortOrder: 6 },
    { id: 'PM-07', sectionId: 'sec1', section: '一工区', dir: '右幅（北安→明水）', stake: 'K10+400 ~ K11+150', layer: '中面层', temp: 153, passes: 8, compaction: 99.0, thickness: 6.1, designThick: 6.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-24 14:18', sortOrder: 7 },
    { id: 'PM-08', sectionId: 'sec2', section: '二工区', dir: '右幅（北安→明水）', stake: 'K30+120 ~ K30+880', layer: '上面层', temp: 157, passes: 9, compaction: 99.2, thickness: 4.0, designThick: 4.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-24 11:05', sortOrder: 8 },
    { id: 'PM-09', sectionId: 'sec3', section: '三工区', dir: '右幅（北安→明水）', stake: 'K52+600 ~ K53+420', layer: '下面层', temp: 148, passes: 8, compaction: 98.7, thickness: 8.1, designThick: 8.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-23 16:40', sortOrder: 9 },
    { id: 'PM-10', sectionId: 'sec5', section: '五工区', dir: '右幅（北安→明水）', stake: 'K102+200 ~ K103+050', layer: '上面层', temp: 154, passes: 8, compaction: 98.9, thickness: 4.1, designThick: 4.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-23 14:25', sortOrder: 10 },
    { id: 'PM-11', sectionId: 'sec4', section: '四工区', dir: '左幅（明水→北安）', stake: 'K78+100 ~ K78+940', layer: '下面层', temp: 150, passes: 8, compaction: 98.8, thickness: 7.9, designThick: 8.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-22 15:10', sortOrder: 11 },
    { id: 'PM-12', sectionId: 'sec6', section: '六工区', dir: '左幅（明水→北安）', stake: 'K129+300 ~ K130+120', layer: '水稳基层', temp: 19, passes: 6, compaction: 98.5, thickness: 18.0, designThick: 18.0, judge: '合格', alertTitle: '', verified: true, recordedAt: '11-22 10:50', sortOrder: 12 },
  ];

  await dbInstance.insert(qualityPavementRecords).values(pavementRows).onConflictDoNothing();

  const beamRows = [
    { id: 'YL-30-0640', sectionId: 'sec1', yard: '一号梁场', beamType: '30 m 箱梁', castDate: '2026-11-25', curing: '养护中', tension: '待张拉', grout: '待压浆', inspect: '待检', pedestal: 'A-12 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'producing', temp: '46.2 ℃', humidity: '94%', elongation: '—', groutPressure: '—', sortOrder: 1 },
    { id: 'YL-40-0639', sectionId: 'sec2', yard: '二号梁场', beamType: '40 m 箱梁', castDate: '2026-11-25', curing: '养护中', tension: '待张拉', grout: '待压浆', inspect: '待检', pedestal: 'B-08 台座', alertTitle: '二号梁场 · 养护温度超限', alertState: '跟踪中', alertTime: '11-25 09:28', statusState: 'producing', temp: '61.5 ℃', humidity: '91%', elongation: '—', groutPressure: '—', sortOrder: 2 },
    { id: 'YL-30-0592', sectionId: 'sec3', yard: '一号梁场', beamType: '30 m 箱梁', castDate: '2026-11-21', curing: '已完成', tension: '待复检', grout: '待压浆', inspect: '待检', pedestal: 'A-05 台座', alertTitle: '一号梁场 · 张拉伸长量偏差', alertState: '待复检', alertTime: '11-25 10:09', statusState: 'producing', temp: '45.0 ℃', humidity: '95%', elongation: '+6.8% (限±6%)', groutPressure: '—', sortOrder: 3 },
    { id: 'YL-30-0581', sectionId: 'sec4', yard: '二号梁场', beamType: '30 m 箱梁', castDate: '2026-11-20', curing: '已完成', tension: '合格', grout: '压浆中', inspect: '待检', pedestal: 'B-03 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'producing', temp: '44.8 ℃', humidity: '96%', elongation: '+1.8%', groutPressure: '0.58 MPa', sortOrder: 4 },
    { id: 'YL-20-0568', sectionId: 'sec1', yard: '一号梁场', beamType: '20 m 空心板梁', castDate: '2026-11-20', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'C-04 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'inspected', temp: '44.5 ℃', humidity: '95%', elongation: '+1.2%', groutPressure: '0.62 MPa', sortOrder: 5 },
    { id: 'YL-30-0572', sectionId: 'sec3', yard: '一号梁场', beamType: '30 m 箱梁', castDate: '2026-11-19', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'A-09 台座', alertTitle: '一号梁场 · 压浆压力异常', alertState: '已处理', alertTime: '11-24 14:20', statusState: 'inspected', temp: '45.1 ℃', humidity: '95%', elongation: '+1.5%', groutPressure: '0.61 MPa', sortOrder: 6 },
    { id: 'YL-40-0560', sectionId: 'sec2', yard: '二号梁场', beamType: '40 m 箱梁', castDate: '2026-11-18', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'B-11 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'inspected', temp: '45.6 ℃', humidity: '94%', elongation: '+2.0%', groutPressure: '0.63 MPa', sortOrder: 7 },
    { id: 'YL-30-0554', sectionId: 'sec5', yard: '一号梁场', beamType: '30 m 箱梁', castDate: '2026-11-18', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'A-02 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'inspected', temp: '44.2 ℃', humidity: '95%', elongation: '+1.1%', groutPressure: '0.60 MPa', sortOrder: 8 },
    { id: 'YL-40-0548', sectionId: 'sec6', yard: '二号梁场', beamType: '40 m 箱梁', castDate: '2026-11-17', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'B-06 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'inspected', temp: '45.3 ℃', humidity: '96%', elongation: '+1.7%', groutPressure: '0.64 MPa', sortOrder: 9 },
    { id: 'YL-20-0541', sectionId: 'sec5', yard: '一号梁场', beamType: '20 m 空心板梁', castDate: '2026-11-16', curing: '已完成', tension: '合格', grout: '合格', inspect: '合格', pedestal: 'C-01 台座', alertTitle: '', alertState: '', alertTime: '', statusState: 'inspected', temp: '44.0 ℃', humidity: '95%', elongation: '+0.9%', groutPressure: '0.61 MPa', sortOrder: 10 },
  ];

  await dbInstance.insert(qualityBeamRecords).values(beamRows).onConflictDoNothing();

  const issueRows = [
    { id: 'ZL-202611-012', sectionId: 'sec3', section: '三工区', issueType: '构件质量', title: '预制箱梁外观质量', description: '预制箱梁局部蜂窝麻面', unit: '三工区项目部', foundAt: '2026-11-24 14:10', deadline: '2026-11-27', status: '整改中', daysUsed: null, measure: '采用高标号聚合物修补砂浆凿毛清理分层修补，安排监理现场旁站复验。', sortOrder: 1 },
    { id: 'ZL-202611-011', sectionId: 'sec2', section: '二工区', issueType: '施工工艺', title: '水稳混合料含水率超限', description: '水稳混合料含水率超限', unit: '二工区项目部', foundAt: '2026-11-24 09:20', deadline: '2026-11-25', status: '已整改', daysUsed: 1.4, measure: '已暂停供料并校准冷料仓湿度补偿系数，重新取样测定含水率 4.9% 合格。', sortOrder: 2 },
    { id: 'ZL-202611-010', sectionId: 'sec4', section: '四工区', issueType: '施工工艺', title: '沥青中面层实测厚度偏小', description: '沥青中面层实测厚度偏小', unit: '四工区项目部', foundAt: '2026-11-23 11:05', deadline: '2026-11-24', status: '已整改', daysUsed: 1.8, measure: '校核摊铺机找平传感器基准线，对 K48+200~K49+020 路段完成微表处补强复测。', sortOrder: 3 },
    { id: 'ZL-202611-009', sectionId: 'sec1', section: '一工区', issueType: '检测异常', title: '混凝土试件抗压强度异常', description: '混凝土试件抗压强度异常', unit: '一工区项目部', foundAt: '2026-11-21 15:40', deadline: '2026-11-23', status: '已整改', daysUsed: 2.1, measure: '经现场回弹及钻芯取样复核，实体结构强度达到设计值 112%，系单组试模振捣偏差所致。', sortOrder: 4 },
    { id: 'ZL-202611-008', sectionId: 'sec5', section: '五工区', issueType: '原材料质量', title: '粗集料针片状含量超限', description: '粗集料针片状含量超限', unit: '五工区项目部', foundAt: '2026-11-20 10:15', deadline: '2026-11-22', status: '已整改', daysUsed: 2.0, measure: '不合格批次 85 吨清退出场，料源厂更换整形破碎机筛网后抽检 11.2% 合格。', sortOrder: 5 },
    { id: 'ZL-202611-007', sectionId: 'sec2', section: '二工区', issueType: '原材料质量', title: '细集料含泥量轻微偏高', description: '机制砂含泥量实测 3.4% 超内控指标', unit: '二工区项目部', foundAt: '2026-11-18 16:30', deadline: '2026-11-20', status: '已整改', daysUsed: 2.3, measure: '启用水洗砂二次冲洗工艺并覆盖防尘网，复检含泥量降至 1.9%。', sortOrder: 6 },
    { id: 'ZL-202611-006', sectionId: 'sec4', section: '四工区', issueType: '检测异常', title: '沥青马歇尔稳定度波动', description: '局部试件稳定度实测 7.6 kN 偏低', unit: '四工区项目部', foundAt: '2026-11-16 14:00', deadline: '2026-11-19', status: '已整改', daysUsed: 2.6, measure: '调整沥青加热温度至 162℃ 并复配矿粉比例，平行复测稳定度 9.2 kN 合格。', sortOrder: 7 },
    { id: 'ZL-202611-005', sectionId: 'sec3', section: '三工区', issueType: '原材料质量', title: '散装水泥进场留样复核', description: '3#罐水泥安定性临近内控上限', unit: '三工区项目部', foundAt: '2026-11-14 09:50', deadline: '2026-11-17', status: '已整改', daysUsed: 2.5, measure: '封存该罐 24 小时后二次沸煮复检合格，监理签认恢复使用。', sortOrder: 8 },
    { id: 'ZL-202611-004', sectionId: 'sec2', section: '二工区', issueType: '构件质量', title: '预制箱梁端模接缝错台', description: '30m 箱梁端头局部错台 3.5mm', unit: '二工区项目部', foundAt: '2026-11-11 11:20', deadline: '2026-11-14', status: '已整改', daysUsed: 2.4, measure: '机械打磨平滑并更换端模高强螺栓及橡胶止浆条，后续浇筑未再发生。', sortOrder: 9 },
    { id: 'ZL-202611-003', sectionId: 'sec4', section: '四工区', issueType: '施工工艺', title: '盖梁钢筋保护层垫块不足', description: '局部侧模垫块间距大于 1.0m', unit: '四工区项目部', foundAt: '2026-11-08 15:10', deadline: '2026-11-10', status: '已整改', daysUsed: 2.2, measure: '已补齐高强梅花形塑料垫块，钢筋保护层厚度实测合格率 98%。', sortOrder: 10 },
    { id: 'ZL-202611-002', sectionId: 'sec5', section: '五工区', issueType: '原材料质量', title: '外加剂减水率批次偏差', description: '聚羧酸减水剂固含量偏差 0.6%', unit: '五工区项目部', foundAt: '2026-11-05 10:40', deadline: '2026-11-08', status: '已整改', daysUsed: 2.9, measure: '协调供应商补发合格批次并完成拌合站外加剂储罐清洗。', sortOrder: 11 },
    { id: 'ZL-202611-001', sectionId: 'sec6', section: '六工区', issueType: '其他', title: '寒区冬季施工保温棚温控记录缺失', description: '夜间 02:00 养生棚自动记录断点', unit: '六工区项目部', foundAt: '2026-11-02 08:30', deadline: '2026-11-05', status: '已整改', daysUsed: 2.8, measure: '更换无线 LoRa 温湿度探头并配置 UPS 备用电源，数据连续上传正常。', sortOrder: 12 },
  ];

  await dbInstance.insert(qualityIssues).values(issueRows).onConflictDoNothing();
}
