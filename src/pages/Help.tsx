import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Layout } from "@/components/Layout";
import {
  MessageCircle,
  Mail,
  Phone,
  Book,
  Video,
  FileText,
  Search,
  ExternalLink,
  Clock,
  CheckCircle
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const Help = () => {
  const { toast } = useToast();

  const handleSubmitTicket = () => {
    toast({
      title: "Support Ticket Submitted",
      description: "We'll get back to you within 24 hours",
    });
  };

  const faqs = [
    {
      question: "How do I set up my first payment?",
      answer: "To set up your first payment, go to the Dashboard and use the QR Generator. Enter the amount you want to charge, and a QR code will be generated that customers can scan to pay with USDC on Solana."
    },
    {
      question: "What cryptocurrencies do you support?",
      answer: "Currently, we support USDC (USD Coin) on the Solana blockchain. We're working on adding support for more cryptocurrencies including SOL, USDT, and other SPL tokens."
    },
    {
      question: "How long do transactions take to confirm?",
      answer: "Solana transactions typically confirm within 1-2 seconds. However, during network congestion, it may take up to 30 seconds. You'll receive real-time notifications when payments are confirmed."
    },
    {
      question: "What are your transaction fees?",
      answer: "We charge a flat 1.5% fee on all successful transactions. Solana network fees (usually less than $0.01) are separate and paid by the sender."
    },
    {
      question: "How do I withdraw my funds?",
      answer: "Funds are automatically deposited to your connected Solana wallet. You can then transfer them to any exchange or convert them to your local currency through supported partners."
    },
    {
      question: "Is my wallet secure?",
      answer: "Yes, we use industry-standard security practices. Your private keys are never stored on our servers, and all transactions are secured by the Solana blockchain's cryptographic security."
    },
    {
      question: "Can I integrate AfriPay into my website?",
      answer: "Yes! We provide easy-to-use APIs and embeddable payment buttons. Check our documentation for integration guides and code examples."
    },
    {
      question: "What countries do you support?",
      answer: "We currently support businesses across Africa, with a focus on Nigeria, Kenya, Ghana, and South Africa. We're expanding to more countries regularly."
    }
  ];

  const resources = [
    {
      title: "Getting Started Guide",
      description: "Complete setup guide for new merchants",
      icon: <Book className="w-5 h-5" />,
      type: "Documentation"
    },
    {
      title: "API Documentation",
      description: "Technical documentation for developers",
      icon: <FileText className="w-5 h-5" />,
      type: "API"
    },
    {
      title: "Video Tutorials",
      description: "Step-by-step video guides",
      icon: <Video className="w-5 h-5" />,
      type: "Video"
    },
    {
      title: "Integration Examples",
      description: "Code samples and implementation guides",
      icon: <FileText className="w-5 h-5" />,
      type: "Code"
    }
  ];

  return (
    <Layout>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="text-center space-y-2 opacity-0 animate-fade-in-down">
          <h1 className="text-3xl font-bold">Help & Support</h1>
          <p className="text-muted-foreground">Get help with AfriPay and find answers to common questions</p>
        </div>

        {/* Search */}
        <div className="opacity-0 animate-fade-in-up animate-delay-100">
          <Card className="border-0 shadow-sm card-hover">
            <CardContent className="pt-6">
              <div className="relative max-w-md mx-auto">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Search for help articles..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible className="w-full">
                  {faqs.map((faq, index) => (
                    <AccordionItem key={index} value={`item-${index}`}>
                      <AccordionTrigger className="text-left">
                        {faq.question}
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground">
                        {faq.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>

            {/* Contact Form */}
            <Card>
              <CardHeader>
                <CardTitle>Submit a Support Ticket</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Subject</label>
                    <Input placeholder="Brief description of your issue" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Priority</label>
                    <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                      <option>Low</option>
                      <option>Medium</option>
                      <option>High</option>
                      <option>Urgent</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary">
                    <option>General Question</option>
                    <option>Technical Issue</option>
                    <option>Payment Problem</option>
                    <option>Account Issue</option>
                    <option>API Integration</option>
                    <option>Billing Question</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Please provide detailed information about your issue..."
                    rows={5}
                  />
                </div>
                <Button onClick={handleSubmitTicket} className="w-full">
                  Submit Ticket
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Options */}
            <Card>
              <CardHeader>
                <CardTitle>Contact Us</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <MessageCircle className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Live Chat</p>
                    <p className="text-sm text-muted-foreground">Available 24/7</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Mail className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Email Support</p>
                    <p className="text-sm text-muted-foreground">support@afripay.com</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                  <Phone className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-medium">Phone Support</p>
                    <p className="text-sm text-muted-foreground">+234 800 AFRIPAY</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Support Hours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Support Hours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm">Monday - Friday</span>
                  <span className="text-sm font-medium">9:00 AM - 6:00 PM WAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Saturday</span>
                  <span className="text-sm font-medium">10:00 AM - 4:00 PM WAT</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm">Sunday</span>
                  <span className="text-sm font-medium">Closed</span>
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  <span className="text-sm text-primary">Currently Online</span>
                </div>
              </CardContent>
            </Card>

            {/* Resources */}
            <Card>
              <CardHeader>
                <CardTitle>Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {resources.map((resource, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50 cursor-pointer">
                    {resource.icon}
                    <div className="flex-1">
                      <p className="font-medium text-sm">{resource.title}</p>
                      <p className="text-xs text-muted-foreground">{resource.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="text-xs">{resource.type}</Badge>
                      <ExternalLink className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Status */}
            <Card>
              <CardHeader>
                <CardTitle>System Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Payment Processing</span>
                  <Badge className="bg-primary/10 text-primary">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">API Services</span>
                  <Badge className="bg-primary/10 text-primary">Operational</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Solana Network</span>
                  <Badge className="bg-primary/10 text-primary">Operational</Badge>
                </div>
                <Button variant="outline" className="w-full mt-3">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View Status Page
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Help;
