import { useEffect, useRef, useState } from 'react'
import { useDevStore } from '../devStore'
import { mockSetProgress, mockSetState, mockShow, mockHide } from '../mockEvents'
import { designToShowPayload } from '../mockData'
import { STATES } from '../../stores/nuiReducer'
import type { InteractionState } from '../../types/interaction'

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

/** STATE tab — 01 STATE grid, 02 PROGRESS, flow testing with auto-sequence. */
export function StateTab() {
  const { design } = useDevStore()
  const [autoProgress, setAutoProgress] = useState(false)
  const [playing, setPlaying] = useState(false)
  const intervalRef = useRef<number | null>(null)
  const playRef = useRef<number | null>(null)

  useEffect(() => {
    if (!autoProgress) {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
      intervalRef.current = null
      return
    }
    let value = 0
    intervalRef.current = window.setInterval(() => {
      value = (value + 2) % 101
      mockSetProgress(design.id, value)
    }, 60)
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current)
    }
  }, [autoProgress, design.id])

  useEffect(
    () => () => {
      if (playRef.current) window.clearTimeout(playRef.current)
    },
    [],
  )

  const applyState = (state: InteractionState) => {
    mockShow(designToShowPayload(design))
    mockSetState(design.id, state)
  }

  /** Flow: compact -> full -> holding -> success -> hide. */
  const playFlow = (errorFlow = false) => {
    setPlaying(true)
    const id = design.id
    mockShow(designToShowPayload(design))
    const steps: Array<[number, () => void]> = [
      [400, () => mockSetState(id, 'active')],
      [800, () => mockSetState(id, 'holding')],
    ]
    // hold ramp
    let p = 0
    const ramp = window.setInterval(() => {
      p += 7
      mockSetProgress(id, Math.min(100, p))
    }, 60)

    steps.forEach(([delay, fn]) => window.setTimeout(fn, delay))
    window.setTimeout(() => window.clearInterval(ramp), 1000)
    window.setTimeout(() => mockSetState(id, errorFlow ? 'error' : 'success'), 1100)
    window.setTimeout(() => mockHide(id), 2300)
    window.setTimeout(() => setPlaying(false), 2400)
  }

  return (
    <>
      <Section index={1} title="State">
        <div className="dev-state-grid">
          {STATES.map((state) => (
            <button
              key={state}
              type="button"
              data-state={state}
              className={design.state === state ? 'active' : ''}
              onClick={() => {
                applyState(state)
                useDevStore.getState().setDesign({ state })
              }}
            >
              {state}
            </button>
          ))}
        </div>
      </Section>

      <Section index={2} title="Progress">
        <div className="dev-field">
          <label className="dev-field-label">
            Manual <span className="dev-slider-value">{design.progress}%</span>
          </label>
          <input
            className="dev-slider"
            type="range"
            min={0}
            max={100}
            value={design.progress}
            onChange={(e) => {
              const progress = Number(e.target.value)
              useDevStore.getState().setDesign({ progress })
              mockSetProgress(design.id, progress)
            }}
          />
        </div>
        <div className="dev-btn-row">
          <button
            type="button"
            className={`dev-btn${autoProgress ? ' primary' : ''}`}
            onClick={() => setAutoProgress((v) => !v)}
          >
            {autoProgress ? 'Stop auto-progress' : 'Auto-progress loop'}
          </button>
          <button type="button" className="dev-btn" onClick={() => mockSetProgress(design.id, 0)}>
            Reset
          </button>
        </div>
      </Section>

      <Section index={3} title="Flow testing">
        <p style={{ margin: '0 0 10px', fontSize: 11, color: '#8b96a8', lineHeight: 1.5 }}>
          Compact → Active → Holding (progress ramp) → Success/Error → Hide
        </p>
        <div className="dev-btn-row">
          <button type="button" className="dev-btn primary" disabled={playing} onClick={() => playFlow(false)}>
            {playing ? 'Playing…' : '▶ Play success flow'}
          </button>
          <button type="button" className="dev-btn danger" disabled={playing} onClick={() => playFlow(true)}>
            ▶ Play error flow
          </button>
        </div>
      </Section>
    </>
  )
}
