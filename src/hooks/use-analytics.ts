import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '@/lib/api/analytics';

export const useAnalytics = (userId: string) => {
  const metricsQuery = useQuery({
    queryKey: ['analytics', 'metrics', userId],
    queryFn: () => analyticsApi.getMetrics(userId),
    enabled: !!userId,
  });

  const historyQuery = useQuery({
    queryKey: ['analytics', 'history', userId],
    queryFn: () => analyticsApi.getPaymentHistory(userId),
    enabled: !!userId,
  });

  return {
    metrics: metricsQuery.data,
    isLoadingMetrics: metricsQuery.isLoading,
    metricsError: metricsQuery.error,
    
    history: historyQuery.data,
    isLoadingHistory: historyQuery.isLoading,
    historyError: historyQuery.error,
    
    refetch: () => {
      metricsQuery.refetch();
      historyQuery.refetch();
    },
  };
};
