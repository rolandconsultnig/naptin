INSERT INTO wb_clients (name, crm_account_id, owner_email, status, contract_start_date, contract_end_date, sla_summary)
VALUES
  ('Apex Power Distribution', 'CRM-1102', 'go@naptin.gov.ng', 'active', '2026-01-10', '2027-01-09', '24h response; 99.5% availability'),
  ('Lumos Energy Services', 'CRM-1148', 'go@naptin.gov.ng', 'onboarding', '2026-03-01', '2027-02-28', '48h response; weekly check-in'),
  ('GridView Analytics', 'CRM-1191', 'ao@naptin.gov.ng', 'active', '2025-10-15', '2026-10-14', '24h response; monthly QBR')
ON CONFLICT DO NOTHING;

INSERT INTO wb_health_configs (id, usage_weight, support_weight, payment_weight, nps_weight, engagement_weight, updated_by)
VALUES (1, 30, 20, 15, 20, 15, 'system@naptin.gov.ng')
ON CONFLICT (id) DO NOTHING;

INSERT INTO wb_market_criteria (id, market_size_weight, growth_weight, competition_weight, regulation_weight, fit_weight, entry_cost_weight, updated_by)
VALUES (1, 25, 20, 15, 15, 15, 10, 'system@naptin.gov.ng')
ON CONFLICT (id) DO NOTHING;

