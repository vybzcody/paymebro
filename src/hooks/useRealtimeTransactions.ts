import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from './useAuth';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  signature: string;
  amount: number;
  currency: string;
  status: string;
  created_at: string;
  merchant_amount: number;
  total_amount_paid: number;
}

export const useRealtimeTransactions = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Initial fetch
  const fetchTransactions = useCallback(async () => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;
    
    setLoading(true);
    try {
      const userId = user.userId || user.id;
      console.log('🔍 Fetching transactions for user:', userId);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;
      console.log('📊 Fetched transactions:', data?.length || 0);
      setTransactions(data || []);
    } catch (error) {
      console.error('❌ Error fetching transactions:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.userId, user?.id]);

  // Real-time subscription with fallback polling
  useEffect(() => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return;

    const userId = user.userId || user.id;
    console.log('🔄 Setting up real-time subscription for user:', userId);
    
    // Initial fetch
    fetchTransactions();

    // Set up real-time subscription
    const subscription = supabase
      .channel(`transactions-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔔 New transaction received via real-time:', payload.new);
          
          const newTransaction = payload.new as Transaction;
          
          // Add to transactions list
          setTransactions(prev => [newTransaction, ...prev]);
          
          // Show notification
          toast.success(`Payment received: ${newTransaction.amount} ${newTransaction.currency}`, {
            description: `Transaction confirmed`,
            duration: 5000,
          });
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Transaction updated via real-time:', payload.new);
          
          const updatedTransaction = payload.new as Transaction;
          
          // Update transaction in list
          setTransactions(prev => 
            prev.map(tx => 
              tx.id === updatedTransaction.id ? updatedTransaction : tx
            )
          );
        }
      )
      .subscribe((status) => {
        console.log('📡 Subscription status:', status);
      });

    // Fallback polling every 10 seconds
    const pollInterval = setInterval(() => {
      console.log('🔄 Polling for transaction updates...');
      fetchTransactions();
    }, 10000);

    return () => {
      console.log('🧹 Cleaning up subscription and polling');
      subscription.unsubscribe();
      clearInterval(pollInterval);
    };
  }, [user?.userId, user?.id, fetchTransactions]);

  return {
    transactions,
    loading,
    refetch: fetchTransactions
  };
};
