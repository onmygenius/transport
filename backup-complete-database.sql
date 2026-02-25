-- =============================================
-- BACKUP COMPLET BAZA DE DATE
-- Data: 2026-02-25
-- Înainte de migrarea pickup_date și delivery_date la TIMESTAMPTZ
-- =============================================

-- BACKUP TOATE TABELELE (doar datele, nu schema)

-- 1. PROFILES
CREATE TABLE IF NOT EXISTS profiles_backup AS SELECT * FROM profiles;

-- 2. TRANSPORTER PROFILES
CREATE TABLE IF NOT EXISTS transporter_profiles_backup AS SELECT * FROM transporter_profiles;

-- 3. CLIENT PROFILES
CREATE TABLE IF NOT EXISTS client_profiles_backup AS SELECT * FROM client_profiles;

-- 4. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions_backup AS SELECT * FROM subscriptions;

-- 5. SHIPMENTS (IMPORTANT!)
CREATE TABLE IF NOT EXISTS shipments_backup AS SELECT * FROM shipments;

-- 6. OFFERS
CREATE TABLE IF NOT EXISTS offers_backup AS SELECT * FROM offers;

-- 7. TRUCK AVAILABILITY
CREATE TABLE IF NOT EXISTS truck_availability_backup AS SELECT * FROM truck_availability;

-- 8. DOCUMENTS
CREATE TABLE IF NOT EXISTS documents_backup AS SELECT * FROM documents;

-- 9. DISPUTES
CREATE TABLE IF NOT EXISTS disputes_backup AS SELECT * FROM disputes;

-- 10. MESSAGES
CREATE TABLE IF NOT EXISTS messages_backup AS SELECT * FROM messages;

-- 11. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications_backup AS SELECT * FROM notifications;

-- 12. REVIEWS
CREATE TABLE IF NOT EXISTS reviews_backup AS SELECT * FROM reviews;

-- 13. TRANSACTIONS
CREATE TABLE IF NOT EXISTS transactions_backup AS SELECT * FROM transactions;

-- 14. SYSTEM SETTINGS
CREATE TABLE IF NOT EXISTS system_settings_backup AS SELECT * FROM system_settings;

-- =============================================
-- VERIFICARE BACKUP
-- =============================================

-- Verifică numărul de înregistrări în fiecare tabel
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'shipments', COUNT(*) FROM shipments
UNION ALL
SELECT 'offers', COUNT(*) FROM offers
UNION ALL
SELECT 'subscriptions', COUNT(*) FROM subscriptions
UNION ALL
SELECT 'transporter_profiles', COUNT(*) FROM transporter_profiles
UNION ALL
SELECT 'client_profiles', COUNT(*) FROM client_profiles;

-- =============================================
-- NOTĂ IMPORTANTĂ
-- =============================================
-- Aceste tabele de backup vor rămâne în baza de date.
-- Dacă vrei să restaurezi datele după migrare, poți folosi:
-- 
-- RESTORE EXAMPLE (NU RULA ACUM!):
-- TRUNCATE shipments;
-- INSERT INTO shipments SELECT * FROM shipments_backup;
-- 
-- Pentru a șterge backup-urile după ce ești sigur că totul funcționează:
-- DROP TABLE profiles_backup;
-- DROP TABLE shipments_backup;
-- etc.
-- =============================================
