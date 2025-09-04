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

interface PaymentFormData {
  amount: string;
  description: string;
  selectedWalletAddress: string;
  selectedChain: CctpNetworkId | '';
  currency: 'USDC' | 'SOL' | 'ETH' | 'MATIC' | 'AVAX';
  customerEmail: string;
  customerName: string;
}

interface WalletOption {
  address: string;
  chainId: CctpNetworkId;
  chainName: string;
  nativeSymbol: string;
  displayName: string;
}

export const MultiChainQRGenerator = () => {
  const { user, wallets } = useMultiChainWeb3Auth();
  const { initiatePayment, isProcessing, error } = usePaymentProcessor();
  
  const [formData, setFormData] = useState<PaymentFormData>({
    amount: '',
    description: '',
    selectedWalletAddress: '',
    selectedChain: '',
    currency: 'USDC',
    customerEmail: user?.email || '',
    customerName: user?.name || '',
  });

  const [qrResult, setQrResult] = useState<{
    paymentUrl: string;
    qrCodeUrl: string;
    paymentId: string;
  } | null>(null);

  // Get available wallet addresses from Web3Auth
  const getWalletOptions = (): WalletOption[] => {
    const options: WalletOption[] = [];
    
    networkAdapters.forEach(network => {
      const wallet = wallets[network.id];
      if (wallet?.address) {
        const nativeSymbol = getNativeSymbol(network.id);
        options.push({
          address: wallet.address,
          chainId: network.id,
          chainName: network.name,
          nativeSymbol,
          displayName: `${network.name} (${nativeSymbol})`,
        });
      }
    });

    return options;
  };

  const getNativeSymbol = (chainId: CctpNetworkId): string => {
    switch (chainId) {
      case CctpNetworkId.SOLANA: return 'SOL';
      case CctpNetworkId.ETHEREUM:
      case CctpNetworkId.ARBITRUM:
      case CctpNetworkId.BASE: return 'ETH';
      case CctpNetworkId.POLYGON: return 'MATIC';
      case CctpNetworkId.AVALANCHE: return 'AVAX';
      default: return 'ETH';
    }
  };

  const getChainIcon = (chainId: CctpNetworkId): string => {
    const iconMap = {
      [CctpNetworkId.SOLANA]: '🟣',
      [CctpNetworkId.ETHEREUM]: '🔷',
      [CctpNetworkId.ARBITRUM]: '🔵',
      [CctpNetworkId.BASE]: '🟦',
      [CctpNetworkId.POLYGON]: '🟪',
      [CctpNetworkId.AVALANCHE]: '🔺',
    };
    return iconMap[chainId] || '⚪';
  };

  // Auto-fill email from Web3Auth if available
  useEffect(() => {
    if (user?.email && !formData.customerEmail) {
      setFormData(prev => ({ ...prev, customerEmail: user.email! }));
    }
    if (user?.name && !formData.customerName) {
      setFormData(prev => ({ ...prev, customerName: user.name! }));
    }
  }, [user, formData.customerEmail, formData.customerName]);

  // Handle wallet selection - automatically sets chain and currency
  const handleWalletSelection = (address: string) => {
    const walletOption = getWalletOptions().find(w => w.address === address);
    if (walletOption) {
      setFormData(prev => ({
        ...prev,
        selectedWalletAddress: address,
        selectedChain: walletOption.chainId,
        currency: walletOption.chainId === CctpNetworkId.SOLANA ? 'SOL' : 'USDC',
      }));
    }
  };

  const validateForm = (): boolean => {
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      toast.error('Please enter a valid amount');
      return false;
    }
    if (!formData.description.trim()) {
      toast.error('Please enter a payment description');
      return false;
    }
    if (!formData.selectedWalletAddress) {
      toast.error('Please select a wallet to receive payment');
      return false;
    }
    return true;
  };

  const handleGenerateQR = async () => {
    if (!validateForm()) return;

    try {
      const result = await initiatePayment({
        userId: user?.sub || 'anonymous',
        merchantWallet: formData.selectedWalletAddress,
        amount: parseFloat(formData.amount),
        currency: formData.currency as 'SOL' | 'USDC',
        description: formData.description,
        title: `Payment - ${formData.description}`,
        customerEmail: formData.customerEmail,
      });

      if (result) {
        setQrResult({
          paymentUrl: result.paymentUrl,
          qrCodeUrl: result.qrCodeUrl,
          paymentId: result.paymentId,
        });
        toast.success('Payment QR code generated successfully!');
      }
    } catch (err) {
      toast.error('Failed to generate payment QR code');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const walletOptions = getWalletOptions();

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <p className="text-gray-600">Please connect your wallet to generate payment QR codes</p>
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
        <CardContent className="space-y-6">
          {/* Payment Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0.01"
                  placeholder="10.00"
                  value={formData.amount}
                  onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select
                value={formData.currency}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, currency: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                  {formData.selectedChain === CctpNetworkId.SOLANA && (
                    <SelectItem value="SOL">SOL (Native)</SelectItem>
                  )}
                  {formData.selectedChain !== CctpNetworkId.SOLANA && formData.selectedChain && (
                    <SelectItem value={getNativeSymbol(formData.selectedChain)}>
                      {getNativeSymbol(formData.selectedChain)} (Native)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Payment Description *</Label>
            <Textarea
              id="description"
              placeholder="Coffee, consulting, product purchase, etc."
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          {/* Wallet Selection - The Key UX Improvement */}
          <div className="space-y-2">
            <Label>Receive Payment To *</Label>
            <Select
              value={formData.selectedWalletAddress}
              onValueChange={handleWalletSelection}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your wallet address to receive payment" />
              </SelectTrigger>
              <SelectContent>
                {walletOptions.map((wallet) => (
                  <SelectItem key={wallet.address} value={wallet.address}>
                    <div className="flex items-center gap-3 w-full">
                      <span className="text-lg">{getChainIcon(wallet.chainId)}</span>
                      <div className="flex-1">
                        <div className="font-medium">{wallet.chainName}</div>
                        <div className="text-xs text-gray-500 font-mono">
                          {wallet.address.slice(0, 8)}...{wallet.address.slice(-6)}
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {wallet.nativeSymbol}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {walletOptions.length === 0 && (
              <p className="text-sm text-amber-600">
                No wallet addresses available. Please connect to supported networks.
              </p>
            )}
          </div>

          {/* Optional Customer Info - Pre-filled from Web3Auth */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="customerName"
                  placeholder="Optional"
                  value={formData.customerName}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="customerEmail"
                  type="email"
                  placeholder="Optional - for receipt"
                  value={formData.customerEmail}
                  onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
                  className="pl-10"
                />
              </div>
            </div>
          </div>

          {/* Generate Button */}
          <Button 
            onClick={handleGenerateQR}
            disabled={isProcessing || !formData.selectedWalletAddress}
            className="w-full"
            size="lg"
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating QR Code...
              </>
            ) : (
              <>
                <QrCode className="w-4 h-4 mr-2" />
                Generate Payment QR Code
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

      {/* QR Code Result */}
      {qrResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle2 className="w-5 h-5" />
              Payment QR Code Ready
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

            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="text-sm font-medium">Payment URL:</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => copyToClipboard(qrResult.paymentUrl, 'Payment URL')}
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
                onClick={() => copyToClipboard(qrResult.paymentUrl, 'Payment URL')}
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
                  link.download = 'payment-qr-code.png';
                  link.click();
                }}
                className="flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                Download QR
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

    if (!user) {
      toast.error('Please connect your wallet');
      return false;
    }

    // Check if we have the appropriate wallet for the selected network
    if (selectedNetwork === 'solana' && !solanaWallet?.address) {
      toast.error('Solana wallet not connected');
      return false;
    }

    if (selectedNetwork === 'evm' && !ethereumWallet?.address) {
      toast.error('EVM wallet not connected');
      return false;
    }

    return true;
  };

  const generateQRCode = async () => {
    if (!validateForm()) return;

    setQrState({ status: 'generating', qrCodeUrl: '', paymentUrl: '' });

    try {
      const networkAdapter = findNetworkAdapter(formData.selectedChain);
      if (!networkAdapter) {
        throw new Error('Unsupported network selected');
      }

      // Get appropriate wallet address
      const solanaWallet = getSolanaWallet();
      const ethereumWallet = getEthereumWallet();
      const walletAddress = selectedNetwork === 'solana'
        ? solanaWallet?.address || publicKey?.toString()
        : ethereumWallet?.address;

      if (!walletAddress) {
        throw new Error(`${selectedNetwork === 'solana' ? 'Solana' : 'Ethereum'} wallet not connected`);
      }

      // Create payment request based on network type
      let paymentUrl: string;
      let qrCodeUrl: string;

      if (selectedNetwork === 'solana') {
        // Generate Solana Pay URL
        const solanaPay = await generateSolanaPayURLInternal({
          recipient: walletAddress,
          amount: parseFloat(formData.amount),
          currency: formData.currency,
          label: `${user?.name || 'AfriPay'} - ${formData.description}`,
          message: formData.description,
          memo: formData.memo,
        });

        paymentUrl = solanaPay.url;
        qrCodeUrl = solanaPay.qrCode;
      } else {
        // Generate EVM payment URL (could be a custom payment gateway URL)
        const evmPayment = await generateEVMPaymentURL({
          chainId: formData.selectedChain as number,
          recipient: walletAddress,
          amount: formData.amount,
          currency: formData.currency,
          description: formData.description,
        });

        paymentUrl = evmPayment.url;
        qrCodeUrl = evmPayment.qrCode;
      }

      // Store payment request in database
      const paymentData = await storePaymentRequest({
        walletAddress,
        amount: parseFloat(formData.amount),
        currency: formData.currency,
        description: formData.description,
        chainName: getChainName(formData.selectedChain),
        chainId: formData.selectedChain,
        paymentUrl,
        qrCodeUrl,
        customerEmail: formData.customerEmail.trim() || undefined,
        customerName: formData.customerName.trim() || undefined,
        merchantEmail: formData.merchantEmail.trim() || undefined,
        memo: formData.memo.trim() || undefined
      });

      setQrState({
        status: 'completed',
        qrCodeUrl,
        paymentUrl,
        chainInfo: networkAdapter,
        paymentId: paymentData?.id
      });

      // QR code created successfully - NO EMAIL SENT
      // Email will be sent automatically when payment is received
      // await sendEmailNotifications({
      //   qrCodeUrl,
      //   paymentUrl,
      //   chainName: getChainName(formData.selectedChain)
      // });

      toast.success('QR Code generated successfully!');

    } catch (error: any) {
      setQrState({
        status: 'error',
        qrCodeUrl: '',
        paymentUrl: '',
        error: error.message
      });
      toast.error(error.message || 'Failed to generate QR code');
    }
  };

  // Generate proper Solana Pay URL using utility
  const generateSolanaPayURLInternal = async (params: any) => {
    try {
      const network = IS_TESTNET ? 'devnet' : 'mainnet';

      // Generate Solana Pay URL using the utility
      const solanaPayUrl = generateSolanaPayURL({
        recipient: params.recipient,
        amount: params.amount,
        currency: params.currency as 'SOL' | 'USDC',
        label: params.label,
        message: params.message,
        memo: params.memo
      }, network);

      // Validate the generated URL
      const validation = validateSolanaPayURL(solanaPayUrl);
      if (!validation.isValid) {
        console.warn('Solana Pay URL validation warnings:', validation.errors);
        // Continue anyway as some warnings might not be critical
      }

      // Generate QR code using the utility
      const qrCodeUrl = generateSolanaPayQRCode(solanaPayUrl, {
        size: 400,
        margin: 10,
        errorCorrection: 'M'
      });

      console.log('Generated Solana Pay URL:', solanaPayUrl);
      console.log('Validation result:', validation);

      return { url: solanaPayUrl, qrCode: qrCodeUrl };
    } catch (error) {
      console.error('Error generating Solana Pay URL:', error);
      throw new Error(`Failed to generate Solana Pay URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const generateEVMPaymentURL = async (params: any) => {
    let paymentUrl: string;

    try {
      if (params.currency === 'ETH') {
        // Generate EIP-681 compliant URL for native ETH transfers
        paymentUrl = generateEthTransferURL({
          recipient: params.recipient,
          chainId: params.chainId,
          amount: params.amount
        });
      } else if (params.currency === 'USDC') {
        // Generate EIP-681 compliant URL for USDC token transfers
        const usdcAddress = getUSDCAddress(params.chainId);
        paymentUrl = generateTokenTransferURL({
          tokenContract: usdcAddress,
          recipient: params.recipient,
          chainId: params.chainId,
          amount: params.amount,
          decimals: 6 // USDC has 6 decimals
        });
      } else {
        throw new Error(`Unsupported currency: ${params.currency}`);
      }

      // Validate the generated URL to ensure EIP-681 compliance
      const validation = validateEIP681URL(paymentUrl);
      if (!validation.isValid) {
        console.warn('Generated URL validation warnings:', validation.errors);
        // Continue anyway as some warnings might not be critical
      }

      // Create QR code with optimized settings for mobile wallet detection
      // Using error correction level M (15%) for better reliability
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=400x400&format=png&margin=10&ecc=M&data=${encodeURIComponent(paymentUrl)}`;

      console.log('Generated EIP-681 compliant payment URL:', paymentUrl);
      console.log('Validation result:', validation);

      return { url: paymentUrl, qrCode: qrCodeUrl };
    } catch (error) {
      console.error('Error generating EVM payment URL:', error);
      throw new Error(`Failed to generate EIP-681 compliant URL: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  // Helper function to get USDC contract address for a given chain
  const getUSDCAddressForChain = (chainId: number): string => {
    // Import the USDC addresses from chains config
    const usdcAddresses: Record<number, string> = {
      // Testnet USDC addresses
      11155111: "0x1c7d4b196cb0c7b01d743fbc6116a902379c7238", // ETH Sepolia
      43113: "0x5425890298aed601595a70AB815c96711a31Bc65", // AVAX Fuji
      84532: "0x036CbD53842c5426634e7929541eC2318f3dCF7e", // Base Sepolia
      80002: "0x41e94eb019c0762f9bfcf9fb1e58725bfb0e7582", // Polygon Amoy

      // Mainnet USDC addresses
      1: "0xA0b86a33E6441b8435b662f98137B4B1c5b0c8c1", // Ethereum
      43114: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // Avalanche
      42161: "0xaf88d065e77c8cC2239327C5EDb3A432268e5831", // Arbitrum
      8453: "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913", // Base
      137: "0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359", // Polygon
    };

    const address = usdcAddresses[chainId];
    if (!address) {
      throw new Error(`USDC contract address not found for chain ID: ${chainId}`);
    }
    return address;
  };

  /**
   * Send email notifications after QR code generation
   */
  const sendEmailNotifications = async (data: {
    qrCodeUrl: string;
    paymentUrl: string;
    chainName: string;
  }) => {
    const emailPromises: Promise<boolean>[] = [];

    // Send notification to merchant if email is provided
    if (formData.merchantEmail.trim()) {
      console.log('Sending merchant notification to:', formData.merchantEmail);
      const merchantPromise = EmailService.sendPaymentNotification({
        merchantEmail: formData.merchantEmail.trim(),
        customerEmail: formData.customerEmail.trim() || undefined,
        customerName: formData.customerName.trim() || undefined,
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        chainName: data.chainName,
        paymentUrl: data.paymentUrl,
        qrCodeUrl: data.qrCodeUrl,
        memo: formData.memo.trim() || undefined,
      });
      emailPromises.push(merchantPromise);
    }

    // Send invoice to customer if email is provided
    if (formData.customerEmail.trim()) {
      console.log('Sending customer invoice to:', formData.customerEmail);
      const invoiceId = EmailService.generateInvoiceId();
      const customerPromise = EmailService.sendPaymentInvoice({
        customerEmail: formData.customerEmail.trim(),
        customerName: formData.customerName.trim() || undefined,
        merchantName: user?.name || 'PayMeBro Merchant',
        amount: formData.amount,
        currency: formData.currency,
        description: formData.description,
        chainName: data.chainName,
        paymentUrl: data.paymentUrl,
        qrCodeUrl: data.qrCodeUrl,
        invoiceId,
      });
      emailPromises.push(customerPromise);
    }

    // Wait for all emails to be sent
    if (emailPromises.length > 0) {
      try {
        const results = await Promise.all(emailPromises);
        const successfulEmails = results.filter(result => result).length;

        if (successfulEmails > 0) {
          toast.success(`Email notifications sent successfully! (${successfulEmails}/${emailPromises.length})`);
        } else {
          toast.error('Failed to send email notifications');
        }
      } catch (error) {
        console.error('Error sending email notifications:', error);
        toast.error('Error sending email notifications');
      }
    }
  };

  const copyToClipboard = (text: string, message: string) => {
    navigator.clipboard.writeText(text);
    toast.success(message);
  };

  const downloadQRCode = () => {
    if (qrState.qrCodeUrl) {
      const link = document.createElement('a');
      link.href = qrState.qrCodeUrl;
      link.download = `afripay-${selectedNetwork}-${formData.amount}-${formData.currency.toLowerCase()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('QR Code downloaded');
    }
  };

  /**
   * Store payment request in Supabase database
   */
  const storePaymentRequest = async (paymentData: any) => {
    try {
      console.log('Storing payment request in database:', paymentData);

      // Extract reference from payment URL for monitoring
      const reference = extractReferenceFromUrl(paymentData.paymentUrl);

      const paymentRecord = {
        user_id: user?.email || 'anonymous', // Use email as user ID for now
        reference: reference,
        recipient_wallet: paymentData.walletAddress,
        amount: paymentData.amount,
        currency: paymentData.currency,
        chain_name: paymentData.chainName,
        chain_id: paymentData.chainId.toString(),
        description: paymentData.description,
        payment_url: paymentData.paymentUrl,
        qr_code_url: paymentData.qrCodeUrl,
        customer_email: paymentData.customerEmail,
        customer_name: paymentData.customerName,
        merchant_email: paymentData.merchantEmail,
        memo: paymentData.memo,
        status: 'pending',
        is_active: true,
        expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // 24 hours from now
      };

      // Try to store via backend API first
      const response = await fetch('https://paymebro-backend-production.up.railway.app/api/qr/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentRecord),
      });

      if (response.ok) {
        const result = await response.json();
        console.log('Payment request stored successfully:', result.id);
        return { id: result.id, reference };
      } else {
        console.warn('Failed to store via API, will rely on transaction monitoring');
        return { reference };
      }
    } catch (error) {
      console.error('Error storing payment request:', error);
      // Don't fail the QR generation if storage fails
      return null;
    }
  };

  /**
   * Extract reference from payment URL
   */
  const extractReferenceFromUrl = (paymentUrl: string): string => {
    try {
      if (paymentUrl.startsWith('solana:')) {
        // For Solana Pay URLs, use the recipient address as reference
        const recipient = paymentUrl.split('?')[0].replace('solana:', '');
        return recipient;
      } else if (paymentUrl.startsWith('ethereum:')) {
        // For EIP-681 URLs, extract the address
        const parts = paymentUrl.replace('ethereum:', '').split('@')[0];
        return parts;
      }
      // Fallback: generate a reference
      return `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    } catch (error) {
      console.error('Error extracting reference:', error);
      return `ref_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }
  };

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      customerEmail: '',
      customerName: '',
      memo: '',
      selectedChain: '',
      currency: 'USDC',
      merchantEmail: ''
    });
    setQrState({ status: 'idle', qrCodeUrl: '', paymentUrl: '' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Sparkles className="h-6 w-6 text-primary" />
          Multi-Chain Payment QR Generator
        </h2>
        <p className="text-muted-foreground">
          Create payment QR codes for {IS_TESTNET ? 'testnet' : 'mainnet'} networks
        </p>
        <Badge variant="outline" className="bg-primary/10">
          {IS_TESTNET ? 'Testnet Mode' : 'Mainnet Mode'}
        </Badge>
      </div>

      <Tabs value={selectedNetwork} onValueChange={(value: 'solana' | 'evm') => handleNetworkSwitch(value)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="solana" className="flex items-center gap-2">
            <img src="/chains/solana.svg" alt="Solana" className="w-4 h-4" />
            Solana Network
          </TabsTrigger>
          <TabsTrigger value="evm" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            EVM Networks
          </TabsTrigger>
        </TabsList>

        <TabsContent value="solana" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <img src="/chains/solana.svg" alt="Solana" className="w-5 h-5" />
                Solana Payment Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chain Selection */}
              <div className="space-y-2">
                <Label>Network</Label>
                <Select
                  value={formData.selectedChain as string}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    selectedChain: value as CctpNetworkId
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select Solana network" />
                  </SelectTrigger>
                  <SelectContent>
                    {solanaNetworks.map((network) => (
                      <SelectItem key={network.id} value={network.id}>
                        <div className="flex items-center gap-2">
                          <img src={getChainIcon(network.id)} alt="" className="w-4 h-4" />
                          <span>{network.name}</span>
                          <Badge variant="secondary" className="text-xs">
                            {getNativeSymbol(network.id)}
                          </Badge>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount and Currency for Solana */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="sol-amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="sol-amount"
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      placeholder="0.000000"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sol-currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: 'USDC' | 'SOL') => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                      <SelectItem value="SOL">SOL (Native Token)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* CCTP Cross-Chain Option */}
              {formData.currency === 'USDC' && (
                <div className="space-y-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="enable-cctp"
                      checked={enableCCTP}
                      onChange={(e) => setEnableCCTP(e.target.checked)}
                      className="rounded"
                    />
                    <Label htmlFor="enable-cctp" className="text-sm font-medium">
                      🌉 Enable Cross-Chain CCTP (Accept payments from any chain)
                    </Label>
                  </div>

                  {enableCCTP && (
                    <div className="space-y-2">
                      <Label htmlFor="cctp-destination">Receive USDC on:</Label>
                      <Select
                        value={cctpDestinationChain}
                        onValueChange={setCctpDestinationChain}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {cctpChains.map((chain) => (
                            <SelectItem key={chain.id} value={chain.id}>
                              {chain.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-blue-600">
                        Customers can pay with USDC from Ethereum, Avalanche, Arbitrum, Base, or Polygon,
                        and you'll receive it on {cctpChains.find(c => c.id === cctpDestinationChain)?.name}.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="evm" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                EVM Chain Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Chain Selection */}
              <div className="space-y-2">
                <Label>Blockchain Network</Label>
                <Select
                  value={formData.selectedChain as string}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    selectedChain: parseInt(value) as SupportedChainId,
                    currency: 'USDC' // Reset currency when changing chains
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select EVM network" />
                  </SelectTrigger>
                  <SelectContent>
                    {evmChains.map((chainId) => (
                      <SelectItem key={chainId} value={chainId.toString()}>
                        <div className="flex items-center gap-2">
                          <img src={getChainIcon(chainId)} alt="" className="w-4 h-4" />
                          {getChainName(chainId)}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Amount and Currency for EVM */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="evm-amount">Amount *</Label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                    <Input
                      id="evm-amount"
                      type="number"
                      step="0.000001"
                      min="0.000001"
                      placeholder="0.000000"
                      value={formData.amount}
                      onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
                      className="pl-10"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="evm-currency">Currency *</Label>
                  <Select
                    value={formData.currency}
                    onValueChange={(value: 'USDC' | 'ETH') => setFormData(prev => ({ ...prev, currency: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select currency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC (Stablecoin)</SelectItem>
                      <SelectItem value="ETH">ETH (Native Token)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Common Form Fields */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              placeholder="What is this payment for?"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>

          {/* Merchant Email */}
          <div className="space-y-2">
            <Label htmlFor="merchantEmail">Your Email (For Notifications)</Label>
            <Input
              id="merchantEmail"
              type="email"
              placeholder="your@email.com"
              value={formData.merchantEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, merchantEmail: e.target.value }))}
            />
            <p className="text-xs text-muted-foreground">You'll receive a notification when the payment request is created</p>
          </div>

          {/* Customer Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Customer Name (Optional)</Label>
              <Input
                id="customerName"
                placeholder="Customer name"
                value={formData.customerName}
                onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="customerEmail">Customer Email (Optional)</Label>
              <Input
                id="customerEmail"
                type="email"
                placeholder="customer@example.com"
                value={formData.customerEmail}
                onChange={(e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value }))}
              />
              <p className="text-xs text-muted-foreground">Customer will receive an invoice if email is provided</p>
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
          {!user ? (
            <div className="text-center p-4 bg-muted/30 rounded-lg">
              <Wallet className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-3">
                Connect your wallet to generate payment QR codes
              </p>
            </div>
          ) : (
            <div className="text-center p-4 bg-primary/5 rounded-lg border border-primary/20">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Wallet className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {selectedNetwork === 'solana' ? 'Solana' : 'EVM'} Wallet Connected
                </span>
              </div>
              <p className="text-xs text-muted-foreground font-mono">
                {(() => {
                  const solanaWallet = getSolanaWallet();
                  const ethereumWallet = getEthereumWallet();
                  const address = selectedNetwork === 'solana'
                    ? solanaWallet?.address || publicKey?.toString()
                    : ethereumWallet?.address;
                  return address ? address.slice(0, 8) + '...' + address.slice(-8) : 'No address';
                })()}
              </p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              onClick={generateQRCode}
              className="flex-1"
              size="lg"
              disabled={qrState.status === 'generating' || !user}
            >
              {qrState.status === 'generating' ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <QrCode className="w-5 h-5 mr-2" />
                  Generate QR Code
                </>
              )}
            </Button>

            {qrState.status !== 'idle' && (
              <Button onClick={resetForm} variant="outline" size="lg">
                Reset
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* QR Code Display */}
      {qrState.status === 'completed' && qrState.qrCodeUrl && (
        <Card className="border-0 shadow-lg bg-gradient-to-br from-background to-muted/20">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <QrCode className="w-5 h-5" />
                Payment QR Code
              </CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-primary/10 text-primary">
                  {formData.currency}
                </Badge>
                <Badge variant="secondary">
                  {getChainName(formData.selectedChain)}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center space-y-4">
              <div className="p-4 bg-white rounded-xl border-2 border-dashed border-muted-foreground/20 inline-block">
                <img
                  src={qrState.qrCodeUrl}
                  alt="Payment QR Code"
                  className="w-80 h-80 max-w-full h-auto"
                />
              </div>

              <div className="max-w-md mx-auto space-y-4">
                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-semibold mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    Payment Instructions
                  </h4>
                  <ul className="text-sm text-muted-foreground space-y-1 text-left">
                    <li>• Scan this QR code with a compatible wallet</li>
                    <li>• Or copy the payment URL below</li>
                    <li>• Approve the {formData.currency} transaction</li>
                    <li>• Payment will be processed on {getChainName(formData.selectedChain)}</li>
                  </ul>
                </div>

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
                      <span className="text-muted-foreground">Network:</span>
                      <span>{getChainName(formData.selectedChain)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Environment:</span>
                      <span>{IS_TESTNET ? 'Testnet' : 'Mainnet'}</span>
                    </div>
                    {formData.description && (
                      <div className="pt-2 mt-2 border-t">
                        <span className="text-muted-foreground">Description:</span>
                        <p className="text-sm mt-1">{formData.description}</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    className="flex-1"
                    onClick={() => copyToClipboard(qrState.paymentUrl, 'Payment URL copied!')}
                  >
                    <Copy className="w-4 h-4 mr-2" />
                    Copy URL
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={downloadQRCode}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error State */}
      {qrState.status === 'error' && (
        <Card className="border-destructive/50">
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <AlertCircle className="w-12 h-12 mx-auto text-destructive" />
              <div>
                <h3 className="font-semibold text-destructive">Failed to Generate QR Code</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {qrState.error || 'An unexpected error occurred'}
                </p>
              </div>
              <Button onClick={() => setQrState({ status: 'idle', qrCodeUrl: '', paymentUrl: '' })}>
                Try Again
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
