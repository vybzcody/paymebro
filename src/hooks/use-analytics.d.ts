export declare const useAnalytics: (userId: string) => {
    metrics: import("@/lib/api/analytics").AnalyticsMetrics;
    isLoadingMetrics: boolean;
    metricsError: Error;
    history: import("@/lib/api/analytics").PaymentHistory[];
    isLoadingHistory: boolean;
    historyError: Error;
    refetch: () => void;
};
//# sourceMappingURL=use-analytics.d.ts.map