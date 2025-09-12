import { useState, useEffect } from "react";
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
import { Loader2, QrCode, Copy, Check, ExternalLink, ArrowLeft, Wifi, WifiOff, RotateCcw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useWebSocket } from "@/components/providers/websocket-provider";

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
    currency: "USDC",
    customerEmail: ""
  });
  const [isLoading, setIsLoading] = useState(false);
  const [paymentResult, setPaymentResult] = useState<any>(null);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { joinPayment, isConnected, isConnecting, connectionError, reconnect } = useWebSocket();

  const isValidEmail = (email: string) => {
    if (!email.trim()) return true; // Empty is valid (optional)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🎯 Form submission started:', {
      ...formData
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
        customerEmail: formData.customerEmail || undefined,
        web3AuthUserId: userId,
        chain: 'solana',
        splToken
      };

      const result = await paymentsApi.createPayment(paymentData);
      console.log('🎉 Payment created successfully:', result);
      
      setPaymentResult(result);
      
      // Join the payment room for real-time updates
      if (result.reference) {
        try {
          const joined = await joinPayment(result.reference);
          if (joined) {
            console.log('Successfully joined payment room for real-time updates');
          } else {
            console.warn('Failed to join payment room for real-time updates');
          }
        } catch (error) {
          console.error('Error joining payment room:', error);
          toast({
            title: "Real-time Updates",
            description: "Could not enable real-time payment updates",
            variant: "destructive",
          });
        }
      }
      
      toast({
        title: "Payment Created!",
        description: `${formData.currency} payment request created successfully`,
        action: (
          <div className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">
              Ensure payer has sufficient SOL for gas fees
            </span>
          </div>
        ),
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
      toast({
        title: "Copied!",
        description: "Payment link copied to clipboard",
      });
    }
  };

  const handleClose = () => {
    setFormData({ amount: "", label: "", message: "", currency: "USDC", customerEmail: "" });
    setPaymentResult(null);
    setCopied(false);
    onClose();
  };

  const handleBackToForm = () => {
    setPaymentResult(null);
    setCopied(false);
  };

  // Success State
  if (paymentResult) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-green-600">
              <Check className="h-5 w-5" />
              Payment Created Successfully!
            </DialogTitle>
            <DialogDescription>
              Your {formData.currency} payment request is ready to share
            </DialogDescription>
          </DialogHeader>
          
          {/* WebSocket Connection Status */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              {isConnecting && (
                <span className="text-yellow-600 flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                  Connecting...
                </span>
              )}
              {!isConnecting && isConnected && (
                <span className="text-green-600 flex items-center gap-1">
                  <Wifi className="h-3 w-3" />
                  Real-time updates enabled
                </span>
              )}
              {!isConnecting && !isConnected && (
                <span className="text-red-600 flex items-center gap-1">
                  <WifiOff className="h-3 w-3" />
                  Real-time updates disabled
                </span>
              )}
            </div>
            {!isConnected && !isConnecting && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={reconnect}
                className="h-6 text-xs"
              >
                <RotateCcw className="h-3 w-3 mr-1" />
                Retry
              </Button>
            )}
          </div>
          
          {connectionError && (
            <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
              {connectionError}
            </div>
          )}
          
          <div className="space-y-4">
            {/* Amount Display */}
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="text-2xl font-bold text-green-700">
                {formData.amount} {formData.currency}
              </div>
              <div className="text-sm text-green-600">{formData.label}</div>
              <div className="text-xs text-muted-foreground mt-2">
                Payer needs sufficient SOL for gas fees
              </div>
            </div>

            {/* QR Code */}
            {paymentResult.qrCode && (
              <div className="text-center">
                <img 
                  src={paymentResult.qrCode} 
                  alt="Payment QR Code" 
                  className="w-48 h-48 mx-auto border rounded-lg"
                />
                <p className="text-xs text-muted-foreground mt-2">
                  Scan with Solana wallet
                </p>
              </div>
            )}

            {/* Payment Link */}
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

          <DialogFooter className="gap-2">
            <Button variant="outline" onClick={handleBackToForm} className="flex-1">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Create Another
            </Button>
            <Button onClick={handleClose} className="flex-1">
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  // Form State
  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Payment Request</DialogTitle>
          <DialogDescription>
            Generate a payment QR code for your customer
          </DialogDescription>
        </DialogHeader>
        
        {/* WebSocket Connection Status */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {isConnecting && (
              <span className="text-yellow-600 flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
                Connecting...
              </span>
            )}
            {!isConnecting && isConnected && (
              <span className="text-green-600 flex items-center gap-1">
                <Wifi className="h-3 w-3" />
                Real-time updates enabled
              </span>
            )}
            {!isConnecting && !isConnected && (
              <span className="text-red-600 flex items-center gap-1">
                <WifiOff className="h-3 w-3" />
                Real-time updates disabled
              </span>
            )}
          </div>
          {!isConnected && !isConnecting && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={reconnect}
              className="h-6 text-xs"
            >
              <RotateCcw className="h-3 w-3 mr-1" />
              Retry
            </Button>
          )}
        </div>
        
        {connectionError && (
          <div className="text-sm text-red-600 p-2 bg-red-50 rounded">
            {connectionError}
          </div>
        )}
        
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
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select 
                value={formData.currency} 
                onValueChange={(value) => setFormData({ ...formData, currency: value })}
                disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
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
              disabled={isLoading}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
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
// } from "@/components/ui/dialog";
// import { paymentsApi, type CreatePaymentRequest } from "@/lib/api/payments";
// import { Loader2, QrCode, Copy, Check, ExternalLink, ArrowLeft } from "lucide-react";
// import { useToast } from "@/hooks/use-toast";
// import { useWebSocket } from "@/components/providers/websocket-provider";

