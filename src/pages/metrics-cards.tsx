import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { CreditCard, DollarSign, TrendingUp, Users } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

interface MetricsCardsProps {
  userId: string;
}

export function MetricsCards({ userId }: MetricsCardsProps) {
  const { metrics, isLoadingMetrics } = useAnalytics(userId);

  // Default metrics for when no data is available
  const defaultMetrics = {
    totalPayments: 0,
    totalRevenue: 0,
    conversionRate: "0",
    totalUsers: 0
  };

  const displayMetrics = metrics || defaultMetrics;

  const metricCards = [
    {
      title: "Total Payments",
      value: displayMetrics.totalPayments.toString(),
      change: "+12%",
      icon: CreditCard,
      iconClass: "text-primary",
      bgClass: "bg-primary/10",
      testId: "metric-total-payments"
    },
    {
      title: "Total Revenue",
      value: `$${displayMetrics.totalRevenue.toFixed(2)}`,
      change: "+8%",
      icon: DollarSign,
      iconClass: "text-secondary",
      bgClass: "bg-secondary/10",
      testId: "metric-total-revenue"
    },
    {
      title: "Success Rate",
      value: `${displayMetrics.conversionRate}%`,
      change: "+5%",
      icon: TrendingUp,
      iconClass: "text-accent",
      bgClass: "bg-accent/10",
      testId: "metric-success-rate"
    },
    {
      title: "Active Users",
      value: displayMetrics.totalUsers.toString(),
      change: "+3",
      icon: Users,
      iconClass: "text-purple-500",
      bgClass: "bg-purple-500/10",
      testId: "metric-active-users"
    },
  ];

  if (isLoadingMetrics) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-8 w-16" />
              </div>
              <Skeleton className="h-12 w-12 rounded-lg" />
            </div>
            <div className="mt-4">
              <Skeleton className="h-4 w-20" />
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
          <Card key={metric.title} className="p-6 hover-scale" data-testid={metric.testId}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">
                  {metric.title}
                </p>
                <p className="text-2xl font-bold text-foreground" data-testid={`${metric.testId}-value`}>
                  {metric.value}
                </p>
              </div>
              <div className={`p-3 ${metric.bgClass} rounded-lg`}>
                <Icon className={`h-5 w-5 ${metric.iconClass}`} />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-secondary font-medium">{metric.change}</span>
              <span className="text-muted-foreground ml-1">from last month</span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
