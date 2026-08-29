export type InteractionState =
  | 'default'
  | 'active'
  | 'holding'
  | 'processing'
  | 'loading'
  | 'success'
  | 'warning'
  | 'error'
  | 'disabled'

export type Position =
  | 'top-left'
  | 'top-center'
  | 'top-right'
  | 'center-left'
  | 'center'
  | 'center-right'
  | 'bottom-left'
  | 'bottom-center'
  | 'bottom-right'

export type Animation =
  | 'expand'
  | 'fade'
  | 'slide-left'
  | 'slide-right'
  | 'slide-up'
  | 'slide-down'
  | 'scale'
  | 'pop'
  | 'none'

export type Theme = 'sync' | 'minimal' | 'glass' | 'compact'
export type InteractionMode = 'compact' | 'full' | 'auto'
export type StackDirection = 'vertical' | 'horizontal'

export interface Interaction {
  id: string
  channel: string
  priority: number
  key?: string
  icon?: string
  image?: string
  text: string
  description?: string
  position: Position
  offset?: { x: number; y: number }
  theme: Theme
  animation: Animation
  mode: InteractionMode
  state: InteractionState
  progress: number
  scale: number
  disabled: boolean
  metadata?: Record<string, string | number>
  order: number
}

export interface UiConfig {
  theme: Theme
  position: Position
  animation: Animation
  mode: InteractionMode
  scale: number
  reduceMotion: boolean
  highContrast: boolean
  maxVisible: number
  stackDirection: StackDirection
  stackSpacing: number
}
