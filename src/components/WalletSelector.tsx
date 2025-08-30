import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MultiChainPaymentLink } from '@/types/multichain';
import { Wallet, ExternalLink } from 'lucide-react';

interface WalletSelectorProps {
  paymentLink: MultiChainPaymentLink;
  onWalletSelected: (type: 'solana' | 'evm') => void;
}

export const WalletSelector: React.FC<WalletSelectorProps> = ({
  paymentLink,
  onWalletSelected
}) => {
  const hasSolanaChains = paymentLink.acceptedChains.includes('solana' as any);
  const hasEVMChains = paymentLink.acceptedChains.some(chain => 
    ['ethereum', 'arbitrum', 'base', 'polygon', 'avalanche'].includes(chain.toString())
  );

  return (
    <Card>
      <CardHeader className="text-center">
        <CardTitle className="flex items-center justify-center gap-2">
          <Wallet className="h-5 w-5" />
          Connect Wallet
        </CardTitle>
        <CardDescription>
          Choose your preferred wallet to pay ${paymentLink.amount} USDC
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasSolanaChains && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Solana Wallets</h4>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open('https://phantom.app/', '_blank')}
            >
              <span>Phantom Wallet</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open('https://solflare.com/', '_blank')}
            >
              <span>Solflare Wallet</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        {hasEVMChains && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-700">Ethereum Wallets</h4>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open('https://metamask.io/', '_blank')}
            >
              <span>MetaMask</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              className="w-full justify-between"
              onClick={() => window.open('https://www.coinbase.com/wallet', '_blank')}
            >
              <span>Coinbase Wallet</span>
              <ExternalLink className="h-4 w-4" />
            </Button>
          </div>
        )}

        <div className="pt-4 border-t">
          <p className="text-xs text-gray-500 text-center">
            After installing a wallet, refresh this page to continue with your payment.
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
