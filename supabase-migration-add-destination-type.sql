-- =============================================
-- MIGRATION: Add destination_type to shipments
-- Data: 16 Martie 2026
-- Scop: Permite diferențierea între Drop PORT și Drop CLIENT
-- =============================================

-- 1. Adaugă coloana destination_type
ALTER TABLE shipments 
  ADD COLUMN IF NOT EXISTS destination_type TEXT;

-- 2. Setează valoarea default 'port' pentru shipment-urile existente
UPDATE shipments 
  SET destination_type = 'port' 
  WHERE destination_type IS NULL;

-- 3. Verificare
SELECT 
  id,
  destination_city,
  destination_type,
  destination_address
FROM shipments 
LIMIT 5;

-- =============================================
-- NOTĂ: 
-- destination_type poate fi:
-- - 'port': Drop la port/terminal
-- - 'client': Drop la adresa client
-- =============================================
