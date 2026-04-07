export const STAFF = [
  { id:'NPN001', name:'Grace Okafor', email:'g.okafor@naptin.gov.ng', dept:'Finance & Accounts', role:'Senior Accountant', grade:'GL-12', status:'active', joined:'Jan 2020', initials:'GO', color:'bg-blue-500' },
  { id:'NPN002', name:'Emmanuel Bello', email:'e.bello@naptin.gov.ng', dept:'Planning, Research & Statistics', role:'Systems Administrator', grade:'GL-09', status:'active', joined:'Mar 2019', initials:'EB', color:'bg-emerald-500' },
  { id:'NPN003', name:'Fatima Adamu', email:'f.adamu@naptin.gov.ng', dept:'Legal / Board Secretariat', role:'Principal Legal Officer', grade:'GL-14', status:'leave', joined:'Jun 2017', initials:'FA', color:'bg-pink-500' },
  { id:'NPN004', name:'Chukwuma Ude', email:'c.ude@naptin.gov.ng', dept:'Human Resource Management', role:'Admin Officer II', grade:'GL-08', status:'probation', joined:'Feb 2026', initials:'CU', color:'bg-purple-500' },
  { id:'NPN005', name:'Miriam Ibrahim', email:'m.ibrahim@naptin.gov.ng', dept:'Procurement', role:'Procurement Officer', grade:'GL-10', status:'active', joined:'Aug 2021', initials:'MI', color:'bg-amber-500' },
  { id:'NPN006', name:'Kemi Oluwole', email:'k.oluwole@naptin.gov.ng', dept:'Planning, Research & Statistics', role:'M&E Analyst', grade:'GL-09', status:'pending', joined:'Nov 2023', initials:'KO', color:'bg-red-400' },
  { id:'NPN007', name:'Tunde Ajayi', email:'t.ajayi@naptin.gov.ng', dept:'Training', role:'Training Officer', grade:'GL-10', status:'active', joined:'Sep 2018', initials:'TA', color:'bg-teal-500' },
  { id:'NPN008', name:'Aisha Musa', email:'a.musa@naptin.gov.ng', dept:'Human Resource Management', role:'HR Officer', grade:'GL-09', status:'active', joined:'Jan 2022', initials:'AM', color:'bg-indigo-500' },
  { id:'NPN009', name:'Biodun Adeyemi', email:'b.adeyemi@naptin.gov.ng', dept:'Corporate & Consultancy Services', role:'Director', grade:'GL-16', status:'active', joined:'Apr 2015', initials:'BA', color:'bg-green-600' },
  { id:'NPN010', name:'Ngozi Eze', email:'n.eze@naptin.gov.ng', dept:'Finance & Accounts', role:'Budget Officer', grade:'GL-10', status:'active', joined:'Jul 2020', initials:'NE', color:'bg-cyan-500' },
]

export const TRANSACTIONS = [
  { ref:'TXN-2026-0847', desc:'Staff Salary — March 2026', dept:'Human Resource Management', amount:'₦52,400,000', date:'28 Mar 2026', status:'paid' },
  { ref:'TXN-2026-0846', desc:'ICT Infrastructure Upgrade', dept:'Planning, Research & Statistics', amount:'₦8,750,000', date:'27 Mar 2026', status:'processing' },
  { ref:'TXN-2026-0845', desc:'Legal Retainer — Q1', dept:'Legal / Board Secretariat', amount:'₦2,200,000', date:'25 Mar 2026', status:'paid' },
  { ref:'TXN-2026-0844', desc:'Office Supplies — General Services', dept:'Human Resource Management', amount:'₦650,000', date:'24 Mar 2026', status:'pending' },
  { ref:'TXN-2026-0843', desc:'Training Venue Hire — Q1', dept:'Training', amount:'₦1,800,000', date:'22 Mar 2026', status:'paid' },
  { ref:'TXN-2026-0842', desc:'Vehicle Maintenance Fleet', dept:'Human Resource Management', amount:'₦3,400,000', date:'20 Mar 2026', status:'pending' },
]

export const MEETINGS = [
  { id:1, title:'Q1 Financial Review', dept:'Finance & Accounts', time:'10:00 AM', duration:'2h', location:'Conference Room A', attendees:18, status:'live', avatars:['GO','EB','FA','MI'] },
  { id:2, title:'ICT Systems Status Call', dept:'Planning, Research & Statistics', time:'09:30 AM', duration:'45m', location:'Virtual', attendees:8, status:'live', avatars:['EB','CU','TA'] },
  { id:3, title:'Morning HR Briefing', dept:'Human Resource Management', time:'08:30 AM', duration:'30m', location:'Conference Room C', attendees:9, status:'ended', avatars:['AM','GO'] },
  { id:4, title:'Procurement Vendor Review', dept:'Procurement', time:'02:00 PM', duration:'1.5h', location:'Boardroom 2', attendees:12, status:'upcoming', avatars:['MI','CU'] },
  { id:5, title:'Legal Compliance Briefing', dept:'Legal / Board Secretariat', time:'04:00 PM', duration:'1h', location:'Virtual', attendees:24, status:'upcoming', avatars:['FA','AM'] },
  { id:6, title:'Board of Directors Meeting', dept:'Corporate & Consultancy Services', time:'Mon 9:00 AM', duration:'3h', location:'Executive Boardroom', attendees:14, status:'scheduled', avatars:['BA','GO','FA'] },
]

export const LEAVE_HISTORY = [
  { type:'Annual Leave', duration:'5 days', dates:'Jan 6–10, 2026', status:'approved' },
  { type:'Sick Leave', duration:'2 days', dates:'Feb 14–15, 2026', status:'approved' },
  { type:'Annual Leave', duration:'3 days', dates:'Mar 24–26, 2026', status:'pending' },
]

export const SPEND_DATA = [
  { month:'Jan', amount:420 },{ month:'Feb', amount:580 },{ month:'Mar', amount:390 },
  { month:'Apr', amount:290 },{ month:'May', amount:120 },{ month:'Jun', amount:80 },
]

export const ATTEND_DATA = [
  { day:'Mon', rate:91 },{ day:'Tue', rate:94 },{ day:'Wed', rate:89 },
  { day:'Thu', rate:96 },{ day:'Fri', rate:93 },{ day:'Sat', rate:62 },
]

export const DEPT_HEADCOUNT = [
  { dept:'Human Resource Management', count:148, pct:45, color:'bg-[#006838]' },
  { dept:'Finance & Accounts', count:98, pct:30, color:'bg-amber-500' },
  { dept:'Planning, Research & Statistics', count:126, pct:38, color:'bg-blue-500' },
  { dept:'Training', count:184, pct:56, color:'bg-teal-500' },
  { dept:'Corporate & Consultancy Services', count:72, pct:22, color:'bg-green-600' },
  { dept:'Marketing & Business Development', count:38, pct:12, color:'bg-pink-500' },
  { dept:'Procurement (Unit)', count:82, pct:25, color:'bg-purple-500' },
  { dept:'Legal / Board Secretariat (Unit)', count:38, pct:12, color:'bg-red-400' },
  { dept:'Internal Audit (Unit)', count:24, pct:7, color:'bg-orange-400' },
]

export const PIE_DATA = [
  { name:'Personnel', value:620, color:'#006838' },
  { name:'Capital', value:530, color:'#10b981' },
  { name:'Overhead', value:398, color:'#f59e0b' },
  { name:'Procurement', value:310, color:'#8b5cf6' },
  { name:'Training', value:178, color:'#ec4899' },
]

/** Team workspaces & collaboration */
export const WORKSPACES = [
  { id:'ws1', name:'Q1 Board Pack', dept:'Corporate', members:14, files:28, posts:6, updated:'2h ago' },
  { id:'ws2', name:'ICT Infrastructure 2026', dept:'ICT', members:22, files:41, posts:19, updated:'30m ago' },
  { id:'ws3', name:'Training Curriculum Refresh', dept:'Training', members:11, files:15, posts:8, updated:'1d ago' },
  { id:'ws4', name:'M&E Impact — Northern RTCs', dept:'M&E', members:9, files:33, posts:4, updated:'4h ago' },
]

export const SHARED_FILES = [
  { name:'Board_Q1_Financial_Summary.pdf', owner:'GO', size:'2.4 MB', modified:'28 Mar 2026', shared:'Finance workspace', lock:false },
  { name:'HR_Policy_2026.docx', owner:'AM', size:'890 KB', modified:'27 Mar 2026', shared:'HR & Legal', lock:true },
  { name:'Vendor_Master_Q1.xlsx', owner:'MI', size:'1.1 MB', modified:'26 Mar 2026', shared:'Procurement', lock:false },
  { name:'Substation_Safety_Checklist.pdf', owner:'TA', size:'540 KB', modified:'25 Mar 2026', shared:'Training', lock:false },
  { name:'M&E_Indicators_Framework.pptx', owner:'KO', size:'3.2 MB', modified:'24 Mar 2026', shared:'M&E workspace', lock:true },
]

export const PROJECTS = [
  { id:'p1', name:'ANCEE Accreditation Renewal', owner:'BA', progress:72, due:'30 Apr 2026', status:'on-track', tasksOpen:8, tasksDone:21 },
  { id:'p2', name:'Lagos RTC Solar Pilot', owner:'TA', progress:45, due:'15 Jun 2026', status:'at-risk', tasksOpen:14, tasksDone:11 },
  { id:'p3', name:'ERP Phase 2 — HR Module', owner:'AM', progress:38, due:'31 Aug 2026', status:'on-track', tasksOpen:22, tasksDone:13 },
  { id:'p4', name:'National Grid Safety Campaign', owner:'NE', progress:88, due:'10 Apr 2026', status:'on-track', tasksOpen:3, tasksDone:24 },
]

export const PROJECT_TASKS = [
  { project:'p1', title:'Submit evidence pack to ANCEE', assignee:'BA', due:'05 Apr 2026', priority:'high', status:'in-progress' },
  { project:'p1', title:'Internal audit sign-off', assignee:'GO', due:'08 Apr 2026', priority:'medium', status:'todo' },
  { project:'p2', title:'Vendor site survey — Ijora', assignee:'MI', due:'02 Apr 2026', priority:'high', status:'blocked' },
  { project:'p3', title:'Payroll UAT with Finance', assignee:'AM', due:'12 Apr 2026', priority:'medium', status:'in-progress' },
  { project:'p4', title:'Press release draft', assignee:'BA', due:'29 Mar 2026', priority:'low', status:'done' },
]

export const FORUM_THREADS = [
  { id:1, title:'Proposed change to annual leave policy', author:'AM', replies:24, views:412, tag:'HR', pinned:true, last:'28 Mar' },
  { id:2, title:'Best practices for substation training assessments', author:'TA', replies:18, views:289, tag:'Training', pinned:false, last:'27 Mar' },
  { id:3, title:'ICT maintenance — how to request emergency downtime?', author:'EB', replies:31, views:501, tag:'ICT', pinned:false, last:'27 Mar' },
  { id:4, title:'Procurement: new threshold for RFQs', author:'MI', replies:9, views:156, tag:'Procurement', pinned:false, last:'26 Mar' },
]

export const WIKI_ARTICLES = [
  { id:'w1', title:'Staff onboarding checklist', category:'HR', updated:'20 Mar 2026', excerpt:'Steps for HR, ICT, and line managers when onboarding new staff.' },
  { id:'w2', title:'Expense claim process (FMM 2026)', category:'Finance', updated:'18 Mar 2026', excerpt:'How to submit, approve, and retire imprest and travel claims.' },
  { id:'w3', title:'NAPTIN brand & comms guidelines', category:'Corporate', updated:'10 Mar 2026', excerpt:'Logo usage, colour palette, and approval workflow for external comms.' },
  { id:'w4', title:'Incident reporting — ICT security', category:'ICT', updated:'05 Mar 2026', excerpt:'When and how to report phishing, malware, and data incidents.' },
  { id:'w5', title:'M&E logical framework template', category:'M&E', updated:'01 Mar 2026', excerpt:'Standard results chain and indicator definitions for donor reporting.' },
]

export const CALENDAR_EVENTS = [
  { id:1, title:'DG Briefing', day:28, month:'Mar', time:'08:00', type:'internal', location:'Executive Boardroom' },
  { id:2, title:'Q1 Financial Review', day:28, month:'Mar', time:'10:00', type:'meeting', location:'Conference Room A' },
  { id:3, title:'Vendor review — transformers', day:29, month:'Mar', time:'14:00', type:'procurement', location:'Boardroom 2' },
  { id:4, title:'Board of Directors', day:31, month:'Mar', time:'09:00', type:'board', location:'Executive Boardroom' },
  { id:5, title:'ICT change window', day:31, month:'Mar', time:'23:00', type:'maintenance', location:'Data Centre' },
]

