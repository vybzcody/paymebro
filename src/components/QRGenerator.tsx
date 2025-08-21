import { Button } from "@/components/ui/button";
import { useState } from "react";
import { Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export const QRGenerator = () => {
  const [amount, setAmount] = useState("");
  const [walletAddress] = useState("7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU");
  const { toast } = useToast();

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(walletAddress);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const generateQR = () => {
    if (!amount) {
      toast({
        title: "Amount Required",
        description: "Please enter an amount to generate QR code",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "QR Code Generated",
      description: `Payment QR for $${amount} USDC created`,
    });
  };

  const downloadQR = () => {
    if (!amount) {
      toast({
        title: "Generate QR First",
        description: "Please generate a QR code before downloading",
        variant: "destructive",
      });
      return;
    }

    // Create a mock download
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
      // Create a simple QR code-like pattern
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 256, 256);
      
      ctx.fillStyle = '#000000';
      // Draw QR code pattern
      for (let i = 0; i < 256; i += 8) {
        for (let j = 0; j < 256; j += 8) {
          if (Math.random() > 0.5) {
            ctx.fillRect(i, j, 8, 8);
          }
        }
      }
      
      // Add corner squares
      ctx.fillRect(0, 0, 64, 64);
      ctx.fillRect(192, 0, 64, 64);
      ctx.fillRect(0, 192, 64, 64);
      
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(8, 8, 48, 48);
      ctx.fillRect(200, 8, 48, 48);
      ctx.fillRect(8, 200, 48, 48);
      
      ctx.fillStyle = '#000000';
      ctx.fillRect(16, 16, 32, 32);
      ctx.fillRect(208, 16, 32, 32);
      ctx.fillRect(16, 208, 32, 32);
    }
    
    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `afripay-qr-${amount}-usdc.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        toast({
          title: "QR Code Downloaded",
          description: `QR code for $${amount} USDC saved to your device`,
        });
      }
    }, 'image/png');
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Amount (USDC)</label>
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="0.00"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Your Wallet Address</label>
        <div className="flex items-center space-x-2">
          <input
            type="text"
            value={walletAddress}
            readOnly
            className="flex-1 px-3 py-2 bg-muted/50 border rounded-lg text-sm"
          />
          <Button variant="outline" size="sm" onClick={handleCopyAddress}>
            <Copy className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {amount && (
        <div className="bg-muted/30 rounded-lg p-4 text-center">
          <div className="w-32 h-32 bg-primary/10 rounded-lg mx-auto mb-3 flex items-center justify-center">
            <div className="text-primary text-xs text-center">
              QR Code<br/>
              ${amount} USDC
            </div>
          </div>
          <p className="text-sm text-muted-foreground mb-3">
            Scan to pay ${amount} USDC
          </p>
          <Button variant="outline" size="sm" className="w-full" onClick={downloadQR}>
            <Download className="w-4 h-4 mr-2" />
            Download QR
          </Button>
        </div>
      )}

      <Button 
        onClick={generateQR}
        className="w-full bg-gradient-to-r from-primary to-primary-glow hover:from-primary/90 hover:to-primary-glow/90"
      >
        Generate QR Code
      </Button>
    </div>
  );
};