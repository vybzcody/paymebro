-- Get transactions table schema
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default,
    character_maximum_length
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Get NOT NULL constraints
SELECT 
    column_name,
    'NOT NULL' as constraint_type
FROM information_schema.columns 
WHERE table_name = 'transactions' 
  AND table_schema = 'public'
  AND is_nullable = 'NO'
ORDER BY ordinal_position;
