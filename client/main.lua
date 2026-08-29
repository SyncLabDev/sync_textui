Sync = Sync or {}

-- Lifecycle: init, hydration, and cleanup. Registered dev commands live in developer.lua.

local resourceStarted = false

AddEventHandler('onClientResourceStart', function(resource)
    if resource ~= GetCurrentResourceName() then return end

    Sync.State.Reset()

    print(('[sync_textui] v%s started (framework: %s)'):format(GetResourceMetadata(GetCurrentResourceName(), 'version', 0) or '2.0.0', Sync.Bridge.getFrameworkName()))
end)

-- The NUI announces itself once the React tree has mounted; hydration is then
-- race-free and the fallback timer is unnecessary.
RegisterNUICallback('init', function(_, cb)
    Sync.State.Hydrate()
    resourceStarted = true
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
end)
