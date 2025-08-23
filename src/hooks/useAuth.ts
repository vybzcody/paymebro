import { useState, useEffect } from 'react';
import { useWeb3Auth } from '../contexts/Web3AuthContext';

interface AuthUser {
  id: string;
  email?: string;
  name?: string;
  profileImage?: string;
  walletAddress: string;
}

export const useAuth = () => {
  const { 
    user: web3User, 
    publicKey, 
    login: web3Login, 
    logout: web3Logout, 
    isLoading: web3Loading,
    isInitialized,
    error: web3Error
  } = useWeb3Auth();
  
  const [user, setUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Sync Web3Auth user with our auth state
  useEffect(() => {
    if (web3User && publicKey) {
      setUser({
        id: web3User.id || publicKey.toString(),
        email: web3User.email,
        name: web3User.name,
        profileImage: web3User.profileImage,
        walletAddress: publicKey.toString(),
      });
      setError(null);
    } else {
      setUser(null);
    }
  }, [web3User?.id, web3User?.email, publicKey?.toString()]);

  // Sync errors
  useEffect(() => {
    setError(web3Error);
  }, [web3Error]);

  const login = async () => {
    try {
      setError(null);
      await web3Login();
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to connect wallet';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await web3Logout();
      setUser(null);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to logout';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  return {
    user,
    isLoading: web3Loading,
    isInitialized,
    error,
    login,
    logout,
    isAuthenticated: !!user,
    walletAddress: publicKey?.toString() || null,
  };
};
