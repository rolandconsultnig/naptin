# NAPTIN — staged completion roadmap

This document structures **incomplete or prototype areas** into delivery stages. Items marked **(done in repo)** were implemented or corrected as part of the roadmap pass that added this file.

---

## Stage 1 — Core API alignment & bugfixes (foundation)

| Item | Goal | Status |
|------|------|--------|
| Directory vs HRMS | Use the same base URL and response shape as `GET /api/v1/hrms/employees` (via `hrmsApi` + axios client). | **(done in repo)** |
| Finance overview | `FinanceOverviewView` must consume `useFinance()` (context) so charts and treasury UI work; wire optional live bank ledger when accounts exist. | **(done in repo)** |
| Finance ledger | Journal create payload must match `POST /finance/journals`; journal list columns must match API fields (`entryRef`, `entryDate`, `description`, `status`). | **(done in repo)** |
| Chart of accounts UI | Stop calling non-existent `PATCH /finance/accounts/:id` for “balance”; show COA as read-only from API until a TB endpoint drives balances. | **(done in repo)** |
| Treasury movements | `POST /finance/treasury/bank-accounts/:id/transactions` + `financeApi.createBankTransaction`. | **(done in repo)** |
| Self-service payslip PDF | Replace `window.alert` with an in-app notice pattern. | **(done in repo)** |
| Finance toasts | Ensure `react-hot-toast` is mounted under the finance layout so mutations surface errors. | **(done in repo)** |

---

## Stage 2 — HRMS surfaces (portal)

| Item | Goal | Status |
|------|------|--------|
| Enterprise HRMS dashboard | When the API is reachable, show live headcounts from `hrmsApi.getEmployees` / aggregates; retain mock narrative tiles where no API exists yet. | **(done in repo)** |
| Self-service / leave / payslips | Move from `mock` + ad-hoc `fetch` to `hrmsApi` consistently (leave types, balances, leave requests, `my-payslips` with `email` query). | **(done in repo)** |
| HR / HRErp pages | Same client as directory; HR people list + summary + create/update employee via `hrmsApi`; HR operations loads jobs/candidates/payroll periods/leave/attendance summary via `hrmsApi` (legacy onboarding-only paths may still use old fetch until backed). | **(done in repo)** |

---

## Stage 3 — Finance suite depth

| Item | Goal | Status |
|------|------|--------|
| Overview KPIs / spend / pie | Backed by reporting endpoints or materialised summaries (not only `FinanceContext` + localStorage). | **(partial — done in repo)** `GET /finance/overview-summary` drives top KPIs, pie (expense budget by department), and optional monthly spend from posted journals; `FinanceOverviewView` falls back to `FinanceContext` when the API has no journal activity. |
| FX, expense claims, projects, tax runs, audit | Dedicated `server` routes + tables, then replace “local state only” blocks in `FinanceSuiteViews.jsx`. | Planned |
| Procurement embedded `_INIT` | Drive lists from `GET /api/v1/procurement/*` where routes exist; keep static only for demos. | **(partial — done in repo)** Procurement workbench KPIs use `GET /procurement/summary` with `_INIT` fallback; tendering and PO tabs merge API data with local/demo rows; `procurementService` paths match `server/routes/procurement.js`; API-backed POs can post goods received from the workbench. Optional `server/hrms_portal_demo_link.sql` aligns demo portal emails with `hr_employees`. |

---

## Stage 4 — EAM, collaboration, integrations

| Item | Goal | Status |
|------|------|--------|
| EAM (`src/eam`) | Replace `mockData` / page mocks with API module or shared `server` routes for assets, calibration, fleet. | Planned |
| Collaboration page | Wire `collaboration` routes where defined; real-time later. | **(partial — done in repo)** `CollaborationPage` loads workspaces via `GET /collaboration/workspaces` (optional `userEmail` filter), create workspace, members + documents for a selected workspace, and add text documents. Calendar events persist via `GET/POST /collaboration/calendar-events` and `server/collaboration_calendar_schema.sql` (`npm run db:collab:calendar`). Routes align with `operations_schema.sql` collab tables; optional seed `server/collaboration_seed.sql`. |
| Integrations / DMS / SIEM | External systems: OAuth, vault, audit stream — out of scope for single-repo completion; document integration contracts. | Planned |

---

## Stage 5 — Auth, chat, mobile, hardening

| Item | Goal | Status |
|------|------|--------|
| Portal auth | Replace demo password matrix with OIDC / staff SSO + server-issued JWT used by `http.js`. | Planned |
| Owl chat | Production `VITE_CHAT_*` backends; remove session-local prototype for non-dev. | Planned |
| Native (`native/`) | Feature parity per module using `EXPO_PUBLIC_*` API base; retire placeholder module copy where web routes exist. | Planned |
| Security review | RBAC on every `server` route, rate limits, upload scanning, secrets rotation. | Planned |

---

## How to use this doc

1. **Stage 1** should stay green in CI and manual smoke (API + finance overview + directory).
2. Pick **Stage 2** tasks when HR schema and seeds are stable in your environment.
3. Stages **3–5** are ordered by **dependency** (data model → integrations → identity).

For a feature inventory of the whole repo, see `docs/06_FULL_PROJECT_FEATURE_NOTE.md`.
