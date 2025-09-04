import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { RevenueMetrics } from "@/hooks/useAnalytics";

interface CurrencyBreakdownProps {
  metrics: RevenueMetrics;
  loading: boolean;
}

export const CurrencyBreakdown = ({ metrics, loading }: CurrencyBreakdownProps) => {
  const total = metrics.currencyBreakdown.SOL + metrics.currencyBreakdown.USDC;
  const solPercentage = total > 0 ? (metrics.currencyBreakdown.SOL / total) * 100 : 0;
  const usdcPercentage = total > 0 ? (metrics.currencyBreakdown.USDC / total) * 100 : 0;

  const formatAmount = (amount: number, currency: string) => {
    if (currency === 'SOL') {
      return `${amount.toFixed(4)} SOL`;
    }
    return `$${amount.toFixed(2)}`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Payment Method Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 rounded w-20 animate-pulse" />
            <div className="h-2 bg-gray-200 rounded animate-pulse" />
            <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Payment Method Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center">
              <div className="w-3 h-3 bg-orange-500 rounded-full mr-2" />
              SOL
            </span>
            <span className="text-sm text-gray-600">
              {formatAmount(metrics.currencyBreakdown.SOL, 'SOL')} ({solPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={solPercentage} className="h-2" />
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium flex items-center">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-2" />
              USDC
            </span>
            <span className="text-sm text-gray-600">
              {formatAmount(metrics.currencyBreakdown.USDC, 'USDC')} ({usdcPercentage.toFixed(1)}%)
            </span>
          </div>
          <Progress value={usdcPercentage} className="h-2" />
        </div>

        <div className="pt-4 border-t">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total Revenue</span>
            <span className="font-bold">
              ${(metrics.currencyBreakdown.SOL + metrics.currencyBreakdown.USDC).toFixed(2)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
