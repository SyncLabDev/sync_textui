# QA Checklist — SYNC TextUI 2.0.0

Verified against the production acceptance matrix. Items requiring a live FiveM client are marked ⏸ (environment-blocked) with the exact check to perform in-game.

## Automated (green)

| Gate | Result |
| --- | --- |
| `npm run typecheck` (TS strict) | ✅ 0 errors |
| `npm run lint` | ✅ 0 errors / 0 warnings |
| `npm test` (Vitest: reducer contract + Lua codegen) | ✅ 10/10 |
| `lua tests/run.lua` (validation / keymap / state / dedupe / channels / hydrate) | ✅ 17/17 |
| `npm run build` | ✅ JS 162 kB (52 kB gzip), CSS 12 kB (3 kB gzip) |
| All client Lua files parse | ✅ 8/8 |

## Production isolation (green, verified in this build)

- [x] `grep` for `sync-console`, `dev-section`, `Developer Console` in `dist/` → **no matches** (JS and CSS)
- [x] Dev layer reachable only via `import.meta.env.DEV && isEnvBrowser()` dynamic import
- [x] No `dangerouslySetInnerHTML` anywhere in `web/src`
- [x] NUI body transparent; no full-screen backdrop in production CSS

## Runtime behavior (browser-verified via Playwright)

- [x] Real reducer renders pushed mock events (same message path as FiveM)
- [x] Keycap + icon + text compact card renders at center-left
- [x] STATE tab: 9-state grid applies visual state to the live card (success border observed)
- [x] Auto-progress loop dispatches throttled progress
- [x] Flow playback: compact → holding → success → hide
- [x] Stack spawn + priority ordering test
- [x] Stress: rapid show/hide, rapid update, edge cases (long text/key, no icon)
- [x] Viewport presets, preview scale, background modes, status readout
- [x] `F2` DEV → GAME: all chrome removed, interaction state preserved, transparent bg
- [x] `F2` GAME → DEV: restores instantly, no reload, layout persisted (sessionStorage)
- [x] Console collapse → edge handle → restore
- [x] OUTPUT tab snippets reflect live design; quote escaping covered by tests

## ⏸ Requires live FiveM (perform before public release)

### Core
- [ ] Standalone server: Show/Hide/Update round-trip
- [ ] Qbox server: same, `auto` detects `qbx_core`
- [ ] QBCore server: same
- [ ] ESX server: same
- [ ] Manual `Config.Framework` override respected

### Interaction quality
- [ ] `key = 38` renders `E` in-game
- [ ] Hold with `cancelOnMove` cancels when the ped walks away
- [ ] `IsControlPressed` suppression during hold does not leak after resource stop
- [ ] Resource restart → no ghost UI, clean hydrate on NUI init handshake
- [ ] NUI focus never captured during normal prompts (mouse stays in game)

### Performance (measure, don't assume)
- [ ] Idle resmon `0.00 ms` frames with 0 interactions (expect: no permanent threads)
- [ ] 10 rapid duplicate `Show` calls per frame → CPU flat, no NUI spam
- [ ] Hold active → single scheduler thread visible, terminates on completion
- [ ] `resmonitor` capture attached to release notes

### Rendering
- [ ] 720p / 1080p / 1440p / ultrawide / 4K in-game pass
- [ ] `prefers-reduced-motion` equivalent via `Config.ReduceMotion = true`
- [ ] High contrast pass at scale 0.75 and 2.0

## Sign-off criteria

Release-ready when every ⏸ item is checked in-game with results appended here. The browser matrix and all automated gates are currently green.
