import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Database types (generated from your schema)
export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          wallet_address: string | null;
          business_name: string | null;
          business_type: string | null;
          country: string | null;
          timezone: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          business_name?: string | null;
          business_type?: string | null;
          country?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          wallet_address?: string | null;
          business_name?: string | null;
          business_type?: string | null;
          country?: string | null;
          timezone?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      subscription_plans: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          price_monthly: number;
          price_yearly: number;
          transaction_fee: number;
          monthly_transaction_limit: number;
          features: any[];
          is_active: boolean;
          created_at: string;
        };
      };
      user_subscriptions: {
        Row: {
          id: string;
          user_id: string;
          plan_id: string;
          status: 'active' | 'canceled' | 'past_due' | 'trialing';
          current_period_start: string;
          current_period_end: string;
          trial_end: string | null;
          created_at: string;
          updated_at: string;
        };
      };
      customers: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string | null;
          wallet_address: string | null;
          company: string | null;
          address: any | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string | null;
          wallet_address?: string | null;
          company?: string | null;
          address?: any | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string | null;
          wallet_address?: string | null;
          company?: string | null;
          address?: any | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      payment_requests: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          reference: string;
          amount_usdc: number;
          description: string;
          recipient_wallet: string;
          payment_url: string;
          qr_code_url: string | null;
          expires_at: string | null;
          metadata: any;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          reference: string;
          amount_usdc: number;
          description: string;
          recipient_wallet: string;
          payment_url: string;
          qr_code_url?: string | null;
          expires_at?: string | null;
          metadata?: any;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string | null;
          payment_request_id: string | null;
          signature: string | null;
          reference: string;
          amount_usdc: number;
          platform_fee: number;
          net_amount: number;
          sender_wallet: string | null;
          recipient_wallet: string;
          status: 'pending' | 'confirmed' | 'failed' | 'expired';
          block_time: string | null;
          confirmation_count: number;
          description: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id?: string | null;
          payment_request_id?: string | null;
          signature?: string | null;
          reference: string;
          amount_usdc: number;
          platform_fee?: number;
          net_amount: number;
          sender_wallet?: string | null;
          recipient_wallet: string;
          status?: 'pending' | 'confirmed' | 'failed' | 'expired';
          block_time?: string | null;
          confirmation_count?: number;
          description?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      invoices: {
        Row: {
          id: string;
          user_id: string;
          customer_id: string;
          invoice_number: string;
          amount_usdc: number;
          tax_amount: number;
          total_amount: number;
          description: string | null;
          line_items: any[];
          due_date: string | null;
          payment_request_id: string | null;
          transaction_id: string | null;
          status: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
          notes: string | null;
          metadata: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          customer_id: string;
          invoice_number: string;
          amount_usdc: number;
          tax_amount?: number;
          total_amount: number;
          description?: string | null;
          line_items?: any[];
          due_date?: string | null;
          payment_request_id?: string | null;
          transaction_id?: string | null;
          status?: 'draft' | 'sent' | 'paid' | 'overdue' | 'canceled';
          notes?: string | null;
          metadata?: any;
          created_at?: string;
          updated_at?: string;
        };
      };
      notifications: {
        Row: {
          id: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data: any;
          read_at: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          type: string;
          title: string;
          message: string;
          data?: any;
          read_at?: string | null;
          created_at?: string;
        };
      };
    };
    Views: {
      user_dashboard_stats: {
        Row: {
          user_id: string;
          full_name: string | null;
          business_name: string | null;
          plan_name: string;
          monthly_transaction_limit: number;
          current_month_transactions: number;
          current_month_volume: number;
          current_month_fees: number;
          total_transactions: number;
          total_volume: number;
          total_fees_collected: number;
          transactions_last_7_days: number;
          total_customers: number;
          pending_invoices: number;
          unread_notifications: number;
        };
      };
    };
    Functions: {
      calculate_platform_fee: {
        Args: {
          amount_usdc: number;
          user_id: string;
        };
        Returns: number;
      };
      check_subscription_limits: {
        Args: {
          user_id: string;
        };
        Returns: any;
      };
      generate_invoice_number: {
        Args: {
          user_id: string;
        };
        Returns: string;
      };
    };
  };
}

export type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export type Inserts<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Insert'];
export type Updates<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Update'];
