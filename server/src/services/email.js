import { Resend } from 'resend';

/**
 * Email service for AfriPay notifications using Resend
 */
export class EmailService {
  constructor() {
    this.apiKey = process.env.RESEND_API_KEY;
    this.fromEmail = process.env.RESEND_FROM_EMAIL || 'AfriPay <onboarding@resend.dev>'; // Use Resend's default for testing
    this.enabled = !!this.apiKey;
    
    if (this.enabled) {
      this.resend = new Resend(this.apiKey);
      console.log('📧 Email service enabled with Resend');
      console.log('📧 From email:', this.fromEmail);
    } else {
      console.warn('⚠️  Email service disabled - RESEND_API_KEY not configured');
      console.warn('   Add RESEND_API_KEY to .env to enable email notifications');
    }
  }

  /**
   * Send payment confirmation email to merchant
   */
  async sendPaymentConfirmation({
    merchantEmail,
    merchantName,
    customerName,
    amount,
    currency,
    description,
    transactionSignature,
    afripayFee,
    netAmount
  }) {
    if (!this.enabled) {
      console.log('Email service disabled, skipping payment confirmation');
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      console.log('📧 Sending merchant email with Resend API...');
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [merchantEmail],
        subject: `💰 Payment Received - ${amount} ${currency} from ${customerName || 'Customer'}`,
        html: this.generatePaymentConfirmationHTML({
          merchantName,
          customerName,
          amount,
          currency,
          description,
          transactionSignature,
          afripayFee,
          netAmount
        })
      });
      
      console.log('📧 Resend API response:', result);
      
      console.log('✅ Payment confirmation email sent:', {
        to: merchantEmail,
        amount: `${amount} ${currency}`,
        messageId: result.data?.id || result.id
      });

