import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { useRealtimeAnalytics } from '@/hooks/useRealtimeAnalytics';

export const PaymentWidgets = () => {
  const { metrics, loading } = useRealtimeAnalytics({
    dateRange: 'today',
    currency: 'all',
    status: 'all'
  });

  const { metrics: weekMetrics } = useRealtimeAnalytics({
    dateRange: 'week', 
    currency: 'all',
    status: 'all'
  });

  const weeklyGoal = 500;
  const weekProgress = (weekMetrics.totalRevenue / weeklyGoal) * 100;

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2">
        {[...Array(2)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
              <div className="h-4 w-4 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-24 animate-pulse mb-2" />
              <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <Zap className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${metrics.totalRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            {metrics.totalTransactions} transactions today
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Weekly Progress</CardTitle>
          <Calendar className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            ${weekMetrics.totalRevenue.toFixed(2)}
          </div>
          <Progress value={Math.min(weekProgress, 100)} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {weekProgress.toFixed(0)}% of ${weeklyGoal} goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
