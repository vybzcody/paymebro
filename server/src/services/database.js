import { createClient } from '@supabase/supabase-js';
import { SUPABASE_CONFIG } from '../config/index.js';

// Create Supabase client - will work with anon key for now but service key is recommended
const supabase = createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.serviceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

/**
 * Database service for managing AfriPay transactions and payments
 */
export class DatabaseService {
  constructor() {
    this.supabase = supabase;
  }

  /**
   * Create a payment request record
   */
  async createPaymentRequest(data) {
    const insertData = {
      user_id: (data.userId && data.userId !== 'anonymous' && data.userId !== 'test-user') ? data.userId : null,
      customer_id: data.customerId || null,
      invoice_id: data.invoiceId || null,
      reference: data.reference,
      amount_usdc: data.amount,
      currency: data.currency || 'USDC',
      description: data.description,
      recipient_wallet: data.recipientWallet,
      payment_url: data.paymentUrl,
      qr_code_url: data.qrCodeUrl,
      expires_at: data.expiresAt,
      success_url: data.successUrl,
      cancel_url: data.cancelUrl,
      webhook_url: data.webhookUrl,
      metadata: {
        customer_email: data.customerEmail,
        customer_name: data.customerName,
        merchant_name: data.merchantName,
        afripay_fee: data.afripayFee,
        original_amount: data.originalAmount,
        total_amount: data.totalAmount,
        ...data.metadata
      }
    };
    
    console.log('DEBUG: Insert data being sent to Supabase:');
    console.log(JSON.stringify(insertData, null, 2));
    console.log('DEBUG: user_id value:', insertData.user_id, 'type:', typeof insertData.user_id);
    
    const { data: paymentRequest, error } = await this.supabase
      .from('payment_requests')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Database error creating payment request:', error);
      throw new Error(`Failed to create payment request: ${error.message}`);
    }

