import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState, useEffect } from "react";
import { Plus, Users, Calendar, Trash2 } from "lucide-react";
import { CreatePlanModal } from "./create-plan-modal";
import { appConfig, getApiHeaders } from "@/lib/config";
export function SubscriptionManagement({ userId }) {
    const [plans, setPlans] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    useEffect(() => {
        fetchPlans();
    }, [userId]);
    const fetchPlans = async () => {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans`, {
                headers: getApiHeaders(userId)
            });
            const result = await response.json();
            if (result.success) {
                setPlans(result.plans || []);
            }
        }
        catch (error) {
            console.error('Failed to fetch subscription plans:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const deletePlan = async (planId) => {
        if (!confirm('Are you sure you want to delete this plan?'))
            return;
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans/${planId}`, {
                method: 'DELETE',
                headers: getApiHeaders(userId)
            });
            if (response.ok) {
                fetchPlans(); // Refresh list
            }
        }
        catch (error) {
            console.error('Failed to delete plan:', error);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Subscription Plans" }) }), _jsx(CardContent, { children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(3)].map((_, i) => (_jsx("div", { className: "h-24 bg-gray-200 rounded" }, i))) }) })] }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsxs(CardHeader, { className: "flex flex-row items-center justify-between", children: [_jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Calendar, { className: "h-5 w-5" }), "Subscription Plans"] }), _jsxs(Button, { onClick: () => setIsCreateModalOpen(true), children: [_jsx(Plus, { className: "h-4 w-4 mr-2" }), "Create Plan"] })] }), _jsx(CardContent, { children: plans.length === 0 ? (_jsxs("div", { className: "text-center py-8 text-gray-500", children: [_jsx(Calendar, { className: "h-12 w-12 mx-auto mb-4 opacity-50" }), _jsx("p", { className: "mb-2", children: "No subscription plans yet" }), _jsx("p", { className: "text-sm", children: "Create your first recurring payment plan" })] })) : (_jsx("div", { className: "grid gap-4 md:grid-cols-2 lg:grid-cols-3", children: plans.map((plan) => (_jsxs(Card, { className: "relative", children: [_jsx(CardHeader, { children: _jsxs("div", { className: "flex items-start justify-between", children: [_jsxs("div", { children: [_jsx(CardTitle, { className: "text-lg", children: plan.name }), _jsx("p", { className: "text-sm text-gray-600 mt-1", children: plan.description })] }), _jsx(Button, { variant: "ghost", size: "sm", onClick: () => deletePlan(plan.id), className: "text-red-600 hover:text-red-700", children: _jsx(Trash2, { className: "h-4 w-4" }) })] }) }), _jsx(CardContent, { children: _jsxs("div", { className: "space-y-3", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("span", { className: "text-2xl font-bold text-green-600", children: [plan.amount, " ", plan.currency] }), _jsx(Badge, { variant: "outline", children: plan.interval_type })] }), _jsxs("div", { className: "flex items-center gap-4 text-sm text-gray-600", children: [_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Users, { className: "h-4 w-4" }), _jsxs("span", { children: [plan.subscriber_count || 0, " subscribers"] })] }), plan.trial_days > 0 && (_jsxs("div", { className: "flex items-center gap-1", children: [_jsx(Calendar, { className: "h-4 w-4" }), _jsxs("span", { children: [plan.trial_days, "d trial"] })] }))] }), _jsx("div", { className: "pt-2 border-t", children: _jsxs("p", { className: "text-xs text-gray-500", children: ["Created ", new Date(plan.created_at).toLocaleDateString()] }) })] }) })] }, plan.id))) })) })] }), _jsx(CreatePlanModal, { isOpen: isCreateModalOpen, onClose: () => setIsCreateModalOpen(false), onSuccess: fetchPlans, userId: userId })] }));
}
