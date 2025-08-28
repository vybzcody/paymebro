import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign, TrendingUp, Info } from "lucide-react";
import { useCurrency } from "@/contexts/CurrencyContext";
import { useState, useEffect } from "react";

interface FeeBreakdownProps {
  merchantRevenue: number;
  platformFees: number;
  totalTransactions: number;
}

export const FeeBreakdown = ({ merchantRevenue, platformFees, totalTransactions }: FeeBreakdownProps) => {
  const { formatAmount } = useCurrency();
  const [formattedMerchant, setFormattedMerchant] = useState('$0.00');
  const [formattedFees, setFormattedFees] = useState('$0.00');

  useEffect(() => {
    const updateFormatted = async () => {
      const merchant = await formatAmount(merchantRevenue, 'USDC');
      const fees = await formatAmount(platformFees, 'USDC');
      setFormattedMerchant(merchant);
      setFormattedFees(fees);
    };
    updateFormatted();
  }, [merchantRevenue, platformFees, formatAmount]);

  const totalVolume = merchantRevenue + platformFees;
  const merchantPercentage = totalVolume > 0 ? (merchantRevenue / totalVolume) * 100 : 0;
  const feePercentage = totalVolume > 0 ? (platformFees / totalVolume) * 100 : 0;
  const avgFeePerTransaction = totalTransactions > 0 ? platformFees / totalTransactions : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <DollarSign className="h-5 w-5 mr-2" />
          Revenue Breakdown
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-600">You Receive</span>
            <span className="font-bold text-green-600">{formattedMerchant}</span>
          </div>
          <Progress value={merchantPercentage} className="h-2" />
          <div className="text-xs text-gray-500">{merchantPercentage.toFixed(1)}% of total volume</div>
        </div>

        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-600">AfriPay Fees</span>
            <span className="font-medium text-gray-600">{formattedFees}</span>
          </div>
          <Progress value={feePercentage} className="h-2 bg-gray-100" />
          <div className="text-xs text-gray-500">{feePercentage.toFixed(1)}% of total volume</div>
        </div>

        <div className="pt-3 border-t space-y-2">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Info className="h-3 w-3" />
            <span>Fee Structure: 2.9% + $0.30 per transaction</span>
          </div>
          <div className="text-xs text-gray-500">
            Average fee per transaction: ${avgFeePerTransaction.toFixed(2)}
          </div>
        </div>

        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-blue-800">
            <strong>💡 How it works:</strong> Customers pay the total amount (your price + fees). 
            You receive exactly what you charge. AfriPay handles all payment processing.
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
