-- Create payments table (if not exists)
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  customer_email VARCHAR(255),
  amount DECIMAL(20,6) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'expired')),
  description TEXT,
  reference VARCHAR(255) UNIQUE NOT NULL,
  payment_url TEXT,
  recipient_wallet VARCHAR(128),
  transaction_hash VARCHAR(128),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE
);

-- Create invoices table (if not exists)
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  amount DECIMAL(20,6) NOT NULL CHECK (amount > 0),
  currency VARCHAR(10) NOT NULL DEFAULT 'USDC',
  status VARCHAR(20) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'expired', 'cancelled')),
  description TEXT,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  sent_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE
);

-- Create cross_chain_transactions table
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL DEFAULT auth.uid(),
  source_chain_id VARCHAR(20) NOT NULL,
  destination_chain_id VARCHAR(20) NOT NULL,
  source_tx_hash VARCHAR(128),
  destination_tx_hash VARCHAR(128),
  burn_message VARCHAR(256),
  attestation_signature TEXT,
  cctp_version VARCHAR(5) DEFAULT 'v2',
  transfer_type VARCHAR(20) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'burned', 'attesting', 'minting', 'completed', 'failed')),
  amount_burned DECIMAL(20,6) NOT NULL CHECK (amount_burned > 0),
  amount_minted DECIMAL(20,6),
  fees_paid DECIMAL(20,6) DEFAULT 0,
  estimated_time INTEGER NOT NULL,
  actual_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  CONSTRAINT valid_chains CHECK (source_chain_id != destination_chain_id),
  CONSTRAINT valid_time CHECK (actual_time IS NULL OR actual_time >= 0),
  CONSTRAINT payment_or_invoice CHECK (
    (payment_id IS NOT NULL AND invoice_id IS NULL) OR 
    (payment_id IS NULL AND invoice_id IS NOT NULL) OR
    (payment_id IS NULL AND invoice_id IS NULL)
  )
);

-- Add CCTP fields to existing tables
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'supported_chains') THEN
    ALTER TABLE payment_links ADD COLUMN supported_chains JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'preferred_chain') THEN
    ALTER TABLE payment_links ADD COLUMN preferred_chain VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'cctp_enabled') THEN
    ALTER TABLE payment_links ADD COLUMN cctp_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'supported_chains') THEN
    ALTER TABLE invoices ADD COLUMN supported_chains JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'preferred_chain') THEN
    ALTER TABLE invoices ADD COLUMN preferred_chain VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'invoices' AND column_name = 'cctp_enabled') THEN
    ALTER TABLE invoices ADD COLUMN cctp_enabled BOOLEAN DEFAULT FALSE;
  END IF;
END $$;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_status ON payments(status);
CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_cctp_merchant_id ON cross_chain_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_cctp_payment_id ON cross_chain_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_cctp_invoice_id ON cross_chain_transactions(invoice_id);

-- Enable RLS
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE cross_chain_transactions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate
DROP POLICY IF EXISTS "Users can view their own payments" ON payments;
DROP POLICY IF EXISTS "Users can insert their own payments" ON payments;
DROP POLICY IF EXISTS "Users can update their own payments" ON payments;

DROP POLICY IF EXISTS "Users can view their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can insert their own invoices" ON invoices;
DROP POLICY IF EXISTS "Users can update their own invoices" ON invoices;

DROP POLICY IF EXISTS "Users can view their own CCTP transactions" ON cross_chain_transactions;
DROP POLICY IF EXISTS "Users can insert their own CCTP transactions" ON cross_chain_transactions;
DROP POLICY IF EXISTS "Users can update their own CCTP transactions" ON cross_chain_transactions;

-- Create policies
CREATE POLICY "Users can view their own payments" ON payments
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments" ON payments
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payments" ON payments
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own invoices" ON invoices
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own invoices" ON invoices
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own invoices" ON invoices
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can view their own CCTP transactions" ON cross_chain_transactions
  FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "Users can insert their own CCTP transactions" ON cross_chain_transactions
  FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Users can update their own CCTP transactions" ON cross_chain_transactions
  FOR UPDATE USING (merchant_id = auth.uid());
