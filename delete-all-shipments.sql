-- Delete ALL shipments from the database
-- This will also delete all related data (offers, messages, etc.) due to CASCADE

-- First, let's see what we have (optional - run this first to verify)
SELECT COUNT(*) as total_shipments FROM shipments;

SELECT id, origin_city, destination_city, created_at, status
FROM shipments
ORDER BY created_at DESC;

-- Delete ALL shipments
-- WARNING: This will permanently delete ALL shipments and related data
DELETE FROM shipments;

-- Verify all shipments are deleted
SELECT COUNT(*) as remaining_shipments FROM shipments;
