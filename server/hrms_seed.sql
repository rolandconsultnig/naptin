-- NAPTIN HRMS Seed Data
-- Realistic Nigerian civil service data for demonstration

-- Departments
INSERT INTO hr_departments (code, name, parent_code, director_name) VALUES
  ('DG',   'Director General''s Office',     NULL,    'Dr. Binta Adamu'),
  ('ADMIN','Administration & HR',            'DG',    'Hajia Fatima Musa'),
  ('FIN',  'Finance & Accounts',             'DG',    'Mr. Chukwuemeka Obi'),
  ('TRNG', 'Training & Development',         'DG',    'Dr. Olumide Akinola'),
  ('ICT',  'Information & Communications Technology','DG','Engr. Yusuf Bello'),
  ('PROC', 'Procurement & Stores',           'DG',    'Mrs. Ngozi Eze'),
  ('OPS',  'Operations & Compliance',        'DG',    'Mr. Abdulrahman Suleiman'),
  ('LEGAL','Legal Services',                 'DG',    'Barr. Amina Yakubu'),
  ('AUDIT','Internal Audit',                 'DG',    'Mr. Tunde Fashola')
ON CONFLICT DO NOTHING;

-- Positions
INSERT INTO hr_positions (title, grade_level, step, department_code, is_active) VALUES
  ('Director General',    17, 1, 'DG',    TRUE),
  ('Director',            16, 1, 'ADMIN', TRUE),
  ('Director',            16, 1, 'FIN',   TRUE),
  ('Director',            16, 1, 'TRNG',  TRUE),
  ('Director',            16, 1, 'ICT',   TRUE),
  ('Deputy Director',     15, 1, 'ADMIN', TRUE),
  ('Deputy Director',     15, 1, 'FIN',   TRUE),
  ('Assistant Director',  14, 1, 'ADMIN', TRUE),
  ('Assistant Director',  14, 1, 'TRNG',  TRUE),
  ('Principal Officer',   13, 1, 'FIN',   TRUE),
  ('Principal Officer',   13, 1, 'ICT',   TRUE),
  ('Senior Officer',      12, 1, 'ADMIN', TRUE),
  ('Senior Officer',      12, 1, 'TRNG',  TRUE),
  ('Officer I',           10, 1, 'ICT',   TRUE),
  ('Officer I',           10, 1, 'PROC',  TRUE),
  ('Officer II',           9, 1, 'FIN',   TRUE),
  ('Officer II',           9, 1, 'ADMIN', TRUE),
  ('Administrative Asst',  7, 1, 'ADMIN', TRUE),
  ('Clerical Officer',     5, 1, 'ADMIN', TRUE),
  ('Driver',               3, 1, 'OPS',   TRUE)
ON CONFLICT DO NOTHING;

