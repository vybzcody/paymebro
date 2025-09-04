/**
 * React hook for real-time multi-chain balance tracking
 */

import { useState, useEffect, useCallback } from 'react';
import { multiChainBalanceService, MultiChainBalances, ChainBalance } from '@/services/multiChainBalanceService';
import { CctpNetworkId } from '@/lib/cctp/types';

export interface UseMultiChainBalancesReturn {
  balances: MultiChainBalances;
  totalPortfolioValue: {
    totalUsdValue: number;
    totalNativeValue: number;
    totalUsdcValue: number;
    chainBreakdown: Array<{
      chainName: string;
      percentage: number;
      usdValue: number;
    }>;
  };
  isLoading: boolean;
  error: string | null;
  refreshBalances: () => Promise<void>;
  getChainBalance: (chainId: CctpNetworkId) => ChainBalance | null;
  lastUpdated: string | null;
}

/**
 * Hook for multi-chain balance tracking with real-time updates
 */
export const useMultiChainBalances = (
  walletAddresses: { [chainId in CctpNetworkId]?: string },
  options?: {
    refreshInterval?: number; // milliseconds
    autoRefresh?: boolean;
  }
): UseMultiChainBalancesReturn => {
  const [balances, setBalances] = useState<MultiChainBalances>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  const refreshInterval = options?.refreshInterval || 30000; // 30 seconds default
  const autoRefresh = options?.autoRefresh !== false; // true by default

  /**
   * Fetch balances for all chains
   */
  const refreshBalances = useCallback(async () => {
    // Skip if no wallet addresses provided
    if (!Object.values(walletAddresses).some(addr => addr)) {
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const newBalances = await multiChainBalanceService.getAllBalances(walletAddresses);
      setBalances(newBalances);
      setLastUpdated(new Date().toISOString());
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch balances';
      setError(errorMessage);
      console.error('Balance refresh failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [walletAddresses]);

  /**
   * Get balance for specific chain
   */
  const getChainBalance = useCallback((chainId: CctpNetworkId): ChainBalance | null => {
    return balances[chainId] || null;
  }, [balances]);

  /**
   * Calculate total portfolio value
   */
  const totalPortfolioValue = multiChainBalanceService.calculateTotalPortfolioValue(balances);

  // Initial load and auto-refresh setup
  useEffect(() => {
    refreshBalances();

    if (autoRefresh) {
      const interval = setInterval(refreshBalances, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [refreshBalances, autoRefresh, refreshInterval]);

  // Refresh when wallet addresses change
  useEffect(() => {
    refreshBalances();
  }, [walletAddresses, refreshBalances]);

  return {
    balances,
    totalPortfolioValue,
    isLoading,
    error,
    refreshBalances,
    getChainBalance,
    lastUpdated,
  };
};
