import { supabase } from './database.js';
import { EmailService } from './email.js';

/**
 * Invoice service for creating and managing invoices
 */
export class InvoiceService {
  constructor() {
    this.emailService = new EmailService();
  }

  /**
   * Create a new invoice
   */
  async createInvoice({
    merchantId,
    merchantName,
    merchantEmail,
    merchantWallet,
    customerName,
    customerEmail,
    amount,
    currency = 'USDC',
    description,
    lineItems = [],
    dueDate,
    notes,
    sendEmail = false
  }) {
    try {
      // Generate unique reference
      const reference = this.generateReference();
      
      // Calculate fees
      const afripayFee = this.calculateFee(amount);
      const totalAmount = amount + afripayFee;

      // Generate invoice number
      const { data: invoiceNumberData, error: invoiceNumberError } = await supabase
        .rpc('generate_invoice_number');

      if (invoiceNumberError) throw invoiceNumberError;
      const invoiceNumber = invoiceNumberData;

      // Create payment URL
      const paymentUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/pay/${reference}`;

      // Insert invoice into database
      const { data: invoice, error: insertError } = await supabase
        .from('invoices')
        .insert({
          invoice_number: invoiceNumber,
          reference,
          merchant_id: merchantId,
          merchant_name: merchantName,
          merchant_email: merchantEmail,
          merchant_wallet: merchantWallet,
          customer_name: customerName,
          customer_email: customerEmail,
          amount,
          currency,
          description,
          line_items: lineItems,
          afripay_fee: afripayFee,
          total_amount: totalAmount,
          payment_url: paymentUrl,
          due_date: dueDate,
          notes,
          status: sendEmail ? 'sent' : 'draft',
          sent_at: sendEmail ? new Date().toISOString() : null
        })
        .select()
        .single();

      if (insertError) throw insertError;

      // Send email if requested
      if (sendEmail) {
        await this.sendInvoiceEmail(invoice);
      }

      return {
        success: true,
        invoice: {
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          reference: invoice.reference,
          paymentUrl: invoice.payment_url,
          amount: invoice.amount,
          currency: invoice.currency,
          totalAmount: invoice.total_amount,
          afripayFee: invoice.afripay_fee,
          status: invoice.status,
          createdAt: invoice.created_at
        }
      };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Send invoice email to customer
   */
  async sendInvoiceEmail(invoice) {
    try {
      const emailResult = await this.emailService.sendInvoiceNotification({
        customerEmail: invoice.customer_email,
        customerName: invoice.customer_name,
        merchantName: invoice.merchant_name,
        invoiceNumber: invoice.invoice_number,
        amount: invoice.amount,
        currency: invoice.currency,
        totalAmount: invoice.total_amount,
        description: invoice.description,
        paymentUrl: invoice.payment_url,
        dueDate: invoice.due_date,
        notes: invoice.notes
      });

      if (emailResult.success) {
        // Update invoice status to sent
        await supabase
          .from('invoices')
          .update({ 
            status: 'sent',
            sent_at: new Date().toISOString()
          })
          .eq('id', invoice.id);
      }

      return emailResult;
    } catch (error) {
      console.error('Error sending invoice email:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get invoices for a merchant
   */
  async getInvoices(merchantId, { limit = 50, offset = 0, status } = {}) {
    try {
      let query = supabase
        .from('invoices')
        .select('*')
        .eq('merchant_id', merchantId)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      if (status) {
        query = query.eq('status', status);
      }

      const { data: invoices, error } = await query;

      if (error) throw error;

      return {
        success: true,
        invoices: invoices.map(invoice => ({
          id: invoice.id,
          invoiceNumber: invoice.invoice_number,
          customerName: invoice.customer_name,
          customerEmail: invoice.customer_email,
          amount: invoice.amount,
          currency: invoice.currency,
          totalAmount: invoice.total_amount,
          status: invoice.status,
          description: invoice.description,
          dueDate: invoice.due_date,
          createdAt: invoice.created_at,
          sentAt: invoice.sent_at,
          paidAt: invoice.paid_at
        }))
      };
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update invoice status (e.g., when payment is received)
   */
  async updateInvoiceStatus(invoiceId, status, transactionSignature = null) {
    try {
      const updateData = { 
        status,
        updated_at: new Date().toISOString()
      };

      if (status === 'paid') {
        updateData.paid_at = new Date().toISOString();
        if (transactionSignature) {
          updateData.transaction_signature = transactionSignature;
        }
      }

      const { data: invoice, error } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        invoice
      };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate unique reference for invoice
   */
  generateReference() {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }

  /**
   * Calculate AfriPay fee (2.9% + $0.30)
   */
  calculateFee(amount) {
    return Math.round((amount * 0.029 + 0.30) * 100) / 100;
  }
}

export default InvoiceService;
