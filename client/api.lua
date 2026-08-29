Sync = Sync or {}

local C = Sync.Constants
local V = Sync.Validation
local helpers = V.helpers

local function debugLog(message)
    if Config.Debug then
        print(('[sync_textui] %s'):format(message))
    end
end

---Public: show an interaction.
---@param data table
function Sync.Interactions.Show(data)
    local normalized = V.NormalizeInteraction(data)
    if not normalized then
        debugLog('Show rejected: missing id or unusable payload')
        return false
    end
    Sync.State.UpdateIfChanged(normalized)
    return true
end

---Public: hide one interaction by id.
function Sync.Interactions.Hide(id)
    if type(id) ~= 'string' then return false end
    return Sync.State.Hide(id)
end

---Public: partial update.
function Sync.Interactions.Update(id, changes)
    if type(id) ~= 'string' or type(changes) ~= 'table' then return false end
    return Sync.State.ApplyChanges(id, changes)
end

---Public: change state.
function Sync.Interactions.SetState(id, state)
    return Sync.State.SetState(id, state)
end

---Public: set progress 0..100 (clamped).
function Sync.Interactions.SetProgress(id, progress)
    return Sync.State.SetProgress(id, helpers.safeNumber(progress, C.MIN_PROGRESS, C.MAX_PROGRESS, 0))
end

---Public: set interaction mode compact|full|auto.
function Sync.Interactions.SetMode(id, mode)
    if type(mode) ~= 'string' or not Sync.Enums.ModeSet[mode] then return false end
    return Sync.State.ApplyChanges(id, { mode = mode })
end

---Public: visibility probe.
function Sync.Interactions.IsVisible(id)
    return Sync.State.IsVisible(id)
end

---Public: hide everything.
function Sync.Interactions.HideAll()
    return Sync.State.HideAll()
end

---Public: hide a channel.
function Sync.Interactions.HideChannel(channel)
    if type(channel) ~= 'string' then return false end
    return Sync.State.HideChannel(channel)
end

---Public: timed outcome (success/warning/error), then restore default or hide.
function Sync.Interactions.SetOutcome(id, state, duration, hideAfter)
    return Sync.State.SetOutcome(id, state, duration, hideAfter)
end

---Public: hold interaction with client-side callbacks.
function Sync.Interactions.Hold(data)
    local normalized = V.NormalizeHold(data)
    if not normalized then
        debugLog('Hold rejected: missing id or unusable payload')
        return false
    end
    Sync.Hold.Start(normalized)
    return true
end

---Public: cancel a hold.
function Sync.Interactions.CancelHold(id)
    return Sync.Hold.Cancel(id, false)
end

-- Compatibility exports ------------------------------------------------------
-- These map onto the reserved compat id so repeated calls update in place and
-- never stack. No logic is duplicated; everything funnels through the manager.

local function compatShow(text)
    if text == nil or text == '' then
        return Sync.State.Hide(C.COMPAT_ID)
    end
    Sync.State.UpdateIfChanged(V.NormalizeInteraction({
        id = C.COMPAT_ID,
        text = text,
        priority = 1000,
        position = Config.DefaultPosition,
    }))
    return true
end

RegisterCommand('synctextui_hide', function()
    compatShow(nil)
end, false)

exports('Show', Sync.Interactions.Show)
exports('Hide', Sync.Interactions.Hide)
exports('Update', Sync.Interactions.Update)
exports('SetState', Sync.Interactions.SetState)
exports('SetProgress', Sync.Interactions.SetProgress)
exports('SetMode', Sync.Interactions.SetMode)
exports('IsVisible', Sync.Interactions.IsVisible)
exports('HideAll', Sync.Interactions.HideAll)
exports('HideChannel', Sync.Interactions.HideChannel)
exports('SetOutcome', Sync.Interactions.SetOutcome)
exports('Hold', Sync.Interactions.Hold)
exports('CancelHold', Sync.Interactions.CancelHold)

-- Compatibility aliases
exports('showTextUI', compatShow)
exports('hideTextUI', function() return Sync.State.Hide(C.COMPAT_ID) end)
exports('TextUI', compatShow)
exports('HideTextUI', function() return Sync.State.Hide(C.COMPAT_ID) end)
