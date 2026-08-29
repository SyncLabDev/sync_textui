import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ command }) => ({
  plugins: [react()],
  // FiveM serves ui_page at nui://<resource>/web/dist/index.html, so absolute
  // '/assets/...' references resolve against the RESOURCE ROOT and 404 in-game
  // (works fine in the browser, which is exactly why this must be set).
  // Relative base makes built asset URLs resolve next to index.html itself.
  base: command === 'build' ? './' : '/',
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    // FiveM ships an older CEF (Chromium 103 at time of writing) — keep the
    // transpile target below it so modern-syntax output never breaks in-game.
    target: 'chrome100',
  },
}))
