'use client';

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent,
  type WheelEvent,
} from 'react';
import { Crosshair, Link2, MapPin, Search } from 'lucide-react';
import { usePlatformStore } from '@/lib/store/platform-store';
import { CompareStage } from './components/CompareStage';
import {
  ParcelDetailModal,
  PendingSpecModal,
  type ParcelReviewPayload,
} from './components/BlacksoilModals';
import { generateEpochImageryDataUrls, type ImageryDataMap } from './imagery';
import {
  CORRIDOR_CENTERLINE,
  CORRIDOR_POLYGON,
  EPOCH_META,
  MAX_ZOOM,
  MIN_ZOOM,
  WORLD_H,
  WORLD_W,
  type BlacksoilParcelDTO,
  type BlacksoilParcelsResponse,
  type EpochKey,
  type LayerVisibilityState,
} from './types';
import './m14.css';

function clampPan(
  panX: number,
  panY: number,
  zoom: number,
  stageW: number,
  stageH: number
) {
  const baseScale = Math.max(stageW / WORLD_W, stageH / WORLD_H);
  const scale = baseScale * zoom;
  const maxPanX = Math.max(120, (WORLD_W * scale - stageW) * 0.5 + 110);
  const maxPanY = Math.max(90, (WORLD_H * scale - stageH) * 0.5 + 90);
  return {
    x: Math.max(-maxPanX, Math.min(maxPanX, panX)),
    y: Math.max(-maxPanY, Math.min(maxPanY, panY)),
  };
}

