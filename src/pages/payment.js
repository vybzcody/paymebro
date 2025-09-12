import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { useRoute } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, CheckCircle, Clock, AlertCircle, QrCode } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { io } from 'socket.io-client';
import { apiCall, WEBSOCKET_CONFIG } from '@/config/api';
const PaymentPage = ({ reference }) => {
    const [payment, setPayment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [qrCode, setQrCode] = useState(null);
    const [paymentUrl, setPaymentUrl] = useState('');
    const { toast } = useToast();
    // Initialize WebSocket connection for real-time updates
    useEffect(() => {
        // Connect to backend server via ngrok
        const socketInstance = io(WEBSOCKET_CONFIG.url, WEBSOCKET_CONFIG.options);
        // Join payment room for updates
        socketInstance.emit('join-payment', reference);
        // Listen for payment updates
        socketInstance.on('payment-update', (data) => {
            if (data.reference === reference && data.status === 'confirmed') {
                setPayment(prev => prev ? { ...prev, status: 'confirmed', transaction_signature: data.transaction_signature } : null);
                toast({
                    title: "Payment Confirmed!",
                    description: "Your payment has been successfully processed.",
                });
            }
        });
        return () => {
            socketInstance.disconnect();
        };
    }, [reference, toast]);
    useEffect(() => {
        loadPayment();
    }, [reference]);
    // Set up polling for payment status as fallback
    useEffect(() => {
        const pollInterval = setInterval(async () => {
            if (payment?.status === 'pending') {
                try {
                    const data = await apiCall(`/api/payments/${reference}/status`);
                    if (data.success && data.status === 'confirmed') {
                        setPayment(prev => prev ? { ...prev, status: 'confirmed' } : null);
                        toast({
                            title: "Payment Confirmed!",
                            description: "Your payment has been successfully processed.",
                        });
                    }
                }
                catch (err) {
                    console.error('Status polling failed:', err);
                }
            }
        }, 5000); // Poll every 5 seconds
        return () => {
            clearInterval(pollInterval);
        };
    }, [reference, payment?.status, toast]);
    const loadPayment = async () => {
        try {
            setLoading(true);
            // Use API helper function
            console.log('Fetching payment:', `/api/payments/${reference}`);
            const data = await apiCall(`/api/payments/${reference}`);
            console.log('Payment data:', data);
            if (!data.success) {
                throw new Error(data.error);
            }
            setPayment(data.payment);
            if (data.payment.status === 'pending') {
                await generateQR();
            }
        }
        catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payment');
        }
        finally {
            setLoading(false);
        }
    };
    const generateQR = async () => {
        try {
            const data = await apiCall(`/api/payments/${reference}/qr`);
            if (data.success && data.qrCode) {
                setQrCode(data.qrCode);
                // Set the payment URL for copying (use ngrok URL for transaction requests)
                const url = `${WEBSOCKET_CONFIG.url}/api/transaction-requests/${reference}`;
                setPaymentUrl(url);
            }
        }
        catch (err) {
            console.error('Failed to generate QR code:', err);
        }
    };
    const copyUrl = async () => {
        try {
            await navigator.clipboard.writeText(paymentUrl);
            toast({
                title: "Copied!",
                description: "Payment URL copied to clipboard",
            });
        }
        catch (err) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = paymentUrl;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            toast({
                title: "Copied!",
                description: "Payment URL copied to clipboard",
            });
        }
    };
    const getStatusBadge = (status) => {
        switch (status) {
            case 'confirmed':
                return (_jsxs(Badge, { variant: "default", className: "bg-green-100 text-green-800 border-green-200", children: [_jsx(CheckCircle, { className: "w-3 h-3 mr-1" }), "Payment Confirmed"] }));
            case 'pending':
                return (_jsxs(Badge, { variant: "secondary", className: "bg-yellow-100 text-yellow-800 border-yellow-200", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Awaiting Payment"] }));
            case 'failed':
                return (_jsxs(Badge, { variant: "destructive", children: [_jsx(AlertCircle, { className: "w-3 h-3 mr-1" }), "Payment Failed"] }));
            default:
                return (_jsxs(Badge, { variant: "outline", children: [_jsx(Clock, { className: "w-3 h-3 mr-1" }), "Loading..."] }));
        }
    };
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            timeZoneName: 'short'
        });
    };
    if (loading) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx("div", { className: "animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4" }), _jsx("p", { className: "text-gray-600", children: "Loading payment details..." })] }) }) }) }));
    }
    if (error) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Payment Not Found" }), _jsx("p", { className: "text-gray-600", children: error })] }) }) }) }));
    }
    if (!payment) {
        return null;
    }
    return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsxs(Card, { className: "w-full max-w-md shadow-lg", children: [_jsxs(CardHeader, { className: "text-center border-b", children: [_jsx(CardTitle, { className: "text-xl font-bold", children: "PayMeBro Payment" }), _jsx("p", { className: "text-sm text-gray-600", children: "Secure Solana Payment" }), _jsxs("p", { className: "text-xs text-gray-500", children: ["Generated on: ", formatDate(payment.created_at)] }), _jsx("div", { className: "mt-3", children: getStatusBadge(payment.status) })] }), _jsxs(CardContent, { className: "p-6 space-y-6", children: [_jsx("div", { className: "text-center", children: _jsxs("div", { className: "text-3xl font-bold text-gray-900", children: [payment.amount, " ", payment.currency] }) }), _jsxs("div", { className: "bg-gray-50 rounded-lg p-4 space-y-3", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Description:" }), _jsx("span", { className: "font-medium", children: payment.message })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Label:" }), _jsx("span", { className: "font-medium", children: payment.label })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Network:" }), _jsx("span", { className: "font-medium uppercase", children: payment.chain })] }), _jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { className: "text-gray-600", children: "Reference:" }), _jsx("span", { className: "font-mono text-xs break-all", children: payment.reference })] }), payment.currency === 'USDC' && (_jsx("div", { className: "bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3", children: _jsxs("div", { className: "flex items-center text-yellow-800 text-sm", children: [_jsx(AlertCircle, { className: "w-4 h-4 mr-2" }), _jsx("span", { children: "Payer needs SOL for gas fees" })] }) }))] }), payment.status === 'pending' && qrCode && (_jsxs("div", { className: "border rounded-lg p-4", children: [_jsx("div", { className: "text-center mb-4", children: _jsxs("h3", { className: "font-semibold flex items-center justify-center gap-2", children: [_jsx(QrCode, { className: "w-4 h-4" }), "Scan to Pay"] }) }), _jsx("div", { className: "flex justify-center mb-4", children: _jsx("img", { src: qrCode, alt: "Payment QR Code", className: "w-48 h-48 border rounded-lg" }) }), _jsx("p", { className: "text-xs text-gray-600 text-center mb-4", children: "Scan with Phantom, Solflare, or any Solana wallet" }), _jsxs("div", { className: "space-y-2", children: [_jsx(Input, { value: paymentUrl, readOnly: true, className: "font-mono text-xs" }), _jsxs(Button, { onClick: copyUrl, variant: "outline", className: "w-full", size: "sm", children: [_jsx(Copy, { className: "w-4 h-4 mr-2" }), "Copy URL"] })] })] })), payment.status === 'confirmed' && (_jsx("div", { className: "bg-green-50 border border-green-200 rounded-lg p-4", children: _jsxs("div", { className: "text-center", children: [_jsx(CheckCircle, { className: "w-12 h-12 text-green-500 mx-auto mb-3" }), _jsx("h3", { className: "font-semibold text-green-800 mb-2", children: "Payment Confirmed" }), _jsx("p", { className: "text-sm text-green-700", children: "Transaction successfully processed and confirmed on the blockchain." }), payment.transaction_signature && (_jsxs("div", { className: "mt-3 p-2 bg-green-100 rounded text-xs", children: [_jsx("span", { className: "text-green-600", children: "Transaction: " }), _jsx("span", { className: "font-mono break-all", children: payment.transaction_signature })] }))] }) })), _jsx(Separator, {}), _jsx("div", { className: "text-center text-xs text-gray-500", children: _jsx("p", { children: "Powered by PayMeBro | Contact: support@paymebro.com" }) })] })] }) }));
};
// Main component that extracts the reference from the URL
const PaymentPageWrapper = () => {
    const [match, params] = useRoute('/payment/:reference');
    if (!match || !params?.reference) {
        return (_jsx("div", { className: "min-h-screen bg-gray-50 flex items-center justify-center p-4", children: _jsx(Card, { className: "w-full max-w-md", children: _jsx(CardContent, { className: "p-6", children: _jsxs("div", { className: "text-center", children: [_jsx(AlertCircle, { className: "h-12 w-12 text-red-500 mx-auto mb-4" }), _jsx("h2", { className: "text-lg font-semibold text-gray-900 mb-2", children: "Invalid Payment URL" }), _jsx("p", { className: "text-gray-600", children: "The payment reference is missing or invalid." })] }) }) }) }));
    }
    return _jsx(PaymentPage, { reference: params.reference });
};
export default PaymentPageWrapper;
