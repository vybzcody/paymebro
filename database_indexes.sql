-- Additional Database Indexes for AfriPay Payment Processing
-- Optimizes queries on reference and signature columns across all payment-related tables

-- Composite indexes for payment monitoring and verification
CREATE INDEX IF NOT EXISTS idx_payments_status_created_at ON payments(status, created_at);
CREATE INDEX IF NOT EXISTS idx_payments_recipient_wallet ON payments(recipient_wallet);
CREATE INDEX IF NOT EXISTS idx_payments_currency_status ON payments(currency, status);

-- QR codes performance optimization
CREATE INDEX IF NOT EXISTS idx_qr_codes_created_at ON qr_codes(created_at);
CREATE INDEX IF NOT EXISTS idx_qr_codes_expires_at ON qr_codes(expires_at) WHERE expires_at IS NOT NULL;

-- Payment links optimization
CREATE INDEX IF NOT EXISTS idx_payment_links_expires_at ON payment_links(expires_at) WHERE expires_at IS NOT NULL;

-- Transaction monitoring optimization
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_transactions_recipient_wallet ON transactions(recipient_wallet);

-- Cross-chain transaction optimization
CREATE INDEX IF NOT EXISTS idx_cross_chain_reference ON cross_chain_transactions(reference) WHERE reference IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_cross_chain_status_created ON cross_chain_transactions(status, created_at);

-- Invoice reference optimization (if not already exists)
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at);

-- Partial indexes for active/pending records only (performance boost)
CREATE INDEX IF NOT EXISTS idx_payments_pending ON payments(reference, created_at) WHERE status = 'pending';
CREATE INDEX IF NOT EXISTS idx_qr_codes_active ON qr_codes(reference, created_at) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_payment_links_active ON payment_links(reference, created_at) WHERE is_active = true;
