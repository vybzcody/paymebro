import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import {
  createUSDCPayment,
  createSOLPayment,
  checkPaymentStatus,
  getConnection,
  validatePayment,
  PaymentResponse,
  generateReference,
  createAfriPayPayment,
  calculateAfriPayFees,
  PaymentBreakdown,
  AfriPayTransaction,
  processAfriPayFeeCollection
} from '@/lib/solanaPay';
import { useWeb3Auth } from '@/contexts/Web3AuthContext';

export interface PaymentData {
  amount: number;
  currency: 'SOL' | 'USDC';
  label: string;
  message: string;
  memo?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentStatus {
  status: 'idle' | 'creating' | 'pending' | 'confirming' | 'confirmed' | 'failed';
  signature?: string;
  error?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  reference?: PublicKey;
  afripayTransaction?: AfriPayTransaction;
  breakdown?: PaymentBreakdown;
}

export const useSolanaPay = () => {
  const { publicKey } = useWeb3Auth();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [isMonitoring, setIsMonitoring] = useState(false);

  // Create a payment request using AfriPay Stripe-like model
  const createPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentResponse | null> => {
    if (!publicKey) {
      const error = 'Wallet not connected';
      setPaymentStatus({ status: 'failed', error });
      toast({
        title: 'Error',
        description: error,
        variant: 'destructive',
      });
      return null;
    }

    try {
      setPaymentStatus({ status: 'creating' });

      // Use AfriPay Stripe-like payment model
      const afripayPayment = createAfriPayPayment({
        merchantWallet: publicKey,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.message,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        memo: paymentData.memo,
        merchantName: paymentData.label
      });

      setPaymentStatus({
        status: 'pending',
        paymentUrl: afripayPayment.paymentResponse.paymentUrl,
        qrCodeUrl: afripayPayment.paymentResponse.qrCodeUrl,
        reference: afripayPayment.paymentResponse.reference,
        afripayTransaction: afripayPayment.transaction,
        breakdown: afripayPayment.breakdown
      });

      toast({
        title: 'AfriPay Payment Created',
        description: `Customer pays ${afripayPayment.breakdown.total.toFixed(4)} ${paymentData.currency} (includes ${afripayPayment.breakdown.afripayFee.toFixed(4)} ${paymentData.currency} fee)`,
      });

      return afripayPayment.paymentResponse;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create payment';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      toast({
        title: 'Payment Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return null;
    }
  }, [publicKey, toast]);

  // Monitor payment status
  const monitorPayment = useCallback(async (reference: PublicKey, timeoutMs: number = 300000) => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setPaymentStatus(prev => ({ ...prev, status: 'pending' }));

    try {
      const connection = getConnection();
      const result = await checkPaymentStatus(connection, reference, timeoutMs);

      if (result.status === 'confirmed') {
        setPaymentStatus(prev => {
          const newStatus = {
            ...prev,
            status: 'confirmed' as const,
            signature: result.signature,
          };
          
          // Process AfriPay fee collection
          if (prev.afripayTransaction && result.signature) {
            processAfriPayFeeCollection(prev.afripayTransaction, result.signature)
              .then(feeResult => {
                if (feeResult.success) {
                  console.log('AfriPay fee collection successful:', feeResult.feeTransactionSignature);
                } else {
                  console.error('AfriPay fee collection failed:', feeResult.error);
                }
              });
          }
          
          return newStatus;
        });

        toast({
          title: 'Payment Confirmed!',
          description: 'Payment received successfully. AfriPay fee has been processed.',
        });
      } else if (result.status === 'failed') {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'failed',
          error: 'Transaction failed',
          signature: result.signature,
        }));

        toast({
          title: 'Payment Failed',
          description: 'The transaction was unsuccessful.',
          variant: 'destructive',
        });
      } else {
        setPaymentStatus(prev => ({
          ...prev,
          status: 'failed',
          error: 'Payment timeout',
        }));

        toast({
          title: 'Payment Timeout',
          description: 'Payment not received within the expected time.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to monitor payment';
      setPaymentStatus(prev => ({
        ...prev,
        status: 'failed',
        error: errorMessage,
      }));

      toast({
        title: 'Monitoring Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setIsMonitoring(false);
    }
  }, [isMonitoring, toast]);

  // Validate a specific transaction
  const validateTransaction = useCallback(async (
    signature: string,
    expectedAmount: number,
    currency: 'SOL' | 'USDC' = 'USDC'
  ): Promise<boolean> => {
    if (!publicKey) return false;

    try {
      const connection = getConnection();
      const expectedAmountBN = new (await import('bignumber.js')).default(expectedAmount);
      
      let splToken: PublicKey | undefined;
      if (currency === 'USDC') {
        const { getUSDCMint } = await import('@/lib/solanaPay');
        splToken = getUSDCMint();
      }

      return await validatePayment(
        connection,
        signature,
        publicKey,
        expectedAmountBN,
        splToken
      );
    } catch (error) {
      console.error('Transaction validation error:', error);
      return false;
    }
  }, [publicKey]);

  // Reset payment status
  const resetPayment = useCallback(() => {
    setPaymentStatus({ status: 'idle' });
    setIsMonitoring(false);
  }, []);

  // Create and monitor payment in one go
  const createAndMonitorPayment = useCallback(async (paymentData: PaymentData) => {
    const payment = await createPayment(paymentData);
    if (payment && payment.reference) {
      // Start monitoring after a short delay
      setTimeout(() => {
        monitorPayment(payment.reference);
      }, 1000);
    }
    return payment;
  }, [createPayment, monitorPayment]);

  // Auto-cleanup monitoring on unmount
  useEffect(() => {
    return () => {
      setIsMonitoring(false);
    };
  }, []);

  return {
    paymentStatus,
    isMonitoring,
    createPayment,
    monitorPayment,
    validateTransaction,
    resetPayment,
    createAndMonitorPayment,
    isWalletConnected: !!publicKey,
    walletAddress: publicKey?.toString() || null,
  };
};
