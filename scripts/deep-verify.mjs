#!/usr/bin/env node
/**
 * Deep verification pipeline (static + unit + build + HTTP audit).
 * Not literal line coverage — use `npm run test:coverage` when Vitest is added.
 */
import { execFileSync, spawnSync } from 'node:child_process'
import { readdirSync, statSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '..')

let failed = false
function fail(msg) {
  console.error(msg)
  failed = true
}

function walkJsFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    const st = statSync(p)
    if (st.isDirectory()) walkJsFiles(p, out)
    else if (name.endsWith('.js')) out.push(p)
  }
  return out
}

function phase(name, fn) {
  console.log(`\n${'═'.repeat(60)}\n  ${name}\n${'═'.repeat(60)}`)
  try {
    fn()
  } catch (e) {
    fail(`${name}: ${e?.message || e}`)
  }
}

phase('Syntax: node --check on server/**/*.js', () => {
  const files = walkJsFiles(join(root, 'server'))
  let bad = 0
  for (const f of files) {
    const r = spawnSync(process.execPath, ['--check', f], {
      encoding: 'utf8',
      cwd: root,
    })
    if (r.status !== 0) {
      console.error(`  FAIL ${f}\n${r.stderr}`)
      bad++
    } else {
      console.log(`  OK   ${f.replace(root + '\\', '').replace(root + '/', '')}`)
    }
  }
  if (bad) fail(`Syntax check: ${bad} file(s) failed`)
  else console.log(`  ${files.length} file(s) OK`)
})

phase('Unit: npm test', () => {
  const r = spawnSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'test'],
    { encoding: 'utf8', cwd: root, shell: process.platform === 'win32' }
  )
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.status !== 0) fail(`npm test exited ${r.status}`)
})

phase('Build: vite build', () => {
  const r = spawnSync(
    process.platform === 'win32' ? 'npm.cmd' : 'npm',
    ['run', 'build'],
    { encoding: 'utf8', cwd: root, shell: process.platform === 'win32' }
  )
  if (r.stdout) process.stdout.write(r.stdout)
  if (r.stderr) process.stderr.write(r.stderr)
  if (r.status !== 0) fail(`npm run build exited ${r.status}`)
})

if (process.env.DEEP_VERIFY_SKIP_HTTP === '1') {
  console.log('\n(Skipping HTTP audit — set DEEP_VERIFY_SKIP_HTTP unset to run against localhost:4002)\n')
} else {
  phase('Integration: npm run audit:integration', () => {
    const r = spawnSync(
      process.platform === 'win32' ? 'npm.cmd' : 'npm',
      ['run', 'audit:integration'],
      { encoding: 'utf8', cwd: root, shell: process.platform === 'win32' }
    )
    if (r.stdout) process.stdout.write(r.stdout)
    if (r.stderr) process.stderr.write(r.stderr)
    if (r.status !== 0) fail(`audit:integration exited ${r.status}`)
  })
}

phase('Optional: Python compile dev/ (Owl Talk)', () => {
  try {
    execFileSync(
      process.platform === 'win32' ? 'py' : 'python3',
      ['-m', 'compileall', '-q', join(root, 'dev')],
      { stdio: 'pipe', cwd: root }
    )
    console.log('  compileall dev/: OK')
  } catch {
    try {
      execFileSync('python', ['-m', 'compileall', '-q', join(root, 'dev')], {
        stdio: 'pipe',
        cwd: root,
      })
      console.log('  compileall dev/: OK (python)')
    } catch (e2) {
      console.log('  skipped (python not on PATH)')
    }
  }
})

console.log(`\n${failed ? '❌ deep-verify finished with failures' : '✅ deep-verify finished OK'}\n`)
process.exit(failed ? 1 : 0)
