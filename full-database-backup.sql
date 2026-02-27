-- FULL DATABASE BACKUP - 27 Februarie 2026
-- Run each query in Supabase SQL Editor and save the results
-- https://supabase.com/dashboard/project/helnlbwxlrwemrowhklo/sql

-- ============================================
-- STEP 1: Check what we have
-- ============================================

SELECT 
  'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'shipments', COUNT(*) FROM shipments
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'messages', COUNT(*) FROM messages
UNION ALL
SELECT 'notifications', COUNT(*) FROM notifications;

-- ============================================
-- STEP 2: Backup PROFILES (users)
-- ============================================
-- Copy the result and save as: profiles_backup_2026-02-27.json

SELECT json_agg(row_to_json(t)) as profiles_backup
FROM (
  SELECT * FROM profiles ORDER BY created_at
) t;

-- ============================================
-- STEP 3: Backup SHIPMENTS
-- ============================================
-- Copy the result and save as: shipments_backup_2026-02-27.json

SELECT json_agg(row_to_json(t)) as shipments_backup
FROM (
  SELECT * FROM shipments ORDER BY created_at
) t;

-- ============================================
-- STEP 4: Backup OFFERS
-- ============================================
-- Copy the result and save as: offers_backup_2026-02-27.json

SELECT json_agg(row_to_json(t)) as offers_backup
FROM (
  SELECT * FROM offers ORDER BY created_at
) t;

-- ============================================
-- STEP 5: Backup MESSAGES
-- ============================================
-- Copy the result and save as: messages_backup_2026-02-27.json

SELECT json_agg(row_to_json(t)) as messages_backup
FROM (
  SELECT * FROM messages ORDER BY created_at
) t;

-- ============================================
-- STEP 6: Backup NOTIFICATIONS (if exists)
-- ============================================
-- Copy the result and save as: notifications_backup_2026-02-27.json

SELECT json_agg(row_to_json(t)) as notifications_backup
FROM (
  SELECT * FROM notifications ORDER BY created_at
) t;

-- ============================================
-- VERIFICATION: Final count after backup
-- ============================================

SELECT 
  'Total profiles' as info, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'Total shipments', COUNT(*) FROM shipments
UNION ALL
SELECT 'Total offers', COUNT(*) FROM offers
UNION ALL
SELECT 'Total messages', COUNT(*) FROM messages
UNION ALL
SELECT 'Total notifications', COUNT(*) FROM notifications;

-- ============================================
-- BACKUP COMPLETE!
-- ============================================
-- You should now have 5 JSON files saved locally:
-- 1. profiles_backup_2026-02-27.json
-- 2. shipments_backup_2026-02-27.json
-- 3. offers_backup_2026-02-27.json
-- 4. messages_backup_2026-02-27.json
-- 5. notifications_backup_2026-02-27.json
--
-- After backup is complete, you can safely delete data if needed.
-- ============================================
