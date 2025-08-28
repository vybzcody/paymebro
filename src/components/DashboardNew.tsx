import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { QrCode, Send, CreditCard, TrendingUp, Users, DollarSign, Wallet, Zap, Clock, Link, Copy, Plus } from "lucide-react";
import { StatCard } from "./StatCard";
import { EmptyState, TransactionSkeleton } from "./EmptyStates";
import { useWeb3Auth } from "@/contexts/Web3AuthContext";
import { useTransactions } from "@/hooks/useTransactions";
import { usePaymentLinks } from "@/hooks/usePaymentLinks";
import { useState } from "react";
import { toast } from "sonner";

export const Dashboard = () => {
  const { user, publicKey } = useWeb3Auth();
  const { transactions, loading: txLoading } = useTransactions();
  const { paymentLinks, loading: linksLoading, createPaymentLink } = usePaymentLinks();
  
  const [newLink, setNewLink] = useState({ title: '', amount: '' });
  const [showCreateForm, setShowCreateForm] = useState(false);

  // Calculate metrics from real data
  const totalRevenue = transactions
    .filter(tx => tx.status === 'confirmed')
    .reduce((sum, tx) => sum + tx.net_amount, 0);

  const totalTransactions = transactions.filter(tx => tx.status === 'confirmed').length;
  
  const uniqueCustomers = new Set(
    transactions
      .filter(tx => tx.customer_email)
      .map(tx => tx.customer_email)
  ).size;

  const recentTransactions = transactions.slice(0, 5);

  const handleCreatePaymentLink = async () => {
    if (!newLink.title || !newLink.amount) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      const link = await createPaymentLink({
        title: newLink.title,
        amount: parseFloat(newLink.amount)
      });
      
      toast.success('Payment link created successfully!');
      setNewLink({ title: '', amount: '' });
      setShowCreateForm(false);
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment link');
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard!');
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">Please connect your wallet to view dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500">Welcome back, {user.name || 'User'}</p>
        </div>
        <Button 
          onClick={() => setShowCreateForm(true)}
          className="bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Payment Link
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Revenue"
          value={`$${totalRevenue.toFixed(2)}`}
          icon={DollarSign}
          trend="+12.5%"
          trendUp={true}
        />
        <StatCard
          title="Transactions"
          value={totalTransactions.toString()}
          icon={CreditCard}
          trend="+8.2%"
          trendUp={true}
        />
        <StatCard
          title="Customers"
          value={uniqueCustomers.toString()}
          icon={Users}
          trend="+15.3%"
          trendUp={true}
        />
        <StatCard
          title="Active Links"
          value={paymentLinks.filter(link => link.is_active).length.toString()}
          icon={Link}
          trend="0%"
          trendUp={false}
        />
      </div>

      {/* Create Payment Link Form */}
      {showCreateForm && (
        <Card>
          <CardHeader>
            <CardTitle>Create Payment Link</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Premium Plan"
                  value={newLink.title}
                  onChange={(e) => setNewLink(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="amount">Amount (USDC)</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={newLink.amount}
                  onChange={(e) => setNewLink(prev => ({ ...prev, amount: e.target.value }))}
                />
              </div>
            </div>
            <div className="flex space-x-2">
              <Button onClick={handleCreatePaymentLink}>
                Create Link
              </Button>
              <Button variant="outline" onClick={() => setShowCreateForm(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <CreditCard className="h-5 w-5 mr-2" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            {txLoading ? (
              <TransactionSkeleton />
            ) : recentTransactions.length === 0 ? (
              <EmptyState 
                type="transactions" 
                onAction={() => setShowCreateForm(true)}
              />
            ) : (
              <div className="space-y-3">
                {recentTransactions.map((tx) => (
                  <div key={tx.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-5 w-5 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium">{tx.customer_name || 'Anonymous'}</p>
                        <p className="text-sm text-gray-500">{tx.customer_email}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">${tx.amount} {tx.currency}</p>
                      <Badge variant={tx.status === 'confirmed' ? 'default' : 'secondary'}>
                        {tx.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Payment Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <QrCode className="h-5 w-5 mr-2" />
              Payment Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {linksLoading ? (
              <TransactionSkeleton />
            ) : paymentLinks.length === 0 ? (
              <EmptyState 
                type="payment-links" 
                onAction={() => setShowCreateForm(true)}
              />
            ) : (
              <div className="space-y-3">
                {paymentLinks.slice(0, 5).map((link) => (
                  <div key={link.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{link.title}</p>
                      <p className="text-sm text-gray-500">
                        ${link.amount} {link.currency} • {link.payment_count} payments
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={link.is_active ? 'default' : 'secondary'}>
                        {link.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => copyToClipboard(link.payment_url)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    </div>
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
