-- NAPTIN Finance & Procurement Seed Data

-- Fiscal Years
INSERT INTO fin_fiscal_years (label, start_date, end_date, is_closed) VALUES
  ('FY 2024', '2024-01-01', '2024-12-31', TRUE),
  ('FY 2025', '2025-01-01', '2025-12-31', TRUE),
  ('FY 2026', '2026-01-01', '2026-12-31', FALSE)
ON CONFLICT DO NOTHING;

-- Chart of Accounts (Nigerian Government Accounting Standard)
INSERT INTO fin_chart_of_accounts (account_code, name, account_type, normal_balance, description) VALUES
  -- Assets
  ('1000', 'Cash and Cash Equivalents',    'asset',     'debit',  'Cash in hand and at bank'),
  ('1010', 'CBN Treasury Single Account',  'asset',     'debit',  'TSA with Central Bank of Nigeria'),
  ('1020', 'Petty Cash - Head Office',     'asset',     'debit',  'Petty cash imprest'),
  ('1100', 'Accounts Receivable',          'asset',     'debit',  'Amounts due from trainees and debtors'),
  ('1200', 'Prepaid Expenses',             'asset',     'debit',  'Advance payments'),
  ('1500', 'Fixed Assets - Furniture',     'asset',     'debit',  'Office furniture and fittings'),
  ('1510', 'Fixed Assets - Vehicles',      'asset',     'debit',  'Motor vehicles'),
  ('1520', 'Fixed Assets - IT Equipment',  'asset',     'debit',  'Computers, servers, networking'),
  ('1530', 'Fixed Assets - Training Equip','asset',     'debit',  'Simulators and training equipment'),
  ('1540', 'Fixed Assets - Buildings',     'asset',     'debit',  'Office and training centre buildings'),
  ('1600', 'Accumulated Depreciation',     'asset',     'debit',  'Contra-asset for depreciation'),

  -- Liabilities
  ('2000', 'Accounts Payable',             'liability', 'credit', 'Amounts owed to suppliers'),
  ('2100', 'Accrued Expenses',             'liability', 'credit', 'Expenses incurred but not yet paid'),
  ('2200', 'Staff Pension Liability',      'liability', 'credit', 'Employer pension contributions payable'),
  ('2300', 'PAYE Tax Payable',             'liability', 'credit', 'Personal income tax deductions'),
  ('2400', 'NHF Payable',                  'liability', 'credit', 'National Housing Fund contributions'),
  ('2500', 'Deferred Revenue',             'liability', 'credit', 'Training fees received in advance'),

  -- Equity
  ('3000', 'Government Equity',            'equity',    'credit', 'FGN appropriation and contributions'),
  ('3100', 'Retained Surplus',             'equity',    'credit', 'Accumulated surplus from operations'),

  -- Revenue
  ('4000', 'Training Revenue',             'revenue',   'credit', 'Income from training programmes'),
  ('4010', 'Certification Fees',           'revenue',   'credit', 'Railway operator certification income'),
  ('4020', 'Consultancy Revenue',          'revenue',   'credit', 'Advisory and consultancy services'),
  ('4030', 'FGN Subvention',              'revenue',   'credit', 'Federal Government annual allocation'),
  ('4040', 'Donor Grants',                'revenue',   'credit', 'International donor funding'),
  ('4050', 'Facility Rental Income',       'revenue',   'credit', 'Rental of training facilities'),

  -- Expenses
  ('5000', 'Personnel Costs',              'expense',   'debit',  'Total staff salaries and allowances'),
  ('5010', 'Basic Salary',                 'expense',   'debit',  'Staff basic salary'),
  ('5020', 'Transport Allowance',          'expense',   'debit',  'Monthly transport allowance'),
  ('5030', 'Housing Allowance',            'expense',   'debit',  'Monthly housing allowance'),
  ('5040', 'Meal Allowance',              'expense',   'debit',  'Staff meal/feeding allowance'),
  ('5050', 'Pension Contribution',         'expense',   'debit',  'Employer pension (10%)'),
  ('5100', 'Training Materials',           'expense',   'debit',  'Course materials and supplies'),
  ('5110', 'Facilitator Fees',            'expense',   'debit',  'External trainer engagement costs'),
  ('5200', 'Utilities',                    'expense',   'debit',  'Electricity, water, internet'),
  ('5210', 'Office Supplies',             'expense',   'debit',  'Stationery and consumables'),
  ('5220', 'Vehicle Maintenance',          'expense',   'debit',  'Fleet maintenance and fuel'),
  ('5230', 'Building Maintenance',         'expense',   'debit',  'Facility repairs and maintenance'),
  ('5300', 'Travel & Transport',           'expense',   'debit',  'Official travel and per diem'),
  ('5310', 'Conference & Workshop',        'expense',   'debit',  'External seminars and conferences'),
  ('5400', 'Professional Fees',            'expense',   'debit',  'Legal, audit, and consulting fees'),
  ('5500', 'Depreciation Expense',         'expense',   'debit',  'Annual depreciation of fixed assets'),
  ('5600', 'Insurance',                    'expense',   'debit',  'Group life and asset insurance'),
  ('5700', 'ICT Services',                'expense',   'debit',  'Software licences and IT services')
