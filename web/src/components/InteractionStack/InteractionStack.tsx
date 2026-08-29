import { useMemo } from 'react'
import { useNui } from '../../stores/NuiContext'
import { selectVisible } from '../../stores/nuiReducer'
import { TextUI } from '../TextUI/TextUI'
import type { Position } from '../../types/interaction'
import './positions.css'

const POSITION_CLASS: Record<Position, string> = {
  'top-left': 'pos-top pos-left',
  'top-center': 'pos-top pos-center-x',
  'top-right': 'pos-top pos-right',
  'center-left': 'pos-middle pos-left',
  center: 'pos-middle pos-center-x',
  'center-right': 'pos-middle pos-right',
  'bottom-left': 'pos-bottom pos-left',
  'bottom-center': 'pos-bottom pos-center-x',
  'bottom-right': 'pos-bottom pos-right',
}

/**
 * Partitions visible interactions by position, sorts by priority desc / order asc,
 * caps at MaxVisible, and renders one anchored stack per occupied position.
 */
export function InteractionStack() {
  const { state } = useNui()
  const { config } = state

  const groups = useMemo(() => {
    const visible = selectVisible(state).slice(0, config.maxVisible)
    const map = new Map<Position, typeof visible>()
    for (const interaction of visible) {
      const list = map.get(interaction.position)
      if (list) list.push(interaction)
      else map.set(interaction.position, [interaction])
    }
    return map
  }, [state, config.maxVisible])

  if (groups.size === 0) return null

  return (
    <div
      className={`sync-root${config.highContrast ? ' sync-high-contrast' : ''}`}
      data-stack-direction={config.stackDirection}
      data-reduce-motion={config.reduceMotion || undefined}
    >
      {[...groups.entries()].map(([position, interactions]) => (
        <div
          key={position}
          className={`sync-stack ${POSITION_CLASS[position]} sync-stack-${config.stackDirection}`}
          style={{ gap: config.stackSpacing }}
        >
          {interactions.map((interaction) => (
            <TextUI
              key={interaction.id}
              interaction={interaction}
              globalScale={config.scale}
            />
          ))}
        </div>
      ))}
    </div>
  )
}
