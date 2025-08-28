import { useState, useCallback, useEffect } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useToast } from '@/hooks/use-toast';
import { useWeb3Auth } from '@/contexts/Web3AuthContext';
import { 
  AfriPayAPI, 
  PaymentUtils,
  CreatePaymentRequest,
  PaymentRequestResponse,
  PaymentStatusResponse 
} from '@/services/afripayAPI';

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
  status: 'idle' | 'creating' | 'pending' | 'confirmed' | 'failed' | 'expired';
  signature?: string;
  error?: string;
  paymentUrl?: string;
  qrCodeUrl?: string;
  reference?: string;
  paymentRequest?: PaymentRequestResponse['paymentRequest'];
  feeBreakdown?: PaymentRequestResponse['feeBreakdown'];
  expiresAt?: string;
  timeUntilExpiry?: {
    expired: boolean;
    timeRemaining?: number;
    timeString?: string;
  };
}

/**
 * Enhanced Solana Pay hook that uses the new AfriPay backend
 * This replaces the old client-side logic with proper server-side processing
 */
export const useSolanaPayBackend = () => {
  const { publicKey, user } = useWeb3Auth();
  const { toast } = useToast();
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>({ status: 'idle' });
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [backendStatus, setBackendStatus] = useState<'checking' | 'healthy' | 'unhealthy'>('checking');

  // Check backend health on initialization
  useEffect(() => {
    const checkBackendHealth = async () => {
      try {
        await AfriPayAPI.healthCheck();
        setBackendStatus('healthy');
        console.log('✅ AfriPay backend is healthy');
      } catch (error) {
        setBackendStatus('unhealthy');
        console.error('❌ AfriPay backend is unhealthy:', error);
        toast({
          title: 'Backend Connection Issue',
          description: 'The AfriPay backend is not responding. Please check if the server is running.',
          variant: 'destructive',
        });
      }
    };

    checkBackendHealth();
  }, [toast]);

  // Update payment expiry status periodically
  useEffect(() => {
    if (paymentStatus.expiresAt && paymentStatus.status === 'pending') {
      const interval = setInterval(() => {
        const timeUntilExpiry = PaymentUtils.getTimeUntilExpiry(paymentStatus.expiresAt!);
        
        if (timeUntilExpiry.expired && paymentStatus.status !== 'expired') {
          setPaymentStatus(prev => ({ 
            ...prev, 
            status: 'expired',
            timeUntilExpiry 
          }));
          
          toast({
            title: 'Payment Expired',
            description: 'The payment request has expired. Please create a new one.',
            variant: 'destructive',
          });
        } else {
          setPaymentStatus(prev => ({ 
            ...prev, 
            timeUntilExpiry 
          }));
        }
      }, 60000); // Update every minute

      return () => clearInterval(interval);
    }
  }, [paymentStatus.expiresAt, paymentStatus.status, toast]);

  /**
   * Create a payment request using the backend API
   */
  const createPayment = useCallback(async (paymentData: PaymentData): Promise<PaymentRequestResponse | null> => {
    if (!publicKey) {
      const error = 'Wallet not connected';
      setPaymentStatus({ status: 'failed', error });
      toast({
        title: 'Wallet Required',
        description: 'Please connect your wallet to create a payment request.',
        variant: 'destructive',
      });
      return null;
    }

    if (backendStatus !== 'healthy') {
      const error = 'Backend not available';
      setPaymentStatus({ status: 'failed', error });
      toast({
        title: 'Service Unavailable',
        description: 'The AfriPay backend is not available. Please try again later.',
        variant: 'destructive',
      });
      return null;
    }

    try {
      setPaymentStatus({ status: 'creating' });

      const createRequest: CreatePaymentRequest = {
        userId: user?.verifierId || user?.email || publicKey.toString(),
        amount: paymentData.amount,
        description: paymentData.message,
        recipientWallet: publicKey.toString(),
        currency: paymentData.currency,
        customerEmail: paymentData.customerEmail,
        customerName: paymentData.customerName,
        merchantName: paymentData.label,
        memo: paymentData.memo,
      };

      console.log('Creating AfriPay payment request:', createRequest);

      const result = await AfriPayAPI.createPaymentRequest(createRequest);

      const timeUntilExpiry = PaymentUtils.getTimeUntilExpiry(result.paymentRequest.expiresAt);

      setPaymentStatus({
        status: 'pending',
        paymentUrl: result.paymentRequest.paymentUrl,
        qrCodeUrl: result.paymentRequest.qrCodeUrl,
        reference: result.paymentRequest.reference,
        paymentRequest: result.paymentRequest,
        feeBreakdown: result.feeBreakdown,
        expiresAt: result.paymentRequest.expiresAt,
        timeUntilExpiry,
      });

      toast({
        title: 'Payment Request Created',
        description: `Customer pays ${PaymentUtils.formatAmount(result.feeBreakdown.total, paymentData.currency)} (includes ${PaymentUtils.formatAmount(result.feeBreakdown.afripayFee, paymentData.currency)} AfriPay fee)`,
      });

      return result;
    } catch (error: any) {
      const errorMessage = error.message || 'Failed to create payment request';
      setPaymentStatus({ status: 'failed', error: errorMessage });
      
      toast({
        title: 'Payment Creation Failed',
        description: errorMessage,
        variant: 'destructive',
      });
      
      return null;
    }
  }, [publicKey, user, backendStatus, toast]);

  /**
   * Monitor payment status using backend API
   */
  const monitorPayment = useCallback(async (reference: string, timeoutMs: number = 300000) => {
    if (isMonitoring) return;

    setIsMonitoring(true);
    setPaymentStatus(prev => ({ ...prev, status: 'pending' }));

    const startTime = Date.now();
    const pollInterval = 5000; // Poll every 5 seconds

    const pollPaymentStatus = async (): Promise<void> => {
      try {
        const result = await AfriPayAPI.checkPaymentStatus(reference);
        
        console.log('Payment status update:', result);

        if (result.confirmed && result.signature) {
          // Payment confirmed!
          setPaymentStatus(prev => ({
            ...prev,
            status: 'confirmed',
            signature: result.signature,
          }));

          // Verify the payment in the database
          try {
            await AfriPayAPI.verifyPayment(result.signature, reference);
            console.log('Payment verified and recorded in database');
          } catch (verifyError) {
            console.warn('Payment confirmed on blockchain but database verification failed:', verifyError);
          }

          toast({
            title: 'Payment Confirmed! 🎉',
            description: 'Your payment has been received and confirmed on the blockchain.',
          });

          return;
        }

        if (result.status === 'failed') {
          setPaymentStatus(prev => ({
            ...prev,
            status: 'failed',
            error: 'Transaction failed on blockchain',
            signature: result.signature,
          }));

          toast({
            title: 'Payment Failed',
            description: 'The payment transaction failed. Please try again.',
            variant: 'destructive',
          });

          return;
        }

        // Check if we've exceeded the timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeoutMs) {
          setPaymentStatus(prev => ({
            ...prev,
            status: 'failed',
            error: 'Payment monitoring timeout',
          }));

          toast({
            title: 'Payment Timeout',
            description: 'Payment monitoring timed out. The payment may still be processing.',
            variant: 'destructive',
          });

          return;
        }

        // Continue polling
        setTimeout(pollPaymentStatus, pollInterval);
      } catch (error: any) {
        console.error('Payment monitoring error:', error);
        
        // Don't stop monitoring on network errors, but do stop on timeout
        const elapsed = Date.now() - startTime;
        if (elapsed >= timeoutMs) {
          setPaymentStatus(prev => ({
            ...prev,
            status: 'failed',
            error: 'Payment monitoring failed',
          }));

          toast({
            title: 'Monitoring Error',
            description: 'Could not monitor payment status. Please check manually.',
            variant: 'destructive',
          });
        } else {
          // Retry after a longer delay on error
          setTimeout(pollPaymentStatus, pollInterval * 2);
        }
      }
    };

    // Start polling
    pollPaymentStatus().finally(() => {
      setIsMonitoring(false);
    });
  }, [isMonitoring, toast]);

  /**
   * Cancel a payment request
   */
  const cancelPayment = useCallback(async (reference?: string) => {
    if (!reference && !paymentStatus.reference) {
      toast({
        title: 'No Payment to Cancel',
        description: 'There is no active payment request to cancel.',
        variant: 'destructive',
      });
      return false;
    }

    const ref = reference || paymentStatus.reference!;

    try {
      await AfriPayAPI.cancelPaymentRequest(ref);
      
      setPaymentStatus({ status: 'idle' });
      
      toast({
        title: 'Payment Cancelled',
        description: 'The payment request has been cancelled successfully.',
      });

      return true;
    } catch (error: any) {
      toast({
        title: 'Cancellation Failed',
        description: error.message || 'Failed to cancel payment request.',
        variant: 'destructive',
      });

      return false;
    }
  }, [paymentStatus.reference, toast]);

  /**
   * Get payment request details
   */
  const getPaymentDetails = useCallback(async (reference: string) => {
    try {
      return await AfriPayAPI.getPaymentRequest(reference);
    } catch (error: any) {
      console.error('Failed to get payment details:', error);
      toast({
        title: 'Failed to Load Payment',
        description: error.message || 'Could not load payment details.',
        variant: 'destructive',
      });
      return null;
    }
  }, [toast]);

  /**
   * Reset payment status
   */
  const resetPayment = useCallback(() => {
    setPaymentStatus({ status: 'idle' });
    setIsMonitoring(false);
  }, []);

  /**
   * Create and monitor payment in one go
   */
  const createAndMonitorPayment = useCallback(async (paymentData: PaymentData) => {
    const payment = await createPayment(paymentData);
    if (payment && payment.paymentRequest.reference) {
      // Start monitoring after a short delay
      setTimeout(() => {
        monitorPayment(payment.paymentRequest.reference);
      }, 2000);
    }
    return payment;
  }, [createPayment, monitorPayment]);

  /**
   * Calculate fee breakdown for display
   */
  const calculateFees = useCallback((amount: number, currency: 'SOL' | 'USDC' = 'USDC') => {
    const fixedFee = currency === 'SOL' ? 0.002 : 0.30; // Approximation
    return PaymentUtils.calculateCustomerTotal(amount, 0.029, fixedFee);
  }, []);

  return {
    // State
    paymentStatus,
    isMonitoring,
    backendStatus,
    
    // Actions
    createPayment,
    monitorPayment,
    cancelPayment,
    getPaymentDetails,
    resetPayment,
    createAndMonitorPayment,
    
    // Utilities
    calculateFees,
    
    // Status checks
    isWalletConnected: !!publicKey,
    isBackendHealthy: backendStatus === 'healthy',
    walletAddress: publicKey?.toString() || null,
    
    // Payment URL helpers
    paymentUrl: paymentStatus.paymentUrl,
    qrCodeUrl: paymentStatus.qrCodeUrl,
  };
};
