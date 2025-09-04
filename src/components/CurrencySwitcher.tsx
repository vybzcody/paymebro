import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DollarSign, Coins } from "lucide-react";
import { useCurrency } from '@/contexts/CurrencyContext';

export const CurrencySwitcher = () => {
  const { displayCurrency, setDisplayCurrency, solPrice, usdcPrice } = useCurrency();

  return (
    <Select value={displayCurrency} onValueChange={setDisplayCurrency}>
      <SelectTrigger className="w-32">
        <div className="flex items-center gap-2">
          {displayCurrency === 'USD' ? (
            <DollarSign className="h-4 w-4" />
          ) : (
            <Coins className="h-4 w-4" />
          )}
          <SelectValue />
        </div>
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="USD">
          <div className="flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            USD
          </div>
        </SelectItem>
        <SelectItem value="SOL">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            SOL (${solPrice.toFixed(0)})
          </div>
        </SelectItem>
        <SelectItem value="USDC">
          <div className="flex items-center gap-2">
            <Coins className="h-4 w-4" />
            USDC (${usdcPrice.toFixed(2)})
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
