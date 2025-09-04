-- Get complete database schema for AfriPay
-- Tables and their columns
SELECT 
  'TABLE' as object_type,
  table_name,
  column_name,
  data_type,
  character_maximum_length,
  is_nullable,
  column_default,
  ordinal_position
FROM information_schema.columns 
WHERE table_schema = 'public'
  AND table_name NOT LIKE 'pg_%'
  AND table_name NOT LIKE 'sql_%'
ORDER BY table_name, ordinal_position;

-- Primary keys
SELECT 
  'PRIMARY_KEY' as object_type,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  NULL as data_type,
  NULL as character_maximum_length,
  NULL as is_nullable,
  NULL as column_default,
  NULL as ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'PRIMARY KEY'
  AND tc.table_schema = 'public';

-- Foreign keys
SELECT 
  'FOREIGN_KEY' as object_type,
  tc.table_name,
  kcu.column_name,
  tc.constraint_name,
  ccu.table_name as referenced_table,
  ccu.column_name as referenced_column,
  NULL as is_nullable,
  NULL as column_default,
  NULL as ordinal_position
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu 
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage ccu 
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public';

-- Indexes
SELECT 
  'INDEX' as object_type,
  schemaname,
  tablename,
  indexname,
  indexdef,
  NULL as character_maximum_length,
  NULL as is_nullable,
  NULL as column_default,
  NULL as ordinal_position
FROM pg_indexes 
WHERE schemaname = 'public';
