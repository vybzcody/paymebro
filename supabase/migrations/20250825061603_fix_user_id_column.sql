-- Fix user_id column to support anonymous payments
-- This migration changes user_id from UUID to TEXT and makes it nullable

-- First, store existing RLS policies that depend on user_id
-- We'll need to recreate them after altering the column type

-- Drop RLS policies that depend on user_id column
DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can insert own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can update own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can delete own payment requests" ON payment_requests;
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON transactions;

-- Drop any foreign key constraints on user_id
ALTER TABLE payment_requests 
DROP CONSTRAINT IF EXISTS payment_requests_user_id_fkey;

ALTER TABLE transactions 
DROP CONSTRAINT IF EXISTS transactions_user_id_fkey CASCADE;

-- Change user_id column type from UUID to TEXT and make it nullable
ALTER TABLE payment_requests 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE transactions 
ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT,
ALTER COLUMN user_id DROP NOT NULL;

-- Add indexes for performance on text user_id columns
CREATE INDEX IF NOT EXISTS idx_payment_requests_user_id_text ON payment_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_user_id_text ON transactions(user_id) WHERE user_id IS NOT NULL;

-- Recreate RLS policies with updated logic for TEXT user_id and nullable support
-- Enable RLS on tables
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- Payment requests policies
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (
    user_id IS NULL OR -- Anonymous payments are viewable by anyone
    user_id = auth.uid()::TEXT OR -- User can view their own
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Service role can manage all payment requests" ON payment_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anonymous can insert payment requests" ON payment_requests
  FOR INSERT WITH CHECK (true); -- Allow anonymous payment creation

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id IS NULL OR -- Anonymous transactions
    user_id = auth.uid()::TEXT OR -- User can view their own
    user_id = current_setting('request.jwt.claims', true)::json->>'sub'
  );

CREATE POLICY "Service role can manage all transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can insert transactions" ON transactions
  FOR INSERT WITH CHECK (true); -- Allow transaction creation by system

-- Add comments for documentation
COMMENT ON COLUMN payment_requests.user_id IS 'User identifier - can be null for anonymous payments, text for flexibility';
COMMENT ON COLUMN transactions.user_id IS 'User identifier - can be null for anonymous transactions, text for flexibility';
