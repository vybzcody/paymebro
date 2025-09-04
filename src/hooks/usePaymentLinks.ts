import { useState, useEffect } from 'react'
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { getPaymentLinks, createPaymentLink as createPaymentLinkService } from '@/services/businessService';

export interface PaymentLink {
  id: string
  user_id?: string
  title: string
  description?: string
  amount: number
  currency: string
  reference?: string
  payment_url: string
  payment_count?: number
  total_collected?: number
  is_active?: boolean
  created_at: string
  url?: string
  clicks?: number
  conversions?: number
}

export const usePaymentLinks = () => {
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, keyService } = useMultiChainWeb3Auth()

  const fetchPaymentLinks = async () => {
    if (!user) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)
      
      // Get user identifier from Web3Auth
      const userId = user.verifierId || user.sub || user.email;
      if (!userId) {
        throw new Error('No user identifier found');
      }

      const links = await getPaymentLinks(userId);
      setPaymentLinks(links);
    } catch (err: any) {
      console.error('Error fetching payment links:', err);
      setError(err.message)
      setPaymentLinks([])
    } finally {
      setLoading(false)
    }
  }

  const createPaymentLink = async (linkData: {
    title: string
    description?: string
    amount: number
    currency?: string
    preferredReceiveChain?: string
    acceptedChains?: string[]
    merchantWallets?: Record<string, string>
  }) => {
    if (!user || !keyService) {
      throw new Error('User not authenticated')
    }

    try {
      const userId = user.verifierId || user.sub || user.email;
      if (!userId) {
        throw new Error('No user identifier found');
      }

      // Get wallet addresses if not provided
      let merchantWallets = linkData.merchantWallets;
      if (!merchantWallets && keyService) {
        const allAccounts = await keyService.getAllAccounts();
        merchantWallets = {};
        for (const [chainId, address] of Object.entries(allAccounts)) {
          if (address) {
            merchantWallets[chainId] = address;
          }
        }
      }

      const newLink = await createPaymentLinkService(
        userId,
        linkData.title,
        linkData.amount,
        linkData.currency || 'USDC',
        {
          preferredReceiveChain: linkData.preferredReceiveChain,
          acceptedChains: linkData.acceptedChains,
          merchantWallets
        }
      );

      // Add to local state
      setPaymentLinks(prev => [newLink, ...prev]);
      return newLink;
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deletePaymentLink = async (id: string) => {
    try {
      // TODO: Implement delete endpoint
      console.log('Delete payment link:', id);
      
      // For now, just remove from local state
      setPaymentLinks(prev => prev.filter(link => link.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  // Fetch payment links when user changes
  useEffect(() => {
    if (user) {
      fetchPaymentLinks()
    } else {
      setPaymentLinks([])
      setLoading(false)
    }
  }, [user])

  return {
    paymentLinks,
    loading,
    error,
    createPaymentLink,
    deletePaymentLink,
    refetch: fetchPaymentLinks
  }
}
