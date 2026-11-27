import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import {
  CORRIDOR_GEO,
  type SpeedDirectionMetrics,
  type SpeedPilotSegmentDTO,
} from '../types';

export interface SpeedMapLayerConfig {
  corridor: boolean;
  attention: boolean;
  markers: boolean;
  satellite: boolean;
  sections: boolean;
}

export function restoreDefaultCesiumLayers(activeSectionId: string | null) {
  const engine = getGlobalCesiumEngine();
  if (!engine.ready) return;
  engine.applyLayers({
    satellite: false,
    uav: true,
    bim: false,
    pois: true,
    sections: true,
    route: true,
    designMode: false,
    activeSectionId,
  });
}

export function flyToAllPilotSegments(isReplay: boolean) {
  const engine = getGlobalCesiumEngine();
  const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
  if (!engine.ready || !engine.viewer || !Cesium) return;
  engine.orbitActive = false;
  const targetLon = isReplay ? 126.14 : 126.16;
  const targetLat = isReplay ? 47.34 : 47.76;
  const target = Cesium.Cartesian3.fromDegrees(targetLon, targetLat, 240);
  const pitch = isReplay ? -26 : -28;
  const range = isReplay ? 150000 : 132000;
  engine.viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(target, 48000),
    {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(2),
        Cesium.Math.toRadians(pitch),
        range
      ),
      duration: 1.2,
    }
  );
}

export function flyToPilotSegment(
  seg: SpeedPilotSegmentDTO | undefined,
  isReplay = false
) {
  const engine = getGlobalCesiumEngine();
  const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
  if (!engine.ready || !engine.viewer || !Cesium) return;
  if (!seg) {
    flyToAllPilotSegments(isReplay);
    return;
  }
  engine.orbitActive = false;
  const target = Cesium.Cartesian3.fromDegrees(seg.lon, seg.lat, seg.alt);
  engine.viewer.camera.flyToBoundingSphere(
    new Cesium.BoundingSphere(target, 3200),
    {
      offset: new Cesium.HeadingPitchRange(
        Cesium.Math.toRadians(18),
        Cesium.Math.toRadians(-32),
        14500
      ),
      duration: 1.2,
    }
  );
}

export function syncCesiumSpeedEntities(params: {
  layersCfg: SpeedMapLayerConfig;
  segments: SpeedPilotSegmentDTO[];
  attentionSegIds: string[];
  activeSectionId: string | null;
}) {
  const engine = getGlobalCesiumEngine();
  const Cesium = typeof window !== 'undefined' ? window.Cesium : null;
  if (!engine.ready || !engine.viewer || !Cesium) return;

  engine.applyLayers({
    satellite: params.layersCfg.satellite,
    uav: true,
    bim: false,
    pois: false,
    sections: params.layersCfg.sections,
    route: false,
    designMode: false,
    activeSectionId: params.activeSectionId,
  });

  engine.syncHtmlOverlays({
    showRoute: false,
    showSections: false,
    showPois: false,
  });

  engine.clearModuleEntities('speed');

  if (params.layersCfg.corridor) {
    const positions = CORRIDOR_GEO.map((p) =>
      Cesium.Cartesian3.fromDegrees(p[0], p[1], 245)
    );
    engine.trackModuleEntity('speed', {
      name: '智慧提速监测走廊',
      polyline: {
        positions,
        width: 5,
        clampToGround: true,
        material: new Cesium.PolylineGlowMaterialProperty({
          glowPower: 0.25,
          color: Cesium.Color.fromCssColorString('#38f2ff').withAlpha(0.92),
        }),
      },
    });
  }

  if (params.layersCfg.attention) {
    params.segments
      .filter((s) => params.attentionSegIds.includes(s.id))
      .forEach((seg) => {
        const spanPos = seg.spanCoords.map((p) =>
          Cesium.Cartesian3.fromDegrees(p[0], p[1], 255)
        );
        engine.trackModuleEntity('speed', {
          name: `${seg.name} 需关注区段`,
          polyline: {
            positions: spanPos,
            width: 8,
            clampToGround: true,
            material: new Cesium.PolylineGlowMaterialProperty({
              glowPower: 0.35,
              color: Cesium.Color.fromCssColorString('#f59e0b').withAlpha(0.95),
            }),
          },
        });
      });
  }
}

