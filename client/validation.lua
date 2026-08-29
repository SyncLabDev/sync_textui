Sync = Sync or {}
Sync.Validation = {}

local C = Sync.Constants
local E = Sync.Enums

local function clamp(value, minValue, maxValue)
    if value < minValue then return minValue end
    if value > maxValue then return maxValue end
    return value
end

---Truncate and trim a string; returns nil for empty/non-string input.
local function safeString(value, maxLength)
    if type(value) ~= 'string' then return nil end
    value = value:match('^%s*(.-)%s*$')
    if value == '' then return nil end
    if #value > maxLength then
        value = value:sub(1, maxLength)
    end
    return value
end

local function safeNumber(value, minValue, maxValue, defaultValue)
    if type(value) ~= 'number' or value ~= value then -- NaN guard
        return defaultValue
    end
    return clamp(value, minValue, maxValue)
end

local function safeBoolean(value, defaultValue)
    if type(value) ~= 'boolean' then return defaultValue end
    return value
end

local function safeEnum(value, set, defaultValue)
    if type(value) ~= 'string' then return defaultValue end
    if set[value] then return value end
    return defaultValue
end

---Remote images are rejected unless explicitly enabled in config.
local function safeImage(value)
    local path = safeString(value, C.MAX_IMAGE_LENGTH)
    if not path then return nil end
    if not Config.AllowRemoteImages and (path:match('^https?://') or path:match('^ftp://')) then
        return nil
    end
    return path
end

local function safeOffset(value)
    if type(value) ~= 'table' then return nil end
    return {
        x = safeNumber(value.x, -500, 500, 0),
        y = safeNumber(value.y, -500, 500, 0),
    }
end

local function safeMetadata(value)
    if type(value) ~= 'table' then return nil end
    local out, count = {}, 0
    for key, entry in pairs(value) do
        if count >= C.MAX_METADATA_ENTRIES then break end
        local cleanKey = safeString(key, C.MAX_CHANNEL_LENGTH)
        if cleanKey then
            if type(entry) == 'number' and entry == entry then
                out[cleanKey] = entry
                count = count + 1
            elseif type(entry) == 'string' then
                local cleanValue = safeString(entry, C.MAX_METADATA_VALUE_LENGTH)
                if cleanValue then
                    out[cleanKey] = cleanValue
                    count = count + 1
                end
            end
        end
    end
    if count == 0 then return nil end
    return out
end

Sync.Validation.helpers = {
    clamp = clamp,
    safeString = safeString,
    safeNumber = safeNumber,
    safeBoolean = safeBoolean,
    safeEnum = safeEnum,
    safeImage = safeImage,
    safeOffset = safeOffset,
    safeMetadata = safeMetadata,
}

---Key accepts a FiveM control id (number, must be a known control) or a string label.
local function safeKey(value)
    if type(value) == 'number' and value == value then
        local controlId = math.floor(value)
        return Sync.Keymap.Controls[controlId] and controlId or nil
    end
    return safeString(value, C.MAX_KEY_LENGTH)
end

---Normalize a raw interaction table into the canonical shape. Never trusts caller input.
---@param raw table|nil
---@return table|nil normalized nil when the result is unusable (no id or no text/icon content)
function Sync.Validation.NormalizeInteraction(raw)
    if type(raw) ~= 'table' then return nil end

    local id = safeString(raw.id, C.MAX_ID_LENGTH)
    if not id then return nil end

    local normalized = {
        id = id,
        channel = safeString(raw.channel, C.MAX_CHANNEL_LENGTH) or 'interaction',
        priority = safeNumber(raw.priority, C.MIN_PRIORITY, C.MAX_PRIORITY, 0),
        key = safeKey(raw.key),
        icon = safeString(raw.icon, C.MAX_ICON_LENGTH),
        image = safeImage(raw.image),
        text = safeString(raw.text, C.MAX_TEXT_LENGTH) or '',
        description = safeString(raw.description, C.MAX_DESCRIPTION_LENGTH),
        position = safeEnum(raw.position, E.PositionSet, Config.DefaultPosition),
        offset = safeOffset(raw.offset),
        theme = safeEnum(raw.theme, E.ThemeSet, Config.DefaultTheme),
        animation = safeEnum(raw.animation, E.AnimationSet, Config.DefaultAnimation),
        mode = safeEnum(raw.mode, E.ModeSet, Config.DefaultMode),
        state = safeEnum(raw.state, E.StateSet, 'default'),
        progress = safeNumber(raw.progress, C.MIN_PROGRESS, C.MAX_PROGRESS, 0),
        scale = safeNumber(raw.scale, C.MIN_SCALE, C.MAX_SCALE, 1.0),
        disabled = safeBoolean(raw.disabled, false),
        metadata = safeMetadata(raw.metadata),
    }

    return normalized
end

---Validate hold options; callbacks are kept client-side and never serialized.
---@param raw table|nil
---@return table|nil
function Sync.Validation.NormalizeHold(raw)
    if type(raw) ~= 'table' then return nil end

    local normalized = Sync.Validation.NormalizeInteraction(raw)
    if not normalized then return nil end

    normalized.duration = safeNumber(raw.duration, C.MIN_HOLD_DURATION, C.MAX_HOLD_DURATION, 3000)
    normalized.cancelOnRelease = safeBoolean(raw.cancelOnRelease, true)
    normalized.cancelOnMove = safeBoolean(raw.cancelOnMove, true)
    normalized.onStart = type(raw.onStart) == 'function' and raw.onStart or nil
    normalized.onProgress = type(raw.onProgress) == 'function' and raw.onProgress or nil
    normalized.onCancel = type(raw.onCancel) == 'function' and raw.onCancel or nil
    normalized.onComplete = type(raw.onComplete) == 'function' and raw.onComplete or nil

    return normalized
end
