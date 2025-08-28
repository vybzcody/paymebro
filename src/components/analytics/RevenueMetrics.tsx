import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, DollarSign, CreditCard, Calendar, BarChart3 } from "lucide-react";
import { RevenueMetrics as RevenueMetricsType } from "@/hooks/useAnalytics";
import { useCurrency } from "@/contexts/CurrencyContext";

interface RevenueMetricsProps {
  metrics: RevenueMetricsType;
  loading: boolean;
}

export const RevenueMetrics = ({ metrics, loading }: RevenueMetricsProps) => {
  const { formatAmount } = useCurrency();
  const [formattedRevenue, setFormattedRevenue] = useState('$0.00');
  const [formattedMRR, setFormattedMRR] = useState('$0.00');
  const [formattedARR, setFormattedARR] = useState('$0.00');

  useEffect(() => {
    const updateFormattedAmounts = async () => {
      // Assuming metrics are mixed SOL/USDC, we'll format as USDC for now
      const revenue = await formatAmount(metrics.totalRevenue, 'USDC');
      const mrr = await formatAmount(metrics.mrr, 'USDC');
      const arr = await formatAmount(metrics.arr, 'USDC');
      
      setFormattedRevenue(revenue);
      setFormattedMRR(mrr);
      setFormattedARR(arr);
    };

    updateFormattedAmounts();
  }, [metrics, formatAmount]);

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  if (loading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedRevenue}</div>
          <div className="flex items-center text-xs text-muted-foreground">
            {metrics.growth >= 0 ? (
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
            )}
            {Math.abs(metrics.growth).toFixed(1)}% from last period
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          <CreditCard className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatNumber(metrics.totalTransactions)}</div>
          <p className="text-xs text-muted-foreground">
            Total payments processed
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">MRR</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedMRR}</div>
          <p className="text-xs text-muted-foreground">
            Monthly Recurring Revenue
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">ARR</CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formattedARR}</div>
          <p className="text-xs text-muted-foreground">
            Annual Recurring Revenue
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
