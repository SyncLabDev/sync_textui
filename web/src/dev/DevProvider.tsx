import { useEffect, type ReactNode } from 'react'
import { DeveloperConsole } from './DeveloperConsole/DeveloperConsole'
import { DevViewport } from './viewport/DevViewport'
import { useDevUiStore } from './devStore'

/**
 * Dev-only layer wrapping the production tree. DEV VIEW shows the simulated
 * viewport frame + console; GAME VIEW (F2) renders the runtime full-window with
 * zero dev chrome. Never mounted in FiveM builds.
 */
export function DevProvider({ children }: { children: ReactNode }) {
  const devViewVisible = useDevUiStore((s) => s.devViewVisible)
  const consoleVisible = useDevUiStore((s) => s.consoleVisible)
  const consoleSide = useDevUiStore((s) => s.consoleSide)
  const devControls = useDevUiStore((s) => s.devControls)
  const set = useDevUiStore((s) => s.set)

  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if (event.key === 'F2') {
        event.preventDefault()
        set({ devViewVisible: !useDevUiStore.getState().devViewVisible })
      }
      if (event.ctrlKey && event.shiftKey && event.key.toLowerCase() === 'd') {
        event.preventDefault()
        set({ consoleVisible: !useDevUiStore.getState().consoleVisible })
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [set])

  if (!devViewVisible) {
    // GAME VIEW: production runtime only, nothing dev-related on screen.
    return <>{children}</>
  }

  return (
    <>
      <DevViewport>{children}</DevViewport>
      {devControls && consoleVisible && <DeveloperConsole />}
      {devControls && !consoleVisible && (
        <div
          className={`sync-console-handle ${consoleSide === 'left' ? 'handle-left' : 'handle-right'}`}
          title="Restore console (Ctrl+Shift+D)"
          onClick={() => set({ consoleVisible: true })}
        >
          SYNC
        </div>
      )}
    </>
  )
}
