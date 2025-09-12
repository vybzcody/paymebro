import { Keypair } from '@solana/web3.js';
import { ethers } from 'ethers';
export class MultiChainKeyService {
    constructor(provider) {
        Object.defineProperty(this, "provider", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.provider = provider;
    }
    /**
     * Get private key from Web3Auth provider
     */
    async getPrivateKey() {
        return await this.provider.request({ method: 'private_key' });
    }
    /**
     * Get Solana account from Web3Auth private key
     */
    async getSolanaAccount() {
        try {
            const privateKeyHex = await this.getPrivateKey();
            // Convert hex private key to Uint8Array for Solana
            const cleanHex = privateKeyHex.startsWith('0x') ? privateKeyHex.slice(2) : privateKeyHex;
            // Take first 32 bytes for Solana private key
            const privateKeyBytes = new Uint8Array(Buffer.from(cleanHex.slice(0, 64), 'hex'));
            // Create Solana keypair
            const keypair = Keypair.fromSeed(privateKeyBytes);
            return {
                address: keypair.publicKey.toBase58(),
                keypair
            };
        }
        catch (error) {
            console.error('Failed to get Solana account:', error);
            throw error;
        }
    }
    /**
     * Get Ethereum account from Web3Auth private key
     */
    async getEthereumAccount() {
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
        }
        catch (error) {
            console.error('Failed to get Ethereum account:', error);
            throw error;
        }
    }
}
