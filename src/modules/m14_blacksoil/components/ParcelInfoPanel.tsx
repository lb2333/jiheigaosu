'use client';

import { BarChart3, Crosshair } from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import {
  EPOCH_LIST,
  type BlacksoilParcelDTO,
  type EpochKey,
  type EpochMetaItem,
} from '../types';

function MonitoringMiniSvg({ parcel }: { parcel: BlacksoilParcelDTO }) {
  const W = 236;
  const H = 68;
  const groupSpacing = 74;
  const baseX = 28;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 68, display: 'block' }}>
      <line
        x1={12}
        y1={48}
        x2={W - 10}
        y2={48}
        stroke="rgba(56,189,248,0.28)"
        strokeWidth={1}
      />
      <line
        x1={12}
        y1={24}
        x2={W - 10}
        y2={24}
        stroke="rgba(56,189,248,0.14)"
        strokeDasharray="3 3"
        strokeWidth={1}
      />
      {EPOCH_LIST.map((epoch, idx) => {
        const gx = baseX + idx * groupSpacing;
        const ndvi = parcel.ndviSeries[epoch] ?? 0.7;
        const moist = parcel.moistureSeries[epoch] ?? 26;
        const ndviH = Math.max(8, Math.round((ndvi - 0.5) * 95));
        const moistH = Math.max(8, Math.round((moist - 18) * 2.4));
        return (
          <g key={epoch}>
            <rect
              x={gx}
              y={48 - ndviH}
              width={11}
              height={ndviH}
              rx={2}
              fill="#38f2ff"
              fillOpacity={0.88}
            />
            <rect
              x={gx + 13}
              y={48 - moistH}
              width={11}
              height={moistH}
              rx={2}
              fill="#4ade80"
              fillOpacity={0.85}
            />
            <text x={gx + 12} y={61} textAnchor="middle" fill="#a9c6e8" fontSize={10}>
              {epoch}
            </text>
          </g>
        );
      })}
      <g transform="translate(12, 8)">
        <rect x={0} y={0} width={7} height={7} rx={1.5} fill="#38f2ff" />
        <text x={10} y={7} fill="#bae6fd" fontSize={9.5}>
          NDVI
        </text>
        <rect x={44} y={0} width={7} height={7} rx={1.5} fill="#4ade80" />
        <text x={54} y={7} fill="#bae6fd" fontSize={9.5}>
          土壤含水率
        </text>
      </g>
    </svg>
  );
}

export function ParcelInfoPanel({
  parcel,
  epochs,
  leftEpoch,
  rightEpoch,
  onFocusParcel,
  onOpenDetailModal,
}: {
  parcel: BlacksoilParcelDTO | null;
  epochs: Record<EpochKey, EpochMetaItem>;
  leftEpoch: EpochKey;
  rightEpoch: EpochKey;
  onFocusParcel: (parcelId: string) => void;
  onOpenDetailModal: () => void;
}) {
  if (!parcel) {
    return (
      <GlassPanel
        title="地块信息"
        headerRight={<span className="m14-demo-chip">演示地块</span>}
        className="m14-right-panel"
        bodyClassName="m14-right-body"
      >
        <div className="jihei-empty">暂无匹配黑土地保护地块数据</div>
      </GlassPanel>
    );
  }

  const leftInfo = epochs[leftEpoch];
  const rightInfo = epochs[rightEpoch];
  const leftNdvi = parcel.ndviSeries[leftEpoch] ?? 0.72;
  const rightNdvi = parcel.ndviSeries[rightEpoch] ?? 0.7;
  const leftMoist = parcel.moistureSeries[leftEpoch] ?? 26.5;
  const rightMoist = parcel.moistureSeries[rightEpoch] ?? 25.5;

  return (
    <GlassPanel
      title="地块信息"
      headerRight={<span className="m14-demo-chip">演示地块</span>}
      className="m14-right-panel"
      bodyClassName="m14-right-body"
    >
      <div className="m14-parcel-head">
        <span className="m14-parcel-title">地块 {parcel.id}</span>
        <span className="m14-selected-pill">当前选中</span>
      </div>

      <div className="m14-kv-list">
        <div className="m14-kv-row">
          <span className="m14-kv-k">所属范围</span>
          <span className="m14-kv-v">
            {parcel.scope} · {parcel.sectionName}
          </span>
        </div>
        <div className="m14-kv-row">
          <span className="m14-kv-k">位置桩号</span>
          <span className="m14-kv-v">{parcel.stake}</span>
        </div>
        <div className="m14-kv-row">
          <span className="m14-kv-k">地表类型</span>
          <span className="m14-kv-v">{parcel.landType}</span>
        </div>
        <div className="m14-kv-row">
          <span className="m14-kv-k">保护等级</span>
          <span className="m14-kv-v cyan">
            {parcel.grade}（{parcel.areaHa.toFixed(1)} 公顷）
          </span>
        </div>
        <div className="m14-kv-row">
          <span className="m14-kv-k">范围关系</span>
          <span className="m14-kv-v">{parcel.relation}</span>
        </div>
        <div className="m14-kv-row">
          <span className="m14-kv-k">剥离回填</span>
          <span className={`m14-kv-v ${parcel.topsoilCompliant ? 'ok' : 'warn'}`}>
            {parcel.complianceStatus} · {parcel.stripVol}
          </span>
        </div>
      </div>

      <div className="m14-metrics-box">
        <div className="m14-metrics-kpis">
          <div className="m14-metric-cell">
            <span>
              植被 NDVI ({leftEpoch}→{rightEpoch})
            </span>
            <strong>
              {leftNdvi.toFixed(2)} → {rightNdvi.toFixed(2)}
            </strong>
          </div>
          <div className="m14-metric-cell">
            <span>土壤含水率</span>
            <strong>
              {leftMoist.toFixed(1)}% → {rightMoist.toFixed(1)}%
            </strong>
          </div>
        </div>
        <MonitoringMiniSvg parcel={parcel} />
      </div>

      <div className="m14-epoch-summary">
        <div className="m14-epoch-summary-title">两期影像示意</div>
        <div className="m14-epoch-summary-row">
          <strong>{leftInfo.year}</strong>
          <span>{parcel.epochNotes[leftEpoch] || leftInfo.summary}</span>
        </div>
        <div className="m14-epoch-summary-row">
          <strong>{rightInfo.year}</strong>
          <span>{parcel.epochNotes[rightEpoch] || rightInfo.summary}</span>
        </div>
      </div>

      <div className="m14-panel-actions">
        <button
          type="button"
          className="m14-btn-primary"
          onClick={() => onFocusParcel(parcel.id)}
        >
          <Crosshair size={14} />
          <span>定位选中地块</span>
        </button>
        <button
          type="button"
          className="m14-btn-secondary"
          onClick={onOpenDetailModal}
        >
          <BarChart3 size={13} />
          <span>监测详情</span>
        </button>
      </div>
    </GlassPanel>
  );
}
