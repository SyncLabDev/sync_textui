import { describe, expect, it } from 'vitest'
import { DEFAULT_CONFIG, initialState, nuiReducer, selectVisible } from '../stores/nuiReducer'
import type { NuiMessage } from '../types/nui'

const show = (over: Record<string, unknown>) =>
  ({ action: 'show', payload: { id: 'x', text: 'Hello', ...over } }) as NuiMessage

describe('nuiReducer', () => {
  it('adds and updates by id', () => {
    let state = nuiReducer(initialState, show({}))
    expect(state.interactions.size).toBe(1)
    state = nuiReducer(state, { action: 'update', payload: { id: 'x', changes: { text: 'Bye' } } })
    expect(state.interactions.get('x')?.text).toBe('Bye')
    expect(state.interactions.size).toBe(1)
  })

  it('clamps progress and rejects malformed payloads', () => {
    let state = nuiReducer(initialState, show({}))
    state = nuiReducer(state, { action: 'setProgress', payload: { id: 'x', progress: 400 } })
    expect(state.interactions.get('x')?.progress).toBe(100)

    // no id -> ignored
    state = nuiReducer(state, { action: 'show', payload: { text: 'orphan' } } as never)
    expect(state.interactions.size).toBe(1)
  })

  it('rejects invalid enum values with defaults', () => {
    const state = nuiReducer(
      initialState,
      show({ position: 'nowhere', theme: 'neon', state: 'exploded', animation: 'bounce' }),
    )
    const interaction = state.interactions.get('x')
    expect(interaction?.position).toBe(DEFAULT_CONFIG.position)
    expect(interaction?.theme).toBe('sync')
    expect(interaction?.state).toBe('default')
    expect(interaction?.animation).toBe('expand')
  })

  it('sorts visible by priority desc then order asc', () => {
    let state = nuiReducer(initialState, show({ id: 'low', priority: 1 }))
    state = nuiReducer(state, show({ id: 'high', priority: 10 }))
    state = nuiReducer(state, show({ id: 'mid', priority: 5 }))
    expect(selectVisible(state).map((i) => i.id)).toEqual(['high', 'mid', 'low'])
  })

  it('hideChannel removes only that channel', () => {
    let state = nuiReducer(initialState, show({ id: 'a', channel: 'vehicle' }))
    state = nuiReducer(state, show({ id: 'b', channel: 'world' }))
    state = nuiReducer(state, { action: 'hideChannel', payload: { channel: 'vehicle' } })
    expect([...state.interactions.keys()]).toEqual(['b'])
  })

  it('strips remote images and truncates oversized text', () => {
    const state = nuiReducer(
      initialState,
      show({ image: 'https://evil.example/x.png', text: 'a'.repeat(500) }),
    )
    const interaction = state.interactions.get('x')
    expect(interaction?.image).toBeUndefined()
    expect(interaction?.text.length).toBeLessThanOrEqual(160)
  })

  it('hideAll clears everything', () => {
    let state = nuiReducer(initialState, show({}))
    state = nuiReducer(state, { action: 'hideAll', payload: {} })
    expect(state.interactions.size).toBe(0)
  })
})
