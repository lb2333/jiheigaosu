'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  Clock,
  Layers,
  Pencil,
  RotateCcw,
  Search,
  Signal,
  Video,
  WifiOff,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { StatusBadge } from '@/components/ui/StatusBadge';
import {
  formatHms,
  PURPOSE_TYPES,
  SECTIONS,
  SECTION_BY_ID,
  SITE_TYPES,
  STATUS_TYPES,
  statusToBadgeTone,
  type VideoCameraDTO,
  type VideoDirectoryKpis,
} from '../types';
import { VideoCanvas } from './VideoCanvas';
import { EditCameraModal } from './VideoModals';

interface DirectorySubPageProps {
  activeSectionId: string | null;
  liveClockSec: number;
  onGoPatrol: (camId: string) => void;
  onGoPlayback: (camId: string) => void;
  showToast: (msg: string) => void;
}

const DEFAULT_KPIS: VideoDirectoryKpis = {
  total: 48,
  online: 43,
  offline: 3,
  abnormal: 2,
  sections: 6,
};

export function DirectorySubPage({
  activeSectionId,
  liveClockSec,
  onGoPatrol,
  onGoPlayback,
  showToast,
}: DirectorySubPageProps) {
  const [section, setSection] = useState<string>(() =>
    activeSectionId && SECTION_BY_ID[activeSectionId]
      ? SECTION_BY_ID[activeSectionId].name
      : ''
  );
  const [siteType, setSiteType] = useState('');
  const [purpose, setPurpose] = useState('');
  const [status, setStatus] = useState('');
  const [keyword, setKeyword] = useState('');
  const [page, setPage] = useState(1);

  const [items, setItems] = useState<VideoCameraDTO[]>([]);
  const [allCameras, setAllCameras] = useState<VideoCameraDTO[]>([]);
  const [kpis, setKpis] = useState<VideoDirectoryKpis>(DEFAULT_KPIS);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedId, setSelectedId] = useState('CAM-YD-A01');
  const [loading, setLoading] = useState(true);
  const [editingCam, setEditingCam] = useState<VideoCameraDTO | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const nextSec =
      activeSectionId && SECTION_BY_ID[activeSectionId]
        ? SECTION_BY_ID[activeSectionId].name
        : '';
    setSection(nextSec);
    setPage(1);
  }, [activeSectionId]);

  const fetchCameras = useCallback(
    async (opts?: {
      sec?: string;
      site?: string;
      purp?: string;
      st?: string;
      kw?: string;
      pg?: number;
    }) => {
      const secVal = opts?.sec !== undefined ? opts.sec : section;
      const siteVal = opts?.site !== undefined ? opts.site : siteType;
      const purpVal = opts?.purp !== undefined ? opts.purp : purpose;
      const stVal = opts?.st !== undefined ? opts.st : status;
      const kwVal = opts?.kw !== undefined ? opts.kw : keyword;
      const pgVal = opts?.pg !== undefined ? opts.pg : page;

      const params = new URLSearchParams();
      if (secVal) params.set('section', secVal);
      if (siteVal) params.set('siteType', siteVal);
      if (purpVal) params.set('purpose', purpVal);
      if (stVal) params.set('status', stVal);
      if (kwVal.trim()) params.set('q', kwVal.trim());
      params.set('page', String(pgVal));
      params.set('pageSize', '7');

      setLoading(true);
      try {
        const res = await fetch(`/api/v1/m10/cameras?${params.toString()}`, {
          cache: 'no-store',
        });
        if (!res.ok) {
          throw new Error(`HTTP ${res.status}`);
        }
        const data = await res.json();
        setItems(data.items ?? []);
        setAllCameras(data.allCameras ?? []);
        setKpis(data.kpis ?? DEFAULT_KPIS);
        setTotal(data.total ?? 0);
        setTotalPages(data.totalPages ?? 1);
        setPage(data.page ?? 1);
      } catch {
        showToast('加载视频设备目录失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    },
    [section, siteType, purpose, status, keyword, page, showToast]
  );

  useEffect(() => {
    void fetchCameras();
  }, [fetchCameras]);

  const selectedCam = useMemo(() => {
    return (
      items.find((c) => c.id === selectedId) ||
      allCameras.find((c) => c.id === selectedId) ||
      items[0] ||
      allCameras[0] || {
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
      }
    );
  }, [items, allCameras, selectedId]);

  const pageTokens = useMemo(() => {
    const out: Array<number | 'ellipsis'> = [];
    for (let i = 1; i <= totalPages; i++) {
      if (totalPages <= 6 || i === 1 || i === totalPages || Math.abs(i - page) <= 1) {
        out.push(i);
      } else if (out[out.length - 1] !== 'ellipsis') {
        out.push('ellipsis');
      }
    }
    return out;
  }, [totalPages, page]);

  const snapTime =
    selectedCam.status === '在线'
      ? `2026-11-26 ${formatHms(liveClockSec)}`
      : selectedCam.lastTime;

  async function handleSaveCamera(payload: {
    name: string;
    sectionName: string;
    stake: string;
    location: string;
    purpose: string;
    status: string;
  }) {
    if (!editingCam) return;
    setSubmitting(true);
    try {
      const res = await fetch(
        `/api/v1/m10/cameras/${encodeURIComponent(editingCam.id)}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '更新点位失败');
        return;
      }
      setEditingCam(null);
      showToast(`已更新点位 ${data.camera.id}（${data.camera.name}）配置`);
      await fetchCameras();
    } catch {
      showToast('更新点位配置失败');
    } finally {
      setSubmitting(false);
    }
  }

  function handleReset() {
    setSection('');
    setSiteType('');
    setPurpose('');
    setStatus('');
    setKeyword('');
    setPage(1);
    setSelectedId('CAM-YD-A01');
    showToast('已重置摄像头筛选条件');
  }

  return (
    <div className="m10-page">
      {/* Top Filter Bar */}
      <div className="glass-panel m10-filter-bar">
        <div className="m10-filter-fields">
          <div className="m10-field">
            <span className="m10-field-label">所属工区</span>
            <select
              className="glass-select m10-select"
              value={section}
              onChange={(e) => {
                setSection(e.target.value);
                setPage(1);
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
            <span className="m10-field-label">场站 / 部位</span>
            <select
              className="glass-select m10-select"
              value={siteType}
              onChange={(e) => {
                setSiteType(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部位置</option>
              {SITE_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">监控用途</span>
            <select
              className="glass-select m10-select"
              value={purpose}
              onChange={(e) => {
                setPurpose(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部用途</option>
              {PURPOSE_TYPES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">设备状态</span>
            <select
              className="glass-select m10-select"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
            >
              <option value="">全部状态</option>
              {STATUS_TYPES.map((st) => (
                <option key={st} value={st}>
                  {st}
                </option>
              ))}
            </select>
          </div>
          <div className="m10-field">
            <span className="m10-field-label">关键词</span>
            <div className="m10-search-wrap">
              <Search size={14} />
              <input
                className="m10-input"
                type="text"
                placeholder="点位 / 桩号 / 设备编号"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    setPage(1);
                    void fetchCameras({ pg: 1 });
                  }
                }}
              />
            </div>
          </div>
        </div>
        <div className="m10-filter-actions">
          <button
            type="button"
            className="m10-btn-query"
            onClick={() => {
              setPage(1);
              void fetchCameras({ pg: 1 });
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

      {/* KPI Strip */}
      <GlassPanel title="视频资源概况" subtitle="(2026年11月)">
        <div className="m10-kpi-grid">
          <div className="m10-kpi-card">
            <div className="m10-kpi-icon">
              <Video size={18} />
            </div>
            <div>
              <div className="m10-kpi-label">接入摄像头</div>
              <div className="m10-kpi-val-row">
                <span className="m10-kpi-val">{kpis.total}</span>
                <span className="m10-kpi-unit">路</span>
              </div>
            </div>
          </div>
          <div className="m10-kpi-card">
            <div className="m10-kpi-icon green">
              <Signal size={18} />
            </div>
            <div>
              <div className="m10-kpi-label">正常在线</div>
              <div className="m10-kpi-val-row">
                <span className="m10-kpi-val green">{kpis.online}</span>
                <span className="m10-kpi-unit">路</span>
              </div>
            </div>
          </div>
          <div className="m10-kpi-card">
            <div className="m10-kpi-icon blue">
              <WifiOff size={18} />
            </div>
            <div>
              <div className="m10-kpi-label">离线</div>
              <div className="m10-kpi-val-row">
                <span className="m10-kpi-val blue">{kpis.offline}</span>
                <span className="m10-kpi-unit">路</span>
              </div>
            </div>
          </div>
          <div className="m10-kpi-card">
            <div className="m10-kpi-icon gold">
              <AlertTriangle size={18} />
            </div>
            <div>
              <div className="m10-kpi-label">图像异常</div>
              <div className="m10-kpi-val-row">
                <span className="m10-kpi-val gold">{kpis.abnormal}</span>
                <span className="m10-kpi-unit">路</span>
              </div>
            </div>
          </div>
          <div className="m10-kpi-card">
            <div className="m10-kpi-icon">
              <Layers size={18} />
            </div>
            <div>
              <div className="m10-kpi-label">覆盖工区</div>
              <div className="m10-kpi-val-row">
                <span className="m10-kpi-val">{kpis.sections}</span>
                <span className="m10-kpi-unit">个</span>
              </div>
            </div>
          </div>
        </div>
      </GlassPanel>

      {/* Lower Split: Camera List + Inspector */}
      <div className="m10-split-66-34">
        <GlassPanel
          title="摄像头列表"
          headerRight={
            <div className="m10-header-meta">
              <span>接入来源</span>
              <strong style={{ color: '#dbeafe' }}>原视频系统</strong>
            </div>
          }
        >
          <div className="m10-table-wrap">
            <table className="data-table m10-table">
              <thead>
                <tr>
                  <th>设备编号</th>
                  <th>工区</th>
                  <th>点位名称</th>
                  <th>桩号</th>
                  <th>布设部位</th>
                  <th>监控用途</th>
                  <th>设备状态</th>
                  <th>操作</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign: 'center',
                        color: '#8cb2db',
                        padding: '28px',
                      }}
                    >
                      {loading
                        ? '正在加载摄像头台账...'
                        : '暂无匹配摄像头记录，请调整筛选条件'}
                    </td>
                  </tr>
                ) : (
                  items.map((c) => (
                    <tr
                      key={c.id}
                      className={c.id === selectedCam.id ? 'active' : ''}
                      onClick={() => setSelectedId(c.id)}
                    >
                      <td style={{ fontWeight: 700, color: '#eaf4ff' }}>{c.id}</td>
                      <td>{c.sectionName}</td>
                      <td>{c.name}</td>
                      <td>{c.stake}</td>
                      <td>{c.location}</td>
                      <td>{c.purpose}</td>
                      <td>
                        <StatusBadge
                          text={c.status}
                          tone={statusToBadgeTone(c.status)}
                        />
                      </td>
                      <td>
                        <button
                          type="button"
                          className="m10-link-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedId(c.id);
                          }}
                        >
                          查看
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          <div className="m10-table-foot">
            <span>共 {total} 路设备</span>
            <div className="m10-pager">
              <button
                type="button"
                className="m10-page-btn"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                &lt;
              </button>
              {pageTokens.map((tok, i) =>
                tok === 'ellipsis' ? (
                  <span key={`e-${i}`} style={{ padding: '0 4px' }}>
                    ...
                  </span>
                ) : (
                  <button
                    key={tok}
                    type="button"
                    className={`m10-page-btn ${tok === page ? 'active' : ''}`}
                    onClick={() => setPage(tok)}
                  >
                    {tok}
                  </button>
                )
              )}
              <button
                type="button"
                className="m10-page-btn"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              >
                &gt;
              </button>
            </div>
          </div>
        </GlassPanel>

        <GlassPanel
          title="设备详情"
          headerRight={
            <button
              type="button"
              className="m10-btn-outline"
              style={{ height: '28px', padding: '0 10px', fontSize: '12px' }}
              onClick={() => setEditingCam(selectedCam)}
            >
              <Pencil size={13} />
              <span>编辑点位</span>
            </button>
          }
        >
          <div className="m10-inspector-body">
            <div className="m10-ins-title-row">
              <span className="m10-ins-id">{selectedCam.id}</span>
              <StatusBadge
                text={selectedCam.status}
                tone={statusToBadgeTone(selectedCam.status)}
              />
            </div>
            <div className="m10-kv-list">
              <div className="m10-kv-row">
                <span className="m10-kv-key">点位名称</span>
                <span className="m10-kv-val">{selectedCam.name}</span>
              </div>
              <div className="m10-kv-row">
                <span className="m10-kv-key">所属工区</span>
                <span className="m10-kv-val">{selectedCam.sectionName}</span>
              </div>
              <div className="m10-kv-row">
                <span className="m10-kv-key">关联桩号</span>
                <span className="m10-kv-val">{selectedCam.stake}</span>
              </div>
              <div className="m10-kv-row">
                <span className="m10-kv-key">布设部位</span>
                <span className="m10-kv-val">{selectedCam.location}</span>
              </div>
              <div className="m10-kv-row">
                <span className="m10-kv-key">监控用途</span>
                <span className="m10-kv-val">{selectedCam.purpose}</span>
              </div>
            </div>

            <div className="m10-ins-title-row" style={{ fontSize: '12.5px' }}>
              <strong style={{ color: '#dbeafe' }}>当前画面</strong>
              <span style={{ color: '#7dd3fc', fontSize: '12px' }}>
                {selectedCam.source}
              </span>
            </div>

            <div className="m10-feed-box">
              <VideoCanvas
                width={480}
                height={276}
                status={selectedCam.status}
                sceneType={selectedCam.sceneType}
              />
              <div className="m10-hud-tl">
                <span className="m10-hud-pill">{snapTime}</span>
              </div>
              <div className="m10-hud-tr">
                <span
                  className={`m10-hud-pill ${selectedCam.status === '图像异常' ? 'warn' : ''}`}
                >
                  {selectedCam.status === '图像异常'
                    ? '最后有效帧'
                    : selectedCam.status === '离线'
                      ? '信号中断'
                      : '画面示意'}
                </span>
              </div>
            </div>

            <div className="m10-btn-pair">
              <button
                type="button"
                className="m10-btn-query"
                onClick={() => onGoPatrol(selectedCam.id)}
              >
                <Video size={14} />
                <span>查看实时画面</span>
              </button>
              <button
                type="button"
                className="m10-btn-outline"
                onClick={() =>
                  onGoPlayback(
                    selectedCam.status === '离线' ? 'CAM-YD-A01' : selectedCam.id
                  )
                }
              >
                <Clock size={14} />
                <span>查历史录像</span>
              </button>
            </div>
          </div>
        </GlassPanel>
      </div>

      {editingCam ? (
        <EditCameraModal
          camera={editingCam}
          submitting={submitting}
          onSave={handleSaveCamera}
          onClose={() => setEditingCam(null)}
        />
      ) : null}
    </div>
  );
}
