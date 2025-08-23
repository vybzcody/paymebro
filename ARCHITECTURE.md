# AfriPay Cost-Effective SaaS Architecture

## Overview

AfriPay is a lean, cost-effective payment processing SaaS platform built on Solana Pay, using Web3Auth for authentication and Supabase as the backend. This architecture prioritizes minimal operational costs while maintaining production-ready functionality.

## Core Technology Stack (Cost-Optimized)

### Frontend
- **Framework**: React 18 + TypeScript + Vite
- **UI Library**: shadcn/ui + Tailwind CSS
- **State Management**: React Query + Zustand
- **Authentication**: Web3Auth Modal SDK
- **Wallet Integration**: Web3Auth Solana Provider

### Backend Services
- **Database**: Supabase (PostgreSQL + Real-time + Auth + Storage)
- **API**: Supabase Edge Functions (Deno runtime)
- **Authentication**: Web3Auth + Supabase RLS
- **Payment Processing**: Solana Pay SDK (client-side)
- **Email Service**: Supabase (built-in) + Resend (free tier)
- **File Storage**: Supabase Storage

### Infrastructure (Free/Low-Cost)
- **Frontend Hosting**: Vercel (free tier)
- **Backend**: Supabase (free tier: 500MB DB, 2GB bandwidth)
- **Email**: Resend (3,000 emails/month free)
- **Monitoring**: Supabase Analytics + Vercel Analytics
- **CDN**: Vercel Edge Network (included)

## Web3Auth Integration Architecture

### Authentication Flow

```typescript
// Web3Auth Configuration
import { Web3AuthModal } from "@web3auth/modal";
import { WALLET_CONNECTORS } from "@web3auth/modal";
import { SolanaWallet } from "@web3auth/solana-provider";

const web3AuthConfig = {
  clientId: process.env.VITE_WEB3AUTH_CLIENT_ID,
  web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_MAINNET, // or DEVNET for testing
  chainConfig: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x1", // Solana Mainnet
    rpcTarget: "https://api.mainnet-beta.solana.com",
  },
};

// Authentication Context
interface AuthContextType {
  user: any;
  wallet: SolanaWallet | null;
  isConnected: boolean;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  getAccounts: () => Promise<string[]>;
  signTransaction: (transaction: Transaction) => Promise<Transaction>;
}

const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const { connect, disconnect, isConnected, userInfo } = useWeb3AuthConnect();
  const { accounts, signTransaction } = useSolanaWallet();
  
  // Sync Web3Auth user with Supabase
  useEffect(() => {
    if (isConnected && userInfo) {
      syncUserWithSupabase(userInfo, accounts[0]);
    }
  }, [isConnected, userInfo, accounts]);
  
  const syncUserWithSupabase = async (userInfo: any, walletAddress: string) => {
    const { data, error } = await supabase
      .from('users')
      .upsert({
        id: userInfo.verifierId,
        email: userInfo.email,
        name: userInfo.name,
        wallet_address: walletAddress,
        auth_provider: userInfo.typeOfLogin,
        last_login: new Date().toISOString(),
      }, { onConflict: 'id' });
  };
  
  return (
    <AuthContext.Provider value={{
      user: userInfo,
      wallet: accounts?.[0],
      isConnected,
      login: connect,
      logout: disconnect,
      getAccounts: () => Promise.resolve(accounts || []),
      signTransaction,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
```

## Supabase Database Schema

### Core Tables (Optimized for Supabase)

