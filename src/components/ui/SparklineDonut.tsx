'use client';

export function SparklineSvg({
  values,
  width = 140,
  height = 36,
  color = '#38f2ff',
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
}) {
  const arr = values.length ? values : [0, 0];
  const pad = 4;
  const min = Math.min(...arr);
  const max = Math.max(...arr);
  const span = max - min || 1;
  const pts = arr.map((v, i) => {
    const x = pad + (i / Math.max(1, arr.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  });
  const area = `${pad},${height - pad} ${pts.join(' ')} ${width - pad},${height - pad}`;
  return (
    <svg className="jihei-sparkline" width={width} height={height} viewBox={`0 0 ${width} ${height}`} fill="none">
      <polygon points={area} fill={color} fillOpacity="0.16" />
      <polyline points={pts.join(' ')} stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function DonutSvg({
  pct,
  size = 64,
  stroke = 6,
  color = '#38f2ff',
}: {
  pct: number;
  size?: number;
  stroke?: number;
  color?: string;
}) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = c * (1 - clamped / 100);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(56,189,248,0.18)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeDasharray={c.toFixed(1)}
        strokeDashoffset={offset.toFixed(1)}
        strokeLinecap="round"
        transform={`rotate(-90 ${size / 2} ${size / 2})`}
      />
      <text
        x="50%"
        y="52%"
        textAnchor="middle"
        dominantBaseline="middle"
        fill="#ffffff"
        fontSize={Math.round(size * 0.22)}
        fontWeight="700"
      >
        {clamped.toFixed(0)}%
      </text>
    </svg>
  );
}
