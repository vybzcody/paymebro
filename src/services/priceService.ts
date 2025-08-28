interface PriceData {
  solana: { usd: number };
  'usd-coin': { usd: number };
}

class PriceService {
  private prices: PriceData | null = null;
  private lastFetch = 0;
  private readonly CACHE_DURATION = 60000; // 1 minute

  async getPrices(): Promise<PriceData> {
    const now = Date.now();
    
    if (this.prices && (now - this.lastFetch) < this.CACHE_DURATION) {
      return this.prices;
    }

    try {
      const response = await fetch(
        'https://api.coingecko.com/api/v3/simple/price?ids=solana,usd-coin&vs_currencies=usd'
      );
      
      if (!response.ok) throw new Error('Failed to fetch prices');
      
      this.prices = await response.json();
      this.lastFetch = now;
      
      return this.prices!;
    } catch (error) {
      console.error('Price fetch failed:', error);
      // Fallback prices
      return {
        solana: { usd: 100 },
        'usd-coin': { usd: 1 }
      };
    }
  }

  async convertToUSD(amount: number, currency: 'SOL' | 'USDC'): Promise<number> {
    const prices = await this.getPrices();
    
    if (currency === 'SOL') {
      return amount * prices.solana.usd;
    } else {
      return amount * prices['usd-coin'].usd;
    }
  }

  async convertSOLToUSDC(solAmount: number): Promise<number> {
    const prices = await this.getPrices();
    const usdValue = solAmount * prices.solana.usd;
    return usdValue / prices['usd-coin'].usd;
  }

  async convertUSDCToSOL(usdcAmount: number): Promise<number> {
    const prices = await this.getPrices();
    const usdValue = usdcAmount * prices['usd-coin'].usd;
    return usdValue / prices.solana.usd;
  }

  async getSOLPrice(): Promise<number> {
    const prices = await this.getPrices();
    return prices.solana.usd;
  }

  async getUSDCPrice(): Promise<number> {
    const prices = await this.getPrices();
    return prices['usd-coin'].usd;
  }
}

export const priceService = new PriceService();
