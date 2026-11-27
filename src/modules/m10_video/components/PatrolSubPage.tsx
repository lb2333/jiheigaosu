'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Grid2x2,
  Grid3x3,
  List,
  Maximize2,
  Pause,
  RotateCcw,
  Save,
  Search,
  Square,
  Video,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  formatHms,
  PATROL_INTERVALS,
  SECTIONS,
  SECTION_BY_ID,
  statusToBadgeTone,
  type VideoCameraDTO,
  type VideoPatrolGroupDTO,
} from '../types';
import { VideoCanvas } from './VideoCanvas';
import {
  FullscreenCameraModal,
  ManageGroupsModal,
  SaveGroupModal,
} from './VideoModals';

interface PatrolSubPageProps {
  activeSectionId: string | null;
  liveClockSec: number;
  initialCamId?: string;
  onOpenDirectory: () => void;
  showToast: (msg: string) => void;
}

const DEFAULT_CELLS = [
  'CAM-YD-A01',
  'CAM-LC-A03',
  'CAM-BT-A01',
  'CAM-QL-A02',
  'CAM-YD-A03',
  'CAM-BH-A01',
  'CAM-LJ-301',
  'CAM-BT-A02',
  'CAM-QL-601',
];

export function PatrolSubPage({
  activeSectionId,
  liveClockSec,
  initialCamId,
  onOpenDirectory,
  showToast,
}: PatrolSubPageProps) {
  const [section, setSection] = useState<string>(() =>
    activeSectionId && SECTION_BY_ID[activeSectionId]
      ? SECTION_BY_ID[activeSectionId].name
      : ''
  );
  const [groups, setGroups] = useState<VideoPatrolGroupDTO[]>([]);
  const [cameras, setCameras] = useState<VideoCameraDTO[]>([]);
  const [groupId, setGroupId] = useState('grp-key');
  const [intervalSec, setIntervalSec] = useState(30);
  const [layout, setLayout] = useState<1 | 4 | 9>(4);
  const [activeCell, setActiveCell] = useState(0);
  const [cellCameras, setCellCameras] = useState<string[]>(DEFAULT_CELLS);
  const [tourRunning, setTourRunning] = useState(false);
  const [tourRemaining, setTourRemaining] = useState(30);
  const [search, setSearch] = useState('');

  const [fullscreenCam, setFullscreenCam] = useState<VideoCameraDTO | null>(null);
  const [showSaveGroup, setShowSaveGroup] = useState(false);
  const [showManageGroups, setShowManageGroups] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextSec =
      activeSectionId && SECTION_BY_ID[activeSectionId]
        ? SECTION_BY_ID[activeSectionId].name
        : '';
    setSection(nextSec);
  }, [activeSectionId]);

  const fetchPatrolData = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/m10/patrol-groups', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const loadedGroups: VideoPatrolGroupDTO[] = data.groups ?? [];
      const loadedCams: VideoCameraDTO[] = data.cameras ?? [];
      setGroups(loadedGroups);
      setCameras(loadedCams);

      if (initialCamId) {
        setCellCameras((prev) => {
          const next = [...prev];
          next[0] = initialCamId;
          return next;
        });
      } else if (loadedGroups.length > 0) {
        const current =
          loadedGroups.find((g) => g.id === groupId) || loadedGroups[0];
        setGroupId(current.id);
        if (current.cameraIds.length > 0) {
          setCellCameras(current.cameraIds);
        }
      }
    } catch {
      showToast('加载视频巡查组合失败');
    }
  }, [initialCamId, showToast]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    void fetchPatrolData();
  }, [fetchPatrolData]);

  // Auto-tour countdown & rotation
  useEffect(() => {
    if (!tourRunning || cameras.length === 0) return;
    const timer = window.setInterval(() => {
      setTourRemaining((prev) => {
        if (prev <= 1) {
          setCellCameras((cells) => {
            const pool = section
              ? cameras.filter((c) => c.sectionName === section)
              : cameras;
            if (pool.length === 0) return cells;
            const currentFirst = cells[0];
            const startIdx = Math.max(
              0,
              pool.findIndex((c) => c.id === currentFirst)
            );
            const nextStart = (startIdx + layout) % pool.length;
            const rotated: string[] = [];
            for (let i = 0; i < 9; i++) {
              rotated.push(pool[(nextStart + i) % pool.length].id);
            }
            return rotated;
          });
          return intervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [tourRunning, intervalSec, layout, section, cameras]);

  const camMap = useMemo(
    () => new Map(cameras.map((c) => [c.id, c])),
    [cameras]
  );

  const activeGroup = useMemo(() => {
    return (
      groups.find((g) => g.id === groupId) ||
      groups[0] || {
        id: 'grp-key',
        name: '重点施工点位',
        builtIn: true,
        cameraIds: DEFAULT_CELLS,
        sortOrder: 1,
      }
    );
  }, [groups, groupId]);

  const visibleCells = useMemo(() => {
    const fallbackCam: VideoCameraDTO = {
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

    const result: Array<{ idx: number; cam: VideoCameraDTO }> = [];
    for (let i = 0; i < layout; i++) {
      const targetId =
        cellCameras[i] ||
        activeGroup.cameraIds[i % Math.max(1, activeGroup.cameraIds.length)] ||
        DEFAULT_CELLS[i];
      const cam = camMap.get(targetId) || cameras[0] || fallbackCam;
      result.push({ idx: i, cam });
    }
    return result;
  }, [layout, cellCameras, activeGroup, camMap, cameras]);

  const okCnt = visibleCells.filter((x) => x.cam.status === '在线').length;
  const warnCnt = visibleCells.filter((x) => x.cam.status === '图像异常').length;
  const offCnt = visibleCells.filter((x) => x.cam.status === '离线').length;

  const listCameras = useMemo(() => {
    const kw = search.trim().toLowerCase();
    return cameras.filter((c) => {
      if (section && c.sectionName !== section) return false;
      if (kw) {
        const hay = `${c.id} ${c.name} ${c.sectionName} ${c.stake}`.toLowerCase();
        if (!hay.includes(kw)) return false;
      }
      return true;
    });
  }, [cameras, section, search]);

  const activeCellCamId = visibleCells[activeCell]?.cam.id ?? '';
  const layoutText = layout === 1 ? '单画面' : layout === 9 ? '九画面' : '四画面';

  function handleSwitchGroup(g: VideoPatrolGroupDTO) {
    setGroupId(g.id);
    setCellCameras([...g.cameraIds]);
    setActiveCell(0);
  }

  async function handleSaveNewGroup(name: string) {
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m10/patrol-groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          cameraIds: cellCameras.slice(0, layout),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '保存视频组合失败');
        return;
      }
      const created: VideoPatrolGroupDTO = data.group;
      setGroups((prev) => [...prev, created]);
      setGroupId(created.id);
      setShowSaveGroup(false);
      showToast(`已保存视频组合「${created.name}」`);
    } catch {
      showToast('保存视频组合失败');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteGroup(delId: string) {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m10/patrol-groups/${encodeURIComponent(delId)}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '删除视频组合失败');
        return;
      }
      setGroups((prev) => {
        const remaining = prev.filter((g) => g.id !== delId);
        if (groupId === delId && remaining[0]) {
          setGroupId(remaining[0].id);
          setCellCameras([...remaining[0].cameraIds]);
        }
        return remaining;
      });
      showToast('已删除自定义视频组合');
    } catch {
      showToast('删除视频组合失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="m10-page m10-patrol-page">
      {/* Top Control Bar */}
      <div className="glass-panel m10-filter-bar">
        <div className="m10-filter-fields">
          <div className="m10-field">
            <span className="m10-field-label">所属工区</span>
            <select
              className="glass-select m10-select"
              value={section}
              onChange={(e) => setSection(e.target.value)}
            >
              <option value="">全部工区</option>
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">视频组合</span>
            <select
              className="glass-select m10-select wide"
              value={groupId}
              onChange={(e) => {
                const g = groups.find((x) => x.id === e.target.value);
                if (g) handleSwitchGroup(g);
              }}
            >
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name} ({Math.min(layout, g.cameraIds.length)}路)
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">轮巡间隔</span>
            <select
              className="glass-select m10-select"
              value={intervalSec}
              onChange={(e) => {
                const val = Number.parseInt(e.target.value, 10) || 30;
                setIntervalSec(val);
                setTourRemaining(val);
              }}
            >
              {PATROL_INTERVALS.map((sec) => (
                <option key={sec} value={sec}>
                  {sec}秒
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="m10-filter-actions">
          <span className="m10-tag info">{layoutText}</span>
          <button
            type="button"
            className="m10-btn-outline"
            onClick={onOpenDirectory}
          >
            <List size={14} />
            <span>打开设备目录</span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="m10-split-74-26">
        {/* Left: Multi-grid Video Wall */}
        <GlassPanel
          className="m10-patrol-wall"
          title="监控画面"
          headerRight={
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              {tourRunning ? (
                <span className="m10-tag ok">{tourRemaining}s 后轮换</span>
              ) : null}
              <div className="m10-layout-seg">
                <button
                  type="button"
                  className={`m10-layout-btn ${layout === 1 ? 'active' : ''}`}
                  onClick={() => {
                    setLayout(1);
                    setActiveCell(0);
                  }}
                >
                  <Square size={12} />
                  <span>单画面</span>
                </button>
                <button
                  type="button"
                  className={`m10-layout-btn ${layout === 4 ? 'active' : ''}`}
                  onClick={() => {
                    setLayout(4);
                    if (activeCell >= 4) setActiveCell(0);
                  }}
                >
                  <Grid2x2 size={12} />
                  <span>四画面</span>
                </button>
                <button
                  type="button"
                  className={`m10-layout-btn ${layout === 9 ? 'active' : ''}`}
                  onClick={() => setLayout(9)}
                >
                  <Grid3x3 size={12} />
                  <span>九画面</span>
                </button>
              </div>
            </div>
          }
        >
          <div className={`m10-grid-stage g${layout}`}>
            {visibleCells.map(({ idx, cam }) => {
              const isSelected = idx === activeCell;
              const ts =
                cam.status === '在线'
                  ? `2026-11-26 ${formatHms(liveClockSec)}`
                  : cam.lastTime;
              const badgeClass =
                cam.status === '图像异常'
                  ? 'warn'
                  : cam.status === '在线'
                    ? 'live'
                    : '';
              const badgeText =
                cam.status === '图像异常'
                  ? '⚠ 最后有效帧'
                  : cam.status === '离线'
                    ? '信号离线'
                    : 'ıll 实时画面';

              return (
                <div
                  key={`${idx}-${cam.id}`}
                  className={`m10-cell-card ${isSelected ? 'selected' : ''}`}
                  onClick={() => setActiveCell(idx)}
                >
                  <div className="m10-cell-head">
                    <span className="m10-cell-title">
                      <Video size={13} />
                      <span>
                        {cam.sectionName}·{cam.name}
                      </span>
                    </span>
                    <StatusBadge
                      text={cam.status}
                      tone={statusToBadgeTone(cam.status)}
                    />
                  </div>
                  <div className="m10-feed-box">
                    <VideoCanvas
                      width={layout === 1 ? 820 : layout === 4 ? 480 : 320}
                      height={layout === 1 ? 460 : layout === 4 ? 270 : 180}
                      status={cam.status}
                      sceneType={cam.sceneType}
                    />
                    <div className="m10-hud-tl">
                      <span className="m10-hud-pill">{cam.id}</span>
                    </div>
                    <div className="m10-hud-tr">
                      <span className={`m10-hud-pill ${badgeClass}`}>
                        {badgeText}
                      </span>
                    </div>
                    <div className="m10-hud-bl">
                      <span className="m10-hud-pill">{ts}</span>
                    </div>
                    <div className="m10-hud-br">
                      <button
                        type="button"
                        className="m10-fs-btn"
                        title="全屏查看"
                        onClick={(e) => {
                          e.stopPropagation();
                          setFullscreenCam(cam);
                        }}
                      >
                        <Maximize2 size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="m10-patrol-foot">
            <div>
              当前组合{' '}
              <strong style={{ color: '#f1f7ff', marginLeft: '6px' }}>
                {activeGroup.name} · {layout}路
              </strong>
            </div>
            <div>
              <span>
                正常 <strong style={{ color: '#4ade80' }}>{okCnt} 路</strong>
              </span>
              {warnCnt > 0 ? (
                <span style={{ marginLeft: '10px' }}>
                  图像异常 <strong style={{ color: '#facc15' }}>{warnCnt} 路</strong>
                </span>
              ) : null}
              {offCnt > 0 ? (
                <span style={{ marginLeft: '10px' }}>
                  离线 <strong style={{ color: '#94a3b8' }}>{offCnt} 路</strong>
                </span>
              ) : null}
            </div>
            <div className="m10-filter-actions">
              <button
                type="button"
                className={`m10-btn-outline ${tourRunning ? 'active' : ''}`}
                onClick={() => {
                  const next = !tourRunning;
                  setTourRunning(next);
                  setTourRemaining(intervalSec);
                  showToast(
                    next
                      ? `已开启自动轮巡（每 ${intervalSec} 秒切换）`
                      : '已停止自动轮巡'
                  );
                }}
              >
                {tourRunning ? <Pause size={13} /> : <RotateCcw size={13} />}
                <span>{tourRunning ? '停止轮巡' : '开启轮巡'}</span>
              </button>
              <button
                type="button"
                className="m10-btn-outline"
                onClick={() => setShowSaveGroup(true)}
              >
                <Save size={13} />
                <span>保存组合</span>
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Right Column: Common Groups + Camera Tree */}
        <div className="m10-right-stack m10-patrol-right">
          <GlassPanel title="常用视频组合">
            <div className="m10-group-list">
              {groups.map((g) => {
                const isAct = g.id === groupId;
                return (
                  <div
                    key={g.id}
                    className={`m10-group-card ${isAct ? 'active' : ''}`}
                    onClick={() => handleSwitchGroup(g)}
                  >
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '8px',
                        fontWeight: 600,
                        color: '#eaf4ff',
                      }}
                    >
                      <Grid2x2 size={14} />
                      <span>{g.name}</span>
                    </span>
                    {isAct ? (
                      <span className="m10-tag info">正在查看</span>
                    ) : (
                      <span style={{ fontSize: '12px', color: '#93b8de' }}>
                        {Math.min(4, g.cameraIds.length)} 路
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="m10-card-foot">
              <span>共 {groups.length} 个组合</span>
              <button
                type="button"
                className="m10-link-btn"
                onClick={() => setShowManageGroups(true)}
              >
                管理组合 &gt;
              </button>
            </div>
          </GlassPanel>

          <GlassPanel className="m10-patrol-tree-card" title="视频点位">
            <div style={{ padding: '8px 12px 4px', flexShrink: 0 }}>
              <div className="m10-search-wrap" style={{ width: '100%' }}>
                <Search size={14} />
                <input
                  className="m10-input full"
                  type="text"
                  placeholder="按点位或设备编号搜索"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="m10-cam-tree">
              {listCameras.map((c) => (
                <div
                  key={c.id}
                  className={`m10-cam-row ${c.id === activeCellCamId ? 'active' : ''}`}
                  onClick={() => {
                    setCellCameras((prev) => {
                      const next = [...prev];
                      next[activeCell] = c.id;
                      return next;
                    });
                    showToast(
                      `已在画面 ${activeCell + 1} 加载 ${c.id}（${c.name}）`
                    );
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      minWidth: 0,
                    }}
                  >
                    <span style={{ color: '#7dd3fc', flexShrink: 0 }}>
                      <Video size={14} />
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div className="m10-cam-row-name">{c.name}</div>
                      <div className="m10-cam-row-sub">
                        {c.sectionName} &nbsp; {c.id}
                      </div>
                    </div>
                  </div>
                  <StatusBadge
                    text={c.status}
                    tone={statusToBadgeTone(c.status)}
                  />
                </div>
              ))}
            </div>
            <div className="m10-card-foot">
              <span>
                {section
                  ? `${section} ${listCameras.length} 路`
                  : `全部 ${cameras.length} 路`}
              </span>
              <button
                type="button"
                className="m10-link-btn"
                onClick={onOpenDirectory}
              >
                查看设备目录 &gt;
              </button>
            </div>
          </GlassPanel>
        </div>
      </div>

      {fullscreenCam ? (
        <FullscreenCameraModal
          camera={fullscreenCam}
          isPlayback={false}
          clockText={
            fullscreenCam.status === '在线'
              ? `2026-11-26 ${formatHms(liveClockSec)}`
              : fullscreenCam.lastTime
          }
          onClose={() => setFullscreenCam(null)}
        />
      ) : null}

      {showSaveGroup ? (
        <SaveGroupModal
          activeCamIds={cellCameras.slice(0, layout)}
          allCameras={cameras}
          groupCount={groups.length}
          submitting={submitting}
          onSave={handleSaveNewGroup}
          onClose={() => setShowSaveGroup(false)}
        />
      ) : null}

      {showManageGroups ? (
        <ManageGroupsModal
          groups={groups}
          submitting={submitting}
          onLoadGroup={(g) => {
            handleSwitchGroup(g);
            setShowManageGroups(false);
          }}
          onDeleteGroup={handleDeleteGroup}
          onClose={() => setShowManageGroups(false)}
        />
      ) : null}
    </div>
  );
}