export const INTEGRATION_CONNECTORS = [
  { name:'Microsoft 365', type:'Identity & productivity', status:'connected', desc:'SSO, Teams calendar sync, SharePoint search' },
  { name:'SAP S/4HANA (Finance)', type:'ERP', status:'connected', desc:'GL, commitments, vendor payments (read-only sandbox)' },
  { name:'Salesforce CRM', type:'CRM', status:'pilot', desc:'Stakeholder & partner relationship tracking' },
  { name:'Oracle Payroll Bridge', type:'HR / Payroll', status:'planned', desc:'Payslip push and deduction codes' },
  { name:'Power BI — M&E', type:'Analytics', status:'connected', desc:'Impact dashboards and scheduled refresh' },
]

export const ROLE_POLICIES = [
  { role:'Staff', modules:'Self-service, Intranet, Directory, Training enrolment', mfa:'Optional' },
  { role:'HOD', modules:'+ Approvals, Finance views (dept), HR actions (dept)', mfa:'Required' },
  { role:'Director', modules:'+ Board workspace, enterprise reports, sensitive docs', mfa:'Required' },
  { role:'ICT Admin', modules:'+ Integrations, security centre, audit logs', mfa:'Required + hardware token' },
  { role:'Auditor (read-only)', modules:'Compliance, transaction & access logs', mfa:'Required' },
]

export const AUDIT_SNIPPETS = [
  { action:'Policy document viewed', user:'a.okonkwo@naptin.gov.ng', target:'HR_Policy_2026.docx', when:'28 Mar 2026 · 09:14' },
  { action:'Role elevation requested', user:'e.bello@naptin.gov.ng', target:'ICT Admin (temporary)', when:'27 Mar 2026 · 16:02' },
  { action:'Integration token rotated', user:'system', target:'Microsoft 365', when:'27 Mar 2026 · 03:00' },
]

/** HR ERP prototype */
export const JOB_OPENINGS = [
  { ref:'VAC-2026-014', title:'Senior Training Officer — Power Systems', dept:'Training', grade:'GL-12', closes:'15 Apr 2026', applicants:47, stage:'Shortlisting' },
  { ref:'VAC-2026-013', title:'M&E Analyst II', dept:'Planning, Research & Statistics', grade:'GL-09', closes:'08 Apr 2026', applicants:62, stage:'Assessment' },
  { ref:'VAC-2026-012', title:'Legal Officer I', dept:'Legal / Board Secretariat', grade:'GL-08', closes:'22 Mar 2026', applicants:38, stage:'Interview' },
  { ref:'VAC-2026-011', title:'Brand & Communications Officer', dept:'Marketing & Business Development', grade:'GL-09', closes:'22 Apr 2026', applicants:29, stage:'Shortlisting' },
]

export const PAYROLL_RUNS = [
  { period:'March 2026', status:'Processed', payDate:'28 Mar 2026', staffPaid:1248, net:'₦1.02B', variance:'0.02%' },
  { period:'February 2026', status:'Closed', payDate:'27 Feb 2026', staffPaid:1244, net:'₦1.01B', variance:'0.00%' },
]

export const TALENT_CYCLES = [
  { name:'FY2026 H1 — Corporate', progress:64, due:'30 Apr 2026', completed:312, total:486 },
  { name:'Technical ladder review', progress:41, due:'15 May 2026', completed:28, total:68 },
]

export const TALENT_ACTIONS = [
  { staff:'Grace Okafor', action:'Promotion readiness — GL-13', owner:'AM', due:'10 Apr 2026', status:'in-progress' },
  { staff:'Emmanuel Bello', action:'Certification — CISSP renewal', owner:'EB', due:'20 Apr 2026', status:'pending' },
  { staff:'Kemi Oluwole', action:'Probation sign-off', owner:'AM', due:'05 Apr 2026', status:'at-risk' },
]

export const ATTENDANCE_DAILY = [
  { site:'Corporate HQ', present:412, expected:438, rate:94.1 },
  { site:'Lagos — Ijora', present:128, expected:134, rate:95.5 },
  { site:'Kaduna RTC', present:118, expected:124, rate:95.2 },
  { site:'Afam — Rivers', present:168, expected:178, rate:94.4 },
]

/** Employee payslips (self-service viewer prototype) */
export const PAYSLIPS = [
  { period:'March 2026', payDate:'28 Mar 2026', gross:'₦1,245,000', net:'₦982,400', deductions:'₦262,600', status:'Released', ref:'PS-2026-03-0421' },
  { period:'February 2026', payDate:'27 Feb 2026', gross:'₦1,245,000', net:'₦981,900', deductions:'₦263,100', status:'Released', ref:'PS-2026-02-0421' },
  { period:'January 2026', payDate:'29 Jan 2026', gross:'₦1,240,000', net:'₦978,200', deductions:'₦261,800', status:'Released', ref:'PS-2026-01-0421' },
]

/** Sample line items for payslip detail panel */
export const PAYSLIP_DETAIL_LINES = [
  { label:'Basic salary', amount:'₦850,000' },
  { label:'Housing allowance', amount:'₦127,500' },
  { label:'Transport allowance', amount:'₦85,000' },
  { label:'PAYE tax', amount:'-₦198,400' },
  { label:'Pension (8%)', amount:'-₦68,000' },
  { label:'NHF', amount:'-₦21,200' },
]

/** Post-offer onboarding / new-starter pipeline (HR operations) */
export const ONBOARDING_CASES = [
  { id:'ONB-18', name:'Ibrahim Musa', role:'Training Assistant II', dept:'Training', startDate:'07 Apr 2026', stage:'Pre-joining', owner:'AM', tasksDone:4, tasksTotal:8 },
  { id:'ONB-17', name:'Chioma Nwosu', role:'Finance Officer I', dept:'Finance & Accounts', startDate:'14 Apr 2026', stage:'Offer accepted', owner:'GO', tasksDone:2, tasksTotal:8 },
  { id:'ONB-16', name:'Yusuf Garba', role:'ICT Support', dept:'Planning, Research & Statistics', startDate:'01 Apr 2026', stage:'Day 1 complete', owner:'EB', tasksDone:6, tasksTotal:8 },
  { id:'ONB-15', name:'Esther John', role:'HR Officer II', dept:'Human Resource Management', startDate:'24 Mar 2026', stage:'90-day review', owner:'AM', tasksDone:8, tasksTotal:8 },
]

/** Performance management — goals & reviews (prototype) */
export const PERFORMANCE_GOALS = [
  { staff:'Adebayo Okonkwo', cycle:'FY2026 H1', goal:'Reduce average time-to-hire for GL-09 roles by 15%', progress:62, due:'30 Jun 2026', status:'on-track' },
  { staff:'Grace Okafor', cycle:'FY2026 H1', goal:'Close 100% of month-end payroll exceptions within 48h', progress:88, due:'30 Jun 2026', status:'on-track' },
  { staff:'Aisha Musa', cycle:'FY2026 H1', goal:'Launch revised induction pack for all RTCs', progress:35, due:'31 May 2026', status:'at-risk' },
]

export const PERFORMANCE_REVIEWS = [
  { staff:'Grace Okafor', reviewer:'Director — Finance', type:'Mid-year', due:'30 Apr 2026', status:'Self-assessment', lastRating:'Exceeds (FY2025)' },
  { staff:'Emmanuel Bello', reviewer:'HOD — ICT', type:'Annual', due:'15 Mar 2026', status:'Manager review', lastRating:'Meets (FY2025)' },
  { staff:'Fatima Adamu', reviewer:'DG Office', type:'Confirmatory', due:'10 Apr 2026', status:'Calibration', lastRating:'—' },
  { staff:'Biodun Adeyemi', reviewer:'Board HR Committee', type:'Director review', due:'30 Jun 2026', status:'Not started', lastRating:'Exceeds (FY2025)' },
]

/** Corporate / Legal / M&E / ICT / Documents */
export const LEGAL_MATTERS = [
  { ref:'LEG-2408', title:'Power sector training MOU — review', owner:'FA', status:'In review', due:'04 Apr 2026' },
  { ref:'LEG-2407', title:'Vendor NDA — ANCEE consultants', owner:'FA', status:'With counterparty', due:'12 Apr 2026' },
]

export const PR_CAMPAIGNS = [
  { name:'Women in Power Programme', reach:'128k (est.)', channel:'Web + Radio', status:'Live', owner:'Corporate Comms' },
  { name:'Grid Safety Week 2026', reach:'—', channel:'TV + Social', status:'Planning', owner:'Corporate Comms' },
]

export const BOARD_PACKS = [
  { meeting:'Board — 31 Mar 2026', sections:9, confidential:true, circulated:'DG Office', status:'Locked for circulation' },
  { meeting:'Audit Committee — 18 Apr 2026', sections:5, confidential:true, circulated:'—', status:'Draft' },
]

export const RISK_REGISTER = [
  { id:'R-104', title:'Single point of failure — payroll bridge', score:'Medium', owner:'Planning, Research & Statistics', treatment:'Redundant integration path Q3' },
  { id:'R-098', title:'Vendor concentration — critical spares', score:'High', owner:'Procurement', treatment:'Dual sourcing pilot' },
]

/** Marketing & Business Development */
export const BRAND_CAMPAIGNS = [
  { id:'MKT-2026-01', title:'NAPTIN 2026 Brand Refresh', status:'In progress', owner:'Corporate Comms', budget:'₦4,200,000', due:'30 Apr 2026' },
  { id:'MKT-2026-02', title:'Power Sector Alumni Network Launch', status:'Planning', owner:'Marketing', budget:'₦1,800,000', due:'31 May 2026' },
  { id:'MKT-2026-03', title:'Social Media Presence — Q2', status:'Live', owner:'Corporate Comms', budget:'₦950,000', due:'30 Jun 2026' },
]

export const CLIENT_PIPELINE = [
  { id:'CL-2026-41', client:'NERC (Regulatory)', type:'Consultancy', value:'₦12,500,000', stage:'Proposal submitted', owner:'BA', due:'15 Apr 2026' },
  { id:'CL-2026-40', client:'Kaduna DisCo', type:'Technical Training', value:'₦7,200,000', stage:'Contract review', owner:'TA', due:'30 Apr 2026' },
  { id:'CL-2026-39', client:'Niger Delta Power', type:'Hospitality & Venue', value:'₦3,450,000', stage:'MOU signed', owner:'Corporate Services', due:'20 Apr 2026' },
  { id:'CL-2026-38', client:'FMPOWER', type:'Research Partnership', value:'₦5,800,000', stage:'Scoping', owner:'BA', due:'31 May 2026' },
]

export const MARKET_METRICS = [
  { label:'External clients (YTD)', value:'14', trend:'+3 vs Q4 2025' },
  { label:'Consultancy revenue (YTD)', value:'₦42M', trend:'+18%' },
  { label:'Brand reach (social)', value:'284k', trend:'+22%' },
]

/** Planning, Research & Statistics */
export const PLANNING_INSTRUMENTS = [
  { ref:'PL-2026-01', title:'NAPTIN 2026–2030 Strategic Plan', status:'Approved', owner:'DG Office', review:'Jan 2027' },
  { ref:'PL-2026-02', title:'Q2 2026 Work Plan', status:'Active', owner:'Planning Unit', review:'Jun 2026' },
  { ref:'PL-2026-03', title:'RTC Expansion Feasibility Study', status:'Draft', owner:'Research & Statistics', review:'May 2026' },
  { ref:'PL-2026-04', title:'Annual Performance Report 2025', status:'Pending approval', owner:'Planning Unit', review:'Apr 2026' },
  { ref:'PL-2026-05', title:'Budget Framework Memorandum — FY2027', status:'Draft', owner:'Planning Unit', review:'Jul 2026' },
]

export const PLANNING_APPROVALS = [
  { id:'APV-2026-41', title:'Q2 2026 Work Plan — Final Review', type:'Work Plan', submittedBy:'Planning Unit', submittedDate:'02 Apr 2026', priority:'High', status:'pending', attachments:2, notes:'' },
  { id:'APV-2026-40', title:'RTC Expansion Feasibility Study — Director Sign-off', type:'Feasibility Study', submittedBy:'Research & Statistics', submittedDate:'01 Apr 2026', priority:'High', status:'pending', attachments:3, notes:'' },
  { id:'APV-2026-39', title:'M&E Framework Update — Power Sector', type:'Policy Document', submittedBy:'M&E Unit', submittedDate:'29 Mar 2026', priority:'Medium', status:'approved', attachments:1, notes:'Approved with minor amendments.' },
  { id:'APV-2026-38', title:'Research Budget Reallocation — Q2', type:'Budget Memo', submittedBy:'Research Unit', submittedDate:'28 Mar 2026', priority:'Medium', status:'returned', attachments:1, notes:'Further justification required for travel line.' },
  { id:'APV-2026-37', title:'Annual Performance Indicators Revision', type:'Performance Framework', submittedBy:'M&E Unit', submittedDate:'25 Mar 2026', priority:'Low', status:'approved', attachments:2, notes:'Approved. Circulate to all HODs.' },
]

