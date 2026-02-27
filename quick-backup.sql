-- QUICK BACKUP - Run in Supabase SQL Editor
-- Copy and save each result before running DELETE

-- 1. Check what we have
SELECT 
  'shipments' as table_name, COUNT(*) as count FROM shipments
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'messages', COUNT(*) FROM messages;

-- 2. Backup shipments (copy result and save as shipments_backup.json)
SELECT json_agg(row_to_json(t)) as shipments_backup
FROM (SELECT * FROM shipments ORDER BY created_at) t;

-- 3. Backup offers (copy result and save as offers_backup.json)
SELECT json_agg(row_to_json(t)) as offers_backup
FROM (SELECT * FROM offers ORDER BY created_at) t;

-- 4. Backup messages (copy result and save as messages_backup.json)
SELECT json_agg(row_to_json(t)) as messages_backup
FROM (SELECT * FROM messages ORDER BY created_at) t;

-- After saving all backups, you can safely run:
-- DELETE FROM shipments;
