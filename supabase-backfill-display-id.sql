-- Backfill display_id for existing shipments
-- This will generate TC-SHP-XXXXX IDs for all shipments that don't have one

WITH numbered_shipments AS (
  SELECT 
    id,
    'TC-SHP-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 5, '0') as new_display_id
  FROM shipments
  WHERE display_id IS NULL
)
UPDATE shipments 
SET display_id = numbered_shipments.new_display_id
FROM numbered_shipments
WHERE shipments.id = numbered_shipments.id;

-- Backfill display_id for existing profiles (optional - for future use)
WITH numbered_profiles AS (
  SELECT 
    id,
    'TC-USR-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 5, '0') as new_display_id
  FROM profiles
  WHERE display_id IS NULL
)
UPDATE profiles 
SET display_id = numbered_profiles.new_display_id
FROM numbered_profiles
WHERE profiles.id = numbered_profiles.id;

-- Backfill display_id for existing offers (optional - for future use)
WITH numbered_offers AS (
  SELECT 
    id,
    'TC-OFF-' || LPAD((ROW_NUMBER() OVER (ORDER BY created_at))::TEXT, 5, '0') as new_display_id
  FROM offers
  WHERE display_id IS NULL
)
UPDATE offers 
SET display_id = numbered_offers.new_display_id
FROM numbered_offers
WHERE offers.id = numbered_offers.id;
