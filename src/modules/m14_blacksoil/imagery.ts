import { CORRIDOR_CENTERLINE, WORLD_H, WORLD_W, type EpochKey } from './types';
import type { BlacksoilPoint2D } from '@/db/schema/domains/m14';

export type ImageryDataMap = Record<EpochKey | 'grid', string>;

let cachedImagery: ImageryDataMap | null = null;

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function drawRotatedParcelPattern(ctx: CanvasRenderingContext2D, epoch: EpochKey) {
  const rand = mulberry32(20261126 + Number(epoch) * 137);

  ctx.save();
  ctx.translate(WORLD_W / 2, WORLD_H / 2);
  ctx.rotate(-0.24);

  const stripWidths = [135, 118, 146, 128, 152, 132, 142, 158, 134, 148, 126, 145, 138, 150];
  const stripTypes = [
    'blacksoil',
    'crop_dark',
    'wheat_tan',
    'crop_bright',
    'blacksoil',
    'crop_mid',
    'blacksoil',
    'wheat_tan',
    'crop_bright',
    'crop_dark',
    'crop_mid',
    'blacksoil',
    'crop_bright',
    'wheat_tan',
  ] as const;

  const palettes: Record<EpochKey, Record<(typeof stripTypes)[number], [string, string, string]>> = {
    '2024': {
      blacksoil: ['#261f18', '#31271e', '#1e1812'],
      crop_dark: ['#2f4d23', '#3b5d2b', '#27421c'],
      crop_mid: ['#3f602d', '#4c7036', '#335224'],
      crop_bright: ['#4c7333', '#5c843d', '#3e6229'],
      wheat_tan: ['#786a4d', '#877858', '#685b42'],
    },
    '2025': {
      blacksoil: ['#2c231b', '#382c22', '#231b14'],
      crop_dark: ['#375728', '#456931', '#2f4c22'],
      crop_mid: ['#4b6d34', '#587c3c', '#3d5c29'],
      crop_bright: ['#5a7f3a', '#698e45', '#4c6e30'],
      wheat_tan: ['#8b7857', '#9b8763', '#7a684a'],
    },
    '2026': {
      blacksoil: ['#31271e', '#3e3126', '#281f18'],
      crop_dark: ['#3b592a', '#496b34', '#314c23'],
      crop_mid: ['#507036', '#5e7e40', '#42602c'],
      crop_bright: ['#60823e', '#6f9248', '#527134'],
      wheat_tan: ['#94805d', '#a48f6a', '#827050'],
    },
  };

  const pal = palettes[epoch];
  let curX = -1020;

  for (let i = 0; i < stripWidths.length; i++) {
    const w = stripWidths[i];
    const kind = stripTypes[i % stripTypes.length];
    const colors = pal[kind];

    ctx.fillStyle = colors[0];
    ctx.fillRect(curX, -900, w, 1800);

    for (let fx = curX + 3; fx < curX + w - 2; fx += 5.5) {
      ctx.fillStyle = rand() > 0.45 ? colors[1] : colors[2];
      ctx.globalAlpha = 0.35 + rand() * 0.35;
      ctx.fillRect(fx, -900, 2.2 + rand() * 1.4, 1800);
    }
    ctx.globalAlpha = 1;

    for (let p = 0; p < 18; p++) {
      const py = -840 + rand() * 1680;
      const ph = 40 + rand() * 110;
      ctx.fillStyle = rand() > 0.5 ? colors[2] : colors[1];
      ctx.globalAlpha = 0.14 + rand() * 0.14;
      ctx.fillRect(curX + 2, py, w - 4, ph);
    }
    ctx.globalAlpha = 1;

    for (let dy = -680; dy <= 680; dy += 260 + Math.floor(rand() * 90)) {
      ctx.fillStyle = epoch === '2024' ? 'rgba(26, 36, 30, 0.6)' : 'rgba(42, 46, 36, 0.55)';
      ctx.fillRect(curX, dy, w, 3.5);
    }

    const treeDensity = i % 2 === 0 ? 11 : 16;
    ctx.fillStyle = 'rgba(10, 16, 10, 0.42)';
    ctx.fillRect(curX - 2, -900, 18, 1800);

    for (let ty = -880; ty < 880; ty += treeDensity) {
      const jx = (rand() - 0.5) * 9;
      const r = 6 + rand() * 6.5;
      ctx.fillStyle = rand() > 0.38 ? '#233f1e' : '#305427';
      ctx.beginPath();
      ctx.arc(curX + jx, ty, r, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = epoch === '2026' ? '#496e35' : '#3d632c';
      ctx.beginPath();
      ctx.arc(curX + jx - 1.5, ty - 1.5, r * 0.55, 0, Math.PI * 2);
      ctx.fill();
    }

    curX += w;
  }
  ctx.restore();
}

function drawCorridorForEpoch(
  ctx: CanvasRenderingContext2D,
  epoch: EpochKey,
  centerline: BlacksoilPoint2D[]
) {
  const rand = mulberry32(9910 + Number(epoch) * 53);

  const drawPolyline = (
    pts: BlacksoilPoint2D[],
    width: number,
    color: string,
    lineCap: CanvasLineCap = 'butt'
  ) => {
    if (!pts.length) return;
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = lineCap;
    ctx.lineJoin = 'round';
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) ctx.lineTo(pts[i][0], pts[i][1]);
    ctx.stroke();
    ctx.restore();
  };

  if (epoch === '2024') {
    drawPolyline(centerline, 22, 'rgba(62, 74, 46, 0.75)');
    drawPolyline(centerline, 11, '#7c7e74');
    drawPolyline(centerline, 1.5, 'rgba(226, 232, 240, 0.45)');
    return;
  }

  if (epoch === '2025') {
    drawPolyline(centerline, 28, 'rgba(72, 82, 54, 0.85)');
    drawPolyline(centerline, 15, '#96988e');
    ctx.save();
    ctx.setLineDash([12, 10]);
    drawPolyline(centerline, 1.6, 'rgba(245, 245, 220, 0.65)');
    ctx.restore();
    return;
  }

  // 2026 施工期
  drawPolyline(centerline, 92, 'rgba(78, 88, 56, 0.72)');
  drawPolyline(centerline, 74, '#b39062');
  drawPolyline(centerline, 56, '#c7a474');

  ctx.save();
  for (let t = 0; t <= 1; t += 0.012) {
    const x = t * WORLD_W;
    const y = 622 - t * 332;
    const off = (rand() - 0.5) * 34;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(138, 108, 70, 0.45)' : 'rgba(218, 192, 146, 0.35)';
    ctx.beginPath();
    ctx.ellipse(x, y + off, 14 + rand() * 18, 4 + rand() * 4, -0.2, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  const northLane: BlacksoilPoint2D[] = centerline.map(([x, y]) => [x, y - 13]);
  const southLane: BlacksoilPoint2D[] = centerline.map(([x, y]) => [x, y + 13]);
  drawPolyline(northLane, 12, '#d5b98e');
  drawPolyline(southLane, 12, '#d2b486');
  drawPolyline(centerline, 5, '#7c6b53');

  ctx.save();
  ctx.translate(760, 520);
  ctx.rotate(-0.21);
  ctx.fillStyle = 'rgba(20, 48, 32, 0.55)';
  ctx.fillRect(-52, -8, 104, 18);
  ctx.fillStyle = '#336b47';
  ctx.fillRect(-48, -6, 96, 13);
  ctx.strokeStyle = 'rgba(134, 239, 172, 0.55)';
  ctx.lineWidth = 1;
  ctx.strokeRect(-48, -6, 96, 13);
  ctx.restore();

  const rigs: BlacksoilPoint2D[] = [
    [560, 502],
    [924, 424],
    [1190, 368],
    [1355, 336],
  ];
  for (const [rx, ry] of rigs) {
    ctx.save();
    ctx.translate(rx, ry);
    ctx.rotate(-0.2);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.38)';
    ctx.fillRect(-6, -3, 14, 9);
    ctx.fillStyle = '#eab308';
    ctx.fillRect(-7, -5, 13, 8);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -4, 4, 6);
    ctx.restore();
  }
}

