-- Get all table schemas
SELECT 
    table_name,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name IN ('transactions', 'users', 'qr_codes', 'payment_links')
ORDER BY table_name, ordinal_position;

-- Get check constraints (especially for status field)
SELECT 
    tc.table_name,
    tc.constraint_name,
    cc.check_clause
FROM information_schema.table_constraints tc
JOIN information_schema.check_constraints cc 
    ON tc.constraint_name = cc.constraint_name
WHERE tc.table_schema = 'public'
  AND tc.constraint_type = 'CHECK'
  AND tc.table_name IN ('transactions', 'users', 'qr_codes', 'payment_links')
ORDER BY tc.table_name;
