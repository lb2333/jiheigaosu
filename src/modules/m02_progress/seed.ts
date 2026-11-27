import type { db } from '@/db';
import {
  progressCategoryStats,
  progressTrendPoints,
  progressDetailItems,
  progressReports,
  progressPlanTasks,
  progressPlanNodes,
  progressBimObjects,
  type BimTaskDef,
} from '@/db/schema/domains/m02';

const WORK_SECTIONS = [
  { id: 'sec1', name: '一工区' },
  { id: 'sec2', name: '二工区' },
  { id: 'sec3', name: '三工区' },
  { id: 'sec4', name: '四工区' },
  { id: 'sec5', name: '五工区' },
  { id: 'sec6', name: '六工区' },
];

const CATEGORIES = [
  { key: 'subgrade', name: '路基工程', unit: '万m³', total: 2003.6, icon: 'subgrade', isInt: false },
  { key: 'bridge', name: '桥梁工程', unit: 'm³', total: 60757.0, icon: 'bridge', isInt: false },
  { key: 'pavement', name: '路面工程', unit: '千m²', total: 6003.2, icon: 'pavement', isInt: false },
  { key: 'yard', name: '场站工程', unit: '座', total: 13.5, icon: 'yard', isInt: true },
  { key: 'safetyFac', name: '交安工程', unit: 'km', total: 265.5, icon: 'guardrail', isInt: false },
  { key: 'green', name: '绿化工程', unit: '万m²', total: 1000.0, icon: 'leaf', isInt: false },
];

const SECTION_MATRIX_NOV: Record<string, number[]> = {
  sec1: [78.2, 68.5, 52.4, 90.0, 36.8, 30.4],
  sec2: [71.5, 62.1, 44.9, 86.7, 31.9, 27.6],
  sec3: [73.6, 63.8, 45.1, 88.8, 32.2, 28.1],
  sec4: [72.3, 61.7, 46.3, 88.9, 33.1, 28.9],
  sec5: [71.9, 62.9, 44.7, 89.5, 30.8, 27.9],
  sec6: [70.7, 61.8, 45.6, 88.3, 29.7, 28.8],
};

const ALL_LINE_PCT_NOV = [72.8, 63.4, 46.7, 88.9, 32.5, 28.6];
const ALL_LINE_DONE_NOV = [1458.6, 38520.0, 2803.5, 12, 86.3, 286.0];

const MONTH_FACTORS: Record<string, number> = {
  '2026-06': 0.677,
  '2026-07': 0.733,
  '2026-08': 0.801,
  '2026-09': 0.875,
  '2026-10': 0.928,
  '2026-11': 1.0,
};

const TREND_MONTHS = ['2026-06', '2026-07', '2026-08', '2026-09', '2026-10', '2026-11'];
const TREND_PERIOD_QTY = [126.4, 139.2, 155.7, 166.8, 161.9, 179.6];
const TREND_CUM_QTY = [2219.6, 2401.6, 2624.8, 2865.5, 3041.7, 2729.8];
const TREND_CUM_PCT = [37.8, 40.9, 44.7, 48.8, 51.8, 55.8];

