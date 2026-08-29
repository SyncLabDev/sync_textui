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
