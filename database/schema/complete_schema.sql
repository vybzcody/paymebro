-- AfriPay Complete Database Schema
-- Optimized for Web3Auth integration and business operations

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- Create custom types
CREATE TYPE user_status AS ENUM ('active', 'suspended', 'pending_verification');
CREATE TYPE transaction_status AS ENUM ('pending', 'confirmed', 'failed', 'expired');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'viewed', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_link_status AS ENUM ('active', 'expired', 'disabled');

-- Users table (Web3Auth integration)
CREATE TABLE public.users (
    id TEXT PRIMARY KEY, -- Web3Auth user ID
    wallet_address TEXT UNIQUE NOT NULL, -- Solana wallet from Web3Auth
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    
    -- Business information
    business_name TEXT,
    business_type TEXT,
    business_description TEXT,
    website_url TEXT,
    
    -- Contact & Location
    phone TEXT,
    country TEXT,
    timezone TEXT DEFAULT 'UTC',
    
    -- Web3Auth metadata
    web3auth_verifier TEXT,
    web3auth_verifier_id TEXT,
    login_type TEXT, -- 'google', 'email', 'discord', etc.
    
    -- Account status
    status user_status DEFAULT 'active',
    email_verified BOOLEAN DEFAULT FALSE,
    kyc_verified BOOLEAN DEFAULT FALSE,
    
    -- Settings
    notification_preferences JSONB DEFAULT '{"email": true, "payment_alerts": true}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login_at TIMESTAMP WITH TIME ZONE
);