// interface CreatePaymentModalProps {
//   isOpen: boolean;
//   onClose: () => void;
//   userId: string;
// }

// export function CreatePaymentModal({ isOpen, onClose, userId }: CreatePaymentModalProps) {
//   const [formData, setFormData] = useState({
//     amount: "",
//     label: "",
//     message: "",
//     currency: "USDC"
//   });
//   const [isLoading, setIsLoading] = useState(false);
//   const [paymentResult, setPaymentResult] = useState<any>(null);
//   const [copied, setCopied] = useState(false);
//   const { toast } = useToast();
//   const { joinPayment } = useWebSocket();

//   const isValidEmail = (email: string) => {
//     if (!email.trim()) return true; // Empty is valid (optional)
//     const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
//     return emailRegex.test(email);
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
    
//     console.log('🎯 Form submission started:', {
//       ...formData,
//       userId,
//       customerEmail: formData.customerEmail || 'none'
//     });

//     if (!formData.amount || !formData.label) {
//       toast({
//         title: "Validation Error",
//         description: "Amount and label are required",
//         variant: "destructive",
//       });
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const splToken = formData.currency === 'USDC' 
//         ? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' // USDC devnet
//         : undefined; // SOL (native)

//       console.log('💰 Payment configuration:', {
//         currency: formData.currency,
//         splToken,
//         chain: 'solana'
//       });

//       const paymentData: CreatePaymentRequest = {
//         amount: parseFloat(formData.amount),
//         label: formData.label,
//         message: formData.message || formData.label,
//         web3AuthUserId: userId,
//         chain: 'solana',
//         splToken
//       };

//       const result = await paymentsApi.createPayment(paymentData);
//       console.log('🎉 Payment created successfully:', result);
      
//       setPaymentResult(result);
      
//       // Join the payment room for real-time updates
//       if (result.reference) {
//         try {
//           await joinPayment(result.reference);
//           console.log('Successfully joined payment room for real-time updates');
//         } catch (error) {
//           console.error('Failed to join payment room:', error);
//         }
//       }
      
