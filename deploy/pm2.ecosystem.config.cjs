/**
 * PM2 — from repo root: pm2 start deploy/pm2.ecosystem.config.cjs
 *
 * naptin-web  → SPA (built dist) on port 4001 — run `npm run build` first; `vite preview`
 * naptin-api  → workbench API on 4002 — reads .env (DATABASE_URL, API_PORT)
 *
 * Browser: http://YOUR_SERVER:4001  (open 4001/tcp on firewall if needed)
 */
const root = __dirname + '/..'

module.exports = {
  apps: [
    {
      name: 'naptin-web',
      cwd: root,
      script: './node_modules/vite/bin/vite.js',
      args: 'preview --host 0.0.0.0 --port 4001',
      interpreter: 'node',
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
  ],
}
