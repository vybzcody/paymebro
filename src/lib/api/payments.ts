import { appConfig, getApiHeaders } from '@/lib/config';

export interface CreatePaymentRequest {
  amount: number;
  label: string;
  message?: string;
  customerEmail?: string;
  web3AuthUserId: string;
  chain?: string;
  splToken?: string;
}

export interface PaymentResponse {
  success: boolean;
  reference: string;
  url: string;
  paymentUrl: string;
  qrCode: string;
}

export interface PaymentStatus {
  reference: string;
  status: 'pending' | 'confirmed' | 'failed';
  amount: number;
  signature?: string;
  timestamp: string;
}

export const paymentsApi = {
  async createPayment(paymentData: CreatePaymentRequest): Promise<PaymentResponse> {
    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/create`, {
      method: 'POST',
      headers: getApiHeaders(paymentData.web3AuthUserId),
      body: JSON.stringify({
        ...paymentData,
        chain: paymentData.chain || 'solana',
        splToken: paymentData.splToken || 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr', // USDC devnet
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to create payment`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create payment');
    }

    return result;
  },

  async getPaymentStatus(reference: string): Promise<PaymentStatus> {
    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/${reference}/status`);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to get payment status`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to get payment status');
    }

    return result.data;
  },

  async confirmPayment(signature: string, reference: string): Promise<boolean> {
    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/confirm`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ signature, reference }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to confirm payment`);
    }

    const result = await response.json();
    return result.success;
  },
};
