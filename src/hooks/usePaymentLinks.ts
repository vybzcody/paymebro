import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';

export interface PaymentLink {
  id: string
  user_id: string
  title: string
  description?: string
  amount: number
  currency: string
  reference: string
  payment_url: string
  payment_count: number
  total_collected: number
  is_active: boolean
  created_at: string
}

export const usePaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useMultiChainWeb3Auth()

  const fetchPaymentLinks = async () => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (!walletAddress) return

    try {
      setLoading(true)
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single()

      if (userError) {
        setPaymentLinks([])
        return
      }

      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaymentLinks(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createPaymentLink = async (linkData: {
    title: string
    description?: string
    amount: number
    currency?: string
  }) => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (!walletAddress) throw new Error('Wallet not connected')

    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/payment-links/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          walletAddress,
          title: linkData.title,
          description: linkData.description,
          amount: linkData.amount,
          currency: linkData.currency || 'USDC'
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create payment link')
      }

      const data = await response.json()
      setPaymentLinks(prev => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deletePaymentLink = async (id: string) => {
    try {
      const { error } = await supabase
        .from('payment_links')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setPaymentLinks(prev => prev.filter(link => link.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Real-time subscription
  useEffect(() => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (!walletAddress) return

    fetchPaymentLinks()

    // Get user ID for subscription
    const setupSubscription = async () => {
      const { data: userData } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single()

      if (!userData) return

      // Set up real-time subscription
      const subscription = supabase
        .channel('payment_links')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'payment_links',
            filter: `user_id=eq.${userData.id}`
          },
          (payload) => {
            console.log('🔄 Payment link update:', payload)
            
            if (payload.eventType === 'INSERT') {
              setPaymentLinks(prev => [payload.new as PaymentLink, ...prev])
            } else if (payload.eventType === 'UPDATE') {
              setPaymentLinks(prev => 
                prev.map(link => 
                  link.id === payload.new.id ? payload.new as PaymentLink : link
                )
              )
            } else if (payload.eventType === 'DELETE') {
              setPaymentLinks(prev => prev.filter(link => link.id !== payload.old.id))
            }
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }

    const cleanup = setupSubscription()
    return () => {
      cleanup.then(fn => fn?.())
    }
  }, [user?.walletAddress, publicKey])

  return {
    paymentLinks,
    loading,
    error,
    createPaymentLink,
    deletePaymentLink,
    refetch: fetchPaymentLinks
  }
}
