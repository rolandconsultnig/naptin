-- Collaboration calendar events (portal persistence).
-- Apply after operations_schema.sql (any database with collab_* is fine; this table is standalone).

CREATE TABLE IF NOT EXISTS collab_calendar_events (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TEXT NOT NULL DEFAULT '09:00',
  location TEXT NOT NULL DEFAULT 'TBD',
  event_type TEXT NOT NULL DEFAULT 'meeting',
  created_by TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_calendar_events_date ON collab_calendar_events(event_date);

-- Demo rows (March 2026) — idempotent
INSERT INTO collab_calendar_events (title, event_date, start_time, location, event_type, created_by)
SELECT 'DG Briefing', DATE '2026-03-28', '08:00', 'Executive Boardroom', 'internal', 'system@naptin.gov.ng'
WHERE NOT EXISTS (
  SELECT 1 FROM collab_calendar_events WHERE title = 'DG Briefing' AND event_date = DATE '2026-03-28'
);

INSERT INTO collab_calendar_events (title, event_date, start_time, location, event_type, created_by)
SELECT 'Q1 Financial Review', DATE '2026-03-28', '10:00', 'Conference Room A', 'meeting', 'system@naptin.gov.ng'
WHERE NOT EXISTS (
  SELECT 1 FROM collab_calendar_events WHERE title = 'Q1 Financial Review' AND event_date = DATE '2026-03-28'
);

INSERT INTO collab_calendar_events (title, event_date, start_time, location, event_type, created_by)
SELECT 'Vendor review — transformers', DATE '2026-03-29', '14:00', 'Boardroom 2', 'procurement', 'system@naptin.gov.ng'
WHERE NOT EXISTS (
  SELECT 1 FROM collab_calendar_events WHERE title = 'Vendor review — transformers' AND event_date = DATE '2026-03-29'
);

INSERT INTO collab_calendar_events (title, event_date, start_time, location, event_type, created_by)
SELECT 'Board of Directors', DATE '2026-03-31', '09:00', 'Executive Boardroom', 'board', 'system@naptin.gov.ng'
WHERE NOT EXISTS (
  SELECT 1 FROM collab_calendar_events WHERE title = 'Board of Directors' AND event_date = DATE '2026-03-31'
);

INSERT INTO collab_calendar_events (title, event_date, start_time, location, event_type, created_by)
SELECT 'ICT change window', DATE '2026-03-31', '23:00', 'Data Centre', 'maintenance', 'system@naptin.gov.ng'
WHERE NOT EXISTS (
  SELECT 1 FROM collab_calendar_events WHERE title = 'ICT change window' AND event_date = DATE '2026-03-31'
);
