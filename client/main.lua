Sync = Sync or {}

-- Lifecycle: init, hydration, and cleanup. Registered dev commands live in developer.lua.

local resourceStarted = false

-- Set once the React tree has mounted and announced itself via the init
-- callback. Exposed so the playground/status command can tell "Lua accepted the
-- interactions" apart from "the NUI bundle never loaded" (missing web/dist).
Sync.NuiReady = false

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    Sync.State.Reset()

    print(('[sync_textui] v%s started (framework: %s)'):format(GetResourceMetadata(GetCurrentResourceName(), 'version', 0) or '2.1.1', Sync.Bridge.getFrameworkName()))

    -- 'replace' policy spins up the continuous ox TextUI watchdog; other modes
    -- run no thread (per-card suppression happens inline on Show).
    Sync.Bridge.StartOxTextUIWatchdog()
end)

-- The NUI announces itself once the React tree has mounted; hydration is then
-- race-free and the fallback timer is unnecessary.
RegisterNUICallback('init', function(_, cb)
    Sync.State.Hydrate()
    resourceStarted = true
    Sync.NuiReady = true
    print('[sync_textui] NUI ready — hydrated')
    cb({ ok = true })
end)

-- Boot sentinel (inline classic script in index.html): proves the CEF page is
-- actually loading and surfaces JS crashes that happen before React mounts.
RegisterNUICallback('nuiBoot', function(data, cb)
    print(('[sync_textui] NUI page loaded (UA: %s)'):format(tostring(data and data.ua)))
    cb({ ok = true })
end)

RegisterNUICallback('nuiError', function(data, cb)
    print(('[sync_textui] NUI PAGE ERROR: %s @ %s:%s:%s'):format(
        tostring(data and data.message),
        tostring(data and data.source),
        tostring(data and data.line),
        tostring(data and data.col)
    ))
    cb({ ok = true })
end)

AddEventHandler('onClientResourceStop', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    -- Stop all schedulers, callbacks and NUI activity; leave no ghost UI.
    Sync.Hold.CancelAll()
    Sync.State.Reset()

    if resourceStarted then
        SendNUIMessage({ action = 'hideAll', payload = {} })
    end

    resourceStarted = false
    Sync.NuiReady = false
end)

-- Safety net: the init handshake is normally the only hydration trigger. If the
-- page loads slowly and misses it, poll the cache version and hydrate whenever
-- state exists or changes until the page confirms itself (reducer is idempotent,
-- so duplicate hydrates are harmless). Stops on confirmation or after ~60s.
CreateThread(function()
    local seen = -1
    for _ = 1, 60 do
        if Sync.NuiReady then return end
        Wait(1000)
        local version = Sync.State.GetCacheVersion()
        if version > 0 and version ~= seen then
            seen = version
            Sync.State.Hydrate()
        end
    end
    if not Sync.NuiReady then
        print('[sync_textui] NUI page has not initialized after 60s — verify web/dist/index.html and web/dist/assets exist on the server')
    end
end)
