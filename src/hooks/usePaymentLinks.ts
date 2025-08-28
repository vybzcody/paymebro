import { useState, useEffect } from 'react'
import { supabase, type PaymentLink } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

export const usePaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useWeb3Auth()

  // Fetch payment links
  const fetchPaymentLinks = async () => {
    if (!user?.walletAddress && !publicKey) {
      console.log('No wallet address available for fetching payment links');
      return;
    }

    const walletAddress = user?.walletAddress || publicKey?.toString();
    if (!walletAddress) return;

    try {
      setLoading(true)
      console.log('Fetching payment links for wallet:', walletAddress);
      
      // First get user by wallet address, then get payment links
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      if (userError) {
        console.log('User not found in database:', userError);
        setPaymentLinks([]);
        return;
      }

      const { data, error } = await supabase
        .from('payment_links')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      console.log('Fetched payment links:', data);
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
    const walletAddress = user?.walletAddress || publicKey?.toString();
    if (!walletAddress) throw new Error('Wallet not connected')

    try {
      // First ensure user exists in database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id')
        .eq('wallet_address', walletAddress)
        .single();

      let userId = userData?.id;

      // If user doesn't exist, create them
      if (userError && userError.code === 'PGRST116') {
        const { data: newUser, error: createError } = await supabase
          .from('users')
          .insert({
            wallet_address: walletAddress,
            web3auth_user_id: user?.verifierId || user?.sub || walletAddress,
            email: user?.email,
            name: user?.name,
            avatar_url: user?.profileImage,
            login_provider: user?.typeOfLogin || 'unknown'
          })
          .select('id')
          .single();

        if (createError) throw createError;
        userId = newUser.id;
        console.log('Created new user:', newUser);
      } else if (userError) {
        throw userError;
      }

      const reference = Math.random().toString(36).substring(2, 10)
      const paymentUrl = `${window.location.origin}/pay/${reference}`

      const { data, error } = await supabase
        .from('payment_links')
        .insert({
          user_id: userId,
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
    const walletAddress = user?.walletAddress || publicKey?.toString();
    if (walletAddress) {
      fetchPaymentLinks();
    }
  }, [user?.walletAddress, publicKey])

  return {
    paymentLinks,
    loading,
    error,
    createPaymentLink,
    refetch: fetchPaymentLinks
  }
}