export async function seedM02(dbInstance: typeof db) {
  // 1. progressCategoryStats (6 months x 7 scopes x 6 categories)
  const catRows: Array<typeof progressCategoryStats.$inferInsert> = [];
  const scopes = ['all', ...WORK_SECTIONS.map((s) => s.id)];
  for (const period of TREND_MONTHS) {
    const factor = MONTH_FACTORS[period] ?? 1;
    for (const secId of scopes) {
      const secShare = secId === 'all' ? 1.0 : 0.165;
      CATEGORIES.forEach((cat, idx) => {
        const basePct =
          secId === 'all'
            ? ALL_LINE_PCT_NOV[idx]
            : (SECTION_MATRIX_NOV[secId]?.[idx] ?? ALL_LINE_PCT_NOV[idx]);
        const pct = +Math.min(100, basePct * factor).toFixed(1);
        const rawDone =
          ALL_LINE_DONE_NOV[idx] * secShare * factor * (basePct / ALL_LINE_PCT_NOV[idx]);
        const doneQty = cat.isInt ? Math.max(1, Math.round(rawDone)) : +rawDone.toFixed(1);
        const totalQty = cat.isInt
          ? Math.max(1, Math.round(cat.total * secShare))
          : +(cat.total * secShare).toFixed(1);
        catRows.push({
          id: `${period}_${secId}_${cat.key}`,
          period,
          sectionId: secId,
          categoryKey: cat.key,
          categoryName: cat.name,
          unit: cat.unit,
          icon: cat.icon,
          isInt: cat.isInt,
          totalQty,
          doneQty,
          pct,
          sortOrder: idx + 1,
        });
      });
    }
  }

  for (const row of catRows) {
    await dbInstance
      .insert(progressCategoryStats)
      .values(row)
      .onConflictDoUpdate({
        target: progressCategoryStats.id,
        set: {
          pct: row.pct,
          doneQty: row.doneQty,
          totalQty: row.totalQty,
        },
      });
  }

  // 2. progressTrendPoints (6 months x 7 scopes)
  for (const secId of scopes) {
    const secScale = secId === 'all' ? 1.0 : 0.172;
    const totalQty = +(5872.0 * secScale).toFixed(1);
    for (let i = 0; i < TREND_MONTHS.length; i++) {
      const period = TREND_MONTHS[i];
      const periodQty = +(TREND_PERIOD_QTY[i] * secScale).toFixed(1);
      const cumQty = +(TREND_CUM_QTY[i] * secScale).toFixed(1);
      const cumPct = TREND_CUM_PCT[i];
      await dbInstance
        .insert(progressTrendPoints)
        .values({
          id: `${period}_${secId}`,
          period,
          sectionId: secId,
          totalQty,
          periodQty,
          cumQty,
          cumPct,
          sortOrder: i + 1,
        })
        .onConflictDoUpdate({
          target: progressTrendPoints.id,
          set: {
            totalQty,
            periodQty,
            cumQty,
            cumPct,
          },
        });
    }
  }

  // 3. progressDetailItems (10 overview + 24 report items)
  const overviewDetails: Array<typeof progressDetailItems.$inferInsert> = [
    { id: 'd1', itemScope: 'overview', sectionId: 'sec2', sectionName: '二工区', objectName: '桥梁示例A', category: '桥梁工程', subItem: '桥梁下部结构（墩台、基础）', unit: 'm³', totalQty: '18,000.0', periodQty: '1,240.0', cumQty: '11,412.0', pct: 63.4, dueDate: '2026-11-20', sourceReport: '《二工区2026年11月进度报表》', poiId: 'bridgeA', reportPeriod: '2026-11', sortOrder: 1 },
    { id: 'd2', itemScope: 'overview', sectionId: 'sec2', sectionName: '二工区', objectName: '梁场示例A', category: '桥梁工程', subItem: '预制梁生产（含养护）', unit: '片', totalQty: '640', periodQty: '40', cumQty: '406', pct: 63.4, dueDate: '2026-11-20', sourceReport: '《二工区2026年11月进度报表》', poiId: 'beamYardA', reportPeriod: '2026-11', sortOrder: 2 },
    { id: 'd3', itemScope: 'overview', sectionId: 'sec3', sectionName: '三工区', objectName: '拌合站示例A', category: '场站工程', subItem: '拌合站建设（主体及配套）', unit: '座', totalQty: '1', periodQty: '0', cumQty: '1', pct: 100.0, dueDate: '2026-11-20', sourceReport: '《三工区2026年11月进度报表》', poiId: 'batchPlantA', reportPeriod: '2026-11', sortOrder: 3 },
    { id: 'd4', itemScope: 'overview', sectionId: 'sec4', sectionName: '四工区', objectName: '路面试验段K42+000~K44+000', category: '路面工程', subItem: '沥青混合料面层（下面层）', unit: '千m²', totalQty: '200.0', periodQty: '12.6', cumQty: '92.8', pct: 46.4, dueDate: '2026-11-20', sourceReport: '《四工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 4 },
    { id: 'd5', itemScope: 'overview', sectionId: 'sec1', sectionName: '一工区', objectName: '交安设施K12+000~K20+000', category: '交安工程', subItem: '波形梁护栏安装', unit: 'km', totalQty: '8.0', periodQty: '1.2', cumQty: '2.6', pct: 32.5, dueDate: '2026-11-20', sourceReport: '《一工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 5 },
    { id: 'd6', itemScope: 'overview', sectionId: 'sec6', sectionName: '六工区', objectName: '绿化示例段K68+000~K72+000', category: '绿化工程', subItem: '边坡绿化（喷播、植草）', unit: '万m²', totalQty: '16.0', periodQty: '2.1', cumQty: '4.6', pct: 28.8, dueDate: '2026-11-20', sourceReport: '《六工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 6 },
    { id: 'd7', itemScope: 'overview', sectionId: 'sec1', sectionName: '一工区', objectName: '一工区K18+400路基段', category: '路基工程', subItem: '黑土地表土剥离与路基填筑', unit: '万m³', totalQty: '340.0', periodQty: '18.5', cumQty: '265.9', pct: 78.2, dueDate: '2026-11-20', sourceReport: '《一工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 7 },
    { id: 'd8', itemScope: 'overview', sectionId: 'sec3', sectionName: '三工区', objectName: '三工区跨河中桥K58+120', category: '桥梁工程', subItem: '钻孔灌注桩与承台浇筑', unit: 'm³', totalQty: '9,600.0', periodQty: '680.0', cumQty: '6,124.8', pct: 63.8, dueDate: '2026-11-20', sourceReport: '《三工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 8 },
    { id: 'd9', itemScope: 'overview', sectionId: 'sec5', sectionName: '五工区', objectName: '五工区水稳基层K102~K112', category: '路面工程', subItem: '水泥稳定碎石基层摊铺', unit: '千m²', totalQty: '420.0', periodQty: '28.4', cumQty: '187.7', pct: 44.7, dueDate: '2026-11-20', sourceReport: '《五工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 9 },
    { id: 'd10', itemScope: 'overview', sectionId: 'sec6', sectionName: '六工区', objectName: '建华枢纽互通主线桥', category: '桥梁工程', subItem: '现浇箱梁支架搭设与浇筑', unit: 'm³', totalQty: '14,200.0', periodQty: '920.0', cumQty: '8,775.6', pct: 61.8, dueDate: '2026-11-20', sourceReport: '《六工区2026年11月进度报表》', poiId: null, reportPeriod: '2026-11', sortOrder: 10 },
  ];

  const reportBreakdownBySec: Record<string, Array<{ obj: string; cat: string; item: string; unit: string; total: string; cur: string; cum: string; pct: number }>> = {
    sec1: [
      { obj: '一工区K18+400路基段', cat: '路基工程', item: '路基土石方填筑', unit: '万m³', total: '340', cur: '18.5', cum: '265.9', pct: 78.2 },
      { obj: '交安设施K12+000~K20+000', cat: '交安工程', item: '波形梁护栏安装', unit: 'km', total: '8.0', cur: '1.2', cum: '2.6', pct: 32.5 },
      { obj: '明水起点互通匝道桥', cat: '桥梁工程', item: '墩柱与盖梁施工', unit: 'm³', total: '8,400', cur: '560', cum: '5,754', pct: 68.5 },
      { obj: '一工区路面试验段', cat: '路面工程', item: '级配碎石底基层', unit: '千m²', total: '180', cur: '14.2', cum: '94.3', pct: 52.4 },
    ],
    sec2: [
      { obj: '桥梁示例A', cat: '桥梁工程', item: '下部结构', unit: 'm³', total: '18,000', cur: '1,240', cum: '11,412', pct: 63.4 },
      { obj: '梁场示例A', cat: '梁场工程', item: '预制梁生产', unit: '片', total: '640', cur: '40', cum: '406', pct: 63.4 },
      { obj: '二工区路基示例段', cat: '路基工程', item: '路基填筑', unit: '万m³', total: '120', cur: '8.0', cum: '86.4', pct: 72.0 },
      { obj: '二工区路面示例段', cat: '路面工程', item: '路面施工', unit: '千m²', total: '200', cur: '12.6', cum: '93.4', pct: 46.7 },
    ],
    sec3: [
      { obj: '拌合站示例A', cat: '场站工程', item: '主体与智能供料线', unit: '座', total: '1', cur: '0', cum: '1', pct: 100.0 },
      { obj: '三工区跨河中桥K58+120', cat: '桥梁工程', item: '桩基与承台浇筑', unit: 'm³', total: '9,600', cur: '680', cum: '6,125', pct: 63.8 },
      { obj: '三工区K56路基段', cat: '路基工程', item: '冻土路基换填', unit: '万m³', total: '150', cur: '9.4', cum: '110.4', pct: 73.6 },
      { obj: '三工区路面底基层', cat: '路面工程', item: '水稳底基层摊铺', unit: '千m²', total: '240', cur: '11.2', cum: '108.2', pct: 45.1 },
    ],
    sec4: [
      { obj: '路面试验段K42+000~K44+000', cat: '路面工程', item: '沥青混合料下面层', unit: '千m²', total: '200', cur: '12.6', cum: '92.8', pct: 46.4 },
      { obj: '四工区跨河大桥', cat: '桥梁工程', item: '盖梁预应力施工', unit: 'm³', total: '11,200', cur: '720', cum: '6,910', pct: 61.7 },
      { obj: '四工区路基填筑段', cat: '路基工程', item: '高填方路基碾压', unit: '万m³', total: '165', cur: '10.1', cum: '119.3', pct: 72.3 },
      { obj: '四工区边坡防护工程', cat: '绿化工程', item: '拱形骨架植草防护', unit: '万m²', total: '18', cur: '1.8', cum: '5.2', pct: 28.9 },
    ],
    sec5: [
      { obj: '五工区水稳基层K102~K112', cat: '路面工程', item: '水稳基层摊铺', unit: '千m²', total: '420', cur: '28.4', cum: '187.7', pct: 44.7 },
      { obj: '五工区分离式立交桥', cat: '桥梁工程', item: '预制箱梁架设', unit: '片', total: '160', cur: '14', cum: '101', pct: 63.1 },
      { obj: '五工区K108路基段', cat: '路基工程', item: '路床精平交验', unit: '万m³', total: '138', cur: '7.5', cum: '99.2', pct: 71.9 },
      { obj: '五工区交安标线标志', cat: '交安工程', item: '门架基础浇筑', unit: '处', total: '26', cur: '3', cum: '8', pct: 30.8 },
    ],
    sec6: [
      { obj: '建华枢纽互通主线桥', cat: '桥梁工程', item: '现浇箱梁施工', unit: 'm³', total: '14,200', cur: '920', cum: '8,776', pct: 61.8 },
      { obj: '绿化示例段K68+000~K72+000', cat: '绿化工程', item: '边坡喷播植草', unit: '万m²', total: '16.0', cur: '2.1', cum: '4.6', pct: 28.8 },
      { obj: '六工区路基交验段', cat: '路基工程', item: '黑土复垦与边坡整修', unit: '万m³', total: '145', cur: '8.2', cum: '102.5', pct: 70.7 },
      { obj: '北安终点连接线', cat: '路面工程', item: '沥青上面层试验铺筑', unit: '千m²', total: '210', cur: '13.5', cum: '95.8', pct: 45.6 },
    ],
  };

  const reportDetails: Array<typeof progressDetailItems.$inferInsert> = [];
  for (const sec of WORK_SECTIONS) {
    const items = reportBreakdownBySec[sec.id] ?? [];
    items.forEach((it, idx) => {
      reportDetails.push({
        id: `rep_item_${sec.id}_${idx + 1}`,
        itemScope: 'report',
        sectionId: sec.id,
        sectionName: sec.name,
        objectName: it.obj,
        category: it.cat,
        subItem: it.item,
        unit: it.unit,
        totalQty: it.total,
        periodQty: it.cur,
        cumQty: it.cum,
        pct: it.pct,
        dueDate: '2026-11-20',
        sourceReport: `${sec.name}2026年11月进度报表`,
        poiId: null,
        reportPeriod: '2026-11',
        sortOrder: idx + 1,
      });
    });
  }

  for (const row of [...overviewDetails, ...reportDetails]) {
    await dbInstance
      .insert(progressDetailItems)
      .values(row)
      .onConflictDoUpdate({
        target: progressDetailItems.id,
        set: {
          objectName: row.objectName,
          subItem: row.subItem,
          totalQty: row.totalQty,
          periodQty: row.periodQty,
          cumQty: row.cumQty,
          pct: row.pct,
        },
      });
  }

  // 4. progressReports (2026-06~11 & 2025-10~11 across 6 sections)
  const reportMonths: Array<{ year: string; month: string }> = [
    ...['06', '07', '08', '09', '10', '11'].map((month) => ({ year: '2026', month })),
    ...['06', '07', '08', '09', '10', '11'].map((month) => ({ year: '2025', month })),
  ];
  for (const { year, month } of reportMonths) {
    const periodLabel = `${year}年${month}月`;
    const dueDate = `${year}-${month}-20`;
    const updatedDate = `${year}-${month}-24`;
    for (const sec of WORK_SECTIONS) {
      await dbInstance
        .insert(progressReports)
        .values({
          id: `rep_${year}_${month}_${sec.id}`,
          sectionId: sec.id,
          sectionName: sec.name,
          year,
          month,
          periodLabel,
          reportName: `${periodLabel}进度报表`,
          dueDate,
          updatedDate,
          sourceName: `${sec.name}${periodLabel}进度报表`,
          docCode: `JHGS-${sec.id.toUpperCase()}-${year}${month}`,
          status: '已归档',
          summary: `${sec.name}${periodLabel}工程进度统计月报，总监办已核验归档。`,
          createdBy: 'system',
        })
        .onConflictDoNothing();
    }
  }

  // 5. progressPlanTasks (8 Gantt tasks)
  const tasks: Array<typeof progressPlanTasks.$inferInsert> = [
    { id: 't1', name: '路基施工', category: '路基工程', sectionId: 'sec1', planLevel: 'total', timeRange: '2026', startMonthIdx: 0, endMonthIdx: 7.0, actualMonthIdx: 6.1, milestoneMonthIdx: 6.1, status: '已完成', sortOrder: 1 },
    { id: 't2', name: '桥梁下部结构', category: '桥梁工程', sectionId: 'sec2', planLevel: 'total', timeRange: '2026', startMonthIdx: 0.6, endMonthIdx: 7.0, actualMonthIdx: 6.6, milestoneMonthIdx: 6.6, status: '已完成', sortOrder: 2 },
    { id: 't3', name: '梁场预制', category: '场站工程', sectionId: 'sec2', planLevel: 'total', timeRange: '2026', startMonthIdx: 1.5, endMonthIdx: 8.0, actualMonthIdx: 7.5, milestoneMonthIdx: null, status: '推进中', sortOrder: 3 },
    { id: 't4', name: '架梁施工', category: '桥梁工程', sectionId: 'sec2', planLevel: 'total', timeRange: '2026', startMonthIdx: 3.6, endMonthIdx: 8.8, actualMonthIdx: 7.0, milestoneMonthIdx: 8.3, status: '按计划推进', sortOrder: 4 },
    { id: 't5', name: '路面基层', category: '路面工程', sectionId: 'sec4', planLevel: 'total', timeRange: '2026', startMonthIdx: 4.3, endMonthIdx: 8.5, actualMonthIdx: 7.3, milestoneMonthIdx: null, status: '推进中', sortOrder: 5 },
    { id: 't6', name: '路面面层', category: '路面工程', sectionId: 'sec5', planLevel: 'total', timeRange: '2026-2027', startMonthIdx: 6.9, endMonthIdx: 10.0, actualMonthIdx: 9.5, milestoneMonthIdx: null, status: '正常', sortOrder: 6 },
    { id: 't7', name: '交安工程', category: '交安工程', sectionId: 'sec1', planLevel: 'total', timeRange: '2026-2027', startMonthIdx: 6.1, endMonthIdx: 10.0, actualMonthIdx: 9.5, milestoneMonthIdx: null, status: '正常', sortOrder: 7 },
    { id: 't8', name: '绿化工程', category: '绿化工程', sectionId: 'sec6', planLevel: 'total', timeRange: '2026-2027', startMonthIdx: 6.4, endMonthIdx: 10.0, actualMonthIdx: 9.5, milestoneMonthIdx: null, status: '正常', sortOrder: 8 },
  ];
  for (const t of tasks) {
    await dbInstance
      .insert(progressPlanTasks)
      .values(t)
      .onConflictDoUpdate({
        target: progressPlanTasks.id,
        set: {
          name: t.name,
          category: t.category,
          startMonthIdx: t.startMonthIdx,
          endMonthIdx: t.endMonthIdx,
          actualMonthIdx: t.actualMonthIdx,
          milestoneMonthIdx: t.milestoneMonthIdx,
          status: t.status,
        },
      });
  }

  // 6. progressPlanNodes (7 nodes)
  const nodes: Array<typeof progressPlanNodes.$inferInsert> = [
    { id: 'n1', seq: 1, title: '场地准备', planDate: '2026-06-15', status: '已完成', statusTone: 'ok', sectionId: 'sec1', sectionName: '一工区', objectName: '明水起点工区', taskName: '路基施工', category: '路基工程', specialty: '路基专业', inShortList: false, listOrder: 0 },
    { id: 'n2', seq: 2, title: '桩基施工', planDate: '2026-08-10', status: '已完成', statusTone: 'ok', sectionId: 'sec2', sectionName: '二工区', objectName: '桥梁示例A', taskName: '桥梁下部结构', category: '桥梁工程', specialty: '桥梁专业', inShortList: false, listOrder: 0 },
    { id: 'n3', seq: 3, title: '墩台施工', planDate: '2026-09-25', status: '已完成', statusTone: 'ok', sectionId: 'sec2', sectionName: '二工区', objectName: '桥梁示例A', taskName: '桥梁下部结构', category: '桥梁工程', specialty: '桥梁专业', inShortList: true, listOrder: 1 },
    { id: 'n4', seq: 4, title: '梁板架设', planDate: '2026-11-20', status: '按计划推进', statusTone: 'info', sectionId: 'sec2', sectionName: '二工区', objectName: '桥梁示例A', taskName: '架梁施工', category: '桥梁工程', specialty: '桥梁专业', inShortList: true, listOrder: 2 },
    { id: 'n5', seq: 5, title: '路面基层完成', planDate: '2026-12-10', status: '正常', statusTone: 'ok', sectionId: 'sec4', sectionName: '四工区', objectName: '路面试验段K42+000', taskName: '路面基层', category: '路面工程', specialty: '路面专业', inShortList: true, listOrder: 3 },
    { id: 'n6', seq: 6, title: '路面面层启动', planDate: '2026-12-20', status: '正常', statusTone: 'ok', sectionId: 'sec5', sectionName: '五工区', objectName: '五工区路面段', taskName: '路面面层', category: '路面工程', specialty: '路面专业', inShortList: true, listOrder: 4 },
    { id: 'n7', seq: 7, title: '路面贯通', planDate: '2027-05-18', status: '规划节点', statusTone: 'info', sectionId: 'sec6', sectionName: '六工区', objectName: '建华枢纽互通', taskName: '路面面层', category: '路面工程', specialty: '路面专业', inShortList: false, listOrder: 0 },
  ];
  for (const n of nodes) {
    await dbInstance
      .insert(progressPlanNodes)
      .values(n)
      .onConflictDoNothing();
  }

  // 7. progressBimObjects (4 BIM objects)
  const bimObjs: Array<{
    id: string;
    name: string;
    poiId: string;
    sectionId: string;
    sectionName: string;
    planName: string;
    planVersion: string;
    startDate: string;
    endDate: string;
    tasks: BimTaskDef[];
    selectedTaskId: string;
    sortOrder: number;
  }> = [
    {
      id: 'bridgeA',
      name: '桥梁示例A',
      poiId: 'bridgeA',
      sectionId: 'sec2',
      sectionName: '二工区',
      planName: '2026年阶段计划',
      planVersion: 'V1.3',
      startDate: '2026-06-01',
      endDate: '2026-12-15',
      selectedTaskId: 'bt4',
      sortOrder: 1,
      tasks: [
        { id: 'bt1', name: '场地准备', start: '2026-06-01', end: '2026-06-25', icon: 'excavator', part: '便道与施工平台' },
        { id: 'bt2', name: '桩基施工', start: '2026-06-26', end: '2026-08-15', icon: 'layers', part: '48根钻孔灌注桩' },
        { id: 'bt3', name: '墩台施工', start: '2026-08-16', end: '2026-09-25', icon: 'guardrail', part: '6座双柱墩及盖梁' },
        { id: 'bt4', name: '梁板架设', start: '2026-09-26', end: '2026-12-15', icon: 'bridge', part: '80片预制箱梁架设' },
      ],
    },
    {
      id: 'beamYardA',
      name: '梁场示例A',
      poiId: 'beamYardA',
      sectionId: 'sec2',
      sectionName: '二工区',
      planName: '2026年梁场预制计划',
      planVersion: 'V1.2',
      startDate: '2026-06-01',
      endDate: '2026-12-15',
      selectedTaskId: 'yt4',
      sortOrder: 2,
      tasks: [
        { id: 'yt1', name: '台座基础硬化', start: '2026-06-01', end: '2026-06-28', icon: 'excavator', part: '制梁台座区' },
        { id: 'yt2', name: '龙门吊拼装检定', start: '2026-06-29', end: '2026-07-25', icon: 'layers', part: '双80t门式起重机' },
        { id: 'yt3', name: '箱梁批量预制', start: '2026-07-26', end: '2026-11-10', icon: 'yard', part: '240片标准箱梁' },
        { id: 'yt4', name: '智能张拉与出梁', start: '2026-11-11', end: '2026-12-15', icon: 'bridge', part: '存梁转运出场' },
      ],
    },
    {
      id: 'batchPlantA',
      name: '拌合站示例A',
      poiId: 'batchPlantA',
      sectionId: 'sec2',
      sectionName: '二工区',
      planName: '2026年场站保供计划',
      planVersion: 'V1.1',
      startDate: '2026-06-01',
      endDate: '2026-12-15',
      selectedTaskId: 'pt4',
      sortOrder: 3,
      tasks: [
        { id: 'pt1', name: '料仓地基施工', start: '2026-06-01', end: '2026-06-20', icon: 'excavator', part: '骨料封闭大棚基础' },
        { id: 'pt2', name: 'HZS180机组安装', start: '2026-06-21', end: '2026-07-30', icon: 'plant', part: '双机组拌合楼' },
        { id: 'pt3', name: '标定试生产', start: '2026-07-31', end: '2026-08-31', icon: 'layers', part: '配合比联调' },
        { id: 'pt4', name: '冬季保温供料', start: '2026-09-01', end: '2026-12-15', icon: 'yard', part: '全线C50混凝土保供' },
      ],
    },
    {
      id: 'subgrade1',
      name: '一工区K18+400路基',
      poiId: 'bridgeA',
      sectionId: 'sec1',
      sectionName: '一工区',
      planName: '2026年路基交验计划',
      planVersion: 'V1.3',
      startDate: '2026-06-01',
      endDate: '2026-12-15',
      selectedTaskId: 'st4',
      sortOrder: 4,
      tasks: [
        { id: 'st1', name: '黑土表土剥离', start: '2026-06-01', end: '2026-06-30', icon: 'leaf', part: '表土集中堆存' },
        { id: 'st2', name: '路基分层填筑', start: '2026-07-01', end: '2026-09-20', icon: 'subgrade', part: '96区路床压实' },
        { id: 'st3', name: '边坡防护砌筑', start: '2026-09-21', end: '2026-11-15', icon: 'guardrail', part: '拱形骨架防护' },
        { id: 'st4', name: '路基交验移交', start: '2026-11-16', end: '2026-12-15', icon: 'pavement', part: '移交路面施工' },
      ],
    },
  ];

  for (const b of bimObjs) {
    await dbInstance
      .insert(progressBimObjects)
      .values({
        ...b,
        simProgress: 89.8,
        simDate: '2026-11-25',
      })
      .onConflictDoNothing();
  }
}
