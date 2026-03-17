-- Test notification system
-- This will insert a test notification for your user

-- STEP 1: Verify user exists
SELECT id, email, role FROM profiles WHERE email = 'client@firma.ro';

-- STEP 2: Insert a test notification
INSERT INTO notifications (user_id, type, title, message, link, is_read)
VALUES (
  'e81b84d9-4678-4403-a414-5f3e3fcc6e8a',
  'offer_accepted',
  'Test Notification 🎉',
  'This is a test notification to verify the notification system works',
  '/dashboard/client/shipments',
  false
);

-- STEP 3: Verify the notification was created
SELECT * FROM notifications WHERE user_id = 'e81b84d9-4678-4403-a414-5f3e3fcc6e8a' ORDER BY created_at DESC LIMIT 5;

-- STEP 4: Check unread count
SELECT COUNT(*) as unread_count FROM notifications WHERE user_id = 'e81b84d9-4678-4403-a414-5f3e3fcc6e8a' AND is_read = false;
