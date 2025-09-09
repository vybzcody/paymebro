import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, X, Smartphone } from "lucide-react";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

interface QRReceiptModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  qrCode: {
    title: string;
    amount: number;
    currency: string;
    qr_code_url: string;
    payment_url: string;
    reference: string;
    payment_count: number;
    total_collected: number;
  } | null;
}

export function QRReceiptModal({ open, onOpenChange, qrCode }: QRReceiptModalProps) {
  if (!qrCode) return null;

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 bg-white rounded-2xl overflow-hidden">
        <VisuallyHidden>
          <DialogTitle>Payment QR Code for {qrCode.title}</DialogTitle>
        </VisuallyHidden>
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-6 text-white relative">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="absolute top-4 right-4 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="text-center">
            <h2 className="text-xl font-bold mb-1">Payment Request</h2>
            <p className="text-blue-100 text-sm">{qrCode.title}</p>
          </div>
        </div>

        {/* Amount */}
        <div className="px-6 py-4 text-center border-b">
          <div className="text-3xl font-bold text-gray-900">
            {qrCode.amount} {qrCode.currency}
          </div>
          <p className="text-gray-500 text-sm mt-1">Amount to pay</p>
        </div>

        {/* QR Code */}
        <div className="px-6 py-6 text-center bg-gray-50">
          <div className="bg-white p-4 rounded-xl shadow-sm inline-block">
            <img 
              src={qrCode.qr_code_url} 
              alt="Payment QR Code" 
              className="w-48 h-48 mx-auto"
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          <div className="flex items-center justify-center mt-4 text-gray-600">
            <Smartphone className="h-4 w-4 mr-2" />
            <span className="text-sm">Scan with your Solana wallet</span>
          </div>
        </div>

        {/* Details */}
        <div className="px-6 py-4 space-y-3 border-t bg-gray-50">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Reference</span>
            <span className="font-mono text-xs bg-gray-200 px-2 py-1 rounded">
              {qrCode.reference.slice(0, 8)}...
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Payments</span>
            <Badge variant="secondary">{qrCode.payment_count}</Badge>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600">Total Collected</span>
            <span className="font-semibold">{qrCode.total_collected} {qrCode.currency}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="p-6 pt-4">
          <Button
            onClick={() => copyToClipboard(qrCode.payment_url)}
            className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700"
          >
            <Copy className="h-4 w-4 mr-2" />
            Copy Payment Link
          </Button>
          <p className="text-xs text-gray-500 text-center mt-3">
            Share this QR code or payment link with your customers
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
