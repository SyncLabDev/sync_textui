Sync = Sync or {}

-- In-game playground: /synctextui. Hard-gated behind Config.DeveloperMode.
-- NUI callbacks from the playground are verified against dev mode before dispatch.

local playgroundOpen = false

local PRESETS = {
    {
        id = 'garage', key = 'E', icon = 'car', text = 'Open Garage',
        description = 'Legion Parking — Level 2', channel = 'vehicle', priority = 10,
    },
    {
        id = 'repair', key = 'H', icon = 'wrench', text = 'Repair Vehicle',
        description = 'Hold to repair engine', channel = 'vehicle', priority = 8, hold = 2500,
    },
    {
        id = 'door', key = 'G', icon = 'door-open', text = 'Enter Apartment',
        description = 'Morningwood Blvd', channel = 'world', priority = 5,
    },
    {
        id = 'shop', key = 'E', icon = 'shop', text = 'Browse Shop',
        description = '24/7 Supermarket', channel = 'world', priority = 3,
    },
}

local function sendPreset(preset, theme, position, animation)
    Sync.State.UpdateIfChanged(Sync.Validation.NormalizeInteraction({
        id = 'dev_' .. preset.id,
        channel = preset.channel,
        priority = preset.priority,
        key = preset.key,
        icon = preset.icon,
        text = preset.text,
        description = preset.description,
        theme = theme,
        position = position,
        animation = animation,
    }))

    if preset.hold then
        Sync.Interactions.Hold({
            id = 'dev_' .. preset.id,
            key = preset.key,
            icon = preset.icon,
            text = preset.text,
            description = preset.description,
            duration = preset.hold,
            theme = theme,
            position = position,
            animation = animation,
            onComplete = function()
                print('[sync_textui] playground hold complete')
            end,
        })
    end
end

local function openPlayground()
    playgroundOpen = true
    SetNuiFocus(true, false)
    SendNUIMessage({ action = 'playground', payload = { open = true, presets = PRESETS } })
end

local function closePlayground()
    playgroundOpen = false
    SetNuiFocus(false, false)
    Sync.State.HideChannel('dev')
    SendNUIMessage({ action = 'playground', payload = { open = false } })
end

RegisterCommand('synctextui', function()
    if not Config.DeveloperMode then return end
    if playgroundOpen then
        closePlayground()
    else
        openPlayground()
    end
end, false)

-- NUI callbacks are gated: without Config.DeveloperMode they are ignored entirely.
RegisterNUICallback('devPreset', function(data, cb)
    if not Config.DeveloperMode or not playgroundOpen then return cb({}) end
    local preset = PRESETS[data.presetIndex or 0]
    if preset then
        sendPreset(preset, data.theme, data.position, data.animation)
    end
    cb({})
end)

RegisterNUICallback('devClose', function(_, cb)
    if not Config.DeveloperMode then return cb({}) end
    closePlayground()
    cb({})
end)
