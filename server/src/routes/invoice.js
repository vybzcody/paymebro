import express from 'express';
import { body, validationResult, query } from 'express-validator';
import { InvoiceService } from '../services/invoice.js';
import { supabase } from '../services/database.js';

const router = express.Router();
const invoiceService = new InvoiceService();

/**
 * POST /api/invoices
 * Create a new invoice
 */
router.post('/', [
  body('userId').isUUID().withMessage('Valid user ID is required'),
  body('customerName').notEmpty().withMessage('Customer name is required'),
  body('customerEmail').isEmail().withMessage('Valid customer email is required'),
  body('amount').isFloat({ min: 0.01 }).withMessage('Amount must be greater than 0'),
  body('currency').optional().isIn(['USDC', 'SOL']).withMessage('Currency must be USDC or SOL'),
  body('description').notEmpty().withMessage('Description is required'),
  body('lineItems').optional().isArray().withMessage('Line items must be an array'),
  body('dueDate').optional().isISO8601().withMessage('Due date must be a valid date'),
  body('notes').optional().isString().withMessage('Notes must be a string'),
  body('sendEmail').optional().isBoolean().withMessage('Send email must be a boolean')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      userId,
      customerName,
      customerEmail,
      amount,
      currency = 'USDC',
      description,
      dueDate,
      notes,
      sendEmail = false
    } = req.body;

    console.log('📄 Creating invoice:', {
      userId,
      customerEmail,
      amount,
      currency,
      sendEmail
    });

    const result = await invoiceService.createInvoice({
      userId,
      customerName,
      customerEmail,
      amount,
      currency,
      description,
      dueDate,
      notes,
      sendEmail
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: sendEmail ? 'Invoice created and sent successfully' : 'Invoice created successfully',
      invoice: result.invoice
    });

  } catch (error) {
    console.error('Error in POST /api/invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * GET /api/invoices
 * Get invoices for a merchant
 */
router.get('/', [
  query('userId').isUUID().withMessage('Valid user ID is required'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
  query('status').optional().isIn(['draft', 'sent', 'viewed', 'paid', 'expired', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const {
      userId,
      limit = 50,
      offset = 0,
      status
    } = req.query;

    console.log('📄 Fetching invoices for user:', userId);

    const result = await invoiceService.getInvoices(userId, {
      limit: parseInt(limit),
      offset: parseInt(offset),
      status
    });

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      invoices: result.invoices,
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset),
        total: result.invoices.length
      }
    });

  } catch (error) {
    console.error('Error in GET /api/invoices:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * PUT /api/invoices/:id/status
 * Update invoice status
 */
router.put('/:id/status', [
  body('status').isIn(['draft', 'sent', 'viewed', 'paid', 'expired', 'cancelled']).withMessage('Invalid status'),
  body('transactionSignature').optional().isString().withMessage('Transaction signature must be a string')
], async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array()
      });
    }

    const { id } = req.params;
    const { status, transactionSignature } = req.body;

    console.log('📄 Updating invoice status:', { id, status, transactionSignature });

    const result = await invoiceService.updateInvoiceStatus(id, status, transactionSignature);

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: result.error
      });
    }

    res.json({
      success: true,
      message: 'Invoice status updated successfully',
      invoice: result.invoice
    });

  } catch (error) {
    console.error('Error in PUT /api/invoices/:id/status:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

/**
 * POST /api/invoices/:id/send
 * Send an existing invoice via email
 */
router.post('/:id/send', async (req, res) => {
  try {
    const { id } = req.params;

    console.log('📄 Sending invoice email:', id);

    // First get the invoice
    const { data: invoice, error } = await supabase
      .from('invoices')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !invoice) {
      return res.status(404).json({
        success: false,
        error: 'Invoice not found'
      });
    }

    // Send the email
    const emailResult = await invoiceService.sendInvoiceEmail(invoice);

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        error: emailResult.error
      });
    }

    res.json({
      success: true,
      message: 'Invoice sent successfully',
      emailResult
    });

  } catch (error) {
    console.error('Error in POST /api/invoices/:id/send:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

export default router;
