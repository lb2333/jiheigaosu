'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pause, Play, Plus, Volume2, VolumeX, X } from 'lucide-react';
import {
  DIRECTION_LIST,
  STAGE_LIST,
  STAGE_META,
  formatTimeSec,
  type PinganFeaturedResultDTO,
  type PinganSlideDTO,
  type PinganTopicDTO,
} from '../types';

function ModalShell({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: ReactNode;
}) {
  return (
    <div
      className="modal-backdrop open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-box">
        <div className="modal-header">
          <div className="panel-title-group">
            <span className="panel-accent-bar" />
            <span className="panel-title">{title}</span>
          </div>
          <button
            type="button"
            className="panel-toggle-btn"
            onClick={onClose}
            aria-label="关闭弹窗"
          >
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function StageHudSvg({ slide }: { slide: PinganSlideDTO }) {
  if (slide.id === 'slide-1') {
    return (
      <svg
        className="m12-stage-svg-hud"
        viewBox="0 0 640 340"
        preserveAspectRatio="none"
      >
        <g stroke="rgba(56, 242, 255, 0.55)" strokeWidth="1.2" fill="none">
          <line x1="28" y1="22" x2="72" y2="22" />
          <line x1="28" y1="22" x2="28" y2="54" />
          <line x1="612" y1="22" x2="568" y2="22" />
          <line x1="612" y1="22" x2="612" y2="54" />
          <path d="M168 148 L215 112 L338 112" strokeDasharray="4 3" />
          <circle cx="168" cy="148" r="4.5" fill="#38f2ff" />
          <path d="M472 152 L426 116 L356 116" strokeDasharray="4 3" />
          <circle cx="472" cy="152" r="4.5" fill="#facc15" />
        </g>
        <g fontFamily="sans-serif" fontSize="11">
          <rect
            x="215"
            y="92"
            width="124"
            height="22"
            rx="4"
            fill="rgba(6,24,58,0.82)"
            stroke="rgba(56,242,255,0.6)"
          />
          <text x="277" y="107" textAnchor="middle" fill="#e0f2fe">
            钢悬臂挑梁 Q355qD
          </text>
          <rect
            x="356"
            y="96"
            width="128"
            height="22"
            rx="4"
            fill="rgba(6,24,58,0.82)"
            stroke="rgba(250,204,21,0.65)"
          />
          <text x="420" y="111" textAnchor="middle" fill="#fef08a">
            挠度实测 1.8 mm
          </text>
        </g>
      </svg>
    );
  }

  if (slide.id === 'slide-2') {
    return (
      <svg
        className="m12-stage-svg-hud"
        viewBox="0 0 640 340"
        preserveAspectRatio="none"
      >
        <g fontFamily="sans-serif" fontSize="11">
          <rect
            x="18"
            y="16"
            width="142"
            height="24"
            rx="12"
            fill="rgba(6,24,58,0.82)"
            stroke="rgba(56,242,255,0.65)"
          />
          <circle cx="32" cy="28" r="4" fill="#22c55e" />
          <text x="44" y="32" fill="#f1f7ff">
            专题视频 · {slide.durationStr}
          </text>
          <rect
            x="464"
            y="16"
            width="158"
            height="24"
            rx="5"
            fill="rgba(6,24,58,0.82)"
            stroke="rgba(56,189,248,0.45)"
          />
          <text x="543" y="32" textAnchor="middle" fill="#7dd3fc">
            张拉合格率 99.6%
          </text>
        </g>
      </svg>
    );
  }

  return (
    <svg
      className="m12-stage-svg-hud"
      viewBox="0 0 640 340"
      preserveAspectRatio="none"
    >
      <g fontFamily="sans-serif" fontSize="11">
        <rect
          x="18"
          y="16"
          width="158"
          height="24"
          rx="5"
          fill="rgba(6,24,58,0.82)"
          stroke="rgba(45,212,191,0.65)"
        />
        <text x="97" y="32" textAnchor="middle" fill="#99f6e4">
          压实度在线 97.6%
        </text>
        <polyline
          points="455,44 480,34 505,39 532,26 560,31 590,20 618,24"
          fill="none"
          stroke="#38f2ff"
          strokeWidth="2"
        />
        <circle cx="590" cy="20" r="3.5" fill="#facc15" />
      </g>
    </svg>
  );
}

export function TopicProgressSvg({ topic }: { topic: PinganTopicDTO }) {
  const activeIdx = (STAGE_META[topic.stage] ?? { index: 0 }).index;
  const width = 620;
  const height = 104;
  const stepX = 118;
  const startX = 68;
  const cy = 38;

  return (
    <svg
      viewBox={`0 0 ${width} ${height}`}
      style={{
        width: '100%',
        height: 'auto',
        background: 'rgba(7,25,60,0.65)',
        border: '1px solid rgba(56,189,248,0.28)',
        borderRadius: '8px',
      }}
    >
      {STAGE_LIST.map((stageName, i) => {
        const cx = startX + i * stepX;
        const done = i < activeIdx;
        const curr = i === activeIdx;
        const stroke = done
          ? '#2dd4bf'
          : curr
            ? '#38f2ff'
            : 'rgba(120, 155, 196, 0.45)';
        const fill = done
          ? 'rgba(45, 212, 191, 0.22)'
          : curr
            ? 'rgba(22, 119, 255, 0.45)'
            : 'rgba(10, 34, 78, 0.8)';
        const lineColor = i < activeIdx ? '#2dd4bf' : 'rgba(56, 189, 248, 0.28)';

        return (
          <g key={stageName}>
            {i < STAGE_LIST.length - 1 ? (
              <line
                x1={cx + 15}
                y1={cy}
                x2={cx + stepX - 15}
                y2={cy}
                stroke={lineColor}
                strokeWidth="3"
                strokeLinecap="round"
              />
            ) : null}
            <circle cx={cx} cy={cy} r="14" fill={fill} stroke={stroke} strokeWidth="2" />
            <text
              x={cx}
              y={cy + 4.5}
              textAnchor="middle"
              fontSize="12"
              fontWeight="700"
              fill={done ? '#4ade80' : curr ? '#ffffff' : '#789bc4'}
            >
              {done ? '✓' : String(i + 1)}
            </text>
            <text
              x={cx}
              y={cy + 34}
              textAnchor="middle"
              fontSize="11.5"
              fontWeight={curr ? '700' : '500'}
              fill={curr ? '#38f2ff' : '#cbdcf5'}
            >
              {stageName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function VideoPlayerModal({
  slides,
  initialChapterIdx,
  onClose,
}: {
  slides: PinganSlideDTO[];
  initialChapterIdx: number;
  onClose: () => void;
}) {
  const safeInitIdx =
    slides.length > 0 ? Math.max(0, Math.min(initialChapterIdx, slides.length - 1)) : 0;
  const [chapterIdx, setChapterIdx] = useState(safeInitIdx);
  const [playing, setPlaying] = useState(true);
  const [elapsedSec, setElapsedSec] = useState(18);
  const [speed, setSpeed] = useState<number>(1);
  const [muted, setMuted] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgCacheRef = useRef<Record<string, HTMLImageElement>>({});
  const stateRef = useRef({
    chapterIdx: safeInitIdx,
    playing: true,
    elapsedSec: 18,
    speed: 1,
  });

  useEffect(() => {
    stateRef.current = { chapterIdx, playing, elapsedSec, speed };
  }, [chapterIdx, playing, elapsedSec, speed]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || slides.length === 0) return;
    const g = canvas.getContext('2d');
    if (!g) return;

    let rafId = 0;
    let lastTickMs = performance.now();
    let lastUiSyncMs = lastTickMs;

    const getImg = (src: string) => {
      if (!imgCacheRef.current[src]) {
        const im = new Image();
        im.src = src;
        imgCacheRef.current[src] = im;
      }
      return imgCacheRef.current[src];
    };

    const drawRoundedRect = (
      ctx2d: CanvasRenderingContext2D,
      x: number,
      y: number,
      width: number,
      height: number,
      radius: number
    ) => {
      const r = Math.min(radius, width / 2, height / 2);
      ctx2d.beginPath();
      ctx2d.moveTo(x + r, y);
      ctx2d.arcTo(x + width, y, x + width, y + height, r);
      ctx2d.arcTo(x + width, y + height, x, y + height, r);
      ctx2d.arcTo(x, y + height, x, y, r);
      ctx2d.arcTo(x, y, x + width, y, r);
      ctx2d.closePath();
    };

    const renderLoop = (nowMs: number) => {
      const dt = Math.min(0.1, (nowMs - lastTickMs) / 1000);
      lastTickMs = nowMs;

      const st = stateRef.current;
      const curSlide = slides[st.chapterIdx] ?? slides[0];
      const maxDur = Math.max(1, curSlide.durationSec || 180);

      if (st.playing) {
        st.elapsedSec += dt * st.speed;
        if (st.elapsedSec >= maxDur) st.elapsedSec = 0;
        if (nowMs - lastUiSyncMs >= 200) {
          lastUiSyncMs = nowMs;
          setElapsedSec(Math.floor(st.elapsedSec));
        }
      }

      const w = canvas.width;
      const h = canvas.height;
      g.clearRect(0, 0, w, h);
      g.fillStyle = '#041028';
      g.fillRect(0, 0, w, h);

      const im = getImg(curSlide.imgPath);
      const t = st.elapsedSec;
      const zoom = 1.04 + 0.06 * Math.sin(t * 0.28);
      const panX = Math.sin(t * 0.22) * 16;
      const panY = Math.cos(t * 0.18) * 8;
      if (im.complete && im.naturalWidth > 0) {
        const dw = w * zoom;
        const dh = h * zoom;
        g.drawImage(im, (w - dw) / 2 + panX, (h - dh) / 2 + panY, dw, dh);
      }

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
      g.fillStyle = st.playing ? '#22c55e' : '#facc15';
      g.beginPath();
      g.arc(28, 28, 4.5, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = '#f1f7ff';
      g.font = 'bold 12px sans-serif';
      g.fillText(`${curSlide.topicId} · ${curSlide.stake}`, 40, 32);

      // Right telemetry card
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

      // Dynamic waveform strip
      const wx = w - 204;
      const wy = h - 42;
      g.strokeStyle = '#38f2ff';
      g.lineWidth = 1.6;
      g.beginPath();
      for (let i = 0; i <= 44; i++) {
        const px = wx + i * 4.2;
        const py =
          wy + Math.sin(t * 4 + i * 0.45) * 6 + Math.cos(t * 2.5 + i * 0.25) * 3;
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

      rafId = requestAnimationFrame(renderLoop);
    };

    rafId = requestAnimationFrame(renderLoop);
    return () => {
      cancelAnimationFrame(rafId);
    };
  }, [slides]);

  const activeSlide = slides[chapterIdx] ?? slides[0];
  if (!activeSlide) return null;

  return (
    <ModalShell title="平安工地 · 专题成果视频播放" onClose={onClose}>
      <div className="m12-video-wrap">
        <div className="m12-video-tabs">
          {slides.map((s, idx) => (
            <button
              key={s.id}
              type="button"
              className={`m12-video-tab ${idx === chapterIdx ? 'active' : ''}`}
              onClick={() => {
                setChapterIdx(idx);
                setElapsedSec(0);
                setPlaying(true);
                stateRef.current.chapterIdx = idx;
                stateRef.current.elapsedSec = 0;
                stateRef.current.playing = true;
              }}
            >
              {s.title}
            </button>
          ))}
        </div>

        <div className="m12-canvas-box">
          <canvas
            ref={canvasRef}
            className="m12-video-canvas"
            width={700}
            height={394}
          />
        </div>

        <div className="m12-video-controls">
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            style={{ minWidth: '78px' }}
            onClick={() => {
              const next = !playing;
              setPlaying(next);
              stateRef.current.playing = next;
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />}
            {playing ? '暂停' : '播放'}
          </button>

          <input
            type="range"
            className="m12-scrubber"
            min={0}
            max={activeSlide.durationSec || 180}
            value={Math.min(elapsedSec, activeSlide.durationSec || 180)}
            onChange={(e) => {
              const val = Number(e.target.value) || 0;
              setElapsedSec(val);
              stateRef.current.elapsedSec = val;
            }}
          />

          <span
            style={{
              fontSize: '12px',
              color: '#cfe4ff',
              fontVariantNumeric: 'tabular-nums',
              minWidth: '88px',
              textAlign: 'center',
            }}
          >
            {formatTimeSec(elapsedSec)} / {activeSlide.durationStr}
          </span>

          <button
            type="button"
            className="m12-btn m12-btn-ghost"
            style={{ padding: '0 10px' }}
            onClick={() => {
              const speeds = [1.0, 1.5, 2.0];
              const next = speeds[(speeds.indexOf(speed) + 1) % speeds.length];
              setSpeed(next);
              stateRef.current.speed = next;
            }}
          >
            {speed.toFixed(1)}x
          </button>

          <button
            type="button"
            className="m12-btn m12-btn-ghost"
            style={{ padding: '0 10px' }}
            onClick={() => setMuted((m) => !m)}
            aria-label={muted ? '取消静音' : '静音'}
          >
            {muted ? <VolumeX size={14} /> : <Volume2 size={14} />}
          </button>
        </div>

        <div style={{ fontSize: '12.5px', color: '#b7d2f0', lineHeight: 1.55 }}>
          {activeSlide.caption}
        </div>
      </div>
    </ModalShell>
  );
}

export function MediaDetailModal({
  slide,
  topic,
  onJumpTopic,
  onSwitchToVideo,
  onClose,
}: {
  slide: PinganSlideDTO;
  topic: PinganTopicDTO | null;
  onJumpTopic: (topicId: string) => void;
  onSwitchToVideo: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`${slide.title} · 工程现场图例`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            position: 'relative',
            borderRadius: '9px',
            overflow: 'hidden',
            border: '1px solid rgba(56,220,255,0.45)',
            background: '#041028',
          }}
        >
          <img
            src={slide.imgPath}
            alt={slide.title}
            style={{
              width: '100%',
              maxHeight: '320px',
              objectFit: 'cover',
              display: 'block',
            }}
          />
          <StageHudSvg slide={slide} />
        </div>

        <div className="detail-grid">
          {slide.telemetry.map((m) => (
            <div key={m.label} className="detail-stat-card">
              <span>{m.label}</span>
              <strong style={{ fontSize: '15px' }}>{m.value}</strong>
            </div>
          ))}
        </div>

        <div style={{ fontSize: '12.5px', color: '#dbeafe', lineHeight: 1.6 }}>
          {slide.caption}
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          {topic ? (
            <button
              type="button"
              className="m12-btn m12-btn-ghost"
              onClick={() => onJumpTopic(topic.id)}
            >
              查看课题 {topic.id}
            </button>
          ) : null}
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            onClick={onSwitchToVideo}
          >
            <Play size={13} />
            进入专题视频动态演示
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function DeliverablesModal({
  topic,
  categoryKey,
  onJumpTopic,
  onClose,
}: {
  topic: PinganTopicDTO;
  categoryKey: 'midterm' | 'patent' | 'acceptance';
  onJumpTopic: (topicId: string) => void;
  onClose: () => void;
}) {
  const catLabelMap: Record<'midterm' | 'patent' | 'acceptance', string> = {
    midterm: '中期评审资料',
    patent: '专利 / 论文 / 标准',
    acceptance: '验收与推广资料',
  };
  const catLabel = catLabelMap[categoryKey] ?? '课题阶段资料';
  const docs = topic.deliverables?.[categoryKey] ?? [];

  return (
    <ModalShell title={`${topic.id} · ${catLabel}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: '10px',
            flexWrap: 'wrap',
          }}
        >
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#ffffff' }}>
              {topic.name}
            </div>
            <div style={{ fontSize: '12px', color: '#a9c6e8', marginTop: '2px' }}>
              研究方向：{topic.direction} · 当前阶段：{topic.stage}
            </div>
          </div>
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            onClick={() => onJumpTopic(topic.id)}
          >
            前往专题管理编辑
          </button>
        </div>

        <TopicProgressSvg topic={topic} />

        <div className="m12-modal-list">
          {docs.length > 0 ? (
            docs.map((d) => (
              <div key={d.title} className="m12-modal-doc-card">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <strong style={{ color: '#f1f7ff', fontSize: '13px' }}>{d.title}</strong>
                  <span className="status-tag info">{d.type}</span>
                </div>
                <div style={{ fontSize: '12px', color: '#a9c6e8', lineHeight: 1.5 }}>
                  {d.summary}
                </div>
                <div style={{ fontSize: '11.5px', color: '#789bc4' }}>
                  归档日期：{d.date} · 文件大小：{d.size}
                </div>
              </div>
            ))
          ) : (
            <div style={{ color: '#9cb8dc', fontSize: '12.5px' }}>
              暂无该类归档文件。
            </div>
          )}
        </div>
      </div>
    </ModalShell>
  );
}

export function FeaturedResultModal({
  result,
  topic,
  onJumpTopic,
  onClose,
}: {
  result: PinganFeaturedResultDTO;
  topic: PinganTopicDTO | null;
  onJumpTopic: (topicId: string) => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`阶段成果详情 · ${result.title}`} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div className="detail-grid">
          <div className="detail-stat-card">
            <span>所属课题</span>
            <strong style={{ fontSize: '14px' }}>
              {result.topicId} · {result.topicLabel}
            </strong>
          </div>
          <div className="detail-stat-card">
            <span>编制单位</span>
            <strong style={{ fontSize: '14px' }}>{result.author}</strong>
          </div>
          <div className="detail-stat-card">
            <span>更新日期</span>
            <strong style={{ fontSize: '14px' }}>{result.date}</strong>
          </div>
        </div>

        <div className="m12-modal-doc-card">
          <strong style={{ color: '#38f2ff', fontSize: '13px' }}>成果概要</strong>
          <div style={{ fontSize: '12.5px', color: '#dbeafe', lineHeight: 1.6 }}>
            {result.summary}
          </div>
          <div
            style={{
              display: 'flex',
              gap: '8px',
              flexWrap: 'wrap',
              marginTop: '6px',
            }}
          >
            {result.metrics.map((m) => (
              <span key={m} className="status-tag ok">
                {m}
              </span>
            ))}
          </div>
        </div>

        {topic ? <TopicProgressSvg topic={topic} /> : null}

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <button
            type="button"
            className="m12-btn m12-btn-primary"
            onClick={() => onJumpTopic(result.topicId)}
          >
            在专题管理中查看课题
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function AddTopicModal({
  nextIdPreview,
  submitting,
  onSubmit,
  onClose,
}: {
  nextIdPreview: string;
  submitting: boolean;
  onSubmit: (payload: {
    name: string;
    direction: string;
    stage: string;
    achievements: string;
    summary: string;
    note: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState('');
  const [direction, setDirection] = useState<string>(DIRECTION_LIST[0]);
  const [stage, setStage] = useState<string>(STAGE_LIST[0]);
  const [achievements, setAchievements] = useState('');
  const [summary, setSummary] = useState('');
  const [note, setNote] = useState('');

  return (
    <ModalShell title="新增平安工地研究专题" onClose={onClose}>
      <form
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
        onSubmit={(e) => {
          e.preventDefault();
          void onSubmit({
            name: name.trim(),
            direction,
            stage,
            achievements: achievements.trim(),
            summary: summary.trim(),
            note: note.trim(),
          });
        }}
      >
        <div className="m12-field-row2">
          <div className="m12-field">
            <label htmlFor="m12NewId">课题编号</label>
            <input
              id="m12NewId"
              className="m12-input"
              type="text"
              value={nextIdPreview}
              readOnly
              style={{ opacity: 0.85 }}
            />
          </div>
          <div className="m12-field">
            <label htmlFor="m12NewDir">研究方向</label>
            <select
              id="m12NewDir"
              className="m12-select"
              value={direction}
              onChange={(e) => setDirection(e.target.value)}
            >
              {DIRECTION_LIST.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="m12-field">
          <label htmlFor="m12NewName">专题名称 *</label>
          <input
            id="m12NewName"
            className="m12-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：寒区桥梁伸缩缝耐久与防冰除雪技术研究"
            required
          />
        </div>

        <div className="m12-field-row2">
          <div className="m12-field">
            <label htmlFor="m12NewStage">当前推进阶段</label>
            <select
              id="m12NewStage"
              className="m12-select"
              value={stage}
              onChange={(e) => setStage(e.target.value)}
            >
              {STAGE_LIST.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
          <div className="m12-field">
            <label htmlFor="m12NewResults">已有成果</label>
            <input
              id="m12NewResults"
              className="m12-input"
              type="text"
              value={achievements}
              onChange={(e) => setAchievements(e.target.value)}
              placeholder="例如：立项申报书、调研报告"
            />
          </div>
        </div>

        <div className="m12-field">
          <label htmlFor="m12NewIntro">项目简介 *</label>
          <textarea
            id="m12NewIntro"
            className="m12-textarea"
            rows={3}
            value={summary}
            onChange={(e) => setSummary(e.target.value)}
            placeholder="简述课题研究内容、技术路线与预期成果"
            required
          />
        </div>

        <div className="m12-field">
          <label htmlFor="m12NewRemark">备注</label>
          <input
            id="m12NewRemark"
            className="m12-input"
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="例如：待开展现场踏勘"
          />
        </div>

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '4px',
          }}
        >
          <button
            type="button"
            className="m12-btn m12-btn-ghost"
            onClick={onClose}
            disabled={submitting}
          >
            取消
          </button>
          <button
            type="submit"
            className="m12-btn m12-btn-primary"
            disabled={submitting}
          >
            <Plus size={14} />
            {submitting ? '提交中...' : '确认新增'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}
