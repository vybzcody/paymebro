import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { Web3Auth } from '@web3auth/modal';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { CctpNetworkId } from '@/lib/cctp/types';
import { getNetworkById } from '@/lib/cctp/networks';
import { MultiChainKeyService } from '@/services/multiChainKeyService';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BHo_Z8iOfv-91EMkE4VRZZyd3xLSPJ8zTGGZDdaMqvVBHBSoy2KLv0te7YojcInFl_EokROy9WElMQGXVjtZBSk";

// Solana configuration (primary chain)
const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: "0x66",
  rpcTarget: import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('testnet'),
  displayName: 'Solana Testnet',
  blockExplorerUrl: 'https://explorer.solana.com?cluster=testnet',
  ticker: 'SOL',
  tickerName: 'Solana',
  logo: 'https://images.toruswallet.io/sol.svg',
};

const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig }
});

interface ChainWallet {
  provider: IProvider | null;
  address: string | null;
  balance: { native: number; usdc: number };
  signer?: any; // Chain-specific signer (Keypair for Solana, Wallet for EVM)
}

interface MultiChainWeb3AuthContextType {
  // Core Web3Auth
  isLoading: boolean;
  isInitialized: boolean;
  user: any;
  error: string | null;
  
  // Multi-chain state
  activeChain: CctpNetworkId;
  wallets: Record<CctpNetworkId, ChainWallet>;
  keyService: MultiChainKeyService | null;
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  switchChain: (chainId: CctpNetworkId) => Promise<void>;
  getWalletForChain: (chainId: CctpNetworkId) => ChainWallet | null;
  refreshBalances: () => Promise<void>;
  
  // Solana specific (backward compatibility)
  connection: Connection;
  publicKey: PublicKey | null;
}

const MultiChainWeb3AuthContext = createContext<MultiChainWeb3AuthContextType | null>(null);

export const useMultiChainWeb3Auth = () => {
  const context = useContext(MultiChainWeb3AuthContext);
  if (!context) {
    throw new Error('useMultiChainWeb3Auth must be used within a MultiChainWeb3AuthProvider');
  }
  return context;
};

let web3auth: Web3Auth | null = null;

interface MultiChainWeb3AuthProviderProps {
  children: ReactNode;
}

