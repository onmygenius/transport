-- =============================================
-- MIGRARE: pickup_date și delivery_date
-- De la: DATE
-- La: TIMESTAMPTZ
-- Data: 2026-02-25
-- =============================================

-- IMPORTANT: Această migrare este NON-DESTRUCTIVĂ
-- Datele existente vor fi păstrate și convertite automat
-- Exemplu: '2026-03-15' devine '2026-03-15 00:00:00+00'

-- =============================================
-- PAS 1: Modifică pickup_date de la DATE la TIMESTAMPTZ
-- =============================================

ALTER TABLE shipments 
  ALTER COLUMN pickup_date TYPE TIMESTAMPTZ 
  USING pickup_date::TIMESTAMPTZ;

-- =============================================
-- PAS 2: Modifică delivery_date de la DATE la TIMESTAMPTZ
-- =============================================

ALTER TABLE shipments 
  ALTER COLUMN delivery_date TYPE TIMESTAMPTZ 
  USING delivery_date::TIMESTAMPTZ;

-- =============================================
-- VERIFICARE: Afișează tipurile de date după migrare
-- =============================================

SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns
WHERE table_name = 'shipments' 
  AND column_name IN ('pickup_date', 'delivery_date')
ORDER BY column_name;

-- =============================================
-- VERIFICARE: Afișează datele existente (dacă există)
-- =============================================

SELECT 
  id,
  origin_city,
  destination_city,
  pickup_date,
  delivery_date,
  created_at
FROM shipments
ORDER BY created_at DESC
LIMIT 5;

-- =============================================
-- NOTĂ IMPORTANTĂ
-- =============================================
-- După această migrare:
-- - pickup_date și delivery_date vor accepta TIMESTAMP cu TIME
-- - Datele existente vor avea ora 00:00:00+00
-- - Noile înregistrări pot include ora (ex: '2026-03-15T09:30:00')
--
-- ROLLBACK (dacă e nevoie):
-- ALTER TABLE shipments ALTER COLUMN pickup_date TYPE DATE USING pickup_date::DATE;
-- ALTER TABLE shipments ALTER COLUMN delivery_date TYPE DATE USING delivery_date::DATE;
-- =============================================
