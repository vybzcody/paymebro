import { PublicKey } from '@solana/web3.js';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface CreatePaymentRequest {
  userId: string;
  amount: number;
  description: string;
  recipientWallet: string;
  currency?: 'SOL' | 'USDC';
  customerEmail?: string;
  customerName?: string;
  merchantName?: string;
  memo?: string;
}

export interface PaymentRequestResponse {
  paymentRequest: {
    id: string;
    reference: string;
    paymentUrl: string;
    qrCodeUrl: string;
    expiresAt: string;
  };
  feeBreakdown: {
    originalAmount: number;
    afripayFee: number;
    merchantReceives: number;
    total: number;
  };
  transactionDetails: {
    originalAmount: number;
    afripayFee: number;
    totalCustomerPays: number;
    merchantReceives: number;
    currency: string;
  };
}

export interface PaymentStatusResponse {
  status: 'pending' | 'confirmed' | 'failed';
  confirmed: boolean;
  signature?: string;
  slot?: number;
  blockTime?: number;
  paymentRequest?: {
    id: string;
    description: string;
    amount: number;
    currency: string;
  };
}

export interface TransactionVerificationResponse {
  success: boolean;
  transaction: any;
  platformFee: number;
  netAmount: number;
}

/**
 * AfriPay API service for communicating with the backend
 */
export class AfriPayAPI {
  /**
   * Test backend connectivity
   */
  static async healthCheck(): Promise<{ status: string; services: any }> {
    try {
      const response = await fetch(`${API_BASE_URL}/health`);
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Backend health check failed:', error);
      throw new Error('Backend is not available. Please ensure the server is running on port 3001.');
    }
  }

  /**
   * Create a new payment request using AfriPay backend
   */
  static async createPaymentRequest(data: CreatePaymentRequest): Promise<PaymentRequestResponse> {
    try {
      console.log('Creating payment request with backend:', data);
      
      const response = await fetch(`${API_BASE_URL}/api/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Request failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      const result = await response.json();
      console.log('Payment request created successfully:', result);
      return result;
    } catch (error: any) {
      console.error('Failed to create payment request:', error);
      throw new Error(`Payment request creation failed: ${error.message}`);
    }
  }

  /**
   * Get payment request details by reference
   */
  static async getPaymentRequest(reference: string): Promise<any> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create/${reference}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          return null;
        }
        throw new Error(`Failed to get payment request: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to get payment request:', error);
      throw new Error(`Get payment request failed: ${error.message}`);
    }
  }

  /**
   * Check payment status by reference
   */
  static async checkPaymentStatus(reference: string): Promise<PaymentStatusResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/status/${reference}`);
      
      if (!response.ok) {
        throw new Error(`Status check failed: ${response.statusText}`);
      }

      const result = await response.json();
      return result;
    } catch (error: any) {
      console.error('Failed to check payment status:', error);
      throw new Error(`Payment status check failed: ${error.message}`);
    }
  }

  /**
   * Verify a completed payment transaction
   */
  static async verifyPayment(signature: string, reference: string): Promise<TransactionVerificationResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/payment/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ signature, reference }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Verification failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to verify payment:', error);
      throw new Error(`Payment verification failed: ${error.message}`);
    }
  }

  /**
   * Cancel a payment request
   */
  static async cancelPaymentRequest(reference: string): Promise<{ success: boolean; message: string }> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/create/${reference}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Cancellation failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to cancel payment request:', error);
      throw new Error(`Payment cancellation failed: ${error.message}`);
    }
  }

  /**
   * Get Solana Pay payment metadata (for wallet display)
   */
  static async getPaymentMetadata(params: {
    label: string;
    recipient?: string;
    amount?: number;
  }): Promise<{ label: string; icon: string; recipient?: string; amount?: number }> {
    try {
      const queryParams = new URLSearchParams({
        label: params.label,
        ...(params.recipient && { recipient: params.recipient }),
        ...(params.amount && { amount: params.amount.toString() }),
      });

      const response = await fetch(`${API_BASE_URL}/api/payment?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`Metadata request failed: ${response.statusText}`);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to get payment metadata:', error);
      throw new Error(`Payment metadata request failed: ${error.message}`);
    }
  }

  /**
   * Create a Solana Pay transaction (for wallet signing)
   */
  static async createTransaction(params: {
    recipient: string;
    amount: number;
    reference: string;
    account: string;
    splToken?: string;
    memo?: string;
    message?: string;
  }): Promise<{ transaction: string; message?: string }> {
    try {
      const queryParams = new URLSearchParams({
        recipient: params.recipient,
        amount: params.amount.toString(),
        reference: params.reference,
        ...(params.splToken && { 'spl-token': params.splToken }),
        ...(params.memo && { memo: params.memo }),
        ...(params.message && { message: params.message }),
      });

      const response = await fetch(`${API_BASE_URL}/api/payment?${queryParams}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          account: params.account,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        const errorMessage = errorData?.message || errorData?.error || `Transaction creation failed: ${response.statusText}`;
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      console.error('Failed to create transaction:', error);
      throw new Error(`Transaction creation failed: ${error.message}`);
    }
  }
}

/**
 * Utility functions for working with payment data
 */
export class PaymentUtils {
  /**
   * Format payment amount for display
   */
  static formatAmount(amount: number, currency: string = 'USDC', decimals: number = 2): string {
    return `${amount.toFixed(decimals)} ${currency}`;
  }

  /**
   * Create a payment URL for QR codes and deep linking
   */
  static createPaymentUrl(paymentRequest: PaymentRequestResponse['paymentRequest']): string {
    return paymentRequest.paymentUrl;
  }

  /**
   * Parse reference from payment URL or create PublicKey
   */
  static parseReference(reference: string): PublicKey {
    try {
      return new PublicKey(reference);
    } catch (error) {
      throw new Error(`Invalid payment reference: ${reference}`);
    }
  }

  /**
   * Calculate total customer payment including fees
   */
  static calculateCustomerTotal(
    originalAmount: number,
    feeRate: number = 0.029, // 2.9%
    fixedFee: number = 0.30 // $0.30
  ): { originalAmount: number; fee: number; total: number } {
    const percentageFee = originalAmount * feeRate;
    const totalFee = percentageFee + fixedFee;
    const total = originalAmount + totalFee;

    return {
      originalAmount,
      fee: totalFee,
      total,
    };
  }

  /**
   * Check if payment has expired
   */
  static isPaymentExpired(expiresAt: string): boolean {
    return new Date() > new Date(expiresAt);
  }

  /**
   * Get time until payment expires
   */
  static getTimeUntilExpiry(expiresAt: string): {
    expired: boolean;
    timeRemaining?: number;
    timeString?: string;
  } {
    const now = new Date().getTime();
    const expires = new Date(expiresAt).getTime();
    const timeRemaining = expires - now;

    if (timeRemaining <= 0) {
      return { expired: true };
    }

    const hours = Math.floor(timeRemaining / (1000 * 60 * 60));
    const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

    let timeString = '';
    if (hours > 0) {
      timeString = `${hours}h ${minutes}m`;
    } else {
      timeString = `${minutes}m`;
    }

    return {
      expired: false,
      timeRemaining,
      timeString,
    };
  }
}
