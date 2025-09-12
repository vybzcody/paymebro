import { appConfig, getApiHeaders } from '@/lib/config';

export interface PlanUsage {
  currentPlan: string;
  monthlyUsage: number;
  monthlyLimit: number | 'unlimited';
  percentage: number;
  canCreatePayment: boolean;
  remaining: number | 'unlimited';
}

export interface PlanInfo {
  name: string;
  monthlyLimit: number | 'unlimited';
  price: number | 'custom';
  features: string[];
}

export interface PlansInfo {
  free: PlanInfo;
  basic: PlanInfo;
  premium: PlanInfo;
  enterprise: PlanInfo;
}

export const plansApi = {
  async getPlanUsage(userId: string): Promise<PlanUsage> {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/plans/usage`, {
        headers: getApiHeaders(userId),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch plan usage`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan usage');
      }

      return result.usage;
    } catch (error) {
      console.error('Plans API error:', error);
      // Return default usage on error
      return {
        currentPlan: 'free',
        monthlyUsage: 0,
        monthlyLimit: 10,
        percentage: 0,
        canCreatePayment: true,
        remaining: 10
      };
    }
  },

  async getPlanInfo(): Promise<PlansInfo> {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/plans/info`);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch plan info`);
      }

      const result = await response.json();
      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch plan info');
      }

      return result.plans;
    } catch (error) {
      console.error('Plan info API error:', error);
      // Return default plans on error
      return {
        free: { name: 'Free', monthlyLimit: 10, price: 0, features: ['10 payments/month'] },
        basic: { name: 'Basic', monthlyLimit: 100, price: 29, features: ['100 payments/month'] },
        premium: { name: 'Premium', monthlyLimit: 1000, price: 99, features: ['1,000 payments/month'] },
        enterprise: { name: 'Enterprise', monthlyLimit: 'unlimited', price: 'custom', features: ['Unlimited payments'] }
      };
    }
  },

  async upgradePlan(userId: string, planType: string): Promise<boolean> {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/plans/upgrade`, {
        method: 'POST',
        headers: getApiHeaders(userId),
        body: JSON.stringify({ planType }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to upgrade plan`);
      }

      const result = await response.json();
      return result.success;
    } catch (error) {
      console.error('Plan upgrade API error:', error);
      return false;
    }
  },
};