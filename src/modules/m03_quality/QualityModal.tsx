'use client';

import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { TrendLineSvg } from './QualityCharts';
import type {
  QualityBeamRecord,
  QualityInspectionRecord,
  QualityIssueRecord,
  QualityLabRecord,
  QualityMixingRecord,
  QualityPavementRecord,
  QualitySectionMetric,
} from './types';

export type QualityModalPayload =
  | { kind: 'inspection'; record: QualityInspectionRecord }
  | { kind: 'lab'; record: QualityLabRecord }
  | { kind: 'mixing'; record: QualityMixingRecord }
  | { kind: 'pavement'; record: QualityPavementRecord }
  | { kind: 'beamYard'; record: QualityBeamRecord }
  | { kind: 'issue'; record: QualityIssueRecord }
  | { kind: 'createIssue'; defaultSectionId?: string | null }
  | { kind: 'gateway'; sysName: string; subDesc: string }
  | { kind: 'stations'; sections: QualitySectionMetric[]; activeSectionId: string | null };

export function QualityModal({
  payload,
  sections,
  onClose,
  onJumpToIssues,
  onMutated,
  showToast,
}: {
  payload: QualityModalPayload | null;
  sections: QualitySectionMetric[];
  onClose: () => void;
  onJumpToIssues: () => void;
  onMutated: () => Promise<void>;
  showToast: (msg: string) => void;
}) {
  const [submitting, setSubmitting] = useState(false);
  const [handleNote, setHandleNote] = useState('');
  const [issueMeasure, setIssueMeasure] = useState('');

  // Create issue form states
  const [newSectionId, setNewSectionId] = useState('sec2');
  const [newIssueType, setNewIssueType] = useState('施工工艺');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newUnit, setNewUnit] = useState('二工区项目部');
  const [newDeadline, setNewDeadline] = useState('2026-11-30');
  const [newMeasure, setNewMeasure] = useState('');

  useEffect(() => {
    if (!payload) return;
    if (payload.kind === 'mixing') {
      setHandleNote(
        payload.record.handleNote ||
          '已通知拌合站操作手校核称重传感器与骨料含水率补偿，后续盘次已恢复正常。'
      );
    } else if (payload.kind === 'issue') {
      setIssueMeasure(payload.record.measure || '');
    } else if (payload.kind === 'createIssue') {
      const secId = payload.defaultSectionId || 'sec2';
      const sec = sections.find((s) => s.sectionId === secId);
      setNewSectionId(secId);
      setNewUnit(`${sec?.name ?? '二工区'}项目部`);
      setNewTitle('');
      setNewDesc('');
      setNewMeasure('');
    }
  }, [payload, sections]);

  useEffect(() => {
    if (!payload) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [payload, onClose]);

  if (!payload) return null;

  let modalTitle = '';
  if (payload.kind === 'inspection') modalTitle = `质量检查详情 · ${payload.record.target}`;
  else if (payload.kind === 'lab') modalTitle = `试验检测电子报告 · ${payload.record.id}`;
  else if (payload.kind === 'mixing') modalTitle = `拌合生产配合比详情 · ${payload.record.id}`;
  else if (payload.kind === 'pavement') modalTitle = `路面摊铺碾压质控详情 · ${payload.record.stake}`;
  else if (payload.kind === 'beamYard') modalTitle = `智慧梁场梁片全周期追溯 · ${payload.record.id}`;
  else if (payload.kind === 'issue') modalTitle = `质量问题整改闭环单 · ${payload.record.id}`;
  else if (payload.kind === 'createIssue') modalTitle = '上报质量问题 · 纳入闭环台账';
  else if (payload.kind === 'gateway') modalTitle = `第三方业务系统接口 · ${payload.sysName}`;
  else if (payload.kind === 'stations') modalTitle = '全线关键场站质量与数据同步清单';

  async function runPatch(url: string, body: Record<string, unknown>, successMsg: string) {
    setSubmitting(true);
    try {
      const res = await fetch(url, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '操作失败，请检查权限或参数');
        return;
      }
      onClose();
      showToast(successMsg);
      await onMutated();
    } catch {
      showToast('网络请求失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleCreateIssue(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim() || !newDesc.trim() || !newMeasure.trim()) {
      showToast('请完整填写问题标题、问题描述与拟定整改措施');
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch('/api/v1/m03/issues', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sectionId: newSectionId,
          issueType: newIssueType,
          title: newTitle.trim(),
          description: newDesc.trim(),
          unit: newUnit.trim(),
          deadline: newDeadline.trim(),
          measure: newMeasure.trim(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        showToast(data.error || '新增质量问题失败');
        return;
      }
      onClose();
      showToast(`已新增质量问题 ${data.record?.id ?? ''} 并持久化到台账`);
      await onMutated();
    } catch {
      showToast('网络请求失败，请稍后重试');
    } finally {
      setSubmitting(false);
    }
  }

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
            <span className="panel-title">{modalTitle}</span>
          </div>
          <button type="button" className="panel-toggle-btn" onClick={onClose} aria-label="关闭弹窗">
            <X size={15} />
          </button>
        </div>

        <div className="modal-body">
          {payload.kind === 'inspection' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>所属工区 / 类别</span>
                  <strong>
                    {payload.record.section} · {payload.record.category}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>实测结果</span>
                  <strong
                    style={{
                      color: payload.record.result === '合格' ? '#4ade80' : '#f87171',
                    }}
                  >
                    {payload.record.measured}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>规范标准</span>
                  <strong>{payload.record.standard}</strong>
                </div>
              </div>

              <table className="data-table">
                <tbody>
                  <tr>
                    <th style={{ width: '120px' }}>检查编号</th>
                    <td>{payload.record.id}</td>
                    <th style={{ width: '120px' }}>检查时间</th>
                    <td>{payload.record.inspectedAt}</td>
                  </tr>
                  <tr>
                    <th>检查对象</th>
                    <td>{payload.record.target}</td>
                    <th>检查内容</th>
                    <td>{payload.record.content}</td>
                  </tr>
                  <tr>
                    <th>检验员</th>
                    <td>{payload.record.inspector}</td>
                    <th>整改状态</th>
                    <td>
                      <span
                        className={`status-tag ${
                          payload.record.rectify === '已整改' || payload.record.result === '合格'
                            ? 'ok'
                            : 'warn'
                        }`}
                      >
                        {payload.record.rectify === '—' ? '无需整改' : payload.record.rectify}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <p style={{ color: '#dbeafe', lineHeight: 1.6 }}>
                <strong>处置与复核说明：</strong>
                {payload.record.note}
              </p>

              {payload.record.rectify === '整改中' ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  onClick={() => {
                    onClose();
                    onJumpToIssues();
                  }}
                >
                  前往「质量问题与整改」办理闭环
                </button>
              ) : null}
            </>
          ) : null}

          {payload.kind === 'lab' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>实测数值</span>
                  <strong
                    style={{
                      color: payload.record.result === '合格' ? '#4ade80' : '#f87171',
                    }}
                  >
                    {payload.record.measured}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>标准限值</span>
                  <strong>{payload.record.limitSpec}</strong>
                </div>
                <div className="detail-stat-card">
                  <span>防篡改存证哈希</span>
                  <strong style={{ fontSize: '14px' }}>{payload.record.hash}</strong>
                </div>
              </div>

              <table className="data-table">
                <tbody>
                  <tr>
                    <th style={{ width: '120px' }}>所属实验室</th>
                    <td>{payload.record.lab}</td>
                    <th style={{ width: '120px' }}>样品名称</th>
                    <td>{payload.record.sample}</td>
                  </tr>
                  <tr>
                    <th>检测项目</th>
                    <td>{payload.record.item}</td>
                    <th>采集设备</th>
                    <td>{payload.record.machine}</td>
                  </tr>
                  <tr>
                    <th>检测时间</th>
                    <td>{payload.record.testedAt}</td>
                    <th>复检状态</th>
                    <td>
                      <span
                        className={`status-tag ${
                          payload.record.retestState === '待复检' ? 'warn' : 'ok'
                        }`}
                      >
                        {payload.record.retestState}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div className="m03-modal-form">
                <div className="m03-modal-section-title">
                  试验机自动采集过程曲线（设备直传防篡改）
                </div>
                <TrendLineSvg
                  idPrefix="modal-lab"
                  points={
                    payload.record.result === '合格'
                      ? [
                          { label: '0s', value: 98.1 },
                          { label: '20s', value: 98.5 },
                          { label: '40s', value: 98.9 },
                          { label: '60s', value: 99.2 },
                          { label: '80s', value: 99.0 },
                        ]
                      : [
                          { label: '0s', value: 97.4 },
                          { label: '20s', value: 97.8 },
                          { label: '40s', value: 97.5 },
                          { label: '60s', value: 97.9 },
                          { label: '80s', value: 97.6 },
                        ]
                  }
                  minY={97}
                  maxY={100}
                  ticks={[97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
                />
              </div>

              {payload.record.retestState === '待复检' ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={submitting}
                  onClick={() =>
                    runPatch(
                      `/api/v1/m03/lab/${encodeURIComponent(payload.record.id)}`,
                      { action: 'retest' },
                      `已完成 ${payload.record.id} 平行复检存证并更新状态为「已复检」`
                    )
                  }
                >
                  {submitting ? '提交中...' : '发起平行复检并标记为「已复检」'}
                </button>
              ) : null}

              {payload.record.reportState === '待出具' ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={submitting}
                  onClick={() =>
                    runPatch(
                      `/api/v1/m03/lab/${encodeURIComponent(payload.record.id)}`,
                      { action: 'signReport' },
                      `已签章生成 ${payload.record.id} 电子检测报告`
                    )
                  }
                >
                  {submitting ? '签章中...' : '签章出具电子检测报告'}
                </button>
              ) : null}
            </>
          ) : null}

          {payload.kind === 'mixing' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>拌合站 / 工区</span>
                  <strong>
                    {payload.record.station} · {payload.record.section}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>生产类型 / 配合比</span>
                  <strong>
                    {payload.record.prodType} · {payload.record.mixCode}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>出料温度 / 最大偏差</span>
                  <strong
                    style={{
                      color: payload.record.judge === '合格' ? '#4ade80' : '#facc15',
                    }}
                  >
                    {payload.record.temp} · {payload.record.deviation}
                  </strong>
                </div>
              </div>

              <table className="data-table">
                <thead>
                  <tr>
                    <th>材料名称</th>
                    <th>目标配比</th>
                    <th>实际称量</th>
                    <th>偏差率</th>
                    <th>状态</th>
                  </tr>
                </thead>
                <tbody>
                  {payload.record.materials.map((m) => {
                    const diffPct = (
                      ((m.actual - m.target) / Math.max(0.01, m.target)) *
                      100
                    ).toFixed(1);
                    const over = Math.abs(Number(diffPct)) > 2.0;
                    return (
                      <tr key={m.name}>
                        <td>{m.name}</td>
                        <td>
                          {m.target} {m.unit}
                        </td>
                        <td>
                          {m.actual} {m.unit}
                        </td>
                        <td style={{ color: over ? '#facc15' : '#4ade80' }}>
                          {Number(diffPct) > 0 ? '+' : ''}
                          {diffPct}%
                        </td>
                        <td>
                          <span className={`status-tag ${over ? 'warn' : 'ok'}`}>
                            {over ? '超差预警' : '正常'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              {payload.record.judge === '预警' && !payload.record.handled ? (
                <div className="m03-modal-form">
                  <div className="m03-modal-section-title">
                    预警处置闭环（{payload.record.alertTitle}）
                  </div>
                  <textarea
                    className="m03-modal-textarea"
                    value={handleNote}
                    onChange={(e) => setHandleNote(e.target.value)}
                    placeholder="输入校准与处置说明..."
                  />
                  <button
                    type="button"
                    className="btn-primary-glow"
                    disabled={submitting}
                    onClick={() =>
                      runPatch(
                        `/api/v1/m03/mixing/${encodeURIComponent(payload.record.id)}`,
                        { action: 'handle', handleNote },
                        `批次 ${payload.record.id} 预警已处置完成，预警处理率已同步更新`
                      )
                    }
                  >
                    {submitting ? '提交中...' : '提交处置并标记「已处理」'}
                  </button>
                </div>
              ) : (
                <p style={{ color: '#4ade80' }}>
                  该生产批次
                  {payload.record.judge === '预警'
                    ? `预警已完成校准处置${payload.record.handleNote ? `（${payload.record.handleNote}）` : ''}`
                    : '全程称量偏差在允许范围内'}
                  。
                </p>
              )}
            </>
          ) : null}

          {payload.kind === 'pavement' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>施工层位 / 方向</span>
                  <strong>
                    {payload.record.layer} · {payload.record.dir.split('（')[0]}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>实测压实度 / 遍数</span>
                  <strong
                    style={{
                      color: payload.record.compaction >= 98 ? '#4ade80' : '#facc15',
                    }}
                  >
                    {payload.record.compaction.toFixed(1)}% · {payload.record.passes}遍
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>实测厚度 / 设计值</span>
                  <strong
                    style={{
                      color:
                        payload.record.thickness >= payload.record.designThick - 0.3
                          ? '#4ade80'
                          : '#facc15',
                    }}
                  >
                    {payload.record.thickness.toFixed(1)} / {payload.record.designThick.toFixed(1)} cm
                  </strong>
                </div>
              </div>

              <div className="m03-modal-form">
                <div className="m03-modal-section-title">北斗压实轨迹与摊铺温度沿程分布</div>
                <TrendLineSvg
                  idPrefix="modal-pav"
                  points={['起点', '1/4段', '1/2段', '3/4段', '终点'].map((lbl, idx) => ({
                    label: lbl,
                    value: Math.min(
                      99.8,
                      Math.max(96.5, payload.record.compaction + (idx === 2 ? -0.3 : 0.2))
                    ),
                  }))}
                  minY={96}
                  maxY={100}
                  ticks={[96, 97, 98, 99, 100].map((v) => ({ val: v, label: `${v}%` }))}
                />
                <div style={{ fontSize: '12px', color: '#bae6fd' }}>
                  红外连续测温采样：
                  {[
                    payload.record.temp + 2,
                    payload.record.temp + 1,
                    payload.record.temp,
                    payload.record.temp - 1,
                    payload.record.temp + 1,
                  ]
                    .map((t) => `${t}℃`)
                    .join(' → ')}
                </div>
              </div>

              {payload.record.judge !== '合格' && !payload.record.verified ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={submitting}
                  onClick={() =>
                    runPatch(
                      `/api/v1/m03/pavement/${encodeURIComponent(payload.record.id)}`,
                      { action: 'verify' },
                      `已完成 ${payload.record.stake} 路面质量预警现场核查确认`
                    )
                  }
                >
                  {submitting ? '核查提交中...' : '核查补压/补铺结果并标记「已核查」'}
                </button>
              ) : null}
            </>
          ) : null}

          {payload.kind === 'beamYard' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>所属梁场 / 台座</span>
                  <strong>
                    {payload.record.yard} · {payload.record.pedestal}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>梁型 / 浇筑日期</span>
                  <strong>
                    {payload.record.beamType} · {payload.record.castDate}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>蒸汽养护温湿度</span>
                  <strong>
                    {payload.record.temp} / {payload.record.humidity}
                  </strong>
                </div>
              </div>

              <div className="m03-stepper">
                <div className={`m03-step-box ${payload.record.curing === '已完成' ? 'done' : ''}`}>
                  <div style={{ fontSize: '11px', color: '#93b8de' }}>1.智能养护</div>
                  <strong>{payload.record.curing}</strong>
                </div>
                <div
                  className={`m03-step-box ${
                    payload.record.tension === '合格'
                      ? 'done'
                      : payload.record.tension === '待复检'
                        ? 'warn'
                        : ''
                  }`}
                >
                  <div style={{ fontSize: '11px', color: '#93b8de' }}>2.预应力张拉</div>
                  <strong>{payload.record.tension}</strong>
                </div>
                <div className={`m03-step-box ${payload.record.grout === '合格' ? 'done' : ''}`}>
                  <div style={{ fontSize: '11px', color: '#93b8de' }}>3.孔道压浆</div>
                  <strong>{payload.record.grout}</strong>
                </div>
                <div className={`m03-step-box ${payload.record.inspect === '合格' ? 'done' : ''}`}>
                  <div style={{ fontSize: '11px', color: '#93b8de' }}>4.成品检验</div>
                  <strong>{payload.record.inspect}</strong>
                </div>
              </div>

              <table className="data-table">
                <tbody>
                  <tr>
                    <th style={{ width: '130px' }}>张拉伸长量偏差</th>
                    <td>{payload.record.elongation}</td>
                    <th style={{ width: '130px' }}>压浆持荷压力</th>
                    <td>{payload.record.groutPressure}</td>
                  </tr>
                </tbody>
              </table>

              {payload.record.tension === '待复检' || payload.record.alertState === '跟踪中' ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={submitting}
                  onClick={() =>
                    runPatch(
                      `/api/v1/m03/beam-yard/${encodeURIComponent(payload.record.id)}`,
                      { action: 'clearAlert' },
                      `梁片 ${payload.record.id} 工序预警已复检合格`
                    )
                  }
                >
                  {submitting ? '提交中...' : '确认工序复检合格并清除预警'}
                </button>
              ) : payload.record.statusState === 'producing' ? (
                <button
                  type="button"
                  className="btn-primary-glow"
                  disabled={submitting}
                  onClick={() =>
                    runPatch(
                      `/api/v1/m03/beam-yard/${encodeURIComponent(payload.record.id)}`,
                      { action: 'advanceStep' },
                      `已推进梁片 ${payload.record.id} 工序状态`
                    )
                  }
                >
                  {submitting ? '推进中...' : '推进下一质检工序（模拟验收）'}
                </button>
              ) : (
                <p style={{ color: '#4ade80' }}>
                  该梁片已完成全部智慧梁场工序检验并出具二维码出厂合格证。
                </p>
              )}
            </>
          ) : null}

          {payload.kind === 'issue' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>所属工区 / 问题类型</span>
                  <strong>
                    {payload.record.section} · {payload.record.issueType}
                  </strong>
                </div>
                <div className="detail-stat-card">
                  <span>整改责任单位</span>
                  <strong>{payload.record.unit}</strong>
                </div>
                <div className="detail-stat-card">
                  <span>整改状态 / 期限</span>
                  <strong
                    style={{
                      color: payload.record.status === '已整改' ? '#4ade80' : '#38bdf8',
                    }}
                  >
                    {payload.record.status} · {payload.record.deadline}
                  </strong>
                </div>
              </div>

              <table className="data-table">
                <tbody>
                  <tr>
                    <th style={{ width: '120px' }}>问题描述</th>
                    <td>{payload.record.description}</td>
                    <th style={{ width: '120px' }}>发现时间</th>
                    <td>{payload.record.foundAt}</td>
                  </tr>
                  <tr>
                    <th>整改措施</th>
                    <td colSpan={3}>{payload.record.measure}</td>
                  </tr>
                </tbody>
              </table>

              {payload.record.status !== '已整改' ? (
                <div className="m03-modal-form">
                  <div className="m03-modal-section-title">监理复核与整改销号</div>
                  <textarea
                    className="m03-modal-textarea"
                    value={issueMeasure}
                    onChange={(e) => setIssueMeasure(e.target.value)}
                  />
                  <button
                    type="button"
                    className="btn-primary-glow"
                    disabled={submitting}
                    onClick={() =>
                      runPatch(
                        `/api/v1/m03/issues/${encodeURIComponent(payload.record.id)}`,
                        { action: 'close', status: '已整改', measure: issueMeasure.trim() },
                        `问题 ${payload.record.id} 已完成整改复核销号，整改进展已更新`
                      )
                    }
                  >
                    {submitting ? '销号提交中...' : '确认整改落实并销号（「整改中」→「已整改」）'}
                  </button>
                </div>
              ) : (
                <p style={{ color: '#4ade80' }}>
                  该质量问题已完成现场复核销号，整改用时 {payload.record.daysUsed ?? 2.1} 天。
                </p>
              )}
            </>
          ) : null}

          {payload.kind === 'createIssue' ? (
            <form className="m03-modal-form" onSubmit={handleCreateIssue}>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="m03-modal-section-title">所属工区</div>
                  <select
                    className="glass-select w-full"
                    value={newSectionId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setNewSectionId(id);
                      const sec = sections.find((s) => s.sectionId === id);
                      if (sec) setNewUnit(`${sec.name}项目部`);
                    }}
                  >
                    {sections.map((s) => (
                      <option key={s.sectionId} value={s.sectionId}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <div className="m03-modal-section-title">问题类型</div>
                  <select
                    className="glass-select w-full"
                    value={newIssueType}
                    onChange={(e) => setNewIssueType(e.target.value)}
                  >
                    <option value="原材料质量">原材料质量</option>
                    <option value="施工工艺">施工工艺</option>
                    <option value="检测异常">检测异常</option>
                    <option value="构件质量">构件质量</option>
                    <option value="其他">其他</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="m03-modal-section-title">整改责任单位</div>
                  <input
                    className="m03-modal-input"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="如：二工区项目部"
                  />
                </div>
                <div>
                  <div className="m03-modal-section-title">整改期限</div>
                  <input
                    className="m03-modal-input"
                    value={newDeadline}
                    onChange={(e) => setNewDeadline(e.target.value)}
                    placeholder="YYYY-MM-DD"
                  />
                </div>
              </div>

              <div>
                <div className="m03-modal-section-title">问题标题</div>
                <input
                  className="m03-modal-input"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="简要概括质量隐患名称..."
                />
              </div>

              <div>
                <div className="m03-modal-section-title">问题描述</div>
                <input
                  className="m03-modal-input"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  placeholder="具体部位、实测偏差及规范依据..."
                />
              </div>

              <div>
                <div className="m03-modal-section-title">拟定整改措施</div>
                <textarea
                  className="m03-modal-textarea"
                  value={newMeasure}
                  onChange={(e) => setNewMeasure(e.target.value)}
                  placeholder="输入闭环整改要求与复检方案..."
                />
              </div>

              <button type="submit" className="btn-primary-glow" disabled={submitting}>
                {submitting ? '提交入库中...' : '提交并写入质量问题台账'}
              </button>
            </form>
          ) : null}

          {payload.kind === 'gateway' ? (
            <>
              <div className="detail-grid">
                <div className="detail-stat-card">
                  <span>对接系统名称</span>
                  <strong>{payload.sysName}</strong>
                </div>
                <div className="detail-stat-card">
                  <span>链路与同步状态</span>
                  <strong style={{ color: '#4ade80' }}>在线实时同步</strong>
                </div>
                <div className="detail-stat-card">
                  <span>最近同步时间</span>
                  <strong>2026-11-25 10:45</strong>
                </div>
              </div>
              <p style={{ color: '#dbeafe', lineHeight: 1.7 }}>{payload.subDesc}</p>
              <div className="m03-modal-form">
                <div className="m03-modal-section-title">数据采集通道监测</div>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>工区 / 节点</th>
                      <th>采集终端</th>
                      <th>协议类型</th>
                      <th>心跳状态</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>一工区 ~ 三工区</td>
                      <td>试验机/拌合机/摊铺传感器</td>
                      <td>MQTT + HTTPS 加密回传</td>
                      <td>
                        <span className="status-tag ok">正常 (12ms)</span>
                      </td>
                    </tr>
                    <tr>
                      <td>四工区 ~ 六工区</td>
                      <td>智慧梁场张拉压浆端机</td>
                      <td>数字签名防篡改网关</td>
                      <td>
                        <span className="status-tag ok">正常 (15ms)</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </>
          ) : null}

          {payload.kind === 'stations' ? (
            <table className="data-table">
              <thead>
                <tr>
                  <th>工区</th>
                  <th>拌合站</th>
                  <th>实验室</th>
                  <th>服务梁场</th>
                  <th>在线状态</th>
                  <th>同步时间</th>
                </tr>
              </thead>
              <tbody>
                {payload.sections
                  .filter(
                    (s) => !payload.activeSectionId || s.sectionId === payload.activeSectionId
                  )
                  .map((s) => (
                    <tr key={s.sectionId}>
                      <td>{s.name}</td>
                      <td>{s.stationFull}</td>
                      <td>{s.labName}</td>
                      <td>{s.yardName}</td>
                      <td>
                        <span className="status-tag ok">运行正常</span>
                      </td>
                      <td style={{ fontVariantNumeric: 'tabular-nums' }}>2026-11-25 10:45</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          ) : null}
        </div>
      </div>
    </div>
  );
}
