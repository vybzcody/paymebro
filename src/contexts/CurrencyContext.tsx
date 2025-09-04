import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { priceService } from '@/services/priceService';

type DisplayCurrency = 'USD' | 'SOL' | 'USDC';

interface CurrencyContextType {
  displayCurrency: DisplayCurrency;
  setDisplayCurrency: (currency: DisplayCurrency) => void;
  convertAmount: (amount: number, fromCurrency: 'SOL' | 'USDC') => Promise<number>;
  formatAmount: (amount: number, fromCurrency: 'SOL' | 'USDC') => Promise<string>;
  solPrice: number;
  usdcPrice: number;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider = ({ children }: { children: ReactNode }) => {
  const [displayCurrency, setDisplayCurrency] = useState<DisplayCurrency>('USD');
  const [solPrice, setSolPrice] = useState(100);
  const [usdcPrice, setUsdcPrice] = useState(1);

  useEffect(() => {
    const updatePrices = async () => {
      const [sol, usdc] = await Promise.all([
        priceService.getSOLPrice(),
        priceService.getUSDCPrice()
      ]);
      setSolPrice(sol);
      setUsdcPrice(usdc);
    };

    updatePrices();
    const interval = setInterval(updatePrices, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, []);

  const convertAmount = async (amount: number, fromCurrency: 'SOL' | 'USDC'): Promise<number> => {
    if (displayCurrency === 'USD') {
      return await priceService.convertToUSD(amount, fromCurrency);
    } else if (displayCurrency === fromCurrency) {
      return amount;
    } else if (displayCurrency === 'SOL' && fromCurrency === 'USDC') {
      return await priceService.convertUSDCToSOL(amount);
    } else if (displayCurrency === 'USDC' && fromCurrency === 'SOL') {
      return await priceService.convertSOLToUSDC(amount);
    }
    return amount;
  };

  const formatAmount = async (amount: number, fromCurrency: 'SOL' | 'USDC'): Promise<string> => {
    const convertedAmount = await convertAmount(amount, fromCurrency);
    
    if (displayCurrency === 'USD') {
      return `$${convertedAmount.toFixed(2)}`;
    } else if (displayCurrency === 'SOL') {
      return `${convertedAmount.toFixed(4)} SOL`;
    } else {
      return `${convertedAmount.toFixed(2)} USDC`;
    }
  };

  return (
    <CurrencyContext.Provider value={{
      displayCurrency,
      setDisplayCurrency,
      convertAmount,
      formatAmount,
      solPrice,
      usdcPrice
    }}>
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within CurrencyProvider');
  }
  return context;
};
