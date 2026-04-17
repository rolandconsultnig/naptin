-- Shared collaboration files (collab_documents with workspace_id NULL).
-- Reuses operations_schema collab_documents. Run: npm run db:collab:files

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status)
SELECT NULL, 'Board_Q1_Financial_Summary.pdf', 'pdf', 'inline:', 2520000, 'g.okafor@naptin.gov.ng', 'Finance workspace', false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_documents WHERE workspace_id IS NULL AND title = 'Board_Q1_Financial_Summary.pdf');

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status)
SELECT NULL, 'HR_Policy_2026.docx', 'docx', 'inline:', 890000, 'a.musa@naptin.gov.ng', 'HR & Legal', true, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_documents WHERE workspace_id IS NULL AND title = 'HR_Policy_2026.docx');

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status)
SELECT NULL, 'Vendor_Master_Q1.xlsx', 'xlsx', 'inline:', 1100000, 'm.ibrahim@naptin.gov.ng', 'Procurement', false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_documents WHERE workspace_id IS NULL AND title = 'Vendor_Master_Q1.xlsx');

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status)
SELECT NULL, 'Substation_Safety_Checklist.pdf', 'pdf', 'inline:', 540000, 't.ajayi@naptin.gov.ng', 'Training', false, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_documents WHERE workspace_id IS NULL AND title = 'Substation_Safety_Checklist.pdf');

INSERT INTO collab_documents (workspace_id, title, file_type, file_url, file_size_bytes, uploaded_by, department, is_locked, status)
SELECT NULL, 'M&E_Indicators_Framework.pptx', 'pptx', 'inline:', 3200000, 'k.oluwole@naptin.gov.ng', 'M&E workspace', true, 'active'
WHERE NOT EXISTS (SELECT 1 FROM collab_documents WHERE workspace_id IS NULL AND title = 'M&E_Indicators_Framework.pptx');
