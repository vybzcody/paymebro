import { useState, useEffect } from 'react';
import { User } from '@/schema';
import { appConfig } from '@/lib/config';

interface Web3AuthUser {
  sub: string;
  email: string;
  name: string;
  picture: string;
  solanaAddress: string;
  ethereumAddress: string;
}

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const login = async (): Promise<{ user: User; isNewUser: boolean }> => {
    setIsLoading(true);
    try {
      // TODO: Implement real Web3Auth integration
      // For now, using mock user data for testing
      const mockWeb3AuthUser: Web3AuthUser = {
        sub: "mock_user_123",
        email: "user@example.com",
        name: "John Doe",
        picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        solanaAddress: "GDBPQ6G7k9xMFcmz2GqEgmcesC6DRzeWQPfRPk1hQNBo",
        ethereumAddress: "0x09aB514B6974601967E7b379478EFf4073cceD06"
      };
      
      const result = await autoRegister(mockWeb3AuthUser);
      setUser(result.user);
      setIsAuthenticated(true);
      return result;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    // TODO: Implement real Web3Auth logout
    setUser(null);
    setIsAuthenticated(false);
  };

  const autoRegister = async (web3AuthUser: Web3AuthUser): Promise<{ user: User; isNewUser: boolean }> => {
    try {
      // Check if user exists first
      const response = await fetch(`${appConfig.apiUrl}/api/users/profile/${web3AuthUser.sub}`, {
        headers: {
          'ngrok-skip-browser-warning': 'true'
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        if (userData.success) {
          return { user: userData.user, isNewUser: false };
        }
      }

      // TODO: Implement user registration for new users
      throw new Error('User not found. Registration flow needs to be implemented.');
    } catch (error) {
      console.error('Auto-registration failed:', error);
      throw error;
    }
  };

  return {
    user,
    isLoading,
    isAuthenticated,
    login,
    logout,
    setUser
  };
};
