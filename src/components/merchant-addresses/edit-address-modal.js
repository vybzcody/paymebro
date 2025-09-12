import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
export function EditAddressModal({ address, isOpen, onClose, onSubmit }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        label: '',
        isDefault: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    useEffect(() => {
        if (address) {
            setFormData({
                label: address.label,
                isDefault: address.is_default
            });
        }
    }, [address]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.label.trim()) {
            toast({
                title: "Missing Label",
                description: "Please provide a label for the address",
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                label: formData.label.trim(),
                is_default: formData.isDefault
            });
        }
        catch (error) {
            // Error is handled by parent component
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const formatAddress = (addr) => {
        return `${addr.slice(0, 6)}...${addr.slice(-6)}`;
    };
    const getNetworkColor = (network) => {
        switch (network) {
            case 'solana':
                return 'text-purple-600';
            case 'ethereum':
                return 'text-blue-600';
            case 'polygon':
                return 'text-indigo-600';
            default:
                return 'text-gray-600';
        }
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: onClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Edit Merchant Address" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "p-3 bg-gray-50 rounded-lg", children: [_jsxs("div", { className: "flex items-center justify-between mb-2", children: [_jsx("span", { className: "text-sm font-medium", children: "Address" }), _jsx("span", { className: `text-sm font-medium capitalize ${getNetworkColor(address.network)}`, children: address.network })] }), _jsx("code", { className: "text-sm font-mono text-gray-600", children: formatAddress(address.address) }), _jsx("p", { className: "text-xs text-gray-500 mt-1", children: "Address cannot be changed" })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "label", children: "Label" }), _jsx(Input, { id: "label", value: formData.label, onChange: (e) => setFormData(prev => ({ ...prev, label: e.target.value })), placeholder: "Main Wallet, Business Account, etc.", required: true })] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "isDefault", children: "Set as default address" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Use this address for new payments by default" })] }), _jsx(Switch, { id: "isDefault", checked: formData.isDefault, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, isDefault: checked })) })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: onClose, className: "flex-1", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "flex-1", children: isSubmitting ? 'Saving...' : 'Save Changes' })] })] })] }) }));
}
