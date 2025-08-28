-- Add merchant_name column to invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS merchant_name TEXT;

-- Update existing invoices with merchant names from users table
UPDATE invoices 
SET merchant_name = COALESCE(u.business_name, u.name, 'AfriPay Merchant')
FROM users u 
WHERE invoices.user_id = u.id 
AND invoices.merchant_name IS NULL;
