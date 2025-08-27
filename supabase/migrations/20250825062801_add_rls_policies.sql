-- Add Row Level Security policies for new tables
-- This ensures proper access control for email logs and webhook events

-- 1. Enable RLS on new tables
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;

-- 2. Email logs policies
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    user_id IS NULL AND customer_id IN (
      SELECT id FROM customers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can manage all email logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can insert email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- 3. Webhook events policies
CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all webhook events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage webhook events" ON webhook_events
  FOR ALL WITH CHECK (true);

-- 4. Invoice line items policies
CREATE POLICY "Users can view own invoice line items" ON invoice_line_items
  FOR SELECT USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Service role can manage all invoice line items" ON invoice_line_items
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own invoice line items" ON invoice_line_items
  FOR ALL USING (
    invoice_id IN (
      SELECT id FROM invoices WHERE customer_id IN (
        SELECT id FROM customers WHERE user_id = auth.uid()
      )
    )
  );

-- 5. Update existing policies to work with enhanced tables
-- Drop and recreate policies for enhanced tables with new columns

-- Payment requests policies (updated for customer_id relationship)
DROP POLICY IF EXISTS "Users can view own payment requests" ON payment_requests;
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (
    user_id IS NULL OR 
    user_id = auth.uid()::TEXT OR
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Transactions policies (updated for customer_id relationship)  
DROP POLICY IF EXISTS "Users can view own transactions" ON transactions;
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id IS NULL OR
    user_id = auth.uid()::TEXT OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

-- Invoices policies (assuming they exist, update them)
DROP POLICY IF EXISTS "Users can view own invoices" ON invoices;
CREATE POLICY "Users can view own invoices" ON invoices
  FOR SELECT USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );
