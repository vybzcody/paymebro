import { IProvider } from '@web3auth/base';
import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
export declare class MultiChainKeyService {
    private provider;
    constructor(provider: IProvider);
    /**
     * Get private key from Web3Auth provider
     */
    private getPrivateKey;
    /**
     * Get Solana account from Web3Auth private key
     */
    getSolanaAccount(): Promise<{
        address: string;
        keypair: Keypair;
    }>;
    /**
     * Get Ethereum account from Web3Auth private key
     */
    getEthereumAccount(): Promise<{
        address: string;
        wallet: ethers.Wallet;
    }>;
}
//# sourceMappingURL=MultiChainKeyService.d.ts.map