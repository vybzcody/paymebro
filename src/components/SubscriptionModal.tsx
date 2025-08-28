import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Repeat, DollarSign } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const SubscriptionModal = ({ isOpen, onClose, onSuccess }: SubscriptionModalProps) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    amount: '',
    currency: 'USDC',
    description: '',
    interval: 'monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    autoEmail: true
  });

  const intervals = [
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
    { value: 'quarterly', label: 'Quarterly' },
    { value: 'yearly', label: 'Yearly' }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) {
      toast.error('Please log in to create subscriptions');
      return;
    }

    if (!formData.customerName || !formData.customerEmail || !formData.amount || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement subscription creation API
      const subscriptionData = {
        userId: user.userId || user.id,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        interval: formData.interval,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        autoEmail: formData.autoEmail
      };

      console.log('Creating subscription:', subscriptionData);
      
      toast.success('Subscription created successfully!', {
        description: `${formData.interval} payments of ${formData.amount} ${formData.currency}`
      });

      // Reset form
      setFormData({
        customerName: '',
        customerEmail: '',
        amount: '',
        currency: 'USDC',
        description: '',
        interval: 'monthly',
        startDate: new Date().toISOString().split('T')[0],
        endDate: '',
        autoEmail: true
      });

      onSuccess?.();
      onClose();
    } catch (error: any) {
      console.error('Error creating subscription:', error);
      toast.error('Failed to create subscription', {
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
            <Repeat className="h-5 w-5" />
            Create Subscription
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
                placeholder="50.00"
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
              placeholder="Monthly subscription service"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="interval">Billing Interval *</Label>
            <Select value={formData.interval} onValueChange={(value) => handleInputChange('interval', value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {intervals.map((interval) => (
                  <SelectItem key={interval.value} value={interval.value}>
                    {interval.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date *</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => handleInputChange('startDate', e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">End Date (Optional)</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => handleInputChange('endDate', e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-2">
              <Calendar className="h-4 w-4 text-gray-600" />
              <span className="text-sm font-medium">Auto-send invoices</span>
            </div>
            <Switch
              checked={formData.autoEmail}
              onCheckedChange={(checked) => handleInputChange('autoEmail', checked)}
            />
          </div>

          <div className="bg-blue-50 p-3 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>💡 How it works:</strong> Customers will receive automatic payment requests via email on each billing cycle. They can pay instantly with their Solana wallet.
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? (
                'Creating...'
              ) : (
                <>
                  <Repeat className="h-4 w-4 mr-2" />
                  Create Subscription
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
