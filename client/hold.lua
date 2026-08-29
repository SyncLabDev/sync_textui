Sync = Sync or {}
Sync.Hold = {}

local C = Sync.Constants

-- Single scheduler thread. Started on demand, exits when the last hold ends —
-- there is no permanent idle loop.

local schedulerRunning = false

local function safeCallback(callback, ...)
    if not callback then return end
    local ok, err = pcall(callback, ...)
    if not ok then
        print(('[sync_textui] hold callback error: %s'):format(err))
    end
end

local function runScheduler()
    schedulerRunning = true

    CreateThread(function()
        while Sync.State.CountHolds() > 0 do
            local now = GetGameTimer()
            local nextWake = now + C.MAX_HOLD_DURATION

            for id, session in pairs(Sync.State.SnapshotHolds()) do
                if session.finishing then
                    -- handled by its own completion thread
                    nextWake = math.min(nextWake, now + 50)
                    goto continue
                end

                local elapsed = now - session.startedAt
                local progress = math.min(100, (elapsed / session.duration) * 100)

                -- Throttled NUI progress: only emit when the displayed integer percent changes
                local displayed = math.floor(progress + 0.5)
                if displayed ~= session.lastDisplayed then
                    session.lastDisplayed = displayed
                    Sync.State.SetProgress(id, displayed)
                    safeCallback(session.onProgress, displayed)
                end

                local completed = progress >= 100
                local released = session.cancelOnRelease and not session.keyActive

                if completed then
                    session.finishing = true
                    Sync.State.SetState(id, 'success')
                    Sync.State.SetProgress(id, 100)
                    safeCallback(session.onComplete)
                    SetTimeout(700, function()
                        Sync.State.UnregisterHold(id)
                        Sync.State.Hide(id)
                    end)
                elseif released then
                    session.finishing = true
                    Sync.State.SetState(id, 'default')
                    Sync.State.SetProgress(id, 0)
                    safeCallback(session.onCancel)
                    SetTimeout(400, function()
                        Sync.State.UnregisterHold(id)
                        Sync.State.Hide(id)
                    end)
                else
                    nextWake = math.min(nextWake, now + math.max(16, session.tickMs or 50))
                end

                ::continue::
            end

            if Sync.State.CountHolds() == 0 then break end
            Wait(math.max(16, nextWake - now))
        end

        schedulerRunning = false
    end)
end

local function ensureScheduler()
    if not schedulerRunning then
        runScheduler()
    end
end

---Start a hold session. Validation happens in api.lua; this assumes a normalized session.
---@param session table normalized hold with duration/key/cancel flags/callbacks
function Sync.Hold.Start(session)
    if Sync.State.GetHold(session.id) then
        Sync.Hold.Cancel(session.id, true)
    end

    local control = Sync.Keymap.GetControl(session.key)
    local progressState = session.state == 'default' and 'holding' or session.state

    session.startedAt = GetGameTimer()
    session.keyActive = true
    session.lastDisplayed = -1
    session.finishing = false
    session.control = control
    session.tickMs = 1000 / math.max(1, math.floor(1000 / math.max(20, Config.HoldUpdateInterval or 50)))

    -- Seed the interaction, then move it into holding with 0 progress.
    Sync.State.Upsert(session)
    Sync.State.SetState(session.id, progressState)
    Sync.State.SetProgress(session.id, 0)

    Sync.State.RegisterHold(session)
    ensureScheduler()

    -- Watch the physical control if we can resolve it; otherwise rely on cancelOnRelease timing.
    if control then
        CreateThread(function()
            local holdId = session.id
            while true do
                local active = Sync.State.GetHold(holdId)
                if not active or active.finishing then break end
                if not IsControlPressed(0, control) then
                    active.keyActive = false
                    break
                end
                DisableControlAction(0, control, true)
                Wait(0)
            end
        end)
    end

    safeCallback(session.onStart)
end

---Cancel a hold session explicitly.
---@param id string
---@param silent boolean|nil suppress onCancel when true
function Sync.Hold.Cancel(id, silent)
    local session = Sync.State.GetHold(id)
    if not session then return false end

    session.finishing = true
    Sync.State.UnregisterHold(id)

    if not silent then
        safeCallback(session.onCancel)
    end
    Sync.State.SetState(id, 'default')
    SetTimeout(200, function()
        Sync.State.Hide(id)
    end)
    return true
end

function Sync.Hold.CancelAll()
    for id in pairs(Sync.State.SnapshotHolds()) do
        Sync.Hold.Cancel(id, true)
    end
end
