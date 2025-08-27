import express from 'express';
import { body, query, validationResult } from 'express-validator';
import { PublicKey } from '@solana/web3.js';
import BigNumber from 'bignumber.js';
import { solanaService } from '../services/solana.js';
import { databaseService } from '../services/database.js';
import { SOLANA_CONFIG } from '../config/index.js';

const router = express.Router();

/**
 * GET /api/payment - Payment metadata endpoint
 * Returns payment information for display in wallet
 */
router.get('/', 
  // Validation
  [
    query('label').notEmpty().withMessage('Label is required'),
    query('recipient').optional().isLength({ min: 32, max: 44 }).withMessage('Invalid recipient address'),
    query('amount').optional().isFloat({ min: 0 }).withMessage('Amount must be a positive number'),
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

      const { label, recipient, amount } = req.query;

      // Return payment metadata
      const icon = `${req.protocol}://${req.get('host')}/favicon.ico`;

      const response = {
        label: label || 'AfriPay Payment',
        icon,
        ...(recipient && { recipient }),
        ...(amount && { amount: parseFloat(amount) }),
      };

      res.status(200).json(response);
    } catch (error) {
      console.error('GET payment error:', error);
      res.status(500).json({
        error: 'Internal server error',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/payment - Transaction request endpoint
 * Creates and returns a transaction for the wallet to sign
 */
router.post('/',
  // Validation
  [
    query('recipient').notEmpty().withMessage('Recipient is required'),
    query('amount').notEmpty().isFloat({ min: 0 }).withMessage('Valid amount is required'),
    query('reference').notEmpty().withMessage('Reference is required'),
    body('account').notEmpty().withMessage('Account is required'),
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

      // Extract parameters
      const recipientField = req.query.recipient;
      const amountField = req.query.amount;
      const referenceField = req.query.reference;
      const splTokenField = req.query['spl-token'];
      const memoField = req.query.memo;
      const messageField = req.query.message;
      const accountField = req.body.account;

      // Validate and parse parameters
      const recipient = new PublicKey(recipientField);
      const amount = new BigNumber(amountField);
      const reference = new PublicKey(referenceField);
      const account = new PublicKey(accountField);
      const splToken = splTokenField ? new PublicKey(splTokenField) : undefined;

      console.log('Creating transaction for:', {
        recipient: recipient.toString(),
        amount: amount.toString(),
        reference: reference.toString(),
        account: account.toString(),
        splToken: splToken?.toString(),
        memo: memoField,
        message: messageField
      });

      // Check if this is a payment request from our system
      const paymentRequest = await databaseService.getPaymentRequest(reference.toString());
      
      let transaction;
      
      if (paymentRequest) {
        // This is an AfriPay payment - use exact amount without fees
        console.log('Creating AfriPay transaction with exact amount');
        
        transaction = await solanaService.createPaymentTransaction({
          account,
          recipient,
          amount: paymentRequest.amount_usdc, // Use exact amount from database
          splToken: splToken || SOLANA_CONFIG.usdcMint,
          reference,
          memo: memoField || `AfriPay: ${paymentRequest.description}`
        });
      } else {
        // Standard Solana Pay transaction
        console.log('Creating standard Solana Pay transaction');
        
        transaction = await solanaService.createPaymentTransaction({
          account,
          recipient,
          amount: amount.toNumber(),
          splToken,
          reference,
          memo: memoField
        });
      }

      // Serialize the transaction
      const serialized = transaction.serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      });
      
      const base64Transaction = serialized.toString('base64');

      console.log('Transaction created successfully:', {
        size: serialized.length,
        base64Length: base64Transaction.length
      });

      // Return the response
      const response = {
        transaction: base64Transaction,
        ...(messageField && { message: messageField }),
      };

      res.status(200).json(response);

    } catch (error) {
      console.error('POST payment error:', error);
      
      // Handle specific errors
      if (error.message.includes('Invalid public key')) {
        return res.status(400).json({
          error: 'Invalid public key provided',
          message: error.message
        });
      }
      
      if (error.message.includes('Insufficient funds')) {
        return res.status(400).json({
          error: 'Insufficient funds',
          message: 'Account does not have enough balance for this transaction'
        });
      }

      res.status(500).json({
        error: 'Transaction creation failed',
        message: error.message
      });
    }
  }
);

/**
 * GET /api/payment/status/:reference - Check payment status
 */
router.get('/status/:reference', async (req, res) => {
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

    // Check for transaction
    const signatureInfo = await solanaService.findTransactionByReference(reference);
    
    if (!signatureInfo) {
      return res.status(200).json({
        status: 'pending',
        confirmed: false,
        message: 'Transaction not found or not confirmed yet'
      });
    }

    // Get transaction details
    const transactionDetails = await solanaService.getTransactionDetails(signatureInfo.signature);
    
    if (!transactionDetails) {
      return res.status(200).json({
        status: 'pending',
        confirmed: false,
        message: 'Transaction details not available'
      });
    }

    // Try to get payment request from database
    const paymentRequest = await databaseService.getPaymentRequest(reference);
    
    const response = {
      status: transactionDetails.status,
      confirmed: transactionDetails.status === 'confirmed',
      signature: signatureInfo.signature,
      slot: transactionDetails.slot,
      blockTime: transactionDetails.blockTime,
      ...(paymentRequest && {
        paymentRequest: {
          id: paymentRequest.id,
          description: paymentRequest.description,
          amount: paymentRequest.amount_usdc,
          currency: paymentRequest.currency
        }
      })
    };

    res.status(200).json(response);

  } catch (error) {
    console.error('Payment status error:', error);
    res.status(500).json({
      error: 'Failed to check payment status',
      message: error.message
    });
  }
});

