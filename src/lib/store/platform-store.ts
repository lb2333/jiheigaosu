import { DATE_PRESETS, type CesiumMode } from '@/lib/modules/registry';
import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
}

export interface ModalStatItem {
  label: string;
  value: string;
}

export interface ModalKvCell {
  label: string;
  value: string;
  tone?: string;
  code?: string;
  colSpan?: number;
}

export interface ModalKvRow {
  cells: ModalKvCell[];
}

export interface ModalTableCell {
  text?: string;
  badge?: { text: string; tone?: string };
  action?: { label: string; previewDocName?: string };
}

export interface ModalTableRow {
  id: string;
  cells: ModalTableCell[];
}

export type ModalBlock =
  | { type: 'paragraph'; text: string; tone?: 'default' | 'muted' | 'cyan' }
  | { type: 'stats'; items: ModalStatItem[] }
  | { type: 'kvTable'; rows: ModalKvRow[] }
  | { type: 'dataTable'; headers: string[]; rows: ModalTableRow[] }
  | {
      type: 'media';
      src: string;
      alt: string;
      liveLabel: string;
      camLabel?: string;
      caption?: string;
    }
  | { type: 'resetDemoFooter'; hint: string; buttonLabel: string };

export interface ModalState {
  open: boolean;
  title: string;
  blocks?: ModalBlock[];
}

export interface P1LayersState {
  satellite: boolean;
  uav: boolean;
  bim: boolean;
  models: boolean;
  pois: boolean;
  sections: boolean;
  route: boolean;
}

export interface MeasureBridgeState {
  period: string;
  overviewCaliber: '已确认计量' | '全部申报金额';
  overviewStatus: string;
  overviewPage: number;
  sectionContract: string;
  sectionItem: string;
  sectionSelectedId: string;
  physFallbackSecId: string;
  physItemFilter: string;
  physSelectedItem: string;
  rawStatus: string;
  rawPayStatus: string;
  rawKeyword: string;
  rawSelectedId: string;
  rawPage: number;
}

export const DEFAULT_MEASURE_BRIDGE: MeasureBridgeState = {
  period: '2026年11月',
  overviewCaliber: '已确认计量',
  overviewStatus: '',
  overviewPage: 1,
  sectionContract: '',
  sectionItem: '',
  sectionSelectedId: 'sec2',
  physFallbackSecId: 'sec2',
  physItemFilter: '',
  physSelectedItem: '路基土方',
  rawStatus: '',
  rawPayStatus: '',
  rawKeyword: '',
  rawSelectedId: 'JL-A2-202611-018',
  rawPage: 1,
};

interface PlatformStoreState {
  activeSectionId: string | null;
  selectedDate: string;
  cesiumMode: CesiumMode;
  cesiumReady: boolean;
  selectedPoiId: string;
  poiDetailVisible: boolean;
  p1Layers: P1LayersState;
  measureBridge: MeasureBridgeState;
  aiDrawerOpen: boolean;
  cmdkOpen: boolean;
  modal: ModalState;
  toasts: ToastItem[];
  hydrated: boolean;

  hydrateSession: () => void;
  setActiveSectionId: (secId: string | null) => void;
  toggleSectionId: (secId: string) => string | null;
  setSelectedDate: (date: string) => void;
  setCesiumMode: (mode: CesiumMode) => void;
  setCesiumReady: (ready: boolean) => void;
  setSelectedPoiId: (poiId: string) => void;
  setPoiDetailVisible: (visible: boolean) => void;
  toggleP1Layer: (key: keyof P1LayersState) => void;
  patchMeasureBridge: (partial: Partial<MeasureBridgeState>) => void;
  resetMeasureBridge: () => void;
  setAiDrawerOpen: (open: boolean) => void;
  setCmdkOpen: (open: boolean) => void;
  openModal: (title: string, blocks: ModalBlock[]) => void;
  closeModal: () => void;
  showToast: (message: string) => void;
  dismissToast: (id: string) => void;
  resetDemoState: () => number;
}

const SESSION_KEY = 'jihei_next_v1_session';

function saveSession(partial: {
  activeSectionId: string | null;
  selectedDate: string;
  p1Layers: P1LayersState;
}) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(SESSION_KEY, JSON.stringify(partial));
  } catch {
    // ignore storage errors
  }
}

