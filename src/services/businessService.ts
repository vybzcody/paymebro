import { supabase } from '@/lib/supabase';

export interface BusinessMetrics {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  activeCustomers: number;
  monthlyGrowth: number;
}

export interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  currency: string;
  url: string;
  created_at: string;
  clicks: number;
  conversions: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled';
  created_at: string;
  due_date?: string;
  description: string;
}

/**
 * Get business metrics for the current user
 */
export const getBusinessMetrics = async (userId: string): Promise<BusinessMetrics> => {
  try {
    // Get total revenue from confirmed transactions
    const { data: revenueData, error: revenueError } = await supabase
      .from('transactions')
      .select('net_amount')
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    if (revenueError) throw revenueError;

    const totalRevenue = revenueData?.reduce((sum, tx) => sum + parseFloat(tx.net_amount), 0) || 0;

    // Get total transaction count
    const { count: totalTransactions, error: countError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (countError) throw countError;

    // Get success rate
    const { count: successfulTransactions, error: successError } = await supabase
      .from('transactions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'confirmed');

    if (successError) throw successError;

    const successRate = totalTransactions ? (successfulTransactions / totalTransactions) * 100 : 0;

    // Get active customers count
    const { count: activeCustomers, error: customersError } = await supabase
      .from('customers')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    if (customersError) throw customersError;

    return {
      totalRevenue,
      totalTransactions: totalTransactions || 0,
      successRate,
      activeCustomers: activeCustomers || 0,
      monthlyGrowth: 0 // TODO: Calculate based on previous month data
    };
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    throw error;
  }
};

/**
 * Create a new payment link
 */
export const createPaymentLink = async (
  userId: string,
  title: string,
  amount: number,
  currency: string = 'USDC'
): Promise<PaymentLink> => {
  try {
    const reference = Math.random().toString(36).substr(2, 9);
    const paymentUrl = `${window.location.origin}/pay/${reference}`;

    const { data, error } = await supabase
      .from('payment_requests')
      .insert({
        user_id: userId,
        reference,
        amount_usdc: amount,
        description: title,
        recipient_wallet: '', // Will be set from user's wallet
        payment_url: paymentUrl,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      title,
      amount,
      currency,
      url: paymentUrl,
      created_at: data.created_at,
      clicks: 0,
      conversions: 0
    };
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
};

/**
 * Get payment links for user
 */
export const getPaymentLinks = async (userId: string): Promise<PaymentLink[]> => {
  try {
    const { data, error } = await supabase
      .from('payment_requests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      title: item.description,
      amount: parseFloat(item.amount_usdc),
      currency: 'USDC',
      url: item.payment_url,
      created_at: item.created_at,
      clicks: 0, // TODO: Track clicks
      conversions: 0 // TODO: Calculate from transactions
    })) || [];
  } catch (error) {
    console.error('Error fetching payment links:', error);
    throw error;
  }
};

/**
 * Create a new invoice
 */
export const createInvoice = async (
  userId: string,
  invoiceData: {
    customerName: string;
    customerEmail: string;
    amount: number;
    currency: string;
    description: string;
    dueDate?: string;
    notes?: string;
  }
): Promise<Invoice> => {
  try {
    const reference = Math.random().toString(36).substr(2, 9);

    const { data, error } = await supabase
      .from('invoices')
      .insert({
        merchant_id: userId,
        reference,
        customer_name: invoiceData.customerName,
        customer_email: invoiceData.customerEmail,
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        description: invoiceData.description,
        total_amount: invoiceData.amount, // TODO: Add fees calculation
        due_date: invoiceData.dueDate,
        notes: invoiceData.notes,
        merchant_wallet: '' // Will be set from user's wallet
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      invoice_number: data.invoice_number,
      customer_name: data.customer_name,
      customer_email: data.customer_email,
      amount: parseFloat(data.amount),
      currency: data.currency,
      status: data.status,
      created_at: data.created_at,
      due_date: data.due_date,
      description: data.description
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Get invoices for user
 */
export const getInvoices = async (userId: string): Promise<Invoice[]> => {
  try {
    const { data, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('merchant_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(item => ({
      id: item.id,
      invoice_number: item.invoice_number,
      customer_name: item.customer_name,
      customer_email: item.customer_email,
      amount: parseFloat(item.amount),
      currency: item.currency,
      status: item.status,
      created_at: item.created_at,
      due_date: item.due_date,
      description: item.description
    })) || [];
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};
