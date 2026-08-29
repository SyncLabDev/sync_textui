Sync = Sync or {}
Sync.Bridge = Sync.Bridge or {}

-- Framework selector: resolves Config.Framework (auto or manual) and defers to the
-- matching adapter. Core modules read Sync.Bridge.getFrameworkName() only.

local adapters = {
    qbox = 'qbox',
    qbcore = 'qbcore',
    esx = 'esx',
    standalone = 'standalone',
}

local resolved = Sync.ResolveFramework()

if adapters[resolved] then
    local loaded = Sync.Bridge.load({})
    loaded.framework = resolved
    Sync.Bridge.active = loaded
else
    Sync.Bridge.active = Sync.Bridge.load({})
    Sync.Bridge.active.framework = 'standalone'
end

function Sync.Bridge.getFrameworkName()
    return Sync.Bridge.active.framework
end

-- ox_lib interop -------------------------------------------------------------
-- ox_lib ships its own prompt UI (lib.showTextUI / lib.hideTextUI). ox_lib
-- auto-exports every lib.* function, so a plain export call is enough — this
-- creates NO dependency: without ox_lib running every guard below short-circuits.
--
-- Config.OxTextUI policy:
--   'coexist'  — never touch ox's UI.
--   'autoHide' — hide ox whenever a SYNC card appears (one-shot, on Show).
--   'replace'  — autoHide PLUS a continuous watchdog so ox's text prompt never
--                shows at all and SYNC is the sole text UI. Requires prompt
--                CALLERS to render via sync_textui (see README) — a script that
--                only ever calls lib.showTextUI would otherwise show nothing,
--                because global replace hides it.

-- Resolve policy, still honouring a legacy boolean Config.AutoHideOxTextUI.
local function oxPolicy()
    local p = Config.OxTextUI
    if type(p) == 'string' then return p end
    if Config.AutoHideOxTextUI == false then return 'coexist' end
    return 'autoHide'
end

local function oxSuppressionActive()
    return oxPolicy() ~= 'coexist'
end

local function oxStarted()
    return GetResourceState('ox_lib') == 'started'
end

-- Probe first so an already-closed ox UI is never re-triggered with a spam of
-- hide messages. Falls back to a direct hide if this ox_lib predates isTextUIOpen.
local function hideOxTextUI()
    if not oxStarted() then return end

    local ok, err = pcall(function()
        local isOpen = exports.ox_lib:isTextUIOpen()
        if isOpen == nil then
            -- Older ox_lib without the probe: hide unconditionally (idempotent).
            exports.ox_lib:hideTextUI()
        elseif isOpen then
            exports.ox_lib:hideTextUI()
        end
    end)
    if not ok and Config.Debug then
        print(('[sync_textui] ox_lib TextUI suppression failed: %s'):format(err))
    end
end

-- One-shot suppression, called by the state engine when a new SYNC card shows.
function Sync.Bridge.SuppressForeignTextUI()
    if not oxSuppressionActive() then return end
    hideOxTextUI()
end

local watchdogRunning = false

--- Continuous watchdog: while policy is 'replace', keeps ox's TextUI hidden so
--- SYNC is the only text prompt the player ever sees. Self-terminating: exits
--- when the policy changes. Tolerates ox_lib starting after this resource (it
--- idles at a slow tick until ox_lib is up). Started from the resource-start
--- handler, so in the default 'autoHide' config no thread runs at all.
function Sync.Bridge.StartOxTextUIWatchdog()
    if watchdogRunning then return end
    if oxPolicy() ~= 'replace' then return end

    watchdogRunning = true
    CreateThread(function()
        while oxPolicy() == 'replace' do
            if oxStarted() then
                hideOxTextUI()
                Wait(100)
            else
                Wait(1000)
            end
        end
        watchdogRunning = false
    end)
end
