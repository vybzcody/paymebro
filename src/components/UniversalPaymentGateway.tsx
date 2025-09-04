import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import { NumericFormat } from 'react-number-format';

// CCTP V2 imports
import { findNetworkAdapter, CctpNetworkAdapterId } from '@/lib/cctp/networks';
import { CctpV2TransferType } from '@/lib/cctp/types';
import { useCCTPTransfer } from '@/hooks/useCCTPTransfer';
import { CCTPProgressSteps } from './CCTPProgressSteps';
import { CCTPTransferLogs } from './CCTPTransferLogs';
import { CCTPTimer } from './CCTPTimer';
import { useMultiChainWeb3Auth } from '@/contexts/MultiChainWeb3AuthContext';

interface PaymentRequest {
  id: string;
  merchantName: string;
  merchantWallet: string;
  preferredChain: CctpNetworkAdapterId;
  amount: number;
  currency: string;
  description: string;
  acceptedChains: CctpNetworkAdapterId[];
}

interface UniversalPaymentGatewayProps {
  paymentRequest: PaymentRequest;
  onPaymentComplete?: (txHash: string, sourceChain: CctpNetworkAdapterId) => void;
  onPaymentError?: (error: string) => void;
}

export const UniversalPaymentGateway: React.FC<UniversalPaymentGatewayProps> = ({
  paymentRequest,
  onPaymentComplete,
  onPaymentError
}) => {
  const { user, keyService, wallets } = useMultiChainWeb3Auth();
  const [selectedChain, setSelectedChain] = useState<CctpNetworkAdapterId>(paymentRequest.acceptedChains[0]);
  const [paymentAmount, setPaymentAmount] = useState(paymentRequest.amount.toString());
  const [isProcessing, setIsProcessing] = useState(false);
  
  const { 
    currentStep, 
    logs, 
    error, 
    transferAmount, 
    executeTransfer, 
    resetTransfer,
    startTime 
  } = useCCTPTransfer();
  
  const selectedAdapter = findNetworkAdapter(selectedChain);
  const merchantAdapter = findNetworkAdapter(paymentRequest.preferredChain);
  const requiresCCTP = selectedChain !== paymentRequest.preferredChain;
  
  // Get user's balance on selected chain
  const userWallet = wallets[selectedChain];
  const hasInsufficientBalance = userWallet && userWallet.balance.usdc < paymentRequest.amount;

  const handlePayment = async () => {
    if (!user || !keyService || !selectedAdapter || !merchantAdapter) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (hasInsufficientBalance) {
      toast.error(`Insufficient USDC balance on ${selectedAdapter.name}`);
      return;
    }

    setIsProcessing(true);

    try {
      if (requiresCCTP) {
        // Cross-chain payment using CCTP V2
        await executeTransfer({
          amount: paymentAmount.toString(),
          sourceChain: selectedChain,
          destinationChain: paymentRequest.preferredChain,
          recipient: paymentRequest.merchantWallet
        });
      } else {
        // Direct payment on same chain
        await handleDirectPayment();
      }
    } catch (err: any) {
      console.error('Payment failed:', err);
      toast.error(err.message || 'Payment failed');
      onPaymentError?.(err.message || 'Payment failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDirectPayment = async () => {
    if (!selectedAdapter || !keyService) return;

    // Get user account for selected chain
    const userAccount = await keyService.getAccountForChain(selectedChain);
    
    // Execute direct USDC transfer
    const txHash = await selectedAdapter.writeTokenMessagerDepositForBurn({
      address: userAccount.address,
      amount: parseFloat(paymentAmount),
      destination: merchantAdapter!,
      mintRecipient: paymentRequest.merchantWallet
    });

    toast.success('Payment sent successfully!');
    onPaymentComplete?.(txHash, selectedChain);
  };

  // Handle payment completion
  useEffect(() => {
    if (currentStep === 'completed' && transferAmount) {
      toast.success('Cross-chain payment completed!');
      onPaymentComplete?.('', selectedChain); // CCTP doesn't return single tx hash
    }
  }, [currentStep, transferAmount]);

  // Handle payment errors
  useEffect(() => {
    if (error) {
      onPaymentError?.(error);
    }
  }, [error]);

  const getStepIcon = (step: TransferStep) => {
    switch (step) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Loader2 className="h-4 w-4 animate-spin" />;
    }
  };

  const getStepLabel = (step: TransferStep) => {
    const labels = {
      idle: 'Ready to Pay',
      approving: 'Approving USDC...',
      burning: 'Processing Payment...',
      'waiting-attestation': 'Confirming Transaction...',
      minting: 'Completing Transfer...',
      completed: 'Payment Complete!',
      error: 'Payment Failed'
    };
    return labels[step];
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Universal Payment Gateway
          {requiresCCTP && (
            <Badge variant="secondary" className="text-xs">
              Cross-Chain via CCTP V2
            </Badge>
          )}
        </CardTitle>
        <CardDescription>
          Pay {paymentRequest.merchantName} • {paymentRequest.description}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Payment Details */}
        <div className="bg-muted/50 p-4 rounded-lg">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Amount</span>
            <span className="font-bold text-lg">
              {paymentRequest.amount} {paymentRequest.currency}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground">Merchant</span>
            <span className="text-sm">{paymentRequest.merchantName}</span>
          </div>
        </div>

        {/* Chain Selection */}
        <div className="space-y-2">
          <Label>Pay From Chain</Label>
          <Select value={selectedChain.toString()} onValueChange={(value) => setSelectedChain(value as CctpNetworkAdapterId)}>
            <SelectTrigger>
              <SelectValue placeholder="Select payment chain" />
            </SelectTrigger>
            <SelectContent>
              {paymentRequest.acceptedChains.map((chainId) => {
                const adapter = findNetworkAdapter(chainId);
                const wallet = wallets[chainId];
                return (
                  <SelectItem key={chainId} value={chainId.toString()}>
                    <div className="flex items-center justify-between w-full">
                      <span>{adapter?.name}</span>
                      {wallet && (
                        <span className="text-xs text-muted-foreground ml-2">
                          {wallet.balance.usdc.toFixed(2)} USDC
                        </span>
                      )}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>
          
          {userWallet && (
            <div className="text-sm text-muted-foreground">
              Available: {userWallet.balance.usdc.toFixed(2)} USDC
            </div>
          )}
        </div>

        {/* Cross-chain indicator */}
        {requiresCCTP && (
          <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
            <div className="text-center">
              <div className="text-sm font-medium">{selectedAdapter?.name}</div>
              <div className="text-xs text-muted-foreground">Pay from</div>
            </div>
            <ArrowRight className="h-4 w-4 text-blue-500" />
            <div className="text-center">
              <div className="text-sm font-medium">{merchantAdapter?.name}</div>
              <div className="text-xs text-muted-foreground">Receive on</div>
            </div>
          </div>
        )}

        {/* CCTP Progress Display */}
        {requiresCCTP && currentStep !== 'idle' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium">Cross-Chain Transfer Progress</h3>
              {startTime && (
                <CCTPTimer 
                  isRunning={currentStep !== 'completed' && currentStep !== 'error'}
                  initialSeconds={Math.floor((Date.now() - startTime.getTime()) / 1000)}
                />
              )}
            </div>
            <CCTPProgressSteps currentStep={currentStep} />
            {logs.length > 0 && (
              <CCTPTransferLogs logs={logs} className="max-h-32" />
            )}
          </div>
        )}

        {/* Warnings */}
        {hasInsufficientBalance && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Insufficient USDC balance on {selectedAdapter?.name}. 
              You need {paymentRequest.amount} USDC but only have {userWallet?.balance.usdc.toFixed(2)} USDC.
            </AlertDescription>
          </Alert>
        )}

        {/* Payment Status */}
        {(isProcessing || currentStep !== 'idle') && (
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              {getStepIcon(currentStep)}
              <span className="text-sm font-medium">{getStepLabel(currentStep)}</span>
            </div>
            
            {logs.length > 0 && (
              <div className="bg-muted/50 p-3 rounded-lg max-h-32 overflow-y-auto">
                <ul className="text-xs space-y-1 text-muted-foreground">
                  {logs}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Payment Button */}
        <Button 
          onClick={handlePayment}
          disabled={isProcessing || currentStep === 'completed' || hasInsufficientBalance || !user}
          className="w-full"
          size="lg"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={currentStep}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {currentStep === 'completed' ? (
                'Payment Complete! 🎉'
              ) : isProcessing ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing Payment...
                </>
              ) : (
                `Pay ${paymentRequest.amount} ${paymentRequest.currency}${requiresCCTP ? ' (Cross-Chain)' : ''}`
              )}
            </motion.span>
          </AnimatePresence>
        </Button>

        {/* Reset Button */}
        {(currentStep === 'completed' || currentStep === 'error') && (
          <Button variant="outline" onClick={reset} className="w-full">
            Make Another Payment
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
