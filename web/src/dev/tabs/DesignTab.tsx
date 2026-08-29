import { useDevStore } from '../devStore'
import { PRESETS } from '../presets'
import { mockShow } from '../mockEvents'
import { designToShowPayload } from '../mockData'
import { useDevUiStore } from '../devStore'
import { ANIMATIONS, MODES, POSITIONS, THEMES } from '../../stores/nuiReducer'
import { ICON_NAMES } from '../../components/Icon/Icon'
import { useMemo, useState } from 'react'

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

/** DESIGN tab — 01 INTERACTION, 02 INPUT, 03 APPEARANCE, 04 POSITION. */
export function DesignTab() {
  const { design, setDesign, loadPreset } = useDevStore()
  const ui = useDevUiStore()
  const [iconSearch, setIconSearch] = useState('')

  const filteredIcons = useMemo(
    () =>
      iconSearch
        ? ICON_NAMES.filter((name) => name.includes(iconSearch.toLowerCase()))
        : ICON_NAMES,
    [iconSearch],
  )

  const pushLive = () => mockShow(designToShowPayload(design))

  return (
    <>
      <Section index={1} title="Interaction">
        <div className="dev-field">
          <label className="dev-field-label">Preset</label>
          <select
            className="dev-select"
            value={design.presetKey}
            onChange={(e) => {
              loadPreset(e.target.value)
            }}
          >
            {PRESETS.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </div>
        <div className="dev-field">
          <label className="dev-field-label">Title</label>
          <input
            className="dev-input"
            value={design.text}
            maxLength={160}
            onChange={(e) => setDesign({ text: e.target.value })}
          />
        </div>
        <div className="dev-field">
          <label className="dev-field-label">Description</label>
          <textarea
            className="dev-textarea"
            value={design.description}
            maxLength={280}
            onChange={(e) => setDesign({ description: e.target.value })}
          />
        </div>
        <div className="dev-row">
          <div className="dev-field">
            <label className="dev-field-label">ID</label>
            <input
              className="dev-input"
              value={design.id}
              maxLength={64}
              onChange={(e) => setDesign({ id: e.target.value })}
            />
          </div>
          <div className="dev-field">
            <label className="dev-field-label">Priority</label>
            <input
              className="dev-input"
              type="number"
              min={-1000}
              max={1000}
              value={design.priority}
              onChange={(e) => setDesign({ priority: Number(e.target.value) || 0 })}
            />
          </div>
        </div>
      </Section>

      <Section index={2} title="Input">
        <div className="dev-field">
          <label className="dev-field-label">Key</label>
          <div className="dev-btn-row">
            {['E', 'F', 'G', 'H', 'X', 'Z', 'SPACE', 'SHIFT', 'ESC', 'MOUSE LEFT', 'MOUSE RIGHT', 'WHEEL UP'].map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  className={`dev-btn${design.key === key ? ' primary' : ''}`}
                  onClick={() => setDesign({ key })}
                >
                  {key}
                </button>
              ),
            )}
          </div>
        </div>
        <div className="dev-field">
          <label className="dev-field-label">Icon — search ({filteredIcons.length})</label>
          <input
            className="dev-input"
            placeholder="Search icons…"
            value={iconSearch}
            onChange={(e) => setIconSearch(e.target.value)}
          />
        </div>
        <div className="dev-icon-grid">
          <button
            type="button"
            className={!design.icon ? 'active' : ''}
            onClick={() => setDesign({ icon: '' })}
            title="No icon"
          >
            ⃠
          </button>
          {filteredIcons.map((name) => (
            <button
              key={name}
              type="button"
              className={design.icon === name ? 'active' : ''}
              title={name}
              onClick={() => setDesign({ icon: name })}
            >
              {name.slice(0, 2)}
            </button>
          ))}
        </div>
      </Section>

      <Section index={3} title="Appearance">
        <div className="dev-row">
          <div className="dev-field">
            <label className="dev-field-label">Theme</label>
            <select
              className="dev-select"
              value={design.theme}
              onChange={(e) => setDesign({ theme: e.target.value as typeof design.theme })}
            >
              {THEMES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="dev-field">
            <label className="dev-field-label">Animation</label>
            <select
              className="dev-select"
              value={design.animation}
              onChange={(e) => setDesign({ animation: e.target.value as typeof design.animation })}
            >
              {ANIMATIONS.map((a) => (
                <option key={a} value={a}>{a}</option>
              ))}
            </select>
          </div>
        </div>
        <div className="dev-field">
          <label className="dev-field-label">Mode</label>
          <div className="dev-segmented">
            {MODES.map((m) => (
              <button
                key={m}
                type="button"
                className={design.mode === m ? 'active' : ''}
                onClick={() => setDesign({ mode: m })}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
        <div className="dev-field">
          <label className="dev-field-label">
            Scale <span className="dev-slider-value">{design.scale.toFixed(2)}×</span>
          </label>
          <input
            className="dev-slider"
            type="range"
            min={0.5}
            max={2}
            step={0.05}
            value={design.scale}
            onChange={(e) => setDesign({ scale: Number(e.target.value) })}
          />
        </div>
      </Section>

      <Section index={4} title="Position">
        <div className="dev-position-grid">
          {POSITIONS.map((position) => (
            <button
              key={position}
              type="button"
              title={position}
              className={design.position === position ? 'active' : ''}
              onClick={() => {
                setDesign({ position })
                ui.set({ resolution: ui.resolution })
              }}
            />
          ))}
        </div>
      </Section>

      <button type="button" className="dev-btn primary" style={{ width: '100%' }} onClick={pushLive}>
        Push to viewport
      </button>
    </>
  )
}
