# Changelog

All notable changes to SYNC TextUI are documented here. This project follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and semantic versioning.

## [Unreleased]

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

[Unreleased]: https://github.com/fr4gout/sync_textui/compare/v2.0.0...HEAD
[2.0.0]: https://github.com/fr4gout/sync_textui/releases/tag/v2.0.0
