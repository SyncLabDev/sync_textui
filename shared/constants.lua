Sync = Sync or {}

---@class SyncConstants
Sync.Constants = {
    -- Field length caps (enforced by validation on both Lua and TS boundaries)
    MAX_ID_LENGTH = 64,
    MAX_TEXT_LENGTH = 160,
    MAX_DESCRIPTION_LENGTH = 280,
    MAX_KEY_LENGTH = 24,
    MAX_ICON_LENGTH = 64,
    MAX_CHANNEL_LENGTH = 32,
    MAX_IMAGE_LENGTH = 128,
    MAX_METADATA_ENTRIES = 8,
    MAX_METADATA_VALUE_LENGTH = 64,

    -- Numeric clamps
    MIN_PRIORITY = -1000,
    MAX_PRIORITY = 1000,
    MIN_PROGRESS = 0,
    MAX_PROGRESS = 100,
    MIN_SCALE = 0.5,
    MAX_SCALE = 2.0,
    MIN_HOLD_DURATION = 100,
    MAX_HOLD_DURATION = 600000,

    -- Stack defaults
    MIN_MAX_VISIBLE = 1,
    MAX_MAX_VISIBLE = 20,
    MIN_STACK_SPACING = 0,
    MAX_STACK_SPACING = 48,

    -- Reserved id used by the compatibility exports so repeated calls update in place
    COMPAT_ID = '__sync_compat',
}
