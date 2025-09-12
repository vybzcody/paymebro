import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { useCallback } from "react";
import { analyticsApi } from "@/lib/api/analytics";
import { useApiCache } from "@/hooks/use-api-cache";
export function MetricsCards({ userId }) {
    const fetchMetrics = useCallback(async () => {
        if (!userId || userId === "unknown") {
            return {
                totalPayments: 0,
                totalRevenue: 0,
                conversionRate: '0',
                totalUsers: 0
            };
        }
        try {
            return await analyticsApi.getMetrics(userId);
        }
        catch (error) {
            console.error('Failed to fetch metrics:', error);
            // Return default metrics on error
            return {
                totalPayments: 0,
                totalRevenue: 0,
                conversionRate: '0',
                totalUsers: 0
            };
        }
    }, [userId]);
    const { data: metrics, loading: isLoading } = useApiCache(`metrics-${userId}`, fetchMetrics, [userId], { cacheTime: 2 * 60 * 1000, staleTime: 30 * 1000 } // Cache for 2 minutes, stale after 30 seconds
    );
    const metricCards = [
        {
            title: "Total Payments",
            value: (metrics?.totalPayments ?? 0).toString() || "0",
            change: (metrics?.totalPayments ?? 0) > 0 ? "+12%" : "Start creating payments",
            icon: CreditCard,
            iconClass: "text-green-600",
            bgClass: "bg-green-100",
        },
        {
            title: "Total Revenue",
            value: `${(metrics?.totalRevenue ?? 0).toFixed(2)}`,
            change: (metrics?.totalRevenue ?? 0) > 0 ? "+8%" : "Revenue will appear here",
            icon: DollarSign,
            iconClass: "text-blue-600",
            bgClass: "bg-blue-100",
        },
        {
            title: "Success Rate",
            value: `${metrics?.conversionRate ?? "0"}%`,
            change: (metrics?.totalPayments ?? 0) > 0 ? "+5%" : "Track payment success",
            icon: TrendingUp,
            iconClass: "text-purple-600",
            bgClass: "bg-purple-100",
        },
        {
            title: "Plan Usage",
            value: `${metrics?.planUsage?.current ?? 0}/${metrics?.planUsage?.limit ?? 100}`,
            change: `${(metrics?.planUsage?.limit ?? 100) - (metrics?.planUsage?.current ?? 0)} payments left`,
            icon: Users,
            iconClass: "text-orange-600",
            bgClass: "bg-orange-100",
        },
    ];
    if (isLoading) {
        return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: [...Array(4)].map((_, i) => (_jsxs(Card, { className: "p-6 animate-pulse", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { className: "space-y-2", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-24" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-16" })] }), _jsx("div", { className: "h-12 w-12 bg-gray-200 rounded-lg" })] }), _jsx("div", { className: "mt-4", children: _jsx("div", { className: "h-4 bg-gray-200 rounded w-20" }) })] }, i))) }));
    }
    return (_jsx("div", { className: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6", children: metricCards.map((metric) => {
            const Icon = metric.icon;
            return (_jsxs(Card, { className: "p-6 hover:shadow-lg transition-shadow", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx("p", { className: "text-sm font-medium text-muted-foreground", children: metric.title }), _jsx("p", { className: "text-2xl font-bold text-foreground", children: metric.value })] }), _jsx("div", { className: `p-3 ${metric.bgClass} rounded-lg`, children: _jsx(Icon, { className: `h-5 w-5 ${metric.iconClass}` }) })] }), _jsxs("div", { className: "mt-4 flex items-center text-sm", children: [_jsx("span", { className: "text-green-600 font-medium", children: metric.change }), _jsx("span", { className: "text-muted-foreground ml-1", children: "from last month" })] })] }, metric.title));
        }) }));
}
