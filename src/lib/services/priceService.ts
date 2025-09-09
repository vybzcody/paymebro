export interface PriceData {
  solana: { usd: number };
  ethereum: { usd: number };
}

export class PriceService {
  private static instance: PriceService;
  private cachedPrices: PriceData | null = null;
  private lastFetch: number = 0;
  private readonly CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

  static getInstance(): PriceService {
    if (!PriceService.instance) {
      PriceService.instance = new PriceService();
    }
    return PriceService.instance;
  }

  async getPrices(): Promise<PriceData> {
    const now = Date.now();
    
    // Return cached prices if still valid
    if (this.cachedPrices && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.cachedPrices;
    }

    try {
      // Use CoinGecko free API (no rate limiting for basic usage)
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,ethereum&vs_currencies=usd',
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      
      this.cachedPrices = data;
      this.lastFetch = now;
      
      return data;
    } catch (error) {
      console.warn('Failed to fetch prices from CoinGecko:', error);
      
      // Return fallback prices if API fails
      const fallbackPrices: PriceData = {
        solana: { usd: 200 },
        ethereum: { usd: 2500 }
      };
      
      return this.cachedPrices || fallbackPrices;
    }
  }

  async getSolanaPrice(): Promise<number> {
    const prices = await this.getPrices();
    return prices.solana?.usd || 200;
  }

  async getEthereumPrice(): Promise<number> {
    const prices = await this.getPrices();
    return prices.ethereum?.usd || 2500;
  }
}
