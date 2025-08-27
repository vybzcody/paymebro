-- AfriPay Complete Database Schema
-- This script creates the entire database schema from scratch
-- Run this on a fresh database to set up all tables, constraints, indexes, and policies

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(100),
    avatar_url TEXT,
    stripe_customer_id VARCHAR(100) UNIQUE,
    subscription_tier VARCHAR(20) DEFAULT 'free' CHECK (subscription_tier IN ('free', 'starter', 'pro', 'enterprise')),
    api_key_hash VARCHAR(255),
    webhook_url TEXT,
    webhook_secret VARCHAR(255),
    settings JSONB DEFAULT '{}',
    onboarding_completed BOOLEAN DEFAULT FALSE,
    email_verified BOOLEAN DEFAULT FALSE,
    phone VARCHAR(20),
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLE
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(100),
    phone VARCHAR(20),
    default_currency VARCHAR(10) DEFAULT 'USDC',
    timezone VARCHAR(50) DEFAULT 'UTC',
    preferred_language VARCHAR(10) DEFAULT 'en',
    email_notifications BOOLEAN DEFAULT TRUE,
    sms_notifications BOOLEAN DEFAULT FALSE,
    tax_exempt BOOLEAN DEFAULT FALSE,
    tax_ids JSONB DEFAULT '[]', -- Array of tax IDs
    shipping_address JSONB DEFAULT '{}',
    billing_address JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, email)
);

-- =====================================================
-- SUBSCRIPTION PLANS TABLE
-- =====================================================
CREATE TABLE subscription_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features JSONB DEFAULT '[]',
    limits JSONB DEFAULT '{}', -- e.g., {"transactions_per_month": 1000, "api_calls_per_day": 10000}
    stripe_price_id_monthly VARCHAR(100),
    stripe_price_id_yearly VARCHAR(100),
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USER SUBSCRIPTIONS TABLE
-- =====================================================
CREATE TABLE user_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES subscription_plans(id),
    stripe_subscription_id VARCHAR(100) UNIQUE,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'past_due', 'unpaid', 'incomplete')),
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    cancel_at_period_end BOOLEAN DEFAULT FALSE,
    billing_cycle VARCHAR(10) DEFAULT 'monthly' CHECK (billing_cycle IN ('monthly', 'yearly')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    customer_id UUID REFERENCES customers(id),
    invoice_number VARCHAR(50) UNIQUE,
    due_date TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    currency VARCHAR(10) DEFAULT 'USDC',
    subtotal DECIMAL(20,8) NOT NULL DEFAULT 0,
    tax_amount DECIMAL(20,8) DEFAULT 0,
    total_amount DECIMAL(20,8) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(20,8) DEFAULT 0,
    amount_due DECIMAL(20,8) NOT NULL DEFAULT 0,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible')),
    auto_advance BOOLEAN DEFAULT TRUE,
    collection_method VARCHAR(20) DEFAULT 'charge_automatically',
    hosted_invoice_url TEXT,
    invoice_pdf TEXT,
    receipt_number VARCHAR(50),
    statement_descriptor VARCHAR(100),
    footer TEXT,
    memo TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICE LINE ITEMS TABLE
-- =====================================================
CREATE TABLE invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_amount DECIMAL(20,8) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- PAYMENT REQUESTS TABLE
-- =====================================================
CREATE TABLE payment_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Nullable for anonymous payments, TEXT for flexibility
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    reference TEXT UNIQUE NOT NULL,
    amount_usdc DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL', 'EURC', 'BTC')),
    description TEXT NOT NULL,
    recipient_wallet TEXT NOT NULL,
    payment_url TEXT NOT NULL,
    qr_code_url TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'cancelled')),
    success_url TEXT,
    cancel_url TEXT,
    webhook_url TEXT,
    attempts INTEGER DEFAULT 0,
    last_attempt_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    failed_at TIMESTAMPTZ,
    failure_reason TEXT,
    expires_at TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT, -- Nullable for anonymous transactions, TEXT for flexibility
    customer_id UUID REFERENCES customers(id),
    invoice_id UUID REFERENCES invoices(id),
    payment_request_id UUID REFERENCES payment_requests(id),
    signature TEXT UNIQUE NOT NULL,
    reference TEXT NOT NULL,
    amount_usdc DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL', 'EURC', 'BTC')),
    platform_fee DECIMAL(20,8) DEFAULT 0,
    net_amount DECIMAL(20,8),
    sender_wallet TEXT,
    recipient_wallet TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'failed')),
    block_time TIMESTAMPTZ,
    confirmation_count INTEGER DEFAULT 1,
    description TEXT,
    email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    receipt_url TEXT,
    refund_status VARCHAR(20) DEFAULT 'none' CHECK (refund_status IN ('none', 'partial', 'full', 'pending')),
    refunded_amount DECIMAL(20,8) DEFAULT 0,
    dispute_status VARCHAR(20) DEFAULT 'none' CHECK (dispute_status IN ('none', 'warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- EMAIL LOGS TABLE
-- =====================================================
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id),
    payment_request_id UUID REFERENCES payment_requests(id),
    transaction_id UUID REFERENCES transactions(id),
    invoice_id UUID REFERENCES invoices(id),
    email_type VARCHAR(50) NOT NULL, -- 'payment_confirmation', 'invoice', 'receipt', 'refund', 'failure'
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked')),
    provider VARCHAR(50), -- 'resend', 'sendgrid', 'ses', etc.
    provider_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- WEBHOOK EVENTS TABLE
-- =====================================================
CREATE TABLE webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    payment_request_id UUID REFERENCES payment_requests(id),
    transaction_id UUID REFERENCES transactions(id),
    event_type VARCHAR(50) NOT NULL, -- 'payment.completed', 'payment.failed', 'invoice.paid', etc.
    webhook_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'sent', 'failed', 'retry', 'abandoned')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    response_status_code INTEGER,
    response_body TEXT,
    next_retry_at TIMESTAMPTZ,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- API KEYS TABLE
