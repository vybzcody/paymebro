import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { usePayment } from "@/hooks/use-payment";
import { Check, Clock, X } from "lucide-react";
import { Link } from "wouter";
import { Payment } from "@/schema";

interface RecentPaymentsProps {
  userId: string;
}

export function RecentPayments({ userId }: RecentPaymentsProps) {
  const { getUserPayments } = usePayment(userId);
  const { data: paymentsData, isLoading } = getUserPayments;

  const payments = paymentsData?.payments?.slice(0, 3) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <Check className="h-4 w-4 text-secondary" />;
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
      case 'confirmed':
        return 'bg-secondary/10 text-secondary border-secondary/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20';
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours} hours ago`;
    return `${Math.floor(diffInHours / 24)} days ago`;
  };

  return (
    <Card data-testid="card-recent-payments">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-foreground">
            Recent Payments
          </CardTitle>
          <Link href="/payments">
            <span className="text-primary text-sm hover:underline cursor-pointer" data-testid="link-view-all-payments">
              View all
            </span>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {isLoading ? (
            [...Array(3)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 p-3 rounded-lg">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
                <div className="text-right space-y-2">
                  <Skeleton className="h-4 w-16" />
                  <Skeleton className="h-6 w-20" />
                </div>
              </div>
            ))
          ) : payments.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No payments yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Create your first payment to see it here
              </p>
            </div>
          ) : (
            payments.map((payment: Payment) => (
              <div 
                key={payment.id} 
                className="flex items-center space-x-4 p-3 rounded-lg hover:bg-muted/50 transition-colors"
                data-testid={`payment-item-${payment.id}`}
              >
                <div className="w-8 h-8 bg-secondary/10 rounded-full flex items-center justify-center">
                  {getStatusIcon(payment.status)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-foreground" data-testid={`payment-label-${payment.id}`}>
                    {payment.label}
                  </p>
                  <p className="text-xs text-muted-foreground" data-testid={`payment-email-${payment.id}`}>
                    {payment.customer_email}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-foreground" data-testid={`payment-amount-${payment.id}`}>
                    ${payment.amount} {payment.currency}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge 
                      variant="outline" 
                      className={`text-xs capitalize ${getStatusColor(payment.status)}`}
                      data-testid={`payment-status-${payment.id}`}
                    >
                      {payment.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {payment.created_at ? formatTimeAgo(
                      typeof payment.created_at === 'string' 
                        ? payment.created_at 
                        : payment.created_at.toISOString()
                    ) : 'Unknown'}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
