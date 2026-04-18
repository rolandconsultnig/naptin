-- Portal profile fields on HR employee master (self-service display; username is not user-editable).
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS portal_display_name TEXT;
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS portal_bio TEXT;
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS office_location TEXT;
ALTER TABLE hr_employees ADD COLUMN IF NOT EXISTS portal_username TEXT;

COMMENT ON COLUMN hr_employees.portal_username IS 'Immutable portal login name; not updated via self-service PATCH.';
