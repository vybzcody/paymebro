import { useState, useEffect } from 'react'
import { supabase, type Transaction } from '@/lib/supabase'
import { useAuth } from "@/hooks/useAuth";

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useAuth()

  // Fetch transactions
  const fetchTransactions = async () => {
    console.log('fetchTransactions called with user:', user);
    
    if (!user?.id) {
      console.log('No user ID available for fetching transactions. User object:', user);
      setTransactions([]);
      return;
    }

    try {
      setLoading(true)
      console.log('Fetching transactions for user ID:', user.id);
      
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
      console.log('Fetched transactions:', data);
      setTransactions(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching transactions:', err)
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    const walletAddress = user?.walletAddress || publicKey?.toString();
    if (!walletAddress) return

    fetchTransactions()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions'
        },
        (payload) => {
          console.log('🔄 Transaction update:', payload)
          
          if (payload.eventType === 'INSERT') {
            setTransactions(prev => [payload.new as Transaction, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setTransactions(prev => 
              prev.map(tx => 
                tx.id === payload.new.id ? payload.new as Transaction : tx
              )
            )
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.id])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
}
