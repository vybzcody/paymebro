/**
 * Solana Pay utility for generating proper payment URLs
 * Based on Solana Pay specification: https://docs.solanapay.com/spec
 */

export interface SolanaPayParams {
  recipient: string;
  amount?: number;
  currency?: 'SOL' | 'USDC';
  label?: string;
  message?: string;
  memo?: string;
  reference?: string;
}

/**
 * USDC token mint address on different Solana networks
 */
export const USDC_MINT_ADDRESSES = {
  mainnet: 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v',
  devnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU',
  testnet: '4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU'
};

/**
 * Generate a proper Solana Pay URL
 */
export function generateSolanaPayURL(params: SolanaPayParams, network: 'mainnet' | 'devnet' | 'testnet' = 'devnet'): string {
  const { recipient, amount, currency = 'SOL', label, message, memo, reference } = params;
  
  // Validate recipient address
  if (!recipient) {
    throw new Error('Recipient address is required');
  }
  
  // Start building the URL
  let url = `solana:${recipient}`;
  const urlParams = new URLSearchParams();
  
  // Add amount if provided
  if (amount !== undefined && amount > 0) {
    urlParams.append('amount', amount.toString());
  }
  
  // Add SPL token mint for USDC
  if (currency === 'USDC') {
    const usdcMint = USDC_MINT_ADDRESSES[network];
    urlParams.append('spl-token', usdcMint);
  }
  
  // Add optional parameters
  if (reference) {
    urlParams.append('reference', reference);
  }
  
  if (label) {
    urlParams.append('label', label);
  }
  
  if (message) {
    urlParams.append('message', message);
  }
  
  if (memo) {
    urlParams.append('memo', memo);
  }
  
  // Append parameters if any exist
  if (urlParams.toString()) {
    url += `?${urlParams.toString()}`;
  }
  
  return url;
}

/**
 * Generate a transfer request URL (for server-side processing)
 * This creates a URL that points to your backend API for transaction processing
 */
export function generateTransferRequestURL(params: SolanaPayParams & { 
  baseUrl?: string;
  paymentId?: string;
}): string {
  const { baseUrl = window.location.origin, paymentId, ...solanaParams } = params;
  
  // Create the transfer request URL that points to your API
  const transferUrl = new URL('/api/solana-pay/transfer', baseUrl);
  
  // Add payment ID if provided
  if (paymentId) {
    transferUrl.searchParams.append('payment_id', paymentId);
  }
  
  // Add other parameters
  Object.entries(solanaParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      transferUrl.searchParams.append(key, value.toString());
    }
  });
  
  return transferUrl.toString();
}

/**
 * Validate a Solana Pay URL
 */
export function validateSolanaPayURL(url: string): {
  isValid: boolean;
  errors: string[];
  parsed?: SolanaPayParams;
} {
  const errors: string[] = [];
  
  try {
    if (!url.startsWith('solana:')) {
      errors.push('URL must start with "solana:"');
      return { isValid: false, errors };
    }
    
    const urlObj = new URL(url);
    const recipient = urlObj.pathname.slice(1); // Remove leading slash
    
    if (!recipient) {
      errors.push('Recipient address is required');
    }
    
    // Basic validation of recipient address (44 character base58)
    if (recipient && (recipient.length < 32 || recipient.length > 44)) {
      errors.push('Invalid recipient address format');
    }
    
    const amount = urlObj.searchParams.get('amount');
    if (amount && (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0)) {
      errors.push('Invalid amount');
    }
    
    const parsed: SolanaPayParams = {
      recipient,
      amount: amount ? parseFloat(amount) : undefined,
      currency: urlObj.searchParams.get('spl-token') ? 'USDC' : 'SOL',
      label: urlObj.searchParams.get('label') || undefined,
      message: urlObj.searchParams.get('message') || undefined,
      memo: urlObj.searchParams.get('memo') || undefined,
      reference: urlObj.searchParams.get('reference') || undefined,
    };
    
    return {
      isValid: errors.length === 0,
      errors,
      parsed
    };
  } catch (error) {
    errors.push(`Failed to parse URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    return { isValid: false, errors };
  }
}

/**
 * Generate QR code URL for a Solana Pay URL
 */
export function generateSolanaPayQRCode(solanaPayUrl: string, options: {
  size?: number;
  margin?: number;
  errorCorrection?: 'L' | 'M' | 'Q' | 'H';
} = {}): string {
  const {
    size = 400,
    margin = 10,
    errorCorrection = 'M'
  } = options;
  
  const qrServiceUrl = new URL('https://api.qrserver.com/v1/create-qr-code/');
  qrServiceUrl.searchParams.append('size', `${size}x${size}`);
  qrServiceUrl.searchParams.append('format', 'png');
  qrServiceUrl.searchParams.append('margin', margin.toString());
  qrServiceUrl.searchParams.append('ecc', errorCorrection);
  qrServiceUrl.searchParams.append('data', solanaPayUrl);
  
  return qrServiceUrl.toString();
}
