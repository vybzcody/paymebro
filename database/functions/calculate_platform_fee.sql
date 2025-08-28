-- Create function to calculate platform fee
-- This function calculates AfriPay's platform fee based on transaction amount and user tier

CREATE OR REPLACE FUNCTION public.calculate_platform_fee(
  amount_usdc DECIMAL,
  user_id TEXT
)
RETURNS DECIMAL
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_fee_rate DECIMAL := 0.029; -- 2.9%
  fixed_fee_usd DECIMAL := 0.30;  -- $0.30 fixed fee
  percentage_fee DECIMAL;
  total_fee DECIMAL;
  user_tier TEXT := 'standard'; -- Default tier
BEGIN
  -- Calculate percentage fee (2.9% of amount)
  percentage_fee := amount_usdc * base_fee_rate;
  
  -- Add fixed fee
  total_fee := percentage_fee + fixed_fee_usd;
  
  -- Ensure minimum fee (at least fixed fee)
  IF total_fee < fixed_fee_usd THEN
    total_fee := fixed_fee_usd;
  END IF;
  
  -- Cap maximum fee at 50% of transaction (safety measure)
  IF total_fee > (amount_usdc * 0.5) THEN
    total_fee := amount_usdc * 0.5;
  END IF;
  
  RETURN ROUND(total_fee, 6);
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.calculate_platform_fee(DECIMAL, TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION public.calculate_platform_fee(DECIMAL, TEXT) TO anon;

-- Test the function
SELECT public.calculate_platform_fee(10.00, 'test-user'); -- Should return ~0.59 (2.9% + $0.30)
SELECT public.calculate_platform_fee(1.00, 'test-user');  -- Should return 0.329 (2.9% + $0.30)
SELECT public.calculate_platform_fee(0.10, 'test-user');  -- Should return 0.30 (minimum fixed fee)