export const PLANNING_WORKPLAN_TASKS = [
  { id:'WP-001', title:'Submit Q2 Work Plan to DG Office', unit:'Planning', assignee:'Planning Officer I', due:'10 Apr 2026', priority:'high', status:'in-progress', progress:70 },
  { id:'WP-002', title:'Compile Q1 performance data from all departments', unit:'Planning', assignee:'Statistics Analyst', due:'08 Apr 2026', priority:'high', status:'in-progress', progress:55 },
  { id:'WP-003', title:'Update RTC Expansion feasibility matrix', unit:'Research & Statistics', assignee:'Research Officer II', due:'15 Apr 2026', priority:'medium', status:'pending', progress:20 },
  { id:'WP-004', title:'Publish M&E Q1 impact bulletin', unit:'M&E', assignee:'M&E Analyst', due:'12 Apr 2026', priority:'high', status:'in-progress', progress:80 },
  { id:'WP-005', title:'Draft FY2027 budget framework memo', unit:'Planning', assignee:'Planning Officer II', due:'30 Apr 2026', priority:'medium', status:'pending', progress:10 },
  { id:'WP-006', title:'Coordinate data collection — partner institutions', unit:'Research & Statistics', assignee:'Data Officer', due:'20 Apr 2026', priority:'low', status:'pending', progress:0 },
]

export const RESEARCH_PUBLICATIONS = [
  { id:'RES-24', title:'Power Sector Workforce Gap Analysis 2025', authors:'Research Unit', status:'Published', date:'Feb 2026', downloads:284, pages:62 },
  { id:'RES-23', title:'Impact of NAPTIN Training on Grid Reliability', authors:'M&E Unit', status:'Under review', date:'Mar 2026', downloads:0, pages:48 },
  { id:'RES-22', title:'Renewable Energy Skills Demand Survey', authors:'Research Unit', status:'Data collection', date:'Apr 2026', downloads:0, pages:0 },
  { id:'RES-21', title:'RTC Infrastructure Utilisation Report 2025', authors:'Statistics Unit', status:'Published', date:'Jan 2026', downloads:412, pages:35 },
  { id:'RES-20', title:'Training Impact on DisCo Technician Productivity', authors:'M&E / Research', status:'Draft review', date:'Apr 2026', downloads:0, pages:54 },
]

export const RESEARCH_APPROVAL_REQUESTS = [
  { id:'RA-2026-14', title:'Publish RES-23 — Grid Reliability Study', requestedBy:'M&E Unit', date:'03 Apr 2026', status:'pending' },
  { id:'RA-2026-13', title:'External data-sharing MOU — University of Abuja', requestedBy:'Research Unit', date:'01 Apr 2026', status:'pending' },
  { id:'RA-2026-12', title:'Survey instrument approval — Skills Demand Study', requestedBy:'Research Unit', date:'29 Mar 2026', status:'approved' },
]

export const STATISTICS_SNAPSHOTS = [
  { metric:'Staff trained (cumulative)', value:'61,240', year:'2026 YTD' },
  { metric:'Programmes delivered', value:'128', year:'2026 YTD' },
  { metric:'Regional Training Centres', value:'10', year:'Active' },
  { metric:'Partner institutions', value:'34', year:'Active' },
]

export const MANDE_APPROVAL_REQUESTS = [
  { id:'ME-APV-22', title:'Q1 M&E Report — Director Endorsement', submittedBy:'M&E Analyst', date:'04 Apr 2026', status:'pending', type:'Report' },
  { id:'ME-APV-21', title:'Update KPI targets — RTC utilisation (85% → 90%)', submittedBy:'M&E Analyst', date:'02 Apr 2026', status:'pending', type:'KPI Revision' },
  { id:'ME-APV-20', title:'Field data collection plan — Northern RTCs', submittedBy:'M&E Officer', date:'30 Mar 2026', status:'approved', type:'Data Plan' },
  { id:'ME-APV-19', title:'Indicator framework amendment — Renewable Energy', submittedBy:'M&E Analyst', date:'27 Mar 2026', status:'returned', type:'Framework' },
]

export const MANDE_FIELD_VISITS = [
  { id:'FV-2026-08', site:'Kaduna RTC', purpose:'Q1 data validation', officer:'M&E Officer I', date:'14 Apr 2026', status:'planned' },
  { id:'FV-2026-07', site:'Afam RTC — Rivers', purpose:'Safety indicator audit', officer:'M&E Analyst', date:'09 Apr 2026', status:'approved' },
  { id:'FV-2026-06', site:'Lagos — Ijora', purpose:'Women in Power cohort 2 assessment', officer:'M&E Analyst', date:'03 Apr 2026', status:'completed' },
]

/** PRS Extended: Strategic, Budget, Research Templates, Requests, Lineage, Alerts, Evaluations */
export const STRATEGIC_OBJECTIVES = [
  { id:'SO-01', goal:'Increase annual training capacity by 30%', pillar:'Capacity Building', owner:'Training Dept', deadline:'Dec 2026', progress:62, status:'on-track',
    kpis:[{ label:'Trainees enrolled (YTD)', target:15000, current:9300, unit:'' }, { label:'Programmes active', target:150, current:128, unit:'' }],
    dataSource:'Training Management System' },
  { id:'SO-02', goal:'Achieve 90% RTC utilisation rate', pillar:'Infrastructure', owner:'Admin & Services', deadline:'Dec 2026', progress:78, status:'at-risk',
    kpis:[{ label:'RTC utilisation', target:90, current:78, unit:'%' }, { label:'Equipment availability', target:95, current:87, unit:'%' }],
    dataSource:'Facilities Management Log' },
  { id:'SO-03', goal:'Expand renewable energy training portfolio', pillar:'Innovation', owner:'Training / Research', deadline:'Jun 2026', progress:45, status:'at-risk',
    kpis:[{ label:'Renewable programmes launched', target:8, current:3, unit:'' }, { label:'Renewable trainees', target:2000, current:890, unit:'' }],
    dataSource:'Programme Registry' },
  { id:'SO-04', goal:'Publish 12 research outputs annually', pillar:'Knowledge Management', owner:'Research & Statistics', deadline:'Dec 2026', progress:33, status:'delayed',
    kpis:[{ label:'Publications (YTD)', target:12, current:4, unit:'' }, { label:'Citations received', target:80, current:22, unit:'' }],
    dataSource:'Research Repository' },
  { id:'SO-05', goal:'100% M&E framework adoption across programmes', pillar:'Governance', owner:'M&E Unit', deadline:'Sep 2026', progress:71, status:'on-track',
    kpis:[{ label:'Programmes with M&E logframe', target:128, current:91, unit:'' }, { label:'Evaluations completed', target:20, current:14, unit:'' }],
    dataSource:'M&E System' },
]

export const BUDGET_LINES = [
  { id:'BL-01', activity:'Annual research survey programme',        department:'Research & Statistics', planned:12500000, actual:9800000,  status:'active' },
  { id:'BL-02', activity:'M&E field visits — all RTCs',            department:'M&E Unit',              planned:4200000,  actual:5100000,  status:'overspend' },
  { id:'BL-03', activity:'Statistical software licences',           department:'Statistics Unit',        planned:1800000,  actual:1800000,  status:'on-track' },
  { id:'BL-04', activity:'PRS staff training & capacity building',  department:'Planning',               planned:3500000,  actual:1200000,  status:'underspend' },
  { id:'BL-05', activity:'Data collection tools & materials',       department:'Research & Statistics',  planned:2200000,  actual:2350000,  status:'overspend' },
  { id:'BL-06', activity:'Consultant fees — strategic plan review', department:'Planning',               planned:8000000,  actual:0,        status:'unfunded' },
  { id:'BL-07', activity:'Publication and printing costs',          department:'Research & Statistics',  planned:950000,   actual:780000,   status:'on-track' },
  { id:'BL-08', activity:'Data infrastructure — server upgrades',   department:'Statistics Unit',        planned:6000000,  actual:0,        status:'deferred' },
]

export const DATA_REQUESTS = [
  { id:'DR-2026-41', title:'2025 enrollment data by district and gender',         requestedBy:'DG Office',        dept:'Director General', date:'05 Apr 2026', deadline:'10 Apr 2026', priority:'high',   status:'in-progress', assignee:'Statistics Analyst',  matchedReport:null    },
  { id:'DR-2026-40', title:'Quarterly training completion rate — Q1 2026',        requestedBy:'Finance & Accounts',dept:'Finance',          date:'04 Apr 2026', deadline:'08 Apr 2026', priority:'high',   status:'fulfilled',   assignee:'Statistics Analyst',  matchedReport:'RES-21'},
  { id:'DR-2026-39', title:'Staff headcount breakdown by RTC',                    requestedBy:'HR Department',    dept:'HR',               date:'03 Apr 2026', deadline:'11 Apr 2026', priority:'medium', status:'pending',     assignee:null,                  matchedReport:null    },
  { id:'DR-2026-38', title:'Renewable energy programme reach — 2024–2025',        requestedBy:'Marketing',        dept:'Marketing',        date:'01 Apr 2026', deadline:'15 Apr 2026', priority:'medium', status:'pending',     assignee:null,                  matchedReport:'RES-24'},
  { id:'DR-2026-37', title:'Budget utilisation report — Q1 2026',                 requestedBy:'Corporate Affairs',dept:'Corporate',        date:'29 Mar 2026', deadline:'07 Apr 2026', priority:'high',   status:'fulfilled',   assignee:'Planning Officer I',  matchedReport:null    },
  { id:'DR-2026-36', title:'External partner performance ranking 2025',            requestedBy:'DG Office',        dept:'Director General', date:'28 Mar 2026', deadline:'30 Apr 2026', priority:'low',    status:'deferred',    assignee:null,                  matchedReport:null    },
]

export const DATA_LINEAGE = [
  { id:'DL-01', kpi:'Annual trainees (cumulative)', lastUpdated:'07 Apr 2026', qualityScore:96,
    stages:[
      { step:'Raw enrollment records',           source:'Training MIS',      type:'source'    },
      { step:'Remove duplicates & test entries', rule:'Dedup rule DL-R01',   type:'clean'     },
      { step:'Merge attendance confirmation',    source:'HRMS attendance',   type:'merge'     },
      { step:'Quarterly aggregation',            rule:'SUM(completions)',     type:'transform' },
      { step:'KPI 1.1 — Trainees (YTD)',         destination:'Dashboard, Annual Report', type:'output' },
    ]},
  { id:'DL-02', kpi:'RTC Utilisation Rate', lastUpdated:'05 Apr 2026', qualityScore:89,
    stages:[
      { step:'Facility booking log',             source:'Facilities System', type:'source'    },
      { step:'Exclude maintenance downtime',     rule:'status ≠ maintenance', type:'clean'   },
      { step:'(booked / available) × 100',       rule:'Utilisation formula',  type:'transform'},
      { step:'KPI 2.1 — RTC Utilisation',        destination:'M&E Dashboard', type:'output'  },
    ]},
  { id:'DL-03', kpi:'Research Publications count', lastUpdated:'06 Apr 2026', qualityScore:100,
    stages:[
      { step:'Research submission log',          source:'Research Registry',  type:'source'   },
      { step:'Filter: status = Published',       rule:'WHERE status=Published',type:'clean'   },
      { step:'KPI 4.1 — Publications (YTD)',     destination:'Research Report',type:'output'  },
    ]},
]

export const RESEARCH_TEMPLATES = [
  { id:'RT-01', name:'Client Satisfaction Survey',                          category:'Survey Module',       questions:18, lastUsed:'Feb 2026', usageCount:7,  validated:true  },
  { id:'RT-02', name:'Training Effectiveness (Kirkpatrick L1-L2)',          category:'Survey Module',       questions:24, lastUsed:'Jan 2026', usageCount:12, validated:true  },
  { id:'RT-03', name:'Staff Workload Assessment Tool',                      category:'Survey Module',       questions:15, lastUsed:'Nov 2025', usageCount:4,  validated:true  },
  { id:'RT-04', name:'Seasonal Adjustment Script (X-13 ARIMA)',             category:'Analysis Script',     questions:0,  lastUsed:'Mar 2026', usageCount:3,  validated:true  },
  { id:'RT-05', name:'K-Means Clustering (learner segmentation)',           category:'Analysis Script',     questions:0,  lastUsed:'Feb 2026', usageCount:2,  validated:false },
  { id:'RT-06', name:'RTC Capacity Utilisation Calculator',                 category:'Calculation Template',questions:0,  lastUsed:'Jan 2026', usageCount:6,  validated:true  },
  { id:'RT-07', name:'Pre/Post Training Knowledge Test (Power Systems)',    category:'Survey Module',       questions:30, lastUsed:'Apr 2026', usageCount:9,  validated:true  },
]

export const PREDICTIVE_ALERTS = [
  { id:'PA-01', kpi:'Trainees enrolled (YTD)', currentValue:9300, target:15000, trend:'declining', consecutiveMonths:2, severity:'warning',
    predictedOutcome:'Will miss target by ~3,200 (21%) at current pace',
    leadIndicator:'Training programme application rate dropped 18% in Mar 2026',
    recommendation:'Increase outreach to DisCo partners; fast-track 2 pending programme approvals' },
  { id:'PA-02', kpi:'RTC Utilisation Rate', currentValue:78, target:85, trend:'stagnant', consecutiveMonths:3, severity:'warning',
    predictedOutcome:'Likely to reach 80% by Dec 2026 — below 85% target',
    leadIndicator:'Booking rate has plateaued; Kaduna & Kano RTCs below 70%',
    recommendation:'Conduct utilisation audit at underperforming RTCs; market available capacity to industry' },
  { id:'PA-03', kpi:'Research publications (YTD)', currentValue:4, target:12, trend:'declining', consecutiveMonths:3, severity:'critical',
    predictedOutcome:'On track for only 7–8 outputs by year end',
    leadIndicator:'2 studies stalled at peer review; 1 external data partner unresponsive',
    recommendation:'Escalate external data partnership; offer expedited internal review for RES-22 & RES-23' },
]

