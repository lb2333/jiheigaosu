import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { eq } from 'drizzle-orm';
import { db, pool } from './index';
import {
  user,
  workSections,
  poiObjects,
  focusItems,
  milestoneNodes,
  showcaseTopics,
  systemConfigs,
  auditLogs,
  aiThreads,
  aiMessages,
} from './schema';
import { auth } from '@/lib/auth';
import { seedM02 } from '@/modules/m02_progress/seed';
import { seedM03 } from '@/modules/m03_quality/seed';
import { seedM04 } from '@/modules/m04_safety/seed';
import { seedM05 } from '@/modules/m05_staff/seed';
import { seedM06 } from '@/modules/m06_machine/seed';
import { seedM07 } from '@/modules/m07_material/seed';
import { seedM08 } from '@/modules/m08_measure/seed';
import { seedM09 } from '@/modules/m09_uav/seed';
import { seedM10 } from '@/modules/m10_video/seed';

function loadEnvLocal() {
  try {
    const raw = readFileSync(resolve(process.cwd(), '.env.local'), 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
      if (m && !process.env[m[1]]) {
        process.env[m[1]] = m[2].replace(/^["']|["']$/g, '');
      }
    }
  } catch {
    // ignore if .env.local not present
  }
}

loadEnvLocal();

async function ensureDemoUser(opts: {
  email: string;
  password: string;
  name: string;
  role: string;
  department: string;
  sectionScope: string;
}) {
  const existing = await db.select().from(user).where(eq(user.email, opts.email)).limit(1);
  if (existing.length > 0) {
    await db
      .update(user)
      .set({
        role: opts.role,
        department: opts.department,
        sectionScope: opts.sectionScope,
        banned: false,
      })
      .where(eq(user.id, existing[0].id));
    return existing[0].id;
  }

  const created = await auth.api.signUpEmail({
    body: {
      email: opts.email,
      password: opts.password,
      name: opts.name,
    },
  });

  if (created?.user?.id) {
    await db
      .update(user)
      .set({
        role: opts.role,
        emailVerified: true,
        department: opts.department,
        sectionScope: opts.sectionScope,
      })
      .where(eq(user.id, created.user.id));
    return created.user.id;
  }
  return null;
}

async function seed() {
  console.log('[seed] 开始初始化 G1211 吉黑高速平台 PostgreSQL 基础数据...');

  // 1. 6 Work Sections
  const sectionsData = [
    {
      id: 'sec1',
      name: '一工区',
      stakeRange: 'K0+000 ~ K24+500',
      sortOrder: 1,
      sectionsCount: 1,
      keyWorksCount: 2,
      yardsCount: 1,
      progressMetrics: [78.4, 68.2, 52.0, 92.0, 38.5, 34.0],
      qualityMetrics: [99.6, 99.0, 99.4, 98.1, 99.3, 95.8],
      safetyMetrics: [97.4, 100, 99.0, 96.5, 100, 94.2],
    },
    {
      id: 'sec2',
      name: '二工区',
      stakeRange: 'K24+500 ~ K48+200',
      sortOrder: 2,
      sectionsCount: 1,
      keyWorksCount: 3,
      yardsCount: 2,
      progressMetrics: [74.6, 66.8, 49.5, 91.2, 35.0, 30.2],
      qualityMetrics: [99.5, 98.9, 99.5, 97.9, 99.2, 96.0],
      safetyMetrics: [96.8, 100, 98.8, 95.8, 100, 93.6],
    },
    {
      id: 'sec3',
      name: '三工区',
      stakeRange: 'K48+200 ~ K72+800',
      sortOrder: 3,
      sectionsCount: 1,
      keyWorksCount: 2,
      yardsCount: 2,
      progressMetrics: [71.2, 61.5, 45.4, 87.5, 31.2, 27.4],
      qualityMetrics: [99.2, 98.6, 99.0, 97.4, 98.9, 93.5],
      safetyMetrics: [95.9, 100, 98.2, 94.6, 100, 92.1],
    },
    {
      id: 'sec4',
      name: '四工区',
      stakeRange: 'K72+800 ~ K96+000',
      sortOrder: 4,
      sectionsCount: 1,
      keyWorksCount: 2,
      yardsCount: 1,
      progressMetrics: [69.5, 60.1, 43.2, 85.4, 29.8, 25.9],
      qualityMetrics: [99.1, 98.5, 98.8, 97.2, 99.0, 94.0],
      safetyMetrics: [95.5, 100, 98.0, 94.0, 100, 91.5],
    },
    {
      id: 'sec5',
      name: '五工区',
      stakeRange: 'K96+000 ~ K121+400',
      sortOrder: 5,
      sectionsCount: 1,
      keyWorksCount: 2,
      yardsCount: 1,
      progressMetrics: [72.0, 62.0, 46.0, 88.0, 31.8, 28.0],
      qualityMetrics: [99.3, 98.8, 99.1, 97.5, 99.1, 94.8],
      safetyMetrics: [96.0, 100, 98.4, 95.0, 100, 92.5],
    },
    {
      id: 'sec6',
      name: '六工区',
      stakeRange: 'K121+400 ~ K146+800',
      sortOrder: 6,
      sectionsCount: 1,
      keyWorksCount: 1,
      yardsCount: 1,
      progressMetrics: [70.8, 61.8, 44.1, 89.2, 28.7, 26.1],
      qualityMetrics: [99.4, 98.7, 99.2, 97.6, 98.8, 94.2],
      safetyMetrics: [96.1, 100, 98.6, 94.8, 100, 93.0],
    },
  ];

  for (const s of sectionsData) {
    await db
      .insert(workSections)
      .values(s)
      .onConflictDoUpdate({
        target: workSections.id,
        set: {
          name: s.name,
          stakeRange: s.stakeRange,
          progressMetrics: s.progressMetrics,
          qualityMetrics: s.qualityMetrics,
          safetyMetrics: s.safetyMetrics,
        },
      });
  }

  // 2. 3 Key Engineering POIs
  const poisData = [
    {
      id: 'bridgeA',
      name: '桥梁示例A',
      type: '桥梁工程',
      sectionId: 'sec2',
      sectionName: '二工区',
      stage: '梁板架设',
      stake: 'K34+280',
      cameraName: '桥梁示例A · 01号摄像机',
      icon: 'bridge',
      lon: 125.982,
      lat: 47.452,
      alt: 235,
      imgPath: '/assets/milestone_after.jpg',
      duration: '05:00',
      elapsedSec: 12,
      photosCount: 3,
      videosCount: 2,
      inspectionsCount: 26,
      metrics: {
        length: '684 m',
        progress: '68.5%',
        beamsDone: '56 / 80 片',
        supervisor: '张建国 (二工区总工)',
      },
      docs: [
        { name: '桥梁示例A 预制箱梁架设专项施工方案.pdf', type: '施工方案', date: '2026-10-18', size: '6.4 MB' },
        { name: 'K34+280 主桥墩柱混凝土抗压强度检测报告.pdf', type: '试验检测', date: '2026-10-29', size: '2.1 MB' },
        { name: '2026-11-20 无人机正射巡检影像包.zip', type: '无人机影像', date: '2026-11-20', size: '148 MB' },
        { name: '二工区梁板架设安全技术交底记录.pdf', type: '安全档案', date: '2026-11-12', size: '1.8 MB' },
      ],
    },
    {
      id: 'beamYardA',
      name: '梁场示例A',
      type: '场站工程',
      sectionId: 'sec2',
      sectionName: '二工区',
      stage: '智慧梁场预制生产',
      stake: 'K35+120 右侧',
      cameraName: '梁场示例A · 龙门吊02号枪机',
      icon: 'yard',
      lon: 126.115,
      lat: 47.508,
      alt: 220,
      imgPath: '/assets/corridor_aerial.jpg',
      duration: '04:30',
      elapsedSec: 38,
      photosCount: 8,
      videosCount: 4,
      inspectionsCount: 41,
      metrics: {
        length: '占地 42 亩',
        progress: '91.2%',
        beamsDone: '218 / 240 片',
        supervisor: '李明远 (梁场场长)',
      },
      docs: [
        { name: '智慧梁场智能张拉与压浆自动采集台账.xlsx', type: '质量台账', date: '2026-11-22', size: '3.2 MB' },
        { name: '龙门吊特种设备定期检验合格报告.pdf', type: '设备档案', date: '2026-09-10', size: '1.5 MB' },
        { name: '箱梁蒸汽养生温湿度闭环监测月报.pdf', type: '监控报告', date: '2026-11-19', size: '4.1 MB' },
      ],
    },
    {
      id: 'batchPlantA',
      name: '拌合站示例A',
      type: '场站工程',
      sectionId: 'sec2',
      sectionName: '二工区',
      stage: '全天候智能拌合供料',
      stake: 'K33+860 右侧',
      cameraName: '拌合站示例A · 料仓全景球机',
      icon: 'plant',
      lon: 126.135,
      lat: 47.402,
      alt: 218,
      imgPath: '/assets/showcase_viaduct.jpg',
      duration: '03:45',
      elapsedSec: 24,
      photosCount: 5,
      videosCount: 3,
      inspectionsCount: 34,
      metrics: {
        length: '双 HZS180 机组',
        progress: '88.9%',
        beamsDone: '累计产能 9.4万 m³',
        supervisor: '王志强 (站长)',
      },
      docs: [
        { name: 'C50 预应力混凝土配合比动态监测周报.pdf', type: '配合比报告', date: '2026-11-24', size: '2.7 MB' },
        { name: '砂石骨料进场全周期地磅溯源记录.xlsx', type: '备料台账', date: '2026-11-25', size: '5.6 MB' },
        { name: '拌合站环保降尘与污水零排放核查表.pdf', type: '环保验收', date: '2026-11-15', size: '1.9 MB' },
      ],
    },
  ];

  for (const p of poisData) {
    await db
      .insert(poiObjects)
      .values(p)
      .onConflictDoUpdate({
        target: poiObjects.id,
        set: {
          name: p.name,
          stage: p.stage,
          metrics: p.metrics,
          docs: p.docs,
        },
      });
  }

  // 3. Focus Items (idempotent reset if empty)
  const existingFocus = await db.select().from(focusItems).limit(1);
  if (existingFocus.length === 0) {
    await db.insert(focusItems).values([
      { category: 'nodes', categoryTitle: '关键节点', summaryPrefix: '本月计划关键节点', unit: '项', icon: 'flag', title: '桥梁示例A 主跨预制箱梁架设完成', sectionName: '二工区', dueDate: '2026-11-28', status: '推进中', statusTone: 'info', sortOrder: 1 },
      { category: 'nodes', categoryTitle: '关键节点', summaryPrefix: '本月计划关键节点', unit: '项', icon: 'flag', title: '一工区 K18+400 路基填筑交验', sectionName: '一工区', dueDate: '2026-11-29', status: '已完成', statusTone: 'ok', sortOrder: 2 },
      { category: 'nodes', categoryTitle: '关键节点', summaryPrefix: '本月计划关键节点', unit: '项', icon: 'flag', title: '四工区 跨河中桥盖梁混凝土浇筑', sectionName: '四工区', dueDate: '2026-11-30', status: '重点盯控', statusTone: 'warn', sortOrder: 3 },
      { category: 'issues', categoryTitle: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', title: '二工区梁场运梁便道雨后局部翻浆需加固', sectionName: '二工区', dueDate: '2026-11-26', status: '待处理', statusTone: 'warn', sortOrder: 1 },
      { category: 'issues', categoryTitle: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', title: '三工区 K56 农灌沟渠改移图纸会签', sectionName: '三工区', dueDate: '2026-11-27', status: '会签中', statusTone: 'info', sortOrder: 2 },
      { category: 'issues', categoryTitle: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', title: '拌合站示例A 冬季骨料保温棚温控校准', sectionName: '二工区', dueDate: '2026-11-26', status: '处理中', statusTone: 'info', sortOrder: 3 },
      { category: 'issues', categoryTitle: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', title: '五工区高压线迁改停电窗口协调', sectionName: '五工区', dueDate: '2026-11-28', status: '待协调', statusTone: 'warn', sortOrder: 4 },
      { category: 'issues', categoryTitle: '协同问题', summaryPrefix: '待协同处置', unit: '项', icon: 'alert', title: '黑土地表土剥离堆存区防尘网补覆', sectionName: '六工区', dueDate: '2026-11-26', status: '整改中', statusTone: 'ok', sortOrder: 5 },
      { category: 'collab', categoryTitle: '协同事项', summaryPrefix: '跨工区协同', unit: '项', icon: 'handshake', title: '一工区与二工区 预制箱梁错峰运架调度方案', sectionName: '一/二工区', dueDate: '2026-11-27', status: '已排程', statusTone: 'ok', sortOrder: 1 },
      { category: 'collab', categoryTitle: '协同事项', summaryPrefix: '跨工区协同', unit: '项', icon: 'handshake', title: '二工区拌合站向三工区应急供料联动机制', sectionName: '二/三工区', dueDate: '2026-11-30', status: '执行中', statusTone: 'info', sortOrder: 2 },
    ]);
  }

  // 4. Milestones
  const milestonesData = [
    { id: 'm1', milestoneDate: '2026-06-15', title: '场地准备', description: '完成施工便道修筑、红线清表及黑土地表土剥离集中堆存。', imgMode: 'before', cssFilter: 'sepia(0.18) saturate(0.86) brightness(0.96)', photosCount: 14, videosCount: 1, logsCount: 12, sortOrder: 1 },
    { id: 'm2', milestoneDate: '2026-08-10', title: '桩基施工', description: '完成主桥 48 根钻孔灌注桩成孔浇筑，超声波检测 I 类桩占比 100%。', imgMode: 'before', cssFilter: 'saturate(0.95) contrast(1.04)', photosCount: 22, videosCount: 2, logsCount: 19, sortOrder: 2 },
    { id: 'm3', milestoneDate: '2026-09-25', title: '墩台施工', description: '6 座主桥双柱式墩身及盖梁全部浇筑完成并拆模养护达标。', imgMode: 'before', cssFilter: 'none', photosCount: 18, videosCount: 3, logsCount: 24, sortOrder: 3 },
    { id: 'm4', milestoneDate: '2026-11-20', title: '梁板架设', description: '进入主跨预制箱梁架设阶段，累计完成架梁 56 片，预计月底实现半幅贯通。', imgMode: 'after', cssFilter: 'none', photosCount: 31, videosCount: 4, logsCount: 36, sortOrder: 4 },
  ];
  for (const m of milestonesData) {
    await db.insert(milestoneNodes).values(m).onConflictDoNothing();
  }

  // 5. Showcase Topics
  const topicsData = [
    {
      id: 'overview',
      title: '项目概览',
      subtitle: '项目全貌与总体情况',
      videoTitle: '项目概览 · 演示视频',
      durationSec: 328,
      durationStr: '05:28',
      icon: 'layers',
      imgPath: '/assets/showcase_viaduct.jpg',
      kpis: [{ label: '路线全长', val: '146.8 km' }, { label: '总体形象进度', val: '68.4%' }, { label: '参建工区', val: '6 个' }],
      chapters: [
        '正在演示：G1211吉黑高速明水至北安段全线走廊数字孪生与项目定位总览',
        '正在演示：一至六工区空间布局、控制性桥梁工程与智慧场站分布',
        '正在演示：2026年度关键形象进度达成与建成后区域高速通道展望',
      ],
      summaries: [
        { title: '项目总体概况：', desc: '路线走向、建设规模与项目定位' },
        { title: '工程总体布局：', desc: '工区划分、主要工程与场站' },
        { title: '建设进展情况：', desc: '关键节点与阶段形象进度' },
        { title: '管理应用展示：', desc: '质量、安全与无人机巡检' },
        { title: '建成效果展望：', desc: '设计模型与交通服务' },
      ],
      sortOrder: 1,
    },
    {
      id: 'keyworks',
      title: '重点工程',
      subtitle: '关键工程与建设节点',
      videoTitle: '重点工程 · 演示视频',
      durationSec: 285,
      durationStr: '04:45',
      icon: 'bridge',
      imgPath: '/assets/milestone_after.jpg',
      kpis: [{ label: '重点工程', val: '12 处' }, { label: '关键节点达标', val: '94.2%' }, { label: '架梁完成', val: '63.4%' }],
      chapters: [
        '正在演示：二工区控制性桥梁工程桩基—墩台—梁板架设全流程节点溯源',
        '正在演示：架桥机及大型吊装机械实时工况监测与BIM进度模拟对比',
        '正在演示：跨河特大桥冬季施工质量温控与工期保障方案',
      ],
      summaries: [
        { title: '控制性桥梁工程：', desc: '主跨结构形式与梁板架设进展' },
        { title: '智慧预制梁场：', desc: '工业化流水线生产与智能养护' },
        { title: '关键节点管控：', desc: '里程碑影像对比与进度偏差预警' },
        { title: '跨工区协同调度：', desc: '运梁通道与混凝土供应联动机制' },
        { title: '重难点攻关成果：', desc: '寒区冻土路基与桥梁耐久性工艺' },
      ],
      sortOrder: 2,
    },
    {
      id: 'quality',
      title: '质量管理',
      subtitle: '专项看板与质量追溯',
      videoTitle: '质量管理 · 演示视频',
      durationSec: 260,
      durationStr: '04:20',
      icon: 'shield',
      imgPath: '/assets/corridor_aerial.jpg',
      kpis: [{ label: '试验检测合格率', val: '99.1%' }, { label: '拌合数据在线率', val: '99.6%' }, { label: '整改闭环率', val: '94.5%' }],
      chapters: [
        '正在演示：工地试验室万能机/压力机实时数据自动采集与超标锁定',
        '正在演示：混凝土拌合站全自动称量监控与运输车GPS轨迹追溯',
        '正在演示：路面摊铺温度、碾压遍数北斗高精度实时质控',
      ],
      summaries: [
        { title: '智慧试验室监管：', desc: '试验数据实时上传与防篡改存证' },
        { title: '拌合站动态预警：', desc: '配合比超差自动报警与分级处置' },
        { title: '路面摊铺压实监控：', desc: '温度离析预警与压实轨迹回放' },
        { title: '首件工程认可制：', desc: '工艺参数标准化与全线复制推广' },
        { title: '质量问题闭环：', desc: '移动端拍照上报—整改—复验全流程' },
      ],
      sortOrder: 3,
    },
    {
      id: 'safety',
      title: '安全巡检',
      subtitle: '安全风险与隐患闭环',
      videoTitle: '安全巡检 · 演示视频',
      durationSec: 242,
      durationStr: '04:02',
      icon: 'helmet',
      imgPath: '/assets/milestone_before.jpg',
      kpis: [{ label: '平安工地达标', val: '95.0%' }, { label: '隐患闭环率', val: '96.2%' }, { label: '安全运行天数', val: '418 天' }],
      chapters: [
        '正在演示：高处作业、大型起重吊装与临水临边区域AI视频智能预警',
        '正在演示：危大工程分级管控清单与班前安全教育实名打卡',
        '正在演示：网格化安全巡检隐患随手拍与限时整改销号机制',
      ],
      summaries: [
        { title: '平安工地建设：', desc: '标准化防护设施与智慧门禁联动' },
        { title: '危大工程盯控：', desc: '架梁吊装与深基坑实时监测预警' },
        { title: 'AI视频隐患识别：', desc: '安全帽、反光衣及禁区闯入自动抓拍' },
        { title: '特种设备监管：', desc: '龙门吊/架桥机维保与操作手认证' },
        { title: '应急联动响应：', desc: '突发事件一键调度与预案演练归档' },
      ],
      sortOrder: 4,
    },
    {
      id: 'uav',
      title: '无人机应用',
      subtitle: '航线巡检与影像取证',
      videoTitle: '无人机应用 · 演示视频',
      durationSec: 294,
      durationStr: '04:54',
      icon: 'drone',
      imgPath: '/assets/corridor_aerial.jpg',
      kpis: [{ label: '累计巡检航次', val: '386 次' }, { label: '倾斜摄影覆盖', val: '100%' }, { label: '自动识别隐患', val: '47 处' }],
      chapters: [
        '正在演示：全线 146.8 km 自动化无人机机巢定航线常态化巡检',
        '正在演示：高分辨率倾斜摄影三维实景建模与土方量自动核验',
        '正在演示：空地联动视频巡查与黑土地保护区边界动态核查',
      ],
      summaries: [
        { title: '智能航线规划：', desc: '沿线自动起降与常态化周期巡飞' },
        { title: '三维实景重构：', desc: '月度倾斜摄影模型更新与进度对比' },
        { title: 'AI隐患精准识别：', desc: '边坡防护、临边围挡与扬尘自动取证' },
        { title: '空地视频联动：', desc: '无人机图传与地面球机协同指挥' },
        { title: '巡检报告自动生成：', desc: '一键导出图文定位台账与整改工单' },
      ],
      sortOrder: 5,
    },
    {
      id: 'smartspeed',
      title: '智慧提速',
      subtitle: '交通态势与速度策略',
      videoTitle: '智慧提速 · 演示视频',
      durationSec: 270,
      durationStr: '04:30',
      icon: 'speed',
      imgPath: '/assets/showcase_viaduct.jpg',
      kpis: [{ label: '设计最高时速', val: '120 km/h' }, { label: '冰雪气象感知点', val: '28 处' }, { label: '联动情报板', val: '36 块' }],
      chapters: [
        '正在演示：寒区冰雪恶劣天气路面结冰感知与动态限速算法研判',
        '正在演示：分段可变限速策略下发与沿线情报板、广播联动发布',
        '正在演示：建管养运一体化数字底座赋能通车后智慧高速安全提速',
      ],
      summaries: [
        { title: '全天候交通态势感知：', desc: '雷视融合与能见度/路面状态监测' },
        { title: '智能速度研判算法：', desc: '多源气象与车流密度动态限速模型' },
        { title: '分级管控策略库：', desc: '晴好提速、冰雪降速与事件应急诱导' },
        { title: '信息发布联动闭环：', desc: '情报板内容审核发布与执行回执核验' },
        { title: '场景回放与评估：', desc: '通行效率提升与事故率下降复盘分析' },
      ],
      sortOrder: 6,
    },
  ];
  for (const t of topicsData) {
    await db.insert(showcaseTopics).values(t).onConflictDoNothing();
  }

  // 6. Demo Users (Better Auth)
  const adminId = await ensureDemoUser({
    email: 'admin@jihei.cn',
    password: 'Jihei@2026',
    name: '陈志强（指挥部管理员）',
    role: 'admin',
    department: '建管指挥部',
    sectionScope: 'all',
  });
  await ensureDemoUser({
    email: 'sec2@jihei.cn',
    password: 'Jihei@2026',
    name: '张建国（二工区总工）',
    role: 'engineer',
    department: '二工区项目部',
    sectionScope: 'sec2',
  });
  await ensureDemoUser({
    email: 'supervisor@jihei.cn',
    password: 'Jihei@2026',
    name: '赵文博（总监理工程师）',
    role: 'supervisor',
    department: '总监办',
    sectionScope: 'all',
  });
  await ensureDemoUser({
    email: 'guide@jihei.cn',
    password: 'Jihei@2026',
    name: '林晓雪（数字展厅讲解员）',
    role: 'viewer',
    department: '综合办展厅组',
    sectionScope: 'all',
  });

  // 7. System Configs (Module 15)
  const configs = [
    {
      key: 'integration.sources',
      category: 'integration',
      label: '外部系统接入清单',
      value: {
        items: [
          { id: 'sys-bim', name: 'BIM 轻量化引擎服务', protocol: 'HTTPS / 3D Tiles', endpoint: 'https://bim.jihei.local/tiles', status: 'online', latencyMs: 24, syncFreq: '实时' },
          { id: 'sys-iot', name: '拌合站与试验室物联网关', protocol: 'MQTT / TLS', endpoint: 'mqtt://iot.jihei.local:8883', status: 'online', latencyMs: 18, syncFreq: '5 秒' },
          { id: 'sys-uav', name: '无人机自动化机巢调度平台', protocol: 'WebSocket / REST', endpoint: 'https://uav.jihei.local/api/v2', status: 'online', latencyMs: 42, syncFreq: '10 秒' },
          { id: 'sys-tdt', name: '天地图 WMTS 影像与注记服务', protocol: 'WMTS 1.0.0', endpoint: 'https://t0.tianditu.gov.cn/img_c/wmts', status: 'online', latencyMs: 65, syncFreq: '按需瓦片' },
          { id: 'sys-vms', name: '沿线视频监控 GB28181 网关', protocol: 'GB28181 / WebRTC', endpoint: 'sip://vms.jihei.local:5060', status: 'warn', latencyMs: 112, syncFreq: '实时流' },
        ],
      },
    },
    {
      key: 'metrics.definitions',
      category: 'metrics',
      label: '全平台核心指标口径',
      value: {
        items: [
          { code: 'KPI-PRG-01', name: '总体形象进度', formula: 'Σ(分项工程产值 × 权重) / 合同总产值 × 100%', unit: '%', threshold: '偏差 ≤ ±3%', owner: '工程部' },
          { code: 'KPI-QLT-01', name: '混凝土强度合格率', formula: '评定合格组数 / 累计试件组数 × 100%', unit: '%', threshold: '≥ 98.5%', owner: '中心试验室' },
          { code: 'KPI-SAF-01', name: '安全隐患闭环率', formula: '按期复查销号数 / 累计发现隐患数 × 100%', unit: '%', threshold: '≥ 95.0%', owner: '安质部' },
          { code: 'KPI-BLK-01', name: '黑土地表土剥离复垦率', formula: '规范堆存及复垦面积 / 占用耕地表土面积 × 100%', unit: '%', threshold: '100% 红线受控', owner: '环保水保组' },
        ],
      },
    },
    {
      key: 'content.platform',
      category: 'content',
      label: '平台与展厅展示内容配置',
      value: {
        platformTitle: 'G1211吉黑高速明水至北安段',
        platformSubtitle: '工程建设项目综合管理平台',
        watermarkText: '数字孪生生产平台 · 实时数据底座',
        hallAutoCarouselSec: 45,
        cesiumOfflineThreshold: 6,
        enableWorldTerrain: true,
      },
    },
  ];

  for (const c of configs) {
    await db
      .insert(systemConfigs)
      .values({ ...c, updatedBy: 'seed' })
      .onConflictDoNothing();
  }

  // 8. Initial Audit Logs
  const existingLogs = await db.select().from(auditLogs).limit(1);
  if (existingLogs.length === 0) {
    await db.insert(auditLogs).values([
      { userId: adminId, userName: '陈志强（指挥部管理员）', action: 'SYSTEM_INIT', moduleId: 'system', target: 'PostgreSQL 全栈底座', detail: { message: '完成 Next.js 16 + PostgreSQL 16 数据底座初始化' }, ipAddress: '127.0.0.1' },
      { userId: adminId, userName: '陈志强（指挥部管理员）', action: 'RBAC_SYNC', moduleId: 'system', target: '演示权限体系', detail: { roles: ['admin', 'engineer', 'supervisor', 'viewer'] }, ipAddress: '127.0.0.1' },
      { userId: adminId, userName: '张建国（二工区总工）', action: 'MILESTONE_UPDATE', moduleId: 'home', target: '桥梁示例A', detail: { beamsDone: '56 / 80 片' }, ipAddress: '127.0.0.1' },
    ]);
  }

  // 9. Initial AI Threads (Module 16)
  if (adminId) {
    const existingThreads = await db.select().from(aiThreads).limit(1);
    if (existingThreads.length === 0) {
      await db.insert(aiThreads).values([
        { id: 'thread-exhibition-1', userId: adminId, scenario: 'exhibition', title: '明北段工程与盖梁拓宽专题讲解', pinned: true },
        { id: 'thread-analysis-1', userId: adminId, scenario: 'analysis', title: '全线六工区进度偏差与质量隐患研判', pinned: true },
        { id: 'thread-field-1', userId: adminId, scenario: 'field', title: '二工区梁板架设施工协同办理', pinned: false },
      ]);
      await db.insert(aiMessages).values([
        {
          id: 'msg-exh-1',
          threadId: 'thread-exhibition-1',
          role: 'user',
          parts: [{ type: 'text', text: '介绍一下明北段工程和二工区重点工程情况' }],
        },
        {
          id: 'msg-exh-2',
          threadId: 'thread-exhibition-1',
          role: 'assistant',
          parts: [{
            type: 'text',
            text: 'G1211吉黑高速明水至北安段全长 146.8 km，共划分 6 个参建工区。当前二工区「桥梁示例A」处于主跨 40m 预制箱梁架设阶段（已完成 56/80 片，形象进度 68.5%），「梁场示例A」与「拌合站示例A」均实现全过程物联感知。您可以直接点击快捷指令让我联动三维地球飞抵任意点位。',
          }],
        },
        {
          id: 'msg-ana-1',
          threadId: 'thread-analysis-1',
          role: 'assistant',
          parts: [{
            type: 'text',
            text: '我是管理研判助手，已接入 PostgreSQL 实时工区与重点事项台账。您可以询问各工区进度对比、待协同问题清单或安全质量管控指标，我将自动调用数据库查询工具并生成研判摘要。',
          }],
        },
        {
          id: 'msg-fld-1',
          threadId: 'thread-field-1',
          role: 'assistant',
          parts: [{
            type: 'text',
            text: '一线办理助手就绪：支持现场问题核查、重点工程资料调阅与模块快速跳转。',
          }],
        },
      ]);
    }
  }

  console.log('[seed] 开始初始化 Phase 2 领域表数据 (m02, m03, m04, m08)...');
  await seedM02(db);
  await seedM03(db);
  await seedM04(db);
  await seedM08(db);

  console.log('[seed] 开始初始化 Phase 3 领域表数据 (m05, m06, m07, m09, m10)...');
  await seedM05(db);
  await seedM06(db);
  await seedM07(db);
  await seedM09(db);
  await seedM10(db);

  console.log('[seed] 全量初始化完成！');
}

seed()
  .catch((err) => {
    console.error('[seed] 失败:', err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await pool.end();
  });