-- Employees
INSERT INTO hr_employees (
  staff_id, first_name, last_name, other_names, email, phone,
  gender, date_of_birth, marital_status, state_of_origin, lga,
  residential_address, department_code, position_id, grade_level, step,
  date_of_first_appointment, date_of_current_appointment,
  employment_type, employment_status, bank_name, bank_account_no, bvn,
  nin, pension_pin, tax_id
) VALUES
  ('NAPTIN/001', 'Binta',      'Adamu',     'Halima',   'binta.adamu@naptin.gov.ng',    '08031234567', 'female', '1968-03-15', 'married', 'Kaduna',   'Kaduna North',  '12 Ahmadu Bello Way, Kaduna',                 'DG',    1,  17, 1, '1995-07-01', '2020-01-15', 'permanent', 'active', 'First Bank',    '2012345678', '22112233445', '12345678901', 'PEN100001234567', 'TIN0001234'),
  ('NAPTIN/002', 'Fatima',     'Musa',      NULL,       'fatima.musa@naptin.gov.ng',     '08037654321', 'female', '1972-08-22', 'married', 'Kano',     'Nassarawa',     '45 Zoo Road, Kano',                           'ADMIN', 2,  16, 3, '1998-10-01', '2019-04-01', 'permanent', 'active', 'GTBank',        '0123456789', '22334455667', '23456789012', 'PEN100002345678', 'TIN0002345'),
  ('NAPTIN/003', 'Chukwuemeka','Obi',       'Nnaemeka', 'chukwuemeka.obi@naptin.gov.ng', '08054321987', 'male',   '1970-12-05', 'married', 'Anambra',  'Onitsha North', '7 New Market Road, Onitsha',                  'FIN',   3,  16, 5, '1997-03-15', '2018-09-01', 'permanent', 'active', 'Zenith Bank',   '1023456789', '33445566778', '34567890123', 'PEN100003456789', 'TIN0003456'),
  ('NAPTIN/004', 'Olumide',    'Akinola',   'Babatunde','olumide.akinola@naptin.gov.ng', '08098765432', 'male',   '1975-06-18', 'single',  'Oyo',      'Ibadan North',  '23 Ring Road, Ibadan',                        'TRNG',  4,  16, 2, '2000-01-10', '2019-11-15', 'permanent', 'active', 'UBA',           '2034567890', '44556677889', '45678901234', 'PEN100004567890', 'TIN0004567'),
  ('NAPTIN/005', 'Yusuf',      'Bello',     NULL,       'yusuf.bello@naptin.gov.ng',     '08076543210', 'male',   '1978-01-30', 'married', 'Niger',    'Minna',         '5 Paiko Road, Minna',                         'ICT',   5,  16, 1, '2002-06-01', '2021-03-01', 'permanent', 'active', 'Access Bank',   '0145678901', '55667788990', '56789012345', 'PEN100005678901', 'TIN0005678'),
  ('NAPTIN/006', 'Amaka',      'Nwosu',     'Chidinma', 'amaka.nwosu@naptin.gov.ng',     '08012349876', 'female', '1980-09-12', 'married', 'Imo',      'Owerri Municipal','14 Wetheral Road, Owerri',                   'ADMIN', 6,  15, 2, '2004-04-15', '2020-07-01', 'permanent', 'active', 'Fidelity Bank', '3056789012', '66778899001', '67890123456', 'PEN100006789012', 'TIN0006789'),
  ('NAPTIN/007', 'Ibrahim',    'Danjuma',   NULL,       'ibrahim.danjuma@naptin.gov.ng', '08023456789', 'male',   '1982-04-25', 'married', 'Taraba',   'Jalingo',       '8 Hospital Road, Jalingo',                    'FIN',   7,  15, 1, '2005-09-01', '2021-01-15', 'permanent', 'active', 'Union Bank',    '0167890123', '77889900112', '78901234567', 'PEN100007890123', 'TIN0007890'),
  ('NAPTIN/008', 'Adebayo',    'Ogundimu',  'Kunle',    'adebayo.ogundimu@naptin.gov.ng','08045678901', 'male',   '1983-11-08', 'single',  'Lagos',    'Ikeja',         '33 Allen Avenue, Ikeja, Lagos',               'ADMIN', 8,  14, 3, '2007-02-01', '2020-09-01', 'permanent', 'active', 'Stanbic IBTC',  '0278901234', '88990011223', '89012345678', 'PEN100008901234', 'TIN0008901'),
  ('NAPTIN/009', 'Halima',     'Abubakar',  NULL,       'halima.abubakar@naptin.gov.ng', '08067890123', 'female', '1985-07-20', 'married', 'Bauchi',   'Bauchi',        '16 Yandoka Road, Bauchi',                     'TRNG',  9,  14, 1, '2008-05-15', '2022-03-01', 'permanent', 'active', 'Polaris Bank',  '1089012345', '99001122334', '90123456789', 'PEN100009012345', 'TIN0009012'),
  ('NAPTIN/010', 'Emeka',      'Okoro',     'Chidi',    'emeka.okoro@naptin.gov.ng',     '08089012345', 'male',   '1986-02-14', 'married', 'Enugu',    'Enugu North',   '9 Chime Avenue, Enugu',                       'FIN',   10, 13, 2, '2009-10-01', '2021-06-15', 'permanent', 'active', 'Ecobank',       '4090123456', '10112233445', '01234567890', 'PEN100010123456', 'TIN0010123'),
  ('NAPTIN/011', 'Bashir',     'Mohammed',  NULL,       'bashir.mohammed@naptin.gov.ng', '08011223344', 'male',   '1987-05-03', 'married', 'Sokoto',   'Sokoto South',  '21 Sultan Ibrahim Road, Sokoto',              'ICT',   11, 13, 1, '2010-01-15', '2022-07-01', 'permanent', 'active', 'Keystone Bank', '0101234567', '21223344556', '12345678902', 'PEN100011234567', 'TIN0011234'),
  ('NAPTIN/012', 'Aisha',      'Garba',     'Zainab',   'aisha.garba@naptin.gov.ng',     '08033445566', 'female', '1988-10-17', 'single',  'Borno',    'Maiduguri',     '4 Shehu Lamido Way, Maiduguri',               'ADMIN', 12, 12, 3, '2012-03-01', '2021-11-01', 'permanent', 'active', 'FCMB',          '2112345678', '32334455667', '23456789013', 'PEN100012345678', 'TIN0012345'),
  ('NAPTIN/013', 'Samuel',     'Adeyemi',   'Oladimeji','samuel.adeyemi@naptin.gov.ng',  '08055667788', 'male',   '1990-01-28', 'married', 'Ekiti',    'Ado Ekiti',     '18 Fajuyi Street, Ado Ekiti',                 'TRNG',  13, 12, 1, '2013-08-15', '2023-01-15', 'permanent', 'active', 'Heritage Bank', '0223456789', '43445566778', '34567890124', 'PEN100013456789', 'TIN0013456'),
  ('NAPTIN/014', 'Grace',      'Okafor',    NULL,       'grace.okafor@naptin.gov.ng',    '08077889900', 'female', '1991-06-09', 'single',  'Delta',    'Asaba',         '6 Nnebisi Road, Asaba',                       'ICT',   14, 10, 2, '2015-04-01', '2023-04-01', 'permanent', 'active', 'Wema Bank',     '3234567890', '54556677889', '45678901235', 'PEN100014567890', 'TIN0014567'),
  ('NAPTIN/015', 'Musa',       'Aliyu',     NULL,       'musa.aliyu@naptin.gov.ng',      '08099001122', 'male',   '1992-12-01', 'married', 'Kwara',    'Ilorin South',  '30 Ibrahim Taiwo Road, Ilorin',               'PROC',  15, 10, 1, '2016-09-15', '2023-09-15', 'permanent', 'active', 'Sterling Bank', '0345678901', '65667788990', '56789012346', 'PEN100015678901', 'TIN0015678'),
  ('NAPTIN/016', 'Ngozi',      'Eze',       'Chioma',   'ngozi.eze@naptin.gov.ng',       '08011334455', 'female', '1976-04-11', 'married', 'Abia',     'Umuahia North', '12 Azikiwe Road, Umuahia',                    'PROC',  NULL, 16, 1, '1999-11-01', '2019-05-15', 'permanent', 'active', 'Diamond Bank',  '1456789012', '76778899001', '67890123457', 'PEN100016789012', 'TIN0016789'),
  ('NAPTIN/017', 'Abdulrahman','Suleiman',  NULL,       'abdulrahman.suleiman@naptin.gov.ng','08022445566','male','1974-07-22', 'married', 'Plateau',  'Jos North',     '8 Tafawa Balewa Street, Jos',                 'OPS',   NULL, 16, 2, '1998-06-01', '2018-12-01', 'permanent', 'active', 'Unity Bank',    '2567890123', '87889900112', '78901234568', 'PEN100017890123', 'TIN0017890'),
  ('NAPTIN/018', 'Tunde',      'Fashola',   'Adekunle', 'tunde.fashola@naptin.gov.ng',   '08044556677', 'male',   '1979-09-30', 'married', 'Osun',     'Osogbo',        '15 Station Road, Osogbo',                     'AUDIT', NULL, 15, 4, '2003-02-15', '2020-08-01', 'permanent', 'active', 'Jaiz Bank',     '0678901234', '98990011223', '89012345679', 'PEN100018901234', 'TIN0018901'),
  ('NAPTIN/019', 'Blessing',   'Umeh',      NULL,       'blessing.umeh@naptin.gov.ng',   '08066778899', 'female', '1993-03-14', 'single',  'Edo',      'Benin City',    '24 Airport Road, Benin City',                 'FIN',   16,  9, 1, '2018-01-10', '2024-01-10', 'permanent', 'active', 'Providus Bank', '3789012345', '09001122334', '90123456780', 'PEN100019012345', 'TIN0019012'),
  ('NAPTIN/020', 'Yakubu',     'Ndagi',     NULL,       'yakubu.ndagi@naptin.gov.ng',    '08088990011', 'male',   '1994-08-05', 'single',  'Niger',    'Bida',          '3 Nupe Road, Bida',                           'ADMIN', 17,  9, 1, '2019-06-01', '2024-06-01', 'permanent', 'active', 'TAJBank',       '0890123456', '10012233445', '01234567891', 'PEN100020123456', 'TIN0020123')
