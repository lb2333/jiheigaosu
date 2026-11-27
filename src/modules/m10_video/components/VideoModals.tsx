'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import {
  PURPOSE_TYPES,
  SECTIONS,
  STATUS_TYPES,
  statusToTagClass,
  type VideoAirGroundPairDTO,
  type VideoCameraDTO,
  type VideoPatrolGroupDTO,
} from '../types';
import { SpatialThumbnailCanvas, VideoCanvas } from './VideoCanvas';

export function ModalShell({
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

export function EditCameraModal({
  camera,
  submitting,
  onSave,
  onClose,
}: {
  camera: VideoCameraDTO;
  submitting: boolean;
  onSave: (payload: {
    name: string;
    sectionName: string;
    stake: string;
    location: string;
    purpose: string;
    status: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(camera.name);
  const [sectionName, setSectionName] = useState(camera.sectionName);
  const [stake, setStake] = useState(camera.stake);
  const [location, setLocation] = useState(camera.location);
  const [purpose, setPurpose] = useState(camera.purpose);
  const [status, setStatus] = useState(camera.status);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSave({
      name: name.trim() || camera.name,
      sectionName,
      stake: stake.trim() || camera.stake,
      location: location.trim() || camera.location,
      purpose,
      status,
    });
  }

  return (
    <ModalShell title={`编辑视频点位 — ${camera.id}`} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div className="m10-form-grid">
          <div className="m10-form-item">
            <label>点位名称</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="m10-form-item">
            <label>所属工区</label>
            <select
              value={sectionName}
              onChange={(e) => setSectionName(e.target.value)}
            >
              {SECTIONS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-form-item">
            <label>关联桩号</label>
            <input
              type="text"
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              required
            />
          </div>
          <div className="m10-form-item">
            <label>布设部位</label>
            <input
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
            />
          </div>
          <div className="m10-form-item">
            <label>监控用途</label>
            <select value={purpose} onChange={(e) => setPurpose(e.target.value)}>
              {PURPOSE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-form-item">
            <label>设备状态</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)}>
              {STATUS_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '4px',
          }}
        >
          <button type="button" className="m10-btn-outline" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="m10-btn-query" disabled={submitting}>
            {submitting ? '保存中...' : '保存点位配置'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function FullscreenCameraModal({
  camera,
  isPlayback,
  clockText,
  playbackSec,
  showAlarmBox,
  alarmLabel,
  onClose,
}: {
  camera: VideoCameraDTO;
  isPlayback: boolean;
  clockText: string;
  playbackSec?: number;
  showAlarmBox?: boolean;
  alarmLabel?: string;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`${isPlayback ? '全屏录像回放' : '全屏实时监控'} — ${camera.id} (${camera.name})`}
      onClose={onClose}
    >
      <div className="m10-feed-box" style={{ aspectRatio: '16/9' }}>
        <VideoCanvas
          width={960}
          height={540}
          status={camera.status}
          sceneType={camera.sceneType}
          mode={isPlayback ? 'playback' : 'live'}
          playbackSec={playbackSec}
          showAlarmBox={showAlarmBox}
          alarmBoxLabel={alarmLabel}
        />
        <div className="m10-hud-tl">
          <span className="m10-hud-pill">
            {camera.id} · {camera.resolution}
          </span>
        </div>
        <div className="m10-hud-tr">
          <span className="m10-hud-pill">
            {isPlayback ? '历史回放全屏' : camera.status}
          </span>
        </div>
        <div className="m10-hud-bl">
          <span className="m10-hud-pill">{clockText}</span>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>所属工区 / 桩号</span>
          <strong>
            {camera.sectionName} · {camera.stake}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>布设部位 / 用途</span>
          <strong>
            {camera.location} · {camera.purpose}
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>接入地址 / 来源</span>
          <strong>
            {camera.ip} · {camera.source}
          </strong>
        </div>
      </div>
      {camera.faultNote ? (
        <div
          className="m10-info-hint"
          style={{ borderColor: 'rgba(250,204,21,0.45)', color: '#fde047' }}
        >
          ⚠ 诊断提示：{camera.faultNote}
        </div>
      ) : null}
    </ModalShell>
  );
}

export function SaveGroupModal({
  activeCamIds,
  allCameras,
  groupCount,
  submitting,
  onSave,
  onClose,
}: {
  activeCamIds: string[];
  allCameras: VideoCameraDTO[];
  groupCount: number;
  submitting: boolean;
  onSave: (name: string) => Promise<void>;
  onClose: () => void;
}) {
  const [name, setName] = useState(`自定义巡查组合 ${groupCount + 1}`);
  const camMap = new Map(allCameras.map((c) => [c.id, c]));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    await onSave(trimmed);
  }

  return (
    <ModalShell title="保存当前视频巡查组合" onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div className="m10-form-item">
          <label>新组合名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div style={{ fontSize: '12.5px', color: '#a9c6e8' }}>
          包含当前画面点位（{activeCamIds.length} 路）：
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {activeCamIds.map((id) => {
            const c = camMap.get(id);
            return (
              <span key={id} className="m10-tag info">
                {id} · {c?.name ?? id}
              </span>
            );
          })}
        </div>
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '10px',
            marginTop: '4px',
          }}
        >
          <button type="button" className="m10-btn-outline" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="m10-btn-query" disabled={submitting}>
            {submitting ? '保存中...' : '确认保存组合'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function ManageGroupsModal({
  groups,
  submitting,
  onLoadGroup,
  onDeleteGroup,
  onClose,
}: {
  groups: VideoPatrolGroupDTO[];
  submitting: boolean;
  onLoadGroup: (group: VideoPatrolGroupDTO) => void;
  onDeleteGroup: (groupId: string) => Promise<void>;
  onClose: () => void;
}) {
  return (
    <ModalShell title="常用视频组合管理" onClose={onClose}>
      <table className="data-table">
        <thead>
          <tr>
            <th>组合名称</th>
            <th>类型</th>
            <th>配置路数</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((g) => (
            <tr key={g.id}>
              <td style={{ fontWeight: 700 }}>{g.name}</td>
              <td>
                <span className={`m10-tag ${g.builtIn ? 'info' : 'ok'}`}>
                  {g.builtIn ? '系统预设' : '自定义'}
                </span>
              </td>
              <td>{g.cameraIds.length} 路</td>
              <td>
                <button
                  type="button"
                  className="m10-link-btn"
                  onClick={() => onLoadGroup(g)}
                >
                  加载巡查
                </button>
                {!g.builtIn ? (
                  <button
                    type="button"
                    className="m10-link-btn"
                    style={{ color: '#f87171', marginLeft: '10px' }}
                    disabled={submitting}
                    onClick={() => void onDeleteGroup(g.id)}
                  >
                    删除
                  </button>
                ) : null}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ModalShell>
  );
}

export function ScreenshotModal({
  camera,
  imgSrc,
  clockStr,
  submitting,
  onSave,
  onClose,
}: {
  camera: VideoCameraDTO;
  imgSrc: string;
  clockStr: string;
  submitting: boolean;
  onSave: () => Promise<void>;
  onClose: () => void;
}) {
  return (
    <ModalShell title="历史录像截图取证" onClose={onClose}>
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(56,189,248,0.45)',
          background: '#041026',
        }}
      >
        {imgSrc ? (
          <img
            src={imgSrc}
            style={{ width: '100%', display: 'block' }}
            alt="取证截图"
          />
        ) : (
          <div style={{ padding: '40px', textAlign: 'center', color: '#8cb2db' }}>
            正在生成取证图像...
          </div>
        )}
      </div>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>取证设备</span>
          <strong>{camera.id}</strong>
        </div>
        <div className="detail-stat-card">
          <span>取证时间</span>
          <strong>{clockStr}</strong>
        </div>
        <div className="detail-stat-card">
          <span>取证状态</span>
          <strong style={{ color: '#4ade80' }}>已加盖数字水印</strong>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" className="m10-btn-outline" onClick={onClose}>
          关闭
        </button>
        <button
          type="button"
          className="m10-btn-query"
          disabled={submitting}
          onClick={() => void onSave()}
        >
          {submitting ? '归档中...' : '保存至安全取证台账'}
        </button>
      </div>
    </ModalShell>
  );
}

export function PlaybackSourceModal({
  camera,
  onClose,
}: {
  camera: VideoCameraDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`录像来源与存储节点详情 — ${camera.id}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>接入来源</span>
          <strong>原视频系统 · GB/T 28181</strong>
        </div>
        <div className="detail-stat-card">
          <span>存储节点</span>
          <strong>NVR-JH-02（二工区汇聚机房）</strong>
        </div>
        <div className="detail-stat-card">
          <span>码流参数</span>
          <strong>H.265 · 4096 kbps · 25 fps</strong>
        </div>
      </div>
      <div className="m10-kv-list" style={{ borderBottom: 'none' }}>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '110px' }}>
            设备编码
          </span>
          <span className="m10-kv-val">
            {camera.id}（{camera.ip}）
          </span>
        </div>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '110px' }}>
            保存策略
          </span>
          <span className="m10-kv-val">
            全天候连续录像保存 90 天，告警联动片段永久锁定
          </span>
        </div>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '110px' }}>
            时间同步
          </span>
          <span className="m10-kv-val">北斗/NTP 校时正常（误差 &lt; 20 ms）</span>
        </div>
      </div>
    </ModalShell>
  );
}

export function SafetyRecordModal({
  hazardId,
  alarmId,
  title,
  detail,
  sectionName,
  onJumpSafety,
  onClose,
}: {
  hazardId: string;
  alarmId: string;
  title: string;
  detail: string;
  sectionName: string;
  onJumpSafety: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`安全管理联动台账 — ${hazardId}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>隐患编号</span>
          <strong>{hazardId}</strong>
        </div>
        <div className="detail-stat-card">
          <span>来源告警</span>
          <strong>{alarmId}</strong>
        </div>
        <div className="detail-stat-card">
          <span>整改状态</span>
          <strong style={{ color: '#facc15' }}>复查跟踪中</strong>
        </div>
      </div>
      <div className="m10-kv-list" style={{ borderBottom: 'none' }}>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '96px' }}>
            问题类别
          </span>
          <span className="m10-kv-val">{title}</span>
        </div>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '96px' }}>
            所属工区
          </span>
          <span className="m10-kv-val">{sectionName}</span>
        </div>
        <div className="m10-kv-row">
          <span className="m10-kv-key" style={{ width: '96px' }}>
            核查情况
          </span>
          <span className="m10-kv-val">{detail}</span>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" className="m10-btn-outline" onClick={onClose}>
          关闭
        </button>
        <button type="button" className="m10-btn-query" onClick={onJumpSafety}>
          进入安全管理模块
        </button>
      </div>
    </ModalShell>
  );
}

export function UavEvidenceModal({
  pair,
  onJumpUav,
  onClose,
}: {
  pair: VideoAirGroundPairDTO;
  onJumpUav: () => void;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`原无人机巡检成果 — ${pair.uavTaskId}`} onClose={onClose}>
      <div className="m10-feed-box" style={{ aspectRatio: '16/9' }}>
        <VideoCanvas
          width={760}
          height={420}
          status="在线"
          sceneType={pair.sceneType}
          isUav
          showAlarmBox
          alarmBoxLabel={pair.hazardTitle}
        />
        <div className="m10-hud-tl">
          <span className="m10-hud-pill">
            {pair.uavTaskId} · {pair.uavFile}
          </span>
        </div>
        <div className="m10-hud-bl">
          <span className="m10-hud-pill">{pair.uavTime}</span>
        </div>
      </div>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>巡检任务</span>
          <strong>{pair.uavTaskName}</strong>
        </div>
        <div className="detail-stat-card">
          <span>航点编号</span>
          <strong>{pair.uavPart}</strong>
        </div>
        <div className="detail-stat-card">
          <span>匹配隐患</span>
          <strong>{pair.hazardId}</strong>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
        <button type="button" className="m10-btn-outline" onClick={onClose}>
          关闭
        </button>
        <button type="button" className="m10-btn-query" onClick={onJumpUav}>
          跳转无人机巡检模块
        </button>
      </div>
    </ModalShell>
  );
}