/**
 * POST /api/payment/verify - Verify and record completed payment
 */
router.post('/verify',
  [
    body('signature').notEmpty().withMessage('Signature is required'),
    body('reference').notEmpty().withMessage('Reference is required'),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          error: 'Validation failed',
          details: errors.array()
        });
      }

      const { signature, reference } = req.body;

      // Get payment request
      const paymentRequest = await databaseService.getPaymentRequest(reference);
      if (!paymentRequest) {
        return res.status(404).json({
          error: 'Payment request not found'
        });
      }

      // Get transaction details
      const transactionDetails = await solanaService.getTransactionDetails(signature);
      if (!transactionDetails || transactionDetails.status !== 'confirmed') {
        return res.status(400).json({
          error: 'Transaction not confirmed'
        });
      }

      // Calculate platform fee
      const platformFee = await databaseService.calculatePlatformFee(
        paymentRequest.amount_usdc,
        paymentRequest.user_id
      );

      // Create transaction record
      const transaction = await databaseService.createTransaction({
        userId: paymentRequest.user_id,
        paymentRequestId: paymentRequest.id,
        signature,
        reference,
        amount: paymentRequest.amount_usdc,
        currency: paymentRequest.currency || 'USDC',
        platformFee,
        netAmount: paymentRequest.amount_usdc - platformFee,
        senderWallet: transactionDetails.accounts[0],
        recipientWallet: paymentRequest.recipient_wallet,
        status: 'confirmed',
        blockTime: transactionDetails.blockTime ? new Date(transactionDetails.blockTime * 1000).toISOString() : null,
        confirmationCount: 1,
        description: paymentRequest.description,
        slot: transactionDetails.slot,
        fee: transactionDetails.fee
      });

      res.status(200).json({
        success: true,
        transaction,
        platformFee,
        netAmount: paymentRequest.amount_usdc - platformFee
      });

    } catch (error) {
      console.error('Payment verification error:', error);
      res.status(500).json({
        error: 'Payment verification failed',
        message: error.message
      });
    }
  }
);

export default router;