```sql
-- Enable Row Level Security
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Users table (synced with Web3Auth)
CREATE TABLE users (
    id TEXT PRIMARY KEY, -- Web3Auth verifierId
    email TEXT UNIQUE,
    name TEXT,
    wallet_address TEXT NOT NULL,
    auth_provider TEXT NOT NULL, -- google, discord, etc.
    subscription_tier TEXT DEFAULT 'free',
    subscription_status TEXT DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id);

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id);

-- Business profiles
CREATE TABLE business_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    business_name TEXT NOT NULL,
    business_type TEXT,
    business_email TEXT,
    business_phone TEXT,
    business_address TEXT,
    tax_id TEXT,
    website TEXT,
    logo_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE business_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own business" ON business_profiles
    FOR ALL USING (auth.uid()::text = user_id);

-- Transactions (Solana Pay)
CREATE TABLE transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    reference TEXT NOT NULL UNIQUE, -- Solana Pay reference
    signature TEXT, -- Transaction signature after confirmation
    recipient_wallet TEXT NOT NULL,
    sender_wallet TEXT,
    amount_usdc DECIMAL(20, 6) NOT NULL,
    platform_fee DECIMAL(20, 6) NOT NULL,
    merchant_receives DECIMAL(20, 6) NOT NULL,
    status TEXT DEFAULT 'pending', -- pending, confirmed, failed
    payment_method TEXT DEFAULT 'qr_code',
    customer_email TEXT,
    customer_name TEXT,
    description TEXT,
    metadata JSONB DEFAULT '{}',
    block_height BIGINT,
    confirmations INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    confirmed_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own transactions" ON transactions
    FOR SELECT USING (auth.uid()::text = user_id);

-- Indexes for performance
CREATE INDEX idx_transactions_user_created ON transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_reference ON transactions(reference);
CREATE INDEX idx_transactions_signature ON transactions(signature);
CREATE INDEX idx_transactions_status ON transactions(status);

-- Invoices
CREATE TABLE invoices (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    invoice_number TEXT NOT NULL,
    customer_name TEXT NOT NULL,
    customer_email TEXT NOT NULL,
    customer_address TEXT,
    amount_usdc DECIMAL(20, 6) NOT NULL,
    tax_amount DECIMAL(20, 6) DEFAULT 0,
    total_amount DECIMAL(20, 6) NOT NULL,
    status TEXT DEFAULT 'draft',
    due_date DATE,
    payment_reference TEXT, -- Links to transaction
    notes TEXT,
    terms TEXT,
    items JSONB NOT NULL DEFAULT '[]',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE
);

ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own invoices" ON invoices
    FOR ALL USING (auth.uid()::text = user_id);

-- Customers
CREATE TABLE customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT,
    wallet_address TEXT,
    location TEXT,
    total_spent DECIMAL(20, 6) DEFAULT 0,
    transaction_count INTEGER DEFAULT 0,
    last_transaction_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, email)
);

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can manage own customers" ON customers
    FOR ALL USING (auth.uid()::text = user_id);

-- Usage tracking (for billing)
CREATE TABLE usage_records (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    transaction_count INTEGER DEFAULT 0,
    total_volume DECIMAL(20, 6) DEFAULT 0,
    total_fees DECIMAL(20, 6) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_start)
);

ALTER TABLE usage_records ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own usage" ON usage_records
    FOR SELECT USING (auth.uid()::text = user_id);
```

## Supabase Edge Functions (Serverless Backend)

### Core Edge Functions

```typescript
// supabase/functions/create-payment/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { encodeURL } from "https://esm.sh/@solana/pay@0.2.5";
import { PublicKey } from "https://esm.sh/@solana/web3.js@1.78.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Unauthorized');

    const { amount, description, customerEmail, customerName } = await req.json();

    // Generate unique reference
    const reference = crypto.randomUUID();
    
    // Get user's wallet address
    const { data: userData } = await supabase
      .from('users')
      .select('wallet_address, subscription_tier')
      .eq('id', user.id)
      .single();

    if (!userData) throw new Error('User not found');

    // Calculate fees based on subscription tier
    const feeRates = {
      free: 0.029,      // 2.9%
      starter: 0.024,   // 2.4%
      business: 0.019,  // 1.9%
      enterprise: 0.014 // 1.4%
    };
    
    const feeRate = feeRates[userData.subscription_tier] || feeRates.free;
    const platformFee = amount * feeRate;
    const merchantReceives = amount - platformFee;

    // Create transaction record
    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert({
        user_id: user.id,
        reference,
        recipient_wallet: userData.wallet_address,
        amount_usdc: amount,
        platform_fee: platformFee,
        merchant_receives: merchantReceives,
        customer_email: customerEmail,
        customer_name: customerName,
        description,
        status: 'pending'
      })
      .select()
      .single();

    if (error) throw error;

    // Generate Solana Pay URL
    const recipient = new PublicKey(userData.wallet_address);
    const referenceKey = new PublicKey(reference);
    const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');

    const url = encodeURL({
      recipient,
      amount,
      splToken: USDC_MINT,
      reference: referenceKey,
      label: 'AfriPay Payment',
      message: description || 'Payment via AfriPay',
    });

    return new Response(
      JSON.stringify({
        transaction,
        paymentUrl: url.toString(),
        qrCode: `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url.toString())}`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

```typescript
// supabase/functions/verify-transaction/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { Connection, PublicKey } from "https://esm.sh/@solana/web3.js@1.78.0";

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { reference } = await req.json();
    
    // Get transaction from database
    const { data: transaction } = await supabase
      .from('transactions')
      .select('*')
      .eq('reference', reference)
      .single();

    if (!transaction) throw new Error('Transaction not found');

    // Check Solana network for confirmation
    const connection = new Connection('https://api.mainnet-beta.solana.com');
    const referenceKey = new PublicKey(reference);
    
    const signatures = await connection.getSignaturesForAddress(referenceKey, { limit: 1 });
    
    if (signatures.length === 0) {
      return new Response(
        JSON.stringify({ status: 'pending', transaction }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const signature = signatures[0];
    const confirmedTx = await connection.getTransaction(signature.signature);

    if (confirmedTx && !confirmedTx.meta?.err) {
      // Update transaction as confirmed
      const { data: updatedTx } = await supabase
        .from('transactions')
        .update({
          status: 'confirmed',
          signature: signature.signature,
          confirmations: 32,
          confirmed_at: new Date().toISOString()
        })
        .eq('reference', reference)
        .select()
        .single();

      // Update customer stats
      await supabase.rpc('update_customer_stats', {
        p_user_id: transaction.user_id,
        p_customer_email: transaction.customer_email,
        p_amount: transaction.amount_usdc
      });

      // Send confirmation email
      await supabase.functions.invoke('send-email', {
        body: {
          type: 'payment_confirmation',
          to: transaction.customer_email,
          data: {
            amount: transaction.amount_usdc,
            signature: signature.signature
          }
        }
      });

      return new Response(
        JSON.stringify({ status: 'confirmed', transaction: updatedTx }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ status: 'failed', transaction }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
```

## Email Service (Cost-Effective)

### Using Resend (Free Tier)

```typescript
// supabase/functions/send-email/index.ts
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

serve(async (req) => {
  const { type, to, data } = await req.json();
  
  const templates = {
    payment_confirmation: {
      subject: `Payment Confirmed - $${data.amount} USDC`,
      html: `
        <h2>Payment Confirmed!</h2>
        <p>Your payment of $${data.amount} USDC has been confirmed.</p>
        <p>Transaction: ${data.signature}</p>
        <p>View on Solana Explorer: https://explorer.solana.com/tx/${data.signature}</p>
      `
    },
    invoice_sent: {
      subject: `Invoice ${data.invoiceNumber} - $${data.amount} USDC`,
      html: `
        <h2>New Invoice</h2>
        <p>You have received an invoice for $${data.amount} USDC</p>
        <p>Due Date: ${data.dueDate}</p>
        <a href="${data.paymentUrl}">Pay Now</a>
      `
    }
  };

  const template = templates[type];
  if (!template) throw new Error('Invalid email type');

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'AfriPay <noreply@afripay.com>',
      to: [to],
      subject: template.subject,
      html: template.html,
    }),
  });

  const result = await response.json();
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' },
  });
});
```

## Real-time Features with Supabase

### Transaction Status Updates

```typescript
// hooks/useRealtimeTransactions.ts
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { useEffect, useState } from 'react';

