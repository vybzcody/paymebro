import { appConfig, getApiHeaders } from '@/lib/config';

export interface SubscriptionPlan {
  id: string;
  name: string;
  amount: string;
  currency: string;
  interval_type: 'monthly' | 'yearly';
  interval_count: number;
  description?: string;
  created_at: string;
}

export interface CreatePlanRequest {
  name: string;
  amount: string;
  currency: string;
  interval_type: 'monthly' | 'yearly';
  interval_count: number;
  description?: string;
}

export interface Subscription {
  id: string;
  plan_id: string;
  customer_email: string;
  wallet_address: string;
  status: 'active' | 'cancelled' | 'expired';
  created_at: string;
  next_billing_date?: string;
}

export const subscriptionsApi = {
  async createPlan(planData: CreatePlanRequest, userId: string): Promise<SubscriptionPlan> {
    const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans`, {
      method: 'POST',
      headers: getApiHeaders(userId),
      body: JSON.stringify(planData),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to create plan`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to create plan');
    }

    return result.plan;
  },

  async getPlans(userId: string): Promise<SubscriptionPlan[]> {
    const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans`, {
      headers: getApiHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch plans`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch plans');
    }

    return result.plans || [];
  },

  async subscribe(planId: string, customerEmail: string, walletAddress: string, userId: string): Promise<Subscription> {
    const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/subscribe`, {
      method: 'POST',
      headers: getApiHeaders(userId),
      body: JSON.stringify({
        plan_id: planId,
        customer_email: customerEmail,
        wallet_address: walletAddress,
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to subscribe`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to subscribe');
    }

    return result.subscription;
  },

  async getAnalytics(userId: string): Promise<any> {
    const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/analytics`, {
      headers: getApiHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to fetch analytics`);
    }

    const result = await response.json();
    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch analytics');
    }

    return result.analytics;
  },

  async cancelSubscription(subscriptionId: string, userId: string): Promise<boolean> {
    const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/${subscriptionId}`, {
      method: 'DELETE',
      headers: getApiHeaders(userId),
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: Failed to cancel subscription`);
    }

    const result = await response.json();
    return result.success;
  },
};
