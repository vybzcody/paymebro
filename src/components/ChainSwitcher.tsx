import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useMultiChainAuth } from '@/hooks/useMultiChainAuth';
import { getSupportedNetworks } from '@/lib/cctp/networks';
import { CctpNetworkId } from '@/lib/cctp/types';
import { Wallet, ChevronDown } from 'lucide-react';

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
    } catch (error) {
      console.error('Failed to switch chain:', error);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Select value={activeChain.toString()} onValueChange={handleChainSwitch}>
        <SelectTrigger className="w-auto min-w-[140px]">
          <div className="flex items-center gap-2">
            <Wallet className="h-4 w-4" />
            <span className="font-medium">{activeNetwork?.name}</span>
          </div>
        </SelectTrigger>
        <SelectContent>
          {supportedNetworks.map((network) => {
            const wallet = wallets[network.id];
            const hasWallet = !!wallet?.address;
            
            return (
              <SelectItem key={network.id} value={network.id.toString()}>
                <div className="flex items-center justify-between w-full">
                  <div className="flex items-center gap-2">
                    <span>{network.name}</span>
                    {hasWallet && (
                      <Badge variant="secondary" className="text-xs">
                        Connected
                      </Badge>
                    )}
                  </div>
                  <span className="text-xs text-gray-500">
                    {network.nativeCurrency.symbol}
                  </span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {activeWallet?.address && (
        <div className="text-xs text-gray-600">
          {activeWallet.address.slice(0, 6)}...{activeWallet.address.slice(-4)}
        </div>
      )}
    </div>
  );
};