-- Payment links table
CREATE TABLE public.payment_links (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Link details
    title TEXT NOT NULL,
    description TEXT,
    reference TEXT UNIQUE NOT NULL,
    
    -- Payment info
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL', 'USDT')),
    
    -- URLs
    payment_url TEXT NOT NULL,
    qr_code_url TEXT,
    
    -- Status and expiry
    status payment_link_status DEFAULT 'active',
    expires_at TIMESTAMP WITH TIME ZONE,
    
    -- Analytics
    view_count INTEGER DEFAULT 0,
    payment_count INTEGER DEFAULT 0,
    total_collected DECIMAL(20, 6) DEFAULT 0,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Invoices table
CREATE TABLE public.invoices (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Invoice identification
    invoice_number TEXT UNIQUE NOT NULL,
    reference TEXT UNIQUE NOT NULL,
    
    -- Customer information
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_phone TEXT,
    customer_address JSONB,
    
    -- Invoice details
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL', 'USDT')),
    tax_amount DECIMAL(20, 6) DEFAULT 0,
    discount_amount DECIMAL(20, 6) DEFAULT 0,
    total_amount DECIMAL(20, 6) NOT NULL,
    
    -- Content
    description TEXT NOT NULL,
    line_items JSONB DEFAULT '[]',
    notes TEXT,
    terms TEXT,
    
    -- Payment information
    payment_url TEXT,
    qr_code_url TEXT,
    
    -- Dates
    issue_date DATE DEFAULT CURRENT_DATE,
    due_date DATE,
    
    -- Status tracking
    status invoice_status DEFAULT 'draft',
    sent_at TIMESTAMP WITH TIME ZONE,
    viewed_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    
    -- Payment tracking
    payment_link_id UUID REFERENCES public.payment_links(id),
    transaction_signature TEXT,
    
    -- Metadata
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Transactions table
CREATE TABLE public.transactions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Transaction identification
    signature TEXT UNIQUE, -- Solana transaction signature
    reference TEXT NOT NULL,
    
    -- Payment source
    payment_link_id UUID REFERENCES public.payment_links(id),
    invoice_id UUID REFERENCES public.invoices(id),
    
    -- Transaction details
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT NOT NULL,
    platform_fee DECIMAL(20, 6) DEFAULT 0,
    net_amount DECIMAL(20, 6) NOT NULL,
    
    -- Wallet addresses
    sender_wallet TEXT,
    recipient_wallet TEXT NOT NULL,
    
    -- Blockchain data
    block_time TIMESTAMP WITH TIME ZONE,
    slot BIGINT,
    confirmation_count INTEGER DEFAULT 0,
    
    -- Status
    status transaction_status DEFAULT 'pending',
    
    -- Customer info (for analytics)
    customer_email TEXT,
    customer_name TEXT,
    
    -- Metadata
    description TEXT,
    metadata JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Email logs table
CREATE TABLE public.email_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Email details
    recipient_email TEXT NOT NULL,
    subject TEXT NOT NULL,
    email_type TEXT NOT NULL, -- 'invoice', 'payment_confirmation', 'receipt'
    
    -- Related records
    invoice_id UUID REFERENCES public.invoices(id),
    transaction_id UUID REFERENCES public.transactions(id),
    
    -- Status
    sent_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    delivered_at TIMESTAMP WITH TIME ZONE,
    opened_at TIMESTAMP WITH TIME ZONE,
    clicked_at TIMESTAMP WITH TIME ZONE,
    
    -- Provider info
    provider_message_id TEXT,
    provider_status TEXT,
    
    -- Content
    template_data JSONB DEFAULT '{}',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- User sessions table (for analytics)
CREATE TABLE public.user_sessions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id TEXT REFERENCES public.users(id) ON DELETE CASCADE,
    
    -- Session info
    session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    session_end TIMESTAMP WITH TIME ZONE,
    ip_address INET,
    user_agent TEXT,
    
    -- Web3Auth info
    login_method TEXT,
    wallet_used TEXT,
    
    -- Activity
    pages_visited INTEGER DEFAULT 0,
    actions_performed JSONB DEFAULT '[]',
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_wallet_address ON public.users(wallet_address);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_status ON public.users(status);

CREATE INDEX idx_payment_links_user_id ON public.payment_links(user_id);
CREATE INDEX idx_payment_links_reference ON public.payment_links(reference);
CREATE INDEX idx_payment_links_status ON public.payment_links(status);

CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_invoices_customer_email ON public.invoices(customer_email);
CREATE INDEX idx_invoices_status ON public.invoices(status);
CREATE INDEX idx_invoices_reference ON public.invoices(reference);

CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_signature ON public.transactions(signature);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at);

CREATE INDEX idx_email_logs_user_id ON public.email_logs(user_id);
CREATE INDEX idx_email_logs_email_type ON public.email_logs(email_type);

-- Create updated_at triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_links_updated_at BEFORE UPDATE ON public.payment_links FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_sessions ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can view own data" ON public.users FOR SELECT USING (id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can update own data" ON public.users FOR UPDATE USING (id = current_setting('app.current_user_id', true));

CREATE POLICY "Users can manage own payment links" ON public.payment_links FOR ALL USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can manage own invoices" ON public.invoices FOR ALL USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can manage own transactions" ON public.transactions FOR ALL USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own email logs" ON public.email_logs FOR SELECT USING (user_id = current_setting('app.current_user_id', true));
CREATE POLICY "Users can view own sessions" ON public.user_sessions FOR SELECT USING (user_id = current_setting('app.current_user_id', true));

-- Functions
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  invoice_count INTEGER;
  invoice_number TEXT;
BEGIN
  SELECT COUNT(*) + 1 INTO invoice_count
  FROM public.invoices
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  invoice_number := 'INV-' || current_year || '-' || LPAD(invoice_count::TEXT, 4, '0');
  RETURN invoice_number;
END;
$$;

CREATE OR REPLACE FUNCTION calculate_platform_fee(amount_input DECIMAL)
RETURNS DECIMAL
LANGUAGE plpgsql
AS $$
BEGIN
  -- AfriPay fee: 2.9% + $0.30
  RETURN ROUND((amount_input * 0.029 + 0.30), 6);
END;
$$;

-- Grant permissions
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated;
