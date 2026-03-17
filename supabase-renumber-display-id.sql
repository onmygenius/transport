-- Renumber existing shipments to start from TC-SHP-02200
WITH numbered_shipments AS (
  SELECT 
    id,
    'TC-SHP-' || LPAD((2200 + ROW_NUMBER() OVER (ORDER BY created_at) - 1)::TEXT, 5, '0') as new_display_id
  FROM shipments
  ORDER BY created_at
)
UPDATE shipments 
SET display_id = numbered_shipments.new_display_id
FROM numbered_shipments
WHERE shipments.id = numbered_shipments.id;

-- Renumber existing profiles to start from TC-USR-01000
WITH numbered_profiles AS (
  SELECT 
    id,
    'TC-USR-' || LPAD((1000 + ROW_NUMBER() OVER (ORDER BY created_at) - 1)::TEXT, 5, '0') as new_display_id
  FROM profiles
  ORDER BY created_at
)
UPDATE profiles 
SET display_id = numbered_profiles.new_display_id
FROM numbered_profiles
WHERE profiles.id = numbered_profiles.id;

-- Renumber existing offers to start from TC-OFF-01000
WITH numbered_offers AS (
  SELECT 
    id,
    'TC-OFF-' || LPAD((1000 + ROW_NUMBER() OVER (ORDER BY created_at) - 1)::TEXT, 5, '0') as new_display_id
  FROM offers
  ORDER BY created_at
)
UPDATE offers 
SET display_id = numbered_offers.new_display_id
FROM numbered_offers
WHERE offers.id = numbered_offers.id;
