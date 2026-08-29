Sync = Sync or {}

-- In-game playground: /synctextui opens a clickable preset menu rendered by the
-- NUI (bottom-right). Clicking a preset spawns the interaction through the real
-- renderer; Esc / the X button closes the menu and releases input focus.
-- Hard-gated behind Config.DeveloperMode.
--
-- Focus contract: SetNuiFocus is only ever taken while the menu is actually
-- mounted in the page. If the bundle never initialized (nuiReady false) opening
-- the menu would steal input with nothing to click — the old freeze bug — so
-- openPlayground refuses in that case and tells the developer what is wrong.

local menuOpen = false
local previewActive = false

local PRESETS = {
    {
        id = 'garage', key = 'E', icon = 'car', text = 'Open Garage',
        description = 'Legion Parking — Level 2', priority = 10,
    },
    {
        id = 'repair', key = 'H', icon = 'wrench', text = 'Repair Vehicle',
        description = 'Hold to repair engine (auto-runs)', priority = 8, hold = 2500,
    },
    {
        id = 'door', key = 'G', icon = 'door-open', text = 'Enter Apartment',
        description = 'Morningwood Blvd', priority = 5,
    },
    {
        id = 'shop', key = 'E', icon = 'shop', text = 'Browse Shop',
        description = '24/7 Supermarket', priority = 3,
    },
}

local function sendPreset(preset)
    local id = 'dev_' .. preset.id

    if preset.hold then
        -- Timer-driven preview (cancelOnRelease/Move off): the full
        -- holding -> success lifecycle completes without physical key input,
        -- which is required while the menu itself holds NUI focus.
        Sync.Interactions.Hold({
            id = id,
            channel = 'dev',
            key = preset.key,
            icon = preset.icon,
            text = preset.text,
            description = preset.description,
            priority = preset.priority,
            duration = preset.hold,
            cancelOnRelease = false,
            cancelOnMove = false,
            onComplete = function()
                print('[sync_textui] playground hold complete')
            end,
        })
        return
    end

    Sync.State.UpdateIfChanged(Sync.Validation.NormalizeInteraction({
        id = id,
        channel = 'dev',
        priority = preset.priority,
        key = preset.key,
        icon = preset.icon,
        text = preset.text,
        description = preset.description,
    }))
end

local function announce(message)
    print(('[sync_textui] %s'):format(message))
    TriggerEvent('chat:addMessage', {
        color = { 107, 191, 255 },
        multiline = true,
        args = { 'SYNC TextUI', message },
    })
end

-- Reads the file view the NUI page itself gets, straight from the INSTALLED
-- resource on the server. This distinguishes "you copied dist into a different
-- folder than the one actually running" from "files present but the page's JS
-- never initialized".
local function distCheck()
    if type(LoadResourceFile) ~= 'function' then return true, 'not checkable' end

    local index = LoadResourceFile(GetCurrentResourceName(), 'web/dist/index.html')
    if not index or #index == 0 then
        return false, 'web/dist/index.html is MISSING from the installed resource'
    end

    local missing = {}
    for assetPath in index:gmatch('"/(assets/[^"]+)"') do
        local content = LoadResourceFile(GetCurrentResourceName(), 'web/dist/' .. assetPath)
        if not content or #content == 0 then
            missing[#missing + 1] = assetPath
        end
    end

    if #missing > 0 then
        return false, 'index.html exists but hashed assets are missing: ' .. table.concat(missing, ', ')
    end
    return true, 'complete (index + hashed assets readable)'
end

local function warnNoBundle()
    local complete, detail = distCheck()
    if not complete then
        announce('NO BUNDLE: ' .. detail .. ' — the RUNNING resource does not contain the web files. Copy the FULL web/dist folder (index.html + assets/) into the sync_textui folder on the SERVER, then restart sync_textui.')
    else
        announce('web/dist IS present, but the page never ran its init handshake — open F8 and look for red sync_textui page errors (JS bundle issue) and paste them if found.')
    end
end

local function openPlayground()
    if not Sync.NuiReady then
        warnNoBundle()
        announce('menu NOT opened: the NUI page is not live, and opening it would freeze input. Fix web/dist, restart, retry.')
        return
    end

    menuOpen = true
    SetNuiFocus(true, true)
    SendNUIMessage({ action = 'playground', payload = { open = true, presets = PRESETS } })
    announce('playground menu open (bottom-right). Click a preset to spawn it; Esc or /synctextui closes. /synctextui preview also dumps all four without the menu.')
end

local function closePlayground()
    menuOpen = false
    SetNuiFocus(false, false)
    Sync.State.HideChannel('dev')
    previewActive = false
    SendNUIMessage({ action = 'playground', payload = { open = false } })
    announce('playground closed — input released, dev channel cleared')
end

local function startPreview()
    if not Sync.NuiReady then
        warnNoBundle()
    end

    previewActive = true
    for _, preset in ipairs(PRESETS) do
        sendPreset(preset)
    end

    local visible = 0
    for _, interaction in ipairs(Sync.State.GetVisible()) do
        if interaction.channel == 'dev' then visible = visible + 1 end
    end

    announce(('preview ON — %d/%d presets on screen. Run /synctextui preview again to clear.'):format(visible, #PRESETS))
end

local function stopPreview()
    previewActive = false
    Sync.State.HideChannel('dev')
    announce('preview OFF — dev channel cleared')
end

RegisterCommand('synctextui', function()
    if not Config.DeveloperMode then
        print('[sync_textui] /synctextui ignored: Config.DeveloperMode = false — set it to true in config/config.lua and restart the resource.')
        return
    end
    if menuOpen then
        closePlayground()
    else
        openPlayground()
    end
end, false)

-- Focus-free alternative: dumps/clears all preset cards without opening the
-- clickable menu, so the player keeps full control.
RegisterCommand('synctextui_preview', function()
    if not Config.DeveloperMode then return end
    if previewActive then
        stopPreview()
    else
        startPreview()
    end
end, false)

RegisterCommand('synctextui_status', function()
    local visible = {}
    for _, interaction in ipairs(Sync.State.GetVisible()) do
        visible[#visible + 1] = ('%s [%s p%d]'):format(interaction.id, interaction.channel, interaction.priority)
    end
    local distOk, distDetail = distCheck()
    print(('[sync_textui] status | developerMode: %s | nuiReady: %s | menu: %s | framework: %s | ox_lib: %s (policy: %s) | dist(%s): %s | visible: %d (%s) | holds: %d | cache v%d')
        :format(
            tostring(Config.DeveloperMode),
            tostring(Sync.NuiReady),
            tostring(menuOpen),
            Sync.Bridge.getFrameworkName(),
            GetResourceState('ox_lib'),
            tostring(Config.OxTextUI),
            tostring(distOk),
            distDetail,
            #visible,
            #visible > 0 and table.concat(visible, ', ') or 'none',
            Sync.State.CountHolds(),
            Sync.State.GetCacheVersion()
        ))
end, false)

-- NUI callbacks: gated twice — dev mode must be on AND the menu must be open,
-- so a stray fetch can never drive the engine outside the playground.
RegisterNUICallback('devPreset', function(data, cb)
    if not Config.DeveloperMode or not menuOpen then return cb({ ok = false }) end
    local index = tonumber(data and data.presetIndex)
    local preset = index and PRESETS[index]
    if preset then
        sendPreset(preset)
    end
    cb({ ok = preset ~= nil })
end)

RegisterNUICallback('devClose', function(_, cb)
    if not Config.DeveloperMode then return cb({ ok = false }) end
    if menuOpen then
        closePlayground()
    end
    cb({ ok = true })
end)
