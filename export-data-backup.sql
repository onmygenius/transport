-- Export all data as INSERT statements for backup
-- Run this in Supabase SQL Editor and save the results

-- 1. Count records before backup
SELECT 
  'shipments' as table_name, COUNT(*) as count FROM shipments
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'profiles', COUNT(*) FROM profiles;

-- 2. Export shipments as JSON (copy and save this result)
SELECT json_agg(row_to_json(t))
FROM (
  SELECT * FROM shipments ORDER BY created_at
) t;

-- 3. Export offers as JSON (copy and save this result)
SELECT json_agg(row_to_json(t))
FROM (
  SELECT * FROM offers ORDER BY created_at
) t;

-- 4. Export messages as JSON (copy and save this result)
SELECT json_agg(row_to_json(t))
FROM (
  SELECT * FROM messages ORDER BY created_at
) t;

-- 5. Export profiles as JSON (copy and save this result)
SELECT json_agg(row_to_json(t))
FROM (
  SELECT * FROM profiles ORDER BY created_at
) t;
