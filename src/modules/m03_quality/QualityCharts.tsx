'use client';

import React from 'react';

export interface BarChartItem {
  secId?: string;
  label: string;
  value: number;
}

export interface ChartTick {
  val: number;
  label: string;
}

export function BarChartSvg({
  idPrefix,
  items,
  minY,
  maxY,
  ticks,
  valueFormatter,
  activeSecId,
  onBarClick,
}: {
  idPrefix: string;
  items: BarChartItem[];
  minY: number;
  maxY: number;
  ticks: ChartTick[];
  valueFormatter: (v: number) => string;
  activeSecId?: string | null;
  onBarClick?: (secId: string) => void;
}) {
  const W = 440;
  const H = 170;
  const padL = 42;
  const padR = 12;
  const padT = 20;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const step = plotW / Math.max(1, items.length);
  const barW = Math.min(34, step * 0.52);

  const yFor = (val: number) => {
    const ratio = Math.max(0, Math.min(1, (val - minY) / Math.max(0.0001, maxY - minY)));
    return padT + plotH * (1 - ratio);
  };

  return (
    <svg className="m03-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`m03-bar-grad-${idPrefix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38f2ff" />
          <stop offset="55%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.88" />
        </linearGradient>
        <linearGradient id={`m03-bar-active-${idPrefix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#38f2ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = yFor(t.val);
        return (
          <g key={t.label}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(56,189,248,0.14)"
              strokeWidth="1"
            />
            <text x={padL - 7} y={y + 4} textAnchor="end" fill="#89aed6" fontSize="10.5">
              {t.label}
            </text>
          </g>
        );
      })}

      {items.map((item, idx) => {
        const cx = padL + step * (idx + 0.5);
        const x = cx - barW / 2;
        const rawY = yFor(item.value);
        const h = item.value > 0 ? Math.max(4, padT + plotH - rawY) : 0;
        const y = padT + plotH - h;
        const isHighlighted = !activeSecId || item.secId === activeSecId;
        const opacity = isHighlighted ? 1 : 0.35;
        const fillId =
          activeSecId && item.secId === activeSecId
            ? `url(#m03-bar-active-${idPrefix})`
            : `url(#m03-bar-grad-${idPrefix})`;

        return (
          <g
            key={`${item.label}-${idx}`}
            className="m03-bar-col"
            opacity={opacity}
            onClick={() => {
              if (item.secId && onBarClick) onBarClick(item.secId);
            }}
          >
            {h > 0 ? (
              <rect x={x} y={y} width={barW} height={h} rx="3" fill={fillId} />
            ) : null}
            <text
              x={cx}
              y={y - 5}
              textAnchor="middle"
              fill="#f1f7ff"
              fontSize="11"
              fontWeight="700"
            >
              {valueFormatter(item.value)}
            </text>
            <text
              x={cx}
              y={H - 7}
              textAnchor="middle"
              fill={isHighlighted ? '#cfe4ff' : '#6c8eb5'}
              fontSize="11"
            >
              {item.label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export interface DonutSegment {
  name: string;
  filterVal?: string;
  color: string;
  count: number;
}

export function DonutChartSvg({
  segments,
  centerVal,
  centerUnit,
  centerSub,
  onSegmentClick,
}: {
  segments: DonutSegment[];
  centerVal: string;
  centerUnit: string;
  centerSub: string;
  onSegmentClick?: (filterVal: string) => void;
}) {
  const total = Math.max(
    1,
    segments.reduce((s, item) => s + item.count, 0)
  );
  const R = 54;
  const C = 2 * Math.PI * R;

  const arcMeta = segments.reduce<Array<{ seg: DonutSegment; drawLen: number; offset: number }>>(
    (acc, seg) => {
      const prevOffset = acc.length > 0 ? acc[acc.length - 1].offset + (acc[acc.length - 1].seg.count / total) * C : 0;
      const len = (seg.count / total) * C;
      const gap = segments.length > 1 && len > 4 ? 3 : 0;
      const drawLen = Math.max(0, len - gap);
      acc.push({ seg, drawLen, offset: prevOffset });
      return acc;
    },
    []
  );

  return (
    <div className="m03-donut-wrap">
      <svg className="m03-donut-svg" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke="rgba(148,197,255,0.12)"
          strokeWidth="15"
        />
        {arcMeta.map(({ seg, drawLen, offset }) => (
          <circle
            key={seg.name}
            cx="75"
            cy="75"
            r={R}
            fill="none"
            stroke={seg.color}
            strokeWidth="15"
            strokeDasharray={`${drawLen.toFixed(2)} ${(C - drawLen).toFixed(2)}`}
            strokeDashoffset={(-offset).toFixed(2)}
            transform="rotate(-90 75 75)"
            style={{ cursor: onSegmentClick ? 'pointer' : 'default' }}
            onClick={() => onSegmentClick?.(seg.filterVal || seg.name)}
          />
        ))}
        <text
          x="75"
          y="73"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="20"
          fontWeight="800"
          pointerEvents="none"
        >
          {centerVal}
          <tspan fontSize="11.5" fontWeight="500" dx="2">
            {centerUnit}
          </tspan>
        </text>
        <text
          x="75"
          y="92"
          textAnchor="middle"
          fill="#a9c6e8"
          fontSize="11"
          pointerEvents="none"
        >
          {centerSub}
        </text>
      </svg>

      <div className="m03-legend-list">
        {segments.map((seg) => {
          const pct = ((seg.count / total) * 100).toFixed(1);
          return (
            <div
              key={seg.name}
              className="m03-legend-row"
              onClick={() => onSegmentClick?.(seg.filterVal || seg.name)}
            >
              <span
                className="m03-legend-dot"
                style={{ background: seg.color, boxShadow: `0 0 6px ${seg.color}` }}
              />
              <span className="m03-legend-name">{seg.name}</span>
              <span className="m03-legend-count">{seg.count.toLocaleString('en-US')}</span>
              <span className="m03-legend-pct">{pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export interface RingRow {
  label: string;
  value: string;
  dotColor?: string;
  valColor?: string;
}

export function RingGaugeSvg({
  idPrefix,
  pct,
  subLabel,
  rows,
}: {
  idPrefix: string;
  pct: number;
  subLabel: string;
  rows: RingRow[];
}) {
  const R = 52;
  const C = 2 * Math.PI * R;
  const clamped = Math.max(0, Math.min(100, pct));
  const fillLen = (clamped / 100) * C;

  return (
    <div className="m03-donut-wrap">
      <svg className="m03-donut-svg" viewBox="0 0 150 150">
        <defs>
          <linearGradient id={`m03-ring-${idPrefix}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#22d3ee" />
            <stop offset="55%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#34d399" />
          </linearGradient>
        </defs>
        <circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke="rgba(56,189,248,0.16)"
          strokeWidth="12"
        />
        <circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke={`url(#m03-ring-${idPrefix})`}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${fillLen.toFixed(2)} ${(C - fillLen).toFixed(2)}`}
          transform="rotate(-90 75 75)"
        />
        <text
          x="75"
          y="72"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="21"
          fontWeight="800"
          pointerEvents="none"
        >
          {clamped.toFixed(1)}%
        </text>
        <text
          x="75"
          y="92"
          textAnchor="middle"
          fill="#a9c6e8"
          fontSize="11"
          pointerEvents="none"
        >
          {subLabel}
        </text>
      </svg>

      <div className="m03-ring-rows">
        {rows.map((r) => (
          <div key={r.label} className="m03-ring-row">
            <span className="m03-ring-key">
              {r.dotColor ? (
                <span
                  className="m03-legend-dot"
                  style={{ background: r.dotColor, boxShadow: `0 0 6px ${r.dotColor}` }}
                />
              ) : null}
              <span>{r.label}</span>
            </span>
            <span className="m03-ring-val" style={{ color: r.valColor || '#ffffff' }}>
              {r.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TrendLineSvg({
  idPrefix,
  points,
  minY,
  maxY,
  ticks,
}: {
  idPrefix: string;
  points: Array<{ label: string; value: number }>;
  minY: number;
  maxY: number;
  ticks: ChartTick[];
}) {
  const W = 440;
  const H = 170;
  const padL = 44;
  const padR = 22;
  const padT = 22;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const xFor = (idx: number) => padL + (plotW * idx) / Math.max(1, points.length - 1);
  const yFor = (val: number) => {
    const ratio = Math.max(0, Math.min(1, (val - minY) / Math.max(0.0001, maxY - minY)));
    return padT + plotH * (1 - ratio);
  };

  const coords = points.map((p, idx) => ({
    x: xFor(idx),
    y: yFor(p.value),
    label: p.label,
    value: p.value,
  }));
  const polyPts = coords.map((c) => `${c.x.toFixed(1)},${c.y.toFixed(1)}`).join(' ');
  const areaPts = coords.length
    ? `${coords[0].x.toFixed(1)},${padT + plotH} ${polyPts} ${coords[coords.length - 1].x.toFixed(
        1
      )},${padT + plotH}`
    : '';

  return (
    <svg className="m03-chart-svg" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id={`m03-area-${idPrefix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38f2ff" stopOpacity="0.34" />
          <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.02" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = yFor(t.val);
        return (
          <g key={t.label}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(56,189,248,0.14)"
              strokeWidth="1"
            />
            <text x={padL - 7} y={y + 4} textAnchor="end" fill="#89aed6" fontSize="10.5">
              {t.label}
            </text>
          </g>
        );
      })}

      {areaPts ? <polygon points={areaPts} fill={`url(#m03-area-${idPrefix})`} /> : null}
      {polyPts ? (
        <polyline
          points={polyPts}
          fill="none"
          stroke="#38f2ff"
          strokeWidth="2.4"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
      ) : null}

      {coords.map((c) => (
        <g key={c.label}>
          <circle cx={c.x} cy={c.y} r="4" fill="#38f2ff" stroke="#ffffff" strokeWidth="1.6" />
          <text
            x={c.x}
            y={c.y - 9}
            textAnchor="middle"
            fill="#ffffff"
            fontSize="10.5"
            fontWeight="700"
          >
            {c.value.toFixed(1)}%
          </text>
          <text x={c.x} y={H - 7} textAnchor="middle" fill="#a9c6e8" fontSize="11">
            {c.label}
          </text>
        </g>
      ))}
    </svg>
  );
}
