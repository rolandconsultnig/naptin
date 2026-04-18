# NAPTIN — Ubuntu 22 production deployment

Deploy from the GitHub repo into a **dedicated folder** on the server. PostgreSQL is assumed **already installed**; create a DB and user for this app only.

**Repository:** `https://github.com/rolandconsultnig/naptin`

**Example server IP:** `13.53.33.63` (replace with yours.)

**Repository root:** Commands below use **`/opt/naptin`** as the folder that contains `package.json` (clone with `git clone <repo> .` into an empty `/opt/naptin`). If you instead cloned into a **subfolder** (e.g. `git clone <repo> app` then `cd app`), prefix paths with **`/opt/naptin/app`** instead of **`/opt/naptin`**.

---

## Port map (this application)

| Port | Service | Bind | Purpose |
|------|---------|------|---------|
| **4001** | **NAPTIN web UI** (`vite preview`) | `0.0.0.0` (PM2) | Built SPA from `dist/` — open **`http://SERVER:4001`** in the browser. Run **`npm run build`** first. |
| **4002** | Node workbench API | all interfaces (default) | `server/index.js` — `/api/v1/*` (`API_PORT=4002`). Set **`VITE_WORKBENCH_API_URL`** to `http://SERVER:4002/api/v1` if the UI is on 4001. |
| **4003** | Owl Talk (Python) | per `dev/main.py` | Chat REST + Socket.IO. |

**PM2:** `pm2 start deploy/pm2.ecosystem.config.cjs` starts **`naptin-web`** (4001), **`naptin-api`** (4002), and **`naptin-chat`** (4003, Owl Talk).

**Firewall:** open **4001**, **4002**, and **4003** if the browser calls those ports directly (typical when using `vite preview` + Node + Python without Nginx). Prefer Nginx + TLS in front when going public.

**Nginx optional:** If you terminate TLS on Nginx, you can `proxy_pass http://127.0.0.1:4001` for `/` instead of serving `dist/` as files.

---

## Step-by-step for novices (copy in order)

Do this **on your Ubuntu server** (SSH in first). Replace `portal.example.com` with your real domain (DNS must point to this server). Replace passwords with strong ones.

### Step 0 — Log in and update the server

```bash
ssh your_user@13.53.33.63
sudo apt update
sudo apt upgrade -y
```

### Step 1 — Install tools (if not already installed)

```bash
sudo apt install -y git curl nginx
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g pm2
sudo apt install -y certbot python3-certbot-nginx
```

### Step 2 — Create folder and download the app from GitHub

```bash
sudo mkdir -p /opt/naptin
sudo chown $USER:$USER /opt/naptin
cd /opt/naptin
git clone https://github.com/rolandconsultnig/naptin.git .
npm ci
```

### Step 3 — Create the database user and database (PostgreSQL)

Open PostgreSQL as the `postgres` system user:

```bash
sudo -u postgres psql
```

Inside `psql`, type **each line below and press Enter** (use your own password instead of `your-strong-password`):

```sql
CREATE USER naptin_app WITH PASSWORD 'your-strong-password';
CREATE DATABASE naptin_portal OWNER naptin_app;
GRANT ALL PRIVILEGES ON DATABASE naptin_portal TO naptin_app;
```

Now switch to the new database (**this must be its own line**):

```text
\c naptin_portal
```

Then run:

```sql
GRANT ALL ON SCHEMA public TO naptin_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO naptin_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO naptin_app;
\q
```

### Step 4 — Create the `.env` file

```bash
cd /opt/naptin
cp deploy/env.production.example .env
chmod 600 .env
nano .env
```

In the editor: set `DATABASE_URL` (same password as Step 3), set `VITE_*` URLs to `https://portal.example.com` (your domain). Save: **Ctrl+O**, Enter, exit: **Ctrl+X**.

**Important:** Use database user **`naptin_app`**, not `postgres`, unless you deliberately use the superuser:

```env
DATABASE_URL=postgresql://naptin_app:your-strong-password@127.0.0.1:5432/naptin_portal
```

