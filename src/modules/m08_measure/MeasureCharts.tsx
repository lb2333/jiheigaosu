'use client';

import type { PhysicalCompareItem } from './types';

export function fmtMoney(n: number): string {
  return Number(n).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function fmtChartNum(n: number): string {
  const val = Number(n);
  if (Math.abs(val - Math.round(val)) < 0.05) {
    return Math.round(val).toLocaleString('en-US');
  }
  return val.toLocaleString('en-US', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  });
}

export function fmtInt(n: number): string {
  return Math.round(n).toLocaleString('en-US');
}

export interface VerticalBarItem {
  key: string;
  label: string;
  value: number;
}

export function VerticalBarChartSvg({
  idPrefix,
  items,
  maxY,
  ticks,
  activeKey,
  onBarClick,
  gradientMode = 'blue',
}: {
  idPrefix: string;
  items: VerticalBarItem[];
  maxY: number;
  ticks: Array<{ val: number; label: string }>;
  activeKey: string | null;
  onBarClick: (key: string) => void;
  gradientMode?: 'blue' | 'teal';
}) {
  const W = 480;
  const H = 172;
  const padL = 48;
  const padR = 14;
  const padT = 22;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const step = plotW / Math.max(1, items.length);
  const barW = Math.min(34, step * 0.48);

  const yFor = (val: number) => {
    const ratio = Math.max(0, Math.min(1, val / Math.max(0.01, maxY)));
    return padT + plotH * (1 - ratio);
  };

  const gradColors =
    gradientMode === 'teal'
      ? ['#2dd4bf', '#06b6d4', '#0e7490']
      : ['#38f2ff', '#0ea5e9', '#1d4ed8'];

  return (
    <svg
      className="m08-chart-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id={`m08-bar-${idPrefix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradColors[0]} />
          <stop offset="55%" stopColor={gradColors[1]} />
          <stop offset="100%" stopColor={gradColors[2]} stopOpacity="0.9" />
        </linearGradient>
        <linearGradient id={`m08-bar-hi-${idPrefix}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fde047" />
          <stop offset="55%" stopColor="#38f2ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = Number(yFor(t.val).toFixed(1));
        return (
          <g key={t.val}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(56,189,248,0.14)"
              strokeWidth="1"
            />
            <text
              x={padL - 8}
              y={y + 4}
              textAnchor="end"
              fill="#89aed6"
              fontSize="10.5"
            >
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
        const isActive = !activeKey || item.key === activeKey;
        const opacity = isActive ? 1 : 0.36;
        const fillUrl =
          activeKey && item.key === activeKey
            ? `url(#m08-bar-hi-${idPrefix})`
            : `url(#m08-bar-${idPrefix})`;

        return (
          <g
            key={item.key}
            className="m08-bar-col"
            opacity={opacity}
            onClick={() => onBarClick(item.key)}
          >
            {h > 0 ? (
              <rect
                x={x.toFixed(1)}
                y={y.toFixed(1)}
                width={barW.toFixed(1)}
                height={h.toFixed(1)}
                rx="3"
                fill={fillUrl}
              />
            ) : null}
            <text
              x={cx.toFixed(1)}
              y={(y - 6).toFixed(1)}
              textAnchor="middle"
              fill="#f1f7ff"
              fontSize="11"
              fontWeight="700"
            >
              {fmtChartNum(item.value)}
            </text>
            <text
              x={cx.toFixed(1)}
              y={H - 7}
              textAnchor="middle"
              fill={isActive ? '#cfe4ff' : '#6c8eb5'}
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
  count: number;
  color: string;
}

export function StatusDonutChart({
  segments,
  totalCount,
  activeStatus,
  onSelectStatus,
}: {
  segments: DonutSegment[];
  totalCount: number;
  activeStatus: string;
  onSelectStatus: (statusName: string) => void;
}) {
  const total = Math.max(
    1,
    segments.reduce((s, x) => s + x.count, 0)
  );
  const R = 52;
  const C = 2 * Math.PI * R;
  const activeSegCount = segments.filter((s) => s.count > 0).length;

  let runningOffset = 0;
  const arcs = segments.map((seg) => {
    const startOffset = runningOffset;
    const len = (seg.count / total) * C;
    runningOffset += len;
    const gap = activeSegCount > 1 && len > 4 ? 2.5 : 0;
    const drawLen = Math.max(0, len - gap);
    return { ...seg, startOffset, drawLen };
  });

  return (
    <div className="m08-donut-wrap">
      <svg className="m08-donut-svg" viewBox="0 0 150 150">
        <circle
          cx="75"
          cy="75"
          r={R}
          fill="none"
          stroke="rgba(148,197,255,0.12)"
          strokeWidth="15"
        />
        {arcs.map((seg) => {
          if (seg.count <= 0) return null;
          const op = !activeStatus || activeStatus === seg.name ? 1 : 0.35;
          return (
            <circle
              key={seg.name}
              cx="75"
              cy="75"
              r={R}
              fill="none"
              stroke={seg.color}
              strokeWidth="15"
              opacity={op}
              strokeDasharray={`${seg.drawLen.toFixed(2)} ${(C - seg.drawLen).toFixed(2)}`}
              strokeDashoffset={(-seg.startOffset).toFixed(2)}
              transform="rotate(-90 75 75)"
              style={{ cursor: 'pointer' }}
              onClick={() => onSelectStatus(seg.name)}
            />
          );
        })}
        <text
          x="75"
          y="72"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="21"
          fontWeight="800"
          pointerEvents="none"
        >
          {fmtInt(totalCount)}
          <tspan fontSize="11.5" fontWeight="500" dx="2">
            条
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
          计量记录
        </text>
      </svg>

      <div className="m08-legend-list">
        {segments.map((seg) => {
          const pct =
            totalCount > 0 ? ((seg.count / totalCount) * 100).toFixed(1) : '0.0';
          return (
            <div
              key={seg.name}
              className={`m08-legend-row ${activeStatus === seg.name ? 'active' : ''}`}
              onClick={() => onSelectStatus(seg.name)}
            >
              <span className="m08-legend-left">
                <span
                  className="m08-legend-dot"
                  style={{
                    background: seg.color,
                    boxShadow: `0 0 6px ${seg.color}`,
                  }}
                />
                <span>{seg.name}</span>
              </span>
              <span className="m08-legend-right">
                <span className="m08-legend-count">{fmtInt(seg.count)}</span>
                <span className="m08-legend-pct">{pct}%</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function PairedHorizontalBarSvg({
  items,
  selectedItem,
  onPickItem,
}: {
  items: PhysicalCompareItem[];
  selectedItem: string;
  onPickItem: (workItem: string) => void;
}) {
  const W = 720;
  const H = 225;
  const padL = 88;
  const padR = 54;
  const padT = 10;
  const padB = 26;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const rowStep = plotH / Math.max(1, items.length);
  const ticks = [0, 25, 50, 75, 100];

  return (
    <svg
      className="m08-pair-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="xMidYMid meet"
    >
      <defs>
        <linearGradient id="m08-hbar-blue" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="100%" stopColor="#38f2ff" />
        </linearGradient>
        <linearGradient id="m08-hbar-green" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#4ade80" />
        </linearGradient>
      </defs>

      {ticks.map((pct) => {
        const x = Number((padL + (plotW * pct) / 100).toFixed(1));
        return (
          <g key={pct}>
            <line
              x1={x}
              y1={padT}
              x2={x}
              y2={padT + plotH}
              stroke="rgba(56,189,248,0.16)"
              strokeWidth="1"
            />
            <text
              x={x}
              y={H - 6}
              textAnchor="middle"
              fill="#89aed6"
              fontSize="11"
            >
              {pct}%
            </text>
          </g>
        );
      })}

      {items.map((it, idx) => {
        const cy = padT + rowStep * (idx + 0.5);
        const w1 = Math.max(4, Math.min(plotW, (it.measuredPct / 100) * plotW));
        const w2 = Math.max(4, Math.min(plotW, (it.physicalPct / 100) * plotW));
        const isSelected = selectedItem === it.workItem;
        const op = !selectedItem || isSelected ? 1 : 0.45;

        return (
          <g
            key={it.workItem}
            className="m08-pair-row"
            opacity={op}
            onClick={() => onPickItem(it.workItem)}
          >
            {isSelected ? (
              <rect
                x="2"
                y={(cy - rowStep * 0.46).toFixed(1)}
                width={W - 4}
                height={(rowStep * 0.92).toFixed(1)}
                rx="6"
                fill="rgba(56,189,248,0.08)"
                stroke="rgba(56,220,255,0.28)"
                strokeWidth="1"
              />
            ) : null}
            <text
              x={padL - 10}
              y={(cy + 4).toFixed(1)}
              textAnchor="end"
              fill={isSelected ? '#ffffff' : '#cfe4ff'}
              fontSize="12"
              fontWeight={isSelected ? '700' : '500'}
            >
              {it.workItem}
            </text>
            <rect
              x={padL}
              y={(cy - 10).toFixed(1)}
              width={plotW}
              height="7"
              rx="3.5"
              fill="rgba(14,48,98,0.6)"
            />
            <rect
              x={padL}
              y={(cy - 10).toFixed(1)}
              width={w1.toFixed(1)}
              height="7"
              rx="3.5"
              fill="url(#m08-hbar-blue)"
            />
            <text
              x={(padL + w1 + 7).toFixed(1)}
              y={(cy - 3.5).toFixed(1)}
              fill="#38bdf8"
              fontSize="10.5"
              fontWeight="700"
            >
              {it.measuredPct.toFixed(1)}%
            </text>
            <rect
              x={padL}
              y={(cy + 3).toFixed(1)}
              width={plotW}
              height="7"
              rx="3.5"
              fill="rgba(14,48,98,0.6)"
            />
            <rect
              x={padL}
              y={(cy + 3).toFixed(1)}
              width={w2.toFixed(1)}
              height="7"
              rx="3.5"
              fill="url(#m08-hbar-green)"
            />
            <text
              x={(padL + w2 + 7).toFixed(1)}
              y={(cy + 9.5).toFixed(1)}
              fill="#4ade80"
              fontSize="10.5"
              fontWeight="700"
            >
              {it.physicalPct.toFixed(1)}%
            </text>
          </g>
        );
      })}
    </svg>
  );
}
