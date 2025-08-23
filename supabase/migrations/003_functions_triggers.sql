-- Database Functions and Triggers

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to relevant tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_subscriptions_updated_at BEFORE UPDATE ON public.user_subscriptions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE ON public.customers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON public.invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to create user profile after signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, full_name, avatar_url)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
        NEW.raw_user_meta_data->>'avatar_url'
    );
    
    -- Create default subscription (free plan)
    INSERT INTO public.user_subscriptions (user_id, plan_id, status)
    VALUES (NEW.id, 'free', 'active');
    
    -- Create welcome notification
    INSERT INTO public.notifications (user_id, type, title, message, data)
    VALUES (
        NEW.id,
        'welcome',
        'Welcome to AfriPay!',
        'Your account has been created successfully. Start accepting USDC payments on Solana.',
        '{"action": "view_dashboard"}'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate platform fees
CREATE OR REPLACE FUNCTION calculate_platform_fee(
    amount_usdc DECIMAL(20, 6),
    user_id UUID
)
RETURNS DECIMAL(20, 6) AS $$
DECLARE
    fee_rate DECIMAL(5, 4);
BEGIN
    -- Get user's current subscription fee rate
    SELECT sp.transaction_fee INTO fee_rate
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = calculate_platform_fee.user_id
    AND us.status = 'active'
    LIMIT 1;
    
    -- Default to free plan rate if no subscription found
    IF fee_rate IS NULL THEN
        fee_rate := 0.029; -- 2.9%
    END IF;
    
    RETURN ROUND(amount_usdc * fee_rate, 6);
END;
$$ LANGUAGE plpgsql;

-- Function to update transaction status and create notifications
CREATE OR REPLACE FUNCTION public.handle_transaction_update()
RETURNS TRIGGER AS $$
BEGIN
    -- If transaction status changed to confirmed, create notification
    IF OLD.status != 'confirmed' AND NEW.status = 'confirmed' THEN
        INSERT INTO public.notifications (user_id, type, title, message, data)
        VALUES (
            NEW.user_id,
            'payment_received',
            'Payment Confirmed',
            'Payment of $' || NEW.amount_usdc || ' USDC has been confirmed.',
            jsonb_build_object(
                'transaction_id', NEW.id,
                'amount', NEW.amount_usdc,
                'signature', NEW.signature
            )
        );
        
        -- Update related invoice if exists
        UPDATE public.invoices 
        SET status = 'paid', transaction_id = NEW.id
        WHERE payment_request_id = NEW.payment_request_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for transaction status updates
CREATE TRIGGER on_transaction_status_change
    AFTER UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION public.handle_transaction_update();

-- Function to generate unique invoice numbers
CREATE OR REPLACE FUNCTION generate_invoice_number(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    invoice_count INTEGER;
    invoice_number TEXT;
BEGIN
    -- Get count of invoices for this user
    SELECT COUNT(*) INTO invoice_count
    FROM public.invoices
    WHERE invoices.user_id = generate_invoice_number.user_id;
    
    -- Generate invoice number: INV-YYYY-NNNN
    invoice_number := 'INV-' || EXTRACT(YEAR FROM NOW()) || '-' || LPAD((invoice_count + 1)::TEXT, 4, '0');
    
    RETURN invoice_number;
END;
$$ LANGUAGE plpgsql;

-- Function to update daily usage records
CREATE OR REPLACE FUNCTION update_daily_usage_records()
RETURNS void AS $$
BEGIN
    INSERT INTO public.usage_records (user_id, period_start, period_end, transaction_count, total_volume_usdc, total_fees_collected)
    SELECT 
        user_id,
        CURRENT_DATE - INTERVAL '1 day',
        CURRENT_DATE,
        COUNT(*),
        SUM(amount_usdc),
        SUM(platform_fee)
    FROM public.transactions 
    WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
        AND status = 'confirmed'
    GROUP BY user_id
    ON CONFLICT (user_id, period_start) 
    DO UPDATE SET
        transaction_count = EXCLUDED.transaction_count,
        total_volume_usdc = EXCLUDED.total_volume_usdc,
        total_fees_collected = EXCLUDED.total_fees_collected;
END;
$$ LANGUAGE plpgsql;

-- Function to check subscription limits
CREATE OR REPLACE FUNCTION check_subscription_limits(user_id UUID)
RETURNS JSONB AS $$
DECLARE
    current_plan RECORD;
    current_usage RECORD;
    result JSONB;
BEGIN
    -- Get current subscription plan
    SELECT sp.* INTO current_plan
    FROM public.user_subscriptions us
    JOIN public.subscription_plans sp ON us.plan_id = sp.id
    WHERE us.user_id = check_subscription_limits.user_id
    AND us.status = 'active'
    LIMIT 1;
    
    -- Get current month usage
    SELECT 
        COALESCE(SUM(transaction_count), 0) as transaction_count,
        COALESCE(SUM(total_volume_usdc), 0) as total_volume
    INTO current_usage
    FROM public.usage_records
    WHERE usage_records.user_id = check_subscription_limits.user_id
    AND period_start >= DATE_TRUNC('month', CURRENT_DATE);
    
    -- Build result
    result := jsonb_build_object(
        'plan_name', current_plan.name,
        'monthly_limit', current_plan.monthly_transaction_limit,
        'current_usage', current_usage.transaction_count,
        'remaining', current_plan.monthly_transaction_limit - current_usage.transaction_count,
        'usage_percentage', ROUND((current_usage.transaction_count::DECIMAL / current_plan.monthly_transaction_limit) * 100, 2),
        'can_process', current_usage.transaction_count < current_plan.monthly_transaction_limit
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to generate API key
CREATE OR REPLACE FUNCTION generate_api_key()
RETURNS TEXT AS $$
BEGIN
    RETURN 'ak_' || encode(gen_random_bytes(32), 'hex');
END;
$$ LANGUAGE plpgsql;

-- Function to hash API key
CREATE OR REPLACE FUNCTION hash_api_key(api_key TEXT)
RETURNS TEXT AS $$
BEGIN
    RETURN encode(digest(api_key, 'sha256'), 'hex');
END;
$$ LANGUAGE plpgsql;
