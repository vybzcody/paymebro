import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Mail, FileText, Send } from 'lucide-react';
import { toast } from 'sonner';

interface Invoice {
  id: string;
  customerEmail: string;
  amount: number;
  currency: string;
  description: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  created: string;
  dueDate: string;
}

export const InvoiceGenerator = () => {
  const [invoices, setInvoices] = useState<Invoice[]>([
    {
      id: 'INV-001',
      customerEmail: 'customer@example.com',
      amount: 299.99,
      currency: 'USDC',
      description: 'Web Development Services',
      status: 'paid',
      created: '2024-01-15',
      dueDate: '2024-01-30'
    }
  ]);

  const [newInvoice, setNewInvoice] = useState({
    customerEmail: '',
    amount: '',
    currency: 'USDC',
    description: '',
    dueDate: ''
  });

  const createInvoice = () => {
    if (!newInvoice.customerEmail || !newInvoice.amount || !newInvoice.description) {
      toast.error('Please fill all required fields');
      return;
    }

    const invoice: Invoice = {
      id: `INV-${String(invoices.length + 1).padStart(3, '0')}`,
      customerEmail: newInvoice.customerEmail,
      amount: parseFloat(newInvoice.amount),
      currency: newInvoice.currency,
      description: newInvoice.description,
      status: 'draft',
      created: new Date().toISOString().split('T')[0],
      dueDate: newInvoice.dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    };

    setInvoices([invoice, ...invoices]);
    setNewInvoice({ customerEmail: '', amount: '', currency: 'USDC', description: '', dueDate: '' });
    toast.success('Invoice created!');
  };

  const sendInvoice = (invoiceId: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoiceId ? { ...inv, status: 'sent' as const } : inv
    ));
    toast.success('Invoice sent via email!');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'text-green-600 bg-green-100';
      case 'sent': return 'text-blue-600 bg-blue-100';
      case 'overdue': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Create Invoice
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="email">Customer Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="customer@example.com"
                value={newInvoice.customerEmail}
                onChange={(e) => setNewInvoice({ ...newInvoice, customerEmail: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="dueDate">Due Date</Label>
              <Input
                id="dueDate"
                type="date"
                value={newInvoice.dueDate}
                onChange={(e) => setNewInvoice({ ...newInvoice, dueDate: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newInvoice.amount}
                onChange={(e) => setNewInvoice({ ...newInvoice, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={newInvoice.currency} onValueChange={(value) => setNewInvoice({ ...newInvoice, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="Describe the services or products..."
              value={newInvoice.description}
              onChange={(e) => setNewInvoice({ ...newInvoice, description: e.target.value })}
            />
          </div>
          <Button onClick={createInvoice} className="w-full">
            Create Invoice
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Invoices</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium">{invoice.id}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{invoice.customerEmail}</p>
                  <p className="text-sm">{invoice.description}</p>
                  <p className="text-sm font-medium">
                    {invoice.amount} {invoice.currency} • Due: {invoice.dueDate}
                  </p>
                </div>
                <div className="flex gap-2">
                  {invoice.status === 'draft' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => sendInvoice(invoice.id)}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      Send
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
