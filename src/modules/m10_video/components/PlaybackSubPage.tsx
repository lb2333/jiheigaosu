'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  Crosshair,
  ExternalLink,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Search,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import {
  buildFallbackPlaybackAlarm,
  buildPlaybackSegments,
  formatMmSs,
  getClipLabel,
  getPlaybackClockStr,
  getRangeStartHour,
  pad2,
  PLAYBACK_DATES,
  PLAYBACK_RANGES,
  PLAYBACK_SPEEDS,
  SECTION_BY_ID,
  type VideoCameraDTO,
  type VideoPlaybackAlarmDTO,
} from '../types';
import { VideoCanvas } from './VideoCanvas';
import {
  FullscreenCameraModal,
  PlaybackSourceModal,
  SafetyRecordModal,
  ScreenshotModal,
} from './VideoModals';

interface PlaybackSubPageProps {
  activeSectionId: string | null;
  initialCamId?: string;
  initialDate?: string;
  initialClipIdx?: number;
  initialSecInClip?: number;
  onJumpSafety: () => void;
  showToast: (msg: string) => void;
}

const FALLBACK_CAM: VideoCameraDTO = {
  id: 'CAM-YD-A01',
  sectionId: 'sec2',
  sectionName: '二工区',
  name: '料场示例A·消防通道',
  stake: 'K28+400',
  location: '料棚东侧',
  siteType: '料场',
  purpose: '消防通道巡查',
  status: '在线',
  sceneType: 'yardLane',
  lastTime: '2026-11-26 10:45:12',
  source: '原视频系统',
  resolution: '2560×1440',
  ip: '10.12.24.101',
  faultNote: '',
  sortOrder: 1,
};

