-- Enhance payment tracking and email capabilities
-- This migration adds missing columns and relationships for better dashboard functionality

-- 1. Enhance payment_requests table
ALTER TABLE payment_requests 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'pending' NOT NULL,
ADD COLUMN IF NOT EXISTS success_url TEXT,
ADD COLUMN IF NOT EXISTS cancel_url TEXT,
ADD COLUMN IF NOT EXISTS webhook_url TEXT,
ADD COLUMN IF NOT EXISTS attempts INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_attempt_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS failure_reason TEXT;

-- Add status constraint (safe)
DO $$
BEGIN
    BEGIN
        ALTER TABLE payment_requests 
        ADD CONSTRAINT check_payment_request_status 
        CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'cancelled'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
        WHEN check_violation THEN
            ALTER TABLE payment_requests DROP CONSTRAINT IF EXISTS check_payment_request_status;
            ALTER TABLE payment_requests 
            ADD CONSTRAINT check_payment_request_status 
            CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'expired', 'cancelled'));
    END;
END $$;

-- 2. Enhance transactions table  
ALTER TABLE transactions 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS invoice_id UUID REFERENCES invoices(id),
ADD COLUMN IF NOT EXISTS email_sent BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS email_sent_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS receipt_url TEXT,
ADD COLUMN IF NOT EXISTS refund_status VARCHAR(20) DEFAULT 'none',
ADD COLUMN IF NOT EXISTS refunded_amount DECIMAL(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS dispute_status VARCHAR(20) DEFAULT 'none';

-- Add refund status constraint (safe)
DO $$
BEGIN
    BEGIN
        ALTER TABLE transactions 
        ADD CONSTRAINT check_refund_status 
        CHECK (refund_status IN ('none', 'partial', 'full', 'pending'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- Add dispute status constraint (safe)
DO $$
BEGIN
    BEGIN
        ALTER TABLE transactions 
        ADD CONSTRAINT check_dispute_status 
        CHECK (dispute_status IN ('none', 'warning_needs_response', 'warning_under_review', 'warning_closed', 'needs_response', 'under_review', 'charge_refunded', 'won', 'lost'));
    EXCEPTION
        WHEN duplicate_object THEN NULL;
    END;
END $$;

-- 3. Create email_logs table for tracking email communications
CREATE TABLE IF NOT EXISTS email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    customer_id UUID REFERENCES customers(id), 
    payment_request_id UUID REFERENCES payment_requests(id),
    transaction_id UUID REFERENCES transactions(id),
    invoice_id UUID REFERENCES invoices(id),
    email_type VARCHAR(50) NOT NULL, -- 'payment_confirmation', 'invoice', 'receipt', 'refund', 'failure'
    recipient_email VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    template_id VARCHAR(100),
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'delivered', 'failed', 'bounced'
    provider VARCHAR(50), -- 'resend', 'sendgrid', 'ses', etc.
    provider_message_id VARCHAR(255),
    sent_at TIMESTAMPTZ,
    delivered_at TIMESTAMPTZ,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    error_message TEXT,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for email status
ALTER TABLE email_logs 
ADD CONSTRAINT check_email_status 
CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'bounced', 'opened', 'clicked'));

-- 4. Create webhook_events table for tracking webhook deliveries  
CREATE TABLE IF NOT EXISTS webhook_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    payment_request_id UUID REFERENCES payment_requests(id),
    transaction_id UUID REFERENCES transactions(id),
    event_type VARCHAR(50) NOT NULL, -- 'payment.completed', 'payment.failed', 'invoice.paid', etc.
    webhook_url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' NOT NULL, -- 'pending', 'sent', 'failed', 'retry'
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    response_status_code INTEGER,
    response_body TEXT,
    next_retry_at TIMESTAMPTZ,
    payload JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add constraint for webhook status
ALTER TABLE webhook_events 
ADD CONSTRAINT check_webhook_status 
CHECK (status IN ('pending', 'sent', 'failed', 'retry', 'abandoned'));

-- 5. Enhance customers table (if it doesn't have these columns)
ALTER TABLE customers 
ADD COLUMN IF NOT EXISTS default_currency VARCHAR(10) DEFAULT 'USDC',
ADD COLUMN IF NOT EXISTS timezone VARCHAR(50) DEFAULT 'UTC',
ADD COLUMN IF NOT EXISTS preferred_language VARCHAR(10) DEFAULT 'en',
ADD COLUMN IF NOT EXISTS email_notifications BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS sms_notifications BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone VARCHAR(20),
ADD COLUMN IF NOT EXISTS tax_exempt BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS tax_ids JSONB DEFAULT '[]', -- Array of tax IDs
ADD COLUMN IF NOT EXISTS shipping_address JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS billing_address JSONB DEFAULT '{}';

-- 6. Enhance invoices table
ALTER TABLE invoices 
ADD COLUMN IF NOT EXISTS customer_id UUID REFERENCES customers(id),
ADD COLUMN IF NOT EXISTS payment_request_id UUID REFERENCES payment_requests(id),
ADD COLUMN IF NOT EXISTS invoice_number VARCHAR(50) UNIQUE,
ADD COLUMN IF NOT EXISTS due_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS currency VARCHAR(10) DEFAULT 'USDC',
ADD COLUMN IF NOT EXISTS subtotal DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS tax_amount DECIMAL(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_amount DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_paid DECIMAL(20,8) DEFAULT 0,
ADD COLUMN IF NOT EXISTS amount_due DECIMAL(20,8) NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'draft',
ADD COLUMN IF NOT EXISTS auto_advance BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS collection_method VARCHAR(20) DEFAULT 'charge_automatically',
ADD COLUMN IF NOT EXISTS hosted_invoice_url TEXT,
ADD COLUMN IF NOT EXISTS invoice_pdf TEXT,
ADD COLUMN IF NOT EXISTS receipt_number VARCHAR(50),
ADD COLUMN IF NOT EXISTS statement_descriptor VARCHAR(100),
ADD COLUMN IF NOT EXISTS footer TEXT,
ADD COLUMN IF NOT EXISTS memo TEXT;

-- Add invoice status constraint (check if it exists first)
DO $$
BEGIN
    -- Try to add the constraint, ignore if it already exists
    BEGIN
        ALTER TABLE invoices 
        ADD CONSTRAINT check_invoice_status 
        CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible'));
    EXCEPTION
        WHEN duplicate_object THEN
            -- Constraint already exists, skip
            NULL;
        WHEN check_violation THEN
            -- Existing data doesn't match constraint, update the constraint
            ALTER TABLE invoices DROP CONSTRAINT IF EXISTS check_invoice_status;
            ALTER TABLE invoices 
            ADD CONSTRAINT check_invoice_status 
            CHECK (status IN ('draft', 'open', 'paid', 'void', 'uncollectible'));
    END;
END $$;

-- 7. Create invoice_line_items table
CREATE TABLE IF NOT EXISTS invoice_line_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity DECIMAL(10,2) DEFAULT 1,
    unit_amount DECIMAL(20,8) NOT NULL,
    amount DECIMAL(20,8) NOT NULL,
    currency VARCHAR(10) DEFAULT 'USDC',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_payment_requests_status ON payment_requests(status);
CREATE INDEX IF NOT EXISTS idx_payment_requests_customer_id ON payment_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_requests_created_at ON payment_requests(created_at);

CREATE INDEX IF NOT EXISTS idx_transactions_customer_id ON transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created_at ON transactions(created_at);

CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON email_logs(recipient_email);
CREATE INDEX IF NOT EXISTS idx_email_logs_status ON email_logs(status);
CREATE INDEX IF NOT EXISTS idx_email_logs_type ON email_logs(email_type);
CREATE INDEX IF NOT EXISTS idx_email_logs_created_at ON email_logs(created_at);

CREATE INDEX IF NOT EXISTS idx_webhook_events_status ON webhook_events(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_type ON webhook_events(event_type);
CREATE INDEX IF NOT EXISTS idx_webhook_events_next_retry ON webhook_events(next_retry_at) WHERE status = 'retry';

CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

-- 9. Create functions for automatic invoice numbering
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.invoice_number IS NULL THEN
        NEW.invoice_number := 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || 
                             LPAD(EXTRACT(DOY FROM NOW())::TEXT, 3, '0') || '-' ||
                             LPAD((SELECT COALESCE(MAX(SUBSTRING(invoice_number FROM 'INV-\d{4}-\d{3}-(\d+)')::INTEGER), 0) + 1 
                                   FROM invoices 
                                   WHERE invoice_number LIKE 'INV-' || TO_CHAR(NOW(), 'YYYY') || '-' || TO_CHAR(NOW(), 'DDD') || '-%')::TEXT, 4, '0');
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for invoice number generation
DROP TRIGGER IF EXISTS trigger_generate_invoice_number ON invoices;
CREATE TRIGGER trigger_generate_invoice_number
    BEFORE INSERT ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION generate_invoice_number();

-- 10. Create updated_at triggers for timestamp management
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS trigger_payment_requests_updated_at ON payment_requests;
CREATE TRIGGER trigger_payment_requests_updated_at
    BEFORE UPDATE ON payment_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_transactions_updated_at ON transactions;  
CREATE TRIGGER trigger_transactions_updated_at
    BEFORE UPDATE ON transactions
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_email_logs_updated_at ON email_logs;
CREATE TRIGGER trigger_email_logs_updated_at
    BEFORE UPDATE ON email_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS trigger_webhook_events_updated_at ON webhook_events;
CREATE TRIGGER trigger_webhook_events_updated_at
    BEFORE UPDATE ON webhook_events
    FOR EACH ROW  
    EXECUTE FUNCTION update_updated_at_column();

-- 11. Add comments for documentation
COMMENT ON TABLE email_logs IS 'Track all email communications sent to customers';
COMMENT ON TABLE webhook_events IS 'Track webhook deliveries and retry attempts';
COMMENT ON TABLE invoice_line_items IS 'Individual line items for invoices';
COMMENT ON COLUMN payment_requests.status IS 'Current status of the payment request';
COMMENT ON COLUMN transactions.email_sent IS 'Whether confirmation email was sent';
COMMENT ON COLUMN invoices.invoice_number IS 'Auto-generated unique invoice number';
