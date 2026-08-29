import type {
  Animation,
  Interaction,
  InteractionMode,
  InteractionState,
  Position,
  Theme,
  UiConfig,
} from './interaction'

export type NuiMessage =
  | { action: 'hydrate'; payload: { interactions: Interaction[]; config: Partial<UiConfig> } }
  | { action: 'show'; payload: Interaction }
  | { action: 'hide'; payload: { id: string } }
  | { action: 'update'; payload: { id: string; changes: Partial<Interaction> } }
  | { action: 'setState'; payload: { id: string; state: InteractionState } }
  | { action: 'setProgress'; payload: { id: string; progress: number } }
  | { action: 'hideChannel'; payload: { channel: string } }
  | { action: 'hideAll'; payload?: Record<string, never> }
  | { action: 'setConfig'; payload: Partial<UiConfig> }

export interface ShowPayload {
  id?: string
  channel?: string
  priority?: number
  key?: string | number
  icon?: string
  image?: string
  text?: string
  description?: string
  position?: Position
  offset?: { x?: number; y?: number }
  theme?: Theme
  animation?: Animation
  mode?: InteractionMode
  state?: InteractionState
  progress?: number
  scale?: number
  disabled?: boolean
  metadata?: Record<string, string | number>
}
