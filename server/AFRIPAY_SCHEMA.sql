-- AfriPay Complete Database Schema
-- Web3Auth Integration: "Login with Google/Social, get paid in SOL/USDC"
-- Focus: User control, business metrics, payment tracking, notifications

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================
-- USERS TABLE (Web3Auth Integration)
-- =====================================================
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Web3Auth Identity (Required)
    wallet_address TEXT UNIQUE NOT NULL, -- Solana wallet from Web3Auth
    web3auth_user_id TEXT UNIQUE NOT NULL, -- Web3Auth user identifier
    
    -- Profile Information
    email TEXT UNIQUE, -- May be null for some Web3Auth providers
    name TEXT, -- From Web3Auth profile
    username TEXT UNIQUE, -- Optional, user-controlled handle
    avatar_url TEXT,
    
    -- Business Information (Optional)
    business_name TEXT,
    business_description TEXT,
    website_url TEXT,
    
    -- Web3Auth Metadata
    login_provider TEXT NOT NULL, -- 'google', 'discord', 'twitter', etc.
    web3auth_verifier TEXT,
    web3auth_verifier_id TEXT,
    
    -- User Preferences
    notification_preferences JSONB DEFAULT '{
        "email_enabled": true,
        "payment_alerts": true,
        "weekly_reports": false,
        "marketing": false
    }',
    
    -- Account Status
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- AFRIPAY CONFIGURATION TABLE
-- =====================================================
CREATE TABLE afripay_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Fee Collection
    fee_wallet_address TEXT NOT NULL, -- AfriPay's Solana wallet for fee collection
    fee_percentage DECIMAL(5,4) DEFAULT 0.025, -- 2.5%
    fee_fixed_amount DECIMAL(10,6) DEFAULT 0.25, -- $0.25
    
    -- Supported Currencies
    supported_currencies JSONB DEFAULT '["USDC", "SOL"]',
    
    -- Network Configuration
    solana_network TEXT DEFAULT 'devnet' CHECK (solana_network IN ('mainnet', 'devnet', 'testnet')),
    usdc_mint_address TEXT DEFAULT '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', -- Devnet USDC
    
    -- Business Settings
    company_name TEXT DEFAULT 'AfriPay',
    support_email TEXT DEFAULT 'support@afripay.com',
    
    -- API Configuration
    frontend_url TEXT DEFAULT 'https://afripay.com',
    webhook_secret TEXT,
    
    -- Feature Flags
    features JSONB DEFAULT '{
        "split_payments": true,
        "invoice_emails": true,
        "analytics": true,
        "notifications": true
    }',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default configuration
INSERT INTO afripay_config (
    fee_wallet_address,
    fee_percentage,
    fee_fixed_amount
) VALUES (
    'EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn', -- AfriPay wallet Metamask
    0.025, -- 2.5%
    0.25   -- $0.25
);

-- =====================================================
-- PAYMENT LINKS TABLE
-- =====================================================
CREATE TABLE payment_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Link Details
    title TEXT NOT NULL,
    description TEXT,
    reference TEXT UNIQUE NOT NULL,
    
    -- Payment Configuration
    amount DECIMAL(20, 6) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL')),
    
    -- URLs and QR
    payment_url TEXT NOT NULL,
    qr_code_data TEXT, -- Base64 QR code or URL
    
    -- Settings
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    max_uses INTEGER, -- NULL = unlimited
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    payment_count INTEGER DEFAULT 0,
    total_collected DECIMAL(20, 6) DEFAULT 0,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- INVOICES TABLE
-- =====================================================
CREATE TABLE invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Invoice Identity
    invoice_number TEXT UNIQUE NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    
    -- Customer Information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    billing_address JSONB,
    
    -- Invoice Details
    amount DECIMAL(20, 6) NOT NULL CHECK (amount > 0),
    currency TEXT DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL')),
    tax_amount DECIMAL(20, 6) DEFAULT 0,
    discount_amount DECIMAL(20, 6) DEFAULT 0,
    total_amount DECIMAL(20, 6) NOT NULL,
    
    -- Content
    description TEXT NOT NULL,
    line_items JSONB DEFAULT '[]', -- Array of {description, quantity, rate, amount}
    notes TEXT,
    terms_conditions TEXT,
    
    -- Payment Information
    payment_url TEXT,
    qr_code_data TEXT,
    
    -- Status and Dates
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled')),
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    sent_at TIMESTAMPTZ,
    viewed_at TIMESTAMPTZ,
    paid_at TIMESTAMPTZ,
    
    -- Payment Tracking
    payment_link_id UUID REFERENCES payment_links(id),
    transaction_signature TEXT,
    
    -- Metadata
    custom_fields JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- TRANSACTIONS TABLE
