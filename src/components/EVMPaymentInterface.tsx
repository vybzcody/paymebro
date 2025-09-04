import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { MultiChainPaymentLink } from '@/types/multichain';
import { DetectedWallet } from '@/hooks/useWalletDetection';
import { CctpNetworkId } from '@/lib/cctp/types';
import { findNetworkAdapter } from '@/lib/cctp/networks';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { ethers } from 'ethers';
import { toast } from 'sonner';

interface EVMPaymentInterfaceProps {
  paymentLink: MultiChainPaymentLink;
  detectedWallet: DetectedWallet;
}

export const EVMPaymentInterface: React.FC<EVMPaymentInterfaceProps> = ({
  paymentLink,
  detectedWallet
}) => {
  const { keyService } = useMultiChainWeb3Auth();
  const [selectedChain, setSelectedChain] = useState<CctpNetworkId>(CctpNetworkId.ETHEREUM);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableChains = paymentLink.acceptedChains.filter(
    chainId => findNetworkAdapter(chainId)?.type === 'evm'
  );

  const requiresCCTP = selectedChain !== paymentLink.preferredReceiveChain;

  const handlePayment = async () => {
    if (!keyService) {
      toast.error('Wallet not connected');
      return;
    }

    setIsProcessing(true);
    
    try {
      // Get recipient address for the selected chain
      const recipientAddress = paymentLink.merchantWallets[selectedChain];
      if (!recipientAddress) {
        throw new Error(`No recipient address for ${selectedChain}`);
      }

      // Get user's account for this chain
      const userAccount = await keyService.getAccountForChain(selectedChain);
      
      // Get network configuration
      const network = findNetworkAdapter(selectedChain);
      if (!network || network.type !== 'evm') {
        throw new Error(`Unsupported network: ${selectedChain}`);
      }

      // Create provider and signer
      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      const signer = userAccount.signer.connect(provider);

      // USDC contract
      const usdcContract = new ethers.Contract(
        network.usdcAddress,
        [
          'function balanceOf(address) view returns (uint256)',
          'function transfer(address to, uint256 amount) returns (bool)',
        ],
        signer
      );

      // Check USDC balance
      const balance = await usdcContract.balanceOf(userAccount.address);
      const requiredAmount = ethers.parseUnits(paymentLink.amount.toString(), 6); // USDC has 6 decimals
      
      if (balance < requiredAmount) {
        throw new Error('Insufficient USDC balance');
      }

      // Execute USDC transfer
      const tx = await usdcContract.transfer(recipientAddress, requiredAmount);
      await tx.wait();
      
      toast.success(`Payment of ${paymentLink.amount} USDC sent successfully!`);
      
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
                const network = findNetworkAdapter(chainId);
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
              Your payment will be automatically converted from {findNetworkAdapter(selectedChain)?.name} to{' '}
              {findNetworkAdapter(paymentLink.preferredReceiveChain)?.name} for the merchant.
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
            <span>{findNetworkAdapter(selectedChain)?.name}</span>
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
