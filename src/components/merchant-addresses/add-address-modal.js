import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { merchantAddressesApi } from "@/lib/api/merchant-addresses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
export function AddAddressModal({ isOpen, onClose, onSubmit }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        address: '',
        label: '',
        network: 'solana',
        isDefault: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [validationError, setValidationError] = useState(null);
    const validateAddress = async (address, network) => {
        if (!address.trim()) {
            setValidationError(null);
            return;
        }
        try {
            const result = await merchantAddressesApi.validateAddress(address, network);
            if (!result.valid) {
                setValidationError(result.error || 'Invalid address format');
            }
            else {
                setValidationError(null);
            }
        }
        catch (error) {
            setValidationError('Failed to validate address');
        }
    };
    const handleAddressChange = (address) => {
        setFormData(prev => ({ ...prev, address }));
        validateAddress(address, formData.network);
    };
    const handleNetworkChange = (network) => {
        setFormData(prev => ({ ...prev, network }));
        if (formData.address) {
            validateAddress(formData.address, network);
        }
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.address || !formData.label) {
            toast({
                title: "Missing Fields",
                description: "Please fill in address and label",
                variant: "destructive"
            });
            return;
        }
        if (validationError) {
            toast({
                title: "Invalid Address",
                description: validationError,
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        try {
            await onSubmit({
                address: formData.address.trim(),
                label: formData.label.trim(),
                network: formData.network,
                is_default: formData.isDefault
            });
            // Reset form
            setFormData({
                address: '',
                label: '',
                network: 'solana',
                isDefault: false
            });
            setValidationError(null);
        }
        catch (error) {
            // Error is handled by parent component
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setFormData({
            address: '',
            label: '',
            network: 'solana',
            isDefault: false
        });
        setValidationError(null);
        onClose();
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Add Merchant Address" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "label", children: "Label" }), _jsx(Input, { id: "label", value: formData.label, onChange: (e) => setFormData(prev => ({ ...prev, label: e.target.value })), placeholder: "Main Wallet, Business Account, etc.", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "network", children: "Network" }), _jsxs(Select, { value: formData.network, onValueChange: handleNetworkChange, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "solana", children: "Solana" }), _jsx(SelectItem, { value: "ethereum", children: "Ethereum" }), _jsx(SelectItem, { value: "polygon", children: "Polygon" })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "address", children: "Wallet Address" }), _jsx(Input, { id: "address", value: formData.address, onChange: (e) => handleAddressChange(e.target.value), placeholder: formData.network === 'solana'
                                        ? 'e.g., 7xKXtg2CW87d97TXJSDpbD5jBkheTqA83TZRuJosgAsU'
                                        : 'e.g., 0x742d35Cc6634C0532925a3b8D4C9db96DfbF31d2', className: "font-mono text-sm", required: true }), validationError && (_jsxs(Alert, { variant: "destructive", className: "mt-2", children: [_jsx(AlertCircle, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: validationError })] }))] }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "isDefault", children: "Set as default address" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Use this address for new payments by default" })] }), _jsx(Switch, { id: "isDefault", checked: formData.isDefault, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, isDefault: checked })) })] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, className: "flex-1", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting || !!validationError, className: "flex-1", children: isSubmitting ? 'Adding...' : 'Add Address' })] })] })] }) }));
}