      return { success: true, messageId: result.data?.id || result.id };
    } catch (error) {
      console.error('❌ Failed to send payment confirmation email:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment notification to customer (receipt)
   */
  async sendPaymentReceipt({
    customerEmail,
    customerName,
    merchantName,
    amount,
    currency,
    description,
    transactionSignature,
    afripayFee,
    totalPaid
  }) {
    if (!this.enabled || !customerEmail) {
      console.log('Email service disabled or no customer email, skipping receipt');
      return { success: false, reason: 'Email service not configured or no customer email' };
    }

    try {
      console.log('📧 Sending customer receipt with Resend API...');
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [customerEmail],
        subject: `🧾 Payment Receipt - ${merchantName}`,
        html: this.generatePaymentReceiptHTML({
          customerName,
          merchantName,
          amount,
          currency,
          description,
          transactionSignature,
          afripayFee,
          totalPaid
        })
      });
      
      console.log('📧 Resend API response:', result);
      
      console.log('✅ Payment receipt email sent:', {
        to: customerEmail,
        amount: `${totalPaid} ${currency}`,
        messageId: result.data?.id || result.id
      });

      return { success: true, messageId: result.data?.id || result.id };
    } catch (error) {
      console.error('❌ Failed to send payment receipt email:', error);
      console.error('❌ Error details:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate HTML for payment confirmation email (to merchant)
   */
  generatePaymentConfirmationHTML({
    merchantName,
    customerName,
    amount,
    currency,
    description,
    transactionSignature,
    afripayFee,
    netAmount
  }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Received - AfriPay</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .amount { font-size: 32px; font-weight: bold; color: #10b981; text-align: center; margin: 20px 0; }
        .details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; }
        .value { font-weight: 500; }
        .transaction { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💰 Payment Received!</h1>
          <p>You've received a new payment through AfriPay</p>
        </div>
        
        <div class="content">
          <div class="amount">+${netAmount} ${currency}</div>
          <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
            Net amount deposited to your wallet
          </p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">From:</span>
              <span class="value">${customerName || 'Customer'}</span>
            </div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${description}</span>
            </div>
            <div class="detail-row">
              <span class="label">Original Amount:</span>
              <span class="value">${amount} ${currency}</span>
            </div>
            <div class="detail-row">
              <span class="label">AfriPay Fee:</span>
              <span class="value">${afripayFee} ${currency}</span>
            </div>
            <div class="detail-row">
              <span class="label"><strong>You Received:</strong></span>
              <span class="value"><strong>${netAmount} ${currency}</strong></span>
            </div>
          </div>
          
          <div class="transaction">
            <strong>🔗 Transaction ID:</strong><br>
            <code style="word-break: break-all; font-size: 12px;">${transactionSignature}</code>
            <br><br>
            <a href="https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet" class="button" target="_blank">
              View on Solana Explorer
            </a>
          </div>
          
          <p style="text-align: center; margin-top: 30px;">
            <a href="https://afripay.com/dashboard" class="button">View Dashboard</a>
          </p>
        </div>
        
        <div class="footer">
          <p><strong>AfriPay</strong> - Secure Solana Payments</p>
          <p>This payment was processed securely on the Solana blockchain.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Generate HTML for payment receipt email (to customer)
   */
  generatePaymentReceiptHTML({
    customerName,
    merchantName,
    amount,
    currency,
    description,
    transactionSignature,
    afripayFee,
    totalPaid
  }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Payment Receipt - AfriPay</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f5f5f5; }
        .container { max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
        .header { background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; }
        .amount { font-size: 32px; font-weight: bold; color: #dc2626; text-align: center; margin: 20px 0; }
        .details { background: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; padding: 8px 0; border-bottom: 1px solid #e2e8f0; }
        .detail-row:last-child { border-bottom: none; }
        .label { font-weight: 600; color: #64748b; }
        .value { font-weight: 500; }
        .transaction { background: #fef3c7; border: 1px solid #f59e0b; border-radius: 6px; padding: 15px; margin: 20px 0; }
        .footer { background: #f8fafc; padding: 20px; text-align: center; font-size: 14px; color: #64748b; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: 600; margin: 10px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🧾 Payment Receipt</h1>
          <p>Thank you for your payment!</p>
        </div>
        
        <div class="content">
          <div class="amount">-${totalPaid} ${currency}</div>
          <p style="text-align: center; color: #64748b; margin-bottom: 30px;">
            Payment successfully processed
          </p>
          
          <div class="details">
            <div class="detail-row">
              <span class="label">Merchant:</span>
              <span class="value">${merchantName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Description:</span>
              <span class="value">${description}</span>
            </div>
            <div class="detail-row">
              <span class="label">Amount:</span>
              <span class="value">${amount} ${currency}</span>
            </div>
            <div class="detail-row">
              <span class="label">Processing Fee:</span>
              <span class="value">${afripayFee} ${currency}</span>
            </div>
            <div class="detail-row">
              <span class="label"><strong>Total Paid:</strong></span>
              <span class="value"><strong>${totalPaid} ${currency}</strong></span>
            </div>
          </div>
          
          <div class="transaction">
            <strong>🔗 Transaction ID:</strong><br>
            <code style="word-break: break-all; font-size: 12px;">${transactionSignature}</code>
            <br><br>
            <a href="https://explorer.solana.com/tx/${transactionSignature}?cluster=devnet" class="button" target="_blank">
              View on Solana Explorer
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>AfriPay</strong> - Secure Solana Payments</p>
          <p>This payment was processed securely on the Solana blockchain.</p>
          <p>Questions? Contact support@afripay.com</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  /**
   * Send invoice notification to customer
   */
  async sendInvoiceNotification({
    customerEmail,
    customerName,
    merchantName,
    invoiceNumber,
    amount,
    currency,
    totalAmount,
    description,
    paymentUrl,
    dueDate,
    notes
  }) {
    if (!this.enabled) {
      console.log('Email service disabled, skipping invoice notification');
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      console.log('📧 Sending invoice email with Resend API...');
      
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [customerEmail],
        subject: `📄 Invoice ${invoiceNumber} from ${merchantName}`,
        html: this.generateInvoiceHTML({
          customerName,
          merchantName,
          invoiceNumber,
          amount,
          currency,
          totalAmount,
          description,
          paymentUrl,
          dueDate,
          notes
        })
      });

      console.log('📧 Invoice email sent successfully:', result.data?.id);
      
      return {
        success: true,
        messageId: result.data?.id,
        recipient: customerEmail
      };
    } catch (error) {
      console.error('📧 Failed to send invoice email:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Generate invoice email HTML
   */
  generateInvoiceHTML({
    customerName,
    merchantName,
    invoiceNumber,
    amount,
    currency,
    totalAmount,
    description,
    paymentUrl,
    dueDate,
    notes
  }) {
    const formattedDueDate = dueDate ? new Date(dueDate).toLocaleDateString() : 'No due date';
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Invoice ${invoiceNumber}</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
        .invoice-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #667eea; }
        .amount { font-size: 24px; font-weight: bold; color: #667eea; text-align: center; margin: 20px 0; }
        .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        .detail-row { display: flex; justify-content: space-between; margin: 10px 0; }
        .label { font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>📄 Invoice from ${merchantName}</h1>
        <p>Invoice #${invoiceNumber}</p>
      </div>
      
      <div class="content">
        <p>Hello ${customerName || 'Valued Customer'},</p>
        
        <p>You have received an invoice from <strong>${merchantName}</strong>. Please review the details below:</p>
        
        <div class="invoice-details">
          <div class="detail-row">
            <span class="label">Invoice Number:</span>
            <span class="value">${invoiceNumber}</span>
          </div>
          <div class="detail-row">
            <span class="label">Description:</span>
            <span class="value">${description}</span>
          </div>
          <div class="detail-row">
            <span class="label">Amount:</span>
            <span class="value">${amount} ${currency}</span>
          </div>
          <div class="detail-row">
            <span class="label">Due Date:</span>
            <span class="value">${formattedDueDate}</span>
          </div>
          ${notes ? `
          <div class="detail-row">
            <span class="label">Notes:</span>
            <span class="value">${notes}</span>
          </div>
          ` : ''}
        </div>
        
        <div class="amount">
          Total: ${totalAmount} ${currency}
        </div>
        
        <div style="text-align: center;">
          <a href="${paymentUrl}" class="button">💳 Pay Now with Solana</a>
        </div>
        
        <p><strong>Why Solana Pay?</strong></p>
        <ul>
          <li>⚡ Instant confirmation (0.4 seconds)</li>
          <li>🔒 Secure blockchain technology</li>
          <li>💰 Low transaction fees</li>
          <li>🌍 Global accessibility</li>
        </ul>
      </div>
      
      <div class="footer">
        <p><strong>AfriPay</strong> - Secure Solana Payments</p>
        <p>This invoice was sent via AfriPay's secure payment platform.</p>
        <p>Questions? Contact ${merchantName} or support@afripay.com</p>
      </div>
    </body>
    </html>
    `;
  }
  async sendTestEmail(toEmail) {
    if (!this.enabled) {
      return { success: false, reason: 'Email service not configured' };
    }

    try {
      const result = await this.resend.emails.send({
        from: this.fromEmail,
        to: [toEmail],
        subject: '✅ AfriPay Email Service Test',
        html: `
          <h2>🎉 Email Service Working!</h2>
          <p>Your AfriPay email notifications are properly configured.</p>
          <p><strong>Resend Integration:</strong> ✅ Active</p>
          <p><strong>From Email:</strong> ${this.fromEmail}</p>
          <p>You'll now receive notifications for:</p>
          <ul>
            <li>💰 Payment confirmations (merchants)</li>
            <li>🧾 Payment receipts (customers)</li>
            <li>📊 Transaction summaries</li>
          </ul>
        `
      });

      return { success: true, messageId: result.data?.id };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

export const emailService = new EmailService();
