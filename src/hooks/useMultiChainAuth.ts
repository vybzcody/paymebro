import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { CctpNetworkId } from '@/lib/cctp/types';

/**
 * Backward-compatible auth hook that maintains existing useAuth interface
 * while providing multi-chain capabilities
 */
export const useAuth = () => {
  const {
    isLoading,
    user,
    error,
    login,
    logout,
    connection,
    publicKey,
    wallets,
    activeChain
  } = useMultiChainWeb3Auth();

  // Maintain backward compatibility
  const isAuthenticated = !!user;
  const solanaWallet = wallets[CctpNetworkId.SOLANA];

  return {
    // Existing interface (backward compatible)
    isLoading,
    isAuthenticated,
    user,
    error,
    login,
    logout,
    connection,
    publicKey,
    
    // New multi-chain capabilities
    activeChain,
    wallets,
    provider: solanaWallet?.provider || null,
  };
};

/**
 * New multi-chain specific hook
 */
export const useMultiChainAuth = () => {
  return useMultiChainWeb3Auth();
};
