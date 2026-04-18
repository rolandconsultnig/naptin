/**
 * PM2 — from repo root: pm2 start deploy/pm2.ecosystem.config.cjs
 *
 * naptin-web  → SPA (built dist) on port 4001 — run `npm run build` first; `vite preview`
 * naptin-api  → workbench API on 4002 — reads .env (DATABASE_URL, API_PORT)
 * naptin-chat → Owl Talk (Python `dev/main.py`) on 4003 — create `dev/venv` and `pip install -r dev/requirements.txt` first
 *
 * Browser: http://YOUR_SERVER:4001 — PM2 runs `npm run preview` (see package.json); open firewall for 4001–4003 if browsers hit ports directly
 */
const path = require('path')
const root = path.join(__dirname, '..')

require('dotenv').config({ path: path.join(root, '.env') })

const owlDb = process.env.OWL_TALK_DATABASE_URL || process.env.DATABASE_URL || ''

module.exports = {
  apps: [
    {
      name: 'naptin-web',
      cwd: root,
      // Use npm script (see package.json "preview") — avoids PM2 mishandling vite.js path + interpreter on some setups
      script: 'npm',
      args: 'run preview',
      instances: 1,
      exec_mode: 'fork',
      env: { NODE_ENV: 'production' },
    },
    {
      name: 'naptin-api',
      cwd: root,
      script: 'server/index.js',
      interpreter: 'node',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        API_PORT: '4002',
      },
    },
    {
      name: 'naptin-chat',
      cwd: path.join(root, 'dev'),
      script: 'main.py',
      interpreter: path.join(root, 'dev', 'venv', 'bin', 'python'),
      instances: 1,
      exec_mode: 'fork',
      env: {
        FLASK_ENV: 'production',
        PYTHONUNBUFFERED: '1',
        OWL_TALK_PORT: '4003',
        /* Repo ships dev/ssl/*.pem — without this, Owl listens HTTPS-only and http:// browsers get connection resets */
        OWL_TALK_DISABLE_SSL: '1',
        ...(owlDb ? { OWL_TALK_DATABASE_URL: owlDb, DATABASE_URL: owlDb } : {}),
        ...(process.env.OWL_TALK_CORS_ORIGINS
          ? { OWL_TALK_CORS_ORIGINS: process.env.OWL_TALK_CORS_ORIGINS }
          : {}),
      },
    },
  ],
}
