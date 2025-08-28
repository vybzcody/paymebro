-- Create invoices table for email invoice system
-- This enables merchants to send payment requests via email before payment

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Invoice identification
  invoice_number TEXT UNIQUE NOT NULL, -- INV-2024-001
  reference TEXT UNIQUE NOT NULL,      -- Solana payment reference
  
  -- Merchant information
  merchant_id TEXT NOT NULL,           -- User ID of merchant
  merchant_name TEXT,
  merchant_email TEXT,
  merchant_wallet TEXT NOT NULL,
  
  -- Customer information
  customer_name TEXT,
  customer_email TEXT NOT NULL,        -- Required for email invoice
  customer_address JSONB,              -- Optional billing address
  
  -- Invoice details
  amount DECIMAL NOT NULL,
  currency TEXT DEFAULT 'USDC' CHECK (currency IN ('USDC', 'SOL')),
  description TEXT NOT NULL,
  line_items JSONB,                    -- Array of invoice line items
  
  -- Fee information
  afripay_fee DECIMAL DEFAULT 0,
  total_amount DECIMAL NOT NULL,       -- amount + afripay_fee
  
  -- Payment information
  payment_url TEXT,
  qr_code_url TEXT,
  
  -- Status and dates
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent', 'viewed', 'paid', 'expired', 'cancelled')),
  sent_at TIMESTAMP WITH TIME ZONE,
  viewed_at TIMESTAMP WITH TIME ZONE,
  paid_at TIMESTAMP WITH TIME ZONE,
  due_date TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days'),
  
  -- Payment tracking
  payment_request_id UUID REFERENCES public.payment_requests(id),
  transaction_signature TEXT,
  
  -- Metadata
  metadata JSONB DEFAULT '{}',
  notes TEXT,
  
  -- Indexes for performance
  CONSTRAINT invoices_merchant_id_check CHECK (length(merchant_id) > 0),
  CONSTRAINT invoices_customer_email_check CHECK (customer_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
  CONSTRAINT invoices_amount_positive CHECK (amount > 0),
  CONSTRAINT invoices_total_amount_positive CHECK (total_amount > 0)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invoices_merchant_id ON public.invoices(merchant_id);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_email ON public.invoices(customer_email);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON public.invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_reference ON public.invoices(reference);
CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number ON public.invoices(invoice_number);
CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON public.invoices(created_at);
CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON public.invoices(due_date);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_invoices_updated_at 
  BEFORE UPDATE ON public.invoices 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Enable RLS (Row Level Security)
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own invoices" ON public.invoices
  FOR SELECT USING (merchant_id = auth.uid()::text OR customer_email = auth.email());

CREATE POLICY "Users can create their own invoices" ON public.invoices
  FOR INSERT WITH CHECK (merchant_id = auth.uid()::text);

CREATE POLICY "Users can update their own invoices" ON public.invoices
  FOR UPDATE USING (merchant_id = auth.uid()::text);

-- Grant permissions
GRANT ALL ON public.invoices TO authenticated;
GRANT SELECT ON public.invoices TO anon;

-- Create function to generate invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  current_year TEXT := EXTRACT(YEAR FROM NOW())::TEXT;
  invoice_count INTEGER;
  invoice_number TEXT;
BEGIN
  -- Get count of invoices this year
  SELECT COUNT(*) + 1 INTO invoice_count
  FROM public.invoices
  WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM NOW());
  
  -- Format: INV-2024-001
  invoice_number := 'INV-' || current_year || '-' || LPAD(invoice_count::TEXT, 3, '0');
  
  RETURN invoice_number;
END;
$$;

GRANT EXECUTE ON FUNCTION generate_invoice_number() TO authenticated;
GRANT EXECUTE ON FUNCTION generate_invoice_number() TO anon;