export const EVALUATION_REPORTS = [
  { id:'EV-2026-04', title:'Mid-term evaluation — Women in Power cohort 2',  type:'Mid-term',       programme:'Women in Power',            evaluator:'M&E Analyst',        date:'Mar 2026', status:'completed',  rating:'Satisfactory',
    findings:['86% completion rate exceeds target','Mentorship component underfunded','Geographic distribution uneven — 70% Lagos/PH'] },
  { id:'EV-2026-03', title:'End-of-project — Digital Skills pilot',          type:'End-of-project', programme:'Digital Skills (Civil Servants)',evaluator:'External consultant', date:'Feb 2026', status:'completed', rating:'Highly satisfactory',
    findings:['1,240 certified vs 1,000 target','Post-training employment rate: 78%','Strong DG endorsement secured'] },
  { id:'EV-2026-02', title:'Mid-term — Northern RTC Grid Safety',            type:'Mid-term',       programme:'Grid Safety (North)',        evaluator:'M&E Officer I',       date:'Jan 2026', status:'completed', rating:'Moderately satisfactory',
    findings:['Incident rate halved (2.4 → 1.1)','PPE compliance gaps at Kaduna site','Budget over-run of 8.5%'] },
  { id:'EV-2026-01', title:'Annual Performance Review — 2025',               type:'Annual review',  programme:'All programmes',            evaluator:'Planning / M&E',      date:'Ongoing',  status:'in-progress',rating:'—',
    findings:[] },
]

export const ICT_TICKETS = [
  { id:'INC-8832', title:'VPN latency — Kaduna RTC', priority:'P2', status:'In progress', assignee:'EB' },
  { id:'INC-8821', title:'Laptop imaging queue backlog', priority:'P3', status:'Queued', assignee:'ICT Service Desk' },
  { id:'CHG-441', title:'Firewall rule — Finance BI', priority:'P2', status:'Scheduled', assignee:'EB' },
]

export const MANDE_KPIS = [
  { label:'Trainees (YTD)', value:'4,812', target:'15,000', unit:'' },
  { label:'RTC utilisation', value:'78%', target:'85%', unit:'' },
  { label:'Compliance audits closed', value:'12', target:'14', unit:'' },
]

export const MANDE_TRACKED_PROJECTS = [
  { name:'Northern RTC Grid Safety', indicator:'Incidents / 1k trainee-days', baseline:2.4, current:1.1, status:'improving' },
  { name:'Women in Power — cohort 2', indicator:'Completion %', baseline:0, current:86, status:'on-track' },
  { name:'Digital skills — civil servants', indicator:'Certified learners', baseline:0, current:1240, status:'on-track' },
]

export const COMPLIANCE_CHECKS = [
  { standard:'ISO 9001:2015', lastAudit:'Jan 2026', nextDue:'Jul 2026', status:'Green' },
  { standard:'ANCEE criteria', lastAudit:'Nov 2025', nextDue:'Aug 2026', status:'Amber' },
  { standard:'Data protection (NDPR)', lastReview:'Mar 2026', nextDue:'Sep 2026', status:'Green' },
]

export const DMS_RECORDS = [
  { ref:'DOC-2026-8891', title:'Board minutes — Feb 2026', classification:'Confidential', owner:'Corporate', retention:'7 years' },
  { ref:'DOC-2026-8720', title:'RTC safety inspection — Kano', classification:'Official', owner:'Admin', retention:'5 years' },
  { ref:'DOC-2026-8603', title:'Training agreement — partner university', classification:'Official', owner:'Legal', retention:'Contract + 6y' },
]

export const FACILITY_TICKETS = [
  { id:'FAC-221', site:'Corporate HQ', type:'HVAC', summary:'Block C — abnormal noise', status:'Assigned', sla:'48h' },
  { id:'FAC-218', site:'Lagos Ijora', type:'Electrical', summary:'Generator test log overdue', status:'Open', sla:'72h' },
]

export const FLEET_ROWS = [
  { plate:'ABJ-901-NG', type:'Toyota Hilux', driver:'Pool', nextService:'12 Apr 2026', status:'Available' },
  { plate:'LOS-442-NG', type:'Toyota Coaster', driver:'T. Ajayi', nextService:'02 Apr 2026', status:'On trip' },
  { plate:'KAD-118-NG', type:'Mitsubishi Pajero', driver:'Pool', nextService:'28 Mar 2026', status:'Workshop' },
]

// ─── TRAINING DEPARTMENT MOCK DATA ───────────────────────────────────────────

export const TNA_GAP_ITEMS = [
  { id:'G001', role:'Protection Engineer', dept:'Technical', competency:'Relay Coordination', severity:'High', requiredLevel:4, currentLevel:2, status:'open', assignedCourse:null },
  { id:'G002', role:'ICT Officer', dept:'ICT', competency:'Cybersecurity Forensics', severity:'High', requiredLevel:3, currentLevel:1, status:'assigned', assignedCourse:'Cybersecurity Advanced' },
  { id:'G003', role:'Finance Manager', dept:'Finance', competency:'IPSAS Reporting', severity:'Medium', requiredLevel:3, currentLevel:2, status:'open', assignedCourse:null },
  { id:'G004', role:'Training Officer', dept:'Training', competency:'Instructional Design', severity:'Medium', requiredLevel:4, currentLevel:3, status:'resolved', assignedCourse:'Instructional Design Cert.' },
  { id:'G005', role:'Substation Technician', dept:'Technical', competency:'HV Switchgear O&M', severity:'High', requiredLevel:4, currentLevel:1, status:'open', assignedCourse:null },
  { id:'G006', role:'HR Officer', dept:'HR', competency:'SAP HCM Administration', severity:'Low', requiredLevel:2, currentLevel:1, status:'assigned', assignedCourse:'SAP HCM Basics' },
  { id:'G007', role:'Planning Analyst', dept:'Planning', competency:'Econometric Modelling', severity:'Medium', requiredLevel:3, currentLevel:2, status:'open', assignedCourse:null },
]

export const TRAINING_COURSES = [
  { id:'C001', title:'Power System Protection & Control', format:'Classroom', duration:'5 days', status:'active', facilitator:'Engr. A. Yusuf', maxParticipants:20, enrolled:18, scheduled:'14 Apr 2026', costPerHead:85000 },
  { id:'C002', title:'Cybersecurity Advanced', format:'Blended', duration:'3 days', status:'active', facilitator:'Dr. C. Osei', maxParticipants:25, enrolled:12, scheduled:'21 Apr 2026', costPerHead:60000 },
  { id:'C003', title:'Leadership & Management Excellence', format:'Classroom', duration:'4 days', status:'active', facilitator:'Prof. I. Bello', maxParticipants:30, enrolled:28, scheduled:'05 May 2026', costPerHead:70000 },
  { id:'C004', title:'Transformer Installation & Maintenance', format:'Practical', duration:'7 days', status:'draft', facilitator:'Engr. M. Tanko', maxParticipants:15, enrolled:0, scheduled:'TBD', costPerHead:120000 },
  { id:'C005', title:'Instructional Design Certification', format:'Online', duration:'2 days', status:'completed', facilitator:'Dr. F. Aliyu', maxParticipants:20, enrolled:20, scheduled:'10 Mar 2026', costPerHead:40000 },
  { id:'C006', title:'SAP HCM Basics', format:'Online', duration:'2 days', status:'active', facilitator:'Mr. T. Dabo', maxParticipants:40, enrolled:35, scheduled:'28 Apr 2026', costPerHead:30000 },
]

export const CONTENT_BLOCKS = [
  { id:'B001', type:'Video', title:'HV Switchgear Safety Precautions', version:'2.1', lastUpdated:'15 Mar 2026', usedInCourses:3, validated:true },
  { id:'B002', type:'Quiz', title:'Relay Coordination Knowledge Check', version:'1.4', lastUpdated:'02 Apr 2026', usedInCourses:2, validated:true },
  { id:'B003', type:'Slide Deck', title:'IPSAS Module 3 — Fixed Assets', version:'3.0', lastUpdated:'20 Feb 2026', usedInCourses:1, validated:false },
  { id:'B004', type:'Case Study', title:'Power Outage RCA — Lagos 2024', version:'1.0', lastUpdated:'10 Jan 2026', usedInCourses:4, validated:true },
  { id:'B005', type:'Simulation', title:'Fault Isolation Virtual Lab', version:'1.2', lastUpdated:'01 Apr 2026', usedInCourses:2, validated:false },
  { id:'B006', type:'Reading', title:'Nigeria Grid Code Summary', version:'2.3', lastUpdated:'25 Mar 2026', usedInCourses:5, validated:true },
]

export const TRAINING_SESSIONS = [
  { id:'S001', courseId:'C001', courseTitle:'Power System Protection & Control', date:'14 Apr 2026', venue:'Abuja RTC — Room A4', facilitator:'Engr. A. Yusuf', capacity:20, enrolled:['P001','P002','P003','P004'], status:'scheduled' },
  { id:'S002', courseId:'C002', courseTitle:'Cybersecurity Advanced', date:'21 Apr 2026', venue:'Online (Teams)', facilitator:'Dr. C. Osei', capacity:25, enrolled:['P005','P006'], status:'scheduled' },
  { id:'S003', courseId:'C003', courseTitle:'Leadership & Management Excellence', date:'05 May 2026', venue:'Lagos Ijora — Conference Hall', facilitator:'Prof. I. Bello', capacity:30, enrolled:['P007','P008','P009'], status:'confirmed' },
  { id:'S004', courseId:'C005', courseTitle:'Instructional Design Certification', date:'10 Mar 2026', venue:'Abuja RTC — Room B2', facilitator:'Dr. F. Aliyu', capacity:20, enrolled:['P010','P011'], status:'completed' },
]

export const TRAINING_PARTICIPANTS = [
  { id:'P001', name:'Musa Abdullahi', dept:'Technical', role:'Protection Engineer', email:'m.abdullahi@naptin.gov.ng' },
  { id:'P002', name:'Ngozi Okonkwo', dept:'Technical', role:'Substation Engineer', email:'n.okonkwo@naptin.gov.ng' },
  { id:'P003', name:'Hassan Tanko', dept:'Technical', role:'Field Technician', email:'h.tanko@naptin.gov.ng' },
  { id:'P004', name:'Amina Sule', dept:'Technical', role:'Protection Engineer', email:'a.sule@naptin.gov.ng' },
  { id:'P005', name:'Chidi Osei', dept:'ICT', role:'ICT Officer', email:'c.osei@naptin.gov.ng' },
  { id:'P006', name:'Fatima Bello', dept:'ICT', role:'Network Admin', email:'f.bello@naptin.gov.ng' },
  { id:'P007', name:'Ibrahim Yusuf', dept:'Management', role:'Unit Head', email:'i.yusuf@naptin.gov.ng' },
  { id:'P008', name:'Blessing Eze', dept:'Finance', role:'Finance Manager', email:'b.eze@naptin.gov.ng' },
  { id:'P009', name:'Taiwo Ajayi', dept:'HR', role:'HR Manager', email:'t.ajayi@naptin.gov.ng' },
  { id:'P010', name:'Adaeze Nwosu', dept:'Training', role:'Training Officer', email:'a.nwosu@naptin.gov.ng' },
  { id:'P011', name:'Umar Dabo', dept:'Training', role:'Senior Trainer', email:'u.dabo@naptin.gov.ng' },
]

export const EVALUATION_RESPONSES = [
  { id:'E001', sessionId:'S004', sessionTitle:'Instructional Design Certification', participantId:'P010', participant:'Adaeze Nwosu', l1Overall:4.5, l1Dimensions:{content:5,delivery:4,materials:4,venue:5}, l2Pre:58, l2Post:84, l3Status:'confirmed', l3ConfirmedBy:'Head of Training', l4Impact:'25% faster content development cycle' },
  { id:'E002', sessionId:'S004', sessionTitle:'Instructional Design Certification', participantId:'P011', participant:'Umar Dabo', l1Overall:4.2, l1Dimensions:{content:4,delivery:5,materials:4,venue:4}, l2Pre:62, l2Post:91, l3Status:'partly', l3ConfirmedBy:'Head of Training', l4Impact:'Moderate improvement in design quality' },
  { id:'E003', sessionId:'S003', sessionTitle:'Leadership & Management Excellence', participantId:'P007', participant:'Ibrahim Yusuf', l1Overall:4.8, l1Dimensions:{content:5,delivery:5,materials:4,venue:5}, l2Pre:71, l2Post:88, l3Status:'pending', l3ConfirmedBy:null, l4Impact:null },
  { id:'E004', sessionId:'S003', sessionTitle:'Leadership & Management Excellence', participantId:'P009', participant:'Taiwo Ajayi', l1Overall:3.9, l1Dimensions:{content:4,delivery:4,materials:3,venue:4}, l2Pre:55, l2Post:79, l3Status:'pending', l3ConfirmedBy:null, l4Impact:null },
]

