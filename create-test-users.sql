-- =============================================
-- FIX TRIGGER + CREATE TEST USERS
-- Run this in Supabase SQL Editor
-- =============================================

-- Step 1: Fix the trigger to handle missing/invalid role gracefully
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  user_role_val user_role;
BEGIN
  BEGIN
    user_role_val := COALESCE(NEW.raw_user_meta_data->>'role', 'client')::user_role;
  EXCEPTION WHEN invalid_text_representation THEN
    user_role_val := 'client';
  END;

  INSERT INTO profiles (id, email, role)
  VALUES (NEW.id, NEW.email, user_role_val)
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 2: Insert admin profile (already created in Auth)
INSERT INTO profiles (id, role, email, full_name, company_name, kyc_status, is_active)
VALUES (
  '0ad7abb9-3826-4866-a104-d600ea42f8d6',
  'admin',
  'admin@admin.ro',
  'Platform Admin',
  'FreightEx Europe',
  'approved',
  true
)
ON CONFLICT (id) DO UPDATE SET role = 'admin', kyc_status = 'approved';

-- Step 3: Create transporter user directly in auth + profile
-- (run after creating user via Auth API or Dashboard)
-- UUID for transportator@firma.ro will be inserted below after creation

-- Temporary: insert profiles for users already in auth.users that failed trigger
-- This will catch any users whose profiles weren't created
INSERT INTO profiles (id, email, role, kyc_status, is_active)
SELECT 
  au.id,
  au.email,
  'client'::user_role,
  'pending'::kyc_status,
  true
FROM auth.users au
LEFT JOIN profiles p ON p.id = au.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;
