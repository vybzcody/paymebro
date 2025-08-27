/**
 * Official Solana Pay Hook
 * Following https://docs.solanapay.com/ specification
 */

import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Auth } from '@/contexts/Web3AuthContext';
import { 
  solanaPayService, 
  PaymentRequest, 
  PaymentResponse, 
  PaymentStatus 
} from '@/services/solanaPayService';
import { AfriPayAPI } from '@/services/afripayAPI';

export interface PaymentData {
  amount: number;
  currency: 'SOL' | 'USDC';
  label: string;
  message: string;
  memo?: string;
  customerName?: string;
  customerEmail?: string;
}

export interface PaymentState {
  status: 'idle' | 'creating' | 'pending' | 'confirmed' | 'failed' | 'timeout';
  paymentUrl?: string;
  qrCodeUrl?: string;
  reference?: PublicKey;
  signature?: string;
  error?: string;
  feeBreakdown?: {
    originalAmount: number;
    afripayFee: number;
    merchantReceives: number;
    total: number;
    currency: string;
  };
  expiresAt?: string;
  timeUntilExpiry?: {
    expired: boolean;
    timeRemaining?: number;
    timeString?: string;
  };
}

export const useSolanaPayOfficial = () => {
  const { toast } = useToast();
  const { publicKey, user, isLoading: authLoading } = useWeb3Auth();
  const [paymentState, setPaymentState] = useState<PaymentState>({ status: 'idle' });
  const [isBackendHealthy, setIsBackendHealthy] = useState(false);

  // Check backend health on mount
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await AfriPayAPI.healthCheck();
        setIsBackendHealthy(true);
      } catch (error) {
        setIsBackendHealthy(false);
        console.error('Backend health check failed:', error);
      }
    };

    checkBackendHealth();
    const interval = setInterval(checkBackendHealth, 30000); // Check every 30 seconds
    return () => clearInterval(interval);
  }, []);

  /**
   * Create and monitor a payment using official Solana Pay
   */
  const createAndMonitorPayment = useCallback(async (paymentData: PaymentData) => {
    if (!publicKey) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet first',
        variant: 'destructive',
      });
      return null;
    }

    if (!isBackendHealthy) {
      toast({
        title: 'Service Unavailable',
        description: 'The AfriPay backend is not available. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setPaymentState({ status: 'creating' });

      // Create AfriPay payment with fees using the official service
      const paymentResult = solanaPayService.createAfriPayPayment({
        merchantWallet: publicKey,
        amount: paymentData.amount,
        currency: paymentData.currency,
        description: paymentData.message,
        merchantName: paymentData.label,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        memo: paymentData.memo,
      });

      // Also create a backend record for tracking
      const backendRequest = await AfriPayAPI.createPaymentRequest({
        userId: user?.verifierId || user?.email || publicKey.toString(),
        amount: paymentData.amount,
        description: paymentData.message,
        recipientWallet: publicKey.toString(),
        currency: paymentData.currency,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        merchantName: paymentData.label,
        memo: paymentData.memo,
      });

      // Set payment state
      setPaymentState({
        status: 'pending',
        paymentUrl: paymentResult.paymentUrl,
        qrCodeUrl: paymentResult.qrCodeUrl,
        reference: paymentResult.reference,
        feeBreakdown: paymentResult.feeBreakdown,
        expiresAt: backendRequest.paymentRequest.expiresAt,
        timeUntilExpiry: {
          expired: false,
          timeRemaining: 24 * 60 * 60 * 1000, // 24 hours
          timeString: '24h',
        },
      });

      toast({
        title: 'Payment Request Created',
        description: `Customer pays ${paymentResult.feeBreakdown!.total.toFixed(4)} ${paymentData.currency} (includes ${paymentResult.feeBreakdown!.afripayFee.toFixed(4)} ${paymentData.currency} AfriPay fee)`,
      });

      // Start monitoring the payment
      monitorPaymentStatus(paymentResult.reference, {
        recipient: publicKey,
        amount: paymentResult.feeBreakdown!.total,
        currency: paymentData.currency,
      });

      return paymentResult;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create payment request';
      setPaymentState({ status: 'failed', error: errorMessage });
      
      toast({
        title: 'Payment Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });

      throw error;
    }
  }, [publicKey, user, isBackendHealthy, toast]);

  /**
   * Monitor payment status using official Solana Pay
   */
  const monitorPaymentStatus = useCallback(async (
    reference: PublicKey,
    expectedParams: {
      recipient: PublicKey;
      amount: number;
      currency: 'SOL' | 'USDC';
    }
  ) => {
    try {
      const splToken = expectedParams.currency === 'USDC' 
        ? solanaPayService.getUSDCMint() 
        : undefined;

      const result = await solanaPayService.monitorPayment(
        reference,
        {
          recipient: expectedParams.recipient,
          amount: new BigNumber(expectedParams.amount),
          splToken,
        },
        {
          timeout: 300000, // 5 minutes
          interval: 3000,  // 3 seconds
        }
      );

      if (result.status === 'confirmed' && result.signature) {
        setPaymentState(prev => ({
          ...prev,
          status: 'confirmed',
          signature: result.signature,
        }));

        // Verify with backend
        try {
          await AfriPayAPI.verifyPayment(result.signature, reference.toString());
        } catch (verifyError) {
          console.warn('Backend verification failed:', verifyError);
        }

        toast({
          title: 'Payment Confirmed!',
          description: `Transaction signature: ${result.signature.slice(0, 8)}...`,
        });
      } else if (result.status === 'failed') {
        setPaymentState(prev => ({
          ...prev,
          status: 'failed',
          error: result.error || 'Payment failed',
        }));

        toast({
          title: 'Payment Failed',
          description: result.error || 'The payment could not be processed',
          variant: 'destructive',
        });
      } else if (result.status === 'timeout') {
        setPaymentState(prev => ({
          ...prev,
          status: 'timeout',
          error: 'Payment monitoring timed out',
        }));

        toast({
          title: 'Payment Timeout',
          description: 'Payment monitoring timed out. The payment may still be processing.',
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      console.error('Payment monitoring error:', error);
      setPaymentState(prev => ({
        ...prev,
        status: 'failed',
        error: error.message || 'Payment monitoring failed',
      }));
    }
  }, [toast]);

  /**
   * Reset payment state
   */
  const resetPayment = useCallback(() => {
    setPaymentState({ status: 'idle' });
  }, []);

  /**
   * Calculate fees for display
   */
  const calculateFees = useCallback((amount: number, currency: 'SOL' | 'USDC') => {
    return solanaPayService.calculateAfriPayFees(amount, currency);
  }, []);

  /**
   * Check if wallet is connected
   */
  const isWalletConnected = !authLoading && !!publicKey;

  /**
   * Get wallet address
   */
  const walletAddress = publicKey?.toString();

  return {
    // State
    paymentState,
    isWalletConnected,
    walletAddress,
    isBackendHealthy,
    
    // Actions
    createAndMonitorPayment,
    resetPayment,
    calculateFees,
    
    // Utilities
    solanaPayService,
  };
};

export default useSolanaPayOfficial;