export const COMPLIANCE_HEAT_MAP = [
  { employeeId:'P001', name:'Musa Abdullahi', dept:'Technical', certifications:[
    { name:'HV Safety', expiry:'2027-01-15', status:'current' },
    { name:'First Aid', expiry:'2026-05-10', status:'expiring' },
    { name:'ISO 45001 Awareness', expiry:'2025-12-01', status:'expired' },
  ]},
  { employeeId:'P002', name:'Ngozi Okonkwo', dept:'Technical', certifications:[
    { name:'HV Safety', expiry:'2026-08-20', status:'current' },
    { name:'First Aid', expiry:'2026-09-15', status:'current' },
    { name:'ISO 45001 Awareness', expiry:'2026-11-30', status:'current' },
  ]},
  { employeeId:'P005', name:'Chidi Osei', dept:'ICT', certifications:[
    { name:'Cybersecurity Foundation', expiry:'2026-06-01', status:'expiring' },
    { name:'CompTIA Security+', expiry:'2024-12-31', status:'expired' },
    { name:'Data Protection (NDPR)', expiry:'2027-03-01', status:'current' },
  ]},
  { employeeId:'P007', name:'Ibrahim Yusuf', dept:'Management', certifications:[
    { name:'Leadership L3', expiry:'2028-02-01', status:'current' },
    { name:'Project Mgmt (PMP)', expiry:'2027-06-15', status:'current' },
    { name:'First Aid', expiry:'2026-04-30', status:'expiring' },
  ]},
  { employeeId:'P008', name:'Blessing Eze', dept:'Finance', certifications:[
    { name:'IPSAS Training', expiry:'2026-03-01', status:'expired' },
    { name:'Financial Controls', expiry:'2026-09-01', status:'current' },
    { name:'Anti-Corruption (ICAN)', expiry:'2027-05-30', status:'current' },
  ]},
]

export const TRAINERS = [
  { id:'T001', name:'Engr. A. Yusuf', specialization:'Power Systems', utilisation:82, sessions:['S001'], booked:22, available:6, admin:2 },
  { id:'T002', name:'Dr. C. Osei', specialization:'ICT / Cybersecurity', utilisation:55, sessions:['S002'], booked:15, available:11, admin:4 },
  { id:'T003', name:'Prof. I. Bello', specialization:'Management', utilisation:90, sessions:['S003'], booked:24, available:3, admin:3 },
  { id:'T004', name:'Dr. F. Aliyu', specialization:'Training & Development', utilisation:68, sessions:['S004'], booked:18, available:8, admin:4 },
  { id:'T005', name:'Mr. T. Dabo', specialization:'SAP / ERP', utilisation:40, sessions:[], booked:11, available:16, admin:3 },
]

export const KNOWLEDGE_BASE = [
  { id:'K001', question:'What pre-test score is needed to skip Module 2 of HV Safety?', askedBy:'Musa Abdullahi', answeredBy:'Engr. A. Yusuf', answer:'A minimum score of 75% on the adaptive pre-assessment will allow learners to skip Module 2 and proceed directly to Module 3.', isKBArticle:true, endorsements:7, datAsked:'01 Apr 2026' },
  { id:'K002', question:'How do I request an exemption from mandatory cybersecurity training?', askedBy:'Amina Sule', answeredBy:null, answer:null, isKBArticle:false, endorsements:0, datAsked:'05 Apr 2026' },
  { id:'K003', question:'Can classroom sessions be converted to online format for field staff?', askedBy:'Hassan Tanko', answeredBy:'Dr. F. Aliyu', answer:'Yes. Field staff can access equivalent online modules through the LMS. The Training Unit must formally approve the format change and update the nomination letter.', isKBArticle:false, endorsements:3, datAsked:'03 Apr 2026' },
  { id:'K004', question:'What is the CPD credit for completing Leadership Excellence?', askedBy:'Ibrahim Yusuf', answeredBy:'Umar Dabo', answer:'Leadership & Management Excellence carries 20 CPD points recognised by the Institute of Directors Nigeria (IoD-N).', isKBArticle:true, endorsements:12, datAsked:'28 Mar 2026' },
]

export const LEARNING_PATHS = [
  { id:'LP001', title:'Technical Induction — Protection Engineer', role:'Protection Engineer', dept:'Technical',
    courses:['C001','C004'], totalHours:'12 days', enrolled:4, completionRate:45 },
  { id:'LP002', title:'ICT Security Track', role:'ICT Officer', dept:'ICT',
    courses:['C002'], totalHours:'3 days', enrolled:2, completionRate:60 },
  { id:'LP003', title:'New Manager Essentials', role:'Unit Head', dept:'Management',
    courses:['C003'], totalHours:'4 days', enrolled:3, completionRate:75 },
  { id:'LP004', title:'Finance Compliance Bundle', role:'Finance Manager', dept:'Finance',
    courses:['C005'], totalHours:'2 days', enrolled:5, completionRate:100 },
]

export const MANDATORY_ASSIGNMENTS = [
  { id:'MA001', courseTitle:'Cybersecurity Awareness for Staff', trigger:'Annual — All Staff', deptScope:'All', assignedCount:387, completedCount:174, deadline:'30 Jun 2026', status:'active' },
  { id:'MA002', courseTitle:'Safety Induction & Fire Drill', trigger:'Onboarding', deptScope:'Technical, Operations', assignedCount:92, completedCount:88, deadline:'Continuous', status:'active' },
  { id:'MA003', courseTitle:'Data Privacy & NDPR Compliance', trigger:'Annual — All Staff', deptScope:'All', assignedCount:387, completedCount:310, deadline:'31 May 2026', status:'active' },
  { id:'MA004', courseTitle:'Anti-Bribery & Corruption (ABC)', trigger:'Biennial — All Staff', deptScope:'All', assignedCount:387, completedCount:387, deadline:'31 Dec 2025', status:'completed' },
]

export const DIGITAL_CERTIFICATES = [
  { id:'CERT001', employeeId:'P010', employee:'Adaeze Nwosu', course:'Instructional Design Certification', issuedDate:'15 Mar 2026', expiryDate:'15 Mar 2028', certNo:'NAPTIN-2026-3841', status:'valid' },
  { id:'CERT002', employeeId:'P011', employee:'Umar Dabo', course:'Instructional Design Certification', issuedDate:'15 Mar 2026', expiryDate:'15 Mar 2028', certNo:'NAPTIN-2026-3842', status:'valid' },
  { id:'CERT003', employeeId:'P005', employee:'Chidi Osei', course:'Cybersecurity Foundation', issuedDate:'10 Jun 2024', expiryDate:'10 Jun 2026', certNo:'NAPTIN-2024-1190', status:'expiring' },
  { id:'CERT004', employeeId:'P007', employee:'Ibrahim Yusuf', course:'Leadership & Management Excellence', issuedDate:'20 Jan 2025', expiryDate:'20 Jan 2028', certNo:'NAPTIN-2025-2210', status:'valid' },
]

export const TEAM_PROGRESS = [
  { managerId:'P007', manager:'Ibrahim Yusuf', dept:'Management', team:[
    { name:'Blessing Eze',  role:'Finance Manager', completed:3, total:4, pct:75, timeSpent:18 },
    { name:'Taiwo Ajayi',   role:'HR Manager',      completed:2, total:4, pct:50, timeSpent:12 },
    { name:'Adaeze Nwosu',  role:'Training Officer', completed:4, total:4, pct:100, timeSpent:24 },
  ]},
  { managerId:'P002', manager:'Ngozi Okonkwo', dept:'Technical', team:[
    { name:'Musa Abdullahi', role:'Protection Engineer', completed:1, total:3, pct:33, timeSpent:8 },
    { name:'Hassan Tanko',   role:'Field Technician',    completed:2, total:3, pct:67, timeSpent:14 },
    { name:'Amina Sule',     role:'Protection Engineer', completed:0, total:3, pct:0,  timeSpent:0 },
  ]},
]

export const MODULE_TIME_TRACKING = [
  { courseId:'C001', courseTitle:'Power System Protection & Control', modules:[
    { name:'Module 1 — Grid Fundamentals',     avgMinutes:42, expectedMinutes:40, flag:'ok' },
    { name:'Module 2 — Relay Types & Settings', avgMinutes:88, expectedMinutes:50, flag:'hard' },
    { name:'Module 3 — Coordination Methods',  avgMinutes:31, expectedMinutes:40, flag:'easy' },
  ]},
  { courseId:'C002', courseTitle:'Cybersecurity Advanced', modules:[
    { name:'Module 1 — Threat Landscape', avgMinutes:37, expectedMinutes:40, flag:'ok' },
    { name:'Module 2 — Forensics',        avgMinutes:95, expectedMinutes:50, flag:'hard' },
  ]},
]

export const SKILLS_INVENTORY = [
  { employeeId:'P001', name:'Musa Abdullahi', dept:'Technical', role:'Protection Engineer',
    skills:[
      { skill:'Power Systems Fundamentals', level:3, source:'Course C001', date:'07 Apr 2026', linked:true },
      { skill:'HV Safety', level:2, source:'Certification', date:'15 Jan 2024', linked:true },
    ], promotionEligible:false, bonusLinked:false },
  { employeeId:'P010', name:'Adaeze Nwosu', dept:'Training', role:'Training Officer',
    skills:[
      { skill:'Instructional Design', level:4, source:'Course C005', date:'15 Mar 2026', linked:true },
      { skill:'LMS Administration', level:3, source:'On-the-job', date:'01 Jan 2026', linked:false },
    ], promotionEligible:true, bonusLinked:true },
  { employeeId:'P007', name:'Ibrahim Yusuf', dept:'Management', role:'Unit Head',
    skills:[
      { skill:'Leadership & People Management', level:4, source:'Course C003', date:'05 May 2026', linked:true },
      { skill:'Project Management (PMP)', level:4, source:'Certification', date:'15 Jun 2024', linked:true },
    ], promotionEligible:true, bonusLinked:true },
  { employeeId:'P008', name:'Blessing Eze', dept:'Finance', role:'Finance Manager',
    skills:[
      { skill:'Financial Controls', level:3, source:'Course', date:'10 Sep 2025', linked:true },
      { skill:'IPSAS Reporting', level:2, source:'On-the-job', date:'01 Mar 2025', linked:false },
    ], promotionEligible:false, bonusLinked:false },
]

