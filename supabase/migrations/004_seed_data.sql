-- Seed Data and Cron Jobs

-- Insert default subscription plans
INSERT INTO public.subscription_plans (id, name, description, price_monthly, price_yearly, transaction_fee, monthly_transaction_limit, features) VALUES
(
    'free',
    'Free',
    'Perfect for getting started with Solana payments',
    0.00,
    0.00,
    0.029,
    50,
    '["Basic dashboard", "Up to 50 transactions/month", "Email support", "Standard transaction fees (2.9%)"]'
),
(
    'starter',
    'Starter',
    'Great for small businesses and freelancers',
    15.00,
    150.00,
    0.024,
    1000,
    '["Advanced analytics", "Up to 1,000 transactions/month", "Priority support", "Reduced fees (2.4%)", "Custom payment pages", "Invoice management"]'
),
(
    'business',
    'Business',
    'Ideal for growing businesses',
    49.00,
    490.00,
    0.019,
    10000,
    '["Everything in Starter", "Up to 10,000 transactions/month", "API access", "Webhooks", "White-label options", "Lower fees (1.9%)", "Advanced reporting", "Multi-user access"]'
),
(
    'enterprise',
    'Enterprise',
    'For large organizations with custom needs',
    149.00,
    1490.00,
    0.014,
    100000,
    '["Everything in Business", "Up to 100,000 transactions/month", "Custom integrations", "Dedicated support", "Lowest fees (1.4%)", "SLA guarantee", "Custom features", "Priority processing"]'
);

-- Set up cron jobs for automated tasks
SELECT cron.schedule(
    'update-daily-usage',
    '0 1 * * *', -- Daily at 1 AM UTC
    'SELECT update_daily_usage_records();'
);

SELECT cron.schedule(
    'cleanup-expired-payment-requests',
    '0 2 * * *', -- Daily at 2 AM UTC
    'DELETE FROM public.payment_requests WHERE expires_at < NOW() - INTERVAL ''7 days'';'
);

SELECT cron.schedule(
    'cleanup-old-notifications',
    '0 3 1 * *', -- Monthly at 3 AM on the 1st
    'DELETE FROM public.notifications WHERE created_at < NOW() - INTERVAL ''90 days'';'
);

SELECT cron.schedule(
    'cleanup-old-analytics-events',
    '0 4 1 * *', -- Monthly at 4 AM on the 1st
    'DELETE FROM public.analytics_events WHERE created_at < NOW() - INTERVAL ''1 year'';'
);

-- Create a view for user dashboard stats
CREATE OR REPLACE VIEW user_dashboard_stats AS
SELECT 
    u.id as user_id,
    u.full_name,
    u.business_name,
    sp.name as plan_name,
    sp.monthly_transaction_limit,
    
    -- Current month stats
    COALESCE(SUM(CASE WHEN ur.period_start >= DATE_TRUNC('month', CURRENT_DATE) THEN ur.transaction_count ELSE 0 END), 0) as current_month_transactions,
    COALESCE(SUM(CASE WHEN ur.period_start >= DATE_TRUNC('month', CURRENT_DATE) THEN ur.total_volume_usdc ELSE 0 END), 0) as current_month_volume,
    COALESCE(SUM(CASE WHEN ur.period_start >= DATE_TRUNC('month', CURRENT_DATE) THEN ur.total_fees_collected ELSE 0 END), 0) as current_month_fees,
    
    -- All time stats
    COALESCE(SUM(ur.transaction_count), 0) as total_transactions,
    COALESCE(SUM(ur.total_volume_usdc), 0) as total_volume,
    COALESCE(SUM(ur.total_fees_collected), 0) as total_fees_collected,
    
    -- Recent activity
    (SELECT COUNT(*) FROM public.transactions t WHERE t.user_id = u.id AND t.created_at >= NOW() - INTERVAL '7 days') as transactions_last_7_days,
    (SELECT COUNT(*) FROM public.customers c WHERE c.user_id = u.id) as total_customers,
    (SELECT COUNT(*) FROM public.invoices i WHERE i.user_id = u.id AND i.status = 'sent') as pending_invoices,
    (SELECT COUNT(*) FROM public.notifications n WHERE n.user_id = u.id AND n.read_at IS NULL) as unread_notifications

FROM public.users u
LEFT JOIN public.user_subscriptions us ON u.id = us.user_id AND us.status = 'active'
LEFT JOIN public.subscription_plans sp ON us.plan_id = sp.id
LEFT JOIN public.usage_records ur ON u.id = ur.user_id
GROUP BY u.id, u.full_name, u.business_name, sp.name, sp.monthly_transaction_limit;

-- Create a view for transaction analytics
CREATE OR REPLACE VIEW transaction_analytics AS
SELECT 
    user_id,
    DATE_TRUNC('day', created_at) as date,
    COUNT(*) as transaction_count,
    SUM(amount_usdc) as total_volume,
    SUM(platform_fee) as total_fees,
    AVG(amount_usdc) as avg_transaction_size,
    COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as successful_transactions,
    COUNT(CASE WHEN status = 'failed' THEN 1 END) as failed_transactions,
    ROUND(
        (COUNT(CASE WHEN status = 'confirmed' THEN 1 END)::DECIMAL / COUNT(*)) * 100, 
        2
    ) as success_rate
FROM public.transactions
WHERE created_at >= CURRENT_DATE - INTERVAL '90 days'
GROUP BY user_id, DATE_TRUNC('day', created_at)
ORDER BY date DESC;

-- Create indexes for the views
CREATE INDEX idx_usage_records_user_period_start ON public.usage_records(user_id, period_start);
CREATE INDEX idx_transactions_user_created_status ON public.transactions(user_id, created_at, status);

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT SELECT ON public.subscription_plans TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT SELECT ON user_dashboard_stats TO authenticated;
GRANT SELECT ON transaction_analytics TO authenticated;
