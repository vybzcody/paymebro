import { Connection, PublicKey, Transaction, Keypair } from '@solana/web3.js';
import { createTransfer, validateTransfer, findReference, FindReferenceError } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { SOLANA_CONFIG, AFRIPAY_CONFIG } from '../config/index.js';

/**
 * Solana service for handling blockchain operations
 */
export class SolanaService {
  constructor() {
    this.connection = new Connection(SOLANA_CONFIG.rpcEndpoint, 'confirmed');
  }

  /**
   * Create a payment transfer transaction
   */
  async createPaymentTransaction(params) {
    const {
      account,
      recipient,
      amount,
      splToken,
      reference,
      memo,
    } = params;

    try {
      // Create the transfer transaction using Solana Pay
      let transaction = await createTransfer(this.connection, account, {
        recipient,
        amount: new BigNumber(amount),
        splToken,
        reference,
        memo,
      });

      // Serialize and deserialize to ensure consistent ordering
      transaction = Transaction.from(
        transaction.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        })
      );

      return transaction;
    } catch (error) {
      console.error('Error creating payment transaction:', error);
      throw new Error(`Failed to create transaction: ${error.message}`);
    }
  }

  /**
   * Create AfriPay split payment transaction with fees
   * This creates a more complex transaction that splits payment between merchant and AfriPay
   */
  async createAfriPayTransaction(params) {
    const {
      account,
      recipient,
      originalAmount,
      afripayFee,
      splToken,
      reference,
      memo,
    } = params;

    try {
      // For now, we'll create a single transaction to the merchant for the full amount
      // In production, you'd want to create a multi-instruction transaction that:
      // 1. Sends original amount to merchant
      // 2. Sends fee to AfriPay platform wallet
      
      const totalAmount = new BigNumber(originalAmount).plus(afripayFee);

      let transaction = await createTransfer(this.connection, account, {
        recipient,
        amount: totalAmount,
        splToken,
        reference,
        memo: memo || `AfriPay: ${originalAmount} + ${afripayFee} fee`,
      });

      // Serialize and deserialize for consistency
      transaction = Transaction.from(
        transaction.serialize({
          verifySignatures: false,
          requireAllSignatures: false,
        })
      );

      return transaction;
    } catch (error) {
      console.error('Error creating AfriPay transaction:', error);
      throw new Error(`Failed to create AfriPay transaction: ${error.message}`);
    }
  }

  /**
   * Validate a completed payment
   */
  async validatePayment(signature, expectedParams) {
    const { recipient, amount, splToken, reference } = expectedParams;

    try {
      const result = await validateTransfer(
        this.connection,
        signature,
        {
          recipient,
          amount: new BigNumber(amount),
          splToken,
          reference,
        }
      );

      return result !== null;
    } catch (error) {
      console.error('Error validating payment:', error);
      return false;
    }
  }

  /**
   * Find transaction by reference
   */
  async findTransactionByReference(reference, options = {}) {
    try {
      const referencePublicKey = new PublicKey(reference);
      const signatureInfo = await findReference(this.connection, referencePublicKey, {
        finality: options.finality || 'confirmed',
        ...options
      });

      return signatureInfo;
    } catch (error) {
      if (error instanceof FindReferenceError) {
        return null; // Transaction not found yet
      }
      throw error;
    }
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed'
      });

      if (!transaction) {
        return null;
      }

      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
        status: transaction.meta?.err ? 'failed' : 'confirmed',
        accounts: transaction.transaction.message.accountKeys.map(key => key.toString()),
        instructions: transaction.transaction.message.instructions.length,
        logMessages: transaction.meta?.logMessages || [],
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      return null;
    }
  }

  /**
   * Check if an account has sufficient balance
   */
  async checkBalance(publicKey, tokenMint = null) {
    try {
      if (tokenMint) {
        // Check SPL token balance
        const { getAccount, getAssociatedTokenAddress } = await import('@solana/spl-token');
        
        const tokenAccount = await getAssociatedTokenAddress(
          new PublicKey(tokenMint),
          new PublicKey(publicKey)
        );

        try {
          const account = await getAccount(this.connection, tokenAccount);
          return {
            balance: account.amount.toString(),
            decimals: account.mint ? 6 : 0, // Assume 6 decimals for USDC
            hasBalance: account.amount > 0n
          };
        } catch (error) {
          // Account doesn't exist or has no balance
          return { balance: '0', decimals: 6, hasBalance: false };
        }
      } else {
        // Check SOL balance
        const balance = await this.connection.getBalance(new PublicKey(publicKey));
        return {
          balance: balance.toString(),
          decimals: 9,
          hasBalance: balance > 0
        };
      }
    } catch (error) {
      console.error('Error checking balance:', error);
      return { balance: '0', decimals: 0, hasBalance: false };
    }
  }

  /**
   * Generate a unique reference key
   */
  generateReference() {
    return Keypair.generate().publicKey;
  }

  /**
   * Calculate AfriPay fees
   */
  calculateAfriPayFees(amount, currency = 'USDC') {
    const originalAmount = new BigNumber(amount);
    
    // Calculate percentage fee
    const percentageFee = originalAmount.multipliedBy(AFRIPAY_CONFIG.feeRate);
    
    // Fixed fee in token terms (simplified)
    const fixedFeeInToken = currency === 'SOL' ? 0.002 : 0.30;
    const fixedFee = new BigNumber(fixedFeeInToken);
    
    const totalFee = percentageFee.plus(fixedFee);
    const customerPays = originalAmount.plus(totalFee);
    
    return {
      originalAmount: originalAmount,
      afripayFee: totalFee,
      merchantReceives: originalAmount,
      total: customerPays,
      // For compatibility with existing frontend code, also include number versions
      originalAmountNumber: originalAmount.toNumber(),
      afripayFeeNumber: totalFee.toNumber(),
      totalNumber: customerPays.toNumber(),
    };
  }

  /**
   * Health check - verify connection to Solana
   */
  async healthCheck() {
    try {
      const version = await this.connection.getVersion();
      const slot = await this.connection.getSlot();
      
      return {
        healthy: true,
        version: version['solana-core'],
        slot,
        rpcEndpoint: SOLANA_CONFIG.rpcEndpoint
      };
    } catch (error) {
      console.error('Solana health check failed:', error);
      return {
        healthy: false,
        error: error.message,
        rpcEndpoint: SOLANA_CONFIG.rpcEndpoint
      };
    }
  }
}

// Export singleton instance
export const solanaService = new SolanaService();
