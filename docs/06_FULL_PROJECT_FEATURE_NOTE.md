# NAPTIN - Full Project Feature Note

This note documents the full feature surface currently implemented in this repository, grouped by module and sub-module.

For **staged completion** (what is mock vs API-backed and what to build next), see `docs/07_DEVELOPMENT_ROADMAP_STAGES.md`.

## 1) Main Portal Web App (`src`)

### 1.1 Platform-level features
- **Authentication/session restore** (`src/context/AuthContext.jsx`) - login, logout, role-aware session persistence.
- **Role/segment access control** (`src/auth/*`) - host guard, role checks, policy-editor guard, app-segment gate, forbidden-page redirection.
- **Notification context** (`src/context/NotificationContext`) - shared in-app notice state.
- **Route composition** (`src/App.jsx`) - public routes, admin routes, protected app routes, nested HR and finance route trees.

### 1.2 Public features
- **Landing page** (`src/pages/LandingPage.jsx`) - public portal intro and CTA.
- **Login page** (`src/pages/LoginPage.jsx`) - staff login and access entry.
- **Whistleblower public portal** (`src/pages/WhistleblowerPortalPage.jsx`) - submit report and track status with code.
- **Forbidden page** (`src/pages/ForbiddenPage.jsx`) - unauthorized access handling.

### 1.3 Admin Console features (`/admin`)
- **Admin overview** (`src/pages/AdminOverviewPage.jsx`) - high-level admin KPIs/quick links.
- **Operations** (`src/pages/AdminOperationsPage.jsx`) - operational administration workspace.
- **Modules management** (`src/pages/AdminModulesPage.jsx`) - module registration/toggling.
- **Roles management** (`src/pages/AdminRolesPage.jsx`) - role definitions.
- **Permissions matrix** (`src/pages/AdminPermissionsPage.jsx`) - role permission assignment.
- **Users management** (`src/pages/AdminUsersPage.jsx`) - user-role mapping and account actions.
- **Audit** (`src/pages/AdminAuditPage.jsx`) - admin audit trail visibility.
- **Workflow inbox** (`src/pages/AdminWorkflowInboxPage.jsx`) - admin task approvals/processing.

#### Brand governance sub-module
- **Brand assets** (`src/pages/AdminBrandAssetsPage.jsx`)
- **Brand compliance** (`src/pages/AdminBrandCompliancePage.jsx`)
- **Brand architecture** (`src/pages/AdminBrandArchitecturePage.jsx`)
- **Brand health** (`src/pages/AdminBrandHealthPage.jsx`)
- **Brand crisis** (`src/pages/AdminBrandCrisisPage.jsx`)
- **Brand competitors** (`src/pages/AdminBrandCompetitorsPage.jsx`)
- **Brand usage** (`src/pages/AdminBrandUsagePage.jsx`)
- **Brand approvals** (`src/pages/AdminBrandApprovalsPage.jsx`)

### 1.4 Core app workspace features (`/app`)
- **Dashboard** (`src/pages/DashboardPage.jsx`) - user KPI and activity overview.
- **Intranet** (`src/pages/IntranetPage.jsx`) - posts, comments, likes, file attachments.
- **Collaboration** (`src/pages/CollaborationPage.jsx`) - workspaces/calendar/files/project collaboration surface.
- **Profile** (`src/pages/ProfilePage.jsx`) - user profile details.
- **Integrations** (`src/pages/IntegrationsPage.jsx`) - integration visibility/config.
- **Security** (`src/pages/SecurityPage.jsx`) - security settings/controls.
- **Meetings** (`src/pages/MeetingsPage.jsx`) - meeting schedule + room launching.
- **Chat (Owl Talk)** (`src/pages/ChatPage.jsx`, `src/chat/*`) - messaging and call UI integration.
- **Document Center** (`src/pages/DocumentCenterPage.jsx`) - enterprise documents.

### 1.5 HR module features (`/app/human-resource`)
- **HR people** (`src/pages/HRPage.jsx`) - employee list/actions.
- **HR directory** (`src/pages/DirectoryPage.jsx`) - staff directory/search.
- **HR operations (ERP style)** (`src/pages/HRErpPage.jsx`) - recruitment/onboarding/payroll/talent/performance/attendance views.
- **Enterprise HRMS page** (`src/pages/EnterpriseHRMSPage.jsx`) - enterprise HR feature hub sections.
- **Self-service** (`src/pages/SelfServicePage.jsx`) - leave requests, documents, payslips/history.

