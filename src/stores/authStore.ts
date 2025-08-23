import { create } from 'zustand';
import { devtools, persist, createJSONStorage } from 'zustand/middleware';
import { PublicKey } from '@solana/web3.js';

export interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  walletAddress: string;
}

interface AuthState {
  // Auth state
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  
  // Wallet state
  publicKey: PublicKey | null;
  walletAddress: string | null;
  
  // Actions
  setUser: (user: AuthUser | null) => void;
  setLoading: (loading: boolean) => void;
  setInitialized: (initialized: boolean) => void;
  setError: (error: string | null) => void;
  setPublicKey: (publicKey: PublicKey | null) => void;
  setWalletAddress: (address: string | null) => void;
  
  // Auth actions
  login: () => void;
  logout: () => void;
  
  // Reset state
  reset: () => void;
}

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  isInitialized: false,
  error: null,
  publicKey: null,
  walletAddress: null,
};

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,
        
        // State setters
        setUser: (user) => 
          set((state) => ({ 
            user, 
            isAuthenticated: !!user,
            walletAddress: user?.walletAddress || null 
          }), false, 'setUser'),
          
        setLoading: (isLoading) => 
          set({ isLoading }, false, 'setLoading'),
          
        setInitialized: (isInitialized) => 
          set({ isInitialized }, false, 'setInitialized'),
          
        setError: (error) => 
          set({ error }, false, 'setError'),
          
        setPublicKey: (publicKey) => 
          set({ 
            publicKey,
            walletAddress: publicKey?.toString() || null 
          }, false, 'setPublicKey'),
          
        setWalletAddress: (walletAddress) => 
          set({ walletAddress }, false, 'setWalletAddress'),
        
        // Auth actions (these will be overridden by Web3Auth context)
        login: () => {
          console.warn('Login action not implemented. This should be overridden by Web3AuthContext.');
        },
        
        logout: () => {
          set({ 
            user: null, 
            isAuthenticated: false,
            publicKey: null,
            walletAddress: null,
            error: null 
          }, false, 'logout');
        },
        
        // Reset all state
        reset: () => 
          set(initialState, false, 'reset'),
      }),
      {
        name: 'afripay-auth-store',
        storage: createJSONStorage(() => sessionStorage),
        // Only persist user data, not loading/error states
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          walletAddress: state.walletAddress,
        }),
        // Always start with loading state when app starts
        onRehydrateStorage: () => (state) => {
          if (state) {
            state.isLoading = true;
            state.isInitialized = false;
            state.error = null;
          }
        },
      }
    ),
    { name: 'auth-store' }
  )
);

// Selector hooks for better performance
export const useAuth = () => useAuthStore((state) => ({
  user: state.user,
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  isInitialized: state.isInitialized,
  error: state.error,
  publicKey: state.publicKey,
  walletAddress: state.walletAddress,
  login: state.login,
  logout: state.logout,
}));

export const useAuthActions = () => useAuthStore((state) => ({
  setUser: state.setUser,
  setLoading: state.setLoading,
  setInitialized: state.setInitialized,
  setError: state.setError,
  setPublicKey: state.setPublicKey,
  setWalletAddress: state.setWalletAddress,
  login: state.login,
  logout: state.logout,
  reset: state.reset,
}));

export const useAuthStatus = () => useAuthStore((state) => ({
  isAuthenticated: state.isAuthenticated,
  isLoading: state.isLoading,
  isInitialized: state.isInitialized,
  error: state.error,
}));
