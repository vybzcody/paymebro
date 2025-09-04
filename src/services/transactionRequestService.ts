/**
 * Transaction Request Service
 * Implements Solana Pay Transaction Request URLs for interactive payments
 * Following https://docs.solanapay.com/ specification
 */

import { PublicKey } from '@solana/web3.js';

const BACKEND_URL = import.meta.env?.VITE_BACKEND_URL || 'http://localhost:3001';

export interface TransactionRequestParams {
  reference: string;
  amount?: number;
  currency?: 'SOL' | 'USDC';
  label?: string;
  message?: string;
  memo?: string;
}

export interface TransactionRequestResponse {
  label: string;
  icon: string;
}

export interface TransactionResponse {
  transaction: string;
  message?: string;
}

/**
 * Transaction Request Service Class
 * Handles interactive Solana Pay Transaction Request flows
 */
export class TransactionRequestService {
  private baseUrl: string;

  constructor(baseUrl: string = BACKEND_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Generate Transaction Request URL
   * Creates a solana: URL that points to the backend transaction endpoint
   */
  generateTransactionRequestURL(params: TransactionRequestParams): string {
    const { reference, ...queryParams } = params;
    
    // Build the backend URL with query parameters
    const backendUrl = new URL(`${this.baseUrl}/api/solana-pay/transaction`);
    backendUrl.searchParams.set('reference', reference);
    
    // Add optional parameters
    Object.entries(queryParams).forEach(([key, value]) => {
      if (value !== undefined) {
        backendUrl.searchParams.set(key, value.toString());
      }
    });

    // Create Solana Pay Transaction Request URL
    // Format: solana:<encoded-url>
    const encodedUrl = encodeURIComponent(backendUrl.toString());
    return `solana:${encodedUrl}`;
  }

  /**
   * Make GET request to transaction endpoint
   * Gets label and icon for the payment request
   */
  async getTransactionDetails(reference: string): Promise<TransactionRequestResponse> {
    const url = `${this.baseUrl}/api/solana-pay/transaction?reference=${reference}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get transaction details: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Make POST request to transaction endpoint
   * Creates the actual transaction for the wallet to sign
   */
  async createTransaction(reference: string, account: PublicKey): Promise<TransactionResponse> {
    const url = `${this.baseUrl}/api/solana-pay/transaction?reference=${reference}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Accept-Encoding': 'gzip, deflate, br',
      },
      body: JSON.stringify({
        account: account.toString(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Failed to create transaction: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Generate QR code data for Transaction Request
   * Returns the Transaction Request URL for QR code generation
   */
  generateQRCodeData(params: TransactionRequestParams): string {
    return this.generateTransactionRequestURL(params);
  }

  /**
   * Validate Transaction Request URL
   * Checks if a URL is a valid Solana Pay Transaction Request
   */
  static isValidTransactionRequestURL(url: string): boolean {
    try {
      if (!url.startsWith('solana:')) {
        return false;
      }

      const encodedUrl = url.slice(7); // Remove 'solana:' prefix
      const decodedUrl = decodeURIComponent(encodedUrl);
      
      // Check if it's a valid HTTPS URL
      const parsedUrl = new URL(decodedUrl);
      return parsedUrl.protocol === 'https:';
    } catch {
      return false;
    }
  }

  /**
   * Parse Transaction Request URL
   * Extracts the backend URL from a Solana Pay Transaction Request URL
   */
  static parseTransactionRequestURL(url: string): URL | null {
    try {
      if (!this.isValidTransactionRequestURL(url)) {
        return null;
      }

      const encodedUrl = url.slice(7); // Remove 'solana:' prefix
      const decodedUrl = decodeURIComponent(encodedUrl);
      return new URL(decodedUrl);
    } catch {
      return null;
    }
  }
}

// Export singleton instance
export const transactionRequestService = new TransactionRequestService();
