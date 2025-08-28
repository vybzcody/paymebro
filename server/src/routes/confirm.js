import express from 'express';
import { body, validationResult } from 'express-validator';
import { PublicKey } from '@solana/web3.js';
import { solanaService } from '../services/solana.js';
import { databaseService } from '../services/database.js';
import { emailService } from '../services/email.js';

const router = express.Router();

/**
 * POST /api/confirm - Confirm a payment transaction
 * Called when a payment is successfully completed
 */
router.post('/',
  [
    body('signature').notEmpty().withMessage('Transaction signature is required'),
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

      console.log('Confirming payment:', { signature, reference });

      // Find the payment request
      const paymentRequest = await databaseService.getPaymentRequestByReference(reference);
      if (!paymentRequest) {
        return res.status(404).json({
          error: 'Payment request not found',
          reference
        });
      }

      // Verify the transaction on Solana
      const transactionInfo = await solanaService.getTransactionInfo(signature);
      if (!transactionInfo) {
        return res.status(400).json({
          error: 'Transaction not found or not confirmed',
          signature
        });
      }

      // Update payment status in database
      const updatedPayment = await databaseService.updatePaymentStatus(
        paymentRequest.id,
        'completed',
        signature,
        {
          confirmedAt: new Date().toISOString(),
          transactionInfo
        }
      );

      console.log('Payment confirmed successfully:', {
        paymentId: paymentRequest.id,
        signature,
        amount: paymentRequest.amount_usdc
      });

      // Send email notifications
      await sendPaymentNotifications(paymentRequest, signature, transactionInfo);

      res.status(200).json({
        success: true,
        payment: {
          id: paymentRequest.id,
          status: 'completed',
          signature,
          amount: paymentRequest.amount_usdc,
          currency: paymentRequest.currency,
          confirmedAt: new Date().toISOString()
        }
      });

    } catch (error) {
      console.error('Payment confirmation error:', error);
      res.status(500).json({
        error: 'Failed to confirm payment',
        message: error.message
      });
    }
  }
);

/**
 * POST /api/confirm/test-email - Test email notifications
 */
router.post('/test-email',
  [
    body('email').isEmail().withMessage('Valid email is required'),
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

      const { email } = req.body;

      // Send test email
      const result = await emailService.sendTestEmail(email);

      if (result.success) {
        res.status(200).json({
          success: true,
          message: 'Test email sent successfully',
          messageId: result.messageId
        });
      } else {
        res.status(400).json({
          success: false,
          error: result.error || result.reason
        });
      }

    } catch (error) {
      console.error('Test email error:', error);
      res.status(500).json({
        error: 'Failed to send test email',
        message: error.message
      });
    }
  }
);

/**
 * Send payment notification emails
 */
async function sendPaymentNotifications(paymentRequest, signature, transactionInfo) {
  try {
    const metadata = paymentRequest.metadata || {};
    const merchantName = metadata.merchant_name || 'Merchant';
    const customerName = metadata.customer_name || 'Customer';
    const afripayFee = metadata.afripay_fee || 0;
    const originalAmount = metadata.original_amount || paymentRequest.amount_usdc;
    const netAmount = originalAmount; // Merchant receives original amount

    // Send confirmation email to merchant (if we have merchant email)
    if (paymentRequest.user_id && paymentRequest.user_id.includes('@')) {
      // If user_id looks like an email, use it as merchant email
      const merchantEmail = paymentRequest.user_id;
      
      await emailService.sendPaymentConfirmation({
        merchantEmail,
        merchantName,
        customerName,
        amount: originalAmount,
        currency: paymentRequest.currency,
        description: paymentRequest.description,
        transactionSignature: signature,
        afripayFee,
        netAmount
      });
    }

    // Send receipt to customer (if we have customer email)
    const customerEmail = metadata.customer_email;
    if (customerEmail) {
      await emailService.sendPaymentReceipt({
        customerEmail,
        customerName,
        merchantName,
        amount: originalAmount,
        currency: paymentRequest.currency,
        description: paymentRequest.description,
        transactionSignature: signature,
        afripayFee,
        totalPaid: paymentRequest.amount_usdc
      });
    }

  } catch (error) {
    console.error('Failed to send payment notifications:', error);
    // Don't fail the payment confirmation if email fails
  }
}

export default router;
