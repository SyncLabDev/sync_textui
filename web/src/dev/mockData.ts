import type { Interaction } from '../types/interaction'
import { PRESETS } from './presets'

/** The live dev console design model — mirrors a Show payload and edits in place. */
export interface DevDesign {
  presetKey: string
  id: string
  channel: string
  priority: number
  key: string
  icon: string
  text: string
  description: string
  position: Interaction['position']
  theme: Interaction['theme']
  animation: Interaction['animation']
  mode: Interaction['mode']
  scale: number
  state: Interaction['state']
  progress: number
}

export function designFromPreset(presetKey: string): DevDesign {
  const preset = PRESETS.find((p) => p.key === presetKey) ?? PRESETS[0]
  return {
    presetKey: preset.key,
    id: preset.interaction.id ?? 'dev_custom',
    channel: preset.interaction.channel ?? 'interaction',
    priority: preset.interaction.priority ?? 5,
    key: preset.interaction.key ?? 'E',
    icon: preset.interaction.icon ?? '',
    text: preset.interaction.text,
    description: preset.interaction.description ?? '',
    position: preset.interaction.position ?? 'center-left',
    theme: preset.interaction.theme ?? 'sync',
    animation: preset.interaction.animation ?? 'expand',
    mode: 'auto',
    scale: 1,
    state: 'default',
    progress: 0,
  }
}

/** Convert the design model into a Show payload for mock dispatch. */
export function designToShowPayload(design: DevDesign): Partial<Interaction> {
  return {
    id: design.id,
    channel: design.channel,
    priority: design.priority,
    key: design.key || undefined,
    icon: design.icon || undefined,
    text: design.text,
    description: design.description || undefined,
    position: design.position,
    theme: design.theme,
    animation: design.animation,
    mode: design.mode,
    scale: design.scale,
    state: design.state,
    progress: design.progress,
  }
}

/** Generate a copyable Lua snippet from the current design. */
export function generateLuaShow(design: DevDesign): string {
  const lines: string[] = []
  lines.push("exports['sync_textui']:Show({")
  lines.push(`    id = '${design.id}',`)
  if (design.channel !== 'interaction') lines.push(`    channel = '${design.channel}',`)
  if (design.priority !== 5) lines.push(`    priority = ${design.priority},`)
  if (design.key) lines.push(`    key = '${design.key}',`)
  if (design.icon) lines.push(`    icon = '${design.icon}',`)
  lines.push(`    text = '${design.text.replace(/'/g, "\\'")}',`)
  if (design.description) {
    lines.push(`    description = '${design.description.replace(/'/g, "\\'")}',`)
  }
  if (design.position !== 'center-left') lines.push(`    position = '${design.position}',`)
  if (design.theme !== 'sync') lines.push(`    theme = '${design.theme}',`)
  if (design.animation !== 'expand') lines.push(`    animation = '${design.animation}',`)
  if (design.mode !== 'auto') lines.push(`    mode = '${design.mode}',`)
  if (design.scale !== 1) lines.push(`    scale = ${design.scale},`)
  lines.push('})')
  return lines.join('\n')
}

export function generateLuaUpdate(design: DevDesign): string {
  return `exports['sync_textui']:Update('${design.id}', {\n    text = '${design.text.replace(/'/g, "\\'")}'${design.key ? `, \n    key = '${design.key}'` : ''}\n})`
}

export function generateLuaHold(design: DevDesign): string {
  return `exports['sync_textui']:Hold({\n    id = '${design.id}',\n    key = '${design.key}',${design.icon ? `\n    icon = '${design.icon}',` : ''}\n    text = '${design.text.replace(/'/g, "\\'")}',\n    description = '${design.description.replace(/'/g, "\\'")}',\n    duration = 2500,\n    onComplete = function()\n        print('done')\n    end\n})`
}
