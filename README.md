# SYNC TextUI

A framework-independent interaction UI engine for FiveM. Not a notification system, not a cropped `[E] Interact` label — a full prompt lifecycle: **show → active → holding → progress → outcome → hide**, with stacking, priorities, channels, themes and a browser developer workstation that drives the real production renderer.

Part of the [SYNC Lab] ecosystem. Free, MIT, no telemetry, no licensing hooks, no external dependencies at runtime.

---

## Features

- **9 interaction states** — `default · active · holding · processing · loading · success · warning · error · disabled`
- **3 modes** — `compact` (keycap-first), `full` (context card), `auto` (state-driven switching)
- **Hold system** — duration-based holds with `onStart/onProgress/onCancel/onComplete` callbacks, release/move cancellation, throttled progress
- **Manual progress** via `SetProgress`, clamped 0–100
- **Stacking** — vertical/horizontal, `MaxVisible` cap, per-position groups, **shared priority ordering** (higher first, stable ties)
- **Channels** — scoped cleanup with `HideChannel` without touching other systems
- **9 screen positions** + per-interaction offset and scale
- **4 themes** — `sync` (signature, default) · `minimal` · `glass` · `compact`
- **8 animations** — `expand · fade · slide-left · slide-right · slide-up · slide-down · scale · pop` (+ `none`), transform/opacity only
- **Accessibility** — `prefers-reduced-motion` + `Config.ReduceMotion`, `Config.HighContrast`, `Config.Scale`
- **Developer workstation** (browser) — DESIGN / STATE / TEST / OUTPUT tabs, live viewport at 720p → 4K, overlays, stress tests, real event simulation, copyable Lua
- **Compatibility exports** — drop-in `showTextUI / hideTextUI / TextUI / HideTextUI`
- **Local-only assets** — bundled fonts (Rajdhani, Space Grotesk) and a curated Lucide icon registry; no CDNs, no remote fetches

## Requirements

- FiveM server (fx_version `cerulean`, Lua 5.4)
- Node.js ≥ 18 only if you rebuild the NUI bundle — `web/dist` ships prebuilt

## Installation

1. Place this folder in your resources directory as `sync_textui`.
2. Add `ensure sync_textui` to `server.cfg` (after your framework, if any).
3. Restart the server. No SQL, no API keys, no dependencies.

## Framework support

`Config.Framework = 'auto'` detects **Qbox** (`qbx_core`) → **QBCore** (`qb-core`) → **ESX** (`es_extended`) → **standalone**. Manual override accepts `'qbox' | 'qbcore' | 'esx' | 'standalone'`. The engine itself is framework-free; bridges contain compatibility only.

## Quick start

```lua
exports['sync_textui']:Show({
    id = 'garage',
    key = 'E',
    icon = 'car',
    text = 'Open Garage',
    description = 'Legion Parking',
})
```

```lua
exports['sync_textui']:Hide('garage')
```

## API

| Export | Description |
| --- | --- |
| `Show(data)` | Create or replace an interaction. Identical payloads are suppressed (no NUI traffic, no re-render). |
| `Update(id, changes)` | Partial update. Only changed fields dispatch. |
| `Hide(id)` | Remove one interaction. |
| `SetState(id, state)` | One of the 9 states. |
| `SetProgress(id, progress)` | 0–100, clamped. |
| `SetMode(id, mode)` | `compact`, `full` or `auto`. |
| `SetOutcome(id, state, ms, hideAfter)` | Timed terminal state (success/error), then restore or hide. |
| `HideChannel(channel)` | Remove every interaction on a channel. |
| `HideAll()` | Clear everything. |
| `IsVisible(id)` | Boolean probe. |
| `Hold(options)` | Begin a hold interaction (below). |
| `CancelHold(id)` | Cancel an active hold. |

### Data model

```lua
{
    id = 'armory',            -- required, ≤64 chars
    channel = 'police',       -- default 'interaction'
    priority = 8,             -- -1000..1000, default 0
    key = 'E',                -- label, or FiveM control id: key = 38
    icon = 'shield',          -- registry name (see below) or nil
    text = 'Open Armory',     -- ≤160
    description = 'Badge required',  -- ≤280
    position = 'center-left', -- any of the 9 anchors
    offset = { x = 0, y = 0 },
    theme = 'sync',           -- sync | minimal | glass | compact
    animation = 'expand',
    mode = 'auto',            -- compact | full | auto
    state = 'default',
    progress = 0,
    scale = 1.0,              -- 0.5..2.0
    disabled = false,
    metadata = { ['Ammo'] = 32 },  -- ≤8 entries, rendered inline
}
```

### States

