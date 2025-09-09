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
export declare const analyticsApi: {
    getMetrics(userId: string): Promise<AnalyticsMetrics>;
    getPaymentHistory(userId: string, page?: number, limit?: number): Promise<PaymentHistory[]>;
};
//# sourceMappingURL=analytics.d.ts.map