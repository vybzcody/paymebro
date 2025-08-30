import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Send, CreditCard, TrendingUp, Users, DollarSign, Wallet, Zap, Clock, Link, Copy, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { QRGenerator } from "./QRGenerator";
import { useAuth } from "@/hooks/useAuth";
import { useSolanaPay } from "@/hooks/useSolanaPay";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { getBusinessMetrics, createPaymentLink, getPaymentLinks, type BusinessMetrics, type PaymentLink } from "@/services/businessService";

export const Dashboard = () => {
  const { user, publicKey } = useAuth();
  const { paymentStatus } = useSolanaPay();
  
  const [paymentLinks, setPaymentLinks] = useState<PaymentLink[]>([]);
  const [newLink, setNewLink] = useState({ title: '', amount: '' });
  const [metrics, setMetrics] = useState<BusinessMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  // Load business data on component mount
  useEffect(() => {
    if (user?.id) {
      loadBusinessData();
    }
  }, [user?.id]);

  const loadBusinessData = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const [metricsData, linksData] = await Promise.all([
        getBusinessMetrics(user.id),
        getPaymentLinks(user.id)
      ]);
      
      setMetrics(metricsData);
      setPaymentLinks(linksData);
    } catch (error) {
      console.error('Error loading business data:', error);
      toast.error('Failed to load business data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePaymentLink = async () => {
    if (!newLink.title || !newLink.amount || !user?.id) {
      toast.error('Please fill all fields');
      return;
    }
    
    try {
      const link = await createPaymentLink(
        user.id,
        newLink.title,
        parseFloat(newLink.amount)
      );
      
      setPaymentLinks([link, ...paymentLinks]);
      setNewLink({ title: '', amount: '' });
      toast.success('Payment link created!');
    } catch (error) {
      console.error('Error creating payment link:', error);
      toast.error('Failed to create payment link');
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied!');
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner with Solana Pay Status */}
      <div className="opacity-0 animate-fade-in-down">
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-foreground">
                  Welcome back{user?.name ? `, ${user.name}` : ''}! 👋
                </h1>
                <p className="text-muted-foreground mt-1">
                  Ready to accept payments with Solana Pay
                </p>
              </div>
              <div className="flex items-center gap-3">
                {publicKey ? (
                  <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-lg">
                    <Wallet className="w-4 h-4 text-primary" />
                    <span className="text-sm font-medium text-primary">Wallet Connected</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 rounded-lg">
                    <Wallet className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm text-muted-foreground">Connect Wallet</span>
                  </div>
                )}
                <Badge variant="outline" className="bg-accent/10 text-accent">
                  <Zap className="w-3 h-3 mr-1" />
                  Solana Pay Ready
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="opacity-0 animate-fade-in-up">
            <StatCard
              title="Total Revenue"
              value={loading ? "..." : `$${metrics?.totalRevenue.toLocaleString() || '0'}`}
              icon={<DollarSign className="w-4 h-4" />}
              trend="+12.5%"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-100">
            <StatCard
              title="Transactions"
              value={loading ? "..." : `${metrics?.totalTransactions || 0}`}
              icon={<Zap className="w-4 h-4" />}
              trend="+24.8%"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-200">
            <StatCard
              title="Success Rate"
              value={loading ? "..." : `${metrics?.successRate.toFixed(1) || '0'}%`}
              icon={<TrendingUp className="w-4 h-4" />}
              trend="Excellent"
            />
          </div>
          <div className="opacity-0 animate-fade-in-up animate-delay-300">
            <StatCard
              title="Customers"
              value={loading ? "..." : `${metrics?.activeCustomers || 0}`}
              icon={<Users className="w-4 h-4" />}
              trend="+5.1%"
            />
          </div>
        </div>

        {/* Current Payment Status */}
        {paymentStatus.status !== 'idle' && (
          <div className="opacity-0 animate-fade-in-up animate-delay-400">
            <Card className={`border-0 shadow-lg ${
              paymentStatus.status === 'confirmed' 
                ? 'bg-gradient-to-r from-green-500/10 to-green-600/5 border-green-500/20' 
                : paymentStatus.status === 'pending'
                ? 'bg-gradient-to-r from-yellow-500/10 to-yellow-600/5 border-yellow-500/20'
                : paymentStatus.status === 'failed'
                ? 'bg-gradient-to-r from-red-500/10 to-red-600/5 border-red-500/20'
                : 'bg-gradient-to-r from-blue-500/10 to-blue-600/5 border-blue-500/20'
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      paymentStatus.status === 'confirmed' ? 'bg-green-500/20' :
                      paymentStatus.status === 'pending' ? 'bg-yellow-500/20' :
                      paymentStatus.status === 'failed' ? 'bg-red-500/20' : 'bg-blue-500/20'
                    }`}>
                      {paymentStatus.status === 'confirmed' && <QrCode className="w-5 h-5 text-green-600" />}
                      {paymentStatus.status === 'pending' && <Clock className="w-5 h-5 text-yellow-600 animate-pulse" />}
                      {paymentStatus.status === 'failed' && <QrCode className="w-5 h-5 text-red-600" />}
                      {(paymentStatus.status === 'creating' || paymentStatus.status === 'confirming') && <QrCode className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                      <h3 className="font-semibold capitalize">
                        {paymentStatus.status === 'confirmed' ? 'Payment Received!' :
                         paymentStatus.status === 'pending' ? 'Waiting for Payment' :
                         paymentStatus.status === 'failed' ? 'Payment Failed' :
                         'Processing Payment'}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {paymentStatus.status === 'confirmed' ? 'Transaction confirmed on Solana' :
                         paymentStatus.status === 'pending' ? 'Customer can scan QR code below' :
                         paymentStatus.status === 'failed' ? paymentStatus.error || 'Transaction unsuccessful' :
                         'Creating Solana Pay request...'}
                      </p>
                    </div>
                  </div>
                  {paymentStatus.signature && (
                    <Badge variant="outline" className="font-mono text-xs">
                      {paymentStatus.signature.slice(0, 8)}...{paymentStatus.signature.slice(-8)}
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Actions */}
        <div className="grid grid-cols-1 gap-6">
          <div className="opacity-0 animate-slide-in-left animate-delay-500">
            <Card className="shadow-lg border-0 bg-gradient-to-br from-primary/5 to-primary/10 card-hover">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-primary" />
                  Generate Solana Pay QR Code
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Create instant payment requests for SOL or USDC that work with any Solana wallet
                </p>
              </CardHeader>
              <CardContent>
                <QRGenerator />
              </CardContent>
            </Card>
          </div>
        </div>


        {/* Recent Solana Transactions */}
        <div className="opacity-0 animate-fade-in-up animate-delay-600">
          <Card className="shadow-lg border-0 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-primary" />
                Recent Solana Pay Transactions
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Lightning-fast payments confirmed on Solana blockchain
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { id: "1", customer: "Sarah's Coffee Shop", amount: "0.15 SOL", status: "Confirmed", time: "0.4s ago", signature: "3wJfK...8xPq" },
                  { id: "2", customer: "Mike's Electronics", amount: "1.25 SOL", status: "Confirmed", time: "2 min ago", signature: "5kLm9...7yTr" },
                  { id: "3", customer: "Local Market", amount: "0.85 SOL", status: "Confirmed", time: "5 min ago", signature: "8nPx4...2wQs" },
                  { id: "4", customer: "Delivery Service", amount: "0.08 SOL", status: "Pending", time: "Just now", signature: null },
                ].map((transaction, index) => (
                  <div 
                    key={transaction.id} 
                    className={`flex items-center justify-between p-4 bg-muted/30 rounded-lg hover:bg-muted/50 transition-all duration-200 cursor-pointer opacity-0 animate-fade-in-up border border-muted/50`}
                    style={{ animationDelay: `${700 + index * 100}ms` }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        transaction.status === 'Confirmed' ? 'bg-primary/20' : 'bg-yellow-500/20'
                      }`}>
                        {transaction.status === 'Confirmed' ? (
                          <Zap className="w-4 h-4 text-primary" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="font-medium">{transaction.customer}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <span>{transaction.time}</span>
                          {transaction.signature && (
                            <>
                              <span>•</span>
                              <code className="text-xs bg-muted px-1 py-0.5 rounded">
                                {transaction.signature}
                              </code>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{transaction.amount}</p>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={transaction.status === 'Confirmed' ? 'default' : 'secondary'}
                          className={transaction.status === 'Confirmed' ? 'bg-primary/10 text-primary' : 'bg-yellow-500/10 text-yellow-600'}
                        >
                          {transaction.status}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-primary/5 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2 text-sm">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="font-medium text-primary">Powered by Solana:</span>
                  <span className="text-muted-foreground">Average confirmation time: 0.4 seconds</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Payment Links Section */}
        <div className="opacity-0 animate-fade-in-up animate-delay-600">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                Payment Links
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="title">Product/Service</Label>
                  <Input
                    id="title"
                    placeholder="e.g., Premium Plan"
                    value={newLink.title}
                    onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount (USDC)</Label>
                  <Input
                    id="amount"
                    type="number"
                    placeholder="0.00"
                    value={newLink.amount}
                    onChange={(e) => setNewLink({ ...newLink, amount: e.target.value })}
                  />
                </div>
                <div className="flex items-end">
                  <Button onClick={handleCreatePaymentLink} className="w-full">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Link
                  </Button>
                </div>
              </div>

              {paymentLinks.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Link className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No payment links yet</p>
                  <p className="text-sm">Create your first payment link above</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {paymentLinks.map((link) => (
                    <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{link.title}</h4>
                        <p className="text-sm text-muted-foreground">
                          ${link.amount} {link.currency} • {link.clicks} clicks • Created {new Date(link.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyLink(link.url)}
                      >
                        <Copy className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
  );
};
