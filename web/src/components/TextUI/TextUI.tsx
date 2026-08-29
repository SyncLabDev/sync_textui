import { memo } from 'react'
import type { Interaction, InteractionMode } from '../../types/interaction'
import { KeyBadge } from '../KeyBadge/KeyBadge'
import { Icon } from '../Icon/Icon'
import { Progress } from '../Progress/Progress'
import './textui.css'

interface TextUIProps {
  interaction: Interaction
  globalScale: number
}

const effectiveMode = (mode: InteractionMode, state: Interaction['state']): 'compact' | 'full' => {
  if (mode === 'compact') return 'compact'
  if (mode === 'full') return 'full'
  // auto: progress-bearing / long content expands, plain prompts stay compact
  if (state === 'holding' || state === 'processing' || state === 'loading') return 'full'
  return 'compact'
}

/**
 * A single interaction card. Memoized on the interaction object identity —
 * state changes only touch the affected card, never the whole stack.
 */
export const TextUI = memo(function TextUI({
  interaction,
  globalScale,
}: TextUIProps) {
  const {
    id, key, icon, image, text, description, state, progress,
    scale, disabled, mode,
  } = interaction
  const variant = effectiveMode(mode, state)
  const showProgress = state === 'holding' || state === 'processing' || state === 'loading'

  return (
    <div
      id={`sync-interaction-${id}`}
      className={`sync-card sync-theme-${interaction.theme} sync-anim-${interaction.animation}`}
      data-state={state}
      data-variant={variant}
      data-disabled={disabled || undefined}
      style={{ transform: `scale(${scale * globalScale})` }}
      role="status"
    >
      <div className="sync-card-main">
        <KeyBadge label={key} state={state} />
        {icon && !image && <Icon name={icon} size={16} />}
        {image && <img className="sync-card-image" src={image} alt="" draggable={false} />}
        <span className="sync-card-text">{text}</span>
      </div>
      {variant === 'full' && description && (
        <div className="sync-card-description">{description}</div>
      )}
      {showProgress && <Progress value={progress} state={state} />}
    </div>
  )
})