-- =====================================================
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Transaction Identity
    signature TEXT UNIQUE, -- Solana transaction signature
    reference TEXT NOT NULL,
    
    -- Source Tracking
    payment_link_id UUID REFERENCES payment_links(id),
    invoice_id UUID REFERENCES invoices(id),
    
    -- Payment Details (Split Payment Model)
    amount DECIMAL(20, 6) NOT NULL, -- Total amount customer paid
    currency TEXT NOT NULL,
    platform_fee DECIMAL(20, 6) DEFAULT 0, -- AfriPay's fee (2.5% + $0.25)
    net_amount DECIMAL(20, 6) NOT NULL, -- Amount merchant receives (amount - platform_fee)
    
    -- Wallet Information
    sender_wallet TEXT,
    recipient_wallet TEXT NOT NULL, -- Merchant wallet
    fee_wallet TEXT, -- AfriPay fee collection wallet
    
    -- Split Payment Details
    total_amount_paid DECIMAL(20, 6) NOT NULL, -- What customer actually paid
    merchant_amount DECIMAL(20, 6) NOT NULL, -- What merchant received
    fee_amount DECIMAL(20, 6) NOT NULL, -- What AfriPay received
    
    -- Blockchain Data
    block_time TIMESTAMPTZ,
    slot BIGINT,
    confirmation_count INTEGER DEFAULT 0,
    
    -- Status
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'failed', 'expired')),
    
    -- Customer Information (for analytics)
    customer_email TEXT,
    customer_name TEXT,
    customer_ip INET,
    
    -- Transaction Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =====================================================
-- CUSTOMERS TABLE (Analytics & CRM)
-- =====================================================
CREATE TABLE customers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Customer Identity
    email TEXT NOT NULL,
    name TEXT,
    phone TEXT,
    
    -- Customer Data
    total_spent DECIMAL(20, 6) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    first_purchase_at TIMESTAMPTZ,
    last_purchase_at TIMESTAMPTZ,
    
    -- Customer Preferences
    preferred_currency TEXT DEFAULT 'USDC',
    communication_preferences JSONB DEFAULT '{"email": true}',
    
    -- Address Information
    billing_address JSONB,
    shipping_address JSONB,
    
    -- Customer Metadata
    tags TEXT[], -- For segmentation
    notes TEXT,
    custom_fields JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(user_id, email)
);

-- =====================================================
-- NOTIFICATIONS TABLE
-- =====================================================
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Notification Details
    type TEXT NOT NULL, -- 'payment_received', 'invoice_paid', 'weekly_report', etc.
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    
    -- Related Records
    transaction_id UUID REFERENCES transactions(id),
    invoice_id UUID REFERENCES invoices(id),
    payment_link_id UUID REFERENCES payment_links(id),
    
    -- Status
    is_read BOOLEAN DEFAULT FALSE,
    is_email_sent BOOLEAN DEFAULT FALSE,
    email_sent_at TIMESTAMPTZ,
    
    -- Notification Data
    action_url TEXT, -- Deep link to relevant page
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    read_at TIMESTAMPTZ
);

-- =====================================================
-- EMAIL LOGS TABLE
-- =====================================================
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Email Details
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'invoice', 'payment_confirmation', 'receipt', 'notification'
    
    -- Related Records
    invoice_id UUID REFERENCES invoices(id),
    transaction_id UUID REFERENCES transactions(id),
    notification_id UUID REFERENCES notifications(id),
    
    -- Email Status
    status TEXT DEFAULT 'sent' CHECK (status IN ('sent', 'delivered', 'opened', 'clicked', 'bounced', 'failed')),
    provider_message_id TEXT,
    
    -- Tracking
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    
    -- Email Content Reference
    template_name TEXT,
    template_data JSONB DEFAULT '{}'
);

