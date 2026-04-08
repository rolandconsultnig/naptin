CREATE TABLE IF NOT EXISTS wb_clients (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  crm_account_id TEXT UNIQUE,
  owner_email TEXT,
  status TEXT NOT NULL DEFAULT 'prospect',
  contract_start_date DATE,
  contract_end_date DATE,
  sla_summary TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_onboarding_records (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES wb_clients(id) ON DELETE CASCADE,
  specialist_email TEXT NOT NULL,
  product_type TEXT NOT NULL,
  scope_summary TEXT,
  milestone TEXT NOT NULL DEFAULT 'Contract Signed',
  progress_pct INT NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active',
  kickoff_due_at TIMESTAMPTZ,
  first_value_due_at TIMESTAMPTZ,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_onboarding_tasks (
  id SERIAL PRIMARY KEY,
  onboarding_id INT NOT NULL REFERENCES wb_onboarding_records(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_email TEXT,
  due_at TIMESTAMPTZ,
  client_visible BOOLEAN NOT NULL DEFAULT TRUE,
  client_action BOOLEAN NOT NULL DEFAULT FALSE,
  status TEXT NOT NULL DEFAULT 'pending',
  sla_hours INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_health_configs (
  id SERIAL PRIMARY KEY,
  usage_weight INT NOT NULL DEFAULT 30,
  support_weight INT NOT NULL DEFAULT 20,
  payment_weight INT NOT NULL DEFAULT 15,
  nps_weight INT NOT NULL DEFAULT 20,
  engagement_weight INT NOT NULL DEFAULT 15,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_health_scores (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES wb_clients(id) ON DELETE CASCADE,
  usage_score INT NOT NULL DEFAULT 50,
  support_score INT NOT NULL DEFAULT 50,
  payment_score INT NOT NULL DEFAULT 50,
  nps_score INT NOT NULL DEFAULT 50,
  engagement_score INT NOT NULL DEFAULT 50,
  total_score INT NOT NULL DEFAULT 50,
  band TEXT NOT NULL DEFAULT 'Yellow',
  trend TEXT NOT NULL DEFAULT 'steady',
  notes TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(client_id)
);

CREATE TABLE IF NOT EXISTS wb_opportunities (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES wb_clients(id) ON DELETE CASCADE,
  type TEXT NOT NULL,
  suggested_product TEXT NOT NULL,
  estimated_value NUMERIC(12,2) NOT NULL DEFAULT 0,
  evidence TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  assignee_email TEXT,
  approved_discount_pct NUMERIC(5,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  closed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_market_criteria (
  id SERIAL PRIMARY KEY,
  market_size_weight INT NOT NULL DEFAULT 25,
  growth_weight INT NOT NULL DEFAULT 20,
  competition_weight INT NOT NULL DEFAULT 15,
  regulation_weight INT NOT NULL DEFAULT 15,
  fit_weight INT NOT NULL DEFAULT 15,
  entry_cost_weight INT NOT NULL DEFAULT 10,
  updated_by TEXT,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_market_candidates (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  market_size_score INT NOT NULL DEFAULT 50,
  growth_score INT NOT NULL DEFAULT 50,
  competition_score INT NOT NULL DEFAULT 50,
  regulation_score INT NOT NULL DEFAULT 50,
  fit_score INT NOT NULL DEFAULT 50,
  entry_cost_score INT NOT NULL DEFAULT 50,
  estimated_roi NUMERIC(6,2) NOT NULL DEFAULT 0,
  entry_cost_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  weighted_score NUMERIC(6,2) NOT NULL DEFAULT 0,
  manual_override_rank INT,
  override_note TEXT,
  stage TEXT NOT NULL DEFAULT 'Candidate',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_market_deep_dive_tasks (
  id SERIAL PRIMARY KEY,
  candidate_id INT NOT NULL REFERENCES wb_market_candidates(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_email TEXT,
  due_at TIMESTAMPTZ,
  status TEXT NOT NULL DEFAULT 'open'
);

CREATE TABLE IF NOT EXISTS wb_pilots (
  id SERIAL PRIMARY KEY,
  market_name TEXT NOT NULL,
  duration_days INT NOT NULL DEFAULT 90,
  budget_usd NUMERIC(12,2) NOT NULL DEFAULT 0,
  success_customer_target INT NOT NULL DEFAULT 0,
  success_conversion_target NUMERIC(5,2) NOT NULL DEFAULT 0,
  success_cac_target NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'Planned',
  decision TEXT,
  owner_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_pilot_tasks (
  id SERIAL PRIMARY KEY,
  pilot_id INT NOT NULL REFERENCES wb_pilots(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  owner_email TEXT,
  depends_on_task_id INT REFERENCES wb_pilot_tasks(id),
  status TEXT NOT NULL DEFAULT 'pending',
  due_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_pilot_metrics (
  id SERIAL PRIMARY KEY,
  pilot_id INT NOT NULL REFERENCES wb_pilots(id) ON DELETE CASCADE,
  leads_generated INT NOT NULL DEFAULT 0,
  conversions INT NOT NULL DEFAULT 0,
  cac NUMERIC(10,2) NOT NULL DEFAULT 0,
  support_tickets INT NOT NULL DEFAULT 0,
  snapshot_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_feedback_items (
  id SERIAL PRIMARY KEY,
  client_id INT REFERENCES wb_clients(id) ON DELETE SET NULL,
  source TEXT NOT NULL,
  category TEXT NOT NULL,
  summary TEXT NOT NULL,
  sentiment TEXT,
  frequency_count INT NOT NULL DEFAULT 1,
  priority TEXT NOT NULL DEFAULT 'P2',
  routed_to TEXT,
  status TEXT NOT NULL DEFAULT 'Open',
  roadmap_eta TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS wb_renewals (
  id SERIAL PRIMARY KEY,
  client_id INT NOT NULL REFERENCES wb_clients(id) ON DELETE CASCADE,
  term_start DATE,
  term_end DATE,
  current_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  proposed_amount NUMERIC(12,2),
  increase_pct NUMERIC(6,2),
  recommended_action TEXT,
  status TEXT NOT NULL DEFAULT 'Draft',
  counter_amount NUMERIC(12,2),
  signed_at TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS wb_approval_logs (
  id SERIAL PRIMARY KEY,
  module TEXT NOT NULL,
  record_id INT NOT NULL,
  action TEXT NOT NULL,
  actor_email TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intranet_posts (
  id SERIAL PRIMARY KEY,
  author TEXT NOT NULL,
  initials TEXT NOT NULL,
  department TEXT,
  post_type TEXT NOT NULL DEFAULT 'Post',
  content TEXT NOT NULL,
  attachment_url TEXT,
  attachment_name TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intranet_comments (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES intranet_posts(id) ON DELETE CASCADE,
  author TEXT NOT NULL,
  initials TEXT NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS intranet_post_likes (
  id SERIAL PRIMARY KEY,
  post_id INT NOT NULL REFERENCES intranet_posts(id) ON DELETE CASCADE,
  actor TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(post_id, actor)
);

