import { useState, useEffect } from 'react';

export type WalletType = 'solana' | 'evm' | 'none';

export interface DetectedWallet {
  type: WalletType;
  name?: string;
  isInstalled: boolean;
}

export const useWalletDetection = () => {
  const [detectedWallet, setDetectedWallet] = useState<DetectedWallet>({
    type: 'none',
    isInstalled: false
  });

  useEffect(() => {
    const detectWallets = () => {
      // Check for Solana wallets first (existing functionality)
      if (typeof window !== 'undefined') {
        if (window.solana?.isPhantom) {
          setDetectedWallet({
            type: 'solana',
            name: 'Phantom',
            isInstalled: true
          });
          return;
        }
        
        if (window.solflare?.isSolflare) {
          setDetectedWallet({
            type: 'solana', 
            name: 'Solflare',
            isInstalled: true
          });
          return;
        }

        // Check for EVM wallets
        if (window.ethereum) {
          const provider = window.ethereum;
          let walletName = 'Unknown';
          
          if (provider.isMetaMask) walletName = 'MetaMask';
          else if (provider.isCoinbaseWallet) walletName = 'Coinbase Wallet';
          else if (provider.isRabby) walletName = 'Rabby';
          
          setDetectedWallet({
            type: 'evm',
            name: walletName,
            isInstalled: true
          });
          return;
        }

        // No wallet detected
        setDetectedWallet({
          type: 'none',
          isInstalled: false
        });
      }
    };

    detectWallets();
    
    // Listen for wallet installations
    const handleWalletChange = () => detectWallets();
    window.addEventListener('ethereum#initialized', handleWalletChange);
    
    return () => {
      window.removeEventListener('ethereum#initialized', handleWalletChange);
    };
  }, []);

  return detectedWallet;
};
