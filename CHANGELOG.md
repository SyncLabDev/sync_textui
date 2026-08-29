# Changelog

All notable changes to SYNC TextUI are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [2.1.0] — 2026-08-30

### Added

- **In-game playground menu** — `/synctextui` opens a clickable preset panel (bottom-right) rendered by a small inert-by-default production component; clicking spawns presets through the real engine, `Esc`/X closes and releases focus. The menu refuses to open when the NUI page is not live, so input can never be captured without visible UI. `/synctextui_preview` toggles all sample cards focus-free.
- **NUI boot sentinel** — a classic inline script reports page load and every uncaught JS error/rejection to the game console (`NUI page loaded (UA: ...)`, `NUI PAGE ERROR: ...`), making blank-overlay issues self-diagnosing.
- **ox_lib interop** — `Config.OxTextUI` policy (`'coexist' | 'autoHide' | 'replace'`, default `'autoHide'`): ox_lib's own TextUI (`lib.showTextUI`) is hidden when SYNC cards are on screen (`autoHide`), or kept hidden at all times by a lightweight watchdog so SYNC can be the server's sole prompt UI (`replace`). Every path is guarded by resource state — servers without ox_lib are untouched and the resource still has zero dependencies.
- **In-game playground presets** now spawn on the dedicated `dev` channel, so toggling the preview off always clears it.

### Fixed

- **The entire NUI rendered nothing in FiveM (root cause of every "no UI / no menu" report).** Vite built with the default absolute `base: '/'`, so `index.html` requested `/assets/...` which FiveM resolves against the resource root instead of `web/dist/` — every hashed asset 404'd in-game while the browser preview worked, hiding the bug from QA. Builds now use a relative base (and a `chrome100` target matching FiveM's CEF); the boot sentinel reports the exact failing URL if this class of issue ever returns.
- **`/synctextui` froze player input with no visible menu.** The command captured NUI focus and sent a `playground` message to a dev panel that intentionally never ships in the in-game bundle — input was swallowed while nothing rendered. The playground now previews interactions through the live renderer without ever touching `SetNuiFocus`.
- **Partial updates clobbered untouched fields (engine-level).** `SetState`, `SetProgress`, `SetMode` and `SetOutcome` merged the *fully defaulted* normalized shape into the stored interaction, silently resetting `channel` (breaking `HideChannel`), `priority` (corrupting stack order during holds) and `text` (blanking cards on outcome). Only the keys the caller actually provided are applied now.
- **Silent failure modes made visible** — `/synctextui` reports in chat + console how many presets landed on screen, warns when the NUI bundle never initialized (`web/dist` missing or stale), and a new `/synctextui_status` command prints developer mode / NUI ready / framework / ox_lib / visible interactions / holds for instant diagnosis. A 60s hydration safety net also re-pushes state if the page's init handshake is ever missed on slow loads.


## [2.0.0] — 2026-08-29

Ground-up rebuild against the SYNC TextUI production master specification. No code carried over from 0.1.x.

### Added

- **Interaction engine** — full lifecycle (`show → active → holding → processing → outcome → hide`) with 9 states, 3 modes (`compact` / `full` / `auto`) and state-driven auto expansion.
- **Public API** — `Show`, `Update`, `Hide`, `SetState`, `SetProgress`, `SetMode`, `SetOutcome`, `HideChannel`, `HideAll`, `IsVisible`, `Hold`, `CancelHold`, plus drop-in compatibility exports (`showTextUI`, `hideTextUI`, `TextUI`, `HideTextUI`).
- **Hold system** — duration holds with `onStart/onProgress/onCancel/onComplete`, release/move cancellation, integer-percent throttled progress, on-demand scheduler that exits with the last session.
- **Stacking** — vertical/horizontal stacks, priority ordering with stable ties, `MaxVisible` cap enforced before dispatch, scoped channels.
- **Positioning** — 9 anchors, per-interaction offset and scale, `Config.Scale` global multiplier.
- **Themes** — `sync` (signature default), `minimal`, `glass`, `compact` as token variations of one geometry, plus high-contrast and reduced-motion modes.
- **Animations** — `expand`, `fade`, four slides, `scale`, `pop`, `none`; transform/opacity only.
- **Key mapping** — centralized control-id ↔ label map (`38 → E`) verified against the FiveM controls reference, with deterministic reverse lookup for hold watching.
- **Validation** — length caps, enum allowlists, numeric clamps, remote-image rejection on both the Lua and TypeScript boundaries; no HTML rendering path exists.
- **NUI init handshake** — the React tree announces readiness and the client hydrates race-free; no fixed-timer guessing.
- **Developer workstation (browser)** — DESIGN / STATE / TEST / OUTPUT console driving the real production renderer through real message events: presets, searchable icon picker, position grid, state flow playback, viewport simulation 720p→4K, safe-zone/grid/center overlays, backgrounds, stack spawner, priority test, event simulator, stress runs, generated Lua output. `F2` dev/game view, `Ctrl+Shift+D` console, session-persisted layout.
- **Production isolation** — the entire dev layer is a dynamic import eliminated at build time; release bundles contain zero developer code (asserted in QA checklist).
- **Tooling** — TypeScript strict, ESLint, Vitest (reducer contract + Lua codegen), Fengari-based Lua suite runner (`tests/run.lua`, `lua tests/run.lua` or `node tests/run_node.js`).

### Changed

- Versioning scheme moved to 2.x per project directive.

[Unreleased]: https://github.com/fr4gout/sync_textui/compare/v2.1.0...HEAD
[2.1.0]: https://github.com/fr4gout/sync_textui/releases/tag/v2.1.0
[2.0.0]: https://github.com/fr4gout/sync_textui/releases/tag/v2.0.0
