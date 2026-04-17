# NAPTIN Enterprise Staff Portal — Product Document

**Version:** 2.0.0  
**Organization:** National Power Training Institute of Nigeria (NAPTIN)  
**Supervising Ministry:** Federal Ministry of Power  
**Certification:** ISO 9001:2015  
**Classification:** Internal — Official  

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Product Vision & Mission](#2-product-vision--mission)
3. [Target Users & Personas](#3-target-users--personas)
4. [Architecture Overview](#4-architecture-overview)
5. [Technology Stack](#5-technology-stack)
6. [Core Functional Modules](#6-core-functional-modules)
7. [Cross-Functional Capabilities](#7-cross-functional-capabilities)
8. [Security & Governance](#8-security--governance)
9. [Database Architecture](#9-database-architecture)
10. [API Surface](#10-api-surface)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Non-Functional Requirements](#12-non-functional-requirements)
13. [Implementation Roadmap](#13-implementation-roadmap)
14. [Key Metrics & Scale](#14-key-metrics--scale)

---

## 1. Executive Summary

The **NAPTIN Enterprise Staff Portal** (v2.0) is a comprehensive, cloud-ready enterprise management platform built specifically for the National Power Training Institute of Nigeria (NAPTIN) — a Federal Government parastatal under the Ministry of Power, established in 2009.

The portal unifies human resource management, financial operations, procurement, training administration, internal communications, workflow automation, and organizational governance into a single, role-aware web application. It replaces disparate spreadsheets, manual approval chains, and siloed departmental systems with a coherent digital workspace serving **1,248+ active staff** across NAPTIN's headquarters and **8 Regional Training Centers (RTCs)**.

### Key Value Propositions

| Proposition | Description |
|-------------|-------------|
| **Unified Workspace** | Single sign-on access to HR, Finance, Procurement, Training, ICT, Workflow, and Communications |
| **Role-Based Access** | Granular RBAC engine — every page and action is gated by department, role, and permission |
| **Real-Time Collaboration** | Embedded instant messaging, WebRTC audio/video, intranet social feed, and meeting scheduling |
| **Process Digitization** | Visual BPM engine with approval workflows, task routing, and SLA monitoring |
| **Audit & Governance** | Full immutable audit trail for policy changes, user actions, approval decisions, and sensitive operations |
| **Government-Grade Security** | Host-gated admin console, SOD conflict detection, anonymous whistleblower portal, JWT-secured APIs |
| **Cloud & On-Prem Ready** | Deployable to Vercel, AWS, Azure, Nginx/PM2 on Ubuntu, or Docker containers |

---

## 2. Product Vision & Mission

### Vision
To be the digital backbone of NAPTIN operations — a single platform where every staff member, from the Director-General to field officers, can manage their work, collaborate with colleagues, and interact with the organization's processes seamlessly and transparently.

### Mission
Eliminate paper-based processes, centralize institutional data, enforce governance policies, and provide real-time operational visibility to NAPTIN leadership — while giving every staff member a dignified, modern digital experience aligned with Nigeria's public-sector digital transformation agenda.

### Design Principles

1. **Department-first access control** — modules are visible only to authorized departments; no clutter, no confusion.
2. **API-first architecture** — all frontend features backed by versioned REST APIs; no state-only mock data in production paths.
3. **Progressive enhancement** — works as PWA (Progressive Web App) with offline shell; mobile-responsive.
4. **Audit by default** — every significant action (approval, configuration change, payroll run) is logged immutably.
5. **Fail secure** — unauthenticated and unauthorized requests return 401/403, never leak data.

---

## 3. Target Users & Personas

### 3.1 Staff (All Departments)
- Access: Shared workspace — Dashboard, Intranet, Chat, Meetings, Collaboration, Profile
- Use cases: View payslips, submit leave requests, read announcements, participate in intranet, join video calls
- Volume: ~1,248 active employees

### 3.2 Department Officers (Role-scoped)
- Access: Their department's module (e.g., Finance staff → Finance Suite, Procurement → Procurement Portal)
- Use cases: Enter journal entries, raise purchase orders, process attendance, run payroll, manage training sessions
- Volume: Varies per department

### 3.3 Supervisors / Heads of Department (HOD)
- Access: Department module + approval queues
- Use cases: Approve leave requests, review payroll runs, approve vendor invoices, manage team
- Role keys: `hod`, director-equivalent roles

### 3.4 Finance & Accounts
- Access: Full Finance Suite (Chart of Accounts, Journal Entries, AP/AR, Bank Reconciliation, FX, Fixed Assets, Budget, Cash Advance)
- Use cases: Month-end close, vendor payments, asset depreciation, treasury management

### 3.5 ICT Administrators
- Access: ICT module + full Admin Console
- Use cases: Manage user accounts, assign roles, enable/disable modules, review audit logs, maintain asset registry, manage service desk tickets

### 3.6 Directors / Executive Leadership
- Access: DG Portal, full module visibility, approval escalations
- Use cases: Executive KPI dashboard, organization-wide approvals, strategic planning oversight, crisis management

### 3.7 Admin / Policy Editors
- Access: Full `/admin` console (host-gated)
- Use cases: Create/modify roles, assign permissions (RBAC matrix), manage users, configure SOD rules, audit trail review, brand management

### 3.8 Anonymous Reporters (External/Internal)
- Access: Public Whistleblower Portal (no login required)
- Use cases: Submit anonymous reports, track investigation status via tracking code

---

## 4. Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    NAPTIN Enterprise Portal                  │
│   ┌──────────────────┐          ┌──────────────────────┐    │
│   │   Frontend SPA   │◄────────►│   Backend REST API   │    │
│   │  React 18 + Vite │  HTTP/WS │  Node.js + Express   │    │
│   │  Tailwind CSS    │          │  PostgreSQL (9 DBs)   │    │
│   │  Socket.IO Client│          │  Socket.IO Server    │    │
│   └──────────────────┘          └──────────────────────┘    │
│                                                              │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │ RBAC     │  │ HRMS     │  │ Finance  │  │ Workflow │  │
│   │ Schema   │  │ Schema   │  │ Schema   │  │ Schema   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│   ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│   │Procure-  │  │Workbench │  │Operations│  │Cash Adv. │  │
│   │ment Sch. │  │ Schema   │  │ Schema   │  │ Schema   │  │
│   └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Request Flow
1. User authenticates via `/login` → JWT issued → stored in `localStorage`
2. `AuthContext` restores session on load; `departmentAccess.js` computes visible modules
3. `AppLayout` renders sidebar filtered to user's permitted modules
4. Page components call `financeApi`, `hrmsApi`, etc. (via `src/services/`) → Axios → backend
5. Backend validates JWT, checks RBAC permissions, queries PostgreSQL, returns JSON
6. Real-time events (chat, notifications) delivered via Socket.IO WebSocket

---

## 5. Technology Stack

### Frontend

| Technology | Version | Role |
|-----------|---------|------|
| React | 18.2 | UI framework |
| Vite | 5.2 | Build tool & dev server |
| Tailwind CSS | 3.4 | Utility-first CSS |
| React Router DOM | 6.22 | Client-side routing |
| Recharts | 2.12 | Charts & analytics visualization |
| Lucide React | 0.363 | 500+ icon set |
| Socket.IO Client | 4.8.3 | Real-time messaging & presence |
| Zod | 4.3.6 | Client-side schema validation |
| Axios | 1.14 | HTTP client |
| Date-FNS | 3.4.0 | Date formatting & manipulation |
| React Hot Toast | 2.6 | Toast notifications |
| Clsx | 2.1.0 | Conditional CSS class composition |

### Backend

| Technology | Version | Role |
|-----------|---------|------|
| Node.js | LTS | Backend runtime |
| Express | 5.2.1 | REST API framework |
| PostgreSQL | Latest | Primary relational database |
| PG (node-postgres) | 8.20.0 | PostgreSQL connection pooling |
| Zod | 4.3.6 | API input validation |
| Multer | 2.1.1 | File upload handling |
| CORS | 2.8.6 | Cross-origin resource sharing |
| DotEnv | 16.6.1 | Environment configuration |

### Infrastructure & Tooling

| Tool | Purpose |
|------|---------|
| Vite PWA Plugin | Progressive Web App manifest + service worker |
| PostCSS + Autoprefixer | CSS vendor prefixing |
| PM2 | Node.js process management in production |
| Nginx | Reverse proxy + static file serving |
| Docker | Container packaging |

### Design System

| Attribute | Value |
|-----------|-------|
| Primary Font | Plus Jakarta Sans (Google Fonts) |
| Monospace Font | JetBrains Mono |
| Brand Green | `#006838` |
| Dark Variant | `#004D28` |
| Accent Gold | `#FFD700` |
| Light Background | `#E8F5EE` |
| Surface Background | `#F7FAF8` |

---

## 6. Core Functional Modules

### 6.1 Human Resource Management Suite

The HR module is a consolidated 5-section suite accessible at `/app/human-resource/*`.

#### 6.1.1 People Management (`/people`)
- Staff directory with real-time KPI cards (total, active, on leave, new hires)
- Searchable, filterable employee table (by department, status, name)
- Employee detail modal: personal info, employment data, contact, bank details
- Profile photo display

**Backend:** `GET/POST/PATCH /api/hrms/employees`

#### 6.1.2 Organizational Directory (`/directory`)
- Department-by-department organization view
- Hierarchical org chart visualization
- Staff contact card lookup
- Supervisor chain display

**Backend:** `GET /api/hrms/org-chart`, `GET /api/hrms/employees`

#### 6.1.3 HR Operations (`/operations`)
- **Recruitment:** Open vacancies, candidate pipeline (sourced → applied → screening → assessment → interview → offer → hired/rejected), interview scheduling, panel management, feedback recording
- **Payroll Management:** Payroll period creation, one-click payroll run, salary computation (GL-01 ₦68k → GL-17 ₦900k), earnings breakdown, deductions deduction-types, payslip generation & publishing
- **Performance Reviews:** Appraisal cycles, goal setting, ratings, supervisor reviews
- **Onboarding:** New hire checklist, document collection, policy attestation
- **Talent Management:** Succession planning, skills inventory

**Backend:** Multiple `/api/hrms/*` endpoints

#### 6.1.4 Enterprise HRMS Suite (`/enterprise`)
12-area deep management console:

| Area | Features |
|------|----------|
| Core HR | Employee master record management |
| Time & Attendance | Clock-in/out, overtime, shift management |
| Leave Management | Leave types, balances, request workflows, approval chains |
| Payroll | Full computation pipeline, earnings/deductions, tax/pension |
| Performance | Review cycles, 360 feedback, KPI tracking |
| Training & LMS | Course catalog, sessions, enrollments, certificates |
| Compliance | Policy attestations, mandatory training tracking |
| Benefits | Plan enrollment, eligibility rules, benefit deductions |
| Recruitment | ATS-integrated candidate management |
| Org Management | Department/position/grade-level administration |
| Analytics | Workforce metrics, trends, predictive analytics |
| Integration Hub | HR-to-Finance/Payroll/Leave data sync connectors |

#### 6.1.5 Employee Self-Service (`/self-service`)
Available to all staff:
- View and download payslips
- Submit leave requests (all leave types)
- Check leave balance per type for current year
- Upload personal documents (offer letters, credentials)
- View leave history
- Download employment letters

---

### 6.2 Finance & Accounting Suite

Accessible to Finance & Accounts department. Organized into two pages (Overview + Workbench).

#### 6.2.1 Chart of Accounts
- Full GL account hierarchy (assets, liabilities, equity, revenue, expenses)
- 4-digit account codes with parent account nesting
- Department-scoped accounts
- Normal balance designation (debit/credit)

#### 6.2.2 Journal Entries
- JE creation (description, balanced debit/credit lines)
- Draft → Post lifecycle with validation (debits must equal credits)
- JE detail view with line-by-line breakdown
- Void capability (compliance-grade reversal)
- Filter by status: draft / posted / voided

#### 6.2.3 Accounts Payable (AP)
- Vendor invoice registration
- 2-way and 3-way invoice matching (PO → GRN → Invoice)
- Status tracking: received → matched → ready-for-payment → paid
- Dunning notice support (AR side)

#### 6.2.4 Accounts Receivable (AR)
- Sales invoice issuance to customers (government, training clients)
- Outstanding/overdue tracking
- Dunning notice dispatch

#### 6.2.5 Bank Reconciliation
- Recon sessions per bank account per statement period
- Manual and AI-suggested transaction matching
- Opening/closing balance validation
- Outstanding items tracking

#### 6.2.6 FX Management
- Multi-currency rate registry (USD/NGN, EUR/NGN, GBP/NGN)
- Unrealized FX gain/loss tracking
- Period-end FX revaluation journal auto-generation

#### 6.2.7 Fixed Assets
- Full asset register (asset tag, description, acquisition cost, location, custodian)
- Depreciation methods: straight-line and declining-balance
- Net Book Value (NBV) tracking
- Disposal workflow

#### 6.2.8 Budget Utilization
- Budget vs. actual tracking per department
- Visual utilization indicators
- Variance analysis

#### 6.2.9 Treasury Management
- Cash position dashboard
- Investment portfolio tracking
- Liquidity reporting

#### 6.2.10 Cash Advance Management
Full lifecycle cash advance module with:

| Stage | Actor | Action |
|-------|-------|--------|
| Draft | Any staff | Submit advance request (amount, purpose, due date) |
| Manager Approval | Line manager | Review & approve/reject |
| Finance Approval | Finance officer | Second-level review & approve/reject |
| Disbursed | Finance | Issue via petty cash/bank transfer; GL journal auto-posted |
| Retired | Staff | Submit expense lines (receipts), calculate variance |
| Settled | Finance | Accept retirement, post settlement GL entry |

- KPI dashboard (total outstanding, pending approvals, overdue alerts)
- Policy reminder callout (D+1, D+7, D+14 overdue alerts)
- GL automation: Dr Employee Advance Receivable / Cr Petty Cash on disburse
- Multi-line expense entry on retirement with live variance display

---

### 6.3 Procurement Module

Accessible to Procurement department.

- **Vendor Registry:** Vendor master (name, registration, TIN, bank, performance rating), status management (active/suspended/inactive)
- **Purchase Orders:** PO creation with line items (item, qty, unit price), approval workflow, goods receipt (GRN), 3-way matching
- **RFQ (Request for Quote):** Publish RFQs to vendor list, receive quotes, comparative analysis, award decision
- **Contract Management:** Vendor contracts (terms, value, renewal dates, status)
- **Item Catalog:** Procurement item master with categories and UoMs

---

### 6.4 Training & LMS Module

Accessible to Training department.

- **Course Catalog:** 6+ standard courses, categories, durations, instructors, max participants
- **Training Needs Analysis (TNA):** Department-level gap identification
- **Session Scheduling:** Date, location, enrollment management
- **Participant Tracking:** Enrollment, attendance, completion percentage
- **Certification Management:** Digital certificate issuance, expiry tracking
- **Compliance Training:** Mandatory courses (NDPR, safety, ethics) with attestation tracking

---

### 6.5 ICT Module

Accessible to ICT and Planning departments.

- **Service Desk:** Ticket creation (incident/request/bug), priority assignment, technician routing, status tracking (open/in-progress/resolved/closed)
- **Asset Registry:** IT asset master (laptops, desktops, network equipment, location, custodian)
- **Infrastructure Monitoring:** Server/system health status, capacity metrics
- **CMDB (Configuration Management Database):** System dependency mapping

---

### 6.6 Workflow / BPM Engine

Available to Process & Workflow Admins.

- **Visual Process Builder:** Node-based flow designer (activity, gateway, end nodes)
- **Process Versioning:** Create and publish versioned process definitions
- **Case Execution:** Process instances with runtime data and state tracking
- **Task Inbox:** Assignee view of pending tasks
- **Approval Routing:** Role-based task assignment and escalation
- **SLA Monitoring:** Alert on overdue tasks

---

### 6.7 Planning, Research & Statistics

Accessible to Planning, Research & Statistics department.

- **Strategic Planning:** KPI frameworks, initiatives, milestone tracking
- **M&E Framework:** MANDE (Monitoring, Accountability, Learning) platform
- **Research Outputs:** Publications, statistical analysis, data dashboards
- **Planning Workbench:** Workbench-style planning operations interface

---

### 6.8 Legal & Board Affairs

Accessible to Legal / Board Secretariat.

- **Board Resolutions:** Resolution drafting, approval, archiving
- **Legal Cases:** Litigation tracking, legal research, case status
- **Compliance Calendar:** Regulatory filing dates, court dates
- **Policy Repository:** Organizational policies and governance documents
- **ACTU Module (5 sub-areas):**
  - Cases (active litigation management)
  - Studies (legal research publications)
  - Flags (regulatory compliance flags)
  - Sensitization (compliance training programs)
  - Attestation (compliance sign-off tracking)

---

### 6.9 Corporate & Marketing Suite

Accessible to Corporate & Consultancy Services / Marketing departments.

- **Public Relations:** Brand campaigns, press releases, media monitoring
- **Risk Management:** Risk register, mitigation strategies, risk matrix
- **Board Pack Preparation:** Quarterly board pack compilation
- **Marketing Campaigns:** Campaign pipeline, budget allocation, performance metrics
- **Vendor RFIs:** Vendor information requests for corporate services
- **Business Development:** Client lifecycle management, opportunities, markets, pilots, feedback, renewals

---

### 6.10 DG Portal

Accessible to Director-General and Directors.

- **Executive Dashboard:** Organization-wide KPIs, critical alerts, performance snapshot
- **Approval Queue:** Multi-department escalations pending DG sign-off
- **Strategic Briefings:** Policy notes, briefing documents, status reports
- **Crisis Alerts:** Emergency notifications escalated to executive level
- **Org-wide Metrics:** Real-time staff statistics, budget utilization, compliance health

---

## 7. Cross-Functional Capabilities

### 7.1 Intranet & Social Feed
- **Post Types:** Status updates, announcements, photos, file shares
- **Engagement:** Like, comment, share, reply-to-comment
- **Trending:** Hashtag trending sidebar
- **Online Presence:** Real-time online users panel
- **File Uploads:** Attachment support (max 10 MB)

### 7.2 Chat & Collaboration (Owl Talk)
- **Messaging:** 1-on-1 and group chats
- **Message Features:** Reply, forward, star, delete, read receipts
- **Media:** Voice notes, image sharing, media gallery view
- **Real-Time:** Socket.IO-backed message delivery
- **Communications:** Emoji picker, message search
- **Calls:** WebRTC audio and video calls, group calls, blur/virtual background (configurable)
- **Conference:** Screen sharing, meeting room integration

### 7.3 Meetings Module
- **Live Meeting Alerts:** Pulsing red badge for active calls
- **Scheduling:** Create and invite participants
- **Views:** Today / Schedule / All meetings tabs
- **Join Flow:** Direct join button for active sessions

### 7.4 Collaboration Workspaces
- **Team Spaces:** 4 team workspaces (configurable)
- **File Sharing:** Shared file library with lock status (checked out/available)
- **Project Tracking:** Project list with status and due dates
- **Task Management:** Task list per project
- **Forum Threads:** Discussion boards per workspace
- **Activity Log:** Recent team actions

### 7.5 Document Center
- **Document Management:** Centralized repository
- **Search & Filter:** By category, type, author, date
- **Access Control:** Role-restricted document visibility
- **DMS Records:** Formal document management system records

### 7.6 Notifications
- Real-time notification panel in top bar
- Alert types: approvals pending, leave requests, system alerts, payroll notifications, task reminders
- Mark-read and dismiss controls

---

## 8. Security & Governance

### 8.1 Authentication
- JWT-based stateless authentication
- Tokens stored in `localStorage`, auto-restored on page load
- Session timeout with graceful re-login
- SSO-ready architecture (configurable)
- Demo credentials: `staff@naptin.gov.ng` / `naptin2026` (dev mode only)

### 8.2 Role-Based Access Control (RBAC)
- **Roles:** Defined with unique codes, hierarchy levels (1–10), supervisor chains, department scope
- **Permissions:** Granular permission codes per module feature
- **Role ↔ Permission Matrix:** Admin-configurable bulk assignment UI
- **Secondary Roles:** Time-bounded additional role assignments
- **Individual Overrides:** Exception grants per user
- **Segregation of Duties (SOD):** Conflict rule enforcement — prevents same user holding incompatible roles (e.g., PO creator + PO approver)

### 8.3 Department-Based Module Gating
- Users see only modules relevant to their department
- Director/ICT Admin bypass: full module visibility across all active modules
- Frontend `AppSegmentGate` component enforces module visibility on every render

### 8.4 Admin Console Host Guard
- `/admin` console restricted by `VITE_ADMIN_ALLOWED_HOSTS` environment variable
- Prevents unauthorized internal access from external networks
- `AdminHostGuard` component checks `window.location.hostname` before rendering admin UI

### 8.5 Audit Trail
- Immutable audit log for all policy changes (role edits, permission grants, module toggles)
- User action tracking (who accessed what, when, from where)
- Export and filter capabilities (by date range, user, action type)
- Retained for compliance and forensic investigation

### 8.6 Whistleblower Portal
- Publicly accessible (no login required)
- Submissions are anonymized — no IP or personal identifier stored with report content
- Tracking code system (WB-XXXXXX format) for anonymous follow-up
- Reporter access limited to their own case via tracking code
- Internal investigator access controlled by role

### 8.7 API Security (Backend)
- All API endpoints require valid JWT (except public whistleblower endpoints)
- CORS configured to restrict allowed origins
- Input validation on all endpoints via Zod schemas
- SQL queries use parameterized statements (no string-interpolation SQL)
- HTTPS enforced in production configuration

---

## 9. Database Architecture

Nine independent database schemas managed in PostgreSQL:

| Schema | Tables | Purpose |
|--------|--------|---------|
| **RBAC Schema** | 12 tables | Users, roles, permissions, modules, features, SOD rules, audit log |
| **HRMS Schema** | 18 tables | Employees, departments, positions, grades, leave, attendance, payroll, recruitment, training |
| **Finance Schema** | 9 tables | Fiscal years, GL accounts, journal entries, AP invoices, AR invoices, bank recon, FX rates, fixed assets |
| **Workflow Schema** | 6 tables | Process definitions, versions, cases, tasks, approvals, case variables |
| **Procurement Schema** | 6 tables | Vendors, purchase orders, PO lines, RFQs, items, contracts |
| **Workbench Schema** | 15 tables | Clients, onboarding, opportunities, markets, pilots, feedback, renewals, intranet posts/comments/likes, whistleblower cases |
| **Operations Schema** | ~5 tables | ICT assets, tickets, infrastructure systems |
| **Cash Advance Schema** | 4 tables | `ca_advances`, `ca_expense_lines`, `ca_approval_log`, `ca_alert_log` |
| **Total** | **100+ tables** | — |

### Database Utilities
- `server/db.js` — PostgreSQL connection pooling via `node-postgres`
- `query(sql, params)` — parameterized query helper
- `withTx(callback)` — transaction wrapper for multi-step operations

---

## 10. API Surface

### Route Organization

| Base Path | Module | Endpoints |
|-----------|--------|-----------|
| `/api/rbac` | Admin RBAC | Users, Roles, Permissions, Modules, Audit, SOD |
| `/api/hrms` | HR Core | Employees, Departments, Positions, Grades, Org Chart |
| `/api/hrms/payroll` | Payroll | Periods, Payslips, Earnings/Deduction Types |
| `/api/hrms/leave` | Leave | Types, Balances, Requests |
| `/api/hrms/attendance` | Attendance | Clock-in/out, Records, Stats |
| `/api/hrms/recruitment` | Recruitment | Jobs, Candidates, Interviews |
| `/api/hrms/training` | Training | Courses, Sessions, Enrollments, Certificates |
| `/api/finance` | Finance | Fiscal Years, Chart of Accounts, JE, AP/AR, Bank Recon, FX, Fixed Assets |
| `/api/v1/finance/cash-advances` | Cash Advance | Full lifecycle CRUD + GL automation |
| `/api/procurement` | Procurement | Vendors, POs, RFQs, Contracts, Items |
| `/api/workflow` | Workflow | Processes, Versions, Cases, Tasks, Approvals |
| `/api/whistleblower` | Whistleblower | Report submission, tracking, admin case management |
| `/api/intranet` | Intranet | Posts, Comments, Likes, File Upload |
| `/api/workbench` | Workbench | Clients, Opportunities, Markets, Pilots, Feedback, Renewals |
| `/api/ict` | ICT | Tickets, Assets, Infrastructure |

**Total endpoints:** 120+ across 15 route modules

### API Design Standards
- RESTful resource naming (`GET /resources`, `POST /resources`, `PATCH /resources/:id`)
- Versioned base paths for new routes (`/api/v1/`)
- Standardized error responses with `status`, `message`, `errors` fields
- Zod validation on all request bodies
- Parameterized SQL — no raw string interpolation

---

## 11. Deployment & Infrastructure

### Development
```bash
npm install          # Install dependencies
npm run dev          # Frontend @ http://localhost:4001
npm run api          # Backend API @ http://localhost:4002
npm run db:all       # Apply all schemas + seed data
```

### Production Build
```bash
npm run build        # Outputs to dist/
npm run preview      # Preview production build
```

### Supported Deployment Targets

| Target | Method |
|--------|--------|
| **Vercel / Netlify** | Zero-config static SPA with `vercel.json` / `netlify.toml` |
| **AWS S3 + CloudFront** | Static SPA with CDN |
| **Azure Static Web Apps** | Azure native hosting |
| **Ubuntu + Nginx + PM2** | On-prem or VPS deployment |
| **Docker** | Container image via Dockerfile |

### Critical Environment Variables

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |
| `VITE_WORKBENCH_API_URL` | Workbench API URL |
| `VITE_CHAT_API_URL` | Chat backend URL |
| `VITE_CHAT_SOCKET_URL` | Socket.IO server URL |
| `VITE_ADMIN_ALLOWED_HOSTS` | Admin console host restriction |
| `VITE_PWA_ENABLED` | Enable/disable PWA service worker |
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing key |
| `NODE_ENV` | production / development |

---

## 12. Non-Functional Requirements

| Requirement | Specification |
|-------------|--------------|
| **Performance** | React 18 concurrent rendering; optimistic UI updates; paginated API responses |
| **Scalability** | Stateless backend (JWT); PostgreSQL connection pooling; horizontal scaling ready |
| **Availability** | PM2 process monitoring with auto-restart; Nginx load balancing support |
| **Browser Support** | Chrome, Firefox, Edge, Safari (last 2 versions); mobile responsive |
| **Accessibility** | Semantic HTML; keyboard-navigable forms; ARIA labels on interactive elements |
| **PWA** | Installable app, offline shell via Service Worker, push notification-ready |
| **Offline Capability** | Landing page and static shell available offline; data pages require connectivity |
| **Security** | JWT auth, RBAC, SOD enforcement, HTTPS, parameterized SQL, CORS restriction |
| **Audit** | All policy/configuration changes and sensitive operations logged immutably |
| **Data Integrity** | Transaction wrappers (`withTx`) for multi-table writes; constraint enforcement in PostgreSQL |

---

## 13. Implementation Roadmap

The platform is currently **~58% complete overall** with ~35-40% production-ready code.

### Stage 1 — Governance & Multi-tenancy (Target: +6-8%)
- Multi-tenant backend with tenant-scoped module policies
- Admin UI: tenant selector and cross-tenant visibility
- Enhanced audit trail granularity

### Stage 2 — Core HR Completion (Target: +8-10%)
- Full employee record (documents, history, custom fields)
- Org chart interactive visualization
- Complete ATS pipeline with automated onboarding checklist

### Stage 3 — Time, Leave & Payroll Integration (Target: +10-12%)
- Shift pattern management and overtime engine
- Leave policy expansion (carry-over rules, pro-ration)
- Full payroll computation: NHF, PAYE, pension, gross-to-net
- Attendance-to-payroll integration

### Stage 4 — Performance, LMS & Engagement (Target: +7-9%)
- Full performance review cycle with 360 feedback
- LMS expansion: scorm, AICC, compliance expiry management
- Recognition & engagement workflows
- Employee engagement survey engine

### Stage 5 — Build Remaining Modules (Target: +12-15%)
- Benefits Administration (enrollment, eligibility, deductions)
- Full E-Signature service (offers, contracts, attestations)
- Predictive attrition analytics
- Voice assistant integration (approval commands, chatbot)

### Stage 6 — Hardening & Production Readiness (Target: 90%+)
- Integration hub expansion (ERP connectors, FMIS, identity providers)
- Security hardening: rate limiting, secrets management, anomaly detection
- Performance: job queues, Redis caching, CDN for media
- UAT campaign, migration scripts, production runbook

---

## 14. Key Metrics & Scale

| Metric | Value |
|--------|-------|
| Active Staff (Mock) | 1,248 |
| Regional Training Centers | 8 |
| Frontend Pages | 50+ |
| Backend API Route Modules | 15 |
| Total API Endpoints | 120+ |
| Database Schemas | 9 |
| Database Tables | 100+ |
| Salary Grade Levels | 13 (GL-01 to GL-17) |
| Leave Types Supported | 5+ |
| UI Icon Library | 500+ Lucide icons |
| Deployment Targets Supported | 5 |
| Implementation Completion | ~58% |

---

*Document prepared based on codebase analysis of NAPTIN Enterprise Staff Portal v2.0.0*  
*Last updated: 2025*