ON CONFLICT DO NOTHING;

-- Leave Types
INSERT INTO hr_leave_types (name, default_days, carry_over_limit, requires_attachment, description) VALUES
  ('Annual Leave',       30, 10, FALSE, 'Standard annual leave for all permanent staff'),
  ('Sick Leave',         14,  0, TRUE,  'Medical leave with doctor''s certificate'),
  ('Maternity Leave',    90,  0, TRUE,  'For female staff; requires medical certificate'),
  ('Paternity Leave',    14,  0, TRUE,  'For male staff on birth of child'),
  ('Study Leave',        30,  0, TRUE,  'For approved academic programmes'),
  ('Casual Leave',        5,  0, FALSE, 'Short absence for personal matters'),
  ('Compassionate Leave', 7,  0, FALSE, 'Bereavement or family emergency'),
  ('Examination Leave',  10,  0, TRUE,  'For professional examinations')
ON CONFLICT DO NOTHING;

-- Leave Balances for current year
INSERT INTO hr_leave_balances (employee_id, leave_type_id, year, entitled_days, used_days, pending_days)
SELECT e.id, lt.id, 2026,
  CASE WHEN lt.name = 'Annual Leave' THEN 30
       WHEN lt.name = 'Sick Leave' THEN 14
       WHEN lt.name = 'Casual Leave' THEN 5
       ELSE lt.default_days END,
  FLOOR(RANDOM() * 8),
  FLOOR(RANDOM() * 3)
