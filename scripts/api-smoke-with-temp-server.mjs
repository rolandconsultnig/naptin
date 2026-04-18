import { spawn } from 'node:child_process'

const cwd = process.cwd()
const port = 4102

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function run() {
  const server = spawn('node', ['server/index.js'], {
    cwd,
    env: { ...process.env, API_PORT: String(port) },
    stdio: ['ignore', 'pipe', 'pipe'],
  })

  let serverReady = false
  server.stdout.on('data', (chunk) => {
    const line = String(chunk)
    process.stdout.write(`[temp-api] ${line}`)
    if (line.includes(`http://localhost:${port}`)) serverReady = true
  })
  server.stderr.on('data', (chunk) => process.stderr.write(`[temp-api] ${String(chunk)}`))

  await sleep(2500)
  if (!serverReady) {
    console.log('[temp-api] did not confirm ready message within 2.5s, proceeding with smoke anyway...')
  }

  const smoke = spawn('node', ['scripts/api-smoke-runtime.mjs'], {
    cwd,
    env: { ...process.env, API_BASE_URL: `http://127.0.0.1:${port}/api/v1` },
    stdio: 'inherit',
  })

  const exitCode = await new Promise((resolve) => {
    smoke.on('close', (code) => resolve(code ?? 1))
  })

  server.kill('SIGTERM')
  await sleep(300)
  if (!server.killed) {
    server.kill('SIGKILL')
  }

  process.exitCode = exitCode
}

run().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
