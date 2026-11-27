import type { CesiumMode } from '@/lib/modules/registry';
import { create } from 'zustand';

export interface ToastItem {
  id: string;
  message: string;
}

export interface ModalState {
  open: boolean;
  title: string;
  htmlBody?: string;
  reactKey?: string;
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

interface PlatformStoreState {
  activeSectionId: string | null;
  selectedDate: string;
  cesiumMode: CesiumMode;
  cesiumReady: boolean;
  selectedPoiId: string;
  poiDetailVisible: boolean;
  p1Layers: P1LayersState;
  aiDrawerOpen: boolean;
  cmdkOpen: boolean;
  modal: ModalState;
  toasts: ToastItem[];

  setActiveSectionId: (secId: string | null) => void;
  toggleSectionId: (secId: string) => string | null;
  setSelectedDate: (date: string) => void;
  setCesiumMode: (mode: CesiumMode) => void;
  setCesiumReady: (ready: boolean) => void;
  setSelectedPoiId: (poiId: string) => void;
  setPoiDetailVisible: (visible: boolean) => void;
  toggleP1Layer: (key: keyof P1LayersState) => void;
  setAiDrawerOpen: (open: boolean) => void;
  setCmdkOpen: (open: boolean) => void;
  openModalHtml: (title: string, htmlBody: string) => void;
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
  aiDrawerOpen: false,
  cmdkOpen: false,
  modal: { open: false, title: '' },
  toasts: [],

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

  setAiDrawerOpen: (open) => set({ aiDrawerOpen: open }),
  setCmdkOpen: (open) => set({ cmdkOpen: open }),

  openModalHtml: (title, htmlBody) =>
    set({ modal: { open: true, title, htmlBody } }),

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
      modal: { open: false, title: '' },
    });
    return cleared;
  },
}));
