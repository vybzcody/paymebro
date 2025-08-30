import { CctpNetworkId } from '@/lib/cctp/types';

export interface MultiChainPaymentLink {
  id: string;
  amount: number;
  currency: 'USDC';
  description?: string;
  
  // Merchant chain preferences
  merchantWallets: {
    [key in CctpNetworkId]?: string;
  };
  preferredReceiveChain: CctpNetworkId;
  
  // Customer options
  acceptedChains: CctpNetworkId[];
  autoConvert: boolean;
  
  // Existing AfriPay fields
  businessId: string;
  createdAt: Date;
  expiresAt?: Date;
  isActive: boolean;
}

export interface PaymentSession {
  paymentLinkId: string;
  customerWalletType: 'solana' | 'evm';
  customerChain?: CctpNetworkId;
  customerAddress?: string;
  requiresCCTP: boolean;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}
