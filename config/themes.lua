Sync = Sync or {}

-- Declarative theme token maps consumed by the NUI through the UiConfig payload.
-- Themes adjust colors, radius, density, borders, key treatment and progress styling only —
-- never component structure. The frontend applies them as stable theme classes.

Sync.ThemeTokens = {
    sync = {
        label = 'SYNC',
        background = '#060810',
        surface = '#0D111B',
        surfaceRaised = '#121927',
        accent = '#6BBFFF',
        textPrimary = '#FFFFFF',
        textSecondary = '#8B96A8',
        border = '1px solid rgba(107, 191, 255, 0.18)',
        radius = '6px',
        keyStyle = 'raised',        -- signature keycap with subtle depth
        progressStyle = 'line',
        density = 'normal',
    },
    minimal = {
        label = 'Minimal',
        background = '#0A0C10',
        surface = '#101318',
        surfaceRaised = '#161A21',
        accent = '#6BBFFF',
        textPrimary = '#FFFFFF',
        textSecondary = '#8B96A8',
        border = '1px solid rgba(255, 255, 255, 0.08)',
        radius = '4px',
        keyStyle = 'outline',
        progressStyle = 'line',
        density = 'compact',
    },
    glass = {
        label = 'Glass',
        background = 'rgba(9, 12, 18, 0.72)',
        surface = 'rgba(16, 21, 31, 0.62)',
        surfaceRaised = 'rgba(24, 31, 45, 0.66)',
        accent = '#6BBFFF',
        textPrimary = '#FFFFFF',
        textSecondary = '#9AA5B8',
        border = '1px solid rgba(255, 255, 255, 0.12)',
        radius = '8px',
        keyStyle = 'raised',
        progressStyle = 'line',
        density = 'normal',
    },
    compact = {
        label = 'Compact',
        background = '#060810',
        surface = '#0B0E15',
        surfaceRaised = '#10141D',
        accent = '#6BBFFF',
        textPrimary = '#FFFFFF',
        textSecondary = '#8B96A8',
        border = '1px solid rgba(107, 191, 255, 0.14)',
        radius = '3px',
        keyStyle = 'flat',
        progressStyle = 'line',
        density = 'dense',
    },
}
