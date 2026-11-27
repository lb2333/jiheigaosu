'use client';

interface BarItem {
  id: string;
  name: string;
  val: number;
}

export function SectionUnclosedBarChart({
  items,
  activeSectionId,
  onSelectSection,
}: {
  items: BarItem[];
  activeSectionId: string | null;
  onSelectSection: (secId: string) => void;
}) {
  const maxVal = Math.max(6, ...items.map((v) => v.val));
  const yTicks = 6;
  const W = 440;
  const H = 180;
  const padL = 34;
  const padR = 14;
  const padT = 18;
  const padB = 28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;
  const step = chartW / Math.max(1, items.length);
  const barW = 30;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: '168px', display: 'block' }}>
      <defs>
        <linearGradient id="m04-bar-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38f2ff" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
        <filter id="m04-bar-glow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="2.5" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {Array.from({ length: yTicks + 1 }, (_, i) => {
        const yVal = Math.round((maxVal / yTicks) * i);
        const y = padT + chartH - (i / yTicks) * chartH;
        return (
          <g key={i}>
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
              fill="#8ab4dc"
              fontSize="10.5"
              textAnchor="end"
            >
              {yVal}
            </text>
          </g>
        );
      })}

      <line
        x1={padL}
        y1={padT}
        x2={padL}
        y2={padT + chartH}
        stroke="rgba(56,189,248,0.28)"
        strokeWidth="1"
      />

      {items.map((item, idx) => {
        const cx = padL + step * idx + step / 2;
        const bh = maxVal > 0 ? (item.val / maxVal) * chartH : 0;
        const x = cx - barW / 2;
        const y = padT + chartH - bh;
        const isHighlight = !activeSectionId || activeSectionId === item.id;
        return (
          <g
            key={item.id}
            style={{ cursor: 'pointer', opacity: isHighlight ? 1 : 0.36 }}
            onClick={() => onSelectSection(item.id)}
          >
            {bh > 0 ? (
              <rect
                x={x}
                y={y}
                width={barW}
                height={bh}
                rx="3"
                fill="url(#m04-bar-grad)"
                filter="url(#m04-bar-glow)"
              />
            ) : (
              <line
                x1={x}
                y1={padT + chartH}
                x2={x + barW}
                y2={padT + chartH}
                stroke="#38bdf8"
                strokeWidth="2"
                opacity="0.5"
              />
            )}
            <text
              x={cx}
              y={Math.max(12, y - 5)}
              fill="#e2f0ff"
              fontSize="11.5"
              fontWeight="700"
              textAnchor="middle"
            >
              {item.val}
            </text>
            <text
              x={cx}
              y={H - 8}
              fill={activeSectionId === item.id ? '#38f2ff' : '#a9c6e8'}
              fontSize="11"
              fontWeight={activeSectionId === item.id ? '700' : '500'}
              textAnchor="middle"
            >
              {item.name}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export interface DonutSegment {
  label: string;
  value: number;
  color: string;
}

export function SafetyDonutChart({
  segments,
  total,
  centerSub,
  filterId,
}: {
  segments: DonutSegment[];
  total: number;
  centerSub: string;
  filterId: string;
}) {
  const size = 148;
  const cx = 74;
  const cy = 74;
  const r = 52;
  const C = 2 * Math.PI * r;
  const nonZeroCount = segments.filter((s) => s.value > 0).length;

  const arcs = segments.reduce<{ offset: number; nodes: React.ReactNode[] }>(
    (acc, seg) => {
      const pct = total > 0 ? seg.value / total : 0;
      const len = pct * C;
      const gap = total > 0 && seg.value > 0 && nonZeroCount > 1 ? 2.5 : 0;
      const dashLen = Math.max(0, len - gap);
      acc.nodes.push(
        <circle
          key={seg.label}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke={seg.color}
          strokeWidth="16"
          strokeLinecap="butt"
          strokeDasharray={`${dashLen.toFixed(2)} ${(C - dashLen).toFixed(2)}`}
          strokeDashoffset={(-acc.offset).toFixed(2)}
          transform={`rotate(-90 ${cx} ${cy})`}
          style={{ transition: 'stroke-dasharray 0.4s ease' }}
        />
      );
      acc.offset += len;
      return acc;
    },
    { offset: 0, nodes: [] }
  ).nodes;

  return (
    <div className="m04-donut-wrap">
      <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '136px', height: '136px', flexShrink: 0 }}>
        <defs>
          <filter id={filterId}>
            <feDropShadow dx="0" dy="0" stdDeviation="2.5" floodColor="#22d3ee" floodOpacity="0.35" />
          </filter>
        </defs>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(14,48,98,0.72)" strokeWidth="16" />
        <g filter={`url(#${filterId})`}>{arcs}</g>
        <text x={cx} y={cy - 2} textAnchor="middle" fill="#ffffff" fontSize="22" fontWeight="800">
          {total}
          <tspan fontSize="12" fontWeight="500" fill="#cbd5e1">
            项
          </tspan>
        </text>
        <text x={cx} y={cy + 18} textAnchor="middle" fill="#93c5fd" fontSize="11">
          {centerSub}
        </text>
      </svg>

      <div className="m04-legend-list">
        {segments.map((seg) => {
          const pct = total > 0 ? ((seg.value / total) * 100).toFixed(1) : '0.0';
          return (
            <div key={seg.label} className="m04-legend-row">
              <div className="m04-legend-left">
                <span className="m04-legend-dot" style={{ background: seg.color }} />
                <span>{seg.label}</span>
              </div>
              <div className="m04-legend-right">
                <span className="m04-legend-num">{seg.value}</span>
                <span className="m04-legend-pct">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
