Sync = Sync or {}
Sync.Bridge = Sync.Bridge or {}

-- Qbox adapter: compatibility leaf for qbx_core.

function Sync.Bridge.load(bridge)
    bridge.framework = 'qbox'
    return bridge
end

function Sync.Bridge.getFrameworkName()
    return 'qbox'
end
