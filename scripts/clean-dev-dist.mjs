/**
 * Reset vite-plugin-pwa dev service worker output so the next dev run
 * regenerates sw.js from vite.config.js (avoids stale allowlist / workbox).
 * We write stub files instead of deleting the directory so the plugin
 * doesn't throw ENOENT when it tries to read dev-dist/sw.js on startup.
 */
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(fileURLToPath(new URL('..', import.meta.url)), 'dev-dist')
await mkdir(root, { recursive: true })
await writeFile(resolve(root, 'sw.js'), '// dev service worker placeholder\n', 'utf8')
// workbox file name varies per build; write the common one vite-plugin-pwa looks for
const workboxFiles = ['workbox-dev.js']
for (const f of workboxFiles) {
  await writeFile(resolve(root, f), '// workbox dev placeholder\n', 'utf8').catch(() => {})
}
