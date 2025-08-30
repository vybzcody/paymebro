import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext'

export interface Invoice {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  amount: number
  currency: string
  description?: string
  due_date?: string
  notes?: string
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  created_at: string
  sent_at?: string
  paid_at?: string
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useMultiChainWeb3Auth()

  const fetchInvoices = async () => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return

    try {
      setLoading(true)
      const userId = user.userId || user.id
      
      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Real-time subscription
  useEffect(() => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) return

    const userId = user.userId || user.id
    fetchInvoices()

    // Set up real-time subscription
    const subscription = supabase
      .channel(`invoices-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          console.log('🔄 Invoice update:', payload)
          
          if (payload.eventType === 'INSERT') {
            setInvoices(prev => [payload.new as Invoice, ...prev])
          } else if (payload.eventType === 'UPDATE') {
            setInvoices(prev => 
              prev.map(invoice => 
                invoice.id === payload.new.id ? payload.new as Invoice : invoice
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setInvoices(prev => prev.filter(invoice => invoice.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      subscription.unsubscribe()
    }
  }, [user?.userId, user?.id])

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices
  }
}
