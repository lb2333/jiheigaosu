'use client';

import { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize2,
  ChevronRight,
  Video,
  Layers,
  Landmark,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { LEGACY_ICONS } from '@/lib/modules/platform-data';
import { fmtTime, type ApiTopic } from '../types';

export interface ShowcaseSubPageProps {
  topics: ApiTopic[];
}

export function ShowcaseSubPage({ topics }: ShowcaseSubPageProps) {
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);

  const [scTopicIndex, setScTopicIndex] = useState(0);
  const [scPlaying, setScPlaying] = useState(false);
  const [scAutoCarousel, setScAutoCarousel] = useState(false);
  const [scHallMode, setScHallMode] = useState(false);
  const [scMinimized, setScMinimized] = useState(false);
  const [scClosed, setScClosed] = useState(false);
  const [scCurrentSec, setScCurrentSec] = useState(0);
  const [scVolume, setScVolume] = useState(78);
  const [scMuted, setScMuted] = useState(false);
  const [scSpeed, setScSpeed] = useState(1.0);

  // Sync Cesium layers & overlays for showcase
  useEffect(() => {
    const ces = getGlobalCesiumEngine();
    if (!ces.ready) return;
    ces.applyLayers({
      satellite: false,
      uav: true,
      bim: true,
      models: true,
      pois: true,
      sections: true,
      route: true,
      designMode: false,
      activeSectionId: null,
    });
    ces.syncHtmlOverlays({
      showRoute: true,
      showSections: false,
      showPois: false,
      icons: LEGACY_ICONS,
    });
  }, [cesiumReady]);

  // Frame stationary G1211 overview once when entering showcase
  useEffect(() => {
    const ces = getGlobalCesiumEngine();
    if (!ces.ready) return;
    ces.setShowcaseBackdropMode(true);
    return () => {
      if (ces.ready) ces.setShowcaseBackdropMode(false);
    };
  }, [cesiumReady]);

  // Simulation timer for showcase playback & auto-carousel
  useEffect(() => {
    if (!scPlaying || scClosed || !topics.length) return;
    const timer = window.setInterval(() => {
      if (document.hidden) return;
      const currentTopic = topics[scTopicIndex] ?? topics[0];
      setScCurrentSec((sec) => {
        const next = sec + scSpeed;
        if (next >= currentTopic.durationSec) {
          if (scAutoCarousel) {
            setScTopicIndex((i) => (i + 1) % topics.length);
          }
          return 0;
        }
        return next;
      });
    }, 1000);
    return () => window.clearInterval(timer);
  }, [scAutoCarousel, scClosed, scPlaying, scSpeed, scTopicIndex, topics]);

  const topic = topics[scTopicIndex] ?? topics[0];
  const chIdx = topic
    ? Math.min(topic.chapters.length - 1, Math.floor((scCurrentSec / Math.max(1, topic.durationSec)) * topic.chapters.length))
    : 0;

  return (
    <section className="page-view active" id="page-showcase">
      <div className="showcase-backdrop-dim" />
      <div className="showcase-top-pills">
        <div className="scene-mode-pill">• 场景示意 · 模型演示 •</div>
        <button
          type="button"
          className={`hall-mode-btn ${scHallMode ? 'active' : ''}`}
          onClick={() => {
            const next = !scHallMode;
            setScHallMode(next);
            setScClosed(false);
            setScMinimized(false);
            if (next) setScPlaying(true);
          }}
        >
          <Landmark size={15} />
          <span>{scHallMode ? '退出展厅' : '展厅模式'}</span>
        </button>
      </div>

      <div className={`hud-left-col ${scHallMode ? 'hall-hidden' : ''}`}>
        <GlassPanel title="演示专题">
          <div className="topic-list">
            {topics.map((t, i) => (
              <button
                key={t.id}
                type="button"
                className={`topic-card ${i === scTopicIndex ? 'active' : ''}`}
                onClick={() => {
                  setScTopicIndex(i);
                  setScCurrentSec(0);
                  setScClosed(false);
                  setScMinimized(false);
                }}
              >
                <span className="topic-icon">
                  <Layers size={16} />
                </span>
                <div className="topic-info">
                  <div className="topic-title">{t.title}</div>
                  <div className="topic-desc">{t.subtitle}</div>
                </div>
                {i !== scTopicIndex ? (
                  <span className="topic-arrow">
                    <ChevronRight size={13} />
                  </span>
                ) : null}
              </button>
            ))}
          </div>
        </GlassPanel>
      </div>

      {topic && !scClosed ? (
        <div className={`theater-window ${scMinimized ? 'minimized' : ''} ${scHallMode ? 'hall-expanded' : ''}`}>
          <div className="theater-bar">
            <div className="theater-title">
              <Video size={15} />
              <span>{topic.videoTitle}</span>
            </div>
            <div className="theater-win-btns">
              <button type="button" className="theater-win-btn" onClick={() => setScMinimized((m) => !m)}>
                −
              </button>
              <button
                type="button"
                className="theater-win-btn"
                onClick={() => {
                  setScClosed(true);
                  setScPlaying(false);
                }}
              >
                ×
              </button>
            </div>
          </div>
          <div className={`theater-stage ${scPlaying ? 'playing' : ''}`}>
            <img src={topic.imgPath} alt={topic.title} loading="lazy" decoding="async" />
            <button
              type="button"
              className="theater-big-play"
              onClick={() => setScPlaying((p) => !p)}
            >
              {scPlaying ? <Pause size={24} /> : <Play size={26} fill="currentColor" />}
            </button>
            <div className="theater-hud-caption">
              <div>
                <span className="hud-caption-tag">
                  展厅讲解 · 章节 {chIdx + 1}/{topic.chapters.length}
                </span>
                <div className="hud-caption-text">{topic.chapters[chIdx]}</div>
              </div>
              <div className="hud-kpi-pills">
                {topic.kpis.map((k) => (
                  <div key={k.label} className="hud-kpi-pill">
                    <strong>{k.val}</strong>
                    <span>{k.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div className={`hud-right-col ${scHallMode ? 'hall-hidden' : ''}`}>
        <GlassPanel title="演示控制">
          <div className="ctrl-grid">
            <button
              type="button"
              className="ctrl-btn primary"
              onClick={() => {
                setScClosed(false);
                setScMinimized(false);
                setScPlaying(true);
              }}
            >
              {scPlaying ? <Pause size={14} /> : <Play size={14} />}
              <span>{scPlaying ? '演示中' : '开始演示'}</span>
            </button>
            <button
              type="button"
              className={`ctrl-btn ${scAutoCarousel ? 'active-toggle' : ''}`}
              onClick={() => {
                const next = !scAutoCarousel;
                setScAutoCarousel(next);
                if (next) setScPlaying(true);
              }}
            >
              ⟳ <span>自动轮播</span>
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
            >
              <Maximize2 size={14} />
              <span>全屏展示</span>
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => {
                if (!topics.length) return;
                setScTopicIndex((i) => (i + 1) % topics.length);
                setScCurrentSec(0);
              }}
            >
              ⧉ <span>切换专题</span>
            </button>
            <button type="button" className="ctrl-btn" onClick={() => setScPlaying(false)}>
              <Pause size={14} />
              <span>暂停</span>
            </button>
            <button
              type="button"
              className="ctrl-btn"
              onClick={() => {
                if (!topics.length) return;
                setScTopicIndex((i) => (i - 1 + topics.length) % topics.length);
                setScCurrentSec(0);
              }}
            >
              ← <span>上一页</span>
            </button>
            <button
              type="button"
              className="ctrl-btn full"
              onClick={() => {
                if (!topics.length) return;
                setScTopicIndex((i) => (i + 1) % topics.length);
                setScCurrentSec(0);
              }}
            >
              → <span>下一页</span>
            </button>
          </div>
        </GlassPanel>

        <GlassPanel title="内容摘要" className="flex-1 overflow-y-auto">
          <div className="summary-list">
            {(topic?.summaries ?? []).map((s) => (
              <div key={s.title} className="summary-item">
                <span className="summary-dot" />
                <div>
                  <div className="summary-title">{s.title}</div>
                  <div className="summary-desc">{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      </div>

      {topic ? (
        <div className="showcase-player-bar">
          <button type="button" className="mini-ctrl-btn" onClick={() => setScPlaying((p) => !p)}>
            {scPlaying ? <Pause size={15} /> : <Play size={15} />}
          </button>
          <span className="mini-time" style={{ fontSize: 12.5 }}>
            {fmtTime(scCurrentSec)} / {topic.durationStr}
          </span>
          <input
            className="player-slider"
            type="range"
            min={0}
            max={topic.durationSec}
            value={scCurrentSec}
            onChange={(e) => setScCurrentSec(Number(e.target.value))}
          />
          <button type="button" className="mini-ctrl-btn" onClick={() => setScMuted((m) => !m)}>
            {scMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
          </button>
          <input
            className="vol-slider"
            type="range"
            min={0}
            max={100}
            value={scMuted ? 0 : scVolume}
            onChange={(e) => {
              const v = Number(e.target.value);
              setScVolume(v);
              setScMuted(v === 0);
            }}
          />
          <button
            type="button"
            className="dock-btn"
            style={{ padding: '3px 9px', minWidth: 52, justifyContent: 'center' }}
            onClick={() => {
              const speeds = [1.0, 1.25, 1.5, 2.0, 0.75];
              setScSpeed(speeds[(speeds.indexOf(scSpeed) + 1) % speeds.length]);
            }}
          >
            {scSpeed.toFixed(1)}x
          </button>
          <button
            type="button"
            className="mini-ctrl-btn"
            onClick={() => document.documentElement.requestFullscreen?.().catch(() => {})}
          >
            <Maximize2 size={15} />
          </button>
        </div>
      ) : null}
    </section>
  );
}
