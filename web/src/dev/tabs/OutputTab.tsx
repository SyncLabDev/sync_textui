import { useMemo, useState } from 'react'
import { useDevStore } from '../devStore'
import { generateLuaHold, generateLuaShow, generateLuaUpdate } from '../mockData'

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

type SnippetKind = 'show' | 'update' | 'hold'

/** OUTPUT tab — copyable Lua snippets generated from the live design model. */
export function OutputTab() {
  const { design, config, resetConfig } = useDevStore()
  const [kind, setKind] = useState<SnippetKind>('show')
  const [copied, setCopied] = useState(false)

  const snippets: Record<SnippetKind, string> = useMemo(
    () => ({
      show: generateLuaShow(design),
      update: generateLuaUpdate(design),
      hold: generateLuaHold(design),
    }),
    [design],
  )

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snippets[kind])
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      /* clipboard unavailable */
    }
  }

  return (
    <>
      <Section index={1} title="Lua output">
        <div className="dev-segmented" style={{ marginBottom: 10 }}>
          {(['show', 'update', 'hold'] as const).map((k) => (
            <button
              key={k}
              type="button"
              className={kind === k ? 'active' : ''}
              onClick={() => setKind(k)}
            >
              {k}
            </button>
          ))}
        </div>
        <pre className="dev-code">{snippets[kind]}</pre>
        <div className="dev-btn-row" style={{ marginTop: 10 }}>
          <button type="button" className="dev-btn primary" onClick={copy}>
            {copied ? '✓ Copied' : `Copy ${kind}`}
          </button>
        </div>
      </Section>

      <Section index={2} title="Current design">
        <pre className="dev-code">
          {JSON.stringify(
            {
              id: design.id,
              channel: design.channel,
              priority: design.priority,
              key: design.key,
              icon: design.icon || null,
              text: design.text,
              position: design.position,
              theme: design.theme,
              animation: design.animation,
              mode: design.mode,
              state: design.state,
              progress: design.progress,
              scale: design.scale,
            },
            null,
            2,
          )}
        </pre>
      </Section>

      <Section index={3} title="Config">
        <pre className="dev-code">{JSON.stringify(config, null, 2)}</pre>
        <div className="dev-btn-row" style={{ marginTop: 10 }}>
          <button type="button" className="dev-btn danger" onClick={resetConfig}>
            Reset configuration
          </button>
        </div>
      </Section>
    </>
  )
}
