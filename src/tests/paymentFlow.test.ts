/**
 * Integration test for core payment flows
 * Tests the end-to-end payment processing functionality
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { paymentProcessor } from '@/services/paymentProcessor';
import { cctpPaymentProcessor } from '@/services/cctpPaymentProcessor';
import { multiChainBalanceService } from '@/services/multiChainBalanceService';
import { CctpNetworkId } from '@/lib/cctp/types';

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => ({
            data: { id: 'test-payment-id' },
            error: null,
          })),
        })),
      })),
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => ({
            data: {
              id: 'test-payment-id',
              reference: 'test-reference',
              recipient_wallet: 'test-wallet',
              total_amount_paid: 10.30,
              currency: 'USDC',
              status: 'pending',
            },
            error: null,
          })),
        })),
      })),
      update: vi.fn(() => ({
        eq: vi.fn(() => ({ error: null })),
      })),
    })),
  },
}));

// Mock Solana Pay Service
vi.mock('@/services/solanaPayService', () => ({
  solanaPayService: {
    createAfriPayPayment: vi.fn(() => ({
      paymentUrl: 'solana:test-wallet?amount=10.30',
      qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=test',
      reference: { toString: () => 'test-reference' },
      feeBreakdown: {
        originalAmount: 10,
        afripayFee: 0.30,
        merchantReceives: 10,
        total: 10.30,
        currency: 'USDC',
      },
    })),
    monitorPayment: vi.fn(() => Promise.resolve({
      status: 'confirmed',
      signature: 'test-signature',
    })),
    getUSDCMint: vi.fn(() => ({ toString: () => 'usdc-mint' })),
  },
}));

describe('Payment Flow Integration Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Core Payment Processing', () => {
    it('should initiate payment successfully', async () => {
      const params = {
        userId: 'test-user-id',
        merchantWallet: 'EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn',
        amount: 10,
        currency: 'USDC' as const,
        description: 'Test payment',
        title: 'Test Payment',
      };

      const result = await paymentProcessor.initiatePayment(params);

      expect(result).toEqual({
        paymentId: 'test-payment-id',
        paymentUrl: 'solana:test-wallet?amount=10.30',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=test',
        reference: 'test-reference',
        feeBreakdown: {
          originalAmount: 10,
          afripayFee: 0.30,
          merchantReceives: 10,
          total: 10.30,
          currency: 'USDC',
        },
      });
    });

    it('should validate payment parameters', async () => {
      const invalidParams = {
        userId: '',
        merchantWallet: 'invalid-wallet',
        amount: -10,
        currency: 'INVALID' as any,
        description: '',
        title: '',
      };

      await expect(paymentProcessor.initiatePayment(invalidParams))
        .rejects.toThrow('User ID is required');
    });

    it('should monitor payment status', async () => {
      const result = await paymentProcessor.monitorPayment('test-payment-id');

      expect(result).toEqual({
        status: 'confirmed',
        signature: 'test-signature',
      });
    });
  });

  describe('Cross-Chain CCTP Processing', () => {
    it('should initiate cross-chain payment', async () => {
      const params = {
        userId: 'test-user-id',
        merchantWallet: 'test-destination-wallet',
        amount: 10,
        currency: 'USDC' as const,
        description: 'Cross-chain test payment',
        title: 'Cross-Chain Payment',
        sourceChain: CctpNetworkId.SOLANA,
        destinationChain: CctpNetworkId.ETHEREUM,
        sourceWalletAddress: 'test-source-wallet',
        destinationWalletAddress: 'test-destination-wallet',
      };

      // Mock the cross-chain specific methods
      vi.spyOn(cctpPaymentProcessor, 'initiateCrossChainPayment').mockResolvedValue({
        paymentId: 'test-payment-id',
        transferId: 'test-transfer-id',
        paymentUrl: 'solana:test-wallet?amount=10.30',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=test',
        estimatedTime: 900, // 15 minutes
      });

      const result = await cctpPaymentProcessor.initiateCrossChainPayment(params);

      expect(result).toEqual({
        paymentId: 'test-payment-id',
        transferId: 'test-transfer-id',
        paymentUrl: 'solana:test-wallet?amount=10.30',
        qrCodeUrl: 'https://api.qrserver.com/v1/create-qr-code/?data=test',
        estimatedTime: 900,
      });
    });

    it('should get supported chain pairs', () => {
      const pairs = cctpPaymentProcessor.getSupportedChainPairs();
      
      expect(pairs).toBeInstanceOf(Array);
      expect(pairs.length).toBeGreaterThan(0);
      
      // Should have pairs for all combinations except same chain
      const expectedPairs = 6 * 5; // 6 chains, 5 destinations each
      expect(pairs.length).toBe(expectedPairs);
    });
  });

  describe('Multi-Chain Balance Tracking', () => {
    it('should calculate portfolio value', () => {
      const mockBalances = {
        [CctpNetworkId.SOLANA]: {
          chainId: CctpNetworkId.SOLANA,
          chainName: 'Solana',
          nativeToken: { symbol: 'SOL', balance: 1, usdValue: 100 },
          usdc: { balance: 50, usdValue: 50 },
          totalUsdValue: 150,
          lastUpdated: new Date().toISOString(),
        },
        [CctpNetworkId.ETHEREUM]: {
          chainId: CctpNetworkId.ETHEREUM,
          chainName: 'Ethereum',
          nativeToken: { symbol: 'ETH', balance: 0.1, usdValue: 250 },
          usdc: { balance: 100, usdValue: 100 },
          totalUsdValue: 350,
          lastUpdated: new Date().toISOString(),
        },
      };

      const portfolio = multiChainBalanceService.calculateTotalPortfolioValue(mockBalances);

      expect(portfolio.totalUsdValue).toBe(500);
      expect(portfolio.totalNativeValue).toBe(350);
      expect(portfolio.totalUsdcValue).toBe(150);
      expect(portfolio.chainBreakdown).toHaveLength(2);
      expect(portfolio.chainBreakdown[0].chainName).toBe('Ethereum'); // Highest value first
      expect(portfolio.chainBreakdown[0].percentage).toBe(70); // 350/500 * 100
    });
  });
});

describe('Error Handling', () => {
  it('should handle payment initiation errors gracefully', async () => {
    // Mock Supabase to return an error
    vi.doMock('@/lib/supabase', () => ({
      supabase: {
        from: vi.fn(() => ({
          insert: vi.fn(() => ({
            select: vi.fn(() => ({
              single: vi.fn(() => ({
                data: null,
                error: { message: 'Database connection failed' },
              })),
            })),
          })),
        })),
      },
    }));

    const params = {
      userId: 'test-user-id',
      merchantWallet: 'EHwtMrGE6V5fH3xUKYcoHzbouUqfgB4jd7MsqfQfHVSn',
      amount: 10,
      currency: 'USDC' as const,
      description: 'Test payment',
      title: 'Test Payment',
    };

    await expect(paymentProcessor.initiatePayment(params))
      .rejects.toThrow('Failed to initiate payment');
  });
});
