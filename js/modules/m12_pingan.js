/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   Module 12: 平安工地 (m12_pingan.js)
   2 Subpages: 项目展示 (showcase) | 专题管理 (topics)
   ========================================================================== */
(function () {
  'use strict';

  const ASSET_BASE = window.JIHEI_ASSET_BASE || 'assets/';
  const IMG = {
    corridor: ASSET_BASE + 'corridor_aerial.jpg',
    milestoneBefore: ASSET_BASE + 'milestone_before.jpg',
    milestoneAfter: ASSET_BASE + 'milestone_after.jpg',
    showcase: ASSET_BASE + 'showcase_viaduct.jpg'
  };

  const STAGE_LIST = ['立项', '计划与设计', '研究执行', '成果整理', '验收与推广'];
  const DIRECTION_LIST = ['品质提升', '工业化建造', '智慧提速', '绿色低碳'];

  const STAGE_META = {
    '立项': { index: 0, tagClass: 'm12-tag-slate', color: '#38f2ff', kpiIcon: 'flag' },
    '计划与设计': { index: 1, tagClass: 'm12-tag-cyan', color: '#38f2ff', kpiIcon: 'layers' },
    '研究执行': { index: 2, tagClass: 'm12-tag-amber', color: '#facc15', kpiIcon: 'clock' },
    '成果整理': { index: 3, tagClass: 'm12-tag-green', color: '#4ade80', kpiIcon: 'doc' },
    '验收与推广': { index: 4, tagClass: 'm12-tag-teal', color: '#38f2ff', kpiIcon: 'checkCircle' }
  };

  const SVG = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    refresh: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>`,
    plus: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
    playOutline: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    playFill: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><polygon points="7 4 20 12 7 20 7 4"/></svg>`,
    pauseFill: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    chevronLeft: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="15 18 9 12 15 6"/></svg>`,
    chevronRight: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="9 18 15 12 9 6"/></svg>`,
    doc: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="4" y="3" width="16" height="18" rx="2"/><line x1="8" y1="8" x2="16" y2="8"/><line x1="8" y1="12" x2="16" y2="12"/><line x1="8" y1="16" x2="13" y2="16"/></svg>`,
    clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2"/><line x1="9" y1="10" x2="15" y2="10"/><line x1="9" y1="14" x2="15" y2="14"/></svg>`,
    flag: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    clock: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    checkCircle: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    saveCheck: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><path d="M8.5 12.5l2.5 2.5 4.8-5"/></svg>`,
    volume: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.5 8.5a5 5 0 010 7"/></svg>`,
    mute: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="22" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="22" y2="15"/></svg>`
  };

  /* ------------------------------------------------------------------------
     PERSISTENT MODULE STORE
     ------------------------------------------------------------------------ */
  const store = {
    lastUpdated: '2026-11-25 10:45',
    projectOverview: {
      title: '吉黑高速明水至北安段',
      desc: '项目按双向四车道高速公路标准建设。平安百年品质工程创建聚焦寒区改扩建品质提升、工业化建造、智慧提速和绿色低碳。',
      stats: [
        { label: '路线全长', value: '142.608', unit: 'km' },
        { label: '建设里程', value: '120.528', unit: 'km' },
        { label: '施工工区', value: '6', unit: '个' }
      ],
      featuredResults: [
        {
          id: 'res-1',
          title: '组合结构计算模型',
          topicLabel: '盖梁拓宽课题',
          topicId: 'KT-04',
          category: 'midterm',
          date: '2026-11-18',
          author: '桥梁结构攻关组',
          summary: '基于既有混凝土盖梁与外包钢悬臂组合节点建立三维实体-壳耦合有限元模型，完成冻融循环及重载车流组合下的应力与裂缝验算。',
          metrics: ['最大应力比 0.68', '悬臂端挠度 L/920', '极限荷载安全系数 2.15']
        },
        {
          id: 'res-2',
          title: '盖梁拓宽施工工法草案',
          topicLabel: '盖梁拓宽课题',
          topicId: 'KT-04',
          category: 'patent',
          date: '2026-11-21',
          author: '二工区技术质量部',
          summary: '梳理「既有盖梁表面精铣凿毛—钢悬臂模块吊装—高强螺栓分级施拧—微膨胀混凝土浇筑」标准作业流程与冬施温控要求。',
          metrics: ['单座盖梁工期缩短 35%', '吊装定位精度 ±2.0mm', '支撑发明专利申请 2 项']
        },
        {
          id: 'res-3',
          title: '梁场工序信息采集表',
          topicLabel: '标准化预制课题',
          topicId: 'KT-05',
          category: 'midterm',
          date: '2026-11-23',
          author: '智慧梁场信息化组',
          summary: '覆盖钢筋绑扎、模板拼装、混凝土振捣、蒸汽养生、智能张拉与压浆 5 大核心工序的二维码电子采集与预警联动表单。',
          metrics: ['关键工序覆盖 100%', '台座周转效率 +18%', '累计采集记录 42 份']
        }
      ]
    },
    mediaSlides: [
      {
        id: 'slide-1',
        kind: 'image',
        title: '盖梁拓宽施工图例',
        subtitle: '寒区钢悬臂拓宽混凝土盖梁',
        topicId: 'KT-04',
        imgKey: 'showcase',
        stake: 'K34+280 · 二工区桥梁施工点',
        durationSec: 195,
        durationStr: '03:15',
        telemetry: [
          { label: '钢悬臂型号', value: 'Q355qD 模块化' },
          { label: '螺栓扭矩合格', value: '100%' },
          { label: '悬臂挠度实测', value: '1.8 mm' }
        ],
        caption: '依托装配式钢悬臂托架与高强剪力键协同传力，实现寒区既有盖梁不中断桥下通道的快速安全拓宽。'
      },
      {
        id: 'slide-2',
        kind: 'video',
        title: '梁场生产专题视频',
        subtitle: '信息化梁场标准化预制生产',
        topicId: 'KT-05',
        imgKey: 'corridor',
        stake: 'K35+120 · 二工区智慧梁场',
        durationSec: 260,
        durationStr: '04:20',
        telemetry: [
          { label: '智能张拉合格率', value: '99.6%' },
          { label: '蒸养棚温差控制', value: '≤ 2.5℃' },
          { label: '日均预制产能', value: '4.2 片' }
        ],
        caption: '打通钢筋加工、数控张拉、自动压浆与智能喷淋养生工序数据链，实现预制箱梁全生命周期质量可追溯。'
      },
      {
        id: 'slide-3',
        kind: 'image',
        title: '路基现场试验图例',
        subtitle: '寒区路基压实监测与反馈控制',
        topicId: 'KT-01',
        imgKey: 'milestoneAfter',
        stake: 'K18+400 · 一工区试验段',
        durationSec: 170,
        durationStr: '02:50',
        telemetry: [
          { label: '压实度实测值', value: '97.6%' },
          { label: '压电骨料传感', value: '16 处在线' },
          { label: '碾压遍数偏差', value: '0 漏压' }
        ],
        caption: '在填筑层布设压电智能骨料与北斗碾压轨迹定位模块，动态反馈松铺厚度与压实刚度分布。'
      }
    ],
    topics: [
      {
        id: 'KT-01',
        shortName: '寒区路基压实监测与反馈控制',
        fullName: '寒区路基压实监测与反馈控制',
        intro: '应用压电智能骨料开展路基压实监测与反馈控制研究。',
        direction: '品质提升',
        stage: '研究执行',
        results: '监测方案、现场试验记录',
        remark: '完善试验数据',
        sectionId: 'sec1',
        deliverables: {
          midterm: [
            { title: '压电智能骨料压实监测中期评估报告.pdf', type: '中期评审资料', date: '2026-10-28', size: '4.6 MB', summary: '包含一工区 K18+400 试验段 3 层填筑压实度连续采集与频谱标定成果。' }
          ],
          patent: [],
          acceptance: []
        }
      },
      {
        id: 'KT-02',
        shortName: '窄拼宽路基差异沉降与冻胀防控',
        fullName: '窄拼宽路基差异沉降与冻胀防控',
        intro: '研究旧路单侧窄幅拼宽的差异沉降与冻胀防控。',
        direction: '品质提升',
        stage: '研究执行',
        results: '监测布点图、阶段记录',
        remark: '补充观测数据',
        sectionId: 'sec2',
        deliverables: {
          midterm: [
            { title: '单侧窄幅拼宽路基差异沉降观测阶段报告.pdf', type: '中期评审资料', date: '2026-11-04', size: '5.1 MB', summary: '汇总新旧路基结合部台阶开挖、土工格栅加筋及冻融期沉降观测曲线。' }
          ],
          patent: [],
          acceptance: []
        }
      },
      {
        id: 'KT-03',
        shortName: '寒区路基边坡改性土稳定性',
        fullName: '寒区路基边坡改性土稳定性',
        intro: '开展疏水-EICP复合改性及边坡稳定性试验。',
        direction: '绿色低碳',
        stage: '计划与设计',
        results: '材料筛选与试验计划',
        remark: '待完成配比试验',
        sectionId: 'sec3',
        deliverables: {
          midterm: [],
          patent: [],
          acceptance: []
        }
      },
      {
        id: 'KT-04',
        shortName: '寒区钢悬臂拓宽混凝土盖梁',
        fullName: '寒区钢悬臂拓宽混凝土盖梁组合结构设计和施工技术研究',
        intro: '研究既有混凝土盖梁的钢悬臂拓宽组合结构，总结模块化预制及施工控制要点。',
        direction: '品质提升',
        stage: '成果整理',
        results: '组合结构计算模型、施工工法草案',
        remark: '整理阶段成果，准备内部评审',
        sectionId: 'sec2',
        deliverables: {
          midterm: [
            { title: '寒区钢悬臂拓宽混凝土盖梁组合结构计算模型与中期评审报告.pdf', type: '中期评审资料', date: '2026-11-18', size: '7.8 MB', summary: '完成钢-混结合段剪力键群抗滑移计算、寒区低温焊缝韧性校核与实体试验对比分析。' }
          ],
          patent: [
            { title: '一种寒区既有用混凝土盖梁装配式钢悬臂拓宽节点（发明专利受理）.pdf', type: '发明专利', date: '2026-11-10', size: '2.4 MB', summary: '专利申请号 CN202611084521.X，实现无大型支架条件下的快速安全拼宽。' },
            { title: '寒区钢悬臂拓宽盖梁模块化预制与施工工法草案.pdf', type: '施工工法/标准', date: '2026-11-21', size: '3.9 MB', summary: '明确植筋锚固质量验收、高强螺栓终拧扭矩及低温防裂养护控制指标。' }
          ],
          acceptance: []
        }
      },
      {
        id: 'KT-05',
        shortName: '信息化梁场标准化预制生产',
        fullName: '信息化梁场标准化预制生产',
        intro: '研究梁片预制分工序管控与生产信息归集。',
        direction: '工业化建造',
        stage: '研究执行',
        results: '工序信息采集表、试运行记录',
        remark: '持续采集工序数据',
        sectionId: 'sec2',
        deliverables: {
          midterm: [
            { title: '智慧梁场分工序数字化管控中期评审汇报.pdf', type: '中期评审资料', date: '2026-11-15', size: '6.2 MB', summary: '展示全自动张拉压浆与二维码梁片身份码在二工区梁场的试运行成效。' }
          ],
          patent: [],
          acceptance: []
        }
      },
      {
        id: 'KT-06',
        shortName: '保通期交通组织智能动态限速',
        fullName: '保通期交通组织智能动态限速',
        intro: '面向施工保通瓶颈路段开展动态限速与交通组织研究。',
        direction: '智慧提速',
        stage: '研究执行',
        results: '仿真模型、场景测试记录',
        remark: '补充交通调查',
        sectionId: 'sec4',
        deliverables: {
          midterm: [
            { title: '施工保通瓶颈路段动态限速仿真中期报告.pdf', type: '中期评审资料', date: '2026-11-12', size: '4.3 MB', summary: '结合气象能见度与作业区占用车道数，验证多级情报板协同诱导降速效果。' }
          ],
          patent: [
            { title: '《寒区改扩建保通期智能动态限速控制指南》企业标准草案.pdf', type: '标准规范', date: '2026-11-19', size: '2.9 MB', summary: '形成冰雪路面与施工区耦合场景下的分段限速阈值推荐表。' }
          ],
          acceptance: []
        }
      },
      {
        id: 'KT-07',
        shortName: '沥青热拌站回收粉再生利用',
        fullName: '沥青热拌站回收粉再生利用',
        intro: '研究拌合站回收粉的再生利用与材料性能。',
        direction: '绿色低碳',
        stage: '立项',
        results: '立项材料',
        remark: '待启动材料试验',
        sectionId: 'sec5',
        deliverables: {
          midterm: [],
          patent: [],
          acceptance: []
        }
      },
      {
        id: 'KT-08',
        shortName: '农田友好型排水优化',
        fullName: '农田友好型排水优化',
        intro: '分析沿线农田径流路径与排水条件，优化引排设计。',
        direction: '绿色低碳',
        stage: '计划与设计',
        results: '现状调查、研究方案',
        remark: '完善方案设计',
        sectionId: 'sec6',
        deliverables: {
          midterm: [],
          patent: [],
          acceptance: []
        }
      }
    ]
  };

  /* ------------------------------------------------------------------------
     UI & TRANSIENT STATE
     ------------------------------------------------------------------------ */
  const ui = {
    showcase: {
      direction: '全部方向',
      stage: '全部阶段',
      slideIdx: 0,
      selectedTopicId: 'KT-04',
      showSvgOverlay: true
    },
    topics: {
      keyword: '',
      direction: '全部方向',
      stage: '全部阶段',
      selectedId: 'KT-04',
      page: 1,
      pageSize: 10
    },
    videoModal: {
      rafId: null,
      playing: true,
      chapterIdx: 1,
      elapsedSec: 28,
      speed: 1,
      muted: false,
      lastTickMs: 0
    }
  };

  let lastHostEl = null;
  let lastCtx = null;
  let currentSubPage = 'showcase';
  const imgCache = {};

  function getCachedImage(imgKey) {
    const src = IMG[imgKey] || IMG.showcase;
    if (!imgCache[src]) {
      const im = new Image();
      im.src = src;
      imgCache[src] = im;
    }
    return imgCache[src];
  }

  function esc(val) {
    return String(val == null ? '' : val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function fmtTime(sec) {
    const s = Math.max(0, Math.floor(sec));
    const mm = String(Math.floor(s / 60)).padStart(2, '0');
    const ss = String(s % 60).padStart(2, '0');
    return `${mm}:${ss}`;
  }

  function nowStamp() {
    const d = new Date();
    const pad = n => String(n).padStart(2, '0');
    return `2026-11-26 ${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }

  function getFilteredShowcaseTopics() {
    return store.topics.filter(t => {
      if (ui.showcase.direction !== '全部方向' && t.direction !== ui.showcase.direction) return false;
      if (ui.showcase.stage !== '全部阶段' && t.stage !== ui.showcase.stage) return false;
      return true;
    });
  }

  function getFilteredTopicsList() {
    const kw = ui.topics.keyword.trim().toLowerCase();
    return store.topics.filter(t => {
      if (kw) {
        const hay = `${t.id} ${t.shortName} ${t.fullName} ${t.intro} ${t.results}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      if (ui.topics.direction !== '全部方向' && t.direction !== ui.topics.direction) return false;
      if (ui.topics.stage !== '全部阶段' && t.stage !== ui.topics.stage) return false;
      return true;
    });
  }

  function computeStageCounts() {
    const counts = { total: store.topics.length };
    STAGE_LIST.forEach(s => { counts[s] = 0; });
    store.topics.forEach(t => {
      if (Object.prototype.hasOwnProperty.call(counts, t.stage)) counts[t.stage] += 1;
    });
    return counts;
  }

  function getNextTopicId() {
    let maxN = 8;
    store.topics.forEach(t => {
      const m = /^KT-(\d+)$/i.exec(t.id);
      if (m) maxN = Math.max(maxN, parseInt(m[1], 10));
    });
    return `KT-${String(maxN + 1).padStart(2, '0')}`;
  }

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (.m12-* ONLY)
     ------------------------------------------------------------------------ */
  function injectStyles() {
    if (document.getElementById('m12-styles')) return;
    const style = document.createElement('style');
    style.id = 'm12-styles';
    style.textContent = `
      .m12-page {
        width: 100%;
        min-height: 100%;
        padding: 12px 16px 100px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        color: var(--text-main);
        box-sizing: border-box;
      }
      .m12-page * { box-sizing: border-box; }

      /* Top Filter Bar */
      .m12-filter-bar {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
        padding: 8px 14px;
        border-radius: 10px;
        background: rgba(8, 28, 64, 0.84);
        border: 1px solid rgba(56, 189, 248, 0.34);
        backdrop-filter: blur(12px);
        box-shadow: var(--shadow-panel);
        flex-wrap: wrap;
      }
      .m12-filter-group {
        display: flex;
        align-items: center;
        gap: 14px;
        flex-wrap: wrap;
      }
      .m12-filter-item {
        display: inline-flex;
        align-items: center;
        gap: 8px;
      }
      .m12-filter-item label {
        font-size: 12.5px;
        color: #cfe4ff;
        white-space: nowrap;
      }
      .m12-select, .m12-input, .m12-textarea {
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(10, 36, 82, 0.86);
        color: #f1f7ff;
        font-size: 12.5px;
        font-family: inherit;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m12-select, .m12-input {
        height: 31px;
        padding: 0 10px;
      }
      .m12-select { min-width: 124px; cursor: pointer; }
      .m12-select option { background: #0a2252; color: #ffffff; }
      .m12-select:focus, .m12-input:focus, .m12-textarea:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.32);
      }
      .m12-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m12-search-wrap svg {
        position: absolute;
        left: 9px;
        color: #789bc4;
        pointer-events: none;
      }
      .m12-search-wrap .m12-input {
        padding-left: 28px;
        width: 196px;
      }
      .m12-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: auto;
      }
      .m12-updated-tag {
        font-size: 12px;
        color: var(--text-muted);
        margin-right: 4px;
        white-space: nowrap;
      }

      /* Buttons */
      .m12-btn {
        height: 31px;
        padding: 0 14px;
        border-radius: 6px;
        font-size: 12.5px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        cursor: pointer;
        border: 1px solid transparent;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m12-btn-primary {
        background: linear-gradient(180deg, #1d8bff, #0c62d9);
        border-color: rgba(56, 220, 255, 0.72);
        color: #ffffff;
        box-shadow: 0 0 12px rgba(22, 119, 255, 0.42);
      }
      .m12-btn-primary:hover {
        background: linear-gradient(180deg, #329bff, #1572ee);
        box-shadow: 0 0 16px rgba(56, 220, 255, 0.55);
      }
      .m12-btn-ghost {
        background: rgba(12, 39, 86, 0.85);
        border-color: rgba(56, 189, 248, 0.42);
        color: #dbeafe;
      }
      .m12-btn-ghost:hover {
        border-color: var(--cyan-bright);
        background: rgba(20, 58, 122, 0.9);
      }
      .m12-btn-add {
        background: rgba(12, 42, 92, 0.88);
        border-color: rgba(56, 220, 255, 0.55);
        color: #e0f2fe;
      }
      .m12-btn-add:hover {
        background: rgba(22, 74, 152, 0.92);
        border-color: var(--cyan-bright);
        box-shadow: 0 0 10px rgba(56, 220, 255, 0.28);
      }

      /* Panel Shell */
      .m12-panel {
        background: var(--bg-panel);
        border: 1px solid var(--border-cyan);
        border-radius: 10px;
        box-shadow: var(--shadow-panel);
        backdrop-filter: blur(12px);
        overflow: hidden;
        display: flex;
        flex-direction: column;
      }
      .m12-panel-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 9px 14px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.22);
        background: rgba(12, 42, 92, 0.48);
        gap: 10px;
      }
      .m12-panel-title-wrap {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m12-panel-sub {
        font-size: 12px;
        color: var(--text-sub);
        margin-left: 4px;
      }
      .m12-head-link {
        background: transparent;
        border: none;
        color: #38bdf8;
        font-size: 12.5px;
        font-weight: 500;
        display: inline-flex;
        align-items: center;
        gap: 5px;
        cursor: pointer;
        padding: 2px 6px;
        border-radius: 5px;
        transition: background 0.16s, color 0.16s;
      }
      .m12-head-link:hover {
        background: rgba(56, 189, 248, 0.14);
        color: var(--cyan-bright);
      }

      /* Page 1: Showcase Top Split */
      .m12-showcase-top {
        display: grid;
        grid-template-columns: minmax(0, 1.12fr) minmax(0, 1fr);
        gap: 12px;
        align-items: stretch;
      }
      .m12-media-grid {
        display: grid;
        grid-template-columns: minmax(0, 1.68fr) minmax(200px, 1fr);
        gap: 12px;
        padding: 12px;
        flex: 1;
        min-height: 278px;
      }
      .m12-stage-card {
        position: relative;
        border-radius: 9px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: #041028;
        min-height: 252px;
        cursor: pointer;
      }
      .m12-stage-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
        transition: transform 0.35s ease;
      }
      .m12-stage-card:hover .m12-stage-img {
        transform: scale(1.02);
      }
      .m12-stage-svg-hud {
        position: absolute;
        inset: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
      }
      .m12-stage-grad {
        position: absolute;
        inset: 0;
        background: linear-gradient(180deg, rgba(4, 15, 36, 0.12) 0%, rgba(4, 15, 36, 0.15) 52%, rgba(3, 12, 28, 0.88) 100%);
        pointer-events: none;
      }
      .m12-stage-play-overlay {
        position: absolute;
        left: 50%;
        top: 46%;
        transform: translate(-50%, -50%);
        width: 52px;
        height: 52px;
        border-radius: 50%;
        background: rgba(8, 30, 68, 0.72);
        border: 1.5px solid rgba(56, 220, 255, 0.82);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        box-shadow: 0 0 18px rgba(34, 211, 238, 0.45);
        transition: transform 0.18s, background 0.18s;
      }
      .m12-stage-play-overlay:hover {
        transform: translate(-50%, -50%) scale(1.08);
        background: rgba(22, 119, 255, 0.85);
      }
      .m12-stage-footer {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        padding: 12px 14px;
        display: flex;
        align-items: flex-end;
        justify-content: space-between;
        gap: 10px;
      }
      .m12-stage-title {
        font-size: 16px;
        font-weight: 700;
        color: #ffffff;
        text-shadow: 0 2px 6px rgba(0, 0, 0, 0.7);
      }
      .m12-stage-sub {
        font-size: 12px;
        color: #cbdcf5;
        margin-top: 2px;
      }
      .m12-carousel-pill {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 3px 6px;
        border-radius: 99px;
        background: rgba(6, 20, 48, 0.84);
        border: 1px solid rgba(56, 189, 248, 0.48);
        backdrop-filter: blur(8px);
        flex-shrink: 0;
      }
      .m12-carousel-btn {
        width: 22px;
        height: 22px;
        border-radius: 50%;
        border: none;
        background: rgba(24, 68, 136, 0.55);
        color: #e0f2fe;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background 0.16s;
      }
      .m12-carousel-btn:hover {
        background: rgba(34, 150, 243, 0.8);
      }
      .m12-carousel-idx {
        font-size: 12px;
        color: #e2e8f0;
        min-width: 34px;
        text-align: center;
        font-variant-numeric: tabular-nums;
      }

      /* Right Thumbnail Switch Cards */
      .m12-thumb-stack {
        display: flex;
        flex-direction: column;
        gap: 9px;
        justify-content: space-between;
      }
      .m12-thumb-card {
        flex: 1;
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 10px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.28);
        background: rgba(11, 36, 80, 0.62);
        cursor: pointer;
        text-align: left;
        transition: all 0.18s ease;
      }
      .m12-thumb-card:hover {
        border-color: rgba(56, 220, 255, 0.65);
        background: rgba(16, 52, 112, 0.72);
      }
      .m12-thumb-card.active {
        border-color: var(--cyan-bright);
        background: rgba(18, 60, 128, 0.82);
        box-shadow: 0 0 14px rgba(56, 220, 255, 0.25), inset 0 0 0 1px rgba(56, 220, 255, 0.28);
      }
      .m12-thumb-pic {
        position: relative;
        width: 82px;
        height: 54px;
        border-radius: 6px;
        overflow: hidden;
        flex-shrink: 0;
        border: 1px solid rgba(56, 189, 248, 0.3);
      }
      .m12-thumb-pic img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        display: block;
      }
      .m12-thumb-play {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: rgba(5, 18, 42, 0.78);
        border: 1px solid rgba(255, 255, 255, 0.72);
        color: #fff;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .m12-thumb-info {
        min-width: 0;
        flex: 1;
      }
      .m12-thumb-title {
        font-size: 13px;
        font-weight: 600;
        color: #f8fafc;
        line-height: 1.3;
      }
      .m12-thumb-sub {
        font-size: 11.5px;
        color: var(--text-sub);
        margin-top: 3px;
        line-height: 1.35;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }

      /* Page 1: Project Overview Right Panel */
      .m12-intro-body {
        padding: 13px 16px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        flex: 1;
      }
      .m12-intro-heading {
        font-size: 17px;
        font-weight: 700;
        color: #ffffff;
        letter-spacing: 0.4px;
      }
      .m12-intro-desc {
        font-size: 12.5px;
        color: #b7d2f0;
        line-height: 1.62;
        margin-top: -4px;
      }
      .m12-intro-stats {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;
      }
      .m12-stat-card {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.3);
      }
      .m12-stat-label {
        font-size: 11.5px;
        color: var(--text-sub);
      }
      .m12-stat-val {
        margin-top: 4px;
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .m12-stat-val strong {
        font-size: 20px;
        font-weight: 700;
        color: var(--cyan-bright);
        font-variant-numeric: tabular-nums;
      }
      .m12-stat-val span {
        font-size: 12px;
        color: var(--text-sub);
      }
      .m12-results-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 2px;
      }
      .m12-results-head h4 {
        margin: 0;
        font-size: 13.5px;
        font-weight: 600;
        color: #f1f7ff;
      }
      .m12-results-head span {
        font-size: 11.5px;
        color: var(--text-muted);
      }
      .m12-results-list {
        display: flex;
        flex-direction: column;
      }
      .m12-result-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 10px;
        padding: 7px 6px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        cursor: pointer;
        border-radius: 5px;
        transition: background 0.15s;
      }
      .m12-result-row:last-child { border-bottom: none; }
      .m12-result-row:hover {
        background: rgba(24, 72, 146, 0.38);
      }
      .m12-result-left {
        display: inline-flex;
        align-items: center;
        gap: 7px;
        color: #e2e8f0;
        font-size: 12.5px;
      }
      .m12-result-left svg { color: #38bdf8; flex-shrink: 0; }
      .m12-result-right {
        font-size: 12px;
        color: var(--text-muted);
        white-space: nowrap;
      }

      /* Matrix Table (Page 1) */
      .m12-legend {
        display: inline-flex;
        align-items: center;
        gap: 14px;
        font-size: 12px;
        color: #cbdcf5;
      }
      .m12-legend-item {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m12-dot-blue {
        width: 9px;
        height: 9px;
        border-radius: 50%;
        background: #2589ff;
        box-shadow: 0 0 8px rgba(37, 137, 255, 0.8);
        display: inline-block;
      }
      .m12-table-wrap {
        width: 100%;
        overflow-x: auto;
      }
      .m12-matrix-table, .m12-topics-table {
        width: 100%;
        border-collapse: collapse;
        font-size: 12.5px;
      }
      .m12-matrix-table th, .m12-topics-table th {
        padding: 9px 12px;
        text-align: center;
        color: #a9c6e8;
        font-weight: 600;
        background: rgba(11, 38, 84, 0.68);
        border-bottom: 1px solid rgba(56, 189, 248, 0.22);
        white-space: nowrap;
      }
      .m12-matrix-table th:first-child,
      .m12-topics-table th {
        text-align: left;
      }
      .m12-matrix-table td {
        padding: 9.5px 12px;
        text-align: center;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        color: #e2e8f0;
        vertical-align: middle;
      }
      .m12-matrix-table td:first-child {
        text-align: left;
        white-space: nowrap;
      }
      .m12-matrix-row, .m12-topic-row {
        cursor: pointer;
        transition: background 0.16s;
      }
      .m12-matrix-row:hover, .m12-topic-row:hover {
        background: rgba(18, 58, 122, 0.38);
      }
      .m12-matrix-row.selected, .m12-topic-row.selected {
        background: rgba(18, 66, 138, 0.54);
        outline: 1px solid rgba(56, 220, 255, 0.78);
        outline-offset: -1px;
      }
      .m12-kt-code {
        display: inline-block;
        min-width: 44px;
        color: #e2e8f0;
        font-weight: 600;
        margin-right: 6px;
        font-variant-numeric: tabular-nums;
      }
      .m12-stage-done {
        color: #2dd4bf;
        font-size: 13.5px;
        font-weight: 700;
      }
      .m12-stage-current {
        display: inline-flex;
        align-items: center;
        justify-content: center;
        padding: 2px 10px;
        border-radius: 5px;
        font-size: 11.5px;
        font-weight: 600;
        color: #e0f2fe;
        background: rgba(16, 102, 198, 0.45);
        border: 1px solid rgba(56, 220, 255, 0.65);
        box-shadow: 0 0 10px rgba(34, 211, 238, 0.22);
      }
      .m12-stage-none {
        color: #6082ab;
      }
      .m12-doc-btn {
        background: transparent;
        border: none;
        color: #38bdf8;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 2px 7px;
        border-radius: 4px;
        transition: background 0.15s, color 0.15s;
      }
      .m12-doc-btn:hover {
        background: rgba(56, 189, 248, 0.18);
        color: var(--cyan-bright);
        text-decoration: underline;
      }

      /* Page 2: KPI Progress Row */
      .m12-kpi-grid {
        display: grid;
        grid-template-columns: repeat(6, minmax(0, 1fr));
        gap: 10px;
        padding: 12px 14px;
      }
      .m12-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 11px 14px;
        border-radius: 9px;
        background: rgba(11, 38, 84, 0.62);
        border: 1px solid rgba(56, 189, 248, 0.28);
        cursor: pointer;
        text-align: left;
        transition: all 0.18s ease;
      }
      .m12-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.65);
        background: rgba(16, 54, 116, 0.74);
      }
      .m12-kpi-card.active {
        border-color: var(--cyan-bright);
        background: rgba(18, 64, 134, 0.86);
        box-shadow: 0 0 14px rgba(56, 220, 255, 0.28);
      }
      .m12-kpi-icon {
        width: 36px;
        height: 36px;
        border-radius: 9px;
        background: rgba(20, 68, 138, 0.55);
        border: 1px solid rgba(56, 189, 248, 0.35);
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }
      .m12-kpi-meta {
        min-width: 0;
      }
      .m12-kpi-label {
        font-size: 12px;
        color: #cbdcf5;
        white-space: nowrap;
      }
      .m12-kpi-num {
        margin-top: 2px;
        display: flex;
        align-items: baseline;
        gap: 4px;
      }
      .m12-kpi-num strong {
        font-size: 21px;
        font-weight: 700;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
      }
      .m12-kpi-num span {
        font-size: 12px;
        color: var(--text-sub);
      }

      /* Page 2: Bottom Split */
      .m12-topics-split {
        display: grid;
        grid-template-columns: minmax(0, 1.85fr) minmax(335px, 1fr);
        gap: 12px;
        align-items: stretch;
      }
      .m12-topics-table td {
        padding: 10px 12px;
        border-bottom: 1px solid rgba(56, 189, 248, 0.14);
        color: #e2e8f0;
        vertical-align: middle;
        line-height: 1.45;
      }
      .m12-stage-pill {
        display: inline-block;
        padding: 2px 10px;
        border-radius: 99px;
        font-size: 11.5px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m12-tag-slate {
        background: rgba(148, 163, 184, 0.16);
        color: #cbd5e1;
        border: 1px solid rgba(148, 163, 184, 0.45);
      }
      .m12-tag-cyan {
        background: rgba(56, 189, 248, 0.16);
        color: #38bdf8;
        border: 1px solid rgba(56, 189, 248, 0.48);
      }
      .m12-tag-amber {
        background: rgba(250, 204, 21, 0.16);
        color: #facc15;
        border: 1px solid rgba(250, 204, 21, 0.48);
      }
      .m12-tag-green {
        background: rgba(34, 197, 94, 0.2);
        color: #4ade80;
        border: 1px solid rgba(74, 222, 128, 0.5);
      }
      .m12-tag-teal {
        background: rgba(45, 212, 191, 0.2);
        color: #2dd4bf;
        border: 1px solid rgba(45, 212, 191, 0.52);
      }
      .m12-edit-link {
        background: transparent;
        border: none;
        color: #38bdf8;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        padding: 3px 6px;
        border-radius: 4px;
        white-space: nowrap;
      }
      .m12-edit-link:hover {
        background: rgba(56, 189, 248, 0.16);
        color: var(--cyan-bright);
      }

      /* Pagination Footer */
      .m12-pager {
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 10px;
        padding: 10px 14px;
        margin-top: auto;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: var(--text-sub);
      }
      .m12-page-btns {
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m12-page-btn {
        min-width: 24px;
        height: 24px;
        padding: 0 6px;
        border-radius: 4px;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: rgba(10, 34, 78, 0.78);
        color: #dbeafe;
        font-size: 12px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .m12-page-btn.active {
        background: #1677ff;
        border-color: #38f2ff;
        color: #fff;
        font-weight: 600;
      }
      .m12-page-btn:disabled {
        opacity: 0.42;
        cursor: not-allowed;
      }

      /* Right Panel: Edit Form */
      .m12-edit-body {
        padding: 12px 14px 14px;
        display: flex;
        flex-direction: column;
        gap: 11px;
        flex: 1;
      }
      .m12-edit-meta {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-bottom: 2px;
      }
      .m12-edit-code {
        font-size: 12.5px;
        color: var(--text-sub);
      }
      .m12-edit-code strong {
        color: var(--cyan-bright);
        margin-left: 6px;
        font-size: 13.5px;
      }
      .m12-field {
        display: flex;
        flex-direction: column;
        gap: 5px;
      }
      .m12-field label {
        font-size: 12px;
        font-weight: 600;
        color: #cfe4ff;
      }
      .m12-field .m12-input,
      .m12-field .m12-select {
        width: 100%;
      }
      .m12-textarea {
        width: 100%;
        padding: 8px 10px;
        min-height: 64px;
        resize: vertical;
        line-height: 1.5;
      }
      .m12-field-row2 {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
      }
      .m12-edit-actions {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 10px;
        margin-top: 4px;
      }
      .m12-edit-actions .m12-btn {
        height: 34px;
        font-size: 13px;
      }
      .m12-edit-foot {
        font-size: 11.5px;
        color: var(--text-muted);
        margin-top: 2px;
      }

      /* Modals (Video Player & Deliverables Preview & Add Topic) */
      .m12-video-wrap {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }
      .m12-video-tabs {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
      }
      .m12-video-tab {
        padding: 5px 11px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.35);
        background: rgba(11, 38, 84, 0.72);
        color: #cbdcf5;
        font-size: 12px;
        cursor: pointer;
      }
      .m12-video-tab.active {
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        border-color: var(--cyan-bright);
        color: #fff;
        font-weight: 600;
      }
      .m12-canvas-box {
        position: relative;
        width: 100%;
        border-radius: 9px;
        overflow: hidden;
        border: 1px solid rgba(56, 220, 255, 0.45);
        background: #030b1c;
      }
      .m12-video-canvas {
        width: 100%;
        height: auto;
        display: block;
      }
      .m12-video-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 8px 12px;
        border-radius: 8px;
        background: rgba(9, 32, 72, 0.85);
        border: 1px solid rgba(56, 189, 248, 0.28);
      }
      .m12-scrubber {
        flex: 1;
        accent-color: #22d3ee;
        cursor: pointer;
      }
      .m12-modal-list {
        display: flex;
        flex-direction: column;
        gap: 8px;
      }
      .m12-modal-doc-card {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(12, 42, 92, 0.56);
        border: 1px solid rgba(56, 189, 248, 0.28);
        display: flex;
        flex-direction: column;
        gap: 4px;
      }
      .m12-empty-cell {
        padding: 26px 12px;
        text-align: center;
        color: var(--text-muted);
      }

      @media (max-width: 1280px) {
        .m12-showcase-top { grid-template-columns: 1fr; }
        .m12-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m12-topics-split { grid-template-columns: 1fr; }
      }
      @media (max-width: 780px) {
        .m12-media-grid { grid-template-columns: 1fr; height: auto; }
        .m12-kpi-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     PURE INLINE SVG HELPERS
     ------------------------------------------------------------------------ */
  function buildStageHudSvg(slide) {
    if (!ui.showcase.showSvgOverlay) return '';
    if (slide.id === 'slide-1') {
      return `
        <svg class="m12-stage-svg-hud" viewBox="0 0 640 340" preserveAspectRatio="none">
          <g stroke="rgba(56, 242, 255, 0.55)" stroke-width="1.2" fill="none">
            <line x1="28" y1="22" x2="72" y2="22"/>
            <line x1="28" y1="22" x2="28" y2="54"/>
            <line x1="612" y1="22" x2="568" y2="22"/>
            <line x1="612" y1="22" x2="612" y2="54"/>
            <path d="M168 148 L215 112 L338 112" stroke-dasharray="4 3"/>
            <circle cx="168" cy="148" r="4.5" fill="#38f2ff"/>
            <path d="M472 152 L426 116 L356 116" stroke-dasharray="4 3"/>
            <circle cx="472" cy="152" r="4.5" fill="#facc15"/>
          </g>
          <g font-family="sans-serif" font-size="11">
            <rect x="215" y="92" width="124" height="22" rx="4" fill="rgba(6,24,58,0.82)" stroke="rgba(56,242,255,0.6)"/>
            <text x="277" y="107" text-anchor="middle" fill="#e0f2fe">钢悬臂挑梁 Q355qD</text>
            <rect x="356" y="96" width="128" height="22" rx="4" fill="rgba(6,24,58,0.82)" stroke="rgba(250,204,21,0.65)"/>
            <text x="420" y="111" text-anchor="middle" fill="#fef08a">挠度实测 1.8 mm</text>
          </g>
        </svg>
      `;
    }
    if (slide.id === 'slide-2') {
      return `
        <svg class="m12-stage-svg-hud" viewBox="0 0 640 340" preserveAspectRatio="none">
          <g font-family="sans-serif" font-size="11">
            <rect x="18" y="16" width="142" height="24" rx="12" fill="rgba(6,24,58,0.82)" stroke="rgba(56,242,255,0.65)"/>
            <circle cx="32" cy="28" r="4" fill="#22c55e"/>
            <text x="44" y="32" fill="#f1f7ff">专题视频 · ${esc(slide.durationStr)}</text>
            <rect x="464" y="16" width="158" height="24" rx="5" fill="rgba(6,24,58,0.82)" stroke="rgba(56,189,248,0.45)"/>
            <text x="543" y="32" text-anchor="middle" fill="#7dd3fc">张拉合格率 99.6%</text>
          </g>
        </svg>
      `;
    }
    return `
      <svg class="m12-stage-svg-hud" viewBox="0 0 640 340" preserveAspectRatio="none">
        <g font-family="sans-serif" font-size="11">
          <rect x="18" y="16" width="158" height="24" rx="5" fill="rgba(6,24,58,0.82)" stroke="rgba(45,212,191,0.65)"/>
          <text x="97" y="32" text-anchor="middle" fill="#99f6e4">压实度在线 97.6%</text>
          <polyline points="455,44 480,34 505,39 532,26 560,31 590,20 618,24" fill="none" stroke="#38f2ff" stroke-width="2"/>
          <circle cx="590" cy="20" r="3.5" fill="#facc15"/>
        </g>
      </svg>
    `;
  }

  function buildTopicProgressSvg(topic) {
    const activeIdx = (STAGE_META[topic.stage] || { index: 0 }).index;
    const width = 620;
    const height = 104;
    const stepX = 118;
    const startX = 68;
    const cy = 38;
    let nodes = '';
    for (let i = 0; i < STAGE_LIST.length; i++) {
      const cx = startX + i * stepX;
      const done = i < activeIdx;
      const curr = i === activeIdx;
      const stroke = done ? '#2dd4bf' : curr ? '#38f2ff' : 'rgba(120, 155, 196, 0.45)';
      const fill = done ? 'rgba(45, 212, 191, 0.22)' : curr ? 'rgba(22, 119, 255, 0.45)' : 'rgba(10, 34, 78, 0.8)';
      if (i < STAGE_LIST.length - 1) {
        const lineColor = i < activeIdx ? '#2dd4bf' : 'rgba(56, 189, 248, 0.28)';
        nodes += `<line x1="${cx + 15}" y1="${cy}" x2="${cx + stepX - 15}" y2="${cy}" stroke="${lineColor}" stroke-width="3" stroke-linecap="round"/>`;
      }
      nodes += `
        <circle cx="${cx}" cy="${cy}" r="14" fill="${fill}" stroke="${stroke}" stroke-width="2"/>
        <text x="${cx}" y="${cy + 4.5}" text-anchor="middle" font-size="12" font-weight="700" fill="${done ? '#4ade80' : curr ? '#ffffff' : '#789bc4'}">${done ? '✓' : (i + 1)}</text>
        <text x="${cx}" y="${cy + 34}" text-anchor="middle" font-size="11.5" font-weight="${curr ? '700' : '500'}" fill="${curr ? '#38f2ff' : '#cbdcf5'}">${esc(STAGE_LIST[i])}</text>
      `;
    }
    return `
      <svg viewBox="0 0 ${width} ${height}" style="width:100%;height:auto;background:rgba(7,25,60,0.65);border:1px solid rgba(56,189,248,0.28);border-radius:8px;">
        ${nodes}
      </svg>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 1 RENDERER: 项目展示 (showcase)
     ------------------------------------------------------------------------ */
  function renderShowcasePage() {
    const slides = store.mediaSlides;
    const safeSlideIdx = ((ui.showcase.slideIdx % slides.length) + slides.length) % slides.length;
    ui.showcase.slideIdx = safeSlideIdx;
    const activeSlide = slides[safeSlideIdx];

    const ov = store.projectOverview;
    const filteredTopics = getFilteredShowcaseTopics();

    const thumbHtml = slides.map((s, idx) => `
      <button type="button" class="m12-thumb-card ${idx === safeSlideIdx ? 'active' : ''}" data-slide-idx="${idx}">
        <div class="m12-thumb-pic">
          <img src="${esc(IMG[s.imgKey])}" alt="${esc(s.title)}">
          ${s.kind === 'video' ? `<span class="m12-thumb-play">${SVG.playFill}</span>` : ''}
        </div>
        <div class="m12-thumb-info">
          <div class="m12-thumb-title">${esc(s.title)}</div>
          <div class="m12-thumb-sub">${esc(s.subtitle)}</div>
        </div>
      </button>
    `).join('');

    const statsHtml = ov.stats.map(st => `
      <div class="m12-stat-card">
        <div class="m12-stat-label">${esc(st.label)}</div>
        <div class="m12-stat-val"><strong>${esc(st.value)}</strong><span>${esc(st.unit)}</span></div>
      </div>
    `).join('');

    const featuredHtml = ov.featuredResults.map(res => `
      <div class="m12-result-row" data-featured-id="${esc(res.id)}">
        <span class="m12-result-left">${SVG.doc}<span>${esc(res.title)}</span></span>
        <span class="m12-result-right">${esc(res.topicLabel)}</span>
      </div>
    `).join('');

    const matrixRowsHtml = filteredTopics.length ? filteredTopics.map(t => {
      const stageIdx = (STAGE_META[t.stage] || { index: 0 }).index;
      const isSelected = t.id === ui.showcase.selectedTopicId;
      const stageCells = STAGE_LIST.map((stageName, i) => {
        if (i < stageIdx) return `<td><span class="m12-stage-done">✓</span></td>`;
        if (i === stageIdx) return `<td><span class="m12-stage-current">进行中</span></td>`;
        return `<td><span class="m12-stage-none">—</span></td>`;
      }).join('');

      const delivCell = (catKey) => {
        const list = (t.deliverables && t.deliverables[catKey]) || [];
        if (!list.length) return `<td><span class="m12-stage-none">—</span></td>`;
        return `<td><button type="button" class="m12-doc-btn" data-doc-topic="${esc(t.id)}" data-doc-cat="${catKey}">${list.length} 份</button></td>`;
      };

      return `
        <tr class="m12-matrix-row ${isSelected ? 'selected' : ''}" data-matrix-topic="${esc(t.id)}">
          <td><span class="m12-kt-code">${esc(t.id)}</span>${esc(t.shortName)}</td>
          ${stageCells}
          ${delivCell('midterm')}
          ${delivCell('patent')}
          ${delivCell('acceptance')}
        </tr>
      `;
    }).join('') : `
      <tr><td colspan="9" class="m12-empty-cell">当前筛选条件下暂无匹配课题，请调整研究方向或推进阶段。</td></tr>
    `;

    return `
      <div class="m12-page">
        <div class="m12-filter-bar">
          <div class="m12-filter-group">
            <div class="m12-filter-item">
              <label for="m12ScDir">研究方向</label>
              <select id="m12ScDir" class="m12-select">
                <option value="全部方向" ${ui.showcase.direction === '全部方向' ? 'selected' : ''}>全部方向</option>
                ${DIRECTION_LIST.map(d => `<option value="${esc(d)}" ${ui.showcase.direction === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
            </div>
            <div class="m12-filter-item">
              <label for="m12ScStage">推进阶段</label>
              <select id="m12ScStage" class="m12-select">
                <option value="全部阶段" ${ui.showcase.stage === '全部阶段' ? 'selected' : ''}>全部阶段</option>
                ${STAGE_LIST.map(s => `<option value="${esc(s)}" ${ui.showcase.stage === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m12-filter-actions">
            <span class="m12-updated-tag">更新于 ${esc(store.lastUpdated)}</span>
            <button type="button" class="m12-btn m12-btn-primary" id="m12ScQueryBtn">${SVG.search}查询</button>
            <button type="button" class="m12-btn m12-btn-ghost" id="m12ScResetBtn">${SVG.refresh}重置</button>
          </div>
        </div>

        <div class="m12-showcase-top">
          <section class="m12-panel">
            <div class="m12-panel-head">
              <div class="m12-panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">成果图片与视频</span>
              </div>
              <button type="button" class="m12-head-link" id="m12PlayVideoBtn">${SVG.playOutline}播放专题视频</button>
            </div>
            <div class="m12-media-grid">
              <div class="m12-stage-card" id="m12MainStageCard" title="点击查看成果详情或播放视频">
                <img class="m12-stage-img" src="${esc(IMG[activeSlide.imgKey])}" alt="${esc(activeSlide.title)}">
                ${buildStageHudSvg(activeSlide)}
                <div class="m12-stage-grad"></div>
                ${activeSlide.kind === 'video' ? `<button type="button" class="m12-stage-play-overlay" id="m12StagePlayCenter" aria-label="播放专题视频">${SVG.playFill}</button>` : ''}
                <div class="m12-stage-footer">
                  <div>
                    <div class="m12-stage-title">${esc(activeSlide.title)}</div>
                    <div class="m12-stage-sub">${esc(activeSlide.subtitle)}</div>
                  </div>
                  <div class="m12-carousel-pill" id="m12CarouselControls">
                    <button type="button" class="m12-carousel-btn" id="m12PrevSlideBtn" aria-label="上一张">${SVG.chevronLeft}</button>
                    <span class="m12-carousel-idx">${safeSlideIdx + 1} / ${slides.length}</span>
                    <button type="button" class="m12-carousel-btn" id="m12NextSlideBtn" aria-label="下一张">${SVG.chevronRight}</button>
                  </div>
                </div>
              </div>
              <div class="m12-thumb-stack">
                ${thumbHtml}
              </div>
            </div>
          </section>

          <section class="m12-panel">
            <div class="m12-panel-head">
              <div class="m12-panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">项目简介</span>
              </div>
            </div>
            <div class="m12-intro-body">
              <div class="m12-intro-heading">${esc(ov.title)}</div>
              <div class="m12-intro-desc">${esc(ov.desc)}</div>
              <div class="m12-intro-stats">${statsHtml}</div>
              <div class="m12-results-head">
                <h4>阶段成果</h4>
                <span>成果示例</span>
              </div>
              <div class="m12-results-list">${featuredHtml}</div>
            </div>
          </section>
        </div>

        <section class="m12-panel">
          <div class="m12-panel-head">
            <div class="m12-panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">课题进度矩阵</span>
            </div>
            <div class="m12-legend">
              <span class="m12-legend-item"><span class="m12-stage-done">✓</span>已完成</span>
              <span class="m12-legend-item"><span class="m12-dot-blue"></span>当前阶段</span>
              <span class="m12-legend-item"><span class="m12-stage-none">—</span>未开始</span>
            </div>
          </div>
          <div class="m12-table-wrap">
            <table class="m12-matrix-table">
              <thead>
                <tr>
                  <th>课题名称</th>
                  <th>立项</th>
                  <th>计划与设计</th>
                  <th>研究执行</th>
                  <th>成果整理</th>
                  <th>验收与推广</th>
                  <th>中期评审资料</th>
                  <th>专利 / 论文 / 标准</th>
                  <th>验收与推广资料</th>
                </tr>
              </thead>
              <tbody>${matrixRowsHtml}</tbody>
            </table>
          </div>
        </section>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     PAGE 2 RENDERER: 专题管理 (topics)
     ------------------------------------------------------------------------ */
  function renderTopicsPage() {
    const counts = computeStageCounts();
    const filtered = getFilteredTopicsList();
    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / ui.topics.pageSize));
    if (ui.topics.page > totalPages) ui.topics.page = totalPages;
    const startIdx = (ui.topics.page - 1) * ui.topics.pageSize;
    const pageRows = filtered.slice(startIdx, startIdx + ui.topics.pageSize);

    let selectedTopic = store.topics.find(t => t.id === ui.topics.selectedId);
    if (!selectedTopic) {
      selectedTopic = filtered[0] || store.topics[0];
      if (selectedTopic) ui.topics.selectedId = selectedTopic.id;
    }

    const kpiCards = [
      { key: '全部阶段', label: '全部课题', count: counts.total, color: '#38f2ff', icon: SVG.clipboard },
      { key: '立项', label: '立项', count: counts['立项'], color: '#38f2ff', icon: SVG.flag },
      { key: '计划与设计', label: '计划与设计', count: counts['计划与设计'], color: '#38f2ff', icon: SVG.layers },
      { key: '研究执行', label: '研究执行', count: counts['研究执行'], color: '#facc15', icon: SVG.clock },
      { key: '成果整理', label: '成果整理', count: counts['成果整理'], color: '#4ade80', icon: SVG.doc },
      { key: '验收与推广', label: '验收与推广', count: counts['验收与推广'], color: '#38f2ff', icon: SVG.checkCircle }
    ];

    const kpiHtml = kpiCards.map(c => {
      const isActive = ui.topics.stage === c.key && c.key !== '全部阶段';
      return `
        <button type="button" class="m12-kpi-card ${isActive ? 'active' : ''}" data-kpi-stage="${esc(c.key)}" title="点击按「${esc(c.label)}」快速筛选">
          <span class="m12-kpi-icon" style="color:${c.color};">${c.icon}</span>
          <span class="m12-kpi-meta">
            <span class="m12-kpi-label">${esc(c.label)}</span>
            <span class="m12-kpi-num"><strong style="color:${c.color};">${c.count}</strong><span>项</span></span>
          </span>
        </button>
      `;
    }).join('');

    const tableRowsHtml = pageRows.length ? pageRows.map(t => {
      const meta = STAGE_META[t.stage] || STAGE_META['立项'];
      const isSelected = selectedTopic && t.id === selectedTopic.id;
      return `
        <tr class="m12-topic-row ${isSelected ? 'selected' : ''}" data-topic-id="${esc(t.id)}">
          <td style="font-weight:500;min-width:155px;">${esc(t.shortName)}</td>
          <td style="color:#cbdcf5;min-width:210px;">${esc(t.intro)}</td>
          <td><span class="m12-stage-pill ${meta.tagClass}">${esc(t.stage)}</span></td>
          <td style="color:#d6e6fa;min-width:155px;">${esc(t.results)}</td>
          <td style="color:#9cb8dc;min-width:118px;">${esc(t.remark)}</td>
          <td><button type="button" class="m12-edit-link" data-edit-topic="${esc(t.id)}">编辑</button></td>
        </tr>
      `;
    }).join('') : `
      <tr><td colspan="6" class="m12-empty-cell">未找到匹配的专题记录，请重置筛选条件或点击“+ 新增专题”。</td></tr>
    `;

    let pageNumsHtml = '';
    for (let p = 1; p <= totalPages; p++) {
      pageNumsHtml += `<button type="button" class="m12-page-btn ${p === ui.topics.page ? 'active' : ''}" data-page-num="${p}">${p}</button>`;
    }

    const selMeta = selectedTopic ? (STAGE_META[selectedTopic.stage] || STAGE_META['立项']) : STAGE_META['立项'];

    return `
      <div class="m12-page">
        <div class="m12-filter-bar">
          <div class="m12-filter-group">
            <div class="m12-filter-item">
              <label for="m12TpKeyword">课题名称</label>
              <div class="m12-search-wrap">
                ${SVG.search}
                <input id="m12TpKeyword" class="m12-input" type="text" placeholder="请输入课题名称" value="${esc(ui.topics.keyword)}">
              </div>
            </div>
            <div class="m12-filter-item">
              <label for="m12TpDir">研究方向</label>
              <select id="m12TpDir" class="m12-select">
                <option value="全部方向" ${ui.topics.direction === '全部方向' ? 'selected' : ''}>全部方向</option>
                ${DIRECTION_LIST.map(d => `<option value="${esc(d)}" ${ui.topics.direction === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
              </select>
            </div>
            <div class="m12-filter-item">
              <label for="m12TpStage">项目进度</label>
              <select id="m12TpStage" class="m12-select">
                <option value="全部阶段" ${ui.topics.stage === '全部阶段' ? 'selected' : ''}>全部阶段</option>
                ${STAGE_LIST.map(s => `<option value="${esc(s)}" ${ui.topics.stage === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m12-filter-actions">
            <button type="button" class="m12-btn m12-btn-primary" id="m12TpQueryBtn">${SVG.search}查询</button>
            <button type="button" class="m12-btn m12-btn-ghost" id="m12TpResetBtn">${SVG.refresh}重置</button>
            <button type="button" class="m12-btn m12-btn-add" id="m12TpAddBtn">${SVG.plus}新增专题</button>
          </div>
        </div>

        <section class="m12-panel">
          <div class="m12-panel-head">
            <div class="m12-panel-title-wrap">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">课题进展</span>
              <span class="m12-panel-sub">(2026年11月)</span>
            </div>
          </div>
          <div class="m12-kpi-grid">${kpiHtml}</div>
        </section>

        <div class="m12-topics-split">
          <section class="m12-panel">
            <div class="m12-panel-head">
              <div class="m12-panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">专题列表</span>
              </div>
            </div>
            <div class="m12-table-wrap">
              <table class="m12-topics-table">
                <thead>
                  <tr>
                    <th>专题名称</th>
                    <th>项目简介</th>
                    <th>项目进度</th>
                    <th>已有成果</th>
                    <th>备注</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>${tableRowsHtml}</tbody>
              </table>
            </div>
            <div class="m12-pager">
              <span>共 ${total} 项课题</span>
              <span>每页 ${ui.topics.pageSize} 项</span>
              <div class="m12-page-btns">
                <button type="button" class="m12-page-btn" id="m12PrevPageBtn" ${ui.topics.page <= 1 ? 'disabled' : ''}>${SVG.chevronLeft}</button>
                ${pageNumsHtml}
                <button type="button" class="m12-page-btn" id="m12NextPageBtn" ${ui.topics.page >= totalPages ? 'disabled' : ''}>${SVG.chevronRight}</button>
              </div>
            </div>
          </section>

          <section class="m12-panel">
            <div class="m12-panel-head">
              <div class="m12-panel-title-wrap">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">编辑专题</span>
              </div>
            </div>
            ${selectedTopic ? `
              <form class="m12-edit-body" id="m12EditForm">
                <div class="m12-edit-meta">
                  <span class="m12-edit-code">课题编号 <strong>${esc(selectedTopic.id)}</strong></span>
                  <span class="m12-stage-pill ${selMeta.tagClass}">${esc(selectedTopic.stage)}</span>
                </div>
                <div class="m12-field">
                  <label for="m12EditName">专题名称</label>
                  <input id="m12EditName" class="m12-input" type="text" value="${esc(selectedTopic.fullName)}" required>
                </div>
                <div class="m12-field">
                  <label for="m12EditIntro">项目简介</label>
                  <textarea id="m12EditIntro" class="m12-textarea" rows="3">${esc(selectedTopic.intro)}</textarea>
                </div>
                <div class="m12-field-row2">
                  <div class="m12-field">
                    <label for="m12EditDir">研究方向</label>
                    <select id="m12EditDir" class="m12-select">
                      ${DIRECTION_LIST.map(d => `<option value="${esc(d)}" ${selectedTopic.direction === d ? 'selected' : ''}>${esc(d)}</option>`).join('')}
                    </select>
                  </div>
                  <div class="m12-field">
                    <label for="m12EditStage">项目进度</label>
                    <select id="m12EditStage" class="m12-select">
                      ${STAGE_LIST.map(s => `<option value="${esc(s)}" ${selectedTopic.stage === s ? 'selected' : ''}>${esc(s)}</option>`).join('')}
                    </select>
                  </div>
                </div>
                <div class="m12-field">
                  <label for="m12EditResults">已有成果</label>
                  <input id="m12EditResults" class="m12-input" type="text" value="${esc(selectedTopic.results)}">
                </div>
                <div class="m12-field">
                  <label for="m12EditRemark">备注</label>
                  <textarea id="m12EditRemark" class="m12-textarea" rows="2">${esc(selectedTopic.remark)}</textarea>
                </div>
                <div class="m12-edit-actions">
                  <button type="submit" class="m12-btn m12-btn-primary">${SVG.saveCheck}保存修改</button>
                  <button type="button" class="m12-btn m12-btn-ghost" id="m12CancelEditBtn">取消</button>
                </div>
                <div class="m12-edit-foot">更新于 ${esc(store.lastUpdated)}</div>
              </form>
            ` : `<div class="m12-empty-cell">请选择左侧列表中的专题进行编辑</div>`}
          </section>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS: CANVAS VIDEO PLAYER, DELIVERABLES PREVIEW, ADD TOPIC
     ------------------------------------------------------------------------ */
  function stopVideoModalLoop() {
    if (ui.videoModal.rafId) {
      cancelAnimationFrame(ui.videoModal.rafId);
      ui.videoModal.rafId = null;
    }
  }

  function openVideoPlayerModal(ctx, initialChapterIdx) {
    stopVideoModalLoop();
    const vm = ui.videoModal;
    vm.chapterIdx = typeof initialChapterIdx === 'number' ? initialChapterIdx : 1;
    vm.playing = true;
    vm.elapsedSec = 18;
    vm.speed = 1;
    vm.lastTickMs = performance.now();

    const slides = store.mediaSlides;
    const ch = slides[vm.chapterIdx] || slides[1];

    const bodyHtml = `
      <div class="m12-video-wrap">
        <div class="m12-video-tabs" id="m12VideoTabs">
          ${slides.map((s, i) => `
            <button type="button" class="m12-video-tab ${i === vm.chapterIdx ? 'active' : ''}" data-vid-ch="${i}">${esc(s.title)}</button>
          `).join('')}
        </div>
        <div class="m12-canvas-box">
          <canvas id="m12VideoCanvas" class="m12-video-canvas" width="700" height="394"></canvas>
        </div>
        <div class="m12-video-controls">
          <button type="button" class="m12-btn m12-btn-primary" id="m12VidPlayBtn" style="min-width:74px;">${SVG.pauseFill}暂停</button>
          <input type="range" id="m12VidScrub" class="m12-scrubber" min="0" max="${ch.durationSec}" value="${vm.elapsedSec}">
          <span id="m12VidTime" style="font-size:12px;color:#cfe4ff;font-variant-numeric:tabular-nums;min-width:86px;text-align:center;">${fmtTime(vm.elapsedSec)} / ${ch.durationStr}</span>
          <button type="button" class="m12-btn m12-btn-ghost" id="m12VidSpeedBtn" style="padding:0 10px;">1.0x</button>
          <button type="button" class="m12-btn m12-btn-ghost" id="m12VidMuteBtn" style="padding:0 10px;">${vm.muted ? SVG.mute : SVG.volume}</button>
        </div>
        <div style="font-size:12.5px;color:#b7d2f0;line-height:1.55;" id="m12VidCaption">${esc(ch.caption)}</div>
      </div>
    `;

    ctx.openModal('平安工地 · 专题成果视频播放', bodyHtml);

    const canvas = document.getElementById('m12VideoCanvas');
    if (!canvas) return;
    const g = canvas.getContext('2d');

    const drawRoundedRect = (ctx2d, x, y, width, height, radius) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx2d.beginPath();
      ctx2d.moveTo(x + r, y);
      ctx2d.arcTo(x + width, y, x + width, y + height, r);
      ctx2d.arcTo(x + width, y + height, x, y + height, r);
      ctx2d.arcTo(x, y + height, x, y, r);
      ctx2d.arcTo(x, y, x + width, y, r);
      ctx2d.closePath();
    };

    const syncControls = () => {
      const s = slides[vm.chapterIdx];
      const playBtn = document.getElementById('m12VidPlayBtn');
      const scrub = document.getElementById('m12VidScrub');
      const timeEl = document.getElementById('m12VidTime');
      const capEl = document.getElementById('m12VidCaption');
      const speedBtn = document.getElementById('m12VidSpeedBtn');
      const muteBtn = document.getElementById('m12VidMuteBtn');
      if (playBtn) playBtn.innerHTML = vm.playing ? `${SVG.pauseFill}暂停` : `${SVG.playFill}播放`;
      if (scrub) {
        scrub.max = s.durationSec;
        scrub.value = Math.floor(vm.elapsedSec);
      }
      if (timeEl) timeEl.textContent = `${fmtTime(vm.elapsedSec)} / ${s.durationStr}`;
      if (capEl) capEl.textContent = s.caption;
      if (speedBtn) speedBtn.textContent = `${vm.speed.toFixed(1)}x`;
      if (muteBtn) muteBtn.innerHTML = vm.muted ? SVG.mute : SVG.volume;
      document.querySelectorAll('#m12VideoTabs .m12-video-tab').forEach((btn, idx) => {
        btn.classList.toggle('active', idx === vm.chapterIdx);
      });
    };

    document.querySelectorAll('#m12VideoTabs .m12-video-tab').forEach(btn => {
      btn.addEventListener('click', () => {
        vm.chapterIdx = Number(btn.dataset.vidCh) || 0;
        vm.elapsedSec = 0;
        vm.playing = true;
        syncControls();
      });
    });
    document.getElementById('m12VidPlayBtn')?.addEventListener('click', () => {
      vm.playing = !vm.playing;
      syncControls();
    });
    document.getElementById('m12VidScrub')?.addEventListener('input', e => {
      vm.elapsedSec = Number(e.target.value) || 0;
      syncControls();
    });
    document.getElementById('m12VidSpeedBtn')?.addEventListener('click', () => {
      const speeds = [1.0, 1.5, 2.0];
      vm.speed = speeds[(speeds.indexOf(vm.speed) + 1) % speeds.length];
      syncControls();
    });
    document.getElementById('m12VidMuteBtn')?.addEventListener('click', () => {
      vm.muted = !vm.muted;
      syncControls();
    });

    const drawFrame = (nowMs) => {
      if (!document.body.contains(canvas)) {
        stopVideoModalLoop();
        return;
      }
      const dt = Math.min(0.1, (nowMs - vm.lastTickMs) / 1000);
      vm.lastTickMs = nowMs;
      const curSlide = slides[vm.chapterIdx] || slides[0];
      if (vm.playing) {
        vm.elapsedSec += dt * vm.speed;
        if (vm.elapsedSec >= curSlide.durationSec) vm.elapsedSec = 0;
        const scrub = document.getElementById('m12VidScrub');
        const timeEl = document.getElementById('m12VidTime');
        if (scrub) scrub.value = Math.floor(vm.elapsedSec);
        if (timeEl) timeEl.textContent = `${fmtTime(vm.elapsedSec)} / ${curSlide.durationStr}`;
      }

      const w = canvas.width;
      const h = canvas.height;
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#041028';
      g.fillRect(0, 0, w, h);

      const im = getCachedImage(curSlide.imgKey);
      const t = vm.elapsedSec;
      const zoom = 1.04 + 0.06 * Math.sin(t * 0.28);
      const panX = Math.sin(t * 0.22) * 16;
      const panY = Math.cos(t * 0.18) * 8;
      if (im.complete && im.naturalWidth > 0) {
        const dw = w * zoom;
        const dh = h * zoom;
        g.drawImage(im, (w - dw) / 2 + panX, (h - dh) / 2 + panY, dw, dh);
      }

      // Dark blue cinematic vignette + grid scan line
      const grad = g.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, 'rgba(4, 15, 36, 0.55)');
      grad.addColorStop(0.5, 'rgba(4, 15, 36, 0.08)');
      grad.addColorStop(1, 'rgba(3, 10, 26, 0.88)');
      g.fillStyle = grad;
      g.fillRect(0, 0, w, h);

      const scanX = ((t * 95) % (w + 120)) - 60;
      const scanGrad = g.createLinearGradient(scanX - 40, 0, scanX + 40, 0);
      scanGrad.addColorStop(0, 'rgba(56, 242, 255, 0)');
      scanGrad.addColorStop(0.5, 'rgba(56, 242, 255, 0.14)');
      scanGrad.addColorStop(1, 'rgba(56, 242, 255, 0)');
      g.fillStyle = scanGrad;
      g.fillRect(0, 0, w, h);

      // Top HUD pill
      g.fillStyle = 'rgba(6, 24, 58, 0.82)';
      g.strokeStyle = 'rgba(56, 220, 255, 0.68)';
      g.lineWidth = 1;
      drawRoundedRect(g, 14, 14, 244, 28, 6);
      g.fill();
      g.stroke();
      g.fillStyle = vm.playing ? '#22c55e' : '#facc15';
      g.beginPath();
      g.arc(28, 28, 4.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f1f7ff';
      g.font = 'bold 12px sans-serif';
      g.fillText(`${curSlide.topicId} · ${curSlide.stake}`, 40, 32);

      // Right live telemetry card
      g.fillStyle = 'rgba(6, 24, 58, 0.82)';
      g.strokeStyle = 'rgba(56, 189, 248, 0.45)';
      drawRoundedRect(g, w - 208, 14, 194, 86, 8);
      g.fill();
      g.stroke();
      g.fillStyle = '#38f2ff';
      g.font = 'bold 11.5px sans-serif';
      g.fillText('实时工程指标监测', w - 196, 33);
      curSlide.telemetry.forEach((m, idx) => {
        const yy = 52 + idx * 18;
        g.fillStyle = '#a9c6e8';
        g.font = '11px sans-serif';
        g.fillText(m.label, w - 196, yy);
        g.fillStyle = '#ffffff';
        g.font = 'bold 11px sans-serif';
        g.fillText(m.value, w - 92, yy);
      });

      // Dynamic waveform strip at bottom-right
      const wx = w - 204;
      const wy = h - 42;
      g.strokeStyle = '#38f2ff';
      g.lineWidth = 1.6;
      g.beginPath();
      for (let i = 0; i <= 44; i++) {
        const px = wx + i * 4.2;
        const py = wy + Math.sin(t * 4 + i * 0.45) * 6 + Math.cos(t * 2.5 + i * 0.25) * 3;
        if (i === 0) g.moveTo(px, py);
        else g.lineTo(px, py);
      }
      g.stroke();

      // Bottom-left title
      g.fillStyle = '#ffffff';
      g.font = 'bold 16px sans-serif';
      g.fillText(curSlide.title, 16, h - 34);
      g.fillStyle = '#cbdcf5';
      g.font = '12px sans-serif';
      g.fillText(curSlide.subtitle, 16, h - 15);

      ui.videoModal.rafId = requestAnimationFrame(drawFrame);
    };

    ui.videoModal.rafId = requestAnimationFrame(drawFrame);
  }

  function openMediaDetailModal(ctx, slideIdx) {
    const slide = store.mediaSlides[slideIdx];
    if (!slide) return;
    const topic = store.topics.find(t => t.id === slide.topicId);
    ctx.openModal(`${slide.title} · 工程现场图例`, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="position:relative;border-radius:9px;overflow:hidden;border:1px solid rgba(56,220,255,0.45);background:#041028;">
          <img src="${esc(IMG[slide.imgKey])}" alt="${esc(slide.title)}" style="width:100%;max-height:320px;object-fit:cover;display:block;">
          ${buildStageHudSvg(slide)}
        </div>
        <div class="detail-grid">
          ${slide.telemetry.map(m => `<div class="detail-stat-card"><span>${esc(m.label)}</span><strong style="font-size:15px;">${esc(m.value)}</strong></div>`).join('')}
        </div>
        <div style="font-size:12.5px;color:#dbeafe;line-height:1.6;">${esc(slide.caption)}</div>
        <div style="display:flex;justify-content:flex-end;gap:10px;flex-wrap:wrap;">
          ${topic ? `<button type="button" class="m12-btn m12-btn-ghost" id="m12MediaJumpTopic">查看课题 ${esc(topic.id)}</button>` : ''}
          <button type="button" class="m12-btn m12-btn-primary" id="m12MediaToVideo">${SVG.playOutline}进入专题视频动态演示</button>
        </div>
      </div>
    `);
    document.getElementById('m12MediaJumpTopic')?.addEventListener('click', () => {
      if (topic) ui.topics.selectedId = topic.id;
      ctx.closeModal();
      ctx.switchModule('pingan', 'topics');
    });
    document.getElementById('m12MediaToVideo')?.addEventListener('click', () => {
      openVideoPlayerModal(ctx, slideIdx);
    });
  }

  function openDeliverablesModal(ctx, topicId, categoryKey) {
    const topic = store.topics.find(t => t.id === topicId);
    if (!topic) return;
    const catLabelMap = {
      midterm: '中期评审资料',
      patent: '专利 / 论文 / 标准',
      acceptance: '验收与推广资料'
    };
    const catLabel = catLabelMap[categoryKey] || '课题阶段资料';
    const docs = (topic.deliverables && topic.deliverables[categoryKey]) || [];

    const docsHtml = docs.length ? docs.map(d => `
      <div class="m12-modal-doc-card">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
          <strong style="color:#f1f7ff;font-size:13px;">${esc(d.title)}</strong>
          <span class="status-tag info">${esc(d.type)}</span>
        </div>
        <div style="font-size:12px;color:#a9c6e8;line-height:1.5;">${esc(d.summary)}</div>
        <div style="font-size:11.5px;color:#789bc4;">归档日期：${esc(d.date)} · 文件大小：${esc(d.size)}</div>
      </div>
    `).join('') : `<div style="color:#9cb8dc;font-size:12.5px;">暂无该类归档文件。</div>`;

    ctx.openModal(`${topic.id} · ${catLabel}`, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;">
          <div>
            <div style="font-size:14px;font-weight:700;color:#fff;">${esc(topic.fullName)}</div>
            <div style="font-size:12px;color:#a9c6e8;margin-top:2px;">研究方向：${esc(topic.direction)} · 当前阶段：${esc(topic.stage)}</div>
          </div>
          <button type="button" class="m12-btn m12-btn-primary" id="m12JumpTopicEditBtn">前往专题管理编辑</button>
        </div>
        ${buildTopicProgressSvg(topic)}
        <div class="m12-modal-list">${docsHtml}</div>
      </div>
    `);

    document.getElementById('m12JumpTopicEditBtn')?.addEventListener('click', () => {
      ui.topics.selectedId = topic.id;
      ctx.closeModal();
      ctx.switchModule('pingan', 'topics');
    });
  }

  function openFeaturedResultModal(ctx, resultId) {
    const res = store.projectOverview.featuredResults.find(r => r.id === resultId);
    if (!res) return;
    const topic = store.topics.find(t => t.id === res.topicId);
    ctx.openModal(`阶段成果详情 · ${res.title}`, `
      <div style="display:flex;flex-direction:column;gap:12px;">
        <div class="detail-grid">
          <div class="detail-stat-card"><span>所属课题</span><strong style="font-size:14px;">${esc(res.topicId)} · ${esc(res.topicLabel)}</strong></div>
          <div class="detail-stat-card"><span>编制单位</span><strong style="font-size:14px;">${esc(res.author)}</strong></div>
          <div class="detail-stat-card"><span>更新日期</span><strong style="font-size:14px;">${esc(res.date)}</strong></div>
        </div>
        <div class="m12-modal-doc-card">
          <strong style="color:#38f2ff;font-size:13px;">成果概要</strong>
          <div style="font-size:12.5px;color:#dbeafe;line-height:1.6;">${esc(res.summary)}</div>
          <div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:6px;">
            ${res.metrics.map(m => `<span class="status-tag ok">${esc(m)}</span>`).join('')}
          </div>
        </div>
        ${topic ? buildTopicProgressSvg(topic) : ''}
        <div style="display:flex;justify-content:flex-end;gap:8px;">
          <button type="button" class="m12-btn m12-btn-primary" id="m12FeaturedJumpBtn">在专题管理中查看课题</button>
        </div>
      </div>
    `);
    document.getElementById('m12FeaturedJumpBtn')?.addEventListener('click', () => {
      if (topic) ui.topics.selectedId = topic.id;
      ctx.closeModal();
      ctx.switchModule('pingan', 'topics');
    });
  }

  function openAddTopicModal(ctx) {
    const nextId = getNextTopicId();
    ctx.openModal('新增平安工地研究专题', `
      <form id="m12AddTopicForm" style="display:flex;flex-direction:column;gap:12px;">
        <div class="m12-field-row2">
          <div class="m12-field">
            <label for="m12NewId">课题编号</label>
            <input id="m12NewId" class="m12-input" type="text" value="${esc(nextId)}" readonly style="opacity:0.85;">
          </div>
          <div class="m12-field">
            <label for="m12NewDir">研究方向</label>
            <select id="m12NewDir" class="m12-select">
              ${DIRECTION_LIST.map(d => `<option value="${esc(d)}">${esc(d)}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="m12-field">
          <label for="m12NewName">专题名称 *</label>
          <input id="m12NewName" class="m12-input" type="text" placeholder="例如：寒区桥梁伸缩缝耐久与防冰除雪技术研究" required>
        </div>
        <div class="m12-field-row2">
          <div class="m12-field">
            <label for="m12NewStage">当前推进阶段</label>
            <select id="m12NewStage" class="m12-select">
              ${STAGE_LIST.map(s => `<option value="${esc(s)}">${esc(s)}</option>`).join('')}
            </select>
          </div>
          <div class="m12-field">
            <label for="m12NewResults">已有成果</label>
            <input id="m12NewResults" class="m12-input" type="text" placeholder="例如：立项申报书、调研报告">
          </div>
        </div>
        <div class="m12-field">
          <label for="m12NewIntro">项目简介 *</label>
          <textarea id="m12NewIntro" class="m12-textarea" rows="3" placeholder="简述课题研究内容、技术路线与预期成果" required></textarea>
        </div>
        <div class="m12-field">
          <label for="m12NewRemark">备注</label>
          <input id="m12NewRemark" class="m12-input" type="text" placeholder="例如：待开展现场踏勘">
        </div>
        <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:4px;">
          <button type="button" class="m12-btn m12-btn-ghost" id="m12NewCancelBtn">取消</button>
          <button type="submit" class="m12-btn m12-btn-primary">${SVG.plus}确认新增</button>
        </div>
      </form>
    `);

    document.getElementById('m12NewCancelBtn')?.addEventListener('click', () => ctx.closeModal());
    document.getElementById('m12AddTopicForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const nameVal = (document.getElementById('m12NewName')?.value || '').trim();
      const introVal = (document.getElementById('m12NewIntro')?.value || '').trim();
      const dirVal = document.getElementById('m12NewDir')?.value || DIRECTION_LIST[0];
      const stageVal = document.getElementById('m12NewStage')?.value || STAGE_LIST[0];
      const resultsVal = (document.getElementById('m12NewResults')?.value || '').trim() || '立项材料';
      const remarkVal = (document.getElementById('m12NewRemark')?.value || '').trim() || '按计划推进';
      if (!nameVal || !introVal) {
        ctx.showToast('请填写专题名称和项目简介');
        return;
      }

      const stageIdx = (STAGE_META[stageVal] || { index: 0 }).index;
      const newTopic = {
        id: nextId,
        shortName: nameVal,
        fullName: nameVal,
        intro: introVal,
        direction: dirVal,
        stage: stageVal,
        results: resultsVal,
        remark: remarkVal,
        sectionId: 'sec1',
        deliverables: {
          midterm: stageIdx >= 2 ? [{ title: `${nameVal}中期评审资料.pdf`, type: '中期评审资料', date: '2026-11-26', size: '3.2 MB', summary: introVal }] : [],
          patent: stageIdx >= 3 ? [{ title: `${nameVal}技术标准草案.pdf`, type: '标准/专利', date: '2026-11-26', size: '2.1 MB', summary: resultsVal }] : [],
          acceptance: stageIdx >= 4 ? [{ title: `${nameVal}验收与推广报告.pdf`, type: '验收推广', date: '2026-11-26', size: '4.5 MB', summary: '完成验收评审并纳入全线推广清单。' }] : []
        }
      };

      store.topics.push(newTopic);
      store.lastUpdated = nowStamp();
      ui.topics.selectedId = newTopic.id;
      ui.topics.keyword = '';
      ui.topics.direction = '全部方向';
      ui.topics.stage = '全部阶段';
      ui.topics.page = Math.ceil(store.topics.length / ui.topics.pageSize);
      ctx.closeModal();
      ctx.showToast(`已新增专题 ${newTopic.id}：${newTopic.shortName}`);
      rerender();
    });
  }

  /* ------------------------------------------------------------------------
     EVENT BINDING
     ------------------------------------------------------------------------ */
  function bindShowcaseEvents(hostEl, ctx) {
    const dirSel = hostEl.querySelector('#m12ScDir');
    const stageSel = hostEl.querySelector('#m12ScStage');

    dirSel?.addEventListener('change', () => {
      ui.showcase.direction = dirSel.value;
      rerender();
    });
    stageSel?.addEventListener('change', () => {
      ui.showcase.stage = stageSel.value;
      rerender();
    });
    hostEl.querySelector('#m12ScQueryBtn')?.addEventListener('click', () => {
      ui.showcase.direction = dirSel ? dirSel.value : '全部方向';
      ui.showcase.stage = stageSel ? stageSel.value : '全部阶段';
      rerender();
      const cnt = getFilteredShowcaseTopics().length;
      ctx.showToast(`已筛选出 ${cnt} 项平安工地课题`);
    });
    hostEl.querySelector('#m12ScResetBtn')?.addEventListener('click', () => {
      ui.showcase.direction = '全部方向';
      ui.showcase.stage = '全部阶段';
      ui.showcase.selectedTopicId = 'KT-04';
      rerender();
      ctx.showToast('已重置筛选条件');
    });

    hostEl.querySelector('#m12PlayVideoBtn')?.addEventListener('click', () => {
      openVideoPlayerModal(ctx, 1);
    });
    hostEl.querySelector('#m12StagePlayCenter')?.addEventListener('click', e => {
      e.stopPropagation();
      openVideoPlayerModal(ctx, ui.showcase.slideIdx);
    });
    hostEl.querySelector('#m12PrevSlideBtn')?.addEventListener('click', e => {
      e.stopPropagation();
      ui.showcase.slideIdx = (ui.showcase.slideIdx - 1 + store.mediaSlides.length) % store.mediaSlides.length;
      rerender();
    });
    hostEl.querySelector('#m12NextSlideBtn')?.addEventListener('click', e => {
      e.stopPropagation();
      ui.showcase.slideIdx = (ui.showcase.slideIdx + 1) % store.mediaSlides.length;
      rerender();
    });
    hostEl.querySelector('#m12MainStageCard')?.addEventListener('click', e => {
      if (e.target.closest('#m12CarouselControls')) return;
      const slide = store.mediaSlides[ui.showcase.slideIdx];
      if (slide.kind === 'video') {
        openVideoPlayerModal(ctx, ui.showcase.slideIdx);
      } else {
        openMediaDetailModal(ctx, ui.showcase.slideIdx);
      }
    });
    hostEl.querySelectorAll('[data-slide-idx]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.showcase.slideIdx = Number(btn.dataset.slideIdx) || 0;
        const slide = store.mediaSlides[ui.showcase.slideIdx];
        if (slide && slide.topicId) ui.showcase.selectedTopicId = slide.topicId;
        rerender();
      });
    });

    hostEl.querySelectorAll('[data-featured-id]').forEach(row => {
      row.addEventListener('click', () => openFeaturedResultModal(ctx, row.dataset.featuredId));
    });

    hostEl.querySelectorAll('[data-doc-topic]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        openDeliverablesModal(ctx, btn.dataset.docTopic, btn.dataset.docCat);
      });
    });

    hostEl.querySelectorAll('[data-matrix-topic]').forEach(row => {
      row.addEventListener('click', () => {
        const tid = row.dataset.matrixTopic;
        ui.showcase.selectedTopicId = tid;
        ui.topics.selectedId = tid;
        rerender();
      });
      row.addEventListener('dblclick', () => {
        ui.topics.selectedId = row.dataset.matrixTopic;
        ctx.switchModule('pingan', 'topics');
      });
    });
  }

  function bindTopicsEvents(hostEl, ctx) {
    const kwInput = hostEl.querySelector('#m12TpKeyword');
    const dirSel = hostEl.querySelector('#m12TpDir');
    const stageSel = hostEl.querySelector('#m12TpStage');

    const applyFilter = (toastMsg) => {
      ui.topics.keyword = kwInput ? kwInput.value : '';
      ui.topics.direction = dirSel ? dirSel.value : '全部方向';
      ui.topics.stage = stageSel ? stageSel.value : '全部阶段';
      ui.topics.page = 1;
      rerender();
      if (toastMsg) ctx.showToast(toastMsg);
    };

    kwInput?.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        applyFilter();
      }
    });
    dirSel?.addEventListener('change', () => applyFilter());
    stageSel?.addEventListener('change', () => applyFilter());

    hostEl.querySelector('#m12TpQueryBtn')?.addEventListener('click', () => {
      applyFilter(`共查询到 ${getFilteredTopicsList().length} 项专题`);
    });
    hostEl.querySelector('#m12TpResetBtn')?.addEventListener('click', () => {
      ui.topics.keyword = '';
      ui.topics.direction = '全部方向';
      ui.topics.stage = '全部阶段';
      ui.topics.page = 1;
      rerender();
      ctx.showToast('已重置专题筛选条件');
    });
    hostEl.querySelector('#m12TpAddBtn')?.addEventListener('click', () => {
      openAddTopicModal(ctx);
    });

    hostEl.querySelectorAll('[data-kpi-stage]').forEach(card => {
      card.addEventListener('click', () => {
        const st = card.dataset.kpiStage;
        ui.topics.stage = (st !== '全部阶段' && ui.topics.stage === st) ? '全部阶段' : st;
        ui.topics.page = 1;
        rerender();
      });
    });

    hostEl.querySelectorAll('[data-topic-id]').forEach(row => {
      row.addEventListener('click', () => {
        ui.topics.selectedId = row.dataset.topicId;
        rerender();
      });
    });
    hostEl.querySelectorAll('[data-edit-topic]').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        ui.topics.selectedId = btn.dataset.editTopic;
        rerender();
        hostEl.querySelector('#m12EditName')?.focus();
      });
    });

    hostEl.querySelector('#m12PrevPageBtn')?.addEventListener('click', () => {
      if (ui.topics.page > 1) {
        ui.topics.page -= 1;
        rerender();
      }
    });
    hostEl.querySelector('#m12NextPageBtn')?.addEventListener('click', () => {
      const totalPages = Math.max(1, Math.ceil(getFilteredTopicsList().length / ui.topics.pageSize));
      if (ui.topics.page < totalPages) {
        ui.topics.page += 1;
        rerender();
      }
    });
    hostEl.querySelectorAll('[data-page-num]').forEach(btn => {
      btn.addEventListener('click', () => {
        ui.topics.page = Number(btn.dataset.pageNum) || 1;
        rerender();
      });
    });

    hostEl.querySelector('#m12EditForm')?.addEventListener('submit', e => {
      e.preventDefault();
      const topic = store.topics.find(t => t.id === ui.topics.selectedId);
      if (!topic) return;

      const nameVal = (hostEl.querySelector('#m12EditName')?.value || '').trim();
      const introVal = (hostEl.querySelector('#m12EditIntro')?.value || '').trim();
      const dirVal = hostEl.querySelector('#m12EditDir')?.value || topic.direction;
      const stageVal = hostEl.querySelector('#m12EditStage')?.value || topic.stage;
      const resultsVal = (hostEl.querySelector('#m12EditResults')?.value || '').trim();
      const remarkVal = (hostEl.querySelector('#m12EditRemark')?.value || '').trim();

      if (!nameVal) {
        ctx.showToast('专题名称不能为空');
        return;
      }

      if (nameVal !== topic.fullName) {
        topic.fullName = nameVal;
        topic.shortName = nameVal;
      }
      topic.intro = introVal;
      topic.direction = dirVal;
      topic.stage = stageVal;
      topic.results = resultsVal || '—';
      topic.remark = remarkVal || '—';
      store.lastUpdated = nowStamp();

      rerender();
      ctx.showToast(`已保存 ${topic.id} 的专题修改`);
    });

    hostEl.querySelector('#m12CancelEditBtn')?.addEventListener('click', () => {
      rerender();
      ctx.showToast('已还原为当前已保存内容');
    });
  }

  /* ------------------------------------------------------------------------
     LIFECYCLE & REGISTRATION
     ------------------------------------------------------------------------ */
  function rerender() {
    if (!lastHostEl || !lastCtx) return;
    renderPinganModule(lastHostEl, currentSubPage, lastCtx);
  }

  function renderPinganModule(hostEl, subPageId, ctx) {
    injectStyles();
    lastHostEl = hostEl;
    lastCtx = ctx;
    currentSubPage = subPageId || 'showcase';

    // Preserve keyword focus if typing in topics filter
    const activeEl = document.activeElement;
    const keepKwFocus = activeEl && activeEl.id === 'm12TpKeyword';
    const selStart = keepKwFocus ? activeEl.selectionStart : null;

    if (currentSubPage === 'topics') {
      hostEl.innerHTML = renderTopicsPage();
      bindTopicsEvents(hostEl, ctx);
    } else {
      currentSubPage = 'showcase';
      hostEl.innerHTML = renderShowcasePage();
      bindShowcaseEvents(hostEl, ctx);
    }

    if (keepKwFocus) {
      const kwEl = hostEl.querySelector('#m12TpKeyword');
      if (kwEl) {
        kwEl.focus();
        if (selStart != null) kwEl.setSelectionRange(selStart, selStart);
      }
    }
  }

  window.JIHEI_PLATFORM.registerModule({
    id: 'pingan',
    name: '平安工地',
    subPages: [
      { id: 'showcase', name: '项目展示' },
      { id: 'topics', name: '专题管理' }
    ],
    getCesiumMode: () => 'opaque',
    render(hostEl, subPageId, ctx) {
      renderPinganModule(hostEl, subPageId, ctx);
    },
    onSectionChange(secId, subPageId) {
      if (!secId) return;
      const match = store.topics.find(t => t.sectionId === secId);
      if (match) {
        if (subPageId === 'topics') ui.topics.selectedId = match.id;
        else ui.showcase.selectedTopicId = match.id;
        rerender();
      }
    },
    onLeave() {
      stopVideoModalLoop();
      if (lastHostEl) {
        lastHostEl.innerHTML = '';
      }
    }
  });
})();