export const usePlatformStore = create<PlatformStoreState>((set, get) => ({
  activeSectionId: null,
  selectedDate: '2026-11-25',
  cesiumMode: 'interactive',
  cesiumReady: false,
  selectedPoiId: 'bridgeA',
  poiDetailVisible: true,
  p1Layers: {
    satellite: false,
    uav: true,
    bim: false,
    models: true,
    pois: true,
    sections: true,
    route: true,
  },
  measureBridge: { ...DEFAULT_MEASURE_BRIDGE },
  aiDrawerOpen: false,
  cmdkOpen: false,
  modal: { open: false, title: '' },
  toasts: [],
  hydrated: false,

  hydrateSession: () => {
    if (typeof window === 'undefined' || get().hydrated) return;
    try {
      const rawText = window.localStorage.getItem(SESSION_KEY);
      if (!rawText) {
        set({ hydrated: true });
        return;
      }
      const parsed = JSON.parse(rawText) as {
        activeSectionId?: unknown;
        selectedDate?: unknown;
        p1Layers?: Partial<Record<keyof P1LayersState, unknown>>;
      };

      const updates: Partial<PlatformStoreState> = { hydrated: true };
      if (parsed.activeSectionId === null) {
        updates.activeSectionId = null;
      } else if (
        typeof parsed.activeSectionId === 'string' &&
        /^sec[1-6]$/.test(parsed.activeSectionId)
      ) {
        updates.activeSectionId = parsed.activeSectionId;
      }

      if (
        typeof parsed.selectedDate === 'string' &&
        DATE_PRESETS.some((d) => d.date === parsed.selectedDate)
      ) {
        updates.selectedDate = parsed.selectedDate;
      }

      if (parsed.p1Layers && typeof parsed.p1Layers === 'object') {
        const current = get().p1Layers;
        const nextLayers: P1LayersState = { ...current };
        (Object.keys(current) as Array<keyof P1LayersState>).forEach((k) => {
          if (typeof parsed.p1Layers?.[k] === 'boolean') {
            nextLayers[k] = parsed.p1Layers[k] as boolean;
          }
        });
        updates.p1Layers = nextLayers;
      }

      set(updates);
    } catch {
      set({ hydrated: true });
    }
  },

  setActiveSectionId: (secId) => {
    set({ activeSectionId: secId });
    const s = get();
    saveSession({ activeSectionId: secId, selectedDate: s.selectedDate, p1Layers: s.p1Layers });
  },

  toggleSectionId: (secId) => {
    const next = get().activeSectionId === secId ? null : secId;
    get().setActiveSectionId(next);
    return next;
  },

  setSelectedDate: (date) => {
    set({ selectedDate: date });
    const s = get();
    saveSession({ activeSectionId: s.activeSectionId, selectedDate: date, p1Layers: s.p1Layers });
  },

  setCesiumMode: (mode) => set({ cesiumMode: mode }),
  setCesiumReady: (ready) => set({ cesiumReady: ready }),
  setSelectedPoiId: (poiId) => set({ selectedPoiId: poiId, poiDetailVisible: true }),
  setPoiDetailVisible: (visible) => set({ poiDetailVisible: visible }),

  toggleP1Layer: (key) => {
    const nextLayers = { ...get().p1Layers, [key]: !get().p1Layers[key] };
    set({ p1Layers: nextLayers });
    const s = get();
    saveSession({ activeSectionId: s.activeSectionId, selectedDate: s.selectedDate, p1Layers: nextLayers });
  },

  patchMeasureBridge: (partial) =>
    set((s) => ({
      measureBridge: { ...s.measureBridge, ...partial },
    })),

  resetMeasureBridge: () => set({ measureBridge: { ...DEFAULT_MEASURE_BRIDGE } }),

  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  setCmdkOpen: (open) => set({ cmdkOpen: open }),

  openModal: (title, blocks) => set({ modal: { open: true, title, blocks } }),

  closeModal: () => set({ modal: { open: false, title: '' } }),

  showToast: (message) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    set((s) => ({ toasts: [...s.toasts.slice(-4), { id, message }] }));
    if (typeof window !== 'undefined') {
      window.setTimeout(() => {
        get().dismissToast(id);
      }, 2600);
    }
  },

  dismissToast: (id) =>
    set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),

  resetDemoState: () => {
    let cleared = 0;
    if (typeof window !== 'undefined') {
      try {
        const toDel: string[] = [];
        for (let i = 0; i < window.localStorage.length; i++) {
          const k = window.localStorage.key(i);
          if (k && (k.startsWith('jihei_proto_v1_') || k.startsWith('jihei_next_v1_'))) {
            toDel.push(k);
          }
        }
        toDel.forEach((k) => window.localStorage.removeItem(k));
        cleared = toDel.length;
      } catch {
        // ignore
      }
    }
    set({
      activeSectionId: null,
      selectedDate: '2026-11-25',
      selectedPoiId: 'bridgeA',
      poiDetailVisible: true,
      p1Layers: {
        satellite: false,
        uav: true,
        bim: false,
        models: true,
        pois: true,
        sections: true,
        route: true,
      },
      measureBridge: { ...DEFAULT_MEASURE_BRIDGE },
      modal: { open: false, title: '' },
    });
    return cleared;
  },
}));
