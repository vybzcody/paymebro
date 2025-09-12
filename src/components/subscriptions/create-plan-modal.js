import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { appConfig, getApiHeaders } from "@/lib/config";
export function CreatePlanModal({ isOpen, onClose, onSuccess, userId }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        amount: '',
        currency: 'USDC',
        intervalType: 'monthly',
        intervalCount: '1',
        trialDays: '0',
        maxSubscribers: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.name || !formData.amount) {
            toast({
                title: "Missing Fields",
                description: "Please fill in name and amount",
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/subscriptions/plans`, {
                method: 'POST',
                headers: getApiHeaders(userId),
                body: JSON.stringify({
                    name: formData.name,
                    description: formData.description,
                    amount: parseFloat(formData.amount),
                    currency: formData.currency,
                    intervalType: formData.intervalType,
                    intervalCount: parseInt(formData.intervalCount),
                    trialDays: parseInt(formData.trialDays),
                    maxSubscribers: formData.maxSubscribers ? parseInt(formData.maxSubscribers) : null
                })
            });
            const result = await response.json();
            if (response.ok) {
                toast({
                    title: "Plan Created!",
                    description: `${formData.name} subscription plan created successfully`
                });
                onSuccess();
                onClose();
                setFormData({
                    name: '',
                    description: '',
                    amount: '',
                    currency: 'USDC',
                    intervalType: 'monthly',
                    intervalCount: '1',
                    trialDays: '0',
                    maxSubscribers: ''
                });
            }
            else {
                toast({
                    title: "Creation Failed",
                    description: result.error || "Failed to create subscription plan",
                    variant: "destructive"
                });
            }
        }
        catch (error) {
            console.error('Failed to create plan:', error);
            toast({
                title: "Creation Failed",
                description: "Network error. Please try again.",
                variant: "destructive"
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Subscription Plan" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "name", children: "Plan Name" }), _jsx(Input, { id: "name", value: formData.name, onChange: (e) => setFormData(prev => ({ ...prev, name: e.target.value })), placeholder: "Premium Plan", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "description", children: "Description" }), _jsx(Textarea, { id: "description", value: formData.description, onChange: (e) => setFormData(prev => ({ ...prev, description: e.target.value })), placeholder: "Access to premium features", rows: 3 })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", value: formData.amount, onChange: (e) => setFormData(prev => ({ ...prev, amount: e.target.value })), placeholder: "9.99", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData(prev => ({ ...prev, currency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USDC", children: "USDC" }), _jsx(SelectItem, { value: "SOL", children: "SOL" })] })] })] })] }), _jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "intervalType", children: "Billing Period" }), _jsxs(Select, { value: formData.intervalType, onValueChange: (value) => setFormData(prev => ({ ...prev, intervalType: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "monthly", children: "Monthly" }), _jsx(SelectItem, { value: "yearly", children: "Yearly" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "trialDays", children: "Trial Days" }), _jsx(Input, { id: "trialDays", type: "number", value: formData.trialDays, onChange: (e) => setFormData(prev => ({ ...prev, trialDays: e.target.value })), placeholder: "0" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "maxSubscribers", children: "Max Subscribers (optional)" }), _jsx(Input, { id: "maxSubscribers", type: "number", value: formData.maxSubscribers, onChange: (e) => setFormData(prev => ({ ...prev, maxSubscribers: e.target.value })), placeholder: "Unlimited" })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, className: "flex-1", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "flex-1", children: isSubmitting ? 'Creating...' : 'Create Plan' })] })] })] }) }));
}
