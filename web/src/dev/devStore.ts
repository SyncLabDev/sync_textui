import { create } from 'zustand'
import type { DevDesign } from './mockData'
import { designFromPreset } from './mockData'
import { DEFAULT_DEV_CONFIG } from './presets'
import type { UiConfig } from '../types/interaction'

/** Dev console design model + global UI config (dev-only store, not part of production state). */
export interface DevStore {
  design: DevDesign
  config: UiConfig
  setDesign: (patch: Partial<DevDesign>) => void
  loadPreset: (presetKey: string) => void
  setConfig: (patch: Partial<UiConfig>) => void
  resetConfig: () => void
}

export const useDevStore = create<DevStore>((set) => ({
  design: designFromPreset('garage'),
  config: { ...DEFAULT_DEV_CONFIG },
  setDesign: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),
  loadPreset: (presetKey) => set({ design: designFromPreset(presetKey) }),
  setConfig: (patch) => set((s) => ({ config: { ...s.config, ...patch } })),
  resetConfig: () => set({ config: { ...DEFAULT_DEV_CONFIG } }),
}))

export interface DevUiState {
  devViewVisible: boolean
  consoleVisible: boolean
  activeTab: 'design' | 'state' | 'test' | 'output'
  consoleSide: 'left' | 'right'
  viewMode: 'gameplay' | 'neutral' | 'transparent'
  devControls: boolean
  resolution: { width: number; height: number }
  viewportScale: number
  showSafeZone: boolean
  showGrid: boolean
  showCenterLines: boolean
}

interface DevUiStore extends DevUiState {
  set: (patch: Partial<DevUiState>) => void
}

const STORAGE_KEY = 'sync_textui_dev_ui'

function loadPersisted(): Partial<DevUiState> {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    return raw ? (JSON.parse(raw) as Partial<DevUiState>) : {}
  } catch {
    return {}
  }
}

function persist() {
  try {
    const snapshot = useDevUiStore.getState()
    const { set: _set, ...persistable } = snapshot
    void _set
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(persistable))
  } catch {
    /* storage unavailable */
  }
}

/** View/console chrome state, persisted per browser session (never in FiveM). */
export const useDevUiStore = create<DevUiStore>((set) => ({
  devViewVisible: true,
  consoleVisible: true,
  activeTab: 'design',
  consoleSide: 'right',
  viewMode: 'gameplay',
  devControls: true,
  resolution: { width: 1920, height: 1080 },
  viewportScale: 1,
  showSafeZone: false,
  showGrid: false,
  showCenterLines: false,
  ...loadPersisted(),
  set: (patch) => {
    set(patch)
    persist()
  },
}))
