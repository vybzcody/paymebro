-- Create cross_chain_transactions table
CREATE TABLE IF NOT EXISTS cross_chain_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payment_id UUID REFERENCES payments(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES invoices(id) ON DELETE CASCADE,
  merchant_id UUID NOT NULL,
  source_chain_id VARCHAR(20) NOT NULL,
  destination_chain_id VARCHAR(20) NOT NULL,
  source_tx_hash VARCHAR(128),
  destination_tx_hash VARCHAR(128),
  burn_message VARCHAR(256),
  attestation_signature TEXT,
  cctp_version VARCHAR(5) DEFAULT 'v2',
  transfer_type VARCHAR(20) DEFAULT 'standard',
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'burned', 'attesting', 'minting', 'completed', 'failed')),
  amount_burned DECIMAL(20,6) NOT NULL,
  amount_minted DECIMAL(20,6),
  fees_paid DECIMAL(20,6) DEFAULT 0,
  estimated_time INTEGER NOT NULL, -- minutes
  actual_time INTEGER, -- minutes
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Constraints
  CONSTRAINT valid_amount CHECK (amount_burned > 0),
  CONSTRAINT valid_chains CHECK (source_chain_id != destination_chain_id),
  CONSTRAINT valid_time CHECK (actual_time IS NULL OR actual_time >= 0),
  CONSTRAINT payment_or_invoice CHECK (
    (payment_id IS NOT NULL AND invoice_id IS NULL) OR 
    (payment_id IS NULL AND invoice_id IS NOT NULL) OR
    (payment_id IS NULL AND invoice_id IS NULL)
  )
);

-- Create merchant_chain_preferences table
CREATE TABLE IF NOT EXISTS merchant_chain_preferences (
  merchant_id UUID NOT NULL,
  chain_id VARCHAR(20) NOT NULL,
  wallet_address VARCHAR(128) NOT NULL,
  is_primary BOOLEAN DEFAULT FALSE,
  auto_convert BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  PRIMARY KEY (merchant_id, chain_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_cctp_merchant_id ON cross_chain_transactions(merchant_id);
CREATE INDEX IF NOT EXISTS idx_cctp_payment_id ON cross_chain_transactions(payment_id);
CREATE INDEX IF NOT EXISTS idx_cctp_invoice_id ON cross_chain_transactions(invoice_id);
CREATE INDEX IF NOT EXISTS idx_cctp_status ON cross_chain_transactions(status);
CREATE INDEX IF NOT EXISTS idx_cctp_created_at ON cross_chain_transactions(created_at);
CREATE INDEX IF NOT EXISTS idx_cctp_source_tx ON cross_chain_transactions(source_tx_hash);

-- Add RLS policies
ALTER TABLE cross_chain_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE merchant_chain_preferences ENABLE ROW LEVEL SECURITY;

-- Policy for cross_chain_transactions
CREATE POLICY "Users can view their own CCTP transactions" ON cross_chain_transactions
  FOR SELECT USING (merchant_id = auth.uid());

CREATE POLICY "Users can insert their own CCTP transactions" ON cross_chain_transactions
  FOR INSERT WITH CHECK (merchant_id = auth.uid());

CREATE POLICY "Users can update their own CCTP transactions" ON cross_chain_transactions
  FOR UPDATE USING (merchant_id = auth.uid());

-- Policy for merchant_chain_preferences
CREATE POLICY "Users can manage their own chain preferences" ON merchant_chain_preferences
  FOR ALL USING (merchant_id = auth.uid());

-- Add columns to existing tables if they don't exist
DO $$ 
BEGIN
  -- Add CCTP fields to payment_links table
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'supported_chains') THEN
    ALTER TABLE payment_links ADD COLUMN supported_chains JSONB DEFAULT '[]';
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'preferred_chain') THEN
    ALTER TABLE payment_links ADD COLUMN preferred_chain VARCHAR(20);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payment_links' AND column_name = 'cctp_enabled') THEN
    ALTER TABLE payment_links ADD COLUMN cctp_enabled BOOLEAN DEFAULT FALSE;
  END IF;

  -- Add CCTP fields to invoices table
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
