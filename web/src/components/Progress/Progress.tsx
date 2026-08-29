import { memo } from 'react'

interface ProgressProps {
  value: number
  state?: string
}

/** Transform/width-only progress line — no layout thrash. */
export const Progress = memo(function Progress({ value, state = 'default' }: ProgressProps) {
  return (
    <div className="sync-progress" data-state={state} role="progressbar" aria-valuenow={Math.round(value)}>
      <div className="sync-progress-fill" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  )
})
