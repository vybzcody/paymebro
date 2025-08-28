import { useState, useEffect } from 'react'
import { supabase, type PaymentLink } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

export const usePaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user } = useWeb3Auth()

  // Fetch payment links
  const fetchPaymentLinks = async () => {
    if (!user?.id) return

    try {
      setLoading(true)
      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setPaymentLinks(data || [])
    } catch (err: any) {
      setError(err.message)
      console.error('Error fetching payment links:', err)
    } finally {
      setLoading(false)
    }
  }

  // Create payment link
  const createPaymentLink = async (linkData: {
    title: string
    description?: string
    amount: number
    currency?: string
  }) => {
    if (!user?.id) throw new Error('User not authenticated')

    try {
      const reference = Math.random().toString(36).substring(2, 10)
      const paymentUrl = `${window.location.origin}/pay/${reference}`

      const { data, error } = await supabase
        .from('payment_links')
        .insert({
          user_id: user.id,
          title: linkData.title,
          description: linkData.description,
          amount: linkData.amount,
          currency: linkData.currency || 'USDC',
          reference,
          payment_url: paymentUrl
        })
        .select()
        .single()

      if (error) throw error
      
      setPaymentLinks(prev => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    fetchPaymentLinks()
  }, [user?.id])

  return {
    paymentLinks,
    loading,
    error,
    createPaymentLink,
    refetch: fetchPaymentLinks
  }
}
