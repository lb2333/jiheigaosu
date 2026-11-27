'use client';

import { useId } from 'react';

export interface LedBoardPreviewProps {
  line1: string;
  line2: string;
  spec?: string;
  dimmed?: boolean;
  dimmedLabel?: string;
}

export function LedBoardPreview({
  line1,
  line2,
  spec = '单黄LED 128×48',
  dimmed = false,
  dimmedLabel = '设备回读待返回',
}: LedBoardPreviewProps) {
  const rawId = useId();
  const uid = `led_${rawId.replace(/[^a-zA-Z0-9_-]/g, '_')}`;

  const isFullColor = String(spec || '').includes('全彩');
  const c1 = dimmed ? '#64748b' : isFullColor ? '#fbbf24' : '#facc15';
  const c2 = dimmed ? '#64748b' : isFullColor ? '#4ade80' : '#facc15';
  const l1 = String(line1 || '').trim() || ' ';
  const l2 = String(line2 || '').trim() || ' ';
  const maxLen = Math.max(l1.length, l2.length);
  const fontSize = maxLen > 9 ? 28 : maxLen > 7 ? 33 : 37;
  const letterSpacing = maxLen > 8 ? 2 : 3.5;
  const textOpacity = dimmed ? 0.26 : 1;

  return (
    <div className="m13-led-bezel">
      <svg
        viewBox="0 0 384 128"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`${l1} ${l2}`}
      >
        <defs>
          <pattern
            id={`${uid}_bg`}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect width="4" height="4" fill="#07090f" />
            <circle cx="2" cy="2" r="1.2" fill="#171d27" />
          </pattern>
          <pattern
            id={`${uid}_maskdots`}
            width="4"
            height="4"
            patternUnits="userSpaceOnUse"
          >
            <rect width="4" height="4" fill="#000000" />
            <circle cx="2" cy="2" r="1.45" fill="#ffffff" />
          </pattern>
          <mask id={`${uid}_mask`}>
            <rect
              x="0"
              y="0"
              width="384"
              height="128"
              fill={`url(#${uid}_maskdots)`}
            />
          </mask>
          <filter
            id={`${uid}_glow`}
            x="-12%"
            y="-12%"
            width="124%"
            height="124%"
          >
            <feGaussianBlur stdDeviation="1.35" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect
          x="0"
          y="0"
          width="384"
          height="128"
          rx="4"
          fill={`url(#${uid}_bg)`}
        />
        <g
          mask={`url(#${uid}_mask)`}
          filter={`url(#${uid}_glow)`}
          opacity={textOpacity}
        >
          <text
            x="192"
            y="52"
            textAnchor="middle"
            fill={c1}
            fontSize={fontSize}
            fontWeight="800"
            letterSpacing={letterSpacing}
            fontFamily="'Microsoft YaHei','PingFang SC','SimHei',sans-serif"
          >
            {l1}
          </text>
          <text
            x="192"
            y="100"
            textAnchor="middle"
            fill={c2}
            fontSize={fontSize}
            fontWeight="800"
            letterSpacing={letterSpacing}
            fontFamily="'Microsoft YaHei','PingFang SC','SimHei',sans-serif"
          >
            {l2}
          </text>
        </g>
        {dimmed ? (
          <g>
            <rect
              x="116"
              y="48"
              width="152"
              height="30"
              rx="6"
              fill="rgba(10,25,52,0.88)"
              stroke="rgba(250,204,21,0.5)"
            />
            <text
              x="192"
              y="67"
              textAnchor="middle"
              fill="#fde047"
              fontSize="12"
              fontWeight="700"
              fontFamily="'Microsoft YaHei',sans-serif"
            >
              {dimmedLabel}
            </text>
          </g>
        ) : null}
      </svg>
    </div>
  );
}
