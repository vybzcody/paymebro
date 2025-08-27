import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { AlertCircle, CheckCircle, Clock, Loader2, ExternalLink, Copy } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useSolanaPayBackend } from '@/hooks/useSolanaPayBackend';
import { PaymentUtils } from '@/services/afripayAPI';

export const BackendTestComponent: React.FC = () => {
  const { toast } = useToast();
  const {
    paymentStatus,
    backendStatus,
    isBackendHealthy,
    createAndMonitorPayment,
    cancelPayment,
    resetPayment,
    calculateFees,
    isWalletConnected,
    walletAddress,
  } = useSolanaPayBackend();

  const [testForm, setTestForm] = useState({
    amount: '10.50',
    currency: 'USDC' as 'SOL' | 'USDC',
    label: 'AfriPay Test Store',
    message: 'Test payment from backend integration',
    customerName: 'John Doe',
    customerEmail: 'john@example.com',
  });

  // Calculate fee breakdown
  const feeBreakdown = calculateFees(parseFloat(testForm.amount) || 0, testForm.currency);

  const handleCreatePayment = async () => {
    if (!isWalletConnected) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet first.',
        variant: 'destructive',
      });
      return;
    }

    const paymentData = {
      amount: parseFloat(testForm.amount),
      currency: testForm.currency,
      label: testForm.label,
      message: testForm.message,
      customerName: testForm.customerName,
      customerEmail: testForm.customerEmail,
      memo: `Backend test payment - ${Date.now()}`,
    };

    await createAndMonitorPayment(paymentData);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: 'Copied!',
      description: `${label} copied to clipboard`,
    });
  };

  const getStatusBadge = () => {
    const statusColors = {
      idle: 'secondary',
      creating: 'default',
      pending: 'default',
      confirmed: 'default',
      failed: 'destructive',
      expired: 'destructive',
    } as const;

    const statusIcons = {
      idle: null,
      creating: <Loader2 className="w-3 h-3 animate-spin" />,
      pending: <Clock className="w-3 h-3" />,
      confirmed: <CheckCircle className="w-3 h-3" />,
      failed: <AlertCircle className="w-3 h-3" />,
      expired: <AlertCircle className="w-3 h-3" />,
    };

    return (
      <Badge variant={statusColors[paymentStatus.status]} className="flex items-center gap-1">
        {statusIcons[paymentStatus.status]}
        {paymentStatus.status.toUpperCase()}
      </Badge>
    );
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold">AfriPay Backend Integration Test</h1>
        <p className="text-muted-foreground mt-2">
          Test the new Solana Pay compliant backend API
        </p>
      </div>

      {/* Backend Status */}
      <Alert className={isBackendHealthy ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Backend Status</AlertTitle>
        <AlertDescription>
          {isBackendHealthy ? (
            <span className="text-green-700">✅ Backend is healthy and ready</span>
          ) : (
            <span className="text-red-700">❌ Backend is not responding</span>
          )}
          <br />
          <span className="text-sm text-muted-foreground">
            Wallet: {isWalletConnected ? '🟢 Connected' : '🔴 Not Connected'}
            {walletAddress && (
              <span className="ml-2 font-mono text-xs">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </span>
            )}
          </span>
        </AlertDescription>
      </Alert>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Payment Form */}
        <Card>
          <CardHeader>
            <CardTitle>Create Test Payment</CardTitle>
            <CardDescription>
              Test payment creation with AfriPay fees
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="amount">Amount</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  value={testForm.amount}
                  onChange={(e) => setTestForm(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="currency">Currency</Label>
                <select
                  id="currency"
                  className="w-full px-3 py-2 border rounded-md"
                  value={testForm.currency}
                  onChange={(e) => setTestForm(prev => ({ ...prev, currency: e.target.value as 'SOL' | 'USDC' }))}
                >
                  <option value="USDC">USDC</option>
                  <option value="SOL">SOL</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="label">Store Name</Label>
              <Input
                id="label"
                value={testForm.label}
                onChange={(e) => setTestForm(prev => ({ ...prev, label: e.target.value }))}
              />
            </div>

            <div>
              <Label htmlFor="message">Description</Label>
              <Input
                id="message"
                value={testForm.message}
                onChange={(e) => setTestForm(prev => ({ ...prev, message: e.target.value }))}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customerName">Customer Name</Label>
                <Input
                  id="customerName"
                  value={testForm.customerName}
                  onChange={(e) => setTestForm(prev => ({ ...prev, customerName: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="customerEmail">Customer Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={testForm.customerEmail}
                  onChange={(e) => setTestForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                />
              </div>
            </div>

            {/* Fee Breakdown */}
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold text-sm mb-2">AfriPay Fee Breakdown</h4>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Original Amount:</span>
                  <span>{PaymentUtils.formatAmount(feeBreakdown.originalAmount, testForm.currency)}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>AfriPay Fee (2.9% + $0.30):</span>
                  <span>{PaymentUtils.formatAmount(feeBreakdown.fee, testForm.currency)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Customer Pays:</span>
                  <span>{PaymentUtils.formatAmount(feeBreakdown.total, testForm.currency)}</span>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleCreatePayment}
                disabled={!isBackendHealthy || !isWalletConnected || paymentStatus.status === 'creating'}
                className="flex-1"
              >
                {paymentStatus.status === 'creating' && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Payment
              </Button>
              {paymentStatus.status !== 'idle' && (
                <Button variant="outline" onClick={resetPayment}>
                  Reset
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Payment Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              Payment Status
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              Real-time payment monitoring
            </CardDescription>
          </CardHeader>
          <CardContent>
            {paymentStatus.status === 'idle' ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No active payment request</p>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Payment URLs */}
                {paymentStatus.paymentUrl && (
                  <div>
                    <Label className="text-sm font-semibold">Payment URL</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={paymentStatus.paymentUrl}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(paymentStatus.paymentUrl!, 'Payment URL')}
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* QR Code */}
                {paymentStatus.qrCodeUrl && (
                  <div className="text-center">
                    <Label className="text-sm font-semibold">QR Code</Label>
                    <div className="mt-2">
                      <img
                        src={paymentStatus.qrCodeUrl}
                        alt="Payment QR Code"
                        className="mx-auto max-w-[200px] border rounded-lg"
                      />
                    </div>
                    <p className="text-xs text-muted-foreground mt-2">
                      Scan with Solana wallet to pay
                    </p>
                  </div>
                )}

                {/* Payment Details */}
                {paymentStatus.feeBreakdown && (
                  <div className="p-3 bg-muted rounded-lg">
                    <h4 className="font-semibold text-sm mb-2">Payment Details</h4>
                    <div className="text-sm space-y-1">
                      <div className="flex justify-between">
                        <span>Merchant Receives:</span>
                        <span className="font-semibold">
                          {PaymentUtils.formatAmount(paymentStatus.feeBreakdown.merchantReceives, testForm.currency)}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>AfriPay Fee:</span>
                        <span>{PaymentUtils.formatAmount(paymentStatus.feeBreakdown.afripayFee, testForm.currency)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Customer Pays:</span>
                        <span className="font-semibold">
                          {PaymentUtils.formatAmount(paymentStatus.feeBreakdown.total, testForm.currency)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Expiry Information */}
                {paymentStatus.timeUntilExpiry && !paymentStatus.timeUntilExpiry.expired && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>Expires in {paymentStatus.timeUntilExpiry.timeString}</span>
                  </div>
                )}

                {/* Transaction Signature */}
                {paymentStatus.signature && (
                  <div>
                    <Label className="text-sm font-semibold">Transaction Signature</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Input
                        value={paymentStatus.signature}
                        readOnly
                        className="font-mono text-xs"
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => window.open(`https://explorer.solana.com/tx/${paymentStatus.signature}?cluster=devnet`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Error Display */}
                {paymentStatus.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>{paymentStatus.error}</AlertDescription>
                  </Alert>
                )}

                {/* Actions */}
                {paymentStatus.status === 'pending' && (
                  <Button
                    variant="outline"
                    onClick={() => cancelPayment()}
                    className="w-full"
                  >
                    Cancel Payment
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Success Message */}
      {paymentStatus.status === 'confirmed' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4" />
          <AlertTitle className="text-green-800">Payment Confirmed! 🎉</AlertTitle>
          <AlertDescription className="text-green-700">
            The backend integration is working perfectly! Your Solana Pay implementation is now compliant and ready for production.
            <br />
            <strong>Next steps:</strong> Integrate this into your dashboard components.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};
