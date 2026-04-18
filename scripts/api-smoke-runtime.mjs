import 'dotenv/config'

const base = process.env.API_BASE_URL?.trim() || 'http://127.0.0.1:4002/api/v1'

const truncate = (value, max = 220) => {
  const text = String(value ?? '')
  return text.length > max ? `${text.slice(0, max)}...` : text
}

async function hit(path) {
  const url = `${base}${path}`
  try {
    const res = await fetch(url)
    const text = await res.text()
    const compact = truncate(text.replace(/\s+/g, ' '))
    return {
      path,
      ok: res.ok,
      status: res.status,
      body: compact,
      raw: text,
    }
  } catch (error) {
    return {
      path,
      ok: false,
      status: -1,
      body: truncate(error?.message || String(error)),
      raw: '',
    }
  }
}

function printResult(result) {
  const prefix = result.ok ? 'OK ' : 'ERR'
  console.log(`${prefix} ${String(result.status).padStart(3, ' ')} ${result.path}`)
  if (result.body) console.log(`     ${result.body}`)
}

const internalAuditGetEndpoints = [
  '/internal-audit/dashboard',
  '/internal-audit/engagements',
  '/internal-audit/findings',
  '/internal-audit/cross-module/exceptions?module=accounts&limit=5',
  '/internal-audit/cross-module/exceptions?module=procurement&limit=5',
  '/internal-audit/cross-module/exceptions?module=store&limit=5',
  '/internal-audit/collaboration-matrix',
]

const collaborationGetEndpoints = [
  '/collaboration/calendar-events?year=2026&month=4',
  '/collaboration/forum/threads',
  '/collaboration/projects',
  '/collaboration/workspaces',
  '/collaboration/integrations/office',
  '/collaboration/files',
]

const allResults = []

for (const endpoint of [...internalAuditGetEndpoints, ...collaborationGetEndpoints]) {
  const result = await hit(endpoint)
  allResults.push(result)
  printResult(result)
}

const threads = await hit('/collaboration/forum/threads')
allResults.push(threads)
try {
  const parsed = JSON.parse(threads.raw || '[]')
  if (Array.isArray(parsed) && parsed[0]?.id) {
    const result = await hit(`/collaboration/forum/threads/${parsed[0].id}`)
    allResults.push(result)
    printResult(result)
  } else {
    console.log('SKIP      /collaboration/forum/threads/:id (no threads)')
  }
} catch {
  console.log('SKIP      /collaboration/forum/threads/:id (parse failed)')
}

const projects = await hit('/collaboration/projects')
allResults.push(projects)
try {
  const parsed = JSON.parse(projects.raw || '[]')
  if (Array.isArray(parsed) && parsed[0]?.id) {
    const result = await hit(`/collaboration/projects/${parsed[0].id}/tasks`)
    allResults.push(result)
    printResult(result)
  } else {
    console.log('SKIP      /collaboration/projects/:id/tasks (no projects)')
  }
} catch {
  console.log('SKIP      /collaboration/projects/:id/tasks (parse failed)')
}

const workspaces = await hit('/collaboration/workspaces')
allResults.push(workspaces)
try {
  const parsed = JSON.parse(workspaces.raw || '[]')
  if (Array.isArray(parsed) && parsed[0]?.id) {
    const members = await hit(`/collaboration/workspaces/${parsed[0].id}/members`)
    const documents = await hit(`/collaboration/workspaces/${parsed[0].id}/documents`)
    allResults.push(members, documents)
    printResult(members)
    printResult(documents)
  } else {
    console.log('SKIP      /collaboration/workspaces/:id/* (no workspaces)')
  }
} catch {
  console.log('SKIP      /collaboration/workspaces/:id/* (parse failed)')
}

const failed = allResults.filter((x) => !x.ok)
console.log('')
console.log(`Summary: ${allResults.length - failed.length} passed, ${failed.length} failed`) 

if (failed.length) {
  console.log('Failed endpoints:')
  for (const item of failed) {
    console.log(`- ${item.status} ${item.path}`)
  }
  process.exitCode = 1
}
