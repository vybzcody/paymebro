import { Card } from "@/components/ui/card";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { useEffect, useState } from "react";
import { analyticsApi, type AnalyticsMetrics } from "@/lib/api/analytics";

interface MetricsCardsProps {
  userId: string;
}

export function MetricsCards({ userId }: MetricsCardsProps) {
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const data = await analyticsApi.getMetrics(userId);
        setMetrics(data);
      } catch (error) {
        console.error('Failed to fetch metrics:', error);
        // Use default metrics on error
        setMetrics({
          totalPayments: 0,
          totalRevenue: 0,
          conversionRate: '0',
          totalUsers: 0
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchMetrics();
    }
  }, [userId]);

  const metricCards = [
    {
      title: "Total Payments",
      value: metrics?.totalPayments.toString() || "0",
      change: "+12%",
      icon: CreditCard,
      iconClass: "text-green-600",
      bgClass: "bg-green-100",
    },
    {
      title: "Total Revenue",
      value: `$${metrics?.totalRevenue.toFixed(2) || "0.00"}`,
      change: "+8%",
      icon: DollarSign,
      iconClass: "text-blue-600",
      bgClass: "bg-blue-100",
    },
    {
      title: "Success Rate",
      value: `${metrics?.conversionRate || "0"}%`,
      change: "+5%",
      icon: TrendingUp,
      iconClass: "text-purple-600",
      bgClass: "bg-purple-100",
    },
    {
      title: "Active Users",
      value: metrics?.totalUsers.toString() || "0",
      change: "+3",
      icon: Users,
      iconClass: "text-orange-600",
      bgClass: "bg-orange-100",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6 animate-pulse">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-24"></div>
                <div className="h-8 bg-gray-200 rounded w-16"></div>
              </div>
              <div className="h-12 w-12 bg-gray-200 rounded-lg"></div>
            </div>
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-20"></div>
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metricCards.map((metric) => {
        const Icon = metric.icon;
        return (
          <Card key={metric.title} className="p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground">
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 ${metric.bgClass} rounded-lg`}>
                <Icon className={`h-5 w-5 ${metric.iconClass}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600 font-medium">{metric.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
