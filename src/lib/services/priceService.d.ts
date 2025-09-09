export interface PriceData {
    solana: {
        usd: number;
    };
    ethereum: {
        usd: number;
    };
}
export declare class PriceService {
    private static instance;
    private cachedPrices;
    private lastFetch;
    private readonly CACHE_DURATION;
    static getInstance(): PriceService;
    getPrices(): Promise<PriceData>;
    getSolanaPrice(): Promise<number>;
    getEthereumPrice(): Promise<number>;
}
//# sourceMappingURL=priceService.d.ts.map