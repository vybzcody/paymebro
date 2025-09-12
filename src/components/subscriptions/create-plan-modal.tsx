import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { appConfig, getApiHeaders } from "@/lib/config";

interface CreatePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  userId: string;
}

export function CreatePlanModal({ isOpen, onClose, onSuccess, userId }: CreatePlanModalProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    amount: '',
    currency: 'USDC',
    intervalType: 'monthly',
    intervalCount: '1',
    trialDays: '0',
    maxSubscribers: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.amount) {
      toast({
        title: "Missing Fields",
        description: "Please fill in name and amount",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans`, {
        method: 'POST',
        headers: getApiHeaders(userId),
        body: JSON.stringify({
          name: formData.name,
          description: formData.description,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          intervalType: formData.intervalType,
          intervalCount: parseInt(formData.intervalCount),
          trialDays: parseInt(formData.trialDays),
          maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : null
        })
      });

      const result = await response.json();

      if (response.ok) {
        toast({
          title: "Plan Created!",
          description: `${formData.name} subscription plan created successfully`
        });

        onSuccess();
        onClose();
        setFormData({
          name: '',
          description: '',
          amount: '',
          currency: 'USDC',
          intervalType: 'monthly',
          intervalCount: '1',
          trialDays: '0',
          maxSubscribers: ''
        });
      } else {
        toast({
          title: "Creation Failed",
          description: result.error || "Failed to create subscription plan",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Failed to create plan:', error);
      toast({
        title: "Creation Failed",
        description: "Network error. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Subscription Plan</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Plan Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Premium Plan"
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Access to premium features"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                placeholder="9.99"
                required
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={formData.currency} onValueChange={(value) => setFormData(prev => ({ ...prev, currency: value }))}>
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="intervalType">Billing Period</Label>
              <Select value={formData.intervalType} onValueChange={(value) => setFormData(prev => ({ ...prev, intervalType: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="trialDays">Trial Days</Label>
              <Input
                id="trialDays"
                type="number"
                value={formData.trialDays}
                onChange={(e) => setFormData(prev => ({ ...prev, trialDays: e.target.value }))}
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="maxSubscribers">Max Subscribers (optional)</Label>
            <Input
              id="maxSubscribers"
              type="number"
              value={formData.maxSubscribers}
              onChange={(e) => setFormData(prev => ({ ...prev, maxSubscribers: e.target.value }))}
              placeholder="Unlimited"
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting} className="flex-1">
              {isSubmitting ? 'Creating...' : 'Create Plan'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
