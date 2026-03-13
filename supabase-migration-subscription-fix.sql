-- =============================================
-- MIGRATION: Fix Subscription Schema
-- Data: 13 Martie 2026
-- Scop: Schimbă ENUM la TEXT și adaugă trial_ends_at
-- =============================================

-- 1. Modifică coloana 'plan' de la ENUM la TEXT
ALTER TABLE subscriptions 
  ALTER COLUMN plan TYPE TEXT;

-- 2. Modifică coloana 'status' de la ENUM la TEXT (pentru flexibilitate)
ALTER TABLE subscriptions 
  ALTER COLUMN status TYPE TEXT;

-- 3. Adaugă coloana trial_ends_at
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMPTZ;

-- 4. Adaugă coloana plan_name pentru display (ex: "Starter", "Professional")
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS plan_name TEXT;

-- 5. Adaugă coloana shipments_limit pentru limite per plan
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS shipments_limit INTEGER;

-- 6. Adaugă coloana shipments_used pentru tracking usage
ALTER TABLE subscriptions 
  ADD COLUMN IF NOT EXISTS shipments_used INTEGER DEFAULT 0;

-- 7. Update system_settings pentru trial_days
UPDATE system_settings 
SET value = '30' 
WHERE key = 'trial_days';

-- 8. Șterge ENUM-urile vechi (dacă nu sunt folosite în alte tabele)
-- ATENȚIE: Rulează doar dacă ești sigur că nu sunt folosite
-- DROP TYPE IF EXISTS subscription_plan CASCADE;
-- DROP TYPE IF EXISTS subscription_status CASCADE;

-- 9. Creează index pentru performanță
CREATE INDEX IF NOT EXISTS idx_subscriptions_trial_ends_at 
  ON subscriptions(trial_ends_at);

CREATE INDEX IF NOT EXISTS idx_subscriptions_plan 
  ON subscriptions(plan);

-- 10. Comentarii pentru documentație
COMMENT ON COLUMN subscriptions.plan IS 'Plan type: starter, professional, enterprise, basic, growth, premium';
COMMENT ON COLUMN subscriptions.status IS 'Status: active, trialing, past_due, canceled, incomplete, incomplete_expired, unpaid';
COMMENT ON COLUMN subscriptions.trial_ends_at IS 'When the trial period ends (30 days from subscription start)';
COMMENT ON COLUMN subscriptions.plan_name IS 'Display name for the plan (e.g., "Starter", "Professional")';
COMMENT ON COLUMN subscriptions.shipments_limit IS 'Maximum shipments per month (NULL = unlimited)';
COMMENT ON COLUMN subscriptions.shipments_used IS 'Number of shipments used in current period';

-- =============================================
-- VERIFICARE
-- =============================================

-- Verifică structura tabelei
SELECT 
  column_name, 
  data_type, 
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'subscriptions'
ORDER BY ordinal_position;
