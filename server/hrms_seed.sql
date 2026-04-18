-- NAPTIN HRMS Seed Data (aligned with hrms_schema.sql)

-- Departments
INSERT INTO hr_departments (code, name, budget_code, status)
VALUES
  ('DG', 'Director General''s Office', 'BUD-DG-001', 'active'),
  ('ADMIN', 'Administration & HR', 'BUD-ADM-001', 'active'),
  ('FIN', 'Finance & Accounts', 'BUD-FIN-001', 'active'),
  ('TRNG', 'Training & Development', 'BUD-TRN-001', 'active'),
  ('ICT', 'Information & Communications Technology', 'BUD-ICT-001', 'active'),
  ('PROC', 'Procurement & Stores', 'BUD-PRC-001', 'active'),
  ('OPS', 'Operations & Compliance', 'BUD-OPS-001', 'active'),
  ('LEGAL', 'Legal Services', 'BUD-LEG-001', 'active'),
  ('AUDIT', 'Internal Audit', 'BUD-AUD-001', 'active')
ON CONFLICT (code) DO NOTHING;

-- Parent hierarchy (all report to DG)
UPDATE hr_departments d
SET parent_department_id = dg.id
FROM hr_departments dg
WHERE d.code IN ('ADMIN', 'FIN', 'TRNG', 'ICT', 'PROC', 'OPS', 'LEGAL', 'AUDIT')
  AND dg.code = 'DG'
  AND (d.parent_department_id IS DISTINCT FROM dg.id);

-- Positions
INSERT INTO hr_positions (title, grade_level, department_id, is_filled, status)
SELECT v.title, v.grade_level, d.id, v.is_filled, 'active'
FROM (
  VALUES
    ('Director General', 'GL 17', 'DG', TRUE),
    ('Director', 'GL 16', 'ADMIN', TRUE),
    ('Director', 'GL 16', 'FIN', TRUE),
    ('Director', 'GL 16', 'TRNG', TRUE),
    ('Director', 'GL 16', 'ICT', TRUE),
    ('Assistant Director', 'GL 14', 'ADMIN', TRUE),
    ('Assistant Director', 'GL 14', 'TRNG', TRUE),
    ('Principal Officer', 'GL 13', 'FIN', TRUE),
    ('Senior Officer', 'GL 12', 'ADMIN', TRUE),
    ('Officer I', 'GL 10', 'ICT', TRUE),
    ('Officer II', 'GL 09', 'FIN', TRUE),
    ('Administrative Assistant', 'GL 07', 'ADMIN', TRUE)
) AS v(title, grade_level, department_code, is_filled)
JOIN hr_departments d ON d.code = v.department_code
WHERE NOT EXISTS (
  SELECT 1
  FROM hr_positions p
  WHERE p.title = v.title
    AND p.grade_level = v.grade_level
    AND p.department_id = d.id
);

-- Core employee records
INSERT INTO hr_employees (
  employee_id, first_name, last_name, other_names, email, phone,
  gender, date_of_birth, marital_status, state_of_origin, lga,
  residential_address, department_id, position_id, grade_level, step,
  date_of_first_appointment, date_of_current_appointment,
  employment_type, employment_status, bank_name, bank_account_no, tax_id, pension_pin
)
SELECT
  v.employee_id, v.first_name, v.last_name, v.other_names, v.email, v.phone,
  v.gender, v.date_of_birth, v.marital_status, v.state_of_origin, v.lga,
  v.residential_address, d.id, p.id, v.grade_level, v.step,
  v.date_of_first_appointment, v.date_of_current_appointment,
  v.employment_type, v.employment_status, v.bank_name, v.bank_account_no, v.tax_id, v.pension_pin
