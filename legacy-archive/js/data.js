/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   1.综合首页 结构化演示数据集
   ========================================================================== */

window.JIHEI_DATA = {
  projectName: 'G1211吉黑高速明水至北安段',
  platformName: '工程建设项目综合管理平台',
  defaultDate: '2026-11-25',

  topModules: [
    { id: 'home', name: '综合首页', active: true },
    { id: 'progress', name: '进度管理' },
    { id: 'quality', name: '质量管理' },
    { id: 'safety', name: '安全管理' },
    { id: 'pingan', name: '平安工地' },
    { id: 'uav', name: '无人机巡检' },
    { id: 'video', name: '视频监控' },
    { id: 'staff', name: '人员管理' },
    { id: 'machine', name: '机械管理' },
    { id: 'material', name: '全周期备料管理' },
    { id: 'measure', name: '计量管理' },
    { id: 'speed', name: '智慧提速' },
    { id: 'publish', name: '信息发布' },
    { id: 'blacksoil', name: '黑土地保护' }
  ],

  subPages: [
    { id: 'overview', name: '项目总览', file: '01_项目总览.html' },
    { id: 'roaming', name: '数字漫游', file: '02_数字漫游.html' },
    { id: 'milestone', name: '建设里程碑', file: '03_建设里程碑.html' },
    { id: 'showcase', name: '专题展示', file: '04_专题展示.html' }
  ],

  /* 6个工区数据与地图锚点 (16:9锁定画布精确对齐航拍道路) */
  workSections: [
    {
      id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500', x: 41.5, y: 76.5,
      scale: 1.32, panX: 4, panY: -12,
      summary: { sections: 1, keyWorks: 2, yards: 1 },
      progress: [78.4, 68.2, 52.0, 92.0, 38.5, 34.0],
      quality: [99.6, 99.0, 99.4, 98.1, 99.3, 95.8],
      safety: [97.4, 100, 99.0, 96.5, 100, 94.2]
    },
    {
      id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200', x: 30.8, y: 51.5,
      scale: 1.35, panX: 5, panY: -2,
      summary: { sections: 1, keyWorks: 3, yards: 2 },
      progress: [74.6, 66.8, 49.5, 91.2, 35.0, 30.2],
      quality: [99.5, 98.9, 99.5, 97.9, 99.2, 96.0],
      safety: [96.8, 100, 98.8, 95.8, 100, 93.6]
    },
    {
      id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800', x: 28.8, y: 35.5,
      scale: 1.42, panX: 9, panY: 9,
      summary: { sections: 1, keyWorks: 2, yards: 2 },
      progress: [71.2, 61.5, 45.4, 87.5, 31.2, 27.4],
      quality: [99.2, 98.6, 99.0, 97.4, 98.9, 93.5],
      safety: [95.9, 100, 98.2, 94.6, 100, 92.1]
    },
    {
      id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000', x: 34.5, y: 22.0,
      scale: 1.52, panX: 6, panY: 18,
      summary: { sections: 1, keyWorks: 2, yards: 1 },
      progress: [69.5, 60.1, 43.2, 85.4, 29.8, 25.9],
      quality: [99.1, 98.5, 98.8, 97.2, 99.0, 94.0],
      safety: [95.5, 100, 98.0, 94.0, 100, 91.5]
    },
    {
      id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400', x: 46.5, y: 14.2,
      scale: 1.6, panX: 1, panY: 22,
      summary: { sections: 1, keyWorks: 2, yards: 1 },
      progress: [72.0, 62.0, 46.0, 88.0, 31.8, 28.0],
      quality: [99.3, 98.8, 99.1, 97.5, 99.1, 94.8],
      safety: [96.0, 100, 98.4, 95.0, 100, 92.5]
    },
    {
      id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800', x: 58.2, y: 9.8,
      scale: 1.65, panX: -6, panY: 25,
      summary: { sections: 1, keyWorks: 1, yards: 1 },
      progress: [70.8, 61.8, 44.1, 89.2, 28.7, 26.1],
      quality: [99.4, 98.7, 99.2, 97.6, 98.8, 94.2],
      safety: [96.1, 100, 98.6, 94.8, 100, 93.0]
    }
  ],

  /* 全线默认管理概览数据（严格对齐示意图） */
  managementTabs: {
    progress: [
      { key: 'subgrade', name: '路基工程', pct: 72.8, icon: 'subgrade' },
      { key: 'bridge', name: '桥梁工程', pct: 63.4, icon: 'bridge' },
      { key: 'pavement', name: '路面工程', pct: 46.7, icon: 'pavement' },
      { key: 'yard', name: '场站工程', pct: 88.9, icon: 'yard' },
      { key: 'safetyFac', name: '交安工程', pct: 32.5, icon: 'guardrail' },
      { key: 'green', name: '绿化工程', pct: 28.6, icon: 'leaf' }
    ],
    quality: [
      { key: 'pile', name: '桩基检测合格率', pct: 99.4, icon: 'bridge' },
      { key: 'concrete', name: '混凝土强度合格率', pct: 98.8, icon: 'yard' },
      { key: 'beam', name: '预制梁抽检合格率', pct: 99.2, icon: 'subgrade' },
      { key: 'compact', name: '路基压实度合格率', pct: 97.6, icon: 'pavement' },
      { key: 'mix', name: '拌合站数据合规率', pct: 99.1, icon: 'guardrail' },
      { key: 'rectify', name: '质量隐患闭环率', pct: 94.5, icon: 'leaf' }
    ],
    safety: [
      { key: 'hazard', name: '安全隐患闭环率', pct: 96.2, icon: 'guardrail' },
      { key: 'edu', name: '班前教育覆盖率', pct: 100.0, icon: 'subgrade' },
      { key: 'risk', name: '危大工程管控率', pct: 98.5, icon: 'bridge' },
      { key: 'site', name: '平安工地达标率', pct: 95.0, icon: 'yard' },
      { key: 'equip', name: '特种设备年检率', pct: 100.0, icon: 'pavement' },
      { key: 'ai', name: 'AI风险识别处置率', pct: 92.8, icon: 'leaf' }
    ]
  },

  /* 重点关注数据（严格对齐示意图） */
  focusItems: [
    {
      id: 'nodes',
      title: '关键节点',
      summaryPrefix: '本月计划关键节点',
      count: 3,
      unit: '项',
      icon: 'flag',
      records: [
        { name: '桥梁示例A 主跨预制箱梁架设完成', section: '二工区', due: '2026-11-28', status: '推进中', statusClass: 'info' },
        { name: '一工区 K18+400 路基填筑交验', section: '一工区', due: '2026-11-29', status: '已完成', statusClass: 'ok' },
        { name: '四工区 跨河中桥盖梁混凝土浇筑', section: '四工区', due: '2026-11-30', status: '重点盯控', statusClass: 'warn' }
      ]
    },
    {
      id: 'issues',
      title: '协同问题',
      summaryPrefix: '待协同处置',
      count: 5,
      unit: '项',
      icon: 'alert',
      records: [
        { name: '二工区梁场运梁便道雨后局部翻浆需加固', section: '二工区', due: '2026-11-26', status: '待处理', statusClass: 'warn' },
        { name: '三工区 K56 农灌沟渠改移图纸会签', section: '三工区', due: '2026-11-27', status: '会签中', statusClass: 'info' },
        { name: '拌合站示例A 冬季骨料保温棚温控校准', section: '二工区', due: '2026-11-26', status: '处理中', statusClass: 'info' },
        { name: '五工区高压线迁改停电窗口协调', section: '五工区', due: '2026-11-28', status: '待协调', statusClass: 'warn' },
        { name: '黑土地表土剥离堆存区防尘网补覆', section: '六工区', due: '2026-11-26', status: '整改中', statusClass: 'ok' }
      ]
    },
    {
      id: 'collab',
      title: '协同事项',
      summaryPrefix: '跨工区协同',
      count: 2,
      unit: '项',
      icon: 'handshake',
      records: [
        { name: '一工区与二工区 预制箱梁错峰运架调度方案', section: '一/二工区', due: '2026-11-27', status: '已排程', statusClass: 'ok' },
        { name: '二工区拌合站向三工区应急供料联动机制', section: '二/三工区', due: '2026-11-30', status: '执行中', statusClass: 'info' }
      ]
    }
  ],

  /* 工程点位对象（匹配示意图 + 航拍实景精准定位） */
  poiObjects: {
    bridgeA: {
      id: 'bridgeA',
      name: '桥梁示例A',
      type: '桥梁工程',
      sectionId: 'sec2',
      section: '二工区',
      stage: '梁板架设',
      stake: 'K34+280',
      camera: '桥梁示例A · 01号摄像机',
      x: 45.0,
      y: 67.2,
      icon: 'bridge',
      imgKey: 'milestoneAfter',
      duration: '05:00',
      elapsed: 12,
      photos: 3,
      videos: 2,
      inspections: 26,
      metrics: { length: '684 m', progress: '68.5%', beamsDone: '56 / 80 片', supervisor: '张建国 (二工区总工)' },
      docs: [
        { name: '桥梁示例A 预制箱梁架设专项施工方案.pdf', type: '施工方案', date: '2026-10-18', size: '6.4 MB' },
        { name: 'K34+280 主桥墩柱混凝土抗压强度检测报告.pdf', type: '试验检测', date: '2026-10-29', size: '2.1 MB' },
        { name: '2026-11-20 无人机正射巡检影像包.zip', type: '无人机影像', date: '2026-11-20', size: '148 MB' },
        { name: '二工区梁板架设安全技术交底记录.pdf', type: '安全档案', date: '2026-11-12', size: '1.8 MB' }
      ]
    },
    beamYardA: {
      id: 'beamYardA',
      name: '梁场示例A',
      type: '场站工程',
      sectionId: 'sec2',
      section: '二工区',
      stage: '智慧梁场预制生产',
      stake: 'K35+120 右侧',
      camera: '梁场示例A · 龙门吊02号枪机',
      x: 66.9,
      y: 45.3,
      icon: 'yard',
      imgKey: 'corridor',
      duration: '04:30',
      elapsed: 38,
      photos: 8,
      videos: 4,
      inspections: 41,
      metrics: { length: '占地 42 亩', progress: '91.2%', beamsDone: '218 / 240 片', supervisor: '李明远 (梁场场长)' },
      docs: [
        { name: '智慧梁场智能张拉与压浆自动采集台账.xlsx', type: '质量台账', date: '2026-11-22', size: '3.2 MB' },
        { name: '龙门吊特种设备定期检验合格报告.pdf', type: '设备档案', date: '2026-09-10', size: '1.5 MB' },
        { name: '箱梁蒸汽养生温湿度闭环监测月报.pdf', type: '监控报告', date: '2026-11-19', size: '4.1 MB' }
      ]
    },
    batchPlantA: {
      id: 'batchPlantA',
      name: '拌合站示例A',
      type: '场站工程',
      sectionId: 'sec2',
      section: '二工区',
      stage: '全天候智能拌合供料',
      stake: 'K33+860 右侧',
      camera: '拌合站示例A · 料仓全景球机',
      x: 84.5,
      y: 71.0,
      icon: 'plant',
      imgKey: 'showcase',
      duration: '03:45',
      elapsed: 24,
      photos: 5,
      videos: 3,
      inspections: 34,
      metrics: { length: '双 HZS180 机组', progress: '88.9%', beamsDone: '累计产能 9.4万 m³', supervisor: '王志强 (站长)' },
      docs: [
        { name: 'C50 预应力混凝土配合比动态监测周报.pdf', type: '配合比报告', date: '2026-11-24', size: '2.7 MB' },
        { name: '砂石骨料进场全周期地磅溯源记录.xlsx', type: '备料台账', date: '2026-11-25', size: '5.6 MB' },
        { name: '拌合站环保降尘与污水零排放核查表.pdf', type: '环保验收', date: '2026-11-15', size: '1.9 MB' }
      ]
    }
  },

  /* 页面2：数字漫游 5个站点（严格对齐示意图） */
  roamingStations: [
    {
      id: 'start',
      name: '明水方向起点',
      section: '一工区',
      stage: 'BK0+000 路基交验与底基层施工',
      x: 52, y: 84,
      scale: 1.38, panX: -2, panY: -20,
      photos: 6, videos: 2, inspections: 18,
      imgKey: 'corridor',
      duration: '03:20',
      desc: '项目起点位于明水县北新发四队东南侧（BK0+000，125.8202°E, 47.2916°N），路基土石方工程已基本成型。'
    },
    {
      id: 'bridgeA',
      name: '桥梁示例A',
      section: '二工区',
      stage: '梁板架设',
      x: 46.2, y: 65,
      scale: 1.32, panX: 4, panY: -8,
      photos: 3, videos: 2, inspections: 26,
      imgKey: 'milestoneAfter',
      duration: '05:00',
      desc: '二工区控制性跨河大桥，当前正在开展主跨 40m 预制箱梁架设作业。'
    },
    {
      id: 'beamYardA',
      name: '梁场示例A',
      section: '二工区',
      stage: '智慧梁场预制生产',
      x: 68.5, y: 45.5,
      scale: 1.48, panX: -14, panY: 2,
      photos: 8, videos: 4, inspections: 41,
      imgKey: 'corridor',
      duration: '04:30',
      desc: '标准化智慧预制梁场，配置自动喷淋养护与智能张拉压浆系统。'
    },
    {
      id: 'batchPlantA',
      name: '拌合站示例A',
      section: '二工区',
      stage: '智能拌合供料',
      x: 84.5, y: 71.0,
      scale: 1.52, panX: -24, panY: -14,
      photos: 5, videos: 3, inspections: 34,
      imgKey: 'showcase',
      duration: '03:45',
      desc: '全封闭式绿色混凝土拌合站，实现骨料计量与配比偏差实时预警。'
    },
    {
      id: 'end',
      name: '北安方向终点',
      section: '六工区',
      stage: '建华枢纽互通主线贯通冲刺',
      x: 61, y: 12.5,
      scale: 1.62, panX: -8, panY: 26,
      photos: 4, videos: 2, inspections: 22,
      imgKey: 'showcase',
      duration: '04:10',
      desc: '项目终点位于北安市建华枢纽互通（126.4135°E, 48.2372°N），同步落实沿线黑土地表土剥离复垦保护。'
    }
  ],

  /* 页面3：建设里程碑 关键节点（严格对齐示意图） */
  milestoneNodes: [
    {
      id: 'm1',
      date: '2026-06-15',
      title: '场地准备',
      desc: '完成施工便道修筑、红线清表及黑土地表土剥离集中堆存。',
      imgMode: 'before',
      filter: 'sepia(0.18) saturate(0.86) brightness(0.96)',
      photos: 14, videos: 1, logs: 12
    },
    {
      id: 'm2',
      date: '2026-08-10',
      title: '桩基施工',
      desc: '完成主桥 48 根钻孔灌注桩成孔浇筑，超声波检测 I 类桩占比 100%。',
      imgMode: 'before',
      filter: 'saturate(0.95) contrast(1.04)',
      photos: 22, videos: 2, logs: 19
    },
    {
      id: 'm3',
      date: '2026-09-25',
      title: '墩台施工',
      desc: '6 座主桥双柱式墩身及盖梁全部浇筑完成并拆模养护达标。',
      imgMode: 'before',
      filter: 'none',
      photos: 18, videos: 3, logs: 24
    },
    {
      id: 'm4',
      date: '2026-11-20',
      title: '梁板架设',
      desc: '进入主跨预制箱梁架设阶段，累计完成架梁 56 片，预计月底实现半幅贯通。',
      imgMode: 'after',
      filter: 'none',
      photos: 31, videos: 4, logs: 36
    }
  ],

  /* 页面4：专题展示 6大演示专题（严格对齐示意图） */
  showcaseTopics: [
    {
      id: 'overview',
      title: '项目概览',
      subtitle: '项目全貌与总体情况',
      videoTitle: '项目概览 · 演示视频',
      durationSec: 328,
      durationStr: '05:28',
      icon: 'layers',
      imgKey: 'showcase',
      kpis: [{ label: '路线全长', val: '146.8 km' }, { label: '总体形象进度', val: '68.4%' }, { label: '参建工区', val: '6 个' }],
      chapters: [
        '正在演示：G1211吉黑高速明水至北安段全线走廊数字孪生与项目定位总览',
        '正在演示：一至六工区空间布局、控制性桥梁工程与智慧场站分布',
        '正在演示：2026年度关键形象进度达成与建成后区域高速通道展望'
      ],
      summaries: [
        { title: '项目总体概况：', desc: '路线走向、建设规模与项目定位' },
        { title: '工程总体布局：', desc: '工区划分、主要工程与场站' },
        { title: '建设进展情况：', desc: '关键节点与阶段形象进度' },
        { title: '管理应用展示：', desc: '质量、安全与无人机巡检' },
        { title: '建成效果展望：', desc: '设计模型与交通服务' }
      ]
    },
    {
      id: 'keyworks',
      title: '重点工程',
      subtitle: '关键工程与建设节点',
      videoTitle: '重点工程 · 演示视频',
      durationSec: 285,
      durationStr: '04:45',
      icon: 'bridge',
      imgKey: 'milestoneAfter',
      kpis: [{ label: '重点工程', val: '12 处' }, { label: '关键节点达标', val: '94.2%' }, { label: '架梁完成', val: '63.4%' }],
      chapters: [
        '正在演示：二工区控制性桥梁工程桩基—墩台—梁板架设全流程节点溯源',
        '正在演示：架桥机及大型吊装机械实时工况监测与BIM进度模拟对比',
        '正在演示：跨河特大桥冬季施工质量温控与工期保障方案'
      ],
      summaries: [
        { title: '控制性桥梁工程：', desc: '主跨结构形式与梁板架设进展' },
        { title: '智慧预制梁场：', desc: '工业化流水线生产与智能养护' },
        { title: '关键节点管控：', desc: '里程碑影像对比与进度偏差预警' },
        { title: '跨工区协同调度：', desc: '运梁通道与混凝土供应联动机制' },
        { title: '重难点攻关成果：', desc: '寒区冻土路基与桥梁耐久性工艺' }
      ]
    },
    {
      id: 'quality',
      title: '质量管理',
      subtitle: '专项看板与质量追溯',
      videoTitle: '质量管理 · 演示视频',
      durationSec: 260,
      durationStr: '04:20',
      icon: 'shield',
      imgKey: 'corridor',
      kpis: [{ label: '试验检测合格率', val: '99.1%' }, { label: '拌合数据在线率', val: '99.6%' }, { label: '整改闭环率', val: '94.5%' }],
      chapters: [
        '正在演示：工地试验室万能机/压力机实时数据自动采集与超标锁定',
        '正在演示：混凝土拌合站全自动称量监控与运输车GPS轨迹追溯',
        '正在演示：路面摊铺温度、碾压遍数北斗高精度实时质控'
      ],
      summaries: [
        { title: '智慧试验室监管：', desc: '试验数据实时上传与防篡改存证' },
        { title: '拌合站动态预警：', desc: '配合比超差自动报警与分级处置' },
        { title: '路面摊铺压实监控：', desc: '温度离析预警与压实轨迹回放' },
        { title: '首件工程认可制：', desc: '工艺参数标准化与全线复制推广' },
        { title: '质量问题闭环：', desc: '移动端拍照上报—整改—复验全流程' }
      ]
    },
    {
      id: 'safety',
      title: '安全巡检',
      subtitle: '安全风险与隐患闭环',
      videoTitle: '安全巡检 · 演示视频',
      durationSec: 242,
      durationStr: '04:02',
      icon: 'helmet',
      imgKey: 'milestoneBefore',
      kpis: [{ label: '平安工地达标', val: '95.0%' }, { label: '隐患闭环率', val: '96.2%' }, { label: '安全运行天数', val: '418 天' }],
      chapters: [
        '正在演示：高处作业、大型起重吊装与临水临边区域AI视频智能预警',
        '正在演示：危大工程分级管控清单与班前安全教育实名打卡',
        '正在演示：网格化安全巡检隐患随手拍与限时整改销号机制'
      ],
      summaries: [
        { title: '平安工地建设：', desc: '标准化防护设施与智慧门禁联动' },
        { title: '危大工程盯控：', desc: '架梁吊装与深基坑实时监测预警' },
        { title: 'AI视频隐患识别：', desc: '安全帽、反光衣及禁区闯入自动抓拍' },
        { title: '特种设备监管：', desc: '龙门吊/架桥机维保与操作手认证' },
        { title: '应急联动响应：', desc: '突发事件一键调度与预案演练归档' }
      ]
    },
    {
      id: 'uav',
      title: '无人机应用',
      subtitle: '航线巡检与影像取证',
      videoTitle: '无人机应用 · 演示视频',
      durationSec: 294,
      durationStr: '04:54',
      icon: 'drone',
      imgKey: 'corridor',
      kpis: [{ label: '累计巡检航次', val: '386 次' }, { label: '倾斜摄影覆盖', val: '100%' }, { label: '自动识别隐患', val: '47 处' }],
      chapters: [
        '正在演示：全线 146.8 km 自动化无人机机巢定航线常态化巡检',
        '正在演示：高分辨率倾斜摄影三维实景建模与土方量自动核验',
        '正在演示：空地联动视频巡查与黑土地保护区边界动态核查'
      ],
      summaries: [
        { title: '智能航线规划：', desc: '沿线自动起降与常态化周期巡飞' },
        { title: '三维实景重构：', desc: '月度倾斜摄影模型更新与进度对比' },
        { title: 'AI隐患精准识别：', desc: '边坡防护、临边围挡与扬尘自动取证' },
        { title: '空地视频联动：', desc: '无人机图传与地面球机协同指挥' },
        { title: '巡检报告自动生成：', desc: '一键导出图文定位台账与整改工单' }
      ]
    },
    {
      id: 'smartspeed',
      title: '智慧提速',
      subtitle: '交通态势与速度策略',
      videoTitle: '智慧提速 · 演示视频',
      durationSec: 270,
      durationStr: '04:30',
      icon: 'speed',
      imgKey: 'showcase',
      kpis: [{ label: '设计最高时速', val: '120 km/h' }, { label: '冰雪气象感知点', val: '28 处' }, { label: '联动情报板', val: '36 块' }],
      chapters: [
        '正在演示：寒区冰雪恶劣天气路面结冰感知与动态限速算法研判',
        '正在演示：分段可变限速策略下发与沿线情报板、广播联动发布',
        '正在演示：建管养运一体化数字底座赋能通车后智慧高速安全提速'
      ],
      summaries: [
        { title: '全天候交通态势感知：', desc: '雷视融合与能见度/路面状态监测' },
        { title: '智能速度研判算法：', desc: '多源气象与车流密度动态限速模型' },
        { title: '分级管控策略库：', desc: '晴好提速、冰雪降速与事件应急诱导' },
        { title: '信息发布联动闭环：', desc: '情报板内容审核发布与执行回执核验' },
        { title: '场景回放与评估：', desc: '通行效率提升与事故率下降复盘分析' }
      ]
    }
  ]
};
