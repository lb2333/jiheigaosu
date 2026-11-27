'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Clock,
  ExternalLink,
  Link2,
  MapPin,
  Plane,
  Search,
  Video,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import {
  SECTIONS,
  SECTION_BY_ID,
  type VideoAirGroundPairDTO,
} from '../types';
import { SpatialThumbnailCanvas, VideoCanvas } from './VideoCanvas';
import {
  RecheckModal,
  SafetyRecordModal,
  SpatialMapModal,
  UavEvidenceModal,
} from './VideoModals';

interface AirGroundSubPageProps {
  activeSectionId: string | null;
  onOpenPlayback: (camId: string, date: string) => void;
  onJumpUav: () => void;
  onJumpSafety: () => void;
  showToast: (msg: string) => void;
}

const FALLBACK_PAIR: VideoAirGroundPairDTO = {
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
};

export function AirGroundSubPage({
  activeSectionId,
  onOpenPlayback,
  onJumpUav,
  onJumpSafety,
  showToast,
}: AirGroundSubPageProps) {
  const [pairs, setPairs] = useState<VideoAirGroundPairDTO[]>([FALLBACK_PAIR]);
  const [section, setSection] = useState('二工区');
  const [siteName, setSiteName] = useState('料场示例A');
  const [partName, setPartName] = useState('消防通道');
  const [evidenceDate, setEvidenceDate] = useState('2026-11-26');
  const [pairId, setPairId] = useState('AG-01');

  const [showUavModal, setShowUavModal] = useState(false);
  const [showSpatialModal, setShowSpatialModal] = useState(false);
  const [showRecheckModal, setShowRecheckModal] = useState(false);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchPairs = useCallback(async () => {
    try {
      const res = await fetch('/api/v1/m10/airground', { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const loaded: VideoAirGroundPairDTO[] = data.pairs ?? [];
      if (loaded.length > 0) {
        setPairs(loaded);
      }
    } catch {
      showToast('加载空地联动记录失败');
    }
  }, [showToast]);

  useEffect(() => {
    void fetchPairs();
  }, [fetchPairs]);

  // Sync top section pill changes
  useEffect(() => {
    if (!activeSectionId || !SECTION_BY_ID[activeSectionId]) return;
    const secName = SECTION_BY_ID[activeSectionId].name;
    const match = pairs.find((p) => p.sectionName === secName);
    if (match) {
      setPairId(match.id);
      setSection(match.sectionName);
      setSiteName(match.siteName);
      setPartName(match.partName);
      setEvidenceDate(match.evidenceDate);
    } else {
      setSection(secName);
    }
  }, [activeSectionId, pairs]);

  const currentPair = useMemo(
    () => pairs.find((p) => p.id === pairId) || pairs[0] || FALLBACK_PAIR,
    [pairs, pairId]
  );

  const siteOptions = useMemo(
    () => Array.from(new Set(pairs.map((p) => p.siteName))),
    [pairs]
  );
  const partOptions = useMemo(
    () => Array.from(new Set(pairs.map((p) => p.partName))),
    [pairs]
  );

  function applyMatchedPair(found: VideoAirGroundPairDTO) {
    setPairId(found.id);
    setSection(found.sectionName);
    setSiteName(found.siteName);
    setPartName(found.partName);
    setEvidenceDate(found.evidenceDate);
  }

  function handleMatchQuery(preferSection: boolean, nextSec = section) {
    const found =
      pairs.find(
        (p) =>
          (!nextSec || p.sectionName === nextSec) &&
          p.siteName === siteName &&
          p.partName === partName
      ) ||
      (preferSection && nextSec
        ? pairs.find((p) => p.sectionName === nextSec)
        : undefined) ||
      pairs.find((p) => p.siteName === siteName) ||
      pairs[0];
    if (found) {
      applyMatchedPair(found);
      return found;
    }
    return currentPair;
  }

  async function handleSubmitRecheck(payload: {
    uavRoute: string;
    instruction: string;
  }) {
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m10/airground/${encodeURIComponent(currentPair.id)}/recheck`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '下发空地联合复核失败');
        return;
      }
      const updated: VideoAirGroundPairDTO = data.pair;
      setPairs((prev) =>
        prev.map((p) => (p.id === updated.id ? updated : p))
      );
      setShowRecheckModal(false);
      showToast(`已下发空地协同复核任务（关联隐患 ${updated.hazardId}）`);
    } catch {
      showToast('下发空地联合复核失败');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="m10-page">
      {/* Top Match Bar */}
      <div className="glass-panel m10-filter-bar">
        <div className="m10-filter-fields">
          <div className="m10-field">
            <span className="m10-field-label">所属工区</span>
            <select
              className="glass-select m10-select"
              value={section}
              onChange={(e) => {
                const nextSec = e.target.value;
                setSection(nextSec);
                handleMatchQuery(true, nextSec);
              }}
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
            <span className="m10-field-label">工程位置</span>
            <select
              className="glass-select m10-select"
              value={siteName}
              onChange={(e) => {
                const nextSite = e.target.value;
                setSiteName(nextSite);
                const bySite = pairs.find((p) => p.siteName === nextSite);
                if (bySite) applyMatchedPair(bySite);
              }}
            >
              {siteOptions.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">关联部位</span>
            <select
              className="glass-select m10-select"
              value={partName}
              onChange={(e) => {
                const nextPart = e.target.value;
                setPartName(nextPart);
                const byPart = pairs.find((p) => p.partName === nextPart);
                if (byPart) applyMatchedPair(byPart);
              }}
            >
              {partOptions.map((pt) => (
                <option key={pt} value={pt}>
                  {pt}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">证据日期</span>
            <select
              className="glass-select m10-select"
              value={evidenceDate}
              onChange={(e) => {
                const nextDate = e.target.value;
                setEvidenceDate(nextDate);
                const byDate = pairs.find((p) => p.evidenceDate === nextDate);
                if (byDate) applyMatchedPair(byDate);
              }}
            >
              <option value="2026-11-26">2026-11-26</option>
              <option value="2026-11-25">2026-11-25</option>
            </select>
          </div>
        </div>
        <div className="m10-filter-actions">
          <span className="m10-tag ok">点位已匹配</span>
          <button
            type="button"
            className="m10-btn-query"
            onClick={() => {
              const matched = handleMatchQuery(false);
              showToast(
                `已匹配同点位影像：${matched.camId} ↔ ${matched.uavTaskId}`
              );
            }}
          >
            <Search size={14} />
            <span>查询同点位影像</span>
          </button>
        </div>
      </div>

      {/* Upper Side-by-Side Comparison */}
      <div className="m10-split-50-50">
        {/* Ground View */}
        <GlassPanel
          title="地面视角 · 固定视频"
          headerRight={<span className="m10-tag info">原视频系统</span>}
        >
          <div className="m10-ag-card-body">
            <div className="m10-feed-box">
              <VideoCanvas
                width={640}
                height={360}
                status="在线"
                sceneType={currentPair.sceneType}
                showAlarmBox
                alarmBoxLabel={currentPair.hazardTitle}
              />
              <div className="m10-hud-tl">
                <span className="m10-hud-pill">{currentPair.camId}</span>
              </div>
              <div className="m10-hud-tr">
                <span className="m10-hud-pill">
                  <Video size={13} />
                  <span>固定视频回放</span>
                </span>
              </div>
              <div className="m10-hud-bl">
                <span className="m10-hud-pill">{currentPair.camTime}</span>
              </div>
              <div className="m10-hud-br">
                <span className="m10-hud-pill warn">{currentPair.camTag}</span>
              </div>
            </div>
            <div className="m10-ag-foot">
              <div>
                <div className="m10-ag-title">{currentPair.camLabel}</div>
                <div className="m10-ag-sub">{currentPair.camStake}</div>
              </div>
              <button
                type="button"
                className="m10-btn-outline"
                onClick={() =>
                  onOpenPlayback(currentPair.camId, currentPair.evidenceDate)
                }
              >
                <Clock size={14} />
                <span>打开历史录像</span>
              </button>
            </div>
          </div>
        </GlassPanel>

        {/* Aerial UAV View */}
        <GlassPanel
          title="空中视角 · 无人机巡检影像"
          headerRight={<span className="m10-tag ok">影像已回传</span>}
        >
          <div className="m10-ag-card-body">
            <div className="m10-feed-box">
              <VideoCanvas
                width={640}
                height={360}
                status="在线"
                sceneType={currentPair.sceneType}
                isUav
                showAlarmBox
                alarmBoxLabel={currentPair.hazardTitle}
              />
              <div className="m10-hud-tl">
                <span className="m10-hud-pill">{currentPair.uavTaskId}</span>
              </div>
              <div className="m10-hud-tr">
                <span className="m10-hud-pill">
                  <Plane size={13} />
                  <span>最近巡检影像</span>
                </span>
              </div>
              <div className="m10-hud-bl">
                <span className="m10-hud-pill">{currentPair.uavTime}</span>
              </div>
              <div className="m10-hud-br">
                <span className="m10-hud-pill">{currentPair.uavPart}</span>
              </div>
            </div>
            <div className="m10-ag-foot">
              <div>
                <div className="m10-ag-title">{currentPair.uavTaskName}</div>
                <div className="m10-ag-sub">{currentPair.uavFile}</div>
              </div>
              <button
                type="button"
                className="m10-btn-outline"
                onClick={() => setShowUavModal(true)}
              >
                <ExternalLink size={13} />
                <span>查看原巡检成果</span>
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {/* Lower Split: Linked Spatial Record + Recheck */}
      <div className="m10-split-66-34">
        <GlassPanel
          title="同点位关联记录"
          headerRight={<span className="m10-tag ok">已匹配</span>}
        >
          <div className="m10-spatial-wrap">
            <div
              className="m10-spatial-thumb"
              title="点击放大查看点位空间关系"
              onClick={() => setShowSpatialModal(true)}
            >
              <SpatialThumbnailCanvas
                width={206}
                height={118}
                style={{ display: 'block', width: '100%', height: '100%' }}
              />
              <div className="m10-hud-tl">
                <span className="m10-hud-pill">
                  <MapPin size={12} />
                  <span>{currentPair.siteName}</span>
                </span>
              </div>
              <div className="m10-hud-tr">
                <span className="m10-hud-pill">点位示意</span>
              </div>
            </div>
            <div style={{ minWidth: 0 }}>
              <table className="data-table m10-table">
                <thead>
                  <tr>
                    <th>视角</th>
                    <th>来源记录</th>
                    <th>取证时间</th>
                    <th>关联部位</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#eaf4ff' }}>
                      固定视频
                    </td>
                    <td>{currentPair.camId}</td>
                    <td>{currentPair.camTime}</td>
                    <td>{currentPair.partName}</td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: 700, color: '#eaf4ff' }}>
                      无人机巡检
                    </td>
                    <td>{currentPair.uavTaskId}</td>
                    <td>{currentPair.uavTime}</td>
                    <td>{currentPair.uavPart}</td>
                  </tr>
                </tbody>
              </table>
              <div className="m10-spatial-caption">{currentPair.summary}</div>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="关联复核"
          headerRight={<span className="m10-tag info">关联隐患</span>}
        >
          <div className="m10-inspector-body">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <strong style={{ fontSize: '15px', color: '#ffffff' }}>
                {currentPair.hazardTitle}
              </strong>
              {currentPair.recheckSent ? (
                <span className="m10-tag ok">已发起复核</span>
              ) : null}
            </div>
            <div
              className="m10-kv-list"
              style={{ borderBottom: 'none', paddingBottom: '2px' }}
            >
              <div className="m10-kv-row">
                <span className="m10-kv-key" style={{ width: '92px' }}>
                  安全隐患编号
                </span>
                <span className="m10-kv-val">{currentPair.hazardId}</span>
              </div>
              <div className="m10-kv-row">
                <span className="m10-kv-key" style={{ width: '92px' }}>
                  来源告警编号
                </span>
                <span className="m10-kv-val">{currentPair.alarmId}</span>
              </div>
              {currentPair.recheckSent ? (
                <div className="m10-kv-row">
                  <span className="m10-kv-key" style={{ width: '92px' }}>
                    最近复核下发
                  </span>
                  <span className="m10-kv-val" style={{ color: '#4ade80' }}>
                    {currentPair.recheckTime}
                  </span>
                </div>
              ) : null}
            </div>
            <div className="m10-btn-pair">
              <button
                type="button"
                className="m10-btn-query"
                onClick={() => setShowRecheckModal(true)}
              >
                <Link2 size={14} />
                <span>发起复核</span>
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
            <div className="m10-info-hint">ⓘ 复核请求关联原隐患编号。</div>
          </div>
        </GlassPanel>
      </div>

      {showUavModal ? (
        <UavEvidenceModal
          pair={currentPair}
          onJumpUav={() => {
            setShowUavModal(false);
            onJumpUav();
          }}
          onClose={() => setShowUavModal(false)}
        />
      ) : null}

      {showSpatialModal ? (
        <SpatialMapModal
          pair={currentPair}
          onClose={() => setShowSpatialModal(false)}
        />
      ) : null}

      {showRecheckModal ? (
        <RecheckModal
          pair={currentPair}
          submitting={submitting}
          onSubmit={handleSubmitRecheck}
          onClose={() => setShowRecheckModal(false)}
        />
      ) : null}

      {showSafetyModal ? (
        <SafetyRecordModal
          hazardId={currentPair.hazardId}
          alarmId={currentPair.alarmId}
          title={currentPair.hazardTitle}
          detail={`${currentPair.summary} 已通过固定视频与无人机同点位协同核查。`}
          sectionName={currentPair.sectionName}
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
