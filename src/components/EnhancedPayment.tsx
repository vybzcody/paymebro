import React, { useState, useEffect, useMemo } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { Transaction } from '@solana/web3.js';
import { useTransactionMonitoring } from '../hooks/useTransactionMonitoring';
import { purchaseHistoryService } from '../services/purchaseHistoryService';
import { Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface EnhancedPaymentProps {
  reference: string;
  amount: number;
  currency: string;
  description: string;
  onSuccess?: (signature: string) => void;
  onError?: (error: string) => void;
}

const PAYMENT_STATUS = {
  INITIAL: 'initial',
  CHECKING: 'checking',
  READY: 'ready',
  PROCESSING: 'processing',
  MONITORING: 'monitoring',
  COMPLETED: 'completed',
  ERROR: 'error'
} as const;

type PaymentStatus = typeof PAYMENT_STATUS[keyof typeof PAYMENT_STATUS];

export const EnhancedPayment: React.FC<EnhancedPaymentProps> = ({
  reference,
  amount,
  currency,
  description,
  onSuccess,
  onError
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  
  const [status, setStatus] = useState<PaymentStatus>(PAYMENT_STATUS.INITIAL);
  const [error, setError] = useState<string | null>(null);
  const [transactionSignature, setTransactionSignature] = useState<string | null>(null);

  // Enhanced transaction monitoring (Compet pattern)
  const transactionStatus = useTransactionMonitoring(
    reference,
    connection,
    status === PAYMENT_STATUS.MONITORING
  );

  // Check if already purchased (Compet pattern)
  useEffect(() => {
    if (!publicKey) return;

    const checkPurchaseHistory = async () => {
      setStatus(PAYMENT_STATUS.CHECKING);
      
      const alreadyPurchased = await purchaseHistoryService.hasPurchased(
        publicKey.toString(),
        reference
      );

      if (alreadyPurchased) {
        setStatus(PAYMENT_STATUS.COMPLETED);
        return;
      }

      setStatus(PAYMENT_STATUS.READY);
    };

    checkPurchaseHistory();
  }, [publicKey, reference]);

  // Monitor transaction confirmation
  useEffect(() => {
    if (transactionStatus.status === 'confirmed' || transactionStatus.status === 'finalized') {
      setStatus(PAYMENT_STATUS.COMPLETED);
      
      if (transactionStatus.signature) {
        // Add to purchase history
        purchaseHistoryService.addPurchase({
          reference,
          walletAddress: publicKey!.toString(),
          signature: transactionStatus.signature
        });

        onSuccess?.(transactionStatus.signature);
      }
    } else if (transactionStatus.status === 'error') {
      setStatus(PAYMENT_STATUS.ERROR);
      setError(transactionStatus.error || 'Transaction monitoring failed');
      onError?.(transactionStatus.error || 'Transaction monitoring failed');
    }
  }, [transactionStatus, reference, publicKey, onSuccess, onError]);

  const processPayment = async () => {
    if (!publicKey) return;

    setStatus(PAYMENT_STATUS.PROCESSING);
    setError(null);

    try {
      // Create transaction using enhanced backend
      const response = await fetch(
        `${import.meta.env.VITE_BACKEND_URL}/api/solana-pay/transaction?reference=${reference}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ account: publicKey.toString() })
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create transaction');
      }

      const { transaction: base64Transaction } = await response.json();
      const transaction = Transaction.from(Buffer.from(base64Transaction, 'base64'));

      // Send transaction
      const signature = await sendTransaction(transaction, connection);
      setTransactionSignature(signature);
      setStatus(PAYMENT_STATUS.MONITORING);

      console.log('Transaction sent:', signature);
      console.log('Solscan:', `https://solscan.io/tx/${signature}?cluster=devnet`);

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Payment failed';
      setError(errorMessage);
      setStatus(PAYMENT_STATUS.ERROR);
      onError?.(errorMessage);
    }
  };

  const renderStatus = () => {
    switch (status) {
      case PAYMENT_STATUS.CHECKING:
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Checking purchase history...
          </div>
        );

      case PAYMENT_STATUS.READY:
        return (
          <button
            onClick={processPayment}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Pay {amount} {currency}
          </button>
        );

      case PAYMENT_STATUS.PROCESSING:
        return (
          <div className="flex items-center gap-2 text-blue-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Creating transaction...
          </div>
        );

      case PAYMENT_STATUS.MONITORING:
        return (
          <div className="flex items-center gap-2 text-yellow-600">
            <Loader2 className="w-4 h-4 animate-spin" />
            Confirming payment...
          </div>
        );

      case PAYMENT_STATUS.COMPLETED:
        return (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle className="w-4 h-4" />
            Payment completed!
          </div>
        );

      case PAYMENT_STATUS.ERROR:
        return (
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        );

      default:
        return null;
    }
  };

  if (!publicKey) {
    return (
      <div className="text-gray-600">
        Connect your wallet to make payments
      </div>
    );
  }

  return (
    <div className="p-4 border rounded-lg bg-white shadow-sm">
      <div className="mb-4">
        <h3 className="font-medium text-gray-900">{description}</h3>
        <p className="text-sm text-gray-600">
          Amount: {amount} {currency}
        </p>
      </div>

      {renderStatus()}

      {transactionSignature && (
        <div className="mt-2 text-xs text-gray-500">
          <a
            href={`https://solscan.io/tx/${transactionSignature}?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-blue-600"
          >
            View on Solscan
          </a>
        </div>
      )}
    </div>
  );
};
