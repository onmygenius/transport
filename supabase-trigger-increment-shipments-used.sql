-- Trigger pentru auto-increment shipments_used când se creează un shipment nou
-- Acest trigger se execută DUPĂ inserarea unui shipment și incrementează shipments_used pentru subscription-ul clientului

CREATE OR REPLACE FUNCTION increment_shipments_used()
RETURNS TRIGGER AS $$
BEGIN
  -- Incrementează shipments_used pentru subscription-ul clientului
  UPDATE subscriptions
  SET 
    shipments_used = COALESCE(shipments_used, 0) + 1,
    updated_at = NOW()
  WHERE user_id = NEW.client_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Șterge trigger-ul dacă există deja
DROP TRIGGER IF EXISTS after_shipment_insert ON shipments;

-- Creează trigger-ul
CREATE TRIGGER after_shipment_insert
AFTER INSERT ON shipments
FOR EACH ROW
EXECUTE FUNCTION increment_shipments_used();

-- Test: Verifică că trigger-ul a fost creat
SELECT 
  trigger_name, 
  event_manipulation, 
  event_object_table, 
  action_statement
FROM information_schema.triggers
WHERE trigger_name = 'after_shipment_insert';
