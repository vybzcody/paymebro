import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { useWalletDetection } from '@/hooks/useWalletDetection';
import { MultiChainPaymentLink } from '@/types/multichain';
import { toast } from 'sonner';

// Import existing Solana payment components
import { SolanaPaymentInterface } from './SolanaPaymentInterface';
import { EVMPaymentInterface } from './EVMPaymentInterface';
import { WalletSelector } from './WalletSelector';

export const UniversalPaymentPage: React.FC = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const detectedWallet = useWalletDetection();
  const [paymentLink, setPaymentLink] = useState<MultiChainPaymentLink | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentLink = async () => {
      if (!paymentId) return;
      
      try {
        // Fetch payment link data (extend existing API)
        const response = await fetch(`/api/payment-links/${paymentId}`);
        const data = await response.json();
        setPaymentLink(data);
      } catch (error) {
        console.error('Failed to fetch payment link:', error);
        toast.error('Payment link not found');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentLink();
  }, [paymentId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!paymentLink) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Payment Not Found</CardTitle>
            <CardDescription>This payment link is invalid or has expired.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  const renderPaymentInterface = () => {
    switch (detectedWallet.type) {
      case 'solana':
        // Use existing Solana Pay functionality
        return (
          <SolanaPaymentInterface 
            paymentLink={paymentLink}
            detectedWallet={detectedWallet}
          />
        );
      
      case 'evm':
        return (
          <EVMPaymentInterface 
            paymentLink={paymentLink}
            detectedWallet={detectedWallet}
          />
        );
      
      default:
        return (
          <WalletSelector 
            paymentLink={paymentLink}
            onWalletSelected={(type) => {
              // Refresh detection after wallet connection
              window.location.reload();
            }}
          />
        );
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md">
        <Card className="mb-4">
          <CardHeader className="text-center">
            <CardTitle>Pay with USDC</CardTitle>
            <CardDescription>
              ${paymentLink.amount} USDC
              {paymentLink.description && ` • ${paymentLink.description}`}
            </CardDescription>
          </CardHeader>
        </Card>
        
        {renderPaymentInterface()}
      </div>
    </div>
  );
};
