'use client';

import { useEffect, useState } from 'react';
import { Calendar, FileText, Maximize2 } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SplitImageCompare } from '@/components/ui/SplitImageCompare';
import { usePlatformStore } from '@/lib/store/platform-store';
import { getGlobalCesiumEngine } from '@/lib/cesium/engine';
import { STATIC_WORK_SECTIONS } from '@/lib/modules/platform-data';
import type { ApiMilestone } from '../types';

export interface MilestoneSubPageProps {
  milestones: ApiMilestone[];
}

export function MilestoneSubPage({ milestones }: MilestoneSubPageProps) {
  const cesiumReady = usePlatformStore((s) => s.cesiumReady);
  const openModal = usePlatformStore((s) => s.openModal);
  const showToast = usePlatformStore((s) => s.showToast);

  const [msSection, setMsSection] = useState('二工区');
  const [msObject, setMsObject] = useState('桥梁示例A');
  const [msLeftDate, setMsLeftDate] = useState('2026-09-25');
  const [msRightDate, setMsRightDate] = useState('2026-11-20');
  const [msActiveNodeId, setMsActiveNodeId] = useState('m4');
  const [msSplitPct, setMsSplitPct] = useState(50);
  const [msZoom, setMsZoom] = useState(1);
  const [msFilters, setMsFilters] = useState({ photo: true, uav: true, progress: true });

  useEffect(() => {
    const ces = getGlobalCesiumEngine();
    if (ces.ready) ces.setShowcaseBackdropMode(false);
  }, [cesiumReady]);

  const activeNode = milestones.find((n) => n.id === msActiveNodeId) ?? milestones[3];
  const leftNode = milestones.find((n) => n.milestoneDate === msLeftDate) ?? milestones[2];
  const rightNode = milestones.find((n) => n.milestoneDate === msRightDate) ?? milestones[3];
  const beforeSrc = leftNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg';
  const afterSrc = rightNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg';

  return (
    <section className="page-view active" id="page-milestone">
      <SplitImageCompare
        beforeSrc={beforeSrc}
        afterSrc={afterSrc}
        beforeFilter={leftNode?.cssFilter ?? 'none'}
        afterFilter={rightNode?.cssFilter ?? 'none'}
        splitPct={msSplitPct}
        onSplitChange={setMsSplitPct}
        zoom={msZoom}
        tagText={msSection}
      />

      <div className="compare-date-bar">
        <div className="compare-date-picker">
          <Calendar size={14} />
          <select value={msLeftDate} onChange={(e) => setMsLeftDate(e.target.value)}>
            {milestones.map((n) => (
              <option key={n.id} value={n.milestoneDate}>
                {n.milestoneDate}
              </option>
            ))}
          </select>
        </div>
        <div className="compare-date-picker">
          <Calendar size={14} />
          <select value={msRightDate} onChange={(e) => setMsRightDate(e.target.value)}>
            {milestones.map((n) => (
              <option key={n.id} value={n.milestoneDate}>
                {n.milestoneDate}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="zoom-pill vertical" style={{ position: 'absolute', right: 304, bottom: 20, zIndex: 20 }}>
        <button type="button" className="zoom-btn" onClick={() => setMsZoom((z) => Math.min(1.9, +(z + 0.15).toFixed(2)))}>
          +
        </button>
        <button type="button" className="zoom-btn" onClick={() => setMsZoom((z) => Math.max(1, +(z - 0.15).toFixed(2)))}>
          −
        </button>
        <button
          type="button"
          className="zoom-btn"
          onClick={() => {
            setMsZoom(1);
            setMsSplitPct(50);
          }}
        >
          <Maximize2 size={14} />
        </button>
      </div>

      <div className="hud-left-col">
        <GlassPanel id="panelMilestoneLeft" title="对象选择" collapsible>
          <div className="form-row">
            <label>所属工区</label>
            <select className="glass-select" value={msSection} onChange={(e) => setMsSection(e.target.value)}>
              {STATIC_WORK_SECTIONS.map((s) => (
                <option key={s.id} value={s.name}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-row" style={{ marginBottom: 14 }}>
            <label>工程对象</label>
            <select className="glass-select" value={msObject} onChange={(e) => setMsObject(e.target.value)}>
              <option value="桥梁示例A">桥梁示例A</option>
              <option value="梁场示例A">梁场示例A</option>
              <option value="拌合站示例A">拌合站示例A</option>
              <option value="K34路基示范段">K34路基示范段</option>
            </select>
          </div>

          <div className="panel-title-group" style={{ marginBottom: 8 }}>
            <span className="panel-accent-bar" />
            <span className="panel-title">节点详情</span>
          </div>
          <div style={{ fontSize: 17, fontWeight: 800, marginBottom: 3 }}>{activeNode?.title ?? '梁板架设'}</div>
          <div style={{ fontSize: 12.5, color: 'var(--text-sub)', marginBottom: 10 }}>
            节点日期 &nbsp;<strong style={{ color: '#fff' }}>{activeNode?.milestoneDate ?? '2026-11-20'}</strong>
          </div>

          <div className="media-card">
            <img
              src={activeNode?.imgMode === 'after' ? '/assets/milestone_after.jpg' : '/assets/milestone_before.jpg'}
              alt="节点影像"
              loading="lazy"
              decoding="async"
            />
            <div className="media-top-badges">
              <span className="live-pill">
                <span className="live-dot" />
                现场影像 · 演示
              </span>
            </div>
            <span className="duration-chip">05:00</span>
          </div>

          <button
            type="button"
            className="btn-primary-glow"
            onClick={() => {
              if (!activeNode) return;
              openModal(`节点归档资料 · ${msObject}（${activeNode.milestoneDate} ${activeNode.title}）`, [
                {
                  type: 'stats',
                  items: [
                    { label: '节点照片', value: `${activeNode.photosCount} 张` },
                    { label: '无人机航拍视频', value: `${activeNode.videosCount} 条` },
                    { label: '进度日志记录', value: `${activeNode.logsCount} 条` },
                  ],
                },
                {
                  type: 'paragraph',
                  text: activeNode.description,
                  tone: 'cyan',
                },
              ]);
            }}
          >
            <FileText size={15} />
            <span>查看节点资料</span>
          </button>
        </GlassPanel>
      </div>

      <div className="hud-right-col">
        <GlassPanel id="panelMilestoneRight" title="关键建设节点" collapsible>
          <div className="route-header-btn" style={{ textAlign: 'center', cursor: 'default' }}>
            {msSection} · {msObject}
          </div>
          <div className="timeline-list" style={{ marginBottom: 16 }}>
            {milestones.map((n) => (
              <div
                key={n.id}
                className={`timeline-item ${n.id === msActiveNodeId ? 'active' : ''}`}
                onClick={() => {
                  setMsActiveNodeId(n.id);
                  if (n.imgMode === 'after') {
                    setMsRightDate(n.milestoneDate);
                    setMsSplitPct(36);
                  } else {
                    setMsLeftDate(n.milestoneDate);
                    setMsSplitPct(62);
                  }
                  showToast(`已定位关键节点：${n.milestoneDate} ${n.title}`);
                }}
              >
                <span className="timeline-node" />
                <div>
                  <div className="timeline-sub">{n.milestoneDate}</div>
                  <div className="timeline-label">{n.title}</div>
                </div>
              </div>
            ))}
          </div>
          <div className="panel-title-group" style={{ marginBottom: 10 }}>
            <span className="panel-accent-bar" />
            <span className="panel-title">资料类型</span>
          </div>
          <div className="checkbox-list">
            <label className="check-item">
              <input
                type="checkbox"
                checked={msFilters.photo}
                onChange={(e) => setMsFilters((f) => ({ ...f, photo: e.target.checked }))}
              />
              <span>节点照片</span>
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={msFilters.uav}
                onChange={(e) => setMsFilters((f) => ({ ...f, uav: e.target.checked }))}
              />
              <span>无人机影像</span>
            </label>
            <label className="check-item">
              <input
                type="checkbox"
                checked={msFilters.progress}
                onChange={(e) => setMsFilters((f) => ({ ...f, progress: e.target.checked }))}
              />
              <span>进度记录</span>
            </label>
          </div>
        </GlassPanel>
      </div>
    </section>
  );
}
