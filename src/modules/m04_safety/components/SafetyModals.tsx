'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import { SplitImageCompare } from '@/components/ui/SplitImageCompare';
import {
  IMG_PATHS,
  RISK_CATEGORIES,
  SECTION_META,
  getHazardStatusMeta,
  secName,
  type SafetyAiAlertDTO,
  type SafetyHazardDTO,
  type SafetyRiskPointDTO,
} from '../types';

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
          <button type="button" className="panel-toggle-btn" onClick={onClose} aria-label="关闭弹窗">
            <X size={15} />
          </button>
        </div>
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
}

export function BeforeAfterModal({
  hazard,
  onClose,
}: {
  hazard: SafetyHazardDTO;
  onClose: () => void;
}) {
  const [mode, setMode] = useState<'dual' | 'slider'>('dual');
  const [splitPct, setSplitPct] = useState(50);
  const meta = getHazardStatusMeta(hazard);

  return (
    <ModalShell title={`整改前后对比与复查附件 · ${hazard.id}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>隐患位置</span>
          <strong style={{ fontSize: '13.5px' }}>{hazard.location}</strong>
        </div>
        <div className="detail-stat-card">
          <span>发现来源</span>
          <strong style={{ fontSize: '14px' }}>{hazard.source}</strong>
        </div>
        <div className="detail-stat-card">
          <span>当前状态</span>
          <strong style={{ fontSize: '14px' }}>{meta.label}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginBottom: '10px' }}>
        <button
          type="button"
          className={`m04-pill-tab ${mode === 'dual' ? 'active' : ''}`}
          onClick={() => setMode('dual')}
        >
          并排核验
        </button>
        <button
          type="button"
          className={`m04-pill-tab ${mode === 'slider' ? 'active' : ''}`}
          onClick={() => setMode('slider')}
        >
          卷帘滑动对比
        </button>
      </div>

      {mode === 'dual' ? (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', color: '#fde047', marginBottom: '6px', fontWeight: 600 }}>
              整改前（{hazard.foundAt}）
            </div>
            <div className="m04-photo-box" style={{ aspectRatio: '16/10', cursor: 'default' }}>
              <img src={IMG_PATHS.before} alt="整改前" />
              <div className="m04-defect-rect" />
            </div>
            <p style={{ fontSize: '12px', color: '#cfe4ff', marginTop: '6px' }}>
              {hazard.beforeNote || hazard.description}
            </p>
          </div>
          <div>
            <div style={{ fontSize: '12px', color: '#4ade80', marginBottom: '6px', fontWeight: 600 }}>
              整改后（{hazard.feedbackAt || '待上传'}）
            </div>
            <div className="m04-photo-box" style={{ aspectRatio: '16/10', cursor: 'default' }}>
              <img src={IMG_PATHS.after} alt="整改后" />
              <div className="m04-guardrail-bar" />
            </div>
            <p style={{ fontSize: '12px', color: '#cfe4ff', marginTop: '6px' }}>
              {hazard.afterNote || '待现场施工单位提交整改照片。'}
            </p>
          </div>
        </div>
      ) : (
        <div style={{ height: '310px', borderRadius: '8px', overflow: 'hidden' }}>
          <SplitImageCompare
            beforeSrc={IMG_PATHS.before}
            afterSrc={IMG_PATHS.after}
            splitPct={splitPct}
            onSplitChange={setSplitPct}
            tagText={hazard.location}
            captionText={`${hazard.id} · 整改前（${hazard.foundAt.slice(5, 10)}）vs 整改后（${(hazard.feedbackAt || '待反馈').slice(5, 10)}）`}
          />
        </div>
      )}
    </ModalShell>
  );
}

export function AddHazardModal({
  defaultSectionId,
  period,
  submitting,
  onSubmit,
  onClose,
}: {
  defaultSectionId: string;
  period: string;
  submitting: boolean;
  onSubmit: (payload: {
    period: string;
    sectionId: string;
    category: string;
    location: string;
    dueDate: string;
    description: string;
    req: string;
  }) => Promise<void>;
  onClose: () => void;
}) {
  const [sectionId, setSectionId] = useState(defaultSectionId || 'sec2');
  const [category, setCategory] = useState<string>(RISK_CATEGORIES[0]);
  const [location, setLocation] = useState('桥梁示例A · 4号墩作业平台');
  const [dueDate, setDueDate] = useState('2026-11-28');
  const [description, setDescription] = useState('');
  const [req, setReq] = useState('立即停工整改并补齐标准防护设施，拍照提交复查。');

  async function handleFormSubmit(e: React.FormEvent) {
    e.preventDefault();
    await onSubmit({
      period,
      sectionId,
      category,
      location: location.trim() || '现场作业面',
      dueDate: dueDate.trim() || '2026-11-28',
      description: description.trim() || '现场安全防护缺项',
      req: req.trim(),
    });
  }

  return (
    <ModalShell title="新增人工巡查隐患" onClose={onClose}>
      <form onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="m04-form-field" style={{ margin: 0 }}>
            <label>所属工区</label>
            <select
              className="m04-select"
              style={{ width: '100%' }}
              value={sectionId}
              onChange={(e) => setSectionId(e.target.value)}
            >
              {SECTION_META.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
          <div className="m04-form-field" style={{ margin: 0 }}>
            <label>风险类别</label>
            <select
              className="m04-select"
              style={{ width: '100%' }}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              {RISK_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div className="m04-form-field" style={{ margin: 0 }}>
            <label>工程位置</label>
            <input
              className="m04-input"
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <div className="m04-form-field" style={{ margin: 0 }}>
            <label>整改期限</label>
            <input
              className="m04-input"
              required
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="m04-form-field" style={{ margin: 0 }}>
          <label>隐患描述</label>
          <input
            className="m04-input"
            required
            placeholder="例如：高处作业临边防护网局部松动"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        <div className="m04-form-field" style={{ margin: 0 }}>
          <label>整改要求</label>
          <textarea
            className="m04-textarea"
            value={req}
            onChange={(e) => setReq(e.target.value)}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button type="button" className="m04-btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="m04-btn-query" disabled={submitting}>
            {submitting ? '提交中...' : '确认登记并生成台账'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function RiskMeasuresModal({
  risk,
  submitting,
  onSave,
  onClose,
}: {
  risk: SafetyRiskPointDTO;
  submitting: boolean;
  onSave: (payload: { status: string; measures: string[] }) => Promise<void>;
  onClose: () => void;
}) {
  const [status, setStatus] = useState(risk.status);
  const [measuresText, setMeasuresText] = useState(risk.measures.join('，'));

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const list = measuresText
      .split(/[，,\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
    await onSave({
      status,
      measures: list.length ? list : risk.measures,
    });
  }

  return (
    <ModalShell title={`维护管控记录 · ${risk.id} ${risk.name}`} onClose={onClose}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div className="m04-form-field" style={{ margin: 0 }}>
          <label>当前管控状态</label>
          <select
            className="m04-select"
            style={{ width: '100%' }}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="管控中">管控中</option>
            <option value="重点盯控">重点盯控</option>
            <option value="正常受控">正常受控</option>
          </select>
        </div>
        <div className="m04-form-field" style={{ margin: 0 }}>
          <label>管控措施标签（以中文逗号或空格分隔）</label>
          <input
            className="m04-input"
            value={measuresText}
            onChange={(e) => setMeasuresText(e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
          <button type="button" className="m04-btn-ghost" onClick={onClose}>
            取消
          </button>
          <button type="submit" className="m04-btn-query" disabled={submitting}>
            {submitting ? '保存中...' : '保存管控记录'}
          </button>
        </div>
      </form>
    </ModalShell>
  );
}

export function RiskCameraModal({
  risk,
  onClose,
}: {
  risk: SafetyRiskPointDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`现场视频监测 · ${risk.id} ${risk.name}`} onClose={onClose}>
      <div className="media-card playing" style={{ margin: 0 }}>
        <img src={IMG_PATHS[risk.imgKey] || IMG_PATHS.corridor} alt={risk.name} />
        <div className="media-top-badges">
          <span className="live-pill">
            <span className="live-dot" />
            实时视频流 · {risk.camCode}
          </span>
          <span className="cam-pill">
            {secName(risk.sectionId)} · {risk.category}
          </span>
        </div>
      </div>
      <p style={{ color: '#dbeafe', fontSize: '12.5px', marginTop: '10px' }}>
        位置：{risk.location} ｜ 风险等级：{risk.level} ｜ 责任单位：{risk.unit}
      </p>
    </ModalShell>
  );
}

export function RiskInspectionModal({
  risk,
  onClose,
}: {
  risk: SafetyRiskPointDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`无人机与安全巡检成果 · ${risk.id} ${risk.name}`} onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>最近巡检时间</span>
          <strong style={{ fontSize: '14px' }}>2026-11-24 14:30</strong>
        </div>
        <div className="detail-stat-card">
          <span>巡检方式</span>
          <strong style={{ fontSize: '14px' }}>无人机正射 + 人工复核</strong>
        </div>
        <div className="detail-stat-card">
          <span>关联监控设备</span>
          <strong style={{ fontSize: '14px' }}>{risk.camCode}</strong>
        </div>
      </div>
      <p style={{ color: '#dbeafe', fontSize: '12.5px', marginTop: '8px' }}>
        管控要点：{risk.measures.join('；')}
      </p>
    </ModalShell>
  );
}

export function AiFullscreenModal({
  alert,
  onClose,
}: {
  alert: SafetyAiAlertDTO;
  onClose: () => void;
}) {
  return (
    <ModalShell title={`AI预警证据高清回放 · ${alert.id}`} onClose={onClose}>
      <div className="m04-evidence-frame">
        <img src={IMG_PATHS[alert.imgKey] || IMG_PATHS.corridor} alt={alert.event} />
        <div className="m04-cam-hud">
          <span className="m04-hud-pill">{alert.camera}</span>
          <span className="m04-hud-pill">{alert.alertTime}</span>
        </div>
        <div
          className="m04-detect-box"
          style={{
            left: `${alert.box.left}%`,
            top: `${alert.box.top}%`,
            width: `${alert.box.width}%`,
            height: `${alert.box.height}%`,
          }}
        >
          <div className="m04-detect-label">{alert.event}</div>
        </div>
      </div>
      <p style={{ color: '#dbeafe', fontSize: '12.5px', marginTop: '10px' }}>
        识别算法：{alert.algorithm} ｜ 工区位置：{alert.shortLoc}
      </p>
    </ModalShell>
  );
}

export function DuplicateAlertModal({
  alert,
  candidates,
  submitting,
  onPick,
  onClose,
}: {
  alert: SafetyAiAlertDTO;
  candidates: SafetyHazardDTO[];
  submitting: boolean;
  onPick: (hazardId: string) => Promise<void>;
  onClose: () => void;
}) {
  const sameSec = candidates.filter((h) => h.sectionId === alert.sectionId);
  const pool = sameSec.length > 0 ? sameSec : candidates.slice(0, 6);

  return (
    <ModalShell title={`关联已有隐患 · ${alert.id}`} onClose={onClose}>
      <p style={{ color: '#cfe4ff', fontSize: '12.5px', marginBottom: '10px' }}>
        选择与本条视频AI预警属于同一现场问题的已有隐患编号，完成去重关联：
      </p>
      <div className="m04-card-list">
        {pool.map((h) => {
          const sm = getHazardStatusMeta(h);
          return (
            <div
              key={h.id}
              className="m04-list-card"
              style={{ cursor: submitting ? 'wait' : 'pointer' }}
              onClick={() => {
                if (!submitting) void onPick(h.id);
              }}
            >
              <div className="m04-card-main">
                <div className="m04-card-title">
                  {h.id} · {h.description}
                </div>
                <div className="m04-card-sub">
                  {h.location} | 来源：{h.source} | 期限：{h.dueDate}
                </div>
              </div>
              <span className={`m04-tag ${sm.cls}`}>{sm.label}</span>
            </div>
          );
        })}
      </div>
    </ModalShell>
  );
}