export const useRealtimeTransactions = (userId: string) => {
  const supabase = useSupabaseClient();
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    // Subscribe to transaction changes
    const subscription = supabase
      .channel('transactions')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'transactions',
        filter: `user_id=eq.${userId}`
      }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          setTransactions(prev => 
            prev.map(tx => 
              tx.id === payload.new.id ? payload.new : tx
            )
          );
        } else if (payload.eventType === 'INSERT') {
          setTransactions(prev => [payload.new, ...prev]);
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [userId, supabase]);

  return transactions;
};
```

## Cost Analysis (Monthly)

### Free Tier Limits
- **Supabase Free**: 500MB DB, 2GB bandwidth, 50MB file storage
- **Vercel Free**: 100GB bandwidth, unlimited deployments
- **Resend Free**: 3,000 emails/month, 100 emails/day
- **Web3Auth Free**: 1,000 monthly active users

### Estimated Costs for Growth

```typescript
// Cost calculator for different usage levels
const costCalculator = {
  // Up to 1,000 users, 10,000 transactions/month
  small: {
    supabase: 0,      // Free tier
    vercel: 0,        // Free tier
    resend: 0,        // Free tier
    web3auth: 0,      // Free tier
    total: 0
  },
  
  // Up to 10,000 users, 100,000 transactions/month
  medium: {
    supabase: 25,     // Pro plan
    vercel: 20,       // Pro plan
    resend: 20,       // Pro plan (50k emails)
    web3auth: 99,     // Growth plan
    total: 164
  },
  
  // Up to 100,000 users, 1M transactions/month
  large: {
    supabase: 599,    // Team plan
    vercel: 150,      // Team plan
    resend: 85,       // Business plan
    web3auth: 399,    // Scale plan
    total: 1233
  }
};
```

## Deployment Guide

### Environment Variables

```bash
# Frontend (.env)
VITE_WEB3AUTH_CLIENT_ID=your_web3auth_client_id
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SOLANA_NETWORK=mainnet-beta
VITE_USDC_MINT=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v

# Supabase Edge Functions
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RESEND_API_KEY=re_your_resend_key
SOLANA_RPC_URL=https://api.mainnet-beta.solana.com
```

### Deployment Steps

```bash
# 1. Deploy to Vercel
npm run build
vercel --prod

# 2. Deploy Supabase functions
supabase functions deploy create-payment
supabase functions deploy verify-transaction
supabase functions deploy send-email

# 3. Set up database
supabase db push

