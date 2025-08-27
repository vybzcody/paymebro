/**
 * Solana Pay Service - Official Implementation
 * Following https://docs.solanapay.com/ specification
 */

import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair,
  TransactionInstruction,
  ComputeBudgetProgram,
} from '@solana/web3.js';
import {
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID,
  createAssociatedTokenAccountInstruction,
  getAccount,
} from '@solana/spl-token';
import {
  encodeURL,
  parseURL,
  validateTransfer,
  TransferRequestURL,
  TransactionRequestURL,
} from '@solana/pay';
import BigNumber from 'bignumber.js';

// Network configuration
const SOLANA_NETWORK = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
const RPC_ENDPOINT = import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';

// Token mints
const USDC_MAINNET = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v');
const USDC_DEVNET = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// AfriPay configuration
const AFRIPAY_PLATFORM_WALLET = new PublicKey('EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn');
const AFRIPAY_FEE_RATE = 0.029; // 2.9%
const AFRIPAY_FIXED_FEE_USD = 0.30; // $0.30

/**
 * Solana Pay Service Class
 * Implements the official Solana Pay specification
 */
export class SolanaPayService {
  private connection: Connection;
  private usdcMint: PublicKey;

  constructor() {
    this.connection = new Connection(RPC_ENDPOINT, 'confirmed');
    this.usdcMint = SOLANA_NETWORK === 'mainnet-beta' ? USDC_MAINNET : USDC_DEVNET;
  }

  /**
   * Get connection instance
   */
  getConnection(): Connection {
    return this.connection;
  }

  /**
   * Get USDC mint for current network
   */
  getUSDCMint(): PublicKey {
    return this.usdcMint;
  }

  /**
   * Generate a unique reference key
   */
  generateReference(): PublicKey {
    return Keypair.generate().publicKey;
  }

  /**
   * Create a Solana Pay Transfer Request URL
   * Following: https://docs.solanapay.com/spec#transfer-request
   */
  createTransferRequest(params: {
    recipient: PublicKey;
    amount: BigNumber;
    splToken?: PublicKey;
    reference?: PublicKey;
    label: string;
    message: string;
    memo?: string;
  }): {
    url: URL;
    reference: PublicKey;
  } {
    const reference = params.reference || this.generateReference();

    const transferRequest: TransferRequestURL = {
      recipient: params.recipient,
      amount: params.amount,
      splToken: params.splToken,
      reference,
      label: params.label,
      message: params.message,
      memo: params.memo,
    };

    const url = encodeURL(transferRequest);

    return { url, reference };
  }

  /**
   * Create a Solana Pay Transaction Request URL
   * Following: https://docs.solanapay.com/spec#transaction-request
   */
  createTransactionRequest(params: {
    link: string;
    label: string;
    message?: string;
  }): URL {
    const transactionRequest: TransactionRequestURL = {
      link: params.link,
      label: params.label,
      message: params.message,
    };

    return encodeURL(transactionRequest);
  }

  /**
   * Parse a Solana Pay URL
   */
  parseURL(url: string | URL) {
    try {
      return parseURL(url);
    } catch (error) {
      console.error('Error parsing Solana Pay URL:', error);
      throw new Error(`Invalid Solana Pay URL: ${error}`);
    }
  }

  /**
   * Validate a completed transfer
   * Following: https://docs.solanapay.com/spec#validating-the-transfer
   */
  async validateTransfer(
    signature: string,
    params: {
      recipient: PublicKey;
      amount: BigNumber;
      splToken?: PublicKey;
      reference?: PublicKey;
    }
  ): Promise<boolean> {
    try {
      const result = await validateTransfer(
        this.connection,
        signature,
        {
          recipient: params.recipient,
          amount: params.amount,
          splToken: params.splToken,
          reference: params.reference,
        },
        { commitment: 'confirmed' }
      );

      return result !== null;
    } catch (error) {
      console.error('Transfer validation error:', error);
      return false;
    }
  }

  /**
   * Find transactions by reference
   * Following: https://docs.solanapay.com/spec#finding-the-transaction
   */
  async findTransactionsByReference(
    reference: PublicKey,
    options?: {
      until?: string;
      limit?: number;
    }
  ): Promise<string[]> {
    try {
      const signatures = await this.connection.getSignaturesForAddress(
        reference,
        {
          until: options?.until,
          limit: options?.limit || 10,
        }
      );

      return signatures.map(sig => sig.signature);
    } catch (error) {
      console.error('Error finding transactions:', error);
      return [];
    }
  }

