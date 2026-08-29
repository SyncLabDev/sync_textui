import { type ComponentType } from 'react'
import { useDevUiStore } from '../devStore'
import { DesignTab } from '../tabs/DesignTab'
import { StateTab } from '../tabs/StateTab'
import { TestTab } from '../tabs/TestTab'
import { OutputTab } from '../tabs/OutputTab'
import './console.css'

const TABS = [
  { key: 'design', label: 'DESIGN' },
  { key: 'state', label: 'STATE' },
  { key: 'test', label: 'TEST' },
  { key: 'output', label: 'OUTPUT' },
] as const

/** Four-tab dev workstation: DESIGN / STATE / TEST / OUTPUT, side-by-side with the viewport. */
export function DeveloperConsole() {
  const ui = useDevUiStore()

  if (!ui.consoleVisible) return null

  const sideClass = ui.consoleSide === 'left' ? 'console-left' : 'console-right'

  const tabContent: Record<(typeof TABS)[number]['key'], ComponentType> = {
    design: DesignTab,
    state: StateTab,
    test: TestTab,
    output: OutputTab,
  }
  const TabContent = tabContent[ui.activeTab]

  return (
    <aside className={`sync-console ${sideClass}`}>
      <header className="sync-console-header">
        <span className="sync-console-brand">SYNC</span>
        <span className="sync-console-sub">TextUI Developer Console</span>
        <button
          type="button"
          className="sync-console-collapse"
          title="Toggle console (Ctrl+Shift+D)"
          onClick={() => ui.set({ consoleVisible: false })}
        >
          ┃
        </button>
      </header>

      <nav className="sync-console-tabs" role="tablist">
        {TABS.map((tab, index) => (
          <button
            key={tab.key}
            type="button"
            role="tab"
            aria-selected={ui.activeTab === tab.key}
            className={`sync-console-tab${ui.activeTab === tab.key ? ' active' : ''}`}
            onClick={() => ui.set({ activeTab: tab.key })}
          >
            <span className="tab-index">{String(index + 1).padStart(2, '0')}</span> {tab.label}
          </button>
        ))}
      </nav>

      <div className="sync-console-body">
        <TabContent />
      </div>

      <footer className="sync-console-footer">
        <span>F2 — toggle DEV/GAME view</span>
        <button type="button" onClick={() => ui.set({ consoleSide: ui.consoleSide === 'left' ? 'right' : 'left' })}>
          {ui.consoleSide === 'left' ? 'Move right →' : '← Move left'}
        </button>
      </footer>
    </aside>
  )
}
