import { IProvider } from '@web3auth/base';
export declare class BalanceService {
    private provider;
    private solanaConnection;
    private priceService;
    constructor(provider: IProvider);
    /**
     * Get Solana balance with real price
     */
    getSolanaBalance(address: string): Promise<{
        balance: string;
        usdValue: string;
    }>;
    /**
     * Get Ethereum balance with real price
     */
    getEthereumBalance(address: string): Promise<{
        balance: string;
        usdValue: string;
    }>;
    /**
     * Get USDC balance on Solana
     */
    getUSDCBalance(address: string): Promise<{
        balance: string;
        usdValue: string;
    }>;
}
//# sourceMappingURL=balanceService.d.ts.map