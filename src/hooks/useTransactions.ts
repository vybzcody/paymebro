import { useState, useEffect } from 'react'
import { supabase, type Transaction } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useWeb3Auth()

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) throw error
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
    if (!user?.id) return

    fetchTransactions()

    // Subscribe to real-time changes
    const subscription = supabase
      .channel('transactions')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'transactions',
          filter: `user_id=eq.${user.id}`
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
