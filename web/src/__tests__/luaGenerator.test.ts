import { describe, expect, it } from 'vitest'
import { generateLuaHold, generateLuaShow, designFromPreset } from '../dev/mockData'

describe('Lua generator', () => {
  it('escapes single quotes in text', () => {
    const design = designFromPreset('custom')
    design.text = "Biker's Bar"
    const lua = generateLuaShow(design)
    expect(lua).toContain("text = 'Biker\\'s Bar'")
  })

  it('omits fields equal to their defaults', () => {
    const design = designFromPreset('garage')
    const lua = generateLuaShow(design)
    // garage preset: center-left + sync + expand are defaults -> not emitted
    expect(lua).not.toContain('position =')
    expect(lua).not.toContain('theme =')
    expect(lua).not.toContain('animation =')
    expect(lua).toContain("exports['sync_textui']:Show({")
  })

  it('generates a valid hold snippet with duration and callback', () => {
    const design = designFromPreset('repair')
    const lua = generateLuaHold(design)
    expect(lua).toContain('exports[\'sync_textui\']:Hold({')
    expect(lua).toContain('duration = 2500,')
    expect(lua).toContain('onComplete = function()')
  })
})
