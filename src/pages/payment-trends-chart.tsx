import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { analyticsApi } from "@/lib/api/analytics";

interface PaymentTrendsChartProps {
  userId: string;
}

interface TrendData {
  name: string;
  payments: number;
  date: string;
}

export function PaymentTrendsChart({ userId }: PaymentTrendsChartProps) {
  const [trendData, setTrendData] = useState<TrendData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTrendData = async () => {
      try {
        const history = await analyticsApi.getPaymentHistory(userId, 1, 50);
        
        // Group payments by day for the last 7 days
        const last7Days = Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (6 - i));
          return date;
        });

        const trends = last7Days.map(date => {
          const dayName = date.toLocaleDateString('en', { weekday: 'short' });
          const dateStr = date.toISOString().split('T')[0];
          
          const paymentsCount = history.filter(payment => {
            const paymentDate = new Date(payment.created_at).toISOString().split('T')[0];
            return paymentDate === dateStr;
          }).length;

          return {
            name: dayName,
            payments: paymentsCount,
            date: dateStr,
          };
        });

        setTrendData(trends);
      } catch (error) {
        console.error('Failed to fetch trend data:', error);
        // Fallback to empty data
        setTrendData([
          { name: 'Mon', payments: 0, date: '' },
          { name: 'Tue', payments: 0, date: '' },
          { name: 'Wed', payments: 0, date: '' },
          { name: 'Thu', payments: 0, date: '' },
          { name: 'Fri', payments: 0, date: '' },
          { name: 'Sat', payments: 0, date: '' },
          { name: 'Sun', payments: 0, date: '' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    if (userId) {
      fetchTrendData();
    }
  }, [userId]);

  if (loading) {
    return (
      <Card data-testid="chart-payment-trends">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">
            Payment Trends
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center">
            <div className="space-y-2 w-full">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalPayments = trendData.reduce((sum, day) => sum + day.payments, 0);

  return (
    <Card data-testid="chart-payment-trends">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-foreground">
          Payment Trends (Last 7 Days)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          {totalPayments === 0 ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <div className="text-center">
                <p className="text-sm">No payments in the last 7 days</p>
                <p className="text-xs mt-1">Create your first payment to see trends</p>
              </div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis 
                  dataKey="name" 
                  className="text-xs fill-muted-foreground" 
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis 
                  className="text-xs fill-muted-foreground" 
                  tickLine={false}
                  axisLine={false}
                />
                <Line 
                  type="monotone" 
                  dataKey="payments" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: "hsl(var(--primary))", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "hsl(var(--primary))" }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
