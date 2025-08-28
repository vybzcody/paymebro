const API_BASE = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export interface CreateInvoiceData {
  userId: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency?: string;
  description: string;
  dueDate?: string;
  notes?: string;
  sendEmail?: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  currency: string;
  status: string;
  description: string;
  dueDate?: string;
  createdAt: string;
  sentAt?: string;
  paidAt?: string;
}

export const invoiceService = {
  async createInvoice(data: CreateInvoiceData): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/api/invoices`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create invoice');
    }

    const result = await response.json();
    return result.invoice;
  },

  async getInvoices(userId: string): Promise<Invoice[]> {
    const response = await fetch(`${API_BASE}/api/invoices?userId=${userId}`);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to fetch invoices');
    }

    const result = await response.json();
    return result.invoices;
  },

  async sendInvoice(invoiceId: string): Promise<void> {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/send`, {
      method: 'POST',
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to send invoice');
    }
  },

  async updateInvoiceStatus(invoiceId: string, status: string, transactionSignature?: string): Promise<Invoice> {
    const response = await fetch(`${API_BASE}/api/invoices/${invoiceId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, transactionSignature }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to update invoice status');
    }

    const result = await response.json();
    return result.invoice;
  }
};
