-- Add currency column to payment_requests table
-- This migration adds support for different currencies (USDC, SOL, etc.)

ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USDC' NOT NULL;

-- Also add currency to transactions table for consistency
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USDC' NOT NULL;

-- Add indexes on currency for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_currency ON payment_requests(currency);
CREATE INDEX IF NOT EXISTS idx_transactions_currency ON transactions(currency);

-- Update existing records to have USDC as default currency
UPDATE payment_requests 
SET currency = 'USDC' 
WHERE currency IS NULL;

UPDATE transactions 
SET currency = 'USDC' 
WHERE currency IS NULL;

-- Add check constraints to ensure only valid currencies
ALTER TABLE payment_requests 
ADD CONSTRAINT check_payment_requests_currency_values 
CHECK (currency IN ('USDC', 'SOL', 'EURC', 'BTC'));

ALTER TABLE transactions 
ADD CONSTRAINT check_transactions_currency_values 
CHECK (currency IN ('USDC', 'SOL', 'EURC', 'BTC'));

-- Add comments for documentation
COMMENT ON COLUMN payment_requests.currency IS 'Payment currency (USDC, SOL, EURC, BTC)';
COMMENT ON COLUMN transactions.currency IS 'Transaction currency (USDC, SOL, EURC, BTC)';
