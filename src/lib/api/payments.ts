import { appConfig, getApiHeaders } from '@/lib/config';

export interface CreatePaymentRequest {
  amount: number;
  label: string;
  message?: string;
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
    console.log('🚀 Creating payment with data:', {
      ...paymentData,
      customerEmail: paymentData.customerEmail || 'none'
    });

    const requestBody = {
      ...paymentData,
      chain: paymentData.chain || 'solana',
      // Only include splToken if currency is USDC
      ...(paymentData.splToken && {
        splToken: paymentData.splToken
      }),
      // Remove empty customerEmail to avoid validation error
      ...(paymentData.customerEmail && paymentData.customerEmail.trim() && {
        customerEmail: paymentData.customerEmail.trim()
      })
    };

    console.log('📤 Request body:', requestBody);

    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/create`, {
      method: 'POST',
      headers: getApiHeaders(paymentData.web3AuthUserId),
      body: JSON.stringify(requestBody),
    });

    console.log('📥 Response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Payment creation failed:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      throw new Error(`HTTP ${response.status}: Failed to create payment`);
    }

    const result = await response.json();
    console.log('✅ Payment created successfully:', result);

    if (!result.success) {
      console.error('❌ Backend returned error:', result.error);
      throw new Error(result.error || 'Failed to create payment');
    }

    return result;
  },

  async getPaymentStatus(reference: string): Promise<PaymentStatus> {
    console.log('🔍 Getting payment status for:', reference);

    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/${reference}/status`);

    if (!response.ok) {
      console.error('❌ Failed to get payment status:', response.status);
      throw new Error(`HTTP ${response.status}: Failed to get payment status`);
    }

    const result = await response.json();
    console.log('📊 Payment status:', result);

    if (!result.success) {
      throw new Error(result.error || 'Failed to get payment status');
    }

    return result.data;
  },

  async confirmPayment(signature: string, reference: string): Promise<boolean> {
    console.log('✅ Confirming payment:', { signature, reference });

    const response = await fetch(`${appConfig.apiUrl}${appConfig.endpoints.payments}/confirm`, {
      method: 'POST',
      headers: getApiHeaders(),
      body: JSON.stringify({ signature, reference }),
    });

    if (!response.ok) {
      console.error('❌ Failed to confirm payment:', response.status);
      throw new Error(`HTTP ${response.status}: Failed to confirm payment`);
    }

    const result = await response.json();
    console.log('✅ Payment confirmation result:', result);
    return result.success;
  },
};
