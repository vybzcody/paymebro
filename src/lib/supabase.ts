import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false
  },
  realtime: {
    params: {
      eventsPerSecond: 10
    }
  }
})

// Database types
export interface User {
  id: string
  wallet_address: string
  web3auth_user_id: string
  email?: string
  name?: string
  username?: string
  business_name?: string
  created_at: string
}

export interface Transaction {
  id: string
  user_id: string
  signature?: string
  reference: string
  amount: number
  currency: string
  platform_fee: number
  net_amount: number
  sender_wallet?: string
  recipient_wallet: string
  status: 'pending' | 'confirmed' | 'failed' | 'expired'
  customer_email?: string
  customer_name?: string
  created_at: string
}

export interface PaymentLink {
  id: string
  user_id: string
  title: string
  description?: string
  reference: string
  amount: number
  currency: string
  payment_url: string
  is_active: boolean
  view_count: number
  payment_count: number
  total_collected: number
  created_at: string
  
  // Multi-chain extensions
  preferredReceiveChain?: string
  acceptedChains?: string[]
  merchantWallets?: Record<string, string>
  autoConvert?: boolean
  
  // Legacy compatibility
  url?: string
  clicks?: number
  conversions?: number
}
