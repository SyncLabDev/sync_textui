Sync = Sync or {}
Sync.Keymap = {}

-- Centralized FiveM control id -> display label. Key mappings live here and nowhere else.
-- Ids verified against the FiveM controls reference. F4/F12 are not bound to game
-- controls, so they resolve through the string path ('key = "F12"') instead.

Sync.Keymap.Controls = {
    [19]  = 'ALT',
    [20]  = 'Z',
    [21]  = 'SHIFT',
    [22]  = 'SPACE',
    [23]  = 'F',
    [24]  = 'MOUSE LEFT',
    [25]  = 'MOUSE RIGHT',
    [26]  = 'C',
    [32]  = 'W',
    [33]  = 'S',
    [34]  = 'A',
    [35]  = 'D',
    [36]  = 'CTRL',
    [37]  = 'TAB',
    [38]  = 'E',          -- INPUT_PICKUP — the canonical interaction key
    [44]  = 'Q',
    [47]  = 'G',
    [56]  = 'F9',
    [57]  = 'F10',
    [73]  = 'X',
    [74]  = 'H',
    [157] = '1',
    [158] = '2',
    [159] = '6',
    [160] = '3',
    [161] = '7',
    [162] = '8',
    [163] = '9',
    [164] = '4',
    [165] = '5',
    [166] = 'F5',
    [167] = 'F6',
    [168] = 'F7',
    [169] = 'F8',
    [170] = 'F3',
    [201] = 'ENTER',
    [202] = 'ESC',
    [241] = 'WHEEL UP',
    [242] = 'WHEEL DOWN',
    [288] = 'F1',
    [289] = 'F2',
    [344] = 'F11',
}

-- Deterministic reverse lookup (first canonical id wins for labels used by several controls).
Sync.Keymap.DISPLAY_TO_CONTROL = {}
do
    local preferred = {
        E = 38, F = 23, G = 47, H = 74, X = 73, Q = 44, C = 26, Z = 20,
        SPACE = 22, SHIFT = 21, CTRL = 36, ALT = 19, ENTER = 201, ESC = 202,
        TAB = 37, ['MOUSE LEFT'] = 24, ['MOUSE RIGHT'] = 25,
        ['WHEEL UP'] = 241, ['WHEEL DOWN'] = 242,
    }
    for label, controlId in pairs(preferred) do
        Sync.Keymap.DISPLAY_TO_CONTROL[label] = controlId
    end
    for controlId, label in pairs(Sync.Keymap.Controls) do
        if Sync.Keymap.DISPLAY_TO_CONTROL[label] == nil then
            Sync.Keymap.DISPLAY_TO_CONTROL[label] = controlId
        end
    end
end

---Resolve a key value (string label or FiveM control id) to a display label.
---@param key string|number|nil
---@return string|nil
function Sync.Keymap.Resolve(key)
    if type(key) == 'number' then
        return Sync.Keymap.Controls[key]
    end
    if type(key) ~= 'string' then return nil end
    local label = key:upper():match('^%s*(.-)%s*$')
    if not label or label == '' or #label > Sync.Constants.MAX_KEY_LENGTH then return nil end
    return label
end

---Reverse lookup: find the canonical FiveM control id for a key (for hold control watching).
---@param key string|number|nil
---@return number|nil
function Sync.Keymap.GetControl(key)
    if type(key) == 'number' then
        return Sync.Keymap.Controls[key] and key or nil
    end
    if type(key) ~= 'string' then return nil end
    if Sync.Keymap.DISPLAY_TO_CONTROL[key] then
        return Sync.Keymap.DISPLAY_TO_CONTROL[key]
    end
    local upper = key:upper():match('^%s*(.-)%s*$')
    return Sync.Keymap.DISPLAY_TO_CONTROL[upper]
end
