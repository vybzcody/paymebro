import { useEffect, useState, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { findReference, FindReferenceError } from '@solana/pay';

interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'finalized' | 'error';
  signature?: string;
  confirmationStatus?: string;
  error?: string;
}

export const useTransactionMonitoring = (
  reference: string | null,
  connection: Connection,
  enabled: boolean = true
) => {
  const [transactionStatus, setTransactionStatus] = useState<TransactionStatus>({
    status: 'pending'
  });

  const monitorTransaction = useCallback(async () => {
    if (!reference || !enabled) return;

    const referencePublicKey = new PublicKey(reference);
    let attempts = 0;
    const maxAttempts = 60; // 2 minutes with 2-second intervals

    const interval = setInterval(async () => {
      attempts++;
      
      try {
        const result = await findReference(connection, referencePublicKey);
        
        console.log('Transaction found:', {
          signature: result.signature,
          confirmationStatus: result.confirmationStatus
        });

        setTransactionStatus({
          status: result.confirmationStatus === 'finalized' ? 'finalized' : 'confirmed',
          signature: result.signature,
          confirmationStatus: result.confirmationStatus
        });

        if (result.confirmationStatus === 'confirmed' || 
            result.confirmationStatus === 'finalized') {
          clearInterval(interval);
        }

      } catch (error) {
        if (error instanceof FindReferenceError) {
          // Transaction not found yet, continue monitoring
          if (attempts >= maxAttempts) {
            setTransactionStatus({
              status: 'error',
              error: 'Transaction not found after timeout'
            });
            clearInterval(interval);
          }
          return;
        }

        console.error('Transaction monitoring error:', error);
        setTransactionStatus({
          status: 'error',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        clearInterval(interval);
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [reference, connection, enabled]);

  useEffect(() => {
    if (reference && enabled) {
      setTransactionStatus({ status: 'pending' });
      return monitorTransaction();
    }
  }, [reference, enabled, monitorTransaction]);

  return transactionStatus;
};
