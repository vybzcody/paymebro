-- Update payments table to match PaymentProcessor interface
DO $$ 
BEGIN
  -- Add missing columns for payment processor
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'signature') THEN
    ALTER TABLE payments ADD COLUMN signature VARCHAR(128);
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'total_amount_paid') THEN
    ALTER TABLE payments ADD COLUMN total_amount_paid DECIMAL(20,6) NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'merchant_amount') THEN
    ALTER TABLE payments ADD COLUMN merchant_amount DECIMAL(20,6) NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'fee_amount') THEN
    ALTER TABLE payments ADD COLUMN fee_amount DECIMAL(20,6) NOT NULL DEFAULT 0;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'confirmed_at') THEN
    ALTER TABLE payments ADD COLUMN confirmed_at TIMESTAMP WITH TIME ZONE;
  END IF;

  -- Update status check constraint to match PaymentProcessor
  ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_status_check;
  ALTER TABLE payments ADD CONSTRAINT payments_status_check 
    CHECK (status IN ('pending', 'confirmed', 'failed', 'expired'));

  -- Ensure recipient_wallet is NOT NULL for new payments
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'payments' AND column_name = 'recipient_wallet' AND is_nullable = 'YES') THEN
    ALTER TABLE payments ALTER COLUMN recipient_wallet SET NOT NULL;
  END IF;
END $$;

-- Create index for signature lookups
CREATE INDEX IF NOT EXISTS idx_payments_signature ON payments(signature) WHERE signature IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_payments_reference ON payments(reference);
