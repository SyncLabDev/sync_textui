Sync = Sync or {}

local function toSet(list)
    local set = {}
    for _, value in ipairs(list) do
        set[value] = true
    end
    return set
end

---@class SyncEnums
Sync.Enums = {
    States = {
        'default', 'active', 'holding', 'processing',
        'loading', 'success', 'warning', 'error', 'disabled',
    },
    Positions = {
        'top-left', 'top-center', 'top-right',
        'center-left', 'center', 'center-right',
        'bottom-left', 'bottom-center', 'bottom-right',
    },
    Animations = {
        'expand', 'fade', 'slide-left', 'slide-right',
        'slide-up', 'slide-down', 'scale', 'pop', 'none',
    },
    Themes = { 'sync', 'minimal', 'glass', 'compact' },
    Modes = { 'compact', 'full', 'auto' },
    StackDirections = { 'vertical', 'horizontal' },
    Frameworks = { 'qbox', 'qbcore', 'esx', 'standalone' },
}

---Fast allowlist sets derived from the lists above (e.g. Sync.Enums.StateSet['success']).
Sync.Enums.StateSet = toSet(Sync.Enums.States)
Sync.Enums.PositionSet = toSet(Sync.Enums.Positions)
Sync.Enums.AnimationSet = toSet(Sync.Enums.Animations)
Sync.Enums.ThemeSet = toSet(Sync.Enums.Themes)
Sync.Enums.ModeSet = toSet(Sync.Enums.Modes)
Sync.Enums.StackDirectionSet = toSet(Sync.Enums.StackDirections)
Sync.Enums.FrameworkSet = toSet(Sync.Enums.Frameworks)
