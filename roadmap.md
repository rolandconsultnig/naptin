# NAPTIN ERP Delivery Roadmap (6 Stages)

## Purpose
This roadmap is based on the current implementation audit and focuses on:
- **Partially developed objectives** that need completion.
- **0% undeveloped objectives** that need first-time implementation.

Current estimated progress: **~58%**
Target after Stage 6: **~90%+**

---

## Partially Developed Objectives (to be completed)
1. Core HR & Employee Data Management
2. Recruitment & ATS
3. Time & Attendance
4. Leave & Absence Management
5. Payroll & Compensation
6. Performance Management
7. Learning & Development (LMS)
8. Compliance & Security
9. Self-Service/Mobile workflows
10. Integration Hub (beyond current Office integration)

## 0% Undeveloped Objectives (to start from scratch)
1. Benefits Administration module
2. Whistleblower/Case Management
3. Native E-signature workflow pipeline
4. Predictive Attrition Analytics
5. Voice Assistant workflow actions

---

## Stage 1 — Governance, Tenancy, and Module Control
**Goal:** make module enablement enterprise-ready per tenant.

### Scope
- Add tenant model + tenant membership in backend.
- Persist admin module policy by tenant (not only local prototype state).
- Enforce tenant module gating in route guards and API authorization checks.
- Add admin UI for tenant selector + module toggle by tenant.

### Primary Objectives Addressed
- Compliance & Security (partial)
- Integration Hub foundation (partial)

### Exit Criteria
- Admin can enable/disable ERP modules per tenant.
- Users from different tenants see different enabled module sets.
- Audit records show who changed module policy.

**Expected progress uplift:** +6% to +8%

---

## Stage 2 — Core HR + Recruitment Completion
**Goal:** finish essential HRIS and ATS lifecycle.

### Scope
- Complete employee record model (documents, history, org metadata, custom fields).
- Add org chart data endpoints and visual component wiring.
- Implement ATS pipeline states, interview scheduling, structured feedback.
- Automate onboarding checklist from recruitment outcome.

### Primary Objectives Addressed
- Core HR & Employee Data Management (partial)
- Recruitment & ATS (partial)

### Exit Criteria
- End-to-end candidate-to-employee transition works.
- HR can manage employee master data and documents from one flow.

**Expected progress uplift:** +8% to +10%

---

## Stage 3 — Time, Leave, and Payroll Integration
**Goal:** connect workforce operations to compensation outcomes.

### Scope
- Implement attendance engine (clock-in/out records, shifts, overtime logic).
- Expand leave policies and leave balance calculations.
- Build payroll computation pipeline (earnings, deductions, tax rules).
- Link approved leave and attendance directly into payroll period runs.

### Primary Objectives Addressed
- Time & Attendance (partial)
- Leave & Absence Management (partial)
- Payroll & Compensation (partial)

### Exit Criteria
- Payroll run consumes attendance + leave data automatically.
- HR/payroll admins can run, review, and publish payroll cycles.

**Expected progress uplift:** +10% to +12%

---

## Stage 4 — Performance, LMS, and Employee Experience
**Goal:** strengthen growth and engagement modules.

### Scope
- Deliver complete performance review cycles (goals, reviewer flows, calibration).
- Add 360 feedback workflow and role-based visibility.
- Expand LMS with compliance courses and certification expiries.
- Add actionable employee experience workflows (recognition, feedback loops).

### Primary Objectives Addressed
- Performance Management (partial)
- Learning & Development (partial)
- Self-service/Employee Experience (partial)

### Exit Criteria
- A full annual/quarterly review cycle is executable.
- Certification compliance is trackable and reportable.

**Expected progress uplift:** +7% to +9%

---

## Stage 5 — Build the 0% Modules
**Goal:** implement all objectives currently at 0%.

### Scope
- Build **Benefits Administration** (plans, enrollment, eligibility, deductions).
- Build **Whistleblower/Case Management** (case intake, triage, investigation workflow).
- Build **Native E-signature** service for offers/contracts/policy attestations.
- Build **Predictive Attrition Analytics** baseline model + risk dashboard.
- Build **Voice Assistant Actions** (start with approval commands for managers).

### Primary Objectives Addressed
- All current 0% undeveloped objectives

### Exit Criteria
- Every previously 0% objective has production-grade MVP functionality.
- Admin reporting covers usage and compliance of new modules.

**Expected progress uplift:** +12% to +15%

---

## Stage 6 — Integration, Hardening, and Production Readiness
**Goal:** stabilize the platform for enterprise deployment.

### Scope
- Expand integration hub (ERP, identity, and collaboration connectors).
- Security hardening: policy enforcement, secrets management, audit depth.
- Performance and resilience tuning (jobs, retries, caching, monitoring).
- QA/UAT, migration scripts, and deployment playbooks.

### Primary Objectives Addressed
- Integration Hub (partial)
- Compliance & Security (partial)
- Cross-cutting production requirements

### Exit Criteria
- Critical journeys pass UAT and regression test suite.
- Operational dashboards and support runbooks are in place.
- Platform is deployment-ready for staged rollout.

**Expected progress uplift:** +8% to +10%

---

## Prioritization Notes
- **Immediate business value:** Stages 1–3.
- **Capability depth and retention value:** Stage 4.
- **Objective closure (0% elimination):** Stage 5.
- **Enterprise rollout confidence:** Stage 6.

## Suggested Delivery Cadence
- Stage 1: 2–3 weeks
- Stage 2: 3–4 weeks
- Stage 3: 4–6 weeks
- Stage 4: 3–4 weeks
- Stage 5: 5–7 weeks
- Stage 6: 3–5 weeks

(Adjust based on team size, integration dependencies, and compliance sign-off timelines.)
