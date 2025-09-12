import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, CheckCircle, XCircle, Eye, Download, Copy, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useEffect, useState, useCallback, forwardRef, useImperativeHandle } from "react";
import { analyticsApi } from "@/lib/api/analytics";
import { useWebSocket } from "@/components/providers/websocket-provider";
import { useToast } from "@/hooks/use-toast";
import { useApiCache } from "@/hooks/use-api-cache";
import { appConfig, getApiHeaders } from "@/lib/config";
export const RecentPayments = forwardRef(({ userId, onRefreshNeeded }, ref) => {
    const [payments, setPayments] = useState([]);
    const { socket, isConnected, isConnecting, connectionError, joinPayment, leavePayment, reconnect } = useWebSocket();
    const { toast } = useToast();
    const fetchPayments = useCallback(async () => {
        if (!userId || userId === "unknown") {
            return [];
        }
        try {
            return await analyticsApi.getPaymentHistory(userId, 1, 5);
        }
        catch (error) {
            console.error('Failed to fetch payment history:', error);
            return [];
        }
    }, [userId]);
    const { data: cachedPayments, loading: isLoading, refetch } = useApiCache(`recent-payments-${userId}`, fetchPayments, [userId], { cacheTime: 1 * 60 * 1000, staleTime: 15 * 1000 } // Cache for 1 minute, stale after 15 seconds
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
    const handleView = (payment) => {
        const paymentUrl = `${window.location.origin}/payment/${payment.reference}`;
        window.open(paymentUrl, '_blank');
    };
    const handleDownloadQR = async (payment) => {
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
        }
        catch (error) {
            console.error('Failed to download QR code:', error);
            toast({
                title: "Download Failed",
                description: "Could not download QR code",
                variant: "destructive"
            });
        }
    };
    const handleCopyLink = (payment) => {
        const link = `${window.location.origin}/payment/${payment.reference}`;
        navigator.clipboard.writeText(link);
        toast({
            title: "Link Copied",
            description: "Payment link copied to clipboard"
        });
    };
    // Listen for real-time payment updates and join payment rooms
    useEffect(() => {
        if (!socket || !isConnected || payments.length === 0)
            return;
        // Join all payment rooms for real-time updates
        const joinPromises = payments.map(payment => joinPayment(payment.reference));
        Promise.all(joinPromises).then(results => {
            const successCount = results.filter(Boolean).length;
            console.log(`Joined ${successCount}/${payments.length} payment rooms`);
        });
        const handlePaymentUpdate = (update) => {
            console.log('Received payment update:', update);
            setPayments(prev => prev.map(payment => payment.reference === update.reference
                ? { ...payment, status: update.status === 'confirmed' ? 'completed' : update.status }
                : payment));
            // Show toast notification for payment status changes
            if (update.status === 'confirmed') {
                toast({
                    title: "Payment Confirmed",
                    description: `Payment ${update.reference.slice(0, 8)} has been confirmed!`
                });
            }
            else if (update.status === 'failed') {
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
                leavePayment(payment.reference).catch(err => console.error('Error leaving payment room:', err));
            });
            socket.off('payment-update', handlePaymentUpdate);
        };
    }, [socket, isConnected, payments.length, joinPayment, leavePayment, toast]);
    const getStatusIcon = (status) => {
        switch (status) {
            case "completed":
                return _jsx(CheckCircle, { className: "h-4 w-4 text-green-600" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-600" });
            case "failed":
                return _jsx(XCircle, { className: "h-4 w-4 text-red-600" });
            default:
                return _jsx(Clock, { className: "h-4 w-4 text-gray-600" });
        }
    };
    const getStatusBadge = (status) => {
        const variants = {
            completed: "bg-green-100 text-green-800",
            pending: "bg-yellow-100 text-yellow-800",
            failed: "bg-red-100 text-red-800",
        };
        return (_jsx(Badge, { className: variants[status] || "bg-gray-100 text-gray-800", children: status }));
    };
    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1)
            return 'Just now';
        if (diffMins < 60)
            return `${diffMins} minutes ago`;
        if (diffHours < 24)
            return `${diffHours} hours ago`;
        return `${diffDays} days ago`;
    };
    if (isLoading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Recent Payments" }) }), _jsx(CardContent, { children: _jsx("div", { className: "space-y-4", children: [...Array(5)].map((_, i) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border animate-pulse", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "h-4 w-4 bg-gray-200 rounded-full" }), _jsxs("div", { children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-32 mb-1" }), _jsx("div", { className: "h-3 bg-gray-200 rounded w-20" })] })] }), _jsxs("div", { className: "text-right", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-16 mb-1" }), _jsx("div", { className: "h-5 bg-gray-200 rounded w-12" })] })] }, i))) }) })] }));
    }
    return (_jsxs(Card, { children: [_jsxs(CardHeader, { children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsx(CardTitle, { children: "Recent Payments" }), _jsxs("div", { className: "flex items-center gap-2", children: [isConnecting && (_jsx(Badge, { variant: "outline", className: "text-yellow-600", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx("div", { className: "w-2 h-2 rounded-full bg-yellow-500 animate-pulse" }), "Connecting..."] }) })), !isConnecting && isConnected && (_jsx(Badge, { variant: "outline", className: "text-green-600", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Wifi, { className: "h-3 w-3" }), "Connected"] }) })), !isConnecting && !isConnected && (_jsx(Badge, { variant: "outline", className: "text-red-600", children: _jsxs("div", { className: "flex items-center gap-1", children: [_jsx(WifiOff, { className: "h-3 w-3" }), "Disconnected"] }) }))] })] }), connectionError && (_jsxs("div", { className: "text-sm text-red-600 flex items-center gap-2", children: [_jsx("span", { children: connectionError }), _jsxs(Button, { variant: "outline", size: "sm", onClick: reconnect, className: "h-6 text-xs", children: [_jsx(RotateCcw, { className: "h-3 w-3 mr-1" }), "Retry"] })] }))] }), _jsxs(CardContent, { children: [_jsx("div", { className: "space-y-4", children: payments.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-muted-foreground", children: [_jsx("p", { children: "No recent payments found" }), _jsx("p", { className: "text-sm", children: "Create your first payment to see activity here" })] })) : (payments.map((payment) => (_jsxs("div", { className: "flex items-center justify-between p-3 rounded-lg border hover:bg-gray-50 transition-colors", children: [_jsxs("div", { className: "flex items-center gap-3", children: [getStatusIcon(payment.status), _jsxs("div", { children: [_jsx("p", { className: "font-medium text-sm", children: payment.description || 'Payment' }), _jsx("p", { className: "text-xs text-muted-foreground", children: formatTimestamp(payment.timestamp) })] })] }), _jsxs("div", { className: "flex items-center gap-2", children: [_jsxs("div", { className: "text-right", children: [_jsxs("p", { className: "font-semibold text-sm", children: [payment.amount, " ", payment.currency] }), getStatusBadge(payment.status)] }), _jsxs("div", { className: "flex items-center gap-1 ml-2", children: [_jsx(Button, { variant: "outline", size: "sm", onClick: () => handleView(payment), title: "View Payment", className: "h-8 w-8 p-0", children: _jsx(Eye, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleDownloadQR(payment), title: "Download QR", className: "h-8 w-8 p-0", children: _jsx(Download, { className: "h-4 w-4" }) }), _jsx(Button, { variant: "outline", size: "sm", onClick: () => handleCopyLink(payment), title: "Copy Link", className: "h-8 w-8 p-0", children: _jsx(Copy, { className: "h-4 w-4" }) })] })] })] }, payment.id)))) }), payments.length > 0 && (_jsx("div", { className: "mt-4 pt-4 border-t", children: _jsx("button", { className: "w-full text-sm text-blue-600 hover:text-blue-800 font-medium", children: "View all payments \u2192" }) }))] })] }));
});
