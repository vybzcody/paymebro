-- Create cctp_transfers table for tracking cross-chain transfers
CREATE TABLE IF NOT EXISTS cctp_transfers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    source_chain TEXT NOT NULL,
    destination_chain TEXT NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    mint_recipient TEXT NOT NULL,
    sender_address TEXT,
    burn_tx_hash TEXT,
    mint_tx_hash TEXT,
    status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'burned', 'attesting', 'completed', 'failed')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_cctp_transfers_status ON cctp_transfers(status);
CREATE INDEX IF NOT EXISTS idx_cctp_transfers_burn_tx ON cctp_transfers(burn_tx_hash);
CREATE INDEX IF NOT EXISTS idx_cctp_transfers_created_at ON cctp_transfers(created_at);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_cctp_transfers_updated_at 
    BEFORE UPDATE ON cctp_transfers 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
