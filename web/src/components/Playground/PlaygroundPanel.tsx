import { useEffect } from 'react'
import { Icon } from '../Icon/Icon'
import { KeyBadge } from '../KeyBadge/KeyBadge'
import { useNui } from '../../stores/NuiContext'
import { fetchNui } from '../../utils/fetchNui'
import './playground.css'

/**
 * In-game playground menu (bottom-right). Inert production component: renders
 * only when Lua sends { action: 'playground', open: true }, which only happens
 * with Config.DeveloperMode = true. Clicking a preset triggers it client-side
 * via the devPreset callback; Esc / close sends devClose so Lua can release
 * NUI focus (the panel must never hold focus without being visible).
 */
export function PlaygroundPanel() {
  const { state } = useNui()
  const { open, presets } = state.playground

  useEffect(() => {
    if (!open) return
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        void fetchNui('devClose').catch(() => {})
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open])

  if (!open) return null

  const trigger = (index: number) => {
    // 1-based: the Lua side indexes PRESETS directly.
    void fetchNui('devPreset', { presetIndex: index + 1 }).catch(() => {})
  }

  return (
    <aside className="sync-playground" role="dialog" aria-label="SYNC playground">
      <header className="sync-playground-head">
        <span className="sync-playground-brand">SYNC</span>
        <span className="sync-playground-sub">Playground</span>
        <button
          type="button"
          className="sync-playground-close"
          onClick={() => void fetchNui('devClose').catch(() => {})}
          aria-label="Close playground"
        >
          ×
        </button>
      </header>
      <ul className="sync-playground-list">
        {presets.map((preset, index) => (
          <li key={preset.id ?? index}>
            <button type="button" className="sync-playground-item" onClick={() => trigger(index)}>
              <span className="sync-playground-icon">
                <Icon name={preset.icon} size={18} />
              </span>
              <span className="sync-playground-copy">
                <span className="sync-playground-text">{preset.text}</span>
                {preset.description ? (
                  <span className="sync-playground-desc">{preset.description}</span>
                ) : null}
              </span>
              {preset.hold ? <span className="sync-playground-tag">HOLD</span> : null}
              <KeyBadge label={preset.key} />
            </button>
          </li>
        ))}
      </ul>
      <footer className="sync-playground-foot">
        Click a preset to spawn it · Esc closes · holds auto-run
      </footer>
    </aside>
  )
}