-- =====================================================
CREATE TABLE api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL, -- First few chars for identification
    permissions JSONB DEFAULT '["read", "write"]',
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL, -- 'payment_received', 'subscription_ending', 'new_feature', etc.
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- ANALYTICS EVENTS TABLE
-- =====================================================
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    event_type VARCHAR(50) NOT NULL, -- 'page_view', 'payment_created', 'api_call', etc.
    event_data JSONB DEFAULT '{}',
    session_id VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    referrer TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- USAGE RECORDS TABLE
-- =====================================================
CREATE TABLE usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES user_subscriptions(id),
    metric_name VARCHAR(50) NOT NULL, -- 'transactions', 'api_calls', 'storage_mb'
    quantity INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    period_start TIMESTAMPTZ,
    period_end TIMESTAMPTZ,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_stripe_customer_id ON users(stripe_customer_id);
CREATE INDEX idx_users_created_at ON users(created_at);

-- Customers indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_created_at ON customers(created_at);

-- Payment requests indexes
CREATE INDEX idx_payment_requests_user_id ON payment_requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_payment_requests_customer_id ON payment_requests(customer_id);
CREATE INDEX idx_payment_requests_reference ON payment_requests(reference);
CREATE INDEX idx_payment_requests_status ON payment_requests(status);
CREATE INDEX idx_payment_requests_created_at ON payment_requests(created_at);
CREATE INDEX idx_payment_requests_expires_at ON payment_requests(expires_at);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX idx_transactions_payment_request_id ON transactions(payment_request_id);
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- Email logs indexes
CREATE INDEX idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_created_at ON email_logs(created_at);

-- Webhook events indexes
CREATE INDEX idx_webhook_events_status ON webhook_events(status);
CREATE INDEX idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX idx_webhook_events_next_retry ON webhook_events(next_retry_at) WHERE status = 'retry';

-- Invoices indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);

-- API keys indexes
CREATE INDEX idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX idx_api_keys_is_active ON api_keys(is_active);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Analytics indexes
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Usage records indexes
CREATE INDEX idx_usage_records_user_id ON usage_records(user_id);
CREATE INDEX idx_usage_records_metric ON usage_records(metric_name);
CREATE INDEX idx_usage_records_timestamp ON usage_records(timestamp);

-- =====================================================
-- FUNCTIONS AND TRIGGERS
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                             LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
                             LPAD((SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 'INV-\\d{4}-\\d{3}-(\\d+)')::INTEGER), 0) + 1 
                                   FROM invoices 
                                   WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || TO_CHAR(NOW(), 'DDD') || '-%')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables with updated_at column
CREATE TRIGGER trigger_users_updated_at
    BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_customers_updated_at
    BEFORE UPDATE ON customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_subscription_plans_updated_at
    BEFORE UPDATE ON subscription_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_user_subscriptions_updated_at
    BEFORE UPDATE ON user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_payment_requests_updated_at
    BEFORE UPDATE ON payment_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_api_keys_updated_at
    BEFORE UPDATE ON api_keys
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_notifications_updated_at
    BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Invoice number generation trigger
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW EXECUTE FUNCTION generate_invoice_number();

-- =====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoice_line_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE webhook_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Service role can manage all users" ON users
  FOR ALL USING (auth.role() = 'service_role');

-- Customers policies
CREATE POLICY "Users can manage own customers" ON customers
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all customers" ON customers
  FOR ALL USING (auth.role() = 'service_role');

