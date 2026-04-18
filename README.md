# NAPTIN Enterprise Staff Portal — Frontend v2.0

**National Power Training Institute of Nigeria**
Federal Ministry of Power · ISO 9001:2015 Certified · Est. 2009

---

## Tech Stack

| Tool | Version | Purpose |
|------|---------|---------|
| React | 18.2 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first styling |
| React Router | 6.22 | Client-side routing |
| Recharts | 2.12 | Charts & data viz |
| Lucide React | 0.363 | Icon library |
| Plus Jakarta Sans | Google Fonts | Primary typeface |
| JetBrains Mono | Google Fonts | Monospace / IDs |

---

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npm run dev
# → Opens at http://localhost:5173

# 2b. Start Workbench backend API (new)
npm run api
# → http://localhost:8080/api/v1

# 2c. Apply DB schema + seed (PostgreSQL)
npm run db:schema
npm run db:seed

# 2d. Apply RBAC schema + seed (Super Admin)
npm run db:rbac:schema
npm run db:rbac:seed

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

**Demo Login:**
- Email: `staff@naptin.gov.ng`
- Password: `naptin2026`

### Client Operations & New Markets Workbench
- Route: `/app/client-ops-markets`
- Sidebar: Departments → "Client Ops & New Markets"
- API base: `VITE_WORKBENCH_API_URL` (defaults to `http://localhost:8080/api/v1`)
- Backend schema: `server/schema.sql`
- Backend seed: `server/seed.sql`

### Database SQL runner
- Generic SQL apply: `npm run db:apply -- <path-to-sql-file>`
- Base workbench schema: `npm run db:schema`
- Base workbench seed: `npm run db:seed`
- RBAC schema: `npm run db:rbac:schema`
- RBAC seed: `npm run db:rbac:seed`

---

## Project Structure

```
naptin/
├── index.html                  # HTML entry point (Google Fonts loaded here)
├── vite.config.js              # Vite + React plugin
├── tailwind.config.js          # Tailwind + NAPTIN green token
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx                # React root + BrowserRouter
    ├── App.jsx                 # Route definitions (11 routes)
    ├── index.css               # Tailwind directives + design tokens
    │
    ├── assets/
    │   └── images.js           # Base64-embedded NAPTIN logo + engineer photo
    │
    ├── context/
    │   └── AuthContext.jsx     # Auth state, mock login, user object
    │
    ├── data/
    │   └── mock.js             # All mock data (staff, transactions, meetings…)
    │
    ├── components/
    │   └── layout/
    │       └── AppLayout.jsx   # Sidebar + topbar + notification panel
    │
    └── pages/
        ├── LandingPage.jsx     # Public homepage
        ├── LoginPage.jsx       # Split-screen login (logo + engineer photo)
        ├── DashboardPage.jsx   # KPIs, charts, activity feed, quick actions
        ├── IntranetPage.jsx    # Social feed, post composer, trending, online users
        ├── HRPage.jsx          # Staff directory, search, filter, staff modal
        ├── FinancePage.jsx     # Budget, bar chart, pie chart, transactions
        ├── MeetingsPage.jsx    # Live/upcoming meetings, schedule form
        ├── ChatPage.jsx        # Owl Talk (dev) chat + calls; see src/chat/
        ├── SelfServicePage.jsx # Leave apply, doc upload, leave history
        ├── TrainingPage.jsx    # Course catalogue, my courses, certificates
        ├── ProcurementPage.jsx # Purchase orders, vendor registry
        ├── AdminOperationsPage.jsx   # RTC / facilities / fleet (/admin/operations)
        ├── AdminOverviewPage.jsx     # Admin home
        ├── AdminModulesPage.jsx      # Module on/off
        ├── AdminPermissionsPage.jsx # RBAC matrix
        ├── AdminUsersPage.jsx        # User role overrides
        └── AdminAuditPage.jsx        # Audit log (sample)
```

---

## Brand & Design System

### NAPTIN Colours
| Token | Hex | Usage |
|-------|-----|-------|
| `naptin-green` | `#006838` | Primary — buttons, active states, headers |
| `naptin-dark` | `#004D28` | Hover states, pressed buttons |
| `naptin-gold` | `#FFD700` | Accents — hero text, stats, badges |
| `naptin-light` | `#E8F5EE` | Soft backgrounds |
| Surface | `#F7FAF8` | App background |

