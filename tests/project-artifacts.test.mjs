/**
 * Sanity: critical entrypoints and route map exist on disk.
 */
import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import { test } from 'node:test'
import { readFileSync } from 'node:fs'

const root = new URL('../', import.meta.url)

test('SPA and API entry files exist', () => {
  assert.ok(existsSync(new URL('src/main.jsx', root)))
  assert.ok(existsSync(new URL('src/App.jsx', root)))
  assert.ok(existsSync(new URL('server/index.js', root)))
  assert.ok(existsSync(new URL('vite.config.js', root)))
})

test('App.jsx declares /app and /admin route trees', () => {
  const app = readFileSync(new URL('src/App.jsx', root), 'utf8')
  assert.match(app, /path="\/app"/)
  assert.match(app, /path="\/admin"/)
  assert.match(app, /path="\/login"/)
})
