import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { plansApi, type PlanUsage } from '@/lib/api/plans';
import { useToast } from '@/hooks/use-toast';

interface PlanUsageWidgetProps {
    userId: string;
    onUpgrade?: () => void;
}

export function PlanUsageWidget({ userId, onUpgrade }: PlanUsageWidgetProps) {
    const [usage, setUsage] = useState<PlanUsage | null>(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();

    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const planUsage = await plansApi.getPlanUsage(userId);
                setUsage(planUsage);
            } catch (error) {
                console.error('Failed to fetch plan usage:', error);
                toast({
                    title: "Error",
                    description: "Failed to load plan usage",
                    variant: "destructive",
                });
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchUsage();
        }
    }, [userId, toast]);

    if (loading) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        Plan Usage
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="animate-pulse space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-2 bg-gray-200 rounded"></div>
                        <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!usage) {
        return null;
    }

    const isUnlimited = usage.monthlyLimit === 'unlimited';
    const isNearLimit = !isUnlimited && usage.percentage > 80;
    const isAtLimit = !usage.canCreatePayment;

    const getPlanBadgeColor = (plan: string) => {
        switch (plan.toLowerCase()) {
            case 'free': return 'secondary';
            case 'basic': return 'default';
            case 'premium': return 'default';
            case 'enterprise': return 'default';
            default: return 'secondary';
        }
    };

    return (
        <Card className={isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : ''}>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Crown className="h-5 w-5" />
                        Plan Usage
                    </div>
                    <Badge variant={getPlanBadgeColor(usage.currentPlan)}>
                        {usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1)}
                    </Badge>
                </CardTitle>
                <CardDescription>
                    {isUnlimited
                        ? 'Unlimited payments this month'
                        : `${usage.monthlyUsage} of ${usage.monthlyLimit} payments used this month`
                    }
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isUnlimited && (
                    <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span>Usage</span>
                            <span>{usage.percentage.toFixed(1)}%</span>
                        </div>
                        <Progress
                            value={usage.percentage}
                            className={`h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}`}
                        />
                        <div className="flex justify-between text-xs text-muted-foreground">
                            <span>{usage.monthlyUsage} used</span>
                            <span>{usage.remaining} remaining</span>
                        </div>
                    </div>
                )}

                {isAtLimit && (
                    <div className="flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-red-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-red-800">Payment limit reached</p>
                            <p className="text-xs text-red-600">Upgrade your plan to create more payments</p>
                        </div>
                    </div>
                )}

                {isNearLimit && !isAtLimit && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-100 border border-yellow-200 rounded-lg">
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-yellow-800">Approaching limit</p>
                            <p className="text-xs text-yellow-600">Consider upgrading to avoid interruption</p>
                        </div>
                    </div>
                )}

                {(isAtLimit || isNearLimit) && usage.currentPlan !== 'enterprise' && (
                    <Button
                        onClick={onUpgrade}
                        className="w-full"
                        variant={isAtLimit ? "default" : "outline"}
                    >
                        <Zap className="h-4 w-4 mr-2" />
                        Upgrade Plan
                    </Button>
                )}

                {usage.currentPlan === 'free' && !isAtLimit && !isNearLimit && (
                    <Button
                        onClick={onUpgrade}
                        variant="outline"
                        className="w-full"
                    >
                        <Crown className="h-4 w-4 mr-2" />
                        Upgrade for More Payments
                    </Button>
                )}
            </CardContent>
        </Card>
    );
}