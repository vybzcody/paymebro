import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coffee, Utensils, Briefcase, Zap } from "lucide-react";
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const templates = [
  { id: 'coffee', name: 'Coffee', amount: 5, currency: 'USDC', icon: Coffee, color: 'bg-amber-500' },
  { id: 'lunch', name: 'Lunch', amount: 15, currency: 'USDC', icon: Utensils, color: 'bg-green-500' },
  { id: 'consulting', name: 'Consulting/hr', amount: 100, currency: 'USDC', icon: Briefcase, color: 'bg-blue-500' },
  { id: 'tip', name: 'Tip', amount: 2, currency: 'USDC', icon: Zap, color: 'bg-purple-500' },
];

export const PaymentTemplates = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState<string | null>(null);

  const createQuickPayment = async (template: typeof templates[0]) => {
    if (!user?.userId && !user?.id?.match(/^[0-9a-f-]{36}$/i)) {
      toast.error('Please log in to create payments');
      return;
    }

    setLoading(template.id);
    try {
      const response = await fetch(`${import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'}/api/qr/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          walletAddress: user.walletAddress || 'demo-wallet',
          title: template.name,
          amount: template.amount,
          currency: template.currency
        })
      });

      if (!response.ok) throw new Error('Failed to create payment');
      
      const data = await response.json();
      toast.success(`${template.name} payment created!`, {
        description: `${template.amount} ${template.currency} - Ready to share`
      });
      
      // Copy payment URL to clipboard
      navigator.clipboard.writeText(data.payment_url);
      toast.success('Payment link copied to clipboard!');
      
    } catch (error) {
      toast.error('Failed to create payment');
    } finally {
      setLoading(null);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Zap className="h-5 w-5 mr-2" />
          Quick Payment Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {templates.map((template) => (
            <Button
              key={template.id}
              variant="outline"
              className="h-20 flex-col space-y-2"
              onClick={() => createQuickPayment(template)}
              disabled={loading === template.id}
            >
              <div className={`p-2 rounded-full ${template.color} text-white`}>
                <template.icon className="h-4 w-4" />
              </div>
              <div className="text-center">
                <div className="font-medium text-xs">{template.name}</div>
                <div className="text-xs text-gray-500">${template.amount}</div>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
