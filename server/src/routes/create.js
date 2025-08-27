import express from 'express';
import { body, validationResult } from 'express-validator';
import { PublicKey } from '@solana/web3.js';
import { encodeURL } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { solanaService } from '../services/solana.js';
import { databaseService } from '../services/database.js';
import { SOLANA_CONFIG, AFRIPAY_CONFIG } from '../config/index.js';

const router = express.Router();

/**
 * POST /api/create - Create a new AfriPay payment request
 * This is used by merchants to create payment requests from the frontend
 */
router.post('/',
  [
    body('userId').notEmpty().isLength({ min: 1, max: 255 }).withMessage('User ID is required and must be valid'),
    body('amount').isFloat({ min: 0.000001 }).withMessage('Valid amount is required (minimum 0.000001)'),
    body('description').notEmpty().withMessage('Description is required'),
    body('recipientWallet').notEmpty().withMessage('Recipient wallet is required'),
    body('currency').optional().isIn(['USDC', 'SOL']).withMessage('Currency must be USDC or SOL'),
    body('customerEmail').optional().custom((value) => {
      if (value && value.trim() !== '') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) {
          throw new Error('Valid email required');
        }
      }
      return true;
    }),
    body('customerName').optional().custom((value) => {
      if (value && value.trim() !== '') {
        if (value.length < 1 || value.length > 100) {
          throw new Error('Customer name must be 1-100 characters');
        }
      }
      return true;
    }),
    body('merchantName').optional().custom((value) => {
      if (value && value.trim() !== '') {
        if (value.length < 1 || value.length > 100) {
          throw new Error('Merchant name must be 1-100 characters');
        }
      }
      return true;
    }),
  ],
  async (req, res) => {
    try {
      // Check validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const {
        userId,
        amount,
        description,
        recipientWallet,
        currency = 'USDC',
        customerEmail,
        customerName,
        merchantName,
        memo
      } = req.body;

      console.log('Creating payment request:', {
        userId,
        amount,
        description,
        recipientWallet,
        currency,
        customerEmail,
        customerName,
        merchantName
      });

      // Validate recipient wallet
      let recipient;
      try {
        recipient = new PublicKey(recipientWallet);
      } catch (error) {
        return res.status(400).json({
          error: 'Invalid recipient wallet address',
          message: error.message
        });
      }

      // Calculate AfriPay fees for SaaS monetization
      const reference = solanaService.generateReference();
      
      const percentageFee = amount * AFRIPAY_CONFIG.feeRate; // 2.9% of transaction
      const fixedFeeInCurrency = currency === 'SOL' ? 
        AFRIPAY_CONFIG.fixedFeeUSD / 100 : // Approximate SOL equivalent (rough conversion)
        AFRIPAY_CONFIG.fixedFeeUSD; // $0.30 in USDC
      
      const totalAfriPayFee = percentageFee + fixedFeeInCurrency;
      const totalAmount = amount + totalAfriPayFee;
      const merchantReceives = amount; // Merchant gets the requested amount

      console.log('Creating payment with AfriPay fees:', {
        userId,
        originalAmount: amount,
        percentageFee: percentageFee.toFixed(6),
        fixedFee: fixedFeeInCurrency.toFixed(6),
        totalAfriPayFee: totalAfriPayFee.toFixed(6),
        totalAmount: totalAmount.toFixed(6),
        merchantReceives: merchantReceives.toFixed(6),
        description,
        recipientWallet,
        currency
      });

      // Create Solana Pay URL with total amount (customer pays fees)
      const splToken = currency === 'USDC' ? SOLANA_CONFIG.usdcMint : undefined;
      
      const paymentUrl = encodeURL({
        recipient,
        amount: new BigNumber(totalAmount), // Customer pays total including fees
        splToken,
        reference,
        label: merchantName || 'AfriPay Payment',
        message: `${description} (includes ${(AFRIPAY_CONFIG.feeRate * 100).toFixed(1)}% + $${AFRIPAY_CONFIG.fixedFeeUSD} AfriPay fee)`,
        memo: memo || `AfriPay: ${description}`
      });

      // Generate QR code URL
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(paymentUrl.toString())}`;

      // Store payment request in database with fee breakdown
      const paymentRequest = await databaseService.createPaymentRequest({
        userId,
        reference: reference.toString(),
        amount: totalAmount, // Store total amount customer pays
        currency,
        description,
        recipientWallet: recipientWallet,
        paymentUrl: paymentUrl.toString(),
        qrCodeUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        customerEmail,
        customerName,
        merchantName,
        afripayFee: totalAfriPayFee, // Store AfriPay fee
        originalAmount: amount, // Store original requested amount
        totalAmount: totalAmount, // Store total amount including fees
        currency,
        description,
        recipientWallet: recipientWallet,
        paymentUrl: paymentUrl.toString(),
        qrCodeUrl,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        customerEmail,
        customerName,
        merchantName,
        afripayFee: 0, // No fees
        originalAmount: amount,
        totalAmount: amount // Total equals original amount
      });

      console.log('Payment request created:', paymentRequest.id);

      // Return response with simplified data
      const response = {
        paymentRequest: {
          id: paymentRequest.id,
          reference: reference.toString(),
          paymentUrl: paymentUrl.toString(),
          qrCodeUrl,
          expiresAt: paymentRequest.expires_at
        },
        feeBreakdown: {
          originalAmount: amount, // What merchant requested
          afripayFee: totalAfriPayFee, // AfriPay service fee
          merchantReceives: merchantReceives, // What merchant actually receives
          total: totalAmount // What customer pays (original + fees)
        },
        transactionDetails: {
          originalAmount: amount,
          afripayFee: totalAfriPayFee,
          totalCustomerPays: totalAmount,
          merchantReceives: merchantReceives,
          feePercentage: (AFRIPAY_CONFIG.feeRate * 100).toFixed(1) + '%',
          fixedFee: fixedFeeInCurrency,
          currency
        }
      };

      res.status(201).json(response);

    } catch (error) {
      console.error('Create payment request error:', error);
      
      if (error.message.includes('Invalid public key')) {
        return res.status(400).json({
          error: 'Invalid wallet address',
          message: 'Please provide a valid Solana wallet address'
        });
      }

      res.status(500).json({
        error: 'Failed to create payment request',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/create/:reference - Get payment request details
 */
router.get('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Validate reference
    try {
      new PublicKey(reference);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid reference',
        message: 'Reference must be a valid public key'
      });
    }

    // Get payment request
    const paymentRequest = await databaseService.getPaymentRequest(reference);

    if (!paymentRequest) {
      return res.status(404).json({
        error: 'Payment request not found'
      });
    }

    // Check if expired
    const isExpired = new Date() > new Date(paymentRequest.expires_at);
    
    const response = {
      paymentRequest: {
        id: paymentRequest.id,
        reference: paymentRequest.reference,
        amount: paymentRequest.amount_usdc,
        currency: paymentRequest.currency || 'USDC',
        description: paymentRequest.description,
        recipientWallet: paymentRequest.recipient_wallet,
        paymentUrl: paymentRequest.payment_url,
        qrCodeUrl: paymentRequest.qr_code_url,
        expiresAt: paymentRequest.expires_at,
        expired: isExpired,
        createdAt: paymentRequest.created_at,
      },
      feeBreakdown: {
        originalAmount: paymentRequest.metadata?.original_amount || paymentRequest.amount_usdc,
        afripayFee: paymentRequest.metadata?.afripay_fee || 0,
        totalCustomerPays: paymentRequest.metadata?.total_amount || paymentRequest.amount_usdc,
        merchantReceives: paymentRequest.metadata?.original_amount || paymentRequest.amount_usdc,
        currency: paymentRequest.currency || 'USDC'
      },
      customerInfo: {
        email: paymentRequest.metadata?.customer_email,
        name: paymentRequest.metadata?.customer_name,
        merchantName: paymentRequest.metadata?.merchant_name
      }
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Get payment request error:', error);
    res.status(500).json({
      error: 'Failed to get payment request',
      message: error.message
    });
  }
});

/**
 * DELETE /api/create/:reference - Cancel payment request
 */
router.delete('/:reference', async (req, res) => {
  try {
    const { reference } = req.params;

    // Validate reference
    try {
      new PublicKey(reference);
    } catch (error) {
      return res.status(400).json({
        error: 'Invalid reference',
        message: 'Reference must be a valid public key'
      });
    }

    // Update payment request as cancelled
    const paymentRequest = await databaseService.updatePaymentRequest(reference, {
      status: 'cancelled',
      updated_at: new Date().toISOString()
    });

    res.status(200).json({
      success: true,
      message: 'Payment request cancelled',
      paymentRequest: {
        id: paymentRequest.id,
        reference: paymentRequest.reference,
        status: 'cancelled'
      }
    });

  } catch (error) {
    console.error('Cancel payment request error:', error);
    
    if (error.message.includes('Failed to update payment request')) {
      return res.status(404).json({
        error: 'Payment request not found'
      });
    }

    res.status(500).json({
      error: 'Failed to cancel payment request',
      message: error.message
    });
  }
});

export default router;