FROM (
  VALUES
    ('NAPTIN/001', 'Binta', 'Adamu', 'Halima', 'binta.adamu@naptin.gov.ng', '08031234567', 'female', DATE '1968-03-15', 'married', 'Kaduna', 'Kaduna North', '12 Ahmadu Bello Way, Kaduna', 'DG', 'Director General', 'GL 17', 1, DATE '1995-07-01', DATE '2020-01-15', 'permanent', 'active', 'First Bank', '2012345678', 'TIN0001234', 'PEN100001234567'),
    ('NAPTIN/002', 'Fatima', 'Musa', NULL, 'fatima.musa@naptin.gov.ng', '08037654321', 'female', DATE '1972-08-22', 'married', 'Kano', 'Nassarawa', '45 Zoo Road, Kano', 'ADMIN', 'Director', 'GL 16', 3, DATE '1998-10-01', DATE '2019-04-01', 'permanent', 'active', 'GTBank', '0123456789', 'TIN0002345', 'PEN100002345678'),
    ('NAPTIN/003', 'Chukwuemeka', 'Obi', 'Nnaemeka', 'chukwuemeka.obi@naptin.gov.ng', '08054321987', 'male', DATE '1970-12-05', 'married', 'Anambra', 'Onitsha North', '7 New Market Road, Onitsha', 'FIN', 'Director', 'GL 16', 5, DATE '1997-03-15', DATE '2018-09-01', 'permanent', 'active', 'Zenith Bank', '1023456789', 'TIN0003456', 'PEN100003456789'),
    ('NAPTIN/004', 'Olumide', 'Akinola', 'Babatunde', 'olumide.akinola@naptin.gov.ng', '08098765432', 'male', DATE '1975-06-18', 'single', 'Oyo', 'Ibadan North', '23 Ring Road, Ibadan', 'TRNG', 'Director', 'GL 16', 2, DATE '2000-01-10', DATE '2019-11-15', 'permanent', 'active', 'UBA', '2034567890', 'TIN0004567', 'PEN100004567890'),
    ('NAPTIN/005', 'Yusuf', 'Bello', NULL, 'yusuf.bello@naptin.gov.ng', '08076543210', 'male', DATE '1978-01-30', 'married', 'Niger', 'Minna', '5 Paiko Road, Minna', 'ICT', 'Director', 'GL 16', 1, DATE '2002-06-01', DATE '2021-03-01', 'permanent', 'active', 'Access Bank', '0145678901', 'TIN0005678', 'PEN100005678901'),
    ('NAPTIN/006', 'Ngozi', 'Eze', 'Chioma', 'ngozi.eze@naptin.gov.ng', '08011334455', 'female', DATE '1976-04-11', 'married', 'Abia', 'Umuahia North', '12 Azikiwe Road, Umuahia', 'PROC', 'Director', 'GL 16', 1, DATE '1999-11-01', DATE '2019-05-15', 'permanent', 'active', 'Diamond Bank', '1456789012', 'TIN0016789', 'PEN100016789012'),
    ('NAPTIN/007', 'Abdulrahman', 'Suleiman', NULL, 'abdulrahman.suleiman@naptin.gov.ng', '08022445566', 'male', DATE '1974-07-22', 'married', 'Plateau', 'Jos North', '8 Tafawa Balewa Street, Jos', 'OPS', 'Director', 'GL 16', 2, DATE '1998-06-01', DATE '2018-12-01', 'permanent', 'active', 'Unity Bank', '2567890123', 'TIN0017890', 'PEN100017890123'),
    ('NAPTIN/008', 'Adebayo', 'Ogundimu', 'Kunle', 'adebayo.ogundimu@naptin.gov.ng', '08045678901', 'male', DATE '1983-11-08', 'single', 'Lagos', 'Ikeja', '33 Allen Avenue, Ikeja, Lagos', 'ADMIN', 'Assistant Director', 'GL 14', 3, DATE '2007-02-01', DATE '2020-09-01', 'permanent', 'active', 'Stanbic IBTC', '0278901234', 'TIN0008901', 'PEN100008901234'),
    ('NAPTIN/009', 'Grace', 'Okafor', NULL, 'grace.okafor@naptin.gov.ng', '08077889900', 'female', DATE '1991-06-09', 'single', 'Delta', 'Asaba', '6 Nnebisi Road, Asaba', 'ICT', 'Officer I', 'GL 10', 2, DATE '2015-04-01', DATE '2023-04-01', 'permanent', 'active', 'Wema Bank', '3234567890', 'TIN0014567', 'PEN100014567890'),
    ('NAPTIN/010', 'Musa', 'Aliyu', NULL, 'musa.aliyu@naptin.gov.ng', '08099001122', 'male', DATE '1992-12-01', 'married', 'Kwara', 'Ilorin South', '30 Ibrahim Taiwo Road, Ilorin', 'PROC', 'Officer II', 'GL 09', 1, DATE '2016-09-15', DATE '2023-09-15', 'permanent', 'active', 'Sterling Bank', '0345678901', 'TIN0015678', 'PEN100015678901')
) AS v(
  employee_id, first_name, last_name, other_names, email, phone,
  gender, date_of_birth, marital_status, state_of_origin, lga,
  residential_address, department_code, position_title, grade_level, step,
  date_of_first_appointment, date_of_current_appointment,
  employment_type, employment_status, bank_name, bank_account_no, tax_id, pension_pin
)
JOIN hr_departments d ON d.code = v.department_code
LEFT JOIN hr_positions p
  ON p.department_id = d.id
 AND p.title = v.position_title
 AND p.grade_level = v.grade_level
