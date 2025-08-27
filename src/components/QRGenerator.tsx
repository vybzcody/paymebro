import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import NetworkStatus from "./NetworkStatus";
import {
  Copy,
  Download,
  QrCode,
  Wallet,
  CheckCircle2,
  AlertCircle,
  Clock,
  Loader2,
  ExternalLink,
  DollarSign,
  User,
  Mail,
  MessageCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useSolanaPayOfficial, PaymentData } from "@/hooks/useSolanaPayOfficial";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";

export const QRGenerator = () => {
  const { toast } = useToast();
  const { publicKey, user } = useWeb3Auth();
  const {
    paymentState,
    createAndMonitorPayment,
    resetPayment,
    isWalletConnected,
    walletAddress,
    isBackendHealthy,
    calculateFees
  } = useSolanaPayOfficial();

  const [formData, setFormData] = useState({
    amount: '',
    currency: 'SOL' as 'SOL' | 'USDC',
    description: '',
    customerEmail: '',
    customerName: '',
    memo: ''
  });

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: message,
    });
  };

  const generateQRCode = async () => {
    if (!isWalletConnected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to generate payment QR codes",
        variant: "destructive",
      });
      return;
    }

    if (!formData.amount || !formData.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in amount and description",
        variant: "destructive",
      });
      return;
    }

    const amount = parseFloat(formData.amount);
    if (amount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    try {
      resetPayment();

      const paymentData: PaymentData = {
        amount,
        currency: formData.currency,
        label: user?.name || 'AfriPay Merchant',
        message: formData.description,
        memo: formData.memo,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail
      };

      await createAndMonitorPayment(paymentData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to generate payment QR code",
        variant: "destructive",
      });
    }
  };

  const downloadQRCode = () => {
    if (paymentState.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = paymentState.qrCodeUrl;
      link.download = `solana-pay-${formData.amount}-${formData.currency.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast({
        title: "QR Code Downloaded",
        description: `Solana Pay QR code saved to your device`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <NetworkStatus />

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Create Solana Pay QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Amount and Currency */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency *</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: 'SOL' | 'USDC') => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select currency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="SOL">SOL (Native Token)</SelectItem>
                  <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <div className="relative">
              <MessageCircle className="absolute left-3 top-3 text-muted-foreground w-4 h-4" />
              <Textarea
                id="description"
                placeholder="What is this payment for?"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="pl-10 min-h-[80px]"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="customerName"
                  placeholder="Customer name"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Memo */}
          <div className="space-y-2">
            <Label htmlFor="memo">Memo (Optional)</Label>
            <Input
              id="memo"
              placeholder="Payment reference or note"
              value={formData.memo}
              onChange={(e) => setFormData(prev => ({ ...prev, memo: e.target.value }))}
            />
          </div>

          {/* Wallet Status */}
          {!isWalletConnected ? (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Connect your wallet to generate Solana Pay QR codes
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">Wallet Connected</span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {walletAddress?.slice(0, 8)}...{walletAddress?.slice(-8)}
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={generateQRCode}
            className="w-full"
            size="lg"
            disabled={paymentState.status === 'creating' || !isWalletConnected}
          >
            {paymentState.status === 'creating' ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Creating Payment...
              </>
            ) : (
              <>
                <QrCode className="w-5 h-5 mr-2" />
                Generate Solana Pay QR Code
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {paymentState.qrCodeUrl && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Solana Pay QR Code
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {formData.currency}
                </Badge>
                {paymentState.status === 'pending' && (
                  <Badge variant="secondary" className="animate-pulse">
                    <Clock className="w-3 h-3 mr-1" />
                    Waiting for payment
                  </Badge>
                )}
                {paymentState.status === 'confirmed' && (
                  <Badge className="bg-green-500/10 text-green-600">
                    <CheckCircle2 className="w-3 h-3 mr-1" />
                    Payment confirmed
                  </Badge>
                )}
                {paymentState.status === 'failed' && (
                  <Badge variant="destructive">
                    <AlertCircle className="w-3 h-3 mr-1" />
                    Payment failed
                  </Badge>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-xl border-2 border-dashed border-muted-foreground/20 inline-block">
                <img
                  src={paymentState.qrCodeUrl}
                  alt="Solana Pay QR Code"
                  className="w-80 h-80 max-w-full h-auto"
                />
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <QrCode className="w-4 h-4" />
                    How to pay with Solana Pay
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• Scan this QR code with any Solana wallet (Phantom, Solflare, etc.)</li>
                    <li>• Or copy the payment URL and open in your wallet</li>
                    <li>• Approve the {formData.currency} transaction</li>
                    <li>• Payment will be confirmed instantly on Solana</li>
                  </ul>
                </div>

                {walletAddress && paymentState.feeBreakdown && (
                  <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                    <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                      <Wallet className="w-4 h-4" />
                      Payment Details
                    </h4>
                    <div className="text-sm space-y-1 text-left">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Requested Amount:</span>
                        <span className="font-mono">{paymentState.feeBreakdown.originalAmount.toFixed(4)} {formData.currency}</span>
                      </div>
                      {paymentState.feeBreakdown.afripayFee > 0 && (
                        <div className="flex justify-between text-amber-600">
                          <span className="text-muted-foreground">AfriPay Service Fee:</span>
                          <span className="font-mono">+{paymentState.feeBreakdown.afripayFee.toFixed(4)} {formData.currency}</span>
                        </div>
                      )}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Customer Pays:</span>
                          <span className="font-mono text-blue-600">{paymentState.feeBreakdown.total.toFixed(4)} {formData.currency}</span>
                        </div>
                        <div className="flex justify-between text-green-600 text-sm mt-1">
                          <span>You Receive:</span>
                          <span className="font-mono">{paymentState.feeBreakdown.merchantReceives.toFixed(4)} {formData.currency}</span>
                        </div>
                      </div>
                      <div className="flex justify-between text-xs text-muted-foreground mt-2">
                        <span>Network:</span>
                        <span>Solana {import.meta.env.VITE_SOLANA_NETWORK || 'devnet'}</span>
                      </div>
                      {paymentState.feeBreakdown.afripayFee > 0 ? (
                        <div className="text-xs text-amber-700 mt-2 p-2 bg-amber-50 rounded border border-amber-200">
                          <strong>AfriPay SaaS:</strong> 2.9% + $0.30 processing fee enables secure, instant Solana payments with fraud protection and 24/7 support.
                        </div>
                      ) : (
                        <div className="text-xs text-muted-foreground mt-2">
                          Direct payment - no additional fees
                        </div>
                      )} {walletAddress && !paymentState.feeBreakdown && (
                        <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
                          <h4 className="font-semibold mb-2 flex items-center gap-2 text-primary">
                            <Wallet className="w-4 h-4" />
                            Payment Details
                          </h4>
                          <div className="text-sm space-y-1 text-left">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Amount:</span>
                              <span className="font-mono">{formData.amount} {formData.currency}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Recipient:</span>
                              <span className="font-mono text-xs">
                                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Network:</span>
                              <span>Solana {import.meta.env.VITE_SOLANA_NETWORK || 'devnet'}</span>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          className="flex-1"
                          onClick={() => copyToClipboard(paymentState.paymentUrl || '', 'Payment URL copied!')}
                        >
                          <Copy className="w-4 h-4 mr-2" />
                          Copy URL
                        </Button>
                        <Button variant="outline" className="flex-1" onClick={downloadQRCode}>
                          <Download className="w-4 h-4 mr-2" />
                          Download
                        </Button>
                        {paymentState.signature && (
                          <Button
                            variant="outline"
                            className="flex-1"
                            onClick={() => window.open(`https://explorer.solana.com/tx/${paymentState.signature}?cluster=${import.meta.env.VITE_SOLANA_NETWORK || 'devnet'}`, '_blank')}
                          >
                            <ExternalLink className="w-4 h-4 mr-2" />
                            Explorer
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </CardContent>
        </Card>
      )}

    </div>
  )
};