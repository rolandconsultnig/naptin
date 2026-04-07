const baseUrl = process.env.HRMS_SMOKE_BASE_URL || 'https://localhost:5117'
let sessionCookie = process.env.HRMS_SMOKE_COOKIE || ''
const allowWrites = String(process.env.HRMS_SMOKE_WRITE || '').trim() === '1'
const insecureTls = String(process.env.HRMS_SMOKE_INSECURE_TLS || '').trim() === '1'
const autoAuth = String(process.env.HRMS_SMOKE_AUTO_AUTH || '1').trim() === '1'
const autoRegister = String(process.env.HRMS_SMOKE_AUTO_REGISTER || '1').trim() === '1'
const authUsername = String(process.env.HRMS_SMOKE_USERNAME || '').trim()
const authPassword = String(process.env.HRMS_SMOKE_PASSWORD || '').trim()
const authEmail = String(process.env.HRMS_SMOKE_EMAIL || '').trim()

if (insecureTls) {
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0'
}

const headers = {
  Accept: 'application/json',
}

function cookieHeader() {
  return sessionCookie ? { Cookie: sessionCookie } : {}
}

function updateSessionCookie(response) {
  const rawCookie = response.headers.get('set-cookie')
  if (!rawCookie) return
  const nextCookie = rawCookie.split(';')[0]?.trim()
  if (nextCookie) {
    sessionCookie = nextCookie
  }
}

async function authRequest(path, options = {}) {
  const response = await fetch(`${baseUrl}${path}`, {
    ...options,
    headers: {
      ...headers,
      ...cookieHeader(),
      ...(options.headers || {}),
    },
  })
  updateSessionCookie(response)
  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const body = contentType.includes('application/json') && text ? JSON.parse(text) : text
  return { response, body }
}

async function tryLogin(username, password) {
  const { response, body } = await authRequest('/api/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  })
  if (!response.ok) return { ok: false, status: response.status, body }
  return { ok: true, status: response.status, body }
}

async function tryRegister(username, email, password) {
  const { response, body } = await authRequest('/api/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, email, password }),
  })
  if (!response.ok) return { ok: false, status: response.status, body }
  return { ok: true, status: response.status, body }
}

async function ensureAuthenticated() {
  if (sessionCookie || !autoAuth) return

  const fallbackUsername = `hrms-smoke-${Date.now()}`
  const username = authUsername || fallbackUsername
  const password = authPassword || 'SmokePass#2026'
  const email = authEmail || `${username}@naptin.local`

  const loginResult = await tryLogin(username, password)
  if (loginResult.ok && sessionCookie) {
    console.log(`Auth: logged in as ${username}`)
    return
  }

  if (!autoRegister) {
    throw new Error('Auto-auth failed. Set HRMS_SMOKE_COOKIE or provide valid HRMS_SMOKE_USERNAME/HRMS_SMOKE_PASSWORD.')
  }

  const registerResult = await tryRegister(username, email, password)
  if (!registerResult.ok && registerResult.status !== 400) {
    const detail = typeof registerResult.body === 'string' ? registerResult.body : registerResult.body?.error || JSON.stringify(registerResult.body)
    throw new Error(`Auto-register failed (${registerResult.status}): ${detail}`)
  }

  if (sessionCookie) {
    console.log(`Auth: registered and authenticated as ${username}`)
    return
  }

  const secondLogin = await tryLogin(username, password)
  if (secondLogin.ok && sessionCookie) {
    console.log(`Auth: logged in after register as ${username}`)
    return
  }

  throw new Error('Unable to establish authenticated session. Set HRMS_SMOKE_COOKIE or valid HRMS_SMOKE_USERNAME/HRMS_SMOKE_PASSWORD.')
}

