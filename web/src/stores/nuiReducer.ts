import type {
  Animation,
  Interaction,
  InteractionMode,
  InteractionState,
  Position,
  Theme,
  UiConfig,
} from '../types/interaction'
import type { NuiMessage, PlaygroundPreset } from '../types/nui'

// Mirror of the Lua-side validation limits (shared/constants.lua).
const LIMITS = {
  id: 64,
  text: 160,
  description: 280,
  key: 24,
  icon: 64,
  channel: 32,
  image: 128,
  metadataEntries: 8,
  metadataValue: 64,
} as const

export const STATES: InteractionState[] = [
  'default', 'active', 'holding', 'processing',
  'loading', 'success', 'warning', 'error', 'disabled',
]

export const POSITIONS: Position[] = [
  'top-left', 'top-center', 'top-right',
  'center-left', 'center', 'center-right',
  'bottom-left', 'bottom-center', 'bottom-right',
]

export const ANIMATIONS: Animation[] = [
  'expand', 'fade', 'slide-left', 'slide-right',
  'slide-up', 'slide-down', 'scale', 'pop', 'none',
]

export const THEMES: Theme[] = ['sync', 'minimal', 'glass', 'compact']
export const MODES: InteractionMode[] = ['compact', 'full', 'auto']

const stateSet = new Set<string>(STATES)
const positionSet = new Set<string>(POSITIONS)
const animationSet = new Set<string>(ANIMATIONS)
const themeSet = new Set<string>(THEMES)
const modeSet = new Set<string>(MODES)

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value))

const str = (value: unknown, max: number): string | undefined => {
  if (typeof value !== 'string') return undefined
  const trimmed = value.trim()
  if (!trimmed) return undefined
  return trimmed.length > max ? trimmed.slice(0, max) : trimmed
}