export const MultiChainWeb3AuthProvider: React.FC<MultiChainWeb3AuthProviderProps> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [activeChain, setActiveChain] = useState<CctpNetworkId>(CctpNetworkId.SOLANA);
  const [keyService, setKeyService] = useState<MultiChainKeyService | null>(null);
  const [wallets, setWallets] = useState<Record<CctpNetworkId, ChainWallet>>({
    [CctpNetworkId.SOLANA]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.ETHEREUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.ARBITRUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.BASE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.POLYGON]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.AVALANCHE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
  });

  const connection = useMemo(() => new Connection(chainConfig.rpcTarget, 'confirmed'), []);
  const publicKey = useMemo(() => {
    const solanaWallet = wallets[CctpNetworkId.SOLANA];
    return solanaWallet.address ? new PublicKey(solanaWallet.address) : null;
  }, [wallets]);

  const login = useCallback(async () => {
    if (!web3auth || !isInitialized) {
      throw new Error('Web3Auth not initialized');
    }

    try {
      setError(null);
      console.log('Starting multi-chain login...');

      const web3authProvider = await web3auth.connect();
      if (!web3authProvider) {
        throw new Error('Failed to connect wallet');
      }

      // Get user info
      const userInfo = await web3auth.getUserInfo();
      setUser(userInfo);

      // Initialize key service
      const keyServiceInstance = new MultiChainKeyService(web3authProvider);
      setKeyService(keyServiceInstance);

      // Initialize wallets for all chains
      await initializeAllChainWallets(web3authProvider, keyServiceInstance);

      console.log('Multi-chain login successful');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  }, [isInitialized]);

  const logout = useCallback(async () => {
    if (!web3auth) return;

    try {
      setError(null);
      await web3auth.logout();
      setUser(null);
      setKeyService(null);
      setWallets({
        [CctpNetworkId.SOLANA]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
        [CctpNetworkId.ETHEREUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
        [CctpNetworkId.ARBITRUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
        [CctpNetworkId.BASE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
        [CctpNetworkId.POLYGON]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
        [CctpNetworkId.AVALANCHE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
      });
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
    }
  }, []);

  const switchChain = useCallback(async (chainId: CctpNetworkId) => {
    const network = getNetworkById(chainId);
    if (!network) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    setActiveChain(chainId);
    console.log(`Switched to ${network.name}`);
  }, []);

  const getWalletForChain = useCallback((chainId: CctpNetworkId) => {
    return wallets[chainId] || null;
  }, [wallets]);

  const refreshBalances = useCallback(async () => {
    if (!keyService) return;

    // TODO: Implement balance fetching for each chain
    console.log('Refreshing balances for all chains...');
  }, [keyService]);

  const initializeAllChainWallets = async (provider: IProvider, keyServiceInstance: MultiChainKeyService) => {
    try {
      console.log('Initializing wallets for all chains...');
      
      // Get all accounts using proper key derivation
      const accounts = await keyServiceInstance.getAllAccounts();
      
      const newWallets = { ...wallets };

      // Initialize each chain wallet
      for (const [chainId, address] of Object.entries(accounts)) {
        if (address) {
          const chainKey = chainId as CctpNetworkId;
          const { signer } = await keyServiceInstance.getAccountForChain(chainKey);
          
          newWallets[chainKey] = {
            provider: chainKey === CctpNetworkId.SOLANA ? provider : null,
            address,
            balance: { native: 0, usdc: 0 },
            signer
          };
          
          console.log(`Initialized ${chainKey} wallet: ${address.slice(0, 8)}...`);
        }
      }

      setWallets(newWallets);
      console.log('All chain wallets initialized successfully');
    } catch (error) {
      console.error('Failed to initialize chain wallets:', error);
      setError('Failed to initialize multi-chain wallets');
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        console.log('Initializing Multi-Chain Web3Auth...');

        if (!web3auth) {
          web3auth = new Web3Auth({
            clientId,
            web3AuthNetwork: WEB3AUTH_NETWORK.SAPPHIRE_DEVNET,
            chainConfig,
            privateKeyProvider,
            uiConfig: {
              appName: 'AfriPay',
              appUrl: import.meta.env.VITE_APP_URL || 'http://localhost:8080',
              logoLight: 'https://web3auth.io/images/web3authlog.png',
              logoDark: 'https://web3auth.io/images/web3authlogodark.png',
              defaultLanguage: 'en',
              mode: 'light',
              theme: { primary: '#10b981' },
              useLogoLoader: true,
              modalZIndex: '99999',
            },
          });
        }

        await web3auth.initModal();
        setIsInitialized(true);

        // Check if already connected
        if (web3auth.connected && web3auth.provider) {
          console.log('Restoring multi-chain session...');
          const userInfo = await web3auth.getUserInfo();
          setUser(userInfo);
          
          const keyServiceInstance = new MultiChainKeyService(web3auth.provider);
          setKeyService(keyServiceInstance);
          
          await initializeAllChainWallets(web3auth.provider, keyServiceInstance);
        }

      } catch (err: any) {
        console.error('Multi-chain Web3Auth initialization error:', err);
        setError(`Failed to initialize multi-chain wallet: ${err.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const contextValue: MultiChainWeb3AuthContextType = useMemo(() => ({
    isLoading,
    isInitialized,
    user,
    error,
    activeChain,
    wallets,
    keyService,
    login,
    logout,
    switchChain,
    getWalletForChain,
    refreshBalances,
    connection,
    publicKey,
  }), [isLoading, isInitialized, user, error, activeChain, wallets, keyService, login, logout, switchChain, getWalletForChain, refreshBalances, connection, publicKey]);

  return (
    <MultiChainWeb3AuthContext.Provider value={contextValue}>
      {children}
    </MultiChainWeb3AuthContext.Provider>
  );
};
