import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, RefreshCw, DollarSign } from 'lucide-react';
import { subscriptionsApi, SubscriptionPlan, CreatePlanRequest } from '@/lib/api/subscriptions';
import { useToast } from '@/hooks/use-toast';

interface SubscriptionManagementProps {
  userId: string;
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  const fetchPlans = async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const fetchedPlans = await subscriptionsApi.getPlans(userId);
      setPlans(fetchedPlans);
    } catch (error) {
      console.error('Failed to fetch plans:', error);
      toast({
        title: "Error",
        description: "Failed to fetch subscription plans",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleCreatePlan = async () => {
    if (!newPlan.name.trim() || !newPlan.amount.trim()) {
      toast({
        title: "Validation Error",
        description: "Plan name and amount are required",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(newPlan.amount) <= 0) {
      toast({
        title: "Validation Error",
        description: "Amount must be greater than 0",
        variant: "destructive",
      });
      return;
    }

    setCreating(true);
    try {
      await subscriptionsApi.createPlan(newPlan, userId);
      toast({
        title: "Plan Created",
        description: `${newPlan.name} plan created successfully`,
      });
      resetForm();
      fetchPlans(true);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create subscription plan",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const resetForm = () => {
    setNewPlan({
      name: '',
      amount: '',
      currency: 'USDC',
      interval_type: 'monthly',
      interval_count: 1,
      description: '',
    });
    setShowCreateForm(false);
  };

  useEffect(() => {
    fetchPlans();
  }, [userId]);

  const LoadingSkeleton = () => (
    <div className="grid gap-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center justify-between p-4 border rounded-lg">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-6 w-16" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Subscription Plans
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={() => fetchPlans(true)} 
                disabled={refreshing}
                variant="outline" 
                size="sm"
              >
                <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              </Button>
              <Button onClick={() => setShowCreateForm(!showCreateForm)} size="sm">
                <Plus className="h-4 w-4 mr-1" />
                {showCreateForm ? 'Cancel' : 'Create Plan'}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {showCreateForm && (
            <div className="mb-6 p-4 border rounded-lg space-y-4 bg-muted/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Plan Name *</Label>
                  <Input
                    id="name"
                    value={newPlan.name}
                    onChange={(e) => setNewPlan({ ...newPlan, name: e.target.value })}
                    placeholder="Premium Plan"
                  />
                </div>
                <div>
                  <Label htmlFor="amount">Amount *</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={newPlan.amount}
                    onChange={(e) => setNewPlan({ ...newPlan, amount: e.target.value })}
                    placeholder="9.99"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

              <div className="flex gap-2">
                <Button onClick={handleCreatePlan} disabled={creating} className="flex-1">
                  {creating ? 'Creating...' : 'Create Plan'}
                </Button>
                <Button onClick={resetForm} variant="outline">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {loading ? (
            <LoadingSkeleton />
          ) : plans.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No subscription plans created yet</p>
              <Button onClick={() => setShowCreateForm(true)} variant="outline">
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Plan
              </Button>
            </div>
          ) : (
            <div className="grid gap-4">
              {plans.map((plan) => (
                <div key={plan.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div>
                    <h3 className="font-medium">{plan.name}</h3>
                    <p className="text-sm text-muted-foreground">{plan.description}</p>
                    <p className="text-sm font-medium mt-1">
                      {plan.amount} {plan.currency} / {plan.interval_type}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Created: {new Date(plan.created_at).toLocaleDateString()}
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
