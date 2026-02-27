-- ============================================
-- COMPLETE DATABASE BACKUP & RESTORE SCRIPT
-- Date: 27 Februarie 2026
-- ============================================
-- 
-- USAGE:
-- 1. BACKUP: Run this entire script in Supabase SQL Editor
--    Copy ALL the output and save as: backup-2026-02-27.sql
-- 
-- 2. RESTORE: Run the saved backup-2026-02-27.sql file
--    It will recreate all data exactly as it was
-- ============================================

-- ============================================
-- BACKUP SECTION - Generate INSERT statements
-- ============================================

-- First, let's see what we're backing up
SELECT 
  'BACKUP SUMMARY' as info,
  (SELECT COUNT(*) FROM profiles) as profiles,
  (SELECT COUNT(*) FROM shipments) as shipments,
  (SELECT COUNT(*) FROM offers) as offers,
  (SELECT COUNT(*) FROM messages) as messages;

-- ============================================
-- Generate INSERT statements for PROFILES
-- ============================================

SELECT 'INSERT INTO profiles (id, email, full_name, company_name, phone, role, created_at, updated_at) VALUES' 
UNION ALL
SELECT string_agg(
  format('(%L, %L, %L, %L, %L, %L, %L, %L)',
    id, email, full_name, company_name, phone, role, created_at, updated_at
  ), E',\n'
) || ';'
FROM profiles;

-- ============================================
-- Generate INSERT statements for SHIPMENTS
-- ============================================

SELECT E'\n-- SHIPMENTS' 
UNION ALL
SELECT 'INSERT INTO shipments (id, client_id, origin_city, origin_country, origin_address, destination_city, destination_country, destination_address, container_type, container_count, cargo_type, cargo_weight, transport_type, pickup_date, delivery_date, budget, budget_visible, currency, special_instructions, status, created_at, updated_at) VALUES'
UNION ALL
SELECT string_agg(
  format('(%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L)',
    id, client_id, origin_city, origin_country, origin_address, 
    destination_city, destination_country, destination_address,
    container_type, container_count, cargo_type, cargo_weight,
    transport_type, pickup_date, delivery_date, budget, budget_visible,
    currency, special_instructions, status, created_at, updated_at
  ), E',\n'
) || ';'
FROM shipments;

-- ============================================
-- Generate INSERT statements for OFFERS
-- ============================================

SELECT E'\n-- OFFERS'
UNION ALL
SELECT 'INSERT INTO offers (id, shipment_id, transporter_id, price, currency, estimated_days, available_from, message, valid_hours, status, created_at, updated_at) VALUES'
UNION ALL
SELECT string_agg(
  format('(%L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L, %L)',
    id, shipment_id, transporter_id, price, currency, estimated_days,
    available_from, message, valid_hours, status, created_at, updated_at
  ), E',\n'
) || ';'
FROM offers;

-- ============================================
-- Generate INSERT statements for MESSAGES
-- ============================================

SELECT E'\n-- MESSAGES'
UNION ALL
SELECT 'INSERT INTO messages (id, shipment_id, sender_id, receiver_id, content, read, created_at) VALUES'
UNION ALL
SELECT string_agg(
  format('(%L, %L, %L, %L, %L, %L, %L)',
    id, shipment_id, sender_id, receiver_id, content, read, created_at
  ), E',\n'
) || ';'
FROM messages;

-- ============================================
-- VERIFICATION
-- ============================================

SELECT E'\n-- BACKUP COMPLETE!' as info
UNION ALL
SELECT '-- Total records backed up:' 
UNION ALL
SELECT '-- Profiles: ' || COUNT(*)::text FROM profiles
UNION ALL
SELECT '-- Shipments: ' || COUNT(*)::text FROM shipments
UNION ALL
SELECT '-- Offers: ' || COUNT(*)::text FROM offers
UNION ALL
SELECT '-- Messages: ' || COUNT(*)::text FROM messages;

-- ============================================
-- RESTORE INSTRUCTIONS
-- ============================================
-- To restore this backup:
-- 1. Delete existing data (if needed):
--    DELETE FROM messages;
--    DELETE FROM offers;
--    DELETE FROM shipments;
--    DELETE FROM profiles WHERE role IN ('client', 'transporter');
--
-- 2. Run all the INSERT statements from the backup
-- ============================================
