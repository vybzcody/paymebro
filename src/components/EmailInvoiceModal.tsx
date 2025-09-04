import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Mail, Send, FileText } from "lucide-react";
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { toast } from 'sonner';

// Helper function to create/get user in backend
const createOrGetBackendUser = async (user: any): Promise<string | null> => {
  try {
    console.log('Creating/updating user in backend:', user.email);
    
    // Get current wallet address from context (we'll need to pass this or get it somehow)
    const response = await fetch('https://paymebro-backend-production.up.railway.app/api/user/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        web3authUserId: user.sub || user.email,
        walletAddress: 'temp-wallet-address', // This should be the actual wallet address
        email: user.email,
        name: user.name,
        avatarUrl: user.profileImage,
        loginProvider: user.typeOfLogin || 'google'
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Failed to create/update user:', errorData);
      return null;
    }

    const result = await response.json();
    console.log('User created/updated successfully:', result.user.id);
    return result.user.id;
  } catch (error) {
    console.error('Error creating/updating user:', error);
    return null;
  }
};

interface EmailInvoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EmailInvoiceModal = ({ isOpen, onClose, onSuccess }: EmailInvoiceModalProps) => {
  const { user } = useMultiChainWeb3Auth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    amount: '',
    currency: 'USDC',
    description: '',
    dueDate: '',
    notes: '',
    sendEmail: true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      toast.error('Please log in to create invoices');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      console.log('Creating invoice with backend API...');
      
      // First, ensure user exists in backend and get their UUID
      const backendUserId = await createOrGetBackendUser(user);
      if (!backendUserId) {
        toast.error('Failed to authenticate with backend');
        return;
      }
      
      // Create invoice via backend API
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: backendUserId,
          customerName: formData.customerName,
          customerEmail: formData.customerEmail,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          description: formData.description,
          dueDate: formData.dueDate || undefined,
          notes: formData.notes || undefined,
          sendEmail: formData.sendEmail
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Invoice creation failed:', errorData);
        toast.error(`Failed to create invoice: ${errorData.error || 'Unknown error'}`);
        return;
      }

      const result = await response.json();
      const invoice = result.invoice;
      
      if (formData.sendEmail) {
        toast.success(`Invoice sent to ${formData.customerEmail}`, {
          description: `Invoice #${invoice.invoiceNumber} created and emailed`
        });
      } else {
        toast.success('Invoice created successfully', {
          description: `Invoice #${invoice.invoiceNumber} saved as draft`
        });
      }

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        amount: '',
        currency: 'USDC',
        description: '',
        dueDate: '',
        notes: '',
        sendEmail: true
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating invoice:', error);
      toast.error('Failed to create invoice', {
        description: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Invoice
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Customer Name *</Label>
            <Input
              id="customerName"
              value={formData.customerName}
              onChange={(e) => handleInputChange('customerName', e.target.value)}
              placeholder="John Doe"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email *</Label>
            <Input
              id="customerEmail"
              type="email"
              value={formData.customerEmail}
              onChange={(e) => handleInputChange('customerEmail', e.target.value)}
              placeholder="john@example.com"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => handleInputChange('amount', e.target.value)}
                placeholder="100.00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select value={formData.currency} onValueChange={(value) => handleInputChange('currency', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Input
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Web development services"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dueDate">Due Date (Optional)</Label>
            <Input
              id="dueDate"
              type="date"
              value={formData.dueDate}
              onChange={(e) => handleInputChange('dueDate', e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes or payment terms..."
              rows={3}
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Mail className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Send email to customer</span>
            </div>
            <Switch
              checked={formData.sendEmail}
              onCheckedChange={(checked) => handleInputChange('sendEmail', checked)}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                'Creating...'
              ) : formData.sendEmail ? (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Create & Send
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
