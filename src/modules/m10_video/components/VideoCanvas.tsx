'use client';

import { useEffect, useRef } from 'react';

export interface SceneDrawOptions {
  status?: string;
  sceneType?: string;
  t?: number;
  isUav?: boolean;
  showAlarmBox?: boolean;
  alarmBoxLabel?: string;
}

export function drawSceneOnCanvas(
  canvas: HTMLCanvasElement | null,
  opts: SceneDrawOptions
) {
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const status = opts.status || '在线';
  const sceneType = opts.sceneType || 'yardLane';
  const t = opts.t || 0;
  const isUav = Boolean(opts.isUav);
  const showAlarmBox = Boolean(opts.showAlarmBox);
  const alarmBoxLabel = opts.alarmBoxLabel || '疑似消防通道占用';

  if (status === '离线') {
    ctx.fillStyle = '#061226';
    ctx.fillRect(0, 0, w, h);
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

  const animT = status === '图像异常' ? 1.7 : t;

  const horizonY = isUav ? h * 0.14 : h * 0.22;
  const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
  skyGrad.addColorStop(0, '#5d83ab');
  skyGrad.addColorStop(1, '#9cb6ce');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, w, horizonY);

  // Distant treeline
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

    ctx.strokeStyle = 'rgba(72, 70, 64, 0.45)';
    ctx.lineWidth = 1;
    for (let i = 1; i <= 7; i++) {
      const p = Math.pow(i / 7, 1.55);
      const y = vpY + (h - vpY) * p;
      const lx = vpX - 36 + (w * 0.16 - (vpX - 36)) * p;
      const rx = vpX + 36 + (w * 0.78 - (vpX + 36)) * p;
      ctx.beginPath();
      ctx.moveTo(lx, y);
      ctx.lineTo(rx, y);
      ctx.stroke();
    }

    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 2.4;
    ctx.beginPath();
    ctx.moveTo(vpX - 28, vpY);
    ctx.lineTo(w * 0.22, h);
    ctx.moveTo(vpX + 26, vpY);
    ctx.lineTo(w * 0.66, h);
    ctx.stroke();

    ctx.fillStyle = '#3f454d';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(vpX - 36, vpY);
    ctx.lineTo(w * 0.16, h);
    ctx.lineTo(0, h);
    ctx.closePath();
    ctx.fill();

    for (let i = 0; i < 6; i++) {
      const p = i / 6;
      const y = vpY + (h - vpY) * (0.14 + p * 0.78);
      const bw = 28 + p * 85;
      const bh = 14 + p * 36;
      ctx.fillStyle = i < 2 ? '#cbd5e1' : '#524940';
      ctx.fillRect(6, y - bh, bw, bh);
      ctx.strokeStyle = 'rgba(30, 41, 59, 0.55)';
      ctx.strokeRect(6, y - bh, bw, bh);
      const colX = vpX - 34 + (w * 0.17 - (vpX - 34)) * (0.12 + p * 0.85);
      ctx.fillStyle = '#64748b';
      ctx.fillRect(colX - 4, y - bh * 2.1, 6 + p * 4, bh * 2.1);
    }

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

    ctx.fillStyle = '#1e5b4f';
    ctx.beginPath();
    ctx.moveTo(vpX + 32, vpY);
    ctx.lineTo(w, horizonY + 12);
    ctx.lineTo(w, h * 0.82);
    ctx.lineTo(w * 0.66, h * 0.72);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.22)';
    ctx.lineWidth = 2;
    for (let f = 0; f < 4; f++) {
      ctx.beginPath();
      ctx.moveTo(vpX + 55 + f * 48, vpY + 18 + f * 12);
      ctx.lineTo(w - 20, horizonY + 35 + f * 30);
      ctx.stroke();
    }

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

    const walkP = (animT * 0.06) % 1;
    const personX = vpX - 4 + (w * 0.44 - (vpX - 4)) * (0.25 + walkP * 0.45);
    const personY = vpY + (h - vpY) * (0.25 + walkP * 0.45);
    const scale = 0.45 + walkP * 0.55;
    ctx.fillStyle = '#f97316';
    ctx.fillRect(personX - 4 * scale, personY - 16 * scale, 8 * scale, 11 * scale);
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.arc(personX, personY - 19 * scale, 3.5 * scale, 0, Math.PI * 2);
    ctx.fill();

    if (sceneType === 'gate') {
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(w * 0.24, h * 0.62);
      ctx.lineTo(w * 0.62, h * 0.59 - Math.sin(animT * 0.7) * 8);
      ctx.stroke();
    }

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
    ctx.fillStyle = '#1e40af';
    ctx.fillRect(w * 0.48, horizonY - 26, w * 0.52, h * 0.32);
    ctx.fillStyle = '#3b82f6';
    ctx.fillRect(w * 0.48, horizonY - 30, w * 0.52, 6);

    ctx.fillStyle = '#78808a';
    ctx.beginPath();
    ctx.moveTo(w * 0.12, horizonY + 12);
    ctx.lineTo(w * 0.92, h * 0.58);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.08, h);
    ctx.closePath();
    ctx.fill();

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

    const craneShift = Math.sin(animT * 0.45) * 18;
    const cx = w * 0.28 + craneShift;
    ctx.fillStyle = '#eab308';
    ctx.fillRect(cx, horizonY - 24, w * 0.42, 10);
    ctx.fillRect(cx + 8, horizonY - 14, 9, h * 0.48);
    ctx.fillRect(cx + w * 0.36, horizonY - 14, 9, h * 0.54);
    ctx.strokeStyle = '#facc15';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(cx + w * 0.22, horizonY - 14);
    ctx.lineTo(cx + w * 0.22, horizonY + 42);
    ctx.stroke();
  } else if (sceneType === 'highway') {
    ctx.fillStyle = '#1e5f4d';
    ctx.beginPath();
    ctx.moveTo(w * 0.58, horizonY);
    ctx.lineTo(w, horizonY);
    ctx.lineTo(w, h);
    ctx.lineTo(w * 0.68, h);
    ctx.closePath();
    ctx.fill();

    ctx.fillStyle = '#475569';
    ctx.beginPath();
    ctx.moveTo(w * 0.26, horizonY);
    ctx.lineTo(w * 0.46, horizonY);
    ctx.quadraticCurveTo(w * 0.54, h * 0.52, w * 0.72, h);
    ctx.lineTo(w * 0.14, h);
    ctx.quadraticCurveTo(w * 0.32, h * 0.52, w * 0.26, horizonY);
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#e2e8f0';
    ctx.lineWidth = 2;
    ctx.setLineDash([12, 10]);
    ctx.beginPath();
    ctx.moveTo(w * 0.36, horizonY + 4);
    ctx.quadraticCurveTo(w * 0.44, h * 0.54, w * 0.46, h);
    ctx.stroke();
    ctx.setLineDash([]);

    for (let b = 0; b < 11; b++) {
      const p = b / 10;
      const bx = w * 0.45 + p * p * w * 0.27;
      const by = horizonY + 8 + p * (h - horizonY - 16);
      ctx.fillStyle = b % 2 === 0 ? '#dc2626' : '#f8fafc';
      ctx.fillRect(bx, by, 14 + p * 12, 8 + p * 8);
    }

    const carP = (animT * 0.16) % 1;
    const carX = w * 0.34 + carP * w * 0.1;
    const carY = horizonY + 24 + carP * (h - horizonY - 40);
    const cw = 18 + carP * 26;
    const ch = 10 + carP * 14;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(carX - cw / 2, carY - ch / 2, cw, ch);
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(carX - cw * 0.35, carY - ch * 0.35, cw * 0.7, ch * 0.35);

    const trkP = (animT * 0.11 + 0.45) % 1;
    const trkX = w * 0.29 + trkP * w * 0.04;
    const trkY = horizonY + 14 + (1 - trkP) * (h - horizonY - 50);
    const tw = 16 + (1 - trkP) * 20;
    const th = 12 + (1 - trkP) * 14;
    ctx.fillStyle = '#b91c1c';
    ctx.fillRect(trkX - tw / 2, trkY - th / 2, tw, th);

    if (showAlarmBox) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(w * 0.46, h * 0.56, 76, 44);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.92)';
      ctx.fillRect(w * 0.46, h * 0.56 - 17, 114, 17);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10.5px "Microsoft YaHei", sans-serif';
      ctx.fillText(alarmBoxLabel, w * 0.46 + 4, h * 0.56 - 4);
      ctx.restore();
    }
  } else if (sceneType === 'bridgePier') {
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(w * 0.39, h * 0.56, w * 0.17, h * 0.44);
    ctx.fillStyle = '#64748b';
    ctx.fillRect(w * 0.51, h * 0.56, w * 0.05, h * 0.44);

    ctx.fillStyle = '#cbd5e1';
    ctx.fillRect(w * 0.3, h * 0.38, w * 0.36, h * 0.18);
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
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 1.6;
    for (let r = 0; r < 14; r++) {
      const rx = w * 0.35 + r * 9;
      ctx.beginPath();
      ctx.moveTo(rx, h * 0.23);
      ctx.lineTo(rx, h * 0.38);
      ctx.stroke();
    }

    if (showAlarmBox) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(w * 0.28, h * 0.36, 92, 46);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.92)';
      ctx.fillRect(w * 0.28, h * 0.36 - 17, 108, 17);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10.5px "Microsoft YaHei", sans-serif';
      ctx.fillText(alarmBoxLabel, w * 0.28 + 4, h * 0.36 - 4);
      ctx.restore();
    }
  } else if (sceneType === 'batchPlant') {
    ctx.fillStyle = '#1e3a8a';
    ctx.fillRect(w * 0.18, horizonY - 22, w * 0.32, h * 0.45);
    for (let s = 0; s < 4; s++) {
      const sx = w * 0.56 + s * 34;
      ctx.fillStyle = '#cbd5e1';
      ctx.fillRect(sx, horizonY - 34, 24, h * 0.44);
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(sx + 16, horizonY - 34, 8, h * 0.44);
    }
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
    const rx = w * 0.3 + ((animT * 22) % (w * 0.32));
    ctx.fillStyle = '#eab308';
    ctx.fillRect(rx, h * 0.66, 44, 18);
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(rx + 8, h * 0.84, 9, 0, Math.PI * 2);
    ctx.arc(rx + 36, h * 0.84, 8, 0, Math.PI * 2);
    ctx.fill();

    if (showAlarmBox) {
      ctx.save();
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.strokeRect(w * 0.54, h * 0.36, 86, 48);
      ctx.setLineDash([]);
      ctx.fillStyle = 'rgba(250, 204, 21, 0.92)';
      ctx.fillRect(w * 0.54, h * 0.36 - 17, 120, 17);
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 10.5px "Microsoft YaHei", sans-serif';
      ctx.fillText(alarmBoxLabel, w * 0.54 + 4, h * 0.36 - 4);
      ctx.restore();
    }
  }

  // Subtle scanline + vignette overlay
  ctx.fillStyle = 'rgba(2, 10, 26, 0.08)';
  for (let y = 0; y < h; y += 4) {
    ctx.fillRect(0, y, w, 1);
  }

  // Glitch bands for 图像异常
  if (status === '图像异常') {
    ctx.fillStyle = 'rgba(250, 204, 21, 0.16)';
    ctx.fillRect(0, h * 0.28, w, 6);
    ctx.fillStyle = 'rgba(56, 242, 255, 0.22)';
    ctx.fillRect(0, h * 0.63, w, 4);
    ctx.fillStyle = 'rgba(2, 10, 26, 0.22)';
    ctx.fillRect(0, 0, w, h);
  }
}

