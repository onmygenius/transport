-- Trigger pentru crearea automată a Free Trial la înregistrarea unui client nou
-- Când un user nou se înregistrează cu role='client', primește automat 30 zile Free Trial cu 3 shipments

CREATE OR REPLACE FUNCTION create_free_trial_subscription()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Șterge trigger-ul dacă există deja
DROP TRIGGER IF EXISTS after_client_registration ON profiles;

-- Creează trigger-ul
CREATE TRIGGER after_client_registration
AFTER INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION create_free_trial_subscription();

-- Test: Verifică că trigger-ul a fost creat
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'after_client_registration';