`default → active → holding → processing → success | warning | error`, plus `loading` and `disabled`. State changes never remount the card — styling transitions only.

### Modes

- **compact** — keycap + text, minimal footprint
- **full** — adds description and metadata block
- **auto** — compact by default; expands while `holding`, `processing` or `loading`

### Hold interactions

```lua
exports['sync_textui']:Hold({
    id = 'repair',
    key = 'E',
    icon = 'wrench',
    text = 'Repair Vehicle',
    description = 'Hold to repair',
    duration = 2500,
    cancelOnRelease = true,
    cancelOnMove = true,
    onStart = function() end,
    onProgress = function(pct) end,
    onCancel = function() end,
    onComplete = function() print('repaired') end,
})
```

Callbacks are client-side Lua functions; they are validated with `pcall` and never serialized to the NUI. The scheduler thread exists only while at least one hold is running.

### Keys

String labels pass through (`'E'`, `'SPACE'`, `'F10'`, `'MOUSE LEFT'`), and FiveM control ids resolve automatically (`38 → E`). The canonical mapping lives in [client/keymap.lua](client/keymap.lua).

### Icons

A curated, locally-bundled Lucide registry (see [web/src/components/Icon/Icon.tsx](web/src/components/Icon/Icon.tsx)): `car · wrench · door-open · lock · lock-open · fuel · shop · heart · shield · hammer · package · key · cpu · info · alert · check · x · weapon · phone · map · battery`. Unknown names render nothing rather than falling back to emoji or remote requests. Remote `image` URLs are rejected unless `Config.AllowRemoteImages = true`.

### Stacking, priority, channels

Interactions sharing a position form one stack. Higher `priority` renders first; equal priorities keep insertion order. `Config.MaxVisible` caps what the NUI may show (excess interactions are never dispatched). `channel` lets whole systems clean up at once:

```lua
exports['sync_textui']:HideChannel('vehicle')
```

### Themes, animations, accessibility

`sync` is the default and the signature. Motion respects `prefers-reduced-motion` and `Config.ReduceMotion`. `Config.HighContrast` strengthens surfaces and borders for readability. `Config.Scale` (0.5–2.0) is multiplied by per-interaction `scale`.

## Browser development

```bash
cd web
npm install
npm run dev
```

The dev server boots the **same reducer and renderer** used in FiveM — developer actions dispatch real `MessageEvent`s through the production message path.

| Shortcut | Action |
| --- | --- |
| `F2` | Toggle DEV VIEW ↔ GAME VIEW (no reload, no state loss) |
| `Ctrl+Shift+D` | Show / hide the console panel |

- **DESIGN** — presets, text, key, icon, theme, animation, mode, scale, 3×3 position grid
- **STATE** — 9-state grid, manual + auto progress, success/error flow playback
- **TEST** — viewport presets (720p → 4K), preview scales, safe-zone/grid/center overlays, backgrounds, stack spawner, priority test, event simulator, stress runs
- **OUTPUT** — copyable `Show` / `Update` / `Hold` Lua generated from the live design

Console layout, tab, viewport and overlay choices persist via `sessionStorage`. All dev modules are tree-shaken from production builds — `npm run build` emits a bundle containing zero developer code (verified by the QA checklist).

Scripts: `npm run dev · build · preview · typecheck · lint · test`.

## In-game playground

Set `Config.DeveloperMode = true` and run `/synctextui` in-game:

- **Menu** — a clickable preset panel appears bottom-right; click a preset to spawn it through the real renderer, press `Esc` (or the X, or run `/synctextui` again) to close. Input focus is held only while the menu is open, and the menu refuses to open — with an explicit `dist(...)` diagnostic — if the NUI page isn't live, so input can never be captured without visible UI.
- **`/synctextui_preview`** — focus-free alternative: toggles all four sample cards (including an auto-running hold) on screen without stealing input.
- **`/synctextui_status`** — one-line report: developer mode, NUI ready, menu state, framework, ox_lib, `web/dist` file check, visible interactions.

A boot sentinel in the page reports load and any JS error to the game console (`[sync_textui] NUI PAGE ERROR: ...`) — paste that line when troubleshooting a blank overlay.

Disabled by default; keep it off in production. The full browser workstation console (`npm run dev`) remains browser-only by design — zero dev-console code ships in `web/dist`.

## Migrating from simple TextUI scripts

```lua
-- Before
exports['legacy_textui']:showTextUI('Press E to interact')
exports['legacy_textui']:hideTextUI()

-- After (drop-in)
exports['sync_textui']:showTextUI('Press E to interact')
exports['sync_textui']:hideTextUI()
```

Compat calls update a reserved interaction in place (they never stack). For real multi-prompt support, move to `Show/Hide` with explicit ids.

