/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   全局环境与资源配置（Token、底图降级策略、懒加载清单、64页检索目录、日期系数）
   ========================================================================== */

window.JIHEI_CONFIG = {
  version: '20261127-p4',

  /* 空间底图与地形服务凭据（便于内网部署时统一替换） */
  cesiumIonToken:
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiIzNDcxY2E3Zi04YjcxLTQxMDYtYmVkMi0xZTBmYTMxNDI2ZmQiLCJpZCI6MjEzNjUyLCJpYXQiOjE3MTUxMzU3NTN9.8w7jF6ETAg1bmeWfSLNRO0xVrp5rlYCnDKJt_XD0K8Y',
  tiandituToken: 'd0ff04fb27c18bfd43ef85d3dcf4dc7f',

  /* 是否尝试启用 Cesium World Terrain（内网/离线时自动回退至椭球地形） */
  enableWorldTerrain: true,

  /* 外网影像连续报错达到阈值时自动切换为本地暗色数字孪生兜底底图 */
  offlineFallbackThreshold: 6,

  /* 统计基准日期历史对比偏移（让顶部日期切换全平台真实联动） */
  datePresets: [
    { date: '2026-11-25', label: '最新一期', progressDelta: 0.0, qualityDelta: 0.0, safetyDelta: 0.0 },
    { date: '2026-11-20', label: '11月下旬初', progressDelta: -1.4, qualityDelta: -0.1, safetyDelta: -0.2 },
    { date: '2026-10-31', label: '10月末归档', progressDelta: -4.8, qualityDelta: -0.3, safetyDelta: -0.5 },
    { date: '2026-09-25', label: '三季度末', progressDelta: -9.6, qualityDelta: -0.6, safetyDelta: -0.9 }
  ],

  /* 15 个业务插件模块按需懒加载清单（首屏零阻塞） */
  moduleScripts: {
    progress:  'js/modules/m02_progress.js',
    quality:   'js/modules/m03_quality.js',
    safety:    'js/modules/m04_safety.js',
    staff:     'js/modules/m05_staff.js',
    machine:   'js/modules/m06_machine.js',
    material:  'js/modules/m07_material.js',
    measure:   'js/modules/m08_measure.js',
    uav:       'js/modules/m09_uav.js',
    video:     'js/modules/m10_video.js',
    speed:     'js/modules/m11_speed.js',
    pingan:    'js/modules/m12_pingan.js',
    publish:   'js/modules/m13_publish.js',
    blacksoil: 'js/modules/m14_blacksoil.js',
    system:    'js/modules/m15_system.js',
    ai:        'js/modules/m16_ai.js'
  },

  /* 全量 16 模块 / 64 页静态导航目录（用于 Ctrl+K 毫秒检索与 64 页自动巡检） */
  pageCatalog: [
    { mod: 'home', modName: '综合首页', sub: 'overview', name: '项目总览' },
    { mod: 'home', modName: '综合首页', sub: 'roaming', name: '数字漫游' },
    { mod: 'home', modName: '综合首页', sub: 'milestone', name: '建设里程碑' },
    { mod: 'home', modName: '综合首页', sub: 'showcase', name: '专题展示' },

    { mod: 'progress', modName: '进度管理', sub: 'overview', name: '进度总览' },
    { mod: 'progress', modName: '进度管理', sub: 'report', name: '进度报表' },
    { mod: 'progress', modName: '进度管理', sub: 'plan', name: '计划与节点' },
    { mod: 'progress', modName: '进度管理', sub: 'bim_a', name: 'BIM进度模拟(方案A)' },
    { mod: 'progress', modName: '进度管理', sub: 'bim_b', name: 'BIM进度模拟(方案B)' },

    { mod: 'quality', modName: '质量管理', sub: 'overview', name: '质量总览' },
    { mod: 'quality', modName: '质量管理', sub: 'lab', name: '实验室' },
    { mod: 'quality', modName: '质量管理', sub: 'mixing', name: '拌合站' },
    { mod: 'quality', modName: '质量管理', sub: 'pavement', name: '路面质量' },
    { mod: 'quality', modName: '质量管理', sub: 'beamYard', name: '智慧梁场' },
    { mod: 'quality', modName: '质量管理', sub: 'issues', name: '质量问题与整改' },

    { mod: 'safety', modName: '安全管理', sub: 'overview', name: '安全总览' },
    { mod: 'safety', modName: '安全管理', sub: 'risk', name: '风险点位' },
    { mod: 'safety', modName: '安全管理', sub: 'ai_alert', name: '视频AI预警' },
    { mod: 'safety', modName: '安全管理', sub: 'ledger', name: '隐患台账' },
    { mod: 'safety', modName: '安全管理', sub: 'review', name: '整改复查' },

    { mod: 'staff', modName: '人员管理', sub: 'org', name: '组织与人员' },
    { mod: 'staff', modName: '人员管理', sub: 'attendance', name: '岗位与考勤' },

    { mod: 'machine', modName: '机械管理', sub: 'equipment', name: '机械设备' },
    { mod: 'machine', modName: '机械管理', sub: 'keyArchive', name: '重点机械档案' },

    { mod: 'material', modName: '全周期备料管理', sub: 'overview', name: '备料总览' },
    { mod: 'material', modName: '全周期备料管理', sub: 'report', name: '报表管理' },
    { mod: 'material', modName: '全周期备料管理', sub: 'yard', name: '料场详情' },
    { mod: 'material', modName: '全周期备料管理', sub: 'inspect', name: '检验与现场关联' },

    { mod: 'measure', modName: '计量管理', sub: 'overview', name: '计量总览' },
    { mod: 'measure', modName: '计量管理', sub: 'sectionStats', name: '分工区统计' },
    { mod: 'measure', modName: '计量管理', sub: 'physicalCompare', name: '实物进度对照' },
    { mod: 'measure', modName: '计量管理', sub: 'rawRecords', name: '原始记录' },

    { mod: 'uav', modName: '无人机巡检', sub: 'overview', name: '巡检总览' },
    { mod: 'uav', modName: '无人机巡检', sub: 'tasks', name: '巡检任务' },
    { mod: 'uav', modName: '无人机巡检', sub: 'routes', name: '航线规划' },
    { mod: 'uav', modName: '无人机巡检', sub: 'live', name: '实时巡检' },
    { mod: 'uav', modName: '无人机巡检', sub: 'hazards', name: '隐患识别' },
    { mod: 'uav', modName: '无人机巡检', sub: 'reports', name: '巡检报告' },

    { mod: 'video', modName: '视频监控', sub: 'directory', name: '设备目录' },
    { mod: 'video', modName: '视频监控', sub: 'patrol', name: '视频巡查' },
    { mod: 'video', modName: '视频监控', sub: 'playback', name: '历史录像' },
    { mod: 'video', modName: '视频监控', sub: 'airground', name: '空地联动' },

    { mod: 'speed', modName: '智慧提速', sub: 'traffic', name: '交通运行' },
    { mod: 'speed', modName: '智慧提速', sub: 'algorithm', name: '算法研判' },
    { mod: 'speed', modName: '智慧提速', sub: 'strategy', name: '速度策略' },
    { mod: 'speed', modName: '智慧提速', sub: 'feedback', name: '执行反馈' },
    { mod: 'speed', modName: '智慧提速', sub: 'replay', name: '场景回放' },

    { mod: 'pingan', modName: '平安工地', sub: 'showcase', name: '项目展示' },
    { mod: 'pingan', modName: '平安工地', sub: 'topics', name: '专题管理' },

    { mod: 'publish', modName: '信息发布', sub: 'overview', name: '情报板总览' },
    { mod: 'publish', modName: '信息发布', sub: 'templates', name: '内容模板' },
    { mod: 'publish', modName: '信息发布', sub: 'review', name: '审核发布' },
    { mod: 'publish', modName: '信息发布', sub: 'plans', name: '联动预案' },
    { mod: 'publish', modName: '信息发布', sub: 'receipts', name: '回执记录' },

    { mod: 'blacksoil', modName: '黑土地保护', sub: 'compare', name: '遥感影像对比' },

    { mod: 'system', modName: '系统管理', sub: 'base', name: '基础资料' },
    { mod: 'system', modName: '系统管理', sub: 'rbac', name: '用户权限' },
    { mod: 'system', modName: '系统管理', sub: 'integration', name: '系统接入' },
    { mod: 'system', modName: '系统管理', sub: 'metrics', name: '指标口径' },
    { mod: 'system', modName: '系统管理', sub: 'content', name: '内容配置' },
    { mod: 'system', modName: '系统管理', sub: 'logs', name: '日志档案' },

    { mod: 'ai', modName: 'AI助手', sub: 'exhibition', name: '展厅讲解' },
    { mod: 'ai', modName: 'AI助手', sub: 'analysis', name: '管理研判' },
    { mod: 'ai', modName: 'AI助手', sub: 'field', name: '一线办理' }
  ]
};
