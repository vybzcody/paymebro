import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { User, Bell, Wallet, Save } from "lucide-react";
import { appConfig, getApiHeaders } from "@/lib/config";
export function SettingsManagement({ userId }) {
    const [profile, setProfile] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [notifications, setNotifications] = useState({
        paymentConfirmations: true,
        invoiceReminders: true,
        subscriptionUpdates: true
    });
    useEffect(() => {
        fetchProfile();
    }, [userId]);
    const fetchProfile = async () => {
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/users/profile/${userId}`, {
                headers: getApiHeaders(userId)
            });
            const result = await response.json();
            if (result.success) {
                setProfile(result.user);
            }
        }
        catch (error) {
            console.error('Failed to fetch profile:', error);
        }
        finally {
            setIsLoading(false);
        }
    };
    const saveProfile = async () => {
        if (!profile)
            return;
        setIsSaving(true);
        try {
            const response = await fetch(`${appConfig.apiUrl}/api/users/profile/${userId}`, {
                method: 'PUT',
                headers: getApiHeaders(userId),
                body: JSON.stringify({
                    businessName: profile.businessName,
                    businessType: profile.businessType
                })
            });
            if (response.ok) {
                // Success feedback could be added here
            }
        }
        catch (error) {
            console.error('Failed to save profile:', error);
        }
        finally {
            setIsSaving(false);
        }
    };
    if (isLoading) {
        return (_jsx("div", { className: "space-y-6", children: _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsx(CardTitle, { children: "Settings" }) }), _jsx(CardContent, { children: _jsx("div", { className: "animate-pulse space-y-4", children: [...Array(4)].map((_, i) => (_jsx("div", { className: "h-16 bg-gray-200 rounded" }, i))) }) })] }) }));
    }
    if (!profile) {
        return (_jsx(Card, { children: _jsx(CardContent, { className: "text-center py-8", children: _jsx("p", { className: "text-gray-500", children: "Unable to load profile settings" }) }) }));
    }
    return (_jsxs("div", { className: "space-y-6", children: [_jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(User, { className: "h-5 w-5" }), "Profile Settings"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-1 md:grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "email", children: "Email" }), _jsx(Input, { id: "email", value: profile.email, disabled: true, className: "bg-gray-50" }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Email cannot be changed" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "businessName", children: "Business Name" }), _jsx(Input, { id: "businessName", value: profile.businessName || '', onChange: (e) => setProfile(prev => prev ? { ...prev, businessName: e.target.value } : null), placeholder: "Your Business Name" })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "businessType", children: "Business Type" }), _jsx(Input, { id: "businessType", value: profile.businessType || '', onChange: (e) => setProfile(prev => prev ? { ...prev, businessType: e.target.value } : null), placeholder: "e.g., E-commerce, Services, SaaS" })] }), _jsxs(Button, { onClick: saveProfile, disabled: isSaving, className: "w-full md:w-auto", children: [_jsx(Save, { className: "h-4 w-4 mr-2" }), isSaving ? 'Saving...' : 'Save Profile'] })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Wallet, { className: "h-5 w-5" }), "Wallet Addresses"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "solanaAddress", children: "Solana Address" }), _jsx(Input, { id: "solanaAddress", value: profile.solanaAddress || '', disabled: true, className: "bg-gray-50 font-mono text-sm" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "ethereumAddress", children: "Ethereum Address" }), _jsx(Input, { id: "ethereumAddress", value: profile.ethereumAddress || '', disabled: true, className: "bg-gray-50 font-mono text-sm" })] }), _jsx("p", { className: "text-xs text-gray-500", children: "Wallet addresses are set during registration and cannot be changed" })] })] }), _jsxs(Card, { children: [_jsx(CardHeader, { children: _jsxs(CardTitle, { className: "flex items-center gap-2", children: [_jsx(Bell, { className: "h-5 w-5" }), "Notification Preferences"] }) }), _jsxs(CardContent, { className: "space-y-4", children: [_jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "paymentConfirmations", children: "Payment Confirmations" }), _jsx("p", { className: "text-sm text-gray-500", children: "Get notified when payments are confirmed" })] }), _jsx(Switch, { id: "paymentConfirmations", checked: notifications.paymentConfirmations, onCheckedChange: (checked) => setNotifications(prev => ({ ...prev, paymentConfirmations: checked })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "invoiceReminders", children: "Invoice Reminders" }), _jsx("p", { className: "text-sm text-gray-500", children: "Send reminders for unpaid invoices" })] }), _jsx(Switch, { id: "invoiceReminders", checked: notifications.invoiceReminders, onCheckedChange: (checked) => setNotifications(prev => ({ ...prev, invoiceReminders: checked })) })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "subscriptionUpdates", children: "Subscription Updates" }), _jsx("p", { className: "text-sm text-gray-500", children: "Get notified about subscription changes" })] }), _jsx(Switch, { id: "subscriptionUpdates", checked: notifications.subscriptionUpdates, onCheckedChange: (checked) => setNotifications(prev => ({ ...prev, subscriptionUpdates: checked })) })] })] })] })] }));
}
