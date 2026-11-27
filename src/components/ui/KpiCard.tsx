'use client';

interface KpiCardProps {
  label: string;
  value: string | number;
  unit?: string;
  trend?: string;
  tone?: 'default' | 'green' | 'gold';
}

export function KpiCard({ label, value, unit, trend, tone = 'default' }: KpiCardProps) {
  const toneClass = tone === 'green' ? 'tone-green' : tone === 'gold' ? 'tone-gold' : '';
  return (
    <div className={`jihei-kpi-card ${toneClass}`}>
      <div className="jihei-kpi-label">{label}</div>
      <div className="jihei-kpi-val-row">
        <strong className="jihei-kpi-val">{value}</strong>
        {unit ? <span className="jihei-kpi-unit">{unit}</span> : null}
        {trend ? <span className="jihei-kpi-trend">{trend}</span> : null}
      </div>
    </div>
  );
}