ON CONFLICT DO NOTHING;

-- Vendors (Finance module)
INSERT INTO fin_vendors (vendor_code, name, contact_person, email, phone, payment_terms_days) VALUES
  ('FVND-001', 'Nigerian Railway Corporation',      'Mr. Adamu Gambo',     'procurement@nrc.gov.ng',      '09012345678', 30),
  ('FVND-002', 'Dangote Industrial Supplies',        'Mrs. Aisha Dangote',  'orders@dangotesupplies.com',  '08023456789', 45),
  ('FVND-003', 'Mikano International Ltd',           'Mr. Chen Wei',        'sales@mikano.com',            '08034567890', 30),
  ('FVND-004', 'Julius Berger Nigeria Plc',          'Engr. Hans Mueller',  'contracts@juliusberger.com',  '08045678901', 60),
  ('FVND-005', 'HP Nigeria Partners',                'Mr. Tayo Adewale',    'enterprise@hpnigeria.com',    '08056789012', 30),
  ('FVND-006', 'Total Energies Nigeria',             'Mrs. Funke Oladeji',  'corporate@totalenergies.ng',  '08067890123', 15),
  ('FVND-007', 'Zinox Technologies',                 'Mr. Leo Stan Ekeh',   'govt@zinox.com',              '08078901234', 30)
ON CONFLICT DO NOTHING;

-- Customers
INSERT INTO fin_customers (customer_code, name, contact_person, email, credit_limit) VALUES
  ('CUST-001', 'Nigerian Railway Corporation',   'Mr. Fidet Okhiria',    'training@nrc.gov.ng',       50000000),
  ('CUST-002', 'Lagos Metropolitan Area Transport','Mrs. Abimbola Akinajo','academy@lamata.ng',        20000000),
  ('CUST-003', 'Ogun-Guangdong Free Trade Zone', 'Mr. Liu Zheng',        'training@ogftz.com',        10000000),
  ('CUST-004', 'Abuja Light Rail Company',        'Engr. Shehu Hadi',     'staff.dev@abujametro.ng',   15000000),
  ('CUST-005', 'Transnet South Africa',            'Ms. Portia Molefe',    'skill.exchange@transnet.net',30000000)
ON CONFLICT DO NOTHING;

-- Bank Accounts
INSERT INTO fin_bank_accounts (account_name, bank_name, account_number, account_type, currency, current_balance) VALUES
  ('NAPTIN TSA Main',           'Central Bank of Nigeria', '0001234567', 'tsa',     'NGN', 850000000.00),
  ('NAPTIN Operations Account', 'First Bank',              '2012345678', 'current', 'NGN', 45000000.00),
  ('NAPTIN Revenue Account',    'Zenith Bank',             '1023456789', 'current', 'NGN', 12000000.00),
  ('Petty Cash Imprest',        'Cash Office',             'PETTY-001',  'cash',    'NGN', 500000.00),
  ('Training Fee Collection',   'GTBank',                  '0123456789', 'current', 'NGN', 8500000.00)
ON CONFLICT DO NOTHING;

