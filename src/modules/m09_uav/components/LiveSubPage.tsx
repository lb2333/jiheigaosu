'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Camera,
  ChevronRight,
  Crosshair,
  FileText,
  Flag,
  Home,
  Lock,
  Maximize2,
  Pause,
  Play,
  Video,
} from 'lucide-react';
import {
  formatSecMMSS,
  secLabel,
  type UavFleetDTO,
  type UavLiveEventDTO,
  type UavTaskDTO,
} from '../types';
import {
  LiveEventsModal,
  LiveFullscreenModal,
  LiveGimbalModal,
  LiveMarkClueModal,
  LiveRthModal,
  LiveTakeoverModal,
  LiveTaskDetailModal,
} from './UavModalsLazy';

interface LiveResponse {
  tasks: UavTaskDTO[];
  fleet: UavFleetDTO[];
  events: UavLiveEventDTO[];
}

function buildMiniRoutePts(): Array<[number, number]> {
  return [
    [148, 128],
    [76, 118],
    [58, 92],
    [62, 64],
    [78, 42],
    [116, 29],
    [176, 26],
    [238, 30],
    [282, 46],
    [296, 76],
    [288, 106],
    [234, 124],
  ];
}

export function LiveSubPage({
  activeSectionId,
  initialTaskId,
  showToast,
}: {
  activeSectionId: string | null;
  initialTaskId?: string;
  showToast: (msg: string) => void;
}) {
  const [tasks, setTasks] = useState<UavTaskDTO[]>([]);
  const [fleet, setFleet] = useState<UavFleetDTO[]>([]);
  const [events, setEvents] = useState<UavLiveEventDTO[]>([]);

  const [taskId, setTaskId] = useState(initialTaskId || 'UAV-20261126-02');
  const [uavId, setUavId] = useState('UAV-A01');
  const [feedMode, setFeedMode] = useState<'visible' | 'thermal'>('visible');
  const [flightStatus, setFlightStatus] = useState<
    '执行中' | '已暂停' | '返航中' | '人工接管' | '已返航'
  >('执行中');
  const [battery, setBattery] = useState(72);
  const [elapsedSec, setElapsedSec] = useState(600);
  const [wpFloat, setWpFloat] = useState(6.45);
  const [recording, setRecording] = useState(false);
  const [recSeconds, setRecSeconds] = useState(0);
  const [snapCount, setSnapCount] = useState(0);
  const [gimbal, setGimbal] = useState({ pitch: -45, yaw: 0, zoom: 1.0 });
  const [submitting, setSubmitting] = useState(false);

  const [showTaskDetail, setShowTaskDetail] = useState(false);
  const [showMarkClue, setShowMarkClue] = useState(false);
  const [showGimbal, setShowGimbal] = useState(false);
  const [fullscreenUrl, setFullscreenUrl] = useState<string | null>(null);
  const [showRth, setShowRth] = useState(false);
  const [showTakeover, setShowTakeover] = useState(false);
  const [showLogsModal, setShowLogsModal] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Refs synced for smooth RAF drawing without recreating loop
  const liveStateRef = useRef({
    feedMode,
    flightStatus,
    elapsedSec,
    recording,
    recSeconds,
    gimbal,
  });
  liveStateRef.current = {
    feedMode,
    flightStatus,
    elapsedSec,
    recording,
    recSeconds,
    gimbal,
  };

  const loadData = useCallback(async () => {
    const res = await fetch('/api/v1/m09/live');
    if (res.ok) {
      const json = (await res.json()) as LiveResponse;
      setTasks(json.tasks ?? []);
      setFleet(json.fleet ?? []);
      setEvents(json.events ?? []);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  useEffect(() => {
    if (!activeSectionId || !tasks.length) return;
    const match = tasks.find((t) => t.sectionId === activeSectionId);
    if (match) setTaskId(match.id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSectionId]);

  // Preload aerial image once
  useEffect(() => {
    const img = new Image();
    img.src = '/assets/milestone_before.jpg';
    imgRef.current = img;
    return () => {
      imgRef.current = null;
    };
  }, []);

  // RAF loop for animated canvas feed
  useEffect(() => {
    let rafId = 0;
    let alive = true;

    const drawFrame = () => {
      if (!alive) return;
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx2d = canvas.getContext('2d');
        if (ctx2d) {
          const w = canvas.width;
          const h = canvas.height;
          const st = liveStateRef.current;
          const t = Date.now() * 0.001;
          const isThermal = st.feedMode === 'thermal';

          ctx2d.clearRect(0, 0, w, h);

          ctx2d.save();
          const panX = st.flightStatus === '执行中' ? Math.sin(t * 0.35) * 14 : 0;
          const panY = st.flightStatus === '执行中' ? Math.cos(t * 0.25) * 8 : 0;
          ctx2d.translate(
            w / 2 + panX + st.gimbal.yaw * 1.4,
            h / 2 + panY + (st.gimbal.pitch + 45) * 1.1
          );
          ctx2d.scale(st.gimbal.zoom * 1.06, st.gimbal.zoom * 1.06);

          const baseImg = imgRef.current;
          if (baseImg && baseImg.complete && baseImg.naturalWidth > 0) {
            ctx2d.filter = isThermal
              ? 'contrast(1.35) saturate(2.1) hue-rotate(195deg) brightness(0.92)'
              : 'contrast(1.06) saturate(1.12)';
            ctx2d.drawImage(baseImg, -w / 2, -h / 2, w, h);
            ctx2d.filter = 'none';
          } else {
            const bgGrad = ctx2d.createLinearGradient(0, -h / 2, 0, h / 2);
            bgGrad.addColorStop(0, isThermal ? '#1e1b4b' : '#1b3b5a');
            bgGrad.addColorStop(1, isThermal ? '#4c1d95' : '#0f2744');
            ctx2d.fillStyle = bgGrad;
            ctx2d.fillRect(-w / 2, -h / 2, w, h);
          }

          // Yellow dashed detection box
          const bx = w * 0.14;
          const by = h * 0.12;
          const bw = w * 0.19;
          const bh = h * 0.25;
          ctx2d.save();
          ctx2d.strokeStyle = '#facc15';
          ctx2d.lineWidth = 2.5;
          ctx2d.setLineDash([8, 5]);
          ctx2d.lineDashOffset = -(t * 18) % 26;
          ctx2d.strokeRect(bx, by, bw, bh);
          ctx2d.fillStyle = 'rgba(250, 204, 21, 0.14)';
          ctx2d.fillRect(bx, by, bw, bh);
          ctx2d.restore();

          ctx2d.strokeStyle = '#facc15';
          ctx2d.lineWidth = 2;
          ctx2d.beginPath();
          ctx2d.moveTo(bx + bw * 0.5, by);
          ctx2d.lineTo(bx + bw * 0.5, by - 36);
          ctx2d.stroke();

          const pillW = 166;
          const pillH = 28;
          const pillX = bx + bw * 0.5 - pillW / 2;
          const pillY = by - 66;
          ctx2d.fillStyle = 'rgba(130, 86, 10, 0.92)';
          ctx2d.strokeStyle = '#facc15';
          ctx2d.lineWidth = 1.5;
          ctx2d.beginPath();
          ctx2d.roundRect(pillX, pillY, pillW, pillH, 14);
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.fillStyle = '#fef08a';
          ctx2d.font = 'bold 13px "Microsoft YaHei", sans-serif';
          ctx2d.textAlign = 'center';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText('通道占用线索·待核实', pillX + pillW / 2, pillY + pillH / 2);

          const sx = -w * 0.13;
          const sy = -h * 0.17;
          ctx2d.strokeStyle = '#38f2ff';
          ctx2d.lineWidth = 1.8;
          ctx2d.beginPath();
          ctx2d.moveTo(sx, sy);
          ctx2d.lineTo(sx + 28, sy - 48);
          ctx2d.stroke();
          ctx2d.fillStyle = '#38f2ff';
          ctx2d.beginPath();
          ctx2d.arc(sx, sy, 4, 0, Math.PI * 2);
          ctx2d.fill();

          ctx2d.fillStyle = 'rgba(8, 36, 84, 0.88)';
          ctx2d.strokeStyle = '#38f2ff';
          ctx2d.beginPath();
          ctx2d.roundRect(sx - 56, sy - 82, 166, 32, 7);
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.fillStyle = '#ffffff';
          ctx2d.font = 'bold 15px "Microsoft YaHei", sans-serif';
          ctx2d.fillText('二工区料场示例A', sx + 27, sy - 66);

          ctx2d.restore();

          // Crosshair
          ctx2d.strokeStyle = 'rgba(56, 242, 255, 0.45)';
          ctx2d.lineWidth = 1.2;
          ctx2d.beginPath();
          ctx2d.moveTo(w / 2 - 18, h / 2);
          ctx2d.lineTo(w / 2 - 6, h / 2);
          ctx2d.moveTo(w / 2 + 6, h / 2);
          ctx2d.lineTo(w / 2 + 18, h / 2);
          ctx2d.moveTo(w / 2, h / 2 - 18);
          ctx2d.lineTo(w / 2, h / 2 - 6);
          ctx2d.moveTo(w / 2, h / 2 + 6);
          ctx2d.lineTo(w / 2, h / 2 + 18);
          ctx2d.stroke();

          // Top-left timestamp
          const clockStr = `2026-11-26 09:${String(20 + Math.floor(st.elapsedSec / 60)).padStart(2, '0')}:${String(st.elapsedSec % 60).padStart(2, '0')}`;
          ctx2d.fillStyle = 'rgba(5, 20, 48, 0.78)';
          ctx2d.strokeStyle = 'rgba(56, 189, 248, 0.45)';
          ctx2d.lineWidth = 1;
          ctx2d.beginPath();
          ctx2d.roundRect(12, 12, 162, 26, 5);
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.fillStyle = '#e2f1ff';
          ctx2d.font = '600 12px Consolas, monospace';
          ctx2d.textAlign = 'left';
          ctx2d.textBaseline = 'middle';
          ctx2d.fillText(clockStr, 21, 25);

          // Top-right badge
          ctx2d.fillStyle = 'rgba(5, 20, 48, 0.78)';
          ctx2d.beginPath();
          ctx2d.roundRect(w - 114, 12, 102, 26, 5);
          ctx2d.fill();
          ctx2d.stroke();
          ctx2d.fillStyle = isThermal ? '#facc15' : '#bae6fd';
          ctx2d.font = '600 12px "Microsoft YaHei", sans-serif';
          ctx2d.textAlign = 'center';
          ctx2d.fillText(isThermal ? '热成像通道' : '模拟实时画面', w - 63, 25);

          if (st.recording) {
            ctx2d.fillStyle = 'rgba(185, 28, 28, 0.88)';
            ctx2d.beginPath();
            ctx2d.roundRect(184, 12, 92, 26, 5);
            ctx2d.fill();
            ctx2d.fillStyle = '#ffffff';
            ctx2d.font = 'bold 12px sans-serif';
            ctx2d.fillText(`● REC ${formatSecMMSS(st.recSeconds)}`, 230, 25);
          }
        }
      }
      rafId = window.requestAnimationFrame(drawFrame);
    };

    rafId = window.requestAnimationFrame(drawFrame);
    return () => {
      alive = false;
      window.cancelAnimationFrame(rafId);
    };
  }, []);

  // Telemetry 1s tick timer
  useEffect(() => {
    const timer = window.setInterval(() => {
      if (recording) {
        setRecSeconds((s) => s + 1);
      }
      if (flightStatus === '执行中') {
        setElapsedSec((prev) => {
          const next = prev + 1;
          if (next % 25 === 0) {
            setBattery((b) => (b > 18 ? b - 1 : b));
          }
          return next;
        });
        setWpFloat((w) => (w + 0.04) % 12);
      } else if (flightStatus === '返航中') {
        setWpFloat((w) => {
          const next = Math.max(0, w - 0.35);
          if (next <= 0.05) {
            setFlightStatus('已返航');
            showToast('无人机已安全返航至机巢A01');
            return 0;
          }
          return next;
        });
      }
    }, 1000);
    return () => {
      window.clearInterval(timer);
    };
  }, [recording, flightStatus, showToast]);

  const currentTask = useMemo(() => {
    return (
      tasks.find((t) => t.id === taskId) ??
      tasks[1] ??
      tasks[0] ?? {
        id: 'UAV-20261126-02',
        name: '料场全面巡检',
        sectionId: 'sec2',
        target: '料场示例A',
        type: '全面',
        typeFull: '全面巡检',
        scene: '料场巡检',
        planTime: '2026-11-26 09:20',
        shortTime: '11-26 09:20',
        status: '执行中',
        uav: '无人机A01',
        owner: '巡检员A（演示）',
        routeCode: 'LC-A V2.0',
        hangar: '机巢A01',
        checks: ['消防通道', '扬尘覆盖', '围挡封闭', '分区隔离'],
        allChecks: ['消防通道', '扬尘覆盖', '围挡封闭', '分区隔离'],
        preflightPassed: true,
        stage: 4,
        period: '2026年11月',
      }
    );
  }, [tasks, taskId]);

  const activeUav = useMemo(() => {
    return fleet.find((f) => f.id === uavId)?.name ?? '无人机A01';
  }, [fleet, uavId]);

  const wpCur = Math.min(12, Math.floor(wpFloat) + 1);
  const wpPct = Math.round((wpCur / 12) * 100);

  async function postLiveAction(body: Record<string, unknown>) {
    const res = await fetch('/api/v1/m09/live', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const err = (await res.json().catch(() => ({}))) as { error?: string };
      showToast(err.error || '操作未持久化');
      return null;
    }
    return (await res.json()) as {
      clue?: { id: string };
      event?: UavLiveEventDTO;
    };
  }

  async function handleSnapshot() {
    const snapName = `SNAP_${Date.now().toString().slice(-4)}.png`;
    setSnapCount((c) => c + 1);
    const resp = await postLiveAction({
      action: 'snapshot',
      taskId: currentTask.id,
      uavId,
      snapName,
      elapsedLabel: formatSecMMSS(elapsedSec),
    });
    if (resp?.event) {
      setEvents((prev) => [resp.event!, ...prev]);
    }
    showToast(`截图取证成功：${snapName}`);
  }

  async function handleToggleRecording() {
    if (!recording) {
      setRecSeconds(0);
      setRecording(true);
      showToast('已开始录制实时巡检视频片段');
    } else {
      const dur = formatSecMMSS(recSeconds);
      setRecording(false);
      const resp = await postLiveAction({
        action: 'recording',
        taskId: currentTask.id,
        uavId,
        durationLabel: dur,
      });
      if (resp?.event) {
        setEvents((prev) => [resp.event!, ...prev]);
      }
      showToast(`录像片段已保存（${dur}）`);
    }
  }

  async function handleMarkClue(payload: {
    title: string;
    category: string;
    waypoint: string;
  }) {
    setSubmitting(true);
    try {
      const resp = await postLiveAction({
        action: 'markClue',
        taskId: currentTask.id,
        uavId,
        ...payload,
      });
      if (resp?.clue) {
        if (resp.event) {
          setEvents((prev) => [resp.event!, ...prev]);
        }
        setShowMarkClue(false);
        showToast(`已标记线索 ${resp.clue.id}，可在「隐患识别」中核查`);
      }
    } finally {
      setSubmitting(false);
    }
  }

  async function handleTogglePause() {
    if (flightStatus === '执行中') {
      setFlightStatus('已暂停');
      const resp = await postLiveAction({
        action: 'command',
        taskId: currentTask.id,
        uavId,
        command: 'pause',
        text: '操作员触发悬停暂停巡检',
      });
      if (resp?.event) setEvents((prev) => [resp.event!, ...prev]);
      showToast('无人机已在当前航点安全悬停');
    } else {
      setFlightStatus('执行中');
      const resp = await postLiveAction({
        action: 'command',
        taskId: currentTask.id,
        uavId,
        command: 'resume',
        text: '恢复自动航线巡检飞行',
      });
      if (resp?.event) setEvents((prev) => [resp.event!, ...prev]);
      showToast('已恢复自动巡检飞行');
    }
  }

  async function handleConfirmRth() {
    setFlightStatus('返航中');
    setShowRth(false);
    const resp = await postLiveAction({
      action: 'command',
      taskId: currentTask.id,
      uavId,
      command: 'rth',
      text: `下发安全返航指令，正返回${currentTask.hangar}`,
    });
    if (resp?.event) setEvents((prev) => [resp.event!, ...prev]);
    showToast('已触发无人机安全返航仿真');
  }

  async function handleConfirmTakeover() {
    setFlightStatus('人工接管');
    setShowTakeover(false);
    const resp = await postLiveAction({
      action: 'command',
      taskId: currentTask.id,
      uavId,
      command: 'takeover',
      text: '操作员已通过授权核验并接管飞行控制权',
    });
    if (resp?.event) setEvents((prev) => [resp.event!, ...prev]);
    showToast('已进入远程人工接管模式');
  }

  // Mini SVG coordinates
  const pts = buildMiniRoutePts();
  const doneIdx = Math.min(11, Math.max(0, Math.floor(wpFloat)));
  const donePts = pts
    .slice(0, doneIdx + 1)
    .map((p) => p.join(','))
    .join(' ');
  const planPts = [...pts.slice(doneIdx), pts[0]].map((p) => p.join(',')).join(' ');
  const dp = pts[doneIdx];
  const np = pts[(doneIdx + 1) % pts.length];
  const frac = wpFloat - Math.floor(wpFloat);
  const dx = dp[0] + (np[0] - dp[0]) * frac;
  const dy = dp[1] + (np[1] - dp[1]) * frac;

  return (
    <div className="m09-opaque-page">
      {/* Top Selector Bar */}
      <div className="m09-filter-bar">
        <div className="m09-filter-group">
          <label className="m09-field-inline">
            执行任务
            <select
              className="m09-select"
              value={currentTask.id}
              onChange={(e) => setTaskId(e.target.value)}
            >
              {tasks.slice(0, 6).map((t) => (
                <option key={t.id} value={t.id}>
                  {t.id} &nbsp; {t.name}
                </option>
              ))}
            </select>
          </label>
          <label className="m09-field-inline">
            飞行设备
            <select
              className="m09-select"
              value={uavId}
              onChange={(e) => setUavId(e.target.value)}
            >
              {fleet
                .filter((f) => f.status !== '离线维护')
                .map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
            </select>
          </label>
          <label className="m09-field-inline">
            画面
            <select
              className="m09-select"
              value={feedMode}
              onChange={(e) => setFeedMode(e.target.value as 'visible' | 'thermal')}
            >
              <option value="visible">可见光</option>
              <option value="thermal">热成像</option>
            </select>
          </label>
        </div>
        <div className="m09-filter-group">
          <span
            className={`status-tag ${
              flightStatus === '执行中'
                ? 'info'
                : flightStatus === '人工接管'
                  ? 'warn'
                  : 'ok'
            }`}
          >
            {flightStatus}
          </span>
          <button
            type="button"
            className="m09-btn"
            onClick={() => setShowTaskDetail(true)}
          >
            <FileText size={13} /> 任务详情
          </button>
        </div>
      </div>

      {/* Main 2-Column Split */}
      <div className="m09-split-63-37">
        {/* Left Viewport + Controls + Telemetry */}
        <div className="glass-panel">
          <div className="panel-header" style={{ cursor: 'default' }}>
            <div className="panel-title-group">
              <span className="panel-accent-bar" />
              <span className="panel-title">
                {activeUav} · {feedMode === 'thermal' ? '热成像画面' : '可见光画面'}
              </span>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <span className="status-tag info">{flightStatus}</span>
              <span
                className="status-tag"
                style={{
                  background: 'rgba(148,163,184,0.18)',
                  borderColor: 'rgba(148,163,184,0.4)',
                  color: '#cbd5e1',
                }}
              >
                模拟飞行
              </span>
            </div>
          </div>
          <div className="panel-body">
            <div className="m09-live-canvas-wrap">
              <canvas ref={canvasRef} width={920} height={518} />
            </div>

            {/* Media Action Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                marginTop: '10px',
                flexWrap: 'wrap',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '7px',
                  flexWrap: 'wrap',
                }}
              >
                <button
                  type="button"
                  className="m09-btn primary"
                  onClick={() => void handleSnapshot()}
                >
                  <Camera size={13} /> 截图取证
                  {snapCount > 0 ? ` (${snapCount})` : ''}
                </button>
                <button
                  type="button"
                  className={`m09-btn ${recording ? 'gold' : ''}`}
                  onClick={() => void handleToggleRecording()}
                >
                  <Video size={13} /> {recording ? '停止录制' : '录制片段'}
                </button>
                <button
                  type="button"
                  className="m09-btn"
                  onClick={() => setShowMarkClue(true)}
                >
                  <Flag size={13} /> 标记线索
                </button>
                <button
                  type="button"
                  className="m09-btn"
                  onClick={() => setShowGimbal(true)}
                >
                  <Crosshair size={13} /> 云台视角
                </button>
                <button
                  type="button"
                  className="m09-btn"
                  onClick={() => {
                    let url = '/assets/milestone_before.jpg';
                    try {
                      if (canvasRef.current) url = canvasRef.current.toDataURL('image/png');
                    } catch {
                      // fallback
                    }
                    setFullscreenUrl(url);
                  }}
                >
                  <Maximize2 size={13} /> 全屏
                </button>
              </div>
              <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                {secLabel(currentTask.sectionId)}·{currentTask.target}
              </span>
            </div>

            {/* 6 Telemetry Cards */}
            <div className="m09-telemetry-6">
              <div className="m09-tel-card">
                <div className="m09-tel-k">电量</div>
                <div className="m09-tel-v green">
                  {battery}
                  <span>%</span>
                </div>
              </div>
              <div className="m09-tel-card">
                <div className="m09-tel-k">通信</div>
                <div className="m09-tel-v green">正常</div>
              </div>
              <div className="m09-tel-card">
                <div className="m09-tel-k">相对航高</div>
                <div className="m09-tel-v">
                  40<span>m</span>
                </div>
              </div>
              <div className="m09-tel-card">
                <div className="m09-tel-k">飞行速度</div>
                <div className="m09-tel-v">
                  3.0<span>m/s</span>
                </div>
              </div>
              <div className="m09-tel-card">
                <div className="m09-tel-k">已飞时间</div>
                <div className="m09-tel-v">{formatSecMMSS(elapsedSec)}</div>
              </div>
              <div className="m09-tel-card">
                <div className="m09-tel-k">航点</div>
                <div className="m09-tel-v">{wpCur} / 12</div>
              </div>
            </div>

            {/* Flight Control Bar */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                paddingTop: '8px',
                borderTop: '1px solid rgba(56,189,248,0.18)',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="status-tag ok">授权已核验</span>
                <span style={{ fontSize: '12px', color: 'var(--text-sub)' }}>
                  飞行操作（模拟）
                </span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
                <button
                  type="button"
                  className="m09-btn"
                  onClick={() => void handleTogglePause()}
                >
                  {flightStatus === '执行中' ? (
                    <>
                      <Pause size={13} /> 暂停巡检
                    </>
                  ) : (
                    <>
                      <Play size={13} /> 继续巡检
                    </>
                  )}
                </button>
                <button
                  type="button"
                  className="m09-btn"
                  onClick={() => setShowRth(true)}
                >
                  <Home size={13} /> 返航
                </button>
                <button
                  type="button"
                  className="m09-btn gold"
                  onClick={() => setShowTakeover(true)}
                >
                  <Lock size={13} /> 申请接管
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: 航线地图 + 任务信息 + 巡检事件 */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '11px' }}>
          <div className="glass-panel">
            <div className="panel-header" style={{ cursor: 'default' }}>
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">航线地图</span>
              </div>
              <div
                style={{
                  display: 'inline-flex',
                  gap: '10px',
                  fontSize: '11.5px',
                  color: '#cfe6ff',
                }}
              >
                <span className="m09-legend-item">
                  <span className="m09-line-solid" /> 已飞
                </span>
                <span className="m09-legend-item">
                  <span className="m09-line-dash" /> 规划
                </span>
              </div>
            </div>
            <div className="panel-body">
              <svg
                viewBox="0 0 360 152"
                style={{
                  width: '100%',
                  display: 'block',
                  borderRadius: '7px',
                  border: '1px solid rgba(56,189,248,0.32)',
                  background: '#071b3d',
                }}
              >
                <defs>
                  <clipPath id="m09-mini-clip">
                    <rect width="360" height="152" rx="7" />
                  </clipPath>
                </defs>
                <image
                  href="/assets/corridor_aerial.jpg"
                  width="360"
                  height="152"
                  preserveAspectRatio="xMidYMid slice"
                  opacity="0.62"
                  clipPath="url(#m09-mini-clip)"
                />
                <rect width="360" height="152" fill="rgba(4,16,38,0.36)" />
                <polyline
                  points={planPts}
                  fill="none"
                  stroke="#e2e8f0"
                  strokeWidth="2"
                  strokeDasharray="6 4"
                />
                <polyline
                  points={donePts}
                  fill="none"
                  stroke="#38f2ff"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <circle
                  cx={pts[0][0]}
                  cy={pts[0][1]}
                  r="9"
                  fill="#0c2f66"
                  stroke="#38f2ff"
                  strokeWidth="1.5"
                />
                <text
                  x={pts[0][0]}
                  y={pts[0][1] + 3.5}
                  fill="#fff"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  01
                </text>
                <circle
                  cx="182"
                  cy="127"
                  r="9"
                  fill="#0d4f38"
                  stroke="#22c55e"
                  strokeWidth="1.5"
                />
                <text
                  x="182"
                  y="130.5"
                  fill="#bbf7d0"
                  fontSize="9.5"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  H
                </text>
                <circle
                  cx={pts[11][0]}
                  cy={pts[11][1]}
                  r="9"
                  fill="#0c2f66"
                  stroke="#38f2ff"
                  strokeWidth="1.5"
                />
                <text
                  x={pts[11][0]}
                  y={pts[11][1] + 3.5}
                  fill="#fff"
                  fontSize="9"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  12
                </text>
                <circle
                  cx={dx}
                  cy={dy}
                  r="7"
                  fill="#0e7490"
                  stroke="#fff"
                  strokeWidth="1.8"
                />
                <text
                  x={dx}
                  y={dy + 3}
                  fill="#fff"
                  fontSize="8.5"
                  fontWeight="800"
                  textAnchor="middle"
                >
                  {String(doneIdx + 1).padStart(2, '0')}
                </text>
                <rect
                  x={dx - 32}
                  y={Math.max(4, dy - 30)}
                  width="64"
                  height="18"
                  rx="4"
                  fill="rgba(6,30,72,0.92)"
                  stroke="#38f2ff"
                />
                <text
                  x={dx}
                  y={Math.max(16, dy - 18)}
                  fill="#38f2ff"
                  fontSize="10"
                  fontWeight="700"
                  textAnchor="middle"
                >
                  A01 · {String(doneIdx + 1).padStart(2, '0')}
                </text>
              </svg>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '12px',
                  margin: '7px 0 4px',
                }}
              >
                <span style={{ color: 'var(--text-sub)' }}>
                  已到达 {wpCur} / 12 航点
                </span>
                <strong style={{ color: '#38f2ff' }}>{wpPct}%</strong>
              </div>
              <div className="m09-cov-track">
                <div className="m09-cov-fill" style={{ width: `${wpPct}%` }} />
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-header" style={{ cursor: 'default' }}>
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">任务信息</span>
              </div>
              <span className="status-tag ok">飞前检查已通过</span>
            </div>
            <div className="panel-body">
              <div className="m09-kv-row">
                <span className="m09-kv-k">执行任务</span>
                <span className="m09-kv-v">{currentTask.id}</span>
              </div>
              <div className="m09-kv-row">
                <span className="m09-kv-k">巡检对象</span>
                <span className="m09-kv-v">
                  {secLabel(currentTask.sectionId)}·{currentTask.target}
                </span>
              </div>
              <div className="m09-kv-row">
                <span className="m09-kv-k">航线 / 机巢</span>
                <span className="m09-kv-v">
                  {currentTask.routeCode} / {currentTask.hangar}
                </span>
              </div>
            </div>
          </div>

          <div className="glass-panel">
            <div className="panel-header" style={{ cursor: 'default' }}>
              <div className="panel-title-group">
                <span className="panel-accent-bar" />
                <span className="panel-title">巡检事件</span>
              </div>
              <button
                type="button"
                className="m09-link-btn"
                onClick={() => setShowLogsModal(true)}
              >
                查看飞行记录 <ChevronRight size={13} />
              </button>
            </div>
            <div className="panel-body" style={{ paddingTop: '6px' }}>
              {events.slice(0, 4).map((ev) => (
                <div key={ev.id} className="m09-kv-row">
                  <span
                    style={{
                      color: '#38f2ff',
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      minWidth: '44px',
                    }}
                  >
                    {ev.eventTime}
                  </span>
                  <span style={{ flex: 1, color: '#e6f2ff' }}>{ev.text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showTaskDetail ? (
        <LiveTaskDetailModal
          task={currentTask}
          onClose={() => setShowTaskDetail(false)}
        />
      ) : null}

      {showMarkClue ? (
        <LiveMarkClueModal
          defaultWaypoint={`航点${String(wpCur).padStart(2, '0')}`}
          submitting={submitting}
          onSubmit={handleMarkClue}
          onClose={() => setShowMarkClue(false)}
        />
      ) : null}

      {showGimbal ? (
        <LiveGimbalModal
          pitch={gimbal.pitch}
          yaw={gimbal.yaw}
          zoom={gimbal.zoom}
          onChange={setGimbal}
          onReset={() => {
            setGimbal({ pitch: -45, yaw: 0, zoom: 1.0 });
            setShowGimbal(false);
            showToast('云台已归中复位');
          }}
          onClose={() => setShowGimbal(false)}
        />
      ) : null}

      {fullscreenUrl ? (
        <LiveFullscreenModal
          taskId={currentTask.id}
          imgUrl={fullscreenUrl}
          onClose={() => setFullscreenUrl(null)}
        />
      ) : null}

      {showRth ? (
        <LiveRthModal
          hangar={currentTask.hangar}
          onConfirm={() => void handleConfirmRth()}
          onClose={() => setShowRth(false)}
        />
      ) : null}

      {showTakeover ? (
        <LiveTakeoverModal
          onConfirm={() => void handleConfirmTakeover()}
          onClose={() => setShowTakeover(false)}
        />
      ) : null}

      {showLogsModal ? (
        <LiveEventsModal
          taskId={currentTask.id}
          events={events}
          onClose={() => setShowLogsModal(false)}
        />
      ) : null}
    </div>
  );
}
