-- Optional: align portal demo logins (see src/admin/directoryUsers.js) with hr_employees.email
-- so self-service and HR APIs keyed by email resolve to a real seed row.
-- Apply only in demo environments after hrms_schema.sql + hrms_seed.sql.
-- Adjust staff_id targets if your data diverges.

UPDATE hr_employees SET email = 'hod@naptin.gov.ng' WHERE staff_id = 'NAPTIN/014';
UPDATE hr_employees SET email = 'staff@naptin.gov.ng' WHERE staff_id = 'NAPTIN/008';
UPDATE hr_employees SET email = 'audit@naptin.gov.ng' WHERE staff_id = 'NAPTIN/016';
UPDATE hr_employees SET email = 'ict@naptin.gov.ng' WHERE staff_id = 'NAPTIN/011';
UPDATE hr_employees SET email = 'director@naptin.gov.ng' WHERE staff_id = 'NAPTIN/003';
