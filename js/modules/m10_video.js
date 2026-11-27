/* ==========================================================================
   G1211吉黑高速明水至北安段 工程建设项目综合管理平台
   模块 10：视频监控 (js/modules/m10_video.js)
   包含 4 个子页面：设备目录、视频巡查、历史录像、空地联动
   ========================================================================== */

(function () {
  'use strict';

  const SUB_PAGES = [
    { id: 'directory', name: '设备目录' },
    { id: 'patrol', name: '视频巡查' },
    { id: 'playback', name: '历史录像' },
    { id: 'airground', name: '空地联动' }
  ];

  const SECTIONS = [
    { id: 'sec1', name: '一工区', stake: 'K0+000 ~ K24+500' },
    { id: 'sec2', name: '二工区', stake: 'K24+500 ~ K48+200' },
    { id: 'sec3', name: '三工区', stake: 'K48+200 ~ K72+800' },
    { id: 'sec4', name: '四工区', stake: 'K72+800 ~ K96+000' },
    { id: 'sec5', name: '五工区', stake: 'K96+000 ~ K121+400' },
    { id: 'sec6', name: '六工区', stake: 'K121+400 ~ K146+800' }
  ];

  const SECTION_BY_ID = Object.fromEntries(SECTIONS.map(s => [s.id, s]));
  const SECTION_BY_NAME = Object.fromEntries(SECTIONS.map(s => [s.name, s]));

  const SITE_TYPES = ['料场', '梁场', '保通段', '桥梁', '拌合站', '路基边坡'];
  const PURPOSE_TYPES = ['消防通道巡查', '出入口巡查', '梁场作业巡查', '施工保通', '临边防护巡查', '场内交通巡查', '路基边坡监测'];
  const STATUS_TYPES = ['在线', '图像异常', '离线'];

  /* ------------------------------------------------------------------------
     INLINE SVG ICONS (Zero external dependency)
     ------------------------------------------------------------------------ */
  const ICONS = {
    search: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><circle cx="11" cy="11" r="7"/><line x1="20" y1="20" x2="16.2" y2="16.2"/></svg>`,
    reset: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/></svg>`,
    cam: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2.5" y="6" width="13.5" height="12" rx="2"/><polygon points="16 10 21.5 7 21.5 17 16 14 16 10"/></svg>`,
    camSm: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><rect x="2.5" y="6" width="13.5" height="12" rx="2"/><polygon points="16 10 21.5 7 21.5 17 16 14 16 10"/></svg>`,
    signal: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18v-3"/><path d="M9.5 18v-6"/><path d="M14 18v-9"/><path d="M18.5 18V6"/></svg>`,
    signalOff: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 18v-3"/><path d="M9.5 18v-5"/><path d="M14 18v-3"/><path d="M18.5 18v-1"/><line x1="4" y1="5" x2="20" y2="19"/></svg>`,
    warn: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>`,
    warnSm: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.7" fill="currentColor"/></svg>`,
    layers: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 12 12 17 22 12"/><polyline points="2 17 12 22 22 17"/></svg>`,
    edit: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
    clock: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>`,
    grid1: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>`,
    grid4: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="8" height="8" rx="1"/><rect x="13" y="3" width="8" height="8" rx="1"/><rect x="3" y="13" width="8" height="8" rx="1"/><rect x="13" y="13" width="8" height="8" rx="1"/></svg>`,
    grid9: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="5" height="5" rx="0.8"/><rect x="9.5" y="3" width="5" height="5" rx="0.8"/><rect x="16" y="3" width="5" height="5" rx="0.8"/><rect x="3" y="9.5" width="5" height="5" rx="0.8"/><rect x="9.5" y="9.5" width="5" height="5" rx="0.8"/><rect x="16" y="9.5" width="5" height="5" rx="0.8"/><rect x="3" y="16" width="5" height="5" rx="0.8"/><rect x="9.5" y="16" width="5" height="5" rx="0.8"/><rect x="16" y="16" width="5" height="5" rx="0.8"/></svg>`,
    fullscreen: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>`,
    play: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><polygon points="6 4 20 12 6 20 6 4"/></svg>`,
    pause: `<svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`,
    capture: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    target: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="8"/><line x1="12" y1="2" x2="12" y2="6"/><line x1="12" y1="18" x2="12" y2="22"/><line x1="2" y1="12" x2="6" y2="12"/><line x1="18" y1="12" x2="22" y2="12"/><circle cx="12" cy="12" r="2" fill="currentColor"/></svg>`,
    ext: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/><polyline points="15 3 21 3 21 9"/><line x1="10" y1="14" x2="21" y2="3"/></svg>`,
    link: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>`,
    drone: `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><circle cx="6" cy="6" r="2.5"/><circle cx="18" cy="6" r="2.5"/><circle cx="6" cy="18" r="2.5"/><circle cx="18" cy="18" r="2.5"/><path d="M8 8l8 8M16 8l-8 8"/><rect x="9.5" y="9.5" width="5" height="5" rx="1"/></svg>`,
    save: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>`,
    list: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="4" width="16" height="16" rx="2"/><line x1="8" y1="9" x2="16" y2="9"/><line x1="8" y1="13" x2="16" y2="13"/><line x1="8" y1="17" x2="13" y2="17"/></svg>`,
    pin: `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 21s6-5.6 6-10.5a6 6 0 10-12 0C6 15.4 12 21 12 21z"/><circle cx="12" cy="10.5" r="2.2"/></svg>`
  };

  /* ------------------------------------------------------------------------
     48-CAMERA DATASET (43 在线, 3 离线, 2 图像异常, 6 个工区)
     First 7 rows align 1:1 with 01_设备目录.png
     ------------------------------------------------------------------------ */
  const CAMERAS = [
    // Page 1 (Rows 1–7, exact schematic order)
    { id: 'CAM-YD-A01', sectionId: 'sec2', section: '二工区', name: '料场示例A·消防通道', stake: 'K28+400', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.101' },
    { id: 'CAM-YD-A03', sectionId: 'sec2', section: '二工区', name: '料场示例A·主入口', stake: 'K28+360', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.103' },
    { id: 'CAM-LC-A03', sectionId: 'sec2', section: '二工区', name: '梁场示例A·作业区', stake: 'K29+180', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.108' },
    { id: 'CAM-BT-A01', sectionId: 'sec1', section: '一工区', name: '保通示例段·导改入口', stake: 'K16+720', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.11.101' },
    { id: 'CAM-QL-A02', sectionId: 'sec2', section: '二工区', name: '桥梁示例A·2号墩', stake: 'K26+740', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '图像异常', sceneType: 'bridgePier', lastTime: '2026-11-26 10:42:30', source: '原视频系统', resolution: '1920×1080', ip: '10.12.22.102', faultNote: '视频流编码卡顿，定格于 10:42:30 最后有效帧' },
    { id: 'CAM-YD-B02', sectionId: 'sec4', section: '四工区', name: '料场示例B·运输便道', stake: 'K50+180', location: '场内运输通道', siteType: '料场', purpose: '场内交通巡查', status: '离线', sceneType: 'yardRoad', lastTime: '2026-11-26 08:19:04', source: '原视频系统', resolution: '1920×1080', ip: '10.12.44.102', faultNote: '场内供电箱检修断电，设备离线' },
    { id: 'CAM-BH-A01', sectionId: 'sec4', section: '四工区', name: '拌合站示例A·出入口', stake: 'K51+200', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.46.101' },

    // 一工区 (sec1) remaining 7 (total 8: 7 在线, 1 离线)
    { id: 'CAM-BT-A02', sectionId: 'sec1', section: '一工区', name: '保通示例段·北端分流口', stake: 'K18+050', location: '导改分流区', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.11.102' },
    { id: 'CAM-YD-101', sectionId: 'sec1', section: '一工区', name: '一工区料场·钢筋棚西侧', stake: 'K08+320', location: '钢筋加工棚', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.14.101' },
    { id: 'CAM-YD-102', sectionId: 'sec1', section: '一工区', name: '一工区料场·地磅入口', stake: 'K08+280', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.14.102' },
    { id: 'CAM-QL-101', sectionId: 'sec1', section: '一工区', name: '明水河中桥·0号台', stake: 'K11+640', location: '桥台作业面', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.12.101' },
    { id: 'CAM-LJ-101', sectionId: 'sec1', section: '一工区', name: '一工区路基·K06高填方', stake: 'K06+450', location: '路基边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.15.101' },
    { id: 'CAM-BH-101', sectionId: 'sec1', section: '一工区', name: '一工区水稳站·出料区', stake: 'K14+120', location: '拌合站出料口', siteType: '拌合站', purpose: '场内交通巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.16.101' },
    { id: 'CAM-BT-103', sectionId: 'sec1', section: '一工区', name: '一工区K21·便道平交口', stake: 'K21+300', location: '施工便道口', siteType: '保通段', purpose: '施工保通', status: '离线', sceneType: 'highway', lastTime: '2026-11-26 09:05:40', source: '原视频系统', resolution: '1920×1080', ip: '10.12.11.103', faultNote: '无线网桥信号衰减，等待现场复位' },

    // 二工区 (sec2) remaining 6 (total 10: 9 在线, 1 图像异常)
    { id: 'CAM-YD-A02', sectionId: 'sec2', section: '二工区', name: '料场示例A·骨料区北侧', stake: 'K28+440', location: '骨料料仓', siteType: '料场', purpose: '场内交通巡查', status: '在线', sceneType: 'yardRoad', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.102' },
    { id: 'CAM-LC-A01', sectionId: 'sec2', section: '二工区', name: '梁场示例A·张拉区', stake: 'K29+120', location: '张拉压浆棚', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.106' },
    { id: 'CAM-LC-A02', sectionId: 'sec2', section: '二工区', name: '梁场示例A·存梁台座', stake: 'K29+240', location: '存梁区南侧', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.107' },
    { id: 'CAM-QL-A01', sectionId: 'sec2', section: '二工区', name: '桥梁示例A·1号墩', stake: 'K26+680', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.22.101' },
    { id: 'CAM-BT-201', sectionId: 'sec2', section: '二工区', name: '二工区K34·跨线保通段', stake: 'K34+150', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.21.101' },
    { id: 'CAM-BH-201', sectionId: 'sec2', section: '二工区', name: '二工区拌合站·料仓入口', stake: 'K38+600', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.26.101' },

    // 三工区 (sec3) 8 (7 在线, 1 图像异常)
    { id: 'CAM-LJ-301', sectionId: 'sec3', section: '三工区', name: '路基示例段·K52高边坡', stake: 'K52+400', location: '深挖路堑边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.35.101' },
    { id: 'CAM-LJ-302', sectionId: 'sec3', section: '三工区', name: '三工区路基·K56取土场', stake: 'K56+180', location: '场内运输通道', siteType: '路基边坡', purpose: '场内交通巡查', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.35.102' },
    { id: 'CAM-YD-301', sectionId: 'sec3', section: '三工区', name: '三工区料场·东侧通道', stake: 'K58+900', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.34.101' },
    { id: 'CAM-LC-301', sectionId: 'sec3', section: '三工区', name: '三工区梁场·架桥机通道', stake: 'K61+350', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.34.105' },
    { id: 'CAM-QL-301', sectionId: 'sec3', section: '三工区', name: '通肯河大桥·4号墩', stake: 'K64+210', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '图像异常', sceneType: 'bridgePier', lastTime: '2026-11-26 10:39:18', source: '原视频系统', resolution: '1920×1080', ip: '10.12.32.104', faultNote: '镜头起雾伴随偶发花屏，已触发维护提醒' },
    { id: 'CAM-QL-302', sectionId: 'sec3', section: '三工区', name: '通肯河大桥·5号墩', stake: 'K64+280', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.32.105' },
    { id: 'CAM-BT-301', sectionId: 'sec3', section: '三工区', name: '三工区K68·保通限速点', stake: 'K68+420', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.31.101' },
    { id: 'CAM-BH-301', sectionId: 'sec3', section: '三工区', name: '三工区拌合站·地磅口', stake: 'K70+150', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.36.101' },

    // 四工区 (sec4) remaining 6 (total 8: 7 在线, 1 离线)
    { id: 'CAM-YD-B01', sectionId: 'sec4', section: '四工区', name: '料场示例B·消防通道', stake: 'K75+400', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.44.101' },
    { id: 'CAM-BH-A02', sectionId: 'sec4', section: '四工区', name: '拌合站示例A·料仓棚', stake: 'K51+260', location: '骨料上料区', siteType: '拌合站', purpose: '场内交通巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.46.102' },
    { id: 'CAM-QL-401', sectionId: 'sec4', section: '四工区', name: '四工区分离立交·主墩', stake: 'K82+600', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.42.101' },
    { id: 'CAM-LC-401', sectionId: 'sec4', section: '四工区', name: '四工区梁场·制梁台座', stake: 'K86+120', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.44.108' },
    { id: 'CAM-BT-401', sectionId: 'sec4', section: '四工区', name: '四工区K90·保通导改段', stake: 'K90+380', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.41.101' },
    { id: 'CAM-LJ-401', sectionId: 'sec4', section: '四工区', name: '四工区路基·K94填筑面', stake: 'K94+100', location: '路基填筑区', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.45.101' },

    // 五工区 (sec5) 7 (6 在线, 1 离线)
    { id: 'CAM-YD-501', sectionId: 'sec5', section: '五工区', name: '五工区料场·主通道', stake: 'K101+200', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.54.101' },
    { id: 'CAM-YD-502', sectionId: 'sec5', section: '五工区', name: '五工区料场·北门岗', stake: 'K101+150', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.54.102' },
    { id: 'CAM-QL-501', sectionId: 'sec5', section: '五工区', name: '五工区互通匝道·3号墩', stake: 'K106+800', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.52.103' },
    { id: 'CAM-LC-501', sectionId: 'sec5', section: '五工区', name: '五工区梁场·龙门吊区', stake: 'K110+400', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.54.106' },
    { id: 'CAM-BH-501', sectionId: 'sec5', section: '五工区', name: '五工区水稳站·门岗', stake: 'K113+600', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.56.101' },
    { id: 'CAM-BT-501', sectionId: 'sec5', section: '五工区', name: '五工区K116·跨线导改', stake: 'K116+900', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.51.101' },
    { id: 'CAM-LJ-501', sectionId: 'sec5', section: '五工区', name: '五工区路基·K119边坡', stake: 'K119+300', location: '路基边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '离线', sceneType: 'subgrade', lastTime: '2026-11-26 07:48:11', source: '原视频系统', resolution: '1920×1080', ip: '10.12.55.101', faultNote: '太阳能供电控制器欠压休眠' },

    // 六工区 (sec6) 7 (7 在线)
    { id: 'CAM-BT-601', sectionId: 'sec6', section: '六工区', name: '建华枢纽·南侧保通口', stake: 'K125+400', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.61.101' },
    { id: 'CAM-BT-602', sectionId: 'sec6', section: '六工区', name: '建华枢纽·北安衔接段', stake: 'K144+200', location: '终点衔接段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.61.102' },
    { id: 'CAM-QL-601', sectionId: 'sec6', section: '六工区', name: '建华枢纽主线桥·6号墩', stake: 'K132+500', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.62.101' },
    { id: 'CAM-YD-601', sectionId: 'sec6', section: '六工区', name: '六工区料场·消防通道', stake: 'K129+800', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.64.101' },
    { id: 'CAM-LC-601', sectionId: 'sec6', section: '六工区', name: '六工区梁场·存梁区', stake: 'K136+100', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.64.105' },
    { id: 'CAM-BH-601', sectionId: 'sec6', section: '六工区', name: '六工区拌合站·出入口', stake: 'K139+450', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.66.101' },
    { id: 'CAM-LJ-601', sectionId: 'sec6', section: '六工区', name: '六工区路基·K142路床', stake: 'K142+800', location: '路基填筑区', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.65.101' }
  ];

  /* ------------------------------------------------------------------------
     VIDEO GROUPS (Patrol Page)
     ------------------------------------------------------------------------ */
  const DEFAULT_GROUPS = [
    {
      id: 'grp-key',
      name: '重点施工点位',
      builtIn: true,
      cameras: ['CAM-YD-A01', 'CAM-LC-A03', 'CAM-BT-A01', 'CAM-QL-A02', 'CAM-YD-A03', 'CAM-BH-A01', 'CAM-LJ-301', 'CAM-BT-A02', 'CAM-QL-601']
    },
    {
      id: 'grp-yard',
      name: '料场及场站',
      builtIn: true,
      cameras: ['CAM-YD-A01', 'CAM-YD-A03', 'CAM-BH-A01', 'CAM-YD-B01', 'CAM-LC-A03', 'CAM-YD-101', 'CAM-BH-201', 'CAM-YD-501', 'CAM-YD-601']
    },
    {
      id: 'grp-traffic',
      name: '施工保通',
      builtIn: true,
      cameras: ['CAM-BT-A01', 'CAM-BT-A02', 'CAM-BT-201', 'CAM-BT-301', 'CAM-BT-401', 'CAM-BT-501', 'CAM-BT-601', 'CAM-BT-602', 'CAM-BT-103']
    }
  ];

  /* ------------------------------------------------------------------------
     PLAYBACK ALARMS & CLIPS (Page 3)
     ------------------------------------------------------------------------ */
  const PLAYBACK_ALARMS = {
    'CAM-YD-A01': {
      alarmId: 'VAI-20261126-014',
      title: '消防通道占用',
      status: '已关联',
      alarmTime: '2026-11-26 09:27:32',
      alarmClipIdx: 1,
      alarmSecInClip: 752, // 09:15:00 + 12:32 = 09:27:32
      clipWindow: '09:27:00 – 09:28:00',
      hazardId: 'AQ-202611-041',
      note: '处理记录来自安全管理。',
      safetyDetail: '二工区料场示例A东侧消防通道右侧发现临时堆放预制块及模板占道，已派员现场清理并建立24小时视频复核机制。'
    },
    'CAM-BT-A01': {
      alarmId: 'VAI-20261126-009',
      title: '导改入口车辆缓行',
      status: '已关联',
      alarmTime: '2026-11-26 09:18:45',
      alarmClipIdx: 1,
      alarmSecInClip: 225,
      clipWindow: '09:18:10 – 09:19:30',
      hazardId: 'AQ-202611-036',
      note: '处理记录来自安全管理。',
      safetyDetail: '一工区保通示例段导改入口早高峰大型运输车占道减速，现场安全员已引导恢复双车道通行。'
    },
    'CAM-QL-A02': {
      alarmId: 'VAI-20261126-011',
      title: '临边防护异常告警',
      status: '已关联',
      alarmTime: '2026-11-26 09:22:15',
      alarmClipIdx: 1,
      alarmSecInClip: 435,
      clipWindow: '09:21:40 – 09:22:50',
      hazardId: 'AQ-202611-018',
      note: '处理记录来自安全管理。',
      safetyDetail: '二工区桥梁示例A 2号墩作业平台西侧临边护栏疑似缺失，已同步触发无人机复查取证。'
    }
  };

  /* ------------------------------------------------------------------------
     AIR-GROUND LINKED EVIDENCE PAIRS (Page 4)
     ------------------------------------------------------------------------ */
  const AIRGROUND_PAIRS = [
    {
      id: 'AG-01',
      sectionId: 'sec2',
      section: '二工区',
      siteName: '料场示例A',
      partName: '消防通道',
      date: '2026-11-26',
      matched: true,
      camId: 'CAM-YD-A01',
      camLabel: '料场示例A·消防通道',
      camStake: '二工区  K28+400',
      camTime: '2026-11-26 09:27:32',
      camTag: '告警关联时刻',
      uavTaskId: 'UAV-20261126-02',
      uavTaskName: '料场全面巡检',
      uavFile: 'IMG_0018.jpg  航点07',
      uavTime: '2026-11-26 09:27:18',
      uavPart: '航点07',
      timeDiffSec: 14,
      hazardTitle: '消防通道占用',
      hazardId: 'AQ-202611-041',
      alarmId: 'VAI-20261126-014',
      summary: '两个视角均关联二工区料场示例A的消防通道，取证时间相差 14 秒。',
      sceneType: 'yardLane',
      recheckSent: false,
      recheckTime: ''
    },
    {
      id: 'AG-02',
      sectionId: 'sec1',
      section: '一工区',
      siteName: '保通示例段',
      partName: '导改入口',
      date: '2026-11-26',
      matched: true,
      camId: 'CAM-BT-A01',
      camLabel: '保通示例段·导改入口',
      camStake: '一工区  K16+720',
      camTime: '2026-11-26 09:18:45',
      camTag: '告警关联时刻',
      uavTaskId: 'UAV-20261126-01',
      uavTaskName: '施工保通专项巡检',
      uavFile: 'IMG_0009.jpg  航点03',
      uavTime: '2026-11-26 09:18:27',
      uavPart: '航点03',
      timeDiffSec: 18,
      hazardTitle: '隔离设施局部偏移',
      hazardId: 'AQ-202611-036',
      alarmId: 'VAI-20261126-009',
      summary: '两个视角均关联一工区保通示例段的导改入口，取证时间相差 18 秒。',
      sceneType: 'highway',
      recheckSent: false,
      recheckTime: ''
    },
    {
      id: 'AG-03',
      sectionId: 'sec2',
      section: '二工区',
      siteName: '桥梁示例A',
      partName: '2号墩作业平台',
      date: '2026-11-26',
      matched: true,
      camId: 'CAM-QL-A02',
      camLabel: '桥梁示例A·2号墩',
      camStake: '二工区  K26+740',
      camTime: '2026-11-26 08:43:20',
      camTag: '复查关联时刻',
      uavTaskId: 'UAV-20261126-03',
      uavTaskName: '桥梁防护复查',
      uavFile: 'IMG_0031.jpg  航点04',
      uavTime: '2026-11-26 08:43:08',
      uavPart: '航点04',
      timeDiffSec: 12,
      hazardTitle: '临边防护缺失',
      hazardId: 'AQ-202611-018',
      alarmId: 'VAI-20261126-011',
      summary: '两个视角均关联二工区桥梁示例A的2号墩作业平台，取证时间相差 12 秒。',
      sceneType: 'bridgePier',
      recheckSent: true,
      recheckTime: '2026-11-26 08:45:00'
    },
    {
      id: 'AG-04',
      sectionId: 'sec3',
      section: '三工区',
      siteName: '路基示例段',
      partName: 'K52高边坡',
      date: '2026-11-26',
      matched: true,
      camId: 'CAM-LJ-301',
      camLabel: '路基示例段·K52高边坡',
      camStake: '三工区  K52+400',
      camTime: '2026-11-26 09:41:10',
      camTag: '告警关联时刻',
      uavTaskId: 'UAV-20261126-04',
      uavTaskName: '路基边坡应急巡检',
      uavFile: 'IMG_0042.jpg  航点05',
      uavTime: '2026-11-26 09:40:54',
      uavPart: '航点05',
      timeDiffSec: 16,
      hazardTitle: '边坡防护网松动预警',
      hazardId: 'AQ-202611-044',
      alarmId: 'VAI-20261126-016',
      summary: '两个视角均关联三工区路基示例段的K52高边坡，取证时间相差 16 秒。',
      sceneType: 'subgrade',
      recheckSent: false,
      recheckTime: ''
    },
    {
      id: 'AG-05',
      sectionId: 'sec4',
      section: '四工区',
      siteName: '料场示例B',
      partName: '消防通道',
      date: '2026-11-25',
      matched: true,
      camId: 'CAM-YD-B01',
      camLabel: '料场示例B·消防通道',
      camStake: '四工区  K75+400',
      camTime: '2026-11-25 09:33:24',
      camTag: '告警关联时刻',
      uavTaskId: 'UAV-20261125-01',
      uavTaskName: '料场出入口巡检',
      uavFile: 'IMG_0012.jpg  航点06',
      uavTime: '2026-11-25 09:33:11',
      uavPart: '航点06',
      timeDiffSec: 13,
      hazardTitle: '场内通道材料侵占',
      hazardId: 'AQ-202611-029',
      alarmId: 'VAI-20261125-008',
      summary: '两个视角均关联四工区料场示例B的消防通道，取证时间相差 13 秒。',
      sceneType: 'yardLane',
      recheckSent: true,
      recheckTime: '2026-11-25 10:12:00'
    }
  ];

  /* ------------------------------------------------------------------------
     PERSISTENT MODULE UI STATE
     ------------------------------------------------------------------------ */
  const uiState = {
    directory: {
      section: '',
      siteType: '',
      purpose: '',
      status: '',
      keyword: '',
      page: 1,
      selectedId: 'CAM-YD-A01'
    },
    patrol: {
      section: '',
      groupId: 'grp-key',
      intervalSec: 30,
      layout: 4, // 1 | 4 | 9
      activeCell: 0,
      tourRunning: false,
      tourRemaining: 30,
      search: '',
      groups: DEFAULT_GROUPS.map(g => ({ ...g, cameras: [...g.cameras] })),
      cellCameras: ['CAM-YD-A01', 'CAM-LC-A03', 'CAM-BT-A01', 'CAM-QL-A02', 'CAM-YD-A03', 'CAM-BH-A01', 'CAM-LJ-301', 'CAM-BT-A02', 'CAM-QL-601']
    },
    playback: {
      camId: 'CAM-YD-A01',
      date: '2026-11-26',
      range: '09:00–10:00',
      clipIdx: 1,       // 0..3 (15-min clip)
      secInClip: 752,   // 0..900 -> 12:32 -> 09:27:32
      playing: false,
      speed: 1
    },
    airground: {
      section: '二工区',
      siteName: '料场示例A',
      partName: '消防通道',
      date: '2026-11-26',
      pairId: 'AG-01'
    }
  };

  let lastCtx = null;
  let lastHost = null;
  let lastSubPageId = 'directory';
  let lastSyncedSecId = undefined;

  // Timer & animation registry (strictly cleaned on render switch and onLeave)
  let animRafId = 0;
  const activeTimers = new Set();
  let streamTick = 0;
  let liveClockSec = 10 * 3600 + 45 * 60 + 12; // Starts at 10:45:12

  function registerInterval(fn, ms) {
    const id = window.setInterval(fn, ms);
    activeTimers.add(id);
    return id;
  }

  function cleanupTimers() {
    if (animRafId) {
      cancelAnimationFrame(animRafId);
      animRafId = 0;
    }
    activeTimers.forEach(id => clearInterval(id));
    activeTimers.clear();
  }

  /* ------------------------------------------------------------------------
     HELPERS
     ------------------------------------------------------------------------ */
  function esc(str) {
    return String(str == null ? '' : str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function pad2(n) {
    return String(Math.floor(n)).padStart(2, '0');
  }

  function formatHms(totalSec) {
    const s = ((Math.floor(totalSec) % 86400) + 86400) % 86400;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return `${pad2(h)}:${pad2(m)}:${pad2(sec)}`;
  }

  function formatMmSs(sec) {
    const clamped = Math.max(0, Math.min(900, Math.floor(sec)));
    return `${pad2(Math.floor(clamped / 60))}:${pad2(clamped % 60)}`;
  }

  function getRangeStartHour(rangeStr) {
    const m = /^(\d{2}):/.exec(rangeStr || '09:00–10:00');
    return m ? parseInt(m[1], 10) : 9;
  }

  function getClipLabel(rangeStr, idx) {
    const startH = getRangeStartHour(rangeStr);
    const m0 = idx * 15;
    const m1 = (idx + 1) * 15;
    const hEnd = m1 === 60 ? startH + 1 : startH;
    const mEnd = m1 === 60 ? 0 : m1;
    return `${pad2(startH)}:${pad2(m0)}:00 – ${pad2(hEnd)}:${pad2(mEnd)}:00`;
  }

  function getPlaybackClockStr(pb) {
    const startH = getRangeStartHour(pb.range);
    const absSec = startH * 3600 + pb.clipIdx * 900 + Math.floor(pb.secInClip);
    return `${pb.date} ${formatHms(absSec)}`;
  }

  function getCameraById(id) {
    return CAMERAS.find(c => c.id === id) || CAMERAS[0];
  }

  function statusTagClass(status) {
    if (status === '在线') return 'ok';
    if (status === '图像异常') return 'warn';
    return 'muted';
  }

  function getPlaybackAlarmForCamera(camId) {
    if (PLAYBACK_ALARMS[camId]) return PLAYBACK_ALARMS[camId];
    const cam = getCameraById(camId);
    return {
      alarmId: `VAI-20261126-${camId.slice(-3)}`,
      title: `${cam.purpose}智能预警`,
      status: '已关联',
      alarmTime: `${uiState.playback.date} 09:27:32`,
      alarmClipIdx: 1,
      alarmSecInClip: 752,
      clipWindow: '09:27:00 – 09:28:00',
      hazardId: 'AQ-202611-041',
      note: '处理记录来自安全管理。',
      safetyDetail: `${cam.section} ${cam.name}（${cam.stake}）视频智能识别触发复核提醒，安全管理员已完成现场核实。`
    };
  }

  /* ------------------------------------------------------------------------
     SCOPED MODULE CSS (<style id="m10-styles">)
     ------------------------------------------------------------------------ */
  function ensureStyles() {
    if (document.getElementById('m10-styles')) return;
    const style = document.createElement('style');
    style.id = 'm10-styles';
    style.textContent = `
      .m10-page {
        padding: 10px 18px 100px;
        display: flex;
        flex-direction: column;
        gap: 10px;
        min-height: 100%;
        max-width: 1920px;
        margin: 0 auto;
        color: var(--text-main);
      }
      .m10-page.m10-patrol-page {
        padding: 8px 18px 12px;
        gap: 8px;
        height: 100%;
      }
      .m10-patrol-page .m10-filter-bar {
        padding: 6px 14px;
        flex-shrink: 0;
      }
      .m10-patrol-page .m10-split-74-26 {
        flex: 1;
        min-height: 0;
        grid-template-rows: minmax(0, 1fr);
        align-items: stretch;
      }
      .m10-patrol-wall {
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
      }
      .m10-patrol-wall .m10-panel-header,
      .m10-patrol-wall .m10-patrol-foot {
        flex-shrink: 0;
      }
      .m10-patrol-wall .m10-patrol-foot {
        padding: 7px 14px 8px;
      }
      .m10-patrol-wall .m10-grid-stage {
        flex: 1;
        min-height: 0;
        padding: 8px 12px;
        gap: 8px;
      }
      .m10-patrol-wall .m10-grid-stage.g1 { grid-template-rows: minmax(0, 1fr); }
      .m10-patrol-wall .m10-grid-stage.g4 { grid-template-rows: repeat(2, minmax(0, 1fr)); }
      .m10-patrol-wall .m10-grid-stage.g9 { grid-template-rows: repeat(3, minmax(0, 1fr)); }
      .m10-patrol-wall .m10-cell-card {
        display: flex;
        flex-direction: column;
        min-height: 0;
        height: 100%;
      }
      .m10-patrol-wall .m10-cell-head {
        flex-shrink: 0;
        padding: 5px 10px;
      }
      .m10-patrol-wall .m10-cell-card .m10-feed-box {
        flex: 1;
        min-height: 0;
        aspect-ratio: auto;
      }
      .m10-patrol-right {
        min-height: 0;
        height: calc(100% - 88px);
        gap: 8px;
      }
      .m10-patrol-right .m10-group-list {
        padding: 8px 12px;
        gap: 6px;
        max-height: 162px;
        overflow-y: auto;
      }
      .m10-patrol-right .m10-group-card {
        padding: 8px 12px;
      }
      .m10-patrol-right .m10-patrol-tree-card {
        flex: 1;
        min-height: 0;
        display: flex;
        flex-direction: column;
      }
      .m10-patrol-tree-card .m10-panel-header,
      .m10-patrol-tree-card .m10-card-foot {
        flex-shrink: 0;
      }
      .m10-patrol-tree-card .m10-cam-tree {
        flex: 1;
        min-height: 0;
        max-height: none;
      }

      /* Filter / Control Bar */
      .m10-filter-bar {
        padding: 8px 14px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m10-filter-fields {
        display: flex;
        align-items: center;
        flex-wrap: wrap;
        gap: 10px 14px;
      }
      .m10-field {
        display: inline-flex;
        align-items: center;
        gap: 7px;
      }
      .m10-field-label {
        font-size: 12.5px;
        color: #c7e0fb;
        white-space: nowrap;
        font-weight: 500;
      }
      .m10-select {
        min-width: 118px;
        height: 32px;
        padding: 4px 10px;
        font-size: 12.5px;
      }
      .m10-select.wide { min-width: 184px; }
      .m10-search-wrap {
        position: relative;
        display: inline-flex;
        align-items: center;
      }
      .m10-search-wrap svg {
        position: absolute;
        left: 10px;
        color: #7da2cb;
        pointer-events: none;
      }
      .m10-input {
        height: 32px;
        width: 210px;
        padding: 0 10px 0 30px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(11, 38, 86, 0.82);
        color: #ffffff;
        font-size: 12.5px;
        outline: none;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m10-input.full { width: 100%; }
      .m10-input:focus {
        border-color: var(--cyan-bright);
        box-shadow: 0 0 8px rgba(56, 242, 255, 0.28);
      }
      .m10-filter-actions {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      .m10-btn-query {
        height: 32px;
        padding: 0 15px;
        border-radius: 6px;
        border: 1px solid rgba(103, 232, 249, 0.72);
        background: linear-gradient(180deg, #1b88ff 0%, #0b5fd6 100%);
        color: #ffffff;
        font-size: 12.5px;
        font-weight: 700;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 6px;
        box-shadow: 0 0 14px rgba(22, 119, 255, 0.45);
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m10-btn-query:hover {
        background: linear-gradient(180deg, #2e96ff 0%, #146ee8 100%);
        box-shadow: 0 0 18px rgba(56, 220, 255, 0.65);
      }
      .m10-btn-outline {
        height: 32px;
        padding: 0 12px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.42);
        background: rgba(12, 42, 92, 0.62);
        color: #dbeafe;
        font-size: 12.5px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        gap: 6px;
        transition: all 0.18s ease;
        white-space: nowrap;
      }
      .m10-btn-outline:hover {
        border-color: var(--cyan-bright);
        color: #ffffff;
        background: rgba(18, 60, 128, 0.8);
      }
      .m10-btn-outline.active {
        border-color: rgba(103, 232, 249, 0.85);
        background: linear-gradient(180deg, rgba(22, 140, 255, 0.92), rgba(10, 86, 186, 0.92));
        color: #ffffff;
      }
      .m10-panel-header {
        cursor: default;
        padding: 8px 14px;
      }
      .m10-sub-note {
        font-size: 12px;
        color: #93c5fd;
        font-weight: 500;
        margin-left: 4px;
      }
      .m10-header-meta {
        font-size: 12px;
        color: #93b8de;
        display: inline-flex;
        align-items: center;
        gap: 10px;
      }
      .m10-link-btn {
        background: none;
        border: none;
        color: #38f2ff;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 3px;
        padding: 0;
      }
      .m10-link-btn:hover { color: #a5f3fc; text-decoration: underline; }

      /* KPI Cards */
      .m10-kpi-grid {
        display: grid;
        grid-template-columns: repeat(5, minmax(0, 1fr));
        gap: 10px;
        padding: 10px 14px 12px;
      }
      .m10-kpi-card {
        display: flex;
        align-items: center;
        gap: 12px;
        padding: 10px 14px;
        border-radius: 9px;
        background: linear-gradient(180deg, rgba(13, 44, 96, 0.74) 0%, rgba(7, 27, 64, 0.84) 100%);
        border: 1px solid rgba(56, 189, 248, 0.25);
        box-shadow: inset 0 1px 0 rgba(125, 211, 252, 0.12);
        transition: border-color 0.2s, transform 0.2s;
      }
      .m10-kpi-card:hover {
        border-color: rgba(56, 220, 255, 0.6);
        transform: translateY(-1px);
      }
      .m10-kpi-icon {
        width: 40px;
        height: 40px;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
        background: rgba(14, 116, 204, 0.22);
        border: 1px solid rgba(56, 189, 248, 0.35);
        color: #38f2ff;
      }
      .m10-kpi-icon.green { background: rgba(22, 163, 74, 0.18); border-color: rgba(74, 222, 128, 0.38); color: #4ade80; }
      .m10-kpi-icon.gold { background: rgba(234, 179, 8, 0.18); border-color: rgba(250, 204, 21, 0.42); color: #facc15; }
      .m10-kpi-icon.blue { background: rgba(37, 99, 235, 0.24); border-color: rgba(96, 165, 250, 0.42); color: #60a5fa; }
      .m10-kpi-label { font-size: 12px; color: #a9c6e8; margin-bottom: 3px; }
      .m10-kpi-val-row { display: flex; align-items: baseline; gap: 4px; }
      .m10-kpi-val {
        font-size: 24px;
        font-weight: 800;
        line-height: 1.1;
        font-variant-numeric: tabular-nums;
        color: #38f2ff;
        text-shadow: 0 0 12px rgba(56, 242, 255, 0.35);
      }
      .m10-kpi-val.green { color: #4ade80; text-shadow: 0 0 12px rgba(74, 222, 128, 0.35); }
      .m10-kpi-val.gold { color: #facc15; text-shadow: 0 0 12px rgba(250, 204, 21, 0.35); }
      .m10-kpi-val.blue { color: #60a5fa; text-shadow: 0 0 12px rgba(96, 165, 250, 0.35); }
      .m10-kpi-unit { font-size: 12px; color: #d6e8ff; font-weight: 500; }

      /* Split Grids */
      .m10-split-66-34 {
        display: grid;
        grid-template-columns: minmax(0, 1.92fr) minmax(320px, 1fr);
        gap: 10px;
        align-items: start;
      }
      .m10-split-74-26 {
        display: grid;
        grid-template-columns: minmax(0, 2.75fr) minmax(290px, 1fr);
        gap: 10px;
        align-items: start;
      }
      .m10-split-50-50 {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 10px;
      }
      .m10-right-stack {
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      /* Tags & Pills */
      .m10-tag {
        display: inline-flex;
        align-items: center;
        gap: 4px;
        padding: 2px 9px;
        border-radius: 99px;
        font-size: 11px;
        font-weight: 600;
        white-space: nowrap;
      }
      .m10-tag.ok { background: rgba(34, 197, 94, 0.18); color: #4ade80; border: 1px solid rgba(74, 222, 128, 0.42); }
      .m10-tag.warn { background: rgba(250, 204, 21, 0.18); color: #facc15; border: 1px solid rgba(250, 204, 21, 0.45); }
      .m10-tag.info { background: rgba(14, 165, 233, 0.2); color: #7dd3fc; border: 1px solid rgba(56, 189, 248, 0.45); }
      .m10-tag.muted { background: rgba(148, 163, 184, 0.14); color: #94a3b8; border: 1px solid rgba(148, 163, 184, 0.34); }

      /* Table & Pagination */
      .m10-table-wrap { padding: 0 14px; overflow-x: auto; }
      .m10-table th, .m10-table td { padding: 9px 10px; white-space: nowrap; }
      .m10-table tbody tr { cursor: pointer; transition: background 0.15s; }
      .m10-table tbody tr:hover { background: rgba(56, 189, 248, 0.08); }
      .m10-table tbody tr.active {
        background: rgba(22, 119, 255, 0.22);
        box-shadow: inset 2px 0 0 #38f2ff, inset 0 1px 0 rgba(56, 220, 255, 0.38), inset 0 -1px 0 rgba(56, 220, 255, 0.38);
      }
      .m10-table-foot {
        padding: 10px 14px 12px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        gap: 12px;
        font-size: 12px;
        color: #93b8de;
      }
      .m10-pager { display: inline-flex; align-items: center; gap: 4px; }
      .m10-page-btn {
        min-width: 26px;
        height: 26px;
        padding: 0 6px;
        border-radius: 5px;
        border: 1px solid rgba(56, 189, 248, 0.32);
        background: rgba(10, 34, 76, 0.65);
        color: #cfe4ff;
        font-size: 12px;
        cursor: pointer;
      }
      .m10-page-btn:hover:not(:disabled) { border-color: var(--cyan-bright); color: #fff; }
      .m10-page-btn.active {
        background: #1677ff;
        border-color: #7dd3fc;
        color: #fff;
        font-weight: 700;
      }
      .m10-page-btn:disabled { opacity: 0.4; cursor: not-allowed; }

      /* Inspector Meta Card */
      .m10-inspector-body { padding: 12px 14px 14px; display: flex; flex-direction: column; gap: 10px; }
      .m10-ins-title-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
      .m10-ins-id { font-size: 15.5px; font-weight: 800; color: #ffffff; letter-spacing: 0.4px; }
      .m10-kv-list { display: flex; flex-direction: column; gap: 7px; padding-bottom: 8px; border-bottom: 1px solid rgba(56, 189, 248, 0.16); }
      .m10-kv-row { display: flex; align-items: center; gap: 14px; font-size: 12.5px; }
      .m10-kv-key { width: 64px; flex-shrink: 0; color: #8cb2db; }
      .m10-kv-val { color: #f1f7ff; font-weight: 600; }
      .m10-kv-val.gold { color: #facc15; }
      .m10-btn-pair { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; margin-top: 2px; }
      .m10-btn-pair .m10-btn-query, .m10-btn-pair .m10-btn-outline { height: 34px; width: 100%; justify-content: center; }

      /* Video Viewport Container */
      .m10-feed-box {
        position: relative;
        width: 100%;
        aspect-ratio: 16 / 9.2;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.36);
        background: #041026;
      }
      .m10-feed-box.playback { aspect-ratio: 16 / 8.2; }
      .m10-feed-canvas {
        width: 100%;
        height: 100%;
        display: block;
      }
      .m10-hud-tl, .m10-hud-tr, .m10-hud-bl, .m10-hud-br {
        position: absolute;
        z-index: 2;
        pointer-events: none;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m10-hud-tl { top: 8px; left: 8px; }
      .m10-hud-tr { top: 8px; right: 8px; }
      .m10-hud-bl { bottom: 8px; left: 8px; }
      .m10-hud-br { bottom: 8px; right: 8px; pointer-events: auto; }
      .m10-hud-pill {
        padding: 3px 8px;
        border-radius: 5px;
        background: rgba(4, 15, 36, 0.78);
        border: 1px solid rgba(148, 197, 255, 0.28);
        color: #f1f7ff;
        font-size: 11px;
        font-weight: 600;
        font-variant-numeric: tabular-nums;
        backdrop-filter: blur(4px);
      }
      .m10-hud-pill.warn {
        background: rgba(92, 62, 8, 0.85);
        border-color: rgba(250, 204, 21, 0.75);
        color: #fde047;
      }
      .m10-hud-pill.live {
        border-color: rgba(74, 222, 128, 0.45);
        color: #dbeafe;
      }
      .m10-fs-btn {
        width: 26px;
        height: 26px;
        border-radius: 5px;
        border: 1px solid rgba(148, 197, 255, 0.35);
        background: rgba(4, 15, 36, 0.78);
        color: #e2f0ff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
      }
      .m10-fs-btn:hover { border-color: var(--cyan-bright); color: #fff; background: rgba(14, 56, 120, 0.9); }

      /* Patrol Multi-Grid */
      .m10-layout-seg {
        display: inline-flex;
        border-radius: 6px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.38);
        background: rgba(8, 28, 66, 0.72);
      }
      .m10-layout-btn {
        height: 28px;
        padding: 0 11px;
        border: none;
        border-right: 1px solid rgba(56, 189, 248, 0.25);
        background: transparent;
        color: #b8d5f5;
        font-size: 12px;
        font-weight: 600;
        cursor: pointer;
        display: inline-flex;
        align-items: center;
        gap: 5px;
      }
      .m10-layout-btn:last-child { border-right: none; }
      .m10-layout-btn.active {
        background: linear-gradient(180deg, #1b88ff, #0c5fd4);
        color: #ffffff;
      }
      .m10-grid-stage {
        padding: 10px 14px;
        display: grid;
        gap: 10px;
      }
      .m10-grid-stage.g1 { grid-template-columns: 1fr; }
      .m10-grid-stage.g4 { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .m10-grid-stage.g9 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .m10-cell-card {
        border-radius: 9px;
        border: 1px solid rgba(56, 189, 248, 0.3);
        background: rgba(7, 25, 60, 0.8);
        overflow: hidden;
        cursor: pointer;
        transition: border-color 0.18s, box-shadow 0.18s;
      }
      .m10-cell-card.selected {
        border-color: #38f2ff;
        box-shadow: 0 0 16px rgba(56, 242, 255, 0.32), inset 0 0 0 1px rgba(56, 242, 255, 0.45);
      }
      .m10-cell-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 6px 10px;
        background: rgba(11, 36, 82, 0.78);
        border-bottom: 1px solid rgba(56, 189, 248, 0.18);
      }
      .m10-cell-title {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        font-size: 12.5px;
        font-weight: 600;
        color: #eaf4ff;
        min-width: 0;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .m10-cell-card .m10-feed-box {
        border: none;
        border-radius: 0;
        aspect-ratio: 16 / 9;
      }
      .m10-patrol-foot {
        padding: 8px 14px 11px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        flex-wrap: wrap;
        gap: 10px;
        border-top: 1px solid rgba(56, 189, 248, 0.18);
        font-size: 12px;
        color: #a9c6e8;
      }
      .m10-group-list { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
      .m10-group-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.25);
        background: rgba(12, 42, 92, 0.56);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m10-group-card:hover { border-color: rgba(56, 220, 255, 0.6); background: rgba(16, 56, 118, 0.7); }
      .m10-group-card.active {
        border-color: #38f2ff;
        background: rgba(22, 119, 255, 0.22);
      }
      .m10-card-foot {
        padding: 8px 12px 10px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        border-top: 1px solid rgba(56, 189, 248, 0.16);
        font-size: 12px;
        color: #93b8de;
      }
      .m10-cam-tree {
        max-height: 360px;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 6px;
        padding: 8px 12px;
      }
      .m10-cam-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
        padding: 7px 10px;
        border-radius: 7px;
        border: 1px solid rgba(56, 189, 248, 0.16);
        background: rgba(10, 34, 76, 0.45);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m10-cam-row:hover, .m10-cam-row.active {
        border-color: rgba(56, 220, 255, 0.6);
        background: rgba(20, 68, 140, 0.52);
      }
      .m10-cam-row-name { font-size: 12.5px; font-weight: 600; color: #f1f7ff; }
      .m10-cam-row-sub { font-size: 11px; color: #8cb2db; }

      /* Playback Controls & Timeline */
      .m10-player-wrap { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 10px; }
      .m10-ctrl-bar {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 6px 8px;
        border-radius: 7px;
        background: rgba(8, 28, 66, 0.8);
        border: 1px solid rgba(56, 189, 248, 0.26);
      }
      .m10-play-btn {
        width: 30px;
        height: 30px;
        border-radius: 6px;
        border: 1px solid rgba(103, 232, 249, 0.65);
        background: linear-gradient(180deg, #1b88ff, #0b5fd6);
        color: #fff;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        flex-shrink: 0;
      }
      .m10-time-txt {
        font-size: 12px;
        color: #dbeafe;
        font-variant-numeric: tabular-nums;
        white-space: nowrap;
      }
      .m10-scrubber {
        flex: 1;
        height: 5px;
        accent-color: #38f2ff;
        cursor: pointer;
      }
      .m10-timeline-card {
        padding: 10px 12px;
        border-radius: 8px;
        background: rgba(7, 24, 56, 0.78);
        border: 1px solid rgba(56, 189, 248, 0.22);
      }
      .m10-tl-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 8px;
        font-size: 12.5px;
        font-weight: 600;
        color: #dbeafe;
      }
      .m10-tl-legend { display: inline-flex; align-items: center; gap: 14px; font-size: 11.5px; color: #a9c6e8; font-weight: 500; }
      .m10-tl-legend span { display: inline-flex; align-items: center; gap: 5px; }
      .m10-tl-bar-swatch { width: 14px; height: 4px; border-radius: 2px; display: inline-block; }
      .m10-tl-track {
        position: relative;
        height: 44px;
        cursor: pointer;
        user-select: none;
      }
      .m10-tl-rail {
        position: absolute;
        left: 0;
        right: 0;
        top: 20px;
        height: 8px;
        border-radius: 99px;
        background: rgba(16, 56, 118, 0.75);
        border: 1px solid rgba(56, 189, 248, 0.25);
        overflow: hidden;
      }
      .m10-tl-rec {
        position: absolute;
        inset: 0;
        background: linear-gradient(90deg, rgba(14, 165, 233, 0.55), rgba(56, 242, 255, 0.75), rgba(14, 165, 233, 0.55));
      }
      .m10-tl-window {
        position: absolute;
        top: 0;
        bottom: 0;
        background: rgba(56, 242, 255, 0.42);
        box-shadow: inset 0 0 0 1px rgba(165, 243, 252, 0.8);
      }
      .m10-tl-alarm {
        position: absolute;
        top: 17px;
        width: 6px;
        height: 14px;
        border-radius: 2px;
        background: #facc15;
        box-shadow: 0 0 10px rgba(250, 204, 21, 0.9);
        transform: translateX(-50%);
        cursor: pointer;
        z-index: 3;
      }
      .m10-tl-alarm-badge {
        position: absolute;
        top: -2px;
        transform: translateX(-50%);
        padding: 1px 6px;
        border-radius: 4px;
        background: rgba(88, 56, 8, 0.92);
        border: 1px solid rgba(250, 204, 21, 0.85);
        color: #fde047;
        font-size: 10.5px;
        font-weight: 700;
        white-space: nowrap;
        cursor: pointer;
        z-index: 3;
      }
      .m10-tl-playhead {
        position: absolute;
        top: 14px;
        width: 2px;
        height: 20px;
        background: #ffffff;
        box-shadow: 0 0 8px #ffffff;
        transform: translateX(-50%);
        z-index: 4;
        pointer-events: none;
      }
      .m10-tl-ticks {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 0;
        display: flex;
        justify-content: space-between;
        font-size: 11px;
        color: #8cb2db;
        font-variant-numeric: tabular-nums;
      }
      .m10-clip-list { padding: 10px 12px; display: flex; flex-direction: column; gap: 8px; }
      .m10-clip-card {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 10px 12px;
        border-radius: 8px;
        border: 1px solid rgba(56, 189, 248, 0.22);
        background: rgba(11, 38, 86, 0.56);
        cursor: pointer;
        transition: all 0.16s;
      }
      .m10-clip-card:hover { border-color: rgba(56, 220, 255, 0.55); }
      .m10-clip-card.active {
        border-color: #38f2ff;
        background: rgba(22, 119, 255, 0.22);
        box-shadow: 0 0 12px rgba(56, 242, 255, 0.22);
      }
      .m10-info-hint {
        padding: 8px 11px;
        border-radius: 7px;
        background: rgba(11, 40, 88, 0.65);
        border: 1px solid rgba(56, 189, 248, 0.22);
        color: #a9c6e8;
        font-size: 12px;
      }

      /* Air-Ground Page */
      .m10-ag-card-body { padding: 10px 14px 12px; display: flex; flex-direction: column; gap: 10px; }
      .m10-ag-foot { display: flex; align-items: center; justify-content: space-between; gap: 10px; }
      .m10-ag-title { font-size: 13.5px; font-weight: 700; color: #f1f7ff; }
      .m10-ag-sub { font-size: 11.5px; color: #8cb2db; margin-top: 2px; }
      .m10-spatial-wrap {
        padding: 12px 14px;
        display: grid;
        grid-template-columns: 206px minmax(0, 1fr);
        gap: 14px;
        align-items: center;
      }
      .m10-spatial-thumb {
        position: relative;
        width: 206px;
        height: 118px;
        border-radius: 8px;
        overflow: hidden;
        border: 1px solid rgba(56, 189, 248, 0.42);
        cursor: pointer;
        background: #061836;
      }
      .m10-spatial-thumb:hover { border-color: #38f2ff; box-shadow: 0 0 12px rgba(56, 242, 255, 0.35); }
      .m10-spatial-caption { font-size: 12px; color: #9ec0e6; margin-top: 8px; }

      /* Modal Form Grid */
      .m10-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
      .m10-form-item { display: flex; flex-direction: column; gap: 5px; }
      .m10-form-item label { font-size: 12px; color: #a9c6e8; }
      .m10-form-item input, .m10-form-item select, .m10-form-item textarea {
        padding: 7px 10px;
        border-radius: 6px;
        border: 1px solid rgba(56, 189, 248, 0.4);
        background: rgba(10, 34, 78, 0.9);
        color: #fff;
        font-size: 12.5px;
        outline: none;
      }
      .m10-form-item textarea { resize: vertical; min-height: 64px; }

      @media (max-width: 1280px) {
        .m10-kpi-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
        .m10-split-66-34, .m10-split-74-26, .m10-split-50-50 { grid-template-columns: 1fr; }
        .m10-spatial-wrap { grid-template-columns: 1fr; }
      }
      @media (max-width: 1280px), (max-height: 750px) {
        .m10-page.m10-patrol-page { height: auto; padding-bottom: 100px; }
        .m10-patrol-page .m10-split-74-26 { grid-template-rows: auto; }
        .m10-patrol-wall, .m10-patrol-right { height: auto; }
        .m10-patrol-wall .m10-cell-card .m10-feed-box { flex: none; aspect-ratio: 16 / 9; }
        .m10-patrol-tree-card .m10-cam-tree { max-height: 360px; }
      }
    `;
    document.head.appendChild(style);
  }

  /* ------------------------------------------------------------------------
     PROCEDURAL HTML5 CANVAS VIDEO RENDERER
     Deterministic, crisp, zero network dependencies, handles:
       - 'yardLane', 'beamYard', 'highway', 'bridgePier', 'gate', 'yardRoad', 'batchPlant', 'subgrade'
       - 'uavAerial' oblique mode for air-ground comparison
       - '图像异常' frozen-last-frame + scan-glitch artifact
       - '离线' test-pattern / no-signal noise
       - AI bounding box on alarm timestamps
     ------------------------------------------------------------------------ */
  function drawSceneOnCanvas(canvas, opts) {
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const status = opts.status || '在线';
    const sceneType = opts.sceneType || 'yardLane';
    const t = opts.t || 0;
    const isUav = !!opts.isUav;
    const showAlarmBox = !!opts.showAlarmBox;
    const alarmBoxLabel = opts.alarmBoxLabel || '疑似消防通道占用';

    // Offline camera feed
    if (status === '离线') {
      ctx.fillStyle = '#061226';
      ctx.fillRect(0, 0, w, h);
      // Subtle static noise grid
      for (let y = 0; y < h; y += 6) {
        const lum = 12 + ((y * 17 + Math.floor(t * 9)) % 14);
        ctx.fillStyle = `rgba(${lum}, ${lum + 14}, ${lum + 32}, 0.55)`;
        ctx.fillRect(0, y, w, 2);
      }
      ctx.strokeStyle = 'rgba(148, 163, 184, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(18, 18, w - 36, h - 36);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.85)';
      ctx.font = 'bold 16px "Microsoft YaHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NO SIGNAL · 设备离线', w / 2, h / 2 - 6);
      ctx.fillStyle = 'rgba(148, 163, 184, 0.6)';
      ctx.font = '12px "Microsoft YaHei", sans-serif';
      ctx.fillText('等待网络或供电恢复重连', w / 2, h / 2 + 18);
      ctx.textAlign = 'left';
      return;
    }

    // Frozen time for 图像异常 (simulate frozen last-valid-frame)
    const animT = status === '图像异常' ? 1.7 : t;

    // Sky & distant treeline horizon
    const horizonY = isUav ? h * 0.14 : h * 0.22;
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#5d83ab');
    skyGrad.addColorStop(1, '#9cb6ce');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // Distant autumn treeline along G1211 corridor
    ctx.fillStyle = '#4f4a34';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    for (let x = 0; x <= w; x += 18) {
      const th = 7 + Math.sin(x * 0.08) * 5 + Math.cos(x * 0.21) * 3;
      ctx.lineTo(x, horizonY - th);
    }
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fill();

    // Ground base
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#6e726b');
    groundGrad.addColorStop(1, '#8c8a81');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    if (sceneType === 'yardLane' || sceneType === 'yardRoad' || sceneType === 'gate') {
      // Concrete central fire/haul aisle in perspective
      const vpX = isUav ? w * 0.56 : w * 0.52;
      const vpY = horizonY + 8;
      ctx.fillStyle = '#a4a096';
      ctx.beginPath();
      ctx.moveTo(vpX - 36, vpY);
      ctx.lineTo(vpX + 36, vpY);
      ctx.lineTo(w * 0.78, h);
      ctx.lineTo(w * 0.16, h);
      ctx.closePath();
      ctx.fill();

      // Concrete slab expansion joints
      ctx.strokeStyle = 'rgba(72, 70, 64, 0.45)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 7; i++) {
        const p = Math.pow(i / 7, 1.55);
        const y = vpY + (h - vpY) * p;
        const lx = (vpX - 36) + (w * 0.16 - (vpX - 36)) * p;
        const rx = (vpX + 36) + (w * 0.78 - (vpX + 36)) * p;
        ctx.beginPath();
        ctx.moveTo(lx, y);
        ctx.lineTo(rx, y);
        ctx.stroke();
      }

      // Crisp yellow safety lane lines
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(vpX - 28, vpY);
      ctx.lineTo(w * 0.22, h);
      ctx.moveTo(vpX + 26, vpY);
      ctx.lineTo(w * 0.66, h);
      ctx.stroke();

      // Left shed steel columns & rebar/bag stacks
      ctx.fillStyle = '#3f454d';
      ctx.beginPath();
      ctx.moveTo(0, horizonY);
      ctx.lineTo(vpX - 36, vpY);
      ctx.lineTo(w * 0.16, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();

      // Rebar bundles & white bulk bags under left shed
      for (let i = 0; i < 6; i++) {
        const p = i / 6;
        const y = vpY + (h - vpY) * (0.14 + p * 0.78);
        const bw = 28 + p * 85;
        const bh = 14 + p * 36;
        // Rebar/material pile
        ctx.fillStyle = i < 2 ? '#cbd5e1' : '#524940';
        ctx.fillRect(6, y - bh, bw, bh);
        ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
        ctx.strokeRect(6, y - bh, bw, bh);
        // Steel column
        const colX = (vpX - 34) + (w * 0.17 - (vpX - 34)) * (0.12 + p * 0.85);
        ctx.fillStyle = '#64748b';
        ctx.fillRect(colX - 4, y - bh * 2.1, 6 + p * 4, bh * 2.1);
      }

      // Shed roof (bright blue corrugated roof visible in UAV oblique view, dark eave in ground view)
      if (isUav) {
        ctx.fillStyle = '#1d4ed8';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w * 0.42, 0);
        ctx.lineTo(vpX - 28, vpY);
        ctx.lineTo(0, h * 0.55);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = 'rgba(147, 197, 253, 0.45)';
        ctx.lineWidth = 1;
        for (let k = 0; k < 10; k++) {
          ctx.beginPath();
          ctx.moveTo(0, k * 24);
          ctx.lineTo(w * 0.36 - k * 14, k * 12);
          ctx.stroke();
        }
      } else {
        ctx.fillStyle = '#1e3a5f';
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(w * 0.46, 0);
        ctx.lineTo(vpX - 34, vpY - 12);
        ctx.lineTo(0, horizonY * 0.5);
        ctx.closePath();
        ctx.fill();
      }

      // Right green tarpaulin-covered aggregate mounds
      ctx.fillStyle = '#1e5b4f';
      ctx.beginPath();
      ctx.moveTo(vpX + 32, vpY);
      ctx.lineTo(w, horizonY + 12);
      ctx.lineTo(w, h * 0.82);
      ctx.lineTo(w * 0.66, h * 0.72);
      ctx.closePath();
      ctx.fill();
      // Tarp highlights/folds
      ctx.strokeStyle = 'rgba(74, 222, 128, 0.22)';
      ctx.lineWidth = 2;
      for (let f = 0; f < 4; f++) {
        ctx.beginPath();
        ctx.moveTo(vpX + 55 + f * 48, vpY + 18 + f * 12);
        ctx.lineTo(w - 20, horizonY + 35 + f * 30);
        ctx.stroke();
      }

      // Stacked concrete blocks on right foreground
      const blkX = w * 0.67;
      const blkY = h * 0.64;
      ctx.fillStyle = '#b4b8bd';
      ctx.fillRect(blkX, blkY, w * 0.28, h * 0.3);
      ctx.fillStyle = '#949aa1';
      ctx.fillRect(blkX + 10, blkY - 22, w * 0.2, 22);
      ctx.strokeStyle = 'rgba(51, 65, 85, 0.55)';
      ctx.lineWidth = 1;
      for (let r = 0; r < 5; r++) {
        ctx.beginPath();
        ctx.moveTo(blkX, blkY + r * 14);
        ctx.lineTo(blkX + w * 0.28, blkY + r * 14);
        ctx.stroke();
      }

      // Animated site patrol worker / small cart moving slowly in lane
      const walkP = (animT * 0.06) % 1;
      const personX = (vpX - 4) + (w * 0.44 - (vpX - 4)) * (0.25 + walkP * 0.45);
      const personY = vpY + (h - vpY) * (0.25 + walkP * 0.45);
      const scale = 0.45 + walkP * 0.55;
      // Worker vest (safety orange) & yellow helmet
      ctx.fillStyle = '#f97316';
      ctx.fillRect(personX - 4 * scale, personY - 16 * scale, 8 * scale, 11 * scale);
      ctx.fillStyle = '#facc15';
      ctx.beginPath();
      ctx.arc(personX, personY - 19 * scale, 3.5 * scale, 0, Math.PI * 2);
      ctx.fill();

      if (sceneType === 'gate') {
        // Barrier arm at entrance
        ctx.strokeStyle = '#ef4444';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.moveTo(w * 0.24, h * 0.62);
        ctx.lineTo(w * 0.62, h * 0.59 - Math.sin(animT * 0.7) * 8);
        ctx.stroke();
      }

      // Alarm encroachment pallet + dashed yellow bounding box
      if (showAlarmBox) {
        const bx = w * 0.54;
        const by = h * 0.56;
        ctx.fillStyle = '#a16207';
        ctx.fillRect(bx + 8, by + 16, 46, 22);
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(bx + 12, by + 6, 38, 12);

        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 4]);
        ctx.strokeRect(bx, by, 68, 46);
        ctx.setLineDash([]);
        ctx.fillStyle = 'rgba(250, 204, 21, 0.92)';
        ctx.fillRect(bx, by - 17, 108, 17);
        ctx.fillStyle = '#0f172a';
        ctx.font = 'bold 10.5px "Microsoft YaHei", sans-serif';
        ctx.fillText(alarmBoxLabel, bx + 5, by - 4);
        ctx.restore();
      }
    } else if (sceneType === 'beamYard') {
      // Blue workshop building in background
      ctx.fillStyle = '#1e40af';
      ctx.fillRect(w * 0.48, horizonY - 26, w * 0.52, h * 0.32);
      ctx.fillStyle = '#3b82f6';
      ctx.fillRect(w * 0.48, horizonY - 30, w * 0.52, 6);

      // Concrete prefabrication apron
      ctx.fillStyle = '#78808a';
      ctx.beginPath();
      ctx.moveTo(w * 0.12, horizonY + 12);
      ctx.lineTo(w * 0.92, h * 0.58);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.08, h);
      ctx.closePath();
      ctx.fill();

      // Rows of precast concrete box girders
      for (let g = 0; g < 6; g++) {
        const gx = w * 0.25 + g * (w * 0.1);
        const gy = h * 0.44 + g * 12;
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.moveTo(gx, gy);
        ctx.lineTo(gx + w * 0.26, gy + 56);
        ctx.lineTo(gx + w * 0.22, gy + 72);
        ctx.lineTo(gx - 18, gy + 16);
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = '#475569';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Yellow gantry crane traversing gently
      const craneShift = Math.sin(animT * 0.45) * 18;
      const cx = w * 0.28 + craneShift;
      ctx.fillStyle = '#eab308';
      ctx.fillRect(cx, horizonY - 24, w * 0.42, 10);
      ctx.fillRect(cx + 8, horizonY - 14, 9, h * 0.48);
      ctx.fillRect(cx + w * 0.36, horizonY - 14, 9, h * 0.54);
      // Hanging hook
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(cx + w * 0.22, horizonY - 14);
      ctx.lineTo(cx + w * 0.22, horizonY + 42);
      ctx.stroke();
    } else if (sceneType === 'highway') {
      // Green erosion-control netting slope on right
      ctx.fillStyle = '#1e5f4d';
      ctx.beginPath();
      ctx.moveTo(w * 0.58, horizonY);
      ctx.lineTo(w, horizonY);
      ctx.lineTo(w, h);
      ctx.lineTo(w * 0.68, h);
      ctx.closePath();
      ctx.fill();

      // Curved asphalt diversion road
      ctx.fillStyle = '#475569';
      ctx.beginPath();
      ctx.moveTo(w * 0.26, horizonY);
      ctx.lineTo(w * 0.46, horizonY);
      ctx.quadraticCurveTo(w * 0.54, h * 0.52, w * 0.72, h);
      ctx.lineTo(w * 0.14, h);
      ctx.quadraticCurveTo(w * 0.32, h * 0.52, w * 0.26, horizonY);
      ctx.closePath();
      ctx.fill();

      // Lane center line
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 2;
      ctx.setLineDash([12, 10]);
      ctx.beginPath();
      ctx.moveTo(w * 0.36, horizonY + 4);
      ctx.quadraticCurveTo(w * 0.44, h * 0.54, w * 0.46, h);
      ctx.stroke();
      ctx.setLineDash([]);

      // Red & white water-filled safety barriers along curve
      for (let b = 0; b < 11; b++) {
        const p = b / 10;
        const bx = w * 0.45 + p * p * w * 0.27;
        const by = horizonY + 8 + p * (h - horizonY - 16);
        ctx.fillStyle = b % 2 === 0 ? '#dc2626' : '#f8fafc';
        ctx.fillRect(bx, by, 14 + p * 12, 8 + p * 8);
      }

      // Moving white SUV & red truck
      const carP = (animT * 0.16) % 1;
      const carX = w * 0.34 + carP * w * 0.1;
      const carY = horizonY + 24 + carP * (h - horizonY - 40);
      const cw = 18 + carP * 26;
      const ch = 10 + carP * 14;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(carX - cw / 2, carY - ch / 2, cw, ch);
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(carX - cw * 0.35, carY - ch * 0.35, cw * 0.7, ch * 0.35);

      const trkP = ((animT * 0.11) + 0.45) % 1;
      const trkX = w * 0.29 + trkP * w * 0.04;
      const trkY = horizonY + 14 + (1 - trkP) * (h - horizonY - 50);
      const tw = 16 + (1 - trkP) * 20;
      const th = 12 + (1 - trkP) * 14;
      ctx.fillStyle = '#b91c1c';
      ctx.fillRect(trkX - tw / 2, trkY - th / 2, tw, th);
    } else if (sceneType === 'bridgePier') {
      // Concrete bridge pier column
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(w * 0.39, h * 0.56, w * 0.17, h * 0.44);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(w * 0.51, h * 0.56, w * 0.05, h * 0.44);

      // Pier cap & working platform
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(w * 0.3, h * 0.38, w * 0.36, h * 0.18);
      ctx.fillStyle = '#1e3a8a';
      // Blue steel scaffolding frame
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 2.2;
      for (let i = 0; i <= 5; i++) {
        const sx = w * 0.26 + i * (w * 0.085);
        ctx.beginPath();
        ctx.moveTo(sx, h * 0.35);
        ctx.lineTo(sx, h * 0.96);
        ctx.stroke();
      }
      for (let j = 0; j < 4; j++) {
        const sy = h * 0.37 + j * (h * 0.16);
        ctx.beginPath();
        ctx.moveTo(w * 0.26, sy);
        ctx.lineTo(w * 0.69, sy);
        ctx.stroke();
      }
      // Top rebar cage
      ctx.strokeStyle = '#78350f';
      ctx.lineWidth = 1.6;
      for (let r = 0; r < 14; r++) {
        const rx = w * 0.35 + r * 9;
        ctx.beginPath();
        ctx.moveTo(rx, h * 0.23);
        ctx.lineTo(rx, h * 0.38);
        ctx.stroke();
      }
    } else if (sceneType === 'batchPlant') {
      // Concrete batching plant towers & cement silos
      ctx.fillStyle = '#1e3a8a';
      ctx.fillRect(w * 0.18, horizonY - 22, w * 0.32, h * 0.45);
      // 4 cylindrical silos
      for (let s = 0; s < 4; s++) {
        const sx = w * 0.56 + s * 34;
        ctx.fillStyle = '#cbd5e1';
        ctx.fillRect(sx, horizonY - 34, 24, h * 0.44);
        ctx.fillStyle = '#94a3b8';
        ctx.fillRect(sx + 16, horizonY - 34, 8, h * 0.44);
      }
      // Mixer truck waiting under chute
      const tx = w * 0.25 + Math.sin(animT * 0.3) * 10;
      ctx.fillStyle = '#f8fafc';
      ctx.fillRect(tx, h * 0.68, 56, 22);
      ctx.fillStyle = '#0ea5e9';
      ctx.fillRect(tx + 10, h * 0.63, 30, 14);
    } else {
      // Subgrade earthwork slope & roller
      ctx.fillStyle = '#5c4d3c';
      ctx.beginPath();
      ctx.moveTo(0, horizonY + 8);
      ctx.lineTo(w * 0.55, horizonY + 28);
      ctx.lineTo(w, h * 0.52);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = '#2d6a4f';
      ctx.beginPath();
      ctx.moveTo(w * 0.55, horizonY + 28);
      ctx.lineTo(w, horizonY + 4);
      ctx.lineTo(w, h * 0.52);
      ctx.closePath();
      ctx.fill();
      // Yellow road roller
      const rx = w * 0.3 + ((animT * 22) % (w * 0.32));
      ctx.fillStyle = '#eab308';
      ctx.fillRect(rx, h * 0.66, 44, 18);
      ctx.fillStyle = '#334155';
      ctx.beginPath();
      ctx.arc(rx + 8, h * 0.84, 9, 0, Math.PI * 2);
      ctx.arc(rx + 36, h * 0.84, 8, 0, Math.PI * 2);
      ctx.fill();
    }

    // Subtle scanline + vignette overlay for surveillance realism
    ctx.fillStyle = 'rgba(2, 10, 26, 0.08)';
    for (let y = 0; y < h; y += 4) {
      ctx.fillRect(0, y, w, 1);
    }

    // Anomaly glitch distortion bands for 图像异常
    if (status === '图像异常') {
      ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
      ctx.fillRect(0, h * 0.28, w, 6);
      ctx.fillStyle = 'rgba(56, 242, 255, 0.22)';
      ctx.fillRect(0, h * 0.63, w, 4);
      ctx.fillStyle = 'rgba(2, 10, 26, 0.22)';
      ctx.fillRect(0, 0, w, h);
    }
  }

  /* Aerial spatial alignment thumbnail (Page 4 lower-left) */
  function drawSpatialThumbnail(canvas, pair) {
    if (!canvas) return;
    const w = canvas.width;
    const h = canvas.height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Top-down orthophoto yard
    ctx.fillStyle = '#474f57';
    ctx.fillRect(0, 0, w, h);
    // Blue roofs
    ctx.fillStyle = '#1d4ed8';
    ctx.fillRect(16, 12, 74, 28);
    ctx.fillRect(114, 12, 74, 28);
    // Central yard pavement
    ctx.fillStyle = '#9ca3af';
    ctx.fillRect(16, 48, 172, 56);
    // Aggregate piles
    ctx.fillStyle = '#1f5e4e';
    ctx.fillRect(128, 56, 52, 40);
    // Yellow fire lane
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.strokeRect(86, 48, 30, 56);

    // Camera FOV cone (cyan)
    ctx.fillStyle = 'rgba(56, 242, 255, 0.24)';
    ctx.beginPath();
    ctx.moveTo(92, 98);
    ctx.lineTo(74, 52);
    ctx.lineTo(116, 52);
    ctx.closePath();
    ctx.fill();

    // Ground camera pin
    ctx.fillStyle = '#22d3ee';
    ctx.beginPath();
    ctx.arc(92, 98, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 1.4;
    ctx.stroke();

    // UAV waypoint pin (gold)
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(102, 66, 4.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Subtle map frame
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
    ctx.lineWidth = 1;
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);
  }

  /* ------------------------------------------------------------------------
     CANVAS ANIMATION LOOP
     ------------------------------------------------------------------------ */
  function refreshAllCanvases() {
    const modalEl = document.getElementById('globalModal');
    const isModalOpen = !!(modalEl && modalEl.classList.contains('open'));
    const canvases = document.querySelectorAll('canvas.m10-feed-canvas');
    canvases.forEach(c => {
      if (!isModalOpen && c.closest('#globalModal')) return;
      const camId = c.dataset.camId || 'CAM-YD-A01';
      const cam = getCameraById(camId);
      const isPlayback = c.dataset.mode === 'playback';
      const isUav = c.dataset.uav === '1';
      let showAlarm = c.dataset.alarm === '1';
      let t = streamTick * 0.08;

      if (isPlayback) {
        t = uiState.playback.secInClip * 0.35;
        const alarm = getPlaybackAlarmForCamera(camId);
        const nearAlarm = uiState.playback.clipIdx === alarm.alarmClipIdx &&
          Math.abs(uiState.playback.secInClip - alarm.alarmSecInClip) <= 45;
        showAlarm = nearAlarm;
      }

      drawSceneOnCanvas(c, {
        status: isPlayback || isUav ? '在线' : cam.status,
        sceneType: c.dataset.sceneType || cam.sceneType,
        t,
        isUav,
        showAlarmBox: showAlarm,
        alarmBoxLabel: c.dataset.alarmLabel || '疑似消防通道占用'
      });
    });

    const thumb = document.getElementById('m10SpatialThumbCanvas');
    if (thumb) {
      const pair = AIRGROUND_PAIRS.find(p => p.id === uiState.airground.pairId) || AIRGROUND_PAIRS[0];
      drawSpatialThumbnail(thumb, pair);
    }
  }

  function startAnimationEngine(subPageId) {
    cleanupTimers();

    // 1. Live HUD clock & patrol tour ticker (1Hz)
    registerInterval(() => {
      liveClockSec += 1;
      const clockStr = `2026-11-26 ${formatHms(liveClockSec)}`;
      document.querySelectorAll('[data-live-clock="1"]').forEach(el => {
        el.textContent = clockStr;
      });

      // Patrol auto-tour timer
      if (subPageId === 'patrol' && uiState.patrol.tourRunning) {
        uiState.patrol.tourRemaining -= 1;
        if (uiState.patrol.tourRemaining <= 0) {
          uiState.patrol.tourRemaining = uiState.patrol.intervalSec;
          rotatePatrolCameras();
        } else {
          const badge = document.getElementById('m10TourCountdown');
          if (badge) badge.textContent = `${uiState.patrol.tourRemaining}s 后轮换`;
        }
      }

      // Playback simulation timer
      if (subPageId === 'playback' && uiState.playback.playing) {
        uiState.playback.secInClip += uiState.playback.speed;
        if (uiState.playback.secInClip >= 900) {
          if (uiState.playback.clipIdx < 3) {
            uiState.playback.clipIdx += 1;
            uiState.playback.secInClip = 0;
            renderCurrentPage();
            return;
          } else {
            uiState.playback.secInClip = 900;
            uiState.playback.playing = false;
            renderCurrentPage();
            return;
          }
        }
        syncPlaybackWidgets();
      }
    }, 1000);

    // 2. Smooth 12fps Canvas refresh timer (low CPU, crisp motion)
    registerInterval(() => {
      streamTick += 1;
      refreshAllCanvases();
    }, 85);

    refreshAllCanvases();
  }

  function rotatePatrolCameras() {
    const p = uiState.patrol;
    const pool = p.section
      ? CAMERAS.filter(c => c.section === p.section)
      : CAMERAS;
    if (pool.length === 0) return;
    const count = p.layout;
    const currentFirst = p.cellCameras[0];
    const startIdx = Math.max(0, pool.findIndex(c => c.id === currentFirst));
    const nextStart = (startIdx + count) % pool.length;
    for (let i = 0; i < 9; i++) {
      p.cellCameras[i] = pool[(nextStart + i) % pool.length].id;
    }
    renderCurrentPage();
  }

  function syncPlaybackWidgets() {
    const pb = uiState.playback;
    const scrubber = document.getElementById('m10PbScrubber');
    if (scrubber) scrubber.value = Math.floor(pb.secInClip);
    const timeEl = document.getElementById('m10PbTimeLabel');
    if (timeEl) timeEl.textContent = `${formatMmSs(pb.secInClip)} / 15:00`;
    const hudTime = document.getElementById('m10PbHudClock');
    if (hudTime) hudTime.textContent = getPlaybackClockStr(pb);
    const playhead = document.getElementById('m10TlPlayhead');
    if (playhead) {
      const pct = ((pb.clipIdx * 900 + pb.secInClip) / 3600) * 100;
      playhead.style.left = `${Math.max(0, Math.min(100, pct))}%`;
    }
    const alarmTag = document.getElementById('m10PbAlarmTag');
    if (alarmTag) {
      const alarm = getPlaybackAlarmForCamera(pb.camId);
      const show = pb.clipIdx === alarm.alarmClipIdx && Math.abs(pb.secInClip - alarm.alarmSecInClip) <= 45;
      alarmTag.style.display = show ? 'inline-flex' : 'none';
    }
  }

  /* ------------------------------------------------------------------------
     FILTER HELPERS
     ------------------------------------------------------------------------ */
  function getFilteredDirectoryCameras() {
    const f = uiState.directory;
    const kw = (f.keyword || '').trim().toLowerCase();
    return CAMERAS.filter(c => {
      if (f.section && c.section !== f.section) return false;
      if (f.siteType && c.siteType !== f.siteType) return false;
      if (f.purpose && c.purpose !== f.purpose) return false;
      if (f.status && c.status !== f.status) return false;
      if (kw) {
        const hay = `${c.id} ${c.name} ${c.stake} ${c.location} ${c.section}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }

  /* ------------------------------------------------------------------------
     RENDER SUB-PAGE 1: 设备目录 (01_设备目录.png)
     ------------------------------------------------------------------------ */
  function renderDirectoryPage() {
    const f = uiState.directory;
    const filtered = getFilteredDirectoryCameras();
    const pageSize = 7;
    const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
    if (f.page > totalPages) f.page = totalPages;
    if (f.page < 1) f.page = 1;
    const start = (f.page - 1) * pageSize;
    const pageRows = filtered.slice(start, start + pageSize);

    let selectedCam = filtered.find(c => c.id === f.selectedId) || pageRows[0] || CAMERAS[0];
    if (selectedCam) f.selectedId = selectedCam.id;

    // Dynamic KPI counts reflecting current filter (all 48 when unfiltered -> 48 / 43 / 3 / 2 / 6)
    const totalCnt = filtered.length;
    const onlineCnt = filtered.filter(c => c.status === '在线').length;
    const offlineCnt = filtered.filter(c => c.status === '离线').length;
    const abnormalCnt = filtered.filter(c => c.status === '图像异常').length;
    const secCnt = new Set(filtered.map(c => c.sectionId)).size;

    const pageButtons = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 6 || i === 1 || i === totalPages || Math.abs(i - f.page) <= 1) {
        pageButtons.push(`<button class="m10-page-btn ${i === f.page ? 'active' : ''}" data-dir-page="${i}">${i}</button>`);
      } else if (pageButtons[pageButtons.length - 1] !== '<span style="padding:0 4px;">...</span>') {
        pageButtons.push('<span style="padding:0 4px;">...</span>');
      }
    }

    const snapTime = selectedCam.status === '在线'
      ? `2026-11-26 ${formatHms(liveClockSec)}`
      : selectedCam.lastTime;

    return `
      <div class="m10-page">
        <!-- Top Filter Bar -->
        <div class="glass-panel m10-filter-bar">
          <div class="m10-filter-fields">
            <div class="m10-field">
              <span class="m10-field-label">所属工区</span>
              <select class="glass-select m10-select" id="m10DirSec">
                <option value="">全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.name}" ${f.section === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">场站 / 部位</span>
              <select class="glass-select m10-select" id="m10DirSite">
                <option value="">全部位置</option>
                ${SITE_TYPES.map(t => `<option value="${t}" ${f.siteType === t ? 'selected' : ''}>${t}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">监控用途</span>
              <select class="glass-select m10-select" id="m10DirPurpose">
                <option value="">全部用途</option>
                ${PURPOSE_TYPES.map(p => `<option value="${p}" ${f.purpose === p ? 'selected' : ''}>${p}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">设备状态</span>
              <select class="glass-select m10-select" id="m10DirStatus">
                <option value="">全部状态</option>
                ${STATUS_TYPES.map(st => `<option value="${st}" ${f.status === st ? 'selected' : ''}>${st}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">关键词</span>
              <div class="m10-search-wrap">
                ${ICONS.search}
                <input class="m10-input" id="m10DirKeyword" type="text" placeholder="点位 / 桩号 / 设备编号" value="${esc(f.keyword)}" />
              </div>
            </div>
          </div>
          <div class="m10-filter-actions">
            <button class="m10-btn-query" id="m10DirQueryBtn">${ICONS.search}<span>查询</span></button>
            <button class="m10-btn-outline" id="m10DirResetBtn">${ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        <!-- KPI Strip -->
        <div class="glass-panel">
          <div class="panel-header m10-panel-header">
            <div class="panel-title-group">
              <span class="panel-accent-bar"></span>
              <span class="panel-title">视频资源概况</span>
              <span class="m10-sub-note">(2026年11月)</span>
            </div>
          </div>
          <div class="m10-kpi-grid">
            <div class="m10-kpi-card">
              <div class="m10-kpi-icon">${ICONS.cam}</div>
              <div>
                <div class="m10-kpi-label">接入摄像头</div>
                <div class="m10-kpi-val-row"><span class="m10-kpi-val">${totalCnt}</span><span class="m10-kpi-unit">路</span></div>
              </div>
            </div>
            <div class="m10-kpi-card">
              <div class="m10-kpi-icon green">${ICONS.signal}</div>
              <div>
                <div class="m10-kpi-label">正常在线</div>
                <div class="m10-kpi-val-row"><span class="m10-kpi-val green">${onlineCnt}</span><span class="m10-kpi-unit">路</span></div>
              </div>
            </div>
            <div class="m10-kpi-card">
              <div class="m10-kpi-icon blue">${ICONS.signalOff}</div>
              <div>
                <div class="m10-kpi-label">离线</div>
                <div class="m10-kpi-val-row"><span class="m10-kpi-val blue">${offlineCnt}</span><span class="m10-kpi-unit">路</span></div>
              </div>
            </div>
            <div class="m10-kpi-card">
              <div class="m10-kpi-icon gold">${ICONS.warn}</div>
              <div>
                <div class="m10-kpi-label">图像异常</div>
                <div class="m10-kpi-val-row"><span class="m10-kpi-val gold">${abnormalCnt}</span><span class="m10-kpi-unit">路</span></div>
              </div>
            </div>
            <div class="m10-kpi-card">
              <div class="m10-kpi-icon">${ICONS.layers}</div>
              <div>
                <div class="m10-kpi-label">覆盖工区</div>
                <div class="m10-kpi-val-row"><span class="m10-kpi-val">${secCnt}</span><span class="m10-kpi-unit">个</span></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Lower Split: Camera List + Inspector -->
        <div class="m10-split-66-34">
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">摄像头列表</span>
              </div>
              <div class="m10-header-meta">
                <span>接入来源</span>
                <strong style="color:#dbeafe;">原视频系统</strong>
              </div>
            </div>
            <div class="m10-table-wrap">
              <table class="data-table m10-table">
                <thead>
                  <tr>
                    <th>设备编号</th>
                    <th>工区</th>
                    <th>点位名称</th>
                    <th>桩号</th>
                    <th>布设部位</th>
                    <th>监控用途</th>
                    <th>设备状态</th>
                    <th>操作</th>
                  </tr>
                </thead>
                <tbody>
                  ${pageRows.length === 0 ? `
                    <tr><td colspan="8" style="text-align:center;color:#8cb2db;padding:28px;">暂无匹配摄像头记录，请调整筛选条件</td></tr>
                  ` : pageRows.map(c => `
                    <tr class="${c.id === selectedCam.id ? 'active' : ''}" data-dir-select="${esc(c.id)}">
                      <td style="font-weight:700;color:#eaf4ff;">${esc(c.id)}</td>
                      <td>${esc(c.section)}</td>
                      <td>${esc(c.name)}</td>
                      <td>${esc(c.stake)}</td>
                      <td>${esc(c.location)}</td>
                      <td>${esc(c.purpose)}</td>
                      <td><span class="m10-tag ${statusTagClass(c.status)}">${esc(c.status)}</span></td>
                      <td><button class="m10-link-btn" data-dir-inspect="${esc(c.id)}">查看</button></td>
                    </tr>
                  `).join('')}
                </tbody>
              </table>
            </div>
            <div class="m10-table-foot">
              <span>共 ${filtered.length} 路设备</span>
              <div class="m10-pager">
                <button class="m10-page-btn" data-dir-page="${f.page - 1}" ${f.page <= 1 ? 'disabled' : ''}>&lt;</button>
                ${pageButtons.join('')}
                <button class="m10-page-btn" data-dir-page="${f.page + 1}" ${f.page >= totalPages ? 'disabled' : ''}>&gt;</button>
              </div>
            </div>
          </div>

          <!-- Right Inspector -->
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">设备详情</span>
              </div>
              <button class="m10-btn-outline" style="height:28px;padding:0 10px;font-size:12px;" id="m10EditCamBtn">${ICONS.edit}<span>编辑点位</span></button>
            </div>
            <div class="m10-inspector-body">
              <div class="m10-ins-title-row">
                <span class="m10-ins-id">${esc(selectedCam.id)}</span>
                <span class="m10-tag ${statusTagClass(selectedCam.status)}">${esc(selectedCam.status)}</span>
              </div>
              <div class="m10-kv-list">
                <div class="m10-kv-row"><span class="m10-kv-key">点位名称</span><span class="m10-kv-val">${esc(selectedCam.name)}</span></div>
                <div class="m10-kv-row"><span class="m10-kv-key">所属工区</span><span class="m10-kv-val">${esc(selectedCam.section)}</span></div>
                <div class="m10-kv-row"><span class="m10-kv-key">关联桩号</span><span class="m10-kv-val">${esc(selectedCam.stake)}</span></div>
                <div class="m10-kv-row"><span class="m10-kv-key">布设部位</span><span class="m10-kv-val">${esc(selectedCam.location)}</span></div>
                <div class="m10-kv-row"><span class="m10-kv-key">监控用途</span><span class="m10-kv-val">${esc(selectedCam.purpose)}</span></div>
              </div>
              <div class="m10-ins-title-row" style="font-size:12.5px;">
                <strong style="color:#dbeafe;">当前画面</strong>
                <span style="color:#7dd3fc;font-size:12px;">${esc(selectedCam.source)}</span>
              </div>
              <div class="m10-feed-box">
                <canvas class="m10-feed-canvas" width="480" height="276" data-cam-id="${esc(selectedCam.id)}"></canvas>
                <div class="m10-hud-tl">
                  <span class="m10-hud-pill" ${selectedCam.status === '在线' ? 'data-live-clock="1"' : ''}>${esc(snapTime)}</span>
                </div>
                <div class="m10-hud-tr">
                  <span class="m10-hud-pill ${selectedCam.status === '图像异常' ? 'warn' : ''}">${selectedCam.status === '图像异常' ? '最后有效帧' : selectedCam.status === '离线' ? '信号中断' : '画面示意'}</span>
                </div>
              </div>
              <div class="m10-btn-pair">
                <button class="m10-btn-query" id="m10GoPatrolBtn">${ICONS.camSm}<span>查看实时画面</span></button>
                <button class="m10-btn-outline" id="m10GoPlaybackBtn">${ICONS.clock}<span>查历史录像</span></button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     RENDER SUB-PAGE 2: 视频巡查 (02_视频巡查.png)
     ------------------------------------------------------------------------ */
  function renderPatrolPage() {
    const p = uiState.patrol;
    const activeGroup = p.groups.find(g => g.id === p.groupId) || p.groups[0];
    const layoutText = p.layout === 1 ? '单画面' : p.layout === 9 ? '九画面' : '四画面';

    const visibleCells = [];
    for (let i = 0; i < p.layout; i++) {
      const cam = getCameraById(p.cellCameras[i] || activeGroup.cameras[i % activeGroup.cameras.length]);
      visibleCells.push({ idx: i, cam });
    }
    const okCnt = visibleCells.filter(x => x.cam.status === '在线').length;
    const warnCnt = visibleCells.filter(x => x.cam.status === '图像异常').length;
    const offCnt = visibleCells.filter(x => x.cam.status === '离线').length;

    const kw = (p.search || '').trim().toLowerCase();
    const listCameras = CAMERAS.filter(c => {
      if (p.section && c.section !== p.section) return false;
      if (kw) {
        const hay = `${c.id} ${c.name} ${c.section} ${c.stake}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });

    const activeCellCamId = (visibleCells[p.activeCell] && visibleCells[p.activeCell].cam.id) || '';

    return `
      <div class="m10-page m10-patrol-page">
        <!-- Top Control Bar -->
        <div class="glass-panel m10-filter-bar">
          <div class="m10-filter-fields">
            <div class="m10-field">
              <span class="m10-field-label">所属工区</span>
              <select class="glass-select m10-select" id="m10PatrolSec">
                <option value="">全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.name}" ${p.section === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">视频组合</span>
              <select class="glass-select m10-select wide" id="m10PatrolGroupSel">
                ${p.groups.map(g => `<option value="${esc(g.id)}" ${g.id === p.groupId ? 'selected' : ''}>${esc(g.name)} (${Math.min(p.layout, g.cameras.length)}路)</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">轮巡间隔</span>
              <select class="glass-select m10-select" id="m10PatrolInterval">
                ${[15, 30, 60].map(sec => `<option value="${sec}" ${p.intervalSec === sec ? 'selected' : ''}>${sec}秒</option>`).join('')}
              </select>
            </div>
          </div>
          <div class="m10-filter-actions">
            <span class="m10-tag info">${layoutText}</span>
            <button class="m10-btn-outline" id="m10PatrolOpenDirBtn">${ICONS.list}<span>打开设备目录</span></button>
          </div>
        </div>

        <!-- Main Workspace -->
        <div class="m10-split-74-26">
          <!-- Left: Multi-grid Video Wall -->
          <div class="glass-panel m10-patrol-wall">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">监控画面</span>
                ${p.tourRunning ? `<span class="m10-tag ok" id="m10TourCountdown">${p.tourRemaining}s 后轮换</span>` : ''}
              </div>
              <div class="m10-layout-seg">
                <button class="m10-layout-btn ${p.layout === 1 ? 'active' : ''}" data-patrol-layout="1">${ICONS.grid1}<span>单画面</span></button>
                <button class="m10-layout-btn ${p.layout === 4 ? 'active' : ''}" data-patrol-layout="4">${ICONS.grid4}<span>四画面</span></button>
                <button class="m10-layout-btn ${p.layout === 9 ? 'active' : ''}" data-patrol-layout="9">${ICONS.grid9}<span>九画面</span></button>
              </div>
            </div>
            <div class="m10-grid-stage g${p.layout}">
              ${visibleCells.map(({ idx, cam }) => {
                const isSelected = idx === p.activeCell;
                const ts = cam.status === '在线' ? `2026-11-26 ${formatHms(liveClockSec)}` : cam.lastTime;
                const badgeClass = cam.status === '图像异常' ? 'warn' : cam.status === '在线' ? 'live' : '';
                const badgeText = cam.status === '图像异常' ? '⚠ 最后有效帧' : cam.status === '离线' ? '信号离线' : 'ıll 实时画面';
                return `
                  <div class="m10-cell-card ${isSelected ? 'selected' : ''}" data-patrol-cell="${idx}">
                    <div class="m10-cell-head">
                      <span class="m10-cell-title">${ICONS.camSm}<span>${esc(cam.section)}·${esc(cam.name)}</span></span>
                      <span class="m10-tag ${statusTagClass(cam.status)}">${esc(cam.status)}</span>
                    </div>
                    <div class="m10-feed-box">
                      <canvas class="m10-feed-canvas" width="${p.layout === 1 ? 820 : p.layout === 4 ? 480 : 320}" height="${p.layout === 1 ? 460 : p.layout === 4 ? 270 : 180}" data-cam-id="${esc(cam.id)}"></canvas>
                      <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(cam.id)}</span></div>
                      <div class="m10-hud-tr"><span class="m10-hud-pill ${badgeClass}">${badgeText}</span></div>
                      <div class="m10-hud-bl"><span class="m10-hud-pill" ${cam.status === '在线' ? 'data-live-clock="1"' : ''}>${esc(ts)}</span></div>
                      <div class="m10-hud-br">
                        <button class="m10-fs-btn" title="全屏查看" data-patrol-fs="${esc(cam.id)}">${ICONS.fullscreen}</button>
                      </div>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
            <div class="m10-patrol-foot">
              <div>当前组合 <strong style="color:#f1f7ff;margin-left:6px;">${esc(activeGroup.name)} · ${p.layout}路</strong></div>
              <div>
                <span>正常 <strong style="color:#4ade80;">${okCnt} 路</strong></span>
                ${warnCnt > 0 ? `<span style="margin-left:10px;">图像异常 <strong style="color:#facc15;">${warnCnt} 路</strong></span>` : ''}
                ${offCnt > 0 ? `<span style="margin-left:10px;">离线 <strong style="color:#94a3b8;">${offCnt} 路</strong></span>` : ''}
              </div>
              <div class="m10-filter-actions">
                <button class="m10-btn-outline ${p.tourRunning ? 'active' : ''}" id="m10ToggleTourBtn">${p.tourRunning ? `${ICONS.pause}<span>停止轮巡</span>` : `${ICONS.reset}<span>开启轮巡</span>`}</button>
                <button class="m10-btn-outline" id="m10SaveGroupBtn">${ICONS.save}<span>保存组合</span></button>
              </div>
            </div>
          </div>

          <!-- Right Column: Common Groups + Camera Tree -->
          <div class="m10-right-stack m10-patrol-right">
            <div class="glass-panel">
              <div class="panel-header m10-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">常用视频组合</span>
                </div>
              </div>
              <div class="m10-group-list">
                ${p.groups.map(g => {
                  const isAct = g.id === p.groupId;
                  return `
                    <div class="m10-group-card ${isAct ? 'active' : ''}" data-pick-group="${esc(g.id)}">
                      <span style="display:inline-flex;align-items:center;gap:8px;font-weight:600;color:#eaf4ff;">
                        ${ICONS.grid4}<span>${esc(g.name)}</span>
                      </span>
                      ${isAct ? '<span class="m10-tag info">正在查看</span>' : `<span style="font-size:12px;color:#93b8de;">4 路</span>`}
                    </div>
                  `;
                }).join('')}
              </div>
              <div class="m10-card-foot">
                <span>共 ${p.groups.length} 个组合</span>
                <button class="m10-link-btn" id="m10ManageGroupsBtn">管理组合 &gt;</button>
              </div>
            </div>

            <div class="glass-panel m10-patrol-tree-card">
              <div class="panel-header m10-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">视频点位</span>
                </div>
              </div>
              <div style="padding:8px 12px 4px;flex-shrink:0;">
                <div class="m10-search-wrap" style="width:100%;">
                  ${ICONS.search}
                  <input class="m10-input full" id="m10PatrolSearch" type="text" placeholder="按点位或设备编号搜索" value="${esc(p.search)}" />
                </div>
              </div>
              <div class="m10-cam-tree">
                ${listCameras.map(c => `
                  <div class="m10-cam-row ${c.id === activeCellCamId ? 'active' : ''}" data-load-cam="${esc(c.id)}">
                    <div style="display:flex;align-items:center;gap:8px;min-width:0;">
                      <span style="color:#7dd3fc;flex-shrink:0;">${ICONS.camSm}</span>
                      <div style="min-width:0;">
                        <div class="m10-cam-row-name">${esc(c.name)}</div>
                        <div class="m10-cam-row-sub">${esc(c.section)} &nbsp; ${esc(c.id)}</div>
                      </div>
                    </div>
                    <span class="m10-tag ${statusTagClass(c.status)}">${esc(c.status)}</span>
                  </div>
                `).join('')}
              </div>
              <div class="m10-card-foot">
                <span>${p.section ? `${esc(p.section)} ${listCameras.length} 路` : `全部 ${CAMERAS.length} 路`}</span>
                <button class="m10-link-btn" id="m10TreeToDirBtn">查看设备目录 &gt;</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     RENDER SUB-PAGE 3: 历史录像 (03_历史录像.png)
     ------------------------------------------------------------------------ */
  function renderPlaybackPage() {
    const pb = uiState.playback;
    const cam = getCameraById(pb.camId);
    const alarm = getPlaybackAlarmForCamera(pb.camId);
    const startH = getRangeStartHour(pb.range);

    const playbackClock = getPlaybackClockStr(pb);
    const playheadPct = ((pb.clipIdx * 900 + pb.secInClip) / 3600) * 100;
    const alarmPct = ((alarm.alarmClipIdx * 900 + alarm.alarmSecInClip) / 3600) * 100;
    const alarmShortTime = alarm.alarmTime.split(' ')[1] || '09:27:32';
    const isNearAlarm = pb.clipIdx === alarm.alarmClipIdx && Math.abs(pb.secInClip - alarm.alarmSecInClip) <= 45;

    const clips = [0, 1, 2, 3].map(idx => ({
      idx,
      label: getClipLabel(pb.range, idx).replace(/:00\b/g, ''),
      fullLabel: getClipLabel(pb.range, idx),
      hasAlarm: idx === alarm.alarmClipIdx
    }));

    const ticks = [0, 15, 30, 45, 60].map(m => {
      const hh = m === 60 ? startH + 1 : startH;
      const mm = m === 60 ? 0 : m;
      return `${pad2(hh)}:${pad2(mm)}`;
    });

    const deviceOptions = CAMERAS.filter(c => c.status !== '离线');

    return `
      <div class="m10-page">
        <!-- Top Query Bar -->
        <div class="glass-panel m10-filter-bar">
          <div class="m10-filter-fields">
            <div class="m10-field">
              <span class="m10-field-label">回放设备</span>
              <select class="glass-select m10-select wide" id="m10PbCamSel">
                ${deviceOptions.map(c => `<option value="${esc(c.id)}" ${c.id === pb.camId ? 'selected' : ''}>${esc(c.id)} · ${esc(c.name.split('·').pop())}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">录像日期</span>
              <select class="glass-select m10-select" id="m10PbDateSel">
                <option value="2026-11-26" ${pb.date === '2026-11-26' ? 'selected' : ''}>2026-11-26</option>
                <option value="2026-11-25" ${pb.date === '2026-11-25' ? 'selected' : ''}>2026-11-25</option>
                <option value="2026-11-24" ${pb.date === '2026-11-24' ? 'selected' : ''}>2026-11-24</option>
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">时间范围</span>
              <select class="glass-select m10-select" id="m10PbRangeSel">
                <option value="09:00–10:00" ${pb.range === '09:00–10:00' ? 'selected' : ''}>09:00–10:00</option>
                <option value="10:00–11:00" ${pb.range === '10:00–11:00' ? 'selected' : ''}>10:00–11:00</option>
                <option value="08:00–09:00" ${pb.range === '08:00–09:00' ? 'selected' : ''}>08:00–09:00</option>
              </select>
            </div>
          </div>
          <div class="m10-filter-actions">
            <button class="m10-btn-query" id="m10PbQueryBtn">${ICONS.search}<span>查询</span></button>
            <button class="m10-btn-outline" id="m10PbResetBtn">${ICONS.reset}<span>重置</span></button>
          </div>
        </div>

        <!-- Main Split -->
        <div class="m10-split-66-34">
          <!-- Left: Playback Player + Interactive Timeline -->
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">历史录像回放</span>
              </div>
              <div class="m10-header-meta">
                <span class="m10-tag ok">可回放</span>
                <span style="color:#dbeafe;font-weight:600;">${esc(cam.section)}·${esc(cam.name)}</span>
              </div>
            </div>
            <div class="m10-player-wrap">
              <div class="m10-feed-box playback">
                <canvas class="m10-feed-canvas" id="m10PbCanvas" width="840" height="430" data-cam-id="${esc(cam.id)}" data-mode="playback" data-alarm="${isNearAlarm ? '1' : '0'}" data-alarm-label="${esc(alarm.title)}"></canvas>
                <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(cam.id)}</span></div>
                <div class="m10-hud-tr"><span class="m10-hud-pill">回 历史回放</span></div>
                <div class="m10-hud-bl"><span class="m10-hud-pill" id="m10PbHudClock">${esc(playbackClock)}</span></div>
                <div class="m10-hud-br">
                  <span class="m10-hud-pill warn" id="m10PbAlarmTag" style="display:${isNearAlarm ? 'inline-flex' : 'none'};">${ICONS.warnSm}<span>关联告警时刻</span></span>
                </div>
              </div>

              <!-- Controls -->
              <div class="m10-ctrl-bar">
                <button class="m10-play-btn" id="m10PbPlayBtn" title="${pb.playing ? '暂停' : '播放'}">${pb.playing ? ICONS.pause : ICONS.play}</button>
                <span class="m10-time-txt" id="m10PbTimeLabel">${formatMmSs(pb.secInClip)} / 15:00</span>
                <input class="m10-scrubber" id="m10PbScrubber" type="range" min="0" max="900" value="${Math.floor(pb.secInClip)}" />
                <select class="glass-select speed-select" id="m10PbSpeedSel">
                  ${[0.5, 1, 2, 4].map(sp => `<option value="${sp}" ${pb.speed === sp ? 'selected' : ''}>${sp}x</option>`).join('')}
                </select>
                <button class="m10-btn-outline" style="height:30px;" id="m10PbSnapBtn">${ICONS.capture}<span>截图取证</span></button>
                <button class="m10-fs-btn" style="width:30px;height:30px;" id="m10PbFsBtn" title="全屏回放">${ICONS.fullscreen}</button>
              </div>

              <!-- Interactive Timeline -->
              <div class="m10-timeline-card">
                <div class="m10-tl-head">
                  <span>录像时轴</span>
                  <div class="m10-tl-legend">
                    <span><i class="m10-tl-bar-swatch" style="background:#38f2ff;"></i> 有录像</span>
                    <span><i class="m10-tl-bar-swatch" style="background:#facc15;"></i> 告警片段</span>
                  </div>
                </div>
                <div class="m10-tl-track" id="m10TlTrack" title="点击时轴任意位置定位回放">
                  <div class="m10-tl-rail">
                    <div class="m10-tl-rec"></div>
                    <div class="m10-tl-window" style="left:${pb.clipIdx * 25}%;width:25%;"></div>
                  </div>
                  <div class="m10-tl-alarm-badge" id="m10TlAlarmBadge" style="left:${alarmPct}%;">${esc(alarmShortTime)}</div>
                  <div class="m10-tl-alarm" id="m10TlAlarmDot" style="left:${alarmPct}%;"></div>
                  <div class="m10-tl-playhead" id="m10TlPlayhead" style="left:${playheadPct}%;"></div>
                  <div class="m10-tl-ticks">
                    ${ticks.map(tk => `<span>${tk}</span>`).join('')}
                  </div>
                </div>
              </div>

              <div style="display:flex;align-items:center;justify-content:space-between;font-size:12px;color:#8cb2db;padding:0 2px;">
                <span>录像来源 &nbsp;<strong style="color:#dbeafe;">原视频系统</strong></span>
                <span>当前回放 &nbsp;<strong style="color:#dbeafe;">${esc(getClipLabel(pb.range, pb.clipIdx))}</strong></span>
              </div>
            </div>
          </div>

          <!-- Right Column: Clips + Linked Alarm -->
          <div class="m10-right-stack">
            <div class="glass-panel">
              <div class="panel-header m10-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">录像片段</span>
                </div>
                <span class="m10-header-meta">${esc(pb.range)}</span>
              </div>
              <div class="m10-clip-list">
                ${clips.map(cl => `
                  <div class="m10-clip-card ${cl.idx === pb.clipIdx ? 'active' : ''}" data-pick-clip="${cl.idx}">
                    <div style="display:flex;align-items:center;gap:10px;">
                      <span style="color:#38bdf8;">${ICONS.play}</span>
                      <div>
                        <div style="font-weight:700;color:#f1f7ff;font-size:13px;">${esc(cl.fullLabel.replace(/(\d{2}:\d{2}):00/g, '$1'))}</div>
                        <div style="font-size:11.5px;color:#8cb2db;">原视频系统录像 &nbsp; 15 分钟</div>
                      </div>
                    </div>
                    <span class="m10-tag ${cl.hasAlarm ? 'warn' : 'ok'}">${cl.hasAlarm ? '含关联告警' : '可回放'}</span>
                  </div>
                `).join('')}
              </div>
              <div class="m10-card-foot">
                <span>共 4 段 · 60 分钟</span>
                <button class="m10-link-btn" id="m10PbSourceBtn">查看录像来源 &gt;</button>
              </div>
            </div>

            <div class="glass-panel">
              <div class="panel-header m10-panel-header">
                <div class="panel-title-group">
                  <span class="panel-accent-bar"></span>
                  <span class="panel-title">关联告警片段</span>
                </div>
              </div>
              <div class="m10-inspector-body">
                <div class="m10-ins-title-row">
                  <strong style="font-size:15px;color:#ffffff;">${esc(alarm.title)}</strong>
                  <span class="m10-tag info">${esc(alarm.status)}</span>
                </div>
                <div class="m10-kv-list" style="border-bottom:none;padding-bottom:2px;">
                  <div class="m10-kv-row"><span class="m10-kv-key">告警编号</span><span class="m10-kv-val">${esc(alarm.alarmId)}</span></div>
                  <div class="m10-kv-row"><span class="m10-kv-key">告警时间</span><span class="m10-kv-val gold">${esc(alarm.alarmTime)}</span></div>
                  <div class="m10-kv-row"><span class="m10-kv-key">关联片段</span><span class="m10-kv-val">${esc(alarm.clipWindow)}</span></div>
                  <div class="m10-kv-row"><span class="m10-kv-key">关联隐患</span><span class="m10-kv-val">${esc(alarm.hazardId)}</span></div>
                </div>
                <div class="m10-btn-pair">
                  <button class="m10-btn-query" id="m10SeekAlarmBtn">${ICONS.target}<span>定位录像</span></button>
                  <button class="m10-btn-outline" id="m10OpenSafetyBtn">${ICONS.ext}<span>查看安全管理记录</span></button>
                </div>
                <div class="m10-info-hint">ⓘ ${esc(alarm.note)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     RENDER SUB-PAGE 4: 空地联动 (04_空地联动.png)
     ------------------------------------------------------------------------ */
  function renderAirGroundPage() {
    const ag = uiState.airground;
    const pair = AIRGROUND_PAIRS.find(p => p.id === ag.pairId) || AIRGROUND_PAIRS[0];

    const siteOptions = [...new Set(AIRGROUND_PAIRS.map(p => p.siteName))];
    const partOptions = [...new Set(AIRGROUND_PAIRS.map(p => p.partName))];

    return `
      <div class="m10-page">
        <!-- Top Match Bar -->
        <div class="glass-panel m10-filter-bar">
          <div class="m10-filter-fields">
            <div class="m10-field">
              <span class="m10-field-label">所属工区</span>
              <select class="glass-select m10-select" id="m10AgSec">
                <option value="">全部工区</option>
                ${SECTIONS.map(s => `<option value="${s.name}" ${ag.section === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">工程位置</span>
              <select class="glass-select m10-select" id="m10AgSite">
                ${siteOptions.map(st => `<option value="${esc(st)}" ${ag.siteName === st ? 'selected' : ''}>${esc(st)}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">关联部位</span>
              <select class="glass-select m10-select" id="m10AgPart">
                ${partOptions.map(pt => `<option value="${esc(pt)}" ${ag.partName === pt ? 'selected' : ''}>${esc(pt)}</option>`).join('')}
              </select>
            </div>
            <div class="m10-field">
              <span class="m10-field-label">证据日期</span>
              <select class="glass-select m10-select" id="m10AgDate">
                <option value="2026-11-26" ${ag.date === '2026-11-26' ? 'selected' : ''}>2026-11-26</option>
                <option value="2026-11-25" ${ag.date === '2026-11-25' ? 'selected' : ''}>2026-11-25</option>
              </select>
            </div>
          </div>
          <div class="m10-filter-actions">
            <span class="m10-tag ok">点位已匹配</span>
            <button class="m10-btn-query" id="m10AgQueryBtn">${ICONS.search}<span>查询同点位影像</span></button>
          </div>
        </div>

        <!-- Upper Side-by-Side Comparison -->
        <div class="m10-split-50-50">
          <!-- Ground View -->
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">地面视角 · 固定视频</span>
              </div>
              <span class="m10-tag info">原视频系统</span>
            </div>
            <div class="m10-ag-card-body">
              <div class="m10-feed-box">
                <canvas class="m10-feed-canvas" width="640" height="360" data-cam-id="${esc(pair.camId)}" data-scene-type="${esc(pair.sceneType)}" data-alarm="1" data-alarm-label="${esc(pair.hazardTitle)}"></canvas>
                <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(pair.camId)}</span></div>
                <div class="m10-hud-tr"><span class="m10-hud-pill">${ICONS.camSm}<span>固定视频回放</span></span></div>
                <div class="m10-hud-bl"><span class="m10-hud-pill">${esc(pair.camTime)}</span></div>
                <div class="m10-hud-br"><span class="m10-hud-pill warn">${esc(pair.camTag)}</span></div>
              </div>
              <div class="m10-ag-foot">
                <div>
                  <div class="m10-ag-title">${esc(pair.camLabel)}</div>
                  <div class="m10-ag-sub">${esc(pair.camStake)}</div>
                </div>
                <button class="m10-btn-outline" id="m10AgOpenPbBtn">${ICONS.clock}<span>打开历史录像</span></button>
              </div>
            </div>
          </div>

          <!-- Aerial UAV View -->
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">空中视角 · 无人机巡检影像</span>
              </div>
              <span class="m10-tag ok">影像已回传</span>
            </div>
            <div class="m10-ag-card-body">
              <div class="m10-feed-box">
                <canvas class="m10-feed-canvas" width="640" height="360" data-cam-id="${esc(pair.camId)}" data-scene-type="${esc(pair.sceneType)}" data-uav="1" data-alarm="1" data-alarm-label="${esc(pair.hazardTitle)}"></canvas>
                <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(pair.uavTaskId)}</span></div>
                <div class="m10-hud-tr"><span class="m10-hud-pill">${ICONS.drone}<span>最近巡检影像</span></span></div>
                <div class="m10-hud-bl"><span class="m10-hud-pill">${esc(pair.uavTime)}</span></div>
                <div class="m10-hud-br"><span class="m10-hud-pill">${esc(pair.uavPart)}</span></div>
              </div>
              <div class="m10-ag-foot">
                <div>
                  <div class="m10-ag-title">${esc(pair.uavTaskName)}</div>
                  <div class="m10-ag-sub">${esc(pair.uavFile)}</div>
                </div>
                <button class="m10-btn-outline" id="m10AgViewUavBtn">${ICONS.ext}<span>查看原巡检成果</span></button>
              </div>
            </div>
          </div>
        </div>

        <!-- Lower Split: Linked Spatial Record + Recheck -->
        <div class="m10-split-66-34">
          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">同点位关联记录</span>
              </div>
              <span class="m10-tag ok">已匹配</span>
            </div>
            <div class="m10-spatial-wrap">
              <div class="m10-spatial-thumb" id="m10SpatialThumbBox" title="点击放大查看点位空间关系">
                <canvas id="m10SpatialThumbCanvas" width="206" height="118" style="display:block;width:100%;height:100%;"></canvas>
                <div class="m10-hud-tl"><span class="m10-hud-pill">${ICONS.pin}<span>${esc(pair.siteName)}</span></span></div>
                <div class="m10-hud-tr"><span class="m10-hud-pill">点位示意</span></div>
              </div>
              <div style="min-width:0;">
                <table class="data-table m10-table">
                  <thead>
                    <tr>
                      <th>视角</th>
                      <th>来源记录</th>
                      <th>取证时间</th>
                      <th>关联部位</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style="font-weight:700;color:#eaf4ff;">固定视频</td>
                      <td>${esc(pair.camId)}</td>
                      <td>${esc(pair.camTime)}</td>
                      <td>${esc(pair.partName)}</td>
                    </tr>
                    <tr>
                      <td style="font-weight:700;color:#eaf4ff;">无人机巡检</td>
                      <td>${esc(pair.uavTaskId)}</td>
                      <td>${esc(pair.uavTime)}</td>
                      <td>${esc(pair.uavPart)}</td>
                    </tr>
                  </tbody>
                </table>
                <div class="m10-spatial-caption">${esc(pair.summary)}</div>
              </div>
            </div>
          </div>

          <div class="glass-panel">
            <div class="panel-header m10-panel-header">
              <div class="panel-title-group">
                <span class="panel-accent-bar"></span>
                <span class="panel-title">关联复核</span>
              </div>
              <span class="m10-tag info">关联隐患</span>
            </div>
            <div class="m10-inspector-body">
              <div style="display:flex;align-items:center;justify-content:space-between;">
                <strong style="font-size:15px;color:#ffffff;">${esc(pair.hazardTitle)}</strong>
                ${pair.recheckSent ? '<span class="m10-tag ok">已发起复核</span>' : ''}
              </div>
              <div class="m10-kv-list" style="border-bottom:none;padding-bottom:2px;">
                <div class="m10-kv-row"><span class="m10-kv-key" style="width:92px;">安全隐患编号</span><span class="m10-kv-val">${esc(pair.hazardId)}</span></div>
                <div class="m10-kv-row"><span class="m10-kv-key" style="width:92px;">来源告警编号</span><span class="m10-kv-val">${esc(pair.alarmId)}</span></div>
                ${pair.recheckSent ? `<div class="m10-kv-row"><span class="m10-kv-key" style="width:92px;">最近复核下发</span><span class="m10-kv-val" style="color:#4ade80;">${esc(pair.recheckTime)}</span></div>` : ''}
              </div>
              <div class="m10-btn-pair">
                <button class="m10-btn-query" id="m10AgRecheckBtn">${ICONS.link}<span>发起复核</span></button>
                <button class="m10-btn-outline" id="m10AgSafetyBtn">${ICONS.ext}<span>查看安全管理记录</span></button>
              </div>
              <div class="m10-info-hint">ⓘ 复核请求关联原隐患编号。</div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /* ------------------------------------------------------------------------
     MODALS (Edit Camera, Fullscreen Live/Playback, Groups, Screenshot, Safety, UAV, Spatial, Recheck)
     ------------------------------------------------------------------------ */
  function openEditCameraModal(cam) {
    if (!lastCtx) return;
    lastCtx.openModal(`编辑视频点位 — ${esc(cam.id)}`, `
      <div class="m10-form-grid">
        <div class="m10-form-item">
          <label>点位名称</label>
          <input id="m10EditName" type="text" value="${esc(cam.name)}" />
        </div>
        <div class="m10-form-item">
          <label>所属工区</label>
          <select id="m10EditSec">
            ${SECTIONS.map(s => `<option value="${s.name}" ${cam.section === s.name ? 'selected' : ''}>${s.name}</option>`).join('')}
          </select>
        </div>
        <div class="m10-form-item">
          <label>关联桩号</label>
          <input id="m10EditStake" type="text" value="${esc(cam.stake)}" />
        </div>
        <div class="m10-form-item">
          <label>布设部位</label>
          <input id="m10EditLoc" type="text" value="${esc(cam.location)}" />
        </div>
        <div class="m10-form-item">
          <label>监控用途</label>
          <select id="m10EditPurpose">
            ${PURPOSE_TYPES.map(p => `<option value="${p}" ${cam.purpose === p ? 'selected' : ''}>${p}</option>`).join('')}
          </select>
        </div>
        <div class="m10-form-item">
          <label>设备状态</label>
          <select id="m10EditStatus">
            ${STATUS_TYPES.map(st => `<option value="${st}" ${cam.status === st ? 'selected' : ''}>${st}</option>`).join('')}
          </select>
        </div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:8px;">
        <button class="m10-btn-outline" id="m10EditCancel">取消</button>
        <button class="m10-btn-query" id="m10EditSave">保存点位配置</button>
      </div>
    `);

    const modalBody = document.getElementById('modalBody');
    if (!modalBody) return;
    modalBody.querySelector('#m10EditCancel')?.addEventListener('click', () => lastCtx.closeModal());
    modalBody.querySelector('#m10EditSave')?.addEventListener('click', () => {
      const secName = modalBody.querySelector('#m10EditSec').value;
      const secObj = SECTION_BY_NAME[secName];
      cam.name = modalBody.querySelector('#m10EditName').value.trim() || cam.name;
      cam.section = secName;
      if (secObj) cam.sectionId = secObj.id;
      cam.stake = modalBody.querySelector('#m10EditStake').value.trim() || cam.stake;
      cam.location = modalBody.querySelector('#m10EditLoc').value.trim() || cam.location;
      cam.purpose = modalBody.querySelector('#m10EditPurpose').value;
      cam.status = modalBody.querySelector('#m10EditStatus').value;
      lastCtx.closeModal();
      lastCtx.showToast(`已更新点位 ${cam.id}（${cam.name}）配置`);
      renderCurrentPage();
    });
  }

  function openFullscreenCameraModal(cam, isPlayback) {
    if (!lastCtx) return;
    lastCtx.openModal(`${isPlayback ? '全屏录像回放' : '全屏实时监控'} — ${esc(cam.id)} (${esc(cam.name)})`, `
      <div class="m10-feed-box" style="aspect-ratio:16/9;">
        <canvas class="m10-feed-canvas" width="960" height="540" data-cam-id="${esc(cam.id)}" data-mode="${isPlayback ? 'playback' : 'live'}"></canvas>
        <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(cam.id)} · ${esc(cam.resolution)}</span></div>
        <div class="m10-hud-tr"><span class="m10-hud-pill">${isPlayback ? '历史回放全屏' : esc(cam.status)}</span></div>
        <div class="m10-hud-bl"><span class="m10-hud-pill" ${!isPlayback && cam.status === '在线' ? 'data-live-clock="1"' : ''}>${isPlayback ? esc(getPlaybackClockStr(uiState.playback)) : `2026-11-26 ${formatHms(liveClockSec)}`}</span></div>
      </div>
      <div class="detail-grid">
        <div class="detail-stat-card"><span>所属工区 / 桩号</span><strong>${esc(cam.section)} · ${esc(cam.stake)}</strong></div>
        <div class="detail-stat-card"><span>布设部位 / 用途</span><strong>${esc(cam.location)} · ${esc(cam.purpose)}</strong></div>
        <div class="detail-stat-card"><span>接入地址 / 来源</span><strong>${esc(cam.ip)} · ${esc(cam.source)}</strong></div>
      </div>
      ${cam.faultNote ? `<div class="m10-info-hint" style="border-color:rgba(250,204,21,0.45);color:#fde047;">⚠ 诊断提示：${esc(cam.faultNote)}</div>` : ''}
    `);
    refreshAllCanvases();
  }

  function openSaveGroupModal() {
    if (!lastCtx) return;
    const p = uiState.patrol;
    const activeCamIds = p.cellCameras.slice(0, p.layout);
    lastCtx.openModal('保存当前视频巡查组合', `
      <div class="m10-form-item">
        <label>新组合名称</label>
        <input id="m10NewGroupName" type="text" value="自定义巡查组合 ${p.groups.length + 1}" />
      </div>
      <div style="font-size:12.5px;color:#a9c6e8;">包含当前画面点位（${activeCamIds.length} 路）：</div>
      <div style="display:flex;flex-wrap:wrap;gap:6px;">
        ${activeCamIds.map(id => {
          const c = getCameraById(id);
          return `<span class="m10-tag info">${esc(c.id)} · ${esc(c.name)}</span>`;
        }).join('')}
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;margin-top:6px;">
        <button class="m10-btn-outline" id="m10GrpCancel">取消</button>
        <button class="m10-btn-query" id="m10GrpSave">确认保存组合</button>
      </div>
    `);
    const body = document.getElementById('modalBody');
    body?.querySelector('#m10GrpCancel')?.addEventListener('click', () => lastCtx.closeModal());
    body?.querySelector('#m10GrpSave')?.addEventListener('click', () => {
      const name = body.querySelector('#m10NewGroupName').value.trim();
      if (!name) return;
      const newId = `grp-custom-${Date.now()}`;
      const filled = [...activeCamIds];
      while (filled.length < 9) filled.push(CAMERAS[filled.length % CAMERAS.length].id);
      p.groups.push({ id: newId, name, builtIn: false, cameras: filled });
      p.groupId = newId;
      lastCtx.closeModal();
      lastCtx.showToast(`已保存视频组合「${name}」`);
      renderCurrentPage();
    });
  }

  function openManageGroupsModal() {
    if (!lastCtx) return;
    const p = uiState.patrol;
    lastCtx.openModal('常用视频组合管理', `
      <table class="data-table">
        <thead>
          <tr><th>组合名称</th><th>类型</th><th>配置路数</th><th>操作</th></tr>
        </thead>
        <tbody>
          ${p.groups.map(g => `
            <tr>
              <td style="font-weight:700;">${esc(g.name)}</td>
              <td><span class="m10-tag ${g.builtIn ? 'info' : 'ok'}">${g.builtIn ? '系统预设' : '自定义'}</span></td>
              <td>${g.cameras.length} 路</td>
              <td>
                <button class="m10-link-btn" data-mg-load="${esc(g.id)}">加载巡查</button>
                ${!g.builtIn ? `<button class="m10-link-btn" style="color:#f87171;margin-left:10px;" data-mg-del="${esc(g.id)}">删除</button>` : ''}
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `);
    const body = document.getElementById('modalBody');
    body?.querySelectorAll('[data-mg-load]').forEach(btn => {
      btn.addEventListener('click', () => {
        const g = p.groups.find(x => x.id === btn.dataset.mgLoad);
        if (g) {
          p.groupId = g.id;
          p.cellCameras = [...g.cameras];
          lastCtx.closeModal();
          renderCurrentPage();
        }
      });
    });
    body?.querySelectorAll('[data-mg-del]').forEach(btn => {
      btn.addEventListener('click', () => {
        p.groups = p.groups.filter(x => x.id !== btn.dataset.mgDel);
        if (p.groupId === btn.dataset.mgDel) p.groupId = p.groups[0].id;
        lastCtx.showToast('已删除自定义视频组合');
        openManageGroupsModal();
        renderCurrentPage();
      });
    });
  }

  function openScreenshotModal(cam) {
    if (!lastCtx) return;
    const canvas = document.getElementById('m10PbCanvas');
    let imgSrc = '';
    try {
      if (canvas) imgSrc = canvas.toDataURL('image/png');
    } catch (e) { /* fallback */ }
    const clockStr = getPlaybackClockStr(uiState.playback);
    lastCtx.openModal('历史录像截图取证', `
      <div style="border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.45);background:#041026;">
        ${imgSrc ? `<img src="${imgSrc}" style="width:100%;display:block;" alt="取证截图" />` : ''}
      </div>
      <div class="detail-grid">
        <div class="detail-stat-card"><span>取证设备</span><strong>${esc(cam.id)}</strong></div>
        <div class="detail-stat-card"><span>取证时间</span><strong>${esc(clockStr)}</strong></div>
        <div class="detail-stat-card"><span>取证状态</span><strong style="color:#4ade80;">已加盖数字水印</strong></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m10-btn-outline" id="m10SnapClose">关闭</button>
        <button class="m10-btn-query" id="m10SnapSave">保存至安全取证台账</button>
      </div>
    `);
    const body = document.getElementById('modalBody');
    body?.querySelector('#m10SnapClose')?.addEventListener('click', () => lastCtx.closeModal());
    body?.querySelector('#m10SnapSave')?.addEventListener('click', () => {
      lastCtx.closeModal();
      lastCtx.showToast(`截图取证已归档（${cam.id} · ${clockStr}）`);
    });
  }

  function openPlaybackSourceModal(cam) {
    if (!lastCtx) return;
    lastCtx.openModal(`录像来源与存储节点详情 — ${esc(cam.id)}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>接入来源</span><strong>原视频系统 · GB/T 28181</strong></div>
        <div class="detail-stat-card"><span>存储节点</span><strong>NVR-JH-02（二工区汇聚机房）</strong></div>
        <div class="detail-stat-card"><span>码流参数</span><strong>H.265 · 4096 kbps · 25 fps</strong></div>
      </div>
      <div class="m10-kv-list" style="border-bottom:none;">
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:110px;">设备编码</span><span class="m10-kv-val">${esc(cam.id)}（${esc(cam.ip)}）</span></div>
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:110px;">保存策略</span><span class="m10-kv-val">全天候连续录像保存 90 天，告警联动片段永久锁定</span></div>
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:110px;">时间同步</span><span class="m10-kv-val">北斗/NTP 校时正常（误差 &lt; 20 ms）</span></div>
      </div>
    `);
  }

  function openSafetyRecordModal(hazardId, alarmId, title, detail, sectionName) {
    if (!lastCtx) return;
    lastCtx.openModal(`安全管理联动台账 — ${esc(hazardId)}`, `
      <div class="detail-grid">
        <div class="detail-stat-card"><span>隐患编号</span><strong>${esc(hazardId)}</strong></div>
        <div class="detail-stat-card"><span>来源告警</span><strong>${esc(alarmId)}</strong></div>
        <div class="detail-stat-card"><span>整改状态</span><strong style="color:#facc15;">复查跟踪中</strong></div>
      </div>
      <div class="m10-kv-list" style="border-bottom:none;">
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:96px;">问题类别</span><span class="m10-kv-val">${esc(title)}</span></div>
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:96px;">所属工区</span><span class="m10-kv-val">${esc(sectionName)}</span></div>
        <div class="m10-kv-row"><span class="m10-kv-key" style="width:96px;">核查情况</span><span class="m10-kv-val">${esc(detail)}</span></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m10-btn-outline" id="m10SafClose">关闭</button>
        <button class="m10-btn-query" id="m10SafJump">进入安全管理模块</button>
      </div>
    `);
    const body = document.getElementById('modalBody');
    body?.querySelector('#m10SafClose')?.addEventListener('click', () => lastCtx.closeModal());
    body?.querySelector('#m10SafJump')?.addEventListener('click', () => {
      lastCtx.closeModal();
      lastCtx.switchModule('safety');
    });
  }

  function openUavEvidenceModal(pair) {
    if (!lastCtx) return;
    lastCtx.openModal(`原无人机巡检成果 — ${esc(pair.uavTaskId)}`, `
      <div class="m10-feed-box" style="aspect-ratio:16/9;">
        <canvas class="m10-feed-canvas" width="760" height="420" data-cam-id="${esc(pair.camId)}" data-scene-type="${esc(pair.sceneType)}" data-uav="1" data-alarm="1" data-alarm-label="${esc(pair.hazardTitle)}"></canvas>
        <div class="m10-hud-tl"><span class="m10-hud-pill">${esc(pair.uavTaskId)} · ${esc(pair.uavFile)}</span></div>
        <div class="m10-hud-bl"><span class="m10-hud-pill">${esc(pair.uavTime)}</span></div>
      </div>
      <div class="detail-grid">
        <div class="detail-stat-card"><span>巡检任务</span><strong>${esc(pair.uavTaskName)}</strong></div>
        <div class="detail-stat-card"><span>航点编号</span><strong>${esc(pair.uavPart)}</strong></div>
        <div class="detail-stat-card"><span>匹配隐患</span><strong>${esc(pair.hazardId)}</strong></div>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m10-btn-outline" id="m10UavClose">关闭</button>
        <button class="m10-btn-query" id="m10UavJump">跳转无人机巡检模块</button>
      </div>
    `);
    refreshAllCanvases();
    const body = document.getElementById('modalBody');
    body?.querySelector('#m10UavClose')?.addEventListener('click', () => lastCtx.closeModal());
    body?.querySelector('#m10UavJump')?.addEventListener('click', () => {
      lastCtx.closeModal();
      lastCtx.switchModule('uav', 'hazards');
    });
  }

  function openSpatialMapModal(pair) {
    if (!lastCtx) return;
    lastCtx.openModal(`同点位空间关系示意 — ${esc(pair.siteName)} · ${esc(pair.partName)}`, `
      <div style="border-radius:8px;overflow:hidden;border:1px solid rgba(56,189,248,0.45);background:#061836;">
        <canvas id="m10SpatialLargeCanvas" width="680" height="360" style="width:100%;display:block;"></canvas>
      </div>
      <div class="detail-grid">
        <div class="detail-stat-card"><span>固定视频点位</span><strong>${esc(pair.camId)}（地面视场角 78°）</strong></div>
        <div class="detail-stat-card"><span>无人机取证点位</span><strong>${esc(pair.uavTaskId)}（${esc(pair.uavPart)} · 航高 40m）</strong></div>
        <div class="detail-stat-card"><span>时空匹配误差</span><strong style="color:#4ade80;">空间重合 &gt; 92% · 时差 ${pair.timeDiffSec} 秒</strong></div>
      </div>
    `);
    const lg = document.getElementById('m10SpatialLargeCanvas');
    if (lg) drawSpatialThumbnail(lg, pair);
  }

  function openRecheckModal(pair) {
    if (!lastCtx) return;
    lastCtx.openModal(`发起空地联合复核 — ${esc(pair.hazardId)}`, `
      <div class="m10-form-grid">
        <div class="m10-form-item">
          <label>关联隐患编号</label>
          <input type="text" value="${esc(pair.hazardId)}" readonly />
        </div>
        <div class="m10-form-item">
          <label>复核工程位置</label>
          <input type="text" value="${esc(pair.section)} · ${esc(pair.siteName)} · ${esc(pair.partName)}" readonly />
        </div>
        <div class="m10-form-item">
          <label>地面联动摄像头</label>
          <input type="text" value="${esc(pair.camId)}（同步抓拍）" readonly />
        </div>
        <div class="m10-form-item">
          <label>调度无人机航线</label>
          <select id="m10RecheckRoute">
            <option value="自动复核航线 · ${esc(pair.uavPart)}">自动复核航线 · ${esc(pair.uavPart)}（最近机巢起飞）</option>
            <option value="全区段复核航线">全区段复核航线</option>
          </select>
        </div>
      </div>
      <div class="m10-form-item">
        <label>复核指令说明</label>
        <textarea id="m10RecheckNote">针对「${esc(pair.hazardTitle)}」发起空地同点位复核取证，确认现场整改闭环情况。</textarea>
      </div>
      <div style="display:flex;justify-content:flex-end;gap:10px;">
        <button class="m10-btn-outline" id="m10RcCancel">取消</button>
        <button class="m10-btn-query" id="m10RcSubmit">确认下发复核任务</button>
      </div>
    `);
    const body = document.getElementById('modalBody');
    body?.querySelector('#m10RcCancel')?.addEventListener('click', () => lastCtx.closeModal());
    body?.querySelector('#m10RcSubmit')?.addEventListener('click', () => {
      pair.recheckSent = true;
      pair.recheckTime = `2026-11-26 ${formatHms(liveClockSec)}`;
      lastCtx.closeModal();
      lastCtx.showToast(`已下发空地协同复核任务（关联隐患 ${pair.hazardId}）`);
      renderCurrentPage();
    });
  }

  /* ------------------------------------------------------------------------
     EVENT BINDINGS PER SUB-PAGE
     ------------------------------------------------------------------------ */
  function bindEvents(hostEl, subPageId, ctx) {
    if (subPageId === 'directory') {
      const f = uiState.directory;
      const applyFilters = () => {
        f.section = document.getElementById('m10DirSec')?.value || '';
        f.siteType = document.getElementById('m10DirSite')?.value || '';
        f.purpose = document.getElementById('m10DirPurpose')?.value || '';
        f.status = document.getElementById('m10DirStatus')?.value || '';
        f.keyword = document.getElementById('m10DirKeyword')?.value || '';
        f.page = 1;
        renderCurrentPage();
      };
      ['m10DirSec', 'm10DirSite', 'm10DirPurpose', 'm10DirStatus'].forEach(id => {
        document.getElementById(id)?.addEventListener('change', applyFilters);
      });
      document.getElementById('m10DirQueryBtn')?.addEventListener('click', applyFilters);
      document.getElementById('m10DirKeyword')?.addEventListener('keydown', e => {
        if (e.key === 'Enter') applyFilters();
      });
      document.getElementById('m10DirResetBtn')?.addEventListener('click', () => {
        f.section = '';
        f.siteType = '';
        f.purpose = '';
        f.status = '';
        f.keyword = '';
        f.page = 1;
        f.selectedId = 'CAM-YD-A01';
        renderCurrentPage();
        ctx.showToast('已重置摄像头筛选条件');
      });
      hostEl.querySelectorAll('[data-dir-select]').forEach(tr => {
        tr.addEventListener('click', () => {
          f.selectedId = tr.dataset.dirSelect;
          renderCurrentPage();
        });
      });
      hostEl.querySelectorAll('[data-dir-inspect]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          f.selectedId = btn.dataset.dirInspect;
          renderCurrentPage();
        });
      });
      hostEl.querySelectorAll('[data-dir-page]').forEach(btn => {
        btn.addEventListener('click', () => {
          const p = parseInt(btn.dataset.dirPage, 10);
          if (!isNaN(p) && p >= 1) {
            f.page = p;
            renderCurrentPage();
          }
        });
      });
      document.getElementById('m10EditCamBtn')?.addEventListener('click', () => {
        openEditCameraModal(getCameraById(f.selectedId));
      });
      document.getElementById('m10GoPatrolBtn')?.addEventListener('click', () => {
        uiState.patrol.cellCameras[uiState.patrol.activeCell] = f.selectedId;
        ctx.switchModule('video', 'patrol');
      });
      document.getElementById('m10GoPlaybackBtn')?.addEventListener('click', () => {
        const cam = getCameraById(f.selectedId);
        uiState.playback.camId = cam.status === '离线' ? 'CAM-YD-A01' : cam.id;
        ctx.switchModule('video', 'playback');
      });
    } else if (subPageId === 'patrol') {
      const p = uiState.patrol;
      document.getElementById('m10PatrolSec')?.addEventListener('change', e => {
        p.section = e.target.value;
        renderCurrentPage();
      });
      const switchGroup = gid => {
        const g = p.groups.find(x => x.id === gid);
        if (!g) return;
        p.groupId = g.id;
        p.cellCameras = [...g.cameras];
        p.activeCell = 0;
        renderCurrentPage();
      };
      document.getElementById('m10PatrolGroupSel')?.addEventListener('change', e => switchGroup(e.target.value));
      hostEl.querySelectorAll('[data-pick-group]').forEach(el => {
        el.addEventListener('click', () => switchGroup(el.dataset.pickGroup));
      });
      document.getElementById('m10PatrolInterval')?.addEventListener('change', e => {
        p.intervalSec = parseInt(e.target.value, 10) || 30;
        p.tourRemaining = p.intervalSec;
        renderCurrentPage();
      });
      hostEl.querySelectorAll('[data-patrol-layout]').forEach(btn => {
        btn.addEventListener('click', () => {
          p.layout = parseInt(btn.dataset.patrolLayout, 10) || 4;
          if (p.activeCell >= p.layout) p.activeCell = 0;
          renderCurrentPage();
        });
      });
      hostEl.querySelectorAll('[data-patrol-cell]').forEach(card => {
        card.addEventListener('click', e => {
          if (e.target.closest('[data-patrol-fs]')) return;
          p.activeCell = parseInt(card.dataset.patrolCell, 10) || 0;
          renderCurrentPage();
        });
      });
      hostEl.querySelectorAll('[data-patrol-fs]').forEach(btn => {
        btn.addEventListener('click', e => {
          e.stopPropagation();
          openFullscreenCameraModal(getCameraById(btn.dataset.patrolFs), false);
        });
      });
      document.getElementById('m10ToggleTourBtn')?.addEventListener('click', () => {
        p.tourRunning = !p.tourRunning;
        p.tourRemaining = p.intervalSec;
        ctx.showToast(p.tourRunning ? `已开启自动轮巡（每 ${p.intervalSec} 秒切换）` : '已停止自动轮巡');
        renderCurrentPage();
      });
      document.getElementById('m10SaveGroupBtn')?.addEventListener('click', openSaveGroupModal);
      document.getElementById('m10ManageGroupsBtn')?.addEventListener('click', openManageGroupsModal);
      document.getElementById('m10PatrolSearch')?.addEventListener('input', e => {
        p.search = e.target.value;
        const valLen = e.target.value.length;
        renderCurrentPage();
        const inp = document.getElementById('m10PatrolSearch');
        if (inp) {
          inp.focus();
          inp.setSelectionRange(valLen, valLen);
        }
      });
      hostEl.querySelectorAll('[data-load-cam]').forEach(row => {
        row.addEventListener('click', () => {
          const cid = row.dataset.loadCam;
          p.cellCameras[p.activeCell] = cid;
          ctx.showToast(`已将 ${cid} 加载至第 ${p.activeCell + 1} 画面`);
          renderCurrentPage();
        });
      });
      document.getElementById('m10PatrolOpenDirBtn')?.addEventListener('click', () => ctx.switchModule('video', 'directory'));
      document.getElementById('m10TreeToDirBtn')?.addEventListener('click', () => ctx.switchModule('video', 'directory'));
    } else if (subPageId === 'playback') {
      const pb = uiState.playback;
      document.getElementById('m10PbCamSel')?.addEventListener('change', e => {
        pb.camId = e.target.value;
        renderCurrentPage();
      });
      document.getElementById('m10PbDateSel')?.addEventListener('change', e => {
        pb.date = e.target.value;
        renderCurrentPage();
      });
      document.getElementById('m10PbRangeSel')?.addEventListener('change', e => {
        pb.range = e.target.value;
        renderCurrentPage();
      });
      document.getElementById('m10PbQueryBtn')?.addEventListener('click', () => {
        renderCurrentPage();
        ctx.showToast(`已加载 ${pb.camId}（${pb.date} ${pb.range}）录像片段`);
      });
      document.getElementById('m10PbResetBtn')?.addEventListener('click', () => {
        pb.camId = 'CAM-YD-A01';
        pb.date = '2026-11-26';
        pb.range = '09:00–10:00';
        pb.clipIdx = 1;
        pb.secInClip = 752;
        pb.playing = false;
        pb.speed = 1;
        renderCurrentPage();
      });
      document.getElementById('m10PbPlayBtn')?.addEventListener('click', () => {
        pb.playing = !pb.playing;
        renderCurrentPage();
      });
      document.getElementById('m10PbScrubber')?.addEventListener('input', e => {
        pb.secInClip = parseInt(e.target.value, 10) || 0;
        syncPlaybackWidgets();
        refreshAllCanvases();
      });
      document.getElementById('m10PbSpeedSel')?.addEventListener('change', e => {
        pb.speed = parseFloat(e.target.value) || 1;
        ctx.showToast(`回放倍速已切换为 ${pb.speed}x`);
      });
      document.getElementById('m10PbSnapBtn')?.addEventListener('click', () => {
        openScreenshotModal(getCameraById(pb.camId));
      });
      document.getElementById('m10PbFsBtn')?.addEventListener('click', () => {
        openFullscreenCameraModal(getCameraById(pb.camId), true);
      });
      hostEl.querySelectorAll('[data-pick-clip]').forEach(el => {
        el.addEventListener('click', () => {
          pb.clipIdx = parseInt(el.dataset.pickClip, 10) || 0;
          pb.secInClip = 0;
          renderCurrentPage();
        });
      });
      const seekToAlarm = () => {
        const alarm = getPlaybackAlarmForCamera(pb.camId);
        pb.clipIdx = alarm.alarmClipIdx;
        pb.secInClip = alarm.alarmSecInClip;
        renderCurrentPage();
        ctx.showToast(`已精确定位至告警时刻 ${alarm.alarmTime}`);
      };
      document.getElementById('m10SeekAlarmBtn')?.addEventListener('click', seekToAlarm);
      document.getElementById('m10TlAlarmBadge')?.addEventListener('click', e => {
        e.stopPropagation();
        seekToAlarm();
      });
      document.getElementById('m10TlAlarmDot')?.addEventListener('click', e => {
        e.stopPropagation();
        seekToAlarm();
      });
      document.getElementById('m10TlTrack')?.addEventListener('click', e => {
        const rect = e.currentTarget.getBoundingClientRect();
        const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
        const totalSec = Math.floor(ratio * 3600);
        pb.clipIdx = Math.min(3, Math.floor(totalSec / 900));
        pb.secInClip = totalSec - pb.clipIdx * 900;
        renderCurrentPage();
      });
      document.getElementById('m10PbSourceBtn')?.addEventListener('click', () => {
        openPlaybackSourceModal(getCameraById(pb.camId));
      });
      document.getElementById('m10OpenSafetyBtn')?.addEventListener('click', () => {
        const cam = getCameraById(pb.camId);
        const alarm = getPlaybackAlarmForCamera(pb.camId);
        openSafetyRecordModal(alarm.hazardId, alarm.alarmId, alarm.title, alarm.safetyDetail, cam.section);
      });
    } else if (subPageId === 'airground') {
      const ag = uiState.airground;
      const matchPair = (preferSection) => {
        const found = AIRGROUND_PAIRS.find(p =>
          (!ag.section || p.section === ag.section) &&
          p.siteName === ag.siteName &&
          p.partName === ag.partName
        ) || (preferSection && ag.section ? AIRGROUND_PAIRS.find(p => p.section === ag.section) : null)
          || AIRGROUND_PAIRS.find(p => p.siteName === ag.siteName)
          || AIRGROUND_PAIRS[0];
        ag.pairId = found.id;
        ag.section = found.section;
        ag.siteName = found.siteName;
        ag.partName = found.partName;
        ag.date = found.date;
      };
      document.getElementById('m10AgSec')?.addEventListener('change', e => {
        ag.section = e.target.value;
        matchPair(true);
        renderCurrentPage();
      });
      document.getElementById('m10AgSite')?.addEventListener('change', e => {
        ag.siteName = e.target.value;
        const bySite = AIRGROUND_PAIRS.find(p => p.siteName === ag.siteName);
        if (bySite) {
          ag.section = bySite.section;
          ag.partName = bySite.partName;
          ag.date = bySite.date;
          ag.pairId = bySite.id;
        }
        renderCurrentPage();
      });
      document.getElementById('m10AgPart')?.addEventListener('change', e => {
        ag.partName = e.target.value;
        const byPart = AIRGROUND_PAIRS.find(p => p.partName === ag.partName);
        if (byPart) {
          ag.section = byPart.section;
          ag.siteName = byPart.siteName;
          ag.date = byPart.date;
          ag.pairId = byPart.id;
        }
        renderCurrentPage();
      });
      document.getElementById('m10AgDate')?.addEventListener('change', e => {
        ag.date = e.target.value;
        const byDate = AIRGROUND_PAIRS.find(p => p.date === ag.date);
        if (byDate && ag.date === '2026-11-25') {
          ag.pairId = byDate.id;
          ag.section = byDate.section;
          ag.siteName = byDate.siteName;
          ag.partName = byDate.partName;
        }
        renderCurrentPage();
      });
      document.getElementById('m10AgQueryBtn')?.addEventListener('click', () => {
        matchPair(false);
        renderCurrentPage();
        const p = AIRGROUND_PAIRS.find(x => x.id === ag.pairId) || AIRGROUND_PAIRS[0];
        ctx.showToast(`已匹配同点位影像：${p.camId} ↔ ${p.uavTaskId}`);
      });
      const getCurrentPair = () => AIRGROUND_PAIRS.find(p => p.id === ag.pairId) || AIRGROUND_PAIRS[0];
      document.getElementById('m10AgOpenPbBtn')?.addEventListener('click', () => {
        const pair = getCurrentPair();
        uiState.playback.camId = pair.camId;
        uiState.playback.date = pair.date;
        uiState.playback.clipIdx = 1;
        uiState.playback.secInClip = 752;
        ctx.switchModule('video', 'playback');
      });
      document.getElementById('m10AgViewUavBtn')?.addEventListener('click', () => {
        openUavEvidenceModal(getCurrentPair());
      });
      document.getElementById('m10SpatialThumbBox')?.addEventListener('click', () => {
        openSpatialMapModal(getCurrentPair());
      });
      document.getElementById('m10AgRecheckBtn')?.addEventListener('click', () => {
        openRecheckModal(getCurrentPair());
      });
      document.getElementById('m10AgSafetyBtn')?.addEventListener('click', () => {
        const pair = getCurrentPair();
        openSafetyRecordModal(
          pair.hazardId,
          pair.alarmId,
          pair.hazardTitle,
          `${pair.summary} 已通过固定视频与无人机同点位协同核查。`,
          pair.section
        );
      });
    }
  }

  /* ------------------------------------------------------------------------
     SECTION LINKAGE & PAGE RENDER DRIVER
     ------------------------------------------------------------------------ */
  function syncSectionToUi(secId) {
    const secName = secId && SECTION_BY_ID[secId] ? SECTION_BY_ID[secId].name : '';
    uiState.directory.section = secName;
    uiState.directory.page = 1;
    uiState.patrol.section = secName;

    if (secName) {
      const secCams = CAMERAS.filter(c => c.section === secName);
      if (secCams.length > 0) {
        uiState.directory.selectedId = secCams[0].id;
        const onlineSecCam = secCams.find(c => c.status !== '离线');
        if (onlineSecCam) uiState.playback.camId = onlineSecCam.id;
      }
      const agMatch = AIRGROUND_PAIRS.find(p => p.section === secName);
      if (agMatch) {
        uiState.airground.section = agMatch.section;
        uiState.airground.siteName = agMatch.siteName;
        uiState.airground.partName = agMatch.partName;
        uiState.airground.date = agMatch.date;
        uiState.airground.pairId = agMatch.id;
      } else {
        uiState.airground.section = secName;
      }
    }
  }

  function renderCurrentPage() {
    if (!lastHost || !lastCtx) return;
    renderPage(lastHost, lastSubPageId, lastCtx);
  }

  function renderPage(hostEl, subPageId, ctx) {
    ensureStyles();
    cleanupTimers();

    lastHost = hostEl;
    lastCtx = ctx;
    lastSubPageId = SUB_PAGES.some(p => p.id === subPageId) ? subPageId : 'directory';

    // Sync top work-section selection if changed since last render
    const curSecId = ctx.state && ctx.state.activeSectionId ? ctx.state.activeSectionId : null;
    if (lastSyncedSecId !== curSecId) {
      lastSyncedSecId = curSecId;
      syncSectionToUi(curSecId);
    }

    let html = '';
    if (lastSubPageId === 'directory') html = renderDirectoryPage();
    else if (lastSubPageId === 'patrol') html = renderPatrolPage();
    else if (lastSubPageId === 'playback') html = renderPlaybackPage();
    else if (lastSubPageId === 'airground') html = renderAirGroundPage();

    hostEl.innerHTML = html;
    bindEvents(hostEl, lastSubPageId, ctx);
    startAnimationEngine(lastSubPageId);
  }

  /* ------------------------------------------------------------------------
     MODULE REGISTRATION
     ------------------------------------------------------------------------ */
  window.JIHEI_PLATFORM.registerModule({
    id: 'video',
    name: '视频监控',
    subPages: SUB_PAGES,

    getCesiumMode() {
      return 'opaque';
    },

    render(hostEl, subPageId, ctx) {
      renderPage(hostEl, subPageId, ctx);
    },

    onSectionChange(secId) {
      if (lastSyncedSecId !== (secId || null)) {
        lastSyncedSecId = secId || null;
        syncSectionToUi(secId);
        renderCurrentPage();
      }
    },

    onLeave() {
      cleanupTimers();
      uiState.patrol.tourRunning = false;
      uiState.playback.playing = false;
      if (lastHost) lastHost.innerHTML = '';
      lastHost = null;
      lastCtx = null;
    }
  });
})();
