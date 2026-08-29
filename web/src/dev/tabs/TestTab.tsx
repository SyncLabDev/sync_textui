import { useDevUiStore } from '../devStore'
import { useDevStore } from '../devStore'
import {
  mockHide,
  mockHideAll,
  mockPriorityTest,
  mockRapidShowHide,
  mockRapidUpdate,
  mockSetState,
  mockShow,
  mockStack,
  mockStressCases,
  mockUpdate,
} from '../mockEvents'
import { designToShowPayload } from '../mockData'

function Section({ index, title, children }: { index: number; title: string; children: React.ReactNode }) {
  return (
    <div className="dev-section">
      <div className="dev-section-title">
        <span>{String(index).padStart(2, '0')}</span> {title}
      </div>
      {children}
    </div>
  )
}

const RESOLUTIONS = [
  { label: '720p', width: 1280, height: 720 },
  { label: '1080p', width: 1920, height: 1080 },
  { label: '1440p', width: 2560, height: 1440 },
  { label: 'Ultrawide', width: 3440, height: 1440 },
  { label: '4K', width: 3840, height: 2160 },
]

const SCALES = [1, 0.75, 0.5]

/** TEST tab — viewport, overlays, backgrounds, stack tests, events, stress. */
export function TestTab() {
  const ui = useDevUiStore()
  const { design } = useDevStore()

  const aspect = (ui.resolution.width / ui.resolution.height).toFixed(2)

  return (
    <>
      <Section index={1} title="Viewport">
        <div className="dev-btn-row">
          {RESOLUTIONS.map((r) => (
            <button
              key={r.label}
              type="button"
              className={`dev-btn${ui.resolution.width === r.width ? ' primary' : ''}`}
              onClick={() => ui.set({ resolution: { width: r.width, height: r.height } })}
            >
              {r.label}
            </button>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 10.5, color: '#5a6478' }}>
          {ui.resolution.width}×{ui.resolution.height} · AR {aspect}
        </p>
        <div className="dev-field" style={{ marginTop: 10 }}>
          <label className="dev-field-label">Preview scale</label>
          <div className="dev-segmented">
            {SCALES.map((s) => (
              <button
                key={s}
                type="button"
                className={ui.viewportScale === s ? 'active' : ''}
                onClick={() => ui.set({ viewportScale: s })}
              >
                {Math.round(s * 100)}%
              </button>
            ))}
          </div>
        </div>
      </Section>

      <Section index={2} title="Overlays">
        <div className="dev-btn-row">
          <button
            type="button"
            className={`dev-btn${ui.showSafeZone ? ' primary' : ''}`}
            onClick={() => ui.set({ showSafeZone: !ui.showSafeZone })}
          >
            Safe zone
          </button>
          <button
            type="button"
            className={`dev-btn${ui.showGrid ? ' primary' : ''}`}
            onClick={() => ui.set({ showGrid: !ui.showGrid })}
          >
            10% grid
          </button>
          <button
            type="button"
            className={`dev-btn${ui.showCenterLines ? ' primary' : ''}`}
            onClick={() => ui.set({ showCenterLines: !ui.showCenterLines })}
          >
            Center lines
          </button>
        </div>
      </Section>

      <Section index={3} title="Background">
        <div className="dev-segmented">
          {(['gameplay', 'neutral', 'transparent'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              className={ui.viewMode === mode ? 'active' : ''}
              onClick={() => ui.set({ viewMode: mode })}
            >
              {mode}
            </button>
          ))}
        </div>
        <p style={{ margin: '8px 0 0', fontSize: 10.5, color: '#5a6478' }}>
          Transparent shows the production checkerboard — the real NUI body stays transparent in FiveM.
        </p>
      </Section>

      <Section index={4} title="Stack test">
        <div className="dev-btn-row">
          {[1, 2, 3, 5, 10].map((count) => (
            <button
              key={count}
              type="button"
              className="dev-btn"
              onClick={() => mockStack(count, design.position, design.theme)}
            >
              Spawn {count}
            </button>
          ))}
          <button type="button" className="dev-btn danger" onClick={() => mockHideAll()}>
            Clear
          </button>
        </div>
        <div className="dev-btn-row" style={{ marginTop: 8 }}>
          <button
            type="button"
            className="dev-btn"
            onClick={() => mockPriorityTest(design.position, design.theme)}
          >
            Priority ordering test
          </button>
        </div>
      </Section>

      <Section index={5} title="Events">
        <div className="dev-btn-row">
          <button type="button" className="dev-btn" onClick={() => mockShow(designToShowPayload(design))}>
            Show
          </button>
          <button
            type="button"
            className="dev-btn"
            onClick={() => mockUpdate(design.id, { text: `${design.text} (updated)` })}
          >
            Update
          </button>
          <button type="button" className="dev-btn" onClick={() => mockSetState(design.id, 'success')}>
            Success
          </button>
          <button type="button" className="dev-btn" onClick={() => mockSetState(design.id, 'error')}>
            Error
          </button>
          <button type="button" className="dev-btn" onClick={() => mockHide(design.id)}>
            Hide
          </button>
          <button type="button" className="dev-btn danger" onClick={() => mockHideAll()}>
            Hide all
          </button>
        </div>
      </Section>

      <Section index={6} title="Stress">
        <div className="dev-btn-row">
          <button type="button" className="dev-btn" onClick={() => mockStressCases()}>
            Edge cases
          </button>
          <button type="button" className="dev-btn" onClick={() => mockRapidShowHide(20)}>
            Rapid show/hide ×20
          </button>
          <button type="button" className="dev-btn" onClick={() => mockRapidUpdate(30)}>
            Rapid update ×30
          </button>
        </div>
      </Section>
    </>
  )
}
