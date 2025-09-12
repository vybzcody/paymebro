import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye, Download, Copy, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { analyticsApi, type PaymentHistory } from "@/lib/api/analytics";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { useToast } from "@/hooks/use-toast";
import { useApiCache } from "@/hooks/use-api-cache";
import { appConfig, getApiHeaders } from "@/lib/config";

interface RecentPaymentsProps {
  userId: string;
  onRefreshNeeded?: () => void;
}

export interface RecentPaymentsRef {
  refresh: () => void;
}

export const RecentPayments = forwardRef<RecentPaymentsRef, RecentPaymentsProps>(({ userId, onRefreshNeeded }, ref) => {
  const [payments, setPayments] = useState<PaymentHistory[]>([]);
  const {
    socket,
    isConnected,
    isConnecting,
    connectionError,
    joinPayment,
    leavePayment,
    reconnect
  } = useWebSocket();
  const { toast } = useToast();

  const fetchPayments = useCallback(async (): Promise<PaymentHistory[]> => {
    if (!userId || userId === "unknown") {
      return [];
    }

    try {
      return await analyticsApi.getPaymentHistory(userId, 1, 5);
    } catch (error) {
      console.error('Failed to fetch payment history:', error);
      return [];
    }
  }, [userId]);

  const { data: cachedPayments, loading: isLoading, refetch } = useApiCache(
    `recent-payments-${userId}`,
    fetchPayments,
    [userId],
    { cacheTime: 1 * 60 * 1000, staleTime: 15 * 1000 } // Cache for 1 minute, stale after 15 seconds
  );

  // Update local state when cached data changes
  useEffect(() => {
    if (cachedPayments) {
      setPayments(cachedPayments);
    }
  }, [cachedPayments]);

  // Expose refetch function for parent components
  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  // Expose refresh function to parent via ref
  useImperativeHandle(ref, () => ({
    refresh: handleRefresh
  }), [handleRefresh]);

  const handleView = (payment: PaymentHistory) => {
    const paymentUrl = `${window.location.origin}/payment/${payment.reference}`;
    window.open(paymentUrl, '_blank');
  };

  const handleDownloadQR = async (payment: PaymentHistory) => {
    try {
      const response = await fetch(`${appConfig.apiUrl}/api/payments/${payment.reference}/qr`, {
        headers: getApiHeaders()
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch QR code`);
      }

      const result = await response.json();
      if (!result.success || !result.qrCode) {
        throw new Error('Invalid QR code response');
      }

      // Convert data URI to blob for download
      const base64Data = result.qrCode.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payment_${payment.reference.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      toast({
        title: "QR Code Downloaded",
        description: "Payment QR code saved to downloads"
      });
    } catch (error) {
      console.error('Failed to download QR code:', error);
      toast({
        title: "Download Failed",
        description: "Could not download QR code",
        variant: "destructive"
      });
    }
  };

  const handleCopyLink = (payment: PaymentHistory) => {
    const link = `${window.location.origin}/payment/${payment.reference}`;
    navigator.clipboard.writeText(link);
    toast({
      title: "Link Copied",
      description: "Payment link copied to clipboard"
    });
  };



  // Listen for real-time payment updates and join payment rooms
  useEffect(() => {
    if (!socket || !isConnected || payments.length === 0) return;

    // Join all payment rooms for real-time updates
    const joinPromises = payments.map(payment => joinPayment(payment.reference));
    Promise.all(joinPromises).then(results => {
      const successCount = results.filter(Boolean).length;
      console.log(`Joined ${successCount}/${payments.length} payment rooms`);
    });

    const handlePaymentUpdate = (update: any) => {
      console.log('Received payment update:', update);
      setPayments(prev =>
        prev.map(payment =>
          payment.reference === update.reference
            ? { ...payment, status: update.status === 'confirmed' ? 'completed' : update.status }
            : payment
        )
      );

      // Show toast notification for payment status changes
      if (update.status === 'confirmed') {
        toast({
          title: "Payment Confirmed",
          description: `Payment ${update.reference.slice(0, 8)} has been confirmed!`
        });
      } else if (update.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: `Payment ${update.reference.slice(0, 8)} has failed.`,
          variant: "destructive"
        });
      }
    };

    socket.on('payment-update', handlePaymentUpdate);

    return () => {
      // Leave all payment rooms when component unmounts
      payments.forEach(payment => {
        leavePayment(payment.reference).catch(err =>
          console.error('Error leaving payment room:', err)
        );
      });

      socket.off('payment-update', handlePaymentUpdate);
    };
  }, [socket, isConnected, payments.length, joinPayment, leavePayment, toast]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800",
      pending: "bg-yellow-100 text-yellow-800",
      failed: "bg-red-100 text-red-800",
    };

    return (
      <Badge className={variants[status as keyof typeof variants] || "bg-gray-100 text-gray-800"}>
        {status}
      </Badge>
    );
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minutes ago`;
    if (diffHours < 24) return `${diffHours} hours ago`;
    return `${diffDays} days ago`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center justify-between p-3 rounded-lg border animate-pulse">
                <div className="flex items-center gap-3">
                  <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                  <div>
                    <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                  <div className="h-5 bg-gray-200 rounded w-12"></div>
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
        <div className="flex items-center justify-between">
          <CardTitle>Recent Payments</CardTitle>
          <div className="flex items-center gap-2">
            {isConnecting && (
              <Badge variant="outline" className="text-yellow-600">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Connecting...
                </div>
              </Badge>
            )}
            {!isConnecting && isConnected && (
              <Badge variant="outline" className="text-green-600">
                <div className="flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Connected
                </div>
              </Badge>
            )}
            {!isConnecting && !isConnected && (
              <Badge variant="outline" className="text-red-600">
                <div className="flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Disconnected
                </div>
              </Badge>
            )}
          </div>
        </div>
        {connectionError && (
          <div className="text-sm text-red-600 flex items-center gap-2">
            <span>{connectionError}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={reconnect}
              className="h-6 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {payments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No recent payments found</p>
              <p className="text-sm">Create your first payment to see activity here</p>
            </div>
          ) : (
            payments.map((payment) => (
              <div
                key={payment.id}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(payment.status)}
                  <div>
                    <p className="font-medium text-sm">{payment.description || 'Payment'}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatTimestamp(payment.timestamp)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <div className="text-right">
                    <p className="font-semibold text-sm">
                      {payment.amount} {payment.currency}
                    </p>
                    {getStatusBadge(payment.status)}
                  </div>
                  <div className="flex items-center gap-1 ml-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleView(payment)}
                      title="View Payment"
                      className="h-8 w-8 p-0"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadQR(payment)}
                      title="Download QR"
                      className="h-8 w-8 p-0"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyLink(payment)}
                      title="Copy Link"
                      className="h-8 w-8 p-0"
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        {payments.length > 0 && (
          <div className="mt-4 pt-4 border-t">
            <button className="w-full text-sm text-blue-600 hover:text-blue-800 font-medium">
              View all payments →
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