    return paymentRequest;
  }

  /**
   * Get payment request by reference
   */
  async getPaymentRequest(reference) {
    const { data, error } = await this.supabase
      .from('payment_requests')
      .select('*')
      .eq('reference', reference)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      console.error('Database error getting payment request:', error);
      throw new Error(`Failed to get payment request: ${error.message}`);
    }

    return data;
  }

  /**
   * Create transaction record
   */
  async createTransaction(data) {
    const { data: transaction, error } = await this.supabase
      .from('transactions')
      .upsert({
        user_id: data.userId && data.userId !== 'anonymous' ? data.userId : null,
        payment_request_id: data.paymentRequestId,
        signature: data.signature,
        reference: data.reference,
        amount_usdc: data.amount,
        currency: data.currency || 'USDC',
        platform_fee: data.platformFee || 0,
        net_amount: data.netAmount,
        sender_wallet: data.senderWallet,
        recipient_wallet: data.recipientWallet,
        status: data.status || 'confirmed',
        block_time: data.blockTime,
        confirmation_count: data.confirmationCount || 1,
        description: data.description,
        metadata: {
          slot: data.slot,
          fee: data.fee,
          ...data.metadata
        }
      }, {
        onConflict: 'signature'
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }

    return transaction;
  }

  /**
   * Get user profile
   */
  async getUserProfile(userId) {
    const { data, error } = await this.supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Database error getting user profile:', error);
      throw new Error(`Failed to get user profile: ${error.message}`);
    }

    return data;
  }

  /**
   * Calculate platform fee using RPC function
   */
  async calculatePlatformFee(amountUsdc, userId) {
    const { data, error } = await this.supabase.rpc('calculate_platform_fee', {
      amount_usdc: amountUsdc,
      user_id: userId
    });

    if (error) {
      console.error('Database error calculating platform fee:', error);
      // Fallback to default calculation
      return amountUsdc * 0.029; // 2.9% default fee
    }

    return data || 0;
  }

  /**
   * Update payment request status
   */
  async updatePaymentRequest(reference, updates) {
    const { data, error } = await this.supabase
      .from('payment_requests')
      .update(updates)
      .eq('reference', reference)
      .select()
      .single();

    if (error) {
      console.error('Database error updating payment request:', error);
      throw new Error(`Failed to update payment request: ${error.message}`);
    }

    return data;
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(userId, limit = 10, offset = 0) {
    const { data, error } = await this.supabase
      .from('transactions')
      .select(`
        *,
        payment_requests (
          description,
          metadata
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Database error getting user transactions:', error);
      throw new Error(`Failed to get user transactions: ${error.message}`);
    }

    return data;
  }

  /**
   * Create or get customer
   */
  async createOrGetCustomer(userId, customerData) {
    // First try to get existing customer
    const { data: existingCustomer } = await this.supabase
      .from('customers')
      .select('*')
      .eq('user_id', userId)
      .eq('email', customerData.email)
      .single();

    if (existingCustomer) {
      return existingCustomer;
    }

    // Create new customer
    const { data: customer, error } = await this.supabase
      .from('customers')
      .insert({
        user_id: userId,
        email: customerData.email,
        name: customerData.name,
        phone: customerData.phone,
        metadata: customerData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating customer:', error);
      throw new Error(`Failed to create customer: ${error.message}`);
    }

    return customer;
  }

  /**
   * Log email communication
   */
  async logEmail(emailData) {
    const { data: emailLog, error } = await this.supabase
      .from('email_logs')
      .insert({
        user_id: emailData.userId,
        customer_id: emailData.customerId,
        payment_request_id: emailData.paymentRequestId,
        transaction_id: emailData.transactionId,
        invoice_id: emailData.invoiceId,
        email_type: emailData.emailType,
        recipient_email: emailData.recipientEmail,
        subject: emailData.subject,
        template_id: emailData.templateId,
        provider: emailData.provider || 'resend',
        metadata: emailData.metadata || {}
      })
      .select()
      .single();

    if (error) {
      console.error('Database error logging email:', error);
      throw new Error(`Failed to log email: ${error.message}`);
    }

    return emailLog;
  }

  /**
   * Update email status
   */
  async updateEmailStatus(emailId, status, additionalData = {}) {
    const updates = {
      status,
      updated_at: new Date().toISOString(),
      ...additionalData
    };

    const { data, error } = await this.supabase
      .from('email_logs')
      .update(updates)
      .eq('id', emailId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating email status:', error);
      throw new Error(`Failed to update email status: ${error.message}`);
    }

    return data;
  }

  /**
   * Create webhook event
   */
  async createWebhookEvent(eventData) {
    const { data: webhookEvent, error } = await this.supabase
      .from('webhook_events')
      .insert({
        user_id: eventData.userId,
        payment_request_id: eventData.paymentRequestId,
        transaction_id: eventData.transactionId,
        event_type: eventData.eventType,
        webhook_url: eventData.webhookUrl,
        payload: eventData.payload,
        max_attempts: eventData.maxAttempts || 3
      })
      .select()
      .single();

    if (error) {
      console.error('Database error creating webhook event:', error);
      throw new Error(`Failed to create webhook event: ${error.message}`);
    }

    return webhookEvent;
  }

  /**
   * Get pending webhook events
   */
  async getPendingWebhookEvents(limit = 10) {
    const { data, error } = await this.supabase
      .from('webhook_events')
      .select('*')
      .in('status', ['pending', 'retry'])
      .lte('next_retry_at', new Date().toISOString())
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) {
      console.error('Database error getting pending webhook events:', error);
      throw new Error(`Failed to get pending webhook events: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Update webhook event status
   */
  async updateWebhookEvent(eventId, updates) {
    const { data, error } = await this.supabase
      .from('webhook_events')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', eventId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating webhook event:', error);
      throw new Error(`Failed to update webhook event: ${error.message}`);
    }

    return data;
  }

  /**
   * Get payment analytics
   */
  async getPaymentAnalytics(userId, days = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const { data, error } = await this.supabase
      .from('transactions')
      .select('amount_usdc, currency, status, created_at')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Database error getting payment analytics:', error);
      throw new Error(`Failed to get payment analytics: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Health check
   */
  async healthCheck() {
    try {
      // Try a simple query that should work with anon key
      const { error } = await this.supabase
        .from('payment_requests')
        .select('id')
        .limit(1);

      if (error) {
        console.log('Database health check error (this is normal with anon key):', error.message);
        // Return true if it's just a permissions error, false if connection failed
        return !error.message.includes('connection') && !error.message.includes('timeout');
      }
      
      return true;
    } catch (error) {
      console.error('Database health check failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const databaseService = new DatabaseService();
