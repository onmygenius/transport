-- Verificare ultimul shipment creat
SELECT 
  id,
  origin_city,
  origin_country,
  origin_address,
  destination_city,
  destination_country,
  destination_address,
  container_type,
  container_count,
  cargo_weight,
  cargo_type,
  transport_type,
  pickup_date,
  delivery_date,
  budget,
  budget_visible,
  currency,
  special_instructions,
  status,
  created_at
FROM shipments
ORDER BY created_at DESC
LIMIT 1;
