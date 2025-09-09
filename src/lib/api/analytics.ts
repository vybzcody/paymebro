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
      // Use merchant analytics endpoint for user-specific data
      const response = await fetch(`${appConfig.apiUrl}/api/analytics/overview`, {
        headers: getApiHeaders(userId),
      });

      if (!response.ok) {
        // Fallback to general metrics if overview fails
        const fallbackResponse = await fetch(`${appConfig.apiUrl}/api/analytics`, {
          headers: getApiHeaders(userId),
        });
        
        if (!fallbackResponse.ok) {
          throw new Error(`HTTP ${fallbackResponse.status}: Failed to fetch metrics`);
        }

        const fallbackResult = await fallbackResponse.json();
        if (!fallbackResult.success) {
          throw new Error(fallbackResult.error || 'Failed to fetch metrics');
        }

        const metrics = fallbackResult.metrics || {};
        return {
          totalPayments: metrics.totalPayments || 0,
          totalRevenue: metrics.totalRevenue || 0,
          conversionRate: metrics.conversionRate || '0',
          totalUsers: metrics.totalUsers || 0
        };
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      const analytics = result.analytics || {};
      return {
        totalPayments: analytics.totalPayments || 0,
        totalRevenue: analytics.totalRevenue || 0,
        conversionRate: analytics.conversionRate || '0',
        totalUsers: 1 // Current user
      };
    } catch (error) {
      console.error('Analytics API error:', error);
      // Return default metrics on error
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
      const response = await fetch(
        `${appConfig.apiUrl}/api/analytics/history?page=${page}&limit=${limit}`,
        {
          headers: getApiHeaders(userId),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch payment history`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch payment history');
      }

      // Filter payments by user ID and transform data
      const allPayments = result.payments || [];
      return allPayments
        .filter((payment: any) => payment.web3auth_user_id === userId)
        .map((payment: any) => ({
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
