import { appConfig, getApiHeaders } from '@/lib/config';

export interface AnalyticsMetrics {
  totalPayments: number;
  totalRevenue: number;
  conversionRate: string;
  totalUsers: number;
}

export interface PaymentHistory {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'completed' | 'pending' | 'failed' | 'confirmed';
  timestamp: string;
  created_at: string;
  description?: string;
  label?: string;
}

export const analyticsApi = {
  async getMetrics(userId: string): Promise<AnalyticsMetrics> {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/analytics`, {
        headers: getApiHeaders(userId),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch metrics`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      const metrics = result.metrics || {};
      return {
        totalPayments: metrics.totalPayments || 0,
        totalRevenue: metrics.totalRevenue || 0,
        conversionRate: metrics.conversionRate || '0',
        totalUsers: 1
      };
    } catch (error) {
      console.error('Analytics API error:', error);
      return {
        totalPayments: 0,
        totalRevenue: 0,
        conversionRate: '0',
        totalUsers: 0
      };
    }
  },

  async getPaymentHistory(userId: string, page = 1, limit = 10): Promise<PaymentHistory[]> {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/analytics/history?page=${page}&limit=${limit}`, {
        headers: getApiHeaders(userId),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch payment history`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment history');
      }

      const payments = result.payments || [];
      return payments.map((payment: any) => ({
        id: payment.id || payment.reference,
        reference: payment.reference,
        amount: parseFloat(payment.amount || 0),
        currency: payment.currency || 'USDC',
        status: payment.status === 'confirmed' ? 'completed' : payment.status,
        timestamp: payment.created_at,
        created_at: payment.created_at,
        description: payment.label || payment.message || 'Payment',
        label: payment.label
      }));
    } catch (error) {
      console.error('Payment history API error:', error);
      return [];
    }
  },
};
