const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface BusinessMetrics {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  activeCustomers: number;
  monthlyGrowth: number;
}

export interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  currency: string;
  url: string;
  created_at: string;
  clicks: number;
  conversions: number;
}

export interface Invoice {
  id: string;
  invoice_number: string;
  customer_name: string;
  customer_email: string;
  amount: number;
  currency: string;
  status: 'draft' | 'sent' | 'viewed' | 'paid' | 'expired' | 'cancelled';
  created_at: string;
  due_date?: string;
  description: string;
}

/**
 * Get business metrics for the current user
 */
export const getBusinessMetrics = async (userId: string): Promise<BusinessMetrics> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/metrics?merchantId=${userId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch metrics');
    }

    const result = await response.json();
    return result.metrics;
  } catch (error) {
    console.error('Error fetching business metrics:', error);
    // Return default values on error
    return {
      totalRevenue: 0,
      totalTransactions: 0,
      successRate: 0,
      activeCustomers: 0,
      monthlyGrowth: 0
    };
  }
};

/**
 * Create a new payment link
 */
export const createPaymentLink = async (
  userId: string,
  title: string,
  amount: number,
  currency: string = 'USDC',
  options?: {
    preferredReceiveChain?: string;
    acceptedChains?: string[];
    merchantWallets?: Record<string, string>;
  }
): Promise<PaymentLink> => {
  try {
    const paymentId = Math.random().toString(36).substr(2, 9);
    
    // Enhanced payment link with multi-chain support
    const link: PaymentLink = {
      id: Date.now().toString(),
      title,
      amount,
      currency,
      url: `${window.location.origin}/pay/${paymentId}`,
      created_at: new Date().toISOString(),
      clicks: 0,
      conversions: 0,
      // Multi-chain extensions
      preferredReceiveChain: options?.preferredReceiveChain || 'solana',
      acceptedChains: options?.acceptedChains || ['solana', 'ethereum', 'arbitrum', 'base'],
      merchantWallets: options?.merchantWallets || {},
      autoConvert: true
    };

    return link;
  } catch (error) {
    console.error('Error creating payment link:', error);
    throw error;
  }
};

/**
 * Get payment links for user
 */
export const getPaymentLinks = async (userId: string): Promise<PaymentLink[]> => {
  try {
    // For now, return empty array
    // TODO: Implement backend endpoint for fetching payment links
    return [];
  } catch (error) {
    console.error('Error fetching payment links:', error);
    throw error;
  }
};

/**
 * Create a new invoice using backend API
 */
export const createInvoice = async (
  web3authUserId: string, // Web3Auth user ID (string, not UUID)
  invoiceData: {
    merchantName: string;
    merchantEmail: string;
    merchantWallet: string;
    customerName: string;
    customerEmail: string;
    amount: number;
    currency: string;
    description: string;
    dueDate?: string;
    notes?: string;
    sendEmail?: boolean;
  }
): Promise<Invoice> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        merchantId: web3authUserId, // Web3Auth user ID
        merchantName: invoiceData.merchantName,
        merchantEmail: invoiceData.merchantEmail,
        merchantWallet: invoiceData.merchantWallet,
        customerName: invoiceData.customerName,
        customerEmail: invoiceData.customerEmail,
        amount: invoiceData.amount,
        currency: invoiceData.currency,
        description: invoiceData.description,
        dueDate: invoiceData.dueDate,
        notes: invoiceData.notes,
        sendEmail: invoiceData.sendEmail || false
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create invoice');
    }

    const result = await response.json();
    
    return {
      id: result.invoice.id,
      invoice_number: result.invoice.invoiceNumber,
      customer_name: invoiceData.customerName,
      customer_email: invoiceData.customerEmail,
      amount: invoiceData.amount,
      currency: invoiceData.currency,
      status: 'draft',
      created_at: new Date().toISOString(),
      due_date: invoiceData.dueDate,
      description: invoiceData.description
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    throw error;
  }
};

/**
 * Get invoices for user using backend API
 */
export const getInvoices = async (web3authUserId: string): Promise<Invoice[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/invoices?merchantId=${web3authUserId}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to fetch invoices');
    }

    const result = await response.json();
    
    return result.invoices.map((invoice: any) => ({
      id: invoice.id,
      invoice_number: invoice.invoiceNumber,
      customer_name: invoice.customerName,
      customer_email: invoice.customerEmail,
      amount: invoice.amount,
      currency: invoice.currency,
      status: invoice.status,
      created_at: invoice.createdAt,
      due_date: invoice.dueDate,
      description: invoice.description
    }));
  } catch (error) {
    console.error('Error fetching invoices:', error);
    throw error;
  }
};

/**
 * Handle Web3Auth login - sync user with backend
 */
export const syncUserWithBackend = async (web3authUserInfo: any, walletAddress: string): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/api/user/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        web3authUserId: web3authUserInfo.verifierId || web3authUserInfo.sub,
        walletAddress,
        email: web3authUserInfo.email,
        name: web3authUserInfo.name,
        avatarUrl: web3authUserInfo.profileImage,
        loginProvider: web3authUserInfo.typeOfLogin || 'unknown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to sync user');
    }

    const result = await response.json();
    return result.user;
  } catch (error) {
    console.error('Error syncing user with backend:', error);
    throw error;
  }
};
