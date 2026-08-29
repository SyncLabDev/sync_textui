Sync = Sync or {}
Sync.Interactions = {}

---Timed outcome with hide-after support (success -> hide, or error -> revert).
---@param id string
---@param state string terminal state: success | warning | error
---@param duration number|nil ms before restore/hide
---@param hideAfter boolean|nil
function Sync.Interactions.SetOutcome(id, state, duration, hideAfter)
    return Sync.State.SetOutcome(id, state, duration, hideAfter)
end

---Convenience: show then auto-hide.
---@param data table Show payload with optional autoHide (ms)
function Sync.Interactions.ShowTimed(data)
    local autoHide = tonumber(data and data.autoHide)
    if autoHide then
        SetTimeout(autoHide, function()
            Sync.State.Hide(data.id)
        end)
    end
    return Sync.Interactions.Show(data)
end

---Flash an outcome: default -> state -> default.
---@param id string
---@param state string
---@param duration number|nil
function Sync.Interactions.Flash(id, state, duration)
    Sync.State.SetState(id, 'default')
    return Sync.State.SetOutcome(id, state, duration, false)
end