FROM hr_employees e
CROSS JOIN hr_leave_types lt
WHERE e.employment_status = 'active'
ON CONFLICT DO NOTHING;

-- Shifts
INSERT INTO hr_shifts (name, start_time, end_time, is_default) VALUES
  ('Morning Shift',  '08:00', '16:00', TRUE),
  ('Afternoon Shift','12:00', '20:00', FALSE),
  ('Night Shift',    '20:00', '04:00', FALSE)
ON CONFLICT DO NOTHING;

-- Review Cycles
INSERT INTO hr_review_cycles (name, start_date, end_date, status) VALUES
  ('2025 Annual Appraisal',  '2025-01-01', '2025-12-31', 'closed'),
  ('2026 Mid-Year Review',   '2026-01-01', '2026-06-30', 'active'),
  ('2026 Annual Appraisal',  '2026-01-01', '2026-12-31', 'planning')
ON CONFLICT DO NOTHING;

-- Training Courses
INSERT INTO hr_training_courses (code, title, category, delivery_method, duration_hours, description) VALUES
  ('TRNG-001', 'Railway Safety Management Systems',  'safety',    'classroom', 40, 'Comprehensive railway safety standards and management practices'),
  ('TRNG-002', 'Track Maintenance & Inspection',     'technical', 'classroom', 60, 'Modern track maintenance techniques and inspection protocols'),
  ('TRNG-003', 'Signal & Telecommunications',         'technical', 'hybrid',    48, 'Railway signalling systems and telecom infrastructure'),
  ('TRNG-004', 'Public Service Rules & Regulations',  'compliance','online',    16, 'Nigerian public service rules for civil servants'),
  ('TRNG-005', 'Project Management Professional',     'management','classroom', 35, 'PMP preparation course for project managers'),
  ('TRNG-006', 'Cybersecurity Awareness',             'ict',       'online',    8,  'Information security best practices for all staff'),
  ('TRNG-007', 'Financial Management & Budgeting',    'finance',   'classroom', 24, 'Government financial regulations and budget management'),
  ('TRNG-008', 'Leadership & Team Management',        'management','hybrid',    20, 'Leadership skills for supervisors and managers'),
  ('TRNG-009', 'Locomotive Operations',               'technical', 'classroom', 80, 'Diesel and electric locomotive operations and maintenance'),
  ('TRNG-010', 'First Aid & Emergency Response',      'safety',    'classroom', 16, 'Emergency response procedures for railway incidents')
ON CONFLICT DO NOTHING;

-- Payroll Periods
INSERT INTO hr_payroll_periods (label, start_date, end_date, status) VALUES
  ('January 2026',  '2026-01-01', '2026-01-31', 'approved'),
  ('February 2026', '2026-02-01', '2026-02-28', 'approved'),
  ('March 2026',    '2026-03-01', '2026-03-31', 'approved'),
  ('April 2026',    '2026-04-01', '2026-04-30', 'draft')
ON CONFLICT DO NOTHING;