### 1.6 Finance module features (`/app/finance`)

#### Finance suite views (`src/pages/finance/FinanceSuiteViews.jsx`)
- Overview
- Ledger
- Payables
- Receivables
- Bank reconciliation
- Currency/FX
- Fixed assets
- Expenses
- Cash flow
- Projects
- Tax
- Audit & compliance
- Budget

#### Finance workbench views (`src/pages/finance/FinanceWorkbenchViews.jsx`)
- Budget workbench (consolidation/virement/BvA/cash flow)
- Expenditure workbench (vouchers/3-way match/commitment control)
- Fiscal reporting (statements/budget performance/treasury returns/donor reports/audit support)

#### Cash advance feature set (`src/pages/finance/CashAdvanceViews.jsx`)
- Request creation
- Manager approval
- Finance approval
- Disbursement
- Retirement
- Settlement
- Expense lines and audit logs

### 1.7 Departmental business modules
- **Procurement** (`src/pages/ProcurementPage.jsx`) - APP/vendors/tenders/PO flows.
- **Public Affairs** (`src/pages/PublicAffairsPage.jsx`) - communications/press/media/social/events/sentiment.
- **SERVICOM** (`src/pages/SERVICOMPage.jsx`) - service charter/complaints/CSAT/regulatory reporting.
- **ACTU** (`src/pages/ACTUPage.jsx`) - anti-corruption workflow and whistleblower operations.
- **Training** (`src/pages/TrainingPage.jsx`) - training management suite tabs.
- **Legal & Board** (`src/pages/LegalBoardPage.jsx`) - board, compliance, contracts, litigation, data rooms.
- **Corporate Suite** (`src/pages/CorporateSuitePage.jsx`) - corporate/legal/PR/consultancy/risk surfaces.
- **ICT** (`src/pages/ICTPage.jsx`) - service desk, infrastructure, assets, change, cybersecurity.
- **ICT Workbench** (`src/pages/ICTWorkbenchPage.jsx`) - detailed ICT operations tabs.
- **M&E / MANDE** (`src/pages/MandePage.jsx`) - KPI/objectives/field/approvals/evaluation/compliance.
- **Planning** (`src/pages/PlanningPage.jsx`) - planning and sub-area navigation.
- **Planning Workbench** (`src/pages/PlanningWorkbenchPage.jsx`) - strategic plan/action plan/scorecard.
- **Research & Statistics** (`src/pages/ResearchStatisticsPage.jsx`) - surveys/analysis/bulletin.
- **Process Maker** (`src/pages/ProcessMakerPage.jsx`) - process/case/task orchestration UI.
- **DG Portal** (`src/pages/DGPortalPage.jsx`) - executive approvals/reports/meetings/issues.
- **Marketing** (`src/pages/MarketingPage.jsx`) - corporate branding and growth surface.
- **Client Ops Markets** (`src/pages/ClientOpsMarketsPage.jsx`) - onboarding/health/opportunities/markets/pilots/renewals lifecycle.

## 2) Main Backend API (`server`)

Entry: `server/index.js`

### 2.1 Shared platform feature
- **Health endpoint**: `GET /api/v1/health`
- **Static intranet uploads hosting**: `/uploads/intranet`

### 2.2 Route modules and feature coverage

#### Workbench (`server/routes/workbench.js`, prefix `/api/v1/workbench`)
- Summary, clients
- Onboarding (list/create/task list/task update)
- Health configuration/scoring/recalculate
- Opportunities (list/create/update)
- Market criteria/candidates/deep-dive tasks
- Pilots and pilot metrics/decisions
- Feedback list/create/update
- Renewals list/create/status update

#### Admin RBAC (`server/routes/adminRbac.js`, prefix `/api/v1/admin/rbac`)
- Users (list/create/update/disable)
- Secondary role assignment/removal
- Roles CRUD and role-permissions mapping
- Permissions matrix
- Modules/features CRUD
- Audit trail
- SoD check for users

#### Intranet (`server/routes/intranet.js`, prefix `/api/v1/intranet`)
- Posts list/create
- Uploads
- Comments
- Like toggle

