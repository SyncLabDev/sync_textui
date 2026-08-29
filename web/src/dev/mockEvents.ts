import type { Interaction, Position, Theme, UiConfig } from '../types/interaction'

/**
 * Mock NUI event emitters. These construct real MessageEvent objects that are
 * dispatched through the production window listener — the dev console drives
 * the same store and renderer as FiveM, only the transport differs.
 */

export function emitNuiAction(action: string, payload: unknown) {
  window.dispatchEvent(
    new MessageEvent('message', { data: { action, payload } }),
  )
}

export function mockShow(partial: Partial<Interaction>): void {
  emitNuiAction('show', partial)
}

export function mockUpdate(id: string, changes: Partial<Interaction>): void {
  emitNuiAction('update', { id, changes })
}

export function mockSetState(id: string, state: string): void {
  emitNuiAction('setState', { id, state })
}

export function mockSetProgress(id: string, progress: number): void {
  emitNuiAction('setProgress', { id, progress })
}

export function mockHide(id: string): void {
  emitNuiAction('hide', { id })
}

export function mockHideChannel(channel: string): void {
  emitNuiAction('hideChannel', { channel })
}

export function mockHideAll(): void {
  emitNuiAction('hideAll', {})
}

export function mockSetConfig(config: Partial<UiConfig>): void {
  emitNuiAction('setConfig', config)
}

/** Stack stress: N interactions across channels/priorities at one position. */
export function mockStack(count: number, position: Position, theme: Theme): void {
  for (let i = 0; i < count; i++) {
    mockShow({
      id: `dev_stack_${i}`,
      channel: i % 2 === 0 ? 'world' : 'vehicle',
      priority: 10 - i,
      order: i,
      key: ['E', 'G', 'H', 'X', 'F', 'Z'][i % 6],
      icon: ['car', 'door-open', 'wrench', 'lock', 'fuel', 'shop'][i % 6],
      text: `Stacked Interaction ${i + 1}`,
      description: `Priority ${10 - i} — channel ${i % 2 === 0 ? 'world' : 'vehicle'}`,
      position,
      theme,
    })
  }
}

/** Priority test: deliberately shuffled priorities to verify ordering. */
export function mockPriorityTest(position: Position, theme: Theme): void {
  const cases = [
    { id: 'dev_pri_a', priority: 1, text: 'Information (p1)' },
    { id: 'dev_pri_b', priority: 10, text: 'Door Interaction (p10)' },
    { id: 'dev_pri_c', priority: 5, text: 'Generic Zone (p5)' },
    { id: 'dev_pri_d', priority: 8, text: 'Garage Interaction (p8)' },
  ]
  for (const c of cases) {
    mockShow({
      id: c.id,
      priority: c.priority,
      order: 0,
      key: 'E',
      text: c.text,
      position,
      theme,
    })
  }
}

/** Rapid show/hide stress. */
export function mockRapidShowHide(iterations: number): void {
  for (let i = 0; i < iterations; i++) {
    setTimeout(() => {
      mockShow({ id: 'dev_rapid', text: `Rapid ${i}`, key: 'E' })
      mockHide('dev_rapid')
    }, i * 30)
  }
}

/** Rapid update stress. */
export function mockRapidUpdate(iterations: number): void {
  for (let i = 0; i < iterations; i++) {
    setTimeout(() => {
      mockShow({ id: 'dev_rapid_update', text: `Update ${i}`, key: 'E', progress: (i / iterations) * 100 })
    }, i * 20)
  }
}

/** Long-text / long-key / no-icon edge cases. */
export function mockStressCases(): void {
  mockShow({
    id: 'dev_stress_long',
    text: 'This is an extremely long interaction text that should truncate cleanly with an ellipsis without breaking the card layout in any resolution',
    description:
      'This is an equally long description block that must wrap properly inside the full variant card and never overflow the container bounds even at the smallest supported scale and resolution.',
    key: 'SPACE',
    icon: 'alert',
  })
  mockShow({
    id: 'dev_stress_noicon',
    text: 'No icon, no key',
    position: 'bottom-left',
  })
  mockShow({
    id: 'dev_stress_longkey',
    text: 'Long key label',
    key: 'MOUSE WHEEL UP',
    position: 'bottom-right',
  })
}