-- Budget Heads for FY 2026
INSERT INTO fin_budget_heads (fiscal_year_id, account_id, department_code, original_amount, revised_amount, actual_amount, committed_amount)
SELECT fy.id, a.id,
  CASE WHEN ROW_NUMBER() OVER () % 5 = 0 THEN 'ADMIN'
       WHEN ROW_NUMBER() OVER () % 5 = 1 THEN 'FIN'
       WHEN ROW_NUMBER() OVER () % 5 = 2 THEN 'TRNG'
       WHEN ROW_NUMBER() OVER () % 5 = 3 THEN 'ICT'
       ELSE 'OPS' END,
  CASE WHEN a.account_type = 'expense' THEN (RANDOM() * 50000000 + 5000000)::NUMERIC(15,2)
       ELSE (RANDOM() * 100000000 + 10000000)::NUMERIC(15,2) END,
  CASE WHEN a.account_type = 'expense' THEN (RANDOM() * 55000000 + 5000000)::NUMERIC(15,2)
       ELSE (RANDOM() * 110000000 + 10000000)::NUMERIC(15,2) END,
  (RANDOM() * 20000000)::NUMERIC(15,2),
  (RANDOM() * 5000000)::NUMERIC(15,2)
FROM fin_fiscal_years fy, fin_chart_of_accounts a
WHERE fy.label = 'FY 2026' AND a.account_type IN ('expense', 'revenue')
ON CONFLICT DO NOTHING;

-- Budget Consolidation Submissions (FY 2026)
WITH fy AS (
  SELECT id FROM fin_fiscal_years WHERE label = 'FY 2026' LIMIT 1
)
INSERT INTO fin_budget_submissions (
  fiscal_year_id, department_code, department_name, submission_date,
  amount, prev_year_amount, variance_pct, status, justification
)
SELECT fy.id, x.department_code, x.department_name, x.submission_date,
  x.amount, x.prev_year_amount, x.variance_pct, x.status, x.justification
FROM fy
JOIN (
  VALUES
    ('TRNG', 'Training', DATE '2026-03-28', 185000000::numeric, 127500000::numeric, 45.00::numeric, 'flagged', NULL),
    ('ADMIN', 'Administration', DATE '2026-03-25', 42000000::numeric, 38900000::numeric, 8.00::numeric, 'submitted', NULL),
    ('ICT', 'ICT', DATE '2026-03-26', 31000000::numeric, 27700000::numeric, 12.00::numeric, 'approved', 'Migration to cloud infrastructure'),
    ('HR', 'HR', NULL, NULL, 18500000::numeric, NULL, 'pending', NULL),
    ('PROC', 'Procurement', DATE '2026-03-27', 15200000::numeric, 14700000::numeric, 3.00::numeric, 'submitted', NULL)
) AS x(department_code, department_name, submission_date, amount, prev_year_amount, variance_pct, status, justification)
ON CONFLICT (fiscal_year_id, department_code) DO NOTHING;

-- Budget Virements (FY 2026)
WITH fy AS (
  SELECT id FROM fin_fiscal_years WHERE label = 'FY 2026' LIMIT 1
)
INSERT INTO fin_budget_virements (
  virement_ref, fiscal_year_id, from_line, to_line, amount, reason,
  status, requested_by, approval_level
)
SELECT x.virement_ref, fy.id, x.from_line, x.to_line, x.amount, x.reason,
  x.status, x.requested_by, x.approval_level
FROM fy
JOIN (
  VALUES
    ('VIR-2026-009', 'IT — Training Budget', 'IT — Software Licenses', 2000000::numeric, 'MS365 renewal exceeds training allocation', 'pending', 'IT Head', 'Finance Director'),
    ('VIR-2026-008', 'Admin — Transport', 'Admin — Vehicle Maintenance', 850000::numeric, 'Unexpected fleet repairs Q1', 'approved', 'Admin Head', 'Finance Officer'),
    ('VIR-2026-007', 'HR — Recruitment', 'HR — Training & Dev', 5500000::numeric, 'Freeze on external recruitment — reallocate to capacity building', 'pending', 'HR Director', 'DG + Finance Director')
) AS x(virement_ref, from_line, to_line, amount, reason, status, requested_by, approval_level)
ON CONFLICT (virement_ref) DO NOTHING;