ON CONFLICT (employee_id) DO UPDATE
SET
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  other_names = EXCLUDED.other_names,
  email = EXCLUDED.email,
  phone = EXCLUDED.phone,
  department_id = EXCLUDED.department_id,
  position_id = EXCLUDED.position_id,
  grade_level = EXCLUDED.grade_level,
  step = EXCLUDED.step,
  employment_status = EXCLUDED.employment_status,
  updated_at = NOW();

-- Portal demo logins (emails match AuthContext DEMO_USERS for HR profile + DB sync)
-- Clear prior portal-demo rows so re-seeding stays idempotent (FK-safe).
UPDATE hr_leave_requests lr
SET relief_officer_id = NULL
WHERE lr.relief_officer_id IN (
  SELECT id FROM hr_employees e
  WHERE e.employee_id LIKE 'NAPTIN/P%'
     OR LOWER(TRIM(e.email)) IN (
       'staff@naptin.gov.ng','hod@naptin.gov.ng','director@naptin.gov.ng',
       'ict@naptin.gov.ng','audit@naptin.gov.ng','a.okonkwo@naptin.gov.ng'
     )
);
UPDATE hr_leave_requests lr
SET reviewed_by = NULL
WHERE lr.reviewed_by IN (
  SELECT id FROM hr_employees e
  WHERE e.employee_id LIKE 'NAPTIN/P%'
     OR LOWER(TRIM(e.email)) IN (
       'staff@naptin.gov.ng','hod@naptin.gov.ng','director@naptin.gov.ng',
       'ict@naptin.gov.ng','audit@naptin.gov.ng','a.okonkwo@naptin.gov.ng'
     )
);
UPDATE hr_performance_reviews pr
SET reviewer_id = NULL
WHERE pr.reviewer_id IN (
  SELECT id FROM hr_employees e
  WHERE e.employee_id LIKE 'NAPTIN/P%'
     OR LOWER(TRIM(e.email)) IN (
       'staff@naptin.gov.ng','hod@naptin.gov.ng','director@naptin.gov.ng',
       'ict@naptin.gov.ng','audit@naptin.gov.ng','a.okonkwo@naptin.gov.ng'
     )
);
DELETE FROM hr_employees e
WHERE e.employee_id LIKE 'NAPTIN/P%'
   OR LOWER(TRIM(e.email)) IN (
     'staff@naptin.gov.ng','hod@naptin.gov.ng','director@naptin.gov.ng',
     'ict@naptin.gov.ng','audit@naptin.gov.ng','a.okonkwo@naptin.gov.ng'
   );

