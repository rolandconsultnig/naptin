-- =============================================================
-- Cash Advance Management Schema
-- Employee Cash Advance Request, Disbursement, Retirement, Settlement
-- =============================================================

-- Main advance request table
CREATE TABLE IF NOT EXISTS ca_advances (
  id                            SERIAL PRIMARY KEY,
  voucher_id                    TEXT NOT NULL UNIQUE,          -- e.g. CA-2026-0042
  employee_id                   TEXT NOT NULL,
  employee_name                 TEXT NOT NULL,
  department_code               TEXT NOT NULL,
  purpose                       TEXT NOT NULL,
  project_code                  TEXT,
  expected_amount               NUMERIC(16,2) NOT NULL,
  disbursed_amount              NUMERIC(16,2),
  actual_amount                 NUMERIC(16,2),                 -- total from retirement expense lines
  variance                      NUMERIC(16,2),                 -- actual - disbursed (negative = owed back)
  -- Status lifecycle:
  -- draft → pending_approval → approved → disbursed → retired → (variance_review?) → settled
  -- or → rejected / cancelled at any pre-disbursement stage
  status                        TEXT NOT NULL DEFAULT 'draft',
  proposed_retirement_date      DATE NOT NULL,
  request_date                  DATE NOT NULL DEFAULT CURRENT_DATE,
  -- Approval chain
  approved_by_manager           TEXT,
  approved_by_manager_at        TIMESTAMPTZ,
  approved_by_finance           TEXT,
  approved_by_finance_at        TIMESTAMPTZ,
  rejection_reason              TEXT,
  -- Disbursement
  disbursed_by                  TEXT,
  disbursed_at                  TIMESTAMPTZ,
  -- Retirement
  retired_at                    TIMESTAMPTZ,
  retirement_notes              TEXT,
  -- Settlement
  settled_at                    TIMESTAMPTZ,
  settled_by                    TEXT,
  settlement_method             TEXT,     -- cash_return | salary_deduction | reimbursement | combined
  cash_returned                 NUMERIC(16,2) DEFAULT 0,
  reimbursement_amount          NUMERIC(16,2) DEFAULT 0,
  payroll_deduction_amount      NUMERIC(16,2) DEFAULT 0,
  payroll_deduction_ref         TEXT,
  finance_notes                 TEXT,
  -- GL Journal linking
  disbursement_journal_id       INT REFERENCES fin_journal_entries(id) ON DELETE SET NULL,
  settlement_journal_id         INT REFERENCES fin_journal_entries(id) ON DELETE SET NULL,
  created_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at                    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Expense line items submitted during retirement
CREATE TABLE IF NOT EXISTS ca_expense_lines (
  id            SERIAL PRIMARY KEY,
  advance_id    INT NOT NULL REFERENCES ca_advances(id) ON DELETE CASCADE,
  expense_date  DATE NOT NULL,
  vendor_name   TEXT NOT NULL,
  category      TEXT NOT NULL,   -- travel | supplies | meals | accommodation | repairs | other
  description   TEXT NOT NULL,
  amount        NUMERIC(16,2) NOT NULL,
  tax_amount    NUMERIC(16,2) NOT NULL DEFAULT 0,
  receipt_ref   TEXT,             -- filename/reference for uploaded receipt
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Full approval & action audit trail
CREATE TABLE IF NOT EXISTS ca_approval_log (
  id          SERIAL PRIMARY KEY,
  advance_id  INT NOT NULL REFERENCES ca_advances(id) ON DELETE CASCADE,
  stage       TEXT NOT NULL,  -- request | manager_approval | finance_approval | disbursement | retirement | variance_review | settlement
  action      TEXT NOT NULL,  -- submitted | approved | rejected | disbursed | retired | settled | auto_deduction_triggered
  actor       TEXT NOT NULL,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Automated alerts / escalation log
CREATE TABLE IF NOT EXISTS ca_alert_log (
  id          SERIAL PRIMARY KEY,
  advance_id  INT NOT NULL REFERENCES ca_advances(id) ON DELETE CASCADE,
  alert_type  TEXT NOT NULL,  -- d1_reminder | d7_escalation | d14_auto_deduction
  sent_to     TEXT NOT NULL,
  sent_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Indexes
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_ca_advances_employee  ON ca_advances(employee_id, status);
CREATE INDEX IF NOT EXISTS idx_ca_advances_status    ON ca_advances(status);
CREATE INDEX IF NOT EXISTS idx_ca_advances_dept      ON ca_advances(department_code);
CREATE INDEX IF NOT EXISTS idx_ca_expense_advance    ON ca_expense_lines(advance_id);
CREATE INDEX IF NOT EXISTS idx_ca_log_advance        ON ca_approval_log(advance_id);
