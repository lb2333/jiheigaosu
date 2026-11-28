'use client';

import { useRef, useState } from 'react';

interface SplitImageCompareProps {
  beforeSrc: string;
  afterSrc: string;
  beforeFilter?: string;
  afterFilter?: string;
  splitPct: number;
  onSplitChange: (pct: number) => void;
  zoom?: number;
  tagText?: string;
  captionText?: string;
}

export function SplitImageCompare({
  beforeSrc,
  afterSrc,
  beforeFilter = 'none',
  afterFilter = 'none',
  splitPct,
  onSplitChange,
  zoom = 1,
  tagText,
  captionText = '同位置 · 不同时期 · 影像示意',
}: SplitImageCompareProps) {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const [dragging, setDragging] = useState(false);

  function updateFromClientX(clientX: number) {
    if (!stageRef.current) return;
    const rect = stageRef.current.getBoundingClientRect();
    const raw = ((clientX - rect.left) / Math.max(1, rect.width)) * 100;
    onSplitChange(Math.max(12, Math.min(88, raw)));
  }

  return (
    <div ref={stageRef} className="compare-stage">
      <div className="compare-layer compare-after-layer">
        <img
          src={afterSrc}
          alt="后期建设影像"
          loading="lazy"
          decoding="async"
          style={{ filter: afterFilter, transform: `scale(${zoom})` }}
        />
      </div>

      <div
        className="compare-layer compare-before-clip"
        style={{ clipPath: `inset(0 ${100 - splitPct}% 0 0)` }}
      >
        <img
          src={beforeSrc}
          alt="前期建设影像"
          loading="lazy"
          decoding="async"
          style={{ filter: beforeFilter, transform: `scale(${zoom})` }}
        />
      </div>

      <div className="map-vignette" style={{ zIndex: 5 }} />
      {tagText ? (
        <div className="work-section-tag" style={{ left: '33.5%', top: '37%', zIndex: 10 }}>
          {tagText}
        </div>
      ) : null}

      <div
        className={`compare-divider ${dragging ? 'dragging' : ''}`}
        style={{ left: `${splitPct}%` }}
        onPointerDown={(e) => {
          setDragging(true);
          e.currentTarget.setPointerCapture(e.pointerId);
          updateFromClientX(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging) updateFromClientX(e.clientX);
        }}
        onPointerUp={() => setDragging(false)}
      >
        <div
          className="compare-handle"
          tabIndex={0}
          role="slider"
          aria-label="拖动对比前后时期影像"
          aria-valuemin={8}
          aria-valuemax={92}
          aria-valuenow={Math.round(splitPct)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowLeft') onSplitChange(Math.max(12, splitPct - 3));
            if (e.key === 'ArrowRight') onSplitChange(Math.min(88, splitPct + 3));
          }}
        >
          <div className="compare-handle-circle">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="9 6 3 12 9 18 9 6" />
              <polygon points="15 6 21 12 15 18 15 6" />
            </svg>
          </div>
          <span className="compare-handle-pill">拖动对比</span>
        </div>
      </div>

      <div className="compare-caption-pill">{captionText}</div>
    </div>
  );
}
