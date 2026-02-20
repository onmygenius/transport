-- Seed test shipments for client@firma.ro
-- Run this in Supabase SQL Editor

DO $$
DECLARE
  client_id UUID;
BEGIN
  SELECT id INTO client_id FROM auth.users WHERE email = 'client@firma.ro';

  INSERT INTO public.shipments (
    client_id, origin_city, origin_country, destination_city, destination_country,
    container_type, container_count, cargo_weight, cargo_type, transport_type,
    pickup_date, budget, budget_visible, currency, status, expires_at
  ) VALUES
  (client_id, 'Warsaw', 'PL', 'Rome', 'IT', '20ft', 1, 8.5, 'general', 'fcl',
   '2026-03-10', 1800, true, 'EUR', 'pending', NOW() + INTERVAL '30 days'),

  (client_id, 'Bucharest', 'RO', 'Berlin', 'DE', '40ft', 1, 22.0, 'general', 'fcl',
   '2026-03-15', 2400, true, 'EUR', 'pending', NOW() + INTERVAL '30 days'),

  (client_id, 'London', 'GB', 'Madrid', 'ES', '40ft_hc', 1, 28.0, 'general', 'fcl',
   '2026-03-20', NULL, false, 'EUR', 'pending', NOW() + INTERVAL '30 days'),

  (client_id, 'Hamburg', 'DE', 'Athens', 'GR', '20ft', 2, 15.0, 'perishable', 'fcl',
   '2026-03-12', 2200, true, 'EUR', 'pending', NOW() + INTERVAL '30 days'),

  (client_id, 'Zurich', 'CH', 'Lisbon', 'PT', '40ft', 1, 20.0, 'general', 'fcl',
   '2026-03-08', 2800, true, 'EUR', 'pending', NOW() + INTERVAL '30 days');

  RAISE NOTICE 'Inserted 5 test shipments for client_id: %', client_id;
END $$;