If the password contains `@`, `#`, `/`, etc., you must [URL-encode](https://en.wikipedia.org/wiki/Percent-encoding) those characters in the URL.

Check that the line exists before continuing:

```bash
cd /opt/naptin
grep '^DATABASE_URL=' .env
```

### Step 5 — Build the website and load database tables

```bash
cd /opt/naptin
npm run build
# Full schema + seeds in one go (recommended for first deploy):
npm run db:all
# Or run individual steps: npm run db:schema && npm run db:seed && …
```

**If you see `password authentication failed for user "postgres"`:**  
The app is **not** reading your `.env`, or `DATABASE_URL` still points at user `postgres`. Fix:

1. Confirm the file path: **`/opt/naptin/.env`** (same folder as `package.json`).
2. Run `grep DATABASE_URL /opt/naptin/.env` — it must use **`naptin_app`** and the **exact** password from Step 3.
3. No quotes around the URL unless your tooling requires them; avoid spaces around `=`.
4. Test a manual connection:  
   `psql "postgresql://naptin_app:your-strong-password@127.0.0.1:5432/naptin_portal" -c 'SELECT 1'`  
   If that fails, fix PostgreSQL user/password before re-running `npm run db:*`.

### Step 5b — Owl Talk (Messages / chat) — Python venv on port 4003

The portal **Messages** screen needs Owl Talk running. Without it, the browser shows “Connecting…” and WebSocket errors to `:4003`.

```bash
cd /opt/naptin
sudo apt install -y python3 python3-pip python3-venv
cd dev
python3 -m venv venv
./venv/bin/pip install --upgrade pip
./venv/bin/pip install -r requirements.txt
cd ..
```

`deploy/pm2.ecosystem.config.cjs` uses **`dev/venv/bin/python`** for **`naptin-chat`**. Owl Talk reads **`DATABASE_URL`** (or **`OWL_TALK_DATABASE_URL`**) from `.env` via PM2.

### Step 6 — Start web + API + chat with PM2

```bash
cd /opt/naptin
pm2 start deploy/pm2.ecosystem.config.cjs
pm2 save
```

Link PM2 so it starts after reboot (run the **long command** PM2 prints):

```bash
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
```

Then:

```bash
pm2 save
```

Check the API:

```bash
curl -sS http://127.0.0.1:4002/api/v1/health
```

You should see JSON with `"ok": true` if the database connection works.

Check Owl Talk (from the server):

```bash
curl -sS http://127.0.0.1:4003/health
```

You should see JSON like `"status": "healthy"`. If **`naptin-chat`** crashes, run `pm2 logs naptin-chat --lines 80` (often missing `venv` or `pip install`).

### Step 7 — Configure Nginx

Edit the site file (use your domain in the file):

```bash
sudo cp /opt/naptin/deploy/nginx-site.example.conf /etc/nginx/sites-available/naptin
sudo nano /etc/nginx/sites-available/naptin
```

Change every `portal.example.com` to your domain. If you do **not** have SSL certificates yet, temporarily comment out the `listen 443` `server { ... }` block or run Step 8 first for HTTP-only test.

Enable the site and reload Nginx:

```bash
sudo ln -sf /etc/nginx/sites-available/naptin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### Step 8 — HTTPS certificate (Let’s Encrypt)

```bash
sudo certbot --nginx -d portal.example.com
```

(Use your real domain.) Follow the prompts.

### Step 9 — (Optional) Owl Talk chat on port 4003

Only if you need the Python chat backend. This is more advanced; skip if unsure.

```bash
cd /opt/naptin/dev
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

If `requirements.txt` is missing, install what `dev/README.md` says, then run `main.py` with **systemd** so it stays up (port **4003**, localhost only).

### Step 10 — (Optional) Quick test of built files on port 4001

```bash
cd /opt/naptin
npx vite preview --host 127.0.0.1 --port 4001
```

Open another SSH session and run `curl http://127.0.0.1:4001` — this is only for testing; real users use Nginx on 443.

### Later — How to update the app

```bash
cd /opt/naptin
git pull
npm ci
npm run build
pm2 restart naptin-web naptin-api naptin-chat
pm2 save
```

---

## 1. Install directory and clone

Use a single app root (adjust user/group to your policy):

```bash
sudo mkdir -p /opt/naptin
sudo chown $USER:$USER /opt/naptin
cd /opt/naptin
git clone https://github.com/rolandconsultnig/naptin.git .
npm ci
```

All commands below assume **`/opt/naptin`** as the working copy (same folder as `package.json`).

---

## 2. PostgreSQL (existing server)

As superuser (`sudo -u postgres psql`), run **one statement per line** (do not paste `\c` and `GRANT` on the same line).

```sql
CREATE USER naptin_app WITH PASSWORD 'your-strong-password';
CREATE DATABASE naptin_portal OWNER naptin_app;
GRANT ALL PRIVILEGES ON DATABASE naptin_portal TO naptin_app;
```

Then connect, then grants:

```text
\c naptin_portal
```

```sql
GRANT ALL ON SCHEMA public TO naptin_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO naptin_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO naptin_app;
\q
```

---

## 3. Environment file

Create **`/opt/naptin/.env`** (mode `600`):

```env
# PostgreSQL (existing instance, local socket or 127.0.0.1)
DATABASE_URL=postgresql://naptin_app:your-strong-password@127.0.0.1:5432/naptin_portal

# Node API — must match Nginx proxy (see deploy/nginx-site.example.conf)
API_PORT=4002

# Built SPA: your public HTTPS origin + /api/v1
VITE_WORKBENCH_API_URL=https://portal.example.com/api/v1

# Production chat: same origin; Nginx proxies /api/ and /socket.io/ to 127.0.0.1:4003
VITE_CHAT_API_URL=https://portal.example.com/api
VITE_CHAT_SOCKET_URL=https://portal.example.com
```

Replace `portal.example.com` with your real hostname (DNS A → server IP).

**Build** (embeds `VITE_*`):

```bash
cd /opt/naptin
npm run build
```

**Migrations / seed** (`.env` must exist in the **repository root** next to `package.json`; `db:apply` loads it via `dotenv`):

```bash
npm run db:schema
npm run db:seed
npm run db:rbac:schema
npm run db:rbac:seed
```

---

## 4. Nginx (new `server_name` only)

Copy `deploy/nginx-site.example.conf`, edit `server_name` and SSL paths, then:

```bash
sudo cp /opt/naptin/deploy/nginx-site.example.conf /etc/nginx/sites-available/naptin
sudo ln -sf /etc/nginx/sites-available/naptin /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d portal.example.com
```

**Order matters:** `location /api/v1/` (Node on **4002**) must come **before** `location /api/` (Python on **4003**).

---

## 5. Process manager — Node API on 4002

```bash
cd /opt/naptin
pm2 start deploy/pm2.ecosystem.config.cjs
pm2 save
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME
# run the command PM2 prints, then: pm2 save
```

Health:

```bash
curl -sS http://127.0.0.1:4002/api/v1/health
```

---

## 6. Owl Talk on 4003 (optional)

Python venv, bind to localhost in **production** (use a systemd unit or PM2 `interpreter`).

```bash
cd /opt/naptin/dev
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt   # if present; else install flask, flask-socketio, etc. per dev/README
```

Ensure `dev/main.py` uses port **4003** (default in this repo). For production, prefer **`systemd`** with `ExecStart` running `main.py` and `Environment` for DB URL if you override it.

**Do not** open port 4003 in the cloud security group.

---

## 7. Optional: Vite preview on 4001

Only for local verification on the server:

```bash
cd /opt/naptin
npx vite preview --host 127.0.0.1 --port 4001
```

Then `curl http://127.0.0.1:4001` — not for public use; use Nginx + `dist/` for production.

---

## 8. Updates

```bash
cd /opt/naptin
git pull
npm ci
npm run build
pm2 restart naptin-web naptin-api naptin-chat
pm2 save
```

---

## 9. Firewall

Allow **22**, **80**, **443** only. **PostgreSQL 5432**, **4001–4003** stay internal.

If browsers hit **`http://SERVER:4001`** (vite preview) and **`http://SERVER:4003`** (Owl) **directly**, open **4001**, **4002**, and **4003** on the cloud **security group** and **`ufw`** — otherwise you will see **`net::ERR_CONNECTION_REFUSED`**.

---

## 10. Troubleshooting

### `curl http://127.0.0.1:4003/health` → **Connection reset by peer**

The repo includes **`dev/ssl/cert.pem`** + **`key.pem`**. With those files present, Owl starts **HTTPS-only** on 4003. Plain **`http://`** requests then fail (often “connection reset”). Use **`curl -vk https://127.0.0.1:4003/health`**, **or** set **`OWL_TALK_DISABLE_SSL=1`** so Owl serves **HTTP** (PM2 **`deploy/pm2.ecosystem.config.cjs`** sets this for **`naptin-chat`**), then **`pm2 restart naptin-chat`**.

### `GET http://SERVER:4003/... net::ERR_CONNECTION_REFUSED`

Owl Talk is not accepting connections (or the port is blocked).

1. On the server: `pm2 logs naptin-chat --lines 80` — fix **venv** (`dev/venv`, `pip install -r dev/requirements.txt`), **`.env`** / DB, or Python tracebacks until the app stays **online**.
2. `ss -tlnp | grep 4003` — you should see a listener on **`0.0.0.0:4003`** (or similar).
3. From your laptop: `curl -sS http://SERVER:4003/health` — must return JSON, not timeout.
4. **AWS:** security group inbound **TCP 4003** (same for **4001** / **4002** if you use them from the browser).

Chat login (`/api/login`, `/api/me` on port **4003**) is **Owl Talk**. The workbench API is on **4002** under **`/api/v1/`** — different service.

### `manifest.webmanifest` — “Line 1, column 1, Syntax error”

The browser received **HTML** (often `index.html`) instead of JSON. Typical causes:

- **Nginx** `try_files` sends the SPA shell for unknown URLs — use the explicit `location = /manifest.webmanifest` block in **`deploy/nginx-site.example.conf`** (and reload Nginx).
- **Stale service worker:** DevTools → Application → Service Workers → unregister, hard refresh.

Diagnostic (server): `chmod +x deploy/check-server-health.sh && ./deploy/check-server-health.sh`

---

## Files in this folder

| File | Purpose |
|------|---------|
| `README.md` | This guide |
| `env.production.example` | Copy to `/opt/naptin/.env` and edit |
| `nginx-site.example.conf` | Nginx template for SPA + API + chat |
| `pm2.ecosystem.config.cjs` | PM2: **naptin-web** (4001), **naptin-api** (4002), **naptin-chat** (4003) |
| `check-server-health.sh` | Quick checks for ports 4001–4003 + manifest first byte |
