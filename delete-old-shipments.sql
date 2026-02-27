-- Delete all shipments EXCEPT the one with ID: 91af5539-d536-4937-82d4-b31b75680d59
-- This will also delete related offers, messages, and other dependencies due to CASCADE

-- First, let's see what we're about to delete (optional - run this first to verify)
SELECT id, origin_city, destination_city, created_at, status
FROM shipments
WHERE id != '91af5539-d536-4937-82d4-b31b75680d59'
ORDER BY created_at DESC;

-- Delete all shipments except the specified one
-- WARNING: This will permanently delete the shipments and all related data
DELETE FROM shipments
WHERE id != '91af5539-d536-4937-82d4-b31b75680d59';

-- Verify only one shipment remains
SELECT id, origin_city, destination_city, created_at, status
FROM shipments;
