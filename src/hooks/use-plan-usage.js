import { useCallback } from 'react';
import { plansApi } from '@/lib/api/plans';
import { useApiCache } from './use-api-cache';
/**
 * Custom hook for fetching and caching plan usage data
 */
export function usePlanUsage(userId) {
    const fetchPlanUsage = useCallback(async () => {
        if (!userId || userId === "unknown") {
            return {
                currentPlan: 'free',
                monthlyUsage: 0,
                monthlyLimit: 10,
                percentage: 0,
                canCreatePayment: true,
                remaining: 10
            };
        }
        return await plansApi.getPlanUsage(userId);
    }, [userId]);
    return useApiCache(`plan-usage-${userId}`, fetchPlanUsage, [userId], { cacheTime: 5 * 60 * 1000, staleTime: 60 * 1000 } // Cache for 5 minutes, stale after 1 minute
    );
}
