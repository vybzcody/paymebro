import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { getSupportedNetworks } from '@/lib/cctp/networks';
import { CctpNetworkId } from '@/lib/cctp/types';
import { createPaymentLink } from '@/services/businessService';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { toast } from 'sonner';

export const MultiChainPaymentForm: React.FC = () => {
  const { user } = useMultiChainWeb3Auth();
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [preferredChain, setPreferredChain] = useState<CctpNetworkId>(CctpNetworkId.SOLANA);
  const [acceptedChains, setAcceptedChains] = useState<CctpNetworkId[]>([
    CctpNetworkId.SOLANA,
    CctpNetworkId.ETHEREUM,
    CctpNetworkId.ARBITRUM
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const supportedNetworks = getSupportedNetworks();

  const handleChainToggle = (chainId: CctpNetworkId, checked: boolean) => {
    if (checked) {
      setAcceptedChains(prev => [...prev, chainId]);
    } else {
      setAcceptedChains(prev => prev.filter(id => id !== chainId));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.id || !title || !amount) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (acceptedChains.length === 0) {
      toast.error('Please select at least one accepted chain');
      return;
    }

    setIsLoading(true);
    
    try {
      const paymentLink = await createPaymentLink(
        user.id,
        title,
        parseFloat(amount),
        'USDC',
        {
          preferredReceiveChain: preferredChain,
          acceptedChains: acceptedChains.map(id => id.toString()),
          merchantWallets: {
            // TODO: Get actual wallet addresses from user profile
            [preferredChain]: 'placeholder-address'
          }
        }
      );

      toast.success('Multi-chain payment link created!');
      
      // Reset form
      setTitle('');
      setAmount('');
      
    } catch (error) {
      console.error('Failed to create payment link:', error);
      toast.error('Failed to create payment link');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle>Create Multi-Chain Payment Link</CardTitle>
        <CardDescription>
          Accept USDC payments from multiple blockchains with automatic conversion
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Payment Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Coffee Payment"
                required
              />
            </div>
            
            <div>
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="10.00"
                required
              />
            </div>
          </div>

          <div>
            <Label>Preferred Receive Chain</Label>
            <Select value={preferredChain} onValueChange={(value) => setPreferredChain(value as CctpNetworkId)}>
              <SelectTrigger>
                <SelectValue placeholder="Where do you want to receive USDC?" />
              </SelectTrigger>
              <SelectContent>
                {supportedNetworks.map((network) => (
                  <SelectItem key={network.id} value={network.id.toString()}>
                    {network.name} - {network.nativeCurrency.symbol}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-gray-600 mt-1">
              Payments from other chains will be automatically converted to this chain
            </p>
          </div>

          <div>
            <Label>Accepted Payment Chains</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {supportedNetworks.map((network) => (
                <div key={network.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={network.id.toString()}
                    checked={acceptedChains.includes(network.id)}
                    onCheckedChange={(checked) => handleChainToggle(network.id, checked as boolean)}
                  />
                  <Label htmlFor={network.id.toString()} className="text-sm">
                    {network.name}
                  </Label>
                </div>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Customers can pay from any of these chains
            </p>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Multi-Chain Payment Link'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};
