import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiChainPaymentLink } from '@/types/multichain';
import { DetectedWallet } from '@/hooks/useWalletDetection';
import { CctpNetworkId } from '@/lib/cctp/types';
import { QRGenerator } from './QRGenerator';

interface SolanaPaymentInterfaceProps {
  paymentLink: MultiChainPaymentLink;
  detectedWallet: DetectedWallet;
}

export const SolanaPaymentInterface: React.FC<SolanaPaymentInterfaceProps> = ({
  paymentLink,
  detectedWallet
}) => {
  const requiresCCTP = paymentLink.preferredReceiveChain !== CctpNetworkId.SOLANA;

  // Create Solana Pay URL for existing QR component
  const solanaPayUrl = `solana:${paymentLink.merchantWallets.solana || 'placeholder'}?amount=${paymentLink.amount}&spl-token=EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v&reference=${paymentLink.id}`;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Pay with {detectedWallet.name}</span>
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
              value={solanaPayUrl}
              size={200}
              title={`Pay $${paymentLink.amount} USDC`}
            />
          </div>
          
          <div className="text-center space-y-2">
            <p className="font-medium">${paymentLink.amount} USDC</p>
            <p className="text-sm text-gray-600">
              {paymentLink.description || 'Scan with your Solana wallet'}
            </p>
            
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