#### HRMS APIs
- Core (`/api/v1/hrms`, `server/routes/hrmsCore.js`): employees/departments/org-chart
- Leave (`/api/v1/hrms/leave`, `server/routes/hrmsLeave.js`): types/balances/requests/review
- Attendance (`/api/v1/hrms/attendance`, `server/routes/hrmsAttendance.js`): clock-in/clock-out/list/summary
- Payroll (`/api/v1/hrms/payroll`, `server/routes/hrmsPayroll.js`): periods/run/approve/payslips
- Recruitment (`/api/v1/hrms/recruitment`, `server/routes/hrmsRecruitment.js`): jobs/candidates/interviews/stages
- Performance (`/api/v1/hrms/performance`, `server/routes/hrmsPerformance.js`): cycles/goals/reviews
- Training (`/api/v1/hrms/training`, `server/routes/hrmsTraining.js`): courses/sessions/enrollments/certifications

#### Finance (`server/routes/finance.js`, prefix `/api/v1/finance`)
- Fiscal years/accounts
- Journals (create/post/reverse)
- AP invoices workflow
- AR invoices workflow
- Budget and budget-workbench submissions/virements
- Treasury bank account and transaction views
- Vendors/customers/assets
- Reports: trial balance, income statement, balance sheet

#### Cash Advance (`server/routes/cashAdvance.js`, prefix `/api/v1/finance/cash-advances`)
- Dashboard/list/detail
- Create
- Manager + finance approvals/rejection
- Disburse/retire/settle
- Expense lines and action log

#### Procurement (`server/routes/procurement.js`, prefix `/api/v1/procurement`)
- Vendor CRUD
- Requisition create/review
- Tenders/bids/evaluation/award
- Purchase orders and approvals
- Goods received
- Summary metrics

#### ICT (`server/routes/ict.js`, prefix `/api/v1/ict`)
- Tickets lifecycle (create/assign/resolve/close)
- ICT asset list/create
- Change requests create/approve
- Systems and summary endpoints

#### Collaboration (`server/routes/collaboration.js`, prefix `/api/v1/collaboration`)
- Workspaces create/list
- Workspace members add/list
- Workspace documents add/list/update

#### Whistleblower (`server/routes/whistleblower.js`, prefix `/api/v1/whistleblower`)
- Public report submission
- Tracking code status lookup
- Case admin list/detail
- Assignment/status update/notes
- Summary dashboard

#### Workflow (`server/routes/workflow.js`, prefix `/api/v1/workflow`)
- Process definitions and versions
- Publish version
- Cases list/create
- Tasks list/claim/complete
- Notifications list/read
- Workflow audit log

## 3) EAM Application (`EAM` and `src/eam`)

### 3.1 EAM UI modules (`src/eam/pages` and `EAM/client/src/pages`)
- Landing
- Login
- Dashboard
- Asset Register
- Barcode Generator
- Hardware Management
- Industrial IoT
- Asset Map
- Work Orders
- Maintenance Schedule
- Inventory
- Procurement
- Fleet Management
- Calibration
- Energy Management
- Documents
- Reports
- Legal
- User Management
- Settings
- Database Management
- Depreciation
- Asset Tracking
- Not Found

### 3.2 EAM backend modules (`EAM/server`)
- API bootstrap (`index.ts`)
- Route registry (`routes.ts`)
- Auth/session (`auth.ts`)
- Storage layer (`storage.ts`)
- DB manager (`db.ts`)
- Shared typed schema (`shared/schema.ts`)
- Client API/config/auth helpers (`EAM/client/src/lib/*`)

## 4) Enterprise HRMS App (`Enterprise HRMS`)

### 4.1 Product modules from module catalog (`Enterprise HRMS/All Modules.md`)
1. Core HR (HRIS)
2. Global Talent Acquisition (ATS)
3. Workforce Planning & Analytics
4. Time & Attendance
5. Payroll & Compensation
6. Benefits Administration
7. Performance Management
8. Learning & Development (LMS)
9. Employee Experience
10. Compliance & Risk Management
11. Mobile & Self-Service
12. Integration Hub

