# Competitive Comparison: Dolibarr ERP/CRM vs NAPTIN Enterprise Staff Portal

**Document Type:** Feature Gap Analysis  
**Scope:** Features present in Dolibarr ERP/CRM 19 that are absent or underdeveloped in NAPTIN  
**Purpose:** Understand what Dolibarr offers at the "practical SME/government NGO ERP" level that NAPTIN has not yet addressed  

---

## Table of Contents

1. [Overview of Both Products](#1-overview-of-both-products)
2. [Module Coverage Matrix](#2-module-coverage-matrix)
3. [Finance & Accounting Gap Analysis](#3-finance--accounting-gap-analysis)
4. [HR & Payroll Gap Analysis](#4-hr--payroll-gap-analysis)
5. [CRM & Commercial Activities Gap Analysis](#5-crm--commercial-activities-gap-analysis)
6. [Procurement & Supplier Management Gap Analysis](#6-procurement--supplier-management-gap-analysis)
7. [Project & Task Management Gap Analysis](#7-project--task-management-gap-analysis)
8. [Document & Contract Management Gap Analysis](#8-document--contract-management-gap-analysis)
9. [Inventory & Asset Management Gap Analysis](#9-inventory--asset-management-gap-analysis)
10. [Reporting & Business Intelligence](#10-reporting--business-intelligence)
11. [Collaboration & Communication Gap Analysis](#11-collaboration--communication-gap-analysis)
12. [Administration & Technical Platform](#12-administration--technical-platform)
13. [Features NAPTIN Has That Dolibarr Does Not](#13-features-naptin-has-that-dolibarr-does-not)
14. [Prioritized Gap Roadmap](#14-prioritized-gap-roadmap)
15. [Strategic Assessment](#15-strategic-assessment)

---

## 1. Overview of Both Products

### Dolibarr ERP/CRM
Dolibarr is a free, open-source ERP and CRM platform built on PHP/HTML. It is modular — administrators enable or disable modules per installation. Dolibarr targets small and micro enterprises, NGOs, freelancers, and public institutions that need basic ERP functionality without the complexity or cost of SAP or Odoo Enterprise. Its module library covers accounting, HR, CRM, procurement, projects, document management, membership, and more. A community marketplace (DoliStore) extends it further.

**Target Market:** Micro-enterprises, SMEs, NGOs, government institutions (small-to-medium scale)  
**Pricing:** Free (open-source, GNU/GPL license). Hosting and support may be paid separately.  
**Deployment:** Self-hosted on LAMP/LEMP stack; Docker available; Dolibarr.net cloud  
**Strengths:** Ultra-lightweight, easy to install, modular, low TCO, multi-language (60+), multi-currency, active community, DoliStore for extensions  

### NAPTIN Enterprise Staff Portal
Modern React + Node.js + PostgreSQL enterprise portal for 1,248 federal government staff. Custom-built for Nigeria's public sector context.

**Target Market:** NAPTIN — Federal Ministry of Power parastatal  
**Strengths:** Government HRMS, Finance Suite, RBAC with SOD, Whistleblower Portal, Real-time Chat, Government procurement lifecycle  

---

## 2. Module Coverage Matrix

| Dolibarr Module | NAPTIN Equivalent | Coverage |
|----------------|-------------------|----------|
| Third Parties (Contacts / Companies) | Client Ops Workbench (stub) | ⚠️ Partial |
| Customers / Prospects | Client Ops (stub) | ⚠️ Very partial |
| Suppliers | Procurement - Vendor Registry | ✅ Comparable |
| Products / Services catalog | Procurement Item Catalog | ✅ Partial |
| Commercial Proposals (Quotes) | ❌ Absent | ❌ Absent |
| Sales Orders | ❌ Absent | ❌ Absent |
| Customer Invoices | Finance - AR Module | ✅ Partial |
| Vendor Invoices | Finance - AP Module | ✅ Partial |
| Purchase Orders | Procurement - PO Module | ✅ Good |
| Bank / Cash Accounts | Finance - Bank Recon | ✅ Partial |
| Accounting (Journals, Chart of Accounts) | Finance Suite | ✅ Good |
| Fixed Assets | Finance - Fixed Assets | ✅ Partial |
| Expenses | Cash Advance Module | ⚠️ Partial |
| Tax management | ❌ Absent | ❌ Absent |
| HR (Employees, Leave) | HR Suite | ✅ Full |
| Payroll | Payroll Module | ✅ Partial |
| Timesheets | ❌ Absent | ❌ Absent |
| Projects | Collaboration Workspaces | ⚠️ Basic |
| Tasks | Collaboration Workspaces | ⚠️ Basic |
| Tickets (Helpdesk) | ICT Service Desk | ⚠️ IT-scoped |
| Document Management (GED) | Document Center | ⚠️ Basic |
| Contract Management | Procurement - Contracts | ⚠️ Basic |
| Membership / Subscription | ❌ Absent | ❌ N/A |
| Interventions / Field Service | ❌ N/A | ❌ N/A |
| Bookmarks | ❌ Absent | ❌ Absent |
| Agenda / Calendar | Meetings Module (partial) | ⚠️ Partial |
| Email notifications | ❌ Absent | ❌ Absent |
| Intranet / Knowledge | ❌ Basic | ✅ Full (NAPTIN advantage) |
| Stock / Inventory | ❌ N/A | ❌ N/A (not needed) |
| Manufacturing | ❌ N/A | ❌ N/A (not needed) |
| Barcode | ❌ N/A | ❌ N/A |
| Point of Sale | ❌ N/A | ❌ N/A |
| LDAP / SSO | ⚠️ LDAP available | ❌ Not implemented |

---

## 3. Finance & Accounting Gap Analysis

### 3.1 Chart of Accounts & Journals

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Chart of accounts with account classes | ✅ Full | Both have full CoA structures |
| Multiple journal books (sales, purchase, bank, misc) | ⚠️ Partial | NAPTIN has general journals; no dedicated sub-journals per type |
| Accounting periods with lock dates | ❌ Absent | NAPTIN has no lock-date feature to close periods |
| Import accounting entries from CSV | ❌ Absent | — |
| Accounting entry reversal | ❌ Absent | NAPTIN can void; no automated reversal journal |
| Double-entry validation | ✅ Full | Both enforce balanced debit/credit |
| VAT/Tax journal reporting | ❌ Absent | NAPTIN has no VAT management |
| Audit log per accounting entry | ⚠️ Partial | NAPTIN logs at entry level |

### 3.2 Customer & Vendor Invoicing

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Customer invoice with line items, VAT, discount | ⚠️ Partial | NAPTIN AR invoices lack line items, VAT, and discounts |
| Recurring invoice scheduler | ❌ Absent | — |
| Invoice PDF generation and email delivery | ❌ Absent | NAPTIN issues invoices but no PDF generation |
| Payment tracking per invoice | ⚠️ Partial | NAPTIN tracks invoice status but not granular payment receipts |
| Credit notes (partial invoice reversal) | ❌ Absent | — |
| Customer statement of account | ❌ Absent | — |
| Dunning (reminder letters) | ✅ Built | NAPTIN has dunning notice dispatch |
| Pro-forma invoice | ❌ Absent | — |
| Multi-currency invoicing | ❌ Absent | NAPTIN has FX rates but not multi-currency invoice issuing |

### 3.3 Bank & Payment Management

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Bank account register with balance | ✅ Partial | NAPTIN has bank recon with balances |
| Payment modes (cheque, bank transfer, cards) | ❌ Absent | NAPTIN does not track payment mode per transaction |
| Cheque deposit slips | ❌ Absent | — |
| Bank statement import (CSV/OFX) | ❌ Absent | NAPTIN does manual reconciliation |
| Direct debit / SEPA | ❌ N/A (Nigeria context) | — |
| Cash register / petty cash management | ⚠️ Partial | NAPTIN cash advance covers petty cash requests; no physical cash register |
| Payment journal | ❌ Absent | — |

### 3.4 Financial Reports

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Balance sheet | ❌ Absent | NAPTIN has trial balance only |
| Profit & loss statement | ❌ Absent | — |
| Tax declaration | ❌ Absent | — |
| Aged receivables / payables | ❌ Absent | — |
| Cash flow statement | ❌ Absent | — |
| Report export (PDF, Excel, CSV) | ❌ Absent | — |

---

## 4. HR & Payroll Gap Analysis

### 4.1 Employees Module

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Employee master record | ✅ Full | NAPTIN has comprehensive employee records |
| Contract management per employee (type, dates) | ⚠️ Partial | NAPTIN has employment type and dates; no formal contract record |
| Skills and competencies | ❌ Absent | — |
| Employee document attachments | ✅ Partial | NAPTIN self-service allows document uploads |
| Department/position hierarchy | ✅ Full | NAPTIN has full org chart |

### 4.2 Leave Management

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Leave types with configurable rules | ✅ Full | Both support configurable leave types |
| Leave approval workflow | ✅ Full | Both have multi-level leave approval |
| Leave balance display per employee | ✅ Full | — |
| Leave calendar (team view) | ❌ Absent | Dolibarr shows a team leave calendar; NAPTIN shows individual history |
| Holiday calendar integration | ❌ Absent | — |
| Leave certificate/letter generation | ❌ Absent | — |

### 4.3 Payroll

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Salary rule configuration | ✅ Partial | NAPTIN has earnings and deduction types |
| Pay slip generation | ✅ Partial | NAPTIN generates payslips per employee per run |
| Pay slip PDF with company logo | ❌ Absent | NAPTIN payslips are data records; no PDF generation |
| Social contributions tracking | ❌ Absent | — |
| Annual payroll journal | ❌ Absent | — |
| Bank payment file (for mass direct deposit) | ❌ Absent | — |

### 4.4 Timesheets

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Task-level time tracking | ❌ Absent | NAPTIN tracks attendance (clock-in/out), not task-level time |
| Timesheet approval by manager | ❌ Absent | — |
| Timesheet → payroll integration (hours-paid work) | ❌ Absent | — |
| Timesheet → project billing | ❌ Absent | — |

---

## 5. CRM & Commercial Activities Gap Analysis

### 5.1 Third Parties (Contacts / Company Directory)

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Unified contact/company directory | ❌ Absent | NAPTIN has internal staff directory; no external contact management |
| Tag and categorize contacts | ❌ Absent | — |
| Contact interaction history | ❌ Absent | — |
| Prospect / customer / supplier classification | ❌ Absent | Vendor registry exists; no unified CRM contact |
| Import contacts from CSV | ❌ Absent | — |

### 5.2 Commercial Proposals (Quotations)

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Quote creation from product catalog | ❌ Absent | NAPTIN has no quotation module |
| Quote to sales order conversion | ❌ Absent | — |
| Quote PDF emailing | ❌ Absent | — |
| Quote validity period management | ❌ Absent | — |
| Quote analytics (conversion rate, average value) | ❌ Absent | — |

### 5.3 Sales Orders

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Sales order from accepted quote | ❌ Absent | — |
| Delivery tracking | ❌ Absent | — |
| Invoice from sales order | ❌ Absent | — |

**Strategic Note:** Dolibarr's commercial pipeline (contact → proposal → order → invoice) is relevant to NAPTIN's **training business** — NAPTIN sells training programs to government ministries, agencies, and parastatals. A simple quotation → enrollment → invoice pipeline would have significant business value.

---

## 6. Procurement & Supplier Management Gap Analysis

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Supplier master with contact history | ✅ Comparable | Both have vendor registries |
| Request for Quote (RFQ) | ✅ Full | NAPTIN has full RFQ workflow |
| Purchase order with approval | ✅ Full | Both have PO approval workflows |
| Purchase to invoice matching | ✅ Partial | NAPTIN has 3-way matching |
| Supplier pricelists | ❌ Absent | — |
| Supplier performance scoring | ⚠️ Manual rating | Dolibarr has the same level; both are basic |
| Supplier contract management | ✅ Comparable | Both have contract records |
| Preferred supplier settings per product | ❌ Absent | — |
| Reorder alerts | ❌ Absent | Not applicable for NAPTIN's context |

---

## 7. Project & Task Management Gap Analysis

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Project list with progress tracking | ✅ Basic | Both have basic project list |
| Tasks per project with status | ✅ Basic | Both have task lists |
| Gantt chart view | ❌ Absent | Dolibarr has a basic Gantt; NAPTIN has none |
| Task assignment to multiple users | ❌ Absent | — |
| Timesheet link to project tasks | ❌ Absent | NAPTIN has no timesheets |
| Project milestones | ❌ Absent | — |
| Project budget (planned vs. spent) | ❌ Absent | — |
| Inter-project task dependencies | ❌ Absent | — |
| Project overview dashboard | ❌ Absent | NAPTIN shows project cards but no aggregated view |
| External client project portal | ❌ Absent | — |

---

## 8. Document & Contract Management Gap Analysis

### 8.1 Document Management (GED)

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Document library per entity (employee, project, invoice) | ❌ Absent | NAPTIN Document Center is standalone, not entity-linked |
| Document version history | ❌ Absent | — |
| Document sharing links | ❌ Absent | — |
| Document categories and tags | ⚠️ Partial | NAPTIN has categories |
| Document expiry alerts | ❌ Absent | — |

### 8.2 Contracts

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Standalone contract records with amounts | ✅ Comparable | Both have contract records |
| Contract renewal reminders | ❌ Absent | — |
| Contract attachment with version control | ❌ Absent | — |
| E-Signature on contracts | ❌ Absent | Both lack e-signature (NAPTIN: roadmap; Dolibarr: via plugin) |
| Contract analytics (value, expiry pipeline) | ❌ Absent | — |

---

## 9. Inventory & Asset Management Gap Analysis

### 9.1 Inventory

Dolibarr has stock/warehouse management. This is **not applicable** to NAPTIN (no physical product inventory). Gap is intentionally out of scope.

### 9.2 Fixed Assets

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Asset register | ✅ Comparable | Both maintain an asset register |
| Depreciation calculation and posting | ✅ Comparable | Both support depreciation |
| Asset disposal with accounting entries | ⚠️ Partial | NAPTIN has disposal date; Dolibarr posts a journal on disposal |
| Asset label / barcode printing | ❌ Absent | — |

---

## 10. Reporting & Business Intelligence

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Standard financial reports (P&L, balance sheet) | ❌ Absent | NAPTIN has trial balance only |
| Sales statistics reports | ❌ Absent | — |
| Purchase statistics reports | ❌ Absent | — |
| HR workforce report | ❌ Absent | NAPTIN has KPI cards, no report |
| Export any list to CSV/Excel/PDF | ❌ Absent | — |
| Custom report builder | ❌ Absent | — |
| Dashboard with key business metrics | ✅ Comparable | Both have dashboard with KPI indicators |
| Statistics per time period | ❌ Absent | — |

---

## 11. Collaboration & Communication Gap Analysis

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Internal messaging | ✅ Very basic | Dolibarr has very minimal messaging; NAPTIN's Owl Talk is vastly superior |
| Email notifications for events (new invoice, leave request) | ❌ Absent | NAPTIN has toast notifications in-app but no email alerts |
| Agenda / calendar with events | ⚠️ Basic | Both have meeting/event scheduling at basic level |
| Meeting scheduling with attendees | ✅ Comparable | — |
| Social intranet feed | ❌ Absent | NAPTIN advantage — Dolibarr has no social feed |
| Real-time chat and video calls | ❌ Absent | NAPTIN advantage — Owl Talk with WebRTC |
| Internal knowledge base / wiki | ⚠️ Very basic | NAPTIN has Intranet posts; Dolibarr has a simple news module |

---

## 12. Administration & Technical Platform

| Dolibarr Feature | NAPTIN Status | Notes |
|-----------------|---------------|-------|
| Module enable/disable per installation | ✅ Comparable | Both support enabling/disabling modules via admin |
| Multi-company support | ❌ Absent | Dolibarr supports multiple companies in one install; NAPTIN is single-entity |
| Multi-language interface (60+) | ❌ Absent | NAPTIN is English-only |
| Multi-currency | ⚠️ Partial | NAPTIN has FX rates; Dolibarr natively transacts in multiple currencies |
| LDAP / Active Directory integration | ❌ Not implemented | Dolibarr has LDAP connector; NAPTIN's SSO is architecture-ready |
| User permission groups | ✅ Full | Both have role-based permissions (NAPTIN's is more sophisticated) |
| Audit trail (who did what) | ✅ Full | Both have audit logs (NAPTIN's is more detailed for governance) |
| API (REST) | ✅ Full | Both expose REST APIs; NAPTIN's is purpose-built |
| DoliStore (plugin marketplace) | ❌ Absent | NAPTIN has no extension marketplace |
| Two-factor authentication | ❌ Absent | Neither has 2FA implemented (Dolibarr has it as optional) |
| Email-to-task / Email-to-ticket | ❌ Absent | — |
| Mobile-responsive interface | ✅ Full | Both are responsive; NAPTIN supports PWA installation |
| PWA / installable web app | ❌ Absent | NAPTIN advantage — PWA with service worker |

---

## 13. Features NAPTIN Has That Dolibarr Does Not

| NAPTIN Feature | Description |
|----------------|-------------|
| **Real-time WebRTC Audio/Video Calls** | Dolibarr has no calling feature. NAPTIN's Owl Talk provides audio/video within the portal. |
| **Intranet Social Feed** | Dolibarr has basic news posts. NAPTIN has a full social feed with likes, comments, hashtags, trending, and file sharing. |
| **Nigeria-Specific HRMS** | Grade levels (GL-01 to GL-17), pension PIN, NHF, government employment types — purpose-built for Nigeria's federal government pay structure. |
| **Full Procurement Lifecycle** | NAPTIN's procurement aligns to Nigerian public procurement regulations including RFQ, 3-way matching, and tender management. |
| **Whistleblower Portal** | Completely absent in Dolibarr. NAPTIN provides anonymous report submission with tracking codes and case management. |
| **RBAC with SOD Enforcement** | NAPTIN's role hierarchy (levels 1-10), SOD conflict rules, and Admin Host Guard far exceed Dolibarr's basic user groups. |
| **Immutable Audit Trail** | NAPTIN records all policy changes, role assignments, and approval decisions in an immutable audit log. Dolibarr's log is more superficial. |
| **Cash Advance Lifecycle with GL Auto-Posting** | NAPTIN's government petty cash advance module automatically posts GL journal entries on disbursement and settlement — a government-specific control that Dolibarr doesn't have. |
| **BPM Visual Workflow Designer** | NAPTIN has a node-based visual process builder with versioning and case execution. Dolibarr has basic approval workflows but no graphical BPM engine. |
| **DG Executive Portal** | Purpose-built Director-General executive dashboard. No Dolibarr equivalent. |
| **SERVICOM & ACTU Modules** | Nigerian government-specific modules (SERVICOM complaint tracking, legal case/flag management). |
| **PWA (Progressive Web App)** | NAPTIN is installable on mobile devices and has an offline shell. Dolibarr is not a PWA. |
| **Group Video Conferencing** | Dolibarr does not have video calling. NAPTIN supports group WebRTC calls. |
| **Training Institute Management** | NAPTIN's Training module (TNA, compliance certifications, session scheduling) reflects NAPTIN's primary business as a training institute. |

---

## 14. Prioritized Gap Roadmap

Gaps from Dolibarr that are practical and relevant for NAPTIN to address:

| Priority | Gap | Impact | NAPTIN Effort |
|----------|-----|--------|---------------|
| **P1** | Financial Statements (P&L, Balance Sheet, Cash Flow) | High — management reporting | Medium |
| **P1** | Payslip PDF generation and email delivery | High — staff experience | Low |
| **P1** | Invoice PDF generation with line items | High — training business | Low |
| **P1** | Leave team calendar view | Medium — manager visibility | Low |
| **P2** | Email notifications for key events (leave approved, invoice due) | High — process awareness | Medium |
| **P2** | Training program quotation → enrollment → invoice pipeline | High — training business revenue | High |
| **P2** | Contact management for external clients (training customers) | High — training client relationship | Medium |
| **P2** | Accounting lock dates (period close) | Medium — compliance | Low |
| **P2** | Leave accrual automation | Medium | Low |
| **P3** | Report export (CSV/Excel/PDF) | Medium — data portability | Medium |
| **P3** | Project budget tracking | Medium — planning dept | Medium |
| **P3** | Task-level timesheet | Low-Medium | Medium |
| **P3** | Contract renewal reminders | Low | Low |
| **P3** | Vendor pricelist management | Low | Low |
| **P4** | LDAP / Active Directory integration | Medium — IT convenience | Medium |
| **P4** | Two-factor authentication | Medium — security | Medium |
| **P4** | Multi-currency invoice (for foreign training clients) | Low | Medium |
| **P5** | Aged receivables / payables report | Medium — finance control | Low |

---

## 15. Strategic Assessment

### Context

Dolibarr is the most comparable product to NAPTIN in terms of **target audience complexity** — both serve public institutions and SMEs that need practical ERP functionality without massive overhead. Dolibarr is PHP-based and more lightweight; NAPTIN is React/Node.js and more modern in UX.

### Where Dolibarr Wins

1. **Financial report completeness** — Even Dolibarr, a very lightweight ERP, generates P&L, Balance Sheet, and tax reports. NAPTIN does not. This is the most fundamental gap.

2. **Invoice and payslip PDF output** — Dolibarr generates branded PDFs for invoices, payslips, and quotes by default. NAPTIN stores records but cannot produce printable documents. This is a practical daily-use gap.

3. **Email notifications** — Dolibarr sends automatic email notifications for critical events (new invoice, leave approval, task assignment). NAPTIN has no outbound email integration.

4. **Sales quotation workflow** — Dolibarr's contact → proposal → invoice pipeline directly addresses NAPTIN's training business model where programs are sold to government agencies and the pipeline needs tracking.

5. **Leave team calendar** — Dolibarr shows who's on leave in a shared calendar. NAPTIN shows only individual history.

6. **Timesheet tracking** — Dolibarr ties time to projects; NAPTIN only tracks attendance clock-in/out.

7. **LDAP integration** — Dolibarr integrates with Active Directory for single sign-on in enterprise networks; NAPTIN is architecture-ready but not implemented.

### Where NAPTIN Wins Decisively

1. **Communication and collaboration** — NAPTIN's Owl Talk, intranet social feed, and WebRTC calls are dramatically more advanced than Dolibarr's minimal messaging.

2. **RBAC Governance** — NAPTIN's role hierarchy, SOD enforcement, admin host guard, and immutable audit trail are purpose-built for a government institution's compliance requirements. Dolibarr has basic user groups.

3. **Cash Advance GL Integration** — NAPTIN's government advance lifecycle with automatic GL journal posting on disbursement and settlement reflects professional finance practice that Dolibarr's expense module doesn't match.

4. **Whistleblower Portal** — A government accountability requirement absent from Dolibarr.

5. **Modern UX** — NAPTIN's React 18 SPA with Tailwind CSS, Lucide icons, and custom NAPTIN brand system is a far more modern experience than Dolibarr's classic PHP UI.

6. **PWA capability** — NAPTIN is installable and has an offline shell; Dolibarr is not a PWA.

7. **Training Institute Fit** — NAPTIN's Training module with TNA, compliance certificates, and session management is tailored to NAPTIN's mission. Dolibarr has no training institute management.

### Conclusion

Relative to Dolibarr — the most accessible open-source ERP standard — NAPTIN's primary practical gaps are: **financial statement generation**, **PDF output for invoices and payslips**, **email notification infrastructure**, and a **training sales pipeline (quotation to invoice)**. These are achievable within NAPTIN's existing architecture with moderate development effort and would close the most significant operational gaps that even the simplest ERP competitors provide out of the box.

NAPTIN surpasses Dolibarr in communication, governance, domain-specific finance (cash advance GL automation), whistleblower/compliance tooling, and user experience. The investment priority should be on the operational document output and notification gaps where even a free lightweight tool leaves NAPTIN behind.

---

*Analysis based on Dolibarr ERP/CRM 19 documentation, DoliWiki feature list, and NAPTIN v2.0.0 codebase analysis.*