export function PlaybackSubPage({
  activeSectionId,
  initialCamId,
  initialDate,
  initialClipIdx,
  initialSecInClip,
  onJumpSafety,
  showToast,
}: PlaybackSubPageProps) {
  const [camId, setCamId] = useState(initialCamId || 'CAM-YD-A01');
  const [date, setDate] = useState(initialDate || '2026-11-26');
  const [range, setRange] = useState('09:00–10:00');
  const [clipIdx, setClipIdx] = useState(initialClipIdx ?? 1);
  const [secInClip, setSecInClip] = useState(initialSecInClip ?? 752);
  const [playing, setPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  const [playableCameras, setPlayableCameras] = useState<VideoCameraDTO[]>([
    FALLBACK_CAM,
  ]);
  const [currentCam, setCurrentCam] = useState<VideoCameraDTO>(FALLBACK_CAM);
  const [alarm, setAlarm] = useState<VideoPlaybackAlarmDTO>(() =>
    buildFallbackPlaybackAlarm(FALLBACK_CAM, '2026-11-26', '09:00–10:00')
  );

  const canvasElRef = useRef<HTMLCanvasElement | null>(null);
  const [screenshotSrc, setScreenshotSrc] = useState<string | null>(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [showSourceModal, setShowSourceModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPlayback = useCallback(
    async (targetCamId: string, targetDate: string, targetRange: string) => {
      try {
        const params = new URLSearchParams({
          camId: targetCamId,
          date: targetDate,
          range: targetRange,
        });
        const res = await fetch(`/api/v1/m10/playback?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (data.playableCameras) setPlayableCameras(data.playableCameras);
        if (data.camera) setCurrentCam(data.camera);
        if (data.alarm) setAlarm(data.alarm);
      } catch {
        showToast('加载历史录像信息失败');
      }
    },
    [showToast]
  );

  useEffect(() => {
    void fetchPlayback(camId, date, range);
  }, [camId, date, range, fetchPlayback]);

  // Sync section pill change to first playable camera in that section
  useEffect(() => {
    if (!activeSectionId || !SECTION_BY_ID[activeSectionId]) return;
    if (playableCameras.length === 0) return;
    const match = playableCameras.find((c) => c.sectionId === activeSectionId);
    if (match && match.id !== camId && !initialCamId) {
      setCamId(match.id);
    }
  }, [activeSectionId, playableCameras]); // eslint-disable-line react-hooks/exhaustive-deps

  // Playback ticker
  useEffect(() => {
    if (!playing) return;
    const timer = window.setInterval(() => {
      setSecInClip((prev) => {
        const next = prev + speed;
        if (next >= 900) {
          if (clipIdx < 3) {
            setClipIdx((c) => Math.min(3, c + 1));
            return 0;
          }
          setPlaying(false);
          return 900;
        }
        return next;
      });
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [playing, speed, clipIdx]);

  const startH = getRangeStartHour(range);
  const playbackClock = getPlaybackClockStr(date, range, clipIdx, secInClip);
  const playheadPct = ((clipIdx * 900 + secInClip) / 3600) * 100;
  const alarmPct = ((alarm.alarmClipIdx * 900 + alarm.alarmSecInClip) / 3600) * 100;
  const alarmShortTime = alarm.alarmTime.split(' ')[1] || '09:27:32';
  const isNearAlarm =
    clipIdx === alarm.alarmClipIdx &&
    Math.abs(secInClip - alarm.alarmSecInClip) <= 45;

  const clips = useMemo(() => {
    return buildPlaybackSegments(range, alarm.alarmClipIdx);
  }, [range, alarm.alarmClipIdx]);

  const ticks = useMemo(() => {
    return [0, 15, 30, 45, 60].map((m) => {
      const hh = m === 60 ? startH + 1 : startH;
      const mm = m === 60 ? 0 : m;
      return `${pad2(hh)}:${pad2(mm)}`;
    });
  }, [startH]);

  function seekToAlarm() {
    setClipIdx(alarm.alarmClipIdx);
    setSecInClip(alarm.alarmSecInClip);
    showToast(`已精确定位至告警时刻 ${alarm.alarmTime}`);
  }

  function handleOpenScreenshot() {
    let imgSrc = '';
    try {
      if (canvasElRef.current) {
        imgSrc = canvasElRef.current.toDataURL('image/png');
      }
    } catch {
      imgSrc = '';
    }
    setScreenshotSrc(imgSrc);
  }

  async function handleSaveScreenshot() {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m10/playback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          cameraId: currentCam.id,
          recordDate: date,
          capturedAt: playbackClock,
          clipLabel: getClipLabel(range, clipIdx),
          note: `历史录像截图取证（${alarm.title}）`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '截图归档失败');
        return;
      }
      setScreenshotSrc(null);
      showToast(`截图取证已归档（${currentCam.id} · ${playbackClock}）`);
    } catch {
      showToast('截图归档失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setCamId('CAM-YD-A01');
    setDate('2026-11-26');
    setRange('09:00–10:00');
    setClipIdx(1);
    setSecInClip(752);
    setPlaying(false);
    setSpeed(1);
  }

  return (
    <div className="m10-page">
      {/* Top Query Bar */}
      <div className="glass-panel m10-filter-bar">
        <div className="m10-filter-fields">
          <div className="m10-field">
            <span className="m10-field-label">回放设备</span>
            <select
              className="glass-select m10-select wide"
              value={camId}
              onChange={(e) => {
                setCamId(e.target.value);
                setPlaying(false);
              }}
            >
              {playableCameras.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id} · {c.name.split('·').pop()}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">录像日期</span>
            <select
              className="glass-select m10-select"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            >
              {PLAYBACK_DATES.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">时间范围</span>
            <select
              className="glass-select m10-select"
              value={range}
              onChange={(e) => setRange(e.target.value)}
            >
              {PLAYBACK_RANGES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m10-filter-actions">
          <button
            type="button"
            className="m10-btn-query"
            onClick={() => {
              void fetchPlayback(camId, date, range);
              showToast(`已加载 ${camId}（${date} ${range}）录像片段`);
            }}
          >
            <Search size={14} />
            <span>查询</span>
          </button>
          <button type="button" className="m10-btn-outline" onClick={handleReset}>
            <RotateCcw size={14} />
            <span>重置</span>
          </button>
        </div>
      </div>

      {/* Main Split */}
      <div className="m10-split-66-34">
        {/* Left: Playback Player + Interactive Timeline */}
        <GlassPanel
          title="历史录像回放"
          headerRight={
            <div className="m10-header-meta">
              <span className="m10-tag ok">可回放</span>
              <span style={{ color: '#dbeafe', fontWeight: 600 }}>
                {currentCam.sectionName}·{currentCam.name}
              </span>
            </div>
          }
        >
          <div className="m10-player-wrap">
            <div className="m10-feed-box playback">
              <VideoCanvas
                id="m10PbCanvas"
                width={840}
                height={430}
                status="在线"
                sceneType={currentCam.sceneType}
                mode="playback"
                playbackSec={secInClip}
                showAlarmBox={isNearAlarm}
                alarmBoxLabel={alarm.title}
                onCanvasRef={(el) => {
                  canvasElRef.current = el;
                }}
              />
              <div className="m10-hud-tl">
                <span className="m10-hud-pill">{currentCam.id}</span>
              </div>
              <div className="m10-hud-tr">
                <span className="m10-hud-pill">回 历史回放</span>
              </div>
              <div className="m10-hud-bl">
                <span className="m10-hud-pill">{playbackClock}</span>
              </div>
              {isNearAlarm ? (
                <div className="m10-hud-br">
                  <span className="m10-hud-pill warn">
                    <AlertTriangle size={12} />
                    <span>关联告警时刻</span>
                  </span>
                </div>
              ) : null}
            </div>

            {/* Controls */}
            <div className="m10-ctrl-bar">
              <button
                type="button"
                className="m10-play-btn"
                title={playing ? '暂停' : '播放'}
                onClick={() => setPlaying((p) => !p)}
              >
                {playing ? <Pause size={14} /> : <Play size={14} />}
              </button>
              <span className="m10-time-txt">
                {formatMmSs(secInClip)} / 15:00
              </span>
              <input
                className="m10-scrubber"
                type="range"
                min={0}
                max={900}
                value={Math.floor(secInClip)}
                onChange={(e) =>
                  setSecInClip(Number.parseInt(e.target.value, 10) || 0)
                }
              />
              <select
                className="glass-select speed-select"
                value={speed}
                onChange={(e) => {
                  const sp = Number.parseFloat(e.target.value) || 1;
                  setSpeed(sp);
                  showToast(`回放倍速已切换为 ${sp}x`);
                }}
              >
                {PLAYBACK_SPEEDS.map((sp) => (
                  <option key={sp} value={sp}>
                    {sp}x
                  </option>
                ))}
              </select>
              <button
                type="button"
                className="m10-btn-outline"
                style={{ height: '30px' }}
                onClick={handleOpenScreenshot}
              >
                <Camera size={14} />
                <span>截图取证</span>
              </button>
              <button
                type="button"
                className="m10-fs-btn"
                style={{ width: '30px', height: '30px' }}
                title="全屏回放"
                onClick={() => setShowFullscreen(true)}
              >
                <Maximize2 size={13} />
              </button>
            </div>

            {/* Interactive Timeline */}
            <div className="m10-timeline-card">
              <div className="m10-tl-head">
                <span>录像时轴</span>
                <div className="m10-tl-legend">
                  <span>
                    <i
                      className="m10-tl-bar-swatch"
                      style={{ background: '#38f2ff' }}
                    />{' '}
                    有录像
                  </span>
                  <span>
                    <i
                      className="m10-tl-bar-swatch"
                      style={{ background: '#facc15' }}
                    />{' '}
                    告警片段
                  </span>
                </div>
              </div>
              <div
                className="m10-tl-track"
                title="点击时轴任意位置定位回放"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const ratio = Math.max(
                    0,
                    Math.min(1, (e.clientX - rect.left) / rect.width)
                  );
                  const totalSec = Math.floor(ratio * 3600);
                  const nextClip = Math.min(3, Math.floor(totalSec / 900));
                  setClipIdx(nextClip);
                  setSecInClip(totalSec - nextClip * 900);
                }}
              >
                <div className="m10-tl-rail">
                  <div className="m10-tl-rec" />
                  <div
                    className="m10-tl-window"
                    style={{ left: `${clipIdx * 25}%`, width: '25%' }}
                  />
                </div>
                <div
                  className="m10-tl-alarm-badge"
                  style={{ left: `${alarmPct}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToAlarm();
                  }}
                >
                  {alarmShortTime}
                </div>
                <div
                  className="m10-tl-alarm"
                  style={{ left: `${alarmPct}%` }}
                  onClick={(e) => {
                    e.stopPropagation();
                    seekToAlarm();
                  }}
                />
                <div
                  className="m10-tl-playhead"
                  style={{ left: `${Math.max(0, Math.min(100, playheadPct))}%` }}
                />
                <div className="m10-tl-ticks">
                  {ticks.map((tk) => (
                    <span key={tk}>{tk}</span>
                  ))}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '12px',
                color: '#8cb2db',
                padding: '0 2px',
              }}
            >
              <span>
                录像来源 &nbsp;
                <strong style={{ color: '#dbeafe' }}>原视频系统</strong>
              </span>
              <span>
                当前回放 &nbsp;
                <strong style={{ color: '#dbeafe' }}>
                  {getClipLabel(range, clipIdx)}
                </strong>
              </span>
            </div>
          </div>
        </GlassPanel>

        {/* Right Column: Clips + Linked Alarm */}
        <div className="m10-right-stack">
          <GlassPanel
            title="录像片段"
            headerRight={<span className="m10-header-meta">{range}</span>}
          >
            <div className="m10-clip-list">
              {clips.map((cl) => (
                <div
                  key={cl.idx}
                  className={`m10-clip-card ${cl.idx === clipIdx ? 'active' : ''}`}
                  onClick={() => {
                    setClipIdx(cl.idx);
                    setSecInClip(0);
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ color: '#38bdf8' }}>
                      <Play size={14} fill="currentColor" />
                    </span>
                    <div>
                      <div
                        style={{
                          fontWeight: 700,
                          color: '#f1f7ff',
                          fontSize: '13px',
                        }}
                      >
                        {cl.label}
                      </div>
                      <div style={{ fontSize: '11.5px', color: '#8cb2db' }}>
                        原视频系统录像 &nbsp; {cl.durationMin} 分钟
                      </div>
                    </div>
                  </div>
                  <span className={`m10-tag ${cl.hasAlarm ? 'warn' : 'ok'}`}>
                    {cl.hasAlarm ? '含关联告警' : '可回放'}
                  </span>
                </div>
              ))}
            </div>
            <div className="m10-card-foot">
              <span>共 4 段 · 60 分钟</span>
              <button
                type="button"
                className="m10-link-btn"
                onClick={() => setShowSourceModal(true)}
              >
                查看录像来源 &gt;
              </button>
            </div>
          </GlassPanel>

          <GlassPanel title="关联告警片段">
            <div className="m10-inspector-body">
              <div className="m10-ins-title-row">
                <strong style={{ fontSize: '15px', color: '#ffffff' }}>
                  {alarm.title}
                </strong>
                <span className="m10-tag info">{alarm.status}</span>
              </div>
              <div
                className="m10-kv-list"
                style={{ borderBottom: 'none', paddingBottom: '2px' }}
              >
                <div className="m10-kv-row">
                  <span className="m10-kv-key">告警编号</span>
                  <span className="m10-kv-val">{alarm.id}</span>
                </div>
                <div className="m10-kv-row">
                  <span className="m10-kv-key">告警时间</span>
                  <span className="m10-kv-val gold">{alarm.alarmTime}</span>
                </div>
                <div className="m10-kv-row">
                  <span className="m10-kv-key">关联片段</span>
                  <span className="m10-kv-val">{alarm.clipWindow}</span>
                </div>
                <div className="m10-kv-row">
                  <span className="m10-kv-key">关联隐患</span>
                  <span className="m10-kv-val">{alarm.hazardId}</span>
                </div>
              </div>
              <div className="m10-btn-pair">
                <button
                  type="button"
                  className="m10-btn-query"
                  onClick={seekToAlarm}
                >
                  <Crosshair size={14} />
                  <span>定位录像</span>
                </button>
                <button
                  type="button"
                  className="m10-btn-outline"
                  onClick={() => setShowSafetyModal(true)}
                >
                  <ExternalLink size={13} />
                  <span>查看安全管理记录</span>
                </button>
              </div>
              <div className="m10-info-hint">ⓘ {alarm.note}</div>
            </div>
          </GlassPanel>
        </div>
      </div>

      {screenshotSrc !== null ? (
        <ScreenshotModal
          camera={currentCam}
          imgSrc={screenshotSrc}
          clockStr={playbackClock}
          submitting={submitting}
          onSave={handleSaveScreenshot}
          onClose={() => setScreenshotSrc(null)}
        />
      ) : null}

      {showFullscreen ? (
        <FullscreenCameraModal
          camera={currentCam}
          isPlayback
          clockText={playbackClock}
          playbackSec={secInClip}
          showAlarmBox={isNearAlarm}
          alarmLabel={alarm.title}
          onClose={() => setShowFullscreen(false)}
        />
      ) : null}

      {showSourceModal ? (
        <PlaybackSourceModal
          camera={currentCam}
          onClose={() => setShowSourceModal(false)}
        />
      ) : null}

      {showSafetyModal ? (
        <SafetyRecordModal
          hazardId={alarm.hazardId}
          alarmId={alarm.id}
          title={alarm.title}
          detail={alarm.safetyDetail}
          sectionName={currentCam.sectionName}
          onJumpSafety={() => {
            setShowSafetyModal(false);
            onJumpSafety();
          }}
          onClose={() => setShowSafetyModal(false)}
        />
      ) : null}
    </div>
  );
}