// ── DG Portal ──────────────────────────────────────────────────────
export const DG_DIRECTORATES = [
  {
    id:'DIR001', name:'Human Resource Management', head:'Alhaji M. Abdulkadir', type:'Directorate',
    headcount:148, openPositions:4, pendingLeave:12, complianceRate:94,
    kpis:[
      { label:'Headcount', value:'148', trend:'up' },
      { label:'Attendance Today', value:'96.1%', trend:'up' },
      { label:'Open Vacancies', value:'4', trend:'neutral' },
      { label:'Compliance', value:'94%', trend:'up' },
    ],
    units:[
      { name:'Recruitment & Selection', headCount:18, status:'active' },
      { name:'Payroll & Benefits', headCount:22, status:'active' },
      { name:'Employee Relations', headCount:15, status:'active' },
      { name:'Admin & General Services', headCount:93, status:'active' },
    ],
    latestReport:{ title:'Q1 2026 HR Status Report', date:'01 Apr 2026', status:'submitted', summary:'Headcount stands at 148; 96% attendance rate; 4 vacancies under active recruitment. Payroll processed on schedule. No outstanding grievances.' },
  },
  {
    id:'DIR002', name:'Finance & Accounts', head:'Mrs. A. Okonkwo', type:'Directorate',
    headcount:98, openPositions:1, pendingLeave:5, complianceRate:98,
    kpis:[
      { label:'Budget Utilised', value:'68%', trend:'up' },
      { label:'Outstanding Payments', value:'₦4.2M', trend:'down' },
      { label:'Revenue (Q1)', value:'₦1.84B', trend:'up' },
      { label:'Compliance', value:'98%', trend:'up' },
    ],
    units:[
      { name:'Budget & Planning', headCount:24, status:'active' },
      { name:'Treasury & Cash Mgt', headCount:20, status:'active' },
      { name:'Financial Reporting', headCount:30, status:'active' },
      { name:'Internal Accounts', headCount:24, status:'active' },
    ],
    latestReport:{ title:'Q1 2026 Financial Summary', date:'02 Apr 2026', status:'pending_dg', summary:'Total expenditure ₦2.1B against ₦3.1B budget (68%). Revenue collections ₦1.84B. Three vendor payments pending DG approval. Audit observations: nil.' },
  },
  {
    id:'DIR003', name:'Planning, Research & Statistics', head:'Dr. K. Nnaji', type:'Directorate',
    headcount:126, openPositions:2, pendingLeave:7, complianceRate:91,
    kpis:[
      { label:'Strategic Objectives', value:'12 / 15', trend:'up' },
      { label:'Data Requests (Open)', value:'3', trend:'neutral' },
      { label:'Publications (YTD)', value:'8', trend:'up' },
      { label:'M&E Score', value:'87%', trend:'up' },
    ],
    units:[
      { name:'Strategic Planning', headCount:32, status:'active' },
      { name:'Research & Publications', headCount:40, status:'active' },
      { name:'Statistics & Data Mgt', headCount:30, status:'active' },
      { name:'M&E', headCount:24, status:'active' },
    ],
    latestReport:{ title:'Q1 2026 PRS Narrative Report', date:'03 Apr 2026', status:'submitted', summary:'12 of 15 strategic objectives on track. Annual Statistical Bulletin delivered. Three ongoing research projects; two awaiting approval for publication. M&E field visits completed for 4 RTCs.' },
  },
  {
    id:'DIR004', name:'Training', head:'Engr. U. Dabo', type:'Directorate',
    headcount:184, openPositions:3, pendingLeave:9, complianceRate:96,
    kpis:[
      { label:'Trainees (YTD)', value:'4,812', trend:'up' },
      { label:'Active Courses', value:'24', trend:'up' },
      { label:'Cert. Issued (YTD)', value:'1,340', trend:'up' },
      { label:'L1 Satisfaction', value:'4.3/5', trend:'up' },
    ],
    units:[
      { name:'TNA & Curriculum Design', headCount:40, status:'active' },
      { name:'Course Delivery', headCount:80, status:'active' },
      { name:'Evaluation & Quality', headCount:34, status:'active' },
      { name:'ANCEE / RTC Operations', headCount:30, status:'active' },
    ],
    latestReport:{ title:'Q1 2026 Training Activity Report', date:'31 Mar 2026', status:'submitted', summary:'4,812 trainees across 6 RTCs; 24 active courses; 1,340 certifications issued. Average L1 satisfaction 4.3/5. New TNA cycle initiated for Q2.' },
  },
  {
    id:'DIR005', name:'Corporate & Consultancy Services', head:'Mr. B. Adeyemi', type:'Directorate',
    headcount:72, openPositions:0, pendingLeave:3, complianceRate:100,
    kpis:[
      { label:'Board Packs Prepared', value:'2', trend:'neutral' },
      { label:'Active Contracts', value:'14', trend:'up' },
      { label:'PR Coverage (Q1)', value:'22 items', trend:'up' },
      { label:'Compliance', value:'100%', trend:'up' },
    ],
    units:[
      { name:'Board Secretariat', headCount:18, status:'active' },
      { name:'Public Relations', headCount:24, status:'active' },
      { name:'Consultancy & Partnerships', headCount:30, status:'active' },
    ],
    latestReport:{ title:'Corporate Services Q1 Report', date:'04 Apr 2026', status:'pending_dg', summary:'Two board meetings held; all resolutions actioned. 14 active consultancy contracts worth ₦890M. Press coverage: 22 media placements. Pending DG signature on two MoUs.' },
  },
  {
    id:'DIR006', name:'Marketing & Business Development', head:'Ms. N. Eze', type:'Directorate',
    headcount:38, openPositions:1, pendingLeave:2, complianceRate:89,
    kpis:[
      { label:'Pipeline Value', value:'₦480M', trend:'up' },
      { label:'Proposals Submitted', value:'7', trend:'up' },
      { label:'Conversion Rate', value:'43%', trend:'up' },
      { label:'Brand Campaigns', value:'3 active', trend:'neutral' },
    ],
    units:[
      { name:'Business Development', headCount:18, status:'active' },
      { name:'Brand & Communications', headCount:20, status:'active' },
    ],
    latestReport:{ title:'Marketing Q1 Business Report', date:'03 Apr 2026', status:'submitted', summary:'7 proposals submitted; 3 converted (₦210M). Pipeline stands at ₦480M. Three brand campaigns active. New client onboarding for KEDC underway.' },
  },
  {
    id:'UNIT001', name:'Legal / Board Secretariat', head:'Mrs. F. Adamu', type:'Unit',
    headcount:38, openPositions:0, pendingLeave:1, complianceRate:100,
    kpis:[
      { label:'Active Matters', value:'6', trend:'neutral' },
      { label:'Board Resolutions', value:'14 / 14', trend:'up' },
      { label:'Contracts Reviewed', value:'22', trend:'up' },
      { label:'Compliance', value:'100%', trend:'up' },
    ],
    units:[{ name:'Litigation', headCount:12, status:'active' }, { name:'Contracts & Advisory', headCount:16, status:'active' }, { name:'Board Affairs', headCount:10, status:'active' }],
    latestReport:{ title:'Legal Unit Q1 Briefing', date:'05 Apr 2026', status:'pending_dg', summary:'6 active litigation matters; 3 at hearing stage. 22 contracts reviewed and cleared. Two MoUs pending DG signature. Board affairs: all Q1 resolutions fully recorded.' },
  },
  {
    id:'UNIT002', name:'Internal Audit', head:'Alhaji A. Sule', type:'Unit',
    headcount:24, openPositions:0, pendingLeave:0, complianceRate:100,
    kpis:[
      { label:'Audits Completed', value:'8', trend:'up' },
      { label:'Findings Open', value:'4', trend:'down' },
      { label:'High-Risk Items', value:'1', trend:'neutral' },
      { label:'Compliance', value:'100%', trend:'up' },
    ],
    units:[{ name:'Financial Audit', headCount:12, status:'active' }, { name:'Compliance & Systems', headCount:12, status:'active' }],
    latestReport:{ title:'Internal Audit Q1 Report', date:'06 Apr 2026', status:'submitted', summary:'8 audits completed; 4 findings open (none critical). 1 high-risk item under management action: payroll reconciliation gap. Recommend DG attention.' },
  },
  {
    id:'UNIT003', name:'Procurement', head:'Mrs. M. Ibrahim', type:'Unit',
    headcount:82, openPositions:2, pendingLeave:4, complianceRate:88,
    kpis:[
      { label:'Open Tenders', value:'5', trend:'up' },
      { label:'Contracts Awarded', value:'12', trend:'up' },
      { label:'Savings (Q1)', value:'₦18M', trend:'up' },
      { label:'Compliance', value:'88%', trend:'neutral' },
    ],
    units:[{ name:'Tendering & Evaluation', headCount:30, status:'active' }, { name:'Contract Mgt', headCount:30, status:'active' }, { name:'Stores & Inventory', headCount:22, status:'active' }],
    latestReport:{ title:'Procurement Q1 Activity Report', date:'04 Apr 2026', status:'pending_dg', summary:'5 tenders open; 12 contracts awarded (₦340M). Savings of ₦18M achieved through competitive tendering. Two contracts require DG approval to proceed.' },
  },
  {
    id:'UNIT004', name:'ICT', head:'Mr. E. Bello', type:'Unit',
    headcount:46, openPositions:1, pendingLeave:2, complianceRate:95,
    kpis:[
      { label:'Uptime (30 days)', value:'99.4%', trend:'up' },
      { label:'Open Tickets', value:'14', trend:'neutral' },
      { label:'Security Incidents', value:'0', trend:'up' },
      { label:'DR Test', value:'Passed', trend:'up' },
    ],
    units:[{ name:'Infrastructure', headCount:20, status:'active' }, { name:'Applications', headCount:16, status:'active' }, { name:'Cybersecurity', headCount:10, status:'active' }],
    latestReport:{ title:'ICT Q1 Systems Report', date:'05 Apr 2026', status:'submitted', summary:'System uptime 99.4%. 14 open helpdesk tickets (SLA: 72h). Zero security incidents. Disaster recovery test passed. New ERP module deployment scheduled Q2.' },
  },
]

export const DG_PENDING_APPROVALS = [
  { id:'APR001', ref:'FIN-APR-2026-042', title:'Q1 Vendor Payments — Finance', dept:'Finance & Accounts', type:'Payment', amount:'₦4,200,000', submittedBy:'Mrs. A. Okonkwo', date:'02 Apr 2026', summary:'Three vendor payments for ICT equipment, office furniture, and training materials. All supported by LPOs and delivery notes.', status:'pending', priority:'High', attachments:['Q1_Vendor_LPOs.pdf','Delivery_Notes.pdf'] },
  { id:'APR002', ref:'COR-APR-2026-018', title:'MoU — KEDC Partnership Agreement', dept:'Corporate & Consultancy', type:'Agreement', amount:null, submittedBy:'Mr. B. Adeyemi', date:'03 Apr 2026', summary:'Memorandum of Understanding with Kano Electricity Distribution Company (KEDC) for a 2-year training partnership covering HV safety and protection engineering.', status:'pending', priority:'High', attachments:['KEDC_MoU_Draft_v3.pdf','Legal_Clearance.pdf'] },
  { id:'APR003', ref:'PRO-APR-2026-031', title:'Generator Maintenance Contract', dept:'Procurement', type:'Contract', amount:'₦12,800,000', submittedBy:'Mrs. M. Ibrahim', date:'04 Apr 2026', summary:'Annual preventive maintenance contract for 14 generators across 4 RTCs. Vendor: Greentech Power Solutions Ltd. Evaluations completed; procurement committee recommends award.', status:'pending', priority:'Medium', attachments:['Tender_Evaluation.pdf','Contract_Draft.pdf'] },
  { id:'APR004', ref:'LEG-APR-2026-009', title:'MoU — PTDF Research Grant', dept:'Legal / Board Secretariat', type:'Agreement', amount:'₦250,000,000', submittedBy:'Mrs. F. Adamu', date:'05 Apr 2026', summary:'Framework agreement with PTDF for a ₦250M research grant for curriculum development and RTC modernisation. Legal cleared; ready for DG signature.', status:'pending', priority:'Critical', attachments:['PTDF_MoU_Final.pdf','Legal_Review.pdf','Board_Resolution.pdf'] },
  { id:'APR005', ref:'HR-APR-2026-055', title:'Q2 Recruitment Plan — 12 Positions', dept:'Human Resource Management', type:'Policy', amount:null, submittedBy:'Alhaji M. Abdulkadir', date:'06 Apr 2026', summary:'Approval for external recruitment of 12 positions: 4 Technical Officers, 3 ICT Officers, 2 Finance Officers, 2 Training Officers, 1 Legal Officer. Budgeted under 2026 ARF.', status:'pending', priority:'Medium', attachments:['Recruitment_Plan_Q2.pdf','Job_Specs.pdf'] },
  { id:'APR006', ref:'TRN-APR-2026-077', title:'Q2 Training Calendar & Budget', dept:'Training', type:'Budget', amount:'₦38,500,000', submittedBy:'Engr. U. Dabo', date:'06 Apr 2026', summary:'Q2 training schedule covering 18 courses across 6 RTCs; 1,200 projected trainees. Budget of ₦38.5M covering facilitator fees, venue costs, and materials.', status:'pending', priority:'Medium', attachments:['Q2_Training_Calendar.pdf','Budget_Breakdown.xlsx'] },
]

export const DG_ISSUES = [
  { id:'ISS001', title:'Payroll Reconciliation Gap — Internal Audit Finding', dept:'Internal Audit', priority:'High', raisedBy:'Alhaji A. Sule', date:'06 Apr 2026', status:'open', description:'A ₦1.2M discrepancy was identified between payroll register and bank statements for March 2026. Finance has been notified. Root cause analysis in progress.', comments:[
    { author:'Director, Finance', text:'Our team has started the reconciliation. We expect to close this in 2 business days.', date:'07 Apr 2026 08:14' },
    { author:'Director, HR', text:'Confirmed: one officer processed a duplicate payment in error. Reversal initiated.', date:'07 Apr 2026 09:30' },
  ]},
  { id:'ISS002', title:'RTC Kano — Generator Failure (Unresolved 5 days)', dept:'Admin & Services / ICT', priority:'High', raisedBy:'Engr. U. Dabo', date:'02 Apr 2026', status:'escalated', description:'Main generator at Kano RTC has been non-functional for 5 days. Training sessions disrupted. Emergency repair request submitted — procurement not yet processed.', comments:[
    { author:'Director, Training', text:'Sessions have been moved to afternoons only. We need this resolved before the April 14 cohort begins.', date:'03 Apr 2026 10:00' },
    { author:'Procurement Unit', text:'Vendor contacted; awaiting DG approval on emergency procurement to fast-track.', date:'05 Apr 2026 14:22' },
  ]},
  { id:'ISS003', title:'Vendor Invoices Overdue >60 Days — 3 Suppliers', dept:'Finance & Accounts', priority:'Medium', raisedBy:'Mrs. A. Okonkwo', date:'04 Apr 2026', status:'open', description:'Three suppliers have unpaid invoices totalling ₦7.4M beyond 60-day payment terms. Risk of service suspension on two contracts.', comments:[
    { author:'Director, Finance', text:'Funds available; waiting on payment approval that was submitted 2 weeks ago.', date:'05 Apr 2026 11:00' },
  ]},
  { id:'ISS004', title:'Data Privacy Compliance Gap — NDPR Audit', dept:'ICT / Legal', priority:'Medium', raisedBy:'Mr. E. Bello', date:'01 Apr 2026', status:'in_review', description:'NDPR external audit identified two gaps: (1) staff personal data stored without formal consent forms, (2) data retention policy not yet gazetted. Remediation plan ready.', comments:[
    { author:'Legal Unit', text:'Consent form template is ready and will be circulated with DG approval.', date:'02 Apr 2026 15:10' },
    { author:'Director, ICT', text:'Data audit tool deployed; encryption verified on all 3 servers. Awaiting policy approval.', date:'06 Apr 2026 09:00' },
  ]},
]