-- Fixed Assets
INSERT INTO fin_fixed_assets (asset_code, name, category, department_code, acquisition_date, acquisition_cost, useful_life_months, salvage_value, net_book_value, depreciation_method, location, custodian) VALUES
  ('FA-VEH-001', 'Toyota Hilux - DG Office',         'vehicles',    'DG',    '2022-03-15', 35000000, 60, 5000000, 23000000, 'straight_line', 'Head Office Car Park', 'Transport Unit'),
  ('FA-VEH-002', 'Toyota Coaster Bus - Training',     'vehicles',    'TRNG',  '2023-01-10', 45000000, 60, 7000000, 37400000, 'straight_line', 'Training Centre',      'Transport Unit'),
  ('FA-IT-001',  'Dell PowerEdge Server R740',        'it_equipment','ICT',   '2023-06-01', 12000000, 48, 1000000, 8250000,  'straight_line', 'Server Room',          'ICT Department'),
  ('FA-IT-002',  'HP LaserJet Enterprise Printers x5','it_equipment','ADMIN', '2024-02-15', 3500000,  36, 350000,  2450000,  'straight_line', 'Various Offices',      'ICT Department'),
  ('FA-TR-001',  'Railway Simulator - Class 8000',    'training',    'TRNG',  '2022-08-20', 150000000,120,15000000, 118750000,'straight_line', 'Simulation Centre',    'Training Department'),
  ('FA-FN-001',  'Office Furniture - HQ Renovation',  'furniture',   'ADMIN', '2024-09-01', 8500000,  84, 850000,  7350000,  'straight_line', 'Head Office',          'Admin Department'),
  ('FA-BLD-001', 'Training Centre - Abuja Block A',   'buildings',   'TRNG',  '2020-01-15', 500000000,360,50000000,408333333,'straight_line', 'Abuja Training Centre','Maintenance Unit')
ON CONFLICT DO NOTHING;

-- Procurement Vendors
INSERT INTO proc_vendors (vendor_code, name, contact_person, email, phone, address, registration_type, tax_id, bank_name, bank_account_no, performance_rating) VALUES
  ('VND-001', 'Alstom Nigeria Ltd',               'Mr. Jacques Dupont',  'govt@alstom.ng',         '09012345678', '12 Marina, Lagos',                'international','TIN-ALSTM001', 'Citibank Nigeria',  '5012345678', 4.5),
  ('VND-002', 'CCECC Nigeria Railway',             'Mr. Zhang Lin',       'procure@ccecc.com.ng',   '09023456789', '100 Airport Road, Abuja',         'international','TIN-CCECC002', 'Standard Chartered','5023456789', 4.2),
  ('VND-003', 'Dangote Industries',                'Alhaji Sani Dangote', 'govt@dangote.com',        '08034567890', 'Falomo, Ikoyi, Lagos',            'local',        'TIN-DNGOT003', 'First Bank',        '2034567890', 4.7),
  ('VND-004', 'Innoson Vehicle Manufacturing',     'Chief Innocent Chukwuma','sales@innoson.ng',     '08045678901', 'Nnewi, Anambra State',            'local',        'TIN-INNOS004', 'Zenith Bank',       '1045678901', 3.8),
  ('VND-005', 'Orinshola Global Services',         'Chief Orinshola',     'info@orinshola.com',      '08056789012', '5 Adeola Odeku, VI, Lagos',       'local',        'TIN-ORINS005', 'GTBank',            '0156789012', 4.0),
  ('VND-006', 'Siemens Mobility Nigeria',          'Mrs. Angela Schmidt', 'mobility@siemens.ng',     '09066778899', '5 Adeola Odeku, VI, Lagos',       'international','TIN-SIEMN006', 'Deutsche Bank',     '5067890123', 4.6),
  ('VND-007', 'Nigerian Office Equipment Supplies','Mr. Emeka Uba',       'sales@noes.com.ng',       '08078901234', '22 Herbert Macaulay, Yaba, Lagos', 'local',        'TIN-NOES0007', 'Access Bank',       '0178901234', 3.5)
ON CONFLICT DO NOTHING;