-- =====================================================
-- USER SESSIONS TABLE (Analytics)
-- =====================================================
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    -- Session Information
    session_token TEXT UNIQUE,
    ip_address INET,
    user_agent TEXT,
    
    -- Web3Auth Session Data
    web3auth_session_id TEXT,
    login_method TEXT, -- 'google', 'email', etc.
    
    -- Session Tracking
    started_at TIMESTAMPTZ DEFAULT NOW(),
    last_activity_at TIMESTAMPTZ DEFAULT NOW(),
    ended_at TIMESTAMPTZ,
    
    -- Activity Metrics
    page_views INTEGER DEFAULT 0,
    actions_performed JSONB DEFAULT '[]',
    
    -- Device Information
    device_type TEXT, -- 'desktop', 'mobile', 'tablet'
    browser TEXT,
    os TEXT,
    country TEXT,
    
    -- Status
    is_active BOOLEAN DEFAULT TRUE
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_web3auth_user_id ON users(web3auth_user_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_login_provider ON users(login_provider);

-- Payment links indexes
CREATE INDEX idx_payment_links_user_id ON payment_links(user_id);
CREATE INDEX idx_payment_links_reference ON payment_links(reference);
CREATE INDEX idx_payment_links_is_active ON payment_links(is_active);
CREATE INDEX idx_payment_links_created_at ON payment_links(created_at);

-- Invoices indexes
CREATE INDEX idx_invoices_user_id ON invoices(user_id);
CREATE INDEX idx_invoices_customer_email ON invoices(customer_email);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_reference ON invoices(reference);
CREATE INDEX idx_invoices_invoice_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_due_date ON invoices(due_date);

-- Transactions indexes
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_customer_email ON transactions(customer_email);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_payment_link_id ON transactions(payment_link_id);
CREATE INDEX idx_transactions_fee_wallet ON transactions(fee_wallet);
CREATE INDEX idx_transactions_total_amount_paid ON transactions(total_amount_paid);

-- AfriPay config indexes
CREATE INDEX idx_afripay_config_fee_wallet ON afripay_config(fee_wallet_address);

-- Customers indexes
CREATE INDEX idx_customers_user_id ON customers(user_id);
CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_last_purchase_at ON customers(last_purchase_at);

-- Notifications indexes
CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

-- Email logs indexes
CREATE INDEX idx_email_logs_user_id ON email_logs(user_id);
CREATE INDEX idx_email_logs_recipient_email ON email_logs(recipient_email);
CREATE INDEX idx_email_logs_email_type ON email_logs(email_type);
CREATE INDEX idx_email_logs_status ON email_logs(status);

-- User sessions indexes
CREATE INDEX idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_is_active ON user_sessions(is_active);
CREATE INDEX idx_user_sessions_started_at ON user_sessions(started_at);

-- =====================================================
-- FUNCTIONS
-- =====================================================

-- Generate unique invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    year_suffix TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
    count_today INTEGER;
BEGIN
    SELECT COUNT(*) + 1 INTO count_today
    FROM invoices 
    WHERE DATE(created_at) = CURRENT_DATE;
    
    RETURN 'INV-' || year_suffix || '-' || LPAD(count_today::TEXT, 4, '0');
END;
$$;

-- Calculate platform fee (2.5% + $0.25)
CREATE OR REPLACE FUNCTION calculate_platform_fee(amount DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN ROUND((amount * 0.025 + 0.25), 6);
END;
$$;

-- Create split payment transaction
CREATE OR REPLACE FUNCTION create_split_payment_transaction(
    p_user_id UUID,
    p_total_amount DECIMAL,
    p_recipient_wallet TEXT,
    p_payment_link_id UUID DEFAULT NULL,
    p_invoice_id UUID DEFAULT NULL,
    p_currency TEXT DEFAULT 'USDC',
    p_sender_wallet TEXT DEFAULT NULL,
    p_customer_email TEXT DEFAULT NULL,
    p_customer_name TEXT DEFAULT NULL,
    p_reference TEXT DEFAULT NULL,
    p_signature TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    transaction_id UUID;
    platform_fee DECIMAL;
    merchant_amount DECIMAL;
    fee_wallet TEXT;
BEGIN
    -- Get current fee configuration
    SELECT fee_wallet_address INTO fee_wallet
    FROM afripay_config
    LIMIT 1;
    
    -- Calculate fees using current rates
    platform_fee := calculate_platform_fee(p_total_amount);
    merchant_amount := p_total_amount - platform_fee;
    
    -- Insert transaction record
    INSERT INTO transactions (
        user_id,
        payment_link_id,
        invoice_id,
        amount,
        currency,
        platform_fee,
        net_amount,
        sender_wallet,
        recipient_wallet,
        fee_wallet,
        total_amount_paid,
        merchant_amount,
        fee_amount,
        customer_email,
        customer_name,
        reference,
        signature,
        status,
        created_at
    ) VALUES (
        p_user_id,
        p_payment_link_id,
        p_invoice_id,
        p_total_amount,
        p_currency,
        platform_fee,
        merchant_amount,
        p_sender_wallet,
        p_recipient_wallet,
        fee_wallet,
        p_total_amount,
        merchant_amount,
        platform_fee,
        p_customer_email,
        p_customer_name,
        p_reference,
        COALESCE(p_signature, 'pending_' || gen_random_uuid()::text),
        'pending',
        NOW()
    )
    RETURNING id INTO transaction_id;
    
    RETURN transaction_id;
END;
$$;

-- Update customer statistics
CREATE OR REPLACE FUNCTION update_customer_stats()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
    customer_record customers%ROWTYPE;
BEGIN
    -- Only process confirmed transactions
    IF NEW.status = 'confirmed' AND NEW.customer_email IS NOT NULL THEN
        -- Get or create customer record
        INSERT INTO customers (user_id, email, name, first_purchase_at, last_purchase_at)
        VALUES (NEW.user_id, NEW.customer_email, NEW.customer_name, NEW.created_at, NEW.created_at)
        ON CONFLICT (user_id, email) DO UPDATE SET
            name = COALESCE(EXCLUDED.name, customers.name),
            last_purchase_at = EXCLUDED.last_purchase_at;
        
        -- Update customer statistics
        UPDATE customers SET
            total_spent = total_spent + NEW.amount,
            transaction_count = transaction_count + 1,
            updated_at = NOW()
        WHERE user_id = NEW.user_id AND email = NEW.customer_email;
    END IF;
    
    RETURN NEW;
END;
$$;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Update timestamps
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Apply update triggers
CREATE TRIGGER users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER payment_links_updated_at BEFORE UPDATE ON payment_links FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER invoices_updated_at BEFORE UPDATE ON invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER customers_updated_at BEFORE UPDATE ON customers FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Auto-generate invoice numbers
CREATE OR REPLACE FUNCTION auto_invoice_number()
RETURNS TRIGGER AS $$ 
BEGIN 
    NEW.invoice_number = generate_invoice_number(); 
    RETURN NEW; 
END; 
$$ LANGUAGE plpgsql;

CREATE TRIGGER invoices_auto_number 
    BEFORE INSERT ON invoices 
    FOR EACH ROW 
    WHEN (NEW.invoice_number IS NULL)
    EXECUTE FUNCTION auto_invoice_number();

-- Update customer statistics on transaction
CREATE TRIGGER transactions_update_customer_stats
    AFTER INSERT OR UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_customer_stats();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage own data" ON users FOR ALL USING (id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own payment links" ON payment_links FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own invoices" ON invoices FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own transactions" ON transactions FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own customers" ON customers FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own notifications" ON notifications FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can view own email logs" ON email_logs FOR SELECT USING (user_id = current_setting('app.current_user_id', true)::UUID);
CREATE POLICY "Users can manage own sessions" ON user_sessions FOR ALL USING (user_id = current_setting('app.current_user_id', true)::UUID);

-- Allow anonymous access to payment pages
CREATE POLICY "Anonymous can view active payment links" ON payment_links FOR SELECT USING (is_active = true);
CREATE POLICY "Anonymous can view invoices for payment" ON invoices FOR SELECT USING (status IN ('sent', 'viewed'));

-- =====================================================
-- PERMISSIONS
-- =====================================================

-- Grant permissions to authenticated users
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;

-- Grant read access to afripay_config for fee calculations
GRANT SELECT ON afripay_config TO authenticated;
GRANT SELECT ON afripay_config TO anon;

-- Grant limited permissions to anonymous users (for payment pages)
GRANT SELECT ON payment_links TO anon;
GRANT SELECT ON invoices TO anon;
GRANT INSERT ON transactions TO anon;
GRANT INSERT ON email_logs TO anon;
-- Function to increment QR code payment count
CREATE OR REPLACE FUNCTION increment_qr_payment_count(qr_id UUID, payment_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE qr_codes 
    SET 
        payment_count = payment_count + 1,
        total_collected = total_collected + payment_amount,
        updated_at = NOW()
    WHERE id = qr_id;
END;
$$ LANGUAGE plpgsql;

-- Function to increment payment link count
CREATE OR REPLACE FUNCTION increment_payment_link_count(link_id UUID, payment_amount DECIMAL)
RETURNS void AS $$
BEGIN
    UPDATE payment_links 
    SET 
        payment_count = payment_count + 1,
        total_collected = total_collected + payment_amount,
        updated_at = NOW()
    WHERE id = link_id;
END;
$$ LANGUAGE plpgsql;
