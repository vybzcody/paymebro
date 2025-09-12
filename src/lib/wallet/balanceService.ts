import { IProvider } from '@web3auth/base';
import { Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { ethers, BrowserProvider, formatEther } from 'ethers';
import { PriceService } from '@/lib/services/priceService';

const USDC_MINT = new PublicKey('Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr');

export class BalanceService {
  private provider: IProvider;
  private solanaConnection: Connection;
  private priceService: PriceService;

  constructor(provider: IProvider) {
    this.provider = provider;
    this.solanaConnection = new Connection('https://api.devnet.solana.com');
    this.priceService = PriceService.getInstance();
  }

  /**
   * Get Solana balance with real price
   */
  async getSolanaBalance(address: string): Promise<{ balance: string; usdValue: string }> {
    try {
      const [balance, solPrice] = await Promise.all([
        this.solanaConnection.getBalance(new PublicKey(address)),
        this.priceService.getSolanaPrice()
      ]);
      
      const solBalance = balance / LAMPORTS_PER_SOL;
      const usdValue = (solBalance * solPrice).toFixed(2);
      
      return {
        balance: solBalance.toFixed(4),
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('Failed to get Solana balance:', error);
      return { balance: '0.0000', usdValue: '$0.00' };
    }
  }

  /**
   * Get Ethereum balance with real price
   */
  async getEthereumBalance(address: string): Promise<{ balance: string; usdValue: string }> {
    try {
      const ethProvider = new BrowserProvider(this.provider as any);
      
      const [balance, ethPrice] = await Promise.all([
        ethProvider.getBalance(address),
        this.priceService.getEthereumPrice()
      ]);
      
      const ethBalance = parseFloat(formatEther(balance));
      const usdValue = (ethBalance * ethPrice).toFixed(2);
      
      return {
        balance: ethBalance.toFixed(4),
        usdValue: `$${usdValue}`
      };
    } catch (error) {
      console.error('Failed to get Ethereum balance:', error);
      return { balance: '0.0000', usdValue: '$0.00' };
    }
  }

  /**
   * Get USDC balance on Solana
   */
  async getUSDCBalance(address: string): Promise<{ balance: string; usdValue: string }> {
    try {
      const ownerPublicKey = new PublicKey(address);
      const associatedTokenAddress = await getAssociatedTokenAddress(
        USDC_MINT,
        ownerPublicKey
      );

      const tokenAccount = await getAccount(
        this.solanaConnection,
        associatedTokenAddress
      );

      // USDC has 6 decimals
      const usdcBalance = Number(tokenAccount.amount) / Math.pow(10, 6);
      
      return {
        balance: usdcBalance.toFixed(2),
        usdValue: `$${usdcBalance.toFixed(2)}`
      };
    } catch (error) {
      // Token account might not exist if no USDC received yet
      console.log('USDC token account not found or empty:', error instanceof Error ? error.message : String(error));
      return { balance: '0.00', usdValue: '$0.00' };
    }
  }
}
