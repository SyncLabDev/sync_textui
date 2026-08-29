Sync = Sync or {}
Sync.State = {}

local C = Sync.Constants
local E = Sync.Enums

local activeInteractions = {}   -- [id] = normalized interaction
local holds = {}                -- [id] = hold session (client-side only, never serialized)
local orderCounter = 0
local cacheVersion = 0          -- bumped on every change; lets callers cheaply detect dirtiness

---Build the NUI dispatch payload for one interaction (key resolved, hold fields stripped).
local function serialize(interaction)
    local payload = {}
    for k, v in pairs(interaction) do
        if k ~= 'onStart' and k ~= 'onProgress' and k ~= 'onCancel' and k ~= 'onComplete' and k ~= 'duration'
            and k ~= 'cancelOnRelease' and k ~= 'cancelOnMove' then
            payload[k] = v
        end
    end
    payload.key = Sync.Keymap.Resolve(interaction.key)
    return payload
end

local function send(action, payload)
    SendNUIMessage({ action = action, payload = payload })
end

local function resort()
    cacheVersion = cacheVersion + 1
end

---Insert or replace an interaction. Emits 'show' (which upserts on the NUI side).
---@param interaction table normalized
function Sync.State.Upsert(interaction)
    local existing = activeInteractions[interaction.id]
    if existing then
        -- Reuse the original order value so priority ties keep stable positions.
        interaction.order = existing.order
    else
        orderCounter = orderCounter + 1
        interaction.order = orderCounter
        -- Fresh prompt on screen: suppress ox_lib's TextUI so the two never stack.
        -- Guarded so pure-logic tests (no bridge loaded) and ox-free servers skip it.
        if Sync.Bridge and Sync.Bridge.SuppressForeignTextUI then
            Sync.Bridge.SuppressForeignTextUI()
        end
    end

    activeInteractions[interaction.id] = interaction
    resort()
    send('show', serialize(interaction))
end

---Duplicate suppression: identical canonical fields are ignored before touching NUI.
---@param next table normalized
---@return boolean changed true when the stored interaction differed
function Sync.State.UpdateIfChanged(next)
    local current = activeInteractions[next.id]
    if current then
        local identical = true
        for k, v in pairs(next) do
            if k ~= 'order' and current[k] ~= v then
                identical = false
                break
            end
        end
        if identical then
            for k in pairs(current) do
                if next[k] ~= current[k] and k ~= 'order' then
                    identical = false
                    break
                end
            end
            if identical then return false end
        end
    end
    Sync.State.Upsert(next)
    return true
end

---@param id string
function Sync.State.Hide(id)
    if not activeInteractions[id] then return false end
    holds[id] = nil
    activeInteractions[id] = nil
    resort()
    send('hide', { id = id })
    return true
end

---@param channel string
function Sync.State.HideChannel(channel)
    local removed = false
    for id, interaction in pairs(activeInteractions) do
        if interaction.channel == channel then
            holds[id] = nil
            activeInteractions[id] = nil
            removed = true
        end
    end
    if removed then
        resort()
        send('hideChannel', { channel = channel })
    end
    return removed
end

function Sync.State.HideAll()
    if next(activeInteractions) == nil then return false end
    for id in pairs(activeInteractions) do
        holds[id] = nil
    end
    activeInteractions = {}
    resort()
    send('hideAll', {})
    return true
end

---Partial update; only changed fields trigger an NUI message.
function Sync.State.ApplyChanges(id, changes)
    local current = activeInteractions[id]
    if not current then return false end

    changes.id = id
    local normalized = Sync.Validation.NormalizeInteraction(changes)
    if not normalized then return false end

    -- Apply ONLY the keys the caller actually provided (validated). NormalizeInteraction
    -- returns a full-shape table whose untouched fields carry defaults, so iterating
    -- it would silently clobber channel/priority/text on every partial update.
    local changed = false
    for k in pairs(changes) do
        if k ~= 'order' and current[k] ~= normalized[k] then
            current[k] = normalized[k]
            changed = true
        end
    end
    if changed then
        resort()
        send('update', { id = id, changes = serialize(current) })
    end
    return changed
end

---@param id string
---@param state string
function Sync.State.SetState(id, state)
    if not E.StateSet[state] then return false end
    return Sync.State.ApplyChanges(id, { state = state })
end

---@param id string
---@param progress number
function Sync.State.SetProgress(id, progress)
    return Sync.State.ApplyChanges(id, { progress = progress })
end

---Timed outcome: switch to a terminal state, then restore/hide after `duration` ms.
function Sync.State.SetOutcome(id, state, duration, hideAfter)
    if not Sync.State.SetState(id, state) then return false end
    duration = Sync.Validation.helpers.safeNumber(duration, 100, 60000, 1500)
    SetTimeout(duration, function()
        if hideAfter then
            Sync.State.Hide(id)
        else
            Sync.State.SetState(id, 'default')
        end
    end)
    return true
end

---@param id string
---@return boolean
function Sync.State.IsVisible(id)
    return activeInteractions[id] ~= nil
end

---@return table list of visible interactions sorted priority desc, order asc
function Sync.State.GetVisible()
    local list = {}
    for _, interaction in pairs(activeInteractions) do
        list[#list + 1] = interaction
    end
    table.sort(list, function(a, b)
        if a.priority ~= b.priority then return a.priority > b.priority end
        return a.order < b.order
    end)
    return list
end

---Full state snapshot for hydration on NUI ready.
function Sync.State.Hydrate()
    local visible = {}
    for _, interaction in ipairs(Sync.State.GetVisible()) do
        visible[#visible + 1] = serialize(interaction)
    end
    send('hydrate', {
        interactions = visible,
        config = {
            theme = Config.DefaultTheme,
            position = Config.DefaultPosition,
            animation = Config.DefaultAnimation,
            mode = Config.DefaultMode,
            scale = Config.Scale,
            reduceMotion = Config.ReduceMotion,
            highContrast = Config.HighContrast,
            maxVisible = Config.MaxVisible,
            stackDirection = Config.StackDirection,
            stackSpacing = Config.StackSpacing,
        },
    })
end

function Sync.State.GetCacheVersion()
    return cacheVersion
end

-- Hold session registry -------------------------------------------------------

---@param session table normalized hold
function Sync.State.RegisterHold(session)
    holds[session.id] = session
end

function Sync.State.UnregisterHold(id)
    holds[id] = nil
end

---@param id string
---@return table|nil
function Sync.State.GetHold(id)
    return holds[id]
end

---@return integer
function Sync.State.CountHolds()
    local count = 0
    for _ in pairs(holds) do count = count + 1 end
    return count
end

---Direct reference to the hold registry for the scheduler loop.
function Sync.State.SnapshotHolds()
    return holds
end

---Clear everything (resource restart/reload) and drop the NUI.
function Sync.State.Reset()
    activeInteractions = {}
    holds = {}
    resort()
end