export const DG_MEETING_REQUESTS = [
  { id:'MTG001', title:'Q1 Consolidated Review — All Directors', scheduled:'Mon 13 Apr 2026, 09:00', venue:'Executive Boardroom', organiser:'Office of the DG', invitees:['All Directors'], status:'confirmed', agenda:['Q1 performance review per directorate','Budget utilisation update','Pending approvals','Strategic objectives re-alignment'] },
  { id:'MTG002', title:'Audit Finding Resolution Meeting', scheduled:'Wed 08 Apr 2026, 14:00', venue:'DG Conference Room', organiser:'Internal Audit', invitees:['Director Finance','Director HR','Head Internal Audit'], status:'pending_dg', agenda:['Payroll reconciliation gap RCA','Remediation timelines','Sign-off on audit management letter'] },
  { id:'MTG003', title:'PTDF MoU Signing Ceremony', scheduled:'Fri 10 Apr 2026, 10:00', venue:'Executive Boardroom', organiser:'Corporate Services', invitees:['DG','PTDF DG Representative','Director Corporate','Legal'], status:'confirmed', agenda:['Ceremonial MoU signing','Photo opportunity','Joint press statement'] },
]

export const DG_ESIGNATURE_QUEUE = [
  { id:'SIG001', docRef:'LEG-APR-2026-009', title:'PTDF Research Grant MoU', preparedBy:'Mrs. F. Adamu — Legal', date:'05 Apr 2026', pages:8, status:'awaiting_signature', urgency:'Critical' },
  { id:'SIG002', docRef:'COR-APR-2026-018', title:'KEDC Partnership MoU', preparedBy:'Mr. B. Adeyemi — Corporate', date:'03 Apr 2026', pages:12, status:'awaiting_signature', urgency:'High' },
  { id:'SIG003', docRef:'ICT-POL-2026-003', title:'Data Retention & Privacy Policy', preparedBy:'Mr. E. Bello — ICT / Legal', date:'06 Apr 2026', pages:4, status:'awaiting_signature', urgency:'Medium' },
  { id:'SIG004', docRef:'HR-POL-2026-011', title:'Revised Leave Policy 2026', preparedBy:'Alhaji M. Abdulkadir — HR', date:'01 Apr 2026', pages:6, status:'signed', urgency:'Low' },
]

// ═══════════════════════════════════════════════════════════════════
// LEGAL & BOARD SECRETARIAT WORKBENCH
// ═══════════════════════════════════════════════════════════════════

export const BOARD_MEETINGS_DATA = [
  {
    id: 'BM-2026-04',
    title: 'Q2 2026 Ordinary Board Meeting',
    date: '30 Apr 2026', time: '10:00',
    location: 'Boardroom A — NAPTIN HQ',
    type: 'Ordinary', status: 'scheduled',
    quorum: 7,
    attendees: ['Board Chairman', 'DG', 'DDG Technical', 'DDG Admin', 'Board Member I', 'Board Member II', 'Board Secretary'],
    agendaItems: [
      { no:1, title:'Approval of Q1 2026 Minutes', owner:'Board Secretary', docUploaded:true,  status:'pending' },
      { no:2, title:'Q1 Financial Performance Report', owner:'DDG Finance',    docUploaded:false, status:'awaiting-docs' },
      { no:3, title:'ICT Infrastructure Investment — ₦120M', owner:'DDG Technical', docUploaded:true, status:'pending' },
      { no:4, title:'RTC Expansion Feasibility Approval', owner:'DG',          docUploaded:false, status:'awaiting-docs' },
      { no:5, title:'Any Other Business', owner:'Chairman',    docUploaded:false, status:'pending' },
    ],
    packDeadline: '23 Apr 2026', packStatus: 'incomplete',
    minutesStatus: 'not-started',
  },
  {
    id: 'BM-2026-03',
    title: 'Extraordinary Board Meeting — March 2026',
    date: '15 Mar 2026', time: '14:00',
    location: 'Virtual — MS Teams',
    type: 'Extraordinary', status: 'completed',
    quorum: 5,
    attendees: ['Board Chairman', 'DG', 'DDG Admin', 'Board Member I', 'Board Member II', 'Board Secretary'],
    agendaItems: [
      { no:1, title:'Approval of Acting DDG (Admin) appointment', owner:'DG', docUploaded:true, status:'resolved' },
      { no:2, title:'Emergency procurement — generator replacement', owner:'DDG Admin', docUploaded:true, status:'resolved' },
    ],
    packDeadline: '12 Mar 2026', packStatus: 'complete',
    minutesStatus: 'approved',
  },
  {
    id: 'BM-2026-02',
    title: 'Q1 2026 Ordinary Board Meeting',
    date: '31 Mar 2026', time: '10:00',
    location: 'Boardroom A — NAPTIN HQ',
    type: 'Ordinary', status: 'completed',
    quorum: 7,
    attendees: ['Board Chairman', 'DG', 'DDG Technical', 'DDG Admin', 'Board Member I', 'Board Member II', 'Board Member III', 'Board Secretary'],
    agendaItems: [
      { no:1, title:'Approval of Q4 2025 Minutes', owner:'Board Secretary', docUploaded:true, status:'resolved' },
      { no:2, title:'Q2 2026 Work Plan Approval', owner:'Planning Unit',    docUploaded:true, status:'resolved' },
      { no:3, title:'ICT Infrastructure — ₦120M Investment Vote', owner:'DDG Technical', docUploaded:true, status:'resolved' },
      { no:4, title:'Annual Performance Report 2025 — Adoption', owner:'DG', docUploaded:true, status:'resolved' },
    ],
    packDeadline: '24 Mar 2026', packStatus: 'complete',
    minutesStatus: 'pending-approval',
  },
]

export const BOARD_RESOLUTIONS_TRACKER = [
  {
    id: 'RES-2026-001', ref: 'BR-2026-01',
    title: 'Adoption of Annual Performance Report 2025',
    meetingId: 'BM-2026-02', meetingTitle: 'Q1 2026 Board Meeting',
    assignee: 'DG / Planning Unit', deadline: '30 Apr 2026',
    status: 'in-progress', progress: 70,
    notes: 'Report finalised; pending circulation to all HODs.',
    actions: [
      { date:'01 Apr 2026', note:'Report sent to all directorates for review.', by:'DG Office' },
      { date:'04 Apr 2026', note:'Comments received from 6 of 8 directorates.', by:'Planning Unit' },
    ],
  },
  {
    id: 'RES-2026-002', ref: 'BR-2026-02',
    title: 'Approval of ICT Infrastructure Investment — ₦120M',
    meetingId: 'BM-2026-02', meetingTitle: 'Q1 2026 Board Meeting',
    assignee: 'DDG Technical / Procurement', deadline: '31 May 2026',
    status: 'in-progress', progress: 40,
    notes: 'Procurement process initiated. Tender published (TDR-2026-006).',
    actions: [
      { date:'03 Apr 2026', note:'ICT submitted tender specifications to Procurement.', by:'ICT Dept' },
      { date:'06 Apr 2026', note:'Tender published — 14-Apr deadline.', by:'Procurement' },
    ],
  },
  {
    id: 'RES-2026-003', ref: 'BR-2026-EXT-01',
    title: 'Appointment of Acting DDG (Admin)',
    meetingId: 'BM-2026-03', meetingTitle: 'Extraordinary Board Meeting — March 2026',
    assignee: 'DG', deadline: '20 Mar 2026',
    status: 'completed', progress: 100,
    notes: 'Instrument of appointment issued 18 Mar 2026.',
    actions: [
      { date:'16 Mar 2026', note:'HR prepared appointment instrument.', by:'HR' },
      { date:'18 Mar 2026', note:'DG signed and served appointment letter.', by:'DG Office' },
    ],
  },
  {
    id: 'RES-2026-004', ref: 'BR-2026-EXT-02',
    title: 'Emergency procurement — generator replacement (Kano RTC)',
    meetingId: 'BM-2026-03', meetingTitle: 'Extraordinary Board Meeting — March 2026',
    assignee: 'DDG Admin / Procurement', deadline: '15 Apr 2026',
    status: 'overdue', progress: 65,
    notes: 'Delayed by vendor supply chain issues. New ETA: 22 Apr 2026.',
    actions: [
      { date:'20 Mar 2026', note:'Procurement initiated PO-2026-143.', by:'Procurement' },
      { date:'01 Apr 2026', note:'Vendor reported 2-week delivery delay.', by:'PowerTech Nigeria' },
    ],
  },
]

export const LEGAL_ENTITIES = [
  {
    id: 'ENT-001', name: 'NAPTIN', type: 'Federal Agency',
    jurisdiction: 'Nigeria (Federal)', regNumber: 'FGN/NAPTIN/2005/001',
    taxId: 'TIN-00042771', incorporated: '2005-03-01',
    regAgent: 'DG Office / Legal', status: 'active',
    directors: [
      { name: 'DG (Board Chairman)',  role: 'Executive Director',     appointed:'Jan 2024', expires:'Jan 2028', signingLimit:'Unlimited', daysToExpiry: 636 },
      { name: 'DDG Technical',        role: 'Non-Executive Director',  appointed:'Mar 2022', expires:'Mar 2026', signingLimit:'₦50M',       daysToExpiry: -7  },
      { name: 'DDG Admin',            role: 'Non-Executive Director',  appointed:'Jan 2024', expires:'Jan 2028', signingLimit:'₦50M',       daysToExpiry: 636 },
      { name: 'Board Member I',       role: 'Independent Director',    appointed:'Jan 2024', expires:'Jan 2028', signingLimit:'N/A',        daysToExpiry: 636 },
    ],
    complianceItems: [
      { obligation:'Annual Statutory Return', due:'30 Jun 2026', status:'upcoming' },
      { obligation:'CAC Annual Filing',        due:'30 Sep 2026', status:'upcoming' },
      { obligation:'Beneficial Ownership Register Update', due:'30 Sep 2026', status:'upcoming' },
    ],
  },
  {
    id: 'ENT-002', name: 'NAPTIN Renewable Energy Institute Ltd', type: 'Subsidiary',
    jurisdiction: 'Nigeria (FCT)', regNumber: 'RC-1982740',
    taxId: 'TIN-00198274', incorporated: '2022-12-01',
    regAgent: 'Alabi & Associates (External Counsel)', status: 'active',
    directors: [
      { name: 'DG (NAPTIN)',   role: 'Chairman',         appointed:'Dec 2022', expires:'Dec 2026', signingLimit:'₦100M', daysToExpiry: 269 },
      { name: 'MD — NREI',    role: 'Managing Director', appointed:'Jan 2023', expires:'Jan 2027', signingLimit:'₦30M',  daysToExpiry: 635 },
      { name: 'Director (Finance)', role: 'Non-Executive', appointed:'Dec 2022', expires:'Dec 2026', signingLimit:'N/A', daysToExpiry: 269 },
    ],
    complianceItems: [
      { obligation:'Annual Return (CAC)',   due:'28 Feb 2027', status:'upcoming' },
      { obligation:'FIRS Tax Filing',       due:'30 Jun 2026', status:'upcoming' },
      { obligation:'Audited Accounts',      due:'31 Aug 2026', status:'upcoming' },
    ],
  },
  {
    id: 'ENT-003', name: 'NAPTIN Training Foundation', type: 'Foundation',
    jurisdiction: 'Nigeria (Federal)', regNumber: 'IT-89042',
    taxId: 'TIN-00089042', incorporated: '2019-06-01',
    regAgent: 'DG Office / Legal', status: 'active',
    directors: [
      { name: 'Board Trustee I',  role: 'Trustee', appointed:'Jun 2019', expires:'Jun 2027', signingLimit:'₦10M', daysToExpiry: 797 },
      { name: 'Board Trustee II', role: 'Trustee', appointed:'Jun 2019', expires:'Jun 2027', signingLimit:'₦10M', daysToExpiry: 797 },
    ],
    complianceItems: [
      { obligation:'Non-profit Annual Report', due:'31 Mar 2027', status:'upcoming' },
      { obligation:'Audited Financial Statements', due:'30 Jun 2026', status:'upcoming' },
    ],
  },
]

