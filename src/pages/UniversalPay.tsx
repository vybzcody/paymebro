import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, CheckCircle, ExternalLink } from 'lucide-react';
import { UniversalPaymentGateway } from '@/components/UniversalPaymentGateway';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';
import { CctpNetworkAdapterId } from '@/lib/cctp/networks';
import { toast } from 'sonner';

interface PaymentLinkData {
  id: string;
  title: string;
  description: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantWallet: string;
  preferredChain: CctpNetworkAdapterId;
  acceptedChains: CctpNetworkAdapterId[];
  created_at: string;
}

const UniversalPay: React.FC = () => {
  const { reference } = useParams<{ reference: string }>();
  const navigate = useNavigate();
  const { user, login, isLoading: authLoading } = useMultiChainWeb3Auth();
  
  const [paymentData, setPaymentData] = useState<PaymentLinkData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const [paymentTxHash, setPaymentTxHash] = useState<string>('');

  // Fetch payment link data
  useEffect(() => {
    const fetchPaymentData = async () => {
      if (!reference) {
        setError('Invalid payment link');
        setLoading(false);
        return;
      }

      try {
        const paymentLinkData = await getPaymentLinkByReference(reference);
        setPaymentData(paymentLinkData);
      } catch (err: any) {
        console.error('Error fetching payment data:', err);
        setError('Failed to load payment information');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentData();
  }, [reference]);

  const handlePaymentComplete = (txHash: string, sourceChain: CctpNetworkAdapterId) => {
    setPaymentComplete(true);
    setPaymentTxHash(txHash);
    toast.success('Payment completed successfully!');
    
    // Track payment completion
    console.log('Payment completed:', {
      reference,
      txHash,
      sourceChain,
      amount: paymentData?.amount,
      timestamp: new Date().toISOString()
    });
  };

  const handlePaymentError = (errorMessage: string) => {
    toast.error(`Payment failed: ${errorMessage}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading payment information...</p>
        </div>
      </div>
    );
  }

  if (error || !paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Payment Error</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">{error || 'Payment link not found'}</p>
            <Button onClick={() => navigate('/')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Go Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (paymentComplete) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto mb-4 w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-green-600">Payment Successful!</CardTitle>
            <CardDescription>
              Your payment to {paymentData.merchantName} has been completed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Amount</span>
                <span className="font-medium">{paymentData.amount} {paymentData.currency}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Merchant</span>
                <span className="font-medium">{paymentData.merchantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Description</span>
                <span className="font-medium">{paymentData.description}</span>
              </div>
              {paymentTxHash && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Transaction</span>
                  <Button variant="ghost" size="sm" asChild>
                    <a href={`https://solscan.io/tx/${paymentTxHash}`} target="_blank" rel="noopener noreferrer">
                      View <ExternalLink className="h-3 w-3 ml-1" />
                    </a>
                  </Button>
                </div>
              )}
            </div>
            
            <div className="flex flex-col space-y-2">
              <Button onClick={() => navigate('/')} className="w-full">
                Continue
              </Button>
              <Button 
                onClick={() => {
                  setPaymentComplete(false);
                  setPaymentTxHash('');
                }} 
                variant="outline" 
                className="w-full"
              >
                Make Another Payment
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Universal Payment Gateway
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Pay with USDC from any supported blockchain
          </p>
          <div className="flex justify-center mt-4">
            <Badge variant="secondary" className="text-xs">
              Powered by CCTP V2 • Cross-Chain USDC Transfers
            </Badge>
          </div>
        </div>

        {/* Connection Status */}
        {!user && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center space-y-4">
                <p className="text-muted-foreground">Connect your wallet to continue with payment</p>
                <Button onClick={login} disabled={authLoading}>
                  {authLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Connecting...
                    </>
                  ) : (
                    'Connect Wallet'
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Payment Gateway */}
        {user && (
          <UniversalPaymentGateway
            paymentRequest={{
              id: paymentData.id,
              merchantName: paymentData.merchantName,
              merchantWallet: paymentData.merchantWallet,
              preferredChain: paymentData.preferredChain,
              amount: paymentData.amount,
              currency: paymentData.currency,
              description: paymentData.description,
              acceptedChains: paymentData.acceptedChains
            }}
            onPaymentComplete={handlePaymentComplete}
            onPaymentError={handlePaymentError}
          />
        )}

        {/* Footer */}
        <div className="text-center mt-8 text-sm text-muted-foreground">
          <p>Secure payments powered by Circle's Cross-Chain Transfer Protocol (CCTP) V2</p>
          <p className="mt-1">Supporting Ethereum, Arbitrum, Base, Polygon, Avalanche, and Solana</p>
        </div>
      </div>
    </div>
  );
};

export default UniversalPay;
