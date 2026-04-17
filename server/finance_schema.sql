-- =============================================================
-- Finance & Accounts Schema
-- General Ledger, AP, AR, Budget, Treasury
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_fiscal_years (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  is_closed BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_chart_of_accounts (
  id SERIAL PRIMARY KEY,
  account_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  account_type TEXT NOT NULL,  -- asset, liability, equity, revenue, expense
  parent_account_id INT REFERENCES fin_chart_of_accounts(id) ON DELETE SET NULL,
  department_code TEXT,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  normal_balance TEXT NOT NULL DEFAULT 'debit',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_journal_entries (
  id SERIAL PRIMARY KEY,
  entry_ref TEXT NOT NULL UNIQUE,
  fiscal_year_id INT REFERENCES fin_fiscal_years(id),
  entry_date DATE NOT NULL,
  description TEXT NOT NULL,
  source_module TEXT,
  source_ref TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  prepared_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  posted_at TIMESTAMPTZ,
  reversed_by_entry_id INT REFERENCES fin_journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_journal_lines (
  id SERIAL PRIMARY KEY,
  journal_entry_id INT NOT NULL REFERENCES fin_journal_entries(id) ON DELETE CASCADE,
  account_id INT NOT NULL REFERENCES fin_chart_of_accounts(id),
  description TEXT,
  debit_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  department_code TEXT,
  cost_center TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Accounts Payable
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_vendors (
  id SERIAL PRIMARY KEY,
  vendor_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  bank_name TEXT,
  bank_account TEXT,
  payment_terms_days INT NOT NULL DEFAULT 30,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_ap_invoices (
  id SERIAL PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  vendor_id INT NOT NULL REFERENCES fin_vendors(id),
  po_number TEXT,
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  subtotal NUMERIC(16,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  amount_paid NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  gl_account_id INT REFERENCES fin_chart_of_accounts(id),
  department_code TEXT,
  description TEXT,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_ap_payments (
  id SERIAL PRIMARY KEY,
  payment_ref TEXT NOT NULL UNIQUE,
  invoice_id INT NOT NULL REFERENCES fin_ap_invoices(id) ON DELETE CASCADE,
  payment_date DATE NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  bank_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Accounts Receivable
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_customers (
  id SERIAL PRIMARY KEY,
  customer_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  credit_limit NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_ar_invoices (
  id SERIAL PRIMARY KEY,
  invoice_no TEXT NOT NULL UNIQUE,
  customer_id INT NOT NULL REFERENCES fin_customers(id),
  invoice_date DATE NOT NULL,
  due_date DATE NOT NULL,
  currency TEXT NOT NULL DEFAULT 'NGN',
  subtotal NUMERIC(16,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  amount_received NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_ar_receipts (
  id SERIAL PRIMARY KEY,
  receipt_ref TEXT NOT NULL UNIQUE,
  invoice_id INT NOT NULL REFERENCES fin_ar_invoices(id) ON DELETE CASCADE,
  receipt_date DATE NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  payment_method TEXT NOT NULL DEFAULT 'bank_transfer',
  bank_reference TEXT,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Budget
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_budget_heads (
  id SERIAL PRIMARY KEY,
  fiscal_year_id INT NOT NULL REFERENCES fin_fiscal_years(id),
  account_id INT NOT NULL REFERENCES fin_chart_of_accounts(id),
  department_code TEXT NOT NULL,
  original_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  revised_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  actual_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  committed_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fiscal_year_id, account_id, department_code)
);

CREATE TABLE IF NOT EXISTS fin_budget_submissions (
  id SERIAL PRIMARY KEY,
  fiscal_year_id INT NOT NULL REFERENCES fin_fiscal_years(id),
  department_code TEXT NOT NULL,
  department_name TEXT NOT NULL,
  submission_date DATE,
  amount NUMERIC(16,2),
  prev_year_amount NUMERIC(16,2),
  variance_pct NUMERIC(7,2),
  status TEXT NOT NULL DEFAULT 'pending',
  justification TEXT,
  review_note TEXT,
  reviewed_by TEXT,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (fiscal_year_id, department_code)
);

CREATE TABLE IF NOT EXISTS fin_budget_submission_actions (
  id SERIAL PRIMARY KEY,
  submission_id INT NOT NULL REFERENCES fin_budget_submissions(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  note TEXT,
  actor TEXT NOT NULL DEFAULT 'system',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_budget_virements (
  id SERIAL PRIMARY KEY,
  virement_ref TEXT NOT NULL UNIQUE,
  fiscal_year_id INT NOT NULL REFERENCES fin_fiscal_years(id),
  from_line TEXT NOT NULL,
  to_line TEXT NOT NULL,
  amount NUMERIC(16,2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  requested_by TEXT NOT NULL,
  approval_level TEXT NOT NULL,
  approver TEXT,
  decision_note TEXT,
  approved_at TIMESTAMPTZ,
  rejected_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Treasury / Cash Management
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_bank_accounts (
  id SERIAL PRIMARY KEY,
  account_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL DEFAULT 'current',
  currency TEXT NOT NULL DEFAULT 'NGN',
  gl_account_id INT REFERENCES fin_chart_of_accounts(id),
  opening_balance NUMERIC(16,2) NOT NULL DEFAULT 0,
  current_balance NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS fin_bank_transactions (
  id SERIAL PRIMARY KEY,
  bank_account_id INT NOT NULL REFERENCES fin_bank_accounts(id),
  transaction_date DATE NOT NULL,
  value_date DATE,
  description TEXT NOT NULL,
  reference TEXT,
  debit_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  credit_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  running_balance NUMERIC(16,2),
  is_reconciled BOOLEAN NOT NULL DEFAULT FALSE,
  reconciled_journal_id INT REFERENCES fin_journal_entries(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Fixed Assets
-- =============================================================

CREATE TABLE IF NOT EXISTS fin_fixed_assets (
  id SERIAL PRIMARY KEY,
  asset_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  department_code TEXT,
  acquisition_date DATE NOT NULL,
  acquisition_cost NUMERIC(16,2) NOT NULL,
  useful_life_months INT NOT NULL,
  salvage_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  accumulated_depreciation NUMERIC(16,2) NOT NULL DEFAULT 0,
  net_book_value NUMERIC(16,2) NOT NULL DEFAULT 0,
  depreciation_method TEXT NOT NULL DEFAULT 'straight_line',
  location TEXT,
  custodian TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  disposed_at DATE,
  disposal_proceeds NUMERIC(16,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_fin_coa_type ON fin_chart_of_accounts(account_type, is_active);
CREATE INDEX IF NOT EXISTS idx_fin_je_date ON fin_journal_entries(entry_date, status);
CREATE INDEX IF NOT EXISTS idx_fin_jl_entry ON fin_journal_lines(journal_entry_id);
CREATE INDEX IF NOT EXISTS idx_fin_ap_vendor ON fin_ap_invoices(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_ar_customer ON fin_ar_invoices(customer_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_budget_year ON fin_budget_heads(fiscal_year_id, department_code);
CREATE INDEX IF NOT EXISTS idx_fin_budget_submissions_year ON fin_budget_submissions(fiscal_year_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_budget_virements_year ON fin_budget_virements(fiscal_year_id, status);
CREATE INDEX IF NOT EXISTS idx_fin_bank_txn ON fin_bank_transactions(bank_account_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_fin_assets_dept ON fin_fixed_assets(department_code, status);