### CSS Component Classes (index.css)
```css
.btn-primary      /* NAPTIN green button */
.btn-secondary    /* White outlined button */
.card             /* White rounded panel with shadow */
.stat-card        /* KPI card variant */
.input            /* Form input with green focus ring */
.select           /* Form select */
.label            /* Form label (uppercase, small) */
.badge            /* Pill badge base */
.badge-green      /* Active / success */
.badge-amber      /* Warning / pending */
.badge-red        /* Error / rejected */
.badge-blue       /* Info / processing */
.sidebar-link     /* Sidebar nav item */
.table-th         /* Table header cell */
.table-td         /* Table data cell */
.animate-fade-up  /* Entry animation */
.animate-fade-in  /* Fade entry */
.scrollbar-thin   /* Custom thin scrollbar */
```

---

## Pages & Features

### 🔐 Login Page (`/login`)
- Split layout: NAPTIN green panel left, white form right
- Real NAPTIN logo (`Naptin.png`) embedded
- Real engineer photo (`engr.png`) — two NAPTIN engineers at 132kV substation
- Animated stats ticker (15,000+ trained, 8 RTCs, ISO cert, ANCEE)
- Nigerian flag colour bar
- SSO option (Microsoft/Google)
- Password show/hide toggle
- Form validation with error states
- Loading spinner on submit

### 🏠 Dashboard (`/app/dashboard`)
- Personalised welcome banner with staff name, role, staff ID
- 4 KPI cards (staff count, attendance, approvals, budget)
- Monthly expenditure bar chart
- Weekly attendance line chart
- Real-time activity feed (6 recent items)
- Quick actions grid (6 shortcuts)
- Department headcount bars

### 📡 Intranet Feed (`/app/intranet`)
- Post composer with Photo/File/Announce options
- Live feed with like/comment/share interactions
- Like toggle with count updates
- User profile card with stats
- Trending hashtags
- Online users panel with message button

### 👤 Human Resources (`/app/human-resource`)

Single nav entry for all HR capability. Tabs:

| Tab | Path | Notes |
|-----|------|--------|
| **People** | `/app/human-resource/people` | KPIs, staff table, filters, profile modal (HR staff only) |
| **Directory** | `/app/human-resource/directory` | Organisation directory (HR staff only) |
| **Operations** | `/app/human-resource/operations` | Recruitment, onboarding, payroll runs, talent, performance, attendance |
| **Enterprise HRMS** | `/app/human-resource/enterprise` | 12-area suite; deep links e.g. `?section=payroll`; mock data in `src/data/hrmsEnterprise.js` |
| **Self-service** | `/app/human-resource/self-service` | Leave, documents, payslips — **all staff** (any department) |

Legacy URLs (`/app/hr`, `/app/directory`, `/app/hr-erp`, `/app/hrms`, `/app/self-service`) redirect into the paths above.

**Department-based access:** After login, `user.department` (from the auth profile) controls which **departmental** modules appear and load. Workspace items (dashboard, intranet, collaboration, chat, meetings, profile) stay shared. **Director** and **ICT admin** demo roles bypass department scoping and may open every module allowed by the admin policy. Mapping lives in `src/auth/departmentAccess.js`.

### HR module — feature inventory (what to expect)
| Area | Capability (prototype) |
|------|-------------------------|
| Human Resources (`/app/human-resource`) | Consolidated People, Directory, Operations, Enterprise HRMS, Self-service |
| My profile | **Workspace** — `/app/profile` |
| Governance | Admin portal modules + RBAC matrix (`/admin`); segment key `human-resource` |

*Backend not included:* live payroll calculation, e-payslip PDF generation, full ATS, e-sign offers, 360 workflows — wire via API when ready.

### 💰 Finance (`/app/finance`)
- Budget utilisation progress bar
- Monthly expenditure bar chart
- Budget-by-category pie chart
- Transaction table with status badges
- Export + New Transaction buttons

### 📹 Meetings (`/app/meetings`)
- Live meetings (red pulsing badge) with Join Now button
- Upcoming and scheduled meetings
- Alert popups on join
- Schedule new meeting form
- 3 tabs: Today / Schedule New / All Meetings

### 💬 Chat (`/app/chat`)
Integrated **Owl Talk** UI from `dev/frontend` (`src/chat/`): WhatsApp-style sidebar + DMs, Socket.IO messaging, read receipts, reply/forward/star, emoji picker, attachments & voice notes (with backend), **WebRTC** audio/video (`CallUI`), group creation, meeting modal, media gallery, profile edit, privacy settings, sound toasts (`react-hot-toast`).

