import { useState, useEffect } from 'react'
import { supabase, type Transaction } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useWeb3Auth()

  // Fetch transactions
  const fetchTransactions = async () => {
    if (!user?.walletAddress && !publicKey) {
      console.log('No wallet address available for fetching transactions');
      return;
    }

    const walletAddress = user?.walletAddress || publicKey?.toString();
    if (!walletAddress) return;

    try {
      setLoading(true)
      console.log('Fetching transactions for wallet:', walletAddress);
      
      // First get user by wallet address, then get transactions
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError) {
        console.log('User not found in database:', userError);
        setTransactions([]);
        return;
      }

      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', userData.id)
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
  }, [user?.walletAddress, publicKey])

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions
  }
}
