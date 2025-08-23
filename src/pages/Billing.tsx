import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Layout } from "@/components/Layout";
import { SubscriptionModal } from "@/components/SubscriptionModal";
import { 
  CreditCard, 
  TrendingUp, 
  Calendar, 
  Download,
  Check,
  X,
  Zap,
  Star,
  Crown,
  Settings
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

const Billing = () => {
  const { toast } = useToast();
  const [currentPlan, setCurrentPlan] = useState('starter');
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      transactionFee: 2.9,
      monthlyLimit: 50,
      features: [
        'Up to 50 transactions/month',
        'Basic dashboard',
        'Email support',
        'Standard QR codes'
      ],
      icon: <Zap className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'starter',
      name: 'Starter',
      price: 15,
      transactionFee: 2.4,
      monthlyLimit: 1000,
      features: [
        'Up to 1,000 transactions/month',
        'Advanced analytics',
        'Priority support',
        'Custom QR branding',
        'Invoice management'
      ],
      icon: <Star className="w-5 h-5" />,
      popular: true
    },
    {
      id: 'business',
      name: 'Business',
      price: 49,
      transactionFee: 1.9,
      monthlyLimit: 10000,
      features: [
        'Up to 10,000 transactions/month',
        'Advanced reporting',
        'API access',
        'White-label options',
        'Dedicated support',
        'Multi-user accounts'
      ],
      icon: <Crown className="w-5 h-5" />,
      popular: false
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 149,
      transactionFee: 1.4,
      monthlyLimit: 100000,
      features: [
        'Unlimited transactions',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantee',
        'Custom features',
        'On-premise deployment'
      ],
      icon: <Crown className="w-5 h-5" />,
      popular: false
    }
  ];

  const currentUsage = {
    transactions: 127,
    revenue: 3450.75,
    fees: 82.82,
    period: 'January 2024'
  };

  const billingHistory = [
    {
      id: 'INV-2024-001',
      date: '2024-01-01',
      amount: '$15.00',
      status: 'paid',
      description: 'Starter Plan - January 2024'
    },
    {
      id: 'INV-2023-012',
      date: '2023-12-01',
      amount: '$15.00',
      status: 'paid',
      description: 'Starter Plan - December 2023'
    },
    {
      id: 'INV-2023-011',
      date: '2023-11-01',
      amount: '$0.00',
      status: 'paid',
      description: 'Free Plan - November 2023'
    }
  ];

  const handleUpgrade = () => {
    setIsSubscriptionModalOpen(true);
  };

  const handlePlanChange = (newPlan: string) => {
    setCurrentPlan(newPlan);
    toast({
      title: "Plan Updated",
      description: `Successfully switched to ${plans.find(p => p.id === newPlan)?.name} plan`,
    });
  };

  const handleDownloadInvoice = (invoiceId: string) => {
    toast({
      title: "Invoice Downloaded",
      description: `Invoice ${invoiceId} has been downloaded`,
    });
  };

  const currentPlanData = plans.find(p => p.id === currentPlan);
  const usagePercentage = currentPlanData ? (currentUsage.transactions / currentPlanData.monthlyLimit) * 100 : 0;

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 opacity-0 animate-fade-in-down">
          <div>
            <h1 className="text-3xl font-bold">Billing & Subscription</h1>
            <p className="text-muted-foreground">Manage your subscription and view usage statistics</p>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="gap-2 btn-press">
              <Download className="w-4 h-4" />
              Download Invoice
            </Button>
            <Button onClick={handleUpgrade} className="gap-2 btn-press">
              <Settings className="w-4 h-4" />
              Manage Plan
            </Button>
          </div>
        </div>

        {/* Current Plan & Usage */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Current Plan */}
            <div className="opacity-0 animate-fade-in-up animate-delay-100">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-5 h-5" />
                    Current Plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {currentPlanData?.icon}
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold">{currentPlanData?.name} Plan</h3>
                        <p className="text-muted-foreground">
                          ${currentPlanData?.price}/month • {currentPlanData?.transactionFee}% transaction fee
                        </p>
                      </div>
                    </div>
                    <Badge className="bg-primary/10 text-primary">Active</Badge>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Transactions this month</span>
                      <span>{currentUsage.transactions} / {currentPlanData?.monthlyLimit}</span>
                    </div>
                    <Progress value={usagePercentage} className="h-2" />
                    <p className="text-xs text-muted-foreground">
                      {usagePercentage.toFixed(1)}% of monthly limit used
                    </p>
                  </div>

                  <Button onClick={handleUpgrade} className="w-full btn-press">
                    Change Plan
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Usage Statistics */}
            <div className="opacity-0 animate-fade-in-up animate-delay-200">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Usage Statistics - {currentUsage.period}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">{currentUsage.transactions}</div>
                      <div className="text-sm text-muted-foreground">Transactions</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">${currentUsage.revenue.toLocaleString()}</div>
                      <div className="text-sm text-muted-foreground">Revenue Processed</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-accent">${currentUsage.fees}</div>
                      <div className="text-sm text-muted-foreground">Platform Fees</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Billing History */}
            <div className="opacity-0 animate-fade-in-up animate-delay-300">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Billing History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {billingHistory.map((invoice, index) => (
                      <div 
                        key={invoice.id} 
                        className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-all duration-200 opacity-0 animate-fade-in-up`}
                        style={{ animationDelay: `${400 + index * 100}ms` }}
                      >
                        <div>
                          <p className="font-medium">{invoice.description}</p>
                          <p className="text-sm text-muted-foreground">{invoice.date} • {invoice.id}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right">
                            <p className="font-semibold">{invoice.amount}</p>
                            <Badge className={invoice.status === 'paid' ? 'bg-primary/10 text-primary' : 'bg-muted'}>
                              {invoice.status}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleDownloadInvoice(invoice.id)}
                            className="btn-press"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Plan Overview */}
            <div className="opacity-0 animate-slide-in-right animate-delay-100">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Available Plans</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {plans.slice(0, 3).map((plan) => (
                    <div 
                      key={plan.id}
                      className={`p-3 border rounded-lg transition-all duration-200 ${
                        plan.id === currentPlan 
                          ? 'border-primary bg-primary/5' 
                          : 'hover:border-primary/50 cursor-pointer'
                      }`}
                      onClick={() => plan.id !== currentPlan && handleUpgrade()}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="p-1 bg-muted rounded">
                            {plan.icon}
                          </div>
                          <h3 className="font-semibold text-sm">{plan.name}</h3>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">${plan.price}</div>
                          <div className="text-xs text-muted-foreground">/month</div>
                        </div>
                      </div>

                      <div className="text-xs text-muted-foreground mb-2">
                        {plan.transactionFee}% transaction fee
                      </div>

                      {plan.id === currentPlan ? (
                        <Badge className="w-full justify-center bg-primary/10 text-primary">
                          Current Plan
                        </Badge>
                      ) : (
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          {plan.price > (currentPlanData?.price || 0) ? 'Upgrade' : 'Switch'}
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <Button onClick={handleUpgrade} className="w-full btn-press">
                    View All Plans
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Payment Method */}
            <div className="opacity-0 animate-slide-in-right animate-delay-200">
              <Card className="card-hover">
                <CardHeader>
                  <CardTitle>Payment Method</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-3 p-3 border rounded-lg">
                    <CreditCard className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">•••• •••• •••• 4242</p>
                      <p className="text-sm text-muted-foreground">Expires 12/25</p>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full btn-press">
                    Update Payment Method
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        currentPlan={currentPlan}
        onPlanChange={handlePlanChange}
      />
    </Layout>
  );
};

export default Billing;
