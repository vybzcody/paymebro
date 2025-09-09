import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2, QrCode, Copy, Check } from "lucide-react";
import { type Template } from "@/lib/api/templates";

interface UseTemplateModalProps {
  template: Template;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (customerEmail?: string) => Promise<any>;
}

export function UseTemplateModal({ template, isOpen, onClose, onSubmit }: UseTemplateModalProps) {
  const [customerEmail, setCustomerEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const result = await onSubmit(customerEmail || undefined);
      setPaymentResult(result);
    } catch (error: any) {
      console.error('Failed to create payment from template:', error);
      alert(`Failed to create payment: ${error.message || 'Please try again.'}`);
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
    setCustomerEmail("");
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
              Payment Created from Template
            </DialogTitle>
            <DialogDescription>
              Share this QR code or payment link with your customer
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Template Info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-sm text-gray-700">Template Used</h3>
              <p className="text-lg font-semibold">{template.name}</p>
              <p className="text-sm text-gray-600">{template.amount} {template.currency}</p>
            </div>

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
          <DialogTitle>Use Template: {template.name}</DialogTitle>
          <DialogDescription>
            Create a payment using this template
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Template Preview */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{template.label}</h3>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {template.amount} {template.currency}
                </p>
                {template.message && (
                  <p className="text-sm text-gray-600 mt-2">{template.message}</p>
                )}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Payment
              </Button>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
