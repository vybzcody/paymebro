import { IProvider } from '@web3auth/base';
import { getED25519Key } from '@web3auth/solana-provider';
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
   */
  async getSolanaAccount(): Promise<{ address: string; keypair: Keypair }> {
    try {
      const ethPrivateKey = await this.getPrivateKey();
      const privateKey = getED25519Key(ethPrivateKey).sk.toString('hex');
      const secretKey = new Uint8Array(Buffer.from(privateKey, 'hex'));
      const keypair = Keypair.fromSecretKey(secretKey);
      
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
      const privateKey = await this.getPrivateKey();
      const wallet = new ethers.Wallet(privateKey);
      
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
    switch (chainId) {
      case CctpNetworkId.SOLANA:
        const solanaAccount = await this.getSolanaAccount();
        return {
          address: solanaAccount.address,
          signer: solanaAccount.keypair
        };

      case CctpNetworkId.ETHEREUM:
      case CctpNetworkId.ARBITRUM:
      case CctpNetworkId.BASE:
      case CctpNetworkId.POLYGON:
      case CctpNetworkId.AVALANCHE:
        const ethAccount = await this.getEthereumAccount();
        return {
          address: ethAccount.address,
          signer: ethAccount.wallet
        };

      default:
        throw new Error(`Unsupported chain: ${chainId}`);
    }
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
