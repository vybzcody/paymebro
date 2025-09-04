import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Copy, ExternalLink, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface PaymentLink {
  id: string;
  title: string;
  amount: number;
  currency: string;
  url: string;
  created: string;
  clicks: number;
  conversions: number;
}

export const PaymentLinks = () => {
  const [links, setLinks] = useState<PaymentLink[]>([
    {
      id: '1',
      title: 'Product Purchase',
      amount: 99.99,
      currency: 'USDC',
      url: 'https://afripay.com/pay/abc123',
      created: '2024-01-15',
      clicks: 45,
      conversions: 12
    }
  ]);

  const [newLink, setNewLink] = useState({
    title: '',
    amount: '',
    currency: 'USDC'
  });

  const generateLink = () => {
    if (!newLink.title || !newLink.amount) {
      toast.error('Please fill all fields');
      return;
    }

    const link: PaymentLink = {
      id: Date.now().toString(),
      title: newLink.title,
      amount: parseFloat(newLink.amount),
      currency: newLink.currency,
      url: `https://afripay.com/pay/${Math.random().toString(36).substr(2, 9)}`,
      created: new Date().toISOString().split('T')[0],
      clicks: 0,
      conversions: 0
    };

    setLinks([link, ...links]);
    setNewLink({ title: '', amount: '', currency: 'USDC' });
    toast.success('Payment link created!');
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast.success('Link copied to clipboard!');
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            Create Payment Link
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="title">Product/Service Title</Label>
              <Input
                id="title"
                placeholder="e.g., Premium Subscription"
                value={newLink.title}
                onChange={(e) => setNewLink({ ...newLink, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                placeholder="0.00"
                value={newLink.amount}
                onChange={(e) => setNewLink({ ...newLink, amount: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="currency">Currency</Label>
              <Select value={newLink.currency} onValueChange={(value) => setNewLink({ ...newLink, currency: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USDC">USDC</SelectItem>
                  <SelectItem value="SOL">SOL</SelectItem>
                  <SelectItem value="USDT">USDT</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button onClick={generateLink} className="w-full">
            Generate Payment Link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Your Payment Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {links.map((link) => (
              <div key={link.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h3 className="font-medium">{link.title}</h3>
                  <p className="text-sm text-muted-foreground">
                    {link.amount} {link.currency} • Created {link.created}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {link.clicks} clicks • {link.conversions} conversions
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => copyLink(link.url)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.open(link.url, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