INSERT INTO hr_employees (
  employee_id, first_name, last_name, other_names, email, phone,
  gender, date_of_birth, marital_status, state_of_origin, lga,
  residential_address, department_id, position_id, grade_level, step,
  date_of_first_appointment, date_of_current_appointment,
  employment_type, employment_status, bank_name, bank_account_no, tax_id, pension_pin,
  portal_username, portal_display_name, office_location
)
SELECT DISTINCT ON (v.employee_id)
  v.employee_id, v.first_name, v.last_name, v.other_names, v.email, v.phone,
  v.gender, v.date_of_birth, v.marital_status, v.state_of_origin, v.lga,
  v.residential_address, d.id, p.id, v.grade_level, v.step,
  v.date_of_first_appointment, v.date_of_current_appointment,
  v.employment_type, v.employment_status, v.bank_name, v.bank_account_no, v.tax_id, v.pension_pin,
  v.portal_username, v.portal_display_name, v.office_location
FROM (
  VALUES
    ('NAPTIN/P01', 'Adebayo', 'Okonkwo', NULL, 'staff@naptin.gov.ng', '+234 803 456 7890', 'male', DATE '1985-04-12', 'married', 'Lagos', 'Ikeja', 'Corporate HQ, Abuja', 'ADMIN', 'Assistant Director', 'GL 14', 3, DATE '2010-05-01', DATE '2019-06-01', 'permanent', 'active', 'GTBank', '2012345678', 'TIN0001001', 'PEN100010001001', 'adebayo.okonkwo', 'Adebayo Okonkwo', 'Corporate HQ, Abuja'),
    ('NAPTIN/P02', 'Grace', 'Okafor', NULL, 'hod@naptin.gov.ng', '+234 807 788 9900', 'female', DATE '1991-06-09', 'single', 'Delta', 'Asaba', '6 Nnebisi Road, Asaba', 'FIN', 'Principal Officer', 'GL 13', 2, DATE '2015-04-01', DATE '2023-04-01', 'permanent', 'active', 'Wema Bank', '3234567890', 'TIN0001002', 'PEN100010002002', 'grace.okafor', 'Grace Okafor', 'Finance HQ, Abuja'),
    ('NAPTIN/P03', 'Biodun', 'Adeyemi', NULL, 'director@naptin.gov.ng', '+234 802 555 0101', 'male', DATE '1972-03-20', 'married', 'Ogun', 'Abeokuta', '15 Quarry Road, Abeokuta', 'TRNG', 'Director', 'GL 16', 1, DATE '1996-01-15', DATE '2018-03-01', 'permanent', 'active', 'Zenith Bank', '1023456789', 'TIN0001003', 'PEN100010003003', 'biodun.adeyemi', 'Biodun Adeyemi', 'Training Campus, Kaduna'),
    ('NAPTIN/P04', 'Emmanuel', 'Bello', NULL, 'ict@naptin.gov.ng', '+234 805 765 4321', 'male', DATE '1988-09-01', 'married', 'Niger', 'Minna', 'ICT Block, Minna', 'ICT', 'Officer I', 'GL 10', 2, DATE '2015-04-01', DATE '2023-04-01', 'permanent', 'active', 'Access Bank', '0145678901', 'TIN0001004', 'PEN100010004004', 'emmanuel.bello', 'Emmanuel Bello', 'Lagos ICT Campus'),
    ('NAPTIN/P05', 'Ngozi', 'Eze', 'Chioma', 'audit@naptin.gov.ng', '+234 801 133 4455', 'female', DATE '1976-04-11', 'married', 'Abia', 'Umuahia North', '12 Azikiwe Road, Umuahia', 'PROC', 'Director', 'GL 16', 1, DATE '1999-11-01', DATE '2019-05-15', 'permanent', 'active', 'Diamond Bank', '1456789012', 'TIN0001005', 'PEN100010005005', 'ngozi.eze', 'Ngozi Eze', 'Internal Audit, Abuja'),
    ('NAPTIN/P06', 'Adebayo', 'Okonkwo', NULL, 'a.okonkwo@naptin.gov.ng', '+234 803 456 7890', 'male', DATE '1985-04-12', 'married', 'Lagos', 'Ikeja', 'Corporate HQ, Abuja', 'ADMIN', 'Assistant Director', 'GL 14', 3, DATE '2010-05-01', DATE '2019-06-01', 'permanent', 'active', 'GTBank', '2012345679', 'TIN0001006', 'PEN100010006006', 'a.okonkwo', 'Adebayo Okonkwo', 'Corporate HQ, Abuja')
) AS v(
  employee_id, first_name, last_name, other_names, email, phone,
  gender, date_of_birth, marital_status, state_of_origin, lga,
  residential_address, department_code, position_title, grade_level, step,
  date_of_first_appointment, date_of_current_appointment,
  employment_type, employment_status, bank_name, bank_account_no, tax_id, pension_pin,
  portal_username, portal_display_name, office_location
)
JOIN hr_departments d ON d.code = v.department_code
LEFT JOIN hr_positions p
  ON p.department_id = d.id
 AND p.title = v.position_title
 AND p.grade_level = v.grade_level
