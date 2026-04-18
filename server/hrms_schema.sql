-- =============================================================
-- NAPTIN HRMS Schema
-- Employee master, departments, positions, org hierarchy
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_departments (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  parent_department_id INT REFERENCES hr_departments(id) ON DELETE SET NULL,
  head_employee_id INT,  -- back-ref set after hr_employees created
  budget_code TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_positions (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  grade_level TEXT NOT NULL,
  department_id INT REFERENCES hr_departments(id) ON DELETE SET NULL,
  reports_to_position_id INT REFERENCES hr_positions(id) ON DELETE SET NULL,
  min_salary NUMERIC(14,2),
  max_salary NUMERIC(14,2),
  is_filled BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_employees (
  id SERIAL PRIMARY KEY,
  employee_id TEXT NOT NULL UNIQUE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  other_names TEXT,
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  gender TEXT,
  date_of_birth DATE,
  marital_status TEXT,
  nationality TEXT DEFAULT 'Nigerian',
  state_of_origin TEXT,
  lga TEXT,
  residential_address TEXT,
  department_id INT REFERENCES hr_departments(id) ON DELETE SET NULL,
  position_id INT REFERENCES hr_positions(id) ON DELETE SET NULL,
  grade_level TEXT,
  step INT DEFAULT 1,
  employment_type TEXT NOT NULL DEFAULT 'permanent',
  employment_status TEXT NOT NULL DEFAULT 'active',
  date_of_first_appointment DATE,
  date_of_current_appointment DATE,
  date_of_confirmation DATE,
  retirement_date DATE,
  supervisor_id INT REFERENCES hr_employees(id) ON DELETE SET NULL,
  bank_name TEXT,
  bank_account_no TEXT,
  bank_sort_code TEXT,
  tax_id TEXT,
  pension_pin TEXT,
  nhf_number TEXT,
  profile_photo_url TEXT,
  portal_display_name TEXT,
  portal_bio TEXT,
  office_location TEXT,
  portal_username TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- back-reference for department head
ALTER TABLE hr_departments
  DROP CONSTRAINT IF EXISTS fk_dept_head;
ALTER TABLE hr_departments
  ADD CONSTRAINT fk_dept_head FOREIGN KEY (head_employee_id)
  REFERENCES hr_employees(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS hr_employee_documents (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL,
  title TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INT,
  uploaded_by TEXT,
  expires_at DATE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_employee_history (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  description TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  effective_date DATE NOT NULL,
  recorded_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Leave Management
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_leave_types (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  default_days_per_year INT NOT NULL DEFAULT 0,
  carry_over_max INT NOT NULL DEFAULT 0,
  requires_document BOOLEAN NOT NULL DEFAULT FALSE,
  is_paid BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_leave_balances (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type_id INT NOT NULL REFERENCES hr_leave_types(id) ON DELETE CASCADE,
  year INT NOT NULL,
  entitled_days INT NOT NULL DEFAULT 0,
  used_days INT NOT NULL DEFAULT 0,
  carried_over INT NOT NULL DEFAULT 0,
  adjusted INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, leave_type_id, year)
);

CREATE TABLE IF NOT EXISTS hr_leave_requests (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  leave_type_id INT NOT NULL REFERENCES hr_leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  days_requested INT NOT NULL,
  reason TEXT,
  relief_officer_id INT REFERENCES hr_employees(id),
  status TEXT NOT NULL DEFAULT 'pending',
  reviewed_by INT REFERENCES hr_employees(id),
  review_comment TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Attendance
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_attendance (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  work_date DATE NOT NULL,
  clock_in TIMESTAMPTZ,
  clock_out TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'present',
  overtime_hours NUMERIC(4,1) NOT NULL DEFAULT 0,
  source TEXT DEFAULT 'manual',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, work_date)
);

CREATE TABLE IF NOT EXISTS hr_shifts (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL,
  break_minutes INT NOT NULL DEFAULT 60,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active'
);

-- =============================================================
-- Payroll
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_payroll_periods (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pay_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_earnings_types (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_taxable BOOLEAN NOT NULL DEFAULT TRUE,
  is_recurring BOOLEAN NOT NULL DEFAULT TRUE,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS hr_deduction_types (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_statutory BOOLEAN NOT NULL DEFAULT FALSE,
  calc_method TEXT NOT NULL DEFAULT 'fixed',
  calc_value NUMERIC(14,4) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active'
);

CREATE TABLE IF NOT EXISTS hr_payslips (
  id SERIAL PRIMARY KEY,
  payroll_period_id INT NOT NULL REFERENCES hr_payroll_periods(id) ON DELETE CASCADE,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  basic_salary NUMERIC(14,2) NOT NULL DEFAULT 0,
  gross_earnings NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_deductions NUMERIC(14,2) NOT NULL DEFAULT 0,
  net_pay NUMERIC(14,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  pension_employee NUMERIC(14,2) NOT NULL DEFAULT 0,
  pension_employer NUMERIC(14,2) NOT NULL DEFAULT 0,
  nhf NUMERIC(14,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (payroll_period_id, employee_id)
);

CREATE TABLE IF NOT EXISTS hr_payslip_lines (
  id SERIAL PRIMARY KEY,
  payslip_id INT NOT NULL REFERENCES hr_payslips(id) ON DELETE CASCADE,
  line_type TEXT NOT NULL,  -- 'earning' or 'deduction'
  type_code TEXT NOT NULL,
  description TEXT NOT NULL,
  amount NUMERIC(14,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Recruitment / ATS
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_job_openings (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  department_id INT REFERENCES hr_departments(id),
  position_id INT REFERENCES hr_positions(id),
  grade_level TEXT,
  employment_type TEXT NOT NULL DEFAULT 'permanent',
  vacancies INT NOT NULL DEFAULT 1,
  description TEXT,
  requirements TEXT,
  salary_range_min NUMERIC(14,2),
  salary_range_max NUMERIC(14,2),
  closing_date DATE,
  status TEXT NOT NULL DEFAULT 'open',
  posted_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_candidates (
  id SERIAL PRIMARY KEY,
  job_opening_id INT NOT NULL REFERENCES hr_job_openings(id) ON DELETE CASCADE,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  cv_url TEXT,
  pipeline_stage TEXT NOT NULL DEFAULT 'applied',
  rating INT,
  notes TEXT,
  source TEXT DEFAULT 'portal',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_interviews (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES hr_candidates(id) ON DELETE CASCADE,
  interviewer_name TEXT NOT NULL,
  interview_type TEXT NOT NULL DEFAULT 'panel',
  scheduled_at TIMESTAMPTZ NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 60,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled',
  feedback TEXT,
  score INT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_onboarding_checklists (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  task_title TEXT NOT NULL,
  assigned_to TEXT,
  due_date DATE,
  status TEXT NOT NULL DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Performance Management
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_review_cycles (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  cycle_type TEXT NOT NULL DEFAULT 'annual',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_goals (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  review_cycle_id INT REFERENCES hr_review_cycles(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  weight_pct INT NOT NULL DEFAULT 20,
  target_value TEXT,
  actual_value TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  self_rating INT,
  manager_rating INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_performance_reviews (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  review_cycle_id INT NOT NULL REFERENCES hr_review_cycles(id) ON DELETE CASCADE,
  reviewer_id INT REFERENCES hr_employees(id),
  overall_rating NUMERIC(3,1),
  self_assessment TEXT,
  manager_assessment TEXT,
  development_plan TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, review_cycle_id)
);

-- =============================================================
-- Training / LMS
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_training_courses (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  delivery_mode TEXT NOT NULL DEFAULT 'classroom',
  duration_hours INT NOT NULL DEFAULT 8,
  description TEXT,
  facilitator TEXT,
  max_participants INT,
  is_mandatory BOOLEAN NOT NULL DEFAULT FALSE,
  certification_required BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_training_sessions (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL REFERENCES hr_training_courses(id) ON DELETE CASCADE,
  venue TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  facilitator TEXT,
  capacity INT,
  enrolled_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'scheduled',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_training_enrollments (
  id SERIAL PRIMARY KEY,
  session_id INT NOT NULL REFERENCES hr_training_sessions(id) ON DELETE CASCADE,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'enrolled',
  attendance_confirmed BOOLEAN NOT NULL DEFAULT FALSE,
  score NUMERIC(5,2),
  certificate_url TEXT,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (session_id, employee_id)
);

CREATE TABLE IF NOT EXISTS hr_certifications (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  issuer TEXT,
  issued_date DATE NOT NULL,
  expiry_date DATE,
  certificate_url TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Benefits
-- =============================================================

CREATE TABLE IF NOT EXISTS hr_benefit_plans (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  provider TEXT,
  employer_contribution NUMERIC(14,2) NOT NULL DEFAULT 0,
  employee_contribution NUMERIC(14,2) NOT NULL DEFAULT 0,
  eligibility_rule TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS hr_benefit_enrollments (
  id SERIAL PRIMARY KEY,
  employee_id INT NOT NULL REFERENCES hr_employees(id) ON DELETE CASCADE,
  plan_id INT NOT NULL REFERENCES hr_benefit_plans(id) ON DELETE CASCADE,
  enrolled_date DATE NOT NULL,
  coverage_start DATE NOT NULL,
  coverage_end DATE,
  dependents_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (employee_id, plan_id)
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_hr_emp_dept ON hr_employees(department_id, employment_status);
CREATE INDEX IF NOT EXISTS idx_hr_emp_email ON hr_employees(email);
CREATE INDEX IF NOT EXISTS idx_hr_emp_supervisor ON hr_employees(supervisor_id);
CREATE INDEX IF NOT EXISTS idx_hr_leave_req_emp ON hr_leave_requests(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_hr_attendance_emp_date ON hr_attendance(employee_id, work_date);
CREATE INDEX IF NOT EXISTS idx_hr_payslip_period ON hr_payslips(payroll_period_id, employee_id);
CREATE INDEX IF NOT EXISTS idx_hr_candidates_job ON hr_candidates(job_opening_id, pipeline_stage);
CREATE INDEX IF NOT EXISTS idx_hr_goals_emp ON hr_goals(employee_id, review_cycle_id);
CREATE INDEX IF NOT EXISTS idx_hr_enrollments_session ON hr_training_enrollments(session_id, employee_id);
