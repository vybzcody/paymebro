import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { WEB3AUTH_NETWORK, CHAIN_NAMESPACES, IProvider } from "@web3auth/base";
import { Web3Auth } from '@web3auth/modal';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import { EthereumPrivateKeyProvider } from '@web3auth/ethereum-provider';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { CctpNetworkId } from '@/lib/cctp/types';
import { getNetworkById } from '@/lib/cctp/networks';

const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BHo_Z8iOfv-91EMkE4VRZZyd3xLSPJ8zTGGZDdaMqvVBHBSoy2KLv0te7YojcInFl_EokROy9WElMQGXVjtZBSk";

// Multi-chain configurations
const chainConfigs = {
  solana: {
    chainNamespace: CHAIN_NAMESPACES.SOLANA,
    chainId: "0x66",
    rpcTarget: import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('testnet'),
    displayName: 'Solana Testnet',
    blockExplorerUrl: 'https://explorer.solana.com?cluster=testnet',
    ticker: 'SOL',
    tickerName: 'Solana',
    logo: 'https://images.toruswallet.io/sol.svg',
  },
  ethereum: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x1",
    rpcTarget: import.meta.env.VITE_ETHEREUM_RPC_URL || 'https://mainnet.infura.io/v3/',
    displayName: 'Ethereum Mainnet',
    blockExplorerUrl: 'https://etherscan.io',
    ticker: 'ETH',
    tickerName: 'Ethereum',
    logo: 'https://images.toruswallet.io/eth.svg',
  },
  arbitrum: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0xa4b1",
    rpcTarget: import.meta.env.VITE_ARBITRUM_RPC_URL || 'https://arb1.arbitrum.io/rpc',
    displayName: 'Arbitrum One',
    blockExplorerUrl: 'https://arbiscan.io',
    ticker: 'ETH',
    tickerName: 'Ethereum',
    logo: 'https://images.toruswallet.io/arbitrum.svg',
  },
  base: {
    chainNamespace: CHAIN_NAMESPACES.EIP155,
    chainId: "0x2105",
    rpcTarget: import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org',
    displayName: 'Base',
    blockExplorerUrl: 'https://basescan.org',
    ticker: 'ETH',
    tickerName: 'Ethereum',
    logo: 'https://images.toruswallet.io/base.svg',
  }
};

// Private key providers for each chain
const privateKeyProviders = {
  solana: new SolanaPrivateKeyProvider({ config: { chainConfig: chainConfigs.solana } }),
  ethereum: new EthereumPrivateKeyProvider({ config: { chainConfig: chainConfigs.ethereum } }),
  arbitrum: new EthereumPrivateKeyProvider({ config: { chainConfig: chainConfigs.arbitrum } }),
  base: new EthereumPrivateKeyProvider({ config: { chainConfig: chainConfigs.base } }),
};

interface ChainWallet {
  provider: IProvider | null;
  address: string | null;
  balance: { native: number; usdc: number };
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
  
  // Actions
  login: () => Promise<void>;
  logout: () => Promise<void>;
  switchChain: (chainId: CctpNetworkId) => Promise<void>;
  getWalletForChain: (chainId: CctpNetworkId) => ChainWallet | null;
  
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
  const [wallets, setWallets] = useState<Record<CctpNetworkId, ChainWallet>>({
    [CctpNetworkId.SOLANA]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.ETHEREUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.ARBITRUM]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.BASE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.POLYGON]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
    [CctpNetworkId.AVALANCHE]: { provider: null, address: null, balance: { native: 0, usdc: 0 } },
  });

  const connection = useMemo(() => new Connection(chainConfigs.solana.rpcTarget, 'confirmed'), []);
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

      // Initialize wallets for all chains
      await initializeAllChainWallets(web3authProvider);

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

  const initializeAllChainWallets = async (provider: IProvider) => {
    const newWallets = { ...wallets };

    try {
      // Initialize Solana wallet
      if (provider) {
        const solanaAccounts = await provider.request({ method: 'getAccounts' }) as string[];
        if (solanaAccounts.length > 0) {
          newWallets[CctpNetworkId.SOLANA] = {
            provider,
            address: solanaAccounts[0],
            balance: { native: 0, usdc: 0 }
          };
        }
      }

      // For EVM chains, we'll derive addresses from the same private key
      // This is a simplified approach - in production, you'd want proper multi-chain derivation
      const evmChains = [CctpNetworkId.ETHEREUM, CctpNetworkId.ARBITRUM, CctpNetworkId.BASE];
      
      for (const chainId of evmChains) {
        try {
          // Get private key and derive EVM address
          const privateKey = await provider.request({ method: 'private_key' });
          if (privateKey) {
            // Derive EVM address from private key (simplified)
            const evmAddress = await deriveEVMAddress(privateKey);
            newWallets[chainId] = {
              provider: null, // Will be set when switching to this chain
              address: evmAddress,
              balance: { native: 0, usdc: 0 }
            };
          }
        } catch (error) {
          console.warn(`Failed to initialize ${chainId} wallet:`, error);
        }
      }

      setWallets(newWallets);
    } catch (error) {
      console.error('Failed to initialize chain wallets:', error);
    }
  };

  const deriveEVMAddress = async (privateKey: string): Promise<string> => {
    // Simplified EVM address derivation
    // In production, use proper cryptographic derivation
    return '0x' + privateKey.slice(-40);
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
            chainConfig: chainConfigs.solana, // Default to Solana
            privateKeyProvider: privateKeyProviders.solana,
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
          await initializeAllChainWallets(web3auth.provider);
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
    login,
    logout,
    switchChain,
    getWalletForChain,
    connection,
    publicKey,
  }), [isLoading, isInitialized, user, error, activeChain, wallets, login, logout, switchChain, getWalletForChain, connection, publicKey]);

  return (
    <MultiChainWeb3AuthContext.Provider value={contextValue}>
      {children}
    </MultiChainWeb3AuthContext.Provider>
  );
};