/** Remote images are rejected unless a local-safe path is provided. */
const safeImage = (value: unknown): string | undefined => {
  const path = str(value, LIMITS.image)
  if (!path) return undefined
  if (/^https?:\/\//i.test(path)) return undefined
  return path
}

const safeMetadata = (
  value: unknown,
): Record<string, string | number> | undefined => {
  if (!value || typeof value !== 'object') return undefined
  const entries = Object.entries(value as Record<string, unknown>).slice(
    0,
    LIMITS.metadataEntries,
  )
  const out: Record<string, string | number> = {}
  for (const [k, v] of entries) {
    const key = str(k, LIMITS.channel)
    if (!key) continue
    if (typeof v === 'number' && Number.isFinite(v)) {
      out[key] = v
    } else if (typeof v === 'string') {
      const s = str(v, LIMITS.metadataValue)
      if (s) out[key] = s
    }
  }
  return Object.keys(out).length > 0 ? out : undefined
}

export const DEFAULT_CONFIG: UiConfig = {
  theme: 'sync',
  position: 'center-left',
  animation: 'expand',
  mode: 'auto',
  scale: 1,
  reduceMotion: false,
  highContrast: false,
  maxVisible: 5,
  stackDirection: 'vertical',
  stackSpacing: 8,
}

const safeConfig = (value: unknown): Partial<UiConfig> => {
  if (!value || typeof value !== 'object') return {}
  const v = value as Record<string, unknown>
  const out: Partial<UiConfig> = {}
  const theme = str(v.theme, 16)
  if (theme && themeSet.has(theme)) out.theme = theme as Theme
  const position = str(v.position, 16)
  if (position && positionSet.has(position)) out.position = position as Position
  const animation = str(v.animation, 16)
  if (animation && animationSet.has(animation)) out.animation = animation as Animation
  const mode = str(v.mode, 8)
  if (mode && modeSet.has(mode)) out.mode = mode as InteractionMode
  if (typeof v.scale === 'number' && Number.isFinite(v.scale)) {
    out.scale = clamp(v.scale, 0.5, 2)
  }
  if (typeof v.reduceMotion === 'boolean') out.reduceMotion = v.reduceMotion
  if (typeof v.highContrast === 'boolean') out.highContrast = v.highContrast
  if (typeof v.maxVisible === 'number' && Number.isFinite(v.maxVisible)) {
    out.maxVisible = clamp(Math.round(v.maxVisible), 1, 20)
  }
  if (v.stackDirection === 'vertical' || v.stackDirection === 'horizontal') {
    out.stackDirection = v.stackDirection
  }
  if (typeof v.stackSpacing === 'number' && Number.isFinite(v.stackSpacing)) {
    out.stackSpacing = clamp(v.stackSpacing, 0, 48)
  }
  return out
}

const safeInteraction = (value: unknown, fallbackOrder: number): Interaction | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const id = str(v.id, LIMITS.id)
  if (!id) return null

  const state = str(v.state, 16)
  const position = str(v.position, 16)
  const theme = str(v.theme, 16)
  const animation = str(v.animation, 16)
  const mode = str(v.mode, 8)
  const channel = str(v.channel, LIMITS.channel) ?? 'interaction'

  const offset =
    v.offset && typeof v.offset === 'object'
      ? {
          x: typeof (v.offset as Record<string, unknown>).x === 'number'
            ? clamp((v.offset as Record<string, unknown>).x as number, -500, 500)
            : 0,
          y: typeof (v.offset as Record<string, unknown>).y === 'number'
            ? clamp((v.offset as Record<string, unknown>).y as number, -500, 500)
            : 0,
        }
      : undefined

  return {
    id,
    channel,
    priority:
      typeof v.priority === 'number' && Number.isFinite(v.priority)
        ? clamp(Math.round(v.priority), -1000, 1000)
        : 0,
    key: str(v.key, LIMITS.key),
    icon: str(v.icon, LIMITS.icon),
    image: safeImage(v.image),
    text: str(v.text, LIMITS.text) ?? '',
    description: str(v.description, LIMITS.description),
    position: position && positionSet.has(position) ? (position as Position) : DEFAULT_CONFIG.position,
    offset,
    theme: theme && themeSet.has(theme) ? (theme as Theme) : DEFAULT_CONFIG.theme,
    animation:
      animation && animationSet.has(animation) ? (animation as Animation) : DEFAULT_CONFIG.animation,
    mode: mode && modeSet.has(mode) ? (mode as InteractionMode) : DEFAULT_CONFIG.mode,
    state: state && stateSet.has(state) ? (state as InteractionState) : 'default',
    progress:
      typeof v.progress === 'number' && Number.isFinite(v.progress)
        ? clamp(v.progress, 0, 100)
        : 0,
    scale:
      typeof v.scale === 'number' && Number.isFinite(v.scale) ? clamp(v.scale, 0.5, 2) : 1,
    disabled: v.disabled === true,
    metadata: safeMetadata(v.metadata),
    order:
      typeof v.order === 'number' && Number.isFinite(v.order) ? v.order : fallbackOrder,
  }
}

export interface NuiState {
  interactions: Map<string, Interaction>
  order: number
  config: UiConfig
  playground: { open: boolean; presets: PlaygroundPreset[] }
}

export const initialState: NuiState = {
  interactions: new Map(),
  order: 0,
  config: { ...DEFAULT_CONFIG },
  playground: { open: false, presets: [] },
}

const upsert = (state: NuiState, raw: unknown): NuiState => {
  const existing = state.interactions.get((raw as { id?: string })?.id ?? '')
  const order = existing ? existing.order : state.order + 1
  const interaction = safeInteraction(raw, order)
  if (!interaction) return state

  const interactions = new Map(state.interactions)
  interactions.set(interaction.id, interaction)
  return { ...state, interactions, order: Math.max(state.order, order) }
}

const applyChanges = (
  state: NuiState,
  id: string,
  changes: Record<string, unknown>,
): NuiState => {
  const existing = state.interactions.get(id)
  if (!existing) return state
  // Merge through the same validator so partial updates cannot bypass normalization.
  return upsert(state, { ...existing, ...changes, id, order: existing.order })
}

