import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Check, 
  CreditCard, 
  Star, 
  Crown, 
  Zap,
  Calendar,
  DollarSign,
  Shield,
  ArrowRight
} from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface Plan {
  id: string;
  name: string;
  price: number;
  transactionFee: number;
  monthlyLimit: number;
  features: string[];
  icon: React.ReactNode;
  popular: boolean;
}

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: string;
  onPlanChange: (planId: string) => void;
}

export const SubscriptionModal = ({ isOpen, onClose, currentPlan, onPlanChange }: SubscriptionModalProps) => {
  const { toast } = useToast();
  const [selectedPlan, setSelectedPlan] = useState(currentPlan);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [step, setStep] = useState<'plans' | 'payment' | 'confirmation'>('plans');
  const [paymentMethod, setPaymentMethod] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: ''
  });

  const plans: Plan[] = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      transactionFee: 2.9,
      monthlyLimit: 50,
      features: [
        'Up to 50 transactions/month',
        'Basic dashboard',
        'QR code generation',
        'Email support',
        'Standard analytics'
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
        'Custom QR branding',
        'Priority support',
        'Invoice management',
        'API access'
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
        'White-label options',
        'Multi-user accounts',
        'Dedicated support',
        'Custom integrations'
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

  const selectedPlanData = plans.find(p => p.id === selectedPlan);
  const currentPlanData = plans.find(p => p.id === currentPlan);
  
  const getPrice = (plan: Plan) => {
    if (plan.price === 0) return 0;
    return billingCycle === 'yearly' ? plan.price * 10 : plan.price; // 2 months free on yearly
  };

  const handlePlanSelect = (planId: string) => {
    setSelectedPlan(planId);
  };

  const handleContinue = () => {
    if (selectedPlan === 'free') {
      handleConfirmSubscription();
    } else {
      setStep('payment');
    }
  };

  const handlePayment = () => {
    // Mock payment processing
    setTimeout(() => {
      setStep('confirmation');
      setTimeout(() => {
        handleConfirmSubscription();
      }, 2000);
    }, 1500);
  };

  const handleConfirmSubscription = () => {
    onPlanChange(selectedPlan);
    toast({
      title: "Subscription Updated",
      description: `Successfully ${selectedPlan === 'free' ? 'downgraded to' : 'upgraded to'} ${selectedPlanData?.name} plan`,
    });
    onClose();
    setStep('plans');
  };

  const isUpgrade = selectedPlanData && currentPlanData && 
    plans.findIndex(p => p.id === selectedPlan) > plans.findIndex(p => p.id === currentPlan);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            {step === 'plans' && 'Choose Your Plan'}
            {step === 'payment' && 'Payment Details'}
            {step === 'confirmation' && 'Subscription Confirmed'}
          </DialogTitle>
        </DialogHeader>

        {step === 'plans' && (
          <div className="space-y-6">
            {/* Billing Cycle Toggle */}
            <div className="flex items-center justify-center gap-4 p-1 bg-muted rounded-lg">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'monthly' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  billingCycle === 'yearly' 
                    ? 'bg-background shadow-sm text-foreground' 
                    : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Yearly
                <Badge className="ml-2 bg-primary/10 text-primary text-xs">Save 20%</Badge>
              </button>
            </div>

            {/* Plans Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  onClick={() => handlePlanSelect(plan.id)}
                  className={`relative p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPlan === plan.id
                      ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                      : 'hover:border-primary/50'
                  } ${plan.popular ? 'ring-2 ring-accent/20' : ''}`}
                >
                  {plan.popular && (
                    <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground text-xs">
                      Popular
                    </Badge>
                  )}
                  
                  {plan.id === currentPlan && (
                    <Badge className="absolute -top-2 right-2 bg-primary/10 text-primary text-xs">
                      Current
                    </Badge>
                  )}

                  <div className="text-center space-y-3">
                    <div className="p-2 bg-muted rounded-lg w-fit mx-auto">
                      {plan.icon}
                    </div>
                    
                    <div>
                      <h3 className="font-semibold">{plan.name}</h3>
                      <div className="mt-2">
                        <span className="text-2xl font-bold">${getPrice(plan)}</span>
                        <span className="text-muted-foreground text-sm">
                          /{billingCycle === 'yearly' ? 'year' : 'month'}
                        </span>
                      </div>
                      {billingCycle === 'yearly' && plan.price > 0 && (
                        <div className="text-xs text-muted-foreground">
                          ${plan.price}/month billed yearly
                        </div>
                      )}
                    </div>

                    <div className="text-sm">
                      <Badge variant="secondary" className="text-xs">
                        {plan.transactionFee}% transaction fee
                      </Badge>
                    </div>

                    <div className="space-y-2 text-left">
                      {plan.features.slice(0, 3).map((feature, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs">
                          <Check className="w-3 h-3 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </div>
                      ))}
                      {plan.features.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{plan.features.length - 3} more features
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Plan Comparison */}
            {selectedPlanData && selectedPlan !== currentPlan && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="font-semibold mb-3">Plan Comparison</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-muted-foreground">Current: {currentPlanData?.name}</p>
                    <p className="font-medium">${currentPlanData?.price || 0}/month</p>
                    <p className="text-xs text-muted-foreground">{currentPlanData?.transactionFee}% transaction fee</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">New: {selectedPlanData.name}</p>
                    <p className="font-medium">${getPrice(selectedPlanData)}/{billingCycle === 'yearly' ? 'year' : 'month'}</p>
                    <p className="text-xs text-muted-foreground">{selectedPlanData.transactionFee}% transaction fee</p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                onClick={handleContinue}
                disabled={selectedPlan === currentPlan}
                className="flex-1"
              >
                {selectedPlan === currentPlan ? 'Current Plan' : 
                 selectedPlan === 'free' ? 'Downgrade' : 
                 isUpgrade ? 'Upgrade Plan' : 'Change Plan'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'payment' && selectedPlanData && (
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="bg-muted/30 rounded-lg p-4">
              <h4 className="font-semibold mb-3">Order Summary</h4>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>{selectedPlanData.name} Plan ({billingCycle})</span>
                  <span>${getPrice(selectedPlanData)}</span>
                </div>
                {billingCycle === 'yearly' && selectedPlanData.price > 0 && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Yearly discount (20%)</span>
                    <span>-${selectedPlanData.price * 2}</span>
                  </div>
                )}
                <Separator />
                <div className="flex justify-between font-semibold">
                  <span>Total</span>
                  <span>${getPrice(selectedPlanData)}</span>
                </div>
              </div>
            </div>

            {/* Payment Form */}
            <div className="space-y-4">
              <h4 className="font-semibold">Payment Information</h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={paymentMethod.name}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={paymentMethod.email}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  value={paymentMethod.cardNumber}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardNumber: e.target.value }))}
                  placeholder="1234 5678 9012 3456"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    value={paymentMethod.expiryDate}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryDate: e.target.value }))}
                    placeholder="MM/YY"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    value={paymentMethod.cvv}
                    onChange={(e) => setPaymentMethod(prev => ({ ...prev, cvv: e.target.value }))}
                    placeholder="123"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="w-4 h-4" />
                <span>Your payment information is secure and encrypted</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" onClick={() => setStep('plans')} className="flex-1">
                Back
              </Button>
              <Button onClick={handlePayment} className="flex-1">
                Complete Payment
                <DollarSign className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        )}

        {step === 'confirmation' && selectedPlanData && (
          <div className="text-center py-8 space-y-6">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-8 h-8 text-primary" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold mb-2">Payment Successful!</h3>
              <p className="text-muted-foreground">
                You've successfully {isUpgrade ? 'upgraded' : 'changed'} to the {selectedPlanData.name} plan
              </p>
            </div>

            <div className="bg-muted/30 rounded-lg p-4 max-w-md mx-auto">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Plan:</span>
                  <span className="font-medium">{selectedPlanData.name}</span>
                </div>
                <div className="flex justify-between">
                  <span>Billing:</span>
                  <span className="font-medium">${getPrice(selectedPlanData)}/{billingCycle === 'yearly' ? 'year' : 'month'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Transaction Fee:</span>
                  <span className="font-medium">{selectedPlanData.transactionFee}%</span>
                </div>
                <div className="flex justify-between">
                  <span>Next Billing:</span>
                  <span className="font-medium">
                    {new Date(Date.now() + (billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="text-sm text-muted-foreground">
              <p>A confirmation email has been sent to your inbox.</p>
              <p>Your new plan features are now active!</p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
