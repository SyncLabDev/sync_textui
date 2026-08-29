fx_version 'cerulean'
game 'gta5'
lua54 'yes'

name 'sync_textui'
author 'SYNC Lab'
description 'Framework-independent interaction UI engine — prompts, holds, progress, stacking.'
version '2.1.1'

ui_page 'web/dist/index.html'

shared_scripts {
    'shared/constants.lua',
    'shared/enums.lua',
    'config/config.lua',
    'config/themes.lua',
    'config/framework.lua',
}

client_scripts {
    'bridge/standalone.lua',
    'bridge/qbox.lua',
    'bridge/qbcore.lua',
    'bridge/esx.lua',
    'bridge/framework.lua',
    'client/validation.lua',
    'client/keymap.lua',
    'client/state.lua',
    'client/interactions.lua',
    'client/hold.lua',
    'client/api.lua',
    'client/developer.lua',
    'client/main.lua',
}

files {
    'web/dist/index.html',
    'web/dist/assets/*',
    'web/dist/**',
}