export function drawTrafficCameraFrame(
  canvas: HTMLCanvasElement | null,
  seg: SpeedPilotSegmentDTO,
  dirData: SpeedDirectionMetrics,
  tick: number
) {
  if (!canvas) return;
  const ctx2d = canvas.getContext('2d');
  if (!ctx2d) return;
  const W = canvas.width;
  const H = canvas.height;

  // Sky / winter dusk backdrop
  const skyGrad = ctx2d.createLinearGradient(0, 0, 0, H * 0.25);
  skyGrad.addColorStop(0, '#4e657d');
  skyGrad.addColorStop(1, '#7c8e9e');
  ctx2d.fillStyle = skyGrad;
  ctx2d.fillRect(0, 0, W, H);

  // Snow embankment left & right
  ctx2d.fillStyle = '#c8d2dc';
  ctx2d.beginPath();
  ctx2d.moveTo(0, H * 0.14);
  ctx2d.lineTo(W * 0.35, H * 0.14);
  ctx2d.lineTo(0, H * 0.92);
  ctx2d.closePath();
  ctx2d.fill();

  ctx2d.fillStyle = '#d3dce4';
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.68, H * 0.14);
  ctx2d.lineTo(W, H * 0.14);
  ctx2d.lineTo(W, H * 0.96);
  ctx2d.closePath();
  ctx2d.fill();

  // Asphalt highway trapezoid
  const roadGrad = ctx2d.createLinearGradient(0, H * 0.14, 0, H);
  roadGrad.addColorStop(0, '#5a636e');
  roadGrad.addColorStop(1, '#3b424c');
  ctx2d.fillStyle = roadGrad;
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.34, H * 0.14);
  ctx2d.lineTo(W * 0.69, H * 0.14);
  ctx2d.lineTo(W * 0.96, H);
  ctx2d.lineTo(W * 0.03, H);
  ctx2d.closePath();
  ctx2d.fill();

  // Left yellow edge line & right white shoulder line
  ctx2d.strokeStyle = '#d4a634';
  ctx2d.lineWidth = 2;
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.36, H * 0.14);
  ctx2d.lineTo(W * 0.08, H);
  ctx2d.stroke();

  ctx2d.strokeStyle = '#e5edf5';
  ctx2d.lineWidth = 2.2;
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.59, H * 0.14);
  ctx2d.lineTo(W * 0.72, H);
  ctx2d.stroke();

  // Guardrail on right edge
  ctx2d.strokeStyle = '#9aa8b8';
  ctx2d.lineWidth = 3;
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.69, H * 0.14);
  ctx2d.lineTo(W * 0.96, H);
  ctx2d.stroke();

  // Animated center lane dashed divider
  const dashOffset = (tick * 2.4) % 28;
  ctx2d.strokeStyle = 'rgba(241, 245, 249, 0.85)';
  ctx2d.lineWidth = 2;
  ctx2d.setLineDash([14, 14]);
  ctx2d.lineDashOffset = -dashOffset;
  ctx2d.beginPath();
  ctx2d.moveTo(W * 0.47, H * 0.14);
  ctx2d.lineTo(W * 0.38, H);
  ctx2d.stroke();
  ctx2d.setLineDash([]);

  // Moving passenger vehicle in inner lane
  const carProg = (tick * 0.012) % 1;
  const carY = H * (0.24 + carProg * 0.56);
  const carScale = 0.45 + carProg * 0.85;
  const carX = W * (0.44 - carProg * 0.04);
  ctx2d.fillStyle = '#cbd5e1';
  ctx2d.fillRect(
    carX - 18 * carScale,
    carY - 12 * carScale,
    36 * carScale,
    20 * carScale
  );
  ctx2d.fillStyle = '#1e293b';
  ctx2d.fillRect(
    carX - 13 * carScale,
    carY - 10 * carScale,
    26 * carScale,
    8 * carScale
  );
  ctx2d.fillStyle = '#ef4444';
  ctx2d.fillRect(
    carX - 16 * carScale,
    carY + 3 * carScale,
    5 * carScale,
    3 * carScale
  );
  ctx2d.fillRect(
    carX + 11 * carScale,
    carY + 3 * carScale,
    5 * carScale,
    3 * carScale
  );

  // Distant second vehicle
  const car2Y = H * (0.18 + ((carProg + 0.45) % 1) * 0.4);
  const car2S = 0.3 + ((carProg + 0.45) % 1) * 0.45;
  const car2X = W * 0.53;
  ctx2d.fillStyle = '#64748b';
  ctx2d.fillRect(car2X - 16 * car2S, car2Y - 10 * car2S, 32 * car2S, 16 * car2S);

  // Hard shoulder stopped truck or debris box if attention segment
  if (dirData.shoulderOccupied || dirData.camBoxText) {
    const bx = W * 0.62;
    const by = H * 0.36;
    const bw = W * 0.19;
    const bh = H * 0.46;

    if (dirData.shoulderOccupied) {
      ctx2d.fillStyle = '#e2e8f0';
      ctx2d.fillRect(bx + 8, by + 6, bw - 16, bh - 20);
      ctx2d.fillStyle = '#94a3b8';
      ctx2d.fillRect(bx + 8, by + bh - 16, bw - 16, 10);
      if (Math.floor(tick / 6) % 2 === 0) {
        ctx2d.fillStyle = '#f59e0b';
        ctx2d.fillRect(bx + 10, by + bh - 14, 7, 4);
        ctx2d.fillRect(bx + bw - 17, by + bh - 14, 7, 4);
      }
    } else {
      ctx2d.fillStyle = '#b45309';
      ctx2d.fillRect(bx + bw * 0.25, by + bh * 0.55, bw * 0.45, bh * 0.25);
    }

    ctx2d.strokeStyle = '#facc15';
    ctx2d.lineWidth = 2;
    ctx2d.setLineDash([5, 4]);
    ctx2d.strokeRect(bx, by, bw, bh);
    ctx2d.setLineDash([]);

    const label = dirData.camBoxText || '异常事件识别';
    ctx2d.font = 'bold 11px "Microsoft YaHei", sans-serif';
    const tw = ctx2d.measureText(label).width + 12;
    const lx = Math.min(W - tw - 6, bx - 4);
    const ly = by + bh + 4;
    ctx2d.fillStyle = 'rgba(15, 23, 42, 0.88)';
    ctx2d.fillRect(lx, ly - 14, tw, 18);
    ctx2d.strokeStyle = 'rgba(250, 204, 21, 0.8)';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(lx, ly - 14, tw, 18);
    ctx2d.fillStyle = '#fef08a';
    ctx2d.fillText(label, lx + 6, ly - 1);
  }

  // Top-left camera pill
  const camTag = `${seg.camId} · 视频示意`;
  ctx2d.font = '600 11px "Microsoft YaHei", sans-serif';
  const tagW = ctx2d.measureText(camTag).width + 16;
  ctx2d.fillStyle = 'rgba(4, 15, 36, 0.78)';
  ctx2d.fillRect(8, 8, tagW, 20);
  ctx2d.strokeStyle = 'rgba(56, 189, 248, 0.48)';
  ctx2d.lineWidth = 1;
  ctx2d.strokeRect(8, 8, tagW, 20);
  ctx2d.fillStyle = '#f1f7ff';
  ctx2d.fillText(camTag, 16, 22);
}
