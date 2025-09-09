import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, ExternalLink, Download, CreditCard, TrendingUp } from "lucide-react";
import { useState } from "react";

interface Wallet {
  id: string;
  name: string;
  address: string;
  balance: string;
  currency: string;
  usdValue: string;
  network: string;
  type: 'primary' | 'secondary';
}

interface WalletsListProps {
  wallets: Wallet[];
  isLoading: boolean;
  onWithdraw: () => void;
}

export function WalletsList({ wallets, isLoading, onWithdraw }: WalletsListProps) {
  const [copiedAddress, setCopiedAddress] = useState<string | null>(null);

  const copyAddress = async (address: string) => {
    await navigator.clipboard.writeText(address);
    setCopiedAddress(address);
    setTimeout(() => setCopiedAddress(null), 2000);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-8">
        {/* Loading Wallet Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-16"></div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="h-8 bg-gray-200 rounded w-32 mb-1"></div>
                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-8 bg-gray-200 rounded w-16"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                    <div className="h-8 bg-gray-200 rounded w-20"></div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Loading Status */}
        <div className="text-center py-4">
          <div className="inline-flex items-center gap-2 text-sm text-gray-600">
            <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
            Fetching wallet balances and current prices...
          </div>
        </div>

        {/* Loading Merchant Features */}
        <Card className="animate-pulse">
          <CardHeader>
            <div className="h-6 bg-gray-200 rounded w-48"></div>
            <div className="h-4 bg-gray-200 rounded w-64"></div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="p-4 border rounded-lg">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-8 w-8 bg-gray-200 rounded"></div>
                    <div className="flex-1">
                      <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-32"></div>
                    </div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded w-20"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Wallet Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {wallets.map((wallet) => (
          <Card key={wallet.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2">
                    {wallet.name}
                    <Badge variant={wallet.type === 'primary' ? 'default' : 'outline'}>
                      {wallet.network}
                    </Badge>
                  </CardTitle>
                  <p className="text-sm text-gray-600 mt-1">
                    {formatAddress(wallet.address)}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Balance */}
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {wallet.balance} {wallet.currency}
                  </p>
                  <p className="text-sm text-gray-500">{wallet.usdValue}</p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => copyAddress(wallet.address)}
                    className="flex items-center gap-1"
                  >
                    <Copy className="h-3 w-3" />
                    {copiedAddress === wallet.address ? 'Copied!' : 'Copy'}
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => window.open(`https://explorer.solana.com/address/${wallet.address}`, '_blank')}
                    className="flex items-center gap-1"
                  >
                    <ExternalLink className="h-3 w-3" />
                    Explorer
                  </Button>

                  {wallet.type === 'primary' && (
                    <Button
                      size="sm"
                      onClick={onWithdraw}
                      className="flex items-center gap-1"
                    >
                      <Download className="h-3 w-3" />
                      Withdraw
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Merchant Features */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Merchant Features</CardTitle>
          <p className="text-gray-600">Advanced tools for managing your business finances</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <CreditCard className="h-8 w-8 text-blue-600" />
                <div>
                  <h3 className="font-semibold">Withdraw to Bank</h3>
                  <p className="text-sm text-gray-600">Convert crypto to fiat</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <TrendingUp className="h-8 w-8 text-green-600" />
                <div>
                  <h3 className="font-semibold">Analytics</h3>
                  <p className="text-sm text-gray-600">Track wallet performance</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>

            <div className="p-4 border rounded-lg">
              <div className="flex items-center gap-3 mb-3">
                <Download className="h-8 w-8 text-purple-600" />
                <div>
                  <h3 className="font-semibold">Auto-Withdraw</h3>
                  <p className="text-sm text-gray-600">Scheduled withdrawals</p>
                </div>
              </div>
              <Badge variant="secondary">Coming Soon</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