-- Payment requests policies
CREATE POLICY "Users can view own payment requests" ON payment_requests
  FOR SELECT USING (
    user_id IS NULL OR 
    user_id = auth.uid()::TEXT OR
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all payment requests" ON payment_requests
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "Anonymous can create payment requests" ON payment_requests
  FOR INSERT WITH CHECK (true);

-- Transactions policies
CREATE POLICY "Users can view own transactions" ON transactions
  FOR SELECT USING (
    user_id IS NULL OR
    user_id = auth.uid()::TEXT OR 
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all transactions" ON transactions
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can create transactions" ON transactions
  FOR INSERT WITH CHECK (true);

-- Email logs policies
CREATE POLICY "Users can view own email logs" ON email_logs
  FOR SELECT USING (
    user_id = auth.uid() OR
    customer_id IN (SELECT id FROM customers WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all email logs" ON email_logs
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can create email logs" ON email_logs
  FOR INSERT WITH CHECK (true);

-- Webhook events policies
CREATE POLICY "Users can view own webhook events" ON webhook_events
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all webhook events" ON webhook_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can manage webhook events" ON webhook_events
  FOR ALL WITH CHECK (true);

-- Invoices policies
CREATE POLICY "Users can manage own invoices" ON invoices
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all invoices" ON invoices
  FOR ALL USING (auth.role() = 'service_role');

-- Invoice line items policies
CREATE POLICY "Users can manage own invoice line items" ON invoice_line_items
  FOR ALL USING (
    invoice_id IN (SELECT id FROM invoices WHERE user_id = auth.uid())
  );

CREATE POLICY "Service role can manage all invoice line items" ON invoice_line_items
  FOR ALL USING (auth.role() = 'service_role');

-- API keys policies
CREATE POLICY "Users can manage own API keys" ON api_keys
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all API keys" ON api_keys
  FOR ALL USING (auth.role() = 'service_role');

-- Notifications policies
CREATE POLICY "Users can manage own notifications" ON notifications
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all notifications" ON notifications
  FOR ALL USING (auth.role() = 'service_role');

-- Analytics events policies
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (user_id = auth.uid() OR user_id IS NULL);

CREATE POLICY "Service role can manage all analytics" ON analytics_events
  FOR ALL USING (auth.role() = 'service_role');

CREATE POLICY "System can create analytics events" ON analytics_events
  FOR INSERT WITH CHECK (true);

-- Usage records policies
CREATE POLICY "Users can view own usage" ON usage_records
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Service role can manage all usage records" ON usage_records
  FOR ALL USING (auth.role() = 'service_role');

-- Subscription plans (public read)
ALTER TABLE subscription_plans DISABLE ROW LEVEL SECURITY;

-- =====================================================
-- INITIAL DATA
-- =====================================================

-- Insert default subscription plans
INSERT INTO subscription_plans (name, description, price_monthly, price_yearly, features, limits) VALUES
('Free', 'Perfect for getting started', 0, 0, '["Basic payment processing", "Up to 100 transactions/month", "Email support"]', '{"transactions_per_month": 100, "api_calls_per_day": 1000}'),
('Starter', 'For growing businesses', 29, 290, '["Everything in Free", "Up to 1,000 transactions/month", "Priority support", "Custom branding"]', '{"transactions_per_month": 1000, "api_calls_per_day": 10000}'),
('Pro', 'For established businesses', 99, 990, '["Everything in Starter", "Up to 10,000 transactions/month", "Advanced analytics", "API access", "Webhook support"]', '{"transactions_per_month": 10000, "api_calls_per_day": 50000}'),
('Enterprise', 'For large organizations', 299, 2990, '["Everything in Pro", "Unlimited transactions", "Dedicated support", "Custom integrations", "SLA guarantee"]', '{"transactions_per_month": -1, "api_calls_per_day": -1}');

-- =====================================================
-- COMMENTS FOR DOCUMENTATION
-- =====================================================
COMMENT ON TABLE users IS 'Main users table for AfriPay account holders';
COMMENT ON TABLE customers IS 'Customer records for each user';
COMMENT ON TABLE payment_requests IS 'Payment requests created by merchants';
COMMENT ON TABLE transactions IS 'Completed blockchain transactions';
COMMENT ON TABLE email_logs IS 'Track all email communications sent to customers';
COMMENT ON TABLE webhook_events IS 'Track webhook deliveries and retry attempts';
COMMENT ON TABLE invoices IS 'Customer invoices with automatic numbering';
COMMENT ON TABLE invoice_line_items IS 'Individual line items for invoices';
COMMENT ON TABLE api_keys IS 'API keys for programmatic access';
COMMENT ON TABLE notifications IS 'In-app notifications for users';
COMMENT ON TABLE analytics_events IS 'Track user behavior and system events';
COMMENT ON TABLE usage_records IS 'Track usage metrics for billing';

COMMENT ON COLUMN payment_requests.user_id IS 'User identifier - can be null for anonymous payments';
COMMENT ON COLUMN transactions.user_id IS 'User identifier - can be null for anonymous transactions';
COMMENT ON COLUMN payment_requests.status IS 'Current status of the payment request';
COMMENT ON COLUMN transactions.email_sent IS 'Whether confirmation email was sent';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated unique invoice number';

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================
DO $$
BEGIN
    RAISE NOTICE 'AfriPay database schema created successfully!';
    RAISE NOTICE 'Created % tables with full RLS policies and indexes', (
        SELECT COUNT(*) FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_type = 'BASE TABLE'
    );
END $$;
