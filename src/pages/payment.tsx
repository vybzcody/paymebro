import React, { useState, useEffect } from 'react';
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

interface Payment {
    id: string;
    reference: string;
    amount: string;
    currency: string;
    chain: string;
    status: 'pending' | 'confirmed' | 'failed';
    label: string;
    message: string;
    created_at: string;
    transaction_signature?: string;
}

interface PaymentPageProps {
    reference: string;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ reference }) => {
    const [payment, setPayment] = useState<Payment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [qrCode, setQrCode] = useState<string | null>(null);
    const [paymentUrl, setPaymentUrl] = useState<string>('');
    const { toast } = useToast();

    // Initialize WebSocket connection for real-time updates
    useEffect(() => {
        // Connect to backend server via ngrok
        const socketInstance = io(WEBSOCKET_CONFIG.url, WEBSOCKET_CONFIG.options);

        // Join payment room for updates
        socketInstance.emit('join-payment', reference);

        // Listen for payment updates
        socketInstance.on('payment-update', (data: any) => {
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
                } catch (err) {
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
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load payment');
        } finally {
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
        } catch (err) {
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
        } catch (err) {
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

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'confirmed':
                return (
                    <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Payment Confirmed
                    </Badge>
                );
            case 'pending':
                return (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                        <Clock className="w-3 h-3 mr-1" />
                        Awaiting Payment
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge variant="destructive">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Payment Failed
                    </Badge>
                );
            default:
                return (
                    <Badge variant="outline">
                        <Clock className="w-3 h-3 mr-1" />
                        Loading...
                    </Badge>
                );
        }
    };

    const formatDate = (dateString: string) => {
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
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Loading payment details...</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Payment Not Found</h2>
                            <p className="text-gray-600">{error}</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!payment) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="text-center border-b">
                    <CardTitle className="text-xl font-bold">PayMeBro Payment</CardTitle>
                    <p className="text-sm text-gray-600">Secure Solana Payment</p>
                    <p className="text-xs text-gray-500">
                        Generated on: {formatDate(payment.created_at)}
                    </p>
                    <div className="mt-3">
                        {getStatusBadge(payment.status)}
                    </div>
                </CardHeader>

                <CardContent className="p-6 space-y-6">
                    {/* Payment Amount */}
                    <div className="text-center">
                        <div className="text-3xl font-bold text-gray-900">
                            {payment.amount} {payment.currency}
                        </div>
                    </div>

                    {/* Payment Details */}
                    <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Description:</span>
                            <span className="font-medium">{payment.message}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Label:</span>
                            <span className="font-medium">{payment.label}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Network:</span>
                            <span className="font-medium uppercase">{payment.chain}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Reference:</span>
                            <span className="font-mono text-xs break-all">{payment.reference}</span>
                        </div>

                        {/* Gas Fee Note for USDC */}
                        {payment.currency === 'USDC' && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3 mt-3">
                                <div className="flex items-center text-yellow-800 text-sm">
                                    <AlertCircle className="w-4 h-4 mr-2" />
                                    <span>Payer needs SOL for gas fees</span>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* QR Code Section - Only show for pending payments */}
                    {payment.status === 'pending' && qrCode && (
                        <div className="border rounded-lg p-4">
                            <div className="text-center mb-4">
                                <h3 className="font-semibold flex items-center justify-center gap-2">
                                    <QrCode className="w-4 h-4" />
                                    Scan to Pay
                                </h3>
                            </div>

                            <div className="flex justify-center mb-4">
                                <img
                                    src={qrCode}
                                    alt="Payment QR Code"
                                    className="w-48 h-48 border rounded-lg"
                                />
                            </div>

                            <p className="text-xs text-gray-600 text-center mb-4">
                                Scan with Phantom, Solflare, or any Solana wallet
                            </p>

                            <div className="space-y-2">
                                <Input
                                    value={paymentUrl}
                                    readOnly
                                    className="font-mono text-xs"
                                />
                                <Button
                                    onClick={copyUrl}
                                    variant="outline"
                                    className="w-full"
                                    size="sm"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy URL
                                </Button>
                            </div>
                        </div>
                    )}

                    {/* Success Message */}
                    {payment.status === 'confirmed' && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-center">
                                <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                                <h3 className="font-semibold text-green-800 mb-2">Payment Confirmed</h3>
                                <p className="text-sm text-green-700">
                                    Transaction successfully processed and confirmed on the blockchain.
                                </p>
                                {payment.transaction_signature && (
                                    <div className="mt-3 p-2 bg-green-100 rounded text-xs">
                                        <span className="text-green-600">Transaction: </span>
                                        <span className="font-mono break-all">{payment.transaction_signature}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    <Separator />

                    {/* Footer */}
                    <div className="text-center text-xs text-gray-500">
                        <p>Powered by PayMeBro | Contact: support@paymebro.com</p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

// Main component that extracts the reference from the URL
const PaymentPageWrapper: React.FC = () => {
    const [match, params] = useRoute('/payment/:reference');

    if (!match || !params?.reference) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardContent className="p-6">
                        <div className="text-center">
                            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
                            <h2 className="text-lg font-semibold text-gray-900 mb-2">Invalid Payment URL</h2>
                            <p className="text-gray-600">The payment reference is missing or invalid.</p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return <PaymentPage reference={params.reference} />;
};

export default PaymentPageWrapper;