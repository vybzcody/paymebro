-- Add QR codes table
CREATE TABLE qr_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- QR Code Details
    title TEXT NOT NULL,
    amount DECIMAL(20, 6) NOT NULL,
    currency TEXT DEFAULT 'USDC',
    reference TEXT UNIQUE NOT NULL,
    
    -- URLs
    payment_url TEXT NOT NULL,
    qr_code_url TEXT NOT NULL,
    
    -- Analytics
    payment_count INTEGER DEFAULT 0,
    total_collected DECIMAL(20, 6) DEFAULT 0,
    view_count INTEGER DEFAULT 0,
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_qr_codes_user_id ON qr_codes(user_id);
CREATE INDEX idx_qr_codes_reference ON qr_codes(reference);
CREATE INDEX idx_qr_codes_active ON qr_codes(is_active);

-- RLS Policy
CREATE POLICY "Allow QR code operations" ON qr_codes FOR ALL USING (true);
