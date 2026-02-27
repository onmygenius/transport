-- Check RLS policies on offers table
-- Run this in Supabase Dashboard -> SQL Editor to see if DELETE is allowed

SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'offers';
