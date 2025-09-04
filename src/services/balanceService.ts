import { Connection, PublicKey } from '@solana/web3.js';
import { ethers } from 'ethers';
import { CctpNetworkId, findNetworkAdapter } from '@/lib/cctp/types';

/**
 * Service for fetching balances across different chains
 */
export class BalanceService {
  /**
   * Fetch SOL and USDC balance on Solana
   */
  static async getSolanaBalance(address: string): Promise<{ native: number; usdc: number }> {
    try {
      const connection = new Connection(
        import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com'
      );
      
      const publicKey = new PublicKey(address);
      
      // Get SOL balance
      const solBalance = await connection.getBalance(publicKey);
      const solBalanceFormatted = solBalance / 1e9; // Convert lamports to SOL
      
      // Get USDC balance (simplified - would need SPL token account parsing in production)
      const usdcBalance = 0; // TODO: Implement SPL token balance fetching
      
      return {
        native: solBalanceFormatted,
        usdc: usdcBalance
      };
    } catch (error) {
      console.error('Error fetching Solana balance:', error);
      return { native: 0, usdc: 0 };
    }
  }

  /**
   * Fetch ETH and USDC balance on EVM chains
   */
  static async getEVMBalance(address: string, chainId: CctpNetworkId): Promise<{ native: number; usdc: number }> {
    try {
      const network = findNetworkAdapter(chainId);
      if (!network) {
        throw new Error(`Unsupported chain: ${chainId}`);
      }

      const provider = new ethers.JsonRpcProvider(network.rpcUrl);
      
      // Get native token balance (ETH, MATIC, etc.)
      const nativeBalance = await provider.getBalance(address);
      const nativeBalanceFormatted = parseFloat(ethers.formatEther(nativeBalance));
      
      // Get USDC balance
      const usdcContract = new ethers.Contract(
        network.usdcAddress,
        ['function balanceOf(address) view returns (uint256)'],
        provider
      );
      
      const usdcBalance = await usdcContract.balanceOf(address);
      const usdcBalanceFormatted = parseFloat(ethers.formatUnits(usdcBalance, 6)); // USDC has 6 decimals
      
      return {
        native: nativeBalanceFormatted,
        usdc: usdcBalanceFormatted
      };
    } catch (error) {
      console.error(`Error fetching ${chainId} balance:`, error);
      return { native: 0, usdc: 0 };
    }
  }

  /**
   * Fetch balance for any supported chain
   */
  static async getBalanceForChain(address: string, chainId: CctpNetworkId): Promise<{ native: number; usdc: number }> {
    if (chainId === CctpNetworkId.SOLANA || chainId === 'solana') {
      return this.getSolanaBalance(address);
    }
    
    // Handle EVM chains
    if ([CctpNetworkId.ETHEREUM, CctpNetworkId.ARBITRUM, CctpNetworkId.BASE, 
         CctpNetworkId.POLYGON, CctpNetworkId.AVALANCHE].includes(chainId as any)) {
      return this.getEVMBalance(address, chainId);
    }
    
    throw new Error(`Unsupported chain: ${chainId}`);
  }
}