  /**
   * Create a SOL transfer payment
   */
  createSOLPayment(params: {
    recipient: PublicKey;
    amount: number; // in SOL
    label: string;
    message: string;
    memo?: string;
  }) {
    const { url, reference } = this.createTransferRequest({
      recipient: params.recipient,
      amount: new BigNumber(params.amount),
      label: params.label,
      message: params.message,
      memo: params.memo,
    });

    return {
      paymentUrl: url.toString(),
      qrCodeUrl: this.generateQRCode(url.toString()),
      reference,
    };
  }

  /**
   * Create a USDC transfer payment
   */
  createUSDCPayment(params: {
    recipient: PublicKey;
    amount: number; // in USDC
    label: string;
    message: string;
    memo?: string;
  }) {
    const { url, reference } = this.createTransferRequest({
      recipient: params.recipient,
      amount: new BigNumber(params.amount),
      splToken: this.usdcMint,
      label: params.label,
      message: params.message,
      memo: params.memo,
    });

    return {
      paymentUrl: url.toString(),
      qrCodeUrl: this.generateQRCode(url.toString()),
      reference,
    };
  }

  /**
   * Create a custom SPL token payment
   */
  createSPLPayment(params: {
    recipient: PublicKey;
    amount: number;
    splToken: PublicKey;
    label: string;
    message: string;
    memo?: string;
  }) {
    const { url, reference } = this.createTransferRequest({
      recipient: params.recipient,
      amount: new BigNumber(params.amount),
      splToken: params.splToken,
      label: params.label,
      message: params.message,
      memo: params.memo,
    });

    return {
      paymentUrl: url.toString(),
      qrCodeUrl: this.generateQRCode(url.toString()),
      reference,
    };
  }

  /**
   * Generate QR code URL
   */
  private generateQRCode(data: string): string {
    return `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(data)}`;
  }

  /**
   * Monitor payment status by reference
   */
  async monitorPayment(
    reference: PublicKey,
    expectedParams: {
      recipient: PublicKey;
      amount: BigNumber;
      splToken?: PublicKey;
    },
    options?: {
      timeout?: number; // milliseconds
      interval?: number; // milliseconds
    }
  ): Promise<{
    status: 'confirmed' | 'failed' | 'timeout';
    signature?: string;
    error?: string;
  }> {
    const timeout = options?.timeout || 300000; // 5 minutes default
    const interval = options?.interval || 2000; // 2 seconds default
    const startTime = Date.now();

    while (Date.now() - startTime < timeout) {
      try {
        const signatures = await this.findTransactionsByReference(reference, { limit: 1 });

        if (signatures.length > 0) {
          const signature = signatures[0];
          
          // Validate the transaction
          const isValid = await this.validateTransfer(signature, {
            recipient: expectedParams.recipient,
            amount: expectedParams.amount,
            splToken: expectedParams.splToken,
            reference,
          });

          if (isValid) {
            return { status: 'confirmed', signature };
          } else {
            return { status: 'failed', signature, error: 'Transaction validation failed' };
          }
        }

        // Wait before checking again
        await new Promise(resolve => setTimeout(resolve, interval));
      } catch (error) {
        console.error('Error monitoring payment:', error);
        await new Promise(resolve => setTimeout(resolve, interval));
      }
    }

    return { status: 'timeout', error: 'Payment monitoring timed out' };
  }

  /**
   * Get transaction details
   */
  async getTransactionDetails(signature: string) {
    try {
      const transaction = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      });

      if (!transaction) {
        throw new Error('Transaction not found');
      }

