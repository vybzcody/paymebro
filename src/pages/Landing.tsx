import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowRight,
  Check,
  Star,
  Globe,
  Shield,
  Zap,
  Users,
  TrendingUp,
  QrCode,
  CreditCard,
  Smartphone,
  BarChart3,
  HeadphonesIcon,
  Award,
  MapPin,
  DollarSign,
  Clock,
  Menu,
  X,
  Wallet,
  LogIn,
  AlertCircle,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "../hooks/useAuth";

const Landing = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { login, logout, isAuthenticated, isLoading, isInitialized, error, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Redirect after successful login (but not during the login process)
  // useEffect(() => {
  //   if (isAuthenticated && !isLoggingIn && isInitialized) {
  //     console.log('User is authenticated, redirecting to dashboard...');
  //     navigate('/dashboard');
  //   }
  // }, [isAuthenticated, isLoggingIn, isInitialized, navigate]);

  const handleGetStarted = async () => {
    if (isAuthenticated) {
      navigate('/dashboard');
      return;
    }

    try {
      setIsLoggingIn(true);
      await login();

      toast({
        title: "Welcome to AfriPay! 🎉",
        description: "Successfully connected your wallet. Redirecting to dashboard...",
      });

      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate('/dashboard');
      }, 1000);
    } catch (err: any) {
      console.error('Login error:', err);
      toast({
        title: "Connection Failed",
        description: err.message || "Failed to connect wallet. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleWaitlist = () => {
    toast({
      title: "Added to Waitlist",
      description: "We'll notify you when AfriPay launches!",
    });
  };

  // Show loading state while initializing
  if (isLoading && !isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <h2 className="text-xl font-semibold">Initializing AfriPay</h2>
          <p className="text-muted-foreground">Setting up your wallet connection...</p>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <QrCode className="w-6 h-6" />,
      title: "Instant QR Payments",
      description: "Generate QR codes for instant USDC payments on Solana blockchain"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Secure & Fast",
      description: "Military-grade security with sub-second transaction confirmations"
    },
    {
      icon: <Globe className="w-6 h-6" />,
      title: "Africa-First",
      description: "Built specifically for African businesses and payment needs"
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Real-time Analytics",
      description: "Track payments, customers, and revenue with detailed insights"
    },
    {
      icon: <CreditCard className="w-6 h-6" />,
      title: "Easy Integration",
      description: "Simple APIs and embeddable widgets for any website or app"
    },
    {
      icon: <HeadphonesIcon className="w-6 h-6" />,
      title: "24/7 Support",
      description: "Local support team available in multiple African languages"
    }
  ];

  const pricingPlans = [
    {
      name: "Free",
      price: 0,
      period: "forever",
      description: "Perfect for getting started",
      features: [
        "Up to 50 transactions/month",
        "Basic dashboard",
        "QR code generation",
        "Email support",
        "Standard analytics"
      ],
      transactionFee: "2.9%",
      popular: false,
      cta: "Start Free"
    },
    {
      name: "Starter",
      price: 15,
      period: "month",
      description: "Great for small businesses",
      features: [
        "Up to 1,000 transactions/month",
        "Advanced analytics",
        "Custom QR branding",
        "Priority support",
        "Invoice management",
        "API access"
      ],
      transactionFee: "2.4%",
      popular: true,
      cta: "Start Trial"
    },
    {
      name: "Business",
      price: 49,
      period: "month",
      description: "For growing businesses",
      features: [
        "Up to 10,000 transactions/month",
        "Advanced reporting",
        "White-label options",
        "Multi-user accounts",
        "Dedicated support",
        "Custom integrations"
      ],
      transactionFee: "1.9%",
      popular: false,
      cta: "Start Trial"
    }
  ];

  const testimonials = [
    {
      name: "Amara Okafor",
      role: "CEO, Lagos Electronics",
      location: "Lagos, Nigeria",
      content: "AfriPay transformed our payment process. We now receive payments instantly from customers across Africa.",
      rating: 5,
      avatar: "AO"
    },
    {
      name: "Kwame Asante",
      role: "Founder, Accra Market",
      location: "Accra, Ghana",
      content: "The QR code feature is amazing. Our customers love the quick payment process, and we love the low fees.",
      rating: 5,
      avatar: "KA"
    },
    {
      name: "Fatima Al-Rashid",
      role: "Director, Cairo Tech Hub",
      location: "Cairo, Egypt",
      content: "Finally, a payment solution built for Africa. The analytics help us understand our business better.",
      rating: 5,
      avatar: "FR"
    }
  ];

  const stats = [
    { value: "50K+", label: "Transactions Processed" },
    { value: "1,200+", label: "Active Merchants" },
    { value: "15", label: "African Countries" },
    { value: "99.9%", label: "Uptime Guarantee" }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Debug Section - Remove in production */}
      {process.env.NODE_ENV === 'development' && (
        <div className="bg-yellow-100 border-l-4 border-yellow-500 p-4 m-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-yellow-800">
                Debug: isAuthenticated: {isAuthenticated ? 'true' : 'false'} | isInitialized: {isInitialized ? 'true' : 'false'}
              </p>
              {user && (
                <p className="text-xs text-yellow-700 mt-1">
                  User: {user.name} ({user.email})
                </p>
              )}
            </div>
            {isAuthenticated && (
              <Button
                variant="outline"
                size="sm"
                onClick={logout}
                className="text-yellow-800 border-yellow-400 hover:bg-yellow-200"
              >
                Logout (Test)
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <Alert className="mx-4 mt-4 border-destructive/50 text-destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
      )}

      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary-glow rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">A</span>
              </div>
              <div>
                <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  AfriPay
                </h1>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
              <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
              <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <Button
                variant="ghost"
                onClick={handleGetStarted}
                disabled={isLoading || isLoggingIn}
              >
                <LogIn className="w-4 h-4 mr-2" />
                Sign In
              </Button>
              <Button
                onClick={handleGetStarted}
                className="btn-press"
                disabled={isLoading || isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : !isInitialized ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4 mr-2" />
                    Connect Wallet
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="sm"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 border-t">
              <div className="flex flex-col space-y-4 pt-4">
                <a href="#features" className="text-muted-foreground hover:text-primary transition-colors">Features</a>
                <a href="#pricing" className="text-muted-foreground hover:text-primary transition-colors">Pricing</a>
                <a href="#testimonials" className="text-muted-foreground hover:text-primary transition-colors">Testimonials</a>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">Contact</a>
                <div className="flex flex-col space-y-2 pt-4">
                  <Button
                    variant="ghost"
                    onClick={handleGetStarted}
                    disabled={isLoading || isLoggingIn}
                  >
                    <LogIn className="w-4 h-4 mr-2" />
                    Sign In
                  </Button>
                  <Button
                    onClick={handleGetStarted}
                    className="btn-press"
                    disabled={isLoading || isLoggingIn}
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Connecting...
                      </>
                    ) : !isInitialized ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Initializing...
                      </>
                    ) : (
                      <>
                        <Wallet className="w-4 h-4 mr-2" />
                        Connect Wallet
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center">
          <div className="max-w-4xl mx-auto space-y-8">
            <Badge className="bg-primary/10 text-primary border-primary/20 mb-4">
              🚀 Now Live in 15 African Countries
            </Badge>

            <h1 className="text-4xl md:text-6xl font-bold leading-tight opacity-0 animate-fade-in-up">
              Accept <span className="bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">USDC Payments</span>
              <br />Across Africa
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
              The fastest, most secure way to accept cryptocurrency payments in Africa.
              Built on Solana for instant settlements and ultra-low fees.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up animate-delay-200">
              <Button
                size="lg"
                onClick={handleGetStarted}
                className="btn-press"
                disabled={isLoading || isLoggingIn}
              >
                {isLoggingIn ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting Wallet...
                  </>
                ) : !isInitialized ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Initializing...
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5 mr-2" />
                    Connect & Start Earning
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </>
                )}
              </Button>
              <Button size="lg" variant="outline" onClick={handleWaitlist} className="btn-press">
                Join Waitlist
              </Button>
            </div>

            <div className="flex flex-wrap justify-center gap-8 pt-8 opacity-0 animate-fade-in-up animate-delay-300">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up">
              Everything You Need to Accept Payments
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
              Powerful features designed specifically for African businesses
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card
                key={index}
                className={`card-hover opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <CardHeader>
                  <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center text-primary mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up">
              Simple, Transparent Pricing
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
              No hidden fees. No setup costs. Pay only for what you use.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <Card
                key={index}
                className={`card-hover relative opacity-0 animate-fade-in-up ${plan.popular ? 'ring-2 ring-primary shadow-lg scale-105' : ''
                  }`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-primary text-primary-foreground">
                    Most Popular
                  </Badge>
                )}

                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <p className="text-muted-foreground mt-2">{plan.description}</p>
                  <div className="mt-4">
                    <Badge variant="secondary" className="text-sm">
                      {plan.transactionFee} transaction fee
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-6">
                  <ul className="space-y-3">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center gap-3">
                        <Check className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <Button
                    className={`w-full btn-press ${plan.popular ? '' : 'variant-outline'}`}
                    variant={plan.popular ? 'default' : 'outline'}
                    onClick={handleGetStarted}
                  >
                    {plan.cta}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up">
              Trusted by African Businesses
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
              See what our customers are saying about AfriPay
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card
                key={index}
                className={`card-hover opacity-0 animate-fade-in-up`}
                style={{ animationDelay: `${200 + index * 100}ms` }}
              >
                <CardContent className="p-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-primary text-primary" />
                    ))}
                  </div>

                  <p className="text-muted-foreground mb-6 italic">
                    "{testimonial.content}"
                  </p>

                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-primary font-semibold">
                      {testimonial.avatar}
                    </div>
                    <div>
                      <p className="font-semibold">{testimonial.name}</p>
                      <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {testimonial.location}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto">
          <Card className="bg-gradient-to-r from-primary/10 to-primary-glow/10 border-primary/20 card-hover">
            <CardContent className="p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4 opacity-0 animate-fade-in-up">
                Ready to Transform Your Payments?
              </h2>
              <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto opacity-0 animate-fade-in-up animate-delay-100">
                Join thousands of African businesses already using AfriPay to accept fast, secure cryptocurrency payments.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center opacity-0 animate-fade-in-up animate-delay-200">
                <Button size="lg" onClick={handleGetStarted} className="btn-press">
                  Start Free Today
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  Setup in under 5 minutes
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer id="contact" className="py-12 px-4 border-t bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-glow rounded-lg flex items-center justify-center">
                  <span className="text-primary-foreground font-bold">A</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  AfriPay
                </span>
              </div>
              <p className="text-muted-foreground text-sm">
                The leading cryptocurrency payment solution for African businesses.
              </p>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#pricing" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API Docs</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Integrations</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Community</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Status</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Security</a></li>
              </ul>
            </div>
          </div>

          <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              © 2024 AfriPay. All rights reserved.
            </p>
            <div className="flex items-center gap-4 mt-4 md:mt-0">
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-primary transition-colors">Cookies</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
