import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Crown, Zap } from 'lucide-react';
import { plansApi } from '@/lib/api/plans';
import { useToast } from '@/hooks/use-toast';
export function PlanUsageWidget({ userId, onUpgrade }) {
    const [usage, setUsage] = useState(null);
    const [loading, setLoading] = useState(true);
    const { toast } = useToast();
    useEffect(() => {
        const fetchUsage = async () => {
            try {
                const planUsage = await plansApi.getPlanUsage(userId);
                setUsage(planUsage);
            }
            catch (error) {
                console.error('Failed to fetch plan usage:', error);
                toast({
                    title: "Error",
                    description: "Failed to load plan usage",
                    variant: "destructive",
                });
            }
            finally {
                setLoading(false);
            }
        };
        if (userId) {
            fetchUsage();
        }
    }, [userId, toast]);
    if (loading) {
        return (_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Crown, { className: "h-5 w-5" }), "Plan Usage"] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "animate-pulse space-y-3", children: [_jsx("div", { className: "h-4 bg-gray-200 rounded w-3/4" }), _jsx("div", { className: "h-2 bg-gray-200 rounded" }), _jsx("div", { className: "h-8 bg-gray-200 rounded w-1/2" })] }) })] }));
    }
    if (!usage) {
        return null;
    }
    const isUnlimited = usage.monthlyLimit === 'unlimited';
    const isNearLimit = !isUnlimited && usage.percentage > 80;
    const isAtLimit = !usage.canCreatePayment;
    const getPlanBadgeColor = (plan) => {
        switch (plan.toLowerCase()) {
            case 'free': return 'secondary';
            case 'basic': return 'default';
            case 'premium': return 'default';
            case 'enterprise': return 'default';
            default: return 'secondary';
        }
    };
    return (_jsxs(Card, { className: isAtLimit ? 'border-red-200 bg-red-50' : isNearLimit ? 'border-yellow-200 bg-yellow-50' : '', children: [_jsxs(CardHeader, { children: [_jsxs(CardTitle, { className: "flex items-center justify-between", children: [_jsxs("div", { className: "flex items-center gap-2", children: [_jsx(Crown, { className: "h-5 w-5" }), "Plan Usage"] }), _jsx(Badge, { variant: getPlanBadgeColor(usage.currentPlan), children: usage.currentPlan.charAt(0).toUpperCase() + usage.currentPlan.slice(1) })] }), _jsx(CardDescription, { children: isUnlimited
                            ? 'Unlimited payments this month'
                            : `${usage.monthlyUsage} of ${usage.monthlyLimit} payments used this month` })] }), _jsxs(CardContent, { className: "space-y-4", children: [!isUnlimited && (_jsxs("div", { className: "space-y-2", children: [_jsxs("div", { className: "flex justify-between text-sm", children: [_jsx("span", { children: "Usage" }), _jsxs("span", { children: [usage.percentage.toFixed(1), "%"] })] }), _jsx(Progress, { value: usage.percentage, className: `h-2 ${isAtLimit ? 'bg-red-100' : isNearLimit ? 'bg-yellow-100' : ''}` }), _jsxs("div", { className: "flex justify-between text-xs text-muted-foreground", children: [_jsxs("span", { children: [usage.monthlyUsage, " used"] }), _jsxs("span", { children: [usage.remaining, " remaining"] })] })] })), isAtLimit && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-red-100 border border-red-200 rounded-lg", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-red-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-red-800", children: "Payment limit reached" }), _jsx("p", { className: "text-xs text-red-600", children: "Upgrade your plan to create more payments" })] })] })), isNearLimit && !isAtLimit && (_jsxs("div", { className: "flex items-center gap-2 p-3 bg-yellow-100 border border-yellow-200 rounded-lg", children: [_jsx(AlertTriangle, { className: "h-4 w-4 text-yellow-600" }), _jsxs("div", { className: "flex-1", children: [_jsx("p", { className: "text-sm font-medium text-yellow-800", children: "Approaching limit" }), _jsx("p", { className: "text-xs text-yellow-600", children: "Consider upgrading to avoid interruption" })] })] })), (isAtLimit || isNearLimit) && usage.currentPlan !== 'enterprise' && (_jsxs(Button, { onClick: onUpgrade, className: "w-full", variant: isAtLimit ? "default" : "outline", children: [_jsx(Zap, { className: "h-4 w-4 mr-2" }), "Upgrade Plan"] })), usage.currentPlan === 'free' && !isAtLimit && !isNearLimit && (_jsxs(Button, { onClick: onUpgrade, variant: "outline", className: "w-full", children: [_jsx(Crown, { className: "h-4 w-4 mr-2" }), "Upgrade for More Payments"] }))] })] }));
}
