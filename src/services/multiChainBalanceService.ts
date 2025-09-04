/**
 * Multi-Chain Balance Service - Real-time balance tracking across all supported chains
 */

import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { CctpNetworkId } from '@/lib/cctp/types';

export interface ChainBalance {
  chainId: CctpNetworkId;
  chainName: string;
  nativeToken: {
    symbol: string;
    balance: number;
    usdValue: number;
  };
  usdc: {
    balance: number;
    usdValue: number;
  };
  totalUsdValue: number;
  lastUpdated: string;
}

export interface MultiChainBalances {
  [chainId: string]: ChainBalance;
}

/**
 * Chain configurations for balance fetching
 */
const CHAIN_CONFIGS = {
  [CctpNetworkId.SOLANA]: {
    name: 'Solana',
    nativeSymbol: 'SOL',
    rpcUrl: import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com',
    usdcMint: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU', // Devnet USDC
  },
  [CctpNetworkId.ETHEREUM]: {
    name: 'Ethereum',
    nativeSymbol: 'ETH',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_KEY',
    usdcAddress: '0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238', // Sepolia USDC
  },
  [CctpNetworkId.ARBITRUM]: {
    name: 'Arbitrum',
    nativeSymbol: 'ETH',
    rpcUrl: 'https://sepolia-rollup.arbitrum.io/rpc',
    usdcAddress: '0x75faf114eafb1BDbe2F0316DF893fd58CE46AA4d', // Arbitrum Sepolia USDC
  },
  [CctpNetworkId.BASE]: {
    name: 'Base',
    nativeSymbol: 'ETH',
    rpcUrl: 'https://sepolia.base.org',
    usdcAddress: '0x036CbD53842c5426634e7929541eC2318f3dCF7e', // Base Sepolia USDC
  },
  [CctpNetworkId.POLYGON]: {
    name: 'Polygon',
    nativeSymbol: 'MATIC',
    rpcUrl: 'https://rpc-mumbai.maticvigil.com',
    usdcAddress: '0x9999f7Fea5938fD3b1E26A12c3f2fb024e194f97', // Mumbai USDC
  },
  [CctpNetworkId.AVALANCHE]: {
    name: 'Avalanche',
    nativeSymbol: 'AVAX',
    rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
    usdcAddress: '0x5425890298aed601595a70AB815c96711a31Bc65', // Fuji USDC
  },
};

/**
 * Multi-Chain Balance Service Class
 */
export class MultiChainBalanceService {
  private priceCache: { [symbol: string]: number } = {};
  private lastPriceUpdate = 0;
  private readonly PRICE_CACHE_DURATION = 60000; // 1 minute

  /**
   * Fetch balances for all chains for a given set of wallet addresses
   */
  async getAllBalances(walletAddresses: {
    [chainId in CctpNetworkId]?: string;
  }): Promise<MultiChainBalances> {
    const balances: MultiChainBalances = {};
    
    // Update price cache if needed
    await this.updatePriceCache();

    // Fetch balances for each chain in parallel
    const balancePromises = Object.entries(walletAddresses).map(async ([chainId, address]) => {
      if (!address) return null;
      
      try {
        const balance = await this.getChainBalance(chainId as CctpNetworkId, address);
        return { chainId, balance };
      } catch (error) {
        console.error(`Failed to fetch balance for ${chainId}:`, error);
        return { chainId, balance: this.getEmptyBalance(chainId as CctpNetworkId) };
      }
    });

    const results = await Promise.all(balancePromises);
    
    results.forEach(result => {
      if (result) {
        balances[result.chainId] = result.balance;
      }
    });

    return balances;
  }