export function drawSpatialThumbnail(canvas: HTMLCanvasElement | null) {
  if (!canvas) return;
  const w = canvas.width;
  const h = canvas.height;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  const sx = w / 206;
  const sy = h / 118;
  ctx.save();
  ctx.scale(sx, sy);

  ctx.fillStyle = '#474f57';
  ctx.fillRect(0, 0, 206, 118);

  ctx.fillStyle = '#1d4ed8';
  ctx.fillRect(16, 12, 74, 28);
  ctx.fillRect(114, 12, 74, 28);

  ctx.fillStyle = '#9ca3af';
  ctx.fillRect(16, 48, 172, 56);

  ctx.fillStyle = '#1f5e4e';
  ctx.fillRect(128, 56, 52, 40);

  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.strokeRect(86, 48, 30, 56);

  ctx.fillStyle = 'rgba(56, 242, 255, 0.24)';
  ctx.beginPath();
  ctx.moveTo(92, 98);
  ctx.lineTo(74, 52);
  ctx.lineTo(116, 52);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#22d3ee';
  ctx.beginPath();
  ctx.arc(92, 98, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1.4;
  ctx.stroke();

  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(102, 66, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
  ctx.lineWidth = 1;
  ctx.strokeRect(0.5, 0.5, 205, 117);

  ctx.restore();
}

export interface VideoCanvasProps {
  id?: string;
  width: number;
  height: number;
  status: string;
  sceneType: string;
  mode?: 'live' | 'playback';
  isUav?: boolean;
  showAlarmBox?: boolean;
  alarmBoxLabel?: string;
  playbackSec?: number;
  animate?: boolean;
  onCanvasRef?: (el: HTMLCanvasElement | null) => void;
}

export function VideoCanvas({
  id,
  width,
  height,
  status,
  sceneType,
  mode = 'live',
  isUav = false,
  showAlarmBox = false,
  alarmBoxLabel,
  playbackSec = 0,
  animate = true,
  onCanvasRef,
}: VideoCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tickRef = useRef(0);

  useEffect(() => {
    onCanvasRef?.(canvasRef.current);
    return () => {
      onCanvasRef?.(null);
    };
  }, [onCanvasRef]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (mode === 'playback') {
      drawSceneOnCanvas(canvas, {
        status: '在线',
        sceneType,
        t: playbackSec * 0.35,
        isUav,
        showAlarmBox,
        alarmBoxLabel,
      });
      return;
    }

    const effectiveStatus = isUav ? '在线' : status;
    drawSceneOnCanvas(canvas, {
      status: effectiveStatus,
      sceneType,
      t: tickRef.current * 0.08,
      isUav,
      showAlarmBox,
      alarmBoxLabel,
    });

    if (!animate || effectiveStatus === '图像异常') {
      return;
    }

    const timer = window.setInterval(() => {
      tickRef.current += 1;
      drawSceneOnCanvas(canvasRef.current, {
        status: effectiveStatus,
        sceneType,
        t: tickRef.current * 0.08,
        isUav,
        showAlarmBox,
        alarmBoxLabel,
      });
    }, 85);

    return () => {
      window.clearInterval(timer);
    };
  }, [status, sceneType, mode, isUav, showAlarmBox, alarmBoxLabel, playbackSec, animate]);

  return (
    <canvas
      id={id}
      ref={canvasRef}
      className="m10-feed-canvas"
      width={width}
      height={height}
    />
  );
}

export function SpatialThumbnailCanvas({
  id,
  width,
  height,
  className,
  style,
}: {
  id?: string;
  width: number;
  height: number;
  className?: string;
  style?: React.CSSProperties;
}) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    drawSpatialThumbnail(ref.current);
  }, [width, height]);

  return (
    <canvas
      id={id}
      ref={ref}
      width={width}
      height={height}
      className={className}
      style={style}
    />
  );
}
