import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

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
}

export const useInvoices = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useWeb3Auth()

  const fetchInvoices = async () => {
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
        setInvoices([])
        return
      }

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setInvoices(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (walletAddress) {
      fetchInvoices()
    }
  }, [user?.walletAddress, publicKey])

  return {
    invoices,
    loading,
    error,
    refetch: fetchInvoices
  }
}
