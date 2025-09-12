export class PriceService {
    constructor() {
        Object.defineProperty(this, "cachedPrices", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: null
        });
        Object.defineProperty(this, "lastFetch", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 0
        });
        Object.defineProperty(this, "CACHE_DURATION", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: 5 * 60 * 1000
        }); // 5 minutes
    }
    static getInstance() {
        if (!PriceService.instance) {
            PriceService.instance = new PriceService();
        }
        return PriceService.instance;
    }
    async getPrices() {
        const now = Date.now();
        // Return cached prices if still valid
        if (this.cachedPrices && (now - this.lastFetch) < this.CACHE_DURATION) {
            return this.cachedPrices;
        }
        try {
            // Use CoinGecko free API (no rate limiting for basic usage)
            const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd', {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                }
            });
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            const data = await response.json();
            this.cachedPrices = data;
            this.lastFetch = now;
            return data;
        }
        catch (error) {
            console.warn('Failed to fetch prices from CoinGecko:', error);
            // Return fallback prices if API fails
            const fallbackPrices = {
                solana: { usd: 200 },
                ethereum: { usd: 2500 }
            };
            return this.cachedPrices || fallbackPrices;
        }
    }
    async getSolanaPrice() {
        const prices = await this.getPrices();
        return prices.solana?.usd || 200;
    }
    async getEthereumPrice() {
        const prices = await this.getPrices();
        return prices.ethereum?.usd || 2500;
    }
}