# 4. Configure environment variables
vercel env add VITE_WEB3AUTH_CLIENT_ID
vercel env add VITE_SUPABASE_URL
# ... add all environment variables
```

## Security Considerations

### Row Level Security (RLS)
- All tables have RLS enabled
- Users can only access their own data
- Web3Auth integration provides secure authentication
- No API keys stored in frontend

### Data Protection
```sql
-- Example RLS policy
CREATE POLICY "Users can only see own transactions" ON transactions
  FOR SELECT USING (auth.uid()::text = user_id);

-- Prevent unauthorized access
CREATE POLICY "Prevent unauthorized inserts" ON transactions
  FOR INSERT WITH CHECK (auth.uid()::text = user_id);
```

## Monitoring & Analytics

### Built-in Supabase Analytics
- Database performance metrics
- API usage statistics
- Real-time connection monitoring
- Error tracking

### Custom Analytics
```typescript
// Track key business metrics
const trackEvent = async (event: string, properties: Record<string, any>) => {
  await supabase.from('analytics_events').insert({
    user_id: user.id,
    event_name: event,
    properties,
    timestamp: new Date().toISOString()
  });
};

// Usage examples
trackEvent('payment_created', { amount, currency: 'USDC' });
trackEvent('invoice_sent', { invoice_id, customer_email });
trackEvent('subscription_upgraded', { from_plan, to_plan });
```

## Scaling Strategy

### Database Optimization
- Use Supabase's built-in connection pooling
- Implement proper indexing for query performance
- Use materialized views for complex analytics
- Archive old transactions to separate tables

### Caching Strategy (No Redis)
- Use Supabase's built-in caching
- Browser localStorage for user preferences
- React Query for client-side caching
- CDN caching for static assets

### Background Jobs (Supabase Cron)
```sql
-- Set up cron jobs for maintenance tasks
SELECT cron.schedule(
  'update-usage-records',
  '0 1 * * *', -- Daily at 1 AM
  'SELECT update_daily_usage_records();'
);

SELECT cron.schedule(
  'cleanup-old-transactions',
  '0 2 1 * *', -- Monthly cleanup
  'DELETE FROM transactions WHERE created_at < NOW() - INTERVAL ''2 years'';'
);
```

## Business Model Implementation

### Subscription Tiers (Stored in Database)
```sql
-- Subscription plans configuration
CREATE TABLE subscription_plans (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price_monthly DECIMAL(10, 2) NOT NULL,
    price_yearly DECIMAL(10, 2) NOT NULL,
    transaction_fee DECIMAL(5, 4) NOT NULL, -- e.g., 0.029 for 2.9%
    monthly_limit INTEGER NOT NULL,
    features JSONB NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- Insert default plans
INSERT INTO subscription_plans VALUES
('free', 'Free', 0, 0, 0.029, 50, '["Basic dashboard", "Email support"]', true),
('starter', 'Starter', 15, 150, 0.024, 1000, '["Advanced analytics", "Priority support"]', true),
('business', 'Business', 49, 490, 0.019, 10000, '["API access", "White-label"]', true),
('enterprise', 'Enterprise', 149, 1490, 0.014, 100000, '["Custom integrations", "Dedicated support"]', true);
```

### Usage Tracking Function
```sql
-- Function to update usage records
CREATE OR REPLACE FUNCTION update_daily_usage_records()
RETURNS void AS $$
BEGIN
  INSERT INTO usage_records (user_id, period_start, period_end, transaction_count, total_volume, total_fees)
  SELECT 
    user_id,
    CURRENT_DATE - INTERVAL '1 day',
    CURRENT_DATE,
    COUNT(*),
    SUM(amount_usdc),
    SUM(platform_fee)
  FROM transactions 
  WHERE DATE(created_at) = CURRENT_DATE - INTERVAL '1 day'
    AND status = 'confirmed'
  GROUP BY user_id
  ON CONFLICT (user_id, period_start) 
  DO UPDATE SET
    transaction_count = EXCLUDED.transaction_count,
    total_volume = EXCLUDED.total_volume,
    total_fees = EXCLUDED.total_fees;
END;
$$ LANGUAGE plpgsql;
```

## Migration from Expensive Architecture

### What We Eliminated
- ❌ Separate Node.js/Express server
- ❌ Redis for caching and sessions
- ❌ PostgreSQL hosting costs
- ❌ Complex webhook infrastructure
- ❌ Separate email service costs
- ❌ Container orchestration

### What We Gained
- ✅ $0 monthly cost for small scale
- ✅ Built-in real-time capabilities
- ✅ Automatic scaling
- ✅ Built-in authentication
- ✅ Row-level security
- ✅ Simplified deployment
- ✅ Built-in analytics

This cost-effective architecture can handle significant scale while keeping operational costs minimal, making it perfect for bootstrapping a Solana Pay SaaS business.
