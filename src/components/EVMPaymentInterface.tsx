import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiChainPaymentLink } from '@/types/multichain';
import { DetectedWallet } from '@/hooks/useWalletDetection';
import { CctpNetworkId } from '@/lib/cctp/types';
import { getNetworkById } from '@/lib/cctp/networks';
import { toast } from 'sonner';

interface EVMPaymentInterfaceProps {
  paymentLink: MultiChainPaymentLink;
  detectedWallet: DetectedWallet;
}

export const EVMPaymentInterface: React.FC<EVMPaymentInterfaceProps> = ({
  paymentLink,
  detectedWallet
}) => {
  const [selectedChain, setSelectedChain] = useState<CctpNetworkId>(CctpNetworkId.ETHEREUM);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableChains = paymentLink.acceptedChains.filter(
    chainId => getNetworkById(chainId)?.type === 'evm'
  );

  const requiresCCTP = selectedChain !== paymentLink.preferredReceiveChain;

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      if (!window.ethereum) {
        throw new Error('No Ethereum wallet found');
      }

      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (!accounts.length) {
        throw new Error('No accounts available');
      }

      // TODO: Implement EVM USDC payment
      // 1. Check USDC balance
      // 2. Approve USDC spend if needed
      // 3. Execute payment transaction
      // 4. If requiresCCTP, initiate CCTP transfer
      
      toast.success('Payment initiated!');
      
    } catch (error) {
      console.error('Payment failed:', error);
      toast.error(error instanceof Error ? error.message : 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span>Pay with {detectedWallet.name}</span>
        </CardTitle>
        <CardDescription>
          Select your preferred network to pay with USDC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium">Payment Network</label>
          <Select value={selectedChain} onValueChange={(value) => setSelectedChain(value as CctpNetworkId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableChains.map((chainId) => {
                const network = getNetworkById(chainId);
                return network ? (
                  <SelectItem key={chainId} value={chainId.toString()}>
                    {network.name}
                  </SelectItem>
                ) : null;
              })}
            </SelectContent>
          </Select>
        </div>

        {requiresCCTP && (
          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              Your payment will be automatically converted from {getNetworkById(selectedChain)?.name} to{' '}
              {getNetworkById(paymentLink.preferredReceiveChain)?.name} for the merchant.
            </p>
          </div>
        )}

        <div className="border rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="font-medium">Amount:</span>
            <span>${paymentLink.amount} USDC</span>
          </div>
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Network:</span>
            <span>{getNetworkById(selectedChain)?.name}</span>
          </div>
        </div>

        <Button 
          onClick={handlePayment} 
          className="w-full" 
          disabled={isProcessing}
        >
          {isProcessing ? 'Processing...' : `Pay $${paymentLink.amount} USDC`}
        </Button>
      </CardContent>
    </Card>
  );
};
