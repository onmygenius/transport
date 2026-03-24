-- Fix pentru trigger Free Trial - adaugă SECURITY DEFINER pentru a permite INSERT în subscriptions
-- Problema: Policy-ul pentru subscriptions permite INSERT doar pentru service_role
-- Soluția: Funcția trigger rulează cu privilegii de owner (postgres)

CREATE OR REPLACE FUNCTION create_free_trial_subscription()
RETURNS TRIGGER 
SECURITY DEFINER  -- ✅ Rulează cu privilegii de owner, nu de user
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Doar pentru clienți (nu pentru transportatori)
  IF NEW.role = 'client' THEN
    -- Creează subscription Free Trial
    INSERT INTO subscriptions (
      user_id,
      plan,
      plan_name,
      status,
      price,
      currency,
      shipments_limit,
      shipments_used,
      starts_at,
      expires_at,
      trial_ends_at
    ) VALUES (
      NEW.id,
      'free_trial',
      'Free Trial',
      'trialing',
      0.00,
      'EUR',
      3,  -- 3 shipments gratuite
      0,
      NOW(),
      NOW() + INTERVAL '30 days',
      NOW() + INTERVAL '30 days'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Verifică că funcția a fost actualizată
SELECT proname, prosecdef 
FROM pg_proc 
WHERE proname = 'create_free_trial_subscription';
