'use client';

import { useState, type ReactNode } from 'react';
import { X } from 'lucide-react';
import type { BlacksoilComplianceStatus } from '@/db/schema/domains/m14';
import {
  COMPLIANCE_STATUS_OPTIONS,
  EPOCH_LIST,
  type BlacksoilParcelDTO,
} from '../types';

function ModalShell({
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

export function PendingSpecModal({
  parcelCount,
  onClose,
}: {
  parcelCount: number;
  onClose: () => void;
}) {
  return (
    <ModalShell title="黑土地保护专项资料接入说明" onClose={onClose}>
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>已纳管演示地块</span>
          <strong>{parcelCount} 块（HT-01~06）</strong>
        </div>
        <div className="detail-stat-card">
          <span>多期遥感时相</span>
          <strong>2024 / 2025 / 2026</strong>
        </div>
        <div className="detail-stat-card">
          <span>专项接口状态</span>
          <strong style={{ color: '#fde047' }}>待接入实测数据</strong>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>专项资料类别</th>
            <th>当前状态</th>
            <th>演示替代说明</th>
            <th>拟接入来源</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>0.5m 高分卫星正射影像</td>
            <td>
              <span className="status-tag warn">演示渲染</span>
            </td>
            <td>按明水—北安段典型黑土条田特征合成三期影像</td>
            <td>省自然资源遥感中心 WMTS</td>
          </tr>
          <tr>
            <td>黑土地永久保护红线矢量</td>
            <td>
              <span className="status-tag info">标准矢量</span>
            </td>
            <td>已实现与施工范围走廊的相交及缓冲区空间叠加</td>
            <td>国土空间规划 GeoJSON</td>
          </tr>
          <tr>
            <td>表土剥离与复垦台账</td>
            <td>
              <span className="status-tag ok">结构就绪</span>
            </td>
            <td>支持分地块剥离方量、堆存合规性与 NDVI 趋势核验</td>
            <td>环保水保监测物联网平台</td>
          </tr>
        </tbody>
      </table>
    </ModalShell>
  );
}

export interface ParcelReviewPayload {
  complianceStatus: BlacksoilComplianceStatus;
  topsoilCompliant: boolean;
  topsoilThicknessCm: number;
  reviewNote: string;
}

export function ParcelDetailModal({
  parcel,
  submitting,
  errorMsg,
  onSubmitReview,
  onClose,
}: {
  parcel: BlacksoilParcelDTO;
  submitting: boolean;
  errorMsg: string | null;
  onSubmitReview: (parcelId: string, payload: ParcelReviewPayload) => Promise<void>;
  onClose: () => void;
}) {
  const [complianceStatus, setComplianceStatus] = useState<BlacksoilComplianceStatus>(
    parcel.complianceStatus
  );
  const [topsoilThicknessCm, setTopsoilThicknessCm] = useState<number>(
    parcel.topsoilThicknessCm
  );
  const [reviewNote, setReviewNote] = useState<string>(parcel.reviewNote || '');

  const latestNdvi = parcel.ndviSeries['2026'];

  return (
    <ModalShell
      title={`黑土地保护监测详情 · 地块 ${parcel.id}（${parcel.name}）`}
      onClose={onClose}
    >
      <div className="detail-grid">
        <div className="detail-stat-card">
          <span>保护面积 / 等级</span>
          <strong>{parcel.areaHa.toFixed(1)} 公顷</strong>
        </div>
        <div className="detail-stat-card">
          <span>2026 植被指数 NDVI</span>
          <strong>{latestNdvi.toFixed(2)}</strong>
        </div>
        <div className="detail-stat-card">
          <span>表土剥离回填状态</span>
          <strong style={{ color: parcel.topsoilCompliant ? '#4ade80' : '#fde047' }}>
            {parcel.complianceStatus}
          </strong>
        </div>
      </div>

      <table className="data-table">
        <thead>
          <tr>
            <th>监测年份</th>
            <th>植被指数 NDVI</th>
            <th>耕层土壤含水率</th>
            <th>遥感解译与保护措施核查</th>
          </tr>
        </thead>
        <tbody>
          {EPOCH_LIST.map((epoch) => (
            <tr key={epoch}>
              <td>
                <strong>{epoch} 年</strong>
              </td>
              <td>{parcel.ndviSeries[epoch].toFixed(2)}</td>
              <td>{parcel.moistureSeries[epoch].toFixed(1)}%</td>
              <td>{parcel.epochNotes[epoch]}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="detail-stat-card" style={{ background: 'rgba(12,42,92,0.45)', marginTop: 10 }}>
        <span>表土剥离与复垦方案</span>
        <div style={{ marginTop: 6, fontSize: '12.5px', color: '#e6f4ff', lineHeight: 1.6 }}>
          <div>
            <strong>剥离核验：</strong>
            {parcel.topsoilStatus}
          </div>
          <div>
            <strong>工程措施：</strong>
            {parcel.backfillPlan}
          </div>
          <div>
            <strong>所在工区与桩号：</strong>
            {parcel.sectionName}（{parcel.stake}）· {parcel.relation}
          </div>
        </div>
      </div>

      <div className="m14-review-card">
        <div className="m14-review-title">
          <span>表土剥离与合规核验登记</span>
          <span
            className={`status-tag ${parcel.topsoilCompliant ? 'ok' : 'warn'}`}
          >
            当前：{parcel.complianceStatus}
          </span>
        </div>

        <div className="m14-review-grid">
          <label className="m14-field">
            <span>合规判定状态</span>
            <select
              value={complianceStatus}
              onChange={(e) =>
                setComplianceStatus(e.target.value as BlacksoilComplianceStatus)
              }
            >
              {COMPLIANCE_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </label>

          <label className="m14-field">
            <span>表土剥离厚度（cm）</span>
            <input
              type="number"
              min={0}
              max={120}
              value={topsoilThicknessCm}
              onChange={(e) => setTopsoilThicknessCm(Number(e.target.value) || 0)}
            />
          </label>
        </div>

        <label className="m14-field">
          <span>现场核验与复核意见</span>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="填写表土剥离厚度、排水防渗或边坡覆土复核结论..."
          />
        </label>

        {errorMsg ? <div className="m14-review-error">{errorMsg}</div> : null}

        <div className="m14-review-actions">
          <div className="m14-review-meta">
            {parcel.reviewedBy
              ? `最近核验：${parcel.reviewedBy}（${parcel.reviewedAt}）`
              : '尚未完成最终复核签认'}
          </div>
          <button
            type="button"
            className="btn-primary-glow"
            disabled={submitting}
            onClick={() =>
              void onSubmitReview(parcel.id, {
                complianceStatus,
                topsoilCompliant: complianceStatus === '已达标',
                topsoilThicknessCm,
                reviewNote: reviewNote.trim(),
              })
            }
          >
            {submitting ? '提交保存中...' : '保存核验结论'}
          </button>
        </div>
      </div>
    </ModalShell>
  );
}