### 4.2 Implemented server route modules (`Enterprise HRMS/server/routes`)
- `auth.js`
- `employees.js`
- `departments.js`
- `organization.js`
- `attendance.js`
- `leave.js`
- `payroll.js`
- `recruitment.js`
- `jobs.js`
- `candidates.js`
- `interviews.js`
- `performance.js`
- `training.js`
- `learning.js`
- `benefits.js`
- `employeeExperience.js`
- `complianceCases.js`
- `integrationHub.js`
- `analytics.js`
- `documents.js`
- `documentManagement.js`
- `mobileApp.js`

### 4.3 Supporting HRMS server feature files
- Main app bootstrap: `Enterprise HRMS/server/index.js`
- Auth middleware: `Enterprise HRMS/server/middleware/auth.js`
- Data models in `Enterprise HRMS/server/models/*` (employee, benefits, candidate, attendance, payroll, etc.)
- Seed/bootstrap data scripts: `Enterprise HRMS/server/seed.js`

## 5) Owl Talk / Dev Collaboration Stack (`dev`)

### 5.1 Frontend features (`dev/frontend`)
- `LoginPage` - authentication UI
- `ChatPage` - messaging workspace
- `MeetingRoom` - meeting experience
- `AdminDashboard` - admin operations panel
- Global call UI + auth/socket/call providers (`dev/frontend/src/App.jsx`, `contexts/*`, `components/CallUI`)

### 5.2 Backend features (`dev`)
- Flask app bootstrap and realtime integration (`dev/main.py`)
- Group route module (`dev/src/routes/groups.py`)
- User settings route module (`dev/src/routes/settings.py`)
- Mediasoup SFU server (`dev/mediasoup-server/server.js`) for RTC scaling
- SSL + startup scripts (`setup_https.sh`, `start-dev.sh`)

## 6) Native Mobile App (`native`)

### 6.1 Mobile app features
- App root/navigation/auth gate (`native/App.tsx`)
- Auth stack (`native/src/navigation/AuthNavigator.tsx`)
- Main tab navigation (`native/src/navigation/MainNavigator.tsx`)
- Typed navigation contracts (`native/src/navigation/types.ts`)
- Session context and demo auth (`native/src/auth/SessionContext.tsx`, `native/src/auth/demoAuth.ts`)
- API client and environment config (`native/src/api/client.ts`, `native/src/config.ts`)
- Screens:
  - Login
  - Dashboard
  - Module List
  - Module Detail
  - Profile
- Module metadata source (`native/src/data/modules.ts`)

### 6.2 Native Android build/system features
- Expo config (`native/app.json`)
- Android min-sdk helper plugins (`native/plugins/withAndroidLibraryMinSdk.js`, `native/plugins/withAppAndroidMinSdk24.js`)
- Release build script (`native/scripts/android-release.ps1`)
- Env contract for API base (`native/env.example`)

## 7) Deployment and Operations (`deploy`)

- Deployment runbook (`deploy/README.md`)
- Production env template (`deploy/env.production.example`)
- PM2 process map (`deploy/pm2.ecosystem.config.cjs`)
- Nginx example site config (`deploy/nginx-site.example.conf`)

## 8) Product/Comparison Documentation (`docs`)

- `docs/01_PRODUCT_DOCUMENT.md` - full product brief and architecture rationale.
- `docs/02_COMPARISON_BITRIX24.md` - competitive mapping vs Bitrix24.
- `docs/03_COMPARISON_SAP.md` - competitive mapping vs SAP ecosystem.
- `docs/04_COMPARISON_ODOO.md` - competitive mapping vs Odoo.
- `docs/05_COMPARISON_DOLIBARR.md` - competitive mapping vs Dolibarr.

## 9) Supporting Scripts and Build Utilities (project root)

- DB apply helper: `scripts/db-apply-sql.mjs`
- Android assemble helper: `scripts/android-assemble.mjs`
- PWA icon generation and build scripts (from root `package.json` scripts)
- Native run/start shortcuts in root `package.json`

## 10) Final completeness note

This inventory is generated from the actual route/page/module files currently present in the repository and includes all discoverable modules and feature surfaces under:
- main portal (`src`, `server`)
- EAM (`EAM`, `src/eam`)
- Enterprise HRMS (`Enterprise HRMS`)
- Owl Talk/dev stack (`dev`)
- native mobile (`native`)
- deployment/docs (`deploy`, `docs`)

If you want, the next step is a second document that expands this into a **feature-by-feature implementation status matrix** (`Implemented`, `Partial`, `Mock`, `Planned`) for governance and delivery tracking.
