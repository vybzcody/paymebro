import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CctpNetworkId, CctpNetworkAdapter } from '@/lib/cctp/types';
import { getNetworkById, getSupportedNetworks } from '@/lib/cctp/networks';
import { useWeb3Auth } from './Web3AuthContext';

interface MultiChainContextType {
  activeChain: CctpNetworkId;
  supportedChains: CctpNetworkAdapter[];
  switchChain: (chainId: CctpNetworkId) => Promise<void>;
  getChainBalance: (chainId: CctpNetworkId) => Promise<{ usdc: number; native: number }>;
  isChainSupported: (chainId: CctpNetworkId) => boolean;
  getActiveNetwork: () => CctpNetworkAdapter | undefined;
}

const MultiChainContext = createContext<MultiChainContextType | null>(null);

export const useMultiChain = () => {
  const context = useContext(MultiChainContext);
  if (!context) {
    throw new Error('useMultiChain must be used within a MultiChainProvider');
  }
  return context;
};

interface MultiChainProviderProps {
  children: ReactNode;
}

export const MultiChainProvider: React.FC<MultiChainProviderProps> = ({ children }) => {
  const { connection, publicKey } = useWeb3Auth();
  const [activeChain, setActiveChain] = useState<CctpNetworkId>(CctpNetworkId.SOLANA);
  
  const supportedChains = getSupportedNetworks();

  const switchChain = useCallback(async (chainId: CctpNetworkId) => {
    const network = getNetworkById(chainId);
    if (!network) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    // For now, we only support Solana natively
    // EVM chain switching would require additional wallet connections
    if (network.type === 'solana') {
      setActiveChain(chainId);
    } else {
      throw new Error('EVM chain switching not yet implemented');
    }
  }, []);

  const getChainBalance = useCallback(async (chainId: CctpNetworkId) => {
    const network = getNetworkById(chainId);
    if (!network) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    if (network.type === 'solana' && connection && publicKey) {
      try {
        // Get SOL balance
        const solBalance = await connection.getBalance(publicKey);
        const nativeBalance = solBalance / 1e9; // Convert lamports to SOL

        // Get USDC balance (placeholder - would need actual token account lookup)
        const usdcBalance = 0; // TODO: Implement USDC balance lookup

        return { usdc: usdcBalance, native: nativeBalance };
      } catch (error) {
        console.error('Failed to get Solana balance:', error);
        return { usdc: 0, native: 0 };
      }
    }

    // EVM balance lookup would go here
    return { usdc: 0, native: 0 };
  }, [connection, publicKey]);

  const isChainSupported = useCallback((chainId: CctpNetworkId) => {
    return supportedChains.some(chain => chain.id === chainId);
  }, [supportedChains]);

  const getActiveNetwork = useCallback(() => {
    return getNetworkById(activeChain);
  }, [activeChain]);

  const contextValue: MultiChainContextType = {
    activeChain,
    supportedChains,
    switchChain,
    getChainBalance,
    isChainSupported,
    getActiveNetwork,
  };

  return (
    <MultiChainContext.Provider value={contextValue}>
      {children}
    </MultiChainContext.Provider>
  );
};
