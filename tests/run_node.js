// Fallback runner for tests/run.lua on machines without a Lua 5.4 binary.
// Uses fengari (Lua VM on Node) installed with `npm install --no-save fengari`
// inside web/. Prefer the native runner: `lua tests/run.lua`.
//
// Usage: node tests/run_node.js
const path = require('node:path')
const fs = require('node:fs')

const webModules = path.join(__dirname, '..', 'web', 'node_modules')
const { lua, lauxlib, lualib, to_luastring } = require(path.join(webModules, 'fengari'))

const L = lauxlib.luaL_newstate()
lualib.luaL_openlibs(L)

let failures = 0
lua.lua_pushjsfunction(L, (LS) => {
  const name = lua.lua_tojsstring(LS, 1)
  let src
  try {
    src = fs.readFileSync(path.resolve(name), 'utf8')
  } catch (err) {
    lua.lua_pushnil(LS)
    lua.lua_pushliteral(LS, `cannot open ${name}: ${err.message}`)
    return 2
  }
  const status = lauxlib.luaL_loadstring(LS, to_luastring(src))
  if (status !== lua.LUA_OK) {
    const message = lua.lua_tojsstring(LS, -1)
    lua.lua_pop(LS, 1)
    lua.lua_pushnil(LS)
    lua.lua_pushliteral(LS, message)
    return 2
  }
  return 1
})
lua.lua_setglobal(L, to_luastring('__loadFile'))

lua.lua_pushjsfunction(L, (LS) => {
  failures = lua.lua_tointeger(LS, 1)
  return 0
})
lua.lua_setglobal(L, to_luastring('__reportFailures'))

const status = lauxlib.luaL_dofile(L, to_luastring('tests/run.lua'))
if (status !== lua.LUA_OK) {
  console.error('LUA ERROR:', lua.lua_tojsstring(L, -1))
  process.exit(1)
}
process.exit(failures === 0 ? 0 : 1)
