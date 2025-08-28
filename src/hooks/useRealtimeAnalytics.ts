import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { AnalyticsFilters, RevenueMetrics } from './useAnalytics';

export const useRealtimeAnalytics = (filters: AnalyticsFilters) => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<RevenueMetrics>({
    totalRevenue: 0,
    totalTransactions: 0,
    mrr: 0,
    arr: 0,
    growth: 0,
    currencyBreakdown: { SOL: 0, USDC: 0 }
  });
  const [loading, setLoading] = useState(false);

  const getDateRange = () => {
    const now = new Date();
    let startDate: Date;
    
    switch (filters.dateRange) {
      case 'today':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'custom':
        return {
          start: filters.startDate || new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end: filters.endDate || now.toISOString()
        };
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }
    
    return {
      start: startDate.toISOString(),
      end: now.toISOString()
    };
  };

  const fetchAnalytics = useCallback(async () => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;
    
    setLoading(true);
    try {
      const userId = user.userId || user.id;
      const { start, end } = getDateRange();
      
      let query = supabase
        .from('transactions')
        .select('amount, currency, created_at, merchant_amount')
        .eq('user_id', userId)
        .gte('created_at', start)
        .lte('created_at', end);

      if (filters.currency && filters.currency !== 'all') {
        query = query.eq('currency', filters.currency);
      }

      if (filters.status && filters.status !== 'all') {
        query = query.eq('status', filters.status);
      }

      const { data: transactions, error } = await query;
      
      if (error) throw error;

      // Calculate metrics
      const totalRevenue = transactions?.reduce((sum, tx) => sum + Number(tx.merchant_amount || tx.amount), 0) || 0;
      const totalTransactions = transactions?.length || 0;
      
      // Currency breakdown
      const currencyBreakdown = transactions?.reduce((acc, tx) => {
        const amount = Number(tx.merchant_amount || tx.amount);
        acc[tx.currency as 'SOL' | 'USDC'] = (acc[tx.currency as 'SOL' | 'USDC'] || 0) + amount;
        return acc;
      }, { SOL: 0, USDC: 0 }) || { SOL: 0, USDC: 0 };

      // MRR calculation
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const recentTransactions = transactions?.filter(tx => 
        new Date(tx.created_at) >= thirtyDaysAgo
      ) || [];
      const monthlyRevenue = recentTransactions.reduce((sum, tx) => 
        sum + Number(tx.merchant_amount || tx.amount), 0
      );
      const mrr = monthlyRevenue;
      const arr = mrr * 12;

      // Growth calculation
      const periodLength = new Date(end).getTime() - new Date(start).getTime();
      const previousStart = new Date(new Date(start).getTime() - periodLength);
      
      const { data: previousTransactions } = await supabase
        .from('transactions')
        .select('merchant_amount, amount')
        .eq('user_id', userId)
        .gte('created_at', previousStart.toISOString())
        .lt('created_at', start);

      const previousRevenue = previousTransactions?.reduce((sum, tx) => 
        sum + Number(tx.merchant_amount || tx.amount), 0
      ) || 0;
      
      const growth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;

      setMetrics({
        totalRevenue,
        totalTransactions,
        mrr,
        arr,
        growth,
        currencyBreakdown
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.id, filters]);

  // Real-time subscription for analytics updates
  useEffect(() => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;

    const userId = user.userId || user.id;
    console.log('📊 Setting up analytics real-time subscription for user:', userId);
    
    // Initial fetch
    fetchAnalytics();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`analytics-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('📈 Analytics refreshing due to transaction change:', payload.eventType);
          // Debounce analytics refresh
          setTimeout(fetchAnalytics, 1000);
        }
      )
      .subscribe((status) => {
        console.log('📡 Analytics subscription status:', status);
      });

    // Fallback polling every 15 seconds for analytics
    const pollInterval = setInterval(() => {
      console.log('📊 Polling for analytics updates...');
      fetchAnalytics();
    }, 15000);

    return () => {
      console.log('🧹 Cleaning up analytics subscription and polling');
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [fetchAnalytics]);

  return { metrics, loading, refetch: fetchAnalytics };
};
