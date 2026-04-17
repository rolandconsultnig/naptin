-- Collaboration forums (threads + replies). Apply after operations_schema.sql.
-- Run: npm run db:collab:forum

CREATE TABLE IF NOT EXISTS collab_forum_threads (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  tag TEXT NOT NULL DEFAULT 'General',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  views INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS collab_forum_posts (
  id SERIAL PRIMARY KEY,
  thread_id INT NOT NULL REFERENCES collab_forum_threads(id) ON DELETE CASCADE,
  author_email TEXT NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_collab_forum_posts_thread ON collab_forum_posts(thread_id, created_at);

-- Demo threads (idempotent)
INSERT INTO collab_forum_threads (title, tag, pinned, author_email, body, views)
SELECT 'Proposed change to annual leave policy', 'HR', TRUE, 'hr@naptin.gov.ng',
  'HR is consulting on consolidating carry-over rules with the new FMM guidance. Please share concerns by Friday.',
  412
WHERE NOT EXISTS (SELECT 1 FROM collab_forum_threads WHERE title = 'Proposed change to annual leave policy');

INSERT INTO collab_forum_threads (title, tag, pinned, author_email, body, views)
SELECT 'Best practices for substation training assessments', 'Training', FALSE, 'training@naptin.gov.ng',
  'We are aligning practical assessments with ANCEE rubrics. What has worked well at your RTC?',
  289
WHERE NOT EXISTS (SELECT 1 FROM collab_forum_threads WHERE title = 'Best practices for substation training assessments');

INSERT INTO collab_forum_threads (title, tag, pinned, author_email, body, views)
SELECT 'ICT maintenance — how to request emergency downtime?', 'ICT', FALSE, 'ict@naptin.gov.ng',
  'Use the ICT module ticket type "Emergency change" and page the on-call engineer. This thread captures FAQs.',
  501
WHERE NOT EXISTS (SELECT 1 FROM collab_forum_threads WHERE title = 'ICT maintenance — how to request emergency downtime?');

INSERT INTO collab_forum_threads (title, tag, pinned, author_email, body, views)
SELECT 'Procurement: new threshold for RFQs', 'Procurement', FALSE, 'procurement@naptin.gov.ng',
  'Effective 1 April 2026, RFQ threshold moves to ₦5m for standard goods. Exceptions require DG approval note.',
  156
WHERE NOT EXISTS (SELECT 1 FROM collab_forum_threads WHERE title = 'Procurement: new threshold for RFQs');

-- Sample replies
INSERT INTO collab_forum_posts (thread_id, author_email, body)
SELECT t.id, 'staff@naptin.gov.ng', 'Can we get a worked example for part-time staff carry-over?'
FROM collab_forum_threads t
WHERE t.title = 'Proposed change to annual leave policy'
  AND NOT EXISTS (
    SELECT 1 FROM collab_forum_posts p
    WHERE p.thread_id = t.id AND p.body LIKE 'Can we get a worked example%'
  );

INSERT INTO collab_forum_posts (thread_id, author_email, body)
SELECT t.id, 'director@naptin.gov.ng', 'HR will publish a one-pager next week — thanks for the early comments.'
FROM collab_forum_threads t
WHERE t.title = 'Proposed change to annual leave policy'
  AND NOT EXISTS (
    SELECT 1 FROM collab_forum_posts p
    WHERE p.thread_id = t.id AND p.body LIKE 'HR will publish a one-pager%'
  );

INSERT INTO collab_forum_posts (thread_id, author_email, body)
SELECT t.id, 'ict@naptin.gov.ng', 'Reminder: include rollback steps and CAB reference in the ticket body.'
FROM collab_forum_threads t
WHERE t.title = 'ICT maintenance — how to request emergency downtime?'
  AND NOT EXISTS (
    SELECT 1 FROM collab_forum_posts p
    WHERE p.thread_id = t.id AND p.body LIKE 'Reminder: include rollback%'
  );
