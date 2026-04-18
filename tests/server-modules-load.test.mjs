/**
 * Ensures every Express route module parses and loads (side-effect: registers Router).
 */
import './env-bootstrap.mjs'
import { readdirSync } from 'node:fs'
import { test } from 'node:test'

const routesDir = new URL('../server/routes/', import.meta.url)

const files = readdirSync(routesDir).filter((f) => f.endsWith('.js')).sort()

for (const f of files) {
  test(`server/routes/${f} loads`, async () => {
    await import(new URL(`../server/routes/${f}`, import.meta.url))
  })
}

test('server/db.js loads', async () => {
  await import(new URL('../server/db.js', import.meta.url))
})
