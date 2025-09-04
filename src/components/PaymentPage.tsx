import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CCTPPaymentHistory } from "@/components/CCTPPaymentHistory";
import { toast } from "sonner";
import { 
  Copy, 
  ExternalLink, 
  Wallet, 
  QrCode,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Shield,
  Clock
} from "lucide-react";
import { generateEthTransferURL, generateTokenTransferURL, getUSDCAddress } from '@/utils/eip681';

interface PaymentDetails {
  id: string;
  recipient: string;
  amount: string;
  currency: 'ETH' | 'USDC';
  chainId: number;
  chainName: string;
  description: string;
  merchantName?: string;
  expiresAt?: string;
  status: 'pending' | 'completed' | 'expired';
  createdAt: string;
}

export const PaymentPage = () => {
  const { paymentId } = useParams<{ paymentId: string }>();
  const navigate = useNavigate();
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [walletConnected, setWalletConnected] = useState(false);

  useEffect(() => {
    if (paymentId) {
      loadPaymentDetails(paymentId);
    } else {
      setError('Payment ID not found');
      setLoading(false);
    }
  }, [paymentId]);

  const loadPaymentDetails = async (id: string) => {
    try {
      // TODO: Replace with actual API call
      // const response = await fetch(`/api/payments/${id}`);
      // const data = await response.json();
      
      // Mock data for now
      const mockData: PaymentDetails = {
        id,
        recipient: '0x1234567890123456789012345678901234567890',
        amount: '10.50',
        currency: 'USDC',
        chainId: 11155111,
        chainName: 'Ethereum Sepolia',
        description: 'Payment for web development services',
        merchantName: 'AfriPay Merchant',
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      setPaymentDetails(mockData);
    } catch (err) {
      setError('Failed to load payment details');
      console.error('Error loading payment:', err);
    } finally {
      setLoading(false);
    }
  };

  const generatePaymentURL = (details: PaymentDetails): string => {
    try {
      if (details.currency === 'ETH') {
        return generateEthTransferURL({
          recipient: details.recipient,
          chainId: details.chainId,
          amount: details.amount
        });
      } else if (details.currency === 'USDC') {
        const usdcAddress = getUSDCAddress(details.chainId);
        return generateTokenTransferURL({
          tokenContract: usdcAddress,
          recipient: details.recipient,
          chainId: details.chainId,
          amount: details.amount,
          decimals: 6
        });
      }
      throw new Error('Unsupported currency');
    } catch (error) {
      console.error('Error generating payment URL:', error);
      return '';
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  const openInWallet = () => {
    if (!paymentDetails) return;
    
    const paymentUrl = generatePaymentURL(paymentDetails);
    if (paymentUrl) {
      window.open(paymentUrl, '_blank');
      toast.success('Opening in wallet...');
    } else {
      toast.error('Failed to generate payment URL');
    }
  };

  const connectWallet = async () => {
    try {
      // TODO: Implement wallet connection logic
      if (typeof window !== 'undefined' && window.ethereum) {
        await window.ethereum.request({ method: 'eth_requestAccounts' });
        setWalletConnected(true);
        toast.success('Wallet connected successfully!');
      } else {
        toast.error('No wallet detected. Please install MetaMask or another Web3 wallet.');
      }
    } catch (error) {
      toast.error('Failed to connect wallet');
      console.error('Wallet connection error:', error);
    }
  };

  if (loading) {
    return (
      <div className=\"container max-w-2xl mx-auto py-8 px-4\">
        <Card>
          <CardContent className=\"flex items-center justify-center py-8\">
            <Loader2 className=\"w-8 h-8 animate-spin mr-3\" />
            <span>Loading payment details...</span>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || !paymentDetails) {
    return (
      <div className=\"container max-w-2xl mx-auto py-8 px-4\">
        <Card>
          <CardContent className=\"text-center py-8\">
            <AlertCircle className=\"w-12 h-12 mx-auto mb-4 text-destructive\" />
            <h3 className=\"text-lg font-semibold mb-2\">Payment Not Found</h3>
            <p className=\"text-muted-foreground mb-4\">{error || 'This payment link is invalid or has expired.'}</p>
            <Button onClick={() => navigate('/')}>
              <ArrowLeft className=\"w-4 h-4 mr-2\" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isExpired = paymentDetails.expiresAt && new Date() > new Date(paymentDetails.expiresAt);
  const paymentUrl = generatePaymentURL(paymentDetails);

  return (
    <div className=\"container max-w-2xl mx-auto py-8 px-4\">
      {/* Header */}
      <div className=\"mb-6\">
        <Button
          variant=\"ghost\"
          onClick={() => navigate('/')}
          className=\"mb-4\"
        >
          <ArrowLeft className=\"w-4 h-4 mr-2\" />
          Back to Home
        </Button>
        <div className=\"text-center\">
          <h1 className=\"text-2xl font-bold mb-2\">Payment Request</h1>
          <p className=\"text-muted-foreground\">Complete your payment securely</p>
        </div>
      </div>

      {/* Payment Status */}
      <Card className=\"mb-6\">
        <CardContent className=\"pt-6\">
          <div className=\"flex items-center justify-center mb-4\">
            {paymentDetails.status === 'completed' && (
              <Badge variant=\"default\" className=\"bg-green-500\">
                <CheckCircle2 className=\"w-4 h-4 mr-1\" />
                Completed
              </Badge>
            )}
            {paymentDetails.status === 'pending' && !isExpired && (
              <Badge variant=\"outline\" className=\"bg-blue-50\">
                <Clock className=\"w-4 h-4 mr-1\" />
                Pending Payment
              </Badge>
            )}
            {(paymentDetails.status === 'expired' || isExpired) && (
              <Badge variant=\"destructive\">
                <AlertCircle className=\"w-4 h-4 mr-1\" />
                Expired
              </Badge>
            )}
          </div>
          
          {paymentDetails.expiresAt && !isExpired && (
            <div className=\"text-center text-sm text-muted-foreground\">
              Expires: {new Date(paymentDetails.expiresAt).toLocaleString()}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Details */}
      <Card className=\"mb-6\">
        <CardHeader>
          <CardTitle className=\"flex items-center gap-2\">
            <Wallet className=\"w-5 h-5\" />
            Payment Details
          </CardTitle>
        </CardHeader>
        <CardContent className=\"space-y-4\">
          {/* Amount */}
          <div className=\"text-center py-4 bg-primary/5 rounded-lg border border-primary/20\">
            <div className=\"text-3xl font-bold\">{paymentDetails.amount} {paymentDetails.currency}</div>
            <div className=\"text-sm text-muted-foreground mt-1\">on {paymentDetails.chainName}</div>
          </div>

          {/* Details Grid */}
          <div className=\"space-y-3\">
            {paymentDetails.merchantName && (
              <div className=\"flex justify-between\">
                <span className=\"text-muted-foreground\">Merchant:</span>
                <span className=\"font-medium\">{paymentDetails.merchantName}</span>
              </div>
            )}
            
            <div className=\"flex justify-between\">
              <span className=\"text-muted-foreground\">Description:</span>
              <span className=\"font-medium text-right max-w-xs truncate\">{paymentDetails.description}</span>
            </div>
            
            <div className=\"flex justify-between\">
              <span className=\"text-muted-foreground\">Network:</span>
              <span className=\"font-medium\">{paymentDetails.chainName}</span>
            </div>
            
            <div className=\"flex justify-between items-center\">
              <span className=\"text-muted-foreground\">Recipient:</span>
              <div className=\"flex items-center gap-2\">
                <span className=\"font-mono text-sm\">{paymentDetails.recipient.slice(0, 6)}...{paymentDetails.recipient.slice(-4)}</span>
                <Button
                  variant=\"ghost\"
                  size=\"sm\"
                  onClick={() => copyToClipboard(paymentDetails.recipient, 'Recipient address')}
                >
                  <Copy className=\"w-3 h-3\" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Actions */}
      {!isExpired && paymentDetails.status === 'pending' && (
        <Card className=\"mb-6\">
          <CardHeader>
            <CardTitle className=\"flex items-center gap-2\">
              <Shield className=\"w-5 h-5\" />
              Complete Payment
            </CardTitle>
          </CardHeader>
          <CardContent className=\"space-y-4\">
            <div className=\"text-sm text-muted-foreground mb-4\">
              Choose how you'd like to complete this payment:
            </div>

            {/* Wallet Connection */}
            {!walletConnected && (
              <Button onClick={connectWallet} className=\"w-full\" size=\"lg\">
                <Wallet className=\"w-5 h-5 mr-2\" />
                Connect Wallet
              </Button>
            )}

            {/* Payment Options */}
            <div className=\"space-y-3\">
              <Button 
                onClick={openInWallet} 
                className=\"w-full\" 
                size=\"lg\"
                variant={walletConnected ? \"default\" : \"outline\"}
              >
                <ExternalLink className=\"w-5 h-5 mr-2\" />
                Open in Wallet
              </Button>

              <Separator className=\"my-4\" />

              {/* Manual Copy Options */}
              <div className=\"space-y-2\">
                <p className=\"text-sm font-medium\">Or copy the details manually:</p>
                
                <div className=\"grid gap-2\">
                  <Button
                    variant=\"outline\"
                    onClick={() => copyToClipboard(paymentDetails.recipient, 'Recipient address')}
                    className=\"justify-start\"
                  >
                    <Copy className=\"w-4 h-4 mr-2\" />
                    Copy Recipient Address
                  </Button>
                  
                  <Button
                    variant=\"outline\"
                    onClick={() => copyToClipboard(paymentDetails.amount, 'Amount')}
                    className=\"justify-start\"
                  >
                    <Copy className=\"w-4 h-4 mr-2\" />
                    Copy Amount ({paymentDetails.amount} {paymentDetails.currency})
                  </Button>

                  {paymentUrl && (
                    <Button
                      variant=\"outline\"
                      onClick={() => copyToClipboard(paymentUrl, 'Payment URL')}
                      className=\"justify-start\"
                    >
                      <Copy className=\"w-4 h-4 mr-2\" />
                      Copy Payment URL
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CCTP Cross-Chain Transfer History */}
      <CCTPPaymentHistory paymentId={paymentId} />

      {/* Security Notice */}
      <Card>
        <CardContent className=\"pt-6\">
          <div className=\"flex items-start gap-3\">
            <Shield className=\"w-5 h-5 mt-0.5 text-green-600\" />
            <div>
              <h4 className=\"font-medium mb-1\">Secure Payment</h4>
              <p className=\"text-sm text-muted-foreground\">
                This payment is processed directly through the blockchain. Always verify the recipient address and amount before confirming the transaction in your wallet.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
