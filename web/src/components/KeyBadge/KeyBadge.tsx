import { memo } from 'react'

interface KeyBadgeProps {
  label?: string
  state?: string
}

/**
 * The signature keycap — dark raised surface with a subtle top highlight and a
 * 1px press travel during holds. Motion lives in textui.css so reduced-motion
 * is respected by media query and config alike.
 */
export const KeyBadge = memo(function KeyBadge({ label, state = 'default' }: KeyBadgeProps) {
  if (!label) return null
  return (
    <span className="sync-keycap" data-state={state} aria-hidden="true">
      {label}
    </span>
  )
})