//       toast({
//         title: "Payment Created!",
//         description: `${formData.currency} payment request created successfully`,
//       });
//     } catch (error) {
//       console.error('💥 Payment creation failed:', error);
//       toast({
//         title: "Payment Creation Failed",
//         description: error instanceof Error ? error.message : "Please try again",
//         variant: "destructive",
//       });
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   const copyPaymentUrl = async () => {
//     if (paymentResult?.paymentUrl) {
//       await navigator.clipboard.writeText(paymentResult.paymentUrl);
//       setCopied(true);
//       setTimeout(() => setCopied(false), 2000);
//       toast({
//         title: "Copied!",
//         description: "Payment link copied to clipboard",
//       });
//     }
//   };

//   const handleClose = () => {
//     setFormData({ amount: "", label: "", message: "", currency: "USDC" });
//     setPaymentResult(null);
//     setCopied(false);
//     onClose();
//   };

//   const handleBackToForm = () => {
//     setPaymentResult(null);
//     setCopied(false);
//   };

//   // Success State
//   if (paymentResult) {
//     return (
//       <Dialog open={isOpen} onOpenChange={handleClose}>
//         <DialogContent className="sm:max-w-md">
//           <DialogHeader>
//             <DialogTitle className="flex items-center gap-2 text-green-600">
//               <Check className="h-5 w-5" />
//               Payment Created Successfully!
//             </DialogTitle>
//             <DialogDescription>
//               Your {formData.currency} payment request is ready to share
//             </DialogDescription>
//           </DialogHeader>
          
//           <div className="space-y-4">
//             {/* Amount Display */}
//             <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
//               <div className="text-2xl font-bold text-green-700">
//                 {formData.amount} {formData.currency}
//               </div>
//               <div className="text-sm text-green-600">{formData.label}</div>
//             </div>

//             {/* QR Code */}
//             {paymentResult.qrCode && (
//               <div className="text-center">
//                 <img 
//                   src={paymentResult.qrCode} 
//                   alt="Payment QR Code" 
//                   className="w-48 h-48 mx-auto border rounded-lg"
//                 />
//                 <p className="text-xs text-muted-foreground mt-2">
//                   Scan with Solana wallet
//                 </p>
//               </div>
//             )}

//             {/* Payment Link */}
//             <div className="space-y-2">
//               <Label>Payment Link</Label>
//               <div className="flex items-center gap-2">
//                 <Input 
//                   value={paymentResult.paymentUrl} 
//                   readOnly 
//                   className="text-sm"
//                 />
//                 <Button
//                   variant="outline"
//                   size="sm"
//                   onClick={copyPaymentUrl}
//                 >
//                   {copied ? (
//                     <Check className="h-4 w-4 text-green-600" />
//                   ) : (
//                     <Copy className="h-4 w-4" />
//                   )}
//                 </Button>
//               </div>
//             </div>

//             {/* Reference */}
//             <div className="space-y-2">
//               <Label>Reference ID</Label>
//               <Input 
//                 value={paymentResult.reference} 
//                 readOnly 
//                 className="text-sm font-mono"
//               />
//             </div>
//           </div>

//           <DialogFooter className="gap-2">
//             <Button variant="outline" onClick={handleBackToForm} className="flex-1">
//               <ArrowLeft className="h-4 w-4 mr-2" />
//               Create Another
//             </Button>
//             <Button onClick={handleClose} className="flex-1">
//               Done
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     );
//   }

//   // Form State
//   return (
//     <Dialog open={isOpen} onOpenChange={handleClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Create Payment Request</DialogTitle>
//           <DialogDescription>
//             Generate a payment QR code for your customer
//           </DialogDescription>
//         </DialogHeader>
        
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div className="grid grid-cols-2 gap-4">
//             <div className="space-y-2">
//               <Label htmlFor="amount">Amount *</Label>
//               <Input
//                 id="amount"
//                 type="number"
//                 step="0.01"
//                 min="0"
//                 placeholder="0.00"
//                 value={formData.amount}
//                 onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
//                 required
//                 disabled={isLoading}
//               />
//             </div>
//             <div className="space-y-2">
//               <Label htmlFor="currency">Currency *</Label>
//               <Select 
//                 value={formData.currency} 
//                 onValueChange={(value) => setFormData({ ...formData, currency: value })}
//                 disabled={isLoading}
//               >
//                 <SelectTrigger>
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="USDC">USDC</SelectItem>
//                   <SelectItem value="SOL">SOL</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="label">Payment Label *</Label>
//             <Input
//               id="label"
//               placeholder="e.g., Coffee Purchase"
//               value={formData.label}
//               onChange={(e) => setFormData({ ...formData, label: e.target.value })}
//               required
//               disabled={isLoading}
//             />
//           </div>

//           <div className="space-y-2">
//             <Label htmlFor="message">Message (Optional)</Label>
//             <Textarea
//               id="message"
//               placeholder="Thank you for your purchase!"
//               value={formData.message}
//               onChange={(e) => setFormData({ ...formData, message: e.target.value })}
//               rows={3}
//               disabled={isLoading}
//             />
//           </div>

//           <DialogFooter>
//             <Button type="button" variant="outline" onClick={handleClose} disabled={isLoading}>
//               Cancel
//             </Button>
//             <Button type="submit" disabled={isLoading}>
//               {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
//               {isLoading ? 'Creating...' : `Create ${formData.currency} Payment`}
//             </Button>
//           </DialogFooter>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
