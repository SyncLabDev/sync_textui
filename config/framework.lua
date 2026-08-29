Sync = Sync or {}

-- Framework selection is resolved once at resource start (see client/main.lua).
-- 'auto' probes qbx_core -> qb-core -> es_extended, falling back to standalone.
-- This file only holds shared helpers; adapters live in bridge/.

---Resolve the effective framework name from Config.Framework.
---@return string framework one of Sync.Enums.Frameworks
function Sync.ResolveFramework()
    if Config.Framework ~= 'auto' then
        return Config.Framework
    end

    if GetResourceState('qbx_core'):find('start') then
        return 'qbox'
    elseif GetResourceState('qb-core'):find('start') then
        return 'qbcore'
    elseif GetResourceState('es_extended'):find('start') then
        return 'esx'
    end
    return 'standalone'
end
