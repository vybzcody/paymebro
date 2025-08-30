import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMultiChainAuth } from '@/hooks/useMultiChainAuth';
import { getSupportedNetworks } from '@/lib/cctp/networks';
import { CctpNetworkId } from '@/lib/cctp/types';
import { Wallet, ChevronDown, Copy } from 'lucide-react';
import { toast } from 'sonner';

export const ChainSwitcher: React.FC = () => {
  const { activeChain, switchChain, wallets, isAuthenticated } = useMultiChainAuth();
  const supportedNetworks = getSupportedNetworks();

  if (!isAuthenticated) {
    return null;
  }

  const activeNetwork = supportedNetworks.find(n => n.id === activeChain);
  const activeWallet = wallets[activeChain];

  const handleChainSwitch = async (chainId: string) => {
    try {
      await switchChain(chainId as CctpNetworkId);
      const network = supportedNetworks.find(n => n.id.toString() === chainId);
      toast.success(`Switched to ${network?.name}`);
    } catch (error) {
      console.error('Failed to switch chain:', error);
      toast.error('Failed to switch chain');
    }
  };

  const copyAddress = (address: string) => {
    navigator.clipboard.writeText(address);
    toast.success('Address copied to clipboard');
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeChain.toString()} onValueChange={handleChainSwitch}>
        <SelectTrigger className="w-auto min-w-[160px]">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="font-medium">{activeNetwork?.name}</span>
            {activeWallet?.address && (
              <Badge variant="secondary" className="text-xs">
                {activeWallet.address.slice(0, 4)}...{activeWallet.address.slice(-4)}
              </Badge>
            )}
          </div>
        </SelectTrigger>
        <SelectContent>
          {supportedNetworks.map((network) => {
            const wallet = wallets[network.id];
            const hasWallet = !!wallet?.address;
            
            return (
              <SelectItem key={network.id} value={network.id.toString()}>
                <div className="flex items-center justify-between w-full min-w-[200px]">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{network.name}</span>
                    <span className="text-xs text-gray-500">
                      {network.nativeCurrency.symbol}
                    </span>
                  </div>
                  {hasWallet && (
                    <div className="flex items-center gap-1">
                      <Badge variant="outline" className="text-xs">
                        {wallet.address!.slice(0, 6)}...{wallet.address!.slice(-4)}
                      </Badge>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          copyAddress(wallet.address!);
                        }}
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
};
