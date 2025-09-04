/**
 * React hook for CCTP cross-chain payments
 */

import { useState, useCallback } from 'react';
import { cctpPaymentProcessor, CrossChainPaymentParams, CrossChainPaymentRecord } from '@/services/cctpPaymentProcessor';
import { CctpNetworkId } from '@/lib/cctp/types';
import { useToast } from './use-toast';

export interface UseCCTPPaymentsReturn {
  initiateCrossChainPayment: (params: CrossChainPaymentParams) => Promise<{
    paymentId: string;
    transferId: string;
    paymentUrl: string;
    qrCodeUrl: string;
    estimatedTime: number;
  } | null>;
  executeCrossChainTransfer: (paymentId: string, walletContext: {
    sourceAddress: string;
    destinationAddress: string;
  }) => Promise<{ burnTxHash: string } | null>;
  getCrossChainStatus: (paymentId: string) => Promise<CrossChainPaymentRecord | null>;
  getSupportedChainPairs: () => Array<{
    source: CctpNetworkId;
    destination: CctpNetworkId;
    estimatedTime: number;
  }>;
  isProcessing: boolean;
  isExecuting: boolean;
  error: string | null;
  currentTransfer: CrossChainPaymentRecord | null;
}

/**
 * Hook for CCTP cross-chain payment operations
 */
export const useCCTPPayments = (): UseCCTPPaymentsReturn => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentTransfer, setCurrentTransfer] = useState<CrossChainPaymentRecord | null>(null);
  const { toast } = useToast();

  /**
   * Initiate cross-chain payment
   */
  const initiateCrossChainPayment = useCallback(async (params: CrossChainPaymentParams) => {
    setIsProcessing(true);
    setError(null);

    try {
      const result = await cctpPaymentProcessor.initiateCrossChainPayment(params);
      
      toast({
        title: "Cross-Chain Payment Created",
        description: `Payment will transfer from ${params.sourceChain} to ${params.destinationChain}`,
      });

      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to initiate cross-chain payment';
      setError(errorMessage);
      
      toast({
        title: "Cross-Chain Payment Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsProcessing(false);
    }
  }, [toast]);

  /**
   * Execute cross-chain transfer
   */
  const executeCrossChainTransfer = useCallback(async (
    paymentId: string,
    walletContext: { sourceAddress: string; destinationAddress: string }
  ) => {
    setIsExecuting(true);
    setError(null);

    try {
      const result = await cctpPaymentProcessor.executeCrossChainTransfer(paymentId, walletContext);
      
      toast({
        title: "Cross-Chain Transfer Started",
        description: `Burn transaction initiated: ${result.burnTxHash.slice(0, 8)}...`,
      });

      // Update current transfer status
      const status = await cctpPaymentProcessor.getCrossChainStatus(paymentId);
      setCurrentTransfer(status);

      return { burnTxHash: result.burnTxHash };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute cross-chain transfer';
      setError(errorMessage);
      
      toast({
        title: "Transfer Execution Failed",
        description: errorMessage,
        variant: "destructive",
      });

      return null;
    } finally {
      setIsExecuting(false);
    }
  }, [toast]);

  /**
   * Get cross-chain transfer status
   */
  const getCrossChainStatus = useCallback(async (paymentId: string) => {
    try {
      const status = await cctpPaymentProcessor.getCrossChainStatus(paymentId);
      if (status) {
        setCurrentTransfer(status);
      }
      return status;
    } catch (err) {
      console.error('Failed to get cross-chain status:', err);
      return null;
    }
  }, []);

  /**
   * Get supported chain pairs
   */
  const getSupportedChainPairs = useCallback(() => {
    return cctpPaymentProcessor.getSupportedChainPairs();
  }, []);

  return {
    initiateCrossChainPayment,
    executeCrossChainTransfer,
    getCrossChainStatus,
    getSupportedChainPairs,
    isProcessing,
    isExecuting,
    error,
    currentTransfer,
  };
};