      return {
        signature,
        slot: transaction.slot,
        blockTime: transaction.blockTime,
        fee: transaction.meta?.fee,
        success: !transaction.meta?.err,
        error: transaction.meta?.err,
        logs: transaction.meta?.logMessages,
      };
    } catch (error) {
      console.error('Error getting transaction details:', error);
      throw error;
    }
  }

  /**
   * Calculate AfriPay fees (Stripe-like model)
   */
  calculateAfriPayFees(amount: number, currency: 'SOL' | 'USDC') {
    const originalAmount = new BigNumber(amount);
    
    // Calculate percentage fee (2.9%)
    const percentageFee = originalAmount.multipliedBy(AFRIPAY_FEE_RATE);
    
    // Fixed fee in token equivalent
    const fixedFeeInToken = currency === 'SOL' ? 0.002 : AFRIPAY_FIXED_FEE_USD;
    const fixedFee = new BigNumber(fixedFeeInToken);
    
    const totalFee = percentageFee.plus(fixedFee);
    const customerPays = originalAmount.plus(totalFee);
    
    return {
      originalAmount: originalAmount.toNumber(),
      afripayFee: totalFee.toNumber(),
      merchantReceives: originalAmount.toNumber(),
      total: customerPays.toNumber(),
      currency,
    };
  }

  /**
   * Create AfriPay payment with fees
   */
  createAfriPayPayment(params: {
    merchantWallet: PublicKey;
    amount: number;
    currency: 'SOL' | 'USDC';
    description: string;
    merchantName?: string;
    customerEmail?: string;
    customerName?: string;
    memo?: string;
  }) {
    const fees = this.calculateAfriPayFees(params.amount, params.currency);
    
    // Create payment for the total amount (original + fees)
    let paymentResult;
    
    if (params.currency === 'SOL') {
      paymentResult = this.createSOLPayment({
        recipient: params.merchantWallet,
        amount: fees.total,
        label: params.merchantName || 'AfriPay Merchant',
        message: `${params.description} (includes ${fees.afripayFee.toFixed(4)} ${params.currency} AfriPay fee)`,
        memo: params.memo,
      });
    } else {
      paymentResult = this.createUSDCPayment({
        recipient: params.merchantWallet,
        amount: fees.total,
        label: params.merchantName || 'AfriPay Merchant',
        message: `${params.description} (includes ${fees.afripayFee.toFixed(2)} ${params.currency} AfriPay fee)`,
        memo: params.memo,
      });
    }

    return {
      ...paymentResult,
      feeBreakdown: fees,
      transactionDetails: {
        originalAmount: fees.originalAmount,
        afripayFee: fees.afripayFee,
        totalCustomerPays: fees.total,
        merchantReceives: fees.merchantReceives,
        currency: params.currency,
      },
    };
  }

  /**
   * Create a transaction request for complex payments
   * This allows for custom transaction logic on the backend
   */
  createTransactionRequestPayment(params: {
    endpoint: string; // Backend endpoint that will create the transaction
    label: string;
    message?: string;
  }) {
    const url = this.createTransactionRequest({
      link: params.endpoint,
      label: params.label,
      message: params.message,
    });

    return {
      paymentUrl: url.toString(),
      qrCodeUrl: this.generateQRCode(url.toString()),
    };
  }

  /**
   * Utility: Convert display amount to lamports (for SOL)
   */
  static toLamports(sol: number): number {
    return Math.floor(sol * LAMPORTS_PER_SOL);
  }

  /**
   * Utility: Convert lamports to SOL
   */
  static fromLamports(lamports: number): number {
    return lamports / LAMPORTS_PER_SOL;
  }

  /**
   * Utility: Convert display amount to token units (with decimals)
   */
  static toTokenUnits(amount: number, decimals: number = 6): BigNumber {
    return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
  }

  /**
   * Utility: Convert token units to display amount
   */
  static fromTokenUnits(units: BigNumber, decimals: number = 6): number {
    return units.dividedBy(new BigNumber(10).pow(decimals)).toNumber();
  }

  /**
   * Format amount for display
   */
  static formatAmount(amount: number, currency: string, decimals: number = 2): string {
    return `${amount.toFixed(decimals)} ${currency}`;
  }

  /**
   * Check if a public key is valid
   */
  static isValidPublicKey(key: string): boolean {
    try {
      new PublicKey(key);
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const solanaPayService = new SolanaPayService();

// Export types
export interface PaymentRequest {
  recipient: PublicKey;
  amount: number;
  currency: 'SOL' | 'USDC';
  label: string;
  message: string;
  memo?: string;
  merchantName?: string;
  customerEmail?: string;
  customerName?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  qrCodeUrl: string;
  reference: PublicKey;
  feeBreakdown?: {
    originalAmount: number;
    afripayFee: number;
    merchantReceives: number;
    total: number;
    currency: string;
  };
}

export interface PaymentStatus {
  status: 'pending' | 'confirmed' | 'failed' | 'timeout';
  signature?: string;
  error?: string;
  transactionDetails?: {
    slot?: number;
    blockTime?: number;
    fee?: number;
    success?: boolean;
    logs?: string[];
  };
}