### Fully replacing ox_lib's prompt (`lib.showTextUI`)

Set `Config.OxTextUI = 'replace'`, then repoint the scripts that drive prompts. Two options, pick per script:

```lua
-- Option A: same call, different resource (minimal edit)
-- Before:
exports.ox_lib:showTextUI('[E] Open Garage', { position = 'left-center' })
exports.ox_lib:hideTextUI()
-- After:
exports['sync_textui']:showTextUI('[E] Open Garage')
exports['sync_textui']:hideTextUI()

-- Option B: if a script imports the lib, its lib.showTextUI still targets ox_lib,
-- so edit those calls to the sync_textui export above. 'replace' hides any ox
-- prompt that slips through, but the TEXT only appears if the script calls SYNC.
```

`'replace'` guarantees the player never sees ox's prompt; it does **not** auto-forward the text, so a script must call `sync_textui` to have its prompt visible at all.

### Worked example: qbx_garages

Its zones prompt through `lib.showTextUI` in `client/main.lua` (search for `showTextUI` — two `onEnter` / `onExit` pairs). Repoint them to full designed cards:

```lua
onEnter = function()
    if accessPoint.dropPoint and cache.vehicle then return end
    local isDepot = garage.type == GarageType.DEPOT
    exports['sync_textui']:Show({
        id = 'qbx_garage_zone',
        key = 'E',
        icon = isDepot and 'shield' or 'car',
        text = isDepot and locale('info.impound_e')
            or (cache.vehicle and locale('info.park_e') or locale('info.car_e')),
        description = garage.label,
    })
end,
onExit = function()
    exports['sync_textui']:Hide('qbx_garage_zone')
end,
```

Drop the baked-in `"E - "` prefixes from `locales/en.json` (`"car_e": "Open Garage", …`) — SYNC draws the keycap itself. Restart the script; the prompt now renders as a SYNC card, and ox's TextUI is never called from it.

## Performance

The runtime is event-driven:

- No permanent `CreateThread`/`Wait(0)` loop — the hold scheduler spawns only while holds exist and exits when the last one ends. (Exception: `Config.OxTextUI = 'replace'` runs one 100 ms probe-only watchdog while it is the active policy; default modes run no loop.)
- Duplicate suppression in Lua: byte-identical interaction payloads never reach the NUI.
- Progress messages are emitted only when the displayed integer percentage changes.
- React renders are memoized per interaction; a state change touches exactly one card.
- Entry animations are transform/opacity only.

Idle overhead should be effectively zero; measure in your own environment with `resmonitor` rather than trusting any absolute claim.

## Troubleshooting

| Symptom | Fix |
| --- | --- |
| Nothing renders in-game | Ensure `web/dist` exists (ships built; or run `npm run build` in `web/`). On any F8 log line `NUI PAGE ERROR: resource load failed @ SCRIPT:...`, the asset URL in it names a build/deploy path issue — the built `index.html` must reference `./assets/...` (relative), which `npm run build` produces |
| Wrong framework detected | Set `Config.Framework` manually |
| `/synctextui` does nothing / no cards | Requires `Config.DeveloperMode = true` + resource restart. Run `/synctextui_status` (F8 console): `nuiReady: false` means `web/dist` is missing/incomplete — re-copy the folder; `visible: 4` with no cards means the game is running a stale bundle — `restart sync_textui` |
| Hold never completes | `key` as an unrecognized control id — check [client/keymap.lua](client/keymap.lua) |
| Icon missing | Name must exist in the local registry (see above) |
| Dev console visible in-game | Set `Config.DeveloperMode = false` (browser dev view is unrelated and safe) |

## FAQ

**Does it need a server component?** No. Everything is client + NUI.
**Can two resources drive the same id?** Last writer wins per update; ids are the coordination key.
**Is remote HTML/script ever rendered?** Never. Text fields are plain strings; there is no `dangerouslySetInnerHTML` anywhere in the codebase.
**What about ox_lib?** SYNC TextUI never depends on it — it runs identically with or without ox_lib installed. ox_lib ships its own prompt UI (`lib.showTextUI`); control how they coexist with `Config.OxTextUI`:
- `'coexist'` — leave ox's UI alone.
- `'autoHide'` (default) — hide ox's prompt the moment a SYNC card appears.
- `'replace'` — ox's text prompt is kept hidden at all times and SYNC becomes the only text UI. Set this to fully replace ox_lib's prompt; point your prompt-driving scripts at `exports['sync_textui']:showTextUI / :hideTextUI` (drop-in, same call shape) so their text renders through SYNC.

## License

MIT — see [LICENSE](LICENSE).
