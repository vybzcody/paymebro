import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { paymentsApi } from "@/lib/api/payments";
import { merchantAddressesApi } from "@/lib/api/merchant-addresses";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wallet } from "lucide-react";
export function CreatePaymentWithAddress({ isOpen, onClose, onPaymentCreated, userId, userWalletAddress }) {
    const { toast } = useToast();
    const [formData, setFormData] = useState({
        amount: '',
        label: '',
        message: '',
        memo: '',
        customerEmail: '',
        currency: 'USDC',
        merchantWallet: '', // Custom merchant wallet
        useCustomAddress: false
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [addresses, setAddresses] = useState([]);
    const [loadingAddresses, setLoadingAddresses] = useState(false);
    const [selectedAddressId, setSelectedAddressId] = useState('');
    const fetchAddresses = useCallback(async () => {
        try {
            setLoadingAddresses(true);
            const userAddresses = await merchantAddressesApi.getUserAddresses(userId);
            setAddresses(userAddresses);
            // Auto-select default address if available
            const defaultAddress = userAddresses.find(addr => addr.is_default && addr.network === 'solana');
            if (defaultAddress) {
                setSelectedAddressId(defaultAddress.id);
            }
        }
        catch (error) {
            console.error('Failed to fetch addresses:', error);
        }
        finally {
            setLoadingAddresses(false);
        }
    }, [userId]);
    useEffect(() => {
        if (isOpen && userId) {
            fetchAddresses();
        }
    }, [isOpen, userId, fetchAddresses]);
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.amount || !formData.label) {
            toast({
                title: "Missing Fields",
                description: "Please fill in amount and label",
                variant: "destructive"
            });
            return;
        }
        setIsSubmitting(true);
        try {
            // Determine merchant wallet address
            let merchantWallet = undefined;
            if (formData.useCustomAddress && formData.merchantWallet) {
                merchantWallet = formData.merchantWallet;
            }
            else if (selectedAddressId) {
                const selectedAddress = addresses.find(addr => addr.id === selectedAddressId);
                if (selectedAddress) {
                    merchantWallet = selectedAddress.address;
                }
            }
            else if (addresses.length === 0 && userWalletAddress) {
                // Use user's connected wallet address as fallback
                merchantWallet = userWalletAddress;
            }
            const paymentData = {
                amount: parseFloat(formData.amount),
                label: formData.label,
                message: formData.message || undefined,
                memo: formData.memo || undefined,
                customerEmail: formData.customerEmail || undefined,
                web3AuthUserId: userId,
                chain: 'solana',
                splToken: formData.currency === 'USDC' ? 'Gh9ZwEmdLJ8DscKNTkTqPbNwLNNBjuSzaG9Vp2KGtKJr' : undefined,
                merchantWallet
            };
            const result = await paymentsApi.createPayment(paymentData);
            toast({
                title: "Payment Created!",
                description: `Payment link generated for ${formData.amount} ${formData.currency}`,
            });
            onPaymentCreated(result);
            handleClose();
        }
        catch (error) {
            console.error('Failed to create payment:', error);
            toast({
                title: "Creation Failed",
                description: error instanceof Error ? error.message : "Failed to create payment",
                variant: "destructive"
            });
        }
        finally {
            setIsSubmitting(false);
        }
    };
    const handleClose = () => {
        setFormData({
            amount: '',
            label: '',
            message: '',
            memo: '',
            customerEmail: '',
            currency: 'USDC',
            merchantWallet: '',
            useCustomAddress: false
        });
        setSelectedAddressId('');
        onClose();
    };
    const formatAddress = (address) => {
        return `${address.slice(0, 6)}...${address.slice(-6)}`;
    };
    return (_jsx(Dialog, { open: isOpen, onOpenChange: handleClose, children: _jsxs(DialogContent, { className: "sm:max-w-md max-h-[90vh] overflow-y-auto", children: [_jsx(DialogHeader, { children: _jsx(DialogTitle, { children: "Create Payment" }) }), _jsxs("form", { onSubmit: handleSubmit, className: "space-y-4", children: [_jsxs("div", { className: "grid grid-cols-2 gap-4", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "amount", children: "Amount" }), _jsx(Input, { id: "amount", type: "number", step: "0.01", value: formData.amount, onChange: (e) => setFormData(prev => ({ ...prev, amount: e.target.value })), placeholder: "0.00", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "currency", children: "Currency" }), _jsxs(Select, { value: formData.currency, onValueChange: (value) => setFormData(prev => ({ ...prev, currency: value })), children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, {}) }), _jsxs(SelectContent, { children: [_jsx(SelectItem, { value: "USDC", children: "USDC" }), _jsx(SelectItem, { value: "SOL", children: "SOL" })] })] })] })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "label", children: "Payment Label" }), _jsx(Input, { id: "label", value: formData.label, onChange: (e) => setFormData(prev => ({ ...prev, label: e.target.value })), placeholder: "Product name or service description", required: true })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "message", children: "Message (optional)" }), _jsx(Textarea, { id: "message", value: formData.message, onChange: (e) => setFormData(prev => ({ ...prev, message: e.target.value })), placeholder: "Additional message for the customer", rows: 2 })] }), _jsxs("div", { children: [_jsx(Label, { htmlFor: "customerEmail", children: "Customer Email (optional)" }), _jsx(Input, { id: "customerEmail", type: "email", value: formData.customerEmail, onChange: (e) => setFormData(prev => ({ ...prev, customerEmail: e.target.value })), placeholder: "customer@example.com" })] }), _jsxs("div", { className: "space-y-3", children: [_jsx(Label, { children: "Receiving Address" }), _jsxs("div", { className: "flex items-center justify-between", children: [_jsxs("div", { children: [_jsx(Label, { htmlFor: "useCustomAddress", children: "Use custom address" }), _jsx("p", { className: "text-sm text-muted-foreground", children: "Override default address for this payment" })] }), _jsx(Switch, { id: "useCustomAddress", checked: formData.useCustomAddress, onCheckedChange: (checked) => setFormData(prev => ({ ...prev, useCustomAddress: checked })) })] }), formData.useCustomAddress ? (_jsxs("div", { children: [_jsx(Label, { htmlFor: "merchantWallet", children: "Custom Wallet Address" }), _jsx(Input, { id: "merchantWallet", value: formData.merchantWallet, onChange: (e) => setFormData(prev => ({ ...prev, merchantWallet: e.target.value })), placeholder: "Enter Solana wallet address", className: "font-mono text-sm" })] })) : (_jsxs("div", { children: [_jsx(Label, { htmlFor: "addressSelect", children: "Select Address" }), loadingAddresses ? (_jsx("div", { className: "p-3 border rounded-lg", children: _jsxs("div", { className: "animate-pulse flex items-center space-x-2", children: [_jsx("div", { className: "h-4 w-4 bg-gray-200 rounded" }), _jsx("div", { className: "h-4 bg-gray-200 rounded w-32" })] }) })) : addresses.length === 0 ? (_jsx("div", { className: "space-y-3", children: userWalletAddress ? (_jsxs(Alert, { children: [_jsx(Wallet, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: _jsxs("div", { className: "space-y-2", children: [_jsx("p", { children: "Using default address from your connected wallet:" }), _jsx("code", { className: "text-xs bg-gray-100 px-2 py-1 rounded font-mono", children: formatAddress(userWalletAddress) }), _jsx("p", { className: "text-xs text-muted-foreground", children: "You can add custom merchant addresses in settings." })] }) })] })) : (_jsxs(Alert, { children: [_jsx(Wallet, { className: "h-4 w-4" }), _jsx(AlertDescription, { children: "No merchant addresses configured. Add an address in settings or use a custom address." })] })) })) : (_jsxs(Select, { value: selectedAddressId, onValueChange: setSelectedAddressId, children: [_jsx(SelectTrigger, { children: _jsx(SelectValue, { placeholder: "Select receiving address" }) }), _jsx(SelectContent, { children: addresses
                                                        .filter(addr => addr.network === 'solana')
                                                        .map((address) => (_jsx(SelectItem, { value: address.id, children: _jsxs("div", { className: "flex items-center justify-between w-full", children: [_jsx("span", { children: address.label }), _jsx("span", { className: "text-xs text-muted-foreground ml-2 font-mono", children: formatAddress(address.address) }), address.is_default && (_jsx("span", { className: "text-xs bg-green-100 text-green-700 px-1 rounded ml-2", children: "Default" }))] }) }, address.id))) })] }))] }))] }), _jsxs("div", { className: "flex gap-2 pt-4", children: [_jsx(Button, { type: "button", variant: "outline", onClick: handleClose, className: "flex-1", children: "Cancel" }), _jsx(Button, { type: "submit", disabled: isSubmitting, className: "flex-1", children: isSubmitting ? 'Creating...' : 'Create Payment' })] })] })] }) }));
}
