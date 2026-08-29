Sync = Sync or {}

Config = {}

-- Framework: 'auto' | 'qbox' | 'qbcore' | 'esx' | 'standalone'
Config.Framework = 'auto'

-- Enables /synctextui in-game playground. Keep false on production servers.
Config.DeveloperMode = false

-- Defaults (each may be overridden per interaction)
Config.DefaultTheme = 'sync'            -- sync | minimal | glass | compact
Config.DefaultPosition = 'center-left'
Config.DefaultAnimation = 'expand'      -- expand | fade | slide-* | scale | pop | none
Config.DefaultMode = 'auto'             -- compact | full | auto

-- Accessibility
Config.Scale = 1.0                      -- global UI scale, clamped 0.5..2.0
Config.ReduceMotion = false
Config.HighContrast = false

-- Stack
Config.MaxVisible = 5                   -- 1..20
Config.StackDirection = 'vertical'      -- vertical | horizontal
Config.StackSpacing = 8                 -- px, 0..48

-- Hold
Config.HoldUpdateInterval = 50          -- ms between hold progress messages

-- Security
Config.AllowRemoteImages = false        -- remote image URLs are rejected unless enabled

-- Debug logging
Config.Debug = false

-- ox_lib interop: ox_lib ships its own prompt UI (lib.showTextUI). Choose how
-- SYNC coexists with it. No-op when ox_lib is not installed.
--   'coexist'  — never touch ox's UI.
--   'autoHide' — hide ox whenever a SYNC card appears (lightweight, on Show).
--   'replace'  — ox's text prompt is kept hidden at ALL times and SYNC becomes
--                the only text UI. Use this to fully replace ox_lib's prompt,
--                and point your prompt-driving scripts at exports['sync_textui']
--                (drop-in showTextUI / hideTextUI) so their text still renders.
Config.OxTextUI = 'autoHide'
