Sync = Sync or {}
Sync.Bridge = Sync.Bridge or {}

-- ESX adapter: compatibility leaf for es_extended.

function Sync.Bridge.load(bridge)
    bridge.framework = 'esx'
    return bridge
end

function Sync.Bridge.getFrameworkName()
    return 'esx'
end
