import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const d = new Date()
const pad = (n) => String(n).padStart(2, '0')
const VERSION = `${d.getUTCFullYear()}.${pad(d.getUTCMonth() + 1)}.${pad(d.getUTCDate())}-${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}`

// Подставляет версию в sw.js и version.json — браузер узнаёт о новой сборке и обновляется сам
function swVersion() {
  return {
    name: 'sw-version',
    closeBundle() {
      const out = resolve(__dirname, 'dist')
      const sw = readFileSync(resolve(__dirname, 'sw.template.js'), 'utf8').replaceAll('__VERSION__', VERSION)
      writeFileSync(resolve(out, 'sw.js'), sw)
      writeFileSync(resolve(out, 'version.json'), JSON.stringify({ version: VERSION }))
    },
  }
}

export default defineConfig({
  plugins: [react(), swVersion()],
  define: { __APP_VERSION__: JSON.stringify(VERSION) },
  server: { proxy: { '/api': 'http://127.0.0.1:8710' } },
  build: { target: 'es2020', assetsInlineLimit: 0 },
})
