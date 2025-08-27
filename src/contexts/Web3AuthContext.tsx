import React, { createContext, useContext, useEffect, useState, ReactNode, useMemo, useCallback } from 'react';
import { WEB3AUTH_NETWORK } from "@web3auth/base";
import { Web3Auth } from '@web3auth/modal';
import { CHAIN_NAMESPACES, IProvider, WALLET_ADAPTERS } from '@web3auth/base';
import { SolanaPrivateKeyProvider } from '@web3auth/solana-provider';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
// Configuration
const clientId = import.meta.env.VITE_WEB3AUTH_CLIENT_ID || "BHo_Z8iOfv-91EMkE4VRZZyd3xLSPJ8zTGGZDdaMqvVBHBSoy2KLv0te7YojcInFl_EokROy9WElMQGXVjtZBSk";
const solanaNetwork = import.meta.env.VITE_SOLANA_NETWORK || 'testnet';
const rpcUrl = import.meta.env.VITE_SOLANA_RPC_URL || clusterApiUrl('testnet');

// Chain configuration
const getChainId = (network: string) => {
  switch (network) {
    case 'mainnet':
      return '0x65';
    case 'testnet':
      return '0x66';
    case 'devnet':
      return '0x67';
    default:
      return '0x66';
  }
};

const chainConfig = {
  chainNamespace: CHAIN_NAMESPACES.SOLANA,
  chainId: getChainId(solanaNetwork),
  rpcTarget: rpcUrl,
  displayName: solanaNetwork === 'mainnet'
    ? 'Solana Mainnet'
    : solanaNetwork === 'testnet'
      ? 'Solana Testnet'
      : solanaNetwork === 'devnet'
        ? 'Solana Devnet'
        : 'Solana Devnet',
  blockExplorerUrl: solanaNetwork === 'mainnet'
    ? 'https://explorer.solana.com'
    : `https://explorer.solana.com?cluster=${solanaNetwork}`,
  ticker: 'SOL',
  tickerName: 'Solana',
  logo: 'https://images.toruswallet.io/sol.svg',
};

// Private key provider
const privateKeyProvider = new SolanaPrivateKeyProvider({
  config: { chainConfig }
});

// Web3Auth instance - Initialize as null first
let web3auth: Web3Auth | null = null;


interface Web3AuthContextType {
  provider: IProvider | null;
  isLoading: boolean;
  isInitialized: boolean;
  user: any;
  publicKey: PublicKey | null;
  connection: Connection;
  login: () => Promise<void>;
  logout: () => Promise<void>;
  error: string | null;
}

const Web3AuthContext = createContext<Web3AuthContextType | null>(null);

export const useWeb3Auth = () => {
  const context = useContext(Web3AuthContext);
  if (!context) {
    throw new Error('useWeb3Auth must be used within a Web3AuthProvider');
  }
  return context;
};

interface Web3AuthProviderProps {
  children: ReactNode;
}

export const Web3AuthProvider: React.FC<Web3AuthProviderProps> = ({ children }) => {
  const [provider, setProvider] = useState<IProvider | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isInitialized, setIsInitialized] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [publicKey, setPublicKey] = useState<PublicKey | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Memoize the connection to prevent infinite re-renders
  const connection = useMemo(() => new Connection(rpcUrl, 'confirmed'), []);

  const login = useCallback(async () => {
    if (!web3auth) {
      throw new Error('Web3Auth not initialized');
    }

    if (!isInitialized) {
      throw new Error('WalletInitializationError: Wallet is not ready yet, Login modal is not initialized');
    }

    try {
      setError(null);
      console.log('Starting login process...');

      const web3authProvider = await web3auth.connect();
      console.log('Web3Auth connect result:', web3authProvider);

      if (!web3authProvider) {
        throw new Error('Failed to connect wallet - no provider returned');
      }

      setProvider(web3authProvider);

      // Get user info
      const userInfo = await web3auth.getUserInfo();
      console.log('Login successful, user info:', userInfo);

      // Get accounts
      const accounts = await web3authProvider.request({
        method: 'getAccounts',
      }) as string[];

      if (accounts.length > 0) {
        const pubKey = new PublicKey(accounts[0]);
        setPublicKey(pubKey);
        console.log('Account connected:', accounts[0]);

        // Set user info
        setUser(userInfo);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Failed to connect wallet');
      throw err;
    }
  }, [isInitialized, setError, setPublicKey, setUser]);

  const logout = useCallback(async () => {
    if (!web3auth) {
      return;
    }

    try {
      setError(null);
      console.log('Logging out...');
      await web3auth.logout();
      setProvider(null);
      setUser(null);
      setPublicKey(null);
      console.log('Logout successful');
    } catch (err: any) {
      console.error('Logout error:', err);
      setError(err.message || 'Failed to logout');
      throw err;
    }
  }, [setError, setUser, setPublicKey]);

  useEffect(() => {
    const init = async () => {
      try {
        setError(null);
        console.log('Initializing Web3Auth...');

        // Initialize Web3Auth instance if not already done
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
              theme: {
                primary: '#10b981',
              },
              useLogoLoader: true,
              modalZIndex: '99999',
            },
          });
        }

        // Initialize Web3Auth Modal
        console.log('Calling web3auth.initModal()...');
        await web3auth.initModal();
        console.log('Web3Auth modal initialized successfully');

        setIsInitialized(true);

        // Check if already connected
        if (web3auth.connected && web3auth.provider) {
          console.log('User already connected, restoring session...');
          setProvider(web3auth.provider);

          try {
            const userInfo = await web3auth.getUserInfo();
            console.log('User info retrieved:', userInfo);

            // Get accounts
            const accounts = await web3auth.provider.request({
              method: 'getAccounts',
            }) as string[];

            if (accounts.length > 0) {
              const pubKey = new PublicKey(accounts[0]);
              setPublicKey(pubKey);
              console.log('Public key set:', accounts[0]);

              // Set user info
              setUser(userInfo);
            }
          } catch (err) {
            console.warn('Failed to get user info or accounts:', err);
          }
        } else {
          console.log('No existing session found');
        }
      } catch (err: any) {
        console.error('Web3Auth initialization error:', err);

        // Provide specific error messages for common issues
        if (err.message?.includes('Invalid params')) {
          setError('Web3Auth configuration error. Please check your dashboard settings at https://dashboard.web3auth.io');
        } else if (err.message?.includes('clientId')) {
          setError('Invalid Web3Auth Client ID. Please check your .env configuration.');
        } else if (err.message?.includes('network')) {
          setError('Network configuration error. Please check your Web3Auth network settings.');
        } else {
          setError(`Failed to initialize wallet connection: ${err.message}`);
        }
      } finally {
        setIsLoading(false);
      }
    };

    init();
  }, []);

  const contextValue: Web3AuthContextType = useMemo(() => ({
    provider,
    isLoading,
    isInitialized,
    user,
    publicKey,
    connection,
    login,
    logout,
    error,
  }), [provider, isLoading, isInitialized, user, publicKey, connection, login, logout, error]);

  return (
    <Web3AuthContext.Provider value={contextValue}>
      {children}
    </Web3AuthContext.Provider>
  );
};
