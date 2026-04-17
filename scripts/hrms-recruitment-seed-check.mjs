import 'dotenv/config'
import pg from 'pg'

const { Client } = pg

const client = new Client({
  connectionString: process.env.DATABASE_URL,
})

const tables = [
  'hr_job_openings',
  'hr_candidates',
  'hr_interviews',
  'hr_onboarding_checklists',
]

async function getCounts() {
  const counts = {}
  for (const t of tables) {
    const r = await client.query(`SELECT COUNT(*)::int AS n FROM ${t}`)
    counts[t] = r.rows[0].n
  }
  return counts
}

try {
  await client.connect()

  const before = await getCounts()

  await client.query('BEGIN')
  try {
    let jobId = null
    let employeeId = null

    if (before.hr_job_openings === 0) {
      const r = await client.query(
        `INSERT INTO hr_job_openings
          (title, employment_type, vacancies, description, status, posted_by)
         VALUES
          ('Starter Vacancy - HR Officer', 'permanent', 1, 'Auto-seeded starter vacancy for recruitment portal bootstrap.', 'open', 'system')
         RETURNING id`
      )
      jobId = r.rows[0].id
    } else {
      const r = await client.query(`SELECT id FROM hr_job_openings ORDER BY created_at DESC LIMIT 1`)
      jobId = r.rows[0]?.id ?? null
    }

    if (before.hr_candidates === 0 && jobId) {
      await client.query(
        `INSERT INTO hr_candidates
          (job_opening_id, first_name, last_name, email, pipeline_stage, source)
         VALUES
          ($1, 'Amina', 'Bello', 'amina.bello@naptin.gov.ng', 'screening', 'seed'),
          ($1, 'Samuel', 'Okon', 'samuel.okon@naptin.gov.ng', 'interview', 'seed')`,
        [jobId]
      )
    }

    if (before.hr_interviews === 0) {
      const r = await client.query(`SELECT id FROM hr_candidates ORDER BY created_at DESC LIMIT 1`)
      const candidateId = r.rows[0]?.id
      if (candidateId) {
        await client.query(
          `INSERT INTO hr_interviews
            (candidate_id, interviewer_name, interview_type, scheduled_at, duration_minutes, location, status)
           VALUES
            ($1, 'HR Panel', 'panel', NOW() + INTERVAL '2 days', 60, 'HQ Board Room', 'scheduled')`,
          [candidateId]
        )
      }
    }

    if (before.hr_onboarding_checklists === 0) {
      const e = await client.query(`SELECT id FROM hr_employees ORDER BY created_at ASC LIMIT 1`)
      employeeId = e.rows[0]?.id ?? null

      if (!employeeId) {
        const ins = await client.query(
          `INSERT INTO hr_employees
            (employee_id, first_name, last_name, email, employment_type, employment_status, step)
           VALUES
            ('NPT-ONB-SEED-001', 'Starter', 'Employee', 'starter.employee@naptin.gov.ng', 'permanent', 'active', 1)
           RETURNING id`
        )
        employeeId = ins.rows[0].id
      }

      await client.query(
        `INSERT INTO hr_onboarding_checklists
          (employee_id, task_title, assigned_to, due_date, status)
         VALUES
          ($1, 'Collect signed offer letter', 'HR Ops', CURRENT_DATE + 1, 'pending'),
          ($1, 'Create ICT account', 'ICT Service Desk', CURRENT_DATE + 2, 'pending'),
          ($1, 'Issue staff ID card', 'Admin Unit', CURRENT_DATE + 5, 'pending')`,
        [employeeId]
      )
    }

    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  }

  const after = await getCounts()
  console.log(JSON.stringify({ before, after }, null, 2))
} catch (e) {
  console.error(e.message)
  process.exit(1)
} finally {
  await client.end()
}