ORDER BY v.employee_id, p.id NULLS LAST;

-- Department heads
UPDATE hr_departments d
SET head_employee_id = e.id
FROM hr_employees e
WHERE (
    (d.code = 'DG' AND e.employee_id = 'NAPTIN/001')
 OR (d.code = 'ADMIN' AND e.employee_id = 'NAPTIN/002')
 OR (d.code = 'FIN' AND e.employee_id = 'NAPTIN/003')
 OR (d.code = 'TRNG' AND e.employee_id = 'NAPTIN/004')
 OR (d.code = 'ICT' AND e.employee_id = 'NAPTIN/005')
 OR (d.code = 'PROC' AND e.employee_id = 'NAPTIN/006')
 OR (d.code = 'OPS' AND e.employee_id = 'NAPTIN/007')
)
AND (d.head_employee_id IS DISTINCT FROM e.id);

-- Leave types
INSERT INTO hr_leave_types (
  code, name, default_days_per_year, carry_over_max, requires_document, is_paid, status
)
VALUES
  ('ANNUAL', 'Annual Leave', 30, 10, FALSE, TRUE, 'active'),
  ('SICK', 'Sick Leave', 14, 0, TRUE, TRUE, 'active'),
  ('MATERNITY', 'Maternity Leave', 90, 0, TRUE, TRUE, 'active'),
  ('PATERNITY', 'Paternity Leave', 14, 0, TRUE, TRUE, 'active'),
  ('STUDY', 'Study Leave', 30, 0, TRUE, TRUE, 'active'),
  ('CASUAL', 'Casual Leave', 5, 0, FALSE, TRUE, 'active')
ON CONFLICT (code) DO NOTHING;

-- Leave balances for current year
INSERT INTO hr_leave_balances (
  employee_id, leave_type_id, year, entitled_days, used_days, carried_over, adjusted
)
SELECT
  e.id,
  lt.id,
  2026,
  lt.default_days_per_year,
  FLOOR(RANDOM() * 6)::INT,
  CASE WHEN lt.code = 'ANNUAL' THEN 5 ELSE 0 END,
  0
FROM hr_employees e
CROSS JOIN hr_leave_types lt
WHERE e.employment_status = 'active'
ON CONFLICT (employee_id, leave_type_id, year) DO UPDATE
SET
  entitled_days = EXCLUDED.entitled_days,
  used_days = EXCLUDED.used_days,
  carried_over = EXCLUDED.carried_over,
  adjusted = EXCLUDED.adjusted,
  updated_at = NOW();