-- ICT Assets
INSERT INTO ict_assets (asset_tag, name, category, manufacturer, model, serial_number, assigned_to, department, location, purchase_date, warranty_expiry, status, ip_address) VALUES
  ('ICT-SRV-001', 'Primary Database Server',     'server',   'Dell',    'PowerEdge R740',    'SRV740-001', 'yusuf.bello',    'ICT',   'Server Room',    '2023-06-01', '2026-06-01', 'active', '10.0.1.10'),
  ('ICT-SRV-002', 'Application Server',           'server',   'Dell',    'PowerEdge R640',    'SRV640-002', 'yusuf.bello',    'ICT',   'Server Room',    '2023-06-01', '2026-06-01', 'active', '10.0.1.11'),
  ('ICT-SRV-003', 'Backup Storage Server',        'server',   'HPE',     'ProLiant DL380',    'HPE380-003', 'bashir.mohammed','ICT',   'Server Room',    '2024-01-15', '2027-01-15', 'active', '10.0.1.12'),
  ('ICT-NET-001', 'Core Switch',                   'network',  'Cisco',   'Catalyst 9300',     'CAT9300-001','bashir.mohammed','ICT',   'Network Cabinet', '2023-08-20', '2026-08-20', 'active', '10.0.1.1'),
  ('ICT-NET-002', 'Firewall',                      'network',  'Fortinet','FortiGate 100F',    'FG100F-002', 'bashir.mohammed','ICT',   'Network Cabinet', '2023-08-20', '2026-08-20', 'active', '10.0.1.2'),
  ('ICT-COM-001', 'DG Desktop PC',                 'computer', 'HP',      'EliteDesk 800 G9',  'HPED800-001','binta.adamu',   'DG',    'DG Office',      '2024-03-01', '2027-03-01', 'active', '10.0.10.100'),
  ('ICT-COM-002', 'Admin Director Laptop',          'computer', 'Dell',    'Latitude 5540',     'LAT5540-002','fatima.musa',   'ADMIN', 'Admin Office',   '2024-03-01', '2027-03-01', 'active', NULL),
  ('ICT-COM-003', 'Finance Director Desktop',       'computer', 'HP',      'ProDesk 400 G9',    'HPPD400-003','chukwuemeka.obi','FIN',  'Finance Office', '2024-03-01', '2027-03-01', 'active', '10.0.10.101'),
  ('ICT-COM-004', 'ICT Officer Laptop',             'computer', 'Lenovo',  'ThinkPad T14s',     'LNVT14S-004','grace.okafor',  'ICT',   'ICT Office',    '2024-06-15', '2027-06-15', 'active', NULL),
  ('ICT-PRN-001', 'Admin Office Printer',            'printer',  'HP',      'LaserJet Enterprise','HPLJ-001',  NULL,            'ADMIN', 'Admin Floor',    '2024-02-15', '2027-02-15', 'active', '10.0.10.200'),
  ('ICT-PRN-002', 'Finance Office Printer',           'printer',  'HP',      'LaserJet Enterprise','HPLJ-002',  NULL,            'FIN',   'Finance Floor',  '2024-02-15', '2027-02-15', 'active', '10.0.10.201')
ON CONFLICT DO NOTHING;

-- ICT Systems
INSERT INTO ict_systems (name, description, system_type, url, health_status, uptime_percent, owner, department) VALUES
  ('NAPTIN ERP Portal',     'Enterprise Resource Planning system',  'web_app',    'https://portal.naptin.gov.ng',     'healthy',  99.8, 'ICT Department', 'ICT'),
  ('Email Server',          'Microsoft Exchange Online',             'cloud',      'https://outlook.office365.com',    'healthy',  99.9, 'ICT Department', 'ICT'),
  ('Training LMS',          'Learning Management System (Moodle)',   'web_app',    'https://lms.naptin.gov.ng',        'healthy',  98.5, 'Training Dept',  'TRNG'),
  ('IPPIS Integration',     'Personnel payroll interface to IPPIS',  'integration','https://ippis.gov.ng',             'degraded', 95.0, 'Finance Dept',   'FIN'),
  ('Backup System',         'Veeam backup and disaster recovery',    'on_premise', NULL,                               'healthy',  99.5, 'ICT Department', 'ICT'),
  ('Biometric Attendance',  'Fingerprint attendance terminals',      'on_premise', NULL,                               'healthy',  97.0, 'Admin Dept',     'ADMIN'),
  ('CCTV Monitoring',       'IP camera surveillance system',         'on_premise', NULL,                               'warning',  94.5, 'Security Unit',  'OPS'),
  ('Internet Gateway',      'ISP connectivity (MainOne + MTN)',      'network',    NULL,                               'healthy',  98.0, 'ICT Department', 'ICT')
ON CONFLICT DO NOTHING;