async function request(path, options = {}) {
  let response
  try {
    response = await fetch(`${baseUrl}${path}`, {
      ...options,
      headers: {
        ...headers,
        ...cookieHeader(),
        ...(options.headers || {}),
      },
    })
    updateSessionCookie(response)
  } catch (err) {
    const hint = [
      `Unable to reach ${baseUrl}`,
      'Set HRMS_SMOKE_BASE_URL to your running backend origin (e.g. https://localhost:5117).',
      'If using a local self-signed cert, set HRMS_SMOKE_INSECURE_TLS=1.',
      'If endpoint requires auth, set HRMS_SMOKE_COOKIE=session=...'
    ].join(' ')
    throw new Error(`${hint} Root cause: ${err?.message || 'network error'}`)
  }

  const text = await response.text()
  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')
  const body = isJson && text ? JSON.parse(text) : text

  if (!response.ok) {
    const detail = typeof body === 'string' ? body : body?.error || JSON.stringify(body)
    throw new Error(`${options.method || 'GET'} ${path} failed (${response.status}): ${detail}`)
  }

  return { response, body }
}

function expect(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function run() {
  console.log(`HRMS Slice 4 smoke: ${baseUrl}`)
  console.log(`TLS verification: ${insecureTls ? 'disabled (HRMS_SMOKE_INSECURE_TLS=1)' : 'enabled'}`)
  console.log(sessionCookie ? 'Cookie header: provided' : `Cookie header: missing (auto-auth ${autoAuth ? 'enabled' : 'disabled'})`)
  if (autoAuth) {
    console.log('Auth options: HRMS_SMOKE_COOKIE, or HRMS_SMOKE_USERNAME/HRMS_SMOKE_PASSWORD (auto-register default: on).')
  }

  await ensureAuthenticated()
  console.log(sessionCookie ? 'Session cookie: established' : 'Session cookie: unavailable')

  const leavePolicy = await request('/api/hrms/leave-policy')
  expect(leavePolicy.body?.policy?.leave_types, 'leave-policy missing leave_types')
  console.log('OK  GET /api/hrms/leave-policy')

  const accrual = await request('/api/hrms/leave-accrual-preview')
  expect(Array.isArray(accrual.body?.items), 'leave-accrual-preview missing items array')
  console.log('OK  GET /api/hrms/leave-accrual-preview')

  const postingConfig = await request('/api/hrms/payroll-posting-config')
  expect(postingConfig.body?.config?.posting_mode, 'payroll-posting-config missing posting_mode')
  console.log('OK  GET /api/hrms/payroll-posting-config')

  const reportJson = await request('/api/hrms/payroll-runs/report?format=json')
  expect(Array.isArray(reportJson.body?.items), 'payroll report json missing items array')
  console.log('OK  GET /api/hrms/payroll-runs/report?format=json')

  const reportCsv = await request('/api/hrms/payroll-runs/report?format=csv')
  expect(typeof reportCsv.body === 'string' && reportCsv.body.includes('run_id,'), 'payroll report csv invalid')
  console.log('OK  GET /api/hrms/payroll-runs/report?format=csv')

  const auditTrail = await request('/api/hrms/audit-trail?limit=10')
  expect(Array.isArray(auditTrail.body?.items), 'audit-trail missing items array')
  console.log('OK  GET /api/hrms/audit-trail?limit=10')

  if (allowWrites) {
    await request('/api/hrms/leave-policy', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(leavePolicy.body.policy),
    })
    console.log('OK  PUT /api/hrms/leave-policy (idempotent)')

    await request('/api/hrms/payroll-posting-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(postingConfig.body.config),
    })
    console.log('OK  PUT /api/hrms/payroll-posting-config (idempotent)')
  } else {
    console.log('SKIP write checks (set HRMS_SMOKE_WRITE=1 to include idempotent PUT checks)')
  }

  console.log('Slice 4 smoke checks passed.')
}

run().catch((err) => {
  console.error(`Slice 4 smoke failed: ${err.message}`)
  process.exit(1)
})
