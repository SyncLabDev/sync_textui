-- SYNC TextUI pure-logic test runner (Lua 5.4, no game natives).
-- Usage: lua tests/run.lua
local ROOT = ((arg and arg[0]) or './tests/run.lua'):match('^(.*)[/\\]tests[/\\]') or '.'

-- ---------------------------------------------------------------- stubs ----
local sent = {}
function SendNUIMessage(message) sent[#sent + 1] = message end
local timers = {}
function SetTimeout(ms, fn) timers[#timers + 1] = { at = ms, fn = fn } end
function GetResourceState() return 'missing' end
function RegisterCommand() end
function RegisterNetEvent() end
function AddEventHandler() end
function TriggerEvent() end

-- ------------------------------------------------------------ load code ----
local files = {
    'shared/constants.lua',
    'shared/enums.lua',
    'config/config.lua',
    'config/themes.lua',
    'config/framework.lua',
    'client/validation.lua',
    'client/keymap.lua',
    'client/state.lua',
}
for _, path in ipairs(files) do
    -- Plain Lua 5.4 uses loadfile; the fengari fallback (tests/run_node.js) injects __loadFile.
    local loader = rawget(_G, '__loadFile') or loadfile
    local chunk = assert(loader(ROOT .. '/' .. path))
    chunk()
end

-- ------------------------------------------------------------- framework ---
local passed, failed = 0, 0
local function test(name, fn)
    local ok, err = pcall(fn)
    if ok then
        passed = passed + 1
        print(('  ok    %s'):format(name))
    else
        failed = failed + 1
        print(('  FAIL  %s\n        %s'):format(name, tostring(err)))
    end
end
local function eq(actual, expected, msg)
    if actual ~= expected then
        error(('%s expected %s got %s'):format(msg or '', tostring(expected), tostring(actual)), 2)
    end
end
local function truthy(value, msg)
    if not value then error(msg or 'expected truthy', 2) end
end

-- ------------------------------------------------------------- validation --
print('validation')
test('clamps progress to 0..100', function()
    local v = Sync.Validation.NormalizeInteraction({ id = 'x', text = 'T', progress = 400 })
    eq(v.progress, 100)
    v = Sync.Validation.NormalizeInteraction({ id = 'x', text = 'T', progress = -5 })
    eq(v.progress, 0)
end)
test('truncates oversized strings', function()
    local v = Sync.Validation.NormalizeInteraction({ id = 'x', text = string.rep('a', 500) })
    truthy(#v.text <= Sync.Constants.MAX_TEXT_LENGTH)
end)
test('rejects remote images', function()
    local v = Sync.Validation.NormalizeInteraction({ id = 'x', text = 'T', image = 'https://evil.example/a.png' })
    eq(v.image, nil)
    v = Sync.Validation.NormalizeInteraction({ id = 'x', text = 'T', image = 'nui://sync_textui/web/img/a.png' })
    truthy(v.image ~= nil, 'local path should pass')
end)
test('invalid enums fall back to defaults', function()
    local v = Sync.Validation.NormalizeInteraction({ id = 'x', text = 'T', theme = 'neon', position = 'nowhere', state = 'exploded', animation = 'bounce' })
    eq(v.theme, Config.DefaultTheme)
    eq(v.position, Config.DefaultPosition)
    eq(v.state, 'default')
    eq(v.animation, Config.DefaultAnimation)
end)
test('missing id is rejected', function()
    eq(Sync.Validation.NormalizeInteraction({ text = 'orphan' }), nil)
end)
test('hold duration clamped', function()
    local h = Sync.Validation.NormalizeHold({ id = 'h', key = 'E', text = 'T', duration = 999999999, onComplete = function() end })
    truthy(h and h.duration <= Sync.Constants.MAX_HOLD_DURATION)
    eq(Sync.Validation.NormalizeHold({ id = 'h', text = 'T' }).onComplete, nil, 'callbacks required')
end)

-- ---------------------------------------------------------------- keymap ---
print('keymap')
test('control id 38 resolves to E', function()
    eq(Sync.Keymap.Resolve(38), 'E')
end)
test('labels pass through uppercased', function()
    eq(Sync.Keymap.Resolve('e'), 'E')
    eq(Sync.Keymap.Resolve('SPACE'), 'SPACE')
end)
test('reverse lookup finds control', function()
    eq(Sync.Keymap.GetControl('E'), 38)
end)

-- ----------------------------------------------------------------- state ---
print('state')
local function countMessages(action)
    local n = 0
    for _, m in ipairs(sent) do if m.action == action then n = n + 1 end end
    return n
end

test('upsert emits show', function()
    sent = {}
    local v = Sync.Validation.NormalizeInteraction({ id = 'garage', text = 'Open Garage', key = 'E' })
    Sync.State.Upsert(v)
    eq(countMessages('show'), 1)
    truthy(Sync.State.IsVisible('garage'))
end)
test('duplicate Show is suppressed', function()
    sent = {}
    local v1 = Sync.Validation.NormalizeInteraction({ id = 'dup', text = 'Same', key = 'E', priority = 1 })
    local v2 = Sync.Validation.NormalizeInteraction({ id = 'dup', text = 'Same', key = 'E', priority = 1 })
    truthy(Sync.State.UpdateIfChanged(v1), 'first should be applied')
    eq(Sync.State.UpdateIfChanged(v2), false, 'identical payload must be ignored')
    eq(countMessages('show'), 1)
end)
test('changed payload passes through', function()
    sent = {}
    local v1 = Sync.Validation.NormalizeInteraction({ id = 'dup', text = 'Same', key = 'E' })
    local v2 = Sync.Validation.NormalizeInteraction({ id = 'dup', text = 'Different', key = 'E' })
    Sync.State.UpdateIfChanged(v1)
    truthy(Sync.State.UpdateIfChanged(v2))
end)
test('ApplyChanges merges partials', function()
    sent = {}
    Sync.Validation.NormalizeInteraction({ id = 'ch', text = 'A', description = 'B' })
    Sync.State.Upsert(Sync.Validation.NormalizeInteraction({ id = 'ch', text = 'A', description = 'B' }))
    truthy(Sync.State.ApplyChanges('ch', { text = 'A2' }))
    eq(Sync.State.GetVisible()[#Sync.State.GetVisible()].description, 'B', 'description preserved')
    eq(Sync.State.ApplyChanges('ch', { text = 'A2' }), false, 'no-op update suppressed')
end)
test('priority sort desc, order asc stable', function()
    Sync.State.Reset()
    for _, p in ipairs({ { 'low', 1 }, { 'high', 10 }, { 'mid', 5 }, { 'mid2', 5 } }) do
        Sync.State.Upsert(Sync.Validation.NormalizeInteraction({ id = p[1], text = 'T', priority = p[2] }))
    end
    local list = Sync.State.GetVisible()
    eq(list[1].id, 'high')
    eq(list[2].id, 'mid')
    eq(list[3].id, 'mid2')
    eq(list[4].id, 'low')
end)
test('HideChannel is scoped', function()
    Sync.State.Reset()
    Sync.State.Upsert(Sync.Validation.NormalizeInteraction({ id = 'a', text = 'A', channel = 'vehicle' }))
    Sync.State.Upsert(Sync.Validation.NormalizeInteraction({ id = 'b', text = 'B', channel = 'world' }))
    sent = {}
    Sync.State.HideChannel('vehicle')
    eq(Sync.State.IsVisible('a'), false)
    truthy(Sync.State.IsVisible('b'))
    eq(countMessages('hideChannel'), 1)
end)
test('hydrate snapshot has no callback fields', function()
    Sync.State.Reset()
    Sync.State.Upsert(Sync.Validation.NormalizeInteraction({ id = 'h1', text = 'H', key = 38 }))
    sent = {}
    Sync.State.Hydrate()
    local msg = sent[1]
    eq(msg.action, 'hydrate')
    eq(msg.payload.interactions[1].key, 'E', 'control id serialized to label')
    eq(msg.payload.interactions[1].onComplete, nil)
end)
test('reset clears everything', function()
    Sync.State.Reset()
    eq(Sync.State.IsVisible('h1'), false)
end)

print(('\n%d passed, %d failed'):format(passed, failed))
if rawget(_G, '__reportFailures') then __reportFailures(failed) end
os.exit(failed == 0 and 0 or 1)
