import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiChainPaymentLink } from '@/types/multichain';
import { DetectedWallet } from '@/hooks/useWalletDetection';
import { CctpNetworkId } from '@/lib/cctp/types';
import { QRGenerator } from './QRGenerator';
import { usePaymentProcessor } from '@/hooks/usePaymentProcessor';
import LoadingSpinner from './LoadingSpinner';
import { CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface SolanaPaymentInterfaceProps {
  paymentLink: MultiChainPaymentLink;
  detectedWallet: DetectedWallet;
  userId: string;
}

export const SolanaPaymentInterface: React.FC<SolanaPaymentInterfaceProps> = ({
  paymentLink,
  detectedWallet,
  userId
}) => {
  const [paymentData, setPaymentData] = useState<{
    paymentId: string;
    paymentUrl: string;
    qrCodeUrl: string;
    reference: string;
    feeBreakdown: any;
  } | null>(null);

  const {
    initiatePayment,
    monitorPayment,
    isProcessing,
    isMonitoring,
    currentPayment,
    error
  } = usePaymentProcessor();

  const requiresCCTP = paymentLink.preferredReceiveChain !== CctpNetworkId.SOLANA;

  // Initialize payment on component mount
  useEffect(() => {
    const initPayment = async () => {
      if (!paymentData && paymentLink.merchantWallets.solana) {
        const result = await initiatePayment({
          userId,
          merchantWallet: paymentLink.merchantWallets.solana,
          amount: paymentLink.amount,
          currency: 'USDC',
          description: paymentLink.description || 'AfriPay Payment',
          title: paymentLink.title || 'Payment',
        });

        if (result) {
          setPaymentData(result);
        }
      }
    };

    initPayment();
  }, [paymentLink, userId, initiatePayment, paymentData]);

  // Start monitoring when payment is created
  useEffect(() => {
    if (paymentData && !isMonitoring && currentPayment?.status === 'pending') {
      monitorPayment(paymentData.paymentId);
    }
  }, [paymentData, monitorPayment, isMonitoring, currentPayment]);

  const getStatusIcon = () => {
    if (isProcessing || isMonitoring) return <LoadingSpinner />;
    if (currentPayment?.status === 'confirmed') return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (currentPayment?.status === 'failed') return <AlertCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = () => {
    if (isProcessing) return 'Creating payment...';
    if (isMonitoring) return 'Monitoring for payment...';
    if (currentPayment?.status === 'confirmed') return 'Payment confirmed!';
    if (currentPayment?.status === 'failed') return 'Payment failed';
    if (currentPayment?.status === 'expired') return 'Payment expired';
    return 'Waiting for payment';
  };

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-5 h-5" />
            Payment Error
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="mt-4"
            variant="outline"
          >
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!paymentData) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Creating Payment...</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <LoadingSpinner />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Pay with {detectedWallet.name}</span>
          {getStatusIcon()}
        </CardTitle>
        <CardDescription>
          {requiresCCTP
            ? `Payment will be automatically converted to ${paymentLink.preferredReceiveChain}`
            : 'Direct Solana payment'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="text-center">
            <QRGenerator
              value={paymentData.paymentUrl}
              size={200}
              title={`Pay $${paymentLink.amount} USDC`}
            />
          </div>

          <div className="text-center space-y-2">
            <p className="font-medium">${paymentLink.amount} USDC</p>
            <p className="text-sm text-gray-600">
              {paymentLink.description || 'Scan with your Solana wallet'}
            </p>

            {/* Payment Status */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-center gap-2">
                {getStatusIcon()}
                <span className="text-sm font-medium">{getStatusText()}</span>
              </div>

              {currentPayment?.signature && (
                <p className="text-xs text-gray-500 mt-1">
                  Tx: {currentPayment.signature.slice(0, 8)}...{currentPayment.signature.slice(-8)}
                </p>
              )}
            </div>

            {/* Fee Breakdown */}
            {paymentData.feeBreakdown && (
              <div className="p-3 bg-blue-50 rounded-lg text-sm">
                <div className="flex justify-between">
                  <span>Amount:</span>
                  <span>${paymentData.feeBreakdown.originalAmount}</span>
                </div>
                <div className="flex justify-between">
                  <span>AfriPay Fee:</span>
                  <span>${paymentData.feeBreakdown.afripayFee.toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-medium border-t pt-1">
                  <span>Total:</span>
                  <span>${paymentData.feeBreakdown.total.toFixed(2)}</span>
                </div>
              </div>
            )}

            {requiresCCTP && (
              <div className="p-3 bg-blue-50 rounded-lg">
                <p className="text-sm text-blue-800">
                  🔄 This payment will be automatically converted from Solana to{' '}
                  {paymentLink.preferredReceiveChain} for the merchant using Circle's CCTP.
                </p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
