import { IProvider } from '@web3auth/base';
import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
import { CctpNetworkId } from '@/lib/cctp/types';

export class MultiChainKeyService {
  private provider: IProvider;

  constructor(provider: IProvider) {
    this.provider = provider;
  }

  /**
   * Get private key from Web3Auth provider
   */
  private async getPrivateKey(): Promise<string> {
    return await this.provider.request({ method: 'private_key' }) as string;
  }

  /**
   * Get Solana account from Web3Auth private key
   * Using direct private key approach since getED25519Key is not available in our version
   */
  async getSolanaAccount(): Promise<{ address: string; keypair: Keypair }> {
    try {
      const privateKeyHex = await this.getPrivateKey();
      
      // Convert hex private key to Uint8Array for Solana
      // Remove '0x' prefix if present
      const cleanHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
      
      // Take first 32 bytes for Solana private key
      const privateKeyBytes = new Uint8Array(Buffer.from(cleanHex.slice(0, 64), 'hex'));
      
      // Create Solana keypair
      const keypair = Keypair.fromSeed(privateKeyBytes);
      
      return {
        address: keypair.publicKey.toBase58(),
        keypair
      };
    } catch (error) {
      console.error('Failed to get Solana account:', error);
      throw error;
    }
  }

  /**
   * Get Ethereum account from Web3Auth private key
   */
  async getEthereumAccount(): Promise<{ address: string; wallet: ethers.Wallet }> {
    try {
      const privateKeyHex = await this.getPrivateKey();
      
      // Remove '0x' prefix if present
      const cleanHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
      
      // Take only the first 64 characters (32 bytes) for Ethereum private key
      const ethPrivateKey = cleanHex.slice(0, 64);
      
      // Add 0x prefix for ethers.js
      const formattedPrivateKey = `0x${ethPrivateKey}`;
      
      // Validate private key length (should be 66 chars with 0x prefix)
      if (formattedPrivateKey.length !== 66) {
        throw new Error(`Invalid private key length after formatting: ${formattedPrivateKey.length}`);
      }
      
      const wallet = new ethers.Wallet(formattedPrivateKey);
      
      return {
        address: wallet.address,
        wallet
      };
    } catch (error) {
      console.error('Failed to get Ethereum account:', error);
      throw error;
    }
  }

  /**
   * Get account for any supported chain
   */
  async getAccountForChain(chainId: CctpNetworkId): Promise<{ address: string; signer?: any }> {
    console.log('Getting account for chain:', chainId, 'type:', typeof chainId);
    
    // Handle Solana (string enum)
    if (chainId === CctpNetworkId.SOLANA || chainId === 'solana') {
      const solanaAccount = await this.getSolanaAccount();
      return {
        address: solanaAccount.address,
        signer: solanaAccount.keypair
      };
    }

    // Handle EVM chains (numeric enums)
    if (chainId === CctpNetworkId.ETHEREUM || chainId === 1 ||
        chainId === CctpNetworkId.ARBITRUM || chainId === 42161 ||
        chainId === CctpNetworkId.BASE || chainId === 8453 ||
        chainId === CctpNetworkId.POLYGON || chainId === 137 ||
        chainId === CctpNetworkId.AVALANCHE || chainId === 43114) {
      const ethAccount = await this.getEthereumAccount();
      return {
        address: ethAccount.address,
        signer: ethAccount.wallet
      };
    }

    throw new Error(`Unsupported chain: ${chainId} (type: ${typeof chainId})`);
  }

  /**
   * Get all accounts for supported chains
   */
  async getAllAccounts(): Promise<Record<CctpNetworkId, string>> {
    const accounts: Partial<Record<CctpNetworkId, string>> = {};

    try {
      // Get Solana account
      const solanaAccount = await this.getSolanaAccount();
      accounts[CctpNetworkId.SOLANA] = solanaAccount.address;

      // Get Ethereum account (same for all EVM chains)
      const ethAccount = await this.getEthereumAccount();
      accounts[CctpNetworkId.ETHEREUM] = ethAccount.address;
      accounts[CctpNetworkId.ARBITRUM] = ethAccount.address;
      accounts[CctpNetworkId.BASE] = ethAccount.address;
      accounts[CctpNetworkId.POLYGON] = ethAccount.address;
      accounts[CctpNetworkId.AVALANCHE] = ethAccount.address;

    } catch (error) {
      console.error('Failed to get all accounts:', error);
    }

    return accounts as Record<CctpNetworkId, string>;
  }
}