export function BlacksoilModule({ subPageId }: { subPageId: string }) {
  const activeSectionId = usePlatformStore((s) => s.activeSectionId);
  const setCesiumMode = usePlatformStore((s) => s.setCesiumMode);
  const showToast = usePlatformStore((s) => s.showToast);

  const [parcels, setParcels] = useState<BlacksoilParcelDTO[]>([]);
  const [epochs, setEpochs] = useState(EPOCH_META);
  const [corridorCenterline, setCorridorCenterline] = useState(CORRIDOR_CENTERLINE);
  const [corridorPolygon, setCorridorPolygon] = useState(CORRIDOR_POLYGON);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('HT-02');
  const [selectedParcelId, setSelectedParcelId] = useState('HT-02');
  const [leftEpoch, setLeftEpoch] = useState<EpochKey>('2025');
  const [rightEpoch, setRightEpoch] = useState<EpochKey>('2026');
  const [splitPct, setSplitPct] = useState(50);
  const [zoom, setZoom] = useState(1.0);
  const [panX, setPanX] = useState(0);
  const [panY, setPanY] = useState(0);
  const [isPanning, setIsPanning] = useState(false);

  const [layers, setLayers] = useState<LayerVisibilityState>({
    basemap: true,
    protection: true,
    corridor: true,
    labels: true,
  });

  const [imageryUrls, setImageryUrls] = useState<ImageryDataMap | null>(null);
  const [stageSize, setStageSize] = useState({ width: 1280, height: 720 });

  const [pendingModalOpen, setPendingModalOpen] = useState(false);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const viewRef = useRef({ zoom: 1.0, panX: 0, panY: 0 });
  const stageSizeRef = useRef({ width: 1280, height: 720 });
  const panSessionRef = useRef<{
    active: boolean;
    startX: number;
    startY: number;
    origPanX: number;
    origPanY: number;
    downTarget: Element | null;
  }>({
    active: false,
    startX: 0,
    startY: 0,
    origPanX: 0,
    origPanY: 0,
    downTarget: null,
  });

  viewRef.current = { zoom, panX, panY };
  stageSizeRef.current = stageSize;

  useEffect(() => {
    setCesiumMode('opaque');
  }, [subPageId, setCesiumMode]);

  useEffect(() => {
    setImageryUrls(generateEpochImageryDataUrls(corridorCenterline));
  }, [corridorCenterline]);

  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const updateSize = () => {
      const rect = el.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        setStageSize({ width: rect.width, height: rect.height });
      }
    };
    updateSize();

    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(updateSize);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetch('/api/v1/m14/parcels')
      .then((res) => (res.ok ? res.json() : null))
      .then((data: BlacksoilParcelsResponse | null) => {
        if (!active || !data) return;
        setParcels(data.parcels ?? []);
        if (data.epochs) setEpochs(data.epochs);
        if (data.corridor?.centerline?.length) {
          setCorridorCenterline(data.corridor.centerline);
        }
        if (data.corridor?.polygon?.length) {
          setCorridorPolygon(data.corridor.polygon);
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, []);

  const stopAnimation = useCallback(() => {
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
  }, []);

  const animateViewTo = useCallback(
    (targetZoom: number, targetPanX: number, targetPanY: number, durationMs = 340) => {
      stopAnimation();
      const startZoom = viewRef.current.zoom;
      const startPanX = viewRef.current.panX;
      const startPanY = viewRef.current.panY;
      const startTime = performance.now();

      const step = (now: number) => {
        const t = Math.min(1, (now - startTime) / durationMs);
        const ease = 1 - Math.pow(1 - t, 3);
        const nextZoom = startZoom + (targetZoom - startZoom) * ease;
        const nextPanX = startPanX + (targetPanX - startPanX) * ease;
        const nextPanY = startPanY + (targetPanY - startPanY) * ease;
        const { width, height } = stageSizeRef.current;
        const clamped = clampPan(nextPanX, nextPanY, nextZoom, width, height);
        setZoom(nextZoom);
        setPanX(clamped.x);
        setPanY(clamped.y);
        if (t < 1) {
          animFrameRef.current = requestAnimationFrame(step);
        } else {
          animFrameRef.current = null;
        }
      };
      animFrameRef.current = requestAnimationFrame(step);
    },
    [stopAnimation]
  );

  const selectedParcel = useMemo(() => {
    return (
      parcels.find((p) => p.id === selectedParcelId) ??
      parcels[0] ??
      null
    );
  }, [parcels, selectedParcelId]);

  const focusParcel = useCallback(
    (parcelId: string) => {
      const target = parcels.find((p) => p.id === parcelId);
      if (!target) return;

      setSelectedParcelId(target.id);
      setSearchQuery(target.id);

      const { width, height } = stageSizeRef.current;
      const targetZoom = Math.max(
        MIN_ZOOM,
        Math.min(MAX_ZOOM, target.focusZoom || 1.5)
      );
      const baseScale = Math.max(width / WORLD_W, height / WORLD_H);
      const targetScale = baseScale * targetZoom;
      const [cx, cy] = target.centerPoint;
      const rawPanX = -(cx - WORLD_W / 2) * targetScale;
      const rawPanY = -(cy - WORLD_H / 2) * targetScale;
      const clamped = clampPan(rawPanX, rawPanY, targetZoom, width, height);

      animateViewTo(targetZoom, clamped.x, clamped.y, 380);
    },
    [parcels, animateViewTo]
  );

  // Sync with top SubNavBar section filter
  const prevSectionRef = useRef<string | null>(activeSectionId);
  useEffect(() => {
    if (prevSectionRef.current === activeSectionId) return;
    prevSectionRef.current = activeSectionId;
    if (!parcels.length) return;

    if (!activeSectionId) {
      animateViewTo(1.0, 0, 0, 320);
      return;
    }
    const secParcel = parcels.find((p) => p.sectionId === activeSectionId);
    if (secParcel) {
      focusParcel(secParcel.id);
      showToast(`已联动${secParcel.sectionName}黑土地保护地块 ${secParcel.id}`);
    }
  }, [activeSectionId, parcels, focusParcel, animateViewTo, showToast]);

  function handleSearchLocate() {
    const raw = searchQuery.trim().toUpperCase();
    const match = parcels.find(
      (p) =>
        p.id.toUpperCase() === raw ||
        p.id.toUpperCase().includes(raw) ||
        p.name.toUpperCase().includes(raw) ||
        p.sectionName.toUpperCase().includes(raw)
    );
    if (!match) {
      showToast('未找到匹配地块，请输入 HT-01 ~ HT-06');
      return;
    }
    focusParcel(match.id);
    showToast(`已定位黑土地地块 ${match.id}（${match.stake}）`);
  }

  function handleSelectParcel(parcelId: string) {
    const parcel = parcels.find((p) => p.id === parcelId);
    if (!parcel) return;
    setSelectedParcelId(parcel.id);
    setSearchQuery(parcel.id);
    showToast(`已选中地块 ${parcel.id}（${parcel.name}）`);
  }

  function handleEpochChange(side: 'left' | 'right', epoch: EpochKey) {
    if (side === 'left') {
      setLeftEpoch(epoch);
      showToast(`左侧影像已切换至 ${epochs[epoch].year}（${epochs[epoch].tag}）`);
    } else {
      setRightEpoch(epoch);
      showToast(`右侧影像已切换至 ${epochs[epoch].year}（${epochs[epoch].tag}）`);
    }
  }

  function handleLayerToggle(key: keyof LayerVisibilityState, checked: boolean) {
    setLayers((prev) => ({ ...prev, [key]: checked }));
  }

  function handleZoomStep(delta: number) {
    const curZoom = viewRef.current.zoom;
    const nextZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(curZoom + delta).toFixed(2)));
    if (nextZoom === curZoom) return;
    const factor = nextZoom / curZoom;
    const { width, height } = stageSizeRef.current;
    const clamped = clampPan(
      viewRef.current.panX * factor,
      viewRef.current.panY * factor,
      nextZoom,
      width,
      height
    );
    animateViewTo(nextZoom, clamped.x, clamped.y, 220);
  }

  function handleResetView() {
    setSplitPct(50);
    animateViewTo(1.0, 0, 0, 300);
    showToast('已复位遥感对比视图（1.0×）');
  }

  function handleStagePointerDown(e: PointerEvent<HTMLDivElement>) {
    const target = e.target as Element | null;
    if (
      target?.closest(
        '.compare-divider, .compare-handle, .m14-left-panel, .m14-right-panel, .m14-epoch-bar, .m14-map-controls, .m14-scale-badge, .compare-caption-pill'
      )
    ) {
      return;
    }
    panSessionRef.current = {
      active: true,
      startX: e.clientX,
      startY: e.clientY,
      origPanX: viewRef.current.panX,
      origPanY: viewRef.current.panY,
      downTarget: target,
    };
    setIsPanning(true);
    if (e.currentTarget.setPointerCapture) {
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }

  function handleStagePointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!panSessionRef.current.active) return;
    const dx = e.clientX - panSessionRef.current.startX;
    const dy = e.clientY - panSessionRef.current.startY;
    if (Math.abs(dx) > 2 || Math.abs(dy) > 2) {
      stopAnimation();
    }
    const { width, height } = stageSizeRef.current;
    const clamped = clampPan(
      panSessionRef.current.origPanX + dx,
      panSessionRef.current.origPanY + dy,
      viewRef.current.zoom,
      width,
      height
    );
    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  function handleStagePointerUp(e: PointerEvent<HTMLDivElement>) {
    if (!panSessionRef.current.active) return;
    const moved = Math.hypot(
      e.clientX - panSessionRef.current.startX,
      e.clientY - panSessionRef.current.startY
    );
    const clickTarget = panSessionRef.current.downTarget;
    panSessionRef.current.active = false;
    panSessionRef.current.downTarget = null;
    setIsPanning(false);

    if (moved < 5 && clickTarget) {
      const hit = clickTarget.closest('[data-parcel]');
      const pid = hit?.getAttribute('data-parcel');
      if (pid) {
        handleSelectParcel(pid);
      }
    }
  }

  function handleStageWheel(e: WheelEvent<HTMLDivElement>) {
    const target = e.target as Element | null;
    if (target?.closest('.m14-right-panel, .m14-left-panel')) return;
    stopAnimation();

    const el = stageRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cursorX = e.clientX - rect.left;
    const cursorY = e.clientY - rect.top;

    const oldZoom = viewRef.current.zoom;
    const delta = e.deltaY < 0 ? 0.2 : -0.2;
    const newZoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, +(oldZoom + delta).toFixed(2)));
    if (newZoom === oldZoom) return;

    const factor = newZoom / oldZoom;
    const cxOffset = cursorX - rect.width / 2;
    const cyOffset = cursorY - rect.height / 2;
    const nextPanX = cxOffset - (cxOffset - viewRef.current.panX) * factor;
    const nextPanY = cyOffset - (cyOffset - viewRef.current.panY) * factor;
    const clamped = clampPan(nextPanX, nextPanY, newZoom, rect.width, rect.height);

    setZoom(newZoom);
    setPanX(clamped.x);
    setPanY(clamped.y);
  }

  async function handleSubmitReview(parcelId: string, payload: ParcelReviewPayload) {
    setReviewSubmitting(true);
    setReviewError(null);
    try {
      const res = await fetch(`/api/v1/m14/parcels/${encodeURIComponent(parcelId)}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json().catch(() => null);
      if (!res.ok) {
        const msg = data?.error || `核验提交失败 (${res.status})`;
        setReviewError(msg);
        showToast(msg);
        return;
      }
      if (data?.parcel) {
        setParcels((prev) =>
          prev.map((item) => (item.id === data.parcel.id ? data.parcel : item))
        );
        showToast(`已完成地块 ${data.parcel.id} 合规核验更新（${data.parcel.complianceStatus}）`);
        setDetailModalOpen(false);
      }
    } catch {
      const msg = '网络异常，核验保存失败';
      setReviewError(msg);
      showToast(msg);
    } finally {
      setReviewSubmitting(false);
    }
  }

  return (
    <section id="moduleStageHost" className="module-stage-host active mode-opaque">
      <div className="m14-root">
        {/* Top Module Toolbar */}
        <div className="m14-toolbar">
          <div className="m14-toolbar-left">
            <div className="m14-scope-pill">
              <MapPin size={14} />
              <strong>明水至北安段</strong>
              <span>沿线演示区</span>
            </div>
            <div className="m14-search-wrap">
              <span className="m14-search-icon">
                <Search size={14} />
              </span>
              <input
                type="text"
                className="m14-search-input"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleSearchLocate();
                  }
                }}
                placeholder="输入地块编号 HT-01~HT-06"
                aria-label="搜索黑土地保护地块编号"
              />
            </div>
            <button
              type="button"
              className="m14-locate-btn"
              onClick={handleSearchLocate}
            >
              <Crosshair size={14} />
              <span>定位地块</span>
            </button>
          </div>

          <div className="m14-toolbar-right">
            <div className="m14-sync-badge">
              <Link2 size={14} />
              <span>左右视图同步</span>
            </div>
            <button
              type="button"
              className="m14-pending-badge"
              onClick={() => setPendingModalOpen(true)}
            >
              专项资料待接入
            </button>
          </div>
        </div>

        {/* Interactive Split-Curtain Stage */}
        {loading && parcels.length === 0 ? (
          <div className="m14-stage" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div className="jihei-empty">正在加载黑土地保护遥感对比图层与监测地块...</div>
          </div>
        ) : (
          <CompareStage
            stageRef={stageRef}
            stageSize={stageSize}
            parcels={parcels}
            selectedParcel={selectedParcel}
            epochs={epochs}
            corridorPolygon={corridorPolygon}
            imageryUrls={imageryUrls}
            leftEpoch={leftEpoch}
            rightEpoch={rightEpoch}
            splitPct={splitPct}
            zoom={zoom}
            panX={panX}
            panY={panY}
            isPanning={isPanning}
            layers={layers}
            onSplitChange={setSplitPct}
            onEpochChange={handleEpochChange}
            onLayerToggle={handleLayerToggle}
            onFocusParcel={(pid) => {
              focusParcel(pid);
              showToast(`已居中定位地块 ${pid}`);
            }}
            onZoomIn={() => handleZoomStep(0.25)}
            onZoomOut={() => handleZoomStep(-0.25)}
            onResetView={handleResetView}
            onOpenDetailModal={() => {
              setReviewError(null);
              setDetailModalOpen(true);
            }}
            onStagePointerDown={handleStagePointerDown}
            onStagePointerMove={handleStagePointerMove}
            onStagePointerUp={handleStagePointerUp}
            onStageWheel={handleStageWheel}
          />
        )}
      </div>

      {pendingModalOpen ? (
        <PendingSpecModal
          parcelCount={parcels.length || 6}
          onClose={() => setPendingModalOpen(false)}
        />
      ) : null}

      {detailModalOpen && selectedParcel ? (
        <ParcelDetailModal
          key={selectedParcel.id}
          parcel={selectedParcel}
          submitting={reviewSubmitting}
          errorMsg={reviewError}
          onSubmitReview={handleSubmitReview}
          onClose={() => setDetailModalOpen(false)}
        />
      ) : null}
    </section>
  );
}
