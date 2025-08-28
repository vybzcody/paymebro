import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useWeb3Auth } from '@/contexts/Web3AuthContext'

export interface QRCode {
  id: string
  user_id: string
  title: string
  amount: number
  currency: string
  qr_code_url: string
  payment_url: string
  reference: string
  payment_count: number
  total_collected: number
  is_active: boolean
  created_at: string
}

export const useQRCodes = () => {
  const [qrCodes, setQRCodes] = useState<QRCode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const { user, publicKey } = useWeb3Auth()

  const fetchQRCodes = async () => {
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
        setQRCodes([])
        return
      }

      const { data, error } = await supabase
        .from('qr_codes')
        .select('*')
        .eq('user_id', userData.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setQRCodes(data || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const createQRCode = async (qrData: {
    title: string
    amount: number
    currency?: string
  }) => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (!walletAddress) throw new Error('Wallet not connected')

    console.log('Creating QR with data:', qrData)

    try {
      const requestBody = {
        walletAddress,
        title: qrData.title,
        amount: qrData.amount,
        currency: qrData.currency || 'USDC'
      }
      
      console.log('Request body:', requestBody)

      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/qr/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create QR code')
      }

      const data = await response.json()
      console.log('QR creation response:', data)
      
      setQRCodes(prev => [data, ...prev])
      return data
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  const deleteQRCode = async (id: string) => {
    try {
      const { error } = await supabase
        .from('qr_codes')
        .delete()
        .eq('id', id)

      if (error) throw error
      
      setQRCodes(prev => prev.filter(qr => qr.id !== id))
    } catch (err: any) {
      setError(err.message)
      throw err
    }
  }

  useEffect(() => {
    const walletAddress = user?.walletAddress || publicKey?.toString()
    if (walletAddress) {
      fetchQRCodes()
    }
  }, [user?.walletAddress, publicKey])

  return {
    qrCodes,
    loading,
    error,
    createQRCode,
    deleteQRCode,
    refetch: fetchQRCodes
  }
}
