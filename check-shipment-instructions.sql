-- Check special_instructions for shipment
-- Run this in Supabase Dashboard -> SQL Editor

SELECT 
    id,
    origin_city,
    destination_city,
    special_instructions
FROM shipments
WHERE id = 'ba9ad057-a26c-4e0e-b9e1-61685d1a94fb';