/** Presets arrive from Lua as plain data; sanitize before rendering. */
const safePreset = (value: unknown): PlaygroundPreset | null => {
  if (!value || typeof value !== 'object') return null
  const v = value as Record<string, unknown>
  const preset: PlaygroundPreset = {}
  const id = str(v.id, LIMITS.id)
  if (!id) return null
  preset.id = id
  const text = str(v.text, LIMITS.text)
  if (!text) return null
  preset.text = text
  const key = str(v.key, LIMITS.key)
  if (key) preset.key = key
  const icon = str(v.icon, LIMITS.icon)
  if (icon) preset.icon = icon
  const description = str(v.description, LIMITS.description)
  if (description) preset.description = description
  if (typeof v.hold === 'number' && Number.isFinite(v.hold)) {
    preset.hold = clamp(Math.round(v.hold), 100, 600000)
  }
  return preset
}

const applyPlayground = (state: NuiState, payload: { open: boolean; presets?: unknown }): NuiState => {
  if (payload.open !== true) {
    return { ...state, playground: { open: false, presets: [] } }
  }
  const raw = Array.isArray(payload.presets) ? payload.presets.slice(0, 12) : []
  const presets = raw.map(safePreset).filter((p): p is PlaygroundPreset => p !== null)
  return { ...state, playground: { open: true, presets } }
}

export function nuiReducer(state: NuiState, message: NuiMessage): NuiState {
  switch (message.action) {
    case 'hydrate': {
      if (!message.payload || typeof message.payload !== 'object') return state
      const list = Array.isArray(message.payload.interactions)
        ? message.payload.interactions
        : []
      let next: NuiState = {
        ...state,
        interactions: new Map(),
        order: 0,
        config: { ...state.config, ...safeConfig(message.payload.config) },
      }
      for (const raw of list) next = upsert(next, raw)
      return next
    }
    case 'show':
      return upsert(state, message.payload)
    case 'hide': {
      const id = str(message.payload?.id, LIMITS.id)
      if (!id || !state.interactions.has(id)) return state
      const interactions = new Map(state.interactions)
      interactions.delete(id)
      return { ...state, interactions }
    }
    case 'update': {
      const id = str(message.payload?.id, LIMITS.id)
      if (!id) return state
      const changes =
        message.payload?.changes && typeof message.payload.changes === 'object'
          ? (message.payload.changes as Record<string, unknown>)
          : {}
      return applyChanges(state, id, changes)
    }
    case 'setState': {
      const id = str(message.payload?.id, LIMITS.id)
      const nextState = str(message.payload?.state, 16)
      if (!id || !nextState || !stateSet.has(nextState)) return state
      return applyChanges(state, id, { state: nextState })
    }
    case 'setProgress': {
      const id = str(message.payload?.id, LIMITS.id)
      const progress = message.payload?.progress
      if (!id || typeof progress !== 'number' || !Number.isFinite(progress)) return state
      return applyChanges(state, id, { progress: clamp(progress, 0, 100) })
    }
    case 'hideChannel': {
      const channel = str(message.payload?.channel, LIMITS.channel)
      if (!channel) return state
      const interactions = new Map(state.interactions)
      let removed = false
      for (const [id, interaction] of interactions) {
        if (interaction.channel === channel) {
          interactions.delete(id)
          removed = true
        }
      }
      return removed ? { ...state, interactions } : state
    }
    case 'hideAll': {
      if (state.interactions.size === 0) return state
      return { ...state, interactions: new Map() }
    }
    case 'setConfig':
      return { ...state, config: { ...state.config, ...safeConfig(message.payload) } }
    case 'playground': {
      const payload = message.payload
      if (!payload || typeof payload !== 'object') return state
      return applyPlayground(state, payload)
    }
    default:
      return state
  }
}

/** Visible projection: sort priority desc, then order asc. Position partitioning happens at render. */
export function selectVisible(state: NuiState): Interaction[] {
  return [...state.interactions.values()].sort(
    (a, b) => b.priority - a.priority || a.order - b.order,
  )
}
