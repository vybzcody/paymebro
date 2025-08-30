import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MultiChainPaymentLink } from '@/types/multichain';
import { DetectedWallet } from '@/hooks/useWalletDetection';
import { CctpNetworkId } from '@/lib/cctp/types';

interface SolanaPaymentInterfaceProps {
  paymentLink: MultiChainPaymentLink;
  detectedWallet: DetectedWallet;
}

export const SolanaPaymentInterface: React.FC<SolanaPaymentInterfaceProps> = ({
  paymentLink,
  detectedWallet
}) => {
  const requiresCCTP = paymentLink.preferredReceiveChain !== CctpNetworkId.SOLANA;

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
        {/* 
          TODO: Integrate existing Solana Pay components here
          - Use existing QR code generation
          - Use existing transaction handling
          - Add CCTP conversion if requiresCCTP is true
        */}
        <div className="text-center p-8 border-2 border-dashed border-gray-300 rounded-lg">
          <p className="text-sm text-gray-600">
            Existing Solana Pay integration goes here
          </p>
          <p className="text-xs text-gray-500 mt-2">
            Amount: ${paymentLink.amount} USDC
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
