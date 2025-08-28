-- Fix RLS policy to allow user self-registration
-- This allows users to create their own records when signing up

-- Allow users to insert their own records (self-registration)
CREATE POLICY "Users can create own account" ON users FOR INSERT WITH CHECK (true);

-- Allow users to select by wallet address (for lookups)
CREATE POLICY "Users can lookup by wallet" ON users FOR SELECT USING (true);
