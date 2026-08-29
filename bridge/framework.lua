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
