-- =============================================================
-- Procurement Schema
-- Requisitions, Purchase Orders, Vendors, GRN
-- =============================================================

CREATE TABLE IF NOT EXISTS proc_vendors (
  id SERIAL PRIMARY KEY,
  vendor_code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  category TEXT,
  contact_person TEXT,
  email TEXT,
  phone TEXT,
  address TEXT,
  tax_id TEXT,
  registration_date DATE,
  rating NUMERIC(3,1),
  compliance_status TEXT NOT NULL DEFAULT 'pending',
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_purchase_requisitions (
  id SERIAL PRIMARY KEY,
  pr_number TEXT NOT NULL UNIQUE,
  department_code TEXT NOT NULL,
  requested_by TEXT NOT NULL,
  description TEXT NOT NULL,
  justification TEXT,
  budget_code TEXT,
  estimated_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  priority TEXT NOT NULL DEFAULT 'normal',
  needed_by DATE,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_pr_items (
  id SERIAL PRIMARY KEY,
  requisition_id INT NOT NULL REFERENCES proc_purchase_requisitions(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  estimated_unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  specifications TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_tenders (
  id SERIAL PRIMARY KEY,
  tender_ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  requisition_id INT REFERENCES proc_purchase_requisitions(id),
  tender_type TEXT NOT NULL DEFAULT 'open',
  budget_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  opening_date DATE NOT NULL,
  closing_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  evaluation_criteria TEXT,
  created_by TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_tender_bids (
  id SERIAL PRIMARY KEY,
  tender_id INT NOT NULL REFERENCES proc_tenders(id) ON DELETE CASCADE,
  vendor_id INT NOT NULL REFERENCES proc_vendors(id),
  bid_amount NUMERIC(16,2) NOT NULL,
  technical_score NUMERIC(5,1),
  financial_score NUMERIC(5,1),
  total_score NUMERIC(5,1),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status TEXT NOT NULL DEFAULT 'submitted',
  evaluation_notes TEXT
);

CREATE TABLE IF NOT EXISTS proc_purchase_orders (
  id SERIAL PRIMARY KEY,
  po_number TEXT NOT NULL UNIQUE,
  vendor_id INT NOT NULL REFERENCES proc_vendors(id),
  requisition_id INT REFERENCES proc_purchase_requisitions(id),
  tender_id INT REFERENCES proc_tenders(id),
  order_date DATE NOT NULL,
  delivery_date DATE,
  payment_terms TEXT,
  currency TEXT NOT NULL DEFAULT 'NGN',
  subtotal NUMERIC(16,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  total_amount NUMERIC(16,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'draft',
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_po_items (
  id SERIAL PRIMARY KEY,
  po_id INT NOT NULL REFERENCES proc_purchase_orders(id) ON DELETE CASCADE,
  item_description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit TEXT NOT NULL DEFAULT 'pcs',
  unit_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(14,2) NOT NULL DEFAULT 0,
  received_qty INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_goods_received (
  id SERIAL PRIMARY KEY,
  grn_number TEXT NOT NULL UNIQUE,
  po_id INT NOT NULL REFERENCES proc_purchase_orders(id),
  received_date DATE NOT NULL,
  received_by TEXT NOT NULL,
  inspection_status TEXT NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS proc_grn_items (
  id SERIAL PRIMARY KEY,
  grn_id INT NOT NULL REFERENCES proc_goods_received(id) ON DELETE CASCADE,
  po_item_id INT NOT NULL REFERENCES proc_po_items(id),
  quantity_received INT NOT NULL,
  quantity_accepted INT NOT NULL DEFAULT 0,
  quantity_rejected INT NOT NULL DEFAULT 0,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- ICT Asset & Ticket Management
-- =============================================================

CREATE TABLE IF NOT EXISTS ict_tickets (
  id SERIAL PRIMARY KEY,
  ticket_ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'P3',
  status TEXT NOT NULL DEFAULT 'open',
  ticket_type TEXT NOT NULL DEFAULT 'incident',
  raised_by TEXT NOT NULL,
  assigned_to TEXT,
  department TEXT,
  sla_target_hours INT,
  resolved_at TIMESTAMPTZ,
  resolution_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ict_assets (
  id SERIAL PRIMARY KEY,
  asset_tag TEXT NOT NULL UNIQUE,
  asset_type TEXT NOT NULL,
  make_model TEXT NOT NULL,
  serial_number TEXT,
  assigned_to TEXT,
  department TEXT,
  location TEXT,
  status TEXT NOT NULL DEFAULT 'active',
  purchase_date DATE,
  warranty_expiry DATE,
  purchase_cost NUMERIC(14,2),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ict_change_requests (
  id SERIAL PRIMARY KEY,
  change_ref TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  description TEXT,
  change_type TEXT NOT NULL DEFAULT 'normal',
  risk_level TEXT NOT NULL DEFAULT 'low',
  status TEXT NOT NULL DEFAULT 'submitted',
  scheduled_date TIMESTAMPTZ,
  implementation_plan TEXT,
  rollback_plan TEXT,
  requested_by TEXT NOT NULL,
  approved_by TEXT,
  approved_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ict_systems (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  host TEXT,
  db_engine TEXT,
  status TEXT NOT NULL DEFAULT 'operational',
  uptime_pct NUMERIC(5,2) NOT NULL DEFAULT 99.9,
  last_checked_at TIMESTAMPTZ,
  monitoring_url TEXT,
  owner TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Collaboration / Document Center
-- =============================================================

CREATE TABLE IF NOT EXISTS collab_workspaces (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  department TEXT,
  owner_email TEXT NOT NULL,
  member_count INT NOT NULL DEFAULT 1,
  file_count INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_workspace_members (
  id SERIAL PRIMARY KEY,
  workspace_id INT NOT NULL REFERENCES collab_workspaces(id) ON DELETE CASCADE,
  user_email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (workspace_id, user_email)
);

CREATE TABLE IF NOT EXISTS collab_documents (
  id SERIAL PRIMARY KEY,
  workspace_id INT REFERENCES collab_workspaces(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  file_url TEXT,
  file_type TEXT,
  file_size_bytes INT,
  department TEXT,
  uploaded_by TEXT NOT NULL,
  version INT NOT NULL DEFAULT 1,
  is_locked BOOLEAN NOT NULL DEFAULT FALSE,
  locked_by TEXT,
  tags TEXT[],
  status TEXT NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Whistleblower / Case Management
-- =============================================================

CREATE TABLE IF NOT EXISTS wb_cases (
  id SERIAL PRIMARY KEY,
  case_ref TEXT NOT NULL UNIQUE,
  report_type TEXT NOT NULL DEFAULT 'anonymous',
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  reporter_name TEXT,
  reporter_email TEXT,
  reporter_phone TEXT,
  evidence_urls TEXT[],
  department_involved TEXT,
  persons_involved TEXT,
  priority TEXT NOT NULL DEFAULT 'medium',
  status TEXT NOT NULL DEFAULT 'submitted',
  assigned_to TEXT,
  investigation_notes TEXT,
  resolution TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_case_timeline (
  id SERIAL PRIMARY KEY,
  case_id INT NOT NULL REFERENCES wb_cases(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  actor TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- =============================================================
-- Indexes
-- =============================================================

CREATE INDEX IF NOT EXISTS idx_proc_pr_status ON proc_purchase_requisitions(status, department_code);
CREATE INDEX IF NOT EXISTS idx_proc_po_vendor ON proc_purchase_orders(vendor_id, status);
CREATE INDEX IF NOT EXISTS idx_proc_tender_status ON proc_tenders(status, closing_date);
CREATE INDEX IF NOT EXISTS idx_ict_ticket_status ON ict_tickets(status, priority);
CREATE INDEX IF NOT EXISTS idx_ict_asset_dept ON ict_assets(department, status);
CREATE INDEX IF NOT EXISTS idx_collab_docs_workspace ON collab_documents(workspace_id, status);
CREATE INDEX IF NOT EXISTS idx_wb_case_status ON wb_cases(status, priority);
