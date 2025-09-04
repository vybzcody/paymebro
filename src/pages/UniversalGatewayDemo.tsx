import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Copy, ExternalLink, Zap, Globe, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';
import { CctpNetworkAdapterId, networkAdapters } from '@/lib/cctp/networks';

const UniversalGatewayDemo: React.FC = () => {
  const [merchantName, setMerchantName] = useState('Demo Merchant');
  const [amount, setAmount] = useState('29.99');
  const [description, setDescription] = useState('Premium Subscription');
  const [preferredChain, setPreferredChain] = useState<CctpNetworkAdapterId>('solana' as CctpNetworkAdapterId);
  const [generatedLink, setGeneratedLink] = useState<string>('');

  const supportedChains = networkAdapters.filter(adapter => 
    ['solana', 1, 42161, 8453, 137, 43114].includes(adapter.id)
  );

  const handleGenerateLink = () => {
    const reference = Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/universal-pay/${reference}`;
    setGeneratedLink(link);
    toast.success('Universal payment link generated!');
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  const openPaymentLink = () => {
    if (generatedLink) {
      window.open(generatedLink, '_blank');
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Universal Merchant Payment Gateway
        </h1>
        <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
          Accept USDC payments from any supported blockchain with automatic rebalancing to your preferred chain using CCTP V2
        </p>
        <div className="flex justify-center space-x-2">
          <Badge variant="secondary" className="text-xs">
            <Globe className="h-3 w-3 mr-1" />
            Multi-Chain
          </Badge>
          <Badge variant="secondary" className="text-xs">
            <Zap className="h-3 w-3 mr-1" />
            CCTP V2 Powered
          </Badge>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Configuration</CardTitle>
            <CardDescription>
              Configure your universal payment link settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="merchant-name">Merchant Name</Label>
              <Input
                id="merchant-name"
                value={merchantName}
                onChange={(e) => setMerchantName(e.target.value)}
                placeholder="Your business name"
              />
            </div>

            <div>
              <Label htmlFor="amount">Amount (USDC)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Input
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What is this payment for?"
              />
            </div>

            <div>
              <Label htmlFor="preferred-chain">Preferred Receiving Chain</Label>
              <Select value={preferredChain.toString()} onValueChange={(value) => setPreferredChain(value as CctpNetworkAdapterId)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your preferred chain" />
                </SelectTrigger>
                <SelectContent>
                  {supportedChains.map((chain) => (
                    <SelectItem key={chain.id} value={chain.id.toString()}>
                      <div className="flex items-center space-x-2">
                        <span>{chain.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {chain.nativeCurrency.symbol}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                All payments will be automatically rebalanced to this chain
              </p>
            </div>

            <Separator />

            <div>
              <Label className="text-sm font-medium">Accepted Payment Chains</Label>
              <div className="grid grid-cols-2 gap-2 mt-2">
                {supportedChains.map((chain) => (
                  <div key={chain.id} className="flex items-center space-x-2 p-2 border rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">{chain.name}</span>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">
                Customers can pay from any of these chains
              </p>
            </div>

            <Button onClick={handleGenerateLink} className="w-full" size="lg">
              <Zap className="h-4 w-4 mr-2" />
              Generate Universal Payment Link
            </Button>
          </CardContent>
        </Card>

        {/* Preview Panel */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Link Preview</CardTitle>
            <CardDescription>
              This is how your payment link will appear to customers
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {generatedLink ? (
              <>
                <div className="bg-muted/50 p-4 rounded-lg space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold">{merchantName}</h3>
                      <p className="text-sm text-muted-foreground">{description}</p>
                    </div>
                    <Badge variant="secondary">
                      {amount} USDC
                    </Badge>
                  </div>
                  
                  <div className="flex items-center justify-center space-x-2 p-3 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium">Any Chain</div>
                      <div className="text-xs text-muted-foreground">Customer pays</div>
                    </div>
                    <ArrowRight className="h-4 w-4 text-blue-500" />
                    <div className="text-center">
                      <div className="text-sm font-medium">
                        {supportedChains.find(c => c.id.toString() === preferredChain.toString())?.name}
                      </div>
                      <div className="text-xs text-muted-foreground">You receive</div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-sm">Generated Payment Link</Label>
                  <div className="flex items-center space-x-2">
                    <Input
                      value={generatedLink}
                      readOnly
                      className="font-mono text-xs"
                    />
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(generatedLink)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button onClick={openPaymentLink} className="flex-1">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Test Payment
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => copyToClipboard(generatedLink)}
                    className="flex-1"
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </Button>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Globe className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Generate a payment link to see the preview</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Universal Payment Gateway Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center mx-auto">
                <Globe className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Multi-Chain Acceptance</h3>
              <p className="text-sm text-muted-foreground">
                Accept USDC payments from Ethereum, Arbitrum, Base, Polygon, Avalanche, and Solana
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center mx-auto">
                <Zap className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Automatic Rebalancing</h3>
              <p className="text-sm text-muted-foreground">
                All payments automatically rebalance to your preferred chain using CCTP V2
              </p>
            </div>

            <div className="text-center space-y-2">
              <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center mx-auto">
                <ArrowRight className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Seamless UX</h3>
              <p className="text-sm text-muted-foreground">
                Customers pay from their preferred chain while you receive on yours
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UniversalGatewayDemo;
