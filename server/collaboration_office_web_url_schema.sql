-- Optional HTTPS link to open a catalogue row in Microsoft Office or WPS (desktop).
-- Run: npm run db:collab:office-url

ALTER TABLE collab_documents ADD COLUMN IF NOT EXISTS web_url TEXT;
