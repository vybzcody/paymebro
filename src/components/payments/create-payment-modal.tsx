import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { paymentsApi, type CreatePaymentRequest } from "@/lib/api/payments";
import { Loader2, QrCode, Copy, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CreatePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export function CreatePaymentModal({ isOpen, onClose, userId }: CreatePaymentModalProps) {
  const [formData, setFormData] = useState({
    amount: "",
    label: "",
    message: "",
    customerEmail: "",
    currency: "USDC"
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Form submission started:', {
      ...formData,
      userId,
      customerEmail: formData.customerEmail || 'none'
    });

    if (!formData.amount || !formData.label) {
      toast({
        title: "Validation Error",
        description: "Amount and label are required",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const splToken = formData.currency === 'USDC' 
        ? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // USDC devnet
        : undefined; // SOL (native)

      console.log('💰 Payment configuration:', {
        currency: formData.currency,
        splToken,
        chain: 'solana'
      });

      const paymentData: CreatePaymentRequest = {
        amount: parseFloat(formData.amount),
        label: formData.label,
        message: formData.message || formData.label,
        customerEmail: formData.customerEmail.trim() || undefined,
        web3AuthUserId: userId,
        chain: 'solana',
        splToken
      };

      const result = await paymentsApi.createPayment(paymentData);
      console.log('🎉 Payment created successfully:', result);
      
      setPaymentResult(result);
      
      toast({
        title: "Payment Created!",
        description: `${formData.currency} payment request created successfully`,
      });
    } catch (error) {
      console.error('💥 Payment creation failed:', error);
      toast({
        title: "Payment Creation Failed",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  const copyPaymentUrl = async () => {
    if (paymentResult?.paymentUrl) {
      await navigator.clipboard.writeText(paymentResult.paymentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setFormData({ amount: "", label: "", message: "", customerEmail: "", currency: "USDC" });
    setPaymentResult(null);
    setCopied(false);
    onClose();
  };

  if (paymentResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <QrCode className="h-5 w-5 text-green-600" />
              Payment Created Successfully
            </DialogTitle>
            <DialogDescription>
              Share this QR code or payment link with your customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* QR Code */}
            <div className="flex justify-center p-4 bg-gray-50 rounded-lg">
              <img 
                src={paymentResult.qrCode} 
                alt="Payment QR Code" 
                className="w-48 h-48"
              />
            </div>

            {/* Payment URL */}
            <div className="space-y-2">
              <Label>Payment Link</Label>
              <div className="flex items-center gap-2">
                <Input 
                  value={paymentResult.paymentUrl} 
                  readOnly 
                  className="text-sm"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyPaymentUrl}
                >
                  {copied ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Reference */}
            <div className="space-y-2">
              <Label>Reference ID</Label>
              <Input 
                value={paymentResult.reference} 
                readOnly 
                className="text-sm font-mono"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={handleClose} className="w-full">
              Create Another Payment
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create New Payment</DialogTitle>
          <DialogDescription>
            Generate a payment QR code for your customer
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
              >
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
            <Label htmlFor="label">Payment Label *</Label>
            <Input
              id="label"
              placeholder="e.g., Coffee Purchase"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message (Optional)</Label>
            <Textarea
              id="message"
              placeholder="Thank you for your purchase!"
              value={formData.message}
              onChange={(e) => setFormData({ ...formData, message: e.target.value })}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
            <Input
              id="customerEmail"
              type="email"
              placeholder="customer@example.com"
              value={formData.customerEmail}
              onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? 'Creating...' : `Create ${formData.currency} Payment`}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
