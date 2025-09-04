/**
 * Core Payment Processor - End-to-end payment flow management
 * Handles payment initiation, monitoring, confirmation, and database storage
 */

import { PublicKey } from '@solana/web3.js';
import { solanaPayService } from './solanaPayService';
import { createClient } from '@supabase/supabase-js';
import BigNumber from 'bignumber.js';

// Use service role key to bypass RLS for payment creation
const supabaseService = createClient(
  import.meta.env.VITE_SUPABASE_URL!,
  import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

export interface PaymentInitiationParams {
  userId: string;
  merchantWallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  description: string;
  title: string;
  customerEmail?: string;
}

export interface PaymentRecord {
  id: string;
  user_id: string;
  reference: string;
  signature?: string;
  amount: number;
  currency: string;
  status: 'pending' | 'confirmed' | 'failed' | 'expired';
  recipient_wallet: string;
  total_amount_paid: number;
  merchant_amount: number;
  fee_amount: number;
  description?: string;
  created_at: string;
  confirmed_at?: string;
}

/**
 * Core Payment Processor Class
 */
export class PaymentProcessor {
  /**
   * Initiate a new payment and store in database
   */
  async initiatePayment(params: PaymentInitiationParams): Promise<{
    paymentId: string;
    paymentUrl: string;
    qrCodeUrl: string;
    reference: string;
    feeBreakdown: any;
  }> {
    try {
      console.log('Using backend API for payment creation:', params);

      // Use backend API instead of direct Supabase
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/payment/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: params.amount,
          currency: params.currency,
          description: params.description,
          merchantWallet: params.merchantWallet,
          userId: params.userId || '2c45b0ab-f5e3-4de1-87e2-1d46ba8865ba',
          title: params.title
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create payment');
      }

      const result = await response.json();
      
      return {
        paymentId: result.payment.id,
        paymentUrl: result.paymentUrl,
        qrCodeUrl: result.qrCodeUrl,
        reference: result.reference,
        feeBreakdown: result.feeBreakdown
      };

    } catch (error) {
      console.error('Payment initiation failed:', error);
      throw new Error(`Payment initiation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

      if (linkError) {
        console.warn('Failed to create payment link:', linkError);
      }

      // return {
      //   paymentId: data.id,
      //   paymentUrl: paymentResult.paymentUrl,
      //   qrCodeUrl: paymentResult.qrCodeUrl,
      //   reference: paymentResult.reference.toString(),
      //   feeBreakdown: paymentResult.feeBreakdown,
      // };
    // } catch (error) {
    //   const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    //   console.error('Payment initiation failed:', errorMessage);
    //   throw new Error(`Failed to initiate payment: ${errorMessage}`);
    // }
  }

  /**
   * Monitor payment status and update database when confirmed
   */
  async monitorPayment(paymentId: string): Promise<{
    status: 'confirmed' | 'failed' | 'timeout';
    signature?: string;
  }> {
    try {
      // Get payment record
      const { data: payment, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Failed to fetch payment:', error);
        throw new Error(`Payment not found: ${error.message}`);
      }

      if (!payment) {
        throw new Error('Payment not found');
      }

      const reference = new PublicKey(payment.reference);
      const recipient = new PublicKey(payment.recipient_wallet);

      // Monitor for transaction confirmation
      const result = await solanaPayService.monitorPayment(
        reference,
        {
          recipient,
          amount: new BigNumber(payment.total_amount_paid),
          splToken: payment.currency === 'USDC' ? solanaPayService.getUSDCMint() : undefined,
        },
        { timeout: 300000, interval: 2000 }
      );

      // Update payment status in database
      if (result.status === 'confirmed' && result.signature) {
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'confirmed',
            signature: result.signature,
            confirmed_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (updateError) {
          console.error('Failed to update payment status:', updateError);
        }
      } else if (result.status === 'failed') {
        await supabase
          .from('payments')
          .update({ status: 'failed' })
          .eq('id', paymentId);
      } else if (result.status === 'timeout') {
        await supabase
          .from('payments')
          .update({ status: 'expired' })
          .eq('id', paymentId);
      }

      return {
        status: result.status,
        signature: result.signature,
      };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Payment monitoring failed:', errorMessage);
      throw new Error(`Failed to monitor payment: ${errorMessage}`);
    }
  }

  /**
   * Get payment status from database
   */
  async getPaymentStatus(paymentId: string): Promise<PaymentRecord | null> {
    try {
      const { data, error } = await supabase
        .from('payments')
        .select('*')
        .eq('id', paymentId)
        .single();

      if (error) {
        console.error('Failed to fetch payment status:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Failed to get payment status:', error);
      return null;
    }
  }

  /**
   * Validate payment initiation parameters
   */
  private validatePaymentParams(params: PaymentInitiationParams): void {
    if (!params.userId) {
      throw new Error('User ID is required');
    }

    if (!params.merchantWallet) {
      throw new Error('Merchant wallet address is required');
    }

    if (!params.amount || params.amount <= 0) {
      throw new Error('Amount must be greater than 0');
    }

    if (!['SOL', 'USDC'].includes(params.currency)) {
      throw new Error('Currency must be SOL or USDC');
    }

    if (!params.title || params.title.trim().length === 0) {
      throw new Error('Payment title is required');
    }

    if (!params.description || params.description.trim().length === 0) {
      throw new Error('Payment description is required');
    }
  }
}

// Export singleton instance
export const paymentProcessor = new PaymentProcessor();
