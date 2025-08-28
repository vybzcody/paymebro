-- Drop existing restrictive policies
DROP POLICY IF EXISTS "Users can manage own data" ON users;
DROP POLICY IF EXISTS "Users can manage own payment links" ON payment_links;
DROP POLICY IF EXISTS "Users can manage own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can manage own transactions" ON transactions;
DROP POLICY IF EXISTS "Users can manage own customers" ON customers;
DROP POLICY IF EXISTS "Users can manage own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can view own email logs" ON email_logs;
DROP POLICY IF EXISTS "Users can manage own sessions" ON user_sessions;

-- Create new policies that work with frontend anon access
-- Users table
CREATE POLICY "Allow user operations" ON users FOR ALL USING (true);

-- Payment links table  
CREATE POLICY "Allow payment link operations" ON payment_links FOR ALL USING (true);

-- Invoices table
CREATE POLICY "Allow invoice operations" ON invoices FOR ALL USING (true);

-- Transactions table
CREATE POLICY "Allow transaction operations" ON transactions FOR ALL USING (true);

-- Customers table
CREATE POLICY "Allow customer operations" ON customers FOR ALL USING (true);

-- Notifications table
CREATE POLICY "Allow notification operations" ON notifications FOR ALL USING (true);

-- Email logs table
CREATE POLICY "Allow email log operations" ON email_logs FOR ALL USING (true);

-- User sessions table
CREATE POLICY "Allow session operations" ON user_sessions FOR ALL USING (true);

-- Keep the anonymous payment access policy
-- (This one was already correct)
