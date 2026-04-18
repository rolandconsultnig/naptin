# NAPTIN production server — step-by-step

This guide covers the **staff portal** (Node API + Vite static build + PostgreSQL), **Owl Talk** (Flask + Socket.IO, often port **4003**), and optional **database backup/restore**.

Use a dedicated Linux user (e.g. `naptin`), HTTPS via **Nginx** or **Caddy**, and **secrets only in environment files** — never commit `.env` or raw database dumps to a public repo.

---

## 1. Prerequisites on the server

1. **Ubuntu/Debian** (or similar) with `sudo`.
2. Install **Node.js 20+** (LTS), **npm**, **Python 3.11+**, **pip**, **PostgreSQL 14+**, **Nginx** (or Caddy), **git**, **build-essential** (for native modules if needed).
3. Install PostgreSQL client tools if you will run `pg_dump` / `psql` on the server: `postgresql-client`.

---

## 2. Create system user and directories

```bash
sudo useradd -r -m -s /bin/bash naptin   # skip if user exists
sudo mkdir -p /opt/naptin
sudo chown naptin:naptin /opt/naptin
sudo su - naptin
cd /opt/naptin
git clone https://github.com/rolandconsultnig/naptin.git .
```

The working copy is **`/opt/naptin`** (same directory as `package.json`). If you use a subdirectory (e.g. `git clone … app`), replace **`/opt/naptin`** with **`/opt/naptin/app`** in all paths below.

---

## 3. PostgreSQL (single DB for portal + Owl Talk)

1. Create role and database (adjust names/passwords):

```bash
sudo -u postgres psql <<'SQL'
CREATE USER naptin_app WITH PASSWORD 'REPLACE_WITH_STRONG_PASSWORD';
CREATE DATABASE naptin_portal OWNER naptin_app;
GRANT ALL PRIVILEGES ON DATABASE naptin_portal TO naptin_app;
SQL
```

2. **Connection string** (used by Node API and recommended for Owl Talk):

```text
postgresql://naptin_app:REPLACE_WITH_STRONG_PASSWORD@127.0.0.1:5432/naptin_portal
```

3. On the server, from the repo root, create **`.env`** (not committed; e.g. **`/opt/naptin/.env`**):

```env
DATABASE_URL=postgresql://naptin_app:REPLACE@127.0.0.1:5432/naptin_portal
API_PORT=4002
NODE_ENV=production
```

4. **Apply schemas and seeds** (idempotent `CREATE IF NOT EXISTS` style):

```bash
cd /opt/naptin
npm ci
npm run db:all
```

5. **Optional — restore from a developer export** (`database/exports/naptin-pg-*.sql`):

```bash
# From your laptop you may have: npm run db:export → then scp the file up
scp ./database/exports/naptin-pg-YYYY-MM-DD.sql naptin@server:/tmp/
ssh naptin@server
sudo -u postgres psql -d naptin_portal -f /tmp/naptin-pg-YYYY-MM-DD.sql
# Or: psql "$DATABASE_URL" -f /tmp/naptin-pg-....sql
```

Use **restore only on empty/new DB** or accept overwrite risks. Prefer `db:all` + controlled migrations for production upgrades.

---

## 4. Node API (Express, port 4002)

```bash
cd /opt/naptin
npm ci
# .env must contain DATABASE_URL and API_PORT
node server/index.js   # smoke test; Ctrl+C after "listening"
```

Run under **PM2** (recommended in this repo):

```bash
npm install -g pm2
cd /opt/naptin
pm2 start deploy/pm2.ecosystem.config.cjs
pm2 save
pm2 startup   # follow printed instructions
```

---

## 5. Staff portal static build (Vite)

```bash
cd /opt/naptin
npm ci
npm run build
```

Serve **`dist/`** with Nginx (see §7). Set **`VITE_*` at build time** if you bake API URLs into the client; for same-origin `/api` proxy, configure Nginx to forward `/api` to `127.0.0.1:4002`.

---

## 6. Owl Talk (Flask + Socket.IO)

1. Python venv:

```bash
cd /opt/naptin/dev
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

2. Optional **`dev/.env`** (not committed); otherwise Owl reads **`DATABASE_URL`** from the repo root **`.env`** (PM2 passes it in `deploy/pm2.ecosystem.config.cjs`):

```env
OWL_TALK_DATABASE_URL=postgresql://naptin_app:REPLACE@127.0.0.1:5432/naptin_portal
SECRET_KEY=<long-random-hex>
FLASK_ENV=production
```

3. **Do not** rely on default credentials in code; always set `OWL_TALK_DATABASE_URL` or root `DATABASE_URL` before `create_all()`.

4. **Process manager:** `pm2 start deploy/pm2.ecosystem.config.cjs` runs **`naptin-chat`** (`dev/main.py`) on **4003** (see `deploy/README.md`). For larger scale, consider Gunicorn + eventlet behind Nginx instead of the embedded server.

5. **Uploaded files:** ensure `dev/uploads` (or paths used in `main.py`) exist and are writable by the app user.

6. **Ignore on deploy:** do not deploy `flask_session/` or dev-only `static/uploads` test binaries; sessions should be server-local or Redis in production for multi-instance.

---

## 7. Nginx (example sketch)

- **Site root:** point Nginx `root` at **`<repo>/dist/`** (e.g. `/opt/naptin/dist/` — see `deploy/nginx-site.example.conf`)
- **`location /api/v1/`** → Node workbench API on **4002** (must be **before** `/api/` if both exist)
- **`location /api/`** (other paths) → Owl Talk on **4003** — match `deploy/nginx-site.example.conf` and your `VITE_CHAT_*` URLs
- **WebSocket** for Socket.IO: `proxy_http_version 1.1`, `Upgrade` and `Connection` headers to the Owl upstream

Test with `curl -I https://your-domain/`.

---

## 8. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 'Nginx Full'   # or 80/443
sudo ufw enable
```

Only **localhost** should reach **4002** and **4003** if Nginx terminates TLS and proxies inward.

**AWS / cloud:** If browsers talk to **4001**, **4002**, and **4003** on the public IP (no reverse proxy yet), add **inbound security group** rules for those TCP ports.

---

## 9. Ongoing operations

| Task | Command / note |
|------|----------------|
| API logs | `pm2 logs naptin-api` or `journalctl -u naptin-api` |
| DB backup | `pg_dump` (see `npm run db:export` on a trusted machine) |
| Schema update | Pull `main`, run `npm run db:all` or targeted `npm run db:apply -- server/....sql` |
| Owl deps | `pip install -r dev/requirements.txt` after pull |

---

## 10. After every `git pull` (server)

From repository root (e.g. `/opt/naptin`):

```bash
git pull
npm ci
npm run build
pm2 restart naptin-web naptin-api naptin-chat
pm2 save
```

Run `npm run db:all` (or targeted `npm run db:apply -- server/….sql`) only when the repo adds or changes SQL migrations.

---

## 11. Checklist before go-live

- [ ] Strong `DATABASE_URL` / `OWL_TALK_DATABASE_URL` and `SECRET_KEY`
- [ ] `npm run db:all` applied on production DB
- [ ] `npm run build` deployed; browser loads SPA and API health: `GET /api/v1/health` → `{ ok: true, db: "connected" }`
- [ ] Owl Talk login + send message + reply with media (if used)
- [ ] TLS certificates installed and auto-renewed
- [ ] No `.env` or `*.sql` dumps in public git history

For Owl-only details, see also `dev/PRODUCTION_GUIDE.md`.
