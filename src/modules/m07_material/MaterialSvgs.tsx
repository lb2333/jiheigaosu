'use client';

import type { MaterialYardDTO } from './types';

export interface SectionBarStat {
  sectionId: string;
  sectionName: string;
  planW: number;
  arrivalW: number;
}

export interface DonutSegment {
  name: string;
  value: number;
  color: string;
  pct: string;
}

export function SectionBarChartSvg({
  data,
  activeSectionId,
  onSelectSection,
}: {
  data: SectionBarStat[];
  activeSectionId: string | null;
  onSelectSection: (sectionId: string) => void;
}) {
  const W = 500;
  const H = 178;
  const padL = 36;
  const padR = 14;
  const padT = 22;
  const padB = 28;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;
  const maxVal = 2.6;
  const ticks = [0, 0.5, 1.0, 1.5, 2.0, 2.5];
  const groupW = data.length > 0 ? plotW / data.length : plotW;
  const barW = 19;
  const barGap = 4;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} width="100%" height="156" preserveAspectRatio="xMidYMid meet">
      <defs>
        <linearGradient id="m07BarPlan" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5a9cff" />
          <stop offset="100%" stopColor="#2c63d6" />
        </linearGradient>
        <linearGradient id="m07BarArr" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38f2ff" />
          <stop offset="100%" stopColor="#0ea5e9" />
        </linearGradient>
      </defs>

      {ticks.map((t) => {
        const y = padT + plotH - (t / maxVal) * plotH;
        return (
          <g key={t}>
            <line
              x1={padL}
              y1={y}
              x2={W - padR}
              y2={y}
              stroke="rgba(148,186,232,0.16)"
              strokeDasharray={t === 0 ? '0' : '3 3'}
            />
            <text
              x={padL - 7}
              y={y + 4}
              fill="#8db4de"
              fontSize="10.5"
              textAnchor="end"
            >
              {t === 0 ? '0' : t.toFixed(1)}
            </text>
          </g>
        );
      })}

      {data.map((d, i) => {
        const cx = padL + i * groupW + groupW / 2;
        const x1 = cx - barW - barGap / 2;
        const x2 = cx + barGap / 2;
        const h1 = Math.max(2, (d.planW / maxVal) * plotH);
        const h2 = Math.max(2, (d.arrivalW / maxVal) * plotH);
        const y1 = padT + plotH - h1;
        const y2 = padT + plotH - h2;
        const isSelected = activeSectionId === d.sectionId;
        const dim = activeSectionId && !isSelected ? 0.35 : 1;

        return (
          <g
            key={d.sectionId}
            onClick={() => onSelectSection(d.sectionId)}
            style={{ cursor: 'pointer', opacity: dim, transition: 'opacity 0.2s' }}
          >
            {isSelected ? (
              <rect
                x={cx - 28}
                y={padT - 8}
                width={56}
                height={plotH + 30}
                rx={6}
                fill="rgba(56,220,255,0.1)"
                stroke="rgba(56,220,255,0.45)"
              />
            ) : null}
            <rect x={x1} y={y1} width={barW} height={h1} rx={2.5} fill="url(#m07BarPlan)" />
            <text
              x={x1 + barW / 2}
              y={y1 - 5}
              fill="#cfe6ff"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
            >
              {d.planW.toFixed(2)}
            </text>
            <rect x={x2} y={y2} width={barW} height={h2} rx={2.5} fill="url(#m07BarArr)" />
            <text
              x={x2 + barW / 2}
              y={y2 - 5}
              fill="#67e8f9"
              fontSize="10"
              fontWeight="600"
              textAnchor="middle"
            >
              {d.arrivalW.toFixed(2)}
            </text>
            <text
              x={cx}
              y={H - 9}
              fill={isSelected ? '#38f2ff' : '#bdd8f7'}
              fontSize="11"
              fontWeight={isSelected ? '700' : '500'}
              textAnchor="middle"
            >
              {d.sectionName}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export function MaterialDonutSvg({
  segments,
  centerTop,
  centerUnit,
  centerSub,
}: {
  segments: DonutSegment[];
  centerTop: string;
  centerUnit: string;
  centerSub: string;
}) {
  const size = 148;
  const cx = size / 2;
  const cy = size / 2;
  const r = 54;
  const strokeW = 16;
  const circ = 2 * Math.PI * r;
  const total = segments.reduce((a, s) => a + s.value, 0) || 1;
  const activeCount = segments.filter((s) => s.value > 0).length;

  let accLen = 0;
  const arcs = segments.map((seg) => {
    const frac = seg.value / total;
    const len = Math.max(0, frac * circ - (activeCount > 1 ? 2 : 0));
    const offset = -accLen;
    accLen += frac * circ;
    if (seg.value <= 0) return null;
    return (
      <circle
        key={seg.name}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeW}
        strokeDasharray={`${len.toFixed(2)} ${(circ - len).toFixed(2)}`}
        strokeDashoffset={offset.toFixed(2)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
    );
  });

  return (
    <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size}>
      <circle cx={cx} cy={cy} r={r} fill="none" stroke="rgba(18,52,108,0.65)" strokeWidth={strokeW} />
      {arcs}
      <text x={cx} y={cy - 3} textAnchor="middle" fill="#ffffff" fontSize="19" fontWeight="800">
        {centerTop}
        <tspan fontSize="11" fontWeight="600" fill="#a8d1f7">
          {' '}
          {centerUnit}
        </tspan>
      </text>
      <text x={cx} y={cy + 16} textAnchor="middle" fill="#9bc0e6" fontSize="11">
        {centerSub}
      </text>
    </svg>
  );
}

export function SvgYardAerial({ yard }: { yard: Pick<MaterialYardDTO, 'sectionName' | 'stake'> }) {
  return (
    <svg viewBox="0 0 420 240" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="m07FieldBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#8b7d5b" />
          <stop offset="100%" stopColor="#695e44" />
        </linearGradient>
        <linearGradient id="m07ShedRoof" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#2563eb" />
          <stop offset="100%" stopColor="#1d4ed8" />
        </linearGradient>
        <linearGradient id="m07YardConcrete" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#b8b5ad" />
          <stop offset="100%" stopColor="#96938b" />
        </linearGradient>
      </defs>
      <rect width="420" height="240" fill="url(#m07FieldBg)" />
      <rect x="0" y="0" width="52" height="240" fill="#5e683e" />
      <rect x="368" y="0" width="52" height="240" fill="#7c6d48" />
      <path d="M52 10 L368 10 L368 232 L52 232 Z" fill="url(#m07YardConcrete)" stroke="#6c6960" strokeWidth="2" />
      <path d="M62 12 L62 228 M352 12 L352 228 M62 118 L352 118" stroke="#d4d2cb" strokeWidth="14" opacity="0.65" />
      <g>
        <rect x="92" y="18" width="66" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="125" y1="18" x2="125" y2="104" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
        <rect x="172" y="18" width="68" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="206" y1="18" x2="206" y2="104" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
        <rect x="254" y="18" width="68" height="86" rx="4" fill="url(#m07ShedRoof)" stroke="#93c5fd" strokeWidth="1.2" />
        <line x1="288" y1="18" x2="288" y2="104" stroke="#60a5fa" strokeWidth="1.5" opacity="0.7" />
      </g>
      <g>
        <circle cx="98" cy="148" r="10" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
        <circle cx="118" cy="148" r="10" fill="#cbd5e1" stroke="#475569" strokeWidth="1.5" />
        <rect x="86" y="166" width="46" height="32" rx="2" fill="#3b82f6" stroke="#93c5fd" strokeWidth="1" />
      </g>
      <g>
        <path d="M150 202 Q196 116 244 202 Z" fill="#8b9198" stroke="#64748b" strokeWidth="1.2" />
        <path d="M174 202 Q204 134 234 202 Z" fill="#a1a8b0" opacity="0.8" />
        <path d="M256 202 Q296 138 338 202 Z" fill="#c7b28e" stroke="#9a8560" strokeWidth="1.2" />
        <path d="M276 202 Q302 152 326 202 Z" fill="#d6c4a4" opacity="0.85" />
      </g>
      <g>
        <rect x="192" y="204" width="18" height="9" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="1" />
        <rect x="296" y="205" width="16" height="8" rx="2" fill="#eab308" stroke="#713f12" strokeWidth="1" />
      </g>
      <rect x="52" y="10" width="316" height="222" fill="none" stroke="rgba(56,242,255,0.45)" strokeWidth="1.5" strokeDasharray="6 4" />
      <g fill="#b48a2c" opacity="0.85">
        <circle cx="382" cy="48" r="14" />
        <circle cx="395" cy="76" r="16" />
        <circle cx="384" cy="108" r="13" />
        <circle cx="34" cy="64" r="13" />
        <circle cx="28" cy="126" r="15" />
        <circle cx="36" cy="178" r="14" />
      </g>
      <text x="358" y="226" fill="rgba(255,255,255,0.75)" fontSize="9" textAnchor="end">
        {yard.sectionName} · {yard.stake}
      </text>
    </svg>
  );
}

export function SvgGateCamera({ timeLabel }: { timeLabel?: string }) {
  return (
    <svg viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="m07Sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8ab8e6" />
          <stop offset="100%" stopColor="#cfe4f7" />
        </linearGradient>
        <linearGradient id="m07Road" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#b4b7bc" />
          <stop offset="100%" stopColor="#d5d7db" />
        </linearGradient>
      </defs>
      <rect width="420" height="84" fill="url(#m07Sky)" />
      <path d="M0 78 Q40 54 90 74 Q140 52 210 72 L210 92 L0 92 Z" fill="#8d7843" />
      <rect x="242" y="24" width="178" height="74" fill="#334155" />
      <polygon points="242,24 335,14 420,24" fill="#1d4ed8" />
      <rect x="0" y="84" width="420" height="176" fill="#c8c6be" />
      <path d="M18 112 Q88 52 162 112 Z" fill="#8b949e" stroke="#64748b" />
      <path d="M128 112 Q186 64 246 112 Z" fill="#9aa2ab" />
      <path d="M318 114 Q366 78 416 114 Z" fill="#bfa882" />
      <g transform="translate(226,74)">
        <rect x="10" y="14" width="30" height="16" rx="3" fill="#eab308" stroke="#78350f" />
        <rect x="18" y="4" width="16" height="11" rx="2" fill="#1e293b" />
        <circle cx="16" cy="31" r="6" fill="#1f2937" />
        <circle cx="34" cy="31" r="6" fill="#1f2937" />
        <path d="M10 22 L0 26 L4 32 L12 28" fill="#ca8a04" />
      </g>
      <polygon points="154,112 266,112 356,260 66,260" fill="url(#m07Road)" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1="210" y1="112" x2="210" y2="260" stroke="#e2e8f0" strokeWidth="2" strokeDasharray="8 6" />
      <g>
        <polygon points="12,118 96,118 112,130 2,130" fill="#1d4ed8" />
        <rect x="12" y="130" width="84" height="66" fill="#f1f5f9" stroke="#64748b" />
        <rect x="22" y="140" width="32" height="24" fill="#334155" stroke="#94a3b8" />
        <rect x="64" y="140" width="24" height="44" fill="#475569" />
      </g>
      <rect x="314" y="132" width="106" height="46" fill="none" stroke="#2563eb" strokeWidth="2.5" />
      <line x1="334" y1="132" x2="334" y2="178" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="354" y1="132" x2="354" y2="178" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="374" y1="132" x2="374" y2="178" stroke="#2563eb" strokeWidth="1.5" />
      <line x1="394" y1="132" x2="394" y2="178" stroke="#2563eb" strokeWidth="1.5" />
      <rect x="124" y="148" width="14" height="42" rx="2" fill="#facc15" stroke="#854d0e" />
      <rect x="284" y="148" width="14" height="42" rx="2" fill="#facc15" stroke="#854d0e" />
      <line x1="138" y1="162" x2="284" y2="162" stroke="#f8fafc" strokeWidth="5" />
      <line x1="138" y1="162" x2="284" y2="162" stroke="#ef4444" strokeWidth="5" strokeDasharray="14 14" />
      {timeLabel ? (
        <g>
          <rect x="8" y="232" width="128" height="20" rx="4" fill="rgba(5,18,42,0.82)" stroke="rgba(56,189,248,0.45)" />
          <text x="15" y="245" fill="#e6f4ff" fontSize="10.5" fontWeight="600">
            {timeLabel}
          </text>
        </g>
      ) : null}
    </svg>
  );
}

export function SvgUavInspection({ timeLabel }: { timeLabel?: string }) {
  return (
    <svg viewBox="0 0 420 260" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="m07UavSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#87b6e3" />
          <stop offset="100%" stopColor="#d4e6f7" />
        </linearGradient>
      </defs>
      <rect width="420" height="48" fill="url(#m07UavSky)" />
      <rect x="0" y="42" width="420" height="28" fill="#8b7b4b" />
      <rect x="0" y="64" width="420" height="196" fill="#c6c4bd" />
      <polygon points="184,64 218,64 334,260 112,260" fill="#d8d6cf" />
      <line x1="184" y1="64" x2="112" y2="260" stroke="#facc15" strokeWidth="2.5" />
      <line x1="218" y1="64" x2="334" y2="260" stroke="#facc15" strokeWidth="2.5" />
      <polygon points="0,36 168,64 76,144 0,136" fill="#1d4ed8" stroke="#60a5fa" strokeWidth="1.5" />
      <polygon points="0,136 76,144 106,260 0,260" fill="#64748b" />
      <g stroke="#334155" strokeWidth="3">
        <line x1="12" y1="154" x2="88" y2="154" />
        <line x1="8" y1="168" x2="92" y2="168" />
        <line x1="4" y1="184" x2="96" y2="184" />
        <line x1="4" y1="202" x2="98" y2="202" />
        <line x1="4" y1="222" x2="102" y2="222" />
        <line x1="4" y1="242" x2="104" y2="242" />
      </g>
      <polygon points="244,72 372,78 420,178 332,178" fill="#1b5e4b" stroke="#0f3f32" strokeWidth="1.5" />
      <path d="M270 76 L354 176 M304 78 L388 176 M340 80 L414 166" stroke="#2a7d65" strokeWidth="2" />
      <g fill="#a8adb3" stroke="#64748b" strokeWidth="1">
        <rect x="296" y="164" width="44" height="34" rx="2" />
        <rect x="348" y="176" width="52" height="44" rx="2" />
        <rect x="334" y="218" width="66" height="38" rx="2" />
      </g>
      <g stroke="rgba(56,242,255,0.45)" strokeWidth="1" fill="none">
        <rect x="148" y="88" width="124" height="84" strokeDasharray="4 4" />
        <line x1="210" y1="120" x2="210" y2="140" />
        <line x1="200" y1="130" x2="220" y2="130" />
      </g>
      {timeLabel ? (
        <g>
          <rect x="8" y="232" width="128" height="20" rx="4" fill="rgba(5,18,42,0.82)" stroke="rgba(56,189,248,0.45)" />
          <text x="15" y="245" fill="#e6f4ff" fontSize="10.5" fontWeight="600">
            {timeLabel}
          </text>
        </g>
      ) : null}
    </svg>
  );
}
