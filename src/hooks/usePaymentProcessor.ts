/**
 * React hook for payment processing with real-time monitoring
 */

import { useState, useCallback, useEffect } from 'react';
import { paymentProcessor, PaymentInitiationParams, PaymentRecord } from '@/services/paymentProcessor';
import { useToast } from './use-toast';

export interface UsePaymentProcessorReturn {
  initiatePayment: (params: PaymentInitiationParams) => Promise<{
    paymentId: string;
    paymentUrl: string;
    qrCodeUrl: string;
    reference: string;
    feeBreakdown: any;
  } | null>;
  monitorPayment: (paymentId: string) => Promise<void>;
  getPaymentStatus: (paymentId: string) => Promise<PaymentRecord | null>;
  isProcessing: boolean;
  isMonitoring: boolean;
  error: string | null;
  currentPayment: PaymentRecord | null;
}

/**
 * Hook for payment processing operations
 */
export const usePaymentProcessor = (): UsePaymentProcessorReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPayment, setCurrentPayment] = useState<PaymentRecord | null>(null);
  const { toast } = useToast();

  /**
   * Initiate a new payment
   */
  const initiatePayment = useCallback(async (params: PaymentInitiationParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await paymentProcessor.initiatePayment(params);
      
      toast({
        title: "Payment Created",
        description: `Payment link generated for $${params.amount} ${params.currency}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate payment';
      setError(errorMessage);
      
      toast({
        title: "Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  /**
   * Monitor payment for confirmation
   */
  const monitorPayment = useCallback(async (paymentId: string) => {
    setIsMonitoring(true);
    setError(null);

    try {
      // Get initial payment status
      const payment = await paymentProcessor.getPaymentStatus(paymentId);
      if (payment) {
        setCurrentPayment(payment);
      }

      // Start monitoring
      const result = await paymentProcessor.monitorPayment(paymentId);

      if (result.status === 'confirmed') {
        // Get updated payment record
        const updatedPayment = await paymentProcessor.getPaymentStatus(paymentId);
        setCurrentPayment(updatedPayment);

        toast({
          title: "Payment Confirmed! 🎉",
          description: `Transaction confirmed in ${result.signature?.slice(0, 8)}...`,
        });
      } else if (result.status === 'failed') {
        toast({
          title: "Payment Failed",
          description: "The payment transaction failed",
          variant: "destructive",
        });
      } else if (result.status === 'timeout') {
        toast({
          title: "Payment Timeout",
          description: "Payment monitoring timed out. Please check manually.",
          variant: "destructive",
        });
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to monitor payment';
      setError(errorMessage);
      
      toast({
        title: "Monitoring Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsMonitoring(false);
    }
  }, [toast]);

  /**
   * Get payment status
   */
  const getPaymentStatus = useCallback(async (paymentId: string) => {
    try {
      const payment = await paymentProcessor.getPaymentStatus(paymentId);
      if (payment) {
        setCurrentPayment(payment);
      }
      return payment;
    } catch (err) {
      console.error('Failed to get payment status:', err);
      return null;
    }
  }, []);

  return {
    initiatePayment,
    monitorPayment,
    getPaymentStatus,
    isProcessing,
    isMonitoring,
    error,
    currentPayment,
  };
};
