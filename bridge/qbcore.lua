Sync = Sync or {}
Sync.Bridge = Sync.Bridge or {}

-- QBCore adapter: compatibility leaf for qb-core.

function Sync.Bridge.load(bridge)
    bridge.framework = 'qbcore'
    return bridge
end

function Sync.Bridge.getFrameworkName()
    return 'qbcore'
end
