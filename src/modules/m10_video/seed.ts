import { count } from 'drizzle-orm';
import { db, type Database } from '@/db';
import {
  videoCameras,
  videoPatrolGroups,
  videoPlaybackAlarms,
  videoAirGroundPairs,
  videoAirGroundReviews,
} from '@/db/schema/domains/m10';
import { buildPlaybackSegments } from './types';

function buildCamerasSeed(): Array<typeof videoCameras.$inferInsert> {
  const raw = [
    // Page 1 (Rows 1–7, exact schematic order)
    { id: 'CAM-YD-A01', sectionId: 'sec2', sectionName: '二工区', name: '料场示例A·消防通道', stake: 'K28+400', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.101', faultNote: '' },
    { id: 'CAM-YD-A03', sectionId: 'sec2', sectionName: '二工区', name: '料场示例A·主入口', stake: 'K28+360', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.103', faultNote: '' },
    { id: 'CAM-LC-A03', sectionId: 'sec2', sectionName: '二工区', name: '梁场示例A·作业区', stake: 'K29+180', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.108', faultNote: '' },
    { id: 'CAM-BT-A01', sectionId: 'sec1', sectionName: '一工区', name: '保通示例段·导改入口', stake: 'K16+720', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.11.101', faultNote: '' },
    { id: 'CAM-QL-A02', sectionId: 'sec2', sectionName: '二工区', name: '桥梁示例A·2号墩', stake: 'K26+740', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '图像异常', sceneType: 'bridgePier', lastTime: '2026-11-26 10:42:30', source: '原视频系统', resolution: '1920×1080', ip: '10.12.22.102', faultNote: '视频流编码卡顿，定格于 10:42:30 最后有效帧' },
    { id: 'CAM-YD-B02', sectionId: 'sec4', sectionName: '四工区', name: '料场示例B·运输便道', stake: 'K50+180', location: '场内运输通道', siteType: '料场', purpose: '场内交通巡查', status: '离线', sceneType: 'yardRoad', lastTime: '2026-11-26 08:19:04', source: '原视频系统', resolution: '1920×1080', ip: '10.12.44.102', faultNote: '场内供电箱检修断电，设备离线' },
    { id: 'CAM-BH-A01', sectionId: 'sec4', sectionName: '四工区', name: '拌合站示例A·出入口', stake: 'K51+200', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.46.101', faultNote: '' },

    // 一工区 (sec1) remaining 7 (total 8: 7 在线, 1 离线)
    { id: 'CAM-BT-A02', sectionId: 'sec1', sectionName: '一工区', name: '保通示例段·北端分流口', stake: 'K18+050', location: '导改分流区', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.11.102', faultNote: '' },
    { id: 'CAM-YD-101', sectionId: 'sec1', sectionName: '一工区', name: '一工区料场·钢筋棚西侧', stake: 'K08+320', location: '钢筋加工棚', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.14.101', faultNote: '' },
    { id: 'CAM-YD-102', sectionId: 'sec1', sectionName: '一工区', name: '一工区料场·地磅入口', stake: 'K08+280', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.14.102', faultNote: '' },
    { id: 'CAM-QL-101', sectionId: 'sec1', sectionName: '一工区', name: '明水河中桥·0号台', stake: 'K11+640', location: '桥台作业面', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.12.101', faultNote: '' },
    { id: 'CAM-LJ-101', sectionId: 'sec1', sectionName: '一工区', name: '一工区路基·K06高填方', stake: 'K06+450', location: '路基边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.15.101', faultNote: '' },
    { id: 'CAM-BH-101', sectionId: 'sec1', sectionName: '一工区', name: '一工区水稳站·出料区', stake: 'K14+120', location: '拌合站出料口', siteType: '拌合站', purpose: '场内交通巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.16.101', faultNote: '' },
    { id: 'CAM-BT-103', sectionId: 'sec1', sectionName: '一工区', name: '一工区K21·便道平交口', stake: 'K21+300', location: '施工便道口', siteType: '保通段', purpose: '施工保通', status: '离线', sceneType: 'highway', lastTime: '2026-11-26 09:05:40', source: '原视频系统', resolution: '1920×1080', ip: '10.12.11.103', faultNote: '无线网桥信号衰减，等待现场复位' },

    // 二工区 (sec2) remaining 6 (total 10: 9 在线, 1 图像异常)
    { id: 'CAM-YD-A02', sectionId: 'sec2', sectionName: '二工区', name: '料场示例A·骨料区北侧', stake: 'K28+440', location: '骨料料仓', siteType: '料场', purpose: '场内交通巡查', status: '在线', sceneType: 'yardRoad', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.102', faultNote: '' },
    { id: 'CAM-LC-A01', sectionId: 'sec2', sectionName: '二工区', name: '梁场示例A·张拉区', stake: 'K29+120', location: '张拉压浆棚', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.24.106', faultNote: '' },
    { id: 'CAM-LC-A02', sectionId: 'sec2', sectionName: '二工区', name: '梁场示例A·存梁台座', stake: 'K29+240', location: '存梁区南侧', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.24.107', faultNote: '' },
    { id: 'CAM-QL-A01', sectionId: 'sec2', sectionName: '二工区', name: '桥梁示例A·1号墩', stake: 'K26+680', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.22.101', faultNote: '' },
    { id: 'CAM-BT-201', sectionId: 'sec2', sectionName: '二工区', name: '二工区K34·跨线保通段', stake: 'K34+150', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.21.101', faultNote: '' },
    { id: 'CAM-BH-201', sectionId: 'sec2', sectionName: '二工区', name: '二工区拌合站·料仓入口', stake: 'K38+600', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.26.101', faultNote: '' },

    // 三工区 (sec3) 8 (7 在线, 1 图像异常)
    { id: 'CAM-LJ-301', sectionId: 'sec3', sectionName: '三工区', name: '路基示例段·K52高边坡', stake: 'K52+400', location: '深挖路堑边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.35.101', faultNote: '' },
    { id: 'CAM-LJ-302', sectionId: 'sec3', sectionName: '三工区', name: '三工区路基·K56取土场', stake: 'K56+180', location: '场内运输通道', siteType: '路基边坡', purpose: '场内交通巡查', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.35.102', faultNote: '' },
    { id: 'CAM-YD-301', sectionId: 'sec3', sectionName: '三工区', name: '三工区料场·东侧通道', stake: 'K58+900', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.34.101', faultNote: '' },
    { id: 'CAM-LC-301', sectionId: 'sec3', sectionName: '三工区', name: '三工区梁场·架桥机通道', stake: 'K61+350', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.34.105', faultNote: '' },
    { id: 'CAM-QL-301', sectionId: 'sec3', sectionName: '三工区', name: '通肯河大桥·4号墩', stake: 'K64+210', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '图像异常', sceneType: 'bridgePier', lastTime: '2026-11-26 10:39:18', source: '原视频系统', resolution: '1920×1080', ip: '10.12.32.104', faultNote: '镜头起雾伴随偶发花屏，已触发维护提醒' },
    { id: 'CAM-QL-302', sectionId: 'sec3', sectionName: '三工区', name: '通肯河大桥·5号墩', stake: 'K64+280', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.32.105', faultNote: '' },
    { id: 'CAM-BT-301', sectionId: 'sec3', sectionName: '三工区', name: '三工区K68·保通限速点', stake: 'K68+420', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.31.101', faultNote: '' },
    { id: 'CAM-BH-301', sectionId: 'sec3', sectionName: '三工区', name: '三工区拌合站·地磅口', stake: 'K70+150', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.36.101', faultNote: '' },

    // 四工区 (sec4) remaining 6 (total 8: 7 在线, 1 离线)
    { id: 'CAM-YD-B01', sectionId: 'sec4', sectionName: '四工区', name: '料场示例B·消防通道', stake: 'K75+400', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.44.101', faultNote: '' },
    { id: 'CAM-BH-A02', sectionId: 'sec4', sectionName: '四工区', name: '拌合站示例A·料仓棚', stake: 'K51+260', location: '骨料上料区', siteType: '拌合站', purpose: '场内交通巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.46.102', faultNote: '' },
    { id: 'CAM-QL-401', sectionId: 'sec4', sectionName: '四工区', name: '四工区分离立交·主墩', stake: 'K82+600', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.42.101', faultNote: '' },
    { id: 'CAM-LC-401', sectionId: 'sec4', sectionName: '四工区', name: '四工区梁场·制梁台座', stake: 'K86+120', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.44.108', faultNote: '' },
    { id: 'CAM-BT-401', sectionId: 'sec4', sectionName: '四工区', name: '四工区K90·保通导改段', stake: 'K90+380', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.41.101', faultNote: '' },
    { id: 'CAM-LJ-401', sectionId: 'sec4', sectionName: '四工区', name: '四工区路基·K94填筑面', stake: 'K94+100', location: '路基填筑区', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.45.101', faultNote: '' },

    // 五工区 (sec5) 7 (6 在线, 1 离线)
    { id: 'CAM-YD-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区料场·主通道', stake: 'K101+200', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.54.101', faultNote: '' },
    { id: 'CAM-YD-502', sectionId: 'sec5', sectionName: '五工区', name: '五工区料场·北门岗', stake: 'K101+150', location: '料场门岗', siteType: '料场', purpose: '出入口巡查', status: '在线', sceneType: 'gate', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.54.102', faultNote: '' },
    { id: 'CAM-QL-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区互通匝道·3号墩', stake: 'K106+800', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.52.103', faultNote: '' },
    { id: 'CAM-LC-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区梁场·龙门吊区', stake: 'K110+400', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.54.106', faultNote: '' },
    { id: 'CAM-BH-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区水稳站·门岗', stake: 'K113+600', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.56.101', faultNote: '' },
    { id: 'CAM-BT-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区K116·跨线导改', stake: 'K116+900', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.51.101', faultNote: '' },
    { id: 'CAM-LJ-501', sectionId: 'sec5', sectionName: '五工区', name: '五工区路基·K119边坡', stake: 'K119+300', location: '路基边坡', siteType: '路基边坡', purpose: '路基边坡监测', status: '离线', sceneType: 'subgrade', lastTime: '2026-11-26 07:48:11', source: '原视频系统', resolution: '1920×1080', ip: '10.12.55.101', faultNote: '太阳能供电控制器欠压休眠' },

    // 六工区 (sec6) 7 (7 在线)
    { id: 'CAM-BT-601', sectionId: 'sec6', sectionName: '六工区', name: '建华枢纽·南侧保通口', stake: 'K125+400', location: '施工导改段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.61.101', faultNote: '' },
    { id: 'CAM-BT-602', sectionId: 'sec6', sectionName: '六工区', name: '建华枢纽·北安衔接段', stake: 'K144+200', location: '终点衔接段', siteType: '保通段', purpose: '施工保通', status: '在线', sceneType: 'highway', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.61.102', faultNote: '' },
    { id: 'CAM-QL-601', sectionId: 'sec6', sectionName: '六工区', name: '建华枢纽主线桥·6号墩', stake: 'K132+500', location: '桥墩作业平台', siteType: '桥梁', purpose: '临边防护巡查', status: '在线', sceneType: 'bridgePier', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.62.101', faultNote: '' },
    { id: 'CAM-YD-601', sectionId: 'sec6', sectionName: '六工区', name: '六工区料场·消防通道', stake: 'K129+800', location: '料棚东侧', siteType: '料场', purpose: '消防通道巡查', status: '在线', sceneType: 'yardLane', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.64.101', faultNote: '' },
    { id: 'CAM-LC-601', sectionId: 'sec6', sectionName: '六工区', name: '六工区梁场·存梁区', stake: 'K136+100', location: '预制梁作业区', siteType: '梁场', purpose: '梁场作业巡查', status: '在线', sceneType: 'beamYard', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '2560×1440', ip: '10.12.64.105', faultNote: '' },
    { id: 'CAM-BH-601', sectionId: 'sec6', sectionName: '六工区', name: '六工区拌合站·出入口', stake: 'K139+450', location: '场站门岗', siteType: '拌合站', purpose: '出入口巡查', status: '在线', sceneType: 'batchPlant', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.66.101', faultNote: '' },
    { id: 'CAM-LJ-601', sectionId: 'sec6', sectionName: '六工区', name: '六工区路基·K142路床', stake: 'K142+800', location: '路基填筑区', siteType: '路基边坡', purpose: '路基边坡监测', status: '在线', sceneType: 'subgrade', lastTime: '2026-11-26 10:45:12', source: '原视频系统', resolution: '1920×1080', ip: '10.12.65.101', faultNote: '' },
  ];

  return raw.map((c, idx) => ({
    ...c,
    sortOrder: idx + 1,
  }));
}

function buildPatrolGroupsSeed(): Array<typeof videoPatrolGroups.$inferInsert> {
  return [
    {
      id: 'grp-key',
      name: '重点施工点位',
      builtIn: true,
      cameraIds: [
        'CAM-YD-A01',
        'CAM-LC-A03',
        'CAM-BT-A01',
        'CAM-QL-A02',
        'CAM-YD-A03',
        'CAM-BH-A01',
        'CAM-LJ-301',
        'CAM-BT-A02',
        'CAM-QL-601',
      ],
      sortOrder: 1,
    },
    {
      id: 'grp-yard',
      name: '料场及场站',
      builtIn: true,
      cameraIds: [
        'CAM-YD-A01',
        'CAM-YD-A03',
        'CAM-BH-A01',
        'CAM-YD-B01',
        'CAM-LC-A03',
        'CAM-YD-101',
        'CAM-BH-201',
        'CAM-YD-501',
        'CAM-YD-601',
      ],
      sortOrder: 2,
    },
    {
      id: 'grp-traffic',
      name: '施工保通',
      builtIn: true,
      cameraIds: [
        'CAM-BT-A01',
        'CAM-BT-A02',
        'CAM-BT-201',
        'CAM-BT-301',
        'CAM-BT-401',
        'CAM-BT-501',
        'CAM-BT-601',
        'CAM-BT-602',
        'CAM-BT-103',
      ],
      sortOrder: 3,
    },
  ];
}

function buildPlaybackAlarmsSeed(): Array<typeof videoPlaybackAlarms.$inferInsert> {
  return [
    {
      id: 'VAI-20261126-014',
      cameraId: 'CAM-YD-A01',
      recordDate: '2026-11-26',
      timeRange: '09:00–10:00',
      title: '消防通道占用',
      status: '已关联',
      alarmTime: '2026-11-26 09:27:32',
      alarmClipIdx: 1,
      alarmSecInClip: 752,
      clipWindow: '09:27:00 – 09:28:00',
      hazardId: 'AQ-202611-041',
      note: '处理记录来自安全管理。',
      safetyDetail: '二工区料场示例A东侧消防通道右侧发现临时堆放预制块及模板占道，已派员现场清理并建立24小时视频复核机制。',
      segments: buildPlaybackSegments('09:00–10:00', 1),
      sortOrder: 1,
    },
    {
      id: 'VAI-20261126-009',
      cameraId: 'CAM-BT-A01',
      recordDate: '2026-11-26',
      timeRange: '09:00–10:00',
      title: '导改入口车辆缓行',
      status: '已关联',
      alarmTime: '2026-11-26 09:18:45',
      alarmClipIdx: 1,
      alarmSecInClip: 225,
      clipWindow: '09:18:10 – 09:19:30',
      hazardId: 'AQ-202611-036',
      note: '处理记录来自安全管理。',
      safetyDetail: '一工区保通示例段导改入口早高峰大型运输车占道减速，现场安全员已引导恢复双车道通行。',
      segments: buildPlaybackSegments('09:00–10:00', 1),
      sortOrder: 2,
    },
    {
      id: 'VAI-20261126-011',
      cameraId: 'CAM-QL-A02',
      recordDate: '2026-11-26',
      timeRange: '09:00–10:00',
      title: '临边防护异常告警',
      status: '已关联',
      alarmTime: '2026-11-26 09:22:15',
      alarmClipIdx: 1,
      alarmSecInClip: 435,
      clipWindow: '09:21:40 – 09:22:50',
      hazardId: 'AQ-202611-018',
      note: '处理记录来自安全管理。',
      safetyDetail: '二工区桥梁示例A 2号墩作业平台西侧临边护栏疑似缺失，已同步触发无人机复查取证。',
      segments: buildPlaybackSegments('09:00–10:00', 1),
      sortOrder: 3,
    },
  ];
}

function buildAirGroundPairsSeed(): Array<typeof videoAirGroundPairs.$inferInsert> {
  return [
    {
      id: 'AG-01',
      sectionId: 'sec2',
      sectionName: '二工区',
      siteName: '料场示例A',
      partName: '消防通道',
      evidenceDate: '2026-11-26',
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
      recheckTime: '',
      sortOrder: 1,
    },
    {
      id: 'AG-02',
      sectionId: 'sec1',
      sectionName: '一工区',
      siteName: '保通示例段',
      partName: '导改入口',
      evidenceDate: '2026-11-26',
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
      recheckTime: '',
      sortOrder: 2,
    },
    {
      id: 'AG-03',
      sectionId: 'sec2',
      sectionName: '二工区',
      siteName: '桥梁示例A',
      partName: '2号墩作业平台',
      evidenceDate: '2026-11-26',
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
      recheckTime: '2026-11-26 08:45:00',
      sortOrder: 3,
    },
    {
      id: 'AG-04',
      sectionId: 'sec3',
      sectionName: '三工区',
      siteName: '路基示例段',
      partName: 'K52高边坡',
      evidenceDate: '2026-11-26',
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
      recheckTime: '',
      sortOrder: 4,
    },
    {
      id: 'AG-05',
      sectionId: 'sec4',
      sectionName: '四工区',
      siteName: '料场示例B',
      partName: '消防通道',
      evidenceDate: '2026-11-25',
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
      recheckTime: '2026-11-25 10:12:00',
      sortOrder: 5,
    },
  ];
}

export async function seedM10(dbInstance: Database = db): Promise<void> {
  const camRows = buildCamerasSeed();
  for (const row of camRows) {
    await dbInstance
      .insert(videoCameras)
      .values(row)
      .onConflictDoUpdate({
        target: videoCameras.id,
        set: {
          sectionId: row.sectionId,
          sectionName: row.sectionName,
          name: row.name,
          stake: row.stake,
          location: row.location,
          siteType: row.siteType,
          purpose: row.purpose,
          status: row.status,
          sceneType: row.sceneType,
          lastTime: row.lastTime,
          source: row.source,
          resolution: row.resolution,
          ip: row.ip,
          faultNote: row.faultNote,
          sortOrder: row.sortOrder,
        },
      });
  }

  const groupRows = buildPatrolGroupsSeed();
  for (const row of groupRows) {
    await dbInstance
      .insert(videoPatrolGroups)
      .values(row)
      .onConflictDoUpdate({
        target: videoPatrolGroups.id,
        set: {
          name: row.name,
          builtIn: row.builtIn,
          cameraIds: row.cameraIds,
          sortOrder: row.sortOrder,
        },
      });
  }

  const alarmRows = buildPlaybackAlarmsSeed();
  for (const row of alarmRows) {
    await dbInstance
      .insert(videoPlaybackAlarms)
      .values(row)
      .onConflictDoUpdate({
        target: videoPlaybackAlarms.id,
        set: {
          cameraId: row.cameraId,
          recordDate: row.recordDate,
          timeRange: row.timeRange,
          title: row.title,
          status: row.status,
          alarmTime: row.alarmTime,
          alarmClipIdx: row.alarmClipIdx,
          alarmSecInClip: row.alarmSecInClip,
          clipWindow: row.clipWindow,
          hazardId: row.hazardId,
          note: row.note,
          safetyDetail: row.safetyDetail,
          segments: row.segments,
          sortOrder: row.sortOrder,
        },
      });
  }

  const pairRows = buildAirGroundPairsSeed();
  for (const row of pairRows) {
    await dbInstance
      .insert(videoAirGroundPairs)
      .values(row)
      .onConflictDoUpdate({
        target: videoAirGroundPairs.id,
        set: {
          sectionId: row.sectionId,
          sectionName: row.sectionName,
          siteName: row.siteName,
          partName: row.partName,
          evidenceDate: row.evidenceDate,
          matched: row.matched,
          camId: row.camId,
          camLabel: row.camLabel,
          camStake: row.camStake,
          camTime: row.camTime,
          camTag: row.camTag,
          uavTaskId: row.uavTaskId,
          uavTaskName: row.uavTaskName,
          uavFile: row.uavFile,
          uavTime: row.uavTime,
          uavPart: row.uavPart,
          timeDiffSec: row.timeDiffSec,
          hazardTitle: row.hazardTitle,
          hazardId: row.hazardId,
          alarmId: row.alarmId,
          summary: row.summary,
          sceneType: row.sceneType,
          recheckSent: row.recheckSent,
          recheckTime: row.recheckTime,
          sortOrder: row.sortOrder,
        },
      });
  }

  const [revCount] = await dbInstance
    .select({ value: count() })
    .from(videoAirGroundReviews);

  if (!revCount || revCount.value === 0) {
    await dbInstance.insert(videoAirGroundReviews).values([
      {
        pairId: 'AG-03',
        hazardId: 'AQ-202611-018',
        camId: 'CAM-QL-A02',
        uavRoute: '自动复核航线 · 航点04',
        instruction: '针对「临边防护缺失」发起空地同点位复核取证，确认现场整改闭环情况。',
        submittedBy: '监理复查人员（系统预置）',
        status: '已下发',
        recheckTime: '2026-11-26 08:45:00',
      },
      {
        pairId: 'AG-05',
        hazardId: 'AQ-202611-029',
        camId: 'CAM-YD-B01',
        uavRoute: '自动复核航线 · 航点06',
        instruction: '针对「场内通道材料侵占」发起空地同点位复核取证，确认现场整改闭环情况。',
        submittedBy: '二工区总工（系统预置）',
        status: '已下发',
        recheckTime: '2026-11-25 10:12:00',
      },
    ]);
  }
}