export const COMPLIANCE_OBLIGATIONS = [
  { id:'CO-001', obligation:'NERC Training Accreditation Renewal', regulation:'NERC Act 2005', dept:'Legal', frequency:'Annual', deadline:'30 Jun 2026', evidenceStatus:'pending', score:null, status:'open', assignee:'Legal Officer' },
  { id:'CO-002', obligation:'Quarterly Anti-Corruption Report (ICPC)', regulation:'ICPC Act', dept:'Compliance', frequency:'Quarterly', deadline:'15 Apr 2026', evidenceStatus:'submitted', score:'Compliant', status:'compliant', assignee:'Compliance Officer' },
  { id:'CO-003', obligation:'Staff Training Records — NERC Competency Standard', regulation:'NERC Technical Standards', dept:'HR', frequency:'Quarterly', deadline:'30 Apr 2026', evidenceStatus:'pending', score:null, status:'open', assignee:'HR Dept' },
  { id:'CO-004', obligation:'NDPR Privacy Impact Assessment', regulation:'NDPR 2019', dept:'ICT / Legal', frequency:'Annual', deadline:'31 May 2026', evidenceStatus:'partial', score:'Partially Compliant', status:'partial', assignee:'ICT + Legal' },
  { id:'CO-005', obligation:'Annual Safety Certification — Training Labs', regulation:'OSHA / NES Standards', dept:'Admin & Services', frequency:'Annual', deadline:'28 Feb 2026', evidenceStatus:'overdue', score:'Non-Compliant', status:'non-compliant', assignee:'Admin' },
  { id:'CO-006', obligation:'Pension Remittance Compliance (PenCom)', regulation:'Pension Reform Act', dept:'Finance / HR', frequency:'Monthly', deadline:'07 Apr 2026', evidenceStatus:'submitted', score:'Compliant', status:'compliant', assignee:'Finance' },
  { id:'CO-007', obligation:'Beneficial Ownership Register Update (CAC)', regulation:'Companies Act 2020', dept:'Legal', frequency:'Annual', deadline:'30 Sep 2026', evidenceStatus:null, score:null, status:'upcoming', assignee:'Legal Officer' },
  { id:'CO-008', obligation:'VAT Filing (FIRS)', regulation:'FIRS Act', dept:'Finance', frequency:'Monthly', deadline:'21 Apr 2026', evidenceStatus:'submitted', score:'Compliant', status:'compliant', assignee:'Finance' },
]

export const COMPLIANCE_LICENSES = [
  { id:'LIC-001', name:'NERC Training Accreditation', authority:'NERC', number:'NERC/ACC/2021/0042', issued:'01 Jan 2021', expires:'31 Dec 2026', daysLeft:269, status:'active', owner:'Legal', renewalStatus:'In progress' },
  { id:'LIC-002', name:'Safety Certificate — Abuja Training Labs', authority:'NESREA', number:'NEL/TL/2024/18', issued:'01 Mar 2024', expires:'28 Feb 2026', daysLeft:-38, status:'expired', owner:'Admin & Services', renewalStatus:'Overdue — escalated to Legal Head' },
  { id:'LIC-003', name:'Tax Clearance Certificate 2026', authority:'FIRS', number:'FIRS/TC/2026/0912', issued:'15 Jan 2026', expires:'31 Dec 2026', daysLeft:269, status:'active', owner:'Finance', renewalStatus:null },
  { id:'LIC-004', name:'Business Permit — Annual (FCT)', authority:'FCT Investment Agency', number:'FCT/BP/2026/4231', issued:'01 Jan 2026', expires:'31 Dec 2026', daysLeft:269, status:'active', owner:'Legal', renewalStatus:null },
  { id:'LIC-005', name:'Fire Safety Certificate — HQ Campus', authority:'Abuja Fire Service', number:'AFS/2025/1132', issued:'01 Jun 2025', expires:'31 May 2026', daysLeft:54, status:'expiring-soon', owner:'Admin & Services', renewalStatus:'Alert sent — 60-day reminder' },
]

export const CONTRACTS_CLM = [
  {
    id:'CLM-2026-018', title:'ICT Infrastructure Maintenance & Support',
    type:'Service Agreement', counterparty:'DataSoft Systems Ltd', value:'₦24,000,000', valueNum:24000000,
    dept:'ICT', stage:'active', risk:'low', effective:'01 Jan 2026', expires:'31 Dec 2026', daysToExpiry:269,
    approvalChain:['Legal ✓','ICT Head ✓','Finance ✓'],
    obligations:['Monthly SLA report','Maintain PI insurance ₦50M minimum'],
    renewalAlert:false,
  },
  {
    id:'CLM-2026-015', title:'Facility Management — HQ & RTCs',
    type:'Service Agreement', counterparty:'TransNet Engineering', value:'₦85,000,000', valueNum:85000000,
    dept:'Admin', stage:'active', risk:'medium', effective:'01 Jan 2026', expires:'31 Dec 2026', daysToExpiry:269,
    approvalChain:['Legal ✓','Admin Head ✓','Finance ✓','DG ✓'],
    obligations:['Weekly facility inspection report','Public liability insurance','FIRS withholding compliance'],
    renewalAlert:false,
  },
  {
    id:'CLM-2025-042', title:'Power Transformers Supply & Installation',
    type:'Supply Contract', counterparty:'PowerTech Nigeria Ltd', value:'₦45,200,000', valueNum:45200000,
    dept:'Training', stage:'expiring', risk:'high', effective:'15 Apr 2025', expires:'14 Apr 2026', daysToExpiry:7,
    approvalChain:['Legal ✓','Training Head ✓','Finance ✓','DG ✓'],
    obligations:['Performance bond — 10%','Defect liability period: 12 months'],
    renewalAlert:true,
  },
  {
    id:'CLM-2026-DFT-001', title:'NERC Regulatory Consulting — 2026',
    type:'Consultancy Agreement', counterparty:'Eko Regulatory Advisors', value:'₦12,500,000', valueNum:12500000,
    dept:'Legal / DG Office', stage:'approval', risk:'low', effective:null, expires:null, daysToExpiry:null,
    approvalChain:['Legal ✓','DG Office (pending)','Finance (waiting)'],
    obligations:[],
    renewalAlert:false,
  },
  {
    id:'CLM-2026-DFT-002', title:'Cloud Infrastructure Migration — AWS Nigeria',
    type:'Technology Services', counterparty:'AWS / CloudBridge Nigeria', value:'₦55,000,000', valueNum:55000000,
    dept:'ICT', stage:'negotiation', risk:'high', effective:null, expires:null, daysToExpiry:null,
    approvalChain:['Legal','ICT Head','Finance','DG'],
    obligations:['Data residency — Nigeria','NDPR compliance clause required','Exit / portability provisions'],
    renewalAlert:false,
  },
  {
    id:'CLM-2025-039', title:'LMS Platform Annual Licence',
    type:'Licence Agreement', counterparty:'EduSoft Ltd', value:'₦8,500,000', valueNum:8500000,
    dept:'Training', stage:'expired', risk:'medium', effective:'01 Jul 2025', expires:'30 Jun 2026', daysToExpiry:84,
    approvalChain:['Legal ✓','Training Head ✓','Finance ✓'],
    obligations:['99.5% uptime SLA','Data export on termination'],
    renewalAlert:true,
  },
]

export const LITIGATION_MATTERS = [
  {
    id:'LIT-2026-003', title:'Adamu Construction v NAPTIN — Breach of Contract',
    type:'Contract Dispute', stage:'litigation', severity:'high',
    exposure:'₦32,000,000', court:'FCT High Court', caseNo:'CV/HCT/2026/0142',
    opponent:'Adamu Construction Ltd', opponentCounsel:'Olu Adeyemi & Co.',
    nextHearing:'28 Apr 2026', responseDeadline:'20 Apr 2026',
    assignee:'F. Adeyemi (In-house) + Alabi & Associates',
    costsToDate:4200000, status:'active',
    timeline:[
      { date:'10 Mar 2026', event:'Writ of summons received.',                                   by:'Legal' },
      { date:'15 Mar 2026', event:'Triage complete — High severity. Alabi & Associates instructed.', by:'Head of Legal' },
      { date:'01 Apr 2026', event:'Statement of defence filed with court registry.',              by:'Alabi & Associates' },
    ],
    precedentNote: null,
  },
  {
    id:'LIT-2026-002', title:'NAPTIN v SafeGuard Security — Service Default',
    type:'Contract Dispute', stage:'pre-litigation', severity:'medium',
    exposure:'₦5,200,000', court:null, caseNo:null,
    opponent:'SafeGuard Security Ltd', opponentCounsel:null,
    nextHearing:null, responseDeadline:'15 Apr 2026',
    assignee:'F. Adeyemi (In-house)',
    costsToDate:350000, status:'active',
    timeline:[
      { date:'20 Mar 2026', event:'Formal demand letter sent. Vendor has 21 days to respond.', by:'Legal' },
      { date:'01 Apr 2026', event:'No response received. Escalated to mediation.',              by:'Legal' },
    ],
    precedentNote: null,
  },
  {
    id:'LIT-2025-011', title:'Okafor v NAPTIN — Employment Grievance',
    type:'Employment Dispute', stage:'resolved', severity:'low',
    exposure:'₦2,800,000', court:'National Industrial Court', caseNo:'NIC/ABJ/2025/0781',
    opponent:'A. Okafor (Former Staff)', opponentCounsel:'Self-represented',
    nextHearing:null, responseDeadline:null,
    assignee:'F. Adeyemi (In-house)',
    costsToDate:980000, status:'resolved',
    outcome:'Settlement — ₦1,500,000 paid',
    timeline:[
      { date:'15 Nov 2025', event:'Claim filed at National Industrial Court.',        by:'Opponent' },
      { date:'10 Dec 2025', event:'Preliminary objection filed — locus standi.',      by:'Legal' },
      { date:'20 Feb 2026', event:'Settlement reached — ₦1.5M. Consent order recorded.', by:'Legal' },
    ],
    precedentNote:'Ensure all staff exit clearance forms are signed before gratuity release. Statute of limitations monitoring required on similar claims.',
  },
]

export const GOVERNANCE_KPIS_DATA = [
  { metric:'Board meetings held',        value:3,      target:4,   unit:'',       period:'Q1 2026', trend:'stable',    status:'on-track', drill:'3 of 4 planned meetings held; 1 deferred to Q2.' },
  { metric:'Avg. pack distribution',     value:'7d',   target:'10d', unit:'',     period:'Q1 2026', trend:'improving', status:'on-track', drill:'Improved from 9 days (Q4 2025). Target: 10 days.' },
  { metric:'Resolution implementation',  value:75,     target:90,  unit:'%',      period:'Q1 2026', trend:'declining', status:'at-risk', drill:'6 of 8 resolutions on track; 2 overdue.' },
  { metric:'Overall compliance score',   value:82,     target:95,  unit:'%',      period:'Q1 2026', trend:'improving', status:'at-risk', drill:'1 non-compliant (safety cert), 2 partial. Gap: Labs safety certification.' },
  { metric:'Contract cycle time (avg.)', value:'18d',  target:'14d', unit:'',     period:'Q1 2026', trend:'declining', status:'at-risk', drill:'Bottleneck at Finance sign-off stage (avg. 6 days).' },
  { metric:'Active litigation matters',  value:2,      target:0,   unit:'',       period:'Current', trend:'stable',    status:'watch',   drill:'2 active matters: 1 in court (High), 1 pre-litigation (Medium).' },
  { metric:'Licences compliant',         value:3,      target:5,   unit:' of 5',  period:'Current', trend:'declining', status:'at-risk', drill:'Safety cert expired; fire cert expiring in 54 days.' },
  { metric:'Data room access events',    value:142,    target:null, unit:'',      period:'Last 30d', trend:'stable',   status:'info',    drill:'No suspicious activity. Highest: BDO auditors (31 docs viewed).' },
]

export const DATA_ROOMS = [
  {
    id:'DR-2026-003', name:'External Audit 2025 — BDO Nigeria',
    purpose:'Annual audit data request (FY2025)',
    createdBy:'F. Adeyemi', created:'01 Apr 2026', expires:'30 Apr 2026', daysLeft:23,
    docs:42, status:'active', nda:true, watermark:true,
    accessors:[
      { name:'BDO Nigeria — Lead Auditor',  permissions:'View only', lastAccess:'07 Apr 2026', docsViewed:31 },
      { name:'BDO Nigeria — Audit Senior', permissions:'View only', lastAccess:'06 Apr 2026', docsViewed:18 },
    ],
  },
  {
    id:'DR-2026-002', name:'NERC Regulatory Submission — Q1 2026',
    purpose:'NERC compliance evidence package',
    createdBy:'F. Adeyemi', created:'20 Mar 2026', expires:'20 Apr 2026', daysLeft:13,
    docs:18, status:'active', nda:false, watermark:true,
    accessors:[
      { name:'NERC Commissioner (Regulatory Dir.)', permissions:'View only', lastAccess:'28 Mar 2026', docsViewed:12 },
    ],
  },
  {
    id:'DR-2025-008', name:'NREI Subsidiary Incorporation — Due Diligence',
    purpose:'External counsel due diligence — Kenya jurisdiction',
    createdBy:'Head of Legal', created:'01 Nov 2025', expires:'31 Jan 2026', daysLeft:-67,
    docs:128, status:'expired', nda:true, watermark:true,
    accessors:[
      { name:'Karimi & Associates (Nairobi)', permissions:'View only', lastAccess:'15 Jan 2026', docsViewed:96 },
    ],
  },
]
