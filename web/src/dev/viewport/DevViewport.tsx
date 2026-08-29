import { useEffect, useState, type ReactNode } from 'react'
import { useDevUiStore } from '../devStore'
import './viewport.css'

/**
 * Simulated game viewport: renders the production tree inside a frame at the
 * selected resolution, fit-scaled to the browser window. Overlays (safe zone,
 * grid, center lines) live in the same scaled coordinate space as the runtime,
 * so measurements remain true at every preview scale.
 */
export function DevViewport({ children }: { children: ReactNode }) {
  const resolution = useDevUiStore((s) => s.resolution)
  const viewportScale = useDevUiStore((s) => s.viewportScale)
  const viewMode = useDevUiStore((s) => s.viewMode)
  const showSafeZone = useDevUiStore((s) => s.showSafeZone)
  const showGrid = useDevUiStore((s) => s.showGrid)
  const showCenterLines = useDevUiStore((s) => s.showCenterLines)
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  })

  useEffect(() => {
    const onResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fit = Math.min(windowSize.width / resolution.width, windowSize.height / resolution.height)
  const scale = fit * viewportScale

  return (
    <div className="sync-viewport">
      <div className={`sync-viewport-bg sync-viewport-bg-${viewMode}`}>
        <div
          className="sync-frame"
          style={{
            width: resolution.width,
            height: resolution.height,
            transform: `scale(${scale})`,
          }}
        >
          {/* Production runtime renders here — identical tree to FiveM. */}
          {children}

          {showSafeZone && <div className="sync-overlay sync-overlay-safe" />}
          {showGrid && <div className="sync-overlay sync-overlay-grid" />}
          {showCenterLines && (
            <>
              <div className="sync-overlay sync-overlay-center-x" />
              <div className="sync-overlay sync-overlay-center-y" />
            </>
          )}
        </div>
      </div>
      <div className="sync-viewport-status">
        {resolution.width}×{resolution.height} · {Math.round(scale * 100)}% · {viewMode}
      </div>
    </div>
  )
}
