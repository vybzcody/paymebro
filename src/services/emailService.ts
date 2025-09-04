interface EmailData {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

interface PaymentNotificationData {
  merchantEmail: string;
  customerEmail?: string;
  customerName?: string;
  amount: string;
  currency: string;
  description: string;
  chainName: string;
  paymentUrl: string;
  qrCodeUrl: string;
  memo?: string;
}

interface InvoiceData {
  customerEmail: string;
  customerName?: string;
  merchantName?: string;
  amount: string;
  currency: string;
  description: string;
  chainName: string;
  paymentUrl: string;
  qrCodeUrl: string;
  invoiceId: string;
}

export class EmailService {
  // Use existing AfriPay backend API
  private static readonly BACKEND_API_URL = import.meta.env.VITE_BACKEND_URL || 'https://paymebro-backend-production.up.railway.app';
  private static readonly INVOICE_API_URL = `${this.BACKEND_API_URL}/api/invoices`;
  private static readonly USER_API_URL = `${this.BACKEND_API_URL}/api/user`;

  /**
   * Create and send invoice using existing backend API
   */
  private static async createAndSendInvoice(invoiceData: any): Promise<{ success: boolean; invoice?: any; error?: string }> {
    try {
      console.log('Creating invoice via backend API:', this.INVOICE_API_URL);
      
      const response = await fetch(this.INVOICE_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(invoiceData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create invoice:', response.status, errorData);
        return { success: false, error: errorData.error || 'Failed to create invoice' };
      }

      const result = await response.json();
      console.log('Invoice created successfully:', result);
      return { success: true, invoice: result.invoice };
    } catch (error) {
      console.error('Error creating invoice:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Send payment notification to merchant via local email server
   */
  static async sendPaymentNotification(data: PaymentNotificationData): Promise<boolean> {
    try {
      console.log('Sending payment notification via local email server to:', data.merchantEmail);
      
      const emailData = {
        to: data.merchantEmail,
        subject: `🚀 New Payment Request Created - ${data.amount} ${data.currency}`,
        html: this.generatePaymentNotificationHTML(data),
        from: 'AfriPay <paym@powerscrews.com>'
      };
      
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/payment/test-email-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send payment notification:', errorData);
        return false;
      }
      
      console.log('Payment notification sent successfully!');
      return true;
    } catch (error) {
      console.error('Error sending payment notification:', error);
      return false;
    }
  }

  /**
   * Create or get user in the backend system
   */
  private static async ensureUserExists(user: any, walletAddress: string): Promise<string | null> {
    try {
      console.log('Creating/updating user in backend:', user.email);
      
      const userLoginData = {
        web3authUserId: user.sub || user.email, // Web3Auth user ID
        walletAddress: walletAddress,
        email: user.email,
        name: user.name,
        avatarUrl: user.profileImage,
        loginProvider: user.typeOfLogin || 'google'
      };
      
      const response = await fetch(`${this.USER_API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userLoginData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to create/update user:', errorData);
        return null;
      }

      const result = await response.json();
      console.log('User created/updated successfully:', result.user.id);
      return result.user.id; // Return the UUID from the backend
    } catch (error) {
      console.error('Error ensuring user exists:', error);
      return null;
    }
  }

  /**
   * Send payment invoice to customer via local email server
   */
  static async sendPaymentInvoice(data: InvoiceData): Promise<boolean> {
    try {
      console.log('Sending payment invoice via local email server to:', data.customerEmail);
      
      const emailData = {
        to: data.customerEmail,
        subject: `💳 Payment Invoice #${data.invoiceId} - ${data.amount} ${data.currency}`,
        html: this.generateInvoiceHTML(data),
        from: 'AfriPay <paym@powerscrews.com>'
      };
      
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/payment/test-email-simple', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to send payment invoice:', errorData);
        return false;
      }
      
      console.log('Payment invoice sent successfully!');
      return true;
    } catch (error) {
      console.error('Error sending payment invoice:', error);
      return false;
    }
  }

  /**
   * Helper to get merchant user ID (simplified for now)
   */
  private static async getMerchantUserId(merchantName?: string, paymentUrl?: string): Promise<string | null> {
    // This is a simplified version - in production, you'd get this from the authenticated user context
    // For now, we'll try to use the merchant email if it looks like an email
    if (merchantName && merchantName.includes('@')) {
      // Try to find user by email - this would require a backend endpoint to lookup by email
      // For now, we'll create a mock UUID (this won't work with the real backend)
      console.warn('Using simplified user lookup - this needs proper implementation');
      return '00000000-0000-0000-0000-000000000000'; // Mock UUID - replace with real lookup
    }
    
    // If no merchant info, return null
    return null;
  }

  /**
   * Generate HTML for payment notification email to merchant
   */
  private static generatePaymentNotificationHTML(data: PaymentNotificationData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Payment Request</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #10b981; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 10px 0 0 0; }
        .alert { background: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; font-weight: bold; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details h3 { color: #10b981; margin-top: 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .details td:first-child { font-weight: bold; color: #555; }
        .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
        .button:hover { background: #059669; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💰 PayMeBro</h1>
            <p>New Payment Request Generated</p>
        </div>
        
        <div class="alert">
            🎉 A new payment request has been created for ${data.amount} ${data.currency}
        </div>
        
        <div class="details">
            <h3>Payment Details</h3>
            <table>
                <tr><td>Amount:</td><td><strong>${data.amount} ${data.currency}</strong></td></tr>
                <tr><td>Description:</td><td>${data.description}</td></tr>
                <tr><td>Network:</td><td>${data.chainName}</td></tr>
                ${data.customerName ? `<tr><td>Customer Name:</td><td>${data.customerName}</td></tr>` : ''}
                ${data.customerEmail ? `<tr><td>Customer Email:</td><td>${data.customerEmail}</td></tr>` : ''}
                ${data.memo ? `<tr><td>Memo:</td><td>${data.memo}</td></tr>` : ''}
                <tr><td>Generated:</td><td>${new Date().toLocaleString()}</td></tr>
            </table>
        </div>
        
        <div class="qr-section">
            <h3>🔗 Payment QR Code</h3>
            <p>Share this QR code with your customer for payment:</p>
            <img src="${data.qrCodeUrl}" alt="Payment QR Code" style="max-width: 300px; height: auto; border: 2px solid #ddd; border-radius: 10px; margin: 10px 0;">
            <br>
            <a href="${data.paymentUrl}" class="button">View Payment Link</a>
        </div>
        
        <div style="background: #fff3cd; color: #856404; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>💡 Next Steps:</strong>
            <ul style="margin: 10px 0;">
                <li>Share the QR code or payment link with your customer</li>
                <li>Customer can scan the QR code with their crypto wallet</li>
                <li>Payment will be processed on the ${data.chainName} network</li>
                <li>You'll receive the funds directly in your connected wallet</li>
            </ul>
        </div>
        
        <div class="footer">
            <p>This notification was sent from PayMeBro - Multi-Chain Payment Gateway</p>
            <p><a href="https://paymebro.xyz">paymebro.xyz</a> | Powered by Web3 Technology</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate HTML for invoice email to customer
   */
  private static generateInvoiceHTML(data: InvoiceData): string {
    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Payment Invoice</title>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4; }
        .container { max-width: 600px; margin: 0 auto; background: white; padding: 30px; border-radius: 10px; box-shadow: 0 0 10px rgba(0,0,0,0.1); }
        .header { text-align: center; border-bottom: 3px solid #10b981; padding-bottom: 20px; margin-bottom: 30px; }
        .header h1 { color: #10b981; margin: 0; font-size: 28px; }
        .header p { color: #666; margin: 10px 0 0 0; }
        .invoice-header { background: #10b981; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center; }
        .details { background: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0; }
        .details h3 { color: #10b981; margin-top: 0; }
        .details table { width: 100%; border-collapse: collapse; }
        .details td { padding: 8px 0; border-bottom: 1px solid #eee; }
        .details td:first-child { font-weight: bold; color: #555; }
        .qr-section { text-align: center; margin: 30px 0; padding: 20px; background: #f0fdf4; border: 1px solid #10b981; border-radius: 5px; }
        .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 10px 0; font-weight: bold; }
        .button:hover { background: #059669; }
        .total { font-size: 24px; font-weight: bold; color: #10b981; margin: 20px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>💳 PayMeBro Invoice</h1>
            <p>Secure Cryptocurrency Payment</p>
        </div>
        
        <div class="invoice-header">
            <h2 style="margin: 0;">Invoice #${data.invoiceId}</h2>
            <p style="margin: 5px 0 0 0;">Please pay using the QR code below</p>
        </div>
        
        <div class="details">
            <h3>Invoice Details</h3>
            <table>
                <tr><td>Invoice ID:</td><td><strong>#${data.invoiceId}</strong></td></tr>
                <tr><td>Amount:</td><td class="total">${data.amount} ${data.currency}</td></tr>
                <tr><td>Description:</td><td>${data.description}</td></tr>
                <tr><td>Payment Network:</td><td>${data.chainName}</td></tr>
                ${data.merchantName ? `<tr><td>From:</td><td>${data.merchantName}</td></tr>` : ''}
                ${data.customerName ? `<tr><td>Bill To:</td><td>${data.customerName}</td></tr>` : ''}
                <tr><td>Issue Date:</td><td>${new Date().toLocaleDateString()}</td></tr>
                <tr><td>Due Date:</td><td>Immediate</td></tr>
            </table>
        </div>
        
        <div class="qr-section">
            <h3>📱 Scan to Pay</h3>
            <p><strong>Use your crypto wallet to scan this QR code:</strong></p>
            <img src="${data.qrCodeUrl}" alt="Payment QR Code" style="max-width: 300px; height: auto; border: 2px solid #10b981; border-radius: 10px; margin: 15px 0;">
            <br>
            <a href="${data.paymentUrl}" class="button">📲 Open in Wallet</a>
        </div>
        
        <div style="background: #dbeafe; color: #1e40af; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>🔒 How to Pay:</strong>
            <ul style="margin: 10px 0;">
                <li><strong>Scan QR Code:</strong> Use your crypto wallet app to scan the QR code above</li>
                <li><strong>Verify Details:</strong> Confirm the amount and recipient address</li>
                <li><strong>Approve Transaction:</strong> Complete the payment in your wallet</li>
                <li><strong>Payment Complete:</strong> Transaction will be processed on ${data.chainName}</li>
            </ul>
        </div>
        
        <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
            <p><strong>Need Help?</strong></p>
            <p>If you have questions about this payment, please contact the merchant directly or visit our help center.</p>
        </div>
        
        <div class="footer">
            <p>This invoice was generated by PayMeBro - Secure Multi-Chain Payments</p>
            <p><a href="https://paymebro.xyz">paymebro.xyz</a> | Powered by Blockchain Technology</p>
            <p style="font-size: 12px; color: #999;">This is an automated message. Please do not reply to this email.</p>
        </div>
    </div>
</body>
</html>`;
  }

  /**
   * Generate a unique invoice ID
   */
  static generateInvoiceId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `INV-${timestamp}-${random}`.toUpperCase();
  }
}
