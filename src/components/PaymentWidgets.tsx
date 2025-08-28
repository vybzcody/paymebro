import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TrendingUp, Calendar, Zap } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';

export const PaymentWidgets = () => {
  const { user } = useAuth();
  const [todayRevenue, setTodayRevenue] = useState(0);
  const [weekRevenue, setWeekRevenue] = useState(0);
  const [weeklyGoal] = useState(500); // $500 weekly goal

  useEffect(() => {
    // Simulate real-time revenue updates
    const interval = setInterval(() => {
      setTodayRevenue(prev => prev + Math.random() * 5);
      setWeekRevenue(prev => prev + Math.random() * 2);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const weekProgress = (weekRevenue / weeklyGoal) * 100;

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Today's Revenue</CardTitle>
          <Zap className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            ${todayRevenue.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Live updates every few seconds
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
            ${weekRevenue.toFixed(2)}
          </div>
          <Progress value={weekProgress} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-1">
            {weekProgress.toFixed(0)}% of ${weeklyGoal} goal
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
