import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, Users, DollarSign, Calendar, Trash2 } from "lucide-react";
import { CreatePlanModal } from "./create-plan-modal";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  amount: number;
  currency: string;
  interval_type: 'monthly' | 'yearly';
  interval_count: number;
  trial_days: number;
  max_subscribers?: number;
  subscriber_count?: number;
  created_at: string;
}

interface SubscriptionManagementProps {
  userId: string;
}

export function SubscriptionManagement({ userId }: SubscriptionManagementProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  useEffect(() => {
    fetchPlans();
  }, [userId]);

  const fetchPlans = async () => {
    try {
      const response = await fetch(`http://localhost:3000/api/subscriptions/plans`, {
        headers: { 'x-user-id': userId }
      });
      const result = await response.json();
      if (result.success) {
        setPlans(result.plans || []);
      }
    } catch (error) {
      console.error('Failed to fetch subscription plans:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const deletePlan = async (planId: string) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    
    try {
      const response = await fetch(`http://localhost:3000/api/subscriptions/plans/${planId}`, {
        method: 'DELETE',
        headers: { 'x-user-id': userId }
      });
      if (response.ok) {
        fetchPlans(); // Refresh list
      }
    } catch (error) {
      console.error('Failed to delete plan:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Subscription Plans</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-24 bg-gray-200 rounded"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Subscription Plans
          </CardTitle>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Plan
          </Button>
        </CardHeader>
        <CardContent>
          {plans.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="mb-2">No subscription plans yet</p>
              <p className="text-sm">Create your first recurring payment plan</p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <Card key={plan.id} className="relative">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <p className="text-sm text-gray-600 mt-1">{plan.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePlan(plan.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-green-600">
                          {plan.amount} {plan.currency}
                        </span>
                        <Badge variant="outline">
                          {plan.interval_type}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          <span>{plan.subscriber_count || 0} subscribers</span>
                        </div>
                        {plan.trial_days > 0 && (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-4 w-4" />
                            <span>{plan.trial_days}d trial</span>
                          </div>
                        )}
                      </div>

                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-500">
                          Created {new Date(plan.created_at).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <CreatePlanModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={fetchPlans}
        userId={userId}
      />
    </div>
  );
}
