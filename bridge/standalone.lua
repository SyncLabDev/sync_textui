Sync = Sync or {}
Sync.Bridge = Sync.Bridge or {}

-- Standalone adapter: no framework APIs required. Kept as an explicit leaf so
-- core modules never depend on framework presence.

function Sync.Bridge.load(bridge)
    bridge.framework = 'standalone'
    return bridge
end

function Sync.Bridge.getFrameworkName()
    return 'standalone'
end