export function SpatialMapModal({
  pair,
  onClose,
}: {
  pair: VideoAirGroundPairDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell
      title={`同点位空间关系示意 — ${pair.siteName} · ${pair.partName}`}
      onClose={onClose}
    >
      <div
        style={{
          borderRadius: '8px',
          overflow: 'hidden',
          border: '1px solid rgba(56,189,248,0.45)',
          background: '#061836',
        }}
      >
        <SpatialThumbnailCanvas
          width={680}
          height={360}
          style={{ width: '100%', display: 'block' }}
        />
      </div>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>固定视频点位</span>
          <strong>{pair.camId}（地面视场角 78°）</strong>
        </div>
        <div className="detail-stat-card">
          <span>无人机取证点位</span>
          <strong>
            {pair.uavTaskId}（{pair.uavPart} · 航高 40m）
          </strong>
        </div>
        <div className="detail-stat-card">
          <span>时空匹配误差</span>
          <strong style={{ color: '#4ade80' }}>
            空间重合 &gt; 92% · 时差 {pair.timeDiffSec} 秒
          </strong>
        </div>
      </div>
    </ModalShell>
  );
}

export function RecheckModal({
  pair,
  submitting,
  onSubmit,
  onClose,
}: {
  pair: VideoAirGroundPairDTO;
  submitting: boolean;
  onSubmit: (payload: { uavRoute: string; instruction: string }) => Promise<void>;
  onClose: () => void;
}) {
  const defaultRoute = `自动复核航线 · ${pair.uavPart}（最近机巢起飞）`;
  const [uavRoute, setUavRoute] = useState(defaultRoute);
  const [instruction, setInstruction] = useState(
    `针对「${pair.hazardTitle}」发起空地同点位复核取证，确认现场整改闭环情况。`
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      uavRoute,
      instruction:
        instruction.trim() ||
        `针对「${pair.hazardTitle}」发起空地同点位复核取证。`,
    });
  }

  return (
    <ModalShell title={`发起空地联合复核 — ${pair.hazardId}`} onClose={onClose}>
      <form
        onSubmit={handleSubmit}
        style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}
      >
        <div className="m10-form-grid">
          <div className="m10-form-item">
            <label>关联隐患编号</label>
            <input type="text" value={pair.hazardId} readOnly />
          </div>
          <div className="m10-form-item">
            <label>复核工程位置</label>
            <input
              type="text"
              value={`${pair.sectionName} · ${pair.siteName} · ${pair.partName}`}
              readOnly
            />
          </div>
          <div className="m10-form-item">
            <label>地面联动摄像头</label>
            <input type="text" value={`${pair.camId}（同步抓拍）`} readOnly />
          </div>
          <div className="m10-form-item">
            <label>调度无人机航线</label>
            <select
              value={uavRoute}
              onChange={(e) => setUavRoute(e.target.value)}
            >
              <option value={defaultRoute}>{defaultRoute}</option>
              <option value="全区段复核航线">全区段复核航线</option>
            </select>
          </div>
        </div>
        <div className="m10-form-item">
          <label>复核指令说明</label>
          <textarea
            value={instruction}
            onChange={(e) => setInstruction(e.target.value)}
            required
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button type="button" className="m10-btn-outline" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="m10-btn-query" disabled={submitting}>
            {submitting ? '下发中...' : '确认下发复核任务'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export { statusToTagClass };
