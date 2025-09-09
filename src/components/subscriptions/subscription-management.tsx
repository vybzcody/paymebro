import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { subscriptionsApi, SubscriptionPlan, CreatePlanRequest } from '@/lib/api/subscriptions';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionManagementProps {
  userId: string;
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const { toast } = useToast();

  const [newPlan, setNewPlan] = useState<CreatePlanRequest>({
    name: '',
    amount: '',
    currency: 'USDC',
    interval_type: 'monthly',
    interval_count: 1,
    description: '',
  });

  const fetchPlans = async () => {
    try {
      const fetchedPlans = await subscriptionsApi.getPlans(userId);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name || !newPlan.amount) {
      toast({
        title: "Error",
        description: "Name and amount are required",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await subscriptionsApi.createPlan(newPlan, userId);
      toast({
        title: "Plan Created",
        description: "Subscription plan created successfully",
      });
      setNewPlan({
        name: '',
        amount: '',
        currency: 'USDC',
        interval_type: 'monthly',
        interval_count: 1,
        description: '',
      });
      setShowCreateForm(false);
      fetchPlans();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create plan",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, [userId]);

  if (loading) {
    return <div>Loading subscription plans...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            Subscription Plans
            <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
              {showCreateForm ? 'Cancel' : 'Create Plan'}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name</Label>
                  <Input
                    id="name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Premium Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={newPlan.amount}
                    onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                    placeholder="9.99"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="currency">Currency</Label>
                  <Select value={newPlan.currency} onValueChange={(value) => setNewPlan({ ...newPlan, currency: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USDC">USDC</SelectItem>
                      <SelectItem value="SOL">SOL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="interval">Billing Interval</Label>
                  <Select value={newPlan.interval_type} onValueChange={(value: 'monthly' | 'yearly') => setNewPlan({ ...newPlan, interval_type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Plan description..."
                />
              </div>

              <Button onClick={handleCreatePlan} disabled={creating} className="w-full">
                {creating ? 'Creating...' : 'Create Plan'}
              </Button>
            </div>
          )}

          {plans.length === 0 ? (
            <p className="text-muted-foreground">No subscription plans created yet</p>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-sm">
                      {plan.amount} {plan.currency} / {plan.interval_type}
                    </p>
                  </div>
                  <Badge variant="secondary">Active</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
