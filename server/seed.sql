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

INSERT INTO intranet_posts (id, author, initials, department, post_type, content, attachment_url, attachment_name, created_at)
VALUES
  (1, 'Director General Office', 'DG', 'Corporate Services', 'Announcement', 'We are pleased to announce that NAPTIN''s Q1 training targets have been exceeded by 12% across all key performance indicators. A full report will be circulated by Monday. Thank you all for your dedication!', NULL, NULL, NOW() - INTERVAL '2 hours'),
  (2, 'Training Unit', 'TU', 'Training Department', 'Photo', 'Reminder: The Cybersecurity Awareness Training is mandatory for all ICT and Admin staff. Sessions run every Tuesday 2–4 PM in Conference Room B.', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200&q=80&auto=format&fit=crop', 'cybersecurity-training.jpg', NOW() - INTERVAL '5 hours'),
  (3, 'Procurement Department', 'PC', 'Procurement', 'File', 'New vendor registration portal is now LIVE. Please use the new digital form for all supplier onboarding.', 'https://example.com/files/vendor-registration-guide.pdf', 'Vendor Registration Guide.pdf', NOW() - INTERVAL '1 day'),
  (4, 'ICT Department', 'ICT', 'ICT', 'Post', 'Planned server maintenance tonight between 11 PM and 2 AM. Please save all work and log out before 10:45 PM.', NULL, NULL, NOW() - INTERVAL '1 day')
ON CONFLICT (id) DO NOTHING;

SELECT setval('intranet_posts_id_seq', GREATEST((SELECT COALESCE(MAX(id), 1) FROM intranet_posts), 1), true);

INSERT INTO intranet_comments (post_id, author, initials, text, created_at)
VALUES
  (1, 'Head of Training', 'HT', 'Excellent results — well done to all RTCs.', NOW() - INTERVAL '70 minutes'),
  (1, 'Staff Rep', 'SR', 'Will the full report be published on the intranet?', NOW() - INTERVAL '45 minutes'),
  (2, 'ICT Admin', 'IA', 'Calendar invite sent for next Tuesday.', NOW() - INTERVAL '3 hours'),
  (3, 'HOD Procurement', 'HP', 'Please cascade to your teams this week.', NOW() - INTERVAL '20 hours'),
  (4, 'Helpdesk', 'HD', 'Backup reminder posted to all staff mail.', NOW() - INTERVAL '18 hours')
ON CONFLICT DO NOTHING;

INSERT INTO intranet_post_likes (post_id, actor, created_at)
SELECT 1, 'Staff Member ' || gs::text, NOW() - (gs || ' minutes')::interval
FROM generate_series(1, 84) gs
ON CONFLICT DO NOTHING;

INSERT INTO intranet_post_likes (post_id, actor, created_at)
SELECT 2, 'Staff Member ' || gs::text, NOW() - (gs || ' minutes')::interval
FROM generate_series(85, 125) gs
ON CONFLICT DO NOTHING;

INSERT INTO intranet_post_likes (post_id, actor, created_at)
SELECT 3, 'Staff Member ' || gs::text, NOW() - (gs || ' minutes')::interval
FROM generate_series(126, 154) gs
ON CONFLICT DO NOTHING;

INSERT INTO intranet_post_likes (post_id, actor, created_at)
SELECT 4, 'Staff Member ' || gs::text, NOW() - (gs || ' minutes')::interval
FROM generate_series(155, 166) gs
ON CONFLICT DO NOTHING;

