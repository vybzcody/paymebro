import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  QrCode,
  Download,
  Copy,
  Wallet,
  DollarSign,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Mail,
  User
} from "lucide-react";
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { networkAdapters, CctpNetworkId } from '@/lib/cctp/types';
import { usePaymentProcessor } from '@/hooks/usePaymentProcessor';

interface PaymentForm {
  amount: string;
  description: string;
  selectedWallet: string;
  currency: string;
  customerEmail: string;
  customerName: string;
}

interface WalletOption {
  address: string;
  chainId: CctpNetworkId;
  chainName: string;
  symbol: string;
}

export const MultiChainQRGenerator = () => {
  const { user, wallets } = useMultiChainWeb3Auth();
  const { initiatePayment, isProcessing, error } = usePaymentProcessor();
  
  const [form, setForm] = useState<PaymentForm>({
    amount: '',
    description: '',
    selectedWallet: '',
    currency: 'USDC',
    customerEmail: '',
    customerName: '',
  });

  const [qrResult, setQrResult] = useState<{
    paymentUrl: string;
    qrCodeUrl: string;
    paymentId: string;
  } | null>(null);

  // Get wallet options from connected wallets (Solana only for now)
  const getWalletOptions = (): WalletOption[] => {
    const options: WalletOption[] = [];
    
    networkAdapters.forEach(network => {
      // Only include Solana for QR code generation
      if (network.id === CctpNetworkId.SOLANA) {
        const wallet = wallets[network.id];
        if (wallet?.address) {
          options.push({
            address: wallet.address,
            chainId: network.id,
            chainName: network.name,
            symbol: getSymbol(network.id),
          });
        }
      }
    });

    return options;
  };

  const getSymbol = (chainId: CctpNetworkId): string => {
    const symbols = {
      [CctpNetworkId.SOLANA]: 'SOL',
      [CctpNetworkId.ETHEREUM]: 'ETH',
      [CctpNetworkId.ARBITRUM]: 'ETH',
      [CctpNetworkId.BASE]: 'ETH',
      [CctpNetworkId.POLYGON]: 'MATIC',
      [CctpNetworkId.AVALANCHE]: 'AVAX',
    };
    return symbols[chainId] || 'ETH';
  };

  const getIcon = (chainId: CctpNetworkId): string => {
    const icons = {
      [CctpNetworkId.SOLANA]: '🟣',
      [CctpNetworkId.ETHEREUM]: '🔷',
      [CctpNetworkId.ARBITRUM]: '🔵',
      [CctpNetworkId.BASE]: '🟦',
      [CctpNetworkId.POLYGON]: '🟪',
      [CctpNetworkId.AVALANCHE]: '🔺',
    };
    return icons[chainId] || '⚪';
  };

  // Auto-fill from Web3Auth
  useEffect(() => {
    if (user?.email && !form.customerEmail) {
      setForm(prev => ({ ...prev, customerEmail: user.email! }));
    }
    if (user?.name && !form.customerName) {
      setForm(prev => ({ ...prev, customerName: user.name! }));
    }
  }, [user]);

  const handleWalletSelect = (address: string) => {
    const wallet = getWalletOptions().find(w => w.address === address);
    if (wallet) {
      setForm(prev => ({
        ...prev,
        selectedWallet: address,
        currency: wallet.chainId === CctpNetworkId.SOLANA ? 'SOL' : 'USDC',
      }));
    }
  };

  const handleGenerate = async () => {
    if (!form.amount || parseFloat(form.amount) <= 0) {
      toast.error('Enter valid amount');
      return;
    }
    if (!form.description.trim()) {
      toast.error('Enter description');
      return;
    }
    if (!form.selectedWallet) {
      toast.error('Select wallet');
      return;
    }

    try {
      // Generate proper UUID for user_id
      const userId = user?.sub && user.sub !== 'anonymous' 
        ? user.sub 
        : crypto.randomUUID();

      const result = await initiatePayment({
        userId,
        merchantWallet: form.selectedWallet,
        amount: parseFloat(form.amount),
        currency: form.currency as 'SOL' | 'USDC',
        description: form.description,
        title: form.description,
        customerEmail: form.customerEmail,
      });

      if (result) {
        setQrResult({
          paymentUrl: result.paymentUrl,
          qrCodeUrl: result.qrCodeUrl,
          paymentId: result.paymentId,
        });
        toast.success('QR code generated!');
      }
    } catch (err) {
      toast.error('Failed to generate QR code');
    }
  };

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied`);
  };

  const walletOptions = getWalletOptions();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p>Connect wallet to generate QR codes</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5" />
            Generate Payment QR Code
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Amount & Description */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="number"
                  step="0.01"
                  placeholder="10.00"
                  value={form.amount}
                  onChange={(e) => setForm(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Currency</Label>
              <Select value={form.currency} onValueChange={(value) => setForm(prev => ({ ...prev, currency: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  {form.selectedWallet && getWalletOptions().find(w => w.address === form.selectedWallet)?.chainId === CctpNetworkId.SOLANA && (
                    <SelectItem value="SOL">SOL</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Description *</Label>
            <Textarea
              placeholder="Coffee, consulting, etc."
              value={form.description}
              onChange={(e) => setForm(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Wallet Selection - Key UX */}
          <div>
            <Label>Receive Payment To *</Label>
            <Select value={form.selectedWallet} onValueChange={handleWalletSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select your wallet address" />
              </SelectTrigger>
              <SelectContent>
                {walletOptions.map((wallet) => (
                  <SelectItem key={wallet.chainId} value={wallet.address}>
                    <div className="flex items-center gap-3">
                      <span>{getIcon(wallet.chainId)}</span>
                      <div>
                        <div className="font-medium">{wallet.chainName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{wallet.symbol}</Badge>
                        {wallet.chainId === CctpNetworkId.SOLANA ? (
                          <Badge variant="default" className="text-xs bg-green-100 text-green-800">Ready</Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-orange-600">Soon</Badge>
                        )}
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Customer Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Customer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Optional"
                  value={form.customerName}
                  onChange={(e) => setForm(prev => ({ ...prev, customerName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label>Customer Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  type="email"
                  placeholder="Optional"
                  value={form.customerEmail}
                  onChange={(e) => setForm(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          <Button 
            onClick={handleGenerate}
            disabled={isProcessing}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Generate QR Code
              </>
            )}
          </Button>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* QR Result */}
      {qrResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              QR Code Ready
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <img 
                src={qrResult.qrCodeUrl} 
                alt="Payment QR Code" 
                className="mx-auto border rounded-lg"
                width={200}
                height={200}
              />
            </div>

            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Payment URL:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copy(qrResult.paymentUrl, 'Payment URL')}
                >
                  <Copy className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-gray-500 font-mono break-all">
                {qrResult.paymentUrl}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => copy(qrResult.paymentUrl, 'Payment URL')}
                className="flex-1"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Link
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  const link = document.createElement('a');
                  link.href = qrResult.qrCodeUrl;
                  link.download = 'payment-qr.png';
                  link.click();
                }}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