-- Shifts
INSERT INTO hr_shifts (name, start_time, end_time, break_minutes, is_default, status)
SELECT v.name, v.start_time, v.end_time, v.break_minutes, v.is_default, 'active'
FROM (
  VALUES
    ('Morning Shift', TIME '08:00', TIME '16:00', 60, TRUE),
    ('Afternoon Shift', TIME '12:00', TIME '20:00', 60, FALSE),
    ('Night Shift', TIME '20:00', TIME '04:00', 45, FALSE)
) AS v(name, start_time, end_time, break_minutes, is_default)
WHERE NOT EXISTS (SELECT 1 FROM hr_shifts s WHERE s.name = v.name);

-- Review cycles
INSERT INTO hr_review_cycles (name, cycle_type, start_date, end_date, status, created_by)
SELECT v.name, v.cycle_type, v.start_date, v.end_date, v.status, 'hr-system'
FROM (
  VALUES
    ('2025 Annual Appraisal', 'annual', DATE '2025-01-01', DATE '2025-12-31', 'draft'),
    ('2026 Mid-Year Review', 'mid-year', DATE '2026-01-01', DATE '2026-06-30', 'draft'),
    ('2026 Annual Appraisal', 'annual', DATE '2026-01-01', DATE '2026-12-31', 'draft')
) AS v(name, cycle_type, start_date, end_date, status)
WHERE NOT EXISTS (SELECT 1 FROM hr_review_cycles rc WHERE rc.name = v.name);

-- Training courses
INSERT INTO hr_training_courses (
  code, title, category, delivery_mode, duration_hours, description, facilitator, is_mandatory, status
)
VALUES
  ('TRNG-001', 'Railway Safety Management Systems', 'safety', 'classroom', 40, 'Railway safety standards and management practices', 'Training Directorate', TRUE, 'active'),
  ('TRNG-002', 'Track Maintenance & Inspection', 'technical', 'classroom', 60, 'Track maintenance techniques and inspection protocols', 'Engineering School', FALSE, 'active'),
  ('TRNG-003', 'Signal & Telecommunications', 'technical', 'hybrid', 48, 'Railway signalling systems and telecom infrastructure', 'ICT Directorate', FALSE, 'active'),
  ('TRNG-004', 'Public Service Rules & Regulations', 'compliance', 'online', 16, 'Public service rules for civil servants', 'Admin & HR', TRUE, 'active'),
  ('TRNG-005', 'Cybersecurity Awareness', 'ict', 'online', 8, 'Information security best practices for all staff', 'ICT Directorate', TRUE, 'active')
ON CONFLICT (code) DO NOTHING;

-- Payroll periods
INSERT INTO hr_payroll_periods (
  label, start_date, end_date, pay_date, status, created_by, approved_by, approved_at
)
SELECT v.label, v.start_date, v.end_date, v.pay_date, v.status, 'finance-system', v.approved_by, v.approved_at
FROM (
  VALUES
    ('January 2026', DATE '2026-01-01', DATE '2026-01-31', DATE '2026-01-31', 'approved', 'finance.director', NOW()),
    ('February 2026', DATE '2026-02-01', DATE '2026-02-28', DATE '2026-02-28', 'approved', 'finance.director', NOW()),
    ('March 2026', DATE '2026-03-01', DATE '2026-03-31', DATE '2026-03-31', 'approved', 'finance.director', NOW()),
    ('April 2026', DATE '2026-04-01', DATE '2026-04-30', DATE '2026-04-30', 'draft', NULL, NULL)
) AS v(label, start_date, end_date, pay_date, status, approved_by, approved_at)
WHERE NOT EXISTS (SELECT 1 FROM hr_payroll_periods pp WHERE pp.label = v.label);