  /**
   * Fetch balance for a specific chain
   */
  async getChainBalance(chainId: CctpNetworkId, address: string): Promise<ChainBalance> {
    const config = CHAIN_CONFIGS[chainId];
    if (!config) {
      throw new Error(`Unsupported chain: ${chainId}`);
    }

    let nativeBalance = 0;
    let usdcBalance = 0;

    if (chainId === CctpNetworkId.SOLANA) {
      const balances = await this.getSolanaBalances(address);
      nativeBalance = balances.native;
      usdcBalance = balances.usdc;
    } else {
      const balances = await this.getEVMBalances(chainId, address);
      nativeBalance = balances.native;
      usdcBalance = balances.usdc;
    }

    // Calculate USD values
    const nativePrice = this.priceCache[config.nativeSymbol] || 0;
    const usdcPrice = this.priceCache['USDC'] || 1;

    const nativeUsdValue = nativeBalance * nativePrice;
    const usdcUsdValue = usdcBalance * usdcPrice;

    return {
      chainId,
      chainName: config.name,
      nativeToken: {
        symbol: config.nativeSymbol,
        balance: nativeBalance,
        usdValue: nativeUsdValue,
      },
      usdc: {
        balance: usdcBalance,
        usdValue: usdcUsdValue,
      },
      totalUsdValue: nativeUsdValue + usdcUsdValue,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Fetch Solana balances (SOL + USDC)
   */
  private async getSolanaBalances(address: string): Promise<{ native: number; usdc: number }> {
    try {
      const connection = new Connection(CHAIN_CONFIGS[CctpNetworkId.SOLANA].rpcUrl);
      const publicKey = new PublicKey(address);

      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceFormatted = solBalance / 1e9;

      // Get USDC balance (simplified - in production would need proper SPL token parsing)
      // For now, return 0 as placeholder
      const usdcBalance = 0;

      return {
        native: solBalanceFormatted,
        usdc: usdcBalance,
      };
    } catch (error) {
      console.error('Error fetching Solana balances:', error);
      return { native: 0, usdc: 0 };
    }
  }

  /**
   * Fetch EVM chain balances (Native token + USDC)
   */
  private async getEVMBalances(chainId: CctpNetworkId, address: string): Promise<{ native: number; usdc: number }> {
    try {
      const config = CHAIN_CONFIGS[chainId];
      const provider = new ethers.JsonRpcProvider(config.rpcUrl);

      // Get native token balance
      const nativeBalance = await provider.getBalance(address);
      const nativeBalanceFormatted = parseFloat(ethers.formatEther(nativeBalance));

      // Get USDC balance
      let usdcBalance = 0;
      try {
        const usdcContract = new ethers.Contract(
          config.usdcAddress,
          ['function balanceOf(address) view returns (uint256)'],
          provider
        );
        
        const usdcBalanceRaw = await usdcContract.balanceOf(address);
        usdcBalance = parseFloat(ethers.formatUnits(usdcBalanceRaw, 6));
      } catch (usdcError) {
        console.warn(`Failed to fetch USDC balance for ${chainId}:`, usdcError);
      }

      return {
        native: nativeBalanceFormatted,
        usdc: usdcBalance,
      };
    } catch (error) {
      console.error(`Error fetching ${chainId} balances:`, error);
      return { native: 0, usdc: 0 };
    }
  }

  /**
   * Update price cache from CoinGecko
   */
  private async updatePriceCache(): Promise<void> {
    const now = Date.now();
    if (now - this.lastPriceUpdate < this.PRICE_CACHE_DURATION) {
      return; // Cache still valid
    }

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum,matic-network,avalanche-2,usd-coin&vs_currencies=usd'
      );
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      const data = await response.json();
      
      this.priceCache = {
        'SOL': data.solana?.usd || 0,
        'ETH': data.ethereum?.usd || 0,
        'MATIC': data['matic-network']?.usd || 0,
        'AVAX': data['avalanche-2']?.usd || 0,
        'USDC': data['usd-coin']?.usd || 1,
      };
      
      this.lastPriceUpdate = now;
    } catch (error) {
      console.error('Failed to update price cache:', error);
      // Use fallback prices if API fails
      this.priceCache = {
        'SOL': 100,
        'ETH': 2500,
        'MATIC': 0.8,
        'AVAX': 25,
        'USDC': 1,
      };
    }
  }

  /**
   * Get empty balance structure for a chain
   */
  private getEmptyBalance(chainId: CctpNetworkId): ChainBalance {
    const config = CHAIN_CONFIGS[chainId];
    return {
      chainId,
      chainName: config.name,
      nativeToken: {
        symbol: config.nativeSymbol,
        balance: 0,
        usdValue: 0,
      },
      usdc: {
        balance: 0,
        usdValue: 0,
      },
      totalUsdValue: 0,
      lastUpdated: new Date().toISOString(),
    };
  }

  /**
   * Calculate total portfolio value across all chains
   */
  calculateTotalPortfolioValue(balances: MultiChainBalances): {
    totalUsdValue: number;
    totalNativeValue: number;
    totalUsdcValue: number;
    chainBreakdown: Array<{
      chainName: string;
      percentage: number;
      usdValue: number;
    }>;
  } {
    const totalUsdValue = Object.values(balances).reduce(
      (sum, balance) => sum + balance.totalUsdValue,
      0
    );

    const totalNativeValue = Object.values(balances).reduce(
      (sum, balance) => sum + balance.nativeToken.usdValue,
      0
    );

    const totalUsdcValue = Object.values(balances).reduce(
      (sum, balance) => sum + balance.usdc.usdValue,
      0
    );

    const chainBreakdown = Object.values(balances)
      .map(balance => ({
        chainName: balance.chainName,
        percentage: totalUsdValue > 0 ? (balance.totalUsdValue / totalUsdValue) * 100 : 0,
        usdValue: balance.totalUsdValue,
      }))
      .sort((a, b) => b.usdValue - a.usdValue);

    return {
      totalUsdValue,
      totalNativeValue,
      totalUsdcValue,
      chainBreakdown,
    };
  }
}

// Export singleton instance
export const multiChainBalanceService = new MultiChainBalanceService();
