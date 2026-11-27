'use client';

import type { CSSProperties, PointerEvent, RefObject, WheelEvent } from 'react';
import {
  Crosshair,
  Info,
  Minus,
  Navigation,
  Plus,
  RotateCcw,
} from 'lucide-react';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { SplitImageCompare } from '@/components/ui/SplitImageCompare';
import type { BlacksoilPoint2D } from '@/db/schema/domains/m14';
import type { ImageryDataMap } from '../imagery';
import {
  EPOCH_LIST,
  WORLD_H,
  WORLD_W,
  type BlacksoilParcelDTO,
  type EpochKey,
  type EpochMetaItem,
  type LayerVisibilityState,
} from '../types';
import { ParcelInfoPanel } from './ParcelInfoPanel';

interface CompareStageProps {
  stageRef: RefObject<HTMLDivElement | null>;
  stageSize: { width: number; height: number };
  parcels: BlacksoilParcelDTO[];
  selectedParcel: BlacksoilParcelDTO | null;
  epochs: Record<EpochKey, EpochMetaItem>;
  corridorPolygon: BlacksoilPoint2D[];
  imageryUrls: ImageryDataMap | null;
  leftEpoch: EpochKey;
  rightEpoch: EpochKey;
  splitPct: number;
  zoom: number;
  panX: number;
  panY: number;
  isPanning: boolean;
  layers: LayerVisibilityState;
  onSplitChange: (pct: number) => void;
  onEpochChange: (side: 'left' | 'right', epoch: EpochKey) => void;
  onLayerToggle: (key: keyof LayerVisibilityState, checked: boolean) => void;
  onFocusParcel: (parcelId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onResetView: () => void;
  onOpenDetailModal: () => void;
  onStagePointerDown: (e: PointerEvent<HTMLDivElement>) => void;
  onStagePointerMove: (e: PointerEvent<HTMLDivElement>) => void;
  onStagePointerUp: (e: PointerEvent<HTMLDivElement>) => void;
  onStageWheel: (e: WheelEvent<HTMLDivElement>) => void;
}

export function CompareStage({
  stageRef,
  stageSize,
  parcels,
  selectedParcel,
  epochs,
  corridorPolygon,
  imageryUrls,
  leftEpoch,
  rightEpoch,
  splitPct,
  zoom,
  panX,
  panY,
  isPanning,
  layers,
  onSplitChange,
  onEpochChange,
  onLayerToggle,
  onFocusParcel,
  onZoomIn,
  onZoomOut,
  onResetView,
  onOpenDetailModal,
  onStagePointerDown,
  onStagePointerMove,
  onStagePointerUp,
  onStageWheel,
}: CompareStageProps) {
  const stageW = Math.max(320, stageSize.width);
  const stageH = Math.max(240, stageSize.height);
  const baseScale = Math.max(stageW / WORLD_W, stageH / WORLD_H);
  const totalScale = baseScale * zoom;

  function worldToScreen(wx: number, wy: number): [number, number] {
    return [
      stageW / 2 + (wx - WORLD_W / 2) * totalScale + panX,
      stageH / 2 + (wy - WORLD_H / 2) * totalScale + panY,
    ];
  }

  const corridorPointsAttr = corridorPolygon
    .map(([wx, wy]) => {
      const [sx, sy] = worldToScreen(wx, wy);
      return `${sx.toFixed(1)},${sy.toFixed(1)}`;
    })
    .join(' ');

  const leftMeta = epochs[leftEpoch];
  const rightMeta = epochs[rightEpoch];

  const fallbackImg =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
  const beforeSrc = imageryUrls
    ? layers.basemap
      ? imageryUrls[leftEpoch]
      : imageryUrls.grid
    : fallbackImg;
  const afterSrc = imageryUrls
    ? layers.basemap
      ? imageryUrls[rightEpoch]
      : imageryUrls.grid
    : fallbackImg;

  const stageStyle = {
    '--m14-pan-x': `${panX.toFixed(1)}px`,
    '--m14-pan-y': `${panY.toFixed(1)}px`,
  } as CSSProperties;

  return (
    <div
      ref={stageRef}
      className={`m14-stage ${isPanning ? 'panning' : ''}`}
      style={stageStyle}
      onPointerDown={onStagePointerDown}
      onPointerMove={onStagePointerMove}
      onPointerUp={onStagePointerUp}
      onPointerCancel={onStagePointerUp}
      onWheel={onStageWheel}
    >
      <SplitImageCompare
        beforeSrc={beforeSrc}
        afterSrc={afterSrc}
        splitPct={splitPct}
        onSplitChange={onSplitChange}
        zoom={zoom}
        captionText={`同位置 · ${leftMeta.year} vs ${rightMeta.year} · 遥感卷帘对比`}
      />

      {/* Synchronized SVG Vector Overlay */}
      <svg
        className="m14-svg-overlay"
        viewBox={`0 0 ${stageW} ${stageH}`}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <filter id="m14CyanGlow" x="-25%" y="-25%" width="150%" height="150%">
            <feDropShadow
              dx="0"
              dy="0"
              stdDeviation="4"
              floodColor="#38f2ff"
              floodOpacity="0.85"
            />
          </filter>
        </defs>

        {layers.corridor && corridorPolygon.length > 0 ? (
          <polygon
            points={corridorPointsAttr}
            fill="rgba(250, 204, 21, 0.12)"
            stroke="#facc15"
            strokeWidth={2}
            strokeDasharray="9 6"
          />
        ) : null}

        {layers.protection
          ? parcels.map((parcel) => {
              const isSel = selectedParcel?.id === parcel.id;
              const ptsStr = parcel.polygonPoints
                .map(([wx, wy]) => {
                  const [sx, sy] = worldToScreen(wx, wy);
                  return `${sx.toFixed(1)},${sy.toFixed(1)}`;
                })
                .join(' ');

              return (
                <polygon
                  key={parcel.id}
                  className="m14-parcel-poly"
                  data-parcel={parcel.id}
                  points={ptsStr}
                  fill={isSel ? 'rgba(34, 211, 238, 0.18)' : 'rgba(16, 185, 129, 0.16)'}
                  stroke={isSel ? '#38f2ff' : '#34d399'}
                  strokeWidth={isSel ? 2.6 : 1.8}
                  filter={isSel ? 'url(#m14CyanGlow)' : undefined}
                />
              );
            })
          : null}

        {layers.labels
          ? parcels.map((parcel) => {
              const isSel = selectedParcel?.id === parcel.id;
              const [cx, cy] = parcel.centerPoint;
              const [ox, oy] = parcel.labelOffset;
              const [sx, sy] = worldToScreen(cx + ox, cy + oy);
              const labelText = isSel ? `${parcel.id} • 选中地块` : parcel.id;
              const pillW = isSel ? 128 : 58;
              const pillH = 24;
              const rx = sx - pillW / 2;
              const ry = sy - pillH - 12;

              return (
                <g
                  key={`lbl-${parcel.id}`}
                  className="m14-parcel-label-g"
                  data-parcel={parcel.id}
                >
                  <rect
                    x={rx}
                    y={ry}
                    width={pillW}
                    height={pillH}
                    rx={5}
                    fill={isSel ? 'rgba(10, 48, 96, 0.94)' : 'rgba(8, 28, 62, 0.88)'}
                    stroke={isSel ? '#38f2ff' : 'rgba(96, 210, 255, 0.65)'}
                    strokeWidth={isSel ? 1.5 : 1}
                  />
                  <text
                    x={sx}
                    y={ry + 16}
                    textAnchor="middle"
                    fill="#ffffff"
                    fontSize={12}
                    fontWeight={700}
                  >
                    {labelText}
                  </text>
                  <circle
                    cx={sx}
                    cy={sy}
                    r={4.5}
                    fill={isSel ? '#38f2ff' : '#34d399'}
                    stroke="#ffffff"
                    strokeWidth={1.4}
                  />
                </g>
              );
            })
          : null}
      </svg>

      {/* Floating Epoch Pickers */}
      <div className="m14-epoch-bar">
        <div className="m14-epoch-picker">
          <span>左侧影像</span>
          <select
            className="m14-epoch-select"
            value={leftEpoch}
            aria-label="选择左侧遥感影像年份"
            onChange={(e) => onEpochChange('left', e.target.value as EpochKey)}
          >
            {EPOCH_LIST.map((ep) => (
              <option key={ep} value={ep}>
                {epochs[ep].year}
              </option>
            ))}
          </select>
          <span className={`m14-epoch-tag ${leftMeta.tagTone}`}>{leftMeta.tag}</span>
        </div>

        <div className="m14-epoch-picker">
          <span>右侧影像</span>
          <select
            className="m14-epoch-select"
            value={rightEpoch}
            aria-label="选择右侧遥感影像年份"
            onChange={(e) => onEpochChange('right', e.target.value as EpochKey)}
          >
            {EPOCH_LIST.map((ep) => (
              <option key={ep} value={ep}>
                {epochs[ep].year}
              </option>
            ))}
          </select>
          <span className={`m14-epoch-tag ${rightMeta.tagTone}`}>{rightMeta.tag}</span>
        </div>
      </div>

      {/* Left Floating Collapsible Panel: 图层叠加 */}
      <GlassPanel
        title="图层叠加"
        collapsible
        className="m14-left-panel"
      >
        <div className="m14-layer-list">
          <label className="m14-layer-item">
            <span className="m14-layer-label">
              <input
                type="checkbox"
                checked={layers.basemap}
                onChange={(e) => onLayerToggle('basemap', e.target.checked)}
              />
              <span>高分遥感底图</span>
            </span>
            <span className="m14-swatch-raster" />
          </label>
          <label className="m14-layer-item">
            <span className="m14-layer-label">
              <input
                type="checkbox"
                checked={layers.protection}
                onChange={(e) => onLayerToggle('protection', e.target.checked)}
              />
              <span>黑土地保护范围</span>
            </span>
            <span className="m14-swatch-soil" />
          </label>
          <label className="m14-layer-item">
            <span className="m14-layer-label">
              <input
                type="checkbox"
                checked={layers.corridor}
                onChange={(e) => onLayerToggle('corridor', e.target.checked)}
              />
              <span>工程施工范围</span>
            </span>
            <span className="m14-swatch-corridor" />
          </label>
          <label className="m14-layer-item">
            <span className="m14-layer-label">
              <input
                type="checkbox"
                checked={layers.labels}
                onChange={(e) => onLayerToggle('labels', e.target.checked)}
              />
              <span>地块标识</span>
            </span>
            <span className="m14-swatch-ht">HT</span>
          </label>
        </div>
        <div className="m14-layer-tip">
          <Info size={13} />
          <span>两侧影像同步叠加所选图层</span>
        </div>
      </GlassPanel>

      {/* Right Floating Panel: 地块信息 */}
      <ParcelInfoPanel
        parcel={selectedParcel}
        epochs={epochs}
        leftEpoch={leftEpoch}
        rightEpoch={rightEpoch}
        onFocusParcel={onFocusParcel}
        onOpenDetailModal={onOpenDetailModal}
      />

      {/* Bottom-Left Scale / Notice */}
      <div className="m14-scale-badge">
        <Navigation size={13} />
        <span>北向示意 影像与范围均为演示</span>
        <span style={{ opacity: 0.45 }}>|</span>
        <span className="m14-scale-val">{zoom.toFixed(1)}×</span>
      </div>

      {/* Bottom-Right Map Controls */}
      <div className="m14-map-controls" role="group" aria-label="影像视图缩放与定位控制">
        <button type="button" className="m14-ctrl-btn" onClick={onZoomIn}>
          <Plus size={14} />
          <span>放大</span>
        </button>
        <button type="button" className="m14-ctrl-btn" onClick={onZoomOut}>
          <Minus size={14} />
          <span>缩小</span>
        </button>
        <button
          type="button"
          className="m14-ctrl-btn"
          onClick={() => selectedParcel && onFocusParcel(selectedParcel.id)}
        >
          <Crosshair size={14} />
          <span>定位</span>
        </button>
        <button type="button" className="m14-ctrl-btn" onClick={onResetView}>
          <RotateCcw size={14} />
          <span>视图复位</span>
        </button>
      </div>
    </div>
  );
}
