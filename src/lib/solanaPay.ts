import { 
  Connection, 
  PublicKey, 
  Transaction,
  VersionedTransaction,
  TransactionMessage,
  SystemProgram,
  LAMPORTS_PER_SOL,
  Keypair 
} from '@solana/web3.js';
import { 
  createTransferCheckedInstruction,
  getAssociatedTokenAddress,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token';
import { encodeURL, parseURL, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

// Constants
export const USDC_MINT = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // Mainnet USDC
export const USDC_TESTNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'); // Testnet USDC

// AfriPay Platform Configuration (Stripe-like model)
export const AFRIPAY_PLATFORM_WALLET = new PublicKey('EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn'); // AfriPay fee collection wallet
export const AFRIPAY_FEE_RATE = 0.029; // 2.9% transaction fee (same as Stripe)
export const AFRIPAY_FIXED_FEE = 0.30; // $0.30 fixed fee (in USD equivalent)

// Get the appropriate USDC mint based on environment
export const getUSDCMint = () => {
  const network = import.meta.env.VITE_SOLANA_NETWORK || 'devnet';
  return network === 'mainnet-beta' ? USDC_MINT : USDC_TESTNET_MINT;
};

// Get RPC endpoint
export const getRPCEndpoint = () => {
  return import.meta.env.VITE_SOLANA_RPC_URL || 'https://api.devnet.solana.com';
};

// Create connection
export const getConnection = () => {
  return new Connection(getRPCEndpoint(), 'confirmed');
};

// Payment request interfaces
export interface PaymentRequest {
  recipient: PublicKey;
  amount: BigNumber;
  splToken?: PublicKey;
  reference: PublicKey;
  label: string;
  message: string;
  memo?: string;
  // merchantId?: string;
  // includeAfriPayFee?: boolean;
  
}


export interface PaymentBreakdown {
  originalAmount: BigNumber;
  afripayFee: BigNumber;
  merchantReceives: BigNumber;
  total: BigNumber; // What customer pays
}

export interface AfriPayTransaction {
  id: string;
  merchantId: string;
  merchantWallet: string;
  customerEmail?: string;
  customerName?: string;
  amount: BigNumber;
  currency: 'SOL' | 'USDC';
  afripayFee: BigNumber;
  merchantReceives: BigNumber;
  status: 'pending' | 'completed' | 'failed';
  reference: PublicKey;
  signature?: string;
  createdAt: Date;
  completedAt?: Date;
  description: string;
  memo?: string;
}

export interface PaymentResponse {
  paymentUrl: string;
  qrCodeUrl: string;
  reference: PublicKey;
  transaction?: Transaction;
}

/**
 * Create a Solana Pay payment request URL
 */
export function createPaymentRequest({
  recipient,
  amount,
  splToken,
  reference,
  label,
  message,
  memo
}: PaymentRequest): PaymentResponse {
  // Create the payment URL
  const url = encodeURL({
    recipient,
    amount,
    splToken,
    reference,
    label,
    message,
    memo
  });

  // Generate QR code URL (using a free QR code service)
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(url.toString())}`;

  return {
    paymentUrl: url.toString(),
    qrCodeUrl,
    reference
  };
}

/**
 * Create a transaction request URL for more complex interactions
 */
export function createTransactionRequest({
  link,
  label,
  message
}: {
  link: string;
  label: string;
  message?: string;
}): PaymentResponse {
  // For transaction requests, we use the solana: protocol
  const paymentUrl = `solana:${encodeURIComponent(link)}`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(paymentUrl)}`;

  // Generate a reference for tracking
  const reference = generateReference();

  return {
    paymentUrl,
    qrCodeUrl,
    reference
  };
}

/**
 * Validate a completed transfer transaction
 */
export async function validatePayment(
  connection: Connection,
  signature: string,
  expectedRecipient: PublicKey,
  expectedAmount: BigNumber,
  expectedSplToken?: PublicKey
): Promise<boolean> {
  try {
    // Get the transaction
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    if (!transaction || transaction.meta?.err) {
      return false;
    }

    // Use Solana Pay's built-in validation
    const result = await validateTransfer(
      connection,
      signature,
      {
        recipient: expectedRecipient,
        amount: expectedAmount,
        splToken: expectedSplToken,
        reference: new PublicKey('11111111111111111111111111111111') // Dummy reference for validation
      }
    );

    return result !== null;
  } catch (error) {
    console.error('Payment validation error:', error);
    return false;
  }
}

/**
 * Check transaction status by reference
 */
export async function checkPaymentStatus(
  connection: Connection,
  reference: PublicKey,
  timeout: number = 60000 // 1 minute timeout
): Promise<{ status: 'pending' | 'confirmed' | 'failed'; signature?: string }> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    try {
      // Get signatures for the reference address
      const signatures = await connection.getSignaturesForAddress(reference, { limit: 1 });

      if (signatures.length > 0) {
        const signature = signatures[0];
        
        // Check if the transaction was successful
        const transaction = await connection.getTransaction(signature.signature, {
          commitment: 'confirmed'
        });

        if (transaction && !transaction.meta?.err) {
          return { status: 'confirmed', signature: signature.signature };
        } else {
          return { status: 'failed', signature: signature.signature };
        }
      }

      // Wait 2 seconds before checking again
      await new Promise(resolve => setTimeout(resolve, 2000));
    } catch (error) {
      console.error('Error checking payment status:', error);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  return { status: 'pending' };
}

/**
 * Generate a unique reference key for tracking payments
 */
export function generateReference(): PublicKey {
  // Generate a new keypair and return its public key
  // This ensures we always get a valid public key
  return Keypair.generate().publicKey;
}

/**
 * Parse a Solana Pay URL
 */
export function parseSolanaPayURL(url: string) {
  try {
    return parseURL(url);
  } catch (error) {
    console.error('Error parsing Solana Pay URL:', error);
    return null;
  }
}

/**
 * Create a simple SOL transfer payment
 */
export function createSOLPayment({
  recipient,
  amount,
  label,
  message,
  memo
}: {
  recipient: PublicKey;
  amount: number; // in SOL
  label: string;
  message: string;
  memo?: string;
}): PaymentResponse {
  const reference = generateReference();

  return createPaymentRequest({
    recipient,
    amount: new BigNumber(amount),
    reference,
    label,
    message,
    memo
  });
}

/**
 * Create a USDC payment
 */
export function createUSDCPayment({
  recipient,
  amount,
  label,
  message,
  memo
}: {
  recipient: PublicKey;
  amount: number; // in USDC
  label: string;
  message: string;
  memo?: string;
}): PaymentResponse {
  const reference = generateReference();

  return createPaymentRequest({
    recipient,
    amount: new BigNumber(amount),
    splToken: getUSDCMint(),
    reference,
    label,
    message,
    memo
  });
}

/**
 * Create a payment request with custom SPL token
 */
export function createSPLPayment({
  recipient,
  amount,
  splToken,
  label,
  message,
  memo
}: {
  recipient: PublicKey;
  amount: number;
  splToken: PublicKey;
  label: string;
  message: string;
  memo?: string;
}): PaymentResponse {
  const reference = generateReference();

  return createPaymentRequest({
    recipient,
    amount: new BigNumber(amount),
    splToken,
    reference,
    label,
    message,
    memo
  });
}

/**
 * Get payment details from a transaction signature
 */
export async function getPaymentDetails(
  connection: Connection,
  signature: string
): Promise<{
  sender: string;
  recipient: string;
  amount: number;
  token?: string;
  timestamp: number;
} | null> {
  try {
    const transaction = await connection.getTransaction(signature, {
      commitment: 'confirmed'
    });

    if (!transaction || transaction.meta?.err) {
      return null;
    }

    // Extract payment details from transaction
    const { message } = transaction.transaction;
    const accountKeys = message.accountKeys;

    return {
      sender: accountKeys[0].toString(),
      recipient: accountKeys[1].toString(),
      amount: 0, // Would need to parse instruction data
      timestamp: transaction.blockTime || 0
    };
  } catch (error) {
    console.error('Error getting payment details:', error);
    return null;
  }
}

/**
 * Utility to format amounts for display
 */
export function formatAmount(amount: BigNumber, decimals: number = 6): string {
  return amount.dividedBy(new BigNumber(10).pow(decimals)).toFixed();
}

/**
 * Convert display amount to blockchain amount (with decimals)
 */
export function toBlockchainAmount(amount: number, decimals: number = 6): BigNumber {
  return new BigNumber(amount).multipliedBy(new BigNumber(10).pow(decimals));
}

// ============ AFRIPAY STRIPE-LIKE BUSINESS MODEL ============

/**
 * Calculate AfriPay fees (Stripe-like model)
 * Customer pays: Original Amount + AfriPay Fee
 * Merchant receives: Original Amount
 * AfriPay receives: Fee
 */
export function calculateAfriPayFees(amount: number, currency: 'SOL' | 'USDC'): PaymentBreakdown {
  const originalAmount = new BigNumber(amount);
  
  // Calculate percentage fee (2.9% like Stripe)
  const percentageFee = originalAmount.multipliedBy(AFRIPAY_FEE_RATE);
  
  // For simplicity, we'll use a fixed fee equivalent in SOL/USDC
  // In production, you'd convert USD fixed fee to current SOL/USDC rate
  const fixedFeeInToken = currency === 'SOL' ? 0.002 : 0.30; // ~$0.30 equivalent
  const fixedFee = new BigNumber(fixedFeeInToken);
  
  const totalFee = percentageFee.plus(fixedFee);
  const customerPays = originalAmount.plus(totalFee);
  
  return {
    originalAmount,
    afripayFee: totalFee,
    merchantReceives: originalAmount,
    total: customerPays
  };
}

/**
 * Create an AfriPay transaction record (like Stripe's charge object)
 */
export function createAfriPayTransaction({
  merchantWallet,
  amount,
  currency,
  description,
  customerEmail,
  customerName,
  memo
}: {
  merchantWallet: string;
  amount: number;
  currency: 'SOL' | 'USDC';
  description: string;
  customerEmail?: string;
  customerName?: string;
  memo?: string;
}): AfriPayTransaction {
  const fees = calculateAfriPayFees(amount, currency);
  const reference = generateReference();
  const transactionId = `afp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  return {
    id: transactionId,
    merchantId: merchantWallet, // In production, this would be a proper merchant ID
    merchantWallet,
    customerEmail,
    customerName,
    amount: fees.originalAmount,
    currency,
    afripayFee: fees.afripayFee,
    merchantReceives: fees.merchantReceives,
    status: 'pending',
    reference,
    createdAt: new Date(),
    description,
    memo
  };
}

/**
 * Create Stripe-like payment with AfriPay fees
 * This creates a payment request where:
 * - Customer pays: amount + AfriPay fees
 * - Merchant receives: amount (full amount they requested)
 * - AfriPay receives: fees (automatically)
 */
export function createAfriPayPayment({
  merchantWallet,
  amount,
  currency,
  description,
  customerEmail,
  customerName,
  memo,
  merchantName
}: {
  merchantWallet: PublicKey;
  amount: number;
  currency: 'SOL' | 'USDC';
  description: string;
  customerEmail?: string;
  customerName?: string;
  memo?: string;
  merchantName?: string;
}): {
  paymentResponse: PaymentResponse;
  transaction: AfriPayTransaction;
  breakdown: PaymentBreakdown;
} {
  // Create the transaction record
  const transaction = createAfriPayTransaction({
    merchantWallet: merchantWallet.toString(),
    amount,
    currency,
    description,
    customerEmail,
    customerName,
    memo
  });
  
  // Calculate what customer actually pays (including fees)
  const breakdown = calculateAfriPayFees(amount, currency);
  
  // Create the payment request for the TOTAL amount (what customer pays)
  let paymentResponse: PaymentResponse;
  
  if (currency === 'SOL') {
    paymentResponse = createSOLPayment({
      recipient: merchantWallet,
      amount: breakdown.total.toNumber(),
      label: merchantName || 'AfriPay Merchant',
      message: `${description} (includes ${breakdown.afripayFee.toFixed(4)} ${currency} AfriPay fee)`,
      memo: memo || `AfriPay Transaction: ${transaction.id}`
    });
  } else {
    paymentResponse = createUSDCPayment({
      recipient: merchantWallet,
      amount: breakdown.total.toNumber(),
      label: merchantName || 'AfriPay Merchant',
      message: `${description} (includes ${breakdown.afripayFee.toFixed(2)} ${currency} AfriPay fee)`,
      memo: memo || `AfriPay Transaction: ${transaction.id}`
    });
  }
  
  // Update transaction with reference from payment
  transaction.reference = paymentResponse.reference;
  
  return {
    paymentResponse,
    transaction,
    breakdown
  };
}

/**
 * Process fee collection (would be called after payment confirmation)
 * In a real implementation, this would:
 * 1. Verify the payment to merchant
 * 2. Send AfriPay fee to platform wallet
 * 3. Update transaction status
 */
export async function processAfriPayFeeCollection(
  transaction: AfriPayTransaction,
  paymentSignature: string
): Promise<{ success: boolean; feeTransactionSignature?: string; error?: string }> {
  try {
    // In a real implementation, you would:
    // 1. Create a transaction to send the fee amount from merchant to AfriPay
    // 2. This could be done via a smart contract or separate transaction
    // 3. Update the transaction record in your database
    
    console.log('Processing fee collection for transaction:', transaction.id);
    console.log('Original payment signature:', paymentSignature);
    console.log('AfriPay fee:', transaction.afripayFee.toString(), transaction.currency);
    
    // For demo purposes, we'll just simulate success
    // In production, implement actual fee collection logic
    
    return {
      success: true,
      feeTransactionSignature: `fee_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  } catch (error) {
    console.error('Fee collection error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Fee collection failed'
    };
  }
}
