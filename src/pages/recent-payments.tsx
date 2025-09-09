import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { analyticsApi, PaymentHistory } from "@/lib/api/analytics";
import { Check, Clock, X, RefreshCw } from "lucide-react";

interface RecentPaymentsProps {
  userId: string;
}

export function RecentPayments({ userId }: RecentPaymentsProps) {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchPayments = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const history = await analyticsApi.getPaymentHistory(userId, 1, 5);
      setPayments(history.slice(0, 3)); // Show only 3 most recent
    } catch (error) {
      console.error('Failed to fetch recent payments:', error);
      setPayments([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchPayments();
    }
  }, [userId]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return <Check className="h-4 w-4 text-green-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'failed':
        return <X className="h-4 w-4 text-destructive" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'confirmed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'failed':
        return 'bg-red-50 text-red-700 border-red-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="space-y-1">
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="text-right space-y-1">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-3 w-12" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-lg font-semibold">
          Recent Payments
          <Button
            onClick={() => fetchPayments(true)}
            disabled={refreshing}
            variant="outline"
            size="sm"
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-2">No recent payments</p>
            <p className="text-sm text-muted-foreground">Your payment history will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {getStatusIcon(payment.status)}
                  </div>
                  <div>
                    <p className="font-medium text-sm">
                      {payment.description || payment.label || 'Payment'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimeAgo(payment.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-sm">
                    {payment.amount} {payment.currency}
                  </p>
                  <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(payment.status)}`}
                  >
                    {payment.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
