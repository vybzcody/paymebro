import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, ArrowRight } from 'lucide-react';
import { simpleCCTPService, CCTPTransfer, CHAINS } from '@/lib/cctp/simple-cctp';
import { CctpNetworkId, CHAIN_TO_CHAIN_NAME } from '@/lib/cctp/types';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';

export function SimpleCCTPWidget() {
  const { wallets } = useMultiChainWeb3Auth();
  const [transfer, setTransfer] = useState<CCTPTransfer | null>(null);
  const [amount, setAmount] = useState('10');
  const [sourceChain, setSourceChain] = useState<CctpNetworkId>(CctpNetworkId.SOLANA);
  const [destinationChain, setDestinationChain] = useState<CctpNetworkId>(CctpNetworkId.ETHEREUM);
  const [isProcessing, setIsProcessing] = useState(false);

  const availableChains = [
    CctpNetworkId.SOLANA,
    CctpNetworkId.ETHEREUM,
    CctpNetworkId.ARBITRUM,
    CctpNetworkId.BASE,
    CctpNetworkId.POLYGON,
    CctpNetworkId.AVALANCHE
  ];

  const handleTransfer = async () => {
    if (!amount || sourceChain === destinationChain) return;
    
    // Get wallet addresses from multi-chain service
    const sourceWallet = wallets[sourceChain];
    const destWallet = wallets[destinationChain];
    
    console.log('Wallet check:', {
      sourceChain,
      destinationChain,
      sourceWallet: sourceWallet?.address,
      destWallet: destWallet?.address,
      allWallets: Object.keys(wallets).reduce((acc, key) => {
        acc[key] = wallets[key as CctpNetworkId]?.address || 'not connected';
        return acc;
      }, {} as Record<string, string>)
    });
    
    if (!sourceWallet?.address) {
      console.error(`Source wallet not connected for ${sourceChain}`);
      return;
    }
    
    if (!destWallet?.address) {
      console.error(`Destination wallet not connected for ${destinationChain}`);
      return;
    }
    
    setIsProcessing(true);
    
    try {
      const newTransfer = await simpleCCTPService.createTransfer({
        sourceChain,
        destinationChain,
        amount: parseFloat(amount)
      });
      
      setTransfer(newTransfer);
      
      // Pass actual wallet addresses to executeBurn
      const burnTxHash = await simpleCCTPService.executeBurn(newTransfer, {
        sourceAddress: sourceWallet.address,
        destinationAddress: destWallet.address
      });
      
      await simpleCCTPService.monitorTransfer(newTransfer, burnTxHash, (status) => {
        setTransfer(prev => prev ? { ...prev, status, burnTxHash } : null);
      });
    } catch (error) {
      console.error('Transfer failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Cross-Chain USDC Transfer</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">From</label>
          <Select value={sourceChain} onValueChange={(value) => setSourceChain(value as CctpNetworkId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableChains.map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {CHAIN_TO_CHAIN_NAME[chain]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-center">
          <ArrowRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">To</label>
          <Select value={destinationChain} onValueChange={(value) => setDestinationChain(value as CctpNetworkId)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {availableChains.filter(chain => chain !== sourceChain).map((chain) => (
                <SelectItem key={chain} value={chain}>
                  {CHAIN_TO_CHAIN_NAME[chain]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Amount (USDC)"
        />

        {transfer && (
          <div className="p-3 bg-muted rounded-lg">
            <Badge className={transfer.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'}>
              {transfer.status === 'completed' ? <CheckCircle className="w-4 h-4 mr-1" /> : <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
              {transfer.status}
            </Badge>
            <p className="text-sm mt-2">{transfer.amount} USDC</p>
          </div>
        )}

        <Button 
          onClick={handleTransfer} 
          disabled={isProcessing || sourceChain === destinationChain || !amount} 
          className="w-full"
        >
          {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
          Start Transfer
        </Button>
      </CardContent>
    </Card>
  );
}
