'use client';

export type BadgeTone = 'ok' | 'warn' | 'danger' | 'info' | 'muted';

export function StatusBadge({ text, tone = 'info' }: { text: string; tone?: BadgeTone }) {
  return <span className={`jihei-badge ${tone}`}>{text}</span>;
}