function addSensorGrain(ctx: CanvasRenderingContext2D, seedOffset: number) {
  const rand = mulberry32(4400 + seedOffset);
  ctx.save();
  for (let i = 0; i < 2400; i++) {
    const x = rand() * WORLD_W;
    const y = rand() * WORLD_H;
    ctx.fillStyle = rand() > 0.5 ? 'rgba(255,255,255,0.035)' : 'rgba(0,0,0,0.045)';
    ctx.fillRect(x, y, 2.2, 2.2);
  }
  ctx.restore();
}

function buildEpochDataUrl(epoch: EpochKey, centerline: BlacksoilPoint2D[]): string {
  const scale = 1.2;
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(WORLD_W * scale);
  canvas.height = Math.round(WORLD_H * scale);
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';
  ctx.scale(scale, scale);

  drawRotatedParcelPattern(ctx, epoch);
  drawCorridorForEpoch(ctx, epoch, centerline);
  addSensorGrain(ctx, Number(epoch));

  return canvas.toDataURL('image/jpeg', 0.92);
}

function buildGridDataUrl(): string {
  const canvas = document.createElement('canvas');
  canvas.width = WORLD_W;
  canvas.height = WORLD_H;
  const ctx = canvas.getContext('2d');
  if (!ctx) return '';

  ctx.fillStyle = '#071b3c';
  ctx.fillRect(0, 0, WORLD_W, WORLD_H);
  ctx.strokeStyle = 'rgba(56, 189, 248, 0.14)';
  ctx.lineWidth = 1;
  for (let gx = 0; gx <= WORLD_W; gx += 80) {
    ctx.beginPath();
    ctx.moveTo(gx, 0);
    ctx.lineTo(gx, WORLD_H);
    ctx.stroke();
  }
  for (let gy = 0; gy <= WORLD_H; gy += 80) {
    ctx.beginPath();
    ctx.moveTo(0, gy);
    ctx.lineTo(WORLD_W, gy);
    ctx.stroke();
  }
  return canvas.toDataURL('image/png');
}

export function generateEpochImageryDataUrls(
  centerline: BlacksoilPoint2D[] = CORRIDOR_CENTERLINE
): ImageryDataMap {
  if (cachedImagery) return cachedImagery;
  cachedImagery = {
    '2024': buildEpochDataUrl('2024', centerline),
    '2025': buildEpochDataUrl('2025', centerline),
    '2026': buildEpochDataUrl('2026', centerline),
    grid: buildGridDataUrl(),
  };
  return cachedImagery;
}
