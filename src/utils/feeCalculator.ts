export interface PricingTier {
  id: string;
  name: string;
  monthlyFee: number;
  transactionFee: number; // Percentage
  monthlyLimit: number;
  features: string[];
}

export const PRICING_TIERS: PricingTier[] = [
  {
    id: 'free',
    name: 'Free',
    monthlyFee: 0,
    transactionFee: 2.9,
    monthlyLimit: 50,
    features: ['Basic dashboard', 'Email support', 'Standard QR codes']
  },
  {
    id: 'starter',
    name: 'Starter',
    monthlyFee: 15,
    transactionFee: 2.4,
    monthlyLimit: 1000,
    features: ['Advanced analytics', 'Priority support', 'Custom branding']
  },
  {
    id: 'business',
    name: 'Business',
    monthlyFee: 49,
    transactionFee: 1.9,
    monthlyLimit: 10000,
    features: ['API access', 'White-label', 'Multi-user accounts']
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    monthlyFee: 149,
    transactionFee: 1.4,
    monthlyLimit: 100000,
    features: ['Custom integrations', 'Dedicated support', 'SLA guarantee']
  }
];

export interface FeeCalculation {
  originalAmount: number;
  platformFee: number;
  merchantReceives: number;
  feePercentage: number;
}

export class FeeCalculator {
  private tier: PricingTier;

  constructor(tierId: string) {
    const tier = PRICING_TIERS.find(t => t.id === tierId);
    if (!tier) {
      throw new Error(`Invalid pricing tier: ${tierId}`);
    }
    this.tier = tier;
  }

  calculateTransactionFee(amount: number): FeeCalculation {
    const feePercentage = this.tier.transactionFee;
    const platformFee = (amount * feePercentage) / 100;
    const merchantReceives = amount - platformFee;

    return {
      originalAmount: amount,
      platformFee: Math.round(platformFee * 100) / 100, // Round to 2 decimals
      merchantReceives: Math.round(merchantReceives * 100) / 100,
      feePercentage
    };
  }

  getMonthlyFee(): number {
    return this.tier.monthlyFee;
  }

  getTier(): PricingTier {
    return this.tier;
  }

  canProcessTransaction(currentMonthlyTransactions: number): boolean {
    return currentMonthlyTransactions < this.tier.monthlyLimit;
  }

  getTransactionsRemaining(currentMonthlyTransactions: number): number {
    return Math.max(0, this.tier.monthlyLimit - currentMonthlyTransactions);
  }
}

// Usage examples:
export const calculateFeesForTransaction = (
  amount: number, 
  userTier: string = 'free'
): FeeCalculation => {
  const calculator = new FeeCalculator(userTier);
  return calculator.calculateTransactionFee(amount);
};

// Batch calculation for multiple transactions
export const calculateMonthlyFees = (
  transactions: Array<{ amount: number; date: Date }>,
  userTier: string = 'free'
): {
  totalRevenue: number;
  totalFees: number;
  merchantTotal: number;
  transactionCount: number;
  monthlySubscription: number;
  grandTotal: number;
} => {
  const calculator = new FeeCalculator(userTier);
  
  let totalRevenue = 0;
  let totalFees = 0;
  let merchantTotal = 0;

  transactions.forEach(transaction => {
    const calculation = calculator.calculateTransactionFee(transaction.amount);
    totalRevenue += calculation.originalAmount;
    totalFees += calculation.platformFee;
    merchantTotal += calculation.merchantReceives;
  });

  const monthlySubscription = calculator.getMonthlyFee();
  const grandTotal = totalFees + monthlySubscription;

  return {
    totalRevenue: Math.round(totalRevenue * 100) / 100,
    totalFees: Math.round(totalFees * 100) / 100,
    merchantTotal: Math.round(merchantTotal * 100) / 100,
    transactionCount: transactions.length,
    monthlySubscription,
    grandTotal: Math.round(grandTotal * 100) / 100
  };
};

// Fee comparison tool
export const comparePlans = (monthlyTransactionVolume: number, averageTransactionAmount: number) => {
  return PRICING_TIERS.map(tier => {
    const calculator = new FeeCalculator(tier.id);
    const transactionCount = Math.min(monthlyTransactionVolume, tier.monthlyLimit);
    const totalTransactionAmount = transactionCount * averageTransactionAmount;
    
    const feeCalculation = calculator.calculateTransactionFee(totalTransactionAmount);
    const monthlyTotal = feeCalculation.platformFee + tier.monthlyFee;

    return {
      tier: tier.name,
      monthlyFee: tier.monthlyFee,
      transactionFees: feeCalculation.platformFee,
      totalMonthlyCost: monthlyTotal,
      effectiveRate: (monthlyTotal / totalTransactionAmount) * 100,
      transactionsProcessed: transactionCount,
      canHandleVolume: monthlyTransactionVolume <= tier.monthlyLimit
    };
  });
};