- **Offline / no server:** leave `VITE_CHAT_API_URL` unset — contact list comes from `STAFF` in `src/data/mock.js`; messages stay in-session only.
- **Live server:** run Python **`dev/main.py`** on **5117**. With **`npm run dev`**, the portal uses a **Vite proxy** (`/proxy-chat-api` → `127.0.0.1:5117/api`, WebSocket via `/proxy-chat-socket`) so the browser does not need to trust the self-signed HTTPS cert on :5117. Restart Vite after changing `.env`. If the Python server is **HTTP-only** (no `dev/ssl` certs), set **`VITE_CHAT_BACKEND_PROTOCOL=http`** in `.env`. To bypass the proxy, set **`VITE_CHAT_API_URL`** and **`VITE_CHAT_SOCKET_URL`**, or **`VITE_CHAT_USE_VITE_PROXY=0`**. Demo users include **`chatUserId`** in `AuthContext` for integer ids when syncing with that backend.
- **Portal vs Owl Talk login:** NAPTIN signs you in only in the React app. In **`debug`** mode, **`GET /api/users`** returns the roster without a Flask session so the contact list loads. Sending messages over Socket.IO still expects an Owl Talk session (or active socket mapping); use **`POST /api/login`** against the Python API if you need full server-backed messaging, or rely on the portal’s offline / tab-local path when disconnected.

### 🎓 Training (`/app/training`)
- Course catalogue with 6 courses (filterable)
- Category filter + search
- Completion % bars per course
- My Courses tab with progress tracking
- Certificates tab
- Engineer photo hero banner

### 📦 Procurement (`/app/procurement`)
- Purchase orders table
- Vendor registry with rating/contract/value cards
- New vendor portal alert banner
- 3 tabs: Orders / Vendors / Contracts

### 🏢 Admin portal (`/admin`)
- **Hardened entry** at **`http://127.0.0.1:5173/admin`** (or `localhost`) unless `VITE_ADMIN_DISABLE_HOST_CHECK` / `VITE_ADMIN_ALLOWED_HOSTS` is set. **Console roles:** `ict_admin`, `director`, `hod` (`src/auth/adminConsole.js`).
- **Overview** + **Operations** (RTC, facilities, fleet) for all console roles.
- **Platform control** (director & ICT admin only): **Module registry** (enable/disable each staff module), **Access matrix** (role × module grants, persisted in `localStorage`), **Users & roles** (override demo account `roleKey` on next login), **Audit** (sample log).
- Staff portal **sidebar** and **route guards** read policy via `src/admin/policyStore.js` + `src/auth/access.js`. `/app/admin` redirects to `/admin`.

---

## Adding Real Backend

### Replace mock data
Edit `src/data/mock.js` → replace arrays with API calls in each page.

### Replace mock auth
Edit `src/context/AuthContext.jsx`:
```js
const login = async (email, password) => {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  })
  const data = await res.json()
  if (data.token) {
    localStorage.setItem('token', data.token)
    setUser(data.user)
    return true
  }
  return false
}
```

### Replace embedded images
Move `Naptin.png` and `engr.png` to `public/`:
```js
// src/assets/images.js
export const NAPTIN_LOGO = '/Naptin.png'
export const ENGR_PHOTO = '/engr.png'
```

---

## Deployment

**Ubuntu / Nginx / PM2 / ports 4001–4003:** see **`deploy/README.md`** (typical clone root: `/opt/naptin` — [GitHub](https://github.com/rolandconsultnig/naptin)).

```bash
# Build
npm run build

# Output: dist/ folder — deploy to:
# - Nginx / Apache static hosting
# - Vercel / Netlify (zero config)
# - AWS S3 + CloudFront
# - Azure Static Web Apps
```

For React Router to work in production, configure your server to redirect all routes to `index.html`:
```nginx
# Nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

---

## Roadmap (Next Steps)
- [ ] Connect to REST API / GraphQL backend
- [ ] Role-based access control (Admin / HOD / Staff / Director)
- [x] Socket.IO / WebRTC chat (Owl Talk from `dev/`) — optional backend via `VITE_CHAT_API_URL`
- [ ] Push notifications
- [ ] Mobile PWA manifest
- [ ] Remaining departments: Legal, ICT, M&E, Corporate Services
- [x] Payslip viewer (Self-Service) & payroll summary (HR operations) — **UI prototype**; production PDF + engine TBD
- [x] Recruitment table + **onboarding pipeline** — **UI prototype**; ATS / tasks API TBD
- [x] **Performance** goals + review calendar — **UI prototype**; full PM tool integration TBD

---

*Built for NAPTIN — National Power Training Institute of Nigeria*
*Federal Ministry of Power · Plot 21, Idu Industrial Area, Abuja*
